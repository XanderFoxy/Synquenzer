import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp(process.env.NEWF || '../dirigent-wt/index.html');
const [st, ms, seed, voice] = [+process.argv[2], +process.argv[3], +(process.argv[4]||1), process.argv[5]||'male'];
const b = voice === 'male' ? 50 : 62;
const notes = [0, 3, 1, 5].map((s, k) => ({on: 0.3 + k * 0.95, dur: 0.65, midi: b + s, fall: [st, ms / 1000, 9], vib: {ct: 35, hz: 5.5, delay: 0.25}}));
const s = sing(notes, process.env.CLEAN ? {voice, seed, sigma: 6, snr: 50, rev: false} : {voice, seed, sigma: 6, snr: 35, wet: -16, rt: 0.35}), tr = DN.pyin(s.x, {fs: 16000});
const dbg = []; const r = DN.segment(tr, {snap: false, tuning: 'auto', dbg});
const hop = tr.hop / tr.fs;
for (const d of dbg) { const {pre, ea, eb, vb, ...x} = d; console.log(JSON.stringify({t: +(d.a * hop).toFixed(3), ...x}, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v)); }
console.log(JSON.stringify(score(r.notes, s.truth, 0.1)));
console.log(r.notes.map(n => `[${n.t0.toFixed(3)}-${n.t1.toFixed(3)} ${n.n}]`).join(' '));
if (process.env.TR) { const [a, z] = process.env.TR.split(',').map(Number); let l = ''; for (let i = Math.round(a / hop); i < Math.round(z / hop); i++) l += `${(i*hop).toFixed(3)}:${tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(2) : '--'}/${tr.e10[i].toFixed(0)} `; console.log(l); }
