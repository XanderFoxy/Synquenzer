import {open, sleep, check, done} from './v3-qa-gmk1-tl.mjs';
const out = [];
for (const vp of [{width: 375, height: 667}, {width: 320, height: 568}, {width: 667, height: 375}, {width: 844, height: 390}, {width: 390, height: 844}]) {
  const T = await open({file: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html', viewport: vp}); const {E} = T;
  await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); window.__nb = 0; const b = MKUI.build; MKUI.build = function () { window.__nb++; return b.apply(this, arguments); }; window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await E(() => SYNQUENZER.openEditor()); await sleep(900);
  const r = await E(() => { const pg = document.querySelector('#synthSheet .mkpg'), rr = pg.getBoundingClientRect(), i = SYNQUENZER.mkPanel(); return {nb: window.__nb, lt: window.__lt, fmt: i.fmt, half: i.half, tab: document.querySelector('#synthSheet .sh-bar .tab.on, #synthSheet .sh-bar .tab[aria-selected=true]') && document.querySelector('#synthSheet .sh-bar .tab.on, #synthSheet .sh-bar .tab[aria-selected=true]').textContent, now: [Math.round(rr.width), Math.round(rr.height)], built: pg._mkSz.map(Math.round)}; });
  await E(() => SYNQUENZER.closeEditor()); await sleep(400);
  const c = await E(() => !document.getElementById('synthSheet').classList.contains('open'));
  check(vp.width + 'x' + vp.height + ' open: ≤ 2 builds (1 unless the frame changes), built for the final size, closes', r.nb <= 2 && !r.lt.some(d => d > 50) && Math.abs(r.now[1] - r.built[1]) <= 2 && c, r);
  await T.br.close();
}
done();
