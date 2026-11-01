import { open, demo, putStyle, playTap } from './lib.mjs';
const {b, p, errs} = await open();
console.log('demo', JSON.stringify(await demo(p)));
console.log('put', JSON.stringify(await putStyle(p, '80')));
console.log(JSON.stringify(await p.evaluate(() => ({info: SYNQUENZER.g6pInfoC(), ga: SYNQUENZER.g6pGA(), play: typeof SYNQUENZER.play, stop: typeof SYNQUENZER.stop}))));
console.log('tap', JSON.stringify(await playTap(p)));
console.log(JSON.stringify(await p.evaluate(() => SYNQUENZER.g6pInfoC())));
console.log('errs', errs); await b.close();
