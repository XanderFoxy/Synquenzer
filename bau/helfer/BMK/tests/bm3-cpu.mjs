// BM3-10 CPU (Node / Xeon): the cost of one FX slot (unit + BAL mix + sleep checks, in 48-sample segments as in the processor)
// on a playing stereo signal: FX1 (every family) <= 0.4 %, FX2 RV <= 1.0 % of real time; 9 interleaved runs of 10 s, medians.
// FX sleep in silence: an idle processor with FX1 CH4 + FX2 RV1 set <= 0.1 %.
import fs from 'fs';
import {render} from './bm-node.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000, R = (x, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const {BMK} = render([], {sec: .01}), med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const N = 128, L0 = new Float32Array(N * 375), R0 = new Float32Array(N * 375); for (let i = 0; i < L0.length; i++) { L0[i] = .3 * Math.sin(2 * Math.PI * 220 * i / SR) + .1 * Math.sin(2 * Math.PI * 1310 * i / SR); R0[i] = .3 * Math.sin(2 * Math.PI * 223 * i / SR); }
function slotCost(kind, type, sec) {
  const S = new BMK.FxSlot(kind, SR), L = new Float32Array(N), Rr = new Float32Array(N); S.setType(type);
  let t = 0; const blocks = Math.round(sec * SR / N);
  for (let b = 0; b < blocks + 375 * 2; b++) {
    const o = (b % 375) * N; L.set(L0.subarray(o, o + N)); Rr.set(R0.subarray(o, o + N));
    const t0 = b >= 750 ? performance.now() : 0;
    for (let i = 0; i < N; i += 48) S.process(L, Rr, i, Math.min(N, i + 48), .5);
    if (b >= 750) t += performance.now() - t0;
  }
  return t / (sec * 1000) * 100;
}
const types = [[1, 'CH4'], [1, 'CH16'], [1, 'DT9'], [1, 'DT10'], [1, 'BC10'], [1, 'BC2'], [1, 'RM12'], [2, 'DL3'], [2, 'DL13'], [2, 'RV1'], [2, 'RV16'], [2, 'DT9']], Rr = {};
for (const [, t] of types) Rr[t] = [];
for (let r = 0; r < (+process.env.RUNS || 9); r++) for (const [k, t] of types) Rr[(k === 2 && t === 'DT9' ? 'FX2 ' : '') + t] = (Rr[(k === 2 && t === 'DT9' ? 'FX2 ' : '') + t] || []).concat([slotCost(k, t, 10)]);
const m = {}; for (const k in Rr) if (Rr[k].length) m[k] = med(Rr[k]);
const fx1 = Math.max(m.CH4, m.CH16, m.DT9, m.DT10, m.BC10, m.BC2, m.RM12), rv = Math.max(m.RV1, m.RV16);
// the idle processor with FX set (sleep)
const qms = 128 / SR * 1000, idle = []; for (let r = 0; r < 5; r++) { const q = render([[0, {t: 'prog', ab: 'a', p: {fx: {t1: 'CH4', b1: 50, t2: 'RV1', b2: 50}}}]], {sec: 8, quantumMs: true}).qms; const a = Array.from(q).slice(750); idle.push(a.reduce((x, y) => x + y, 0) / a.length / qms * 100); }
ok('BM3-10 CPU FX1 ≤ 0,4 %, FX2 RV ≤ 1,0 % (Xeon, ein FX-Steckplatz je Spur); FX schlafen bei Stille', fx1 <= .4 && rv <= 1 && med(idle) <= .1,
  Object.keys(m).map(k => k + ' ' + R(m[k]) + ' %').join(', ') + '; Leerlauf-Prozessor mit FX1 CH4 + FX2 RV1 eingestellt ' + R(med(idle)) + ' %');
fs.writeFileSync(HERE + 'bm3-cpu.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
