// G6+e – Blatt „Chor“ neu: G6P-40 (Ablauf per Touch, Undo je Geste), G6P-41 (Platz in 6 Formaten), G6P-42 (Umbenennen, Doppeltipp, Spur-Grenze),
// G6P-K1 (Kopplung Lead ↔ Chor), v1-Ansicht, Speichern → Laden, Smoke (keine Fehler).  Aufruf: node tests/g6pe.mjs [app.html]
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
import path from 'node:path';
import fs from 'node:fs';
const HERE = path.dirname(new URL(import.meta.url).pathname), APP = process.argv[2] || path.join(HERE, '..', 'index.html'), SHOTS = path.join(HERE, '..', 'shots');
fs.mkdirSync(SHOTS, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR = 48000;
// synthetischer Gesang: C4 E4 G4 A4 G4 E4 je 0,45 s, Vokal aus Obertönen, Vibrato ±25 ct
function sing() {
  const f = [261.63, 329.63, 392, 440, 392, 329.63], L = 0.45, n = Math.round((f.length * L + 0.3) * SR), y = new Int16Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, k = Math.floor((t - 0.15) / L); if (k < 0 || k >= f.length) continue; const u = t - 0.15 - k * L;
    ph += 2 * Math.PI * f[k] * Math.pow(2, 25 / 1200 * Math.sin(2 * Math.PI * 5.5 * t)) / SR; let s = 0; for (let h = 1; h <= 8; h++) s += Math.sin(h * ph) * (h === 2 || h === 3 ? .8 : 1 / h);
    y[i] = Math.round(9000 * s * Math.min(1, u / .02, (L - u) / .02)); }
  return Array.from(y);
}
const VP = {P1: [320, 568], P2: [375, 667], P3: [390, 844], L1: [568, 320], L2: [844, 390], XL: [926, 428]};
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function setup(w, h) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Supabase|net::|Failed to load|favicon/i.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await sleep(400);
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.play(); SYNQUENZER.stop(); }); await sleep(200);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), sing());
  return {ctx, p, errs, ref: {t: r.track, s: 0}, id: r.id};
}
const hitOk = async (p, e, x, y) => { const hit = await e.evaluate((n, [x, y]) => { const h = document.elementFromPoint(x, y); return h === n || n.contains(h) ? null : (h ? (h.className || h.tagName) + ':' + (h.textContent || '').slice(0, 30) : 'nichts'); }, [x, y]); if (hit) console.log('  ! Tipp trifft ' + hit); return !hit; };
const tapSel = async (p, sel) => { const e = await p.$(sel); if (!e) throw new Error('fehlt: ' + sel); await e.scrollIntoViewIfNeeded(); const q = await e.boundingBox(); await hitOk(p, e, q.x + q.width / 2, q.y + q.height / 2); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await sleep(120); };
const U = p => p.evaluate(() => SYNQUENZER.undoInfo());
const info = (p, ref) => p.evaluate(r => SYNQUENZER.g6pInfo(r), ref);
async function styleWait(p, ref, k) { await p.waitForFunction(([r, k]) => { const i = SYNQUENZER.g6pInfo(r); return i && i.chor && i.chor.style === k && !SYNQUENZER.g6peState().busy; }, [ref, k], {timeout: 30000}); await sleep(150); }
// Regler per Zeiger ziehen (ein Griff = ein Schritt)
async function drag(p, sel, frac) {
  const e = await p.$(sel); await e.scrollIntoViewIfNeeded(); const q = await e.boundingBox(), y = q.y + q.height / 2;
  const v = await e.evaluate(x => (x.value - x.min) / (x.max - x.min)); const x0 = q.x + 11 + v * (q.width - 22); await hitOk(p, e, x0, y);
  await p.mouse.move(x0, y); await p.mouse.down(); for (let k = 1; k <= 6; k++) await p.mouse.move(x0 + (q.x + 11 + frac * (q.width - 22) - x0) * k / 6, y); await p.mouse.up(); await sleep(150);
}
const layout = p => p.evaluate(() => {
  const P = document.querySelector('.pop.g6sheet'); if (!P) return {err: 'kein Blatt'};
  const pr = P.getBoundingClientRect(), bad = [], small = [], cut = [];
  for (const e of P.querySelectorAll('button, input, .g6pe-tile b, .g6pe-tile small, .g6pe-name b, output, .g6pe-sll')) {
    const q = e.getBoundingClientRect(); if (!q.width || getComputedStyle(e).visibility === 'hidden') continue;
    const name = (e.className || e.tagName) + ':' + (e.textContent || e.value || '').trim().slice(0, 24);
    if ((e.tagName === 'BUTTON' || e.tagName === 'INPUT') && (q.width < 44 - .5 || q.height < 44 - .5)) small.push(name + ' ' + Math.round(q.width) + '×' + Math.round(q.height));
    if (e.scrollWidth > e.clientWidth + 1 && e.tagName !== 'INPUT') cut.push(name + ' sw' + e.scrollWidth + '>cw' + e.clientWidth);
    if (getComputedStyle(e).textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth) cut.push(name + ' …');
    if (q.left < pr.left - .5 || q.right > pr.right + .5) bad.push(name + ' außerhalb des Blatts');
  }
  const tiles = [...P.querySelectorAll('.g6pe-tile')].map(t => t.getBoundingClientRect()), cols = new Set(tiles.map(t => Math.round(t.left))).size, rows = new Set(tiles.map(t => Math.round(t.top))).size;
  const de = document.scrollingElement;
  return {bad, small, cut, cols, rows, tileH: Math.min(...tiles.map(t => t.height)), popIn: pr.left >= 0 && pr.right <= innerWidth + .5 && pr.top >= 0 && pr.bottom <= innerHeight + .5,
    pageX: de.scrollWidth > innerWidth + 1, pageY: de.scrollHeight > innerHeight + 1, lanesScroll: (() => { const l = P.querySelector('.g6pe-lanes'); return l ? getComputedStyle(l).overflowY : null; })()};
});

/* ---------- G6P-40: Ablauf per Touch wie Xander (P2 375 × 667) ---------- */
{
  const {ctx, p, errs, ref} = await setup(375, 667);
  await p.evaluate(r => SYNQUENZER.tkSheet(r), ref); await sleep(250);
  await tapSel(p, '.pop button[data-a="g6"]'); await sleep(250);
  ok(await p.evaluate(() => !!document.querySelector('.pop.g6sheet .g6pe-grid')), 'G6P-40: Takes-Blatt → [Chor] öffnet das Blatt mit Stil-Raster');
  const u0 = (await U(p)).n;
  const tile0 = await (await p.$('.g6pe-tile[data-sty="gospel"]')).boundingBox();
  await tapSel(p, '.g6pe-tile[data-sty="gospel"]');
  const tileB = await p.evaluate(() => { const t = document.querySelector('.g6pe-tile[data-sty="gospel"]'); return t ? {busy: t.classList.contains('busy'), h: t.getBoundingClientRect().height} : null; });
  await styleWait(p, ref, 'gospel');
  ok(tileB && Math.abs(tileB.h - tile0.height) < .5, 'G6P-41: kein Layout-Sprung beim Rechnen (Kachel ' + tile0.height + ' → ' + (tileB && tileB.h) + ' px, Ring: ' + (tileB && tileB.busy) + ')');
  let I = await info(p, ref);
  const names = I.lanes.lanes.map(l => l.name);
  ok(JSON.stringify(names) === JSON.stringify(['Chor Sopran', 'Chor Alt', 'Chor Tenor']), 'G6P-40: [Gospel] → Spuren ' + JSON.stringify(names));
  const rows = await p.evaluate(() => [...document.querySelectorAll('.g6pe-lane')].map(r => ({n: r.querySelector('.g6pe-name b').textContent, cc: getComputedStyle(r.querySelector('.g6pe-chip')).backgroundColor, z: r.querySelector('.g6pe-chip').textContent})));
  ok(rows.length === 3 && rows.every(r => r.cc && r.cc !== 'rgba(0, 0, 0, 0)'), 'G6P-40: 3 Spur-Zeilen mit Farbfeld ' + JSON.stringify(rows));
  ok(I.chor.v === 2 && I.chor.grp.below === 6 && I.chor.voices.length === 3 && I.chor.voices[0].pan === -0.45, 'G6P-40: Daten v2 laut Stil (Abstand 6, Pan Sopran −0,45)');
  let u = await U(p); ok(u.n === u0 + 1 && u.top.kind === 'group' && u.top.items.includes('chorlanes'), 'G6P-40: Stil-Tipp = 1 Undo-Schritt inkl. chorlanes ' + JSON.stringify(u.top));
  await p.screenshot({path: SHOTS + '/g6pe-P2-gospel.png'});
  const step = async (label, fn, check) => { const a = (await U(p)).n; await fn(); const b = await U(p); ok(b.n === a + 1, 'G6P-40: ' + label + ' = 1 Undo-Schritt (' + (b.top && b.top.label) + ')' + (check ? ' · ' + (await check()) : '')); };
  // Solo (Laufzeit, kein Undo)
  { const a = (await U(p)).n; await tapSel(p, '.g6pe-lane[data-lane="c2"] [data-solo]'); const s = await p.evaluate(() => SYNQUENZER.g6Info().solo); ok(s === 1 && (await U(p)).n === a, 'G6P-40: [S] Solo Spur 2 (Laufzeit, kein Undo) solo=' + s);
    await tapSel(p, '.g6pe-lane[data-lane="c2"] [data-solo]'); ok((await p.evaluate(() => SYNQUENZER.g6Info().solo)) === null, 'G6P-40: Solo wieder aus'); }
  await step('[M] Stumm Spur 1', () => tapSel(p, '.g6pe-lane[data-lane="c1"] [data-pe="mute"]'), async () => 'Faktor Stimme 1 = ' + (await p.evaluate(r => SYNQUENZER.g6peMul(r, 0), ref)) + ', Stimme 2 = ' + (await p.evaluate(r => SYNQUENZER.g6peMul(r, 1), ref)));
  ok((await p.evaluate(r => SYNQUENZER.g6peMul(r, 0), ref)) === 0 && (await p.evaluate(r => SYNQUENZER.g6peMul(r, 1), ref)) === 1, 'G6P-40: Stumm wirkt nur auf Spur 1');
  await p.evaluate(() => SYNQUENZER.undo()); ok((await p.evaluate(r => SYNQUENZER.g6peMul(r, 0), ref)) === 1, 'G6P-40: ↶ Stumm → Spur 1 klingt wieder');
  await step('Pegel Spur 2 ziehen', () => drag(p, '.g6pe-lane[data-lane="c2"] input[data-sl="db"]', .2), async () => 'db = ' + (await info(p, ref)).chor.voices[1].db);
  ok((await info(p, ref)).chor.voices[1].db < -10, 'G6P-40: Pegel Spur 2 gesenkt');
  await step('Pan Spur 3 ziehen', () => drag(p, '.g6pe-lane[data-lane="c3"] input[data-sl="pan"]', .9), async () => 'pan = ' + (await info(p, ref)).chor.voices[2].pan);
  await step('Regler „Chor“ (Abstand)', () => drag(p, 'input[data-sl="below"]', .1), async () => 'below = ' + (await info(p, ref)).chor.grp.below);
  await step('Hall', () => drag(p, 'input[data-sl="rev"]', .9), async () => 'rev = ' + (await info(p, ref)).chor.grp.rev);
  await step('Echo', () => drag(p, 'input[data-sl="dly"]', .4), async () => 'dly = ' + (await info(p, ref)).chor.grp.dly);
  await tapSel(p, '[data-pe="kl"]'); ok(await p.evaluate(() => !!document.querySelector('.g6pe-kl')), 'G6P-40: [Klang ▸] klappt auf (kein Undo)');
  await step('Tiefschnitt', () => drag(p, 'input[data-sl="hp"]', .5), async () => 'hp = ' + (await info(p, ref)).chor.grp.hp);
  await step('Zischlaute [weg]', () => tapSel(p, '[data-sib="-60"]'), async () => 'sib = ' + (await info(p, ref)).chor.grp.sib);
  await step('Hall-Vorverzögerung 1/16', () => tapSel(p, '[data-pre="1/16"]'));
  await p.screenshot({path: SHOTS + '/g6pe-P2-klang.png'});
  await tapSel(p, '[data-pe="kl"]');
  await tapSel(p, '.g6pe-lane[data-lane="c1"] [data-pe="dot"]');
  await step('[⋯] Doppel 4', () => tapSel(p, '.g6pe-lane[data-lane="c1"] [data-dbl="4"]'), async () => 'dbl = ' + (await info(p, ref)).chor.voices[0].dbl.length);
  await step('[⋯] Breite', () => drag(p, '.g6pe-lane[data-lane="c1"] input[data-sl="w"]', .8));
  await p.screenshot({path: SHOTS + '/g6pe-P2-dot.png'});
  // ↶ alles zurück bis zum Stil, dann ↷
  const want = (await info(p, ref)).chor; let n = 0; while ((await U(p)).n > u0 + 1 && n++ < 30) await p.evaluate(() => SYNQUENZER.undo());
  I = await info(p, ref); ok(I.chor.grp.below === 6 && I.chor.voices[0].dbl.length === 3, 'G6P-40: ↶ bis zum Stil → Gospel-Werte zurück');
  for (let k = 0; k < n; k++) await p.evaluate(() => SYNQUENZER.redo());
  ok(JSON.stringify((await info(p, ref)).chor) === JSON.stringify(want), 'G6P-40: ↷ alle Schritte → deep-equal');
  /* G6P-K1: Kopplung */
  const base = await p.evaluate(() => SYNQUENZER.g6peLeadDb());
  await p.evaluate(() => SYNQUENZER.g6peLeadVol(0.5)); const ld = await p.evaluate(() => SYNQUENZER.g6peLeadDb());
  ok((await p.evaluate(r => SYNQUENZER.g6peMul(r, 1), ref)) === 1, 'G6P-K1: gekoppelt (Standard AN) → Chor geht mit dem Lead-Regler (' + (ld - base).toFixed(1) + ' dB, kein Ausgleich)');
  await step('[Gekoppelt] aus', () => tapSel(p, '[data-pe="cpl"]'));
  await p.evaluate(v => SYNQUENZER.g6peLeadVol(v), 0.5 * Math.pow(10, -6 / 40));   // Lead −6 dB
  const mu = await p.evaluate(r => SYNQUENZER.g6peMul(r, 1), ref), muDb = 20 * Math.log10(mu);
  ok(Math.abs(muDb - 6) < 0.1, 'G6P-K1: Kopplung aus, Lead −6 dB → Chor-Ausgleich +' + muDb.toFixed(2) + ' dB (Chor unverändert)');
  const bl = (await info(p, ref)).chor.grp.below;
  await step('[Gekoppelt] wieder an', () => tapSel(p, '[data-pe="cpl"]'));
  I = await info(p, ref);
  ok((await p.evaluate(r => SYNQUENZER.g6peMul(r, 1), ref)) === 1 && Math.abs(I.chor.grp.below - (bl - 6)) < 0.11, 'G6P-K1: wieder an → Abstand bleibt (below ' + bl + ' → ' + I.chor.grp.below + ')');
  /* G6P-42: Umbenennen, Doppeltipp */
  await tapSel(p, '.g6pe-lane[data-lane="c3"] [data-pe="ren"]');
  await p.keyboard.press('Control+A'); await p.keyboard.type('Tenor hoch und weit weg vom Rest'); await p.keyboard.press('Enter'); await sleep(200);
  I = await info(p, ref); const nm = I.lanes.lanes.find(l => l.id === 'c3').name;
  ok(nm === 'Tenor hoch und weit weg ' || nm.length <= 24 && /^Tenor hoch/.test(nm), 'G6P-42: Umbenennen per Tastatur, ≤ 24 Zeichen: „' + nm + '“');
  const a2 = (await U(p)).n; const sle = await p.$('.g6pe-lane[data-lane="c2"] input[data-sl="db"]'); await sle.scrollIntoViewIfNeeded(); await sleep(100); const sl = await sle.boundingBox(); await hitOk(p, sle, sl.x + 15, sl.y + sl.height / 2);
  await p.touchscreen.tap(sl.x + 15, sl.y + sl.height / 2); await sleep(60); await p.touchscreen.tap(sl.x + 15, sl.y + sl.height / 2); await sleep(400);
  I = await info(p, ref); const b2 = await U(p);
  ok(I.chor.voices[1].db === 0 && b2.n === a2 + 1, 'G6P-42: Doppeltipp auf Pegel → Stil-Wert 0 dB, ein Schritt (Δundo ' + (b2.n - a2) + ', ' + b2.top.label + ')');
  /* [+ Stimme], Spur-Grenze */
  await tapSel(p, '[data-pe="add"]'); ok(await p.evaluate(() => document.querySelector('[data-addr="ch+1"]').disabled), 'G6P-40: [+ Stimme] – vorhandene Rolle grau');
  await tapSel(p, '[data-addr="oct+1"]'); await p.waitForFunction(r => SYNQUENZER.g6pInfo(r).chor.voices.length === 4, ref, {timeout: 20000});
  I = await info(p, ref); ok(I.lanes.lanes.some(l => l.name === 'Chor Oktave oben'), 'G6P-40: + Oktave oben → neue Spur „Chor Oktave oben“');
  /* Stimme löschen → graue Spur → [Spur löschen] */
  await tapSel(p, '.g6pe-lane[data-lane="c4"] [data-pe="dot"]'); await tapSel(p, '.g6pe-lane[data-lane="c4"] [data-pe="vdel"]');
  ok(await p.evaluate(() => !!document.querySelector('.g6pe-lane.grey[data-lane="c4"]')), 'G6P-42: Stimme gelöscht → Spur grau „nicht benutzt“');
  await tapSel(p, '.g6pe-lane[data-lane="c4"] [data-pe="dot"]');
  const a3 = (await U(p)).n; await tapSel(p, '.g6pe-lane[data-lane="c4"] [data-pe="ldel"]');
  ok((await U(p)).n === a3 + 1 && !(await info(p, ref)).lanes.lanes.some(l => l.id === 'c4'), 'G6P-42: [Spur löschen] auf grauer Spur = 1 Undo-Schritt');
  /* Speichern → Laden deep-equal */
  const before = await p.evaluate(() => ({chor: SYNQUENZER.g6pInfo().chor, lanes: SYNQUENZER.g6pInfo().lanes}));
  await p.evaluate(() => SYNQUENZER.g6peRoundtrip()); await sleep(400);
  const after = await p.evaluate(() => ({chor: SYNQUENZER.g6pInfo({t: SYNQUENZER.tkInfo().stimme, s: 0}).chor, lanes: SYNQUENZER.g6pInfo({t: SYNQUENZER.tkInfo().stimme, s: 0}).lanes}));
  ok(JSON.stringify(before) === JSON.stringify(after), 'M-SAVE: Speichern → Laden deep-equal (Chor v2 + Chor-Spuren)');
  ok(!errs.length, 'Smoke: keine Fehler ' + JSON.stringify(errs.slice(0, 3)));
  await ctx.close();
}
/* ---------- v1-Ansicht „Fassung 4.25“ + [Auf Chor-Gruppe umstellen] ---------- */
{
  const {ctx, p, errs, ref} = await setup(390, 844);
  await p.evaluate(r => SYNQUENZER.g6Make(r, 'terz', 'up', '80'), ref); await sleep(200);
  const v1 = (await info(p, ref)).chor;
  await p.evaluate(r => SYNQUENZER.g6Sheet(r), ref); await sleep(250);
  ok(await p.evaluate(() => /Fassung 4\.25/.test(document.querySelector('.pop.g6sheet').textContent) && !!document.querySelector('.g6rec')), 'v1: Blatt zeigt „Chor (Fassung 4.25)“ mit den alten Knöpfen');
  await p.screenshot({path: SHOTS + '/g6pe-P3-v1.png'});
  await tapSel(p, '[data-pe="conv"]'); let I = await info(p, ref);
  ok(I.chor.v === 2 && I.chor.voices.length === 1 && I.lanes.lanes[0].name === 'Chor Terz oben', 'v1 → [Auf Chor-Gruppe umstellen] → v2, Spur „Chor Terz oben“');
  await p.evaluate(() => SYNQUENZER.undo()); I = await info(p, ref);
  ok(JSON.stringify(I.chor) === JSON.stringify(v1) && !I.lanes, 'v1: ↶ → v1-Daten deep-equal, keine Chor-Spuren');
  ok(!errs.length, 'Smoke v1: keine Fehler ' + JSON.stringify(errs.slice(0, 3)));
  await ctx.close();
}
/* ---------- G6P-41: Platz in 6 Formaten ---------- */
for (const [name, [w, h]] of Object.entries(VP)) {
  const {ctx, p, errs, ref} = await setup(w, h);
  await p.evaluate(r => SYNQUENZER.g6Sheet(r), ref); await sleep(250);
  let L = await layout(p);
  const land = w > h;
  ok(L.cols === (land ? 4 : 2) && L.rows === (land ? 2 : 4) && L.tileH >= 52, `G6P-41 ${name}: Kacheln ${L.cols} × ${L.rows}, Höhe ${L.tileH}`);
  ok(!L.cut.length && !L.small.length && !L.bad.length, `G6P-41 ${name}: leeres Blatt – nichts abgeschnitten/zu klein ` + JSON.stringify([L.cut, L.small, L.bad]));
  await p.screenshot({path: SHOTS + `/g6pe-${name}-leer.png`});
  await p.evaluate(r => SYNQUENZER.g6pStyle(r, 'gospel'), ref); await sleep(250);
  await p.evaluate(r => SYNQUENZER.g6pStyle(r, 'gospel'), ref);
  await styleWait(p, ref, 'gospel');
  for (const [k, sel] of [['mix', null], ['dot', '.g6pe-lane[data-lane="c1"] [data-pe="dot"]'], ['klang', '[data-pe="kl"]']]) {
    if (sel) await tapSel(p, sel);
    L = await layout(p);
    ok(!L.cut.length && !L.small.length && !L.bad.length && L.popIn && !L.pageX && !L.pageY && L.lanesScroll === 'auto', `G6P-41 ${name} ${k}: Treffer ≥ 44, nichts abgeschnitten, Blatt im Bild, keine Seiten-Überbreite, Spur-Liste scrollt innen ` +
      (L.cut.length || L.small.length || L.bad.length || !L.popIn || L.pageX || L.pageY ? JSON.stringify(L) : ''));
    await p.screenshot({path: SHOTS + `/g6pe-${name}-${k}.png`});
  }
  ok(!errs.length, `Smoke ${name}: keine Fehler ` + JSON.stringify(errs.slice(0, 3)));
  await ctx.close();
}
await br.close();
console.log(fail ? `\n${fail} FEHLER` : '\nalle grün');
process.exit(fail ? 1 : 0);
