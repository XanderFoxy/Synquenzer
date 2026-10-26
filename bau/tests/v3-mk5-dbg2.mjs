import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext({viewport: {width: 844, height: 390}})).newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk'); Q.selectTrack(0); for (let s = 0; s < 8; s++) S.tracks[0].clips[s] = null;
  Q.setBpm(120); mkSetP(0, 'arp.on', 1, false); mkSetP(0, 'arp.type', 4, false); mkSetP(0, 'arp.ks', 1, false); mkSetP(0, 'arp.gate', 50, false);
  R.selS = 0; Q.rec(); await sl(200); while (rec.state !== 'recording') await sl(20);
  const b0 = Math.ceil(t2b(AU.ctx.currentTime) + 1e-9); await sl((b2t(b0) - AU.ctx.currentTime) * 1000 + 2);
  for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n); const inp = JSON.stringify(Object.values(R.inputs).map(x => [x.route, x.track, x.arp, !!x.voice, x.voice && x.voice.src])); await sl(1000); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n);
  const L = Q.arpLog(0).map(x => +t2b(x.t).toFixed(3)), P = PERF.list.filter(e => !e.dead && e.track === 0).map(e => [+e.startBeat.toFixed(3), e.out, +e.endBeat.toFixed(3)]);
  return {L, P, rs: rec.state, inp, selT: R.selT};
});
console.log(JSON.stringify(r), errs);
await browser.close();
