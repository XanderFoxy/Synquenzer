// REG: Soll-Zahl der Prüfungen je Test aus einem Referenzlauf (Standard r4760) → tests/soll.json. Zählt wie lauf.mjs (OK-Zeilen + FEHLER-Zeilen).
// Aufruf: node soll-gen.mjs [<referenz-ordner>=vx/r4760]   – nur nach einem von Hand geprüften Referenzlauf neu erzeugen.
import fs from 'node:fs'; import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname), REF = process.argv[2] || path.join(here, '..', '..', 'r4760');
export function zaehle(txt) { let ok = 0, fe = 0; for (const l of txt.split('\n')) { if (/^\s*OK\b/.test(l)) ok++; const m = /^\s*(FEHLER|FEHL|FAIL)\b(?!:)\s*(.*)$/.exec(l);
  if (m) { const t = m[2].trim(); if (/^\d+\s*s$/.test(t) || /^\S+:\s*\d+\/\d+ bestanden/.test(t) || /^\d+ von \d+/.test(t)) continue; fe++; } } return {ok, fehl: fe}; }
if (process.argv[1] && process.argv[1].endsWith('soll-gen.mjs')) {
  const D = JSON.parse(fs.readFileSync(path.join(here, '..', 'r4760-dauer.json'), 'utf8')), O = {_info: 'Prüfungen je Test im Referenzlauf ' + REF + ' (OK + FEHLER-Zeilen). lauf.mjs: weniger als n − toleranz → ROT „Prüfungen fehlen“.'};
  for (const n of Object.keys(D)) { const f = path.join(REF, n + '.log'); if (!fs.existsSync(f)) continue; const z = zaehle(fs.readFileSync(f, 'utf8')); O[n] = {ok: z.ok, fehl: z.fehl, n: z.ok + z.fehl}; }
  // Anpassungen an REG (Begründung je Test): spk4 ohne die Doppelläufe spk1/ki1/vx1 (−2 Zeilen), beg1 „Eigener Block“ jetzt INFO (−1),
  // clip1 stürzte in r4760 nach 24 Prüfungen ab (Wiederholung 109/109, STAND 16.11. 02:05), spk8f = nur faelle8 (spk10p eigener Test).
  const ANP = {spk4: [21, 'ohne Doppelläufe spk1/ki1/vx1'], beg1: [58, '„Eigener Block“ nur INFO'], clip1: [109, 'r4760-Absturz; Wiederholung 109/109']};
  for (const [n, [v, why]] of Object.entries(ANP)) if (O[n]) Object.assign(O[n], {n: v, anpassung: why});
  fs.writeFileSync(path.join(here, 'soll.json'), JSON.stringify(O, null, 1)); console.log(JSON.stringify(O)); }
