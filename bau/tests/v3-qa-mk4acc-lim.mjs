// B.4 CPU-Begrenzer Stufe 2: "Mod-FX Ensemble -> 1 Abgriff". Ensemble render at limiter level 0 vs 2 (mkLim via set)
import {render, mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE;
const p = Object.assign(mkPatch({o1: {w: 0}, mix: {o1: 0, n: 127}, a: {gate: 1}}), {mfx: {type: 1, spd: 64, dep: 127}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}});
const ev = [[.05, 'on', 60, .9], [1.0, 'off', 60]];
const a = render(p, ev, {sec: 1.1, file: FILE, flat: {mkLim: 0}}), b = render(p, ev, {sec: 1.1, file: FILE, flat: {mkLim: 2}, at: [[0, {set: {mkLim: 2}}]]});
let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
console.log('mk.lim in the processor', b.P.mk.lim, '| max |Δ| Ensemble Stufe 0 vs Stufe 2:', d, d === 0 ? '(no change: Ensemble keeps 3 taps at limiter level 2)' : '');
// the same check for voices (maxV 2 at lim 2) proves the limiter level arrives
const ch = [[.05, 'on', 48, .9], [.05, 'on', 52, .9], [.05, 'on', 55, .9], [.05, 'on', 60, .9], [1, 'off', 48], [1, 'off', 52], [1, 'off', 55], [1, 'off', 60]];
const p2 = mkPatch({o1: {w: 0}, mix: {o1: 127}});
const c = render(p2, ch, {sec: 1.1, file: FILE, flat: {mkLim: 0}}), e = render(p2, ch, {sec: 1.1, file: FILE, flat: {mkLim: 2}});
let d2 = 0; for (let i = 0; i < c.l.length; i++) d2 = Math.max(d2, Math.abs(c.l[i] - e.l[i]));
console.log('voices at lim 2 differ (limiter level reaches MkCore):', d2 > 0, d2);
