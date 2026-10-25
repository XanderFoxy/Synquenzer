import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true});
  const ns = [64, 67, 71, 74, 66].map((n, i) => ({t: i * .5, d: .4, n, v: .8}));
  Q.setClip(0, 0, {len: 1, notes: ns});
  await new Promise(r => setTimeout(r, 600));
  Q.play(); Q.launchScene(0); Q.setKbMode('transpose');
  const res = {};
  for (const ch of [[60], [62], [69], [60, 64, 67], [64,67,71]]) { await Q.chord(ch, 120); await new Promise(r => setTimeout(r, 300));
    res[ch.join('-')] = {outs: [64, 66, 67, 69, 71, 72, 74].map(n => Q.outPitch(0, n, null, Q.getClip(0,0).key)), tl: Q.timeline().slice(-1)[0], car: Q.runtime().carrier}; }
  return {key: Q.getClip(0,0).key, res};
});
console.log(JSON.stringify(r, null, 0), errs);
await b.close();
