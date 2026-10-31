import {open, sleep, APP} from './h.mjs';
const H = await open({file: APP}), p = H.p;
const r = await p.evaluate(async () => {
  const c = window.__ctx || new AudioContext(); await c.resume();
  const sr = c.sampleRate, o = c.createOscillator(); o.frequency.value = 3000; const g = c.createGain(); g.gain.value = 0.1; o.connect(g);
  const out = {};
  for (const mode of ['none', 'f']) {
    let n = g; const nodes = [];
    if (mode === 'f') for (const [type, f] of [['highpass', 2000], ['highpass', 2000], ['lowpass', 5000], ['lowpass', 5000]]) { const q = c.createBiquadFilter(); q.type = type; q.frequency.value = f; q.Q.value = -3.0103; n.connect(q); n = q; nodes.push(q); }
    const an = c.createAnalyser(); an.fftSize = 2048; n.connect(an); const s = c.createGain(); s.gain.value = 0; an.connect(s); s.connect(c.destination);
    out[mode] = an;
  }
  o.start(); await new Promise(r => setTimeout(r, 500));
  const res = {}; for (const k in out) { const b = new Float32Array(2048); out[k].getFloatTimeDomainData(b); let a = 0; for (const v of b) a += v * v; res[k] = 10 * Math.log10(a / 2048); }
  return res;
});
console.log(r, 'expected', 10 * Math.log10(0.01 / 2));
await H.br.close();
