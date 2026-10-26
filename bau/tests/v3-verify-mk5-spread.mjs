// Independent check: a C-E-G chord on the heard bar line with the keys spread 0..40 ms. Measured on the AUDIO of track 2
// (AudioWorklet tap with currentFrame -> context time), not on noteLog: which pitch sounds first, and when, relative to b2t(B)?
// Compared with the playback of a clip that holds the same chord on the beat (what a ● take with Q stores).
import {open, sleep} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {E} = T;
const TR = 2;
const info = await E(t => { const Q = SYNQUENZER; Q.setMetronome && Q.setMetronome(false); Q.setEngine(t, 'mk'); return {bpm: S.bpm, v: VERSION}; }, TR); await sleep(900);
await E(t => { const Q = SYNQUENZER; Q.selectTrack(t); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 1); for (let s = 0; s < 4; s++) Q.clearClip(t, s); }, TR);
console.log('app', info.v, 'bpm', info.bpm, 'arp', JSON.stringify(await E(t => SYNQUENZER.mkGet(t).arp, TR)));
// audio tap on the track's own output
await E(() => SYNQUENZER.play()); await sleep(600);
await E(async t => {
  const c = AU.ctx;
  const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:x?x.slice(0):null});return true;}}registerProcessor('vrf-tap',R);`;
  try { await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); } catch (e) { await c.audioWorklet.addModule(URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))); }
  const n = new AudioWorkletNode(c, 'vrf-tap'); const Q = window.__tap = {ch: [], sr: c.sampleRate};
  n.port.onmessage = e => { if (e.data.d) Q.ch.push([e.data.f, e.data.d]); };
  AU.synth[t].node.connect(n); const g = c.createGain(); g.gain.value = 0; n.connect(g); g.connect(c.destination);
}, TR);
await sleep(300);

// one trial: wait for the heard bar line B (+ d ms), press 60/64/67 with gap spr ms between keys, hold 1.2 beats
async function trial(d, spr, mode) {
  return E(async ([d, spr, mode]) => {
    const sl = ms => new Promise(r => setTimeout(r, ms));
    const spbS = 60 / S.bpm;
    const B = Math.ceil(audBeat() / 4 + .3) * 4 + 4, tgt = B + d / 1000 / spbS;
    while (audBeat() < tgt - .03) await sl(4);
    while (audBeat() < tgt) {}
    const pressHeard = (audBeat() - B) * spbS * 1000;
    const keys = [[60, 'a'], [64, 'b'], [67, 'c']];
    if (mode === 'busy') { for (let k = 0; k < 3; k++) { if (k) { const t0 = performance.now(); while (performance.now() - t0 < spr) {} } SYNQUENZER.keyOn(keys[k][0], .8, keys[k][1]); } }
    else { for (let k = 0; k < 3; k++) { if (k && spr) await sl(spr); SYNQUENZER.keyOn(keys[k][0], .8, keys[k][1]); } }   // setTimeout-spaced, like separate touch events
    while (audBeat() < B + 1.2) await sl(5);
    for (const [n, id] of keys) SYNQUENZER.keyOff(n, id);
    while (audBeat() < B + 2.2) await sl(5);
    return {B, tB: b2t(B), pressHeard: +pressHeard.toFixed(1)};
  }, [d, spr, mode]);
}
const trials = [];
for (const [d, spr, mode] of [[0, 0, 'busy'], [0, 8, 'busy'], [0, 15, 'busy'], [0, 18, 'busy'], [0, 20, 'busy'], [0, 30, 'busy'],
  [0, 15, 'busy'], [0, 18, 'busy'], [0, 20, 'busy'], [-10, 17, 'busy'], [10, 17, 'busy'], [0, 15, 'timeout'], [0, 18, 'timeout'], [0, 20, 'timeout'], [0, 16, 'timeout']]) {
  const r = await trial(d, spr, mode); trials.push(Object.assign({d, spr, mode}, r));
}
// reference: the same chord as a clip on the beat (what a quantized ● take stores), 1 bar, chord t=0 d=1.2 beats
const clipRef = await E(async t => {
  const sl = ms => new Promise(r => setTimeout(r, ms));
  SYNQUENZER.setClip(t, 0, {len: 1, notes: [60, 64, 67].map(n => ({t: 0, d: 1.2, n, v: .8}))});
  const B0 = Math.ceil(audBeat() / 4) * 4;
  SYNQUENZER.tapSlot ? SYNQUENZER.tapSlot(t, 0) : 0;
  while (audBeat() < B0 + 12.5) await sl(20);
  const L = SYNQUENZER.noteLog(400).filter(e => e.track === t && e.src === 'arp' && e.beat > B0 - .1).map(e => [+e.beat.toFixed(3), e.out]);
  return {B0, L: L.slice(0, 12)};
}, TR);
await E(() => SYNQUENZER.stop());
const audio = await E(() => { const Q = window.__tap; const f0 = Q.ch[0][0], f1 = Q.ch[Q.ch.length - 1][0] + 128; const x = new Float32Array(f1 - f0); for (const [f, d] of Q.ch) x.set(d, f - f0); return {sr: Q.sr, f0, x: Array.from(x)}; });

// analysis: pitch (autocorrelation, 12 ms windows, hop 4 ms) from tB-30 ms to tB+300 ms
const {sr, f0} = audio, X = Float32Array.from(audio.x);
const NOTE = {60: 261.63, 64: 329.63, 67: 392.0};
function win(t0, ms) { const a = Math.round(t0 * sr) - f0, n = Math.round(ms / 1000 * sr); return a >= 0 && a + n <= X.length ? X.subarray(a, a + n) : null; }
function pitchAt(t0) {
  const w = win(t0, 14); if (!w) return null;
  let e = 0; for (const v of w) e += v * v; const rms = Math.sqrt(e / w.length), db = 20 * Math.log10(rms + 1e-9);
  if (db < -50) return {db, n: null};
  let best = null; for (const [n, f] of Object.entries(NOTE)) { const lag = Math.round(sr / f); let s = 0, s0 = 0; for (let i = 0; i + lag < w.length; i++) { s += w[i] * w[i + lag]; s0 += w[i] * w[i]; } const r = s / (s0 + 1e-12); if (!best || r > best.r) best = {n: +n, r}; }
  return {db, n: best.r > .5 ? best.n : '?', r: best.r};
}
const out = [];
for (const tr of trials) {
  const seq = []; let prev = null;
  for (let ms = -30; ms <= 320; ms += 4) { const p = pitchAt(tr.tB + ms / 1000); const lab = p ? (p.n == null ? '-' : p.n) : 'x'; if (lab !== prev) { seq.push([ms, lab]); prev = lab; } }
  const firstNote = seq.find(s => typeof s[1] === 'number');
  const sixteenth = 60 / info.bpm / 4 * 1000;
  const cBefore2nd = seq.some(s => s[1] === 60 && s[0] < sixteenth - 5);
  out.push({d: tr.d, spr: tr.spr, mode: tr.mode, press: tr.pressHeard, first: firstNote, cBefore2nd, seq: seq.slice(0, 7)});
}
for (const o of out) console.log(JSON.stringify(o));
console.log('clip reference (beats rel. B0', clipRef.B0, '):', JSON.stringify(clipRef.L.map(([b, n]) => [+(b - clipRef.B0).toFixed(3), n])));
const lost = out.filter(o => !o.cBefore2nd);
console.log('LOST C before the 2nd sixteenth:', lost.length, '/', out.length, JSON.stringify(lost.map(o => [o.d, o.spr, o.mode])));
await T.br.close();
