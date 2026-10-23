// Confirm what routing/store primitives pixiv actually exposes today, and where
// the React store can be found (premiumView.findStore depends on #__next).
import { launch, Session, sleep } from './cdp.mjs';

const br = await launch({ port: 9490 + Math.floor(Math.random() * 30) });
const s = await Session.connect(br.port);
await s.send('Runtime.enable');
await s.send('Page.enable');

await s.send('Page.navigate', { url: 'https://www.pixiv.net/tags/' + encodeURIComponent('初音ミク') });
await sleep(9000);

const out = await s.eval(`(() => {
  const r = {};
  r.hasNext = !!window.next;
  r.nextKeys = window.next ? Object.keys(window.next).slice(0, 20) : [];
  r.nextRouter = !!(window.next && window.next.router);
  r.routerType = window.next && window.next.router ? typeof window.next.router + ':' + (window.next.router.constructor && window.next.router.constructor.name) : null;
  r.nextRouterKeys = window.next && window.next.router ? Object.keys(window.next.router).slice(0, 20) : [];
  r.now$ = Object.keys(window).filter(k => /^(\\$|now)$/.test(k));
  r.hasHistoryRouter = !!(window.history && window.history.pushState);
  r.nextVersion = window.__NEXT_DATA__ ? (window.__NEXT_DATA__.buildId || 'present') : 'NONE(__NEXT_DATA__ absent = app router)';
  const roots = [...document.querySelectorAll('body > div, body > nextjs-portal, body > *')].slice(0, 15).map(el => el.tagName + '#' + el.id + '.' + el.className);
  r.bodyChildren = roots;
  // Any element carrying a reactContainer key (store search seed)?
  const withFiber = [...document.querySelectorAll('*')].filter(el => Object.keys(el).some(k => k.startsWith('__reactContainer$'))).map(el => el.tagName + '#' + el.id);
  r.containerHosts = withFiber.slice(0, 10);
  const withFiberAny = [...document.querySelectorAll('*')].filter(el => Object.keys(el).some(k => k.startsWith('__reactFiber$'))).length;
  r.fiberHostCount = withFiberAny;
  r.reduxGlobals = Object.keys(window).filter(k => /store|redux|dispatch/i.test(k)).slice(0, 20);
  r.dataLayer = window.dataLayer ? window.dataLayer[0] : null;
  return r;
})()`);
console.log(JSON.stringify(out, null, 2));

s.close();
br.proc.kill();
process.exit(0);
