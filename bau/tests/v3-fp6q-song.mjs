// QA FP-SONG MK6: KEY SYNC aus = song grid. Song playback from bar 1 vs bar 2 (and V0c start on a running transport):
// the step at the same SONG beat must be the same (MK6-05). Usage: node v3-fp6q-song.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.setBpm(120);
  Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.ks', 0); Q.mkSet(0, 't.0.seq.last', 5); Q.mkSet(0, 't.0.seq.res', 3); Q.mkSet(0, 't.0.seq.q.0.k', 11);
  for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, 10 * (s + 1));
  Q.setSong({bars: 8, lanes: [], carrier: []}); });
await page.waitForTimeout(600);
const info0 = await page.evaluate(() => ({song: !!SYNQUENZER.song(), seq: SYNQUENZER.mkGet(0).t[0].seq}));
console.log('song set:', info0.song, 'seq ks', info0.seq.ks, 'last', info0.seq.last, 'res', info0.seq.res);
// run: start the song at bar `bar`, hold a key, collect (song beat, step) from the scope for 2.5 s
async function run(bar, mode) {
  return page.evaluate(async ([bar, mode]) => {
    const Q = SYNQUENZER, sleep = ms => new Promise(r => setTimeout(r, ms));
    if (mode === 'next') { Q.play(); await sleep(700); }
    const okp = mode === 'next' ? songPlayStart(bar, {next: true}) : Q.songPlay(bar);
    await sleep(150); Q.keyOn(60, .9, 'k1'); await sleep(100);
    const E = AU.synth[0]; Q.mkScope(0);
    const out = []; let last = null;
    for (let k = 0; k < 260; k++) { await sleep(10); const s = E.mks; if (!s || s === last) continue; last = s;
      const sp = R.songPlay; if (!sp) continue; const tb = (s.t - R.startTime) / (60 / S.bpm), sb = songBeatOf(tb);
      out.push({tb: +tb.toFixed(4), sb: +sb.toFixed(4), st: s.seq[0].step}); }
    Q.keyOff(60, 'k1'); Q.songPlay(false); Q.stop(); await sleep(400);
    return {okp, off: null, out};
  }, [bar, mode]);
}
const C = 5 * .25;   // LÄNGE 5 x 1/16 = 1.25 beats
const expSong = sb => Math.floor((((sb % C) + C) % C) / .25 + 1e-9) + 1, expTr = tb => Math.floor((((tb % C) + C) % C) / .25 + 1e-9) + 1;
for (const [bar, mode] of [[0, 'play'], [1, 'play'], [3, 'play'], [1, 'next']]) {
  const r = await run(bar, mode);
  const near = x => { const ph = ((x % .25) + .25) % .25; return ph < .03 || ph > .22; };   // skip reports at a step boundary
  const use = r.out.filter(x => !near(x.sb) && !near(x.tb));
  const hitS = use.filter(x => x.st === expSong(x.sb)).length, hitT = use.filter(x => x.st === expTr(x.tb)).length;
  console.log(`song from bar ${bar + 1} (${mode}): ${use.length} reports · step = (SONG beat mod C): ${hitS}/${use.length} · step = (transport beat mod C): ${hitT}/${use.length} · first: ` + use.slice(0, 4).map(x => `sb ${x.sb} st ${x.st} (song exp ${expSong(x.sb)})`).join('; '));
}
console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
await browser.close();
