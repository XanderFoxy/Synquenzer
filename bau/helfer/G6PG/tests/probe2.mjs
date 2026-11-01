import { open, sing, chor, sleep } from './lib.mjs';
const {b, p, errs} = await open();
await sing(p); await chor(p, 'drei'); await p.evaluate(async () => { await SYNQUENZER.g6Wait(); });
await p.evaluate(() => { SYNQUENZER.play(); launchClip(stimmeT(), 0); }); 
for (let i = 0; i < 6; i++) { await sleep(700); console.log(JSON.stringify(await p.evaluate(() => ({pl: R.playing, ctx: AU.ctx && AU.ctx.state, slot: R.slot[stimmeT()], src: TK.src.length, ch: TK.src.map(r => !!(r.aud && r.aud.chor)), nodes: G6.nodes.size})))); }
console.log(errs);
await b.close();
