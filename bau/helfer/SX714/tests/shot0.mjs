import { open, buildSong, OUT } from './lib.mjs';
for (const [w, h, n] of [[428, 926, 'P'], [926, 428, 'L']]) {
  const {b, p, errs} = await open(w, h); await buildSong(p);
  await p.evaluate(() => setSongView(true)); await p.waitForTimeout(500);
  await p.screenshot({path: OUT + 'base-' + n + '.png'});
  console.log(n, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.sv-top > *')].filter(e => !e.hidden).map(e => { const r = e.getBoundingClientRect(); return [e.className.replace('rb sv-b ', ''), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }))), errs);
  await b.close();
}
