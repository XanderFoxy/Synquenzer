// QA musiker: Kosten von setValueCurveAtTime in Chromium (Länge der Kurve) – Grundlage für vpLim
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
const r = await p.evaluate(() => { const c = window.__ctx, out = {};
  for (const n of [100, 500, 2500, 10000, 30000]) { const a = new Float32Array(n).fill(0.5), t = []; for (let k = 0; k < 5; k++) { const g = c.createGain(), t0 = performance.now(); g.gain.setValueCurveAtTime(a, c.currentTime + 1, n * 16 / c.sampleRate); t.push(performance.now() - t0); } out[n] = t.map(x => +x.toFixed(2)); }
  return out; });
console.log(JSON.stringify(r));
await H.br.close();
