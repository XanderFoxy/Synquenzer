import * as Q from './v3-qa7-lib.mjs';
const {ok} = Q; const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch();
for (const [nm, vp] of [['P1', {width: 390, height: 844}], ['L1', {width: 844, height: 390}]]) {
  const {page, errs} = await Q.openApp(br, {ctx: {viewport: vp}});
  await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
  await page.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); Q_.setEngine(1, 'analog'); const s = Q_.getSound(0); s.p.mk.mode = 3; Q_.setSound(0, s); Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 400)); Q_.mkIn(0, 'e2', 1);
    const c = AU.ctx; AU.synth[1].on(9e6, 57, .9, c.currentTime + .02); AU.synth[1].flush(); AU.synth[0].on(8e6, 48, .8, c.currentTime + .02); AU.synth[0].flush(); });
  await page.evaluate(() => MKUI.setWahl(2, 0)); await sleep(300);
  // open 16 BÄNDER by a tap on the matrix row (spec: Tipp auf die Matrix-Zeile K-PEGEL)
  const row = await page.evaluate(() => { const e = [...document.querySelectorAll('#synthSheet .mkx')].find(x => /16 BÄNDER/.test(x.innerText)); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, e.dataset.k]; });
  if (row) await page.mouse.click(row[0], row[1]); await sleep(1200);
  const r = await page.evaluate(() => { const cv = document.querySelector('#synthSheet canvas.mkbcv'); if (!cv) return {cv: false}; const x = cv.getContext('2d'), d = x.getImageData(0, 0, cv.width, cv.height).data; let g = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - 0x53) < 6 && Math.abs(d[i + 1] - 0xd2) < 6 && Math.abs(d[i + 2] - 0x7a) < 6) g++;
    const E = AU.synth[0]; return {cv: true, green: g, lv: E.mkLv ? {i: E.mkLv.i, b: E.mkLv.b && E.mkLv.b.filter(x => x > 0).length} : null, bLv: MKUI.P.bLv ? MKUI.P.bLv.filter(x => x > 0).length : null, view: MKUI.P.view, ein: !!(MKUI.P.el && MKUI.P.el.ein), onLv: !!E.onLv}; });
  ok('MK7-13 ' + nm + ' 16 BÄNDER zeigt Live-Bandpegel (grün)', r.cv && r.green > 50, JSON.stringify(r) + ' · Zeile ' + (row ? row[2] : 'nicht gefunden'));
  await page.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-mk7/bands-live-' + nm + '.png'});
  console.log('errs', errs.slice(0, 2));
  await page.context().close();
}
Q.summary(); await br.close();
