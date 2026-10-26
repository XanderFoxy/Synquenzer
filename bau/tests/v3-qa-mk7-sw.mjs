// QA MK7 FP-DSP: switches while a chord sounds (M-KLICK / M-EINBRUCH), T2 in vocoder mode, input appearing (DIREKT)
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, rms, db, sine} = await import('./v3-mk7-node.mjs');
const {mKlick, mEinbruch} = await import('./v3-mk1-ana.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: 'a', sec: 4, sr, rms: -20}, W);
const ch = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
const kl = (x, t) => { const a = mKlick(x.subarray(Math.round((t - .3) * sr), Math.round((t + .3) * sr)), sr, []); return a.worst; };
const base = render(vocP({efs: 40, res: 64}, {}), ch, {sec: 4, inputs: {e2: vox}});
const k0 = mKlick(base.l.subarray(sr, 3.5 * sr), sr, []).worst;
console.log('Referenz ohne Umschalten: M-KLICK ' + k0.toFixed(2) + ' dB');
const cases = [
  ['HALTEN an (mkHoldGet)', [[1.5, {mkHoldGet: 1}]]],
  ['HALTEN aus (hold → null)', [[1, {mkHoldGet: 1}], [1.5, {mkSet: {'voc.hold': null}}]]],
  ['FORMANT 0 → +2 (Sprung)', [[1.5, {mkSet: {'voc.fs': 2}}]]],
  ['K-PEGEL Band 4 127 → 0', [[1.5, {mkSet: {'voc.chl.3': 0}}]]],
  ['SCHWELLE 0 → 64 (Gate an)', [[1.5, {mkSet: {'voc.th': 64}}]]],
  ['FOLGER 40 → 127 (Halten per Regler)', [[1.5, {mkSet: {'voc.efs': 127}}]]],
];
for (const [lab, at] of cases) {
  const r = render(vocP({efs: 40, res: 64}, {}), ch, {sec: 4, inputs: {e2: vox}, at}), t = at[at.length - 1][0];
  const k = kl(r.l, t), e = mEinbruch(r.l, sr, t + .003).worst;
  console.log((k <= Math.max(6, k0 + .5) && e >= -3 ? 'ok   ' : 'AUFF ') + lab + ': M-KLICK ' + k.toFixed(2) + ' dB · M-EINBRUCH ' + e.toFixed(2) + ' dB');
}
// mode Synth -> Vocoder and back while the chord is held (engXf, B.6 Nr. 2)
for (const [lab, m0, m1] of [['MODUS Synth → Vocoder', 0, 3], ['MODUS Vocoder → Synth', 3, 0]]) {
  const p = vocP({efs: 40, res: 64}, {}); p.mode = m0;
  const r = render(p, ch, {sec: 4, inputs: {e2: vox}, at: [[1.5, {mkSet: {mode: m1}}]]});
  const k = kl(r.l, 1.5), lv = [1.3, 1.45, 1.52, 1.6, 2].map(t => db(rms(r.l, Math.round(t * sr), Math.round((t + .05) * sr))).toFixed(1));
  console.log((k <= 6 ? 'ok   ' : 'AUFF ') + lab + ': M-KLICK ' + k.toFixed(2) + ' dB · Pegel 1.30/1.45/1.52/1.60/2.0 s: ' + lv.join(' / '));
}
// T2 in vocoder mode: no input, no hold -> silent (T2 must not sound), T2 with loud oscillator
{ const p = vocP({}, {}); p.t[1].mix = {o1: 127, o2: 0, n: 0}; const r = render(p, ch, {sec: 1}); console.log('Vocoder ohne Eingang/hold, T2 Mixer 127: ' + db(rms(r.l, 12000, 48000)).toFixed(1) + ' dBFS (soll still)'); }
// DIREKT 127: the input appears abruptly (track chosen as source while it plays)
{ const e2 = sine(440, 3, sr, .3); for (let i = 0; i < 1.5 * sr; i++) e2[i] = 0;
  const r = render(vocP({dir: 127}, {}), [], {sec: 3, inputs: {e2}}); const k = kl(r.l, 1.5); console.log('DIREKT 127, Quelle erscheint mitten im Ton: M-KLICK ' + k.toFixed(2) + ' dB'); }
