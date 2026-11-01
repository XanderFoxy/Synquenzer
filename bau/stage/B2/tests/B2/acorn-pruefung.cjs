// klassische <script>-Blöcke: Syntax + doppelte Top-Level-Namen (über alle Blöcke)
const fs = require('fs'), acorn = require('acorn');
const h = fs.readFileSync(process.argv[2], 'utf8');
const re = /<script([^>]*)>([\s\S]*?)<\/script>/g; let m, n = 0, err = 0; const seen = new Map(), dup = [];
while ((m = re.exec(h))) {
  const at = m[1]; if (/type\s*=\s*["'](?!text\/javascript)/i.test(at) || /\bsrc=/.test(at)) continue;
  n++; let ast;
  try { ast = acorn.parse(m[2], {ecmaVersion: 'latest', sourceType: 'script'}); } catch (e) { err++; console.log('SYNTAX Block', n, e.message); continue; }
  const add = (id, kind) => { if (seen.has(id) && !(kind === 'var' && seen.get(id) === 'var')) dup.push(id); seen.set(id, kind); };
  for (const s of ast.body) {
    if (s.type === 'FunctionDeclaration') add(s.id.name, 'fn');
    else if (s.type === 'ClassDeclaration') add(s.id.name, 'class');
    else if (s.type === 'VariableDeclaration') for (const d of s.declarations) { const names = []; (function w(p) { if (!p) return; if (p.type === 'Identifier') names.push(p.name); else if (p.type === 'ObjectPattern') p.properties.forEach(q => w(q.value || q.argument)); else if (p.type === 'ArrayPattern') p.elements.forEach(w); else if (p.type === 'AssignmentPattern') w(p.left); else if (p.type === 'RestElement') w(p.argument); })(d.id); names.forEach(x => add(x, s.kind)); }
  }
}
console.log(`Blöcke ${n} · Syntaxfehler ${err} · doppelte Top-Level-Namen ${dup.length}${dup.length ? ': ' + dup.join(', ') : ''}`);
process.exit(err || dup.length ? 1 : 0);
