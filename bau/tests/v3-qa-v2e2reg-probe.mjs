import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, process.argv[2] === 'base' ? BASE : NEW, true);
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView(true); await new Promise(r => setTimeout(r, 400));
  return {info: Q.svLayoutInfo(), vs: Q.viewState(), parts: (Q.parts() || []).map(x => x && x.name), pk: [...document.querySelectorAll('.pk')].map(k => k.dataset.i + ':' + k.textContent + ':' + JSON.stringify(k.getBoundingClientRect())), corner: document.querySelector('.corner') && document.querySelector('.corner').outerHTML.slice(0, 200)}; });
console.log(JSON.stringify(r, null, 0).slice(0, 5000));
console.log(errs); await b.close();
