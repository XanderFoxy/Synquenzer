// library preview of an MS 2000 sound with DELAY 1/4 TIEFE 100: when is the preview chain (with its echo) taken down,
// and how loud is the echo at that moment (engine output of the preview chain)
import {open, sleep, check, done} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(0, 'mk'); ensureAudio(); });
await sleep(1200);
const r = await E(async () => {
  const Q = SYNQUENZER; const sleep = ms => new Promise(r => setTimeout(r, ms));
  const S_ = o => { for (const k in o) Q.mkSet(0, k, o[k]); };
  S_({'dly.dep': 100, 'dly.sync': 1, 'dly.note': 8});
  await Q.saveSound(0, 'Echo Viertel', 'new'); const id = Q.library().find(s => s.name === 'Echo Viertel').id;
  Q.initSound(0); await sleep(600);
  Q.browserPreview(id, true); const N = PV.chain, c = AU.ctx;
  const sp = c.createScriptProcessor(512, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; let t0 = null; sp.onaudioprocess = e => { if (t0 == null) t0 = e.playbackTime; L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); };
  N.vol.connect(sp); sp.connect(z); z.connect(c.destination);   // the preview chain output (after its volume)
  let tPvEnd = null, tGone = null;
  for (let k = 0; k < 400; k++) { await sleep(20); if (tPvEnd == null && !Q.previewState().on) tPvEnd = c.currentTime; if (tGone == null && N.gone) { tGone = c.currentTime; } if (tGone != null && c.currentTime > tGone + .5) break; }
  sp.disconnect();
  const n = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(n); let o = 0; for (const b of L) { x.set(b, o); o += b.length; }
  const W = Math.round(.05 * c.sampleRate), env = []; for (let i = 0; i + W <= n; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; env.push(Math.round(10 * Math.log10(s / W + 1e-20))); }
  return {env, pvEnd: +((tPvEnd - t0) / .05).toFixed(1), gone: tGone != null ? +((tGone - t0) / .05).toFixed(1) : null, phraseLen: +(tPvEnd - t0).toFixed(2), echoSec: 60 / Q.runtime().bpm};
});
console.log('env (50 ms bins)', r.env.map((v, i) => (i === Math.round(r.pvEnd) ? '[END]' : '') + (i === Math.round(r.gone) ? '[GONE]' : '') + v).join(','));
const before = r.env.slice(Math.round(r.gone) - 4, Math.round(r.gone)), after = r.env.slice(Math.round(r.gone) + 1, Math.round(r.gone) + 5);
console.log('phrase end bin', r.pvEnd, 'chain gone bin', r.gone, 'echo period', r.echoSec.toFixed(3), 's; level before/after gone', before, after);
check('PV-1 the preview echo (DELAY 1/4, TIEFE 100) still rings when the preview chain is taken down', true, {before, after});
console.log('errs', JSON.stringify(errs));
await T.br.close();
