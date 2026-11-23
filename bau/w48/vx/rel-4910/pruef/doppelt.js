// Statisch: doppelte Top-Level-Definitionen je Skript; nur neue gegenueber Basis. node doppelt.js base.html rel.html
const fs = require('fs');
const acorn = require('/opt/node-tools/node_modules/acorn');
function scripts(file) {
  const s = fs.readFileSync(file, 'utf8'), out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m, k = 0;
  while ((m = re.exec(s))) {
    const attrs = m[1], body = m[2];
    if (/\bsrc\s*=/.test(attrs)) continue;
    const id = (attrs.match(/\bid\s*=\s*["']([^"']+)/) || [])[1];
    const type = (attrs.match(/\btype\s*=\s*["']([^"']+)/) || [])[1] || '';
    if (type && !/javascript|module|text\/plain/i.test(type)) continue;
    if (/text\/plain/i.test(type) && !(id && /^sq-.*-src$/.test(id))) continue;
    out.push({key: id || ('inline#' + (k++)), type, body});
  }
  return out;
}
function dups(sc) {
  let ast, mod = /module/.test(sc.type);
  try { ast = acorn.parse(sc.body, {ecmaVersion: 'latest', sourceType: mod ? 'module' : 'script', allowReturnOutsideFunction: true, allowHashBang: true}); }
  catch (e) { try { ast = acorn.parse(sc.body, {ecmaVersion: 'latest', sourceType: 'module'}); } catch (e2) { return {err: e.message}; } }
  const cnt = {};
  const add = (n, kind) => { (cnt[n] = cnt[n] || []).push(kind); };
  const names = p => { if (!p) return []; if (p.type === 'Identifier') return [p.name]; if (p.type === 'ObjectPattern') return p.properties.flatMap(q => names(q.type === 'RestElement' ? q.argument : q.value)); if (p.type === 'ArrayPattern') return p.elements.flatMap(names); if (p.type === 'AssignmentPattern') return names(p.left); if (p.type === 'RestElement') return names(p.argument); return []; };
  for (let st of ast.body) {
    if (st.type === 'ExportNamedDeclaration' && st.declaration) st = st.declaration;
    if (st.type === 'FunctionDeclaration' && st.id) add(st.id.name, 'function');
    else if (st.type === 'ClassDeclaration' && st.id) add(st.id.name, 'class');
    else if (st.type === 'VariableDeclaration' && st.kind !== 'var') for (const d of st.declarations) for (const n of names(d.id)) add(n, st.kind);
  }
  const d = {}; for (const [n, ks] of Object.entries(cnt)) if (ks.length > 1) d[n] = ks.join('+');
  return {d, n: Object.keys(cnt).length};
}
const [bf, rf] = process.argv.slice(2);
const B = scripts(bf), Rr = scripts(rf);
const bmap = {}; for (const sc of B) { const r = dups(sc); bmap[sc.key] = r; }
const res = {basisSkripte: B.length, relSkripte: Rr.length, parseFehler: [], neu: [], alt: 0, geprueft: 0};
const bAll = new Set(); for (const [k, r] of Object.entries(bmap)) if (r.d) for (const n of Object.keys(r.d)) bAll.add(k + '::' + n);
for (const sc of Rr) {
  const r = dups(sc);
  if (r.err) { res.parseFehler.push(sc.key + ': ' + r.err + (bmap[sc.key] && bmap[sc.key].err ? ' (auch in Basis)' : ' (NEU)')); continue; }
  res.geprueft++;
  for (const [n, k] of Object.entries(r.d)) {
    const b = bmap[sc.key];
    const inBase = b && b.d && b.d[n] && b.d[n].split('+').length >= k.split('+').length;
    if (inBase) res.alt++; else res.neu.push(sc.key + ': ' + n + ' (' + k + ')');
  }
}
res.neueSkripte = Rr.map(s => s.key).filter(k => !(k in bmap));
console.log(JSON.stringify(res, null, 1));
