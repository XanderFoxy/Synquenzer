// how often is the MS 2000 panel (and the whole synth editor) built when the editor opens / closes?
import {open, sleep, OUT} from './v3-qa-gmk1-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); }); await sleep(300);
await E(() => { SYNQUENZER.openEditor(); }); await sleep(600); await E(() => SYNQUENZER.closeEditor()); await sleep(600);   // first build loads the block
await E(() => { window.__nb = 0; window.__tb = 0; const b = MKUI.build; MKUI.build = function () { const t = performance.now(); window.__nb++; const r = b.apply(this, arguments); window.__tb += performance.now() - t; return r; }; });
// the patched MKUI.build is what buildSynthEd calls (MKUI.build(pg, i))
const t0 = await E(() => performance.now());
await E(() => { SYNQUENZER.openEditor(); }); await sleep(800);
const a = await E(() => [window.__nb, +window.__tb.toFixed(1)]);
await E(() => { window.__nb = 0; window.__tb = 0; SYNQUENZER.closeEditor(); }); await sleep(800);
const b = await E(() => [window.__nb, +window.__tb.toFixed(1)]);
const lt = await E(() => new Promise(r => { const out = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) out.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} SYNQUENZER.openEditor(); setTimeout(() => r(out), 800); }));
console.log(L ? 'L' : 'P', 'open: panel builds', a[0], 'ms', a[1], '| close: panel builds', b[0], 'ms', b[1], '| longtasks on open', JSON.stringify(lt), 'sheet', await E(() => document.getElementById('synthSheet').className));
await T.br.close();
