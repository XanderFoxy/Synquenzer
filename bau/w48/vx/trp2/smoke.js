const {chromium} = require('playwright');
(async () => {
  const br = await chromium.launch();
  const out = {};
  for (const [w, h] of [[428, 926], [926, 428]]) {
    const pg = await (await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2})).newPage(), errs = [];
    pg.on('pageerror', e => errs.push('pageerror ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/abspann-logo|Failed to load resource/.test(m.text())) errs.push('console.error ' + m.text()); });
    await pg.goto('http://127.0.0.1:' + process.argv[2] + '/' + process.argv[3] + '/index.html', {waitUntil: 'load'}); await pg.waitForTimeout(2500);
    out[w + 'x' + h] = {errs, trp2: await pg.evaluate(() => typeof trp2Tick + '/' + typeof trp2NoteFor + '/' + typeof trp2Re)};
  }
  console.log(JSON.stringify(out)); await br.close();
})();
