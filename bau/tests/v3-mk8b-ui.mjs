// MK8b in Chromium: MK8b-01 (128 load without error via the library, one undo each), MK8b-04 (VOCODER genre: loading sets
// E2 = Mikrofon, with fake mic audible), MK8b-05 (load = 1 undo, undo deep-equal; „Auf Platz schreiben“ by touch like MK8-09;
// save -> load deep-equal), MK8b-06 (layout P1 P2 P3 L1 L2 926x428: nothing clipped, >= 44 px, list scrolls by finger,
// 0 px layout jump), preview. Usage: node v3-mk8b-ui.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
const FILE = path.resolve(process.argv[2]), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const DIR = path.dirname(new URL(import.meta.url).pathname), SHOTS = DIR + '/v3-mk8b-shots';
fs.mkdirSync(SHOTS, {recursive: true});
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const browser = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 600)); } };
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], X: [926, 428]};
async function open(fmt, br) {
  const [w, h] = FMT[fmt || 'P1'];
  const ctx = await (br || browser).newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  return {ctx, page, errs};
}
const prep = page => page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); });
const tapSel = async (page, sel) => { const b = await page.$(sel); if (!b) throw new Error('fehlt ' + sel); await b.scrollIntoViewIfNeeded(); await b.tap(); await page.waitForTimeout(160); };
async function swipe(page, x, y0, y1) {   // CDP touch drag (finger)
  const c = await page.context().newCDPSession(page);
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y: y0}]});
  for (let k = 1; k <= 12; k++) { await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y0 + (y1 - y0) * k / 12}]}); await page.waitForTimeout(16); }
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(400); await c.detach();
}

await T('MK8b-01/05 Laden aller 128 über die Bibliothek', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page);
  const r = await page.evaluate(async () => {
    const bad = [], snap = () => JSON.stringify(S.tracks[0].sound) + JSON.stringify(S.tracks[0].mkIn || null);
    openBrowser(0);
    for (let g = 1; g <= 8; g++) {
      BR.kp = g; brRefresh();
      const rows = [...document.querySelectorAll('#sndSheet .brow')].map(x => x.dataset.id), want = MKK.list(g).map(x => x.id);
      if (JSON.stringify(rows) !== JSON.stringify(want)) bad.push('Liste ' + g);
      for (const id of want) {
        const before = snap(), top = UNDO[UNDO.length - 1];
        SYNQUENZER.browserTap(id);
        const one = UNDO[UNDO.length - 1] !== top && UNDO[UNDO.length - 2] === top;
        if (S.tracks[0].sound.origin !== id || !one || soundEdited(S.tracks[0].sound)) bad.push(id + (one ? '' : ' undo≠1'));
        undo(); if (snap() !== before) bad.push(id + ' undo≠');
        redo(); if (S.tracks[0].sound.origin !== id) bad.push(id + ' redo');
      }
    }
    closeBrowser(false);
    return {bad};
  });
  ok('MK8b-01 128 laden ohne Fehler (Bibliothek, 8 Genres × 16)', r.bad.length === 0 && errs.length === 0, r.bad.slice(0, 10).join(' ') || '128 Programme, Liste je Genre = 16 in Reihenfolge, nicht „geändert“');
  ok('MK8b-05 Laden = 1 Undo, Undo deep-equal, Redo', r.bad.length === 0, r.bad.length ? r.bad.length + ' Fehler' : '128 × je ein Undo-Schritt');
  ok('MK8b-01 Konsole', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
});

await T('MK8b-05 Auf Platz schreiben (Touch) und Speichern → Laden', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page);
  const before = await page.evaluate(() => { openBrowser(0); return {lib: JSON.stringify(SYNQUENZER.library()), snd: JSON.stringify(S.tracks[0].sound), places: JSON.stringify(Array.from({length: 128}, (_, k) => MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id))}; });
  await tapSel(page, '#sndSheet .brkp');
  await tapSel(page, '#sndSheet .brkg[data-g="3"]');
  const id = 'f-mk-k309';
  await tapSel(page, `#sndSheet .brow[data-id="${id}"] .bmore`);
  await tapSel(page, '#sndSheet .bacts [data-act="kpw"]');
  await page.waitForTimeout(200);
  await tapSel(page, '.pop.mk8w .mk8bk button[data-b="4"]');
  await tapSel(page, '.pop.mk8w .mk8sl button[data-s="7"]');
  const goTxt = await page.evaluate(() => document.querySelector('.pop.mk8w [data-a="go"]').textContent);
  await tapSel(page, '.pop.mk8w [data-a="go"]'); await page.waitForTimeout(500);
  const w = await page.evaluate(id => { const own = MKF.ownAt(4, 7), places = Array.from({length: 128}, (_, k) => MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id);
    const same = own && JSON.stringify(own.p.mk) === JSON.stringify(factorySound(id).p.mk);
    mkProg.select(4, 7); const c = mkProg.current();
    return {own: own && {id: own.id, name: own.name, bank: own.bank, slot: own.slot}, same, places, label: c && c.label, loaded: S.tracks[0].sound.origin, track: JSON.stringify(S.tracks[0].sound.p.mk) === JSON.stringify(factorySound(id).p.mk)}; }, id);
  const pb = JSON.parse(before.places); let others = 0; for (let k = 0; k < 128; k++) if (k !== 3 * 16 + 6 && w.places[k] !== pb[k]) others++;
  ok('MK8b-05 Auf Platz schreiben (Kompakt → D07, per Finger)', goTxt === 'Auf D07 schreiben' && w.own && w.own.bank === 4 && w.own.slot === 7 && w.same && w.label === 'D07' && w.loaded === w.own.id && w.track,
    'Taste „' + goTxt + '“, D07 trägt „' + (w.own && w.own.name) + '“ (Werte = Kompakt-Programm), D07 lädt ihn danach');
  ok('MK8b-05 alle anderen Plätze unverändert', others === 0, others + ' andere Plätze geändert');
  const u = await page.evaluate(b => { undo(); undo(); const r = {lib: JSON.stringify(SYNQUENZER.library()) === b.lib, own: !!MKF.ownAt(4, 7), fac: MKF.progRec(4, 7).id}; redo(); r.redo = !!MKF.ownAt(4, 7); return r; }, before);
  ok('MK8b-05 Undo des Schreibens deep-equal, Redo', u.lib && !u.own && u.fac === 'f-mk-d07' && u.redo, JSON.stringify(u));
  // a second write onto the same place: the older one keeps living in Eigene without a place
  const w2 = await page.evaluate(async () => { const old = MKF.ownAt(4, 7).id; const s = await MKK.writeRec(MKK.rec(1, 2), 4, 7); const o = SYNQUENZER.library().find(x => x.id === old);
    return {newOwn: MKF.ownAt(4, 7).id === s.id, oldKept: !!o, oldBank: o && o.bank, n: SYNQUENZER.library().filter(x => x.bank === 4 && x.slot === 7).length}; });
  ok('MK8b-05 zweites Schreiben: der ältere verliert nur den Platz', w2.newOwn && w2.oldKept && !w2.oldBank && w2.n === 1, JSON.stringify(w2));
  // save -> load: a track with a Kompakt program and the written library record
  const j = await page.evaluate(() => { closeBrowser(false); SYNQUENZER.browserTap && 0; loadPreset(0, 'f-mk-k512'); return {file: SYNQUENZER.serialize(), snd: JSON.stringify(S.tracks[0].sound), lib: SYNQUENZER.library().filter(x => x.bank).map(x => JSON.stringify({b: x.bank, s: x.slot, p: x.p}))}; });
  await ctx.close();
  const {ctx: c2, page: p2, errs: e2} = await open('P1');
  const r = await p2.evaluate(async j => { await SYNQUENZER.libraryReady(); const okI = SYNQUENZER.importJSON(j.file); await new Promise(r => setTimeout(r, 400));
    const lib = SYNQUENZER.library().filter(x => x.bank).map(x => JSON.stringify({b: x.bank, s: x.slot, p: x.p}));
    return {okI, snd: JSON.stringify(S.tracks[0].sound) === j.snd, origin: S.tracks[0].sound.origin, edited: soundEdited(S.tracks[0].sound), lib: j.lib.every(x => lib.includes(x)), nlib: lib.length}; }, j);
  ok('MK8b-05 Speichern → Laden deep-equal', r.okI && r.snd && r.origin === 'f-mk-k512' && !r.edited && r.lib, JSON.stringify(r));
  ok('MK8b-05 Konsole', errs.length === 0 && e2.length === 0, errs.concat(e2).slice(0, 3).join(' | '));
  await c2.close();
});

await T('MK8b-04 Vocoder: Laden setzt E2 = Mikrofon und klingt', async () => {
  const b2 = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']});
  const ctx = await b2.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, permissions: ['microphone']});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await prep(page);
  const r = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms)), out = [];
    for (let s = 1; s <= 16; s++) {
      S.tracks[0].mkIn = null; mkInRoute(); const before = JSON.stringify(S.tracks[0].sound) + JSON.stringify(S.tracks[0].mkIn || null);
      const id = MKK.rec(8, s).id; openBrowser(0); SYNQUENZER.browserTap(id); closeBrowser(false); await w(250);
      const e2 = S.tracks[0].mkIn && S.tracks[0].mkIn.e2, m = S.tracks[0].sound.p.mk;
      const o = {id, e2, mode: m.mode, hold: !!m.voc.hold, dir: m.voc.dir};
      if (s <= 3 || s === 14) { SYNQUENZER.keyOn(48, .8, 'k1'); SYNQUENZER.keyOn(55, .8, 'k2'); await w(900); o.rms = +SYNQUENZER.meter().rmsDb.toFixed(1); SYNQUENZER.keyOff(48, 'k1'); SYNQUENZER.keyOff(55, 'k2'); await w(400); }
      undo(); o.undo = JSON.stringify(S.tracks[0].sound) + JSON.stringify(S.tracks[0].mkIn || null) === before; redo();
      out.push(o);
    }
    return out;
  });
  ok('MK8b-04 VOCODER: 16 Vocoder (mode 3, ohne Halten, DIREKT 0), Laden → E2 = Mikrofon', r.length === 16 && r.every(x => x.e2 === 'mic' && x.mode === 3 && !x.hold && x.dir === 0),
    r.filter(x => x.e2 !== 'mic' || x.mode !== 3 || x.hold).map(x => x.id).join(' ') || '16/16 E2 = mic');
  ok('MK8b-04 Laden + Eingang = ein Undo, Undo deep-equal', r.every(x => x.undo), r.filter(x => !x.undo).map(x => x.id).join(' ') || '16/16');
  const lv = r.filter(x => x.rms != null);
  ok('MK8b-04 mit (Fake-)Mikrofon hörbar', lv.every(x => x.rms > -40), lv.map(x => x.id.slice(5) + ' ' + x.rms + ' dBFS').join(' · '));
  ok('MK8b-04 Konsole', errs.length === 0, errs.slice(0, 3).join(' | '));
  await b2.close();
});

await T('MK8b Vorhören', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page);
  const r = await page.evaluate(async () => { openBrowser(0); const out = {};
    for (const [g, id] of [[1, 'f-mk-k103'], [1, 'f-mk-k109'], [8, 'f-mk-k802'], [2, 'f-mk-k207']]) { BR.kp = g; brRefresh(); const b = document.querySelector(`#sndSheet .brow[data-id="${id}"] .bpv`); b.click(); await new Promise(r => setTimeout(r, 900));
      out[id] = {on: PV.on, voices: PV.voices.length, notes: PV.notes.length, hold: !!(PV.sound && PV.sound.p.mk.voc.hold), rms: +SYNQUENZER.meter().rmsDb.toFixed(1)}; previewStop(); await new Promise(r => setTimeout(r, 300)); }
    const trackHold = !!S.tracks[0].sound.p.mk.voc.hold; closeBrowser(false); return {out, trackHold}; });
  const o = r.out;
  ok('MK8b ▶ Vorhören (Arp, Fläche, Vocoder mit Probe-Vokal, Drum)', Object.values(o).every(x => x.on && x.voices > 0 && x.rms > -45) && o['f-mk-k103'].notes >= 16 && o['f-mk-k802'].hold && !r.trackHold,
    Object.entries(o).map(([k, x]) => k.slice(5) + ' ' + x.voices + ' Stimmen ' + x.rms + ' dB' + (x.hold ? ' (Probe-Vokal)' : '')).join(' · '));
  ok('MK8b Vorhören Konsole', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
});

// MK8b-06 layout per format: chips, genre tabs, rows, ⋯ actions, the place pop; finger scroll; 0 px jump
const measure = page => page.evaluate(() => {
  const bad = [], vw = innerWidth, vh = innerHeight, sh = document.querySelector('#sndSheet');
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
  const cats = sh.querySelector('.brcats'), cr = cats.getBoundingClientRect();
  for (const c of cats.querySelectorAll('.chip')) { if (!vis(c)) continue; const r = c.getBoundingClientRect();
    if (r.height < 44 - .5 || r.width < 44 - .5) bad.push('Chip klein ' + c.textContent.trim() + ' ' + r.width.toFixed(0) + '×' + r.height.toFixed(0));
    for (const s of c.querySelectorAll('span')) if (vis(s) && s.scrollWidth > s.clientWidth + 1) bad.push('Chip abgeschnitten ' + s.textContent);
    if (c.scrollWidth > c.clientWidth + 1) bad.push('Chip abgeschnitten ' + c.textContent.trim()); }
  const list = sh.querySelector('.brlist'), lr = list.getBoundingClientRect();
  for (const row of list.querySelectorAll('.brow')) { const r = row.getBoundingClientRect(); if (r.bottom < lr.top || r.top > lr.bottom) continue;
    if (r.height < 44 - .5) bad.push('Zeile ' + r.height.toFixed(0));
    for (const b of row.querySelectorAll('button')) { const q = b.getBoundingClientRect(); if (q.height < 44 - .5 || q.width < 44 - .5) bad.push('Taste klein ' + (b.getAttribute('aria-label') || '').slice(0, 24) + ' ' + q.width.toFixed(0) + '×' + q.height.toFixed(0)); }
    if (r.right > vw + .5) bad.push('Zeile rechts außerhalb'); }
  for (const t of list.querySelectorAll('.bmain b, .bmain span')) { const r = t.getBoundingClientRect(); if (r.bottom < lr.top || r.top > lr.bottom) continue; if (t.scrollWidth > t.clientWidth + 1 && getComputedStyle(t).textOverflow !== 'ellipsis') bad.push('Text abgeschnitten ' + t.textContent.slice(0, 20)); }
  for (const b of list.querySelectorAll('.bacts button')) { const q = b.getBoundingClientRect(); if (q.height < 44 - .5) bad.push('Aktion klein ' + b.textContent); if (b.scrollWidth > b.clientWidth + 1) bad.push('Aktion abgeschnitten ' + b.textContent); }
  const v = list.querySelector('.mkkvoc'); if (v && v.scrollWidth > v.clientWidth + 1) bad.push('Vocoder-Hinweis läuft über');
  const shr = sh.getBoundingClientRect(); if (shr.right > vw + .5 || shr.bottom > vh + .5) bad.push('Blatt außerhalb');
  return {bad, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, sheet: [shr.top, shr.height].map(Math.round), list: [lr.top, lr.height].map(Math.round), cr: [cr.top, cr.height, cr.width].map(Math.round), vw, vh};
});
const mpop = page => page.evaluate(() => {
  const bad = [], vw = innerWidth, vh = innerHeight, p = document.querySelector('.pop.mk8w'); if (!p) return ['kein Fenster'];
  const pr = p.getBoundingClientRect(); if (pr.left < 0 || pr.top < 0 || pr.right > vw + .5 || pr.bottom > vh + .5) bad.push('Fenster außerhalb');
  const bs = [...p.querySelectorAll('button')].filter(b => !b.hidden && getComputedStyle(b).display !== 'none');
  for (const b of bs) { const r = b.getBoundingClientRect(); if (r.height < 44 - .5 || r.width < 44 - .5) bad.push('klein ' + b.textContent.trim() + ' ' + r.width.toFixed(0) + '×' + r.height.toFixed(0)); if (b.scrollWidth > b.clientWidth + 1) bad.push('abgeschnitten ' + b.textContent.trim()); }
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i].getBoundingClientRect(), c = bs[j].getBoundingClientRect(); if (a.left < c.right - .5 && c.left < a.right - .5 && a.top < c.bottom - .5 && c.top < a.bottom - .5) bad.push('überlappt ' + bs[i].textContent.trim() + '/' + bs[j].textContent.trim()); }
  const inf = p.querySelector('.mk8i'); if (inf && inf.scrollWidth > inf.clientWidth + 1) bad.push('Infozeile läuft über');
  return bad;
});
for (const f of Object.keys(FMT)) await T('MK8b-06 Layout ' + f, async () => {
  const {ctx, page, errs} = await open(f); await prep(page);
  await page.evaluate(() => openBrowser(0)); await page.waitForTimeout(400);
  const m0 = await measure(page);
  await tapSel(page, '#sndSheet .brkp'); await page.waitForTimeout(200);
  const m1 = await measure(page); await page.screenshot({path: `${SHOTS}/${f}-kompakt.png`});
  const jumps = [], probs = [...m1.bad];
  for (let g = 1; g <= 8; g++) {
    await tapSel(page, `#sndSheet .brkg[data-g="${g}"]`);
    const m = await measure(page); probs.push(...m.bad.map(x => 'G' + g + ' ' + x));
    if (m.docH !== m0.docH || m.docW !== m0.docW || m.sheet.join() !== m0.sheet.join() || m.list.join() !== m1.list.join()) jumps.push('G' + g + ' ' + JSON.stringify([m.docH, m.sheet, m.list]));
    if (g === 8) await page.screenshot({path: `${SHOTS}/${f}-vocoder.png`});
  }
  if (m1.docH !== m0.docH || m1.sheet.join() !== m0.sheet.join()) jumps.push('Kompakt an ' + JSON.stringify([m0.docH, m0.sheet, m1.docH, m1.sheet]));
  // finger scroll of the list (genre 5)
  await tapSel(page, '#sndSheet .brkg[data-g="5"]');
  const lr = await page.evaluate(() => { const l = document.querySelector('#sndSheet .brlist'); l.scrollTop = 0; const r = l.getBoundingClientRect(); return {x: r.left + r.width * .5, y0: r.top + r.height * .8, y1: r.top + r.height * .2, can: l.scrollHeight > l.clientHeight + 4}; });
  await swipe(page, lr.x, lr.y0, lr.y1);
  const st = await page.evaluate(() => ({top: document.querySelector('#sndSheet .brlist').scrollTop, pv: PV.on, origin: S.tracks[0].sound.origin}));
  // ⋯ actions and the place pop
  await page.evaluate(() => { document.querySelector('#sndSheet .brlist').scrollTop = 0; });
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k501"] .bmore');
  const ma = await measure(page); probs.push(...ma.bad.map(x => '⋯ ' + x)); await page.screenshot({path: `${SHOTS}/${f}-aktionen.png`});
  await tapSel(page, '#sndSheet .bacts [data-act="kpw"]'); await page.waitForTimeout(250);
  const pp = await mpop(page); await page.screenshot({path: `${SHOTS}/${f}-platz.png`});
  ok('MK8b-06 ' + f + ' nichts abgeschnitten, ≥ 44 px (Chips, Reiter, Zeilen, ⋯, Platzwahl)', probs.length === 0 && pp.length === 0, probs.concat(pp).slice(0, 8).join('; ') || 'alles im Bild, alle Tasten ≥ 44 px');
  ok('MK8b-06 ' + f + ' Liste per Finger scrollbar', !lr.can || (st.top > 30 && !st.pv), 'scrollTop ' + Math.round(st.top) + (lr.can ? '' : ' (Liste passt ganz)') + ', kein Vorhören/Laden durch das Wischen');
  ok('MK8b-06 ' + f + ' 0 px Layout-Sprung', jumps.length === 0, jumps.slice(0, 3).join(' ') || 'Seite ' + m0.docW + '×' + m0.docH + ', Blatt und Liste fest über Kompakt an/aus und 8 Reiter');
  ok('MK8b-06 ' + f + ' Konsole', errs.length === 0, errs.slice(0, 3).join(' | '));
  await page.evaluate(() => closePop());
  await ctx.close();
});
await browser.close();
console.log((fails ? 'FAIL' : 'PASS') + ' v3-mk8b-ui: ' + fails + ' Fehler');
