// G9-01 / G9-12: Silbentrennung gegen die Prüflisten (M-SILBE)
import fs from 'fs'; import {createRequire} from 'module'; const require = createRequire(import.meta.url);
const {g9Make} = require('../g9-kern.js');
const HERE = new URL('.', import.meta.url).pathname, MU = process.env.G9_MUSTER || HERE + '../../../../vendor/g9/syl/';
const list = l => fs.readFileSync(HERE + 'daten/silben-' + l + '.tsv', 'utf8').trim().split('\n').map(r => r.split('\t'));
const res = {};
for (const mode of ['muster', 'einfach']) {
  const K = g9Make();
  if (mode === 'muster') { for (const [l, f] of [['de', 'de-x-syllable'], ['en', 'en-us']]) if (!K.sylLoad(l, fs.readFileSync(MU + f + '.wasm'))) throw new Error('Muster ' + l); }
  for (const l of ['de', 'en']) {
    let nOk = 0, bOk = 0, n = 0, pOk = 0; const bad = [];
    for (const [w, ref] of list(l)) {
      n++; const r = K.sylX(w, l), got = r.s.join('-'), rc = ref.split('-').length;
      if (r.s.length === rc) nOk++; if (got === ref) bOk++; else if (bad.length < 400) bad.push(w + ' ' + got + ' ≠ ' + ref);
      if (mode === 'einfach' ? r.p === 0.5 : r.p == null) pOk++;
    }
    res[mode + '-' + l] = {n, anzahl: +(100 * nOk / n).toFixed(1), grenzen: +(100 * bOk / n).toFixed(1), p: +(100 * pOk / n).toFixed(1), bad};
  }
}
// Nutzer-Bindestriche 100 %
const K = g9Make(); let hy = 0, hn = 0;
for (const l of ['de', 'en']) for (const [, ref] of list(l)) if (ref.includes('-')) { hn++; if (K.syl(ref, l).join('-') === ref) hy++; }
res.bindestrich = +(100 * hy / hn).toFixed(1);
const show = process.argv.includes('-v');
for (const [k, v] of Object.entries(res)) if (v.bad) { console.log(k, 'Anzahl', v.anzahl + ' %', 'Grenzen', v.grenzen + ' %', 'p', v.p + ' %'); if (show) console.log('  ' + v.bad.join('\n  ')); }
console.log('Bindestriche', res.bindestrich + ' %');
const pass = res['muster-de'].anzahl >= 98 && res['muster-de'].grenzen >= 95 && res['muster-en'].anzahl >= 95 && res.bindestrich === 100 && res['einfach-de'].anzahl >= 90 && res['einfach-en'].anzahl >= 85;
fs.writeFileSync(HERE + 'ergebnis-silben.json', JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.bad ? {n: v.n, anzahl: v.anzahl, grenzen: v.grenzen, p: v.p, fehler: v.bad.length} : v])), null, 1));
console.log(pass ? 'G9-01/G9-12 BESTANDEN' : 'G9-01/G9-12 NICHT bestanden'); process.exitCode = pass ? 0 : 1;
