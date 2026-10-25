import {open, sleep, OUT, recStart} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await T.tapSel('#bPlay'); await sleep(300);
await recStart(E, 30);
await sleep(15000);
const g = await E(() => ({gaps: window.__q.gaps.slice(0, 20).map(([a, b]) => b - a), n: window.__q.gaps.length, k: window.__q.k, lat: [AU.ctx.baseLatency, AU.ctx.outputLatency, AU.outLat]}));
console.log(JSON.stringify(g));
await T.br.close();
