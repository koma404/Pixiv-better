// Full popular-order flow with the userscript injected at document-start.
// Reports boot state, the engine it builds, and what /ajax/search responses it serves.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');
const WORD = process.argv[2] || '初音ミク';

const br = await launch({ port: 9396 + Math.floor(Math.random() * 30) });
const s = await Session.connect(br.port);

const exceptions = [];
const warns = [];
const ajax = [];
await s.send('Runtime.enable');
await s.send('Page.enable');
await s.send('Network.enable');
s.on('Runtime.exceptionThrown', (p) => {
    exceptions.push(`${p.exceptionDetails.text} ${(p.exceptionDetails.exception?.description || '').split('\n')[0]}`);
});
s.on('Runtime.consoleAPICalled', (p) => {
    const text = p.args.map((a) => a.value ?? a.description ?? '').join(' ');
    if (p.type === 'error' || p.type === 'warning') warns.push(`[${p.type}] ${text.slice(0, 300)}`);
});
s.on('Network.requestWillBeSent', (p) => {
    if (p.request.url.includes('/ajax/')) ajax.push({ id: p.requestId, url: p.request.url, status: null, n: null });
});
s.on('Network.responseReceived', (p) => {
    const e = ajax.find((r) => r.id === p.requestId);
    if (e) e.status = p.response.status;
});

// Inject at document-start, exactly as @run-at document-start requests.
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });

const url = `https://www.pixiv.net/tags/${encodeURIComponent(WORD)}/artworks?order=popular_d`;
await s.send('Page.navigate', { url });
await sleep(30000);

const state = await s.eval(`({
  installed: !!window.__pixivSortInstalled,
  flag: document.documentElement && document.documentElement.getAttribute('data-pixiv-sort'),
  href: location.href,
  fetchPatched: String(window.fetch).startsWith('function patchedFetch'),
  grid: document.querySelectorAll('a[href*="/artworks/"]').length,
  badge: !!document.querySelector('[data-pixiv-sort], #pixiv-sort-badge-style'),
})`);
console.log('=== STATE ===');
console.log(JSON.stringify(state, null, 2));

const ids = await s.eval(`(() => {
  const seen = []; const set = new Set();
  for (const a of document.querySelectorAll('a[href*="/artworks/"]')) {
    const m = /\\/artworks\\/(\\d+)/.exec(a.getAttribute('href') || '');
    if (m && !set.has(m[1])) { set.add(m[1]); seen.push(m[1]); }
  }
  return seen;
})()`);
console.log(`=== GRID IDS (${ids.length}) ===`);
console.log(ids.join(','));

const pop = ajax.filter((r) => /order=popular_d/.test(r.url));
console.log(`=== /ajax/search order=popular_d requests: ${pop.length} ===`);
console.log(pop.slice(0, 6).map((r) => `${r.status} p=${/p=(\d+)/.exec(r.url)?.[1]} ${r.url.slice(0, 150)}`).join('\n'));

console.log('=== EXCEPTIONS ===');
console.log(JSON.stringify([...new Set(exceptions)].slice(0, 8), null, 2));
console.log('=== WARNINGS ===');
console.log(JSON.stringify([...new Set(warns)].slice(0, 10), null, 2));

s.close();
br.proc.kill();
process.exit(0);
