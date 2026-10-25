// QA V2e′ t27: (b) whole block T8–11 then [Zurück]; (a) pass then (b) etc. → song deep-equal after back
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const t = T(p, cdp), E = t.E;
await E(SETUP55(true)); await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const S0 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
const cases = [
  ['whole (b) then back', [[0, 8, true]], [[0, 8]]],
  ['pass (b) then back', [[0, 8, false]], [[0, 8]]],
  ['pass T5 + pass T4 then back both', [[0, 4, false], [0, 3, false]], [[0, 3], [0, 4]]],
  ['pass T4 then whole on T3 (ref)', [[0, 3, false], [0, 2, true]], [[0, 2], [0, 3]]],
  ['pass (b) T9 then whole on it', [[0, 8, false], [0, 8, true]], [[0, 8]]],
  ['fläche whole T3–6 then back', [[1, 3, true]], [[1, 3]]],
];
for (const [tag, mk, back] of cases) {
  for (const [tr, bar, w] of mk) await E(([tr, bar, w]) => window.SYNQUENZER.makeOwn(tr, bar, w), [tr, bar, w]);
  const mid = await E(() => { const s = window.SYNQUENZER.song(); return {l0: s.lanes[0], l1: s.lanes[1], own: Object.keys(s.own || {})}; });
  for (const [tr, bar] of back) await E(([tr, bar]) => window.SYNQUENZER.dropOwn(tr, bar), [tr, bar]);
  const S1 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
  const ok = S1 === S0;
  check(`${tag} → back → song deep-equal`, ok, ok ? '' : {mid: JSON.stringify(mid), after: JSON.stringify({l0: JSON.parse(S1).lanes[0], l1: JSON.parse(S1).lanes[1], own: JSON.parse(S1).own ? Object.keys(JSON.parse(S1).own) : null})});
  // reset
  await E(s => { window.SYNQUENZER.setSong(JSON.parse(s)); return 1; }, S0);
}
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
