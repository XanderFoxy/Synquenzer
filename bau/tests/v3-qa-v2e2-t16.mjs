// QA V2e′ t16: PE1 in glass with 8 tracks, dense clips (≥ 160 notes per tile), song playing + finger scrolling + drag ghost
import { openVp, T, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
const nt = await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); while (Q.NT() < 8 && Q.addTrack) Q.addTrack(); return Q.NT(); });
console.log('tracks', nt);
await E(() => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'};
  for (let tr = 0; tr < Q.NT(); tr++) for (let s = 0; s < 4; s++) { const notes = []; for (let k = 0; k < 64 * 4; k++) notes.push({t: k * .0625, d: .06, n: 48 + ((k * 7 + tr * 3 + s) % 24), v: .5}); try { Q.setClip(tr, s, {len: 4, key: K, notes}); } catch (e) {} }
  const lanes = []; for (let tr = 0; tr < Q.NT(); tr++) { const l = []; for (let bb = 0; bb < 64; bb += 4) l.push({bar: bb, slot: (bb / 4 + tr) % 4, re: 1}); lanes.push(l); }
  Q.setSong({bars: 64, lanes, carrier: [{beat: 0, target: null}], marks: []}); Q.setBpm(130); return 1; });
await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
await E(() => window.SYNQUENZER.songViewMode('glass')); await sleep(300);
const inf = await t.info(); console.log('rows', inf.rows.length, 'tiles', inf.tiles.length, 'max n', Math.max(...inf.tiles.map(x => x.n)));
await E(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); return 1; });
await E(() => window.SYNQUENZER.songPlay(0));
const meas = () => E(() => new Promise(res => { const fr = []; let last = performance.now(); const t0 = last; const f = () => { const n = performance.now(); fr.push(n - last); last = n; if (n - t0 < 3000) requestAnimationFrame(f); else res({fps: +(fr.length / ((n - t0) / 1000)).toFixed(1), worst: +Math.max(...fr).toFixed(1), p95: +fr.slice().sort((a, b) => a - b)[Math.floor(fr.length * .95)].toFixed(1)}); }; requestAnimationFrame(f); }));
const m1 = await meas(); console.log('playing, glass', m1);
// finger scroll back and forth while measuring
const cv = inf.canvas, yy = cv.y + cv.h * .4;
const mP = meas();
for (let k = 0; k < 3; k++) { await t.down(cv.x + cv.w - 20, yy); await t.glide(cv.x + cv.w - 20, yy, cv.x + 20, yy, 20, 16); await t.up(); await sleep(150); }
const m2 = await mP; console.log('playing + scroll, glass', m2);
const lt = await E(() => window.__lt.slice()); console.log('longtasks', lt);
check(`${VP} PE1 glass 8 tracks dense, playing: ≥ 55 fps`, m1.fps >= 55, m1);
check(`${VP} PE1 glass 8 tracks dense, playing + scroll: ≥ 55 fps`, m2.fps >= 55, m2);
check(`${VP} no longtask > 50 ms`, !lt.some(x => x > 50), lt);
await E(() => window.SYNQUENZER.songPlay(false));
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
