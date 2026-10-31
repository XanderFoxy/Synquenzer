// G9U T2: Text-Operationen ohne DOM (g9Set) – G9-07, G9-11, G9-32, G9-10 (Teil), G9-51 (Teil), G9-52, Undo-Art 'ly'
import {launch, open, clickTake, sleep, report, deq, U, V, LY, SET, ks} from './h.mjs';
const ok = report(); const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = Array.from({length: 16}, (_, k) => 0.3 + k * 0.22);
const tk = await clickTake(p, T, 4), id = tk.id;
ok(tk.marks.length === 16, 'Take mit 16 Marken');
const U0 = (await U(p)).n;
const PROJ = () => p.evaluate(() => SYNQUENZER.project().takes);
const undo = () => p.evaluate(() => SYNQUENZER.undo()), redo = () => p.evaluate(() => SYNQUENZER.redo());
const range = (a, b) => Array.from({length: b - a}, (_, i) => a + i);
// ---------- Basis: 8 einsilbige Wörter auf Marke 0…7 ----------
const TXT8 = 'a b c d e f g h';
let r = await SET(p, id, {op: 'text', text: TXT8, lang: 'de'});
let v = await V(p, id);
ok(r.ok && deq(ks(v), range(0, 8)), 'Ganzer Text: 8 Silben auf Marke 0…7: ' + ks(v).join(','));
const base = await LY(p, id);
// ---------- G9-07 Verschieben: 2 Plätze rechts und zurück (7 Fälle ohne Ton-Marken) ----------
let n7 = 0, u7 = 0;
for (let s = 0; s < 7; s++) {
  const u0 = (await U(p)).n;
  await SET(p, id, {op: 'shift', k: s, d: 1}); const kk = (await V(p, id)).syl[s].k; await SET(p, id, {op: 'shift', k: kk, d: 1});
  v = await V(p, id); const want = range(0, 8).map(i => (i < s ? i : i + 2));
  const okR = deq(ks(v), want);
  const u1 = (await U(p)).n;
  await SET(p, id, {op: 'shift', k: s + 2, d: -1}); await SET(p, id, {op: 'shift', k: s + 1, d: -1});
  const back = deq(await LY(p, id), base), u2 = (await U(p)).n;
  if (okR && back) n7++;
  if (u1 - u0 === 2 && u2 - u1 === 2) u7++;
  // vier Schritte zurück → wieder Basis
  for (let q = 0; q < 4; q++) await undo();
}
ok(n7 === 7, 'G9-07 „Silbe ›“ ×2 = 2 Silben-Plätze rechts, „‹ Silbe“ ×2 zurück = Basis (' + n7 + '/7)');
ok(u7 === 7 && deq(await LY(p, id), base), 'G9-07 je Druck genau ein Undo; 4× ↶ = Basis (' + u7 + '/7)');
// Kollision → verschmolzen; „Silbe ›“ löst sie (7 Fälle)
let nc = 0;
for (let s = 1; s < 8; s++) {
  await SET(p, id, {op: 'shift', k: s, d: -1}); v = await V(p, id);
  const want = range(0, 8).map(i => (i < s ? i : i - 1)), ly = await LY(p, id);
  const merged = deq(ks(v), want) && ly.s[s].j === 1;
  await SET(p, id, {op: 'shift', k: s - 1, d: 1}); const kk = await LY(p, id);
  // „Silbe ›“ auf der verschmolzenen Silbe: gewählt ist der Abschnitt s-1; die gewählte Silbe = erste dort → alle ab s-1 rücken. Darum über Undo zurück
  await undo(); await undo();
  if (merged && deq(await LY(p, id), base)) nc++;
}
ok(nc === 7, 'G9-07 „‹ Silbe“ auf die vorige Silbe → verschmolzen (j), Undo stellt her (' + nc + '/7)');
// mit reinen Ton-Marken: Marke 9, 10 = Ton-Marken (Merkmale simuliert: Tonsprung, kein Anstieg) → keine Silben-Plätze
const F = tk.marks.map((k, j) => ({rise: j === 9 || j === 10 ? 0 : 6, gap: 0, pj: j === 9 || j === 10 ? 120 : 0, vo: 1, von: k.t + .04, uv: 0, dur: .22, conf: 1}));
await p.evaluate(([id, F]) => SYNQUENZER.g9FeatSim(id, F), [id, F]);
let nt = 0; const cases = [[4, 3, [0, 1, 2, 3, 7, 8, 11, 12]], [6, 2, [0, 1, 2, 3, 4, 5, 8, 11]], [7, 2, [0, 1, 2, 3, 4, 5, 6, 11]]];
for (const [s, n, want] of cases) {
  let k = s; for (let q = 0; q < n; q++) { await SET(p, id, {op: 'shift', k, d: 1}); k = (await V(p, id)).syl[s].k; }
  v = await V(p, id); const onTone = v.syl.some(x => x.k === 9 || x.k === 10);
  if (deq(ks(v), want) && !onTone) nt++; else console.log('   Ton-Fall', s, ks(v).join(','), 'erwartet', want.join(','));
  for (let q = 0; q < n; q++) await undo();
}
ok(nt === 3 && deq(await LY(p, id), base), 'G9-07 Ton-Marken übersprungen, keine Silbe landet auf einer Ton-Marke (' + nt + '/3)');
await p.evaluate(id => SYNQUENZER.g9FeatSim(id, null), id);
// Verschmelzen / Trennen
await SET(p, id, {op: 'merge', k: 2}); v = await V(p, id);
ok(deq(ks(v), [0, 1, 2, 2, 3, 4, 5, 6]), '[Verschmelzen] an 3: nächste Silbe auf dieselbe Marke, Rest einen Platz links: ' + ks(v).join(','));
await SET(p, id, {op: 'split', k: 2}); ok(deq(await LY(p, id), base), '[Trennen]: zurück (nächster Platz belegt → Rest rückt nach rechts)');
// Trennen ohne freien Platz: 16 Silben auf 16 Marken, letzte zwei auf der letzten Marke
await SET(p, id, {op: 'text', text: range(0, 16).map(i => 'x' + i).join(' '), lang: 'de'});
await SET(p, id, {op: 'shift', k: 15, d: 1}); await SET(p, id, {op: 'shift', k: 14, d: 1}); await SET(p, id, {op: 'merge', k: 15});
v = await V(p, id);
const lyA = await LY(p, id), uA = (await U(p)).n;
r = await SET(p, id, {op: 'split', k: 15});
ok(!r.ok && /Keine freie Marke/.test(r.err) && deq(await LY(p, id), lyA) && (await U(p)).n === uA, 'G9-07 Trennen ohne freien Platz → „' + r.err + '“, nichts geändert, kein Undo');
ok(!/Marke setzen|setze/i.test(r.err), 'kein Rat, eine Marke zu setzen');
// Undo/Redo deep-equal über alle Schritte
{ const P1 = await PROJ(); let n = 0; while ((await U(p)).n > U0 && n++ < 200) await undo(); const P0 = await PROJ(); n = 0; while ((await U(p)).redo > 0 && n++ < 200) await redo();
  ok(deq(await PROJ(), P1), 'G9-07 alle ↶ dann alle ↷ → Takes deep-equal'); ok(!P0[id].ly && !P0[id].lyrics, 'ganz zurück: kein Text mehr am Take'); }
// ---------- G9-11 Wort löschen / einfügen (je 10 Fälle) ----------
const TXT = 'Lie-be ist ein Feu-er in mir und dir so-fort da';
await SET(p, id, {op: 'text', text: TXT, lang: 'de'});
const b2 = await LY(p, id), vb = await V(p, id);
const firsts = vb.syl.map((s, i) => (s.w ? i : -1)).filter(i => i >= 0);
ok(firsts.length === 10 && vb.syl.length === 13, '10 Wörter / 13 Silben (eigene Bindestriche gelten)');
let nd = 0, ni = 0, nu = 0;
for (const i of firsts) {
  const k = vb.syl[i].k, u0 = (await U(p)).n;
  r = await SET(p, id, {op: 'del', k}); v = await V(p, id);
  let e = i + 1; while (e < vb.syl.length && !vb.syl[e].w) e++;
  const rest = vb.syl.filter((s, z) => z < i || z >= e).map(s => s.k);
  if (r.ok && deq(v.syl.map(s => s.k), rest) && (await U(p)).n === u0 + 1) nd++;
  const P1 = await PROJ(); await undo(); const P0ok = deq(await LY(p, id), b2); await redo(); const P1ok = deq(await PROJ(), P1); await undo();
  if (P0ok && P1ok) nu++;
}
ok(nd === 10, 'G9-11 Löschen: genau die Silben des Worts weg, der folgende Text bleibt auf seinen Marken, ein Undo (' + nd + '/10)');
for (const i of firsts) {
  const k = vb.syl[i].k, u0 = (await U(p)).n;
  r = await SET(p, id, {op: 'ins', k, text: 'A-bend'}); v = await V(p, id);
  const want = vb.syl.slice(0, i).map(s => s.k).concat([k, k + 1], vb.syl.slice(i).map(s => s.k + 2)).map(x => (x > 15 ? 'o' : x));
  const got = v.syl.map(s => (s.o ? 'o' : s.k));
  if (r.ok && deq(got, want) && (await U(p)).n === u0 + 1 && v.syl[i].x === 'A' && v.syl[i + 1].x === 'bend') ni++; else console.log('   Einfügen', i, got.join(','), 'erwartet', want.join(','));
  const P1 = await PROJ(); await undo(); const a = deq(await LY(p, id), b2); await redo(); const b = deq(await PROJ(), P1); await undo();
  if (a && b) nu++;
}
ok(ni === 10, 'G9-11 Einfügen „A-bend“ vor Abschnitt k: erste Silbe auf k, alle folgenden +2 Silben-Plätze, ein Undo (' + ni + '/10)');
ok(nu === 20, 'G9-11 Undo/Redo deep-equal (' + nu + '/20)');
// ---------- G9-32 Ersetzen: 2-silbig → 3-silbig = verschmolzen + Hinweis; [Nachrücken] = Rest einen Platz rechts ----------
const kL = vb.syl[0].k;
r = await SET(p, id, {op: 'word', k: kL, text: 'Lie-bes-lied'}); v = await V(p, id); let ly = await LY(p, id);
ok(r.ok && r.merged === 1 && /Lie-be|Liebe/.test(r.toast) && /→ Liebeslied/.test(r.toast) && /2 Silben auf einer Marke/.test(r.toast), 'G9-32 Toast „' + r.toast + '“');
ok(deq(v.syl.slice(0, 3).map(s => s.k), [0, 1, 1]) && ly.s[2].j === 1 && deq(v.syl.slice(3).map(s => s.k), vb.syl.slice(2).map(s => s.k)), 'G9-32 drei Silben auf zwei Abschnitten verschmolzen, Rest unverschoben');
ok(ly.s.slice(0, 3).every(s => s.u === 1), 'neue Silben fest (u: 1)');
const u32 = (await U(p)).n;
r = await SET(p, id, {op: 'nach', k: 0, n: 1}); v = await V(p, id);
ok(r.ok && deq(v.syl.slice(0, 3).map(s => s.k), [0, 1, 2]) && deq(v.syl.slice(3).map(s => s.k), vb.syl.slice(2).map(s => s.k + 1)) && (await U(p)).n === u32 + 1, 'G9-32 [Nachrücken]: Wort verteilt, Rest +1 Silben-Platz, ein Undo');
await undo(); await undo(); ok(deq(await LY(p, id), b2), 'G9-32 2× ↶ = vorher');
// ---------- Undo-Art 'ly' stellt ly UND lyrics her; lyrics = Klartext ----------
await SET(p, id, {op: 'word', k: 4, text: 'Feuers'}); const ui = await U(p);
ok(ui.top.kind === 'ly' && ui.top.label === 'Songtext: Feuers', 'Undo-Art „ly“, Name „Songtext: Feuers“');
const tk1 = (await PROJ())[id]; ok(tk1.lyrics === 'Lie-be ist ein Feu-ers in mir und dir so-fort da' || /Feu-ers|Feuers/.test(tk1.lyrics), 'lyrics = Klartext von ly: „' + tk1.lyrics + '“');
await undo(); const tk0 = (await PROJ())[id]; ok(deq(tk0.ly, b2) && tk0.lyrics === 'Lie-be ist ein Feu-er in mir und dir so-fort da', '↶ stellt ly und lyrics her');
// ---------- G9-10 (Teil) / G9-51 (Teil): Überzahl bleibt, Speichern → Laden deep-equal, Normalisieren verwirft nichts ----------
await SET(p, id, {op: 'text', text: range(0, 20).map(i => 'y' + i).join(' '), lang: 'en'});
v = await V(p, id); ly = await LY(p, id);
ok(v.syl.length === 20 && ly.s.length === 20, 'G9-10: 20 Silben auf 16 Marken → keine Silbe verloren (' + ly.s.filter(s => s.j).length + ' verschmolzen, ' + ly.s.filter(s => s.o).length + ' ohne Marke)');
await SET(p, id, {op: 'shift', k: 15, d: 1}); await SET(p, id, {op: 'shift', k: 15, d: 1}); ly = await LY(p, id);
ok(ly.s.some(s => s.o === 1), 'Überzählige (o) entstehen beim Schieben über die letzte Marke: ' + ly.s.filter(s => s.o).map(s => s.x).join(' '));
await SET(p, id, {op: 'word', k: 3, text: 'Herz,'});
ly = await LY(p, id);
const before = await p.evaluate(() => SYNQUENZER.serialize());
await p.evaluate(j => SYNQUENZER.importJSON(j), before); await sleep(300);
const after = await p.evaluate(() => SYNQUENZER.serialize());
ok(deq(JSON.parse(after).takes, JSON.parse(before).takes) && deq((await PROJ())[id].ly, ly), 'G9-51 Speichern → Laden deep-equal (ly mit j, o, p, u, w)');
ok(ly.s.some(s => s.x === 'Herz,'), 'Satzzeichen bleibt am Wort („Herz,“)');
const N = await p.evaluate(() => SYNQUENZER.g9NormLy({v: 1, lang: 'de', src: 'eingefuegt', s: [{x: 'a', t: 1}, {x: 'b', t: 1, j: 1}, {x: 'c', t: 1, j: 1}, {x: 'd', t: 1, j: 1}, {x: 'e', t: 1, j: 1}, {x: 'f', t: .5}, {x: 'g h', t: .4}, {x: '', t: 2}, {x: 'i\u0007', t: 9}]}, 3));
ok(N.s.length === 8 && N.s.map(s => s.x).join('') === 'abcdefghi' && N.s[3].o === 1 && N.s[4].o === 1 && N.s[5].o === 1 && N.s[5].t === 1 && N.s[7].t === 3, 'g9NormLy: 5 Silben je Marke + fallende Zeiten → 0 Silben verloren, Reihenfolge gleich, Überzahl o, leer fällt weg, t geklemmt');
ok(deq(await p.evaluate(n => SYNQUENZER.g9NormLy(n, 3), N), N), 'g9NormLy ist idempotent');
// ---------- G9-52: Klang bitgleich, take.marks bleibt weg ----------
const hp = async () => p.evaluate(async id => { const r = await SYNQUENZER.wpPlayed(id, 0, 200000); return r ? r.data.reduce((h, v, i) => (h * 31 + Math.round(v * 1e7) + i) % 2147483647, 7) : null; }, id);
const h0 = await hp();
await SET(p, id, {op: 'shift', k: 2, d: 1}); await SET(p, id, {op: 'merge', k: 4}); await SET(p, id, {op: 'del', k: 6});
const h1 = await hp(), pr = (await PROJ())[id];
ok(h0 === h1 && h0 !== null, 'G9-52 gehörte Fassung vor/nach G9-Aktionen gleich (Prüfsumme ' + h0 + ')');
ok(!pr.marks, 'G9-52 take.marks bleibt weg (G9 schreibt keine Marken)');
// mit Zeitkarte (quantisiert)
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 1, mode: 'stretch'}), tk.ref);
const q0 = await hp(), mk0 = JSON.stringify((await PROJ())[id].marks);
await SET(p, id, {op: 'shift', k: 3, d: -1}); await SET(p, id, {op: 'word', k: 1, text: 'Lie-be'});
ok(await hp() === q0 && JSON.stringify((await PROJ())[id].marks) === mk0, 'G9-52 quantisiert (Dehnen): Fassung bitgleich, Marken unverändert');
ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join(' | '));
process.exitCode = ok.done(); await br.close();
