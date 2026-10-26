import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch();
for (const f of ['L1', 'W']) {
  const page = await open(b, process.argv[2], f, {init: () => { window.__LS = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__LS.push([e.value.toFixed(4), (window.__ST || '?'), e.sources.map(s => (s.node ? (s.node.id || s.node.className || s.node.nodeName) : '-') + ' ' + JSON.stringify([s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height, s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height])).join(' | ')]); }).observe({type: 'layout-shift'}); }});
  await page.waitForTimeout(400);
  const st = [['ganz', {ansicht: 'ganz'}], ['halt4', {ansicht: 'zoom', halt: 4}], ['edit', {ansicht: 'ganz', modus: 'edit', seite: '08'}], ['spiel', {ansicht: 'spiel'}], ['fx', {ansicht: 'fx'}], ['back', {ansicht: 'ganz'}]];
  for (const [nm, v] of st) { await page.evaluate(([nm, v]) => { window.__ST = nm; MKUI.P.mode = v.modus || 'spiel'; if (v.ansicht !== 'spiel' && v.ansicht !== 'fx' && ED.tab !== 'geraet') { ED.tab = 'geraet'; safeRebuild(buildSynthEd); } MKUI.view(v); }, [nm, v]); await page.waitForTimeout(500); }
  for (const nm of ['steps', 'own']) { await page.evaluate(nm => { window.__ST = nm; if (nm === 'steps') MKUI.viewOpen('schritte'); else { MKUI.viewClose(); SYNQUENZER.mkSet(0, 'scale', 9); MKUI.viewOpen('eigene'); } }, nm); await page.waitForTimeout(500); }
  console.log(f, JSON.stringify(await page.evaluate(() => window.__LS), null, 1)); await page.ctx.close();
}
await b.close();
