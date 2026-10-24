import {loadDsp} from './v3-vs2-corpus.mjs';
import {readWav, resample} from './v3-vs2b-real.mjs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
const w = readWav('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/vocadito_1.wav'), x = resample(w.x, w.sr, 16000);
const c = {...CONDS.mix, n: 120}, sig = renderContour(melFor(7, 52, c), {voice: 'male', seed: 7, snr: 30});
for (const f of [process.argv[2], process.argv[3]]) { const D = loadDsp(f);
  for (const [nm, s] of [['vocadito_1 33 s', x], ['mix ' + (sig.x.length / 16000).toFixed(0) + ' s', sig.x]]) {
    const tr = D.pyin(s, {fs: 16000}); let t0 = performance.now(); for (let i = 0; i < 5; i++) D.segment(tr, {snap: false, tuning: 'auto'}); const seg = (performance.now() - t0) / 5;
    t0 = performance.now(); D.pyin(s, {fs: 16000}); const py = performance.now() - t0;
    console.log(f.split('/').pop(), nm, 'pyin', py.toFixed(0), 'ms, segment', seg.toFixed(1), 'ms'); } }
