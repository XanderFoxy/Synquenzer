// G10j: alle <script>-Blöcke (ohne src) mit acorn parsen + Regeln (live, verbotene Wörter, MS 2000)
const fs = require('fs'), acorn = require('/opt/node-tools/node_modules/acorn');
const f = process.argv[2] || __dirname + '/../index.html', s = fs.readFileSync(f, 'utf8');
let n = 0, bad = 0; const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g; let m;
while ((m = re.exec(s))) { if (/type="(?!text\/javascript|module)/.test(m[1])) continue; n++; try { acorn.parse(m[2], {ecmaVersion: 'latest', sourceType: /module/.test(m[1]) ? 'module' : 'script'}); } catch (e) { bad++; console.log('✗ Skript', n, e.message); } }
const cnt = w => s.split(w).length - 1;
console.log('Skripte', n, 'Syntaxfehler', bad);
console.log('live: true', cnt('  live: true,'), '· MS 2000', cnt('MS 2000'));
for (const w of ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia']) { const c = cnt(w); if (c) console.log('✗ verboten', w, c); }
const ok = !bad && cnt('  live: true,') === 1 && cnt('MS 2000') === 1 && !['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia'].some(w => cnt(w));
console.log(ok ? 'ALLE OK' : 'FEHLER'); process.exit(ok ? 0 : 1);
