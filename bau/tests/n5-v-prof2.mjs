import { open, SONG8 } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async (song) => {
  const A = SYNQUENZER; A.setSong(song);
  const out = {}; const rr = await vvRenderAudio();
  const W = 1080, H = 1920, view = 'matrix';
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', {alpha: false});
  async function run(nEnc, N, cfgx) {
    const encs = [], descs = [];
    for (let k = 0; k < nEnc; k++) { const ve = new VideoEncoder({output: (c, m) => { if (m && m.decoderConfig && m.decoderConfig.description) descs[k] = Array.from(new Uint8Array(m.decoderConfig.description)).join(','); }, error: e => console.log(e)});
      ve.configure(Object.assign({codec: 'avc1.640028', width: W, height: H, bitrate: 5e6, framerate: 30, avc: {format: 'avc'}}, cfgx || {})); encs.push(ve); }
    const t = performance.now();
    for (let f = 0; f < N; f++) {
      const ve = encs[Math.floor(f * nEnc / N)];
      vvDraw(g, W, H, view, vvStateAt(rr, f / 30)); const fr = new VideoFrame(cv, {timestamp: f * 33333}); ve.encode(fr, {keyFrame: f % 60 === 0}); fr.close();
      while (ve.encodeQueueSize > 3) await new Promise(r => setTimeout(r, 1));
    }
    await Promise.all(encs.map(e => e.flush())); encs.forEach(e => e.close());
    return {ms: (performance.now() - t) / N, same: descs.every(d => d === descs[0])};
  }
  out.one = await run(1, 120);
  // interleaved two encoders: frames alternate blocks? (sequential fill then the other) -> try round robin by halves needs both busy: use blocks of 60
  async function run2(N, cfgx) {
    const encs = [], descs = [];
    for (let k = 0; k < 2; k++) { const ve = new VideoEncoder({output: (c, m) => { if (m && m.decoderConfig && m.decoderConfig.description) descs[k] = Array.from(new Uint8Array(m.decoderConfig.description)).join(','); }, error: e => console.log(e)});
      ve.configure(Object.assign({codec: 'avc1.640028', width: W, height: H, bitrate: 5e6, framerate: 30, avc: {format: 'avc'}}, cfgx || {})); encs.push(ve); }
    const t = performance.now(); const half = N / 2;
    for (let f = 0; f < half; f++) {
      for (let k = 0; k < 2; k++) { const ff = f + k * half; vvDraw(g, W, H, view, vvStateAt(rr, ff / 30)); const fr = new VideoFrame(cv, {timestamp: ff * 33333}); encs[k].encode(fr, {keyFrame: f % 60 === 0}); fr.close(); }
      while (encs[0].encodeQueueSize > 3 || encs[1].encodeQueueSize > 3) await new Promise(r => setTimeout(r, 1));
    }
    await Promise.all(encs.map(e => e.flush())); encs.forEach(e => e.close());
    return {ms: (performance.now() - t) / N, same: descs[0] === descs[1], d0: descs[0]};
  }
  out.two = await run2(120);
  out.oneLowBr = await run(1, 120, {bitrate: 2.5e6});
  out.oneCBR = await run(1, 120, {bitrateMode: 'constant'});
  return out;
}, SONG8);
console.log(JSON.stringify(r, null, 1)); console.log(errs);
await b.close();
