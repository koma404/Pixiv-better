// Determine whether the pageWorld crash is a timing artifact of our injection
// method (running at document-start, before <html> exists) rather than a script bug.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');

async function run(label, injectFn) {
    const br = await launch({ port: 9340 + Math.floor(Math.random() * 40) });
    const s = await Session.connect(br.port);
    const logs = [];
    await s.send('Runtime.enable');
    await s.send('Page.enable');
    s.on('Runtime.exceptionThrown', (p) => {
        logs.push(`${p.exceptionDetails.text} ${(p.exceptionDetails.exception?.description || '').split('\n')[0]}`);
    });
    s.on('Runtime.consoleAPICalled', (p) => {
        if (p.type === 'error' || p.type === 'warning') {
            logs.push(`[${p.type}] ${p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200)}`);
        }
    });
    await injectFn(s);
    await s.send('Page.navigate', { url: 'https://www.pixiv.net/' });
    await sleep(5000);
    const state = await s.eval(`({
      installed: !!window.__pixivSortInstalled,
      flag: document.documentElement && document.documentElement.getAttribute('data-pixiv-sort'),
    })`);
    console.log(`=== ${label} ===`);
    console.log('state:', JSON.stringify(state));
    console.log('crashes:', logs.filter((l) => /setAttribute/.test(l)).length);
    console.log('all logs:', JSON.stringify(logs.slice(0, 6), null, 2));
    s.close();
    br.proc.kill();
}

// A: our harness runs the script at document-start (documentElement === null).
await run('A: injected at document-start', async (s) => {
    await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });
});

// B: injected once the DOM root exists (mimics a userscript manager's default
// document-idle / document-end documentElement availability).
await run('B: injected after documentElement exists', async (s) => {
    await s.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `(function(){
          const run = () => { ${script} };
          if (document.documentElement) run();
          else new MutationObserver((m, o) => {
            if (document.documentElement) { o.disconnect(); run(); }
          }).observe(document, { childList: true, subtree: true });
        })();`,
    });
});

process.exit(0);
