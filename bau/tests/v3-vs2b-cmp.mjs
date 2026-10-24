// side-by-side: detected notes vs A1/A2 for vocadito_1
import fs from 'fs';
import {loadDsp} from './v3-vs2-corpus.mjs';
import {readWav, resample} from './v3-vs2b-real.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const D = loadDsp(process.argv[2]);
const w = readWav(DIR + (process.argv[3] || 'vocadito_1') + '.wav'), x = resample(w.x, w.sr, 16000);
const tr = D.pyin(x, {fs: 16000}), sg = D.segment(tr, {snap: false, tuning: 'auto'});
const rd = f => { try { return fs.readFileSync(f, 'utf8').trim().split(/\n/).map(l => l.split(',').map(Number)).map(([on, hz, d]) => ({t: on, s: 'A' , d, m: 69 + 12 * Math.log2(hz / 440)})); } catch (e) { return []; } };
const ev = [...sg.notes.map(n => ({t: n.t0, s: 'D', d: n.t1 - n.t0, m: n.m, n: n.n})), ...rd(DIR + 'vocadito_1_notesA1.csv').map(a => ({...a, s: 'A1'})), ...rd(DIR + 'vocadito_1_notesA2.csv').map(a => ({...a, s: 'A2'}))].sort((a, b) => a.t - b.t);
// frame pitch trace helper
const hop = tr.hop / tr.fs;
for (const e of ev) { let tr2 = ''; if (e.s === 'D') { const a = Math.round(e.t / hop), b = Math.round((e.t + e.d) / hop); const v = []; for (let i = a; i < b; i += 4) v.push(tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(1) : '-'); tr2 = v.join(' '); }
  console.log((e.s === 'D' ? '      ' : e.s === 'A1' ? 'A1 ' : '   A2 ') + e.t.toFixed(3).padStart(7), e.d.toFixed(3), e.m.toFixed(2), e.n ?? '', tr2.slice(0, 160)); }
