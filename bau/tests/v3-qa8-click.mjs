// QA MK8 click: program change while a chord sounds — envelope (1 ms RMS) and M-KLICK (HP 5 kHz, 2 ms windows, +6 dB over median ±20 ms) at the switch
import {launch, open} from './v3-qa8-lib.mjs';
const file = process.argv[2] ? process.argv[2] : undefined;
const b = await launch(); const {page: p, errs} = await open(b, 'P1', file);
await p.evaluate(async () => {
  await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); ensureAudio(); SYNQUENZER.keyOn(40, .1, 'w'); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.keyOff(40, 'w'); await new Promise(r => setTimeout(r, 1200));
  window.__rec = async (fnA, fnB, holdMs) => {
    const c = AU.ctx, src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:x?x.slice(0):null});return true;}}registerProcessor('qa8-rec',R);`;
    if (!window.__recMod) { try { await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); } catch (e) { await c.audioWorklet.addModule(URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))); } window.__recMod = 1; }
    const n = new AudioWorkletNode(c, 'qa8-rec'), Q = {d: [], f0: null}; n.port.onmessage = e => { if (Q.f0 == null) Q.f0 = e.data.f; if (e.data.d) Q.d.push([e.data.f, e.data.d]); };
    AU.M.ceil.connect(n); const g = c.createGain(); g.gain.value = 0; n.connect(g); g.connect(c.destination);
    const w = ms => new Promise(r => setTimeout(r, ms));
    fnA(); await w(600);
    SYNQUENZER.keyOn(48, .9, 'q1'); SYNQUENZER.keyOn(55, .9, 'q2'); SYNQUENZER.keyOn(60, .9, 'q3'); await w(holdMs);
    const fSw = Math.round(c.currentTime * c.sampleRate); fnB(); await w(500);
    SYNQUENZER.keyOff(48, 'q1'); SYNQUENZER.keyOff(55, 'q2'); SYNQUENZER.keyOff(60, 'q3'); await w(300);
    AU.M.ceil.disconnect(n); n.disconnect();
    const f0 = Q.d[0][0], N = Q.d[Q.d.length - 1][0] + 128 - f0, x = new Float32Array(N); for (const [f, d] of Q.d) x.set(d, f - f0);
    const sr = c.sampleRate, i0 = fSw - f0;
    // 1 ms RMS envelope from -30 to +100 ms
    const env = []; for (let k = -30; k < 100; k++) { let e = 0; const a = i0 + Math.round(k * sr / 1000); for (let i = a; i < a + Math.round(sr / 1000); i++) e += (x[i] || 0) ** 2; env.push(+(10 * Math.log10(e / (sr / 1000) + 1e-20)).toFixed(1)); }
    // M-KLICK over -100..+300 ms
    const wN = 1 - Math.exp(-2 * Math.PI * 5000 / sr); let lp = 0; const hp = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { lp += wN * (x[i] - lp); hp[i] = x[i] - lp; }
    const W = Math.round(.002 * sr), wins = []; for (let a = i0 - Math.round(.15 * sr); a < i0 + Math.round(.35 * sr); a += W) { let e = 0; for (let i = a; i < a + W; i++) e += hp[i] * hp[i]; wins.push(10 * Math.log10(e / W + 1e-20)); }
    let worst = -99, at = 0; for (let k = 10; k < wins.length - 10; k++) { const nb = wins.slice(k - 10, k + 11).filter((_, j) => j !== 10).sort((a, b) => a - b); const med = nb[Math.floor(nb.length / 2)]; if (wins[k] - med > worst) { worst = wins[k] - med; at = (k * W - Math.round(.15 * sr)) / sr * 1000; } }
    const hpe = []; for (let k = -20; k < 40; k += 2) { let e = 0; const a = i0 + Math.round(k * sr / 1000); for (let i = a; i < a + W; i++) e += hp[i] * hp[i]; hpe.push(+(10 * Math.log10(e / W + 1e-20)).toFixed(0)); }
    let w2 = -99; for (let k = 0; k < wins.length; k++) { const tms = (k * W - Math.round(.15 * sr)) / sr * 1000; if (tms < -5 || tms > 45 || k < 10 || k > wins.length - 11) continue; const nb = wins.slice(k - 10, k + 11).filter((_, j) => j !== 10).sort((a, b) => a - b); w2 = Math.max(w2, wins[k] - nb[Math.floor(nb.length / 2)]); }
    return {env, klick: +worst.toFixed(1), atMs: Math.round(at), klickSw: +w2.toFixed(1), hpe};
  };
});
const P = (b, s) => `() => mkProg.select(${b}, ${s})`;
const cases = process.env.VA ? [['VA preset → VA preset', `() => SYNQUENZER.loadPreset(0, SYNQUENZER.factory().filter(f => f.engine === 'analog')[3].id)`, `() => SYNQUENZER.loadPreset(0, SYNQUENZER.factory().filter(f => f.engine === 'analog')[9].id)`]]
  : process.env.SET ? [['A04 o1.w→7 by mkSet', P(1, 4), `() => SYNQUENZER.mkSet(0, 't.0.o1.w', 7)`], ['A04 → H15', P(1, 4), P(8, 15)], ['A04 → H16 INIT', P(1, 4), P(8, 16)], ['A04 → A09', P(1, 4), P(1, 9)], ['H09 → A04', P(8, 9), P(1, 4)], ['A04 → H09', P(1, 4), P(8, 9)]]
  : [['A01 → A03', P(1, 1), P(1, 3)], ['A03 → A08', P(1, 3), P(1, 8)], ['E01 → H09', P(5, 1), P(8, 9)], ['H09 → A04', P(8, 9), P(1, 4)], ['A04 → H15', P(1, 4), P(8, 15)], ['A03 → F03 dual', P(1, 3), P(6, 3)], ['A11 → B11', P(1, 11), P(2, 11)]];
for (const [name, a, z] of cases) {
  const r = await p.evaluate(async ([a, z]) => __rec(eval(a), eval(z), 900), [a, z]);
  console.log(name.padEnd(18), 'M-KLICK', r.klick, 'dB at', r.atMs, 'ms; at switch (-5..45 ms)', r.klickSw, 'dB | HP 2ms (-20..+40):', r.hpe.join(' '));
}
console.log('errs', errs);
await b.close();
