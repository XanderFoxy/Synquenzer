// MK8 data checks: MK8-01 (complete: name, role, bank, place, info text; decode = recipe), MK8-02 (names: E9 / A.13 list,
// Levenshtein <= 2 against the factory program lists of both manuals, read ONLY from the private file
// scratchpad/manuals/werksnamen.local.json (fails without it), sample of 3 factory names in the test folder, the repo and the
// app: 0 hits; brand words B.6 Nr. 9), MK8-03 (origin list for CHANGES; reads only category and mode per place), MK8-05 (order
// and features), MK8-08 (size of the data block). No factory name appears in this file or its output.
// Usage: node v3-mk8-daten.mjs <index.html> [--changes]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import {programs} from './v3-mk8-bau.mjs';
import {loadSQMK} from './v3-mk8-sqmk.mjs';
const FILE = path.resolve(process.argv[2]), DIR = path.dirname(new URL(import.meta.url).pathname);
const PRIV = path.resolve(DIR, '../manuals/werksnamen.local.json');
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
if (!fs.existsSync(PRIV)) { console.log('FAIL MK8-02 — private Werksnamen-Datei fehlt (EN3-07)'); process.exit(1); }
const W = JSON.parse(fs.readFileSync(PRIV, 'utf8')), SQ = loadSQMK(FILE), INIT = JSON.stringify(SQ.init());
const P = programs(FILE), prog = P.filter(p => !p.init);
const app = fs.readFileSync(FILE, 'utf8');
// ---- MK8-01 complete + decode equal
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const A = await page.evaluate(() => { mkLoad(); const o = [];
  for (let b = 1; b <= 8; b++) for (let s = 1; s <= 16; s++) { const r = MKF.facRec(b, s), snd = factorySound(r.id); o.push({b, s, id: r.id, name: r.name, tip: r.tip, role: soundRole(r), prole: MKF.roleOf(b, s)[0], bank: r.bank, slot: r.slot, mk: snd.p.mk, mw: snd.p.mw, cat: r.cat, engine: snd.engine}); }
  return {o, fac: FACTORY.map(f => f.name), lib: SYNTH_LIB.filter(f => f.engine === 'mk').length};
});
await browser.close();
let miss = [], dec = [];
for (const x of A.o) {
  const p = P.find(q => q.b === x.b && q.s === x.s);
  if (!(x.b === 8 && x.s === 16) && (!x.name || x.name.length > 12 || !x.tip || !x.role || x.bank !== x.b || x.slot !== x.s || x.engine !== 'mk')) miss.push(x.id);
  if (JSON.stringify(x.mk) !== JSON.stringify(p.pm) || Math.abs(x.mw - p.mw) > 1 / 127) dec.push(x.id);
}
ok('MK8-01 Vollständig', miss.length === 0 && A.o.length === 128 && A.lib === 128, '128 Plätze, je Name ≤ 12, Rolle, Bank, Platz, ⓘ; Bibliothek ' + A.lib + ' MS-2000-Einträge' + (miss.length ? ' · fehlt: ' + miss.join(' ') : ''));
ok('MK8-01 Daten entpackt = Rezept', dec.length === 0, dec.length ? dec.join(' ') : '128 deep-equal (Kodierung ↔ Entpacken)');
ok('MK8-01 Konsole', errs.length === 0, errs.join(' | '));
// ---- MK8-02 names
const norm = s => String(s).toLowerCase().replace(/[0-9\s]/g, '');
const lev = (a, b) => { const m = a.length, n = b.length, d = Array.from({length: m + 1}, (_, i) => [i].concat(new Array(n).fill(0))); for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
const FN = W.ms.concat(W.mk).map(norm);
const near = prog.filter(p => FN.some(f => lev(norm(p.name), f) <= 2));
ok('MK8-02 Namen ≠ Werksnamen (Levenshtein ≤ 2)', near.length === 0, near.length ? near.length + ' Namen zu nah: ' + near.map(p => p.id.slice(5)).join(' ') : prog.length + ' Namen gegen ' + FN.length + ' Werksnamen, kleinster Abstand ' + Math.min(...prog.map(p => Math.min(...FN.map(f => lev(norm(p.name), f))))));
const E9 = ['Moog', 'Prophet', 'Juno', '303', '808', '909', 'DX', 'Moroder', 'Jupiter', 'Virus', 'Nord', 'Linn', 'Simmons', 'CZ', 'Microwave', 'Blofeld', 'Waldorf', 'Access', 'Clavia', 'Oberheim', 'SEM',
  'Source', 'DMX', 'Emulator', 'Synthex', 'PPG', 'Kawai', 'Solina', 'Mellotron', 'Minimoog', 'Kodamo', 'EssenceFM', 'Montage', 'FM-X', 'Clavinet', 'Korg', 'microKORG', 'MS2000', 'RADIAS', 'DWGS', 'Vox'];
const words = s => String(s).split(/[\s\-–,.;:„“"()…]+/).filter(Boolean).map(w => w.toLowerCase());
const hitE9 = prog.filter(p => { const w = words(p.name).concat(words(p.tip)); return E9.some(e => w.includes(e.toLowerCase())) || /\bOB-/i.test(p.name) || /ms[ -]?2000/i.test(p.name + ' ' + p.tip); });
ok('MK8-02 E9-Prüfliste (A.4 + A.13, ganze Wörter) in Namen und ⓘ', hitE9.length === 0, hitE9.map(p => p.id).join(' '));
const dupN = prog.filter((p, i) => prog.findIndex(q => q.name === p.name) !== i || A.fac.includes(p.name));
ok('MK8-02 Namen eindeutig (auch gegen die übrigen Werks-Sounds)', dupN.length === 0, dupN.map(p => p.name).join(', '));
// brand words in the AM part of the file (B.6 Nr. 9 a/b)
const blk = app.slice(app.indexOf('<script type="text/plain" id="sq-mk-src">'), app.indexOf('</script>', app.indexOf('id="sq-mk-src"')));
const BR = /korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b/gi;
const nBlk = (blk.match(BR) || []).length, nAll = (app.match(/micro ?korg|radias|dwgs/gi) || []).length, ms = app.match(/ms[ -]?2000/gi) || [];
ok('MK8-02 Markenwörter (B.6 Nr. 9)', nBlk === 0 && nAll === 0 && ms.length === 1 && ms[0] === 'MS 2000', 'Block sq-mk-src ' + nBlk + ' Treffer, Datei micro/radias/dwgs ' + nAll + ', „MS 2000“ ' + ms.length + '×');
// sample of 3 factory names in the tests, the repo and the app: 0 hits
const sample = [W.ms[17], W.ms[66], W.mk[40]], roots = [DIR, '/home/user/synquenzer/bau', '/home/user/synquenzer/index.html', FILE];
let hits = 0; const scan = f => { let st; try { st = fs.statSync(f); } catch (e) { return; } if (st.isDirectory()) { for (const x of fs.readdirSync(f)) if (x !== 'node_modules' && !x.startsWith('.')) scan(path.join(f, x)); return; }
  if (st.size > 8e6 || !/\.(m?js|html|md|json|txt|out)$/.test(f)) return; const t = fs.readFileSync(f, 'utf8'); for (const n of sample) if (n && t.includes(n)) hits++; };
for (const r of roots) scan(r);
ok('MK8-02 Stichprobe 3 Werksnamen in Tests, Repo und App', hits === 0, hits + ' Treffer');
// ---- MK8-03: origin; categories / modes per place (only these two facts are read)
const pl = W.places || {};
ok('MK8-03 Herkunft', Object.keys(pl).length === 128 && prog.every(p => p.recipe), 'je Klang ein eigenes Rezept (v3-mk8-rezepte.mjs); Kategorie/Modus je Platz gelesen: ' + Object.keys(pl).length);
// ---- MK8-05 order and features
const ROLE = [null, 'hart', 'arp', 'flaeche', 'bass', 'lead', 'seq', 'perk', 'tasten', 'bass', 'bewegung', 'chor', 'lead', 'blaeser', 'wseq', 'bass', 'effekt'];
const rbad = A.o.filter(x => x.b <= 7 && x.prole !== ROLE[x.s]).map(x => x.id);
const hp = s => A.o.find(x => x.b === 8 && x.s === s);
const voc = [9, 10, 11, 12, 13, 14].map(hp), h15 = hp(15), h16 = hp(16);
ok('MK8-05 Rollen A–G je Platz', rbad.length === 0, rbad.join(' ') || '112 Plätze nach der Tabelle');
const sounding = m => (m.mode === 1 || m.mode === 2 ? [0, 1] : [0]);
const arpN = A.o.filter(x => x.mk.arp.on).length, seqN = A.o.filter(x => sounding(x.mk).some(k => x.mk.t[k].seq.on)).length;
const wavN = A.o.filter(x => x.mk.mode !== 3 && sounding(x.mk).some(k => x.mk.t[k].o1.w === 5)).length, dualN = A.o.filter(x => x.mk.mode === 1 || x.mk.mode === 2).length;
const dsyN = A.o.filter(x => x.mk.dly.sync && x.mk.dly.dep > 0).length;
ok('MK8-05 Merkmale', arpN >= 10 && seqN >= 14 && wavN >= 10 && dualN >= 12 && dsyN >= 8, 'Arp ' + arpN + ' (≥ 10), Mod-Seq ' + seqN + ' (≥ 14), Speicherwellen ' + wavN + ' (≥ 10), Dual/Split ' + dualN + ' (≥ 12), Delay-Sync ' + dsyN + ' (≥ 8)');
ok('MK8-05 H09–H14 Vocoder', voc.every(x => x.mk.mode === 3 && x.mk.voc.hold && x.mk.voc.dir === 0 && x.mk.voc.hpl <= 40), voc.map(x => x.name + ' hold ' + (x.mk.voc.hold ? 'ja' : 'nein') + ' DIREKT ' + x.mk.voc.dir + ' HPF ' + x.mk.voc.hpl).join(' · '));
ok('MK8-05 H15 Eingang, H16 = INIT', h15.mk.t[0].o1.w === 7 && h16.id === 'f-init-am' && JSON.stringify(h16.mk) === INIT, 'H15 OSZ 1 = Eingang · H16 = ' + h16.name + ' deep-equal INIT');
// ---- MK8-08 size of the data block
const a = app.indexOf('/*MKF{*/'), b = app.indexOf('/*}MKF*/'), sz = Buffer.byteLength(app.slice(a, b + 8));
ok('MK8-08 Werksdaten im Block ≤ 44 KB', sz <= 44 * 1024, (sz / 1024).toFixed(1) + ' KB (Parameter Base64 ' + (app.slice(a, b).match(/'[A-Za-z0-9+/=]{40,}'/g) || []).reduce((s, x) => s + x.length - 2, 0) + ' B, Namen und ⓘ-Texte)');
if (process.argv.includes('--changes')) {   // MK8-03: the origin table for CHANGES
  console.log('\n| Platz | Name | Rolle | Modus | Merkmale | Herkunft |\n|---|---|---|---|---|---|');
  for (const x of A.o) { const m = x.mk, f = [];
    if (m.arp.on) f.push('Arp'); if (sounding(m).some(k => m.t[k].seq.on)) f.push('Seq'); if (m.mode !== 3 && sounding(m).some(k => m.t[k].o1.w === 5)) f.push('≈ Welle'); if (m.dly.sync && m.dly.dep) f.push('Delay-Sync'); if (m.voc.hold) f.push('Halten');
    console.log('| ' + 'ABCDEFGH'[x.b - 1] + String(x.s).padStart(2, '0') + ' | ' + x.name + ' | ' + x.prole + ' | ' + ['Single', 'Dual', 'Split', 'Vocoder'][m.mode] + ' | ' + f.join(', ') + ' | ' + (x.id === 'f-init-am' ? 'INIT' : 'eigenes Rezept') + ' |'); }
}
console.log((fails ? 'FAIL' : 'PASS') + ' v3-mk8-daten: ' + fails + ' Fehler');
