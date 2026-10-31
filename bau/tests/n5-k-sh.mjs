// K1-02 Sample & Hold: one new random value per LFO cycle, held until the next (VA global + per note, AM LFO 1 S/H with the
// 'lfo' tap), and the S&H sound bit-equal to 4.23.0 (worklet renders of both builds)
import {va, INIT, FILE, diffDb} from './n5-k-lib.mjs';
import {render as mkr, mkPatch} from './v3-mk1-node.mjs';
const BASE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-base-B.html', sr = 48000;
const out = {};
// steps of a sampled control signal: runs of equal values; their lengths against the cycle
function steps(x, per) { const runs = []; let n = 1; for (let i = 1; i < x.length; i++) { if (x[i] === x[i - 1]) n++; else { runs.push(n); n = 1; } } runs.push(n); const inner = runs.slice(1, -1); return {count: inner.length, minRun: Math.min(...inner), maxRun: Math.max(...inner), per, distinct: new Set(x).size}; }
// VA: S&H routed to the amp at full depth would mix in the voice; read the source through the scope (30 Hz, 4 s, 2 Hz LFO)
for (const retrig of [0, 1]) {
  const r = va(Object.assign({}, INIT, {l1shape: 4, l1rate: 2, l1retrig: retrig}), [[0, 'on', 60, .8], [3.9, 'off', 60]], {sec: 4, mods: [{src: 1, dst: 3, amt: .3}], at: [[0, {scope: true}]]});
  const v = r.msgs.filter(m => m.scope && m.nv).map(m => m.scope[1]);
  out['va_retrig' + retrig] = steps(v, Math.round(30 / 2));
}
// AM: LFO 1 wave S/H (w 3) at f such that W-08 = 2 Hz-ish; tap 'lfo' = lv1 of the oldest voice per sample
{ const f = Math.round(127 / 10 * Math.log2(2 / .05)), hz = .05 * Math.pow(2, 10 * f / 127);
  for (const ks of [0, 2]) { const r = mkr(mkPatch({l1: {w: 3, ks, sync: 0, f, note: 6}}), [[0, 'on', 60, .8], [3.9, 'off', 60]], {sec: 4, tap: 'lfo', file: FILE});
    out['mk_ks' + ks] = steps(Array.from(r.l.subarray(Math.round(.01 * sr), Math.round(3.8 * sr))), Math.round(sr / hz)); } }
// the S&H sound against 4.23.0: VA S&H -> cutoff (global, per note), AM S/H -> cutoff via patch
const evs = [[0, 'on', 48, .9], [.7, 'on', 55, .8], [1.5, 'off', 48], [2, 'off', 55]];
const cmp = {};
for (const retrig of [0, 1]) { const p = Object.assign({}, INIT, {cutoff: 900, res: .5, l1shape: 4, l1rate: 6, l1retrig: retrig});
  const a = va(p, evs, {sec: 2.5, mods: [{src: 1, dst: 3, amt: .3}]}), b = va(p, evs, {sec: 2.5, mods: [{src: 1, dst: 3, amt: .3}], file: BASE}); cmp['va' + retrig] = +diffDb(a.l, b.l).toFixed(1); }
for (const ks of [0, 1, 2]) { const pm = mkPatch({l1: {w: 3, ks, f: 90}, f: {cut: 60, res: 60}, p: [{s: 2, d: 4, i: 40}, {s: 2, d: 4, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]});
  const a = mkr(pm, evs, {sec: 2.5, file: FILE}), b = mkr(pm, evs, {sec: 2.5, file: BASE}); cmp['mk' + ks] = +diffDb(a.l, b.l).toFixed(1); }
out.vs423 = cmp;
const okSteps = o => o.count >= 5 && o.minRun >= o.per * .85 && o.maxRun <= o.per * 1.15;
out.pass = ['va_retrig0', 'va_retrig1', 'mk_ks0', 'mk_ks2'].every(k => okSteps(out[k])) && Object.values(cmp).every(x => x <= -90);
console.log(JSON.stringify(out));
