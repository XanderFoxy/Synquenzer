// BM2-12 robust: 10 minutes (MIN=… to change) of random flight at 48 kHz: random programs (every field of section 5.1 in its range,
// masks 0..511, all modes, waves, slots), notes (up to 14 at a time), controllers (bend / MW / pressure), set messages, limiter.
// Every sample finite, DC (mean of each 10 s; sub-audio notes below 1 Hz are sound, not DC) <= 0.005, peak <= +12 dBFS (before the master limiter).
import fs from 'fs';
import {makeScope} from './bm-node.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000, MIN = +process.env.MIN || 10;
let s = 0x1234567; const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
const I = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
const LFO = 'freq vol flt mask pan o1f o1v o1m o2f o2v o2m nf nv fx1t fx2t fx2b'.split(' '), MW = 'flt l1a l1s l2a l2s vol mask freq o1v o1m o2v o2m nf nv fx1b fx2b'.split(' '), V = 'flt feg vol mask peg atk'.split(' ');
const env = () => ({l: I(0, 99), a: I(0, 15), d: I(0, 15), s: I(0, 15), r: I(0, 15), lp: I(0, 1)});
const osc = () => ({m: I(0, 511), st: I(-60, 60), tu: I(-50, 50), ds: I(-256, 256), dv: I(1, 40), e: env()});
const slots = (list, lo) => [0, 1, 2, 3].map(() => [pick(list), rnd() < .5 ? 0 : I(lo, 99)]);
const progR = () => ({o1: osc(), o2: osc(), n: {fr: I(0, 99), e: env()}, f: {cu: I(0, 99), re: I(0, 99), md: pick(['lp', 'hp', 'bp', 'notch']), tk: I(0, 100), e: env()},
  pe: {ds: I(-63, 63), dv: I(1, 40), de: I(-63, 63)}, l1: {sp: I(0, 99), w: pick(['sin', 'sqr', 'up', 'down', 'saws', 'step', 'hsin', 'rand']), dl: I(0, 15), dc: I(0, 15), t: slots(LFO, 0)},
  l2: {sp: I(0, 99), w: pick(['sin', 'sqr', 'up', 'down', 'saws', 'step', 'hsin', 'rand']), dl: I(0, 15), dc: I(0, 15), t: slots(LFO, 0)},
  mo: {v: slots(V, -99), mw: slots(MW, -99), at: slots(MW, -99)}, fx: {t1: 'CH1', b1: 0, t2: 'RV1', b2: 0, sy: 0},
  g: {mo: pick(['poly', 'mono', 'slur', 'mport', 'para', 'moly', 'pslur', 'mretrig', 'pretrig']), vo: I(0, 99), st: I(-48, 48), po: I(0, 13), ps: I(0, 15), ra: I(0, 15)}});
const glR = () => ({tm: pick(['et', 'arab', 'jmaj', 'jmin', 'mean', 'pyta']), st: I(-24, 24), tn: I(400, 470), vc: I(1, 6), ac: I(0, 6), pb: I(0, 12), tf: I(0, 1)});
const {G, procs} = makeScope(SR), P = new procs['synq-bm']({}), send = m => P.port.onmessage({data: m});
const L = new Float32Array(128), R = new Float32Array(128), INS = [], OUTS = [[L, R]];
let nan = 0, peak = 0, dcWorst = 0, sum = 0, n = 0, held = [], id = 1, t = 0, progs = 0, notes = 0;
const blocks = Math.round(MIN * 60 * SR / 128), t0 = Date.now();
for (let b = 0; b < blocks; b++) {
  t = b * 128 / SR; G.T[0] = t;
  if (b % Math.round(SR / 128 * 4) === 0) { send({t: 'prog', ab: 'a', p: progR()}); send({t: 'gl', p: glR()}); progs++; if (rnd() < .1) send({t: 'lim', level: I(0, 2)}); }
  if (rnd() < .06) { const n0 = I(24, 100), i = id++; held.push(i); send({t: 'on', list: [{n: n0, v: rnd(), at: t + rnd() * .003, d: 0, id: i}]}); notes++; }
  if (held.length && (rnd() < .05 || held.length > 14)) { const i = held.splice(I(0, held.length - 1), 1)[0]; send({t: 'off', list: [{n: 0, at: t + rnd() * .003, id: i}]}); }
  if (rnd() < .03) send({t: 'ctl', bend: rnd() * 2 - 1}); if (rnd() < .03) send({t: 'ctl', mw: rnd()}); if (rnd() < .03) send({t: 'ctl', pr: rnd()});
  if (rnd() < .02) send({t: 'set', ab: 'a', k: pick(['o1.m', 'o2.m', 'f.cu', 'f.re', 'o1.e.l', 'n.fr', 'g.vo', 'o1.st']), v: I(0, 99)});
  if (rnd() < .0005) send({t: 'panic'}); if (rnd() < .0005) send({t: 'stop', at: t, tau: .02});
  L.fill(0); R.fill(0); P.process(INS, OUTS);
  for (let i = 0; i < 128; i++) { const a = L[i], c = R[i]; if (!Number.isFinite(a) || !Number.isFinite(c)) nan++; else { const m = Math.max(Math.abs(a), Math.abs(c)); if (m > peak) peak = m; sum += a + c; n += 2; } }
  if (n >= 20 * SR) { dcWorst = Math.max(dcWorst, Math.abs(sum / n)); sum = 0; n = 0; }
}
const pk = 20 * Math.log10(peak), ok = nan === 0 && dcWorst <= .005 && pk <= 12;
const info = MIN + ' min, ' + progs + ' Programme, ' + notes + ' Noten: NaN/Inf ' + nan + ', Gleichanteil (Mittel je 10 s) max ' + dcWorst.toExponential(2) + ', Spitze ' + pk.toFixed(2) + ' dBFS (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s Rechenzeit)';
console.log((ok ? 'PASS' : 'FAIL') + ' BM2-12 Zufallsflug: kein NaN/Inf, Gleichanteil ≤ 0,005, Spitze ≤ +12 dBFS — ' + info);
fs.writeFileSync(HERE + 'bm2-robust.out.json', JSON.stringify([{id: 'BM2-12', ok, info}], null, 1));
process.exit(ok ? 0 : 1);
