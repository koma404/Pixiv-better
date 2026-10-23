// Measure when restoreInitialOrder's prerequisites appear, and whether it ever fires.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');
const WORD = process.argv[2] || '初音ミク';

const br = await launch({ port: 9450 + Math.floor(Math.random() * 30) });
const s = await Session.connect(br.port);

await s.send('Runtime.enable');
await s.send('Page.enable');
await s.send('Network.enable');

// Spy before the userscript so we see prerequisite timing with zero interference.
await s.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__t0 = performance.timeOrigin;
      window.__pre = [];
      const rec = (what) => window.__pre.push({ what, at: Math.round(performance.now()) });
      const timer = setInterval(() => {
        const next = window.next && window.next.router;
        const rootEl = document.getElementById('__next');
        const key = rootEl && Object.keys(rootEl).find((n) => n.startsWith('__reactContainer$'));
        rec('poll', { nextRouter: !!next, nextRoot: !!rootEl, reactContainer: !!key, href: location.pathname + location.search, dl: !!(window.dataLayer && window.dataLayer[0]) });
      }, 50);
      setTimeout(() => clearInterval(timer), 8000);
    `,
});
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });

const url = `https://www.pixiv.net/tags/${encodeURIComponent(WORD)}/artworks?order=popular_d`;
await s.send('Page.navigate', { url });
await sleep(11000);

const setEvt = await s.eval(`(() => ({
  navigationEntry: (() => { const e = performance.getEntriesByType('navigation')[0]; return e && e.name; })(),
  href: location.href,
  hrefs: (() => { const out = []; for (let i = 0; i < history.length; i++) {} return out; })(),
}))()`);
console.log('=== NAV ENTRY vs CURRENT ===');
console.log(JSON.stringify(setEvt, null, 2));

const pre = await s.eval('window.__pre');
const polls = pre.filter((p) => p.what === 'poll').map((p) => p.at);
const firstNext = pre.find((p) => p.what === 'poll' && p.nextRouter);
const firstRoot = pre.find((p) => p.what === 'poll' && p.nextRoot);
const firstReact = pre.find((p) => p.what === 'poll' && p.reactContainer);
console.log(`=== PREREQ TIMING ===
first poll ms=${polls[0]}
window.next.router ready at ms=${firstNext ? firstNext.at : 'NEVER'}
#__next in DOM at ms=${firstRoot ? firstRoot.at : 'NEVER'}
reactContainer on #__next at ms=${firstReact ? firstReact.at : 'NEVER'}`);

const hrefs = [...new Set(pre.filter((p) => p.what === 'poll').map((p) => p.href))];
console.log('=== DISTINCT HREFS OVER TIME ===');
console.log(hrefs.slice(0, 6).join('\n'));

s.close();
br.proc.kill();
process.exit(0);
