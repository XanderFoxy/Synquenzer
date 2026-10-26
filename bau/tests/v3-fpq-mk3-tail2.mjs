import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms, mEinbruch, mKlick} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const lv = (x, a, b) => db(rms(x.l, Math.round(a * SR), Math.round(b * SR)) + rms(x.r, Math.round(a * SR), Math.round(b * SR)));
// T1 pad with long release; T2 at level 0 (silent, no solo); C3 released at 0.2 s, C5 held in T2; SPLIT 60 -> 62 at 0.5 s
const pad = {o1: {w: 2}, e2: {a: 0, d: 64, s: 127, r: 100}}, t2 = {o1: {w: 1}, a: {lvl: 0}};
const ev = [[0, 'on', 48, .8], [.2, 'off', 48], [.1, 'on', 72, .8], [1.4, 'off', 72]];
const a = render(prog({mode: 2, split: 60}, pad, t2), ev, {file: NEW, sec: 1.5});
const b = render(prog({mode: 2, split: 60}, pad, t2), ev, {file: NEW, sec: 1.5, at: [[.5, {mkSet: {split: 62}}]]});
const e = mEinbruch(b.l, SR, .5), k = mKlick(b.l, SR, [0]);
console.log('T1-Ausklang (C3 los bei 0,2 s), T2 hält C5 (PEGEL 0), SPLIT 60→62 bei 0,5 s: 0,45–0,5 s ' + lv(b, .45, .5).toFixed(1) + ' dB; 0,6–0,9 s ohne Wechsel ' + lv(a, .6, .9).toFixed(1) + ' / mit ' + lv(b, .6, .9).toFixed(1) + ' dB; M-EINBRUCH (Lesart min(vor, nach)) ' + e.worst.toFixed(1) + ' dB ok=' + e.ok + ', M-KLICK ' + k.worst.toFixed(1));
// the same with the key held in T1's range (C3 still held? no) – and a SPLIT drag on the knob (fractions) far away from every note
const at = []; for (let f = 0; f < 40; f++) at.push([.5 + f * 128 / SR, {mkSet: {split: 60 + 6 * f / 39}}]);
const c = render(prog({mode: 2, split: 60}, pad, t2), ev, {file: NEW, sec: 1.5, at});
console.log('SPLIT-Zug 60→66 (keine Note wechselt das Timbre): 0,6–0,9 s ' + lv(c, .6, .9).toFixed(1) + ' dB (ohne Zug ' + lv(a, .6, .9).toFixed(1) + ')');
const ka = mKlick(a.l, SR, [0]), kb = mKlick(b.l, SR, [0]);
console.log('M-KLICK ohne Wechsel ' + ka.worst.toFixed(1) + ' dB @' + ka.at.toFixed(3) + ' s; mit Wechsel ' + kb.worst.toFixed(1) + ' dB @' + kb.at.toFixed(3) + ' s');
// envelope around the switch, 2 ms steps
const env = []; for (let t = .49; t < .56; t += .004) env.push(t.toFixed(3) + ':' + lv(b, t, t + .004).toFixed(1)); console.log(env.join(' '));
