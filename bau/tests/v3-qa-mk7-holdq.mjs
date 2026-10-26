// QA MK7-03: the stored hold (16 x 0..127, 0.5-dB steps, 127 = 1.0) against the live held formant, at several modulator levels.
// Live: vowel on E2, TIMBRE/HALTEN at 0.8 s, modulator off at 1 s, level 2..3 s. Stored: a new render with the reported hold, no input.
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, rms, db, spectrum} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
for (const lev of [0, -10, -20, -30, -40, -50]) {
  const vox = mkVowel({f0: 110, v: 'a', sec: 1, sr, rms: lev}, W);
  const live = render(vocP({efs: 40}, {}), [[0, 'on', 48, .8]], {sec: 3, inputs: {e2: vox}, at: [[.8, {mkHoldGet: 1}]]});
  const h = (live.msgs.find(m => m.mkHold) || {}).mkHold;
  const st = render(vocP({efs: 40, hold: h}, {}), [[0, 'on', 48, .8]], {sec: 3});
  const a = db(rms(live.l, 2 * sr, 3 * sr)), b = db(rms(st.l, 2 * sr, 3 * sr));
  // spectral difference per band region: log spectra in 16 bands
  const N = 32768, Pa = spectrum(live.l, 2 * sr, N), Pb = spectrum(st.l, 2 * sr, N), R = W.VR; let worst = 0, wb = 0;
  for (let k = 0; k < 16; k++) { const f1 = Math.sqrt(R[k + 3] * R[k + 4]), f2 = Math.sqrt(R[k + 4] * R[k + 5]); let ea = 0, eb = 0; for (let i = Math.floor(f1 * N / sr); i <= Math.ceil(f2 * N / sr); i++) { ea += Pa[i]; eb += Pb[i]; } const d = 10 * Math.log10((eb + 1e-30) / (ea + 1e-30)); if (Math.abs(d) > Math.abs(worst) && ea > 1e-12) { worst = d; wb = k + 1; } }
  console.log('Modulator ' + lev + ' dBFS: hold = [' + (h || []).join(',') + '] · live ' + a.toFixed(1) + ' dBFS, gespeichert ' + b.toFixed(1) + ' dBFS (Δ ' + (b - a).toFixed(2) + ' dB) · größte Band-Abweichung ' + worst.toFixed(1) + ' dB (Band ' + wb + ')');
}
