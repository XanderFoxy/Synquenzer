import fs from 'fs';
const html = fs.readFileSync('../voxr1b/index.html', 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const K = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32768; return {x, sr}; };
const B = wav(RV + 'imp2rs/vocadito_10@48000.wav'), C = wav(RV + 'imp2rs/vocadito_14@48000.wav'), v = new Float32Array(B.x.length + C.x.length); v.set(B.x); v.set(C.x, B.x.length); const sr = 48000;
let pk = 0; for (const q of B.x) pk = Math.max(pk, Math.abs(q)); console.log('peak B', pk.toFixed(3), 'len B s', (B.x.length / sr).toFixed(2));
const db = p => 10 * Math.log10(p + 1e-20), rmsDb = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return db(s / Math.max(1, b - a)); };
// zero runs in v
let z = 0, runs = []; for (let i = 0; i <= v.length; i++) { if (i < v.length && v[i] === 0) z++; else { if (z > 480) runs.push([(i - z) / sr, z / sr]); z = 0; } } console.log('digitale Stille >10ms', JSON.stringify(runs.map(r => r.map(q => +q.toFixed(2)))));
const L = K.done(K.roomLearn(v, sr)); console.log('gelernt', L && L.db, L && L.floor, L && L.none);
const H = 480, Lo = []; for (let p = 0; p + H <= v.length; p += H) Lo.push(rmsDb(v, p, p + H));
for (const t of [0.05, 0.3, 1, 2, 4, 6, 8, 9.05, 9.2, 10, 15, 20]) console.log('t', t, rmsDb(v, Math.round(t * sr), Math.round(t * sr) + 4800).toFixed(1));
