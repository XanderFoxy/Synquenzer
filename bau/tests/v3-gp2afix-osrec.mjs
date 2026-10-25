// G-P2a-fix: only the played notes that fit into the 1-bar take are compared — QA G-P2a repro: NOTEN recorded into an own clip under a Träger — played (in-scale) notes must come back as played,
// with „Eine Skala“ an and aus
import {open, OUT, sleep, check, done, eq} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false}); const {p, E, errs} = T;
const chord = process.argv[2] || 'E';
async function run(os, played) {
  await E(([os, chord]) => {
    const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setMetronome(false);
    Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .4, n: 48, v: .8}]});
    const nt = Q.tracks().length, L = s => Array.from({length: nt}, (_, t) => [{bar: 0, slot: s[t] == null ? -1 : s[t]}]);
    Q.setPart(0, {name: 'Strophe', lanes: L([0]), len: 2, src: 'fang', chords: {len: 2, ch: [{b: 0, tg: Q.parseChord(chord)}]}});
    Q.setSong({bars: 0, lanes: Array.from({length: nt}, () => []), carrier: [], marks: []});
    Q.placePart(0, 0); Q.selectTrack(0); Q.setKbMode('play'); Q.setHarmony({oneScale: os});
    Q.songRecRange(0, 0, 'overdub', {clips: false, chords: false, notes: true}, {track: 0, preroll: false});
    return 1;
  }, [os, chord]);
  await p.waitForFunction(() => SYNQUENZER.runtime().song.rec, null, {timeout: 10000}).catch(() => 0);
  for (let k = 0; k < played.length; k++) { await p.waitForFunction(v => SYNQUENZER.runtime().song.beat >= v, .5 + k * .75, {timeout: 20000, polling: 3}); await E(n => SYNQUENZER.keyOn(n, .8, 'r' + n), played[k]); await sleep(120); await E(n => SYNQUENZER.keyOff(n, 'r' + n), played[k]); }
  await p.waitForFunction(() => !SYNQUENZER.runtime().song.rec, null, {timeout: 20000}).catch(() => 0);
  await E(() => SYNQUENZER.songPlay(false)); await sleep(300);
  const own = await E(() => SYNQUENZER.ownClip(0, 0));
  await E(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); });
  await p.waitForFunction(() => { const s = SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 3.9; }, null, {timeout: 20000, polling: 5});
  const log = await E(() => SYNQUENZER.noteLog(200).filter(n => n.track === 0 && n.beat > .3 && n.beat < 4));
  await E(() => SYNQUENZER.songPlay(false)); await sleep(200);
  return {stored: own && own.notes.filter(n => n.t > .3).map(n => n.n), back: log.map(n => n.out), src: [...new Set(log.map(n => n.src))]};
}
const scale = await E(c => SYNQUENZER.oneScaleOf(SYNQUENZER.parseChord(c)), chord);
const inSc = [64, 66, 68, 69, 71, 73, 75, 76].filter(n => scale.includes(n % 12));
console.log('chord', chord, 'scale', JSON.stringify(scale), 'played (in-scale)', inSc.join(','));
const off = await run(false, inSc); console.log('Eine Skala aus', JSON.stringify(off));
const on = await run(true, inSc); console.log('Eine Skala an ', JSON.stringify(on));
check(`R1 ${chord}, Eine Skala aus: gespielte Töne klingen beim Abspielen wie gespielt`, eq(off.back, inSc.slice(0, off.back.length)) && off.back.length >= 5, off);
check(`R2 ${chord}, Eine Skala an: leitereigene gespielte Töne klingen beim Abspielen wie gespielt`, eq(on.back, inSc.slice(0, on.back.length)) && on.back.length >= 5, on);
check('0 Konsolenfehler', errs.length === 0, errs);
done(); await T.br.close();
