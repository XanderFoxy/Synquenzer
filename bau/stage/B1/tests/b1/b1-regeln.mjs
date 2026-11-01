// B1 Regeln: Syntax + doppelte Top-Level-Namen aller klassischen <script>-Blöcke (acorn), Pflicht-Regeln des Repos.
// node b1-regeln.mjs <index.html>    (acorn: NODE_PATH=$(npm root -g) oder /opt/node-tools/node_modules)
import fs from 'fs'; import path from 'path'; import {createRequire} from 'module'; import {execSync} from 'child_process';
const FILE = path.resolve(process.argv[2]);
const req = createRequire(import.meta.url);
let acorn = null;
for (const p of [...(process.env.NODE_PATH || '').split(':').filter(Boolean), (() => { try { return execSync('npm root -g').toString().trim(); } catch (e) { return ''; } })(), '/opt/node-tools/node_modules']) {
  try { acorn = req(path.join(p, 'acorn')); break; } catch (e) {}
}
if (!acorn) try { acorn = req('acorn'); } catch (e) {}
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const html = fs.readFileSync(FILE, 'utf8'), BASE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../../snapshots/R-4300.html');

// 1) klassische Skripte
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m, blocks = [];
while ((m = re.exec(html))) {
  const attr = m[1], type = (attr.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
  if (/\bsrc\s*=/.test(attr)) continue;
  if (type && !/^(text|application)\/(javascript|ecmascript)$/i.test(type)) continue;
  blocks.push({at: html.slice(0, m.index).split('\n').length, src: m[2]});
}
ok('R0 acorn geladen', !!acorn);
let syn = 0; const names = new Map();
for (const b of blocks) {
  let ast;
  try { ast = acorn.parse(b.src, {ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true}); }
  catch (e) { syn++; console.log('  Syntaxfehler im Block ab Zeile ' + b.at + ': ' + e.message); continue; }
  const add = (nm, kind) => { if (!names.has(nm)) names.set(nm, []); names.get(nm).push({at: b.at, kind}); };
  for (const st of ast.body) {
    if (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') add(st.id.name, st.type === 'ClassDeclaration' ? 'class' : 'function');
    else if (st.type === 'VariableDeclaration') for (const d of st.declarations) {
      const walk = p => { if (!p) return; if (p.type === 'Identifier') add(p.name, st.kind); else if (p.type === 'ObjectPattern') p.properties.forEach(q => walk(q.value || q.argument)); else if (p.type === 'ArrayPattern') p.elements.forEach(walk); else if (p.type === 'AssignmentPattern') walk(p.left); else if (p.type === 'RestElement') walk(p.argument); };
      walk(d.id);
    }
  }
}
// Test-API: Schlüssel von const SYNQUENZER = {…} und allen Object.assign(SYNQUENZER, {…} | NAME | f()) – ein späterer Schlüssel
// überschreibt still einen früheren (so geschehen: T1 tkInfo über STIMME tkInfo). Gemeldet werden nur neue Überschreibungen gegen 4.30.0.
function apiKeys(src) {
  const keys = new Map(), objs = new Map(), fns = new Map(); let ast;
  for (const b of src) { try { ast = acorn.parse(b.src, {ecmaVersion: 'latest', sourceType: 'script'}); } catch (e) { continue; }
    for (const st of ast.body) {
      if (st.type === 'VariableDeclaration') for (const d of st.declarations) if (d.id.type === 'Identifier' && d.init && d.init.type === 'ObjectExpression') objs.set(d.id.name, d.init);
      if (st.type === 'FunctionDeclaration') { const r = st.body.body.find(x => x.type === 'ReturnStatement'); if (r && r.argument && r.argument.type === 'ObjectExpression') fns.set(st.id.name, r.argument); }
    } }
  const take = (o, who) => { if (!o) return; for (const pr of o.properties) { if (pr.type !== 'Property' || pr.computed) continue; const k = pr.key.name || pr.key.value; if (!keys.has(k)) keys.set(k, []); keys.get(k).push(who); } };
  take(objs.get('SYNQUENZER'), 'SYNQUENZER');
  for (const b of src) { try { ast = acorn.parse(b.src, {ecmaVersion: 'latest', sourceType: 'script'}); } catch (e) { continue; }
    for (const st of ast.body) { const e = st.type === 'ExpressionStatement' && st.expression;
      if (!e || e.type !== 'CallExpression' || !e.callee.property || e.callee.property.name !== 'assign' || !e.arguments[0] || e.arguments[0].name !== 'SYNQUENZER') continue;
      for (const a of e.arguments.slice(1)) {
        if (a.type === 'ObjectExpression') take(a, 'Zeile ' + (b.at + b.src.slice(0, a.start).split('\n').length - 1));
        else if (a.type === 'Identifier') take(objs.get(a.name), a.name);
        else if (a.type === 'CallExpression' && a.callee.type === 'Identifier') take(fns.get(a.callee.name), a.callee.name + '()');
      } } }
  return keys;
}
const blocksOf = h => { const out = []; let q; const r = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; while ((q = r.exec(h))) { const ty = (q[1].match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1]; if (/\bsrc\s*=/.test(q[1]) || (ty && !/javascript|ecmascript/i.test(ty))) continue; out.push({at: h.slice(0, q.index).split('\n').length, src: q[2]}); } return out; };
const kNew = apiKeys(blocks), kOld = apiKeys(blocksOf(fs.readFileSync(BASE, 'utf8')));
const over = [...kNew].filter(([k, a]) => a.length > 1 && !((kOld.get(k) || []).length > 1));
ok('R2b Test-API: keine neuen überschriebenen Schlüssel (alle Object.assign-Zeilen behalten)', kNew.size > 500 && over.length === 0, kNew.size + ' Schlüssel' + (over.length ? ', überschrieben: ' + over.map(([k, a]) => k + ' (' + a.join(' → ') + ')').join(', ') : ''));
// doppelt = mehr als eine Deklaration, außer reine var/function-Wiederholung (im Browser erlaubt, trotzdem melden wir sie)
const dup = [...names].filter(([, a]) => a.length > 1);
ok('R1 klassische Skript-Blöcke ohne Syntaxfehler', syn === 0, blocks.length + ' Blöcke, ' + syn + ' Fehler');
ok('R2 0 doppelte Top-Level-Namen', dup.length === 0, names.size + ' Namen' + (dup.length ? ', doppelt: ' + dup.slice(0, 8).map(([k, a]) => k + '@' + a.map(x => x.at).join('/')).join(', ') : ''));

// 2) Pflicht-Regeln
const cnt = (s) => html.split(s).length - 1;
ok('R3 genau 1× "  live: true,"', cnt('  live: true,') === 1, String(cnt('  live: true,')));
ok('R4 "MS 2000" genau 1×', cnt('MS 2000') === 1, String(cnt('MS 2000')));
const bad = Buffer.from('S29yZyxtaWNyb0tPUkcsUkFESUFTLERXR1MsS29kYW1vLE1hc2sxLE5vcmQsS29tcGFrdA==', 'base64').toString().split(',');   // Liste verschlüsselt, damit die Wörter selbst nicht im Repo stehen
const hits = bad.map(w => [w, (html.match(new RegExp('\\b' + w + '\\b', 'gi')) || []).length]).filter(x => x[1]);
ok('R5 verbotene Wörter = 0', hits.length === 0, hits.map(x => x.join(':')).join(' '));
ok('R6 VERSION 4.30.0', /const VERSION = '4\.30\.0';/.test(html));
const net = (html.match(/\b(fetch|XMLHttpRequest|WebSocket|indexedDB\.open|supabase)\b/gi) || []).length;
const netBase = (fs.readFileSync(BASE, 'utf8').match(/\b(fetch|XMLHttpRequest|WebSocket|indexedDB\.open|supabase)\b/gi) || []).length;
ok('R7 keine neuen Netz-/Datenbank-Zugriffe (Treffer wie 4.30.0)', net === netBase, net + ' / Basis ' + netBase);
const emo = (html.match(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}]/gu) || []).length;
const emoBase = (fs.readFileSync(BASE, 'utf8').match(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}]/gu) || []).length;
ok('R8 keine neuen Emoji (wie 4.30.0)', emo <= emoBase, emo + ' / Basis ' + emoBase);
console.log((fails ? 'FAIL' : 'OK') + ' b1-regeln ' + (n - fails) + '/' + n);
process.exit(fails ? 1 : 0);
