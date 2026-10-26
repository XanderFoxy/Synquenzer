import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1', {init: () => { window.__LS = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__LS.push(e.sources.map(s => (s.node ? (s.node.className || s.node.nodeName) + '<' + (s.node.parentElement && s.node.parentElement.className) : '-') + ' ' + JSON.stringify([s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height, s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height]))); }).observe({type: 'layout-shift'}); }});
await page.waitForTimeout(500); await page.evaluate(() => { window.__LS = []; SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); });
await page.waitForTimeout(900); console.log(JSON.stringify(await page.evaluate(() => window.__LS), null, 1));
await b.close();
