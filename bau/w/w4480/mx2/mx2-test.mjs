// MX2-Test: Mix & Master 2 (ein Skript). Aufruf: node mx2-test.mjs <index.html> <ausgabe-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file, out] = process.argv.slice(2);
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK   ' : 'FEHL ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };

/* ---------- 1) DSP in Node: Rahmen-Simulation gegen die echte Kette, Grenzen für alle Stile × Vorlieben ---------- */
const grab = (html, a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) throw new Error('nicht gefunden: ' + a); return html.slice(i, j); };
const H = fs.readFileSync(file, 'utf8');
const mk = new Function(grab(H, 'function mixaDspMake() {', '/* ---------- MIX-A: Worklet-Modul') + '\n' + grab(H, 'function mx1DspMake(D) {', 'let MX1_W = null;') + '\n' + grab(H, 'function mx2DspMake(D, M1) {', 'let MX2_W = null;') +
  '\n' + 'const MX2_PF = ' + grab(H, 'const MX2_PF = ', 'const MX2_D = ').replace(/^const MX2_PF = /, '') + '\nreturn [mixaDspMake, mx1DspMake, mx2DspMake, MX2_PF];')();
const D = mk[0](), M1 = mk[1](D), M2 = mk[2](D, M1), PF = mk[3], sr = 48000, N = sr * 12;
let seed = 11; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
// Testsignal: Bass (55 Hz, Achtel-Hüllkurve), Akkord (Sägezahn-ähnlich), Hi-Hat-Rauschen, Kick (Sinus-Sweep) – 120 BPM
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / sr, b8 = (t * 4) % 1, b4 = (t * 2) % 1, env8 = Math.exp(-b8 * 6), kick = Math.exp(-b4 * 25) * Math.sin(2 * Math.PI * (50 + 120 * Math.exp(-b4 * 30)) * b4 / 2);
  const bass = 0.28 * env8 * Math.sin(2 * Math.PI * 55 * t), ch = 0.08 * ((t * 220) % 1 - 0.5 + (t * 277) % 1 - 0.5 + (t * 330) % 1 - 0.5), hat = 0.05 * rnd() * Math.exp(-((t * 8) % 1) * 30);
  const s = bass + ch + 0.5 * kick + hat * (0.6 + 0.4 * Math.sin(t)); L[i] = s + 0.02 * rnd(); R[i] = s * 0.95 + 0.02 * rnd();
}
const C = M2.feat(L, R, sr);
ok('DSP: Merkmale (5-ms-Rahmen, 3 Bänder, Terz-Spektrum)', C.NF === Math.floor(N / 240) && C.spec.length === 28 && isFinite(C.Lin), {NF: C.NF, Lin: C.Lin, share: C.share, ms: C.ms});
{ // Rahmen-Simulation gegen die echte Kette (MX1 pre + MIX-A amSim) – je Stil die geschätzte und die echte Lautheit
  const dev = [], tps = []; let tFit = 0;
  for (const Y of PF.slice(0, 5)) {
    const t0 = Date.now(), F = M2.fit(C, {Y, d: 0, w: 0, ziel: -14, ceil: -1, bpm: 120}); tFit += Date.now() - t0;
    const X = M2.exact(L, R, sr, F.P, {ziel: -14, lat: 288});
    dev.push(+(Math.abs(X.gain - F.P.gain)).toFixed(2)); tps.push(X.info.tp);
    if (Math.abs(X.info.lout + 14) > 0.1) dev.push(99);
  }
  ok('DSP: schnelle Schätzung trifft die echte Kette (Pegel-Abweichung ≤ 0,5 dB), Nachprüfung genau auf −14 LUFS, True-Peak ≤ −1', Math.max(...dev) <= 0.5 && tps.every(v => v <= -1), {gainDiff: dev, tp: tps, msJeStil: Math.round(tFit / 5)});
}
{ // Grenzen für alle 9 Stile × 5 Druck × 5 Glanz × 2 Ziele (450 Anpassungen)
  let n = 0, bad = []; const t0 = Date.now();
  for (const Y of PF) for (let d = -2; d <= 2; d++) for (let w = -2; w <= 2; w++) for (const z of [-14, -9]) {
    const F = M2.fit(C, {Y, d, w, ziel: z, ceil: -1, bpm: 120}), P = F.P, I = F.info; n++;
    const eq = I.corr.map((c, k) => Math.abs(c + I.shDb[k]));
    if (eq.some(v => v > 3.01) || P.mb.b.some(q => q[1] > 4 || q[1] < 1) || P.mb.b[0][3] < 120 || I.mbGr.some(g => g.avg > 3.05) || Math.abs(P.lo) > 3 || Math.abs(P.hi) > 3 || P.ra > 3 || (P.sat && I.satDb < -1.6) || Math.abs(I.lout - z) > 0.1) bad.push(Y.id + ' d' + d + ' w' + w + ' ' + z);
  }
  ok('DSP: Grenzen eingehalten (450 Anpassungen: Klang je Band ±3 dB, Ratio ≤ 4, Tief-Release ≥ 120 ms, Band-Kompression Ø ≤ 3 dB, Sättigung ≥ −1,6 dB, Lautheit ±0,1)', !bad.length, {n, bad: bad.slice(0, 6), msJe: +((Date.now() - t0) / n).toFixed(1)});
  const a = M2.fit(C, {Y: PF[0], d: -2, w: 0, ziel: -14, bpm: 120}), b = M2.fit(C, {Y: PF[0], d: 2, w: 0, ziel: -14, bpm: 120}), g = M2.fit(C, {Y: PF[0], d: 0, w: -2, ziel: -14, bpm: 120}), h = M2.fit(C, {Y: PF[0], d: 0, w: 2, ziel: -14, bpm: 120});
  const grSum = F => F.info.mbGr.reduce((s, x) => s + x.avg, 0);
  ok('DSP: Druck macht dichter (mehr Kompression, weniger Dynamik), Glanz macht heller', grSum(b) > grSum(a) + 0.5 && b.info.lraOut <= a.info.lraOut && h.P.hi > g.P.hi && h.P.lo <= g.P.lo, {grOffen: +grSum(a).toFixed(2), grDruck: +grSum(b).toFixed(2), lra: [a.info.lraOut, b.info.lraOut], hi: [g.P.hi, h.P.hi]});
}

/* ---------- 2) App ---------- */
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const A = await p.evaluate(async () => {
  const o = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ensureAudio(); await wait(200);
  o.bypass = {am: S.fxBus.am || null, chain: !!(AU.M && AU.M.am), trim: SYNQUENZER.mx2Info().trim};
  let n = 0; const orig = window.vvRenderAudio; window.vvRenderAudio = function () { n++; return orig.apply(this, arguments); };
  // Mastern: einmal messen, 4 Stile umschalten ohne Render
  SYNQUENZER.mx2Sheet(); await wait(100);
  let T0 = performance.now(); o.way = await SYNQUENZER.mx2Way('am'); o.msMeasure = Math.round(performance.now() - T0); o.rend1 = n;
  o.sw = [];
  for (const pf of ['hinrg', 'synthweit', 'italo', 'modern']) { T0 = performance.now(); const r = SYNQUENZER.mx2Style(pf); o.sw.push({pf, ok: r, ms: +(performance.now() - T0).toFixed(1), amPf: S.fxBus.am && S.fxBus.am.mx2 && S.fxBus.am.mx2.pf, node: !!(AU.M && AU.M.am && AU.M.am.node)}); }
  await wait(400); o.nodeLive = !!(AU.M && AU.M.am && AU.M.am.node && AU.M.am.on); o.rend2 = n; o.undoTop = UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label;
  o.prefT = []; for (const [d, w] of [[2, 0], [-2, 0], [0, 2], [0, -2], [0, 0]]) { T0 = performance.now(); SYNQUENZER.mx2Style(null, d, w); o.prefT.push(+(performance.now() - T0).toFixed(1)); }
  o.rend3 = n;
  const ex = await SYNQUENZER.mx2Exact(); o.exact = ex && {gain: ex.gain, lout: ex.info.lout, tp: ex.info.tp, ms: ex.info.ms}; o.amGain = S.fxBus.am.gain;
  const D = mixaDspMake(), meas = async () => { const rr = await orig({range: {a: 0, b: S.song.bars, sel: false}}); return {tp: +D.truePeak([rr.ch[0], rr.ch[1]], 8, 32).toFixed(2), I: +D.integ(D.kblocks([rr.ch[0], rr.ch[1]], rr.sr)).toFixed(2), L: rr.ch[0]}; };
  const m1 = await meas(); o.render14 = {tp: m1.tp, I: m1.I};
  // laut + Druck: Grenzen am Render
  SYNQUENZER.mx2Style('hinrg', 2, 2, -9); await SYNQUENZER.mx2Exact(); const m2 = await meas(); o.render9 = {tp: m2.tp, I: m2.I, info: SYNQUENZER.mx2Info().fit.info};
  SYNQUENZER.mx2Style('eurodisco', 0, 0, -14); await SYNQUENZER.mx2Exact();
  // A/B im Blatt, während es läuft (pegelgleich)
  o.play = SYNQUENZER.mx2Play(); await wait(600); o.playing = R.playing;
  const g = () => ({ga: +AU.M.am.ga.gain.value.toFixed(3), gb: +AU.M.am.gb.gain.value.toFixed(3)});
  o.gB0 = g(); o.trimB0 = SYNQUENZER.mx2Info().trim;
  SYNQUENZER.mx2AB('A'); await wait(250); o.ab1 = SYNQUENZER.mx2Info().ab; o.gA = g(); o.mixaAB = MIXA.ab;
  SYNQUENZER.mx2AB('B'); await wait(250); o.ab2 = SYNQUENZER.mx2Info().ab; o.gB = g(); o.trimB = SYNQUENZER.mx2Info().trim;
  o.mt = SYNQUENZER.mx2Info().mt; await wait(300); o.mt2 = SYNQUENZER.mx2Info().mt;
  o.headPressed = [...document.querySelectorAll('.mx2s .mx2ab')].map(b => b.getAttribute('aria-pressed'));
  o.stillOpen = !!(UI.pop && UI.pop.name === 'mx2');
  stop(); await wait(200);
  // Video/Export: der Pegelangleich wirkt nie offline (Weiche im Render = 1/0), obwohl der Vergleich im Blatt aktiv ist
  const tOrig = window.mx2Trim, calls = []; window.mx2Trim = function () { const v = tOrig(); calls.push({off: !!UI.vvOff, v}); return v; };
  const v1 = await meas(); window.mx2Trim = tOrig; o.trimCalls = {off: calls.filter(c => c.off).length, offNot1: calls.filter(c => c.off && c.v !== 1).length, liveTrim: SYNQUENZER.mx2Info().trim};
  SYNQUENZER.mx2Close(); await wait(100); o.gClosed = g();
  // Mischen + Mastern: zwei Durchläufe (Analyse, Nachmessen), dann Master aus dem Zwischenspeicher
  amOff(); SYNQUENZER.mx2Sheet(); await wait(50); n = 0; const snap0 = mixaSnap();
  T0 = performance.now(); o.both = await SYNQUENZER.mx2Way('both'); o.msBoth = Math.round(performance.now() - T0); o.rendBoth = n;
  const I2 = SYNQUENZER.mx2Info(); o.mixWhy = I2.mixWhy; o.ab3 = I2.ab; o.am3 = !!(S.fxBus.am && S.fxBus.am.on);
  SYNQUENZER.mx2AB('A'); await wait(100); o.aIsBase = JSON.parse(SYNQUENZER.mx2Snap()).m === snap0; o.amA = !!(S.fxBus.am && S.fxBus.am.on);
  SYNQUENZER.mx2AB('B'); await wait(100); o.amB = !!(S.fxBus.am && S.fxBus.am.on);
  o.duckInfo = SYNQUENZER.mx2Info().duck;
  // Seitenkette Kick → Bass: an (40 %, 1/16) = ein Undo-Schritt; messbar am Render (nur der Bass hörbar)
  const bi = o.duckInfo.bi, u0 = UNDO.length; o.duckOn = SYNQUENZER.mx2Duck(true, 0.4, '1/16'); o.duckSteps = UNDO.length - u0; o.duckFx = {pump: S.tracks[bi].sound.fx.pump, rel: S.tracks[bi].sound.fx.pumpRel, src: S.fxBus.pumpSrc};
  const vols = S.tracks.map(t => t.sound.fx.vol), amKeep = S.fxBus.am; delete S.fxBus.am;
  S.tracks.forEach((t, i) => { if (i !== bi) t.sound.fx.vol = 0; });
  const env = x => { const w = 480, e = []; for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let j = i; j < i + w; j++) s += x[j] * x[j]; e.push(s / w); } return e; };
  const rA = await orig({range: {a: 0, b: S.song.bars, sel: false}}), eOn = env(rA.ch[0]);
  S.tracks[bi].sound.fx.pump = 0; const rB = await orig({range: {a: 0, b: S.song.bars, sel: false}}), eOff = env(rB.ch[0]);
  S.tracks[bi].sound.fx.pump = 0.4; S.tracks.forEach((t, i) => { t.sound.fx.vol = vols[i]; }); S.fxBus.am = amKeep; mixaAfter(S.tracks.map((_, i) => i), true);
  const mx = Math.max(...eOff), rat = []; for (let k = 0; k < eOff.length; k++) if (eOff[k] > mx * 0.02) rat.push(10 * Math.log10((eOn[k] + 1e-12) / eOff[k]));
  rat.sort((a, b) => a - b); o.duckDip = {min: +rat[0].toFixed(1), p10: +rat[Math.floor(rat.length * 0.1)].toFixed(1), med: +rat[Math.floor(rat.length / 2)].toFixed(1), n: rat.length};
  undo(); o.duckUndo = S.tracks[bi].sound.fx.pump; redo(); o.duckRedo = S.tracks[bi].sound.fx.pump;
  // Feinschliff: Fläche weicher (Höhen −2 dB, Release länger) = ein Schritt mit ↶; Bass Druck; Tiefenstaffelung
  const pi = SYNQUENZER.mx2Roles().indexOf('pad'), hs0 = (S.tracks[pi].mix || {}).hs || 0, aR0 = S.tracks[pi].sound.p.aR, u1 = UNDO.length;
  o.fine = SYNQUENZER.mx2Fine(pi, 'weich'); o.fineSteps = UNDO.length - u1; o.fineVals = {hs: S.tracks[pi].mix.hs, aR: S.tracks[pi].sound.p.aR, hs0, aR0};
  undo(); o.fineUndo = {hs: (S.tracks[pi].mix || {}).hs || 0, aR: S.tracks[pi].sound.p.aR}; redo(); o.fineRedo = {hs: S.tracks[pi].mix.hs, aR: S.tracks[pi].sound.p.aR};
  for (let k = 0; k < 6; k++) SYNQUENZER.mx2Fine(pi, 'weich'); o.fineCap = {hs: S.tracks[pi].mix.hs, aR: S.tracks[pi].sound.p.aR};
  o.druck = SYNQUENZER.mx2Fine(bi, 'druck'); o.druckMix = S.tracks[bi].mix;
  const ai = SYNQUENZER.mx2Roles().indexOf('arp'); o.rein = SYNQUENZER.mx2Fine(ai, 'rein');
  o.depth = SYNQUENZER.mx2Depth(); o.depthFx = S.tracks.map(t => ({rev: t.sound.fx.rev, pan: t.sound.fx.pan}));
  // Speichern/Laden: fxBus.am.mx2 bleibt; altes Projekt ohne mx2 unverändert
  const P2 = normalizeProject(JSON.parse(serializeProject())); o.saveMx2 = P2.fxBus.am && P2.fxBus.am.mx2; o.saveSame = JSON.stringify(P2.fxBus.am) === JSON.stringify(S.fxBus.am);
  const old = JSON.parse(serializeProject()); delete old.fxBus.am.mx2; o.oldNorm = normalizeProject(old).fxBus.am.mx2 === undefined;
  window.vvRenderAudio = orig;
  return o;
});
ok('Ohne MX2: kein Master, keine Weiche, Angleich 1 (bitgleich)', !A.bypass.am && !A.bypass.chain && A.bypass.trim === 1, A.bypass);
ok('Mastern: EIN Durchlauf misst', A.way && A.rend1 === 1, {ms: A.msMeasure});
ok('4 Stile umschalten ohne Render, je < 100 ms, Master-Knoten läuft live mit', A.rend2 === 1 && A.sw.every(s => s.ok && s.ms < 100 && s.amPf === s.pf) && A.nodeLive, A.sw);
ok('Vorlieben (Druck, Glanz) ohne Render, je < 100 ms; Stil-Folge = ein Undo-Schritt', A.rend3 === 1 && A.prefT.every(t => t < 100) && /^Master:/.test(A.undoTop), {ms: A.prefT, undo: A.undoTop});
ok('Nachprüfung im Worker: genau −14 LUFS, Pegel übernommen', A.exact && Math.abs(A.exact.lout + 14) <= 0.1 && A.amGain === A.exact.gain, A.exact);
ok('Render −14: Lautheit ±0,3 LU, True-Peak ≤ −1 dBTP', Math.abs(A.render14.I + 14) <= 0.3 && A.render14.tp <= -1, A.render14);
ok('Render Hi-NRG −9, Druck + Glanz voll: True-Peak ≤ −1 dBTP, Lautheit ±0,3 LU, Band-Kompression Ø ≤ 3 dB', A.render9.tp <= -1 && Math.abs(A.render9.I + 9) <= 0.3 && A.render9.info.mbGr.every(g => g.avg <= 3.05), {tp: A.render9.tp, I: A.render9.I, mbGr: A.render9.info.mbGr, lim: A.render9.info.limAvg});
ok('Abhören im Blatt: ▶ läuft, Blatt bleibt offen', A.play && A.playing && A.stillOpen);
ok('A/B während es läuft: A = bisheriger Weg, B = Master; vor dem ersten Tipp volle Lautheit', A.mixaAB === true && A.gA.ga > 0.9 && A.gA.gb < 0.01 && A.gB0.gb > 0.99 && A.trimB0 === 1 && A.ab2.side === 'B' && A.headPressed.join() === 'false,true', {gB0: A.gB0, gA: A.gA, gB: A.gB});
ok('Pegelgleich: der lautere Weg (B) wird um den Lautheits-Unterschied leiser', A.ab2.cmp && Math.abs(20 * Math.log10(A.trimB) - (A.ab2.LA - A.ab2.LB)) < 0.05 && Math.abs(A.gB.gb - A.trimB) < 0.02, {LA: A.ab2.LA, LB: A.ab2.LB, trimDb: +(20 * Math.log10(A.trimB)).toFixed(2), gb: A.gB.gb});
ok('Gain-Reduction live aus dem Master-Worklet (Tief, Mitte, Hoch, Bus, Limiter)', Array.isArray(A.mt2 || A.mt) && (A.mt2 || A.mt).length === 5, {mt: A.mt2 || A.mt});
ok('Video/Export unberührt: im Render ist die Weiche immer 1 (Angleich nur live); Schließen = volle Lautheit', A.trimCalls.off > 0 && A.trimCalls.offNot1 === 0 && A.trimCalls.liveTrim < 1 && A.gClosed.gb > 0.99, {calls: A.trimCalls, gClosed: A.gClosed});
ok('Mischen + Mastern: Analyse + Nachmessen (2 Durchläufe), Mix-Vorschläge übernommen, Master an', A.both && A.rendBoth === 2 && A.am3 && A.mixWhy && A.mixWhy.length >= 3, {ms: A.msBoth, why: (A.mixWhy || []).slice(0, 3)});
ok('A/B nach Mischen + Mastern: A = Stand vorher (Mix + kein Master), B = alles zurück', A.ab3.mode === 'snap' && A.aIsBase && !A.amA && A.amB);
ok('Seitenkette: Bass + Kick erkannt, an = ein Undo-Schritt, Quelle Kick', A.duckInfo && A.duckOn && A.duckSteps === 1 && A.duckFx.pump === 0.4 && A.duckFx.rel === '1/16' && A.duckFx.src === 'kick' && A.duckUndo !== 0.4 && A.duckRedo === 0.4, {info: A.duckInfo, fx: A.duckFx});
ok('Seitenkette messbar: der Bass taucht an den Kicks ab (≤ −3 dB), dazwischen unverändert', A.duckDip.min <= -3 && A.duckDip.med > -1.5, A.duckDip);
ok('Feinschliff Fläche „weicher“: Höhen −2 dB, Release ×1,25, ein Undo-Schritt, ↶/↷', A.fine && A.fineSteps === 1 && Math.abs(A.fineVals.hs - (A.fineVals.hs0 - 2)) < 0.01 && Math.abs(A.fineVals.aR - A.fineVals.aR0 * 1.25) < 0.01 && A.fineUndo.hs === A.fineVals.hs0 && A.fineUndo.aR === A.fineVals.aR0 && A.fineRedo.hs === A.fineVals.hs, A.fineVals);
ok('Feinschliff in Grenzen (6× weicher: Höhen ≥ −6 dB, Release ≤ 8 s); Bass Druck (Kompressor 4:1), Sequenz einbetten, Tiefenstaffelung', A.fineCap.hs >= -6 && A.fineCap.aR <= 8 && A.druck && A.druckMix.ra === 4 && A.rein && A.depth, {cap: A.fineCap, druck: A.druckMix});
ok('Speichern/Laden: fxBus.am.mx2 bleibt; altes Projekt ohne mx2 lädt gleich', A.saveMx2 && A.saveSame && A.oldNorm, A.saveMx2);

/* ---------- 3) Oberfläche hochkant 428×926 und quer 926×428 / 926×370 ---------- */
const tapSize = sel => p.evaluate(s => { const L = [...document.querySelectorAll(s)].filter(e => e.offsetParent && getComputedStyle(e).visibility !== 'hidden'); return {n: L.length, minH: Math.min(...L.map(e => e.getBoundingClientRect().height)), minW: Math.min(...L.map(e => e.getBoundingClientRect().width)), over: L.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim().slice(0, 24))}; }, sel);
const hdr = () => p.evaluate(() => { const b = document.getElementById('bMx2'), m = document.getElementById('bMenu'), r = b.getBoundingClientRect(), z = m.getBoundingClientRect(); return {vis: !!b.offsetParent && getComputedStyle(b).display !== 'none', w: Math.round(r.width), h: Math.round(r.height), menuR: Math.round(z.right), vw: innerWidth, takt: Math.round(document.getElementById('takt').getBoundingClientRect().width)}; });
const sheet = () => p.evaluate(() => { const s = document.querySelector('.pop.mx2s'), r = s.getBoundingClientRect(), x = s.querySelector('.psh-x'), xr = x.getBoundingClientRect(), hd = s.querySelector('.psh-h').getBoundingClientRect();
  return {inView: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1, x: xr.width >= 44 && xr.height >= 44 && xr.top >= 0 && xr.right <= innerWidth, head: ['.mx2pl', '.mx2ab'].every(q => !!s.querySelector(q)), headH: Math.round(hd.height), cols: getComputedStyle(s.querySelector('.mx2c')).gridTemplateColumns}; });
let h1 = await hdr();
ok('Kopfleiste hochkant 428: [MIX] sichtbar, Menü ganz im Bild', h1.vis && h1.h >= 44 && h1.menuR <= h1.vw - 4, h1);
await p.evaluate(async () => { SYNQUENZER.mx2Sheet(); await new Promise(r => setTimeout(r, 100)); await SYNQUENZER.mx2Way('am'); await SYNQUENZER.mx2Exact(); await new Promise(r => setTimeout(r, 300)); document.getElementById('toast').style.visibility = 'hidden'; });
let t1 = await tapSize('.pop.mx2s button'), s1 = await sheet();
ok('Blatt hochkant: Kopf mit ▶ A B ✕, Tasten ≥ 44 px, nichts abgeschnitten, im Bild', s1.inView && s1.x && s1.head && t1.minH >= 44 && t1.minW >= 44 && !t1.over.length, {t1, s1});
await p.screenshot({path: out + '/mx2-p-blatt.png'});
await p.evaluate(() => { const s = document.querySelector('.pop.mx2s'), w = [...s.querySelectorAll('.mx2sec h5')].find(h => /Warum/.test(h.textContent)); s.scrollTop = w ? w.parentElement.offsetTop - 60 : s.scrollHeight; });
await p.waitForTimeout(150); await p.screenshot({path: out + '/mx2-p-blatt2.png'});
const cl = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); SYNQUENZER.mx2Close(); await w(300); const r = await SYNQUENZER.mx2Style('italo'); await w(100); const e = await SYNQUENZER.mx2Exact(); return {r, miss: !!MX2.fit.miss, exact: !!MX2.fit.exact, e}; });
ok('Blatt zu = Song-Signal im Worker frei; Stil-Wechsel danach weiter sofort (Schätzung)', cl.r && cl.miss && !cl.exact, cl);
// Kanalzug (EQ · KOMP) mit Live-Analyzer und Gain-Reduction beim Abspielen
const kz = await p.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  closePop(); await SYNQUENZER.mixaAnalyze(); const gi = S.tracks.findIndex((t, i) => !!mx2EqGhost(i));
  if (gi >= 0) { SYNQUENZER.mx1EqSheet(gi); await w(200); } const ghost = gi >= 0 ? (document.querySelector('.pop.mx1eqs .mx2gh').getAttribute('d') || '').length : -1; closePop();
  SYNQUENZER.mx1EqSet(0, 'ra', 4); SYNQUENZER.mx1EqSet(0, 'thr', -30); SYNQUENZER.mx2Play(); await w(300); SYNQUENZER.mx1EqSheet(0); await w(1500);
  const p = document.querySelector('.pop.mx1eqs'), sb = p.querySelector('.mx2sb').getAttribute('d') || '', sa = p.querySelector('.mx2sa').getAttribute('d') || '', kc = p.querySelector('.mx2kc').getAttribute('d') || '', gr = p.querySelector('.mx2grm em').textContent;
  return {sb: sb.length, sa: sa.length, kc: kc.length, gr, kx: p.querySelector('.mx2kx').textContent, gi, ghost};
});
ok('Kanalzug: Analyzer vor/nach EQ live, Kennlinie, Gain-Reduction-Meter, Vorschlag des Assistenten als Geisterkurve', kz.sb > 100 && kz.sa > 100 && kz.kc > 50 && /dB/.test(kz.gr) && /4,0 : 1/.test(kz.kx) && kz.ghost > 50, kz);
await p.screenshot({path: out + '/mx2-p-kanalzug.png'});
await p.evaluate(() => { stop(); closePop(); });
// quer
await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(400);
h1 = await hdr();
ok('Kopfleiste quer: [MIX] sichtbar, Menü im Bild', h1.vis && h1.h >= 44 && h1.menuR <= h1.vw, h1);
await p.evaluate(async () => { SYNQUENZER.mx2Sheet(); await new Promise(r => setTimeout(r, 200)); });
t1 = await tapSize('.pop.mx2s button'); s1 = await sheet();
ok('Blatt quer 926×428: zwei Spalten, Tasten ≥ 44 px, ✕ sichtbar, im Bild', s1.inView && s1.x && /px .*px/.test(s1.cols) && t1.minH >= 44 && !t1.over.length, {t1, s1});
await p.screenshot({path: out + '/mx2-l-blatt.png'});
await p.evaluate(() => closePop());
await p.setViewportSize({width: 926, height: 370}); await p.waitForTimeout(400);
await p.evaluate(async () => { SYNQUENZER.mx2Sheet(); await new Promise(r => setTimeout(r, 200)); });
t1 = await tapSize('.pop.mx2s button'); s1 = await sheet();
const scr = await p.evaluate(() => { const s = document.querySelector('.pop.mx2s'); s.scrollTop = s.scrollHeight; const x = s.querySelector('.psh-x').getBoundingClientRect(); return {scroll: s.scrollHeight > s.clientHeight, xTop: Math.round(x.top), xVis: x.top >= 0 && x.bottom <= innerHeight}; });
ok('Blatt quer 926×370: rollt, Kopf mit ✕ bleibt stehen', s1.inView && s1.x && scr.xVis && t1.minH >= 44, {s1, scr});
await p.evaluate(() => closePop());
await p.setViewportSize({width: 390, height: 844}); await p.waitForTimeout(400);
h1 = await hdr();
ok('Hochkant 390 (schmal): [MIX] weicht ins Menü (≡ › Mix), Kopfleiste unverändert', !h1.vis && h1.menuR <= h1.vw - 4, h1);
const menu = await p.evaluate(() => { openMenu(); const b = [...document.querySelectorAll('#menu button')].find(x => /Mix & Master/.test(x.textContent)); const r = b ? b.getBoundingClientRect() : null; closeMenu(); return r ? {h: Math.round(r.height)} : null; });
ok('Menü: [Mix & Master …] vorhanden, ≥ 44 px', menu && menu.h >= 44, menu);
ok('Keine Fehler in der Konsole', !errs.length, errs.slice(0, 5));
await b.close();
fs.writeFileSync(out + '/mx2-test-ergebnis.json', JSON.stringify(res, null, 1));
const nOk = res.filter(r => r.pass).length; console.log(`\n${nOk}/${res.length} OK`);
