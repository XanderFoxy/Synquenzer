import {loadDsp, melody, renderVoice} from './v3-vs2-corpus.mjs';
const [file, voice, seedS, lo, hi, condJ] = process.argv.slice(2);
const D = loadDsp(file), seed = +seedS, L = +lo, H = +hi, co = condJ ? JSON.parse(condJ) : {};
const AM = Array.from({length: 12}, (_, k) => [9, 11, 0, 2, 4, 5, 7].includes(k));
const mel = melody(seed * 31 + L, L, H), sig = renderVoice(mel, {voice, seed: seed * 101 + L, ...co});
const tr = D.pyin(sig.x, {fs: 16000}), ns = D.segment(tr, {snap: true, scale: AM, root: 0, tuning: 'auto'}).notes, hop = tr.hop / tr.fs;
const ev = [...mel.map(n => ({t: n.on, s: 'T', d: n.dur, m: n.midi, x: (n.legato ? 'leg ' : '') + (n.rest ? 'rest' + n.rest : '')})), ...ns.map(n => ({t: n.t0, s: 'D', d: n.t1 - n.t0, m: n.m, n: n.n, by: n.by}))].sort((p, q) => p.t - q.t);
for (const e of ev) { let trc = ''; if (e.s === 'D') { const a = Math.round(e.t / hop), b = Math.round((e.t + e.d) / hop); const v = []; for (let i = a; i < b; i += 3) v.push(tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(1) : '-'); trc = v.join(' '); }
  console.log((e.s === 'T' ? 'T ' : '     D ') + e.t.toFixed(3), e.d.toFixed(3), (+e.m).toFixed(2), e.n ?? '', e.by ?? '', e.x ?? '', trc.slice(0, 200)); }
