// QA V2e′ t21: [Ganzer Block] on an existing own clip (hold sheet of an own clip) → orphaned own clips?
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(true)); await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const cellXY = (tr, bar) => E(([tr, bar]) => { const I = window.SYNQUENZER.svLayoutInfo(); const r = SV.rows.indexOf(tr); return {x: I.canvas.x + bar * I.cellW - I.x0 + I.cellW / 2, y: I.canvas.y + I.rulerH + r * I.rowH + I.rowH / 2}; }, [tr, bar]);
const hold = async (x, y) => { await t.down(x, y); await sleep(560); await t.up(); await sleep(300); };
const S0 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
// (a) own clip Synth 1 T5 (bar 4)
let c = await cellXY(0, 4); await hold(c.x, c.y); await t.tapPop('Eigener Clip'); await sleep(300);
// then hold the own clip → sheet → [Ganzer Block]
c = await cellXY(0, 4); await hold(c.x, c.y);
console.log('own sheet', await t.popBtns(), await E(() => (document.querySelector('#popLayer .pop [data-a="whole"] small') || {}).textContent));
await t.tapPop('Ganzer Block'); await sleep(300);
const s = await E(() => window.SYNQUENZER.song());
const refs = {}; for (const l of s.lanes) for (const e of l) if (e.own) refs[e.own] = (refs[e.own] || 0) + 1;
const orphans = Object.keys(s.own || {}).filter(k => !refs[k]);
console.log('lane0', JSON.stringify(s.lanes[0]), 'own keys', Object.keys(s.own || {}), 'orphans', orphans);
check(`${VP} no orphaned own clip after [Ganzer Block] on an own clip`, orphans.length === 0, orphans);
// [Zurück] on it → back to the reference state?
c = await cellXY(0, 4); await hold(c.x, c.y); await t.tapPop('Zurück zum Szenen-Clip'); await sleep(300);
const s2 = await E(() => window.SYNQUENZER.song());
console.log('after back', JSON.stringify(s2.lanes[0]), Object.keys(s2.own || {}));
check(`${VP} after [Zurück] the bass lane plays the scene clip in T3–T6 again`, JSON.stringify(s2.lanes[0]) === JSON.stringify(JSON.parse(S0).lanes[0]), [s2.lanes[0], JSON.parse(S0).lanes[0]]);
// what plays in T5 now? (noteLog), the cell look, MIDI export, glass
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(480); Q.clearLog(); Q.songPlay(0); return 1; });
await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 26, null, {timeout: 20000, polling: 5});
const lg = await E(() => { const Q = window.SYNQUENZER; Q.songPlay(false); return Q.noteLog(300).filter(x => x.track === 0).map(x => +x.beat.toFixed(1) + ':' + x.out + ':' + x.src); });
console.log('bass log', lg.join(' '));
const t5 = lg.filter(x => { const b = +x.split(':')[0]; return b >= 16 && b < 20; });
check(`${VP} T5 still sounds the bass (scene clip) after [Zurück]`, t5.length === 2, t5);
const cs = await E(() => window.SYNQUENZER.ownClip(0, 4));
console.log('ownClip(0,4)', JSON.stringify(cs));
// save → load roundtrip
const rt = await E(async () => { const Q = window.SYNQUENZER; const pr = Q.project(); const j = JSON.stringify(pr.project || pr); return j.includes('"own":"o1"'); });
console.log('project still references o1:', rt);
check(`${VP} no dangling own-clip reference in project()`, !rt);
// a new own clip elsewhere (Fläche, track 1, T3) gets the free id o1 → does the bass in T5 now play it?
c = await cellXY(1, 2); await hold(c.x, c.y); await t.tapPop('Eigener Clip'); await sleep(300);
const s3 = await E(() => window.SYNQUENZER.song());
console.log('own keys now', Object.keys(s3.own), 'bass lane', JSON.stringify(s3.lanes[0]), 'fläche lane', JSON.stringify(s3.lanes[1]));
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(480); Q.clearLog(); Q.songPlay(0); return 1; });
await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 26, null, {timeout: 20000, polling: 5});
const lg2 = await E(() => { const Q = window.SYNQUENZER; Q.songPlay(false); return Q.noteLog(300).filter(x => x.track === 0).map(x => +x.beat.toFixed(1) + ':' + x.clipNote + ':' + x.src); });
console.log('bass log after new own clip on Fläche', lg2.join(' '));
const t5b = lg2.filter(x => { const b = +x.split(':')[0]; return b >= 16 && b < 20; });
check(`${VP} bass T5 unaffected by a new own clip on another track`, JSON.stringify(t5b.map(x => x.split(':').slice(1).join(':'))) === JSON.stringify(['45:clip', '45:clip']), t5b);
// the bass cell T5 now shows/edits the Fläche's own clip?
const oa = await E(() => ({cellOwn: svCellOwnAt(0, 4), api: window.SYNQUENZER.ownClip(0, 4)}));
console.log('bass T5 own?', JSON.stringify(oa).slice(0, 200));
await E(() => window.SYNQUENZER.songViewMode('glass')); await sleep(250);
const tl = await E(() => window.SYNQUENZER.svLayoutInfo().tiles.filter(x => x.t === 0 && x.a <= 4 && x.b > 4));
console.log('glass bass tile at T5', JSON.stringify(tl));
await p.screenshot({path: 'v3-qa-v2e2-t21-glass.png'});
await E(() => window.SYNQUENZER.songViewMode('squares')); await sleep(250);
c = await cellXY(0, 4); await t.tap(c.x, c.y, 500);
const ro = await E(() => { const r = window.SYNQUENZER.roll(); return r ? {own: r.own, title: (document.querySelector('#rollSheet .sh-title') || {}).textContent, info: (document.querySelector('#rollSheet .rinfo') || {}).textContent} : null; });
console.log('tap bass T5 →', JSON.stringify(ro));
check(`${VP} tap on the bass T5 (a plain reference after [Zurück]) does not open ROLLE on another track's own clip`, !ro || !ro.own, ro);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
