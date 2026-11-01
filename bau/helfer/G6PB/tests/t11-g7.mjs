// G6P-11: G7 C-Dur → a-Moll (diatonisch) und → D-Dur: jede Chornote = Abbildung der Chor-Quelle wie der Lead (outPitch),
// M-CT ≤ 3 ct (gegen den gehörten, transponierten Lead + Intervall), keine leiterfremde Chornote
import {open, sing, melody, inject, chor, report, nsdf, cents, median} from './h.mjs';
const rows = [], sr = 48000;
const SC = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10]};
const track = (x, t0, t1) => { const a = Math.round((t0 + .2 * (t1 - t0)) * sr), b = Math.round((t1 - .2 * (t1 - t0)) * sr), W = Math.round(.03 * sr), H = Math.round(.005 * sr), o = []; for (let s = a; s + W <= b; s += H) { const f = nsdf(x, sr, s, s + W, 70, 2000); if (f > 0) o.push(f); } return o; };
for (const [name, keysDown, tgt] of [['a-Moll', [57, 60, 64], {root: 9, scale: 'aeolian'}], ['D-Dur', [62, 66, 69], {root: 2, scale: 'ionian'}]]) {
  const {br, p, errs} = await open();
  const y = sing(melody(16), {beats: 16}), tk = await inject(p, y, {bars: 4}), r = {t: tk.track, s: 0};
  await p.evaluate(([r, c]) => SYNQUENZER.g6pbSet(r, c), [r, chor([{rule: 'st+2'}, {rule: 'st-4'}, {rule: 'st+2/o+1'}])]);
  await p.evaluate(id => SYNQUENZER.g2Analyse(id), tk.id);
  await p.evaluate(k => { SYNQUENZER.setKbMode('transpose'); for (const n of k) SYNQUENZER.keyOn(n); }, keysDown);
  await p.waitForTimeout(700);
  // ursprünglich (ohne Transponieren) gerechnete Töne: Abbildung degree-treu C-Dur → Ziel
  const map = c => { const pc = ((c % 12) + 12) % 12, k = SC.ionian.indexOf(pc); if (k < 0) return null; const q = (tgt.root + SC[tgt.scale][k]) % 12; let o = c - pc + q; while (o - c > 6) o -= 12; while (c - o > 6) o += 12; return o; };
  let okMap = 0, all = 0, out = 0, worst = 0, nm = 0;
  await p.evaluate(r => SYNQUENZER.g6pbBufs(r, 60000), r);
  await p.evaluate(id => SYNQUENZER.g2Played(id), tk.id);
  const lead = Float32Array.from(await p.evaluate(([id, n]) => SYNQUENZER.g4PlayRange(id, 0, n), [tk.id, y.length]));
  for (let k = 0; k < 3; k++) {
    const T = await p.evaluate(([r, k]) => SYNQUENZER.g6pbTones(r, k), [r, k]);
    const B = await p.evaluate(([r, k]) => SYNQUENZER.g6pbBuf(r, k, 0), [r, k]), z = new Float32Array(y.length); z.set(B.data, Math.round(B.t0 * sr));
    for (const n of T) {
      all++; if (n.cp === map(n.c)) okMap++;
      const pcs = SC[tgt.scale].map(x => (x + tgt.root) % 12); if (!pcs.includes(((n.cp % 12) + 12) % 12)) out++;
      const fc = track(z, n.t0, n.t1), fl = track(lead, n.t0, n.t1); if (fc.length < 5 || fl.length < 5) continue;
      const e = (median(fc.map(f => cents(f, n.cp)))) - (median(fl.map(f => cents(f, n.Lp)))); worst = Math.max(worst, Math.abs(e)); nm++;
    }
  }
  rows.push({id: 'G6P-11 ' + name, ok: okMap === all && out === 0 && worst <= 3 && nm >= 20, msg: `${okMap}/${all} Chornoten = Abbildung der Chor-Quelle, ${out} leiterfremd, M-CT größte Abweichung ${worst.toFixed(2)} ct über ${nm} Noten`});
  rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
  await br.close();
}
report('G6P-11', rows);
