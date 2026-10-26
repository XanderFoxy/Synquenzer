// QA MK6 motion recording edge cases in the worklet (Node): LÄNGE 1, LÄNGE 2, KEY SYNC Stimme with note release during recording
import {render, mkPatch} from './v3-mk2-node.mjs';
const FILE = process.env.MK_FILE;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const SP = (t, sq) => { const p = mkPatch(t || {}); const q = (sq.q || []).concat([Q(0), Q(0), Q(0)]).slice(0, 3); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq, {q}); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: FILE}, o || {}));
function rec(sq, sec, evs, knobAt) {
  const at = [[.05, {mkRec: {k: 0, tg: 11, base: 64}}]];
  for (let i = 0; i < 40; i++) { const t = .06 + i * (knobAt || .05); if (t < sec - .05) at.push([t, {mkSet: {'t.0.f.cut': 64 + ((i * 7) % 50)}}]); }
  const r = R(SP({f: {cut: 64}}, sq), evs || [[0, 'on', 60, .8]], {sec, at});
  const done = r.msgs.filter(m => m.mkRecDone).map(m => m.mkRecDone);
  return done;
}
for (const L of [1, 2, 3, 16]) {
  const d = rec({last: L, res: 3}, 3.0);
  console.log(`LÄNGE ${L}, 1/16 @120 (cycle ${L * 125} ms), 3 s: mkRecDone ${d.length ? 'after steps ' + d[0].from + '-' + d[0].to : 'NEVER (recording still running)'}`);
}
// KEY SYNC Stimme: the recorded voice is released mid-recording, another note is held
{ const d = rec({last: 16, res: 3, ks: 2}, 3.5, [[0, 'on', 60, .8], [.5, 'on', 64, .8], [.7, 'off', 60]]);
  console.log('KEY SYNC Stimme, the newest voice ends mid-recording:', d.length ? 'done, steps ' + d[0].from + '-' + d[0].to + ' values ' + d[0].v.join(',') : 'NEVER'); }
