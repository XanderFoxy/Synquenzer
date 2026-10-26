// MK4 screenshots: EDIT-WAHL 2 on MOD-FX, DELAY (ZEIT / NOTE), EQ, the TYP list, in all formats. Usage: node v3-mk4-shot.mjs <index.html> [dir] (ONLY=fmt regex)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3] || 'v3-mk4-shots'), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
for (const [f, [w, h]] of Object.entries(FMT)) {
  if (ONLY && !ONLY.test(f)) continue;
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  const st = [['modfx', () => { SYNQUENZER.mkSet(0, 'mfx.type', 1); SYNQUENZER.mkSet(0, 'mfx.dep', 90); MKUI.setWahl(2, 4); MKUI.lcdOf(MKUI.knobs()[2]); }],
    ['delay-zeit', () => { SYNQUENZER.mkSet(0, 'dly.dep', 60); MKUI.setWahl(2, 5); MKUI.lcdOf(MKUI.knobs()[2]); }],
    ['delay-note', () => { SYNQUENZER.mkSet(0, 'dly.sync', 1); SYNQUENZER.mkSet(0, 'dly.note', 5); MKUI.setWahl(2, 5); MKUI.lcdOf(MKUI.knobs()[2]); }],
    ['eq', () => { SYNQUENZER.mkSet(0, 'eq.lg', 4.5); MKUI.setWahl(2, 6); MKUI.lcdOf(MKUI.knobs()[1]); }]];
  for (const [n, fn] of st) { await page.evaluate(fn); await page.waitForTimeout(250); await page.screenshot({path: OUT + '/' + f + '-' + n + '.png'});
    console.log(f, n, JSON.stringify(await page.evaluate(() => { const p = SYNQUENZER.mkPanel(); return {sel: p.sel, knobs: p.knobs.map(k => k && (k.l + (k.dark ? '(d)' : '') + '=' + k.v)), lcd: ED.lcd && ED.lcd.innerText.replace(/\s+/g, ' ')}; }))); }
  console.log(f, 'errors', errs.length ? errs : 'keine');
  await ctx.close();
}
await browser.close();
