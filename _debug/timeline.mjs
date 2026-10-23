// Precise timeline: when is window.next.router ready vs when is order=popular_d dropped,
// and what does the Navigation Timing entry actually contain?
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');
const WORD = process.argv[2] || '初音ミク';

const br = await launch({ port: 9520 + Math.floor(Math.random() * 30) });
const s = await Session.connect(br.port);
await s.send('Runtime.enable');
await s.send('Page.enable');

// Watch from the very first script: track router readiness and URL changes forever.
await s.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__tl = { routerAt: null, hrefAt: [], navEntryAt: null };
      let lastHref = null;
      const tick = () => {
        const r = window.next && window.next.router;
        if (r && window.__tl.routerAt === null) {
          window.__tl.routerAt = Math.round(performance.now());
          window.__tl.navEntryAt = (() => { const e = performance.getEntriesByType('navigation')[0]; return e ? e.name : null; })();
        }
        if (location.href !== lastHref) {
          lastHref = location.href;
          window.__tl.hrefAt.push({ ms: Math.round(performance.now()), href: location.pathname + location.search });
        }
      };
      setInterval(tick, 20);
      tick();
    `,
});
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: script });

await s.send('Page.navigate', { url: `https://www.pixiv.net/tags/${encodeURIComponent(WORD)}/artworks?order=popular_d` });
await sleep(14000);

const tl = await s.eval('window.__tl');
console.log('=== TIMELINE ===');
console.log(JSON.stringify(tl, null, 2));

console.log('=== restoreInitialOrder decision ===');
const entry = tl.navEntryAt || '';
console.log(`initialHref (from NavTiming) = ${entry}`);
console.log(`contains order=popular_d     = ${/order=popular_d/.test(entry)}`);
console.log(`=> restoreInitialOrder ${/order=popular_d/.test(entry) ? 'PROCEEDS' : 'RETURNS EARLY (bug)'}`);

console.log('=== final ===');
console.log(JSON.stringify(await s.eval(`({ href: location.href, dlPremium: window.dataLayer && window.dataLayer[0] && window.dataLayer[0].premium })`), null, 2));

s.close();
br.proc.kill();
process.exit(0);
