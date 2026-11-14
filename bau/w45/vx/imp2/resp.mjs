// IMP2: Kennlinie des Herunterteilens (alt/neu) je Eingangsrate – Sinus-Pegel nach dem Umrechnen, Laufzeit
import fs from 'node:fs';
const ld = f => { const H = fs.readFileSync(f, 'utf8'), i = H.indexOf('function imp1Core() {'), j = H.indexOf('const IMP1 = {', i); return new Function(H.slice(i, j) + '\nreturn imp1Core;')()(); };
const [A, B] = process.argv.slice(2).map(ld);
const fr = [100, 1000, 2000, 3000, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 10000, 15000, 20000];
for (const sr of [22050, 44100, 48000, 96000]) {
  const row = [];
  for (const f of fr) { if (f >= sr / 2) { row.push('   -  '); continue; } const n = sr * 2, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = Math.sin(2 * Math.PI * f * i / sr);
    const g = C => 20 * Math.log10(C.down(x, sr).rms / Math.SQRT1_2); row.push(g(A).toFixed(1).padStart(6) + '/' + g(B).toFixed(1).padStart(6)); }
  console.log(String(sr).padStart(6), row.join(' '));
}
console.log('Hz    ', fr.map(f => String(f).padStart(13)).join(' '));
for (const sr of [44100, 48000, 96000]) { const x = new Float32Array(sr * 180); for (let i = 0; i < x.length; i++) x[i] = Math.sin(i * .01) * .3 + Math.sin(i * .37) * .1;
  let t = Date.now(); A.down(x, sr); const ta = Date.now() - t; t = Date.now(); B.down(x, sr); console.log(`180 s bei ${sr}: alt ${ta} ms, neu ${Date.now() - t} ms`); }
