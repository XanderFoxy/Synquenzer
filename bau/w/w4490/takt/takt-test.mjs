// TAKT-Test: 3/4 überall (Metronom, Einzähler, TAKT/LEDs, LAUF), Clips umwandeln (Teil, Song), Dur ↔ Moll, Effekt-Rack, Öltank/Räume.
// Aufruf: node takt-test.mjs <index.html> <ausgabe-ordner>   (ABSOLUTE Pfade)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node takt-test.mjs <index.html> <ausgabe-ordner>'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
const shot = async (name, w, h) => { await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(450); await p.screenshot({path: path.join(out, name)}); };

/* ---------- 1) 3/4 in der Matrix: Klickmuster (gemessen am Planer), Einzähler, TAKT-Anzeige, LEDs ---------- */
const run = (setup, ci) => p.evaluate(async ({setup, ci}) => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  stop(); await wait(150); SYNQUENZER.loadDemo(); ensureAudio(); await wait(300);
  (new Function(setup))();
  const log = [], orig = window.click; window.click = function (t, acc, soft) { log.push([+t2b(t).toFixed(2), acc ? 'A' : soft ? 's' : 'n']); return orig.apply(this, arguments); };
  S.settings.metro = true; S.settings.countIn = 1;
  const takt = [], leds = [];
  if (ci) startTransport(1); else play();
  const T0 = performance.now();
  while (performance.now() - T0 < 4600) { await wait(40); const t = EL.taktVal.textContent; if (takt[takt.length - 1] !== t) takt.push(t); const l = SYNQUENZER.tkt.leds(); if (leds[leds.length - 1] !== l) leds.push(l); }
  stop(); window.click = orig; S.settings.metro = false;
  const beats = log.map(x => x[0]), acc = log.map(x => x[1]).join('');
  return {log: log.slice(0, 12), acc, beats, takt: takt.slice(0, 10), leds: leds.slice(0, 8), ledsAll: [...new Set(leds)], ts: S.ts || null};
}, {setup, ci});
const CLIP34 = "for (let t = 0; t < NT(); t++) if (S.tracks[t].clips[0] && !S.tracks[t].stimme) setClipTs(t, 0, '3/4'); R.selS = 0;";
const m34 = await run(CLIP34, true);
const accOk = s => /^AnnAnnAn/.test(s);
ok('3/4 Matrix (nur die Clips 3/4): Einzähler 3 Klicks ab −3 mit Betonung, dann Klickmuster A n n | A n n (gemessen)', m34.log[0][0] === -3 && m34.acc.startsWith('AnnAnnAnn') && m34.beats.slice(3, 9).join(',') === '0,1,2,3,4,5', {log: m34.log.slice(0, 9).map(x => x.join('')).join(' ')});
ok('3/4 Matrix: TAKT-Anzeige zählt 3 2 1 → 1.1 1.2 1.3 2.1 (nie .4)', m34.takt.slice(0, 7).join(' ') === '3 2 1 1.1 1.2 1.3 2.1' && !m34.takt.some(t => /\.4$/.test(t)), m34.takt);
ok('3/4 Matrix: Lauflicht der Takt-LEDs = 3 Lampen (die 4. unsichtbar, kein Verschieben)', m34.ledsAll.every(l => l[3] === 'x') && m34.ledsAll.some(l => l.startsWith('100')) && m34.ledsAll.some(l => l.startsWith('001')), m34.ledsAll);
const s34 = await run("setSongTs('3/4', {quiet: true}); R.selS = 0;", false);
ok('Song-Taktart 3/4 (Clips ohne Taktart): weiter 3/4 wie T1, jetzt mit 3 LEDs', accOk(s34.acc) && s34.ts === '3/4' && s34.ledsAll.every(l => l[3] === 'x'), {acc: s34.acc, leds: s34.ledsAll});
const m44 = await run("R.selS = 0;", false);
ok('4/4 bleibt wie bisher (A n n n, 4 LEDs)', /^AnnnAnnn/.test(m44.acc) && m44.ledsAll.every(l => !l.includes('x')), {acc: m44.acc, leds: m44.ledsAll});
const m68 = await run("for (let t = 0; t < NT(); t++) if (S.tracks[t].clips[0] && !S.tracks[t].stimme) setClipTs(t, 0, '6/8'); R.selS = 0;", false);
ok('6/8-Clips: Achtel-Klicks A s s n s s, 2 LEDs (Gruppen)', /^AssnssAssnss/.test(m68.acc) && m68.ledsAll.every(l => l.endsWith('xx')), {acc: m68.acc.slice(0, 12), leds: m68.ledsAll});

/* ---------- 2) LAUF und Drum-Schritte: ein Takt der Clip-Taktart ---------- */
const L2 = await p.evaluate(async () => {
  stop(); SYNQUENZER.loadDemo(); const o = {};
  const t = [0, 1, 2, 3].find(k => S.tracks[k].clips[0] && S.tracks[k].kind === 'synth'); setClipTs(t, 0, '3/4');
  SYNQUENZER.openLauf(t, 0); await new Promise(r => setTimeout(r, 300)); const L = SYNQUENZER.lauf(); o.lauf = L ? L.steps.length : null; o.pages = L && L.pages; o.len = S.tracks[t].clips[0].len;
  SYNQUENZER.closeRoll(); await new Promise(r => setTimeout(r, 200));
  setClipTs(t, 0, null); SYNQUENZER.openLauf(t, 0); await new Promise(r => setTimeout(r, 300)); o.lauf44 = SYNQUENZER.lauf() ? SYNQUENZER.lauf().steps.length : null; SYNQUENZER.closeRoll();
  const dc = S.tracks[DRUM_T].clips[0]; if (dc) { setClipTs(DRUM_T, 0, '3/4'); o.drum = dStepsOf(S.tracks[DRUM_T].clips[0]); }
  return o;
});
ok('LAUF: eine Seite = ein 3/4-Takt (12 Sechzehntel), 4/4 weiter 16; Drum-Schritte 12', L2.lauf === 12 && L2.lauf44 === 16 && L2.drum === 12, L2);

/* ---------- 3) Clips umwandeln: Teil auf 3/4 (Marken-Blatt-Meldung), Versionen, Klicks im Song, ↶ ---------- */
const F3 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(200);
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
  const song = S.song, m = song.marks[1]; o.mark = {a: m.a, len: m.len};
  openMarkSheet(m.id); await wait(250);
  const tb = [...UI.pop.el.querySelectorAll('button')].find(x => /Taktart/.test(x.textContent)); if (tb) tb.click(); await wait(150);
  const b34 = UI.pop && UI.pop.el.querySelector('.t1ts button[data-ts="3/4"]'); if (b34) b34.click(); await wait(200);
  o.markTs = S.song.marks[1].ts || null;
  const tbtn = [...EL.toast.querySelectorAll('button')].find(x => x.textContent.includes('Clips umwandeln')); o.toastBtn = !!tbtn;
  const u0 = UNDO.length, before = JSON.stringify(S.song.lanes);
  if (tbtn) tbtn.click(); else SYNQUENZER.tkt.foldMarks([m.id]);
  await wait(200); closePop();
  o.undoSteps = UNDO.length - u0;
  const vs = []; for (let t = 0; t < NT(); t++) { const h = sx9At(S.song, t, m.a); if (!h || !h.id) continue; const c = S.song.own[h.id]; vs.push({t, v: h.v, ts: c.ts || null, f: c.tkt && c.tkt.f, n: c.notes.length, grid: c.notes.every(n => Math.abs(n.t / .25 - Math.round(n.t / .25)) < 1e-6), inBar: c.notes.every(n => n.t < c.len * 3 + 1e-9)}); }
  o.vers = vs; o.v1 = (() => { const h = sx9At(S.song, 0, 0); return h ? h.v : null; })();
  // ▶ SONG ab dem Teil: Klicks in 3/4
  const log = [], orig = window.click; window.click = function (t, acc, soft) { log.push(acc ? 'A' : soft ? 's' : 'n'); return orig.apply(this, arguments); };
  S.settings.metro = true; songPlayStart(m.a); await wait(3600); stop(); window.click = orig; S.settings.metro = false; o.songAcc = log.join('');
  undo(); await wait(100); o.afterUndo = (() => { let n = 0; for (let t = 0; t < NT(); t++) { const h = sx9At(S.song, t, m.a); if (h && h.id) n++; } return n; })();
  o.lanesBack = JSON.stringify(S.song.lanes) === before;
  // Song als Ganzes: Taktart 3/4 → Meldung [Clips umwandeln] → alle Stellen werden 3/4-Versionen
  redo(); undo(); setSongTs('3/4'); await wait(100);
  const sb = [...EL.toast.querySelectorAll('button')].find(x => x.textContent.includes('Clips umwandeln')); o.songToast = !!sb; if (sb) sb.click(); await wait(100);
  let all = 0, n34 = 0; for (let t = 0; t < NT(); t++) { if (S.tracks[t].stimme) continue; for (let x = 0; x < S.song.bars; x++) { const h = sx9At(S.song, t, x); if (!h) continue; all++; const c = h.id ? S.song.own[h.id] : S.tracks[t].clips[h.s]; if (c && c.ts === '3/4') n34++; } }
  o.songAll = all; o.song34 = n34; undo(); undo();
  // ohne Song: Szenen-Clips werden an Ort und Stelle gefaltet
  SYNQUENZER.songDelete(); setSongTs('3/4'); const sc = [...EL.toast.querySelectorAll('button')].find(x => x.textContent.includes('Clips umwandeln')); o.sceneToast = !!sc; if (sc) sc.click();
  o.scene34 = S.tracks.filter(tr => !tr.stimme && tr.clips[0]).every(tr => tr.clips[0].ts === '3/4'); undo(); o.sceneBack = S.tracks.filter(tr => !tr.stimme && tr.clips[0]).every(tr => !tr.clips[0].ts);
  return o;
});
ok('Teil auf 3/4 im Marken-Blatt → Meldung mit [Clips umwandeln]', F3.markTs === '3/4' && F3.toastBtn, {markTs: F3.markTs});
ok('Clips umwandeln: jede Spur des Teils spielt eine neue 3/4-Version (tkt.f), Noten auf 1/16 und im 3/4-Takt, v1 vorn bleibt, ein ↶', F3.vers.length >= 3 && F3.vers.every(v => v.ts === '3/4' && v.f === '3/4' && v.grid && v.inBar && v.v >= 2) && F3.v1 === 1 && F3.undoSteps === 1, {vers: F3.vers, v1: F3.v1});
ok('▶ SONG im 3/4-Teil: Klicks A n n (gemessen)', /^(Ann)+A?n?$/.test(F3.songAcc.slice(0, 6)) && F3.songAcc.startsWith('AnnAnn'), F3.songAcc);
ok('↶ nimmt die Umwandlung zurück (Song-Spuren wie vorher)', F3.afterUndo === 0 && F3.lanesBack, {afterUndo: F3.afterUndo});
ok('Song als Ganzes auf 3/4: [Clips umwandeln] → alle Stellen 3/4', F3.songToast && F3.songAll > 0 && F3.song34 === F3.songAll, {all: F3.songAll, n34: F3.song34});
ok('ohne Song: Szenen-Clips werden gefaltet, ↶ zurück', F3.sceneToast && F3.scene34 && F3.sceneBack, {scene34: F3.scene34, back: F3.sceneBack});

/* ---------- 4) Dur → Moll an einem C-Dur-Song ---------- */
const M4 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(150);
  setProjectKey({root: 0, scale: 'ionian'});
  const syn = [0, 1, 2, 3].filter(k => S.tracks[k] && S.tracks[k].kind === 'synth' && !percIs(S.tracks[k]));
  const [tb, tc, tl] = [syn[0], syn[2] != null ? syn[2] : syn[1], syn[3] != null ? syn[3] : syn[1]];
  const N = (t, n, d, v) => ({t, n, d: d || .9, v: v || .8});
  const lead = [60, 62, 64, 65, 67, 69, 71, 72].map((n, k) => N(k, n));
  const ch = [[0, 60], [0, 64], [0, 67], [2, 67], [2, 71], [2, 74], [4, 65], [4, 69], [4, 72], [6, 69], [6, 72], [6, 76]].map(([t, n]) => N(t, n, 1.9));
  const bass = [[0, 36], [2, 43], [4, 41], [6, 45]].map(([t, n]) => N(t, n, 1.8));
  const K = {root: 0, scale: 'ionian', src: 'user'};
  S.tracks[tl].clips[0] = {len: 2, key: Object.assign({}, K), notes: lead}; S.tracks[tc].clips[0] = {len: 2, key: Object.assign({}, K), notes: ch}; S.tracks[tb].clips[0] = {len: 2, key: Object.assign({}, K), notes: bass};
  for (const t of [tl, tc, tb]) clipChanged(t, 0);
  S.scenes[0].chords = normChordRow({len: 2, ch: [{b: 0, tg: {root: 0, kind: 'chord', quality: 'maj'}}, {b: 2, tg: {root: 7, kind: 'chord', quality: 'maj'}}, {b: 4, tg: {root: 5, kind: 'chord', quality: 'maj'}}, {b: 6, tg: {root: 9, kind: 'chord', quality: 'min'}}]});
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}]);
  const drumBefore = JSON.stringify(S.tracks[DRUM_T].clips[0]);
  const at = t => { const h = sx9At(S.song, t, 0); return h && h.id ? S.song.own[h.id] : S.tracks[t].clips[0]; };
  const pcs = c => c.notes.map(n => PCx(n.n));
  o.before = {lead: pcs(at(tl)), ch: pcs(at(tc)), bass: pcs(at(tb))};
  // über das Menü öffnen (≡ › Song › Dur ↔ Moll …)
  openMenu(); await wait(250); const mb = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Dur ↔ Moll …'); o.menuBtn = !!mb; if (mb) mb.click(); await wait(250);
  o.sheet = !!(UI.pop && UI.pop.name === 'tktmode');
  const u0 = UNDO.length, go = UI.pop && UI.pop.el.querySelector('button[data-tk="go"]'); if (go) go.click(); else SYNQUENZER.tkt.mode('g'); await wait(150);
  o.undoSteps = UNDO.length - u0; o.label = UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label;
  o.after = {lead: pcs(at(tl)), ch: pcs(at(tc)), bass: pcs(at(tb))};
  o.key = Object.assign({}, S.key); o.ver = at(tl).tkt || null; o.vkey = at(tl).key;
  o.row = S.scenes[0].chords.ch.map(c => c.tg && c.tg.name);
  o.drumSame = JSON.stringify(S.tracks[DRUM_T].clips[0]) === drumBefore && (() => { const h = sx9At(S.song, DRUM_T, 0); return !h || !h.id; })();
  o.which = SYNQUENZER.tkt.which();
  const ab = UI.pop && UI.pop.el.querySelector('button[data-tk="a"]'); if (ab) ab.click(); await wait(100); o.abA = {key: S.key.scale, lead: pcs(at(tl)).join(','), which: SYNQUENZER.tkt.which()};
  const bb = UI.pop && UI.pop.el.querySelector('button[data-tk="b"]'); if (bb) bb.click(); await wait(100); o.abB = {key: S.key.scale, which: SYNQUENZER.tkt.which()};
  await wait(100); const shotX = UI.pop && UI.pop.el.querySelector('.ms-x'); o.x = shotX ? (r => ({t: r.top, b: r.bottom, l: r.left, r: r.right, h: r.height}))(shotX.getBoundingClientRect()) : null;
  window.__tm = {tl, tc, tb};
  return o;
});
await shot('takt-moll-hochkant.png', 428, 926);
const M4b = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {}, {tl, tc, tb} = window.__tm;
  const at = t => { const h = sx9At(S.song, t, 0); return h && h.id ? S.song.own[h.id] : S.tracks[t].clips[0]; }, pcs = c => c.notes.map(n => PCx(n.n));
  closePop();
  undo(); await wait(100); o.undo = {key: S.key.scale, lead: pcs(at(tl)).join(','), row: S.scenes[0].chords.ch.map(c => c.tg && c.tg.name).join(' ')};
  redo(); await wait(100); o.redo = {key: S.key.scale};
  // Moll → Dur zurück (gleichnamig): wieder die C-Dur-Tonklassen
  SYNQUENZER.tkt.mode('g'); o.back = {key: S.key.scale, lead: pcs(at(tl)).join(','), ch: pcs(at(tc)).join(',')};
  undo(); undo();
  // parallel: C-Dur → a-Moll
  SYNQUENZER.tkt.mode('p'); o.par = {key: Object.assign({}, S.key), lead: at(tl).notes.map(n => n.n).join(',')}; undo();
  return o;
});
const eq = (a, b) => a.join(',') === b.join(',');
ok('Dur ↔ Moll im Menü › Song, öffnet das Blatt; ein ↶-Schritt', M4.menuBtn && M4.sheet && M4.undoSteps === 1, {label: M4.label});
ok('C-Dur → c-Moll: Melodie E→Es, A→As, H zum C bleibt (Leitton), Tonart c-Moll, Version mit tkt.m', eq(M4.before.lead, [0, 2, 4, 5, 7, 9, 11, 0]) && eq(M4.after.lead, [0, 2, 3, 5, 7, 8, 11, 0]) && M4.key.root === 0 && M4.key.scale === 'aeolian' && M4.ver && M4.ver.m === 'moll' && M4.vkey.scale === 'aeolian', {vorher: M4.before.lead, nachher: M4.after.lead, ver: M4.ver});
ok('Akkorde mitgeführt: C→Cm, G bleibt Dur (H bleibt), F→Fm, Am→As; Akkord-Zeile Cm G Fm As', eq(M4.after.ch, [0, 3, 7, 7, 11, 2, 5, 8, 0, 8, 0, 3]) && M4.row.join(' ') === 'Cm G Fm A♭' || eq(M4.after.ch, [0, 3, 7, 7, 11, 2, 5, 8, 0, 8, 0, 3]) && /^Cm G Fm (A♭|Ab|As)$/.test(M4.row.join(' ')), {ch: M4.after.ch, row: M4.row});
ok('Bass: A→As, Rest bleibt; Drums unverändert', eq(M4.after.bass, [0, 7, 5, 8]) && M4.drumSame, {bass: M4.after.bass});
ok('A/B im Blatt: A = C-Dur (Original), B = c-Moll', M4.which === 'b' && M4.abA.key === 'ionian' && M4.abA.lead === '0,2,4,5,7,9,11,0' && M4.abA.which === 'a' && M4.abB.key === 'aeolian' && M4.abB.which === 'b', {A: M4.abA, B: M4.abB});
ok('↶ stellt Tonart, Clips und Akkord-Zeile her, ↷ wieder Moll', M4b.undo.key === 'ionian' && M4b.undo.lead === '0,2,4,5,7,9,11,0' && /^C G F Am$/.test(M4b.undo.row) && M4b.redo.key === 'aeolian', M4b.undo);
ok('Moll → Dur zurück: wieder C-Dur-Tonklassen', M4b.back.key === 'ionian' && M4b.back.lead === '0,2,4,5,7,9,11,0' && M4b.back.ch === '0,4,7,7,11,2,5,9,0,9,0,4', M4b.back);
ok('parallel C-Dur → a-Moll: Melodie C D E F G A H C → A H C D E F Gis A', M4b.par.key.root === 9 && M4b.par.key.scale === 'aeolian' && M4b.par.lead === '57,59,60,62,64,65,68,69', M4b.par);
ok('Dur ↔ Moll: ✕ sichtbar (hochkant)', M4.x && M4.x.t >= 0 && M4.x.b <= 926 && M4.x.r <= 428 && M4.x.h >= 32, M4.x);

/* ---------- 5) Effekt-Rack: über FX öffnen, Geräte, LED, Regler wirken, Live-Anzeige ---------- */
const R5 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(300);
  const t = [0, 1, 2, 3].find(k => S.tracks[k].kind === 'synth' && S.tracks[k].clips[0]);
  selectTrack(t); ED.tab = 'fx'; ED.sub.fx = 'spur'; openEditor(); await wait(300);
  const rk = document.querySelector('.pg-fxg .tktrk'); o.btn = !!rk; o.btnH = rk ? rk.getBoundingClientRect().height : 0; if (rk) rk.click(); await wait(300);
  o.open = !!(UI.pop && UI.pop.name === 'tktrack'); o.info = SYNQUENZER.tkt.rackInfo();
  const r0 = S.fxBus.hall.ret; const led = UI.pop.el.querySelector('button[data-rk="led:hall"]'); led.click(); await wait(50); o.hallOff = S.fxBus.hall.ret; UI.pop.el.querySelector('button[data-rk="led:hall"]').click(); await wait(50); o.hallOn = S.fxBus.hall.ret; o.r0 = r0;
  const chI = UI.pop.el.querySelector('button[data-rk="ch:ENS"]'); if (chI) chI.click(); await wait(50); o.chorus = (fxOfSound(S.tracks[t].sound).chorus || {}).mode;
  o.leds44 = [...UI.pop.el.querySelectorAll('.tkr-led,.tkr-chip,.tkt-rooms .ms-b,.ms-x,.tkr-nv')].every(x => x.getBoundingClientRect().height >= 43.5);
  play(); await wait(1600);
  o.meters = [...UI.pop.el.querySelectorAll('.tkr-dev')].map(d => d.dataset.dev + ':' + d.querySelector('.tkr-mtr em').textContent);
  window.__rt = t; return o;
});
// Regler wirken: Rückweg im HALL-Gerät mit dem Finger nach oben ziehen
const knob = await p.evaluate(() => { const k = [...document.querySelectorAll('.tktrack .tkr-dev[data-dev="hall"] .knob')].find(x => x.getAttribute('aria-label') === 'Rückweg'); if (!k) return null; k.scrollIntoView({block: 'center'}); const r = k.querySelector('svg').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, v: S.fxBus.hall.ret}; });
if (knob) { await p.mouse.move(knob.x, knob.y); await p.mouse.down(); for (let k = 1; k <= 8; k++) await p.mouse.move(knob.x, knob.y + k * 8); await p.mouse.up(); await p.waitForTimeout(150); }
const R5b = await p.evaluate(() => ({ret: S.fxBus.hall.ret, undo: UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label}));
ok('FX › [RACK] (≥ 44 px) öffnet das Effekt-Rack mit SPUR · CHORUS · EQ · KOMP · HALL · ECHO · MASTER', R5.btn && R5.btnH >= 44 && R5.open && R5.info && ['spur', 'chorus', 'eq', 'hall', 'echo', 'master'].every(d => R5.info.devs.includes(d)) && R5.info.ctls >= 18, R5.info);
ok('An/Aus-LED wirkt (Hall-Rückweg 0 ↔ zurück), Chorus-Wahl wirkt, alle Tasten ≥ 44 px', R5.hallOff === 0 && Math.abs(R5.hallOn - R5.r0) < 1e-9 && R5.chorus === 'ENS' && R5.leds44, {r0: R5.r0, off: R5.hallOff, on: R5.hallOn, chorus: R5.chorus});
ok('Regler wirken: Rückweg im HALL-Gerät gezogen → S.fxBus.hall.ret ändert sich (ein ↶)', knob && Math.abs(R5b.ret - knob.v) > .02, {vorher: knob && knob.v, nachher: R5b.ret, undo: R5b.undo});
ok('Live-Anzeige beim Abspielen: Pegel an SPUR und HALL, GR am MASTER', R5.meters.some(m => /^spur:−\d+ dB$/.test(m)) && R5.meters.some(m => /^hall:−\d+ dB$/.test(m)) && R5.meters.some(m => /^master:/.test(m)), R5.meters);
await shot('takt-rack-hochkant.png', 428, 926);
await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(400);
await p.evaluate(async () => { SYNQUENZER.tkt.rackOpen(window.__rt); await new Promise(r => setTimeout(r, 900)); });   // Drehen schließt Blätter (wie bisher): neu öffnen
await p.screenshot({path: path.join(out, 'takt-rack-quer.png')});
const R5c = await p.evaluate(() => { const x = UI.pop && UI.pop.el.querySelector('.ms-x'), r = x && x.getBoundingClientRect(); return r ? {t: r.top, b: r.bottom, r: r.right, vis: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === x} : null; });
ok('Rack quer: ✕ sichtbar und oben (klebt beim Scrollen)', R5c && R5c.t >= 0 && R5c.b <= 428 && R5c.r <= 926 && R5c.vis, R5c);
await p.evaluate(() => { stop(); closePop(); });
await p.setViewportSize({width: 428, height: 926});

/* ---------- 6) Hall-Räume + Öltank: Einhängen im Bus, RT60 (tief betont), CPU/Speicher, Offline-Render ---------- */
const H6 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  ensureAudio(); await wait(200);
  SYNQUENZER.tkt.room('oel', 75); await wait(100); o.oel = SYNQUENZER.tkt.hallInfo();
  SYNQUENZER.tkt.room('saal'); await wait(100); o.saal = SYNQUENZER.tkt.hallInfo();
  SYNQUENZER.tkt.room(''); await wait(100); o.std = SYNQUENZER.tkt.hallInfo();
  // das Fx-Snapshot (Speichern): Feld nur, wenn gesetzt
  o.saveStd = JSON.stringify(normFxBus(S.fxBus).hall).includes('tkt');
  SYNQUENZER.tkt.room('oel', 30); o.save30 = JSON.parse(JSON.stringify(normFxBus(JSON.parse(JSON.stringify(S.fxBus))).hall)); undo(); o.undoRoom = S.fxBus.hall.tktRaum || '';
  // RT60 aus dem Offline-Render (Impuls → Öltank-Zweig), je Band; Energie-Hüllkurve in 250-ms-Fenstern, Gerade von −5 bis −25 dB
  const sr = 24000;
  async function band(x, f) { const o2 = new OfflineAudioContext(1, x.length, sr), bb = o2.createBuffer(1, x.length, sr); bb.copyToChannel(x, 0); const s = o2.createBufferSource(); s.buffer = bb; let n = s; for (let k = 0; k < 2; k++) { const bp = o2.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 1.4; n.connect(bp); n = bp; } n.connect(o2.destination); s.start(); return (await o2.startRendering()).getChannelData(0); }
  const env = z => { const W = Math.round(.25 * sr), e = []; for (let i = 0; i + W <= z.length; i += W) { let s = 0; for (let j = i; j < i + W; j++) s += z[j] * z[j]; e.push(10 * Math.log10(s / W + 1e-30)); } return e; };
  const rt = e => { const pk = Math.max(...e.slice(0, 12)), i0 = e.findIndex((v, k) => k > 2 && v < pk - 5); let i1 = e.findIndex((v, k) => k > i0 && v < pk - 25); if (i0 < 0) return null; if (i1 < 0) i1 = e.length - 1; let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0; for (let k = i0; k <= i1; k++) { const t = k * .25; sx += t; sy += e[k]; sxx += t * t; sxy += t * e[k]; n++; } return +(-60 / ((n * sxy - sx * sy) / (n * sxx - sx * sx))).toFixed(1); };
  o.rt = {};
  for (const [len, sec] of [[75, 45], [30, 30], [8, 14]]) {
    const r = await SYNQUENZER.tkt.oelRender(len, sec, sr);
    o.rt[len] = {r125: rt(env(await band(r.L, 125))), r1k: rt(env(await band(r.L, 1000))), r4k: rt(env(await band(r.L, 4000))), renderMs: Math.round(r.ms), rtf: +(sec / (r.ms / 1000)).toFixed(0)};
    if (len === 75) { const e125 = env(await band(r.L, 125)), e1k = env(await band(r.L, 1000)); o.lowDb = +(Math.max(...e125.slice(8, 40)) - Math.max(...e1k.slice(8, 40))).toFixed(1); }
  }
  // CPU: 20 s bei 48 kHz – Öltank-Zweig gegen einen leeren Zweig (nur Verstärker)
  const r48 = await SYNQUENZER.tkt.oelRender(30, 20, 48000);
  const oc = new OfflineAudioContext(2, 20 * 48000, 48000), g = oc.createGain(), s = oc.createConstantSource(); s.connect(g); g.connect(oc.destination); s.start(); const T0 = performance.now(); await oc.startRendering(); const base = performance.now() - T0;
  o.cpu = {oelMs: Math.round(r48.ms), baseMs: Math.round(base), audioSec: 20, rtf: +(20 / (r48.ms / 1000)).toFixed(0), pct: +(100 * r48.ms / 20000).toFixed(2)};
  o.mem = {ir: SYNQUENZER.tkt.ir('oel', 48000), fdnBytes: 4 * Math.ceil(.35 * 48000) * 4};
  return o;
});
ok('Öltank hängt im vorhandenen Hall-Bus (Raum an, FDN 75 s), Saal = Faltung ohne FDN, Standard = eingebauter Hall wieder dran', H6.oel.on && H6.oel.room === 'oel' && H6.oel.fdnLen === 75 && H6.oel.ir > 2.5 && H6.saal.on && H6.saal.room === 'saal' && !H6.std.on, {oel: H6.oel, saal: H6.saal, std: H6.std});
ok('Speichern additiv: Standard ohne Feld, Öltank 30 s = {tktRaum: oel} (30 = ohne tktLen); ↶ nimmt den Raum zurück', !H6.saveStd && H6.save30.tktRaum === 'oel' && !('tktLen' in H6.save30) && H6.undoRoom === '', {save30: H6.save30.tktRaum, undo: H6.undoRoom});
ok('Öltank RT60 gemessen: 75 s-Einstellung lang und tief betont (125 Hz > 1 kHz > 4 kHz, 125 Hz ≥ 90 s)', H6.rt[75].r125 >= 90 && H6.rt[75].r1k >= 55 && H6.rt[75].r125 > 1.3 * H6.rt[75].r1k && H6.rt[75].r4k < H6.rt[75].r1k && H6.lowDb > 3, {rt75: H6.rt[75], tiefen_dB: H6.lowDb});
ok('Öltank RT60: 30 s und 8 s folgen der Wahl (1 kHz ±30 %)', Math.abs(H6.rt[30].r1k - 30) < 9 && Math.abs(H6.rt[8].r1k - 8) < 2.6 && H6.rt[30].r125 > H6.rt[30].r1k, {rt30: H6.rt[30], rt8: H6.rt[8]});
ok('Öltank CPU/Speicher (iPhone-tauglich): IR ≈ 1 MB, FDN 0,27 MB, Rechenzeit klein', H6.mem.ir.bytes < 1.2e6 && H6.cpu.pct < 25, {cpu: H6.cpu, mem: H6.mem});
// Offline-Render (Video/WAV): derselbe Raum im Offline-Kontext, live bleibt er verbunden
const V6 = await p.evaluate(async () => {
  const o = {}; stop(); SYNQUENZER.loadDemo(); ensureAudio(); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.songFromChain([{scene: 0, bars: 1}]);
  const tail = buf => { const x = buf.getChannelData(0), a = Math.round(buf.length * .82); let e = 0; for (let i = a; i < buf.length; i++) e += x[i] * x[i]; return 10 * Math.log10(e / (buf.length - a) + 1e-30); };
  try { SYNQUENZER.tkt.room(''); const b0 = await vvRenderAudio({range: {a: 0, b: 1}}); o.std = +tail(b0.buf || b0).toFixed(1);
    SYNQUENZER.tkt.room('oel', 75); const b1 = await vvRenderAudio({range: {a: 0, b: 1}}); o.oel = +tail(b1.buf || b1).toFixed(1); } catch (e) { o.err = String(e && e.message || e); }
  o.live = SYNQUENZER.tkt.hallInfo(); SYNQUENZER.tkt.room('');
  return o;
});
ok('Offline-Render (Song als Audio/Video) hat den Öltank: Ende klingt deutlich länger nach als mit dem Standard-Hall; live bleibt der Raum dran', !V6.err && V6.oel > V6.std + 6 && V6.live.on && V6.live.room === 'oel', V6);

/* ---------- 7) FX-Seiten: RAUM/RACK-Knöpfe, nichts verschiebt sich, hochkant + quer ---------- */
const lay = async (w, h) => { await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(350); return p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), outp = {};
  for (const sub of ['spur', 'chorus', 'hall', 'echo', 'master']) {
    ED.tab = 'fx'; ED.sub.fx = sub; openEditor(); await wait(250);
    const pg = document.querySelector('#synthSheet .pg-fxg'); if (!pg) { outp[sub] = null; continue; }
    const kids = [...pg.children].filter(k => !/tktrk|tktrm/.test(k.className)), rect = k => { const r = k.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)]; };
    const a = kids.map(rect), mine = [...pg.querySelectorAll('.tktrk,.tktrm')].map(k => { const r = k.getBoundingClientRect(), pr = pg.getBoundingClientRect(); return {h: r.height, in: r.bottom <= pr.bottom + 1 && r.right <= pr.right + 1, vis: r.width > 0}; });
    const css = document.getElementById('tkt-css'), par = css.parentNode; css.remove(); const ex = [...pg.querySelectorAll('.tktrk,.tktrm')]; ex.forEach(e => e.style.display = 'none'); await wait(60);
    const bb = kids.map(rect); par.appendChild(css); ex.forEach(e => e.style.display = '');
    const moved = a.filter((r, k) => Math.abs(r[0] - bb[k][0]) > 1 || Math.abs(r[1] - bb[k][1]) > 1).length;   // Lage (links/oben) jedes vorhandenen Elements
    outp[sub] = {mine, moved, sc: pg.scrollHeight > pg.clientHeight + 2};
  }
  return outp;
}); };
const P7 = await lay(428, 926);
ok('hochkant: [RACK] auf allen FX-Seiten, [RAUM ▾] auf HALL, ≥ 44 px, nichts Vorhandenes verschiebt sich', Object.values(P7).every(x => x && x.moved === 0 && x.mine.length >= 1 && x.mine.every(m => m.h >= 44 && m.vis)) && P7.hall.mine.length === 2, P7);
await p.evaluate(() => { ED.tab = 'fx'; ED.sub.fx = 'hall'; openEditor(); });
const L7 = await lay(926, 428);
ok('quer: dieselben Knöpfe ≥ 44 px, in der Seite, nichts Vorhandenes verschiebt sich', Object.values(L7).every(x => x && x.moved === 0 && x.mine.every(m => m.h >= 44 && m.vis && m.in)), L7);
await p.evaluate(async () => { ED.tab = 'fx'; ED.sub.fx = 'hall'; openEditor(); await new Promise(r => setTimeout(r, 250)); SYNQUENZER.tkt.room('oel', 75); const b = document.querySelector('.tktrm'); if (b) b.click(); });
await p.waitForTimeout(300);
await p.screenshot({path: path.join(out, 'takt-hall-raum-quer.png')});
const L7b = await p.evaluate(() => { const pop = UI.pop && UI.pop.el, bs = pop ? [...pop.querySelectorAll('button[data-tkr]')] : []; return {open: !!(UI.pop && UI.pop.name === 'tktroom'), n: bs.length, h: bs.every(b => b.getBoundingClientRect().height >= 43.5), names: bs.map(b => b.textContent).join('|')}; });
ok('RAUM-Wahl (quer): Standard · Studio · Kammer · Saal · Kirche · Öltank + 8/30/75 s, alles ≥ 44 px', L7b.open && L7b.n === 9 && L7b.h, L7b);
await p.evaluate(() => { closePop(); SYNQUENZER.tkt.room(''); try { closeEditor(); } catch (e) {} });

/* ---------- 8) Altes Projekt lädt gleich (additiv) ---------- */
const A8 = await p.evaluate(() => { SYNQUENZER.loadDemo(); const a = JSON.stringify(cleanClip(S.tracks[0].clips[0])), b = JSON.stringify(normFxBus(defaultFxBus())); return {clip: !a.includes('tkt'), fx: !b.includes('tkt')}; });
ok('ohne neue Felder byte-gleich (kein clip.tkt, kein hall.tktRaum)', A8.clip && A8.fx, A8);

ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(path.join(out, 'takt-test-ergebnis.json'), JSON.stringify(res, null, 1));
console.log((res.every(r => r.pass) ? 'OK' : 'FEHLER') + ' gesamt ' + res.filter(r => r.pass).length + '/' + res.length);
await b.close();
