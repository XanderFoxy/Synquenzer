// QA FP-SONG (undo groups) for the SCHRITTE editor with real touch events (CDP) at 390x844 and 844x390; recording LÄNGE 1 in the app;
// save/reload round trip of p.mk.seq; clips untouched. Usage: node v3-fp6q-touch.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const out = [];
for (const [w, h] of [[390, 844], [844, 390]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { const Q = SYNQUENZER; Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.q.0.k', 11); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); });
  await page.waitForTimeout(400);
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((p, i) => ({x: p[0], y: p[1], id: p[2] != null ? p[2] : i, radiusX: 4, radiusY: 4, force: 1}))});
  const info = () => page.evaluate(() => MKUI.stepsInfo());
  const st = () => page.evaluate(() => ({v: SYNQUENZER.mkGet(0).t[0].seq.q[0].v.slice(), u: SYNQUENZER.undoInfo().n, clips: JSON.stringify(SYNQUENZER.project().tracks.map(t => t.clips || null))}));
  const I = await info(); const col = c => I.cols[c];
  const s0 = await st();
  // 1) vertical drag on column 3 (up by 40 % of its height), in 8 moves
  { const c = col(2), x = c.x + c.w / 2, y = c.y + c.h * .7; await touch('touchStart', [[x, y]]); for (let k = 1; k <= 8; k++) { await touch('touchMove', [[x, y - c.h * .4 * k / 8]]); await page.waitForTimeout(16); } await touch('touchEnd', []); await page.waitForTimeout(120); }
  const s1 = await st(); const ch1 = s1.v.map((v, i) => v !== s0.v[i] ? i + 1 : 0).filter(Boolean);
  out.push(`${w}x${h} drag col 3: changed columns [${ch1}] value ${s1.v[2]}, undo +${s1.u - s0.u}`);
  // 2) horizontal swipe over columns 5..8 (same row), one gesture
  { const a = col(4), b = col(7), y = a.y + a.h * .2; await touch('touchStart', [[a.x + a.w / 2, y]]); for (let k = 1; k <= 12; k++) { await touch('touchMove', [[a.x + a.w / 2 + (b.x - a.x) * k / 12, y]]); await page.waitForTimeout(16); } await touch('touchEnd', []); await page.waitForTimeout(120); }
  const s2 = await st(); const ch2 = s2.v.map((v, i) => v !== s1.v[i] ? i + 1 : 0).filter(Boolean);
  out.push(`${w}x${h} swipe cols 5-8: changed [${ch2}] values ${s2.v.slice(4, 8)}, undo +${s2.u - s1.u}`);
  // 3) a second finger lands on column 10 during a drag of column 9: only column 9 changes
  { const c = col(8), d = col(9), x = c.x + c.w / 2, y = c.y + c.h * .6; await touch('touchStart', [[x, y, 0]]); await touch('touchMove', [[x, y - 10, 0]]);
    await touch('touchStart', [[x, y - 10, 0], [d.x + d.w / 2, d.y + d.h * .5, 1]]); for (let k = 1; k <= 6; k++) { await touch('touchMove', [[x, y - 10 - 6 * k, 0], [d.x + d.w / 2, d.y + d.h * .5 - 8 * k, 1]]); await page.waitForTimeout(16); }
    await touch('touchEnd', [[x, y - 46, 0]]); await touch('touchEnd', []); await page.waitForTimeout(150); }
  const s3 = await st(); const ch3 = s3.v.map((v, i) => v !== s2.v[i] ? i + 1 : 0).filter(Boolean);
  out.push(`${w}x${h} second finger on col 10 during drag of col 9: changed [${ch3}], undo +${s3.u - s2.u}`);
  // 4) tap above the bar of column 12: +1, one undo
  { const c = col(11), x = c.x + c.w / 2, y = c.y + 10; await touch('touchStart', [[x, y]]); await touch('touchEnd', []); await page.waitForTimeout(150); }
  const s4 = await st(); out.push(`${w}x${h} tap above bar col 12: ${s3.v[11]} -> ${s4.v[11]}, undo +${s4.u - s3.u}`);
  // undo all 4 gestures -> back to s0; redo all -> s4
  await page.evaluate(() => { for (let k = 0; k < 4; k++) SYNQUENZER.undo(); }); const su = await st();
  await page.evaluate(() => { for (let k = 0; k < 4; k++) SYNQUENZER.redo(); }); const sr = await st();
  out.push(`${w}x${h} 4x undo = start: ${JSON.stringify(su.v) === JSON.stringify(s0.v)} · 4x redo = end: ${JSON.stringify(sr.v) === JSON.stringify(s4.v)} · clips untouched: ${sr.clips === s0.clips}`);
  // page did not scroll
  const sc = await page.evaluate(() => [scrollX, scrollY, document.documentElement.scrollTop]); out.push(`${w}x${h} page scroll after gestures: ${sc}`);
  // 5) recording with LÄNGE 1 in the app (a note held), knob moved via knobSim
  if (w === 390) {
    await page.evaluate(() => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(0, 't.0.seq.last', 1); Q.keyOn(60, .8, 'r1'); });
    await page.waitForTimeout(200);
    const r = await page.evaluate(async () => { const Q = SYNQUENZER, sleep = ms => new Promise(r => setTimeout(r, ms)); const u0 = Q.undoInfo().n, c0 = Q.mkGet(0).t[0].f.cut;
      MKUI.recArm(0); await sleep(100); MKUI.knobSim('t.0.f.cut', [c0 + 5, c0 + 15, c0 + 30]); await sleep(3000);
      const pn = Q.mkPanel(); return {rec: pn.rec ? {started: pn.rec.started} : null, undo: Q.undoInfo().n - u0, cut: Q.mkGet(0).t[0].f.cut, c0, q: Q.mkGet(0).t[0].seq.q[0], recN: AU.synth[0].mkRecN || 0}; });
    out.push(`LÄNGE 1 recording after 3 s (24 cycles of 1 step): panel rec ${JSON.stringify(r.rec)}, mkRecDone count ${r.recN}, undo +${r.undo}, CUTOFF ${r.c0} -> ${r.cut} (not returned), SEQ 1 v[0] ${r.q.v[0]}`);
    await page.evaluate(() => SYNQUENZER.keyOff(60, 'r1'));
  }
  out.push(`${w}x${h} console errors: ${errs.length ? errs.slice(0, 2).join(' | ') : 'none'}`);
  await ctx.close();
}
console.log(out.join('\n'));
await browser.close();
