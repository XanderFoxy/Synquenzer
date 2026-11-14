// CHR2 Auftrag 3/3 – Gesamt-Test (OK/FEHLER). Aufruf: node chr2-test.mjs [<abs/index.html>] [<abs/basis.html>]
// 1. Stimmen trennen im Kern der Datei (Node): 2/3/4 Vokal-Stimmen, je Stimme erkannte Tonhöhe + Tonhöhe der getrennten Welle + Pegel-Abstand.
// 2. Browser (Touch über CDP): Gesang importieren (WAV über den Datei-Wähler, „Als Gesang“) → Chor (Stil) → echte Stimmen messen
//    (Versatz, Schwankung, Formant gegen dieselbe Kopie ohne „echt“), ein ↶; Takes-Blatt › Stimmen trennen (3) mit Abbrechen, Ablage,
//    Summe = Original, ein ↶/↷; Speichern/Laden, Container in frischem Speicher; Blätter hochkant/quer ohne Überlappung, ✕ sichtbar; Konsole.
// 3. Tuning-Artefakte (src/tune-meas.mjs) vorher (Basis) gegen nachher (Datei).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { makeVoices, pitchScore, levels, yin } from './src/synth.mjs';
const here = path.dirname(new URL(import.meta.url).pathname);
const file = path.resolve(process.argv[2] || path.join(here, 'index.html')), basis = path.resolve(process.argv[3] || path.join(here, '..', 'basis2.html'));
const fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
let bad = 0, all = 0; const fails = [];
const ok = (c, m, d) => { all++; const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) { bad++; fails.push(m); } console.log(s); };
const info = m => console.log('INFO ' + m);
const T0 = Date.now(), el = () => ((Date.now() - T0) / 1000).toFixed(0) + ' s';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SR = 44100, MEL = [[72, 1], [74, 1], [76, 2], [77, 1], [76, 1], [74, 2], [72, 1], [79, 1], [77, 1], [76, 1], [74, 2], [72, 2]];
const cents = (a, b) => 1200 * Math.log2(a / b);
const med = a => { const l = Array.from(a).filter(x => x > 0).sort((x, y) => x - y); return l.length ? l[l.length >> 1] : 0; };

/* ===== 1. Stimmen trennen: Kern der Datei in Node ===== */
const HTML = fs.readFileSync(file, 'utf8');
{ const i = HTML.indexOf('function chr2Core() {'), j = HTML.indexOf('const CHR2 = {', i);
  ok(i > 0 && j > i, 'Kern chr2Core in der Datei');
  const C = new Function(HTML.slice(i, j) + '\nreturn chr2Core;')()();
  // Anteil der Rahmen (Mitte f·hop), in denen die erkannte Tonhöhe der Stimme ±30 Cent an der Wahrheit liegt (30 ms Abstand zu Notenwechseln)
  const trackScore = (f0, truth, hop) => { let o = 0, n = 0; const g = Math.round(.03 * SR);
    for (let f = 0; f < f0.length; f++) { const c = f * hop, t = truth[c]; if (!t || !truth[Math.max(0, c - g)] || !truth[Math.min(truth.length - 1, c + g)]) continue;
      if (Math.abs(cents(truth[c - g], truth[c + g])) > 60) continue; n++; if (f0[f] > 0 && Math.abs(cents(f0[f], t)) <= 30) o++; }
    return n ? o / n : 0; };
  for (const cs of [{n: 2, iv: [0, -2], name: '2 Stimmen (Terz)'}, {n: 3, iv: [0, -2, -4], name: '3 Stimmen (Terz + Quinte)'}, {n: 4, iv: [0, -2, -4, -6], name: '4 Stimmen (Septakkord eng)'}, {n: 0, iv: [0, -2, -4], name: 'Auto bei 3 Stimmen'}]) {
    const V = makeVoices({mel: MEL, iv: cs.iv, sr: SR}), pcm = new Int16Array(V.n); for (let k = 0; k < V.n; k++) pcm[k] = Math.max(-32768, Math.min(32767, Math.round(V.mix[k] * 32767)));
    const t0 = Date.now(), r = C.sep(pcm, SR, {n: cs.n}), ms = Date.now() - t0, want = cs.iv.length;
    ok(r.ok && r.V === want, cs.name + ': Zahl der Stimmen', 'V=' + r.V + ', ' + ms + ' ms');
    if (cs.n === 0 || r.V !== want) continue;
    const truth = V.voices.map(v => v.y), tm = V.voices.map(v => med(v.f0));
    for (let k = 0; k < r.V; k++) {
      const m = med(r.f0[k]), j = tm.reduce((bi, q, x) => (Math.abs(Math.log(q / m)) < Math.abs(Math.log(tm[bi] / m)) ? x : bi), 0);
      const tr = trackScore(r.f0[k], V.voices[j].f0, r.hop), y = Float32Array.from(r.y[k], s => s / 32767), ps = pitchScore(y, V.voices[j].f0, SR), lv = levels(y, truth, j);
      ok(tr >= 0.9, `${cs.name}: Stimme ${k + 1} (${Math.round(tm[j])} Hz) erkannte Tonhöhe ±30 Cent`, (tr * 100).toFixed(1) + ' % der Zeit');
      ok(ps >= 0.9, `${cs.name}: Stimme ${k + 1} getrennte Welle trifft die Tonhöhe ±30 Cent`, (ps * 100).toFixed(1) + ' %');
      ok(lv.sir >= 10, `${cs.name}: Stimme ${k + 1} Pegel-Abstand zu den anderen ≥ 10 dB`, lv.sir.toFixed(1) + ' dB');
    }
  }
  info('Abschnitt 1 fertig (' + el() + ')');
}

/* ===== 2. Browser ===== */
const b = await chromium.launch(), errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y) { await tch(p, 'touchStart', x, y); await sleep(50); await tch(p, 'touchEnd'); await sleep(220); }
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await sleep(80); await tap(p, c.x, c.y); return true; }
const wav = (f32, sr) => { const n = f32.length, B = Buffer.alloc(44 + 2 * n); B.write('RIFF', 0); B.writeUInt32LE(36 + 2 * n, 4); B.write('WAVEfmt ', 8); B.writeUInt32LE(16, 16); B.writeUInt16LE(1, 20); B.writeUInt16LE(1, 22); B.writeUInt32LE(sr, 24); B.writeUInt32LE(2 * sr, 28); B.writeUInt16LE(2, 32); B.writeUInt16LE(16, 34); B.write('data', 36); B.writeUInt32LE(2 * n, 40); for (let i = 0; i < n; i++) B.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767))), 44 + 2 * i); return B; };
const f32 = b64 => { const u = Buffer.from(b64, 'base64'); return new Float32Array(u.buffer, u.byteOffset, u.length >> 2); };
// Maße im offenen Blatt: ✕ sichtbar, Tasten im CHR2-Abschnitt ≥ 44, nichts außerhalb, keine Überlappung
const measure = p => p.evaluate(() => {
  const P = UI.pop && UI.pop.el; if (!P) return {none: true};
  const r = P.getBoundingClientRect(), vis = e => e.offsetParent && e.getClientRects().length;
  const bt = [...P.querySelectorAll('button')].filter(vis), small = [...P.querySelectorAll('.chr2 button, .tk-chr2')].filter(vis).filter(e => { const q = e.getBoundingClientRect(); return q.height < 43.5 || q.width < 43.5; }).map(e => e.textContent.trim().slice(0, 16));
  const x = P.querySelector('[data-a="x"], .sh-x, .psh-x') || bt.find(e => /✕/.test(e.textContent)), xr = x && x.getBoundingClientRect();
  const items = [...P.querySelectorAll('button, input, canvas, select')].filter(vis);
  const out = items.filter(e => { const q = e.getBoundingClientRect(); return q.right > innerWidth + .5 || q.left < -.5; }).length;
  const ov = []; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], c = items[j]; if (a.contains(c) || c.contains(a)) continue;
    const A = a.getBoundingClientRect(), B = c.getBoundingClientRect(), w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w > 1 && h > 1) ov.push((a.textContent || a.tagName).trim().slice(0, 12) + '×' + (c.textContent || c.tagName).trim().slice(0, 12)); }
  const chr = P.querySelector('.chr2, .tk-chr2');
  return {pop: [r.left, r.top, r.width, r.height].map(Math.round), xVis: !!xr && xr.top >= 0 && xr.bottom <= innerHeight && xr.right <= innerWidth && xr.left >= 0 && xr.width >= 40, chr: !!chr, nchr: P.querySelectorAll('.chr2 button').length, small: small.slice(0, 5), out, ov: ov.slice(0, 5), n: items.length};
});

const p = await page(428, 926);
/* --- 2a. Gesang importieren (WAV, Datei-Wähler) → „Als Gesang“ --- */
const LEAD = makeVoices({mel: MEL, iv: [0], sr: SR}), leadWav = wav(LEAD.voices[0].y, SR);
await run(p, () => { closePop(); window.__imp1.ui.sheet(); }); await sleep(400);
let imp = null;
{ await run(p, () => { window.__pc = window.__imp1.ui.cur(); });
  const fc = p.waitForEvent('filechooser', {timeout: 5000}); await tapSel(p, '.imp1 button[data-i="pick"]'); const ch = await fc.catch(() => null);
  if (ch) { await ch.setFiles({name: 'gesang-alt.wav', mimeType: 'audio/wav', buffer: leadWav});
    for (let k = 0; k < 240; k++) { await sleep(250); imp = await run(p, () => { const c = window.__imp1.ui.cur(); return c && c !== window.__pc ? {st: c.st, bpm: c.bpm, quelle: c.r && c.r.quelle, err: c.err} : null; }); if (imp && (imp.st === 'fertig' || imp.st === 'fehler')) break; } } }
ok(imp && imp.st === 'fertig', 'Gesang-WAV über den Datei-Wähler gelesen und erkannt', imp);
ok(await tapSel(p, '.imp1 button[data-i="vox"]'), 'Import-Blatt: „Als Gesang“ angetippt'); await sleep(600);
const IV = await run(p, () => { const v = S.song && S.song.vox && S.song.vox[0], m = v && S.takes[v.take]; return v ? {id: v.id, take: v.take, src: m && m.src, st: stimmeT(), n: S.song.vox.length, u: UNDO.length} : null; });
ok(IV && IV.id && IV.src === 'import' && IV.st >= 0, 'Importierter Gesang liegt als Song-Stimme auf der STIMME-Spur', IV);

/* --- 2b. Chor aus dem importierten Gesang (Stil „Pop modern“) → echte Stimmen, ein ↶ --- */
let CH = null;
if (IV) {
  CH = await run(p, async o => {
    const r = {vox: o.id}, u0 = UNDO.length; closePop();
    const done = await g6pApplyStyle(r, 'pop'); const a = tkRef(r).a, c = a.chor;
    let ready = false; for (let k = 0; k < 400 && !ready; k++) { ready = g6pReady(a); if (!ready) await wait(250); }
    return {done, ready, u: UNDO.length - u0, label: UNDO[UNDO.length - 1].label, echt: c && c.grp && c.grp.echt, voices: c ? c.voices.map(v => ({rule: v.rule, lane: v.lane, dbl: (v.dbl || []).length})) : [], lanes: (S.tracks[stimmeT()].chor || {lanes: []}).lanes.length};
  }, IV);
  ok(CH.done && CH.voices.length === 3 && CH.voices.every(v => v.lane) && CH.echt === 1, 'Chor aus dem importierten Gesang: 3 Stimmen auf Chor-Spuren, neuer Chor ist „echt“', CH);
  ok(CH.u === 1 && /^Chor · /.test(CH.label), 'Chor anlegen = ein ↶-Schritt', CH.label);
  ok(CH.ready, 'Chor-Stimmen gerechnet (Worker)', CH.ready);
}
// Echte Stimmen messen: dieselbe Kopie mit und ohne „echt“ (Zeit-Versatz, Tonhöhen-Schwankung, Formant-Lage)
if (CH && CH.ready) {
  const grab = (p2, o) => run(p2, async o => {
    const a = tkRef({vox: o.id}).a, c = a.chor; c.grp.echt = o.echt ? 1 : 0;
    let ready = false; for (let k = 0; k < 400 && !ready; k++) { ready = g6pBufsReady(a); if (!ready) { g6pPrefetch(a, 1); await wait(250); } }
    const b64 = f => { const u = new Uint8Array(f.buffer, f.byteOffset, f.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
    const out = [];
    for (let vi = 0; vi < c.voices.length; vi++) { const v = c.voices[vi], sp = g6pSpec(a, v), cps = g6pCopies(v);
      for (let k = 0; k < cps.length; k++) { const h = g6pBuf(a, v, k), pl = sp.plans[sp.idx[k]];
        out.push({vi, k, rule: v.rule, cms: cps[k].ms, x: pl && pl.chr2 ? pl.chr2 : null, t0: h && h.t0, y: h ? b64(h.buf.getChannelData(0)) : null}); } }
    c.grp.echt = 1; return {ready, out};
  }, o);
  const E = await grab(p, {id: IV.id, echt: 1}), N = await grab(p, {id: IV.id, echt: 0});
  ok(E.ready && N.ready && E.out.every(z => z.y) && N.out.every(z => z.y), 'Kopien mit und ohne „echt“ gerechnet', E.out.length + ' Kopien');
  // Hüllkurve (Betrag, 5 ms geglättet, 4 kHz) → Versatz per Kreuzkorrelation; Tonhöhe (YIN) → Schwankung; Hülle (Cepstrum) → Formant-Lage
  const envOf = y => { const D = 11, n = Math.floor(y.length / D), e = new Float32Array(n); let acc = 0; const W = 20; const a = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < D; j++) s += Math.abs(y[i * D + j]); a[i] = s / D; }
    for (let i = 0; i < n; i++) { acc += a[i]; if (i >= W) acc -= a[i - W]; e[i] = acc / W; } return e; };
  const lagMs = (yE, yN) => { const a = envOf(yN), bq = envOf(yE), D = 11, maxL = Math.round(.06 * SR / D); let best = 0, bv = -1;
    for (let L = 0; L <= maxL; L++) { let s = 0, sa = 0, sb = 0; for (let i = 0; i + L < bq.length && i < a.length; i += 2) { s += a[i] * bq[i + L]; sa += a[i] * a[i]; sb += bq[i + L] * bq[i + L]; } const v = s / Math.sqrt(sa * sb + 1e-20); if (v > bv) { bv = v; best = L; } }
    return best * D / SR * 1000; };
  const fftR = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bb = n >> 1; for (; j & bb; bb >>= 1) j ^= bb; j ^= bb; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) { const an = -2 * Math.PI / len, wr = Math.cos(an), wi = Math.sin(an); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
  // Schwerpunkt des Betragsspektrums 300–3500 Hz (gleiche Tonhöhe → gleiche Teilton-Lagen, nur die Hülle verschiebt die Gewichte)
  const centroid = (y, c) => { const Nf = 2048, re = new Float64Array(Nf), im = new Float64Array(Nf); for (let j = 0; j < Nf; j++) { const q = c - Nf / 2 + j; re[j] = (q >= 0 && q < y.length ? y[q] : 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * (j + .5) / Nf)); } fftR(re, im);
    const bin = SR / Nf; let s = 0, w = 0; for (let k = Math.round(300 / bin); k < Math.round(3500 / bin); k++) { const a = Math.hypot(re[k], im[k]); s += a * k; w += a; } return s / Math.max(1e-12, w); };
  const R = [], AL = [];
  for (let i = 0; i < E.out.length; i++) {
    const e = E.out[i], n = N.out[i], yE = f32(e.y), yN = f32(n.y), lag = lagMs(yE, yN), d = Math.round(lag * SR / 1000);
    const yA = yE.subarray(d), PE = yin(yA, SR).f, PN = yin(yN, SR).f, dc = []; for (let k = 0; k < Math.min(PE.length, PN.length); k++) if (PE[k] > 0 && PN[k] > 0) { const c = cents(PE[k], PN[k]); if (Math.abs(c) < 60) dc.push(c); }
    const mu = dc.reduce((s, x) => s + x, 0) / Math.max(1, dc.length), sd = Math.sqrt(dc.reduce((s, x) => s + (x - mu) ** 2, 0) / Math.max(1, dc.length));
    AL.push({vi: e.vi, k: e.k, yA, yN, PN});
    R.push({v: e.vi + 1, k: e.k + 1, rule: e.rule, plan: e.x, nonecht: n.x, cms: e.cms, lag: +lag.toFixed(1), total: +(lag + e.cms).toFixed(1), sd: +sd.toFixed(1)});
  }
  // Formant-Unterschied zwischen zwei Sängern derselben Stimme (Kopie 1 gegen Kopie 2, beide „echt“) – und dieselben Kopien ohne „echt“ als Nullprobe
  const FD = [];
  for (const vi of [...new Set(AL.map(z => z.vi))]) {
    const [a, c] = AL.filter(z => z.vi === vi); if (!a || !c) continue; const fe = [], fn = [];
    for (let s = 4096; s + 4096 < Math.min(a.yA.length, c.yA.length); s += 2205) { const q = Math.round(s / (0.01 * SR)); if (!(a.PN[q] > 0)) continue;
      const x1 = centroid(a.yA, s), x2 = centroid(c.yA, s), n1 = centroid(a.yN, s), n2 = centroid(c.yN, s); if (isFinite(x1) && isFinite(x2)) fe.push(100 * (x1 - x2) / x2); if (isFinite(n1) && isFinite(n2)) fn.push(100 * (n1 - n2) / n2); }
    const m = q => q.reduce((s, x) => s + x, 0) / Math.max(1, q.length), r1 = R.find(z => z.v === vi + 1 && z.k === 1), r2 = R.find(z => z.v === vi + 1 && z.k === 2);
    FD.push({v: vi + 1, rule: r1.rule, f: [r1.plan && r1.plan.f, r2.plan && r2.plan.f], echt: +m(fe).toFixed(2), ohne: +m(fn).toFixed(2), n: fe.length});
  }
  for (const z of R) info(`Stimme ${z.v}/Kopie ${z.k} (${z.rule}): Plan ${JSON.stringify(z.plan)} · gemessen Versatz ${z.lag} ms (+ Kopie ${z.cms} ms = ${z.total} ms), Schwankung σ ${z.sd} ct`);
  for (const z of FD) info(`Stimme ${z.v} (${z.rule}): Formant Kopie 1 gegen 2 (Faktor ${z.f.join('/')}) echt ${z.echt} %, ohne echt ${z.ohne} % (${z.n} Rahmen)`);
  ok(R.every(z => z.plan && !z.nonecht), 'Echt-Plan je Kopie nur bei „echt“ (ohne Feld = wie bisher)');
  ok(R.every(z => z.plan && Math.abs(z.lag - z.plan.ms) <= 4), 'Versatz gemessen = Plan (±4 ms, Hüllkurven-Messung) je Kopie', R.map(z => z.lag + '/' + (z.plan && z.plan.ms)).join(' '));
  ok(R.every(z => z.total >= 9.5 && z.total <= 40.5) && new Set(R.map(z => Math.round(z.total))).size >= R.length - 1, 'Versatz gegen den Lead 10–40 ms, je Kopie verschieden', R.map(z => z.total).join(' '));
  ok(R.every(z => z.sd >= 1 && z.sd <= 8), 'Tonhöhen-Schwankung je Kopie σ 1–8 Cent (lebendig, nicht verstimmt)', R.map(z => z.sd).join(' '));
  ok(FD.length === 3 && FD.every(z => Math.sign(z.echt) === Math.sign(z.f[0] - z.f[1]) && Math.abs(z.echt) >= 1 && Math.abs(z.echt) >= 3 * Math.abs(z.ohne)), 'Formant-Unterschied zwischen den Sängern einer Stimme (Richtung wie geplant, ≥ 1 %, ohne „echt“ ≈ 0)', FD.map(z => z.rule + ' ' + z.echt + '% (ohne ' + z.ohne + '%)').join(' · '));
  // ↶ / ↷ Chor
  const U = await run(p, o => { undo(); const a = tkRef({vox: o.id}).a, u = {chor: !!a.chor, lanes: (S.tracks[stimmeT()].chor || {lanes: []}).lanes.length}; redo(); const b2 = tkRef({vox: o.id}).a; return {u, r: {n: b2.chor ? b2.chor.voices.length : 0, echt: b2.chor && b2.chor.grp.echt}}; }, IV);
  ok(!U.u.chor && U.u.lanes === 0 && U.r.n === 3 && U.r.echt === 1, '↶ nimmt den Chor ganz zurück, ↷ bringt ihn (echt) wieder', U);
}
await p.screenshot({path: path.join(fotos, 'chr2t-chor-import.png')});
info('Abschnitt 2a/2b fertig (' + el() + ')');

/* --- 2c. Stimmen trennen über das Takes-Blatt (3 Stimmen) --- */
const V3 = makeVoices({mel: MEL, iv: [0, -2, -4], sr: SR}), pcm3 = Array.from(V3.mix, s => Math.max(-32768, Math.min(32767, Math.round(s * 32767))));
const r0 = await run(p, async o => { const r = await SYNQUENZER.tkInject({pcm: o.pcm, sr: o.SR, scene: 0, at: 0, len: 5}); await wait(300); const st = stimmeT(); return {id: r.id, st, u: UNDO.length, lanes: S.tracks[st].chor ? S.tracks[st].chor.lanes.length : 0}; }, {pcm: pcm3, SR});
ok(!!r0.id && r0.st >= 0, 'Take mit 3 gemischten Stimmen in Szene 1 der STIMME-Spur', r0);
await run(p, o => { closePop(); CHR2.open = false; tkSheet({t: o.st, s: 0}); }, r0); await sleep(500);
ok(await tapSel(p, '.tksheet button[data-a="chr2"]'), 'Takes-Blatt: „Stimmen trennen …“ per Tipp'); await sleep(300);
ok(await tapSel(p, '.tksheet button[data-a="chr2n"][data-v="3"]'), 'Zahl 3 gewählt'); await sleep(200);
const snap = () => run(p, () => JSON.stringify([S.takes, S.tracks[stimmeT()].clips[0], S.tracks[stimmeT()].chor || null, UNDO.length]));
const s0 = await snap();
await tapSel(p, '.tksheet button[data-a="chr2go"]');
let sawProg = null; for (let i = 0; i < 80 && sawProg == null; i++) { await sleep(25); sawProg = await run(p, () => { const e = document.querySelector('.tksheet button[data-a="chr2go"]'); return SYNQUENZER.chr2.busy() != null && e && /Abbrechen/.test(e.textContent) ? e.textContent : null; }); }
await tapSel(p, '.tksheet button[data-a="chr2go"]'); await sleep(400);
ok(!!sawProg && s0 === await snap(), 'Fortschritt im Knopf, Abbrechen → nichts geändert', sawProg || 'kein Fortschritt gesehen');
await p.screenshot({path: path.join(fotos, 'chr2t-blatt-hochkant.png')});
const t1 = Date.now(); await tapSel(p, '.tksheet button[data-a="chr2go"]');
let L = null; for (let i = 0; i < 240 && !L; i++) { await sleep(250); L = await run(p, () => SYNQUENZER.chr2.last()); }
ok(!!L && L.V === 3, 'Getrennt: 3 Stimmen', L ? `${L.ms} ms Worker + Ablage, Testlauf ${Date.now() - t1} ms` : 'kein Ergebnis');
let SEP = null;
if (L) {
  SEP = await run(p, o => {
    const st = stimmeT(), a = S.tracks[st].clips[0].audio, c = a.chor, ln = S.tracks[st].chor.lanes;
    const get = id => Array.from(tkBuffer(id).getChannelData(0), s => Math.round(s * 32767));
    return {voices: c.voices.map(v => ({lane: v.lane, take: v.take.take, name: S.takes[v.take.take].name, ln: (ln.find(l => l.id === v.lane) || {}).name})), lead: {take: a.take, name: S.takes[a.take].name}, alt: (a.alt || []).map(x => x.take), orig: o.id,
      unity: SYNQUENZER.chr2.unity({t: st, s: 0}), grp: c.grp, ys: c.voices.map(v => get(v.take.take)), rest: get(a.take), undo: UNDO[UNDO.length - 1].label, un: UNDO.length, lanesN: ln.length, voxLanes: (tkRef({vox: S.song.vox[0].id}).a.chor.voices.map(v => v.lane))};
  }, r0);
  ok(SEP.voices.length === 3 && SEP.voices.every(v => v.take && v.lane && v.ln && /^Stimme \d$/.test(v.name)) && SEP.voices.every(v => !SEP.voxLanes.includes(v.lane)), 'Je Stimme ein eigener Take auf einer eigenen, freien Chor-Spur (neben dem Chor des Imports)', SEP.voices.map(v => v.lane + ':' + v.ln).join(' ') + ' · Import-Chor ' + SEP.voxLanes.join(','));
  ok(SEP.lead.name === 'Rest' && SEP.alt[0] === SEP.orig, 'Rest ist das hörbare Stück, Original liegt stumm darunter (A/B)');
  ok(SEP.unity && SEP.grp.rev === 0 && SEP.grp.dly === 0 && SEP.grp.hp <= 20 && !SEP.grp.echt, 'Gruppe neutral, fester Pegel, nicht „echt“ (getrennte Stimmen klingen wie gesungen)', SEP.grp);
  ok(SEP.un === r0.u + 1 && SEP.undo === 'Stimmen getrennt', 'Trennen = ein ↶-Schritt', SEP.undo);
  const truth = V3.voices.map(v => v.y), tm = V3.voices.map(v => med(v.f0));
  for (let k = 0; k < 3; k++) {
    const m = med(L.f0[k]), j = tm.reduce((bi, q, x) => (Math.abs(Math.log(q / m)) < Math.abs(Math.log(tm[bi] / m)) ? x : bi), 0);
    const y = Float32Array.from(SEP.ys[k], s => s / 32767), ps = pitchScore(y, V3.voices[j].f0, SR), lv = levels(y, truth, j);
    ok(ps >= 0.9, `App: Stimme ${k + 1} (${Math.round(tm[j])} Hz) Welle trifft die Tonhöhe ±30 Cent`, (ps * 100).toFixed(1) + ' %');
    ok(lv.sir >= 10, `App: Stimme ${k + 1} Pegel-Abstand ≥ 10 dB`, lv.sir.toFixed(1) + ' dB');
  }
  let e = 0, ex = 0; for (let i = 0; i < pcm3.length; i++) { let s = SEP.rest[i] || 0; for (const y of SEP.ys) s += y[i] || 0; e += (s - pcm3[i]) ** 2; ex += pcm3[i] ** 2; }
  ok(10 * Math.log10(e / ex) < -60, 'Rest + Stimmen = Original (nur Rundung)', (10 * Math.log10(e / ex)).toFixed(1) + ' dB');
  await sleep(500); await p.screenshot({path: path.join(fotos, 'chr2t-nach-trennen.png')});
  const U = await run(p, async o => { undo(); await wait(300); const st = stimmeT(), a = S.tracks[st].clips[0].audio; const u1 = {take: a.take === o.id, chor: !!a.chor, alt: (a.alt || []).length, lanes: S.tracks[st].chor.lanes.length};
    redo(); await wait(300); const b2 = S.tracks[st].clips[0].audio; return {u1, r: {chor: b2.chor ? b2.chor.voices.length : 0, rest: S.takes[b2.take] && S.takes[b2.take].name, lanes: S.tracks[st].chor.lanes.length}}; }, r0);
  ok(U.u1.take && !U.u1.chor && U.u1.alt === 0 && U.u1.lanes === 3, '↶ nimmt das Trennen zurück (Original oben, kein Chor, Import-Chor-Spuren bleiben)', U.u1);
  ok(U.r.chor === 3 && U.r.rest === 'Rest' && U.r.lanes === 6, '↷ bringt es wieder', U.r);
}
info('Abschnitt 2c fertig (' + el() + ')');

/* --- 2d. Speichern/Laden + Container (frischer Speicher) --- */
const SV = await run(p, async o => {
  const fo = SQStore.buildProjectFile(S, null, VERSION), q = normalizeProject(projFromFile(JSON.parse(JSON.stringify(fo))));
  const st = stimmeT(), qa = q.tracks[st].clips[0].audio, qv = q.song.vox[0];
  // altes Projekt: Chor ohne „echt“ bleibt ohne (kein Feld dazu)
  const fo2 = JSON.parse(JSON.stringify(fo)), P2 = projFromFile(fo2); delete P2.song.vox[0].chor.grp.echt; const q2 = normalizeProject(P2);
  const ids = qa && qa.chor ? qa.chor.voices.map(v => v.take.take).concat([qa.take]) : [], D = window.SYNQUENZER, hs = {};
  for (const id of ids.concat([qv.take])) hs[id] = await D.tkPcmHash(id);
  return {sep: qa && qa.chor ? {n: qa.chor.voices.length, takes: qa.chor.voices.every(v => q.takes[v.take.take] && q.takes[v.take.take].chr2 && q.takes[v.take.take].chr2.of === o.id), rest: q.takes[qa.take] && q.takes[qa.take].name, alt: (qa.alt || []).length, grp: qa.chor.grp} : null,
    vox: {n: qv.chor ? qv.chor.voices.length : 0, echt: qv.chor && qv.chor.grp.echt}, old: {echt: 'echt' in q2.song.vox[0].chor.grp}, lanes: q.tracks[st].chor.lanes.length, ids, voxTake: qv.take, hs, box: await D.va1BoxB64(), voxId: qv.id};
}, r0);
ok(SV.sep && SV.sep.n === 3 && SV.sep.takes && SV.sep.rest === 'Rest' && SV.sep.alt === 1 && SV.lanes === 6, 'Speichern/Laden: getrennte Stimmen (Takes mit Herkunft), Rest, Original in alt, 6 Chor-Spuren', SV.sep);
ok(SV.vox.n === 3 && SV.vox.echt === 1 && !SV.old.echt, 'Speichern/Laden: Import-Chor bleibt „echt“, alter Chor ohne Feld bleibt ohne', {vox: SV.vox, alt: SV.old});
{ const p2 = await page(428, 926);
  const ct = await run(p2, async o => {
    const D = window.SYNQUENZER, r = await D.va1BoxImport(o.box); await wait(2500);
    const loaded = await D.tkLoadAll(), hs = {}; for (const id of Object.keys(o.hs)) hs[id] = await D.tkPcmHash(id);
    const st = stimmeT(), a = S.tracks[st] && S.tracks[st].clips[0] && S.tracks[st].clips[0].audio, v = S.song && S.song.vox && S.song.vox[0];
    return {ok: r.ok, same: Object.keys(o.hs).every(id => hs[id] && hs[id] === o.hs[id]), loaded: o.ids.every(id => loaded.includes(id)), unity: SYNQUENZER.chr2.unity({t: st, s: 0}), sep: a && a.chor ? a.chor.voices.length : 0, vox: v && v.chor ? {n: v.chor.voices.length, echt: v.chor.grp.echt} : null};
  }, SV);
  ok(ct.ok && ct.same && ct.loaded && ct.unity && ct.sep === 3 && ct.vox && ct.vox.n === 3 && ct.vox.echt === 1, 'Container (ZIP Projekt + Audio) in frischem Speicher: Stimmen-, Rest- und Gesang-Takes bitgleich, Chöre da', ct);
  await p2.close(); }
info('Abschnitt 2d fertig (' + el() + ')');

/* --- 2e. Blätter hochkant + quer: Takes-Blatt mit offenem Abschnitt (Szene ohne Chor, Song-Stimme mit Chor) --- */
await run(p, () => { undo(); }); await sleep(300);   // Szene 1 wieder ohne Chor (Original oben) – Abschnitt mit [Trennen] aktiv
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await sleep(350);
  for (const [tag, ref] of [['Szene', {t: r0.st, s: 0}], ['Song-Stimme', {vox: IV && IV.id}]]) {
    await run(p, o => { closePop(); CHR2.open = true; tkSheet(o); }, ref); await sleep(450);
    const m = await measure(p);
    ok(!m.none && m.chr && m.nchr >= 6 && m.xVis && !m.small.length && !m.out && !m.ov.length && m.pop[0] >= 0 && m.pop[0] + m.pop[2] <= w + .5, `Takes-Blatt ${tag} ${w}×${h}: Abschnitt offen, ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung`, m);
    await p.screenshot({path: path.join(fotos, `chr2t-blatt-${tag === 'Szene' ? 'szene' : 'song'}-${w}x${h}.png`)});
  }
  // geschlossener Abschnitt: nur die Zeile „Stimmen trennen …“
  await run(p, o => { closePop(); CHR2.open = false; tkSheet(o); }, {t: r0.st, s: 0}); await sleep(400);
  const m2 = await measure(p);
  ok(!m2.none && m2.chr && m2.xVis && !m2.small.length && !m2.out && !m2.ov.length, `Takes-Blatt zu ${w}×${h}: Zeile „Stimmen trennen …“, ✕ sichtbar, keine Überlappung`, m2);
}
await run(p, () => { closePop(); CHR2.open = false; });
info('Abschnitt 2e fertig (' + el() + ')');
await p.close();
ok(!errs.length, 'keine Konsolen-Fehler', errs.slice(0, 3).join(' | '));
await b.close();

/* ===== 3. Tuning-Artefakte vorher (Basis) gegen nachher ===== */
const meas = f => { const o = path.join(here, 'src', 'tm-' + path.basename(path.dirname(f)) + '-' + path.basename(f) + '.json'); execFileSync('node', [path.join(here, 'src', 'tune-meas.mjs'), f, '', o], {timeout: 240000, stdio: 'ignore'}); return JSON.parse(fs.readFileSync(o, 'utf8')); };
try {
  const A = meas(basis), Bm = meas(file), by = (X, l) => X.find(z => z.label === l);
  for (const l of ['Korrektur weich', 'Korrektur hart', 'Korrektur natürlich', 'Chor Terz +400 (Chor-Weg)', 'Chor Quinte -500 (Chor-Weg)']) {
    const a = by(A, l), z = by(Bm, l); if (!a || !z) { ok(false, 'Tuning ' + l + ': gemessen'); continue; }
    const notWorse = z.lsdRuhig <= a.lsdRuhig + .05 && z.lsdUebergang <= a.lsdUebergang + .05 && z.formantPct <= a.formantPct + .2 && z.tonRmsCt <= a.tonRmsCt + .3 && z.glaette <= a.glaette + .05;
    ok(z.knack < a.knack && z.knackMaxDb < a.knackMaxDb - 20 && notWorse, `Tuning ${l}: Knackser weniger, sonst nicht schlechter`, `Knackser ${a.knack} (${a.knackMaxDb} dB) → ${z.knack} (${z.knackMaxDb} dB) · LSD ${a.lsdRuhig}/${a.lsdUebergang} → ${z.lsdRuhig}/${z.lsdUebergang} dB · Formant ${a.formantPct} → ${z.formantPct} % · Ton ${a.tonRmsCt} → ${z.tonRmsCt} ct`);
  }
  const e = by(Bm, 'Chor +400 echt');
  ok(e && e.konsonantDb <= -12 && e.schwankCt >= 1 && e.formantGegenKopiePct >= 1, 'Echte Chor-Kopie (Kern): Konsonanten leise, eigene Schwankung, eigene Formant-Lage', e && {konsonantDb: e.konsonantDb, schwankCt: e.schwankCt, formantGegenKopiePct: e.formantGegenKopiePct});
} catch (x) { ok(false, 'Tuning-Messung lief', String(x.message || x).slice(0, 200)); }

console.log((bad ? bad + ' FEHLER von ' + all + ': ' + fails.join(' | ') : 'ALLE OK (' + all + ')') + ' (' + el() + ')');
process.exit(bad ? 1 : 0);
