// QA V2e t10: song from a chain of scenes (Kette aus Szenen) → marks „Szene n“ must not show ′ right after creation
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(false));
await E(() => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 4}, {scene: 2, bars: 2}]); Q.songView(true); });
await p.waitForTimeout(400);
const s = await E(() => window.SYNQUENZER.song());
const i = await T.info();
console.log('marks', JSON.stringify(s.marks), 'labels', JSON.stringify(i.marks.map(m => m.label)));
console.log('songMarks dev', JSON.stringify(await E(() => window.SYNQUENZER.songMarks())));
check('Kette aus Szenen → Marken „Szene n“ ohne ′ (unverändert)', i.marks.length === 3 && i.marks.every(m => !/′/.test(m.label)), i.marks.map(m => m.label));
await b.close();
process.exit(done() ? 1 : 0);
