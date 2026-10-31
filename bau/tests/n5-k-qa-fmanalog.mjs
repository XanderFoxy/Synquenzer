import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({viewport: {width: 390, height: 844}, touch: true, mobile: true});
const r = await p.evaluate(async () => {
  const A = SYNQUENZER, t = 1; loadPreset(t, 'f-dx-tines'); const s = A.getSound(t); s.p.analog = .2; A.setSound(t, s); selectTrack(t); openEditor(); await new Promise(r => setTimeout(r, 200));
  const where = [];
  for (const [tab] of [['osc'], ['filter'], ['env'], ['lfo'], ['mod'], ['fx']]) { for (const [sub] of (subTabsFor(tab, 'fm6') || [[null]])) { ED.tab = tab; if (sub) ED.sub[tab] = sub; try { safeRebuild(buildSynthEd); } catch (e) {} await new Promise(r => setTimeout(r, 30)); if (EL.synthSheet.querySelector('.sh-body [data-key="analog"]')) where.push(tab + '/' + sub); } }
  const e = A.k1Mods(t).find(e => e.key === 'p:analog'); ED.tab = 'osc'; safeRebuild(buildSynthEd);
  const to = e ? A.k1Jump(t, e.key) : null; await new Promise(r => setTimeout(r, 60));
  return {entry: e && (e.src + ' → ' + e.dst + ' [' + e.amt + ']'), analogKnobOn: where, jumpTo: to, tab: ED.tab};
});
console.log(JSON.stringify(r)); console.log('errs', errs);
await b.close();
