import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8'); const K = new Function(src.slice(src.indexOf('function vr1Make() {'), src.indexOf('\nconst VXR1 = {')) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
const db = p => 10 * Math.log10(p + 1e-30);
for (const tk of [0, 1, 2]) {
  const A = wav(RV + SRC[tk]), sr = A.sr, v = A.x, n = v.length, H = 441, nf = Math.floor(n / H), L = []; for (let j = 0; j < nf; j++) { let s = 0; for (let i = j * H; i < j * H + H; i++) s += v[i] * v[i]; L.push(db(s / H)); }
  const LV = L.filter(q => q > -110).sort((a, b) => a - b), fl = LV[Math.floor(0.1 * LV.length)];
  // ruhige Stellen ≥ 0,5 s finden, mittig 0,2–0,4 s zu Null setzen (Schnitt)
  const holes = []; let s = -1; for (let j = 0; j <= nf; j++) { const q = j < nf && L[j] < fl + 4; if (q && s < 0) s = j; if (!q && s >= 0) { if (j - s >= 30 && holes.length < 5) { const c = (s + j) / 2 * H, d = Math.min(0.3, (j - s) * H / sr - 0.1); holes.push([Math.round(c - d * sr / 2), Math.round(c + d * sr / 2)]); } s = -1; } }
  const x = Float32Array.from(v); for (const [a, b] of holes) x.fill(0, a, b);
  const t0 = Date.now(), r = K.done(K.run(x, sr, {steps: {room: {}}})), ms = Date.now() - t0, R = r.info.room;
  const band = (y, a, b) => { let s = 0; for (let i = a; i < b; i++) s += y[i] * y[i]; return db(s / (b - a)); };
  const res = holes.map(([a, b]) => { const R0 = Math.round(0.012 * sr); const nb = db((Math.pow(10, band(v, Math.max(0, a - 6615), Math.max(1, a)) / 10) + Math.pow(10, band(v, b, Math.min(n, b + 6615)) / 10)) / 2); return {orig: +band(v, a + R0, b - R0).toFixed(1), nachbar: +nb.toFixed(1), nach: +band(r.y, a + R0, b - R0).toFixed(1)}; });
  let same = true; for (let i = 0; i < n && same; i++) if (!holes.some(([a, b]) => i >= a && i < b) && r.y[i] !== x[i]) same = false;
  console.log('take', tk, 'raumton', fl.toFixed(1), 'gelernt', R.learned && R.learned.db, 'lücken', holes.length, 'gefüllt', R.holes.length, JSON.stringify(res), 'bitgleich', same, ms + ' ms');
}
