// QA regression MK4: MS 2000 panel, every EDIT-WAHL 1 / 2 position (and SHIFT layer 2 where it exists), base 4.10.0 vs MK4:
// element boxes inside the panel must be unchanged except EDIT-WAHL 2 positions 5-7; overlaps / clipping / off-screen for all
import { chromium } from 'playwright';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'synq-snapshots/MK2.html', APP = S + 'mk-br-MK4/index.html', OUT = S + 'dirigent-test/v3-qa-mk4reg/';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const measure = () => {
  const out = {}, vw = innerWidth, vh = innerHeight, root = document.querySelector('#synthSheet') || document.body;
  const els = [...root.querySelectorAll('button, .mkx, [role=button], .knob, canvas, .lcd, input, select')];
  const vis = [];
  for (const e of els) {
    const cs = getComputedStyle(e); if (cs.visibility !== 'visible' || cs.display === 'none') continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    let p = e, hid = false; while (p) { const c = getComputedStyle(p); if (c.display === 'none' || +c.opacity === 0) { hid = true; break; } p = p.parentElement; } if (hid) continue;
    const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy); const covered = !!(top && !e.contains(top) && !top.contains(e));
    const key = (e.id ? '#' + e.id : e.tagName + '.' + [...e.classList].filter(c => !/^(on|lit|dark|sel|act|hot)$/.test(c)).join('.')) + (e.dataset && e.dataset.k ? '[' + e.dataset.k + ']' : '');
    let k = key, n = 1; while (out[k]) k = key + '~' + (++n);
    const clip = (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') || e.scrollHeight > e.clientHeight + 2;
    out[k] = {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), t: (e.textContent || '').trim().slice(0, 16), off: r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1, clip, covered};
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
  for (const [id, w, h] of VPS) {
    const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: id !== 'W', isMobile: id !== 'W', deviceScaleFactor: 1});
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
    await p.waitForTimeout(400);
    await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 900)); });
    const n1 = await p.evaluate(() => window.MKUI.SEC1.length), n2 = await p.evaluate(() => window.MKUI.SEC2.length);
    const halves = await p.evaluate(() => { const i = window.SYNQUENZER.mkPanel(); return i && /halb/.test(i.fmt) ? ['A', 'B'] : ['-']; });
    for (const hv of halves) for (const [wv, n] of [[1, n1], [2, n2]]) for (let pos = 0; pos < n; pos++) for (const sh of [0, 1]) {
      const st = await p.evaluate(({wv, pos, sh, hv}) => { const M = window.MKUI; if (hv !== '-') M.setHalf(hv); M.setWahl(wv, pos); if (sh) { const sec = wv === 1 ? M.SEC1[pos] : null; if (!sec || !sec[3]) return 'noshift'; M.P.shift = 1; M.render(); } return 'ok'; }, {wv, pos, sh, hv});
      if (st === 'noshift') continue;
      await p.waitForTimeout(60);
      const m = await p.evaluate(measure); m.info = await p.evaluate(() => { const i = window.SYNQUENZER.mkPanel(); return i ? {fmt: i.fmt, half: i.half, knobs: i.knobs, matrix: i.matrix} : null; });
      res[name][id + '|' + hv + '|w' + wv + 'p' + pos + (sh ? 's' : '')] = m;
      if (name === 'new' && wv === 2 && pos >= 4 && pos <= 6 && !sh) await p.screenshot({path: `${OUT}panel-${id}-${hv}-w2p${pos}.png`});
    }
    res[name][id + '|errs'] = errs.slice();
    await ctx.close();
  }
}
fs.writeFileSync(OUT + 'panel.json', JSON.stringify(res));
let nDiff = 0;
for (const k of Object.keys(res.new)) {
  if (k.endsWith('|errs')) { if (res.new[k].length) console.log('ERRS', k, res.new[k]); continue; }
  const A = res.base[k], B = res.new[k]; if (!A) { console.log('no base', k); continue; }
  const moved = [], added = [], gone = [], newClip = [], newOff = [];
  for (const e of Object.keys(B.els)) { const x = B.els[e], y = A.els[e]; if (!y) { added.push(e + '"' + x.t + '"'); continue; } if (Math.abs(x.x - y.x) > 1 || Math.abs(x.y - y.y) > 1 || Math.abs(x.w - y.w) > 1 || Math.abs(x.h - y.h) > 1) moved.push(e + ' ' + JSON.stringify([y.x, y.y, y.w, y.h]) + '→' + JSON.stringify([x.x, x.y, x.w, x.h])); if (x.clip && !x.covered) newClip.push(e + '"' + x.t + '"' + (y.clip ? '(base too)' : '')); if (x.off && !y.off && !x.covered) newOff.push(e); }
  for (const e of Object.keys(A.els)) if (!B.els[e]) gone.push(e);
  const newOv = B.ov.filter(o => !A.ov.includes(o));
  const kn = JSON.stringify(A.info && A.info.knobs) === JSON.stringify(B.info && B.info.knobs) ? '' : ' knobs ' + JSON.stringify(A.info && A.info.knobs) + ' → ' + JSON.stringify(B.info && B.info.knobs);
  const doc = B.docW > B.vw || B.docH > B.vh ? ' DOC ' + B.docW + 'x' + B.docH : '';
  if (moved.length || added.length || gone.length || newClip.length || newOff.length || newOv.length || kn || doc) {
    nDiff++; console.log('==', k, doc, kn);
    if (moved.length) console.log('  moved', moved.length, moved.slice(0, 8));
    if (added.length) console.log('  added', added.slice(0, 8));
    if (gone.length) console.log('  gone', gone.slice(0, 8));
    if (newClip.length) console.log('  clip', newClip.slice(0, 8));
    if (newOff.length) console.log('  off', newOff.slice(0, 8));
    if (newOv.length) console.log('  overlap', newOv.slice(0, 8));
  }
}
console.log('states', Object.keys(res.new).length, 'with differences', nDiff);
await br.close();
