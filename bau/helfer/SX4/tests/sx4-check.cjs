// SX4: Regel-Prüfung (Wörter, live, MS 2000, VERSION) + acorn auf doppelte Top-Level-Namen je <script>
const fs = require('fs'); const acorn = require('/opt/node-tools/node_modules/acorn');
const f = process.argv[2] || __dirname + '/../index.html', h = fs.readFileSync(f, 'utf8');
const cnt = re => (h.match(re) || []).length; let bad = 0;
const say = (ok, m) => { console.log((ok ? 'OK  ' : 'FEHL') + ' ' + m); if (!ok) bad++; };
say(cnt(/  live: true,/g) === 1, 'live: true genau 1× (' + cnt(/  live: true,/g) + ')');
for (const w of ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia']) say(cnt(new RegExp(w, 'g')) === 0, 'Wort ' + w + ' = ' + cnt(new RegExp(w, 'g')));
say(cnt(/MS 2000/g) === 1, 'MS 2000 genau 1×');
say(/VERSION\s*=\s*'4\.31\.0'/.test(h), "VERSION '4.31.0'");
const re = /<script(?![^>]*type="(?:text\/plain|application\/json)")[^>]*>([\s\S]*?)<\/script>/g; let m, k = 0;
while ((m = re.exec(h))) { k++; let ast; try { ast = acorn.parse(m[1], {ecmaVersion: 'latest', sourceType: 'script'}); } catch (e) { say(false, 'script ' + k + ' parse: ' + e.message); continue; }
  const seen = new Map(), dup = [];
  for (const n of ast.body) { const names = n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration' ? [n.id.name] : n.type === 'VariableDeclaration' ? n.declarations.flatMap(d => d.id.type === 'Identifier' ? [d.id.name] : []) : [];
    for (const x of names) { if (seen.has(x)) dup.push(x); seen.set(x, 1); } }
  if (dup.length || m[1].includes('SX4')) say(!dup.length, 'script ' + k + ': doppelte Top-Level-Namen ' + (dup.join(',') || 'keine'));
}
process.exit(bad ? 1 : 0);
