import fs from 'fs';
const html = fs.readFileSync('../voxr1b/index.html', 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const K = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32768; return {x, sr}; };
const actRms = x => { const H = 480, e = []; for (let p = 0; p + H <= x.length; p += H) { let s = 0; for (let i = 0; i < H; i++) s += x[p + i] * x[p + i]; e.push(s / H); } e.sort((a, b) => a - b); const t = e.slice(Math.floor(e.length * 0.5)); return Math.sqrt(t.reduce((s, v) => s + v, 0) / t.length); };
const TAU = 2 * Math.PI;
for (const [f, base, eq] of [[RV + 'imp2rs/vocadito_14@48000.wav', 50, 0], [RV + 'imp2rs/vocadito_14@48000.wav', 50, 1], [RV + 'dl/vocadito_10.wav', 60, 0], [RV + 'dl/vocadito_10.wav', 60, 1], [RV + 'imp2rs/vocadito_14@48000.wav', 49.6, 1]]) {
  const {x: v, sr} = wav(f), n = v.length, vr = actRms(v), amp = eq ? [1, 1, 1, 1, 1, 1, 1] : [1, 0.8, 0.6, 0.5, 0.35, 0.25, 0.2], s2 = Math.sqrt(amp.reduce((s, a) => s + a * a / 2, 0));
  const x = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let k = 1; k <= 7; k++) s += amp[k - 1] * Math.sin(TAU * base * k * i / sr + k * 0.7); x[i] = v[i] + s * vr * 0.1 / s2; }
  const Fe = K.done(K.feats(x, sr)), h = K.done(K.humFind(x, sr, Fe));
  console.log(f.split('/').pop().slice(0, 3), base, eq ? 'gleich' : 'fallend', JSON.stringify({on: h.on, base: h.base, f0: h.f0, rk: h.rk.slice(0, 8)}));
}
