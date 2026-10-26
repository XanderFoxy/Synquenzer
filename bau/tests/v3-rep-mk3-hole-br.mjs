// Independent repro in real Chromium AudioWorklet: the app's worklet source in an OfflineAudioContext, held key 64,
// suspend at 0.5 s -> {mkSet} (as mkSetP posts it) -> resume. M-EINBRUCH per Spec v3 §16 (1-ms step, ref -50..-10 ms).
import {chromium} from 'playwright';
import {mkDefaults} from './v3-mk1-node.mjs';
const APP = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const pdb = x => 10 * Math.log10(x + 1e-30);
function mEin16(x, c) {  // x = slice, c = index of the switch inside x
  const W = Math.round(.005 * SR), st = Math.round(.001 * SR);
  const win = i => { let e = 0; for (let k = i; k < i + W; k++) e += x[k] * x[k]; return e / W; };
  const ws = []; for (let i = c - Math.round(.05 * SR); i + W <= c + Math.round(.05 * SR); i += st) ws.push([(i - c) / SR, win(i)]);
  const pre = ws.filter(([u]) => u + .005 <= -.01 + 1e-9), ref = pre.reduce((a, b) => a + b[1], 0) / pre.length;
  let worst = 0; for (const [, e] of ws) worst = Math.min(worst, pdb(e / ref));
  let post = 0, m = 0; for (let i = c + Math.round(.06 * SR); i + W <= c + Math.round(.1 * SR); i += W) { post += win(i); m++; }
  return {worst, step: pdb(post / m / ref)};
}
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const cases = [
  ['SANITY T2 Cutoff 40, MODUS Einzeln→Split 60 (must step down)', {mode: 0}, {}, {f: {cut: 40}}, {mode: 2, split: 60}, 64],
  ['INIT Säge, MODUS Einzeln→Split 60, T1→T2', {mode: 0}, {}, {}, {mode: 2, split: 60}, 64],
  ['Dreieck beide, MODUS Einzeln→Split 60, T1→T2', {mode: 0}, {o1: {w: 2}}, {o1: {w: 2}}, {mode: 2, split: 60}, 64],
  ['Dreieck beide, SPLIT 60→70, T2→T1', {mode: 2, split: 60}, {o1: {w: 2}}, {o1: {w: 2}}, {split: 70}, 64],
  ['KONTROLLE Dreieck, Taste 50 bleibt T1 (SPLIT 60→70)', {mode: 2, split: 60}, {o1: {w: 2}}, {o1: {w: 2}}, {split: 70}, 50],
];
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + APP); await p.waitForTimeout(1500);
for (const [lab, top, t1, t2, msg, note] of cases) {
  const res = [];
  for (let s = 1; s <= 24; s++) {
    const out = await p.evaluate(async ({pmk, msg, note, seed}) => {
      const sr = 48000, src = document.getElementById('sq-worklet-src').textContent, oc = new OfflineAudioContext(2, sr, sr);
      await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const node = new AudioWorkletNode(oc, 'dirigent-analog', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2], processorOptions: {patch: {eng: 3}, mods: [], mk: pmk}});
      node.connect(oc.destination);
      node.port.postMessage({tempo: {bpm: 120, start: null}}); node.port.postMessage({mkSeed: seed});
      node.port.postMessage({ev: [[0, 1, 1, note, .8, -1]]});
      let sw = -1;
      oc.suspend(.5).then(async () => { sw = Math.round(oc.currentTime * sr); node.port.postMessage({mkSet: msg}); await new Promise(r => setTimeout(r, 40)); oc.resume(); });
      await new Promise(r => setTimeout(r, 30));
      const buf = await oc.startRendering(), l = buf.getChannelData(0);
      return {sw, x: Array.from(l.subarray(sw - 2880, sw + 6000))};
    }, {pmk: prog(top, t1, t2), msg, note, seed: s});
    res.push({s, sw: out.sw, ...mEin16(Float32Array.from(out.x), 2880)});
  }
  const w = res.slice().sort((a, b) => a.worst - b.worst), bad = res.filter(r => r.worst < -3).length;
  console.log(lab.padEnd(62) + ' switch at frame ' + res[0].sw + ': worst ' + w[0].worst.toFixed(1) + ' dB (seed ' + w[0].s + '), median ' + w[12].worst.toFixed(1) + ' dB, ' + bad + '/24 < -3 dB, step ' + w[12].step.toFixed(1) + ' dB');
}
console.log('page errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
