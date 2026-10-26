import {open, sleep} from './vgmk34-tl3.mjs';
const T = await open(Object.assign({viewport: {width: 390, height: 844}}, process.env.SYNQ_APP ? {file: process.env.SYNQ_APP} : {})); const {p, E, errs} = T;
const lcd = () => E(() => (typeof ED !== 'undefined' && ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ').trim() : null));
console.log('APP', await E(() => SYNQUENZER.version));
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900);
await T.w('w1', /^1 STIMME/); await T.tapMk('k1', 300); await T.tapPop(/^Schicht$/); await sleep(500);
await T.tapMk('timbre', 300); console.log('timbre', (await T.panel()).timbre, await lcd());
for (const [w, re] of [['w1', /^2 /], ['w1', /^6 /], ['w2', /^2 /], ['w2', /^3 /], ['w2', /^10 /], ['w1', /^3 /]]) { await T.w(w, re); console.log(w, re, '→', await lcd()); }
await T.tapMk('k1', 300); await T.closePop(); await sleep(500); console.log('after knob tap', await lcd());
console.log('errs', JSON.stringify(errs)); process.exit(0);
