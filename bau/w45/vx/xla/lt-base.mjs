import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const b = await chromium.launch();
// 1. importiertes Projekt aus der neuen Fassung holen
const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2500);
const bytes = [...fs.readFileSync('tests/synth-12spuren.cbp')];
const ser = await p.evaluate(async b => { await window.__xla.file(Uint8Array.from(b).buffer, 'A'); await window.__xla.build(); await window.__xla.apply(); return serialize(); }, bytes);
await p.close();
// 2. in der BASIS dasselbe Projekt öffnen (normaler Weg) + Song-Ansicht
for (const f of [process.argv[3], process.argv[2]]) for (let k = 0; k < 2; k++) {
  const q = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  await q.goto('file://' + f); await q.waitForTimeout(2500);
  const r = await q.evaluate(async s => { S.name = 'Vorher'; markDirty(); await autosave.flush();
    const lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }).observe({type: 'longtask'});
    const P = projFromFile(JSON.parse(s)); P.id = newProjectId(); await importProjectUI(P, []); await vvYield(); setSongView(true);
    await new Promise(r => setTimeout(r, 1200)); return lt; }, ser);
  console.log(f.endsWith('basis.html') ? 'BASIS' : 'NEU  ', 'gleiches Projekt öffnen + Song-Ansicht, Long Tasks:', JSON.stringify(r));
  await q.close();
}
await b.close();
