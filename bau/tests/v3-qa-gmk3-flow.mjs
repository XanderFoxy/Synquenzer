// QA G-MK3 flow (CDP touch): Synth 1 → MS 2000, STIMME → Split, Split ← nächste Note, TIMBRE T2/beide, Solo, STIMMUNG, EIGENE,
// SHIFT tools, WRITE, copy into Synth 2, scenes. argv[2] = P | L
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk3-tl.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const pm = t => E(t => SYNQUENZER.mkGet(t), t);
const scope = async t => { await E(t => SYNQUENZER.mkScope(t), t); await sleep(120); return E(t => { const s = SYNQUENZER.mkScope(t); return s && s.voices.map(v => ({n: v.note, t: v.tb === 2 ? 1 : 0, eg2: +(+v.eg2).toFixed(2)})); }, t); };
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const toMk = async () => { const b = await T.rectText('button', /^MS ?2000$/); if (b) { await T.tap(b.cx, b.cy, 900); return; } const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); };
await toMk();
const u0 = await T.undoN();
check('0 Synth 1 → MS 2000 by touch', (await E(() => SYNQUENZER.getSound(0).engine)) === 'mk', u0);
// keyboard: find the notes of the keys (tap each key once, read the log)
const keyRects = await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).map(k => { const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .45 : .8), b: k.classList.contains('b'), cl: (k.querySelector('.cl') || {}).textContent || ''}; }));
const firstC = keyRects.find(k => /^C-?\d/.test(k.cl)); log('keys', keyRects.length, 'first label', firstC && firstC.cl);
const noteOfKey = async k => { const n0 = await E(() => SYNQUENZER.noteLog(1)[0]?.seq || 0); await T.send('touchStart', [{x: k.cx, y: k.cy, id: 90}]); await sleep(60); await T.send('touchEnd', []); await sleep(60); const l = await E(() => SYNQUENZER.noteLog(4)); const e = l.filter(x => x.seq > n0 && x.track === 0).pop(); return e ? e.out : null; };
const base = await noteOfKey(keyRects[0]); log('first key plays', base);
// sorted keys by x: white and black; key index = semitone offset (chromatic)
const kx = keyRects.slice().sort((a, b) => a.cx - b.cx);
const keyFor = n => kx[n - base];
// helper: hold notes (touch) and measure per-timbre voices + master peak
const hold = async (notes, ms = 400) => { const pts = notes.map((n, j) => ({x: keyFor(n).cx, y: keyFor(n).cy, id: 100 + j})); await T.send('touchStart', pts); await sleep(ms); const sc = await scope(0); const lv = await T.lvl(250); await T.send('touchEnd', []); await sleep(350); return {sc, lv}; };
// 1 EDIT-WAHL 1 → STIMME (list)
const s1 = await T.w('w1', /^1 STIMME/); let pn = await T.panel();
check('1 EDIT-WAHL 1 → 1 STIMME (list by touch)', pn.sel.wahl === 1 && pn.sel.pos === 0 && pn.knobs[1].l === 'EINZELN', {sel: s1, knobs: pn.knobs.map(k => k && k.l)});
// 2 EINZELN → Split (list)
const lst = await T.tapMk('k1', 300); const pl = await T.popTexts(); await T.tapPop(/^Split$/); await sleep(300);
let m = await pm(0);
check('2 EINZELN tap → list (Einzeln/Schicht/Split) → Split: mode 2, one undo', m.mode === 2 && (await T.undoN()) === u0 + 1, {list: pl, mode: m.mode, u: (await T.undoN()) - u0});
log('LCD', JSON.stringify(await T.lcdAll()));
// 3 the LCD key [Split ← nächste Note]: tap, then play the 5th key (E)
const lx = await T.rect('.lx.lsplit'); log('lsplit', JSON.stringify(lx));
if (lx) await T.tap(lx.cx, lx.cy, 250);
pn = await T.panel(); const armed = pn.splitArm;
const nE = base + 4; const uS = await T.undoN();
await T.send('touchStart', [{x: keyFor(nE).cx, y: keyFor(nE).cy, id: 5}]); await sleep(200); const vE = await E(() => SYNQUENZER.voices().length); await T.send('touchEnd', []); await sleep(300);
m = await pm(0);
check('3 LCD [Split ← nächste Note] → armed, next key sets split, sounds, one undo', !!lx && armed && m.split === nE && (await T.undoN()) === uS + 1 && vE >= 1, {lx: !!lx, armed, split: m.split, want: nE, u: (await T.undoN()) - uS, voices: vE, lcd: await T.lcdAll()});
// play below and above split: T1 under, T2 from split
const below = await hold([nE - 2]), above = await hold([nE + 3]);
check('4 key below split → T1 voice only, key above → T2 only', below.sc && below.sc.every(v => v.t === 0) && above.sc && above.sc.every(v => v.t === 1) && below.sc.length && above.sc.length, {below, above});
// 5 SHIFT → Ebene 2: PRIORITÄT, STIMMEN, SPLIT; tap SPLIT → armed; play next note
await T.tapMk('shift', 250); pn = await T.panel();
const k2 = pn.knobs.map(k => k && k.l);
await T.tapMk('k2', 250); pn = await T.panel(); const arm2 = pn.splitArm;
const nG = base + 7; const u5 = await T.undoN();
await T.send('touchStart', [{x: keyFor(nG).cx, y: keyFor(nG).cy, id: 6}]); await sleep(150); await T.send('touchEnd', []); await sleep(300);
m = await pm(0);
check('5 SHIFT → Ebene 2 (PRIOR./STIMMEN/SPLIT), tap SPLIT arms, next note = split, one undo', k2[1] === 'STIMMEN' && k2[2] === 'SPLIT' && arm2 && m.split === nG && (await T.undoN()) === u5 + 1, {k2, arm2, split: m.split, want: nG, u: (await T.undoN()) - u5});
// 5b drag SPLIT up (12 px steps?)
pn = await T.panel(); log('shift after split', pn.shift, JSON.stringify(pn.knobs.map(k => k && k.l)));
if (!pn.shift) await T.tapMk('shift', 250);
await T.dragMk('k2', -40, 10); m = await pm(0); log('split after drag up', m.split, 'disp', (await T.panel()).disp, JSON.stringify(await T.lcdAll()));
// set split back via drag down to C-ish: use API for the rest of the flow (keyboard range)
await T.tapMk('shift', 200);
await E(n => SYNQUENZER.mkSet(0, 'split', n), base + 6);   // F#: lower 6 keys T1, upper keys T2
const SPL = base + 6;
// 6 TIMBRE → T2, FILTER CUTOFF down for T2
const u6 = await T.undoN(); const t1before = (await pm(0)).t[0];
await T.tapMk('timbre', 250); pn = await T.panel(); const tim1 = await T.tim();
await T.w('w1', /^6 FILTER/);
await T.dragMk('k1', 90, 16);
m = await pm(0);
const lcd6 = await T.lcdAll();
check('6 TIMBRE → T2 (LED 2), CUTOFF drag edits T2 only, T1 deep-equal, one undo, LCD „T2 ·“', pn.timbre === 2 && m.t[1].f.cut < 127 && eq(m.t[0], t1before) && (await T.undoN()) === u6 + 1 && lcd6.some(x => /T2 ·/.test(x)), {timbre: pn.timbre, tim: tim1, cutT2: m.t[1].f.cut, cutT1: m.t[0].f.cut, u: (await T.undoN()) - u6, lcd: lcd6});
// T2: RESO up a bit, A-HK attack up (pad)
await T.dragMk('k2', -50, 10);
await T.w('w1', /^9 A-HK/); await T.dragMk('k0', -60, 12);
// T2 OSZ 1 WELLE → Puls (list)
await T.w('w1', /^3 OSZ 1/); await T.knobList('k0', /^Puls$/); await sleep(150);
m = await pm(0); log('T2', JSON.stringify(m.t[1].o1), 'atk', m.t[1].e2.a, 'cut', m.t[1].f.cut, 'res', m.t[1].f.res);
// 7 audible: below vs. above (spectral centroid / level)
const sb = async n => { const pts = [{x: keyFor(n).cx, y: keyFor(n).cy, id: 70}]; await T.send('touchStart', pts); await sleep(500); const s = await T.spec(400); await T.send('touchEnd', []); await sleep(500); return s; };
const spB = await sb(SPL - 1), spA = await sb(SPL + 1);
log('spectrum below', JSON.stringify(spB), 'above', JSON.stringify(spA));
// 8 TIMBRE → beide: A-HK RELEASE drag → both change by the same delta, one undo
await T.tapMk('timbre', 250); pn = await T.panel(); const tim3 = await T.tim();
await T.w('w1', /^9 A-HK/);
const r0 = (await pm(0)).t.map(t => t.e2.r); const u8 = await T.undoN();
await T.dragMk('k3', -50, 12);
const r1 = (await pm(0)).t.map(t => t.e2.r);
check('8 TIMBRE → beide (both LEDs), RELEASE drag: T1 and T2 change by the same Δ, one undo', pn.timbre === 'beide' && r1[0] - r0[0] === r1[1] - r0[1] && r1[0] !== r0[0] && (await T.undoN()) === u8 + 1, {timbre: pn.timbre, tim: tim3, r0, r1, u: (await T.undoN()) - u8, lcd: await T.lcdAll()});
// 8b list knob under „beide“: A-HK NEUSTART? use FILTER TYP list → 12LPF on both
await T.w('w1', /^6 FILTER/); await T.knobList('k0', /^12LPF$/); m = await pm(0);
check('8b beide: list (TYP → 12LPF) sets both timbres', m.t[0].f.type === 1 && m.t[1].f.type === 1, m.t.map(t => t.f.type));
await T.tapMk('timbre', 250); pn = await T.panel();
check('8c third tap → T1 again', pn.timbre === 1, {timbre: pn.timbre, tim: await T.tim()});
// 9 SHIFT + TIMBRE → solo T1: above split silent, below sounds; tap TIMBRE ends
await T.tapMk('shift', 200); await T.tapMk('timbre', 250); pn = await T.panel(); const timS = await T.tim();
const hs = await E(() => JSON.stringify(SYNQUENZER.getSound(0)));
const soloA = await hold([SPL + 2], 500), soloB = await hold([SPL - 2], 500);
await T.tapMk('timbre', 250); const pnE = await T.panel();
const afterA = await hold([SPL + 2], 500);
check('9 SHIFT + TIMBRE → solo T1 (LED blinks): T2 side silent, T1 side sounds; tap TIMBRE ends; not stored', pn.solo === 1 && /lbl|blink/.test(JSON.stringify(timS)) && soloA.lv < -80 && soloB.lv > -40 && !pnE.solo && afterA.lv > -40 && hs === await E(() => JSON.stringify(SYNQUENZER.getSound(0))), {solo: pn.solo, timS, soloA: soloA.lv, soloB: soloB.lv, after: pnE.solo, afterA: afterA.lv});
await p.screenshot({path: OUT + 'flow-' + TAG + '-1.png'});
fs.writeFileSync(OUT + 'flow-' + TAG + '-state1.json', JSON.stringify({mk: await pm(0), base, SPL}));
// 10 EDIT-WAHL 2 → STIMMUNG: Werckmeister III, GRUNDTON A, Eigene → EIGENE view
const s10 = await T.w('w2', /^10 STIMMUNG/); pn = await T.panel(); log('wahl2', JSON.stringify(s10), JSON.stringify(pn.knobs.map(k => k && k.l)));
const u10 = await T.undoN();
const l10 = await T.knobList('k0', /^Werckmeister III$/); const l10b = await T.knobList('k1', /^A$/);
m = await pm(0);
check('10 STIMMUNG → Werckmeister III, GRUNDTON → A (lists by touch), two undos', m.scale === 5 && m.skey === 9 && (await T.undoN()) === u10 + 2, {l10, l10b, scale: m.scale, skey: m.skey, u: (await T.undoN()) - u10});
const hW = await hold([SPL - 2, SPL + 2], 400); log('Werckmeister chord', JSON.stringify(hW));
await T.knobList('k0', /^Eigene$/);
pn = await T.panel(); log('matrix', JSON.stringify(pn.matrix));
await T.tapMk('m2', 400); const own = await E(() => MKUI.ownInfo());
check('11 STIMMUNG Eigene → tap matrix row → EIGENE view with 12 knobs + ◂ GERÄT', own && own.els.filter(e => /^u\d+$/.test(e.k)).length === 12, own && {w: own.w, h: own.h, n: own.els.length});
await p.screenshot({path: OUT + 'flow-' + TAG + '-eigene.png'});
const u11 = await T.undoN();
await T.dragMk('u4', -60, 12); m = await pm(0);
check('11b EIGENE knob 5 (E) drag up → usc[4] > 0, one undo', m.usc && m.usc[4] > 0 && (await T.undoN()) === u11 + 1, {usc: m.usc, u: (await T.undoN()) - u11});
const back = await T.tapMk('back', 400); pn = await T.panel();
check('11c ◂ GERÄT → panel again', !!back && pn && !pn.view, pn && pn.view);
// 12 SHIFT + 2 swap → header ↶
const mS = await pm(0); const u12 = await T.undoN();
await T.tapMk('shift', 200); await T.tapMk('n1', 400); const mW = await pm(0);
const swapOk = eq(mW.t[0], mS.t[1]) && eq(mW.t[1], mS.t[0]);
await T.tapTxt('.hb.ur', /^↶$/, 400); const mU = await pm(0);
check('12 SHIFT + 2 swaps T1/T2 (one undo), ↶ restores', swapOk && eq(mU, mS) && (await T.undoN()) === u12, {swapOk, back: eq(mU, mS), lcd: await T.lcdAll()});
// 13 WRITE → save as "Xanders Split"
await T.tapMk('write', 500);
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Xanders Split'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
const sv = await T.rectText('#popLayer .pop button', /Sichern|Speichern|Als neu|Neu/); if (sv) await T.tap(sv.cx, sv.cy, 700);
const lib = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => s.name));
check('13 WRITE → "Xanders Split" in the library', lib.includes('Xanders Split'), lib);
// 14 Synth 2 → MS 2000, SHIFT + 1 → copy T2 of "Xanders Split" into T1
await T.closePop();
await E(() => SYNQUENZER.selectTrack(1)); await sleep(600);
await toMk();
check('14a Synth 2 → MS 2000', (await E(() => SYNQUENZER.getSound(1).engine)) === 'mk', await E(() => SYNQUENZER.getSound(1).name));
const u14 = await T.undoN();
await T.tapMk('shift', 200); await T.tapMk('n0', 500);
const cp = await T.popTexts(); log('copy list', JSON.stringify(cp));
const row = await E(() => { const r = [...document.querySelectorAll('#popLayer .mkcr')].find(r => /Xanders Split/.test(r.textContent)); if (!r) return null; const b = r.querySelector('button[data-t="1"]'); const q = b.getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2, w: q.width, h: q.height}; });
if (row) await T.tap(row.cx, row.cy, 500);
const m1 = await pm(1), src = (await E(() => SYNQUENZER.library().find(s => s.name === 'Xanders Split'))).p.mk;
check('14 SHIFT + 1 → list → "Xanders Split" [T2] → Synth 2 T1 deep-equal source T2, one undo', !!row && eq(m1.t[0], src.t[1]) && (await T.undoN()) === u14 + 1, {row, d: diff(m1.t[0], src.t[1]).slice(0, 5), u: (await T.undoN()) - u14});
// 15 SHIFT + 4 → T1 INIT, ↶
const m15 = await pm(1); await T.tapMk('shift', 200); await T.tapMk('n3', 400); const m15b = await pm(1);
const init = await E(() => SQMK.init().t[0]);
await T.tapTxt('.hb.ur', /^↶$/, 400);
check('15 SHIFT + 4 → T1 = INIT, ↶ back', eq(m15b.t[0], init) && eq(await pm(1), m15), diff(m15b.t[0], init).slice(0, 4));
// 16 ⋯ menu shows the three timbre tools
const dots = await T.rectText('button', /^⋯$/); if (dots) await T.tap(dots.cx, dots.cy, 400);
const dm = await T.popTexts(); log('⋯', JSON.stringify(dm));
check('16 ⋯ lists Timbre kopieren / tauschen / neu', dm && dm.some(x => /Timbre kopieren/.test(x)) && dm.some(x => /tauschen/.test(x)) && dm.some(x => /Timbre neu|neu/.test(x)), dm);
await T.closePop();
// 17 close the editor, scenes 1–2 by touch, both MS 2000 tracks sound; Split clip notes on both sides
await E(n => { const c = SYNQUENZER.getClip(0, 0); c.notes = c.notes.map((x, k) => Object.assign(x, {n: k % 2 ? n + 5 : n - 5})); SYNQUENZER.setClip(0, 0, c); }, SPL);
await T.tapTxt('button', /^✕$/); await sleep(400);
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(2500);
const sc17 = []; for (let k = 0; k < 8; k++) { const s = await scope(0); if (s) sc17.push(...s.map(v => v.t)); await sleep(180); }
const pk17 = await T.lvl(600);
await T.tapTxt('button.scn', /^▶\s*2/); await sleep(2500);
const pk17b = await T.lvl(600);
await T.tapSel('#bPlay'); await sleep(1500);
const fin = await E(() => ({v: SYNQUENZER.voices().filter(v => v.state !== 'off').length, te: SYNQUENZER.tickErrors()}));
check('17 scenes by touch: Split clip plays on both timbres, audible, no stuck voice after ■', sc17.includes(0) && sc17.includes(1) && pk17 > -40 && pk17b > -40 && fin.v === 0 && !fin.te, {timbres: [...new Set(sc17)], pk17, pk17b, fin});
await p.screenshot({path: OUT + 'flow-' + TAG + '-end.png'});
fs.writeFileSync(OUT + 'flow-' + TAG + '-project.json', await E(() => SYNQUENZER.serialize()));
check('no console errors', errs.length === 0, errs.slice(0, 6));
await T.br.close(); done();
