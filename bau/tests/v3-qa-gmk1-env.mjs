import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk1/';
const [pre, nm, a0, a1, step] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5], +(process.argv[6] || 1)];
const buf = fs.readFileSync(OUT + pre + '-audio.f32'); const x = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const {acts, f0, sr} = JSON.parse(fs.readFileSync(OUT + pre + '-acts.json')); const t0 = f0 / sr;
const a = acts.find(a => a.name.includes(nm)); const i0 = Math.round((a.t - t0) * sr);
const row = [];
for (let ms = a0; ms < a1; ms += step) { const i = i0 + Math.round(ms * sr / 1000), n = Math.round(step * sr / 1000); let s = 0, pk = 0; for (let k = i; k < i + n; k++) { s += x[k] * x[k]; pk = Math.max(pk, Math.abs(x[k])); } row.push(ms + ':' + (10 * Math.log10(s / n + 1e-20)).toFixed(1) + '/' + pk.toFixed(2)); }
console.log(a.name, row.join(' '));
