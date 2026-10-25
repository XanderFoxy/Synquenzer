// P1/P3: switch VA -> FM -> WT -> VA via the engine chip with real taps; undo; sound, errors, popup geometry
import { open, APP, OUT } from './v3-qareg-mk1-pw.mjs';
for (const [w, h, tag] of [[390, 844, 'P1'], [320, 568, 'P3']]) {
  const {b, p, errs} = await open({width: w, height: h}, APP, true);
  await p.tap('#bKlang'); await p.waitForTimeout(700);
  const eng = () => p.evaluate(() => window.SYNQUENZER.project().tracks.map(t => t.sound && t.sound.engine).join(','));
  const sel = await p.evaluate(() => window.SYNQUENZER.runtime().selT);
  for (const target of ['FM', 'WT', 'VA']) {
    await p.tap('#synthSheet .seg.engchip button'); await p.waitForTimeout(400);
    const pop = await p.evaluate(() => { const q = document.querySelector('.pop'); if (!q) return null; const r = q.getBoundingClientRect(); return {r: [r.left, r.top, r.width, r.height].map(Math.round), rows: [...q.querySelectorAll('button[data-e]')].map(b => b.innerText + ':' + Math.round(b.getBoundingClientRect().height) + 'x' + Math.round(b.getBoundingClientRect().width))}; });
    await p.locator('.pop button[data-e]', {hasText: new RegExp('^' + target + '$')}).tap(); await p.waitForTimeout(600);
    const chip = await p.evaluate(() => document.querySelector('#synthSheet .seg.eng button').innerText);
    console.log(tag, 'sel', sel, '->', target, 'engine', await eng(), 'chip', JSON.stringify(chip), 'pop', JSON.stringify(pop));
  }
  // audible check: play note via API on the selected track, FM now
  await p.evaluate(() => { window.SYNQUENZER.undo(); }); await p.waitForTimeout(300);
  console.log(tag, 'after undo engine', await eng(), 'chip', await p.evaluate(() => document.querySelector('#synthSheet .seg.eng button').innerText));
  console.log(tag, 'errs', errs); await b.close();
}
