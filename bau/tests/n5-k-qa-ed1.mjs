// QA K1: open the synth editor by finger (track head -> KLANG), ⋯ -> Modulationen, read the rows
import {open, sleep} from './n5-k-qa-lib.mjs';
const L = process.argv[2] === 'L', vp = L ? [844, 390] : [390, 844], tag = L ? 'L' : 'P';
const T = await open({vp, dpr: 2});
const {E} = T;
const out = [];
for (const [ti, name] of [[0, 'SYNTH 1'], [1, 'SYNTH 2'], [2, 'SYNTH 3'], [3, 'SYNTH 4'], [5, 'MELODIE']]) {
  await E(() => { try { closePop(); } catch (e) {} if (R.editor) closeEditor(); });
  await sleep(300);
  const th = (await T.find('.th', new RegExp('^' + name, 'i')))[0];
  if (!th) { out.push({ti, err: 'no head'}); continue; }
  await T.tap(th.cx, th.cy, 300);
  const k = await T.tapSel('button', /^KLANG$/, 900);
  if (!k) { out.push({ti, err: 'no KLANG', sel: await E(() => R.selT)}); continue; }
  const ed = await E(() => ({editor: R.editor, selT: R.selT, tab: ED.tab, eng: S.tracks[R.selT].sound.engine}));
  const more = await T.find('#synthSheet .edm, #synthSheet .mkqmore');
  await T.shot('ed1-' + tag + '-t' + ti + '-editor');
  if (!more.length) { out.push({ti, ed, err: 'no ⋯'}); continue; }
  await T.tap(more[0].cx, more[0].cy, 350);
  const items = await E(() => [...document.querySelectorAll('.pop button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()));
  const mi = (await T.find('.pop button', /^Modulationen/))[0];
  if (!mi) { out.push({ti, ed, more: more[0], items, err: 'no Modulationen'}); continue; }
  await T.tap(mi.cx, mi.cy, 450);
  await T.shot('ed1-' + tag + '-t' + ti + '-mods');
  const pop = await E(() => { const p = document.querySelector('.pop.k1pop'); if (!p) return null; const r = p.getBoundingClientRect();
    return {r: [r.x, r.y, r.width, r.height].map(Math.round), rows: [...p.querySelectorAll('.k1mr')].map(x => x.querySelector('b').textContent + ' | ' + x.querySelector('small').textContent),
      empty: (p.querySelector('.k1empty') || {}).textContent || null, clip: [...p.querySelectorAll('b, small, h4')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent), list: SYNQUENZER.k1Mods(R.selT).length}; });
  out.push({ti, name, ed, more: [Math.round(more[0].w), Math.round(more[0].h)], menuItem: mi.t, pop});
}
for (const o of out) console.log(JSON.stringify(o));
console.log('errors', JSON.stringify(T.errs.slice(0, 5)));
await T.b.close();
