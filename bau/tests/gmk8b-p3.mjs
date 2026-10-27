import {launch, open, tapSel, mkOk, sleep, DIR} from './gmk8b-h.mjs';
const br = await launch(false);
const FILE = process.argv[2];
const {ctx, page, errs} = await open(br, {fmt: process.env.FMT || 'P3', file: FILE});
await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); if (window.MKK) await MKK.decodeAll(); });
await page.evaluate(() => SYNQUENZER.openBrowser(0)); await sleep(400);
const cut = () => page.evaluate(() => { const o = []; const l = document.querySelector('#sndSheet .brlist'), lr = l.getBoundingClientRect(); for (const t of l.querySelectorAll('.brow .bmain *')) { const r = t.getBoundingClientRect(); if (r.bottom < lr.top || r.top > lr.bottom || !r.width) continue; if (t.scrollWidth > t.clientWidth + 1) o.push(t.tagName + ':' + t.textContent.trim() + ' (' + t.scrollWidth + '>' + t.clientWidth + ')'); } return o; });
console.log('MS 2000 role list (bank/factory rows):', JSON.stringify((await cut()).slice(0, 8)));
await page.screenshot({path: DIR + '/p3-' + (process.env.TAG || 'x') + '-roles.png'});
if (await page.$('#sndSheet .brkp')) {
  await tapSel(page, '#sndSheet .brkp'); await tapSel(page, '#sndSheet .brkg[data-g="2"]');
  console.log('Micro TECHNO:', JSON.stringify((await cut()).slice(0, 8)));
  await page.screenshot({path: DIR + '/p3-' + (process.env.TAG || 'x') + '-kompakt.png'});
}
console.log(errs);
await br.close();
