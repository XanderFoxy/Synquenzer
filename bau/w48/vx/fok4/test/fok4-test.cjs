// FOK4 Kern-Test: synthetisches 60-s-Lied in der Spektral-Ansicht (428x926, Touch). A/B im selben Lauf.
// Fälle: Z = Zerlegen fertig (Tönung kommt), F = Fokus "Nur Rest" bis genau fertig, A = zurück auf "Alles".
// Je Fall: Long Tasks > 50 ms (PerformanceObserver) ab Ergebnis bis Ruhe, GL-Hochlade-Zeit (texImage2D/texSubImage2D/generateMipmap),
// Endbild per readPixels (FNV-Hash) – muss A = B sein.
// Aufruf: node fok4-test.cjs <neu.html> [basis.html] [RUNS]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const files = process.argv.slice(2, 4).filter(f => /\.html$/.test(f)).map(f => path.resolve(f)); const RUNS = +(process.argv.find(a => /^\d+$/.test(a)) || 2);
const names = ['A', 'B'].slice(0, files.length);
const dir = fs.mkdtempSync(path.join(__dirname, 'srv-')); files.forEach((f, i) => fs.copyFileSync(f, path.join(dir, names[i] + '.html')));
fs.writeFileSync(path.join(dir, 'version.json'), '{"version":"4.88.0"}');
const port = 8950 + Math.floor(Math.random() * 50);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  for (let i = 0; i < 50; i++) { try { const r = await fetch('http://127.0.0.1:' + port + '/version.json'); if (r.ok) break; } catch (e) {} await sleep(200); }
  const b = await chromium.launch();
  async function lauf(which) {
    const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto('http://127.0.0.1:' + port + '/' + which + '.html'); await p.waitForFunction(() => window.__spk && window.__fokus1 && typeof spk1Call === 'function', null, { timeout: 90000 }); await p.waitForTimeout(500);
    await p.evaluate(async () => {
      window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({ t: e.startTime, d: e.duration }); }).observe({ type: 'longtask', buffered: true });
      await __spk.page.open({});
      const sr = 44100, n = 60 * sr, x = new Float32Array(n); let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
      const bpm = 120, beat = 60 / bpm, hz = m => 440 * Math.pow(2, (m - 69) / 12), mel = [69, 72, 76, 74, 72, 71, 69, 67], bas = [45, 45, 48, 43];
      for (let k = 0; k * beat < 60; k++) { const a = Math.round(k * beat * sr);
        for (let i = 0; i < 0.3 * sr && a + i < n; i++) { const u = i / sr; x[a + i] += 0.5 * Math.exp(-u / 0.12) * Math.sin(2 * Math.PI * (50 + 90 * Math.exp(-u / 0.03)) * u); }
        if (k % 2) for (let i = 0; i < 0.15 * sr && a + i < n; i++) x[a + i] += 0.2 * Math.exp(-i / sr / 0.05) * rnd();
        const fb = hz(bas[(k >> 2) % 4]); for (let i = 0; i < beat * sr && a + i < n; i++) { const u = i / sr; x[a + i] += 0.18 * Math.exp(-u / 0.4) * (Math.sin(2 * Math.PI * fb * u) + 0.4 * Math.sin(4 * Math.PI * fb * u)); }
        const fm = hz(mel[k % 8]); for (let i = 0; i < beat * sr && a + i < n; i++) { const u = i / sr, e = Math.min(1, u / 0.02) * Math.exp(-u / 0.6); x[a + i] += 0.12 * e * (Math.sin(2 * Math.PI * fm * u) + 0.5 * Math.sin(4 * Math.PI * fm * u) + 0.25 * Math.sin(6 * Math.PI * fm * u)); }
      }
      const r = await __spk.load({ name: 'FOK4-Lied', sr, ch: [x] }); await __spk.page.open({ id: r.meta.id });
      // GL-Zeiten messen
      window.__gt = { img: 0, sub: 0, mip: 0, nImg: 0, nSub: 0, nMip: 0, px: 0 };
    });
    await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !__spk.page.ui().specQ; }, null, { timeout: 300000 }); await p.waitForTimeout(1500);
    await p.evaluate(() => { const gl = __spk.page.ui().gl.gl, G = window.__gt; G.inF = 0; G.fr = 0; window.__inF = false; const sf = spk1Frame; spk1Frame = function (U) { window.__inF = true; G.fr++; try { return sf(U); } finally { window.__inF = false; } };
      for (const [k, nk, f] of [['img', 'nImg', 'texImage2D'], ['sub', 'nSub', 'texSubImage2D'], ['mip', 'nMip', 'generateMipmap']]) { const o = gl[f].bind(gl); gl[f] = function () { const t = performance.now(); const r = o.apply(null, arguments); G[k] += performance.now() - t; G[nk]++; if (window.__inF) G.inF++; return r; }; } });
    const ruhe = async () => { await p.waitForFunction(() => { const U = __spk.page.ui(), f = __fokus1.info(); return !U.busy && __fokus1.idle() && (f.mode === 'alles' || f.tex >= f.n); }, null, { timeout: 120000 }); await p.waitForTimeout(1500); };
    const img = () => p.evaluate(() => { const u = __spk.page.ui(); const lo = typeof LT2S === 'object' ? LT2S.on : null; if (lo !== null) LT2S.on = false; u.dg = true; spk1Frame(u); if (lo !== null) LT2S.on = lo; const gl = u.gl.gl, px = new Uint8Array(u.cw * u.ch * 4); gl.readPixels(0, 0, u.cw, u.ch, gl.RGBA, gl.UNSIGNED_BYTE, px); let h = 0x811c9dc5; for (let i = 0; i < px.length; i++) { h ^= px[i]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); });
    const mark = () => p.evaluate(() => { window.__t0 = performance.now(); const G = window.__gt; for (const k in G) G[k] = 0; });
    const lt = () => p.evaluate(() => { const L = window.__lt.filter(e => e.t >= window.__t0 - 1 && e.d > 50); const G = window.__gt; return { n: L.length, max: Math.round(Math.max(0, ...L.map(e => e.d))), sum: Math.round(L.reduce((a, e) => a + e.d, 0)), gl: { inF: G.inF, fr: G.fr, img: +G.img.toFixed(1), nImg: G.nImg, sub: +G.sub.toFixed(1), nSub: G.nSub, mip: +G.mip.toFixed(1), nMip: G.nMip } }; });
    const out = { errs };
    // Fall Z: Zerlegen (Rechnung im Worker vor der Messung), danach Hauptfaden wie spk1Zerl
    const r = await p.evaluate(async () => { const U = __spk.page.ui(); const r = await spk1Call('zerlegen', { doc: SPK1.doc }); window.__zr = r; return r.meta.layers.length; });
    await mark(); await p.evaluate(() => { const U = __spk.page.ui(); spk1Got(U, window.__zr); U.tintOn = true; spk1TintLoad(U); });
    await p.waitForFunction(() => { const U = __spk.page.ui(); return U.tint && U.tint.ids.length === U.meta.layers.length; }, null, { timeout: 60000 }); await ruhe();
    out.Z = Object.assign(await lt(), { layers: r, hash: await img() });
    // Fall F: Fokus Nur Rest bis genau fertig
    await mark(); await p.evaluate(() => __fokus1.mode('rest')); await ruhe();
    out.F = Object.assign(await lt(), { hash: await img(), info: await p.evaluate(() => { const f = __fokus1.info(); return { n: f.n, tex: f.tex, ap: f.ap }; }) });
    // Fall A: zurück auf Alles
    await mark(); await p.evaluate(() => __fokus1.mode('alles')); await ruhe();
    out.A = Object.assign(await lt(), { hash: await img() });
    // Fall G: Nur Gefundenes
    await mark(); await p.evaluate(() => __fokus1.mode('gef')); await ruhe();
    out.G = Object.assign(await lt(), { hash: await img() });
    // Fall S: schnelles Hin und Her waehrend des Hochladens (Rest -> Gefundenes -> Rest, dabei Ansicht verschieben) -> Endbild wie Basis
    await mark(); await p.evaluate(async () => { const U = __spk.page.ui(), w = ms => new Promise(r => setTimeout(r, ms)); __fokus1.mode('rest'); await w(120); __fokus1.mode('gef'); await w(60); U.v.t0 += 3; spk1Clamp(U); spk1Dirty(U, 'all'); await w(40); __fokus1.mode('rest'); await w(30); U.v.t0 -= 3; spk1Clamp(U); spk1Dirty(U, 'all'); }); await ruhe();
    out.S = Object.assign(await lt(), { hash: await img() });
    out.fok4 = await p.evaluate(() => typeof FOK4 === 'object' ? { nNew: FOK4.nNew, nSub: FOK4.nSub, nSame: FOK4.nSame, nCol: FOK4.nCol, nWait: FOK4.nWait, nDrop: FOK4.nDrop, err: FOK4.err, on: FOK4.on } : null);
    await ctx.close(); return out;
  }
  const res = {}; for (const w of names) res[w] = [];
  for (let i = 0; i < RUNS; i++) for (const w of (i % 2 ? names.slice().reverse() : names)) { const load = fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0]; const o = await lauf(w); o.last = +load; res[w].push(o); console.log(w, i, JSON.stringify(o)); }
  if (names.length === 2) { let ok = true; for (const f of ['Z', 'F', 'A', 'G', 'S']) for (let i = 0; i < RUNS; i++) { const g = res.A[i][f].hash === res.B[i][f].hash; if (!g) ok = false; console.log('Bild', f, i, g ? 'gleich' : 'VERSCHIEDEN', res.A[i][f].hash, res.B[i][f].hash); }
    for (const f of ['Z', 'F', 'A', 'G', 'S']) console.log('HochladenImBild', f, 'A', res.A.map(o => o[f].gl.inF).join(' '), '| B', res.B.map(o => o[f].gl.inF).join(' '));
    for (const f of ['Z', 'F', 'A', 'G', 'S']) console.log('LongTasks', f, 'A', res.A.map(o => o[f].n + '/' + o[f].max).join(' '), '| B', res.B.map(o => o[f].n + '/' + o[f].max).join(' '));
    console.log('FOK4', JSON.stringify(res.A.map(o => o.fok4)));
    console.log('Fehler', JSON.stringify(res.A.map(o => o.errs)), JSON.stringify(res.B.map(o => o.errs))); console.log(ok ? 'BILD OK' : 'BILD FEHLER'); }
  fs.writeFileSync(path.join(__dirname, 'fok4-test.json'), JSON.stringify(res, null, 1));
  await b.close(); srv.kill(); fs.rmSync(dir, { recursive: true, force: true });
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
