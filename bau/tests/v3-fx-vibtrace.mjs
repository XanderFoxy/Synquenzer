// trace lit keys for one legato phrase: node v3-fx-vibtrace.mjs E R phi-index tr [file]
import fs from 'fs';
const SR = 48000;
const wkSrc = f => { const h = fs.readFileSync(f, 'utf8'), A = 'const ST_WK = `', a = h.indexOf(A) + A.length, E = "registerProcessor('synq-stimme', SynqStimme);", b = h.indexOf(E, a) + E.length; return h.slice(a, b); };
function runWk(src, x) { let C = null; const out = []; class AWP { constructor() { this.port = {postMessage: m => out.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0; new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AWP, (n, c) => { C = c; }, SR);
  const p = new C({processorOptions: {block: 4096, mpm: {src: 'voice', lock: false, bl: 0, bb: 0, lat: 0, unc: 50}}}); const ref = new Float32Array(128), o = [[new Float32Array(128)]];
  for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [ref]], o); } return out.filter(m => m.lit !== undefined).map(m => [+(m.f / SR).toFixed(3), m.lit + (m.why ? ' L' + m.why + ' hc' + m.hc + ' [' + m.tp + ']' : '')]); }
const FM = [[800, 80, 1], [1150, 90, 0.6], [2800, 140, 0.2], [3500, 200, 0.1]];
const fgain = f => { let g = 0.02; for (const [c, bw, a] of FM) g += a / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
function synth(dur, pitch, amp) { const n = Math.round(dur * SR), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, m = pitch(t), a = amp(t), f0 = 440 * 2 ** ((m - 69) / 12); ph += 2 * Math.PI * f0 / SR; let v = 0; if (a > 0) for (let h = 1; h * f0 < 6500; h++) v += fgain(h * f0) / h ** 1.2 * Math.sin(h * ph); x[i] = 0.12 * a * v; } return x; }
const [E, R, s, tr] = process.argv.slice(2, 6).map(Number), file = process.argv[6] || '../dirigent-wt/index.html';
const PH = [[60, 0.6], [62, 0.6], [64, 0.6], [65, 0.6], [67, 0.6], [65, 0.6], [64, 0.6], [62, 0.6]].map(([m, d]) => [m + tr, d]), g = 0.06, t0 = 0.3, phi = 2 * Math.PI * s / 8 + 0.3;
const on = []; let t = t0; for (const [m, d] of PH) { on.push([t, t + d, m]); t += d; } const tEnd = t;
const base = tt => { for (let k = 0; k < on.length; k++) { const [a, b, m] = on[k]; if (tt < b || k === on.length - 1) { if (k > 0 && tt < a + g / 2) { const pm = on[k - 1][2], u = (tt - (a - g / 2)) / g; return pm + (m - pm) * Math.max(0, Math.min(1, u)); } if (k < on.length - 1 && tt > b - g / 2) { const nm = on[k + 1][2], u = (tt - (b - g / 2)) / g; return m + (nm - m) * Math.max(0, Math.min(1, u)); } return m; } } };
const pitch = tt => base(tt) + (tt >= t0 ? E / 100 * Math.sin(2 * Math.PI * R * (tt - t0) + phi) : 0);
const amp = tt => tt < t0 ? 0 : tt < t0 + 0.015 ? (tt - t0) / 0.015 : tt < tEnd - 0.03 ? 1 : tt < tEnd ? (tEnd - tt) / 0.03 : 0;
let SRCX = wkSrc(file); if (process.env.WHY) SRCX = SRCX.replace("this.port.postMessage({lit: note, f: Math.max(F, currentFrame), c: Math.round(cl * 100) / 100});", "this.port.postMessage({lit: note, f: Math.max(F, currentFrame), why: (new Error().stack.split('\\n')[2].match(/:(\\d+):\\d+\\)?$/) || [])[1], tp: (this.tp || []).map(q => q.v.toFixed(2) + '@' + q.i + '/' + q.dw).join(' '), hc: this.hc});");
const ev = runWk(SRCX, synth(tEnd + 0.5, pitch, amp));
console.log('notes', JSON.stringify(on.map(([a, b, m]) => [+a.toFixed(2), m])));
console.log(ev.map(([t, k]) => `${t}:${k}`).join(process.env.WHY ? '\n' : ' '));
