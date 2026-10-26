// QA MK7 (FP-DSP/FP-IPHONE): quantum time distribution (peak, not only mean) and GC pressure, vocoder vs the same synth program.
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP} = await import('./v3-mk7-node.mjs');
const k = process.argv[2] || 'voc', sr = 48000, sec = 30;
const W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr, rms: -20}, W);
const ev = []; for (let t = 0; t < sec; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
const p = vocP({res: 64, msrc: 2, mint: 30, hpl: 40, dir: 20, th: 20, gs: 40}, {f: {type: 0, cut: 100, res: 40}, l1: {w: 2, f: 90, sync: 0, ks: 0}});
if (k === 'syn') p.mode = 0;
const at = k === 'voc' ? [[10, {mkHoldGet: 1}], [12, {mkSet: {'voc.hold': null}}], [14, {mkSet: {'voc.fs': 2}}], [16, {set: {mkLim: 1}}], [18, {set: {mkLim: 0}}], [20, {mkLed: true}], [22, {mkSet: {mode: 0}}], [24, {mkSet: {mode: 3}}]] : [];
const h0 = process.memoryUsage().heapUsed;
const r = render(p, ev, {sec, quantumMs: true, inputs: k === 'syn' ? undefined : {e2: vox}, at});
const q = r.qms.slice(375 * 2), s = q.slice().sort((a, b) => a - b), pc = x => s[Math.min(s.length - 1, Math.floor(s.length * x))];
const big = []; q.forEach((v, i) => { if (v > 5 * pc(.5)) big.push(((i + 750) * 128 / sr).toFixed(2) + 's:' + v.toFixed(3)); });
console.log(k + ': median ' + pc(.5).toFixed(4) + ' ms, p99 ' + pc(.99).toFixed(4) + ', p99.9 ' + pc(.999).toFixed(4) + ', max ' + s[s.length - 1].toFixed(3) + ' ms (budget per quantum ' + (128 / sr * 1000).toFixed(2) + ' ms) · >5×median: ' + big.length + ' ' + big.slice(0, 12).join(' '));
console.log('msgs: ' + r.msgs.length + ' ' + JSON.stringify([...new Set(r.msgs.map(m => Object.keys(m)[0]))]));
