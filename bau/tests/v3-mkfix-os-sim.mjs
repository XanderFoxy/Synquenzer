// what would k x oversampling (render at k*48k, ideal-ish decimation) give for Sync / Ring+Sync at C6?
import {render, mkPatch} from './v3-mk1-node.mjs';
import {folded} from './v3-mk1-ana.mjs';
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
const K = +(process.env.K || 2), note = +(process.env.NOTE || 84);
const L = 511, h = new Float64Array(L); { const fc = 0.5 / K * 0.9; let s = 0; for (let i = 0; i < L; i++) { const m = i - (L - 1) / 2; const sinc = m === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * m) / (Math.PI * m); const w = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (L - 1)) + 0.08 * Math.cos(4 * Math.PI * i / (L - 1)); h[i] = sinc * w; s += h[i]; } for (let i = 0; i < L; i++) h[i] /= s; }
const dec = x => { const n = Math.floor((x.length - L) / K), y = new Float64Array(n); for (let j = 0; j < n; j++) { let a = 0; const o = j * K; for (let i = 0; i < L; i++) a += h[i] * x[o + i]; y[j] = a; } return y; };
for (const md of [2, 3]) { const out = [];
  for (let s = 1; s <= 19; s++) { const x = render(mkPatch({o1: {w: 0}, o2: {w: 0, semi: s, mod: md}, mix: {o1: 0, o2: 127}, f: {cut: 127}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: 1.2, sr: 48000 * K}).l;
    const y = dec(x); out.push(s + ':' + folded(Float32Array.from(y), 9600, mtof(note), 48000).toFixed(1)); }
  console.log(K + 'x', md === 2 ? 'S ' : 'RS', out.join(' ')); }
