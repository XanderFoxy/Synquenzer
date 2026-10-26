// landscape SPIEL: the keys inside the frame (mkqkb) must end on every way out
import {launch, open, openMk, tap, tapSel, OUT} from './v3-qmkp-lib.mjs';
const b = await launch();
const ways = {
  lcdBrowser: async p => { await tapSel(p, '.mksp .mksplcd'); },
  nameBrowser: async p => { await tapSel(p, '.mkqh .preset'); },
  rotate: async p => { await p.setViewportSize({width: 428, height: 926}); },
  stopTwice: async p => { await p.evaluate(() => { SYNQUENZER.play(); }); await p.waitForTimeout(300); await tapSel(p, '.mkqh .mkqplay'); await p.waitForTimeout(100); await tapSel(p, '.mkqh .mkqplay'); },
  scene: async p => { await p.evaluate(() => { try { SYNQUENZER.scene ? SYNQUENZER.scene(1) : null; } catch (e) {} }); },
  more: async p => { await tapSel(p, '.mkqh .mkqmore'); },
  close: async p => { await tapSel(p, '.mkqh .sh-x'); },
};
for (const [w, fn] of Object.entries(ways)) {
  const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
  await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(500);
  const a = await page.evaluate(() => EL.app.className);
  try { await fn(page); } catch (e) { console.log(w, 'ERR', String(e).slice(0, 120)); }
  await page.waitForTimeout(700);
  const s = await page.evaluate(() => { const kb = document.getElementById('kbArea'), r = kb.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return {app: EL.app.className, editor: R.editor, sheetOpen: EL.synthSheet.classList.contains('open'), kb: [r.left, r.top, r.width, r.height].map(Math.round), kbTop: top ? (top.closest('#kbArea') ? 'kbArea' : (top.className || top.tagName).toString().slice(0, 30)) : null, w: innerWidth}; });
  await page.screenshot({path: OUT + '/spielq-' + w + '.png'});
  console.log(w, 'before', /mkqkb/.test(a), 'after', JSON.stringify(s), JSON.stringify(page.errs).slice(0, 200));
  await page.ctx.close();
}
await b.close();
