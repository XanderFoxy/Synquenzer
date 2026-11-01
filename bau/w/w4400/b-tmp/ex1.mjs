import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], out = process.argv[3];
const b = await chromium.launch();
for (const [w, h, tag] of [[428, 926, 'p'], [926, 428, 'q']]) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const D = window.SYNQUENZER; D.selectTrack(0); D.setParam(0, 'engine', 'north'); D.openEditor(); await new Promise(r => setTimeout(r, 400)); });
  const r = await p.evaluate(() => { const pg = document.querySelector('.pg.percpg'); const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    return {pg: q('.pg.percpg'), sh: pg && [pg.scrollHeight, pg.clientHeight], plate: q('.percplate'), pad: q('.percpad'), sec: q('.percsec'), prg: q('.percprg'), plt: q('.percplt'), seg: q('.percseg')}; });
  console.log(tag, JSON.stringify(r), errs);
  await p.screenshot({path: out + '-' + tag + '.png'});
  await p.close();
}
await b.close();
