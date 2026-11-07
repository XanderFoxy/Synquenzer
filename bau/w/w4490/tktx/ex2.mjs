import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [file, out] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 926, height: 428}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); await new Promise(r => setTimeout(r, 300)); });
for (const sub of ['spur', 'hall', 'echo']) {
  await p.evaluate(s => { R.selT = 0; openEditor(0); ED.tab = 'fx'; ED.sub.fx = s; safeRebuild(buildSynthEd); }, sub).catch(e => console.log('err', e.message));
  await p.waitForTimeout(500);
  await p.screenshot({path: out + '/fx-' + sub + '-l.png'});
}
console.log(await p.evaluate(() => { const pg = document.querySelector('.pg-fxg'); const r = pg.getBoundingClientRect(); return JSON.stringify({r, cs: getComputedStyle(pg).display, gtc: getComputedStyle(pg).gridTemplateColumns, kids: [...pg.children].map(k => k.className + ':' + Math.round(k.getBoundingClientRect().top) + '/' + Math.round(k.getBoundingClientRect().height))}); }));
await p.setViewportSize({width: 926, height: 370}); await p.waitForTimeout(500);
await p.screenshot({path: out + '/fx-echo-l370.png'});
console.log(JSON.stringify(errs));
await b.close();
