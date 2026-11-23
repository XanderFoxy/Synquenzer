// ZRL2 Kern-Test: synthetisches Lied (SEK s, Standard 60) im Spektral-Worker der Seite zerlegen, A (neu) / B (4.85.0) abwechselnd.
// Misst Zeit und hasht das Ergebnis (alle vier Ebenen gerendert, Bits). Aufruf: node test-zr.mjs <neu.html> <basis.html>  [RUNDEN=2 SEK=60]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const E = process.env, A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]), SEK = +(E.SEK || 60), RUNDEN = +(E.RUNDEN || 2);
const srv = http.createServer((q, r) => { const u = q.url.split('?')[0];
  if (u === '/version.json') { r.writeHead(200, {'content-type': 'application/json'}); r.end('{"version":"4.85.0"}'); return; }
  const p = u === '/A.html' ? A : u === '/B.html' ? B : null; if (!p) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const last = () => fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
const b = await chromium.launch();
async function lauf(which, aendern) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + '/' + which + '.html'); await p.waitForFunction(() => typeof spk1Call === 'function', null, {timeout: 90000}); await p.waitForTimeout(500);
  const r = await p.evaluate(async ([sek, aendern]) => {
    const sr = 44100, n = sek * sr, ch = [new Float32Array(n), new Float32Array(n)], bpm = 112, beat = 60 / bpm;
    let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296 - 0.5;
    const bassN = [41, 41, 44, 39, 36, 36, 39, 43], chords = [[53, 57, 60], [50, 53, 57], [48, 52, 55], [55, 59, 62]], lead = [72, 74, 76, 79, 77, 76, 74, 72, 71, 72];
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    for (let i = 0; i < n; i++) {
      const t = i / sr, bi = Math.floor(t / beat), tb = t - bi * beat, e8 = t - Math.floor(t / (beat / 2)) * (beat / 2);
      let d = 0.9 * Math.sin(2 * Math.PI * (50 * tb + 120 * (1 - Math.exp(-tb * 30)) / 30)) * Math.exp(-tb * 9);   // Kick
      if (bi % 2 === 1) d += 0.35 * rnd() * Math.exp(-tb * 22);                                                      // Snare
      d += 0.12 * rnd() * Math.exp(-e8 * 60);                                                                         // Hi-Hat
      const bf = hz(bassN[bi % 8]); let ba = 0; for (let h = 1; h <= 6; h++) ba += Math.sin(2 * Math.PI * bf * h * t) / h; ba *= 0.25 * Math.min(1, tb * 200) * Math.exp(-tb * 1.5);
      const c = chords[Math.floor(bi / 4) % 4]; let pa = 0; for (const m of c) pa += Math.sin(2 * Math.PI * hz(m) * t) + 0.3 * Math.sin(4 * Math.PI * hz(m) * t); pa *= 0.06;
      const lf = hz(lead[Math.floor(t / (beat / 2)) % 10]) * (1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * t)); let le = 0; for (let h = 1; h <= 4; h++) le += Math.sin(2 * Math.PI * lf * h * t) / (h * h); le *= 0.12 * Math.min(1, e8 * 100);
      ch[0][i] = 0.8 * (d + ba + pa * 1.1 + le * 0.8); ch[1][i] = 0.8 * (d + ba + pa * 0.9 + le * 1.2);
    }
    const cr = await spk1Call('create', {name: 'ZRL2-Test', sr, ch, grid: {bpm, off: 0, ts: '4/4', from: 'test'}}, [ch[0].buffer, ch[1].buffer]);
    const id = cr.meta ? cr.meta.id : cr.id;
    const t0 = performance.now(); const z = await spk1Call('zerlegen', {doc: id}); const ms = Math.round(performance.now() - t0);
    let ms2 = null;
    if (aendern) { // zweites Zerlegen (Vorbereitung aus Zwischenspeicher) – nur Streifen-Teil
      const t1 = performance.now(); await spk1Call('zerlegen', {doc: id, weiter: false}); ms2 = Math.round(performance.now() - t1); }
    const L = z.lids, mixes = {drums: L.drums, bass: L.bass, gesang: L.gesang, rest: 'rest'}, hs = {};
    const fnv = (h, a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < u.length; i++) h = Math.imul(h ^ u[i], 16777619) >>> 0; return h; };
    let all = 2166136261;
    for (const k in mixes) { const rr = await spk1Call('render', {doc: id, mix: mixes[k], a: 0, b: n}); let h = 2166136261; for (const c of rr.ch) { h = fnv(h, c); all = fnv(all, c); } hs[k] = h.toString(16); }
    return {ms, kern: z.ms, ms2, hash: all.toString(16), hs};
  }, [SEK, aendern]);
  await ctx.close(); return Object.assign({which, last: last(), errs}, r);
}
const res = [];
for (let r = 0; r < RUNDEN; r++) for (const w of (r % 2 ? ['B', 'A'] : ['A', 'B'])) { const x = await lauf(w, !!E.ZWEI); res.push(x); console.log(JSON.stringify(x)); }
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length & 1 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const sa = res.filter(x => x.which === 'A'), sb = res.filter(x => x.which === 'B');
const hA = new Set(sa.map(x => x.hash)), hB = new Set(sb.map(x => x.hash));
console.log('SUMME', JSON.stringify({SEK, A_ms: sa.map(x => x.ms), B_ms: sb.map(x => x.ms), A_kern: sa.map(x => x.kern), B_kern: sb.map(x => x.kern), A_med: med(sa.map(x => x.kern)), B_med: med(sb.map(x => x.kern)),
  hashA: [...hA], hashB: [...hB], bitgleich: hA.size === 1 && hB.size === 1 && [...hA][0] === [...hB][0], fehler: res.flatMap(x => x.errs)}));
await b.close(); srv.close();
