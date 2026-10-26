// FP-DSP MK2: folded energy (B.6 Nr. 12) for Stimmwelle and all 64 stored waves at C7, plus a pitch sweep 84-108 for the stored
// waves (info), measured at the oscillator (tap mix) and with the filter open.
import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {folded} from './v3-sp-mk2-ana.mjs';
const OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}, SR = 48000, mtof = n => 440 * 2 ** ((n - 69) / 12);
const R = n => [1, 2, 1.49831][[3, 34, 35].includes(n) ? 1 : [28, 59].includes(n) ? 2 : 0];
const fv = [0, 64, 127].map(c1 => [folded(renderW(mkPatch(Object.assign({o1: {w: 4, c1}}, OPEN)), [[0, 'on', 96, .8]], {sec: 1.2, tap: 'mix'}, []).l, 9600, mtof(96), SR), folded(renderW(mkPatch(Object.assign({o1: {w: 4, c1}}, OPEN)), [[0, 'on', 96, .8]], {sec: 1.2}, []).l, 9600, mtof(96), SR)]);
console.log('Stimmwelle C7 folded (osc / out) FORM 0/64/127:', fv.map(x => x.map(y => y.toFixed(1)).join('/')).join('  '));
let wO = -999, wn = 0, wF = -999, wfn = 0; const over = [];
for (let n = 1; n <= 64; n++) {
  const p = mkPatch(Object.assign({o1: {w: 5, c2: 2 * (n - 1)}}, OPEN));
  const a = folded(renderW(p, [[0, 'on', 96, .8]], {sec: 1.2, tap: 'mix'}, [n]).l, 9600, mtof(96) / R(n), SR);
  const b = folded(renderW(p, [[0, 'on', 96, .8]], {sec: 1.2}, [n]).l, 9600, mtof(96) / R(n), SR);
  if (a > wO) { wO = a; wn = n; } if (b > wF) { wF = b; wfn = n; } if (a > -50 || b > -50) over.push(n + ':' + a.toFixed(1) + '/' + b.toFixed(1));
}
console.log('Speicherwellen C7 folded: worst at osc', wO.toFixed(1), 'dB (wave', wn + '), worst out', wF.toFixed(1), 'dB (wave', wfn + '); over -50 (osc/out):', over.join(' ') || 'none');
// sweep: notes 84 ... 108 in semitones at the oscillator, waves 27, 31, 23, 61, 35
for (const n of [27, 31, 17, 61, 35]) { const row = []; for (let nt = 84; nt <= 108; nt += 2) row.push(nt + ':' + folded(renderW(mkPatch(Object.assign({o1: {w: 5, c2: 2 * (n - 1)}}, OPEN)), [[0, 'on', nt, .8]], {sec: 1.2, tap: 'mix'}, [n]).l, 9600, mtof(nt) / R(n), SR).toFixed(0)); console.log('wave', n, 'osc folded by note:', row.join(' ')); }
{ const row = []; for (let nt = 84; nt <= 108; nt += 2) row.push(nt + ':' + folded(renderW(mkPatch(Object.assign({o1: {w: 4, c1: 64}}, OPEN)), [[0, 'on', nt, .8]], {sec: 1.2, tap: 'mix'}, []).l, 9600, mtof(nt), SR).toFixed(0)); console.log('Stimmwelle F64 osc folded by note:', row.join(' ')); }
