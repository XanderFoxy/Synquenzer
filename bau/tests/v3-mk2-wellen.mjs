// MK2 build script of the stored-wave data block + check MK2-12 (Nachtrag 3 MK2 Daten, B.6 Nr. 9).
// Reads the trace at the build place (scratchpad/dwgs-trace, private), writes MK_WD between the MKD markers of index.html and
// checks: same source = same block, size, brand words, no wave names, decoded levels / phases / r, the form of every table.
// Usage: node v3-mk2-wellen.mjs [index.html] [--write]   (contains no wave names itself)
import fs from 'fs';
import path from 'path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const FILE = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(HERE, '../mk-wt/index.html'));
const WRITE = process.argv.includes('--write');
const SRC = path.join(HERE, '../dwgs-trace');
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
if (!fs.existsSync(path.join(SRC, 'dwgs-64-compact.json'))) { console.log('OFFEN MK2-12 — Bezug am Bau-Ort fehlt'); process.exit(2); }
const C = JSON.parse(fs.readFileSync(path.join(SRC, 'dwgs-64-compact.json'), 'utf8')).waves;
const FULL = JSON.parse(fs.readFileSync(path.join(SRC, 'dwgs-64.json'), 'utf8'));
const PR = fs.readFileSync(path.join(SRC, 'PRUEFUNG.md'), 'utf8');
const BRAND = /korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b/ig;
const RC = new Map([[1, 0], [2, 1], [1.49831, 2]]), STEP = .025;
function encode(salt) {
  const out = [salt];
  for (const w of C) {
    const K = w.a.length, rc = RC.get(w.r); if (rc == null || ![32, 64, 96, 128].includes(K)) throw new Error('Welle ' + w.n + ': r/K');
    out.push((rc | ((K / 32 - 1) << 2)) ^ salt);
    const am = Math.max(...w.a);
    for (let k = 0; k < K; k++) {
      const L = 20 * Math.log10(Math.max(w.a[k] / am, 1e-12)), cl = L < -4094 * STEP ? 0 : 4095 - Math.round(-L / STEP);
      let ph = w.p[k] % (2 * Math.PI); if (ph < 0) ph += 2 * Math.PI; const cp = Math.round(ph / (2 * Math.PI) * 4096) % 4096;
      const v = (cl << 12) | cp; out.push(((v >> 16) & 255) ^ salt, ((v >> 8) & 255) ^ salt, (v & 255) ^ salt);
    }
  }
  return Buffer.from(out);
}
let salt = 0, b64 = '';
for (; salt < 256; salt++) { b64 = encode(salt).toString('base64'); if (!(b64.match(BRAND) || []).length) break; }
const raw = encode(salt);
ok('MK2-12 Block: gleiche Quelle → bitgleicher Block', encode(salt).equals(raw) && encode(salt).toString('base64') === b64, 'Salz ' + salt + ', ' + raw.length + ' Byte, Base64 ' + b64.length + ' Zeichen (' + (b64.length / 1024).toFixed(2) + ' KB)');
ok('MK2-12 Block: 0 Markenwörter', !(b64.match(BRAND) || []).length);
ok('MK2-12 Block: Größe (Prot. 58: alle Teiltöne der Kompaktdatei, ≈ +3 KB gegenüber 9 KB)', b64.length / 1024 <= 12.5, (b64.length / 1024).toFixed(2) + ' KB');
// write into index.html
let html = fs.readFileSync(FILE, 'utf8');
const a = html.indexOf('/*MKD{*/'), z = html.indexOf('/*}MKD*/');
if (a < 0 || z < a) { console.log('FAIL Marken /*MKD{*/ fehlen in ' + FILE); process.exit(1); }
const block = "const MK_WD = '" + b64 + "';";
if (WRITE && html.slice(a + 8, z) !== block) { html = html.slice(0, a + 8) + block + html.slice(z); fs.writeFileSync(FILE, html); html = fs.readFileSync(FILE, "utf8"); console.log('geschrieben: ' + FILE); }
ok('MK2-12 Block in index.html = Bau-Ergebnis', html.slice(a + 8, z) === block);
// no wave names anywhere in the app
const names = C.map(w => w.name), hit = names.filter(nm => html.includes(nm));
ok('MK2-12 keine Wellennamen in index.html', !hit.length, hit.length ? hit.length + ' Treffer' : '64 Namen geprüft, 0 Treffer');
ok('FP-SICHER ganze Datei: micro?korg|radias|dwgs = 0, „MS 2000“-Schreibungen genau 1', !(html.match(/micro ?korg|radias|dwgs/ig) || []).length && (html.match(/ms[ -]?2000/ig) || []).length === 1);
// decode with the app's own builder
const t0 = html.indexOf('/*MKT{*/'), t1 = html.indexOf('/*}MKT*/');
const MKTAB = new Function(html.slice(t0, t1) + '\n;return MKTAB;')();
let dl = 0, dp = 0, rOk = true;
for (const w of C) {
  const d = MKTAB.data()[w.n], am = Math.max(...w.a); if (d.r !== w.r) rOk = false;
  for (let k = 1; k <= w.a.length; k++) {
    const L0 = 20 * Math.log10(w.a[k - 1] / am); if (L0 < -100) continue;
    dl = Math.max(dl, Math.abs(20 * Math.log10(d.a[k]) - L0));
    let e = d.p[k] - w.p[k - 1]; e = Math.atan2(Math.sin(e), Math.cos(e)); dp = Math.max(dp, Math.abs(e));
  }
}
ok('MK2-12 dekodiert: Pegel ± 0,02 dB, Phase ± 0,001 rad, r ∈ {1, 2, 1,49831}', dl <= .02 && dp <= .001 && rOk, 'max ' + dl.toFixed(4) + ' dB, ' + dp.toFixed(5) + ' rad');
// form: one period of mip level 0 (35 and 61-64: the table for exactly 220.27 Hz), FFT-limited to k <= 32 r, against the full
// trace (k <= 64 r, peak 1), same phase, least-squares gain; rms in % of the peak <= rms32 (PRUEFUNG.md) + 0.1 pp
const rms32 = {}; for (const line of PR.split('\n')) { const m = line.match(/^\| (\d+) \| [^|]+\| [^|]+\| [^|]+\| ([\d.]+) \| ([^|]+)\|/); if (m) rms32[+m[1]] = [+m[2], m[3].trim()]; }
const N = 4096, worst = [];
let formFail = 0; const rows = [];
for (const w of C) {
  const n = w.n, T = MKTAB.mkTables(MKTAB.isOct(n) ? {n, f: 220.27} : {n})[0], M = T.length - 1;
  const K32 = Math.round(32 * w.r);
  // DFT of the table (2048 points) up to K32, resynthesise on N points
  const re = new Float64Array(K32 + 1), im = new Float64Array(K32 + 1);
  for (let k = 1; k <= K32; k++) { let a = 0, b = 0; for (let i = 0; i < M; i++) { const ph = 2 * Math.PI * k * i / M; a += T[i] * Math.cos(ph); b += T[i] * Math.sin(ph); } re[k] = 2 * a / M; im[k] = 2 * b / M; }
  const x = new Float64Array(N), ref = new Float64Array(N);
  for (let i = 0; i < N; i++) { const th = 2 * Math.PI * i / N; let s = 0; for (let k = 1; k <= K32; k++) s += re[k] * Math.cos(k * th) + im[k] * Math.sin(k * th); x[i] = s; }
  const H = FULL[n - 1].harm; let pk = 0;
  for (let i = 0; i < N; i++) { const th = 2 * Math.PI * i / N; let s = 0; for (const h of H) s += h.amp * Math.sin(h.k * th + h.phase); ref[i] = s; pk = Math.max(pk, Math.abs(s)); }
  for (let i = 0; i < N; i++) ref[i] /= pk;
  let xy = 0, xx = 0; for (let i = 0; i < N; i++) { xy += x[i] * ref[i]; xx += x[i] * x[i]; } const g = xy / xx;
  let e = 0; for (let i = 0; i < N; i++) e += (g * x[i] - ref[i]) ** 2; const rr = Math.sqrt(e / N) * 100;
  const lim = n === 35 ? 5.7 : rms32[n][0] + .1, pass = rr <= lim; if (!pass) formFail++;
  rows.push(n + ':' + rr.toFixed(2) + '/' + lim.toFixed(2)); worst.push([rr - lim, n]);
}
worst.sort((p, q) => q[0] - p[0]);
ok('MK2-12 Form je Welle ≤ rms32 + 0,1 Prozentpunkte (35: ≤ 5,7 %)', !formFail, formFail + ' über der Grenze; knappste ' + worst.slice(0, 3).map(([d, n]) => n + ' (' + (d >= 0 ? '+' : '') + d.toFixed(3) + ')').join(', '));
console.log('  ' + rows.join(' '));
console.log(fails ? fails + ' FAIL' : 'alles PASS');
process.exit(fails ? 1 : 0);
