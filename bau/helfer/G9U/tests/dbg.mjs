import {launch, open, mkTake, sleep} from './h.mjs';
const br = await launch(); const {p, errs} = await open(br, {viewport: {width: +process.argv[2] || 428, height: +process.argv[3] || 926}});
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await mkTake(p, [0.5, 0.75, 1.0, 1.5, 1.75, 2.25, 2.5, 3.0], 4);
await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(300);
console.log(await p.evaluate(() => { const G = document.querySelector('.g9tl'); G.classList.remove('short'); for (const b of G.querySelectorAll('button')) b.textContent = b.dataset.l; return [...G.querySelectorAll('button')].map(b => b.dataset.l + ':' + b.clientWidth + '/' + b.scrollWidth).join(' ') + ' row ' + G.clientWidth; }));
console.log(errs);
await br.close();
