// Prüfer-Sonde SPKFIX (1) Zeit: „In Ebene“ aus einer umgesetzten Audio-Ebene bei langem Lied. Aufruf: node k-zeit.mjs <html> <sek>
import {load} from '../spkfix/sonde/kern.mjs';
const {call} = load(process.argv[2]); const sr = 48000, sek = +process.argv[3] || 60, n = sr * sek, L = new Float32Array(n);
const formant = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2), fs = [196, 220, 246.94, 261.63, 293.66, 329.63];
for (let a = 0.5, k = 0; a < sek - 1; a += 1.5, k++) { const b = a + 1, f = fs[k % 6]; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, env = Math.min(1, (t - a) / 0.02, (b - t) / 0.03); let v = 0; for (let h = 1; h <= 12 && h * f < 9000; h++) v += formant(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); L[i] += 0.12 * env * v; } }
const doc = (await call('create', {name: 'Z', sr, ch: [L, L], grid: {bpm: 120, off: 0, ts: '4/4'}})).meta.id, C = (op, a) => call(op, Object.assign({doc}, a));
await C('transfer', {von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0, t1: sek, f0: 150, f1: 9500}});
await C('noten', {lid: 'L1'}); const N = (await C('open', {})).meta.teil2.notes.L1 || [];
let t0 = Date.now(); await C('s6plan', {lid: 'L1', mv: [{id: N[0].id, dm: 1, dt: 0}]}); const msPlan = Date.now() - t0;
const ms = []; for (let r = 0; r < 3; r++) { const a = 2 + r * 1.5; t0 = Date.now(); const tr = await C('transfer', {von: 'L1', nach: r ? 'L2' : {art: 'lead', name: 'X'}, sel: {art: 'rect', t0: a - 0.1, t1: a + 1.1, f0: 150, f1: 9500}}); ms.push([Date.now() - t0, tr.neu6 || 0]); }
console.log(JSON.stringify({sek, noten: N.length, msErstesAnwenden: msPlan, msInEbene: ms}));
