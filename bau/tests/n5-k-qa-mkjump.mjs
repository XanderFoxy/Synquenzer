// QA K1-03 MS 2000: every kind of entry (VIB, PATCH 1-4, EG1/KBD/VEL -> Cutoff, KBD -> Amp, Mod-Sequenz), T1 and T2:
// Tipp -> GERÄT with a page or a plate section; the LCD shows the value
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({viewport: {width: 390, height: 844}, touch: true, mobile: true});
const r = await p.evaluate(async () => {
  mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const A = SYNQUENZER, t = 2, kinds = {};
  for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') { loadPreset(t, id); for (const e of A.k1Mods(t)) { const k = e.path.replace(/\d+/g, 'n'); if (!kinds[k]) kinds[k] = [id, e.key, e.src + ' → ' + e.dst]; } }
  const out = [];
  for (const k in kinds) {
    const [id, key, lab] = kinds[k]; loadPreset(t, id); selectTrack(t); ED.tab = 'geraet'; openEditor(); await new Promise(r => setTimeout(r, 250));
    const res = A.k1Jump(t, key); await new Promise(r => setTimeout(r, 200));
    const lcd = [...document.querySelectorAll('.mklcd, [class*="lcd"]')].map(e => e.innerText).filter(Boolean).join(' / ').slice(0, 80);
    out.push({k, id, lab, res, mode: MKUI.P.mode, tim: MKUI.P.tim, tab: MKUI.P.tab, lcd});
  }
  return out;
});
for (const o of r) console.log(JSON.stringify(o));
console.log('errs', errs);
await b.close();
