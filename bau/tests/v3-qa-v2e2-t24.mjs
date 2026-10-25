// QA V2e′ t24: make an own clip of the pass that is playing right now (and the whole block) — no double / missing notes
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(true)); await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const cellXY = (tr, bar) => E(([tr, bar]) => { const I = window.SYNQUENZER.svLayoutInfo(); const r = SV.rows.indexOf(tr); return {x: I.canvas.x + bar * I.cellW - I.x0 + I.cellW / 2, y: I.canvas.y + I.rulerH + r * I.rowH + I.rowH / 2}; }, [tr, bar]);
// reference log without own clips
const run = async (action) => {
  await E(() => { const Q = window.SYNQUENZER; Q.setBpm(60); Q.setFollow && Q.setFollow(false); Q.clearLog(); Q.songPlay(0); return 1; });
  if (action) await action();
  await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 24.5, null, {timeout: 40000, polling: 5});
  return E(() => { const Q = window.SYNQUENZER; Q.songPlay(false); return Q.noteLog(400).filter(x => x.track === 0 && x.beat < 24).map(x => +x.beat.toFixed(2) + ':' + x.out); });
};
const ref = await run(null);
console.log('ref', ref.join(' '));
const c = await cellXY(0, 4);
const got = await run(async () => {
  await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 16.3, null, {timeout: 40000, polling: 5});   // in T5 (beats 16–20), after its first note
  await t.down(c.x, c.y); await sleep(560); await t.up(); await sleep(150);
  await t.tapPop('Eigener Clip');
});
console.log('own', got.join(' '));
check(`${VP} own clip made while its pass plays: same notes, none doubled or missing`, JSON.stringify(got) === JSON.stringify(ref), {ref, got});
const lane = await E(() => window.SYNQUENZER.song().lanes[0]); console.log('lane', JSON.stringify(lane));
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
