// VV4CE: Geräte-Engine (eng 3) – ohne Patch keine Modulation, mit Patch (LFO 1 → Cutoff) Platte + K1-Übersicht; Zeichenzeit je Bild
import { open, ok, summary, OUT } from './lib.mjs';
import fs from 'fs';
fs.mkdirSync(OUT, {recursive: true});
const {b, p, errs} = await open();
const SONG = {bars: 4, lanes: [[], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: []};
const r0 = await p.evaluate(async s => {
  S.bpm = 120;
  // track 4 (index 3): the AM-engine init sound, a 1-bar clip of track 3's notes
  S.tracks[3].sound = factorySound('f-init-am'); try { soundChanged && soundChanged(3); } catch (e) {}
  S.tracks[3].clips[0] = JSON.parse(JSON.stringify(S.tracks[2].clips[0]));
  SYNQUENZER.setSong(s);
  const T = sndOf(3).p.mk.t[0], pre = T.p.map(c => c.i);
  return {eng: sndOf(3).engine, pre, has0: SYNQUENZER.vv4HasMod(3), kind0: SYNQUENZER.vv4SpurKind(3)};
}, SONG);
ok('Geräte-Klang ohne Patch-Intensität: keine Modulation', r0.eng === 'mk' && !r0.has0 && r0.kind0 === 'roll', r0);
const r1 = await p.evaluate(() => { const T = sndOf(3).p.mk.t[0]; T.p[0].s = 2; T.p[0].d = 4; T.p[0].i = 40; return {has: SYNQUENZER.vv4HasMod(3), kind: SYNQUENZER.vv4SpurKind(3), k1: k1Mods(3).map(e => e.src + ' → ' + e.dst)}; });
ok('Patch LFO 1 → Cutoff (Intensität 40): Modulation ja', r1.has && r1.kind === 'roll+mod', r1);
await p.evaluate(() => SYNQUENZER.vvRender({}));
const pr = await p.evaluate(() => SYNQUENZER.vv4Probe('mod', 3, 1.3, '16:9'));
ok('Modulation-Bild: Geräte-Platte + K1-Zeilen', pr.mod && pr.mod.plate && pr.mod.rows.some(r => /LFO 1/.test(r.src) && r.dst === 'Cutoff'), {plate: pr.mod && pr.mod.plate, rows: pr.mod && pr.mod.rows.map(r => r.src + ' → ' + r.dst)});
const cut = await p.evaluate(() => { const o = []; for (let k = 0; k < 12; k++) o.push(+SYNQUENZER.vv4Probe('mod', 3, .2 + k * .29, '16:9').mod.cutMod.toFixed(2)); return o; });
ok('Cutoff-Wert der Platte bewegt sich mit dem LFO (VV3-Rechnung)', new Set(cut).size > 4, cut);
fs.writeFileSync(OUT + '/mod-mk-16x9.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vv4Png('mod', 3, 1.3, '16:9')), 'base64'));
fs.writeFileSync(OUT + '/mod-mk-9x16.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vv4Png('mod', 3, 1.3, '9:16')), 'base64'));
// time per picture at 1080 × 1920 (as vv3Ms): roll, drum, mod, spur with mod
const ms = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d', {alpha: false}), o = {};
  for (const [k, fn, i] of [['roll', vvDrawRoll, 2], ['drum', vvDrawDrumSeq, 4], ['mod', vvDrawMod, 2], ['modMk', vvDrawMod, 3]]) { fn(g, .1, null, i); const t0 = performance.now(); for (let f = 0; f < 60; f++) fn(g, f / 30, null, i); o[k] = +((performance.now() - t0) / 60).toFixed(2); }
  return o; });
ok('Zeichenzeit je Bild (1080 × 1920) ≤ 12 ms', Object.values(ms).every(x => x <= 12), ms);
ok('keine Konsolenfehler', !errs.length, errs.slice(0, 5));
console.log(JSON.stringify(summary()));
await b.close();
process.exit(summary().fails ? 1 : 0);
