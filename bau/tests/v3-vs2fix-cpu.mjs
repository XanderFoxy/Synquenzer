import fs from 'fs';
const html = fs.readFileSync('../dirigent-wt/index.html', 'utf8');
const a = html.indexOf('const ST_WK = `') + 15, b = html.indexOf("registerProcessor('synq-stimme', SynqStimme);`;") + "registerProcessor('synq-stimme', SynqStimme);".length;
const SRC = html.slice(a, b), SR = 48000;
function make(mpm) { let Cls; class AWP { constructor() { this.port = {postMessage() {}}; } } globalThis.currentFrame = 0; new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', SRC)(AWP, (n, c) => { Cls = c; }, SR); return new Cls({processorOptions: {block: 4096, mpm}}); }
const N = SR * 20, x = new Float32Array(N), r = new Float32Array(N);
for (let i = 0; i < N; i++) { const t = i / SR; x[i] = 0.1 * Math.sin(2 * Math.PI * 220 * t) + 0.05 * Math.sin(2 * Math.PI * 440 * t) + 0.003 * Math.sin(2 * Math.PI * 65 * t); r[i] = 0.3 * Math.sin(2 * Math.PI * 65 * t + 0.3); }
for (const [name, cfg] of [['ohne', {src: 'voice'}], ['Sperre unc10', {src: 'voice', bl: 0.01, bb: 0.002, lat: 60, unc: 10}], ['Sperre unc50', {src: 'voice', bl: 0.01, bb: 0.002, lat: 60, unc: 50}]]) {
  const best = [];
  for (let rep = 0; rep < 3; rep++) { const p = make(cfg), out = [[new Float32Array(128)]]; const t0 = performance.now(); for (let i = 0; i + 128 <= N; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [r.subarray(i, i + 128)]], out); } best.push((performance.now() - t0) / 20000 * 100); }
  console.log(name.padEnd(14), Math.min(...best).toFixed(2), '% Echtzeit');
}
