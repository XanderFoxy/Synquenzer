// UE-C/D Abnahme §1.7: UE-01, 02, 03, 04, 05, 10, 13, 14, 16, 19-teilw. (Kopien über Teil kopieren), Undo/Redo, Speichern/Laden
import {open, song, render, ok, DIR} from './lib.mjs';
import fs from 'fs';
const R = [], {b, p, errs} = await open();
const A = (f, ...a) => p.evaluate(([f, a]) => { const x = window.SYNQUENZER[f](...a); return x && typeof x.then === 'function' ? x.then(v => v) : x; }, [f, a]);
const drumLog = r => r.log.filter(e => e.track === 4).map(e => ({b: e.beat, n: e.out, v: +(+e.vel).toFixed(3), s: e.src}));
const H = x => JSON.stringify(x);
// ---------- UE-01: Fill ½ Takt an Kante 8|9, ersetzt: Schläge 30–32 nur Fill, außerhalb Unterschied 0 ----------
let m = await song(p, {kit: 'Rom Pop', parts: 2, lenBars: 8});
const r0 = await render(p, 0, 16), L0 = drumLog(r0);
const u1 = await A('ueAdd', 'w-fill-kurz', {m: m[1].id}, {dens: 1});
const r1 = await render(p, 0, 16), L1 = drumLog(r1);
const inW = e => e.b >= 30 - 1e-6 && e.b < 32 - 1e-6;
const outEq = H(L0.filter(e => !inW(e))) === H(L1.filter(e => !inW(e))), onlyFill = L1.filter(inW).every(e => e.s === 'ue') && L1.filter(inW).length > 0;
R.push(ok(outEq && onlyFill, 'UE-01 Kante 8|9: Schlag 30–32 nur Fill-Treffer, außerhalb identisch', {fill: L1.filter(inW).length, aussenGleich: outEq}));
// Timing sample-genau: jeder Fill-Treffer liegt auf dem Raster (Abstand zur Kick auf Schlag 0, in Samples)
const sr = r1.sr, spb = 60 / r1.bpm, k0 = r1.log.find(e => e.track === 4 && e.src === 'clip' && e.out === 36 && Math.abs(e.beat) < 1e-6);
let worst = 0; for (const e of r1.log.filter(e => e.src === 'ue')) { const want = k0.time + (Math.round(e.beat * 4) / 4) * spb; worst = Math.max(worst, Math.abs(e.time - want) * sr); }
R.push(ok(worst < 1, 'Timing sample-genau (Fill-Treffer gegen Raster)', {maxSamples: +worst.toFixed(4)}));
// ---------- UE-02: Kit-Wechsel 808 → Gated 84: UE-Daten-Hash gleich, Treffer mit dem neuen Kit ----------
await A('loadKit', '808'); const h808 = H(await A('ueList')); const ra = await render(p, 0, 16);
const pa = await p.evaluate(() => window.SYNQUENZER.drumSlot('tomH'));
await A('loadKit', 'Gated 84'); const hG = H(await A('ueList')); const rb = await render(p, 0, 16);
const pb = await p.evaluate(() => window.SYNQUENZER.drumSlot('tomH'));
const sameHits = H(ra.log.filter(e => e.src === 'ue').map(e => [e.beat, e.out])) === H(rb.log.filter(e => e.src === 'ue').map(e => [e.beat, e.out]));
R.push(ok(h808 === hG && sameHits && H(pa) !== H(pb) && Math.abs(ra.rms - rb.rms) > 1e-6, 'UE-02 Kit-Wechsel: UE-Daten gleich, gleiche Treffer, neuer Kit-Klang', {hashGleich: h808 === hG, rmsA: +ra.rms.toFixed(5), rmsB: +rb.rms.toFixed(5)}));
// ---------- UE-03: 2 Takte vor der Kante einfügen → Kante 8|9 → 10|11, Übergang wandert mit; Teil ziehen; Teil löschen + 1 Undo bit-gleich ----------
await A('songRange', 'insertEmpty', 4, 5);
let s = await A('song'), mk = s.marks.find(x => x.id === m[1].id), u = s.ue && s.ue[0];
const r3 = await render(p, 0, 18), w3 = r3.log.filter(e => e.src === 'ue').map(e => e.beat);
R.push(ok(mk && mk.a === 10 && u && u.m === m[1].id && Math.min(...w3) >= 38 - 1e-6 && Math.max(...w3) < 40, 'UE-03 Einfügen: Kante 10|11, Übergang folgt (Schlag 38–40)', {kante: mk && mk.a, schlaege: [Math.min(...w3), Math.max(...w3)]}));
// den folgenden Teil ziehen: Teil 2 hinter einen dritten Teil verschieben (die Kante liegt dann vor Teil 2 an neuer Stelle)
await A('markAction', m[0].id, 'copy', 0); s = await A('song');                  // ein Teil mehr vorne: S1 S1 S2
const mS2 = s.marks.find(x => x.id === m[1].id); await A('markAction', m[0].id, 'move', s.bars); s = await A('song');   // S1 S2 S1
const ueAfter = (s.ue || []).filter(x => x.m), target = ueAfter.length ? s.marks.find(x => x.id === ueAfter[0].m) : null;
const r3b = await render(p, 0, s.bars), w3b = r3b.log.filter(e => e.src === 'ue').map(e => e.beat);
R.push(ok(ueAfter.length === 1 && target && target.part === 'S2' && target.a !== mS2.a && Math.max(...w3b) < target.a * 4 && Math.min(...w3b) >= target.a * 4 - 2, 'UE-03 Teil ziehen: der Übergang wandert mit seinem Teil', {vorher: mS2.a, nachher: target && target.a, schlaege: [Math.min(...w3b), Math.max(...w3b)]}));
await A('undo'); await A('undo');
await A('undo');
s = await A('song'); const before = H(s);
const del = await A('markAction', m[1].id, 'delete'); s = await A('song');
const gone = !s.ue || !s.ue.length;
await A('undo'); s = await A('song');
R.push(ok(del && gone && H(s) === before, 'UE-03 Teil löschen: Übergang weg, 1 Undo stellt beides bit-gleich her', {weg: gone, gleich: H(s) === before}));
// ---------- UE-04: Undo/Redo + Speichern/Laden bit-gleich; Projekt ohne Übergänge = byte-gleiche Datei ----------
const sA = H(await A('song')); await A('ueSet', (await A('ueList'))[0].id, {dens: 2}); const sB = H(await A('song'));
await A('undo'); const sU = H(await A('song')); await A('redo'); const sR = H(await A('song'));
R.push(ok(sU === sA && sR === sB && sA !== sB, 'UE-04 Undo/Redo bit-gleich', {}));
const file = await p.evaluate(() => window.SYNQUENZER.serialize());
await p.evaluate(f => window.SYNQUENZER.importJSON(f), file); await p.waitForTimeout(300);
const file2 = await p.evaluate(() => window.SYNQUENZER.serialize());
const j1 = JSON.parse(file), j2 = JSON.parse(file2), ue1 = H((j1.project || j1).song.ue), ue2 = H((j2.project || j2).song.ue);
R.push(ok(ue1 === ue2 && ue1 !== undefined && ue1.length > 10, 'UE-04 Speichern → Laden: song.ue gleich', {bytes: ue1.length}));
// byte-gleich ohne UE: dieselbe Datei in der Basis-App (R-4300) und hier öffnen und speichern
const base = await open({app: process.env.UE_BASE || new URL('../../../snapshots/R-4300.html', import.meta.url).pathname});
await song(base.p, {kit: '909', parts: 3, lenBars: 4});
const fB = await base.p.evaluate(() => window.SYNQUENZER.serialize());
await p.evaluate(f => window.SYNQUENZER.importJSON(f), fB); await p.waitForTimeout(300);
await base.p.evaluate(f => window.SYNQUENZER.importJSON(f), fB); await base.p.waitForTimeout(300);
const fx = await p.evaluate(() => window.SYNQUENZER.serialize()), fy = await base.p.evaluate(() => window.SYNQUENZER.serialize());
const strip = f => { const o = JSON.parse(f); delete o.savedAt; delete o.time; if (o.project) { delete o.project.savedAt; } return JSON.stringify(o); };
R.push(ok(strip(fx) === strip(fy) && !fx.includes('"ue"'), 'UE-04 Projekt ohne Übergänge: Datei byte-gleich zur Basis (R-4300)', {len: fx.length, gleich: fx === fy}));
await base.b.close();
// ---------- UE-05: Noten im Video (offline) = Noten live, gleiche Anzahl, ±1 ms ----------
m = await song(p, {kit: 'Gated 84', parts: 2, lenBars: 2, bpm: 180});
await A('ueAdd', 'w-tom-wirbel', {m: m[1].id}, {dens: 2, len: 4}); await A('ueAdd', 'w-tom-doppel', {at: 9}, {dens: 1});
const rv = await render(p, 0, 4), offN = rv.log.filter(e => e.track === 4);
await A('clearLog');
await p.evaluate(() => window.SYNQUENZER.songPlay(0)); await p.waitForTimeout(4 * 4 * 60 / 180 * 1000 + 900); await p.evaluate(() => window.SYNQUENZER.songPlay(false));
const live = (await p.evaluate(() => window.SYNQUENZER.noteLog(4096))).filter(e => e.track === 4 && e.beat != null && e.beat < 16 - 1e-6 && e.beat >= 0);
const off = offN.filter(e => e.beat < 16 - 1e-6), t0o = off.find(e => e.beat === 0).time, t0l = live.find(e => e.beat === 0) ? live.find(e => e.beat === 0).time : 0;
let dmax = 0; const key = e => e.beat.toFixed(3) + ':' + e.out;
const lm = new Map(live.map(e => [key(e), e])); let miss = 0;
for (const e of off) { const l = lm.get(key(e)); if (!l) { miss++; continue; } dmax = Math.max(dmax, Math.abs((e.time - t0o) - (l.time - t0l)) * 1000); }
R.push(ok(off.length === live.length && miss === 0 && dmax <= 1, 'UE-05 Video (offline) = live: Anzahl gleich, ±1 ms', {offline: off.length, live: live.length, fehlt: miss, maxMs: +dmax.toFixed(3), ue: off.filter(e => e.src === 'ue').length}));
// ---------- UE-10: belegte Kante = ersetzen, genau 1 Undo-Schritt ----------
m = await song(p, {kit: 'Rom Pop', parts: 2, lenBars: 4});
await A('ueAdd', 'w-fill-kurz', {m: m[1].id}, {});
const n0 = (await A('undoInfo')).n, sx = H(await A('song'));
await A('ueAdd', 'w-fill-lang', {m: m[1].id}, {});
const l10 = await A('ueList'), n1 = (await A('undoInfo')).n;
await A('undo'); const sy = H(await A('song'));
R.push(ok(l10.length === 1 && l10[0].src === 'w-fill-lang' && n1 === n0 + 1 && sx === sy, 'UE-10 belegte Kante = ersetzen, 1 Undo', {eintraege: l10.length, undo: n1 - n0}));
// Break und Übergang teilen sich eine Kante (je ein Platz)
await A('ueAdd', 'w-stopp-1', {m: m[1].id}, {}); const l10b = await A('ueList');
R.push(ok(l10b.length === 2, 'Kante trägt Übergang + Break', {n: l10b.length}));
// ---------- UE-13: Build-up – Treffer je Schlag und Tune steigen monoton ----------
let mono = true, info = [];
for (const L of [8, 16]) for (const d of [0, 1, 2]) {
  const ns = await A('ueGen', 'w-build', L, d, 'gleich'), per = Array(L).fill(0), tu = Array(L).fill(-99);
  for (const n of ns) { if (n.n !== 38 || n.t >= L) continue; const bt = Math.floor(n.t + 1e-9); per[bt] += n.r || 1; tu[bt] = Math.max(tu[bt], (n.lk && n.lk.tune) || 0); }
  for (let k = 1; k < L; k++) if (per[k] < per[k - 1] || tu[k] < tu[k - 1]) mono = false;
  info.push(L + '/' + d + ':' + per.join(',') + ' tune ' + tu[0] + '→' + tu[L - 1]);
}
R.push(ok(mono, 'UE-13 Build-up monoton (Treffer/Schlag, Tune +0 → +7)', info.join(' | ')));
// ---------- UE-14: Richtung 2 → 5 aufbauend, 5 → 2 abbauend; Chip zeigt die Richtung ----------
m = await p.evaluate(() => {
  const A = window.SYNQUENZER; A.newProject({});
  const one = n => ({len: 1, notes: [{t: 0, d: 1, n, v: .7}]});
  for (const t of [0, 1, 2, 3, 5]) A.setClip(t, 0, one(60 + t));
  A.setClip(4, 0, {len: 1, notes: [{t: 0, d: .1, n: 36, v: .8}]});
  const lanes = Array.from({length: A.NT()}, () => []);
  lanes[4] = [{bar: 0, slot: 0}]; lanes[0] = [{bar: 0, slot: 0}];                         // Teil 1: 2 Clips
  for (const t of [1, 2, 3]) lanes[t] = [{bar: 4, slot: 0}, {bar: 8, slot: -1}];          // Teil 2: 5 Clips, Teil 3: 2 Clips
  A.setSong({bars: 12, lanes, carrier: [], marks: [{a: 0, len: 4, part: 'S1'}, {a: 4, len: 4, part: 'S2'}, {a: 8, len: 4, part: 'S3'}], mel: {}});
  return A.song().marks;
});
const ua = await A('ueAdd', 'w-fill-lang', {m: m[1].id}, {}), ub = await A('ueAdd', 'w-fill-lang', {m: m[2].id}, {});
const da = await A('ueDir', ua), dbb = await A('ueDir', ub);
await A('songView', true); await p.waitForTimeout(200);
const labs = await p.evaluate(() => window.SYNQUENZER.ueInfo().chips.map(c => c.lab));
const na = (await A('ueList')).find(x => x.id === ua).notes, nb2 = (await A('ueList')).find(x => x.id === ub).notes;
R.push(ok(da === 'auf' && dbb === 'ab' && labs.some(l => l.includes('↗')) && labs.some(l => l.includes('↘')) && na.some(n => n.n === 49) && !nb2.some(n => n.n === 49), 'UE-14 Richtung: 2→5 aufbauend (mit Crash), 5→2 abbauend; Chip zeigt ↗/↘', {da, db: dbb, labs}));
// ---------- UE-16: Einwurf auf 1/16 genau (±1 ms bei 120 BPM), wandert beim Einfügen mit ----------
m = await song(p, {kit: '909', parts: 2, lenBars: 4, bpm: 120});
const ue16 = await A('ueAdd', 'w-clap-einwurf', {at: 21.75}, {dens: 1});
const r16 = await render(p, 0, 8), k16 = r16.log.find(e => e.track === 4 && e.src === 'clip' && e.out === 36 && Math.abs(e.beat) < 1e-6), c16 = r16.log.find(e => e.src === 'ue');
const err16 = c16 ? Math.abs((c16.time - k16.time) - 21.75 * .5) * 1000 : 99;
await A('songRange', 'insertEmpty', 2, 2);                       // 1 Takt davor einfügen
const at16 = (await A('ueList')).find(x => x.id === ue16);
R.push(ok(err16 <= 1 && at16 && Math.abs(at16.at - 25.75) < 1e-9, 'UE-16 Einwurf: 1/16 genau, wandert beim Einfügen mit', {ms: +err16.toFixed(4), at: at16 && at16.at}));
// Einwurf frei verschieben (1/16), Undo/Redo
await A('ueMove', ue16, {at: 6.25}); const mvd = (await A('ueList')).find(x => x.id === ue16).at; await A('undo'); const und = (await A('ueList')).find(x => x.id === ue16).at; await A('redo'); const red = (await A('ueList')).find(x => x.id === ue16).at;
R.push(ok(mvd === 6.25 && und === 25.75 && red === 6.25, 'Einwurf verschieben + Undo/Redo', {mvd, und, red}));
// Teil kopieren nimmt den Kanten-Übergang mit (eigene ID, eigene Marke)
m = await song(p, {kit: '808', parts: 2, lenBars: 4}); await A('ueAdd', 'w-snare-wirbel', {m: m[1].id}, {});
await A('markAction', m[1].id, 'copy'); s = await A('song');
R.push(ok((s.ue || []).length === 2 && new Set(s.ue.map(x => x.m)).size === 2 && new Set(s.ue.map(x => x.id)).size === 2, 'Teil kopieren: Übergang mit eigener ID an der Kopie', {ue: (s.ue || []).map(x => x.id + '@' + x.m)}));
R.push(ok(errs.length === 0, 'keine Seitenfehler', errs.slice(0, 5)));
fs.mkdirSync(DIR + '/out', {recursive: true}); fs.writeFileSync(DIR + '/out/ue-abnahme.json', JSON.stringify(R, null, 1));
console.log(R.filter(x => x.ok).length + '/' + R.length + ' OK');
await b.close(); process.exit(R.every(x => x.ok) ? 0 : 1);
