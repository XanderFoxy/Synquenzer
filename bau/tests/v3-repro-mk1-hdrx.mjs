import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const files = {'4.8.1': SP + '/synq-snapshots/MK0-fix.html', '4.9.0': SP + '/mk-wt/index.html'};
const measure = () => { const hd = document.querySelector('#synthSheet .sh-head'); if (!hd) return null; const hr = hd.getBoundingClientRect();
  const q = s => { const e = hd.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), vis: !e.hidden && r.width > 0}; };
  const urs = [...hd.querySelectorAll('.hb.ur')].map(e => { const r = e.getBoundingClientRect(); return Math.round(r.right); });
  const x = hd.querySelector('.sh-x'), xr = x.getBoundingClientRect();
  const hit = document.elementFromPoint(Math.min(xr.left + xr.width / 2, innerWidth - 1), xr.top + xr.height / 2);
  return {vw: innerWidth, head: [Math.round(hr.left), Math.round(hr.right)], sw: hd.scrollWidth, cw: hd.clientWidth, x: q('.sh-x'), urRights: urs, pv: q('.preset .pv'), ab: q('.preset ~ *') && null,
    abHidden: ED.hdr && ED.hdr.ab.hidden, edited: !!hd.querySelector('.chg'), mk2z: !!hd.querySelector('.mk2z'), mkht: hd.classList.contains('mkht'), hitIsX: !!(hit && (hit === x || x.contains(hit))), hitCls: hit ? hit.className : null}; };
for (const [w, h, sa, tag] of [[844, 390, true, 'L1+SA'], [667, 375, false, 'L2'], [812, 375, true, '812+SA'], [844, 390, false, 'L1 noSA']]) for (const ver of ['4.8.1', '4.9.0']) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + files[ver]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  if (sa) await page.addStyleTag({content: SA});
  const info = await page.evaluate(() => ({ver: SYNQUENZER.version ? SYNQUENZER.version : (typeof VERSION !== 'undefined' ? VERSION : '?'), eng: S.tracks[0].sound.engine, name: S.tracks[0].sound.name}));
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(500);
  const before = await page.evaluate(measure);
  // real touch drag on the first visible knob in the sheet body
  const kb = await page.evaluate(() => { const k = [...document.querySelectorAll('#synthSheet .sh-body .knob, #synthSheet .knob')].find(e => { const r = e.getBoundingClientRect(); return r.width > 10 && r.top > 0 && r.bottom < innerHeight; }); if (!k) return null; const r = k.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, k.className]; });
  let how = 'none';
  if (kb) { const cdp = await ctx.newCDPSession(page);
    const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
    await tp('touchStart', kb[0], kb[1]); for (let d = 4; d <= 60; d += 4) { await tp('touchMove', kb[0], kb[1] - d); await page.waitForTimeout(16); } await tp('touchEnd'); how = 'touch drag on ' + kb[2]; }
  await page.waitForTimeout(400);
  let after = await page.evaluate(measure);
  if (!after.edited) { await page.evaluate(() => SYNQUENZER.setParam(0, 'cutoff', 500)); await page.waitForTimeout(400); after = await page.evaluate(measure); how += ' + setParam fallback'; }
  await page.screenshot({path: `${SP}/dirigent-test/v3-repro-hdrx-${tag.replace(/[^A-Za-z0-9]/g, '')}-${ver}.png`, clip: {x: 0, y: 30, width: w, height: 70}});
  // tap where ✕ is (clamped into the viewport)
  const xc = [Math.min(after.x.l + after.x.w / 2, w - 2), 0];
  const xy = await page.evaluate(() => { const r = document.querySelector('#synthSheet .sh-x').getBoundingClientRect(); return r.top + r.height / 2; });
  await page.touchscreen.tap(xc[0], xy); await page.waitForTimeout(500);
  const ed = await page.evaluate(() => R.editor);
  console.log(`\n[${tag} ${w}x${h}] ${ver} (app ${info.ver}, track0 ${info.eng} '${info.name}') edit via: ${how}`);
  console.log('  before edit:', JSON.stringify({head: before.head, x: before.x, ur: before.urRights, pv: before.pv && before.pv.w, sw: before.sw, cw: before.cw, mk2z: before.mk2z, mkht: before.mkht, hitIsX: before.hitIsX}));
  console.log('  after edit :', JSON.stringify({head: after.head, x: after.x, ur: after.urRights, pv: after.pv && after.pv.w, sw: after.sw, cw: after.cw, abHidden: after.abHidden, edited: after.edited, mk2z: after.mk2z, mkht: after.mkht, hitIsX: after.hitIsX, hitCls: after.hitCls}));
  console.log('  tap at ✕ position x=' + Math.round(xc[0]) + ' -> R.editor =', ed, errs.length ? 'ERRORS ' + errs.join(' | ') : '');
  await ctx.close();
}
await browser.close();
