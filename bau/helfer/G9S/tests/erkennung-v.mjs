// G9b-V ohne Modell: Vorstufe (Messwerte), Stimm-Strecken, Zeit-Karte, Fenster-Regel (G9-20-Teil, G9-28-Teil), Rückrechnung,
// Schutz gegen Erfundenes (G9-22 mit erfundenen Wortlisten), Silben aus Wort-Zeiten (G9-21-Teil „Silben auf richtiger Marke“), Lücken füllen.
import fs from 'fs'; import {createRequire} from 'module';
import {loadVSM, sing, rng, lexikon, phrase, ausr} from './korpus.mjs';
const require = createRequire(import.meta.url), {g9Make} = require('../g9-kern.js'), {g9ErkMake} = require('../g9-erk.js');
const HERE = new URL('.', import.meta.url).pathname;
const K = g9Make(), E = g9ErkMake(), M = loadVSM();
K.sylLoad('de', fs.readFileSync(HERE + '../../../../vendor/g9/syl/de-x-syllable.wasm')); K.sylLoad('en', fs.readFileSync(HERE + '../../../../vendor/g9/syl/en-us.wasm'));
const res = {}, fails = [], J = JSON.stringify;
const expect = (id, c, m) => { res[id] = res[id] || {n: 0, ok: 0}; res[id].n++; if (c) res[id].ok++; else fails.push(id + ': ' + m); };
const textOf = P => { let t = ''; P.forEach((y, i) => { if (i && y.w) t += ' '; t += y.x; }); return t; };
// ── Vorstufe: Durchlass/Sperre des 16-kHz-Filters, Hochpass, Spitze ──
for (const sr of [48000, 44100, 32000]) {
  const gainAt = f => { const n = sr * 2, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = Math.sin(2 * Math.PI * f * i / sr) * 0.5; const y = E.resample(x, sr); let s = 0, c = 0; for (let i = 8000; i < y.length - 8000; i++) { s += y[i] * y[i]; c++; } return 10 * Math.log10(s / c / 0.125); };
  const pass = [100, 1000, 4000, 7000, 7200].map(gainAt), stop = (sr > 32000 ? [8000, 9000, 12000, 15000, 20000] : [8000, 9000, 12000, 15000]).map(gainAt);
  const rip = Math.max(...pass.map(Math.abs)), att = -Math.max(...stop);
  res['filter-' + sr] = {welligkeitDb: +rip.toFixed(3), sperreDb: +att.toFixed(1), taps: 0};
  expect('Vorstufe', rip <= 0.1 && att >= 60, 'Filter ' + sr + ' ' + J(res['filter-' + sr]));
}
{ const sr = 48000, n = sr * 2, lvl = f => { const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = Math.sin(2 * Math.PI * f * i / sr); const y = E.hp80(x, sr); let s = 0; for (let i = n / 2; i < n; i++) s += y[i] * y[i]; return 10 * Math.log10(s / (n / 2) / 0.5); };
  const h = {db40: +lvl(40).toFixed(1), db80: +lvl(80).toFixed(1), db200: +lvl(200).toFixed(2)}; res.hochpass = h;
  expect('Vorstufe', Math.abs(h.db80 + 3) < 0.3 && h.db40 < -11 && Math.abs(h.db200) < 0.3, 'Hochpass ' + J(h));
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = 0.1 * Math.sin(2 * Math.PI * 300 * i / sr); const p = E.prep(x, sr); let pk = 0; for (const v of p.y) pk = Math.max(pk, Math.abs(v));
  expect('Vorstufe', Math.abs(20 * Math.log10(pk) + 3) < 0.05 && p.y.length === Math.floor(n / 3), 'Spitze −3 dBFS ' + pk);
  // Zeitlage: Klick bei 1,000 s bleibt bei 1,000 s (±1 Probe)
  const c = new Float32Array(n); c[sr] = 1; const yc = E.resample(c, sr); let im = 0; for (let i = 0; i < yc.length; i++) if (Math.abs(yc[i]) > Math.abs(yc[im])) im = i;
  res.zeitlageMs = +((im / 16000 - 1) * 1000).toFixed(3); expect('Vorstufe', Math.abs(im - 16000) <= 1, 'Zeitlage ' + im); }
// ── Ein langer Take: gesungene Phrasen, 60 s Stille mit Atmern und Übersprechen −30 dB, wieder Gesang ──
const sr = 32000, R = rng(31), lexD = lexikon('de');
function langerTake(nPh, stilleS) {
  const parts = [], truth = [], texts = []; let off = 0;
  const push = (x, syl, text) => { parts.push({x, off}); if (syl) syl.forEach(y => truth.push(Object.assign({}, y, {on: y.on + off / sr, von: y.von + off / sr}))); if (text) texts.push(text); off += x.length; };
  for (let p = 0; p < nPh; p++) {
    const {P} = phrase(R, lexD, 5 + Math.floor(R() * 3)); const S = sing(P, {seed: 300 + p, sr, f0: 180 + 40 * R()}); push(S.x, S.syl, textOf(P));
    if (p === Math.floor(nPh / 2) && stilleS) {   // Stille mit Atmern und Musik −30 dB
      const n = stilleS * sr, z = new Float32Array(n);
      for (let i = 0; i < n; i++) { const t = i / sr; z[i] = 0.12 * 0.0316 * (Math.sin(2 * Math.PI * 110 * t) * 0.5 + Math.sin(2 * Math.PI * 165 * t) * 0.3 + Math.sin(2 * Math.PI * 220 * t + Math.sin(t)) * 0.2) + (R() - 0.5) * 2e-4; }
      for (let b = 2; b < stilleS - 1; b += 4) { const a = b * sr; for (let i = 0; i < 0.5 * sr; i++) z[a + i] += 0.02 * (R() - 0.5) * Math.sin(Math.PI * i / (0.5 * sr)); }
      push(z, null, null);
    }
  }
  const x = new Float32Array(off); for (const p of parts) x.set(p.x, p.off);
  return {x, truth, texts};
}
const LT = langerTake(12, 60);
const t0 = performance.now(), pl = E.plan(LT.x, sr), msPlan = performance.now() - t0;
res.plan = {takeS: +(LT.x.length / sr).toFixed(1), strecken: pl.segs.length, L: +pl.L.toFixed(2), chunks: pl.chunks, lo: pl.lo, hi: pl.hi, ms: Math.round(msPlan)};
expect('Fenster', pl.chunks >= pl.lo && pl.chunks <= pl.hi && pl.win.every(w => w.b - w.a <= 30 + 1e-6), 'Fenster-Regel ' + J(res.plan));
// alle Silben-Einsätze liegen in einer Strecke; die 60 s Stille sind (fast) nicht im Strom
const inSeg = LT.truth.filter(y => pl.segs.some(s => y.on >= s.a0 && y.on <= s.b0)).length;
expect('Strecken', inSeg === LT.truth.length, 'Einsätze in Strecken ' + inSeg + '/' + LT.truth.length);
expect('Strecken', pl.L < LT.x.length / sr - 55, 'Stille nicht im Strom ' + pl.L);
// Zeit-Karte hin und zurück
let mx = 0; for (const y of LT.truth) { const s = E.takeToStream(pl.map, y.on), t = E.streamToTake(pl.map, s); mx = Math.max(mx, Math.abs(t - y.on)); }
res.karteFehlerMs = +(mx * 1000).toFixed(4); expect('Karte', mx < 1e-4, 'Karte ' + mx);
// Fenster-Regel auf vielen Längen (G8: bis 5 min)
for (const L of [5, 29.9, 30.1, 47, 61, 95, 180, 300]) {
  const n = Math.round(L * 16000), st = new Float32Array(n); for (let i = 0; i < n; i++) st[i] = Math.sin(i * 0.05) * (0.2 + 0.8 * Math.abs(Math.sin(i / 16000 * 1.3)));
  const map = []; let s0 = 0; while (s0 < L) { const len = Math.min(L - s0, 3 + 7 * R()); map.push({s0, t0: s0 * 2, len}); s0 += len + 0.3; }
  const w = E.fenster(st, map), lo = Math.ceil(L / 30 - 1e-9), hi = Math.ceil(L / 24 - 1e-9);
  expect('Fenster', w.length >= lo && w.length <= hi && w.every(z => z.b - z.a <= 30 + 1e-6) && Math.abs(w[w.length - 1].b - L) < 1e-3, 'L ' + L + ' → ' + w.length);
}
// ── Erfundene Wortlisten: (1) richtige Wörter mit Zeiten (±100 ms gestört) → Rückrechnung + Silben auf richtiger Marke ──
const marks = M.detectMarks(LT.x, sr).map(m => ({t: m.t, conf: m.conf})), F = K.feat(LT.x, sr, marks);
function wortListe(jit) {   // aus der Wahrheit: Wörter mit Start/Ende (Take-Sekunden) → je Fenster relativ
  const W = []; let cur = null;
  LT.truth.forEach((y, i) => { if (y.w || !cur) { cur = {text: y.x, start: y.on, end: y.on + 0.3}; W.push(cur); } else cur.text += y.x; const nx = LT.truth[i + 1]; cur.end = nx && !nx.w ? nx.on : y.von + 0.25; });
  const per = pl.win.map(() => []);
  for (const w of W) { const s = E.takeToStream(pl.map, w.start + (R() - 0.5) * 2 * jit), e = E.takeToStream(pl.map, Math.max(w.start, w.end + (R() - 0.5) * 2 * jit)); if (s == null || e == null) continue; const k = pl.win.findIndex(z => s >= z.a && s < z.b); if (k >= 0) per[k].push({text: w.text, start: s - pl.win[k].a, end: Math.min(pl.win[k].b, e) - pl.win[k].a}); }
  return {W, per};
}
for (const jit of [0, 0.1, 0.25]) {
  const {W, per} = wortListe(jit), r = E.zurueck(per, pl);
  const s = E.silben(K, r.words, 'de', marks, F, null);
  // nur behaltene Wörter zählen (G9-21: „nur richtig erkannte Wörter“): Wahrheit der behaltenen Wörter in Reihenfolge
  const tw = []; LT.truth.forEach(y => { if (y.w || !tw.length) tw.push([y]); else tw[tw.length - 1].push(y); });
  const sub = []; let q = 0; for (const w of r.words) { while (q < tw.length && tw[q].map(y => y.x).join('') !== w.text) q++; if (q < tw.length) sub.push(...tw[q++]); }
  const a = ausr(sub, marks, s);
  if (process.env.DBG && jit > 0.2) { const tr = LT.truth; s.forEach((y, i) => { if (i < 60) console.log(i, y.x, y.t.toFixed(3), tr[i] && tr[i].x, tr[i] && tr[i].on.toFixed(3)); }); console.log(r.words.slice(0, 20).map(w => w.text + '@' + w.start.toFixed(2) + '-' + w.end.toFixed(2)).join(' ')); }
  res['silbenNachErkennung-' + jit] = {woerter: W.length, behalten: r.words.length, verworfen: r.drop, richtig: +(100 * a.q).toFixed(1)};
  expect('G9-21-Teil', r.words.length >= (jit > 0.2 ? 0.95 : 1) * W.length && a.q >= 0.85, 'jit ' + jit + ' ' + J(res['silbenNachErkennung-' + jit]));
}
// (2) erfundene Wörter in Stille / Atmern / Übersprechen und in den Nullen → 0 bleiben
{ const per = pl.win.map(() => []); let nFake = 0;
  // in den Nullen zwischen Strecken
  for (let i = 1; i < pl.map.length; i++) { const g = pl.map[i].s0 - 0.15, k = pl.win.findIndex(z => g >= z.a && g < z.b); if (k >= 0) { per[k].push({text: 'erfunden', start: g - 0.1 - pl.win[k].a, end: g + 0.1 - pl.win[k].a}); nFake++; } }
  // im 200-ms-Rand einer Strecke (keine Stimme)
  for (const m of pl.map) { const s = m.s0 + 0.01, k = pl.win.findIndex(z => s >= z.a && s < z.b); if (k >= 0) { per[k].push({text: 'rand', start: s - pl.win[k].a, end: s + 0.17 - pl.win[k].a}); nFake++; } }
  const r = E.zurueck(per, pl); res['G9-22'] = {erfunden: nFake, geblieben: r.words.length, verworfen: r.drop};
  expect('G9-22', r.words.length === 0, 'erfundene ' + J(res['G9-22'])); }
// (3) Wiederholungs-Schleifen: 10 künstliche Fälle → auf 2× gekürzt
for (let c = 0; c < 10; c++) {
  const L = 3 + (c % 3), reps = 3 + (c % 4), ph = Array.from({length: L}, (_, i) => 'w' + c + i), seq = ['vor'];
  for (let r = 0; r < reps; r++) seq.push(...ph); seq.push('nach');
  const r = E.kuerzeSchleifen(seq.map((t, i) => ({text: t, start: i, end: i + 0.5})));
  expect('G9-22', r.W.length === 2 + 2 * L && r.cut === (reps - 2) * L, 'Schleife ' + c + ' ' + r.W.length);
}
{ const r = E.kuerzeSchleifen(['la', 'la', 'la', 'la', 'la', 'la'].map((t, i) => ({text: t, start: i, end: i}))); expect('G9-22', r.W.length === 6, 'la la la (1 Wort) bleibt'); }
// unsicheres Fenster: Mittel p < 0.2 → p gesetzt statt verworfen
{ const per = pl.win.map(() => []); const {per: good} = wortListe(0); good[0].forEach(w => per[0].push(Object.assign({}, w, {p: 0.1}))); const r = E.zurueck(per, pl);
  expect('Schutz', r.words.length === good[0].length && r.words.every(w => w.p <= 0.2), 'unsicher markiert'); }
// ── Lücken füllen: vorhandener (fester) Text bleibt, erkannte Wörter nur in Strecken ohne Silbe; „Alles ersetzen“ behält nur u ──
{ const {per} = wortListe(0), r = E.zurueck(per, pl); const full = K.normLy({v: 1, lang: 'de', src: 'erkannt', s: E.silben(K, r.words, 'de', marks, F, null)});
  let cutW = 12; while (cutW > 0 && !full.s[cutW].w) cutW--;
  const part = {v: 1, lang: 'de', src: 'getippt', s: full.s.slice(0, cutW).map(y => Object.assign({}, y, {u: 1}))};
  const s2 = E.silben(K, r.words, 'de', marks, F, part, 'luecken');
  expect('Luecken', J(s2.slice(0, cutW).map(y => [y.x, y.t, y.u])) === J(part.s.map(y => [y.x, y.t, 1])) && s2.length === full.s.length && s2.slice(cutW).every(y => !y.u), 'Lücken ' + s2.length + '/' + full.s.length);
  const wrong = {v: 1, lang: 'de', src: 'erkannt', s: full.s.slice(0, 5).map(y => Object.assign({}, y, {x: 'falsch'}))};
  const s3 = E.silben(K, r.words, 'de', marks, F, wrong, 'alles');
  expect('Luecken', s3.length === full.s.length && !s3.some(y => y.x === 'falsch'), 'Alles ersetzen'); }
// Sprache: nur de/en zulässig
{ const lg = new Float32Array(10).map((_, i) => i); E.sprachFilter(lg, [3, 4]); expect('Sprache', lg[9] === -Infinity && lg[4] === 4 && E.sprachWahl(lg, 3, 4) === 'en', 'Filter'); }
for (const [k, v] of Object.entries(res)) console.log(k, J(v));
if (fails.length) console.log('FEHLER\n' + fails.join('\n'));
fs.writeFileSync(HERE + 'ergebnis-erkennung-v.json', J(res, null, 1));
console.log(fails.length ? 'NICHT bestanden (' + fails.length + ')' : 'G9b-V BESTANDEN'); process.exitCode = fails.length ? 1 : 0;
