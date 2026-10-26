// cost of the hidden SCHRITTE loop after the editor is closed: main-thread script time (CDP metrics) and mkScope messages per s
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (let rep = 0; rep < 2; rep++) for (const steps of [false, true]) {
  const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
  await p.goto('file://' + S + 'mk-br-MK6/index.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1300);
  await p.evaluate(s => { const M = window.MKUI; M.setWahl(2, 10); if (s) M.viewOpen('schritte'); window.SYNQUENZER.launchScene(0); }, steps); await p.waitForTimeout(800);
  await p.evaluate(() => { window.SYNQUENZER.closeEditor(); }); await p.waitForTimeout(1000);
  await p.evaluate(() => { window.__msgs = 0; const E = AU.synth[0]; if (E && E.node) E.node.port.addEventListener('message', ev => { if (ev.data && ev.data.mkScope) window.__msgs++; }); });
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  await p.waitForTimeout(5000);
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  const msgs = await p.evaluate(() => window.__msgs);
  console.log('SCHRITTE opened before close:', steps, '| ScriptDuration ms/s', ((m1.ScriptDuration - m0.ScriptDuration) * 1000 / 5).toFixed(1), '| TaskDuration ms/s', ((m1.TaskDuration - m0.TaskDuration) * 1000 / 5).toFixed(1), '| mkScope msgs/s', (msgs / 5).toFixed(1), errs.length ? errs : '');
  await ctx.close();
}
await br.close();
