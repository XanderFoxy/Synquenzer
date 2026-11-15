// LT1 – Long Tasks im Hauptfaden: a) Ansicht-Sprünge Spektral, b) FFT-Wechsel 4096 ↔ 8192, c) Import-Ablegen.
// A/B im selben Lauf (abwechselnd), PerformanceObserver 'longtask' + 'long-animation-frame' (Skript-Zuordnung), Canvas-Vergleich nach dem Beruhigen.
// Aufruf: node lt1-test.mjs <index.html> <basis.html>   (ENV: VIEWS=926x428,428x926  REPS=3  ONLY=a,b,c  DIAG=1 → Funktions-Zeiten)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import crypto from 'node:crypto';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3] || process.argv[2]);
const here = path.dirname(new URL(import.meta.url).pathname);
const files = {'/a.html': A, '/b.html': B};
const srv = http.createServer((q, r) => { const p = files[q.url.split('?')[0]]; if (!p) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const VIEWS = (process.env.VIEWS || '926x428,428x926').split(',').map(s => s.split('x').map(Number));
const REPS = +(process.env.REPS || 3), ONLY = new Set((process.env.ONLY || 'a,b,c').split(',')), DIAG = !!process.env.DIAG;
// Hinweis: c misst nur imp1Place (Ablegen); der erste Tipp/Ton-Start liegt davor (file() lädt).
const NX1 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/nach/nx1-test.mjs';
const T = fs.readFileSync(NX1, 'utf8'), i0 = T.indexOf('const SONG = (o) => {'), SONG = T.slice(i0 + 'const SONG = '.length, T.indexOf('\n  };', i0) + 4);
const b = await chromium.launch({args: ['--disable-renderer-backgrounding', '--enable-blink-features=LongAnimationFrameTiming']});
const out = []; // {file, view, rep, sc, lt:[ms], loaf:[{d, scripts}], hash}
const load = () => os.loadavg()[0].toFixed(2);
const OBS = () => { window.__lt = []; window.__loaf = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({type: 'longtask', buffered: true}); } catch (e) {}
  try { new PerformanceObserver(l => { window.__loafN = (window.__loafN || 0) + l.getEntries().length; for (const e of l.getEntries()) if (e.duration > 50) window.__loaf.push({t: e.startTime, d: Math.round(e.duration), block: Math.round(e.blockingDuration || 0), st: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), scripts: (e.scripts || []).map(s => ({inv: s.invoker, fn: s.sourceFunctionName, pos: s.sourceCharPosition, d: Math.round(s.duration), lay: Math.round(s.forcedStyleAndLayoutDuration || 0)}))}); }).observe({type: 'long-animation-frame', buffered: true}); } catch (e) {} };
const since = (p, t0) => p.evaluate(t0 => ({lt: window.__lt.filter(e => e.t >= t0 && e.d > 50).map(e => Math.round(e.d)), loaf: window.__loaf.filter(e => e.t >= t0), loafN: window.__loafN || 0, loafAll: window.__loaf.length, diag: window.__dg ? Object.fromEntries(Object.entries(window.__dg).map(([k, v]) => [k, [v.n, Math.round(v.max), Math.round(v.sum)]])) : null}), t0);
const now = p => p.evaluate(() => { if (window.__dg) window.__dg = {}; return performance.now(); });
const DIAGFN = names => { window.__dg = {}; for (const n of names) { const f = window[n]; if (typeof f !== 'function') continue; window[n] = function (...a) { const t = performance.now(); try { return f.apply(this, a); } finally { const d = performance.now() - t, g = window.__dg[n] || (window.__dg[n] = {n: 0, max: 0, sum: 0}); g.n++; g.sum += d; if (d > g.max) g.max = d; } }; } };
async function canvasHash(p) { await p.waitForTimeout(1200); return p.evaluate(async () => { const U = __spk.page.ui(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); spk1Dirty(U, 'all'); await new Promise(r => requestAnimationFrame(() => r())); const du = U.gcv.toDataURL('image/png'); return du; }).then(s => crypto.createHash('md5').update(s).digest('hex').slice(0, 12)); }
async function openSpk(p, W, H) {
  await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 90000}); await p.waitForTimeout(500);
  await p.evaluate(async () => { await __spk.page.open({}); const sr = 44100, n = 90 * sr, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.15 * Math.sin(2 * Math.PI * 440 * t) * (1 + Math.sin(t)) + 0.1 * Math.sin(2 * Math.PI * (220 + 30 * Math.sin(t * 0.7)) * t) + 0.02 * Math.sin(2 * Math.PI * 3000 * t * (1 + 0.1 * Math.sin(t * 3))); } const r = await __spk.load({name: 'LT1', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat) && !__spk.page.ui().specQ; }, null, {timeout: 300000}); await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelector('#spk1Sheet .spk1-st').click()); await p.waitForTimeout(1500);   // erster Tipp startet den Ton (ensureAudio ~55 ms) – vor der Messung, gehört nicht zu a/b
}
const view = (p, t0, t1, mTop, mBot) => p.evaluate(([t0, t1, a, z]) => { const U = __spk.page.ui(), v = U.v; v.pps = U.W / (t1 - t0); v.t0 = t0; v.rowH = U.H / (a - z); v.mTop = a; spk1Clamp(U); spk1Dirty(U, 'all'); }, [t0, t1, mTop, mBot]);
async function scA(p) {   // Ansicht-Sprünge: Ganz → Zoom Anfang → Sprung ans Ende → Ganz → Zoom Mitte (wie die Tests: Ansicht per Skript setzen)
  const t0 = await now(p); const J = [[0, 4, 100, 40], [80, 86, 110, 50], [-0.05, 90, 110, 26], [40, 43, 96, 60], [10, 70, 120, 30]];
  for (const j of J) { await view(p, ...j); await p.waitForTimeout(700); }
  const r = await since(p, t0); r.hash = await canvasHash(p); r.lt1 = await p.evaluate(() => typeof LT1 !== 'undefined' ? {n: LT1.n, gUp: LT1.gUp} : null); return r;
}
async function scA2(p) {   // a2: wie a, aber im Zoom (0–4 s) FFT 4096 → 8192 gewechselt → die übrigen Kacheln sind noch nicht auf der Grafik; dann Sprünge
  await view(p, 0, 4, 100, 40); await p.waitForTimeout(600);
  await p.evaluate(() => { const U = __spk.page.ui(); U.N = 8192; spk1SpecLoad(U); }); await p.waitForFunction(() => !__spk.page.ui().specQ, null, {timeout: 120000}); await p.waitForTimeout(1500);
  const t0 = await now(p); const J = [[80, 86, 110, 50], [-0.05, 90, 110, 26], [40, 43, 96, 60], [10, 70, 120, 30]];
  for (const j of J) { await view(p, ...j); await p.waitForTimeout(700); }
  const r = await since(p, t0); r.hash = await canvasHash(p); r.lt1 = await p.evaluate(() => typeof LT1 !== 'undefined' ? {n: LT1.n, gUp: LT1.gUp} : null); return r;
}
async function scB(p) {   // FFT 4096 → 8192 → 4096 per Tipp im Ansicht-Klappfenster
  const t0 = await now(p), res = {};
  for (const n of [8192, 4096]) {
    await p.evaluate(() => { const b = document.querySelector('#spk1Sheet [data-a="view"]'); b.click(); }); await p.waitForTimeout(200);
    await p.evaluate(n => { const b = [...document.querySelectorAll('#spk1Sheet .spk1-dd .spk1-n button')].find(x => x.textContent.trim() === String(n)); b.click(); }, n);
    await p.waitForFunction(() => !__spk.page.ui().specQ, null, {timeout: 120000}); await p.waitForTimeout(800);
    await p.evaluate(() => spk1Dd(__spk.page.ui(), null)); await p.waitForTimeout(300);
  }
  const r = await since(p, t0); r.hash = await canvasHash(p); r.lt1 = await p.evaluate(() => typeof LT1 !== 'undefined' ? {n: LT1.n, gUp: LT1.gUp} : null); return r;
}
async function scC(p) {   // Import: Lied 96 BPM erkennen, dann Ablegen (imp1Place 'scenes') – nur das Ablegen wird gemessen
  await p.waitForFunction(() => window.SYNQUENZER && window.__imp1 && window.__imp1.ui, null, {timeout: 90000}); await p.waitForTimeout(800);
  await p.evaluate(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const SONG = ${SONG}; const {buf} = SONG({sr: 48000, bpm: 96, bars: 8, t0: 0}); IMP1.known = 96;
    await window.__imp1.ui.file(buf, 'lied.wav'); for (let i = 0; i < 600 && !(IMP1.cur && IMP1.cur.st === 'fertig'); i++) await wait(50); })()`);
  await p.waitForTimeout(1500);
  const t0 = await now(p);
  const r0 = await p.evaluate(() => { const t = performance.now(); const r = window.__imp1.ui.place('scenes'); return {ms: Math.round(performance.now() - t), ok: !!r}; });
  await p.waitForTimeout(2500);
  const r = await since(p, t0); r.place = r0; r.place.skip = await p.evaluate(() => typeof LT1 !== 'undefined' ? LT1.skip || 0 : '-');
  r.hash = await p.evaluate(() => { const L = IMP1.lastPlace || {}; const s = JSON.stringify({bpm: S.bpm, ts: S.ts, nTracks: (S.tracks || []).length, scenes: (S.scenes || []).length, takes: Object.keys(S.takes || {}).length, kinds: (S.tracks || []).map(t => t.kind || t.type || '').join(','), lp: Object.keys(L).sort().join(',')}); const g = EL.grid, sig = g.textContent + '|' + [...g.querySelectorAll('*')].map(e => e.tagName + '.' + e.className).join(','); let h = 0; for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) | 0; return s + ' grid=' + (h >>> 0).toString(16) + '/' + g.querySelectorAll('*').length + ' heads=' + UI.heads.length; });
  return r;
}
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H;
  for (const sc of ['a', 'a2', 'b', 'c']) {
    if (!ONLY.has(sc)) continue;
    for (let rep = 0; rep < REPS; rep++) {
      const order = rep % 2 ? ['b', 'a'] : ['a', 'b'];
      for (const f of order) {
        const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
        p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
        await p.goto(base + '/' + f + '.html');
        await p.evaluate(OBS);
        if (DIAG) await p.waitForFunction(() => window.__spk, null, {timeout: 90000}).then(() => p.evaluate(DIAGFN, ['spk1Frame', 'spk1GlDraw', 'spk1CpuDraw', 'spk1KeysDraw', 'spk1RulerDraw', 'spk1OvDraw', 'spk1SpecLoad', 'spk1SpecFree', 'fokus1Pre', 'fokus1Post', 'buildGrid', 'gl1MxFlat', 'imp1Place', 'render', 'renderAll', 'spk1Tap', 'spk1ViewDd', 'spk1Dd', 'saveLocal', 'imp1Paint']));
        let r;
        try {
          if (sc !== 'c') await openSpk(p, W, H);
          r = sc === 'a' ? await scA(p) : sc === 'a2' ? await scA2(p) : sc === 'b' ? await scB(p) : await scC(p);
        } catch (e) { r = {err: String(e).slice(0, 300), lt: [], loaf: []}; }
        r.errs = errs.slice(0, 3); r.load = load();
        const row = {file: f === 'a' ? 'index' : 'basis', view: tag, rep, sc, ...r}; out.push(row);
        console.log(`${tag} ${sc} rep${rep} ${row.file.padEnd(5)} max=${Math.max(0, ...r.lt)} lt=${JSON.stringify(r.lt)} hash=${r.hash && String(r.hash).slice(0, 80)} last=${r.load}` + (r.place ? ' place=' + JSON.stringify(r.place) : '') + (r.lt1 ? ' lt1=' + JSON.stringify(r.lt1) : '') + ' loafN=' + r.loafN + '/' + r.loafAll + (r.err ? ' ERR ' + r.err : '') + (errs.length ? ' KONSOLE ' + JSON.stringify(errs) : ''));
        for (const l of r.loaf || []) console.log('   LoAF ' + l.d + ' ms (block ' + l.block + ', Stil/Layout am Ende ' + l.st + '): ' + l.scripts.map(s => `${s.inv}${s.fn ? ' [' + s.fn + ']' : ''}@${s.pos} ${s.d} ms` + (s.lay ? ` (Layout erzwungen ${s.lay})` : '')).join(' | '));
        if (r.diag) console.log('   DIAG ' + JSON.stringify(r.diag));
        await ctx.close();
      }
    }
  }
}
await b.close(); srv.close();
// Auswertung: Median/Max je Szenario × Größe × Datei, Bildgleichheit
const med = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
console.log('\nERGEBNIS (je Lauf: längste Long Task; 0 = keine > 50 ms)');
const summary = {};
for (const sc of ['a', 'a2', 'b', 'c']) for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, row = {};
  for (const f of ['basis', 'index']) { const R = out.filter(o => o.sc === sc && o.view === tag && o.file === f); if (!R.length) continue; const m = R.map(o => Math.max(0, ...o.lt)); row[f] = {runs: m, median: med(m), max: Math.max(...m), nOver50: R.reduce((s, o) => s + o.lt.length, 0), hashes: [...new Set(R.map(o => o.hash))]}; }
  if (!row.index) continue;
  const same = row.basis ? row.basis.hashes.length === 1 && row.index.hashes.length === 1 && row.basis.hashes[0] === row.index.hashes[0] : null;
  summary[sc + ' ' + tag] = {...row, bildGleich: same};
  console.log(`${sc} ${tag}  basis: median ${row.basis?.median} max ${row.basis?.max} (${JSON.stringify(row.basis?.runs)}, ${row.basis?.nOver50}× >50)  |  index: median ${row.index.median} max ${row.index.max} (${JSON.stringify(row.index.runs)}, ${row.index.nOver50}× >50)  |  Ergebnis gleich: ${same}`);
}
fs.writeFileSync(path.join(here, process.env.OUT || 'lt1-test.json'), JSON.stringify({summary, out}, null, 1));
