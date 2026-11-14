// RV1 Echttest mit echtem Gesang (freier Datensatz, nur lokal gelesen). Weg wie Xander: Export-Blatt › Audio/MIDI importieren › Datei › „Als Gesang“.
// VX2-Kopie: wie vx/real/rv1-test.mjs (Prüfungen gleich); zusätzlich INFO „VX2-Bezug“ (Knacken gegen Quelle inkl. Ausklang des Vorgängers) und RV1_DUMP für Quantisier-Puffer.
// (a) Gesang-Editor: Stücke/Anker gegen die Noten-Annotation (Einsatz ±40 ms, Tonhöhe ±50 ct), Silben ehrlich leer ohne Spracherkennung,
//     Quantisieren ohne Knacken (Sprung/Knack-Index an jedem Schnitt gegen die Quelle), Verschieben links (Ausklang bitgleich) / rechts (Dehnung, Ton gleich)
// (b) Import Gesang allein: Tempo-Vorschlag plausibel (Raster-Treue der annotierten Einsätze) + Frage
// (c) Chor aus echtem Gesang: Versatz/Schwankung/Formant wie geplant, keine neuen Knackser
// Aufruf: node rv1-test.mjs <abs index.html> <abs ordner mit <name>_<nr>.wav und <name>_<nr>_notesA1.csv> [out.json]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { yin } from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/chr3/src/synth.mjs';
const file = path.resolve(process.argv[2]), dl = path.resolve(process.argv[3]), outJ = process.argv[4] ? path.resolve(process.argv[4]) : null;
const here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const ONLY = (process.env.RV1_ONLY || '1,10,14').split(',');
// Dateien im Ordner: <name>_<nr>.wav, Noten <name>_<nr>_notesA1.csv
const PFX = (fs.readdirSync(dl).find(f => /_1\.wav$/.test(f)) || '_1.wav').replace(/1\.wav$/, '');
let bad = 0, all = 0; const RES = {};
const ok = (c, m, d) => { all++; if (!c) bad++; console.log((c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
const info = (m, d) => console.log('INFO ' + m + (d != null ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const T0 = Date.now(), el = () => ((Date.now() - T0) / 1000).toFixed(0) + ' s';
const H = `const wait = ms => new Promise(r => setTimeout(r, ms)); const b64 = f => { const u = new Uint8Array(f.buffer, f.byteOffset, f.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const f32 = b => { const u = Buffer.from(b, 'base64'); return new Float32Array(u.buffer.slice(u.byteOffset, u.byteOffset + u.length)); };
const cents = (a, b) => 1200 * Math.log2(a / b);
const med = a => { const l = Array.from(a).filter(x => isFinite(x)).sort((x, y) => x - y); return l.length ? l[l.length >> 1] : NaN; };

// Knack-Index: Energie der 2. Ableitung im lautesten 1-ms-Fenster ±3 ms um c gegen den Median der 1-ms-Fenster in ±25 ms (ohne ±3 ms)
function knack(y, sr, c) {
  const W = Math.round(sr / 1000), e = q => { let s = 0; for (let i = Math.max(2, q); i < Math.min(y.length, q + W); i++) { const d = y[i] - 2 * y[i - 1] + y[i - 2]; s += d * d; } return s; };
  let mx = 0; const ref = [];
  for (let o = -25; o < 25; o++) { const v = e(c + o * W); if (Math.abs(o) <= 3) mx = Math.max(mx, v); else ref.push(v); }
  return mx / Math.max(1e-12, med(ref));
}
const d2m = (y, sr, c, ms) => { let m = 0; const a = Math.max(2, c - Math.round(ms * sr / 1000)), b = Math.min(y.length, c + Math.round(ms * sr / 1000)); for (let i = a; i < b; i++) m = Math.max(m, Math.abs(y[i] - 2 * y[i - 1] + y[i - 2])); return m; };
const jump = (y, sr, c, ms) => { let m = 0; const a = Math.max(1, c - Math.round(ms * sr / 1000)), b = Math.min(y.length, c + Math.round(ms * sr / 1000)); for (let i = a; i < b; i++) m = Math.max(m, Math.abs(y[i] - y[i - 1])); return m; };

const b = await chromium.launch(), errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  await run(p, () => { window.__toasts = []; const t0 = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); return t0.apply(this, arguments); }; });
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y) { await tch(p, 'touchStart', x, y); await sleep(50); await tch(p, 'touchEnd'); await sleep(220); }
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await sleep(80); await tap(p, c.x, c.y); return true; }

// Raster-Treue der annotierten Einsätze für ein Tempo (Viertel + ½·Achtel, wie der Import sie misst) – unabhängige Plausibilität
const fit = (ons, bpm) => { const z = P => { let re = 0, im = 0; for (const t of ons) { re += Math.cos(2 * Math.PI * t / P); im += Math.sin(2 * Math.PI * t / P); } return Math.hypot(re, im) / ons.length; }; return z(60 / bpm) + .5 * z(30 / bpm); };

async function importVox(p, nr) {
  const wav = fs.readFileSync(path.join(dl, PFX + nr + '.wav'));
  await run(p, () => { closePop(); va1Sheet(); }); await sleep(300);
  ok(await tapSel(p, 'button[data-va="midiin"]'), `#${nr} Export-Blatt › „Audio/MIDI importieren“`); await sleep(300);
  await run(p, () => { window.__pc = window.__imp1.ui.cur(); });
  const fc = p.waitForEvent('filechooser', {timeout: 5000}); await tapSel(p, '.imp1 button[data-i="pick"]'); const ch = await fc.catch(() => null);
  let c = null;
  if (ch) { await ch.setFiles({name: 'gesang-' + nr + '.wav', mimeType: 'audio/wav', buffer: wav});
    for (let k = 0; k < 400; k++) { await sleep(250); c = await run(p, () => { const c = window.__imp1.ui.cur(); if (!c || c === window.__pc) return null;
      return {st: c.st, err: c.err, bpm: c.bpm, ts: c.ts, t1: c.t1, dur: c.dur, r: c.r && {bpm: c.r.bpm, bpmRoh: c.r.bpmRoh, quelle: c.r.quelle, frage: c.r.frage, alt: c.r.alt, stabil: c.r.stabil, ts: c.r.ts, low: c.r.diag && c.r.diag.lowRatio, quiet: c.r.diag && c.r.diag.quiet}}; });
      if (c && (c.st === 'fertig' || c.st === 'fehler')) break; } }
  const q = await run(p, () => { const P = UI.pop && UI.pop.el; return P ? {w: [...P.querySelectorAll('.imp1st.warn')].map(e => e.textContent), bt: [...P.querySelectorAll('button[data-i="setbpm"]')].map(b => b.textContent.trim())} : null; });
  await p.screenshot({path: path.join(fotos, 'rv1-import-' + nr + '.png')});
  return {c, q};
}
async function placeVox(p) {
  const u0 = await run(p, () => UNDO.length);
  ok(await tapSel(p, '.imp1 button[data-i="vox"]'), 'Import-Blatt: „Als Gesang“ angetippt');
  let v = null; for (let k = 0; k < 400 && !v; k++) { await sleep(250); v = await run(p, () => { const v = S.song && S.song.vox && S.song.vox[0], m = v && S.takes[v.take]; return v && m ? {id: v.id, take: v.take, src: m.src, imp: m.imp, sr: m.sr, len: m.len, nx1: typeof NX1 !== 'undefined' && NX1.imp ? NX1.imp : null, bpm: S.bpm} : null; }); }
  if (v) v.du = await run(p, () => UNDO.length) - u0;
  return v;
}

for (const nr of ONLY) {
  const R = RES[nr] = {};
  const p = await page(428, 926);
  /* ---------- (b) Import Gesang allein ---------- */
  const {c, q} = await importVox(p, nr);
  ok(c && c.st === 'fertig', `#${nr} echte Gesangsaufnahme gelesen und erkannt`, c && {st: c.st, err: c.err, ms: c.r && c.r.diag});
  if (!c || c.st !== 'fertig') { await p.close(); continue; }
  R.imp = {bpm: c.bpm, roh: c.r.bpmRoh, low: c.r.low, quiet: c.r.quiet, quelle: c.r.quelle, frage: c.r.frage, alt: c.r.alt, stabil: c.r.stabil, ts: c.ts, t1: c.t1, warn: q && q.w, bt: q && q.bt};
  info(`#${nr} Import`, R.imp);
  ok(c.r.quelle === 'gesang' && c.r.frage && q && q.w.some(t => /^Aus Gesang geschätzt – \d+/.test(t)) && q.bt.length >= 2, `#${nr} Gesang allein erkannt, Blatt fragt mit Vorschlag`, {quelle: c.r.quelle, frage: c.r.frage, warn: q && q.w, bt: q && q.bt});
  ok(c.bpm >= 60 && c.bpm <= 180, `#${nr} Tempo-Vorschlag im Bereich 60–180`, c.bpm);
  const ann = fs.existsSync(path.join(dl, PFX + nr + '_notesA1.csv')) ? fs.readFileSync(path.join(dl, PFX + nr + '_notesA1.csv'), 'utf8').trim().split('\n').map(l => l.split(',').map(Number)).filter(a => a.length >= 3 && isFinite(a[0])) : null;
  if (ann) {
    const ons = ann.map(a => a[0]), sc = []; for (let t = 60; t <= 180; t += .5) sc.push([t, fit(ons, t)]);
    const mine = Math.max(...[c.bpm].concat(c.r.alt || []).filter(v => v >= 60 && v <= 180).map(v => fit(ons, v))), rank = sc.filter(z => z[1] > mine).length / sc.length;
    const best = sc.slice().sort((x, y) => y[1] - x[1]).slice(0, 3).map(z => z[0] + ':' + z[1].toFixed(2));
    R.imp.fitRank = +rank.toFixed(3); R.imp.best = best;
    ok(rank <= .15, `#${nr} Vorschlag (oder ½×/2×) passt zu den annotierten Einsätzen (unter den besten 15 % aller Tempi 60–180)`, {vorschlag: c.bpm, treue: +mine.toFixed(2), rang: (rank * 100).toFixed(1) + ' %', beste: best.join(' ')});
  }
  /* ---------- Als Gesang ablegen ---------- */
  const v = await placeVox(p);
  ok(v && v.src === 'import' && v.du === 1, `#${nr} „Als Gesang“: Song-Stimme mit Take, ein ↶`, v && {src: v.src, du: v.du, bpm: v.bpm, nx1: v.nx1, imp: v.imp});
  if (!v) { await p.close(); continue; }
  const k = v.nx1 && v.nx1.n ? v.nx1.out / v.nx1.n : 1, org = c.t1 * k - v.imp.t1;   // Datei-Zeit → Take-Zeit: τ = t·k − org
  R.map = {k: +k.toFixed(6), org: +org.toFixed(4)};
  /* ---------- (a) Gesang-Editor: Analyse ---------- */
  const A = await run(p, async o => { const t0 = performance.now(); const a = await window.__vx1.analyse(o.take); const ms = Math.round(performance.now() - t0);
    for (let i = 0; i < 200 && !(typeof G2 !== 'undefined' && G2.an.get(o.take)); i++) await wait(100);
    const L = window.__vx1.list(o.take); return {n: a && a.n, how: a && a.how, ms, L, g2: !!(typeof G2 !== 'undefined' && G2.an.get(o.take))}; }, v);
  R.ana = {n: A.n, ms: A.ms, how: A.how};
  info(`#${nr} Analyse`, {stücke: A.n, ms: A.ms, how: A.how, g2: A.g2});
  ok(A.L && A.L.length >= 3, `#${nr} Stücke erkannt`, A.L && A.L.length);
  if (ann && A.L) {
    const pcs = A.L, annT = ann.map(a => ({t: a[0] * k - org, e: (a[0] + a[2]) * k - org, m: 69 + 12 * Math.log2(a[1] / 440)}));
    // je annotierter Note: nächster Stück-Anfang (t) bzw. Vokal-Beginn (vb)
    const near = (x, arr) => arr.reduce((bi, y) => (Math.abs(y - x) < Math.abs(bi - x) ? y : bi), Infinity);
    const eT = annT.map(n => (near(n.t, pcs.map(q => q.t)) - n.t) * 1000), eV = annT.map(n => (near(n.t, pcs.map(q => q.vb == null ? q.t : q.vb)) - n.t) * 1000);
    const hit = e => e.filter(x => Math.abs(x) <= 40).length;
    // Stück → Note (Präzision): Stück-Anfang ±40 ms an einer Note (oder Vokal-Beginn)
    const pHit = pcs.filter(q => annT.some(n => Math.abs(n.t - q.t) <= .04 || (q.vb != null && Math.abs(n.t - q.vb) <= .04))).length;
    // Tonhöhe: Median des Stücks gegen die Note, die den größten Teil des Stücks überdeckt
    const pe = []; for (const q of pcs) { if (q.m == null) continue; let bn = null, bo = 0; for (const n of annT) { const o = Math.min(q.end, n.e) - Math.max(q.t, n.t); if (o > bo) { bo = o; bn = n; } } if (bn && bo > .08) pe.push(100 * (q.m - bn.m)); }
    const anch = pcs.map(q => { const n = annT.find(n => q.at >= n.t - .05 && q.at <= n.e); return n ? (q.at - n.t) * 1000 : null; }).filter(x => x != null);
    R.ann = {noten: annT.length, stuecke: pcs.length, einsatzT: hit(eT), einsatzVb: hit(eV), praez: pHit, eT: eT.map(Math.round), eV: eV.map(Math.round), ton: pe.map(Math.round), tonOk: pe.filter(x => Math.abs(x) <= 50).length, ankerNachEinsatz: anch.map(Math.round)};
    info(`#${nr} Noten-Annotation`, R.ann);
    const bestE = Math.max(hit(eT), hit(eV));
    ok(bestE >= .8 * annT.length, `#${nr} Einsätze: ≥ 80 % der annotierten Noten haben einen Stück-Anfang ±40 ms`, `${hit(eT)}/${annT.length} (Anfang) · ${hit(eV)}/${annT.length} (Vokal-Beginn)`);
    ok(pHit >= .7 * pcs.length, `#${nr} Stücke: ≥ 70 % beginnen an einer annotierten Note (±40 ms)`, `${pHit}/${pcs.length}`);
    ok(pe.length && pe.filter(x => Math.abs(x) <= 50).length >= .85 * pe.length, `#${nr} Tonhöhe: ≥ 85 % der Stücke ±50 ct an der Note`, `${pe.filter(x => Math.abs(x) <= 50).length}/${pe.length}, Median |Δ| ${Math.round(med(pe.map(Math.abs)))} ct`);
  }
  /* Silben-Text: ohne Spracherkennung ehrlich leer */
  const TX = await run(p, async o => {
    const r = vx1rOpen({vox: o.id}); await wait(1200);
    const before = (window.__vx1.list(o.take) || []).map(q => q.tx).filter(Boolean).length, n0 = window.__toasts.length;
    let tapped = false; const bt = [...document.querySelectorAll('button')].find(b => b.offsetParent && /Text erkennen/.test(b.textContent || b.title || ''));
    if (bt) { bt.click(); tapped = true; } else vx1rText();
    await wait(6000);
    const after = (window.__vx1.list(o.take) || []).map(q => q.tx).filter(Boolean);
    return {open: r !== false, asr: typeof G9 !== 'undefined' && !!G9.rec, before, after: after.length, sample: after.slice(0, 6), toasts: window.__toasts.slice(n0), tapped, ly: !!(S.takes[o.take] && S.takes[o.take].ly)};
  }, v);
  R.text = TX;
  info(`#${nr} Text erkennen`, TX);
  ok(TX.before === 0 && (TX.after === 0 || TX.asr), `#${nr} Silben ohne Spracherkennung ehrlich leer (kein erfundener Text)`, {vorher: TX.before, nachher: TX.after, hinweis: TX.toasts});
  await run(p, () => { if (typeof closeRoll === 'function') closeRoll(); closePop(); });
  await p.screenshot({path: path.join(fotos, 'rv1-nach-text-' + nr + '.png')});
  /* ---------- Quantisieren 1/8: Knacken an den Schnitten ---------- */
  const Q = await run(p, async o => {
    const u0 = UNDO.length, t0 = performance.now(); await window.__vx1.quant(o.take, {grid: '1/8', strength: 1});
    for (let i = 0; i < 1200 && !window.__vx1.ready(o.take); i++) { wpPlay(o.take); await wait(25); }
    const ms = Math.round(performance.now() - t0), c = WP.cache.get(o.take), y = c && c.buf.getChannelData(0), x = wpBase(o.take).getChannelData(0);
    return {du: UNDO.length - u0, ms, L: window.__vx1.list(o.take), y: y && b64(y), x: b64(x), bid: wpBid(wpBase(o.take)), sr: wpBase(o.take).sampleRate, last: WP.last, warp: window.__vx1.warp(o.take), lock: VX1R.LOCK};
  }, v);
  ok(Q.du === 1 && Q.y, `#${nr} Quantisieren 1/8 (alle): ein ↶, gerendert`, {du: Q.du, ms: Q.ms});
  if (Q.y) {
    const y = f32(Q.y), x = f32(Q.x), sr = Q.sr, L = Q.L, Ks = [], Js = [];
    for (let i = 1; i < L.length; i++) { const q = L[i], so = Math.round(q.dst * sr), si = Math.round(q.t * sr), sp = Math.round((q.dst - (L[i - 1].dst - L[i - 1].t)) * sr);
      const dO = d2m(y, sr, so - Math.round(.002 * sr), 4), dS = Math.max(d2m(x, sr, si, 20), d2m(x, sr, sp, 20)), jO = jump(y, sr, so, 4), jS = Math.max(jump(x, sr, si, 20), jump(x, sr, sp, 20));
      const dT = d2m(x, sr, si - Math.round(.04 * sr), 20), jT = jump(x, sr, si - Math.round(.04 * sr), 20);   // VX2: Ausklang des Vorgängers (letzte 60 ms), spielt gedehnt bis an den Schnitt
      Ks.push({i, dO: +dO.toFixed(4), dS: +dS.toFixed(4), jO: +jO.toFixed(4), jS: +jS.toFixed(4), dT: +Math.max(dS, dT).toFixed(4), jT: +Math.max(jS, jT).toFixed(4), sh: Math.round((q.dst - q.t) * 1000)}); }
    const badK = Ks.filter(z => z.dO > 1.5 * z.dS + .002), badJ = Ks.filter(z => z.jO > 1.5 * z.jS + .002);
    const anyQ = Ks.map(z => z.sh), qe = L.map(q => { const st = 60 / Q.warp.bpm / 2, t0 = Q.warp.t0; return Math.abs(((q.da - t0) / st) - Math.round((q.da - t0) / st)) * st * 1000; });
    R.quant = {schnitte: Ks.length, d2Max: Math.max(...Ks.map(z => z.dO)), d2QuelleMax: Math.max(...Ks.map(z => z.dS)), d2Ratio: +Math.max(...Ks.map(z => z.dO / Math.max(1e-4, z.dS))).toFixed(2), knackBad: badK.length, sprungMax: Math.max(...Ks.map(z => z.jO)), sprungBad: badJ.length, verschMs: [Math.min(...anyQ), Math.max(...anyQ)], ankerRasterMaxMs: +Math.max(...qe).toFixed(2), renderMs: Q.ms, how: Q.last && Q.last.how};
    info(`#${nr} Quantisieren`, R.quant);
    if (badK.length || badJ.length) info(`#${nr} auffällige Schnitte`, badK.concat(badJ).slice(0, 8));
    info(`#${nr} VX2-Bezug mit Ausklang des Vorgängers (gedehnt bis an den Schnitt)`, {knackBad: Ks.filter(z => z.dO > 1.5 * z.dT + .002).length, sprungBad: Ks.filter(z => z.jO > 1.5 * z.jT + .002).length});
    if (process.env.RV1_DUMP) { fs.writeFileSync(path.join(here, 'dbg', `q-${nr}.json`), JSON.stringify({sr, L, warp: Q.warp, Ks})); fs.writeFileSync(path.join(here, 'dbg', `qx-${nr}.f32`), Buffer.from(x.buffer, x.byteOffset, x.byteLength)); fs.writeFileSync(path.join(here, 'dbg', `qy-${nr}.f32`), Buffer.from(y.buffer, y.byteOffset, y.byteLength)); }   // VX2: Quantisier-Puffer zur Diagnose
    ok(!badK.length, `#${nr} Quantisieren: kein Knacken an den Schnitten (2. Ableitung ≤ 1,5× Quelle an beiden Nahtseiten)`, `${Ks.length} Schnitte, max ${R.quant.d2Max} (Quelle ${R.quant.d2QuelleMax}), Verhältnis max ${R.quant.d2Ratio}, auffällig ${badK.length}`);
    ok(!badJ.length, `#${nr} Quantisieren: max. Sprung an den Schnitten ≤ 1,5× Sprung der Quelle`, `max ${R.quant.sprungMax}, auffällig ${badJ.length}`);
    { const LK = Q.lock, off = L.map((q, i) => ({i, e: qe[i], push: i > 0 && Math.abs(q.dst - (L[i - 1].dst + L[i - 1].an + LK + .01)) < .002, col: (() => { const st = 60 / Q.warp.bpm / 2, g = Math.round((q.at - Q.warp.t0) / st); return [i - 1, i + 1].some(j => L[j] && Math.abs(L[j].da - (Q.warp.t0 + g * st)) < .002); })()})).filter(z => z.e > 2); R.quant.rasterOk = L.length - off.length; R.quant.gesperrt = off.filter(z => z.push).length; R.quant.kollision = off.filter(z => !z.push && z.col).length;
      ok(off.every(z => z.push || z.col), `#${nr} Anker-Ziele auf dem 1/8-Raster (sonst Vorgänger-Sperre oder Nachbar auf derselben Linie)`, `${L.length - off.length}/${L.length} auf dem Raster, ${off.filter(z => z.push).length} gesperrt, ${off.filter(z => !z.push && z.col).length} Linie besetzt, frei daneben ${off.filter(z => !z.push && !z.col).length}`); }
    /* ---------- Verschieben links/rechts ---------- */
    // Stück mit Platz davor UND messbarem Vokal des Vorgängers (Anker des Vorgängers ≥ 0,2 s vor dem Stück, sonst ist das Dehn-Fenster leer)
    const ord = []; for (let i = Math.floor(L.length / 2); i < L.length - 1; i++) ord.push(i); for (let i = 1; i < Math.floor(L.length / 2); i++) ord.push(i);
    let kk = ord.find(i => L[i].dst - L[i - 1].dst > .35 && L[i + 1].dst - L[i].dst > .3 && L[i].t - L[i - 1].at > .2); if (kk == null) kk = ord.find(i => L[i].dst - L[i - 1].dst > .2 && L[i + 1].dst - L[i].dst > .2 && L[i].t - L[i - 1].at > .2); if (kk == null) kk = ord.find(i => L[i].dst - L[i - 1].dst > .35 && L[i + 1].dst - L[i].dst > .3); if (kk == null) kk = -1; if (process.env.RV1_K) kk = +process.env.RV1_K;
    if (kk < 0) for (let i = 1; i < L.length - 1; i++) if (L[i].dst - L[i - 1].dst > .3) { kk = i; break; }
    for (const dir of [-1, 1]) {
      // rechts: mehr Platz als in der Quelle → Vorgänger wird gedehnt (Platz = Abstand zum Anker des Vorgängers, dessen eigene Verschiebung zählt mit)
      const D = dir < 0 ? -.06 : Math.max(.06, (L[kk].t - L[kk - 1].at) - (L[kk].dst - L[kk - 1].da) + .06);
      const M = await run(p, async o => {
        const u0 = UNDO.length, L0 = window.__vx1.list(o.take), q = L0[o.k]; await window.__vx1.move(o.take, o.k, q.da + o.D);
        for (let i = 0; i < 1200 && !window.__vx1.ready(o.take); i++) { wpPlay(o.take); await wait(25); }
        const c = WP.cache.get(o.take), y = c && c.buf.getChannelData(0), L1 = window.__vx1.list(o.take), du = UNDO.length - u0, yb = y && b64(y);   // Puffer JETZT festhalten (vor ↶)
        const w1 = JSON.stringify(window.__vx1.warp(o.take)), bid1 = wpBid(wpBase(o.take)); undo(); const w0 = JSON.stringify(window.__vx1.warp(o.take));
        for (let i = 0; i < 1200 && !window.__vx1.ready(o.take); i++) { wpPlay(o.take); await wait(25); }
        const cu = WP.cache.get(o.take), yu = cu && cu.buf.getChannelData(0);   // nach ↶: dieselbe Quelle wie beim Verschieben = Vergleich
        return {du, L1, y: yb, yU: yu && b64(yu), undone: w0 !== w1 && w0 === o.w0, w1, bidQ: o.bidQ, bid1, bidU: wpBid(wpBase(o.take))};
      }, {take: v.take, k: kk, D, w0: JSON.stringify(Q.warp), bidQ: Q.bid});
      if (process.env.RV1_DUMP) { fs.writeFileSync(path.join(here, 'dbg', `move-${nr}-${dir < 0 ? 'l' : 'r'}.json`), JSON.stringify({sr, k: kk, w0: Q.warp, w1: JSON.parse(M.w1), L, L1: M.L1})); fs.writeFileSync(path.join(here, 'dbg', `x-${nr}.f32`), Buffer.from(x.buffer, x.byteOffset, x.byteLength)); fs.writeFileSync(path.join(here, 'dbg', `y-${nr}-${dir < 0 ? 'l' : 'r'}.f32`), Buffer.from(f32(M.y).buffer)); fs.writeFileSync(path.join(here, 'dbg', `y-${nr}-q.f32`), Buffer.from(y.buffer, y.byteOffset, y.byteLength)); }
      const ya = f32(M.y), a = L[kk - 1], q0 = L[kk], q1 = M.L1[kk], seamN = Math.round(q1.dst * sr), seamO = Math.round(q0.dst * sr);
      { const mv = M.L1.map((z, i) => ({i, d: Math.round((z.dst - L[i].dst) * 1e6) / 1e3, an: Math.round(((z.an || 0) - (L[i].an || 0)) * 1e6) / 1e3})).filter(z => z.i !== kk && (z.d || z.an)); info(`#${nr} Stück ${kk} ${dir < 0 ? 'links' : 'rechts'}: andere Stücke verändert`, mv.slice(0, 8)); }
      const kO = d2m(ya, sr, seamN - Math.round(.002 * sr), 4), kS = Math.max(d2m(x, sr, Math.round(q0.t * sr), 20), d2m(x, sr, Math.round((q1.dst - (a.dst - a.t)) * sr), 20));
      const yRef = M.yU ? f32(M.yU) : y;   // Bezug: Fassung nach ↶ (gleiche Quelle; die Quelle kann seit dem Quantisieren gewechselt haben, z. B. Tonhöhen-Fassung fertig)
      const r = {k: kk, D: Math.round(D * 1000), du: M.du, undo: M.undone, quelle: M.bidQ === M.bid1 ? 'gleich' : 'gewechselt', undoBitgleich: M.bidQ === M.bidU && M.yU ? M.yU === Q.y : null, d2: +kO.toFixed(4), d2Q: +kS.toFixed(4), sprung: +jump(ya, sr, seamN, 4).toFixed(4), sprungQ: +jump(x, sr, Math.round(q0.t * sr), 20).toFixed(4)};
      if (dir < 0) {   // Vorgänger bitgleich bis 31 ms vor dem neuen Schnitt (nicht gestaucht)
        const A0 = Math.round(a.dst * sr), B0 = seamN - Math.round(.031 * sr); let md = 0, mi = A0; for (let i = A0; i < B0; i++) { const dd = Math.abs(ya[i] - yRef[i]); if (dd > md) { md = dd; mi = i; } } r.diffBeiMs = Math.round((mi - A0) / sr * 1000); r.diffVorSchnittMs = Math.round((seamN - mi) / sr * 1000); r.prevSh = Math.round((a.dst - a.t) * 1000);
        r.ausklangBitgleichMs = Math.round((B0 - A0) / sr * 1000); r.ausklangMaxDiff = md;
        // Ausklang-Pegel kurz vor der Ausblende gegen die Quelle: nicht gestaucht = gleiche Hülle
        ok(M.du === 1 && md < 1e-6 && kO <= 1.5 * kS + .002 && M.undone, `#${nr} Stück ${kk} 60 ms nach links: Ausklang des Vorgängers bitgleich (${r.ausklangBitgleichMs} ms), kein Knacken, ein ↶`, r);
      } else {        // rechts: Vorgänger-Vokal gedehnt, Tonhöhe bleibt
        const s0 = a.at + .03, s1 = q0.t - .01, d0 = a.da + .03, d1 = q1.dst - .01, ratio = (d1 - d0) / Math.max(1e-6, s1 - s0);
        const fS = med(yin(x.subarray(Math.round(s0 * sr), Math.round(s1 * sr)), sr).f.filter(z => z > 0)), fO = med(yin(ya.subarray(Math.round(d0 * sr), Math.round(d1 * sr)), sr).f.filter(z => z > 0));
        r.dehnung = +ratio.toFixed(3); r.f0Quelle = +fS.toFixed(1); r.f0Aus = +fO.toFixed(1); r.ct = isFinite(fS) && isFinite(fO) ? Math.round(cents(fO, fS)) : null;
        ok(M.du === 1 && r.dehnung > 1 && r.dehnung <= 1.55 && (r.ct == null || Math.abs(r.ct) <= 25) && kO <= 1.5 * kS + .002 && M.undone, `#${nr} Stück ${kk} 60 ms nach rechts: Vorgänger-Vokal gedehnt (≤ 1,5×), Tonhöhe gleich, kein Knacken, ein ↶`, r);
      }
      (R.move = R.move || []).push(r);
    }
  }
  /* ---------- (c) Chor aus echtem Gesang ---------- */
  if (nr === ONLY[0]) {
    await run(p, async o => { undo(); for (let i = 0; i < 400 && !window.__vx1.ready(o.take); i++) { wpPlay(o.take); await wait(25); } }, v);   // Quantisieren zurück: Chor aus der Aufnahme wie gesungen
    const CH = await run(p, async o => {
      const r = {vox: o.id}, u0 = UNDO.length; closePop(); const t0 = performance.now();
      const done = await g6pApplyStyle(r, 'pop'); const a = tkRef(r).a, c = a.chor;
      let ready = false; for (let k = 0; k < 1200 && !ready; k++) { ready = g6pReady(a); if (!ready) await wait(250); }
      return {done, ready, ms: Math.round(performance.now() - t0), u: UNDO.length - u0, label: UNDO[UNDO.length - 1].label, echt: c && c.grp && c.grp.echt, voices: c ? c.voices.map(v => ({rule: v.rule, lane: v.lane})) : []};
    }, v);
    ok(CH.done && CH.ready && CH.voices.length >= 2 && CH.echt === 1 && CH.u === 1, `#${nr} Chor (Stil Pop) aus echtem Gesang: Stimmen gerechnet, echt, ein ↶`, CH);
    if (CH.ready) {
      const grab = o => run(p, async o => {
        const a = tkRef({vox: o.id}).a, c = a.chor; c.grp.echt = o.echt ? 1 : 0;
        let ready = false; for (let k = 0; k < 1200 && !ready; k++) { ready = g6pBufsReady(a); if (!ready) { g6pPrefetch(a, 1); await wait(250); } }
        const out = [];
        for (let vi = 0; vi < c.voices.length; vi++) { const v = c.voices[vi], sp = g6pSpec(a, v), cps = g6pCopies(v);
          for (let k = 0; k < cps.length; k++) { const h = g6pBuf(a, v, k), pl = sp.plans[sp.idx[k]]; out.push({vi, k, rule: v.rule, cms: cps[k].ms, x: pl && pl.chr2 ? pl.chr2 : null, t0: h && h.t0, sr: h && h.buf.sampleRate, y: h ? b64(h.buf.getChannelData(0)) : null}); } }
        c.grp.echt = 1; return {ready, out};
      }, o);
      const E0 = await grab({id: v.id, echt: 1}), N = await grab({id: v.id, echt: 0}), E = await grab({id: v.id, echt: 1});
      info(`#${nr} Chor: Kopie mit „echt“ vor/nach der Kopie ohne gleich (Rechnung stabil)`, E.out.map((z, i) => z.rule + '/' + (z.k + 1) + ':' + (z.y === E0.out[i].y ? 'gleich' : 'ANDERS')).join(' '));
      const SR = E.out[0].sr;
      if (process.env.RV1_DUMP) E.out.forEach((z, i) => { if (z.y && N.out[i].y) { fs.writeFileSync(path.join(here, 'dbg', `chor-${nr}-${z.rule}-${z.k + 1}-E.f32`), Buffer.from(z.y, 'base64')); fs.writeFileSync(path.join(here, 'dbg', `chor-${nr}-${z.rule}-${z.k + 1}-N.f32`), Buffer.from(N.out[i].y, 'base64')); } });
      const envOf = y => { const D = 11, n = Math.floor(y.length / D), e = new Float32Array(n), a = new Float32Array(n); let acc = 0; const W = 20; for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < D; j++) s += Math.abs(y[i * D + j]); a[i] = s / D; } for (let i = 0; i < n; i++) { acc += a[i]; if (i >= W) acc -= a[i - W]; e[i] = acc / W; } return e; };
      const lagMs = (yE, yN) => { const a = envOf(yN), bq = envOf(yE), D = 11, maxL = Math.round(.06 * SR / D); let best = 0, bv = -1; for (let L = 0; L <= maxL; L++) { let s = 0, sa = 0, sb = 0; for (let i = 0; i + L < bq.length && i < a.length; i += 2) { s += a[i] * bq[i + L]; sa += a[i] * a[i]; sb += bq[i + L] * bq[i + L]; } const v2 = s / Math.sqrt(sa * sb + 1e-20); if (v2 > bv) { bv = v2; best = L; } } return best * D / SR * 1000; };
      // Versatz robust: Median der Versätze je 1-s-Fenster (nur hörbare Fenster) – ein paar Fenster, in denen sich die Hülle mit „echt“ ändert
      // (Tonhöhen-Schwanken an Noten-Übergängen der Terz), ziehen die Gesamt-Korrelation sonst um 20–30 ms weg (Diagnose dbg/chor-lag.mjs)
      const lagMed = (yE, yN) => { const D = 48 * SR / 48000 | 0, W = SR, L1 = Math.round(.06 * SR / D), env = (y, a) => { const n = Math.floor(W / D), e = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < D; j++) s += Math.abs(y[a + i * D + j] || 0); e[i] = s; } return e; }, ls = [];
        for (let a = 0; a + W * 1.2 < Math.min(yE.length, yN.length); a += W) { let rms = 0; for (let i = a; i < a + W; i++) rms += yN[i] * yN[i]; if (Math.sqrt(rms / W) < .005) continue; const en = env(yN, a); let best = 0, bv = -1;
          for (let L = 0; L <= L1; L++) { const ee = env(yE, a + L * D); let q = 0, sa = 0, sb = 0; for (let i = 0; i < en.length; i++) { q += en[i] * ee[i]; sa += en[i] ** 2; sb += ee[i] ** 2; } const v = q / Math.sqrt(sa * sb + 1e-20); if (v > bv) { bv = v; best = L; } } ls.push(best * D / SR * 1000); }
        return ls.length ? med(ls) : lagMs(yE, yN); };
      const fftR = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bb = n >> 1; for (; j & bb; bb >>= 1) j ^= bb; j ^= bb; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } } for (let len = 2; len <= n; len <<= 1) { const an = -2 * Math.PI / len, wr = Math.cos(an), wi = Math.sin(an); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k2 = 0; k2 < len / 2; k2++) { const ur = re[i + k2], ui = im[i + k2], vr = re[i + k2 + len / 2] * cr - im[i + k2 + len / 2] * ci, vi = re[i + k2 + len / 2] * ci + im[i + k2 + len / 2] * cr; re[i + k2] = ur + vr; im[i + k2] = ui + vi; re[i + k2 + len / 2] = ur - vr; im[i + k2 + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
      const centroid = (y, c2) => { const Nf = 2048, re = new Float64Array(Nf), im = new Float64Array(Nf); for (let j = 0; j < Nf; j++) { const q2 = c2 - Nf / 2 + j; re[j] = (q2 >= 0 && q2 < y.length ? y[q2] : 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * (j + .5) / Nf)); } fftR(re, im); const bin = SR / Nf; let s = 0, w = 0; for (let k2 = Math.round(300 / bin); k2 < Math.round(3500 / bin); k2++) { const a2 = Math.hypot(re[k2], im[k2]); s += a2 * k2; w += a2; } return s / Math.max(1e-12, w); };
      // Knackser in der Kopie: Knack-Index > 8 und > 3× an derselben Stelle der Kopie ohne „echt“ (gleiche Tonhöhen-Kette, nur echt anders)
      const scan = (y, ref, lagS) => { const W = Math.round(SR / 1000), hits = []; for (let c2 = 30 * W; c2 < y.length - 30 * W; c2 += 3 * W) { const k2 = d2m(y, SR, c2, 1.5); if (k2 > .004) { const kr = d2m(ref, SR, Math.max(30 * W, c2 - lagS), 8); if (k2 > 2 * kr + .003) hits.push({t: +(c2 / SR).toFixed(3), d2: +k2.toFixed(4), ref: +kr.toFixed(4)}); } } return hits; };
      const Rr = [], AL = [];
      for (let i = 0; i < E.out.length; i++) {
        const e = E.out[i], n = N.out[i]; if (!e.y || !n.y) continue; const yE = f32(e.y), yN = f32(n.y), lagG = lagMs(yE, yN), lag = lagMed(yE, yN), d = Math.round(lag * SR / 1000);
        const yA = yE.subarray(d), PE = yin(yA, SR).f, PN = yin(yN, SR).f, dc = []; for (let k2 = 0; k2 < Math.min(PE.length, PN.length); k2++) if (PE[k2] > 0 && PN[k2] > 0) { const c2 = cents(PE[k2], PN[k2]); if (Math.abs(c2) < 60) dc.push(c2); }
        const mu = dc.reduce((s, z) => s + z, 0) / Math.max(1, dc.length), sd = Math.sqrt(dc.reduce((s, z) => s + (z - mu) ** 2, 0) / Math.max(1, dc.length));
        const kn = scan(yE, yN, d);
        AL.push({vi: e.vi, k: e.k, yA, yN, PN});
        Rr.push({v: e.vi + 1, k: e.k + 1, rule: e.rule, plan: e.x, cms: e.cms, lag: +lag.toFixed(1), lagGesamt: +lagG.toFixed(1), total: +(lag + e.cms).toFixed(1), sd: +sd.toFixed(1), knack: kn.length, knackBsp: kn.slice(0, 3)});
      }
      const FD = [];
      for (const vi of [...new Set(AL.map(z => z.vi))]) { const [a2, c2] = AL.filter(z => z.vi === vi); if (!a2 || !c2) continue; const fe = [], fn = [];
        for (let s = 4096; s + 4096 < Math.min(a2.yA.length, c2.yA.length); s += 2205) { const q2 = Math.round(s / (0.01 * SR)); if (!(a2.PN[q2] > 0)) continue;
          const x1 = centroid(a2.yA, s), x2 = centroid(c2.yA, s), n1 = centroid(a2.yN, s), n2 = centroid(c2.yN, s); if (isFinite(x1) && isFinite(x2)) fe.push(100 * (x1 - x2) / x2); if (isFinite(n1) && isFinite(n2)) fn.push(100 * (n1 - n2) / n2); }
        const m = q2 => q2.reduce((s, z) => s + z, 0) / Math.max(1, q2.length), r1 = Rr.find(z => z.v === vi + 1 && z.k === 1), r2 = Rr.find(z => z.v === vi + 1 && z.k === 2);
        if (r1 && r2) FD.push({v: vi + 1, rule: r1.rule, f: [r1.plan && r1.plan.f, r2.plan && r2.plan.f], echt: +m(fe).toFixed(2), ohne: +m(fn).toFixed(2), n: fe.length}); }
      R.chor = {ms: CH.ms, kopien: Rr, formant: FD};
      for (const z of Rr) info(`#${nr} Chor Stimme ${z.v}/Kopie ${z.k} (${z.rule})`, `Plan ${JSON.stringify(z.plan)} · Versatz ${z.lag} ms (gesamt ${z.lagGesamt}) (+${z.cms} = ${z.total} ms) · σ ${z.sd} ct · Knackser ${z.knack} ${JSON.stringify(z.knackBsp)}`);
      for (const z of FD) info(`#${nr} Chor Stimme ${z.v} (${z.rule}) Formant Kopie 1 gegen 2`, `Faktor ${z.f.join('/')} · echt ${z.echt} % · ohne echt ${z.ohne} % (${z.n} Rahmen)`);
      ok(Rr.length && Rr.every(z => z.plan && Math.abs(z.lag - z.plan.ms) <= 4), `#${nr} Chor: Versatz gemessen = Plan (±4 ms)`, Rr.map(z => z.lag + '/' + (z.plan && z.plan.ms)).join(' '));
      ok(Rr.every(z => z.total >= 9.5 && z.total <= 40.5), `#${nr} Chor: Versatz gegen den Lead 10–40 ms`, Rr.map(z => z.total).join(' '));
      ok(Rr.every(z => z.sd >= 1 && z.sd <= 8), `#${nr} Chor: Schwankung je Kopie σ 1–8 ct`, Rr.map(z => z.sd).join(' '));
      ok(FD.length && FD.every(z => Math.sign(z.echt) === Math.sign(z.f[0] - z.f[1]) && Math.abs(z.echt) >= .8), `#${nr} Chor: Formant-Unterschied der Sänger einer Stimme in Plan-Richtung (≥ 0,8 %)`, FD.map(z => z.rule + ' ' + z.echt + '% (ohne ' + z.ohne + '%, Plan ' + z.f.join('/') + ')').join(' · '));
      ok(Rr.every(z => z.knack === 0), `#${nr} Chor: keine Knackser in den Kopien (gegen dieselbe Kopie ohne „echt“)`, Rr.map(z => z.knack).join(' '));
    }
  }
  await p.close();
  console.log(`INFO #${nr} fertig (${el()})`);
}
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 3).join(' | '));
await b.close();
if (outJ) fs.writeFileSync(outJ, JSON.stringify(RES, null, 1));
console.log((bad ? 'FEHLER ' + bad + '/' + all : 'ALLE OK ' + all) + ' (' + el() + ')');
