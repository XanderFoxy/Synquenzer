// QA MK7-10 „Quelle nur als Eingang“: the source comes back into the master when its consumer stops being a vocoder input
// (engine changed, consumer track removed, sound replaced), and undo restores the cut
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname, EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true})).newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER, out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  const st = () => ({cut1: !!AU.tracks[1].dryCut, g1: +AU.tracks[1].cut.gain.value.toFixed(3), mkIn: JSON.stringify((S.tracks[Q.NT() - 1] || {}).mkIn || null)});
  // (a) consumer = track 0, engine change to analog
  Q.setEngine(0, 'mk'); let s = Q.getSound(0); s.p.mk.mode = 3; applySound(0, s); await w(200);
  Q.mkIn(0, 'e2', 1, false); await w(200); out.a0 = {cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3)};
  Q.setEngine(0, 'analog'); await w(300); out.a1 = {cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3), mkIn0: JSON.stringify(S.tracks[0].mkIn || null)};
  await w(1500); out.a2 = {cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3)};
  Q.undo(); await w(400); out.a3 = {eng: S.tracks[0].sound.engine, cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3)};
  // (b) consumer = an added track (the only removable one), then removed
  Q.mkIn(0, 'e2', null); Q.mkIn(0, 'e2', null, true); await w(200);
  Q.addTrack(); await w(300); const k = Q.NT() - 1; out.k = k + ':' + S.tracks[k].kind;
  Q.setEngine(k, 'mk'); s = Q.getSound(k); s.p.mk.mode = 3; applySound(k, s); await w(200);
  Q.mkIn(k, 'e2', 1, false); await w(300); out.b0 = {cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3)};
  Q.removeTrack(k); await w(300); out.b1 = {NT: Q.NT(), cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3)};
  await w(1500); out.b2 = {cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3)};
  Q.undo(); await w(500); out.b3 = {NT: Q.NT(), mkIn: JSON.stringify(S.tracks[Q.NT() - 1].mkIn || null), cut: !!AU.tracks[1].dryCut, g: +AU.tracks[1].cut.gain.value.toFixed(3)};
  return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
await br.close();
