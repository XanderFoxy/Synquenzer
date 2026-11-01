// PINSEL2: jedes ausführbare <script> parsen, doppelte Top-Level-Namen zählen (vorher/nachher)
const acorn = require('/opt/node-tools/node_modules/acorn'), fs = require('fs');
function scan(f) { const h = fs.readFileSync(f, 'utf8'), re = /<script(?![^>]*type="text\/plain")[^>]*>([\s\S]*?)<\/script>/g; let m, i = 0, dups = [], err = 0;
  while ((m = re.exec(h))) { i++; let ast; try { ast = acorn.parse(m[1], {ecmaVersion: 'latest', sourceType: 'script'}); } catch (e) { err++; console.log('PARSE', f, i, e.message); continue; }
    const seen = new Map(); for (const n of ast.body) { const names = n.type === 'FunctionDeclaration' ? [n.id.name] : n.type === 'VariableDeclaration' ? n.declarations.flatMap(d => d.id.type === 'Identifier' ? [d.id.name] : []) : n.type === 'ClassDeclaration' ? [n.id.name] : [];
      for (const x of names) seen.set(x, (seen.get(x) || 0) + 1); }
    for (const [k, v] of seen) if (v > 1) dups.push(i + ':' + k); }
  return {scripts: i, err, dups}; }
const a = scan(process.argv[2]), b = scan(process.argv[3]); console.log('vorher', JSON.stringify(a)); console.log('nachher', JSON.stringify(b));
process.exit(b.err || b.dups.length > a.dups.length ? 1 : 0);
