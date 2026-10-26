// T5: FP-DSP on take playback: clicks at loop / A/B / mute / stop / scene switch / panic; mute & volume audible
import {launch, open, sleep} from './v3-qa-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sine = (sr, sec, f, a = 0.3) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * a * 32767); return x; };
const br = await launch(null);
const H = await open(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
// find a scene empty on all tracks
const sc = await p.evaluate(() => { const nt = SYNQUENZER.tracks().length; for (let s = 7; s >= 0; s--) { let e = true; for (let t = 0; t < nt; t++) if (SYNQUENZER.getClip(t, s)) e = false; if (e) return s; } return -1; });
console.log('empty scene', sc);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const r1 = await p.evaluate(([pc, s]) => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: s, len: 1}), [sine(48000, 2.3, 330), sc]);
const r2 = await p.evaluate(([pc, s]) => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: s, len: 1}), [sine(48000, 2.3, 495), sc]);
console.log('clip', JSON.stringify(await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [r1.track, sc])));
await p.evaluate(() => { window.__tap(); window.__recOut(); });
const T0 = await p.evaluate(() => window.__ctx.currentTime);
const ev = [];
const mark = async n => ev.push([n, await p.evaluate(() => window.__ctx.currentTime)]);
await p.evaluate(s => SYNQUENZER.launchScene(s), sc); await mark('launch');
await sleep(4600);            // ≥ 2 loop boundaries (1 bar = 2 s)
const lvOn = await p.evaluate(() => window.__lvl());
await mark('ab'); await p.evaluate(([t, s]) => SYNQUENZER.tkPick({t, s}, 1), [r1.track, sc]); await sleep(700);
const lvAB = await p.evaluate(() => window.__lvl());
await mark('mute'); await p.evaluate(t => SYNQUENZER.setMute(t, true), r1.track); await sleep(600);
const lvMute = await p.evaluate(() => window.__lvl());
await mark('unmute'); await p.evaluate(t => SYNQUENZER.setMute(t, false), r1.track); await sleep(900);
const lvUn = await p.evaluate(() => window.__lvl());
// volume of the STIMME track
const snd = await p.evaluate(t => SYNQUENZER.getSound(t), r1.track);
await mark('vol'); const vr = await p.evaluate(([t, s]) => { const x = JSON.parse(JSON.stringify(s)); x.fx.vol = (x.fx.vol || .8) * 0.25; return SYNQUENZER.setSound(t, x); }, [r1.track, snd]); await sleep(700);
const lvVol = await p.evaluate(() => window.__lvl());
await p.evaluate(([t, s]) => SYNQUENZER.setSound(t, s), [r1.track, snd]); await sleep(600);
await mark('stop'); await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
const lvStop = await p.evaluate(() => window.__lvl());
await p.evaluate(s => SYNQUENZER.launchScene(s), sc); await sleep(1300);
await mark('panic'); await p.evaluate(() => SYNQUENZER.panic()); await sleep(500);
const lvPanic = await p.evaluate(() => window.__lvl());
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
console.log('levels on', lvOn.rmsDb.toFixed(1), lvOn.peakHz.toFixed(0), '| A/B', lvAB.rmsDb.toFixed(1), lvAB.peakHz.toFixed(0), '| mute', lvMute.rmsDb.toFixed(1), '| unmute', lvUn.rmsDb.toFixed(1), '| vol×0.25', vr, lvVol.rmsDb.toFixed(1), '| stop', lvStop.rmsDb.toFixed(1), '| panic', lvPanic.rmsDb.toFixed(1));
ok(Math.abs(lvOn.peakHz - 495) < 10 && Math.abs(lvAB.peakHz - 330) < 10, 'top take audible, A/B switches');
ok(lvMute.rmsDb < lvOn.rmsDb - 40, 'mute silences the take');
ok(Math.abs(lvUn.rmsDb - lvAB.rmsDb) < 3, 'unmute brings it back');
ok(lvVol.rmsDb < lvUn.rmsDb - 8, 'track volume changes the take level (' + (lvVol.rmsDb - lvUn.rmsDb).toFixed(1) + ' dB)');
ok(lvStop.rmsDb < -80 && lvPanic.rmsDb < -80, 'stop and panic silence the take');
// click analysis on recorded output
const rec = await p.evaluate(() => { const a = window.__rec; const n = a.reduce((s, x) => s + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of a) { y.set(x, o); o += x.length; } return {y: Array.from(y), t0: window.__ctx.currentTime - n / window.__ctx.sampleRate}; });
const y = rec.y; let pk = 0; const d2 = new Float32Array(y.length);
for (let i = 1; i < y.length - 1; i++) { d2[i] = Math.abs(y[i + 1] - 2 * y[i] + y[i - 1]); }
// steady curvature: median of local max over 10 ms windows where signal present
const W = Math.round(sr * 0.01), loc = [];
for (let i = 0; i + W < y.length; i += W) { let m = 0, a = 0; for (let j = i; j < i + W; j++) { m = Math.max(m, d2[j]); a = Math.max(a, Math.abs(y[j])); } if (a > 0.05) loc.push(m); }
loc.sort((a, b) => a - b); const base = loc[Math.floor(loc.length / 2)] || 1e-9;
const spikes = []; for (let i = 0; i + W < y.length; i += W) { let m = 0, mi = i; for (let j = i; j < i + W; j++) if (d2[j] > m) { m = d2[j]; mi = j; } if (m > base * 3 && m > 0.003) spikes.push([+(rec.t0 + mi / sr).toFixed(3), +(m / base).toFixed(1)]); }
console.log('base curvature', base.toFixed(5), 'events', JSON.stringify(ev.map(e => [e[0], +e[1].toFixed(3)])));
console.log('spikes [ctxTime, ×base]', JSON.stringify(spikes.slice(0, 20)));
ok(!spikes.length, 'no clicks (2nd difference ≤ 3× steady curvature) across loop, A/B, mute, unmute, volume, stop, panic');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
