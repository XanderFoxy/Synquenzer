// MK-P-08: the zoom stays when turning the phone; after a turn the overview shows the half of the last used section; no errors
import {launch, open, openMk, touch, tap, line, panel, ctr, tapSel, OUT} from './v3-qmkp-lib.mjs';
const b = await launch(); const log = [], fails = [];
const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 7})); await page.waitForTimeout(400);
await page.setViewportSize({width: 428, height: 926}); await page.waitForTimeout(1200);
let p = await panel(page); log.push('X halt 7 → XH: ' + p.ansicht + ' halt ' + p.halt + ' z ' + p.z + ' rahmen ' + JSON.stringify(p.rahmen)); if (p.ansicht !== 'zoom' || p.halt !== 7) fails.push('zoom lost on turn: ' + p.ansicht + ' ' + p.halt);
await page.screenshot({path: OUT + '/rot-XH-h7.png'});
await page.setViewportSize({width: 926, height: 428}); await page.waitForTimeout(1200);
p = await panel(page); log.push('back to X: ' + p.ansicht + ' halt ' + p.halt + ' z ' + p.z); if (p.ansicht !== 'zoom' || p.halt !== 7) fails.push('zoom lost on turn back');
// overview: last used section = VIRTUAL PATCH (right half)
await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(400);
const e = (await panel(page)).elements.find(x => x.id === 'vp.s'); await tap(page, ...ctr(e)); await page.waitForTimeout(200);
await page.setViewportSize({width: 428, height: 926}); await page.waitForTimeout(1200);
p = await panel(page); log.push('overview after VIRTUAL PATCH key → XH: ' + p.ansicht + ' ' + p.haelfte); if (p.haelfte !== 'rechts') fails.push('turn: overview shows half ' + p.haelfte + ' (last section VIRTUAL PATCH is right)');
await page.screenshot({path: OUT + '/rot-XH-ov.png'});
const m = await page.evaluate(() => ({sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth, kb: EL.app.className}));
log.push('page ' + JSON.stringify(m)); if (m.sh > m.ih || m.sw > m.iw) fails.push('page scrolls after turn ' + JSON.stringify(m));
console.log(log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x); console.log('errs', JSON.stringify(page.errs).slice(0, 300));
await b.close();
