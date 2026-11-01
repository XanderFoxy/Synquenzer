import {launch} from './n5-k-blib.mjs';
const {b, p} = await launch({viewport: {width: 390, height: 844}, touch: true, mobile: true});
console.log(JSON.stringify(await p.evaluate(async () => { const A = SYNQUENZER; loadPreset(1, 'f-init-fm'); A.setFmPeg(1, {r: [60, 40, 99, 99], l: [62, 50, 50, 50]}); const x = A.fmxFromFm6(sndOf(1).p.fm6); x.ops[0].lfoFm = 18; A.setFmx(1, x);
  selectTrack(1); openEditor(); ED.tab = 'env'; ED.sub.envfm = 'peg'; safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 300));
  const key = A.k1Mods(1).find(e => /lfoFm/.test(e.key)).key; const res = A.k1Jump(1, key); const out = [res]; const e0 = EL.synthSheet.querySelector('.fxr[data-key="fmx.1.lfoFm"]'); out.push(['e0', !!e0, e0 && e0.className, e0 && e0.isConnected]);
  for (const ms of [0, 50, 200, 600]) { await new Promise(r => setTimeout(r, ms)); out.push([ms, [...EL.synthSheet.querySelectorAll('.fxr')].map(e => e.dataset.key).join(','), [...EL.synthSheet.querySelectorAll('.k1hl')].length, FXF.page, FXF.focus, e0 && e0.isConnected, e0 && e0.className]); }
  return out; })));
await b.close();
