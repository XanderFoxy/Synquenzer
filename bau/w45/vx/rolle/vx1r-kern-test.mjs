// VX1R Kern-Test (Schritt 2, ohne Oberfläche): synthetischer Gesang (Silben = Konsonant-Rauschen + Vokal mit Gipfel), Take per tkInject.
// Prüft: Anker am Spitzenwert, Konsonant/Vokal-Grenze, Quantisieren (Anker genau auf dem Raster ±2 ms, Einsatz bitgleich),
// Hybrid nach links (Ausklang nicht gestaucht, Ausblende, kein Knacken) und rechts (Vokal gedehnt ≤ 1,5×), Stück verschieben,
// Teilen/Verbinden, ein Undo je Aktion, Speichern/Laden (Normalisieren deep-equal, Container), Tonhöhe (G2).
// Aufruf: node vx1r-kern-test.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const file = path.resolve(process.argv[2]);
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const info = (m, d) => console.log('INFO ' + m + (d ? ' – ' + d : ''));
const b = await chromium.launch();
const errs = [];
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
try {
  const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  // Silben: Anker (Gipfel) bewusst neben dem 1/8-Raster (120 BPM → 0,25 s): spät → nach links, früh → nach rechts
  const SR = 48000, PK = .07, ANCH = [.52, 1.03, 1.47, 2.04, 2.47, 3.02], F = [220, 247, 262, 294, 330, 220];
  const r0 = await run(p, async o => {
    const {SR, PK, ANCH, F} = o, n = Math.round(3.6 * SR), x = new Float32Array(n);
    let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
    const ons = ANCH.map(a => a - PK), peaks = [];
    for (let k = 0; k < ANCH.length; k++) {
      const on = ons[k], nx = k + 1 < ons.length ? ons[k + 1] : on + .5, f = F[k];
      // Konsonant: Rauschen (hochpass) 45 ms, Pegel 0,12
      let lp = 0;
      for (let i = Math.round(on * SR); i < Math.round((on + .045) * SR); i++) { const u = (i / SR - on) / .045, r = rnd(); const h = r - lp; lp = r; x[i] += .12 * h * Math.sin(Math.PI * Math.min(1, u * 1.2)) ; }
      // Vokal: ab on + 50 ms, Anstieg 20 ms zum Gipfel (on + 70 ms), dann auf 0,45 abfallend, klingt bis 15 ms nach dem nächsten Einsatz (legato)
      const v0 = on + .05, v1 = nx + .015;
      for (let i = Math.round(v0 * SR); i < Math.min(n, Math.round(v1 * SR)); i++) {
        const t = i / SR - v0, T = v1 - v0;
        let e = t < .02 ? Math.sin(.5 * Math.PI * t / .02) : .45 + .55 * Math.exp(-(t - .02) / .04);
        if (t > T - .012) e *= Math.max(0, (T - t) / .012);
        let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f * h * t) / h;
        x[i] += .5 * e * s / 1.6;
      }
      peaks.push(on + PK);
    }
    const pcm = Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
    S.bpm = 120;
    const r = await SYNQUENZER.tkInject({pcm, sr: SR, scene: 0, at: 0, len: 2});
    await wait(300);
    const m = S.takes[r.id];
    m.marks = wpNormMarks(ons.map(t => ({t: Math.round(t * SR) / SR, conf: 1})), m.len / m.sr);   // feste Marken (Erkennung siehe INFO)
    let det = null; try { WP.det.delete(r.id); const d = await wpDetect(r.id); det = d && d.map(k => +k.t.toFixed(3)); } catch (e) { det = String(e); }
    return {id: r.id, sr: m.sr, len: m.len, det, ons, t0: wpT0(r.id), undo: UNDO.length};
  }, {SR, PK, ANCH, F});
  const id = r0.id;
  info('Take', JSON.stringify({id, sr: r0.sr, len: r0.len, t0: r0.t0}));
  info('Marken-Erkennung (wpDetect) auf dem synthetischen Gesang', JSON.stringify(r0.det) + ' · Einsätze ' + JSON.stringify(r0.ons.map(v => +v.toFixed(3))));

  /* 1 Analyse: Anker am Spitzenwert, Konsonant/Vokal-Grenze, Tonhöhe */
  const A = await run(p, async o => { const a = await window.__vx1.analyse(o.id); const x = wpBase(o.id).getChannelData(0), sr = o.SR;
    const pk = o.ANCH.map(t => { let bi = 0, bv = -1; for (let i = Math.round((t - o.PK) * sr); i < Math.round((t - o.PK + .12) * sr); i++) if (Math.abs(x[i]) > bv) { bv = Math.abs(x[i]); bi = i; } return bi / sr; });
    return {a, L: window.__vx1.list(o.id), pk}; }, {id, SR, ANCH, PK});
  info('Analyse', JSON.stringify({ms: A.a.ms, how: A.a.how, n: A.a.n}));
  const anErr = A.L.map((q, k) => Math.abs(q.at - ANCH[k]) * 1000), pkS = A.pk;
  ok(anErr.every(e => e <= 5), 'Anker liegt am Gipfel der Hüllkurve (±5 ms = eine Schwingung)', anErr.map(e => e.toFixed(1)).join(' '));
  const smpErr = A.L.map((q, k) => Math.abs(q.at - pkS[k]) * 1000);
  ok(smpErr.every(e => e <= .1), 'Anker = lautester Spitzenwert (Sample) in den ersten 120 ms', smpErr.map(e => e.toFixed(2)).join(' '));
  const vbErr = A.L.map((q, k) => q.vb == null ? 999 : (q.vb - (ANCH[k] - PK + .05)) * 1000);
  ok(vbErr.every(e => Math.abs(e) <= 15), 'Konsonant/Vokal-Grenze am Vokal-Beginn (±15 ms)', vbErr.map(e => e.toFixed(0)).join(' '));
  ok(A.L.every(q => q.uv.length && q.uv[0][0] < q.t + .02 && q.uv[0][1] > q.t + .02), 'stimmloser Anteil am Stück-Anfang erkannt', JSON.stringify(A.L.map(q => q.uv[0])));
  const mErr = A.L.map((q, k) => q.m == null ? 99 : q.m - (69 + 12 * Math.log2(F[k] / 440)));
  ok(mErr.every(e => Math.abs(e) <= .5), 'Tonhöhe des Stücks = Median (±0,5 HT)', mErr.map(e => e.toFixed(2)).join(' '));

  /* 2 Quantisieren alles 1/8, 100 %: Anker genau auf dem Raster, Einsatz bitgleich, Ausklang nicht gestaucht, kein Knacken */
  const Q = await run(p, async id => {
    const u0 = UNDO.length, okq = await window.__vx1.quant(id, {grid: '1/8', strength: 1});
    const L = window.__vx1.list(id), w = window.__vx1.warp(id);
    const R = await window.__vx1.render(id), X = Array.from(wpBase(id).getChannelData(0));
    return {okq, du: UNDO.length - u0, L, w, y: R && R.y, x: X, last: R && R.last, lab: UNDO[UNDO.length - 1].label};
  }, id);
  ok(Q.okq && Q.du === 1, 'Quantisieren = ein Undo-Schritt', Q.lab);
  ok(Q.w && Q.w.mode === 'hybrid' && Q.w.an && Q.w.an.length === Q.w.map.src.length, 'Karte im Modus Schneiden/Dehnen mit Anker je Punkt');
  const st = .25, gErr = Q.L.map(q => { const b = (q.da - r0.t0) / st; return Math.abs(b - Math.round(b)) * st * 1000; });
  ok(gErr.every(e => e <= 2), 'Anker-Ziel liegt auf der 1/8-Linie (±2 ms)', gErr.map(e => e.toFixed(2)).join(' '));
  ok(Q.L.every(q => q.dst < q.da && q.da - q.dst > .05), 'der Anschwung liegt vor dem Taktstrich (Marke-Ziel < Anker-Ziel)');
  ok(!!Q.y && Q.y.length === Q.x.length, 'Wiedergabe gerendert (gleiche Länge)', JSON.stringify(Q.last));
  const y = Q.y, x = Q.x;
  // Anker im gerenderten Signal: Einsatz-Bereich bitgleich verschoben (Marke … Anker + 20 ms)
  const bit = Q.L.map(q => { const s0 = Math.round(q.t * SR), d0 = Math.round(q.dst * SR), L = Math.round((q.an + .02) * SR); let eq = 0; for (let i = 0; i < L; i++) if (Math.abs(y[d0 + i] - x[s0 + i]) < 1e-7) eq++; return eq / L; });
  ok(bit.every(v => v === 1), 'Einsatz bis Anker + 20 ms bitgleich an das Ziel gelegt (nie gedehnt)', bit.map(v => v.toFixed(3)).join(' '));
  // Spitzenwert im Ausgang: die lauteste Stelle im Einschwingbereich liegt am Raster
  const pkOut = Q.L.map(q => { const a = Math.round(q.dst * SR), e = Math.round((q.dst + .12) * SR) - 1; let bi = a, bv = 0; for (let i = a; i < e; i++) { const v = Math.abs(y[i]); if (v > bv) { bv = v; bi = i; } } const t = bi / SR, g = Math.round((t - r0.t0) / st) * st + r0.t0; return (t - g) * 1000; });
  ok(pkOut.every(e => Math.abs(e) <= 3), 'gehörter Spitzenwert sitzt auf dem Taktstrich (±3 ms)', pkOut.map(e => e.toFixed(1)).join(' '));
  // Nach links (Stück 1, 3, 5 rücken früher): Ausklang des Vorgängers bis zur Ausblende unverändert (nicht gestaucht), dann leise
  const jumps = [], keep = [];
  const dif = (a, i0, i1) => { let m = 0; for (let i = Math.max(1, i0); i < i1; i++) m = Math.max(m, Math.abs(a[i] - a[i - 1])); return m; };
  for (let k = 1; k < Q.L.length; k++) {
    const q = Q.L[k], pv = Q.L[k - 1], sh = q.dst - q.t, shp = pv.dst - pv.t, bnd = Math.round((q.dst - .004) * SR);
    const ref = dif(x, Math.round((pv.t + pv.an + .03) * SR), Math.round((q.t - .02) * SR));   // Vokal des Vorgängers in der Quelle
    jumps.push({k, dir: sh < shp - 1e-4 ? 'links' : sh > shp + 1e-4 ? 'rechts' : '=', out: +dif(y, bnd - Math.round(.04 * SR), Math.round(q.dst * SR)).toFixed(4), ref: +ref.toFixed(4)});
    if (sh < shp - 1e-4) {   // Vorgänger: von seinem Ziel bis 30 ms vor der Grenze bitgleich (gleiche Geschwindigkeit, nur verschoben)
      const a = Math.round((pv.dst + pv.an + .02) * SR), e = bnd - Math.round(.032 * SR), off = Math.round(pv.t * SR) - Math.round(pv.dst * SR); let eq = 0; for (let i = a; i < e; i++) if (Math.abs(y[i] - x[i + off]) < 1e-7) eq++;
      keep.push({k, frac: +(eq / Math.max(1, e - a)).toFixed(4), ms: Math.round((e - a) / SR * 1000)});
    }
  }
  info('Grenzen', JSON.stringify(jumps));
  ok(keep.length >= 2 && keep.every(z => z.frac === 1), 'nach links: Ausklang des Vorgängers nicht gestaucht (bitgleich bis zur Ausblende)', JSON.stringify(keep));
  ok(jumps.every(j => j.out <= j.ref * 1.1 + .01), 'kein Knacken an den Schnitten (max. Sprung ≤ Sprung im Vokal der Quelle)', jumps.map(j => j.out + '/' + j.ref).join(' '));
  // harte Gegenprobe: ohne Ausblende wäre der Sprung an einer Links-Grenze groß
  {
    const j = jumps.find(z => z.dir === 'links'), q = Q.L[j.k], pv = Q.L[j.k - 1], off = Math.round(pv.t * SR) - Math.round(pv.dst * SR), i = Math.round((q.dst - .004) * SR);
    info('Gegenprobe harter Schnitt (Pegel des Vorgängers an der Grenze)', Math.abs(x[i + off]).toFixed(3));
  }
  // nach rechts (Lücke): Vokal gedehnt ≤ 1,5×
  const R2 = await run(p, async id => {
    const L = window.__vx1.list(id); const out = [];
    for (let k = 1; k < L.length; k++) { const q = L[k], pv = L[k - 1]; const slot = q.dst - pv.dst, len = q.t - pv.t; out.push({k, r: +(slot / len).toFixed(3)}); }
    return {out, last: WP.last};
  }, id);
  info('Platz/Länge je Stück', JSON.stringify(R2.out) + ' ' + JSON.stringify(R2.last));
  {
    // Dehnung messen: Vorgänger eines nach rechts rückenden Stücks – Energie bis zum Nachfolger (keine Stille-Lücke bei ≤ 1,5×)
    const q = Q.L.find((z, k) => k && z.dst - z.t > Q.L[k - 1].dst - Q.L[k - 1].t + 1e-4), k = Q.L.indexOf(q), pv = Q.L[k - 1];
    const a = Math.round((q.dst - .03) * SR), e = Math.round((q.dst - .006) * SR); let s = 0; for (let i = a; i < e; i++) s += y[i] * y[i];
    const rms = Math.sqrt(s / (e - a)), ratio = ((q.dst - pv.dst) - (pv.an + .02)) / ((q.t - pv.t) - (pv.an + .02));
    ok(ratio <= 1.5 ? rms > .02 : true, 'nach rechts: Vokal des Vorgängers gedehnt (keine Lücke bei ≤ 1,5×)', 'Faktor ' + ratio.toFixed(3) + ', Pegel vor dem Nachfolger ' + rms.toFixed(3));
  }

  // Hauptfaden-Rückfall (ohne Worker, Claude-App): derselbe Kern rechnet dasselbe
  const HF = await run(p, async id => { const w = window.__vx1.warp(id), b = wpBase(id), msg = vx1rMsg(b, w); const r = window.__vx1.dsp(Array.from(msg.x), msg.sr, {op: 'hyb', src: msg.src, dst: msg.dst, an: msg.an, pre: msg.pre, lock: msg.lock, maxr: msg.maxr});
    const y = WP.cache.get(id).buf.getChannelData(0); let mx = 0; for (let i = 0; i < y.length; i++) mx = Math.max(mx, Math.abs(y[i] - r.y[i])); return {mx, cut: r.cut, stretch: r.stretch, gap: r.gap}; }, id);
  ok(HF.mx < 1e-6, 'Hauptfaden-Rückfall rechnet bitgleich zum Worker', JSON.stringify(HF));
  /* 3 Stück verschieben (vd, Raster 1/16 am Anker), Teilen/Verbinden, Undo je Aktion */
  const M = await run(p, async id => {
    const u0 = UNDO.length, L0 = window.__vx1.list(id), k = 2, ta = L0[k].da + .11;
    const okm = await window.__vx1.move(id, k, ta, {grid: '1/16'});
    const L1 = window.__vx1.list(id), u1 = UNDO.length;
    const others = L1.every((q, i) => i === k || Math.abs(q.da - L0[i].da) < 1e-6);
    const t = (L1[3].vb + L1[3].end) / 2, oks = await window.__vx1.split(id, t), n2 = window.__vx1.list(id).length, u2 = UNDO.length;
    const okj = await window.__vx1.join(id, 3), n3 = window.__vx1.list(id).length, u3 = UNDO.length;
    undo(); await wait(50); const nU = window.__vx1.list(id).length;
    undo(); await wait(50); const nU2 = window.__vx1.list(id).length;
    undo(); await wait(50); const LU = window.__vx1.list(id);
    return {okm, du1: u1 - u0, da: L1[k].da, want: ta, others, oks, n0: L0.length, n2, du2: u2 - u1, okj, n3, du3: u3 - u2, nU, nU2, back: Math.abs(LU[k].da - L0[k].da) < 1e-6};
  }, id);
  ok(M.okm && M.du1 === 1, 'Stück verschieben = ein Undo-Schritt');
  ok(Math.abs((M.da - r0.t0) / .125 - Math.round((M.da - r0.t0) / .125)) * .125 <= .002 && Math.abs(M.da - M.want) <= .0625, 'verschobenes Stück rastet mit dem Anker auf 1/16 ein', 'Anker ' + M.da.toFixed(4) + ' (gezogen ' + M.want.toFixed(4) + ')');
  ok(M.others, 'die anderen Stücke bleiben an ihrem Platz');
  ok(M.oks && M.n2 === M.n0 + 1 && M.du2 === 1, 'Teilen: ein Stück mehr, ein Undo-Schritt');
  ok(M.okj && M.n3 === M.n0 && M.du3 === 1, 'Verbinden: wieder gleich viele, ein Undo-Schritt');
  ok(M.nU === M.n0 + 1 && M.nU2 === M.n0 && M.back, '↶ nimmt Verbinden, Teilen und Verschieben einzeln zurück');

  /* 4 Quantisieren nur Auswahl mit Stärke 50 % */
  const QS = await run(p, async id => {
    const L0 = window.__vx1.list(id); await window.__vx1.quant(id, {grid: 'off', strength: 0}); const L1 = window.__vx1.list(id);
    const u0 = UNDO.length; await window.__vx1.quant(id, {grid: '1/4', strength: .5, sel: [1]}); const L2 = window.__vx1.list(id);
    return {free: L1.map(q => +(q.da - q.at).toFixed(4)), a: L1[1].da, b: L2[1].da, du: UNDO.length - u0, rest: L2.every((q, i) => i === 1 || Math.abs(q.da - L1[i].da) < 1e-6)};
  }, id);
  ok(QS.free.every(v => Math.abs(v) < 1e-4), 'Raster „aus“ für alles = Original-Lage', JSON.stringify(QS.free));
  const tg = Math.round((QS.a - r0.t0) / .5) * .5 + r0.t0;
  ok(Math.abs(QS.b - (QS.a + (tg - QS.a) * .5)) <= .001 && QS.du === 1 && QS.rest, 'Auswahl quantisieren mit Stärke 50 %: halber Weg zur 1/4-Linie, nur dieses Stück', QS.a.toFixed(4) + ' → ' + QS.b.toFixed(4) + ' (Ziel ' + tg + ')');

  /* 5 Speichern/Laden: Normalisieren deep-equal, Container enthält die Daten, alte Takes unverändert */
  const SV = await run(p, async id => {
    await window.__vx1.quant(id, {grid: '1/8', strength: 1}); await window.__vx1.move(id, 1, window.__vx1.list(id)[1].da + .02, {grid: 'off'});
    const m = S.takes[id], n = tkNormTake(JSON.parse(JSON.stringify(m)));
    const same = JSON.stringify([n.marks, n.warp]) === JSON.stringify([m.marks, m.warp]);
    const zi = await SYNQUENZER.tkZipInfo(), wav = zi.files.some(f => f.name === 'takes/' + id + '.wav' && f.n > 1000), z = await SYNQUENZER.tkZipRoundtrip(), j = z.json ? JSON.parse(z.json) : null, tj = j && ((j.project && j.project.takes) || j.takes || {})[id];
    // alt: ein Take ohne VX1-Felder (Scheiben-Karte) bleibt Byte für Byte
    const old = {sr: m.sr, len: m.len, chunks: m.chunks, route: m.route, latMs: m.latMs, created: m.created, src: m.src, marks: [{t: .4, conf: 1}, {t: .9, conf: .5}], warp: {mode: 'slice', grid: 'auto', res: '1/16', strength: 1, swing: .5, bpm: 120, t0: 0, map: {v: 1, src: [0, .4, .9, 3.6], dst: [0, .42, .9, 3.6]}}};
    const on = tkNormTake(JSON.parse(JSON.stringify(old)));
    return {same, wav, dbg: {zk: j && Object.keys(j).slice(0, 30), tk: tj && Object.keys(tj), diff: same ? null : [JSON.stringify([n.marks, n.warp]).slice(0, 400), JSON.stringify([m.marks, m.warp]).slice(0, 400)]}, zip: z.ok, hy: !!(tj && tj.warp && tj.warp.mode === 'hybrid' && tj.warp.an), vd: !!(tj && tj.marks && tj.marks.some(k => k.vd != null)), an: !!(tj && tj.marks && tj.marks.every(k => k.an != null)),
      oldOk: on && !on.warp.an && on.warp.mode === 'slice' && on.marks.every(k => k.an == null && k.vd == null), oldKeys: on && Object.keys(on.marks[0]).join(',')};
  }, id);
  ok(SV.same, 'Speichern/Laden: Take mit Stücken normalisiert deep-equal', SV.same ? '' : JSON.stringify(SV.dbg.diff));
  ok(SV.zip && SV.wav && SV.hy && SV.vd && SV.an, 'Container (mit Audio): WAV des Takes, Anker, eigene Ziele und Modus enthalten', JSON.stringify(SV.dbg));
  ok(SV.oldOk, 'alte Takes (Scheiben-Karte, Marken ohne Anker) bleiben unverändert', SV.oldKeys);

  /* 6 Tonhöhe eines Stücks (G2, formanterhaltend) */
  const PT = await run(p, async id => {
    const u0 = UNDO.length; let okp = null; try { okp = await window.__vx1.pitch(id, 2, 1); } catch (e) { okp = String(e); }
    const m = S.takes[id], L = window.__vx1.list(id), q = L[2];
    const ns = m.pitch ? m.pitch.notes.map(n => ({t0: n.t0, t1: n.t1, sh: n.sh || 0})) : null;
    return {okp, du: UNDO.length - u0, ns, a: q.t, e: q.end};
  }, id);
  if (PT.ns) {
    const inP = PT.ns.filter(n => (n.t0 + n.t1) / 2 >= PT.a && (n.t0 + n.t1) / 2 < PT.e), outP = PT.ns.filter(n => !((n.t0 + n.t1) / 2 >= PT.a && (n.t0 + n.t1) / 2 < PT.e));
    ok(PT.okp === true && PT.du === 1 && inP.length && inP.every(n => n.sh === 1) && outP.every(n => !n.sh), 'Tonhöhe +1 nur im Stück (G2-Noten an den Grenzen geteilt), ein Undo', JSON.stringify(PT.ns.slice(0, 8)));
  } else ok(false, 'Tonhöhe: G2-Noten angelegt', JSON.stringify(PT));
  const RP = await run(p, async id => { const R = await window.__vx1.render(id, 0, 10); return {ok: !!R, ready: window.__vx1.ready(id)}; }, id);
  ok(RP.ok && RP.ready, 'Wiedergabe nach Tonhöhe + Zeitkarte fertig gerechnet (G2 unter der Zeitkarte)');
  await p.close();
} catch (e) { console.log('ABBRUCH ' + (e && e.stack || e)); bad++; }
ok(errs.length === 0, 'keine Seitenfehler', errs.slice(0, 5).join(' | '));
await b.close();
console.log('ERGEBNIS ' + (all - bad) + '/' + all + (bad ? ' – ' + bad + ' FEHLER' : ' – alles OK'));
process.exit(bad ? 1 : 0);
