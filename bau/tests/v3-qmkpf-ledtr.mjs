// MK-P fix: trace of 60 frames that each toggle one element (plate LED vs head button), CPU x THR; main-thread event sums per frame
import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'P1', WHO = process.argv[3] || 's5';
const b = await launch(); const page = await open(b, F, {dpr: 3}); await openMk(page); await page.waitForTimeout(800);
if (process.env.EXP) await page.evaluate(x => (0, eval)(x), process.env.EXP);
await page.evaluate(w => { window.__L = w === 'head' ? document.querySelector('.mkqh button') || document.querySelector('#synthSheet .sh-tabs .tab') : MKUI.PL.ui.led[w]; }, WHO);
if (process.env.ACT) await page.evaluate(a => { window.__ACT = a; }, process.env.ACT);
await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
await b.startTracing(page, {categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'disabled-by-default-blink.invalidation', 'disabled-by-default-devtools.timeline.invalidationTracking']});
const n = +(process.env.N || 150);
await page.evaluate(n => new Promise(r => { let k = 0; const A = window.__ACT ? new Function('k', window.__ACT) : null; const f = () => { if (A) A(k); else window.__L.classList.toggle('on'); if (++k < n) requestAnimationFrame(f); else requestAnimationFrame(() => r()); }; requestAnimationFrame(f); }), n);
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents;
const tn = new Map(); for (const e of ev) if (e.name === 'thread_name') tn.set(e.pid + ':' + e.tid, e.args.name);
const sums = new Map(), cnt = new Map();
for (const e of ev) { const th = tn.get(e.pid + ':' + e.tid); if (th !== 'CrRendererMain' || e.ph !== 'X' || !e.dur) continue; sums.set(e.name, (sums.get(e.name) || 0) + e.dur); cnt.set(e.name, (cnt.get(e.name) || 0) + 1); }
console.log(WHO, 'x' + THR, 'per frame (ms):');
console.log([...sums].sort((a, b) => b[1] - a[1]).slice(0, 26).map(([k, v]) => (v / 1000 / n).toFixed(2).padStart(7) + ' ' + String(cnt.get(k)).padStart(5) + 'x ' + k).join('\n'));
if (process.env.LAYDUMP) { const L = ev.filter(e => e.name === 'Layout' && tn.get(e.pid + ':' + e.tid) === 'CrRendererMain'); const m = new Map(); for (const e of L) { const k = JSON.stringify({d: e.args.beginData && e.args.beginData.dirtyObjects, t: e.args.beginData && e.args.beginData.totalObjects, roots: (e.args.endData && e.args.endData.layoutRoots || []).map(r => r.nodeName || r.nodeId).slice(0, 3)}); m.set(k, (m.get(k) || 0) + 1); } console.log([...m].slice(0, 10)); }
if (process.env.INVDUMP) { const m = new Map(); for (const e of ev) if (e.name === 'LayoutInvalidationTracking' && e.args && e.args.data) { const d = e.args.data, k = (d.nodeName || '') + ' | ' + (d.reason || ''); m.set(k, (m.get(k) || 0) + 1); } console.log([...m].sort((a, b) => b[1] - a[1]).slice(0, 20)); }
await b.close();
