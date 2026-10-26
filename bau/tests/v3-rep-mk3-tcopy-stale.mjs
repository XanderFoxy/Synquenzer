// Independent repro: ⋯ → Timbre kopieren on track 1 when the editor opened on FX (stale MKUI.P.i). Real taps for UI navigation.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const tapAt = async (fn, arg) => { const p = await page.evaluate(fn, arg); if (!p) return false; await page.touchscreen.tap(p[0], p[1]); await page.waitForTimeout(400); return true; };
  const ctr = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.x + r.width / 2, r.y + r.height / 2] : null; };
  const tapTh = t => tapAt(t => { const e = document.querySelector('.th[data-t="' + t + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.x + r.width / 2, r.y + r.height / 2] : null; }, t);
  const tapBtn = txt => tapAt(txt => { const b = [...document.querySelectorAll('#synthSheet button')].find(x => x.offsetParent && x.textContent.trim() === txt); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, txt);
  const tapId = id => tapAt(id => { const b = document.getElementById(id); if (!b || !b.offsetParent) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, id);
  // state setup (as if the user had already edited and saved): both tracks MS 2000, a saved sound 'Quelle A' with T1 CUTOFF 50, track 0 now at 127
  await page.evaluate(async () => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.mkSet(0, 't.0.f.cut', 50); await SYNQUENZER.saveSound(0, 'Quelle A', 'new'); SYNQUENZER.mkSet(0, 't.0.f.cut', 127); SYNQUENZER.mkSet(1, 't.0.f.cut', 90); });
  await page.waitForTimeout(300);
  const log = [];
  log.push('th0 ' + await tapTh(0)); log.push('th0 again ' + await tapTh(0));
  log.push('editor ' + await page.evaluate(() => R.editor + ' sel ' + R.selT + ' Pi ' + MKUI.P.i + ' panel ' + !!document.querySelector('#synthSheet .mkx[data-k="timbre"]')));
  log.push('FX ' + await tapBtn('FX'));
  log.push('✕ ' + await tapAt(() => { const b = [...document.querySelectorAll('#synthSheet button.sh-x')].find(x => x.offsetParent); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
  log.push('after close editor=' + await page.evaluate(() => R.editor));
  log.push('th1 ' + await tapTh(1)); log.push('th1 again ' + await tapTh(1));
  log.push('editor ' + await page.evaluate(() => R.editor + ' sel ' + R.selT + ' Pi ' + MKUI.P.i + ' panel ' + !!document.querySelector('#synthSheet .mkx[data-k="timbre"]') + ' name1 ' + S.tracks[1].sound.name + ' name0 ' + S.tracks[0].sound.name));
  const more = await tapAt(() => { const b = [...document.querySelectorAll('#synthSheet button')].find(x => x.offsetParent && (x.textContent.trim() === '⋯' || x.getAttribute('aria-label') === 'Mehr')); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  log.push('more ' + more + ' ' + await page.evaluate(() => [...document.querySelectorAll('.pop button[data-a]')].map(b => b.dataset.a).join(',')));
  const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  const c0 = await page.evaluate(() => [SYNQUENZER.mkGet(0).t[0].f.cut, SYNQUENZER.mkGet(1).t[0].f.cut]);
  log.push('tcopy ' + await tapAt(() => { const b = document.querySelector('.pop button[data-a="tcopy"]'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
  log.push('rows ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.pop .mkcp .mkcr b')].map(b => b.textContent))) + ' hdr ' + await page.evaluate(() => (document.querySelector('.pop h4') || {}).textContent));
  log.push('pick ' + await tapAt(() => { const r = [...document.querySelectorAll('.pop .mkcp .mkcr')].find(x => /Quelle A/.test(x.textContent) && !/dieser Sound/.test(x.textContent)); const b = r && r.querySelectorAll('button')[0]; if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }));
  const c1 = await page.evaluate(() => [SYNQUENZER.mkGet(0).t[0].f.cut, SYNQUENZER.mkGet(1).t[0].f.cut]);
  const ui = await page.evaluate(() => SYNQUENZER.undoInfo());
  log.push('CUT T1 track0/track1 before ' + c0.join('/') + ' after ' + c1.join('/') + ' | undo n ' + u0 + '->' + ui.n + ' top ' + JSON.stringify(ui.top));
  log.push('LCD ' + await page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '')).then(s => s.slice(0, 90)));
  // ⋯ → Timbre neu on track 1 (same stale P.i?)
  await tapAt(() => { const b = [...document.querySelectorAll('#synthSheet button')].find(x => x.offsetParent && (x.textContent.trim() === '⋯' || x.getAttribute('aria-label') === 'Mehr')); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await tapAt(() => { const b = document.querySelector('.pop button[data-a="tinit"]'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const c2 = await page.evaluate(() => [SYNQUENZER.mkGet(0).t[0].f.cut, SYNQUENZER.mkGet(1).t[0].f.cut]);
  log.push('after Timbre neu: CUT T1 track0/track1 ' + c2.join('/'));
  console.log(lab + ': ' + log.join(' | ') + ' | errs ' + errs.length + ' ' + errs.join(' ').slice(0, 200));
  await ctx.close();
}
await browser.close();
