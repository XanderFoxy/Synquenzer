// Independent repro (FP-SONG MK6, KEY SYNC aus): start ▶ SONG at bar 1 and at bar 2, compare the worklet step at the SAME
// song beat between the two runs (no formula). Cases: LÄNGE 16 · 1/8 (C = 8 beats), LÄNGE 5 · 1/16 (C = 1.25), LÄNGE 16 · 1/16 (C = 4).
// Usage: node v3-fp6q-indep.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
async function run(last, res, bar, ms) {
  return page.evaluate(async ([last, res, bar, ms]) => {
    const Q = SYNQUENZER, sleep = t => new Promise(r => setTimeout(r, t));
    Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.setBpm(120);
    Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.ks', 0); Q.mkSet(0, 't.0.seq.last', last); Q.mkSet(0, 't.0.seq.res', res); Q.mkSet(0, 't.0.seq.q.0.k', 11);
    for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, 3 * (s + 1));
    Q.setSong({bars: 8, lanes: [], carrier: []}); await sleep(300);
    Q.songPlay(bar); await sleep(100); Q.keyOn(60, .9, 'k1');
    for (let w = 0; w < 100 && !AU.synth[0]; w++) await sleep(20); const E = AU.synth[0]; Q.mkScope(0);
    const out = []; let lastS = null; const t0 = performance.now();
    while (performance.now() - t0 < ms) { await sleep(8); const s = E.mks; if (!s || s === lastS || !R.songPlay) continue; lastS = s;
      const tb = (s.t - R.startTime) / (60 / S.bpm); out.push({sb: songBeatOf(tb), tb, st: s.seq[0].step, v: s.seq[0].vals ? s.seq[0].vals[11] : null}); }
    Q.keyOff(60, 'k1'); Q.songPlay(false); Q.stop(); await sleep(400);
    return out;
  }, [last, res, bar, ms]);
}
for (const [last, res, name, unit] of [[16, 3, "C4", .25], [16, 3, "C4b", .25]]) {
  const a = await run(last, res, 0, 6500), b = await run(last, res, 1, 3000);
  // bucket by song beat in units of a quarter step, skip reports near a step boundary
  const key = sb => { const ph = ((sb % unit) + unit) % unit; if (ph < unit * .15 || ph > unit * .85) return null; return Math.floor(sb / unit + 1e-9); };
  const ma = new Map(); for (const x of a) { const k = key(x.sb); if (k != null && x.sb >= 0) ma.set(k, x.st); }
  let same = 0, diff = 0; const ex = [];
  for (const x of b) { const k = key(x.sb); if (k == null || !ma.has(k)) continue; if (ma.get(k) === x.st) same++; else { diff++; if (ex.length < 4) ex.push(`song beat ${x.sb.toFixed(2)}: from bar 1 step ${ma.get(k)}, from bar 2 step ${x.st}`); } }
  console.log(JSON.stringify(b.slice(0,4).map(x=>[+x.sb.toFixed(3),+x.tb.toFixed(3),x.st]))); const sbRange = b.length ? `${b[0].sb.toFixed(2)}..${b[b.length - 1].sb.toFixed(2)}` : '-';
  console.log(`${name}: bar-2 run song beats ${sbRange}; same step at same song beat ${same}/${same + diff}` + (ex.length ? ' · e.g. ' + ex.join('; ') : ''));
}
console.log('errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
await browser.close();
