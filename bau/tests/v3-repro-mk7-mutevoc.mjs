// Independent repro: muted MK vocoder track still passes DIREKT / HPF input audio to the master?
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK7/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
  args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']});
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, permissions: ['microphone']});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE);
await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 30000});
const ver = await page.evaluate(() => VERSION);
await page.evaluate(() => {
  const Q = SYNQUENZER; Q.setEngine(1, 'analog'); Q.setEngine(2, 'analog'); Q.setEngine(0, 'mk');
  const c = AU.ctx, mk = n => { const an = c.createAnalyser(); an.fftSize = 8192; n.connect(an); return () => { const d = new Float32Array(8192); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return +(10 * Math.log10(s / 8192 + 1e-30)).toFixed(1); }; };
  window.__m = mk(AU.masterSum); window.__t0 = mk(AU.tracks[0].cut); window.__t1 = mk(AU.tracks[1].cut); window.__t2 = mk(AU.tracks[2].cut);
  window.__snap = () => ({master: __m(), t0: __t0(), t1: __t1(), t2: __t2(), mute0: S.tracks[0].mute, mute2: S.tracks[2].mute});
  window.__voc = (o) => { const s = Q.getSound(0); s.p.mk.mode = 3; Object.assign(s.p.mk.voc, o); Q.setSound(0, s); };
});
const out = {version: ver};
// Source: held saw on track 1 (no clip, direct engine note)
await page.evaluate(() => { const E = AU.synth[1]; E.on(9e6, 69, .9, AU.ctx.currentTime + .02); E.flush(); });
// Case A: DIREKT 127, source cut from master (eDry 0)
await page.evaluate(() => { __voc({dir: 127, hpl: 0, hpg: 1}); SYNQUENZER.mkIn(0, 'e2', 1, 0); });
await sleep(700); out.A_dir127_unmuted = await page.evaluate(() => __snap());
await page.evaluate(() => SYNQUENZER.setMute(0, true)); await sleep(700);
out.A_dir127_muted = await page.evaluate(() => __snap());
await page.evaluate(() => SYNQUENZER.setMute(0, false)); await sleep(300);
// Case B: HPF-PEGEL 127, HPF-GATE DIS, DIREKT 0
await page.evaluate(() => { __voc({dir: 0, hpl: 127, hpg: 0}); });
await sleep(700); out.B_hpf_unmuted = await page.evaluate(() => __snap());
await page.evaluate(() => SYNQUENZER.setMute(0, true)); await sleep(700);
out.B_hpf_muted = await page.evaluate(() => __snap());
await page.evaluate(() => SYNQUENZER.setMute(0, false)); await sleep(300);
// Case C: DIREKT 0, HPF 0 -> baseline (muted, nothing should come)
await page.evaluate(() => { __voc({dir: 0, hpl: 0, hpg: 1}); SYNQUENZER.setMute(0, true); });
await sleep(700); out.C_off_muted = await page.evaluate(() => __snap());
await page.evaluate(() => SYNQUENZER.setMute(0, false));
// stop source note
await page.evaluate(() => { const E = AU.synth[1]; E.allOff ? E.allOff(AU.ctx.currentTime) : null; });
await page.evaluate(() => { try { panic && panic(); } catch (e) {} });
// Case D: mic as E2 (fake device beep), DIREKT 127, track 0 muted
out.D_mic = await page.evaluate(async () => {
  __voc({dir: 127, hpl: 0, hpg: 1});
  let set = null; try { SYNQUENZER.mkIn(0, 'e2', 'mic'); set = await SYNQUENZER.mkVocMic(true); } catch (e) { set = 'ERR ' + e.message; }
  return {micAvail: micAvail(), started: set, mkIn: SYNQUENZER.mkIn(0)};
});
await sleep(900); out.D_mic_unmuted = await page.evaluate(() => __snap());
await page.evaluate(() => SYNQUENZER.setMute(0, true)); await sleep(700);
out.D_mic_muted = await page.evaluate(() => __snap());
await page.evaluate(() => { SYNQUENZER.setMute(0, false); SYNQUENZER.mkVocMic(false); SYNQUENZER.mkIn(0, 'e2', null); });
// Case E (semantics comparison): live keyboard note on a MUTED analog track 2 (pre-MK7 behaviour of mute)
await page.evaluate(() => { R.selT = 2; SYNQUENZER.setMute(2, true); inputDown(60, 'qa1', .9); });
await sleep(600); out.E_live_key_on_muted_analog = await page.evaluate(() => __snap());
await page.evaluate(() => { inputUp('qa1'); SYNQUENZER.setMute(2, false); });
console.log(JSON.stringify(out, null, 1));
console.log('errs', errs.slice(0, 5));
await br.close();
