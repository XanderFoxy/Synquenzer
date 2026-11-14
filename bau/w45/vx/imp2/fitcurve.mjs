// Raster-Treue (wie rv1-test: Viertel + ½·Achtel) einer Einsatz-Liste über 60–180 BPM; Rang eines Tempos (und ½×/2×)
import fs from 'node:fs';
const [csv, ...bp] = process.argv.slice(2);
const ons = fs.readFileSync(csv, 'utf8').trim().split('\n').map(l => +l.split(',')[0]).filter(isFinite);
const fit = (bpm) => { const z = P => { let re = 0, im = 0; for (const t of ons) { re += Math.cos(2 * Math.PI * t / P); im += Math.sin(2 * Math.PI * t / P); } return Math.hypot(re, im) / ons.length; }; return z(60 / bpm) + .5 * z(30 / bpm); };
const sc = []; for (let t = 60; t <= 180; t += .5) sc.push([t, fit(t)]);
console.log('Einsätze', ons.length, 'beste', sc.slice().sort((a, b) => b[1] - a[1]).slice(0, 8).map(z => z[0] + ':' + z[1].toFixed(2)).join(' '));
for (const b of bp.map(Number)) { const m = Math.max(...[b, b / 2, b * 2].filter(v => v >= 60 && v <= 180).map(fit)); console.log(b, 'treue', fit(b).toFixed(3), 'mit ½×/2×', m.toFixed(3), 'rang', (sc.filter(z => z[1] > m).length / sc.length * 100).toFixed(1) + ' %'); }
