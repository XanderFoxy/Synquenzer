// Offline: „Reine Vokale“ für The Wall → the-wall-vokale-rein.mp3 (+ F1/F2 vorher/nachher in messung-rein.json)
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { nurVokaleMitInfo, messeFormanten } from '../app/js/vokalfilter.js';
import { silbenZuVokalen } from '../app/js/phonetik.js';
const HIER = new URL('.', import.meta.url).pathname;
const QUELLE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/projekt7/Haupt-3-trocken-v7.wav';
const SR = 48000;
const lied = JSON.parse(readFileSync(HIER + '../app/daten/the-wall.json', 'utf8'));
const ziele = [];
for (const z of lied.zeilen) {
  const v = silbenZuVokalen(z);
  z.silben.forEach((s, i) => { if (!s.gesprochen && v[i] && isFinite(s.t)) ziele.push({ t: s.t, ende: s.t + s.dauer, vokal: v[i].vokal, gleit: v[i].gleit, text: s.text }); });
}
writeFileSync(HIER + 'ziele.json', JSON.stringify(ziele));
const roh = execFileSync('ffmpeg', ['-v', 'error', '-i', QUELLE, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
const x = new Float32Array(roh.buffer, roh.byteOffset, roh.length / 4).slice();
const t0 = Date.now();
const echt = nurVokaleMitInfo(x, SR, {}).y;
const t1 = Date.now();
const { y, info } = nurVokaleMitInfo(x, SR, { rein: true, ziele });
const ms = Date.now() - t1;
writeFileSync(HIER + 'rein.f32', Buffer.from(y.buffer));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', HIER + 'rein.f32', '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '128k', '-t', '266', HIER + 'the-wall-vokale-rein.mp3']);
const out = { silbenZiele: ziele.length, reinRahmen: info.reinRahmen, rechenzeitMs: { echt: t1 - t0, rein: ms },
  quelle: messeFormanten(x, SR, ziele), echt: messeFormanten(echt, SR, ziele), rein: messeFormanten(y, SR, ziele) };
writeFileSync(HIER + 'messung-rein.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
