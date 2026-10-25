// QA V2c′ – part G: 7 distinct tones = 6 leitereigene + 1 chromatic tone (random), clip C major, 48 chords: distinct/contour
import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(() => {
  const Q = window.SYNQUENZER, H = Q.harmony; Q.newProject({init: true}); ensureAudio();
  let seed = 5; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const dia = [60, 62, 64, 65, 67, 69, 71, 72], chro = [61, 63, 66, 68, 70];
  const tg = []; for (let r0 = 0; r0 < 12; r0++) for (const q of [[0, 4, 7], [0, 3, 7], [0, 4, 7, 10], [0, 3, 7, 10]]) tg.push(H.detectChord(q.map(x => 60 + r0 + x)));
  let mel = 0, badN = 0, badC = 0, nbBoth = 0, badWhenNb = 0, badWhenNot = 0;
  for (let m = 0; m < 60; m++) {
    const d = dia.slice().sort(() => rnd() - .5).slice(0, 6), c = chro[(rnd() * 5) | 0];
    const seq = d.concat([c]).sort(() => rnd() - .5);
    const both = seq.includes(c - 1) && seq.includes(c + 1);
    Q.setClip(0, 0, {len: 2, key: {root: 0, scale: 'ionian', src: 'user'}, notes: seq.map((n, i) => ({t: i * .5, d: .45, n, v: .8}))});
    for (const t of tg) { recallCarrier(t); const k = S.tracks[0].clips[0].key; const o = seq.map(n => Q.outPitch(0, n, nowT(), k)); mel++; if (both) nbBoth++;
      const bad = new Set(o).size !== 7; if (bad) { badN++; if (both) badWhenNb++; else badWhenNot++; }
      for (let i = 1; i < 7; i++) if (Math.sign(o[i] - o[i - 1]) !== Math.sign(seq[i] - seq[i - 1])) { badC++; break; } }
  }
  Q.resetCarrier(); return {mel, badN, badC, nbBoth, badWhenNb, badWhenNot};
});
console.log(JSON.stringify(r), errs);
await b.close();
