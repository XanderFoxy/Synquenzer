// collect features of short pieces in the post-pass, labelled real/false
import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing} from './v3-qa-vs2b-acc-synth.mjs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
const DN = loadDsp(process.argv[2] || '../dirigent-wt/index.html');
const rows = [];
function collect(tag, x, truth) {
  const tr = DN.pyin(x, {fs: 16000}), dbg = []; DN.segment(tr, {snap: false, tuning: 'auto', dbg});
  const hop = tr.hop / tr.fs;
  for (const d of dbg) {
    const t0 = d.a * hop, real = truth.some(t => Math.abs(t0 - t.on) < 0.05 && Math.abs(d.m - t.midi) < 0.5 && (t.off - t.on) < 0.3);
    rows.push({tag, real, ...d});
  }
}
// builder corpora
for (const name of Object.keys(CONDS)) for (const seed of [1, 2, 3]) for (const voice of ['male', 'female']) {
  const base = voice === 'male' ? 52 : 64, c = CONDS[name], notes = melFor(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
  collect('B:' + name, sig.x, sig.truth);
}
// QA scoops
for (const dir of [1, -1]) for (const st of [1, 1.3, 1.6]) for (const ms of [120, 140, 160]) for (const seed of [1, 2]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
  const notes = [0, 2, 4, 1, 3].map((s, k) => ({on: 0.3 + k * 0.85, dur: 0.6, midi: b + s, scoop: [dir * st, ms / 1000], vib: {ct: 30, hz: 5.5, delay: 0.25}, vowel: 'aoeau'[k]}));
  const s = sing(notes, {voice, seed, sigma: 6, rev: false, snr: 50}); collect(`Q:scoop${dir * st}/${ms}`, s.x, s.truth);
}
// QA runs
const up = b => { const sc = []; for (let m = b - 5; m <= b + 14; m++) if ([0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12)) sc.push(m); return sc; };
for (const [bpm, leg] of [[120, 1], [132, 1], [150, 1], [160, 0]]) for (const seed of [1, 2, 3]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
  const sc = up(b), st = sc.findIndex(m => m >= b), d = leg ? 60 / bpm / 4 : 60 / bpm / 2, seq = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1];
  const notes = seq.map((q, k) => { const n = {on: 0.3 + k * d, dur: leg ? d : d - 0.04, midi: sc[st + q], cons: leg ? '' : 'd'}; if (leg && k) n.glide = 0.025; return n; });
  const s = sing(notes, {voice, seed, sigma: 6, snr: 35}); collect(`Q:run${bpm}`, s.x, s.truth);
}
import fs from 'fs';
fs.writeFileSync('v3-fx-feat.json', JSON.stringify(rows));
console.log(rows.length, 'rows', rows.filter(r => r.real).length, 'real');
