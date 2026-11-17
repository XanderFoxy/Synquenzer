// MLG2 – Klänge aus der DAW übernehmen (DAW-Projekt-Import) + „↳ EQ wie in der DAW“ (Playwright, Chromium, Touch per CDP, echter Datei-Wähler).
// Nur synthetische Testdateien (tests/mlg2-song.cbp aus gen_mlg2.mjs, eigene Werte). iPhone 12 Pro Max hochkant 428×926 und quer 926×428, Fotos DPR 2.
// Geprüft: Abschnitt „Klang“ im Import-Blatt (vorgewählt an, Tippflächen, im Bild), Wahl per Touch, „Passt“ → Synth-Spuren mit dem Klang des
// Übersetzers, Spur-EQ aus dem EQ der DAW-Spur (Spur mit Amp-Simulation ohne EQ), Projekt-Echo st 1/4. | 1/8., genau EIN ↶ (zurück zum vorigen
// Projekt), ↷ bitgleich, Speichern/Laden bitgleich; Wahl „Werksklänge“ = wie bisher (XLA); kaputte Datei → deutsche Meldung; Klang-Browser:
// „Aus DAW-Datei“ → Zeile mit „EQ“ → „↳ EQ wie in der DAW“ (eigener ↶/↷), Amp-Spur ohne Knopf; keine Fehler in der Konsole.
// Aufruf: node mlg2-test.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
const TF = f => path.join(here, 'tests', f), SONG = 'mlg2-song.cbp', KAPUTT = 'mlg2-song-kaputt.cbp', U8 = [...fs.readFileSync(TF(SONG))];
let bad = 0, good = 0; const out = [];
const ok = (c, m, d) => { const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; else good++; out.push(s); console.log(s); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(50); await tch(p, 'touchEnd'); await p.waitForTimeout(250); }
const ctr = (p, sel, k) => p.evaluate(([s, k]) => { const L = [...document.querySelectorAll(s)].filter(e => e.offsetParent); const e = L[k || 0]; if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, [sel, k]);
async function tapSel(p, sel, k) { const c = await ctr(p, sel, k); if (!c) return false; await tap(p, c.x, c.y); return true; }
const cur = p => p.evaluate(() => { const c = window.__xla.cur(); if (!c) return null; return {st: c.st, err: c.err, building: !!c.building, res: !!c.res, m: c.mlg2 ? {n: c.mlg2.n, on: c.mlg2.on} : null}; });
async function ready(p, ms) { for (let k = 0; k < (ms || 9000) / 100; k++) { await p.waitForTimeout(100); const c = await cur(p); if (c && (c.st === 'fehler' || (c.st === 'fertig' && c.res && !c.building && c.m))) return c; } return cur(p); }
const toastText = p => p.evaluate(() => EL.toast && !EL.toast.hidden ? EL.toast.textContent.trim() : '');
async function openImport(p) { await p.evaluate(() => { closePop(); va1Sheet(); }); await p.waitForTimeout(300); await tapSel(p, 'button[data-va="midiin"]'); await p.waitForTimeout(300); }
async function pick(p, f, sel) {
  const fc = p.waitForEvent('filechooser', {timeout: 5000});
  const s = sel || await p.evaluate(() => UI.pop && UI.pop.name === 'xla' ? '.xla button[data-x="pick"]' : '.imp1 button[data-i="pick"]');
  await tapSel(p, s);
  const ch = await fc.catch(() => null); if (!ch) return null;
  await ch.setFiles({name: f, mimeType: 'application/octet-stream', buffer: fs.readFileSync(TF(f))});
  return ready(p);
}
// Soll aus der Testdatei, im Seitenkontext gerechnet (Kern MLG1/MLG2): je Spurname Klang (ohne Stimmenzahl, die die CPU-Regel kürzt) + EQ
const SOLL = () => window.__soll = u => { const L = mlgCore().cbp(Uint8Array.from(u)), o = {};
  for (const x of L) { const s = mlg2Sound(x), e = mlg2Core().eqOf(x.fx); o[x.name] = {p: JSON.stringify(Object.assign({}, s.sound.p, {poly: 0})), mods: JSON.stringify(s.sound.mods), mix: e.mix, amp: e.amp, used: e.used, echo: s.echo}; }
  return o; };
const state = p => p.evaluate(u => { const so = __soll(u);
  return {id: S.id, nT: S.tracks.length, echo: Object.assign({}, S.fxBus.echo), undo: UNDO.length, last: UNDO.length ? UNDO[UNDO.length - 1].kind : null,
    tr: S.tracks.map(t => ({name: t.name, kind: t.kind, mlg: !!(so[t.name] && t.sound && JSON.stringify(Object.assign({}, t.sound.p, {poly: 0})) === so[t.name].p && JSON.stringify(t.sound.mods) === so[t.name].mods),
      mix: t.mix || null, soll: so[t.name] ? so[t.name].mix : undefined})),
    file: JSON.stringify(S.tracks.map(t => [t.sound, t.mix || null])) + JSON.stringify(S.fxBus.echo)}; }, U8);
const layout = p => p.evaluate(() => {
  const P = UI.pop && UI.pop.el; if (!P) return null; const B = [...P.querySelectorAll('button[data-x="mlg2on"], button[data-x="mlg2off"]')].filter(e => e.offsetParent);
  B[0] && B[0].scrollIntoView({block: 'center'});
  const r = B.map(e => e.getBoundingClientRect()), h5 = [...P.querySelectorAll('h5')].map(e => e.textContent);
  return {n: B.length, on: B.map(e => e.classList.contains('on')), sz: r.map(q => [Math.round(q.width), Math.round(q.height)]), inView: r.every(q => q.left >= -.5 && q.right <= innerWidth + .5 && q.top >= -.5 && q.bottom <= innerHeight + .5),
    h5, info: (B[0] && B[0].parentElement.nextElementSibling) ? B[0].parentElement.nextElementSibling.textContent : '', hscroll: document.documentElement.scrollWidth > innerWidth + 1};
});
for (const [W, H, tag] of [[428, 926, 'p'], [926, 428, 'l']]) {
  const p = await page(W, H); await p.evaluate(SOLL);
  const s0 = await state(p);
  /* 1. Import-Blatt: Abschnitt Klang */
  await openImport(p);
  let c = await pick(p, SONG);
  ok(c && c.st === 'fertig' && c.m && c.m.n === 2 && c.m.on === true, tag + ': .cbp per Touch gewählt → 2 Synth-Spuren mit lesbarem Klang, Wahl vorgewählt an', c);
  const L = await layout(p);
  ok(L && L.n === 2 && L.on[0] && !L.on[1] && L.sz.every(([w, h]) => w >= 44 && h >= 44) && L.inView && !L.hscroll && L.h5.includes('Klang'), tag + ': Abschnitt „Klang“ mit 2 Wahlknöpfen (≥ 44 px, im Bild, kein Querrollen)', L && {sz: L.sz, on: L.on, info: L.info.slice(0, 60)});
  await p.screenshot({path: path.join(fotos, 'mlg2-' + tag + '-blatt.png')});
  /* 2. Wahl per Touch umschalten */
  await tapSel(p, '.xla button[data-x="mlg2off"]'); c = await cur(p);
  ok(c.m.on === false, tag + ': Touch „Werksklänge“ → Wahl aus');
  await tapSel(p, '.xla button[data-x="mlg2on"]'); c = await cur(p);
  ok(c.m.on === true, tag + ': Touch „Klänge aus der DAW übernehmen“ → Wahl an');
  /* 3. Passt → Import mit Klängen, EQ, Echo; EIN ↶ */
  await tapSel(p, '.xla button[data-x="ok"]');
  for (let k = 0; k < 60; k++) { await p.waitForTimeout(100); if (!(await p.evaluate(() => !!window.__xla.cur()))) break; }
  await p.waitForTimeout(400);
  const s1 = await state(p), bass = s1.tr.find(t => t.name === 'Bass'), mel = s1.tr.find(t => t.name === 'Melodie');
  ok(s1.id !== s0.id && bass && mel && bass.mlg && mel.mlg, tag + ': „Passt“ (Touch) → neues Projekt, Bass und Melodie mit dem Klang des Übersetzers', {bass: bass && bass.mlg, mel: mel && mel.mlg});
  ok(bass && bass.mix && bass.soll && JSON.stringify(bass.mix) === JSON.stringify(bass.soll) && bass.mix.hp > 200 && bass.mix.hp < 450 && bass.mix.pg > 2, tag + ': Bass: Spur-EQ aus dem EQ der DAW (Low-Cut + Anhebung)', bass && bass.mix);
  ok(mel && !mel.mix, tag + ': Melodie (Amp-Simulation an): kein EQ', mel && mel.mix);
  ok(s1.echo.mode === 'st' && s1.echo.divL === '1/4.' && s1.echo.divR === '1/8.' && Math.abs(s1.echo.fb - .12) < 1e-6, tag + ': Projekt-Echo wie der Synth: st, links 1/4., rechts 1/8., 12 %', {mode: s1.echo.mode, divL: s1.echo.divL, divR: s1.echo.divR, fb: s1.echo.fb});
  ok(s1.undo === s0.undo + 1 && s1.last === 'xla', tag + ': der ganze Import ist EIN ↶-Schritt', [s0.undo, s1.undo, s1.last]);
  const tt = await toastText(p);
  ok(/DAW-Projekt geöffnet/.test(tt), tag + ': Meldung nach dem Import', tt.slice(0, 70));
  await p.screenshot({path: path.join(fotos, 'mlg2-' + tag + '-importiert.png')});
  /* 4. ↶ / ↷ */
  await p.evaluate(() => undo()); await p.waitForTimeout(700);
  const s2 = await state(p);
  ok(s2.id === s0.id && s2.file === s0.file, tag + ': ↶ → voriges Projekt unverändert zurück (Klänge, EQ, Echo)');
  await p.evaluate(() => redo()); await p.waitForTimeout(700);
  const s3 = await state(p);
  ok(s3.file === s1.file, tag + ': ↷ → Import wieder da, bitgleich (Klänge, EQ, Echo)');
  /* 5. Speichern / Laden */
  const rt = await p.evaluate(() => { const fo = JSON.parse(JSON.stringify(projectFileObj(S))), q = projFromFile(fo);
    return {same: !!q && JSON.stringify(q.tracks.map(t => [t.sound, t.mix || null])) === JSON.stringify(S.tracks.map(t => [t.sound, t.mix || null])) && JSON.stringify(q.fxBus.echo) === JSON.stringify(S.fxBus.echo)}; });
  ok(rt.same, tag + ': Speichern/Laden bitgleich (Klänge, Spur-EQ, Echo)', rt);
  /* 6. nur hochkant: Wahl „Werksklänge“ = wie bisher, kaputte Datei */
  if (tag === 'p') {
    await openImport(p); c = await pick(p, SONG);
    await tapSel(p, '.xla button[data-x="mlg2off"]');
    const xla = await p.evaluate(() => { const c = window.__xla.cur(), q = window.__xla.project(c.res, Object.assign({}, c, {mlg2: null})); return JSON.stringify(q.tracks.map(t => [t.sound, t.mix || null])) + JSON.stringify(q.fxBus.echo); });
    await tapSel(p, '.xla button[data-x="ok"]');
    for (let k = 0; k < 60; k++) { await p.waitForTimeout(100); if (!(await p.evaluate(() => !!window.__xla.cur()))) break; }
    await p.waitForTimeout(400);
    const s4 = await state(p), b4 = s4.tr.find(t => t.name === 'Bass'), same = await p.evaluate(() => JSON.stringify(S.tracks.map(t => [t.sound, t.mix || null])) + JSON.stringify(S.fxBus.echo));
    ok(b4 && !b4.mlg && !b4.mix && s4.echo.mode !== 'st' && same === xla, tag + ': Wahl „Werksklänge“ → Import wie bisher (XLA-Klang, kein Spur-EQ, Echo wie bisher)', {mlg: b4 && b4.mlg, mix: b4 && b4.mix, echo: s4.echo.mode});
    await openImport(p); c = await pick(p, KAPUTT);
    const e2 = c && c.err || '';
    ok(c && c.st === 'fehler' && /beschädigt|unvollständig|nicht lesbar/.test(e2) && !/[A-Z][a-z]+Error|undefined|Unexpected|of null/.test(e2), tag + ': kaputte Datei → deutsche Meldung, keine englische Ausnahme', e2.slice(0, 80));
    await p.evaluate(() => closePop()); await p.waitForTimeout(200);
  }
  /* 7. Klang-Browser: „Aus DAW-Datei“ → „↳ EQ wie in der DAW“ (eigener ↶) */
  const t = await p.evaluate(() => S.tracks.findIndex(t => t.kind === 'synth'));
  await p.evaluate(i => { closePop(); delete S.tracks[i].mix; R.selT = i; openBrowser(i); }, t); await p.waitForTimeout(400);   // Spur ohne EQ (der Import hat ihr schon einen gegeben)
  const fc = p.waitForEvent('filechooser', {timeout: 4000}); await tapSel(p, '#sndSheet .mlgb'); const ch = await fc.catch(() => null);
  if (ch) { await ch.setFiles(TF(SONG)); await p.waitForTimeout(600); }
  const rows = await p.evaluate(() => [...document.querySelectorAll('.mlgl button[data-k]')].filter(e => e.offsetParent).map(e => e.textContent.trim()));
  const ib = rows.findIndex(r => /Bass/.test(r)), im = rows.findIndex(r => /Melodie/.test(r));
  ok(ch && ib >= 0 && /· EQ/.test(rows[ib]) && im >= 0 && /Amp \(kein EQ\)/.test(rows[im]), tag + ': Blatt „Klang aus DAW-Datei“: Zeilen zeigen EQ bzw. Amp (kein EQ)', rows.map(r => r.slice(-28)));
  await p.screenshot({path: path.join(fotos, 'mlg2-' + tag + '-liste.png')});
  const m0 = await p.evaluate(i => JSON.stringify(S.tracks[i].mix || null), t);
  await tapSel(p, '.mlgl button[data-k]', ib); await p.waitForTimeout(400);
  const chip = await ctr(p, '#sndSheet .mlg2eq');
  ok(chip && chip.h >= 32 && chip.w >= 60, tag + ': nach dem Laden: Knopf „↳ EQ wie in der DAW“ im Klang-Browser', chip && [Math.round(chip.w), Math.round(chip.h)]);
  await p.screenshot({path: path.join(fotos, 'mlg2-' + tag + '-eqknopf.png')});
  const u0 = await p.evaluate(() => UNDO.length);
  await tapSel(p, '#sndSheet .mlg2eq'); await p.waitForTimeout(300);
  const e1 = await p.evaluate(([i, u]) => ({mix: S.tracks[i].mix || null, soll: __soll(u)['Bass'].mix, undo: UNDO.length, kind: UNDO[UNDO.length - 1].kind, hid: !document.querySelector('#sndSheet .mlg2eq') || document.querySelector('#sndSheet .mlg2eq').hidden, toast: EL.toast.textContent}), [t, U8]);
  const eqOnly = o => o ? JSON.stringify(['hp', 'ls', 'pf', 'pg', 'pq', 'hs'].map(k => o[k] == null ? null : o[k])) : null;
  ok(eqOnly(e1.mix) === eqOnly(e1.soll) && e1.undo === u0 + 1 && e1.kind === 'mixa' && e1.hid, tag + ': Touch „↳ EQ wie in der DAW“ → Spur-EQ wie in der DAW, ein eigener ↶-Schritt, Knopf weg', {mix: e1.mix, toast: e1.toast.slice(0, 60)});
  await p.evaluate(() => undo()); await p.waitForTimeout(300);
  ok((await p.evaluate(i => JSON.stringify(S.tracks[i].mix || null), t)) === m0, tag + ': ↶ nimmt nur den EQ zurück (Klang bleibt)');
  await p.evaluate(() => redo()); await p.waitForTimeout(300);
  ok(eqOnly(await p.evaluate(i => S.tracks[i].mix || null, t)) === eqOnly(e1.soll), tag + ': ↷ stellt den EQ wieder her');
  // Amp-Spur: kein Knopf
  await p.evaluate(() => { if (MLG.list) mlgSheet(); }); await p.waitForTimeout(300);
  await tapSel(p, '.mlgl button[data-k]', im); await p.waitForTimeout(400);
  ok(!(await ctr(p, '#sndSheet .mlg2eq')), tag + ': Spur mit Amp-Simulation geladen → kein „↳ EQ wie in der DAW“');
  await p.evaluate(() => closeBrowser(false));
  await p.close();
}
/* Rechenzeit: Klänge + EQ für 2 Spuren (Haken vor „Passt“) und EQ-Fit je Spur */
{
  const p = await page(428, 926); await p.evaluate(SOLL);
  const ms = await p.evaluate(u => { const L = mlgCore().cbp(Uint8Array.from(u)), t0 = performance.now(); let n = 0; for (let k = 0; k < 5; k++) for (const x of L) { mlg2Core().k = null; mlg2Core.k = null; mlg2Core().eqOf(x.fx); n++; } return (performance.now() - t0) / n; }, U8);
  ok(ms < 40, 'EQ-Nachbildung je Spur schnell genug (< 40 ms, eine Aufgabe je Spur)', Math.round(ms * 10) / 10 + ' ms');
  await p.close();
}
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 3));
console.log(good + ' OK, ' + bad + ' FEHLER');
fs.writeFileSync(path.join(here, 'mlg2-test.out'), out.join('\n') + '\n' + good + ' OK, ' + bad + ' FEHLER\n');
await b.close();
process.exit(bad ? 1 : 0);
