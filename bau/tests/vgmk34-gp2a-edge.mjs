// QA G-P2a edge cases: phase continuity after inserting odd-length parts, own clips through insert/copy/×2/move/delete,
// back to scene clip, drag while playing
import {open, OUT, sleep, check, done, eq, diff} from './vgmk34-gp2a-lib.mjs';
const T = await open({mic: false}); const {p, E, errs} = T;
const SETUP = () => {
  const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); Q.setMetronome(false);
  const K = {root: 0, scale: 'ionian'}, N = (t, n, d) => ({t, d: d || .5, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 48)]});
  Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 50)]});
  Q.setClip(1, 0, {len: 4, key: K, notes: [N(0, 70), N(4, 71), N(8, 72), N(12, 73)]});
  Q.setClip(2, 0, {len: 2, key: K, notes: [N(0, 60), N(4, 62)]});
  const nt = Q.tracks().length;
  const L = s => Array.from({length: nt}, (_, t) => [{bar: 0, slot: s[t] == null ? -1 : s[t]}]);
  Q.setPart(0, {name: 'Strophe', lanes: L([0, 0, 0]), len: 4, src: 'fang'});
  Q.setPart(1, {name: 'Bridge', lanes: L([1]), len: 3, src: 'fang'});
  Q.setSong({bars: 0, lanes: Array.from({length: nt}, () => []), carrier: [], marks: []});
  Q.placePart(0, 0);
  Q.clearLog(); return {nt, tracks: Q.tracks().map(t => t.name || t.kind)};
};
const playLog = async (upTo) => { await E(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); }); await p.waitForFunction(v => { const s = SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, upTo, {timeout: 60000, polling: 5}); const l = await E(() => SYNQUENZER.noteLog(3000)); await E(() => SYNQUENZER.songPlay(false)); await sleep(200); return l; };
const byBar = (log, t, bars) => { const out = []; for (let b = 0; b < bars; b++) out.push(log.filter(n => n.track === t && n.beat >= b * 4 - .01 && n.beat < b * 4 + 3.99).map(n => n.clipNote + (n.src === 'own' ? 'o' : '')).join(',')); return out; };
console.log('setup', JSON.stringify(await E(SETUP)));
let s = await E(() => SYNQUENZER.song()); console.log('song', s.bars, JSON.stringify(s.lanes), JSON.stringify(s.marks));
let log = await playLog(15.5);
console.log('A only  S1', byBar(log, 0, 4), 'S2', byBar(log, 1, 4), 'S3', byBar(log, 2, 4));
// E1 insert the 3-bar Bridge at bar line 3 (index 2)
await E(() => SYNQUENZER.placePart(1, 2, 'insert'));
s = await E(() => SYNQUENZER.song()); console.log('after insert', s.bars, JSON.stringify(s.lanes), JSON.stringify(s.marks));
log = await playLog(27.5);
const s1 = byBar(log, 0, 7), s2 = byBar(log, 1, 7), s3 = byBar(log, 2, 7);
console.log('S1', s1, 'S2', s2, 'S3', s3);
check('E1 ungerader Teil (3 Takte) mitten in Strophe eingefügt: Fortsetzung T6–7 phasengleich (2-Takt-Clip 60,62; 4-Takt-Clip 72,73)', eq(s3.slice(5), ['60', '62']) && eq(s2.slice(5), ['72', '73']) && eq(s1, ['48', '48', '50', '50', '50', '48', '48']) && eq(s3.slice(0, 2), ['60', '62']), {s1, s2, s3});

// E2 own clip over a 2-bar run, insert in the middle of the run
await E(SETUP);
const o = await E(() => SYNQUENZER.makeOwn(2, 2));
s = await E(() => SYNQUENZER.song()); console.log('makeOwn', JSON.stringify(o), JSON.stringify(s.lanes[2]), Object.keys(s.own || {}));
await E(() => SYNQUENZER.placePart(1, 3, 'insert'));
s = await E(() => SYNQUENZER.song()); console.log('after insert', s.bars, JSON.stringify(s.lanes[2]), Object.keys(s.own || {}));
log = await playLog(27.5);
const e2 = byBar(log, 2, 7);
check('E2 Einfügen mitten in einen eigenen 2-Takt-Durchlauf: davor 60o, danach 62o (eigener Clip phasengleich weiter)', eq(e2, ['60', '62', '60o', '', '', '', '62o']), e2);
// E3 ×2 of the mark with the own clip: copy carries the own clip with a NEW id
await E(SETUP);
await E(() => SYNQUENZER.makeOwn(2, 2));
const M = await E(() => SYNQUENZER.song().marks[0].id);
await E(id => SYNQUENZER.markAction(id, 'rep', 2), M);
s = await E(() => SYNQUENZER.song());
const ownIds = s.lanes[2].filter(e => e.own).map(e => e.bar + ':' + e.own);
console.log('×2 lanes[2]', JSON.stringify(s.lanes[2]), 'own keys', Object.keys(s.own || {}));
check('E3 ×2: Kopie trägt den eigenen Clip mit neuer ID', ownIds.length === 2 && new Set(ownIds.map(x => x.split(':')[1])).size === 2 && Object.keys(s.own).length === 2, ownIds);
log = await playLog(31.5);
const e3 = byBar(log, 2, 8);
check('E3 ×2 hörbar: T3–4 und T7–8 eigener Clip, sonst Szenen-Clip', eq(e3, ['60', '62', '60o', '62o', '60', '62', '60o', '62o']), e3);
// E4 delete the copy: no orphan own clips; undo restores
const M2 = await E(() => SYNQUENZER.song().marks.sort((a, b) => a.a - b.a)[1].id);
const before4 = await T.full();
await E(id => SYNQUENZER.markAction(id, 'delete'), M2);
s = await E(() => SYNQUENZER.song());
const used = new Set(s.lanes.flat().filter(e => e.own).map(e => e.own));
check('E4 Marke mit eigenem Clip löschen: keine verwaisten eigenen Clips', Object.keys(s.own || {}).every(k => used.has(k)), {own: Object.keys(s.own || {}), used: [...used]});
await E(() => SYNQUENZER.undo()); await sleep(100);
check('E4 Undo → deep-equal', (await T.full()) === before4);
// E4b move the mark with the own clip behind the other one (API move)
const M1 = await E(() => SYNQUENZER.song().marks.sort((a, b) => a.a - b.a)[0].id);
await E(id => SYNQUENZER.markAction(id, 'move', 8), M1);
log = await playLog(31.5);
const e4b = byBar(log, 2, 8);
check('E4b Marke verschieben: eigener Clip wandert mit (T7–8 → 60o,62o; T3–4 → 60o,62o der anderen Kopie)', eq(e4b, ['60', '62', '60o', '62o', '60', '62', '60o', '62o']), e4b);
s = await E(() => SYNQUENZER.song());
const used2 = new Set(s.lanes.flat().filter(e => e.own).map(e => e.own));
check('E4b nach Verschieben: keine verwaisten eigenen Clips, 2 eigene Clips', Object.keys(s.own || {}).length === 2 && Object.keys(s.own).every(k => used2.has(k)), {own: Object.keys(s.own || {}), used: [...used2]});
done();
await T.br.close();
