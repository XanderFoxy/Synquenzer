// Independent repro: own simple additive voice (no QA synth), raised-cosine scoop into each note, detached notes.
import {loadDsp} from './v3-vs2-corpus.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
const fs = 16000;
function voice(notes, total, o = {}) {
  const x = new Float32Array(Math.round(total * fs)); let ph = 0;
  // simple 2-pole formant resonators applied after
  for (const n of notes) {
    const i0 = Math.round(n.on * fs), i1 = Math.round((n.on + n.dur) * fs);
    for (let i = i0; i < i1; i++) {
      const t = (i - i0) / fs; let off = 0;
      if (n.scoop && t < n.scoop[1]) { const u = t / n.scoop[1]; off = -n.scoop[0] * (o.shape === 'lin' ? (1 - u) : (1 + Math.cos(Math.PI * u)) / 2); }
      const vib = t > 0.25 ? 0.3 * Math.sin(2 * Math.PI * 5.5 * t) : 0;
      const f = 440 * Math.pow(2, (n.midi + off + vib - 69) / 12);
      ph += f / fs; let s = 0;
      for (let k = 1; k * f < 4000; k++) s += Math.sin(2 * Math.PI * k * ph) / Math.pow(k, 1.2) * (k * f < 900 ? 1 : 0.4);
      const env = Math.min(1, t / 0.02, (i1 - i) / fs / 0.03);
      x[i] += 0.15 * s * env;
    }
  }
  let r = 1; for (let i = 0; i < x.length; i++) { r = (r * 16807) % 2147483647; x[i] += (r / 2147483647 - 0.5) * 0.0005; }
  return x;
}
const st = +(process.argv[2] || 1.3), ms = +(process.argv[3] || 140), shape = process.argv[4] || 'cos';
for (const [lbl, D] of [['4.5.2', DN], ['4.5.1', DO]]) {
  let extra = 0, hit = 0, sung = 0; const ex = [];
  for (const base of [48, 52, 57, 62, 65]) {
    const notes = [0, 2, 4, 1, 3, 5].map((s, k) => ({on: 0.3 + k * 0.85, dur: 0.6, midi: base + s, scoop: [st, ms / 1000]}));
    const x = voice(notes, 0.3 + 6 * 0.85 + 0.4, {shape}), tr = D.pyin(x, {fs});
    const ns = D.segment(tr, {snap: false, tuning: 'auto'}).notes; const used = new Set();
    for (const n of notes) { sung++; const k = ns.findIndex((q, i) => !used.has(i) && Math.abs(q.m - n.midi) < 0.6 && Math.abs(q.t0 - n.on) < 0.1 && q.t1 - q.t0 > 0.3); if (k >= 0) { used.add(k); hit++; } }
    ns.forEach((q, i) => { if (!used.has(i)) { extra++; if (ex.length < 3) ex.push([base, +q.t0.toFixed(3), +(q.t1 - q.t0).toFixed(3), q.n, +q.m.toFixed(2)]); } });
  }
  console.log(`${lbl} scoop ${st} st ${ms} ms ${shape}: sung ${sung} hit ${hit} extra ${extra}`, JSON.stringify(ex));
}
