// QA MK8 ui1: ‹ › by touch, toast undo, geändert dot, undo/redo chain deep-equal, LCD texts
import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = process.argv[2] || 'P1';
const b = await launch(); const {ctx, page: p, errs} = await open(b, fmt);
const cdp = await ctx.newCDPSession(p);
const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
const tap = async (x, y, w = 250) => { await send('touchStart', [{x, y, id: 1}]); await sleep(40); await send('touchEnd', []); await sleep(w); };
const tapSel = async (sel, w) => { const r = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && e.offsetWidth); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, sel); if (!r) return null; await tap(r.x, r.y, w); return r; };
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await sleep(600);
const st = () => p.evaluate(() => ({cur: mkProg.current(), head: (document.querySelector('#synthSheet .sh-head .preset .pv') || {}).innerText, chg: !!document.querySelector('#synthSheet .sh-head .preset .chg'),
  toast: (() => { const t = document.getElementById('toast'); return t && t.offsetWidth ? t.innerText.replace(/\s+/g, ' ') : null; })(), lcd: (document.querySelector('#synthSheet .lcd') || {}).innerText, u: SYNQUENZER.undoInfo().n, top: SYNQUENZER.undoInfo().top && SYNQUENZER.undoInfo().top.label,
  snd: JSON.stringify(S.tracks[0].sound)}));
const s0 = await st(); console.log('start', JSON.stringify({cur: s0.cur, head: s0.head, u: s0.u}));
const nx = '#synthSheet .sh-head .preset .pa:last-child', pv = '#synthSheet .sh-head .preset .pa:first-child';
await tapSel(nx); const s1 = await st();
console.log('after ›', JSON.stringify({cur: s1.cur, head: s1.head, toast: s1.toast, lcd: s1.lcd && s1.lcd.replace(/\s+/g, ' '), u: s1.u, top: s1.top}));
ok('› from INIT (H16) goes to ?', true, s1.cur && s1.cur.label);
await tapSel(nx); const s2 = await st();
ok('› again: one undo step', s2.u === s1.u + 1, {u1: s1.u, u2: s2.u, top: s2.top, cur: s2.cur && s2.cur.label});
ok('toast shows A..:Name with Rückgängig', /[A-H]\d\d:/.test(s2.toast || '') && /Rückgängig/.test(s2.toast || ''), s2.toast);
ok('header shows the program name, no geändert dot', s2.head && s2.head.includes(s2.cur.name) && !s2.chg, {head: s2.head, chg: s2.chg});
// tap Rückgängig in toast
const tb = await p.evaluate(() => { const t = document.getElementById('toast'); const b = t && [...t.querySelectorAll('button')].find(x => /Rückgängig/.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
if (tb) await tap(tb.x, tb.y, 300);
const s3 = await st();
ok('toast Rückgängig → previous program deep-equal', s3.snd === s1.snd && s3.cur.label === s1.cur.label, {cur: s3.cur && s3.cur.label, want: s1.cur && s1.cur.label});
// knob change → geändert dot + cur.edited
await p.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 21)); await sleep(300);
const s4 = await st();
ok('mkSet → geändert dot', s4.chg && s4.cur.edited, {chg: s4.chg, edited: s4.cur.edited});
// › on an edited sound: loads next program (edits gone), undo restores the edit
await tapSel(nx); const s5 = await st();
await p.evaluate(() => SYNQUENZER.undo()); await sleep(200); const s6 = await st();
ok('› on edited, undo restores edited sound deep-equal', s6.snd === s4.snd && s6.chg, {chg: s6.chg});
// Sichern → place popup by touch → write to C05
await tapSel('#synthSheet .sh-head .hb.sv', 400);
const pop = await p.evaluate(() => { const p = document.querySelector('.pop.mk8w'); return p && {h4: p.querySelector('h4').textContent, info: p.querySelector('.mk8i').textContent, go: p.querySelector('[data-a="go"]').textContent, sel: [...p.querySelectorAll('.mk8bk .on, .mk8sl .on')].map(x => x.textContent)}; });
console.log('pop', JSON.stringify(pop));
ok('Sichern pop default = loaded program', pop && pop.go === 'Auf ' + s6.cur.label + ' schreiben', pop);
await tapSel('.pop.mk8w .mk8bk button[data-b="3"]', 150); await tapSel('.pop.mk8w .mk8sl button[data-s="5"]', 150);
const info2 = await p.evaluate(() => document.querySelector('.pop.mk8w .mk8i').textContent);
await tapSel('.pop.mk8w [data-a="go"]', 600);
const s7 = await st();
ok('WRITE C05: cur C05 own, not edited, dot gone, 1 undo', s7.cur && s7.cur.label === 'C05' && s7.cur.own && !s7.cur.edited && !s7.chg && s7.u === s6.u + 1, {cur: s7.cur, chg: s7.chg, du: s7.u - s6.u, info2, lcd: s7.lcd && s7.lcd.replace(/\s+/g, ' '), toast: s7.toast});
// › from own C05 → C06 (factory), ‹ → back to own C05
await tapSel(nx); const s8 = await st(); await tapSel(pv); const s9 = await st();
ok('› from own C05 → C06, ‹ → own C05 again', s8.cur.label === 'C06' && !s8.cur.own && s9.cur.label === 'C05' && s9.cur.own && !s9.chg, {s8: s8.cur, s9: s9.cur});
// full undo chain back to start and redo forward: compare
const chain = await p.evaluate(async () => { const snaps = []; const snap = () => JSON.stringify({s: S.tracks[0].sound, lib: SYNQUENZER.library().map(x => [x.id, x.bank, x.slot, x.name])});
  const n0 = SYNQUENZER.undoInfo().n; snaps.push(snap());
  const back = []; for (let k = 0; k < 6; k++) { SYNQUENZER.undo(); await new Promise(r => setTimeout(r, 120)); back.push(snap()); }
  const fwd = []; for (let k = 0; k < 6; k++) { SYNQUENZER.redo(); await new Promise(r => setTimeout(r, 120)); fwd.push(snap()); }
  return {n0, first: snaps[0], back, fwd, n1: SYNQUENZER.undoInfo().n}; });
// back[i] after i+1 undos; fwd[5-i-1] should equal back[i-1]...
let mism = 0; for (let i = 0; i < 5; i++) if (chain.fwd[i] !== chain.back[4 - i]) mism++;
ok('undo ×6 then redo ×6 returns identical states', chain.fwd[5] === chain.first && mism === 0, {mism, endEq: chain.fwd[5] === chain.first});
ok('console', errs.length === 0, errs);
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
