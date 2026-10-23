// Is the 429 pixiv-wide for this IP, or specific to our fresh profile's headers?
// Fetches /ajax/search/... from inside a real pixiv page context and reports status.
import fs from 'node:fs';
import { launch, Session, sleep } from './cdp.mjs';

const script = fs.readFileSync(new URL('../pb.user.js', import.meta.url), 'utf8');
const br = await launch({ port: 9395 });
const s = await Session.connect(br.port);

await s.send('Runtime.enable');
await s.send('Page.enable');
await s.send('Page.navigate', { url: 'https://www.pixiv.net/' });
await sleep(4000);

// Native fetch, no userscript interference: does plain AJAX work at all?
const probe1 = await s.eval(`(async () => {
  const out = {};
  const urls = {
    tagSearch: '/ajax/search/tags/' + encodeURIComponent('初音ミク') + '?lang=zh',
    illustrations: '/ajax/search/artworks/' + encodeURIComponent('初音ミク') + '?word=' + encodeURIComponent('初音ミク') + '&order=date_d&mode=all&p=1&s_mode=s_tag&lang=zh',
    popPreview: '/ajax/search/artworks/' + encodeURIComponent('初音ミク') + '?word=' + encodeURIComponent('初音ミク') + '&order=date_d&mode=all&p=1&s_mode=s_tag&lang=zh&scd=&ecd=',
  };
  for (const [name, u] of Object.entries(urls)) {
    try {
      const r = await fetch(u);
      let detail = null;
      if (!r.ok) detail = (await r.text()).slice(0, 160);
      let count = null;
      if (r.ok) { const j = await r.json(); count = j?.body?.illustManga?.data?.length ?? null; }
      out[name] = { status: r.status, count, detail };
    } catch (e) { out[name] = { error: String(e).slice(0, 120) }; }
  }
  return out;
})()`);
console.log('=== RAW FETCH (no userscript) ===');
console.log(JSON.stringify(probe1, null, 2));

s.close();
br.proc.kill();
process.exit(0);
