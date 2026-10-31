// BM6-02 Layout: Synth-Kopf mit fünftem Engine-Knopf (bzw. Chip) in allen Formaten; misst Überlauf, Trefferflächen ≥ 44, Namensfeld ≥ 72.
// Aufruf: node bm6-shots.mjs <index.html> [ausgabe-ordner]
import {createRequire} from 'module'; import fs from 'fs';
const {chromium} = createRequire(import.meta.url)('playwright');
const FILE = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const OUT = process.argv[3] || new URL('./bm6-shots/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
const F = [[390, 844], [428, 926], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const b = await chromium.launch(); const res = []; let bad = 0; const pvEd = {};   // pvEd: name field of an edited VA sound (A/B shown) = the base's own width
for (const [w, h] of F) for (const eng of (process.env.ENGS || 'analog,analog*,bm').split(',')) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await p.waitForTimeout(400);
  const r = await p.evaluate(async eng => {
    const t = synthTracks()[0]; SYNQUENZER.selectTrack(t); if (eng === 'analog*') SYNQUENZER.setParam(t, 'cutoff', 3000); else if (eng !== 'analog') SYNQUENZER.setEngine(t, eng); SYNQUENZER.openEditor();
    await new Promise(r => setTimeout(r, 500));
    const hd = document.querySelector('#synthSheet .sh-head'), seg = hd.querySelector('.seg.eng');
    const keys = [...seg.querySelectorAll('button')].map(x => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x, '::before'); const bt = parseFloat(cs.top) || 0, bb = parseFloat(cs.bottom) || 0;
      return {t: x.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), hitH: Math.round(r.height - bt - bb), over: x.scrollWidth > x.clientWidth + 1}; });
    const pv = hd.querySelector('.preset .pv'), tt = hd.querySelector('.sh-title');
    return {chip: seg.classList.contains('engchip'), keys, pv: pv ? Math.round(pv.getBoundingClientRect().width) : null, hdOver: hd.scrollWidth > hd.clientWidth + 1,
      title: tt ? Math.round(tt.getBoundingClientRect().width) : null, page: document.documentElement.scrollWidth > window.innerWidth + 1,
      tabs: [...document.querySelectorAll('#synthSheet .sh-tabs button, #synthSheet .stab')].map(x => x.textContent.trim()).slice(0, 8)};
  }, eng);
  await p.screenshot({path: OUT + `${w}x${h}-${eng}.png`});
  if (eng === 'analog*') pvEd[w + 'x' + h] = r.pv;
  const ok = !r.hdOver && !r.page && r.keys.every(k => !k.over && (r.chip || k.w >= 36)) && (r.pv == null || r.pv >= Math.min(72, pvEd[w + 'x' + h] || 72)) && !errs.length && (r.chip || r.keys.length === 5) && (eng !== 'bm' || r.chip || r.keys[4].t === 'Bit Mask');
  if (!ok) bad++;
  res.push({fmt: `${w}x${h}`, eng, ok, ...r, errs});
  await p.close();
}
console.log(JSON.stringify(res.map(x => ({fmt: x.fmt, eng: x.eng, ok: x.ok, chip: x.chip, keys: x.keys.map(k => k.t + ':' + k.w + 'x' + k.hitH).join(' '), pv: x.pv, title: x.title, hdOver: x.hdOver, tabs: x.tabs.join('|'), errs: x.errs})), null, 1));
console.log(bad ? 'FEHLER ' + bad : 'OK alle Formate');
await b.close();
