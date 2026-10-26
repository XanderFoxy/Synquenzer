// Independent reproduction: SPLIT change in Split mode while a key is held -> do unrelated release tails get cut?
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const L = (x, a, b) => db(rms(x.l, Math.round(a * SR), Math.round(b * SR)));
const Rr = (x, a, b) => db(rms(x.r, Math.round(a * SR), Math.round(b * SR)));
// T1 pad hard left, T2 saw hard right and AUDIBLE
const t1 = {o1: {w: 2}, e2: {a: 0, d: 64, s: 127, r: 100}, a: {pan: -63}}, t2 = {o1: {w: 0}, a: {pan: 63}, e2: {a: 0, d: 64, s: 127, r: 8}};
const ev = [[0, 'on', 48, .8], [.2, 'off', 48], [.1, 'on', 72, .8], [1.4, 'off', 72]];
const P = () => prog({mode: 2, split: 60}, t1, t2);
const base = render(P(), ev, {file: NEW, sec: 1.5});
const one = render(P(), ev, {file: NEW, sec: 1.5, at: [[.5, {mkSet: {split: 62}}]]});
console.log('Separation check (T2 alone in L before 0.1 s? T1 alone in R):', 'R 0.02-0.09 ' + Rr(base, .02, .09).toFixed(1), 'L 0.02-0.09 ' + L(base, .02, .09).toFixed(1));
console.log('T1 tail (L) 0.6-0.9 s: no change ' + L(base, .6, .9).toFixed(1) + ' dB, SPLIT 60->62 at 0.5 s ' + L(one, .6, .9).toFixed(1) + ' dB');
console.log('T2 held C5 (R) 0.6-0.9 s: no change ' + Rr(base, .6, .9).toFixed(1) + ' dB, with change ' + Rr(one, .6, .9).toFixed(1) + ' dB');
const env = []; for (let t = .49; t < .6; t += .005) env.push(t.toFixed(3) + ' L' + L(one, t, t + .005).toFixed(1) + '/' + L(base, t, t + .005).toFixed(1) + ' R' + Rr(one, t, t + .005).toFixed(1) + '/' + Rr(base, t, t + .005).toFixed(1));
console.log(env.join('\n'));
// control: same SPLIT change with NO key held (C5 released before) -> tail should survive
const ev2 = [[0, 'on', 48, .8], [.2, 'off', 48]];
const b2 = render(P(), ev2, {file: NEW, sec: 1.5}), c2 = render(P(), ev2, {file: NEW, sec: 1.5, at: [[.5, {mkSet: {split: 62}}]]});
console.log('Control (no key held): T1 tail 0.6-0.9 no change ' + L(b2, .6, .9).toFixed(1) + ' / with change ' + L(c2, .6, .9).toFixed(1));
// Split <- next note scenario: tail of C3 ringing in T1, then the user plays E3 (52) armed; split set to 52 at note-on (52 now T2)
const ev3 = [[0, 'on', 48, .8], [.2, 'off', 48], [.5, 'on', 52, .8], [1.4, 'off', 52]];
const b3 = render(P(), ev3, {file: NEW, sec: 1.5}), c3 = render(P(), ev3, {file: NEW, sec: 1.5, at: [[.5 + 128 / SR, {mkSet: {split: 52}}]]});
// T1 tail alone: render with tail note only for ref; L channel contains T1 (C3 tail + E3 in base); compare C3 tail by rendering without E3
const ref3 = render(P(), ev2, {file: NEW, sec: 1.5});
console.log('Split<-next note (E3 becomes split, E3 -> T2): L 0.6-0.9 with switch ' + L(c3, .6, .9).toFixed(1) + ' dB; C3 tail alone ' + L(ref3, .6, .9).toFixed(1) + ' dB; R (E3 in T2) ' + Rr(c3, .6, .9).toFixed(1));
