// Independent repro: [Ganzer Block] on a 20-bar block, then [Zurück zum Szenen-Clip] on the 2nd 16-bar piece (touch path).
// Uses a 3-bar scene clip so the wrong o1-loop is audible even WITHOUT any edit (phase 16 mod 3 = 1 vs. o1 restarting at 0).
import { openVp, T, sleep } from './v3-qa-v2e2-lib.mjs';
const {b, p, errs, cdp} = await openVp('P1');
const t = T(p, cdp), E = t.E;
await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 3, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}, {t: 4, d: .5, n: 47, v: .8}, {t: 8, d: .5, n: 48, v: .8}]});
  Q.setSong({bars: 22, lanes: [[{bar: 0, slot: 0}, {bar: 20, slot: -1}], [], [], [], [], []], carrier: [{beat: 0, target: null}], marks: []});
  Q.setBpm(480); return 1; });
await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const playBars = async () => {
  await E(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); return 1; });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 81, null, {timeout: 40000, polling: 5});
  return E(() => { const Q = window.SYNQUENZER; Q.songPlay(false);
    const L = Q.noteLog(400).filter(x => x.track === 0 && x.beat < 80);
    return L.map(x => `${Math.floor(x.beat / 4 + 1e-6) + 1}:${x.clipNote}:${x.src}`); });
};
const fmt = a => a.filter(s => +s.split(':')[0] >= 15).join(' ');
const ref = await playBars(); console.log('REFERENCE (before any action) bars 15-20:', fmt(ref));
const cellXY = (tr, bar) => E(([tr, bar]) => { const I = window.SYNQUENZER.svLayoutInfo(); const r = SV.rows.indexOf(tr); return {x: I.canvas.x + bar * I.cellW - I.x0 + I.cellW / 2, y: I.canvas.y + I.rulerH + r * I.rowH + I.rowH / 2}; }, [tr, bar]);
const hold = async (x, y) => { await t.down(x, y); await sleep(600); await t.up(); await sleep(300); };
await E(() => { SV.x = 0; UI.dirty.song = true; return 1; }); await sleep(400);
console.log('SV.x', await E(() => SV.x));
let c = await cellXY(0, 2); console.log('cell', c); await hold(c.x, c.y);
console.log('sheet1', await t.popBtns());
await t.tapPop('Ganzer Block'); await sleep(300);
console.log('lane after [Ganzer Block]', JSON.stringify(await E(() => window.SYNQUENZER.song().lanes[0])));
const afterWhole = await playBars(); console.log('after [Ganzer Block] bars 15-20:', fmt(afterWhole));
// scroll so bar 18 is visible (via the app's own scroll state)
await E(() => { SV.x = 12 * window.SYNQUENZER.svLayoutInfo().cellW; UI.dirty.song = true; return 1; }); await sleep(250);
c = await cellXY(0, 17); await hold(c.x, c.y);
console.log('sheet2', await t.popBtns());
await t.tapPop('Zurück zum Szenen-Clip'); await sleep(300);
console.log('toast:', await E(() => document.getElementById('toast').textContent));
console.log('lane after [Zurück] on T18', JSON.stringify(await E(() => window.SYNQUENZER.song().lanes[0])), 'own ids', JSON.stringify(await E(() => Object.keys(window.SYNQUENZER.song().own || {}))));
const afterBack = await playBars(); console.log('after [Zurück] bars 15-20:', fmt(afterBack));
const seg = (a, lo, hi) => a.filter(s => { const k = +s.split(':')[0]; return k >= lo && k <= hi; }).map(s => s.split(':').slice(0, 2).join(':')).join(' ');
console.log('bars 17-20 reference :', seg(ref, 17, 20));
console.log('bars 17-20 after back:', seg(afterBack, 17, 20));
console.log('bars 1-16 identical to reference:', seg(ref, 1, 16) === seg(afterBack, 1, 16));
console.log('BUG REPRODUCED (bars 17-20 differ from reference):', seg(ref, 17, 20) !== seg(afterBack, 17, 20));
// Bearbeiten on bar 18 now opens which clip?
console.log('ownClip at bar 17 (0-based) now:', JSON.stringify(await E(() => { const o = window.SYNQUENZER.ownClip(0, 17); return o ? {id: o.id, len: o.len, from: o.from} : null; })));
console.log('errors', errs);
await b.close();
