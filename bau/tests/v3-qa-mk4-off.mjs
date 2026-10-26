import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const ev = [[0, 'on', 60, .9], [.3, 'off', 60], [2.5, 'on', 64, .8], [3.0, 'off', 64]];
for (const fx of [{mfx: {type: 2, spd: 64, dep: 127}}, {eq: {lf: 100, lg: 6, hf: 6000, hg: -6}}]) {
  const offMsg = {mkSet: {'mfx.dep': 0, 'dly.dep': 0, 'eq.lg': 0, 'eq.hg': 0}};
  const a = render(FXP(fx), ev, {sec: 3.5, file: FILE, at: [[.6, offMsg]]}), b = render(FXP({}), ev, {sec: 3.5, file: FILE});
  const c = render(FXP({}), ev, {sec: 3.5, file: FILE, at: [[.6, offMsg]]});
  const win = (x, y, t0, t1) => { let w = 0; for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR); i++) w = Math.max(w, Math.abs(x[i] - y[i])); return w; };
  const ts = [0, .1, .3, .5, .6, .62, .7, 1, 2, 2.5, 2.51, 2.6, 3, 3.4];
  console.log(JSON.stringify(fx), 'a-b:', ts.slice(0, -1).map((t, k) => t + ':' + win(a.l, b.l, t, ts[k + 1]).toExponential(1)).join(' '));
  console.log('  c-b (no fx, same message):', win(c.l, b.l, 0, 3.4).toExponential(1));
  const fxs = a.P.mk.fx; console.log('  fx state', JSON.stringify({md: fxs.md, sMd: fxs.sMd, sW: fxs.sW, lg: fxs.lg, sLg: fxs.sLg, hg: fxs.hg, sHg: fxs.sHg, mOn: fxs.mOn, lOn: fxs.lOn, hOn: fxs.hOn, quiet: fxs.quiet}));
  // peak level of b in note 2
  let pk = 0; for (let i = 2.5 * SR; i < 3.4 * SR; i++) pk = Math.max(pk, Math.abs(b.l[i])); console.log('  note-2 peak', pk.toFixed(3));
  // is a = b shifted? DC blocker? check a-b mean
  let m = 0; for (let i = 2.5 * SR; i < 3.4 * SR; i++) m += a.l[i] - b.l[i]; console.log('  mean diff', (m / (0.9 * SR)).toExponential(2));
}
