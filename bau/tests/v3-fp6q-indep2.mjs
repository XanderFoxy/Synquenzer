// Einmal + KEY SYNC aus, ▶ SONG from bar 2: spec says the 1Shot starts at song beat 0 and holds after C (so at song beat 4+ it is done)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true})).newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => { const Q = SYNQUENZER, sleep = t => new Promise(r => setTimeout(r, t));
  Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.setBpm(120);
  Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.ks', 0); Q.mkSet(0, 't.0.seq.last', 5); Q.mkSet(0, 't.0.seq.res', 3); Q.mkSet(0, 't.0.seq.run', 0); Q.mkSet(0, 't.0.seq.q.0.k', 11);
  for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, 10 * (s + 1));
  Q.setSong({bars: 8, lanes: [], carrier: []}); await sleep(300);
  Q.songPlay(1); await sleep(150); Q.keyOn(60, .9, "k1"); await sleep(20); const E = AU.synth[0]; Q.mkScope(0);
  const out = []; let l = null; const t0 = performance.now();
  while (performance.now() - t0 < 1500) { await sleep(8); const s = E.mks; if (!s || s === l || !R.songPlay) continue; l = s;
    const tb = (s.t - R.startTime) / (60 / S.bpm); out.push(`sb ${songBeatOf(tb).toFixed(2)} st ${s.seq[0].step} done ${s.seq[0].done}`); }
  Q.keyOff(60, 'k1'); Q.songPlay(false); Q.stop(); return out; });
console.log(r.filter((_, i) => i % 3 === 0).join(' | '));
await browser.close();
