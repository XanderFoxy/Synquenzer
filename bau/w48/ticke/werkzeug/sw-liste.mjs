// Erzeugt DATEIEN/PRUEF in sw.js neu und setzt V. Aufruf: node sw-liste.mjs <app-ordner> <version>
import fs from 'fs'; import path from 'path'; import crypto from 'crypto';
const [dir, ver] = process.argv.slice(2);
const alle = [];
(function lauf(d) { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); const st = fs.statSync(p);
  if (st.isDirectory()) lauf(p); else if (!/\.md$/.test(n) && n !== 'sw.js') alle.push('./' + path.relative(dir, p).split(path.sep).join('/')); } })(dir);
alle.sort();
const dateien = ['./', ...alle];
const h = (f) => crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, f === './' ? 'index.html' : f))).digest().subarray(0, 8).toString('hex');
const pruef = Object.fromEntries(dateien.map((d) => [d, h(d)]));
let sw = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');
sw = sw.replace(/\/\*DATEIEN\*\/\[[^\]]*\]/, '/*DATEIEN*/' + JSON.stringify(dateien)).replace(/\/\*PRUEF\*\/\{[^}]*\}/, '/*PRUEF*/' + JSON.stringify(pruef));
if (ver) sw = sw.replace(/const V = '[^']+';/, `const V = '${ver}';`);
fs.writeFileSync(path.join(dir, 'sw.js'), sw);
if (ver) { const k = path.join(dir, 'kern.js'); fs.writeFileSync(k, fs.readFileSync(k, 'utf8').replace(/export const VERSION = '[^']+';/, `export const VERSION = '${ver}';`)); }
console.log(dateien.length, 'Dateien', ver || '');
