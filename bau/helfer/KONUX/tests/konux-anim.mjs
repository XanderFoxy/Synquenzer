// KONUX: Rückmeldung — Animation ≤ 250 ms (nur transform/opacity), Haptik-Tick, keine Aufgabe > 50 ms (Long Tasks) vom Tipp auf den
// Hauptknopf bis zum Ende der Animation; je Weg (Teil, Block, Zurückholen). Mit 4-facher CPU-Bremse zusätzlich gemessen (Info)
import { open, buildSong, tapSel, selRange, markTap } from './lib.mjs';
const out = [], ok = (n, c, x) => { const r = {test: 'animation', fall: n, ok: !!c, ...(x ? {info: x} : {})}; out.push(r); console.log(JSON.stringify(r)); };
for (const slow of [1, 4]) {
  const {p, ctx, errs, close} = await open({w: 428, h: 926});
  await buildSong(p);
  if (slow > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', {rate: slow}); }
  await p.evaluate(() => {
    window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']});
    window.__hap = []; const h = haptic; haptic = k => { window.__hap.push(k); return h(k); };
    window.__fx = []; new MutationObserver(ms => { for (const m of ms) for (const x of m.addedNodes) if (x.classList && x.classList.contains('kx-fx')) { const a = x.getAnimations(); window.__fx.push({cls: x.className, dur: a.map(y => y.effect.getTiming().duration), props: a.flatMap(y => y.effect.getKeyframes().flatMap(k => Object.keys(k).filter(z => !['offset', 'easing', 'composite', 'computedOffset'].includes(z))))}); } }).observe(document.body, {childList: true});
  });
  const run = async (name, setup) => {
    await setup(); await p.waitForTimeout(300);
    await p.evaluate(() => { window.__lt = []; window.__hap = []; window.__fx = []; window.__t0 = performance.now(); });
    await tapSel(p, '.pop .kx-go', 450);
    const r = await p.evaluate(() => ({lt: window.__lt.filter(e => e.t >= window.__t0 - 5), hap: window.__hap, fx: window.__fx, left: document.querySelectorAll('.kx-fx').length}));
    const max = Math.max(0, ...r.lt.map(e => e.d)), dur = Math.max(0, ...r.fx.flatMap(f => f.dur)), props = [...new Set(r.fx.flatMap(f => f.props))];
    const pass = slow > 1 ? true : r.fx.length > 0 && dur <= 250 && props.every(x => x === 'transform' || x === 'opacity') && r.hap.includes('snap') && max <= 50 && r.left === 0;
    ok(`${name}${slow > 1 ? ' (CPU ×4, nur Info)' : ''}`, pass, {laengsteAufgabeMs: Math.round(max), animMs: dur, eigenschaften: props, haptik: r.hap, reste: r.left});
    await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); svButtons(); SV.x = 0; UI.dirty.song = true; }); await p.waitForTimeout(250);
  };
  await run('Zu einem Teil (Kachel fliegt)', async () => { await selRange(p, 2, 5); await tapSel(p, '#rangeBar button[data-a="more"]', 450); await tapSel(p, '.pop button[data-a="konux"]', 450); });
  await run('Als Block (Rahmen rastet ein)', async () => { await selRange(p, 6, 9); await tapSel(p, '#rangeBar button[data-a="more"]', 450); await tapSel(p, '.pop button[data-a="konux"]', 450); await tapSel(p, '.pop .kx-c[data-k="blk"]'); });
  await run('Zurückholen (Rahmen)', async () => { await markTap(p, '^STR'); await tapSel(p, '.pop button[data-kon="back"]', 450); });
  if (errs.length) ok('Konsole', false, errs);
  await close();
}
process.exitCode = out.every(r => r.ok) ? 0 : 1;
