const {chromium} = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:' + process.argv[2] + '/alt/index.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000});
console.log(await p.evaluate(() => { const s = factorySound(INIT_IDS.analog); return JSON.stringify(s.p).slice(0, 1500); }));
await b.close(); })();
