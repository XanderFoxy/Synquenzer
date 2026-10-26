// QA MK2 (acceptance lens): Chromium harness around the app's own mkRender (OfflineAudioContext + app worklet).
import { chromium } from 'playwright';
import path from 'path';
export const SR = 48000;
export const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export async function launch() { return chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']}); }
export async function openApp(browser, file, o) {
  o = o || {};
  const ctx = await browser.newContext({viewport: o.vp || {width: 844, height: 390}, hasTouch: true, isMobile: o.mobile !== false, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (o.init) await page.addInitScript(o.init);
  await page.goto('file://' + path.resolve(file));
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(() => {
    const b64 = f => { const u = new Uint8Array(f.buffer, f.byteOffset, f.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
    const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
    window.__mkSnd = (over, top) => { const s = factorySound(INIT_IDS.mk); merge(s.p.mk.t[0], over || {}); if (top) merge(s.p.mk, top); s.p.mk = SQMK.normMk(s.p.mk); return s; };
    window.__r = async (over, ev, o, top) => { const s = __mkSnd(over, top); const r = await SYNQUENZER.mkRender(s, ev, o || {}); return {l: b64(r.l), r: b64(r.r)}; };
    window.__rs = async (snd, ev, o) => { const r = await SYNQUENZER.mkRender(snd, ev, o || {}); return {l: b64(r.l), r: b64(r.r)}; };
  });
  return {ctx, page, errs};
}
export function dec(b) { const buf = Buffer.from(b, 'base64'); return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4); }
export async function R(page, over, ev, o, top) { const x = await page.evaluate(([a, b, c, d]) => __r(a, b, c, d), [over, ev, o, top]); return {l: dec(x.l), r: dec(x.r)}; }
export async function RS(page, snd, ev, o) { const x = await page.evaluate(([a, b, c]) => __rs(a, b, c), [snd, ev, o]); return {l: dec(x.l), r: dec(x.r)}; }
export const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
export const OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}};
export function mergeO(...o) { const r = {}; for (const x of o) for (const k in x || {}) r[k] = typeof x[k] === 'object' && !Array.isArray(x[k]) ? Object.assign({}, r[k] || {}, x[k]) : x[k]; return r; }
