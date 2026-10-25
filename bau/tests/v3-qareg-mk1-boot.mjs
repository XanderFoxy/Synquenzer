import { chromium } from 'playwright';
import { APP, BASE } from './v3-qareg-mk1-pw.mjs';
const F = {base: BASE, new: APP};
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const out = {base: [], new: []}, lt = {base: [], new: []};
for (let i = 0; i < +(process.argv[2] || 7); i++) for (const k of ['base', 'new']) { const p = await br.newPage({viewport: {width: 390, height: 844}}); await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({type: 'longtask', buffered: true}); } catch (e) {} }); const t0 = Date.now(); await p.goto('file://' + F[k]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime && window.SYNQUENZER.storage().booted, null, {polling: 5}); out[k].push(Date.now() - t0); await p.waitForTimeout(300); lt[k].push(await p.evaluate(() => Math.max(0, ...window.__lt))); await p.close(); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log(JSON.stringify(out), 'median base', med(out.base), 'new', med(out.new), 'maxLongtask', JSON.stringify(lt)); await br.close();
