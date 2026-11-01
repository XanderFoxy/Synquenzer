// G10-60: 100 Noten in C-Dur, Hart 100 % → jedes Ziel liegt in der Leiter (Tabelle). Mit [Pentatonik Moll A] nur A C D E G.
// (a) Kern g2Snap über 100 Noten (Tabelle → tests/ergebnis-g10-60.md); (b) echter Take, Hart 100 %, Leiste-Wahl per API → Ziele + Plan.
import {launch, open, takeIn, edOpen, sleep, ok, done, HERE} from './lib.mjs';
import fs from 'fs'; import path from 'path';
const br = await launch(), p = await open(br, 428, 926);
let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ms = Array.from({length: 100}, () => +(48 + rnd() * 30).toFixed(3));
const R = await p.evaluate(ms => {
  const C = {root: 0, scale: 'ionian'}, A = {root: 9, scale: 'pentMin'};
  return ms.map(m => ({m, c: SYNQUENZER.g10gSnap(m, C), a: SYNQUENZER.g10gSnap(m, A)}));
}, ms);
const NN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], pc = x => ((x % 12) + 12) % 12, nm = x => NN[pc(x)] + (Math.floor(x / 12) - 1);
const inC = R.filter(r => [0, 2, 4, 5, 7, 9, 11].includes(pc(r.c))).length, inA = R.filter(r => [9, 0, 2, 4, 7].includes(pc(r.a))).length;
const near = R.every(r => Math.abs(r.c - r.m) <= 1 && Math.abs(r.a - r.m) <= 2);
ok(inC === 100, `C-Dur: ${inC}/100 Ziele in der Leiter`);
ok(inA === 100, `Pentatonik Moll A: ${inA}/100 Ziele in A C D E G`);
ok(near, 'jedes Ziel ist der nächste Leiterton (C-Dur ≤ 1 Halbton, Pent. ≤ 2 Halbtöne entfernt)');
let md = '# G10-60 – 100 Noten (Kern g2Snap)\n\n| # | gesungen (MIDI) | Ziel C-Dur | Ziel A Pent. Moll |\n|---|---|---|---|\n';
R.forEach((r, i) => { md += `| ${i + 1} | ${r.m} | ${nm(r.c)} (${r.c}) | ${nm(r.a)} (${r.a}) |\n`; });
md += `\nC-Dur in der Leiter: ${inC}/100 · A Pent. Moll in A C D E G: ${inA}/100\n`;
// (b) echter Take: Noten mit schiefen Lagen, Hart 100 % in C-Dur, dann Leiste → A, Pent. Moll
const mel = [61.4, 63.3, 66.2, 68.4, 70.3, 64.2, 65.6, 59.4, 62.7, 67.5].map(m => ({m, d: 0.28}));
const T = await takeIn(p, mel); await edOpen(p, T.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T.ref);
let I = await p.evaluate(r => SYNQUENZER.g10gInfo(r), T.ref);
ok(I.targets && I.targets.length >= 8 && I.targets.every(t => Number.isInteger(t) && [0, 2, 4, 5, 7, 9, 11].includes(pc(t))), `Take Hart 100 % C-Dur: Ziele ${I.targets && I.targets.map(nm).join(' ')}`);
await p.evaluate(r => SYNQUENZER.g10gKey(r, {root: 9}), T.ref); await p.evaluate(r => SYNQUENZER.g10gKey(r, {scale: 'pentMin'}), T.ref);
I = await p.evaluate(r => SYNQUENZER.g10gInfo(r), T.ref);
ok(I.key.root === 9 && I.key.scale === 'pentMin' && I.key.src === 'user', 'Tonart A Pent. Moll gespeichert (src user) ' + JSON.stringify(I.key));
ok(I.targets.every(t => [9, 0, 2, 4, 7].includes(pc(t))), `Take Pent. Moll A: Ziele ${I.targets.map(nm).join(' ')}`);
ok(I.plan && I.plan.notes.every(n => [9, 0, 2, 4, 7].includes(pc(n.to)) && n.s === 1) && I.plan.v === 2, 'Plan an den Kern: alle „to“ in A C D E G, Stärke 1, v = 2');
// speichern/laden behält die eigene Leiter (g2NormPitch kennt G2_SCALES)
const rt = await p.evaluate(id => { const j = SYNQUENZER.serialize(), o0 = JSON.parse(j), o = o0.project || o0; return o.takes && o.takes[id] && o.takes[id].pitch ? o.takes[id].pitch.key : null; }, T.id);
ok(rt && rt.scale === 'pentMin' && rt.root === 9, 'Speichern: key.scale pentMin bleibt erhalten ' + JSON.stringify(rt));
md += `\n## Take (10 Noten, gesungen ${mel.map(x => x.m).join(', ')})\nA Pent. Moll: ${I.targets.map(nm).join(' ')}\n`;
fs.writeFileSync(path.join(HERE, 'ergebnis-g10-60.md'), md);
ok(!p.errs.length, 'Konsole sauber ' + JSON.stringify(p.errs.slice(0, 2)));
await br.close(); done();
