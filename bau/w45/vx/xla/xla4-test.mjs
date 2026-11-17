// XLA Prüfung 2: Hilfe-Karte „Transponieren – so funktioniert's“ im DAW-Projekt (⇅½). Playwright, Touch per CDP,
// iPhone 12 Pro Max hochkant 428×926 und quer 926×428. Nur synthetische .cbp (Kopien aus vx/cbpimp/tests).
//  C1 erstes TRANSPONIEREN (Touch) im Halbton-Projekt: Karte sagt, was die Tasten tun (Original-Taste, kürzester Weg, Akkord, ⇅-Spuren),
//     nicht „Taste leuchtet = Stufe“; Karte im Rasterbereich, nie über den Tasten, nichts abgeschnitten, ohne Rollen; „Verstanden“ (Touch) schließt
//  C2 „? So funktioniert's“ im Harmonie-Modus (Touch) zeigt dieselbe Karte · C3 Oktave „absolut“: „Eine Taste höher = einen Halbton höher“
//  C4 alle Spuren auf ⇅ folgt / normales Projekt: Text genau wie 4.78.0 · Konsole
// Aufruf: node xla4-test.mjs <index.html> <basis.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), basis = path.resolve(process.argv[3] || ''), here = path.dirname(new URL(import.meta.url).pathname);
const TF = f => path.join(here, 'tests', f);
let bad = 0, good = 0; const out = [], t0 = Date.now();
const ok = (c, m, d) => { const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; else good++; out.push(s); console.log(s); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push((f ? 'basis: ' : '') + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push((f ? 'basis: ' : '') + m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y, hold) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(hold || 50); await tch(p, 'touchEnd'); await p.waitForTimeout(250); }
const ctr = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
async function tapSel(p, sel, hold) { const c = await ctr(p, sel); if (!c) return false; await tap(p, c.x, c.y, hold); return true; }
async function importHt(p) {
  await p.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 900)); closePop(); va1Sheet(); }); await p.waitForTimeout(300);
  await tapSel(p, 'button[data-va="midiin"]'); await p.waitForTimeout(300);
  const fc = p.waitForEvent('filechooser', {timeout: 5000}); await tapSel(p, '.imp1 button[data-i="pick"]');
  const ch = await fc; await ch.setFiles({name: 'synth-song.cbp', mimeType: 'application/octet-stream', buffer: fs.readFileSync(TF('synth-song.cbp'))});
  for (let k = 0; k < 80; k++) { await p.waitForTimeout(100); const r = await p.evaluate(() => { const c = window.__xla.cur(); return !!(c && c.res && !c.building); }); if (r) break; }
  await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1600);
  await p.evaluate(async () => { setSongView(false); await new Promise(r => setTimeout(r, 300)); });
}
// Karte: Text, Lage gegen Raster und Tastatur, abgeschnitten?
const card = p => p.evaluate(() => {
  const c = EL.coach, vis = !!c && !c.hidden && c.offsetParent !== null; if (!vis) return {vis};
  const r = c.getBoundingClientRect(), bd = c.querySelector('.cbody'), btn = c.querySelector('#coachOk'), br = btn.getBoundingClientRect();
  const kb = [...document.querySelectorAll('#kb, #keys, .kb, #keyboard')].find(e => e.offsetParent), kr = kb ? kb.getBoundingClientRect() : null;
  const keyTop = Math.min(...[...KB.byNote.values()].map(x => x.el.getBoundingClientRect()).filter(q => q.width > 6 && q.height > 6).map(q => q.top));
  return {vis, txt: [...c.querySelectorAll('.cbody p')].map(x => x.textContent), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right),
    keyTop: Math.round(keyTop), scroll: bd.scrollHeight - bd.clientHeight, btnH: Math.round(br.height), btnIn: br.bottom <= r.bottom + .5 && br.top >= r.top - .5 && br.bottom <= innerHeight,
    inView: r.left >= -.5 && r.right <= innerWidth + .5 && r.top >= -.5, hscroll: document.documentElement.scrollWidth > innerWidth + 1};
});
const BASE_TXT = ['Jeder Clip kennt seine Tonart – automatisch erkannt (z. B. a-Moll).', 'Taste leuchtet = Stufe in der Tonart: alles bleibt in der Tonart (wie OP-Z).',
  'Dunkle Taste = neue Tonart: alles wird verschoben.', 'Akkord = alle Spuren folgen dem Akkord (wie Improvisor).'];

for (const [w, h, tag] of [[428, 926, 'hochkant 428×926'], [926, 428, 'quer 926×428']]) {
  const p = await page(w, h);
  await importHt(p);
  const st = await p.evaluate(() => ({ht: S.xlaHt, xs: S.tracks.filter(t => t.xs === 1).length, coached: !!(S.settings.coach.trans || uiPrefs().coachTrans), mode: R.kbMode}));
  // C1: erstes TRANSPONIEREN per Touch
  await tapSel(p, '#segTr'); await p.waitForTimeout(500);
  const c1 = await card(p);
  const T = (c1.txt || []).join(' | ');
  ok(st.ht === 1 && st.xs >= 4 && !st.coached && c1.vis, `C1 ${tag}: Halbton-Projekt, erstes TRANSPONIEREN (Touch) öffnet die Hilfe-Karte`, {st, vis: c1.vis});
  ok(/Im DAW-Projekt \(⇅½\)/.test(T) && /Taste C = Original \(C-Dur\)/.test(T) && /kürzesten Weg \(höchstens 6 Halbtöne\)/.test(T) && /Grundton des Akkords/.test(T) && /⇅ \(ohne ½\) folgen/.test(T) && !/Taste leuchtet|Dunkle Taste/.test(T),
    `C1 ${tag}: Karte sagt, was die Tasten im DAW-Projekt tun (nicht „Taste leuchtet = Stufe“)`, T);
  ok(c1.inView && !c1.hscroll && c1.bottom <= c1.keyTop + .5 && c1.scroll <= 1 && c1.btnIn && c1.btnH >= 40,
    `C1 ${tag}: Karte im Rasterbereich, nie über den Tasten, Text ganz sichtbar (ohne Rollen), „Verstanden“ sichtbar`, {top: c1.top, bottom: c1.bottom, keyTop: c1.keyTop, scroll: c1.scroll, btnH: c1.btnH, lr: [c1.left, c1.right]});
  if (tag.startsWith('quer')) await p.screenshot({path: path.join(here, 'fotos', 'xla4-l-hilfe.png')});
  await tapSel(p, '#coachOk'); await p.waitForTimeout(400);
  const gone = await p.evaluate(() => ({hidden: EL.coach.hidden, pref: !!uiPrefs().coachTrans, mode: R.kbMode}));
  ok(gone.hidden && gone.pref && gone.mode === 'transpose', `C1 ${tag}: „Verstanden“ (Touch) schließt die Karte, TRANSPONIEREN bleibt`, gone);
  // C2: „? So funktioniert's“ im Harmonie-Modus (Touch)
  for (let k = 0; k < 80; k++) { if (await p.evaluate(() => { const q = EL.bHMode.getBoundingClientRect(), t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return !!t && (t === EL.bHMode || EL.bHMode.contains(t)); })) break; await p.waitForTimeout(100); }   // die Meldung nach „Passt“ liegt hochkant kurz über der Taste
  await tapSel(p, '#bHMode'); await p.waitForTimeout(400);
  const hasBtn = await p.evaluate(() => !!(UI.pop && UI.pop.el && UI.pop.el.querySelector('[data-coach]')));
  await tapSel(p, '.opt[data-coach]'); await p.waitForTimeout(400);
  const c2 = await card(p);
  ok(hasBtn && c2.vis && JSON.stringify(c2.txt) === JSON.stringify(c1.txt), `C2 ${tag}: Harmonie-Modus › „? So funktioniert's“ (Touch) zeigt dieselbe Karte`, {hasBtn, vis: c2.vis});
  await tapSel(p, '#coachOk'); await p.waitForTimeout(300);
  if (tag.startsWith('hoch')) {
    // C3: Oktave „absolut“
    const c3 = await p.evaluate(async () => { S.settings.harmony.octaveMode = 'absolute'; syncTransposer(); showCoach(); await new Promise(r => setTimeout(r, 150)); const t = [...EL.coach.querySelectorAll('.cbody p')].map(x => x.textContent); hideCoach(); S.settings.harmony.octaveMode = 'nearest'; syncTransposer(); return t; });
    ok(/Taste C = Original \(C-Dur\)\. Eine Taste höher = einen Halbton höher\./.test(c3.join(' ')) && !/kürzesten Weg/.test(c3.join(' ')), 'C3 Oktave „absolut“: „Taste C = Original (C-Dur). Eine Taste höher = einen Halbton höher.“', c3[1]);
    // C4a: alle ⇅½-Spuren auf ⇅ folgt getippt → kein Halbton mehr in Kraft → Text wie bisher
    const c4 = await p.evaluate(async () => {
      for (let i = 0; i < S.tracks.length; i++) if (S.tracks[i].xs === 1) { window.__xla.folgtTap(i); window.__xla.folgtTap(i); }
      const left = S.tracks.filter(t => t.xs === 1).length; showCoach(); await new Promise(r => setTimeout(r, 150));
      const t = [...EL.coach.querySelectorAll('.cbody p')].map(x => x.textContent); hideCoach(); return {left, t};
    });
    ok(c4.left === 0 && JSON.stringify(c4.t) === JSON.stringify(BASE_TXT), 'C4 keine ⇅½-Spur mehr (alle per Tippen auf ⇅ folgt): Karte wieder genau wie 4.78.0', c4);
  }
  await p.evaluate(() => SYNQUENZER.stop()); await p.close();
}
// C4b: normales Projekt – Karte genau wie 4.78.0 (beide Seiten, Touch)
const txtOf = async f => { const p = await page(428, 926, f); await p.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 600)); closePop(); }); await tapSel(p, '#segTr'); await p.waitForTimeout(500); const c = await card(p); await p.close(); return c; };
const nN = await txtOf(null), nB = basis ? await txtOf(basis) : null;
ok(nN.vis && nB && nB.vis && JSON.stringify(nN.txt) === JSON.stringify(nB.txt) && JSON.stringify(nN.txt) === JSON.stringify(BASE_TXT) && nN.top === nB.top && nN.bottom === nB.bottom,
  'C4 normales Projekt: Hilfe-Karte (Touch) Text und Lage genau wie 4.78.0', {neu: [nN.top, nN.bottom], basis: nB && [nB.top, nB.bottom]});
ok(errs.length === 0, 'Konsole ohne Fehler (neu und 4.78.0)', errs.slice(0, 4));
await b.close();
const sum = `\n${good} OK, ${bad} FEHLER · ${Math.round((Date.now() - t0) / 1000)} s`;
console.log(sum); fs.writeFileSync(path.join(here, 'xla4-test.out'), out.join('\n') + sum + '\n');
process.exit(bad ? 1 : 0);
