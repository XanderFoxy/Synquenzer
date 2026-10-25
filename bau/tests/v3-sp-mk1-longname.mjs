// QA MK1-21 (L6 nothing cut): a sound name of 32 characters (A.1: name <= 32) in the program line Z9 and elsewhere in the panel
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk1-shots/';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
for (const [nm, w, h, half] of [['P1', 390, 844], ['P2', 375, 667, 'links'], ['P3', 320, 568, 'links'], ['L1', 844, 390], ['L2', 667, 375, 'links'], ['W', 844, 1180]]) {
  const page = await browser.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); S.tracks[0].sound.name = 'Breiter Unisono Lead mit Hall 12'; SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  if (half) await page.evaluate(h => { ED.tab = h; safeRebuild(buildSynthEd); }, half);
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx.mprog .mpn'); if (!e || !e.offsetParent) return null; return {txt: e.textContent, sw: e.scrollWidth, cw: e.clientWidth}; });
  console.log(nm, JSON.stringify(r), r && r.sw > r.cw ? 'CUT (' + Math.round(100 * r.cw / r.sw) + ' % visible)' : 'fits');
  if (nm === 'P3' || nm === 'L1') await page.screenshot({path: OUT + 'longname-' + nm + '.png'});
  await page.close();
}
await browser.close();
