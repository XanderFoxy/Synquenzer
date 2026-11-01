// QA K1 regression (musician flow, touch where it is a tap): record a clip, FANG of chords -> part, song via placePart (drag path),
// take (vocal) in scene 8 plays, transpose, MS 2000 sound, undo/redo round trip, save -> reload deep-equal, layouts, console
import {open, sleep, OUT} from './n5-k-qa-lib.mjs';
const FILE = process.env.F; const TAG = FILE ? 'base' : 'K';
let fail = 0; const ok = (c, m) => { console.log((c ? 'OK  ' : 'BAD ') + m); if (!c) fail++; };
const T = await open({vp: [390, 844], file: FILE, args: []}); let {p, E} = T;
const lvl = () => E(() => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 8192; AU.M.ceil.connect(a); setTimeout(() => { const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; const f = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(f); let mi = 1; for (let i = 2; i < f.length; i++) if (f[i] > f[mi]) mi = i; try { AU.M.ceil.disconnect(a); } catch (e) {} r({rmsDb: 10 * Math.log10(s / b.length + 1e-20), peakHz: mi * AU.ctx.sampleRate / a.fftSize}); }, 400); }));
const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().beat >= b, b, {timeout: 60000, polling: 10});
await E(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
const P_0 = await E(() => JSON.stringify(SYNQUENZER.project()));
// 1 record a clip: Synth 1, scene 4 (empty), 3 notes
await E(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
await waitB(3.5); await E(() => SYNQUENZER.rec());
for (const [b, n] of [[4.05, 60], [5.05, 64], [6.05, 67]]) { await waitB(b); await E(n => SYNQUENZER.keyOn(n), n); await sleep(200); await E(n => SYNQUENZER.keyOff(n), n); }
await waitB(9); await sleep(300);
const rc = await E(() => SYNQUENZER.getClip(0, 3));
ok(rc && rc.notes.length === 3, 'record a clip with REC: ' + (rc && rc.notes.map(n => n.n + '@' + n.t.toFixed(2)).join(' ')));
await E(() => SYNQUENZER.stop()); await sleep(300);
// 2 FANG: scene 1 by finger, 8 bars of chords, FANG by finger, accept as part
const s1 = (await T.find('button.scn', /^▶\s*1/))[0]; await T.tap(s1.cx, s1.cy, 300);
await p.waitForFunction(() => SYNQUENZER.runtime().playing, null, {timeout: 10000});
const chords = [57, 53, 48, 55, 57, 53, 48, 55]; const b0 = Math.ceil((await E(() => audBeat())) / 4) * 4 + 4;
for (let k = 0; k < chords.length; k++) { await p.waitForFunction(b => audBeat() >= b, b0 + 4 * k + 0.05, {timeout: 60000, polling: 5}); await E(n => { SYNQUENZER.keyOn(n, .8, 'c'); setTimeout(() => SYNQUENZER.keyOff(0, 'c'), 120); }, chords[k]); }
await p.waitForFunction(b => audBeat() >= b, b0 + 32.3, {timeout: 60000, polling: 5});
const fb = (await T.find('#bFang, .fangb'))[0]; console.log('fang button', JSON.stringify(fb)); if (fb) await T.tap(fb.cx, fb.cy, 400);
const fp = await E(() => SYNQUENZER.fangPart());
ok(fp && fp.len >= 2, 'FANG after 8 bars of chords -> part sheet: ' + JSON.stringify(fp && {len: fp.len, name: fp.suggest && fp.suggest.name}));
await E(() => SYNQUENZER.fangAccept('part')); await sleep(400);
const np = await E(() => SYNQUENZER.parts().filter(Boolean).length);
ok(np >= 1, 'FANG accepted -> part: ' + np);
await E(() => SYNQUENZER.stop()); await sleep(400);
// 3 vocal take in scene 8 (sine 440 Hz as the sung take), scene 8 plays it
const sine = (sr, sec, f, a = .3) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * a * 32767); return x; };
const tk = await E(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 7, len: 2}), sine(48000, 4.2, 440));
await E(() => SYNQUENZER.launchScene(7)); await sleep(1300);
const l1 = await lvl(); ok(Math.abs(l1.peakHz - 440) < 12 && l1.rmsDb > -30, 'scene 8 plays the take: ' + l1.peakHz.toFixed(0) + ' Hz ' + l1.rmsDb.toFixed(1) + ' dB');
await E(() => SYNQUENZER.stop()); await sleep(300);
// 4 song: scene 4 and scene 8 into the song (drag & drop path), song plays the take in bar 2
await E(() => SYNQUENZER.setSong(null));
const a1 = await E(() => SYNQUENZER.placePart('S4', 0, 'insert')), a2 = await E(() => SYNQUENZER.placePart('S8', 1, 'insert'));
const sg = await E(() => SYNQUENZER.project().song);
ok(a1 && a2 && sg && sg.bars === 3 && (sg.lanes[tk.track] || []).some(e => e.bar === 1 && e.slot === 7), 'song from placePart (drag path): bars ' + (sg && sg.bars));
await E(() => SYNQUENZER.songPlay(1)); await sleep(1300);
const l2 = await lvl(); ok(Math.abs(l2.peakHz - 440) < 12 && l2.rmsDb > -30, 'song bar 2 plays the take: ' + l2.peakHz.toFixed(0) + ' Hz ' + l2.rmsDb.toFixed(1));
await E(() => SYNQUENZER.stop()); await sleep(300);
// 5 transpose by +2 (TRANSPONIEREN)
const op0 = await E(() => SYNQUENZER.outPitch(0, 60));
await E(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.keyOn(62); }); await sleep(150); await E(() => SYNQUENZER.keyOff(62));
const op1 = await E(() => SYNQUENZER.outPitch(0, 60));
await E(() => { SYNQUENZER.setKbMode('play'); });
ok(JSON.stringify(op0) !== JSON.stringify(op1), 'transpose moves the synth pitch: ' + JSON.stringify(op0) + ' -> ' + JSON.stringify(op1));
await E(() => SYNQUENZER.resetCarrier());
// 6 MS 2000 sound on track 2, a program (Hauchlead), played
await E(async () => { mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); SYNQUENZER.setEngine(1, 'mk'); loadPreset(1, 'f-mk-d05'); });
await sleep(500);
await E(() => { SYNQUENZER.selectSlot(1, 0); SYNQUENZER.keyOn(69); }); await sleep(700);
const l3 = await lvl(); await E(() => SYNQUENZER.keyOff(69)); await sleep(400);
ok(l3.rmsDb > -45, 'MS 2000 program sounds on track 2: ' + l3.rmsDb.toFixed(1) + ' dB ' + l3.peakHz.toFixed(0) + ' Hz');
// 7 undo all the way back and redo all the way forward: project equal at both ends
const strip = s => { const c = JSON.parse(s); delete c.ui; return JSON.stringify(c); };
const PA = await E(() => JSON.stringify(SYNQUENZER.project()));
const nU = await E(() => SYNQUENZER.undoInfo().n);
await E(n => { for (let i = 0; i < n; i++) undo(); }, nU); await sleep(300);
const PB = await E(() => JSON.stringify(SYNQUENZER.project()));
await E(n => { for (let i = 0; i < n; i++) redo(); }, nU); await sleep(300);
const PC = await E(() => JSON.stringify(SYNQUENZER.project()));
const sameB = (() => { const a = JSON.parse(strip(PB)), b = JSON.parse(strip(P_0)); for (const k of ['takes', 'id', 'name']) { delete a[k]; delete b[k]; } return JSON.stringify(a.tracks.map(t => t.clips)) === JSON.stringify(b.tracks.map(t => t.clips)) && JSON.stringify(a.song) === JSON.stringify(b.song); })();
const dif = (a, b, path = '') => { if (JSON.stringify(a) === JSON.stringify(b)) return []; if (a && b && typeof a === 'object' && typeof b === 'object') { let o = []; for (const k of new Set(Object.keys(a).concat(Object.keys(b)))) o = o.concat(dif(a[k], b[k], path + '.' + k)); return o; } return [path + ': ' + JSON.stringify(a).slice(0, 80) + ' | ' + JSON.stringify(b).slice(0, 80)]; };
ok(nU >= 5 && strip(PC) === strip(PA), 'undo x' + nU + ' then redo x' + nU + ' -> same project ' + JSON.stringify(dif(JSON.parse(strip(PA)), JSON.parse(strip(PC))).slice(0, 6)));
ok(sameB, 'undo x' + nU + ' -> clips and song as at the start');
// 8 save -> reload deep-equal
await E(() => SYNQUENZER.save()); await sleep(1800);
const P0 = await E(() => JSON.stringify(SYNQUENZER.project()));
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.runtime, null, {timeout: 30000}); await sleep(2000);
const P1 = await E(() => JSON.stringify(SYNQUENZER.project()));
const sk = s => { const o = JSON.parse(s); delete o.ui; const so = x => Array.isArray(x) ? x.map(so) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, so(x[k])])) : x; return JSON.stringify(so(o)); };
ok(sk(P0) === sk(P1), 'save -> reload deep-equal (' + P0.length + ' chars)');
const mkAfter = await E(() => [SYNQUENZER.getSound(1).engine, SYNQUENZER.getSound(1).name]);
ok(mkAfter[0] === 'mk', 'MS 2000 program after reload: ' + mkAfter.join(' '));
// the take plays after reload
await E(() => SYNQUENZER.launchScene(7)); await sleep(1500);
const l4 = await lvl(); ok(Math.abs(l4.peakHz - 440) < 12 && l4.rmsDb > -30, 'after reload scene 8 plays the take: ' + l4.peakHz.toFixed(0) + ' Hz ' + l4.rmsDb.toFixed(1));
await E(() => SYNQUENZER.stop()); await sleep(300);
// 9 layouts
for (const [w, h, n] of [[390, 844, 'P1'], [844, 390, 'L1'], [320, 568, 'P3'], [926, 428, 'X']]) {
  await p.setViewportSize({width: w, height: h}); await sleep(600);
  const L = await E(() => ({sw: document.documentElement.scrollWidth, cw: innerWidth, sh: document.documentElement.scrollHeight, ch: innerHeight}));
  ok(L.sw <= L.cw && L.sh <= L.ch, n + ' no page overflow ' + JSON.stringify(L));
  await p.screenshot({path: OUT + 'reg-' + TAG + '-' + n + '.png'});
}
const te = await E(() => SYNQUENZER.tickErrors()); ok(!te || !te.length, 'no tick errors ' + JSON.stringify(te).slice(0, 100));
ok(!T.errs.length, 'no console errors ' + JSON.stringify(T.errs.slice(0, 3)));
await T.b.close();
console.log(fail ? fail + ' BAD' : 'all ok');
