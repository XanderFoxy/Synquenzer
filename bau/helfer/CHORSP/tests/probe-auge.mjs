import { open, sing, style, sleep } from './lib.mjs';
const {b, p, errs} = await open();
const r = await sing(p); console.log('take', JSON.stringify(r).slice(0, 200));
await p.evaluate(() => { R.selS = 0; });
const c = await style(p, 'pop'); console.log('chor', c && c.voices.map(v => v.lane + ' ' + v.rule + ' n=' + v.n.length));
await p.evaluate(() => SYNQUENZER.g6pDuplizieren(null, false)); await sleep(800);
console.log(await p.evaluate(() => ({ed: !!G2.ed, id: G2.ed && G2.ed.id, voice: G2.ed && G2.ed.voice})));
await p.evaluate(() => { g2Close(); g2Open({t: stimmeT(), s: 0}); }); await sleep(1500);
const info = await p.evaluate(() => ({lanes: SYNQUENZER.g6pgLanes(), hit: SYNQUENZER.g6pgHit().length, chips: [...document.querySelectorAll('.g6pgleg button')].map(b => b.dataset.a + ':' + b.dataset.id)}));
console.log(JSON.stringify(info));
await p.screenshot({path: '/tmp/claude-0/auge0.png'});
const ids = info.lanes.map(l => l.id);
for (const id of ids) { await p.click('.g6pgleg button[data-a=eye][data-id="' + id + '"]'); await sleep(150); }
console.log('nach Augen', await p.evaluate(() => ({hit: SYNQUENZER.g6pgHit().map(h => h.k), hide: [...G6PG.hide]})));
await p.screenshot({path: '/tmp/claude-0/auge1.png'});
console.log(errs); await b.close();
