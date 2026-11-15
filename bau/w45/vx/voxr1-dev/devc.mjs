import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8'); const K = new Function(src.slice(src.indexOf('function vr1Make() {'), src.indexOf('\nconst VXR1 = {')) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
const TAU = 2 * Math.PI, db = p => 10 * Math.log10(p + 1e-20);
const A = wav(RV + SRC[0]), sr = A.sr, v = A.x, n = v.length; { let e = []; for (let p = 0; p + 441 <= n; p += 441) { let s = 0; for (let i = 0; i < 441; i++) s += v[p + i] ** 2; e.push(s / 441); } e.sort((a, b) => a - b); const t = e.slice(Math.floor(e.length / 2)); const g = Math.pow(10, (-20 - 10 * Math.log10(t.reduce((s, q) => s + q, 0) / t.length)) / 20); for (let i = 0; i < n; i++) v[i] *= g; }
const f0t = fs.readFileSync(RV + SRC[0].replace('.wav', '_f0.csv'), 'utf8').trim().split('\n').map(l => l.split(',').map(Number)); const f0at = t => { let lo = 0, hi = f0t.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (f0t[m][0] < t) lo = m + 1; else hi = m; } return f0t[lo][1]; };
// Pausen
const P = []; { let s = -1; for (let i = 0; i <= f0t.length; i++) { const z = i < f0t.length && !(f0t[i][1] > 0); if (z && s < 0) s = i; if (!z && s >= 0) { const d = f0t[i - 1][0] - f0t[s][0]; if (d >= 0.45) P.push([f0t[s][0], f0t[i - 1][0]]); s = -1; } } }
let seed = 99; const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
const bq = (type, f, q) => { const w = TAU * f / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; if (type === 'hp') return [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; if (type === 'lp') return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0];
  const Ag = Math.pow(10, 6 / 40); return [(1 + al * Ag) / (1 + al / Ag), -2 * c / (1 + al / Ag), (1 - al * Ag) / (1 + al / Ag), -2 * c / (1 + al / Ag), (1 - al / Ag) / (1 + al / Ag)]; };
const filt = (y, c) => { let z1 = 0, z2 = 0; for (let i = 0; i < y.length; i++) { const x0 = y[i], o = c[0] * x0 + z1; z1 = c[1] * x0 - c[3] * o + z2; z2 = c[2] * x0 - c[4] * o; y[i] = o; } };
const BR = [], x = Float32Array.from(v); const VR = (() => { const H = 441, e = []; for (let p = 0; p + H <= n; p += H) { let s = 0; for (let i = 0; i < H; i++) s += v[p + i] ** 2; e.push(s / H); } e.sort((a, b) => a - b); const t = e.slice(Math.floor(e.length * 0.5)); return db(t.reduce((s, q) => s + q, 0) / t.length); })(); console.log('Gesang RMS', VR.toFixed(1));
for (const [a, b] of P.slice(0, 10)) {   // Atmer mittig in der Pause, 60 ms Abstand zu Stimmhaftem
  const d = Math.min(0.55, b - a - 0.16), t0 = (a + b) / 2 - d / 2, M = Math.round(d * sr), i0 = Math.round(t0 * sr), nz = new Float64Array(M + 4000);
  for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1;
  filt(nz, bq('hp', 450, 0.7)); filt(nz, bq('lp', 5000, 0.7)); filt(nz, bq('pk', 1600, 1.2)); filt(nz, bq('lp', 7000, 0.7));
  const seg = nz.subarray(4000), env = i => { const u = i / M; return u < 0.35 ? 0.5 - 0.5 * Math.cos(Math.PI * u / 0.35) : 0.5 + 0.5 * Math.cos(Math.PI * (u - 0.35) / 0.65); };
  let e = 0; for (let i = 0; i < M; i++) e += (seg[i] * env(i)) ** 2; const L = VR - 6 - rnd() * 8, g = Math.pow(10, L / 20) / Math.sqrt(e / M);
  for (let i = 0; i < M; i++) x[i0 + i] += g * seg[i] * env(i);
  BR.push({t0, t1: t0 + d, s0: i0, s1: i0 + M, L});
}
const t1 = Date.now(), B = K.done(K.check(x, sr)), r = K.done(K.run(x, sr, {steps: {breath: {}}})), ms = Date.now() - t1;
const ev = r.info.breath;
console.log('pausen', P.length, 'atmer', BR.length, 'gefunden (Prüfen)', B.breaths, 'Schritt', ev.length, ms + ' ms');
for (const b of BR) { let p0 = 0, p1 = 0; for (let i = b.s0; i < b.s1; i++) { p0 += x[i] ** 2; p1 += r.y[i] ** 2; } const e = ev.find(q => q.t1 >= b.t0 && q.t0 <= b.t1); console.log(b.t0.toFixed(2), (b.t1 - b.t0).toFixed(2), 'vor', db(p0 / (b.s1 - b.s0)).toFixed(1), 'nach', db(p1 / (b.s1 - b.s0)).toFixed(1), e ? [e.t0, e.t1, e.db, e.dbNeu] : 'NICHT'); }
const fp = ev.filter(q => !BR.some(b => q.t1 >= b.t0 && q.t0 <= b.t1)); console.log('fehl', JSON.stringify(fp));
// gesungene Stellen unverändert?
let worst = 0, cnt = 0; for (let k = 0; k < f0t.length; k++) { if (!(f0t[k][1] > 0)) continue; const i0 = Math.round(f0t[k][0] * sr) - 220, i1 = i0 + 441; if (i0 < 0 || i1 > n) continue; let p0 = 0, p1 = 0; for (let i = i0; i < i1; i++) { p0 += x[i] ** 2; p1 += r.y[i] ** 2; } const d = db(p1) - db(p0); if (d < -0.05) cnt++; worst = Math.min(worst, d); }
console.log('stimmhafte Rahmen abgesenkt', cnt, 'schlimmster', worst.toFixed(2));
for (const k of [0, 1, 2]) { const W = wav(RV + SRC[k]); const c = K.done(K.check(W.x, W.sr)); console.log('take', k, c.breaths, JSON.stringify(c.breathList)); }
{ const Fe = K.done(K.feats(x, sr)), R = Fe.R, fps = sr / Fe.H; const pct = (a, q) => { const t = Array.from(a).filter(v => v > -150).sort((p, r) => p - r); return t[Math.floor(q * t.length)]; };
  console.log('floor', pct(R.tot, 0.1).toFixed(1), 'hi', pct(R.tot, 0.97).toFixed(1));
  for (const b of BR.slice(0, 3)) for (let t = b.t0; t < b.t1; t += 0.08) { const j = Math.round(t * fps); console.log(t.toFixed(2), 'tot', R.tot[j].toFixed(1), 'br-tot', (R.br[j] - R.tot[j]).toFixed(1), 'lf-tot', (R.lf[j] - R.tot[j]).toFixed(1), 'hf-br', (R.hf[j] - R.br[j]).toFixed(1)); } }

{ const Fe = K.done(K.feats(x, sr)), fps = sr / Fe.H, mask = new Uint8Array(Fe.nf).fill(1), vc = K.done(K.voicing(x, sr, Fe, mask));
  const bvals = [], vvals = []; for (let j = 0; j < Fe.nf; j++) { const t = (j + 1) / fps; if (BR.some(b => t > b.t0 + 0.05 && t < b.t1 - 0.05)) bvals.push(vc[j]); else if (f0at(t) > 0 && Fe.R.tot[j] > -45) vvals.push(vc[j]); }
  const q = (a, p) => { a = a.slice().sort((x, y) => x - y); return a[Math.floor(p * (a.length - 1))].toFixed(2); };
  console.log('NACF atmer p50/p90/p99', q(bvals, .5), q(bvals, .9), q(bvals, .99), 'stimmhaft p1/p5/p10/p50', q(vvals, .01), q(vvals, .05), q(vvals, .1), q(vvals, .5)); }
{ const Fe = K.done(K.feats(x, sr)), R = Fe.R, fps = sr / Fe.H, mask = new Uint8Array(Fe.nf).fill(1), vc = K.done(K.voicing(x, sr, Fe, mask));
  for (let t = 24.84; t < 25.08; t += 0.01) { const j = Math.round(t * fps) - 1; console.log('E', t.toFixed(2), 'tot', R.tot[j].toFixed(1), 'br', (R.br[j] - R.tot[j]).toFixed(1), 'lf', (R.lf[j] - R.tot[j]).toFixed(1), 'hf-br', (R.hf[j] - R.br[j]).toFixed(1), 'vc', vc[j].toFixed(2), 'f0', f0at(t)); } }
