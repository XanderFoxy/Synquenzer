const { chromium } = require('playwright');
(async () => {
  const port = process.argv[2];
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true });
  const log = []; p.on('console', m => log.push(m.type() + ': ' + m.text())); p.on('pageerror', e => log.push('pageerror: ' + e.message));
  await p.goto('http://127.0.0.1:' + port + '/werkzeug/ton/test.html');
  await p.waitForFunction(() => window.ERG, null, { timeout: 30000 });
  console.log(JSON.stringify(await p.evaluate(() => window.ERG), null, 1));
  if (log.length) console.log(log.join('\n'));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
