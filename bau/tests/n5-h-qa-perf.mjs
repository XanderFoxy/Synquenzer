// QA VC2a-05 on a LARGE project: recorder step times (drain per gesture, sweep, keyframe) and longtasks while playing
import { chromium } from 'playwright';
const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
await p.goto('file://' + APP); await p.waitForTimeout(2500);
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  // build a large project: all tracks, 8 scenes, 4-bar clips with 96 notes, two MS 2000 tracks, song 64 bars
  Q.addTrack(); Q.addTrack();
  for (const t of [0, 2]) Q.setEngine(t, 'mk');
  for (let t = 0; t < NT(); t++) for (let s = 0; s < NS(); s++) {
    if (t === DRUM_T) { const notes = []; for (let i = 0; i < 64; i++) notes.push({n: [36, 38, 42, 46][i % 4], t: i * 0.25, d: .1, v: .8}); Q.setClip(t, s, {len: 4, notes}); continue; }
    if (S.tracks[t].kind !== 'synth') continue;
    const notes = []; for (let i = 0; i < 96; i++) notes.push({n: 48 + ((i * 7 + t * 3 + s) % 30), t: +((i / 6) % 16).toFixed(3), d: .2, v: .5 + (i % 5) / 10});
    Q.setClip(t, s, {len: 4, notes});
  }
  Q.songFromChain([0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7].map(s => ({scene: s % NS(), bars: 4})));
  await sl(3000); await historyCheck();
  const size = serializeProject().length;
  // instrument recorder steps
  const T = {drain: [], timer: [], kf: [], sweep: [], cap: []}; window.__iv = [];
  const w = (n, arr) => { const f = window[n]; window[n] = function () { const a = performance.now(); const x = f.apply(this, arguments); const e = performance.now(); arr.push(e - a); window.__iv.push([a, e, n]); return x; }; };
  w('histDrain', T.drain); w('histTimer', T.timer); w('histKeyframe', T.kf); w('histSweep', T.sweep); w('histCapture', T.cap);
  // direct cost of one keyframe and one full sweep on this project
  let a = performance.now(); histKeyframe('n'); const kf1 = performance.now() - a;
  a = performance.now(); serializeProject(); const ser = performance.now() - a;
  a = performance.now(); const ops = []; HIST.cache.clear(); histFullOps(ops); const sweepCold = performance.now() - a;
  a = performance.now(); histFullOps([]); const sweepWarm = performance.now() - a;
  T.kf.length = 0; T.sweep.length = 0;
  // play + gestures for 20 s, enough events for a keyframe (every 200)
  Q.launchScene(0); await sl(800);
  window.__lt.length = 0; const t0 = performance.now(); let g = 0;
  const fr = []; let w0 = performance.now(), wn = 0, on = true;
  const raf = () => { const n = performance.now(); wn++; if (n - w0 >= 1000) { fr.push(wn * 1000 / (n - w0)); w0 = n; wn = 0; } if (on) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  while (performance.now() - t0 < 20000) {
    const t = g % 6, s = (g >> 3) % NS();
    if (S.tracks[t].kind === 'synth') { const c = Q.getClip(t, s); c.notes = c.notes.slice(); c.notes[g % c.notes.length] = Object.assign({}, c.notes[g % c.notes.length], {v: .3 + (g % 7) / 10}); Q.setClip(t, s, c); }
    g++;
    const snd = Q.getSound(1); snd.p.cutoff = 300 + (g * 97) % 7000; Q.setSound(1, snd); g++;
    if (g % 10 === 0) { Q.setBpm(100 + (g % 30)); }
    await sl(60);
  }
  on = false; const dt = performance.now() - t0;
  await sl(2600); Q.stop(); await sl(500);
  const lt = window.__lt.filter(x => x[0] >= t0);
  const srt = x => x.slice().sort((a, b) => a - b), q = (x, f) => x.length ? +srt(x)[Math.min(x.length - 1, Math.floor(x.length * f))].toFixed(2) : null;
  const ltRec = lt.filter(x => x[1] > 50).map(x => ({dur: Math.round(x[1]), rec: window.__iv.filter(([a, e]) => a >= x[0] - 1 && e <= x[0] + x[1] + 1).map(([a, e, n]) => n + ' ' + (e - a).toFixed(1))}));
  return {projBytes: size, kf1: +kf1.toFixed(1), ser: +ser.toFixed(1), sweepCold: +sweepCold.toFixed(1), sweepWarm: +sweepWarm.toFixed(1), gestures: g, sec: +(dt / 1000).toFixed(1),
    capMed: q(T.cap, .5), capMax: q(T.cap, 1), drainMed: q(T.drain, .5), drainP95: q(T.drain, .95), drainMax: q(T.drain, 1), drainN: T.drain.length,
    timerMax: q(T.timer, 1), sweepMax: q(T.sweep, 1), kfMax: q(T.kf, 1), kfN: T.kf.length, fpsMed: q(fr, .5), fpsMin: q(fr, 0),
    lt50: lt.filter(x => x[1] > 50).map(x => Math.round(x[1])), ltRec, check: await historyCheck(), hist: Q.history()};
});
console.log(JSON.stringify(r, null, 1));
console.log('errors', JSON.stringify(errs.slice(0, 4)));
await b.close();
