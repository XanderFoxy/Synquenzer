// Mix hören: Demo Groove + 4-Takt-Gesang (Mikro-Pegel ≈ −21 dBFS RMS), alle Regler Standard; Pegel am Ausgang je Spur allein (RMS über 2 Takte)
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, takeDb, NEW, sleep, tapSel} from './n4-vs-l-mus-h.mjs';
const file = process.argv[2] || NEW, BPM = 112;
const H = await start(file, BPM, {demo: true, touch: true, mel: false}), p = H.p;
const k = await prep(H, sing(melN(4), BPM));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
await waitBeat(p, 1.0); await tapSel(H, '#bRec'); await fire(H, k, 4);
await waitBeat(p, 19.5); await tapSel(H, '#bRec'); await waitBeat(p, 22); await idle(p);
const r = await stInfo(p, 0); const tdb = await takeDb(p, r.audio.take, r.audio.in, r.audio.out);
await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
const NT = await p.evaluate(() => SYNQUENZER.project().tracks.map(t => t.name));
const meas = async solo => { await p.evaluate(s => { for (let t = 0; t < 8; t++) try { SYNQUENZER.setMute(t, s >= 0 && t !== s); } catch (e) {} window.__tap(); SYNQUENZER.launchScene(0); SYNQUENZER.play(); }, solo);
  const v = []; await waitBeat(p, 0.2); for (let b = 0.3; b < 16; b += 0.25) { await waitBeat(p, b); v.push(Math.pow(10, (await p.evaluate(() => window.__lvl())) / 10)); }
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400); return +(10 * Math.log10(v.reduce((a, x) => a + x, 0) / v.length)).toFixed(1); };
const out = {};
for (let t = 0; t < NT.length; t++) out[NT[t]] = await meas(t);
out['MIX'] = await meas(-1);
console.log('Take RMS', tdb, 'dBFS | Ausgang je Spur allein (RMS dB, 4 Takte Groove):', JSON.stringify(out));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
