// QA K1-03/B7: ✕ in the Mod-Übersicht, then [Rückgängig] in the toast by finger: does the open list show the restored entry?
// + the hit area of [Rückgängig] (elementFromPoint), in 390x844 and 320x568
import {launch} from './n5-k-blib.mjs';
for (const [w, h] of [[390, 844], [320, 568], [844, 390]]) {
  const {b, p, errs} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  for (const [t, id] of [[3, 'f-moog-bass'], [2, 'f-rom-flaeche']]) {
    await p.evaluate(([t, id]) => { loadPreset(t, id); selectTrack(t); ED.tab = 'osc'; openEditor(); }, [t, id]); await p.waitForTimeout(400);
    await p.evaluate(t => SYNQUENZER.k1Open(t), t); await p.waitForTimeout(200);
    const x0 = await p.evaluate(() => { const x = document.querySelectorAll('.pop.k1pop .k1x')[1]; const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, x.getAttribute('aria-label')]; });
    await p.touchscreen.tap(x0[0], x0[1]); await p.waitForTimeout(300);
    const a = await p.evaluate(t => ({mods: SYNQUENZER.k1Mods(t).length, rows: document.querySelectorAll('.pop.k1pop .k1mr').length}), t);
    const tb = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Rückgängig' && b.getBoundingClientRect().width > 0); if (!b) return null; const r = b.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let y = Math.floor(cy - 40); y <= cy + 40; y++) for (let x = Math.floor(cx - 60); x <= cx + 60; x++) { const e = document.elementFromPoint(x, y); if (e && (e === b || b.contains(e))) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
      return {c: [cx, cy], box: [Math.round(r.width), Math.round(r.height)], hit: [x1 - x0 + 1, y1 - y0 + 1]}; });
    if (tb) { await p.touchscreen.tap(tb.c[0], tb.c[1]); await p.waitForTimeout(300); }
    const c = await p.evaluate(t => ({mods: SYNQUENZER.k1Mods(t).map(e => e.src + ' → ' + e.dst), rows: [...document.querySelectorAll('.pop.k1pop .k1mr b')].map(e => e.textContent), pop: !!document.querySelector('.pop.k1pop')}), t);
    console.log(JSON.stringify({vp: w + 'x' + h, id, deleted: x0[2], afterDel: a, undoBtn: tb && {box: tb.box, hit: tb.hit}, afterUndo: {nMods: c.mods.length, nRows: c.rows.length, pop: c.pop, missingInList: c.mods.filter(m => !c.rows.includes(m))}}));
    await p.evaluate(() => closePop());
  }
  if (errs.length) console.log('errs', errs);
  await b.close();
}
