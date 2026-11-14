import fs from 'node:fs';
const src = fs.readFileSync(new URL('./core.js', import.meta.url), 'utf8');
const C = new Function(src + '\nreturn imp1Core;')()();
for (const [f, o] of [['dump-92_4_4.json', {bpm: 92}], ['dump-120_3_4.json', {bpm: 120}], ['dump-92_4_4.json', {gesang: true}]]) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8')), buf = Buffer.from(d.b64, 'base64'), x = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
  const r = C.analyse(x, d.fs, o);
  console.log(f, JSON.stringify(o), JSON.stringify({bpm: r.bpm, ts: r.ts, t1: r.t1, quelle: r.quelle, frage: r.frage, alt: r.alt, teile: r.teile.map(t => t.name + '@' + t.a).join(' '), ms: r.ms}));
}
