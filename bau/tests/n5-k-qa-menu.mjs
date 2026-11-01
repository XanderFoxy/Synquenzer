// QA K1: the ⋯ menu entry „Modulationen (n)“ in all formats: clipped? inside the screen? height >= 44?
import {open, sleep, OUT} from './n5-k-qa-lib.mjs';
for (const vp of [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]]) {
  const T = await open({vp, dpr: 2}); const {E} = T;
  for (const [name, id] of [['SYNTH 3', null], ['SYNTH 2', 'f-mk-d05']]) {
    await E(() => { try { closePop(); } catch (e) {} if (R.editor) closeEditor(); });
    if (id) await E(async id => { mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); loadPreset(1, id); }, id);
    await sleep(300);
    const th = (await T.find('.th', new RegExp('^' + name, 'i')))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 1200);
    const m = (await T.find('#synthSheet .edm, #synthSheet .mkqmore'))[0]; if (!m) { console.log(vp.join('x'), name, 'no ⋯'); continue; }
    await T.tap(m.cx, m.cy, 400);
    const r = await E(() => { const b = document.querySelector('.pop button[data-a="k1m"]'); if (!b) return null; b.scrollIntoView({block: 'nearest'}); const q = b.getBoundingClientRect(), pop = b.closest('.pop').getBoundingClientRect();
      return {h: Math.round(q.height), w: Math.round(q.width), inView: q.top >= 0 && q.bottom <= innerHeight && q.left >= 0 && q.right <= innerWidth, popInside: pop.left >= 0 && pop.right <= innerWidth && pop.top >= 0 && pop.bottom <= innerHeight + 1,
        clip: [...b.querySelectorAll('b, small')].filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2).map(e => e.textContent), txt: b.innerText.replace(/\n/g, ' | ')}; });
    console.log(vp.join('x'), name.padEnd(8), JSON.stringify(r));
    await T.shot('menu-' + vp.join('x') + '-' + name.replace(' ', ''));
  }
  await T.b.close();
}
