// library preview (▶) of an MS 2000 pluck with DELAY 1/4 TIEFE 127 vs. the same sound without: engine output and master
import {open, sleep, OUT, check, done} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(0, 'mk'); });
await sleep(500);
const r = await E(async () => {
  const Q = SYNQUENZER; ensureAudio();
  const S_ = o => { for (const k in o) Q.mkSet(0, k, o[k]); };
  S_({'t.0.e2.a': 0, 't.0.e2.d': 30, 't.0.e2.s': 0, 't.0.e2.r': 20, 'dly.dep': 0, 'dly.sync': 1, 'dly.note': 8});
  await Q.saveSound(0, 'Pluck Trocken', 'new');
  S_({'dly.dep': 127}); await Q.saveSound(0, 'Pluck Echo', 'new');
  const idD = Q.library().find(s => s.name === 'Pluck Trocken').id, idE = Q.library().find(s => s.name === 'Pluck Echo').id;
  Q.initSound(0); await new Promise(r => setTimeout(r, 300));
  const run = async id => { const c = AU.ctx, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; let t0 = null; sp.onaudioprocess = e => { if (t0 == null) t0 = e.playbackTime; L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); }; AU.M.ceil.connect(sp); sp.connect(z); z.connect(c.destination);
    await new Promise(r => setTimeout(r, 100)); Q.browserPreview(id, true); const ch = PV.chain; const eng = ch && ch.E;
    let tEnd = null; while (true) { await new Promise(r => setTimeout(r, 50)); if (!Q.previewState().on) { tEnd = c.currentTime; break; } }
    await new Promise(r => setTimeout(r, 3000)); try { AU.M.ceil.disconnect(sp); } catch (e) {} sp.disconnect();
    const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; }
    const W = Math.round(.05 * c.sampleRate), env = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; env.push(Math.round(10 * Math.log10(s / W + 1e-20))); }
    return {env, end: +((tEnd - t0) / .05).toFixed(0), chainGone: ch ? ch.gone : null, eng: !!eng}; };
  const d = await run(idD); await new Promise(r => setTimeout(r, 1500)); const e = await run(idE);
  // reference: the same sound loaded on the track, PV of the track's own sound (no extra chain)
  Q.browserTap(idE); await new Promise(r => setTimeout(r, 500)); const own = await run(idE);
  return {d, e, own};
});
const fmt = o => o.env.map((v, i) => (i === o.end ? '|' : '') + v).join(',');
console.log('dry  ', fmt(r.d)); console.log('echo ', fmt(r.e)); console.log('own  ', fmt(r.own));
const tail = o => o.env.slice(o.end + 2, o.end + 30);
const mean = a => 10 * Math.log10(a.reduce((s, v) => s + Math.pow(10, v / 10), 0) / a.length);
console.log('tail mean dB  dry', mean(tail(r.d)).toFixed(1), 'echo (preview chain)', mean(tail(r.e)).toFixed(1), 'echo (track own)', mean(tail(r.own)).toFixed(1));
const dIn = r.d.env.slice(5, r.d.end), eIn = r.e.env.slice(5, r.e.end);
console.log('in-phrase mean dB dry', mean(dIn).toFixed(1), 'echo', mean(eIn).toFixed(1));
console.log('errs', JSON.stringify(errs));
await T.br.close();
