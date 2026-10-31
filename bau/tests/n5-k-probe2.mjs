import {va, INIT, rms, db, mag, diffDb} from './n5-k-lib.mjs';
const sr = 48000;
const R = (p, note = 57) => va(Object.assign({}, INIT, {analog: 0}, p), [[0, 'on', note, .8], [0.9, 'off', note]], {sec: 1});
const S = r => rms(r.l, 9600, 38400);
for (const base of [{}, {drive: .2}, {cutoff: 1200, res: .2, drive: .2}, {lq: 0}]) {
  console.log('--- base', JSON.stringify(base));
  const o1 = R(Object.assign({}, base, {o1lvl: 1}));
  for (const o3 of [{o3w: 0, o3oct: 0, o3fine: 13}, {o3w: 1, o3oct: -1}, {o3w: 0, o3oct: 0, o3fine: 0}]) {
    for (const lv of [.3, .6, 1]) {
      const m = R(Object.assign({}, base, {o1lvl: 1}, o3, {o3lvl: lv})), s3 = R(Object.assign({}, base, {o1lvl: 0}, o3, {o3lvl: lv}));
      // linearity: m - s3 vs o1
      const res = new Float32Array(m.l.length); for (let i = 0; i < res.length; i++) res[i] = m.l[i] - s3.l[i];
      console.log(JSON.stringify(o3), lv, 'o1', db(S(o1)).toFixed(2), 'o3 solo', db(S(s3)).toFixed(2), 'mix', db(S(m)).toFixed(2), 'expected(pow)', (10*Math.log10(S(o1)**2+S(s3)**2)).toFixed(2), 'o1 altered by', diffDb(res, o1.l, 9600, 38400).toFixed(1), 'dB');
    }
  }
}
