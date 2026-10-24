import {open} from './v3-qa-grp-lib.mjs';
const {br, p, E} = await open({mic: false});
const f = await E(() => SYNQUENZER.factory());
console.log(f.filter(x => x.engine !== 'drum').map(x => x.id + ':' + x.name + ':' + x.cat + ':' + x.engine).join('\n'));
console.log(JSON.stringify(await E(() => Object.keys(S.tracks[0].sound.p).slice(0, 80))));
console.log(JSON.stringify(await E(() => { const p = S.tracks[2].sound.p; return {a: p['env1.a'] ?? p.env1, keys: Object.keys(p).filter(k => /env|amp|att/i.test(k))}; })));
await br.close();
