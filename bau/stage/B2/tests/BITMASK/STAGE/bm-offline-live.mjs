// BM6-06 Offline = live (STAGE 4.31.0): Mitschnitt des Bit-Mask-Knotens per AudioWorklet (sample-genau, statt ScriptProcessor), gegen bmRender.
// Aufruf: node bm-offline-live.mjs <index.html>
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const p = await b.newPage();
await p.goto('file://'+process.argv[2]); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  ensureAudio(); const Q = SYNQUENZER, t = synthTracks()[0]; Q.setEngine(t, 'bm'); await new Promise(r => setTimeout(r, 800));
  const E = AU.synth[t], c = AU.ctx, sr = c.sampleRate;
  const src = `class Cap extends AudioWorkletProcessor { constructor(){super();this.on=true;this.port.onmessage=()=>{this.on=false;};} process(i){const x=i[0];if(this.on&&x&&x.length){const L=x[0].slice();this.port.postMessage({f:currentFrame,L},[L.buffer]);}return true;} } registerProcessor('cap7', Cap);`;
  await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
  const cap = new AudioWorkletNode(c, 'cap7', {numberOfInputs: 1, numberOfOutputs: 1, channelCount: 2, channelCountMode: 'explicit'}); const z = c.createGain(); z.gain.value = 0; cap.connect(z); z.connect(c.destination); E.node.connect(cap);
  const buf = new Float32Array(sr * 4); let f0 = -1; cap.port.onmessage = e => { if (f0 < 0) f0 = e.data.f; const o = e.data.f - f0; if (o >= 0 && o + 128 <= buf.length) buf.set(e.data.L, o); };
  await new Promise(r => setTimeout(r, 200));
  const ev = [[.1, 'on', 69, .8], [.6, 'off', 69], [.7, 'on', 64, .8], [1.2, 'off', 64]];
  const T0 = Math.ceil((c.currentTime + .1) * sr) / sr; let id = 9e8; const ids = {};
  for (const e of ev) { if (e[1] === 'on') { ids[e[2]] = ++id; E.on(id, e[2], e[3], T0 + e[0], -1, 0); } else E.off(ids[e[2]], T0 + e[0]); } E.flush();
  await new Promise(r => setTimeout(r, 2000)); cap.port.postMessage(0);
  const off = (await Q.bmRender(sndOf(t), ev, {sec: 1.6, sr})).l;
  const i0 = Math.round(T0 * sr) - f0;
  const corr = (a0, a1, d) => { let sxy = 0, sxx = 0, syy = 0; for (let i = a0; i < a1; i++) { const u = off[i], v = buf[i0 + i + d] || 0; sxy += u * v; sxx += u * u; syy += v * v; } return +(sxy / Math.sqrt(sxx * syy + 1e-30)).toFixed(4); };
  const best = (a0, a1) => { let bc = -2, bd = 0; for (let d = -300; d <= 300; d++) { const k = corr(a0, a1, d); if (k > bc) { bc = k; bd = d; } } return [bc, bd]; };
  return {n1: best(0.1 * sr, .6 * sr), all: best(0, 1.6 * sr), lim: LIM.level, peakOff: Math.max(...off.slice(0, 48000)), peakLive: Math.max(...buf.slice(i0, i0 + 48000))};
});
const pass = r.n1[0] >= .99 && r.all[0] >= .99; console.log(JSON.stringify({test: 'bm-offline-live', pass, ...r})); await b.close(); process.exit(pass ? 0 : 1);
