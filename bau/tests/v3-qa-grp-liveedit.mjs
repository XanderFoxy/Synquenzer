// QA group: edits while a FANG TEIL part loops – chord row of the part changed, clip note changed, part slot changed (Teil-Blatt
// pick) → audible from the next pass / bar, nothing stops, no double notes
import {open, check, done} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const {br, p, errs, E} = await open({mic: false});
await E(() => { SYNQUENZER.setBpm(160); SYNQUENZER.setMetronome(false); SYNQUENZER.launchScene(0); SYNQUENZER.setKbMode('transpose'); });
await E(([seq, b0]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + .03) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 80); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [[57, 53, 48, 55, 57, 53, 48, 55], 4]);
await p.waitForFunction(() => audBeat() >= 36.3, null, {polling: 5});
await E(() => SYNQUENZER.fangTeil({})); await sleep(80); await E(() => SYNQUENZER.fangAccept('part')); await E(() => SYNQUENZER.setKbMode('play'));
// loop runs: take-over at 40 = part bar 2; passes start at 52, 68, 84 …
await p.waitForFunction(() => audBeat() >= 54, null, {polling: 5});
await E(() => SYNQUENZER.setChordRow('P1', {len: 4, ch: [{b: 0, tg: SYNQUENZER.parseChord('Dm')}, {b: 4, tg: SYNQUENZER.parseChord('G')}, {b: 8, tg: SYNQUENZER.parseChord('C')}, {b: 12, tg: SYNQUENZER.parseChord('E')}]}));
await p.waitForFunction(() => audBeat() >= 60.5, null, {polling: 5});
await E(() => { const c = SYNQUENZER.getClip(0, 0); c.notes = c.notes.map(n => ({...n, n: n.n === 36 ? 38 : n.n})); SYNQUENZER.setClip(0, 0, c); });
await E(() => SYNQUENZER.clearLog());
await p.waitForFunction(() => audBeat() >= 84.5, null, {polling: 5});
const log = await E(() => SYNQUENZER.noteLog(4096).filter(n => n.beat != null));
const bass = log.filter(n => n.track === 0 && n.beat % 4 < .05 && n.beat >= 60).map(n => [n.beat, n.clipNote, n.out]);
console.log('bass downbeats 60…84', JSON.stringify(bass));
const at = b => bass.find(x => x[0] === b);
check('chord row edit heard from the next pass (beat 68: Dm)', at(68) && at(68)[1] === 38, at(68));
const rt = await E(() => SYNQUENZER.runtime());
check('part still looping, transport on', rt.playing && rt.part && rt.part.i === 0, {playing: rt.playing, part: rt.part});
const seen = new Map(); for (const n of log) { const k = n.track + ':' + n.beat.toFixed(3) + ':' + n.clipNote; seen.set(k, (seen.get(k) || 0) + 1); }
check('no doubled notes', ![...seen.values()].some(v => v > 1), [...seen].filter(([k, v]) => v > 1).slice(0, 5));
// carriers per pass at 68/72/76/80 = Dm G C E (ouptut of clip note 38 = D under C-major clip)
console.log('outs', JSON.stringify([68, 72, 76, 80].map(b => at(b))));
check('no console errors', !errs.length, errs);
await E(() => SYNQUENZER.stop()); await br.close(); done();
