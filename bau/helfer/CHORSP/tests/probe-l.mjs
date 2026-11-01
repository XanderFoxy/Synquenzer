import { open, sing, style, sleep } from './lib.mjs';
const {b, p, errs} = await open({width: 926, height: 428});
await sing(p); await p.evaluate(() => { R.selS = 0; }); await style(p, 'gospel');
await p.evaluate(() => SYNQUENZER.chsOpen(true)); await sleep(500);
console.log(JSON.stringify(await p.evaluate(() => ({m: SYNQUENZER.matrixInfo(), bank: UI.trackBank, st: stimmeT(), chs: SYNQUENZER.chsInfo().mx, per: MX.chsPer, lastFit: MX.lastFit}))));
await p.screenshot({path: '/tmp/claude-0/l.png'});
console.log(errs); await b.close();
