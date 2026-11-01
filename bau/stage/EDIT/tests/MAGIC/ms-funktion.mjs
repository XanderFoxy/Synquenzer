// MAGIC Funktionstest: Wischen C-Dur / a-Moll, Terzen, Terz+Quinte, Zurückwischen, Pause, Pause +, Akkord-Umkehrung, Glatt, Undo/Redo, Speichern/Laden, Ripple
import { open, roll, swipe, line, xy, clip, inScale, ok, done } from './lib.mjs';
const {b, p, errs} = await open();
const ms = (fn, arg) => p.evaluate(({fn, arg}) => { const ed = window.SYNQUENZER.rollApi(); return new Function('ed', 'arg', fn)(ed, arg); }, {fn, arg});
const on = async (tool, mode, center = 66, fold = false) => ms(`ed.setFold(arg.fold); ed.ms.setOn(true); ed.ms.setTool(arg.tool); if (arg.mode) ed.ms.setMode(arg.mode); ed.centerOn(arg.center); return ed.ms.state;`, {tool, mode, center, fold});
const deg = (n, key) => { const S = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10]}[key.scale], i = S.indexOf(((n - key.root) % 12 + 12) % 12); return Math.floor((n - key.root) / 12) * 7 + i; };

// 1) C-Dur, 1/16, über einen Takt
for (const key of [{root: 0, scale: 'ionian'}, {root: 9, scale: 'aeolian'}]) {
  await roll(p, key); await on('msWipe', 'scale');
  const a = await xy(p, .05, 60), c = await xy(p, 3.95, 74);
  await swipe(p, line(a, c, 30), {stepMs: 8});
  const ns = (await clip(p)).notes;
  ok(ns.length === 16, `${key.root}/${key.scale}: 16 Noten aus einem Takt-Zug (${ns.length})`);
  ok(ns.every(n => Math.abs(n.t / .25 - Math.round(n.t / .25)) < 1e-6 && Math.abs(n.d - .25) < 1e-6), 'alle auf dem 1/16-Raster, Länge 1/16');
  ok(ns.every(n => inScale(n.n, key)), 'nur Tonart-Töne: ' + ns.map(n => n.n).join(','));
  ok(ns.every((n, i) => !i || n.n >= ns[i - 1].n), 'steigend wie der Finger');
  const u = await p.evaluate(() => { const Q = window.SYNQUENZER; const n0 = Q.getClip(0, 0).notes.length; Q.undo(); const n1 = Q.getClip(0, 0).notes.length; Q.redo(); return [n0, n1, Q.getClip(0, 0).notes.length]; });
  ok(u[0] === 16 && u[1] === 0 && u[2] === 16, 'ein Undo-Schritt je Wischzug, Redo stellt her ' + u);
}
// 1b) Raster 1/8: 8 Noten
await roll(p, {root: 0, scale: 'ionian'}); await on('msWipe', 'scale');
await p.evaluate(() => window.SYNQUENZER.rollApi().setGrid('1/8'));
{ const a = await xy(p, .05, 60), c = await xy(p, 3.95, 67); await swipe(p, line(a, c, 20), {stepMs: 8});
  const ns = (await clip(p)).notes; ok(ns.length === 8 && ns.every(n => Math.abs(n.t / .5 - Math.round(n.t / .5)) < 1e-6), 'Raster 1/8 → 8 Noten auf Achteln (' + ns.length + ')'); }
await p.evaluate(() => window.SYNQUENZER.rollApi().setGrid('1/16'));
// 1c) schnell gewischt (nur 3 Punkte): Zellen gefüllt, keine Löcher
await roll(p, {root: 0, scale: 'ionian'}); await on('msWipe', 'scale');
{ const a = await xy(p, .05, 60), c = await xy(p, 3.95, 72); await swipe(p, [a, {x: (a.x + c.x) / 2, y: (a.y + c.y) / 2}, c], {stepMs: 0});
  const ns = (await clip(p)).notes; ok(ns.length === 16 && ns.every(n => inScale(n.n, {root: 0, scale: 'ionian'})), 'schneller Zug (3 Punkte) → 16 Noten ohne Loch (' + ns.length + ')'); }
// 1d) zurückwischen nimmt Noten des Zugs weg
await roll(p, {root: 0, scale: 'ionian'}); await on('msWipe', 'scale');
{ const a = await xy(p, .05, 64), c = await xy(p, 3.95, 64), m = await xy(p, 1.9, 64); await swipe(p, [...line(a, c, 20), ...line(c, m, 10)], {stepMs: 8});
  const ns = (await clip(p)).notes; ok(ns.length === 8 && ns.every(n => n.n === 64), 'zurück bis Schlag 2 → 8 Noten bleiben (' + ns.length + ')'); }
// 2) Terzen
await roll(p, {root: 0, scale: 'ionian'}); await on('msWipe', 'third', 72, true);
{ const a = await xy(p, .05, 60), c = await xy(p, 3.95, 84); await swipe(p, line(a, c, 30), {stepMs: 8});
  const ns = (await clip(p)).notes, K = {root: 0, scale: 'ionian'}, d0 = deg(ns[0].n, K);
  ok(ns.length === 16 && ns.every(n => inScale(n.n, K) && (deg(n.n, K) - d0) % 2 === 0), 'Terzen: nur Terzen-Kette ab dem ersten Ton: ' + ns.map(n => n.n).join(','));
  const st = [...new Set(ns.map(n => n.n))]; ok(st.every((n, i) => !i || deg(n, K) - deg(st[i - 1], K) === 2), 'Terzen: Nachbarn je eine Terz auseinander'); }
// 2b) Terz+Quinte in a-Moll
await roll(p, {root: 9, scale: 'aeolian'}); await on('msWipe', 'triad', 70, true);
{ const a = await xy(p, .05, 57), c = await xy(p, 3.95, 84); await swipe(p, line(a, c, 30), {stepMs: 8});
  const ns = (await clip(p)).notes, pcs = new Set(ns.map(n => n.n % 12));
  ok(ns.length === 16 && [...pcs].every(x => [9, 0, 4].includes(x)), 'Terz+Quinte (a-Moll, Start A): nur A C E: ' + ns.map(n => n.n).join(',')); }
// 2c) Tonart manuell: D-Dur
await roll(p, {root: 0, scale: 'ionian'}); await on('msWipe', 'scale');
await ms(`ed.ms.setKey({root: 2, scale: 'ionian'}); return 0;`);
{ const a = await xy(p, .05, 60), c = await xy(p, 3.95, 74); await swipe(p, line(a, c, 30), {stepMs: 8});
  const ns = (await clip(p)).notes; ok(ns.length === 16 && ns.every(n => inScale(n.n, {root: 2, scale: 'ionian'})) && ns.some(n => [1, 6].includes(n.n % 12)), 'manuelle Tonart D-Dur: ' + ns.map(n => n.n).join(',')); }
// 3) Pause: Zelle 4 tippen
const RUN = Array.from({length: 16}, (_, i) => ({t: i * .25, d: .25, n: 60 + [0, 2, 4, 5, 7, 9, 11, 12][i % 8], v: .8}));
await roll(p, {root: 0, scale: 'ionian'}, RUN); await on('msRest', null);
{ const q = await xy(p, 1.1, 64); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(80);
  const ns = (await clip(p)).notes; ok(ns.length === 15 && !ns.some(n => Math.abs(n.t - 1) < 1e-6) && ns.every((n, i) => RUN.some(r => r.t === n.t && r.n === n.n)), 'Pause tippen: Zelle 1.2.1 still, Rest unverändert');
  const a = await xy(p, 2.1, 64), c = await xy(p, 2.9, 64); await swipe(p, line(a, c, 8), {stepMs: 8});
  const n2 = (await clip(p)).notes; ok(n2.length === 11, 'Pause ziehen über 4 Zellen → 11 Noten (' + n2.length + ')');
  await p.evaluate(() => window.SYNQUENZER.undo()); ok((await clip(p)).notes.length === 15, 'Undo der Pause-Geste: ein Schritt'); }
// 3b) Pause +: bei Schlag 2 eine Zelle einschieben
await roll(p, {root: 0, scale: 'ionian'}, RUN); await on('msIns', null);
{ const q = await xy(p, 1.1, 64); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(80);
  const c = await clip(p), ns = c.notes;
  ok(ns.length === 16 && !ns.some(n => Math.abs(n.t - 1) < 1e-6) && ns.filter(n => n.t > 1).every(n => RUN.some(r => Math.abs(r.t + .25 - n.t) < 1e-6 && r.n === n.n)) && c.len === 2, 'Pause +: alles ab 1.2 eine Zelle später, im Raster, Clip 2 Takte (' + c.len + ')');
  await p.evaluate(() => window.SYNQUENZER.undo()); const u = await clip(p); ok(u.len === 1 && u.notes.length === 16 && u.notes.every((n, i) => Math.abs(n.t - RUN[i].t) < 1e-6), 'Undo Pause + stellt Clip und Länge her'); }
// 4) Akkorde: C-Dur Dreiklang, Am, F, G
const CH = (t, ns) => ns.map(n => ({t, d: 1, n, v: .8}));
await roll(p, {root: 0, scale: 'ionian'}, [...CH(0, [60, 64, 67]), ...CH(1, [57, 60, 64]), ...CH(2, [65, 69, 72]), ...CH(3, [67, 71, 74])]); await on('msChord', null, 66);
{ const cs = await ms(`return ed.ms.chords();`); ok(cs.map(c => c.name).join(' ') === 'C Am F G', 'Akkorderkennung: ' + cs.map(c => c.name).join(' '));
  const q = await xy(p, .5, 64); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(60);
  ok((await p.evaluate(() => window.SYNQUENZER.rollApi().state.sel)) === 3, 'Akkord antippen wählt seine 3 Noten');
  const tapB = async t => { await p.evaluate(t => { const b = [...window.SYNQUENZER.rollApi().ms.el.row.querySelectorAll('button')].find(x => x.textContent.trim() === t); b.click(); }, t); await p.waitForTimeout(60); };
  const c0 = async () => (await clip(p)).notes.filter(n => n.t === 0).map(n => n.n).sort((a, b) => a - b).join(',');
  await tapB('Umk. ▲'); ok(await c0() === '64,67,72', '▲ → 1. Umkehrung E G C: ' + await c0());
  ok((await ms(`return ed.ms.chords()[0].name;`)) === 'C/E', 'Name nach ▲: C/E');
  await tapB('Umk. ▲'); ok(await c0() === '67,72,76', '▲ → 2. Umkehrung G C E: ' + await c0());
  await tapB('Umk. ▼'); ok(await c0() === '64,67,72', '▼ zurück: ' + await c0());
  const others = (await clip(p)).notes.filter(n => n.t > 0).map(n => n.n).join(','); ok(others === '57,60,64,65,69,72,67,71,74', 'andere Akkorde unberührt (Auswahl)');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.undo(); Q.undo(); Q.undo(); }); ok(await c0() === '60,64,67', 'drei Undo → Grundstellung');
  // Bereich über Takt-Auswahl: alle (keine Auswahl) → Glatt
  await p.evaluate(() => window.SYNQUENZER.rollApi().select([]));
  const cost = ns => { const g = [0, 1, 2, 3].map(t => ns.filter(n => n.t === t).map(n => n.n).sort((a, b) => a - b)); let s = 0; for (let i = 1; i < 4; i++) for (let j = 0; j < 3; j++) s += Math.abs(g[i][j] - g[i - 1][j]); return s; };
  const before = cost((await clip(p)).notes); await tapB('Glatt'); const after = cost((await clip(p)).notes);
  ok(after < before, `Glatt: Sprünge ${before} → ${after}`);
  const names = (await ms(`return ed.ms.chords().map(c => c.name.split('/')[0]).join(' ');`)); ok(names === 'C Am F G', 'Glatt: Akkorde bleiben dieselben: ' + names);
}
// 5) Speichern / Laden
await roll(p, {root: 9, scale: 'aeolian'}); await on('msWipe', 'triad', 70, true);
{ const a = await xy(p, .05, 57), c = await xy(p, 3.95, 81); await swipe(p, line(a, c, 30), {stepMs: 8});
  const r = await p.evaluate(() => { const Q = window.SYNQUENZER; const before = JSON.stringify(Q.getClip(0, 0)); const txt = Q.serialize(); Q.newProject({init: true}); Q.importJSON(txt); return [before, JSON.stringify(Q.getClip(0, 0))]; });
  const A = JSON.parse(r[0]), B = JSON.parse(r[1]); ok(A.notes.length === 16 && JSON.stringify(A.notes) === JSON.stringify(B.notes) && A.len === B.len, 'Speichern → Laden: Noten gleich (' + B.notes.length + ')'); }
// 6) Ripple: Takt-Leiste ab Takt 2 halten + 1 Takt nach rechts ziehen
await roll(p, {root: 0, scale: 'ionian'}, [{t: 0, d: 1, n: 60, v: .8}, {t: 4, d: 1, n: 62, v: .8}, {t: 8, d: 1, n: 64, v: .8}], 3); await on('msWipe', 'scale');
{ await p.evaluate(() => window.SYNQUENZER.rollApi().fitView('clip')); await p.waitForTimeout(60);
  const r0 = await p.evaluate(() => window.SYNQUENZER.rollApi()._ruler(5)), r1 = await p.evaluate(() => window.SYNQUENZER.rollApi()._ruler(9));
  const cdp = await p.context().newCDPSession(p); const T = (x, y) => [{x, y, id: 2, radiusX: 2, radiusY: 2, force: 1}];
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: T(r0.x, r0.y)}); await p.waitForTimeout(450);
  const armed = await ms(`return ed.ms.state.armed;`);
  for (const pt of line(r0, r1, 12)) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: T(pt.x, pt.y)}); await p.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(80);
  const c = await clip(p); ok(armed, 'Halten 0,35 s scharf');
  ok(c.notes.map(n => n.n + '@' + n.t).join(' ') === '60@0 62@8 64@12' && c.len === 4, 'Ripple: ab Takt 2 alles +1 Takt, Clip 4 Takte: ' + c.notes.map(n => n.n + '@' + n.t).join(' ') + ' len ' + c.len);
  await p.evaluate(() => window.SYNQUENZER.undo()); const u = await clip(p); ok(u.notes.map(n => n.t).join() === '0,4,8' && u.len === 3, 'Undo Ripple');
  // ohne Magic-Zeile: Halten + Ziehen = scrollen wie bisher (keine Änderung)
  await ms(`ed.ms.setOn(false); return 0;`);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: T(r0.x, r0.y)}); await p.waitForTimeout(450);
  for (const pt of line(r0, r1, 12)) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: T(pt.x, pt.y)}); await p.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(80);
  ok((await clip(p)).notes.map(n => n.t).join() === '0,4,8', 'Magic aus: Takt-Leiste unverändert (kein Ripple)');
  await cdp.detach(); }
// 7) Magic aus: ✎-Werkzeug wie vorher
await roll(p, {root: 0, scale: 'ionian'}); await ms(`ed.centerOn(66); return 0;`);
{ const st = await ms(`return {tool: ed.state.tool, on: ed.ms.state.on, row: getComputedStyle(ed.ms.el.row).display};`);
  ok(st.tool === 'draw' && !st.on && st.row === 'none', 'Editor öffnet wie bisher (✎, Magic-Zeile zu)');
  const q = await xy(p, 1.1, 61); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(60);
  const ns = (await clip(p)).notes; ok(ns.length === 1 && ns[0].n === 61 && ns[0].t === 1, '✎ Tippen setzt Note wie bisher (auch außerhalb der Tonart)'); }
// 8) Song-Melodie: Magic auch dort, Tonart = Tonart des Song-Takts
{ const r = await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setClip(1, 0, {len: 1, key: {root: 7, scale: 'ionian', src: 'manual'}, notes: [{t: 0, d: 4, n: 55, v: .8}]});
    Q.songFromChain([{scene: 0, bars: 2}]); Q.openMelody(); const ed = Q.rollApi(); return {ms: !!ed.ms, key: ed.ms ? ed.ms.keyAt(0) : null}; });
  ok(r.ms, 'Song-Melodie: Magic-Zeile vorhanden, Tonart der Stelle ' + JSON.stringify(r.key));
  await p.evaluate(() => { const ed = window.SYNQUENZER.rollApi(); ed.ms.setOn(true); ed.centerOn(66); });
  const a = await xy(p, .05, 60), c = await xy(p, 3.95, 72); await swipe(p, line(a, c, 30), {stepMs: 8});
  const mel = await p.evaluate(() => { const Q = window.SYNQUENZER, s = Q.project().song, m = s && s.mel && s.mel[s.melodyTrack]; return m ? m.notes : []; });
  ok(mel.length === 16 && mel.every(n => inScale(n.n, r.key)), 'Song-Melodie: 16 Noten in der Tonart der Stelle ' + mel.map(n => n.n).join(','));
  await p.evaluate(() => window.SYNQUENZER.undo());
  const mel2 = await p.evaluate(() => { const Q = window.SYNQUENZER, s = Q.project().song, m = s && s.mel && s.mel[s.melodyTrack]; return m ? m.notes.length : 0; });
  ok(mel2 === 0, 'Song-Melodie: ein Undo-Schritt'); }
ok(errs.length === 0, 'keine Konsolenfehler ' + JSON.stringify(errs));
await b.close(); done();
