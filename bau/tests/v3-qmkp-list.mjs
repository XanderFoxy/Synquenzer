// typische Fehler 3: lists opened by a tap on the plate's display scroll by finger and select by tap (one undo)
import {launch, open, openMk, touch, tap, line, panel, ctr} from './v3-qmkp-lib.mjs';
const b = await launch(); const fails = []; const log = [];
for (const f of ['P1', 'X', 'L2']) {
  for (const [nm, setup, sel, read] of [
    ['waves', () => { SYNQUENZER.mkSet(0, 't.0.o1.w', 5); MKUI.view({modus: 'edit', seite: '05', cursor: 2}); }, '.plist.mkwv', () => SYNQUENZER.mkGet(0).t[0].o1.c2],
    ['seqZiel', () => { MKUI.view({modus: 'edit', seite: '19', cursor: 0}); }, '.plist.mklong', () => SYNQUENZER.mkGet(0).t[0].seq.q[0].k],
    ['stimmung', () => { MKUI.view({modus: 'edit', seite: '01', cursor: 1}); }, '.plist.mkl', () => SYNQUENZER.mkGet(0).scale],
  ]) {
    const page = await open(b, f); await openMk(page); await page.waitForTimeout(200);
    await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 13})); await page.waitForTimeout(350);
    await page.evaluate(setup); await page.waitForTimeout(200);
    const lcd = (await panel(page)).elements.find(e => e.id === 'lcd'); await tap(page, ...ctr(lcd)); await page.waitForTimeout(400);
    const L = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {r: [r.left, r.top, r.width, r.height], sh: e.scrollHeight, ch: e.clientHeight, st: e.scrollTop, n: e.querySelectorAll('button').length, rowH: Math.min(...[...e.querySelectorAll('button')].map(x => x.getBoundingClientRect().height))}; }, sel);
    if (!L) { fails.push(`${f} ${nm}: list did not open`); await page.ctx.close(); continue; }
    const [x, y, w, h] = L.r;
    await touch(page, line(x + w / 2, y + h * .8, x + w / 2, y + h * .25, 10), 16); await page.waitForTimeout(400);
    const st1 = await page.evaluate(sel => document.querySelector(sel).scrollTop, sel);
    const v0 = await page.evaluate(read), u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
    // tap a visible, not selected row
    const tgt = await page.evaluate(sel => { const e = document.querySelector(sel), r = e.getBoundingClientRect(); const bs = [...e.querySelectorAll('button:not(.on):not([disabled])')].filter(b => { const q = b.getBoundingClientRect(); return q.top > r.top + 4 && q.bottom < r.bottom - 4; }); const b = bs[Math.floor(bs.length / 2)]; if (!b) return null; const q = b.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2, b.textContent.slice(0, 20)]; }, sel);
    if (tgt) await tap(page, tgt[0], tgt[1]); await page.waitForTimeout(300);
    const v1 = await page.evaluate(read), u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n), open_ = await page.evaluate(sel => !!document.querySelector(sel), sel);
    log.push(`${f} ${nm}: rows ${L.n} rowH ${L.rowH.toFixed(0)} scroll ${L.sh}>${L.ch} st ${L.st}→${st1} | tap "${tgt && tgt[2]}" value ${v0}→${v1} undo +${u1 - u0} closed ${!open_}`);
    if (L.sh > L.ch + 4 && st1 <= L.st + 5) fails.push(`${f} ${nm}: finger drag did not scroll (${L.st}→${st1})`);
    if (L.rowH < 43.5) fails.push(`${f} ${nm}: row height ${L.rowH}`);
    if (v1 === v0 || u1 - u0 !== 1) fails.push(`${f} ${nm}: tap select ${v0}→${v1} undo +${u1 - u0}`);
    if (page.errs.length) fails.push(`${f} ${nm} console ${JSON.stringify(page.errs).slice(0, 200)}`);
    await page.ctx.close();
  }
}
console.log(log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x);
await b.close();
