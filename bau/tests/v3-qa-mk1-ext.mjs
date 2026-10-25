import {render, mkPatch} from './v3-mk1-node.mjs';
const out = [];
for (const ft of [0, 1, 2, 3]) for (const dist of [0, 1]) for (const [nm, note, kbd, trans] of [['top', 127, 63, 24], ['bottom', 0, -63, -24]]) {
  const p = mkPatch({asg: 2, udet: 99, trans, bend: trans > 0 ? 12 : -12, o1: {w: 1, c1: 127, c2: 127}, o2: {w: 1, mod: 3, semi: trans, tune: trans > 0 ? 63 : -63}, mix: {o1: 127, o2: 127, n: 127},
    f: {type: ft, cut: trans > 0 ? 127 : 0, res: 127, eg: trans > 0 ? 63 : -63, vel: trans > 0 ? 63 : -63, kbd}, a: {lvl: 127, dist, vel: 63, kbd: trans > 0 ? 63 : -63},
    e1: {a: 0, d: 0, s: 127, r: 127}, l1: {w: 3, f: 127}, l2: {w: 3, f: 127}, vib: 63});
  const r = render(p, [[0, 'on', note, 1]], {sec: 20, mw0: 1, at: [[1, {mkWheel: {bend: trans > 0 ? 1 : -1}}]]});
  let bad = 0, pk = 0; for (const ch of [r.l, r.r]) for (const x of ch) { if (!Number.isFinite(x)) bad++; else pk = Math.max(pk, Math.abs(x)); }
  out.push(`type ${ft} dist ${dist} ${nm}: NaN/Inf ${bad}, peak ${(20 * Math.log10(pk + 1e-30)).toFixed(1)} dBFS`);
}
console.log(out.join('\n'));
