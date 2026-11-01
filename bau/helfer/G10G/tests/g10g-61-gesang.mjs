// G10-61: „Aus dem Gesang“ auf 20 synthetischen Melodien mit bekannter Tonart → ≥ 80 % richtig. Unsicher → zwei Vorschläge.
import {launch, open, takeIn, edOpen, sleep, ok, done} from './lib.mjs';
const br = await launch(), p = await open(br, 428, 926);
let seed = 23; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
// Melodie: Stufen-Spaziergang, Anfang und Ende auf dem Grundton, Dreiklangstöne länger (wie gesungen: ±30 ct daneben)
function melody(root, minor, n = 16) {
  const S = minor ? MIN : MAJ, out = []; let deg = 0, t = 0;
  for (let i = 0; i < n; i++) {
    if (i === n - 1) deg = 0; else if (i) deg = Math.max(-3, Math.min(9, deg + [-2, -1, -1, 1, 1, 2, 0][Math.floor(rnd() * 7)]));
    const o = Math.floor(deg / 7), st = ((deg % 7) + 7) % 7, m = 60 + root + 12 * o + S[st] + (rnd() - .5) * .6;
    const d = ([0, 2, 4].includes(st) ? .45 : .25) + rnd() * .2;
    out.push({t0: +t.toFixed(3), t1: +(t + d).toFixed(3), m: +m.toFixed(3)}); t += d + .06;
  }
  return out;
}
const cases = []; for (let i = 0; i < 20; i++) { const root = Math.floor(rnd() * 12), minor = i % 2 === 1; cases.push({root, minor, notes: melody(root, minor)}); }
const R = await p.evaluate(cs => cs.map(c => SYNQUENZER.g10gDetect(c.notes)), cases);
let hit = 0; const rows = [];
R.forEach((r, i) => { const c = cases[i], want = c.minor ? 'aeolian' : 'ionian', fam = s => ['aeolian', 'dorian', 'phrygian', 'harmMin', 'pentMin'].includes(s) ? 'min' : 'maj';
  const right = r.root === c.root && fam(r.scale) === (c.minor ? 'min' : 'maj'); if (right) hit++;
  rows.push(`${i + 1}: soll ${c.root}/${want} → ${r.root}/${r.scale} conf ${r.conf}${r.sure ? '' : ' (unsicher, 2. Vorschlag ' + (r.alt ? r.alt.root + '/' + r.alt.scale : '–') + ')'} ${right ? 'richtig' : 'FALSCH'}`); });
console.log(rows.join('\n'));
ok(hit >= 16, `„Aus dem Gesang“: ${hit}/20 richtig (≥ 16 = 80 %)`);
// unsicher: nur der a-Moll-Dreiklang, Anfang und Ende auf E (E-Moll/E-Dur/a-Moll kommen in Frage) → zwei Vorschläge
const amb = [64, 69, 72, 76, 72, 69].map((m, i) => ({t0: i * .4, t1: i * .4 + .3, m}));
const U = await p.evaluate(ns => SYNQUENZER.g10gDetect(ns), amb);
ok(!U.sure && U.conf < .25 && U.alt, `unsicheres Material: conf ${U.conf} < 0,25 → zwei Vorschläge ${U.root}/${U.scale} + ${U.alt && U.alt.root + '/' + U.alt.scale}`);
// echter Take: [Aus dem Gesang] in der Leiste (Tipp), Chip zeigt das Ergebnis
const mel = [69, 72, 76, 74, 72, 71, 69, 64, 69].map(m => ({m: m + .2, d: .33}));   // a-Moll
const T = await takeIn(p, mel); await edOpen(p, T.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T.ref);
await p.tap('#wpSheet .g10g-kc'); await sleep(200); await p.tap('#wpSheet .g10g-kp [data-a="gesang"]'); await sleep(400);
let I = await p.evaluate(r => SYNQUENZER.g10gInfo(r), T.ref);
ok(I.key && I.key.src === 'user' && I.key.via === 'gesang' && I.key.root === 9, `Take a-Moll gesungen → Tonart ${JSON.stringify(I.key)} · Chip „${I.chip}“`);
ok(/Gesang/.test(I.chip), 'Chip nennt die Quelle „Gesang“');
// unsicherer Take → der Chip zeigt beide Vorschläge, die Leiste bietet den zweiten an (ein Tipp tauscht)
const mel2 = [69, 72, 69, 72, 69, 72].map(m => ({m: m + .1, d: .3}));   // nur A und C: C-Dur oder a-Moll
const T2 = await takeIn(p, mel2); await p.evaluate(() => SYNQUENZER.g2Close()); await edOpen(p, T2.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T2.ref);
await p.evaluate(r => SYNQUENZER.g10gKey(r, {via: 'gesang'}), T2.ref); await p.evaluate(() => SYNQUENZER.g10gPanel(true)); await sleep(200);
I = await p.evaluate(r => SYNQUENZER.g10gInfo(r), T2.ref);
const altVis = await p.evaluate(() => { const a = document.querySelector('#wpSheet .g10g-alt'); return a && !a.hidden ? [...a.querySelectorAll('button')].map(b => b.textContent) : null; });
ok(I.key.alt && / \/ /.test(I.chip) && altVis && altVis.length === 2, `unsicher: Chip „${I.chip}“, Leiste ${JSON.stringify(altVis)}`);
const k0 = I.key;
await p.tap('#wpSheet .g10g-kp [data-a="alt1"]'); await sleep(300);
I = await p.evaluate(r => SYNQUENZER.g10gInfo(r), T2.ref);
ok(I.key.root === k0.alt.root && I.key.scale === k0.alt.scale && I.key.alt.root === k0.root, `Tipp auf den zweiten Vorschlag tauscht: ${JSON.stringify(I.key)}`);
ok(!p.errs.length, 'Konsole sauber ' + JSON.stringify(p.errs.slice(0, 2)));
await br.close(); done();
