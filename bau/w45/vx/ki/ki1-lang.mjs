// KI1 Lang-Messung: 3-min-Stück (Demo 9× hintereinander) → Profi-Trennung, Zeit je Stück, Speicher (RSS aller Chromium-Prozesse), IDB-Zwischenstand
// (Kopf wie ki1-test.mjs) KI1 Test (Auftrag 3/3, OK/FEHLER): Start lädt nichts; ▾ am Knopf Zerlegen mit Größe; Laden mit Prüfsumme + Fortschritt (Modell-Ablage + CDN
// lokal gespiegelt, Abrufe gezählt); Profi-Trennung im Test-Chromium (WASM, ein Faden) mit den Demo-Stems; Neuladen mitten drin → fortsetzen;
// Ebenen, Summe = Original, SDR je Ebene gegen klassisches Zerlegen; Abbrechen = nichts geändert; ein ↶; Speichern/Laden; Container (ZIP);
// hochkant + quer (926×428, 926×370); ✕ sichtbar; Gesang-Messung mit echtem Solo-Gesang (Demo + Stimme); keine Konsolen-Fehler.
// Aufruf: node ki1-test.mjs <index.html> <modell-dir> <ort-dir> [<gesang.wav 44,1 kHz mono 16 Bit>]
import { createRequire } from 'node:module';
const { chromium } = createRequire('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk/')('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), MOD = path.resolve(process.argv[3]), ORTD = path.resolve(process.argv[4]), fotos = path.join(dir, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
const ty = f => f.endsWith('.wasm') ? 'application/wasm' : /m?js$/.test(f) ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream';
let VOX = null;
if (process.argv[5] && fs.existsSync(process.argv[5])) {   // Solo-Gesang (WAV 16 Bit) → Float32 mono
  const w = fs.readFileSync(process.argv[5]); let o = 12, fmt = null, dat = null;
  while (o + 8 <= w.length) { const id = w.toString('ascii', o, o + 4), n = w.readUInt32LE(o + 4); if (id === 'fmt ') fmt = {ch: w.readUInt16LE(o + 10), sr: w.readUInt32LE(o + 12), bits: w.readUInt16LE(o + 22)}; if (id === 'data') dat = w.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  if (fmt && dat && fmt.bits === 16 && fmt.sr === 44100) { const n = dat.length / 2 / fmt.ch | 0; VOX = new Float32Array(n); for (let i = 0; i < n; i++) VOX[i] = dat.readInt16LE(2 * i * fmt.ch) / 32768; }
}
const srv = http.createServer((q, r) => { if (q.url.startsWith('/__vox.f32')) { if (!VOX) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'application/octet-stream'}); r.end(Buffer.from(VOX.buffer)); return; } const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': ty(p)}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}, errs = [], net = [];
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
// Modell-Ablage + CDN lokal gespiegelt (Inhalt = Original, Prüfsummen echt)
await ctx.route(/^https:\/\/(huggingface\.co|cdn\.jsdelivr\.net)\//, async (rt) => {
  const u = rt.request().url(), f = u.split('?')[0].split('/').pop(), src = u.includes('huggingface.co') ? path.join(MOD, f) : path.join(ORTD, f);
  net.push(f);
  if (!fs.existsSync(src)) return rt.fulfill({status: 404, body: ''});
  return rt.fulfill({status: 200, headers: {'content-type': ty(f), 'access-control-allow-origin': '*'}, body: fs.readFileSync(src)});
});
async function page() {
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__ki1, null, {timeout: 60000}); await p.waitForTimeout(800);
  return p;
}

import { execSync } from 'node:child_process';
const rss = () => { try { return +execSync("ps -eo rss,comm | awk '/chrom|headless/ {s+=$1} END {print s}'").toString().trim() * 1024; } catch (e) { return 0; } };
const T0 = Date.now();
const p = await page();
const d = await p.evaluate(async () => {
  const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer());
  const R = [await ld('spur0'), await ld('spur1'), await ld('spur2'), await ld('spur4')], n1 = Math.max(...R.map(x => x.length / 2)), K = 9, n = n1 * K, L = new Float32Array(n), Rr = new Float32Array(n);
  for (const x of R) for (let i = 0; i < x.length / 2; i++) for (let k = 0; k < K; k++) { L[k * n1 + i] += x[2 * i]; Rr[k * n1 + i] += x[2 * i + 1]; }
  const t = Date.now(); const r = await __spk.load({name: 'Lang', sr: 44100, ch: [L, Rr]}); return {id: r.meta.id, sek: n / 44100, msLoad: Date.now() - t};
});
await p.evaluate(() => __ki1.ensure({}));
const base = rss(); let peak = base, idb = 0, stueck = [];
const iv = setInterval(() => { peak = Math.max(peak, rss()); }, 400);
const t = Date.now();
const r = await p.evaluate(async () => { const ts = []; let last = Date.now(), est = 0;
  const r = await __ki1.profi({prog: (w, x, st) => { if (w === 'rechnen' && /Stück [1-9]/.test(st || '')) { const now = Date.now(); ts.push(now - last); last = now; } }});
  try { est = (await navigator.storage.estimate()).usage; } catch (e) {}
  return {ms: r.ms, msModell: r.msModell, n: r.n, ts, est}; });
clearInterval(iv);
const out = {sek: +d.sek.toFixed(1), msLoad: d.msLoad, ms: r.ms, msModell: r.msModell, stuecke: r.n, msJeStueck: Math.round(r.ts.reduce((a, b) => a + b, 0) / Math.max(1, r.ts.length)), msJeSekAudio: Math.round(r.ms / d.sek), rssBasisMB: Math.round(base / 1e6), rssSpitzeMB: Math.round(peak / 1e6), rssPlusMB: Math.round((peak - base) / 1e6), speicherNutzungMB: Math.round(r.est / 1e6), wall: Date.now() - t, errs};
console.log(JSON.stringify(out));
fs.writeFileSync(path.join(dir, 'ki1-lang.json'), JSON.stringify(out, null, 1));
await b.close(); srv.close();
