// Alte Formate unverändert: dieselben Bilder (16:9 Song/Matrix/Auto, 9:16 Kamera / Ganz mit Balken, Spur-Bild) aus der Basis
// R-4261 und aus VV4-A, pixelgleich; dazu das Video-Blatt-Standbild bei 9:16 [Kamera]
import { open, songWithChords, report, ROOT } from './lib.mjs';
import path from 'path';
const BASE = path.join(ROOT, 'bau/snapshots/R-4270.html');
const CASES = [['16:9', 'song', 'kamera'], ['16:9', 'matrix', 'kamera'], ['16:9', 'auto', 'kamera'], ['9:16', 'auto', 'kamera'], ['9:16', 'song', 'kamera'], ['9:16', 'matrix', 'balken'], ['9:16', 'auto', 'balken'], ['9:16', 'spur:0', 'kamera'], ['16:9', 'spur:4', 'kamera']];
const TS = [0.4, 3.1, 6.7, 9.9];
async function shots(app) {
  const {b, p, errs} = await open({app});
  await songWithChords(p);
  if (app == null) await p.evaluate(() => { VV.noMtr = true; });   // Stage 4.28.0: ohne Pegel (VV4-F) – die Balken sind gewollt neu
  await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 6}}));
  const o = {};
  for (const [fmt, v, cam] of CASES) for (const t of TS) o[[fmt, v, cam, t].join('|')] = await p.evaluate(([t, v, fmt, cam]) => SYNQUENZER.vvShot(t, v, fmt, cam), [t, v, fmt, cam]);
  await b.close(); return {o, errs};
}
const A = await shots(BASE), B = await shots();
const res = {checks: {}, n: 0, diff: []};
for (const k in A.o) { res.n++; if (A.o[k] !== B.o[k]) res.diff.push(k); }
// Stage 4.28.0 (Regel 26): Auto (Auto-Regie 2, VV4-D) und das Spur-Bild (Piano-Roll/Drum-Sequenzer, VV4-C) sind gewollt neu
const neu = k => /\|auto\||\|spur:/.test(k);
// Song/Matrix/Balken: neu ist nur die Pegel-Leiste je Spur (VV4-F, auch leer sichtbar) – Sichtvergleich bilder/vergleich-4270-oben-4280-unten-song.png
const pegel = k => /\|(song|matrix)\|/.test(k);
res.ueberholt = res.diff.filter(neu); res.pegel = res.diff.filter(k => !neu(k) && pegel(k)); res.diff = res.diff.filter(k => !neu(k) && !pegel(k));
res.checks['bilder-gleich ohne Pegel, ohne Auto/Spur (' + res.n + ')'] = res.diff.length === 0 && res.n === CASES.length * TS.length;
res.checks.konsole = A.errs.length === 0 && B.errs.length === 0; res.errs = [A.errs, B.errs];
const bad = report('vv4a-alt', res); if (res.diff.length) console.log(res.diff);
process.exit(bad ? 1 : 0);
