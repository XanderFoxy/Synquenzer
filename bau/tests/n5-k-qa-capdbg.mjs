// QA K1: debug the capture: zero windows inside a held note? (raw engine output of track 0)
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({file: process.env.APP});
await p.evaluate(() => { const A = SYNQUENZER; A.initSound(0); const s = A.getSound(0); s.p.cutoff = 1500; s.p.l1rate = .7; s.mods = [{src: 'lfo1', dst: 'cutoff', amt: .6}]; A.setSound(0, s); A.selectTrack(0); A.keyOn(48, .9); });
await p.waitForTimeout(300);
const r = await p.evaluate(() => new Promise(r => { const c = AU.ctx, n = AU.synth[0].node, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [];
  sp.onaudioprocess = e => L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); n.connect(sp); sp.connect(z); z.connect(c.destination);
  setTimeout(() => { n.disconnect(sp); sp.disconnect(); const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; }
    const W = 96, rm = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; rm.push(10 * Math.log10(s / W + 1e-20)); }
    const zero = rm.map((v, i) => [i, v]).filter(([i, v]) => v < -100); r({N, wins: rm.length, zeroWins: zero.length, firstZeros: zero.slice(0, 20).map(([i]) => +(i * W / c.sampleRate).toFixed(3)), min: Math.min(...rm).toFixed(1), max: Math.max(...rm).toFixed(1), sr: c.sampleRate}); }, 2500); }));
console.log(JSON.stringify(r));
await p.evaluate(() => SYNQUENZER.keyOff(48));
await b.close();
