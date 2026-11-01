// SX714: acorn-Prüfung aller <script>-Blöcke + Regeln (live, verbotene Wörter, MS 2000, Version)
import fs from 'fs'; import { createRequire } from 'module'; import { APP } from './lib.mjs';
const require = createRequire(import.meta.url); let acorn;
try { acorn = require('acorn'); } catch (e) { acorn = require('/opt/node-tools/node_modules/acorn'); }
const s = fs.readFileSync(APP, 'utf8'); const out = {};
const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g; let m, k = 0, bad = [];
while ((m = re.exec(s))) { k++; if (/type="(?!module|text\/javascript)/.test(m[0].slice(0, 80))) continue; try { acorn.parse(m[1], {ecmaVersion: 'latest', sourceType: /type="module"/.test(m[0].slice(0, 60)) ? 'module' : 'script'}); } catch (e) { bad.push(k + ': ' + e.message); } }
out.scripts = k; out.acornFehler = bad;
out.live = (s.match(/^  live: true,/gm) || []).length;
out.verboten = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia'].map(w => [w, (s.match(new RegExp(w, 'g')) || []).length]).filter(x => x[1]);
out.ms2000 = (s.match(/MS 2000/g) || []).length;
out.version = (s.match(/const VERSION = '(4[^']+)'/) || [])[1];
console.log(JSON.stringify(out));
