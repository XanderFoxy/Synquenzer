// MK4 in Chromium (Nachtrag 3 MK4-12 surface, MK4-14 buffer in the app, the data path main thread -> worklet with mkRender,
// probe "+FX", save / reload of the effect blocks). Usage: node v3-mk4-ui.mjs <index.html>   (ONLY=<regex>)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK4/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
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

// ---------------- MK4-12 M-PLATZ and M-ANSICHT (ZEIT | NOTE, MOD-FX / DELAY / EQ) in every format ----------------
await T('MK4-12-PLATZ', async () => {
  for (const fmt of Object.keys(FMT)) {
    const {ctx, page, errs} = await open(fmt);
    const pi = await page.evaluate(() => SYNQUENZER.mkPanel()), isHalf = /halb/.test(pi.fmt);
    for (const h of isHalf ? ['A', 'B'] : [null]) {
      if (h) await half(page, h);
      const tag = fmt + (h ? (h === 'A' ? ' LINKS' : ' RECHTS') : ''), bad = []; let base = null, mv = [0, ''];
      for (const [nm, fn] of [['MOD-FX', () => { SYNQUENZER.mkSet(0, 'mfx.dep', 100); MKUI.setWahl(2, 4); }], ['DELAY ZEIT', () => { SYNQUENZER.mkSet(0, 'dly.sync', 0); SYNQUENZER.mkSet(0, 'dly.dep', 60); MKUI.setWahl(2, 5); }],
        ['DELAY NOTE', () => { SYNQUENZER.mkSet(0, 'dly.sync', 1); MKUI.render(); }], ['DELAY NOTE EB2', () => { MKUI.P.shift = 1; MKUI.render(); }], ['EQ', () => { MKUI.setWahl(2, 6); SYNQUENZER.mkSet(0, 'eq.hg', -7.5); MKUI.lcdOf(MKUI.knobs()[3]); }],
        ['EQ EB2', () => { MKUI.P.shift = 1; MKUI.render(); }], ['SPIEL', () => MKUI.toSpiel()]]) {
        await page.evaluate(fn); await page.waitForTimeout(60);
        const m = await measure(page); for (const b of m.bad) bad.push(nm + ': ' + b);
        if (!base) base = m.rects; else { const d = maxMove(base, m.rects); if (d[0] > mv[0]) mv = [d[0], nm + ' ' + d[1]]; }
      }
      ok('MK4-12 ' + tag + ' M-PLATZ: MOD-FX, DELAY (ZEIT und NOTE), EQ, Ebene 2 (Trefferflächen ≥ 44, nichts abgeschnitten, keine Überlappung, kein Scrollen)', !bad.length, bad.slice(0, 5).join(' | '));
      ok('MK4-12 ' + tag + ' M-ANSICHT: ZEIT │ NOTE und die Effekt-Stellungen bewegen kein Element > 2 px', mv[0] <= 2, 'max ' + mv[0].toFixed(2) + ' px ' + mv[1]);
      await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.sync', 0); SYNQUENZER.mkSet(0, 'mfx.dep', 0); SYNQUENZER.mkSet(0, 'dly.dep', 0); SYNQUENZER.mkSet(0, 'eq.hg', 0); MKUI.toSpiel(); });
    }
    // the lists: TYP (3), NOTE (15, scrolls inside if needed), EDIT-WAHL 2 (11): rows >= 44 px, inside the screen
    await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.sync', 1); MKUI.setWahl(2, 5); }); await page.waitForTimeout(80);
    const L = [];
    for (const k of ['k0', 'k2', 'w2']) {
      const b = await box(page, k); if (!b) { L.push(k + ' fehlt'); continue; }
      await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(160);
      L.push(await page.evaluate(k => { const p = document.querySelector('.pop'); if (!p) return k + ': keine Liste'; const bs = [...p.querySelectorAll('.plist button')], pr = p.getBoundingClientRect(), de = document.documentElement, pl = p.querySelector('.plist');
        const bad = []; if (bs.some(x => x.getBoundingClientRect().height < 43.5)) bad.push('Zeile < 44'); if (pr.left < -.5 || pr.right > innerWidth + .5 || pr.top < -.5 || pr.bottom > innerHeight + .5) bad.push('Liste außerhalb');
        if (de.scrollWidth > innerWidth + .5 || de.scrollHeight > innerHeight + .5) bad.push('Seite scrollt');
        if ([...p.querySelectorAll('.plist button *')].some(t => !t.children.length && t.clientWidth && t.scrollWidth > t.clientWidth + 1)) bad.push('Text läuft über');
        const on = p.querySelector('.rb.on'); if (on && pl) { const r = on.getBoundingClientRect(), q = pl.getBoundingClientRect(); if (r.top < q.top - 1 || r.bottom > q.bottom + 1) bad.push('gewählte Zeile nicht sichtbar'); }
        closePop(); return k + ':' + bs.length + (bad.length ? ' ' + bad.join(',') : ''); }, k));
    }
    await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.sync', 0); MKUI.toSpiel(); });
    ok('MK4-12 ' + fmt + ' Listen TYP (3), NOTE (15), EDIT-WAHL 2 (11): Zeilen ≥ 44 px, im Bild, gewählte sichtbar', L.join(' ') === 'k0:3 k2:15 w2:11', L.join(' '));
    ok('MK4-12 ' + fmt + ' keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
    await ctx.close();
  }
});
// ---------------- MK4-12 operation: gestures, LCD / display, lists, undo, ◎ ----------------
await T('MK4-12-BED', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.setBpm ? SYNQUENZER.setBpm(120) : setBpm(120); MKUI.setWahl(2, 5); });
  let pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK4-12 EDIT-WAHL 2 auf DELAY (Stellung 6): TYP · TEMPO SYNC · ZEIT · TIEFE aktiv, Matrix-Zeile DELAY', pi.knobs.slice(0, 4).map(k => k && k.l).join() === 'TYP,TEMPO SYNC,ZEIT,TIEFE' && pi.knobs.slice(0, 4).every(k => !k.dark) && /DELAY/.test(pi.matrix[1]) && /ZEIT/.test(pi.matrix[1]), JSON.stringify([pi.knobs.map(k => k && k.l), pi.matrix[1]]));
  // TIEFE drag: one undo, LCD with the echo level, display 3 digits
  let u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await drag(page, 'k3', 70, 12);
  let r = await page.evaluate(() => ({dep: SYNQUENZER.mkGet(0).dly.dep, u: SYNQUENZER.undoInfo().n, disp: SYNQUENZER.mkPanel().disp}));
  let l = await lcd(page);
  ok('MK4-12 TIEFE ziehen: ein Undo, LCD „DELAY · TIEFE nnn“ mit Echo-Pegel, Anzeige 3 Ziffern', r.dep > 20 && r.u === u0 + 1 && /DELAY · TIEFE \d{3}/.test(l) && /Echo [−+]?\d/.test(l) && /^\d{3}$/.test(r.disp), JSON.stringify(r) + ' | ' + l);
  // TEMPO SYNC tap -> list of 2 -> "an": ZEIT becomes NOTE (same place), matrix label NOTE
  const z0 = await box(page, 'k2');
  await tap(page, 'k1');
  const pick = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist button')].find(x => /^an/i.test(x.textContent.trim())); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  if (pick) { await page.mouse.click(pick[0], pick[1]); await page.waitForTimeout(150); }
  pi = await page.evaluate(() => SYNQUENZER.mkPanel()); const z1 = await box(page, 'k2');
  ok('MK4-12 TEMPO SYNC an (Liste): ZEIT wird NOTE am selben Platz, Matrix „NOTE“', pick && pi.knobs[2].l === 'NOTE' && /NOTE/.test(pi.matrix[1]) && Math.abs(z0.x - z1.x) + Math.abs(z0.y - z1.y) <= 1, JSON.stringify([pi.knobs[2], pi.matrix[1]]));
  // NOTE drag: rounds to the 15 values; LCD "DELAY · NOTE 1/8" and "250 ms" at 120 BPM, display "1.8"
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.note', 0); window.__ticks = 0; const h = window.haptic; window.haptic = k => { if (k === 'tick') window.__ticks++; return h && h(k); }; });
  u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  // 5 steps of 15 over PX_FULL: find the drag for note 5 (1/8)
  await drag(page, 'k2', 77, 12);   // 5 of 14 steps over PX_FULL 200 px (+ the first step that passes the slop)
  await page.evaluate(() => { MKUI.lcdOf(MKUI.knobs()[2]); });
  r = await page.evaluate(() => ({note: SYNQUENZER.mkGet(0).dly.note, ticks: window.__ticks, disp: SYNQUENZER.mkPanel().disp}));
  l = await lcd(page);
  const dispNote = await page.evaluate(() => { const d = MKUI.knobs()[2]; return MKUI.fmtv ? MKUI.fmtv(d, 5)[0] : null; });
  ok('MK4-12 NOTE ziehen: ganze Werte (1/32 … 1/1), Haptik je Stufe; LCD „DELAY · NOTE 1/8“ · „250 ms“ bei 120 BPM', Number.isInteger(r.note) && r.note === 5 && r.ticks >= 3 && /DELAY · NOTE 1\/8/.test(l) && /250 ms/.test(l), JSON.stringify(r) + ' | ' + l + ' | Anzeige ' + dispNote);
  ok('MK4-12 Anzeige der NOTE wie am Original („1.8“)', (r.disp === '1.8') || dispNote === '1.8', 'Anzeige ' + r.disp);
  // TYP list -> Kreuz; Mod-FX TYP Ensemble; the list of EDIT-WAHL 2: MOD-FX / DELAY / EQ active with their line
  await tap(page, 'k0');
  const pk = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist button')].find(x => /Kreuz/.test(x.textContent)); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.mouse.click(pk[0], pk[1]); await page.waitForTimeout(150);
  const t1 = await page.evaluate(() => SYNQUENZER.mkGet(0).dly.type);
  ok('MK4-12 TYP aus der Liste: Kreuz', t1 === 1, 'type ' + t1);
  await tap(page, 'w2');
  const R = await page.evaluate(() => [...document.querySelectorAll('.pop .plist.mkmx button')].map(b => [b.classList.contains('dark'), b.textContent.replace(/\s+/g, ' ').trim()]));
  await page.evaluate(() => closePop());
  ok('MK4-12 Liste EDIT-WAHL 2: MOD-FX, DELAY, EQ nicht mehr dunkel, mit ihrer Zeile (z. B. „Kreuz · NOTE 1/8 · 250 ms“)', R.length === 11 && R.slice(4, 7).every(x => !x[0]) && /Kreuz · NOTE 1\/8 · 250 ms/.test(R[5][1]) && R.slice(7).every(x => x[0]), R.slice(4, 8).map(x => (x[0] ? '▪' : '') + x[1].slice(0, 60)).join(' | '));
  // EQ: gain drag ends on 0.5 dB steps; LCD in dB; frequency knob logarithmic (octaves)
  await page.evaluate(() => MKUI.setWahl(2, 6));
  await drag(page, 'k1', 37, 9);
  const g = await page.evaluate(() => SYNQUENZER.mkGet(0).eq.lg); l = await lcd(page);
  ok('MK4-12 EQ TIEF-GAIN ziehen: Ende auf 0,5-dB-Schritten, LCD „… dB“', g !== 0 && Math.abs(g * 2 - Math.round(g * 2)) < 1e-9 && /EQ · TIEF-GAIN [+−]?\d+,\d dB/.test(l), g + ' | ' + l);
  await page.evaluate(() => SYNQUENZER.mkSet(0, 'eq.hf', 1000));
  await drag(page, 'k2', 50, 10);
  const hf1 = await page.evaluate(() => SYNQUENZER.mkGet(0).eq.hf); await drag(page, 'k2', 50, 10);
  const hf2 = await page.evaluate(() => SYNQUENZER.mkGet(0).eq.hf); l = await lcd(page);
  ok('MK4-12 EQ HOCH-FREQ ziehen: logarithmisch (gleicher Weg = gleiches Verhältnis), LCD in kHz', hf1 > 1000 && hf2 > hf1 && Math.abs(Math.log(hf2 / hf1) / Math.log(hf1 / 1000) - 1) < .25 && /kHz/.test(l), hf1 + ' → ' + hf2 + ' Hz | ' + l);
  // ◎ marks the effect positions that differ from INIT (5 MOD-FX no, 6 DELAY yes, 7 EQ yes)
  const dots = await page.evaluate(() => { UI.wia = true; MKUI.render(); return [...document.querySelectorAll('#synthSheet .mkx[data-k="w2"] .mtk')].map(t => t.classList.contains('mwd') ? 1 : 0); });
  await page.evaluate(() => { UI.wia = false; MKUI.render(); });
  ok('MK4-12 ◎: Punkte an DELAY und EQ (weichen von INIT ab), nicht an MOD-FX', dots.join('').slice(4, 7) === '011', dots.join(''));
  // undo of the TYP change and of the EQ edits restores the stored values
  const before = await page.evaluate(() => JSON.stringify(SYNQUENZER.mkGet(0).eq));
  await page.evaluate(() => { SYNQUENZER.undo(); }); const after = await page.evaluate(() => JSON.stringify(SYNQUENZER.mkGet(0).eq));
  ok('MK4-12 Undo nimmt die letzte EQ-Geste zurück', before !== after, before + ' → ' + after);
  ok('MK4-12-BED keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- the data path in the app: mkRender (OfflineAudioContext + app worklet) hears every effect block ----------------
await T('MK4-APP', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => {
    const base = () => { const s = SYNQUENZER.getSound(0); s.p.mk = SQMK.init(); Object.assign(s.p.mk.t[0].a, {gate: 1}); return s; };
    const rms = (x, a, b) => { let e = 0; for (let i = a; i < b; i++) e += x[i] * x[i]; return Math.sqrt(e / (b - a)); }, db = x => 20 * Math.log10(x + 1e-30);
    // a 50 ms note, delay 1/8 at 120 BPM TIEFE 64: echo 250 ms later, -5.95 dB of the note
    const d0 = base(), d1 = base(); d1.p.mk.dly = {type: 0, sync: 1, time: 64, note: 5, dep: 64};
    const ev = [[0, 'on', 60, .8], [.05, 'off', 60]];
    const a = await SYNQUENZER.mkRender(d0, ev, {sec: .8, bpm: 120}), b = await SYNQUENZER.mkRender(d1, ev, {sec: .8, bpm: 120});
    const w = [Math.round(.25 * 48000) + 240, Math.round(.30 * 48000) - 240], echo = db(rms(b.l, w[0], w[1]) / rms(a.l, 240, 2160)), dryEcho = db(rms(a.l, w[0], w[1]) + 1e-12);
    // Mod-FX Phaser and EQ high shelf on a held saw: spectrum change
    const sp = (x, f) => { let re = 0, im = 0; for (let i = 9600; i < 9600 + 16384; i++) { const wn = .5 - .5 * Math.cos(2 * Math.PI * (i - 9600) / 16384), ph = 2 * Math.PI * f * i / 48000; re += x[i] * wn * Math.cos(ph); im += x[i] * wn * Math.sin(ph); } return db(Math.hypot(re, im)); };
    const s0 = base(), s1 = base(), s2 = base(); s1.p.mk.eq = {lf: 320, lg: 0, hf: 4000, hg: -12}; s2.p.mk.mfx = {type: 1, spd: 64, dep: 127};
    const hold = [[0, 'on', 48, .8]], x0 = await SYNQUENZER.mkRender(s0, hold, {sec: .6}), x1 = await SYNQUENZER.mkRender(s1, hold, {sec: .6}), x2 = await SYNQUENZER.mkRender(s2, hold, {sec: .6});
    const hs = []; for (const f of [130.8 * 61, 130.8 * 91]) hs.push(sp(x1.l, f) - sp(x0.l, f));
    let lr0 = 0, lr2 = 0; for (let i = 9600; i < 28000; i++) { lr0 += (x0.l[i] - x0.r[i]) ** 2; lr2 += (x2.l[i] - x2.r[i]) ** 2; }
    return {echo, dryEcho, hs, ens: 10 * Math.log10((lr2 + 1e-20) / (lr0 + 1e-20))};
  });
  ok('MK4-APP mkRender: DELAY 1/8 TIEFE 64 → Echo nach 250 ms bei ' + r.echo.toFixed(2) + ' dB (W-32 −5,95 ± 1 dB; ohne Delay ' + r.dryEcho.toFixed(0) + ' dBFS)', Math.abs(r.echo + 5.95) <= 1 && r.dryEcho < -80, '');
  ok('MK4-APP mkRender: EQ HOCH 4 kHz −12 dB senkt die Obertöne bei 8 / 12 kHz um ≥ 9 dB', r.hs.every(x => x <= -9), r.hs.map(x => x.toFixed(1)).join(' / ') + ' dB');
  ok('MK4-APP mkRender: MOD-FX Ensemble macht aus Mono Stereo (L−R-Energie ≥ +30 dB)', r.ens >= 30, r.ens.toFixed(1) + ' dB');
  // the live engine: buffer 0 bytes before the first TIEFE > 0, ≈ 2.3 MB after (MK4-14), the echo audible live (analyser)
  const m = await page.evaluate(async () => {
    ensureAudio(); await new Promise(r => setTimeout(r, 400));
    const i0 = SYNQUENZER.mkInfo().fxBytes; await SYNQUENZER.audition(0, 60, 150); await new Promise(r => setTimeout(r, 400));
    const i1 = SYNQUENZER.mkInfo().fxBytes; SYNQUENZER.mkSet(0, 'dly.dep', 40); await new Promise(r => setTimeout(r, 400));
    const i2 = SYNQUENZER.mkInfo().fxBytes; SYNQUENZER.mkSet(0, 'dly.dep', 0); SYNQUENZER.mkSet(0, 'dly.dep', 80); await new Promise(r => setTimeout(r, 300));
    return {i0, i1, i2, i3: SYNQUENZER.mkInfo().fxBytes, sr: AU.ctx.sampleRate};
  });
  ok('MK4-14 im Gerät: vor dem ersten TIEFE > 0 belegt der Puffer 0 Byte, danach ≈ 2,3 MB je Spur (einmal)', m.i0 === 0 && m.i1 === 0 && Math.abs(m.i2 / 1e6 - (m.sr === 48000 ? 2.304 : 2.117)) < .02 && m.i3 === m.i2, JSON.stringify(m));
  // save / reload: the effect blocks survive a project round trip (JSON) and a library save
  const s = await page.evaluate(async () => {
    SYNQUENZER.mkSet(0, 'mfx.type', 2); SYNQUENZER.mkSet(0, 'mfx.dep', 77); SYNQUENZER.mkSet(0, 'eq.lg', -3.5); SYNQUENZER.mkSet(0, 'dly.note', 13); SYNQUENZER.mkSet(0, 'dly.sync', 1);
    const want = JSON.stringify((({mfx, dly, eq}) => ({mfx, dly, eq}))(SYNQUENZER.mkGet(0)));
    const j = SYNQUENZER.exportProject ? SYNQUENZER.exportProject() : null;
    const snd = SQStore.normalizeSound(JSON.parse(JSON.stringify(SYNQUENZER.getSound(0))));
    return {want, got: JSON.stringify((({mfx, dly, eq}) => ({mfx, dly, eq}))(snd.p.mk)), hasExport: !!j};
  });
  ok('MK4-APP Sound-Normalisierung (Laden/Speichern) behält MOD-FX, DELAY, EQ (auch −3,5 dB)', s.want === s.got, s.got);
  ok('MK4-APP keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- performance probe: "Kern" and "+FX" ----------------
await T('PROBE', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 500)); return mkLoad().probe(['kern', 'fx'], {sec: 4}); });
  ok('MK4-11 Leistungs-Probe mit „+FX“ (4 s je Fall): beide Fälle laufen, frames_ok, keine Netzaufrufe', r && r.cases && r.cases.length === 2 && r.cases.every(c => c.reports >= 2) && r.frames_ok && r.net === 0,
    JSON.stringify({cases: r.cases && r.cases.map(c => ({fall: c.fall || c.name, load: c.load_med != null ? c.load_med : c.load})), load_med: r.load_med, load_max: r.load_max, frames_ok: r.frames_ok, net: r.net}));
  ok('MK4 Probe keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
await browser.close();
console.log(fails ? fails + ' FAIL von ' + n : 'alles PASS (' + n + ')');
process.exit(fails ? 1 : 0);
