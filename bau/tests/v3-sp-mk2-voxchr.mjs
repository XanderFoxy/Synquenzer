// Stimmwelle (W-28) through SYNQUENZER.mkRender (Chromium): note-on low-frequency lump (< 150 Hz, 4-pole) vs the saw, and the
// fundamental level at the top of the range (filter open, INIT otherwise)
import {chromium} from 'playwright';
const FILE = new URL('../synq-snapshots/MK2.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext()).newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  SYNQUENZER.setEngine(0, 'mk'); const base = SYNQUENZER.getSound(0), out = [];
  for (const [nm, o1] of [['Saege', {w: 0}], ['Stimme', {w: 4, c1: 64}]]) for (const note of [72, 84, 96, 108, 116, 120]) {
    const s = JSON.parse(JSON.stringify(base)); s.p.mk = SQMK.normMk({t: [{o1, f: {type: 0, cut: 127, res: 0}}]});
    const x = (await SYNQUENZER.mkRender(s, [[.1, 'on', note, .8]], {sec: .6})).l;
    const a = 1 - Math.exp(-2 * Math.PI * 150 / 48000); let z1 = 0, z2 = 0, z3 = 0, z4 = 0, pk = 0;
    for (let i = 0; i < 9600; i++) { z1 += a * (x[i] - z1); z2 += a * (z1 - z2); z3 += a * (z2 - z3); z4 += a * (z3 - z4); if (i > 4800) pk = Math.max(pk, Math.abs(z4)); }
    const f0 = 440 * 2 ** ((note - 69) / 12); let c = 0, d = 0; for (let i = 14400; i < 28800; i++) { c += x[i] * Math.cos(2 * Math.PI * f0 * i / 48000); d += x[i] * Math.sin(2 * Math.PI * f0 * i / 48000); }
    out.push([nm, note, 20 * Math.log10(pk + 1e-12), 20 * Math.log10(2 * Math.hypot(c, d) / 14400 + 1e-12)]);
  }
  return out;
});
for (const x of r) console.log(x[0].padEnd(7), 'note', x[1], ' note-on LF lump', x[2].toFixed(1), 'dBFS   fundamental', x[3].toFixed(1), 'dBFS');
await browser.close();
