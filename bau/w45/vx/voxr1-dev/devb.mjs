import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8'); const K = new Function(src.slice(src.indexOf('function vr1Make() {'), src.indexOf('\nconst VXR1 = {')) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
const TAU = 2 * Math.PI;
for (const tk of [0, 1, 2]) {
const A = wav(RV + SRC[tk]), sr = A.sr, v = A.x, n = v.length;
let seed = 777 + tk; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const CL = [], x = Float32Array.from(v);
const hpS = (() => { const y = Float64Array.from(v); const c = [0.5411961, 1.3065630].map(q => { const w = TAU * 2000 / sr, cc = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; return [(1 + cc) / 2 / a0, -(1 + cc) / a0, (1 + cc) / 2 / a0, -2 * cc / a0, (1 - al) / a0]; }); for (const k of c) { let z1 = 0, z2 = 0; for (let i = 0; i < y.length; i++) { const x0 = y[i], o = k[0] * x0 + z1; z1 = k[1] * x0 - k[3] * o + z2; z2 = k[2] * x0 - k[4] * o; y[i] = o; } } return y; })();
for (let k = 0; k < 20; k++) {
  const t = 0.3 + k * (n / sr - 0.8) / 20 + rnd() * 0.15, i0 = Math.round(t * sr), d = 0.0005 + rnd() * 0.0025, M = Math.max(4, Math.round(d * sr)), f = 2500 + rnd() * 3500, typ = k % 2;
  let e = 0; for (let i = i0 - 441; i < i0 + 441; i++) e += hpS[i] * hpS[i]; const lr = Math.sqrt(e / 882), amp = Math.max(0.01, lr * Math.pow(10, (12 + rnd() * 8) / 20)), sg = rnd() < 0.5 ? -1 : 1;
  for (let i = 0; i < M; i++) { const w = Math.min(1, i / 2) * Math.exp(-3 * i / M); x[i0 + i] += sg * amp * w * (typ ? Math.sin(TAU * f * i / sr + 1.2) : (rnd() * 2 - 1)); }
  CL.push({t, d, s0: i0, s1: i0 + M});
}
const r = K.done(K.run(x, sr, {steps: {click: {}}})), L = r.info.click.list, own = K.done(K.clickScan(v, sr, {}));
const hit = CL.filter(c => L.some(e => e.t1 * sr >= c.s0 - 44 && e.t0 * sr <= c.s1 + 44)).length, fp = L.filter(e => !CL.some(c => e.t1 * sr >= c.s0 - 44 && e.t0 * sr <= c.s1 + 44));
const fpOwn = fp.filter(e => own.some(q => Math.abs(q.t0 - e.t0) < 0.003));
if (process.env.DBG && tk == +process.env.DBG) { const K2 = new Function(fs.readFileSync(process.argv[3], 'utf8').slice(src.indexOf('function vr1Make() {'), fs.readFileSync(process.argv[3], 'utf8').indexOf('\nconst VXR1 = {')) + '\nreturn vr1Make;')()(); const ms = CL.filter(c => !L.some(e => e.t1 * sr >= c.s0 - 44 && e.t0 * sr <= c.s1 + 44)); console.log('miss', JSON.stringify(ms.map(c => [+(c.s0/sr).toFixed(4), +(c.d*1000).toFixed(2)]))); K2.done(K2.clickScan(x, sr, {dbg: ms.map(c => c.s0 / sr + 0.001)})); }
console.log('take', tk, 'treffer', hit, 'fehl', fp.length, 'davon eigene', fpOwn.length, 'eigene', own.length, JSON.stringify(fp.filter(e => !fpOwn.includes(e)).map(e => [e.t0, e.sc])));
}
