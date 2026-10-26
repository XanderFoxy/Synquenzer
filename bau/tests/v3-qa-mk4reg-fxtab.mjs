// QA regression MK4: the track-FX tab (Reiter FX) of an MS 2000 track and of a VA track, base 4.10.0 vs MK4, P1 / L1 / P3 / L2
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'synq-snapshots/MK2.html', APP = S + 'mk-br-MK4/index.html', OUT = S + 'dirigent-test/v3-qa-mk4reg/';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [id, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]]) for (const eng of ['mk', 'analog']) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await p.waitForTimeout(300);
  await p.evaluate(async eng => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, eng); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 800)); }, eng);
  const tab = p.locator('#synthSheet button', {hasText: /^FX$/}).filter({visible: true}).first();
  let clicked = false; try { await tab.tap({timeout: 2000}); clicked = true; } catch (e) {}
  await p.waitForTimeout(500);
  const m = await p.evaluate(() => { const out = []; for (const e of document.querySelectorAll('#synthSheet button, #synthSheet input, #synthSheet .knob, #synthSheet [role=slider]')) { const r = e.getBoundingClientRect(); if (r.width < 2 || !e.offsetParent) continue; out.push([(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 14), Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]); } return {n: out.length, els: out, docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight}; });
  await p.screenshot({path: `${OUT}fxtab-${name}-${id}-${eng}.png`});
  res[name + id + eng] = {clicked, m, errs};
  await ctx.close();
}
for (const id of ['P1', 'P3', 'L1', 'L2']) for (const eng of ['mk', 'analog']) { const A = res['base' + id + eng], B = res['new' + id + eng];
  const same = JSON.stringify(A.m.els) === JSON.stringify(B.m.els);
  console.log(id, eng, 'clicked', B.clicked, 'n', A.m.n, B.m.n, same ? 'SAME' : 'DIFF', 'doc', B.m.docW, B.m.docH, 'errs', JSON.stringify(B.errs));
  if (!same) { const a = A.m.els.map(x => JSON.stringify(x)), b = B.m.els.map(x => JSON.stringify(x)); console.log('  base-only', a.filter(x => !b.includes(x)).slice(0, 6)); console.log('  new-only', b.filter(x => !a.includes(x)).slice(0, 6)); } }
await br.close();
