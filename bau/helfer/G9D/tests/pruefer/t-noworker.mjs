import {launch, open, mkTake, sleep, LY, SET} from '../h.mjs';
const br = await launch();
for (const mode of ['undef', 'throw']) {
const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true}); 
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(m => { if (m === 'undef') window.Worker = undefined; else window.Worker = class { constructor() { throw new Error('no worker'); } }; }, mode);
const {server} = await import('../h.mjs');
await p.goto(await server() + 'index.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(400);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = [0.5, 0.9, 1.3, 2.4, 2.8, 3.2, 4.4, 4.8];
const tk = await mkTake(p, T, 6);
await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(500);
const r = await p.evaluate(id => SYNQUENZER.g9SetAsync(id, {op: 'text', text: 'Liebe ist ein Feuer da', lang: 'de'}), tk.id);
const f = await p.evaluate(id => SYNQUENZER.g9Feat(id).then(f => f && f.length), tk.id);
await p.evaluate(T => SYNQUENZER.g9AsrSim(async (x, o) => ({words: [{text: 'Herz', start: o.toStream(T[0]) - o.a, end: o.toStream(T[1]) - o.a}], lang: 'de'})), T);
const rr = await p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'de', mode: 'all'}), tk.id);
console.log(mode, 'setAsync', r && r.ok, 'feat', f, 'rec', rr && rr.words.length, rr && rr.err, 'ly', (await LY(p, tk.id)).s.map(s => s.x).join(' '), 'how', await p.evaluate(() => WP.how), 'errs', errs.join('|'));
await ctx.close();
}
await br.close();
