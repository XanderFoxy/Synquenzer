// N8LOCKS Testhilfe: App im Chromium öffnen (file://), Audio entsperren, Fehler sammeln
import { chromium } from 'playwright';
export const APP = new URL('../index.html', import.meta.url).pathname;
export const BASE = new URL('../../../snapshots/R-4300.html', import.meta.url).pathname;
export async function open(file, o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: o.vp || {width: 428, height: 926}, deviceScaleFactor: 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (o.init) await p.addInitScript(o.init);
  await p.goto('file://' + (file || APP) + (o.q || ''));
  await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage && SYNQUENZER.storage().booted, null, {timeout: 60000});
  if (!o.noAudio) {
    await p.mouse.click(5, 300).catch(() => {});
    await p.evaluate(async () => { if (typeof ensureAudio === 'function') try { await ensureAudio(); } catch (e) {} }).catch(() => {});
    await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && window.AU && AU.ctx, null, {timeout: 15000}).catch(() => {});
  }
  return {b, p, errs};
}
export const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; return !!c; };
