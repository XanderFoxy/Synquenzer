import {loadDsp, melody, renderVoice, score} from './v3-vs2-corpus.mjs';
const D = loadDsp(process.argv[2]); const [v, lo, hi] = process.argv[3].split(',');
const seed = +process.argv[4] || 1, co = JSON.parse(process.argv[5] || '{}');
const AM = Array.from({length: 12}, (_, k) => [9, 11, 0, 2, 4, 5, 7].includes(k));
const mel = melody(seed * 31 + +lo, +lo, +hi), sig = renderVoice(mel, {voice: v, seed: seed * 101 + +lo, ...co});
const hop = 80, nF = Math.floor((sig.x.length - 1) / hop) + 1; let mask = null;
if (co.mask) { mask = new Uint8Array(nF); for (const c of sig.clicks) { const a = Math.floor((c + 0.012 - 0.023) * 16000 / hop), b = Math.ceil((c + 0.012 + 0.035) * 16000 / hop); for (let i = a; i <= b && i < nF; i++) mask[i] = 1; } }
const tr = D.pyin(sig.x, {fs: 16000, mask}); const sg = D.segment(tr, {snap: true, scale: AM, root: 0});
const used = new Set();
for (const t of sig.truth) { const k = sg.notes.findIndex((d, i) => !used.has(i) && d.n === t.midi && Math.abs(d.t0 - t.on) <= 0.05); if (k >= 0) used.add(k); else console.log('MISS', t.on.toFixed(3), t.midi, (t.off - t.on).toFixed(2), 'near:', sg.notes.filter(d => Math.abs(d.t0 - t.on) < 0.2).map(d => d.t0.toFixed(3) + ':' + d.n + '(' + d.m + ')').join(' ')); }
sg.notes.forEach((d, i) => { if (!used.has(i)) console.log('EXTRA', d.t0.toFixed(3), d.t1.toFixed(3), d.n, d.m); });
console.log(score(tr, sg.notes, sig));
if (process.env.AT) { const at = +process.env.AT; console.log(sig.truth.filter(t => Math.abs(t.on - at) < 1.5)); console.log(sg.notes.filter(d => Math.abs(d.t0 - at) < 1.5));
  for (let i = Math.round((at - 0.3) / 0.005); i < Math.round((at + 0.3) / 0.005); i += 2) console.log((i * 0.005).toFixed(3), tr.f0[i].toFixed(1), tr.e10[i].toFixed(1), tr.vp[i].toFixed(2), tr.unk[i]); }
