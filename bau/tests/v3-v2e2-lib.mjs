// V2e′ test helpers: drag timelines by CDP touch, page-side clocks (open time, haptics), M-ANSICHT rects
import { openVp, mk, SETUP, STATES } from './v3-v2e-lib.mjs';
export { openVp, mk, SETUP, STATES };
export const sleep = ms => new Promise(r => setTimeout(r, ms));
// page-side: pointerdown time (first finger), song-open time (MutationObserver), haptic calls (navigator.vibrate)
export const PREP = () => {
  const W = window; W.__hap = []; W.__open = null; W.__down = null;
  try { Object.defineProperty(navigator, 'vibrate', {configurable: true, value: x => { W.__hap.push([performance.now(), x]); return true; }}); } catch (e) { navigator.vibrate = x => { W.__hap.push([performance.now(), x]); return true; }; }
  const ga = document.getElementById('gridArea');
  if (!W.__mo) { W.__mo = new MutationObserver(() => { const on = ga.classList.contains('song'); if (on && W.__open == null) W.__open = performance.now(); if (!on) W.__closed = performance.now(); }); W.__mo.observe(ga, {attributes: true, attributeFilter: ['class']}); }
  document.addEventListener('pointerdown', e => { if (W.__down == null) W.__down = performance.now(); }, true);
  return 1;
};
export const RESET = () => { window.__open = null; window.__down = null; window.__hap = []; window.__closed = null; return performance.now(); };
// rects of every control that must not move (M-ANSICHT)
export const RECTS = () => {
  const out = {}, r = e => { const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(v => Math.round(v * 10) / 10); };
  document.querySelectorAll('.sv-top > *').forEach((e, k) => { if (!e.hidden) out['top' + k + (e.className.match(/sv-\w+/g) || []).join('')] = r(e); });
  document.querySelectorAll('.sv-labs > *').forEach((e, k) => { out['lab' + k] = r(e); });
  for (const q of ['.sv-cv', '#strip', '#modebar', '#kbArea', '#carrier', '#side']) { const e = document.querySelector(q); if (e && e.offsetWidth) out[q] = r(e); }
  return out;
};
export function rectsSame(a, b, tol = 2) {
  const bad = [];
  for (const k of Object.keys(a)) { if (!b[k]) continue; if (a[k].some((v, j) => Math.abs(v - b[k][j]) > tol)) bad.push(k + ':' + a[k] + '→' + b[k]); }
  return bad;
}
export function mk2(p, cdp) {
  const T = mk(p, cdp), E = T.E;
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const down = (x, y) => send('touchStart', [{x, y, id: 1}]);
  const move = (x, y) => send('touchMove', [{x, y, id: 1}]);
  const up = () => send('touchEnd', []);
  const cancel = () => send('touchCancel', []);
  // glide from (x0,y0) to (x1,y1) in n steps, ms apart
  const glide = async (x0, y0, x1, y1, n = 6, ms = 16) => { for (let k = 1; k <= n; k++) { await move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await sleep(ms); } };
  const key = (j = 0) => E(j => { const k = document.querySelectorAll('#partBar .pk')[j]; const r = k.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, j);
  const corner = () => E(() => { const c = document.querySelector('.corner.sw'); if (!c || !c.offsetWidth) return null; const r = c.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, spring: c.classList.contains('spring'), txt: c.textContent}; });
  const songOn = () => E(() => document.getElementById('gridArea').classList.contains('song'));
  const page = () => E(() => ({open: window.__open, down: window.__down, hap: window.__hap.slice(), now: performance.now()}));
  const drag = () => E(() => window.SYNQUENZER.svLayoutInfo().drag);
  const full = () => E(() => { const pr = window.SYNQUENZER.project(); return JSON.stringify(pr.project || pr); });
  return Object.assign(T, {send, down, move, up, cancel, glide, key, corner, songOn, page, drag, full});
}
