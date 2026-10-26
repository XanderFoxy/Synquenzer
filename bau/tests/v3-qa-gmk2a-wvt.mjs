// timing of the wave-table slices (wvSlice / wvStep) on the main thread during playback: pick waves from the list
import {open, sleep, OUT} from './v3-qa-gmk2a-tl.mjs';
const PICK = (process.argv[2] || '64').split(',').map(Number);
const T = await open(); const {p, E, errs} = T;
await E(() => { const Q = window.__wt = {sl: [], st: [], gaps: [], marks: []};
  const os = window.wvSlice, ostep = window.wvStep;
  window.wvSlice = function () { const t = performance.now(); const r = os.apply(this, arguments); Q.sl.push([+(performance.now() - t).toFixed(1), Math.round(t)]); return r; };
  window.wvStep = function (n) { const t = performance.now(); const r = ostep.apply(this, arguments); const d = performance.now() - t; if (d > 3) Q.st.push([n, +d.toFixed(1), Math.round(t)]); return r; };
  let last = performance.now(); Q.hb = setInterval(() => { const t = performance.now(); if (t - last > 40) Q.gaps.push([Math.round(t - last), Math.round(last)]); last = t; }, 5); });
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(1, 'mk'); });
await sleep(3000);   // background single waves built in idle time
await T.tapSel('#bPlay'); await sleep(1500);
await T.openEd(1); await T.w('w1', /^3 OSZ 1/); await T.knobList('k0', /^Speicherwelle/); await sleep(1500);
const mark = n => E(n => window.__wt.marks.push([n, Math.round(performance.now())]), n);
for (const n of PICK) {
  await mark('open list'); await T.tapMk('k2', 1200);
  await E(n => { const L = document.querySelector('#popLayer .plist.mkwv'); const b = document.querySelector('#popLayer .pop button[data-v="' + n + '"]'); L.scrollTop = b.offsetTop - L.offsetTop - 100; }, n); await sleep(400);
  const r = await E(n => { const b = document.querySelector('#popLayer .pop button[data-v="' + n + '"]'); const r = b.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }, n);
  await mark('tap ' + n); await T.tap(r.cx, r.cy, 2500);
}
const Q = await E(() => { clearInterval(window.__wt.hb); return Object.assign({}, window.__wt, {info: SYNQUENZER.mkInfo()}); });
const at = t => { const m = Q.marks.filter(m => m[1] <= t + 2).pop(); return m ? m[0] + ' +' + (t - m[1]) : 'pre'; };
const sl = Q.sl.filter(x => x[0] > 8);
console.log('slices', Q.sl.length, 'max', Math.max(...Q.sl.map(x => x[0])), '> 8 ms:', JSON.stringify(sl.map(([d, t]) => [d, at(t)])));
console.log('steps > 3 ms', JSON.stringify(Q.st.map(([n, d, t]) => [n, d, at(t)])));
console.log('gaps', JSON.stringify(Q.gaps.map(([d, t]) => [d, at(t)])));
console.log('info', JSON.stringify(Q.info), 'errs', errs);
await T.br.close();
