import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const p = await b.newPage(); await p.goto('file://' + process.argv[2]); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted);
console.log(await p.evaluate(() => { const D = SYNQUENZER; D.loadPreset(1, 'f-moog-bass'); const e0 = D.soundEdited(1); D.setEngine(1, 'mk'); const e1 = D.soundEdited(1); D.setEngine(1, 'va'); const e2 = D.soundEdited(1);
  D.setEngine(0, 'mk'); const m = D.buildMidi(); return JSON.stringify({e0, e1, e2, mt: typeof m, ml: m && m.length, isU8: m instanceof Uint8Array, names: S.tracks.map(trackMidiName).slice(0, 2)}); }));
await b.close();
