// Rauchtest 4.85.0: node rauch.js <port>
const {chromium} = require('playwright');
const port = process.argv[2] || '8840', URL = 'http://127.0.0.1:' + port + '/index.html', DIR = __dirname;
const res = {}, errs = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console.error ' + m.text()); });
  pg.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()); });
  const t0 = Date.now();
  await pg.goto(URL, {waitUntil: 'load'});
  await pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length && typeof openEditor === 'function', null, {timeout: 60000});
  res.bereitMs = Date.now() - t0;
  await sleep(1500);
  const tapSel = async sel => { const b = await pg.evaluate(s => { const x = document.querySelector(s); if (!x) return null; const r = x.getBoundingClientRect(); if (!r.width) return null; return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel); if (!b) return false; await pg.touchscreen.tap(b.x, b.y); return true; };
  // Play / Stop
  res.play = await tapSel('#bPlay'); await sleep(800);
  res.laeuft = await pg.evaluate(() => !!(typeof R !== 'undefined' && (R.playing || (typeof AU !== 'undefined' && AU.playing))) || document.querySelector('#bPlay').classList.contains('on') || document.body.className);
  res.stop = await tapSel('#bPlay'); await sleep(600);
  res.nachStop = await pg.evaluate(() => !!(typeof R !== 'undefined' && R.playing));
  // Menü
  res.menu = await tapSel('#bMenu'); await sleep(600);
  res.menuOffen = await pg.evaluate(() => { const m = document.querySelector('#menu'); return !!m && getComputedStyle(m).display !== 'none' && m.getBoundingClientRect().height > 0; });
  res.version = await pg.evaluate(() => { const v = document.querySelector('.mver'); return v ? v.textContent : null; });
  res.VERSION = await pg.evaluate(() => VERSION);
  await pg.screenshot({path: DIR + '/rauch-menu.png'});
  await pg.keyboard.press('Escape'); await sleep(300);
  await pg.evaluate(() => { try { if (typeof closeMenu === 'function') closeMenu(); } catch (e) {} });
  await sleep(300);
  // Klang-Editor einer Synth-Spur
  res.synthT = await pg.evaluate(() => { const t = S.tracks.findIndex(x => x.kind === 'synth'); if (t >= 0) selectTrack(t); return t; });
  await sleep(300);
  res.klangTap = await tapSel('#bKlang'); await sleep(800);
  res.editor = await pg.evaluate(() => ({ed: R.editor, offen: !!document.querySelector('#synthSheet.open'), sel: R.selT}));
  if (!res.editor.offen) { await pg.evaluate(() => openEditor()); await sleep(600); res.editorFallback = await pg.evaluate(() => ({ed: R.editor, offen: !!document.querySelector('#synthSheet.open')})); }
  await pg.screenshot({path: DIR + '/rauch-klang.png'});
  res.errs = errs;
  await br.close();
  console.log(JSON.stringify(res, null, 1));
})().catch(e => { console.log('FEHLER', e && e.stack || e, JSON.stringify(res), errs); process.exit(1); });
