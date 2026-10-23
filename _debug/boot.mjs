// Why does pixiv drop order=popular_d? Trace the restore path and which
// /ajax/search URLs actually get requested while the script is installed.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');
const WORD = process.argv[2] || '初音ミク';

const br = await launch({ port: 9420 + Math.floor(Math.random() * 30) });
const s = await Session.connect(br.port);

const ajax = [];
await s.send('Runtime.enable');
await s.send('Page.enable');
await s.send('Network.enable');
s.on('Network.requestWillBeSent', (p) => {
    if (p.request.url.includes('/ajax/')) ajax.push({ id: p.requestId, url: p.request.url, status: null });
});
s.on('Network.responseReceived', (p) => {
    const e = ajax.find((r) => r.id === p.requestId);
    if (e) e.status = p.response.status;
});

await s.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      // Record history/router activity so we can see who rewrites the URL.
      window.__urlTrace = [];
      const snap = (why) => window.__urlTrace.push({ why, href: location.href, t: Date.now() });
      for (const name of ['pushState', 'replaceState']) {
        const orig = history[name];
        history[name] = function () { const r = orig.apply(this, arguments); snap(name + ':' + arguments[2]); return r; };
      }
      addEventListener('DOMContentLoaded', () => snap('DOMContentLoaded'));
    `,
});
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });

const url = `https://www.pixiv.net/tags/${encodeURIComponent(WORD)}/artworks?order=popular_d`;
await s.send('Page.navigate', { url });
await sleep(12000);

console.log('=== URL TRACE ===');
console.log(await s.eval('JSON.stringify(window.__urlTrace, null, 2)'));

const searches = ajax.filter((r) => r.url.includes('/ajax/search'));
console.log(`=== /ajax/search requests (${searches.length}) ===`);
for (const r of searches.slice(0, 20)) {
    const order = /order=([a-z_]+)/.exec(r.url)?.[1];
    const p = /[?&]p=(\d+)/.exec(r.url)?.[1];
    console.log(`${r.status} order=${order} p=${p} ${decodeURIComponent(r.url).slice(0, 130)}`);
}

console.log('=== href now ===');
console.log(await s.eval('location.href'));

s.close();
br.proc.kill();
process.exit(0);
