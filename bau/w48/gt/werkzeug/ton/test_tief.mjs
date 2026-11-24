import fs from 'fs';
const T = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/app/js/ton.js');
const buf = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/projekt7/Haupt-3-trocken-v7.wav');
const r = T.wavLesen(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const sp = T.tonhoehe(r.kanaele[0], r.sr);
const nn = T.noten({ ...sp, f0: sp.hz }, { minSicher: 0.55, minDauer: 0.15 });
const pg = nn.map(n=>n.pegel).sort((a,b)=>a-b); const laut = pg[Math.floor(0.9*(pg.length-1))];
console.log('laut', laut);
for (const n of nn.filter(n => n.midi < 49 || n.midi > 60)) console.log(n.midi, n.t0.toFixed(2), (n.t1-n.t0).toFixed(2), 'pg', n.pegel, 'si', n.sicher, 'str', n.streuung);
