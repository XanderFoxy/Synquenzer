import fs from 'fs';
import * as M from '../vs5afix2-tmp/marks.mjs';
import {onsets20, QOUT} from './v3-qa-vs5a-h2.mjs';
const D = JSON.parse(fs.readFileSync(process.argv[2] || QOUT + '/fix-a-dump.json')), sr = D.sr, raw = Float32Array.from(D.raw);
const on = onsets20(raw, sr), mk = M.detectMarks(raw, sr);
for (const t of on) { const m = mk.reduce((b, x) => Math.abs(x.t - t) < Math.abs(b.t - t) ? x : b, mk[0]); console.log('onset', t.toFixed(4), 'mark', m.t.toFixed(4), 'onset−mark', ((t - m.t) * 1000).toFixed(2), 'ms', m.src); }
