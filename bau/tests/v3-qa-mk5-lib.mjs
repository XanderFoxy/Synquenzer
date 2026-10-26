// QA (acceptance lens) helper for MK5: open the app, AM on tracks, a small helper H in the page.
import { chromium } from 'playwright';
import path from 'path';
export const FILE = path.resolve(process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html');
export const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
export const J = x => JSON.stringify(x);
export let fails = 0;
export const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
export async function open(vp) {
  const ctx = await browser.newContext({viewport: vp || {width: 844, height: 390}});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(async () => {
    const Q = SYNQUENZER; ensureAudio(); await new Promise(r => setTimeout(r, 1200));
    for (let t = 0; t < 4; t++) if (S.tracks[t] && S.tracks[t].kind === 'synth') Q.setEngine(t, 'mk');
    for (let t = 0; t < S.tracks.length; t++) for (let s = 0; s < 8; s++) if (S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
    Q.selectTrack(0);
    const sl = ms => new Promise(r => setTimeout(r, ms));
    const waitJump = () => { const t = AU.ctx.currentTime, p0 = performance.now(); while (AU.ctx.currentTime === t && performance.now() - p0 < 40) {} };
    window.H = {
      sl, Q,
      arp(o, t) { for (const k in o) mkSetP(t || 0, 'arp.' + k, o[k], false); },
      mk(p, v, t) { mkSetP(t || 0, p, v, false); },
      reset(t) { Q.stop(); Q.panic(); if (typeof ARPC !== 'undefined') ARPC.clearLog(); clearLog(); for (const i of [t || 0]) { sndOf(i).p.mk = SQStore.normalizeSound(factorySound(INIT_IDS.mk)).p.mk; syncEngine(i, true); } S.settings.swing = 0; },
      keys(ns, vel) { waitJump(); const tp = AU.ctx.currentTime; for (const n of ns) Q.keyOn(n, vel || .8, 'k' + n); return tp; },
      up(ns) { waitJump(); for (const n of ns) Q.keyOff(n, 'k' + n); },
      log(t) { return Q.arpLog(t || 0); },
      now: () => AU.ctx.currentTime,
    };
    H.arp({on: 1}); await sl(30); H.keys([60, 64, 67]); await sl(150); H.up([60, 64, 67]); await sl(150); H.reset(); ARPC.clearLog(); clearLog();
    await sl(300);
  });
  return {ctx, page, errs};
}
export const T = async (id, f, vp) => { const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null; if (ONLY && !ONLY.test(id)) return; const o = await open(vp); try { await f(o.page, o); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 700)); } if (o.errs.length) ok(id + ' Konsole', false, o.errs.slice(0, 3).join(' | ')); await o.ctx.close(); };
