// QA V2e′ t14: [Ganzer Block] on a 20-bar block (16-bar pieces), then [Zurück zum Szenen-Clip] on each piece
import { openVp, T, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}, {t: 2, d: .5, n: 52, v: .8}]});
  Q.setSong({bars: 22, lanes: [[{bar: 0, slot: 0}, {bar: 20, slot: -1}], [], [], [], [], []], carrier: [{beat: 0, target: null}], marks: []});
  Q.setBpm(240); return 1; });
await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const S0 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
const C0 = await t.clips();
const STATES = () => E(() => { const s = window.SYNQUENZER.song(); const out = []; for (let bb = 0; bb < s.bars; bb++) { let x = -1; for (const e of s.lanes[0]) { if (e.bar > bb) break; x = e.own ? e.own : e.slot; } out.push(x); } return out.join(','); });
const st0 = await STATES(); console.log('states0', st0);
const cellXY = (tr, bar) => E(([tr, bar]) => { const I = window.SYNQUENZER.svLayoutInfo(); const r = SV.rows.indexOf(tr); return {x: I.canvas.x + bar * I.cellW - I.x0 + I.cellW / 2, y: I.canvas.y + I.rulerH + r * I.rowH + I.rowH / 2}; }, [tr, bar]);
const hold = async (x, y) => { await t.down(x, y); await sleep(560); await t.up(); await sleep(300); };
let c = await cellXY(0, 3); await hold(c.x, c.y);
console.log('sheet', await t.popBtns());
await t.tapPop('Ganzer Block'); await sleep(300);
const lane = await E(() => window.SYNQUENZER.song().lanes[0]);
const own = await E(() => { const s = window.SYNQUENZER.song(); return Object.fromEntries(Object.entries(s.own || {}).map(([k, v]) => [k, {len: v.len, n: v.notes.length}])); });
console.log('lane after whole', JSON.stringify(lane), JSON.stringify(own));
check(`${VP} 9.2 [Ganzer Block] 20 bars → 16-bar pieces (16 + 4)`, Object.values(own).map(x => x.len).join(',') === '16,4', own);
check(`${VP} notes per piece = 2 per bar`, Object.values(own).every(x => x.n === x.len * 2), own);
check(`${VP} scene clips deep-equal`, (await t.clips()) === C0);
// play log: bars 0..19 the same notes as before (one per 2 beats)
const st1 = await STATES(); console.log('states after whole', st1);
// [Zurück zum Szenen-Clip] on bar 17 (second piece) via hold sheet
await E(() => { SV.x = 12 * 36; UI.dirty.song = true; return 1; }); await sleep(200);
c = await cellXY(0, 17); await hold(c.x, c.y);
console.log('sheet own', await t.popBtns());
await t.tapPop('Zurück zum Szenen-Clip'); await sleep(300);
const st2 = await STATES(); console.log('states after back(17)', st2);
const exp2 = st1.split(',').map((x, i) => (i >= 16 && i < 20 ? '0' : x)).join(',');
check(`${VP} [Zurück] on the 2nd piece → bars 17–20 play the scene clip again (reference), first piece untouched`, st2 === exp2, {got: st2, exp: exp2});
// back on the first piece too → original
await E(() => { SV.x = 0; UI.dirty.song = true; return 1; }); await sleep(200);
c = await cellXY(0, 3); await hold(c.x, c.y);
await t.tapPop('Zurück zum Szenen-Clip'); await sleep(300);
const S2 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
console.log('lane end', JSON.stringify(JSON.parse(S2).lanes[0]), 'own', JSON.stringify(JSON.parse(S2).own));
check(`${VP} both pieces back → song deep-equal to the start`, S2 === S0, S2 === S0 ? '' : 'differs');
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
