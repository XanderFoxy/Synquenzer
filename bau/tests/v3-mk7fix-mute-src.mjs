// MK7-fix copy of v3-qa7-mute.mjs: the vocoder track is no longer muted (a muted AM track now takes no input); its carrier is silent instead (mixer 0), so only DIREKT reaches post
import * as Q from './v3-qa7-lib.mjs';
const {ok} = Q; const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
await page.evaluate(() => SYNQUENZER.loadDemo()); await sleep(800);
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
const info = await page.evaluate(() => S.tracks.map((t, i) => ({i, kind: t.kind, eng: t.sound && t.sound.engine, clips: (t.clips || []).filter(Boolean).length})));
console.log(JSON.stringify(info));
const src = info.find(t => t.kind === 'synth' && t.i > 0 && t.clips > 0).i;
await page.evaluate(src => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.dir = 127; Object.assign(s.p.mk.t[0].mix, {o1: 0, o2: 0, n: 0}); Q_.setSound(0, s); Q_.mkIn(0, 'e2', src);
  const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 4096; AU.tracks[0].post.connect(an); window.__lv = () => { const d = new Float32Array(4096); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return 10 * Math.log10(s / 4096 + 1e-30); };
  for (let k = 0; k < NS(); k++) if (S.tracks[src].clips[k]) { SYNQUENZER.tapSlot(src, k); break; }
  SYNQUENZER.play(); }, src);
const mx = async ms => { let m = -999; const t0 = Date.now(); while (Date.now() - t0 < ms) { m = Math.max(m, await page.evaluate(() => __lv())); await sleep(50); } return m; };
const a = await mx(3000);
await page.evaluate(src => setMute(src, true), src); await sleep(500);
const b = await mx(3000);
ok('MK7-10 Stummschalten der Quelle schweigt den Eingang', a > -60 && b < -90, `E2 (DIREKT 127) vor Stumm ${a.toFixed(1)} dB, nach Stumm max ${b.toFixed(1)} dB (Quelle Spur ${src})`);
await page.evaluate(() => SYNQUENZER.stop());
console.log('errs', errs.slice(0, 3)); Q.summary(); await br.close();
