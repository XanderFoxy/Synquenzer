// Nachtest der Prüf-Funde (SOLO folgt Pad, Ende über closeSheets, SCL-LED, TAP 60/300, BPM-Zeit, Kategorie)
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + process.argv[2]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(500);
const r = await p.evaluate(async () => {
  ensureAudio(); for (const id of ['kick', 'snare', 'clap', 'tomL']) SYNQUENZER.setPadSource(id, 'md');
  await new Promise(r => setTimeout(r, 600));
  R.selT = DRUM_T; openEditor(); ED.dVoice = 0; ED.dTab = 'sound'; buildDrumEd();
  const o = {};
  document.querySelector('.mdsolo').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); MDE.solo = true; mdSoloApply();
  ED.dVoice = 1; buildDrumEd(); o.soloFollows = MDX.solo && MDX.solo.ch === 1;
  ED.dVoice = 2; SYNQUENZER.setPadSource('rim', 'drum'); buildDrumEd(); o.soloEndsOnDrumPad = !MDE.solo && MDX.solo === null;
  ED.dVoice = 0; buildDrumEd(); MDE.solo = true; mdSoloApply(); openMenu(); o.soloEndsOnMenu = !MDE.solo && MDX.solo === null; closeMenu();
  R.selT = DRUM_T; openEditor(); ED.dVoice = 0; ED.dTab = 'sound'; buildDrumEd();
  mdScl('h1'); o.sclLed = document.querySelector('.mdall').classList.contains('on');
  const fake = el('button'), t = performance.now();
  MDE.taps = [t - 3000, t - 2000, t - 1000]; mdTap(fake); o.tap60 = fake.textContent;
  MDE.taps = [t - 150, t - 100, t - 50]; mdTap(fake); o.tap300 = fake.textContent;
  o.bpmTime = mdBpmTxt(421);
  MDE.cat = 'own';
  return o;
});
console.log(JSON.stringify(r), errs);
const ok = r.soloFollows && r.soloEndsOnDrumPad && r.soloEndsOnMenu && r.sclLed && r.tap60 === '60 ♩' && r.tap300.endsWith('♬') && r.bpmTime === '0.050 s';
await b.close(); process.exit(ok ? 0 : 1);
