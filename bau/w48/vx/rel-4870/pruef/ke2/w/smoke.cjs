// Seite laden (428x926 hochkant, Touch) ohne Fehler + echte Erkennung im Worker der App auf einem App-Ton. node smoke.cjs <port>
const {chromium} = require('/opt/node-tools/node_modules/playwright'); (async () => { const b = await chromium.launch(); const errs = [];
const c = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}); const p = await c.newPage();
p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/abspann-logo|404/.test(m.text())) errs.push('console ' + m.text()); });
await p.goto('http://localhost:' + process.argv[2] + '/index.html', {waitUntil: 'load'}); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000}); await p.waitForTimeout(2500);
const r = await p.evaluate(async () => { const v = SYNQUENZER.version; SYNQUENZER.ke1.load();
  const C = new Function(document.getElementById('sq-ke1-src').textContent.split('const KE1X')[0] + ';return ke1CoreFn;')()(null, null);
  const s = SQStore.normalizeSound(factorySound(INIT_IDS.mk)); s.p.mk = C.mkMerge(s.p.mk, {note: 45, hold: 1, o1w: 1, c1: 0, o2: 0, cut: 40, res: 30, eg: 40, e1a: 0, e1d: 50, e1s: 10, e2a: 0, e2d: 64, e2s: 110, e2r: 30});
  const y = await SYNQUENZER.mkRender(s, [[.2, 'on', 45, .8], [1.2, 'off', 45]], {sec: 1.8, sr: 48000, seed: 7}); let pk = 0; for (const q of y.l) pk = Math.max(pk, Math.abs(q));
  SYNQUENZER.ke1.open({pcm: Int16Array.from(y.l, q => Math.round(q * .4 * 32767 / pk)), sr: 48000, name: 'Probe'}); const t0 = performance.now();
  while ((SYNQUENZER.ke1.state().busy || (!SYNQUENZER.ke1.state().res && !SYNQUENZER.ke1.state().err)) && performance.now() - t0 < 60000) await new Promise(r => setTimeout(r, 150));
  const st = SYNQUENZER.ke1.state(); const out = {v, err: st.err, welle: st.res && st.res.eng.mk.p.o1w, rows: st.res ? SYNQUENZER.ke1.rows('mk').map(x => x.k + ':' + x.w).join(' ') : null}; SYNQUENZER.ke1.close(); return out; });
console.log(JSON.stringify(r)); console.log('errors', JSON.stringify(errs)); await b.close(); process.exit(0); })();
