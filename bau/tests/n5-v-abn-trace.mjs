import fs from 'fs';
const tr = JSON.parse(fs.readFileSync(process.argv[2])).traceEvents;
const main = tr.find(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
const ev = tr.filter(e => e.pid === main.pid && e.tid === main.tid && e.ph === 'X');
const tasks = ev.filter(e => e.name === 'ThreadControllerImpl::RunTask' && e.tdur > 40000);
let first = Infinity; for (const e of ev) if (e.ts < first) first = e.ts;
for (const t of tasks) {
  const kids = ev.filter(e => e !== t && e.ts >= t.ts && e.ts + (e.dur || 0) <= t.ts + t.dur && e.dur > 3000 && e.name !== 'RunTask').map(e => e.name + (e.args && e.args.data && (e.args.data.functionName || e.args.data.url || e.args.data.type) ? '(' + (e.args.data.functionName || e.args.data.type || '') + (e.args.data.lineNumber ? ':' + e.args.data.lineNumber : '') + ')' : '') + ' ' + Math.round(e.dur / 1000) + '/' + Math.round((e.tdur || 0) / 1000));
  console.log('t=' + Math.round((t.ts - first) / 1000) + 'ms wall ' + Math.round(t.dur / 1000) + ' cpu ' + Math.round(t.tdur / 1000), '|', [...new Set(kids)].slice(0, 8).join(' ; '));
}
