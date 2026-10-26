// repro: STEUER 2 drag (key held, filter open) from wave 59 into 61 (octave wave, not built yet) vs. after the wave list was opened once
import {open, sleep, OUT, check, done} from './v3-qa-gmk2a-tl.mjs';
import {recStart} from './v3-qa-gmk2a-rec.mjs';
const PRE = process.argv[2] === 'pre', FROM = +(process.argv[3] || 59), NOTE = +(process.argv[4] || 12);
const T = await open(); const {p, E, errs} = T;
await E(([c2]) => { const Q = SYNQUENZER; Q.setMetronome(false); Q.setEngine(0, 'mk'); for (const [k, v] of Object.entries({'t.0.f.cut': 127, 't.0.f.res': 0, 't.0.e2.a': 0, 't.0.e2.s': 127, 't.0.e2.r': 40, 't.0.o1.w': 5, 't.0.o1.c2': c2, 't.0.a.lvl': 100})) Q.mkSet(0, k, v); }, [2 * FROM - 2]);
await T.openEd(0); await T.w('w1', /^3 OSZ 1/);
if (PRE) { await T.tapMk('k2', 800); await T.closePop(); }
await sleep(3000);
console.log('built before', JSON.stringify(await E(() => SYNQUENZER.mkInfo())));
await recStart(E, 30, [0]);
await E(() => { window.__wl = []; let last = -1; window.__wli = setInterval(() => { const m = SYNQUENZER.mkGet(0); const k = m.t[0].o1.c2; if (k !== last) { last = k; window.__wl.push([+AU.ctx.currentTime.toFixed(3), Math.floor(k / 2) + 1, SYNQUENZER.mkInfo().built]); } }, 4); });
const kA = await T.key(NOTE); const keyPt = {x: kA.cx, y: kA.cy, id: 90};
await T.send('touchStart', [keyPt]); await sleep(1000);
const r0 = await T.mk('k2'); await T.send('touchStart', [{x: r0.cx, y: r0.cy, id: 92}]);
for (let s = 1; s <= 40; s++) { await T.send('touchMove', [{x: r0.cx, y: r0.cy - s * 0.5 - 4, id: 92}]); await sleep(40); }
await T.send('touchEnd', [{x: r0.cx, y: r0.cy - 24, id: 92}]); await sleep(1200);
await T.send('touchEnd', [keyPt]); await sleep(500);
const WL = await E(() => window.__wl);
const r = await E(() => {
  const Q = window.__q, sr = Q.sr, x = Q.bufs[1].subarray(0, Q.n), t0 = Q.f0 / sr;
  const note = SYNQUENZER.noteLog(50).filter(n => n.track === 0).pop(); const f0 = 440 * Math.pow(2, (note.out - 69) / 12), W = Math.round(sr / f0);
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 5000, .5412), 5000, 1.3066); const e = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(10 * Math.log10(s / W + 1e-20)); }
  const med = a => { const b = a.slice().sort((p, q) => p - q); return b[b.length >> 1]; };
  const ts = note.time, te = note.time + 3; const fl = [];
  for (let k = 12; k < e.length - 12; k++) { const t = t0 + k * W / sr; if (t < ts + .05 || t > te) continue; const ref = Math.max(med(e.slice(k - 11, k - 1)), med(e.slice(k + 2, k + 12))); if (e[k] > ref + 6 && e[k] > -80) fl.push([+t.toFixed(4), +(e[k] - ref).toFixed(1), +e[k].toFixed(1)]); }
  // HF level per period around the flags
  return {f0: +f0.toFixed(1), W, fl, trace: e.map((v, k) => [+(t0 + k * W / sr).toFixed(3), +v.toFixed(1)]).filter(([t]) => t > ts + .9 && t < ts + 2.6)};
});
console.log('wave trace', JSON.stringify(WL));
console.log('flags', JSON.stringify(r.fl));
const near = r.fl.length ? r.trace.filter(([t]) => Math.abs(t - r.fl[0][0]) < .06) : [];
console.log('HF per period around first flag', JSON.stringify(near));
check((PRE ? 'after list pre-build: ' : 'cold: ') + 'drag ' + FROM + ' → ' + (FROM + 3) + ' (key held): no wave-switch spike > 6 dB over the louder steady state', r.fl.length === 0, r.fl);
await T.br.close(); done();
