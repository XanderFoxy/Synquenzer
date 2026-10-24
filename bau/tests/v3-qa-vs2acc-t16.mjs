// T16: Mikro-Blatt (mit VS2-Abschnitt, Quelle Instrument) in L1/L2/P3: im Bild? rollt? alle Knöpfe erreichbar?
import {open, sleep, micOnApi} from './v3-qa-vs2acc-h.mjs';
for (const vp of ['P3', 'L1', 'L2']) {
  const H = await open({vp}), p = H.p;
  await micOnApi(p, 'wired');
  await p.evaluate(() => { SYNQUENZER.vsSet({src: 'inst'}); SYNQUENZER.stimmeSheet(); }); await sleep(400);
  const g = await p.evaluate(() => { const s = document.querySelector('.pop.stpop'); const R = s.getBoundingClientRect(); const bs = [...s.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 14), w: Math.round(q.width), h: Math.round(q.height), vis: q.top >= R.top - 1 && q.bottom <= R.bottom + 1 && q.bottom <= innerHeight}; }); return {box: [Math.round(R.top), Math.round(R.bottom), innerHeight], sh: s.scrollHeight, ch: s.clientHeight, ov: getComputedStyle(s).overflowY, hidden: bs.filter(b => !b.vis).map(b => b.t), small: bs.filter(b => b.w < 40 || b.h < 36).map(b => b.t + ' ' + b.w + '×' + b.h)}; });
  console.log(vp, JSON.stringify(g));
  await p.screenshot({path: 'v3-qa-vs2acc-t16-' + vp + '.png'});
  await H.br.close();
}
