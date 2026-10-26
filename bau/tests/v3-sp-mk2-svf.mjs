// FP-DSP MK2 Teil F: filter stability W-29 (C1 127 / C2 127 at C8, 20 s) and other corners; denormals B.6 Nr. 11 (60 s of
// silence after full drive through each new filter path, every 1-s load window <= 1.1 x the first silent second; Node x86).
import {renderW, render, mkPatch} from './v3-mk2-node.mjs';
const db = x => (20 * Math.log10(Math.max(1e-15, x))).toFixed(1);
for (const [note, c1, c2, tap] of [[108, 127, 127, null], [108, 127, 127, 'mix'], [127, 127, 127, null], [0, 0, 127, null], [0, 0, 127, 'mix'], [24, 0, 127, null], [108, 127, 0, null], [60, 64, 127, null]]) {
  const r = render(mkPatch({o1: {w: 6, c1, c2}, mix: {o1: 127, o2: 0, n: 0}, f: {type: 0, cut: 127, res: 127}, a: {gate: 1}}), [[0, 'on', note, 1]], {sec: 20, tap: tap || undefined});
  let pk = 0, bad = 0, e = 0; for (let i = 0; i < r.l.length; i++) { const a = r.l[i]; if (!isFinite(a) || !isFinite(r.r[i])) bad++; else { pk = Math.max(pk, Math.abs(a), Math.abs(r.r[i])); e += a * a; } }
  console.log('W-29 note', note, 'C1', c1, 'C2', c2, tap ? '(osc tap)' : '(out, Res 127)', ': NaN/Inf', bad, ' peak', db(pk), 'dBFS  rms', db(Math.sqrt(e / r.l.length)), 'dBFS');
}
