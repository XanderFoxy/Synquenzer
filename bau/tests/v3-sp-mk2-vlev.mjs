// FP-DSP / FP-KLANG MK2: level of the new waves over the whole key range (single voice, filter open, INIT otherwise)
import {renderW, mkPatch} from './v3-mk2-node.mjs';
const OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}};
const db = x => 20 * Math.log10(Math.max(1e-12, x));
function lev(o1, note, extra) { const r = renderW(mkPatch(Object.assign({o1}, OPEN, extra || {})), [[0, 'on', note, .8]], {sec: .5}, o1.w === 5 ? [Math.floor(o1.c2 / 2) + 1] : []);
  let e = 0, pk = 0; const a = 9600, b = r.l.length; for (let i = a; i < b; i++) { e += r.l[i] * r.l[i]; pk = Math.max(pk, Math.abs(r.l[i])); } return [db(Math.sqrt(e / (b - a))), db(pk)]; }
const notes = [24, 36, 48, 60, 72, 84, 96, 102, 108, 114, 120, 127];
for (const [nm, o1] of [['Saege', {w: 0}], ['Sinusx X0', {w: 3, c1: 0}], ['Stimme F0', {w: 4, c1: 0}], ['Stimme F64', {w: 4, c1: 64}], ['Stimme F127', {w: 4, c1: 127}], ['Speicher 23', {w: 5, c2: 44}], ['Speicher 61', {w: 5, c2: 120}], ['Rauschen C1 24', {w: 6, c1: 24}], ['Rauschen C1 24 R127', {w: 6, c1: 24, c2: 127}]])
  console.log(nm.padEnd(22), notes.map(n => { const [r, p] = lev(o1, n); return n + ':' + r.toFixed(1) + '/' + p.toFixed(1); }).join('  '));
