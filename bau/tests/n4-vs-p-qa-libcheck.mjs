import {lufs, truePeakDb} from './n4-vs-p-lib.mjs';
const sr = 48000, n = sr * 5, x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = Math.sin(2 * Math.PI * 997 * i / sr);
console.log('mono 997 Hz amp 1:', lufs([x], sr).lufs, '(ref -3.01)');
console.log('stereo L=R amp 1:', lufs([x, x], sr).lufs, '(ref 0.00)');
const y = x.map(v => v * 0.1); console.log('mono amp .1:', lufs([y], sr).lufs, '(ref -23.01)');
// true-peak: sine at fs/4 with 45 deg phase -> sample peak .707, true peak 1
const z = new Float32Array(sr); for (let i = 0; i < sr; i++) z[i] = Math.sin(2 * Math.PI * (sr / 4) * i / sr + Math.PI / 4);
console.log('TP fs/4 sine 45deg:', truePeakDb([z]), '(ref ~0.0, sample peak -3.01)');
