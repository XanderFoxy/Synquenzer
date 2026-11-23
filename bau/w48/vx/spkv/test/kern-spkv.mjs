// SPKV Kern-Test: synthetischer Song (Kick/Snare/Bass bekannt) -> Spektral laden -> Zerlegen -> Verfeinern Bass -> Verfeinern Drums.
// Misst je Ereignis, wie viel der bekannten Spur in der Ziel-Ebene landet (Projektion, Tiefpass 160 Hz bzw. Bandpass am Grundton).
// Aufruf: node kern-spkv.mjs <neu.html> [basis.html]   (A = neu, B = basis; ohne basis nur A)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const dir = fs.mkdtempSync(path.join(here, 'srv-'));
const files = process.argv.slice(2).map(f => path.resolve(f)); const names = ['A', 'B'].slice(0, files.length);
files.forEach((f, i) => fs.copyFileSync(f, path.join(dir, names[i] + '.html')));
fs.writeFileSync(path.join(dir, 'version.json'), '{"version":"4.87.0"}');
const port = 8900 + Math.floor(Math.random() * 50);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {cwd: dir, stdio: 'ignore'});
for (let i = 0; i < 50; i++) { try { const r = await fetch('http://127.0.0.1:' + port + '/version.json'); if (r.ok) break; } catch (e) {} await new Promise(r => setTimeout(r, 200)); }
const b = await chromium.launch();
async function lauf(which) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://127.0.0.1:' + port + '/' + which + '.html'); await p.waitForFunction(() => window.__spk && typeof spk1Call === 'function', null, {timeout: 90000}); await p.waitForTimeout(500);
  const r = await p.evaluate(async () => {
    const sr = 44100, bpm = 112, beat = 60 / bpm, st = beat / 4, t0 = 0.25, BARS = 6, n = Math.round((t0 + BARS * 4 * beat + 0.6) * sr);
    const kick = new Float32Array(n), snare = new Float32Array(n), bass = new Float32Array(n);
    let seed = 12345; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const pat = [
      {k: [0, 8], s: [4, 12], b: [[0, 3, 33], [3, 2, 33], [6, 2, 36], [11, 3, 31], [14, 2, 38]]},
      {k: [0, 8, 10], s: [4, 12], b: [[0, 2, 28], [2, 2, 28], [5, 3, 33], [11, 3, 36], [14, 2, 31]]},
      {k: [0, 6, 8], s: [4, 12], b: [[0, 3, 31], [3, 2, 33], [9, 2, 36], [12, 2, 35], [14, 2, 33]]}];
    const K = [], B = [], SN = [];
    for (let bar = 0; bar < BARS; bar++) {
      const P = pat[bar % 3], tb = t0 + bar * 4 * beat;
      for (const s of P.k) K.push(tb + s * st); for (const s of P.s) SN.push(tb + s * st);
      for (const [s, l, m] of P.b) B.push({t: tb + s * st, d: l * st - 0.02, m, f: hz(m)});
    }
    for (const t of K) { const a = Math.round(t * sr); let ph = 0; for (let i = 0; i < 0.45 * sr && a + i < n; i++) { const u = i / sr, f = 49 + 120 * Math.exp(-u / 0.025); ph += 2 * Math.PI * f / sr; kick[a + i] += 0.8 * Math.exp(-u / 0.22) * Math.min(1, u / 0.001) * Math.sin(ph) + (i < 90 ? 0.3 * rnd() * (1 - i / 90) : 0); } }
    for (const t of SN) { const a = Math.round(t * sr); let pv = 0; for (let i = 0; i < 0.3 * sr && a + i < n; i++) { const u = i / sr, w = rnd(), hp = w - pv; pv = w; snare[a + i] += 0.3 * Math.exp(-u / 0.06) * Math.sin(2 * Math.PI * 185 * u) + 0.35 * Math.exp(-u / 0.09) * hp; } }
    for (const q of B) { const a = Math.round(q.t * sr), L = Math.round(q.d * sr); let ph = 0, y = 0; for (let i = 0; i < L && a + i < n; i++) { const u = i / sr; ph += q.f / sr; ph -= Math.floor(ph); const saw = 2 * ph - 1, fc = 300 + 2500 * Math.exp(-u / 0.04), al = 1 - Math.exp(-2 * Math.PI * fc / sr); y += al * (saw - y); const env = Math.min(1, u / 0.003, (q.d - u) / 0.02); bass[a + i] += 0.35 * env * y; } }
    const mix = new Float32Array(n); for (let i = 0; i < n; i++) mix[i] = kick[i] + snare[i] + bass[i];
    const r0 = await __spk.load({name: 'SPKV-Test', sr, ch: [mix, mix.slice()]}); await __spk.open(r0.meta.id);
    const grid = r0.meta.grid;
    const z = await __spk.zerlegen(); const lid = z.lids;
    const bq = (x, typ, f0, Q) => { const w = 2 * Math.PI * f0 / sr, al = Math.sin(w) / (2 * Q), c = Math.cos(w); let b0, b1, b2; if (typ === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; } else { b0 = al; b1 = 0; b2 = -al; } const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al, y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const lp = x => bq(bq(x, 'lp', 160, 0.7071), 'lp', 160, 0.7071);
    const kL = lp(kick), bL = lp(bass);
    const proj = (y, s, ta, tb) => { let a = 0, c = 0; for (let i = Math.max(0, Math.round(ta * sr)); i < Math.min(n, Math.round(tb * sr)); i++) { a += y[i] * s[i]; c += s[i] * s[i]; } return c > 0 ? a / c : 0; };
    const sdr = (y, s) => { let e = 0, p = 0; for (let i = 0; i < n; i++) { p += s[i] * s[i]; e += (y[i] - s[i]) ** 2; } return 10 * Math.log10(p / Math.max(e, 1e-12)); };
    const drums = new Float32Array(n); for (let i = 0; i < n; i++) drums[i] = kick[i] + snare[i];
    const mess = async () => {
      const D = (await __spk.render(lid.drums, 0, n)).ch[0], Bs = (await __spk.render(lid.bass, 0, n)).ch[0], DL = lp(D), BL = lp(Bs);
      const kHit = K.filter(t => proj(DL, kL, t, t + 0.15) >= 0.5).length;
      const kInBass = K.filter(t => proj(BL, kL, t, t + 0.25) >= 0.35).length;
      const bOnly = B.filter(q => !K.some(t => Math.abs(t - q.t) < 0.03));
      const bAsKick = bOnly.filter(q => proj(DL, bL, q.t, q.t + 0.1) >= 0.35).length;
      const bHit = B.filter(q => proj(BL, bL, q.t, q.t + q.d) >= 0.5).length;
      const gHit = B.filter(q => { const bf = bq(bq(bass, 'bp', q.f, 4), 'bp', q.f, 4), yf = bq(bq(Bs, 'bp', q.f, 4), 'bp', q.f, 4); return proj(yf, bf, q.t + 0.03, q.t + q.d) >= 0.5; }).length;
      return {kickTreffer: kHit + '/' + K.length, kickImBass: kInBass + '/' + K.length, bassAlsKick: bAsKick + '/' + bOnly.length, bassTreffer: bHit + '/' + B.length, grundton: gHit + '/' + B.length,
        sdrDrums: +sdr(D, drums).toFixed(2), sdrBass: +sdr(Bs, bass).toFixed(2), sdrDrumsTief: +sdr(DL, kL).toFixed(2), sdrBassTief: +sdr(BL, bL).toFixed(2), _k: [kHit, kInBass, bAsKick, bHit, gHit]};
    };
    const out = {grid: {bpm: +(+grid.bpm).toFixed(2), off: +(+grid.off || 0).toFixed(3)}};
    out.zerlegt = await mess();
    const ms = []; let t = performance.now();
    await __spk.verfeinern('bass', {art: 'freq', f0: 20, f1: 300}); ms.push(Math.round(performance.now() - t));
    out.verfBass = await mess();
    t = performance.now(); await __spk.verfeinern('drums', {art: 'freq', f0: 20, f1: 300}); ms.push(Math.round(performance.now() - t));
    out.verfDrums = await mess();
    out.ms = ms;
    return out;
  });
  r.errs = errs; await ctx.close(); return r;
}
const res = {};
for (const w of names) { res[w] = await lauf(w); console.log(w, JSON.stringify(res[w], null, 0)); }
await b.close(); srv.kill(); fs.rmSync(dir, {recursive: true, force: true});
