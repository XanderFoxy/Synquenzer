// autosave -> page reload -> same project (base vs new), with FM/WT/VA sounds and edited params; no lock banner
import { chromium } from 'playwright';
import { APP, BASE } from './v3-qareg-mk1-pw.mjs';
for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 20000});
  const before = await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setEngine(1, 'wt'); Q.setEngine(2, 'fm'); Q.setBpm(97);
    Q.setClip(0, 2, {len: 1, key: {root: 2, scale: 'dorian'}, notes: [{t: 0, d: 1, n: 50, v: .7}, {t: 2, d: .5, n: 57, v: .9}]});
    await Q.save(); await new Promise(r => setTimeout(r, 1500)); const P = Q.project(); return JSON.stringify({bpm: P.bpm, tracks: P.tracks.map(t => ({s: t.sound, c: t.clips}))}); });
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 20000}); await p.waitForTimeout(1000);
  const after = await p.evaluate(() => { const P = window.SYNQUENZER.project(); return JSON.stringify({bpm: P.bpm, tracks: P.tracks.map(t => ({s: t.sound, c: t.clips}))}); });
  const nv = await p.evaluate(() => { const Q = window.SYNQUENZER; return {nv: Q.nvState ? Q.nvState() : null, ban: !!(document.getElementById('nvBan') && document.getElementById('nvBan').offsetParent), fmt: Q.project().format}; });
  console.log(n, 'reload deep-equal', before === after, 'len', before.length, after.length, JSON.stringify(nv), 'errs', JSON.stringify(errs));
  if (before !== after) { let i = 0; while (before[i] === after[i]) i++; console.log('  first diff at', i, before.slice(i - 80, i + 80), '\n  vs', after.slice(i - 80, i + 80)); }
  await b.close();
}
