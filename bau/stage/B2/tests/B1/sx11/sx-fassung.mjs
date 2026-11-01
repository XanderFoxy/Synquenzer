// SX11 1: [Leicht]/[Voll] je Teil – Noten-Log je Spur, ein Undo-Schritt, Undo/Redo, die Auswahl jeder Fassung bleibt (Bearbeiten),
// Variante kopieren → einfügen, Speichern/Laden deep-equal, alte Songs (4.30.0) laden und speichern unverändert und klingen gleich
import { open, buildSong, ok, summary, diff, state, playLog, notesOf, diffNotes, OLD } from './lib.mjs';
const {b, p, errs} = await open();
await buildSong(p, {cats: true});
await p.evaluate(() => { S.bpm = 240; setSongView(true); });
const strip = st => { const o = JSON.parse(JSON.stringify(st)); for (const m of o.song.marks) delete m.vr; return o; };
const inR = (n, a, e) => n[3] >= a * 4 - 1e-6 && n[3] < e * 4 - 1e-6;
const s0 = await state(p), log0 = notesOf(await playLog(p));
ok(log0.length > 400, 'Song spielt (' + log0.length + ' Noten)');
const undoN = () => p.evaluate(() => UNDO.length);

console.log('Vorschlag „leicht“ (Refrain)');
const rol = await p.evaluate(() => SYNQUENZER.markRollen('M3'));
ok(JSON.stringify(rol) === JSON.stringify({0: 'bass', 1: 'chord', 2: 'pad', 3: 'phr', 4: 'dr', 5: 'mel'}), 'Rollen: Bass, Akkord (aus den Noten), Fläche, Phrase, Drums, Melodie', rol);
let inf = await p.evaluate(() => SYNQUENZER.markFassungInfo('M3'));
ok(inf.c === 'v' && inf.vorschlag && inf.l.map(r => r.t + r.k).join(' ') === '2x 3x 4d', 'Vorschlag: Fläche + Lead aus, Drums ausgedünnt; Bass, Akkord, Melodie bleiben', inf);

console.log('[Leicht]');
let u0 = await undoN();
ok(await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l')), 'Refrain leicht');
ok(await undoN() === u0 + 1, 'genau ein Undo-Schritt');
const sL = await state(p), logL = notesOf(await playLog(p));
const mL = sL.song.marks.find(m => m.id === 'M3');
ok(mL.vr && mL.vr.c === 'l' && mL.off && mL.off.length === 2 && mL.vr.dn && mL.vr.dn.length === 1, 'Marke: vr.c = l, S0-Einträge (off) für S3/S4, Drum-Original in vr.dn', mL);
const R = logL.filter(n => inR(n, 6, 10)), R0 = log0.filter(n => inR(n, 6, 10));
ok(!R.some(n => n[0] === 2 || n[0] === 3), 'Refrain: S3 Fläche und S4 Lead spielen nicht', R.filter(n => n[0] === 2 || n[0] === 3).slice(0, 3));
for (const t of [0, 1, 5]) { const d = diffNotes(R0.filter(n => n[0] === t), R.filter(n => n[0] === t)); ok(!d.onlyA.length && !d.onlyB.length, 'Refrain: Spur ' + t + ' unverändert', d); }
const D = R.filter(n => n[0] === 4), D0 = R0.filter(n => n[0] === 4);
ok(!D.some(n => n[2] === 49 || n[2] === 46), 'Drums leicht: kein Becken, keine offene Hi-Hat', D.filter(n => n[2] === 49 || n[2] === 46).slice(0, 3));
ok(D.filter(n => n[2] === 42).every(n => Math.abs(n[3] * 2 - Math.round(n[3] * 2)) < 1e-3) && D.filter(n => n[2] === 42).length === 32, 'Hi-Hat nur Achtel (8 je Takt, ohne Ratsche)', D.filter(n => n[2] === 42).length);
ok(JSON.stringify(D.filter(n => n[2] === 36 || n[2] === 38)) === JSON.stringify(D0.filter(n => n[2] === 36 || n[2] === 38)), 'Kick und Snare unverändert');
ok(D.every(n => n[1] === 'clip'), 'ausgedünnte Drums = eigener Clip (src own)', [...new Set(D.map(n => n[1]))]);
{ const d = diffNotes(log0.filter(n => !inR(n, 6, 10)), logL.filter(n => !inR(n, 6, 10))); ok(!d.onlyA.length && !d.onlyB.length, 'außerhalb des Refrains alles gleich', {a: d.onlyA.slice(0, 3), b: d.onlyB.slice(0, 3)}); }
const sumL = await p.evaluate(() => SYNQUENZER.markFassungInfo('M3'));
ok(sumL.c === 'l' && !sumL.vorschlag && sumL.l.map(r => r.t + r.k).join(' ') === '2x 3x 4d', 'Info: leicht an, Auswahl wie gespielt', sumL);

console.log('[Voll]');
u0 = await undoN();
ok(await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v')), 'Refrain voll');
ok(await undoN() === u0 + 1, 'genau ein Undo-Schritt');
const sV = await state(p);
{ const d = diff(strip(s0), strip(sV)); ok(d.length === 0, 'voll = genau der Stand vorher (Spuren, eigene Clips, Marken)', d.slice(0, 4)); }
ok(JSON.stringify(sV.song.marks.find(m => m.id === 'M3').vr) === JSON.stringify({l: mL.vr.l}), 'die leichte Auswahl bleibt gespeichert (vr.l)', sV.song.marks.find(m => m.id === 'M3').vr);
{ const d = diffNotes(log0, notesOf(await playLog(p))); ok(!d.onlyA.length && !d.onlyB.length, 'voll klingt wie vorher (Noten-Log)', d); }
ok(!(await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v'))), 'noch einmal [Voll]: nichts geändert, kein Undo-Schritt');

console.log('Undo / Redo');
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(sL, await state(p)).length === 0, 'Undo → leicht (exakt)', diff(sL, await state(p)).slice(0, 3));
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(s0, await state(p)).length === 0 && JSON.stringify(s0) === JSON.stringify(await state(p)), 'Undo → Anfang (byte-gleich)');
await p.evaluate(() => SYNQUENZER.redo());
ok(diff(sL, await state(p)).length === 0, 'Redo → leicht');
await p.evaluate(() => SYNQUENZER.redo());
ok(diff(sV, await state(p)).length === 0, 'Redo → voll');
ok(await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l')) && diff(sL, await state(p)).length === 0, 'wieder [Leicht]: die gespeicherte Auswahl (gleich wie das erste Mal)');

console.log('Bearbeiten: jede Fassung merkt sich ihre Auswahl');
ok(await p.evaluate(() => SYNQUENZER.markSeg('M3', 1, 0, false)), 'in leicht: S2 (Akkord) auch aus');
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v'));
let segs = await p.evaluate(() => SYNQUENZER.markSegs('M3'));
ok(segs.every(s => s.on) && !(await state(p)).song.marks.find(m => m.id === 'M3').off, 'voll: alles an', segs);
ok(await p.evaluate(() => SYNQUENZER.markSeg('M3', 3, 0, false)), 'in voll: S4 (Lead) aus');
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
segs = await p.evaluate(() => SYNQUENZER.markSegs('M3'));
ok(segs.filter(s => !s.on).map(s => s.t).join() === '1,2,3' && segs.find(s => s.t === 4).own, 'leicht: S2 S3 S4 aus, Drums dünn', segs);
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v'));
segs = await p.evaluate(() => SYNQUENZER.markSegs('M3'));
ok(segs.filter(s => !s.on).map(s => s.t).join() === '3' && !segs.find(s => s.t === 4).own, 'voll: nur S4 aus, Drums original', segs);
await p.evaluate(() => { while (UNDO.length) undo(); });
ok(diff(s0, await state(p)).length === 0, 'alles rückgängig = Anfang');

console.log('Variante kopieren → einfügen');
await p.evaluate(() => { SYNQUENZER.markFassungSet('M3', 'l'); SYNQUENZER.fassungKopieren('M3'); });
const ab = await p.evaluate(() => SYNQUENZER.fassungAblage());
ok(ab && ab.f === 'l' && ab.tr[2].all === 'x' && ab.tr[3].all === 'x' && ab.tr[4].all === 'd' && ab.tr[0].all === '', 'Ablage: Fassung leicht, je Spur', ab);
const sB = await state(p);
u0 = await undoN();
ok(await p.evaluate(() => SYNQUENZER.fassungEinfuegen('M2')), 'in die Strophe eingefügt');
ok(await undoN() === u0 + 1, 'ein Undo-Schritt');
const logP = notesOf(await playLog(p)), Sx = logP.filter(n => inR(n, 2, 6)), Sx0 = log0.filter(n => inR(n, 2, 6));
ok(await p.evaluate(() => SYNQUENZER.markFassung('M2')) === 'l' && !Sx.some(n => n[0] === 2 || n[0] === 3) && !Sx.some(n => n[0] === 4 && (n[2] === 49 || n[2] === 46)), 'Strophe leicht: S3 S4 aus, Drums dünn');
{ const d = diffNotes(Sx0.filter(n => n[0] === 0 || n[0] === 1 || n[0] === 5), Sx.filter(n => n[0] === 0 || n[0] === 1 || n[0] === 5)); ok(!d.onlyA.length && !d.onlyB.length, 'Strophe: Bass, Akkord, Melodie unverändert', d); }
{ const a = logP.filter(n => inR(n, 6, 10)), c = logL.filter(n => inR(n, 6, 10)); const d = diffNotes(a, c); ok(!d.onlyA.length && !d.onlyB.length, 'Refrain bleibt leicht'); }
ok(await p.evaluate(() => SYNQUENZER.fassungEinfuegen('M4')) && await p.evaluate(() => SYNQUENZER.markFassung('M4')) === 'l', 'auch ins Outro eingefügt');
await p.evaluate(() => SYNQUENZER.undo());
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(sB, await state(p)).length === 0, 'Undo, Undo = vor dem Einfügen (exakt)');
await p.evaluate(() => { SYNQUENZER.fassungKopieren('M1'); });
ok(await p.evaluate(() => SYNQUENZER.fassungAblage().f) === 'v', 'Intro (voll) kopiert');
ok(await p.evaluate(() => SYNQUENZER.fassungEinfuegen('M3')) && await p.evaluate(() => SYNQUENZER.markFassung('M3')) === 'v', 'Voll in den Refrain eingefügt');
{ const d = diff(strip(s0), strip(await state(p))); ok(d.length === 0, 'Refrain wieder wie am Anfang', d.slice(0, 3)); }
await p.evaluate(() => SYNQUENZER.undo());

console.log('Speichern / Laden');
await p.evaluate(() => { SYNQUENZER.fassungKopieren('M3'); SYNQUENZER.fassungEinfuegen('M2'); });
const sS = await state(p), logS = notesOf(await playLog(p));
const js = await p.evaluate(() => SYNQUENZER.serialize());
ok(await p.evaluate(j => SYNQUENZER.importJSON(j), js), 'geladen');
await p.waitForTimeout(300);
const sR = await state(p);
ok(diff(sS, sR).length === 0, 'Laden = deep-equal (Song + Teile)', diff(sS, sR).slice(0, 4));
ok(JSON.stringify(sS.song) === JSON.stringify(sR.song), 'Song byte-gleich');
{ const d = diffNotes(logS, notesOf(await playLog(p))); ok(!d.onlyA.length && !d.onlyB.length, 'klingt nach dem Laden gleich', d); }
await p.evaluate(() => { S.bpm = 240; SYNQUENZER.markFassungSet('M3', 'v'); SYNQUENZER.markFassungSet('M2', 'v'); });
{ const d = diff(strip(s0).song.lanes, (await state(p)).song.lanes).concat(diff(s0.song.own || {}, (await state(p)).song.own || {})); ok(d.length === 0, 'nach dem Laden: [Voll] bringt die Originale', d.slice(0, 3)); }

console.log('Alte Songs (4.30.0)');
const O = await open({app: OLD});
await buildSong(O.p, {cats: true});
await O.p.evaluate(() => { S.bpm = 240; SYNQUENZER.markSeg('M3', 2, 0, false); SYNQUENZER.makeOwn(0, 4, false); const c = S.song.own && Object.values(S.song.own)[0]; if (c) c.notes.push({t: 3.5, d: .25, n: 50, v: .9}); songChanged(); });
const jOld = await O.p.evaluate(() => SYNQUENZER.serialize()), logOld = notesOf(await playLog(O.p));
ok(await p.evaluate(j => SYNQUENZER.importJSON(j), jOld), 'Datei aus 4.30.0 geladen');
await p.waitForTimeout(300);
const jNew = await p.evaluate(() => SYNQUENZER.serialize());
const pr = s => { const o = JSON.parse(s); const pj = o.project || o; return JSON.stringify({song: pj.song, parts: pj.parts, tracks: pj.tracks}); };
ok(pr(jOld) === pr(jNew), 'gespeichert: Song, Teile, Spuren byte-gleich', diff(JSON.parse(pr(jOld)), JSON.parse(pr(jNew))).slice(0, 3));
ok(!/"vr"/.test(jNew), 'kein neues Feld in einem alten Song');
await p.evaluate(() => { S.bpm = 240; });
{ const d = diffNotes(logOld, notesOf(await playLog(p))); ok(!d.onlyA.length && !d.onlyB.length, 'alter Song klingt gleich (Noten-Log alt gegen neu, ' + logOld.length + ')', {a: d.onlyA.slice(0, 3), b: d.onlyB.slice(0, 3)}); }
ok(O.errs.length === 0 && errs.length === 0, 'keine Konsolenfehler', errs.concat(O.errs));
await O.b.close(); await b.close();
process.exit(summary('SX11-Fassung') ? 1 : 0);
