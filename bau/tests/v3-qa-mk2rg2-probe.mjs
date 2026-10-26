import { open, APP } from './v3-mk0reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base-A.html';
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const vp of [{width: 390, height: 844}, {width: 844, height: 390}]) {
  const {b, p, errs} = await open(vp, file);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setEngine(0, 'mk'); await sl(200); const nm = Q.getSound(0).name;
    Q.openMenu(); await sl(400);
    const btn = [...document.querySelectorAll('#menu button')].find(x => /Leistungs-Probe/.test(x.textContent)); if (!btn) return {nm, err: 'no button'};
    btn.click(); await sl(600);
    const sheet = [...document.querySelectorAll('.pop, .sheet, [class*=probe]')].filter(e => e.offsetParent).map(e => e.className).slice(0, 4);
    const start = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /Start|Probe starten|Messen/.test(x.textContent)).map(x => x.textContent.trim()).slice(0, 4);
    const o = await Q.perfProbe(['kern']); await sl(500);
    const v = Q.voices(); return {nm, sheet, start, cases: o && o.cases && o.cases.map(c => ({id: c.id || c.name, reports: c.reports, load_med: c.load_med})), frames_ok: o && o.frames_ok, lt: o && o.longtasks, net: o && o.net, voicesAfter: v.length}; });
  console.log(name, vp.width, JSON.stringify(r), 'errs', JSON.stringify(errs).slice(0, 300)); await b.close(); }
