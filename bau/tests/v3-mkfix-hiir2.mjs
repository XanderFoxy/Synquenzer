import {design, makeDec} from './v3-mkfix-hiir.mjs';
function resp(c, f) { const d = makeDec(c), N = 96000; let re = 0, im = 0, m = 0;
  for (let j = 0; j < N / 2; j++) { const y = d(Math.sin(2 * Math.PI * f * 2 * j / 96000), Math.sin(2 * Math.PI * f * (2 * j + 1) / 96000)); if (j > 4000) { re += y * Math.cos(2 * Math.PI * f * 2 * j / 96000); im += y * Math.sin(2 * Math.PI * f * 2 * j / 96000); m++; } }
  return 20 * Math.log10(2 * Math.hypot(re, im) / m); }
for (const [nc, tbw] of [[4, .1], [4, .12], [5, .1], [4, .14], [3, .14]]) { const c = design(nc, tbw); const fs = [10000, 16000, 18000, 20000, 22000, 26000, 28000, 30000, 34000, 38000, 46000];
  console.log(nc, tbw, fs.map(f => (f / 1000) + 'k:' + resp(c, f).toFixed(f < 24000 ? 3 : 0)).join(' ')); console.log('  ', JSON.stringify(c)); }
