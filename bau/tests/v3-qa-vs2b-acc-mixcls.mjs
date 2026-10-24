import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score, rng} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
const room = process.env.ROOM;
function mel(b, sd) { const r = rng(sd * 31 + b), CM = [0, 2, 4, 5, 7, 9, 11], sc = []; for (let m = b - 5; m <= b + 12; m++) if (CM.includes(((m % 12) + 12) % 12)) sc.push(m);
  let idx = sc.findIndex(m => m >= b), t = 0.3; const out = [], sb = 0.6;
  for (let k = 0; k < 20; k++) { const beats = [0.5, 0.5, 1, 1, 1.5, 2][Math.floor(r() * 6)], dur = beats * sb; let st = [-2, -1, -1, 1, 1, 2, 3, -3][Math.floor(r() * 8)]; if (idx + st < 0 || idx + st >= sc.length) st = -st; idx += st;
    const leg = k > 0 && r() < 0.4 && !out[k - 1].fall, n = {on: t, dur, midi: sc[idx]};
    if (leg) n.glide = 0.05 + r() * 0.15; else n.cons = ['', 'l', 'd', 'n', 's'][Math.floor(r() * 5)];
    if (!leg && r() < 0.4) n.scoop = [(r() < 0.75 ? 1 : -1) * (0.8 + r() * 2), 0.05 + r() * 0.1];
    if (dur >= 0.55) n.vib = {ct: 40 + r() * 80, hz: 5 + r() * 1.5, delay: 0.15 + r() * 0.1, jit: 1};
    out.push(n); t += dur;
    if (r() < 0.35) { n.fall = r() < 0.6 ? [1.5 + r() * 3.5, 0.08 + r() * 0.12, 8] : undefined; if (!n.fall) delete n.fall; t += 0.1 + r() * 0.3; }
  }
  for (let k = 1; k < out.length; k++) if (out[k].glide && out[k - 1].fall) { delete out[k].glide; out[k].on += 0.15; for (let j = k + 1; j < out.length; j++) out[j].on += 0.15; }
  return out; }
const cls = {n: {}, o: {}}; let sung = 0;
for (const seed of [11, 12, 13, 14, 15, 16]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
  const notes = mel(b, seed), s = sing(notes, {voice, seed, sigma: 6, ...(room ? {wet: -18, rt: 0.35, snr: 32} : {rev: false, snr: 50})}), tr = DN.pyin(s.x, {fs: 16000}); sung += notes.length;
  for (const [k, D] of [['n', DN], ['o', DO]]) {
    const ns = D.segment(tr, {snap: false, tuning: 'auto'}).notes, used = new Set();
    for (const t of s.truth) { let best = -1, bd = 1e9; const tl = Math.max(0.1, t.glide / 2 + 0.04); ns.forEach((n, i) => { if (used.has(i) || n.n !== t.midi) return; const d = Math.abs(n.t0 - t.on); if (d <= tl && d < bd) { bd = d; best = i; } }); if (best >= 0) used.add(best); }
    ns.forEach((n, i) => { if (used.has(i)) return; const mid = (n.t0 + n.t1) / 2;
      const j = notes.findIndex((q, jj) => mid >= s.truth[jj].on - 0.05 && mid < s.truth[jj].off + 0.05); const q = notes[j], T = s.truth[j];
      let c = 'other';
      if (q) { if (q.scoop && n.t0 < T.on + 0.06) c = 'scoop-start'; else if (q.glide && n.t0 < T.on + 0.1) c = 'glide'; else if (q.fall && n.t1 > T.off - 0.3) c = 'fall-end'; else if (n.n === q.midi) c = 'same-pitch split'; else if (q.vib) c = 'vibrato'; }
      cls[k][c] = (cls[k][c] || 0) + 1; if (k === 'n' && process.env.V) console.log(c, voice, seed, n.t0.toFixed(3), (n.t1 - n.t0).toFixed(3), n.n, q && q.midi, JSON.stringify(q)); });
  }
}
console.log(room ? 'ROOM' : 'CLEAN', 'sung', sung, 'NEW', JSON.stringify(cls.n), 'OLD', JSON.stringify(cls.o));
