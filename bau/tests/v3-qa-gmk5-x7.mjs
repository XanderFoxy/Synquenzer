// in-page precise: a 3-key chord (keys spread sp ms) pressed d ms around the heard bar line; is step 1 (C) there before the 2nd 16th?
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(t => { const Q = SYNQUENZER; Q.selectTrack(t); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 1); SYNQUENZER.clearClip(t, 0); SYNQUENZER.clearClip(t, 1); }, TR);
await E(() => { window.__sv = []; const o = window.spawnVoice; window.spawnVoice = function (i, n, vel, t, o2) { const v = o.apply(this, arguments); if (o2 && o2.src === 'arp') { const rec = [+t2b(t).toFixed(3), n, +audBeat().toFixed(3), 0]; window.__sv.push(rec); if (v) { const c = v.cancel.bind(v); v.cancel = function () { rec[3] = +audBeat().toFixed(3); return c(); }; } } return v; }; });
await E(() => SYNQUENZER.play()); await sleep(300);
const res = await E(async () => {
  const sl = ms => new Promise(r => setTimeout(r, ms));
  const out = [];
  const spb_ = () => 60 / S.bpm;
  for (const d of [-30, -10, 0, 10, 20, -30, -10, 0, 10, 20, -20, -5, 5, 15, 30, -20, -5, 5, 15, 30]) {
    const B = Math.ceil(audBeat() / 4 + .3) * 4 + 4;
    const tgt = B + d / 1000 / spb_();
    while (audBeat() < tgt - .02) await sl(4);
    while (audBeat() < tgt) {}
    const pb = audBeat();
    SYNQUENZER.keyOn(60, .8, 'a'); const t1 = performance.now(); while (performance.now() - t1 < 15) {} SYNQUENZER.keyOn(64, .8, 'b'); const t2 = performance.now(); while (performance.now() - t2 < 15) {} SYNQUENZER.keyOn(67, .8, 'c');
    while (audBeat() < B + 1.2) await sl(5);
    SYNQUENZER.keyOff(60, 'a'); SYNQUENZER.keyOff(64, 'b'); SYNQUENZER.keyOff(67, 'c');
    while (audBeat() < B + 1.9) await sl(5);
    const L = SYNQUENZER.noteLog(300).filter(e => e.track === 2 && e.src === 'arp' && e.beat > B - .3 && e.beat < B + .6).map(e => [+(e.beat - B).toFixed(3), e.out, e.late ? 'L' : '']);
    const sv = window.__sv.splice(0).filter(x => x[0] > B - .3 && x[0] < B + .6).map(x => [+(x[0] - B).toFixed(3), x[1], +(x[2] - B).toFixed(3), x[3] ? +(x[3] - B).toFixed(3) : 0]);
    out.push({d, pb: +((pb - B) * spb_() * 1000).toFixed(1), first: L.slice(0, 3), sv: sv.slice(0, 6)});
  }
  return out;
});
for (const o of res) log(JSON.stringify(o));
const good = res.filter(o => o.first.length && o.first[0][1] === 60 && o.first[0][0] < .24);
check('chord within ±30 ms of the heard bar line: step 1 (C) sounds before the 2nd sixteenth (' + good.length + '/' + res.length + ')', good.length === res.length, res.filter(o => !good.includes(o)).map(o => [o.d, o.first]));
await E(() => SYNQUENZER.stop());
log('errs', JSON.stringify(errs));
await T.br.close(); done();
