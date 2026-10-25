// QA (acceptance lens) MK1 in Chromium with a live AudioContext: header engine switch by tap, audible AM output, held keys over
// an engine change, panel gesture audible + undo, wheels by real multi-touch with pitch measured, reload persistence, ECO.
import { chromium } from 'playwright';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const out = (...a) => console.log(...a);
const FMT = {P1: [390, 844], P0: [428, 926], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
async function open(fmt, o = {}) {
  const [w, h] = FMT[fmt];
  const ctx = o.ctx || await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.waitForTimeout(300);
  if (!o.cold) { await page.evaluate(() => { ensureAudio(); }); await page.waitForFunction(() => SynthHost.state === 'ready' && AU.ctx && AU.ctx.state === 'running', null, {timeout: 20000}); await page.waitForTimeout(200); }
  return {ctx, page, errs};
}
// pitch of the master analyser by autocorrelation (Hz), level dBFS
const PITCH = `(() => { const a = AU.analyser, n = a.fftSize, b = new Float32Array(n); a.getFloatTimeDomainData(b); let e = 0, m = 0; for (const x of b) { e += x * x; m += x; } m /= n;
  const sr = AU.ctx.sampleRate; let first = -1, last = -1, c = 0; for (let i = 1; i < n; i++) { const y0 = b[i - 1] - m, y1 = b[i] - m; if (y0 < 0 && y1 >= 0) { const t = i - 1 + -y0 / (y1 - y0); if (first < 0) first = t; else c++; last = t; } }
  return {hz: c > 0 ? c * sr / (last - first) : 0, db: 10 * Math.log10(e / n + 1e-30)}; })()`;
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { out('ERR', id, (e.stack || e).toString().slice(0, 600)); } };
const settle = (page, ms = 250) => page.waitForTimeout(ms);

await T('header', async () => {
  for (const fmt of ['P0', 'P1', 'L1', 'L2', 'P3']) {
    const {ctx, page, errs} = await open(fmt);
    await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
    await settle(page, 400);
    const hd = await page.evaluate(() => { const h = document.querySelector('#synthSheet .sh-head'); const seg = h && h.querySelector('.seg.eng'); if (!seg) return {none: true};
      const bs = [...seg.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(), cs = getComputedStyle(b, '::after'); return {t: b.innerText.replace(/\n/g, '|'), w: +r.width.toFixed(1), h: +r.height.toFixed(1), after: cs.content !== 'none' ? [cs.top, cs.bottom, cs.height] : null}; });
      const ttl = h.querySelector('.ttl, .sh-title, h3, .tname'); return {chip: seg.classList.contains('engchip'), bs, eng: SYNQUENZER.getSound(0).engine, title: ttl ? [ttl.innerText, ttl.getBoundingClientRect().width] : null}; });
    out(fmt, 'header', JSON.stringify(hd));
    // switch to MS 2000 by a real tap
    const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
    if (hd.chip) {
      const b = await page.evaluate(() => { const r = document.querySelector('#synthSheet .engchip button').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await page.touchscreen.tap(b[0], b[1]); await settle(page, 300);
      const row = await page.evaluate(() => { const e = [...document.querySelectorAll('.pop button[data-e]')].find(x => x.dataset.e === 'mk'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.height]; });
      out(fmt, 'chip list row', JSON.stringify(row));
      if (row) { await page.touchscreen.tap(row[0], row[1]); await settle(page, 600); }
    } else {
      const b = await page.evaluate(() => { const bs = [...document.querySelectorAll('#synthSheet .sh-head .seg.eng button')]; const e = bs.find(x => /MS/.test(x.innerText)); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await page.touchscreen.tap(b[0], b[1]); await settle(page, 600);
    }
    const st = await page.evaluate(() => ({eng: SYNQUENZER.getSound(0).engine, undo: SYNQUENZER.undoInfo().n, edited: SYNQUENZER.soundEdited(0), panel: !!document.querySelector('#synthSheet .mkx'), info: SYNQUENZER.mkInfo(), scrollW: document.documentElement.scrollWidth, iw: innerWidth}));
    out(fmt, 'after tap', JSON.stringify(st), 'undo +', st.undo - u0);
    // header after the switch
    const hd2 = await page.evaluate(() => { const h = document.querySelector('#synthSheet .sh-head'); const over = [...h.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.className + ':' + e.innerText.slice(0, 20)); const seg = h.querySelector('.seg.eng');
      return {over, keys: [...seg.querySelectorAll('button')].map(b => [b.innerText.replace(/\n/g, '|'), +b.getBoundingClientRect().width.toFixed(1), +b.getBoundingClientRect().height.toFixed(1)])}; });
    out(fmt, 'header after', JSON.stringify(hd2));
    // AM audible through the live context
    await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'q1')); await settle(page, 400);
    const p1 = await page.evaluate(PITCH);
    await page.evaluate(() => SYNQUENZER.keyOff(60, 'q1')); await settle(page, 600);
    const p2 = await page.evaluate(PITCH);
    out(fmt, 'AM C4 live', JSON.stringify(p1), 'after release', JSON.stringify(p2));
    // undo the switch
    await page.evaluate(() => SYNQUENZER.undo()); await settle(page, 300);
    out(fmt, 'undo ->', await page.evaluate(() => [SYNQUENZER.getSound(0).engine, !!SYNQUENZER.getSound(0).p.mk, SYNQUENZER.soundEdited(0)]), 'errs', errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
});

await T('holdover', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await settle(page, 300);
  const rows = [];
  await page.evaluate(() => SYNQUENZER.keyOn(64, .8, 'h1')); await settle(page, 300);
  rows.push(['VA held', await page.evaluate(PITCH)]);
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'mk')); await settle(page, 300);
  rows.push(['-> mk held', await page.evaluate(PITCH), await page.evaluate(() => SYNQUENZER.engineInfo().perTrack[0])]);
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'analog')); await settle(page, 300);
  rows.push(['-> VA held', await page.evaluate(PITCH)]);
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'mk')); await settle(page, 300);
  rows.push(['-> mk held 2', await page.evaluate(PITCH)]);
  await page.evaluate(() => SYNQUENZER.keyOff(64, 'h1')); await settle(page, 1500);
  rows.push(['released', await page.evaluate(PITCH), await page.evaluate(() => SYNQUENZER.engineInfo().perTrack[0])]);
  for (const r of rows) out('holdover', JSON.stringify(r));
  // a chord held in mk, switch to VA, release all: silence
  await page.evaluate(() => { for (const n of [60, 64, 67]) SYNQUENZER.keyOn(n, .8, 'c' + n); }); await settle(page, 300);
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'analog')); await settle(page, 200);
  await page.evaluate(() => { for (const n of [60, 64, 67]) SYNQUENZER.keyOff(n, 'c' + n); }); await settle(page, 1500);
  out('holdover chord mk->VA released', JSON.stringify(await page.evaluate(PITCH)), JSON.stringify(await page.evaluate(() => SYNQUENZER.engineInfo().perTrack[0])));
  // chord held in VA, switch to mk, release all
  await page.evaluate(() => { for (const n of [60, 64, 67]) SYNQUENZER.keyOn(n, .8, 'd' + n); }); await settle(page, 300);
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'mk')); await settle(page, 200);
  await page.evaluate(() => { for (const n of [60, 64, 67]) SYNQUENZER.keyOff(n, 'd' + n); }); await settle(page, 1500);
  out('holdover chord VA->mk released', JSON.stringify(await page.evaluate(PITCH)), JSON.stringify(await page.evaluate(() => SYNQUENZER.engineInfo().perTrack[0])), 'errs', errs.slice(0, 3).join(' | '));
  await ctx.close();
});

await T('knob', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await settle(page, 500);
  await page.evaluate(() => SYNQUENZER.keyOn(48, .8, 'k')); await settle(page, 300);
  const m0 = await page.evaluate(() => SYNQUENZER.meter()), u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  // SPIEL knob 1 = CUTOFF: drag down with a touch drag (CDP)
  const cdp = await ctx.newCDPSession(page);
  const b = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map(p => ({x: p[0], y: p[1], id: p[2] || 1}))});
  await touch('touchStart', [[b[0], b[1]]]); for (let s = 1; s <= 20; s++) { await touch('touchMove', [[b[0], b[1] + 6 * s]]); await page.waitForTimeout(16); }
  const mid = await page.evaluate(() => [SYNQUENZER.meter(), SYNQUENZER.mkGet(0).t[0].f.cut, (SYNQUENZER.mkScope(0) || {voices: []}).voices.map(v => Math.round(v.cutHz))]);
  await touch('touchEnd', []); await settle(page, 200);
  const m1 = await page.evaluate(() => [SYNQUENZER.meter(), SYNQUENZER.mkGet(0).t[0].f.cut, SYNQUENZER.undoInfo().n, document.querySelector('#synthSheet .lcd, #synthSheet .sh-lcd, .lcd') ? document.querySelector('#synthSheet .lcd, #synthSheet .sh-lcd, .lcd').innerText : null]);
  out('knob CUTOFF drag: before', JSON.stringify(m0), 'during', JSON.stringify(mid), 'after', JSON.stringify(m1), 'undo +', m1[2] - u0);
  await page.evaluate(() => SYNQUENZER.keyOff(48, 'k')); await settle(page, 200);
  await page.evaluate(() => SYNQUENZER.undo()); await settle(page, 100);
  out('knob undo -> cut', await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut), 'errs', errs.slice(0, 3).join(' | '));
  await ctx.close();
});

await T('wheels', async () => {
  for (const fmt of ['P1', 'L1']) {
    const {ctx, page, errs} = await open(fmt);
    await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.mkSet(0, 't.0.o1.w', 2); SYNQUENZER.mkSet(0, 't.0.f.cut', 127); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
    await settle(page, 500);
    const cdp = await ctx.newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map(p => ({x: p[0], y: p[1], id: p[2]}))});
    const wb = await page.evaluate(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="bend"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; });
    // the first white key (bottom part)
    const keys = await page.evaluate(() => [...document.querySelectorAll('#kb .white, #kb .w, #kb [data-n]')].slice(0, 1).map(k => { const b = k.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height - 10, k.dataset.n]; }));
    out(fmt, 'wheel', JSON.stringify(wb), 'key', JSON.stringify(keys));
    if (!wb || !keys.length) { await ctx.close(); continue; }
    // finger 1 on the key: hold
    await touch('touchStart', [[keys[0][0], keys[0][1], 5]]); await settle(page, 400);
    const p0 = await page.evaluate(PITCH);
    // finger 2 on the bend wheel, drag to the top while finger 1 holds
    const cx = wb.x + wb.w / 2, y0 = wb.y + wb.h / 2;
    await touch('touchMove', [[keys[0][0], keys[0][1], 5], [cx, y0, 6]]);
    for (let s = 1; s <= 12; s++) await touch('touchMove', [[keys[0][0], keys[0][1], 5], [cx, y0 - (wb.h / 2 + 8) * s / 12, 6]]);
    await settle(page, 300);
    const p1 = await page.evaluate(PITCH), bw = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
    // release the wheel only (finger 1 stays)
    await touch('touchMove', [[keys[0][0], keys[0][1], 5]]);
    await settle(page, 300);
    const p2 = await page.evaluate(PITCH), bw2 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await settle(page, 300);
    const ct = (a, b) => 1200 * Math.log2(a / b);
    out(fmt, 'held key', JSON.stringify(p0), '| bend up', JSON.stringify(p1), 'wheel', bw, Math.round(ct(p1.hz, p0.hz)), 'ct | wheel released', JSON.stringify(p2), 'wheel', bw2, Math.round(ct(p2.hz, p0.hz)), 'ct');
    // mod wheel with vibrato: vib 63 needs a pitch spread
    await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.vib', 63); SYNQUENZER.mkSet(0, 't.0.l2.f', 90); });
    const mb = await page.evaluate(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="mod"]'); const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; });
    await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'm')); await settle(page, 300);
    const spread = async () => { const v = []; for (let k = 0; k < 25; k++) { v.push((await page.evaluate(PITCH)).hz); await page.waitForTimeout(20); } return Math.round(ct(Math.max(...v), Math.min(...v))); };
    const s0 = await spread();
    await touch('touchStart', [[mb.x + mb.w / 2, mb.y + mb.h - 6, 7]]); for (let s = 1; s <= 12; s++) await touch('touchMove', [[mb.x + mb.w / 2, mb.y + mb.h - 6 - (mb.h) * s / 12, 7]]); await touch('touchEnd', []);
    await settle(page, 200);
    const s1 = await spread();
    out(fmt, 'vibrato spread mod 0:', s0, 'ct; mod top:', s1, 'ct (wheel', await page.evaluate(() => SYNQUENZER.mkWheel(0, 'mod')), ')');
    await page.evaluate(() => SYNQUENZER.keyOff(60, 'm'));
    // switch to track 1 (VA) and back: mod wheel live value per track
    await page.evaluate(() => SYNQUENZER.selectTrack(1)); await settle(page, 200);
    const vis1 = await page.evaluate(() => { const w = document.getElementById('mkWh'); return w ? !w.hidden && w.getBoundingClientRect().width > 0 : false; });
    await page.evaluate(() => SYNQUENZER.selectTrack(0)); await settle(page, 200);
    const vis0 = await page.evaluate(() => { const w = document.getElementById('mkWh'); return w ? !w.hidden && w.getBoundingClientRect().width > 0 : false; });
    out(fmt, 'wheels visible VA track:', vis1, 'AM track:', vis0, 'mod after switch back', await page.evaluate(() => SYNQUENZER.mkWheel(0, 'mod')), 'errs', errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
});

await T('reload', async () => {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  let {page, errs} = await open('P1', {ctx});
  await page.evaluate(() => { SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.mkSet(1, 't.0.f.cut', 77); SYNQUENZER.mkSet(1, 't.0.o2.mod', 3); SYNQUENZER.mkSet(1, 't.0.o2.semi', 7); SYNQUENZER.mkSet(1, 't.0.mix.o2', 100); });
  await page.evaluate(() => SYNQUENZER.save()); await settle(page, 500);
  const a = await page.evaluate(() => [JSON.stringify(SYNQUENZER.mkGet(1)), SQStore.soundHash(SYNQUENZER.getSound(1)), SYNQUENZER.project().format, SYNQUENZER.getSound(1).engine]);
  await page.close();
  ({page, errs} = await open('P1', {ctx}));
  const b = await page.evaluate(() => [JSON.stringify(SYNQUENZER.mkGet(1)), SQStore.soundHash(SYNQUENZER.getSound(1)), SYNQUENZER.project().format, SYNQUENZER.getSound(1).engine, SYNQUENZER.mkInfo().loaded, SYNQUENZER.soundEdited(1)]);
  out('reload: same p.mk', a[0] === b[0], 'hash', a[1], b[1], 'format', a[2], b[2], 'engine', b[3], 'block loaded', b[4], 'edited', b[5], 'errs', errs.slice(0, 3).join(' | '));
  // play on track 1 after reload: audible
  await page.evaluate(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.keyOn(57, .8, 'r'); }); await settle(page, 400);
  out('reload: AM plays', JSON.stringify(await page.evaluate(PITCH)));
  await page.evaluate(() => SYNQUENZER.keyOff(57, 'r'));
  await ctx.close();
});

await T('eco', async () => {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await settle(page, 400);
  await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'w')); await settle(page, 400);
  const w = await page.evaluate(PITCH); await page.evaluate(() => SYNQUENZER.keyOff(60, 'w')); await settle(page, 600);
  await page.evaluate(() => SYNQUENZER.forceNative(true)); await settle(page, 300);
  await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'e')); await settle(page, 400);
  const e = await page.evaluate(PITCH), info = await page.evaluate(() => [SYNQUENZER.engineInfo().synth, SYNQUENZER.engineInfo().perTrack[0], document.querySelector('#synthSheet .eco, .eco') ? document.querySelector('#synthSheet .eco, .eco').innerText : null]);
  await page.evaluate(() => SYNQUENZER.keyOff(60, 'e')); await settle(page, 800);
  const rest = await page.evaluate(PITCH);
  // a panel change while ECO: audible on the next note?
  await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 40));
  await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'f')); await settle(page, 400);
  const e2 = await page.evaluate(() => SYNQUENZER.meter()); await page.evaluate(() => SYNQUENZER.keyOff(60, 'f'));
  out('eco: worklet', JSON.stringify(w), 'eco', JSON.stringify(e), JSON.stringify(info), 'after release', JSON.stringify(rest), 'eco cut 40 meter', JSON.stringify(e2), 'errs', errs.slice(0, 3).join(' | '));
  await ctx.close();
});
await browser.close();
