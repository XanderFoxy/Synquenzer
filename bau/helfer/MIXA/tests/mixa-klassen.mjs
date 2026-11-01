// MIX-A Abnahme 1: Klassifikation (Rolle + Charakter) am Testsong; Songteile (Intro ausgedünnt → „darf vorne sein“)
// node mixa-klassen.mjs [index.html]
import { open, buildSong, vocalWav, ok, failed, APP } from './mixa-lib.mjs';
const {p, errs, close} = await open(APP);
const bpm = await p.evaluate(() => window.SYNQUENZER.project().bpm), spb = 60 / bpm;
const b = await buildSong(p, {vocal: vocalWav(12 * 4 * spb + 1, 48000, 4 * 4 * spb)});
ok('Testsong gebaut (5 Spuren + Gesang)', b.tracks === 7 && b.song, b);
const t0 = Date.now(), m = await p.evaluate(() => window.SYNQUENZER.mixaAnalyze()), ms = Date.now() - t0;
const I = await p.evaluate(() => window.SYNQUENZER.mixaInfo());
ok('Analyse fertig (Worker)', !!m && !!I.res && I.how === 'worker', {ms, how: I.how});
const T = Object.fromEntries((I.res ? I.res.T : []).map(t => [t.i, t]));
const want = {0: ['bass', ['kurz']], 1: ['arp', ['kurz']], 2: ['pad', ['schwebend']], 3: ['lead', ['ausklingend', 'schwebend']], 4: ['drums', ['kurz']], 6: ['voc', ['ausklingend', 'schwebend']]};
for (const [i, [cls, chr]] of Object.entries(want)) {
  const t = T[i]; ok(`Spur ${+i + 1}: ${cls}`, t && t.cls === cls, t ? {cls: t.cls, sc: t.sc} : 'fehlt');
  ok(`Spur ${+i + 1}: Charakter ${chr.join('/')}`, t && chr.includes(t.chr), t ? {chr: t.chr, att: t.f.att, gap: t.f.gap, d200: t.f.d200, durB: t.ns && t.ns.durB} : 'fehlt');
}
ok('leere Spur (MELODIE) = still, keine Vorschläge', T[5] && T[5].f.silent && !(I.res.sug[I.res.T.findIndex(t => t.i === 5)] || []).length);
const f = i => T[i] && T[i].f;
ok('Frequenzbild: Bass tief (Schwerpunkt < 250 Hz), Sequenz/Lead > 700 Hz', f(0).cen < 250 && f(1).cen > 700 && f(3).cen > 700, {bass: f(0).cen, arp: f(1).cen, lead: f(3).cen});
ok('Hüllkurve: Fläche Attack ≥ 60 ms, Sequenz/Bass < 40 ms', f(2).att >= 60 && f(1).att < 40 && f(0).att < 40, {pad: f(2).att, arp: f(1).att, bass: f(0).att});
ok('Noten: Bass Median-Lage < 48, Sequenz ≥ 3 Einsätze/Schlag, Fläche ≥ 3 Stimmen', T[0].ns.medP < 48 && T[1].ns.dens >= 3 && T[2].ns.poly >= 3, {bass: T[0].ns.medP, arp: T[1].ns.dens, pad: T[2].ns.poly});
const secs = I.res.secs;
ok('Songteile: Intro (2 Spuren) + Refrain (alle)', secs.length === 2 && secs[0].act.filter(Boolean).length === 2 && secs[1].act.filter(Boolean).length >= 5, secs.map(s => [s.name, s.act.filter(Boolean).length]));
const sug = (i, id) => (I.res.sug[I.res.T.findIndex(t => t.i === i)] || []).find(s => s.id === id);
const sp = sug(2, 'sec'), sl = sug(3, 'sec');
ok('je Songteil: Fläche und Lead im ausgedünnten Intro vorne (+dB)', sp && sl && sp.patch.mix.sec.M1 > 0 && sl.patch.mix.sec.M1 > 0, {pad: sp && sp.text, lead: sl && sl.text});
ok('Hochpass nur bei Nicht-Bass (Fläche/Sequenz/Lead ≥ 80 Hz), Bass/Drums 30 Hz', sug(2, 'hp').patch.mix.hp >= 80 && (!sug(1, 'hp') || sug(1, 'hp').patch.mix.hp >= 80) && (!sug(0, 'hp') || sug(0, 'hp').patch.mix.hp === 30), {pad: sug(2, 'hp').text, bass: sug(0, 'hp') && sug(0, 'hp').text});
ok('Bass ↔ Kick erkannt (Glocke am Kick-Grundton + Ducking als Option)', !!sug(0, 'kick') && sug(0, 'duck') && sug(0, 'duck').art === 'option', sug(0, 'kick') && sug(0, 'kick').text);
ok('Ducking Fläche ↔ Kick als Option', sug(2, 'duck') && sug(2, 'duck').art === 'option');
const cb = sug(0, 'comp'), cp = sug(2, 'comp');
ok('Kompressor nach Charakter: Bass (kurz) schnell & 4:1, Fläche (schwebend) langsam & sanft', cb && cp && cb.patch.mix.at <= 5 && cb.patch.mix.ra >= 4 && cp.patch.mix.at >= 30 && cp.patch.mix.ra <= 2 && cp.patch.mix.rl >= 250, {bass: cb && cb.text, pad: cp && cp.text});
ok('Gesang: Hinweis auf STIMME › Effekte › Auto (kein zweiter Kompressor)', sug(6, 'voc') && !sug(6, 'comp'));
ok('keine Fehler', !errs.length, errs.slice(0, 3));
await close();
console.log(failed() ? 'FEHLER: ' + failed() : 'ALLES GRÜN', '(' + ms + ' ms Analyse)');
process.exit(failed() ? 1 : 0);
