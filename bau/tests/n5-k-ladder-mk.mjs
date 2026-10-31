// K1-04 (AM engine): filter at RESONANCE 127 / self-oscillation, CUTOFF turned fast (mkSet fractions every 10 ms), all 4
// types, DIST on/off, 4 voices: no NaN/Inf, no dropout window, no runaway
import {render as mkr, mkPatch} from './v3-mk1-node.mjs';
import {FILE, maxAbs} from './n5-k-lib.mjs';
const sr = 48000; let n = 0; const fails = []; let peak = 0, nan = 0;
for (const type of [0, 1, 2, 3]) for (const dist of [0, 1]) for (const mix of [0, 1]) {
  const pm = mkPatch({f: {type, cut: 64, res: 127, eg: 63, kbd: 63, vel: 0}, a: {dist, lvl: 127}, mix: {o1: 127, o2: mix ? 127 : 0, n: mix ? 127 : 0}, o2: {w: 0, mod: mix ? 1 : 0, semi: 7, tune: 10},
    l1: {w: 0, f: 127}, p: [{s: 2, d: 4, i: 63}, {s: 3, d: 4, i: -63}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]});
  const at = []; for (let t = .05; t < 1.75; t += .01) at.push([t, {mkSet: {'t.0.f.cut': 63.5 + 63.5 * Math.sin(t * 2 * Math.PI * 4), 't.0.f.res': 100 + 27 * Math.abs(Math.sin(t * 31))}}]);
  const r = mkr(pm, [[0, 'on', 36, 1], [.01, 'on', 48, 1], [.02, 'on', 60, 1], [.03, 'on', 84, 1], [1.8, 'off', 36], [1.8, 'off', 48], [1.8, 'off', 60], [1.8, 'off', 84]], {sec: 2, at, file: FILE});
  const m = maxAbs(r.l); let inf = 0; for (const x of r.l) if (!isFinite(x) && x === x) inf++;
  const W = 128, e = []; for (let i = Math.round(.1 * sr); i + W < Math.round(1.7 * sr); i += W) { let s = 0; for (let j = 0; j < W; j++) s += r.l[i + j] ** 2; e.push(Math.sqrt(s / W)); }
  let drop = 0; for (let i = 2; i < e.length - 2; i++) { const nb = Math.min(e[i - 2], e[i + 2]); if (nb > 1e-3 && e[i] < nb / 100) drop++; }
  n++; peak = Math.max(peak, m.m); nan += m.nan + inf; if (drop || m.nan || inf || m.m > 4) fails.push({type, dist, mix, drop, nan: m.nan, inf, peak: +m.m.toFixed(2)});
}
console.log(JSON.stringify({cases: n, peak: +peak.toFixed(2), nanInf: nan, fails, pass: !fails.length}));
