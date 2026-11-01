// G6P-10: Stufen statt Halbtöne (Tabelle C-Dur Terz oben; Lead E → F ⇒ Chor A ohne neue Analyse; 30 Fälle Dur/Moll/Dorisch)
import {open, sing, melody, inject, chor, report} from './h.mjs';
const {br, p, errs} = await open(), rows = [];
const y = sing(melody(16, {mel: [60, 62, 64, 65, 67, 69, 71, 72]}), {beats: 16});
const tk = await inject(p, y, {bars: 4}), r = {t: tk.track, s: 0};
await p.evaluate(([r, c]) => SYNQUENZER.g6pbSet(r, c), [r, chor([{rule: 'st+2'}])]);
await p.evaluate(r => SYNQUENZER.g6pbBufs(r), r);
const T = await p.evaluate(r => SYNQUENZER.g6pbTones(r, 0), r);
const want = {60: 64, 62: 65, 64: 67, 65: 69, 67: 71, 69: 72, 71: 74, 72: 76};
const hit = T.filter(n => want[n.L] === n.c).length;
rows.push({id: 'G6P-10a', ok: hit === 8 && T.length === 8, msg: `C-Dur Terz oben C→E … H→D: ${hit}/8 (${T.map(n => n.L + '→' + n.c).join(' ')})`});
// Lead E (Note 2) ▲ F: Chor muss A (69) werden, nicht G♯ (68); keine neue Analyse
const an0 = (await p.evaluate(() => SYNQUENZER.g6pbInfo())).an, rn0 = (await p.evaluate(() => SYNQUENZER.g6pbInfo())).renders;
await p.evaluate(([r, id]) => SYNQUENZER.g2Note(id, 'shift', 2, 1), [r, tk.id]);
const T2 = await p.evaluate(r => SYNQUENZER.g6pbTones(r, 0), r);
await p.evaluate(r => SYNQUENZER.g6pbBufs(r), r);
const I = await p.evaluate(() => SYNQUENZER.g6pbInfo());
rows.push({id: 'G6P-10b', ok: T2[2].L === 65 && T2[2].c === 69 && I.an === an0 && I.renders > rn0, msg: `Lead E▲ → ${T2[2].L}, Chor ${T2[2].c} (Soll 69 = A) · Analysen ${an0}→${I.an} · Rechnungen ${rn0}→${I.renders}`});
// 30 Fälle: unabhängige Leiter-Rechnung
const SC = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10]};
const ref = (L, d, o, key) => { const pcs = SC[key.scale].map(x => (x + key.root) % 12), ins = q => pcs.includes(((q % 12) + 12) % 12); let q = L; const s = Math.sign(d); for (let k = 0; k < Math.abs(d); k++) { q += s; while (!ins(q)) q += s; } return q + 12 * o; };
const rules = [['st+4', 4, 0], ['st-4', -4, 0], ['st+5', 5, 0], ['st-5', -5, 0], ['oct+1', 0, 1], ['oct-1', 0, -1], ['st+2/o+1', 2, 1], ['st-2', -2, 0], ['st+2', 2, 0], ['st+3', 3, 0]];
const keys = [{root: 0, scale: 'ionian'}, {root: 9, scale: 'aeolian'}, {root: 2, scale: 'dorian'}];
let ok30 = 0, bad = [];
for (const [ki, key] of keys.entries()) for (let j = 0; j < 10; j++) {
  const [rule, d, o] = rules[j], pcs = SC[key.scale].map(x => (x + key.root) % 12), L = 60 + pcs[(j * 3 + ki) % 7] - (pcs[(j * 3 + ki) % 7] > 7 ? 12 : 0);
  const got = await p.evaluate(([L, rule, key]) => SYNQUENZER.g6pbTone(L, rule, key), [L, rule, key]), w = ref(L, d, o, key);
  if (got === w) ok30++; else bad.push(`${key.scale} ${L} ${rule}: ${got}≠${w}`);
}
rows.push({id: 'G6P-10c', ok: ok30 === 30, msg: `30 Fälle (Dur/Moll/Dorisch; Quinte/Sexte/Oktave/Terz+Oktave/Terz/Quarte oben+unten): ${ok30}/30 ${bad.join('; ')}`});
rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
report('G6P-10', rows); await br.close();
