// QA MK7 regression: VS1 Stimme on -> off -> on quickly (before getUserMedia answered); base 4.12.0 vs MK7
import { INIT, EXE } from './v3-mk7-vsh.mjs';
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = [['base', S + 'mk6-base-4.12.0.html'], ['new', S + 'mk-br-MK7/index.html']];
const DELAY = +(process.argv[2] || 150);   // ms the fake getUserMedia takes (a real phone: ~100-400 ms after permission)
const INIT2 = (d) => { window.__gumDelay = d; };
for (const [name, file] of FILES) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT); await p.addInitScript(INIT2, DELAY);
  // slow the stand-in down like a real device and remember every stream it hands out
  await p.addInitScript(() => { const g = navigator.mediaDevices.getUserMedia; window.__streams = []; navigator.mediaDevices.getUserMedia = async o => { await new Promise(r => setTimeout(r, window.__gumDelay)); const s = await g.call(navigator.mediaDevices, o); window.__streams.push(s); return s; }; });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER; const a = Q.stimmeStart(); await new Promise(r => setTimeout(r, 30)); const b = Q.stimmeStop(); await new Promise(r => setTimeout(r, 30)); const c = Q.stimmeStart();
    await new Promise(r => setTimeout(r, 2500));
    const s = Q.stimme();
    const f0 = s.ring ? s.ring.frames : null; await new Promise(r => setTimeout(r, 1000)); const s2 = Q.stimme();
    return {calls: [a, b, c], on: s2.on, phase: s2.phase, err: s2.err, gum: window.__fake.gum, streams: window.__streams.map(x => x.getAudioTracks().map(t => t.readyState).join('/')),
      runTrack: ST.run && ST.run.track ? ST.run.track.readyState : null, framesGrow: s2.ring ? s2.ring.frames - f0 : null, lvl: Math.round(s2.lvl),
      tap: typeof MICTAP !== 'undefined' ? {stream: !!MICTAP.stream, users: [...MICTAP.users]} : 'n/a'};
  });
  console.log(name, JSON.stringify(r), 'errs', JSON.stringify(errs));
  await br.close();
}
