import fs from 'fs';
const S='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const RV = S+'/realvox/dl/'; const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const html = fs.readFileSync(S+'/vx/voxr1/src-voxr1.js', 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const K = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')()();
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
const TAU = 2*Math.PI; let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const f0tab = fs.readFileSync(RV + SRC[0].replace('.wav', '_f0.csv'), 'utf8').trim().split('\n').map(l => l.split(',').map(Number));
const f0at = t => { let lo = 0, hi = f0tab.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (f0tab[m][0] < t) lo = m + 1; else hi = m; } return f0tab[lo][1]; };
const {x: v, sr} = wav(RV + SRC[0]), n = v.length;
// (Kopie der Einsetz-Routine aus voxr1-test.mjs; seed-Folge wie dort nach den Brumm-Tests nicht identisch – nur zur Orientierung)
const T = []; { const cand = []; for (let t = 0.6; t < n / sr - 0.6; t += 0.01) { let okv = true; for (let d = -0.06; d <= 0.1; d += 0.02) if (!(f0at(t + d) > 0)) { okv = false; break; } if (okv) cand.push(t); }
  let last = -9; for (const t of cand) if (t - last >= (n / sr - 1.2) / 11 && T.length < 10) { T.push(+t.toFixed(3)); last = t; } }
const P = new Float32Array(n);
{ const L = [[0.5411961], [1.3065630]].map(([q]) => { const w = TAU * 120 / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; });
  for (const t of T) { const i0 = Math.round(t * sr), M = Math.round(0.04 * sr), nz = new Float64Array(M + 2000); for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1;
    for (const c of L) { let z1 = 0, z2 = 0; for (let i = 0; i < nz.length; i++) { const x0 = nz[i], o = c[0] * x0 + z1; z1 = c[1] * x0 - c[3] * o + z2; z2 = c[2] * x0 - c[4] * o; nz[i] = o; } }
    let e = 0, es = 0; for (let i = 0; i < M; i++) { e += v[i0 + i] * v[i0 + i]; es += nz[1000 + i] * nz[1000 + i]; }
    const g = 2 * Math.sqrt(e / es);
    for (let i = 0; i < M; i++) { const w = Math.sin(Math.PI * i / M); P[i0 + i] = g * (nz[1000 + i] * w + 0.6 * Math.sqrt(es / M) * Math.sin(Math.PI * i / M) * Math.sin(Math.PI * i / M)); } } }
const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i];
const Fx = K.done(K.feats(x, sr)), Fv = K.done(K.feats(v, sr)), R = Fx.R;
const top = (a => { const s = Array.from(a).filter(q => q > -150).sort((p, q) => p - q); return s[Math.floor(0.99 * s.length)]; })(R.tot);
for (const t of T) { const j = Math.round((t + 0.02) * sr / Fx.H); console.log(t, 'sub', R.sub[j].toFixed(1), 'tot', R.tot[j].toFixed(1), 'mid', R.mid[j].toFixed(1), 'subV', Fv.R.sub[j].toFixed(1), 'totV', Fv.R.tot[j].toFixed(1), 'top', top.toFixed(1)); }
for (const lvl of [-45, -30, -24, -20]) for (const own of [-10, -6]) { const e = K.plopFind(Fx, {lvl, own}), ev = K.plopFind(Fv, {lvl, own}); console.log('lvl', lvl, 'own', own, 'treffer', T.filter(t => e.some(q => q.t1 >= t - 0.01 && q.t0 <= t + 0.05)).length, 'fehl', e.filter(q => !T.some(t => q.t1 >= t - 0.01 && q.t0 <= t + 0.05)).length, 'sauber', ev.length); }
{ const e = K.plopFind(Fx, {lvl: -30, own: -12, sens: 10}); for (const t of T) { const q = e.find(q => q.t1 >= t - 0.01 && q.t0 <= t + 0.05); console.log('T', t, q ? 'found ' + q.t0.toFixed(3) + '-' + q.t1.toFixed(3) + ' ex ' + q.exDb : 'MISS'); }
  const ev = K.plopFind(Fv, {lvl: -20}); const act = (a => { const s = Array.from(a).filter(q => q > -150).sort((p, q) => p - q); return s[Math.floor(0.6 * s.length)]; })(Fv.R.tot); console.log('act', act.toFixed(1));
  for (const q of ev) { const j = Math.round(q.s0 / Fv.H) + 2; console.log('clean', q.t0.toFixed(2), 'sub', Fv.R.sub[j].toFixed(1), 'tot', Fv.R.tot[j].toFixed(1), 'mid', Fv.R.mid[j].toFixed(1), 'f0', f0at(q.t0 + 0.02)); } }
