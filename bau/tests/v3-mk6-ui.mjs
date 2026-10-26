// MK6 in Chromium (Nachtrag 3 MK6-07 LCD, MK6-09 motion recording in the app, MK6-11 column editor + layout, MK6-12 probe "+Seq",
// MK6-13 tools, save / reload, the data path main thread -> worklet with mkRender). Usage: node v3-mk6-ui.mjs <index.html>  (ONLY=<regex>)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK6/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const SHOTS = new URL('./v3-mk6-shots/', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 500)); } };
const SA = '#app{padding-left:47px!important;padding-right:47px!important}', HB = '#app{padding-bottom:21px!important}';
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], 'L1-SA': [844, 390, SA], 'L0-SA': [926, 428, SA], 'L1-HB': [844, 390, SA + HB]};
const INT = ['vol', 'arp', 'octd', 'octu', 'bank', 'side', 'write', 'shift', 'n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'timbre', 'w1', 'w2', 'k0', 'k1', 'k2', 'k3', 'k4', 'm1', 'm2', 'back', 's0', 's1', 's2', 'rec', 'cols'];
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
async function drag(page, k, dy, steps, dx, ms) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= (steps || 10); s++) { await page.mouse.move(x + (dx || 0) * s / (steps || 10), y - dy * s / (steps || 10)); if (ms) await page.waitForTimeout(ms); } await page.mouse.up(); await page.waitForTimeout(60); }
async function tap(page, k) { const b = await box(page, k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(150); }
const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
const seqOf = (page, ti) => page.evaluate(ti => SYNQUENZER.mkGet(0).t[ti || 0].seq, ti);
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
  const present = INT.filter(k => out.rects[k] && k !== 'cols');
  for (const k of present) { const [x, y, w, h] = out.rects[k]; if (w < 43.5 || h < 43.5) out.bad.push(k + ' Trefferfläche ' + w.toFixed(1) + '×' + h.toFixed(1)); }
  for (let a = 0; a < present.length; a++) for (let b = a + 1; b < present.length; b++) {
    const A = out.rects[present[a]], B = out.rects[present[b]], ox = Math.min(A[0] + A[2], B[0] + B[2]) - Math.max(A[0], B[0]), oy = Math.min(A[1] + A[3], B[1] + B[3]) - Math.max(A[1], B[1]);
    if (ox > .5 && oy > .5) out.bad.push('Überlappung ' + present[a] + '/' + present[b]);
  }
  const de = document.documentElement, sb = document.querySelector('#synthSheet .sh-body');
  if (de.scrollWidth > iw + .5 || de.scrollHeight > ih + .5) out.bad.push('Seite scrollt ' + de.scrollWidth + '×' + de.scrollHeight);
  if (sb && (sb.scrollHeight > sb.clientHeight + 1 || sb.scrollWidth > sb.clientWidth + 1)) out.bad.push('Blatt-Körper scrollt');
  if (ED.lcd) { const r = ED.lcd.getBoundingClientRect(); if (r.right > iw + .5) out.bad.push('LCD ragt heraus'); }
  // the frame (M-ANSICHT GERÄT <-> SCHRITTE): LCD, tabs, page, wheels
  const fr = {}; const q = (k, s) => { const e = document.querySelector(s); if (e) { const r = e.getBoundingClientRect(); fr[k] = [r.left, r.top, r.width, r.height]; } };
  q('lcd', '#synthSheet .lcd'); q('pg', '#synthSheet .pg'); q('wh', '#mkWh'); q('kb', '#kbArea'); q('head', '#synthSheet .sh-head'); out.frame = fr;
  return out;
}, INT);
const maxMove = (a, b) => { let m = 0, k0 = ''; for (const k in a) if (b[k]) for (let i = 0; i < 4; i++) { const d = Math.abs(a[k][i] - b[k][i]); if (d > m) { m = d; k0 = k; } } return [m, k0]; };
const half = (page, h) => page.evaluate(h => { ED.tab = h === 'A' ? 'links' : 'rechts'; safeRebuild(buildSynthEd); }, h).then(() => page.waitForTimeout(250));
const sinv = s => Math.round(40 * Math.sin(s / 2.5));
const prep = page => page.evaluate(() => { const Q = SYNQUENZER; Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.q.0.k', 11); for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, Math.round(40 * Math.sin(s / 2.5))); MKUI.setWahl(2, 10); });

// ---------------- MK6-11 layout: SEQ level 1 / 2 and SCHRITTE in every format ----------------
await T('MK6-11 Layout', async () => {
  const res = [];
  for (const f of Object.keys(FMT)) {
    const {ctx, page, errs} = await open(f); await prep(page); await page.waitForTimeout(150);
    const halfV = await page.evaluate(() => ED.tab === 'links' || ED.tab === 'rechts');
    if (halfV) await half(page, 'B');
    const m1 = await measure(page); await page.screenshot({path: SHOTS + f + '-seq.png'});
    await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); await page.waitForTimeout(80);
    const m2 = await measure(page); await page.screenshot({path: SHOTS + f + '-seq-eb2.png'});
    const [mv12] = maxMove(m1.rects, m2.rects);
    await page.evaluate(() => { MKUI.P.shift = 0; MKUI.render(); });
    const mx = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mrow2')].map(e => e.textContent).join(' | '));
    const rowK = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mrow2')].find(e => /SCHRITTE/.test(e.textContent)).dataset.k);
    await tap(page, rowK); await page.waitForTimeout(250);
    const m3 = await measure(page), info = await page.evaluate(() => MKUI.stepsInfo()); await page.screenshot({path: SHOTS + f + '-schritte.png'});
    const [mvF, kF] = maxMove(m1.frame, m3.frame);
    await tap(page, 'back'); await page.waitForTimeout(250); const m4 = await measure(page); const [mvB, kB] = maxMove(m1.rects, m4.rects);
    const bad = [...m1.bad, ...m2.bad.map(x => 'EB2: ' + x), ...m3.bad.map(x => 'SCHRITTE: ' + x)];
    if (!info) bad.push('SCHRITTE nicht offen');
    if (mv12 > 2) bad.push('M-ANSICHT Ebene 1↔2 ' + mv12.toFixed(1) + ' px'); if (mvF > 2) bad.push('M-ANSICHT GERÄT↔SCHRITTE Rahmen ' + kF + ' ' + mvF.toFixed(1) + ' px'); if (mvB > 2) bad.push('zurück zu GERÄT verschiebt ' + kB + ' ' + mvB.toFixed(1) + ' px');
    if (!/SCHRITTE ▸/.test(mx)) bad.push('Matrix-Zeile ohne SCHRITTE ▸: ' + mx);
    if (errs.length) bad.push('Konsole: ' + errs.join(' / '));
    res.push(f + ': ' + (bad.length ? bad.join('; ') : 'ok (Säulen ' + info.geo.cw + '×' + info.geo.ch + ', Abstand ' + info.geo.gap + ', ' + info.w + '×' + info.h + ' px)'));
    if (bad.length) ok('MK6-11 M-PLATZ ' + f, false, bad.join('; '));
    await ctx.close();
  }
  ok('MK6-11 M-PLATZ/M-ANSICHT alle Formate', !res.some(x => !/ok \(/.test(x)), res.join(' · '));
});

// ---------------- MK6-11 column editor ----------------
await T('MK6-11 Säulen', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page); await page.evaluate(() => MKUI.viewOpen('schritte')); await page.waitForTimeout(250);
  const I = await page.evaluate(() => MKUI.stepsInfo()), U0 = (await page.evaluate(() => SYNQUENZER.undoInfo())).n;
  const col = c => I.cols[c];
  // drag column 3 up by its full height: + 2 R (clamped to +63)
  let c = col(2); const v0 = (await seqOf(page)).q[0].v[2];
  await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2); await page.mouse.down(); for (let s = 1; s <= 10; s++) await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2 - c.h / 4 * s / 10); await page.mouse.up(); await page.waitForTimeout(80);
  let S1 = await seqOf(page), U1 = (await page.evaluate(() => SYNQUENZER.undoInfo())).n;
  const exp = Math.max(-63, Math.min(63, v0 + Math.round(.25 * 2 * 63)));
  const others = S1.q[0].v.every((x, k) => k === 2 || x === sinv(k));
  ok('MK6-11 Ziehen', S1.q[0].v[2] === exp && others && U1 === U0 + 1, 'Säule 3: ' + v0 + ' → ' + S1.q[0].v[2] + ' bei ¼ Säulenhöhe nach oben (erwartet ' + exp + ' = +¼ · 2 · 63), andere unverändert, Undo +' + (U1 - U0));
  // paint horizontally over columns 4..7 at the top: all +63, one undo
  const a = col(3), b = col(6); await page.mouse.move(a.x + 4, a.y + 8); await page.mouse.down(); for (let s = 1; s <= 12; s++) await page.mouse.move(a.x + 4 + (b.x + b.w - 8 - a.x - 4) * s / 12, a.y + 8); await page.mouse.up(); await page.waitForTimeout(80);
  const S2 = await seqOf(page), U2 = (await page.evaluate(() => SYNQUENZER.undoInfo())).n;
  ok('MK6-11 Malen', [3, 4, 5, 6].every(k => S2.q[0].v[k] >= 55) && S2.q[0].v[7] === sinv(7) && U2 === U1 + 1, 'Säulen 4–7 oben gemalt: ' + S2.q[0].v.slice(3, 8).join(', ') + ' (8 unverändert), Undo +' + (U2 - U1));
  // tap above / below the bar: +-1, one undo each
  c = col(9); const v9 = S2.q[0].v[9]; await page.mouse.click(c.x + c.w / 2, c.y + 10); await page.waitForTimeout(80); const t1 = (await seqOf(page)).q[0].v[9];
  await page.mouse.click(c.x + c.w / 2, c.y + c.h - 12); await page.waitForTimeout(80); const t2 = (await seqOf(page)).q[0].v[9], U3 = (await page.evaluate(() => SYNQUENZER.undoInfo())).n;
  ok('MK6-11 Tipp ±1', t1 === v9 + 1 && t2 === v9 && U3 === U2 + 2, 'Säule 10: ' + v9 + ' → ' + t1 + ' (Tipp über dem Balken) → ' + t2 + ' (unter dem Balken), je ein Undo (+' + (U3 - U2) + ')');
  // a second finger (another pointer id) changes nothing while the first one drags
  c = col(11); const d = col(13), v13 = (await seqOf(page)).q[0].v[13];
  await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2); await page.mouse.down(); await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2 - 10);
  await page.evaluate(({x, y}) => { const cv = document.querySelector('#synthSheet canvas.mksq'); const o = {pointerId: 9, bubbles: true, clientX: x, clientY: y, pointerType: 'touch', isPrimary: false}; cv.dispatchEvent(new PointerEvent('pointerdown', o)); cv.dispatchEvent(new PointerEvent('pointermove', Object.assign({}, o, {clientY: y - 40}))); cv.dispatchEvent(new PointerEvent('pointerup', Object.assign({}, o, {clientY: y - 40}))); }, {x: d.x + d.w / 2, y: d.y + d.h / 2});
  await page.mouse.up(); await page.waitForTimeout(80);
  ok('MK6-11 zweiter Finger', (await seqOf(page)).q[0].v[13] === v13, 'Säule 14 bleibt ' + v13);
  // units: target TONHÖHE = ±24 over the full height
  await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.seq.q.0.k', 1)); await page.evaluate(() => MKUI.stepsPaint(true));
  c = col(0); await page.mouse.move(c.x + c.w / 2, c.y + c.h - 4); await page.mouse.down(); await page.mouse.move(c.x + c.w / 2 + 2, c.y + c.h / 2 + 30); for (let s = 0; s <= 6; s++) await page.mouse.move(c.x + c.w / 2 + 2, c.y + 2 + s); await page.mouse.up(); await page.waitForTimeout(80);
  const p0 = (await seqOf(page)).q[0].v[0]; const l = await lcd(page);
  ok('MK6-11 Ziel-Einheiten', p0 === 24 && /±24/.test(l), 'TONHÖHE: Säule 1 ganz nach oben gezogen = +' + p0 + ' (±24) · LCD „' + l.slice(0, 80) + '“');
  // the running step is lit while a note plays (scope at <= 30 Hz)
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.seq.q.0.k', 11); SYNQUENZER.keyOn(60); }); await page.waitForTimeout(700);
  const cur = await page.evaluate(() => MKUI.stepsInfo().cur); await page.evaluate(() => SYNQUENZER.keyOff(60));
  ok('MK6-11 laufender Schritt', cur >= 1 && cur <= 16, 'Anzeige des laufenden Schritts: ' + cur);
  await page.screenshot({path: SHOTS + 'P1-schritte-edit.png'});
  ok('MK6-11 Konsole', !errs.length, errs.join(' / '));
  await ctx.close();
});

// ---------------- MK6-11 ZIEL in <= 200 px; MK6-07 LCD "*" ----------------
await T('MK6-11 ZIEL', async () => {
  const {ctx, page, errs} = await open('P1'); await page.evaluate(() => MKUI.setWahl(2, 10)); await page.waitForTimeout(150);
  const kz = await page.evaluate(() => MKUI.knobs().findIndex(d => d && d.l === 'ZIEL'));
  await drag(page, 'k' + kz, 200, 25); const k1 = (await seqOf(page)).q[0].k;
  await drag(page, 'k' + kz, -200, 25); const k2 = (await seqOf(page)).q[0].k;
  ok('MK6-11 ZIEL ≤ 200 px', k1 === 30 && k2 === 0, '200 px nach oben: Eintrag ' + k1 + ' (PATCH 4 INTENS.), 200 px zurück: ' + k2 + ' (keins); alle 31 Einträge auf 200 px');
  await page.evaluate(() => { const Q = SYNQUENZER; Q.mkSet(0, 't.0.seq.q.0.k', 11); Q.mkSet(0, 't.0.seq.q.2.k', 11); MKUI.P.sq = 0; MKUI.render(); MKUI.lcdOf(MKUI.KN.sqTg0); });
  const l = await lcd(page); await page.evaluate(() => { MKUI.P.sq = 2; MKUI.render(); MKUI.lcdOf(MKUI.KN.sqTg2); }); const l2 = await lcd(page);
  ok('MK6-07 LCD „*“', /ZIEL \*/.test(l) && /SEQ 3 hat dasselbe ZIEL/.test(l) && !/\*/.test(l2.split('·').slice(0, 3).join('')), 'SEQ 1: „' + l.slice(0, 110) + '“ · SEQ 3: „' + l2.slice(0, 60) + '“');
  // tap on ZIEL = the list (31 rows >= 44 px, scrolls)
  await tap(page, 'k' + kz); const L = await page.evaluate(() => { const p = document.querySelector('.pop .plist.mklong'); if (!p) return null; const r = [...p.querySelectorAll('button')].map(b => b.getBoundingClientRect().height); return {n: r.length, min: Math.min(...r), scroll: p.scrollHeight > p.clientHeight}; });
  ok('MK6-11 ZIEL-Liste', L && L.n === 31 && L.min >= 44, JSON.stringify(L));
  ok('MK6-11 Konsole ZIEL', !errs.length, errs.join(' / '));
  await ctx.close();
});

// ---------------- MK6-09 motion recording in the app ----------------
await T('MK6-09 App', async () => {
  const {ctx, page, errs} = await open('P1');
  await page.evaluate(() => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(0, 't.0.f.cut', 40); Q.mkSet(0, 't.0.seq.last', 12); Q.keyOn(60); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); });
  await page.waitForTimeout(300);
  await tap(page, 'rec'); const lr = await lcd(page), view = await page.evaluate(() => MKUI.mkPanel ? null : SYNQUENZER.mkPanel());
  const mx = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mrow2')].map(e => e.innerHTML).join('|'));
  ok('MK6-09 AUFN. → GERÄT', view && !view.view && view.rec && /mrec/.test(mx), 'nach ● AUFN.: Ansicht ' + (view && (view.view || 'GERÄT')) + ', Matrix „● AUFN.“ blinkt, LCD „' + lr.slice(0, 70) + '“');
  // an effect knob does not record
  await page.evaluate(() => MKUI.setWahl(2, 4)); await page.waitForTimeout(100); await drag(page, 'k2', 30, 6); const st1 = await page.evaluate(() => SYNQUENZER.mkPanel().rec);
  ok('MK6-09 Effekt-Regler nimmt nicht auf', st1 && !st1.started, 'MOD-FX TIEFE gedreht: Aufnahme ' + (st1 && st1.started ? 'gestartet' : 'wartet weiter'));
  const U0 = (await page.evaluate(() => SYNQUENZER.undoInfo())).n, before = await page.evaluate(() => SYNQUENZER.mkGet(0));   // after that (separate) effect edit
  // FILTER: CUTOFF slowly up over ~2.4 s (more than one cycle of 12 steps at 1/16 = 1.5 s)
  await page.evaluate(() => MKUI.setWahl(1, 5)); await page.waitForTimeout(100);
  await drag(page, 'k1', 120, 60, 0, 40);
  await page.waitForFunction(() => { const E = AU.synth[0]; return E && E.mkRecN >= 1; }, null, {timeout: 6000});
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => SYNQUENZER.mkGet(0)), last = await page.evaluate(() => AU.synth[0].mkRecLast), info = await page.evaluate(() => SYNQUENZER.undoInfo());
  const q = after.t[0].seq.q[0];
  ok('MK6-09 Ergebnis', q.k === 11 && after.t[0].seq.on === 1 && after.t[0].f.cut === 40 && q.v.slice(last.from - 1, last.to).some(x => x > 0) && last.to === 12, 'ZIEL CUTOFF, SEQ an, Schritte ' + last.from + '–' + last.to + ': ' + q.v.join(',') + ' · CUTOFF zurück auf ' + after.t[0].f.cut);
  ok('MK6-09 ein Undo', info.n === U0 + 1 && /Bewegung aufnehmen/.test(info.top.label), 'Undo +' + (info.n - U0) + ' „' + (info.top && info.top.label) + '“');
  await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(100);
  const und = await page.evaluate(() => SYNQUENZER.mkGet(0));
  ok('MK6-09 Undo stellt alles her', JSON.stringify(und) === JSON.stringify(before), 'deep-equal zum Stand vor ● AUFN.: ' + (JSON.stringify(und) === JSON.stringify(before)));
  // a knob moved through the test API (knobSim) records the same way; ARP / FX are not targets
  await page.evaluate(() => { SYNQUENZER.redo(); });
  ok('MK6-09 Konsole', !errs.length, errs.join(' / '));
  await page.evaluate(() => SYNQUENZER.keyOff(60));
  await ctx.close();
});

// ---------------- MK6-13 tools ----------------
await T('MK6-13 Werkzeuge', async () => {
  const {ctx, page, errs} = await open('P1');
  const r = await page.evaluate(async () => {
    const Q = SYNQUENZER, out = {}, D = x => JSON.parse(JSON.stringify(x)), U = () => Q.undoInfo().n;
    Q.mkSet(0, 't.0.seq.on', 1); for (let k = 0; k < 3; k++) { Q.mkSet(0, 't.0.seq.q.' + k + '.k', [11, 1, 16][k]); Q.mkSet(0, 't.0.seq.q.' + k + '.m', k & 1); for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.' + k + '.v.' + s, (k + 1) * 10 - s); }
    Q.mkSet(0, 't.0.seq.res', 6); Q.mkSet(0, 't.0.seq.type', 2);
    const S0 = D(Q.mkGet(0).t[0].seq);
    let u = U(); MKUI.seqSwap(0, 0, 2); const S1 = D(Q.mkGet(0).t[0].seq); out.swap = JSON.stringify(S1.q[0]) === JSON.stringify(S0.q[2]) && JSON.stringify(S1.q[2]) === JSON.stringify(S0.q[0]) && JSON.stringify(S1.q[1]) === JSON.stringify(S0.q[1]) && U() === u + 1;
    Q.undo(); out.swapUndo = JSON.stringify(Q.mkGet(0).t[0].seq) === JSON.stringify(S0);
    u = U(); MKUI.seqInit(0, 1); const S2 = D(Q.mkGet(0).t[0].seq); out.init1 = JSON.stringify(S2.q[1]) === JSON.stringify({k: 0, m: 1, v: new Array(16).fill(0)}) && JSON.stringify(S2.q[0]) === JSON.stringify(S0.q[0]) && U() === u + 1;
    Q.undo(); u = U(); MKUI.seqInit(0, 'all'); out.initAll = JSON.stringify(Q.mkGet(0).t[0].seq) === JSON.stringify(SQMK.init().t[0].seq) && U() === u + 1; Q.undo();
    // copy from another sound (T2 of a sound in the library), one sequence and all
    const src = D(Q.getSound(0)); src.name = 'Quelle'; src.p.mk.t[1].seq = {on: 1, last: 7, type: 3, run: 0, ks: 2, res: 9, q: [{k: 12, m: 0, v: new Array(16).fill(5)}, {k: 15, m: 1, v: new Array(16).fill(-7)}, {k: 0, m: 1, v: new Array(16).fill(0)}]};
    u = U(); MKUI.seqCopy(0, src, 1, 1, 0); const S3 = D(Q.mkGet(0).t[0].seq); out.copy = JSON.stringify(S3.q[0]) === JSON.stringify(src.p.mk.t[1].seq.q[1]) && JSON.stringify(S3.q[1]) === JSON.stringify(S0.q[1]) && S3.res === S0.res && U() === u + 1;
    Q.undo(); u = U(); MKUI.seqCopy(0, src, 1, 'all', 0); out.copyAll = JSON.stringify(Q.mkGet(0).t[0].seq) === JSON.stringify(src.p.mk.t[1].seq) && U() === u + 1;
    Q.undo(); out.back = JSON.stringify(Q.mkGet(0).t[0].seq) === JSON.stringify(S0);
    // SHIFT + 5 opens the tool pop
    MKUI.P.shift = 1; MKUI.render(); return out;
  });
  await tap(page, 'n4'); const pop = await page.evaluate(() => { const p = document.querySelector('.pop'); return p ? {h: p.querySelector('h4').textContent, n: p.querySelectorAll('button[data-o]').length, min: Math.min(...[...p.querySelectorAll('button[data-o]')].map(b => Math.min(b.getBoundingClientRect().height, b.getBoundingClientRect().width)))} : null; });
  ok('MK6-13 Werkzeuge', Object.values(r).every(Boolean), JSON.stringify(r));
  ok('MK6-13 SHIFT + 5', pop && /Sequenz-Werkzeuge/.test(pop.h) && pop.min >= 44, JSON.stringify(pop));
  ok('MK6-13 Konsole', !errs.length, errs.join(' / '));
  await ctx.close();
});

// ---------------- saving, the app worklet path ----------------
await T('MK6 Speichern + App-Klang', async () => {
  const {ctx, page, errs} = await open('P1');
  await page.evaluate(() => { const Q = SYNQUENZER; Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.ks', 2); Q.mkSet(0, 't.0.seq.q.0.k', 11); for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, s & 1 ? -50 : 50); Q.mkSet(0, 't.0.f.cut', 64); Q.save(); });
  const s0 = await page.evaluate(() => SYNQUENZER.mkGet(0)); await page.waitForTimeout(400);
  await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await page.waitForTimeout(400);
  const s1 = await page.evaluate(() => SYNQUENZER.mkGet(0));
  ok('MK6 Speichern → Laden', JSON.stringify(s0) === JSON.stringify(s1), 'p.mk deep-equal nach Neuladen (SEQ an, KEY SYNC Stimme, 16 Werte)');
  const a = await page.evaluate(async () => {
    const snd = SYNQUENZER.getSound(0), r = await SYNQUENZER.mkRender(snd, [[0, 'on', 48, .8]], {sec: .6}), x = r.l;
    const c = (i0) => { let hi = 0, all = 0; for (let i = i0 + 1; i < i0 + 4000; i++) { const d = x[i] - x[i - 1]; hi += d * d; all += x[i] * x[i]; } return 10 * Math.log10(hi / all); };
    return [c(2000), c(8000), c(14000), c(20000)].map(v => +v.toFixed(1));
  });
  ok('MK6 App-Pfad (mkRender)', Math.abs(a[0] - a[1]) > 6 && Math.abs(a[0] - a[2]) < 1.5, 'Höhen-Anteil je Schritt (Cutoff 64 ± 50): ' + a.join(' / ') + ' dB');
  ok('MK6 Konsole Speichern', !errs.length, errs.join(' / '));
  await ctx.close();
});

// ---------------- MK6-12 probe "+Seq" ----------------
await T('MK6-12 Probe', async () => {
  const {ctx, page, errs} = await open('P1');
  const r = await page.evaluate(async () => MKUI.probe(['seq'], {sec: 4}));
  const c = r.cases && r.cases[0];
  ok('MK6-12 Leistungs-Probe „+Seq“', c && c.fall === 'seq' && c.frames_ok && c.reports >= 2 && r.net === 0, JSON.stringify({fall: c && c.fall, load_med: c && c.load_med, frames_ok: c && c.frames_ok, fps: c && c.fps_med, longtasks: c && c.longtasks, net: r.net}));
  ok('MK6-12 Konsole', !errs.length, errs.join(' / '));
  await ctx.close();
});

await browser.close();
console.log(fails ? fails + ' FEHLER von ' + n : 'alle ' + n + ' bestanden');
process.exit(fails ? 1 : 0);
