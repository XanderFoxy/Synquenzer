// VV1-05 with a Chrome trace (category toplevel): every main-thread task > 50 ms wall with its thread CPU time (tdur) – separates real work from CPU contention on this shared VM
import { open, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import os from 'os';
const tag = process.argv[2] || 'r1';
const bars = +(process.argv[3] || 84);
const {b, p, errs} = await open();
await p.evaluate(bars => {
  const lanes = [[], [], [], [], [], []], marks = [];
  for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[2].push({bar: k + 2, slot: 0}, {bar: k + 6, slot: -1}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: k % 16 ? 'Refrain' : 'Strophe'}); }
  SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks}); SYNQUENZER.vvTest({opus: true});
}, bars);
await p.waitForTimeout(1000);
await b.startTracing(p, {categories: ['toplevel', 'disabled-by-default-devtools.timeline']});
const load0 = os.loadavg()[0];
const m = await p.evaluate(async () => { const t0 = performance.now(); const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); const pr = SYNQUENZER.vvInfo().prof; return {t0, t1: performance.now(), dur: x.dur, msAudio: x.msAudio, big: pr.big || []}; });
const buf = await b.stopTracing();
const tr = JSON.parse(buf.toString()).traceEvents;
// the renderer main thread: the thread named CrRendererMain
const main = tr.find(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
const tasks = tr.filter(e => e.pid === main.pid && e.tid === main.tid && e.ph === 'X' && (e.name === 'ThreadControllerImpl::RunTask' || e.name === 'RunTask') && e.dur > 50000);
const t0us = Math.min(...tr.filter(e => e.pid === main.pid && e.tid === main.tid && e.ts).map(e => e.ts));
const rows = tasks.map(e => ({wall: Math.round(e.dur / 1000), cpu: e.tdur != null ? Math.round(e.tdur / 1000) : null}));
const cpuOver50 = rows.filter(r => r.cpu != null && r.cpu > 50);
console.log(JSON.stringify({load0, load1: os.loadavg()[0], dur: +m.dur.toFixed(1), wall: Math.round(m.t1 - m.t0), x: +(m.dur * 1000 / (m.t1 - m.t0)).toFixed(2), tasksWallOver50: rows.length, tasksCpuOver50: cpuOver50.length, maxCpu: Math.max(0, ...rows.map(r => r.cpu || 0)), rows: rows.sort((a, b) => b.cpu - a.cpu).slice(0, 12), bigProf: m.big.filter(x => x[0] !== 'frame').map(x => [x[0], x[2]]), errs}, null, 0));
await b.close();
