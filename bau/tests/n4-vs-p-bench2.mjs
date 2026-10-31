import {open} from './n4-vs-p-h.mjs';
const H = await open({file: process.argv[2]}), p = H.p;
const r = await p.evaluate(() => {
  const sr = 48000, n = sr * 96, b = new AudioBuffer({length: n, numberOfChannels: 1, sampleRate: sr}), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = 0.05 * Math.sin(i * 0.05) * (1 + Math.sin(i * 1e-4));
  const out = [];
  for (let k = 0; k < 3; k++) {
    const J = vpJob(b); let t = performance.now(); const st = [];
    while (J.st === 0) { vpStep(J, performance.now() + 1e9); } st.push(performance.now() - t); t = performance.now();
    if (J.st !== 3) vpStep(J, 1e15); st.push(performance.now() - t);
    out.push(st.map(x => +x.toFixed(1)).join('/') + ' st=' + J.st + ' g=' + J.r.gDb);
  }
  return out;
});
console.log(r.join('\n')); await H.br.close();
