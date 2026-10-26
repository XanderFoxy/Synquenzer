// MK2-01 Ring / Ring+Sync with Sinus x vs an independent reference of W-27: modulator taken from a render of OSC 2 alone
// (mod 0 = free, mod 2 = synced: "after Sync, before Ring"), carrier phase from the X-MOD 0 render (asin-free: from the sx tap L only)
import {render, mkPatch} from './v3-mk1-node.mjs';
const ev = [[0, 'on', 52, .8]];
let worst = 0, nan = 0, det = 0;
for (const [ring, sync] of [[1, 0], [3, 2]]) for (const [c1, w2, semi] of [[64, 0, 7], [127, 1, 12], [30, 2, -5], [100, 0, 19]]) {
  const base = {o1: {w: 3, c1}, o2: {w: w2, semi}, a: {gate: 1}};
  const mod = render(mkPatch({...base, o2: {w: w2, semi, mod: sync}, mix: {o1: 0, o2: 127}}), ev, {sec: .3, tap: 'mix'}).l;   // OSC 2 alone (after sync if any)
  const ph = render(mkPatch({...base, o2: {w: w2, semi, mod: ring}}), ev, {sec: .3, tap: 'sx'}).l;   // OSC 1 phase
  const A = render(mkPatch({...base, o2: {w: w2, semi, mod: ring}, mix: {o1: 127, o2: 0}}), ev, {sec: .3, tap: 'mix'}).l;
  const A2 = render(mkPatch({...base, o2: {w: w2, semi, mod: ring}, mix: {o1: 127, o2: 0}}), ev, {sec: .3, tap: 'mix'}).l;
  const B = render(mkPatch({...base, o2: {w: w2, semi, mod: ring}, mix: {o1: 0, o2: 127}}), ev, {sec: .3, tap: 'mix'}).l;
  let w = 0;
  for (let i = 0; i < A.length; i++) { const x = Math.sin(2 * Math.PI * ph[i] + 4 * c1 / 127 * mod[i]); w = Math.max(w, Math.abs(A[i] - x), Math.abs(B[i] - x * mod[i])); if (!isFinite(A[i]) || !isFinite(B[i])) nan++; if (A[i] !== A2[i]) det++; }
  console.log('mod', ring, 'c1', c1, 'w2', w2, 'semi', semi, 'max |d|', w.toExponential(2)); worst = Math.max(worst, w);
}
console.log('worst', worst.toExponential(2), 'NaN', nan, 'nondet', det);
