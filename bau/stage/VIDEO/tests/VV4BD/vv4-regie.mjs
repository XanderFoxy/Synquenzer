// VV4-D Auto-Regie 2: Schnittliste des Testsongs exakt; manuelle Wahl schlägt Auto; Hash stabil; alte Listen gleicher Hash
import { open, SONG, UE, OUT } from './lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
const res = {};
const L = s => s.map(x => [x.a, x.b, x.v, x.t, x.why, x.f || null]);
// erwartet (0-basiert [a, b), Bild, Spur, Grund, Fokus)
const SOLL = [
  [0, 4, 'roll', 0, 'neu-clip', 'zelle'],    // Takt 1: Synth 1 zum ersten Mal → kurz Fokus Zelle, dann Piano-Roll
  [4, 8, 'drum', 4, 'neu-drum', null],       // Takt 5: Drums setzen ein → Drum-Sequenzer
  [8, 12, 'roll', 1, 'neu-clip', 'zelle'],   // Takt 9: Clip A zum ersten Mal (auch Teilanfang: Neues hat Vorrang)
  [12, 15, 'tast', null, 'transposition', null],  // Takt 13: Transposition → Tastatur (bis zum Übergang; < 2 Takte Rest werden nicht geschnitten)
  [15, 17, 'drum', 4, 'ue', null],           // Takt 16–17: Übergang an 16|17 → Drum-Sequenzer über seine Länge (ganze Takte, ≥ 2)
  [17, 20, 'song', null, 'eintrag-ende', null],
  [20, 24, 'drum', 4, 'neu-drum', null],     // Takt 21: Drum-Clip 2 zum ersten Mal
  [24, 32, 'app', null, 'teil', null],       // Takt 25: Teilanfang, Clip A zum zweiten Mal → kein Fokus, ganze App
];
res.testsong = await p.evaluate(({S0, UE}) => {
  SYNQUENZER.setSong(S0); S.song.ue = JSON.parse(JSON.stringify(UE));
  const c1 = SYNQUENZER.vvCuts({range: {a: 0, b: 32}}), c2 = SYNQUENZER.vvCuts({range: {a: 0, b: 32}});
  return {shots: c1.shots, hash: c1.hash, hash2: c2.hash, xp: S.song.xp};
}, {S0: SONG, UE});
res.testsong.ist = L(res.testsong.shots);
res.testsong.ok = JSON.stringify(res.testsong.ist) === JSON.stringify(SOLL) && res.testsong.hash === res.testsong.hash2;
// der zweite Auftritt von Clip A ohne Fokus; kein Schnitt kürzer als 2 Takte (außer am Ende), alle auf Taktstrichen
res.regeln = {zweiterOhneFokus: !res.testsong.shots.some(s => s.a === 24 && s.f), min2: res.testsong.shots.every(s => s.b - s.a >= 2), max8: res.testsong.shots.every(s => s.b - s.a <= 8)};
res.regeln.ok = Object.values(res.regeln).every(Boolean);
// manuelle Wahl je Bereich hat Vorrang: Takt 9–12 → Matrix, Takt 5–8 → Tastatur
const SOLL_M = [
  [0, 4, 'roll', 0, 'neu-clip', 'zelle'],
  [4, 8, 'tast', null, 'eintrag', null],
  [8, 12, 'matrix', null, 'eintrag', null],
  [12, 17, 'drum', 4, 'neu-drum', null],     // die Drums waren noch nicht im Bild (warten, solange ihr Clip läuft); der Übergang danach ist dasselbe Bild → eine Einstellung
  [17, 20, 'song', null, 'eintrag-ende', null],
  [20, 24, 'drum', 4, 'neu-drum', null],
  [24, 32, 'app', null, 'teil', null],
];
res.manuell = await p.evaluate(() => {
  SYNQUENZER.vvDirSet(8, 12, 'matrix'); SYNQUENZER.vvDirSet(4, 8, 'tast');
  const c = SYNQUENZER.vvCuts({range: {a: 0, b: 32}}); return {shots: c.shots, dir: SYNQUENZER.vvDirGet()};
});
res.manuell.ist = L(res.manuell.shots);
res.manuell.ok = JSON.stringify(res.manuell.ist) === JSON.stringify(SOLL_M);
// manuelle Spur-Wahl (Piano-Roll Synth 2 über die Übergangs-Takte) schlägt auch den Übergang
res.manuellUe = await p.evaluate(() => { SYNQUENZER.vvDirSet(14, 18, 'roll', 1); const c = SYNQUENZER.vvCuts({range: {a: 0, b: 32}}); return {shots: c.shots.map(s => [s.a, s.b, s.v, s.t, s.why])}; });
res.manuellUe.ok = res.manuellUe.shots.some(s => s[0] === 14 && s[1] === 18 && s[2] === 'roll' && s[3] === 1 && s[4] === 'eintrag') && !res.manuellUe.shots.some(s => s[4] === 'ue' && s[0] < 18 && s[1] > 14);
// ein alter Song (nur alte Bilder) behält seinen Hash: Liste ohne f hasht wie in 4.26.1
res.hashAlt = await p.evaluate(() => {
  const sh = [{a: 0, b: 4, v: 'song', t: null}, {a: 4, b: 8, v: 'spur', t: 2}];
  let h = 2166136261; for (const c of JSON.stringify(sh.map(s => [s.a, s.b, s.v, s.t]))) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return {alt: h.toString(16), neu: vvCutHash(sh)};
});
res.hashAlt.ok = res.hashAlt.alt === res.hashAlt.neu;
// ohne song.ue läuft kein Übergang; ohne Spur-Clip-Wechsel wird nichts erfunden
res.ohneUe = await p.evaluate(S0 => { SYNQUENZER.setSong(S0); const c = SYNQUENZER.vvCuts({range: {a: 0, b: 32}}); return {shots: c.shots.map(s => [s.a, s.b, s.v, s.t, s.why])}; }, SONG);
res.ohneUe.ok = !res.ohneUe.shots.some(s => s[4] === 'ue');
// Tastatur 2 Takte, wenn danach Platz ist (Transposition in Takt 5 eines langen Teils ohne anderes Neues)
res.tast2 = await p.evaluate(() => {
  SYNQUENZER.setSong({bars: 16, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [], []], carrier: [], mel: {}, xp: [{beat: 16, semi: 3}], marks: [{id: 'm1', a: 0, len: 16, name: 'Teil'}]});
  return SYNQUENZER.vvCuts({range: {a: 0, b: 16}}).shots.map(s => [s.a, s.b, s.v, s.t, s.why, s.f || null]);
});
res.tast2 = {ist: res.tast2, ok: res.tast2.some(s => s[0] === 4 && s[1] === 6 && s[2] === 'tast')};
res.errs = errs; res.ok = ['testsong', 'regeln', 'manuell', 'manuellUe', 'hashAlt', 'ohneUe', 'tast2'].every(k => res[k].ok) && !errs.length;
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/vv4-regie.json', JSON.stringify(res, null, 1));
for (const k of Object.keys(res)) if (res[k] && res[k].ok !== undefined) console.log(k, res[k].ok ? 'OK' : 'FEHLER ' + JSON.stringify(res[k].ist || res[k].shots || res[k]).slice(0, 900));
console.log('Konsolenfehler', errs.length, 'GESAMT', res.ok ? 'GRÜN' : 'ROT');
await b.close();
