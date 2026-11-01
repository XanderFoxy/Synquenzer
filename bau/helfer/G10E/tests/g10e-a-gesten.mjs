// G10e A: Gesten – Pinch (G10-35 Anker/Bereich), Versehen-Sperre (G10-36), Doppeltipp (G10-37), Halten/[+], K2 positiv, Schließen
import {launch, open, take, sleep, ok, fails, touch, drag, tap, pinch, geom, info, marksOf, undoN, openEd, popClose, deq} from './h.mjs';
const br = await launch();
const H = await open(br), p = H.p, c = H.cdp;
const T = Array.from({length: 12}, (_, k) => 0.5 + k * 0.3 + [0, .018, -.022, .031][k % 4]);
const {id, ref} = await take(p, T);
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
await openEd(p, ref, id);
let g = await geom(p);
const GRIP = 44, waveY = () => g.y + GRIP + (g.h - GRIP) * .6;
// ---------- G10-35 Pinch: Anker ±2 px, Bereich ganzer Take ↔ 0,25 ms/px ----------
{
  const cx = g.x + g.w * .6, cy = waveY(), tA = g.view.a + (cx - g.x) / g.w * g.view.W;
  await pinch(c, cx, cy, 60, 240, 12); await sleep(80);
  g = await geom(p);
  const tB = g.view.a + (cx - g.x) / g.w * g.view.W, err = Math.abs(tB - tA) / g.view.W * g.w;
  ok(g.view.W < (await info(p)).ed.W * 1.0001 && err <= 2, 'G10-35 Pinch: Punkt unter den Fingern bleibt stehen (Fehler ' + err.toFixed(2) + ' px, W ' + g.view.W.toFixed(3) + ' s)');
  // asymmetrisch + Mitte wandert: Zeit unter der neuen Mitte = Zeit unter der alten Mitte
  const tC = g.view.a + (cx - g.x) / g.w * g.view.W;
  await touch(c, 'touchStart', [[cx - 40, cy], [cx + 40, cy]]);
  for (let k = 1; k <= 10; k++) await touch(c, 'touchMove', [[cx - 40 - k * 2 + k * 3, cy], [cx + 40 + k * 6 + k * 3, cy]]);
  await touch(c, 'touchEnd', []); await sleep(60);
  g = await geom(p);
  const mx = cx + 30 + 20, tD = g.view.a + (mx - g.x) / g.w * g.view.W, err2 = Math.abs(tD - tC) / g.view.W * g.w;
  ok(err2 <= 2, 'G10-35 Pinch mit wandernder Mitte: Fehler ' + err2.toFixed(2) + ' px');
  for (let n = 0; n < 12; n++) await pinch(c, cx, cy, 40, 300, 6);
  let I = await info(p);
  ok(Math.abs(I.ed.W - I.ed.minW) < 1e-6 && Math.abs(I.ed.W / g.w * 1000 - .25) < .01, 'G10-35 tiefster Zoom = 0,25 ms/px (' + (I.ed.W / g.w * 1000).toFixed(4) + ' ms/px)');
  for (let n = 0; n < 14; n++) await pinch(c, cx, cy, 300, 40, 6);
  I = await info(p); const seg = await p.evaluate(r => { const a = SYNQUENZER.project().tracks[r.t].clips[r.s].audio; return a.out - a.in; }, ref);
  ok(Math.abs(I.ed.W - Math.max(seg, .05)) < 1e-6, 'G10-35 weitester Zoom = ganzer Take (' + I.ed.W.toFixed(3) + ' s = ' + seg.toFixed(3) + ' s)');
}
// ---------- K2 positiv: im Streifen ziehen → Marke bewegt, genau 1 Undo ----------
await p.evaluate(() => { SYNQUENZER.g10View(null, null); });
await p.evaluate(() => SYNQUENZER.g10Zoom()); // Ganz → Wort
await p.evaluate(() => { const E = SYNQUENZER.g10Info(); });
// zurück auf „Ganz“
for (let n = 0; n < 5 && (await info(p)).ed.zoom !== 0; n++) await p.evaluate(() => SYNQUENZER.g10Zoom());
g = await geom(p);
{
  const mk0 = await marksOf(p, id), u0 = await undoN(p);
  // eine Marke mit Abstand zu den Nachbarn
  let k = -1; for (let i = 1; i < g.marks.length - 1; i++) if (g.marks[i] - g.marks[i - 1] > 24 && g.marks[i + 1] - g.marks[i] > 40) { k = i; break; }
  await drag(c, g.marks[k], g.y + 10, g.marks[k] + 14, g.y + 12, 8, 10); await sleep(150);
  const mk1 = await marksOf(p, id);
  ok(mk1[k].t > mk0[k].t + 0.005 && await undoN(p) === u0 + 1, 'K2/K-06 Strich in der Griff-Leiste gezogen: bewegt (' + ((mk1[k].t - mk0[k].t) * 1000).toFixed(1) + ' ms), genau 1 Undo');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
  ok(deq(await marksOf(p, id), mk0), '↶ stellt die Marken wieder her');
  // zweiter Finger während des Zugs → verworfen
  await touch(c, 'touchStart', [[g.marks[k], g.y + 10]]);
  for (let s = 1; s <= 5; s++) await touch(c, 'touchMove', [[g.marks[k] + s * 4, g.y + 10]]);
  await touch(c, 'touchStart', [[g.marks[k] + 20, g.y + 10], [g.x + 40, g.y + g.h - 10]]);
  await touch(c, 'touchMove', [[g.marks[k] + 30, g.y + 10], [g.x + 60, g.y + g.h - 10]]);
  await touch(c, 'touchEnd', []); await sleep(120);
  ok(deq(await marksOf(p, id), mk0) && await undoN(p) === u0, 'K-05 zweiter Finger während des Zugs: 0 Marken bewegt, 0 Undo');
}
// ---------- G10-36: 1000 Ein-Finger-Gesten auf der Welle in allen Zoomstufen, 200 Zwei-Finger-Gesten ----------
if (!process.env.QUICK) {
  const mk0 = await marksOf(p, id), u0 = await undoN(p);
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const views = [[null, 0], [null, 'w'], [null, 1.0], [null, 0.3], [null, 0.12], [null, 0.0971]];
  let n1 = 0;
  for (let v = 0; v < views.length; v++) {
    await p.evaluate(W => SYNQUENZER.g10View(0.5, W), views[v][1]);
    for (let n = 0; n < 167 && n1 < 1000; n++, n1++) {
      g = await geom(p);
      const x0 = g.x + 4 + rnd() * (g.w - 8), y0 = g.y + GRIP + 4 + rnd() * (g.h - GRIP - 8), r = rnd();
      if (r < .55) await drag(c, x0, y0, x0 + (rnd() - .5) * 300, y0 + (rnd() - .5) * 60, 3 + Math.floor(rnd() * 5));
      else if (r < .9) await tap(c, x0, y0);
      else await tap(c, x0, y0, 520);                                // Halten auf der Welle
      if (process.env.DBG) { const ed = await p.evaluate(() => !!SYNQUENZER.wpInfo().editor), mm = await marksOf(p, id); if (!ed || !deq(mm, mk0) || await undoN(p) !== u0) { console.log('ÄNDERUNG bei', n1, r.toFixed(2), x0.toFixed(0), y0.toFixed(0), 'ed', ed, await p.evaluate(() => SYNQUENZER.undoInfo().top), JSON.stringify(g)); process.exit(1); } }
      if (n % 10 === 9 && await popClose(p)) {}
    }
  }
  const pn = await popClose(p);
  const mk1 = await marksOf(p, id);
  console.log('  n1', n1, 'undo', await undoN(p) - u0, 'pop', pn, 'ed', !!(await p.evaluate(() => SYNQUENZER.wpInfo().editor)), 'marks', mk1.length, mk0.length, await p.evaluate(() => SYNQUENZER.undoInfo().top));
  ok(n1 === 1000 && deq(mk1, mk0) && await undoN(p) === u0, 'G10-36 1000 Ein-Finger-Gesten (Wischen, Tippen, Halten) in 6 Zoomstufen: 0 Marken bewegt, 0 neu, 0 Undo (' + mk1.length + ' Marken)');
  let n2 = 0;
  for (; n2 < 200; n2++) {
    await p.evaluate(W => SYNQUENZER.g10View(0.3, W), [3, 1, .3][n2 % 3]);
    g = await geom(p);
    if (!g) { console.log('Editor zu bei Zwei-Finger-Geste', n2, await p.evaluate(() => SYNQUENZER.undoInfo().top)); break; }
    const vis = g.marks.filter(x => x > g.x + 4 && x < g.x + g.w - 30), inGrip = n2 % 2 === 0 && vis.length > 0, x0 = inGrip ? vis[Math.floor(rnd() * vis.length)] : g.x + 20 + rnd() * (g.w - 40), y0 = inGrip ? g.y + 10 : waveY();
    const x1 = g.x + 20 + rnd() * (g.w - 130), y1 = g.y + GRIP + 10 + rnd() * (g.h - GRIP - 20);
    await touch(c, 'touchStart', [[x0, y0]]);
    if (n2 % 4 < 2) for (let s = 1; s <= 3; s++) await touch(c, 'touchMove', [[x0 + s * 5, y0]]);
    await touch(c, 'touchStart', [[x0 + 15, y0], [x1, y1]]);
    for (let s = 1; s <= 4; s++) await touch(c, 'touchMove', [[x0 + 15 - s * 9, y0 + s], [x1 + s * 12, y1 - s]]);
    if (n2 % 3 === 0) await touch(c, 'touchMove', [[x1 + 48, y1 - 4, 1]]);   // ein Finger hebt zuerst ab, der andere zieht weiter
    if (n2 % 3 === 0) await touch(c, 'touchMove', [[x1 + 90, y1 - 4, 1]]);
    await touch(c, 'touchEnd', []);
  }
  await popClose(p);
  ok(deq(await marksOf(p, id), mk0) && await undoN(p) === u0, 'G10-36 200 Zwei-Finger-Gesten (auch mit erstem Finger auf einem Strich in der Leiste): 0 Marken bewegt, 0 Undo');
}
// ---------- G10-37 Doppeltipp ----------
await p.evaluate(() => SYNQUENZER.g10View(-1, 0)); await sleep(50);
g = await geom(p);
{
  const v0 = g.view, M = g.marks.filter(x => x > g.x && x < g.x + g.w).sort((a, b) => a - b);
  let i = -1; for (let k = 2; k < M.length - 1; k++) if (M[k + 1] - M[k] > 26) { i = k; break; }
  const xm = (M[i] + M[i + 1]) / 2, y = waveY();
  const t0 = g.view.a + (M[i] - g.x) / g.w * g.view.W, t1 = g.view.a + (M[i + 1] - g.x) / g.w * g.view.W;
  await tap(c, xm, y); await sleep(70); await tap(c, xm, y); await sleep(120);
  g = await geom(p);
  const fill = (t1 - t0) / g.view.W, cen = ((t0 + t1) / 2 - g.view.a) / g.view.W;
  ok(Math.abs(fill - .70) <= .05 && Math.abs(cen - .5) < .02, 'G10-37 Doppeltipp: Silbe füllt ' + (fill * 100).toFixed(1) + ' % der Breite, Mitte bei ' + (cen * 100).toFixed(1) + ' %');
  const xm2 = g.x + g.w * .5;
  await tap(c, xm2, y); await sleep(70); await tap(c, xm2, y); await sleep(120);
  g = await geom(p);
  const dA = Math.abs(g.view.a - v0.a) / v0.W * g.w, dW = Math.abs(g.view.W - v0.W) / v0.W * g.w;
  ok(dA <= 1 && dW <= 1, 'G10-37 zweiter Doppeltipp: vorherige Ansicht (Δ ' + dA.toFixed(3) + ' px, ΔW ' + dW.toFixed(3) + ' px)');
  // zwei Einzeltipps mit Pause zoomen nicht
  await tap(c, xm, y); await sleep(450); await tap(c, xm, y); await sleep(100);
  const g2 = await geom(p); ok(Math.abs(g2.view.W - g.view.W) < 1e-9, 'zwei langsame Tipps: kein Zoom, keine Marke');
}
// ---------- Neue Marke nur mit [+] oder Halten in der Griff-Leiste ----------
{
  g = await geom(p);
  const n0 = (await marksOf(p, id)).length, u0 = await undoN(p), M = [g.x, ...g.marks.filter(x => x > g.x && x < g.x + g.w), g.x + g.w].sort((a, b) => a - b);
  let x = -1; for (let k = 0; k < M.length - 1; k++) if (M[k + 1] - M[k] > 60) { x = (M[k] + M[k + 1]) / 2; break; }
  await tap(c, x, waveY()); await sleep(400);
  await tap(c, x, g.y + 12); await sleep(400);
  ok((await marksOf(p, id)).length === n0, 'Tipp ins Leere (Welle und Leiste) setzt keine Marke mehr');
  await tap(c, x, g.y + 12, 300); await sleep(200);
  ok((await marksOf(p, id)).length === n0, 'Halten 300 ms in der Leiste: noch keine Marke');
  await tap(c, x, g.y + 12, 560); await sleep(250);
  const I = await info(p);
  ok((await marksOf(p, id)).length === n0 + 1 && await undoN(p) === u0 + 1 && I.clicks >= 1, '450 ms Halten in der Griff-Leiste: neue Marke, 1 Undo, Einrast-Klick (' + I.clicks + ')');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
  const b = await p.evaluate(() => { const r = document.querySelector('#wpSheet .g10add').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height}; });
  await tap(c, b.x, b.y); await sleep(120);
  ok((await info(p)).ed.add, '[+] bewaffnet');
  await tap(c, x + 8, waveY()); await sleep(250);
  ok((await marksOf(p, id)).length === n0 + 1 && !(await info(p)).ed.add, '[+] dann Tipp auf die Welle: neue Marke, [+] wieder aus');
  await tap(c, b.x, b.y); await sleep(100);
  const zb = await p.evaluate(() => { const r = document.querySelector('#wpSheet .wpz').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  await tap(c, zb.x, zb.y); await sleep(150);
  ok(!(await info(p)).ed.add, 'bewaffnetes [+] endet mit jedem anderen Tipp im Blatt (Regel 10)');
  await p.evaluate(() => SYNQUENZER.undo());
}
// ---------- Schließen: Tipp außerhalb, Kopf nach unten wischen, ✕ ----------
{
  const sel0 = await p.evaluate(() => SYNQUENZER.project().tracks.length);
  await tap(c, 200, 190); await sleep(250);
  ok(!(await p.evaluate(() => SYNQUENZER.wpInfo().editor)), 'Tipp außerhalb schließt das Blatt');
  await p.evaluate(() => SYNQUENZER.toast && SYNQUENZER.toast(''));
  await openEd(p, ref, id); await p.evaluate(() => { const t = document.getElementById('toast'); if (t) t.classList.remove('show'); });
  const hd = await p.evaluate(() => { const r = document.querySelector('#wpSheet .qh b').getBoundingClientRect(); return {x: r.x + 30, y: r.y + r.height / 2}; });
  await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown','pointermove','pointerup','pointercancel']) window.addEventListener(t, e => window.__ev.push(t + ' ' + (e.target.tagName + '.' + e.target.className) + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true); });
  await drag(c, hd.x, hd.y, hd.x + 5, hd.y + 120, 8, 10); await sleep(200);
  ok(!(await p.evaluate(() => SYNQUENZER.wpInfo().editor)), 'Kopf nach unten wischen schließt das Blatt');
  await openEd(p, ref, id);
  const x = await p.evaluate(() => { const r = document.querySelector('#wpSheet .sh-x').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  await tap(c, x.x, x.y); await sleep(200);
  ok(!(await p.evaluate(() => SYNQUENZER.wpInfo().editor)), '✕ schließt das Blatt');
}
ok(!H.errs.length, 'keine Konsolen-Fehler ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fails() ? 'FEHLER: ' + fails() : 'ALLES GRÜN');
process.exit(fails() ? 1 : 0);
