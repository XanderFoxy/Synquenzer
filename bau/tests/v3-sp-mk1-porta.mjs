// QA MK1-16: portamento t90 measured per 128-sample quantum from the voice pitch (no 30 Hz scope)
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
for (const [asg, trig, v] of [[0, 1, 64], [0, 1, 32], [0, 1, 96], [2, 1, 64], [1, 1, 64]]) {
  const {G, procs} = makeScope(SR);
  const p = mkPatch({asg, trig, porta: v});
  const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: 3}, mods: [], mk: p}});
  P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1});
  const ev = asg === 1 ? [[0, 1, 1, 48, .8, -1], [.3, 2, 1], [.3, 1, 2, 60, .8, -1]] : [[0, 1, 1, 48, .8, -1], [.3, 1, 2, 60, .8, -1]];
  P.onMsg({ev});
  const L = new Float32Array(128), R = new Float32Array(128); const tr = [];
  const pt = .002 * Math.pow(2, 12 * v / 127);
  for (let f = 0; f < SR * (0.3 + pt * 3 + .2); f += 128) { G.currentFrame = f; P.process([], [[L, R]]); const vv = P.mk.V.find(x => x.on && !x.ghost && x.gate); if (vv) tr.push([(f + 128) / SR, vv.pitch]); }
  const after = tr.filter(([t]) => t > .3); let t90 = null; for (const [t, pch] of after) if (pch >= 48 + .9 * 12) { t90 = t - .3; break; }
  console.log(`asg ${asg} trig ${trig} porta ${v}: W-13 ${(pt * 1000).toFixed(1)} ms, measured t90 ${t90 == null ? 'none' : (t90 * 1000).toFixed(1) + ' ms'} (${t90 == null ? '' : ((t90 / pt - 1) * 100).toFixed(1) + ' %'}), pitch at 0.3+ ${after.slice(0, 3).map(x => x[1].toFixed(2)).join(',')}`);
}
