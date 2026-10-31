import {open, sleep, OUT, summ} from './n5-h-mu-lib.mjs';
const T = await open({vp: [390, 844]});
const {p, E} = T;
await p.screenshot({path: OUT + '/explore-start.png'});
console.log(await E(() => ({v: SYNQUENZER.version, h: SYNQUENZER.history(), name: S.name, id: S.id, tracks: S.tracks.map(t => t.name + ':' + (t.sound && t.sound.engine)), scenes: NS(), parts: (S.parts||[]).length})));
const btns = await E(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => { const r = b.getBoundingClientRect(); return `${b.id||''}.${b.className}|${b.textContent.trim().slice(0,18)}@${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; }));
console.log(btns.join('\n'));
await T.b.close();
