// DOPPEL B: Gleichheit mit den alten Funktionen – dieselben Clips und Fälle in R-4300 (alte Knöpfe) und DOPPEL (neue Knöpfe), per Finger:
//   N1 Spiegeln → Spiegeln (Achse Mitte), N1 Umdrehen → Umdrehen   (ganzer Clip, Auswahl; ohne Lineal-Bereich)
//   PINSEL Umkehren ↕ → Spiegeln (gleiche Achse), Krebs ↔ → Umdrehen, Tauschen ⇆ → Tauschen   (Lineal-Bereich, ganzer Clip; ohne Auswahl)
// Ergebnis-Noten und Undo-Anzahl müssen gleich sein. Dazu: Projekt aus R-4300 laden/speichern Zeichen für Zeichen gleich.
import {open, ok, sleep, clipRoll, notes, done, failed, OLD, APP} from './lib.mjs';
const S = ns => JSON.stringify(ns.map(n => [n.t, n.d, n.n, n.v]));
// reproducible random clips (2 bars), in a key, some notes out of the key, some across a bar line
let seed = 4300; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const KEYS = [{root: 0, scale: 'ionian'}, {root: 9, scale: 'aeolian'}, {root: 2, scale: 'dorian'}, {root: 7, scale: 'mixolydian'}];
const CLIPS = [];
for (let c = 0; c < 8; c++) {
  const k = KEYS[c % KEYS.length], n = 4 + Math.floor(rnd() * 7), ns = [];
  for (let i = 0; i < n; i++) { const t = Math.floor(rnd() * 32) / 4, d = [.25, .5, 1, 1.5, 2][Math.floor(rnd() * 5)]; ns.push({t, d: Math.min(d, 8 - t), n: 48 + Math.floor(rnd() * 30), v: +(.3 + rnd() * .6).toFixed(2)}); }
  ns.sort((a, b) => a.t - b.t || a.n - b.n);
  CLIPS.push({k, ns: ns.filter((x, i) => !ns.slice(0, i).some(y => y.t === x.t && y.n === x.n))});
}
// cases: [name, old button, new button, axis, loop [a, b] | null, selection idx | null]
const CASES = [];
for (const ax of ['mid', 'first']) for (const lp of [[0, 0], [1, 1], [0, 1], null]) CASES.push([`Umkehren→Spiegeln ${ax} ${lp ? 'Takte ' + lp.join('–') : 'ganz'}`, 'Umkehren ↕', 'Spiegeln', ax, lp, null]);
for (const lp of [[0, 0], [1, 1], null]) CASES.push([`Krebs→Umdrehen ${lp ? 'Takte ' + lp.join('–') : 'ganz'}`, 'Krebs ↔', 'Umdrehen', null, lp, null]);
for (const lp of [[0, 1], null]) CASES.push([`Tauschen ${lp ? 'Takte ' + lp.join('–') : 'ganz'}`, 'Tauschen ⇆', 'Tauschen', null, lp, null]);
CASES.push(['N1 Spiegeln ganz', 'Spiegeln', 'Spiegeln', 'mid', null, null], ['N1 Spiegeln Auswahl', 'Spiegeln', 'Spiegeln', 'mid', null, 'sel'],
  ['N1 Umdrehen ganz', 'Umdrehen', 'Umdrehen', null, null, null], ['N1 Umdrehen Auswahl', 'Umdrehen', 'Umdrehen', null, null, 'sel']);

async function runAll(file, isOld) {
  const H = await open(428, 926, {file}), out = [];
  for (const [ci, C] of CLIPS.entries()) for (const [name, ob, nb, ax, lp, sl] of CASES) {
    await clipRoll(H, C.ns, {len: 2, root: C.k.root, scale: C.k.scale});
    if (ax) await H.E(a => window.SYNQUENZER.rollApi().mp.setAxis(a), ax);
    if (lp) await H.E(([a, b]) => window.SYNQUENZER.rollApi().setLoop(a, b), lp);
    if (sl) await H.E(n => window.SYNQUENZER.rollApi().selectIdx([1, 2, n - 1].filter((x, i, a) => x < n && a.indexOf(x) === i)), C.ns.length);
    const n0 = S(await notes(H));
    await H.tapBtn('.pr-bar button', isOld ? ob : nb); await sleep(60);
    const r = S(await notes(H));
    // one undo: back to the start (the undo counter is capped after many gestures, so it is checked by result)
    let u = 0; if (r !== n0) { await H.E(() => window.SYNQUENZER.undo()); await sleep(60); u = S(await notes(H)) === n0 ? 1 : -1; }
    out.push({id: `Clip ${ci + 1} · ${name}`, r, u, ch: r !== n0, k: C.k, mid: name.startsWith('Umkehren→Spiegeln mid')});
  }
  // project file: R-4300 demo → serialize; load the same text, serialize again
  const proj = await H.E(async () => { const D = window.SYNQUENZER; return D.serialize(); });
  const errs = H.errs.filter(x => !/AudioContext|autoplay/i.test(x));
  await H.b.close(); return {out, proj, errs};
}
const A = await runAll(OLD, true), B = await runAll(APP, false);
// bewusst anders (CHANGES.md Nr. 5): altes Umkehren mit Achse MITTE rastete leiterfremde Ergebnisse in die Tonart, Spiegeln (Mitte) rechnet exakt wie N1.
// Erlaubt ist dort nur: dieselben Noten, außer Tönen, die neu leiterfremd sind und alt genau einen Halbton daneben in der Tonart lagen.
const SCL = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10]};
const inK = (n, k) => SCL[k.scale].includes(((n - k.root) % 12 + 12) % 12);
const onlySnap = (a, b) => { const x = JSON.parse(a.r), y = JSON.parse(b.r); return x.length === y.length && x.every((p, i) => p[0] === y[i][0] && p[1] === y[i][1] && p[3] === y[i][3] && (p[2] === y[i][2] || (!inK(y[i][2], b.k) && inK(p[2], b.k) && Math.abs(p[2] - y[i][2]) === 1))); };
let same = 0, snap = 0, bad = [];
for (let i = 0; i < A.out.length; i++) { const a = A.out[i], b = B.out[i];
  if (a.r === b.r && a.u === b.u) same++; else if (b.mid && a.u === b.u && onlySnap(a, b)) snap++; else bad.push({id: a.id, alt: a.r + ' u' + a.u, neu: b.r + ' u' + b.u}); }
ok(!bad.length, `alt = neu in ${same}/${A.out.length} Fällen (8 Zufalls-Clips × ${CASES.length} Fälle), dazu ${snap} bewusst anders (Umkehren Mitte: nur leiterfremde Töne nicht mehr gerastet)` + (bad.length ? '\n' + bad.slice(0, 4).map(b => `   ${b.id}\n     alt ${b.alt}\n     neu ${b.neu}`).join('\n') : ''));
ok([...A.out, ...B.out].every(x => !x.ch || x.u === 1), 'jede Geste genau ein Undo (1× Undo = Ausgangslage), alt und neu');
const changed = A.out.filter(x => x.ch).length;
ok(changed > A.out.length * .6, `Test greift: ${changed}/${A.out.length} Fälle ändern den Clip wirklich`);
ok(!A.errs.length && !B.errs.length, 'keine Konsolenfehler (alt/neu)');

// Speichern / Laden: das R-4300-Projekt (Demo + bearbeiteter Clip) in DOPPEL laden und wieder speichern = Zeichen für Zeichen gleich
{
  const H = await open(428, 926, {file: OLD});
  await clipRoll(H, CLIPS[0].ns, {len: 2});
  const t0 = await H.E(() => window.SYNQUENZER.serialize()); await H.b.close();
  const H2 = await open(428, 926);
  const r = await H2.E(async t => { const D = window.SYNQUENZER; await D.importJSON(t); await new Promise(r => setTimeout(r, 600)); return D.serialize(); }, t0);
  const e2 = H2.errs.filter(x => !/AudioContext|autoplay/i.test(x)); await H2.b.close();
  const H3 = await open(428, 926, {file: OLD});
  const r0 = await H3.E(async t => { const D = window.SYNQUENZER; await D.importJSON(t); await new Promise(r => setTimeout(r, 600)); return D.serialize(); }, t0); await H3.b.close();
  ok(r === r0, `Projekt aus R-4300: laden + speichern in DOPPEL = in R-4300, Zeichen für Zeichen (${r.length} Zeichen)`);
  ok(!e2.length, 'Laden ohne Konsolenfehler ' + JSON.stringify(e2.slice(0, 2)));
}
process.exit(failed() ? 1 : 0);
