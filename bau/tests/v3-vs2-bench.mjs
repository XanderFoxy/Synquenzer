// VS2 Node-Bench: N7V-08 (Oktavfehler), N7V-09 (Noten-F), N7V-10 (Stimmung), N2-VS2-02 / N7V-33 (Instrument).
// node v3-vs2-bench.mjs <index.html|dsp.js> [cond…]
import {loadDsp, melody, renderVoice, renderSynth, score} from './v3-vs2-corpus.mjs';
const file = process.argv[2] || '../dirigent-wt/index.html';
const D = loadDsp(file);
const only = process.argv.slice(3);
const AM = Array.from({length: 12}, (_, k) => [9, 11, 0, 2, 4, 5, 7].includes(k));
const VOICES = [['hum', 45, 57], ['male', 57, 69], ['female', 69, 81]];
const COND = {
  A: {}, C: {snr: 10}, D: {detune: -30, sigma: 20}, E: {vib: [80, 120]}, F: {click: 0}, G: {click: 6}, Gm: {click: 6, mask: true},
};
const TH = {A: 0.94, C: 0.93, D: 0.92, E: 0.91, Gm: 0.93};
let fail = 0; const out = [];
const t0all = Date.now();
for (const [cn, co] of Object.entries(COND)) {
  if (only.length && !only.includes(cn)) continue;
  let F = 0, P = 0, R = 0, rpa = 0, oct = 0, k = 0, ms = 0, sec = 0, tunes = [], onM = [], on95 = [];
  for (const [v, lo, hi] of VOICES) for (const seed of [1, 2]) {
    const mel = melody(seed * 31 + lo, lo, hi), sig = renderVoice(mel, {voice: v, seed: seed * 101 + lo, ...co});
    let mask = null;
    const hop = 80, nF = Math.floor((sig.x.length - 1) / hop) + 1;
    if (co.mask) { mask = new Uint8Array(nF); for (const c of sig.clicks) { const a = Math.floor((c + 0.012 - 0.023) * 16000 / hop), b = Math.ceil((c + 0.012 + 0.035) * 16000 / hop); for (let i = a; i <= b && i < nF; i++) mask[i] = 1; } }
    const t0 = Date.now();
    const tr = D.pyin(sig.x, {fs: 16000, mask});
    const sg = D.segment(tr, {snap: true, scale: AM, root: 0, tuning: 'auto'});
    ms += Date.now() - t0; sec += sig.x.length / 16000;
    const sc = score(tr, sg.notes, sig);
    F += sc.F; P += sc.P; R += sc.R; rpa += sc.rpa; oct += sc.oct; k++; tunes.push(sg.tuneCt); onM.push(sc.onMed); on95.push(sc.on95);
    if (process.env.V) console.log(cn, v, seed, sc, 'tune', sg.tuneCt);
  }
  const r = {cond: cn, F: +(F / k).toFixed(3), P: +(P / k).toFixed(3), R: +(R / k).toFixed(3), rpa: +(rpa / k * 100).toFixed(1), oct, cpu: +(ms / 1000 / sec * 100).toFixed(1) + '%', tune: tunes.map(x => Math.round(x)).join('/'), onMed: Math.round(onM.reduce((a, b) => a + b) / k), on95: Math.round(on95.reduce((a, b) => a + b) / k)};
  const okF = TH[cn] == null || r.F >= TH[cn], okO = cn === 'G' || cn === 'Gm' ? true : oct === 0;
  let okT = true; if (cn === 'D') { const mean = tunes.reduce((a, b) => a + b) / tunes.length; r.tuneMean = +mean.toFixed(1); okT = Math.abs(mean - -30) <= 5; }
  r.ok = okF && okO && okT; if (!r.ok) fail++;
  out.push(r); console.log(JSON.stringify(r));
}
// Instrument (N2-VS2-02, N7V-33): Säge 8 Takte (32 Schläge, 100 BPM), bekannte Noten
if (!only.length || only.includes('I')) {
  for (const sub of [null, 'sine', 'square']) for (const lock of sub ? [false, true] : [false, true]) {
    let F = 0, oct = 0, k = 0;
    for (const seed of [1, 2, 3]) {
      const mel = melody(seed * 7 + 3, 45, 72, {n: 40}); let t = 0.6; const sb = 0.6; const m8 = [];
      for (const nt of mel) { if (nt.on + nt.dur > 0.6 + 32 * sb) break; m8.push(nt); }
      const sig = renderSynth(m8, {sub, subAmp: 0.6});
      const tr = D.pyin(sig.x, {fs: 16000, octLock: lock, fmin: 40, fmax: 1600});
      const sg = D.segment(tr, {snap: false, tuning: 'auto', attack: true});
      const sc = score(tr, sg.notes, sig); F += sc.F; oct += sc.oct; k++;
      if (process.env.V) console.log('I', sub, lock, seed, sc);
      void t;
    }
    const r = {cond: 'I', sub: sub || 'ohne', lock, F: +(F / k).toFixed(3), oct};
    r.ok = (!sub ? r.F >= 0.93 : true) && (!lock || !sub || oct === 0) && (!sub || !lock || r.F >= 0.93);
    if (!r.ok) fail++; out.push(r); console.log(JSON.stringify(r));
  }
}
console.log('fail', fail, 'zeit', ((Date.now() - t0all) / 1000).toFixed(1) + ' s');
process.exit(fail ? 1 : 0);
