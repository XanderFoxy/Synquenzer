import { open, APP, BASE } from './v3-qareg-mk1-pw.mjs';
const r = {};
for (const [n, f] of [['base', BASE], ['new', APP]]) { const {b, p, errs} = await open({width: 390, height: 844}, f); r[n] = {keys: await p.evaluate(() => Object.keys(window.SYNQUENZER)), errs}; await b.close(); }
console.log('removed', r.base.keys.filter(k => !r.new.keys.includes(k)));
console.log('added', r.new.keys.filter(k => !r.base.keys.includes(k)));
console.log('errs base', r.base.errs, 'new', r.new.errs);
