// targeted: main-thread stalls during playback around (a) scene taps, (b) wave list open + octave wave pick, with LoAF attribution
import {open, sleep, OUT} from './v3-qa-gmk2a-tl.mjs';
import {setupProject} from './v3-qa-gmk2a-setup.mjs';
const MODE = process.argv[2] || 'mk';
const T = await open(process.argv[3] ? {file: process.argv[3]} : {}); const {p, E, errs} = T;
if (MODE === 'mk') console.log('setup', JSON.stringify(await setupProject(E)));
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.selectTrack(0); });
await T.tapSel('#bPlay'); await sleep(1500);
await E(() => { const Q = window.__st = {gaps: [], loaf: [], marks: []}; let last = performance.now(); Q.hb = setInterval(() => { const t = performance.now(); if (t - last > 40) Q.gaps.push([Math.round(t - last), Math.round(last)]); last = t; }, 5);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.duration > 40) Q.loaf.push({d: Math.round(e.duration), st: Math.round(e.startTime), block: Math.round(e.blockingDuration), render: Math.round(e.renderStart ? e.startTime + e.duration - e.renderStart : 0), style: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), scripts: e.scripts.map(s => (s.invoker || '') + ' ' + Math.round(s.duration) + 'ms ' + (s.sourceFunctionName || '') + '@' + (s.sourceCharPosition))}); }).observe({type: 'long-animation-frame', buffered: false}); } catch (e) { Q.err = String(e); } });
const mark = n => E(n => window.__st.marks.push([n, Math.round(performance.now())]), n);
for (const s of [2, 1, 2, 1]) { await mark('scene ' + s + ' tap'); await T.tapTxt('button.scn', new RegExp('^▶\\s*' + s)); await sleep(2200); }
if (MODE === 'mk') {
  await mark('open editor t1'); await T.openEd(1); await sleep(1500);
  await mark('w1 OSZ 1'); await T.w('w1', /^3 OSZ 1/); await sleep(1000);
  await mark('WELLE Speicherwelle'); await T.knobList('k0', /^Speicherwelle/); await sleep(1500);
  await mark('wave list open'); await T.tapMk('k2', 500); await sleep(1500);
  await mark('scroll+tap 64'); await E(() => { const L = document.querySelector('#popLayer .plist.mkwv'); L.scrollTop = L.scrollHeight; }); await sleep(300);
  const r = await E(() => { const b = document.querySelector('#popLayer .pop button[data-v="64"]'); const r = b.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }); await T.tap(r.cx, r.cy, 300); await sleep(2500);
  await mark('close editor'); await T.tapTxt('button', /^✕$/); await sleep(1500);
  await mark('scene 3 tap'); await T.tapTxt('button.scn', /^▶\s*3/); await sleep(2200);
}
const st = await E(() => { clearInterval(window.__st.hb); return window.__st; });
const at = t => { const m = st.marks.filter(m => m[1] <= t + 2).pop(); return m ? m[0] + ' +' + (t - m[1]) : '?'; };
console.log(MODE, 'gaps', JSON.stringify(st.gaps.map(([d, t]) => [d, at(t)])));
for (const l of st.loaf) console.log('LoAF', l.d, 'ms block', l.block, 'render', l.render, 'style', l.style, at(l.st), JSON.stringify(l.scripts.slice(0, 4)));
if (st.err) console.log(st.err);
console.log('errs', errs);
await T.br.close();
