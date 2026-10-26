// QA G-MK7 (branch mk-br-MK7): launcher re-using the G-MK6/G-MK4/G-MK2a/G-MK1 touch helpers (with fake mic), own OUT dir
import * as G from './v3-qa-gmk2a-tl.mjs';
export const {check, done, eq, canon, diff, res, sleep} = G;
export const APP7 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vgmk567/qa7/';
export async function open(o = {}) {
  const T = await G.open(Object.assign({file: process.env.SYNQ_APP || APP7, mic: true}, o));
  const {E} = T;
  T.lcd2 = () => E(() => { const l = document.querySelector('#synthSheet .lcd'); return l ? l.innerText.replace(/\s+/g, ' ').trim() : null; });
  T.w2 = async re => T.w('w2', re);
  T.w1 = async re => T.w('w1', re);
  T.capT = (t, ms) => E(([t, ms]) => new Promise(r => { const c = AU.ctx, n = AU.synth[t].node; const sp = c.createScriptProcessor(2048, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [], R = []; sp.onaudioprocess = e => { L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); R.push(Float32Array.from(e.inputBuffer.getChannelData(1))); }; n.connect(sp); sp.connect(z); z.connect(c.destination); setTimeout(() => { try { n.disconnect(sp); } catch (e) {} sp.disconnect(); const cat = A => { const N = A.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of A) { x.set(b, o); o += b.length; } return x; }; r({sr: c.sampleRate, l: Array.from(cat(L)), r: Array.from(cat(R))}); }, ms); }), [t, ms]);
  // peak dBFS of a track's raw engine output over ms
  T.trLvl = (t, ms = 600) => E(([t, ms]) => new Promise(r => { const c = AU.ctx, E_ = AU.synth[t]; if (!E_) return r(null); const a = c.createAnalyser(); a.fftSize = 2048; E_.node.connect(a); const b = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) pk = Math.max(pk, Math.abs(v)); }, 20); setTimeout(() => { clearInterval(iv); try { E_.node.disconnect(a); } catch (e) {} r(+(20 * Math.log10(pk + 1e-15)).toFixed(1)); }, ms); }), [t, ms]);
  T.toMk = async () => { const m = await T.rectText('#synthSheet button', /^MS ?2000$/); if (m) { await T.tap(m.cx, m.cy, 1200); return; } const c = await T.rectText('#synthSheet button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(1200); };
  return T;
}
