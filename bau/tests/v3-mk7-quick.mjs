import {render, vocP, sine, noise, rms, db} from './v3-mk7-node.mjs';
const sr = 48000;
const mod = sine(950, 1, sr, .3);
let r = render(vocP({res: 64}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 60, .8]], {sec: 1, inputs: {e2: mod}});
console.log('noise carrier', db(rms(r.l, 24000, 48000)), db(rms(r.r, 24000, 48000)), r.l.some(x => !isFinite(x)));
r = render(vocP({}, {}), [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]], {sec: 1, inputs: {e2: noise(1, sr, .1)}});
console.log('saw chord, noise mod', db(rms(r.l, 24000, 48000)));
r = render(vocP({}, {}), [[0, 'on', 48, .8]], {sec: 1});
console.log('no input', db(rms(r.l, 24000, 48000)));
r = render(vocP({dir: 127}, {}), [], {sec: 1, inputs: {e2: mod}});
console.log('direct', db(rms(r.l, 24000, 48000)), db(rms(mod)));
// synth with Eingang
const p = vocP({}, {o1: {w: 7, c1: 0, c2: 0}}); p.mode = 0;
r = render(p, [[0, 'on', 60, .8]], {sec: 1, inputs: {e1: sine(440, 1, sr, .5)}});
console.log('synth Eingang', db(rms(r.l, 24000, 48000)));
