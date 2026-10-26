// QA MK7-13: LED E2 lag behind the input level (spec: ± 1 frame). Source = track 2 (pre-fader tap, no mic latency);
// a note starts at a known context time; the LED class is sampled from a MutationObserver (exact moment the class changes)
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname, EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true})).newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.setEngine(1, 'analog'); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 600));
  MKUI.setv(MKUI.KN.mode, 1, false); MKUI.render(); Q.mkIn(0, 'e2', 1); await new Promise(r => setTimeout(r, 300));
  const led = () => document.querySelectorAll('#synthSheet .mkx.mein .mled')[1];
  const res = []; const c = AU.ctx;
  for (let k = 0; k < 16; k++) {
    await new Promise(r => setTimeout(r, 700 + Math.random() * 100));
    const L = led(); if (!L) return {err: 'no led'};
    const t = c.currentTime + .1, E = AU.synth[1]; let seen = null;
    const mo = new MutationObserver(() => { if (seen == null && L.classList.contains('lon')) seen = c.currentTime; }); mo.observe(L, {attributes: true});
    E.on(5e6 + k, 69, 1, t); E.flush();
    await new Promise(r => setTimeout(r, 300)); mo.disconnect(); E.off(5e6 + k, c.currentTime); E.flush();
    res.push(seen == null ? null : Math.round((seen - t) * 1000));
  }
  return {lagMs: res, base: c.baseLatency, sr: c.sampleRate};
});
console.log(JSON.stringify(r)); const a = r.lagMs.filter(x => x != null).sort((x, y) => x - y);
console.log('LED E2 Verzögerung (Kontextzeit, ohne Bild-Raster): min ' + a[0] + ' ms, Median ' + a[a.length >> 1] + ' ms, max ' + a[a.length - 1] + ' ms (1 Bild = 16,7 ms)'); console.log('errs', errs);
await br.close();
