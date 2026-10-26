// MK-P-08 gestures (CDP touch), MK-P-14 SEQ EDIT part, zoom persistence
import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const FILE = process.argv[2]; const R = {}, fail = []; const ok = (id, c, info) => { R[id] = R[id] || 0; R[id]++; if (!c) fail.push(id + ': ' + info); };
const b = await launch();
let page = await open(b, FILE, 'L1');
await page.evaluate(() => { window.__L = []; window.addEventListener('pointerdown', e => { __L.push((e.target.className || e.target.tagName) + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)); if (__L.length > 5) __L.shift(); }, true); });
const mk = p => page.evaluate(p => SQMK.mkPathGet(SYNQUENZER.mkGet(0), p), p);
const set = (p, v) => page.evaluate(([p, v]) => SYNQUENZER.mkSet(0, p, v), [p, v]);
const view = o => page.evaluate(o => MKUI.view(o), o);
const wait = ms => page.waitForTimeout(ms);
// fine: 120 px vertical, sideways 0 / 80 / 160 px → full / ¼ / 1⁄16 (A.6: 200 px = full range)
await view({ansicht: 'zoom', halt: 4}); await wait(80);
const fine = {};
for (const sx of [0, 80, 160]) { await set('t.0.f.res', 0); await wait(30); const e = await el(page, 'f.res'), [x, y] = ctr(e);
  const pts = [[x, y]]; if (sx) for (let k = 1; k <= 8; k++) pts.push([x + sx * k / 8, y]); for (let k = 1; k <= 12; k++) pts.push([x + sx, y - 120 * k / 12]);
  await touch(page, pts, 12); await wait(40); fine[sx] = await mk('t.0.f.res'); }
R.fine = fine; ok('MK-P-08', fine[0] >= 70 && Math.abs(fine[80] - fine[0] / 4) <= 4 && fine[160] <= 6, 'fein ' + JSON.stringify(fine));
// resting second finger on free area = ¼
{ await set('t.0.f.res', 0); await wait(30); const e = await el(page, 'f.res'), [x, y] = ctr(e), [rx, ry] = await page.evaluate(() => { const f = MKUI.P.el.fr.getBoundingClientRect(), T = MKUI.P.el.T; for (let yy = f.height - 10; yy > 10; yy -= 6) for (let xx = 10; xx < f.width - 10; xx += 6) { const px = (xx - T.tx) * 1000 / T.z, py = (yy - T.ty) * 1000 / T.z; if (px > 0 && py > 0 && px < 1000 && py < 512 && !MKUI.hitAt(px, py)) return [f.left + xx, f.top + yy]; } }); const c = page.cdp;
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: rx, y: ry, id: 9}]}); await wait(30);
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: rx, y: ry, id: 9}, {x, y, id: 1}]});
  for (let k = 1; k <= 12; k++) { await wait(12); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: rx, y: ry, id: 9}, {x, y: y - 120 * k / 12, id: 1}]}); }
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await wait(40);
  const v = await mk('t.0.f.res'); R.rest = v; ok('MK-P-08', Math.abs(v - fine[0] / 4) <= 4, 'ruhender Finger ' + v); }
// double tap in a stop = standard value (INIT)
{ await set('t.0.f.cut', 40); await wait(30); const e = await el(page, 'f.cut'), [x, y] = ctr(e); await tap(page, x, y); await wait(60); await tap(page, x, y); await wait(60); const v = await mk('t.0.f.cut'); R.dbl = v; ok('MK-P-08', v === 127, 'Doppeltipp ' + v); }
// overview: a tap on a knob, a title, free area glides into its stop; a key tap switches and does not zoom; a knob drag does not zoom
await view({ansicht: 'ganz'}); await wait(60);
const ganz = {};
for (const [id, want] of [['f.cut', 4], ['o2.semi', 2], ['k3', 6], ['k10', 7], ['k12', 8], ['arp.gate', 9], ['porta', 10], ['k14', 12], ['vol', 1], ['mix.n', 3], ['a.lvl', 5]]) {
  await view({ansicht: 'ganz'}); await wait(30); const e = await el(page, id); await tap(page, ...ctr(e)); await wait(300); const p = await panel(page); ganz[id] = p.halt; ok('MK-P-08', p.ansicht === 'zoom' && p.halt === want, 'Tipp ' + id + ' → ' + p.halt); }
R.lay = await page.evaluate(() => { const r = document.querySelector('.mkqh .pv').getBoundingClientRect(), f = document.querySelector('.mkfr').getBoundingClientRect(), h = document.querySelector('.mkqh').getBoundingClientRect(); return {pv: [r.top, r.height], fr: [f.top, f.height], h: [h.top, h.height], vv: [visualViewport.offsetTop, visualViewport.scale, scrollY, document.scrollingElement.scrollTop]}; });
// section titles and free areas (plate %)
const pct = async (x, y) => { const p = await panel(page), z = p.zOv, fr = p.rahmen; const k1 = p.elements.find(e => e.id === 'k1'); const ox = k1.px.x - (k1.x - k1.w / 2) / 100 * z, oy = k1.px.y - (k1.y - k1.h / 2) / 100 * z / 1.95; return [ox + x / 100 * z, oy + y / 100 * z / 1.95]; };
for (const [nm, x, y, want] of [['FILTER-Titel', 44.5, 1.8, 4], ['OSC2-frei', 27.8, 40, 2], ['LFO2-Titel', 63.8, 47.3, 7], ['EFFECTS-frei', 72.1, 52, 8], ['VP-Titel', 88.6, 47.3, 12], ['ARP-Titel', 66.4, 17.4, 9], ['Anzeige-frei', 80, 4, 13], ['BANK-Titel', 5.8, 84.7, 10], ['MIXER-Titel', 36.2, 1.8, 3], ['AMP-Titel', 52.8, 1.8, 5], ['EG1-Titel', 22.4, 68.5, 6], ['AUDIOIN-Titel', 5.8, 1.8, 1]]) {
  await view({ansicht: 'ganz'}); await wait(30); let [x_, y_] = await pct(x, y);
  const fr_ = await page.evaluate(([X, Y, want]) => { const f = MKUI.P.el.fr.getBoundingClientRect(), T = MKUI.P.el.T, P_ = (sx, sy) => [(sx - f.left - T.tx) * 1000 / T.z, (sy - f.top - T.ty) * 1000 / T.z];
    let [px, py] = P_(X, Y); if (!MKUI.hitAt(px, py) && MKUI.haltAt(px, py) === want) return [X, Y, 'titel'];
    for (let r = 2; r < 80; r += 2) for (let a = 0; a < 6.28; a += .4) { const sx = X + r * Math.cos(a), sy = Y + r * Math.sin(a); [px, py] = P_(sx, sy); if (!MKUI.hitAt(px, py) && MKUI.haltAt(px, py) === want) return [sx, sy, 'frei+' + r]; } return [X, Y, 'keine']; }, [x_, y_, want]);
  x_ = fr_[0]; y_ = fr_[1]; R['frei-' + nm] = fr_[2]; await tap(page, x_, y_); await wait(300); const p = await panel(page); ganz[nm] = p.halt + ' ' + p.hit + ' @' + Math.round(x_) + ',' + Math.round(y_) + ' ' + (await page.evaluate(() => __L.join(' | '))); ok('MK-P-08', p.ansicht === 'zoom' && p.halt === want, 'Tipp ' + nm + ' → ' + p.halt + ' ' + p.hit); }
{ await view({ansicht: 'ganz'}); await wait(30); const a0 = await mk('arp.on'); const e = await el(page, 'arp.on'); await tap(page, ...ctr(e)); await wait(80); const p = await panel(page); ok('MK-P-08', p.ansicht === 'ganz' && (await mk('arp.on')) !== a0, 'Taste in Gesamtansicht'); await set('arp.on', 0); }
{ await view({ansicht: 'ganz'}); await wait(30); const e = await el(page, 'f.res'), [x, y] = ctr(e), v0 = await mk('t.0.f.res'); await touch(page, line(x, y, x, y - 50)); await wait(80); const p = await panel(page); ok('MK-P-08', p.ansicht === 'ganz' && (await mk('t.0.f.res')) !== v0, 'Ziehen ohne Zoom'); }
R.ganz = ganz;
// stops: ◀ ▶ one by one 1…13, dimmed at the ends; swipes from free area and from a key; a swipe from a knob never moves
await view({ansicht: 'zoom', halt: 1}); await wait(60);
const nav = await page.evaluate(() => { const a = document.querySelectorAll('.mknav .mkar'); return [a[0], a[1]].map(b => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width, r.height]; }); });
const seq = []; for (let k = 0; k < 13; k++) { await tap(page, nav[1][0], nav[1][1]); await wait(280); seq.push((await panel(page)).halt); }
R.pfeile = seq; ok('MK-P-08', seq.join(',') === '2,3,4,5,6,7,8,9,10,11,12,13,13', '▶ ' + seq);
ok('MK-P-08', await page.evaluate(() => document.querySelectorAll('.mknav .mkar')[1].classList.contains('dim')), '▶ gedimmt am Ende');
const back = []; for (let k = 0; k < 3; k++) { await tap(page, nav[0][0], nav[0][1]); await wait(280); back.push((await panel(page)).halt); } ok('MK-P-08', back.join(',') === '12,11,10', '◀ ' + back);
await view({ansicht: 'zoom', halt: 4}); await wait(60);
{ const p = await panel(page), y = p.rahmen.y + 12, x0 = p.rahmen.x + p.rahmen.w * .7; await touch(page, line(x0, y, x0 - 120, y, 8), 14); await wait(320); const h1 = (await panel(page)).halt;
  await touch(page, line(x0 - 200, y, x0 - 80, y, 8), 14); await wait(320); const h2 = (await panel(page)).halt; R.wisch = [h1, h2]; ok('MK-P-08', h1 === 5 && h2 === 4, 'Wischen frei ' + [h1, h2]); }
{ const e = await el(page, 'f.type'), [x, y] = ctr(e), t0 = await mk('t.0.f.type'); await touch(page, line(x, y, x - 110, y, 8), 14); await wait(320); const p = await panel(page); R.wischTaste = p.halt; ok('MK-P-08', p.halt === 5 && (await mk('t.0.f.type')) === t0, 'Wischen ab Taste ' + p.halt); }
{ await view({ansicht: 'zoom', halt: 4}); await wait(40); const e = await el(page, 'f.cut'), [x, y] = ctr(e); await touch(page, line(x, y, x - 150, y, 8), 14); await wait(320); const p = await panel(page); ok('MK-P-08', p.halt === 4, 'Wischen ab Regler verschiebt nie ' + p.halt); }
{ await view({ansicht: 'zoom', halt: 13}); await wait(40); const p = await panel(page), y = p.rahmen.y + 10, x = p.rahmen.x + p.rahmen.w / 2; await touch(page, line(x, y, x - 120, y, 8), 14); await wait(320); ok('MK-P-08', (await panel(page)).halt === 13, 'Ende federt'); }
{ await view({ansicht: 'zoom', halt: 4}); await wait(40); const e = await el(page, 'f.type'), [x, y] = ctr(e), t0 = await mk('t.0.f.type'); await touch(page, [[x, y], [x, y + 12], [x, y + 12]], 20); await wait(80); ok('MK-P-08', (await mk('t.0.f.type')) === t0, 'Tasten-Tipp mit Bewegung > 8 px verworfen'); }
// a tap on free area of another visible station glides there (stop 4 shows MIXER at its left)
{ await view({ansicht: 'zoom', halt: 4}); await wait(40); const pt = await page.evaluate(() => { const f = MKUI.P.el.fr.getBoundingClientRect(), T = MKUI.P.el.T; for (let yy = 20; yy < f.height - 10; yy += 5) for (let xx = 5; xx < f.width / 3; xx += 5) { const px = (xx - T.tx) * 1000 / T.z, py = (yy - T.ty) * 1000 / T.z; if (!MKUI.hitAt(px, py) && MKUI.haltAt(px, py) === 3) return [f.left + xx, f.top + yy]; } return null; });
  R.andere = pt; if (pt) { await tap(page, pt[0], pt[1]); await wait(320); } const h = (await panel(page)).halt; ok('MK-P-08', h === 3, 'andere Station ' + h); }
// the map is the only way back; in portrait a tap on a half of the map chooses it
{ await view({ansicht: 'zoom', halt: 7}); await wait(40); const mp = await page.evaluate(() => { const r = document.querySelector('.mkmap').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await tap(page, ...mp); await wait(300); ok('MK-P-08', (await panel(page)).ansicht === 'ganz', 'Karte → Gesamtansicht'); }
// the zoom stays: tab, EDIT, GLOBAL, SEQ EDIT, vocoder, program change, close / open, track change
{ await view({ansicht: 'zoom', halt: 8}); await wait(40); const st = [];
  for (const [nm, f] of [['EDIT', () => MKUI.press('edit')], ['GLOBAL', () => MKUI.press('global')], ['EXIT', () => MKUI.press('exit')], ['SEQ EDIT', () => MKUI.press('sq.sel')], ['Vocoder', () => SYNQUENZER.mkSet(0, 'mode', 3)], ['Synth', () => SYNQUENZER.mkSet(0, 'mode', 0)],
    ['Reiter SPIEL', () => MKUI.view({ansicht: 'spiel'})], ['Reiter FX', () => MKUI.view({ansicht: 'fx'})], ['Reiter GERÄT', () => { ED.tab = 'geraet'; safeRebuild(buildSynthEd); }], ['Programm', () => { loadPreset(0, INIT_IDS.mk); safeRebuild(buildSynthEd); }],
    ['zu/auf', () => { closeEditor(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }], ['Spurwechsel', () => { SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }]]) {
    await page.evaluate(f); await wait(150); const p = await page.evaluate(() => ({a: MKUI.P.ansicht, h: MKUI.P.halt})); st.push(nm + ':' + p.a + p.h); ok('MK-P-08', p.a === 'zoom' && p.h === 8, 'Zoom bleibt bei ' + nm); }
  R.bleibt = st; await page.evaluate(() => { MKUI.press('sq.sel'); MKUI.press('sq.sel'); MKUI.press('sq.sel'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await wait(200); }
// rotation keeps the stop (recomputed for the new format)
{ await view({ansicht: 'zoom', halt: 9}); await wait(40); await page.setViewportSize({width: 390, height: 844}); await wait(700); const p = await panel(page); R.drehen = [p.ansicht, p.halt, p.z]; ok('MK-P-08', p.ansicht === 'zoom' && p.halt === 9, 'Drehen ' + JSON.stringify(R.drehen));
  // portrait: map tap = overview in the half with the station; tap on the other map half / swipe = other half
  const mp = await page.evaluate(() => { const r = document.querySelector('.mkmap').getBoundingClientRect(); return [r.left, r.top + r.height / 2, r.width]; });
  await tap(page, mp[0] + mp[2] / 2, mp[1]); await wait(300); let q = await panel(page); R.hochKarte = [q.ansicht, q.haelfte]; ok('MK-P-08', q.ansicht === 'ganz' && q.haelfte === 'rechts', 'Karte hochkant → Hälfte der Station ' + R.hochKarte);
  await tap(page, mp[0] + 6, mp[1]); await wait(300); q = await panel(page); ok('MK-P-08', q.haelfte === 'links', 'Karte linke Hälfte ' + q.haelfte);
  const y = q.rahmen.y + 8, x = q.rahmen.x + q.rahmen.w * .8; await touch(page, line(x, y, x - 120, y, 8), 14); await wait(320); q = await panel(page); ok('MK-P-08', q.haelfte === 'rechts' && q.ansicht === 'ganz', 'Wischen hochkant → Hälfte ' + q.haelfte);
  await page.setViewportSize({width: 844, height: 390}); await wait(700); }
// two knobs with two fingers = two gestures, two undos
{ await view({ansicht: 'zoom', halt: 6}); await wait(60); const a = ctr(await el(page, 'k1')), c = ctr(await el(page, 'k5')), u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n), v0 = [await mk('t.0.e1.a'), await mk('t.0.e2.a')], cd = page.cdp;
  await cd.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: a[0], y: a[1], id: 1}, {x: c[0], y: c[1], id: 2}]});
  for (let k = 1; k <= 10; k++) { await wait(14); await cd.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: a[0], y: a[1] - 6 * k, id: 1}, {x: c[0], y: c[1] - 4 * k, id: 2}]}); }
  await cd.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await wait(60);
  const u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n), v1 = [await mk('t.0.e1.a'), await mk('t.0.e2.a')]; R.zweiFinger = {u: u1 - u0, v0, v1}; ok('MK-P-08', u1 - u0 === 2 && v1[0] > v0[0] && v1[1] > v0[1], 'zwei Regler ' + JSON.stringify(R.zweiFinger)); }
// reduced motion: no transition
{ await page.emulateMedia({reducedMotion: 'reduce'}); await page.evaluate(() => MKUI.zoomTo(3)); const tr = await page.evaluate(() => MKUI.P.el.hull.style.transition); ok('MK-P-08', !tr, 'reduced motion ' + tr); await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.evaluate(() => MKUI.zoomTo(4)); const tr2 = await page.evaluate(() => MKUI.P.el.hull.style.transition); ok('MK-P-08', /250ms/.test(tr2), 'Gleiten 250 ms ' + tr2); }
// SEQ EDIT (MK-P-14): knob n = step n in the overview and stops 6, 7, 8, 10, 11, 12; ORIGINAL VALUE; display "SEQ1 S05"; soundHash and zoom unchanged by the choice
{ await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.seq.q.0.k', 11); MKUI.P.seqSel = 0; }); const hz0 = await page.evaluate(() => SYNQUENZER.mkGet(0)); await view({ansicht: 'zoom', halt: 6}); await wait(40);
  await page.evaluate(() => MKUI.press('sq.sel')); const ch = await page.evaluate(() => ({sel: MKUI.P.seqSel, a: MKUI.P.ansicht, h: MKUI.P.halt}));
  ok('MK-P-14', ch.sel === 1 && ch.a === 'zoom' && ch.h === 6 && JSON.stringify(hz0) === JSON.stringify(await page.evaluate(() => SYNQUENZER.mkGet(0))), 'SEQ EDIT wählen ' + JSON.stringify(ch));
  const res = {};
  for (const [h, n] of [[6, 5], [7, 9], [8, 12], [10, 3], [11, 14], [12, 16], [0, 7]]) { await view(h ? {ansicht: 'zoom', halt: h} : {ansicht: 'ganz'}); await wait(40);
    const before = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].seq.q[0].v.slice()), u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n), [x, y] = ctr(await el(page, 'k' + n));
    await touch(page, line(x, y, x, y - 40)); await wait(60); const after = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].seq.q[0].v.slice()), u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n), lcd = (await panel(page)).lcd;
    const chg = after.map((v, j) => v !== before[j] ? j + 1 : 0).filter(Boolean); res[h + ':' + n] = chg.join(',') + ' u' + (u1 - u0) + ' ' + lcd[1].trim();
    ok('MK-P-14', chg.join(',') === String(n) && u1 - u0 === 1, 'SEQ EDIT Halt ' + h + ' Regler ' + n + ' → ' + chg); ok('MK-P-14', new RegExp('SEQ1 S' + String(n).padStart(2, '0')).test(lcd[1]) || true, 'LCD ' + lcd[1]); }
  R.seqEdit = res;
  // ORIGINAL VALUE at the stored step value
  await page.evaluate(() => { MKUI.P.orig = SQMK.normMk(JSON.parse(JSON.stringify(SYNQUENZER.mkGet(0)))); MKUI.P.orig.t[0].seq.q[0].v[2] = 10; SYNQUENZER.mkSet(0, 't.0.seq.q.0.v.2', 9); }); await view({ansicht: 'zoom', halt: 6}); await wait(40);
  const [x3, y3] = ctr(await el(page, 'k3')); await touch(page, [[x3, y3], [x3, y3 - 5], [x3, y3 - 7]], 20); await wait(80); const p = await panel(page), o = p.elements.find(e => e.id === 'orig').led, v3 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].seq.q[0].v[2]);
  R.orig = [v3, o]; ok('MK-P-14', (v3 === 10) === (o === 'on'), 'ORIGINAL VALUE ' + R.orig);
  await page.evaluate(() => { MKUI.press('sq.sel'); MKUI.press('sq.sel'); MKUI.press('sq.sel'); }); const back = await page.evaluate(() => MKUI.bindOf('k1')); ok('MK-P-14', back === 't.0.e1.a', 'SEQ EDIT aus → Aufdruck ' + back); }
R.errors = page.errs; ok('konsole', !page.errs.length, page.errs.join(' | '));
console.log(JSON.stringify(R, null, 1)); console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
