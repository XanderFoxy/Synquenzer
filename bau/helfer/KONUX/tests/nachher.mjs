// Bildschirmfotos NACHHER (KONUX) zu den Vorher-Fotos (vorher.mjs): Bereich ⋯, das geführte Blatt, Marken-Blatt, Block,
// mitten im Kachel-Flug, Ergebnis mit Hinweis [Rückgängig]
import { open, buildSong, BILD, tapSel, markTap, selRange, blockTap } from './lib.mjs';
const {p, errs, close} = await open({});
await buildSong(p);
await selRange(p, 2, 5); await tapSel(p, '#rangeBar button[data-a="more"]', 500); await p.screenshot({path: BILD + '/nachher-1-bereich.png'});
await tapSel(p, '.pop button[data-a="konux"]', 500); await p.screenshot({path: BILD + '/nachher-2-gefuehrt.png'});
await tapSel(p, '.pop .kx-c[data-k="blk"]', 400); await p.screenshot({path: BILD + '/nachher-2b-gefuehrt-block.png'});
await tapSel(p, '.pop .kx-c[data-k="part"]', 400);
const go = await p.$('.pop .kx-go'); const q = await go.boundingBox();
// mitten im Flug anhalten (nur fürs Foto: alle Animationen bei 100 ms von 240 ms einfrieren)
await p.evaluate(() => { const mo = new MutationObserver(ms => { for (const m of ms) for (const x of m.addedNodes) if (x.classList && x.classList.contains('kx-fx')) for (const a of x.getAnimations()) { a.pause(); a.currentTime = 100; } }); mo.observe(document.body, {childList: true}); window.__mo = mo; });
await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(150); await p.screenshot({path: BILD + '/nachher-5-flug.png'});
await p.evaluate(() => { window.__mo.disconnect(); for (const x of document.querySelectorAll('.kx-fx')) for (const a of x.getAnimations()) a.play(); });
await p.waitForTimeout(500); await p.screenshot({path: BILD + '/nachher-6-ergebnis.png'});
await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); svButtons(); SV.x = 0; UI.dirty.song = true; }); await p.waitForTimeout(300);
await markTap(p, '^STR'); await p.screenshot({path: BILD + '/nachher-3-marke.png'});
await p.evaluate(() => { closePop(); SYNQUENZER.blockMake(6, 9); UI.dirty.song = true; }); await p.waitForTimeout(400);
await blockTap(p, 'B1'); await p.screenshot({path: BILD + '/nachher-4-block.png'});
console.log(JSON.stringify(errs)); await close();
