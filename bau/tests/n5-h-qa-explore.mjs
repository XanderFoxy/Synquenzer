import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1');
await p.evaluate(() => { selectTrack(DRUM_T); SYNQUENZER.openEditor(); }); await sleep(800);
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-h-qa-drum.png'});
console.log(await p.evaluate(() => [...document.querySelectorAll('[class*=knob], [class*=ctl], [class*=fader]')].filter(e => e.offsetWidth).slice(0, 15).map(e => e.className + ' ' + (e.getAttribute('aria-label') || '') + ' ' + JSON.stringify(e.getBoundingClientRect().toJSON())).join('\n')));
console.log(await p.evaluate(() => R.editor));
await b.close();
