// Bildschirmfotos VORHER (4.30.0): Bereich ⋯, Marken-Blatt, Block-Blatt, Namens-Blatt
import { open, buildSong, ALT, BILD, tapSel, markTap, selRange, blockTap } from './lib.mjs';
const {p, errs, close} = await open({app: ALT});
await buildSong(p);
await selRange(p, 2, 5); await tapSel(p, '#rangeBar button[data-a="more"]', 500); await p.screenshot({path: BILD + '/vorher-1-bereich.png'});
await tapSel(p, '.pop button[data-a="konsol"]', 500); await p.screenshot({path: BILD + '/vorher-2-namensblatt.png'});
await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); svButtons(); });
await markTap(p, '^REF'); await p.screenshot({path: BILD + '/vorher-3-marke.png'});
await p.evaluate(() => { closePop(); SYNQUENZER.blockMake(2, 5); UI.dirty.song = true; }); await p.waitForTimeout(400);
await blockTap(p, 'B1'); await p.screenshot({path: BILD + '/vorher-4-block.png'});
console.log(JSON.stringify(errs)); await close();
