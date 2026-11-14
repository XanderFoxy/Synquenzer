// IMP2: Zeitanteile der Analyse (Herunterteilen / Merkmale / Rest) für eine Datei
import fs from 'node:fs';
const [file, wav] = process.argv.slice(2), H = fs.readFileSync(file, 'utf8');
const i = H.indexOf('function imp1Core() {'), j = H.indexOf('const IMP1 = {', i);
let src = H.slice(i, j).replace('const F = features(y, fs, prog)', 'const __t1 = Date.now(); const F = features(y, fs, prog); globalThis.__tf = Date.now() - __t1')
  .replace('const T0 = Date.now(), D = down(x, sr)', 'const T0 = Date.now(), D = down(x, sr), __td = globalThis.__td = Date.now() - T0');
const C = new Function(src + '\nreturn imp1Core;')()();
const B = fs.readFileSync(wav); let p = 12, sr = 0, x = null; while (p < B.length) { const id = B.toString('ascii', p, p + 4), n = B.readUInt32LE(p + 4); if (id === 'fmt ') sr = B.readUInt32LE(p + 12); if (id === 'data') { x = new Float32Array(n / 2); for (let k = 0; k < x.length; k++) x[k] = B.readInt16LE(p + 8 + 2 * k) / 32768; } p += 8 + n + (n & 1); }
for (let r = 0; r < 3; r++) { const t = Date.now(); const R = C.analyse(x, sr, {}, () => {}); console.log('gesamt', Date.now() - t, 'down', globalThis.__td, 'features', globalThis.__tf, 'bpm', R.bpm); }
