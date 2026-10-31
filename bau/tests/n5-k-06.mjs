// K1-06: the Mod-Übersicht in all 6 formats, reached by finger (⋯ -> Modulationen): inside the screen, ✕ and rows >= 44 px,
// no clipped text, no layout jump; touch scroll of a long list; a tap on a row jumps, ✕ deletes
import {launch, OUT} from './n5-k-blib.mjs';
const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const res = [];
for (const [w, h] of VPS) {
  const {b, p, errs} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  for (const [t, id] of [[3, 'f-moog-bass'], [2, 'f-mk-d05']]) {
    await p.evaluate(async ([t, id]) => { if (id.startsWith('f-mk')) { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
        // an AM program with many entries (Hauchlead first, else the first with >= 4)
        loadPreset(t, id); if (SYNQUENZER.k1Mods(t).length < 4) for (const [k, f] of FACTORY_BY_ID) if (f.engine === 'mk') { loadPreset(t, k); if (SYNQUENZER.k1Mods(t).length >= 4) break; } }
      else loadPreset(t, id); selectTrack(t); ED.tab = id.startsWith('f-mk') ? 'geraet' : 'osc'; openEditor(); }, [t, id]);
    await p.waitForTimeout(700);
    const H0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, window.scrollY]);
    // the visible ⋯ of the editor head
    const more = await p.evaluate(() => { const bs = [...EL.synthSheet.querySelectorAll('.edm, .mkqmore')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).display !== 'none' && getComputedStyle(x).visibility !== 'hidden'; }); const r = bs[0] && bs[0].getBoundingClientRect(); return r ? [r.x + r.width / 2, r.y + r.height / 2, r.width, r.height] : null; });
    if (!more) { res.push({vp: w + 'x' + h, id, err: 'kein ⋯'}); continue; }
    await p.touchscreen.tap(more[0], more[1]); await p.waitForTimeout(250);
    const mb = await p.evaluate(() => { const x = document.querySelector('.pop button[data-a="k1m"]'); if (x) x.scrollIntoView({block: 'nearest'}); if (!x) return null; const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width, r.height, x.textContent]; });
    if (!mb) { res.push({vp: w + 'x' + h, id, err: 'kein Eintrag Modulationen'}); continue; }
    await p.touchscreen.tap(mb[0], mb[1]); await p.waitForTimeout(300);
    const m = await p.evaluate(() => {
      const pop = document.querySelector('.pop.k1pop'); if (!pop) return null; const pr = pop.getBoundingClientRect();
      const rows = [...pop.querySelectorAll('.k1mr')].map(r => { const g = r.querySelector('.k1go').getBoundingClientRect(), x = r.querySelector('.k1x').getBoundingClientRect(); return [Math.round(g.height), Math.round(x.width), Math.round(x.height)]; });
      const clip = [...pop.querySelectorAll('.k1go b, .k1go small, h4')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent);
      const list = pop.querySelector('.k1ml');
      return {pop: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)], inside: pr.left >= 0 && pr.top >= 0 && pr.right <= innerWidth && pr.bottom <= innerHeight, rows, clip, n: rows.length,
        scrollable: list ? list.scrollHeight > list.clientHeight : false, H: [document.documentElement.scrollHeight, document.body.scrollHeight, window.scrollY]};
    });
    await p.screenshot({path: OUT + '/n5-k-06-' + w + 'x' + h + '-' + (id.startsWith('f-mk') ? 'am' : 'va') + '.png'});
    let scrolled = null;
    if (m && m.scrollable) { const lr = await p.evaluate(() => { const r = document.querySelector('.k1ml').getBoundingClientRect(); return [r.x + r.width / 3, r.y + r.height - 20]; });
      const s0 = await p.evaluate(() => document.querySelector('.k1ml').scrollTop);
      const c = await p.context().newCDPSession(p); await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: lr[0], y: lr[1]}]});
      for (let k = 1; k <= 8; k++) await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: lr[0], y: lr[1] - k * 15}]});
      await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(300);
      scrolled = (await p.evaluate(() => document.querySelector('.k1ml').scrollTop)) > s0; }
    // ✕ on the first row by finger: one entry less, one undo step
    const before = await p.evaluate(t => [SYNQUENZER.k1Mods(t).length, SYNQUENZER.undoInfo().n], t);
    const x0 = await p.evaluate(() => { const x = document.querySelector('.pop.k1pop .k1x'); if (!x) return null; x.scrollIntoView({block: 'nearest'}); const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    if (x0) { await p.touchscreen.tap(x0[0], x0[1]); await p.waitForTimeout(250); }
    const after = await p.evaluate(t => [SYNQUENZER.k1Mods(t).length, SYNQUENZER.undoInfo().n, document.querySelectorAll('.pop.k1pop .k1mr').length], t);
    // a tap on a row: the pop closes, the editor shows the target
    const g0 = await p.evaluate(() => { const x = document.querySelector('.pop.k1pop .k1go'); if (!x) return null; const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    if (g0) { await p.touchscreen.tap(g0[0], g0[1]); await p.waitForTimeout(400); }
    const jumped = await p.evaluate(() => ({pop: !!document.querySelector('.pop.k1pop'), tab: ED.tab, lit: !!document.querySelector('.k1hl'), mkMode: window.MKUI ? MKUI.P.mode : null}));
    const ok = m && m.inside && m.rows.every(r => r[0] >= 44 && r[1] >= 44 && r[2] >= 44) && !m.clip.length && m.H.join() === H0.join() && after[0] === before[0] - 1 && after[1] === before[1] + 1 && after[2] === after[0] && !jumped.pop && (m.scrollable ? scrolled : true);
    res.push({vp: w + 'x' + h, id, more: more.slice(2).map(Math.round), m, scrolled, del: [before, after], jumped, ok});
  }
  if (errs.length) res.push({vp: w + 'x' + h, errs: errs.slice(0, 3)});
  await b.close();
}
console.log(JSON.stringify({pass: res.every(r => r.ok !== false && !r.err && !r.errs), res}, null, 0));
