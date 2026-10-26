// The ⋯ sheet of the synth editor (MS 2000: + 3 timbre tools; VA unchanged) in 6 formats: inside the screen, reachable, no overlap, ≥ 44 px
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'synq-snapshots/MK2.html', APP = S + 'mk-br-MK3/index.html', OUT = S + 'dirigent-test/v3-qa-mk3reg/';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const eng of ['analog', 'mk']) for (const [id, w, h] of VPS) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: id !== 'W', isMobile: id !== 'W', deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(async eng => { const Q = window.SYNQUENZER; Q.setEngine(0, eng); await new Promise(r => setTimeout(r, 500)); Q.selectTrack(0); Q.openEditor(); }, eng); await p.waitForTimeout(700);
  const bx = await p.evaluate(() => { const e = [...document.querySelectorAll('#synthSheet .edm')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  if (!bx) { console.log(name, eng, id, 'no ⋯'); await ctx.close(); continue; }
  if (id === 'W') await p.mouse.click(bx.x, bx.y); else await p.touchscreen.tap(bx.x, bx.y); await p.waitForTimeout(500);
  const m = await p.evaluate(() => { const pop = [...document.querySelectorAll('.pop')].find(x => x.getBoundingClientRect().width > 0); if (!pop) return {pop: null};
    const W = innerWidth, H = innerHeight, pr = pop.getBoundingClientRect(); const bs = [...pop.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0);
    const out = {pop: [pr.left, pr.top, pr.width, pr.height].map(Math.round), scroll: pop.scrollHeight > pop.clientHeight + 1 ? pop.scrollHeight + '>' + pop.clientHeight : '', n: bs.length, labels: bs.map(b => (b.querySelector('b') || b).textContent.trim().slice(0, 18)).join(' | '), issues: []};
    if (pr.left < -1 || pr.top < -1 || pr.right > W + 1 || pr.bottom > H + 1) out.issues.push('pop außen');
    for (const b of bs) { const r = b.getBoundingClientRect(); const lab = (b.querySelector('b') || b).textContent.trim().slice(0, 14);
      if (r.height < 43.5) out.issues.push('klein ' + lab + ' ' + Math.round(r.height));
      if (r.bottom > H + 1 && !(pop.scrollHeight > pop.clientHeight + 1)) out.issues.push('unerreichbar ' + lab);
      for (const e of b.querySelectorAll('b, small')) if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).textOverflow !== 'ellipsis') out.issues.push('abgeschnitten ' + e.textContent.trim().slice(0, 16)); }
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i].getBoundingClientRect(), c = bs[j].getBoundingClientRect(); if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 1 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 1) out.issues.push('überlappt ' + i + '/' + j); }
    return out; });
  if (name === 'new' && eng === 'mk') await p.screenshot({path: OUT + 'edm-' + id + '.png'});
  console.log(name, eng, id, JSON.stringify(m), errs.length ? 'ERR ' + JSON.stringify(errs) : '');
  await ctx.close();
}
await br.close();
