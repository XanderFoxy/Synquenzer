// echo tail of an MS 2000 pluck (DELAY 1/4 TIEFE 127): key on the track vs. library preview (own sound / other sound)
import {open, sleep} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(0, 'mk'); ensureAudio(); });
await sleep(1200);
const r = await E(async () => {
  const Q = SYNQUENZER; ensureAudio();
  const S_ = o => { for (const k in o) Q.mkSet(0, k, o[k]); };
  S_({'t.0.e2.a': 0, 't.0.e2.d': 30, 't.0.e2.s': 0, 't.0.e2.r': 20, 'dly.dep': 127, 'dly.sync': 1, 'dly.note': 8});
  await Q.saveSound(0, 'Pluck Echo', 'new');
  const id = Q.library().find(s => s.name === 'Pluck Echo').id;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const cap = async (node, fn, ms) => { const c = AU.ctx, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; let t0 = null; sp.onaudioprocess = e => { if (t0 == null) t0 = e.playbackTime; L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); }; node.connect(sp); sp.connect(z); z.connect(c.destination);
    await sleep(100); const mark = await fn(); await sleep(ms); try { node.disconnect(sp); } catch (e) {} sp.disconnect();
    const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; }
    const W = Math.round(.1 * c.sampleRate), env = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; env.push(Math.round(10 * Math.log10(s / W + 1e-20))); }
    return {env, mark: mark != null ? Math.round((mark - t0) / .1) : null}; };
  const info0 = JSON.stringify(Q.mkGet(0).dly) + ' eng ' + !!AU.synth[0];
  const key = await cap(AU.M.ceil, async () => { Q.keyOn(60, .8); await sleep(60); Q.keyOff(60); return AU.ctx.currentTime; }, 4000);
  await sleep(1500);
  const own = await cap(AU.M.ceil, async () => { Q.browserPreview(id, true); while (Q.previewState().on) await sleep(30); return AU.ctx.currentTime; }, 4000);
  Q.closeBrowser(); await sleep(1500);
  const ownM = await cap(AU.M.ceil, async () => { Q.browserPreview(id, true); while (Q.previewState().on) await sleep(30); return AU.ctx.currentTime; }, 4000);
  Q.closeBrowser(); await sleep(500);
  Q.initSound(0); await sleep(800);
  const other = await cap(AU.M.ceil, async () => { Q.browserPreview(id, true); while (Q.previewState().on) await sleep(30); return AU.ctx.currentTime; }, 4000);
  return {info0, key, own, ownM, other, ph: (SQF.PREVIEW && Object.keys(SQF.PREVIEW))};
});
const fmt = o => o.env.map((v, i) => (i === o.mark ? '|' : '') + v).join(',');
for (const k of ['key', 'own', 'ownM', 'other']) console.log(k.padEnd(6), fmt(r[k]));
console.log(r.info0, JSON.stringify(r.ph), 'errs', JSON.stringify(errs));
await T.br.close();
