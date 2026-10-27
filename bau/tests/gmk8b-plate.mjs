// QA: plate (MK-P) display / LED / −+ with a Micro program on the track; WRITE of an edited Micro program from the plate
import {launch, open, mkOk, sleep, DIR, tapSel} from './gmk8b-h.mjs';
const {ok, fails} = mkOk();
const br = await launch(false);
const {ctx, page, errs} = await open(br, {fmt: process.env.FMT || 'P1'});
await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); mkProg.select(2, 3); });
await page.evaluate(() => SYNQUENZER.openEditor && SYNQUENZER.openEditor(0)); await sleep(800);
const lcd = () => page.evaluate(() => { const L = MKUI.lcdLines ? MKUI.lcdLines() : null; const leds = [...document.querySelectorAll('[class*=led].on, .on[class*=led]')].map(e => e.getAttribute('data-k') || e.className).slice(0, 6);
  const lcdEl = [...document.querySelectorAll('[class*=lcd]')].map(e => e.textContent.trim()).filter(Boolean).slice(0, 3); return {L, lcdEl, origin: S.tracks[0].sound.origin, name: S.tracks[0].sound.name, cur: mkProg.current()}; });
const a = await lcd(); console.log('B03 loaded:', JSON.stringify(a).slice(0, 600));
await page.screenshot({path: DIR + '/plate-b03.png'});
await page.evaluate(() => { SYNQUENZER.browserTap('f-mk-k309'); closeBrowser(false); }); await sleep(300);
await page.evaluate(() => SYNQUENZER.openEditor && SYNQUENZER.openEditor(0)); await sleep(800);
const b = await lcd(); console.log('Micro loaded:', JSON.stringify(b).slice(0, 600));
await page.screenshot({path: DIR + '/plate-kompakt.png'});
const st = await page.evaluate(() => { mkProg.step(1); return {o: S.tracks[0].sound.origin, c: mkProg.current()}; });
console.log('+/YES after Micro:', JSON.stringify(st));
console.log('errs', errs);
await br.close();
