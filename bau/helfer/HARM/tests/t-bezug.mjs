// HARM-T5: chromatische Durchgänge stufen den Clip-Bezug nicht mehr um (Ursache „Läufe klingen manchmal fremd“);
// Gegenproben: ein echtes Lydisch / e-Moll wird weiter erkannt; derselbe Lauf klingt in jedem Durchlauf gleich
import { open, mkCheck, APP } from './lib.mjs';
const file = process.argv[2] || APP;
const {check, done} = mkCheck('HARM-T5 Bezug');
const {b, p, errs} = await open(file);
const N = (t, n, d) => ({t, d: d || .4, n, v: .8});
const keyAfter = (notes, pk) => p.evaluate(async ([notes, pk]) => { const Q = window.SYNQUENZER; Q.newProject({init: true}); if (pk) setProjectKey(pk);
  Q.setClip(0, 0, {len: 1, key: {root: (pk || S.key).root, scale: (pk || S.key).scale}, notes}); await new Promise(r => setTimeout(r, 800)); applySceneKeys(0); const k = S.tracks[0].clips[0].key; return k.root + ' ' + k.scale; }, [notes, pk]);
const RUN = [N(0, 60), N(.5, 62), N(1, 64), N(1.5, 65), N(2, 66, .9), N(3, 67), N(3.5, 69)];   // C D E F F♯(lang) G A
check('C-Dur-Lauf mit langem Durchgang F → F♯ → G: Bezug bleibt C-Dur (vorher C-Lydisch)', await keyAfter(RUN) === '0 ionian', await keyAfter(RUN));
const DESC = [N(0, 69), N(.5, 67), N(1, 66, .9), N(2, 65), N(2.5, 64), N(3, 62), N(3.5, 60)];   // A G F♯ F E D C abwärts
// abwärts beginnt der Lauf auf A: den Grundton rät die Analyse wie bisher (A → a-Moll); entscheidend ist der Tonvorrat
const desc = await keyAfter(DESC), dset = await p.evaluate(k => { const [r, sc] = k.split(' '); return Harmony.SCALES[sc].map(x => (x + +r) % 12).sort((a, b) => a - b).join(','); }, desc);
check('abwärts G → F♯ → F: Bezug hat den Tonvorrat von C-Dur (kein F♯; vorher a-Dorisch mit F♯)', dset === '0,2,4,5,7,9,11', desc + ' = ' + dset);
const AM = [N(0, 57), N(.5, 59), N(1, 60), N(1.5, 62), N(2, 63, .9), N(3, 64), N(3.5, 65)];      // A H C D D♯ E F in a-Moll
check('a-Moll-Lauf mit Durchgang D → D♯ → E: Bezug bleibt a-Moll', await keyAfter(AM, {root: 9, scale: 'aeolian'}) === '9 aeolian', await keyAfter(AM, {root: 9, scale: 'aeolian'}));
const LYD = [N(0, 60), N(.5, 62), N(1, 64), N(1.5, 66, .9), N(2.5, 67), N(3, 69), N(3.5, 71)];  // C D E F♯ G A H (kein F)
check('Gegenprobe: echtes C-Lydisch (F♯ statt F, kein Durchgang) bleibt Lydisch', await keyAfter(LYD) === '0 lydian', await keyAfter(LYD));
const EM = [64, 66, 67, 69, 71, 72, 74].map((n, i) => N(i * .5, n));                         // e-Moll im C-Projekt
const em = await keyAfter(EM);
check('Gegenprobe: e-Moll-Lauf (F♯ ist Leiterton, kein Durchgang) – Bezug enthält F♯ (wie vorher)', /^(4 aeolian|7 ionian|7 mixolydian|4 dorian|0 lydian)$/.test(em), em);
// derselbe Lauf unter E in drei Song-Durchläufen (vor/nach der Analyse, mit eigenem Clip) gleich
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); Q.newProject({init: true}); Q.setBpm(240);
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [[0, 60, .4], [.5, 62, .4], [1, 64, .4], [1.5, 65, .4], [2, 66, .9], [3, 67, .4], [3.5, 69, .4]].map(([t, n, d]) => ({t, d, n, v: .8}))});
  const nt = Q.tracks().length, C = n => Q.parseChord(n);
  Q.setPart(0, {name: 'Strophe', lanes: Array.from({length: nt}, (_, t) => [{bar: 0, slot: t === 0 ? 0 : -1}]), len: 4, src: 'fang', chords: {len: 4, ch: [{b: 0, tg: C('C')}, {b: 4, tg: C('E')}, {b: 8, tg: C('Bb')}, {b: 12, tg: C('Dm')}]}});
  Q.setSong({bars: 0, lanes: Array.from({length: nt}, () => []), carrier: [], marks: []}); Q.placePart(0, 0);
  const play = async () => { Q.clearLog(); Q.songPlay(0); await sl(4200); const l = Q.noteLog(3000).filter(e => e.track === 0 && e.beat >= 4 && e.beat < 8).sort((a, b) => a.beat - b.beat); Q.songPlay(false); Q.stop(); await sl(600); return l.map(e => e.out).join(','); };
  const a = await play(); Q.makeOwn(0, 1); const b2 = await play(); Q.dropOwn(0, 1); const c = await play();
  return {a, b: b2, c};
});
check('C D E F F♯ G A unter E: drei Durchläufe gleich und Grundton C → E (nicht D♯)', r.a === r.b && r.b === r.c && r.a.startsWith('64,'), r);
check('keine Fehler auf der Seite', errs.length === 0, errs.slice(0, 3));
await b.close(); done();
