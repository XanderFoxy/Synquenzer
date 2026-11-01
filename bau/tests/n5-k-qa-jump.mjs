// QA K1-03 „Tipp springt zum Ziel-Regler“: for every route destination and every built-in entry, on VA, FM and WT:
// after k1Jump the target knob [data-key] is on screen and lit (or MOD tab with the route marked)
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({viewport: {width: 390, height: 844}, touch: true, mobile: true});
const r = await p.evaluate(async () => {
  const A = SYNQUENZER, t = 3, out = [];
  const dsts = Object.keys(MDST);
  for (const [eng, id] of [['analog', 'f-init-analog'], ['fm6', 'f-init-fm'], ['wt', 'f-init-tabelle']]) {
    loadPreset(t, id); selectTrack(t); openEditor(); await new Promise(r => setTimeout(r, 150));
    for (const d of dsts) {
      if (eng !== 'fm6' && (d === 'fmbright' || /^op\d/.test(d))) continue;
      const s = A.getSound(t); s.mods = [{src: 'lfo1', dst: d, amt: .3}]; s.p.fenv = .5; s.p.kt = .5; if (eng === 'analog') s.p.analog = .2; A.setSound(t, s);
      ED.tab = 'osc'; safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 30));
      for (const e of A.k1Mods(t)) {
        if (e.kind === 'route' && !e.key.endsWith(':' + d)) continue;
        if (e.kind !== 'route' && d !== 'cutoff') continue;   // built-ins once
        const res = A.k1Jump(t, e.key); await new Promise(r => setTimeout(r, 60));
        const want = e.kind === 'p' ? e.key.slice(2) : (K1_RK[d] || MDST_PD[d]);
        const c = want ? EL.synthSheet.querySelector('.sh-body [data-key="' + want + '"]') : null;
        let vis = false; if (c) { const q = c.getBoundingClientRect(); vis = q.width > 0 && q.height > 0 && q.top >= 0 && q.bottom <= innerHeight; }
        out.push({eng, d, key: e.key, to: res, want: want || '-', knob: !!c, visible: vis, lit: !!(c && c.classList.contains('k1hl')), modHl: ED.modHl || null, tab: ED.tab, sub: ED.sub[ED.tab]});
      }
    }
  }
  return out;
});
const bad = r.filter(x => x.want !== '-' && !(x.knob && x.visible && x.lit));
console.log('total', r.length, 'with knob expected', r.filter(x => x.want !== '-').length);
console.log('BAD', JSON.stringify(bad, null, 0));
console.log('noKnob', JSON.stringify(r.filter(x => x.want === '-').map(x => [x.eng, x.d, x.to, x.modHl]), null, 0));
console.log('errs', errs);
await b.close();
