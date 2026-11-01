// QA K1: MS 2000 programs in the editor by finger (P or L): ⋯ -> Modulationen; Streichsatz / Pendelbass (STEUER 2 = LFO 1 depth)
import {open, sleep} from './n5-k-qa-lib.mjs';
const L = process.argv[2] === 'L', vp = L ? [844, 390] : [390, 844], tag = L ? 'L' : 'P';
const T = await open({vp, dpr: 2});
const {E} = T;
await E(async () => { mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); });
for (const id of ['f-mk-a11', 'f-mk-e15']) {
  await E(id => { try { closePop(); } catch (e) {} if (R.editor) closeEditor(); loadPreset(0, id); }, id); await sleep(500);
  const th = (await T.find('.th', /^SYNTH 1/i))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 1500);
  const more = (await T.find('#synthSheet .edm, #synthSheet .mkqmore'))[0];
  if (!more) { console.log(id, 'no ⋯'); continue; }
  await T.tap(more.cx, more.cy, 400);
  const mi = (await T.find('.pop button', /^Modulationen/))[0];
  if (!mi) { console.log(id, 'no item', JSON.stringify(await E(() => [...document.querySelectorAll('.pop button')].map(b => b.textContent.trim())))); continue; }
  await T.tap(mi.cx, mi.cy, 500);
  const pop = await E(() => { const p = document.querySelector('.pop.k1pop'); return p ? {rows: [...p.querySelectorAll('.k1mr')].map(x => x.textContent.replace('✕', '').trim()), empty: (p.querySelector('.k1empty') || {}).textContent || null} : null; });
  const pm = await E(() => { const t = SYNQUENZER.getSound(0).p.mk.t[0]; return {name: SYNQUENZER.getSound(0).name, o1: t.o1, l1: t.l1}; });
  console.log(id, JSON.stringify(pm), JSON.stringify(pop), 'more', Math.round(more.w) + 'x' + Math.round(more.h));
  await T.shot('mkui-' + tag + '-' + id);
}
console.log('errors', JSON.stringify(T.errs.slice(0, 5)));
await T.b.close();
