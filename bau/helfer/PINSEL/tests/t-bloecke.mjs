// PINSEL B: Umkehren ↕ (Achse 1. Note / Mitte, in Tonart), Krebs ↔, Tauschen ⇆ – exakt, je ein Undo, über die echten Knöpfe
import {open, ok, sleep, clipRoll, notes, done, failed} from './lib.mjs';
const H = await open(428, 926);
const S = (ns) => JSON.stringify(ns.map(n => [n.t, n.d, n.n]));
const mk = a => a.map(([t, d, n]) => ({t, d, n, v: .8}));
const undoN = () => H.E(() => window.SYNQUENZER.gestures().undo);
const loop = (a, b) => H.E(([a, b]) => window.SYNQUENZER.rollApi().setLoop(a, b), [a, b]);

// Umkehren um die erste Note: C E G C → C A F C (C-Dur, diatonisch)
const BAR1 = [[0, 1, 60], [1, 1, 64], [2, 1, 67], [3, 1, 72]];
const BAR2 = [[4, 1, 62], [5, .5, 65], [6.5, 1.5, 69]];
await clipRoll(H, mk([...BAR1, ...BAR2]), {len: 2});
await loop(0, 0);
let u0 = await undoN();
await H.tapBtn('.pr-bar button', 'Umkehren ↕');
let ns = await notes(H);
ok(S(ns) === S(mk([[0, 1, 60], [1, 1, 57], [2, 1, 53], [3, 1, 48], ...BAR2])), 'Umkehren (Takt 1, Achse 1. Note): 60 64 67 72 → 60 57 53 48, Takt 2 unverändert');
ok(await undoN() - u0 === 1, 'Umkehren: ein Undo-Schritt');
await H.tapBtn('.pr-bar button', 'Umkehren ↕');
ok(S(await notes(H)) === S(mk([...BAR1, ...BAR2])), 'zweimal Umkehren = Original (eigene Umkehrung)');
// Achse Mitte: D F A (Takt 2) gespiegelt um die Mitte zwischen D und A → A F D
await loop(1, 1);
await H.tapBtn('.pr-bar button', 'Achse: 1. Note');
ok(await H.E(() => window.SYNQUENZER.rollApi().mp.state.axis) === 'mid', 'Achse umgeschaltet: Mitte');
await H.tapBtn('.pr-bar button', 'Umkehren ↕');
ok(S(await notes(H)) === S(mk([...BAR1, [4, 1, 69], [5, .5, 65], [6.5, 1.5, 62]])), 'Umkehren (Takt 2, Achse Mitte): 62 65 69 → 69 65 62');
await H.tapBtn('.pr-bar button', 'Achse: Mitte');
// in Tonart gerastet: Ton außerhalb (F♯) in C-Dur um C gespiegelt → zwischen F und G gespiegelt = F♯ → gerastet F (abwärts)
await clipRoll(H, mk([[0, 1, 60], [1, 1, 66]]), {len: 1});
await H.tapBtn('.pr-bar button', 'Umkehren ↕');
ns = await notes(H);
ok(ns.every(n => [0, 2, 4, 5, 7, 9, 11].includes(n.n % 12)) && ns[1].n === 53, 'Umkehren: Ergebnis in Tonart gerastet (F♯4 um C4 → F3 = 53, war ' + ns[1].n + ')');
// a-Moll-Clip: Umkehren rechnet in a-Moll-Stufen: A C E → A F♯? nein: A C E um A → A F D (a-Moll: A G F E D … abwärts)
await clipRoll(H, mk([[0, 1, 57], [1, 1, 60], [2, 1, 64]]), {len: 1, root: 9, scale: 'aeolian'});
await H.tapBtn('.pr-bar button', 'Umkehren ↕');
ok(S(await notes(H)) === S(mk([[0, 1, 57], [1, 1, 53], [2, 1, 50]])), 'Umkehren in a-Moll: 57 60 64 → 57 53 50');

// Krebs im Takt 2 (a = 4, b = 8): t' = 12 − t − d
await clipRoll(H, mk([...BAR1, ...BAR2]), {len: 2});
await loop(1, 1); u0 = await undoN();
await H.tapBtn('.pr-bar button', 'Krebs ↔');
ok(S(await notes(H)) === S(mk([...BAR1, [4, 1.5, 69], [6.5, .5, 65], [7, 1, 62]])), 'Krebs (Takt 2): 4/1/62 5/.5/65 6,5/1,5/69 → 7/1/62 6,5/.5/65 4/1,5/69, Takt 1 unverändert');
ok(await undoN() - u0 === 1, 'Krebs: ein Undo-Schritt');
await H.tapBtn('.pr-bar button', 'Krebs ↔');
ok(S(await notes(H)) === S(mk([...BAR1, ...BAR2])), 'zweimal Krebs = Original');
// Krebs ohne Takte = ganzer Clip
await loop(null);
await H.tapBtn('.pr-bar button', 'Krebs ↔');
ok(S(await notes(H)) === S(mk([[0, 1.5, 69], [2.5, .5, 65], [3, 1, 62], [4, 1, 72], [5, 1, 67], [6, 1, 64], [7, 1, 60]])), 'Krebs ganzer Clip exakt');

// Tauschen: Takte 1–2 gewählt → Takt 1 ↔ Takt 2
await clipRoll(H, mk([...BAR1, ...BAR2]), {len: 2});
await loop(0, 1); u0 = await undoN();
await H.tapBtn('.pr-bar button', 'Tauschen ⇆');
ok(S(await notes(H)) === S(mk([[0, 1, 62], [1, .5, 65], [2.5, 1.5, 69], [4, 1, 60], [5, 1, 64], [6, 1, 67], [7, 1, 72]])), 'Tauschen Takt 1 ↔ 2 exakt');
ok(await undoN() - u0 === 1, 'Tauschen: ein Undo-Schritt');
await H.E(() => window.SYNQUENZER.undo()); await sleep(150);
ok(S(await notes(H)) === S(mk([...BAR1, ...BAR2])), 'Undo nach Tauschen = Original');
await H.E(() => window.SYNQUENZER.redo()); await sleep(150);
ok(S(await notes(H)) === S(mk([[0, 1, 62], [1, .5, 65], [2.5, 1.5, 69], [4, 1, 60], [5, 1, 64], [6, 1, 67], [7, 1, 72]])), 'Redo nach Tauschen exakt');
// 4 Takte, Takte 1–4: 1–2 ↔ 3–4; Takte außerhalb bleiben
await clipRoll(H, mk([[0, 1, 60], [4, 1, 62], [8, 1, 64], [12, 1, 65], [14, 1, 67]]), {len: 4});
await loop(0, 3);
await H.tapBtn('.pr-bar button', 'Tauschen ⇆');
ok(S(await notes(H)) === S(mk([[0, 1, 64], [4, 1, 65], [6, 1, 67], [8, 1, 60], [12, 1, 62]])), 'Tauschen 1–2 ↔ 3–4 exakt');
await loop(1, 2);
await H.tapBtn('.pr-bar button', 'Tauschen ⇆');
ok(S(await notes(H)) === S(mk([[0, 1, 64], [4, 1, 60], [8, 1, 65], [10, 1, 67], [12, 1, 62]])), 'Tauschen Takt 2 ↔ 3 (Takt 1 und 4 bleiben)');
// Auswahl (ohne Takte): nur die gewählten Noten, Bereich erste … letzte
await clipRoll(H, mk([[0, 1, 60], [1, 1, 62], [2, 1, 64], [3, 1, 65]]), {len: 1});
await H.E(() => window.SYNQUENZER.rollApi().selectIdx([1, 2]));
await H.tapBtn('.pr-bar button', 'Krebs ↔');
ok(S(await notes(H)) === S(mk([[0, 1, 60], [1, 1, 64], [2, 1, 62], [3, 1, 65]])), 'Krebs mit Auswahl: nur gewählte Noten');
// Speichern → Laden deep-equal nach den Block-Werkzeugen
{
  const a = await H.E(() => JSON.stringify(window.SYNQUENZER.state().project));
  await H.E(() => window.SYNQUENZER.save()); await sleep(400);
  await H.E(() => window.SYNQUENZER.load()); await sleep(800);
  const b = await H.E(() => JSON.stringify(window.SYNQUENZER.state().project));
  ok(a === b, 'Speichern → Laden deep-equal');
}
await done(H, 'Blöcke');
process.exit(failed() ? 1 : 0);
