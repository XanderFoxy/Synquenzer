import fs from 'fs';
const tr = JSON.parse(fs.readFileSync(process.argv[2])).traceEvents;
const main = tr.find(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
const ev = tr.filter(e => e.pid === main.pid && e.tid === main.tid);
let first = Infinity; for (const e of ev) if (e.ph === 'X' && e.ts < first) first = e.ts;
const tasks = ev.filter(e => e.ph === 'X' && e.name === 'ThreadControllerImpl::RunTask' && e.tdur > 40000);
for (const t of tasks) {
  const kids = ev.filter(e => e !== t && e.ts >= t.ts && e.ts <= t.ts + t.dur && e.name !== 'ThreadControllerImpl::RunTask').sort((a, b) => (b.dur || 0) - (a.dur || 0)).slice(0, 14)
    .map(e => e.ph + ':' + e.name + ' ' + Math.round((e.dur || 0) / 1000) + 'ms ' + JSON.stringify(e.args && e.args.data ? Object.fromEntries(Object.entries(e.args.data).filter(([k]) => ['functionName', 'url', 'lineNumber', 'type', 'name', 'timerId', 'callFrames'].includes(k)).map(([k, v]) => [k, typeof v === 'string' ? v.slice(-60) : Array.isArray(v) ? v.slice(0, 2).map(f => f.functionName + ':' + f.lineNumber) : v])) : e.args).slice(0, 160));
  console.log('=== t=' + Math.round((t.ts - first) / 1000) + 'ms wall ' + Math.round(t.dur / 1000) + ' cpu ' + Math.round(t.tdur / 1000)); for (const k of kids) console.log('   ' + k);
}
