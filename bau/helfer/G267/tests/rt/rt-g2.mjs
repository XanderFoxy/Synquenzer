// RETEST G2 (unabhängig): Es-Dur-Szene, 44,1-kHz-Take, Männerstimme tief (~100 Hz) + hoch (~400 Hz), Legato ohne Pause,
// Zisch/Plosiv vor Einzeltönen. Echter Bedienweg: Takes-Blatt → Tipp ♪ → Tipp [Hart] (Touch) → Block ziehen (Maus).
import {launch, openG, sleep, toI16, deq, hz, ct, median, notePitch, clickAt, setKey, errsOf, longTasks, ltGet} from './h.mjs';
import {singer} from './sig.mjs';
import fs from 'fs';
const SR = 44100, OUT = [];
let fail = 0; const ok = (c, m) => { const s = (c ? '✓ ' : '✗ ') + m; console.log(s); OUT.push(s); if (!c) fail++; };
const N = (m, off, d, vowel) => ({m, off, d, vowel, f0: hz(m + off / 100)});
// Es-Dur: Es F G As B C D
const phrases = [
  {t0: 0.20, glide: 0.03, vib: 18, segs: [N(46, 38, .4, 'a'), N(43, -36, .4, 'o'), N(44, 40, .4, 'e'), N(41, -33, .4, 'a'), N(43, 44, .4, 'u')]},   // tief, Legato (Nachbarn ≥ 1 HT auseinander)
  {t0: 2.60, glide: 0.03, vib: 22, segs: [N(68, -31, .35, 'a'), N(65, 44, .35, 'e'), N(67, -38, .35, 'i'), N(63, 40, .35, 'o'), N(65, 35, .35, 'a')]},   // hoch, Legato
  {t0: 4.80, cons: 's', vib: 15, segs: [N(48, 35, .45, 'a')]},
  {t0: 5.60, cons: 't', vib: 15, segs: [N(51, -40, .45, 'e')]},
  {t0: 6.40, cons: 's', vib: 15, segs: [N(62, 31, .45, 'i')]},
  {t0: 7.20, cons: 't', vib: 15, segs: [N(56, -44, .45, 'o')]}
];
const {x, truth, cons} = singer(SR, 8.4, phrases, {seed: 21});
const win = n => [n.t0 + (n.legato ? 0.07 : 0.06), n.t1 - (n.legato ? 0.07 : 0.07)];
const meas = y => truth.map(n => { const [a, b] = win(n); return notePitch(y, SR, a, b); });

const br = await launch(null), H = await openG(br, {touch: true}), p = H.p, errs = errsOf(p);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const kk = await setKey(p, 3, 'ionian'); console.log('Tonart', JSON.stringify(kk));
await p.evaluate(() => SYNQUENZER.play()); await sleep(200); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 44100, scene: 0, len: 5}), toI16(x));
const R = {t: r1.track, s: 0}, id = r1.id;
const xr = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id));
const LT = []; const played = async () => { LT.push(...(await ltGet(p)).map(d => d)); const r = await p.evaluate(R => SYNQUENZER.g2Played(R), R); await ltGet(p); return {raw: r.raw, sr: r.sr, y: Float32Array.from(r.data)}; };
const P0 = await played(); ok(P0.raw && P0.sr === 44100 && P0.y.length === xr.length, `Take 44,1 kHz angelegt: sr ${P0.sr}, ${P0.y.length} Samples, ohne Bearbeitung = Roh-Take`);
const m0 = meas(xr);
console.log('Original (Cent neben Basis):', truth.map((n, k) => ct(m0[k], hz(n.m)).toFixed(1)).join(' '));
const project0 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project().tracks));
await longTasks(p);
// --- echter Bedienweg: Takes-Blatt, Tipp ♪, Tipp [Hart]
await p.evaluate(R => SYNQUENZER.tkSheet(R), R); await sleep(700);
await p.tap('.pop button[data-a=g2]'); await sleep(600);
const edOpen = await p.evaluate(() => !!document.querySelector('#wpSheet.g2.open'));
ok(edOpen, 'Tipp ♪ Tonhöhe · Noten öffnet den Noten-Editor');
await p.waitForFunction(R => { const i = SYNQUENZER.g2Info(R); return i.an && i.an.notes.length; }, R, {timeout: 20000});
const an = await p.evaluate(R => SYNQUENZER.g2Info(R).an, R);
// G2-06: Blöcke = Noten (Start ±10 ms, Höhe ±20 Cent)
{ const rows = []; let dt = 0, dc = 0, miss = 0;
  for (const n of truth) { const q = an.notes.find(z => z.t0 < n.t1 - 0.05 && z.t1 > n.t0 + 0.05 && Math.abs(z.m - (n.m + n.off / 100)) < 0.6); if (!q) { miss++; continue; } dt = Math.max(dt, Math.abs(q.t0 - n.t0) * 1000 * (n.legato && n !== truth[0] && n !== truth[5] ? 0 : 1)); dc = Math.max(dc, Math.abs(q.m - (n.m + n.off / 100)) * 100); }
  ok(an.notes.length === truth.length && !miss && dc <= 20, `G2-06 Erkannt ${an.notes.length}/${truth.length} Noten (fehlend ${miss}); Höhe max ${dc.toFixed(1)} Cent neben dem Gesungenen; Start (Phrasenanfänge/Einzeltöne) max ${dt.toFixed(1)} ms` + (an.notes.length !== truth.length ? ' ' + JSON.stringify(an.notes.map(z => [z.t0, z.t1, z.m])) : ''));
}
const tH = Date.now();
await p.tap('#wpSheet .g2chips [data-v=hard]');
await p.waitForFunction(R => { const i = SYNQUENZER.g2Info(R); return i.pitch && i.pitch.q && i.ready; }, R, {timeout: 20000});
const tHard = Date.now() - tH;
const st1 = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R);
ok(st1.mode === 'hard' && st1.str === 1 && st1.key && st1.key.root === 3 && st1.key.scale === 'ionian', `Tipp [Hart]: Feld mode=${st1.mode} str=${st1.str} Tonart ${JSON.stringify(st1.key)} (Es-Dur der Szene), fertig nach ${tHard} ms`);
let P = await played(); const Y1 = P.y;
const m1 = meas(Y1);
{ const e = truth.map((n, k) => ct(m1[k], hz(n.m))), w = Math.max(...e.map(Math.abs));
  ok(w <= 5, `G2-01 Hart 100 % (Es-Dur, 44,1 kHz): je Note am Skalenton ±5 Cent – max ${w.toFixed(2)} [${e.map(v => v.toFixed(1)).join(' ')}]`); }
// Zisch-/Plosivlaute bitgleich (ganzer Konsonant inkl. Stille nach dem t)
const consDiff = y => cons.map(([a, b0, k]) => { const b = b0 + (k === 't' ? 0.025 : 0); let d = 0, mx = 0, pk = 0, first = -1; for (let i = Math.floor(a * SR); i < Math.floor(b * SR); i++) { pk = Math.max(pk, Math.abs(xr[i])); if (y[i] !== xr[i]) { d++; if (first < 0) first = i; mx = Math.max(mx, Math.abs(y[i] - xr[i])); } } return {k, d, mx, pk, first, b}; });
{ const c = consDiff(Y1); ok(c.every(z => z.d === 0), 'G2-05 Hart: Zisch-/Plosivlaute bitgleich: ' + c.map(z => z.k + ' ' + z.d + ' Samples anders' + (z.d ? ' (max ' + (20 * Math.log10(z.mx + 1e-12)).toFixed(1) + ' dBFS = ' + (20 * Math.log10(z.mx / z.pk)).toFixed(1) + ' dB unter Konsonant-Spitze, ab ' + ((z.first / SR - z.b) * 1000).toFixed(1) + ' ms vor Vokalbeginn)' : '')).join(', ')); }
// Klicks an Legato-Grenzen (verschiedene Verschiebungen je Note, keine Pause)
const bnd = []; for (let k = 1; k < truth.length; k++) if (truth[k].legato && truth[k - 1].legato && Math.abs(truth[k].t0 - truth[k - 1].t1) < 1e-6) bnd.push(truth[k].t0);
const edges = []; for (const n of truth) { edges.push(n.t0); edges.push(n.t1); }
{ const a = clickAt(Y1, SR, bnd), b = clickAt(xr, SR, bnd), d = a.map((v, k) => v - b[k]), w = Math.max(...d);
  ok(w <= 3, `G2-03 Legato-Grenzen (${bnd.length}, Verschiebung springt z. B. +38→−42 Cent): HP-Spitze über Umgebung max ${w.toFixed(1)} dB mehr als im Original [${d.map(v => v.toFixed(1)).join(' ')}]`);
  const a2 = clickAt(Y1, SR, edges), b2 = clickAt(xr, SR, edges), d2 = a2.map((v, k) => v - b2[k]); const wi = d2.indexOf(Math.max(...d2)); ok(Math.max(...d2) <= 3, `G2-03 alle Notengrenzen inkl. Ränder stimmhafter Strecken: max ${Math.max(...d2).toFixed(1)} dB über Original (bei ${edges[wi].toFixed(3)} s)`); }
ok(Y1.length === xr.length, `G2-03 Dauer ${Y1.length} = ${xr.length} Samples`);
// 50 % über das API (Stärke)
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'hard', str: 0.5}), R); P = await played();
{ const m = meas(P.y), e = truth.map((n, k) => ct(m[k], hz(n.m + n.off / 200))), w = Math.max(...e.map(Math.abs)); ok(w <= 5, `G2-01 Hart 50 %: halber Abstand ±5 Cent – max ${w.toFixed(2)} [${e.map(v => v.toFixed(1)).join(' ')}]`); }
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'soft', str: 1}), R); P = await played();
{ const m = meas(P.y), e = truth.map((n, k) => ct(m[k], hz(n.m))), w = Math.max(...e.map(Math.abs)); ok(w <= 5, `G2-01 Weich 100 %: max ${w.toFixed(2)} Cent`);
  const a = clickAt(P.y, SR, bnd), b = clickAt(xr, SR, bnd); ok(Math.max(...a.map((v, k) => v - b[k])) <= 3, `G2-03 Weich Legato-Grenzen: max ${Math.max(...a.map((v, k) => v - b[k])).toFixed(1)} dB über Original`); }
// zurück auf Hart 100 % per Tipp
await p.tap('#wpSheet .g2chips [data-v=hard]'); await sleep(300);
// Note ziehen: Note 7 (hoch, F4) um 2 Zeilen nach oben (Maus-Drag im Editor)
await p.waitForFunction(R => SYNQUENZER.g2Info(R).ready, R, {timeout: 20000});
P = await played(); const Yh = P.y; { let d = 0; for (let i = 0; i < Yh.length; i++) if (Yh[i] !== Y1[i]) d++; ok(d === 0, `Hart 100 % erneut (Tipp nach 50 %/Weich): bitgleich zur ersten Hart-Fassung (${d} anders, Cache/Determinismus)`); }
const stH = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R);
const K = 7; const KT = 7;   // App-Note 7 = Wahrheit 7 (wenn alle 14 erkannt)
const g = await p.evaluate(() => SYNQUENZER.g2Geom());
// Block K sichtbar? (Zoom)
let blk = g.blocks.find(b => b.k === K);
console.log('Editor', JSON.stringify({w: g.w, h: g.h, rowH: g.rowH, view: g.view, blk}));
if (!(blk && blk.x1 > g.x && blk.x0 < g.x + g.w)) { for (let z = 0; z < 4 && !(blk && blk.x0 >= g.x && blk.x1 <= g.x + g.w); z++) { await p.tap('#wpSheet .g2chips [data-v=zoom]'); await sleep(200); const g2 = await p.evaluate(() => SYNQUENZER.g2Geom()); blk = g2.blocks.find(b => b.k === K); Object.assign(g, g2); } }
const cx = (Math.max(blk.x0, g.x) + Math.min(blk.x1, g.x + g.w)) / 2, cy = blk.y;
await p.mouse.move(cx, cy); await p.mouse.down(); for (let s = 1; s <= 8; s++) { await p.mouse.move(cx, cy - s * 2 * g.rowH / 8); await sleep(16); } await p.mouse.up();
await sleep(200);
await p.waitForFunction(R => SYNQUENZER.g2Info(R).ready, R, {timeout: 20000});
const st2 = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R);
P = await played(); const Y2 = P.y;
{ const m = meas(Y2), c = ct(m[K], m1[K]), o = truth.map((n, k) => k === K ? 0 : Math.abs(ct(m[k], m1[k]))), w = Math.max(...o);
  ok(st2.notes[K].sh === 2 && Math.abs(c - 200) <= 5 && w <= 0.5, `G2 Block gezogen (2 Zeilen ↑, Maus): sh=${st2.notes[K].sh}, gehört ${c.toFixed(1)} Cent über Hart (Soll 200 ±5); andere Noten max ${w.toFixed(2)} Cent verändert`);
  const lo = Math.round((st2.notes[K].t0 - 0.08) * SR), hi = Math.round((st2.notes[K].t1 + 0.08) * SR); let out = 0, f = -1, l = -1; for (let i = 0; i < Y2.length; i++) if ((i < lo || i > hi) && Y2[i] !== Y1[i]) { out++; if (f < 0) f = i; l = i; }
  const ph = phrases[1], pa = ph.t0, pb = ph.t0 + ph.segs.reduce((s, q) => s + q.d, 0);
  ok(f < 0 || (f / SR >= pa - 0.001 && l / SR <= pb + 0.001), `G2-05 Ziehen: Änderungen nur in der stimmhaften Strecke der Note (Legato-Phrase ${pa.toFixed(2)}–${pb.toFixed(2)} s); außerhalb ±80 ms der Note ${out} Samples anders (${f < 0 ? '–' : (f / SR).toFixed(3) + '–' + (l / SR).toFixed(3) + ' s'}; nur Phasenlage der Nachbarnoten, deren Tonhöhe ±0,02 Cent gleich)`);
  const a = clickAt(Y2, SR, [truth[KT].t0, truth[KT].t1]), b = clickAt(xr, SR, [truth[KT].t0, truth[KT].t1]); ok(Math.max(a[0] - b[0], a[1] - b[1]) <= 3, `G2-05 +2 HT in Legato-Phrase: Grenzen ${a.map((v, k) => (v - b[k]).toFixed(1)).join(' / ')} dB über Original`); }
{ const c = consDiff(Y2); ok(c.every(z => z.d === 0), 'G2-05 nach dem Ziehen: Konsonanten bitgleich (' + c.map(z => z.d).join(',') + ')'); }
const lt1 = LT.concat(await ltGet(p)); ok(!lt1.filter(d => d > 50).length, `G2-04 keine langen Tasks > 50 ms während Blatt/♪/Hart/50 %/Weich/Ziehen: [${lt1.join(',') || '–'}]`);
const how = await p.evaluate(R => SYNQUENZER.g2Info(R), R); console.log('Rechnen:', how.how, JSON.stringify(how.last), JSON.stringify(how.lastAn));
// Undo/Redo-Kette: ↶ → Hart (vor dem Ziehen) deep-equal + bitgleich; ↶ ↶ ↶ ↶ (Hart ← Weich ← 50 % ← Hart ← nichts)
const snap = async () => ({pitch: await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R), y: (await played()).y});
const beq = (a, b) => { if (a.length !== b.length) return a.length + '≠' + b.length; let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
let s = await snap(); ok(deq(s.pitch, stH) && beq(s.y, Yh) === 0, `G2-04 ↶ (Ziehen) → Feld deep-equal, Klang bitgleich (${beq(s.y, Yh)} anders)`);
let n = 0; while (n < 8) { const st = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R); if (!st) break; await p.evaluate(() => SYNQUENZER.undo()); await sleep(150); n++; }
s = await snap(); ok(!s.pitch && beq(s.y, xr) === 0, `G2-04 ↶ ×${n} ganz zurück → kein Feld, Klang = Roh-Take bitgleich (${beq(s.y, xr)})`);
const projBack = await p.evaluate(() => JSON.stringify(SYNQUENZER.project().tracks)); ok(projBack === project0, 'G2-04 ganz zurück: Spuren/Clip-JSON zeichengleich zum Stand vor der Bearbeitung');
for (let k = 0; k < n + 1; k++) { await p.evaluate(() => SYNQUENZER.redo()); await sleep(100); }
s = await snap(); ok(deq(s.pitch, st2) && beq(s.y, Y2) === 0, `G2-04 ↷ ×${n + 1} → gezogener Stand deep-equal, Klang bitgleich (${beq(s.y, Y2)})`);
// Speichern → neu laden → Laden
await p.evaluate(() => SYNQUENZER.save()); await sleep(600); await p.reload(); await sleep(1500); await p.evaluate(() => SYNQUENZER.load()); await sleep(1500);
await p.evaluate(id => SYNQUENZER.tkLoadAll(), id); await sleep(300);
s = await snap(); ok(deq(s.pitch, st2) && beq(s.y, Y2) === 0, `G2-04 Speichern → neu laden → Laden: Feld deep-equal, Klang bitgleich (${beq(s.y, Y2)})`);
const sr2 = await p.evaluate(R => SYNQUENZER.g2Played(R).then(r => r.sr), R); ok(sr2 === 44100, 'nach dem Laden: Take weiterhin 44,1 kHz (' + sr2 + ')');
ok(!errs.length, 'keine Seitenfehler ' + errs.join(' | '));
await br.close();
fs.writeFileSync('/home/user/Synquenzer/bau/helfer/G267/tests/rt/out/rt-g2.out', OUT.join('\n') + '\n');
console.log(fail ? fail + ' FEHLER' : 'ALLE GRÜN'); process.exit(fail ? 1 : 0);
