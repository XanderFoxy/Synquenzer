import fs from 'fs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
import {resample} from './v3-vs2b-real.mjs';
import {make, srcOf} from './v3-vs2b-live.mjs';
const SN = srcOf(fs.readFileSync('../dirigent-wt/index.html', 'utf8')), SO = srcOf(fs.readFileSync('v3-fx-452.html', 'utf8'));
const name = process.argv[3] || 'vibWide', c = CONDS[name];
const WHY = process.env.WHY;
const SNX = WHY ? SN.replace("this.port.postMessage({lit: note, f: Math.max(F, currentFrame), c: Math.round(cl * 100) / 100});", "this.port.postMessage({lit: note, f: Math.max(F, currentFrame), why: (new Error().stack.split('\\n')[2].match(/:(\\d+):\\d+\\)?$/) || [])[1] + ' hc' + this.hc + ' [' + (this.tp||[]).map(q => q.v.toFixed(2) + '@' + q.i + '/' + q.dw).join(' ') + ']'});") : SN;
for (const seed of [1, 2]) for (const voice of ['male', 'female']) {
  const base = voice === 'male' ? 52 : 64, notes = melFor(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
  const x = resample(sig.x, 16000, 48000);
  const R = {}; for (const [k, S] of [['n', SNX], ['o', SO]]) { const W = make(48000, {src: 'voice', lock: false}, S); W.run(x); R[k] = W.msgs.filter(m => m.lit !== undefined).map(m => ({n: m.lit, t: m.f / 48000, why: m.why})); }
  for (const t of sig.truth) {
    const segs = k => R[k].filter((m, i) => { const t1 = i + 1 < R[k].length ? R[k][i + 1].t : 1e9; return m.n >= 0 && t1 > t.on + 0.1 && m.t < t.off - 0.06; });
    const a = segs('n'), b = segs('o');
    if (a.length > b.length) console.log(seed, voice, 'note', t.midi, t.on.toFixed(2), '-', t.off.toFixed(2), 'NEW', a.map(m => `${m.t.toFixed(3)}:${m.n}${m.why ? 'L' + m.why : ''}`).join(' '), '| OLD', b.map(m => `${m.t.toFixed(3)}:${m.n}`).join(' '));
  }
}
