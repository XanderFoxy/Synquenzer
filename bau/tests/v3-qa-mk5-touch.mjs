// QA FP-TOUCH for MK5 with real multi-touch (CDP Input.dispatchTouchEvent) at 390x844 and 844x390:
// hold a chord with three fingers on the keyboard, tap ARP / step keys and drag a knob with a fourth finger.
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const J = x => JSON.stringify(x);
for (const [w, h] of [[390, 844], [844, 390]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(async () => { const Q = SYNQUENZER; ensureAudio(); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 900)); Q.setBpm(120); });
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map(([x, y, id]) => ({x, y, id, radiusX: 4, radiusY: 4, force: 1}))});
  const box = k => p.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2 + 4, w: r.width, h: r.height}; }, k);
  // keyboard: find the x of C, E, G of the lowest octave shown (via elementFromPoint and the app's own hit test)
  const kbr = await p.evaluate(() => { const r = document.getElementById('kb').getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; });
  const st = () => p.evaluate(() => ({arp: SYNQUENZER.mkGet(0).arp, u: SYNQUENZER.undoInfo().n, inputs: Object.values(R.inputs).map(x => x.note), log: SYNQUENZER.arpLog(0).length, scale: visualViewport.scale, wahl: MKUI.P.wahl, pos: MKUI.P.pos.slice(), keys: SYNQUENZER.mkPanel().arp.keys}));
  const res = {fmt: w + 'x' + h, kb: kbr};
  // 1. tap ARP with a finger
  const ab = await box('arp'); const s0 = await st();
  await touch('touchStart', [[ab.x, ab.y, 1]]); await p.waitForTimeout(60); await touch('touchEnd', []); await p.waitForTimeout(200);
  const s1 = await st(); res.arpTap = {on: s1.arp.on, du: s1.u - s0.u};
  // 2. ARP B via the EDIT-WAHL 2 path the app uses
  await p.evaluate(() => MKUI.setWahl(2, 8)); await p.waitForTimeout(100);
  // 3. three fingers on the keyboard (lower part = white keys)
  const ky = kbr.y + kbr.h * .85, wk = (kbr.w) / 8.05; const xs = [kbr.x + wk * .5, kbr.x + wk * 2.5, kbr.x + wk * 4.5];
  await touch('touchStart', [[xs[0], ky, 11]]); await touch('touchMove', [[xs[0], ky, 11]]);
  await touch('touchStart', [[xs[0], ky, 11], [xs[1], ky, 12]]);
  await touch('touchStart', [[xs[0], ky, 11], [xs[1], ky, 12], [xs[2], ky, 13]]);
  await p.waitForTimeout(500);
  const s2 = await st(); res.chord = {inputs: s2.inputs, log: s2.log};
  // 4. a fourth finger taps step key 2 while the chord is held
  const n1 = await box('n1');
  const held = [[xs[0], ky, 11], [xs[1], ky, 12], [xs[2], ky, 13]];
  await touch('touchStart', held.concat([[n1.x, n1.y, 14]])); await p.waitForTimeout(70); await touch('touchEnd', [[n1.x, n1.y, 14]]); await p.waitForTimeout(300);
  const s3 = await st(); res.stepTapHeld = {steps: s3.arp.steps, du: s3.u - s2.u, inputs: s3.inputs, logGrew: s3.log - s2.log, keys: s3.keys};
  // 5. a fourth finger drags LÄNGE (knob 4 = k3) down while the chord is held
  const k3 = await box('k3');
  await touch('touchStart', held.concat([[k3.x, k3.y, 15]]));
  for (let s = 1; s <= 10; s++) { await touch('touchMove', held.concat([[k3.x, k3.y + 6 * s, 15]])); await p.waitForTimeout(16); }
  await touch('touchEnd', [[k3.x, k3.y + 60, 15]]); await p.waitForTimeout(300);
  const s4 = await st(); res.knobHeld = {last: s4.arp.last, du: s4.u - s3.u, inputs: s4.inputs, logGrew: s4.log - s3.log, keys: s4.keys};
  // 6. double tap on step key 3 (two taps 120 ms apart): two toggles, no zoom
  const n2 = await box('n2'); const s5a = await st();
  for (let k = 0; k < 2; k++) { await touch('touchStart', held.concat([[n2.x, n2.y, 20 + k]])); await p.waitForTimeout(40); await touch('touchEnd', [[n2.x, n2.y, 20 + k]]); await p.waitForTimeout(80); }
  await p.waitForTimeout(300); const s5 = await st(); res.dbl = {steps: s5.arp.steps, du: s5.u - s5a.u, scale: s5.scale};
  // 7. long press (800 ms) on step key 4: one toggle, no menu / selection
  const n3 = await box('n3'); const s6a = await st();
  await touch('touchStart', held.concat([[n3.x, n3.y, 30]])); await p.waitForTimeout(800); await touch('touchEnd', [[n3.x, n3.y, 30]]); await p.waitForTimeout(200);
  const s6 = await st(); res.long = {steps: s6.arp.steps, du: s6.u - s6a.u, sel: await p.evaluate(() => String(getSelection()))};
  // 8. all fingers up: arp stops within one step
  await touch('touchEnd', []); await p.waitForTimeout(400); const s7 = await st(); await p.waitForTimeout(400); const s8 = await st();
  res.release = {inputs: s7.inputs, logAfter: s8.log - s7.log};
  // 9. ARP key tapped while a chord is held: off -> ARP notes end; the held keys do not sound
  res.errs = errs.slice(0, 3);
  console.log(J(res));
  await ctx.close();
}
await b.close();
