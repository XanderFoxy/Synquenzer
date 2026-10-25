// QA V2e′ t30: fps while dragging with edge scrolling (glass, 8 tracks, song playing), P1
import { openVp, T, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); while (Q.NT() < 8) Q.addTrack(); const K = {root: 9, scale: 'aeolian'};
  for (let tr = 0; tr < 8; tr++) for (let s = 0; s < 4; s++) { const notes = []; for (let k = 0; k < 64; k++) notes.push({t: k * .25, d: .2, n: 48 + ((k * 5 + tr * 3 + s) % 24), v: .5}); try { Q.setClip(tr, s, {len: 4, key: K, notes}); } catch (e) {} }
  const lanes = []; for (let tr = 0; tr < 8; tr++) { const l = []; for (let bb = 0; bb < 48; bb += 4) l.push({bar: bb, slot: (bb / 4 + tr) % 4, re: 1}); lanes.push(l); }
  Q.setSong({bars: 48, lanes, carrier: [{beat: 0, target: null}], marks: [{id: 'M1', a: 0, len: 8, part: 'P1'}]});
  Q.setPart(0, {name: 'Strophe', lanes: Array.from({length: 8}, (_, tr) => [{bar: 0, slot: tr % 4}]), chords: null, src: 'fang', len: 8});
  Q.setBpm(120); return 1; });
await E(() => window.SYNQUENZER.songView(true)); await E(() => window.SYNQUENZER.songViewMode('glass')); await sleep(200);
await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
await E(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); return 1; });
await E(() => window.SYNQUENZER.songPlay(0)); await sleep(500);
await E(() => { window.__lt = []; return 1; });
const k = await t.key(0);
await t.down(k.x, k.y); await sleep(1120);
const inf = await t.info();
const yy = inf.canvas.y + inf.canvas.h * .5;
await t.glide(k.x, k.y, inf.canvas.x + inf.canvas.w - 8, yy, 8, 16);
const m = await E(() => new Promise(res => { const fr = []; let last = performance.now(); const t0 = last; const f = () => { const n = performance.now(); fr.push(n - last); last = n; if (n - t0 < 2500) requestAnimationFrame(f); else res({fps: +(fr.length / ((n - t0) / 1000)).toFixed(1), worst: +Math.max(...fr).toFixed(1)}); }; requestAnimationFrame(f); }));
console.log('drag + edge scroll (glass, 8 tracks, playing)', m, 'longtasks', await E(() => window.__lt));
check(`${VP} ≥ 55 fps while dragging with edge scrolling`, m.fps >= 55, m);
await t.up(); await sleep(300);
await E(() => window.SYNQUENZER.songPlay(false));
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
