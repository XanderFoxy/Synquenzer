import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms, peaks} from './v3-mk1-ana.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); if (t1 && t1.p) p.t[0].p = C(t1.p); return p; };
const P0 = [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}];
// W-22 amp keytrack: +63 → 0.3 dB per HT of KT; Pelog key C, E4 = −130 ct → −0.39 dB vs equal
const sine = {o1: {w: 3, c1: 0}, a: {kbd: 63}};
const L = sc => { const r = render(prog({scale: sc}, sine), [[0, 'on', 64, .8]], {file: NEW, sec: .8}); return db(rms(r.l, 9600, 38400)); };
console.log('W-22 Amp-Keytrack +63: Pelog − Gleichstufig bei E4 =', (L(8) - L(0)).toFixed(3), 'dB (Soll ' + (.3 * -1.3).toFixed(3) + ' dB)');
// W-18 patch source Keytrack → Cutoff i 63, filter self-oscillating, filter keytrack 0
const wh = {mix: {o1: 0, o2: 0, n: 0}, f: {type: 0, cut: 60, res: 127, kbd: 0}, p: [{s: 5, d: 4, i: 63}, P0[1], P0[2], P0[3]]};
const fq = sc => { const r = render(prog({scale: sc}, wh), [[0, 'on', 64, .8]], {file: NEW, sec: 1.2}); return peaks(r.l, Math.round(.4 * SR), SR, 32768, 1)[0].f; };
const d = 1200 * Math.log2(fq(8) / fq(0)); console.log('W-18 Quelle Keytrack → Cutoff i 63: Pelog vs Gleichstufig bei E4 =', d.toFixed(1), 'ct (Soll ≈ ' + (127 * (-1.3 / 60) * 1200 * Math.log2(1000) / 127).toFixed(1) + ' ct)');
