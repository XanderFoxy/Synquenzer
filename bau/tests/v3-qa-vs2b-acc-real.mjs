import fs from 'fs';
import {loadDsp} from './v3-vs2-corpus.mjs';
import {readWav, resample} from './v3-vs2b-real.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
for (const k of ['1', '10', '14']) {
  const w = readWav(DIR + `vocadito_${k}.wav`), x = resample(w.x, w.sr, 16000), tr = DN.pyin(x, {fs: 16000});
  for (const [name, D] of [['NEW', DN], ['OLD', DO]]) {
    const ns = D.segment(tr, {snap: false, tuning: 'auto'}).notes;
    // short fragments: < 100 ms, same MIDI as a neighbour within 40 ms gap
    const frag = []; ns.forEach((n, i) => { if (n.t1 - n.t0 >= 0.1) return; const p = ns[i - 1], q = ns[i + 1];
      const sp = p && p.n === n.n && n.t0 - p.t1 < 0.04, sq = q && q.n === n.n && q.t0 - n.t1 < 0.04; frag.push([+n.t0.toFixed(3), +(n.t1 - n.t0).toFixed(3), n.n, sp ? 'samePrev gap ' + (n.t0 - p.t1).toFixed(3) : sq ? 'sameNext gap ' + (q.t0 - n.t1).toFixed(3) : 'diff', p ? p.n : null, q ? q.n : null]); });
    console.log(`vocadito_${k} ${name}: ${ns.length} notes, short<100ms: ${JSON.stringify(frag)}`);
  }
}
