// T8b: Live-Weg (Worklet synq-stimme aus index.html) mit „Oktave sperren“: Sinus/Pfeifen/Flöte vs. Säge+Sub
import fs from 'fs';
const html = fs.readFileSync('../dirigent-wt/index.html', 'utf8');
const a = html.indexOf('const ST_WK = `') + 'const ST_WK = `'.length, b = html.indexOf("registerProcessor('synq-stimme', SynqStimme);`;") + "registerProcessor('synq-stimme', SynqStimme);".length;
const SRC = html.slice(a, b);
function make(sr, mpm) {
  let Cls = null; const msgs = [];
  class AWP { constructor() { this.port = {postMessage: m => msgs.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0;
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', SRC)(AWP, (n, c) => { Cls = c; }, sr);
  const p = new Cls({processorOptions: {block: 4096, mpm}});
  return {msgs, run(x) { const out = [[new Float32Array(128)]]; for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [new Float32Array(128)]], out); } }};
}
const SR = 48000;
const H = {sine: [1], whistle: [1, 0.03], flute: [1, 0.3, 0.05, 0.02], sawsub: null, saw: Array.from({length: 30}, (_, k) => 1 / (k + 1))};
for (const [kind, hs] of Object.entries(H)) {
  const res = {};
  for (const lock of [false, true]) {
    const lits = [];
    for (const m of [57, 64, 72]) {
      const f = 440 * Math.pow(2, (m - 69) / 12), n = SR * 0.8, x = new Float32Array(n);
      for (let i = 0; i < n; i++) { const t = i / SR; let v = 0; if (hs) hs.forEach((h, k) => { if ((k + 1) * f < 9000) v += h * Math.sin(2 * Math.PI * (k + 1) * f * t); }); else { for (let k = 1; k * f < 9000; k++) v += Math.sin(2 * Math.PI * k * f * t) / k; v += 0.6 * Math.sin(Math.PI * f * t); } x[i] = 0.15 * v * Math.min(1, t / 0.005); }
      const W = make(SR, {src: 'inst', lock}); W.run(x);
      const l = W.msgs.filter(q => q.lit !== undefined && q.lit >= 0).map(q => q.lit);
      lits.push(m + '→' + (l.length ? [...new Set(l)].join('/') : '–'));
    }
    res[lock ? 'an' : 'aus'] = lits.join(' ');
  }
  console.log(kind.padEnd(8), 'Sperre aus:', res.aus, ' | an:', res.an);
}
