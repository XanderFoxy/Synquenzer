// QA MK3 helpers (independent of the builder's tests): open the app with an MS 2000 track in the editor
import { chromium } from 'playwright';
export const FILE = process.env.MK_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
export const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], L0: [926, 428]};
let browser = null;
export async function launch() { browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']}); return browser; }
export async function open(fmt, o) {
  o = o || {}; const [w, h] = FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + (o.file || FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  if (!o.noEditor) { await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(500); }
  return {ctx, page, errs};
}
export const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
export async function tap(page, k) { const b = await box(page, k); if (!b) throw new Error('kein Element ' + k); await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); await page.waitForTimeout(150); }
export async function drag(page, k, dy, steps) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= (steps || 10); s++) await page.mouse.move(x, y - dy * s / (steps || 10)); await page.mouse.up(); await page.waitForTimeout(100); }
export const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
export const panel = page => page.evaluate(() => SYNQUENZER.mkPanel());
export const undoN = page => page.evaluate(() => SYNQUENZER.undoInfo().n);
export const mkg = page => page.evaluate(() => SYNQUENZER.mkGet(0));
export const leds = page => page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k="timbre"] .mled')].map(e => (e.classList.contains('lon') ? 1 : 0) + (e.classList.contains('lbl') ? 'b' : '')).join(''));
export const J = x => JSON.stringify(x);
// pick an entry of the open list pop by its text
export async function pickPop(page, re) {
  const pt = await page.evaluate(src => { const re = new RegExp(src); const b = [...document.querySelectorAll('.pop button')].find(x => re.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width, r.height]; }, re.source);
  if (!pt) throw new Error('kein Listeneintrag ' + re); await page.touchscreen.tap(pt[0], pt[1]); await page.waitForTimeout(180); return pt;
}
// live level of track 0's engine node (AnalyserNode tap, does not change the routing)
export async function liveTap(page) { await page.evaluate(() => { const E = AU.synth[0]; const an = AU.ctx.createAnalyser(); an.fftSize = 2048; E.node.connect(an); window.__an = an; window.__anNode = E.node; }); }
export const liveDb = page => page.evaluate(async () => { const an = window.__an, b = new Float32Array(an.fftSize); let mx = -200; for (let k = 0; k < 6; k++) { await new Promise(r => setTimeout(r, 40)); an.getFloatTimeDomainData(b); let e = 0; for (const x of b) e += x * x; mx = Math.max(mx, 10 * Math.log10(e / b.length + 1e-30)); } return mx; });
