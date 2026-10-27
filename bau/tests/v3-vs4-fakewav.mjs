// VS4 mit echtem getUserMedia (Chromium: --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<gesungene WAV>):
// ● REC mit 🎤 (Kopfhörer-Weg, Roh-Take) → SÄUBERN 100 % → kein Gate (N7V-23 am echten Mikro-Weg), Rauschen ↓, 0 % bitgleich
import {chromium} from 'playwright';
import {renderVoice} from './v3-vs2-corpus.mjs';
import {resample} from './v3-vs3-h.mjs';
import fs from 'fs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html';
const WAV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-vs4-gesang.wav';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
// gesungene Phrase (Männerstimme, Vibrato, Konsonanten) mit Pausen + leises Rauschen (SNR 40 dB), 48 kHz / 16 Bit
const MEL = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [6, 1, 65], [7, 1, 64], [8, 2, 62], [12, 1, 60], [13, 1, 64], [14, 2, 67]];
const v16 = renderVoice(MEL.map(([b, d, m], k) => ({on: 0.5 + b * 0.5, dur: d * 0.5, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 5, sigma: 12, vib: [20, 40], bpm: 120}).x;
const v = resample(v16, 16000, 48000), n = 48000 * 12, x = new Float32Array(n);
let pk = 0; for (const s of v) pk = Math.max(pk, Math.abs(s)); let rv = 0; for (const s of v) rv += s * s; rv = Math.sqrt(rv / v.length) * 0.5 / pk;
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
for (let i = 0; i < n; i++) x[i] = (i < v.length ? v[i] * 0.5 / pk : 0) + rv * 0.01 * 3.46 * rnd();
const pcm = Buffer.alloc(44 + n * 2), w = (o, s) => pcm.write(s, o, 'ascii');
w(0, 'RIFF'); pcm.writeUInt32LE(36 + n * 2, 4); w(8, 'WAVE'); w(12, 'fmt '); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(48000, 24); pcm.writeUInt32LE(96000, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); w(36, 'data'); pcm.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + 2 * i);
fs.writeFileSync(WAV, pcm);
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + WAV]});
const ctx = await br.newContext({viewport: {width: 390, height: 844}}), p = await ctx.newPage(), errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(500);
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); return SYNQUENZER.stimmeStart({route: 'wired', cal: false}); });
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000});
ok(await p.evaluate(() => SYNQUENZER.tkInfo().audioOk), 'echtes getUserMedia (Fake-Gerät mit gesungener WAV) läuft');
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
await sleep(400); await p.evaluate(() => SYNQUENZER.rec());
await sleep(10500);
await p.waitForFunction(() => SYNQUENZER.tkInfo().stimme >= 0 && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 30000});
await p.evaluate(() => SYNQUENZER.stop());
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), c = await p.evaluate(t => SYNQUENZER.getClip(t, 3), st), id = c && c.audio.take;
const meta = await p.evaluate(id => SYNQUENZER.takes()[id], id);
ok(meta && meta.route === 'wired' && !meta.cl && !meta.rf, 'Kopfhörer-Weg: Roh-Take ohne Referenz, SÄUBERN 0 %: ' + JSON.stringify(meta));
const raw0 = await p.evaluate(id => SYNQUENZER.clPlayHash(id), id), rawB = await p.evaluate(id => { const a = Float32Array.from(SYNQUENZER.tkBufRange(id)), u = new Uint8Array(a.buffer); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16) + ':' + a.length; }, id);
ok(raw0 === rawB, 'N7V-24: 0 % spielt den Roh-Take bitgleich');
await p.evaluate(id => SYNQUENZER.clSet(id, 100), id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
const m = await p.evaluate(id => {
  const r = SYNQUENZER.tkBufRange(id), y = SYNQUENZER.clPlayRange(id), sr = SYNQUENZER.takes()[id].sr, W = Math.round(0.01 * sr), N = Math.floor(r.length / W), rl = [], yl = [];
  for (let k = 0; k < N; k++) { let a = 0, b = 0; for (let i = k * W; i < (k + 1) * W; i++) { a += r[i] * r[i]; b += y[i] * y[i]; } rl.push(Math.sqrt(a / W)); yl.push(Math.sqrt(b / W)); }
  const pk = Math.max(...rl); let worst = 0, run = 0, vs = 0, es = 0, qs = [], qn = [];
  for (let k = 0; k < N; k++) { if (rl[k] > pk * 0.05) { if (yl[k] < rl[k] * 0.01) { run += 10; worst = Math.max(worst, run); } else run = 0; } else run = 0; }
  const th = rl.slice().sort((a, b) => a - b)[Math.floor(N * 0.1)]; for (let k = 0; k < N; k++) if (rl[k] <= th && rl[k] < pk * 0.01) { qs.push(rl[k]); qn.push(yl[k]); }
  for (let i = 0; i < r.length; i++) if (rl[Math.floor(i / W)] > pk * 0.05) { vs += r[i] * r[i]; es += (y[i] - r[i]) ** 2; }
  const mean = a => a.reduce((s, v) => s + v * v, 0) / Math.max(1, a.length);
  return {worstMs: worst, sdrVoiced: +(10 * Math.log10(vs / es)).toFixed(1), noiseRedDb: +(10 * Math.log10(mean(qs) / mean(qn))).toFixed(1), quietFrames: qs.length, n: r.length};
}, id);
ok(m.worstMs <= 50, `N7V-23 (echtes Mikro): längster Abschnitt < −40 dB in gesungenen Stellen ${m.worstMs} ms (≤ 50, kein Gate)`);
ok(m.sdrVoiced >= 20, `gesäubert gegen roh in gesungenen Stellen: ${m.sdrVoiced} dB (≥ 20, die Stimme bleibt)`);
ok(m.noiseRedDb >= 6, `Rauschen in den Pausen −${m.noiseRedDb} dB (leisestes Zehntel, ${m.quietFrames} Stücke à 10 ms)`);
const ci = await p.evaluate(id => SYNQUENZER.clInfo(id), id);
ok(ci.info && ci.info.ref === false && ci.info.way === '1E+NF+W+HP', 'ohne Referenz: Nachfilter/Wiener/HP (Info ' + JSON.stringify(ci.info) + ')');
ok(!errs.length, 'keine Konsolenfehler ' + JSON.stringify(errs.slice(0, 3)));
await br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
process.exit(fail ? 1 : 0);
