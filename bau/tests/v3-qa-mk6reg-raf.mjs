// after closing the editor with SCHRITTE open: does the 30 Hz steps loop / worklet scope keep running in the background?
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const steps of [false, true]) {
  const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(() => { const o = window.requestAnimationFrame.bind(window); window.__raf = {}; window.requestAnimationFrame = cb => { const k = (cb.name || 'anon') + ':' + String(cb).slice(0, 60); window.__raf[k] = (window.__raf[k] || 0) + 1; return o(cb); }; });
  await p.goto('file://' + S + 'mk-br-MK6/index.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1300);
  await p.evaluate(s => { const M = window.MKUI; M.setWahl(2, 10); if (s) M.viewOpen('schritte'); window.SYNQUENZER.launchScene(0); }, steps); await p.waitForTimeout(800);
  // close the editor through its UI close button (or API)
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeEditor ? Q.closeEditor() : null; }); await p.waitForTimeout(800);
  const st = await p.evaluate(() => { const cv = document.querySelector('canvas.mksq, .mksq canvas, .mkx.mksq'); const E = AU.synth[0]; return {editor: window.SYNQUENZER.runtime().editor, cvConnected: !!(cv && cv.isConnected), cvVisible: !!(cv && cv.offsetParent), mksOn: E && E.mksOn}; });
  await p.evaluate(() => { window.__raf = {}; }); await p.waitForTimeout(2000);
  const raf = await p.evaluate(() => Object.entries(window.__raf).filter(([k, n]) => n > 20).map(([k, n]) => n + 'x ' + k.slice(0, 70)));
  console.log('SCHRITTE opened:', steps, JSON.stringify(st), '| rAF callbacks in 2 s after close:', JSON.stringify(raf), errs);
  await ctx.close();
}
await br.close();
