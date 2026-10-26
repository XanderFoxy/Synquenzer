import {render, vocP, noise, rms, db} from './v3-mk7-node.mjs';
const sr = 48000;
const b = render(vocP({res: 64}, {}), [[0, 'on', 48, .8]], {sec: 3, inputs: {e2: noise(3, sr, .1)}, at: [[1, {set: {mkLim: 1}}], [2, {set: {mkLim: 0}}]]});
const i = b.l.findIndex(x => !isFinite(x)); console.log('first NaN', i / sr);
const V = b.P.mk.vc; console.log(V.p4, V.p2, V.w4, V.wv, V.warm, Array.from(V.sz.slice(0, 12)), Array.from(V.env.slice(0, 4)), V.gA[0], V.bA[0], V.aA[0]);
