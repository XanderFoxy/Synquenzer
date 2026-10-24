import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html');
const [dir, st, ms, seed, voice] = [+process.argv[2], +process.argv[3], +process.argv[4], +(process.argv[5]||1), process.argv[6]||'male'];
const b = voice === 'male' ? 50 : 62;
const notes = [0, 2, 4, 1, 3].map((s, k) => ({on: 0.3 + k * 0.85, dur: 0.6, midi: b + s, scoop: [dir * st, ms / 1000, process.env.SHAPE || 'cos'], vib: {ct: 30, hz: 5.5, delay: 0.25}, vowel: 'aoeau'[k]}));
const s = sing(notes, {voice, seed, sigma: 6, rev: false, snr: 50}), tr = DN.pyin(s.x, {fs: 16000});
const dbg = []; const r = DN.segment(tr, {snap: false, tuning: 'auto', dbg});
const hop = tr.hop / tr.fs;
console.log('hop', hop);
for (const d of dbg) { const {pre, ...x} = d; console.log(JSON.stringify(x, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v)); }
console.log(JSON.stringify(score(r.notes, s.truth, 0.1)));
console.log(r.notes.map(n => `[${n.t0.toFixed(3)}-${n.t1.toFixed(3)} ${n.n}]`).join(' '));
if (process.env.TR) { const [a, z] = process.env.TR.split(',').map(Number); let l = ''; for (let i = Math.round(a / hop); i < Math.round(z / hop); i++) l += `${(i*hop).toFixed(3)}:${tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(2) : '--'} `; console.log(l); }
