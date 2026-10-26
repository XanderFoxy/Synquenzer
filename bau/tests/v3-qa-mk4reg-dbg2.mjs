import { open, APP } from './v3-qa-mk4reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
for (const f of [BASE, APP]) {
  const {b, p, errs} = await open({width: 390, height: 844}, f);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); Q.newProject({init: true}); Q.setEngine(0, 'mk'); await sl(300); Q.mkSet(0, 't.0.f.cut', 80);
    const n0 = Q.project().name; const sv = await Q.save(); const nm = Q.project().name; await Q.newProject({init: true}); const n1 = Q.project().name; const ld = await Q.load(); await sl(300); const g = Q.getSound(0);
    return {sv, n0, nm, n1, ld, after: Q.project().name, eng: g.engine, cut: g.p.mk ? g.p.mk.t[0].f.cut : null}; });
  console.log(f.split('/').slice(-2).join('/'), JSON.stringify(r), errs);
  await b.close();
}
