// K1-01: Osz 3 solo / im Mix gegen Osz 1/2: Pegel und Grundton je Oszillator solo, Wirkung von Osz-3-Aenderungen auf Osz 1/2
// (Mix minus Osz-3-solo = Osz 1/2 allein), und die Streuung im Mix bei gleicher Tonhoehe (Phasenlage je Note)
import {va, INIT, rms, db, mag, diffDb} from './n5-k-lib.mjs';
const sr = 48000, file = process.argv[2];
const R = (p, ev) => va(Object.assign({}, INIT, {analog: 0}, p), ev || [[0, 'on', 57, .8], [0.9, 'off', 57]], {sec: 1, file});
const S = r => rms(r.l, 9600, 38400), out = {solo: {}, f0: {}};
for (const [k, p] of [['o1', {o1lvl: 1}], ['o2', {o1lvl: 0, o2lvl: 1, o2fine: 0}], ['o3', {o1lvl: 0, o3lvl: 1, o3w: 0, o3oct: 0}]]) { const r = R(p); out.solo[k] = +db(S(r)).toFixed(2); out.f0[k] = +db(mag(r.l, 220, sr, 9600, 38400)).toFixed(2); }
// pitch of osc 3: semi +7 -> 329.6 Hz must carry the energy
{ const r = R({o1lvl: 0, o3lvl: 1, o3w: 3, o3oct: 0, o3semi: 7}); out.o3semi7 = {at329: +db(mag(r.l, 329.63, sr, 9600, 38400)).toFixed(1), at220: +db(mag(r.l, 220, sr, 9600, 38400)).toFixed(1)}; }
// level steps of Osz 3 (Anteil .25 / .5 / 1): dB like Osz 1
out.steps = {}; for (const lv of [.25, .5, 1]) { out.steps['o3_' + lv] = +db(S(R({o1lvl: 0, o3lvl: lv, o3w: 0, o3oct: 0}))).toFixed(2); out.steps['o1_' + lv] = +db(S(R({o1lvl: lv}))).toFixed(2); }
// Osz 3 changes do not touch Osz 1/2 (filter open, drive 0: linear): mix - o3 solo == o1+o2
out.residual = [];
for (const ch of [{o3w: 0, o3oct: 0, o3fine: 0}, {o3w: 1, o3oct: -1}, {o3w: 2, o3oct: 1, o3semi: 5}, {o3w: 3, o3oct: 0, o3uni: 5}]) {
  const base = {o1lvl: 1, o2lvl: .7, o2fine: 7}, m = R(Object.assign({}, base, ch, {o3lvl: .8})), s3 = R(Object.assign({}, base, ch, {o1lvl: 0, o2lvl: 0, o3lvl: .8})), o12 = R(base);
  const res = new Float32Array(m.l.length); for (let i = 0; i < res.length; i++) res[i] = m.l[i] - s3.l[i];
  out.residual.push(+diffDb(res, o12.l, 9600, 38400).toFixed(1));
}
// the same changes on Osz 2 (Osz 3 at .8 as the third): the shared ladder couples every oscillator the same way
out.residualOsc2 = [];
for (const ch of [{o2w: 0, o2oct: 0, o2fine: 0}, {o2w: 1, o2oct: -1}, {o2w: 2, o2oct: 1, o2semi: 5}, {o2w: 3, o2oct: 0, o2uni: 5}]) {
  const base = {o1lvl: 1, o3lvl: .7, o3w: 0, o3oct: 0, o3fine: 7, o2fine: 0}, m = R(Object.assign({}, base, ch, {o2lvl: .8})), s2 = R(Object.assign({}, base, ch, {o1lvl: 0, o3lvl: 0, o2lvl: .8})), o13 = R(base);
  const res = new Float32Array(m.l.length); for (let i = 0; i < res.length; i++) res[i] = m.l[i] - s2.l[i];
  out.residualOsc2.push(+diffDb(res, o13.l, 9600, 38400).toFixed(1));
}
// the same changes with the filter in the linear range (Klang-Pegel low: the ladder's tanh stages stay linear): no coupling
out.residualLinear = [];
for (const ch of [{o3w: 0, o3oct: 0, o3fine: 0}, {o3w: 1, o3oct: -1}, {o3w: 3, o3uni: 5}]) {
  const base = {o1lvl: .05, o2lvl: .035, o2fine: 7}, m = R(Object.assign({}, base, ch, {o3lvl: .04})), s3 = R(Object.assign({}, base, ch, {o1lvl: 0, o2lvl: 0, o3lvl: .04})), o12 = R(base);
  const res = new Float32Array(m.l.length); for (let i = 0; i < res.length; i++) res[i] = m.l[i] - s3.l[i];
  out.residualLinear.push(+diffDb(res, o12.l, 9600, 38400).toFixed(1));
}
// same pitch as Osz 1 (8', Fein 0): 16 notes with their random start phases -> level of Osz 1 + Osz 3 against Osz 1 alone
{ const ev = []; for (let k = 0; k < 16; k++) ev.push([k * .25, 'on', 57, .8, 'n' + k], [k * .25 + .2, 'off', 57, .8, 'n' + k]);
  const a = va(Object.assign({}, INIT, {analog: 0, aR: .005}), ev, {sec: 4.2, file}), b = va(Object.assign({}, INIT, {analog: 0, aR: .005, o3lvl: 1, o3w: 0, o3oct: 0}), ev, {sec: 4.2, file});
  const g = []; for (let k = 0; k < 16; k++) { const i0 = Math.round((k * .25 + .05) * sr), i1 = Math.round((k * .25 + .18) * sr); g.push(+(db(rms(b.l, i0, i1)) - db(rms(a.l, i0, i1))).toFixed(1)); }
  out.samePitchGainDb = {min: Math.min(...g), max: Math.max(...g), all: g};
}
out.pass = out.solo.o3 === out.solo.o1 && out.solo.o3 === out.solo.o2 && out.f0.o3 === out.f0.o1 && out.o3semi7.at329 > -20 && out.o3semi7.at220 < -100
  && ['0.25', '0.5', '1'].every(l => out.steps['o3_' + l] === out.steps['o1_' + l]) && Math.max(...out.residual) <= Math.max(...out.residualOsc2) + 1 && Math.max(...out.residualLinear) <= -60;
console.log(JSON.stringify(out));
