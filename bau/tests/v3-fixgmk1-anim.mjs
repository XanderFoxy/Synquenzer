import {open, sleep} from './v3-qa-gmk1-tl.mjs';
for (const f of ['/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt-before-gmk1fix.html', '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html']) { const T = await open({file: f}); const {E} = T;
await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); }); await sleep(300);
const r = await E(async () => { SYNQUENZER.openEditor(); const a = EL.app.getAnimations().map(x => [x.transitionProperty, x.playState, Math.round(x.currentTime)]); const h = []; for (let k = 0; k < 4; k++) { await new Promise(r => requestAnimationFrame(r)); h.push(Math.round(document.getElementById('synthSheet').getBoundingClientRect().height)); } return {a, h}; });
console.log(f.split('/').pop(), JSON.stringify(r)); await T.br.close(); }
