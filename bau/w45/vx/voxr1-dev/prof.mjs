import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8'); const K = new Function(src.slice(src.indexOf('function vr1Make() {'), src.indexOf('\nconst VXR1 = {')) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const b = fs.readFileSync(RV + 'vocadito_1.wav'); let o = 12, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
const v = new Float32Array(d.length >> 1); for (let i = 0; i < v.length; i++) v[i] = d.readInt16LE(2 * i) / 32767; const sr = 44100, L = 180 * sr, x = new Float32Array(L); for (let i = 0; i < L; i++) x[i] = v[i % v.length];
const T = (nm, f) => { const t = Date.now(); const r = f(); console.log(nm, Date.now() - t, 'ms'); return r; };
const Fe = T('feats', () => K.done(K.feats(x, sr)));
T('humFind', () => K.done(K.humFind(x, sr, Fe)));
T('clickScan', () => K.done(K.clickScan(x, sr, {})));
T('breathFind', () => K.done(K.breathFind(x, sr, Fe, {})));
T('plopFind', () => K.plopFind(Fe, {}));
const y = Float32Array.from(x);
T('clicks2', () => K.done(K.clicks2(y, sr, {})));
T('roomLearn', () => K.done(K.roomLearn(x, sr)));
T('hum', () => K.done(K.hum(y, y, sr, {f0: 50, n: 7})));
T('hp', () => K.done(K.hp(y, y, sr, 80)));
