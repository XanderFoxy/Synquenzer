// MK-P-04 by touch: CH PARAM knob n = band n only; grey keys name the reason; E.F.SENSE 127 = HOLD
import {launch, open, openMk, touch, tap, line, panel, ctr} from './v3-qmkp-lib.mjs';
const b = await launch(); const fails = []; const log = [];
const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 3); MKUI.view({ansicht: 'ganz'}); }); await page.waitForTimeout(300);
const E = async id => (await panel(page)).elements.find(e => e.id === id);
await tap(page, ...ctr(await E('sq.sel'))); await page.waitForTimeout(150);
for (const [sel, a] of [[1, 'chl'], [2, 'chp']]) {
  for (const n of [1, 3, 16]) { const v0 = await page.evaluate(a => SYNQUENZER.mkGet(0).voc[a].slice(), a); const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
    const k = await E('k' + n); const [x, y] = ctr(k); await touch(page, line(x, y, x, y + 50, 10), 16); await page.waitForTimeout(150);
    const v1 = await page.evaluate(a => SYNQUENZER.mkGet(0).voc[a].slice(), a); const u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
    const ch = v1.map((v, j) => v !== v0[j] ? j + 1 : 0).filter(Boolean); log.push(`${a} k${n} → bands ${ch} undo +${u1 - u0}`); if (ch.join() !== String(n) || u1 - u0 !== 1) fails.push(`${a} k${n} → bands ${ch} undo +${u1 - u0}`); }
  await tap(page, ...ctr(await E('sq.sel'))); await page.waitForTimeout(150);
}
// grey keys: reason in the sheet LCD line
for (const id of ['o2.wave', 'seq.on', 'vp.d', 'tim']) { await tap(page, ...ctr(await E(id))); await page.waitForTimeout(150);
  const t = await page.evaluate(() => { const l = ED.lcd; return l ? l.textContent.trim().replace(/\s+/g, ' ') : ''; }); log.push(id + ': "' + t.slice(0, 80) + '"'); if (!/Vocoder|VOCODER/.test(t)) fails.push(id + ' grey without reason: ' + t); }
// E.F.SENSE to 127 → HOLD
const kf = await E('f.kbd'); const [x, y] = ctr(kf); await touch(page, line(x, y, x, y - 300, 20), 16); await page.waitForTimeout(800);
const h = await page.evaluate(() => { const v = SYNQUENZER.mkGet(0).voc; return {efs: v.efs, hold: v.hold ? (Array.isArray(v.hold) ? v.hold.length : typeof v.hold) : null, lcd: SYNQUENZER.mkPanel().lcd}; });
log.push('E.F.SENSE max: ' + JSON.stringify(h)); if (h.efs !== 127) fails.push('E.F.SENSE did not reach 127');
console.log(log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x); console.log('errs', JSON.stringify(page.errs).slice(0, 300));
await b.close();
