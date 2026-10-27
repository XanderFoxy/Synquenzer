// MK8b data checks: MK8b-01 (128 = 8 genres x 16, name <= 12, role, info text; decode = recipe deep-equal), MK8b-02 (names:
// Levenshtein <= 2 against the private factory name lists of both manuals, read ONLY from scratchpad/manuals/
// werksnamen.local.json; no duplicates, also against all other factory sounds; E9 list; sample of 3 factory names in tests and
// app: 0), MK8b-04 (>= 6 arp/seq per genre, VOCODER 16 vocoders without hold, DIREKT 0, 8 with channel pairs, >= 6 with arp,
// Dual/Split present), MK8b-07 (brand rule grep in the shipped file), size and unpack time. No factory name is printed.
// Usage: node v3-mk8b-daten.mjs <index.html> [base.html] [--changes]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import {programs, BRAND} from './v3-mk8b-bau.mjs';
const FILE = path.resolve(process.argv[2]), BASE = process.argv[3] && !process.argv[3].startsWith('--') ? path.resolve(process.argv[3]) : null, DIR = path.dirname(new URL(import.meta.url).pathname);
const PRIV = path.resolve(DIR, '../manuals/werksnamen.local.json');
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
if (!fs.existsSync(PRIV)) { console.log('FAIL MK8b-02 — private Werksnamen-Datei fehlt (EN3-07)'); process.exit(1); }
const W = JSON.parse(fs.readFileSync(PRIV, 'utf8')), P = programs(FILE), app = fs.readFileSync(FILE, 'utf8');
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const A = await page.evaluate(() => { const t0 = performance.now(); mkLoad(); const blk = performance.now() - t0; const per = [];
  for (let g = 1; g <= 8; g++) { const a = performance.now(); MKK.decodeGenre(g); per.push(+(performance.now() - a).toFixed(2)); }
  const o = []; for (let g = 1; g <= 8; g++) for (let s = 1; s <= 16; s++) { const r = MKK.rec(g, s), snd = factorySound(r.id); o.push({g, s, id: r.id, name: r.name, tip: r.tip, role: r.role, prole: r.prole, ref: r.ref, mk: snd.p.mk, mw: snd.p.mw, engine: snd.engine, inLib: SYNTH_LIB.includes(r)}); }
  const other = FACTORY.map(f => f.name).concat(KIT_NAMES, MKF.names());
  return {o, other, blk: +blk.toFixed(1), per, gl: MKK.GL}; });
await browser.close();
// ---- MK8b-01
const miss = [], dec = [];
for (const x of A.o) {
  const p = P.find(q => q.id === x.id);
  if (!x.name || x.name.length > 12 || !x.tip || !x.role || !x.prole || x.engine !== 'mk' || x.inLib) miss.push(x.id);
  if (!p || JSON.stringify(x.mk) !== JSON.stringify(p.pm) || Math.abs(x.mw - p.mw) > 1 / 127) dec.push(x.id);
}
ok('MK8b-01 128 Klänge, 8 Genres × 16', A.o.length === 128 && miss.length === 0 && A.gl.length === 8, 'Genres ' + A.gl.map(g => g[1]).join(' · ') + '; je Name ≤ 12, Rolle, ⓘ, nicht in den Rollen-Listen' + (miss.length ? ' · fehlt: ' + miss.join(' ') : ''));
ok('MK8b-01 entpackt = Rezept (deep-equal)', dec.length === 0, dec.join(' ') || '128 deep-equal');
ok('MK8b-01 Konsole', errs.length === 0, errs.join(' | '));
// ---- MK8b-02
const norm = s => String(s).toLowerCase().replace(/[0-9\s]/g, '');
const lev = (a, b) => { const m = a.length, n = b.length, d = Array.from({length: m + 1}, (_, i) => [i].concat(new Array(n).fill(0))); for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
const FN = W.ms.concat(W.mk).map(norm), dist = x => Math.min(...FN.map(f => lev(norm(x.name), f)));
const near = A.o.filter(x => dist(x) <= 2);
ok('MK8b-02 Namen ≠ Werksnamen (Levenshtein ≤ 2)', near.length === 0, near.length ? near.length + ' zu nah: ' + near.map(x => x.name).join(', ') : '128 Namen gegen ' + FN.length + ' Werksnamen, kleinster Abstand ' + Math.min(...A.o.map(dist)));
const names = A.o.map(x => x.name), dup = names.filter((n, i) => names.indexOf(n) !== i || A.other.includes(n));
ok('MK8b-02 keine doppelten Namen (auch gegen alle anderen Werks-Sounds und A01–H16)', dup.length === 0, dup.join(', ') || '128 eindeutig');
const E9 = ['Moog', 'Prophet', 'Juno', '303', '808', '909', 'DX', 'Moroder', 'Jupiter', 'Virus', 'Nord', 'Linn', 'Simmons', 'CZ', 'Microwave', 'Blofeld', 'Waldorf', 'Access', 'Clavia', 'Oberheim', 'SEM',
  'Source', 'DMX', 'Emulator', 'Synthex', 'PPG', 'Kawai', 'Solina', 'Mellotron', 'Minimoog', 'Kodamo', 'EssenceFM', 'Montage', 'FM-X', 'Clavinet', 'Korg', 'microKORG', 'MS2000', 'RADIAS', 'DWGS', 'Vox'];
const words = s => String(s).split(/[\s\-–,.;:„“"()…+/]+/).filter(Boolean).map(w => w.toLowerCase());
const hitE9 = A.o.filter(x => { const w = words(x.name).concat(words(x.tip)); return E9.some(e => w.includes(e.toLowerCase())) || /ms[ -]?2000/i.test(x.name + ' ' + x.tip); });
ok('MK8b-02 E9-Prüfliste (ganze Wörter) in Namen und ⓘ', hitE9.length === 0, hitE9.map(x => x.id).join(' '));
const sample = [W.ms[5], W.mk[12], W.mk[77]]; let hits = 0;
const scan = f => { let st; try { st = fs.statSync(f); } catch (e) { return; } if (st.isDirectory()) { for (const x of fs.readdirSync(f)) if (x !== 'node_modules' && !x.startsWith('.')) scan(path.join(f, x)); return; }
  if (st.size > 8e6 || !/\.(m?js|html|md|json|txt|out)$/.test(f) || f === PRIV) return; const t = fs.readFileSync(f, 'utf8'); for (const n of sample) if (n && t.includes(n)) hits++; };
for (const f of fs.readdirSync(DIR).filter(x => x.startsWith('v3-mk8b'))) scan(path.join(DIR, f)); scan(FILE);
ok('MK8b-02 Stichprobe 3 Werksnamen in den MK8b-Dateien und der App', hits === 0, hits + ' Treffer');
// ---- MK8b-04
const sounding = m => (m.mode === 1 || m.mode === 2 ? [0, 1] : [0]);
const per = [], dual = [];
for (let g = 1; g <= 8; g++) { const G = A.o.filter(x => x.g === g); per.push(G.filter(x => x.mk.arp.on || (x.mk.mode !== 3 && sounding(x.mk).some(k => x.mk.t[k].seq.on))).length); dual.push(G.filter(x => x.mk.mode === 1 || x.mk.mode === 2).length); }
ok('MK8b-04 ≥ 6 Arp/Seq-Klänge je Genre', per.every(n => n >= 6), per.map((n, i) => A.gl[i][0] + ' ' + n).join(' · '));
const V = A.o.filter(x => x.g === 8), pairs = V.filter(x => { const v = x.mk.voc; for (let k = 0; k < 16; k += 2) if (v.chl[k] !== v.chl[k + 1] || v.chp[k] !== v.chp[k + 1]) return false; return v.chl.some(c => c !== 127) || v.chp.some(c => c !== 0); });
ok('MK8b-04 VOCODER: 16 Vocoder ohne Halten, DIREKT 0, HPF ≤ 40', V.length === 16 && V.every(x => x.mk.mode === 3 && !x.mk.voc.hold && x.mk.voc.dir === 0 && x.mk.voc.hpl <= 40), V.filter(x => x.mk.mode !== 3 || x.mk.voc.hold).map(x => x.id).join(' ') || '16/16 (E2 = Mikrofon beim Laden: v3-mk8b-ui)');
ok('MK8b-04 VOCODER: ≥ 8 mit Kanal-Paaren wie 8 Bänder', pairs.length >= 8, pairs.length + ' Programme: ' + pairs.map(x => x.name).join(', '));
ok('MK8b-04 Dual/Split wo passend', dual.reduce((a, b) => a + b, 0) >= 6, dual.map((n, i) => A.gl[i][0] + ' ' + n).join(' · '));
// ---- MK8b-07 brand rule (B.6 Nr. 9): no Korg / model name in the shipped file; „MS 2000“ exactly once
const nAll = (app.match(/korg|radias|dwgs|dw[ -]?[68]000|\bvox\b/gi) || []).length, ms = app.match(/ms[ -]?2000/gi) || [];
const blk = app.slice(app.indexOf('/*MKK{*/'), app.indexOf('/*}MKK*/')), nBlk = (blk.match(new RegExp(BRAND.source, 'gi')) || []).length;
const sister = (app.match(/kleine[nr]? Schwester/gi) || []).length;
ok('MK8b-07 Marken-Regel (grep)', nAll === 0 && ms.length === 1 && ms[0] === 'MS 2000' && nBlk === 0, 'Korg/microKORG/RADIAS/DWGS/Vox ' + nAll + ' Treffer, „MS 2000“ ' + ms.length + '×, Kompakt-Block ' + nBlk + ' Treffer, Sammlung heißt „Kompakt“ (Hinweis „kleine Schwester“ nur in Code-Kommentaren: ' + sister + ')');
// ---- size and time
const a = app.indexOf('/*MKK{*/'), b = app.indexOf('/*}MKK*/'), sz = Buffer.byteLength(app.slice(a, b + 8));
ok('MK8b Datenblock', sz <= 30 * 1024, (sz / 1024).toFixed(1) + ' KB (Parameter Base64 ' + (blk.match(/'[A-Za-z0-9+/=]{40,}'/g) || []).reduce((s, x) => s + x.length - 2, 0) + ' B)');
ok('MK8b ein Genre entpackt ≤ 5 ms', Math.max(...A.per) <= 5, A.per.join(' / ') + ' ms (Block auswerten ' + A.blk + ' ms)');
if (BASE) { const d = fs.statSync(FILE).size - fs.statSync(BASE).size; ok('MK8b Budget ≤ +45 KB', d <= 45 * 1024, '+' + d + ' B gegen 4.21.0 (Grenze 46 080 B)'); }
if (process.argv.includes('--changes')) {
  console.log('\n| Nr. | Genre | Name | Rolle | Modus | Merkmale | Herkunft |\n|---|---|---|---|---|---|---|');
  for (const x of A.o) { const m = x.mk, f = [];
    if (m.arp.on) f.push('Arp'); if (m.mode !== 3 && sounding(m).some(k => m.t[k].seq.on)) f.push('Seq'); if (m.mode !== 3 && sounding(m).some(k => m.t[k].o1.w === 5)) f.push('≈ Welle'); if (m.dly.sync && m.dly.dep) f.push('Delay-Sync');
    if (m.mode === 3) { f.push('E2 = Mikrofon'); if (pairs.includes(x)) f.push('Kanal-Paare'); }
    console.log('| ' + x.g + String(x.s).padStart(2, '0') + ' | ' + A.gl[x.g - 1][1] + ' | ' + x.name + ' | ' + x.prole + ' | ' + ['Single', 'Dual', 'Split', 'Vocoder'][m.mode] + ' | ' + f.join(', ') + ' | eigenes Rezept |'); }
}
console.log((fails ? 'FAIL' : 'PASS') + ' v3-mk8b-daten: ' + fails + ' Fehler');
