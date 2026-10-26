import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext({viewport: {width: 844, height: 390}})).newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk'); Q.selectTrack(0); for (let s = 0; s < 8; s++) S.tracks[0].clips[s] = null;
  Q.setBpm(120); mkSetP(0, 'arp.on', 1, false); mkSetP(0, 'arp.latch', 1, false); mkSetP(0, 'arp.gate', 100, false);
  Q.setClip(0, 0, {len: 1, notes: [{t: 0, d: 4, n: 48, v: .8}]}); Q.launchClip(0, 0); if (!R.playing) Q.play(); await sl(200);
  for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n); await sl(450); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n); await sl(100);
  const cuts = []; const c0 = ARPC.cut; ARPC.cut = (i, t) => { cuts.push([i, +t.toFixed(3)]); return c0(i, t); };
  Q.stopTrack(0); const b = Math.ceil(t2b(AU.ctx.currentTime) / 4 + 1e-9) * 4; const tb = b2t(b); await sl((tb - AU.ctx.currentTime) * 1000 + 300);
  const L = Q.arpLog(0).filter(x => x.t > tb - .01).map(x => [+(x.t - tb).toFixed(3), x.note]);
  return {cuts, tb: +tb.toFixed(3), L, info: Q.arpInfo(0), slot: R.slot[0]};
});
console.log(JSON.stringify(r), errs);
await browser.close();
