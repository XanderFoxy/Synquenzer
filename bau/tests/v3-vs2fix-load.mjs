import { chromium } from 'playwright';
import { EXE } from './v3-vs2-h.mjs';
const br = await chromium.launch({executablePath: EXE});
const p = await (await br.newContext()).newPage();
p.on('pageerror', e => console.log('PAGEERR', String(e).slice(0, 400))); p.on('console', m => console.log('CON', m.type(), m.text().slice(0, 300)));
await p.goto('file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html');
await p.waitForTimeout(3000); console.log(await p.evaluate(() => !!window.SYNQUENZER)); await br.close();
