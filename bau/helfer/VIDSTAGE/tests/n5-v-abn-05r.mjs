// VV1-05, production audio path only (vvRender of the 3-min song, no test switches): main-thread tasks > 50 ms (wall + CPU from a Chrome trace) and where they are
import { open, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import os from 'os';
const tag = process.argv[2] || 'r1';
const {b, p, errs} = await open({init: () => {
  window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const o = OfflineAudioContext.prototype.startRendering; OfflineAudioContext.prototype.startRendering = function () { const pr = o.call(this); pr.then(() => { window.__doneAt = performance.now(); }); return pr; };
}});
await p.evaluate(() => {
  const bars = 84, lanes = [[], [], [], [], [], []], marks = [];
  for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[2].push({bar: k + 2, slot: 0}, {bar: k + 6, slot: -1}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: k % 16 ? 'Refrain' : 'Strophe'}); }
  SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks}); SYNQUENZER.vvTest({});
});
await p.waitForTimeout(1000);
await b.startTracing(p, {categories: ['toplevel', 'devtools.timeline']});
const load0 = os.loadavg()[0];
const m = await p.evaluate(async () => { VV.prof = {}; window.__lt.length = 0; const t0 = performance.now(); const x = await SYNQUENZER.vvRender(); const t1 = performance.now(); const pr = VV.prof; return {t0, t1, doneAt: window.__doneAt, dur: x.dur, ms: x.ms, sr: x.sr, lt: window.__lt.filter(e => e[0] >= t0 - 5), prof: Object.fromEntries(Object.entries(pr).filter(([k]) => k !== 'big').map(([k, v]) => [k, Math.round(v.max)])), big: (pr.big || []).map(x => [x[0], Math.round(x[1] - t0), x[2]])}; });
const buf = await b.stopTracing(); fs.writeFileSync(OUT + tag + '-05r-trace.json', buf);
const tr = JSON.parse(buf.toString()).traceEvents;
const main = tr.find(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
const ev = tr.filter(e => e.pid === main.pid && e.tid === main.tid && e.ph === 'X');
const tasks = ev.filter(e => e.name === 'ThreadControllerImpl::RunTask' && e.dur > 40000);
const rows = tasks.map(t => { const fc = ev.filter(e => e.ts >= t.ts && e.ts <= t.ts + t.dur && /FunctionCall|EvaluateScript|RunMicrotasks|EventDispatch|TimerFire|v8.callFunction|GC|MajorGC|MinorGC|V8.GC/.test(e.name)).sort((a, b) => b.dur - a.dur).slice(0, 4).map(e => e.name + (e.args && e.args.data && e.args.data.functionName ? '(' + e.args.data.functionName + ':' + e.args.data.lineNumber + ')' : '') + ' ' + Math.round(e.dur / 1000)); return {wall: Math.round(t.dur / 1000), cpu: Math.round((t.tdur || 0) / 1000), what: fc.join(' ; ')}; });
console.log(JSON.stringify({load0, load1: os.loadavg()[0], dur: +m.dur.toFixed(1), renderMs: Math.round(m.t1 - m.t0), sr: m.sr, doneAtRel: Math.round(m.doneAt - m.t0), prof: m.prof, big: m.big, longTasks: m.lt.map(e => [Math.round(e[0] - m.t0), Math.round(e[1])]), traceTasks: rows, errs}, null, 1));
await b.close();
