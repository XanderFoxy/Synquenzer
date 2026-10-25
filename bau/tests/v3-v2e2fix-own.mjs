// V2e′-fix: own clips – [Ganzer Block] from an own clip, [Zurück] on pieces, no dangling refs, undo, normalize roundtrip
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const E = (f, a) => p.evaluate(f, a);
const dangling = () => E(() => { const s = window.SYNQUENZER.song(); const bad = []; s.lanes.forEach((l, t) => l.forEach(e => { if (e.own && !(s.own && s.own[e.own])) bad.push(t + '@' + e.bar); })); return bad; });
await E(SETUP55(true));
const S0 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
// 1 (a) own at T5, edit it, then [Ganzer Block] from the own clip → block T3–6 (bars 2..5) with the edit kept at T5 only
await E(() => window.SYNQUENZER.makeOwn(0, 4));
await E(() => { const s = S.song, id = laneOriginAt(s.lanes[0], 4).own; s.own[id].notes.push({t: 1, d: .5, n: 70, v: .8}); return id; });
const id2 = await E(() => window.SYNQUENZER.makeOwn(0, 4, true));
const r1 = await E(() => { const s = window.SYNQUENZER.song(); const o = s.own[s.lanes[0].find(e => e.own).own]; return {lane: s.lanes[0], len: o.len, n70: o.notes.filter(n => n.n === 70).map(n => n.t), n: o.notes.length}; });
check('whole from own (a): one clip T3–6, len 4', r1.len === 4 && r1.lane[0].bar === 2 && r1.lane[0].own, r1);
check('edited note kept, only in T5 (t=9)', JSON.stringify(r1.n70) === '[9]' && r1.n === 9, r1);
await E(() => window.SYNQUENZER.dropOwn(0, 3));
check('[Zurück] → deep-equal to start', await E(() => JSON.stringify(window.SYNQUENZER.song())) === S0);
check('no dangling', (await dangling()).length === 0);
// undo twice → back to (a) with the edit? undo of drop then of whole
await E(() => { window.SYNQUENZER.undo(); }); const u1 = await E(() => window.SYNQUENZER.song().lanes[0]);
check('undo of [Zurück] restores the whole-block clip', u1.some(e => e.own && e.bar === 2), u1);
await E(() => { window.SYNQUENZER.undo(); }); const u2 = await E(() => window.SYNQUENZER.song().lanes[0]);
check('undo of [Ganzer Block] restores (a)', JSON.stringify(u2.map(e => [e.bar, e.slot, !!e.own])) === JSON.stringify([[2, 0, false], [4, 0, true], [5, 0, false], [6, -1, false], [7, 2, false]]), u2);
// 2 normalize roundtrip keeps prev / cs
const nr = await E(() => { const p0 = JSON.parse(serializeProject()); const n = normalizeProject(JSON.parse(JSON.stringify(p0))); const pr = n.project || n; const a = Object.values(p0.song.own)[0].from, c = Object.values(pr.song.own)[0].from; return {a, c}; });
check('normalize keeps from.prev and from.cs', JSON.stringify(nr.a) === JSON.stringify(nr.c) && nr.c.prev && nr.c.cs != null, nr);
// 3 long block: pieces dropped in both orders → deep-equal start
for (const order of [[17, 3], [3, 17]]) {
  await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setClip(0, 0, {len: 3, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: 1, n: 45, v: .8}, {t: 4, d: 1, n: 47, v: .8}, {t: 8, d: 1, n: 48, v: .8}]}); Q.setSong({bars: 22, lanes: [[{bar: 0, slot: 0}, {bar: 20, slot: -1}], [], [], [], [], []]}); });
  const L0 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
  await E(() => window.SYNQUENZER.makeOwn(0, 3, true));
  for (const x of order) await E(x => window.SYNQUENZER.dropOwn(0, x), x);
  const L1 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
  check('pieces dropped in order ' + order + ' → deep-equal start', L1 === L0, L1 === L0 ? '' : L1.slice(0, 300));
  check('no dangling ' + order, (await dangling()).length === 0);
}
// 4 own on T18 (piece 2 region) after dropping piece 2, then whole from there: block = T1–20 again
await E(() => window.SYNQUENZER.makeOwn(0, 3, true)); await E(() => window.SYNQUENZER.dropOwn(0, 17));
await E(() => window.SYNQUENZER.makeOwn(0, 18)); await E(() => window.SYNQUENZER.makeOwn(0, 18, true));
const r4 = await E(() => { const s = window.SYNQUENZER.song(); return {lane: s.lanes[0], own: Object.fromEntries(Object.entries(s.own).map(([k, v]) => [k, v.len]))}; });
check('whole from an own in a mixed block → pieces 16 + 4 from T1', JSON.stringify(r4.lane.map(e => [e.bar, !!e.own])) === '[[0,true],[16,true],[20,false]]' && Object.values(r4.own).sort((a, b) => a - b).join() === '4,16', r4);
// 5 legacy own (no prev/cs): piece 2 drop still gives the scene clip
await E(() => { const s = S.song; for (const k in s.own) { delete s.own[k].from.prev; delete s.own[k].from.cs; } });
await E(() => window.SYNQUENZER.dropOwn(0, 17));
const r5 = await E(() => window.SYNQUENZER.song().lanes[0]);
check('legacy piece-2 drop → the scene clip plays at T17', r5.some(e => e.bar === 16 && !e.own && e.slot === 0), r5);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
