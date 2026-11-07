// FX1: Fills/Breaks als Ebene – ein gezielter Abnahme-Lauf (Daten, Snare-Fehler, frei setzen per Tipp, Blatt, Noten, MIDI, Speichern/Laden, Fotos)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4440';
const FILE = process.argv[2] || DIR + '/fx/index.html', OUT = DIR + '/fx/';
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond, info}); console.log((cond ? 'OK   ' : 'FAIL ') + name + (info != null ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForTimeout(1500);

// Aufbau: Drum-Clip (Kick 1/3, Snare 2/4, Hats in Achteln), Song 8 Takte, Teile A | B (Kante bei Takt 5)
await p.evaluate(() => {
  const Q = window.SYNQUENZER; Q.setBpm(120);
  const notes = [[0, 36], [1, 38], [2, 36], [3, 38]].map(([t, n]) => ({t, d: .25, n, v: .9})).concat([0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .25, n: 42, v: .6})));
  Q.setClip(4, 0, {len: 1, notes});
  const nt = Q.state().project.tracks.length, lanes = Array.from({length: nt}, (_, i) => (i === 4 ? [{bar: 0, slot: 0}] : []));
  window.__song0 = {bars: 8, lanes, marks: [{id: 'M1', a: 0, len: 4}, {id: 'M2', a: 4, len: 4}]};
  Q.setSong(window.__song0);
});
// Rendern (Video-Ton, deterministisch) und die Treffer auf Song-Schläge umrechnen (Kick auf Schlag 0 = Bezug)
const render = async () => p.evaluate(async () => {
  const r = await window.SYNQUENZER.vvRender({range: {a: 0, b: 5, sel: false}});
  const L = (r.log || []).filter(e => e.track === 4 && e.beat != null);
  const k0 = Math.min(...L.map(e => e.beat));   // Song-Schlag 0 = erster Schlag (Kick oder Becken)
  return L.map(e => ({b: +(e.beat - k0).toFixed(3), n: e.out, src: e.src}));
});
const has = (L, b, n) => L.some(e => Math.abs(e.b - b) < .02 && e.n === n);
const ueCount = (L, a, z) => L.filter(e => e.src === 'ue' && e.b >= a - .01 && e.b < z - .01).length;

// 1) Tom-Fill frei über Takt 4 (Schlag 12–16) im Modus Mischen → Snare auf 2 und 4 bleibt hörbar
const id1 = await p.evaluate(() => window.SYNQUENZER.fllPlace('fx-tom-fill', 12));
await p.evaluate(id => window.SYNQUENZER.fllMode(id, 'mischen'), id1);
let L = await render();
ok('Mischen: Snare Takt 4 (Schlag 2 + 4) hörbar', has(L, 13, 38) && has(L, 15, 38), {snare: L.filter(e => e.n === 38 && e.b >= 12 && e.b < 16)});
ok('Mischen: 16 Tom-Schläge der Ebene', ueCount(L, 12, 16) === 16, ueCount(L, 12, 16));
const midiMix = await p.evaluate(() => window.SYNQUENZER.fllMidi().counts[4]);
// 2) Ersetzen (Standard für Fills: nur die eigenen Pads = Toms) → Snare und Kick bleiben
await p.evaluate(id => window.SYNQUENZER.fllMode(id, 'ersetzen'), id1);
let u = await p.evaluate(() => window.SYNQUENZER.ueList());
ok('Ersetzen: Tom-Fill ersetzt nur Toms', JSON.stringify(u[0].pads) === '[45,47,50]' && u[0].mode === 'ersetzt', u[0].pads);
L = await render();
ok('Ersetzen (nur Toms): Snare + Kick bleiben', has(L, 13, 38) && has(L, 15, 38) && has(L, 12, 36) && has(L, 14, 36));
// 3) Gegenprobe Ersetzen = Alle: so klang der Fehler (Groove schweigt ganz)
await p.evaluate(id => window.SYNQUENZER.fllPads(id, 'all'), id1);
L = await render();
ok('Ersetzen (alle Pads): Groove schweigt im Bereich (altes Verhalten, bewusst wählbar)', !has(L, 13, 38) && !has(L, 12, 36) && has(L, 16, 36));
const midiAll = await p.evaluate(() => window.SYNQUENZER.fllMidi().counts[4]);
await p.evaluate(id => window.SYNQUENZER.ueRemove(id), id1);
const midi0 = await p.evaluate(() => window.SYNQUENZER.fllMidi().counts[4]);
ok('MIDI-Export: Mischen +16, Ersetzen-alle +16−12', midiMix - midi0 === 16 && midiAll - midi0 === 4, {midi0, midiMix, midiAll});

// 4) altes Projekt: Tom-Wirbel an der Kante ohne Pads (wie 4.42.0 gespeichert) → beim Laden pad-genau, Snare bleibt
await p.evaluate(() => { const s = JSON.parse(JSON.stringify(window.__song0)); s.ue = [{id: 'U1', m: 'M2', a: -2, len: 2, k: 'tom', t: 4, mode: 'ersetzt', dens: 1, dir: 'auto', src: 'p-tom-kurz',
  notes: [50, 50, 50, 47, 47, 47, 45, 45].map((n, i) => ({t: i * .25, d: .25, n, v: .7}))}, {id: 'U2', m: 'M1', a: 0, len: 2, k: 'crash', t: 4, mode: 'ersetzt', dens: 1, dir: 'auto', src: 'p-becken-stopp', notes: [{t: 0, d: .25, n: 49, v: 1}]}]; s.marks.unshift(); window.SYNQUENZER.setSong(s); });
u = await p.evaluate(() => window.SYNQUENZER.ueList());
ok('Altes Projekt: Tom-Wirbel → ersetzt nur Toms; Stopp bleibt ganz', u.length >= 1 && JSON.stringify(u.find(e => e.src === 'p-tom-kurz').pads) === '[45,47,50]', u.map(e => ({src: e.src, pads: e.pads || null})));
L = await render();
ok('Altes Projekt: Snare auf Takt 4 Schlag 4 bleibt im Überblendbereich', has(L, 15, 38) && ueCount(L, 14, 16) === 8);
ok('Altes Projekt: Becken-Stopp schweigt weiter ganz (Schlag 1–2)', has(L, 0, 49) && !has(L, 0, 36) && !has(L, 1, 38) && !has(L, 1, 42) && has(L, 2, 36));

// 5) frei per Tipp: Song-Ansicht, ◆ ÜBERGÄNGE, Kachel „Snare-Wirbel“ antippen, dann Takt 4 · Schlag 3,5 in der Drum-Zeile
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setSong(window.__song0); Q.songView(true); Q.sx8Zoom(80); Q.fllGrid('1/8'); Q.ueBar(true); });
await p.waitForTimeout(400);
let geo = await p.evaluate(() => { const Q = window.SYNQUENZER; if (SV.rows.indexOf(4) < 0) Q.trackBank(1); svDraw(true); const i = SV.rows.indexOf(4), c = SV.cv.getBoundingClientRect(); return {i, cx: c.left, cy: c.top, ru: SV.rulerH, rh: SV.rowH, cw: SV.cellW, sx: SV.x}; });
const tile = await p.$('.ue-tile[data-id="fx-snare-wirbel"]');
if (!tile) { await p.evaluate(() => { UE.tab = 'ue'; uePaintBar(); }); }
await p.evaluate(() => { const t = document.querySelector('.ue-tile[data-id="fx-snare-wirbel"]'); t.parentNode.scrollLeft = t.offsetLeft - 80; });
await p.waitForTimeout(100);
const tb = await (await p.$('.ue-tile[data-id="fx-snare-wirbel"]')).boundingBox();
await p.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2);
await p.waitForTimeout(150);
ok('Kachel antippen = gewählt', (await p.evaluate(() => window.SYNQUENZER.fllArmed())) === 'fx-snare-wirbel');
await p.screenshot({path: OUT + 'fx1-hochkant-leiste.png'});
const tx = geo.cx + 3.625 * geo.cw - geo.sx, ty = geo.cy + geo.ru + geo.i * geo.rh + geo.rh / 2;
await p.touchscreen.tap(tx, ty);
await p.waitForTimeout(250);
u = await p.evaluate(() => window.SYNQUENZER.ueList());
const free = u.find(e => e.src === 'fx-snare-wirbel');
ok('Tipp setzt den Fill frei bei Takt 4 · Schlag 3,5 (Song-Schlag 14,5)', free && free.at === 14.5 && free.a === 0 && free.m == null, free ? {at: free.at, a: free.a} : u);
ok('Gewählt endet nach dem Setzen', (await p.evaluate(() => window.SYNQUENZER.fllArmed())) == null);
L = await render();
const first = Math.min(...L.filter(e => e.src === 'ue').map(e => e.b));
ok('Freier Fill klingt ab Schlag 14,5; Hats laufen weiter (nur Snare ersetzt)', Math.abs(first - 14.5) < .02 && has(L, 15, 42) && has(L, 15.5, 42) && has(L, 16, 36), {first});

// 6) Chip ziehen (frei, Raster 1/4) und Griff rechts (Länge), Maus = ein Finger
await p.evaluate(() => { window.SYNQUENZER.fllGrid('1/4'); svDraw(true); });
await p.waitForTimeout(200);
const chip = await p.$(`.ue-chip[data-id="${free.id}"]`);
const cb = await chip.boundingBox();
const cl = await (await chip.$('.ue-cl')).boundingBox();
await p.mouse.move(cl.x + cl.width / 2, cl.y + cl.height / 2); await p.mouse.down();
for (let k = 1; k <= 8; k++) { await p.mouse.move(cl.x + cl.width / 2 - k * geo.cw / 8, cl.y + cl.height / 2 - k); await p.waitForTimeout(16); }
await p.mouse.up(); await p.waitForTimeout(250);
u = await p.evaluate(() => window.SYNQUENZER.ueList());
let f2 = u.find(e => e.id === free.id);
ok('Chip frei verschoben (Raster 1/4)', f2 && f2.at !== 14.5 && Math.abs(f2.at - Math.round(f2.at)) < 1e-9, f2 && f2.at);
await p.evaluate(() => svDraw(true)); await p.waitForTimeout(100);
const gr = await (await (await p.$(`.ue-chip[data-id="${free.id}"]`)).$('.ue-grip')).boundingBox();
const len0 = f2.len;
await p.mouse.move(gr.x + gr.width / 2, gr.y + gr.height / 2); await p.mouse.down();
for (let k = 1; k <= 6; k++) { await p.mouse.move(gr.x + gr.width / 2 + k * geo.cw / 6, gr.y + gr.height / 2); await p.waitForTimeout(16); }
await p.mouse.up(); await p.waitForTimeout(250);
u = await p.evaluate(() => window.SYNQUENZER.ueList()); f2 = u.find(e => e.id === free.id);
ok('Griff: Länge nach rechts, nach Raster', f2.len > len0 && Number.isInteger(f2.len), {len0, len: f2.len});

// 7) Blatt (hochkant): Stelle, Raster, Ersetzen | Mischen, Pads; alles ≥ 44 px, ✕ sichtbar
await p.evaluate(() => window.SYNQUENZER.ueBar(false));
await p.evaluate(id => window.SYNQUENZER.ueSheet(id), free.id); await p.waitForTimeout(250);
const tapBtn = async sel => { const bb = await (await p.$(sel)).boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(200); };
await tapBtn('.pop button[data-fl="pp"]');
const sz = async () => p.evaluate(() => { const P = document.querySelector('.pop'); const bs = [...P.querySelectorAll('button')].filter(x => x.offsetWidth); const r = P.getBoundingClientRect(), x = P.querySelector('.ms-x').getBoundingClientRect();
  return {small: bs.filter(x => { const q = x.getBoundingClientRect(); return (q.height < 43.5 && !x.classList.contains('ms-x')) || q.width < 43.5; }).map(x => x.textContent + ' ' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height)),
    over: P.scrollWidth > P.clientWidth + 1, inView: r.top >= 0 && r.bottom <= innerHeight + 1, xVis: x.top >= 0 && x.right <= innerWidth && x.width >= 44, h: Math.round(r.height)}; });
let m = await sz();
ok('Blatt hochkant: Tasten ≥ 44 px, ✕ sichtbar, nichts läuft über', !m.small.length && m.inView && m.xVis && !m.over, m);
await p.screenshot({path: OUT + 'fx1-hochkant-blatt.png'});
await tapBtn('.pop button[data-fl="m-m"]');
u = await p.evaluate(() => window.SYNQUENZER.ueList()); f2 = u.find(e => e.id === free.id);
ok('Blatt: Mischen per Tipp (1 Undo-Schritt)', f2.mode === 'dazu' && !f2.pads);
await p.evaluate(() => window.SYNQUENZER.undo()); u = await p.evaluate(() => window.SYNQUENZER.ueList()); f2 = u.find(e => e.id === free.id);
ok('Undo: wieder Ersetzen (nur Snare)', f2.mode === 'ersetzt' && JSON.stringify(f2.pads) === '[38]', f2.pads);
await p.evaluate(id => window.SYNQUENZER.ueSheet(id), free.id); await p.waitForTimeout(200);
await tapBtn('.pop button[data-fl="p+"]');
u = await p.evaluate(() => window.SYNQUENZER.ueList()); const f3 = u.find(e => e.id === free.id);
ok('Blatt ▶: eine Rasterstelle später', Math.abs(f3.at - (f2.at + 1)) < 1e-9, {vor: f2.at, nach: f3.at});

// 8) Noten im Drum-Raster (quer 926 × 428): Zelle antippen = Note, ein Undo-Schritt
await p.evaluate(() => closePop());
await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(500);
await p.evaluate(id => window.SYNQUENZER.fllNotes(id), free.id); await p.waitForTimeout(300);
const n0 = (await p.evaluate(() => window.SYNQUENZER.ueList())).find(e => e.id === free.id).notes.length;
const cells = await p.$$('.pop .se-row .se-cell');
const cbx = await cells[1].boundingBox();
await p.touchscreen.tap(cbx.x + cbx.width / 2, cbx.y + cbx.height / 2); await p.waitForTimeout(200);
const n1 = (await p.evaluate(() => window.SYNQUENZER.ueList())).find(e => e.id === free.id).notes;
ok('Noten: Tipp in Schritt 2 → Note (Snare-Pad)', n1.length === n0 - 1 || n1.length === n0 + 1, {n0, n1: n1.length});
m = await sz();
ok('Noten-Blatt quer: Tasten ≥ 44 px, ✕ sichtbar', !m.small.length && m.inView && m.xVis, m);
await p.screenshot({path: OUT + 'fx1-quer-noten.png'});
await p.evaluate(() => closePop());
await p.evaluate(id => window.SYNQUENZER.ueSheet(id), free.id); await p.waitForTimeout(250);
m = await sz();
ok('Blatt quer: Tasten ≥ 44 px, ✕ sichtbar, passt ins Bild', !m.small.length && m.inView && m.xVis, m);
await p.screenshot({path: OUT + 'fx1-quer-blatt.png'});
await p.evaluate(() => closePop());

// 9) Speichern / Laden: song.ue gleich (at, pads, mode, notes)
const before = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.ueList()));
const okLoad = await p.evaluate(() => { const j = window.SYNQUENZER.serialize(); return window.SYNQUENZER.importJSON(j); });
await p.waitForTimeout(300);
const after = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.ueList()));
ok('Speichern → Laden: Ebene gleich', okLoad && before === after && before.includes('"at"') && before.includes('"pads"'));

// 10) Leiste unten: ✕ sichtbar, Höhe wie in 4.42.0 (Raster-Knopf steckt in der Kachel-Zeile)
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(400);
const barM = async pg => pg.evaluate(() => { const Q = window.SYNQUENZER; Q.songView(true); Q.ueBar(true); const bar = document.querySelector('.ue-bar'), x = bar.querySelector('.ue-x').getBoundingClientRect(); return {h: bar.offsetHeight, xr: Math.round(x.right), xw: Math.round(x.width), vw: innerWidth}; });
const mFx = await barM(p);
const p0 = await ctx.newPage(); await p0.goto('file://' + DIR + '/basis.html'); await p0.waitForTimeout(1500);
await p0.evaluate(() => { const Q = window.SYNQUENZER; Q.setSong({bars: 8, lanes: Array.from({length: Q.state().project.tracks.length}, () => []), marks: [{id: 'M1', a: 0, len: 4}, {id: 'M2', a: 4, len: 4}]}); });
const mB = await barM(p0);
ok('Leiste: gleiche Höhe wie 4.42.0, ✕ im Bild', mFx.h === mB.h && mFx.xr <= mFx.vw && mFx.xw >= 44, {fx: mFx, basis: mB});
await p0.close();

ok('keine Fehler in der Konsole', !errs.length, errs);
const nOk = res.filter(r => r.ok).length; console.log(`\n${nOk}/${res.length} OK`);
await b.close();
