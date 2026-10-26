// QA G-MK1 flow (P 428x926 = iPhone 12 Pro Max, CDP touch): Synth 1 → MS 2000, panel edits, wheels, WRITE, Seite B, scenes
import {open, sleep, OUT, check, done, eq, diff} from './vgmk34-tl1.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const TAG = L ? 'L' : 'P';
const log = (...a) => console.log(...a);
const sound0 = await E(() => SYNQUENZER.getSound(0));
// open the editor of Synth 1 by touch: tap the track label (head of the strip)
await E(() => SYNQUENZER.selectTrack(0)); await E(() => SYNQUENZER.openEditor()); await sleep(500);
const u0 = await T.undoN();
const mkb = await T.rectText('button', /^MS ?2000$/);
log('MS 2000 key', JSON.stringify(mkb));
let chip = null;
if (mkb) await T.tap(mkb.cx, mkb.cy, 700);
else { chip = await T.rectText('button', /^(VA|FM|WT) ▾$/); log('chip', JSON.stringify(chip)); if (chip) { await T.tap(chip.cx, chip.cy, 300); await T.tapPop(/MS ?2000/); await sleep(700); } }
const s1 = await E(() => SYNQUENZER.getSound(0));
check('1 engine key MS 2000 (touch) → engine mk, one undo, panel built', s1.engine === 'mk' && (await T.undoN()) === u0 + 1 && !!(await T.panel()), {eng: s1.engine, u: [u0, await T.undoN()], name: s1.name});
log('sound name after switch:', s1.name, ' p.mk keys', Object.keys(s1.p.mk || {}).join(','));
await p.screenshot({path: OUT + 'flow-' + TAG + '-1.png'});
// play a chord on the on-screen keyboard (touch, 3 fingers), measure the master level
await E(() => { SYNQUENZER.setMetronome(false); });
const k0 = await T.key(0), k2 = await T.key(4), k4 = await T.key(7);
log('keys', JSON.stringify([k0, k2, k4]));
const lvl = async ms => E(ms => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const buf = new Float32Array(2048); let pk = 0, n = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(buf); for (const v of buf) pk = Math.max(pk, Math.abs(v)); n++; }, 20); setTimeout(() => { clearInterval(iv); try { AU.M.ceil.disconnect(a); } catch (e) {} r(+(20 * Math.log10(pk + 1e-9)).toFixed(1)); }, ms); }), ms);
await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 11}, {x: k2.cx, y: k2.cy, id: 12}, {x: k4.cx, y: k4.cy, id: 13}]);
const pkChord = await lvl(500);
const vc = await E(() => SYNQUENZER.voices().length);
await T.send('touchEnd', []); await sleep(600);
check('2 chord on the keyboard (3 fingers) sounds with MS 2000', pkChord > -40 && vc >= 3, {pk: pkChord, voices: vc});
// EDIT-WAHL 1 → FILTER by dragging the rotary up (18 px per position, FILTER = position 6)
let pn = await T.panel();
log('panel', pn.fmt, pn.half, JSON.stringify(pn.sel));
if (pn.half === 'A') { await T.tapTxt('.tab, button', /^RECHTS$/); await sleep(300); pn = await T.panel(); }
const hBefore = await E(() => SYNQUENZER.getSound(0));
await T.dragMk('w1', -10, 5);
pn = await T.panel();
check('3 EDIT-WAHL 1 drag → FILTER, sound unchanged, no undo', pn.sel.wahl === 1 && pn.knobs[1].l === 'CUTOFF' && eq(hBefore, await E(() => SYNQUENZER.getSound(0))) && (await T.undoN()) === u0 + 1, {sel: pn.sel, knobs: pn.knobs.map(k => k && k.l), m: pn.matrix});
// CUTOFF knob down (finger stays on the knob column), RESO up
const cut0 = (await T.pm(0)).t[0].f.cut;
await T.dragMk('k1', 80, 16);
const cut1 = (await T.pm(0)).t[0].f.cut;
check('4 CUTOFF drag down 80 px → lower, integer, one undo', cut1 < cut0 && Number.isInteger(cut1) && (await T.undoN()) === u0 + 2, {cut0, cut1, lcd: await T.lcdTxt(), u: await T.undoN()});
await T.dragMk('k2', -70, 14);
const res1 = (await T.pm(0)).t[0].f.res;
check('5 RESONANZ drag up → higher, one undo', res1 > 0 && (await T.undoN()) === u0 + 3, {res1});
// TYP: tap → list → 12BPF
await T.tapMk('k0', 300);
const pl = await T.popTexts();
log('TYP list', JSON.stringify(pl));
await T.tapPop(/^12BPF/); await sleep(200);
check('6 TYP tap → list → 12BPF (one undo)', (await T.pm(0)).t[0].f.type === 2 && (await T.undoN()) === u0 + 4, {type: (await T.pm(0)).t[0].f.type, list: pl});
// play while the filter changes
await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 21}]);
const pkBp = await lvl(400);
await T.send('touchEnd', []); await sleep(300);
log('level with 12BPF', pkBp);
// SHIFT → level 2 (ANSCHLAG), SHIFT again off
await T.tapMk('shift');
pn = await T.panel();
const sh2 = pn.shift, kn2 = pn.knobs.map(k => k && k.l);
await T.tapMk('shift');
const pn2 = await T.panel();
check('7 SHIFT → Ebene 2 (ANSCHLAG first), again → off', sh2 && kn2[0] === 'ANSCHLAG' && !pn2.shift, {sh2, kn2, after: pn2.shift});
// EDIT-WAHL 1 → OSZ 2 (pos 4): drag down 2 positions
await T.dragMk('w1', 2 * 18 + 9, 10);
pn = await T.panel();
log('after drag down', JSON.stringify(pn.sel), pn.knobs.map(k => k && k.l).join(','));
// tap MOD → Sync
await T.tapMk('k1', 300); await T.tapPop(/^Sync$/); await sleep(200);
await T.dragMk('k2', -60, 12);
const o2 = (await T.pm(0)).t[0].o2;
check('8 OSZ 2: MOD → Sync (list), HALBTON drag up', o2.mod === 2 && o2.semi > 0, o2);
// AMP: VERZERR. on via list
await T.dragMk('w1', -(4 * 18 + 9), 12);
pn = await T.panel(); log('AMP?', JSON.stringify(pn.sel), pn.knobs.map(k => k && k.l).join(','));
await T.tapMk('k2', 300); await T.tapPop(/^an$/); await sleep(200);
check('9 AMP: VERZERR. an', (await T.pm(0)).t[0].a.dist === 1, (await T.pm(0)).t[0].a);
// wheels: hold C and pull BEND up with another finger, then release; MOD up
const wb = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="bend"] .mwell'); if (!e) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
const wm = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="mod"] .mwell'); if (!e) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
log('wheels', JSON.stringify([wb, wm]));
const hashW = await E(() => JSON.stringify(SYNQUENZER.getSound(0))); const uW = await T.undoN();
await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 31}]); await sleep(150);
await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 31}, {x: wb.cx, y: wb.cy, id: 32}]);
for (let k = 1; k <= 8; k++) { await T.send('touchMove', [{x: k0.cx, y: k0.cy, id: 31}, {x: wb.cx, y: wb.cy - k * wb.h / 16, id: 32}]); await sleep(16); }
const bendUp = await E(() => SYNQUENZER.mkWheel(0, 'bend'));
const vHeld = await E(() => SYNQUENZER.voices().filter(v => v.state !== 'off').length);
await T.send('touchEnd', []); await sleep(300);
const bendBack = await E(() => SYNQUENZER.mkWheel(0, 'bend'));
check('10 key held + BEND wheel up (2nd finger) → bend > .4, note sounds; release → 0; nothing stored, no undo', bendUp > .4 && vHeld >= 1 && bendBack === 0 && hashW === await E(() => JSON.stringify(SYNQUENZER.getSound(0))) && (await T.undoN()) === uW, {bendUp, bendBack, vHeld});
await T.down(wm.cx, wm.cy + wm.h / 2 - 4); await T.glide(wm.cx, wm.cy + wm.h / 2 - 4, wm.cx, wm.cy - wm.h / 2 + 4, 10, 16); await T.up(); await sleep(150);
const modV = await E(() => SYNQUENZER.mkWheel(0, 'mod'));
check('11 MOD wheel up → ~1, stays, no undo', modV > .9 && (await T.undoN()) === uW, {modV});
await p.screenshot({path: OUT + 'flow-' + TAG + '-2.png'});
// 🎲 (header) → audible, one undo
const uR = await T.undoN();
await T.tapTxt('button', /^🎲$/); await sleep(400);
await T.send('touchStart', [{x: k2.cx, y: k2.cy, id: 41}]);
const pkR = await lvl(500);
await T.send('touchEnd', []); await sleep(300);
check('12 🎲 → one undo, audible', (await T.undoN()) === uR + 1 && pkR > -45, {pk: pkR, u: await T.undoN() - uR});
// WRITE → save sheet → save as own sound
await T.tapMk('write', 400);
const wp = await T.popTexts(); log('WRITE pop', JSON.stringify(wp));
const nameInput = await E(() => { const i = document.querySelector('#popLayer .pop input'); return i ? i.value : null; });
log('name field', nameInput);
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Xanders Bass'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
const saveBtn = await T.rectText('#popLayer .pop button', /Sichern|Speichern|Als neu|Neu/);
log('save btn', JSON.stringify(saveBtn));
if (saveBtn) await T.tap(saveBtn.cx, saveBtn.cy, 600);
const lib = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => s.name));
check('13 WRITE → sound saved in the library (MS 2000)', lib.includes('Xanders Bass'), {lib, toast: await T.toast()});
pn = await T.panel();
const prog = await E(() => { const e = document.querySelector('.mkx[data-k="prog"]'); return e ? e.textContent.trim() : null; });
log('prog row', prog, 'disp', pn.disp);
const progRow = await E(() => { const e = document.querySelector('.mkx[data-k="prog"]'); return e ? e.textContent.trim() : null; });
const n0cls = await E(() => document.querySelector('.mkx[data-k="n0"]') && document.querySelector('.mkx[data-k="n0"]').className);
check('13b after WRITE the panel shows the written program (Z9 name, lit number key 1)', /Xanders Bass/.test(progRow) && /\bon\b/.test(n0cls || ''), {progRow, n0cls, disp: pn.disp});
// ⋯ → Init, then number key 1 (Seite B) loads the written sound back
const uI = await T.undoN();
const dots = await T.rectText('button', /^⋯$/);
if (dots) { await T.tap(dots.cx, dots.cy, 300); log('⋯ pop', JSON.stringify(await T.popTexts())); await T.tapPop(/Init/); await sleep(400); }
const si = await E(() => SYNQUENZER.getSound(0));
check('15 ⋯ → Init → INIT MS 2000, one undo', si.engine === 'mk' && /INIT MS 2000/.test(si.name) && (await T.undoN()) === uI + 1, {name: si.name, u: (await T.undoN()) - uI});
pn = await T.panel();
if (pn.half === 'B') { await T.tapTxt('.tab, button', /^LINKS$/); await sleep(300); }
const uP = await T.undoN();
await T.tapMk('n0', 400);
const afterProg = await E(() => SYNQUENZER.getSound(0));
check('14 number key 1 (Seite B) loads the own sound, one undo, toast', afterProg.name === 'Xanders Bass' && (await T.undoN()) === uP + 1 && /Xanders Bass/.test(await T.toast() || ''), {name: afterProg.name, toast: await T.toast(), u: (await T.undoN()) - uP});
const hu = await T.rect('.hb.ur');
await T.tapTxt('.hb.ur', /^↶$/); await sleep(300);
const nU = (await E(() => SYNQUENZER.getSound(0))).name;
await T.tapTxt('.hb.ur', /^↷$/); await sleep(300);
const nR = (await E(() => SYNQUENZER.getSound(0))).name;
check('16 header ↶ → INIT MS 2000, ↷ → Xanders Bass', /INIT MS 2000/.test(nU) && nR === 'Xanders Bass', {nU, nR});
await p.screenshot({path: OUT + 'flow-' + TAG + '-3.png'});
// Synth 2 (FM-Pluck) → MS 2000 via track switch ‹ › in the editor? use selectTrack + header
await E(() => SYNQUENZER.selectTrack(1)); await sleep(500);
const mkb2 = await T.rectText('button', /^MS ?2000$/);
if (mkb2) await T.tap(mkb2.cx, mkb2.cy, 600); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); if (c) { await T.tap(c.cx, c.cy, 300); await T.tapPop(/MS ?2000/); await sleep(600); } }
check('17 Synth 2 (FM) → MS 2000', (await E(() => SYNQUENZER.getSound(1))).engine === 'mk', (await E(() => SYNQUENZER.getSound(1))).name);
// close the editor (✕) and play scene 1 then 2 by touch; MS 2000 tracks must sound
await T.tapTxt('button', /^✕$/); await sleep(400);
await E(() => { SYNQUENZER.selectTrack(0); });
await T.tapSel('#bPlay'); await sleep(2500);
const nl = await E(() => SYNQUENZER.noteLog(400).filter(n => n.track <= 1).length);
const pkPlay = await lvl(800);
const sb = await T.tapTxt('button.scn', /^▶\s*2/); await sleep(3000);
const nl2 = await E(() => SYNQUENZER.noteLog(400).filter(n => n.track <= 1).length);
await T.tapSel('#bPlay'); await sleep(1500);
const vAfter = await E(() => SYNQUENZER.voices().filter(v => v.state !== 'off').length);
check('18 ▶ demo: MS 2000 tracks play (notes on track 0/1), scene 2 by touch, ■ → no hanging voice', nl > 0 && nl2 > nl && pkPlay > -40 && vAfter === 0, {nl, nl2, pkPlay, sb: !!sb, vAfter});
fs.writeFileSync(OUT + 'flow-' + TAG + '-project.json', await E(() => SYNQUENZER.serialize()));
check('no console errors', errs.length === 0, errs.slice(0, 6));
await T.br.close(); done();
