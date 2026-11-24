import fs from 'fs';
import { wavLesen } from '../../app/js/ton.js';
import { analysiere, stimmlageAusLiedern, kompakt } from '../../app/js/stimmanalyse.js';
const f = process.argv[2];
const buf = fs.readFileSync(f); const r = wavLesen(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const k = r.kanaele; const x = k.length === 1 ? k[0] : k[0].map((v, i) => (v + k[1][i]) / 2);
const t0 = Date.now(); const a = analysiere(x, r.sr, { name: f }); console.log('ms', Date.now() - t0, 'stellen', a.stellen.length, 'sek', a.sekunden, 'basis', JSON.stringify(a.basis), JSON.stringify(a.anstrengung));
for (const t of Object.values(a.toene)) console.log(t.name.padEnd(4), String(t.dauer).padStart(5), t.sauber.padEnd(10), 'q', t.q, 'cpp', t.cpp, 'hnr', t.hnr, 'jit', t.jitter, 'shim', t.shimmer, 'str', t.streuung, 'c', t.cent, 'reg', t.reg.join('/'), t.register, 'anstr', t.angestrengt);
const p = stimmlageAusLiedern([kompakt(a)]); console.log(p.typ, p.tief, p.hoch, p.kern, p.uebergaenge, '\n', p.text);
