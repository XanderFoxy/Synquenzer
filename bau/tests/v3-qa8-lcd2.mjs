import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const f of ['P1', 'P2', 'L2']) {
  const {ctx, page: p} = await open(b, f);
  await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
  for (const [n, js] of [['H15', 'mkProg.select(8, 15)'], ['write2', "(async () => { SYNQUENZER.mkSet(0, 't.0.f.cut', 40); await mkProg.write(4, 7, 'Zwölf Zeichen'); SYNQUENZER.mkSet(0, 't.0.f.cut', 41); await mkProg.write(4, 7, 'Noch ein Name'); })()"]]) {
    await p.evaluate(js); await sleep(400);
    const r = await p.evaluate(() => { const l = [...document.querySelectorAll('#synthSheet .lcd')].find(e => e.offsetWidth); const lr = l.getBoundingClientRect();
      return [...l.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim().slice(0, 70), sh: e.scrollHeight, ch: e.clientHeight, sw: e.scrollWidth, cw: e.clientWidth, top: Math.round(r.top - lr.top), bot: Math.round(r.bottom - lr.top), lcdH: Math.round(lr.height)}; }); });
    console.log(f, n, JSON.stringify(r));
    const lb = await p.evaluate(() => { const l = [...document.querySelectorAll('#synthSheet .lcd')].find(e => e.offsetWidth); const r = l.getBoundingClientRect(); return {x: r.x - 2, y: r.y - 2, width: r.width + 4, height: r.height + 4}; });
    await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa8/lcd-${f}-${n}.png`, clip: lb});
  }
  await ctx.close();
}
await b.close();
