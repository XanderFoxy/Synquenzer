// MK7 in Chromium: MK7-13 (M-PLATZ / M-SKIZZE / M-ANSICHT of the vocoder positions and 16 BÄNDER, LEDs, band levels <= 30 Hz,
// rAF), MK7-02 / 03 / 07 / 08 operation (SPIEL, HALTEN, SHIFT + 1 / 2, K-PEGEL, Init), MK7-15 ECO, MK7-11 probe. Usage: node v3-mk7-ui.mjs [index.html]
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK7/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 400)); } };
const SA = '#app{padding-left:47px!important;padding-right:47px!important}', HB = '#app{padding-bottom:21px!important}';
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], 'L1-SA': [844, 390, SA], 'L0-SA': [926, 428, SA], 'L1-HB': [844, 390, SA + HB]};
const INT = ['vol', 'arp', 'octd', 'octu', 'bank', 'side', 'write', 'shift', 'n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'timbre', 'w1', 'w2', 'k0', 'k1', 'k2', 'k3', 'k4', 'm1', 'm2'];
async function open(fmt) {
  const [w, h, css] = FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (css) await page.addStyleTag({content: css});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  return {ctx, page, errs};
}
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(page, k, dy, steps, dx) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= (steps || 10); s++) await page.mouse.move(x + (dx || 0) * s / (steps || 10), y - dy * s / (steps || 10)); await page.mouse.up(); await page.waitForTimeout(60); }
async function tap(page, k) { const b = await box(page, k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(150); }
const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
const measure = page => page.evaluate(INT => {
  const out = {bad: [], rects: {}};
  const body = document.querySelector('#synthSheet .mkbody'), pg = document.querySelector('#synthSheet .pg');
  if (!body) return {bad: ['kein Bedienfeld'], rects: {}};
  const pr = pg.getBoundingClientRect(), iw = innerWidth, ih = innerHeight;
  for (const e of body.querySelectorAll('.mkx')) {
    const r = e.getBoundingClientRect(), k = e.dataset.k; out.rects[k] = [r.left, r.top, r.width, r.height];
    if (r.left < -.5 || r.top < -.5 || r.right > iw + .5 || r.bottom > ih + .5) out.bad.push(k + ' außerhalb des Bildschirms');
    if (r.left < pr.left - .5 || r.top < pr.top - .5 || r.right > pr.right + .5 || r.bottom > pr.bottom + .5) out.bad.push(k + ' abgeschnitten (.pg)');
    for (const t of e.querySelectorAll('*')) {
      if (t.children.length || !t.textContent.trim() || t.closest('svg')) continue;
      const cs = getComputedStyle(t); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (t.clientWidth > 0 && t.scrollWidth > t.clientWidth + 1) out.bad.push(k + ' Beschriftung läuft über: ' + t.textContent);
      const rg = document.createRange(); rg.selectNodeContents(t); const q = rg.getBoundingClientRect();
      if (q.width && (q.left < r.left - 1 || q.right > r.right + 1 || q.top < r.top - 1 || q.bottom > r.bottom + 1)) out.bad.push(k + ' Text ragt heraus: ' + t.textContent);
    }
  }
  // the matrix rows (section name and the 5 short labels): nothing cut
  for (const t of body.querySelectorAll('.mrow *, .mx *')) { if (t.children.length || !t.textContent.trim()) continue; if (t.clientWidth > 0 && t.scrollWidth > t.clientWidth + 1) out.bad.push('Matrix läuft über: ' + t.textContent); }
  const present = INT.filter(k => out.rects[k]);
  for (const k of present) { const [x, y, w, h] = out.rects[k]; if (w < 43.5 || h < 43.5) out.bad.push(k + ' Trefferfläche ' + w.toFixed(1) + '×' + h.toFixed(1)); }
  for (let a = 0; a < present.length; a++) for (let b = a + 1; b < present.length; b++) {
    const A = out.rects[present[a]], B = out.rects[present[b]], ox = Math.min(A[0] + A[2], B[0] + B[2]) - Math.max(A[0], B[0]), oy = Math.min(A[1] + A[3], B[1] + B[3]) - Math.max(A[1], B[1]);
    if (ox > .5 && oy > .5) out.bad.push('Überlappung ' + present[a] + '/' + present[b]);
  }
  const de = document.documentElement, sb = document.querySelector('#synthSheet .sh-body');
  if (de.scrollWidth > iw + .5 || de.scrollHeight > ih + .5) out.bad.push('Seite scrollt ' + de.scrollWidth + '×' + de.scrollHeight);
  if (sb && (sb.scrollHeight > sb.clientHeight + 1 || sb.scrollWidth > sb.clientWidth + 1)) out.bad.push('Blatt-Körper scrollt');
  // the LCD lines: nothing cut (ellipsis allowed only as text-overflow, never wider than the screen)
  if (ED.lcd) { const r = ED.lcd.getBoundingClientRect(); if (r.right > iw + .5) out.bad.push('LCD ragt heraus'); }
  return out;
}, INT);
const maxMove = (a, b) => { let m = 0, k0 = ''; for (const k in a) if (b[k]) for (let i = 0; i < 4; i++) { const d = Math.abs(a[k][i] - b[k][i]); if (d > m) { m = d; k0 = k; } } return [m, k0]; };
const half = (page, h) => page.evaluate(h => { ED.tab = h === 'A' ? 'links' : 'rechts'; safeRebuild(buildSynthEd); }, h).then(() => page.waitForTimeout(250));


const VOC = () => { MKUI.setv(MKUI.KN.mode, 1, false); MKUI.render(); };
const AUDIO = async page => { await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready' && AU.synth[0] && AU.synth[1], null, {timeout: 10000}); };
const lcdTxt = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
// ---------------- MK7-13 M-PLATZ / M-ANSICHT / M-SKIZZE (green) in every format ----------------
await T('MK7-13-PLATZ', async () => {
  for (const fmt of Object.keys(FMT)) {
    const {ctx, page, errs} = await open(fmt);
    const pi = await page.evaluate(() => SYNQUENZER.mkPanel()), isHalf = /halb/.test(pi.fmt);
    const synthRects = (await measure(page)).rects;
    await page.evaluate(VOC); await page.waitForTimeout(150);
    const vocRects = (await measure(page)).rects, mvS = maxMove(synthRects, vocRects);
    ok('MK7-13 ' + fmt + ' M-ANSICHT Synth ↔ Vocoder', mvS[0] <= 2, 'max ' + mvS[0].toFixed(2) + ' px ' + mvS[1]);
    for (const h of isHalf ? ['A', 'B'] : [null]) {
      if (h) await half(page, h);
      const tag = fmt + (h ? (h === 'A' ? ' LINKS' : ' RECHTS') : ''), bad = []; let base = null, mv = [0, ''];
      const steps = [['SPIEL', 'MKUI.toSpiel()']];
      for (let k = 0; k < 11; k++) { steps.push(['W1-' + k, 'MKUI.setWahl(1, ' + k + ')']); steps.push(['W1-' + k + ' EB2', 'MKUI.P.shift = 1; MKUI.render()']); }
      for (const k of [0, 1, 2, 3, 4, 10]) steps.push(['W2-' + k, 'MKUI.setWahl(2, ' + k + ')']);
      for (const [nm, fn] of steps) {
        await page.evaluate(fn); await page.waitForTimeout(30);
        const m = await measure(page); for (const b of m.bad) bad.push(nm + ': ' + b);
        if (!base) base = m.rects; else { const d = maxMove(base, m.rects); if (d[0] > mv[0]) mv = [d[0], nm + ' ' + d[1]]; }
      }
      ok('MK7-13 ' + tag + ' M-PLATZ Vocoder (SPIEL, 11 + 11 Stellungen EDIT-WAHL 1 Ebene 1/2, K-PEGEL/K-PAN, SEQ –)', !bad.length, bad.slice(0, 5).join(' | '));
      ok('MK7-13 ' + tag + ' M-ANSICHT Stellungen/Ebenen', mv[0] <= 2, 'max ' + mv[0].toFixed(2) + ' px ' + mv[1]);
      // green names (hue 100-150 deg) in the matrix rows
      const hue = await page.evaluate(() => { MKUI.setWahl(1, 3); const e = document.querySelector('#synthSheet .mkx.mrow2 .mmn'); if (!e) return 120; const c = getComputedStyle(e).color.match(/\d+/g).map(Number).map(x => x / 255);
        const mx = Math.max(...c), mn = Math.min(...c), d = mx - mn; let h = 0; if (d) { if (mx === c[0]) h = 60 * (((c[1] - c[2]) / d) % 6); else if (mx === c[1]) h = 60 * ((c[2] - c[0]) / d + 2); else h = 60 * ((c[0] - c[1]) / d + 4); } return (h + 360) % 360; });
      ok('MK7-13 ' + tag + ' M-SKIZZE Vocoder grün (Matrix' + (h === 'A' ? ': keine in LINKS' : '') + ')', hue >= 100 && hue <= 150, 'Farbton ' + hue.toFixed(0) + '°');
      await page.evaluate(() => MKUI.toSpiel());
    }
    // M-SKIZZE zones in the vocoder (same rule as MK1-32: order and IoU in L1)
    const z = await page.evaluate(() => SYNQUENZER.mkPanel().zones.map(q => q.id).join(','));
    ok('MK7-13 ' + fmt + ' M-SKIZZE Zonen im Vocoder', /Z1/.test(z) || /Z11/.test(z), z);
    // 16 BÄNDER (both), in full width without cheeks, [◂ GERÄT]
    for (const a of ['chl', 'chp']) {
      await page.evaluate(a => { MKUI.P.bA = a; MKUI.viewOpen('baender'); }, a); await page.waitForTimeout(150);
      const r = await page.evaluate(() => { const body = document.querySelector('#synthSheet .mkbody'), pg = document.querySelector('#synthSheet .pg'), pr = pg.getBoundingClientRect(), bad = [], cols = [];
        for (const e of body.querySelectorAll('.mkx')) { const q = e.getBoundingClientRect(); if (q.left < pr.left - .5 || q.right > pr.right + .5 || q.top < pr.top - .5 || q.bottom > pr.bottom + .5) bad.push(e.dataset.k + ' abgeschnitten');
          if (/^b\d+$/.test(e.dataset.k)) cols.push([q.width, q.height]); else if (q.width < 43.5 || q.height < 43.5) bad.push(e.dataset.k + ' ' + q.width.toFixed(0) + '×' + q.height.toFixed(0));
          for (const t of e.querySelectorAll('*')) if (!t.children.length && t.clientWidth && t.scrollWidth > t.clientWidth + 1) bad.push(e.dataset.k + ' Text läuft über'); }
        const de = document.documentElement; if (de.scrollWidth > innerWidth + .5 || de.scrollHeight > innerHeight + .5) bad.push('Seite scrollt');
        return {bad, n: cols.length, w: Math.min(...cols.map(c => c[0])), h: Math.min(...cols.map(c => c[1])), cv: !!body.querySelector('canvas.mkbcv')}; });
      ok('MK7-13 ' + fmt + ' 16 BÄNDER (' + (a === 'chl' ? 'PEGEL' : 'PAN') + ')', !r.bad.length && r.n === 16 && r.cv, '16 Säulen ' + r.w.toFixed(0) + ' × ' + r.h.toFixed(0) + ' px, Canvas · ' + r.bad.slice(0, 3).join(' | '));
    }
    await page.evaluate(() => MKUI.viewClose());
    ok('MK7-13 ' + fmt + ' keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
    await ctx.close();
  }
});
// ---------------- operation ----------------
await T('MK7-BED', async () => {
  const {ctx, page, errs} = await open('L1'); await AUDIO(page);
  await page.evaluate(VOC); await page.waitForTimeout(150);
  let r = await page.evaluate(() => ({mode: SYNQUENZER.mkGet(0).mode, m: SYNQUENZER.mkPanel().matrix, k: SYNQUENZER.mkPanel().knobs.map(k => k && k.l)}));
  ok('MK7-BED SYNTH/VOC. → Vocoder (mode 3), SPIEL CUTOFF/RESONANZ/ATTACK/RELEASE/TEMPO', r.mode === 3 && r.k.join() === 'CUTOFF,RESONANZ,ATTACK,RELEASE,TEMPO', JSON.stringify(r));
  // MK7-02: SPIEL-CUTOFF = vocoder CUTOFF; SPIEL-ATTACK = EG2 only (EG1 deep-equal)
  const e1 = await page.evaluate(() => JSON.stringify(SYNQUENZER.mkGet(0).t[0].e1));
  await drag(page, 'k0', 60, 10); await drag(page, 'k2', 60, 10);
  r = await page.evaluate(() => ({cut: SYNQUENZER.mkGet(0).voc.cut, fcut: SYNQUENZER.mkGet(0).t[0].f.cut, e2a: SYNQUENZER.mkGet(0).t[0].e2.a, e1: JSON.stringify(SYNQUENZER.mkGet(0).t[0].e1)}));
  ok('MK7-02 SPIEL im Vocoder', r.cut > 5 && r.fcut === 127 && r.e2a > 5 && r.e1 === e1, 'voc.cut ' + r.cut + ', Filter-Cutoff unverändert ' + r.fcut + ', EG2 ATTACK ' + r.e2a + ', EG1 deep-equal ' + (r.e1 === e1));
  // MK7-08: the Sinus label FORM / WFM
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.o1.w', 3); MKUI.setWahl(1, 2); MKUI.lcdOf(MKUI.knobs()[1]); }); let l = await lcdTxt(page);
  ok('MK7-08 Beschriftung Sinus im Vocoder FORM/WFM', /STEUER 1 \(FORM\)/.test(l), l.slice(0, 80));
  await page.evaluate(() => { MKUI.lcdOf(MKUI.knobs()[2]); }); l = await lcdTxt(page);
  ok('MK7-08 STEUER 2 (WFM)', /STEUER 2 \(WFM\)/.test(l), l.slice(0, 80));
  // MK7-07: K-PEGEL A knob 1 moves bands 1 and 2 by the same step; SHIFT + 1 / + 2 with one undo each
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'voc.chl.1', 100); MKUI.setWahl(2, 0); });
  let u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await drag(page, 'k0', -60, 10);
  r = await page.evaluate(() => ({c: SYNQUENZER.mkGet(0).voc.chl.slice(0, 4), u: SYNQUENZER.undoInfo().n}));
  ok('MK7-07 K-PEGEL A Regler 1 = Bänder 1 und 2', 127 - r.c[0] === 100 - r.c[1] && r.c[0] < 127 && r.c[2] === 127 && r.u === u0 + 1, JSON.stringify(r));
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'voc.chp.4', -20); SYNQUENZER.mkSet(0, 'voc.chp.9', 33); });
  const before = await page.evaluate(() => JSON.stringify(SYNQUENZER.mkGet(0).voc.chp)); u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await tap(page, 'shift'); await tap(page, 'n0');
  r = await page.evaluate(() => ({chl: SYNQUENZER.mkGet(0).voc.chl, chp: JSON.stringify(SYNQUENZER.mkGet(0).voc.chp), u: SYNQUENZER.undoInfo().n}));
  ok('MK7-07 SHIFT + 1 Pegel zurücksetzen', r.chl.every(x => x === 127) && r.chp === before && r.u === u0 + 1, 'Pegel alle 127, Pan deep-equal, ' + (r.u - u0) + ' Undo');
  const chl0 = JSON.stringify(r.chl);
  await tap(page, 'shift'); await tap(page, 'n1');
  r = await page.evaluate(() => ({chl: JSON.stringify(SYNQUENZER.mkGet(0).voc.chl), chp: SYNQUENZER.mkGet(0).voc.chp, u: SYNQUENZER.undoInfo().n}));
  ok('MK7-07 SHIFT + 2 Pan zurücksetzen', r.chp.every(x => x === 0) && r.chl === chl0 && r.u === u0 + 2, 'Pan alle Mitte, Pegel deep-equal');
  // Init (⋯ and SHIFT + 3) keeps the vocoder
  await page.evaluate(() => initSound(0)); r = await page.evaluate(() => SYNQUENZER.mkGet(0).mode);
  await tap(page, 'shift'); await tap(page, 'n2'); const r2 = await page.evaluate(() => SYNQUENZER.mkGet(0).mode);
  ok('MK7-07 Init und SHIFT + 3 behalten den Vocoder', r === 3 && r2 === 3, 'mode ' + r + ' / ' + r2);
  // MK7-03: TIMBRE / HALTEN (LED 1), the hold in the sound, one undo; again = off
  u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await tap(page, 'timbre'); await page.waitForTimeout(300);
  r = await page.evaluate(() => ({h: SYNQUENZER.mkGet(0).voc.hold, led: document.querySelector('#synthSheet .mkx[data-k="timbre"] .mled').classList.contains('lon'), u: SYNQUENZER.undoInfo().n, l: ED.lcd.innerText}));
  ok('MK7-03 TIMBRE/HALTEN an', Array.isArray(r.h) && r.h.length === 16 && r.led && r.u === u0 + 1, 'hold ' + JSON.stringify(r.h && r.h.slice(0, 4)) + '… LED 1 ' + r.led + ' · ' + r.l.replace(/\s+/g, ' ').slice(0, 70));
  await tap(page, 'timbre'); await page.waitForTimeout(200);
  r = await page.evaluate(() => ({h: SYNQUENZER.mkGet(0).voc.hold, led: document.querySelector('#synthSheet .mkx[data-k="timbre"] .mled').classList.contains('lon'), efs: SYNQUENZER.mkGet(0).voc.efs}));
  ok('MK7-03 TIMBRE/HALTEN aus', r.h === null && !r.led && r.efs < 127, JSON.stringify(r));
  // FOLGER to 127 = hold (one gesture, one undo)
  await page.evaluate(() => MKUI.setWahl(1, 5)); u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await drag(page, 'k3', 160, 16); await page.waitForTimeout(300);
  r = await page.evaluate(() => ({efs: SYNQUENZER.mkGet(0).voc.efs, h: !!SYNQUENZER.mkGet(0).voc.hold, u: SYNQUENZER.undoInfo().n}));
  ok('MK7-03 FOLGER 127 = HALTEN', r.efs === 127 && r.h && r.u === u0 + 1, JSON.stringify(r));
  // the source list in the synth (wave Eingang): QUELLE 1 / 2 at knobs 4 / 5
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 0); SYNQUENZER.mkSet(0, 't.0.o1.w', 7); MKUI.setWahl(1, 2); });
  r = await page.evaluate(() => SYNQUENZER.mkPanel().knobs.map(k => k && k.l));
  ok('MK7-09 Welle Eingang: QUELLE 1/2 an Regler 4/5', r[3] === 'QUELLE 1 ▾' && r[4] === 'QUELLE 2 ▾', r.join(', '));
  ok('MK7-BED keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- MK7-13 band levels <= 30 Hz, rAF with 16 BÄNDER and a playing vocoder; probe "Vocoder" ----------------
await T('MK7-13-LIVE', async () => {
  const {ctx, page, errs} = await open('P1'); await AUDIO(page);
  await page.evaluate(VOC);
  await page.evaluate(() => { const Q = SYNQUENZER; Q.mkIn(0, 'e2', 1); const E = AU.synth[1]; E.on(9e6, 57, .8, AU.ctx.currentTime + .02); E.on(9e6 + 1, 64, .8, AU.ctx.currentTime + .02); E.flush();
    const A = AU.synth[0]; A.on(8e6, 48, .8, AU.ctx.currentTime + .02); A.on(8e6 + 1, 55, .8, AU.ctx.currentTime + .02); A.flush(); MKUI.P.bA = 'chl'; MKUI.viewOpen('baender'); });
  await page.waitForTimeout(500);
  const r = await page.evaluate(async () => { const E = AU.synth[0], n0 = E.mkLvN || 0, t0 = performance.now(); let fr = 0; const fps = []; let last = t0;
    await new Promise(res => { const f = () => { const n = performance.now(); fps.push(1000 / (n - last)); last = n; fr++; if (n - t0 < 3000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    fps.sort((a, b) => a - b); return {hz: ((E.mkLvN || 0) - n0) / ((performance.now() - t0) / 1000), fps: fps[fps.length >> 1], b: E.mkLv && E.mkLv.b ? E.mkLv.b.filter(x => x > 0).length : 0}; });
  ok('MK7-13 Bandpegel ≤ 30 Hz, rAF ≥ 55 fps', r.hz <= 31 && r.hz > 20 && r.fps >= 55 && r.b > 0, 'Meldungen ' + r.hz.toFixed(1) + ' je s · rAF-Median ' + r.fps.toFixed(1) + ' fps · ' + r.b + ' Bänder mit Pegel');
  const pr = await page.evaluate(() => SYNQUENZER.perfProbe(['voc']));
  ok('MK7-11 Leistungs-Probe „Vocoder“', pr && pr.cases && pr.cases[0] && pr.cases[0].fall === 'voc' && pr.cases[0].frames_ok && pr.net === 0, JSON.stringify(pr && pr.cases && pr.cases[0]).slice(0, 300));
  ok('MK7-13-LIVE keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- MK7-15 ECO: a hold sound of the vocoder stays silent with an LCD hint ----------------
await T('MK7-15', async () => {
  const {ctx, page, errs} = await open('P1'); await AUDIO(page);
  await page.evaluate(VOC);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'voc.hold', new Array(16).fill(110)); });
  const lv = async () => page.evaluate(async () => { const c = AU.ctx, an = c.createAnalyser(), A = AU.tracks[0].cut; an.fftSize = 2048; A.connect(an); inputDown(0, 60, .9); await new Promise(r => setTimeout(r, 500));   // the track's own output (no hall tail of other notes)
    const d = new Float32Array(2048); an.getFloatTimeDomainData(d); let m = 0; for (const x of d) m = Math.max(m, Math.abs(x)); inputUp(0, 60); await new Promise(r => setTimeout(r, 400)); A.disconnect(an); return m; });
  const w = await lv();
  await page.evaluate(() => SYNQUENZER.forceNative(true)); await page.waitForTimeout(1500);
  const e = await lv(); const msg = await page.evaluate(() => ecoMsg(0));
  await page.evaluate(() => SYNQUENZER.forceNative(false));
  ok('MK7-15 ECO: Vocoder stumm mit Hinweis', w > .001 && e <= w && e < 1e-4 && /Vocoder braucht den Worklet-Klang/.test(msg), 'Worklet ' + (20 * Math.log10(w)).toFixed(1) + ' dBFS · ECO ' + (e > 0 ? (20 * Math.log10(e)).toFixed(1) : '−∞') + ' dBFS · „' + msg + '“');
  ok('MK7-15 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
await browser.close();
console.log((fails ? 'FEHLER ' : 'OK ') + (n - fails) + '/' + n);
process.exit(fails ? 1 : 0);
