// T8: „Oktave sperren“ (K2-33) mit Wellen ohne Sub: Sinus (Pfeifen), Dreieck, Rechteck, Säge, Puls 25 %, Säge+Sub — App-DSP (VSDSP aus index.html)
import fs from 'fs';
const s = fs.readFileSync('../dirigent-wt/index.html', 'utf8'); const a = s.indexOf('/* VSDSP-BEGIN */'), b = s.indexOf('/* VSDSP-END */');
const D = new Function(s.slice(a, b) + ';return vsDspMake();')();
const fs16 = 16000;
const MEL = [57, 60, 64, 62, 57, 55, 57, 69, 72, 50, 45];
function wave(kind, f, t) {
  const w = 2 * Math.PI * f * t; let v = 0; const K = Math.floor(7500 / f);
  if (kind === 'sine') return Math.sin(w);
  if (kind === 'tri') { for (let k = 1; k <= K; k += 2) v += ((k - 1) / 2 % 2 ? -1 : 1) * Math.sin(k * w) / (k * k); return v * 0.8; }
  if (kind === 'square') { for (let k = 1; k <= K; k += 2) v += Math.sin(k * w) / k; return v; }
  if (kind === 'saw') { for (let k = 1; k <= K; k++) v += Math.sin(k * w) / k; return v; }
  if (kind === 'pulse') { for (let k = 1; k <= K; k++) v += Math.sin(Math.PI * k * 0.25) * Math.cos(k * w) / k; return v; }
  if (kind === 'sawsub') { for (let k = 1; k <= K; k++) v += Math.sin(k * w) / k; return v + 0.6 * Math.sin(w / 2); }
  if (kind === 'whistle') return Math.sin(w) + 0.03 * Math.sin(2 * w);
  if (kind === 'flute') return Math.sin(w) + 0.3 * Math.sin(2 * w) + 0.05 * Math.sin(3 * w) + 0.02 * Math.sin(4 * w);
}
for (const kind of ['flute']) {
  const sb = 0.5, n = Math.ceil((MEL.length * sb + 0.6) * fs16), x = new Float32Array(n);
  MEL.forEach((m, k) => { const f = 440 * Math.pow(2, (m - 69) / 12), a0 = Math.round((0.3 + k * sb) * fs16), L = Math.round((sb - 0.04) * fs16); for (let j = 0; j < L; j++) { const t = j / fs16; x[a0 + j] += 0.15 * wave(kind, f, t) * Math.min(1, t / 0.005) * Math.min(1, (L - j) / fs16 / 0.01); } });
  const out = {};
  for (const lock of [false, true]) {
    const tr = D.pyin(x, {fs: fs16, octLock: lock, fmin: 40, fmax: 1600});
    const sg = D.segment(tr, {snap: false, tuning: 'auto', attack: true});
    const got = MEL.map((m, k) => { const n = sg.notes.find(q => Math.abs(q.t0 - (0.3 + k * sb)) < 0.06); return n ? n.n : null; });
    out[lock ? 'an' : 'aus'] = {ok: got.filter((g, k) => g === MEL[k]).length, up: got.filter((g, k) => g === MEL[k] + 12).length, down: got.filter((g, k) => g === MEL[k] - 12).length, got: got.join(',')};
  }
  console.log(kind.padEnd(8), 'Sperre aus', JSON.stringify(out.aus), '| an', JSON.stringify(out.an));
}
