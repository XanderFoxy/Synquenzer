import { open } from './lib.mjs';
const {b, p} = await open({w: 428, h: 926});
const r = await p.evaluate(async () => {
  const one = async (comp) => { const oc = new OfflineAudioContext(2, 48000 * 2, 48000); const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 110; const g = oc.createGain(); g.gain.value = .8; o.connect(g);
    let n = g; if (comp) { const c = oc.createDynamicsCompressor(); c.threshold.value = -20; g.connect(c); n = c; } n.connect(oc.destination); o.start(); const b = await oc.startRendering(); return b.getChannelData(0); };
  const res = {};
  for (const comp of [false, true]) { const A = await one(comp), B = await one(comp); let nd = 0, f = -1; for (let k = 0; k < A.length; k++) if (A[k] !== B[k]) { nd++; if (f < 0) f = k; } res[comp ? 'mitKompressor' : 'ohne'] = {nd, first: f}; }
  return res;
});
console.log(JSON.stringify(r)); await b.close();
