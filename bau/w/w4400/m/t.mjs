import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], b = await chromium.launch();
for (const [w, h] of [[428, 926], [926, 428]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const D = window.SYNQUENZER; D.selectTrack(0); D.setParam(0, 'engine', 'north'); D.openEditor(); await new Promise(r => setTimeout(r, 400)); });
  const pg = await p.evaluate(() => ({btn: !!document.querySelector('.percplt'), cells: document.querySelectorAll('.perccell').length, face: !!document.querySelector('.percplate')}));
  await p.screenshot({path: `seite-${w}.png`});
  const bb = await (await p.$('.percplt')).boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(900);
  const pl = await p.evaluate(() => ({open: !!document.querySelector('#ndp') && getComputedStyle(document.querySelector('#ndp')).display !== 'none', src: window.NDP && NDP.src ? NDP.src() : null, u0: UNDO.length, d0: JSON.stringify(S.tracks[0].sound.p.nk.ch[0])}));
  await p.screenshot({path: `platte-${w}.png`});
  // ein Regler der Platte ziehen
  const k = await p.$('#ndp .ndpkn, #ndp [data-k]'); let after = null;
  if (k) { const r = await k.boundingBox(); const x = r.x + r.width / 2, y = r.y + r.height / 2; await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(x, y - 6 * i); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(300);
    after = await p.evaluate(() => ({u: UNDO.length, d: JSON.stringify(S.tracks[0].sound.p.nk.ch.map(c => c)) }));
    await p.evaluate(() => undo()); await p.waitForTimeout(200); }
  const back = await p.evaluate(() => JSON.stringify(S.tracks[0].sound.p.nk.ch[0]));
  console.log(w, JSON.stringify(pg), 'platte', pl.open, JSON.stringify(pl.src), 'knob', !!k, after ? 'undo+' + (after.u - pl.u0) : '-', 'zurück', back === pl.d0, 'errs', JSON.stringify(errs).slice(0, 300));
  await p.close();
}
await b.close();
