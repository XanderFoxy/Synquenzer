import { chromium } from 'playwright';
const F = {base: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html', new: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html'};
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const out = {base: [], new: []};
for (let i = 0; i < 4; i++) for (const k of ['base', 'new']) { const p = await br.newPage({viewport: {width: 390, height: 844}}); const t0 = Date.now(); await p.goto('file://' + F[k]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime && window.SYNQUENZER.storage().booted, null, {polling: 5}); out[k].push(Date.now() - t0); await p.close(); }
console.log(JSON.stringify(out)); await br.close();
