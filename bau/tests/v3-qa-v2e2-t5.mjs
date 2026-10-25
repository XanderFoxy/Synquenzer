// QA V2e′ t5: glass tiles — passes with phase, partial passes, note counts, toggle geometry, deep-equal, persistence
import { openVp, T, SETUP55, PREP, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false));
await E(() => { window.SYNQUENZER.placePart(0, 4, 'insert'); return 1; });
await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const lanes = await E(() => window.SYNQUENZER.song().lanes);
console.log('bass lane', JSON.stringify(lanes[0]), 'bars', await E(() => window.SYNQUENZER.song().bars));
const P0 = await t.full(); const U0 = (await t.undo()).n;
const sq = await t.info();
// toggle via the button
const bg = await E(() => { const b = [...document.querySelectorAll('.sv-top button')].find(b => /Ansicht/.test(b.getAttribute('aria-label') || '')); if (!b) return null; const r = b.getBoundingClientRect(); const tr = b.parentElement.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cls: b.className, trY: tr.y, trH: tr.height, right: tr.right - r.right}; });
console.log('glass button', bg);
if (VP === 'P1') check(`${VP} N7S-46 toggle 44×40 in the transport row`, bg && Math.abs(bg.w - 44) <= 1 && Math.abs(bg.h - 40) <= 1, bg);
await t.tap(bg.x + bg.w / 2, bg.y + bg.h / 2, 300);
const gl = await t.info();
check(`${VP} toggle → glass`, gl.view === 'glass', gl.view);
check(`${VP} same rows/rowH/cellW/canvas`, JSON.stringify([gl.rows, gl.rowH, gl.cellW, gl.canvas]) === JSON.stringify([sq.rows, sq.rowH, sq.cellW, sq.canvas]), [gl.rowH, sq.rowH]);
check(`${VP} toggle: project() deep-equal, no undo`, (await t.full()) === P0 && (await t.undo()).n === U0);
// expected passes for the bass from the lanes (independent computation)
const exp = await E(() => {
  const Q = window.SYNQUENZER, s = Q.song(), out = {};
  for (let tr = 0; tr < s.lanes.length; tr++) {
    const lane = s.lanes[tr], res = []; if (!lane.length) continue;
    // per bar: active entry (slot, start bar of block, phase)
    let cur = null;
    for (let bar = 0; bar < s.bars; bar++) {
      const e = lane.find(x => x.bar === bar);
      if (e) { if (e.slot < 0) cur = null; else if (!cur || e.slot !== cur.slot || e.re || e.ph != null || e.own) cur = {slot: e.slot, own: e.own, bs: bar, ph: e.ph || 0}; }
      if (!cur) continue;
      const clip = cur.own ? s.own[cur.own] : Q.getClip(tr, cur.slot); if (!clip || !clip.notes) continue;
      const L = clip.len * 4, pos = ((bar - cur.bs) * 4 + cur.ph) % L, k = Math.floor(((bar - cur.bs) * 4 + cur.ph) / L);
      const key = cur.bs + ':' + k;
      let r = res.find(x => x.key === key);
      if (!r) { r = {key, a: bar, b: bar + 1, n: 0, slot: cur.slot}; res.push(r); } else r.b = bar + 1;
      r.n += clip.notes.filter(n => n.t >= pos - 1e-9 && n.t < pos + 4 - 1e-9 && n.t < L).length;
    }
    out[tr] = res.map(x => ({a: x.a, b: x.b, n: Math.min(160, x.n), slot: x.slot}));
  }
  return out;
});
const tiles = gl.tiles;
let bad = [];
for (const tr of Object.keys(exp)) {
  const got = tiles.filter(x => x.t === +tr).map(x => ({a: x.a, b: x.b, n: x.n, slot: x.slot}));
  const e = exp[tr].filter(x => x.a * 36 - gl.x0 < gl.canvas.w);   // visible only
  const g2 = got.filter(x => x.a * 36 - gl.x0 < gl.canvas.w);
  if (JSON.stringify(e) !== JSON.stringify(g2)) bad.push({tr, exp: e, got: g2});
}
check(`${VP} N7S-46 one tile per pass (incl. phase / partial passes), note count = notes of the pass`, !bad.length, bad);
// note rectangles in the canvas: count amber-ish/track-colour rects is hard; check the tile x-extent: x0 = x(a)+2, x1 = x(b)-1
const geoBad = tiles.filter(x => Math.abs(x.x0 - (x.a * 36 - gl.x0 + 2)) > 1 || Math.abs(x.x1 - (x.b * 36 - gl.x0 - 1)) > 1);
check(`${VP} 9.1 tile from x(b)+2 to x(b+n)−1`, !geoBad.length, geoBad.slice(0, 3));
// glass state is view-only: save/load does not carry it, project() has no songView
const pj = await E(() => { const pr = window.SYNQUENZER.project(); return JSON.stringify(pr).includes('glass'); });
check(`${VP} glass not in project()`, !pj);
// toggle back
await t.tap(bg.x + bg.w / 2, bg.y + bg.h / 2, 300);
check(`${VP} back to squares, deep-equal`, (await t.info()).view === 'squares' && (await t.full()) === P0);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
