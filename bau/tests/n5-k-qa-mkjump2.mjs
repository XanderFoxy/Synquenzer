// QA K1-03 MS 2000 Dual: a T2 entry jumps to timbre 2 (P.tim 2) and its page
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({viewport: {width: 390, height: 844}, touch: true, mobile: true});
const r = await p.evaluate(async () => {
  mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const A = SYNQUENZER, t = 2, out = [];
  for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') { loadPreset(t, id); const e = A.k1Mods(t).find(e => e.key.startsWith('t.1.')); if (e) {
    selectTrack(t); ED.tab = 'geraet'; openEditor(); await new Promise(r => setTimeout(r, 250));
    const res = A.k1Jump(t, e.key); await new Promise(r => setTimeout(r, 200));
    const lcd = [...document.querySelectorAll('.mklcd, [class*="lcd"]')].map(e => e.innerText).filter(Boolean).join(' / ').slice(0, 90);
    out.push({id, name: sndOf(t).name, mode: sndOf(t).p.mk.mode, key: e.key, lab: e.src + ' → ' + e.dst, res, tim: MKUI.P.tim, lcd}); if (out.length >= 3) break; } }
  return out;
});
for (const o of r) console.log(JSON.stringify(o));
console.log('errs', errs);
await b.close();
