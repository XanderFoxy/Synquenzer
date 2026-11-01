// repeat: Escape with the Video sheet open (menu closes with Escape, §10.5), Space with the sheet open (idle)
import { open, SONG8 } from './n5-v-abn-lib.mjs';
for (const run of [1, 2]) {
  const {b, p, errs} = await open();
  await p.evaluate(s => { SYNQUENZER.setSong(s); }, SONG8);
  await p.evaluate(() => SYNQUENZER.openMenu()); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const menu = await p.evaluate(() => EL.menu.classList.contains('open'));
  await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(400);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  const vEsc = await p.evaluate(() => VV.open);
  await p.keyboard.press('Space'); await p.waitForTimeout(600);
  const sp = await p.evaluate(() => ({playing: R.playing, song: !!R.songPlay, open: VV.open, sheetShown: getComputedStyle(document.getElementById('vvSheet')).display}));
  console.log(JSON.stringify({run, menuOpenAfterEsc: menu, videoOpenAfterEsc: vEsc, afterSpace: sp, errs}));
  await b.close();
}
