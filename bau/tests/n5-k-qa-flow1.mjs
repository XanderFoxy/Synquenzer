// QA K1 musician flow by finger (demo project): Synth 3 Rom-Fläche: ⋯ -> Modulationen, ✕ LFO 2 -> Tonhöhe, toast Rückgängig,
// header ↶/↷, row tap jumps (FILTER knob lit / MOD route), „geändert“ state; then the same with the song playing
import {open, sleep} from './n5-k-qa-lib.mjs';
const L = process.argv[2] === 'L', vp = L ? [844, 390] : [390, 844], tag = L ? 'L' : 'P';
const T = await open({vp, dpr: 2});
const {E} = T;
const R_ = {};
const st = () => E(() => ({n: SYNQUENZER.k1Mods(2).length, keys: SYNQUENZER.k1Mods(2).map(e => e.key), u: SYNQUENZER.undoInfo(), edited: SYNQUENZER.soundEdited(2),
  pop: !!document.querySelector('.pop.k1pop'), popRows: document.querySelectorAll('.pop.k1pop .k1mr').length, toast: [...document.querySelectorAll('.toast, #toast, .tst')].filter(e => e.offsetWidth).map(e => e.textContent.trim()).join(' | '),
  tab: ED.tab, editor: R.editor}));
const openList = async () => {
  const more = (await T.find('#synthSheet .edm, #synthSheet .mkqmore'))[0]; if (!more) return 'no ⋯';
  await T.tap(more.cx, more.cy, 350); const mi = (await T.find('.pop button', /^Modulationen/))[0]; if (!mi) return 'no item';
  await T.tap(mi.cx, mi.cy, 450); return mi.t.slice(0, 18);
};
// open Synth 3 by finger
const th = (await T.find('.th', /^SYNTH 3/i))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 900);
R_.open = await openList(); R_.s0 = await st();
// ✕ on LFO 2 -> Tonhöhe
const x = await E(() => { const r = document.querySelector('.pop.k1pop .k1x[data-x="r:lfo2:pitch"]'); if (!r) return null; r.scrollIntoView({block: 'nearest'}); const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; });
if (x) await T.tap(x[0], x[1], 400);
R_.afterX = await st();
await T.shot('flow1-' + tag + '-afterX');
// the toast's Rückgängig
const tb = (await T.find('button', /^Rückgängig$/))[0];
R_.toastBtn = tb ? [Math.round(tb.w), Math.round(tb.h)] : null;
if (tb) await T.tap(tb.cx, tb.cy, 500);
R_.afterToastUndo = await st();
await T.shot('flow1-' + tag + '-afterToastUndo');
// if the list is still open: tap ✕ on the row now shown first
// header ↶ / ↷ after a ✕ again
if (!R_.afterToastUndo.pop) R_.reopen = await openList();
const x2 = await E(() => { const r = document.querySelector('.pop.k1pop .k1x[data-x="r:lfo2:pitch"]'); if (!r) return null; const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; });
if (x2) await T.tap(x2[0], x2[1], 400);
R_.afterX2 = await st();
// close the pop by tapping outside, then ↶ in the editor head
await E(() => { try { closePop(); } catch (e) {} }); await sleep(300);
const un = (await T.find('#synthSheet button', /^↶$/))[0]; if (un) await T.tap(un.cx, un.cy, 500);
R_.afterHeadUndo = await st();
const re = (await T.find('#synthSheet button', /^↷$/))[0]; if (re) await T.tap(re.cx, re.cy, 500);
R_.afterHeadRedo = await st();
if (un) await T.tap(un.cx, un.cy, 500);
R_.afterHeadUndo2 = await st();
// row tap: Filter-Hüllk. -> Cutoff
R_.reopen2 = await openList();
const g = await E(() => { const r = document.querySelector('.pop.k1pop .k1go[data-k="p:fenv"]'); if (!r) return null; const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; });
if (g) await T.tap(g[0], g[1], 250);
R_.jumpFenv = await E(() => ({tab: ED.tab, sub: ED.sub && ED.sub[ED.tab], lit: [...document.querySelectorAll('.k1hl')].map(e => e.dataset.key), pop: !!document.querySelector('.pop.k1pop')}));
await T.shot('flow1-' + tag + '-jumpFenv');
const litVis = await E(() => { const e = document.querySelector('.k1hl'); if (!e) return null; const r = e.getBoundingClientRect(); return {inView: r.top >= 0 && r.bottom <= innerHeight, r: [r.x, r.y, r.width, r.height].map(Math.round)}; });
R_.litVisible = litVis;
// row tap: LFO 2 -> Tonhöhe (no own knob -> MOD tab, route marked)
await openList();
const g2 = await E(() => { const r = document.querySelector('.pop.k1pop .k1go[data-k="r:lfo2:pitch"]'); if (!r) return null; const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; });
if (g2) await T.tap(g2[0], g2[1], 400);
R_.jumpLfo2 = await E(() => ({tab: ED.tab, modHl: ED.modHl, pop: !!document.querySelector('.pop.k1pop')}));
await T.shot('flow1-' + tag + '-jumpLfo2');
// row tap: Analog
await openList();
const g3 = await E(() => { const r = document.querySelector('.pop.k1pop .k1go[data-k="p:analog"]'); if (!r) return null; const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; });
if (g3) await T.tap(g3[0], g3[1], 250);
R_.jumpAnalog = await E(() => ({tab: ED.tab, sub: ED.sub && ED.sub[ED.tab], lit: [...document.querySelectorAll('.k1hl')].map(e => e.dataset.key)}));
await T.shot('flow1-' + tag + '-jumpAnalog');
for (const k in R_) console.log(k, JSON.stringify(R_[k]));
console.log('errors', JSON.stringify(T.errs.slice(0, 5)));
await T.b.close();
