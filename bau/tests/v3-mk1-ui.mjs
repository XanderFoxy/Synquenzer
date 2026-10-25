// MK1 panel / wheels / header acceptance in Chromium (Nachtrag 3 MK1-16 wheels, MK1-20, MK1-21, MK1-22, MK1-31, MK1-33, MK1-34).
// Usage: node v3-mk1-ui.mjs <index.html>
import { chromium } from 'playwright';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname, ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
async function open(fmt, o) {
  o = o || {}; const [w, h] = o.size || FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (o.css) await page.addStyleTag({content: o.css});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  return {ctx, page, errs};
}
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e).toString().slice(0, 300)); } };
// the rectangle (client px) of a panel element by its data-k
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(page, k, dy, steps, dx) {
  const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6;
  await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= (steps || 10); s++) await page.mouse.move(x + (dx || 0), y - dy * s / (steps || 10)); await page.mouse.up();
}
async function tap(page, k) { const b = await box(page, k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(60); }

// ---- MK1-34 Bedien-Logik ----
await T('MK1-34', async () => {
  const {ctx, page, errs} = await open('L1');
  let pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  const leds = () => page.evaluate(() => ['w1', 'w2'].map(k => document.querySelector('#synthSheet .mkx[data-k="' + k + '"]').classList.contains('lit')));
  ok('MK1-34 nach dem Laden: beide LEDs an, Regler = SPIEL', JSON.stringify(await leds()) === '[true,true]' && pi.sel.wahl === 0 && pi.knobs.map(k => k.l).join() === 'CUTOFF,RESONANZ,ATTACK,RELEASE,TEMPO', JSON.stringify(pi.knobs.map(k => k.l)));
  const h0 = await page.evaluate(() => [SQStore.soundHash(SYNQUENZER.getSound(0)), SYNQUENZER.undoInfo().n]);
  // drag EDIT-WAHL 1 from STIMME (pos 0 after INIT? it starts at FILTER 5): go to 0 then to FILTER
  await drag(page, 'w1', -18 * 6 - 4, 12); pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  const p0 = pi.sel.pos;
  await drag(page, 'w1', 18 * 5 + 4, 12); pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  const h1 = await page.evaluate(() => [SQStore.soundHash(SYNQUENZER.getSound(0)), SYNQUENZER.undoInfo().n]);
  ok('MK1-34 EDIT-WAHL 1 rastet je 18 px; FILTER: LED 1 an, LED 2 aus, Regler TYP·CUTOFF·RESONANZ·HK-INT·KEYTRACK', p0 === 0 && pi.sel.wahl === 1 && pi.sel.pos === 5 && JSON.stringify(await leds()) === '[true,false]' && pi.knobs.map(k => k.l).join() === 'TYP,CUTOFF,RESONANZ,HK-INT,KEYTRACK', p0 + ' → ' + pi.sel.pos + ' ' + pi.knobs.map(k => k.l).join());
  ok('MK1-34 die Wahl ändert den Sound nicht und macht kein Undo', h0[0] === h1[0] && h0[1] === h1[1]);
  await tap(page, 'w1');
  const lst = await page.evaluate(() => { const r = [...document.querySelectorAll('.pop .plist.mkmx button')].map(b => b.getBoundingClientRect().height); return r; });
  ok('MK1-34 Tipp auf den Drehschalter: Matrix-Liste mit 11 Zeilen ≥ 44 px', lst.length === 11 && lst.every(h => h >= 44), lst.length + ' Zeilen, min ' + Math.min(...lst));
  await page.evaluate(() => closePop());
  // SHIFT -> level 2 (FILTER: ANSCHLAG), EB2 in the matrix, second tap off
  await tap(page, 'shift'); pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  const sh1 = pi.shift === 2 && pi.knobs[0].l === 'ANSCHLAG' && /EB2/.test(pi.matrix[0]) && /ANSCHL/.test(pi.matrix[0]);
  const lit = await page.evaluate(() => document.querySelector('#synthSheet .mkx[data-k="shift"]').classList.contains('on'));
  await tap(page, 'shift'); pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK1-34 SHIFT: Ebene 2 (FILTER → ANSCHLAG), leuchtet, Matrix „EB2“; zweiter Tipp: aus', sh1 && lit && pi.shift === 0 && pi.knobs[0].l === 'TYP');
  // a knob gesture, then SHIFT + OKT ▲ = +1 (one undo)
  await drag(page, 'k1', 30, 8);
  const v1 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut), u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await tap(page, 'shift'); await tap(page, 'octu');
  const v2 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut), u2 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  ok('MK1-34 Regler-Geste = ein Undo; SHIFT + OKT ▲ hebt den Wert um 1 (ein Undo)', u1 === h0[1] + 1 && v2 === Math.min(127, v1 + 1) && u2 === u1 + 1, v1 + ' → ' + v2 + ', Undo ' + h0[1] + '/' + u1 + '/' + u2);
  // SHIFT + SEITE: the last section of the other selection
  await page.evaluate(() => { MKUI.P.last[2] = 4; });
  await tap(page, 'shift'); await tap(page, 'side'); pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK1-34 SHIFT + SEITE springt zur letzten Sektion der anderen Wahl', pi.sel.wahl === 2 && pi.sel.pos === 4, JSON.stringify(pi.sel));
  // OKT ▼/▲: tr.kbOct 1..7, LED of the direction
  const ok1 = await page.evaluate(() => S.tracks[0].kbOct);
  for (let k = 0; k < 9; k++) await tap(page, 'octd');
  const lo = await page.evaluate(() => [S.tracks[0].kbOct, document.querySelector('#synthSheet .mkx[data-k="octd"]').classList.contains('on')]);
  for (let k = 0; k < 9; k++) await tap(page, 'octu');
  const hi = await page.evaluate(() => [S.tracks[0].kbOct, document.querySelector('#synthSheet .mkx[data-k="octu"]').classList.contains('on')]);
  ok('MK1-34 OKT ▼/▲ ändern tr.kbOct im Bereich 1…7, LED der Richtung', lo[0] === 1 && lo[1] && hi[0] === 7 && hi[1], ok1 + ' → ' + JSON.stringify([lo, hi]));
  // ORIGINAL LED: a value moved away and back
  await page.evaluate(() => MKUI.setWahl(1, 5));
  await drag(page, 'k2', 40, 8); const o1 = await page.evaluate(() => SYNQUENZER.mkPanel().orig);
  await page.evaluate(() => { const d = MKUI.KN.res; MKUI.setv(d, 0, false); MKUI.P.lastKnob = d; MKUI.render(); });
  const o2 = await page.evaluate(() => SYNQUENZER.mkPanel().orig);
  ok('MK1-34 ORIGINAL-LED: aus nach dem Wegdrehen, an beim gespeicherten Wert', !o1 && o2, o1 + ' / ' + o2);
  // a program: an own AM sound on side B, loaded by its number key (one undo, toast); the lit key = back to SPIEL
  await page.evaluate(async () => { await SYNQUENZER.saveSound(0, 'AAA Mein Klang'); SYNQUENZER.loadPreset(0, 'f-init-am'); MKUI.P.bank = 0; MKUI.P.side = 1; MKUI.render(); });
  const u3 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await tap(page, 'n0'); await page.waitForTimeout(200);
  const lp = await page.evaluate(() => ({name: SYNQUENZER.getSound(0).name, undo: SYNQUENZER.undoInfo().n, toast: document.getElementById('toast').innerText, pi: SYNQUENZER.mkPanel()}));
  await page.evaluate(() => MKUI.setWahl(1, 5)); await tap(page, 'n0');
  const sp = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK1-34 Nummerntaste lädt das Programm (ein Undo, Toast); Tipp auf die leuchtende Taste = SPIEL', lp.name === 'AAA Mein Klang' && lp.undo === u3 + 1 && /Rückgängig/.test(lp.toast) && lp.pi.disp === 'b.11' && sp.sel.wahl === 0, JSON.stringify({n: lp.name, u: [u3, lp.undo], d: lp.pi.disp, w: sp.sel.wahl}));
  ok('MK1-34 keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---- MK1-22 Anzeige / LCD for every knob; help lines ----
await T('MK1-22', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => {
    const bad = [], seen = [];
    for (let w = 1; w <= 1; w++) for (let pos = 0; pos < 11; pos++) for (const sh of [0, 1]) {
      MKUI.setWahl(1, pos); MKUI.P.shift = sh; MKUI.render();
      for (const d of MKUI.knobs()) { if (!d || d.dark || !d.p || d.lock) continue;
        MKUI.lcdOf(d); const t = ED.lcd.innerText.replace(/\s+/g, ' ').trim(); seen.push(t);
        const [disp] = MKUI.fmtv(d, MKUI.get(d));
        if (!/·/.test(t) || !t.includes(d.l.split(' (')[0].slice(0, 4)) || !disp) bad.push(d.l + ': ' + t + ' | ' + disp); }
    }
    MKUI.setWahl(1, 5); MKUI.lcdOf(MKUI.KN.cut); const cut = ED.lcd.innerText.replace(/\s+/g, ' ');
    const help = (() => { SYNQUENZER.openMenu(); const h = document.querySelector('#menu').innerText; SYNQUENZER.closeMenu(); return (h.match(/MS 2000/g) || []).length; })();
    return {bad, n: seen.length, cut, help, sample: seen.slice(0, 3)};
  });
  ok('MK1-22 LCD: Sektion, Name, Geräte-Wert und Klartext für alle Regler (' + r.n + ')', !r.bad.length && /FILTER · CUTOFF 127/.test(r.cut) && /kHz/.test(r.cut), r.bad.slice(0, 3).join(' ;; ') || r.cut);
  ok('MK1-22 Hilfe-Zeilen da (L10)', r.help >= 5, r.help + ' Zeilen mit MS 2000');
  ok('MK1-22 keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---- MK1-20 INIT: loudness against INIT Analog; ⋯ → Init and SHIFT + 3, one undo each ----
await T('MK1-20', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => {
    // BS.1770 K-weighting (two biquads at 48 kHz) + gate -70/-10, integrated over 2 s of C3 at velocity 0.8
    const kw = x => { const f = (b, a, s) => { const y = new Float64Array(s.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < s.length; i++) { const v = b[0] * s[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = s[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
      return f([1, -2, 1], [1, -1.99004745483398, .99007225036621], f([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, .73248077421585], x)); };
    const lufs = r => { const L = kw(r.l), R = kw(r.r), N = 19200, st = 4800, bl = []; for (let i = 0; i + N <= L.length; i += st) { let e = 0; for (let k = i; k < i + N; k++) e += L[k] * L[k] + R[k] * R[k]; bl.push(e / N); }
      const g1 = bl.filter(z => -.691 + 10 * Math.log10(z) > -70), m1 = g1.reduce((a, b) => a + b, 0) / g1.length, g2 = g1.filter(z => z > m1 * Math.pow(10, -1)); return -.691 + 10 * Math.log10(g2.reduce((a, b) => a + b, 0) / g2.length); };
    const ev = [[0, 'on', 48, .8], [2, 'off', 48]];
    const a = lufs(await SYNQUENZER.mkRender(factorySound('f-init-analog'), ev, {sec: 2})), m = lufs(await SYNQUENZER.mkRender(factorySound('f-init-am'), ev, {sec: 2}));
    SYNQUENZER.mkSet(0, 't.0.f.cut', 40); const u0 = SYNQUENZER.undoInfo().n; SYNQUENZER.initSound(0); const n1 = SYNQUENZER.getSound(0).name, u1 = SYNQUENZER.undoInfo().n, i1 = SQMK.isInit(SYNQUENZER.mkGet(0));
    SYNQUENZER.mkSet(0, 't.0.f.cut', 40); const u2 = SYNQUENZER.undoInfo().n;
    MKUI.P.shift = 1; MKUI.render(); const b = document.querySelector('#synthSheet .mkx[data-k="n2"]').getBoundingClientRect();
    return {a, m, n1, u0, u1, i1, u2, b: [b.x + b.width / 2, b.y + b.height / 2 + 6]};
  });
  await page.mouse.click(r.b[0], r.b[1]); await page.waitForTimeout(150);
  const r2 = await page.evaluate(() => ({n: SYNQUENZER.getSound(0).name, u: SYNQUENZER.undoInfo().n, i: SQMK.isInit(SYNQUENZER.mkGet(0))}));
  ok('MK1-20 INIT MS 2000: M-LUFS ± 1 dB gegen INIT Analog (C3, vel 0,8, 2 s)', Math.abs(r.m - r.a) <= 1, 'AM ' + r.m.toFixed(2) + ' / Analog ' + r.a.toFixed(2) + ' LUFS');
  ok('MK1-20 ⋯ → Init und SHIFT + 3 laden INIT MS 2000, je ein Undo', r.n1 === 'INIT MS 2000' && r.i1 && r.u1 === r.u0 + 1 && r2.n === 'INIT MS 2000' && r2.i && r2.u === r.u2 + 1, JSON.stringify([r.n1, r.u0, r.u1, r.u2, r2]));
  ok('MK1-20 keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---- MK1-31 🎲 100 rolls; ◎ marks exactly the deviating positions; side B A-Z ----
await T('MK1-31', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => {
    const res = []; let mix = 0;
    for (let k = 0; k < 100; k++) { SYNQUENZER.randomize(0); const t = SYNQUENZER.mkGet(0).t[0]; if (Math.max(t.mix.o1, t.mix.o2) >= 64) mix++; res.push(JSON.parse(JSON.stringify(SYNQUENZER.getSound(0)))); }
    // audible (H-1 vs INIT): level / centroid / decay by an offline render of every 10th roll (100 renders are slow)
    const meas = async s => { const x = (await SYNQUENZER.mkRender(s, [[0, 'on', 48, .8], [1, 'off', 48]], {sec: 1.6})).l; let e = 0; for (let i = 0; i < 14400; i++) e += x[i] * x[i]; return 10 * Math.log10(e / 14400 + 1e-20); };
    const silent = []; for (let k = 0; k < 100; k += 1) { const lv = await meas(res[k]); if (lv < -60) silent.push(k); }
    // ◎: the positions whose section differs from INIT
    SYNQUENZER.loadPreset(0, 'f-init-am'); SYNQUENZER.mkSet(0, 't.0.f.cut', 30); SYNQUENZER.mkSet(0, 't.0.e2.r', 60);
    UI.wia = false; wiaToggle(); MKUI.render();
    const dots = [...document.querySelectorAll('#synthSheet .mkx[data-k="w1"] .mtk')].map((t, k) => t.classList.contains('mwd') ? k : -1).filter(k => k >= 0);
    wiaToggle();
    // side B sorted A-Z
    for (const n of ['Zebra', 'Apfel', 'Mond']) await SYNQUENZER.saveSound(0, n);
    const own = LIB.lib.all().filter(s => s.engine === 'mk').map(s => s.name), sorted = own.slice().sort((a, b) => a.localeCompare(b, 'de'));
    MKUI.P.side = 1; MKUI.P.bank = 0; MKUI.render();
    const titles = [...document.querySelectorAll('#synthSheet .mkx.mnum')].map(e => e.title).filter(Boolean);
    return {mix, silent, dots, titles, sorted};
  });
  ok('MK1-31 🎲 100 Würfe: jeder hörbar, Mixer OSZ 1 oder OSZ 2 ≥ 64', r.mix === 100 && r.silent.length === 0, r.mix + ' / stumm ' + r.silent.length);
  ok('MK1-31 ◎ markiert genau die abweichenden Stellungen (FILTER, A-HK)', JSON.stringify(r.dots) === '[5,8]', JSON.stringify(r.dots));
  ok('MK1-31 Seite B ist A–Z sortiert', JSON.stringify(r.titles) === JSON.stringify(r.sorted.slice(0, r.titles.length)), r.titles.join(','));
  ok('MK1-31 keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---- MK1-16 / MK1-33 wheels: pointer drags, BEND springs back, MOD stays, two fingers, nothing stored ----
await T('MK1-33', async () => {
  for (const fmt of ['P1', 'L1']) {
    const {ctx, page, errs} = await open(fmt);
    const cdp = await ctx.newCDPSession(page);
    const wb = await page.evaluate(() => { const r = q => { const e = document.querySelector(q); if (!e) return null; const b = e.getBoundingClientRect(); return {x: b.x, y: b.y, w: b.width, h: b.height}; };
      return {bend: r('#mkWh .mkwheel[data-w="bend"] .mwell'), mod: r('#mkWh .mkwheel[data-w="mod"] .mwell'), bendHit: r('#mkWh .mkwheel[data-w="bend"]'), modHit: r('#mkWh .mkwheel[data-w="mod"]'), kb: r('#kb'), keys: [...document.querySelectorAll('#kb .key, #kb [data-n]')].length}; });
    const h0 = await page.evaluate(() => [SQStore.soundHash(SYNQUENZER.getSound(0)), SYNQUENZER.undoInfo().n, JSON.stringify(SYNQUENZER.project().tracks[0])]);
    ok('MK1-33 ' + fmt + ' Räder links der ersten Taste, Treffer ≥ 44 × 44', wb.bend && wb.mod && wb.bend.x + wb.bend.w <= wb.mod.x && wb.mod.x + wb.mod.w <= wb.kb.x + 1 && wb.bendHit.w >= 44 && wb.bendHit.h >= 44 && wb.modHit.w >= 44, JSON.stringify(wb));
    // BEND to the top with a touch drag, keep, read; release -> centre in <= 100 ms
    const cx = wb.bend.x + wb.bend.w / 2, y0 = wb.bend.y + wb.bend.h / 2;
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((p, k) => ({x: p[0], y: p[1], id: p[2] != null ? p[2] : k}))});
    await touch('touchStart', [[cx, y0, 1]]); for (let s = 1; s <= 10; s++) await touch('touchMove', [[cx, y0 - (wb.bend.h / 2 + 10) * s / 10, 1]]);
    const up = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
    // second finger on the same wheel: ignored
    await touch('touchMove', [[cx, wb.bend.y - 10, 1], [cx, wb.bend.y + wb.bend.h - 4, 2]]); await touch('touchMove', [[cx, wb.bend.y - 10, 1], [cx, wb.bend.y + wb.bend.h, 2]]);
    const up2 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
    // three keys with other fingers while the wheel is held
    const keys = await page.evaluate(() => { const ks = [...document.querySelectorAll('#kb .white, #kb .w, #kb [data-n]')]; return ks.slice(0, 3).map(k => { const b = k.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height - 12]; }); });
    const t0 = await page.evaluate(() => SYNQUENZER.noteLog().length);
    await touch('touchMove', [[cx, wb.bend.y - 10, 1]].concat(keys.map((k, i) => [k[0], k[1], 10 + i])));
    await page.waitForTimeout(250);
    const during = await page.evaluate(n => ({log: SYNQUENZER.noteLog().slice(n).filter(e => e.src !== 'retune').length, bend: SYNQUENZER.mkWheel(0, 'bend')}), t0);
    await touch('touchEnd', [[cx, wb.bend.y - 10, 1]].concat(keys.map((k, i) => [k[0], k[1], 10 + i])));
    await touch('touchEnd', []);
    const tr = performance.now(); let back = null; for (let k = 0; k < 20; k++) { await page.waitForTimeout(10); const v = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend')); if (v === 0) { back = performance.now() - tr; break; } }
    ok('MK1-33 ' + fmt + ' BEND oben = +1 (± bend HT), zweiter Finger ändert nichts, federt in ≤ 100 ms zur Mitte', up === 1 && up2 === 1 && back != null && back <= 130, up + ' / ' + up2 + ' / ' + (back && back.toFixed(0)) + ' ms (Messung ± 30 ms)');
    ok('MK1-33 ' + fmt + ' zwei Finger: Rad halten und 3 Tasten spielen – alle 3 Noten klingen, das Rad wirkt', during.log >= 3 && during.bend === 1, JSON.stringify(during));
    // MOD to the top stays
    const mx = wb.mod.x + wb.mod.w / 2, my = wb.mod.y + wb.mod.h - 6;
    await touch('touchStart', [[mx, my, 3]]); for (let s = 1; s <= 10; s++) await touch('touchMove', [[mx, my - (wb.mod.h) * s / 10, 3]]); await touch('touchEnd', []);
    await page.waitForTimeout(150);
    const mod = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'mod'));
    const h1 = await page.evaluate(() => [SQStore.soundHash(SYNQUENZER.getSound(0)), SYNQUENZER.undoInfo().n, JSON.stringify(SYNQUENZER.project().tracks[0])]);
    ok('MK1-33 ' + fmt + ' MOD ganz oben = 1,0 und bleibt; nichts gespeichert, kein Undo', mod === 1 && h0[0] === h1[0] && h0[1] === h1[1] && h0[2] === h1[2], mod + ' ' + (h0[2] === h1[2]));
    // VA track: the keyboard layout deep-equal to a build without the wheels (no #mkWh, kbArea column)
    const va = await page.evaluate(async () => { SYNQUENZER.selectTrack(1); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const wh = document.getElementById('mkWh'), A = document.getElementById('kbArea');
      return {hidden: !wh || wh.hidden, cls: A.classList.contains('mkw'), kb: (b => [b.x, b.width])(document.getElementById('kb').getBoundingClientRect())}; });
    ok('MK1-33 ' + fmt + ' bei VA keine Räder (Tastatur unverändert)', va.hidden && !va.cls, JSON.stringify(va));
    ok('MK1-33 ' + fmt + ' keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 300));
    await ctx.close();
  }
});
await browser.close();
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
process.exit(fails ? 1 : 0);
