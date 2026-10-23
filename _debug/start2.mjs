// Capture, at the exact moment the userscript runs, what document.documentElement was.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');

const br = await launch({ port: 9391 });
const s = await Session.connect(br.port);
const exceptions = [];
await s.send('Runtime.enable');
await s.send('Page.enable');
s.on('Runtime.exceptionThrown', (p) => {
    exceptions.push(`${p.exceptionDetails.text} :: ${(p.exceptionDetails.exception?.description || '').split('\n')[0]}`);
});

// Sample documentElement before running the script, inside the same new-document hook.
await s.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      // Snapshot at document-start, then hand off to the real script.
      window.__dshStart = {
        readyState: document.readyState,
        documentElementNull: document.documentElement === null,
        hasHead: !!document.head,
      };
    `,
});

// Second hook registered later runs after the snapshot in the same phase.
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });

await s.send('Page.navigate', { url: 'https://www.pixiv.net/' });
await sleep(3000);

const snap = await s.eval('JSON.stringify(window.__dshStart)');
console.log('=== document-start snapshot ===');
console.log(snap);
console.log('=== exceptions (first 4) ===');
console.log(JSON.stringify(exceptions.slice(0, 4), null, 2));

const state = await s.eval(`({
  installed: !!window.__pixivSortInstalled,
  flag: document.documentElement && document.documentElement.getAttribute('data-pixiv-sort'),
})`);
console.log('=== state ===');
console.log(JSON.stringify(state, null, 2));

s.close();
br.proc.kill();
process.exit(0);
