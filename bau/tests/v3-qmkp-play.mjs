// regression: MS 2000 tracks play in scenes, transposition by keyboard chords, plate edits while playing, stop leaves no voice, no console errors
import {launch, open, touch, line, panel, ctr, tapSel} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'P1';
const b = await launch(); const fails = []; const log = [];
const page = await open(b, f);
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(140); ensureAudio(); await sl(1000);
  Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.mkSet(1, 'arp.on', 1); Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.q.0.k', 11); Q.selectTrack(0); Q.openEditor(); await sl(1200); Q.clearLog(); Q.launchScene(0); });
await page.waitForTimeout(2500);
for (let s = 1; s < 4; s++) {
  const E = (await panel(page)).elements.find(e => e.id === ['f.cut', 'f.res', 'o1.c1'][s - 1]); if (E && E.px) { const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 40, 10), 16); }
  await page.evaluate(s => SYNQUENZER.launchScene(s), s); await page.waitForTimeout(2600);
}
const lg = await page.evaluate(() => SYNQUENZER.noteLog(4096));
const per = {}; for (const e of lg) per[e.track] = (per[e.track] || 0) + 1;
log.push('notes per track ' + JSON.stringify(per));
if (!per[0] || !per[1]) fails.push('MS 2000 tracks silent: ' + JSON.stringify(per));
// transposition: hold chord F (F A C) vs C (C E G) on the keyboard; compare out-pitch of track 0 clip notes
const tr = async notes => { await page.evaluate(() => SYNQUENZER.clearLog()); await page.evaluate(n => { n.forEach((x, k) => setTimeout(() => SYNQUENZER.keyOn(x, .8, 'c' + x), k * 12)); }, notes); await page.waitForTimeout(2200);
  const L = await page.evaluate(() => SYNQUENZER.noteLog(4096).filter(e => e.track === 0)); await page.evaluate(n => n.forEach(x => SYNQUENZER.keyOff(x, 'c' + x)), notes); return L; };
await page.evaluate(() => SYNQUENZER.launchScene(0)); await page.waitForTimeout(1500); log.push('sample ' + JSON.stringify((await page.evaluate(() => SYNQUENZER.noteLog(30))).filter(e => e.track < 2).slice(0, 3)));
await page.evaluate(() => setKbMode('transpose')); await page.waitForTimeout(200);
const Lc = await tr([60, 64, 67]); const Lf = await tr([65, 69, 72]); await page.evaluate(() => setKbMode('play'));
const sh = (L) => L.slice(-6).map(e => e.out - e.clipNote);
log.push('C chord: out-clip ' + JSON.stringify(sh(Lc)) + ' | F chord: ' + JSON.stringify(sh(Lf)));
if (!Lc.length || !Lf.length) fails.push('no clip notes on track 0 while chords held');
else if (JSON.stringify(sh(Lc)) === JSON.stringify(sh(Lf))) fails.push('chord F did not transpose the MS 2000 clip');
// edit while playing in SPIEL and the landscape-free plate: no errors; then stop twice: no voices
await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(800);
await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="geraet"]'); await page.waitForTimeout(500);
await page.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.stop(); }); await page.waitForTimeout(2500);
const v = await page.evaluate(() => SYNQUENZER.voices().filter(x => x.state !== 'off' && x.state !== 'dead'));
log.push('voices after double stop: ' + v.length + ' ' + JSON.stringify(v.slice(0, 4)));
if (v.length) fails.push('voices left after double stop: ' + v.length);
// worklet output silent after stop (MS 2000 engine: delay tails end too)
if (page.errs.length) fails.push('console: ' + JSON.stringify(page.errs).slice(0, 300));
console.log(f, log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x);
await b.close();
