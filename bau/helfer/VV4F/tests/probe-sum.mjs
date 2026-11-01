import { open } from './lib.mjs';
const {b, p} = await open({w: 428, h: 926});
const r = await p.evaluate(async () => {
  const one = async n => { const oc = new OfflineAudioContext(1, 48000, 48000), sum = oc.createGain(); for (let i = 0; i < n; i++) { const o = oc.createOscillator(), g = oc.createGain(); o.frequency.value = 100 + i * 37.3; g.gain.value = .3; o.connect(g); g.connect(sum); o.start(); } sum.connect(oc.destination); return (await oc.startRendering()).getChannelData(0); };
  const res = {};
  for (const n of [1, 2, 3, 6]) { let diff = 0; const A = await one(n); for (let k = 0; k < 6; k++) { const B = await one(n); for (let j = 0; j < A.length; j++) if (A[j] !== B[j]) { diff++; break; } } res[n + ' Eingänge'] = diff + '/6 Läufe anders'; }
  return res;
});
console.log(JSON.stringify(r)); await b.close();
