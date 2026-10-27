// MK8b-02 quick name check: own names against the private factory name lists (Levenshtein <= 2 after lower case, without
// digits and spaces), duplicates, length. Prints only OWN names (never a factory name).
import fs from 'fs';
import {KOMPAKT} from './v3-mk8b-rezepte.mjs';
const W = JSON.parse(fs.readFileSync(new URL('../manuals/werksnamen.local.json', import.meta.url), 'utf8'));
const norm = s => String(s).toLowerCase().replace(/[0-9\s]/g, '');
const lev = (a, b) => { const m = a.length, n = b.length, d = Array.from({length: m + 1}, (_, i) => [i].concat(new Array(n).fill(0))); for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
const FN = W.ms.concat(W.mk).map(norm), names = KOMPAKT.flat().map(r => r.n);
let bad = 0;
for (const n of names) { const m = Math.min(...FN.map(f => lev(norm(n), f))); if (m <= 2 || n.length > 12) { bad++; console.log('ZU NAH/LANG', n, 'Abstand', m, 'Länge', n.length); } }
const dup = names.filter((n, i) => names.indexOf(n) !== i); if (dup.length) { bad++; console.log('DOPPELT', dup); }
console.log(bad ? 'FAIL' : 'PASS', names.length, 'Namen');
