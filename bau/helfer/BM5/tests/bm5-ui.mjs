// BM5-03 … BM5-09: operation of the panel with CDP touch (single and multi finger). Usage: node bm5-ui.mjs [format]
import {launch, open, sleep, VP, APP, touch} from './lib.mjs';
const FMT = process.argv[2] || 'XW';
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else if (process.env.V) console.log('PASS ' + m); };
const br = await launch(); const [w, h] = VP[FMT]; const p = await open(br, w, h, APP);
await p.evaluate(async () => { SYNQUENZER.newProject(); await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'bm'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await sleep(900);
const info = () => p.evaluate(() => SYNQUENZER.bmPanel());
const bm = () => p.evaluate(() => JSON.parse(JSON.stringify(S.tracks[0].sound.p.bm)));
const lcd = () => p.evaluate(() => { const L = ED.lcd; return L ? L.textContent.replace(/\s+/g, ' ').trim() : ''; });
const und = () => p.evaluate(() => SYNQUENZER.history ? null : null);
const undoN = () => p.evaluate(() => UNDO.length);
const Z = async id => { const I = await info(); const r = I.zones[id].rect; return [r[0] + r[2] / 2, r[1] + r[3] / 2]; };
let pid = 10;
async function tapK(id, hold = 40) { const [x, y] = await Z(id), k = ++pid; await touch(p, 'touchStart', [[x, y, k]]); await sleep(hold); await touch(p, 'touchEnd', []); await sleep(50); }
async function drag(id, pts, dt = 12) { const [x, y] = await Z(id), k = ++pid; await touch(p, 'touchStart', [[x, y, k]]); await sleep(dt); for (const [dx, dy] of pts) { await touch(p, 'touchMove', [[x + dx, y + dy, k]]); await sleep(dt); } await touch(p, 'touchEnd', []); await sleep(80); }
const vert = (px, step) => { const o = []; for (let d = step; d <= px; d += step) o.push([0, -d]); return o; };
const undo = async () => { await p.evaluate(() => SYNQUENZER.undo()); await sleep(300); await p.evaluate(() => { if (typeof hideToast === 'function') hideToast(); }); await sleep(250); };
// BM5-03 Bedienlogik
await tapK('osc1'); let I = await info();
ok(I.mode === 'osc1' && I.param === 'MASK' && I.leds.osc1 === 1, 'Osc1 → MASK, LED ' + JSON.stringify([I.mode, I.param]));
ok(I.params.join(' ') === 'MASK SEMI TUNE START SPD', 'Folge Osc1 ' + I.params.join(' '));
await sleep(700); I = await info(); ok(I.disp.trim() === '007', 'Anzeige Maske dreistellig: ' + I.disp);
ok(/OSC1/.test(await lcd()) && /MASK · 007 · Maske 7/.test(await lcd()), 'LCD-Zeile ' + await lcd());
await tapK('osc1'); I = await info(); ok(I.param === 'SEMI', 'erneut = SEMI');
await tapK('parR'); I = await info(); ok(I.param === 'TUNE', 'Param » = TUNE');
await tapK('parL'); await tapK('parL'); I = await info(); ok(I.param === 'MASK', 'Param « « = MASK');
await tapK('parL'); I = await info(); ok(I.param === 'SPD', 'Param « am Anfang = letzter (SPD)');
await tapK('osc1'); I = await info(); ok(I.param === 'MASK', 'erneut nach SPD = MASK');
// name > 4 chars runs through (START): first 4, later window, then the value
await tapK('parR'); await tapK('parR'); await tapK('parR'); I = await info(); ok(I.param === 'START' && I.disp === 'STAR', 'START läuft: ' + I.disp);
await sleep(200); I = await info(); ok(I.disp === 'TART', 'Laufschrift 2. Fenster: ' + I.disp);
await sleep(600); I = await info(); ok(I.disp.trim() === '0', 'danach Wert: ' + I.disp);
// BM5-07 Value: slow 1 step / 8 px; fast up to × 8; fine sideways; double tap = INIT
await tapK('osc2'); await tapK('osc1'); await sleep(50);   // MASK
let u0 = await undoN(); let b0 = await bm();
await drag('value', vert(80, 2), 14); let b1 = await bm();
ok(b1.a.o1.m - b0.a.o1.m === 10, 'langsam 80 px = 10 Schritte: ' + (b1.a.o1.m - b0.a.o1.m));
ok(await undoN() === u0 + 1, 'eine Geste = ein Undo ' + u0 + '→' + await undoN());
I = await info(); ok(I.disp.trim() === '017', 'Anzeige 017: ' + I.disp);
await drag('value', [[0, -20], [0, -40], [0, -60], [0, -80]], 4); let b2 = await bm();
const fast = b2.a.o1.m - b1.a.o1.m; ok(fast >= 25 && fast <= 80, 'schnell 80 px = ' + fast + ' Schritte (× bis 8)');
const b3a = await bm(); await drag('value', [[25, 0], [50, 0], [52, -8], [52, -16], [52, -24], [52, -32]], 14); const b3 = await bm();
ok(b3.a.o1.m - b3a.a.o1.m === 1, 'Fein (seitlich weg): 32 px = 1 Schritt: ' + (b3.a.o1.m - b3a.a.o1.m));
await tapK('value', 20); await tapK('value', 20); ok((await bm()).a.o1.m === 7, 'Doppeltipp = INIT 007');
await undo(); ok((await bm()).a.o1.m === b3.a.o1.m, 'Undo Doppeltipp');
// circling: clockwise arc increases
const [kx, ky] = await Z('value'); { const k = ++pid, st = [[kx, ky - 18]]; for (let a = -90; a <= 180; a += 10) st.push([kx + 30 * Math.cos(a * Math.PI / 180), ky + 30 * Math.sin(a * Math.PI / 180)]);
  const v0 = (await bm()).a.o1.m; await touch(p, 'touchStart', [[st[0][0], st[0][1], k]]); for (const q of st) { await touch(p, 'touchMove', [[q[0], q[1], k]]); await sleep(16); } await touch(p, 'touchEnd', []); await sleep(60);
  const v1 = (await bm()).a.o1.m; ok(v1 > v0, 'kreisend im Uhrzeigersinn erhöht: ' + v0 + '→' + v1); }
// one-parameter mode: Param changes the value
await tapK('noise'); I = await info(); ok(I.params.length === 1 && I.param === 'FREQ', 'Noise = FREQ');
await tapK('parL'); ok((await bm()).a.n.fr === 98, 'Noise « = Wert −1');
await tapK('parR'); ok((await bm()).a.n.fr === 99, 'Noise » = Wert +1');
// all mode sequences (§3.3)
const SEQ = {filter: 'CUTF RESO MODE TRK', lfo1: 'AMT SPD DEST WAVE DLAY DCAY', lfo2: 'AMT SPD DEST WAVE DLAY DCAY', fx: '1BAL 1TYP 2BAL 2TYP SYNC', arp: 'TYPE SPD HOLD TRIG', pitch: 'START SPD END',
  mod: 'V-DEST V-AMT M-DEST M-AMT AT-DEST AT-AMT', general: 'MODE VOL SEMI PORT PANS RATE', global: 'TEMP SEMI TUNE VEL CURVE AT CURVE PITCH BEND TIME FX'};
for (const [k, v] of Object.entries(SEQ)) { await tapK(k); I = await info(); ok(I.mode === k && I.params.join(' ') === v, 'Folge ' + k + ': ' + I.params.join(' ')); }
// slots: LFO1 AMT != 0 → DEST2 AMT2 appear (§1.9)
await tapK('lfo1'); await drag('value', vert(16, 2), 14); I = await info(); ok(I.params.join(' ') === 'AMT SPD DEST WAVE DLAY DCAY DEST2 AMT2', 'LFO1 Platz 2 erscheint: ' + I.params.join(' '));
await tapK('mod'); await tapK('parR'); await drag('value', vert(8, 2), 14); I = await info(); ok(I.params.join(' ').startsWith('V-DEST V-AMT V-DEST2 V-AMT2 M-DEST'), 'Mod V-Platz 2: ' + I.params.join(' '));
// BM5-04 Seq/Env
await tapK('seq'); I = await info(); ok(I.env && I.leds.seq === 1, 'Seq/Env an, LED');
await tapK('osc1'); I = await info(); ok(I.params.join(' ') === 'L A D S R LOOP' && I.path === 'o1.e.l', 'Env Osc1 = L A D S R LOOP');
for (const k of ['osc2', 'noise', 'filter']) { await tapK(k); I = await info(); ok(I.params.join(' ') === 'L A D S R LOOP' && I.path.endsWith('.e.l'), 'Env ' + k); }
await tapK('octR'); await sleep(200); ok(await p.evaluate(() => R.playing), '» unter Seq = ▶');
I = await info(); ok(I.leds.octR === 1, '▶-LED');
await tapK('octR'); await sleep(200); ok(!(await p.evaluate(() => R.playing)), '» erneut = ■');
await tapK('octL'); await sleep(200); const rs = await p.evaluate(() => rec.state); ok(rs !== 'off', '« unter Seq = ● (' + rs + ')');
await tapK('octL'); await sleep(300); await p.evaluate(() => { if (rec.state !== 'off') recPress(); if (R.playing) stop(); }); await sleep(200);
await tapK('seq'); I = await info(); ok(!I.env, 'Seq/Env aus');
const oc0 = await p.evaluate(() => S.tracks[0].kbOct || 4); await tapK('octR'); ok(await p.evaluate(() => S.tracks[0].kbOct) === oc0 + 1, 'Octave » +1');
await tapK('octL'); ok(await p.evaluate(() => S.tracks[0].kbOct) === oc0, 'Octave « −1');
// BM5-05 Mehrfach-Bearbeitung: hold Osc1, tap Osc2 → both lit, change for both, one undo; single tap ends
{ const [x1, y1] = await Z('osc1'), [x2, y2] = await Z('osc2'); await touch(p, 'touchStart', [[x1, y1, 91]]); await sleep(60); await touch(p, 'touchStart', [[x1, y1, 91], [x2, y2, 92]]); await sleep(60); await touch(p, 'touchEnd', []); await sleep(80); }
I = await info(); ok(I.multi && I.multi.join() === 'osc1,osc2' && I.leds.osc1 === 1 && I.leds.osc2 === 1, 'Mehrfach: beide leuchten ' + JSON.stringify(I.multi));
u0 = await undoN(); await drag('value', vert(40, 2), 14); b0 = await bm();
ok(b0.a.o1.m === b0.a.o2.m && b0.a.o1.m !== 7, 'Änderung an beiden: ' + b0.a.o1.m + '/' + b0.a.o2.m);
ok(await undoN() === u0 + 1, 'Mehrfach ein Undo');
await undo(); b1 = await bm(); ok(b1.a.o2.m === 7, 'Undo stellt beide zurück ' + b1.a.o1.m + '/' + b1.a.o2.m);
await tapK('filter'); I = await info(); ok(!I.multi && I.mode === 'filter', 'Einzel-Tipp beendet Mehrfach');
// Env: hold Noise, tap Filter → envelopes of both
await tapK('seq');
{ const [x1, y1] = await Z('noise'), [x2, y2] = await Z('filter'); await touch(p, 'touchStart', [[x1, y1, 93]]); await sleep(60); await touch(p, 'touchStart', [[x1, y1, 93], [x2, y2, 94]]); await sleep(60); await touch(p, 'touchEnd', []); await sleep(80); }
await drag('value', vert(24, 2), 14); b0 = await bm(); ok(b0.a.n.e.l === b0.a.f.e.l && b0.a.n.e.l > 0, 'Env Mehrfach: Noise-L = Filter-L = ' + b0.a.n.e.l);
await tapK('seq');
// BM5-06 Voice / Layer / Split / Init / Write / Global / Compare
await tapK('voice'); I = await info(); ok(I.mode === 'voice' && I.leds.voice === 1, 'Voice');
u0 = await undoN(); await tapK('parR'); I = await info(); ok(I.disp.trim() === 'P00' && (await p.evaluate(() => S.tracks[0].sound.name)) === 'INIT', 'Voice » = P00 geladen (' + I.disp + ')');
ok(await undoN() === u0 + 1, 'Voice-Wechsel ein Undo');
await tapK('layer'); I = await info(); b0 = await bm(); ok(b0.ly.md === 'lay' && I.view === 'b' && I.disp.trim() === '----' && I.mode === 'layer', 'Layer an, zeigt B');
await drag('value', vert(8, 2), 14); b0 = await bm(); I = await info(); ok(b0.b && b0.b.o1.m === 7 && I.disp.trim() === 'P00' && I.ab === 'b', 'Layer: Value wählt P00 → Kopie nach B ' + I.disp);
await tapK('parR'); I = await info(); ok(I.param === 'SEMI', 'Layer Param » = SEMI');
await tapK('layer'); I = await info(); ok(I.param === 'BAL', 'Layer erneut = BAL');
await tapK('layer'); await tapK('layer'); I = await info(); ok(I.param === 'TUNE', 'Layer … TUNE');
await tapK('osc1'); await drag('value', vert(16, 2), 14); b0 = await bm(); ok(b0.b.o1.m === 9 && b0.a.o1.m === 7, 'Edit wirkt auf B (Layer gezeigt): B ' + b0.b.o1.m + ' A ' + b0.a.o1.m);
await tapK('voice'); I = await info(); ok(I.ab === 'a' && I.mode === 'voice', 'Voice einmal = Grundklang');
await sleep(130); const bl1 = (await info()).leds.layer; ok(bl1 === 2, 'Layer blinkt (aktiv, nicht gezeigt) ' + bl1);
await tapK('voice'); b0 = await bm(); ok(b0.ly.md === 'ein', 'Voice zweimal = Layer aus');
// Split: hold Split + key on the app keyboard = split point (one undo)
await tapK('split'); b0 = await bm(); ok(b0.ly.md === 'spl', 'Split an');
{ const [xs, ys] = await Z('split'); const kr = await p.evaluate(() => { const r = EL.kb.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  await touch(p, 'touchStart', [[xs, ys, 95]]); await sleep(80); u0 = await undoN();
  await touch(p, 'touchStart', [[xs, ys, 95], [kr[0] + kr[2] * .55, kr[1] + kr[3] * .85, 96]]); await sleep(120); await touch(p, 'touchEnd', []); await sleep(100); }
b0 = await bm(); ok(b0.ly.sp !== 60 && await undoN() === u0 + 1, 'Splitpunkt gesetzt: ' + b0.ly.sp + ', ein Undo');
await tapK('voice'); await tapK('voice');
// Init: once = choice, Value/Param, Init confirms; twice = saw
await tapK('osc1'); await drag('value', vert(40, 2), 14);
await tapK('init'); I = await info(); ok(I.mode === 'init' && I.disp.trim() === '1OSC', 'Init: Wahl 1OSC (' + I.disp + ')');
await tapK('parR'); I = await info(); ok(I.initSel === '2osc', 'Init » = 2OSC');
u0 = await undoN(); await tapK('init'); b0 = await bm(); ok(b0.a.o2.e.l === 99 && b0.a.o1.tu === -3 && b0.a.o2.tu === 3 && await undoN() === u0 + 1, 'Init 2OSC bestätigt, ein Undo');
await tapK('init'); await tapK('init'); b0 = await bm(); ok(b0.a.o1.m === 7 && b0.a.o2.e.l === 0, 'Init zweimal = einfache Säge');
// Write: U-place, name field, Write → DONE
await tapK('osc1'); await drag('value', vert(24, 2), 14);
await tapK('write'); I = await info(); ok(I.mode === 'write' && I.disp.trim() === 'U00', 'Write → U00');
await tapK('write'); await sleep(200); const pop = await p.evaluate(() => !!document.querySelector('.pop input.tin'));
ok(pop, 'Write erneut = Namensfeld');
await p.evaluate(() => { const i = document.querySelector('.pop input.tin'); i.value = 'Mein Bit'; }); 
await p.evaluate(() => { const b = [...document.querySelectorAll('.pop button')].find(x => x.textContent === 'Write'); b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); b.dispatchEvent(new PointerEvent('pointerup', {bubbles: true})); b.click(); });
await sleep(500); I = await info(); const own = await p.evaluate(() => LIB.lib.all().filter(s => s.engine === 'bm').map(s => s.name));
ok(I.disp === 'DONE' && own.includes('Mein Bit'), 'DONE, gesichert auf U00: ' + I.disp + ' ' + own);
await tapK('voice'); I = await info(); ok(I.disp.trim() === 'U00', 'Voice zeigt U00: ' + I.disp);
await tapK('parL'); I = await info(); ok(I.disp.trim() === 'U00', 'Voice « am Ende bleibt U00');
await tapK('parR'); I = await info(); ok(I.disp.trim() === 'P00', 'Voice » = P00');
// Compare
await tapK('osc1'); await drag('value', vert(24, 2), 14); await tapK('voice'); await tapK('parL'); await tapK('osc1'); await drag('value', vert(24, 2), 14);
await tapK('compare'); I = await info(); ok(I.compare && I.disp === 'COMP' && I.leds.compare === 1 && await p.evaluate(() => UI.ab && UI.ab.side === 'B'), 'Compare = COMP, spielt gespeicherten Stand');
await tapK('compare'); I = await info(); ok(!I.compare && await p.evaluate(() => !(UI.ab && UI.ab.side === 'B')), 'Compare erneut beendet');
await tapK('compare'); await tapK('voice'); I = await info(); ok(!I.compare, 'Voice beendet Compare');
// Global writes the sound's gl
await tapK('global'); await drag('value', vert(8, 2), 14); b0 = await bm(); ok(b0.gl.tm === 'arab', 'Global TEMP → ARAB');
// BM5-09 geändert-Punkt sofort
await tapK('osc2'); await drag('value', vert(8, 2), 14); ok(await p.evaluate(() => !!document.querySelector('#synthSheet .pv .chg')), '„geändert“-Punkt sofort');
// BM5-08 pressure: 6/36/66 px → 0/.5/1 (AT CURVE 4)
const kr = await p.evaluate(() => { const r = EL.kb.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
const kx0 = kr[0] + kr[2] * .3, ky0 = kr[1] + kr[3] * .9;
await touch(p, 'touchStart', [[kx0, ky0, 97]]); await sleep(60);
const atAt = async dy => { await touch(p, 'touchMove', [[kx0, ky0 - dy, 97]]); await sleep(40); return (await info()).at; };
const a6 = await atAt(6), a36 = await atAt(36), a66 = await atAt(66);
ok(a6 === 0 && Math.abs(a36 - .5) < .01 && a66 === 1, 'Druck 6/36/66 px = ' + [a6, a36, a66]);
ok(await p.evaluate(() => { const b = document.querySelector('.bmat'); return !!b && !b.hidden && b.getBoundingClientRect().height > 10; }), 'Druck-Balken sichtbar');
const notes = await p.evaluate(() => Object.values(R.inputs).map(x => x.note)); ok(notes.length === 1, 'senkrecht: dieselbe Taste ' + notes);
await atAt(36); await touch(p, 'touchMove', [[kx0 + 30, ky0 - 36, 97]]); await sleep(40); ok((await info()).at === 0, 'waagrecht > 20 px = alte Bedienung, Druck 0');
await touch(p, 'touchEnd', []); await sleep(60);
// max over held keys
await touch(p, 'touchStart', [[kx0, ky0, 98]]); await sleep(30); await touch(p, 'touchStart', [[kx0, ky0, 98], [kx0 + kr[2] * .3, ky0, 99]]); await sleep(30);
await touch(p, 'touchMove', [[kx0, ky0 - 66, 98], [kx0 + kr[2] * .3, ky0 - 21, 99]]); await sleep(40); ok((await info()).at === 1, 'Kanal-Druck = Höchstwert');
await touch(p, 'touchEnd', []); await sleep(60); ok((await info()).at === 0, 'Loslassen = 0');
// curves: AT CURVE 1 (γ 2) at 36 px → .25; NONE → 0; 6 → min(1, 3a)
for (const [ac, want] of [[1, .25], [0, 0], [6, 1], [2, Math.pow(.5, 1.6)], [5, Math.pow(.5, .8)]]) {
  await p.evaluate(a => { S.tracks[0].sound.p.bm.gl.ac = a; }, ac);
  await touch(p, 'touchStart', [[kx0, ky0, 100 + ac]]); await sleep(30); await touch(p, 'touchMove', [[kx0, ky0 - 36, 100 + ac]]); await sleep(40);
  const v = (await info()).at; ok(Math.abs(v - want) < .003, 'AT CURVE ' + ac + ': ' + v.toFixed(3) + ' ≈ ' + want.toFixed(3)); await touch(p, 'touchEnd', []); await sleep(40); }
// wheels
const wr = await p.evaluate(() => [...document.querySelectorAll('#bmWh .bmwheel')].map(e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.height]; }));
ok(wr.length === 2, 'zwei Räder');
{ const [x, y] = wr[1]; await touch(p, 'touchStart', [[x, y, 120]]); await touch(p, 'touchMove', [[x, y - 20, 120]]); await sleep(40); await touch(p, 'touchEnd', []); await sleep(60);
  ok(await p.evaluate(() => bmWheelOf(0).mod) > 0, 'MOD-Rad hoch'); }
{ const [x, y] = wr[0]; await touch(p, 'touchStart', [[x, y, 121]]); await touch(p, 'touchMove', [[x, y - 20, 121]]); await sleep(40); const b = await p.evaluate(() => bmWheelOf(0).bend); await touch(p, 'touchEnd', []); await sleep(200);
  ok(b > 0 && await p.evaluate(() => bmWheelOf(0).bend) === 0, 'BEND hoch, federt zurück'); }
ok(await p.evaluate(() => SYNQUENZER.historyCheck ? SYNQUENZER.historyCheck() : true), 'historyCheck');
ok(!p.errs.length, 'keine Konsolenfehler ' + p.errs.slice(0, 3));
console.log(FMT + ': ' + (n - fail) + '/' + n + ' PASS' + (fail ? ', ' + fail + ' FAIL' : ''));
await br.close(); process.exit(fail ? 1 : 0);
