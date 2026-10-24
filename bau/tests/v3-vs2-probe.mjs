import {open, micOn} from './v3-vs2-h.mjs';
const {br, p, errs} = await open();
console.log(await p.evaluate(() => ({mic: !!navigator.mediaDevices, micok: document.getElementById('app').classList.contains('micok')})));
const r = await micOn(p); console.log('D', r, await p.evaluate(() => SYNQUENZER.stimme()));
console.log(errs); await br.close();
