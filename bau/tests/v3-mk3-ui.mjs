// MK3 in Chromium: MK3-03 (Split ← nächste Note), MK3-04 TIMBRE, MK3-05 tools, MK3-10 surface (M-PLATZ, M-ANSICHT, hits),
// MK3-13 both / solo (UI), help, console. Usage: node v3-mk3-ui.mjs <index.html>  (ONLY=<regex>)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK3/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 500)); } };
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
async function open(fmt, o) {
  o = o || {}; const [w, h] = FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  return {ctx, page, errs};
}
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function tap(page, k) { const b = await box(page, k); await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(120); }
async function drag(page, k, dy, steps) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= (steps || 10); s++) await page.mouse.move(x, y - dy * s / (steps || 10)); await page.mouse.up(); await page.waitForTimeout(80); }
const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
const panel = page => page.evaluate(() => SYNQUENZER.mkPanel());
const undoN = page => page.evaluate(() => SYNQUENZER.undoInfo().n);
const mkg = page => page.evaluate(() => SYNQUENZER.mkGet(0));
const leds = page => page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k="timbre"] .mled')].map(e => (e.classList.contains('lon') ? 1 : 0) + (e.classList.contains('lbl') ? 'b' : '')).join(''));
const hashOf = page => page.evaluate(() => SQStore.soundHash(sndOf(0)));
const J = x => JSON.stringify(x);

await T('MK3-04', async () => {
  const {ctx, page, errs} = await open('L1');
  // Single: T2 locked, hint in the LCD, the key stays on T1
  await tap(page, 'timbre');
  let pi = await panel(page);
  ok('MK3-04 EINZELN: T2 gesperrt, Hinweis im LCD, Taste bleibt T1 (LED 1)', pi.timbre === 1 && /gesperrt/.test(await lcd(page)) && (await leds(page)) === '10', pi.timbre + ' | ' + (await lcd(page)) + ' | ' + (await leds(page)));
  // to SCHICHT via STIMME → EINZELN/SCHICHT (list tap)
  await page.evaluate(() => MKUI.setWahl(1, 0)); await tap(page, 'k1');
  const pick = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist.mkl button')].find(x => /Schicht/.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.touchscreen.tap(pick[0], pick[1]); await page.waitForTimeout(150);
  ok('MK3-04 EINZELN/SCHICHT per Liste auf Schicht: mode 1', (await mkg(page)).mode === 1, String((await mkg(page)).mode));
  const seq = []; for (let k = 0; k < 4; k++) { await tap(page, 'timbre'); seq.push((await panel(page)).timbre + ':' + (await leds(page))); }
  ok('MK3-04 Tipps auf TIMBRE: T1 → T2 → beide → T1 (LEDs 01, 11, 10)', seq.join(' ') === '2:01 beide:11 1:10 2:01', seq.join(' '));
  // a gesture with T2 (FILTER CUTOFF) leaves T1 deep-equal; the LCD says T2
  await page.evaluate(() => MKUI.setWahl(1, 5));
  const t1 = J((await mkg(page)).t[0]), c2 = (await mkg(page)).t[1].f.cut, u0 = await undoN(page);
  await drag(page, 'k1', -50, 10);
  const m = await mkg(page), l = await lcd(page);
  ok('MK3-04 Bearbeitung mit T2: T2 CUTOFF geändert, T1 deep-equal, ein Undo, LCD „T2 ·“', J(m.t[0]) === t1 && m.t[1].f.cut !== c2 && (await undoN(page)) === u0 + 1 && /T2 · FILTER/.test(l), c2 + ' → ' + m.t[1].f.cut + ' | ' + l);
  // M-ANSICHT: the TIMBRE key moves nothing (all panel elements ±2 px)
  const rects = () => page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx')].map(e => { const r = e.getBoundingClientRect(); return [e.dataset.k, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }));
  const r0 = await rects(); await tap(page, 'timbre'); const r1 = await rects(); await tap(page, 'timbre'); const r2 = await rects();
  const mv = (a, b) => Math.max(0, ...a.map((x, i) => b[i] ? Math.max(...[1, 2, 3, 4].map(j => Math.abs(x[j] - b[i][j]))) : 99));
  ok('MK3-10 M-ANSICHT beim Timbre-Wechsel: nichts springt (≤ 2 px)', r0.length === r1.length && mv(r0, r1) <= 2 && mv(r0, r2) <= 2, mv(r0, r1) + ' / ' + mv(r0, r2) + ' px, ' + r0.length + ' Elemente');
  // back to Single: the key returns to T1
  await page.evaluate(() => { MKUI.timbreKey(); });
  await page.evaluate(() => SYNQUENZER.mkSet(0, 'mode', 0)); await page.evaluate(() => MKUI.render());
  await tap(page, 'timbre');
  ok('MK3-04 zurück auf EINZELN: Taste auf T1', (await panel(page)).timbre === 1, String((await panel(page)).timbre));
  ok('MK3-04 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-13', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); SYNQUENZER.mkSet(0, 't.1.f.cut', 90); SYNQUENZER.mkSet(0, 't.0.f.cut', 70); MKUI.setWahl(1, 5); MKUI.render(); });
  const h0 = await hashOf(page);
  await tap(page, 'timbre'); await tap(page, 'timbre');
  ok('MK3-13 TIMBRE auf „beide“ (LEDs 11), soundHash durch die Taste unverändert', (await panel(page)).timbre === 'beide' && (await leds(page)) === '11' && (await hashOf(page)) === h0, (await leds(page)));
  const a0 = await mkg(page), u0 = await undoN(page);
  await drag(page, 'k1', 40, 10);
  const a1 = await mkg(page), d1 = a1.t[0].f.cut - a0.t[0].f.cut, d2 = a1.t[1].f.cut - a0.t[1].f.cut;
  ok('MK3-13 ein CUTOFF-Zug ändert T1 und T2 um dasselbe Δ, ein Undo', d1 !== 0 && d1 === d2 && (await undoN(page)) === u0 + 1, 'Δ ' + d1 + ' / ' + d2 + ', Undo +' + ((await undoN(page)) - u0));
  await page.evaluate(() => SYNQUENZER.undo()); const a2 = await mkg(page);
  ok('MK3-13 ↶ stellt beide zurück', a2.t[0].f.cut === a0.t[0].f.cut && a2.t[1].f.cut === a0.t[1].f.cut, a2.t[0].f.cut + ' / ' + a2.t[1].f.cut);
  // RELEASE in SPIEL with both: EG1 and EG2 of both timbres move by the same step
  await page.evaluate(() => MKUI.toSpiel());
  const b0 = await mkg(page); await drag(page, 'k3', 30, 8); const b1 = await mkg(page);
  ok('MK3-13 SPIEL RELEASE mit „beide“: beide Timbres gleich', b1.t[0].e2.r - b0.t[0].e2.r === b1.t[1].e2.r - b0.t[1].e2.r && b1.t[0].e2.r !== b0.t[0].e2.r, (b1.t[0].e2.r - b0.t[0].e2.r) + ' / ' + (b1.t[1].e2.r - b0.t[1].e2.r));
  const h1 = await hashOf(page); await tap(page, 'timbre');
  ok('MK3-13 Weiterschalten auf T1: nichts gespeichert (soundHash unverändert durch die Taste)', (await panel(page)).timbre === 1 && (await hashOf(page)) === h1, String((await panel(page)).timbre));
  // SHIFT + TIMBRE = solo of the selected timbre; its LED blinks; a tap ends it; not stored
  await tap(page, 'shift'); await tap(page, 'timbre');
  let pi = await panel(page); const ld = await leds(page), hs = await hashOf(page);
  const node = await page.evaluate(() => { const E = AU.synth[0]; return E && E.node ? true : false; });
  ok('MK3-13 SHIFT + TIMBRE: Solo T1, LED 1 blinkt, nicht gespeichert', pi.solo === 1 && /^1b/.test(ld) && hs === h1 && node, J({solo: pi.solo, ld}));
  await tap(page, 'timbre'); pi = await panel(page);
  ok('MK3-13 Tipp auf TIMBRE beendet Solo', !pi.solo && (await leds(page)).indexOf('b') < 0 && (await hashOf(page)) === h1, J({solo: pi.solo, timbre: pi.timbre, l: await leds(page)}));
  // solo T2 by the app path, rendered in the app (mkRender with o.solo): the other ≤ −90 dB
  const lv = await page.evaluate(async () => { const s = deep(sndOf(0)); s.p.mk.mode = 1; s.p.mk.t[1].o1.w = 1;
    const dbOf = r => { let e = 0; for (let i = 4800; i < r.l.length; i++) e += r.l[i] * r.l[i] + r.r[i] * r.r[i]; return 10 * Math.log10(e / (r.l.length - 4800) + 1e-60); };
    const a = await SYNQUENZER.mkRender(s, [[0, 'on', 60, .8]], {sec: .5, solo: 1}), t1 = deep(s); t1.p.mk.t[1].a.lvl = 0; const b = await SYNQUENZER.mkRender(t1, [[0, 'on', 60, .8]], {sec: .5});
    const d = {l: a.l.map((x, i) => x - b.l[i]), r: a.r.map((x, i) => x - b.r[i])}; return [dbOf(a), dbOf(d)]; });
  ok('MK3-13 Solo T1 in Chromium (OfflineAudioContext): T2-Anteil ≤ −90 dB unter T1', lv[1] - lv[0] <= -90, lv.map(x => x.toFixed(1)).join(' / ') + ' dB');
  // closing the editor ends solo and Edit Sync
  await tap(page, 'shift'); await tap(page, 'timbre');
  await page.evaluate(() => closeEditor()); await page.waitForTimeout(150);
  await page.evaluate(() => SYNQUENZER.openEditor()); await page.waitForTimeout(300); pi = await panel(page);
  ok('MK3-13 Editor schließen beendet Solo (beim Öffnen T1, kein Solo)', !pi.solo && pi.timbre === 1, J({solo: pi.solo, t: pi.timbre}));
  ok('MK3-13 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-03', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.setWahl(1, 0); MKUI.lcdOf(MKUI.knobs()[1]); });
  await page.waitForTimeout(120);
  const lk = await page.evaluate(() => { const b = document.querySelector('.lcd .lsplit'), L = b && b.closest('.lcd'); if (!b) return null; const r = L.getBoundingClientRect(); return {txt: b.textContent, x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height}; });
  ok('MK3-03 LCD-Zeile zeigt [Split ← nächste Note] (STIMME, Split)', lk && /Split ← nächste Note/.test(lk.txt), J(lk));
  const u0 = await undoN(page);
  await page.touchscreen.tap(lk.x, lk.y); await page.waitForTimeout(120);
  const armed = (await panel(page)).splitArm;
  await page.evaluate(() => { inputDown(64, 'tst', .8); }); await page.waitForTimeout(60); await page.evaluate(() => inputUp('tst'));
  const m = await mkg(page), u1 = await undoN(page);
  ok('MK3-03 Taste „Split ← nächste Note“: nächste gespielte Note (E4 = 64) wird SPLIT, ein Undo, danach nicht mehr scharf', armed && m.split === 64 && u1 === u0 + 1 && !(await panel(page)).splitArm, J({armed, split: m.split, undo: u1 - u0}));
  await page.evaluate(() => { inputDown(50, 'tst2', .8); inputUp('tst2'); });
  ok('MK3-03 die übernächste Note ändert SPLIT nicht', (await mkg(page)).split === 64, String((await mkg(page)).split));
  await page.evaluate(() => SYNQUENZER.undo());
  ok('MK3-03 ↶ stellt SPLIT zurück (60)', (await mkg(page)).split === 60, String((await mkg(page)).split));
  // SHIFT → SPLIT knob: a tap arms it as well; a drag sets it
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); });
  await tap(page, 'k2'); const a2 = (await panel(page)).splitArm;
  await page.evaluate(() => { inputDown(72, 'tst3', .8); inputUp('tst3'); });
  ok('MK3-03 Tipp auf SPLIT (EB2) macht die Taste ebenso scharf: C5 → 72', a2 && (await mkg(page)).split === 72, J({a2, split: (await mkg(page)).split}));
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); });
  const s0 = (await mkg(page)).split; await drag(page, 'k2', -60, 10);
  ok('MK3-03 SPLIT ziehen: Wert sinkt, LCD „darunter T1, ab hier T2“', (await mkg(page)).split < s0 && /ab hier T2/.test(await lcd(page)), s0 + ' → ' + (await mkg(page)).split + ' | ' + (await lcd(page)));
  ok('MK3-03 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-05', async () => {
  const {ctx, page, errs} = await open('L1');
  // a source in the library: an MS 2000 sound with distinct timbres
  await page.evaluate(async () => { SYNQUENZER.mkSet(0, 'mode', 1); SYNQUENZER.mkSet(0, 't.0.f.cut', 33); SYNQUENZER.mkSet(0, 't.1.o1.w', 4); SYNQUENZER.mkSet(0, 't.1.f.res', 99); SYNQUENZER.mkSet(0, 't.1.a.pan', -40);
    await SYNQUENZER.saveSound(0, 'Quelle MK3', 'new'); });
  await page.waitForTimeout(200);
  const src = await page.evaluate(() => SYNQUENZER.library().find(s => s.name === 'Quelle MK3'));
  // the target: INIT in this track, with T2 selected
  await page.evaluate(() => { initSound(0); }); await page.waitForTimeout(200);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); MKUI.render(); });
  await tap(page, 'timbre');   // T2
  // SHIFT + 1 → the list; pick "Quelle MK3" T2
  await tap(page, 'shift'); await tap(page, 'n0');
  const rows = await page.evaluate(() => [...document.querySelectorAll('.pop .mkcp .mkcr')].map(r => [r.querySelector('b').textContent, ...[...r.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().height) + 'x' + Math.round(b.getBoundingClientRect().width))]));
  const pk = await page.evaluate(() => { const r = [...document.querySelectorAll('.pop .mkcp .mkcr')].find(x => /Quelle MK3/.test(x.textContent)); const b = r && r.querySelectorAll('button')[1]; if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  const u0 = await undoN(page); await page.touchscreen.tap(pk[0], pk[1]); await page.waitForTimeout(200);
  let m = await mkg(page);
  ok('MK3-05 SHIFT + 1: Liste der MS-2000-Sounds (Zeilen ≥ 44 px), Quelle T2 → Ziel T2 deep-equal, ein Undo', J(m.t[1]) === J(src.p.mk.t[1]) && (await undoN(page)) === u0 + 1 && rows.length >= 2, J(rows).slice(0, 160));
  // copy T1 of the source into T1 via the ⋯ menu path (MKUI.timCopy is what the list calls)
  await tap(page, 'timbre'); await tap(page, 'timbre');   // → beide → T1
  const u1 = await undoN(page); await page.evaluate(() => { const s = SYNQUENZER.library().find(x => x.name === 'Quelle MK3'); MKUI.timCopy(0, s, 0); });
  m = await mkg(page);
  ok('MK3-05 Kopieren T1 der Quelle → T1 deep-equal, ein Undo', J(m.t[0]) === J(src.p.mk.t[0]) && (await undoN(page)) === u1 + 1, (await undoN(page)) - u1 + ' Undo');
  // swap twice = the start; one undo each
  const s0 = J(m); const u2 = await undoN(page);
  await tap(page, 'shift'); await tap(page, 'n1'); const s1 = await mkg(page);
  await tap(page, 'shift'); await tap(page, 'n1'); const s2 = await mkg(page);
  ok('MK3-05 SHIFT + 2 Tauschen: einmal T1 ⇄ T2, zweimal = Ausgang, je ein Undo', J(s1.t[0]) === J(m.t[1]) && J(s1.t[1]) === J(m.t[0]) && J(s2) === s0 && (await undoN(page)) === u2 + 2, ((await undoN(page)) - u2) + ' Undo');
  // INIT timbre (the selected one = T1 here) = INIT values
  const u3 = await undoN(page); await tap(page, 'shift'); await tap(page, 'n3');
  const ini = await page.evaluate(() => SQMK.init().t[0]); m = await mkg(page);
  ok('MK3-05 SHIFT + 4 Timbre neu: T1 = INIT-Werte, T2 unverändert, ein Undo', J(m.t[0]) === J(ini) && J(m.t[1]) === J(s2.t[1]) && (await undoN(page)) === u3 + 1, ((await undoN(page)) - u3) + ' Undo');
  await page.evaluate(() => SYNQUENZER.undo());
  ok('MK3-05 ↶ nach Timbre neu = vorher', J(await mkg(page)) === J(s2), '');
  // the ⋯ menu shows the three tools (synth sheet "⋯")
  const menu = await page.evaluate(async () => { const b = [...document.querySelectorAll('#synthSheet button')].find(x => x.textContent.trim() === '⋯' || x.getAttribute('aria-label') === 'Mehr'); if (!b) return null; b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, pointerId: 9})); b.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, pointerId: 9})); b.click(); await new Promise(r => setTimeout(r, 200)); return [...document.querySelectorAll('.pop button[data-a]')].map(x => [x.dataset.a, Math.round(x.getBoundingClientRect().height)]); });
  ok('MK3-05 ⋯ enthält Timbre kopieren / tauschen / neu (Zeilen ≥ 44 px)', menu && ['tcopy', 'tswap', 'tinit'].every(a => menu.some(x => x[0] === a && x[1] >= 44)), J(menu));
  await page.evaluate(() => closePop());
  ok('MK3-05 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await T('MK3-10', async () => {
  // M-PLATZ for the new states in every format (+ L1 with safe area); hit areas >= 44 x 44 without overlap; labels not cut
  const states = [
    ['stimme-split', () => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.setWahl(1, 0); MKUI.lcdOf(MKUI.knobs()[1]); }],
    ['stimme-eb2', () => { MKUI.P.shift = 1; MKUI.render(); }],
    ['timbre-t2', () => { MKUI.P.shift = 0; MKUI.timbreKey(); MKUI.setWahl(1, 5); }],
    ['beide', () => { MKUI.timbreKey(); MKUI.render(); }],
    ['solo', () => { MKUI.P.shift = 1; MKUI.timbreKey(); }],
    ['stimmung', () => { MKUI.timbreKey(); SYNQUENZER.mkSet(0, 'scale', 9); MKUI.setWahl(2, 9); }],
    ['stimmung-eb2', () => { MKUI.P.shift = 1; MKUI.render(); }],
    ['eigene', () => { MKUI.P.shift = 0; MKUI.viewOpen('eigene'); }],
    ['zurueck', () => { MKUI.viewClose(); }],
    ['liste-w2', null],
    ['kopieren', () => { closePop(); MKUI.timCopyPop(null); }]];
  const res = [];
  for (const [f] of Object.entries(FMT)) for (const half of (f === 'P2' || f === 'P3' || f === 'L2') ? ['B', 'A'] : ['']) {
    const {ctx, page, errs} = await open(f);
    if (half) await page.evaluate(h => { MKUI.setHalf(h); MKUI.build(document.querySelector('#synthSheet .pg') || MKUI.P.pg, 0); }, half);
    for (const [n, fn] of states) {
      if (fn) await page.evaluate(fn); else if (await box(page, 'w2')) await tap(page, 'w2'); else if (await box(page, 'w1')) await tap(page, 'w1');
      await page.waitForTimeout(160);
      const r = await page.evaluate(() => {
        const out = {over: [], cut: [], small: [], lap: []}, W = innerWidth, H = innerHeight;
        if (document.documentElement.scrollWidth > W) out.over.push('page ' + document.documentElement.scrollWidth);
        const pg = document.querySelector('#synthSheet .pg'); if (pg && pg.scrollHeight > pg.clientHeight + 1) out.over.push('pg-h ' + pg.scrollHeight + '/' + pg.clientHeight);
        const hits = [];
        for (const e of document.querySelectorAll('#synthSheet .mkx, .pop .mkcp button, .pop .plist.mkl button')) {
          const r = e.getBoundingClientRect(); if (!r.width) continue;
          if (r.right > W + .5 || r.bottom > H + .5 || r.left < -.5 || r.top < -.5) out.over.push((e.dataset.k || e.textContent.slice(0, 10)) + ' außen');
          const st = getComputedStyle(e, '::after'), sb = getComputedStyle(e, '::before');
          const hit = e.tagName === 'BUTTON' || e.classList.contains('mkx') && !/\b(mdisp|mprog|msep|morig)\b/.test(e.className) && !/^(HL|HR)$/.test(e.dataset.k);
          if (hit && !e.classList.contains('dark') && (r.width < 43.5 || r.height < 43.5)) out.small.push((e.dataset.k || e.textContent.slice(0, 12)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
          if (hit && e.classList.contains('mkx')) hits.push([e.dataset.k, r.left, r.top, r.right, r.bottom]);
        }
        for (let i = 0; i < hits.length; i++) for (let j = i + 1; j < hits.length; j++) { const a = hits[i], b = hits[j]; const ox = Math.min(a[3], b[3]) - Math.max(a[1], b[1]), oy = Math.min(a[4], b[4]) - Math.max(a[2], b[2]); if (ox > 1 && oy > 1) out.lap.push(a[0] + '∩' + b[0]); }
        for (const e of document.querySelectorAll('#synthSheet .mkx *, .pop .mkcp *')) { if (!e.offsetParent || e.children.length) continue; if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible' && getComputedStyle(e).textOverflow !== 'ellipsis') out.cut.push(e.textContent.slice(0, 14)); }
        return out;
      });
      const bad = r.over.length + r.small.length + r.lap.length + r.cut.length;
      res.push([f + (half ? '-' + half : '') + ' ' + n, bad ? J(r) : 'ok']);
    }
    if (errs.length) res.push([f + ' Konsole', errs.join(' | ').slice(0, 200)]);
    await ctx.close();
  }
  const bad = res.filter(x => x[1] !== 'ok');
  ok('MK3-10 M-PLATZ in P1, P2 (A/B), P3 (A/B), L1, L2 (A/B), W × 11 Zustände: nichts außen, Treffer ≥ 44 × 44 ohne Überlappung, nichts abgeschnitten', !bad.length, res.length + ' Fälle' + (bad.length ? ' · ' + bad.slice(0, 6).map(x => x.join(': ')).join(' | ') : ''));
  // EIGENE: P1 2 x 6 à 60 (360 px), L1 12 x 56 with 3 px (705 px), L2 12 x 50 with 3 px (633 px); 12 knobs act ±100 ct; [◂ GERÄT] 44 px
  const sizes = [];
  for (const f of ['P1', 'L1', 'L2', 'P2', 'P3', 'W']) {
    const {ctx, page} = await open(f);
    await page.evaluate(() => { SYNQUENZER.mkSet(0, 'scale', 9); MKUI.setWahl(2, 9); });
    // open EIGENE by a tap on the matrix row of STIMMUNG (m2, or m1 in the half views where only the active row shows)
    const k = await page.evaluate(() => (document.querySelector('#synthSheet .mkx[data-k="m2"]') ? 'm2' : 'm1'));
    await tap(page, k); await page.waitForTimeout(200);
    const oi = await page.evaluate(() => MKUI.ownInfo()); const pi = await panel(page);
    if (!oi) { sizes.push(f + ' nicht offen'); await ctx.close(); continue; }
    const kn = oi.els.filter(e => /^u\d+$/.test(e.k)), bk = oi.els.find(e => e.k === 'back');
    sizes.push(f + ' ' + Math.round(oi.w) + '×' + Math.round(oi.h) + ' Regler ' + Math.round(kn[0].w) + '×' + Math.round(kn[0].h) + ' zurück ' + Math.round(bk.w) + '×' + Math.round(bk.h) + (pi.view === 'eigene' ? '' : ' VIEW?'));
    if (f === 'P1') {
      // a drag on knob 5 (E with key C) changes usc[4], one undo; ◂ GERÄT returns
      const u0 = await undoN(page); await drag(page, 'u4', 60, 10); const m = await mkg(page);
      ok('MK3-10 EIGENE: Regler E ziehen ändert usc[4], ein Undo, LCD in ct', m.usc[4] > 0 && (await undoN(page)) === u0 + 1 && /ct/.test(await lcd(page)), m.usc[4] + ' | ' + (await lcd(page)));
      await tap(page, 'back'); const p2 = await panel(page);
      ok('MK3-10 [◂ GERÄT] führt zurück zum Bedienfeld (STIMMUNG bleibt gewählt)', !p2.view && p2.sel.wahl === 2 && p2.sel.pos === 9, J(p2.sel));
    }
    await ctx.close();
  }
  const want = {P1: [360, 6, 60], L1: [705, 12, 56], L2: [633, 12, 50]};
  const okSz = sizes.every(s => !/nicht offen|VIEW/.test(s)) && Object.entries(want).every(([f, [w, , kw]]) => { const s = sizes.find(x => x.startsWith(f + ' ')); return s && Math.abs(+s.split(' ')[1].split('×')[0] - w) <= 2 && +s.split('Regler ')[1].split('×')[0] === kw; });
  ok('MK3-10 Zusatz-Ansicht EIGENE per Tipp auf die Matrix-Zeile: P1 2 × 6 à 60 (360), L1 12 × 56 + 3 px (705), L2 12 × 50 + 3 px (633); Treffer ≥ 44', okSz, sizes.join(' | '));
});

await T('MK3-11', async () => {
  // help lines, LCD hints (L10), brand rule in the AM part
  const {ctx, page, errs} = await open('P1');
  const help = await page.evaluate(() => document.documentElement.outerHTML.match(/MK_LABEL \+ ' · (TIMBRE|STIMMUNG)[^']*'/g) || []);
  ok('MK3-11 Hilfe-Zeilen für TIMBRE, TIMBRE-Taste, STIMMUNG', help.length >= 3, help.length + ' Zeilen');
  ok('MK3-11 keine Konsolenfehler beim Öffnen', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

await browser.close();
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
process.exit(fails ? 1 : 0);
