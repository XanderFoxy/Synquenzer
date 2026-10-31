// BM1-13 CPU (Node, Xeon of this machine; like MK1-24): one Bit Mask voice (oscillator part: 2 mask oscillators + noise at 16x,
// CIC5 + halfband, the whole BM1 voice) against one VA voice of 'dirigent-analog' (vs-base-B, App 4.23.0) in the same run.
// 9 interleaved runs of 8 s each, the first 2 s (JIT) dropped, mean quantum time, medians; minus the silent processor.
// Idle <= 0.1 %; no GC and heap +-1 MB over 60 s of a 12-voice render (perf_hooks 'gc' entries).
import fs from 'fs';
import {PerformanceObserver} from 'perf_hooks';
import {render, on} from './bm-node.mjs';
import {render as vaRender} from '../../../tests/v3-mk1-node.mjs';
const HERE = new URL('.', import.meta.url).pathname, BASE = new URL('../../../werkzeug/vs-base-B.html', import.meta.url).pathname;
const SR = 48000, qms = 128 / SR * 1000, R = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const prog = {t: 'prog', ab: 'a', p: {o1: {m: 78, e: {l: 99, a: 0, d: 0, s: 15, r: 3}}, o2: {m: 255, st: 7, e: {l: 80, a: 0, d: 0, s: 15, r: 3}}, n: {fr: 99, e: {l: 40, a: 0, d: 0, s: 15, r: 3}}}};
const notes = n => [36, 43, 48, 52, 55, 59, 60, 62, 64, 67, 71, 72].slice(0, n).map((x, k) => [0, on(0, x, .8, k + 1)]);
const bm = n => render([[0, prog]].concat(notes(n)), {sec: 8, quantumMs: true}).qms;
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const va = n => vaRender(null, [36, 43, 48, 52].slice(0, n).map(x => [0, 'on', x, .8]), {sec: 8, quantumMs: true, eng: 0, flat: VA, file: BASE}).qms;
const mean = q => { const a = Array.from(q).slice(750); return a.reduce((x, y) => x + y, 0) / a.length; };
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const cfg = {bmS: () => bm(0), bm1: () => bm(1), bm12: () => bm(12), vaS: () => va(0), va1: () => va(1)}, Rr = {};
for (const k in cfg) Rr[k] = [];
for (let r = 0; r < (+process.env.RUNS || 9); r++) for (const k in cfg) Rr[k].push(mean(cfg[k]()));
const b1 = med(Rr.bm1) - med(Rr.bmS), b12 = med(Rr.bm12) - med(Rr.bmS), v1 = med(Rr.va1) - med(Rr.vaS);
ok('BM1-13 Oszillator-Teil einer Stimme ≤ 1,5 × VA-Stimme', b1 / v1 <= 1.5, R(b1 / v1) + ' × (Bit-Mask-Stimme ' + R(b1 / qms * 100) + ' % Echtzeit, VA-Stimme ' + R(v1 / qms * 100) + ' %; 12 Stimmen ' + R(b12 / qms * 100) + ' % = ' + R(b12 / 12 / v1) + ' × VA je Stimme; Streuung bm1 ' + R(Math.min(...Rr.bm1) / qms * 100) + '–' + R(Math.max(...Rr.bm1) / qms * 100) + ' %)');
ok('BM1-13 Leerlauf ≤ 0,1 %', med(Rr.bmS) / qms * 100 <= .1, R(med(Rr.bmS) / qms * 100, 3) + ' % Echtzeit');
// 60 s with 12 voices (and with none): GC entries and heap; the processor's own loop, the buffers of the stand made beforehand
import {makeScope} from './bm-node.mjs';
async function gcRun(nv) {
  const {G, procs} = makeScope(SR), P = new procs['synq-bm']({}), send = m => P.port.onmessage({data: m});
  send(prog); notes(nv).forEach(([, m]) => send(m));
  const L = new Float32Array(128), Rr_ = new Float32Array(128), INS = [], OUTS = [[L, Rr_]];
  const step = q => { for (let i = 0; i < q; i++) { G.T[0] += 128 / SR; L.fill(0); Rr_.fill(0); P.process(INS, OUTS); } };
  step(375 * 5); P.__msgs.length = 0; global.gc && global.gc();
  let n = 0; const o = new PerformanceObserver(l => { n += l.getEntries().length; }); o.observe({entryTypes: ['gc']});
  const a = process.memoryUsage().heapUsed; step(375 * 60); const b = process.memoryUsage().heapUsed;
  await new Promise(r => setTimeout(r, 30)); o.disconnect();
  return {n, mb: (b - a) / 1048576, msgs: P.__msgs.length};
}
const g0 = await gcRun(0), g12 = await gcRun(12);
ok('BM1-13 60 s, 12 Stimmen: kein GC, Heap ± 1 MB', g12.n === 0 && Math.abs(g12.mb) <= 1, g12.n + ' GC-Läufe, Heap ' + R(g12.mb, 3) + ' MB (' + g12.msgs + ' Meldungen load); ohne Stimmen ' + g0.n + ' GC, ' + R(g0.mb, 3) + ' MB');
fs.writeFileSync(HERE + 'bm1-cpu.out.json', JSON.stringify({res, raw: Rr}, null, 1));
process.exit(fails ? 1 : 0);
