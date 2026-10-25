// QA G-P2a repro: „Eine Skala“ on an own clip vs the identical scene clip (same notes, same Träger) — must sound the same
import {open, OUT, sleep, check, done, eq} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false}); const {p, E, errs} = T;
const setup = (notes, chord) => E(([notes, chord]) => {
  const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setMetronome(false);
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes});
  const nt = Q.tracks().length, L = s => Array.from({length: nt}, (_, t) => [{bar: 0, slot: s[t] == null ? -1 : s[t]}]);
  Q.setPart(0, {name: 'Strophe', lanes: L([0]), len: 2, src: 'fang', chords: {len: 2, ch: [{b: 0, tg: Q.parseChord(chord)}]}});
  Q.setSong({bars: 0, lanes: Array.from({length: nt}, () => []), carrier: [], marks: []});
  Q.placePart(0, 0);
  Q.makeOwn(0, 1);                                     // bar 2 = own clip, an unchanged copy of the scene clip
  return {own: !!Q.ownClip(0, 1), h: Q.runtime().harmony.oneScale};
}, [notes, chord]);
const play = async () => { await E(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); }); await p.waitForFunction(() => { const s = SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 7.7; }, null, {timeout: 30000, polling: 5}); const l = await E(() => SYNQUENZER.noteLog(500).filter(n => n.track === 0)); await E(() => SYNQUENZER.songPlay(false)); await sleep(200); const b1 = l.filter(n => n.beat < 3.99).map(n => n.out), b2 = l.filter(n => n.beat >= 3.99 && n.beat < 7.99).map(n => n.out), s2 = [...new Set(l.filter(n => n.beat >= 3.99).map(n => n.src))]; return {scene: b1, own: b2, src2: s2}; };
const N = (arr, d = .4) => arr.map((n, k) => ({t: k * .5, d, n, v: .8}));
// A: C D E F F♯ G A under C (V2c′-fix example)
console.log('A', JSON.stringify(await setup(N([60, 62, 64, 65, 66, 67, 69]), 'C')));
let r = await play(); console.log('A', JSON.stringify(r));
check('A C D E F F♯ G A unter C: eigener Clip (unveränderte Kopie) klingt wie der Szenen-Clip', eq(r.scene, r.own) && eq(r.src2, ['own']), r);
check('A eigener Clip: 7 verschiedene Töne bleiben 7', new Set(r.own).size === 7, r.own);
// B: same under E
await setup(N([60, 62, 64, 65, 66, 67, 69]), 'E'); r = await play(); console.log('B', JSON.stringify(r));
check('B dieselbe Melodie unter E: eigener Clip = Szenen-Clip, 7 verschieden', eq(r.scene, r.own) && new Set(r.own).size === 7, r);
// C: Stärke 0 % → the F♯ (short) stays in the scene clip; own clip?
await setup(N([60, 62, 64, 65, 66, 67, 69], .2), 'C'); await E(() => SYNQUENZER.setHarmony({osAmt: 0}));
r = await play(); console.log('C', JSON.stringify(r));
check('C Stärke 0 %: auch im eigenen Clip bleibt das F♯ (wie im Szenen-Clip)', r.scene.includes(66) && r.own.includes(66), r);
// D: Durchgangstöne erlauben, E–F♯–G (F♯ 1/16 between)
await setup([{t: 0, d: 1, n: 64, v: .8}, {t: 1, d: .25, n: 66, v: .8}, {t: 1.25, d: 1, n: 67, v: .8}], 'C'); await E(() => SYNQUENZER.setHarmony({osPass: true}));
r = await play(); console.log('D', JSON.stringify(r));
check('D Durchgangstöne „Erlauben“: F♯ bleibt auch im eigenen Clip', r.scene.includes(66) && r.own.includes(66), r);
check('0 Konsolenfehler', errs.length === 0, errs);
done(); await T.br.close();
