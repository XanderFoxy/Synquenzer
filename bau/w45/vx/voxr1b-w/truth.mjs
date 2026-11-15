// Wahrheit für die eigenen Plopp-Funde in Take A: (1) Lage gegen die Annotation (Grundton, Noten-Einsätze), (2) Gegenprobe ohne < 70 Hz,
// (3) eingesetzte Stöße in der Gegenprobe = einzige Wahrheit
import fs from 'fs'; import {core, wav, RV, SRC, f0at} from './lib.mjs'; import {plops} from './synth.mjs'; import {band, db} from './meas.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x, n = v.length, TAU = 2 * Math.PI;
const notes = fs.readFileSync(RV + SRC[0].replace('.wav', '_notesA1.csv'), 'utf8').trim().split('\n').map(l => +l.split(',')[0]);
const hp70 = x => { const y = Float64Array.from(x); for (const q of [0.5411961, 1.3065630]) { const w = TAU * 70 / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al, co = [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0];
  for (const dir of [1, -1]) { let z1 = 0, z2 = 0; for (let k = 0; k < n; k++) { const i = dir > 0 ? k : n - 1 - k, x0 = y[i], o = co[0] * x0 + z1; z1 = co[1] * x0 - co[3] * o + z2; z2 = co[2] * x0 - co[4] * o; y[i] = o; } } } return Float32Array.from(y); };
const own = K.done(K.check(v, sr)).plops, vh = hp70(v), ownH = K.done(K.check(vh, sr)).plops;
const out = {own: own.map(e => { const nx = notes.filter(t => t >= e.t0 - 0.03).sort((a, b) => a - b)[0]; const a = e.s0, b = e.s1;
  const sub = db(band(Float32Array.from(v.subarray(a - 2048, b + 2048)), sr, 0, 70)), tot = db(band(Float32Array.from(v.subarray(a - 2048, b + 2048)), sr, 0, 20000));
  return {t: +e.t0.toFixed(3), ms: Math.round((e.t1 - e.t0) * 1000), f0Ann: Math.round(f0at(e.t0 + 0.01)), vorNoteMs: nx != null ? Math.round((nx - e.t0) * 1000) : null, sub70AnteilDb: +(sub - tot).toFixed(1), exDb: e.exDb}; })};
out.f0MinAnn = 107.3; out.ohneTief70 = ownH.length;
const vb = db(band(vh, sr, 100, 4000)) - db(band(v, sr, 100, 4000)); out.stimmband100_4000Db = +vb.toFixed(2);
const {x, T} = plops(vh, sr), ev = K.done(K.check(x, sr)).plops; out.eingesetzt = {gesetzt: T.length, gefunden: T.filter(t => ev.some(e => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)).length, fehl: ev.filter(e => !T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)).length};
for (const lv of [-6, -12, -18]) { const r = plops(vh, sr, {gdb: lv}), e2 = K.done(K.check(r.x, sr)).plops; out['eingesetzt' + lv + 'dB'] = T.filter(t => e2.some(e => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)).length + '/10, fehl ' + e2.filter(e => !T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)).length; }
out.B = K.done(K.check(wav(RV + SRC[1]).x, sr)).plops.length; out.C = K.done(K.check(wav(RV + SRC[2]).x, sr)).plops.length;
console.log(JSON.stringify(out, null, 1)); fs.writeFileSync('truth.json', JSON.stringify(out, null, 1));
