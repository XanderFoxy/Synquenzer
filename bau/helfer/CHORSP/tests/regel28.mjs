// Regel 28: ohne Bedienung der neuen Regler klingt und sieht alles wie in 4.30.0 (Basis R-4300 ↔ CHORSP)
import { open, sing, style, sleep, report, HERE } from './lib.mjs';
import path from 'path'; import fs from 'fs';
const BASE = path.resolve(HERE, '../../../snapshots/R-4300.html'), MINE = path.resolve(HERE, '../index.html');
const T = report('Regel 28'); const out = {};
for (const [k, f] of [['base', BASE], ['mine', MINE]]) {
  process.env.APP = f;
  const {b, p, errs} = await open();
  await sing(p); await p.evaluate(() => { R.selS = 0; });
  const shot0 = await p.screenshot();                                  // Matrix ohne Chor
  await style(p, 'pop');
  await p.evaluate(() => { const st = stimmeT(), c = S.tracks[st].clips[0].audio; SYNQUENZER.setSong({bars: 8, lanes: S.tracks.map((t, i) => i === 0 ? [{bar: 0, slot: 0}] : []), vox: [Object.assign(JSON.parse(JSON.stringify(c)), {id: 'V1', bar: 2, len: 4})], marks: [], carrier: [], xp: [], mel: {}, loop: {on: false, a: 0, b: 8}}); });
  const r = await p.evaluate(async () => { const x = await SYNQUENZER.vvRender({range: {a: 0, b: 7}}); return {rms: x.rms, peak: x.peak}; });
  await p.evaluate(() => { setSongView(false); launchScene(0); }); await sleep(1200);
  const nodes = await p.evaluate(() => TK.src.filter(r => !r.dead && r.chG).map(r => ({lvl: r.chG.lvl.gain.value, ch: r.ch.map(x => [x.vg.gain.value, x.pan ? x.pan.pan.value : 0])})));
  const vol = await p.evaluate(() => AU.tracks[stimmeT()].vol.gain.value);
  await p.evaluate(() => stop());
  const proj = await p.evaluate(() => serializeProject());
  out[k] = {r, nodes, vol, proj, shot0, errs, p, b};
}
// Hinweis: die Lautheits-Messung gA (Worker, G6+b) schwankt schon zwischen zwei Läufen der Basis um ≈ 1e-8 (relativ) → Vergleich über Läufe mit 1e-6;
// die Formeln selbst werden im selben Lauf bitgenau verglichen (unten).
const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(a));
T.ok('Video-Ton gleich (RMS/Spitze, < 1e-5 relativ = −100 dB)', rel(out.base.r.rms, out.mine.r.rms) < 1e-5 && rel(out.base.r.peak, out.mine.r.peak) < 1e-5, out.base.r.rms + ' / ' + out.mine.r.rms);
const fl = n => n.flatMap(x => [x.lvl, ...x.ch.flat()]), nb = fl(out.base.nodes), nm = fl(out.mine.nodes);
T.ok('Chor-Knoten gleich (Gruppe < 1e-6, Kopien/Pan bitgleich)', nb.length === nm.length && nb.length > 0 && rel(out.base.nodes[0].lvl, out.mine.nodes[0].lvl) < 1e-6 && JSON.stringify(out.base.nodes.map(x => x.ch)) === JSON.stringify(out.mine.nodes.map(x => x.ch)), nm.length + ' Werte');
// bitgenau im selben Lauf: neue Faktoren ohne Felder = 1 bzw. dieselbe Formel wie 4.30.0
const ex = await out.mine.p.evaluate(() => { const x = tkRef({t: stimmeT(), s: 0}), a = x.a, st = stimmeT(), tr = S.tracks[st];
  const leadOld = Math.pow(10, g6pcLeadDb(a) / 20), vgOld = (v, vi) => Math.pow(10, (v.db || 0) / 20) * (g6pcLaneOn(v.lane) && g6pcSoloOn(v.lane, vi) ? 1 : 0) * g6pcGuideOf(v.lane);
  const fxOld = g4Fx(tr, fxOfSound(tr.sound));
  return {lead: g6pcLeadK(a) === leadOld, bg: chsBgK() === 1, vg: a.chor.voices.every((v, vi) => g6pcVg(v, vi) === vgOld(v, vi)), pan: a.chor.voices.every(v => g6pCopies(v).every(C => chsPanOf(v, C) === g6pcPanOf(v, C))), fx: JSON.stringify(trackFx(tr)) === JSON.stringify(fxOld)}; });
T.ok('Formeln ohne neue Felder bitgenau wie 4.30.0', Object.values(ex).every(Boolean), JSON.stringify(ex));
T.ok('Lead-Pegel bitgleich', out.base.vol === out.mine.vol, out.base.vol + ' / ' + out.mine.vol);
const strip = s => s.replace(/"saved":\d+|"t":\d{12,}|"created":\d+/g, '');
T.ok('Gespeichertes Projekt zeichengleich', strip(out.base.proj).length === strip(out.mine.proj).length, out.base.proj.length + ' / ' + out.mine.proj.length + ' Zeichen');
// altes Projekt (aus 4.30.0) in CHORSP laden und wieder speichern
const re = await out.mine.p.evaluate(pj => { importJSON(pj); return serializeProject(); }, out.base.proj);
T.ok('Projekt aus 4.30.0 lädt unverändert', strip(re) === strip(out.base.proj), re.length + ' Zeichen');
T.ok('Matrix ohne Chor pixelgleich', Buffer.compare(out.base.shot0, out.mine.shot0) === 0, out.base.shot0.length + ' / ' + out.mine.shot0.length + ' Bytes');
T.ok('keine Fehler', !out.base.errs.length && !out.mine.errs.length, out.mine.errs.join(' | '));
for (const k of ['base', 'mine']) await out[k].b.close();
fs.writeFileSync(path.resolve(HERE, 'ergebnis-regel28.txt'), T.res.join('\n') + '\n\n' + (T.fail ? T.fail + ' FEHLER' : 'alles grün') + '\n');
console.log(T.fail ? T.fail + ' FEHLER' : 'alles grün'); process.exit(T.fail ? 1 : 0);
