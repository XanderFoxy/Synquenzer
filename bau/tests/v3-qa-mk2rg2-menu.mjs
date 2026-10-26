import { open, APP } from './v3-mk0reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base-A.html';
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) { const {b, p, errs} = await open({width: 390, height: 844}, file);
  await p.evaluate(() => window.SYNQUENZER.openMenu()); await p.waitForTimeout(500);
  out[name] = await p.evaluate(() => { const m = document.getElementById('menu'); return [...m.querySelectorAll('h1,h2,h3,h4,p,li,button,summary,details>div,small')].filter(e => e.offsetParent).map(e => e.tagName + ':' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 140)); });
  await b.close(); }
const A = out.base, B = out.new; console.log('base', A.length, 'new', B.length);
for (const x of B) if (!A.includes(x)) console.log('+ ', x);
for (const x of A) if (!B.includes(x)) console.log('- ', x);
