// PINSEL test helpers: Chromium with touch (CDP), the app, a known clip in the roll
import {chromium} from 'playwright';
import {fileURLToPath} from 'url';
import path from 'path';
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.APP || path.resolve(HERE, '..', 'index.html');
export const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
export const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; return !!c; };
export const failed = () => fails;
export async function open(w = 428, h = 926, o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: o.dpr || 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PE ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 30000});
  await p.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(p);
  const E = (f, a) => p.evaluate(f, a);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const down = (x, y, id = 1) => send('touchStart', [{x, y, id}]);
  const move = (x, y, id = 1) => send('touchMove', [{x, y, id}]);
  const up = () => send('touchEnd', []);
  const tap = async (x, y, w2 = 150) => { await down(x, y); await sleep(40); await up(); await sleep(w2); };
  // a stroke through points [[x, y], …], n steps between two points
  const stroke = async (pts, n = 6, ms = 16) => {
    await down(pts[0][0], pts[0][1]); await sleep(ms);
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; for (let k = 1; k <= n; k++) { await move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await sleep(ms); } }
    await up(); await sleep(120);
  };
  const tapBtn = async (sel, txt) => {
    await E(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));   // the bar is laid out (a shown/hidden button shifts it)
    const r = await E(([s, t]) => { const e = [...document.querySelectorAll(s)].find(b => b.offsetWidth && (t == null || b.textContent.trim() === t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'center'}); const q = e.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2}; }, [sel, txt]);
    if (!r) throw new Error('Knopf fehlt: ' + sel + ' ' + txt);
    await sleep(60); await tap(r.x, r.y); return r;
  };
  return {b, ctx, p, errs, cdp, E, down, move, up, tap, stroke, tapBtn};
}
// a run in C major (key set by hand: src 'user', never re-detected), 1 bar of 1/16 or the given notes
export const RUN = [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60, 62];
export async function clipRoll(H, notes, o = {}) {
  const ns = notes || RUN.map((n, i) => ({t: i * .25, d: .25, n, v: .8}));
  await H.E(([ns, o]) => { const D = window.SYNQUENZER; D.closeRoll(); D.setClip(0, 0, {len: o.len || 1, key: {root: o.root || 0, scale: o.scale || 'ionian', src: 'user'}, notes: ns}); D.openRoll(0, 0); }, [ns, o]);
  await sleep(500);
  await H.E(() => { const r = window.SYNQUENZER.rollApi(); r.setGrid('1/16'); r.fitView('clip'); r.centerOn(66); });
  await sleep(200);
}
export const notes = H => H.E(() => window.SYNQUENZER.getClip(0, 0).notes.map(n => ({t: n.t, d: n.d, n: n.n, v: n.v})));
export const xy = (H, beat, note) => H.E(([b, n]) => window.SYNQUENZER.rollApi()._xy(b, n), [beat, note]);
export const C_MAJ = [0, 2, 4, 5, 7, 9, 11];
export const inC = n => C_MAJ.includes(((n % 12) + 12) % 12);
export async function done(H, name) {
  const e = H.errs.filter(x => !/AudioContext|autoplay/i.test(x));
  ok(!e.length, name + ': keine Konsolenfehler' + (e.length ? ' ' + JSON.stringify(e.slice(0, 3)) : ''));
  await H.b.close();
}
