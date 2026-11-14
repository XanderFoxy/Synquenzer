// IMP1 Node-Test: synthetische Songs (Drums, Bass, Akkorde, Teile) und Gesang-only → Erkennung prüfen
import fs from 'node:fs';
const src = fs.readFileSync(new URL('./core.js', import.meta.url), 'utf8');
const imp1Core = new Function(src + '\nreturn imp1Core;')();
const C = imp1Core();
const SR = 44100;
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
const NOTE = {C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function chordNotes(name) { const minor = name.endsWith('m'), r = NOTE[minor ? name.slice(0, -1) : name]; return [r, r + (minor ? 3 : 4), r + 7]; }
// meter: beats(quarters) per bar, eighth pattern
const METER = {
  '4/4': {q: 4, kick: [0, 2], snare: [1, 3], hat: .5, bass: 1},
  '3/4': {q: 3, kick: [0], snare: [1, 2], hat: .5, bass: 1},
  '2/4': {q: 2, kick: [0], snare: [1], hat: .5, bass: 1},
  '6/8': {q: 3, kick: [0], snare: [1.5], hat: .5, bass: 1.5},
  '12/8': {q: 6, kick: [0, 3], snare: [1.5, 4.5], hat: .5, bass: 1.5},
};
function song(o) {
  const {bpm, ts, parts} = o, me = METER[ts], sp = 60 / bpm, lead = o.lead || .5;
  let bars = 0; for (const p of parts) bars += p.bars;
  const n = Math.ceil((lead + bars * me.q * sp + 2) * SR), x = new Float32Array(n);
  const add = (t0, fn, len) => { const i0 = Math.round(t0 * SR), L = Math.round(len * SR); for (let i = 0; i < L && i0 + i < n; i++) x[i0 + i] += fn(i / SR); };
  let bar = 0; const truth = [];
  for (const p of parts) {
    truth.push({name: p.name, a: bar, b: bar + p.bars});
    for (let j = 0; j < p.bars; j++, bar++) {
      const tb = lead + bar * me.q * sp, ch = p.chords[j % p.chords.length], cn = chordNotes(ch), lv = p.lv || 1;
      if (p.drums !== false) {
        for (const k of me.kick) add(tb + k * sp, t => .9 * lv * Math.sin(2 * Math.PI * (50 * t + 70 * (1 - Math.exp(-t * 30)) / 30)) * Math.exp(-t * 18), .25);
        for (const k of me.snare) add(tb + k * sp, t => .5 * lv * (rnd() * .8 + .3 * Math.sin(2 * Math.PI * 190 * t)) * Math.exp(-t * 25), .2);
        for (let h = 0; h < me.q - 1e-9; h += me.hat) add(tb + h * sp, t => .12 * lv * (p.hat || 1) * rnd() * Math.exp(-t * 90), .05);
      }
      for (let h = 0; h < me.q - 1e-9; h += me.bass) { const f = hz(36 + cn[0]); add(tb + h * sp, t => .35 * lv * Math.sin(2 * Math.PI * f * t) * Math.min(1, t * 200) * Math.exp(-t * 3), me.bass * sp * .95); }
      const L = me.q * sp; for (const c of cn) { const f = hz(60 + c); add(tb, t => .07 * lv * (Math.sin(2 * Math.PI * f * t) + .4 * Math.sin(4 * Math.PI * f * t) + .2 * Math.sin(6 * Math.PI * f * t)) * Math.min(1, t * 50) * Math.min(1, (L - t) * 20), L); }
      if (p.lead) for (let h = 0; h < me.q; h += 1) { const f = hz(72 + cn[(h + bar) % 3]); add(tb + h * sp, t => .06 * lv * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4), sp * .9); }
    }
  }
  return {x, truth, lead, bars};
}
// Gesang-only: Silben (Vokal mit Formanten + Konsonant) auf Achtel/Viertel, mit Pausen
function vocal(o) {
  const {bpm} = o, sp = 60 / bpm, bars = o.bars || 16, lead = .7, n = Math.ceil((lead + bars * 4 * sp + 2) * SR), x = new Float32Array(n);
  const pat = [[0, 1, 1.5, 2, 3], [0, .5, 1, 2, 2.5, 3.5], [0, 1, 2, 3], [.5, 1, 2, 3, 3.5]];
  for (let b = 0; b < bars; b++) {
    if (b % 4 === 3) continue;                                 // Atempause
    for (const q of pat[b % 4]) {
      const t0 = lead + (b * 4 + q) * sp + (rnd() * .015), f0 = 180 * Math.pow(2, ((b * 3 + q * 2) % 7) / 12), len = sp * .45 + .05;
      const i0 = Math.round(t0 * SR);
      for (let i = 0; i < len * SR && i0 + i < n; i++) {
        const t = i / SR, env = Math.min(1, t * 40) * Math.exp(-t * 2) * Math.min(1, (len - t) * 30);
        let v = 0; for (let h = 1; h <= 12; h++) { const f = f0 * h, a = Math.exp(-Math.pow((f - 700) / 300, 2)) + .5 * Math.exp(-Math.pow((f - 1200) / 400, 2)) + .1; v += a * Math.sin(2 * Math.PI * f * t) / h; }
        const cons = t < .04 ? rnd() * .3 * (1 - t / .04) : 0;
        x[i0 + i] += .3 * env * v + cons;
      }
    }
  }
  return {x, lead};
}
const V = ['Am', 'F', 'C', 'G'], CH = ['F', 'G', 'C', 'Am'], BR = ['Dm', 'Em', 'F', 'G'];
const std = (ts, bpm) => song({bpm, ts, parts: [
  {name: 'Intro', bars: 4, chords: ['Am'], lv: .5, hat: 0},
  {name: 'Strophe', bars: 8, chords: V, lv: .7},
  {name: 'Refrain', bars: 8, chords: CH, lv: 1, hat: 2, lead: 1},
  {name: 'Strophe', bars: 8, chords: V, lv: .7},
  {name: 'Refrain', bars: 8, chords: CH, lv: 1, hat: 2, lead: 1},
  {name: 'Bridge', bars: 8, chords: BR, lv: .8},
  {name: 'Refrain', bars: 8, chords: CH, lv: 1, hat: 2, lead: 1},
  {name: 'Outro', bars: 4, chords: ['Am', 'G'], lv: .5, drums: false},
]});
const cases = process.argv[2] ? process.argv.slice(2) : ['92 4/4', '120 3/4', '120 6/8', '128 4/4', '75 4/4', '100 12/8', '110 2/4', 'v92', 'v120'];
const out = [];
for (const c of cases) {
  const t0 = Date.now();
  if (c[0] === 'v') {
    const bpm = +c.slice(1), s = vocal({bpm}), r = C.analyse(s.x, SR, {});
    const ok = Math.abs(r.bpm - bpm) <= 1 || r.alt.some(a => Math.abs(a - bpm) <= 1);
    out.push({case: 'Gesang ' + bpm, ok, bpm: r.bpm, alt: r.alt, quelle: r.quelle, frage: r.frage, t1: r.t1, lead: s.lead, ms: Date.now() - t0, lowRatio: r.lowRatio, pulse: r.pulse});
    continue;
  }
  const [b, ts] = c.split(' '), bpm = +b, s = std(ts, bpm), r = C.analyse(s.x, SR, {}); if (process.env.NV) console.log(JSON.stringify(r.nov));
  const barSec = METER[ts].q * 60 / bpm, t1err = (r.t1 - s.lead) / barSec;
  const tb = s.truth.slice(1).map(p => p.a), db = r.teile.slice(1).map(p => p.a + Math.round(t1err));
  const miss = tb.filter(a => !db.some(d => Math.abs(d - a) <= 1)), extra = db.filter(d => !tb.some(a => Math.abs(d - a) <= 1));
  const ok = Math.abs(r.bpm - bpm) <= 1 && r.ts === ts && Math.abs(t1err - Math.round(t1err)) < .1 && Math.abs(Math.round(t1err)) === 0 && !miss.length && !extra.length;
  out.push({case: c, ok, bpm: r.bpm, roh: r.bpmRoh, ts: r.ts, t1: r.t1, lead: s.lead, t1Takte: +t1err.toFixed(2), teile: r.teile.map(p => p.name + '@' + p.a).join(' '), soll: s.truth.map(p => p.name + '@' + p.a).join(' '), miss, extra, stabil: r.stabil, ms: Date.now() - t0, quelle: r.quelle});
}
for (const o of out) console.log(JSON.stringify(o));
console.log('OK', out.filter(o => o.ok).length, '/', out.length);
