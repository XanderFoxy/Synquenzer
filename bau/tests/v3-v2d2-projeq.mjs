import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const out = [];
for (const u of [S + 'synq-snapshots/V2c′-fix.html', S + 'dirigent-wt/index.html']) {
  const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'}); const pg = await br.newPage();
  await pg.goto('file://' + u); await pg.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  out.push(await pg.evaluate(() => { const j = SYNQUENZER.project(); delete j.appVersion; delete j.saved; return JSON.stringify(j, (k, v) => (k === 'id' || k === 'uid' ? undefined : v)); }));
  await br.close();
}
console.log(out[0] === out[1] ? 'SAME' : 'DIFF', out[0].length, out[1].length);
if (out[0] !== out[1]) { let i = 0; while (out[0][i] === out[1][i]) i++; console.log(out[0].slice(i - 80, i + 80)); console.log(out[1].slice(i - 80, i + 80)); }
