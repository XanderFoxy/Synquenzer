// sammelt alle data-key der Klang-Editoren (VA, FM DX, FELD, WT, MS 2000, Drum SOUND/TIEF) für I2-01
import {open} from './lib.mjs';
export async function domKeys(p) {
  return p.evaluate(async () => {
    const D = SYNQUENZER, out = {}, add = (g, k) => { (out[g] || (out[g] = new Set())).add(k); };
    const grab = g => { for (const x of document.querySelectorAll('[data-key]')) if (x.closest('#sheet, .sheet, #edSheet, body')) add(g, x.dataset.key); };
    D.selectTrack(0);
    for (const eng of ['analog', 'fm6', 'wt', 'mk']) {
      D.setEngine(0, eng); D.openEditor();
      const tabs = eng === 'mk' ? ['geraet', 'spiel', 'fx'] : ['osc', 'filter', 'env', 'lfo', 'mod', 'fx'];
      for (const tb of tabs) {
        ED.tab = tb;
        const subs = eng === 'fm6' && tb === 'osc' ? ['op', 'feld'] : [null];
        for (const sb of subs) {
          if (sb) { ED.sub.osc = sb; if (sb === 'feld') { fmViewSet(0, 'feld'); FXF.t = 0; for (const pg of ['pegel', 'basis', 'amp', 'pit']) { FXF.page = pg; try { buildSynthEd(); } catch (e) {} grab(eng + ':feld'); } continue; } }
          try { buildSynthEd(); } catch (e) {}
          grab(eng);
        }
      }
      D.closeEditor && D.closeEditor();
    }
    D.selectTrack(DRUM_T); D.openEditor();
    for (const tb of ['sound', 'tief', 'kit', 'fx']) { ED.tab = tb; try { buildDrumEd(); } catch (e) {} grab('drum'); }
    const r = {}; for (const g in out) r[g] = [...out[g]].sort(); return r;
  });
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const {b, p, errs} = await open();
  const r = await domKeys(p); for (const g in r) console.log(g, r[g].length, r[g].slice(0, 400).join(' '));
  console.log('errs', errs.slice(0, 5)); await b.close();
}
