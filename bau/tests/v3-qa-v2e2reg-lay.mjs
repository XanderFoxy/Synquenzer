// QA regression (V2d): main-screen layout P1 P2 P3 L1 L2 W — base (V2c-fix) vs new; overlaps, clipping, off-screen
import { open, NEW as APP, BASE, OUT } from './v3-qa-v2e2reg-pw.mjs';
import fs from 'fs';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const states = ['play', 'transpose', 'song'];
const measure = () => {
  const out = {}, vw = innerWidth, vh = innerHeight;
  const els = [...document.querySelectorAll('button, .slot, .chip, .chipT, [role=button], #lcd, .lcd, input, select')];
  const vis = [];
  for (const e of els) {
    const cs = getComputedStyle(e); if (cs.visibility !== 'visible' || cs.display === 'none') continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    let p = e, hid = false; while (p) { const c = getComputedStyle(p); if (c.display === 'none' || +c.opacity === 0) { hid = true; break; } p = p.parentElement; } if (hid) continue;
    if (e.closest('.toast, #toast, .pop, #menu:not(.open)')) continue;
    const key = (e.id ? '#' + e.id : e.tagName + '.' + [...e.classList].join('.')) + '|' + (e.textContent || '').trim().slice(0, 14).replace(/\s+/g, ' ');
    let k = key, n = 1; while (out[k]) k = key + '~' + (++n);
    const clip = (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') || e.scrollHeight > e.clientHeight + 2;
    out[k] = {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), off: r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1, clip};
    vis.push([k, r]);
  }
  const ov = [];
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
    const [ka, a] = vis[i], [kb, b] = vis[j];
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 2 && iy > 2) { const ea = document.querySelector(ka.split('|')[0].startsWith('#') ? ka.split('|')[0] : 'x-none'); ov.push(ka + ' X ' + kb + ' ' + Math.round(ix) + 'x' + Math.round(iy)); }
  }
  return {els: out, ov};
};
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  res[name] = {};
  for (const [id, w, h] of VPS) for (const st of states) {
    const {b, p, errs} = await open({width: w, height: h}, file, true);
    await p.evaluate(async st => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240);
      if (st === 'transpose') Q.setKbMode('transpose');
      if (st === 'song') { Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView(true); }
      Q.launchScene(0); }, st);
    await p.waitForTimeout(1500);
    // let FANG TEIL light: a clip change after the scene start, no note for a while
    if (st !== 'song') { await p.evaluate(() => window.SYNQUENZER.launchClip(1, 1)); await p.waitForTimeout(1500); }
    const m = await p.evaluate(measure);
    m.fang = await p.evaluate(() => { const b = document.getElementById(innerWidth > innerHeight ? 'bFangT' : 'bFang'); return {t: b.textContent, vis: getComputedStyle(b).visibility, sw: b.scrollWidth, cw: b.clientWidth, sh: b.scrollHeight, ch: b.clientHeight}; });
    m.errs = errs.slice();
    if (name === 'new') await p.screenshot({path: OUT + `lay-${id}-${st}.png`});
    res[name][id + '-' + st] = m;
    await b.close();
  }
}
fs.writeFileSync(OUT + 'lay.json', JSON.stringify(res));
for (const k of Object.keys(res.new)) {
  const A = res.base[k], B = res.new[k];
  const moved = [], added = [], gone = [], newClip = [], newOff = [];
  for (const e of Object.keys(B.els)) { const x = B.els[e], y = A.els[e]; if (!y) { added.push(e); continue; } if (Math.abs(x.x - y.x) > 1 || Math.abs(x.y - y.y) > 1 || Math.abs(x.w - y.w) > 1 || Math.abs(x.h - y.h) > 1) moved.push(e + ' ' + JSON.stringify([y.x, y.y, y.w, y.h]) + '→' + JSON.stringify([x.x, x.y, x.w, x.h])); if (x.clip && !y.clip) newClip.push(e); if (x.off && !y.off) newOff.push(e); }
  for (const e of Object.keys(A.els)) if (!B.els[e]) gone.push(e);
  const newOv = B.ov.filter(o => !A.ov.includes(o));
  console.log('==', k, 'errs', JSON.stringify(B.errs), 'fang', JSON.stringify(B.fang), 'base fang', JSON.stringify(A.fang));
  if (moved.length) console.log('  moved', moved.slice(0, 12));
  if (added.length) console.log('  added', added.slice(0, 12));
  if (gone.length) console.log('  gone', gone.slice(0, 12));
  if (newClip.length) console.log('  newClip', newClip);
  if (newOff.length) console.log('  newOff', newOff);
  if (newOv.length) console.log('  newOverlap', newOv.slice(0, 12));
}
