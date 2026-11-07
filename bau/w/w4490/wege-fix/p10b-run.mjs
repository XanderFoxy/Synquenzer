// WEGE-Test: Doppel aufräumen (Inventar D1, D2, D6, D7, D8, D9, D11–D14, Abschnitt 4/5) – per Finger (Touch), hochkant + quer
// Aufruf: node wege-test.mjs <index.html> <ausgabeordner>   (absolute Pfade; Basis zum Vergleich: <index.html>/../../basis.html)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = process.argv[2], out = process.argv[3];
const basis = process.argv[4];
let bad = 0, good = 0;
const ok = (c, m, d) => { if (c) { good++; console.log('OK ' + m + (d ? ' – ' + d : '')); } else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const b = await chromium.launch();
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(2200);
  p._cdp = await p.context().newCDPSession(p);
  return p;
}
const SETUP = () => {
  const D = window.SYNQUENZER;
  D.setBpm(112);
  D.setClip(0, 0, {len: 2, notes: [[0, .75, 36, .9], [1.5, .5, 43, .8], [3, 1, 39, .8], [4, 1.5, 36, .9], [6, .5, 46, .7]].map(([t, d, n, v]) => ({t, d, n, v}))});
  D.setClip(4, 0, {len: 1, notes: [[0, 36, .95], [1, 38, .9], [2.5, 36, .85], [3, 38, .9], [0, 49, .9], [2, 46, .7]].map(([t, n, v]) => ({t, d: .1, n, v})).concat([0, .25, .5, .75, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .1, n: 42, v: .6})))});
  D.setClip(2, 0, {len: 2, notes: [[0, 60], [0, 64], [0, 67], [4, 57], [4, 60], [4, 64]].map(([t, n]) => ({t, d: 3.5, n, v: .7}))});
  D.setClip(1, 0, {len: 2, notes: [[0, 72], [1, 74], [2, 76]].map(([t, n]) => ({t, d: .5, n, v: .7}))});
  D.setClip(3, 0, {len: 1, notes: [[0, 79], [2, 77]].map(([t, n]) => ({t, d: 1, n, v: .7}))});
  D.setClip(0, 1, {len: 1, notes: [[0, 1, 38, .9]].map(([t, d, n, v]) => ({t, d, n, v}))});
  D.setClip(4, 1, {len: 1, notes: [[0, 36, .95], [2, 38, .9]].map(([t, n, v]) => ({t, d: .1, n, v}))});
  D.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}]);
  D.songView(true);
  return S.song.marks.map(m => m.id);
};
// je Spur und Takt: wie viele Noten in [a, e) klingen (eigene Clips, Versionen, Szenen-Clips in ihrer Phase)
const NC = (a, e) => {
  const sg = S.song, o2 = [];
  for (let t = 0; t < NT(); t++) {
    const lane = sg.lanes[t]; if (!lane) continue;
    for (let x = a; x < e; x++) {
      const o = laneOriginAt(lane, x); if (!laneClipOk(sg, t, o)) { o2.push(0); continue; }
      const c = o.own ? sg.own[o.own] : S.tracks[t].clips[o.slot]; if (!c) { o2.push(0); continue; }
      const L = clipB(c), p0 = ((barBeat(x) - o.cs) % L + L) % L; let n = 0;
      for (const nt of c.notes) { if (nt.t >= L - 1e-9) continue; let d = nt.t - p0; if (d < -1e-9) d += L; if (d < 4 - 1e-9) n++; }
      o2.push(n);
    }
  }
  return o2;
};
const run = (p, fn, arg) => p.evaluate('(() => { const SETUP = ' + SETUP.toString() + ', NC = ' + NC.toString() + '; return (' + fn.toString() + ')(' + JSON.stringify(arg === undefined ? null : arg) + '); })()');
const sum = a => a.reduce((x, y) => x + y, 0);
// Finger: ein Element (per Funktion im Browser gefunden) antippen; liefert sein Rechteck (oder null)
async function tapAt(p, finder, arg) {
  const r = await p.evaluate('(() => { const e = (' + finder.toString() + ')(' + JSON.stringify(arg === undefined ? null : arg) + '); if (!e) return null; e.scrollIntoView({block: "nearest"}); const b = e.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, vis: b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < innerHeight}; })()');
  if (!r || !r.vis) return r;
  await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(260);
  return r;
}
const byText = (sel, txt) => [...document.querySelectorAll(sel)].find(x => x.offsetParent && x.textContent.replace(/\s+/g, ' ').trim().startsWith(txt));
async function touch(p, type, x, y) { await p._cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, radiusX: 4, radiusY: 4, force: 1, id: 1}]}); }
async function drag(p, x0, y0, x1, y1, n) { await touch(p, 'touchStart', x0, y0); for (let k = 1; k <= n; k++) { await touch(p, 'touchMove', x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await p.waitForTimeout(30); } await touch(p, 'touchEnd'); await p.waitForTimeout(250); }
async function hold(p, x, y, ms) { await touch(p, 'touchStart', x, y); await p.waitForTimeout(ms); await touch(p, 'touchEnd'); await p.waitForTimeout(250); }
const zone = () => { try { if (typeof hideToast === 'function') hideToast(); } catch (e) {} const r = SV.wrap.getBoundingClientRect(); let y = r.top + Math.round(SV.rulerH * .5); for (let d = Math.max(7, Math.round((SV.rulerH - SV.vvS) * .5)); d < SV.rulerH - 1; d++) { const e = document.elementFromPoint(r.left + 14, r.top + d); if (e === SV.cv) { y = r.top + d; break; } } return {x: r.left + 14, y, cw: SV.cellW, pos: SV.pos}; };
const shot = (p, n) => p.screenshot({path: path.join(out, n)});
const xSees = () => [...document.querySelectorAll('.pop .ms-x, .pop .sh-x, .pop [aria-label="Schließen"]')].some(x => { const r = x.getBoundingClientRect(); return x.offsetParent && r.width >= 40 && r.height >= 30 && r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth; });
const W = process.argv[2];
const R = {};
for (const [vw, vh] of [[428, 926], [926, 428]]) for (const vid of [false, true]) {
  const p = await page(vw, vh, W); const key = vw + (vid ? '-video' : '-ohne');
  await run(p, v => { SETUP(); if (v) window.SYNQUENZER.vvDirSet(0, 4, 'klav'); }, vid);
  await p.evaluate(() => { SV.x = 0; SV.pos = 2; svDraw(true); }); await p.waitForTimeout(400);
  const g = await p.evaluate(() => { const r = SV.wrap.getBoundingClientRect(); return {L: r.left, T: r.top, rulerH: SV.rulerH, vvS: SV.vvS | 0, blS: SV.blS | 0, xp: songStartBar() * SV.cellW - SV.x, cw: SV.cellW}; });
  // je y-Versatz: ▼ ziehen (Finger) – bewegt sich die Marke? (zurücksetzen nach jedem Versuch)
  const rows = [];
  for (let dy = 0; dy <= g.rulerH + 40; dy += 2) {
    await p.evaluate(() => { SV.pos = 2; SV.x = 0; svDraw(true); if (UI.pop) closePop(); });
    const X = g.L + g.xp + 4, Y = g.T + dy;
    await drag(p, X, Y, X + 3 * g.cw, Y, 8);
    const r = await p.evaluate(() => ({pos: SV.pos, cut: typeof vd3CutOn === 'function' ? vd3CutOn() : null, pop: UI.pop ? UI.pop.name : null, sel: SV.sel ? [SV.sel.a, SV.sel.b] : null}));
    rows.push(dy + ':' + (r.pos !== 2 ? 'POS' + r.pos : '-') + (r.cut ? ',cut' : '') + (r.pop ? ',' + r.pop : ''));
    if (r.cut) await p.evaluate(() => vd3CutSet(false));
  }
  R[key] = {g, rows: rows.join(' ')};
  await p.close();
}
console.log(JSON.stringify(R, null, 1));
await b.close();
