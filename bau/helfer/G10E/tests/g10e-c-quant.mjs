// G10e C: Quantisieren fein – Nur Wortanfänge (G10-40), Q-Bereich (G10-41), alte Takes unverändert (G10-42), Tonwechsel-Marken, Undo/Redo, Speichern/Laden
import {launch, open, take, sleep, ok, fails, info, undoN, openEd, deq, SR} from './h.mjs';
import {createRequire} from 'module';
const br = await launch();
const H = await open(br), p = H.p;
// Korpus: Wörter (nach einer Pause ≥ 120 ms = Wort-Strich) mit 2–3 Silben, Einsätze 10–60 ms neben dem 1/16-Raster
const W = [[0.52, 0.71, 0.88], [1.27, 1.49], [1.98, 2.13, 2.36], [2.77, 2.98], [3.46, 3.64, 3.83]];
const T = W.flat(), gaps = [[1.02, 1.27], [1.73, 1.98], [2.55, 2.77], [3.2, 3.46]];
const {id, ref} = await take(p, T, 4.6, 3, 0, {gaps});
const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
// genau die Silben-Marken behalten (wie im Editor gelöscht); Wort-Marken laut Erkennung
for (let k = det.length - 1; k >= 0; k--) if (!T.some(t => Math.abs(t - det[k].t) < .006)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [id, k]);
let I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
const words = I.marks.filter(m => m.word).length;
ok(I.marks.length === T.length && words === W.length, 'Korpus: ' + I.marks.length + ' Silben-Marken, davon ' + words + ' Wort-Striche (erwartet ' + W.length + ')');
ok(I.marks.every(m => m.src === 'on' || m.src === 'pitch'), 'neue Erkennung: Herkunft je Marke gespeichert (src)');
const u0 = await undoN(p);
// ---------- G10-40 Nur Wortanfänge ----------
await openEd(p, ref, id);
await p.evaluate(() => SYNQUENZER.g10Fine({wo: true}));                          // ohne Karte: gilt beim nächsten Quantisieren
ok(await undoN(p) === u0, 'Nur Wortanfänge ohne Karte: kein Undo-Schritt (gilt beim Quantisieren)');
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'stretch'}), ref);
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
{
  const w = I.warp, sp = 60 / w.bpm, step = .25, mk = I.marks, dst = t => { const s = w.map.src, d = w.map.dst; for (let i = 0; i < s.length; i++) if (Math.abs(s[i] - t) < 1e-6) return d[i]; return null; };
  let wOk = 0, wn = 0, worstR = 0, wErr = 0;
  const anchors = mk.map((m, i) => (m.word ? i : -1)).filter(i => i >= 0);
  for (const i of anchors) { const d = dst(mk[i].t), b = (d - w.t0) / sp, e = Math.abs(b - Math.round(b / step) * step) * sp * 1000; wErr = Math.max(wErr, e); wn++; if (e <= 1) wOk++; }
  for (let a = 0; a < anchors.length - 1; a++) {
    const i = anchors[a], j = anchors[a + 1], si = mk[i].t, sj = mk[j].t, di = dst(si), dj = dst(sj);
    for (let k = i + 1; k < j; k++) { const r0 = (mk[k].t - si) / (sj - si), r1 = (dst(mk[k].t) - di) / (dj - di); worstR = Math.max(worstR, Math.abs(r1 / r0 - 1)); }
  }
  ok(w.wo === true && wOk === wn && wn === W.length, 'G10-40 Wort-Einsätze auf dem Raster ±1 ms (' + wOk + '/' + wn + ', schlimmster ' + wErr.toFixed(3) + ' ms)');
  ok(worstR <= .02, 'G10-40 Silben im Wort bleiben im Verhältnis ±2 % (schlimmster ' + (worstR * 100).toFixed(3) + ' %)');
  const sylMoved = mk.filter(m => !m.word).some(m => Math.abs(dst(m.t) - m.t) > 1e-4);
  ok(sylMoved, 'Silben folgen anteilig (nicht nur stehen gelassen)');
}
const P1 = await p.evaluate(() => SYNQUENZER.project());
await p.evaluate(() => SYNQUENZER.g10Fine({wo: false}));
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(!I.warp.wo && await undoN(p) === u0 + 2, 'Nur Wortanfänge aus bei bestehender Karte: sofort neu, 1 Undo');
await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
ok(deq(await p.evaluate(() => SYNQUENZER.project()), P1), '↶ → wieder „Nur Wortanfänge“ (deep-equal)');
await p.evaluate(() => SYNQUENZER.redo()); await sleep(100);
ok(!(await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp.wo, '↷ → wieder aus');
// ---------- G10-41 Q-Bereich 15 ms ----------
await p.evaluate(() => SYNQUENZER.g10Fine({qr: 15}));
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'stretch'}), ref);
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
{
  const w = I.warp, sp = 60 / w.bpm, step = .25; let near = 0, nearOk = 0, far = 0, farOk = 0;
  await p.evaluate(() => SYNQUENZER.wpAB(true));                      // Bezug: die gehörte Fassung ohne Zeitkarte (Original, mit derselben übrigen Verarbeitung)
  const raw = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), id)).data);
  await p.evaluate(() => SYNQUENZER.wpAB(false));
  const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id), y = Float32Array.from(Y.data), L = Math.round(.02 * SR);
  let bit = 0;
  for (const m of I.marks) {
    const b = (m.t - w.t0) / sp, g = w.t0 + Math.round(b / step) * step * sp, dist = Math.abs(g - m.t) * 1000;
    const k = w.map.src.findIndex(s => Math.abs(s - m.t) < 1e-6), d = k >= 0 ? w.map.dst[k] : m.t;
    if (dist <= 15) { near++; if (d === m.t) nearOk++;
      const i0 = Math.round(m.t * SR); let same = true; for (let j = 0; j < L; j++) if (y[i0 + j] !== raw[i0 + j]) { same = false; break; } if (same) bit++; else if (process.env.DBG) { let fo = -1; for (let dd = 0; dd <= 4800 && fo < 0; dd++) for (const o of [i0 + dd, i0 - dd]) { let sm = true; for (let j = 0; j < L; j++) if (y[o + j] !== raw[i0 + j]) { sm = false; break; } if (sm) { fo = o - i0; break; } } let md = 0; for (let j = 0; j < L; j++) md = Math.max(md, Math.abs(y[i0 + j] - raw[i0 + j])); console.log('  Einsatz', m.t, 'gefunden bei Versatz', fo, 'max Abw.', md.toExponential(2), 'n', y.length, raw.length); } }
    else { far++; if (Math.abs(d - g) < .0011) farOk++; }
  }
  ok(w.qr === 15 && near >= 2 && nearOk === near, 'G10-41 Q-Bereich 15 ms: ' + nearOk + '/' + near + ' Einsätze ≤ 15 ms bleiben genau stehen (Ziel = Quelle)');
  ok(bit === near, 'G10-41 … und klingen bitgleich an ihrer Stelle (20 ms je Einsatz, gerendert): ' + bit + '/' + near);
  ok(far >= 2 && farOk === far, 'Einsätze > 15 ms rücken auf die Linie: ' + farOk + '/' + far);
}
// Speichern → Laden deep-equal (src, wo, qr)
{
  const J = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
  await p.evaluate(() => SYNQUENZER.importJSON(SYNQUENZER.serialize())); await sleep(400);
  const J2 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
  ok(deq(JSON.parse(J), JSON.parse(J2)) && J.includes('"qr":15') && J.includes('"src":"on"'), 'Speichern → Laden deep-equal (qr, src)');
}
// ---------- Tonwechsel-Marken neuer Erkennungen werden nicht quantisiert (folgen anteilig) ----------
{
  const r = await take(p, T, 4.6, 3, 1, {gaps});
  await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: 'off'}), r.ref);
  const J = JSON.parse(await p.evaluate(() => SYNQUENZER.serialize())), tk = J.project.takes[r.id];
  const det = await p.evaluate(id => SYNQUENZER.wpInfo(id).det, r.id);
  tk.marks = det.map(m => Object.assign({}, m)); const kp = tk.marks.findIndex((m, i) => i > 0 && !m.word && Math.abs(m.t - 2.129) < .01); tk.marks[kp].src = 'pitch';   // wie eine erkannte Tonwechsel-Marke
  await p.evaluate(s => SYNQUENZER.importJSON(s), JSON.stringify(J)); await sleep(400);
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'stretch'}), r.ref);
  const I2 = await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id), w = I2.warp, mk = I2.marks;
  const dst = t => { const k = w.map.src.findIndex(s => Math.abs(s - t) < 1e-6); return k < 0 ? null : w.map.dst[k]; };
  const a = mk[kp - 1], b = mk[kp + 1], u = (mk[kp].t - a.t) / (b.t - a.t), want = dst(a.t) + u * (dst(b.t) - dst(a.t));
  const sp = 60 / w.bpm, onGrid = t => { const q = (t - w.t0) / sp / .25; return Math.abs(q - Math.round(q)) * .25 * sp < .0011; };
  ok(mk[kp].src === 'pitch' && Math.abs(dst(mk[kp].t) - want) < .0011 && onGrid(dst(a.t)) && onGrid(dst(b.t)), 'Tonwechsel-Marke wird nicht gerastet, folgt anteilig zwischen den Nachbarn (' + (dst(mk[kp].t) * 1000).toFixed(1) + ' ms, soll ' + (want * 1000).toFixed(1) + ' ms); Nachbarn auf dem Raster');
}
ok(!H.errs.length, 'keine Konsolen-Fehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.ctx.close();
// ---------- G10-42 alte Takes: dieselbe Karte und bitgleiches Abspielen wie 4.30.0 ----------
{
  const base = new URL('../../../snapshots/R-4300.html', import.meta.url).pathname;
  const run = async (app, strip) => {
    process.env.G10E_APP = app;
    const {open: open2} = await import('./h.mjs?' + Math.random());
    const Hx = await open2(br), q = Hx.p;
    const tk = await take(q, T, 4.6, 3, 0, {gaps});
    await q.evaluate(id => SYNQUENZER.wpDetect(id), tk.id);
    if (strip) {                                                          // ein Take aus 4.30.0: Marken eingefroren ohne Herkunft
      const J = JSON.parse(await q.evaluate(() => SYNQUENZER.serialize()));
      const det = await q.evaluate(id => SYNQUENZER.wpInfo(id).det, tk.id);
      const tkj = J.project.takes[tk.id]; if (!tkj) throw new Error('Take fehlt im Projekt');
      tkj.marks = det.map(m => { const o = Object.assign({}, m); delete o.src; delete o.word; return o; });   // 4.30.0 kannte keine Herkunft (und fast nie Wort-Striche)
      await q.evaluate(s => SYNQUENZER.importJSON(s), JSON.stringify(J)); await sleep(400);
    }
    const out = {};
    for (const [g, s, md] of [['1/16', 1, 'slice'], ['1/8', .7, 'stretch'], ['auto', 1, 'stretch'], ['1/16T', .5, 'slice']]) {
      await q.evaluate(([r, o]) => SYNQUENZER.wpQuantize(r, o), [tk.ref, {grid: g, strength: s, mode: md}]);
      const Y = await q.evaluate(id => SYNQUENZER.wpPlayed(id), tk.id);
      let h = 0; for (const v of Y.data) h = (h * 31 + Math.round(v * 1e7)) | 0;
      out[g] = {warp: await q.evaluate(id => SYNQUENZER.wpInfo(id).warp, tk.id), n: Y.n, h};
    }
    out.take = await q.evaluate(id => { const t = SYNQUENZER.project().takes[id]; return {marks: t.marks, warp: t.warp}; }, tk.id);
    await Hx.ctx.close();
    return out;
  };
  const A = await run(base, false), B = await run(new URL('../index.html', import.meta.url).pathname, true);
  const same = Object.keys(A).filter(k => k !== 'take').every(k => deq(A[k].warp, B[k].warp) && A[k].h === B[k].h && A[k].n === B[k].n);
  ok(same, 'G10-42 Take ohne src/wo/qr: wpQuant ergibt dieselbe Karte wie 4.30.0 (4 Raster/Modi, deep-equal) und klingt bitgleich (Prüfsumme)');
  if (!deq(A.take, B.take)) console.log(JSON.stringify(A.take).slice(0, 600), '\n', JSON.stringify(B.take).slice(0, 600));
  ok(deq(A.take, B.take) && !B.take.marks.some(m => 'src' in m) && !('wo' in B.take.warp) && !('qr' in B.take.warp), 'alter Take nach dem Quantisieren Zeichen für Zeichen wie in 4.30.0 (Marken + Karte, kein neues Feld)');
}
await br.close();
console.log(fails() ? 'FEHLER: ' + fails() : 'ALLES GRÜN');
process.exit(fails() ? 1 : 0);
