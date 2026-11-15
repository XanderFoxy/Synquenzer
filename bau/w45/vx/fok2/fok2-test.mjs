// FOK2-Test: Tiefe der Ausblendung bei „Nur Rest“ gegen den wahren Rest (render('rest') als eigenes Dokument zerlegt), Schatten bei N 16384,
// Byte-Gleichheit ohne Ebenen, Zeit (Worker-ms, erstes Stück) und Long Tasks im Hauptfaden. A/B: index gegen basis im selben Lauf.
// Aufruf: node fok2-test.mjs <index.html> <basis.html>   (LANG=0 → ohne 3-Minuten-Zeitmessung, RUNS=3)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const files = [path.resolve(process.argv[2]), path.resolve(process.argv[3] || process.argv[2])], dir = path.dirname(files[0]);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
const load = () => execSync('uptime').toString().replace(/.*load average: /, '').trim();
let nOk = 0, nF = 0; const res = {};
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
async function page(file) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + path.basename(file)); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__fokus1, null, {timeout: 120000}); await p.waitForTimeout(500);
  await p.evaluate(() => {
    window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {}
    const PW = new Float64Array(256); for (let b = 1; b < 256; b++) PW[b] = Math.pow(10, (b * 120 / 255 - 120) / 10);
    const fnv = (h, u8) => { for (let i = 0; i < u8.length; i++) { h ^= u8[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
    window.__P = {
      hash: got => { let h = 0x811c9dc5; for (const c of got.slice().sort((a, b) => a.k - b.k)) h = fnv(h, c.data); return h.toString(16); },
      band: (O, G, f0, H, t0, t1, sr, half) => { const MO = new Map(O.map(c => [c.k, c])), MG = new Map(G.map(c => [c.k, c])), hop = O[0].hop; let eo = 0, eg = 0;
        for (let h = 1; h <= H; h++) { const rc = Math.round((12 * Math.log2(h * f0 / 440) + 57) * 8);
          for (let gc = Math.ceil(t0 * sr / hop); gc <= Math.floor(t1 * sr / hop); gc++) { const co = MO.get(gc >> 10), cg = MG.get(gc >> 10); if (!co || !cg) continue; const c = gc & 1023;
            for (let r = rc - half; r <= rc + half; r++) { eo += PW[co.data[r * co.w + c]]; eg += PW[cg.data[r * cg.w + c]]; } } }
        return +(10 * Math.log10((eg + 1e-30) / (eo + 1e-30))).toFixed(1); },
      region: (O, G, f0, f1, t0, t1, sr) => { const MO = new Map(O.map(c => [c.k, c])), MG = new Map(G.map(c => [c.k, c])), hop = O[0].hop, r0 = Math.round((12 * Math.log2(f0 / 440) + 57) * 8), r1 = Math.round((12 * Math.log2(f1 / 440) + 57) * 8); let eo = 0, eg = 0, diff = 0, n = 0;
        for (let gc = Math.ceil(t0 * sr / hop); gc <= Math.floor(t1 * sr / hop); gc++) { const co = MO.get(gc >> 10), cg = MG.get(gc >> 10); if (!co || !cg) continue; const c = gc & 1023; for (let r = r0; r <= r1; r++) { const a = co.data[r * co.w + c], g = cg.data[r * cg.w + c]; eo += PW[a]; eg += PW[g]; n++; if (a !== g) diff++; } }
        return {dB: +(10 * Math.log10((eg + 1e-30) / (eo + 1e-30))).toFixed(2), diff, n}; },
      spec: (doc, N) => { const cs = []; return spk1Call('spec', {doc, N}, null, {chunk: c => cs.push(c)}).then(() => cs); }
    };
  });
  return {p, ctx, errs};
}
const SR = 44100;
const loadDoc = (p, spec) => p.evaluate(async ([spec, sr]) => {
  const n = Math.round(spec.sec * sr), x = new Float32Array(n); let s1 = 7; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  for (const t of spec.tones) { const i0 = Math.round(t.a * sr), i1 = Math.round(t.b * sr), fd = Math.round(0.01 * sr); for (let i = i0; i < i1 && i < n; i++) { const e = Math.min(1, (i - i0) / fd, (i1 - i) / fd); let v = 0; for (let h = 1; h <= (t.H || 1); h++) v += t.amp / h * Math.sin(2 * Math.PI * t.f * h * i / sr); x[i] += e * v; } }
  for (let i = 0; i < n; i++) x[i] += (spec.noise || 0) * rnd();
  const r = await __spk.load({name: spec.name, sr, ch: (spec.stereo || spec.stq) ? [x, x.map((v, i) => 0.8 * v + 0.001 * Math.sin(i * 0.37))] : [x]}); await __spk.open(r.meta.id); return r.meta.id;
}, [process.env.STEREOQ ? Object.assign({stq: 1}, spec) : spec, SR]);
const OUT = {};
for (const [tag, file] of (process.env.NURZEIT ? [] : [['neu', files[0]], ['basis', files[1]]])) {
  const {p, ctx, errs} = await page(file); const R = OUT[tag] = {};
  // Fall 1: Kamm-Maske (Ebene, ohne Noten) – wie Prüfer m2 a
  await loadDoc(p, {name: 'K1', sec: 8, noise: 0.0005, tones: [{f: 220, a: 2, b: 6, amp: 0.3, H: 8}, {f: 65.41, a: 2, b: 6, amp: 0.3, H: 3}]});
  R.kamm = await p.evaluate(async sr => {
    const id = SPK1.doc, spur = f => { const s = []; for (let t = 2.0; t <= 6.0; t += 1024 / sr) s.push([+t.toFixed(4), f]); return s; };
    await __spk.mask({von: 'orig', nach: 'neu', modus: 'verschieben', sel: [{art: 'harm', spur: spur(220), K: 8, bw: 45}, {art: 'harm', spur: spur(65.41), K: 3, bw: 45}]});
    const rest = await __spk.render('rest'), w = await __spk.load({name: 'K1wahr', sr, ch: rest.ch}), idW = w.meta.id; await __spk.open(id);
    const out = {};
    for (const N of [16384, 4096, 1024]) {
      const O = await __P.spec(id, N), T = await __P.spec(idW, N), t0 = performance.now(), F = await __fokus1.get({mode: 'rest', aus: 'alle', N}), ms = performance.now() - t0;
      const q = (f0, H, a, b) => ({fokus: __P.band(O, F.got, f0, H, a, b, sr, 3), wahr: __P.band(O, T, f0, H, a, b, sr, 3)});
      out['N' + N] = {t220_halt: q(220, 8, 2.6, 5.4), t65_halt_3TT: q(65.41, 3, 2.6, 5.4), t220_vor: q(220, 8, 1.8, 1.97), t220_nach: q(220, 8, 6.03, 6.2),
        aussen: __P.region(O, F.got, 30, 16000, 0, 1.0, sr), anteil: F.anteil, ms: +ms.toFixed(0), wms: F.ms};
    }
    return out;
  }, SR);
  console.log(tag, 'kamm', JSON.stringify(R.kamm));
  // Fall 2: Rechteck-Ebene über Ton A (150–2200 Hz), Ton B bleibt – wie Prüfer m2 b / m1 C3
  await loadDoc(p, {name: 'K2', sec: 14, noise: 0.002, tones: [{f: 220, a: 2, b: 6, amp: 0.3, H: 8}, {f: 311.13, a: 8, b: 12, amp: 0.3, H: 8}, {f: 65.41, a: 2, b: 12, amp: 0.2, H: 2}]});
  R.rect = await p.evaluate(async sr => {
    const id = SPK1.doc; await __spk.mask({von: 'orig', nach: 'neu', modus: 'verschieben', sel: [{art: 'rect', t0: 1.9, t1: 6.1, f0: 150, f1: 2200, kt: 0, kf: 0}, {art: 'rect', t0: 0, t1: 14, f0: 50, f1: 80, kt: 0, kf: 0}]});
    const rest = await __spk.render('rest'), w = await __spk.load({name: 'K2wahr', sr, ch: rest.ch}), idW = w.meta.id; await __spk.open(id);
    const out = {};
    for (const N of [16384, 4096]) {
      const O = await __P.spec(id, N), T = await __P.spec(idW, N), F = await __fokus1.get({mode: 'rest', aus: 'alle', N});
      const q = (f0, H, a, b) => ({fokus: __P.band(O, F.got, f0, H, a, b, sr, 3), wahr: __P.band(O, T, f0, H, a, b, sr, 3)});
      out['N' + N] = {A_halt: q(220, 8, 2.6, 5.4), B_frei: q(311.13, 8, 8.5, 11.5), C65: q(65.41, 1, 3, 11), A_vor: q(220, 8, 1.7, 1.88), A_nach: q(220, 8, 6.12, 6.3), anteil: F.anteil};
    }
    return out;
  }, SR);
  console.log(tag, 'rect', JSON.stringify(R.rect));
  // Fall 3: nur Noten, keine Ebene → Bild muss byte-gleich zu basis sein (Hash)
  await loadDoc(p, {name: 'K3', sec: 14, noise: 0.002, tones: [{f: 220, a: 2, b: 6, amp: 0.3, H: 8}, {f: 311.13, a: 8, b: 12, amp: 0.3, H: 8}]});
  R.noten = await p.evaluate(async () => {
    await __spk.spk2.noten('orig', [{art: 'zeit', t0: 1.5, t1: 6.5}]); const o = {};
    for (const N of [16384, 4096]) { const F = await __fokus1.get({mode: 'rest', aus: 'alle', N}); o['N' + N] = {h: __P.hash(F.got), anteil: F.anteil}; const G = await __fokus1.get({mode: 'gef', aus: 'alle', N}); o['G' + N] = __P.hash(G.got); }
    return o;
  });
  console.log(tag, 'noten', JSON.stringify(R.noten));
  R.errs = errs.slice(); await ctx.close();
}
// Zeit + Long Tasks: 20 s und 3 min, Ebene über (fast) die ganze Länge, abwechselnd neu/basis, RUNS Läufe, Median
const RUNS = +(process.env.RUNS || 3), T = {neu: {}, basis: {}};
if (process.env.LANG !== '0') for (const sec of (process.env.SEKS || '20,180').split(',').map(Number)) for (let run = 0; run < RUNS; run++) for (const [tag, file] of (run % 2 ? [['basis', files[1]], ['neu', files[0]]] : [['neu', files[0]], ['basis', files[1]]])) {
  const {p, ctx} = await page(file);
  const tones = []; for (let t = 1; t + 3 < sec; t += 4) tones.push({f: [220, 261.63, 329.63, 392][(t / 4 | 0) % 4], a: t, b: t + 3, amp: 0.25, H: 6});
  await loadDoc(p, {name: 'Z' + sec, sec, noise: 0.002, tones, stereo: !!process.env.STEREO});
  const r = await p.evaluate(async sec => {
    await __spk.mask({von: 'orig', nach: 'neu', modus: 'verschieben', sel: [{art: 'rect', t0: 0.5, t1: sec - 0.5, f0: 200, f1: 1200, kt: 0, kf: 0}]});
    for (const N of [4096]) { const cs = []; await spk1Call('spec', {doc: SPK1.doc, N}, null, {chunk: c => cs.push(c)}); }
    await new Promise(r => setTimeout(r, 300)); window.__lt.length = 0;
    const o = {};
    for (const N of [4096, 16384]) {
      let first = 0; const t0 = performance.now(), F = await __fokus1.get({mode: 'rest', aus: 'alle', N}, {chunk: () => { if (!first) first = performance.now() - t0; }}), ms = performance.now() - t0;
      o['N' + N] = {ms: +ms.toFixed(0), wms: F.ms, first: +first.toFixed(0), n: F.n, je: +(F.ms / Math.max(1, F.n)).toFixed(1)};
    }
    o.lt = window.__lt.map(e => +e.d.toFixed(0));
    return o;
  }, sec);
  if (sec === 180 && run === 0) r.abbruch = await p.evaluate(async () => {   // Abbruch: neuer Ebenen-Stand im Worker vergessen (anderes N, Rest neu) → fokusStop, wie schnell kommt die Antwort?
    const t0 = performance.now(), pr = __fokus1.get({mode: 'rest', aus: 'alle', N: 8192}); await new Promise(r => setTimeout(r, 400)); const t1 = performance.now(); await __fokus1.stop(); const F = await pr;
    return {stop: F.stop, n: F.n, nachStop_ms: +(performance.now() - t1).toFixed(0), gesamt_ms: +(performance.now() - t0).toFixed(0)};
  });
  r.last = load(); (T[tag]['s' + sec] = T[tag]['s' + sec] || []).push(r); console.log(tag, sec + ' s', JSON.stringify(r));
  await ctx.close();
}
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
const zt = {}; for (const tag of ['neu', 'basis']) for (const k in T[tag]) for (const N of ['N4096', 'N16384']) (zt[tag] = zt[tag] || {})[k + N] = {ms: med(T[tag][k].map(r => r[N].ms)), first: med(T[tag][k].map(r => r[N].first)), je: med(T[tag][k].map(r => r[N].je)), lt: T[tag][k].map(r => r.lt.length ? Math.max(...r.lt) : 0)};
console.log('ZEIT', JSON.stringify(zt));
// Bewertung
if (process.env.NURZEIT) { console.log('NURZEIT fertig'); fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'fok2-zeit-' + (process.env.STEREO ? 'stereo' : 'mono') + '.json'), JSON.stringify({T, zt}, null, 1)); await b.close(); srv.close(); process.exit(0); }
const N1 = OUT.neu, B1 = OUT.basis, d3 = x => Math.abs(x.fokus - Math.min(0, x.wahr)) <= 3;   // wahrer Rest heller als das Original (Masken-Artefakt vor dem Einsatz) → Anzeige nie heller: Ziel min(wahr, 0)
for (const N of ['N16384', 'N4096']) {
  ok('kamm ' + N + ' 220 halt ≤3 dB zum wahren Rest', N1.kamm[N].t220_halt, d3(N1.kamm[N].t220_halt));
  ok('kamm ' + N + ' 65 halt ≤3 dB', N1.kamm[N].t65_halt_3TT, d3(N1.kamm[N].t65_halt_3TT));
  ok('kamm ' + N + ' vor/nach (Schatten) ≤3 dB', {vor: N1.kamm[N].t220_vor, nach: N1.kamm[N].t220_nach}, d3(N1.kamm[N].t220_vor) && d3(N1.kamm[N].t220_nach));
  ok('kamm ' + N + ' aussen byte-gleich', N1.kamm[N].aussen, N1.kamm[N].aussen.diff === 0);
  ok('rect ' + N + ' A halt/vor/nach ≤3 dB', {h: N1.rect[N].A_halt, v: N1.rect[N].A_vor, n: N1.rect[N].A_nach}, d3(N1.rect[N].A_halt) && d3(N1.rect[N].A_vor) && d3(N1.rect[N].A_nach));
  ok('rect ' + N + ' B frei ±1 dB', N1.rect[N].B_frei, Math.abs(N1.rect[N].B_frei.fokus) <= 1);
  ok('rect ' + N + ' C65 ≤3 dB', N1.rect[N].C65, d3(N1.rect[N].C65));
}
ok('noten ohne Ebene: byte-gleich zu basis (Rest + Gefundenes)', {neu: N1.noten, basis: B1.noten}, JSON.stringify(N1.noten) === JSON.stringify(B1.noten));
ok('keine Fehler', {neu: N1.errs, basis: B1.errs}, !N1.errs.length);
if (T.neu.s180) { const ab = T.neu.s180[0].abbruch; ok('abbruch: fokusStop beendet den Auftrag (stop abgeloest, < 300 ms)', ab, ab && ab.stop === 'abgeloest' && ab.nachStop_ms < 300); }
if (zt.neu) for (const k of Object.keys(zt.neu)) ok('zeit ' + k + ' (Long Tasks Hauptfaden < 50 ms oder wie basis)', {neu: zt.neu[k], basis: zt.basis[k]}, Math.max(...zt.neu[k].lt) < 50 || Math.max(...zt.neu[k].lt) <= Math.max(...zt.basis[k].lt) + 10);
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'fok2-ergebnis.json'), JSON.stringify({OUT, T, zt, res, nOk, nF}, null, 1));
console.log('ERGEBNIS', nOk, 'OK', nF, 'FEHLER');
await b.close(); srv.close();
