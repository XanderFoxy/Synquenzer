// QA regression MK6: SCHRITTE view open, then realistic ways the MS 2000 sound goes away: undo of the engine switch,
// "Demo laden" / "Neues Projekt" / file open from the menu; count uncaught errors over 3 s
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const file = S + 'mk-br-MK6/index.html';
const V2 = S + 'dirigent-test/v3-qa-v2ereg/dirigent-v2.json';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const how of ['undo', 'demo-api', 'file-open', 'engine-ui', 'menu-new']) {
  const ctx = await br.newContext({viewport: {width: 390, height: 844}});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e) + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' ').trim()));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.waitForTimeout(500);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.selectTrack(0); Q.openEditor(); });
  await p.waitForTimeout(600);
  // engine switch to MS 2000 through the editor's engine key (real UI, one undo step)
  const eng = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /MS 2000/.test(x.textContent) && x.closest('.seg')); return b ? 'key' : 'chip'; });
  if (eng === 'key') await p.locator('.seg button', {hasText: 'MS 2000'}).filter({visible: true}).first().click();
  else { await p.locator('.engchip button').first().click(); await p.waitForTimeout(300); await p.locator('.pop button[data-e="mk"]').click(); }
  await p.waitForTimeout(1500);
  const isMk = await p.evaluate(() => window.SYNQUENZER.getSound(0).engine);
  await p.evaluate(() => { const M = window.MKUI; M.setWahl(2, 10); M.viewOpen('schritte'); });
  await p.waitForTimeout(500);
  const before = errs.length;
  if (how === 'undo') { await p.evaluate(() => window.SYNQUENZER.undo()); }
  if (how === 'demo-api') { await p.evaluate(async () => { await window.SYNQUENZER.loadDemo(); }); }
  if (how === 'file-open') { await p.click('#bMenu').catch(() => {}); await p.waitForTimeout(400); await p.setInputFiles('#fileIn', V2); }
  if (how === 'engine-ui') { const k = await p.locator('.seg button', {hasText: /^VA/}).filter({visible: true}).count(); if (k) await p.locator('.seg button', {hasText: /^VA/}).filter({visible: true}).first().click(); else { await p.locator('.engchip button').first().click(); await p.waitForTimeout(300); await p.locator('.pop button[data-e="analog"]').click(); } }
  if (how === 'menu-new') { await p.click('#bMenu').catch(() => {}); await p.waitForTimeout(400); const b = p.locator('button', {hasText: 'Neues Projekt'}).filter({visible: true}).first(); if (await b.count()) await b.click(); await p.waitForTimeout(400); const c = p.locator('button', {hasText: /Leer|Neu anlegen|Ja/}).filter({visible: true}).first(); if (await c.count()) await c.click().catch(() => {}); }
  await p.waitForTimeout(3000);
  const st = await p.evaluate(() => ({eng: window.SYNQUENZER.getSound(0).engine, editor: window.SYNQUENZER.runtime().editor}));
  console.log(how.padEnd(10), 'engine before', isMk, 'after', JSON.stringify(st), 'new errors', errs.length - before, errs.slice(0, 2).join(' | ').slice(0, 300));
  await ctx.close();
}
await br.close();
