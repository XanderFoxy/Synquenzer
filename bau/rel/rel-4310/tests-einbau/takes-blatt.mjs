// Einbau G10c + 4.30.1: EIN Takes-Blatt. Aufruf: node takes-blatt.mjs <app.html> <bilder-ordner>
//  1 genau ein ✕ (das des Blatt-Kopfs), Kopf = erstes Kind, Kopf-Knöpfe ≥ 44 px im Bild, Zeile „7 Aufnahmen …“ unter dem Kopf
//  2 Neuzeichnen (Bearbeiten auf/zu, Löschen, ↶, Speicher-Schätzung, Mini-Wellen, Aufräumen-Größe) verdoppelt/verliert den Kopf nicht
//  3 Inhalt rollt mit dem Finger (Wisch auf einer Take-Zeile), der Kopf bleibt oben; ✕ bleibt sichtbar
//  4 Wisch nach unten am Kopf: 30 px federt zurück, 140 px schließt; Wisch nach links auf einer Zeile löscht (auch gerollt)
//  5 Halten 1,5 s = Bearbeiten (kein Tipp beim Loslassen: der hörbare Take bleibt)
//  6 Ablegen → Zurückholen: Scroll-Stand, offene Bearbeiten-Zeile, getippter Name (übernommen), Vorhören gestoppt
//  7 Vorhören ↔ Transport: ▶ im Kopf beendet das Vorhören; Vorhören bei laufendem Transport = Hinweis; Start über andere Wege beendet es auch
import {boot, ok, inject, sheet, touchDrag} from '../bau/helfer/G10C/tests/lib.mjs';
import fs from 'fs';
const FILE = process.argv[2], OUT = process.argv[3] || '.';
fs.mkdirSync(OUT, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const info = p => p.evaluate(() => { const q = UI.pop && UI.pop.el; return q ? {name: UI.pop.name, st: q.scrollTop, max: q.scrollHeight - q.clientHeight, heads: q.querySelectorAll('.psh-h').length, first: q.firstElementChild && q.firstElementChild.classList.contains('psh-h'), bodies: q.querySelectorAll(':scope > .g10c-bd').length} : null; });
const box = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height, b: r.bottom}; }, sel);
for (const [w, h] of [[428, 926], [926, 428], [428, 650]]) {
  const T = w + '×' + h;
  const {b, p, errs} = await boot({width: w, height: h}, {file: FILE});
  await p.evaluate(async () => { ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
  await p.evaluate(() => SYNQUENZER.setSong({bars: 8, lanes: []}));
  await inject(p, 7, {sec: 3});
  await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, a = S.tracks[st].clips[0].audio; a.name = 'Refrain'; a.tag = 1; a.fav = true; a.alt[1].tag = 3; a.alt[0].name = 'Strophe'; });
  await sheet(p); await sleep(300); await p.evaluate(() => SYNQUENZER.g10cWaitPeaks()); await sleep(150);
  // 1 ein ✕
  const xs = await p.evaluate(() => [...UI.pop.el.querySelectorAll('button')].filter(x => x.textContent.trim() === '✕' && !/l.schen/i.test(x.getAttribute('aria-label') || '')).map(x => x.className));
  ok(xs.length === 1 && /psh-x/.test(xs[0]), T + ': genau ein ✕ zum Schließen (' + JSON.stringify(xs) + ')');
  const i0 = await info(p);
  ok(i0.heads === 1 && i0.first && i0.bodies === 1, T + ': Kopf einmal, erstes Kind; ein Körper ' + JSON.stringify(i0));
  const hb = await p.evaluate(() => [...UI.pop.el.querySelectorAll('.psh-h button')].map(x => { const r = x.getBoundingClientRect(); return [x.dataset.psh, Math.round(r.width), Math.round(r.height), r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight]; }));
  ok(hb.length === 5 && hb.every(z => z[1] >= 44 && z[2] >= 44 && z[3]), T + ': Kopf ⏮ ▶ Schleife Ablegen ✕, je ≥ 44 px, im Bild ' + JSON.stringify(hb));
  const sum = await p.evaluate(() => { const s = UI.pop.el.querySelector('.g10c-sum'), hd = UI.pop.el.querySelector('.psh-h'); return {t: s.textContent, below: s.getBoundingClientRect().top >= hd.getBoundingClientRect().bottom - 1, title: hd.querySelector('.psh-t').textContent, h4: UI.pop.el.querySelectorAll('h4').length}; });
  ok(sum.t.startsWith('7 Aufnahmen in Szene 1 · oben = hörbar · neu oben') && sum.below && sum.title === 'Takes' && sum.h4 === 0, T + ': Titel „Takes“ im Kopf, Zeile darunter ' + JSON.stringify(sum));
  await p.screenshot({path: OUT + '/takes-' + w + 'x' + h + '.png'});
  // 2 Neuzeichnen
  await p.evaluate(async () => { for (let k = 0; k < 5; k++) g10cRepaint(); G10C.ed = 2; g10cRepaint(); G10C.ed = -1; g10cRepaint(); TK.estT = 0; tkSheetPaint(UI.pop.el); G10C.gcSig = ''; await g10cGcEstimate(); await new Promise(r => setTimeout(r, 120)); });
  await p.tap('.tksheet .g10c-row[data-k="3"] .tk-del'); await sleep(150); await p.evaluate(() => undo()); await sleep(150);
  const i2 = await info(p);
  ok(i2.heads === 1 && i2.first && i2.bodies === 1 && await p.evaluate(() => document.querySelectorAll('.psh-h').length === 1), T + ': nach Neuzeichnen/Löschen/↶ Kopf weiter einmal, erstes Kind ' + JSON.stringify(i2));
  // 3 Finger-Bildlauf auf einer Take-Zeile, Kopf bleibt oben
  if (i2.max > 20) {
    const r3 = await box(p, '.tksheet .g10c-row[data-k="2"] .g10c-pick');
    const y0 = Math.min(r3.y, h - 30), y1 = Math.max(70, y0 - 220);
    await touchDrag(p, r3.l + 30, y0, r3.l + 30, y1, 12); await sleep(500);
    const g = await p.evaluate(() => { const q = UI.pop.el, hd = q.querySelector('.psh-h').getBoundingClientRect(), r = q.getBoundingClientRect(), x = q.querySelector('.psh-x').getBoundingClientRect(); return {st: q.scrollTop, headTop: Math.round(hd.top - r.top), xVis: x.top >= 0 && x.bottom <= innerHeight, n: SYNQUENZER.g10cInfo().segs.length}; });
    ok(g.st > 20 && Math.abs(g.headTop) <= 2 && g.xVis && g.n === 7, T + ': Inhalt rollt mit dem Finger, Kopf bleibt oben, ✕ sichtbar, nichts gelöscht ' + JSON.stringify(g));
    await p.screenshot({path: OUT + '/takes-' + w + 'x' + h + '-gerollt.png'});
  } else ok(true, T + ': passt ohne Rollen');
  // 4a Wisch nach links auf einer Zeile (gerollt) löscht
  {
    await p.evaluate(() => { const e = UI.pop.el.querySelector('.g10c-row[data-k="1"]'); e.scrollIntoView({block: 'nearest'}); }); await sleep(120);
    const r4 = await box(p, '.tksheet .g10c-row[data-k="1"] .g10c-pick');
    await touchDrag(p, r4.l + r4.w * .8, r4.y, r4.l + r4.w * .8 - 160, r4.y + 4, 12); await sleep(200);
    const n = await p.evaluate(() => SYNQUENZER.g10cInfo().segs.length);
    ok(n === 6 && await p.evaluate(() => UI.pop && UI.pop.name === 'takes'), T + ': Wisch nach links löscht (Blatt bleibt offen) n=' + n);
    await p.evaluate(() => undo()); await sleep(150);
  }
  // 5 Halten 1,5 s: Bearbeiten, nicht hörbar machen
  {
    await p.evaluate(() => { UI.pop.el.querySelector('.g10c-row[data-k="2"]').scrollIntoView({block: 'nearest'}); }); await sleep(120);
    const top0 = await p.evaluate(() => SYNQUENZER.g10cInfo().segs[0].take);
    const r5 = await box(p, '.tksheet .g10c-row[data-k="2"] .g10c-pick');
    await touchDrag(p, r5.x, r5.y, r5.x, r5.y, 1, 1500); await sleep(200);
    const s5 = await p.evaluate(() => ({ed: G10C.ed, top: SYNQUENZER.g10cInfo().segs[0].take, edRow: !!UI.pop.el.querySelector('.g10c-ed[data-k="2"]')}));
    ok(s5.ed === 2 && s5.edRow && s5.top === top0, T + ': Halten 1,5 s öffnet Bearbeiten, der hörbare Take bleibt ' + JSON.stringify(s5));
  }
  // 6 Ablegen → Zurückholen
  {
    await p.fill('.tksheet .g10c-name', 'Bridge neu'); await sleep(50);
    await p.evaluate(() => { const q = UI.pop.el; q.scrollTop = Math.min(q.scrollHeight - q.clientHeight, Math.round((q.scrollHeight - q.clientHeight) * .6)); }); await sleep(100);
    // Vorhören an (Take 1 unten in der Liste ist egal – irgendeiner)
    await p.evaluate(() => g10cPv(TK.sheet, 0)); await sleep(400);
    const before = await p.evaluate(() => ({st: UI.pop.el.scrollTop, ed: G10C.ed, pv: !!(G10C.pv && G10C.pv.s), focus: document.activeElement && document.activeElement.className}));
    const dk = await box(p, '#popLayer .pop .psh-dk');
    await p.touchscreen.tap(dk.x, dk.y); await sleep(350);
    const docked = await p.evaluate(() => { const q = document.querySelector('#pshDock .pop'); const r = q && q.getBoundingClientRect(); return {bar: !!q, h: r && Math.round(r.height), pv: G10C.pv, pop: !!UI.pop, name: SYNQUENZER.g10cInfo().segs[2].name, ed: G10C.ed, title: q && q.querySelector('.psh-t').textContent, act: document.activeElement && document.activeElement.className}; });
    await p.screenshot({path: OUT + '/takes-' + w + 'x' + h + '-abgelegt.png'});
    ok(docked.bar && docked.h <= 60 && !docked.pop && docked.pv === null && docked.name === 'Bridge neu' && docked.ed === 2 && /Szene 1/.test(docked.title) && !/g10c-name/.test(docked.act || ''), T + ': Ablegen: Leiste, Vorhören gestoppt, Name übernommen, Bearbeiten bleibt gemerkt ' + JSON.stringify({before, docked}));
    const bt = await box(p, '#pshDock .psh-t');
    await p.touchscreen.tap(bt.l + 12, bt.y); await sleep(450);
    const after = await p.evaluate(() => { const q = UI.pop && UI.pop.el; return q ? {name: UI.pop.name, st: q.scrollTop, ed: G10C.ed, edRow: !!q.querySelector('.g10c-ed[data-k="2"]'), val: (q.querySelector('.g10c-name') || {}).value, heads: q.querySelectorAll('.psh-h').length, first: q.firstElementChild.classList.contains('psh-h')} : null; });
    ok(after && after.name === 'takes' && Math.abs(after.st - before.st) <= 2 && after.edRow && after.val === 'Bridge neu' && after.heads === 1 && after.first, T + ': Zurückholen: Scroll-Stand, Bearbeiten-Zeile und Name wie vorher, Kopf einmal ' + JSON.stringify({before: before.st, after}));
    await p.screenshot({path: OUT + '/takes-' + w + 'x' + h + '-zurueck.png'});
    await p.evaluate(() => { G10C.ed = -1; g10cRepaint(); });
  }
  // 7 Vorhören ↔ Transport
  if (w === 428 && h === 926) {
    await p.evaluate(() => { setUiPref('pshLoop', true); UI.pop.el.scrollTop = 0; }); await sleep(100);
    await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-pv"]'); await sleep(500);
    const a = await p.evaluate(() => ({pv: !!(G10C.pv && G10C.pv.s), playing: R.playing}));
    const pl = await box(p, '#popLayer .pop .psh-pl');
    await p.touchscreen.tap(pl.x, pl.y); await sleep(600);
    const b7 = await p.evaluate(() => ({pv: G10C.pv, playing: R.playing, btnOn: !!UI.pop.el.querySelector('.g10c-pv.on'), sheet: UI.pop && UI.pop.name}));
    ok(a.pv && !a.playing && b7.pv === null && b7.playing && !b7.btnOn && b7.sheet === 'takes', T + ': ▶ im Kopf beendet das Vorhören und spielt die Stelle ' + JSON.stringify({a, b7}));
    await p.evaluate(() => { const t = document.querySelector('#toast, .toast'); if (t) t.textContent = ''; });
    await p.tap('.tksheet .g10c-row[data-k="2"] button[data-a="g10c-pv"]'); await sleep(250);
    const c7 = await p.evaluate(() => ({pv: G10C.pv, playing: R.playing, toast: (document.querySelector('#toast, .toast') || {}).textContent || ''}));
    ok(c7.pv === null && c7.playing && /Läuft gerade/.test(c7.toast), T + ': Vorhören bei laufendem Transport = Hinweis, kein zweiter Klang ' + JSON.stringify(c7));
    await p.touchscreen.tap(pl.x, pl.y); await sleep(400);
    ok(!(await p.evaluate(() => R.playing)), T + ': ■ im Kopf hält an');
    // Start über einen anderen Weg (Szene starten wie mit Taste/MIDI) beendet das Vorhören ebenfalls
    await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-pv"]'); await sleep(450);
    const d0 = await p.evaluate(() => !!(G10C.pv && G10C.pv.s));
    await p.evaluate(() => launchScene(0)); await sleep(250);
    const d1 = await p.evaluate(() => ({pv: G10C.pv, playing: R.playing, btnOn: !!UI.pop.el.querySelector('.g10c-pv.on')}));
    ok(d0 && d1.pv === null && d1.playing && !d1.btnOn, T + ': Transport über anderen Weg beendet das Vorhören ' + JSON.stringify({d0, d1}));
    await p.evaluate(() => stop()); await sleep(300);
    // ⏮ im Kopf beendet das Vorhören ebenfalls
    await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-pv"]'); await sleep(450);
    const fi = await box(p, '#popLayer .pop .psh-b[data-psh=first]');
    await p.touchscreen.tap(fi.x, fi.y); await sleep(300);
    const e7 = await p.evaluate(() => ({pv: G10C.pv, playing: R.playing}));
    ok(e7.pv === null && e7.playing, T + ': ⏮ im Kopf beendet das Vorhören ' + JSON.stringify(e7));
    await p.evaluate(() => stop()); await sleep(300);
    // Rollen während des Vorhörens: genau eine Lauflinien-Schleife (Neuzeichnen startet keine zweite)
    await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-pv"]'); await sleep(450);
    const loops = await p.evaluate(async () => { let n = 0; const raf = window.requestAnimationFrame; window.requestAnimationFrame = f => { if (f === g10cPvTick) n++; return raf(f); }; for (let k = 0; k < 6; k++) g10cRepaint(); await new Promise(r => setTimeout(r, 200)); window.requestAnimationFrame = raf; return n; });
    ok(loops <= 16, T + ': eine Lauflinien-Schleife (rAF-Aufrufe in 200 ms nach 6× Neuzeichnen: ' + loops + ')');
    await p.evaluate(() => { g10cPvStop(); g10cRepaint(); });
  }
  // 4b Wisch nach unten am Kopf
  {
    const ht = await p.evaluate(() => { const r = UI.pop.el.querySelector('.psh-t').getBoundingClientRect(); return {x: r.left + 10, y: r.top + r.height / 2}; });
    await touchDrag(p, ht.x, ht.y, ht.x, ht.y + 30, 8); await sleep(300);
    const still = await p.evaluate(() => !!(UI.pop && UI.pop.name === 'takes') && UI.pop.el.style.transform === '');
    await touchDrag(p, ht.x, ht.y, ht.x, ht.y + 140, 8); await sleep(350);
    ok(still && await p.evaluate(() => !UI.pop && G10C.ed === -1 && G10C.pv === null), T + ': Wisch am Kopf: 30 px federt zurück, 140 px schließt');
  }
  ok(errs.length === 0, T + ': keine Konsolenfehler ' + JSON.stringify(errs.slice(0, 4)));
  await b.close();
}
