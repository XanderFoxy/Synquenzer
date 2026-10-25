import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open({width: 844, height: 1180});
await p.click('#bMenu'); await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const m = document.querySelector('#menu'); const over = [];
  for (const e of m.querySelectorAll('.mos, .mos-amt, .mos-tr, button')) { const rc = e.getBoundingClientRect(); if (rc.width && (rc.right > innerWidth + 1 || rc.left < -1)) over.push(e.textContent.slice(0, 20)); }
  const rows = [...m.querySelectorAll('.mos, .mos-tr')].map(e => { const rc = e.getBoundingClientRect(); return [e.textContent.slice(0, 18), Math.round(rc.width), Math.round(rc.height)]; });
  return {docW: document.documentElement.scrollWidth, winW: innerWidth, over, rows};
});
await p.getByText('Eine Skala', {exact: true}).first().scrollIntoViewIfNeeded().catch(() => {});
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2c2-W-menu.png'});
console.log(JSON.stringify(r), errs); await b.close();
