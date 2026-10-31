import { open, SONG8 } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async (song) => {
  const A = SYNQUENZER; A.setSong(song);
  const out = {};
  // audio render: with suspends (app) vs without (bare graph speed)
  let t = performance.now(); const rr = await vvRenderAudio(); out.audioApp = performance.now() - t; out.dur = rr.dur;
  for (const [W, H, view] of [[1080, 1920, 'matrix'], [1920, 1080, 'song']]) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', {alpha: false});
    t = performance.now(); for (let f = 0; f < 60; f++) vvDraw(g, W, H, view, vvStateAt(rr, f / 30)); const draw = (performance.now() - t) / 60;
    t = performance.now(); for (let f = 0; f < 30; f++) { const fr = new VideoFrame(cv, {timestamp: f}); fr.close(); } const vf = (performance.now() - t) / 30;
    // encode only
    let n = 0; const ve = new VideoEncoder({output: () => n++, error: e => console.log(e)});
    ve.configure({codec: 'avc1.640028', width: W, height: H, bitrate: 5e6, framerate: 30, avc: {format: 'avc'}});
    t = performance.now();
    for (let f = 0; f < 90; f++) { vvDraw(g, W, H, view, vvStateAt(rr, f / 30)); const fr = new VideoFrame(cv, {timestamp: f * 33333}); ve.encode(fr, {keyFrame: f % 60 === 0}); fr.close(); while (ve.encodeQueueSize > 3) await new Promise(r => setTimeout(r, 2)); }
    await ve.flush(); const enc = (performance.now() - t) / 90; ve.close();
    // realtime encode latency mode
    let ve2 = new VideoEncoder({output: () => n++, error: e => console.log(e)});
    ve2.configure({codec: 'avc1.640028', width: W, height: H, bitrate: 5e6, framerate: 30, avc: {format: 'avc'}, latencyMode: 'realtime'});
    t = performance.now();
    for (let f = 0; f < 90; f++) { vvDraw(g, W, H, view, vvStateAt(rr, f / 30)); const fr = new VideoFrame(cv, {timestamp: f * 33333}); ve2.encode(fr, {keyFrame: f % 60 === 0}); fr.close(); while (ve2.encodeQueueSize > 3) await new Promise(r => setTimeout(r, 2)); }
    await ve2.flush(); const enc2 = (performance.now() - t) / 90; ve2.close();
    out[view] = {draw, vf, enc, enc2};
  }
  out.cores = navigator.hardwareConcurrency;
  return out;
}, SONG8);
console.log(JSON.stringify(r, null, 1)); console.log(errs);
await b.close();
