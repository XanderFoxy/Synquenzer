// Musiker am iPhone-Lautsprecher (ohne Kopfhörer): Demo „Groove“ läuft (112 BPM), Musik kommt ins Mikro (Loopback, eingemessen).
// Gesang: 2 Takte, 2 Takte Pause, 8 Takte → FANG (Touch auf #bFang). Pausen-Regel → STIMME 8 Takte ab Takt 6 (start 5).
// node n4-vs-l-mus-spk.mjs <an|aus> [gain] [file]
import {chromium} from 'playwright';
import {open, sleep, b64, resample} from './v3-vs3-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
const mel = process.argv[2] !== 'aus', GAIN = +(process.argv[3] || 0.3), file = process.argv[4] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VSL/index.html';
const BPM = 112, SB = 60 / BPM, LEAD = 0.04;
const PH = [[0, 1.6, 60], [2, 1.6, 62], [4, 1.6, 64], [6, 1.6, 62]]; const sc = [57, 60, 62, 64, 65, 67, 69, 67];
for (let b = 0; b < 8; b++) { PH.push([16 + b * 4, 1.6, sc[b % 8]]); PH.push([16 + b * 4 + 2, 1.6, sc[(b + 3) % 8]]); }
const x = renderVoice(PH.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 3, sigma: 12, vib: [20, 40], bpm: BPM}).x;
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const H = await open({br, file, touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
const ROUTE = process.env.ROUTE || 'speaker';
await p.evaluate(r => SYNQUENZER.stimmeStart({route: r, cal: false}), ROUTE);
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); await sleep(500);
if (ROUTE === 'speaker') { await p.evaluate(([s, g]) => { window.__loop(s); window.__loopN.g.gain.value = g; }, [0.02137, GAIN]);
await p.evaluate(() => SYNQUENZER.stimmeCal('voll')); await sleep(300); }
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 30000}).catch(() => {});
const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr), lat = await p.evaluate(() => SYNQUENZER.stimme().latMs);
await p.evaluate(m => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); SYNQUENZER.vsSet({mel: m}); }, mel);
await sleep(2500);
const bpm = await p.evaluate(() => SYNQUENZER.project().bpm);
const y = resample(x, 16000, sr);
await p.evaluate(([b, lead]) => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - lead); }, [b64(y), LEAD]);
await p.waitForFunction(() => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= 52.3; }, null, {timeout: 90000, polling: 20});
const q = await p.evaluate(() => { const e = document.getElementById('bFang'); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width}; });
await p.touchscreen.tap(q.x, q.y);
await sleep(200);
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000}); await sleep(800);
const lf = await p.evaluate(() => SYNQUENZER.vsInfo().lastFang), vr = await p.evaluate(() => SYNQUENZER.vsResult()), vo = await p.evaluate(() => SYNQUENZER.vsVoiceOnly ? SYNQUENZER.vsVoiceOnly() : null);
const st = await p.evaluate(s => { const I = SYNQUENZER.tkInfo(); const c = I.stimme >= 0 && s != null ? SYNQUENZER.getClip(I.stimme, s) : null; return c && {len: c.len, sec: +(c.audio.out - c.audio.in).toFixed(3), cstart: SYNQUENZER.runtime().cstart[I.stimme]}; }, lf && lf.si);
console.log(mel ? 'An ' : 'Aus', `| ${bpm} BPM | ${ROUTE}, Loop ${ROUTE === 'speaker' ? GAIN : 0} | Latenz ${lat} ms | FANG-Tipp (${Math.round(q.w)} px) | lastFang`, JSON.stringify(lf), '| Pegel', JSON.stringify(vo && vo.level));
console.log('  MELODIE', JSON.stringify(vr && {len: vr.len, start: vr.start, n: vr.notes.length}), '| STIMME', JSON.stringify(st));
console.log('  erwartet (Pausen-Regel): 8 Takte ab Takt 6 (start 5)');
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await br.close();
