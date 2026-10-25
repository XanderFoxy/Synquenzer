import {open, sleep} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); });
// trace who re-adds 'open' after close
await E(() => { SYNQUENZER.openEditor(); }); await sleep(600);
await E(() => { const sh = document.getElementById('synthSheet'); window.__tr = []; new MutationObserver(m => { for (const x of m) if (x.attributeName === 'class') window.__tr.push(sh.className + ' @' + (new Error().stack.split('\n').slice(1, 4).join(' | '))); }).observe(sh, {attributes: true}); 
  const orig = DOMTokenList.prototype.add; DOMTokenList.prototype.add = function (...a) { if (a.includes('open') && this === document.getElementById('synthSheet').classList) window.__tr.push('add(open) from ' + new Error().stack.split('\n').slice(2, 7).map(s => s.trim().split(' ')[1]).join(' < ')); return orig.apply(this, a); }; });
await E(() => SYNQUENZER.closeEditor()); await sleep(600);
console.log(JSON.stringify(await E(() => window.__tr.filter(x => x.startsWith('add')).slice(0, 4)), null, 1));
await T.br.close();
