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

for (const w of [0, 50, 150, 300, 600, 1200]) {
  await T.w('w1', /^5 MIXER/); await T.w('w1', /^6 FILTER/);
  await E(() => { const k = document.querySelector('.mkx[data-k="k1"]'); k.__mark = 1; window.__builds = 0; });
  await sleep(w);
  const c0 = (await pm(0)).t[1].f.cut;
  await T.dragMk('k1', 40, 12);
  const c1 = (await pm(0)).t[1].f.cut;
  const same = await E(() => !!document.querySelector('.mkx[data-k="k1"]').__mark);
  log('wait', w, 'cut', c0, '->', c1, 'same element', same);
}
await T.br.close(); done();
