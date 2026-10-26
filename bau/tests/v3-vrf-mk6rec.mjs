// Verify: MK6 motion recording never ends at LAENGE 1 / after an Einmal run-out. Independent of v3-qa6-ui.mjs.
// Usage: node v3-vrf-mk6rec.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const cases = [
  ['A Einmal LAENGE 4, Note gehalten, ausgelaufen', {last: 4, run: 0}, 1300],
  ['B LAENGE 1 Schleife', {last: 1, run: 1}, 300],
  ['B2 LAENGE 1 Einmal', {last: 1, run: 0}, 300],
  ['C Kontrolle LAENGE 4 Schleife', {last: 4, run: 1}, 300],
  ['D Einmal LAENGE 4, AUFN. vor dem Auslaufen', {last: 4, run: 0}, 100],
];
for (const [id, s, pre] of cases) {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.setKbMode('play'); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => SYNQUENZER.keyOn(72)); await page.waitForTimeout(300); await page.evaluate(() => SYNQUENZER.keyOff(72));
  await page.waitForFunction(() => AU.synth[0] && AU.synth[0].node, null, {timeout: 10000}); await page.waitForTimeout(300);
  await page.evaluate(s => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(0, 't.0.f.cut', 40); Q.mkSet(0, 't.0.seq.last', s.last); Q.mkSet(0, 't.0.seq.run', s.run); Q.mkSet(0, 't.0.seq.res', 3); Q.keyOn(60); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }, s);
  await page.waitForTimeout(pre);
  // tap the real AUFN. key
  const rb = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="rec"]'); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  await page.mouse.click(rb.x, rb.y); await page.waitForTimeout(150);
  const armed = await page.evaluate(() => SYNQUENZER.mkPanel().rec);
  await page.evaluate(() => MKUI.setWahl(1, 5)); await page.waitForTimeout(100);
  const kb = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k1"]'); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2 + 6}; });
  await page.mouse.move(kb.x, kb.y); await page.mouse.down();
  for (let i = 1; i <= 40; i++) { await page.mouse.move(kb.x, kb.y - 2.5 * i); await page.waitForTimeout(50); }
  await page.mouse.up();
  // sample the worklet scope for 8 s
  const steps = new Set(), recs = new Set(); let done = false;
  for (let i = 0; i < 40; i++) {
    const r = await page.evaluate(() => { const sc = SYNQUENZER.mkScope(0); const E = AU.synth[0]; return {n: E.mkRecN || 0, sq: sc && sc.seq ? sc.seq[0] : null}; });
    if (r.sq) { steps.add(r.sq.step); recs.add(JSON.stringify(r.sq.rec) + (r.sq.done ? ' done' : '')); }
    if (r.n >= 1) { done = true; break; }
    await page.waitForTimeout(200);
  }
  const pn = await page.evaluate(() => SYNQUENZER.mkPanel()), t = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0]);
  const und = await page.evaluate(() => SYNQUENZER.undoInfo());
  console.log((done ? 'ENDS  ' : 'STUCK ') + id + ' | armed ' + JSON.stringify(armed) + ' | panel rec ' + JSON.stringify(pn.rec) + ' | worklet steps seen ' + [...steps].join(',') + ' | worklet rec ' + [...recs].join(' ; ') + ' | SEQ1 k ' + t.seq.q[0].k + ' v ' + t.seq.q[0].v.slice(0, 5).join(',') + ' on ' + t.seq.on + ' | CUTOFF ' + t.f.cut + ' | undo n ' + und.n + (errs.length ? ' | ERR ' + errs.join(' / ') : ''));
  // can the user get out? tap AUFN. again (back to SCHRITTE first)
  if (!done) {
    await page.evaluate(() => { MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }); await page.waitForTimeout(150);
    const rb2 = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="rec"]'); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
    await page.mouse.click(rb2.x, rb2.y); await page.waitForTimeout(200);
    const pn2 = await page.evaluate(() => SYNQUENZER.mkPanel()), t2 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0]);
    const lcd = await page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
    console.log('      after 2nd AUFN. tap: panel rec ' + JSON.stringify(pn2.rec) + ' | SEQ1 k ' + t2.seq.q[0].k + ' | CUTOFF ' + t2.f.cut + ' | LCD ' + lcd.slice(0, 80));
  }
  await page.evaluate(() => SYNQUENZER.keyOff(60)); await ctx.close();
}
await browser.close();
