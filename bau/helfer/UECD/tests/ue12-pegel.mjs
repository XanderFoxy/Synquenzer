// UE-12: alle 12 Werks-Übergänge in allen 7 Kits (offline, Video-Weg): Spitze ≤ −1 dBFS und ≤ Groove-Spitze + 1 dB,
// Lautheit ±3 LU zum Groove davor (gleiche Taktstelle einen Takt früher), kein Treffer außerhalb der Länge (Eins erlaubt).
// Aufruf: node ue12-pegel.mjs [dens|all] [dir]   → schreibt tests/out/ue12.json
import {open, song, render, pcm, kWeight, lufs, peakDb, ok, KITS, DIR} from './lib.mjs';
import fs from 'fs';
const DENS = process.argv[2] && process.argv[2] !== 'all' ? [+process.argv[2]] : [0, 1, 2];
const DIRS = process.argv[3] ? process.argv[3].split(',') : ['auto', 'auf', 'ab'];
const {b, p, errs} = await open();
const lib = await p.evaluate(() => window.SYNQUENZER.ueLib('ue'));
const res = [], rows = [];
let fails = 0;
for (const kit of KITS) for (const dens of DENS) for (const dir of DIRS) {
  if (dir !== 'auto' && dens !== 1) continue;                     // Richtung: bei mittlerer Dichte; Dichten: bei Auto (= gleich)
  const marks = await song(p, {kit, parts: lib.length + 1, lenBars: 4});
  await p.evaluate(() => window.SYNQUENZER.setTrackFx(4, 'vol', .5));
  const placed = await p.evaluate(([lib, marks, dens, dir]) => lib.map((w, k) => ({src: w.id, id: window.SYNQUENZER.ueAdd(w.id, {m: marks[k + 1].id}, {dens, dir}), edge: marks[k + 1].a * 4})), [lib, marks, dens, dir]);
  const list = await p.evaluate(() => window.SYNQUENZER.ueList());
  const r = await render(p, 0, (lib.length + 1) * 4), spb = 60 / r.bpm;
  const P = await pcm(p, 0, r.songSec), kw = kWeight([P.L, P.R], P.sr);
  for (const pl of placed) {
    const u = list.find(x => x.id === pl.id), w = lib.find(x => x.id === pl.src);
    const s = pl.edge + u.a, L = Math.max(u.len, 1), e = pl.edge + u.a + u.len;
    const tF0 = s * spb, tF1 = (s + L) * spb, tG0 = (s - 4) * spb, tG1 = (s - 4 + L) * spb;
    const lf = lufs(kw, P.sr, tF0, tF1), lg = lufs(kw, P.sr, tG0, tG1), pf = peakDb([P.L, P.R], P.sr, tF0, tF1 + .25 * spb), pg = peakDb([P.L, P.R], P.sr, tG0 - 4 * spb, tG1);
    const hits = r.log.filter(x => x.src === 'ue' && x.beat > pl.edge - 15.5 && x.beat < pl.edge + 3.5), out = hits.filter(x => x.beat < s - 1e-3 || x.beat > e + 1e-3);
    const row = {kit, dens, dir, src: w.id, name: w.name, L: u.len, n: hits.length, lu: +(lf - lg).toFixed(2), lf: +lf.toFixed(2), lg: +lg.toFixed(2), pk: +pf.toFixed(2), pkG: +pg.toFixed(2), out: out.length};
    const good = row.n > 0 && Math.abs(row.lu) <= 3 && row.pk <= -1 && row.pk <= row.pkG + 1 && row.out === 0;
    if (!good) fails++;
    row.ok = good;
    rows.push(row);
  }
  const R0 = rows.filter(x => x.kit === kit && x.dens === dens && x.dir === dir);
  console.log(kit.padEnd(14), 'D' + dens, dir.padEnd(4), R0.map(x => (x.ok ? ' ' : '!') + x.name.slice(0, 7).padEnd(7) + (x.lu >= 0 ? '+' : '') + x.lu.toFixed(1) + '/' + x.pk.toFixed(0) + (x.out ? '/o' + x.out : '')).join(' '));
}
fs.mkdirSync(DIR + '/out', {recursive: true});
fs.writeFileSync(DIR + '/out/ue12.json', JSON.stringify(rows, null, 1));
res.push(ok(fails === 0, 'UE-12 Pegel/Lautheit/Länge alle Kits', {zeilen: rows.length, fehler: fails}));
res.push(ok(errs.length === 0, 'keine Seitenfehler', errs.slice(0, 3)));
await b.close();
process.exit(res.every(x => x.ok) ? 0 : 1);
