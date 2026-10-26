// QA MK7 regression: the E1/E2 LED strip (Zone Z6, spec: "keine Trefferfläche") — size, class, does a tap act?
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) for (const [name, file] of [['base', S + 'mk6-base-4.12.0.html'], ['new', S + 'mk-br-MK7/index.html']]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(() => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1200);
  const info = await p.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="ein"]'); const r = e.getBoundingClientRect(); const lcd = document.querySelector('#synthSheet .mkx.mdisp, #synthSheet [class*=lcd]'); return {cls: e.className, w: Math.round(r.width), h: Math.round(r.height), x: r.x + r.width / 2, y: r.y + r.height / 2, lcd: (lcd || {}).textContent}; });
  const before = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .lcd, #synthSheet .mklcd, #synthSheet [class*=lcd]')].map(e => e.textContent.trim()).join(' | ').slice(0, 160));
  await p.touchscreen.tap(info.x, info.y); await p.waitForTimeout(300);
  const after = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .lcd, #synthSheet .mklcd, #synthSheet [class*=lcd]')].map(e => e.textContent.trim()).join(' | ').slice(0, 160));
  const at = await p.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t && (t.dataset.k || t.className); }, [info.x, info.y]);
  console.log(vp, name, 'cls', info.cls, info.w + 'x' + info.h, 'top', at, '\n   before:', before, '\n   after: ', after, errs.length ? JSON.stringify(errs) : '');
  await ctx.close();
}
await br.close();
