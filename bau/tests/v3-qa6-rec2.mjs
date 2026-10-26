// QA MK6-09 in the app with a real worklet note: one undo restores all, redo; recording on TIMBRE 2 (Dual)
import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const log = (id, c, info) => console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info);
async function open() {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.setKbMode('play'); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500); await page.evaluate(() => SYNQUENZER.keyOn(72)); await page.waitForTimeout(300); await page.evaluate(() => SYNQUENZER.keyOff(72));
  await page.waitForFunction(() => AU.synth[0] && AU.synth[0].node, null, {timeout: 10000}); await page.waitForTimeout(300);
  return {ctx, page, errs};
}
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(page, k, dy, steps, ms) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= steps; s++) { await page.mouse.move(x, y - dy * s / steps); if (ms) await page.waitForTimeout(ms); } await page.mouse.up(); await page.waitForTimeout(60); }
async function tap(page, k) { const b = await box(page, k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(150); }
{
  const {ctx, page, errs} = await open();
  await page.evaluate(() => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(0, 't.0.f.cut', 40); Q.mkSet(0, 't.0.seq.last', 8); Q.mkSet(0, 't.0.seq.q.0.k', 1); for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, 3); Q.keyOn(60); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); });
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => SYNQUENZER.mkGet(0)), u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await tap(page, 'rec'); await page.evaluate(() => MKUI.setWahl(1, 5)); await page.waitForTimeout(100);
  await drag(page, 'k1', 100, 40, 40);
  let ended = true; try { await page.waitForFunction(() => AU.synth[0].mkRecN >= 1, null, {timeout: 4000}); } catch (e) { ended = false; }
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => SYNQUENZER.mkGet(0)), u1 = await page.evaluate(() => SYNQUENZER.undoInfo()), last = await page.evaluate(() => AU.synth[0].mkRecLast);
  log('REC2 Ergebnis (echte Note)', ended && after.t[0].seq.q[0].k === 11 && after.t[0].f.cut === 40 && u1.n === u0 + 1, 'Schritte ' + (last && last.from) + '–' + (last && last.to) + ': ' + after.t[0].seq.q[0].v.join(',') + ' · Undo +' + (u1.n - u0) + ' „' + (u1.top && u1.top.label) + '“');
  await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(150);
  const und = await page.evaluate(() => SYNQUENZER.mkGet(0));
  log('REC2 Undo stellt alles her', JSON.stringify(und) === JSON.stringify(before), 'deep-equal ' + (JSON.stringify(und) === JSON.stringify(before)) + (JSON.stringify(und) === JSON.stringify(before) ? '' : ' · vorher ' + JSON.stringify(before.t[0].seq.q[0]) + ' nachher ' + JSON.stringify(und.t[0].seq.q[0]) + ' cut ' + before.t[0].f.cut + '/' + und.t[0].f.cut));
  await page.evaluate(() => SYNQUENZER.redo()); await page.waitForTimeout(150);
  const red = await page.evaluate(() => SYNQUENZER.mkGet(0));
  log('REC2 Redo', JSON.stringify(red) === JSON.stringify(after), '');
  log('REC2 Konsole', !errs.length, errs.join(' / ') || 'keine');
  await page.evaluate(() => SYNQUENZER.keyOff(60)); await ctx.close();
}
{
  // TIMBRE 2 (Dual): record on T2
  const {ctx, page, errs} = await open();
  await page.evaluate(() => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.1.f.cut', 40); Q.mkSet(0, 't.1.seq.last', 8); });
  await page.waitForTimeout(200);
  const tk = await page.evaluate(() => { MKUI.timbreKey && MKUI.timbreKey(1); return SYNQUENZER.mkPanel(); });
  await page.evaluate(() => { SYNQUENZER.keyOn(60); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }); await page.waitForTimeout(300);
  const sel = await page.evaluate(() => JSON.stringify(SYNQUENZER.mkPanel().sel || {}));
  await tap(page, 'rec'); await page.evaluate(() => MKUI.setWahl(1, 5)); await page.waitForTimeout(100);
  await drag(page, 'k1', 100, 40, 40);
  let ended = true; try { await page.waitForFunction(() => AU.synth[0].mkRecN >= 1, null, {timeout: 4000}); } catch (e) { ended = false; }
  await page.waitForTimeout(150);
  const m = await page.evaluate(() => SYNQUENZER.mkGet(0));
  log('REC2 Timbre 2', ended && m.t[1].seq.q[0].k === 11 && m.t[1].seq.on === 1 && m.t[0].seq.q[0].k === 0, 'Auswahl ' + sel + ' · T2 SEQ1 ' + JSON.stringify(m.t[1].seq.q[0]).slice(0, 90) + ' on ' + m.t[1].seq.on + ' · T1 SEQ1 k ' + m.t[0].seq.q[0].k + ' · T2 cut ' + m.t[1].f.cut + ' T1 cut ' + m.t[0].f.cut + (errs.length ? ' Konsole ' + errs.join(' / ') : ''));
  await page.evaluate(() => SYNQUENZER.keyOff(60)); await ctx.close();
}
await browser.close();
