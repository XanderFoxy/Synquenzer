// G2 in der App (Chromium): G2-01 … G2-06 an der gespielten Fassung (tkPlayBuf = was Szene und Song spielen).
// node bau/helfer/G267/tests/g2-app.mjs   (G_APP=<datei> für eine andere Fassung)
import {launch, openG, sleep, toI16, SR, deq} from './g1/n5-g-h.mjs';
import {voice, rng, gauss} from './vs-dsp/test-signals.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const hz = m => 440 * Math.pow(2, (m - 69) / 12), ct = (a, b) => 1200 * Math.log2(a / b);
const median = a => { const b = a.filter(v => v === v).sort((p, q) => p - q); return b.length ? b[b.length >> 1] : NaN; };
function track(x, sr, a, b) {   // NSDF je 30-ms-Fenster, Hop 5 ms
  const W = Math.round(0.03 * sr), hop = Math.round(0.005 * sr), out = [];
  for (let s = Math.round(a * sr); s + W + Math.round(sr / 70) < Math.min(x.length, b * sr); s += hop) {
    const tmin = Math.floor(sr / 1000), tmax = Math.ceil(sr / 70), r = new Float64Array(tmax + 2);
    for (let t = tmin - 1; t <= tmax + 1; t++) { let ac = 0, e = 0; for (let j = 0; j < W; j++) { ac += x[s + j] * x[s + j + t]; e += x[s + j] * x[s + j] + x[s + j + t] * x[s + j + t]; } r[t] = e > 0 ? 2 * ac / e : 0; }
    let mx = 0; for (let t = tmin; t <= tmax; t++) mx = Math.max(mx, r[t]); if (mx < 0.6) { out.push(NaN); continue; }
    let t = tmin; for (; t <= tmax; t++) if (r[t] >= 0.93 * mx && r[t] >= r[t - 1] && r[t] >= r[t + 1]) break;
    const y0 = r[t - 1], y1 = r[t], y2 = r[t + 1], den = y0 - 2 * y1 + y2; out.push(sr / (t + (den < 0 ? 0.5 * (y0 - y2) / den : 0)));
  }
  return out;
}
function hpf(x, fc, sr) { const y = new Float32Array(x.length), w = Math.tan(Math.PI * fc / sr), k1 = Math.SQRT2 * w, k2 = w * w, a0 = 1 + k1 + k2, b0 = 1 / a0, a1 = 2 * (k2 - 1) / a0, a2 = (1 - k1 + k2) / a0; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = b0 * (v - 2 * x1 + x2) - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; }
function mKlick(x) { const h = hpf(x, 5000, SR), W = 96, n = Math.floor(h.length / W), e = []; for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e.push(10 * Math.log10(s / W + 1e-14)); }
  let w = -99; for (let k = 10; k < n - 10; k++) { const nb = e.slice(k - 10, k).concat(e.slice(k + 1, k + 11)).sort((p, q) => p - q); w = Math.max(w, e[k] - nb[10]); } return w; }
const C = [60, 62, 64, 65, 67, 69, 71, 72], OFFS = [35, -40, 30, -45, 42, -33, 38, -31, 44, -36];
const notes = OFFS.map((c, k) => ({t: 0.3 + k * 0.45 + (k >= 5 ? 0.3 : 0), d: 0.4, f0: hz(C[k % 8] - 12 + c / 100), vowel: 'aeiou'[k % 5], cons: k % 2 === 0, m0: C[k % 8] - 12, off: c}));
const x = voice(SR, 6, notes, {seed: 5}).x; { const r = rng(9); for (let i = 0; i < x.length; i++) x[i] += 0.0005 * (r() * 2 - 1); }
const cons = notes.filter(n => n.cons).map(n => [n.t, n.t + 0.019]);
const noteHz = (y, n) => median(track(y, SR, n.t + (n.cons ? 0.045 : 0.02) + 0.04, n.t + n.d - 0.05));

const br = await launch(null);
const H = await openG(br), p = H.p;
const errs = []; p.on('pageerror', e => errs.push(String(e)));
console.log('App', await p.evaluate(() => SYNQUENZER.version), 'Kern', await p.evaluate(() => SYNQUENZER.g2Core()));
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
await p.evaluate(() => SYNQUENZER.play()); await sleep(300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 4}), toI16(x));
const id = r1.id, R = {t: r1.track, s: 0};
const xr = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id));
console.log('Take', id, 'Spur', r1.track, 'Tonart', JSON.stringify(await p.evaluate(() => SYNQUENZER.project().key)));
const played = async () => { const r = await p.evaluate(R => SYNQUENZER.g2Played(R), R); return {raw: r.raw, y: Float32Array.from(r.data)}; };

// G2-06: Analyse = gemessene Noten; Editor-Blöcke an derselben Stelle
const an = await p.evaluate(R => SYNQUENZER.g2Analyse(R), R);
ok(an && an.notes.length === notes.length, 'G2-06 Noten erkannt: ' + (an ? an.notes.length : 0) + ' von ' + notes.length);
const t0 = Date.now();
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'hard', str: 1}), R);
let P = await played(); const tq = Date.now() - t0;
const per = (y, s) => notes.map(n => { const want = n.m0 + n.off / 100 + s * (-n.off / 100); return ct(noteHz(y, n), hz(want)); });
{ const e = per(P.y, 1), w = Math.max(...e.map(Math.abs)); ok(!P.raw && w <= 5, `G2-01 Hart 100 %: je Note am Skalenton ±5 Cent – max ${w.toFixed(2)} [${e.map(v => v.toFixed(1)).join(' ')}] (Quantisieren bis hörbar ${tq} ms)`); }
ok(P.y.length === xr.length, `G2-03 Dauer unverändert: ${P.y.length} = ${xr.length} Samples`);
{ const a = mKlick(P.y), b = mKlick(xr); ok(a <= b + 1, `G2-03 Klick-Detektor (M-KLICK) ${a.toFixed(1)} dB, Original ${b.toFixed(1)} dB`); }
{ let bad = 0; for (const [a, b] of cons) for (let i = Math.round(a * SR); i < b * SR; i++) if (P.y[i] !== xr[i]) bad++; ok(bad === 0, 'G2-05 Zischlaute bitgleich beim Quantisieren (' + bad + ' Samples anders)'); }
const hardY = P.y;
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'hard', str: 0.5}), R); P = await played();
{ const e = per(P.y, 0.5), w = Math.max(...e.map(Math.abs)); ok(w <= 5, `G2-01 Hart 50 %: halber Abstand ±5 Cent – max ${w.toFixed(2)}`); }
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'soft', str: 1}), R); P = await played();
{ const e = per(P.y, 1), w = Math.max(...e.map(Math.abs)); ok(w <= 5, `G2-01 Weich 100 %: ±5 Cent – max ${w.toFixed(2)}`);
  let vmin = Infinity; for (const n of notes) { const a = n.t + 0.2, b = n.t + n.d - 0.05, tx = track(xr, SR, a, b).filter(v => v === v), ty = track(P.y, SR, a, b).filter(v => v === v), dep = t => { const c = t.map(v => ct(v, median(t))); return Math.max(...c) - Math.min(...c); }; vmin = Math.min(vmin, dep(ty) / dep(tx)); }
  ok(vmin >= 0.7, `G2-02 Weich: Vibrato-Tiefe ≥ 70 % – min ${(vmin * 100).toFixed(0)} %`); }
// G2-04 A/B, Undo, Speichern/Laden
await p.evaluate(() => SYNQUENZER.g2AB(true)); P = await played(); ok(P.raw, 'G2-04 A/B „Original“ = Roh-Take'); await p.evaluate(() => SYNQUENZER.g2AB(false));
const softY = (await played()).y;
const st = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R);
await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
const st2 = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R);
ok(st2 && st2.mode === 'hard' && st2.str === 0.5, 'G2-04 ↶ → vorige Einstellung (Hart 50 %)');
await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.undo(); }); await sleep(300);
P = await played(); const st0 = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R);
{ let d = 0; for (let i = 0; i < xr.length; i++) if (P.y[i] !== xr[i]) d++; ok(!st0 && P.raw && d === 0, 'G2-04 ↶ ganz → kein Feld, Klang = Roh-Take bitgleich (' + d + ' anders)'); }
await p.evaluate(() => { SYNQUENZER.redo(); SYNQUENZER.redo(); SYNQUENZER.redo(); }); await sleep(300);
P = await played(); { let d = 0; for (let i = 0; i < softY.length; i++) if (P.y[i] !== softY[i]) d++; ok(deq(await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R), st) && d === 0, 'G2-04 ↷ → deep-equal, Klang bitgleich (' + d + ')'); }
await p.evaluate(() => SYNQUENZER.save()); await sleep(500);
await p.reload(); await sleep(1500);
await p.evaluate(() => SYNQUENZER.load()); await sleep(1500);
{ const s2 = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch, R); P = await played(); let d = 0; for (let i = 0; i < softY.length; i++) if (P.y[i] !== softY[i]) d++;
  ok(deq(s2, st) && d === 0, 'G2-04 Speichern/Laden: Feld deep-equal, Klang bitgleich (' + d + ' Samples anders)'); }
// G2-05: Note 4 um +3 Halbtöne (Quantisieren aus)
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: false}), R);
await p.evaluate(R => SYNQUENZER.g2Note(R, 'shift', 4, 3), R); P = await played();
{ const n = notes[4], c = ct(noteHz(P.y, n), noteHz(xr, n)); let bad = 0; for (const [a, b] of cons) for (let i = Math.round(a * SR); i < b * SR; i++) if (P.y[i] !== xr[i]) bad++;
  ok(Math.abs(c - 300) <= 5 && bad === 0, `G2-05 Note +3 HT: ${c.toFixed(1)} Cent (Soll 300 ±5), Zischlaute anders: ${bad}`);
  const nb = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch.notes[4], R); const lo = Math.round((nb.t0 - 0.05) * SR), hi = Math.round((nb.t1 + 0.05) * SR); let out = 0; for (let i = 0; i < xr.length; i++) if ((i < lo || i > hi) && P.y[i] !== xr[i]) out++;
  ok(out === 0, 'G2-05 außerhalb der verschobenen Note bitgleich (' + out + ' anders)'); }
// G2-06: Editor offen, Blöcke = gemessene Noten (Start ±10 ms, Höhe ±20 Cent als Zeile)
for (const [w, h, nm] of [[390, 844, 'P1'], [375, 667, 'P2'], [320, 568, 'P3'], [844, 390, 'L1'], [667, 375, 'L2'], [926, 428, 'XL']]) {
  await p.setViewportSize({width: w, height: h}); await sleep(250);
  await p.evaluate(R => SYNQUENZER.g2Open(R), R); await sleep(500);
  const g = await p.evaluate(() => SYNQUENZER.g2Geom()), inf = await p.evaluate(R => SYNQUENZER.g2Info(R), R);
  let dt = 0, dp = 0; g.blocks.forEach(b => { const n = inf.pitch.notes[b.k], t = g.view.a + (b.x0 - g.x) / g.w * g.view.W; dt = Math.max(dt, Math.abs(t - n.t0) * 1000); const pit = g.lo + (g.h - (b.y - g.y)) / g.rowH - 0.5; dp = Math.max(dp, Math.abs(pit - inf.targets[b.k]) * 100); });
  // Bedienelemente: im Bild, ≥ 44 hoch (Chips 34 + Treffzone wie im Marken-Editor), nichts abgeschnitten
  const lay = await p.evaluate(() => { const out = []; for (const e of document.querySelectorAll('#wpSheet button, #wpSheet input, #wpSheet canvas')) { const r = e.getBoundingClientRect(); out.push({t: e.textContent || e.tagName, x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom, sw: e.scrollWidth > e.clientWidth + 1}); } return {out, W: innerWidth, H: innerHeight, ov: document.documentElement.scrollWidth > innerWidth}; });
  const clip = lay.out.filter(e => e.x < -0.5 || e.y < -0.5 || e.r > lay.W + 0.5 || e.b > lay.H + 0.5 || e.sw || e.w < 1);
  const small = lay.out.filter(e => e.t !== 'CANVAS' && (e.w < 30 || e.h < 34));
  ok(dt <= 10 && dp <= 20 && !clip.length && !small.length && !lay.ov, `G2-06 ${nm}: Blöcke Start max ${dt.toFixed(1)} ms, Höhe max ${dp.toFixed(1)} Cent; abgeschnitten ${clip.map(e => e.t).join(',') || '–'}; zu klein ${small.map(e => e.t + ' ' + e.w.toFixed(0) + '×' + e.h.toFixed(0)).join(',') || '–'}`);
  await p.screenshot({path: '/home/user/Synquenzer/bau/helfer/G267/tests/out/g2-ed-' + nm + '.png'});
}
await p.setViewportSize({width: 390, height: 844}); await sleep(200);
// Editor: Note antippen, ▲ (eine Undo-Stufe), Ziehen nach oben um 2 Zeilen
{
  const g = await p.evaluate(() => SYNQUENZER.g2Geom()), b = g.blocks[2], cx = (b.x0 + b.x1) / 2;
  await p.mouse.click(cx, b.y); await sleep(200);
  const sel = await p.evaluate(() => SYNQUENZER.g2Info().editor.sel);
  const sh0 = (await p.evaluate(R => SYNQUENZER.g2Info(R).pitch.notes[2].sh || 0, R));
  await p.click('#wpSheet .g2chips [data-v=up]'); await sleep(400);
  const sh1 = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch.notes[2].sh || 0, R);
  const g2 = await p.evaluate(() => SYNQUENZER.g2Geom()), b2 = g2.blocks[2];
  await p.mouse.move(cx, b2.y); await p.mouse.down(); for (let k = 1; k <= 8; k++) { await p.mouse.move(cx, b2.y - k * g2.rowH * 2 / 8); await sleep(16); } await p.mouse.up(); await sleep(400);
  const sh2 = await p.evaluate(R => SYNQUENZER.g2Info(R).pitch.notes[2].sh || 0, R);
  ok(sel === 2 && sh1 === sh0 + 1 && sh2 === sh1 + 2, `Editor: Tipp wählt Note (${sel}), ▲ +1 (${sh0}→${sh1}), Ziehen 2 Zeilen hoch +2 (→${sh2})`);
  const n0 = (await p.evaluate(R => SYNQUENZER.g2Info(R).pitch.notes.length, R));
  await p.click('#wpSheet .g2chips [data-v=split]'); await sleep(300);
  const n1 = (await p.evaluate(R => SYNQUENZER.g2Info(R).pitch.notes.length, R));
  await p.click('#wpSheet .g2chips [data-v=join]'); await sleep(300);
  const n2 = (await p.evaluate(R => SYNQUENZER.g2Info(R).pitch.notes.length, R));
  ok(n1 === n0 + 1 && n2 === n0, `Editor: Teilen ${n0}→${n1}, Verbinden →${n2}`);
}
// G2-04 Rechenzeit: 16-Takt-Take (32 s) – Quantisieren bis hörbar ≤ 3 s, keine langen Tasks im Hauptfaden
{
  const ns = []; for (let k = 0; k < 64; k++) ns.push({t: 0.2 + k * 0.49, d: 0.42, f0: hz(C[k % 8] - 12 + OFFS[k % 10] / 100), vowel: 'aeiou'[k % 5], cons: k % 3 === 0});
  const xl = voice(SR, 32, ns, {seed: 2}).x;
  const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 16}), toI16(xl)); const R2 = {t: r2.track, s: 1};
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  const ta = Date.now(); await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'hard', str: 1}), R2); const r = await p.evaluate(R => SYNQUENZER.g2Played(R, 0, 10), R2); const tt = Date.now() - ta;
  const lt = await p.evaluate(() => window.__lt), inf = await p.evaluate(R => SYNQUENZER.g2Info(R), R2);
  ok(tt <= 3000 && !r.raw, `G2-04 16-Takt-Take: Quantisieren bis hörbar ${tt} ms (≤ 3000; Analyse ${inf.lastAn && inf.lastAn.ms} ms, Rendern ${inf.last && inf.last.ms} ms, ${inf.how})`);
    // wie bedient: Takes-Blatt auf (Töne werden schon gesucht), ♪ Tonhöhe, nach 1,5 s Tipp auf [Hart] → hörbar
  const r3 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 2, len: 16}), toI16(xl.map(v => v * 0.9))); const R3 = {t: r3.track, s: 2};
  await p.evaluate(R => SYNQUENZER.tkSheet(R), R3); await sleep(300); await p.evaluate(R => SYNQUENZER.g2Open(R), R3); await sleep(1500);
  const tb = Date.now(); await p.click('#wpSheet .g2chips [data-v=hard]'); for (let n = 0; n < 400; n++) { const i = await p.evaluate(R => SYNQUENZER.g2Info(R), R3); if (i.pitch && i.ready) break; await sleep(20); } const tw = Date.now() - tb;
  ok(tw <= 3000, `G2-04 16-Takt-Take wie bedient (Blatt offen, dann [Hart]): bis hörbar ${tw} ms (≤ 3000)`);
  await p.evaluate(() => SYNQUENZER.g2Close());
  ok(!lt.filter(d => d > 50).length, 'G2-04 keine langen Tasks > 50 ms im Hauptfaden: ' + (lt.length ? lt.map(d => Math.round(d)).join(',') : 'keine'));
}
ok(!errs.length, 'keine Seitenfehler ' + errs.join(' | '));
await br.close();
console.log(fail ? fail + ' FEHLER' : 'ALLE GRÜN');
process.exit(fail ? 1 : 0);
