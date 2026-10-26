// QA regression MK2: layout P1 P2 P3 L1 L2 W — base 4.9.0 (mk-base-A) vs new 4.10.0; overlaps, clipping, off-screen
import { chromium } from 'playwright';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'mk-base-A.html', APP = S + 'mk-wt/index.html', OUT = S + 'dirigent-test/v3-qa-mk2reg/';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const states = (process.env.STATES || 'play,transpose,song,edVA,edFM,edDrum,edMK,menu').split(',');
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const measure = () => {
  const out = {}, vw = innerWidth, vh = innerHeight;
  const els = [...document.querySelectorAll('button, .slot, .chip, .chipT, [role=button], #lcd, .lcd, input, select, .mkx')];
  const vis = [];
  for (const e of els) {
    const cs = getComputedStyle(e); if (cs.visibility !== 'visible' || cs.display === 'none') continue;
    if (e.type === 'file') continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    let p = e, hid = false; while (p) { const c = getComputedStyle(p); if (c.display === 'none' || +c.opacity === 0) { hid = true; break; } p = p.parentElement; } if (hid) continue;
    if (e.closest('.toast, #toast')) continue;
    // hidden behind a covering sheet? test the centre point
    const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy); const covered = !!(top && !e.contains(top) && !top.contains(e));
    const key = (e.id ? '#' + e.id : e.tagName + '.' + [...e.classList].join('.')) + (e.dataset && e.dataset.k ? '[' + e.dataset.k + ']' : '') + '|' + (e.textContent || '').trim().slice(0, 14).replace(/\s+/g, ' ');
    let k = key, n = 1; while (out[k]) k = key + '~' + (++n);
    const clip = (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') || e.scrollHeight > e.clientHeight + 2;
    out[k] = {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), off: r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1, clip, covered};
    if (!covered) vis.push([k, r, e]);
  }
  const ov = [];
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
    const [ka, a, ea] = vis[i], [kb, b, eb] = vis[j];
    if (ea.contains(eb) || eb.contains(ea)) continue;
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 2 && iy > 2) ov.push(ka + ' X ' + kb + ' ' + Math.round(ix) + 'x' + Math.round(iy));
  }
  return {els: out, ov, docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight, vw, vh};
};
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  res[name] = {};
  for (const [id, w, h] of VPS) for (const st of states) {
    const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: id !== 'W', isMobile: id !== 'W', deviceScaleFactor: 1});
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
    await p.waitForTimeout(500);
    try {
      await p.evaluate(async st => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240);
        if (st === 'transpose') Q.setKbMode('transpose');
        if (st === 'song') { Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView(true); }
        Q.launchScene(0); }, st);
      await p.waitForTimeout(1200);
      if (['play', 'transpose'].includes(st)) { await p.evaluate(() => window.SYNQUENZER.launchClip(1, 1)); await p.waitForTimeout(1500); }
      if (st === 'edVA') { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'analog'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(700); }
      if (st === 'edFM') { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'fm'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(700); }
      if (st === 'edDrum') { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(4); Q.openEditor(); }); await p.waitForTimeout(700); }
      if (st === 'edMK') { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(900); }
      if (st === 'menu') { await p.evaluate(() => window.SYNQUENZER.openMenu()); await p.waitForTimeout(600); }
      const m = await p.evaluate(measure);
      m.editor = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
      m.errs = errs.slice();
      await p.screenshot({path: `${OUT}lay-${name}-${id}-${st}.png`});
      res[name][id + '-' + st] = m;
    } catch (e) { res[name][id + '-' + st] = {fail: String(e), errs, els: {}, ov: []}; }
    await ctx.close();
  }
}
fs.writeFileSync(OUT + 'lay.json', JSON.stringify(res));
for (const k of Object.keys(res.new)) {
  const A = res.base[k], B = res.new[k];
  const moved = [], added = [], gone = [], newClip = [], newOff = [];
  for (const e of Object.keys(B.els)) { const x = B.els[e], y = A.els[e]; if (!y) { added.push(e); continue; } if (Math.abs(x.x - y.x) > 1 || Math.abs(x.y - y.y) > 1 || Math.abs(x.w - y.w) > 1 || Math.abs(x.h - y.h) > 1) moved.push(e + ' ' + JSON.stringify([y.x, y.y, y.w, y.h]) + '→' + JSON.stringify([x.x, x.y, x.w, x.h])); if (x.clip && !y.clip && !x.covered) newClip.push(e); if (x.off && !y.off && !x.covered) newOff.push(e); }
  for (const e of Object.keys(A.els)) if (!B.els[e]) gone.push(e);
  const newOv = B.ov.filter(o => !A.ov.includes(o));
  console.log('==', k, B.fail || '', 'ed', B.editor, 'errs', JSON.stringify(B.errs), 'doc', B.docW + 'x' + B.docH, '/', B.vw + 'x' + B.vh, 'base doc', A.docW + 'x' + A.docH);
  if (moved.length) console.log('  moved', moved.length, moved.slice(0, 12));
  if (added.length) console.log('  added', added.length, added.slice(0, 12));
  if (gone.length) console.log('  gone', gone.length, gone.slice(0, 12));
  if (newClip.length) console.log('  newClip', newClip);
  if (newOff.length) console.log('  newOff', newOff);
  if (newOv.length) console.log('  newOverlap', newOv.slice(0, 12));
}
await br.close();
