// ZRL3 Kern-Test (Bitgleich + Zeit): Audio-Ebene anlegen, dann Noten aendern und GANZ neu rechnen lassen
// (s6plan full:1 = derselbe Weg wie redo6 "ganz"). A = neu (Teil-Neurechnen ueber Zwischenspeicher), B = 4.86.0 (Voll-Neurechnen).
// Hash ueber Int16-Audio + o + sc der Ebene nach jedem Schritt; A und B muessen gleich sein.
// Aufruf: node test-zrl3.mjs <neu.html> <basis.html>   [RUNDEN=2 SEK=40]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const { chromium } = createRequire(import.meta.url)('playwright');
const E = process.env, SEK = +(E.SEK || 40), RUNDEN = +(E.RUNDEN || 2);
const dir = fs.mkdtempSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'srv-'));
fs.copyFileSync(path.resolve(process.argv[2]), path.join(dir, 'A.html')); fs.copyFileSync(path.resolve(process.argv[3]), path.join(dir, 'B.html'));
fs.writeFileSync(path.join(dir, 'version.json'), '{"version":"4.86.0"}');
const port = 8870 + Math.floor(Math.random() * 30);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {cwd: dir, stdio: 'ignore'});
for (let i = 0; i < 50; i++) { try { const r = await fetch('http://127.0.0.1:' + port + '/version.json'); if (r.ok) break; } catch (e) {} await new Promise(r => setTimeout(r, 200)); }
const base = 'http://127.0.0.1:' + port, last = () => fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
const b = await chromium.launch();
async function lauf(which) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + '/' + which + '.html'); await p.waitForFunction(() => typeof spk1Call === 'function' && window.__spk, null, {timeout: 90000}); await p.waitForTimeout(500);
  const r = await p.evaluate(async sek => {
    const sr = 44100, n = sek * sr, L = new Float32Array(n), mel = [60, 62, 64, 65, 67, 69, 67, 65, 64, 62];
    const hz = m => 440 * Math.pow(2, (m - 69) / 12), fo = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2);
    for (let k = 0, t0 = 0.5; t0 + 0.5 < sek - 0.5; k++, t0 += 0.8) { const f = hz(mel[k % 10]), a = t0, bb = t0 + 0.5;   // Noten 0,5 s, Pause 0,3 s
      for (let i = Math.round(a * sr); i < Math.round(bb * sr); i++) { const t = i / sr, e = Math.min(1, (t - a) / 0.02, (bb - t) / 0.03); let v = 0; for (let h = 1; h <= 20 && h * f < 9000; h++) v += fo(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); L[i] += 0.12 * e * v; } }
    for (let i = 0; i < n; i++) L[i] += 0.2 * Math.sin(2 * Math.PI * 55 * i / sr);
    const r0 = await __spk.load({name: 'ZRL3-Test', sr, ch: [L, L.slice()]}); const id = r0.meta.id; await __spk.open(id);
    await __spk.mask({von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.3, t1: sek - 0.3, f0: 150, f1: 9500}});
    const q = await spk1Call('noten', {doc: id, lid: 'L1'}); const N0 = q.meta.teil2.notes.L1 || [];
    const fnv = (h, a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < u.length; i++) h = Math.imul(h ^ u[i], 16777619) >>> 0; return h; };
    const hashA = async () => { const z = await spk1Call('s6audio', {doc: id, lid: 'L1'}); return fnv(2166136261, z.x).toString(16) + '/' + z.o + '/' + z.sc + '/' + z.x.length; };
    const step = async (mv, full) => { const t = performance.now(); const r = await spk1Call('s6plan', {doc: id, lid: 'L1', mv, full}); return {ms: Math.round(performance.now() - t), part: r.part || null, regs: r.regs, h: await hashA()}; };
    const ids = N0.map(z => z.id), mid = ids[ids.length >> 1];
    const s1 = await step(ids.map(i => ({id: i, dm: 2})), 1);            // Audio-Ebene anlegen: alle Noten +2 (ganz)
    const s2 = await step([{id: mid, dm: 1}], 1);                          // 1 Note geaendert, GANZ neu rechnen (Kern-Fall)
    const s3 = await step([{id: ids[3], dm: -1}, {id: ids[ids.length - 3], dm: 1}], 1);   // 2 Noten, ganz
    const s4 = await step([{id: ids[5], dm: 1}], 0);                       // normaler Weg (Bereich, patchA) – muss gleich bleiben
    const s5 = await step([{id: ids[7], dm: 0, dt: 0.05}], 1);             // Note verschoben (Zeit), ganz
    return {noten: N0.length, s1, s2, s3, s4, s5};
  }, SEK);
  await ctx.close(); return Object.assign({which, last: last(), errs}, r);
}
const res = [];
for (let r = 0; r < RUNDEN; r++) for (const w of (r % 2 ? ['B', 'A'] : ['A', 'B'])) { const x = await lauf(w); res.push(x); console.log(JSON.stringify(x)); }
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length & 1 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const K = ['s1', 's2', 's3', 's4', 's5'], sa = res.filter(x => x.which === 'A'), sb = res.filter(x => x.which === 'B'), sum = {SEK};
let gleich = true;
for (const k of K) { const hA = new Set(sa.map(x => x[k].h)), hB = new Set(sb.map(x => x[k].h)), g = hA.size === 1 && hB.size === 1 && [...hA][0] === [...hB][0]; gleich = gleich && g;
  sum[k] = {A_ms: sa.map(x => x[k].ms), B_ms: sb.map(x => x[k].ms), A_med: med(sa.map(x => x[k].ms)), B_med: med(sb.map(x => x[k].ms)), hash: [...hA].concat([...hB]), gleich: g}; }
sum.bitgleich = gleich; sum.fehler = res.flatMap(x => x.errs);
console.log('SUMME', JSON.stringify(sum));
await b.close(); srv.kill(); fs.rmSync(dir, {recursive: true, force: true});
process.exit(gleich && !sum.fehler.length ? 0 : 1);
