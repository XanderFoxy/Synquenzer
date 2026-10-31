import { chromium } from 'playwright';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
for (const app of [process.argv[2], '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-V/index.html']) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: 667, height: 375}, deviceScaleFactor: 3, hasTouch: true, isMobile: true});
  await p.goto('file://' + app); await p.waitForTimeout(1500); await p.mouse.click(5, 300); await p.waitForTimeout(800);
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG16); await p.waitForTimeout(800);
  const L = await p.evaluate(() => { UI.dirty.song = true; return svLayoutInfo(); });
  const tx = L.canvas.x + 30, ty = L.canvas.y + 9;
  const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '#' + e.id + '.' + e.className : null; }, [tx, ty]);
  await p.touchscreen.tap(tx, ty); await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({sheet: !!document.querySelector('.msheet'), pop: !!document.querySelector('.pop'), mark: SV.mark || null, sel: SV.sel}));
  console.log(app.split('/').slice(-2).join('/'), JSON.stringify({canvas: L.canvas, rulerH: L.rulerH, marks: L.marks, tx, ty, hit, r}));
  await b.close();
}
