// typische Fehler 2 / MK-P Umfang 4: the 2 x 16 display shows name and value; list values cut?
import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch(); const page = await open(b, 'X'); await openMk(page);
const r = await page.evaluate(() => {
  const cut = [];
  for (const mode of [0, 3]) { SYNQUENZER.mkSet(0, 'mode', mode);
    const PG = MKUI.pages();
    for (let k = 0; k < PG.length; k++) for (let j = 0; j < PG[k][3].length; j++) {
      MKUI.view({modus: 'edit', seite: k, cursor: j}); const d = MKUI.curItem(); if (!d || !d.p || d.src || d.act || d.view || !d.L) continue;
      const [lo, hi] = MKUI.range(d); const v0 = MKUI.get(d);
      for (let v = lo; v <= hi; v++) { try { MKUI.setv(d, v, false); } catch (e) { continue; } const line2 = MKUI.lcdLines()[1]; const full = MKUI.fmtv(d, v)[1].split(' · ')[0];
        if (!line2.includes(full)) cut.push(PG[k][0] + ' ' + (d.l || '') + ': "' + line2 + '" (value ' + full + ')'); }
      try { MKUI.setv(d, v0, false); } catch (e) {}
    } }
  return cut;
});
console.log('cut list values on the 2x16 display:', r.length); for (const x of r) console.log('  ' + x);
await b.close();
