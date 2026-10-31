// VC2a-05 Abnahme: großes Projekt (8 Spuren x 8 Szenen voll, Song 64 Takte, 8 Teile) – Kosten je Geste, Abgleich, Keyframe; longtasks
import { launch, nCur, since } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true, init: () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }});
const build = await p.evaluate(async () => {
  const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  A.addTrack(); A.addTrack();
  for (let t = 0; t < NT(); t++) for (let s = 0; s < 8; s++) { if (t === DRUM_T) continue; const notes = []; for (let i = 0; i < 64; i++) notes.push({t: i * 0.25, d: 0.2, n: 48 + ((i * 7 + t * 3 + s) % 24), v: 0.5 + (i % 5) * 0.1}); A.setClip(t, s, {len: 4, notes}); }
  const chain = []; for (let i = 0; i < 16; i++) chain.push({scene: i % 8, bars: 4}); A.songFromChain(chain);
  for (let k = 1; k <= 8; k++) { try { A.setPart(k, {name: 'Teil ' + k}); } catch (e) {} }
  await sl(3000); await historyCheck();
  return {bytes: serializeProject().length, nt: NT(), ev: A.history()};
});
console.log('Projekt', JSON.stringify(build));
const r = await p.evaluate(async () => {
  const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  const T = {cap: [], sweep: [], kf: [], drain: []};
  const wrap = (n, arr) => { const f = window[n]; window[n] = function () { const a = performance.now(); const x = f.apply(this, arguments); arr.push(+(performance.now() - a).toFixed(2)); return x; }; };
  wrap('histCapture', T.cap); wrap('histSweep', T.sweep); wrap('histKeyframe', T.kf); wrap('histDrain', T.drain);
  window.__lt.length = 0; const t0 = performance.now();
  const kinds = {};
  const G = [
    ['clip', k => { const c = A.getClip(k % 4, k % 8); c.notes[k % 64].v = 0.3 + (k % 7) / 10; A.setClip(k % 4, k % 8, c); }],
    ['sound', k => { const s = A.getSound(k % 4); s.p.cutoff = 300 + k * 10; A.setSound(k % 4, s); }],
    ['song', k => songSetChord(k % 16, ['Am', 'F', 'C', 'G'][k % 4])],
    ['part', k => A.setPart(1 + (k % 8), {name: 'P' + k})],
    ['undo', k => A.undo()], ['redo', k => A.redo()],
  ];
  for (let k = 0; k < 60; k++) { const [nm, f] = G[k % G.length]; const c0 = T.cap.length; f(k); await sl(30); kinds[nm] = (kinds[nm] || []).concat(T.cap.slice(c0)); }
  await sl(2600);
  // forced keyframe + sweep on the big project
  histKeyframe('n'); S.bpm = S.bpm + 1; markDirty(); histSweep();
  const lt = window.__lt.filter(x => x[0] >= t0);
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
  const out = {}; for (const k in kinds) out[k] = {med: med(kinds[k]), max: Math.max(...kinds[k])};
  return {perKind: out, capMed: med(T.cap), capMax: Math.max(...T.cap), sweep: T.sweep, kf: T.kf, drainMax: Math.max(...T.drain), lt};
});
console.log(JSON.stringify(r, null, 0));
console.log('check', await p.evaluate(() => historyCheck()), 'errs', errs.slice(0, 3));
await b.close();
