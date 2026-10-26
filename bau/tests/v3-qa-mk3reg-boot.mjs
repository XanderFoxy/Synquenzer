import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const F = {base: S + 'synq-snapshots/MK2.html', new: S + 'mk-br-MK3/index.html'};
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const t = {base: [], new: []}, mk = {base: [], new: []};
for (let i = 0; i < 6; i++) for (const k of (i % 2 ? ['base', 'new'] : ['new', 'base'])) {
  const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage();
  await p.goto('file://' + F[k]); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000, polling: 5});
  const ms = await p.evaluate(() => performance.now()); if (i) t[k].push(ms);
  const m2 = await p.evaluate(async () => { const t0 = performance.now(); window.SYNQUENZER.setEngine(0, 'mk'); window.SYNQUENZER.selectTrack(0); window.SYNQUENZER.openEditor(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return performance.now() - t0; });
  if (i) mk[k].push(m2);
  await ctx.close(); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log('boot ms median base', med(t.base).toFixed(0), 'new', med(t.new).toFixed(0), JSON.stringify(t));
console.log('MS 2000 editor open ms median base', med(mk.base).toFixed(0), 'new', med(mk.new).toFixed(0));
await br.close();
