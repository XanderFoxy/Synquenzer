// Realistic case: source = clip-playing pad on track 2 ("Quelle nur als Eingang"), vocoder on track 0 with DIREKT 127.
// Mute track 0 via the strip button M while the song plays.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK7/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true})).newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE);
await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 30000});
await page.evaluate(() => {
  const Q = SYNQUENZER; Q.setEngine(0, 'mk');
  const s = Q.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.dir = 127; s.p.mk.voc.hpl = 0; Q.setSound(0, s);
  Q.mkIn(0, 'e2', 2, 0);   // track 2 (pad clip) as E2, "Quelle nur als Eingang"
  const c = AU.ctx, mk = n => { const an = c.createAnalyser(); an.fftSize = 32768; n.connect(an); return () => { const d = new Float32Array(32768); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return +(10 * Math.log10(s / 32768 + 1e-30)).toFixed(1); }; };
  window.__t0 = mk(AU.tracks[0].cut); window.__t2 = mk(AU.tracks[2].cut); window.__m = mk(AU.masterSum);
  window.__snap = () => ({t0_feed: __t0(), t2_feed: __t2(), master: __m(), mute0: S.tracks[0].mute});
  for (let i = 0; i < S.tracks.length; i++) if (i !== 0 && i !== 2) Q.setMute(i, true);   // only the vocoder and its source
  Q.play(); Q.launchClip(2, 0); Q.launchClip(0, 0);
});
await sleep(3000);
const rows = [];
rows.push(['unmuted', await page.evaluate(() => __snap())]);
await page.locator('#bMute').count();
await page.evaluate(() => { SYNQUENZER.selectTrack(0); });
await page.locator('#bMute').tap(); await sleep(1500);
rows.push(['muted via M button', await page.evaluate(() => __snap())]);
await sleep(1500);
rows.push(['muted +1.5 s', await page.evaluate(() => __snap())]);
// same with DIREKT 0 (only the vocoder carrier, which mute silences)
await page.evaluate(() => { const s = SYNQUENZER.getSound(0); s.p.mk.voc.dir = 0; SYNQUENZER.setSound(0, s); }); await sleep(1500);
rows.push(['muted, DIREKT 0', await page.evaluate(() => __snap())]);
for (const [k, v] of rows) console.log(k.padEnd(20), JSON.stringify(v));
console.log('errs', errs.slice(0, 5));
await br.close();
