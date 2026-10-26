// QA FP-SONG MK6: KEY SYNC aus with a looping 2-bar song (⟲): each pass should start on the same step (song beat 0)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => { const Q = SYNQUENZER, sleep = ms => new Promise(r => setTimeout(r, ms));
  Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.setBpm(120);
  Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.ks', 0); Q.mkSet(0, 't.0.seq.last', 5); Q.mkSet(0, 't.0.seq.res', 3); Q.mkSet(0, 't.0.seq.q.0.k', 11);
  Q.setSong({bars: 2, lanes: [], carrier: []}); Q.songLoop(true); await sleep(400);
  Q.songPlay(0); await sleep(150); Q.keyOn(60, .9, 'k1'); const E = AU.synth[0]; Q.mkScope(0);
  const out = []; let last = null;
  for (let k = 0; k < 700; k++) { await sleep(10); const s = E.mks; if (!s || s === last) continue; last = s; const sp = R.songPlay; if (!sp) continue;
    const tb = (s.t - R.startTime) / (60 / S.bpm); out.push({tb, sb: songBeatOf(tb), st: s.seq[0].step}); }
  Q.keyOff(60, 'k1'); Q.songPlay(false); Q.stop(); return out; });
// the step reported at the first report after each pass start (song beat in [0.03, 0.22))
const C = 1.25, exp = sb => Math.floor((((sb % C) + C) % C) / .25 + 1e-9) + 1;
const passes = {}; for (const x of r) { const p = Math.floor(x.tb / 8 + 1e-9); if (x.sb >= .03 && x.sb < .22 && !(p in passes)) passes[p] = x; }
console.log('song 2 bars ⟲, LÄNGE 5 x 1/16 (C = 1.25 beats): first report of each pass: ' + Object.entries(passes).map(([p, x]) => `pass ${+p + 1}: song beat ${x.sb.toFixed(2)} (transport ${x.tb.toFixed(2)}) -> step ${x.st}, song grid expects ${exp(x.sb)}`).join(' · '));
const near = x => { const ph = ((x % .25) + .25) % .25; return ph < .03 || ph > .22; };
const use = r.filter(x => !near(x.sb) && !near(x.tb)); console.log(`all reports: step = song beat mod C ${use.filter(x => x.st === exp(x.sb)).length}/${use.length}, = transport beat mod C ${use.filter(x => x.st === exp(x.tb)).length}/${use.length}; errors ${errs.length}`);
await browser.close();
