// V2c′ M-KLICK / M-EINBRUCH: „Eine Skala“ an/aus, Stärke ziehen und Träger wechseln während Fläche + Arpeggio klingen
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
async function run(toggle) {
  const {b, p, errs} = await open();
  const r = await p.evaluate(async toggle => {
    const Q = window.SYNQUENZER; Q.newProject(); ensureAudio(); const c = AU.ctx;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('v2c2-rec',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'v2c2-rec'); const buf = new Float32Array(c.sampleRate * 12); let k = 0, on = false;
    n.port.onmessage = e => { if (!on) return; const d = e.data; for (let i = 0; i < d.length && k < buf.length; i++) buf[k++] = d[i]; };
    AU.analyser.connect(n);
    Q.setClip(2, 0, {len: 1, key: {root: 4, scale: 'aeolian'}, notes: [64, 67, 69, 71].map(x => ({t: 0, d: 3.95, n: x, v: .7}))});           // Fläche mit A (→ F♯/F)
    Q.setClip(1, 0, {len: 1, key: {root: 4, scale: 'aeolian'}, notes: [64, 66, 67, 69, 71, 72, 74, 76].map((x, i) => ({t: i * .5, d: .45, n: x, v: .6}))});
    Q.setBpm(110); Q.play(); Q.launchScene(0); Q.setKbMode('transpose');
    const H = Q.harmony, ch = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [69, 72, 76], [62, 66, 69]].map(x => H.detectChord(x));
    await new Promise(r => setTimeout(r, 900)); on = true;
    for (let s = 0; s < 20; s++) {
      if (s % 2 === 0) recallCarrier(ch[(s / 2) % ch.length]);
      else if (toggle) { if (s % 4 === 1) Q.oneScale(!Q.oneScale()); else Q.setHarmony({osAmt: s % 8 === 3 ? .3 : 1}); }
      await new Promise(r => setTimeout(r, 400));
    }
    on = false; Q.stop(); AU.analyser.disconnect(n);
    const x = buf.subarray(0, k); let d2 = 0; for (let i = 2; i < x.length; i++) d2 = Math.max(d2, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]));
    const W = Math.round(c.sampleRate * .02), rms = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let j = i; j < i + W; j++) s += x[j] * x[j]; rms.push(10 * Math.log10(s / W + 1e-12)); }
    const med = rms.slice().sort((a, b) => a - b)[rms.length >> 1];
    return {secs: +(k / c.sampleRate).toFixed(2), d2: +d2.toFixed(4), minDb: +Math.min(...rms).toFixed(1), med: +med.toFixed(1)};
  }, toggle);
  r.errs = errs; await b.close(); return r;
}
const base = await run(false), tog = await run(true);
console.log(JSON.stringify({base, tog}));
check('M-KLICK: Umschalten An/Aus und Stärke während der Wiedergabe – größte 2. Differenz ≤ 1,5 × der Fahrt nur mit Träger-Wechseln', tog.secs > 7 && tog.d2 <= 1.5 * base.d2 + 1e-4, {base: base.d2, tog: tog.d2});
check('M-EINBRUCH: kein 20-ms-Fenster mehr als 20 dB unter dem Median (Fläche klingt durch)', tog.med - tog.minDb <= 20 && base.med - base.minDb <= 20, {tog, base});
check('keine Konsolenfehler', !tog.errs.length && !base.errs.length, [tog.errs, base.errs]);
process.exit(done() ? 1 : 0);
