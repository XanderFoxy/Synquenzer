// G6 Chor-Generator in der App (Chromium): G6-01 … G6-05.  node bau/helfer/G267/tests/g6-app.mjs
import {launch, openG, sleep, toI16, SR, deq} from './g1/n5-g-h.mjs';
import {voice, rng} from './vs-dsp/test-signals.mjs';
import {rec2Start, rec2Stop, lufs} from './rec2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const hz = m => 440 * Math.pow(2, (m - 69) / 12), ct = (a, b) => 1200 * Math.log2(a / b);
const median = a => { const b = a.filter(v => v === v).sort((p, q) => p - q); return b.length ? b[b.length >> 1] : NaN; };
function track(x, sr, a, b) {
  const W = Math.round(0.03 * sr), hop = Math.round(0.005 * sr), out = [];
  for (let s = Math.round(a * sr); s + W + Math.round(sr / 70) < Math.min(x.length, b * sr); s += hop) {
    const tmin = Math.floor(sr / 1100), tmax = Math.ceil(sr / 70), r = new Float64Array(tmax + 2);
    for (let t = tmin - 1; t <= tmax + 1; t++) { let ac = 0, e = 0; for (let j = 0; j < W; j++) { ac += x[s + j] * x[s + j + t]; e += x[s + j] * x[s + j] + x[s + j + t] * x[s + j + t]; } r[t] = e > 0 ? 2 * ac / e : 0; }
    let mx = 0; for (let t = tmin; t <= tmax; t++) mx = Math.max(mx, r[t]); if (mx < 0.6) { out.push(NaN); continue; }
    let t = tmin; for (; t <= tmax; t++) if (r[t] >= 0.93 * mx && r[t] >= r[t - 1] && r[t] >= r[t + 1]) break;
    const y0 = r[t - 1], y1 = r[t], y2 = r[t + 1], den = y0 - 2 * y1 + y2; out.push(sr / (t + (den < 0 ? 0.5 * (y0 - y2) / den : 0)));
  }
  return out;
}
// Refrain in C-Dur (genaue Töne), 8 Töne C4…C5 auf Viertel bei 120 BPM, mit Konsonanten
const MEL = [60, 62, 64, 65, 67, 69, 71, 72];
const notes = MEL.map((m, k) => ({t: 0.05 + k * 0.5, d: 0.44, f0: hz(m), vowel: 'aeiou'[k % 5], cons: k % 2 === 1, m}));
const x = voice(SR, 4.2, notes, {seed: 4, vibrato: 10}).x; { const r = rng(3); for (let i = 0; i < x.length; i++) x[i] += 0.0004 * (r() * 2 - 1); }
const TERZ = {60: 64, 62: 65, 64: 67, 65: 69, 67: 71, 69: 72, 71: 74, 72: 76};   // diatonische Terz oben in C-Dur (Tabelle)

const br = await launch(null), H = await openG(br), p = H.p;
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
await p.evaluate(() => SYNQUENZER.play()); await sleep(300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
const R = {t: r1.track, s: 0};
await p.evaluate(R => SYNQUENZER.tkSheet(R), R); await sleep(800);   // lädt den Take
await p.evaluate(() => SYNQUENZER.closePop && SYNQUENZER.closePop());

// G6-01: Terz oben → Tabelle; Tonhöhe der gerechneten Stimme je Note ±10 Cent (je Kopie, inkl. Doppel-Verstimmung −6/+8 Cent)
let t0 = Date.now(); await p.evaluate(R => SYNQUENZER.g6Make(R, 'terz', 'up', '80'), R); const ok1 = await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
const inf = await p.evaluate(R => SYNQUENZER.g6Info(R), R);
console.log('Chor gerechnet in', Date.now() - t0, 'ms', JSON.stringify(inf.lastMake), 'Renders', inf.renders);
{
  const V = inf.chor.voices[0], rows = []; let bad = 0;
  V.n.forEach(n => { const p0 = Math.round(n.m), want = TERZ[p0]; rows.push(p0 + '→' + (p0 + n.iv)); if (p0 + n.iv !== want) bad++; });
  ok(ok1 && inf.chor.voices.length === 1 && V.n.length === 8 && bad === 0, 'G6-01 Terz oben = diatonische Terz je Note (Tabelle): ' + rows.join(' ') + (bad ? ' – ' + bad + ' falsch' : ''));
  for (const c of [0, 1]) {
    const b = await p.evaluate(([R, c]) => SYNQUENZER.g6Buf(R, 0, c), [R, c]), y = Float32Array.from(b.data); let w = 0; const e = [];
    notes.forEach(n => { const f = median(track(y, SR, n.t + (n.cons ? 0.06 : 0.04), n.t + n.d - 0.05)), d = ct(f, hz(TERZ[n.m])); e.push(d.toFixed(1)); w = Math.max(w, Math.abs(d)); });
    ok(w <= 10, `G6-01 Kopie ${c + 1}: Tonhöhe je Chornote ±10 Cent – max ${w.toFixed(1)} [${e.join(' ')}]`);
  }
}
// Rezept-Tabellen (Noten der Stimmen): Sexte, Quinte, Oktave unten, Dreistimmig, Barbershop, Unisono
for (const [rec, dir, want] of [['sexte', 'up', [[69, 71, 72, 74, 76, 77, 79, 81]]], ['quinte', 'up', [[67, 69, 71, 72, 74, 76, 77, 79]]], ['oktave', 'down', [[48, 50, 52, 53, 55, 57, 59, 60]]],
  ['drei', 'up', null], ['barber', 'up', null], ['unisono', 'up', [[60, 62, 64, 65, 67, 69, 71, 72]]]]) {
  await p.evaluate(([R, a, d]) => SYNQUENZER.g6Make(R, a, d, '80'), [R, rec, dir]);
  const c = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
  const got = c.voices.map(v => v.n.map(n => Math.round(n.m) + n.iv));
  let good = true;
  if (want) good = deq(got, want);
  else if (rec === 'drei') good = c.voices.length === 2 && got[0].every((q, k) => q > MEL[k] && got[1][k] > q && got[1][k] - MEL[k] <= 9);
  else good = c.voices.length === 3 && got[0].every((q, k) => q > MEL[k] && got[1][k] < MEL[k] && got[2][k] < got[1][k] && MEL[k] - got[2][k] <= 19);
  ok(good, `Rezept ${rec}${dir === 'down' ? ' unten' : ''}: ${got.map(g => g.join(',')).join(' | ')}`);
}
// G6-02: Falsett-Chor 80er = Oktave + Terz, je 2 Doppel, Chor −6…−10 LU unter dem Lead (am Ausgang gemessen, Stereo, BS.1770)
await p.evaluate(R => SYNQUENZER.g6Make(R, 'falsett', 'up', '80'), R); await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
{
  const c = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor, got = c.voices.map(v => v.n.map(n => Math.round(n.m) + n.iv));
  const want0 = MEL.map(m => m + 12), want1 = MEL.map(m => TERZ[m] + 12);
  ok(c.voices.length === 2 && deq(got[0], want0) && deq(got[1], want1), 'G6-02 Falsett: Oktave ' + got[0].join(',') + ' | Terz+Oktave ' + got[1].join(','));
  const meas = async solo => {
    await p.evaluate(k => { SYNQUENZER.g6Solo(null); if (k != null) SYNQUENZER.g6Solo(k); }, solo);
    await p.evaluate(() => SYNQUENZER.launchScene(0)); await rec2Start(p); await p.evaluate(() => SYNQUENZER.play());
    await sleep(4600); await p.evaluate(() => SYNQUENZER.stop()); const rr = await rec2Stop(p); await sleep(300);
    const nsrc = await p.evaluate(() => 0);
    return {L: lufs(rr.l, rr.r, rr.sr), rr};
  };
  await p.evaluate(() => { window.__src = 0; const o = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { window.__src++; return o.apply(this, a); }; });
  const A = await meas(-2), B = await meas(-1);
  const srcN = await p.evaluate(() => window.__src);
  const d = A.L - B.L;
  ok(d >= 6 && d <= 10, `G6-02 Lautheit: Lead ${A.L.toFixed(1)} LUFS, Chor ${B.L.toFixed(1)} LUFS → Chor ${d.toFixed(1)} LU unter dem Lead (Soll 6…10)`);
  await p.evaluate(R => SYNQUENZER.g6Mix(R, 'pop'), R); await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
  const A2 = await meas(-2), B2 = await meas(-1), d2 = A2.L - B2.L;
  ok(d2 >= 6 && d2 <= 10, `G6-02 Lautheit Mischung „Pop modern“: Chor ${d2.toFixed(1)} LU unter dem Lead (Soll 6…10)`);
  await p.evaluate(() => SYNQUENZER.undo());
  // Doppel: je Lead-Stück 2 Stimmen × 2 Kopien
  await p.evaluate(() => { SYNQUENZER.g6Solo(null); window.__src = 0; SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(600);
  const n1 = await p.evaluate(() => window.__src); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  ok(n1 === 5, 'G6-02 je Stimme 2 Doppel: beim Start ' + n1 + ' Puffer-Quellen (1 Lead + 2 Stimmen × 2 Kopien)');
  // Panorama: Chor links/rechts, Lead Mitte
  const LL = B.rr.l.reduce((s, v) => s + v * v, 0), RR = B.rr.r.reduce((s, v) => s + v * v, 0);
  console.log('  Chor Stereo-Balance L/R ' + (10 * Math.log10(LL / RR)).toFixed(1) + ' dB (Oktave links, Terz rechts)');
}
// G6-03: Hall nur über Send – Chorpegel 0 → am Ausgang nur noch Hall (Pegel ≥ −60 dBFS, klingt nach dem Notenende nach); Send 0 → Stille
{
  const c = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
  await p.evaluate(R => { SYNQUENZER.g6Voice(R, 0, {vol: 0}); SYNQUENZER.g6Voice(R, 1, {vol: 0}); }, R);
  const run = async () => { await p.evaluate(() => { SYNQUENZER.g6Solo(null); SYNQUENZER.g6Solo(-1); SYNQUENZER.launchScene(0); }); await rec2Start(p); await p.evaluate(() => SYNQUENZER.play()); await sleep(4600); await p.evaluate(() => SYNQUENZER.stop()); await sleep(1200); const rr = await rec2Stop(p); return rr; };
  const W = await run();
  const rms = (a, s, e) => { let q = 0, n = 0; for (let i = Math.round(s * 48000); i < Math.min(a.length, e * 48000); i++) { q += a[i] * a[i]; n++; } return 10 * Math.log10(q / Math.max(1, n) + 1e-20); };
  const lvl = rms(W.l, 0.5, 4.0), tail = rms(W.l, 4.9, 5.4);
  // trocken wäre der Chor ohne Hall: Korrelation mit der trockenen Stimmen-Fassung klein
  await p.evaluate(R => { SYNQUENZER.g6Voice(R, 0, {rev: 0, dly: 0}); SYNQUENZER.g6Voice(R, 1, {rev: 0, dly: 0}); }, R);
  const Z = await run(), z = rms(Z.l, 0.5, 4.0);
  ok(lvl > -60 && tail > -75 && z < -80, `G6-03 Chorpegel 0: Ausgang ${lvl.toFixed(1)} dBFS (Hall), Nachhall nach dem Ende ${tail.toFixed(1)} dBFS; zusätzlich Send 0 → ${z.toFixed(1)} dBFS (Stille)`);
  const nodes = await p.evaluate(() => SYNQUENZER.g6Nodes()); console.log('  Knoten', JSON.stringify(nodes.slice(0, 2)));
  await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.undo(); SYNQUENZER.undo(); SYNQUENZER.undo(); SYNQUENZER.g6Solo(null); });
  const c2 = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
  ok(deq(c2, c), 'G6-05 ↶ ×4 → Chor wie vorher (deep-equal)');
}
// G6-04: Selbst singen ersetzt Stimme 2, die Mischung bleibt
{
  const before = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor, lead0 = (await p.evaluate(() => SYNQUENZER.project())).tracks[R.t].clips[0].audio.take;
  await p.evaluate(R => SYNQUENZER.g6Arm(R, 1), R);
  const sung = voice(SR, 4.2, notes.map(n => Object.assign({}, n, {f0: hz(TERZ[n.m] + 12)})), {seed: 8}).x;
  const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(sung)); await sleep(500);
  const after = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor, au = (await p.evaluate(() => SYNQUENZER.project())).tracks[R.t].clips[0].audio;
  const same = ['pan', 'rev', 'dly'].every(k => after.voices[1][k] === before.voices[1][k]) && after.voices[0].pan === before.voices[0].pan && after.mix === before.mix;
  ok(after.voices[1].take && after.voices[1].take.take === r2.id && au.take === lead0 && same, `G6-04 Selbst gesungen: Stimme 2 = Take ${after.voices[1].take && after.voices[1].take.take} (neu ${r2.id}), Lead bleibt ${au.take === lead0}, Panorama/Sends gleich ${same}`);
  await p.evaluate(() => { window.__src = 0; SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(800);
  const n2 = await p.evaluate(() => window.__src); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
  ok(n2 === 4, 'G6-04 eingemischt: 1 Lead + Stimme 1 × 2 Kopien + selbst gesungene Stimme 2 = ' + n2 + ' Quellen');
}
// G6-05: Speichern/Laden deep-equal; Undo des Chors; CPU: keine langen Tasks beim Abspielen
{
  const c = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
  await p.evaluate(() => SYNQUENZER.save()); await sleep(400); await p.reload(); await sleep(1500); await p.evaluate(() => SYNQUENZER.load()); await sleep(1200);
  const c2 = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
  ok(deq(c, c2), 'G6-05 Speichern/Laden: Chor deep-equal');
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
  await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(4500); await p.evaluate(() => SYNQUENZER.stop());
  const lt = await p.evaluate(() => window.__lt);
  ok(!lt.filter(d => d > 50).length, 'G6-05 Abspielen mit Chor: keine langen Tasks > 50 ms (' + (lt.map(d => Math.round(d)).join(',') || 'keine') + ')');
  const n0 = (await p.evaluate(() => SYNQUENZER.undoInfo())).n;
  await p.evaluate(R => SYNQUENZER.g6Del(R), R); const cd = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
  await p.evaluate(() => SYNQUENZER.undo()); const cu = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
  ok(cd === null && deq(cu, c2), 'G6-05 Chor löschen → weg; ↶ → wieder da (deep-equal)');
}
// Blatt „Chor“ in 6 Größen: nichts abgeschnitten, Tasten ≥ 44
for (const [w, h, nm] of [[390, 844, 'P1'], [375, 667, 'P2'], [320, 568, 'P3'], [844, 390, 'L1'], [667, 375, 'L2'], [926, 428, 'XL']]) {
  await p.setViewportSize({width: w, height: h}); await sleep(250);
  await p.evaluate(R => SYNQUENZER.g6Sheet(R), R); await sleep(400);
  const lay = await p.evaluate(() => { const pop = document.querySelector('.pop.g6sheet'); if (!pop) return null; const out = []; for (const e of pop.querySelectorAll('button')) { const q = e.getBoundingClientRect(); out.push({t: e.textContent.trim().slice(0, 22), x: q.left, y: q.top, r: q.right, b: q.bottom, w: q.width, h: q.height, sw: e.scrollWidth > e.clientWidth + 1}); }
    const pr = pop.getBoundingClientRect(); return {out, W: innerWidth, H: innerHeight, sh: pop.scrollHeight, ch: pop.clientHeight, t: pr.top, b: pr.bottom}; });
  const vis = lay ? lay.out.filter(e => e.w > 0) : [];
  const clip = vis.filter(e => e.x < -0.5 || e.r > lay.W + 0.5 || e.sw);
  const small = vis.filter(e => e.h < 43.5 || e.w < 43.5);
  ok(lay && !clip.length && !small.length && lay.b <= lay.H + 0.5, `Blatt Chor ${nm}: ${lay ? lay.t.toFixed(0) + '–' + lay.b.toFixed(0) + ' (scroll ' + lay.sh + '/' + lay.ch + ')' : 'fehlt'}; abgeschnitten ${clip.map(e => e.t).join(',') || '–'}; < 44 ${small.map(e => e.t + ' ' + e.w.toFixed(0) + '×' + e.h.toFixed(0)).join(',') || '–'}`);
  await p.screenshot({path: '/home/user/Synquenzer/bau/helfer/G267/tests/out/g6-sheet-' + nm + '.png'});
  await p.evaluate(() => { const b = document.querySelector('.pop.g6sheet [data-a=x]'); if (b) b.click(); });
  await sleep(150);
}
// Noten einer Stimme im Editor (sichtbar, ▲ ändert die Stimme)
{
  await p.setViewportSize({width: 390, height: 844}); await sleep(200);
  await p.evaluate(R => SYNQUENZER.g2Open(R, {voice: 0}), R); await sleep(400);
  const g = await p.evaluate(() => SYNQUENZER.g2Geom()), iv0 = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor.voices[0].n[3].iv;
  const b = g.blocks[3]; await p.mouse.click((b.x0 + b.x1) / 2, b.y); await sleep(150); await p.click('#wpSheet .g2chips [data-v=up]'); await sleep(300);
  const iv1 = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor.voices[0].n[3].iv;
  await p.screenshot({path: '/home/user/Synquenzer/bau/helfer/G267/tests/out/g6-voice-notes.png'});
  ok(g.blocks.length === 8 && iv1 === iv0 + 1, `G6 Stimme als Noten: ${g.blocks.length} Blöcke, ▲ ändert die Stimme (${iv0} → ${iv1})`);
  await p.evaluate(() => SYNQUENZER.g2Close());
}
ok(!errs.length, 'keine Seitenfehler ' + errs.join(' | '));
await br.close(); console.log(fail ? fail + ' FEHLER' : 'ALLE GRÜN'); process.exit(fail ? 1 : 0);
