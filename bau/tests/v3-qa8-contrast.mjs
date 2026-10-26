import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch(); const {page: p} = await open(b, 'P1');
await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(2, 2); SYNQUENZER.mkSet(0, 't.0.f.cut', 30); await mkProg.write(2, 3, 'X'); document.querySelector('#synthSheet .sh-head .hb.sv').click(); });
await sleep(400);
const r = await p.evaluate(() => {
  const rgb = s => s.match(/[\d.]+/g).slice(0, 4).map(Number);
  const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const bgOf = e => { while (e) { const c = getComputedStyle(e).backgroundColor; const v = rgb(c); if (v[3] !== 0 && !(v.length === 4 && v[3] === 0)) return v; e = e.parentElement; } return [0, 0, 0]; };
  const cr = e => { const fg = rgb(getComputedStyle(e).color), bg = bgOf(e); const a = lum(fg), b = lum(bg); return +((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2); };
  const p = document.querySelector('.pop.mk8w'); const o = {};
  o.info = cr(p.querySelector('.mk8i')); o.h4 = cr(p.querySelector('h4')); o.slot = cr(p.querySelector('.mk8sl button')); o.on = cr(p.querySelector('.mk8sl button.on'));
  const own = p.querySelector('.mk8sl button.own'); if (own) { const fg = rgb(getComputedStyle(own, '::after').color), bg = bgOf(own); const a = lum(fg), b = lum(bg); o.ownDot = +((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2); o.ownDotSize = getComputedStyle(own, '::after').fontSize; }
  return o; });
console.log(JSON.stringify(r));
await b.close();
