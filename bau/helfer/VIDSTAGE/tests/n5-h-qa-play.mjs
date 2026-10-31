// QA VC2a: playback without gestures (song + scenes) -> only ctx events, no data events; IDB writes at most every 2 s
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1', {wait: 2500, init: () => {
  window.__puts = [];
  const o = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (v, k) { if (typeof k === 'string' && k.startsWith('hist2:')) window.__puts.push(performance.now()); return o.call(this, v, k); };
}});
const t = T(p, cdp), E = t.E;
await E(() => { SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); SYNQUENZER.setBpm(140); });
await sleep(2600); await E(() => historyCheck()); await sleep(300);
const n0 = await t.evN();
await E(() => { window.__puts.length = 0; });
// song playback via the transport (SONG mode if the demo has a song) for 30 s
const r0 = await E(() => ({song: !!(S.song && S.song.bars), parts: (S.parts || []).filter(Boolean).length}));
console.log('demo', JSON.stringify(r0));
await E(() => { const Q = SYNQUENZER; Q.play(); });
await sleep(30000);
await E(() => SYNQUENZER.stop()); await sleep(2600);
await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0);
const ctx = evs.filter(e => e.u === 'ctx'), data = evs.filter(e => e.u !== 'ctx');
console.log('ctx', ctx.length, ctx.map(e => e.z.c).join(','));
console.log('data', data.length, JSON.stringify(data.map(e => e.u + ':' + (e.d || []).map(o => o.op[0] + ' ' + o.path).slice(0, 4).join(' '))));
const puts = await E(() => window.__puts.slice());
const gaps = puts.slice(1).map((x, i) => Math.round(x - puts[i]));
console.log('hist puts', puts.length, 'min gap ms', gaps.length ? Math.min(...gaps) : null, JSON.stringify(gaps));
console.log('check', JSON.stringify(await E(() => historyCheck({detail: true}))));
console.log('errors', JSON.stringify(errs.slice(0, 4)));
await b.close();
