// MK2-11 / FP-SICHER (B.6 Nr. 9): brand words in the AM part (block sq-mk-src, worklet MK section, AM help lines) and in the whole
// file; the data block holds only numbers; no image data / new font in the panel; worklet ASCII, no closing script tag inside
import fs from 'fs';
const F = process.argv[2], s = fs.readFileSync(F, 'utf8');
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const A = /korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b/ig;
const blk = (a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i); return i >= 0 && j > i ? s.slice(i, j) : ''; };
const mk = blk('<script type="text/plain" id="sq-mk-src">', '</script>'), wk = blk('/*MK{*/', '/*}MK*/'), help = s.split('\n').filter(l => /MK_LABEL \+ ' ·/.test(l)).join('\n');
ok('B.6 Nr. 9 (a) AM-Teil: sq-mk-src, Worklet-Abschnitt MK, AM-Hilfe-Zeilen ohne Markenwort', !(mk.match(A) || []).length && !(wk.match(A) || []).length && !(help.match(A) || []).length, [mk.length, wk.length, help.length].join(' / ') + ' Zeichen geprüft');
const all = (s.match(/micro ?korg|radias|dwgs/ig) || []).length, ms = s.match(/ms[ -]?2000/ig) || [];
ok('B.6 Nr. 9 (b) ganze Datei: microKORG/RADIAS/DWGS 0, „MS 2000“ genau 1 (MK_LABEL)', all === 0 && ms.length === 1 && ms[0] === 'MS 2000' && /const MK_LABEL = 'MS 2000';/.test(s), all + ' / ' + JSON.stringify(ms));
const d = blk("/*MKD{*/const MK_WD = '", "';/*}MKD*/").slice("/*MKD{*/const MK_WD = '".length);
ok('FP-SICHER Datenblock: nur Base64-Zahlen, keine Wörter/Namen', /^[A-Za-z0-9+/=]+$/.test(d) && d.length > 10000 && !(d.match(A) || []).length, d.length + ' Zeichen');
ok('B.6 Nr. 9 (c) Bedienfeld ohne Bild-Daten und neue Schrift', !/data:image|<img|@font-face/i.test(mk), '');
const w = blk('<script type="text/plain" id="sq-worklet-src">', '</script>'); let na = 0; for (let i = 0; i < w.length; i++) if (w.charCodeAt(i) > 126) na++;
ok('Worklet-ASCII, kein schließendes Script-Tag im Worklet', na === 0 && !/<\/script/i.test(w.slice(40)), na + ' Nicht-ASCII-Zeichen');
console.log(fails ? fails + ' FAIL' : 'alles PASS'); process.exit(fails ? 1 : 0);
