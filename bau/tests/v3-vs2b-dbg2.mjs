import {loadDsp} from './v3-vs2-corpus.mjs';
import {renderContour, CONDS, melFor} from './v3-vs2b-synth.mjs';
const D = loadDsp('v3-vs2b-dbgcopy.html'); const c = CONDS.run150, notes = melFor(2 * 131 + 52 + 6, 52, c), sig = renderContour(notes, {voice: 'male', seed: 2});
globalThis.DBG = 1; const ns = D.segment(D.pyin(sig.x, {fs: 16000}), {snap: false, tuning: 'auto'}).notes; globalThis.DBG = 0;
console.log(ns.filter(n => n.t0 > 1.5 && n.t0 < 2).map(n => [n.t0.toFixed(3), n.t1.toFixed(3), n.n]));
