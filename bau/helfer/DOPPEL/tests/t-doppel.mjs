// DOPPEL A: die zusammengelegten Knöpfe Spiegeln / Umdrehen / Tauschen per Finger (echte Touch-Tipps über CDP):
// Leiste (je Funktion EIN Knopf, gezeichnetes Symbol, Achsen-Schalter neben Spiegeln, ≥ 44 px, Leistenhöhe wie R-4300),
// Auswahl / Bereich (Lineal-Takte) / ganzer Clip, beide Achsen, Tonart der Stelle, je Geste ein Undo, alte API-Namen
import {open, ok, sleep, clipRoll, notes, done, failed, OLD} from './lib.mjs';
const S = ns => JSON.stringify(ns.map(n => [n.t, n.d, n.n]));
const mk = a => a.map(([t, d, n]) => ({t, d, n, v: .8}));
const pr = ns => ns.map(n => n.n).join(' ');

// ---- Leiste: R-4300 gegen DOPPEL, gleiche Höhe
async function bar(file) {
  const H = await open(428, 926, {file});
  await clipRoll(H, null, {len: 1});
  const r = await H.E(() => { const acts = window.SYNQUENZER.rollApi().el.acts, bs = [...acts.querySelectorAll('button')].filter(b => b.offsetWidth);
    return {h: Math.round(acts.getBoundingClientRect().height * 10) / 10, labels: bs.map(b => b.textContent.trim()),
      btn: bs.filter(b => ['Spiegeln', 'Umdrehen', 'Tauschen'].includes(b.textContent.trim())).map(b => { const q = b.getBoundingClientRect(), a = getComputedStyle(b, '::after');
        return {t: b.textContent.trim(), svg: !!b.querySelector('svg'), w: q.width, hit: q.height + (a.content !== 'none' ? -parseFloat(a.top) - parseFloat(a.bottom) : 0), cut: b.scrollWidth > b.clientWidth + 1}; }),
      next: (() => { const m = bs.find(b => b.textContent.trim() === 'Spiegeln'); return m && m.nextElementSibling ? m.nextElementSibling.textContent.trim() : null; })(),
      arrows: /[↕↔⇆]/.test(acts.textContent)}; });
  await H.b.close(); return r;
}
const b0 = await bar(OLD), b1 = await bar();
const cnt = (L, t) => L.filter(x => x === t).length;
ok(cnt(b1.labels, 'Spiegeln') === 1 && cnt(b1.labels, 'Umdrehen') === 1 && cnt(b1.labels, 'Tauschen') === 1, 'je Funktion genau ein Knopf: Spiegeln, Umdrehen, Tauschen');
ok(!b1.labels.some(l => /Umkehren|Krebs/.test(l)), 'Umkehren ↕ und Krebs ↔ sind weg (vorher: ' + b0.labels.filter(l => /Umkehren|Krebs/.test(l)).join(', ') + ')');
ok(!b1.arrows, 'keine Pfeil-Zeichen ↕ ↔ ⇆ mehr in der Leiste (gezeichnete Symbole)');
ok(b1.btn.length === 3 && b1.btn.every(b => b.svg && !b.cut && b.w >= 44 && b.hit >= 44), 'Spiegeln/Umdrehen/Tauschen: SVG-Symbol, nicht abgeschnitten, Touch-Ziel ≥ 44 px ' + JSON.stringify(b1.btn.map(b => [b.t, Math.round(b.w), Math.round(b.hit)])));
ok(b1.next === 'Achse: Mitte', 'Achsen-Schalter direkt neben Spiegeln (Standard Mitte): ' + b1.next);
ok(b1.h === b0.h, `Leistenhöhe ± 0 px: R-4300 ${b0.h} px, DOPPEL ${b1.h} px`);
ok(b1.labels.length === b0.labels.length - 2, `Leiste zwei Knöpfe kürzer: ${b0.labels.length} → ${b1.labels.length}`);

const H = await open(428, 926);
const undoN = () => H.E(() => window.SYNQUENZER.gestures().undo);
const loop = (a, b) => H.E(([a, b]) => window.SYNQUENZER.rollApi().setLoop(a, b), [a, b]);
const sel = ix => H.E(ix => window.SYNQUENZER.rollApi().selectIdx(ix), ix);
const axis = () => H.E(() => window.SYNQUENZER.rollApi().mp.state.axis);
const tap = async l => { await H.tapBtn('.pr-bar button', l); await sleep(80); };

// ---- Spiegeln, ganzer Clip, Achse Mitte (wie N1): C D E G → G F E C
const C4 = mk([[0, .5, 60], [1, .25, 62], [2, .75, 64], [3, 1, 67]]);
await clipRoll(H, C4, {len: 1});
ok(await axis() === 'mid', 'Achse Standard: Mitte');
let u0 = await undoN();
await tap('Spiegeln');
let ns = await notes(H);
ok(pr(ns) === '67 65 64 60', 'Spiegeln ganzer Clip (Mitte): 60 62 64 67 → ' + pr(ns));
ok(await undoN() - u0 === 1, 'Spiegeln: ein Undo-Schritt');
await H.E(() => window.SYNQUENZER.undo()); await sleep(120);
ok(S(await notes(H)) === S(C4), 'Undo nach Spiegeln = Original');
// Auswahl: nur D und E
await sel([1, 2]); await tap('Spiegeln');
ok(pr(await notes(H)) === '60 64 62 67', 'Spiegeln Auswahl (D, E): ' + pr(await notes(H)));
// ---- Achse 1. Note, Bereich Takt 1 (Takt 2 bleibt): 60 64 67 72 → 60 57 53 48
const BAR1 = [[0, 1, 60], [1, 1, 64], [2, 1, 67], [3, 1, 72]], BAR2 = [[4, 1, 62], [5, .5, 65], [6.5, 1.5, 69]];
await clipRoll(H, mk([...BAR1, ...BAR2]), {len: 2});
await tap('Achse: Mitte');
ok(await axis() === 'first', 'Schalter: Achse 1. Note');
await loop(0, 0); u0 = await undoN();
await tap('Spiegeln');
ok(S(await notes(H)) === S(mk([[0, 1, 60], [1, 1, 57], [2, 1, 53], [3, 1, 48], ...BAR2])), 'Spiegeln Bereich Takt 1, Achse 1. Note: ' + pr(await notes(H)));
ok(await undoN() - u0 === 1, 'Spiegeln (Bereich): ein Undo-Schritt');
await tap('Spiegeln');
ok(S(await notes(H)) === S(mk([...BAR1, ...BAR2])), 'zweimal Spiegeln = Original');
// Achse 1. Note: leiterfremd → in die Tonart gerastet (wie Umkehren): C, F♯ → C, F3
await clipRoll(H, mk([[0, 1, 60], [1, 1, 66]]), {len: 1});
await tap('Spiegeln');
ok(pr(await notes(H)) === '60 53', 'Achse 1. Note: F♯ um C → F3 (gerastet): ' + pr(await notes(H)));
await tap('Achse: 1. Note');
ok(await axis() === 'mid', 'zurück auf Mitte');
// Achse Mitte: leiterfremd bleibt exakt, zweimal = Ausgangslage (wie N1)
const AM = mk([[0, .5, 57], [1, .5, 61], [2, .5, 66], [3, .5, 72]]);
await clipRoll(H, AM, {len: 1, root: 9, scale: 'aeolian'});
await tap('Spiegeln'); const am1 = pr(await notes(H)); await tap('Spiegeln');
ok(S(await notes(H)) === S(AM) && am1 === '72 68 63 57', 'Achse Mitte, a-Moll mit C♯/F♯: 57 61 66 72 → ' + am1 + ' → zurück gleich');
// ---- Tonart der Stelle: Handwahl D-Dur (Pinsel-Tonart) gilt auch für Spiegeln; ohne Handwahl die Clip-Tonart
const DD = mk([[0, 1, 62], [1, 1, 64], [2, 1, 66], [3, 1, 69]]);
await clipRoll(H, DD, {len: 1});
await tap('Spiegeln');
ok(pr(await notes(H)) === '69 67 65 62', 'C-Dur-Clip: D E F♯ A → A G F D (F♯ leiterfremd, exakt)');
await clipRoll(H, DD, {len: 1});
await H.E(() => window.SYNQUENZER.rollApi().mp.setKey({root: 2, scale: 'ionian'}));
await tap('Spiegeln');
ok(pr(await notes(H)) === '69 67 66 62', 'Tonart der Stelle D-Dur: D E F♯ A → A G F♯ D');
await H.E(() => window.SYNQUENZER.rollApi().mp.setKey(null));

// ---- Umdrehen: ganzer Clip, Auswahl, Bereich (Note über das Bereichsende)
await clipRoll(H, C4, {len: 1}); u0 = await undoN();
await tap('Umdrehen');
ok(S(await notes(H)) === S(mk([[0, 1, 67], [1.25, .75, 64], [2.75, .25, 62], [3.5, .5, 60]])), 'Umdrehen ganzer Clip: t\' = 4 − t − d, Länge je Note bleibt');
ok(await undoN() - u0 === 1, 'Umdrehen: ein Undo-Schritt');
await tap('Umdrehen');
ok(S(await notes(H)) === S(C4), 'zweimal Umdrehen = Original');
await sel([1, 2]); await tap('Umdrehen');
ok(S(await notes(H)) === S(mk([[0, .5, 60], [1, .75, 64], [2.5, .25, 62], [3, 1, 67]])), 'Umdrehen Auswahl (Bereich 1 … 2,75): ' + S(await notes(H)));
await clipRoll(H, mk([[0, 1, 60], [1, 1, 62], [3, 2, 64], [4, 1, 65], [6, 1, 67]]), {len: 2});
await loop(0, 0); await tap('Umdrehen');
ok(S(await notes(H)) === S(mk([[0, 2, 64], [2, 1, 62], [3, 1, 60], [4, 1, 65], [6, 1, 67]])), 'Umdrehen Bereich Takt 1: Note über das Bereichsende rechnet bis Taktende, Takt 2 bleibt: ' + S(await notes(H)));
// Auswahl hat Vorrang vor dem Bereich
await clipRoll(H, mk([[0, 1, 60], [1, 1, 62], [2, 1, 64], [3, 1, 65], [4, 1, 67]]), {len: 2});
await loop(0, 1); await sel([1, 2]); await tap('Umdrehen');
ok(S(await notes(H)) === S(mk([[0, 1, 60], [1, 1, 64], [2, 1, 62], [3, 1, 65], [4, 1, 67]])), 'Auswahl vor Bereich: nur die gewählten Noten');

// ---- Tauschen (unverändert, neues Symbol)
await clipRoll(H, mk([...BAR1, ...BAR2]), {len: 2});
await loop(0, 1); u0 = await undoN();
await tap('Tauschen');
ok(S(await notes(H)) === S(mk([[0, 1, 62], [1, .5, 65], [2.5, 1.5, 69], [4, 1, 60], [5, 1, 64], [6, 1, 67], [7, 1, 72]])), 'Tauschen Takt 1 ↔ 2 exakt');
ok(await undoN() - u0 === 1, 'Tauschen: ein Undo-Schritt');
await H.E(() => window.SYNQUENZER.undo()); await sleep(120);
ok(S(await notes(H)) === S(mk([...BAR1, ...BAR2])), 'Undo nach Tauschen = Original');

// ---- alte API-Namen zeigen auf die neuen Funktionen
await clipRoll(H, C4, {len: 1});
const api = await H.E(() => { const m = window.SYNQUENZER.rollApi().mp; return ['spiegeln', 'umdrehen', 'tauschen', 'invert', 'crab', 'swap'].map(k => typeof m[k]); });
ok(api.every(t => t === 'function'), 'API: spiegeln/umdrehen/tauschen + alte Namen invert/crab/swap aufrufbar');
await H.E(() => window.SYNQUENZER.rollApi().mp.invert()); await sleep(80);
ok(pr(await notes(H)) === '67 65 64 60', 'mp.invert() = Spiegeln');
await H.E(() => window.SYNQUENZER.rollApi().mp.crab()); await sleep(80);
ok(pr(await notes(H)) === '60 64 65 67', 'mp.crab() = Umdrehen');
await done(H, 'Doppel');
process.exit(failed() ? 1 : 0);
