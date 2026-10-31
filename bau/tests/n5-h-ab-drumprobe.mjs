import { launch } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
console.log(await p.evaluate(() => [DRUM_T, NT(), S.tracks.map(t => t.kind)])); await p.evaluate(() => { SYNQUENZER.selectTrack(DRUM_T); SYNQUENZER.openEditor(); }); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => ({ed: R.editor, ds: !!document.querySelector('#drumSheet.open'), knobs: [...document.querySelectorAll('.knob,.fader')].filter(x => x.getBoundingClientRect().width > 0).slice(0, 8).map(x => x.closest('[id]').id + ':' + x.getAttribute('aria-label') + '@' + Math.round(x.getBoundingClientRect().top))})));
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-h-ab-drum.png'});
console.log(errs); await b.close();
