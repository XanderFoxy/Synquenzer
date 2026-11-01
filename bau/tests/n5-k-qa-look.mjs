import {open, sleep} from './n5-k-qa-lib.mjs';
const vp = process.argv[2] === 'L' ? [844, 390] : [390, 844];
const T = await open({vp});
const {E} = T;
console.log(JSON.stringify(await E(() => ({v: SYNQUENZER.version, tracks: SYNQUENZER.tracks().map(t => [t.name, t.kind, t.engine || '', t.sound && t.sound.name])}))));
await T.shot('look-start-' + process.argv[2]);
console.log(JSON.stringify(await E(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth).slice(0, 80).map(b => b.className + ':' + b.textContent.trim().slice(0, 18)))));
await T.b.close();
