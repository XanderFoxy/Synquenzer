import {launch, openG, sleep, toI16, SR} from './n5-g-h.mjs';
const br = await launch(null); const H = await openG(br, {viewport: {width: 390, height: 844}, touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); }); await sleep(300);
const x = new Float32Array(48000 * 4).map((v, i) => 0.2 * Math.sin(i / 10) * (i % 24000 < 4000));
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x)); await sleep(800);
console.log(r1, await p.evaluate(() => ({n: document.querySelectorAll('.mini').length, au: [...document.querySelectorAll('.mini')].filter(e => e.innerHTML.includes('stroke-width="1.2"')).length, cells: UI.cells.length, row0: UI.cells[0] && UI.cells[0].length, view: R.view || null})));
await br.close();
