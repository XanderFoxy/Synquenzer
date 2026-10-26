// live engine follows undo / redo of an effect gesture; two AM tracks each with a buffer; library save/load keeps effects
import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => { SYNQUENZER.newProject({init: true}); }); await page.waitForTimeout(300);
await page.evaluate(() => { ensureAudio(); SYNQUENZER.setBpm(120); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); SYNQUENZER.mkSet(0, 't.0.a.gate', 1); SYNQUENZER.mkSet(0, 'dly.sync', 1); SYNQUENZER.mkSet(0, 'dly.note', 5); });
await page.waitForTimeout(700);
await page.evaluate(() => MKUI.setWahl(2, 5)); await page.waitForTimeout(100);
const b = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k3"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
await page.mouse.move(b[0], b[1]); await page.mouse.down(); for (let s = 1; s <= 14; s++) await page.mouse.move(b[0], b[1] - 100 * s / 14); await page.mouse.up(); await page.waitForTimeout(150);
const echoDb = () => page.evaluate(async () => {
  const c = AU.ctx, E = AU.synth[0]; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [];
  sp.onaudioprocess = e => L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); E.node.connect(sp); sp.connect(z); z.connect(c.destination);
  await new Promise(r => setTimeout(r, 120)); SYNQUENZER.keyOn(72, .9); await new Promise(r => setTimeout(r, 25)); SYNQUENZER.keyOff(72); await new Promise(r => setTimeout(r, 700));
  try { E.node.disconnect(sp); } catch (e) {} sp.disconnect();
  const n = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(n); let o = 0; for (const b of L) { x.set(b, o); o += b.length; }
  let i0 = 0; while (i0 < n && Math.abs(x[i0]) < 1e-3) i0++; const D = Math.round(.25 * c.sampleRate), W = Math.round(.02 * c.sampleRate);
  let a = 0, e = 0; for (let i = 0; i < W; i++) { a += x[i0 + i] ** 2; e += x[i0 + D + i] ** 2; } return +(10 * Math.log10(e / a + 1e-30)).toFixed(1);
});
const d0 = await page.evaluate(() => SYNQUENZER.mkGet(0).dly.dep), e0 = await echoDb();
await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(150);
const d1 = await page.evaluate(() => SYNQUENZER.mkGet(0).dly.dep), e1 = await echoDb();
await page.evaluate(() => SYNQUENZER.redo()); await page.waitForTimeout(150);
const d2 = await page.evaluate(() => SYNQUENZER.mkGet(0).dly.dep), e2 = await echoDb();
console.log((d0 > 30 && e0 > -20 ? 'PASS' : 'FAIL') + ' nach dem Zug TIEFE ' + d0 + ': Echo ' + e0 + ' dB');
console.log((d1 === 0 && e1 < -60 ? 'PASS' : 'FAIL') + ' Undo → TIEFE ' + d1 + ': Live-Echo ' + e1 + ' dB (aus)');
console.log((d2 === d0 && Math.abs(e2 - e0) < 1 ? 'PASS' : 'FAIL') + ' Redo → TIEFE ' + d2 + ': Live-Echo ' + e2 + ' dB');
// second AM track: its own buffer
const mem = await page.evaluate(async () => { SYNQUENZER.setEngine(1, 'mk'); await new Promise(r => setTimeout(r, 500)); const a = mkInfo().fxBytes; SYNQUENZER.mkSet(1, 'dly.dep', 50); await new Promise(r => setTimeout(r, 300)); return [a, mkInfo().fxBytes]; });
console.log((mem[0] > 2e6 && mem[0] < 2.5e6 && mem[1] > 4e6 ? 'PASS' : 'FAIL') + ' zweite AM-Spur legt ihren eigenen Puffer erst bei TIEFE > 0 an: ' + JSON.stringify(mem));
// library: save sound and load it on track 3 (engine mk) keeps the effect blocks
const lib = await page.evaluate(async () => { const Q = SYNQUENZER; Q.mkSet(0, 'mfx.type', 2); Q.mkSet(0, 'mfx.dep', 90); Q.mkSet(0, 'eq.lg', -4.5); const id = await Q.saveSound(0, 'QA FX', 'new'); const s0 = Q.getSound(0); Q.setSound ? Q.setSound(2, s0) : null; await new Promise(r => setTimeout(r, 400)); const m = Q.mkGet(2); return {id: typeof id, m2: m && {mfx: m.mfx, dly: m.dly, eq: m.eq}, m0: {mfx: Q.mkGet(0).mfx, dly: Q.mkGet(0).dly, eq: Q.mkGet(0).eq}, fx: mkInfo().fxBytes}; });
console.log((lib.m2 && JSON.stringify(lib.m2) === JSON.stringify(lib.m0) && lib.fx > 6e6 ? 'PASS' : 'FAIL') + ' Sound auf Spur 3 übertragen: Effekte gleich, dritter Puffer: ' + JSON.stringify(lib));
console.log(errs.length ? 'FAIL Konsolenfehler ' + errs.join(' | ').slice(0, 300) : 'PASS keine Konsolenfehler');
await browser.close();
