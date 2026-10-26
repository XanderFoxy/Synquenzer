// does the library preview (▶) of an MS 2000 sound play its DELAY / MOD-FX / EQ?
import {open, sleep, OUT, check, done} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(0, 'mk'); });
await sleep(500);
const r = await E(async () => {
  const Q = SYNQUENZER; ensureAudio();
  Q.mkSet(0, 'dly.dep', 100); Q.mkSet(0, 'dly.sync', 1); Q.mkSet(0, 'dly.note', 8); Q.mkSet(0, 't.0.a.gate', 1);
  await Q.saveSound(0, 'Echo Lang', 'new');
  const id = Q.library().find(s => s.name === 'Echo Lang').id;
  Q.initSound(0); await new Promise(r => setTimeout(r, 300));
  const cap = (node, ms) => new Promise(res => { const c = AU.ctx, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; sp.onaudioprocess = e => L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); node.connect(sp); sp.connect(z); z.connect(c.destination); setTimeout(() => { try { node.disconnect(sp); } catch (e) {} sp.disconnect(); const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; } const W = Math.round(.05 * c.sampleRate), env = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; env.push(Math.round(10 * Math.log10(s / W + 1e-20))); } res(env); }, ms); });
  Q.browserPreview(id, true);
  const N = PV.chain, E_ = N && N.E;
  const info = {chain: !!N, eng: !!E_, mkCfg: E_ && E_.mk ? JSON.stringify(E_.mk.dly || null) : null, keys: E_ ? Object.keys(E_).slice(0, 30) : null};
  const env = E_ ? await cap(E_.node, 5500) : null;
  return {id, info, env, fxBytes: Q.mkInfo().fxBytes};
});
console.log(JSON.stringify(r));
console.log('errs', JSON.stringify(errs));
await T.br.close();
