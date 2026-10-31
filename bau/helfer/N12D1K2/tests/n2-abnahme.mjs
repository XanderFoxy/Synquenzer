// N2 Abnahme with real CDP touch drags: N2-01 note in bar 16 -> mini map -> bar 1 in < 1.5 s, velocity/length kept, one undo;
// N2-02 horizontal drag with ±20 px jitter -> pitch unchanged; N2-03 vertical drag with ±20 px jitter -> time unchanged (+ haptic tick);
// N2-04 map ≥ 44 px high, inside the screen in all formats, never over the touch point; no layout jump
import {app, report} from './touch-lib.mjs';
const res = [], add = (id, pass, info) => res.push({id, pass, info});
const FORMATS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const C16 = {len: 16, key: {root: 0, scale: 'ionian', src: 'manual'}, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 30, d: .5, n: 64, v: .6}, {t: 60, d: .75, n: 67, v: .37}]};
const setup = async (p, c) => { await p.evaluate(c => { const S = window.SYNQUENZER; S.setClip(0, 0, c); S.openRoll(0, 0);
  window.__ticks = 0; const h0 = haptic; haptic = (...a) => { window.__ticks++; return h0(...a); }; }, c); await p.waitForTimeout(500); };
const xy = (p, beat, note) => p.evaluate(([b, n]) => ED.roll._xy(b, n), [beat, note]);
const clip = p => p.evaluate(() => window.SYNQUENZER.getClip(0, 0));
const uN = p => p.evaluate(() => window.SYNQUENZER.undoInfo().n);
for (const [w, h] of FORMATS) {
  const A = await app({width: w, height: h}), {p, T} = A, tag = `${w}×${h}`;
  await setup(p, C16);
  // view to bar 16 and the note centred vertically
  await p.evaluate(() => { ED.roll.showPage(60); ED.roll.centerOn(67); }); await p.waitForTimeout(200);
  const H0 = await p.evaluate(() => document.documentElement.scrollHeight);
  const a = await xy(p, 60.3, 67), u0 = await uN(p);
  // N2-04: map while holding: size / inside / not under the finger
  await T('touchStart', [[a.x, a.y]]); await p.waitForTimeout(80);
  for (let i = 1; i <= 6; i++) { await T('touchMove', [[a.x - i * 4, a.y + (i % 2 ? 1 : -1)]]); await p.waitForTimeout(16); }
  await p.waitForTimeout(150);
  const mm = await p.evaluate(() => ED.roll._mm()), vis = await p.evaluate(() => { const c = document.querySelector('.pr-mm'); const r = c.getBoundingClientRect(); return {op: +getComputedStyle(c).opacity, x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom}; });
  const fx = a.x - 24, fy = a.y, under = fx >= vis.x && fx <= vis.r && fy >= vis.y && fy <= vis.b;
  add(`N2-04 ${tag}`, mm.on && vis.op > .5 && vis.h >= 44 && vis.x >= 0 && vis.y >= 0 && vis.r <= w && vis.b <= h && !under,
    `Karte ${Math.round(vis.w)}×${Math.round(vis.h)} px bei (${Math.round(vis.x)}, ${Math.round(vis.y)}) im Bild, Finger (${Math.round(fx)}, ${Math.round(fy)}) frei, Achse ${mm.ax}`);
  // N2-01: onto the map at its left end (bar 1), lift there
  const t0 = Date.now(), tx = mm.x + mm.w * (1.5 / mm.Lb), ty = mm.y + mm.h / 2, steps = 10;
  for (let i = 1; i <= steps; i++) { await T('touchMove', [[fx + (tx - fx) * i / steps, fy + (ty - fy) * i / steps]]); await p.waitForTimeout(16); }
  await p.waitForTimeout(300);
  const x0 = await p.evaluate(() => ED.roll.state.view.x0);
  await T('touchEnd', []); await p.waitForTimeout(120); const dt = Date.now() - t0;
  const c1 = await clip(p), nt = c1.notes.find(n => n.n === 67), u1 = await uN(p);
  add(`N2-01 ${tag}`, nt && nt.t < 4 && nt.v === .37 && nt.d === .75 && u1 === u0 + 1 && dt < 1500 && x0 < 4,
    `Note Takt 16 → Takt ${nt ? Math.floor(nt.t / 4) + 1 : '?'} (t ${nt && nt.t}) in ${dt} ms, Ansicht x0 ${x0.toFixed(2)}, Anschlag ${nt && nt.v}, Länge ${nt && nt.d}, Undo +${u1 - u0}`);
  const H1 = await p.evaluate(() => document.documentElement.scrollHeight), mmOff = await p.evaluate(() => +getComputedStyle(document.querySelector('.pr-mm')).opacity);
  add(`N2-L ${tag}`, H1 === H0 && mmOff < .5 && A.errs.length === 0, `kein Layout-Sprung (${H0} → ${H1}), Karte weg nach dem Loslassen, Fehler ${A.errs.length}`);
  if (w === 390 || w === 844) {
    // N2-02 horizontal with ±20 px jitter
    await setup(p, {len: 2, key: {root: 0, scale: 'ionian', src: 'manual'}, notes: [{t: 1, d: .5, n: 64, v: .8}]}); await p.evaluate(() => { ED.roll.fitView('clip'); ED.roll.centerOn(64); }); await p.waitForTimeout(150);
    await p.evaluate(() => ED.roll.centerOn(64)); await p.waitForTimeout(100); let s = await xy(p, 1.1, 64); const pts = [[s.x, s.y]];
    for (let i = 1; i <= 30; i++) pts.push([s.x + i * 6, s.y + (i < 3 ? 0 : (i % 2 ? 20 : -20))]);
    await A.drag(pts);
    let c = await clip(p); const n2 = c.notes[0], tk1 = await p.evaluate(() => window.__ticks);
    add(`N2-02 ${tag}`, n2.n === 64 && n2.t > 1.5 && tk1 >= 1, `waagrecht 180 px mit ±20 px Zittern: Ton ${n2.n} (vorher 64), Zeit ${n2.t} (vorher 1), Haptik ${tk1}×`);
    // N2-03 vertical with ±20 px jitter
    await p.evaluate(() => ED.roll.centerOn(64)); await p.waitForTimeout(100); s = await xy(p, n2.t + .1, 64); const pv = [[s.x, s.y]];
    for (let i = 1; i <= 16; i++) pv.push([s.x + (i < 3 ? 0 : (i % 2 ? 20 : -20)), s.y - i * 7]);
    await A.drag(pv);
    c = await clip(p); const n3 = c.notes[0], tk2 = await p.evaluate(() => window.__ticks);
    add(`N2-03 ${tag}`, Math.abs(n3.t - n2.t) < 1e-9 && n3.n > 64 && tk2 >= tk1 + 1, `senkrecht 112 px mit ±20 px Zittern: Zeit ${n3.t} (vorher ${n2.t}), Ton ${n3.n}, Haptik ${tk2 - tk1}×`);
    // release of the lock: horizontal start, then a clear move across (> 48 px) -> pitch follows
    await p.evaluate(n => ED.roll.centerOn(n), n3.n); await p.waitForTimeout(100); s = await xy(p, n3.t + .1, n3.n); const pr = [[s.x, s.y]];
    for (let i = 1; i <= 6; i++) pr.push([s.x + i * 5, s.y]); for (let i = 1; i <= 10; i++) pr.push([s.x + 30, s.y + i * 9]);
    await A.drag(pr); c = await clip(p);
    add(`N2-05 ${tag}`, c.notes[0].n < n3.n, `Sperre löst sich bei deutlicher Bewegung quer (90 px): Ton ${n3.n} → ${c.notes[0].n}`);
    // free diagonal drag still moves both
    await p.evaluate(n => ED.roll.centerOn(n), c.notes[0].n); await p.waitForTimeout(100); s = await xy(p, c.notes[0].t + .1, c.notes[0].n); const pd = [[s.x, s.y]]; for (let i = 1; i <= 12; i++) pd.push([s.x - i * 6, s.y - i * 6]);
    const before = c.notes[0]; await A.drag(pd); c = await clip(p);
    add(`N2-06 ${tag}`, c.notes[0].n !== before.n && c.notes[0].t !== before.t, `schräg = frei: (${before.t}, ${before.n}) → (${c.notes[0].t}, ${c.notes[0].n})`);
    // top band start -> map at the bottom
    await setup(p, C16); await p.evaluate(() => { ED.roll.showPage(0); }); await p.waitForTimeout(150);
    const top = await p.evaluate(() => { const r = ED.roll.el.main.getBoundingClientRect(); return r.top; });
    const row0 = await p.evaluate(t => { const V = ED.roll.state.view; return null; });
    const nTop = await p.evaluate(() => { const r = ED.roll.el.main.getBoundingClientRect(); for (let n = 108; n > 24; n--) { const q = ED.roll._xy(1, n); if (q.y > r.top + 14) return n; } return 60; });
    await p.evaluate(n => { const S = window.SYNQUENZER, c = S.getClip(0, 0); c.notes.push({t: 1, d: 1, n, v: .8}); S.setClip(0, 0, c); }, nTop); await p.waitForTimeout(200);
    s = await xy(p, 1.2, nTop); await T('touchStart', [[s.x, s.y]]); await p.waitForTimeout(60); for (let i = 1; i <= 5; i++) { await T('touchMove', [[s.x + i * 4, s.y]]); await p.waitForTimeout(16); }
    const vb = await p.evaluate(() => { const r = document.querySelector('.pr-mm').getBoundingClientRect(); return {y: r.top, b: r.bottom, bot: document.querySelector('.pr-mm').classList.contains('bot')}; });
    await A.end();
    add(`N2-04b ${tag}`, vb.bot && (s.y < vb.y || s.y > vb.b), `Finger oben (y ${Math.round(s.y)}) → Karte unten (${Math.round(vb.y)}…${Math.round(vb.b)})`);
  }
  await A.b.close();
}
report('N2', res);
