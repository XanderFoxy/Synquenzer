import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const L of [1, 2]) {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await page.waitForTimeout(500);
  const r = await page.evaluate(async L => { const Q = SYNQUENZER, sleep = ms => new Promise(r => setTimeout(r, ms));
    Q.setBpm(120); Q.mkSet(0, 't.0.f.cut', 60); Q.mkSet(0, 't.0.seq.last', L); MKUI.setWahl(2, 10); Q.keyOn(60, .8, 'r1'); await sleep(200);
    const u0 = Q.undoInfo().n; MKUI.recArm(0); await sleep(100); MKUI.knobSim('t.0.f.cut', [65, 75, 90]); await sleep(3000);
    const pn = Q.mkPanel(), m = Q.mkGet(0).t[0], row = [...document.querySelectorAll('#synthSheet .mrow2')].map(e => e.textContent).join(' | ');
    Q.keyOff(60, 'r1'); return {rec: pn.rec ? {started: pn.rec.started} : null, done: AU.synth[0].mkRecN || 0, undo: Q.undoInfo().n - u0, cut: m.f.cut, k: m.seq.q[0].k, v0: m.seq.q[0].v[0], row}; }, L);
  console.log(`LÄNGE ${L}: after 3 s ` + JSON.stringify(r) + ' errors ' + errs.length);
  await ctx.close();
}
await browser.close();
