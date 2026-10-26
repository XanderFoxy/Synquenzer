// QA MK7 regression: triple tap on the 🎤 button (L1 #bMicT, P1 SINGEN segment) while getUserMedia takes 300 ms; base vs MK7
import { INIT, EXE } from './v3-mk7-vsh.mjs';
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = [['base', S + 'mk6-base-4.12.0.html'], ['new', S + 'mk-br-MK7/index.html']];
for (const [vp, w, h] of [['L1', 844, 390], ['P1', 390, 844]]) for (const [name, file] of FILES) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.addInitScript(() => { const g = navigator.mediaDevices.getUserMedia; window.__streams = []; navigator.mediaDevices.getUserMedia = async o => { await new Promise(r => setTimeout(r, window.__gd || 800)); const s = await g.call(navigator.mediaDevices, o); window.__streams.push(s); return s; }; });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
  const sel = vp === 'L1' ? '#bMicT' : await p.evaluate(() => '#' + EL.segMic.id);
  for (let k = 0; k < 3; k++) { await p.tap(sel); await p.waitForTimeout(80); }
  await p.waitForTimeout(2500);
  // sing into the stand-in: a 220 Hz tone for 1 s, then read the input level
  await p.evaluate(() => { const c = window.__ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.value = 220; g.gain.value = .3; o.connect(g); g.connect(window.__fake.bus); o.start(); o.stop(c.currentTime + 1.5); });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => { const s = SYNQUENZER.stimme(); return {on: s.on, phase: s.phase, lvl: Math.round(s.lvl), gum: window.__fake.gum, streams: window.__streams.map(x => x.getAudioTracks().map(t => t.readyState).join('/')), runTrack: ST.run && ST.run.track ? ST.run.track.readyState : null, btn: (EL.bMicT && EL.bMicT.className) + ' / ' + (EL.segMic && EL.segMic.className)}; });
  console.log(vp, name, JSON.stringify(r), 'errs', JSON.stringify(errs));
  await p.screenshot({path: S + 'dirigent-test/v3-qa-mk7reg/strace-' + vp + '-' + name + '.png'});
  await br.close();
}
