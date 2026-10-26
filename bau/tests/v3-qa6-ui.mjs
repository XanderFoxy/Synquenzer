// QA (acceptance lens) MK6 in Chromium: recording end cases in the app, first note after load through mkRender, column editor with
// real touch (CDP), tools via the pop buttons, matrix row. Usage: node v3-qa6-ui.mjs <index.html>  (ONLY=<regex>)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const log = (id, c, info) => console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info);
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { console.log('ERR ' + id + ' ' + String(e.stack || e).slice(0, 600)); } };
async function open(w, h) {
  const ctx = await browser.newContext({viewport: {width: w || 390, height: h || 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.setKbMode('play'); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { SYNQUENZER.keyOn(72); }); await page.waitForTimeout(300); await page.evaluate(() => { SYNQUENZER.keyOff(72); });
  await page.waitForFunction(() => AU.synth[0] && AU.synth[0].node, null, {timeout: 10000}); await page.waitForTimeout(300);
  return {ctx, page, errs};
}
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(page, k, dy, steps, ms) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= steps; s++) { await page.mouse.move(x, y - dy * s / steps); if (ms) await page.waitForTimeout(ms); } await page.mouse.up(); await page.waitForTimeout(60); }
async function tap(page, k) { const b = await box(page, k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(150); }
const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
const seqOf = page => page.evaluate(() => SYNQUENZER.mkGet(0).t[0].seq);
const undoN = page => page.evaluate(() => SYNQUENZER.undoInfo().n);

// ---- recording ends? (a) LAUF Einmal already run out, (b) LAENGE 1, (c) control LAENGE 4 Schleife ----
for (const [id, set, waitPre] of [['Q-REC Einmal abgelaufen', {last: 4, run: 0}, 1200], ['Q-REC LÄNGE 1', {last: 1, run: 1}, 300], ['Q-REC Kontrolle LÄNGE 4', {last: 4, run: 1}, 300]]) {
  await T(id, async () => {
    const {ctx, page, errs} = await open();
    await page.evaluate(s => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(0, 't.0.f.cut', 40); Q.mkSet(0, 't.0.seq.last', s.last); Q.mkSet(0, 't.0.seq.run', s.run); Q.mkSet(0, 't.0.seq.res', 3); Q.keyOn(60); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }, set);
    await page.waitForTimeout(waitPre);
    const before = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].seq.q[0]);
    await tap(page, 'rec');
    await page.evaluate(() => MKUI.setWahl(1, 5)); await page.waitForTimeout(100);
    await drag(page, 'k1', 100, 50, 40);   // CUTOFF up over ~2 s (= 4 cycles of 4 steps at 1/16 @ 120)
    let ended = true; try { await page.waitForFunction(() => { const E = AU.synth[0]; return E && E.mkRecN >= 1; }, null, {timeout: 3000}); } catch (e) { ended = false; }
    const pn = await page.evaluate(() => SYNQUENZER.mkPanel()), q = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0]), l = await lcd(page);
    log(id, ended, (ended ? 'Aufnahme beendet, ' : 'keine Aufnahme-Meldung 5 s nach Beginn; Bedienfeld rec=' + JSON.stringify(pn.rec) + ', ') + 'SEQ 1 ZIEL ' + q.seq.q[0].k + ' Werte ' + q.seq.q[0].v.slice(0, 6).join(',') + ' (vorher ' + before.k + '), CUTOFF ' + q.f.cut + ', LCD „' + l.slice(0, 90) + '“' + (errs.length ? ' Konsole: ' + errs.join(' / ') : ''));
    await page.evaluate(() => SYNQUENZER.keyOff(60)); await ctx.close();
  });
}

// ---- first note through the app worklet (mkRender) with SEQ A-HK ATTACK +63 vs. stored ATTACK 63 ----
await T('Q-FIRST mkRender', async () => {
  const {ctx, page, errs} = await open();
  const r = await page.evaluate(async () => {
    const Q = SYNQUENZER, D = x => JSON.parse(JSON.stringify(x));
    Q.mkSet(0, 't.0.e2.a', 0); Q.mkSet(0, 't.0.e2.s', 127);
    const base = D(Q.getSound(0));
    const a = D(base); a.p.mk.t[0].seq = {on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3, q: [{k: 21, m: 1, v: new Array(16).fill(63)}, {k: 0, m: 1, v: new Array(16).fill(0)}, {k: 0, m: 1, v: new Array(16).fill(0)}]};
    const b = D(base); b.p.mk.t[0].e2.a = 63;
    const ev = [[0, 'on', 60, .8], [.3, 'off', 60], [.6, 'on', 60, .8]];
    const ra = await Q.mkRender(a, ev, {sec: .9}), rb = await Q.mkRender(b, ev, {sec: .9});
    const lv = (x, t0, t1) => { let e = 0; const i0 = Math.round(t0 * 48000), i1 = Math.round(t1 * 48000); for (let i = i0; i < i1; i++) e += x[i] * x[i]; return +(10 * Math.log10(e / (i1 - i0) + 1e-30)).toFixed(1); };
    return {seq1: lv(ra.l, 0, .02), att1: lv(rb.l, 0, .02), seq2: lv(ra.l, .6, .62), att2: lv(rb.l, .6, .62)};
  });
  log('Q-FIRST erste Note nach dem Laden (App mkRender)', Math.abs(r.seq1 - r.att1) < 1, 'Pegel 0–20 ms: SEQ ATTACK +63 Note 1 ' + r.seq1 + ' dB, Note 2 ' + r.seq2 + ' dB · gespeichertes ATTACK 63: Note 1 ' + r.att1 + ' dB, Note 2 ' + r.att2 + ' dB' + (errs.length ? ' Konsole: ' + errs.join(' / ') : ''));
  await ctx.close();
});

// ---- column editor with real touch: two fingers (CDP), vertical drag one undo, tap +-1 with ZIEL Schrittlänge ----
await T('Q-COLS', async () => {
  const {ctx, page, errs} = await open();
  await page.evaluate(() => { const Q = SYNQUENZER; Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.q.0.k', 11); for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, 0); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); });
  await page.waitForTimeout(300);
  const I = await page.evaluate(() => MKUI.stepsInfo()); const cdp = await ctx.newCDPSession(page);
  const tp = (x, y, id) => ({x, y, id, radiusX: 2, radiusY: 2, force: 1});
  const A = I.cols[1], B = I.cols[12];
  const ax = A.x + A.w / 2, ay = A.y + A.h / 2, bx = B.x + B.w / 2, by = B.y + B.h / 2;
  const u0 = await undoN(page);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [tp(ax, ay, 1)]});
  for (let s = 1; s <= 6; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [tp(ax, ay - 5 * s, 1)]}); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [tp(ax, ay - 30, 1), tp(bx, by, 2)]});
  for (let s = 1; s <= 6; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [tp(ax, ay - 30, 1), tp(bx, by - 6 * s, 2)]}); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: [tp(ax, ay - 30, 1)]});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await page.waitForTimeout(150);
  const S = await seqOf(page), u1 = await undoN(page);
  const expA = Math.round(30 / A.h * 126);
  log('Q-COLS echter Zwei-Finger-Touch', S.q[0].v[12] === 0 && Math.abs(S.q[0].v[1] - expA) <= 2 && u1 === u0 + 1, 'Säule 2 (Finger 1, 30 px hoch): ' + S.q[0].v[1] + ' (erwartet ≈ ' + expA + ' bei Säulenhöhe ' + A.h.toFixed(0) + ' px), Säule 13 (Finger 2): ' + S.q[0].v[12] + ', Undo +' + (u1 - u0) + ', alle: ' + S.q[0].v.join(','));
  // a quick tap (touch) above the bar: +1, one undo
  const C = I.cols[5]; const u2 = await undoN(page);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [tp(C.x + C.w / 2, C.y + 10, 3)]}); await page.waitForTimeout(40);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(150);
  const S2 = await seqOf(page), u3 = await undoN(page);
  log('Q-COLS Touch-Tipp +1', S2.q[0].v[5] === 1 && u3 === u2 + 1, 'Säule 6: ' + S2.q[0].v[5] + ', Undo +' + (u3 - u2));
  // ZIEL Schrittlänge (±6): tap above = +1 up to +6; full-height drag = ±6
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.seq.q.0.k', 2); MKUI.stepsPaint(true); }); await page.waitForTimeout(100);
  const D = I.cols[8];
  for (let k = 0; k < 8; k++) { await page.mouse.click(D.x + D.w / 2, D.y + 6); await page.waitForTimeout(60); }
  const S3 = await seqOf(page);
  log('Q-COLS Schrittlänge ±6', S3.q[0].v[8] === 6, '8 Tipps über dem Balken: ' + S3.q[0].v[8] + ' (Grenze +6)');
  log('Q-COLS Konsole', !errs.length, errs.join(' / ') || 'keine Fehler');
  await ctx.close();
});

// ---- tools through the pop buttons: one undo each; matrix row "SEQ ●" ----
await T('Q-TOOLS', async () => {
  const {ctx, page, errs} = await open();
  await page.evaluate(() => { const Q = SYNQUENZER; Q.mkSet(0, 't.0.seq.on', 1); for (let k = 0; k < 3; k++) { Q.mkSet(0, 't.0.seq.q.' + k + '.k', [11, 1, 16][k]); for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.' + k + '.v.' + s, (k + 1) * 3 + s); } MKUI.setWahl(2, 10); MKUI.P.sq = 0; MKUI.render(); });
  await page.waitForTimeout(200);
  const S0 = await seqOf(page);
  const pressPop = async (sel) => { await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); await tap(page, 'n4'); const b = await page.evaluate(sel => { const e = document.querySelector('.pop ' + sel); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, sel); if (!b) return false; await page.mouse.click(b.x, b.y); await page.waitForTimeout(150); return true; };
  let u = await undoN(page); const ok1 = await pressPop('button[data-o="swap"][data-a="0"][data-b="2"]'); const S1 = await seqOf(page); const u1 = await undoN(page);
  log('Q-TOOLS Tauschen 1⇄3 per Taste', ok1 && JSON.stringify(S1.q[0]) === JSON.stringify(S0.q[2]) && JSON.stringify(S1.q[2]) === JSON.stringify(S0.q[0]) && u1 === u + 1, 'Undo +' + (u1 - u));
  await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(100);
  u = await undoN(page); const ok2 = await pressPop('button[data-o="copy"][data-s="-1"][data-t="0"][data-k="2"]'); const S2 = await seqOf(page); const u2 = await undoN(page);
  log('Q-TOOLS Kopieren T1 S3 → SEQ 1 per Taste', ok2 && JSON.stringify(S2.q[0]) === JSON.stringify(S0.q[2]) && JSON.stringify(S2.q[2]) === JSON.stringify(S0.q[2]) && u2 === u + 1, 'Undo +' + (u2 - u));
  await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(100);
  u = await undoN(page); const ok3 = await pressPop('button[data-o="init"][data-k="all"]'); const S3 = await seqOf(page); const u3 = await undoN(page);
  const I0 = await page.evaluate(() => SQMK.init().t[0].seq);
  log('Q-TOOLS Neu ALLE per Taste', ok3 && JSON.stringify(S3) === JSON.stringify(I0) && u3 === u + 1, 'Undo +' + (u3 - u) + ' · Ergebnis ' + JSON.stringify(S3).slice(0, 80));
  await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(100);
  const back = await seqOf(page); log('Q-TOOLS Undo stellt her', JSON.stringify(back) === JSON.stringify(S0), '');
  // matrix row: "SEQ ●" while the sequence runs (a key held), and the level-2 knobs under SHIFT
  await page.evaluate(() => { MKUI.P.shift = 0; MKUI.setWahl(2, 10); SYNQUENZER.keyOn(60); }); await page.waitForTimeout(500);
  const mx = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mrow2')].map(e => e.textContent.trim()).join(' | '));
  const k1 = await page.evaluate(() => MKUI.knobs().map(d => d && d.l));
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); const k2 = await page.evaluate(() => MKUI.knobs().map(d => d && d.l));
  await page.evaluate(() => SYNQUENZER.keyOff(60));
  log('Q-TOOLS Matrix/Ebenen', /SEQ\s*●/.test(mx), 'Matrix: ' + mx + ' · Ebene 1: ' + k1.join(', ') + ' · Ebene 2: ' + k2.join(', '));
  log('Q-TOOLS Konsole', !errs.length, errs.join(' / ') || 'keine Fehler');
  await ctx.close();
});
await browser.close();
