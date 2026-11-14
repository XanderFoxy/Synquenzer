// NX1 – Nachzüge Gesang-Editor + Import. Aufruf: node nx1-test.mjs <abs/index.html> <abs/basis.html> <abs/fotos-ordner>
//  a  Song-Stimme: Lineal zählt Song-Takte (Taktart-Karte)       b  Ecke „1 Stück“ / „2 Stücke“
//  c  Marken-Editor zeigt Schneiden/Dehnen, bleibt 'hybrid'       d  Rückfall ohne Worker stückweise (≤ 50 ms), bitgleich
//  e  Import dehnt Audio aufs Projekt-Tempo (91,6 → 92; 100 → 92), Tonhöhe bleibt, Schläge auf dem Raster, ein ↶
//  f  Matrix-Zelle „Original“ zeigt die Welle (wie Gesang)       g  Guide „Audio/MIDI importieren“
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), basis = path.resolve(process.argv[3]), out = path.resolve(process.argv[4] || 'fotos');
fs.mkdirSync(out, {recursive: true});
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const info = (m, d) => console.log('INFO ' + m + (d ? ' – ' + d : ''));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const B = fs.readFileSync(basis, 'utf8'), i0 = B.indexOf('function vx1rRun(M, m) {'), i1 = B.indexOf('\n/* ---------- Analyse (Worker', i0);
const OLD = B.slice(i0, i1);                                     // der Kern der Basis (zum Vergleich: gleiche Zahlen, gleiche Zeit)
const b = await chromium.launch();
const errs = [];
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const ttap = async (cdp, x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const SR = 48000, PK = .07, ANCH = [.52, 1.03, 1.47, 2.04, 2.47, 3.02], F = [220, 247, 262, 294, 330, 220];
// synthetischer Gesang (wie vx1-test), reps × 3,6 s
const SING = async o => {
  const {SR, PK, ANCH, F, reps} = o, P = 3.6, n = Math.round(P * reps * SR), x = new Float32Array(n);
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
  const ons = []; for (let r = 0; r < reps; r++) ANCH.forEach(a => ons.push(a - PK + r * P));
  for (let k = 0; k < ons.length; k++) {
    const on = ons[k], nx = k + 1 < ons.length ? ons[k + 1] : on + .5, f = F[k % 6]; let lp = 0;
    for (let i = Math.round(on * SR); i < Math.round((on + .045) * SR); i++) { const u = (i / SR - on) / .045, r = rnd(); const h = r - lp; lp = r; x[i] += .12 * h * Math.sin(Math.PI * Math.min(1, u * 1.2)); }
    const v0 = on + .05, v1 = Math.min(nx + .015, n / SR);
    for (let i = Math.round(v0 * SR); i < Math.min(n, Math.round(v1 * SR)); i++) {
      const t = i / SR - v0, T = v1 - v0; let e = t < .02 ? Math.sin(.5 * Math.PI * t / .02) : .45 + .55 * Math.exp(-(t - .02) / .04);
      if (t > T - .012) e *= Math.max(0, (T - t) / .012);
      let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f * h * t) / h; x[i] += .5 * e * s / 1.6;
    }
  }
  return {x, ons};
};
try {
  /* ================= Seite 1: Gesang-Editor + Marken-Editor + Rückfall ================= */
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  const r0 = await run(p, async o => {
    const SING = eval('(' + o.SING + ')'); const {x, ons} = await SING(Object.assign({reps: 1}, o));
    const pcm = Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
    S.bpm = 120;
    const r = await SYNQUENZER.tkInject({pcm, sr: o.SR, scene: 0, at: 0, len: 2}); await wait(300);
    const m = S.takes[r.id]; m.marks = wpNormMarks(ons.map(t => ({t: Math.round(t * o.SR) / o.SR, conf: 1})), m.len / m.sr);
    wpSetLyrics(r.id, 'la le-li lo lu na');
    return {id: r.id, st: stimmeT()};
  }, {SR, PK, ANCH, F, SING: SING.toString()});
  const id = r0.id, st = r0.st;
  info('Take', JSON.stringify(r0));

  /* ---- c (vorher): Marken-Editor eines Takes ohne Anker sieht aus wie bisher ---- */
  const c0 = await run(p, async o => { wpOpen({t: o.st, s: 0}); await wait(400); const bs = [...EL.wpSheet.querySelectorAll('.wpmode button')].map(b => ({m: b.dataset.m, t: b.textContent, vis: b.getBoundingClientRect().width > 0})); wpClose(); await wait(150); return bs; }, r0);
  ok(c0.length === 3 && c0.filter(z => z.vis).map(z => z.m).join() === 'stretch,slice', 'c Marken-Editor ohne Gesang-Bearbeitung: nur Dehnen │ Scheiben sichtbar (wie bisher)', JSON.stringify(c0));

  /* ---- Gesang-Editor bearbeiten: Quantisieren → 'hybrid' ---- */
  await run(p, async id => { await window.__vx1.quant(id, {grid: '1/8', strength: 1}); await window.__vx1.render(id); }, id);
  const w0 = await run(p, id => S.takes[id].warp.mode, id);
  ok(w0 === 'hybrid', 'c Gesang-Editor quantisiert → Modus hybrid', w0);

  /* ---- c: Marken-Editor zeigt Schneiden/Dehnen, Umschalten bleibt hybrid ---- */
  await run(p, async o => { wpOpen({t: o.st, s: 0}); await wait(500); }, r0);
  const segS = () => run(p, () => [...EL.wpSheet.querySelectorAll('.wpmode button')].map(b => { const r = b.getBoundingClientRect(); return {m: b.dataset.m, t: b.textContent, vis: r.width > 0, on: b.getAttribute('aria-pressed') === 'true', w: Math.round(r.width), h: Math.round(r.height), fit: b.scrollWidth <= b.clientWidth + 1}; }));
  const s1 = await segS();
  const hy = s1.find(z => z.m === 'hybrid');
  ok(hy && hy.vis && hy.on && s1.filter(z => z.on).length === 1, 'c Marken-Editor zeigt „' + (hy && hy.t) + '“ als gewählten Modus (nicht Dehnen/Scheiben)', JSON.stringify(s1));
  ok(s1.every(z => !z.vis || (z.h >= 44 && z.fit)), 'c Modus-Knöpfe 44 px hoch, Text passt (428 px)', s1.map(z => z.t + ' ' + z.w + '×' + z.h + (z.fit ? '' : ' ABGESCHNITTEN')).join(' · '));
  await p.screenshot({path: out + '/nx1-marken-hybrid-hochkant.png'});
  const tapMode = async m => { const c = await run(p, m => { const b = EL.wpSheet.querySelector('.wpmode button[data-m="' + m + '"]'); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, m); await ttap(cdp, c[0], c[1]); await sleep(300); };
  const u0 = await run(p, () => UNDO.length);
  await tapMode('stretch');
  const m1 = await run(p, id => ({mode: S.takes[id].warp.mode, u: UNDO.length, lbl: UNDO[UNDO.length - 1].label}), id);
  await tapMode('hybrid');
  const m2 = await run(p, id => ({mode: S.takes[id].warp.mode, u: UNDO.length, lbl: UNDO[UNDO.length - 1].label, an: (S.takes[id].warp.an || []).length}), id);
  const s2 = await segS();
  ok(m1.mode === 'stretch' && m2.mode === 'hybrid' && m2.an > 0 && m1.u === u0 + 1 && m2.u === u0 + 2 && s2.find(z => z.m === 'hybrid').on, 'c Dehnen → Schnitt+Dehnen: Modus wieder hybrid (nicht slice), Anker da, je ein ↶', JSON.stringify({m1, m2}));
  // Raster-Chip im Marken-Editor behält hybrid
  await run(p, async () => { const b = [...EL.wpSheet.querySelectorAll('.wpchips button')].find(z => z.dataset.v === '1/16'); b.click(); await wait(400); });
  const m3 = await run(p, id => S.takes[id].warp.mode, id);
  ok(m3 === 'hybrid', 'c Raster 1/16 im Marken-Editor: bleibt hybrid', m3);
  await run(p, async () => { undo(); await wait(200); });
  for (const [w, h] of [[926, 428], [926, 370]]) {
    await p.setViewportSize({width: w, height: h}); await sleep(600);
    await run(p, async o => { if (!WP.ed) wpOpen({t: o.st, s: 0}); await wait(500); }, r0);
    const sq = await segS();
    ok(sq.filter(z => z.vis).length === 3 && sq.every(z => !z.vis || (z.h >= 44 && z.fit)), 'c Modus-Knöpfe quer ' + w + '×' + h + ': drei sichtbar, 44 px, Text passt', sq.map(z => z.t + ' ' + z.w + '×' + z.h).join(' · '));
    await p.screenshot({path: out + '/nx1-marken-hybrid-' + w + 'x' + h + '.png'});
  }
  await p.setViewportSize({width: 428, height: 926}); await sleep(600);
  await run(p, async () => { wpClose(); closePop(); await wait(200); });

  /* ---- a: Song-Stimme ab Takt 3 – Lineal zählt Song-Takte; Taktart-Karte ---- */
  await run(p, async o => {
    songEnsure(); if (S.song.bars < 8) songSetBars(S.song, 8); const m = S.takes[o.id];
    S.song.vox = tkNormVox([{bar: 2, len: 3, take: o.id, in: 0, out: +(m.len / m.sr).toFixed(6), at: 0}]); songChanged(); await wait(200);
    window.__nxT = []; const f0 = CanvasRenderingContext2D.prototype.fillText;
    if (!window.__nxHook) { window.__nxHook = 1; CanvasRenderingContext2D.prototype.fillText = function (t, x, y, w) { if (window.__nxT && this.canvas === (ED.roll && ED.roll.el.ruler)) window.__nxT.push(String(t)); return f0.call(this, t, x, y, w); }; }
  }, r0);
  const ruler = vox => run(p, async o => {
    closeRoll(); await wait(150);
    if (o.vox) vx1rOpen({vox: S.song.vox[0].id}); else { selectSlot(o.st, 0); vx1rOpen({t: o.st, s: 0}); }
    for (let i = 0; i < 100 && !(window.__vx1.ed() && window.__vx1.ed().n); i++) await wait(50);
    ED.roll.cmd && 0; ED.roll.showPage && ED.roll.showPage(0); await wait(200); window.__nxT = []; ED.roll.render(); await wait(50);
    return {nums: [...new Set(window.__nxT.filter(t => /^\d+$/.test(t)))], fmt: ED.rollInfo && ED.rollInfo.textContent, head: EL.rollSheet.querySelector('.sh-title') && EL.rollSheet.querySelector('.sh-title').textContent};
  }, Object.assign({vox}, r0));
  const ra = await ruler(true), rb = await ruler(false);
  ok(ra.nums.join() === '3,4,5', 'a Song-Stimme (Takt 3–5): Lineal zählt die Song-Takte 3, 4, 5', JSON.stringify(ra));
  ok(rb.nums.join() === '1,2', 'a Szene-Clip: Lineal unverändert 1, 2', JSON.stringify(rb));
  const tkm = await run(p, async () => {
    S.song.marks = marksNorm([{a: 3, len: 2, ts: '3/4', name: 'T'}], S.song.bars); tkBump(); songChanged(); await wait(100);
    const T = nx1VoxTk(S.song.vox[0].id); return {beat: [0, 1, 2, 3].map(k => T.beat(k)), at: [0, 3.9, 4, 6.9, 7, 10].map(b => T.at(b)), lab: [0, 1, 2].map(T.lab), plain: tkPlain()};
  });
  ok(!tkm.plain && tkm.beat.join() === '0,4,7,10' && tkm.at.join() === '0,0,1,1,2,3' && tkm.lab.join() === '3,4,5', 'a Taktart-Karte (Takt 4–5 in 3/4): Takte 4+3+3 Schläge, Lineal 3, 4, 5', JSON.stringify(tkm));
  const rc = await ruler(true);
  ok(rc.nums.join() === '3,4,5', 'a mit Taktart-Karte: Lineal zeigt 3, 4, 5', JSON.stringify(rc));
  await run(p, async () => { delete S.song.marks; tkBump(); songChanged(); await wait(100); });

  /* ---- b: Ecke „1 Stück“ / „2 Stücke“ / ALLE ---- */
  await ruler(false);
  const corner = () => run(p, () => { const c = ED.roll.el.acts.querySelector('.pr-corner'); return c ? c.textContent : null; });
  const k0 = await corner();
  // Tipp auf ein Stück (Touch) wählt es
  const xy = await run(p, () => window.__vx1.xy(1));
  await ttap(cdp, xy.x, xy.y); await sleep(350);
  const k1 = await corner();
  await run(p, () => ED.roll.selectIdx([0, 1, 2])); await sleep(100);
  const k3 = await corner();
  ok(k0 === 'ALLE' && k1 === '1 Stück' && k3 === '3 Stücke', 'b Ecke der Aktionsleiste: ALLE → „1 Stück“ (Tipp) → „3 Stücke“', [k0, k1, k3].join(' | '));
  await p.screenshot({path: out + '/nx1-gesang-ecke-hochkant.png'});
  const kI = await run(p, async () => { closeRoll(); await wait(150); const t = S.tracks.findIndex(z => z.kind === 'synth' && !z.stimme); S.tracks[t].clips[0] = S.tracks[t].clips[0] || {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}], key: S.key}; selectSlot(t, 0); openRoll(t, 0); await wait(400); ED.roll.selectIdx([0]); await wait(50); const c = ED.roll.el.acts.querySelector('.pr-corner').textContent; closeRoll(); await wait(150); return c; });
  ok(kI === '1 Note', 'b Instrumente unverändert: „1 Note“', kI);
  await run(p, async () => { closeRoll(); await wait(100); });

  /* ---- d: Kern = Basis (bitgleich, gleiche Zeit); ohne Worker stückweise ≤ 50 ms ---- */
  const d1 = await run(p, async o => {
    const old = eval('(' + o.OLD + ')');
    const SING = eval('(' + o.SING + ')'); const {x, ons} = await SING(Object.assign({reps: 17}, o));   // ~61 s, 102 Stücke
    const sr = o.SR, marks = ons.map(t => Math.round(t * sr) / sr);
    const eqA = (a, b) => { if (!a || !b || a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && !(a[i] !== a[i] && b[i] !== b[i])) return false; return true; };
    const va = {op: 'vxa', x, sr, marks};
    let t = performance.now(); const A0 = old(VSM, va); const tOld = performance.now() - t;
    t = performance.now(); const A1 = vx1rRun(VSM, va); const tNew = performance.now() - t;
    const sameA = ['env', 'pk', 'rms', 'zcr', 'vc', 'f0', 'kind', 'an', 'lead'].every(k => eqA(A0[k], A1[k]));
    // hybrid: jedes 3. Stück 40 ms später, jedes 5. 50 ms früher
    const src = marks.slice(), dst = marks.map((v, k) => v + (k % 3 === 1 ? .04 : k % 5 === 2 ? -.05 : 0)), an = Array.from(A1.an);
    const hm = {op: 'hyb', x, sr, src, dst, an, pre: .004, lock: .02, maxr: 1.5};
    t = performance.now(); const H0 = old(VSM, hm); const thOld = performance.now() - t;
    t = performance.now(); const H1 = vx1rRun(VSM, hm); const thNew = performance.now() - t;
    // Worker (Zeitkarten-Worker) = Hauptfaden
    const Hw = await wpCall(Object.assign({}, hm)), hw = WP.how;
    // ohne Worker: stückweise, Uhr misst die längste Pause des Hauptfadens
    window.__nx1.reset(); let gap = 0, last = performance.now(), on = true; const tick = () => { const n = performance.now(); gap = Math.max(gap, n - last); last = n; if (on) setTimeout(tick, 0); }; setTimeout(tick, 0);
    const Wsave = WP.w; WP.w = false;
    t = performance.now(); const A2 = await wpCall(Object.assign({}, va)); const H2 = await wpCall(Object.assign({}, hm)); const tLoc = performance.now() - t, how = WP.how;
    WP.w = Wsave; on = false; await wait(20);
    const st = window.__nx1.st();
    return {n: x.length, k: marks.length, sameA, sameH: eqA(H0.y, H1.y), sameW: eqA(H1.y, Hw.y), hw, sameL: eqA(A1.kind, A2.kind) && eqA(A1.an, A2.an) && eqA(A1.env, A2.env) && eqA(H1.y, H2.y), how,
      t: {vxaOld: Math.round(tOld), vxaNew: Math.round(tNew), hybOld: Math.round(thOld), hybNew: Math.round(thNew), local: Math.round(tLoc)}, st, gap: +gap.toFixed(1), cut: H1.cut, stretch: H1.stretch};
  }, {SR, PK, ANCH, F, SING: SING.toString(), OLD});
  info('d Kern', JSON.stringify(d1));
  ok(d1.sameA && d1.sameH, 'd Kern als Generator rechnet bitgleich zur Basis (Analyse + Schneiden/Dehnen, 61 s, ' + d1.k + ' Stücke)', 'vxa ' + d1.t.vxaOld + '→' + d1.t.vxaNew + ' ms, hyb ' + d1.t.hybOld + '→' + d1.t.hybNew + ' ms');
  ok(d1.t.vxaNew <= d1.t.vxaOld * 1.25 + 30 && d1.t.hybNew <= d1.t.hybOld * 1.25 + 30, 'd am Stück (Worker) nicht langsamer als die Basis (≤ +25 %)', JSON.stringify(d1.t));
  ok(d1.sameW && d1.hw === 'worker', 'd Worker-Ergebnis = Hauptfaden-Ergebnis (bitgleich)', d1.hw);
  ok(d1.sameL && d1.how === 'hauptfaden' && d1.st.runs === 2 && d1.st.steps > 4, 'd ohne Worker: stückweise gerechnet, Ergebnis bitgleich', 'Schritte ' + d1.st.steps + ', gesamt ' + d1.t.local + ' ms');
  ok(d1.st.maxMs <= 50 && d1.gap <= 60, 'd ohne Worker: Hauptfaden nie > 50 ms am Stück', 'längster Schritt ' + d1.st.maxMs + ' ms, längste Pause ' + d1.gap + ' ms (vorher am Stück ' + (d1.t.vxaOld + d1.t.hybOld) + ' ms)');
  // App-Weg ohne Worker: Take quantisieren → Analyse + Render laufen stückweise
  const d2 = await run(p, async id => {
    const Wsave = WP.w; WP.w = false; VX1R.ana.clear(); WP.cache.clear(); WP.old.clear(); window.__nx1.reset();
    await window.__vx1.quant(id, {grid: '1/16', strength: 1}); const R = await window.__vx1.render(id);
    const r = {ok: !!R, how: WP.how, st: window.__nx1.st(), mode: S.takes[id].warp.mode}; WP.w = Wsave; undo(); await wait(100); return r;
  }, id);
  ok(d2.ok && d2.how === 'hauptfaden' && d2.st.runs >= 1 && d2.st.maxMs <= 50 && d2.mode === 'hybrid', 'd App-Weg ohne Worker (Quantisieren im Gesang-Editor): klingt, stückweise', JSON.stringify(d2));
  await ctx.close();

  /* ================= Seite 2: Import ================= */
  const ctx2 = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const q = await ctx2.newPage(); const cdq = await ctx2.newCDPSession(q);
  q.on('pageerror', e => errs.push(String(e))); q.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await q.goto('file://' + file); await q.waitForTimeout(1500);
  // Lied als WAV (im Browser gebaut): Bass-Trommel auf jedem Schlag, Hi-Hat auf den Achteln, Dauerton 440 Hz, Akkord je Takt
  const SONG = (o) => {
    const {sr, bpm, bars, t0} = o, sp = 60 / bpm, n = Math.round((t0 + bars * 4 * sp + 1) * sr), x = new Float32Array(n);
    let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
    const roots = [0, 5, 7, 3], beats = [];
    for (let k = 0; k < bars * 4; k++) {
      const tb = t0 + k * sp, i0 = Math.round(tb * sr); beats.push(tb);
      for (let i = 0; i < Math.round(.09 * sr); i++) { const t = i / sr; x[i0 + i] += (k % 4 ? .45 : .7) * Math.sin(2 * Math.PI * (55 + 60 * Math.exp(-t / .02)) * t) * Math.exp(-t / .03); }
      const ih = Math.round((tb + sp / 2) * sr); for (let i = 0; i < Math.round(.02 * sr); i++) x[ih + i] += .12 * rnd() * Math.exp(-i / sr / .006);
    }
    for (let i = 0; i < n; i++) { const t = i / sr, bar = Math.max(0, Math.floor((t - t0) / (4 * sp))), r = roots[bar % 4]; x[i] += .12 * Math.sin(2 * Math.PI * 440 * t) + .05 * Math.sin(2 * Math.PI * 130.81 * Math.pow(2, r / 12) * t); }
    const L = n, buf = new ArrayBuffer(44 + L * 2), v = new DataView(buf), ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); v.setUint32(4, 36 + L * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, L * 2, true);
    for (let i = 0; i < L; i++) v.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, Math.round(x[i] * 26000))), true);
    return {buf, beats};
  };
  // Schläge im Take messen: Einsatz der Bass-Trommel (erste Probe über 0,25) nahe der Erwartung
  const MEAS = (o) => {
    const m = S.takes[o.take], x = tkBuffer(o.take).getChannelData(0), sr = m.sr, sp = 60 / S.bpm, err = [], f = [];
    for (let k = 0; k < o.nb; k++) {
      const e = (o.first + k) * sp; let i = Math.max(0, Math.round((e - .03) * sr)); const z = Math.round((e + .03) * sr);
      while (i < z && Math.abs(x[i]) < .25) i++; if (i < z) err.push((i / sr - e) * 1000);
    }
    // Tonhöhe des Dauertons zwischen den Schlägen (0,15–0,28 s nach dem Schlag)
    for (const k of [3, Math.floor(o.nb / 2), o.nb - 3]) {
      const a = Math.round(((o.first + k) * sp + .15) * sr), N = Math.round(.12 * sr); let best = 0, bl = 0; const c = [];
      for (let l = Math.floor(sr / 470); l <= Math.ceil(sr / 410); l++) { let s = 0, e1 = 0, e2 = 0; for (let i = 0; i < N; i++) { s += x[a + i] * x[a + i + l]; e1 += x[a + i] ** 2; e2 += x[a + i + l] ** 2; } c[l] = s / Math.sqrt(e1 * e2 + 1e-12); }
      for (let l = Math.floor(sr / 470) + 1; l < Math.ceil(sr / 410); l++) if (c[l] > best && c[l] >= c[l - 1] && c[l] >= c[l + 1]) { best = c[l]; bl = l; }
      const pp = .5 * (c[bl - 1] - c[bl + 1]) / (c[bl - 1] - 2 * c[bl] + c[bl + 1]); f.push(+(sr / (bl + (isFinite(pp) ? pp : 0))).toFixed(2));
    }
    return {n: err.length, max: +Math.max(...err.map(Math.abs)).toFixed(2), mean: +(err.reduce((a, b) => a + b, 0) / err.length).toFixed(2), first: +err[0].toFixed(2), last: +err[err.length - 1].toFixed(2), f};
  };
  // e1: leeres Projekt, Lied 91,6 BPM → Projekt 92, gedehnt
  const e1 = await run(q, async o => {
    const SONG = eval('(' + o.SONG + ')'); const {buf} = SONG({sr: 48000, bpm: 91.6, bars: 24, t0: 0});
    IMP1.known = 91.6; const s0 = JSON.stringify(sx14State()), bpm0 = S.bpm, u0 = UNDO.length;
    await window.__imp1.ui.file(buf, 'lied-916.wav');
    for (let i = 0; i < 400 && !(IMP1.cur && IMP1.cur.st === 'fertig'); i++) await wait(50);
    const c = IMP1.cur; const cb = c.bpm;
    let gap = 0, last = performance.now(), on = true; const tick = () => { const n = performance.now(); gap = Math.max(gap, n - last); last = n; if (on) setTimeout(tick, 0); }; setTimeout(tick, 0);
    const t0 = performance.now(); const r = window.__imp1.ui.place('scenes'); const madeRun = c.made;
    for (let i = 0; i < 1200 && !(IMP1.lastPlace && IMP1.lastPlace.take); i++) await wait(50);
    on = false; const ms = Math.round(performance.now() - t0);
    const lp = IMP1.lastPlace, m = S.takes[lp.take];
    for (let i = 0; i < 100 && !tkBuffer(lp.take); i++) { tkLoad(lp.take); await wait(50); }
    return {cb, r0: r, madeRun, ms, gap: +gap.toFixed(1), bpm: S.bpm, bpm0, du: UNDO.length - u0, lbl: UNDO[UNDO.length - 1].label, take: lp.take, track: lp.track, len: m.len, nIn: c.x.length, imp: m.imp, nx: window.__nx1.st().imp, s0, toast: (document.querySelector('#toast') || {}).textContent || ''};
  }, {SONG: SONG.toString()});
  info('e1', JSON.stringify(Object.assign({}, e1, {s0: undefined})));
  const qx = 91.6 / 92;
  ok(e1.r0 === null && /angepasst/.test(e1.madeRun || ''), 'e leeres Projekt, Lied 91,6 BPM: erst wird gerechnet (Hinweis im Blatt), dann abgelegt', e1.madeRun);
  ok(e1.bpm === 92 && Math.abs(e1.len - Math.round(e1.nIn * qx)) <= 2 && e1.imp && e1.imp.bpm === 92, 'e Projekt 92 BPM, Audio auf 91,6/92 gedehnt (Länge ' + e1.len + ' = ' + e1.nIn + ' × 0,99565), Take merkt 92', JSON.stringify(e1.imp));
  ok(e1.du === 1, 'e ein ↶ für alles', e1.lbl);
  ok(e1.gap <= 120, 'e Hauptfaden bleibt frei, während der Worker dehnt', 'längste Pause ' + e1.gap + ' ms, Dehnen ' + (e1.nx && e1.nx.ms) + ' ms für ' + (e1.nIn / 48000).toFixed(1) + ' s Audio');
  const M1 = await run(q, (o) => { const MEAS = eval('(' + o.MEAS + ')'); const m = S.takes[o.take]; const t1 = m.imp.t1, first = Math.round(t1 / (60 / S.bpm)); return MEAS({take: o.take, first, nb: 96 - 1}); }, {MEAS: MEAS.toString(), take: e1.take});
  info('e1 Messung', JSON.stringify(M1));
  ok(M1.n >= 90 && M1.max <= 12 && Math.abs(M1.last - M1.first) <= 8, 'e jeder Schlag im gedehnten Take liegt auf dem 92-BPM-Raster (±12 ms, kein Weglaufen über 24 Takte)', 'max ' + M1.max + ' ms, erster ' + M1.first + ', letzter ' + M1.last + ' (ungedehnt wäre der letzte ' + Math.round(95 * (60 / 91.6 - 60 / 92) * 1000) + ' ms daneben)');
  ok(M1.f.every(v => Math.abs(v - 440) <= .6), 'e Tonhöhe bleibt (Dauerton 440 Hz)', M1.f.join(' / ') + ' Hz (umgerechnet ohne Dehnen wäre ' + (440 / qx).toFixed(1) + ')');
  // f: Matrix-Zelle der Spur „Original“ zeigt die Welle (wie Gesang)
  await run(q, async () => { closePop(); UI.dirty.all = true; await wait(600); });
  const f1 = await run(q, (o) => { const cells = [...document.querySelectorAll('#clipGrid .slot')].filter(e => e.closest('[data-t="' + o.t + '"]') || e.dataset.t == o.t); const rowCells = cells.length ? cells : []; const sv = [...document.querySelectorAll('#clipGrid .slot .mini svg path')].map(p => (p.getAttribute('d') || '').split('M').length - 1);
    const C = (UI.cells || []); return {paths: sv, sig: (() => { try { return tkCellSig(S.tracks[o.t].clips[0]).slice(0, 3); } catch (e) { return String(e); } })(), mini: (() => { try { return (tkMiniSvg(S.tracks[o.t].clips[0].audio).match(/M/g) || []).length; } catch (e) { return -1; } })()}; }, {t: e1.track});
  ok(f1.sig === 'au:' && f1.mini >= 60 && f1.paths.some(n => n >= 60), 'f Matrix-Zelle „Original“: Welle wie bei Gesang-Clips (dieselbe Zeichnung, 64 Säulen)', JSON.stringify({sig: f1.sig, mini: f1.mini, paths: f1.paths.filter(n => n > 1).length}));
  await q.screenshot({path: out + '/nx1-import-original-hochkant.png'});
  // e2: Projekt hat schon Audio (92) – Lied 100 BPM als eine Spur → bleibt 92, Audio gedehnt
  const e2 = await run(q, async o => {
    const SONG = eval('(' + o.SONG + ')'); const {buf} = SONG({sr: 48000, bpm: 100, bars: 16, t0: 0});
    IMP1.known = 100; IMP1.lastPlace = null;
    await window.__imp1.ui.file(buf, 'lied-100.wav');
    for (let i = 0; i < 400 && !(IMP1.cur && IMP1.cur.st === 'fertig' && IMP1.cur.name === 'lied-100'); i++) await wait(50);
    const c = IMP1.cur, u0 = UNDO.length, tgt = window.__nx1.target(c);
    window.__imp1.ui.place('track');
    for (let i = 0; i < 1200 && !(IMP1.lastPlace && IMP1.lastPlace.take); i++) await wait(50);
    const lp = IMP1.lastPlace, m = S.takes[lp.take];
    for (let i = 0; i < 100 && !tkBuffer(lp.take); i++) { tkLoad(lp.take); await wait(50); }
    return {tgt, bpm: S.bpm, du: UNDO.length - u0, take: lp.take, len: m.len, nIn: c.x.length, imp: m.imp, nx: window.__nx1.st().imp, own: Object.keys(S.song.own || {}).length};
  }, {SONG: SONG.toString()});
  info('e2', JSON.stringify(e2));
  ok(e2.tgt === 92 && e2.bpm === 92 && Math.abs(e2.len - Math.round(e2.nIn * 100 / 92)) <= 2 && e2.du === 1, 'e Projekt mit Audio (92): Lied 100 BPM bleibt bei 92, Audio auf 100/92 gedehnt, ein ↶', JSON.stringify({len: e2.len, imp: e2.imp}));
  const M2 = await run(q, (o) => { const MEAS = eval('(' + o.MEAS + ')'); const m = S.takes[o.take]; const first = Math.round(m.imp.t1 / (60 / S.bpm)); return MEAS({take: o.take, first, nb: 63}); }, {MEAS: MEAS.toString(), take: e2.take});
  ok(M2.n >= 60 && M2.max <= 12 && M2.f.every(v => Math.abs(v - 440) <= .6), 'e 100 → 92: Schläge auf dem Raster (±12 ms), Tonhöhe bleibt 440 Hz', JSON.stringify(M2));
  // ↶ nimmt alles zurück (Stand vorher), ↶ noch einmal = leeres Projekt wie vorher
  const e3 = await run(q, async o => { undo(); await wait(150); const a = S.bpm; undo(); await wait(150); return {a, bpm: S.bpm, same: JSON.stringify(sx14State()) === o.s0}; }, {s0: e1.s0});
  ok(e3.a === 92 && e3.same, 'e ↶ ↶: Stand wie vor beiden Importen (sx14State gleich)', JSON.stringify({a: e3.a, bpm: e3.bpm}));
  // e4: ganzzahliges Tempo im leeren Projekt → nicht gedehnt (wie bisher)
  const e4 = await run(q, async o => {
    const SONG = eval('(' + o.SONG + ')'); const {buf} = SONG({sr: 48000, bpm: 96, bars: 8, t0: 0});
    IMP1.known = 96; IMP1.lastPlace = null; window.__nx1.reset();
    const n0 = (window.__nx1.st().imp || {}).n;
    await window.__imp1.ui.file(buf, 'lied-96.wav');
    for (let i = 0; i < 400 && !(IMP1.cur && IMP1.cur.st === 'fertig' && IMP1.cur.name === 'lied-96'); i++) await wait(50);
    const r = window.__imp1.ui.place('scenes'); const lp = IMP1.lastPlace, m = lp && S.takes[lp.take];
    return {sync: !!r, bpm: S.bpm, len: m && m.len, nIn: IMP1.cur.x.length, imp: m && m.imp};
  }, {SONG: SONG.toString()});
  ok(e4.sync && e4.bpm === 96 && e4.len === e4.nIn, 'e Tempo passt (96 in leeres Projekt): sofort abgelegt, Audio unverändert (bitgleich wie bisher)', JSON.stringify(e4));
  await run(q, async () => { undo(); await wait(150); });
  // g: Guide-Eintrag
  const g1 = await run(q, async () => {
    const e = ui1Entries().find(x => x.id === 'midiimp'); const hit = (ui1Search('mp3 importieren') || []).slice(0, 3).map(x => x.id || x.e && x.e.id || x);
    closePop(); const ok = e.go(); await wait(500); const t = ui1Find(e.q); const r = {n: e.n, w: e.w, hit: JSON.stringify(hit).slice(0, 200), go: ok !== false, found: !!t, txt: t && t.textContent.trim().slice(0, 40)}; closePop(); return r;
  });
  ok(g1.n === 'Audio/MIDI importieren' && /midiimp/.test(g1.hit) && g1.found && /Audio\/MIDI importieren/.test(g1.txt), 'g Guide „Audio/MIDI importieren“: Suche „mp3 importieren“ findet ihn, Sprung zeigt den Knopf', JSON.stringify(g1));
  await ctx2.close();
} catch (e) { bad++; console.log('FEHLER Ausnahme – ' + (e && e.stack || e)); }
await b.close();
const errs2 = errs.filter(e => !/favicon|Failed to load resource/.test(e));
ok(!errs2.length, 'keine Fehler in der Konsole', errs2.slice(0, 5).join(' | '));
console.log((bad ? 'FEHLER ' + bad : 'ALLE OK') + ' (' + (all - bad) + '/' + all + ')');
process.exit(bad ? 1 : 0);
