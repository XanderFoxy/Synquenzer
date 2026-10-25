// independent check: are the VA and AM voices alive for the whole run (RMS per 5 s window), and voice counts
import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
const AMP = mkPatch({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20});
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const ev = n => [36, 43, 48, 52].slice(0, n).map(x => [0, 'on', x, .8]);
const rmsw = (x) => { const o = []; for (let s = 0; s < x.length; s += 5 * SR) { let a = 0; for (let i = s; i < s + 5 * SR && i < x.length; i++) a += x[i] * x[i]; o.push((10 * Math.log10(a / (5 * SR) + 1e-30)).toFixed(1)); } return o.join(' '); };
const a = render(AMP, ev(1), {sec: 30, mw0: .5}); console.log('AM1 dB per 5s:', rmsw(a.l));
const v = render(null, ev(1), {sec: 30, eng: 0, flat: VA}); console.log('VA1 dB per 5s:', rmsw(v.l));
const P = v.P; console.log('VA proc keys:', Object.keys(P).slice(0, 60).join(','));
