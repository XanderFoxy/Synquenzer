// MK-P-03 / typische Fehler 7, 8: every bound element of the plate by a real CDP touch in the overview (landscape X):
// value changes, exactly one undo, undo deep-equal, "geändert" dot right after the change
import {launch, open, openMk, touch, tap, line, panel, ctr} from './vgs7-qmkp-lib.mjs';
const FMTS = (process.argv[2] || 'X').split(',');
const b = await launch(); const fails = []; let n = 0;
for (const f of FMTS) {
  const page = await open(b, f);
  await openMk(page);
  // a known saved sound so the dot can show: load the first MS 2000 library preset if any
  await page.evaluate(() => { MKUI.view({ansicht: 'ganz'}); });
  await page.waitForTimeout(300);
  const P0 = await panel(page);
  const els = P0.elements.filter(e => e.bind && e.px && !/^(prog:|lcd:|view:|track:)/.test(e.bind) && e.id !== 'lcd');
  const state = () => page.evaluate(() => ({snd: JSON.stringify(S.tracks[0].sound), u: SYNQUENZER.undoInfo().n, dot: !!document.querySelector('#synthSheet .chg'), ab: (() => { const a = ED.hdr && ED.hdr.ab; return a ? !a.hidden : null; })(), bpm: S.bpm, trim: JSON.stringify(R.mkInTrim || null)}));
  for (const e of els) {
    // re-read the element (view may have moved)
    await page.evaluate(x => { MKUI.view({ansicht: 'ganz', haelfte: x < 55.6 ? 'links' : 'rechts'}); MKUI.P.mode = 'spiel'; MKUI.renderSoon(); }, e.x); await page.waitForTimeout(350);
    const E = (await panel(page)).elements.find(x => x.id === e.id); if (!E || !E.px) { fails.push(f + ' ' + e.id + ' not visible'); continue; }
    const [x, y] = ctr(E); const before = await state(); const vget = () => page.evaluate(([id, bd]) => { const d = MKUI.defOf(id); if (d) return MKUI.get(d); return SQMK.mkPathGet(S.tracks[0].sound.p.mk, bd); }, [e.id, E.bind]); const v0 = await vget(); const rg = await page.evaluate(id => { const d = MKUI.defOf(id); return d ? MKUI.range(d) : null; }, e.id); const up = !rg || v0 < (rg[0] + rg[1]) / 2;
    if (E.art === 'k') await touch(page, line(x, y, x, up ? y - 60 : y + 60, 12), 16); else await tap(page, x, y);
    await page.waitForTimeout(150);
    const after = await state(); const E2 = (await panel(page)).elements.find(q => q.id === e.id);
    const v1 = await vget(); const changed = JSON.stringify(v1) !== JSON.stringify(v0);
    n++;
    const live = /^(trim|bpm)/.test(E.bind) || E.bind === 'bpm';
    const du = after.u - before.u;
    if (!changed) { const dbg = await page.evaluate(([x, y]) => { const q = document.elementFromPoint(x, y); return {hit: MKUI.P.lastHit, efp: q ? q.className + '<' + (q.parentNode && q.parentNode.className) : null, pops: [...document.querySelectorAll('.pop, .popover, [class*=pop]')].filter(e => e.offsetWidth).map(e => e.className).slice(0, 4), tr: MKUI.P.el.hull.style.transform, ans: MKUI.P.ansicht, halt: MKUI.P.halt, tab: MKUI.P.tab}; }, [x, y]); fails.push(`${f} ${e.id} (${E.bind}) value unchanged ${v0} at ${x.toFixed(0)},${y.toFixed(0)} ${JSON.stringify(dbg)}`); }
    if (!live && du !== 1) fails.push(`${f} ${e.id} (${E.bind}) undo +${du}`);
    if (!live && after.snd === before.snd) fails.push(`${f} ${e.id} sound unchanged`);
    if (!live && !after.dot) fails.push(`${f} ${e.id} no changed-dot after edit`);
    if (!live && du >= 1) {
      await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(200);
      const u = await state(); if (u.snd !== before.snd) fails.push(`${f} ${e.id} undo not deep-equal`);
      if (u.dot !== before.dot) fails.push(`${f} ${e.id} dot after undo ${u.dot} (before ${before.dot})`);
    } else if (live) { // put back
      await page.evaluate(([id, v]) => { const d = MKUI.defOf(id); if (d) MKUI.setv(d, v, false); }, [e.id, v0]);
    }
  }
  console.log(f, 'elements', els.length, 'errs', JSON.stringify(page.errs).slice(0, 300));
  await page.ctx.close();
}
console.log('checked', n, 'FAILS', fails.length); for (const x of fails) console.log('  ' + x);
await b.close();
