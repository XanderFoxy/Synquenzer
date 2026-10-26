// per-band env: full vs half rate (noise modulator, sine at band centres)
import {render, vocP, noise, sine} from './v3-mk7-node.mjs';
const sr = 48000;
const avgEnv = (inp, lim, efs) => {
  const p = vocP({efs: efs == null ? 64 : efs}, {}), acc = new Float64Array(16); let n = 0;
  const o = {sec: 2.5, inputs: {e2: inp}}; if (lim) o.at = [[0, {set: {mkLim: 1}}]];
  // sample env at many points: rerun render with increasing sec is costly; read final env averaged over last blocks via hook
  const r = render(p, [], o); const vc = r.P.mk.vc; return Array.from(vc.env);
};
for (const efs of [0, 64, 120]) {
  const a = avgEnv(noise(2.5, sr, .2, 9), 0, efs), b = avgEnv(noise(2.5, sr, .2, 9), 1, efs);
  console.log('noise efs', efs, a.map((x, i) => (20 * Math.log10(b[i] / x)).toFixed(1)).join(' '));
}
