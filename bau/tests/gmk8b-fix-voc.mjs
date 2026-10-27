// G-MK8b-merge copy of fix-gmkp8/fix-voc.mjs (E: back from the background the mic stays off with the hint, Xander 27.10.). G-MKP8-merge-fix: E2 = mic set but mic off → switching to Vocoder again / loading a Vocoder program restarts it; without a device the LCD says why
import { chromium } from 'playwright';
const FILE = process.argv[2], FAKE = process.argv[3] !== 'nodev';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'].concat(FAKE ? ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] : [])});
const ctx = await b.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
let page = await ctx.newPage(); const errs = []; const hook = p => { p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); };
hook(page); let fails = 0; const ck = (n, c, x) => { if (!c) fails++; console.log(c ? 'OK  ' : 'FEHLER', n, x || ''); };
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const tapEl = async id => { const r = await page.evaluate(id => { const e = SYNQUENZER.mkPanel().elements.find(x => x.id === id); return e && e.px && {x: e.px.x + e.px.w / 2, y: e.px.y + e.px.h / 2}; }, id); if (!r) throw new Error('kein ' + id); await page.touchscreen.tap(r.x, r.y); await page.waitForTimeout(200); };
const rms = async () => { await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'k1')); await page.waitForTimeout(900); const m = []; for (let k = 0; k < 5; k++) { m.push(await page.evaluate(() => SYNQUENZER.meter().rmsDb)); await page.waitForTimeout(120); } await page.evaluate(() => SYNQUENZER.keyOff(60, 'k1')); await page.waitForTimeout(600); return Math.max(...m); };
const info = () => page.evaluate(() => ({mode: S.tracks[0].sound.p.mk.mode, e2: (S.tracks[0].mkIn || {}).e2 || null, mic: vocMicOn(), lcd: MKUI.lcdLines(), head: ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''}));
const open = async () => { await page.waitForFunction(() => window.MKUI && MKUI.PL.ready && SYNQUENZER.mkPanel(), null, {timeout: 15000}); await page.waitForTimeout(300); await page.evaluate(() => MKUI.view({ansicht: 'ganz', modus: 'spiel'})); await page.waitForTimeout(300); };
const toModus = async () => { await page.evaluate(() => MKUI.view({modus: 'edit', seite: '01', cursor: 0})); await page.waitForTimeout(200); for (let k = 0; k < 4; k++) { const l = await page.evaluate(() => MKUI.lcdLines()[1]); if (/MODUS/.test(l)) break; await tapEl('cur.r'); } };
await page.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await open(); await toModus();
for (let k = 0; k < 3; k++) await tapEl('yes'); await page.waitForTimeout(1500);
let I = await info(); console.log('A', JSON.stringify(I));
if (FAKE) {
  ck('A Vocoder hörbar, Mikro an', I.mode === 3 && I.e2 === 'mic' && I.mic && (await rms()) > -30);
  // the mic stopped by hand (list „Mikrofon stoppen“), E2 stays mic → Split → Vocoder restarts it
  await page.evaluate(() => vocMicStop()); await page.waitForTimeout(300); I = await info(); ck('B Mikro aus, E2 bleibt', !I.mic && I.e2 === 'mic');
  await tapEl('no'); await page.waitForTimeout(300); await tapEl('yes'); await page.waitForTimeout(1500); I = await info(); const r1 = await rms();
  ck('C wieder Vocoder → Mikro läuft, hörbar', I.mic && r1 > -30, r1.toFixed(1) + ' ' + I.head);
  const u = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  // hidden → visible restarts
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => true}); document.dispatchEvent(new Event('visibilitychange')); }); await page.waitForTimeout(300);
  ck('D Hintergrund → Mikro aus', !(await info()).mic);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => false}); document.dispatchEvent(new Event('visibilitychange')); }); await page.waitForTimeout(800);
  I = await info(); const r2 = await rms(); ck('E zurück → Mikro bleibt aus (G-MK8b-merge, Xander 27.10.), Hinweis steht', !I.mic && /Mikrofon aus/.test(I.head + ' ' + I.lcd.join(' ')), r2.toFixed(1) + ' ' + JSON.stringify(I));
  ck('E kein zusätzlicher Undo-Schritt', (await page.evaluate(() => SYNQUENZER.undoInfo().n)) === u);
  // reload: hint on open, then a vocoder program (H09) restarts the mic
  await page.evaluate(() => SYNQUENZER.save && SYNQUENZER.save()); await page.waitForTimeout(800);
  page = await ctx.newPage(); hook(page);
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await page.waitForTimeout(800);
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await open(); await page.waitForTimeout(400);
  I = await info(); ck('F nach Neuladen: Hinweis', !I.mic && /MIKROFON AUS/.test(I.lcd[1]) && /Mikrofon aus · E2 in GLOBAL 1B neu starten/.test(I.head), JSON.stringify(I));
  await toModus(); await tapEl('no'); await page.waitForTimeout(300); await tapEl('yes'); await page.waitForTimeout(1500);
  I = await info(); const r3 = await rms(); ck('G Split → Vocoder nach Neuladen: Mikro läuft, hörbar', I.mode === 3 && I.mic && r3 > -30, r3.toFixed(1));
  await page.evaluate(() => vocMicStop()); await page.waitForTimeout(200);
  await page.evaluate(() => mkProg.select(8, 10)); await page.waitForTimeout(1500);
  I = await info(); const r4 = await rms(); ck('H Vocoder-Programm H10 laden: Mikro läuft, hörbar', I.mode === 3 && I.mic && r4 > -30, r4.toFixed(1) + ' ' + JSON.stringify(I));
} else {
  ck('A ohne Gerät: Hinweis', I.mode === 3 && !I.mic && /Mikrofon/.test(I.head), JSON.stringify(I));
  await page.evaluate(() => { ED.lcd && (ED.lcd.querySelector('.lv') || ED.lcd).textContent; lcdShow('X', 'Y'); }); await page.waitForTimeout(100);
  await tapEl('no'); await page.waitForTimeout(300); await tapEl('yes'); await page.waitForTimeout(1500);
  I = await info(); ck('B zweites Umschalten ohne Gerät: Hinweis erneut', I.mode === 3 && !I.mic && /Mikrofon aus · E2 in GLOBAL 1B neu starten/.test(I.head) && /MIKROFON AUS/.test(I.lcd[1]), JSON.stringify(I));
}
ck('keine Fehler', !errs.length, JSON.stringify(errs));
console.log('FEHLER', fails);
await b.close();
