// QA G-MK4 (branch mk-br-MK4): launcher re-using the G-MK2a/G-MK1 helpers, own OUT dir
import * as G from './v3-qa-gmk2a-tl.mjs';
export const {check, done, eq, canon, diff, res, sleep} = G;
export const APP4 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK4/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk4/';
export async function open(o = {}) {
  const T = await G.open(Object.assign({file: process.env.SYNQ_APP || APP4}, o));
  const {E} = T;
  T.lcd2 = () => E(() => (window.ED && ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ').trim() : null));
  T.w2 = async re => T.w('w2', re);
  // stereo capture of a track's worklet output (L,R) for ms; returns arrays
  T.capT = (t, ms) => E(([t, ms]) => new Promise(r => { const c = AU.ctx, n = AU.synth[t].node; const sp = c.createScriptProcessor(2048, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [], R = []; sp.onaudioprocess = e => { L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); R.push(Float32Array.from(e.inputBuffer.getChannelData(1))); }; n.connect(sp); sp.connect(z); z.connect(c.destination); setTimeout(() => { try { n.disconnect(sp); } catch (e) {} sp.disconnect(); const cat = A => { const N = A.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of A) { x.set(b, o); o += b.length; } return x; }; r({sr: c.sampleRate, l: Array.from(cat(L)), r: Array.from(cat(R))}); }, ms); }), [t, ms]);
  return T;
}
