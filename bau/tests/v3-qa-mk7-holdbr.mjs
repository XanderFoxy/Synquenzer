// QA MK7-03 in Chromium (app worklet via mkRender, and live in the app graph): a held sound with SCHWELLE > 0 and no source
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname, EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true})).newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 500));
  MKUI.setv(MKUI.KN.mode, 1, false); MKUI.render();   // STIMME knob 1 = Vocoder (INIT voc values)
  const init = Q.mkGet(0).voc, out = {init: {th: init.th, gs: init.gs, efs: init.efs, hold: init.hold}};
  const lev = x => { let s = 0; for (let i = 24000; i < 72000; i++) s += x[i] * x[i]; return +(10 * Math.log10(s / 48000 + 1e-30)).toFixed(1); };
  out.render = {};
  for (const th of [0, 10, 30, 64]) { const s = Q.getSound(0); s.p.mk.voc.hold = [60, 70, 80, 85, 80, 75, 70, 65, 60, 58, 55, 50, 45, 40, 35, 30]; s.p.mk.voc.th = th;
    const a = await Q.mkRender(s, [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8]], {sec: 1.6}); out.render['SCHWELLE ' + th] = lev(a.l); }
  // live in the app: hold sound, SCHWELLE 30, no source; play a chord, measure the track's output with an analyser
  Q.mkSet(0, 'voc.hold', [60, 70, 80, 85, 80, 75, 70, 65, 60, 58, 55, 50, 45, 40, 35, 30]);
  const an = AU.ctx.createAnalyser(); an.fftSize = 2048; AU.masterSum.connect(an); const buf = new Float32Array(2048);
  const meas = async () => { let mx = 0; for (let k = 0; k < 20; k++) { await new Promise(r => setTimeout(r, 25)); an.getFloatTimeDomainData(buf); for (const v of buf) mx = Math.max(mx, Math.abs(v)); } return +(20 * Math.log10(mx + 1e-12)).toFixed(1); };
  out.live = {};
  for (const th of [0, 30]) { Q.mkSet(0, 'voc.th', th); await new Promise(r => setTimeout(r, 100)); const A = AU.synth[0], t = AU.ctx.currentTime + .02;
    A.on(7e6 + th, 48, .8, t); A.on(7e6 + th + 1, 55, .8, t); A.flush(); await new Promise(r => setTimeout(r, 300)); out.live['SCHWELLE ' + th + ' Spitze am Master'] = await meas(); A.off(7e6 + th, AU.ctx.currentTime); A.off(7e6 + th + 1, AU.ctx.currentTime); A.flush(); await new Promise(r => setTimeout(r, 600)); }
  out.lcd = ED.lcd ? ED.lcd.textContent : '';
  return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
await br.close();
