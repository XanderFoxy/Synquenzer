// MK8 (EN3-07): builds the PRIVATE file scratchpad/manuals/werksnamen.local.json from the two owner's manuals (text form).
// It holds the program names (for the name check only), and per place of the 128-program list only category and mode.
// This script contains no names itself; its output never leaves the private manuals folder.
import fs from 'fs';
const M = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/manuals';
const ms = fs.readFileSync(M + '/ms2000.txt', 'utf8').split('\n'), mk = fs.readFileSync(M + '/microkorg.txt', 'utf8').split('\n');
const CATS = ['Synth Hard', 'Arpeggio', 'Synth Pad', 'Synth Bass', 'Synth Lead', 'Sequence', 'Bell', 'Keyboard', 'Strings', 'Choir', 'Synth Brass', 'Synth Soft', 'Wave Seq', 'S.E.', 'Synth Drum', 'Synth Motion', 'Vocoder', 'AudioIn', 'Init Program'];
const a = ms.indexOf(ms.find(l => /^Voice Name List\s*$/.test(l)));
const places = {}, msNames = [];
for (let i = a; i < a + 260 && i < ms.length; i++) {
  const m = /^\s*([A-H]\d\d)\s+(.*)$/.exec(ms[i]); if (!m) continue;
  const r = new RegExp('^(.+?)\\s+(' + CATS.map(c => c.replace(/\./g, '\\.')).join('|') + ')\\s+(Single|Dual|Split|Vocoder)\\b').exec(m[2]);
  if (!r) continue;
  places[m[1]] = {cat: r[2], mode: r[3]}; msNames.push(r[1].trim());
}
const b = mk.indexOf(mk.find(l => /^\f?Voice Name List\s*$/.test(l))), mkNames = [];
for (let i = b; i < b + 80 && i < mk.length; i++) {
  const re = /[AB]\.\d\d\s*\(\s*\d+\)\s+(.+?)\s{2,}/g; let m;
  while ((m = re.exec(mk[i]))) mkNames.push(m[1].trim());
}
const out = {note: 'privat (EN3-07): nie ins Repo, nie in die App', ms: msNames, mk: mkNames, places};
fs.writeFileSync(M + '/werksnamen.local.json', JSON.stringify(out, null, 1));
fs.chmodSync(M + '/werksnamen.local.json', 0o600);
console.log('ms', msNames.length, 'mk', mkNames.length, 'places', Object.keys(places).length);
