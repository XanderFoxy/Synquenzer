// QA MK1-25 / B.4: frames_ok and quantum_max_ms of the performance probe - is frames_ok a frame count (0.995 x sr)?
// The audio context is suspended for 2.5 s in the middle of a 6 s probe: no frames are computed then.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.touchscreen.tap(400, 300); await page.waitForTimeout(1500);
const r = await page.evaluate(async () => {
  const L = (window.mkLoad ? mkLoad() : null); const pr = MKUI.probe(['kern'], {sec: 6});
  await new Promise(r => setTimeout(r, 1500)); const t0 = AU.ctx.currentTime; await AU.ctx.suspend(); await new Promise(r => setTimeout(r, 2500)); await AU.ctx.resume(); const t1 = AU.ctx.currentTime;
  const o = await pr; return {frames_ok: o.frames_ok, quantum_max_ms: o.quantum_max_ms, load_med: o.load_med, reports: o.cases[0].reports, audioSecDuringSuspend: +(t1 - t0).toFixed(3), state: AU.ctx.state};
});
console.log(JSON.stringify(r));
await browser.close();
