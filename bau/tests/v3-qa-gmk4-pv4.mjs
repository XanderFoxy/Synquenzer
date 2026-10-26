// library preview of an MS 2000 pluck: DELAY ZEIT ~100 ms TIEFE 100 vs. TIEFE 0 — is the delay in the preview at all?
import {open, sleep} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(0, 'mk'); ensureAudio(); });
await sleep(1200);
const r = await E(async () => {
  const Q = SYNQUENZER; const sleep = ms => new Promise(r => setTimeout(r, ms));
  const S_ = o => { for (const k in o) Q.mkSet(0, k, o[k]); };
  S_({'t.0.e2.a': 0, 't.0.e2.d': 20, 't.0.e2.s': 0, 't.0.e2.r': 10, 'dly.dep': 0, 'dly.sync': 0, 'dly.time': 80});
  await Q.saveSound(0, 'P0', 'new'); S_({'dly.dep': 110}); await Q.saveSound(0, 'P1', 'new');
  const id0 = Q.library().find(s => s.name === 'P0').id, id1 = Q.library().find(s => s.name === 'P1').id;
  const cap = async (fn, ms) => { const node = AU.M.ceil, c = AU.ctx, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; sp.onaudioprocess = e => { L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); }; node.connect(sp); sp.connect(z); z.connect(c.destination);
    await sleep(100); await fn(); await sleep(ms); try { node.disconnect(sp); } catch (e) {} sp.disconnect();
    const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; }
    // fraction of 10-ms windows above -50 dB (echo fills gaps)
    const W = Math.round(.01 * c.sampleRate); let on = 0, n = 0; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; n++; if (10 * Math.log10(s / W + 1e-20) > -50) on++; }
    return +(on / n).toFixed(3); };
  const res = {};
  // track sound = P1 (delay) loaded: keys
  res.keyDly = await cap(async () => { for (let k = 0; k < 6; k++) { Q.keyOn(60, .8); await sleep(40); Q.keyOff(60); await sleep(400); } }, 600);
  Q.mkSet(0, 'dly.dep', 0); await sleep(300);
  res.keyDry = await cap(async () => { for (let k = 0; k < 6; k++) { Q.keyOn(60, .8); await sleep(40); Q.keyOff(60); await sleep(400); } }, 600);
  Q.initSound(0); await sleep(600);
  res.pvDry = await cap(async () => { Q.browserPreview(id0, true); while (Q.previewState().on) await sleep(30); }, 600);
  await sleep(800);
  res.pvDly = await cap(async () => { Q.browserPreview(id1, true); while (Q.previewState().on) await sleep(30); }, 600);
  Q.closeBrowser(); await sleep(500);
  Q.browserTap(id1); await sleep(600); Q.closeBrowser(); await sleep(300);
  res.dlyOnTrack = JSON.stringify(Q.mkGet(0).dly);
  res.pvOwnDly = await cap(async () => { Q.browserPreview(id1, true); while (Q.previewState().on) await sleep(30); }, 600);
  return res;
});
console.log(JSON.stringify(r), 'errs', JSON.stringify(errs));
await T.br.close();
