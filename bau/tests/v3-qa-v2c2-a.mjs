// QA V2c′ (acceptance lens) – part A: Xander 24.10. acceptance "7 verschiedene Töne bleiben 7, Kontur gleich" incl. chromatic tones
import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open();
const E = (f, a) => p.evaluate(f, a);
await E(() => {
  const Q = window.SYNQUENZER;
  window.__outs = (t, s, notes) => { const c = S.tracks[t].clips[s]; return notes.map(n => Q.outPitch(t, n, nowT(), c.key)); };
});
await E(() => { window.SYNQUENZER.newProject({init: true}); ensureAudio(); });
// 1) specific musically common melodies (clip key C major), under C and other chords
const cases = {
  'C D E F F# G A (chrom. Durchgang F-F#-G)': [60, 62, 64, 65, 66, 67, 69],
  'C D D# E F G A (chrom. Durchgang D-D#-E)': [60, 62, 63, 64, 65, 67, 69],
  'G F# F E D C B (abwärts chromatisch)': [67, 66, 65, 64, 62, 60, 59],
  'E D# E G F# G A (Nebennoten)': [64, 63, 64, 67, 66, 67, 69],
  'C E G A# A G F (Blues-Septime + A)': [60, 64, 67, 70, 69, 67, 65],
};
const r1 = await E((cases) => {
  const Q = window.SYNQUENZER, H = Q.harmony, out = {};
  for (const [name, seq] of Object.entries(cases)) {
    const notes = seq.map((n, i) => ({t: i * .5, d: .45, n, v: .8}));
    Q.setClip(0, 0, {len: 2, key: {root: 0, scale: 'ionian', src: 'user'}, notes});
    const res = [];
    for (const c of [[60, 64, 67], [65, 69, 72], [67, 71, 74], [69, 72, 76], [62, 65, 69]]) {
      recallCarrier(H.detectChord(c)); const o = __outs(0, 0, seq);
      const srcD = new Set(seq).size, outD = new Set(o).size;
      let contour = true; for (let k = 1; k < seq.length; k++) if (Math.sign(o[k] - o[k - 1]) !== Math.sign(seq[k] - seq[k - 1])) contour = false;
      res.push({chord: H.detectChord(c).name, out: o, srcD, outD, contour});
    }
    out[name] = res;
  }
  Q.resetCarrier(); return out;
}, cases);
for (const [k, v] of Object.entries(r1)) { console.log(k); for (const x of v) console.log('   ', x.chord, x.out.join(' '), 'distinct', x.srcD, '->', x.outD, 'contour', x.contour); }
// 2) random melodies of 7 distinct (chromatic) tones within C4..C5, clip key C major, 108 chords
const r2 = await E(() => {
  const Q = window.SYNQUENZER, H = Q.harmony; let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const tg = []; for (let r0 = 0; r0 < 12; r0++) for (const q of [[0, 4, 7], [0, 3, 7], [0, 4, 7, 10], [0, 3, 7, 10]]) tg.push(H.detectChord(q.map(x => 60 + r0 + x)));
  let mel = 0, badN = 0, badC = 0, withForeign = 0, badNF = 0;
  for (let m = 0; m < 60; m++) {
    const pool = []; for (let n = 60; n <= 72; n++) pool.push(n);
    pool.sort(() => rnd() - .5); const seq = pool.slice(0, 7).sort(() => rnd() - .5);
    const notes = seq.map((n, i) => ({t: i * .5, d: .45, n, v: .8}));
    Q.setClip(0, 0, {len: 2, key: {root: 0, scale: 'ionian', src: 'user'}, notes});
    const foreign = seq.some(n => ![0, 2, 4, 5, 7, 9, 11].includes(n % 12));
    for (const t of tg) { recallCarrier(t); const o = __outs(0, 0, seq); mel++; if (foreign) withForeign++;
      if (new Set(o).size !== 7) { badN++; if (foreign) badNF++; }
      for (let k = 1; k < 7; k++) if (Math.sign(o[k] - o[k - 1]) !== Math.sign(seq[k] - seq[k - 1])) { badC++; break; } }
  }
  Q.resetCarrier(); return {mel, withForeign, badN, badNF, badC};
});
console.log('random 7-distinct chromatic melodies:', JSON.stringify(r2));
console.log('errs', errs);
await b.close();
