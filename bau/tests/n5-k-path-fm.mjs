// K1-04 for FM6 (eng 1): detours over operator levels / ratios / algorithm / macros while notes sound vs straight to the end
import {va, INIT, diffDb, FILE} from './n5-k-lib.mjs';
const file = process.argv[2] || FILE, sr = 48000;
const op = (ol, coarse) => ({on: 1, fixed: 0, coarse, fine: 0, det: 0, ol, r: [99, 60, 40, 50], l: [99, 80, 70, 0], vs: 2, rs: 1});
const fm = (a, b, alg) => ({alg, fb: 3, trans: 0, ops: [op(99, 1), op(a, 2), op(b, 3), op(70, 1), op(60, 4), op(50, 1)]});
const notes = [[0, 'on', 48, .9], [.3, 'on', 55, .7], [1.2, 'off', 48], [1.4, 'off', 55], [4, 'on', 60, .8], [5.5, 'off', 60]];
const base = Object.assign({}, INIT, {eng: 1, ftype: 1, cutoff: 20000, res: 0, lq: 0, aA: .002, aD: .05, aS: 1, aR: .05, fmAmp: 0, analog: 0, spread: .15, level: 1});
let rnd = 9; const R = () => { rnd = (Math.imul(rnd, 1664525) + 1013904223) >>> 0; return rnd / 4294967296; };
const detour = [];
for (let t = .05; t < 1.6; t += .05) detour.push([t, R() < .5 ? {fm6: fm(Math.floor(R() * 99), Math.floor(R() * 99), 1 + Math.floor(R() * 32))} : {set: {fmBright: R() * 24 - 12, fmAtk: R() * 20 - 10, fmDec: R() * 20 - 10, cutoff: 200 + R() * 9000}}]);
const fin = [[1.7, {fm6: fm(80, 60, 5)}], [1.7, {set: {fmBright: 3, fmAtk: 0, fmDec: 0, cutoff: 20000}}]];
const A = va(base, notes, {sec: 6, at: detour.concat(fin), file, fm6: fm(70, 50, 1)}), B = va(base, notes, {sec: 6, at: fin, file});
console.log(JSON.stringify({fm: +diffDb(A.l, B.l, 4 * sr, 6 * sr).toFixed(1)}));
