import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing} from './v3-qa-vs2b-acc-synth.mjs';
import fs from 'fs';
const DN = loadDsp('../dirigent-wt/index.html');
const rows = [];
function collect(tag, x, truth) {
  const tr = DN.pyin(x, {fs: 16000}), dbg = []; DN.segment(tr, {snap: false, tuning: 'auto', dbg});
  const hop = tr.hop / tr.fs;
  for (const d of dbg) { const t0 = d.a * hop, real = truth.some(t => Math.abs(t0 - t.on) < 0.05 && Math.abs(d.m - t.midi) < 0.5 && (t.off - t.on) < 0.3); rows.push({tag, real, ...d}); }
}
for (const room of [0, 1]) for (const st of [2, 4, 6]) for (const ms of [80, 140, 220]) for (const seed of [1, 2]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
  const notes = [0, 3, 1, 5].map((s, k) => ({on: 0.3 + k * 0.95, dur: 0.65, midi: b + s, fall: [st, ms / 1000, 9], vib: {ct: 35, hz: 5.5, delay: 0.25}}));
  const s = sing(notes, room ? {voice, seed, sigma: 6, snr: 35, wet: -16, rt: 0.35} : {voice, seed, sigma: 6, snr: 50, rev: false});
  collect(`${room ? 'room' : 'dry'}fall${st}/${ms}`, s.x, s.truth);
}
// real short end notes: run endings and short final notes in a room
const up = b => { const sc = []; for (let m = b - 5; m <= b + 14; m++) if ([0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12)) sc.push(m); return sc; };
for (const room of [0, 1]) for (const [bpm, leg] of [[120, 1], [150, 1], [160, 0]]) for (const seed of [1, 2, 3]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
  const sc = up(b), st = sc.findIndex(m => m >= b), d = leg ? 60 / bpm / 4 : 60 / bpm / 2, seq = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1];
  const ph = []; for (let r = 0; r < 3; r++) seq.slice(0, 5 + r * 3).forEach((q, k, arr) => ph.push({q, k, rr: r}));
  let t = 0.3; const notes = []; for (let r = 0; r < 3; r++) { const L = 5 + r * 3; for (let k = 0; k < L; k++) { const n = {on: t, dur: leg ? d : d - 0.04, midi: sc[st + seq[k]], cons: leg ? '' : 'd'}; if (leg && k) n.glide = 0.025; notes.push(n); t += d; } t += 0.4; }
  const s = sing(notes, room ? {voice, seed, sigma: 6, snr: 35, wet: -16, rt: 0.35} : {voice, seed, sigma: 6, snr: 35, rev: false}); collect(`${room ? 'room' : 'dry'}run${bpm}`, s.x, s.truth);
}
fs.writeFileSync('v3-fx-fallfeat.json', JSON.stringify(rows)); console.log(rows.length);
