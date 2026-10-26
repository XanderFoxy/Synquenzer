// FP-KLANG: the level of the 64 stored waves (peak 1 each, B.6): RMS of mip level 0 (35, 61-64: the 220.27 Hz set) and as played
import {mktab} from './v3-mk2-node.mjs';
const T = mktab(process.argv[2]), out = [];
for (let n = 1; n <= 64; n++) { const t = T.mkTables(T.isOct(n) ? {n, f: 220.27} : {n})[0]; let e = 0; for (let i = 0; i < 2048; i++) e += t[i] * t[i]; out.push([n, 10 * Math.log10(e / 2048)]); }
out.sort((a, b) => a[1] - b[1]);
console.log('RMS dBFS (Spitze 1): leiseste ' + out.slice(0, 4).map(([n, d]) => n + ' ' + d.toFixed(1)).join(', ') + ' · lauteste ' + out.slice(-4).map(([n, d]) => n + ' ' + d.toFixed(1)).join(', ') + ' · Spanne ' + (out[63][1] - out[0][1]).toFixed(1) + ' dB, Säge zum Vergleich −4,8');
