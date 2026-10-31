// G267 unabhängige Prüfung G1 (nicht vom Bauenden): 97 BPM, 1/16- und 1/8-Raster, ungerade Abstände, echte Tipps (Touch) auf die
// Chips, Stärke per Maus-Klick auf den Regler, Animation ≤ 250 ms, Meldung, Pixel, Undo über mehrere Schritte (Marken + Klang je Schritt),
// Knacken mit Legato (Schnitte mitten im Ton). Ausgabe: Zeilen ✓/✗ mit Zahlen.
import {launch, openG, sleep, toI16, recStart, recStop, sylOnsets, heardShifts, mKlickR, SR, deq, OUTG} from './n5-g-h.mjs';
import {legato} from './gs7-v3-vs5a-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
import crypto from 'crypto';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const BPM = 97, spb = 60 / BPM, s16 = spb / 4;
const OFF = [0, 37, -23, 51, -58, 13, -41, 0, 59, -7, 29, -53];          // ms, ungerade, alle < 50 % von 1/16 (77 ms)
const notes = OFF.map((o, k) => ({t: (4 + 2 * k) * s16 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 3 === 1}));
const LEN = 2 * 4 * spb;                                                   // 2 Takte
const x = voice(SR, LEN, notes, {seed: 11}).x;
{ let sd = 7; for (let i = 0; i < x.length; i++) { sd = (sd * 16807) % 2147483647; x[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const rawOn = sylOnsets(x, SR);
const fmt = a => a.map(v => v.toFixed(1)).join(' ');
const maxErr = (g, f) => Math.max(...g.map((v, k) => Math.abs(v - f(k))));
const hash = a => crypto.createHash('sha1').update(Buffer.from(Float32Array.from(a).buffer)).digest('hex').slice(0, 12);
const br = await launch(null);
const H = await openG(br, {viewport: {width: 390, height: 844}, touch: true, mobile: true}), p = H.p;
console.log('App', await p.evaluate(() => SYNQUENZER.version), 'BPM', BPM, 'Silben', rawOn.length, '(erwartet ' + OFF.length + ')');
ok(rawOn.length === OFF.length, 'Testsignal: Silben erkannt ' + rawOn.length);
await p.evaluate(b => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(b); SYNQUENZER.setMetronome(false); }, BPM); await sleep(300);
await p.evaluate(() => SYNQUENZER.play()); await sleep(300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
const id = r1.id, R = {t: r1.track, s: 1};
async function heard() {
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  await recStart(p);
  await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); });
  await sleep(Math.round(LEN * 1000) + 600); await p.evaluate(() => SYNQUENZER.stop());
  const r = await recStop(p), y = Float32Array.from(r.y), on = sylOnsets(y, r.sr);
  const hs = heardShifts(x, rawOn, y, r.sr, on[0]);
  return {grid: hs.map((h, k) => OFF[k] + h.ms), rho: Math.min(...hs.map(h => h.rho))};
}
const played = async () => { const d = (await p.evaluate(id => SYNQUENZER.wpPlayed(id), id)).data; return {h: hash(d), n: d.length}; };
const HIST = new Map();
const snap = async () => { const I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), n = await p.evaluate(() => SYNQUENZER.undoInfo().n); const s = {n, marks: I.marks, warp: I.warp, snd: await played()}; return s; };
const snapR = async () => { const s = await snap(); HIST.set(s.n, s); return s; };

const h0 = await heard();
console.log('  Original gehört gegen 1/16-Raster (ms):', fmt(h0.grid));
ok(maxErr(h0.grid, k => OFF[k]) <= 3, 'Messung kalibriert: Original wie gesungen ±3 ms (max ' + maxErr(h0.grid, k => OFF[k]).toFixed(1) + ' ms, ρ ≥ ' + h0.rho.toFixed(2) + ')');
const S0 = await snapR(); const raw = await p.evaluate(id => SYNQUENZER.tkBufRange(id), id);

// Editor öffnen, Marken suchen
await p.evaluate(R => SYNQUENZER.wpOpen(R), R); await sleep(400); await p.evaluate(id => SYNQUENZER.wpDetect(id), id); await sleep(300);
const I0 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
{ const nm = (I0.marks || (I0.det && (I0.det.marks || I0.det)) || []).length; ok(nm === OFF.length, 'Marken erkannt: ' + nm + ' (gespeichert: ' + (I0.marks ? 'ja' : 'nein') + ')'); }
// Animation aufzeichnen + echter Touch-Tipp auf [1/16]
const recAnim = () => p.evaluate(() => { window.__fr = []; const t0 = performance.now(); const f = () => { const g = SYNQUENZER.wpGeom(); if (g) window.__fr.push({t: performance.now() - t0, m: g.marks.slice(), a: g.anim}); if (performance.now() - t0 < 1500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
const animDur = async () => { const fr = await p.evaluate(() => window.__fr); const fin = fr[fr.length - 1].m;
  const first = fr.findIndex((f, i) => i && f.m.some((v, k) => Math.abs(v - fr[0].m[k]) > 0.01)); if (first < 0) return {dur: null, n: 0};
  let last = first; for (let i = first; i < fr.length; i++) if (fr[i].m.some((v, k) => Math.abs(v - fin[k]) > 0.01)) last = i + 1;
  return {dur: fr[Math.min(last, fr.length - 1)].t - fr[first - 1].t, n: last - first, frames: fr.length}; };
// Pixel: weiße Marken-Spalten gegen Rasterlinien des aktuellen Rasters (step in Schlägen)
const pix = stepB => p.evaluate(([id, stepB]) => {
  const cv = document.querySelector('#wpSheet canvas'), g = cv.getContext('2d'), dpr = cv.width / cv.clientWidth, Wp = cv.clientWidth, Hp = cv.clientHeight;
  const I = SYNQUENZER.wpInfo(id), Gm = SYNQUENZER.wpGeom(), V = Gm.view, t0 = I.warp ? I.warp.t0 : I.t0, step = stepB * 60 / I.warp.bpm;
  const lines = []; for (let t = t0 + Math.ceil((V.a - t0) / step) * step; t < V.a + V.W; t += step) lines.push(Math.round((t - V.a) / V.W * Wp) + 0.5);
  const y = Math.round(Hp * 0.15 * dpr), row = g.getImageData(0, y, cv.width, 1).data, cols = [];
  for (let i = 0; i < cv.width; i++) if (row[4 * i] > 150 && row[4 * i + 1] > 150 && row[4 * i + 2] > 150) cols.push(i / dpr);
  const cl = []; for (const c of cols) { const L = cl[cl.length - 1]; if (L && c - L.b <= 1.5) L.b = c; else cl.push({a: c, b: c}); }
  const near = v => Math.min(...lines.map(q => Math.abs(q - v)));
  // gezeichnete Rasterlinie unter jeder Marke: Pixel 1 px neben der weißen Spalte in der Höhe 45 % muss Linienfarbe haben? (nur Abstand messen)
  const white = cl.map(c => (c.a + c.b) / 2).filter(v => v > 3 && v < Wp - 3);
  return {n: white.length, d: white.map(near), toast: document.getElementById('toast').textContent, moved: SYNQUENZER.wpMoved ? SYNQUENZER.wpMoved(id) : -1, marksN: (I.marks || []).length};
}, [id, stepB]);

await recAnim();
await p.tap('#wpSheet .wpchips button[data-v="1/16"]'); await sleep(1600);
const A1 = await animDur(); const P1 = await pix(0.25), S1 = await snapR();
const realMoved = S1.warp.map.src.slice(1, -1).map((s, k) => Math.abs(s - S1.warp.map.dst[k + 1]) * 1000);
ok(A1.dur != null && A1.dur <= 250 && A1.n >= 3, `G1-02 Touch-Tipp [1/16] @97: Animation ${A1.dur && A1.dur.toFixed(0)} ms (≤ 250), ${A1.n} Zwischenbilder`);
ok(P1.n === OFF.length && P1.d.every(d => d <= 1.01), `G1-02 Pixel @97/1/16: ${P1.d.filter(d => d <= 1.01).length}/${P1.n} weiße Marken ≤ 1 px auf der Linie (max ${Math.max(...P1.d).toFixed(2)} px)`);
ok(P1.toast === P1.moved + ' Einsätze gerückt', `G1-02 Meldung „${P1.toast}“ (Karte: ${P1.moved}); Wege je Marke (ms): ${fmt(realMoved)}`);
const nReal = realMoved.filter(v => v >= 1).length;
console.log(`  Hinweis: davon ≥ 1 ms gerückt: ${nReal} (gesungen auf dem Raster: ${OFF.filter(o => o === 0).length} Silben)`);
ok(S1.warp.strength === 1 && S1.warp.res === '1/16', 'Standard nach Tipp: ' + S1.warp.mode + ' ' + S1.warp.strength * 100 + ' % ' + S1.warp.res);
const h1 = await heard();
console.log('  [1/16] 100 % gehört (ms):', fmt(h1.grid));
ok(maxErr(h1.grid, () => 0) <= 5, 'G1-01 @97 BPM, 1/16, 100 %: gehört ±5 ms auf dem Raster – max ' + maxErr(h1.grid, () => 0).toFixed(1) + ' ms');

// Stärke 50 % per Maus-Klick in die Mitte des Reglers (echtes input/change)
const sl = await p.evaluate(() => { const i = document.querySelectorAll('#wpSheet .qrow input[type=range]')[0], r = i.getBoundingClientRect(); return {x: r.left, y: r.top + r.height / 2, w: r.width}; });
await recAnim();
await p.mouse.click(sl.x + sl.w / 2, sl.y); await sleep(1600);
let S2 = await snapR();
if (S2.warp.strength !== 0.5) {      // Thumb-Breite: nachstellen mit Tastatur
  const v = Math.round(S2.warp.strength * 100);
  for (let i = 0; i < Math.abs(v - 50); i++) await p.keyboard.press(v > 50 ? 'ArrowLeft' : 'ArrowRight');
  await p.evaluate(() => { const i = document.querySelectorAll('#wpSheet .qrow input[type=range]')[0]; i.dispatchEvent(new Event('change')); }); await sleep(900); S2 = await snapR();
  console.log('  (Klick ergab ' + v + ' %, per Pfeiltasten auf ' + S2.warp.strength * 100 + ' %)');
}
const A2 = await animDur(), P2 = await pix(0.25);
ok(A2.dur != null && A2.dur <= 250, `G1-02 Stärke 50 % (Regler): Marken gleiten ${A2.dur && A2.dur.toFixed(0)} ms; Meldung „${P2.toast}“ (Karte ${P2.moved})`);
const h2 = await heard();
console.log('  [1/16] 50 % gehört (ms):', fmt(h2.grid));
ok(S2.warp.strength === 0.5 && maxErr(h2.grid, k => OFF[k] / 2) <= 5, 'G1-01 @97, 1/16, 50 %: halber Abstand ±5 ms – max ' + maxErr(h2.grid, k => OFF[k] / 2).toFixed(1) + ' ms');

// Modus Scheiben (Touch auf Segment), Stärke bleibt 50 %
await p.tap('#wpSheet .wpmode button[data-m="slice"]'); await sleep(900);
const S3 = await snapR();
const h3 = await heard();
ok(S3.warp.mode === 'slice' && maxErr(h3.grid, k => OFF[k] / 2) <= 5, 'G1-01 @97, Scheiben 50 %: halber Abstand ±5 ms – max ' + maxErr(h3.grid, k => OFF[k] / 2).toFixed(1) + ' ms');
// Raster 1/8 (Touch) – Stärke bleibt 50 %? dann Regler 100 % per Tastatur
await p.tap('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(900);
await p.evaluate(() => { const i = document.querySelectorAll('#wpSheet .qrow input[type=range]')[0]; i.value = 100; i.dispatchEvent(new Event('input')); i.dispatchEvent(new Event('change')); }); await sleep(900);
const S4 = await snapR(); const P4 = await pix(0.5);
// 1/8 bei 97: Silben liegen auf geraden 1/16 = auf 1/8-Linien (4 + 2k sechzehntel)
const h4 = await heard();
console.log('  [1/8] Scheiben 100 % gehört (ms):', fmt(h4.grid));
ok(S4.warp.res === '1/8' && S4.warp.strength === 1 && maxErr(h4.grid, () => 0) <= 5, 'G1-01 @97, 1/8, Scheiben 100 %: ±5 ms – max ' + maxErr(h4.grid, () => 0).toFixed(1) + ' ms');
ok(P4.n === OFF.length && P4.d.every(d => d <= 1.01), `G1-02 Pixel @97/1/8: ${P4.d.filter(d => d <= 1.01).length}/${P4.n} auf der Linie (max ${Math.max(...P4.d).toFixed(2)} px); Meldung „${P4.toast}“ (Karte ${P4.moved})`);
// Schritt 5: eine Marke ziehen (Maus) – Quelle wandert, Ziel rastet
const G = await p.evaluate(() => SYNQUENZER.wpGeom()); const mx = G.marks[3], my = G.y + G.h * 0.5;
await p.mouse.move(mx, my); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(mx - i * 1.5, my); await sleep(16); } await p.mouse.up(); await sleep(900);
const S5 = await snapR();
ok(!deq(S5.marks, S4.marks), 'Schritt 5 (Marke ziehen) ändert die Marken');

// Undo über die Bedienung (Knopf ↶, sonst API), Schritt für Schritt: Marken/Karte deep-equal, Klang hash-gleich
const useBtn = await p.evaluate(() => { const b = document.getElementById('bUndo'); if (!b) return false; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(e && (e === b || b.contains(e))); });
console.log('  Undo über ' + (useBtn ? 'Knopf #bUndo (Touch)' : 'SYNQUENZER.undo() (Knopf vom Blatt verdeckt)') + '; Undo-Stapel ' + S0.n + ' → ' + S5.n + ' (' + (S5.n - S0.n) + ' Schritte), Schnappschüsse bei n = ' + [...HIST.keys()].join(','));
const doUndo = async () => { if (useBtn) await p.tap('#bUndo'); else await p.evaluate(() => SYNQUENZER.undo()); await sleep(700); };
const doRedo = async () => { await p.evaluate(() => SYNQUENZER.redo()); await sleep(700); };
let uOk = 0, uN = 0; const uMsg = [];
for (let n = S5.n - 1; n >= S0.n; n--) {
  await recAnim(); await doUndo(); const U = await snap(); const A = await animDur();
  const St = HIST.get(n); if (U.n !== n) uMsg.push('n=' + U.n + '≠' + n);
  if (!St) { uMsg.push(`↶→n${n}: (Zwischenschritt ohne Schnappschuss, ${U.warp ? U.warp.res + ' ' + U.warp.mode + ' ' + U.warp.strength : 'ohne Karte'})`); continue; }
  uN++; const good = deq(U.marks, St.marks) && deq(U.warp, St.warp) && U.snd.h === St.snd.h; if (good) uOk++;
  uMsg.push(`↶→n${n}: ${good ? 'gleich' : 'ANDERS'} (Marken ${deq(U.marks, St.marks)}, Karte ${deq(U.warp, St.warp)}, Klang ${U.snd.h}${U.snd.h === St.snd.h ? '=' : '≠'}${St.snd.h}, Gleiten ${A.dur == null ? '–' : A.dur.toFixed(0) + ' ms'})`);
}
ok(uOk === uN && uN >= 5, 'G1-03 Undo über ' + (S5.n - S0.n) + ' Schritte: ' + uOk + '/' + uN + ' Zustände deep-equal + Klang gleich');
for (const m of uMsg) console.log('    ' + m);
const U0 = await snap(), pl0 = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id);
const bit = pl0.raw && pl0.data.length === raw.length && pl0.data.every((v, i) => v === raw[i]);
ok(!U0.warp && deq(U0.marks, I0.marks) && bit, `G1-03 ganz zurück → Karte weg (${!U0.warp}), Marken wie vor dem Quantisieren (deep-equal ${deq(U0.marks, I0.marks)}), Klang = Roh-Take bitgleich (${pl0.data.length}/${raw.length} Samples: ${bit})`);
const gU = await p.evaluate(() => SYNQUENZER.wpGeom());
const srcEq = gU.marks.every((v, k) => Math.abs(v - gU.src[k]) < 0.01);
ok(srcEq, 'G1-03 nach ↶: gezeichnete Marken wieder an der Quelle (max Abstand ' + Math.max(...gU.marks.map((v, k) => Math.abs(v - gU.src[k]))).toFixed(3) + ' px)');
for (let i = 0; i < S5.n - S0.n; i++) await doRedo();
const R5 = await snap();
ok(deq(R5.marks, S5.marks) && deq(R5.warp, S5.warp) && R5.snd.h === S5.snd.h, 'G1-03 ↷ ×' + (S5.n - S0.n) + ' → Zustand nach Schritt 5 deep-equal, Klang gleich');
await p.screenshot({path: OUTG + '/indep-97-P1.png'});

// Knacken mit Legato-Signal (Schnitte fallen mitten in einen klingenden Ton): Dehnen und Scheiben 100 %
await p.evaluate(() => SYNQUENZER.wpClose());
const LT = OFF.map((o, k) => (4 + 2 * k) * s16 + o / 1000 * 0.7);
const xl = legato(LT, LEN, 0.25); { let sd = 3; for (let i = 0; i < xl.length; i++) { sd = (sd * 16807) % 2147483647; xl[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 2, len: 2}), toI16(xl));
await p.evaluate(id => SYNQUENZER.wpDetect(id), r2.id);
const ko = mKlickR(xl, []);
for (const mode of ['stretch', 'slice']) {
  await p.evaluate(([id, mode]) => SYNQUENZER.wpQuantize(id, {grid: '1/16', strength: 1, mode}), [r2.id, mode]); await sleep(300);
  const q = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r2.id), W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), r2.id)).warp;
  const y = Float32Array.from(q.data), k = mKlickR(y, []);
  // größter Sprung Sample zu Sample (ohne den gewollten Anschlag): normiert auf das Original
  const dmax = a => { let m = 0; for (let i = 1; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - a[i - 1])); return m; };
  const nMv = W ? W.map.src.slice(1, -1).filter((s, i) => Math.abs(s - W.map.dst[i + 1]) > 1e-4).length : 0;
  ok(W && nMv >= 8 && k.worst <= ko.worst + 3, `G1-03 Legato ${mode} 100 % (${nMv} Schnitte im Ton): M-KLICK ${k.worst} dB bei ${k.at} s (Original ${ko.worst} dB); max Δ/Sample ${dmax(y).toFixed(4)} (Original ${dmax(xl).toFixed(4)})`);
}
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
await H.ctx.close();

// Layout: 844×390 und 320×568 – Blatt öffnen, Touch-Tipp [1/8], nichts abgeschnitten/verdeckt
for (const [nm, w, h] of [['L1', 844, 390], ['P3', 320, 568]]) {
  const Q = await openG(br, {viewport: {width: w, height: h}, touch: true, mobile: true}), q = Q.p;
  await q.evaluate(b => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(b); SYNQUENZER.setMetronome(false); }, BPM); await sleep(300);
  const rr = await q.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
  await q.evaluate(id => SYNQUENZER.wpDetect(id), rr.id);
  await q.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), rr); await sleep(500);
  await q.tap('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(1200);
  const L = await q.evaluate(() => {
    const sh = document.getElementById('wpSheet'), bad = [], all = sh.querySelectorAll('button, input, canvas, .mval, .lbl, .wpinfo, .qh b');
    let n = 0;
    for (const e of all) {
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; n++;
      const out = r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5;
      // verdeckt/abgeschnitten: Mittelpunkt und beide Ecken innen
      const pts = getComputedStyle(e).pointerEvents === 'none' ? [] : [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 6, r.top + 6]];   // Ecke 6 px innen (rb-Knöpfe haben einen größeren Treffbereich)
      let by = ''; const hid = pts.some(([px, py]) => { const t = document.elementFromPoint(px, py); const h = !t || !(t === e || e.contains(t) || t.contains(e)); if (h) by = t ? (t.id || t.className || t.tagName) + '@' + Math.round(px) + ',' + Math.round(py) : 'null'; return h; });
      // Text abgeschnitten (scrollWidth > clientWidth bei overflow hidden)
      const clip = e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible' && e.tagName !== 'CANVAS' && e.tagName !== 'INPUT';
      if (out || hid || clip) bad.push((e.dataset.v || e.dataset.m || e.className || e.tagName) + (out ? ':raus' : '') + (hid ? ':verdeckt von ' + by : '') + (clip ? ':Text' : ''));
    }
    const small = [...sh.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width && r.height < 32; }).map(b => (b.dataset.v || b.textContent) + ' ' + b.getBoundingClientRect().height.toFixed(0));
    return {n, bad, small, sw: document.documentElement.scrollWidth, iw: innerWidth, toast: document.getElementById('toast').textContent, tr: document.getElementById('toast').getBoundingClientRect().toJSON()};
  });
  const P = await q.evaluate(id => { const I = SYNQUENZER.wpInfo(id), G = SYNQUENZER.wpGeom(); return {n: I.warp && SYNQUENZER.wpMoved(id), anim: G.anim}; }, rr.id);
  await q.screenshot({path: OUTG + `/indep-${nm}.png`});
  ok(!L.bad.length && L.sw <= L.iw, `[${nm} ${w}×${h}] Blatt: ${L.n} Elemente, nichts abgeschnitten/verdeckt ${JSON.stringify(L.bad)}; Seite ${L.sw} ≤ ${L.iw}; Meldung „${L.toast}“ (Karte ${P.n}); Toast-Rahmen ${Math.round(L.tr.top)}–${Math.round(L.tr.bottom)} px`);
  if (L.small.length) console.log(`  [${nm}] Knöpfe < 32 px hoch: ${L.small.join(', ')}`);
  ok(!Q.errs.length, `[${nm}] keine Konsolenfehler ` + JSON.stringify(Q.errs.slice(0, 2)));
  await Q.ctx.close();
}
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
