import {loadDsp} from './v3-vs2-corpus.mjs';
import {readWav, resample} from './v3-vs2b-real.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const DN = loadDsp('../dirigent-wt/index.html');
const [k, a, b] = process.argv.slice(2); const w = readWav(DIR + `vocadito_${k}.wav`), x = resample(w.x, w.sr, 16000), tr = DN.pyin(x, {fs: 16000});
const ns = DN.segment(tr, {snap: false, tuning: 'auto'}).notes.filter(n => n.t1 > +a && n.t0 < +b);
console.log(ns.map(n => `[${n.t0.toFixed(3)}-${n.t1.toFixed(3)} ${n.n} ${n.m} ${n.by}]`).join(' '));
let line = ''; const hop = tr.hop / tr.fs; for (let i = Math.round(+a / hop); i < Math.round(+b / hop); i++) line += `${(i * hop).toFixed(3)}:${tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(2) : '--'}/${tr.e10[i].toFixed(0)} `; console.log(line);
