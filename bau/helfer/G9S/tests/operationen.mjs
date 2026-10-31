// G9-07, G9-08, G9-10, G9-11 (Tabellen-Tests), Normalisieren (§5.2), Sicht/Neu-Einrasten (§5.1, Kern von G9-54), VS5b (§5.3).
import fs from 'fs'; import {createRequire} from 'module';
import {loadVSM, rng} from './korpus.mjs';
const require = createRequire(import.meta.url), {g9Make} = require('../g9-kern.js');
const HERE = new URL('.', import.meta.url).pathname;
const K = g9Make(), VSM = loadVSM();
K.sylLoad('de', fs.readFileSync(HERE + '../../../../vendor/g9/syl/de-x-syllable.wasm'));
const J = v => JSON.stringify(v), res = {}, fails = [];
const expect = (id, cond, msg) => { res[id] = res[id] || {n: 0, ok: 0}; res[id].n++; if (cond) res[id].ok++; else fails.push(id + ': ' + msg); };
// Marken aus Muster: S = Silben-Platz (Einsatz), T = reine Ton-Marke, W = schwache Marke, G = Einsatz nach Pause
function take(pat) {
  const marks = [], F = []; let t = 0.5;
  for (const c of pat) { t += c === 'G' ? 0.6 : 0.3; marks.push({t: +t.toFixed(6), conf: c === 'W' ? 0.1 : 0.8});
    F.push({rise: c === 'T' || c === 'W' ? 1 : 20, gap: c === 'G' ? 400 : 0, pj: c === 'T' ? 150 : 0, vo: 1, von: t + 0.03, uv: 0, dur: 0.3, conf: c === 'W' ? 0.1 : 0.8, vf: 0}); }
  return {marks, F, pat};
}
const lyOf = (T, list) => K.normLy({v: 1, lang: 'de', src: 'getippt', s: list.map(([x, k, f]) => Object.assign({x, t: T.marks[k].t}, f || {}))});
const kOf = (T, s) => s.map(y => T.marks.findIndex(m => Math.abs(m.t - y.t) < 1e-6));
const slots = T => T.pat.split('').map((c, k) => (c === 'S' || c === 'G' ? k : -1)).filter(k => k >= 0);
const R = rng(77);
// ── G9-07 Verschieben / Verschmelzen / Trennen ──
for (let c = 0; c < 10; c++) {   // „‹ Silbe“ × 2: zwei Plätze nach links, Ton-Marken übersprungen, Kollision → verschmolzen
  const pat = c < 3 ? 'SSTSTTSSTSSSS' : 'SSSSSSSSSSSSS', T = take(pat), SL = slots(T);
  const n = 7, from = 2 + (c % 3), pos = []; let p = 0; for (let i = 0; i < n; i++) { pos.push(p); p += i === from - 1 ? 3 : 1; }
  if (c >= 6) pos[from] = pos[from - 1] + 1;   // dicht: Kollision
  const ly = lyOf(T, pos.map((q, i) => ['s' + i, SL[Math.min(q, SL.length - 1)], {w: 1}]));
  const before = J(ly);
  let cur = ly; const st = [];
  for (let r = 0; r < 2; r++) { const o = K.apply(cur, T.marks, T.F, {op: 'links', i: from}); expect('G9-07', o.ok, 'links ok ' + c); st.push(J(cur)); cur = K.normLy({v: 1, lang: 'de', src: 'getippt', s: o.s}); }
  const k1 = kOf(T, cur.s);
  let good = true;
  for (let i = 0; i < n; i++) { const want = i < from ? pos[i] : Math.max(pos[from - 1], pos[i] - 2); const got = SL.indexOf(k1[i]); if (i >= from && pos[i] - 2 <= pos[from - 1] ? got !== pos[from - 1] : got !== want) good = false; if (pat[k1[i]] === 'T') good = false; }
  if (c >= 6) good = good && cur.s[from].j === 1;
  expect('G9-07', good, 'links×2 Fall ' + c + ' ' + J(k1) + ' pos ' + J(pos) + ' j ' + J(cur.s.map(y => y.j || 0)));
  expect('G9-07', J(K.normLy(JSON.parse(st[0]))) === before, 'Undo deep-equal ' + c);   // Undo = Schnappschuss vor dem Schritt
}
for (let c = 0; c < 10; c++) {   // „Silbe ›“ löst eine Verschmelzung; über das Ende → o
  const pat = c < 3 ? 'SSTSSTSSS' : 'SSSSSSSSS', T = take(pat), SL = slots(T);
  const ly = lyOf(T, [['a', SL[0], {w: 1}], ['b', SL[1], {w: 1}], ['c', SL[1], {j: 1}], ['d', SL[2], {w: 1}], ['e', SL[SL.length - 1], {w: 1}]]);
  const o = K.apply(ly, T.marks, T.F, {op: 'rechts', i: 2}), s = o.s, k = kOf(T, s);
  expect('G9-07', o.ok && !s[2].j && k[2] === SL[2] && k[3] === SL[3] && s[4].o === 1 && s.length === 5 && pat[k[2]] !== 'T', 'rechts löst ' + c + ' ' + J(s));
}
for (let c = 0; c < 10; c++) {   // Verschmelzen: nächste Silbe auf Marke der gewählten, Rest einen Platz links
  const pat = c < 3 ? 'STSTSTSS' : 'SSSSSSSS', T = take(pat), SL = slots(T);
  const ly = lyOf(T, [0, 1, 2, 3, 4].map(q => ['x' + q, SL[q], {w: 1}]));
  const o = K.apply(ly, T.marks, T.F, {op: 'versch', i: 1}), k = kOf(T, o.s);
  expect('G9-07', o.ok && o.s[2].j === 1 && k[2] === SL[1] && k[3] === SL[2] && k[4] === SL[3], 'versch ' + c + ' ' + J(k));
}
for (let c = 0; c < 10; c++) {   // Trennen: letzte Silbe auf nächsten Platz (belegt → Rest rückt); ohne freien Platz → grau + Toast, nichts geändert
  const pat = c < 3 ? 'STTSTS' : 'SSSS', T = take(pat), SL = slots(T), last = SL.length - 1;
  if (c % 2) { const ly = lyOf(T, [['a', SL[last], {w: 1}], ['b', SL[last], {j: 1}]]); const b = J(ly); const o = K.apply(ly, T.marks, T.F, {op: 'trenn', i: 1});
    expect('G9-07', !o.ok && o.toast === 'Keine freie Marke – beide Silben bleiben zusammen.' && J(ly) === b && !/Marke setzen/.test(o.toast), 'trenn ohne Platz ' + c); }
  else { const ly = lyOf(T, [['a', SL[0], {w: 1}], ['b', SL[0], {j: 1}], ['c', SL[1], {w: 1}]]); const o = K.apply(ly, T.marks, T.F, {op: 'trenn', i: 0}), k = kOf(T, o.s);
    expect('G9-07', o.ok && k[1] === SL[1] && !o.s[1].j && k[2] === SL[2] && pat[k[1]] !== 'T', 'trenn ' + c + ' ' + J(k)); }
}
// ── G9-08 Marken-Haken ──
for (let c = 0; c < 10; c++) {
  const T = take('SSSSSS'), ly = lyOf(T, [['a', 0, {w: 1}], ['b', 1], ['c', 2, {w: 1}], ['d', 2, {j: 1}], ['e', 3, {w: 1}]]);
  const tN = T.marks[2].t + 0.05 + 0.01 * c, o = K.apply(ly, T.marks, T.F, {op: 'mkMove', tOld: T.marks[2].t, tNew: tN});
  expect('G9-08', o.s[2].t === +tN.toFixed(6) && o.s[3].t === +tN.toFixed(6) && o.s[3].j === 1 && o.s[1].t === ly.s[1].t, 'mkMove ' + c);
  const d = K.apply(ly, T.marks, T.F, {op: 'mkDel', t: T.marks[3].t});   // e → auf Marke 2 (dort schon 2 Silben) → 3 Silben, j
  expect('G9-08', d.s.length === 5 && d.s[4].t === T.marks[2].t && d.s[4].j === 1 && d.lost === 0, 'mkDel ' + c);
  const ly3 = lyOf(T, [['a', 1, {w: 1}], ['b', 1, {j: 1}], ['c', 1, {j: 1}], ['d', 2, {w: 1}], ['e', 2, {j: 1}]]);
  const d3 = K.apply(ly3, T.marks, T.F, {op: 'mkDel', t: T.marks[2].t}), nO = d3.s.filter(y => y.o).length;
  expect('G9-08', d3.s.length === 5 && nO === 2 && d3.s.every(y => y.t === T.marks[1].t) && d3.over === 2, 'mkDel neben 3 → o ' + J(d3.s));
  const ad = K.apply(ly, T.marks, T.F, {op: 'mkAdd', t: 0.1 + c * 0.1});
  expect('G9-08', J(ad.s) === J(ly.s), 'mkAdd bewegt nichts');
}
// ── G9-10 Überzahl bleibt; Normalisieren verwirft nichts ──
{ const T = take('S'.repeat(250)), text = Array.from({length: 300}, (_, i) => 'la' + i).join(' ');
  const v = K.normLy(K.fromVs5b(text, T.marks, 'de'), 300);
  expect('G9-10', v.s.length === 300 && v.s.filter(y => y.o).length === 50, 'VS5b-Umwandeln 300/250 → 50 o');
  const a = K.normLy({v: 1, lang: 'de', src: 'eingefuegt', s: K.align(K.words(text, 'de'), T.marks, T.F)}, 300);
  res.ausrUeberzahl = {silben: a.s.length, o: a.s.filter(y => y.o).length, j: a.s.filter(y => y.j).length};
  expect('G9-10', a.s.length === 300, 'Ausrichtung 300/250: 0 Silben verloren');
  const rt = K.normLy(JSON.parse(J(v)), 300); expect('G9-10', J(rt) === J(v), 'Speichern → Laden deep-equal');
  expect('G9-10', J(K.normLy(K.normLy(a, 300), 300)) === J(K.normLy(a, 300)), 'normLy idempotent');
  const broken = {v: 1, lang: 'de', src: 'x', s: []}; for (let k = 0; k < 20; k++) for (let q = 0; q < 5; q++) broken.s.push({x: 'b' + k + '_' + q, t: k % 4 === 3 ? 0.2 : 0.5 + k * 0.3, j: q ? 1 : 0});
  const nb = K.normLy(broken, 30);
  expect('G9-10', nb.s.length === 100 && nb.s.map(y => y.x).join() === broken.s.map(y => y.x).join() && nb.s.every((y, i) => !i || y.t >= nb.s[i - 1].t), 'kaputte Datei: 0 verloren, Reihenfolge gleich');
  expect('G9-10', nb.s.every(y => !(y.j && y.o)) && J(K.normLy(nb, 30)) === J(nb), 'kaputte Datei: j/o eindeutig, stabil');
  const ctl = K.normLy({s: [{x: ' A\u0007b c ', t: 1}, {x: '\u0000', t: 2}, {x: 'x'.repeat(40), t: 99, p: 1.234, u: true, w: 7}]}, 10);
  expect('G9-10', ctl.s.length === 2 && ctl.s[0].x === 'Abc' && ctl.s[1].x.length === 24 && ctl.s[1].t === 10 && ctl.s[1].p === 1 && ctl.s[1].u === 1 && !('w' in ctl.s[1]), 'Klemmen ' + J(ctl));
  expect('G9-10', K.normLy({s: [{x: ''}]}) === null && K.normLy(null) === null && K.normLy({s: 'x'}) === null, 'ohne Silbe → fehlt');
  const big = {s: Array.from({length: 4100}, (_, i) => ({x: 'q', t: i * 0.01}))}; expect('G9-10', K.normLy(big, 100).s.length === 4000, '4000-Grenze'); }
// ── G9-11 Wort löschen / einfügen ──
for (let c = 0; c < 10; c++) {
  const pat = c < 3 ? 'SSTSSTSSSS' : 'SSSSSSSSSS', T = take(pat), SL = slots(T);
  const ly = lyOf(T, [['Lie', SL[0], {w: 1}], ['be', SL[1]], ['ist', SL[2], {w: 1}], ['ein', SL[3], {w: 1}], ['Feu', SL[4], {w: 1}], ['er', SL[5]]]);
  const d = K.apply(ly, T.marks, T.F, {op: 'loesch', k: SL[2 + (c % 2)]}), keep = ly.s.filter((y, i) => i !== 2 + (c % 2));
  expect('G9-11', d.ok && d.s.length === 5 && J(d.s.map(y => [y.x, y.t])) === J(keep.map(y => [y.x, y.t])), 'löschen ' + c);
  const kk = SL[2 + (c % 3)], i0 = ly.s.findIndex(y => y.t === T.marks[kk].t);
  const ins = K.apply(ly, T.marks, T.F, {op: 'wort', k: kk, text: 'Sehnsucht', lang: 'de', ins: true}), k2 = kOf(T, ins.s);
  let good = ins.ok && ins.s.length === 8 && k2[i0] === kk && ins.s[i0].x === 'Sehn' && ins.s[i0].u === 1 && SL.indexOf(k2[i0 + 1]) === SL.indexOf(kk) + 1;
  for (let i = i0; i < ly.s.length; i++) { const was = SL.indexOf(T.marks.findIndex(m => m.t === ly.s[i].t)), now = k2[i + 2]; if (!(now === SL[was + 2] || (was + 2 >= SL.length && ins.s[i + 2].o))) good = false; }
  for (let i = 0; i < i0; i++) if (ins.s[i].t !== ly.s[i].t) good = false;
  expect('G9-11', good, 'einfügen ' + c + ' ' + J(k2));
}
// ── Ersetzen (§6.4): 2-silbig → 3-silbig ohne freie Plätze → verschmolzen + Hinweis; [Nachrücken] ──
{ const T = take('SSSSSSSS'), ly = lyOf(T, [['Lie', 0, {w: 1}], ['be', 1], ['ist', 2, {w: 1}], ['da', 3, {w: 1}]]);
  const r = K.apply(ly, T.marks, T.F, {op: 'wort', k: 0, text: 'Gedanken', lang: 'de'});
  expect('Ersetzen', r.ok && r.merged === 1 && /2 Silben auf einer Marke/.test(r.hint) && r.missing === 1 && r.old === 'Liebe' && kOf(T, r.s).slice(3).join() === '2,3', 'ersetzen ' + J(r));
  const n = K.apply(K.normLy({s: r.s}), T.marks, T.F, {op: 'nach', i: 3, n: r.missing});
  expect('Ersetzen', kOf(T, n.s).slice(3).join() === '3,4', 'nachrücken ' + J(kOf(T, n.s)));
  const kurz = K.apply(ly, T.marks, T.F, {op: 'wort', k: 0, text: 'Herz', lang: 'de'});
  expect('Ersetzen', kurz.s.length === 3 && kOf(T, kurz.s).join() === '0,2,3', 'kürzer: Melisma, Rest bleibt ' + J(kurz.s)); }
// ── Sicht / Neu-Einrasten (§5.1) ──
{ const R2 = rng(54); let lost = 0, snap = 0, tot = 0, fixedSame = true, unchanged = true;
  for (let c = 0; c < 30; c++) {
    const T = take('SSSSSSSSSSSS'), ly = lyOf(T, Array.from({length: 12}, (_, i) => ['s' + i, i, i % 3 ? (i === 5 ? {u: 1} : {}) : {w: 1}]));
    const before = J(ly);
    const m2 = T.marks.map(m => ({t: +(m.t + (R2() - 0.5) * 0.04).toFixed(6), conf: m.conf})).filter((m, k) => k !== 3 + (c % 4) && !(c % 5 === 0 && k === 5));
    const F2 = m2.map(() => T.F[0]);
    const v = K.view(ly, m2, F2);
    tot += 12; lost += 12 - v.V.length; snap += v.V.filter(y => y.k >= 0).length;
    const f = v.V[5]; if (f.k < 0 && f.t !== ly.s[5].t) fixedSame = false; if (f.k >= 0 && Math.abs(m2[f.k].t - ly.s[5].t) > 0.03) fixedSame = false;
    if (J(ly) !== before) unchanged = false;
  }
  res['Sicht'] = {silben: tot, verloren: lost, mitMarke: +(100 * snap / tot).toFixed(1), festGleich: fixedSame, lyUnveraendert: unchanged};
  expect('Sicht', lost === 0 && snap / tot >= 0.95 && fixedSame && unchanged, 'Neu-Einrasten ' + J(res['Sicht'])); }
// ── VS5b (§5.3): Umwandeln = assignLyrics-Verteilung; Klartext ≤ 400, am Wortende gekürzt ──
for (let c = 0; c < 10; c++) {
  const T = take('S'.repeat(5 + c)), text = 'Lie-be ist ein Feu-er das bren-nent'.slice(0, 10 + 3 * c).trim();
  const a = VSM.assignLyrics(text, T.marks.length), v = K.normLy(K.fromVs5b(text, T.marks, 'de'));
  const lab = T.marks.map((m, k) => { const y = v.s.find(z => z.t === m.t && !z.o); return y ? y.x : '·'; });
  expect('VS5b', J(lab) === J(a.labels) && J(v.s.filter(y => y.o).map(y => y.x)) === J(a.extra) && K.lyText(v) === text.replace(/\s+/g, ' ').replace(/-+$/, '').replace(/(^|\s)-|-(\s|$)/g, '$1$2'), 'vs5b ' + c + ' ' + K.lyText(v) + ' | ' + text);
}
{ const long = {s: Array.from({length: 200}, (_, i) => ({x: 'Wort' + i, t: i, w: 1}))}, t = K.lyText(long);
  expect('VS5b', t.length <= 400 && / Wort\d+$/.test(t) && !/ $/.test(t), 'lyText ≤ 400 am Wortende'); }
for (const [k, v] of Object.entries(res)) console.log(k, J(v));
if (fails.length) console.log('FEHLER\n' + fails.join('\n'));
fs.writeFileSync(HERE + 'ergebnis-operationen.json', J(res));
console.log(fails.length ? 'NICHT bestanden (' + fails.length + ')' : 'G9-07/08/10/11, Normalisieren, Sicht, VS5b BESTANDEN'); process.exitCode = fails.length ? 1 : 0;
