import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const ev = [[0, 'on', 60, .9], [.3, 'off', 60]];
const offMsg = {mkSet: {'mfx.dep': 0, 'dly.dep': 0, 'eq.lg': 0, 'eq.hg': 0}};
const fx = {mfx: {type: 2, spd: 64, dep: 127}};
const a = render(FXP(fx), ev, {sec: 2.4, file: FILE, at: [[.6, offMsg]]}), b = render(FXP({}), ev, {sec: 2.4, file: FILE});
const flat = (o, pre, out, seen) => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); for (const k of Object.keys(o)) { const v = o[k]; if (k === 'fx' || k === 'h' || k === 'host') continue; const p = pre + '.' + k; if (typeof v === 'number') out[p] = v; else if (ArrayBuffer.isView(v)) { for (let i = 0; i < Math.min(v.length, 64); i++) out[p + '[' + i + ']'] = v[i]; } else if (typeof v === 'object') flat(v, p, out, seen); } };
const A = {}, B = {}; flat(a.P.mk, 'mk', A, new Set()); flat(b.P.mk, 'mk', B, new Set());
const PA = {}, PB = {}; for (const k of Object.keys(a.P)) { const v = a.P[k]; if (typeof v === 'number') PA[k] = v; } for (const k of Object.keys(b.P)) { const v = b.P[k]; if (typeof v === 'number') PB[k] = v; }
let n = 0; for (const k in A) if (A[k] !== B[k] && !(Number.isNaN(A[k]) && Number.isNaN(B[k]))) { if (n++ < 40) console.log('mk diff', k, A[k], B[k]); }
for (const k in PA) if (PA[k] !== PB[k]) console.log('proc diff', k, PA[k], PB[k]);
console.log('dcS', Array.from(a.P.dcS), Array.from(b.P.dcS));
