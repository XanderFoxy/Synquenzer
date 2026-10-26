import {render, vocP, noise} from './v3-mk7-node.mjs';
const sr = 48000, NZ = {mix: {o1: 0, o2: 0, n: 127}};
const r2 = render(vocP({res: 127, efs: 126}, NZ), [[0, 'on', 60, 1], [1, 'off', 60]], {sec: 30, inputs: {e2: Float32Array.from({length: sr}, () => Math.random() - .5)}, quantumMs: true});
const per = 375, win = []; for (let s = 0; s < 30; s++) { const q = r2.qms.slice(s * per, (s + 1) * per).sort((a, b) => a - b); win.push((q[Math.floor(q.length / 2)] * per).toFixed(2)); }
console.log(win.join(' '));
const V = r2.P.mk.vc; console.log(V.stail, V.htail, Array.from(V.env.slice(0, 3)), V.az.slice(0, 6));
