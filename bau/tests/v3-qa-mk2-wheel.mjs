import {render, mkPatch} from './v3-mk1-node.mjs';
import {zcFreq} from './v3-mk1-ana.mjs';
const SR = 48000, c = f => 1200 * Math.log2(f / 261.6256);
const base = {o1: {w: 3, c1: 0}, f: {cut: 127}, a: {gate: 1}};
for (const [s, msg] of [[7, {mkWheel: {mod: 1}}], [6, {mkWheel: {bend: 1}}], [6, {mkWheel: {bend: -1}}], [7, {mkWheel: {mod: .5}}]]) {
  const p = mkPatch(Object.assign({}, base, {bend: 0, p: [{s, d: 0, i: 63}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}]}));
  const r = render(p, [[0, 'on', 60, .8]], {sec: 1, at: [[0, msg]]});
  console.log('src', s, JSON.stringify(msg), 'pitch', c(zcFreq(r.l, 24000, 48000, SR)).toFixed(1), 'ct');
}
