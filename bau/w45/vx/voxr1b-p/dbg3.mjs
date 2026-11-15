import fs from 'fs';
const html = fs.readFileSync('../voxr1b/index.html', 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const K = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32768; return {x, sr}; };
const f0t = fs.readFileSync(RV + 'dl/vocadito_1_f0.csv', 'utf8').trim().split('\n').map(l => l.split(',').map(Number));
const f0at = t => { let lo = 0, hi = f0t.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (f0t[m][0] < t) lo = m + 1; else hi = m; } return f0t[lo][1]; };
const TAU = 2 * Math.PI, db = p => 10 * Math.log10(p + 1e-20);
for (const fn of ['imp2rs/vocadito_1@48000.wav', 'dl/vocadito_1.wav']) {
const {x: v, sr} = wav(RV + fn), B = K.done(K.check(v, sr)), r = K.done(K.run(v, sr, {steps: {plop: {str: 50}}}));
console.log(fn.slice(0, 6), sr, 'Funde', B.plops.length);
// Energie 200–4000 Hz je 10-ms-Rahmen vorher/nachher (Goertzel-frei: einfache Bandenergie über Differenz)
const N = 1024;
for (const e of r.info.plop) { const a = Math.round((e.t0 - 0.03) * sr), b = Math.round((e.t1 + 0.03) * sr); let dmax = 0, dt = 0; for (let c = a; c < b; c += Math.round(0.005 * sr)) { let ey = 0, ex = 0, ed = 0; for (let i = c - N / 2; i < c + N / 2; i++) { ey += r.y[i] * r.y[i]; ex += v[i] * v[i]; ed += (r.y[i] - v[i]) ** 2; } const d = db(ey) - db(ex); if (Math.abs(d) > Math.abs(dmax)) { dmax = d; dt = c / sr; } }
  // Anteil der gesungenen Annotation im Fund
  let vf = 0, tot = 0; for (let t = e.t0; t <= e.t1; t += 0.0029) { tot++; if (f0at(t) > 0) vf++; }
  console.log(' t', e.t0.toFixed(3), '-', e.t1.toFixed(3), 'redDb', e.redDb, 'Ann.stimmhaft', vf + '/' + tot, 'f0Ann', Math.round(f0at((e.t0 + e.t1) / 2)), 'max dB (Gesamt, 21-ms-Rahmen)', dmax.toFixed(2), '@', dt.toFixed(3), 'f0@', Math.round(f0at(dt)));
}}
