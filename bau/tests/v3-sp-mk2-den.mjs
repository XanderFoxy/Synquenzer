// FP-DSP MK2 B.6 Nr. 11: 60 s silence after full drive (2 s, 4 voices, release long) through Stimmwelle / Rauschen / Sinus× /
// stored wave; each 1-s load window vs the first silent second (Node x86)
import {renderW, mkPatch} from './v3-mk2-node.mjs';
for (const [nm, o1, ns] of [['Stimmwelle', {w: 4, c1: 127}, []], ['Rauschen', {w: 6, c1: 127, c2: 127}, []], ['Sinusx', {w: 3, c1: 127}, []], ['Speicher 61', {w: 5, c2: 120}, [61]]]) {
  const ev = []; for (const n of [36, 48, 60, 72]) { ev.push([0, 'on', n, 1]); ev.push([2, 'off', n]); }
  const r = renderW(mkPatch({o1, mix: {o1: 127, o2: 127, n: 127}, f: {type: 0, cut: 127, res: 127}, a: {dist: 1}, e2: {a: 0, d: 64, s: 127, r: 127}}), ev, {sec: 64, quantumMs: true}, ns);
  const per = 375, w = []; for (let s = 0; s < 64; s++) w.push(r.qms.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  // the release (r 127 = 16 s) ends: find the first second whose output is all zero
  let first = -1; for (let s = 2; s < 64; s++) { let z = true; for (let i = s * 48000; i < (s + 1) * 48000; i++) if (r.l[i] !== 0) { z = false; break; } if (z) { first = s; break; } }
  const base = first >= 0 ? w[first] : NaN, rest = first >= 0 ? w.slice(first + 1) : [];
  // and the tail of the release (decaying to tiny values): windows 4 ... first-1 relative to window 3
  const tail = first > 4 ? Math.max(...w.slice(4, first)) / w[3] : NaN;
  console.log(nm.padEnd(12), 'silent from s', first, ' max window / first silent', (Math.max(...rest) / base).toFixed(2), ' (base', base.toFixed(2), 'ms) release tail max/early', tail.toFixed(2));
}
