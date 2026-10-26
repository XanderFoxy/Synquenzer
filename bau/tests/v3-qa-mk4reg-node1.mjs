// QA MK4 (Node, worklet of the MK4 copy): echo of the first note vs. later notes
import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
const D = {type: 0, sync: 0, time: 110, note: 8, dep: 127};
const P = dep => Object.assign(mkPatch({}), {mfx: {type: 0, spd: 64, dep: 0}, dly: Object.assign({}, D, {dep}), eq: {lf: 320, lg: 0, hf: 6000, hg: 0}});
const seg = (x, t0, t1) => { let s = 0, n = 0; for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR); i++) { s += x[i] * x[i]; n++; } return Math.round(10 * Math.log10(s / n + 1e-30)); };
const show = (name, r) => console.log(name.padEnd(28), Array.from({length: 25}, (_, k) => seg(r.l, k * .1, k * .1 + .1)).join(' '));
show('A note@0 (patch dep127)', render(P(127), [[0, 'on', 57, .9], [.15, 'off', 57]], {sec: 2.5}));
show('B note@0.5 (patch dep127)', render(P(127), [[.5, 'on', 57, .9], [.65, 'off', 57]], {sec: 2.5}));
show('C mkSet@0, note@0.5', render(P(0), [[.5, 'on', 57, .9], [.65, 'off', 57]], {sec: 2.5, at: [[0, {mkSet: {'dly.time': 110, 'dly.dep': 127}}]]}));
show('D 2 notes 0.5 / 1.5', render(P(127), [[.5, 'on', 57, .9], [.65, 'off', 57], [1.5, 'on', 57, .9], [1.65, 'off', 57]], {sec: 2.5}));
