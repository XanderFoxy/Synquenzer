// VS-P-fix: Hüllkurve in kleinsten Häppchen = am Stück gerechnet (Zustand über die Häppchen-Grenzen), und = Referenz in JS
// (unzerteilte Formel von VS-P). node n4-vs-p-fix-same.mjs <app>
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP; const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); });
await sleep(300);
const r = await p.evaluate(() => { const sr = window.__ctx.sampleRate, N = 30 * sr, b = new AudioBuffer({length: N, numberOfChannels: 1, sampleRate: sr}), d = b.getChannelData(0); let s = 7;
  for (let i = 0; i < N; i++) d[i] = 0.05 * Math.sin(2 * Math.PI * 300 * i / sr);
  const n = Math.round(0.004 * sr); for (let t = 0.75; t < 29.9; t += 0.37 + (t % 1) * 0.5) { const i0 = Math.round(t * sr); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; d[i0 + j] += 0.9 * Math.sin(Math.PI * j / n) * (s / 2147483647 * 2 - 1); } }
  const J1 = vpJob(b); vpStep(J1, Infinity); const R1 = J1.r;
  const J2 = vpJob(b); let k = 0; while (!vpStep(J2, performance.now() - 1)) k++; const R2 = J2.r;
  // Referenz: unzerteilte Formel (VS-P) aus J3.need
  const J3 = vpJob(b); J3.st = 0; while (J3.st < 2) { vpStep(J3, -1); if (J3.st === 3) break; }
  const need = J3.need, nb = need.length, A = Math.max(1, Math.round(VP_ATT * sr / VP_K)), rk = Math.exp(-VP_K / (VP_REL * sr)), e = new Float32Array(nb), env = new Float32Array(nb); let prev = 1;
  for (let q = 0; q < nb; q++) { let h = 1; for (let j = q; j < q + A && j < nb; j++) if (need[j] < h) h = need[j]; const rr = 1 - (1 - prev) * rk; prev = h < rr ? h : rr; e[q] = prev; }
  let sum = A; for (let q = 0; q < nb; q++) { sum += e[q] - (q - A >= 0 ? e[q - A] : 1); const v = sum / A; env[q] = v > 1 ? 1 : v; }
  let dEnv = 0, dRef = 0; for (let q = 0; q < nb; q++) { dEnv = Math.max(dEnv, Math.abs(R1.env[q] - R2.env[q])); dRef = Math.max(dRef, Math.abs(R1.env[q] - env[q])); }
  const a1 = R1.eb.getChannelData(0), a2 = R2.eb.getChannelData(0); let dEb = 0, dLin = 0; for (let j = 0; j < a1.length; j++) dEb = Math.max(dEb, Math.abs(a1[j] - a2[j]));
  // Puffer gegen lineare Interpolation der 16er-Hüllkurve (wie setValueCurveAtTime)
  const D = sr >= 32000 ? 4 : 2, M = 16 / D; for (let j = 0; j < a1.length; j++) { const x = j / M, i = Math.floor(x), f = x - i; if (i + 1 >= nb) break; const v = R1.env[i] * (1 - f) + R1.env[i + 1] * f; dLin = Math.max(dLin, Math.abs(a1[j] + 1 - v)); }
  return {slices: k, segs: [R1.segs.length, R2.segs.length], sameSegs: JSON.stringify(R1.segs) === JSON.stringify(R2.segs), grDb: [R1.grDb, R2.grDb], dEnv, dRef, dEb, dLin, ebRate: R1.eb.sampleRate, ebLen: R1.eb.length};
});
console.log(FILE.split('/').slice(-2).join('/'), JSON.stringify(r));
console.log(r.dEnv === 0 && r.dEb === 0 && r.sameSegs && r.dRef < 1e-6 && r.dLin < 2e-4 ? '✓ gleich' : '✗ verschieden');
await H.br.close();
