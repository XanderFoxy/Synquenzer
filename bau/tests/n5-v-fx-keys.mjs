// VV1-fix: with the Video sheet open and idle, Space / a note key / M do nothing under the sheet; Escape closes it
import { open, SONG8 } from './n5-v-abn-lib.mjs';
const {b, p, errs} = await open();
await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvOpen(); }, SONG8); await p.waitForTimeout(400);
const n0 = await p.evaluate(() => ({metro: S.settings.metro, voices: VOICES.length}));
await p.keyboard.press('Space'); await p.keyboard.down('KeyA'); await p.waitForTimeout(200);
const mid = await p.evaluate(() => ({playing: R.playing, voices: VOICES.length, inputs: Object.keys(R.inputs).length}));
await p.keyboard.up('KeyA'); await p.keyboard.press('KeyM'); await p.waitForTimeout(200);
const m = await p.evaluate(() => S.settings.metro);
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
const after = await p.evaluate(() => ({open: VV.open, shown: getComputedStyle(document.getElementById('vvSheet')).display}));
await p.keyboard.press('Space'); await p.waitForTimeout(400);
const live = await p.evaluate(() => R.playing);
console.log(JSON.stringify({before: n0, whileOpen: mid, metroAfterM: m, afterEsc: after, spaceAfterClose_plays: live, errs}));
await b.close();
