import {open, sleep} from './v3-qa-gmk1-tl.mjs';
const vp = process.argv[2]==='L'?{width:926,height:428}:process.argv[2]==='S'?{width:375,height:667}:{width:428,height:926};
const T = await open({viewport: vp, file: process.argv[3] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'}); const {E} = T;
await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); }); await sleep(300);
await E(() => SYNQUENZER.openEditor()); await sleep(900);
console.log(JSON.stringify(await E(() => { const pg = document.querySelector('#synthSheet .mkpg'); const r = pg.getBoundingClientRect(); const i = SYNQUENZER.mkPanel(); return {pg: [Math.round(r.width), Math.round(r.height)], built: pg._mkSz, fmt: i.fmt, scale: +i.scale.toFixed(4), body: i.body}; })));
await T.br.close();
