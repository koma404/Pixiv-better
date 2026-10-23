// Does the script's own guard work when documentElement is null?
// Replicates exactly what the userscript does at document-start, and what
// Tampermonkey's document-start actually guarantees.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');

const br = await launch({ port: 9390 });
const s = await Session.connect(br.port);

await s.send('Runtime.enable');
await s.send('Page.enable');

// Observe what document.documentElement is at the true document-start moment,
// i.e. what Page.addScriptToEvaluateOnNewDocument gives us (same as document-start).
await s.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__probe = { atStart: document.documentElement === null, ready: document.readyState,
        hasHead: !!document.head, childNodes: document.documentElement ? document.documentElement.tagName : null };
      // Now run the real script exactly as a document-start userscript would.
      try { (${script})(); window.__probe.ran = true; }
      catch (e) { window.__probe.error = e.message; }`,
});

await s.send('Page.navigate', { url: 'https://www.pixiv.net/' });
await sleep(1500);
const probe = await s.eval('window.__probe');
console.log('=== document-start reality ===');
console.log(JSON.stringify(probe, null, 2));

const after = await s.eval(`({
  installed: !!window.__pixivSortInstalled,
  flag: document.documentElement.getAttribute('data-pixiv-sort'),
  hookInstalled: !!(window.fetch && window.fetch.toString().includes('patchedFetch')),
})`);
console.log('=== after ===');
console.log(JSON.stringify(after, null, 2));

s.close();
br.proc.kill();
process.exit(0);
