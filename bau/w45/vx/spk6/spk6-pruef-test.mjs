// SPK6 Prüfung – Kern-Test zu den Befunden 1–6 (Node, Kern aus der Datei): Dauer und Speicher auf einem 3-min-Lied, Abspiel-Blöcke während einer Rechnung,
// nur der geänderte Bereich (bitgleich außerhalb, Ton genau, keine Knackser an den Nahtstellen), Kopie unabhängig (In Ebene, Zerlegen), Quelle löschen, Auswahl mit Audio-Ebene.
// Aufruf: node spk6-pruef-test.mjs <abs. index.html> [TEIL=lang,kurz]   → spk6-pruef-test.json neben der Datei
import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2] || 'index.html'), html = fs.readFileSync(file, 'utf8'), TEIL = (process.env.TEIL || 'lang,kurz').split(',');
const grab = (src, name) => { const i = src.indexOf('function ' + name + '('); if (i < 0) return ''; let j = src.indexOf('{', i), dep = 0; for (; j < src.length; j++) { if (src[j] === '{') dep++; else if (src[j] === '}' && --dep === 0) break; } return src.slice(i, j + 1); };
const K = new Function(['vsDspMake', 'spk1DspMake', 'spk2DspMake', 'spk3DspMake', 'spk4DspMake', 'spk5DspMake', 'spk6DspMake', 'ki1KernMake'].map(n => grab(html, n)).join(';\n') + ';return spk1DspMake(vsDspMake());')();
let qid = 0; const call = (op, a, prog) => new Promise((ok, no) => { const id = ++qid; K.on(Object.assign({}, a, {op, qid: id}), m => { if (m.qid !== id || m.chunk) return; if (m.prog != null) { if (prog) prog(m.prog); return; } if (m.err) no(new Error(m.err)); else ok(m.ok); }); });
const res = {}, T0 = Date.now(); let fails = 0;
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; if (!cond) fails++; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const r2 = x => +(+x).toFixed(2);
const mono = ch => { const y = new Float32Array(ch[0].length); for (const c of ch) for (let i = 0; i < y.length; i++) y[i] += c[i] / ch.length; return y; };
function f0At(x, sr, t0, t1) {   // YIN mit Parabel, 60…1000 Hz
  const a = Math.round(t0 * sr), W = Math.round((t1 - t0) * sr) - Math.round(sr / 60), tmin = Math.floor(sr / 1000), tmax = Math.ceil(sr / 60), dd = new Float64Array(tmax + 2);
  for (let tau = 1; tau <= tmax + 1; tau++) { let s = 0; for (let i = 0; i < W; i++) { const e = x[a + i] - x[a + i + tau]; s += e * e; } dd[tau] = s; }
  const cm = new Float64Array(tmax + 2); cm[0] = 1; let run = 0; for (let tau = 1; tau <= tmax + 1; tau++) { run += dd[tau]; cm[tau] = dd[tau] * tau / (run || 1); }
  let best = -1; for (let tau = tmin; tau <= tmax; tau++) if (cm[tau] < 0.15 && cm[tau] < cm[tau - 1] && cm[tau] <= cm[tau + 1]) { best = tau; break; }
  if (best < 0) { let mv = 1e9; for (let tau = tmin; tau <= tmax; tau++) if (cm[tau] < mv) { mv = cm[tau]; best = tau; } }
  const p = cm[best - 1], q = cm[best], r = cm[best + 1], den = p - 2 * q + r, sh = den ? 0.5 * (p - r) / den : 0; return sr / (best + sh);
}
const cents = (f, g) => 1200 * Math.log2(f / g);
const rms = (x, sr, t0, t1) => { let s = 0, n = 0; for (let i = Math.max(0, Math.round(t0 * sr)); i < Math.min(x.length, Math.round(t1 * sr)); i++) { s += x[i] * x[i]; n++; } return Math.sqrt(s / Math.max(1, n)); };
const d2 = (x, a, b) => { let m = 0; for (let i = Math.max(2, a); i < Math.min(x.length, b); i++) m = Math.max(m, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); return m; };
const formant = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2) + 0.15 / (1 + ((f - 2600) / 400) ** 2);
function song(sek, NOTES) {
  const sr = 48000, n = sr * sek, L = new Float32Array(n), R = new Float32Array(n);
  for (const [a, b, f] of NOTES) for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, env = Math.min(1, (t - a) / 0.02, (b - t) / 0.03); let v = 0; for (let h = 1; h <= 30 && h * f < 9000; h++) v += formant(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); L[i] += 0.12 * env * v; R[i] += 0.12 * env * v; }
  for (let i = 0; i < n; i++) { const v = 0.2 * Math.sin(2 * Math.PI * 55 * i / sr); L[i] += v; R[i] += v; }
  return {sr, n, L, R};
}
const SC = [220, 246.942, 277.183, 293.665, 329.628, 369.994, 415.305, 440];

if (TEIL.includes('lang')) {
  // ---- 3-min-Lied: 348 Noten (0,42 s, Abstand 0,5 s) wie in der Prüfung
  const NOTES = []; for (let t = 2, k = 0; t < 176; t += 0.5, k++) NOTES.push([t, t + 0.42, SC[(k * 3) % 8]]);
  const S = song(180, NOTES), sr = S.sr; let t = Date.now();
  const doc = (await call('create', {name: 'lang', sr, ch: [S.L, S.R], grid: {bpm: 120, off: 0, ts: '4/4'}})).meta.id, C = (op, a, pg) => call(op, Object.assign({doc}, a), pg);
  await C('transfer', {von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 1.8, t1: 176.3, f0: 150, f1: 9500}});
  await C('noten', {lid: 'L1'}); const N = (await C('open', {})).meta.teil2.notes.L1; console.log('geladen', Date.now() - t, 'ms', N.length, 'Noten');
  const rend = async (mix, a, b) => mono((await C('render', {mix, a, b})).ch);
  // Befund 1: erstes Anwenden wandelt die Ebene (ganz, mit Fortschritt ohne lange Pause), danach nur der Bereich
  const P = []; t = Date.now(); let tl = t; const pg = p => { const n2 = Date.now(); P.push([n2 - t, +p.toFixed(3)]); tl = n2; };
  const r0 = await C('s6plan', {lid: 'L1', mv: [{id: N[10].id, dm: 1, dt: 0}]}, pg), ms0 = Date.now() - t;
  let gap = 0; for (let i = 1; i < P.length; i++) gap = Math.max(gap, P[i][0] - P[i - 1][0]);
  ok('b1-erstes-anwenden-fortschritt', {ms: ms0, meldungen: P.length, ersteMs: P[0] && P[0][0], groessteLueckeMs: gap, teil: r0.part}, P.length >= 20 && P[0][0] < 500 && gap < 1500);
  const vor = await rend('L1'), times = [], parts = [], mvN = [];
  for (let k = 0; k < 12; k++) { const q = N[20 + k * 7]; mvN.push(q); const a = Date.now(); const r = await C('s6plan', {lid: 'L1', mv: [{id: q.id, dm: 1, dt: 0}]}); times.push(Date.now() - a); parts.push(r.part); }
  ok('b1-anwenden-12x-bereich', {ms: times, teile: parts.slice(0, 3)}, times.every(v => v < 1000) && parts.every(p => p && p[1] - p[0] < 3));
  const nach = await rend('L1');
  { // bitgleich außerhalb der neu gerechneten Bereiche, Ton der Noten genau, Nachbarn unverändert, keine Knackser an den Nahtstellen
    let out = 0; const inP = i => parts.some(p => i >= p[0] * sr - 2 && i <= p[1] * sr + 2); for (let i = 0; i < vor.length; i += 1) if (!inP(i)) out = Math.max(out, Math.abs(vor[i] - nach[i]));
    const ct = mvN.map(q => { const f0 = 440 * 2 ** ((q.m - 69) / 12), f = f0At(nach, sr, q.a + 0.08, q.b - 0.06); return r2(cents(f, f0 * 2 ** (1 / 12))); });
    const nb = mvN.map(q => { const qq = N[N.indexOf(q) + 1], f0 = 440 * 2 ** ((qq.m - 69) / 12); return r2(cents(f0At(nach, sr, qq.a + 0.08, qq.b - 0.06), f0)); });
    const kn = parts.map(p => { const e = [p[0], p[1]].map(s => d2(nach, Math.round(s * sr) - 960, Math.round(s * sr) + 960)), ref = d2(vor, Math.round(p[0] * sr) - 960, Math.round(p[1] * sr) + 960); return r2(Math.max(...e) / Math.max(ref, 1e-9)); });
    ok('b1-bereich-genau', {aussenMaxAbw: out, ctZiel: ct, ctNachbarn: nb, knackNahtZuNote: kn}, out === 0 && ct.every(c => Math.abs(c) <= 5) && nb.every(c => Math.abs(c) <= 5) && kn.every(v => v <= 1.2));
  }
  // Befund 3: Speicher – 12 Schritte teilen sich das Audio; ↶-Audio ≤ 64 MB auch nach vielen ganzen Rechnungen
  let m1 = await C('s6mem', {}); ok('b3-speicher-12-schritte', {benutztMB: r2(m1.cur / 1e6), nurUndoMB: r2(m1.undo / 1e6), fassungen: m1.n, undo: m1.undo6}, m1.undo < 8e6 && m1.cur < 20e6);
  { const a = Date.now(); await C('undo', {}); const u1 = await rend('L1'); await C('redo', {}); const u2 = await rend('L1'); let d1 = 0; for (let i = 0; i < u2.length; i++) d1 = Math.max(d1, Math.abs(u2[i] - nach[i])); ok('b3-undo-redo-bitgleich', {ms: Date.now() - a, redoMaxAbw: d1}, d1 === 0); }
  // Befund 2: Abspiel-Blöcke während einer langen Rechnung (ganze Ebene +1) – jeder Block kommt rasch
  const lat = []; let run = true, k = 20; const tA = Date.now(), pr = C('s6shift', {lid: 'L1', tr: 1}).then(r => { run = false; return r; });
  const poll = (async () => { while (run) { const a = Date.now(); await C('block', {k: k++, mix: null}); lat.push(Date.now() - a); await new Promise(z => setTimeout(z, 25)); } })();
  const rT = await pr; await poll; const msT = Date.now() - tA;
  ok('b2-bloecke-waehrend-rechnung', {ganzeEbeneMs: msT, bloecke: lat.length, maxMs: Math.max(...lat), mittelMs: r2(lat.reduce((s, v) => s + v, 0) / lat.length)}, lat.length >= 20 && Math.max(...lat) < 400);
  for (let j = 0; j < 5; j++) await C('s6shift', {lid: 'L1', tr: j % 2 ? 1 : -1});
  m1 = await C('s6mem', {}); ok('b3-speicher-grenze', {benutztMB: r2(m1.cur / 1e6), nurUndoMB: r2(m1.undo / 1e6), undo: m1.undo6}, m1.undo <= 64e6 && m1.undo6 >= 1);
  await call('close', {doc});
}

if (TEIL.includes('kurz')) {
  // ---- 6-s-Lied (wie Kern-Test): Kopie unabhängig, Quelle löschen, Auswahl, Zerlegen
  const S = song(6, [[1.0, 2.0, 220], [2.2, 3.2, 293.665], [3.4, 4.4, 246.942]]), sr = S.sr;
  const mk = async roh => { const doc = (await call('create', {name: 'kurz', sr, ch: [S.L, S.R], grid: {bpm: 120, off: 0, ts: '4/4'}})).meta.id, C = (op, a) => call(op, Object.assign({doc}, a));
    if (roh) return {doc, C, rend: async (mix, a, b) => (await C('render', {mix, a, b})).ch};
    await C('transfer', {von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.8, t1: 4.7, f0: 150, f1: 9500}}); await C('noten', {lid: 'L1'}); return {doc, C, rend: async (mix, a, b) => (await C('render', {mix, a, b})).ch}; };
  // Befund 4a: In Ebene (aus Original, verschieben) in die Kopie nimmt der Quelle nichts weg – und umgekehrt
  { const {C, rend} = await mk(); const cp = (await C('s6dup', {lid: 'L1'})).lid, src0 = mono(await rend('L1')), cp0 = mono(await rend(cp));
    const sel = {art: 'rect', t0: 2.2, t1: 2.8, f0: 150, f1: 9500};
    await C('transfer', {von: 'orig', nach: cp, modus: 'verschieben', sel}); const src1 = mono(await rend('L1')), cp1 = mono(await rend(cp));
    await C('transfer', {von: 'orig', nach: 'L1', modus: 'verschieben', sel}); const cp2 = mono(await rend(cp));
    ok('b4-in-kopie-quelle-bleibt', {quelleVor: r2(rms(src0, sr, 2.3, 2.7) * 1e4) / 1e4, quelleNach: r2(rms(src1, sr, 2.3, 2.7) * 1e4) / 1e4, kopieNachInQuelle: r2(rms(cp2, sr, 2.3, 2.7) * 1e4) / 1e4, kopieVor: r2(rms(cp0, sr, 2.3, 2.7) * 1e4) / 1e4},
      Math.abs(rms(src1, sr, 2.3, 2.7) - rms(src0, sr, 2.3, 2.7)) < 1e-4 && Math.abs(rms(cp2, sr, 2.3, 2.7) - rms(cp1, sr, 2.3, 2.7)) < 1e-4 && rms(cp2, sr, 2.3, 2.7) > 0.03);
  }
  // Befund 4b: erneutes Zerlegen nach dem Kopieren – die Gesang-Ebene bleibt so stark wie ohne Kopie
  { const A = await mk(1); await A.C('zerlegen', {}); const g0 = (await A.C('open', {})).meta.layers.find(l => l.z === 'gesang').id; await A.C('zerlegen', {}); const e0 = rms(mono(await A.rend(g0)), sr, 1, 4.4);
    const B = await mk(1); await B.C('zerlegen', {}); const g1 = (await B.C('open', {})).meta.layers.find(l => l.z === 'gesang').id; await B.C('s6dup', {lid: g1}); await B.C('zerlegen', {}); const e1 = rms(mono(await B.rend(g1)), sr, 1, 4.4);
    ok('b4-zerlegen-mit-kopie', {gesangOhneKopie: r2(e0 * 1e4) / 1e4, gesangMitKopie: r2(e1 * 1e4) / 1e4}, e0 > 0.01 && Math.abs(e1 - e0) / e0 < 0.02);
  }
  // Befund 5: Quelle löschen, Kopie behalten → klingt wie vorher (nicht doppelt); ↶ stellt beides wieder her
  { const {C, rend} = await mk(); const m0 = mono(await rend(null)), cp = (await C('s6dup', {lid: 'L1'})).lid; await C('s6fx', {lid: cp, fx: {hall: 0}}); const m1 = mono(await rend(null));
    const r = await C('layer', {was: 'weg', lid: 'L1'}); const m2 = mono(await rend(null)), c = r.meta.layers.find(l => l.id === cp); await C('undo', {}); const m3 = mono(await rend(null));
    ok('b5-quelle-loeschen', {original: r2(rms(m0, sr, 1.3, 1.7) * 1e4) / 1e4, mitKopie: r2(rms(m1, sr, 1.3, 1.7) * 1e4) / 1e4, nachLoeschen: r2(rms(m2, sr, 1.3, 1.7) * 1e4) / 1e4, nachUndo: r2(rms(m3, sr, 1.3, 1.7) * 1e4) / 1e4, kopieK6: c.k6 || 0},
      Math.abs(rms(m2, sr, 1.3, 1.7) - rms(m0, sr, 1.3, 1.7)) < 2e-3 && Math.abs(rms(m3, sr, 1.3, 1.7) - rms(m1, sr, 1.3, 1.7)) < 1e-6 && !c.k6);
  }
  // Befund 6: ▶ Auswahl spielt eine umgesetzte Ebene und eine Chorstimme (Auswahl über alles ≈ ohne Auswahl, kleine Auswahl = nur dort)
  { const {C, rend} = await mk(); const N = (await C('open', {})).meta.teil2.notes.L1, q = N.find(z => z.m === 62);
    await C('s6plan', {lid: 'L1', mv: [{id: q.id, dm: 2, dt: 0}]}); const ch = await C('s6chor', {lid: 'L1', n: 2, art: 'terz'}), v = ch.voices[0].lid;
    const sv = 77, all = {art: 'rect', t0: 0.5, t1: 4.8, f0: 100, f1: 9000}, part = {art: 'rect', t0: 2.3, t1: 3.0, f0: 100, f1: 9000};
    const en = async (mix, sel, s) => { let e = 0; for (let k = 3; k <= 13; k++) { const b = (await C('block', {k, mix, sel, sv: s})).ch; for (const c of b) for (let i = 0; i < c.length; i++) e += c[i] * c[i]; } return e; };
    const enKurz = async (mix, sel, s, t0, t1) => { const y = []; for (let k = 0; k < 18; k++) { const b = (await C('block', {k, mix, sel, sv: s})).ch; y.push(...b[0]); } return rms(Float32Array.from(y), sr, t0, t1); };
    const eL = await en('L1', null, 0), eLs = await en('L1', [all], sv), eV = await en(v, null, 0), eVs = await en(v, [all], sv + 1);
    const inP = await enKurz('L1', [part], sv + 2, 2.4, 2.9), outP = await enKurz('L1', [part], sv + 2, 1.2, 1.8);
    ok('b6-auswahl-audio-ebene', {gesang: r2(eL), gesangAuswahl: r2(eLs), chor: r2(eV), chorAuswahl: r2(eVs), kleineAuswahlInnen: +inP.toFixed(4), aussen: +outP.toFixed(6)}, eLs > 0.8 * eL && eLs < 1.2 * eL && eVs > 0.8 * eV && inP > 0.02 && outP < 1e-3);
  }
}
if (TEIL.includes('kurz')) {
  // Bereichs-Rechnung auch auf einer Chorstimme (Versatz, Pegel zwischen den Noten) und auf der Kopie einer umgesetzten Ebene (geteiltes Audio)
  const S = song(6, [[1.0, 2.0, 220], [2.2, 3.2, 293.665], [3.4, 4.4, 246.942]]), sr = S.sr, doc = (await call('create', {name: 'chor', sr, ch: [S.L, S.R], grid: {bpm: 120, off: 0, ts: '4/4'}})).meta.id, C = (op, a) => call(op, Object.assign({doc}, a));
  await C('transfer', {von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.8, t1: 4.7, f0: 150, f1: 9500}}); await C('noten', {lid: 'L1'});
  const N1 = (await C('open', {})).meta.teil2.notes.L1, qa = N1.find(q => q.m === 57); await C('s6plan', {lid: 'L1', mv: [{id: qa.id, dm: 2, dt: 0}]});
  const cp = (await C('s6dup', {lid: 'L1'})).lid, Nc = (await C('open', {})).meta.teil2.notes[cp], qd = Nc.find(q => q.m === 62), r1 = await C('s6plan', {lid: cp, mv: [{id: qd.id, dm: -2, dt: 0}]});
  const y = mono((await C('render', {mix: cp})).ch), fD = f0At(y, sr, 2.45, 2.95), fA = f0At(y, sr, 1.25, 1.75);
  const ch = await C('s6chor', {lid: 'L1', n: 2, art: 'terz'}), v = ch.voices[0], Nv = (await C('open', {})).meta.teil2.notes[v.lid], qb = Nv.find(q => Math.abs(q.a - 3.4 - v.dt / 1000) < 0.05);
  const y0 = mono((await C('render', {mix: v.lid})).ch), r2v = await C('s6plan', {lid: v.lid, mv: [{id: qb.id, dm: 1, dt: 0}]}), y1 = mono((await C('render', {mix: v.lid})).ch);
  const fv0 = f0At(y0, sr, 3.6, 4.2), fv1 = f0At(y1, sr, 3.6, 4.2); let out = 0; for (let i = 0; i < y0.length; i++) if (i < r2v.part[0] * sr - 2 || i > r2v.part[1] * sr + 2) out = Math.max(out, Math.abs(y0[i] - y1[i]));
  ok('b1-bereich-kopie-und-chorstimme', {kopieTeil: r1.part, kopieD4minus2ct: r2(cents(fD, 261.626)), kopieA3plus2ct: r2(cents(fA, 246.942)), stimmeTeil: r2v.part, stimmeVorher: r2(fv0), stimmeNachher: r2(fv1), schrittCt: r2(cents(fv1, fv0)), aussenMaxAbw: out},
    r1.part && Math.abs(cents(fD, 261.626)) < 5 && Math.abs(cents(fA, 246.942)) < 5 && r2v.part && Math.abs(cents(fv1, fv0) - 100) < 5 && out < 1e-4);   // außerhalb gleich (höchstens 1 Stufe, wenn die neue Note lauter ist und einmal neu skaliert wird)
}
console.log(JSON.stringify({ms: Date.now() - T0, fails}));
fs.writeFileSync(path.join(path.dirname(file), 'spk6-pruef-test.json'), JSON.stringify({ms: Date.now() - T0, fails, res}, null, 1));
console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK');
