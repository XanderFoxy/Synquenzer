import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/repro-mk7-ctl/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [nm, vp] of [['P1', {width: 390, height: 844}], ['L1', {width: 844, height: 390}]]) {
  const ctx = await br.newContext({viewport: vp, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE);
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
  await page.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); Q_.setEngine(1, 'analog'); const s = Q_.getSound(0); s.p.mk.mode = 3; Q_.setSound(0, s); Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 400)); Q_.mkIn(0, 'e2', 1);
    const c = AU.ctx; AU.synth[1].on(9e6, 57, .9, c.currentTime + .02); AU.synth[1].flush(); AU.synth[0].on(8e6, 48, .8, c.currentTime + .02); AU.synth[0].flush(); });
  await page.evaluate(() => MKUI.setWahl(2, 0)); await sleep(400);
  const rowInfo = await page.evaluate(() => { const e = [...document.querySelectorAll('#synthSheet .mkx')].find(x => /16 BÄNDER/.test(x.innerText)); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, k: e.dataset.k, txt: e.innerText.replace(/\n/g, ' | ')}; });
  console.log(nm, 'row', JSON.stringify(rowInfo));
  if (rowInfo) await page.touchscreen.tap(rowInfo.x, rowInfo.y);
  await sleep(300);
  // sample over 1.5 s: count onLv callbacks reaching the view and P.bLv
  const r = await page.evaluate(async () => {
    const E = AU.synth[0]; const n0 = E.mkLvN || 0;
    let drawCalls = 0; const cv = document.querySelector('#synthSheet canvas.mkbcv');
    await new Promise(r => setTimeout(r, 1500));
    const n1 = E.mkLvN || 0;
    const res = {view: MKUI.P.view, hasCv: !!cv, built: MKUI.P.built, elBands: !!(MKUI.P.el && MKUI.P.el.bands), elEin: !!(MKUI.P.el && MKUI.P.el.ein), onLv: E.onLv ? E.onLv.name : null, lvRateHz: (n1 - n0) / 1.5,
      lvBandsNonZero: E.mkLv && E.mkLv.b ? E.mkLv.b.filter(x => x > 0).length : null, lvMaxBand: E.mkLv && E.mkLv.b ? Math.max(...E.mkLv.b) : null, bLv: MKUI.P.bLv ? MKUI.P.bLv.length : null};
    if (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let g = 0, o = 0; for (let i = 0; i < d.length; i += 4) { if (Math.abs(d[i] - 0x53) < 6 && Math.abs(d[i + 1] - 0xd2) < 6 && Math.abs(d[i + 2] - 0x7a) < 6) g++; if (Math.abs(d[i] - 0xff) < 6 && Math.abs(d[i + 1] - 0x7a) < 6 && Math.abs(d[i + 2] - 0x3d) < 6) o++; } res.green = g; res.orange = o; }
    // control: manually call paintEin with the current level message -> does it reach bandsLive?
    return res; });
  console.log(nm, JSON.stringify(r));
  // control experiment: call bandsLive directly to prove the draw path works if reached
  const ctl = await page.evaluate(async () => { const E = AU.synth[0]; if (!E.mkLv || !E.mkLv.b) return 'no lv';
    // emulate what paintEin should do for the bands view
    const P = MKUI.P; const U = P.el; return {uBands: !!U.bands, uEin: !!U.ein}; });
  console.log(nm, 'ctl', JSON.stringify(ctl));
  await page.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-mk7/repro-bandslive-ctl-' + nm + '.png'});
  console.log(nm, 'errs', errs.slice(0, 3));
  await ctx.close();
}
await br.close();
