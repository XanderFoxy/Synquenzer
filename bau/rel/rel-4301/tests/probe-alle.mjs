// Probe: alle hohen Blätter in einer Größe – Schließen-Knopf sichtbar?
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import {setup} from './g6ph-lib.mjs';
const APP = process.argv[2], W = +(process.argv[3] || 428), H = +(process.argv[4] || 650), TAG = process.argv[5] || 'neu';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 1, permissions: ['microphone']});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
await p.evaluate(async () => { closePop(); ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
await setup(p, {bars: 8, at: [4]});
await p.evaluate(async () => { const Q = SYNQUENZER; await Q.g6pStyle({vox: 'V1'}, '80'); await Q.g6pWaitAll(null, null, {timeout: 60000}); });
const closers = () => p.evaluate(() => {
  const vis = x => { const r = x.getBoundingClientRect(); if (!r.width || !r.height) return false; const cs = getComputedStyle(x); if (cs.visibility === 'hidden' || cs.display === 'none') return false; return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) && x.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); };
  const c = [...document.querySelectorAll('button')].filter(x => /^(✕|OK|Schließen|Fertig)$/.test(x.textContent.trim()) && x.offsetParent && !x.closest('[hidden]') && !/l.schen/i.test(x.getAttribute('aria-label') || ''));
  return c.map(x => ({t: x.textContent.trim(), a: x.getAttribute('aria-label'), vis: vis(x), y: Math.round(x.getBoundingClientRect().top)}));
});
const cases = [
  ['chor', () => SYNQUENZER.g6Sheet({vox: 'V1'})],
  ['takes', () => SYNQUENZER.tkSheet({vox: 'V1'})],
  ['wellen', () => SYNQUENZER.wpOpen({vox: 'V1'})],
  ['noten', () => SYNQUENZER.g2Open({vox: 'V1'})],
  ['mikro', () => SYNQUENZER.stimmeSheet()],
  ['video', () => SYNQUENZER.vvOpen()],
];
for (const [n, f] of cases) {
  try { await p.evaluate(f); } catch (e) { console.log(n, 'FEHLER', String(e).slice(0, 200)); continue; }
  await p.waitForTimeout(600);
  console.log(n, JSON.stringify(await closers()), 'pop', await p.evaluate(() => UI.pop ? UI.pop.name + ' ' + JSON.stringify(UI.pop.el.getBoundingClientRect()) : null));
  await p.screenshot({path: 'out/alle-' + TAG + '-' + n + '-' + W + 'x' + H + '.png'});
  await p.evaluate(() => { closePop(); try { if (WP.ed) wpClose(); } catch (e) {} try { if (G2.ed) g2Close(); } catch (e) {} try { if (VV.open) vvClose(); } catch (e) {} });
  await p.waitForTimeout(300);
}
console.log('errs', errs.slice(0, 5));
await b.close();
