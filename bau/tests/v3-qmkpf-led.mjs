// MK-P fix: the cost of one LED change on the plate (no playback): N frames, each toggles one LED; TaskDuration per frame, CPU x THR, DPR 3
import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'P1';
const b = await launch(); const page = await open(b, F, {dpr: 3}); await openMk(page); await page.waitForTimeout(800);
const c = page.cdp; await c.send('Performance.enable');
const run = async (nm, prep, n = 120) => {
  await page.evaluate(prep); await page.waitForTimeout(300);
  await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
  const g = async () => { const {metrics} = await c.send('Performance.getMetrics'); return Object.fromEntries(metrics.map(m => [m.name, m.value])); };
  const a = await g();
  await page.evaluate(n => new Promise(r => { let k = 0; const f = () => { const L = window.__L; L.classList.toggle('on'); if (++k < n) requestAnimationFrame(f); else requestAnimationFrame(() => r()); }; requestAnimationFrame(f); }), n);
  const z = await g(); await c.send('Emulation.setCPUThrottlingRate', {rate: 1});
  console.log(nm.padEnd(26), 'task/frame', ((z.TaskDuration - a.TaskDuration) * 1000 / n).toFixed(2), 'ms  style', ((z.RecalcStyleDuration - a.RecalcStyleDuration) * 1000 / n).toFixed(2), 'layout', ((z.LayoutDuration - a.LayoutDuration) * 1000 / n).toFixed(2));
};
await run('nothing', () => { window.__L = document.createElement('i'); });
const V = (process.env.VARS || '').split(';;').filter(Boolean);
await run('head button', () => { window.__L = document.querySelector('.mkqh button') || document.querySelector('#synthSheet .sh-tabs .tab'); });
await run('plate LED s5', () => { window.__L = MKUI.PL.ui.led['s5']; });
await run('hull hidden, tab', () => { MKUI.P.el.hull.style.display = 'none'; window.__L = document.querySelector('.mkqh button') || document.querySelector('#synthSheet .sh-tabs .tab'); });
await run('hull back, no transforms', () => { MKUI.P.el.hull.style.display = ''; const s = document.createElement('style'); s.id = 'xx'; s.textContent = '.mkplate *{transform:none!important}'; document.head.appendChild(s); window.__L = MKUI.PL.ui.led['s5']; });
await run('+ no opacity/mask/svg', () => { document.getElementById('xx').textContent += '.mkplate *{opacity:1!important;-webkit-mask:none!important}.mkpln{display:none!important}'; window.__L = MKUI.PL.ui.led['s5']; });
await run('+ no pos text', () => { document.getElementById('xx').textContent += '.mkpt{display:none!important}'; window.__L = MKUI.PL.ui.led['s5']; });
await run('+ no knobs', () => { document.getElementById('xx').textContent += '.mkpk{display:none!important}'; window.__L = MKUI.PL.ui.led['s5']; });
await b.close();
