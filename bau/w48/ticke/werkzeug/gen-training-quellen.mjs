// Erzeugt module/training/quellen.js ohne url-Felder, mit erklaerung (aus training-erklaerungen.mjs). Liest die Vorlage 0.2.1.
import fs from 'fs';
import { ERKLAERUNG } from './training-erklaerungen.mjs';
const [alt, ziel] = process.argv.slice(2);
const { QUELLEN } = await import(alt);
const s = (t) => JSON.stringify(t).replace(/^"|"$/g, '').replace(/'/g, "\\'");
const kopf = `// M5 training – Quellen (Format: quellen.js im App-Ordner): id → { text (volle Angabe), notiz (ein Satz), erklaerung (2–5 Sätze:
// was dort steht, in einfachen Worten) }. Keine Links: alles Wissen steht hier in der App.
// Gemeinsame Quellen (dunlosky2013, pashler2008, roberts2017) und Quellen anderer Module werden nur per ID genutzt, nicht gedoppelt:
// M4 passt: gollwitzer2006, ferrari2019, hudson2015, hudson2019, jacqueshamilton2019, steel2007, nettle2006 · M2 interessen: schmidt2007,
// wright2013, wittmann2006.
export const QUELLEN = {\n`;
const teile = Object.entries(QUELLEN).map(([id, q]) => {
  if (!ERKLAERUNG[id]) throw new Error('Erklärung fehlt: ' + id);
  return `  ${id}: {\n    text: '${s(q.text)}',\n    notiz: '${s(q.notiz)}',\n    erklaerung: '${s(ERKLAERUNG[id])}'\n  }`;
});
for (const id of Object.keys(ERKLAERUNG)) if (!QUELLEN[id]) throw new Error('Unbekannte Erklärung: ' + id);
// Abschnitts-Kommentare der Vorlage wieder einsetzen
const src = fs.readFileSync(new URL(alt), 'utf8'); const abschnitt = {};
let akt = null; for (const z of src.split('\n')) { const m = z.match(/^\s*\/\/ -{5,} (.+?) -{5,}/); if (m) akt = m[1]; const i = z.match(/^  (\w+): \{$/); if (i && akt) { abschnitt[i[1]] = akt; akt = null; } }
const out = teile.map((t, k) => { const id = Object.keys(QUELLEN)[k]; return (abschnitt[id] ? `  // ---------- ${abschnitt[id]} ----------\n` : '') + t; }).join(',\n');
fs.writeFileSync(ziel, kopf + out + '\n};\n');
console.log(Object.keys(QUELLEN).length, 'Quellen geschrieben');
