// K1-fix by finger (CDP touch), P and L: FM pitch envelope row (Tipp -> TONH., ✕, [Rückgängig] tapped 4 px above its box,
// the open list follows), FM graph LFO FM row (Tipp -> FELD MOD row lit), MS 2000 STEUER 2 row (Tipp -> LCD), vocoder row
import {open} from './n5-k-qa-lib.mjs';
const L = process.argv[2] === 'L', vp = L ? [844, 390] : [390, 844];
const T = await open({vp}), E = T.E, J = (k, x) => console.log(k, JSON.stringify(x));
await E(async () => { SYNQUENZER.newProject(); mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); });
const openList = async t => { await E(t => { selectTrack(t); openEditor(); }, t); await T.p.waitForTimeout(500);
  const more = (await T.find('#synthSheet .edm, #synthSheet .mkqmore'))[0]; await T.tap(more.cx, more.cy, 350);
  const mi = (await T.find('.pop button', /^Modulationen/))[0]; if (mi) await T.tap(mi.cx, mi.cy, 450); return mi && mi.t; };
const rows = () => E(() => [...document.querySelectorAll('.pop.k1pop .k1mr')].map(x => x.textContent.replace('✕', '').trim()));
// 1. FM pitch envelope
await E(() => SYNQUENZER.setFmPeg(1, {r: [60, 40, 99, 99], l: [62, 50, 50, 50]}));
J('fmPeg menu', await openList(1)); J('rows', await rows());
let r = (await T.find('.pop.k1pop .k1go'))[0]; await T.tap(r.cx, r.cy, 500);
J('tap', await E(() => ({pop: !!document.querySelector('.pop.k1pop'), tab: ED.tab, sub: ED.sub.envfm, on: (EL.synthSheet.querySelector('.stab.on') || {}).textContent})));
await T.shot('../n5-k-fix-' + (L ? 'L' : 'P') + '-tonh');
await openList(1); let x = (await T.find('.pop.k1pop .k1x'))[0]; await T.tap(x.cx, x.cy, 300);
J('after ✕', {rows: await rows(), peg: await E(() => sndOf(1).p.fm6.peg || null)});
const tb = (await T.find('#toast button'))[0]; J('toast btn', tb && [Math.round(tb.w), Math.round(tb.h)]);
await T.tap(tb.cx, tb.y - 4, 300);   // above the visible box: the enlarged hit area
J('after toast tap above the box', {rows: await rows(), peg: await E(() => sndOf(1).p.fm6.peg)});
await E(() => closePop());
// 2. FM graph LFO FM on OP 1
await E(() => { const A = SYNQUENZER, x = A.fmxFromFm6(sndOf(1).p.fm6); x.ops[0].lfoFm = 18; A.setFmx(1, x); });
await openList(1); J('rows fmx', await rows());
r = (await T.find('.pop.k1pop .k1go', /LFO 1/))[0]; await T.tap(r.cx, r.cy, 250);
J('tap fmx', await E(() => ({tab: ED.tab, sub: ED.sub.osc, page: FXF.page, focus: FXF.focus, lit: [...EL.synthSheet.querySelectorAll('.k1hl')].map(e => e.dataset.key)})));
await T.shot('../n5-k-fix-' + (L ? 'L' : 'P') + '-feld');
await E(() => closeEditor());
// 3. MS 2000 Streichsatz on Synth 1, 4. Vokalwah
for (const id of ['f-mk-a11', 'f-mk-h11']) {
  await E(id => loadPreset(0, id), id); await openList(0); J(id + ' rows', await rows());
  r = (await T.find('.pop.k1pop .k1go'))[0]; await T.tap(r.cx, r.cy, 600);
  J(id + ' tap', await E(() => ({pop: !!document.querySelector('.pop.k1pop'), lcd: [...EL.synthSheet.querySelectorAll('.lcd')].map(e => e.innerText.replace(/\s+/g, ' ')).filter(x => x).slice(0, 2)})));
  await T.shot('../n5-k-fix-' + (L ? 'L' : 'P') + '-' + id);
  await E(() => closeEditor());
}
J('errors', T.errs.slice(0, 5)); await T.b.close();
