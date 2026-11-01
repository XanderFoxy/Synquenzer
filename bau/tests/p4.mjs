import { chromium } from 'playwright';
const b = await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/synquenzer/probe-interface/v4.html');
const big = p.locator('button.big'); console.log('Knöpfe', await big.count());
for (let i=0;i<await big.count();i++){ await big.nth(i).click(); await p.waitForTimeout(1200); }
await p.locator('.row button').nth(0).click(); await p.locator('.v').nth(1).locator('.row button').nth(1).click();
console.log((await p.locator('#log').textContent()).split('\n').slice(-12).join('\n')); console.log('Fehler', errs); await b.close();
