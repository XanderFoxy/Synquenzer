import {launch, open, J} from './v3-qa-mk3-lib.mjs';
const b = await launch();
for (const file of ['/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html', '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html']) {
  const {ctx, page} = await open('L1', {file});
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); await page.waitForTimeout(100);
  const keys = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k^="n"], #synthSheet .mkx[data-k="timbre"]')].map(e => e.dataset.k + ':' + e.outerHTML.replace(/<svg.*?<\/svg>/g, '').slice(0, 160)));
  console.log(file.split('/').pop(), '\n ' + keys.slice(0, 6).concat(keys.slice(-1)).join('\n '));
  await ctx.close();
}
await b.close();
