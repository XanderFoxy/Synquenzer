import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk6-base-4.12.0.html';
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = await p.evaluate(async () => { const x = await window.SYNQUENZER.perfProbe(['kern', 'fx']); return x.cases.map(c => ({id: c.id || c.case || c.name, fall: c.fall, voices: c.voices, load_med: c.load_med, frames_ok: c.frames_ok, lt: c.longtasks})); });
  console.log(name, JSON.stringify(r), JSON.stringify(errs)); await b.close();
}
