// PINSEL A: Pinselzug – nur Einzugsbereich, Abfall zum Rand, Tonart + Raster, Breite, Undo/Redo (ein Schritt pro Zug)
import {open, ok, sleep, clipRoll, notes, xy, inC, done, failed} from './lib.mjs';
const H = await open(428, 926);
const flat = Array.from({length: 16}, (_, i) => ({t: i * .25, d: .25, n: 60, v: .8}));
const W = {schmal: .5, mittel: 1, breit: 2};
const wOf = (d, R) => (d >= R ? 0 : .5 * (1 + Math.cos(Math.PI * d / R)));
const dist = (b, t, d) => (b < t ? t - b : b > t + d ? b - (t + d) : 0);

// 1) Pinselpunkt (Tippen) bei Schlag 2,125 auf Höhe C5 (72), jede Breite
const changed = {};
for (const w of ['schmal', 'mittel', 'breit']) {
  await clipRoll(H, flat);
  await H.tapBtn('.pr-bar button', 'Pinsel');
  await H.tapBtn('.pr-bar button', w);
  const st = await H.E(() => window.SYNQUENZER.rollApi().mp.state);
  ok(st.tool === 'mpBrush' && st.w === w, `Pinsel aktiv, Breite ${w} (R ${st.R})`);
  const u0 = await H.E(() => window.SYNQUENZER.gestures().undo);
  const p = await xy(H, 2.125, 72);
  await H.tap(p.x, p.y, 250);
  const ns = await notes(H), u1 = await H.E(() => window.SYNQUENZER.gestures().undo);
  const R = W[w]; let good = true, outside = true, mono = true, ch = 0, beatAt = await H.E(([x]) => { const r = window.SYNQUENZER.rollApi(), v = r.state.view; return v.x0 + (x - r.el.main.getBoundingClientRect().left) / v.ppb; }, [p.x]);
  for (const nt of ns) {
    const d = dist(beatAt, nt.t, .25), wt = wOf(d, R);
    if (wt === 0 && nt.n !== 60) outside = false;
    if (!inC(nt.n)) good = false;
    if (nt.n !== 60) ch++;
    const exp = 60 + wt * 12;                                       // erwartete Höhe vor dem Rasten
    if (Math.abs(nt.n - exp) > 1.01) good = false;                  // gerastet: höchstens ein Halbton daneben … (C-Dur: ≤ 1)
  }
  // Abfall: je weiter weg, desto weniger hoch (links und rechts der Fingerstelle)
  const byD = ns.map(nt => ({d: dist(beatAt, nt.t, .25), n: nt.n})).sort((a, b) => a.d - b.d);
  for (let i = 1; i < byD.length; i++) if (byD[i].n > byD[i - 1].n && byD[i].d > byD[i - 1].d + 1e-9) mono = false;
  ok(ns.find(nt => Math.abs(nt.t - 2) < 1e-6).n === 72, `${w}: Note unter dem Finger = 72 (Fingerhöhe)`);
  ok(outside, `${w}: Noten außerhalb des Einzugsbereichs unverändert`);
  ok(good, `${w}: alle Ergebnisse in C-Dur und = alt + w·(Finger − alt), gerastet`);
  ok(mono, `${w}: Abfall zum Rand (Höhe nimmt mit dem Abstand ab)`);
  ok(u1 - u0 === 1, `${w}: ein Undo-Schritt (${u1 - u0})`);
  changed[w] = ch;
  console.log('  ', w, 'geändert', ch, JSON.stringify(ns.map(n => n.n)));
}
ok(changed.schmal < changed.mittel && changed.mittel < changed.breit, `Breite wirkt: schmal ${changed.schmal} < mittel ${changed.mittel} < breit ${changed.breit}`);

// 2) Malzug quer über den Lauf auf Höhe G4 (67), von Schlag 1,1 bis 2,9 – dazwischen alles 67, außerhalb (Abstand ≥ R) nichts
await clipRoll(H, flat);
await H.tapBtn('.pr-bar button', 'Pinsel'); await H.tapBtn('.pr-bar button', 'schmal');
{
  const a = await xy(H, 1.1, 67), b = await xy(H, 2.9, 67), u0 = await H.E(() => window.SYNQUENZER.gestures().undo);
  const before = await notes(H);
  await H.stroke([[a.x, a.y], [b.x, b.y]], 12, 16);
  const ns = await notes(H), u1 = await H.E(() => window.SYNQUENZER.gestures().undo);
  ok(ns.filter(n => n.t >= 1 && n.t < 2.9).every(n => n.n === 67), 'Zug: überstrichene Noten = 67');
  ok(ns.filter(n => n.t + .25 <= 1.1 - .5 || n.t >= 2.9 + .5).every(n => n.n === 60), 'Zug: Noten weiter als R vom Zug unverändert');
  ok(ns.every(n => inC(n.n)), 'Zug: alles in C-Dur');
  ok(ns.every(n => Math.abs(n.t / .25 - Math.round(n.t / .25)) < 1e-6), 'Zug: alle Anfänge auf dem 1/16-Raster');
  ok(u1 - u0 === 1, 'Zug: genau ein Undo-Schritt');
  const after = ns;
  await H.E(() => window.SYNQUENZER.undo()); await sleep(150);
  ok(JSON.stringify(await notes(H)) === JSON.stringify(before), 'Undo stellt den Lauf exakt wieder her');
  await H.E(() => window.SYNQUENZER.redo()); await sleep(150);
  ok(JSON.stringify(await notes(H)) === JSON.stringify(after), 'Redo stellt den Zug exakt wieder her');
}

// 3) Zacke: an einer Stelle hoch und runter → Nachbarn folgen live, Ende zählt (letzte Stelle)
await clipRoll(H, flat);
await H.tapBtn('.pr-bar button', 'Pinsel'); await H.tapBtn('.pr-bar button', 'breit');
{
  const a = await xy(H, 2.125, 60), up = await xy(H, 2.125, 74), mid = await xy(H, 2.125, 67);
  await H.down(a.x, a.y); await sleep(20);
  for (let k = 1; k <= 8; k++) { await H.move(a.x + (k % 2), a.y + (up.y - a.y) * k / 8); await sleep(16); }
  const live = await notes(H);
  ok(live.find(n => Math.abs(n.t - 2) < 1e-6).n === 74, 'Zacke hoch: Note unter dem Finger folgt live (74)');
  ok(live.filter(n => n.n > 60).length >= 5, 'Zacke hoch: Nachbarn ziehen mit (' + live.filter(n => n.n > 60).length + ')');
  for (let k = 1; k <= 6; k++) { await H.move(a.x, up.y + (mid.y - up.y) * k / 6); await sleep(16); }
  await H.up(); await sleep(150);
  const ns = await notes(H);
  ok(ns.find(n => Math.abs(n.t - 2) < 1e-6).n === 67, 'Zacke zurück auf 67: Note unter dem Finger = 67');
  ok(Math.max(...ns.map(n => n.n)) <= 67, 'Zacke zurück: kein Nachbar höher als der Finger');
}

// 4) Tonart der Stelle / manuell: a-Moll-Clip, Pinsel rastet in a-Moll (= C-Dur-Töne); manuell D-Dur → F♯/C♯ möglich
await clipRoll(H, flat, {root: 9, scale: 'aeolian'});
{
  const k = await H.E(() => window.SYNQUENZER.rollApi().mp.keyAt(0));
  ok(k.root === 9 && k.scale === 'aeolian', 'Auto: Tonart der Stelle = Clip-Tonart a-Moll');
  await H.tapBtn('.pr-bar button', 'Pinsel');
  await H.tapBtn('.pr-bar button', 'Tonart: Auto');
  await H.tapBtn('.pr-bar button', 'D'); await H.tapBtn('.pr-bar button', 'Dur'); await H.tapBtn('.pr-bar button', 'Fertig');
  const k2 = await H.E(() => window.SYNQUENZER.rollApi().mp.state);
  ok(k2.manual && k2.key.root === 2 && k2.key.scale === 'ionian', 'manuell: D-Dur gewählt');
  const p = await xy(H, 2.125, 66);
  await H.tap(p.x, p.y, 250);
  const ns = await notes(H), D = [2, 4, 6, 7, 9, 11, 1];
  ok(ns.find(n => Math.abs(n.t - 2) < 1e-6).n === 66, 'manuell D-Dur: Fingerhöhe F♯4 (66) bleibt F♯');
  ok(ns.every(n => n.n === 60 || D.includes(n.n % 12)), 'alle geänderten Noten in D-Dur');
  ok(JSON.stringify(await H.E(() => window.SYNQUENZER.getClip(0, 0).key)) === JSON.stringify({root: 9, scale: 'aeolian', src: 'user'}), 'manuelle Tonart ändert die Clip-Tonart nicht');
  await H.tapBtn('.pr-bar button', 'Tonart: D Dur'); await H.tapBtn('.pr-bar button', 'Auto'); await H.tapBtn('.pr-bar button', 'Fertig');
  ok(!(await H.E(() => window.SYNQUENZER.rollApi().mp.state.manual)), 'Auto wieder an');
}

// 5) Zweiter Finger: der angefangene Zug wird verworfen (kein Undo-Schritt, Noten wie vorher)
await clipRoll(H, flat);
await H.tapBtn('.pr-bar button', 'Pinsel');
{
  const a = await xy(H, 1, 72), b = await xy(H, 3, 72), u0 = await H.E(() => window.SYNQUENZER.gestures().undo), before = await notes(H);
  await H.down(a.x, a.y); for (let k = 1; k <= 6; k++) { await H.move(a.x + (b.x - a.x) * k / 6, a.y); await sleep(16); }
  await H.E(() => 0);
  await H.p.evaluate(() => 0);
  await H.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: b.x, y: a.y, id: 1}, {x: b.x - 60, y: a.y + 80, id: 2}]});
  await sleep(40); await H.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(150);
  ok(JSON.stringify(await notes(H)) === JSON.stringify(before), 'zweiter Finger: Zug verworfen');
  ok(await H.E(() => window.SYNQUENZER.gestures().undo) === u0, 'zweiter Finger: kein Undo-Schritt');
}
await done(H, 'Pinsel');
process.exit(failed() ? 1 : 0);
