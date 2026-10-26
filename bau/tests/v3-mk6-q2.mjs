import {render, mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE, PREV = process.env.MK_PREV;
const p = mkPatch({});
const a = render(p, [[0, 'on', 60, .8]], {sec: .05, file: FILE}), b = render(p, [[0, 'on', 60, .8]], {sec: .05, file: PREV});
console.log(Array.from(a.l.slice(0, 8)).map(x => x.toFixed(5)).join(' ')); console.log(Array.from(b.l.slice(0, 8)).map(x => x.toFixed(5)).join(' '));
console.log(Array.from(a.l.slice(1000, 1008)).map(x => x.toFixed(5)).join(' ')); console.log(Array.from(b.l.slice(1000, 1008)).map(x => x.toFixed(5)).join(' '));
