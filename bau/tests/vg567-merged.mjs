// Independent verification of G-MK567-merge (MK5 arp x MK6 seq x MK7 vocoder) with real CDP touch at 390x844 (P) / 844x390 (L):
// every EDIT-WAHL 1/2 position (level 1 + SHIFT) in synth and vocoder mode, every value list, arp + seq + vocoder on one sound,
// SCHRITTE / 16 BÄNDER views, wheels, save/load, clipped labels, console errors.  Usage: SYNQ_APP=<file> node vg567-merged.mjs P|L
import {open, sleep, check, done, eq, diff} from './vg567-gmk5-tl.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vgmk567/merged/';
fs.mkdirSync(OUT, {recursive: true});
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
log('APP', await E(() => SYNQUENZER.version));
const TR = 0, pm = () => T.pm(TR), U = () => T.undoN(), pn = () => T.panel();
T.shiftTo = async on => { const q = await pn(); if (!!(q && q.shift) !== !!on) await T.tapMk('shift', 350); };
// clipped text inside the MS 2000 panel, the LCD and an open list
const clipped = () => E(() => {
  const roots = [...document.querySelectorAll('.mkx[data-k], #mkWh, .lcd, #popLayer .pop')].filter(e => e.getClientRects().length);
  const out = [];
  for (const root of roots) for (const e of [root, ...root.querySelectorAll('*')]) {
    if (!e.getClientRects().length || e.closest('.mqi')) continue;
    const own = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
    if (!own.length) continue;
    const rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect();
    const cs = getComputedStyle(e);
    if (/hidden|clip/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1 && cs.textOverflow !== 'ellipsis') out.push((root.dataset.k || root.className) + ' > ' + e.className + ' "' + e.textContent.trim().slice(0, 30) + '" sw ' + e.scrollWidth + ' > cw ' + e.clientWidth);
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const as = getComputedStyle(a); if (!/hidden|clip/.test(as.overflowX + as.overflowY)) continue;
      const ar = a.getBoundingClientRect();
      if (tr.width && (tr.left < ar.left - 1 || tr.right > ar.right + 1)) { out.push((root.dataset.k || root.className) + ' > ' + e.className + ' "' + e.textContent.trim().slice(0, 30) + '" text ' + Math.round(tr.left) + '..' + Math.round(tr.right) + ' box ' + Math.round(ar.left) + '..' + Math.round(ar.right)); break; }
      break;
    }
  }
  return [...new Set(out)];
});
const allClip = [];
const noteClip = async lab => { const c = await clipped(); if (c.length) allClip.push(lab + ': ' + c.join(' | ')); return c; };
const kInfo = () => E(() => MKUI.knobs().map(d => (d ? {l: d.l, p: d.p || null, L: d.L || null, wv: !!d.wv, dark: !!d.dark, lock: !!d.lock} : null)));
const popRows = () => E(() => { const q = document.querySelector('#popLayer .pop'); return q ? {h: (q.querySelector('h4') || {}).textContent || '', rows: [...q.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.innerText.replace(/\s+/g, ' ').trim())} : null; });
const matrix = () => E(() => [...document.querySelectorAll('#synthSheet .mkx[data-k="m1"], #synthSheet .mkx[data-k="m2"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()));
await E(() => SYNQUENZER.setMetronome(false));
await T.openEd(TR);
log('toMk', await T.toMk()); await sleep(600);
check('B0 Synth 1 → MS 2000 by touch', (await E(t => SYNQUENZER.getSound(t).engine, TR)) === 'mk');
await noteClip('start');
// ---------- walk: every position of EDIT-WAHL 1 and 2, level 1 and SHIFT, every list opened by a tap
const lists = {};
async function walk(tag) {
  const rows = [], bad = [];
  for (const w of [1, 2]) for (let k = 0; k < 11; k++) {
    await T.shiftTo(false);
    const sel = await T.w('w' + w, new RegExp('^' + (k + 1) + ' ')); await sleep(150);
    if (!sel || sel.wahl !== w || sel.pos !== k) { bad.push(tag + ' W' + w + ' pos ' + (k + 1) + ' sel ' + JSON.stringify(sel)); continue; }
    for (const sh of [0, 1]) {
      await T.shiftTo(!!sh); await sleep(150);
      const P = await pn(), ki = await kInfo(), mx = await matrix(), lc = await T.lcd2();
      rows.push({tag, w, pos: k + 1, sh, knobs: ki.map(x => x && (x.dark ? 'dark:' : '') + x.l + (x.p ? '[' + x.p + ']' : '')), mx, lcd: lc && lc.slice(0, 80), shiftLevel: P.shift});
      await noteClip(tag + ' W' + w + ' ' + (k + 1) + (sh ? ' SHIFT' : ''));
      for (let j = 0; j < 5; j++) {
        const d = ki[j]; if (!d || d.dark || d.lock || !(d.L || d.wv)) continue;
        await T.tapMk('k' + j, 450); const r = await popRows();
        if (!r) { bad.push(tag + ' W' + w + ' ' + (k + 1) + (sh ? ' SHIFT' : '') + ' k' + j + ' ' + d.l + ': tap opened no list'); continue; }
        lists[tag + ' W' + w + ' ' + (k + 1) + (sh ? ' SH' : '') + ' ' + d.l + (d.p ? ' [' + d.p + ']' : '')] = r.rows;
        await noteClip(tag + ' list W' + w + ' ' + (k + 1) + ' ' + d.l);
        await T.closePop(); await sleep(450);
      }
    }
    await T.shiftTo(false);
  }
  return {rows, bad};
}
const syn = await walk('SYN');
check('B1 synth: all 22 positions selectable by touch, every list opens by tap', !syn.bad.length, syn.bad.slice(0, 8));
const darkSyn = syn.rows.filter(r => r.knobs.some(x => x && /^dark:/.test(x)));
log('dark knobs in synth', JSON.stringify(darkSyn.map(r => [r.w, r.pos, r.sh, r.knobs])));
const w2sh = syn.rows.filter(r => r.w === 2 && r.sh);
check('B2 synth SHIFT on EDIT-WAHL 2: PATCH 1–4 show no vocoder channel knobs; SEQ shows TYP/LAUF/KEY SYNC/AUFLÖSUNG', w2sh.filter(r => r.pos <= 4).every(r => !r.knobs.some(x => x && /KANAL|K-PEG|\bcl\d|\bcp\d|voc\./.test(x))) && /TYP/.test(JSON.stringify(w2sh.find(r => r.pos === 11).knobs)) && /AUFL/.test(JSON.stringify(w2sh.find(r => r.pos === 11).knobs)), w2sh.map(r => [r.pos, r.knobs]));
// value lists: subtitles that belong to the SEQ ZIEL list must not show up in other lists
const wrongSpan = Object.entries(lists).filter(([k, v]) => !/\[seq\.q/.test(k) && v.some(r => /±\d/.test(r)));
check('B3 value lists: no SEQ target span (±N) in non-SEQ lists (ARP ZIEL, PATCH ZIEL, …)', !wrongSpan.length, wrongSpan.slice(0, 6));
// ---------- arp by touch: ARP key, TYP via list, hold a chord on the keyboard
const u0 = await U();
await T.tapMk('arp', 400);
let A = await T.arp(TR);
check('B4 ARP key → arp.on, one undo, LED on', A.on === 1 && (await U()) === u0 + 1 && (await T.pinfo()).arp.on, {A, du: (await U()) - u0});
await T.w2(/^\d+ ARP A/); await sleep(300);
log('ARP A TYP list', await T.knobList('k3', /^Wechsel 2$/));
const kb = await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).length);
const chord = [0, 4, 7].map(x => Math.min(x, kb - 1));
await E(t => SYNQUENZER.arpClear(t), TR);
await T.holdKeys(chord); await sleep(1600); const keysHeld = await T.keyCls(); await T.releaseKeys(); await sleep(600);
const alog = await T.alog(TR);
check('B5 arp plays a held chord (touch on 3 keys, 1.6 s): ≥ 4 arp steps in arpLog', Array.isArray(alog) && alog.length >= 4, {n: alog && alog.length, head: JSON.stringify(alog && alog.slice(-6)), keysHeld});
// step key while ARP A is shown: key 2 → pause
const uS = await U(); await T.tapMk('n1', 400); A = await T.arp(TR);
check('B6 step key 2 → pause (mask bit 1 off), one undo', !(A.steps & 2) && (await U()) === uS + 1, {steps: A.steps});
// ---------- SEQ by touch: SEQ AN, ZIEL CUTOFF, SCHRITTE paint, back
await T.w2(/^11 /); await sleep(300);
let ki = await kInfo(); log('SEQ knobs', JSON.stringify(ki.map(x => x && x.l)));
log('SEQ AN', await T.knobList('k0', /^an$/));
log('SEQ ZIEL', await T.knobList('k2', /^CUTOFF/));
let sq = (await pm()).t[0].seq;
check('B7 SEQ AN an + ZIEL CUTOFF by touch', sq.on === 1 && sq.q[0].k === 11, {on: sq.on, k: sq.q[0].k});
const mx11 = await matrix();
await T.tapMk('m2', 600); let P = await pn();
check('B8 matrix row SEQ → SCHRITTE view (P.view schritte)', P.view === 'schritte', {view: P.view, mx11});
await noteClip('SCHRITTE');
await p.screenshot({path: OUT + 'schritte-' + TAG + '.png'});
const col = await E(() => { const c = document.querySelector('#synthSheet canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; });
const uP = await U();
if (col) { await T.down(col.x + col.w * .03, col.y + col.h * .35); await sleep(30); await T.glide(col.x + col.w * .03, col.y + col.h * .35, col.x + col.w * .03, col.y + col.h * .1, 10, 20); await T.up(); await sleep(400); }
sq = (await pm()).t[0].seq;
check('B9 SCHRITTE: drag in column 1 changes step 1, one undo', sq.q[0].v[0] !== 0 && (await U()) === uP + 1, {v: sq.q[0].v.slice(0, 4), du: (await U()) - uP, col});
await T.tapMk('back', 500); P = await pn();
check('B10 ◂ GERÄT closes SCHRITTE', !P.view, {view: P.view});
// arp + seq together: hold chord, the seq step moves (scope)
await T.holdKeys(chord); await sleep(300);
const sc1 = await E(t => { SYNQUENZER.mkScope(t); return null; }, TR); await sleep(250);
const s1 = await E(t => JSON.stringify(SYNQUENZER.mkScope(t) && SYNQUENZER.mkScope(t).seq), TR); await sleep(700);
const s2 = await E(t => JSON.stringify(SYNQUENZER.mkScope(t) && SYNQUENZER.mkScope(t).seq), TR);
await T.releaseKeys(); await sleep(500);
check('B11 arp + seq on one sound: seq scope reports and moves while the arp plays', s1 && s1 !== 'null' && s1 !== s2, {s1: (s1 || '').slice(0, 120), s2: (s2 || '').slice(0, 120)});
// ---------- vocoder: STIMME → Vocoder, walk all positions (green names), channels, 16 BÄNDER, SEQ empty, HALTEN
await T.w1(/^1 STIMME/); log('VOC', await T.knobList('k0', /^Vocoder$/));
check('B12 SYNTH/VOC. list → Vocoder (mode 3)', (await pm()).mode === 3, (await pm()).mode);
const voc = await walk('VOC');
check('B13 vocoder: all 22 positions selectable, every list opens', !voc.bad.length, voc.bad.slice(0, 8));
const v2 = voc.rows.filter(r => r.w === 2);
check('B14 vocoder EDIT-WAHL 2: PATCH 1–4 → channel knobs (level 1 and SHIFT); SEQ position empty', v2.filter(r => r.pos <= 4).every(r => r.knobs.filter(Boolean).length >= 4 && r.knobs.every(x => !x || /cl\d|cp\d|voc\./.test(x))) && v2.filter(r => r.pos === 11).every(r => r.knobs.every(x => !x)), v2.filter(r => r.pos <= 4 || r.pos === 11).map(r => [r.pos, r.sh, r.knobs, r.mx]));
const wrongSpanV = Object.entries(lists).filter(([k, v]) => /^VOC/.test(k) && !/\[seq\.q/.test(k) && v.some(r => /±\d/.test(r)));
log('vocoder lists with ±N', JSON.stringify(wrongSpanV.slice(0, 4)));
await T.w2(/^1 /); await T.tapMk('m2', 600); P = await pn();
check('B15 vocoder: matrix row K-PEGEL A → 16 BÄNDER', P.view === 'baender', {view: P.view});
await noteClip('16 BÄNDER'); await p.screenshot({path: OUT + 'baender-' + TAG + '.png'});
await T.tapMk('back', 500);
await T.w2(/^11 /); await sleep(200); const mxS = await matrix(); await T.tapMk('m2', 500); P = await pn();
check('B16 vocoder: SEQ row shows „nicht im Vocoder“, tap opens no SCHRITTE', !P.view && /nicht im Vocoder/.test(mxS.join(' ')), {view: P.view, mxS});
const uH = await U(); await T.tapMk('timbre', 700);
const m3 = await pm();
check('B17 TIMBRE/HALTEN in the vocoder: voc.hold stored, one undo', Array.isArray(m3.voc.hold) && (await U()) === uH + 1, {hold: m3.voc.hold && m3.voc.hold.slice(0, 4), du: (await U()) - uH});
// arp still runs in the vocoder
await E(t => SYNQUENZER.arpClear(t), TR);
await T.holdKeys(chord); await sleep(1200); await T.releaseKeys(); await sleep(500);
const alV = await T.alog(TR);
check('B18 vocoder + arp: held chord arpeggiates', Array.isArray(alV) && alV.length >= 3, {n: alV && alV.length});
await T.w1(/^1 STIMME/); log('SYN', await T.knobList('k0', /^Synth/));
check('B19 back to Synth (mode 0), seq and arp kept', (await pm()).mode === 0 && (await pm()).t[0].seq.on === 1 && (await pm()).arp.on === 1, {mode: (await pm()).mode});
// ---------- wheels (BEND with a key held, MOD)
const wb = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="bend"] .mwell'); if (!e) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
const wmod = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="mod"] .mwell'); if (!e) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
const k0 = await T.key(Math.min(5, kb - 1));
const hashW = await E(t => JSON.stringify(SYNQUENZER.getSound(t)), TR); const uW = await U();
let bendUp = null, bendBack = null, modV = null;
if (wb && wmod) {
  await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 31}]); await sleep(150);
  await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 31}, {x: wb.cx, y: wb.cy, id: 32}]);
  for (let k = 1; k <= 8; k++) { await T.send('touchMove', [{x: k0.cx, y: k0.cy, id: 31}, {x: wb.cx, y: wb.cy - k * wb.h / 16, id: 32}]); await sleep(16); }
  bendUp = await E(t => SYNQUENZER.mkWheel(t, 'bend'), TR);
  await T.send('touchEnd', []); await sleep(300);
  bendBack = await E(t => SYNQUENZER.mkWheel(t, 'bend'), TR);
  await T.down(wmod.cx, wmod.cy + wmod.h / 2 - 4); await T.glide(wmod.cx, wmod.cy + wmod.h / 2 - 4, wmod.cx, wmod.cy - wmod.h / 2 + 4, 10, 16); await T.up(); await sleep(150);
  modV = await E(t => SYNQUENZER.mkWheel(t, 'mod'), TR);
}
check('B20 wheels: BEND up with a key held → > .4, back to 0; MOD up ≈ 1; nothing stored, no undo', wb && bendUp > .4 && bendBack === 0 && modV > .9 && hashW === await E(t => JSON.stringify(SYNQUENZER.getSound(t)), TR) && (await U()) === uW, {bendUp, bendBack, modV, du: (await U()) - uW});
await E(t => SYNQUENZER.mkWheel(t, 'mod', 0), TR);
await noteClip('after wheels');
await p.screenshot({path: OUT + 'panel-' + TAG + '.png'});
// ---------- save / load
const final = await pm();
const ser = await E(() => SYNQUENZER.serialize());
await E(() => SYNQUENZER.newProject({init: true})); await sleep(600);
const okImp = await E(s => SYNQUENZER.importJSON(typeof s === 'string' ? s : JSON.stringify(s)), ser); await sleep(800);
const mImp = await pm();
check('B21 serialize → new project → importJSON → p.mk deep-equal (arp, seq, voc)', !!okImp && eq(mImp, final), {ok: okImp, d: diff(mImp, final).slice(0, 5)});
await E(() => SYNQUENZER.save()); await sleep(1500);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await sleep(1200);
const mRel = await pm();
check('B22 reload (autosave) → p.mk deep-equal', eq(mRel, final), {d: diff(mRel, final).slice(0, 5)});
await T.openEd(TR); await sleep(400);
await T.w2(/^9 ARP B/); P = await pn();
check('B23 after reload: panel opens on ARP B, ARP LED on', P && P.sel.wahl === 2 && P.sel.pos === 8 && P.arp.on, {sel: P && P.sel, arp: P && P.arp});
await E(t => SYNQUENZER.arpClear(t), TR);
await T.holdKeys(chord); await sleep(1200); await T.releaseKeys(); await sleep(400);
const alR = await T.alog(TR);
check('B24 after reload the arp plays at the first touch', Array.isArray(alR) && alR.length >= 3, {n: alR && alR.length});
await noteClip('after reload');
check('B25 no clipped labels in panel/LCD/lists over all visited states', !allClip.length, allClip.slice(0, 10));
check('B26 no console errors', errs.length === 0, errs.slice(0, 6));
fs.writeFileSync(OUT + 'rows-' + TAG + '.json', JSON.stringify({syn: syn.rows, voc: voc.rows, lists}, null, 1));
await T.br.close(); done();
