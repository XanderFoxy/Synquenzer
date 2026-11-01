// QA K1: main-thread cost of ⋯ -> Modulationen while the song plays (longtasks, late notes) vs. ⋯ alone (base has no list)
import {open, sleep} from './n5-k-qa-lib.mjs';
const FILE = process.env.F, TAG = FILE ? 'base' : 'K';
const T = await open({vp: [390, 844], file: FILE}); const {p, E} = T;
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']});
  window.__late = []; const o = window.logNote; window.logNote = function (e) { const r = o.apply(this, arguments); try { if (e && e.time != null) { const d = e.time - AU.ctx.currentTime; if (d < 0.003) window.__late.push(+(d * 1000).toFixed(1)); } } catch (_) {} return r; }; });
const th = (await T.find('.th', /^SYNTH 3/i))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 1000);
await E(() => SYNQUENZER.launchScene(0)); await sleep(1500);
await E(() => { window.__lt.length = 0; window.__late.length = 0; });
const times = [];
for (let k = 0; k < 10; k++) {
  const m = (await T.find('#synthSheet .edm'))[0]; const t0 = Date.now(); await T.tap(m.cx, m.cy, 300);
  if (TAG === 'K') { const mi = (await T.find('.pop button', /^Modulationen/))[0]; await T.tap(mi.cx, mi.cy, 300); }
  times.push(Date.now() - t0); await E(() => { try { closePop(); } catch (e) {} }); await sleep(400);
}
const r = await E(() => ({lt: window.__lt.slice(), late: window.__late.slice(), notes: 0}));
console.log(TAG, 'longtasks', JSON.stringify(r.lt), 'late', JSON.stringify(r.late));
// per-call cost of the list (JS only)
console.log(TAG, 'cost', JSON.stringify(await E(() => { if (!window.openK1Mods && typeof openK1Mods === 'undefined') return null; const t0 = performance.now(); for (let k = 0; k < 50; k++) k1Mods(2); const t1 = performance.now(); return {k1ModsMs: +((t1 - t0) / 50).toFixed(3)}; })));
await E(() => SYNQUENZER.stop());
console.log('errors', JSON.stringify(T.errs.slice(0, 3)));
await T.b.close();
