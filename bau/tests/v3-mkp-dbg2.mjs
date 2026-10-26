import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
const r = await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.f.cut', 30); MKUI.press('edit'); MKUI.P.editHeld = 1; MKUI.press('exit'); MKUI.P.editHeld = 0;
  const U = MKUI.P.el; return {u: !!U, con: U && U.fr.isConnected, T: U && !!U.T, fw: U && U.fw, ab: JSON.stringify(UI.ab && {t: UI.ab.t, side: UI.ab.side}), gest: GEST.size, open: EL.synthSheet.classList.contains('open'), ed: R.editor}; });
console.log(r, page.errs);
await page.waitForTimeout(300);
console.log(await page.evaluate(() => { const U = MKUI.P.el; return {con: U && U.fr.isConnected, T: U && !!U.T, p: !!SYNQUENZER.mkPanel()}; }));
await b.close();
