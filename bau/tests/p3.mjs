import { chromium } from 'playwright';
const b = await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/synquenzer/probe-interface/v3.html');
const go = p.locator('button.go');
console.log('Varianten', await go.count());
for (let i=0;i<await go.count();i++){ await go.nth(i).click(); await p.waitForTimeout(900); }
await p.locator('.v').nth(2).locator('button.ex').click(); await p.waitForTimeout(300);
await p.locator('.row button').first().click();
console.log((await p.locator('#log').textContent()).split('\n').slice(-14).join('\n'));
console.log('Fehler', errs);
await b.close();
