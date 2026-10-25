// QA G-P2a × V2c′: „Eine Skala“ in the song: own clips and unfolded parts follow the one scale; NOTEN recorded into an own clip
// under a Träger sound as played (in-scale) / snap (out-of-scale) on playback; menu → Harmonie toggles by touch; save/load
import {open, OUT, sleep, check, done, eq} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false}); const {p, E, errs} = T;
await E(() => {
  const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setMetronome(false);
  const K = {root: 0, scale: 'ionian'};
  // Synth 1 Sz1: C major run with one chromatic F♯ (66) — 1 bar
  Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 60, v: .8}, {t: .5, d: .4, n: 62, v: .8}, {t: 1, d: .4, n: 64, v: .8}, {t: 1.5, d: .4, n: 65, v: .8}, {t: 2, d: .9, n: 66, v: .8}, {t: 3, d: .4, n: 67, v: .8}, {t: 3.5, d: .4, n: 69, v: .8}]});
  const nt = Q.tracks().length, L = s => Array.from({length: nt}, (_, t) => [{bar: 0, slot: s[t] == null ? -1 : s[t]}]);
  const C = n => Q.parseChord(n);
  Q.setPart(0, {name: 'Strophe', lanes: L([0]), len: 4, src: 'fang', chords: {len: 4, ch: [{b: 0, tg: C('C')}, {b: 4, tg: C('E')}, {b: 8, tg: C('Bb')}, {b: 12, tg: C('Dm')}]}});
  Q.setSong({bars: 0, lanes: Array.from({length: nt}, () => []), carrier: [], marks: []});
  Q.placePart(0, 0); Q.selectTrack(0); Q.setKbMode('play');
  return 1;
});
const h0 = await E(() => SYNQUENZER.runtime().harmony);
check('OS0 neues Projekt: Eine Skala an (Standard)', h0.oneScale === true, h0);
// make bar 2 (E) and bar 3 (B♭) own clips
await E(() => { SYNQUENZER.makeOwn(0, 1); SYNQUENZER.makeOwn(0, 2); });
const playLog = async (upTo) => { await E(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); }); await p.waitForFunction(v => { const s = SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, upTo, {timeout: 60000, polling: 5}); const l = await E(() => SYNQUENZER.noteLog(3000)); await E(() => SYNQUENZER.songPlay(false)); await sleep(200); return l.filter(n => n.track === 0); };
let log = await playLog(15.6);
const scales = await E(() => ['C', 'E', 'Bb', 'Dm'].map(c => SYNQUENZER.oneScaleOf(SYNQUENZER.parseChord(c))));
console.log('scales', JSON.stringify(scales));
const pcs = sc => (sc && (sc.pcs || sc.pc || sc)) || [];
const perBar = b => log.filter(n => n.beat >= b * 4 - .01 && n.beat < b * 4 + 3.99);
const inSc = (n, b) => { const s = pcs(scales[b]); return Array.isArray(s) ? s.includes(((n % 12) + 12) % 12) : null; };
for (let b = 0; b < 4; b++) { const ns = perBar(b); console.log('bar', b + 1, ns.map(n => n.src[0] + n.clipNote + '>' + n.out + (inSc(n.out, b) === false ? '!' : '')).join(' ')); }
const outBad = []; for (let b = 0; b < 4; b++) for (const n of perBar(b)) if (inSc(n.out, b) === false) outBad.push(`T${b + 1} ${n.src} ${n.clipNote}>${n.out}`);
check('OS1 Eine Skala an: Szenen-Clips UND eigene Clips klingen in jedem Takt nur in der Skala des Trägers', outBad.length === 0 && perBar(1).every(n => n.src === 'own') && perBar(2).every(n => n.src === 'own'), outBad);
const distinct = [0, 1, 2, 3].map(b => new Set(perBar(b).map(n => n.out)).size);
check('OS1 7 verschiedene Töne bleiben 7 (Szenen-Clip und eigene Clips)', distinct.every(d => d === 7), distinct);
// same pitches own vs scene clip: own clip T2 must sound exactly like the scene clip under E would
const ownE = perBar(1).map(n => n.out);
await E(() => SYNQUENZER.dropOwn(0, 1));
log = await playLog(15.6);
const sceneE = perBar(1).map(n => n.out);

const r = await E(() => { try {
  const tr = S.tracks[0], c = tr.clips[0], h = S.settings.harmony;
  const st = osStats(c); let eE = null; for (const [e] of st.maps) if (e.target && e.target.name === 'E') eE = e;
  const Z = Harmony.oneScale(eE.target, osBase(0), h.mode, hopts());
  const items = st.P.map(p => { const r = st.info.get(p); return {p, q: T.mapEvent(p, 0, {kind: 'synth', follow: true}, {key: c.key}, eE), dir: r.up > r.dn ? 1 : r.dn > r.up ? -1 : 0, dur: r.dur, pass: r.pass}; });
  return {Z, key: c.key, items, out: Harmony.oneScaleMap(items, Z, {amt: h.osAmt, pass: h.osPass}), amt: h.osAmt, pass: h.osPass, sh: eE.shift}; } catch (err) { return 'ERR ' + err.message; } });
console.log(JSON.stringify(r));
process.exit(0);
