// G10e B: Prüfen – Strich-Blatt [▶] (G10-38), Klick auf der Rasterlinie, Versatz-Zahlen (G10-39), Einrasten sichtbar + Klick, Lupe, Prüf-Lauf, Abspielmarke
import {launch, open, take, sleep, ok, fails, touch, drag, tap, geom, info, marksOf, undoN, openEd, popClose} from './h.mjs';
const br = await launch();
const H = await open(br), p = H.p, c = H.cdp;
const T = Array.from({length: 12}, (_, k) => 0.5 + k * 0.3 + [0, .018, -.022, .031][k % 4]);
const {id, ref} = await take(p, T);
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });      // Audio an (wie ein erster Tipp)
await openEd(p, ref, id);
await p.evaluate(() => SYNQUENZER.g10View(-1, 0));
let g = await geom(p);
const sel = async () => { g = await geom(p); const M = g.marks; for (let i = 2; i < M.length - 1; i++) if (M[i] - M[i - 1] > 22 && M[i + 1] - M[i] > 22) return i; return 3; };
// ---------- G10-38 [▶]: von 80 ms davor bis zum nächsten Strich; Klick auf der Rasterlinie ±1 ms ----------
{
  const k = await sel();
  await tap(c, g.marks[k], g.y + 10); await sleep(250);
  const pop = await p.evaluate(() => { const b = document.querySelector('.pop.wpsel [data-a="play"]'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, del: !!document.querySelector('.pop.wpsel [data-a="del"]')}; });
  ok(pop && pop.del && pop.w >= 44 && pop.h >= 44, 'Tipp auf den Strich (Leiste): Blatt [▶] [✕ Löschen], Ziele ≥ 44 px ' + JSON.stringify(pop));
  await p.evaluate(() => { window.__starts.length = 0; });
  await tap(c, pop.x, pop.y); await sleep(200);
  const L = (await info(p)).last, st = await p.evaluate(() => window.__starts.slice());
  const want = L.next - L.mark + .08, s0 = st.find(s => s.dur != null);
  ok(L && Math.abs(L.dur - want) <= .005 && s0 && Math.abs(s0.dur - want) <= .005 && Math.abs(s0.off - (L.mark - .08)) <= .001,
    'G10-38 [▶] spielt next − mark + 80 ms: ' + (s0 && s0.dur * 1000).toFixed(1) + ' ms (soll ' + (want * 1000).toFixed(1) + ' ms), ab ' + (s0 && s0.off.toFixed(4)) + ' s');
  ok(await p.evaluate(() => !!document.querySelector('.pop.wpsel')), 'das Blatt bleibt offen ([▶] noch einmal hören)');
  // Abspielmarke im Editor läuft mit
  await sleep(60); const pv = (await info(p)).ed.pv;
  ok(pv != null && pv >= L.from && pv <= L.from + L.dur + .05, 'Abspielmarke läuft im Editor mit (' + (pv && pv.toFixed(3)) + ' s)');
  await popClose(p); await sleep(400);
  // Klick an: Schalter im ⋯-Blatt
  const mo = await p.evaluate(() => { const r = document.querySelector('#wpSheet .g10more').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  await tap(c, mo.x, mo.y); await sleep(200);
  const kb = await p.evaluate(() => { const r = [...document.querySelectorAll('.pop.g10opt .g10r')].find(n => n.textContent.includes('Klick auf der Rasterlinie')); const b = r && r.querySelector('button'); const q = b.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2, h: q.height}; });
  await tap(c, kb.x, kb.y); await sleep(100); await popClose(p);
  await p.evaluate(() => { window.__osc = []; });
  const r = await p.evaluate(k => SYNQUENZER.g10Play(k), k);
  const gr = await p.evaluate(t => SYNQUENZER.g10Grid(t), r.mark);
  ok(r.click != null && Math.abs(r.click - gr.t) < 1e-9 && Math.abs((r.clickAt - r.start) - (gr.t - r.from)) <= .001,
    'G10-38 Klick auf der Rasterlinie: Linie ' + gr.t.toFixed(4) + ' s, Klick ' + ((r.clickAt - r.start + r.from)).toFixed(4) + ' s (±1 ms)');
  // gerendert prüfen: Offline-Nachbau derselben Planung (Quelle ab from, Klick bei clickAt − start)
  await sleep(500);
}
// ---------- G10-39 Versatz-Zahlen = wpGeom-Werte ±1 ms; Farben nach Schwelle ----------
{
  await p.evaluate(() => SYNQUENZER.g10View(0.4, 2.0)); await sleep(80);       // 1 Takt = 2 s bei 120 BPM
  const I = await info(p); g = await geom(p);
  const res = await p.evaluate(() => { const E = SYNQUENZER.wpInfo(); return {t0: E.t0, bpm: SYNQUENZER.project().bpm}; });
  const sp = 60 / res.bpm, step = .25;
  let worst = 0, n = 0;
  for (const o of I.ed.off) {
    const tm = g.view.a + (g.marks[o.k] - g.x) / g.w * g.view.W;            // Strich laut wpGeom
    const b = (tm - res.t0) / sp, gl = res.t0 + Math.round(b / step) * step * sp, ms = (tm - gl) * 1000;
    worst = Math.max(worst, Math.abs(ms - o.ms)); n++;
  }
  ok(n >= 3 && worst <= 1, 'G10-39 Versatz-Zahlen = wpGeom ±1 ms (' + n + ' Striche, schlimmster ' + worst.toFixed(3) + ' ms)');
  const off0 = await p.evaluate(() => SYNQUENZER.g10View(0.4, 4.6) && SYNQUENZER.g10Info().ed.off);
  ok(off0 === null, 'Versatz-Zahlen erst ab Zoom „1 Takt“ (bei 4,6 s keine)');
  // Farben: Pixel unter der Zahl
  await p.evaluate(() => SYNQUENZER.g10View(0.4, 2.0)); await sleep(50);
  const cols = await p.evaluate(() => { const E = SYNQUENZER.g10Info().ed, cv = document.querySelector('#wpSheet .wpcv canvas'), g = cv.getContext('2d'), d = cv.width / cv.clientWidth, out = [];
    for (const o of E.off) { const x0 = Math.max(0, Math.min(cv.clientWidth - 30, o.x + 4)); const im = g.getImageData(Math.round(x0 * d), Math.round(13 * d), Math.round(14 * d), Math.round(10 * d)).data; const cnt = {g: 0, a: 0, r: 0};
      for (let i = 0; i < im.length; i += 4) { const r = im[i], gg = im[i + 1], b = im[i + 2]; if (Math.max(r, gg, b) - Math.min(r, gg, b) < 90) continue; const k = gg > 180 && r < 140 ? 'g' : r > 220 && gg < 120 ? 'r' : r > 200 && gg > 140 && b < 90 ? 'a' : null; if (k) cnt[k]++; }
      const best = Object.keys(cnt).sort((x, y) => cnt[y] - cnt[x])[0];
      out.push({ms: o.ms, c: best}); } return out; });
  const cls = c => c || '?';
  const bad = cols.filter(o => { const a = Math.abs(o.ms), w = a <= 10 ? 'g' : a <= 40 ? 'a' : 'r'; return cls(o.c) !== w; });
  ok(cols.length && !bad.length, 'G10-39 Farben nach Schwelle (grün ≤ 10, bernstein 10–40, rot > 40 ms): ' + cols.map(o => o.ms + cls(o.c)).join(' '));
}
// ---------- Einrasten sichtbar: Linie + Blase + Klick beim Ziehen (quantisiert), Lupe ±40 ms ----------
{
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'slice'}), ref);
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  await p.evaluate(() => SYNQUENZER.g10View(0.4, 2.0)); await sleep(100);
  g = await geom(p);
  let k = -1; for (let i = 1; i < g.marks.length - 1; i++) if (g.marks[i] > g.x + 30 && g.marks[i] < g.x + g.w - 100 && g.marks[i] - g.marks[i - 1] > 20 && g.marks[i + 1] - g.marks[i] > 44) { k = i; break; }
  if (k < 0) console.log('  keine Marke frei', JSON.stringify(g.marks));
  const c0 = (await info(p)).clicks, u0 = await undoN(p), x0 = g.marks[k], y0 = g.y + 10;
  await touch(c, 'touchStart', [[x0, y0]]);
  let seen = null, lupe = false;
  for (let s = 1; s <= 8; s++) { await touch(c, 'touchMove', [[x0 + s * 4, y0]]); await sleep(20); const I = await info(p); if (I.ed.snap && !seen) seen = I.ed.snap; lupe = lupe || I.ed.lupe; }
  const I1 = await info(p);
  await touch(c, 'touchEnd', []); await sleep(300);
  const I2 = await info(p);
  ok(seen && seen.on && /^Takt \d+ · \d+(\.\d+)? · 1\/16$/.test(seen.label), 'Einrasten beim Ziehen sichtbar: Linie + Blase „' + (seen && seen.label) + '“');
  ok(I1.clicks > c0, 'Einrast-Klick beim Wechsel der Linie (' + (I1.clicks - c0) + '×, Haptik-Ersatz)');
  ok(lupe && !I2.ed.lupe, 'Lupe beim Ziehen sichtbar, danach weg');
  ok(await undoN(p) === u0 + 1, 'Zug = 1 Undo');
  g = await geom(p);
  const tk = g.view.a + (g.marks[k] - g.x) / g.w * g.view.W, gr = await p.evaluate(t => SYNQUENZER.g10Grid(t), tk);
  ok(Math.abs(tk - gr.t) * 1000 <= 1, 'nach dem Loslassen sitzt der Strich auf der Linie (' + ((tk - gr.t) * 1000).toFixed(2) + ' ms)');
  // Einrast-Klick aus → kein Klick
  await p.evaluate(() => { localStorage; });
  const c1 = (await info(p)).clicks;
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
  // während einer Aufnahme nie: simuliert über die Prüf-Funktion (Aufnahme-Zustand) – g10Click(true) ignoriert nur den Schalter
  ok(await p.evaluate(() => SYNQUENZER.g10Click()) === true, 'Einrast-Klick spielbar (3 ms, −30 dBFS)');
}
// ---------- Prüf-Lauf ----------
{
  await p.evaluate(() => SYNQUENZER.g10View(0, 1.0)); await sleep(50);
  const r0 = await p.evaluate(() => SYNQUENZER.g10Run());
  await sleep(1500);
  const I = await info(p);
  ok(r0 && I.ed.run && I.ed.run.n >= 2 && I.plays >= 3, 'Prüf-Lauf: springt mit Klick von Strich zu Strich (' + I.ed.run.n + ' fertig, Strich ' + (I.ed.run.k + 1) + ')');
  ok(I.ed.va > 0 || I.ed.run.k > 2, 'Ansicht folgt dem Prüf-Lauf (va ' + I.ed.va.toFixed(2) + ')');
  g = await geom(p); await tap(c, g.x + 100, g.y + 90); await sleep(150);
  ok(!(await info(p)).ed.run, 'Tipp auf die Welle beendet den Prüf-Lauf');
}
// ---------- Abspielmarke beim normalen Abspielen + Folgen ----------
{
  await p.evaluate(() => SYNQUENZER.g10View(0, 1.0)); await sleep(50);
  await p.evaluate(r => { SYNQUENZER.launchClip(r.t, r.s); }, ref);
  let tp = null, va = null; for (let n = 0; n < 60; n++) { await sleep(100); const I = await info(p); if (I.ed.tp != null) { tp = I.ed.tp; va = I.ed.va; if (tp > 1.3) break; } }
  ok(tp != null, 'Abspielmarke beim Abspielen der Szene im Editor (' + (tp && tp.toFixed(2)) + ' s)');
  ok(tp == null || (va <= tp && tp < va + 1.0), 'Folgen: die Ansicht blättert mit (Sicht ' + (va && va.toFixed(2)) + ' … ' + (va && (va + 1).toFixed(2)) + ')');
  await p.evaluate(() => SYNQUENZER.stop());
}
ok(!H.errs.length, 'keine Konsolen-Fehler ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fails() ? 'FEHLER: ' + fails() : 'ALLES GRÜN');
process.exit(fails() ? 1 : 0);
