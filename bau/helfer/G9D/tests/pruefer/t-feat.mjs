import {launch, open, mkTake, sleep, LY} from '../h.mjs';
const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
await p.evaluate(() => SYNQUENZER.g9SylLoad('de'));   // Muster schon da
const T = []; for (let t = 0.5; t < 88; t += 0.45) { T.push(t); if (T.length % 6 === 0) t += 0.8; }
const tk = await mkTake(p, T, 90, 0), id = tk.id;
await p.evaluate(() => { const o = g9Call; window.__fd = []; g9Call = m => { const t0 = performance.now(); return o(m).then(r => { window.__fd.push([m.op, Math.round(performance.now() - t0)]); return r; }); }; });
await p.evaluate(r => { SYNQUENZER.wpOpen(r); SYNQUENZER.g9Text(r, true); SYNQUENZER.g9Sel(3); WP.ed.g9.field.focus(); }, tk.ref);
await p.keyboard.type('Mond', {delay: 5});
const a = await p.evaluate(() => WP.ed.g9.field.value);
await sleep(1500);
console.log('getippt', a, '→ nach Merkmalen', JSON.stringify(await p.evaluate(() => ({v: WP.ed.g9.field.value, d: WP.ed.g9.dirty}))), 'Worker', JSON.stringify(await p.evaluate(() => window.__fd)));
await br.close();
