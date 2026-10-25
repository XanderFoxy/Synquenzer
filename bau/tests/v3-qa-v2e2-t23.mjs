// QA V2e′ t23: drag a part into an EMPTY song (Xander 24.10. a): at bar 1 and at bar 4 (bars 1–3 stay empty)
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false));
await E(() => { const Q = window.SYNQUENZER; Q.setSong({bars: 0, lanes: [[], [], [], [], [], []], carrier: [], marks: []}); return Q.song().bars; }).then(x => console.log('bars', x));
await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
const P0 = await t.full();
for (const n of [0, 3]) {
  const k = await t.key(0);
  await t.down(k.x, k.y); await sleep(1120);
  const inf = await t.info();
  console.log('empty hint visible?', await E(() => { const e = SV.empty; return e && !e.hidden && e.offsetWidth > 0; }));
  await t.glide(k.x, k.y, inf.canvas.x + n * 36 + 4 - inf.x0, inf.canvas.y + 120, 8, 16);
  const d = await t.drag(); console.log('drag', JSON.stringify(d));
  await p.screenshot({path: `v3-qa-v2e2-t23-${n}.png`});
  await t.up(); await sleep(500);
  const s = await E(() => window.SYNQUENZER.song());
  console.log('n', n, 'bars', s.bars, 'marks', JSON.stringify(s.marks), 'pop', await t.pop());
  check(`${VP} empty song: drop at bar ${n + 1} → mark at ${n}, bars ${n + 4}, no question`, s.bars === n + 4 && s.marks.length === 1 && s.marks[0].a === n && !(await t.pop()), [s.bars, s.marks]);
  await E(() => window.SYNQUENZER.undo()); await sleep(200);
  check(`${VP} undo → deep-equal`, (await t.full()) === P0);
  await E(() => window.SYNQUENZER.songView(false)); await sleep(200);
}
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
