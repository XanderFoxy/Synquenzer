// MK2 in Chromium (Nachtrag 3 MK2-03 "≈", MK2-08 table build, MK2-10 surface, MK2-12 played, probe "Kern").
// Usage: node v3-mk2-ui.mjs <index.html>   (ONLY=<regex>)
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
const FILE = path.resolve(process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 400)); } };
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
async function open(fmt, o) {
  o = o || {}; const [w, h] = FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (o.longtask) await page.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (!o.noMk) { await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(500); }
  return {ctx, page, errs};
}
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(page, k, dy, steps) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= (steps || 10); s++) await page.mouse.move(x, y - dy * s / (steps || 10)); await page.mouse.up(); await page.waitForTimeout(60); }
async function tap(page, k) { const b = await box(page, k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(120); }
const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));

// ---------------- MK2-10 Oberfläche: EDIT-WAHL 2 PATCH 1-4, gestures, LCD, lists ----------------
await T('MK2-10', async () => {
  const {ctx, page, errs} = await open('L1');
  // EDIT-WAHL 2 to PATCH 2 by dragging (18 px per position; it starts at MOD-FX = 5)
  await drag(page, 'w2', -18 * 5 - 4, 12); await drag(page, 'w2', 18 + 4, 6);
  let pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK2-10 EDIT-WAHL 2 auf PATCH 2: Regler QUELLE · ZIEL · INTENSITÄT aktiv, Matrix-Zeile hell', pi.sel.wahl === 2 && pi.sel.pos === 1 && pi.knobs.slice(0, 3).map(k => k && k.l).join() === 'QUELLE,ZIEL,INTENSITÄT' && pi.knobs.slice(0, 3).every(k => !k.dark) && /PATCH 2/.test(pi.matrix[1]),
    JSON.stringify([pi.sel, pi.knobs.map(k => k && k.l), pi.matrix[1]]));
  // INTENSITÄT +: one gesture = one undo, the patch acts; LCD "PATCH 2 · LFO 1 → CUTOFF · +nn"
  const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await drag(page, 'k2', 60, 12);
  const r1 = await page.evaluate(() => ({i: SYNQUENZER.mkGet(0).t[0].p[1].i, u: SYNQUENZER.undoInfo().n}));
  const l1 = await lcd(page);
  ok('MK2-10 INTENSITÄT ziehen: ein Undo, LCD z. B. „PATCH 2 · LFO 1 → CUTOFF · +32“', r1.i > 0 && r1.u === u0 + 1 && /PATCH 2 · LFO 1 → CUTOFF · \+\d+/.test(l1), JSON.stringify(r1) + ' | ' + l1);
  // tap QUELLE: a list of 8 rows >= 44 px; choose MOD-RAD
  await tap(page, 'k0');
  const L = await page.evaluate(() => [...document.querySelectorAll('.pop .plist.mkl button')].map(b => [b.textContent.trim(), b.getBoundingClientRect().height]));
  const pick = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist.mkl button')].find(x => /MOD-RAD/.test(x.textContent)); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.mouse.click(pick[0], pick[1]); await page.waitForTimeout(150);
  const s1 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].p[1].s), l2 = await lcd(page);
  ok('MK2-10 Tipp auf QUELLE: Liste mit 8 Zeilen ≥ 44 px; MOD-RAD gewählt', L.length === 8 && L.every(x => x[1] >= 44) && s1 === 7 && /MOD-RAD → CUTOFF/.test(l2), L.map(x => x[0]).join('|') + ' → ' + s1 + ' | ' + l2);
  // ZIEL LFO 2 FREQ with LFO 2 TEMPO SYNC on: the LCD says it does not act
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.l2.sync', 1); });
  await tap(page, 'k1');
  const pick2 = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist.mkl button')].find(x => /LFO 2 FREQ/.test(x.textContent)); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.mouse.click(pick2[0], pick2[1]); await page.waitForTimeout(150);
  ok('MK2-10 ZIEL LFO 2 FREQ bei TEMPO SYNC: LCD „wirkt nicht“', /wirkt nicht/i.test(await lcd(page)), await lcd(page));
  // the list of EDIT-WAHL 2: PATCH rows not dark, with their route; the others still "kommt mit"
  await tap(page, 'w2');
  const R = await page.evaluate(() => [...document.querySelectorAll('.pop .plist.mkmx button')].map(b => [b.classList.contains('dark'), b.textContent.replace(/\s+/g, ' ').trim(), b.getBoundingClientRect().height]));
  await page.evaluate(() => closePop());
  ok('MK2-10 Liste EDIT-WAHL 2: 11 Zeilen ≥ 44 px, PATCH 1–4 aktiv mit Weg, MOD-FX … SEQ dunkel', R.length === 11 && R.every(x => x[2] >= 44) && R.slice(0, 4).every(x => !x[0] && /→/.test(x[1])) && R.slice(4).every(x => x[0]), R.slice(0, 5).map(x => (x[0] ? '▪' : '') + x[1].slice(0, 34)).join(' | '));
  // ◎ marks the PATCH positions that differ from INIT
  const dots = await page.evaluate(() => { UI.wia = true; MKUI.render(); return [...document.querySelectorAll('#synthSheet .mkx[data-k="w2"] .mtk')].map(t => t.classList.contains('mwd') ? 1 : 0); });
  await page.evaluate(() => { UI.wia = false; MKUI.render(); });
  ok('MK2-10 ◎: Punkt an PATCH 2 (weicht von INIT ab), sonst keiner', dots.join('') === '01000000000', dots.join(''));
  ok('MK2-10 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- MK2-03 / MK2-10: OSZ 1 Speicherwelle — STEUER 2 as a wave knob, "≈" in LCD and list ----------------
await T('MK2-03-UI', async () => {
  const {ctx, page, errs} = await open('P1');
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.o1.w', 5); MKUI.setWahl(1, 2); });
  const r = await page.evaluate(() => {
    const d = MKUI.knobs()[2], seen = []; MKUI.lcdOf(d);   // the first touch shows the hint (L10)
    for (let n = 1; n <= 64; n++) { MKUI.setv(d, n, false); MKUI.lcdOf(d); seen.push([n, MKUI.get(d), SYNQUENZER.mkGet(0).t[0].o1.c2, ED.lcd.innerText.replace(/\s+/g, ' ')]); }
    return {l: d.l, seen};
  });
  const bad = r.seen.filter(([n, g, c2, t]) => g !== n || c2 !== 2 * n - 2 || !t.includes('≈') || !t.includes('Speicherwelle ' + n));
  ok('MK2-03 jede Welle trägt „≈“ im LCD (64), STEUER 2 speichert 2n − 2', r.l === 'STEUER 2' && !bad.length, bad.slice(0, 2).map(x => x.join(' ')).join(' ;; ') || r.seen[11][3]);
  // knob gesture: a continuous knob with rounding (~200 px for 64 waves), one undo, haptic ticks, the LCD per step
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.o1.c2', 0); window.__ticks = 0; const h = window.haptic; window.haptic = k => { if (k === 'tick') window.__ticks++; return h && h(k); }; });
  const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await drag(page, 'k2', 100, 20);
  const g = await page.evaluate(() => ({n: Math.floor(SYNQUENZER.mkGet(0).t[0].o1.c2 / 2) + 1, c2: SYNQUENZER.mkGet(0).t[0].o1.c2, u: SYNQUENZER.undoInfo().n, ticks: window.__ticks}));
  ok('MK2-10 STEUER 2 (Speicherwelle) ziehen: stetig mit Rundung (≈ 200 px für 64), ein Undo, Haptik je Stufe', g.n >= 25 && g.n <= 40 && g.c2 % 2 === 0 && g.u === u0 + 1 && g.ticks >= 15, JSON.stringify(g));
  // tap: the list of 64 waves with group heads, rows >= 44 px, every row "≈", scrolls inside, the current one visible
  await tap(page, 'k2');
  const L = await page.evaluate(() => { const p = document.querySelector('.pop .plist.mkwv'); if (!p) return null; const b = [...p.querySelectorAll('button')], on = p.querySelector('.rb.on'), pr = p.getBoundingClientRect(), orr = on.getBoundingClientRect();
    return {n: b.length, minH: Math.min(...b.map(x => x.getBoundingClientRect().height)), approx: b.every(x => x.textContent.includes('≈')), heads: p.querySelectorAll('h5').length, scrolls: p.scrollHeight > p.clientHeight, onVisible: orr.top >= pr.top - 1 && orr.bottom <= pr.bottom + 1,
      over: [...p.querySelectorAll('button')].filter(x => x.scrollWidth > x.clientWidth + 1).length, page: document.documentElement.scrollWidth <= innerWidth}; });
  ok('MK2-03 / MK2-10 Liste der Speicherwellen: 64 Zeilen ≥ 44 px mit „≈“, 13 Gruppenköpfe, scrollt in sich, die gewählte sichtbar', L && L.n === 64 && L.minH >= 44 && L.approx && L.heads === 13 && L.scrolls && L.onVisible && !L.over && L.page, JSON.stringify(L));
  const pick = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist.mkwv button')].find(x => x.dataset.v === '61'); b.scrollIntoView({block: 'center'}); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await page.mouse.click(pick[0], pick[1]); await page.waitForTimeout(200);
  const p2 = await page.evaluate(() => ({c2: SYNQUENZER.mkGet(0).t[0].o1.c2, u: SYNQUENZER.undoInfo().n, lcd: ED.lcd.innerText.replace(/\s+/g, ' ')}));
  ok('MK2-10 Tipp auf Welle 61 in der Liste: STEUER 2 = 120, ein Undo, LCD „Speicherwelle 61 · Stimme 1 ≈“', p2.c2 === 120 && p2.u === u1 + 1 && /Speicherwelle 61 · Stimme 1 ≈/.test(p2.lcd), JSON.stringify(p2));
  // WELLE list: 8 rows, Eingang marked "MK7"; STEUER 1 at the stored wave: "ohne Wirkung"
  const w = await page.evaluate(() => { MKUI.lcdOf(MKUI.knobs()[1]); return ED.lcd.innerText.replace(/\s+/g, ' '); });
  ok('MK2-10 STEUER 1 bei der Speicherwelle: LCD „ohne Wirkung“', /ohne Wirkung/.test(w), w);
  ok('MK2-03-UI keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- MK2-08 Tabellen-Bau ----------------
await T('MK2-08', async () => {
  const {ctx, page, errs} = await open('L1', {longtask: true});
  // a just-loaded sound: its wave goes to the context at once (single wave) / in slices (octave wave); time from load to the post
  const t = await page.evaluate(async () => {
    const W = MKUI.wv.WV, sentAt = n => { const c = W.ctx.get(AU.ctx); return c && c.sent.has(n); };
    // from the call that loads the sound (incl. its UI work) to the post of the wave to the worklet (WV.at)
    const go = async (n) => { const s = SYNQUENZER.getSound(0); s.p.mk.t[0].o1.w = 5; s.p.mk.t[0].o1.c2 = 2 * n - 2; const t0 = performance.now(); SYNQUENZER.setSound(0, s);
      while (!sentAt(n) && performance.now() - t0 < 2000) await new Promise(r => setTimeout(r, 1)); return W.at[n] - t0; };
    ensureAudio(); await new Promise(r => setTimeout(r, 300));
    const a = await go(23), b = await go(61);
    return {single: a, oct: b, info0: SYNQUENZER.mkInfo()};
  });
  ok('MK2-08 die Welle eines eben geladenen Sounds ist ≤ 30 ms nach dem Laden im Kontext (Einzel- und Oktav-Welle)', t.single <= 30 && t.oct <= 30, 'Einzelwelle ' + t.single.toFixed(1) + ' ms, Oktav-Welle ' + t.oct.toFixed(1) + ' ms');
  // load all 64 (the idle slices): no longtask > 50 ms; table memory per context; a second AM track sends 0 bytes
  const r = await page.evaluate(async () => {
    window.__lt.length = 0; const t0 = performance.now(); MKUI.wv.all();
    while (MKUI.wv.WV.built.size < 64 && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 20));
    await new Promise(r => setTimeout(r, 300)); const t1 = performance.now() - t0;
    const i1 = SYNQUENZER.mkInfo(), lt = window.__lt.filter(x => x[0] >= performance.timeOrigin * 0 && x[1] > 50).length;
    SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.setSound(1, SYNQUENZER.getSound(0)); SYNQUENZER.setEngine(2, 'mk'); const s2 = SYNQUENZER.getSound(0); s2.p.mk.t[0].o1.c2 = 2 * 40 - 2; SYNQUENZER.setSound(2, s2);
    await SYNQUENZER.audition(1, 60, 200); await SYNQUENZER.audition(2, 64, 200); await new Promise(r => setTimeout(r, 1500));
    const i2 = SYNQUENZER.mkInfo();
    return {ms: t1, i1, i2, lt};
  });
  ok('MK2-08 Laden aller 64 Wellen: keine longtask > 50 ms', r.lt === 0 && r.i1.built === 64, r.lt + ' longtasks, ' + r.i1.built + ' Wellen in ' + r.ms.toFixed(0) + ' ms');
  ok('MK2-08 Tabellenspeicher je Kontext ≤ 16 MB, einmal gezählt; zweite und dritte AM-Spur übertragen 0 Byte', r.i1.tableBytes <= 16 * 1048576 && r.i2.tableBytes === r.i1.tableBytes && r.i2.posts === r.i1.posts && r.i1.tables === 64,
    (r.i1.tableBytes / 1048576).toFixed(2) + ' MB in ' + r.i1.tables + ' Wellen, Posts ' + r.i1.posts + ' → ' + r.i2.posts + ', Bytes → ' + (r.i2.tableBytes / 1048576).toFixed(2) + ' MB');
  // the same mkTables in Node gives bit-identical tables (hash of every wave's bytes)
  const hc = await page.evaluate(() => { const h = []; for (let n = 1; n <= 64; n++) { const b = new Uint8Array(MKUI.MKTAB.wave(n).d); let x = 2166136261; for (let i = 0; i < b.length; i++) { x ^= b[i]; x = Math.imul(x, 16777619) >>> 0; } h.push(x); } return h; });
  const html = fs.readFileSync(FILE, 'utf8'), a = html.indexOf('/*MKT{*/'), z = html.indexOf('/*}MKT*/'), MT = new Function(html.slice(a, z) + '\n;return MKTAB;')();
  const hn = []; for (let n = 1; n <= 64; n++) { const b = new Uint8Array(MT.wave(n).d); let x = 2166136261; for (let i = 0; i < b.length; i++) { x ^= b[i]; x = Math.imul(x, 16777619) >>> 0; } hn.push(x); }
  const diff = hc.filter((x, i) => x !== hn[i]).length;
  ok('MK2-08 Node (mk-node) baut mit demselben mkTables bitgleiche Tabellen (64 Wellen)', diff === 0, diff + ' abweichend');
  ok('MK2-08 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- MK2-12 gespielt: mkRender at 187.5 Hz ----------------
await T('MK2-12', async () => {
  const {ctx, page, errs} = await open('L1');
  let r = await page.evaluate(async () => {
    const M = MKUI.MKTAB, SR = 48000, F = 187.5, note = 69 + 12 * Math.log2(F / 440), out = [];
    const amp = (x, i0, n, f) => { let re = 0, im = 0, ws = 0; for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n), a = 2 * Math.PI * f * i / SR; re += x[i0 + i] * w * Math.cos(a); im += x[i0 + i] * w * Math.sin(a); ws += w; } return 2 * Math.hypot(re, im) / ws; };
    for (let n = 1; n <= 64; n++) {
      const s = factorySound(INIT_IDS.mk); Object.assign(s.p.mk.t[0], {o1: {w: 5, c1: 0, c2: 2 * n - 2}, f: Object.assign(s.p.mk.t[0].f, {cut: 127, res: 0}), a: Object.assign(s.p.mk.t[0].a, {gate: 1})});
      const x = (await SYNQUENZER.mkRender(s, [[0, 'on', note, .8]], {sec: .5})).l, r = M.r(n), ft = F / r, P = Math.round(SR / ft * 8), i0 = 9600;
      // the fundamental of the table at f / r: the strongest of the near frequencies +-3 ct (2 ct steps of the DFT)
      let best = [0, 0]; for (let c = -6; c <= 6; c += .5) { const a = amp(x, i0, 16384, ft * Math.pow(2, c / 1200)); if (a > best[0]) best = [a, c]; }
      const ref = M.isOct(n) ? M.harm(n, F).A : M.data()[n].a, mx = Math.max(...Array.from({length: 16}, (_, k) => ref[k + 1] || 0));
      const d = []; for (let k = 1; k <= 16; k++) { const L0 = 20 * Math.log10((ref[k] || 1e-12) / mx); if (L0 < -40) continue; d.push(20 * Math.log10(amp(x, i0, P, k * ft) + 1e-12) - L0); }
      const med = d.slice().sort((a, b) => a - b)[d.length >> 1], dev = Math.max(...d.map(v => Math.abs(v - med)));
      out.push([n, best[1], dev, d.length]);
    }
    // 61-64 at the octave points themselves (C3, C4): there one set alone plays
    const ex = [];
    for (const n of [61, 62, 63, 64]) for (const nt of [48, 60]) { const f = 440 * Math.pow(2, (nt - 69) / 12);
      const s = factorySound(INIT_IDS.mk); Object.assign(s.p.mk.t[0], {o1: {w: 5, c1: 0, c2: 2 * n - 2}, f: Object.assign(s.p.mk.t[0].f, {cut: 127, res: 0}), a: Object.assign(s.p.mk.t[0].a, {gate: 1})});
      const x = (await SYNQUENZER.mkRender(s, [[0, 'on', nt, .8]], {sec: .5})).l, ref = M.harm(n, f).A, mx = Math.max(...Array.from({length: 16}, (_, k) => ref[k + 1])), d = [];
      for (let k = 1; k <= 16; k++) { const L0 = 20 * Math.log10(ref[k] / mx); if (L0 < -40) continue; d.push(20 * Math.log10(amp(x, 9600, Math.round(SR / f * 8), k * f) + 1e-12) - L0); }
      const med = d.slice().sort((a, b) => a - b)[d.length >> 1]; ex.push([n, nt, Math.max(...d.map(v => Math.abs(v - med)))]); }
    return {out, ex};
  });
  const ex = r.ex; r = r.out;
  const badF = r.filter(x => Math.abs(x[1]) > 1), badL = r.filter(x => x[2] > 1 && !(x[0] >= 61)), oct = r.filter(x => x[0] >= 61);
  const w = r.slice().sort((a, b) => b[2] - a[2]);
  ok('MK2-12 gespielt (mkRender 187,5 Hz): Grundton der Tabelle bei f/r ± 1 ct (3, 34, 35: 93,75 Hz; 28, 59: 125,14 Hz)', !badF.length, badF.length ? badF.map(x => x[0] + ':' + x[1]).join(' ') : 'alle 64');
  const w2 = r.filter(x => x[0] < 61).sort((a, b) => b[2] - a[2]);
  ok('MK2-12 gespielt: Teiltöne 1–16 je ≤ 1 dB von der Quelle (Teiltöne ≥ −40 dB; 1–60, 35 von der Hülle in Hz)', !badL.length, (badL.length ? 'über 1 dB: ' + badL.map(x => x[0] + ' (' + x[2].toFixed(2) + ')').join(', ') + '; ' : '') + 'größte ' + w2.slice(0, 4).map(x => x[0] + ': ' + x[2].toFixed(2) + ' dB').join(', '));
  const exb = ex.filter(x => x[2] > 1);
  ok('MK2-12 gespielt 61–64 an den Oktav-Stützpunkten C3/C4: ≤ 1 dB von der Hülle in Hz', !exb.length, ex.map(x => x[0] + '@' + x[1] + ': ' + x[2].toFixed(2)).join(', '));
  console.log('INFO MK2-12 61–64 bei 187,5 Hz (Mischung der Oktav-Sätze C3/C4): Abweichung ' + oct.map(x => x[0] + ': ' + x[2].toFixed(1) + ' dB').join(', ') + ' – Lücke, s. CHANGES');
  ok('MK2-12 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- Leistungs-Probe: Fall "Kern" = Speicherwelle + Sinus x ----------------
await T('PROBE', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 500)); const o = await mkLoad().probe(['kern'], {sec: 4}); return o; });
  ok('MK2 Leistungs-Probe Fall „Kern“ (Speicherwelle + Sinus×, 4 s): läuft, frames_ok, keine Netzaufrufe', r && r.cases && r.cases[0] && r.cases[0].reports >= 2 && r.frames_ok && r.net === 0, JSON.stringify({load_med: r.load_med, load_max: r.load_max, frames_ok: r.frames_ok, q: r.quantum_max_ms, lt: r.longtasks, net: r.net}));
  ok('MK2 Probe keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
await browser.close();
console.log(fails ? fails + ' FAIL' : 'alles PASS');
process.exit(fails ? 1 : 0);
