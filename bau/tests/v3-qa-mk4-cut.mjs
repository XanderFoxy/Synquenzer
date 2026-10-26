// QA MK4: the program echo of an AM track is part of the engine node; when the node is retired (engine switch AM -> WT, ECO on,
// track removed) it is disconnected 200 ms later (retireE) -> is the ringing echo cut with a click? Master recorded in the page.
import {open, sleep} from './v3-qa-gp2a-lib.mjs';
import {mKlick, db, rms} from './v3-mk1-ana.mjs';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK4/index.html';
const T = await open({mic: false, file: FILE, viewport: {width: 390, height: 844}}); const {E, errs} = T;
await T.tapSel('#bPlay'); await sleep(400); await T.tapSel('#bPlay'); await sleep(300);
await E(() => { if (!AU.ctx) ensureAudio(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); });
await T.p.waitForFunction(() => AU.ctx && SynthHost.state === 'ready', null, {timeout: 20000});
await sleep(800);
async function recStart() {
  return E(async () => {
    const c = AU.ctx; const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:x?x.slice(0):null});return true;}}registerProcessor('qa-rec-mk4',R);`;
    if (!window.__qrec) { await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); window.__qrec = 1; }
    const n = new AudioWorkletNode(c, 'qa-rec-mk4'); const Q = window.__q = {buf: new Float32Array(c.sampleRate * 8), f0: null, n: 0, node: n};
    n.port.onmessage = e => { const {f, d} = e.data; if (Q.f0 == null) Q.f0 = f; if (!d) return; const i = f - Q.f0; if (i >= 0 && i + d.length <= Q.buf.length) { Q.buf.set(d, i); Q.n = Math.max(Q.n, i + d.length); } };
    AU.M.ceil.connect(n); const g = c.createGain(); g.gain.value = 0; n.connect(g); g.connect(c.destination); return c.sampleRate;
  });
}
const recStop = () => E(() => { const Q = window.__q; try { AU.M.ceil.disconnect(Q.node); } catch (e) {} Q.node.disconnect(); return {f0: Q.f0, n: Q.n, sr: AU.ctx.sampleRate, d: Array.from(Q.buf.subarray(0, Q.n))}; });
for (const [name, act, fx] of [['engine MS 2000 -> WT', () => SYNQUENZER.setEngine(0, 'wt'), 1], ['ECO on (forceNative)', () => SYNQUENZER.forceNative(true), 1], ['engine MS 2000 -> WT, no delay (control)', () => SYNQUENZER.setEngine(0, 'wt'), 0]]) {
  await E(fx => { SYNQUENZER.forceNative(false); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.mkSet(0, 't.0.e2.s', 127); SYNQUENZER.mkSet(0, 't.0.e2.r', 10); SYNQUENZER.mkSet(0, 'dly.time', 105); SYNQUENZER.mkSet(0, 'dly.dep', fx ? 120 : 0); }, fx);
  await sleep(700);
  const sr = await recStart(); await sleep(200);
  await E(() => { window.__on = AU.ctx.currentTime; SYNQUENZER.keyOn(72, .9); SYNQUENZER.keyOn(76, .9); });
  await sleep(250); await E(() => { SYNQUENZER.keyOff(72); SYNQUENZER.keyOff(76); });
  await sleep(600);
  const tSw = await E(act => { const t = AU.ctx.currentTime; (0, eval)('(' + act + ')')(); return t; }, act.toString());
  await sleep(1200);
  const r = await recStop();
  const t0 = await E(() => window.__q.f0 / AU.ctx.sampleRate);
  const x = Float32Array.from(r.d), iS = Math.round((tSw - t0) * r.sr);
  // M-KLICK from the switch to +450 ms (the disconnect comes 200 ms after the switch); the level just before
  const seg = x.subarray(Math.max(0, iS - Math.round(.05 * r.sr)), Math.min(x.length, iS + Math.round(.45 * r.sr)));
  const k = mKlick(seg, r.sr, []);
  const pre = db(rms(x, iS - Math.round(.05 * r.sr), iS)), post = db(rms(x, iS + Math.round(.3 * r.sr), iS + Math.round(.4 * r.sr)));
  // biggest sample-to-sample step after the switch
  let st = 0, at = 0; for (let i = iS + 1; i < Math.min(x.length, iS + Math.round(.45 * r.sr)); i++) { const d = Math.abs(x[i] - x[i - 1]); if (d > st) { st = d; at = i; } }
  console.log(`${name}: echo level before switch ${pre.toFixed(1)} dBFS, 300-400 ms after ${post.toFixed(1)} dBFS; M-KLICK ${k.worst.toFixed(1)} dB at +${((k.at - .05) * 1000).toFixed(0)} ms; largest step ${st.toFixed(4)} at +${((at - iS) / r.sr * 1000).toFixed(0)} ms`);
}
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await T.br.close();
