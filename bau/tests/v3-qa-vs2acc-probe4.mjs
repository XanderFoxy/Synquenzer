import {chromium} from 'playwright';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
for (const f of ['synq-snapshots/V2d-fix.html', 'synq-snapshots/V2d.html', 'dirigent-wt/index.html']) {
  const br = await chromium.launch({executablePath: EXE}); const ctx = await br.newContext({viewport: {width: 667, height: 375}, hasTouch: true}); const p = await ctx.newPage();
  try { await p.goto('file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/' + f); } catch (e) { console.log(f, 'fehlt'); await br.close(); continue; }
  await p.waitForTimeout(800);
  console.log(f, await p.evaluate(() => [...document.querySelectorAll('#bFangT, #bFang')].filter(x => x.offsetParent).map(x => x.id + ' ' + x.textContent + ' ' + Math.round(x.getBoundingClientRect().width) + '×' + Math.round(x.getBoundingClientRect().height)).join(' ')));
  await br.close();
}
