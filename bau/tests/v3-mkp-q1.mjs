import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
let p = await panel(page); console.log('ansicht', p.ansicht, 'z', p.z, 'lcd', p.lcd);
const cut = await el(page, 'f.cut'); const [x, y] = ctr(cut);
const v0 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut);
await touch(page, line(x, y, x, y - 60)); 
const v1 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut);
p = await panel(page); console.log('cut', v0, '->', v1, 'ansicht', p.ansicht, 'undo', await page.evaluate(() => SYNQUENZER.undoLabels ? SYNQUENZER.undoLabels().slice(-2) : null));
const on = await el(page, 'arp.on'); await tap(page, ...ctr(on)); await page.waitForTimeout(100);
console.log('arp.on', await page.evaluate(() => SYNQUENZER.mkGet(0).arp.on), 'ansicht', (await panel(page)).ansicht);
await tap(page, x, y); await page.waitForTimeout(400); p = await panel(page); console.log('after tap knob: ansicht', p.ansicht, 'halt', p.halt, 'z', p.z);
// tap on another free area: title MIXER
const mixT = [p.rahmen.x + 10, p.rahmen.y + 10];
await page.evaluate(() => MKUI.press('edit')); await page.waitForTimeout(50); p = await panel(page); console.log('edit', p.modus, p.seite, p.lcd);
await page.evaluate(() => MKUI.press('s6')); await page.waitForTimeout(50); p = await panel(page); console.log('s6', p.seite, p.lcd);
await page.evaluate(() => { MKUI.press('cur.r'); MKUI.press('yes'); }); await page.waitForTimeout(50); p = await panel(page); console.log('cur yes', p.lcd, await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut));
console.log('errors', page.errs);
await b.close();
