// QA VS2b: builder's own corpus/scoring (v3-vs2b-synth/live), wide vibrato WITHOUT the per-note vibrato delay (vibrato already
// present at the note onset, e.g. a trained singer), base 4.5.1 vs new 4.5.2
import fs from 'fs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
import {make, liveScore, srcOf} from './v3-vs2b-live.mjs';
import {resample} from './v3-vs2b-real.mjs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const S = {base: srcOf(fs.readFileSync(SCR + 'synq-snapshots/G-P1b-gruppe-fix.html', 'utf8')), new: srcOf(fs.readFileSync(SCR + 'dirigent-wt/index.html', 'utf8'))};
const SR = 48000;
for (const [label, vib, delay] of [['vibWide as built (delay 0.08)', [90, 130], 0.08], ['vibWide, vibrato from onset', [90, 130], 0], ['vib 60-90 ct from onset', [60, 90], 0], ['vib 60-90 ct delay 0.15', [60, 90], 0.15]]) {
  const c = Object.assign({}, CONDS.vibWide, {vib, vibDelay: delay});
  const row = {};
  for (const k of ['base', 'new']) { const r = {notes: 0, segs: 0, wrong: 0, wrong30: 0, wob: 0, found: 0, right: 0, dur: 0};
    for (const seed of [1, 2, 3]) for (const voice of ['male', 'female']) {
      const base = voice === 'male' ? 52 : 64, notes = melFor(seed * 131 + base + 7, base, c), sig = renderContour(notes, {voice, seed});
      const x = resample(sig.x, 16000, SR), W = make(SR, {src: 'voice', lock: false}, S[k]); W.run(x);
      const s = liveScore(W.msgs, sig.truth); r.notes += sig.truth.length; for (const f of ['segs', 'wrong', 'wrong30', 'wob', 'found']) r[f] += s[f];
      // share of sung time (from on+0.1 to off-0.06) in which the right key is lit
      const L = W.msgs.filter(m => m.lit !== undefined).map(m => ({n: m.lit, t: m.f / SR}));
      for (const tr of sig.truth) { const A = tr.on + 0.1, B = tr.off - 0.06; if (B <= A) continue; r.dur += B - A; let cur = -1, last = 0;
        const add = (a, b, n) => { const lo = Math.max(a, A), hi = Math.min(b, B); if (hi > lo && n === tr.midi) r.right += hi - lo; };
        for (const q of L) { add(last, q.t, cur); cur = q.n; last = q.t; } add(last, B, cur); }
    }
    row[k] = `${r.notes} notes: key msgs ${r.segs}, wrong ${r.wrong} (≥30 ms ${r.wrong30}), wobble ${r.wob}, right key lit ${(100 * r.right / r.dur).toFixed(0)} % of sung time`; }
  console.log(label + '\n   base: ' + row.base + '\n   new : ' + row.new);
}
