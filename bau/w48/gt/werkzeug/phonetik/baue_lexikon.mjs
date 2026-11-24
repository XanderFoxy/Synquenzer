// Baut app/js/lexikon-en.js aus dem CMU-Aussprachewörterbuch (ISC) und einer Häufigkeitsliste.
// Nur die Vokalfolge wird gespeichert: je Vokal EIN Zeichen (a–o = AA…UW), groß = betont (1/2), klein = unbetont (0).
// Aufbau der Datei: "code:wort wort wort|code:wort …" – wird in phonetik.js beim ersten Gebrauch zu einer Map.
import { dictionary } from 'cmu-pronouncing-dictionary';
import fs from 'node:fs';

const ZIEL = process.argv[2];
const ANZAHL = Number(process.argv[3] || 25000);
const VOK = ['AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW'];
const code = (pron) => pron.split(' ').filter(p => /\d$/.test(p)).map(p => {
  const i = VOK.indexOf(p.slice(0, -1)); if (i < 0) throw new Error(p);
  const c = String.fromCharCode(97 + i); return p.endsWith('0') ? c : c.toUpperCase();
}).join('');

const top = fs.readFileSync(new URL('./top_en.txt', import.meta.url), 'utf8').split('\n');
const extra = (process.argv[4] ? fs.readFileSync(process.argv[4], 'utf8') : '').toLowerCase()
  .replace(/[’]/g, "'").split(/[^a-z']+/).filter(Boolean);
const woerter = new Set();
// Wörter aus den Liedtexten immer aufnehmen – britische Schreibung über die amerikanische Form (hypnotised → hypnotized)
const BRIT = [[/is(e|es|ed|ing|er|ers|ation|ations)$/, 'iz$1'], [/ys(e|es|ed|ing)$/, 'yz$1'], [/our(s|ed|ing|ite|ites|able|ful)?$/, 'or$1'], [/tre(s)?$/, 'ter$1']];
for (const w of extra) {
  if (dictionary[w]) { woerter.add(w); continue; }
  for (const [re, e] of BRIT) { const v = w.replace(re, e); if (v !== w && dictionary[v]) { woerter.add(v); break; } }
}
for (const w of top) {
  if (woerter.size >= ANZAHL) break;
  if (/^[a-z][a-z']*$/.test(w) && dictionary[w]) woerter.add(w);
}
const gruppen = new Map();
for (const w of [...woerter].sort()) {
  const c = code(dictionary[w]);
  if (!gruppen.has(c)) gruppen.set(c, []);
  gruppen.get(c).push(w);
}
const teile = [...gruppen].map(([c, ws]) => c + ':' + ws.join(' '));
const text = `// Englisches Vokal-Lexikon für den Gesangstrainer – automatisch erzeugt, nicht von Hand ändern.
// Quelle: CMU Pronouncing Dictionary (npm cmu-pronouncing-dictionary 3.0.0, ISC-Lizenz, © Carnegie Mellon University),
// Auswahl der ${woerter.size} häufigsten Wörter nach wordfreq. Gespeichert ist NUR die Vokalfolge:
// je Vokal ein Zeichen a–o = AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW; Großbuchstabe = betont, klein = unbetont.
// Beispiel: "F:light" heißt light = AY1. Format "code:wort wort|code:wort …".
export const LEXIKON_EN = ${JSON.stringify(teile.join('|'))};
export const LEXIKON_VOKALE = ${JSON.stringify(VOK)};
`;
fs.writeFileSync(ZIEL, text);
console.log('Wörter', woerter.size, 'Gruppen', gruppen.size, 'Bytes', Buffer.byteLength(text));
