// QA G-MK2a flow (iPhone 12 Pro Max P 428x926 / L 926x428, CDP touch): MS 2000 OSZ 1 waves 3–6 + PATCH 1–4 in a songwriting session
import {open, sleep, OUT, check, done, eq, diff} from './vgmk34-tl2a.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const hi = s => Math.max(-120, ...s.peaks.filter(x => x[0] >= 150).map(x => x[1]));
const o1 = async () => (await T.pm(0)).t[0].o1;
const U = () => T.undoN();
await E(() => SYNQUENZER.setMetronome(false));
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/);
if (mkb) await T.tap(mkb.cx, mkb.cy, 800); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 300); await T.tapPop(/MS ?2000/); await sleep(800); }
check('F1 engine MS 2000', (await E(() => SYNQUENZER.getSound(0).engine)) === 'mk');
let pn = await T.panel(); log('panel', pn.fmt, pn.half);
const half = async want => { pn = await T.panel(); if (pn.half && pn.half !== 'beide' && pn.half !== want) { await T.tapTxt('.tab, button', want === 'B' ? /^RECHTS$/ : /^LINKS$/); await sleep(350); } };
await half('B');
// --- OSZ 1 → Speicherwelle
log('w1 →', JSON.stringify(await T.w('w1', /^3 OSZ 1/)));
let u0 = await U();
log('WELLE list', await T.knobList('k0', /^Speicherwelle/));
let w = await o1();
check('F2 WELLE list → Speicherwelle (one undo), LCD names wave with ≈', w.w === 5 && (await U()) === u0 + 1 && /Speicherwelle \d+ · .*≈|SPEICHERWELLE ≈/.test(await T.lcdTxt() || ''), {o1: w, u: (await U()) - u0, lcd: await T.lcdTxt()});
// hold a key, listen
const kA = await T.key(L ? 7 : 5);
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 11}]); await sleep(150);
const sp1 = await T.spec(400);
const vc1 = await E(() => SYNQUENZER.voices().length);
// second finger: drag STEUER 2 up (wave number up) while the note sounds
const k2 = await T.mk('k2');
u0 = await U();
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 11}, {x: k2.cx, y: k2.cy, id: 12}]);
for (let s = 1; s <= 30; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 11}, {x: k2.cx, y: k2.cy - s * 2.5, id: 12}]); await sleep(25); }
await sleep(60);
const sp2 = await T.spec(400);
const vc2 = await E(() => SYNQUENZER.voices().length);
await T.send('touchEnd', []); await sleep(400);
w = await o1();
log('spec wave1', JSON.stringify(sp1), 'after drag', JSON.stringify(sp2), 'voices', vc1, vc2);
check('F3 key held + STEUER 2 drag (2nd finger) → other wave, audible change, one undo', w.c2 > 0 && Math.abs(sp2.cent - sp1.cent) > 50 && sp1.pow > -60 && (await U()) === u0 + 1, {c2: w.c2, wave: Math.floor(w.c2 / 2) + 1, cent: [sp1.cent, sp2.cent], u: (await U()) - u0, lcd: await T.lcdTxt()});
// tap STEUER 2 → list; scroll by finger to 36; tap
u0 = await U();
await T.tapMk('k2', 500);
const rows = await T.popTexts();
const row36 = async () => E(() => { const b = [...document.querySelectorAll('#popLayer .pop button[data-v="36"]')][0]; const L = document.querySelector('#popLayer .plist.mkwv'); if (!b || !L) return null; const r = b.getBoundingClientRect(), lr = L.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height, vis: r.top >= lr.top && r.bottom <= lr.bottom, lt: lr.top, lb: lr.bottom, lcx: lr.x + lr.width / 2}; });
let r36 = await row36(); log('row36', JSON.stringify(r36));
let swipes = 0;
while (r36 && !r36.vis && swipes < 10) { const y0 = r36.lb - 20, y1 = r36.lt + 20, dir = r36.cy > r36.lb ? 1 : -1; const a = dir > 0 ? y0 : y1, b = dir > 0 ? y1 : y0; await T.down(r36.lcx, a); await T.glide(r36.lcx, a, r36.lcx, b, 10, 16); await T.up(); await sleep(400); swipes++; r36 = await row36(); }
const c2Before = (await o1()).c2;
if (r36 && r36.vis) await T.tap(r36.cx, r36.cy, 400);
w = await o1();
check('F4 wave list: 64 rows with ≈, finger scroll to 36, tap → wave 36, one undo', rows && rows.length === 64 && rows.every(r => /≈/.test(r)) && Math.floor(w.c2 / 2) + 1 === 36 && (await U()) === u0 + 1, {n: rows && rows.length, swipes, c2: [c2Before, w.c2], u: (await U()) - u0, lcd: await T.lcdTxt(), pop: await T.pop()});
await T.closePop();
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 21}]); await sleep(150);
const sp36 = await T.spec(400); await T.send('touchEnd', []); await sleep(300);
log('wave 36 spec', JSON.stringify(sp36));
check('F4b wave 36 audible', sp36.pow > -60, sp36);
await p.screenshot({path: OUT + 'flow-' + TAG + '-1.png'});
// --- Sinus×: X-MOD up changes the spectrum
log('WELLE →', await T.knobList('k0', /^Sinus×$/));
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 31}]); await sleep(150);
const sx0 = await T.spec(400);
const k1 = await T.mk('k1'); u0 = await U();
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 31}, {x: k1.cx, y: k1.cy, id: 32}]);
for (let s = 1; s <= 30; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 31}, {x: k1.cx, y: k1.cy - s * 4, id: 32}]); await sleep(25); }
await sleep(60);
const sx1 = await T.spec(400); await T.send('touchEnd', []); await sleep(300);
w = await o1();
check('F5 Sinus×: X-MOD drag up (key held) → brighter, one undo; LCD names X-MOD', w.w === 3 && w.c1 > 40 && hi(sx1) > hi(sx0) + 6 && (await U()) === u0 + 1, {o1: w, hi: [hi(sx0), hi(sx1)], p0: sx0.peaks.slice(0, 4), p1: sx1.peaks.slice(0, 4), lcd: await T.lcdTxt()});
// --- Stimmwelle: FORM sweep changes the sound
log('WELLE →', await T.knobList('k0', /^Stimmwelle$/));
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 41}]); await sleep(150);
const vx0 = await T.spec(400);
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 41}, {x: k1.cx, y: k1.cy, id: 42}]);
for (let s = 1; s <= 30; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 41}, {x: k1.cx, y: k1.cy + s * 4, id: 42}]); await sleep(25); }
await sleep(60);
const vx1 = await T.spec(400); await T.send('touchEnd', []); await sleep(300);
w = await o1();
log('Stimmwelle', JSON.stringify(vx0), JSON.stringify(vx1));
check('F6 Stimmwelle: FORM sweep (key held) changes the spectrum, LCD FORM', w.w === 4 && Math.abs(vx1.cent - vx0.cent) > 30 && vx0.pow > -60 && vx1.pow > -60, {o1: w, cent: [vx0.cent, vx1.cent], pow: [vx0.pow, vx1.pow], lcd: await T.lcdTxt()});
// --- Rauschen with CUTOFF 24, RESO 127 → pitched at the key
log('WELLE →', await T.knobList('k0', /^Rauschen$/));
await E(() => { SYNQUENZER.mkSet(0, 't.0.o1.c1', 24); SYNQUENZER.mkSet(0, 't.0.o1.c2', 127); });
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 51}]); await sleep(200);
const nz = await T.spec(600);
const lastNote = await E(() => SYNQUENZER.noteLog(4).filter(n => n.track === 0).map(n => n.out));
await T.send('touchEnd', []); await sleep(300);
const nf = lastNote.length ? 440 * Math.pow(2, (lastNote[0] - 69) / 12) : null;
log('noise', JSON.stringify(nz), 'note', lastNote, nf);
check('F7 Rauschen CUTOFF 24 / RESO 127: strongest peak near the key frequency (±1 HT)', nf && nz.peaks.length && Math.abs(12 * Math.log2(nz.peaks[0][0] / nf)) < 1, {peaks: nz.peaks.slice(0, 3), nf, lcd: await T.lcdTxt()});
// back to Säge and a low cutoff for the patches
log('WELLE →', await T.knobList('k0', /^Säge$/));
await E(() => { SYNQUENZER.mkSet(0, 't.0.f.cut', 50); SYNQUENZER.mkSet(0, 't.0.f.res', 60); });
// --- PATCH 1: LFO 2 → CUTOFF +40 (touch)
log('w2 →', JSON.stringify(await T.w('w2', /^1 PATCH 1/)));
u0 = await U();
log('QUELLE', await T.knobList('k0', /^LFO 2$/));
log('ZIEL', await T.knobList('k1', /^CUTOFF$/));
await T.sweep('k2', -60, 40, 20);
let pp = (await T.pm(0)).t[0].p[0];
const lcdP = await T.lcdTxt();
check('F8 PATCH 1: QUELLE LFO 2, ZIEL CUTOFF, INTENSITÄT drag up → 3 undos, LCD "PATCH 1 · LFO 2 → CUTOFF · +n"', pp.s === 3 && pp.d === 4 && pp.i > 10 && (await U()) === u0 + 3 && /PATCH 1 · LFO 2 → CUTOFF · \+\d+/.test(lcdP || ''), {pp, u: (await U()) - u0, lcd: lcdP});
// wobble audible: level over time with key held
const wob = async () => { await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 61}]); await sleep(100);
  const r = await E(() => new Promise(res => { const a = AU.ctx.createAnalyser(); a.fftSize = 1024; AU.M.ceil.connect(a); const b = new Float32Array(1024), lv = []; const iv = setInterval(() => { a.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; lv.push(10 * Math.log10(s / 1024 + 1e-12)); }, 25); setTimeout(() => { clearInterval(iv); AU.M.ceil.disconnect(a); lv.sort((x, y) => x - y); res([+lv[Math.floor(lv.length * .1)].toFixed(1), +lv[Math.floor(lv.length * .9)].toFixed(1)]); }, 2500); }));
  await T.send('touchEnd', []); await sleep(300); return r; };
const wobOn = await wob();
await E(() => SYNQUENZER.mkSet(0, 't.0.p.0.i', 0));
const wobOff = await wob();
await E(() => SYNQUENZER.undo());
log('wobble p10/p90 with patch', wobOn, 'without', wobOff);
check('F8b PATCH 1 LFO 2 → CUTOFF wobbles the level (p90 − p10 larger than without)', (wobOn[1] - wobOn[0]) > (wobOff[1] - wobOff[0]) + 2, {wobOn, wobOff});
// --- PATCH 2: MOD-RAD → TONHÖHE +10, MOD wheel raises the pitch
log('w2 →', JSON.stringify(await T.w('w2', /^2 PATCH 2/)));
await T.knobList('k0', /^MOD-RAD$/); await T.knobList('k1', /^TONHÖHE$/);
await E(() => SYNQUENZER.mkSet(0, 't.0.p.1.i', 32));   // ±24 HT · 32/63 ≈ 12 HT
await E(() => { SYNQUENZER.mkSet(0, 't.0.p.0.i', 0); SYNQUENZER.mkSet(0, 't.0.f.cut', 127); SYNQUENZER.mkSet(0, 't.0.f.res', 0); SYNQUENZER.mkWheel(0, 'mod', 0); });
const wm = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="mod"] .mwell'); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 71}]); await sleep(200);
const pm0 = await T.spec(400);
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 71}, {x: wm.cx, y: wm.cy + wm.h / 2 - 4, id: 72}]);
for (let s = 1; s <= 12; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 71}, {x: wm.cx, y: wm.cy + wm.h / 2 - 4 - s * (wm.h - 8) / 12, id: 72}]); await sleep(20); }
await sleep(150);
const pm1 = await T.spec(400);
const modv = await E(() => SYNQUENZER.mkWheel(0, 'mod'));
await T.send('touchEnd', []); await sleep(300);
const f0 = s => s.peaks.length ? Math.min(...s.peaks.slice(0, 4).map(x => x[0])) : 0;
log('pitch peaks', JSON.stringify(pm0.peaks.slice(0, 4)), JSON.stringify(pm1.peaks.slice(0, 4)), 'mod', modv);
check('F9 PATCH 2 MOD-RAD → TONHÖHE +32: MOD wheel up raises pitch ≈ +12 HT', modv > .9 && Math.abs(12 * Math.log2(f0(pm1) / f0(pm0)) - 12.2) < 1.5, {f: [f0(pm0), f0(pm1)], ht: +(12 * Math.log2(f0(pm1) / f0(pm0))).toFixed(2), modv, lcd: await T.lcdTxt()});
await E(() => SYNQUENZER.mkWheel(0, 'mod', 0));
// --- PATCH 4 LFO 2-FREQ with TEMPO SYNC hint
await E(() => { SYNQUENZER.mkSet(0, 't.0.l2.sync', 1); });
log('w2 →', JSON.stringify(await T.w('w2', /^4 PATCH 4/)));
await T.knobList('k1', /^LFO 2 FREQ$/); await T.sweep('k2', -40, 30, 20);
const lcd4 = await T.lcdTxt();
check('F10 PATCH 4 ZIEL LFO 2 FREQ with LFO 2 TEMPO SYNC an: LCD says "wirkt nicht"', /wirkt nicht/i.test(lcd4 || ''), lcd4);
await E(() => { SYNQUENZER.mkSet(0, 't.0.l2.sync', 0); });
// --- set a nice sound: Speicherwelle 20 + PATCH 1 LFO2→CUTOFF, WRITE
await E(() => { SYNQUENZER.mkSet(0, 't.0.o1.w', 5); SYNQUENZER.mkSet(0, 't.0.o1.c2', 38); SYNQUENZER.mkSet(0, 't.0.f.cut', 70); SYNQUENZER.mkSet(0, 't.0.p.0.i', 30); });
const pmW = await T.pm(0);
await T.tapMk('write', 500);
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Welle Wabert'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
const sb = await T.rectText('#popLayer .pop button', /Sichern|Speichern|Als neu|Neu/); if (sb) await T.tap(sb.cx, sb.cy, 700);
const libS = await E(() => SYNQUENZER.library().find(s => s.name === 'Welle Wabert'));
check('F11 WRITE → library has "Welle Wabert" with the wave and patches', libS && libS.engine === 'mk' && eq(libS.p.mk, pmW), {lib: !!libS, d: libS ? diff(libS.p.mk, pmW).slice(0, 5) : null});
// SHIFT + 3 (Init), then number key loads it back (Seite B)
await T.tapMk('shift'); await T.tapMk('n2', 400);
const init = await T.pm(0);
pn = await T.panel(); if (pn.half === 'B') { await T.tapTxt('.tab, button', /^LINKS$/); await sleep(300); }
const prog = await E(() => { const e = document.querySelector('.mkx[data-k="prog"]'); return e ? e.textContent.trim() : null; });
const lit = await E(() => [...document.querySelectorAll('.mkx[data-k^="n"]')].findIndex(e => /\bon\b/.test(e.className)));
log('after Init prog', prog, 'lit key', lit);
// find the key with the written program: tap number keys
let found = null;
for (let k = 0; k < 8 && !found; k++) { await T.tapMk('n' + k, 400); const nm = await E(() => SYNQUENZER.getSound(0).name); if (nm === 'Welle Wabert') found = k; }
const back = await T.pm(0);
check('F12 SHIFT+3 → INIT (wave Säge), number key brings "Welle Wabert" back with wave 20 + patch', init.t[0].o1.w === 0 && found != null && eq(back, pmW), {initW: init.t[0].o1.w, found, d: diff(back, pmW).slice(0, 4)});
await p.screenshot({path: OUT + 'flow-' + TAG + '-2.png'});
// close editor, play the demo: Synth 1 (MS 2000 wave 20) sounds in the song
await T.tapTxt('button', /^✕$/); await sleep(500);
await T.tapSel('#bPlay'); await sleep(2500);
const nl = await E(() => SYNQUENZER.noteLog(400).filter(n => n.track === 0).length);
const scope = await E(() => SYNQUENZER.mkScope(0));
const pk = await T.lvl(800);
await T.tapSel('#bPlay'); await sleep(1500);
const vAfter = await E(() => SYNQUENZER.voices().filter(v => v.state !== 'off').length);
check('F13 ▶: Synth 1 (Welle Wabert) plays in the demo, ■ leaves no voice', nl > 0 && pk > -40 && vAfter === 0, {nl, pk, vAfter, scope: JSON.stringify(scope).slice(0, 200)});
// 🎲 a few times: every result is audible and normalised
await T.openEd(0);
const dice = [];
for (let k = 0; k < 6; k++) { await T.tapTxt('button', /^🎲$/); await sleep(300); const m = await T.pm(0); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 81 + k}]); await sleep(150); const lv = await T.lvl(400); await T.send('touchEnd', []); await sleep(300); dice.push([m.t[0].o1.w, m.t[0].o1.c2, m.t[0].p.map(x => x.i).join('/'), lv]); }
log('dice', JSON.stringify(dice));
check('F14 🎲 ×6: every result audible (> −50 dBFS)', dice.every(d => d[3] > -50), dice);
fs.writeFileSync(OUT + 'flow-' + TAG + '-project.json', await E(() => SYNQUENZER.serialize()));
check('no console errors', errs.length === 0, errs.slice(0, 6));
await T.br.close(); done();
