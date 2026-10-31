// QA VS-L L.2: Stimme-FANG bei Melodieerkennung Aus über den LAUTSPRECHER (Loopback: Musik der App im Mikro, wie VS4-Abnahme B):
// Phrase 2 Takte – Pause 2 Takte – 4 Takte → Pausen-Regel: STIMME-Take = die letzten 4 Takte (wie An mit Noten).
// node n4-vs-l-qa-spk.mjs <an|aus> [file]
import {chromium} from 'playwright';
import {open, sleep, b64, resample} from './v3-vs3-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
const mel = process.argv[2] !== 'aus', GAIN = +(process.env.GAIN || 0.7), file = process.argv[3] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VSL/index.html';
const BPM = 120, SB = 0.5, LEAD = 0.04;
const PH = [[0, 1.6, 60], [2, 1.6, 62], [4, 1.6, 64], [6, 1.6, 62]]; for (let b = 0; b < 4; b++) { PH.push([16 + b * 4, 1.6, 57 + b * 2]); PH.push([16 + b * 4 + 2, 1.6, 64 - b]); }
const x = renderVoice(PH.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 3, sigma: 12, vib: [20, 40], bpm: BPM}).x;
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const H = await open({br, file}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
const ROUTE = process.env.ROUTE || 'speaker';
await p.evaluate(r => SYNQUENZER.stimmeStart({route: r, cal: false}), ROUTE);
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); await sleep(500);
if (ROUTE === 'speaker' && GAIN > 0) await p.evaluate(([s, g]) => { window.__loop(s); if (window.__loopN && window.__loopN.g) window.__loopN.g.gain.value = g; }, [0.02137, GAIN]);
if (ROUTE === 'speaker' && GAIN > 0) { await p.evaluate(() => SYNQUENZER.stimmeCal('voll')); await sleep(300); }
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 30000}).catch(() => {});
const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr), lat = await p.evaluate(() => SYNQUENZER.stimme().latMs);
await p.evaluate(m => { SYNQUENZER.loadDemo(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.vsSet({mel: m}); }, mel);
await sleep(2500);
const y = resample(x, 16000, sr);
await p.evaluate(([b, lead]) => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - lead); }, [b64(y), LEAD]);
await p.waitForFunction(() => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= 36.3; }, null, {timeout: 60000, polling: 20});
const okF = await p.evaluate(() => SYNQUENZER.vsFang({}));
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000}); await sleep(800);
const lf = await p.evaluate(() => SYNQUENZER.vsInfo().lastFang), vr = await p.evaluate(() => SYNQUENZER.vsResult()), vo = await p.evaluate(() => SYNQUENZER.vsVoiceOnly ? SYNQUENZER.vsVoiceOnly() : null);
const st = await p.evaluate(s => { const I = SYNQUENZER.tkInfo(); const c = I.stimme >= 0 && s != null ? SYNQUENZER.getClip(I.stimme, s) : null; return c && {len: c.len, sec: +(c.audio.out - c.audio.in).toFixed(3)}; }, lf && lf.si);
console.log(mel ? 'An ' : 'Aus', '| Weg', ROUTE, '| Loop-Verstärkung', GAIN, '| Latenz', lat, 'ms | FANG', okF, '| lastFang', JSON.stringify(lf), '| Pegel', JSON.stringify(vo && vo.level));
console.log('  Ergebnis MELODIE', JSON.stringify(vr && {len: vr.len, start: vr.start, n: vr.notes.length}), '| STIMME', JSON.stringify(st), '| Meldungen', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#toast')].map(t => t.textContent))));
console.log('  erwartet (Pausen-Regel): 4 Takte ab Takt 6 (start 5)');
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await br.close();
