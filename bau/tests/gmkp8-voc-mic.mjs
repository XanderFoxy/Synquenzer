// G-MKP8 (Xander 26.10., 4.15.0 on the device: „man hört nichts“ im Vocoder): with a fake microphone, INIT → MODUS Vocoder (on the
// panel: EDIT, SELECT 1 = 01 COMMON, tap on the display = list, „Vocoder“) → hold a key is audible without any other step;
// E2 = mic, one undo for mode + input, undo deep-equal. Also: H09 (a Vocoder program) gets E2 = mic; inside an iframe (no mic,
// Claude viewer) the LCD says „VOCODER · Mikrofon nur auf der GitHub-Seite“. Usage: node gmkp8-voc-mic.mjs <index.html> [old.html]
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
const FILE = path.resolve(process.argv[2]), OLD = process.argv[3] ? path.resolve(process.argv[3]) : null;
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const exe = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const b = await chromium.launch({executablePath: exe, args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']});
async function flow(file, label) {
  const ctx = await b.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + file); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  // INIT project, track 1 = MS 2000 (INIT), its sheet open
  await page.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForFunction(() => window.MKUI && MKUI.PL.ready && SYNQUENZER.mkPanel(), null, {timeout: 15000}); await page.waitForTimeout(300);
  const tapEl = async id => { const r = await page.evaluate(id => { const e = SYNQUENZER.mkPanel().elements.find(x => x.id === id); return e && {x: e.px.x + e.px.w / 2, y: e.px.y + e.px.h / 2}; }, id); if (!r) throw new Error('kein ' + id); await page.touchscreen.tap(r.x, r.y); await page.waitForTimeout(150); };
  await page.evaluate(() => MKUI.view({ansicht: 'ganz'})); await page.waitForTimeout(300);
  const pre = await page.evaluate(() => ({mode: S.tracks[0].sound.p.mk.mode, mkIn: S.tracks[0].mkIn || null, u: UNDO.length, snd: JSON.stringify(S.tracks[0].sound)}));
  await tapEl('edit'); await tapEl('s1'); await tapEl('lcd');
  const hasList = await page.evaluate(() => !!document.querySelector('.pop button[data-v="3"]'));
  if (hasList) await page.tap('.pop button[data-v="3"]');
  await page.waitForTimeout(1500);   // the mic starts (fake device), the route builds
  await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'k1')); await page.waitForTimeout(900);
  const m = []; for (let k = 0; k < 6; k++) { m.push(await page.evaluate(() => SYNQUENZER.meter().rmsDb)); await page.waitForTimeout(120); }
  await page.evaluate(() => SYNQUENZER.keyOff(60, 'k1'));
  const post = await page.evaluate(() => ({mode: S.tracks[0].sound.p.mk.mode, mkIn: S.tracks[0].mkIn || null, u: UNDO.length, top: UNDO.length && UNDO[UNDO.length - 1].kind, items: UNDO.length && UNDO[UNDO.length - 1].items ? UNDO[UNDO.length - 1].items.map(x => x.kind) : null, micOn: typeof vocMicOn === 'function' && vocMicOn(), lcd: ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''}));
  let un = null;
  if (label === 'neu') { un = await page.evaluate(async b => { undo(); await new Promise(r => setTimeout(r, 400)); return {snd: JSON.stringify(S.tracks[0].sound) === b.snd, mkIn: S.tracks[0].mkIn || null, mic: vocMicOn()}; }, pre);
    await page.evaluate(() => redo()); }
  // H09: a Vocoder program also gets E2 = mic (on a fresh track without input)
  let h09 = null;
  if (label === 'neu') h09 = await page.evaluate(async () => { undo(); SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 400)); const u0 = UNDO.length; mkProg.select(8, 9); await new Promise(r => setTimeout(r, 1200)); const steps = UNDO.length - u0, top = UNDO[UNDO.length - 1].kind; SYNQUENZER.keyOn(57, .8, 'h1'); await new Promise(r => setTimeout(r, 900)); let rms = -Infinity; for (let k = 0; k < 5; k++) { rms = Math.max(rms, SYNQUENZER.meter().rmsDb); await new Promise(r => setTimeout(r, 120)); } SYNQUENZER.keyOff(57, 'h1'); return {mkIn: S.tracks[1].mkIn || null, steps, top, rms: +rms.toFixed(1)}; });
  await ctx.close();
  return {pre, post, m, hasList, errs, un, h09};
}
const r = await flow(FILE, 'neu');
const rmsMax = Math.max(...r.m);
ok('VOC-MIC INIT → Vocoder (Platte: EDIT, SELECT 1, Anzeige, „Vocoder“)', r.hasList && r.pre.mode === 0 && r.post.mode === 3, JSON.stringify({vor: r.pre.mode, nach: r.post.mode}));
ok('VOC-MIC E2 = Mikrofon gesetzt und gestartet', r.post.mkIn && r.post.mkIn.e2 === 'mic' && r.post.micOn, JSON.stringify(r.post.mkIn) + ' mic ' + r.post.micOn);
ok('VOC-MIC Taste halten ist hörbar (rms > 0)', rmsMax > -60, 'rms ' + r.m.map(x => x.toFixed(1)).join(' / ') + ' dBFS');
ok('VOC-MIC ein Undo (Modus + Eingang)', r.post.u === r.pre.u + 1 && r.post.top === 'group' && JSON.stringify(r.post.items) === '["sound","mkin"]', (r.post.u - r.pre.u) + ' ' + r.post.top + ' ' + JSON.stringify(r.post.items));
ok('VOC-MIC Undo deep-equal (Synth, kein Eingang, Mikrofon aus)', r.un && r.un.snd && r.un.mkIn === null && !r.un.mic, JSON.stringify(r.un));
ok('VOC-MIC H09 (Vocoder-Programm) bekommt E2 = Mikrofon, ein Undo', r.h09 && r.h09.mkIn && r.h09.mkIn.e2 === 'mic' && r.h09.steps === 1 && r.h09.top === 'group' && r.h09.rms > -60, JSON.stringify(r.h09));
ok('VOC-MIC Konsole', r.errs.length === 0, r.errs.join(' | ').slice(0, 300));
if (OLD) { const o = await flow(OLD, 'alt'); console.log('INFO Vorgänger ' + path.basename(OLD) + ': Modus ' + o.post.mode + ', E2 ' + JSON.stringify(o.post.mkIn) + ', rms ' + o.m.map(x => x.toFixed(1)).join(' / ') + ' dBFS'); }
// inside an iframe: no microphone (window.top !== self) → the LCD names the GitHub page, E2 stays empty
{
  const wrap = path.join(path.dirname(new URL(import.meta.url).pathname), 'gmkp8-iframe.html');
  fs.writeFileSync(wrap, `<!doctype html><meta charset="utf-8"><body style="margin:0"><iframe src="file://${FILE}" style="border:0;width:844px;height:390px" allow="microphone"></iframe>`);
  const ctx = await b.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true}); const page = await ctx.newPage();
  await page.goto('file://' + wrap); await page.waitForTimeout(500);
  const fr = page.frames().find(f => f !== page.mainFrame());
  await fr.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const x = await fr.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 800));
    MKUI.view({modus: 'edit', seite: '01'}); const d = MKUI.curItem(); SYNQUENZER.soundEdit ? 0 : 0; await new Promise(r => setTimeout(r, 100)); MKUI.lcdTap(); await new Promise(r => setTimeout(r, 300)); document.querySelector('.pop button[data-v="3"]').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); document.querySelector('.pop button[data-v="3"]').dispatchEvent(new PointerEvent('pointerup', {bubbles: true})); await new Promise(r => setTimeout(r, 300));
    return {avail: micAvail(), mode: S.tracks[0].sound.p.mk.mode, mkIn: S.tracks[0].mkIn || null, lcd: ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '', l2: MKUI.lcdLines()[1]}; });
  ok('VOC-MIC im iframe: Hinweis statt Stille ohne Grund', !x.avail && x.mode === 3 && x.mkIn === null && /VOCODER/.test(x.lcd) && /Mikrofon nur auf der GitHub-Seite/.test(x.lcd) && /MIKRO NUR GITHUB/.test(x.l2), JSON.stringify(x));
  await ctx.close();
}
console.log('ERGEBNIS', n - fails, '/', n, 'PASS'); await b.close();
