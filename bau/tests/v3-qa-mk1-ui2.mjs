import { chromium } from 'playwright';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
async function open(w, h) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready'); await page.waitForTimeout(200);
  return {ctx, page, errs};
}
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { console.log('ERR', id, String(e.stack).slice(0, 500)); } };
await T('chipTab', async () => {
  const {ctx, page} = await open(428, 926);
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(400);
  const hdr = () => page.evaluate(() => { const s = document.querySelector('#synthSheet .sh-head .seg.eng'); return [...s.querySelectorAll('button')].map(b => b.innerText.replace(/\n/g, ' ')).join(' | '); });
  const a = await hdr();
  // tap the FILTER tab like a user
  const tb = await page.evaluate(() => { const b = [...document.querySelectorAll('#synthSheet .stab, #synthSheet [data-tab], #synthSheet .tabs button')].find(x => /FILTER/.test(x.innerText)); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  if (tb) { await page.touchscreen.tap(tb[0], tb[1]); await page.waitForTimeout(400); }
  const b = await hdr();
  await page.screenshot({path: new URL('./v3-qa-mk1-chip-428.png', import.meta.url).pathname, clip: {x: 0, y: 0, width: 428, height: 926}});
  console.log('428x926 VA sheet: first open [' + a + '] -> after tapping FILTER tab [' + b + ']', tb ? '' : '(no tab found)');
  await ctx.close();
});
await T('scene', async () => {
  const {ctx, page, errs} = await open(844, 390);
  // which tracks have clips in scene 0?
  const info = await page.evaluate(() => SYNQUENZER.tracks().map(t => [t.i, t.name, t.kind]));
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.setEngine(2, 'mk'); SYNQUENZER.setEngine(3, 'mk'); });
  await page.evaluate(() => { SYNQUENZER.clearLog && SYNQUENZER.clearLog(); SYNQUENZER.play(); });
  const samples = [];
  for (let k = 0; k < 16; k++) { await page.waitForTimeout(250); samples.push(await page.evaluate(() => ({m: SYNQUENZER.meter().rmsDb, v: [0, 1, 2, 3].map(t => { const s = SYNQUENZER.mkScope(t); return s ? s.voices.length : -1; })}))); }
  const log = await page.evaluate(() => { const L = SYNQUENZER.noteLog(); const c = {}; for (const e of L) c[e.track] = (c[e.track] || 0) + 1; return c; });
  await page.evaluate(() => SYNQUENZER.stop()); await page.waitForTimeout(2500);
  const after = await page.evaluate(() => ({m: SYNQUENZER.meter().rmsDb, v: [0, 1, 2, 3].map(t => { const s = SYNQUENZER.mkScope(t); return s ? s.voices.length : -1; }), pt: SYNQUENZER.engineInfo().perTrack.map(p => p.voices), tickErr: SYNQUENZER.tickErrors ? SYNQUENZER.tickErrors() : null}));
  console.log('tracks', JSON.stringify(info));
  console.log('scene playback with 4 AM tracks: meter dB', samples.map(s => Math.round(s.m)).join(','), '| voices per track (max)', [0, 1, 2, 3].map(t => Math.max(...samples.map(s => s.v[t]))).join(','), '| noteLog per track', JSON.stringify(log));
  console.log('after stop + 2.5 s', JSON.stringify(after), 'errs', errs.slice(0, 3));
  await ctx.close();
});
await T('ab', async () => {
  const {ctx, page, errs} = await open(844, 390);
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(400);
  await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 33));
  const pre = await page.evaluate(() => [JSON.stringify(SYNQUENZER.getSound(0)), SYNQUENZER.undoInfo().n]);
  const tapSel = async sel => { const b = await page.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); await page.touchscreen.tap(b[0], b[1]); await page.waitForTimeout(400); };
  await tapSel('#synthSheet .abb');
  const mid = await page.evaluate(() => [SYNQUENZER.getSound(0).engine, SYNQUENZER.getSound(0).name, !!document.querySelector('#synthSheet .mkx')]);
  await tapSel('#synthSheet .abb');
  const post = await page.evaluate(() => [JSON.stringify(SYNQUENZER.getSound(0)), SYNQUENZER.undoInfo().n, !!document.querySelector('#synthSheet .mkx')]);
  console.log('A/B: during A', JSON.stringify(mid), '| back on B: sound deep-equal', pre[0] === post[0], 'undo', pre[1], '->', post[1], 'panel', post[2], 'errs', errs.slice(0, 3));
  await ctx.close();
});
await T('tempo', async () => {
  const {ctx, page} = await open(844, 390);
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(400);
  const cdp = await ctx.newCDPSession(page);
  const drag = async (k, dy) => { const b = await page.evaluate(k => { const r = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; }, k);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: b[0], y: b[1], id: 1}]}); for (let s = 1; s <= 12; s++) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: b[0], y: b[1] - dy * s / 12, id: 1}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(200); };
  const s0 = await page.evaluate(() => [S.bpm, SYNQUENZER.undoInfo().n, S.tracks[0].sound.fx.vol]);
  await drag('k4', 60);
  const s1 = await page.evaluate(() => [S.bpm, SYNQUENZER.undoInfo().n]);
  await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(200);
  const s2 = await page.evaluate(() => [S.bpm, SYNQUENZER.undoInfo().n]);
  console.log('TEMPO knob drag: bpm', s0[0], '->', s1[0], '| undo entries', s0[1], '->', s1[1], '| after undo bpm', s2[0]);
  await drag('vol', -40);
  const v1 = await page.evaluate(() => [S.tracks[0].sound.fx.vol, SYNQUENZER.undoInfo().n]);
  console.log('VOLUME knob drag: vol', s0[2], '->', v1[0], 'undo entries', s2[1], '->', v1[1]);
  await ctx.close();
});
await browser.close();
