// MK-P-10: sounds render bit-identical to 4.15.0 (mkRender in both builds, same sound JSON)
import {launch, open, FILE, VORG} from './v3-qmkp-lib.mjs';
const b = await launch();
const mkSounds = async page => page.evaluate(() => { const out = []; const Q = SYNQUENZER; Q.setEngine(0, 'mk');
  const base = JSON.stringify(S.tracks[0].sound); out.push(['init', base]);
  const set = (o) => { const s = JSON.parse(base); for (const [p, v] of o) SQMK.mkPathSet(s.p.mk, p, v); s.p.mk = SQMK.normMk(s.p.mk); return JSON.stringify(s); };
  out.push(['seqarp', set([['t.0.seq.on', 1], ['t.0.seq.q.0.k', 11], ['t.0.seq.q.0.v.3', 40], ['arp.on', 0], ['mfx.dep', 70], ['dly.dep', 60], ['t.0.f.res', 90], ['t.0.o1.w', 3], ['t.0.o1.c1', 80]])]);
  out.push(['dual', set([['mode', 1], ['t.1.o1.w', 1], ['t.1.f.cut', 40], ['t.0.p.0.s', 2], ['t.0.p.0.d', 4], ['t.0.p.0.i', 50]])]);
  out.push(['voc', set([['mode', 3], ['voc.cut', 20], ['voc.res', 80]])]);
  return out; });
const render = (page, snd, voc) => page.evaluate(async ([snd, voc]) => { const ev = [[0.05, 'on', 48, .8], [0.05, 'on', 60, .7], [0.9, 'off', 48, 0], [0.9, 'off', 60, 0], [1.0, 'on', 67, .9], [1.4, 'off', 67, 0]]; const o = {sec: 1.6, sr: 48000, seed: 3};
  if (voc) { const n = 1.6 * 48000, a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = .3 * Math.sin(2 * Math.PI * 180 * i / 48000) * (1 + Math.sin(i / 3000)); o.inputs = {e2: a}; }
  const r = await SYNQUENZER.mkRender(JSON.parse(snd), ev, o); return [Array.from(r.l), Array.from(r.r)]; }, [snd, voc]);
const pn = await open(b, 'P1'); const po = await open(b, 'P1', {file: VORG});
const S_ = await mkSounds(pn);
for (const [nm, snd] of S_) { const A = await render(pn, snd, nm === 'voc'), B = await render(po, snd, nm === 'voc'); let m = 0, e = 0; for (const c of [0, 1]) for (let i = 0; i < A[c].length; i++) { m = Math.max(m, Math.abs(A[c][i] - B[c][i])); e += A[c][i] * A[c][i]; } console.log(nm, 'max|Δ|', m, 'energy', e.toFixed(2)); }
console.log('errs', JSON.stringify(pn.errs), JSON.stringify(po.errs));
await b.close();
