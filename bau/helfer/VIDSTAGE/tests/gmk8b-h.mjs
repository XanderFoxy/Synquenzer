// QA MK8b harness
import { chromium } from 'playwright';
export const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export const APP = process.env.APP || '/home/user/Synquenzer/bau/helfer/VIDSTAGE/index.html';
export const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/gmk8b';
export const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], X: [926, 428]};
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function launch(mic, wav) {
  const args = ['--autoplay-policy=no-user-gesture-required'];
  if (mic) args.push('--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream');
  if (wav) args.push('--use-file-for-fake-audio-capture=' + wav);
  return chromium.launch({executablePath: EXE, args});
}
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (d instanceof AudioDestinationNode && !this.__qa) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  window.__tap = () => { const ctx = window.__ctx, a = ctx.createAnalyser(); a.fftSize = 8192; a.__qa = 1; for (const n of window.__outs) { try { oc.call(n, a); } catch (e) {} } window.__an = a; return true; };
  window.__lvl = () => { const a = window.__an; if (!a) return null; const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0, pk = 0; for (const v of b) { s += v * v; pk = Math.max(pk, Math.abs(v)); } return {rmsDb: 10 * Math.log10(s / b.length + 1e-20), pk}; };
  window.__recOut = () => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(2048, 2, 2), g = ctx.createGain(); sp.__qa = g.__qa = 1; g.gain.value = 0; window.__rec = []; window.__recT0 = ctx.currentTime; sp.onaudioprocess = e => { window.__rec.push([new Float32Array(e.inputBuffer.getChannelData(0)), new Float32Array(e.inputBuffer.getChannelData(1))]); }; for (const n of window.__outs) { try { oc.call(n, sp); } catch (e) {} } oc.call(sp, g); oc.call(g, ctx.destination); window.__sp = sp; return true; };
  window.__recStop = () => { const n = window.__rec.reduce((a, x) => a + x[0].length, 0), L = new Float32Array(n), R = new Float32Array(n); let o = 0; for (const [l, r] of window.__rec) { L.set(l, o); R.set(r, o); o += l.length; } window.__rec = []; return {L, R, sr: window.__ctx.sampleRate}; };
};
export async function open(br, o = {}) {
  const [w, h] = FMT[o.fmt || 'P1'];
  const ctx = o.ctx || await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1, permissions: o.mic ? ['microphone'] : []});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.addInitScript(INIT);
  await page.goto('file://' + (o.file || APP)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  return {ctx, page, errs};
}
export const tapSel = async (page, sel, wait = 180) => { const b = await page.$(sel); if (!b) throw new Error('fehlt ' + sel); await b.scrollIntoViewIfNeeded(); await b.tap(); await page.waitForTimeout(wait); };
export const tapXY = async (page, x, y, wait = 180) => { await page.touchscreen.tap(x, y); await page.waitForTimeout(wait); };
export async function swipe(page, x0, y0, x1, y1, steps = 12) {
  const c = await page.context().newCDPSession(page);
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]});
  for (let k = 1; k <= steps; k++) { await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * k / steps, y: y0 + (y1 - y0) * k / steps}]}); await page.waitForTimeout(16); }
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(400); await c.detach();
}
export function mkOk() { let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); return c; }; return {ok, fails: () => fails}; }
