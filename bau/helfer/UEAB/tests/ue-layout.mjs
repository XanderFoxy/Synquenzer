// UE-07 Layout: Song-Leiste mit [◆ Übergänge], offene Bibliothek-Leiste, Chip – nichts abgeschnitten, Ziele ≥ 44, nichts rollt
import { open, SONG16, OUT } from './lib.mjs';
let nOk = 0, nAll = 0;
for (const [W, H] of [[428, 926], [926, 428], [428, 650], [390, 844], [375, 667]]) {
  const {b, p, errs} = await open({w: W, h: H});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); SYNQUENZER.uePlace('p-tom-kurz', 'M2'); SYNQUENZER.ueBar(true); }, SONG16);
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const bad = [];
    for (const e of document.querySelectorAll('#songView .sv-top .rb:not([hidden]), .ue-bar button, .ue-chip')) {
      if (!e.offsetWidth) continue; const r = e.getBoundingClientRect();
      const lab = e.querySelectorAll('span,b'); let clip = !e.classList.contains('ue-chip') && e.scrollWidth > e.clientWidth + 1;
      for (const x of lab) if (!x.closest('.ue-grip') && x.offsetWidth && x.scrollWidth > x.clientWidth + 1 && getComputedStyle(x).textOverflow !== 'ellipsis') clip = true;
      if (r.width < 44 - .5 || r.height < 44 - .5 && !e.closest('.sv-top')) bad.push(['klein', e.className, Math.round(r.width), Math.round(r.height)]);
      if (clip) bad.push(['abgeschnitten', e.className, e.textContent.trim().slice(0, 20)]);
    }
    const kb = document.querySelector('#keys, .keys, #kbd'); const doc = document.documentElement;
    return {bad, scroll: doc.scrollHeight > innerHeight + 1 || doc.scrollWidth > innerWidth + 1, kb: kb ? Math.round(kb.getBoundingClientRect().height) : null, top: Math.round(document.querySelector('#songView .sv-top').getBoundingClientRect().height)};
  });
  await p.screenshot({path: OUT + `/lay-${W}x${H}.png`});
  const pass = !r.bad.length && !r.scroll && !errs.length; nAll++; if (pass) nOk++;
  console.log((pass ? 'OK  ' : 'FEHL') + ' ' + W + '×' + H, JSON.stringify(r), errs.length ? errs : '');
  await b.close();
}
console.log('ERGEBNIS', nOk + '/' + nAll);
