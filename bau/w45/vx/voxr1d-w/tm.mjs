// Zeit der 3-min-Kette (wie Prüfer-Kern VOXR1B Abschnitt 8) für mehrere Fassungen abwechselnd. node tm.mjs a.html b.html ...
import fs from 'fs';
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32768; return {x, sr}; };
const TAU = 2 * Math.PI, {x: v, sr} = wav(RV + 'imp2rs/vocadito_14@48000.wav'); let e = 0; for (const q of v) e += q * q; const vr = Math.sqrt(e / v.length);
const L = 180 * sr, x = new Float32Array(L); for (let i = 0; i < L; i++) x[i] = v[i % v.length] + vr * 0.1 * Math.sqrt(2 / 7) * [1, 2, 3, 4, 5, 6, 7].reduce((s, k) => s + Math.sin(TAU * 50 * k * i / sr + k), 0);
for (let t = 1; t < 179; t += 2.3) { const i0 = Math.round(t * sr); for (let i = 0; i < 0.04 * sr; i++) x[i0 + i] += 0.2 * Math.sin(TAU * 40 * i / sr) * Math.exp(-i / (0.012 * sr)); const j0 = Math.round((t + 0.7) * sr); for (let i = 0; i < 0.001 * sr; i++) x[j0 + i] += 0.1 * Math.exp(-i / 10) * Math.sin(TAU * 4000 * i / sr); }
const Ks = process.argv.slice(2).map(f => { const h = fs.readFileSync(f, 'utf8'), a0 = h.indexOf('function vr1Make() {'), a1 = h.indexOf('\nconst VXR1 = {', a0); return new Function(h.slice(a0, a1) + '\nreturn vr1Make;')()(); });
const R = Ks.map(() => []);
for (let k = 0; k < 3; k++) Ks.forEach((K, w) => { const t0 = Date.now(); K.done(K.check(x, sr)); const t1 = Date.now(); const r = K.done(K.run(x, sr, {steps: {click: {}, plop: {}, hum: 'auto', hp: {}, breath: {}, room: {}, ess: {}}})); const t2 = Date.now(); R[w].push([t1 - t0, t2 - t1, (r.info.plop || []).length]); });
R.forEach((m, w) => { const tot = m.map(q => q[0] + q[1]).sort((a, b) => a - b); console.log(process.argv[2 + w].split('/').pop(), JSON.stringify(m), 'median', tot[1], 'x3', 3 * tot[1]); });
