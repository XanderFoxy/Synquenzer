import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const {b, p} = await open({width: 390, height: 844}, APP);
console.log(await p.evaluate(() => Object.keys(window.SYNQUENZER).filter(k => /mute|solo|send|mix|vol|fader|fx|rev/i.test(k)).join(' ')));
await b.close();
