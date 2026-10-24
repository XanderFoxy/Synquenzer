import fs from 'fs';
import {loadDsp} from './v3-vs2-corpus.mjs';
import {readWav, resample} from './v3-vs2b-real.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
const w = readWav(DIR + 'vocadito_1.wav'), x = resample(w.x, w.sr, 16000), tr = DN.pyin(x, {fs: 16000});
const ann = A => fs.readFileSync(DIR + `vocadito_1_notes${A}.csv`, 'utf8').trim().split(/\n/).map(l => l.split(',').map(Number)).map(([on, hz, d]) => ({on, off: on + d, m: 69 + 12 * Math.log2(hz / 440)}));
for (const [name, D] of [['NEW', DN], ['OLD', DO]]) {
  const sg = D.segment(tr, {snap: false, tuning: 'auto'}), ns = sg.notes, tune = sg.tuneCt / 100;
  for (const A of ['A1', 'A2']) {
    const an = ann(A), used = new Set(), match = new Array(ns.length).fill(-1);
    // greedy: onset ±100 ms, pitch class exact after tuning
    const pairs = []; ns.forEach((n, i) => an.forEach((a, j) => { const d = Math.abs(n.t0 - a.on); if (d <= 0.1 && n.n === Math.round(a.m - tune)) pairs.push([d, i, j]); }));
    pairs.sort((p, q) => p[0] - q[0]); const uj = new Set(); for (const [d, i, j] of pairs) if (match[i] < 0 && !uj.has(j)) { match[i] = j; uj.add(j); }
    const fp = ns.map((n, i) => ({n, i})).filter(o => match[o.i] < 0).map(({n, i}) => {
      // which annotated note(s) overlap this detection
      const ov = an.filter(a => a.off > n.t0 && a.on < n.t1).map(a => Math.round(a.m - tune));
      const p = ns[i - 1], q = ns[i + 1];
      return `${n.t0.toFixed(2)}+${Math.round((n.t1 - n.t0) * 1000)}ms n${n.n} (prev ${p ? p.n : '-'}${p ? '@' + Math.round((n.t0 - p.t1) * 1000) : ''} next ${q ? q.n : '-'}${q ? '@' + Math.round((q.t0 - n.t1) * 1000) : ''}) ann[${ov}]`; });
    console.log(`${name} ${A}: ${ns.length} det, ${an.length} ann, hit ${uj.size}, FP ${fp.length}: ${fp.join(' | ')}`);
  }
}
