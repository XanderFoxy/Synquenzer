// QA K1-02 Hintergrund, full path: page hidden (visibilityState), the real 30-s idle timer suspends, page visible -> runs again
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
const hide = v => p.evaluate(v => { Object.defineProperty(document, 'hidden', {value: v, configurable: true}); Object.defineProperty(document, 'visibilityState', {value: v ? 'hidden' : 'visible', configurable: true}); document.dispatchEvent(new Event('visibilitychange')); }, v);
const st = () => p.evaluate(() => ({state: AU.ctx.state, t: +AU.ctx.currentTime.toFixed(3), idleSusp: !!UI.idleSusp}));
const a = await st(); await hide(true); await p.waitForTimeout(31500); const bH = await st();
await hide(false); await p.waitForTimeout(500); const c = await st(); await p.waitForTimeout(500); const d = await st();
console.log(JSON.stringify({before: a, hidden31s: bH, visible500ms: c, visible1000ms: d, pass: bH.state === 'suspended' && c.state === 'running' && d.t - c.t > .3}));
console.log('errs', errs);
await b.close();
