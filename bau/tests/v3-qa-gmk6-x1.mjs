import {open, sleep, check, done} from './v3-qa-gmk6-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
console.log(JSON.stringify(await E(() => ({v: SYNQUENZER.version, tracks: [0,1,2,3,4,5].map(t => { try { const s = SYNQUENZER.getSound(t); return s && (s.engine + ':' + s.name); } catch (e) { return null; } }), bpm: SYNQUENZER.runtime().bpm, scenes: [...document.querySelectorAll('button.scn')].map(b => b.textContent.trim())}))));
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); console.log('mk button', JSON.stringify(mkb));
const btns = await E(() => [...document.querySelectorAll('#synthSheet button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()).slice(0, 40)); console.log(JSON.stringify(btns));
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk6/x1-ed.png'});
console.log('errs', errs);
await T.br.close();
