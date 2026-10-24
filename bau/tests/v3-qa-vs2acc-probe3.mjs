import {open, sleep} from './v3-qa-vs2acc-h.mjs';
for (const vp of ['P3', 'L1']) {
  const H = await open({vp}), p = H.p;
  await p.evaluate(() => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setClip(5, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 2, n: 60, v: 0.8}]}); Q.openRoll(5, 0); });
  await sleep(400);
  console.log(vp, await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => ['+12', '−12', 'Dupl.', 'Legato', 'Teilen', 'Verbinden', 'Quant.'].includes(b.textContent)).map(b => b.textContent + ' ' + Math.round(b.getBoundingClientRect().height)).join(' | ')));
  await H.br.close();
}
