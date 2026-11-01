import {launch, open, ok, done, OLD} from './lib.mjs';
const b = await launch();
for (const vp of [{width: 320, height: 568}, {width: 390, height: 844}, {width: 844, height: 390}]) {
  const p = await open(b, null, vp);
  const m = await p.evaluate(() => ({ver: VERSION, sw: document.scrollingElement.scrollWidth, iw: innerWidth, api: typeof SYNQUENZER.g6pInfo, fmt: SYNQUENZER.g6pFmt()}));
  ok('smoke ' + vp.width + 'x' + vp.height, !p.errs.length && m.ver === '4.25.2' && m.api === 'function' && m.fmt === 5 && m.sw <= m.iw, Object.assign(m, {errs: p.errs}));
  await p.ctx.close();
}
await b.close(); done();
