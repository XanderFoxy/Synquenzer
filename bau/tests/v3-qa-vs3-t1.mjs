// T1: real fake mic (WAV), ● REC with 🎤 → take; content pitch/level; overdub; playback; undo; network
import {launch, open, micOn, waitBeat, idle, sleep, writeWav, tone, concat, pitch, rmsDb, deq, DIR} from './v3-qa-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR = 48000, wav = DIR + '/t1.wav';
// 8 s of 330 Hz, then 8 s of 550 Hz (loops)
writeWav(wav, concat(tone(330, 8, SR), tone(550, 8, SR)), SR);
const br = await launch(wav);
const H = await open(br), p = H.p;
const sr = await micOn(p);
ok(await p.evaluate(() => window.__gum) === 1, 'getUserMedia once, constraints: ' + JSON.stringify(await p.evaluate(() => window.__gumC)));
// what does the ring buffer get?
const rb = await p.evaluate(() => { const c = SYNQUENZER.vsClock(), e = c.ring.end, r = SYNQUENZER.stimmeRead(e - 8192, e); return r ? Array.from(r.mic.slice(0, 4096)) : null; });
console.log('ring mic: pitch', rb && pitch(rb.map(v => v * 32767), sr).toFixed(1), 'rms', rb && rmsDb(rb, 1).toFixed(1), 'sr', sr);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 2); });
const nreq0 = H.reqs.length;
await p.evaluate(() => SYNQUENZER.play());
await waitBeat(p, 3.5); const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await p.evaluate(() => SYNQUENZER.rec());
await sleep(300);
const q1 = await p.evaluate(() => ({quiet: SYNQUENZER.tkInfo().quiet, st: SYNQUENZER.tkInfo().stQuiet}));
console.log('during rec quiet:', JSON.stringify(q1));
await waitBeat(p, 12.8); await idle(p);
const I = await p.evaluate(() => SYNQUENZER.tkInfo()), st = I.stimme;
const c1 = st >= 0 ? await p.evaluate(t => SYNQUENZER.getClip(t, 2), st) : null;
ok(st >= 0 && c1 && c1.audio, 'take from real fake mic: track ' + st + ' clip ' + JSON.stringify(c1 && c1.audio));
const u1 = await p.evaluate(() => SYNQUENZER.undoInfo());
console.log('undo after rec:', u1.n - u0, JSON.stringify(u1.top));
const tk = await p.evaluate(() => SYNQUENZER.takes()); console.log('takes', JSON.stringify(tk));
if (c1 && c1.audio) {
  const m = tk[c1.audio.take];
  const pcm = await p.evaluate(id => SYNQUENZER.tkPcmRange(id), c1.audio.take);
  ok(pcm && pcm.length === m.len, 'pcm length ' + (pcm && pcm.length) + ' = len ' + m.len + ' sr ' + m.sr);
  const segs = []; for (let k = 0; k + 4096 < pcm.length; k += Math.round(m.sr * 0.5)) { const s = pcm.slice(k, k + 4096); segs.push([+(k / m.sr).toFixed(2), Math.round(pitch(s, m.sr)), +rmsDb(s).toFixed(1)]); }
  console.log('take segs [t,pitch,dB]:', JSON.stringify(segs));
  ok(segs.filter(s => s[2] > -40).every(s => Math.abs(s[1] - 330) < 8 || Math.abs(s[1] - 550) < 12), 'take contains the WAV tones (330/550 Hz)');
  ok(segs.every(s => s[2] > -40), 'no silent gaps in take (dropouts)');
  const dur = (c1.audio.out - c1.audio.in), exp = 2 * 4 * 0.5;
  console.log('clip audio in/out', c1.audio.in, c1.audio.out, 'dur', dur.toFixed(3), 'expected ~', exp);
}
// playback of take: launch scene 2, tap output
await p.evaluate(() => { window.__tap(); });
await sleep(1500);
const lv = await p.evaluate(() => window.__lvl()); console.log('output while playing:', JSON.stringify(lv));
console.log('REQS', JSON.stringify(H.reqs.slice(nreq0)), 'before', JSON.stringify(H.reqs.slice(0,nreq0).map(r=>r.u.slice(0,60))));
ok(H.reqs.length === nreq0, 'no network requests during recording (' + (H.reqs.length - nreq0) + ')');
// overdub: second REC on same slot
await p.evaluate(() => SYNQUENZER.selectSlot(0, 2));
const b0 = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
const nb = Math.ceil((b0 + 1) / 4) * 4;
await waitBeat(p, nb - 0.6); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, nb + 8.8); await idle(p);
const c2 = await p.evaluate(t => SYNQUENZER.getClip(t, 2), st);
ok(c2.audio.take !== c1.audio.take && c2.audio.alt && c2.audio.alt[0].take === c1.audio.take, 'overdub new top, old in alt: ' + JSON.stringify({top: c2.audio.take, alt: (c2.audio.alt || []).map(a => a.take)}));
await sleep(500);
const src = await p.evaluate(() => SYNQUENZER.tkInfo().src); console.log('src playing', JSON.stringify(src).slice(0, 300));
await p.evaluate(() => SYNQUENZER.stop());
await p.evaluate(() => SYNQUENZER.undo());
const c3 = await p.evaluate(t => SYNQUENZER.getClip(t, 2), st);
ok(deq(c3, c1), 'undo overdub → clip deep-equal to before');
await p.evaluate(() => SYNQUENZER.undo());
const c4 = await p.evaluate(t => SYNQUENZER.tkInfo().stimme >= 0 ? SYNQUENZER.getClip(t, 2) : 'notrack', st);
console.log('after 2nd undo:', JSON.stringify(c4).slice(0, 200), 'takes', Object.keys(await p.evaluate(() => SYNQUENZER.takes() || {})).length);
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
