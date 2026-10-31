import { open, ok, summary } from './lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(() => ({v: SYNQUENZER.state ? 1 : 0, cv: typeof cvNorm, n: cvNorm({bd: [[1, .5], [0.5, NaN], [.2, 3]], mw: []}, 4)}));
ok('load', r.cv === 'function', r); ok('errs', !errs.length, errs);
await b.close(); process.exit(summary());
