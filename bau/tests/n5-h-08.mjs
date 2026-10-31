// VC2a-08: ein 2-s-Reglerzug (Zeiger-Geste am Regler im Klang-Editor, 60 Hz pointermove) ergibt genau ein Ereignis mit einer Kurve ≤ 50 Werte
import { launch } from './n5-h-lib.mjs';
const res = []; const ok = (id, pass, info) => { res.push({id, pass: !!pass}); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const drag = (p, ms, amp) => p.evaluate(async ([ms, amp]) => {
  const k = document.querySelector('[data-n5="1"]'), r = k.getBoundingClientRect(), x = r.left + r.width / 2, y0 = r.top + r.height / 2;
  const ev = (type, y) => k.dispatchEvent(new PointerEvent(type, {pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: type === 'pointerup' ? 0 : 1}));
  ev('pointerdown', y0); const t0 = performance.now(); let n = 0;
  await new Promise(res => { const f = () => { const t = performance.now() - t0; ev('pointermove', y0 + amp * Math.sin(t / 1000 * Math.PI)); n++; if (t < ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  ev('pointerup', y0 + amp * Math.sin(ms / 1000 * Math.PI)); return {n, dur: Math.round(performance.now() - t0)};
}, [ms, amp]);
for (const vp of [{width: 390, height: 844}, {width: 844, height: 390}]) {
  const {b, p, errs} = await launch({viewport: vp});
  await p.evaluate(async () => { selectTrack(3); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 2600)); await historyCheck(); });
  const lbl = await p.evaluate(() => { const k = [...document.querySelectorAll('.knob.mctl')].find(x => { const r = x.getBoundingClientRect(); return r.width > 20 && r.top > 0 && r.bottom < innerHeight && /Cutoff|Frequenz|Filter/i.test(x.getAttribute('aria-label')); }) || [...document.querySelectorAll('.knob.mctl')].find(x => x.getBoundingClientRect().width > 20); k.dataset.n5 = '1'; return k.getAttribute('aria-label'); });
  const base = await p.evaluate(() => HIST.cur.strs.length);
  const d1 = await drag(p, 2000, 60);
  await p.waitForTimeout(2600);
  const evs = await p.evaluate(b => HIST.cur.strs.slice(b).map(s => JSON.parse(s)), base);
  const data = evs.filter(e => e.u !== 'ctx');
  const c = await p.evaluate(() => historyCheck());
  ok(`VC2a-08 ${vp.width}x${vp.height} 2-s-Zug „${lbl}“ (${d1.dur} ms, ${d1.n} Bewegungen) = genau 1 Ereignis mit Kurve ≤ 50`, data.length === 1 && Array.isArray(data[0].c) && data[0].c.length >= 15 && data[0].c.length <= 50 && c,
    {n: data.length, u: data.map(e => e.u), cLen: data[0] && data[0].c && data[0].c.length, c: data[0] && data[0].c, d: data.map(e => e.d), check: c});
  if (vp.width === 390) {
    const b2 = await p.evaluate(() => HIST.cur.strs.length);
    const d2 = await drag(p, 6000, 50); await p.waitForTimeout(2600);
    const e2 = (await p.evaluate(b => HIST.cur.strs.slice(b).map(s => JSON.parse(s)), b2)).filter(e => e.u !== 'ctx');
    ok('VC2a-08 6-s-Zug: 1 Ereignis, Kurve auf 50 Werte ausgedünnt', e2.length === 1 && e2[0].c && e2[0].c.length === 50, {n: e2.length, moves: d2.n, cLen: e2[0] && e2[0].c && e2[0].c.length});
  }
  ok('keine Konsolenfehler ' + vp.width, !errs.length, errs.slice(0, 3));
  await b.close();
}
console.log(res.every(x => x.pass) ? 'ALLE BESTANDEN' : 'FEHLER');
