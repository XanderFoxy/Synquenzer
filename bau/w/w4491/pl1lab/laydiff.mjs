import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [fa, fb] = process.argv.slice(2);
const b = await chromium.launch();
const run = async f => { const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true}); await p.goto('file://' + f); await p.waitForTimeout(1500);
  return p.evaluate(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), R_ = e => { const r = e.getBoundingClientRect(); return (e.textContent || '').trim().slice(0, 12) + '@' + [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); };
    stop(); SYNQUENZER.loadDemo(); await wait(150); const o = {};
    ROLLP.view = 'lauf'; openRoll(0, 0); await wait(250); o.lauf = [...document.querySelectorAll('#rollSheet button, #rollSheet .se-cell')].map(R_);
    closeRoll(); openMenu(); await wait(250); o.menu = [...EL.menu.querySelectorAll('.mrow')].map(R_); return o; }); };
const A = await run(fa), B = await run(fb);
for (const k of ['lauf', 'menu']) { const d = []; for (let i = 0; i < Math.max(A[k].length, B[k].length); i++) if (A[k][i] !== B[k][i]) d.push([i, A[k][i], B[k][i]]); console.log(k, A[k].length, B[k].length, JSON.stringify(d.slice(0, 8))); }
await b.close();
