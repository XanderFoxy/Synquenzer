// FP-TOUCH / FP-DSP (live) probes for MK3 in Chromium. node v3-fpq-mk3-ui.mjs  (ONLY=<regex>)
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { console.log('ERR ' + id + ' ' + String(e.stack || e).slice(0, 600)); } };
const J = x => JSON.stringify(x);
async function open(w, h) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(600);
  return {ctx, page, errs};
}
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function tap(page, k) { const b = await box(page, k); if (!b) throw new Error('kein ' + k); await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); await page.waitForTimeout(150); }
const panel = page => page.evaluate(() => SYNQUENZER.mkPanel());
const mkg = page => page.evaluate(() => SYNQUENZER.mkGet(0));
const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
const leds = page => page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k="timbre"] .mled')].map(e => (e.classList.contains('lon') ? 1 : 0) + (e.classList.contains('lbl') ? 'b' : '')).join(''));
// live level of track 0: an analyser on the engine node (extra connection), note held 400 ms
async function liveLevel(page, note) {
  return page.evaluate(async note => {
    const E = AU.synth[0]; if (!E || !E.node) return 'kein Knoten';
    if (!window.__an) { window.__an = AU.ctx.createAnalyser(); window.__an.fftSize = 8192; }
    try { E.node.connect(window.__an); } catch (e) {}
    await AU.ctx.resume();
    inputDown(note, 'lv' + note, .8); await new Promise(r => setTimeout(r, 350));
    const b = new Float32Array(8192); window.__an.getFloatTimeDomainData(b); let e = 0; for (const x of b) e += x * x;
    inputUp('lv' + note); await new Promise(r => setTimeout(r, 600));
    try { E.node.disconnect(window.__an); } catch (e) {}
    return Math.round(10 * Math.log10(e / b.length + 1e-30) * 10) / 10;
  }, note);
}

await T('A Solo T2 und Undo zurück auf EINZELN', async () => {
  for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
    const {ctx, page, errs} = await open(w, h);
    const l0 = await liveLevel(page, 60);
    // EINZELN → SCHICHT by the knob list (one undo), T2 selected, SHIFT + TIMBRE = solo T2
    await page.evaluate(() => MKUI.setWahl(1, 0)); await tap(page, 'k1');
    const pick = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist.mkl button')].find(x => /Schicht/.test(x.textContent)); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    await page.touchscreen.tap(pick[0], pick[1]); await page.waitForTimeout(200);
    await tap(page, 'timbre'); await tap(page, 'shift'); await tap(page, 'timbre');
    const p1 = await panel(page), ld1 = await leds(page), l1 = await liveLevel(page, 60);
    // undo (↶ in the sheet header, as a user would)
    const ub = await page.evaluate(() => { const b = [...document.querySelectorAll('#synthSheet button')].find(x => /↶/.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    if (ub) await page.touchscreen.tap(ub[0], ub[1]); else await page.evaluate(() => SYNQUENZER.undo());
    await page.waitForTimeout(300);
    const m = await mkg(page), p2 = await panel(page), ld2 = await leds(page), l2 = await liveLevel(page, 60);
    console.log(lab + ' A: Einzeln ' + l0 + ' dB; Schicht Solo T2: panel ' + J({t: p1.timbre, solo: p1.solo}) + ' LEDs ' + ld1 + ' Pegel ' + l1 + ' dB; nach ↶ (' + (ub ? 'Taste' : 'API') + '): mode ' + m.mode + ' panel ' + J({t: p2.timbre, solo: p2.solo}) + ' LEDs ' + ld2 + ' Pegel ' + l2 + ' dB | LCD ' + (await lcd(page)).slice(0, 80));
    // and a tap on TIMBRE now
    await tap(page, 'timbre'); const l3 = await liveLevel(page, 60);
    console.log(lab + ' A: danach Tipp auf TIMBRE: panel ' + J(await panel(page)) .slice(0, 0) + J({solo: (await panel(page)).solo}) + ' Pegel ' + l3 + ' dB; Fehler ' + errs.length);
    await ctx.close();
  }
});

await T('B Split scharf, dann andere Sektion', async () => {
  const {ctx, page} = await open(844, 390);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.setWahl(1, 0); MKUI.lcdOf(MKUI.knobs()[1]); });
  await page.waitForTimeout(150);
  const lk = await page.evaluate(() => { const b = document.querySelector('.lcd .lsplit'), L = b && b.closest('.lcd'); if (!b) return null; const r = L.getBoundingClientRect(), q = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, lcd: [Math.round(r.width), Math.round(r.height)], key: [Math.round(q.width), Math.round(q.height)]}; });
  await page.touchscreen.tap(lk.x, lk.y); await page.waitForTimeout(120);
  const a = (await panel(page)).splitArm;
  // go to FILTER (EDIT-WAHL 1 pos 5), nothing shows the armed state any more
  await page.evaluate(() => { MKUI.setWahl(1, 5); MKUI.render(); }); await page.waitForTimeout(120);
  const vis = await page.evaluate(() => !!document.querySelector('.lcd .lsplit'));
  const s0 = (await mkg(page)).split;
  await page.evaluate(() => { inputDown(84, 'q1', .8); }); await page.waitForTimeout(80); await page.evaluate(() => inputUp('q1'));
  console.log('B L1: LCD-Zeile ' + lk.lcd.join('×') + ', Schild ' + lk.key.join('×') + '; scharf ' + a + '; nach Wechsel zu FILTER Schild sichtbar ' + vis + ', splitArm ' + (await panel(page)).splitArm + '; Note C6 gespielt → split ' + s0 + ' → ' + (await mkg(page)).split + ' | LCD ' + (await lcd(page)).slice(0, 70));
  // also: tap on SPLIT knob (EB2) = arm; a user only looking at the value
  await page.evaluate(() => { MKUI.setWahl(1, 0); MKUI.P.shift = 1; MKUI.render(); }); await page.waitForTimeout(100);
  await tap(page, 'k2'); const a2 = (await panel(page)).splitArm, l2 = await lcd(page);
  await tap(page, 'shift'); await tap(page, 'shift');
  console.log('B L1: Tipp auf SPLIT-Regler: scharf ' + a2 + ' | LCD ' + l2.slice(0, 80) + ' | nach SHIFT aus/an noch scharf ' + (await panel(page)).splitArm);
  await ctx.close();
  const P = await open(390, 844);
  await P.page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.setWahl(1, 0); MKUI.lcdOf(MKUI.knobs()[1]); });
  await P.page.waitForTimeout(150);
  const lk2 = await P.page.evaluate(() => { const b = document.querySelector('.lcd .lsplit'), L = b && b.closest('.lcd'); if (!b) return null; const r = L.getBoundingClientRect(), q = b.getBoundingClientRect(); return {lcd: [Math.round(r.width), Math.round(r.height)], key: [Math.round(q.width), Math.round(q.height)], txt: L.innerText.replace(/\s+/g, ' ')}; });
  console.log('B P1: LCD-Zeile ' + J(lk2));
  await P.ctx.close();
});

await T('C EIGENE M-ANSICHT Rahmen/Räder', async () => {
  for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
    const {ctx, page} = await open(w, h);
    await page.evaluate(() => { SYNQUENZER.mkSet(0, 'scale', 9); MKUI.setWahl(2, 9); MKUI.render(); }); await page.waitForTimeout(150);
    const geo = () => page.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
      const wh = [...document.querySelectorAll('[class*="whl"], .mkwheel, #kbArea .mkw, #kbArea [data-k]')].slice(0, 2).map(e => { const r = e.getBoundingClientRect(); return [e.className.slice(0, 20), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; });
      return {kb: q('#kbArea'), kbk: q('#kb'), sheet: q('#synthSheet'), pg: q('#synthSheet .pg'), lcd: q('#synthSheet .lcd'), hdr: q('#synthSheet .sh-head') || q('#synthSheet header'), wh}; });
    const g0 = await geo();
    const k = await page.evaluate(() => (document.querySelector('#synthSheet .mkx[data-k="m2"]') ? 'm2' : 'm1'));
    await tap(page, k); await page.waitForTimeout(250);
    const g1 = await geo(), pv = (await panel(page)).view;
    // touch targets in EIGENE and their texts
    const own = await page.evaluate(() => { const o = MKUI.ownInfo(); if (!o) return null; return o.els.map(e => e.k + ':' + Math.round(e.w) + 'x' + Math.round(e.h)).join(' '); });
    const cut = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx *')].filter(e => !e.children.length && e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.slice(0, 16)));
    await page.screenshot({path: new URL('./v3-fpq-mk3-eigene-' + lab + '.png', import.meta.url).pathname});
    await tap(page, 'back'); await page.waitForTimeout(200); const g2 = await geo();
    console.log(lab + ' C: view ' + pv + '; vorher ' + J(g0) + '\n   EIGENE ' + J(g1) + '\n   zurück ' + J(g2) + '\n   Treffer ' + own + '\n   abgeschnitten ' + J(cut));
    await ctx.close();
  }
});

await T('D Touch-CSS und Kontrast', async () => {
  for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
    const {ctx, page} = await open(w, h);
    await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); SYNQUENZER.mkSet(0, 'scale', 9); MKUI.setWahl(1, 0); MKUI.P.shift = 1; MKUI.render(); MKUI.lcdOf(MKUI.knobs()[1]); });
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => {
      const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(x => { x = +x / 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
      const bgOf = e => { for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); if (s.backgroundImage && s.backgroundImage !== 'none') { const m = s.backgroundImage.match(/rgba?\([^)]*\)|#[0-9a-f]{3,6}/gi); if (m) return {c: m[0], grad: true}; } if (s.backgroundColor && !/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) return {c: s.backgroundColor}; } return {c: 'rgb(0,0,0)'}; };
      const hex = c => (c[0] === '#' ? 'rgb(' + (c.length === 4 ? [1, 2, 3].map(i => parseInt(c[i] + c[i], 16)) : [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))).join(',') + ')' : c);
      const out = [];
      const sel = ['#synthSheet .mkx[data-k="timbre"] .msh', '#synthSheet .mkx[data-k="timbre"] .mkey', '#synthSheet .mkx[data-k="n0"] .msh', '#synthSheet .mkx[data-k="n1"] .msh', '#synthSheet .mkx[data-k="n3"] .msh', '#synthSheet .mkx[data-k="n4"] .msh', '.lcd .lsplit', '#synthSheet .meb'];
      for (const s of sel) for (const e of document.querySelectorAll(s)) { if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue; const st = getComputedStyle(e), bg = bgOf(e), L1 = lum(st.color), L2 = lum(hex(bg.c)); if (L1 == null || L2 == null) continue;
        const cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05), op = +st.opacity * (e.parentElement ? +getComputedStyle(e.parentElement).opacity : 1);
        out.push(s.replace('#synthSheet ', '') + ' "' + e.textContent.trim().slice(0, 14) + '" ' + st.fontSize + ' ' + st.color + ' auf ' + bg.c + (bg.grad ? '(Verlauf)' : '') + ' → ' + cr.toFixed(2) + (op < 1 ? ' opacity ' + op : '') + ' ws ' + e.scrollWidth + '/' + e.clientWidth); }
      const tc = ['#synthSheet .mkx[data-k="timbre"]', '.lcd', '#synthSheet .mkx[data-k="k2"]'].map(s => { const e = document.querySelector(s); if (!e) return s + ' –'; const st = getComputedStyle(e); return s.replace('#synthSheet ', '') + ' touch-action ' + st.touchAction + ' user-select ' + (st.webkitUserSelect || st.userSelect) + ' callout ' + st.webkitTouchCallout; });
      return {out, tc};
    });
    console.log(lab + ' D Kontrast:\n   ' + r.out.join('\n   ') + '\n   ' + r.tc.join('\n   '));
    await ctx.close();
  }
});

await T('E Solo bei Spurwechsel / Laden', async () => {
  const {ctx, page, errs} = await open(844, 390);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); SYNQUENZER.mkSet(0, 't.1.o1.w', 1); MKUI.render(); });
  await tap(page, 'timbre'); await tap(page, 'shift'); await tap(page, 'timbre');   // solo T2
  const p0 = await panel(page);
  // SHIFT + 2 (swap) while solo
  await tap(page, 'shift'); await tap(page, 'n1'); await page.waitForTimeout(200);
  const p1 = await panel(page), ld = await leds(page), l1 = await liveLevel(page, 60);
  console.log('E Solo ' + J({solo: p0.solo, t: p0.timbre}) + ' → SHIFT + 2: ' + J({solo: p1.solo, t: p1.timbre}) + ' LEDs ' + ld + ' Pegel ' + l1 + ' dB | LCD ' + (await lcd(page)).slice(0, 70));
  // SHIFT + 4 (init) while solo T2 → which timbre?
  await tap(page, 'shift'); await tap(page, 'n3'); await page.waitForTimeout(200);
  const m = await mkg(page);
  console.log('E SHIFT + 4 bei Solo T2 / Wahl ' + J((await panel(page)).timbre) + ': T1 w ' + m.t[0].o1.w + ' T2 w ' + m.t[1].o1.w + ' | LCD ' + (await lcd(page)).slice(0, 70) + ' Fehler ' + errs.length);
  await ctx.close();
});

await T('F ⋯ Werkzeuge ohne GERÄT', async () => {
  const {ctx, page, errs} = await open(390, 844);
  await page.evaluate(() => { SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.mkSet(1, 'mode', 1); SYNQUENZER.mkSet(1, 't.0.f.cut', 11); SYNQUENZER.mkSet(1, 't.1.f.cut', 99); });
  // panel built for track 0 with T2 selected (Schicht)
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); MKUI.render(); }); await tap(page, 'timbre');
  const pi = await panel(page);
  // switch to track 1 and use ⋯ → Timbre neu without the GERÄT panel being rebuilt (FX tab)
  const fx = await page.evaluate(async () => { SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 400));
    const tabs = [...document.querySelectorAll('#synthSheet button, #synthSheet [role=tab]')].filter(b => /^FX$/.test(b.textContent.trim())); return tabs.length; });
  const r = await page.evaluate(async () => { const b = [...document.querySelectorAll('#synthSheet button')].find(x => x.textContent.trim() === '⋯'); if (!b) return 'kein ⋯';
    const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  if (Array.isArray(r)) { await page.touchscreen.tap(r[0], r[1]); await page.waitForTimeout(250); }
  const it = await page.evaluate(() => { const b = document.querySelector('.pop button[data-a="tinit"]'); if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2, q.height]; });
  if (it) { await page.touchscreen.tap(it[0], it[1]); await page.waitForTimeout(250); }
  const m1 = await page.evaluate(() => SYNQUENZER.mkGet(1));
  console.log('F Spur 0 Wahl ' + pi.timbre + '; Spur 1 ⋯ → Timbre neu: T1 cut ' + m1.t[0].f.cut + ', T2 cut ' + m1.t[1].f.cut + ' (Wahl jetzt ' + J((await panel(page)).timbre) + ', P.i ' + (await page.evaluate(() => MKUI.P.i)) + ') | LCD ' + (await lcd(page)).slice(0, 70) + ' | ⋯-Zeile h ' + (it && it[2]) + ' Fehler ' + errs.length);
  await ctx.close();
});

await browser.close();
