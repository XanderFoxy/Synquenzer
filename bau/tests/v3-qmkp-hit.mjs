// MK-P-07 Treffer: hitAt against a brute-force nearest-element rule on a 1-u grid; and real touches at random points (X overview) hit hitAt's element
import {launch, open, openMk, touch, tap, line, panel, ctr} from './v3-qmkp-lib.mjs';
const b = await launch(); const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
const r = await page.evaluate(() => {
  const A = MKUI.ELS.filter(e => e.act), PW = 1000, PH = 1000 / 1.95; let bad = 0, n = 0; const ex = [];
  const rd = (e, x, y) => { const dx = x < e.x0 ? e.x0 - x : x > e.x1 ? x - e.x1 : 0, dy = y < e.y0 ? e.y0 - y : y > e.y1 ? y - e.y1 : 0; return Math.hypot(dx, dy); };
  for (let y = .5; y < PH; y += 1) for (let x = .5; x < PW; x += 1) { n++; let best = null, bd = 1e9, bc = 1e9; for (const e of A) { const d = rd(e, x, y); if (d > 18) continue; const dc = Math.hypot(e.X - x, e.Y - y); if (d < bd - 1e-9 || (Math.abs(d - bd) <= 1e-9 && dc < bc)) { best = e; bd = d; bc = dc; } }
    const h = MKUI.hitAt(x, y, null); if ((h && h.id) !== (best && best.id)) { bad++; if (ex.length < 5) ex.push([x, y, h && h.id, best && best.id]); } }
  // overlapping element rectangles (zones could not be disjoint)
  const ov = []; for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) { const a = A[i], c = A[j]; if (Math.min(a.x1, c.x1) > Math.max(a.x0, c.x0) && Math.min(a.y1, c.y1) > Math.max(a.y0, c.y0)) ov.push(a.id + '×' + c.id); }
  return {n, bad, ex, ov};
});
console.log('grid points', r.n, 'mismatch', r.bad, JSON.stringify(r.ex), 'overlapping element rects', JSON.stringify(r.ov));
// real touches: 60 random points in the frame → P.lastHit equals hitAt of that point
const P = await panel(page); const fr = P.rahmen; let mism = 0; const exs = [];
for (let k = 0; k < 60; k++) { const x = fr.x + 5 + Math.random() * (fr.w - 10), y = fr.y + 5 + Math.random() * (fr.h - 10);
  const want = await page.evaluate(([x, y]) => { const r = MKUI.P.el.fr.getBoundingClientRect(), T = MKUI.P.el.T, px = (x - r.left - T.tx) * 1000 / T.z, py = (y - r.top - T.ty) * 1000 / T.z; const e = MKUI.hitAt(px, py, MKUI.visRect()); return e ? e.id : 'frei'; }, [x, y]);
  // a press of 0 px that is cancelled by a vertical 1-px move? use a tiny tap but undo afterwards
  const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await touch(page, [[x, y], [x, y + 10]], 16); await page.waitForTimeout(60);   // moved > 8 px: keys/free never act; knobs start a drag
  const got = await page.evaluate(() => MKUI.P.lastHit);
  if (got.replace(/@.*/, '') !== want) { mism++; if (exs.length < 5) exs.push([Math.round(x), Math.round(y), want, got]); }
  const u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n); for (let j = u0; j < u1; j++) await page.evaluate(() => SYNQUENZER.undo());
  await page.evaluate(() => MKUI.view({ansicht: 'ganz'}));
}
console.log('real touches mismatch', mism, JSON.stringify(exs), 'errs', JSON.stringify(page.errs).slice(0, 200));
await b.close();
