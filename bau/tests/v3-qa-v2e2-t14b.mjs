// QA V2e′ t14b: audible consequence of the [Zurück] bug on a split whole block: an edit of piece 1 sounds in bars 17–20
import { openVp, T, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const t = T(p, cdp), E = t.E;
await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}, {t: 2, d: .5, n: 52, v: .8}]});
  Q.setSong({bars: 22, lanes: [[{bar: 0, slot: 0}, {bar: 20, slot: -1}], [], [], [], [], []], carrier: [{beat: 0, target: null}], marks: []});
  Q.setBpm(480); return 1; });
await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const cellXY = (tr, bar) => E(([tr, bar]) => { const I = window.SYNQUENZER.svLayoutInfo(); const r = SV.rows.indexOf(tr); return {x: I.canvas.x + bar * I.cellW - I.x0 + I.cellW / 2, y: I.canvas.y + I.rulerH + r * I.rowH + I.rowH / 2}; }, [tr, bar]);
const hold = async (x, y) => { await t.down(x, y); await sleep(560); await t.up(); await sleep(300); };
let c = await cellXY(0, 3); await hold(c.x, c.y); await t.tapPop('Ganzer Block'); await sleep(300);
// edit piece 1 (o1): a marker note 70 at beat 1 of its first bar (as an own-clip edit would do in ROLLE)
await E(() => { const s = S.song; s.own.o1.notes.push({t: 1, d: .25, n: 70, v: .8}); s.own.o1.notes.sort((a, b) => a.t - b.t); return 1; });
await E(() => { SV.x = 12 * 36; UI.dirty.song = true; return 1; }); await sleep(200);
c = await cellXY(0, 17); await hold(c.x, c.y); await t.tapPop('Zurück zum Szenen-Clip'); await sleep(300);
const toast = await E(() => document.getElementById('toast').textContent);
console.log('toast', toast);
await E(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); return 1; });
await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 81, null, {timeout: 30000, polling: 5});
const log = await E(() => { const Q = window.SYNQUENZER; Q.songPlay(false); return Q.noteLog(400).filter(x => x.track === 0 && x.clipNote === 70).map(x => +x.beat.toFixed(2)); });
console.log('marker note 70 at beats', log.join(' '));
check('after [Zurück] on piece 2, the edit of piece 1 sounds only in bar 1 (beat 1), not in bar 17 (beat 65)', log.length === 1 && log[0] === 1, log);
await b.close();
process.exit(done());
