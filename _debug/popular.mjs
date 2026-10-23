// Reproduce on a real pixiv search page: inject pb.user.js, click pixiv's own
// "popular" control, and check whether the script's ranking is served.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');
const WORD = process.argv[2] || '初音ミク';
const URL0 = `https://www.pixiv.net/tags/${encodeURIComponent(WORD)}/artworks?order=popular_d`;

const br = await launch({ port: 9334 });
const s = await Session.connect(br.port);

const logs = [];
const ajax = [];

await s.send('Runtime.enable');
await s.send('Page.enable');
await s.send('Network.enable');
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });

s.on('Runtime.consoleAPICalled', (p) => {
    logs.push({ type: p.type, text: p.args.map((a) => a.value ?? a.description ?? a.type).join(' ') });
});
s.on('Runtime.exceptionThrown', (p) => {
    logs.push({ type: 'exception', text: `${p.exceptionDetails.text} ${p.exceptionDetails.exception?.description || ''}` });
});
s.on('Network.requestWillBeSent', (p) => {
    if (/\/ajax\/search/.test(p.request.url)) ajax.push({ p: 'req', url: p.request.url });
});
s.on('Network.responseReceived', (p) => {
    if (/\/ajax\/search/.test(p.response.url)) ajax.push({ p: 'res', status: p.response.status, url: p.response.url });
});

await s.send('Page.navigate', { url: URL0 });
await sleep(6000);

const before = await s.eval(`(() => {
  const html = document.documentElement;
  return {
    installed: !!window.__pixivSortInstalled,
    flag: html && html.getAttribute('data-pixiv-sort'),
    href: location.href,
    title: document.title,
    anchors: [...document.querySelectorAll('a[href*="/artworks/"]')].map(a => a.getAttribute('href')).slice(0, 10),
    bodyLen: document.body.innerText.length,
  };
})()`);
console.log('=== AFTER LOAD ===');
console.log(JSON.stringify(before, null, 2));

// Enumerate the controls that could be the "popular" chip / dropdown item.
const controls = await s.eval(`(() => {
  const out = [];
  for (const el of document.querySelectorAll('a, button, [role=button], [role=option], li')) {
    const txt = (el.innerText || el.textContent || '').trim();
    if (!txt) continue;
    out.push({ tag: el.tagName, text: txt.slice(0, 30), href: el.getAttribute && el.getAttribute('href'), cls: (el.className || '').toString().slice(0, 60) });
  }
  return out.slice(0, 60);
})()`);
console.log('=== CONTROLS ===');
console.log(JSON.stringify(controls, null, 2));

await sleep(4000);
const grid = await s.eval(`(() => {
  const ids = [...document.querySelectorAll('a[href*="/artworks/"]')]
    .map(a => a.getAttribute('href').match(/artworks\\/(\\d+)/)?.[1]).filter(Boolean);
  return [...new Set(ids)];
})()`);

console.log('=== GRID IDS (in DOM order, first 20) ===');
console.log(JSON.stringify(grid.slice(0, 20)));
console.log('gridCount =', grid.length);
console.log('=== LOGS ===');
for (const l of logs) console.log(`[${l.type}] ${l.text.slice(0, 400)}`);
console.log('=== AJAX ===');
for (const a of ajax) console.log(`${a.p} ${a.status ?? ''} ${decodeURIComponent(a.url).slice(0, 220)}`);

s.close();
br.proc.kill();
process.exit(0);
