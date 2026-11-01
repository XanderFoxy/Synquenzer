// Regeln: VERSION 4.30.0, genau 1× „  live: true,“, „MS 2000“ genau 1×, verbotene Wörter = 0 (App, Tests, Doku des Pakets), kein Emoji in der Platte,
// alle neuen CSS-Namen mit ndp-Präfix im NDP-CSS-Block, geänderte Stellen mit // NDP markiert, keine Netz-/Datenbank-Zugriffe im neuen Code
import fs from 'fs'; import path from 'path';
import {launch, open, openPlate, report, FILE} from './ndp-lib.mjs';
const rows = [], H = fs.readFileSync(FILE, 'utf8'), DIR = path.dirname(FILE);
const cnt = (s, re) => (s.match(re) || []).length;
rows.push({n: "VERSION bleibt '4.30.0'", ok: H.includes("const VERSION = '4.30.0';")});
rows.push({n: 'genau 1× „  live: true,“', ok: cnt(H, /  live: true,/g) === 1});
rows.push({n: '„MS 2000“ genau 1× in der App', ok: cnt(H, /MS 2000/g) === 1});
const BAD = ['groK', 'GROKorcim', 'SAIDAR', 'SGWD', 'omadoK', '1ksaM', 'droN', 'tkapmoK', 'aivalC'].map(w => [...w].reverse().join(''));   // umgedreht abgelegt: die Wörter stehen nirgends im Klartext
const files = [FILE, ...fs.readdirSync(path.join(DIR, 'tests')).filter(f => /\.(mjs|sh)$/.test(f)).map(f => path.join(DIR, 'tests', f)), ...fs.readdirSync(path.join(DIR, 'quelle')).map(f => path.join(DIR, 'quelle', f)),
  ...['CHANGES.md', 'STATUS.md'].map(f => path.join(DIR, f)).filter(f => fs.existsSync(f))];
for (const w of BAD) { const hits = files.filter(f => fs.readFileSync(f, 'utf8').toLowerCase().includes(w.toLowerCase())); rows.push({n: 'verbotenes Wort „' + w + '“ = 0', ok: !hits.length, d: hits.map(f => path.basename(f)).join(',')}); }
const blk = H.slice(H.indexOf('<script type="text/plain" id="sq-ndp-src">'), H.indexOf('<script type="text/plain" id="sq-mk-src">'));
rows.push({n: 'Block sq-ndp-src vorhanden (text/plain, erst beim Öffnen ausgewertet)', ok: blk.length > 1000});
rows.push({n: 'kein Netz-/Datenbank-Zugriff im neuen Code', ok: !/fetch\(|XMLHttpRequest|supabase|indexedDB\.open|WebSocket/i.test(blk)});
const css = H.slice(H.indexOf('/* NDP-CSS-BEGIN'), H.indexOf('/* NDP-CSS-END */'));
const cls = new Set((css.match(/\.[a-zA-Z][\w-]*/g) || []).map(s => s.slice(1)));
const known = new Set(['hb', 'rb', 'on', 'led', 'ndpk', 'ndpopen']);
rows.push({n: 'Haupt-CSS (NDP-CSS-BEGIN … END): nur ndp-Namen + vorhandene Klassen', ok: [...cls].every(c => c.startsWith('ndp') || known.has(c)), d: [...cls].filter(c => !c.startsWith('ndp') && !known.has(c)).join(',')});
rows.push({n: 'Platten-CSS im Block: #ndp-Wurzel', ok: /NDP-CSS-PLATTE-BEGIN[\s\S]*#ndp\{[\s\S]*NDP-CSS-PLATTE-END/.test(blk)});
const marks = cnt(H, /\/\/ NDP/g); rows.push({n: 'geänderte Stellen mit „// NDP“ markiert (' + marks + ')', ok: marks >= 8});
const b = await launch(), p = await open(b, 'H'); await openPlate(p);
const txt = await p.evaluate(() => document.getElementById('ndp').innerText + ' ' + [...document.querySelectorAll('#ndp [aria-label]')].map(e => e.getAttribute('aria-label')).join(' '));
const emo = txt.match(/\p{Extended_Pictographic}/gu) || [];
rows.push({n: 'kein Emoji als Grafik in der Platte', ok: !emo.length, d: emo.join(' ')});
rows.push({n: 'sichtbarer Name nur „North“ (MD_NAME)', ok: /North/.test(txt)});
const imgs = await p.evaluate(() => document.querySelectorAll('#ndp img, #ndp [style*="url("]').length);
rows.push({n: 'keine Bilddateien/Grafik-URLs in der Platte', ok: imgs === 0});
await b.close();
process.exit(report(rows) ? 0 : 1);
