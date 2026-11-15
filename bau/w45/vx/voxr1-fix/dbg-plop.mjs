import fs from 'fs';
const S='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const RV = S+'/realvox/dl/'; const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const html = fs.readFileSync(S+'/vx/voxr1/src-voxr1.js', 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const K = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')()();
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
for (let t = 0; t < 3; t++) { const {x, sr} = wav(RV + SRC[t]); const Fe = K.done(K.feats(x, sr)), R = Fe.R; const ev = K.plopFind(Fe, {});
  const top = (a => { const s = Array.from(a).filter(v => v > -150).sort((p, q) => p - q); return s[Math.floor(0.99 * s.length)]; })(R.tot);
  console.log('take', t, 'n', ev.length, 'top', top.toFixed(1));
  for (const e of ev.slice(0, 12)) { const j = Math.round(e.s0 / Fe.H) + 2; console.log(' ', e.t0.toFixed(2), ((e.t1 - e.t0) * 1000).toFixed(0), 'ex', e.exDb, 'sub', R.sub[j].toFixed(1), 'tot', R.tot[j].toFixed(1), 'mid', R.mid[j].toFixed(1), 'lf', R.lf[j].toFixed(1)); } }
