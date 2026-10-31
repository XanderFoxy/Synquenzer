// Rule 28 / brand / process checks of branch K: index.html = vs-base-B.html + the new blocks only (plus the listed small edits);
// the worklet block 'dirigent-analog' and the MS 2000 block byte-identical; VERSION and CLOUD lines unchanged; "MS 2000" exactly
// once in the app; no brand names in the new parts; no Supabase call added.
import fs from 'fs';
const HERE = new URL('.', import.meta.url).pathname;
const base = fs.readFileSync(HERE + '../../../werkzeug/vs-base-B.html', 'utf8'), app = fs.readFileSync(HERE + '../index.html', 'utf8');
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const block = (s, id) => { const a = s.indexOf('<script type="text/plain" id="' + id + '">'); return a < 0 ? null : s.slice(a, s.indexOf('</script>', a) + 9); };
const bm = block(app, 'sq-bm-src');
// the app without the new block(s) and without the declared edits = the base
let rest = app.replace(bm + '\n', '');
const ar = block(app, 'sq-arp-src'); if (ar) rest = rest.replace(ar + '\n', '');
const EDITS = JSON.parse(fs.readFileSync(HERE + '../werkzeug/edits.json', 'utf8'));
for (const e of EDITS) rest = rest.split(e.new).join(e.old);
ok('Regel 28: index.html = Basis + neue Blöcke (+ ' + EDITS.length + ' gelistete Änderungen)', rest === base, rest === base ? 'identisch (' + (app.length - base.length) + ' Bytes neu)' : 'Abweichung bei Zeichen ' + [...rest].findIndex((c, i) => c !== base[i]));
for (const id of ['sq-worklet-src']) ok('Regel 28: Block ' + id + ' (dirigent-analog) byte-gleich', block(app, id) === block(base, id), (block(app, id) || '').length + ' Bytes');
const mkA = block(app, 'sq-mk-src'), mkB = block(base, 'sq-mk-src');
ok('Regel 28: Block sq-mk-src (MS 2000) ' + (EDITS.some(e => mkB.includes(e.old)) ? 'nur gelistete Änderungen' : 'byte-gleich'), EDITS.reduce((s, e) => s.split(e.new).join(e.old), mkA) === mkB, mkA.length + ' Bytes');
const line = (s, re) => (s.match(re) || [''])[0];
ok('VERSION- und CLOUD-Zeile unverändert', line(app, /^const VERSION = .*$/m) === line(base, /^const VERSION = .*$/m) && line(app, /^  live: true,.*$/m) === line(base, /^  live: true,.*$/m), line(app, /^const VERSION = .*$/m) + ' · ' + line(app, /^  live: true,/m));
ok('„MS 2000“ genau 1× in der App', (app.match(/MS 2000/g) || []).length === 1, (app.match(/MS 2000/g) || []).length + '×');
const news = bm + (ar || '');
const brand = news.match(/kodamo|mask ?1(?![0-9])|essence|korg|microkorg|radias|dwgs|\bnord\b|kompakt/gi) || [];
ok('Marken: keine Original-Namen in den neuen Teilen', brand.length === 0, brand.length ? brand.join(', ') : '0 Treffer');
ok('Kein Supabase-Aufruf in den neuen Teilen', !/supabase|\.rpc\(|fetch\(/i.test(news), 'keine Treffer');
ok('Anzeigename nur über BM_NAME (kein „Bit Mask“-Text im Prozessor)', !/Bit Mask/.test(news.slice(news.indexOf('const BM_WK'), news.indexOf('/* Ende BM-KLANG */'))), 'ok');
fs.writeFileSync(HERE + 'bmk-regel28.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
