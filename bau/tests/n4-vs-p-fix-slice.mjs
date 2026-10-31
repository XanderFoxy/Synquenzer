// VS-P-fix: Dauer jedes Mess-Häppchens (vpStep) je Stufe für einen 96-s-Take mit Plosiven. node n4-vs-p-fix-slice.mjs <app>
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP; const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); });
await sleep(300);
const r = await p.evaluate(() => { const sr = window.__ctx.sampleRate, N = 96 * sr, b = new AudioBuffer({length: N, numberOfChannels: 1, sampleRate: sr}), d = b.getChannelData(0); let s = 7;
  for (let i = 0; i < N; i++) d[i] = 0.02 * Math.sin(2 * Math.PI * 1000 * i / sr);
  const n = Math.round(0.004 * sr); for (let t = 0.75; t < 95.9; t += 1) { const i0 = Math.round(t * sr); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; d[i0 + j] += 0.95 * Math.sin(Math.PI * j / n) * (s / 2147483647 * 2 - 1); } }
  const out = []; for (let rep = 0; rep < 2; rep++) { const J = vpJob(b); let k = 0; for (;;) { const st = J.st, t0 = performance.now(); const done = vpStep(J, t0 + 20); out.push([rep, st, J.st, +(performance.now() - t0).toFixed(1)]); if (done || ++k > 500) break; } }
  return out; });
const big = r.filter(x => x[3] > 22); console.log(FILE.split('/').slice(-2).join('/'), 'Häppchen', r.length, 'über 22 ms [Lauf, Stufe vorher, nachher, ms]:', JSON.stringify(big), 'max', Math.max(...r.map(x => x[3])));
await H.br.close();
