// QA regression (V2d): MIDI of an old (3.1.0, format 3) project — scene / all / song bytes base vs new (no marks there)
import { open, NEW as APP, BASE as BASE0 } from './v3-qa-v2e2reg-pw.mjs';
import fs from 'fs';
const BASE = BASE0;
const OLD = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-old/v0a-project.json', 'utf8');
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  out[name] = await p.evaluate(t => { const Q = window.SYNQUENZER; Q.importJSON(t); const r = {};
    for (const mode of ['scene', 'all', 'song']) { const m = Q.buildMidi({mode, scene: 0}); r[mode] = m ? Array.from(m.bytes).join(',') : null; } return r; }, OLD);
  out[name].errs = errs; await b.close();
}
for (const k of ['scene', 'all', 'song', 'errs']) console.log(k, JSON.stringify(out.base[k]) === JSON.stringify(out.new[k]) ? 'same' : 'DIFF', (JSON.stringify(out.new[k]) || '').length);
