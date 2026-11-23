// GPU-Kosten je Teil (Zaun: 1-px-readPixels): Vollbild, Kachel neu (mit/ohne Mipmaps), texSubImage2D (+Mipmaps), nur Mipmaps.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const f = path.resolve(process.argv[2]); const dir = fs.mkdtempSync(path.join(__dirname, 'srv-')); fs.copyFileSync(f, path.join(dir, 'A.html')); fs.writeFileSync(path.join(dir, 'version.json'), '{"version":"4.88.0"}');
const port = 8950 + Math.floor(Math.random() * 50); const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  for (let i = 0; i < 50; i++) { try { const r = await fetch('http://127.0.0.1:' + port + '/version.json'); if (r.ok) break; } catch (e) {} await sleep(200); }
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:' + port + '/A.html'); await p.waitForFunction(() => window.__spk && window.__fokus1, null, { timeout: 90000 });
  await p.evaluate(async () => { await __spk.page.open({}); const sr = 44100, n = 60 * sr, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.15 * Math.sin(2 * Math.PI * 440 * t) * (1 + Math.sin(t)) + 0.1 * Math.sin(2 * Math.PI * 97 * t * (1 + 0.1 * Math.sin(t))); }
    const r = await __spk.load({ name: 'P', sr, ch: [x] }); await __spk.page.open({ id: r.meta.id }); });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !__spk.page.ui().specQ; }, null, { timeout: 300000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const U = __spk.page.ui(), G = U.gl, gl = G.gl, c = U.spec.chunks.find(Boolean), px = new Uint8Array(4); const fin = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const T = {}, rep = (k, fn) => { const a = []; for (let i = 0; i < 6; i++) { fin(); const t = performance.now(); fn(); fin(); a.push(performance.now() - t); } a.sort((x, y) => x - y); T[k] = +a[3].toFixed(1); };
    const keep = [];
    rep('draw', () => spk1GlDraw(U));
    rep('newMip', () => keep.push(G.tex(c.w, c.R, 'r', c.data, true)));
    rep('newNoMip', () => keep.push(G.tex(c.w, c.R, 'r', c.data, false)));
    const t0 = G.tex(c.w, c.R, 'r', c.data, true);
    rep('subFullMip', () => { gl.bindTexture(gl.TEXTURE_2D, t0); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, c.w, c.R, gl.RED, gl.UNSIGNED_BYTE, c.data); gl.generateMipmap(gl.TEXTURE_2D); });
    rep('subFull', () => { gl.bindTexture(gl.TEXTURE_2D, t0); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, c.w, c.R, gl.RED, gl.UNSIGNED_BYTE, c.data); });
    rep('mipOnly', () => { gl.bindTexture(gl.TEXTURE_2D, t0); gl.generateMipmap(gl.TEXTURE_2D); });
    rep('readAll', () => { const q = new Uint8Array(U.cw * U.ch * 4); gl.readPixels(0, 0, U.cw, U.ch, gl.RGBA, gl.UNSIGNED_BYTE, q); });
    for (const t of keep) gl.deleteTexture(t); gl.deleteTexture(t0);
    return { T, w: c.w, R: c.R, cw: U.cw, ch: U.ch, n: U.spec.chunks.length }; });
  console.log(JSON.stringify(r));
  await b.close(); srv.kill(); fs.rmSync(dir, { recursive: true, force: true });
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
