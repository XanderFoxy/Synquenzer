// MK1-23 ECO (Nachtrag 3): with forceNative an AM sound plays over NativeVoice, the badge appears; level ± 3 dB and M-SP ± ½ oct
// against the worklet for INIT and 3 test sounds; no console errors. Measured live at AU.masterSum (AnalyserNode, sustain part).
// Usage: node v3-mk1-eco.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(async () => { ensureAudio(); await AU.ctx.resume(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); });
await page.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
const SOUNDS = {
  'INIT': {},
  'Puls+Säge 24LPF': {'t.0.o1.w': 1, 't.0.o1.c1': 30, 't.0.o2.w': 0, 't.0.o2.semi': 7, 't.0.mix.o2': 90, 't.0.f.cut': 70, 't.0.f.res': 30, 't.0.f.eg': 20},
  'Dreieck 12LPF': {'t.0.o1.w': 2, 't.0.f.type': 1, 't.0.f.cut': 90, 't.0.e2.a': 10},
  'Sync-Säge': {'t.0.o2.mod': 2, 't.0.o2.semi': 12, 't.0.mix.o1': 0, 't.0.mix.o2': 127, 't.0.f.cut': 80}};
// one note C4 vel .8: RMS (dB) and spectral centroid over 0.3 ... 1.0 s
const measure = (note) => page.evaluate(async note => {
  const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 8192; an.smoothingTimeConstant = 0; AU.masterSum.connect(an);
  const v = auditionStart(0, note, .8); const t0 = performance.now(); let e = 0, n = 0, cs = 0, cn = 0;
  const td = new Float32Array(an.fftSize), fd = new Float32Array(an.frequencyBinCount);
  while (performance.now() - t0 < 1000) {
    await new Promise(r => setTimeout(r, 60));
    if (performance.now() - t0 < 300) continue;
    an.getFloatTimeDomainData(td); for (const x of td) { e += x * x; n++; }
    an.getFloatFrequencyData(fd); let num = 0, den = 0; for (let k = 2; k < fd.length; k++) { const p = Math.pow(10, fd[k] / 10); num += p * k * c.sampleRate / an.fftSize; den += p; } if (den > 0) { cs += Math.log2(num / den); cn++; }
  }
  if (v && v.release) v.release(c.currentTime, .03); await new Promise(r => setTimeout(r, 400)); an.disconnect();
  return {db: 10 * Math.log10(e / n + 1e-20), sp: Math.pow(2, cs / cn)};
}, note);
for (const [name, set] of Object.entries(SOUNDS)) {
  await page.evaluate(set => { SYNQUENZER.loadPreset(0, 'f-init-am'); for (const k in set) SYNQUENZER.mkSet(0, k, set[k]); }, set);
  await page.evaluate(() => SYNQUENZER.forceNative(false)); await page.waitForTimeout(300);
  const wk = await measure(60);
  await page.evaluate(() => SYNQUENZER.forceNative(true)); await page.waitForTimeout(300);
  const st = await page.evaluate(() => ({synth: SYNQUENZER.engineInfo ? SYNQUENZER.engineInfo().synth : (UI.forceNative ? 'native' : '?'), eco: trackEco(0)}));
  const na = await measure(60);
  const dL = na.db - wk.db, dS = Math.log2(na.sp / wk.sp);
  ok(`MK1-23 ${name}: ECO über NativeVoice, Pegel ± 3 dB, M-SP ± ½ Okt`, st.eco && Math.abs(dL) <= 3 && Math.abs(dS) <= .5,
    `Worklet ${wk.db.toFixed(1)} dB / ${wk.sp.toFixed(0)} Hz, ECO ${na.db.toFixed(1)} dB / ${na.sp.toFixed(0)} Hz → ${dL.toFixed(1)} dB, ${dS.toFixed(2)} Okt (${JSON.stringify(st)})`);
}
// the badge in the editor header
await page.evaluate(() => { SYNQUENZER.forceNative(true); SYNQUENZER.openEditor(); }); await page.waitForTimeout(400);
const badge = await page.evaluate(() => { const b = document.querySelector('#synthSheet .ecob, #synthSheet .eco'); if (!b) return null; const r = b.getBoundingClientRect(), cs = getComputedStyle(b); return {vis: cs.display !== 'none' && cs.visibility !== 'hidden' && (r.width > 0 || !!b.closest('button')), t: b.textContent, cls: b.className, inKey: !!b.closest('button')}; });
const keyEco = await page.evaluate(() => { const s = document.querySelector('#synthSheet .seg.eng'); return s ? s.innerHTML.includes('ECO') || s.className.includes('eco') || !!s.querySelector('.eco,.ecob,[class*=eco]') : false; });
ok('MK1-23 das ECO-Badge erscheint', (badge && badge.vis) || keyEco, JSON.stringify({badge, keyEco}));
await page.evaluate(() => SYNQUENZER.forceNative(false));
ok('MK1-23 keine Konsolenfehler', !errs.length, errs.slice(0, 3).join(' | '));
await browser.close();
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden'));
process.exit(fails ? 1 : 0);
