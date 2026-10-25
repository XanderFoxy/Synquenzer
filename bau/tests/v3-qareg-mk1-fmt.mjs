import { open, APP } from './v3-qareg-mk1-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, APP);
console.log(await p.evaluate(async () => { const Q = window.SYNQUENZER; const a = Q.project().format; await Q.newProject({init: true}); const b2 = Q.project().format; const s = JSON.parse(Q.serialize()); await Q.loadDemo(); const c = Q.project().format; const s2 = JSON.parse(Q.serialize()); return {start: a, newProj: b2, serNew: [s.format, s.project && s.project.format], demo: c, serDemo: [s2.format, s2.project && s2.project.format]}; }));
console.log(errs); await b.close();
