// VV1-05: 3-min song 9:16 with WebCodecs faster than real time; long tasks while rendering; cancel ≤ 300 ms
import { open } from './n5-v-lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
const res = {};
await p.evaluate(() => {
  const bars = Math.ceil(180 / (4 * 60 / S.bpm)), lanes = [[], [], [], [], [], []], marks = [];
  for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[2].push({bar: k + 2, slot: 0}, {bar: k + 6, slot: -1}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: k % 16 ? 'Refrain' : 'Strophe'}); }
  SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks});
  window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: Math.round(e.startTime), d: Math.round(e.duration)}); }).observe({type: 'longtask', buffered: false});
});
res.song = await p.evaluate(() => ({bars: S.song.bars, sec: +(S.song.bars * 4 * 60 / S.bpm).toFixed(1), load: null}));
for (const fmt of ['9:16']) {
  const m = await p.evaluate(async fmt => { SYNQUENZER.vvTest({opus: true}); window.__lt = []; const t0 = performance.now(); window.__t0 = t0; const x = await SYNQUENZER.vvMake({fmt, view: 'auto'}); return Object.assign(x, {wall: Math.round(performance.now() - t0), lt: window.__lt.map(e => ({at: e.t - Math.round(t0), d: e.d}))}); }, fmt);
  const lt = m.lt.filter(e => e.at >= 0);
  res['05-' + fmt] = {how: m.how, dur: +m.dur.toFixed(2), wallMs: m.wall, msAudio: m.msAudio, x: +(m.dur * 1000 / m.wall).toFixed(2), size: m.size, longTasks: lt.length, longest: lt.length ? Math.max(...lt.map(e => e.d)) : 0, lt: lt.slice(0, 20), ok: m.wall < m.dur * 1000};
}
// cancel: start a job, cancel after 3 s → it ends ≤ 300 ms later, the live engine is back
{
  const c = await p.evaluate(async () => {
    const pr = SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); let tEnd = null, err = null; pr.then(() => { tEnd = performance.now(); }, e => { err = String(e && e.message); tEnd = performance.now(); });
    await new Promise(r => setTimeout(r, 3000)); const tc = performance.now(); SYNQUENZER.vvCancel();
    await new Promise(r => { const iv = setInterval(() => { if (tEnd) { clearInterval(iv); r(); } }, 5); });
    return {err, ms: Math.round(tEnd - tc), live: AU.ctx instanceof AudioContext, timer: !!AU.timer, off: !!VV.off, busy: VV.busy, uiOff: !!UI.vvOff};
  });
  // and once during the offline audio pass (sequential recorder path: the first 25 %)
  const c2 = await p.evaluate(async () => {
    SYNQUENZER.vvTest({noVE: true}); const pr = SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); let tEnd = null, err = null; pr.then(() => { tEnd = performance.now(); }, e => { err = String(e && e.message); tEnd = performance.now(); });
    await new Promise(r => setTimeout(r, 2000)); const wasOff = !!VV.off, tc = performance.now(); SYNQUENZER.vvCancel();
    await new Promise(r => { const iv = setInterval(() => { if (tEnd) { clearInterval(iv); r(); } }, 5); });
    const ok2 = await SYNQUENZER.vvRender({range: {a: 0, b: 1}}).then(x => x.dur > 0, e => String(e));
    return {wasOff, err, ms: Math.round(tEnd - tc), live: AU.ctx instanceof AudioContext, timer: !!AU.timer, off: !!VV.off, renderAfter: ok2};
  });
  res['05-cancel'] = {pipeline: c, offlinePass: c2, ok: c.err === 'abgebrochen' && c.ms <= 300 && c.live && !c.off && c2.err === 'abgebrochen' && c2.ms <= 300 && c2.live && c2.renderAfter === true};
}
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync('n5-v-out/a5.json', JSON.stringify(res, null, 1));
await b.close();
