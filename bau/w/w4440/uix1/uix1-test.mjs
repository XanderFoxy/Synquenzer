// UIX1 – gezielter Test: FANG-Teil-Namen (Blatt „Teil überarbeitet“), Mithören-Schalter, ✕ in Popups, iOS-Tastatur (visualViewport-Simulation)
// node uix1-test.mjs <index.html>   → Fotos in diesem Ordner (uix1-*.png)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const FILE = path.resolve(process.argv[2]), DIR = path.dirname(new URL(import.meta.url).pathname);
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond, info}); console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const b = await chromium.launch();
const page = async (w, h) => {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  p._errs = []; p.on('pageerror', e => p._errs.push(String(e).slice(0, 200)));
  await p.goto('file://' + FILE); await p.waitForTimeout(1200); return p;
};
const ev = (p, code) => p.evaluate(`(async () => { ${code} })()`);
const wait = ms => new Promise(r => setTimeout(r, ms));
// a real pass of a running part, then FANG (s1Fang) → Blatt „Teil überarbeitet“
const S1OPEN = `const A = SYNQUENZER; if (!R.playing) { A.play(); A.launchScene(0); await new Promise(r=>setTimeout(r,1200)); }
  if (!S.parts || !S.parts[0]) { A.partFromNow(0,'Strophe'); closePop(); }
  A.launchPart(0); const L = partLen(S.parts[0]); await new Promise(r=>setTimeout(r, (L*2+1.5) * 4 * 60000/S.bpm));
  const r = A.s1Fang({}); await new Promise(r=>setTimeout(r,250)); return !!r && UI.pop && UI.pop.name === 's1';`;
const inView = `(sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth; }`;

// ---------- 1 · FANG im Songteil: Namen im Blatt „Teil überarbeitet“ ----------
{
  const p = await page(428, 926);
  ok('S1 Blatt offen (echter Durchlauf + FANG)', await ev(p, S1OPEN));
  const row = await ev(p, 'return SYNQUENZER.ux1S1Row()');
  ok('S1 Namenszeile: Intro … Outro + ✎ frei', JSON.stringify(row) === JSON.stringify(['Intro', 'Strophe ▾', 'Pre', 'Refrain', 'Bridge', 'Break', 'Outro', '✎ frei']), row);
  ok('S1 alle Namen ohne Wischen sichtbar', await ev(p, `const f = ${inView}; return [...document.querySelectorAll('.ux1-s1 button')].every((b, i) => { b.id = 'u' + i; return f('#u' + i); })`));
  ok('S1 Tasten ≥ 44 px Höhe? (Chips 40 px wie im Blatt „Teil gefangen“)', await ev(p, `return [...document.querySelectorAll('.ux1-s1 button')].every(b => b.getBoundingClientRect().height >= 40)`));
  await p.screenshot({path: path.join(DIR, 'uix1-1-fang-teil-428x926.png')});
  // ein Tipp auf „Refrain“ = neuer Teil „Refrain“ (ein Undo)
  const n0 = await ev(p, 'return S.parts.filter(Boolean).length');
  await p.tap('.ux1-s1 button[data-n="Refrain"]'); await wait(250);
  const after = await ev(p, `return {n: S.parts.filter(Boolean).length, names: S.parts.filter(Boolean).map(x => x.name), pop: UI.pop && UI.pop.name, mel: !!(S.parts.find(x => x && x.name === 'Refrain') || {}).lanes}`);
  ok('Tipp „Refrain“ → neuer Teil Refrain, Blatt zu', after.n === n0 + 1 && after.names.includes('Refrain') && !after.pop, after);
  await ev(p, 'undo(); return true'); await wait(100);
  ok('↶ nimmt den neuen Teil zurück', !(await ev(p, `return S.parts.some(x => x && x.name === 'Refrain')`)));
  // vergebener Name → zweite Ebene → ⟳ ersetzen (= Teil ersetzen)
  ok('S1 wieder offen', await ev(p, S1OPEN));
  const before = await ev(p, 'return JSON.stringify(S.parts[0])');
  await p.tap('.ux1-s1 button[data-n="Strophe"]'); await wait(200);
  const lvl2 = await ev(p, 'return SYNQUENZER.ux1S1Row()');
  ok('Strophe ▾ → zweite Ebene', JSON.stringify(lvl2) === JSON.stringify(['＋ Strophe 2', '⟳ Strophe ersetzen', '‹']), lvl2);
  ok('zweite Ebene: Blatt unten angelegt', await ev(p, `const r = UI.pop.el.getBoundingClientRect(); return Math.abs(r.bottom - innerHeight) < 1.5`));
  await p.tap('.ux1-s1 button[data-u="rep"]'); await wait(250);
  const rep = await ev(p, `return {name: S.parts[0].name, n: S.parts.filter(Boolean).length, pop: UI.pop && UI.pop.name, lab: UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label}`);
  ok('⟳ Strophe ersetzen → Teil 1 neue Fassung (ein Undo)', rep.name === 'Strophe' && !rep.pop && /neue Fassung/.test(rep.lab || ''), rep);
  await ev(p, 'undo(); return true');
  ok('↶ stellt die alte Strophe her', (await ev(p, 'return JSON.stringify(S.parts[0])')) === before);
  // ✎ frei → eigener Name
  ok('S1 wieder offen (2)', await ev(p, S1OPEN));
  await p.tap('.ux1-s1 button[data-u="ed"]'); await wait(150);
  await p.fill('.ux1-s1 .ux1-in', 'Hook'); await p.tap('.ux1-s1 button[data-u="ok"]'); await wait(250);
  ok('✎ frei → Teil „Hook“', await ev(p, `return S.parts.some(x => x && x.name === 'Hook') && !UI.pop`));
  // „Teil gefangen“ (ohne laufenden Teil) unverändert: Namen-Chips + ✎ wie vorher
  await ev(p, `SYNQUENZER.stop(); return true`); await wait(200);
  ok('FANG-TEIL-Blatt hat weiter seine Namenszeile', await ev(p, `const A = SYNQUENZER; A.play(); A.launchScene(1); await new Promise(r=>setTimeout(r,2600)); A.fangTeil({}); await new Promise(r=>setTimeout(r,200)); return UI.pop && UI.pop.name === 'fang' && document.querySelectorAll('.fsheet .fs-nm .cp-c').length === 8 && !document.querySelector('.fsheet .ux1-s1')`));
  ok('keine Seitenfehler (FANG)', !p._errs.length, p._errs);
  await p.close();
}
// ---------- 2 · Mithören beim Wischen: hochkant kein runder Knopf, Schalter im Schleife-Blatt ----------
{
  const p = await page(428, 926);
  await ev(p, `SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2},{scene:2,bars:2}]); setSongView(true); return true`); await wait(300);
  ok('hochkant: kein runder Lautsprecher im Song-Fenster', await ev(p, `const f = document.querySelector('.sv-scrfab'); return !f || getComputedStyle(f).display === 'none'`));
  await p.tap('.sv-top > .sv-loop'); await wait(250);
  ok('Schleife-Blatt: Schalter „Mithören beim Wischen“ (≥ 44 px)', await ev(p, `const b = document.querySelector('.pop .ux1-scr'); if (!b) return false; const r = b.getBoundingClientRect(); return r.height >= 44 && /Mithören/.test(b.textContent)`));
  await p.tap('.pop .ux1-scr'); await wait(200);
  const on = await ev(p, `return {on: SX7.on, ln: !!SX7.ln && !SX7.ln.hidden, txt: document.querySelector('.pop .ux1-scr b').textContent, pressed: document.querySelector('.pop .ux1-scr').getAttribute('aria-pressed')}`);
  ok('Tipp → Mithören an (Linie sichtbar, Schalter zeigt „an“)', on.on && on.ln && on.txt === 'an' && on.pressed === 'true', on);
  await p.screenshot({path: path.join(DIR, 'uix1-2-mithoeren-428x926.png')});
  // ✕ im Popup (neu) schließt
  await p.tap('.pop .ux1-px'); await wait(200);
  ok('✕ oben rechts schließt das Schleife-Blatt', await ev(p, 'return !UI.pop'));
  // wischen unter der Linie hört (Funktion bleibt)
  ok('Mithören bleibt an nach dem Schließen', await ev(p, 'return SX7.on && sx7Live()'));
  await p.tap('.sv-top > .sv-loop'); await wait(200); await p.tap('.pop .ux1-scr'); await wait(150);
  ok('zweiter Tipp → aus', await ev(p, 'return !SX7.on && SX7.ln.hidden'));
  ok('keine Seitenfehler (Mithören)', !p._errs.length, p._errs);
  await p.close();
  const q = await page(926, 428);
  await ev(q, `SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); return true`); await wait(300);
  ok('quer: Lautsprecher-Knopf bleibt in der Song-Leiste', await ev(q, `const b = document.querySelector('.sv-top > .sv-scr'); return !!b && getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().width >= 40`));
  await q.close();
}
// ---------- 3 · ✕ in Popups (hochkant) + quer unverändert ----------
for (const [w, h] of [[428, 926], [375, 667]]) {
  const p = await page(w, h);
  await ev(p, `partNewAt(1); return true`); await wait(200);
  const r = await ev(p, `const b = document.querySelector('.pop .ux1-px'); if (!b) return null; const r = b.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return {x: r.left, y: r.top, w: r.width, h: r.height, top: h === b, inVp: r.top >= 0 && r.right <= innerWidth}`);
  ok(`${w}x${h} „Name für den Teil“: ✕ sichtbar`, r && r.top && r.inVp, r);
  const nm = await ev(p, 'return S.parts[1] && S.parts[1].name');
  await p.tap('.pop .ux1-px'); await wait(150);
  ok(`${w}x${h} ✕ schließt, Name bleibt`, await ev(p, `return !UI.pop && S.parts[1].name === ${JSON.stringify(nm)}`));
  await p.close();
}
{
  const q = await page(926, 428);
  await ev(q, `partNewAt(1); return true`); await wait(200);
  ok('quer: kein zusätzliches ✕ in Popups (Querformat unverändert)', await ev(q, `const b = document.querySelector('.pop .ux1-px'); return !b || getComputedStyle(b.parentElement).display === 'none'`));
  await ev(q, S1OPEN.replace("A.partFromNow(0,'Strophe')", "A.partFromNow(0,'Strophe')"));
  await q.screenshot({path: path.join(DIR, 'uix1-4-quer-teil-926x428.png')});
  ok('quer: Blatt „Teil überarbeitet“ ✕ im Bild', await ev(q, `const x = document.querySelector('.fsheet .fs-x'); const r = x.getBoundingClientRect(); return r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight`));
  ok('keine Seitenfehler (quer)', !q._errs.length, q._errs);
  await q.close();
}
// ---------- 4 · iOS-Tastatur (visualViewport simuliert): Blatt mit aktivem Feld rückt darüber ----------
{
  const p = await page(428, 926);
  const KB = H => `Object.defineProperty(window.visualViewport, 'height', {configurable: true, get: () => ${H}}); Object.defineProperty(window.visualViewport, 'offsetTop', {configurable: true, get: () => 0}); window.visualViewport.dispatchEvent(new Event('resize')); await new Promise(r => setTimeout(r, 120)); return true;`;
  // a) FANG TEIL ✎ Name
  await ev(p, `const A = SYNQUENZER; A.play(); A.launchScene(0); await new Promise(r=>setTimeout(r,2600)); A.fangTeil({}); await new Promise(r=>setTimeout(r,150)); FANG.edit = true; UI.fangRepaint(); await new Promise(r=>setTimeout(r,120)); return true`);
  ok('FANG ✎: Feld hat den Fokus', await ev(p, `return document.activeElement && document.activeElement.classList.contains('fs-in')`));
  await ev(p, KB(580));
  const a = await ev(p, `const r = UI.pop.el.getBoundingClientRect(), x = UI.pop.el.querySelector('.fs-x').getBoundingClientRect(), i = document.activeElement.getBoundingClientRect(); return {bottom: r.bottom, top: r.top, xTop: x.top, inBottom: i.bottom, kb: SYNQUENZER.ux1Kb().on}`);
  ok('Tastatur offen (580 px sichtbar): Blatt endet darüber, ✕ und Feld sichtbar', a.kb && a.bottom <= 581 && a.xTop >= 0 && a.inBottom <= 580, a);
  await p.screenshot({path: path.join(DIR, 'uix1-3-tastatur-428x926.png'), clip: {x: 0, y: 0, width: 428, height: 580}});
  await ev(p, `document.activeElement.blur(); return true`); await ev(p, KB(926));
  const a2 = await ev(p, `const r = UI.pop && UI.pop.el.getBoundingClientRect(); return r ? {bottom: r.bottom, kb: SYNQUENZER.ux1Kb().on} : null`);
  ok('Tastatur zu: Blatt wieder unten', a2 && !a2.kb && Math.abs(a2.bottom - 926) < 1.5, a2);
  await ev(p, `closePop(); SYNQUENZER.stop(); return true`);
  // b) Zusammenfassen: eigener Name
  await ev(p, `SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); SYNQUENZER.openSum(0, 1); await new Promise(r=>setTimeout(r,150)); document.querySelector('.pop .mn-in').focus(); return true`);
  await ev(p, KB(560));
  const c = await ev(p, `const r = UI.pop.el.getBoundingClientRect(), x = UI.pop.el.querySelector('.ux1-px'), xr = x && x.getBoundingClientRect(); return {bottom: r.bottom, top: r.top, xTop: xr ? xr.top : null, kb: SYNQUENZER.ux1Kb().on}`);
  ok('Zusammenfassen: Blatt über der Tastatur, ✕ sichtbar', c.kb && c.bottom <= 561 && c.top >= 0 && c.xTop != null && c.xTop >= 0, c);
  await ev(p, `document.activeElement.blur(); return true`); await ev(p, KB(926));
  ok('Zusammenfassen: Tastatur zu → wieder unten', await ev(p, `const r = UI.pop.el.getBoundingClientRect(); return Math.abs(r.bottom - innerHeight) < 1.5 && !SYNQUENZER.ux1Kb().on`));
  ok('keine Seitenfehler (Tastatur)', !p._errs.length, p._errs);
  await p.close();
}
await b.close();
const bad = res.filter(r => !r.ok);
console.log(`\n${res.length - bad.length}/${res.length} OK` + (bad.length ? ' – FEHLER: ' + bad.map(r => r.name).join(' | ') : ''));
