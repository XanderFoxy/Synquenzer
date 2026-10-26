// Independent verification of G-MK34-merge (MK3 timbres x MK4 effects) with real CDP touch at 390x844 (P) / 844x390 (L).
// Usage: node vgmk34-merged.mjs P|L   (SYNQ_APP may point at another build)
import {open, sleep, OUT, check, done, eq, diff} from './vgmk34-tl3.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open(Object.assign({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}, process.env.SYNQ_APP ? {file: process.env.SYNQ_APP} : {})); const {p, E, errs} = T;
console.log('APP', await E(() => SYNQUENZER.version));
const log = (...a) => console.log(...a);
const pm = () => T.pm(0);
const U = () => T.undoN();
const lcd = () => E(() => (typeof ED !== 'undefined' && ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ').trim() : null));
const pn = () => T.panel();
// clipped text inside the MS 2000 panel and the LCD (text rect outside an ancestor that clips, or scrollWidth > clientWidth with overflow hidden)
const clipped = () => E(() => {
  const roots = [...document.querySelectorAll('.mkx[data-k], #mkWh, .lcd')].filter(e => e.getClientRects().length);
  const out = [];
  for (const root of roots) for (const e of [root, ...root.querySelectorAll('*')]) {
    if (!e.getClientRects().length || e.closest('.mqi')) continue;   // .mqi = LCD marquee (scrolls by design)
    const own = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
    if (!own.length) continue;
    const rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect();
    const cs = getComputedStyle(e);
    if (/hidden|clip/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) out.push((root.dataset.k || root.className) + ' > ' + e.className + ' "' + e.textContent.trim().slice(0, 30) + '" sw ' + e.scrollWidth + ' > cw ' + e.clientWidth);
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const as = getComputedStyle(a); if (!/hidden|clip/.test(as.overflowX + as.overflowY)) continue;
      const ar = a.getBoundingClientRect();
      if (tr.width && (tr.left < ar.left - 1 || tr.right > ar.right + 1)) { out.push((root.dataset.k || root.className) + ' > ' + e.className + ' "' + e.textContent.trim().slice(0, 30) + '" text ' + Math.round(tr.left) + '..' + Math.round(tr.right) + ' outside ' + (a.className || a.tagName) + ' ' + Math.round(ar.left) + '..' + Math.round(ar.right)); break; }
    }
  }
  return [...new Set(out)];
});
const allClip = [];
const noteClip = async lab => { const c = await clipped(); if (c.length) allClip.push(lab + ': ' + c.join(' | ')); return c; };
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b = await T.rectText('button', /^MS ?2000$/); if (b) await T.tap(b.cx, b.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
check('A0 Synth 1 → MS 2000 by touch', (await E(() => SYNQUENZER.getSound(0).engine)) === 'mk');
await noteClip('start');
// keys of the on-screen keyboard (sorted by x) and their notes
const keyRects = await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).map(k => { const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .45 : .8), b: k.classList.contains('b')}; }));
const kx = keyRects.slice().sort((a, b) => a.cx - b.cx);
const noteOfKey = async k => { const n0 = await E(() => SYNQUENZER.noteLog(1)[0]?.seq || 0); await T.send('touchStart', [{x: k.cx, y: k.cy, id: 90}]); await sleep(60); await T.send('touchEnd', []); await sleep(80); const l = await E(() => SYNQUENZER.noteLog(4)); const e = l.filter(x => x.seq > n0 && x.track === 0).pop(); return e ? e.out : null; };
const base = await noteOfKey(kx[0]); log('first key', base, 'keys', kx.length);
// --- STIMME → Schicht (Layer) by touch
log('w1', await T.w('w1', /^1 STIMME/));
await T.tapMk('k1', 300); await T.tapPop(/^Schicht$/); await sleep(500);
let m = await pm();
check('A1 EINZELN → Schicht (list by touch): mode 1', m.mode === 1, {mode: m.mode});
// --- TIMBRE → T2
await T.tapMk('timbre', 300);
let P = await pn();
check('A2 TIMBRE tap → T2 (panel.timbre 2)', P.timbre === 2, {timbre: P.timbre});
// all EDIT-WAHL 1 positions with T2: paths of timbre params go to t.1, LCD says T2
const w1rows = []; const bad1 = [];
for (let k = 0; k < 11; k++) {
  const sel = await T.w('w1', new RegExp('^' + (k + 1) + ' '));
  P = await pn(); const lc = await lcd();
  const paths = P.knobs.map(x => x && x.p).filter(Boolean);
  w1rows.push([k + 1, sel && sel.pos, paths.join(','), lc && lc.slice(0, 50)]);
  if (!sel || sel.wahl !== 1 || sel.pos !== k) bad1.push('pos ' + k + ' sel ' + JSON.stringify(sel));
  await noteClip('T2 W1 ' + (k + 1));
}
log('W1 rows T2', JSON.stringify(w1rows));
check('A3 EDIT-WAHL 1 all 11 positions by touch with T2: selected, LCD says T2', !bad1.length, bad1.slice(0, 6));
// all EDIT-WAHL 2 positions with T2
const w2rows = []; const bad2 = [];
for (let k = 0; k < 11; k++) {
  const sel = await T.w('w2', new RegExp('^' + (k + 1) + ' '));
  P = await pn(); const lc = await lcd();
  const ks = P.knobs.map(x => x && (x.p || (x.dark ? 'dark:' + x.l : x.l))).filter(Boolean);
  w2rows.push([k + 1, sel && sel.pos, ks.join(','), lc && lc.slice(0, 70)]);
  if (k >= 7 && k <= 8 || k === 10) { /* ARP/SEQ dark until MK5/MK6: list row may be disabled */ }
  else if (!sel || sel.wahl !== 2 || sel.pos !== k) bad2.push('pos ' + k + ' sel ' + JSON.stringify(sel));
  if (k >= 4 && k <= 6) { for (const x of P.knobs) if (x && x.p && /^t\./.test(x.p)) bad2.push('FX pos ' + k + ' path ' + x.p + ' (timbre path for a sound effect)'); if (/\bT2\b/.test(lc || '')) bad2.push('FX pos ' + k + ' LCD has T2 prefix: ' + lc); }
  if (k === 9) { const ok9 = P.knobs.some(x => x && /scl|scale/.test(x.p || '')) || /STIMMUNG/.test(lc || ''); if (!ok9) bad2.push('STIMMUNG pos knobs ' + JSON.stringify(P.knobs)); }
  await noteClip('T2 W2 ' + (k + 1));
}
log('W2 rows T2', JSON.stringify(w2rows));
check('A4 EDIT-WAHL 2 all positions by touch with T2: PATCH LCD T2, MOD-FX/DELAY/EQ sound-level without T2 prefix, STIMMUNG', !bad2.length, bad2.slice(0, 6));
// real edits with T2: FILTER RESONANZ and PATCH 1 INTENS. go to t[1] only
{ const a0 = await pm(); await T.w('w1', /^6 FILTER/); await T.dragMk('k2', -70, 12); const a1 = await pm();
  await T.w('w2', /^1 /); await T.dragMk('k2', -70, 12); const a2 = await pm();
  check('A4b T2 chosen: RESONANZ drag and PATCH 1 INTENS. drag change t[1] only (T1 deep-equal), LCD T2', eq(a2.t[0], a0.t[0]) && a1.t[1].f.res !== a0.t[1].f.res && a2.t[1].p[0].i !== a0.t[1].p[0].i, {res: [a0.t[1].f.res, a1.t[1].f.res], pi: [a0.t[1].p[0].i, a2.t[1].p[0].i], dT1: diff(a2.t[0], a0.t[0]).slice(0, 3), lcd: await lcd()}); }
// --- effects edited while T2 is chosen: sound-level, one undo each, T1/T2 unchanged
const tim0 = (await pm()).t;
await T.w('w2', /^5 /); let u0 = await U();
await T.knobList('k0', /^Ensemble$/);
await T.dragMk('k2', -90, 14);   // TIEFE (knob 3 of MOD-FX is at k2)
m = await pm(); let lcA = await lcd();
check('A5 T2 chosen: MOD-FX TYP Ensemble + TIEFE drag → mk.mfx changes, timbres deep-equal, 2 undos, LCD without T2', m.mfx.type === 1 && m.mfx.dep > 20 && eq(m.t, tim0) && (await U()) === u0 + 2 && !/\bT2\b/.test(lcA || ''), {mfx: m.mfx, u: (await U()) - u0, lcd: lcA, dT: diff(m.t, tim0).slice(0, 3)});
await T.w('w2', /^6 /); u0 = await U();
await T.knobList('k1', /^an$/);
await T.dragMk('k3', -110, 16);   // DELAY TIEFE
m = await pm(); lcA = await lcd();
check('A6 T2 chosen: DELAY TEMPO SYNC an + TIEFE drag → mk.dly, timbres unchanged, 2 undos', m.dly.sync === 1 && m.dly.dep > 20 && eq(m.t, tim0) && (await U()) === u0 + 2, {dly: m.dly, u: (await U()) - u0, lcd: lcA});
// "geändert" dots in the EDIT-WAHL 2 list: MOD-FX and DELAY marked with T2 and with T1 (sound-level)
const dots = async () => { await T.tapMk('w2', 350); const r = await E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => ({t: b.textContent.trim().slice(0, 14), dot: !!b.querySelector('.wdot, .dot, .chg, .mdot, [class*="dot"]'), cls: b.className}))); await T.closePop(); await sleep(450); return r; };
const wiaB = await T.rectText('button', /^◎$/); if (wiaB) await T.tap(wiaB.cx, wiaB.cy, 400);
const dotsOf = async () => { await T.tapMk('w2', 350); const r = await E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => !!b.querySelector('.mwdot'))); await T.closePop(); await sleep(450); return r; };
const d2 = await dotsOf(); log('W2 dots with T2', JSON.stringify(d2));
// --- STIMMUNG with T2 chosen (program level)
await T.w('w2', /^10 /); u0 = await U();
await T.tapMk('k0', 300); const sclList = await T.popTexts(); const wm3 = await T.tapPop(/Werckmeister/); await sleep(500);
m = await pm(); lcA = await lcd();
const d2b = await dotsOf();
await T.tapMk('timbre', 300); await T.tapMk('timbre', 300); P = await pn();   // T2 -> beide -> T1
const d1 = await dotsOf(); await T.tapMk('timbre', 300); P = await pn();   // back to T2
log('W2 dots T1', JSON.stringify(d1), 'timbre now', P.timbre);
check('A7b ◎ dots: MOD-FX, DELAY, STIMMUNG marked with T2 and with T1 (sound-level); PATCH 1 only for T2 (edited there)', d2b[4] && d2b[5] && d2b[9] && d1[4] && d1[5] && d1[9] && d2b[0] && !d1[0], {d2b, d1});
check('A7 STIMMUNG list → Werckmeister III with T2 chosen: scale set, one undo', m.scale > 0 && (await U()) === u0 + 1, {scale: m.scale, list: (sclList || []).slice(0, 12), u: (await U()) - u0, lcd: lcA});
// --- TIMBRE → beide (edit sync), CUTOFF drag changes both by the same delta; an effect drag in sync is applied once
await T.tapMk('timbre', 300); P = await pn();
check('A8 TIMBRE second tap → beide', P.timbre === 'beide', {timbre: P.timbre});
await T.w('w1', /^6 FILTER/); u0 = await U(); const c0 = (await pm()).t.map(t => t.f.cut);
await T.dragMk('k1', 60, 12);
const c1 = (await pm()).t.map(t => t.f.cut);
check('A9 beide: CUTOFF drag → T1 and T2 move by the same Δ, one undo', c1[0] !== c0[0] && c1[0] - c0[0] === c1[1] - c0[1] && (await U()) === u0 + 1, {c0, c1, u: (await U()) - u0});
// same EQ drag with beide vs with T1 must give the same eq value (no double apply)
await T.w('w2', /^7 /);
const eqBefore = (await pm()).eq; u0 = await U();
await T.dragMk('k1', -60, 12);
const eqSync = (await pm()).eq; const uSync = (await U()) - u0;
await E(() => SYNQUENZER.undo()); await sleep(300);
const eqUndone = (await pm()).eq;
await T.tapMk('timbre', 300); P = await pn();   // → T1
await T.w('w2', /^7 /);
await T.dragMk('k1', -60, 12);
const eqT1 = (await pm()).eq;
check('A10 EQ TIEF-GAIN same drag with beide == with T1 (applied once), one undo; undo restores', eqSync.lg === eqT1.lg && eqSync.lg !== eqBefore.lg && uSync === 1 && eq(eqUndone, eqBefore), {eqBefore, eqSync, eqT1, uSync, eqUndone, timbreNow: P.timbre});
await E(() => SYNQUENZER.undo()); await sleep(300);
// --- SHIFT tools keep the effects (sound-level): swap, init timbre
const fx = async () => { const x = await pm(); return {mfx: x.mfx, dly: x.dly, eq: x.eq, scale: x.scale}; };
const fx0 = await fx(); const tb0 = (await pm()).t;
await T.tapMk('shift', 300); await T.tapMk('n1', 500); await sleep(300);   // SHIFT + 2 = swap
const sw = await pm();
check('A11 SHIFT+2 swap: T1↔T2 swapped, effects and STIMMUNG unchanged', eq(sw.t[0], tb0[1]) && eq(sw.t[1], tb0[0]) && eq(await fx(), fx0), {fx: await fx(), fx0, d: diff(sw.t[0], tb0[1]).slice(0, 3)});
P = await pn(); if (P.shift) { await T.tapMk('shift', 300); }
await T.tapMk('shift', 300); await T.tapMk('n3', 500); await sleep(300);   // SHIFT + 4 = init timbre
const it = await pm();
check('A12 SHIFT+4 init timbre: effects and STIMMUNG unchanged', eq(await fx(), fx0), {fx: await fx(), fx0, lcd: await lcd()});
P = await pn(); if (P.shift) { await T.tapMk('shift', 300); }
await noteClip('after tools');
// --- solo T2 with SHIFT + TIMBRE: echo plays; tap TIMBRE ends solo
P = await pn(); log('panel before solo', JSON.stringify({t: P.timbre, solo: P.solo, shift: P.shift}));
// --- wheels: hold a key, BEND with a second finger; MOD wheel
const wb = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="bend"] .mwell'); if (!e) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
const wmod = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="mod"] .mwell'); if (!e) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
const k0 = kx[Math.min(7, kx.length - 1)];
const hashW = await E(() => JSON.stringify(SYNQUENZER.getSound(0))); const uW = await U();
let bendUp = null, vHeld = null, bendBack = null, modV = null;
if (wb && wmod) {
  await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 31}]); await sleep(150);
  await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 31}, {x: wb.cx, y: wb.cy, id: 32}]);
  for (let k = 1; k <= 8; k++) { await T.send('touchMove', [{x: k0.cx, y: k0.cy, id: 31}, {x: wb.cx, y: wb.cy - k * wb.h / 16, id: 32}]); await sleep(16); }
  bendUp = await E(() => SYNQUENZER.mkWheel(0, 'bend'));
  vHeld = await E(() => SYNQUENZER.voices().filter(v => v.state !== 'off').length);
  await T.send('touchEnd', []); await sleep(300);
  bendBack = await E(() => SYNQUENZER.mkWheel(0, 'bend'));
  await T.down(wmod.cx, wmod.cy + wmod.h / 2 - 4); await T.glide(wmod.cx, wmod.cy + wmod.h / 2 - 4, wmod.cx, wmod.cy - wmod.h / 2 + 4, 10, 16); await T.up(); await sleep(150);
  modV = await E(() => SYNQUENZER.mkWheel(0, 'mod'));
}
check('A13 wheels (Layer + effects): BEND up with key held → > .4, back to 0 on release; MOD up ≈ 1; nothing stored, no undo', wb && bendUp > .4 && vHeld >= 1 && bendBack === 0 && modV > .9 && hashW === await E(() => JSON.stringify(SYNQUENZER.getSound(0))) && (await U()) === uW, {bendUp, bendBack, vHeld, modV, wb: !!wb});
await E(() => SYNQUENZER.mkWheel(0, 'mod', 0));
// --- audible: a held note with Layer + delay + ensemble sounds; after release the echo rings
const lv = async (notes, ms) => { const pts = notes.map((n, j) => ({x: kx[n].cx, y: kx[n].cy, id: 60 + j})); await T.send('touchStart', pts); await sleep(ms); const a = await T.lvl(200); await T.send('touchEnd', []); const r1 = await T.lvl(300); const r2 = await T.lvl(600); return [a, r1, r2]; };
const lvl1 = await lv([5, 9], 300);
check('A14 Layer chord with MOD-FX + DELAY sounds, echo after release', lvl1[0] > -40 && lvl1[2] > -70, {lvl1});
await p.screenshot({path: OUT + 'merged-' + TAG + '-1.png'});
// --- WRITE (touch) → library, load it on Synth 2 (API), deep-equal
const final = await pm();
await T.tapMk('write', 600); const wpop = await T.popTexts(); log('write pop', JSON.stringify(wpop));
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Merge Test'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
const sv = await T.rectText('#popLayer .pop button', /Sichern|Speichern|Als neu|Neu/); log('save btn', JSON.stringify(sv && sv.t));
if (sv) await T.tap(sv.cx, sv.cy, 900);
const lib = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => s.name));
log('lib', JSON.stringify(lib), 'toast', await T.toast());
const rec = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk').pop());
check('A16 WRITE by touch → library holds the sound with Layer, both timbres, effects, STIMMUNG', !!rec && eq(rec.p.mk, final), {name: rec && rec.name, d: rec ? diff(rec.p.mk, final).slice(0, 4) : null});
// --- A/B after WRITE: B = the written sound, A = the edit (EQ HOCH-GAIN by touch)
await T.w('w2', /^7 /); await T.dragMk('k3', 60, 12); const mkEdit = await pm();
const abB = await T.rectText('button', /^A\/B$/);
if (abB) { await T.tap(abB.cx, abB.cy, 500); }
const mB = await pm();
if (abB) { await T.tap(abB.cx, abB.cy, 500); }
const mA = await pm();
check('A15 A/B after WRITE: B = written sound (Layer, effects, timbres), A = the edit (HOCH-GAIN)', !!abB && mB && eq(mB, final) && eq(mA, mkEdit) && mkEdit.eq.hg !== final.eq.hg, {ab: !!abB, dB: mB ? diff(mB, final).slice(0, 4) : null, dA: diff(mA, mkEdit).slice(0, 4), hg: [final.eq.hg, mkEdit.eq.hg]});
await E(() => SYNQUENZER.undo()); await sleep(300);
// --- serialize → importJSON → deep-equal; reload (autosave) → deep-equal and panel works
const full0 = await T.full();
const ser = await E(() => SYNQUENZER.serialize());
await E(() => SYNQUENZER.newProject({init: true})); await sleep(600);
const okImp = await E(s => SYNQUENZER.importJSON(typeof s === 'string' ? s : JSON.stringify(s)), ser); await sleep(800);
const mImp = await pm();
check('A17 serialize → new project → importJSON → p.mk deep-equal (Layer, T2, effects, STIMMUNG)', !!okImp && eq(mImp, final), {ok: okImp, d: diff(mImp, final).slice(0, 5)});
await E(() => SYNQUENZER.save()); await sleep(1500);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await sleep(1200);
const mRel = await pm();
check('A18 reload (autosave) → p.mk deep-equal', eq(mRel, final), {d: diff(mRel, final).slice(0, 5)});
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(800);
P = await pn(); log('panel after reload', JSON.stringify({t: P && P.timbre, sel: P && P.sel, knobs: P && P.knobs.map(k => k && k.l)}));
await T.w('w2', /^6 /); P = await pn(); const lcR = await lcd();
check('A19 after reload: panel opens, EDIT-WAHL 2 → DELAY shows the stored delay', !!P && P.sel.wahl === 2 && P.sel.pos === 5 && /DELAY/.test(lcR || ''), {sel: P && P.sel, lcd: lcR});
await noteClip('after reload DELAY');
await p.screenshot({path: OUT + 'merged-' + TAG + '-2.png'});
check('A20 no clipped labels in panel/LCD over all visited states', !allClip.length, allClip.slice(0, 8));
check('A21 no console errors', errs.length === 0, errs.slice(0, 6));
fs.writeFileSync(OUT + 'merged-' + TAG + '-rows.json', JSON.stringify({w1rows, w2rows, d2}, null, 1));
await T.br.close(); done();
