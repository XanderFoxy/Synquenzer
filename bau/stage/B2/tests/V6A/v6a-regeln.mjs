// V6A Regeln an der Datei: Version unverändert, `  live: true,` genau 1×, „MS 2000“ (alle Schreibungen) genau 1×, keine verbotenen
// Wörter in den neuen Zeilen, Worklet-Quelle nur ASCII, und – Ersatz für v3-mk2-wellen.mjs ohne den privaten Bezug am Bau-Ort – die
// Wellen-Blöcke /*MKD*/ und /*MKT*/ byte-gleich zu 4.30.0 (dort hat v3-mk2-wellen bestanden)
import fs from 'fs';
import { ok, done, APP, BASE } from './v6a-lib.mjs';
const h = fs.readFileSync(APP, 'utf8'), g = fs.readFileSync(BASE, 'utf8');
const ver = s => (s.match(/const VERSION = '(\d+\.\d+\.\d+)'/) || [])[1];
ok('REG-1 Version unverändert', ver(h) === ver(g) && ver(h) === '4.30.0', ver(h));
ok('REG-2 Zeile „  live: true,“ genau 1×', h.split('\n').filter(l => l.startsWith('  live: true,')).length === 1);
ok('REG-3 „MS 2000“ (alle Schreibungen) genau 1×', (h.match(/ms[ -]?2000/ig) || []).length === 1, (h.match(/ms[ -]?2000/ig) || []).length + '×');
const gl = new Set(g.split('\n')), added = h.split('\n').filter(l => !gl.has(l));
const bad = added.filter(l => /korg|micro ?korg|radias|dwgs|kodamo|mask ?1|\bnord\b|kompakt/i.test(l));
ok('REG-4 keine verbotenen Wörter in den ' + added.length + ' neuen/geänderten Zeilen', !bad.length, bad.slice(0, 3).join(' | ').slice(0, 200));
const blk = (s, a, z) => s.slice(s.indexOf(a), s.indexOf(z));
ok('REG-5 Wellen-Block /*MKD*/ byte-gleich zu 4.30.0', blk(h, '/*MKD{*/', '/*}MKD*/') === blk(g, '/*MKD{*/', '/*}MKD*/') && blk(h, '/*MKD{*/', '/*}MKD*/').length > 1000);
ok('REG-6 Wellen-Block /*MKT*/ byte-gleich zu 4.30.0', blk(h, '/*MKT{*/', '/*}MKT*/') === blk(g, '/*MKT{*/', '/*}MKT*/') && blk(h, '/*MKT{*/', '/*}MKT*/').length > 1000);
const m = h.match(/<script type="text\/plain" id="sq-worklet-src">([\s\S]*?)<\/script>/);
ok('REG-7 Worklet-Quelle nur ASCII (Blob/data:-Laden)', m && ![...m[1]].some(c => c.charCodeAt(0) > 127));
const sym = new Set([...g].filter(c => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(c))), neu = new Set();
for (const l of added) for (const c of l) if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(c) && !sym.has(c)) neu.add(c);
ok('REG-8 keine neuen Emoji-/Bildzeichen (nur ◆ und Zeichen, die 4.30.0 schon nutzt)', !neu.size, [...neu].join(' '));
process.exit(done() ? 1 : 0);
