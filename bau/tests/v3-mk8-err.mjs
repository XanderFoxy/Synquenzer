import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'}); const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e.stack || e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(3000); console.log(errs.join('\n').slice(0, 3000)); await b.close();
