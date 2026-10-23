// Load pb.user.js into a real Chrome page on pixiv and report console + network.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');
const TARGET = process.argv[2] || 'https://www.pixiv.net/';

const br = await launch({ port: 9333 });
const s = await Session.connect(br.port);

const logs = [];
const requests = [];

await s.send('Runtime.enable');
await s.send('Page.enable');
await s.send('Network.enable');

s.on('Runtime.consoleAPICalled', (p) => {
    const text = p.args.map((a) => a.value ?? a.description ?? a.type).join(' ');
    logs.push({ type: p.type, text });
});
s.on('Runtime.exceptionThrown', (p) => {
    const d = p.exceptionDetails;
    logs.push({ type: 'exception', text: `${d.text} ${d.exception?.description || ''}` });
});
s.on('Network.requestWillBeSent', (p) => {
    if (/pixiv\.net\/ajax/.test(p.request.url)) requests.push({ phase: 'req', url: p.request.url, t: p.timestamp });
});
s.on('Network.responseReceived', (p) => {
    if (/pixiv\.net\/ajax/.test(p.response.url)) {
        requests.push({ phase: 'res', url: p.response.url, status: p.response.status, t: p.timestamp, type: p.type });
    }
});
s.on('Network.loadingFailed', (p) => {
    requests.push({ phase: 'fail', id: p.requestId, error: p.errorText });
});

// Inject the userscript before any page script runs.
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });
await s.send('Page.navigate', { url: TARGET });
await sleep(8000);

const info = await s.eval(`(() => {
  const title = document.title;
  const url = location.href;
  // pixiv renders its grid in sections with aria-label in several languages.
  const anchors = [...document.querySelectorAll('a[href*="/artworks/"], a[href*="/artwork/"]')]
    .map(a => ({ href: new URL(a.href, location.href).pathname, text: a.textContent.trim().slice(0, 40) }))
    .filter((v, i, arr) => arr.findIndex(x => x.href === v.href) === i);
  return {
    title, url,
    anchors: anchors.slice(0, 40),
    anchorCount: anchors.length,
    bodyLen: document.body ? document.body.innerText.length : 0,
    snippet: document.body ? document.body.innerText.slice(0, 400) : '',
    hasPremiumDialog: /プレミアム|premium/i.test(document.body ? document.body.innerText : ''),
  };
})()`);

console.log('=== PAGE ===');
console.log(JSON.stringify(info, null, 2));
console.log('=== LOGS ===');
for (const l of logs) console.log(`[${l.type}] ${l.text.slice(0, 300)}`);
console.log('=== AJAX REQUESTS ===');
for (const r of requests) console.log(`${r.phase} ${r.status ?? ''} ${r.error ?? ''} ${r.url}`);
console.log(`=== COUNTS: ajax req=${requests.filter(r=>r.phase==='req').length} res=${requests.filter(r=>r.phase==='res').length} fail=${requests.filter(r=>r.phase==='fail').length}`);

s.close();
br.proc.kill();
process.exit(0);
