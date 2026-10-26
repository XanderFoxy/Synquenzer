import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {spectrum, pdb} from './v3-mk1-ana.mjs';
const SR = 48000, BANDS = [[20, 45], [45, 90], [90, 180], [180, 400], [400, 1200], [1200, 4000], [4000, 12000]];
for (const w2 of [0, 2]) for (const c1 of [0, 32, 64, 96, 127]) {
  const x = renderW(mkPatch({o1: {w: 3, c1}, o2: {w: w2}, f: {cut: 100}}), [[0, 'on', 48, .8]], {sec: .5}, []).l;
  const P = spectrum(x, 2400, 8192, 'hann'), bin = SR / 8192; let tot = 0; for (const p of P) tot += p;
  console.log('o2', w2, c1, BANDS.map(([a, b]) => { let e = 0; for (let k = Math.ceil(a / bin); k < b / bin; k++) e += P[k]; return pdb(e / tot).toFixed(1); }).join(' '));
}
