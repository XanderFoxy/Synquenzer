import { launch } from './n5-h-lib.mjs';
const {b, p, errs} = await launch();
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), out = [];
  const f = window.histCapture; window.histCapture = function (it) { const a = performance.now(); const x = f.apply(this, arguments); out.push([it.e.kind, +(performance.now() - a).toFixed(2), it.how]); return x; };
  const fo = window.histOpsAt; const po = []; window.histOpsAt = function (P, ops) { const a = performance.now(); const x = fo.apply(this, arguments); po.push([P.join('/'), +(performance.now() - a).toFixed(2)]); return x; };
  Q.launchScene(0); await sl(500); selectTrack(3); Q.openEditor(); await sl(300);
  for (let g = 0; g < 12; g++) {
    const s = Q.getSound(3); s.p.cutoff = 500 + g * 100; Q.setSound(3, s); await sl(20);
    const c = Q.getClip(1, 0) || {len: 1, notes: []}; c.notes = c.notes.slice(); c.notes.push({p: 60 + g, s: g / 4, l: .25, v: .8}); Q.setClip(1, 0, c); await sl(20);
    Q.toggleStep(g % 8, g % 16, 0); await sl(20);
  }
  Q.stop();
  return {out, po: po.sort((a, b) => b[1] - a[1]).slice(0, 10)};
});
console.log(JSON.stringify(r.out)); console.log(JSON.stringify(r.po));
await b.close();
