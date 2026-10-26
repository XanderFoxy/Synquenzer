import * as Q from './v3-qa7-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch();
for (const vp of [{width: 390, height: 844}, {width: 844, height: 390}]) {
  const {page, errs} = await Q.openApp(br, {ctx: {viewport: vp}});
  await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
  await page.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.hold = new Array(16).fill(100); Q_.setSound(0, s); Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 300)); await Q_.forceNative(true); await new Promise(r => setTimeout(r, 1200)); });
  const lcdTxt = () => page.evaluate(() => { const l = document.querySelector('#synthSheet .mklcd, #synthSheet .lcd'); return (ED.lcd ? ED.lcd.innerText : '').replace(/\s+/g, ' ') + ' || ' + (l ? l.innerText.replace(/\s+/g, ' ') : ''); });
  const l0 = await lcdTxt();
  // press a key on the on-screen keyboard (real pointer)
  const k = await page.evaluate(() => { const ks = [...document.querySelectorAll('.kb .key, .kbd .key, [data-note]')].filter(e => e.getBoundingClientRect().width > 10); const e = ks[Math.floor(ks.length / 2)]; if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height * .8]; });
  if (k) { await page.mouse.move(k[0], k[1]); await page.mouse.down(); await sleep(500); }
  const l1 = await lcdTxt(); if (k) await page.mouse.up();
  const bx = await page.evaluate(() => { const e = ED.eco && !ED.eco.hidden && ED.eco.getBoundingClientRect().width > 0 ? ED.eco : ED.ecoB; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, which: e === ED.eco ? 'badge' : 'key'}; });
  await page.mouse.click(bx.x, bx.y); await sleep(300);
  const l2 = await lcdTxt(); const pop = await page.evaluate(() => !!document.querySelector('.pop h4') && document.querySelector('.pop h4').innerText);
  console.log(JSON.stringify(vp), '\n  nach ECO:', l0.slice(0, 120), '\n  Taste gedrückt (key ' + !!k + '):', l1.slice(0, 120), '\n  Tipp auf ' + bx.which + ':', l2.slice(0, 120), ' popup:', pop, '\n  errs', errs.slice(0, 2));
  await page.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-mk7/eco-' + vp.width + '.png'});
  await page.context().close();
}
await br.close();
