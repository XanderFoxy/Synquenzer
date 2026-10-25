import {render, mkPatch} from './v3-mk1-node.mjs';
import {folded} from './v3-mk1-ana.mjs';
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
const notes = (process.env.NOTES || '84').split(',').map(Number);
for (const note of notes) for (const md of [2, 3]) { const out = [];
  for (let s = 1; s <= 19; s++) { const x = render(mkPatch({o1: {w: 0}, o2: {w: 0, semi: s, mod: md}, mix: {o1: 0, o2: 127}, f: {cut: 127}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: 1.2}).l;
    out.push(s + ':' + folded(x, 9600, mtof(note), 48000).toFixed(1)); }
  console.log(note, md === 2 ? 'S ' : 'RS', out.join(' ')); }
