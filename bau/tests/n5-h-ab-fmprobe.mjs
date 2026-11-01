import { launch, OUT } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => ({ed: R.editor, eng: S.tracks[1].engine || S.tracks[1].sound.engine, knobs: [...document.querySelectorAll('#synthSheet .knob,#synthSheet .fader, #synthSheet svg')].filter(x => x.getBoundingClientRect().width > 0).slice(0, 14).map(x => x.tagName + '.' + x.getAttribute('class') + ':' + x.getAttribute('aria-label') + '@' + Math.round(x.getBoundingClientRect().left) + ',' + Math.round(x.getBoundingClientRect().top) + ' ' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height))})));
await p.screenshot({path: OUT + '/n5-h-ab-fm.png'});
await p.evaluate(() => { SYNQUENZER.selectTrack(3); SYNQUENZER.openEditor(); }); await p.waitForTimeout(1200);
console.log(await p.evaluate(() => [...document.querySelectorAll('#synthSheet svg')].filter(x => x.getBoundingClientRect().width > 60).map(x => x.getAttribute('class') + '@' + Math.round(x.getBoundingClientRect().left) + ',' + Math.round(x.getBoundingClientRect().top) + ' ' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height))));
await p.screenshot({path: OUT + '/n5-h-ab-va.png'});
console.log(errs); await b.close();
