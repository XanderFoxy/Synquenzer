// G1-02 sichtbar: Marken springen (≤ 250 ms) auf die Rasterlinien (Pixelvergleich), Meldung „n Einsätze gerückt“ mit richtiger Zahl,
// Wellenform blass/kräftig, Wellenform der STIMME-Spur (Matrix und Song) = gehörte Fassung; Bilder in allen Formaten
import {launch, openG, sleep, toI16, SR, OUTG} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const OFF = [0, 60, -60, 45, -50, 60, -60, 0, 55, -45, 60, -60, 30, -30];
const notes = OFF.map((o, k) => ({t: 0.5 + k * 0.25 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1}));
const x = voice(SR, 4, notes, {seed: 3}).x; { let sd = 5; for (let i = 0; i < x.length; i++) { sd = (sd * 16807) % 2147483647; x[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['XL', 926, 428]];
const only = process.argv[2];
const br = await launch(null);
for (const [nm, w, h] of VPS) {
  if (only && only !== nm) continue;
  const H = await openG(br, {viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
  const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x)); const id = r1.id;
  await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
  await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r1); await sleep(500);
  // Zoom „Ganz“ (alle Marken im Bild)
  for (let i = 0; i < 4; i++) { const z = await p.evaluate(() => document.querySelector('#wpSheet .wpz').textContent); if (z === 'Ganz') break; await p.tap('#wpSheet .wpz'); await sleep(150); }
  await p.screenshot({path: OUTG + `/ed-${nm}-vorher.png`});
  // canvas analysis in the page: white mark columns at a top row, grid line x for the 1/8 raster
  const ana = () => p.evaluate(id => {
    const cv = document.querySelector('#wpSheet canvas'), g = cv.getContext('2d'), dpr = cv.width / cv.clientWidth, Wp = cv.clientWidth, Hp = cv.clientHeight;
    const I = SYNQUENZER.wpInfo(id), Gm = SYNQUENZER.wpGeom(), V = Gm.view, t0 = I.t0, sp = 0.5, step = 0.25;
    const lines = []; for (let t = t0 + Math.ceil((V.a - t0) / step) * step; t < V.a + V.W; t += step) lines.push(Math.round((t - V.a) / V.W * Wp) + 0.5);
    const y = Math.round(Hp * 0.15 * dpr), row = g.getImageData(0, y, cv.width, 1).data, cols = [];
    for (let i = 0; i < cv.width; i++) { const r = row[4 * i], gg = row[4 * i + 1], b = row[4 * i + 2]; if (r > 150 && gg > 150 && b > 150) cols.push(i / dpr); }
    const cl = []; for (const c of cols) { const L = cl[cl.length - 1]; if (L && c - L.b <= 1.5) L.b = c; else cl.push({a: c, b: c}); }
    const marksX = Gm.marks.map(v => v - Gm.x), white = cl.map(c => (c.a + c.b) / 2);
    const near = (v, arr) => Math.min(...arr.map(q => Math.abs(q - v)));
    // waveform pixels: strong blue (127,176,222) and faint (30 %) – count in the middle band
    const mid = g.getImageData(0, 0, cv.width, cv.height).data; let strong = 0, faint = 0;
    for (let i = 0; i < cv.width * cv.height; i++) { const r = mid[4 * i], gg = mid[4 * i + 1], b = mid[4 * i + 2]; if (Math.abs(r - 127) < 12 && Math.abs(gg - 176) < 12 && Math.abs(b - 222) < 12) strong++; else if (Math.abs(r - 57) < 5 && Math.abs(gg - 77) < 5 && Math.abs(b - 97) < 5) faint++; }   // #7fb0de mit 38 % über #0e1014
    return {marksX, white, onLine: marksX.map(v => near(v, lines)), whiteOnLine: white.filter(v => v > 3 && v < Wp - 3).map(v => near(v, lines)), lines: lines.length, strong, faint, Wp, toast: document.getElementById('toast').textContent, moved: SYNQUENZER.wpMoved(id), warp: I.warp};
  }, id);
  const A0 = await ana();
  const on0 = A0.onLine.filter(d => d <= 1).length;
  // Tipp auf 1/8 mit Bild-für-Bild-Aufzeichnung der Marken
  await p.evaluate(() => { window.__fr = []; const t0 = performance.now(); const f = () => { const g = SYNQUENZER.wpGeom(); if (g) window.__fr.push({t: performance.now() - t0, m: g.marks.slice()}); if (performance.now() - t0 < 1500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await p.tap('#wpSheet .wpchips button[data-v="1/8"]');
  await sleep(1600);
  const fr = await p.evaluate(() => window.__fr);
  const first = fr.findIndex((f, i) => i && f.m.some((v, k) => Math.abs(v - fr[0].m[k]) > 0.01));
  const fin = fr[fr.length - 1].m;
  let last = first; for (let i = first; i < fr.length; i++) if (fr[i].m.some((v, k) => Math.abs(v - fin[k]) > 0.01)) last = i + 1;
  const dur = first >= 0 && last < fr.length ? fr[last].t - fr[first].t : null, mids = first >= 0 ? last - first : 0;
  await sleep(300);
  const A1 = await ana();
  const on1 = A1.onLine.filter(d => d <= 1).length;
  await p.screenshot({path: OUTG + `/ed-${nm}-nachher.png`});
  const nMoved = A1.warp ? A1.warp.map.src.slice(1, -1).filter((s, k) => Math.abs(s - A1.warp.map.dst[k + 1]) > 1e-6).length : -1;
  ok(dur != null && dur <= 250 && mids >= 3, `[${nm}] G1-02 Marken springen sichtbar: Animation ${dur && dur.toFixed(0)} ms (≤ 250) mit ${mids} Zwischenbildern`);
  ok(on1 === A1.onLine.length && A1.whiteOnLine.every(d => d <= 1.01), `[${nm}] G1-02 Pixelvergleich: vorher ${on0}/${A0.onLine.length} Marken auf einer Linie, nachher ${on1}/${A1.onLine.length} (gezeichnete weiße Spalten ≤ 1 px neben der 1/8-Linie: ${A1.whiteOnLine.length}, max ${Math.max(...A1.whiteOnLine).toFixed(2)} px)`);
  ok(A1.toast === nMoved + ' Einsätze gerückt' && A1.moved === nMoved, `[${nm}] G1-02 Meldung „${A1.toast}“ – gerückt laut Karte: ${nMoved}`);
  ok(A0.strong > 200 && A1.strong > 200 && A1.faint > 2 * A0.faint && A1.faint - A0.faint > 150, `[${nm}] G1-02 Wellenform: vorher kräftig ${A0.strong} px / blass ${A0.faint}; nachher kräftig ${A1.strong} / blass ${A1.faint}`);
  if (nm === 'P1' || only) {
    // Gesten auf der quantisierten Ansicht: Tipp auf eine leere Stelle = Marke an der Stelle im Take, die dort klingt (ein Undo);
    // Ziehen einer Marke = ihre Quelle wandert mit dem Finger, das Ziel rastet wieder ein
    const G0 = await p.evaluate(() => SYNQUENZER.wpGeom()), I0 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
    const xs = G0.marks.slice().sort((a, b) => a - b), gx = Math.min(G0.x + G0.w - 4, xs[xs.length - 1] + 26), tDisp = G0.view.a + (gx - G0.x) / G0.w * G0.view.W;
    await p.touchscreen.tap(gx, G0.y + G0.h * 0.5); await sleep(400);
    const I1 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), u1 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
    const inv = (w, t) => { const s = w.map.src, d = w.map.dst; let k = 0; while (k < d.length - 2 && d[k + 1] < t) k++; return s[k] + (t - d[k]) * (s[k + 1] - s[k]) / (d[k + 1] - d[k]); };
    const added = I1.marks.find(m => !I0.marks.some(o => Math.abs(o.t - m.t) < 1e-6)), want = inv(I0.warp, tDisp);
    ok(I1.marks.length === I0.marks.length + 1 && u1 === u0 + 1 && added && Math.abs(added.t - want) * 1000 < 1.5, `[${nm}] Tipp leer (quantisiert): neue Marke an der Take-Stelle, die dort klingt (Abweichung ${added ? ((added.t - want) * 1000).toFixed(2) : '–'} ms), ein Undo`);
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(400);
    const G1g = await p.evaluate(() => SYNQUENZER.wpGeom()), k5 = 5, mx = G1g.marks[k5], my = G1g.y + G1g.h * 0.5;
    const I2 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
    await p.mouse.move(mx, my); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(mx + i * 1.25, my); await sleep(16); } await p.mouse.up(); await sleep(400);
    const I3 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), G3 = await p.evaluate(() => SYNQUENZER.wpGeom());
    const tTo = G1g.view.a + (mx + 10 - G1g.x) / G1g.w * G1g.view.W, wantS = inv(I2.warp, tTo);
    const onL = Math.abs(((I3.warp.map.dst[k5 + 1] - I3.t0) / 0.25) - Math.round((I3.warp.map.dst[k5 + 1] - I3.t0) / 0.25)) * 250;
    ok(Math.abs(I3.marks[k5].t - wantS) * 1000 < 1.5 && I3.marks[k5].user && onL < 0.05, `[${nm}] Ziehen 10 px (quantisiert): Quelle folgt dem Finger (Abweichung ${((I3.marks[k5].t - wantS) * 1000).toFixed(2)} ms), Ziel wieder auf der Linie (${onL.toFixed(3)} ms)`);
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
    // Wellenform der STIMME-Spur (Matrix-Zelle) = gehörte Fassung (Hüllkurve aus der gespielten Fassung nachgerechnet)
    await p.evaluate(() => SYNQUENZER.wpClose()); await sleep(400);
    // die Zelle zeichnet tkMiniSvg(clip.audio) (STIMME-Spur liegt in P1 auf der 2. Spurbank – dieselbe Funktion, direkt gerufen)
    const cell = await p.evaluate(r => tkMiniSvg(S.tracks[r.track].clips[1].audio), r1);
    const PL = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id), raw = await p.evaluate(id => SYNQUENZER.tkBufRange(id), id);
    const env = (d, a0, a1, n) => { const i0 = Math.floor(a0 * SR), i1 = Math.min(d.length, Math.ceil(a1 * SR)), st = Math.max(1, (i1 - i0) / n), o = []; let mx = 1e-4; for (let k = 0; k < n; k++) { let pk = 0; const s0 = Math.floor(i0 + k * st), s1 = Math.min(i1, Math.floor(i0 + (k + 1) * st)); for (let j = s0; j < s1; j += 4) pk = Math.max(pk, Math.abs(d[j])); o.push(pk); mx = Math.max(mx, pk); } return o.map(v => Math.sqrt(v / mx)); };
    const seg = await p.evaluate(r => SYNQUENZER.getClip(r.track, 1).audio, r1);
    const eH = env(PL.data, seg.in, seg.out, 64), eR = env(raw, seg.in, seg.out, 64);
    const hs = [...cell.matchAll(/M[\d.]+ ([\d.]+)V([\d.]+)/g)].map(m => (+m[2] - +m[1]) / 88);
    const dH = Math.max(...hs.map((v, k) => Math.abs(v - Math.max(2 / 44, eH[k])))), dR = Math.max(...hs.map((v, k) => Math.abs(v - Math.max(2 / 44, eR[k]))));
    ok(hs.length === 64 && dH < 0.01 && dR > 0.1, `[${nm}] G1-02 Wellenform der STIMME-Spur (Matrix) = gehörte Fassung: Abweichung ${dH.toFixed(4)} (gegen Roh-Take ${dR.toFixed(3)})`);
    // Song: Song-Stimme (song.vox) mit demselben Take – Hüllkurve = gehörte Fassung (tkPeaks)
    const sv = await p.evaluate(r => { const a = SYNQUENZER.getClip(r.track, 1).audio; SYNQUENZER.setSong({bars: 2, lanes: [], carrier: [{beat: 0, target: null}], vox: [{id: 'V1', bar: 0, len: 2, take: a.take, in: a.in, out: a.out, at: 0}]}); SYNQUENZER.songView(true); const v = S.song.vox && S.song.vox[0]; const pk = v ? Array.from(tkPeaks(v.take, v, 64)) : null; return {pk, n: v ? 1 : 0}; }, r1);
    await sleep(500);
    await p.screenshot({path: OUTG + `/song-${nm}.png`});
    const dS = sv.pk ? Math.max(...sv.pk.map((v, k) => Math.abs(v - eH[k]))) : 9;
    ok(sv.pk && dS < 0.01, `[${nm}] G1-02 Song-Stimme: Hüllkurve = gehörte Fassung (Abweichung ${dS.toFixed(4)})`);
  }
  // Layout: Seite unverändert, nichts abgeschnitten, Knöpfe ≥ 44 hoch bzw. wie vorher
  const L = await p.evaluate(() => ({sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight}));
  ok(L.sw <= L.iw && L.sh <= L.ih, `[${nm}] Seite ohne Überlauf (${L.sw}×${L.sh} in ${L.iw}×${L.ih})`);
  ok(!H.errs.length, `[${nm}] keine Konsolenfehler ` + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
