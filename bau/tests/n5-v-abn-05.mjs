// VV1-05: 3-min song 9:16, WebCodecs (opus switch): faster than real time; long tasks (> 50 ms) outside the per-frame encode slices; cancel via the sheet ≤ 300 ms
import { open, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import os from 'os';
const tag = process.argv[2] || 'r1';
const {b, p, errs} = await open({init: () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }});
await p.evaluate(() => {
  const bars = Math.ceil(180 / (4 * 60 / S.bpm)), lanes = [[], [], [], [], [], []], marks = [];
  for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[2].push({bar: k + 2, slot: 0}, {bar: k + 6, slot: -1}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: k % 16 ? 'Refrain' : 'Strophe'}); }
  SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks});
});
const load0 = os.loadavg()[0];
const m = await p.evaluate(async () => {
  SYNQUENZER.vvTest({opus: true}); window.__lt.length = 0; const t0 = performance.now();
  const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); const t1 = performance.now();
  const pr = SYNQUENZER.vvInfo().prof;
  return {x, t0, t1, big: pr.big || [], lt: window.__lt.filter(e => e[0] >= t0 && e[0] <= t1), prof: Object.fromEntries(Object.entries(pr).filter(([k]) => k !== 'big').map(([k, v]) => [k, {n: v.n, max: Math.round(v.max)}]))};
});
const load1 = os.loadavg()[0];
// attribute: a long task is "encode" when a profiled frame slice lies inside it and the rest of the task is ≤ 50 ms
const rows = m.lt.map(([s, d]) => { const ins = m.big.filter(q => q[1] >= s - 2 && q[1] + q[2] <= s + d + 2); const enc = ins.filter(q => q[0] === 'frame').reduce((a, q) => a + q[2], 0); const other = ins.filter(q => q[0] !== 'frame').map(q => q[0] + ':' + q[2]); return {at: Math.round(s - m.t0), d: Math.round(d), enc, other: other.join(','), rest: Math.round(d - enc)}; });
const bad = rows.filter(r => !r.enc || r.rest > 50);
const res = {load0, load1, dur: +m.x.dur.toFixed(2), wall: Math.round(m.t1 - m.t0), x: +(m.x.dur * 1000 / (m.t1 - m.t0)).toFixed(2), msAudio: m.x.msAudio, prof: m.prof, longTasks: rows.length, outsideEncode: bad, errs};
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + tag + '-05.json', JSON.stringify(Object.assign(res, {rows}), null, 1));
await b.close();
