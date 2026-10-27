// Regression: record clip, scenes, scene with STIMME into song (drag path placePart), song plays take, transpose, MS 2000 sound, save/load, layout
import {launch, open, sleep, deq, DIR} from './v3-qa-vs4-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sine = (sr, sec, f, a = 0.3) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * a * 32767); return x; };
const br = await launch(null);
const ctx = await br.newContext({viewport: {width: 390, height: 844}});
let H = await open(br, {ctx}), p = H.p;
const beat = () => p.evaluate(() => SYNQUENZER.runtime().beat);
const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().beat >= b, b, {timeout: 30000, polling: 10});
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
// take in scene 8
const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 7, len: 2}), sine(48000, 4.2, 440));
// VS4: the take gets SÄUBERN 60 % → the scene/song must play the cleaned version (same tone)
await p.evaluate(id => SYNQUENZER.clSet(id, 60), r.id); await p.evaluate(id => SYNQUENZER.clWait(id), r.id);
ok(await p.evaluate(id => SYNQUENZER.clInfo(id).buf, r.id), 'take cleaned at 60 % before the regression run');
// 1 record a clip (Synth 1, scene 4)
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
await waitB(3.5); await p.evaluate(() => SYNQUENZER.rec());
for (const [b, n] of [[4.05, 60], [5.05, 64], [6.05, 67]]) { await waitB(b); await p.evaluate(n => SYNQUENZER.keyOn(n), n); await sleep(200); await p.evaluate(n => SYNQUENZER.keyOff(n), n); }
await waitB(9); await sleep(300);
const rc = await p.evaluate(() => SYNQUENZER.getClip(0, 3));
ok(rc && rc.notes.length === 3, 'record a clip with ● REC: ' + (rc && rc.notes.map(n => n.n + '@' + n.t.toFixed(2)).join(' ')));
await p.evaluate(() => SYNQUENZER.stop());
// 1b FANG TEIL: chords in transpose mode for 2 bars, then FANG → a part
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.setKbMode('transpose'); });
for (const [b, n] of [[0.05, 57], [4.05, 53], [8.05, 48], [12.05, 55]]) { await waitB(b); await p.evaluate(n => SYNQUENZER.keyOn(n, 0.8, 'c'), n); await sleep(120); await p.evaluate(() => SYNQUENZER.keyOff(0, 'c')); }
await waitB(16.3); await p.evaluate(() => SYNQUENZER.fangTeil({})); await sleep(150);
const fp = await p.evaluate(() => { const f = SYNQUENZER.fangPart(); return f && {len: f.len, ch: f.chords && f.chords.ch.map(c => c.b + ':' + (c.tg ? c.tg.name : 'O')).join(' ')}; });
const fa = await p.evaluate(() => SYNQUENZER.fangAccept('part'));
ok(fp && fp.len >= 1 && fa !== false, 'FANG TEIL captures a part: ' + JSON.stringify(fp));
await p.evaluate(() => { SYNQUENZER.setKbMode('play'); SYNQUENZER.resetCarrier(); SYNQUENZER.stop(); }); await sleep(300);
// 2 scene launch with STIMME clip → take audible together with synths
await p.evaluate(() => { window.__tap(); SYNQUENZER.launchScene(7); }); await sleep(1200);
const l1 = await p.evaluate(() => window.__lvl()); ok(Math.abs(l1.peakHz - 440) < 10 && l1.rmsDb > -30, 'scene 8 plays the take: ' + l1.peakHz.toFixed(0) + ' Hz ' + l1.rmsDb.toFixed(1) + ' dB');
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
// 3 song: place scene 8 (with STIMME) and scene 4 into the song (drag & drop path)
await p.evaluate(() => SYNQUENZER.setSong(null));
const a1 = await p.evaluate(() => SYNQUENZER.placePart('S4', 0, 'insert')), a2 = await p.evaluate(() => SYNQUENZER.placePart('S8', 1, 'insert'));
const sg = await p.evaluate(() => SYNQUENZER.project().song);
const st = r.track;
ok(a1 && a2 && sg && sg.bars === 3 && (sg.lanes[st] || []).some(e => e.bar === 1 && e.slot === 7), 'scene 8 placed into the song with its STIMME lane: bars ' + (sg && sg.bars) + ' lane ' + JSON.stringify(sg && sg.lanes[st]));
await p.evaluate(() => SYNQUENZER.songPlay(1)); await sleep(1200);
const l2 = await p.evaluate(() => window.__lvl()); ok(Math.abs(l2.peakHz - 440) < 10 && l2.rmsDb > -30, 'song bar 2 plays the take: ' + l2.peakHz.toFixed(0) + ' Hz ' + l2.rmsDb.toFixed(1));
await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
// 4 transpose: TRANSPONIEREN by +2, synth out pitch moves, take unaffected (no error)
const op0 = await p.evaluate(() => SYNQUENZER.outPitch(0, 60));
await p.evaluate(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.keyOn(62); }); await sleep(150); await p.evaluate(() => SYNQUENZER.keyOff(62));
const op1 = await p.evaluate(() => SYNQUENZER.outPitch(0, 60));
await p.evaluate(() => { SYNQUENZER.setKbMode('play'); SYNQUENZER.resetCarrier(); });
ok(JSON.stringify(op0) !== JSON.stringify(op1), 'transpose changes synth out pitch: ' + JSON.stringify(op0) + ' → ' + JSON.stringify(op1));
// 5 MS 2000 sound on track 2
const se = await p.evaluate(() => { try { return SYNQUENZER.setEngine(1, 'mk'); } catch (e) { return 'ERR ' + e.message; } });
await sleep(400);
await p.evaluate(() => { SYNQUENZER.selectSlot(1, 0); SYNQUENZER.keyOn(57); }); await sleep(600);
const l3 = await p.evaluate(() => window.__lvl()); await p.evaluate(() => SYNQUENZER.keyOff(57)); await sleep(300);
ok(l3.rmsDb > -45, 'MS 2000 engine sounds on track 2 (' + JSON.stringify(se) + '): ' + l3.rmsDb.toFixed(1) + ' dB ' + l3.peakHz.toFixed(0) + ' Hz');
// 6 save / load
await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
const P0 = await p.evaluate(() => SYNQUENZER.project()); await p.close();
H = await open(br, {ctx}); p = H.p; await sleep(1200);
const P1 = await p.evaluate(() => SYNQUENZER.project());
const strip = P => { const c = JSON.parse(JSON.stringify(P)); delete c.ui; return c; };
ok(deq(strip(P0), strip(P1)), 'save → reload deep-equal');
// 7 layout portrait/landscape: no horizontal scroll, screenshots
for (const [w, h, n] of [[390, 844, 'P1'], [320, 568, 'P3'], [844, 390, 'L1'], [926, 428, 'XL']]) {
  await p.setViewportSize({width: w, height: h}); await sleep(500);
  const L = await p.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: innerWidth, sh: document.documentElement.scrollHeight, ch: innerHeight}));
  ok(L.sw <= L.cw && L.sh <= L.ch, n + ' no page overflow ' + JSON.stringify(L));
  await p.screenshot({path: DIR + '/reg-' + n + '.png'});
}
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
const te = await p.evaluate(() => SYNQUENZER.tickErrors()); ok(!te || !te.length, 'no tick errors ' + JSON.stringify(te).slice(0, 100));
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
