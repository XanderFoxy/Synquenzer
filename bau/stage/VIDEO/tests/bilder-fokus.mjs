// Stage VIDEO 4.28.0: Beispielbilder der neuen Bild-Wahl (App, Tastatur, Fokus Clip-Zelle / Tastatur / Teil-Kopf / Übergang)
// in 9:16 und 16:9 → bau/stage/VIDEO/bilder/wahl-*.png. Aufruf (Repo-Wurzel): node bau/stage/VIDEO/tests/bilder-fokus.mjs
import { open } from './VV4CE/lib.mjs';
import fs from 'fs'; import path from 'path';
const BILD = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../bilder') + '/';
const {b, p, errs} = await open();
await p.evaluate(() => { S.bpm = 120; const nt = NT(), L = Array.from({length: nt}, () => []); L[1] = [{bar: 0, slot: 0}]; L[2] = [{bar: 2, slot: 0}]; L[DRUM_T] = [{bar: 0, slot: 0}];
  SYNQUENZER.setSong({bars: 8, lanes: L, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]}); });
await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 8}}));
for (const fmt of ['9:16', '16:9']) for (const [v, t, tt] of [['app', null, 3.3], ['tast', null, 3.3], ['f-zelle', 1, 1.2], ['f-tast', null, 3.3], ['f-teil', null, 8.4], ['f-ue', null, 7.8]]) {
  const b64 = await p.evaluate(([tt, v, t, fmt]) => SYNQUENZER.vv4Pic(tt, v, t, fmt), [tt, v, t, fmt]);
  fs.writeFileSync(BILD + `wahl-${v}-${fmt.replace(':', 'x')}.png`, Buffer.from(b64, 'base64'));
}
console.log('bilder-fokus: Konsolenfehler', errs.length, errs.slice(0, 3));
await b.close();
