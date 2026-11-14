import fs from 'node:fs';
const src = fs.readFileSync(new URL('./core.js', import.meta.url), 'utf8');
const C = new Function(src + '\nreturn imp1Core;')()();
for (const f of process.argv.slice(2)) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8')), buf = Buffer.from(d.b64, 'base64'), x = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
  const dbg = {}, r = C.analyse(x, d.fs, {dbg});
  const bs = ({'4/4': 4, '3/4': 3, '6/8': 3, '2/4': 2, '12/8': 6})[d.ts] * 60 / d.bpm, t1b = (r.t1 - d.lead) / bs;
  console.log(f, JSON.stringify({soll: [d.bpm, d.ts], bpm: r.bpm, roh: r.bpmRoh, ts: r.ts, t1: r.t1, t1b: +t1b.toFixed(3), start: r.start, teile: r.teile.map(t => t.name + '@' + t.a).join(' '), diag: r.diag, ab: dbg.ab, cw: dbg.cw}));
}
