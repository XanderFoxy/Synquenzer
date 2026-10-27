// VS4-fix: Kern vs-dsp/clean.mjs → eingebettete Fassung (ohne Kommentare/Einrückung) als function vsCleanMake() {…}
import fs from 'fs';
const core = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs?' + Date.now());
const src = core.srcText().replace(/^\(function factory\(\) \{\n?/, '').replace(/\}\)\(\)$/, '');
const out = [];
for (let l of src.split('\n')) {
  const t = l.trim(); if (!t || t.startsWith('//')) continue;
  let q = null, cut = -1;
  for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; } if (c === "'" || c === '"' || c === '`') q = c; else if (c === '/' && t[i + 1] === '/') { cut = i; break; } }
  out.push(cut >= 0 ? t.slice(0, cut).trimEnd() : t);
}
const body = 'function vsCleanMake() {\n' + out.join('\n') + '\n}';
const app = process.argv[2], mode = process.argv[3] || 'diff', h = fs.readFileSync(app, 'utf8');
const a = h.indexOf('function vsCleanMake() {\n'), b = h.indexOf("\nreturn {clean, Cleaner, estimateDelay, nlms, VERSION: 'vs4-clean-1'};\n}", a);
if (a < 0 || b < 0) throw new Error('Kern im App-Text nicht gefunden');
const end = b + "\nreturn {clean, Cleaner, estimateDelay, nlms, VERSION: 'vs4-clean-1'};\n}".length, old = h.slice(a, end);
if (mode === 'write') { fs.writeFileSync(app, h.slice(0, a) + body + h.slice(end)); console.log('geschrieben', old.length, '→', body.length); }
else { fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-vs4/emb-old.js', old); fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-vs4/emb-new.js', body); console.log(old.length, body.length); }
