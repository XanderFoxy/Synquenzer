// VV4-F Layout: gegen die Basis R-4261 verschiebt sich nichts (alle Rechtecke gleich), Namen werden nicht mehr gekürzt als vorher,
// die Balken liegen in ihrer Zelle, überdecken keinen Text und sind nicht höher als die Zelle. Matrix + Song, mehrere Größen.
import { open, OUT, SONG8, check, summary } from './lib.mjs';
import fs from 'fs'; import path from 'path';
const BASE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../snapshots/R-4261.html');
const SIZES = (process.env.SIZES || '428x926,926x428,390x844,844x390,375x667,667x375,320x568').split(',').map(s => s.split('x').map(Number));
const grab = () => {
  const sel = ['.th', '.th .nm', '.th .sb', '.th .fb', '.cnw', '.corner', '.szb', '.slot', '.scn', '.stp', '#kb', '#carrier', '#modebar', '.sv-l', '.sv-l > span:not(.mtr)', '.sv-lr', '.sv-lr .lbl', '.sv-top .rb', '.sv-cv'];
  const o = {};
  for (const s of sel) o[s] = [...document.querySelectorAll(s)].filter(e => e.offsetParent || e.id).map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); });
  const cut = [...document.querySelectorAll('.th .nm, .sv-l > span:not(.mtr), .sv-lr .lbl, .corner .swl')].filter(e => e.offsetParent).map(e => e.scrollWidth > e.clientWidth + .5 ? 1 : 0);
  return {o, cut, H: document.documentElement.scrollHeight};
};
// text glyph boxes vs meter boxes
const meters = () => {
  const bad = [], all = [];
  const txt = e => { if (!e || !e.firstChild || !e.offsetParent) return null; const R = document.createRange(); R.selectNodeContents(e); const r = R.getBoundingClientRect(); return r.width ? r : null; };
  const ov = (a, b) => a && b && a.left < b.right - .5 && b.left < a.right - .5 && a.top < b.bottom - .5 && b.top < a.bottom - .5;
  for (const m of document.querySelectorAll('.mtr')) {
    if (!m.offsetParent && !(m.parentNode && m.parentNode.offsetParent)) continue;
    const r = m.getBoundingClientRect(); if (!r.width) continue;
    const cell = m.closest('.th, .sv-l, .sv-lr, .cnw'); const c = cell.getBoundingClientRect();
    const texts = [...cell.querySelectorAll('.nm, .sb, .fb, span:not(.mtr):not(.mb), .lbl, .swl')].filter(e => !e.closest('.mtr')).map(txt).filter(Boolean);
    const inside = r.left >= c.left - .5 && r.right <= c.right + .5 && r.top >= c.top - .5 && r.bottom <= c.bottom + .5;
    const hit = texts.some(t => ov(r, t));
    all.push({cls: cell.className.split(' ')[0], w: r.width, h: r.height, inside, hit});
    if (!inside || hit) bad.push({cls: cell.className, r: [r.x, r.y, r.width, r.height].map(Math.round), inside, hit});
  }
  return {bad, n: all.length, w: [...new Set(all.map(a => a.w))]};
};
for (const [w, h] of SIZES) {
  const res = {};
  for (const [nm, app] of [['basis', BASE], ['neu', undefined]]) {
    const {b, p, errs} = await open({w, h, app});
    const m = await p.evaluate(grab);
    let mm = nm === 'neu' ? await p.evaluate(meters) : null;
    if (nm === 'neu' && (w === 428 || w === 926)) await p.screenshot({path: `${OUT}/layout-matrix-${w}x${h}.png`});
    await p.evaluate(s => SYNQUENZER.setSong(s), SONG8); await p.evaluate(() => setSongView(true)); await p.waitForTimeout(500);
    const s = await p.evaluate(grab); const sm = nm === 'neu' ? await p.evaluate(meters) : null;
    if (nm === 'neu' && (w === 428 || w === 926)) await p.screenshot({path: `${OUT}/layout-song-${w}x${h}.png`});
    res[nm] = {m, s, mm, sm, errs};
    await b.close();
  }
  const diff = (A, B) => { const d = []; for (const k of Object.keys(A.o)) if (JSON.stringify(A.o[k]) !== JSON.stringify(B.o[k])) d.push(k); if (A.H !== B.H) d.push('H'); return d; };
  const dm = diff(res.basis.m, res.neu.m), ds = diff(res.basis.s, res.neu.s);
  check(`${w}×${h} Matrix: nichts verschoben`, dm.length === 0, dm);
  check(`${w}×${h} Song: nichts verschoben`, ds.length === 0, ds);
  const cutM = res.neu.m.cut.filter((c, i) => c > (res.basis.m.cut[i] || 0)).length, cutS = res.neu.s.cut.filter((c, i) => c > (res.basis.s.cut[i] || 0)).length;
  check(`${w}×${h} Namen nicht stärker gekürzt als vorher`, cutM + cutS === 0, {cutM, cutS});
  check(`${w}×${h} Balken in der Zelle, über keinem Text (Matrix ${res.neu.mm.n}, Song ${res.neu.sm.n})`, res.neu.mm.bad.length + res.neu.sm.bad.length === 0 && res.neu.mm.n >= 5 && res.neu.sm.n >= 5, {m: res.neu.mm.bad, s: res.neu.sm.bad});
  check(`${w}×${h} keine Konsolenfehler`, res.neu.errs.length === 0, res.neu.errs);
}
fs.writeFileSync(`${OUT}/t-layout.json`, JSON.stringify(summary(), null, 1));
