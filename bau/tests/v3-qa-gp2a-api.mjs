import {open} from './v3-qa-grp-lib.mjs';
const {br, p, errs, E} = await open({mic:false});
console.log(await E(() => SYNQUENZER.version));
console.log(JSON.stringify(await E(() => Object.keys(SYNQUENZER).sort())));
await p.screenshot({path: 'v3-qa-gp2a/start.png'});
console.log('errs', errs);
await br.close();
