// Repro: Oktave sperren + Sinus/Pfeifen mit Rauschen (realistischer Mikrofon-Pegel) – offline (VSDSP) und live (Worklet)
import fs from 'fs';
const html = fs.readFileSync('../dirigent-wt/index.html', 'utf8'); const a = html.indexOf('/* VSDSP-BEGIN */'), b = html.indexOf('/* VSDSP-END */');
const D = new Function(html.slice(a, b) + ';return vsDspMake();')();
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const gauss = () => { let u = 0; for (let k = 0; k < 6; k++) u += rnd(); return (u - 3) / Math.sqrt(0.5); };
const MEL = [57, 60, 64, 62, 57, 55, 57, 69, 72, 50, 45];
// whistle range: typical human whistle 500-2500 Hz → also test MIDI 72..88
const MELW = [76, 79, 83, 81, 76, 74, 76, 84, 88, 72, 74];
function synth(mel, fs, hs, snrDb, vib) {
  const sb = 0.5, n = Math.ceil((mel.length * sb + 0.6) * fs), x = new Float32Array(n);
  mel.forEach((m, k) => { const f = 440 * Math.pow(2, (m - 69) / 12), a0 = Math.round((0.3 + k * sb) * fs), L = Math.round((sb - 0.04) * fs); let ph = 0;
    for (let j = 0; j < L; j++) { const t = j / fs; const fi = f * (1 + (vib ? 0.004 * Math.sin(2 * Math.PI * 5.5 * t) : 0)); ph += 2 * Math.PI * fi / fs; let v = 0; hs.forEach((h, q) => { if ((q + 1) * f < fs / 2 - 200) v += h * Math.sin((q + 1) * ph); });
      x[a0 + j] += 0.15 * v * Math.min(1, t / 0.005) * Math.min(1, (L - j) / fs / 0.01); } });
  if (snrDb != null) { const sig = 0.15 / Math.SQRT2, nz = sig * Math.pow(10, -snrDb / 20); for (let i = 0; i < n; i++) x[i] += nz * gauss(); }
  return x;
}
const KINDS = {sine: [1], whistle: [1, 0.03], flute: [1, 0.3, 0.05, 0.02]};
for (const [mel, lab] of [[MEL, 'MEL A2–C5'], [MELW, 'MEL E5–E6 (Pfeif-Lage)']]) {
  console.log('==', lab);
  for (const [kind, hs] of Object.entries(KINDS)) for (const snr of [null, 50, 40, 30, 20]) for (const vib of [false, true]) {
    const x = synth(mel, 16000, hs, snr, vib); const out = {};
    for (const lock of [false, true]) {
      const tr = D.pyin(x, {fs: 16000, octLock: lock, fmin: 40, fmax: 1600});
      const sg = D.segment(tr, {snap: false, tuning: 'auto', attack: true});
      const got = mel.map((m, k) => { const q = sg.notes.find(z => Math.abs(z.t0 - (0.3 + k * 0.5)) < 0.06); return q ? q.n : null; });
      out[lock ? 'an' : 'aus'] = got.filter((g, k) => g === mel[k]).length + '/11 [' + got.map((g, k) => g == null ? '–' : (g - mel[k] >= 0 ? '+' : '') + (g - mel[k])).join(' ') + ']';
    }
    console.log(kind.padEnd(8), ('SNR ' + (snr ?? '∞')).padEnd(7), vib ? 'vib' : '   ', 'aus', out.aus.padEnd(32), '| an', out.an);
  }
}
