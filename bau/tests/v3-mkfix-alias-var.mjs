import {render, mkPatch} from './v3-mk1-node.mjs';
import {folded} from './v3-mk1-ana.mjs';
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
const file = process.env.MK_FILE2;
for (const [w1, w2] of [[0, 1], [1, 0], [1, 1], [2, 0], [2, 2], [0, 2]]) for (const md of [2, 3]) { const out = []; let pk = 0;
  for (const s of [1, 5, 7, 12, 17, 19]) { const x = render(mkPatch({o1: {w: w1}, o2: {w: w2, semi: s, mod: md}, mix: {o1: 0, o2: 127}, f: {cut: 127}, a: {gate: 1}}), [[0, 'on', 84, .8]], {sec: 1.2, file}).l;
    for (const y of x) pk = Math.max(pk, Math.abs(y)); out.push(s + ':' + folded(x, 9600, mtof(84), 48000).toFixed(1)); }
  console.log('w1', w1, 'w2', w2, md === 2 ? 'S ' : 'RS', out.join(' '), 'peak', pk.toFixed(3)); }
