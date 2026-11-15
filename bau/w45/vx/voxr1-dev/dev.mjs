import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8'); const a0 = src.indexOf('function vr1Make() {'), a1 = src.indexOf('\nconst VXR1 = {', a0);
const K = new Function(src.slice(a0, a1) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
const A = wav(RV + SRC[0]), sr = A.sr, v = A.x, n = v.length, TAU = 2 * Math.PI;
let seed = 777; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
// 20 Mundklicks 0,5–3 ms
const CL = [], x = Float32Array.from(v);
const hpS = (() => { const y = Float64Array.from(v); const c = [0.5411961, 1.3065630].map(q => { const w = TAU * 2000 / sr, cc = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; return [(1 + cc) / 2 / a0, -(1 + cc) / a0, (1 + cc) / 2 / a0, -2 * cc / a0, (1 - al) / a0]; }); for (const k of c) { let z1 = 0, z2 = 0; for (let i = 0; i < y.length; i++) { const x0 = y[i], o = k[0] * x0 + z1; z1 = k[1] * x0 - k[3] * o + z2; z2 = k[2] * x0 - k[4] * o; y[i] = o; } } return y; })();
for (let k = 0; k < 20; k++) {
  const t = 0.8 + k * (n / sr - 1.6) / 20 + rnd() * 0.5, i0 = Math.round(t * sr), d = 0.0005 + rnd() * 0.0025, M = Math.max(4, Math.round(d * sr)), f = 2500 + rnd() * 3500, typ = k % 2;
  let e = 0; for (let i = i0 - 441; i < i0 + 441; i++) e += hpS[i] * hpS[i]; const lr = Math.sqrt(e / 882), amp = Math.max(0.01, lr * Math.pow(10, (12 + rnd() * 8) / 20)), sg = rnd() < 0.5 ? -1 : 1;
  for (let i = 0; i < M; i++) { const w = Math.sin(Math.PI * i / M); x[i0 + i] += sg * amp * w * (typ ? Math.sin(TAU * f * i / sr) * Math.exp(-3 * i / M) : (rnd() * 2 - 1)); }
  CL.push({t, d, s0: i0, s1: i0 + M});
}
for (const sens of [3, 4, 5, 6]) {
  const ev = K.done(K.clickScan(x, sr, {sens})), evc = K.done(K.clickScan(v, sr, {sens}));
  const hit = CL.filter(c => ev.some(e => e.s1 >= c.s0 - 44 && e.s0 <= c.s1 + 44)).length, fp = ev.filter(e => !CL.some(c => e.s1 >= c.s0 - 44 && e.s0 <= c.s1 + 44));
  console.log('sens', sens, 'treffer', hit, 'fehl', fp.length, 'sauber', evc.length, JSON.stringify(fp.slice(0, 5).map(e => [e.t0, e.sc])), JSON.stringify(evc.slice(0, 6).map(e => [e.t0, e.sc])));
}
const t0 = Date.now(); const r = K.done(K.run(x, sr, {steps: {click: {}}})); console.log('kette', Date.now() - t0, 'ms', r.info.click.pass1, r.info.click.pass2);
const miss = CL.filter(c => !r.info.click.list.some(e => e.t1 * sr >= c.s0 - 44 && e.t0 * sr <= c.s1 + 44)); console.log('verfehlt', JSON.stringify(miss.map(c => [+(c.t).toFixed(3), +(c.d * 1000).toFixed(2)])));
// Reduktion: Fehler-Energie (x−v) vs (y−v) an den Klicks
const red = CL.map(c => { let e0 = 0, e1 = 0; for (let i = c.s0 - 44; i < c.s1 + 44; i++) { e0 += (x[i] - v[i]) ** 2; e1 += (r.y[i] - v[i]) ** 2; } return +(10 * Math.log10(e0 / (e1 + 1e-20))).toFixed(1); }); console.log('reduktion', JSON.stringify(red));
