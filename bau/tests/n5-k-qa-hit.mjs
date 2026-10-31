// QA K1: the hit area of the editor ⋯ (the only way to the Mod-Übersicht in portrait), the toast's Rückgängig, in 3 portrait formats
import {open, sleep} from './n5-k-qa-lib.mjs';
for (const vp of [[390, 844], [375, 667], [320, 568]]) {
  const T = await open({vp}); const {E} = T;
  const th = (await T.find('.th', /^SYNTH 3/i))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 900);
  const r = await E(() => { const b = [...document.querySelectorAll('#synthSheet .edm')].find(x => x.offsetWidth); if (!b) return null; const q = b.getBoundingClientRect();
    // effective hit area: probe points around the button, which ones land on it (or inside it)
    let hx = [q.left, q.right], hy = [q.top, q.bottom]; const on = (x, y) => { const e = document.elementFromPoint(x, y); return e && (e === b || b.contains(e)); };
    for (let d = 0; d < 20; d++) { if (on(q.left - d, q.top + q.height / 2)) hx[0] = q.left - d; if (on(q.right + d, q.top + q.height / 2)) hx[1] = q.right + d; if (on(q.left + q.width / 2, q.top - d)) hy[0] = q.top - d; if (on(q.left + q.width / 2, q.bottom + d)) hy[1] = q.bottom + d; }
    return {rect: [q.width, q.height].map(Math.round), hit: [Math.round(hx[1] - hx[0]), Math.round(hy[1] - hy[0])], cls: b.className}; });
  // tap 3 px inside the top edge and the bottom edge by finger: does the menu open?
  const m = (await T.find('#synthSheet .edm'))[0];
  await T.tap(m.cx, m.y + m.h + 5, 300); const below = await E(() => !!document.querySelector('.pop button[data-a="k1m"]')); await E(() => { try { closePop(); } catch (e) {} }); await sleep(200);
  console.log(vp.join('x'), JSON.stringify(r), 'tap 5 px below the ⋯ opens the menu:', below);
  await T.b.close();
}
