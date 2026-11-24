import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8').replace(/^export const meta/m, 'const meta');
const out = process.argv[3];
const body = src.split("phase('Bau')")[0] + `
const bauJobs = [
  ...MODS.map(m => ({ key: m.key, prompt: \`\${COMMON}\\n\\nDEIN NAME: \${m.key}. DEIN BEREICH: NUR \${W}/module/\${m.key}/ (alle Dateien darin). Kern-Dateien und andere Module nur lesen.\\nAUFGABE: \${m.spec}\\nAuch: module/\${m.key}/quellen.js ohne url-Links (Feld erklaerung wie in Regel 1); alle Stellen mit Bewertung/Zahlen in modul.js, rechnen.js, texte.js, daten.js, stil.css. Teste das Modul in der App (Fragebogen ausfüllen mit erfundenen Antworten, Ergebnis ansehen, Antwort ändern → Ergebnis ändert sich, alte Daten der Vorlage laden weiter).\` })),
  { key: KERN.key, prompt: \`\${COMMON}\\n\\nDEIN NAME: kern.\\n\${KERN.spec}\` },
  { key: MUSTER.key, prompt: \`\${COMMON}\\n\\nDEIN NAME: muster.\\n\${MUSTER.spec}\` },
];
return bauJobs;`;
const jobs = new Function(body)();
for (const j of jobs) fs.writeFileSync(`${out}/${j.key}.txt`, j.prompt);
console.log(jobs.map(j => j.key + ' ' + j.prompt.length).join('\n'));
