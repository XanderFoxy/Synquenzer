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
await E(() => { SYNQUENZER.makeOwn(0, 1); SYNQUENZER.makeOwn(0, 2); }); await sleep(900);
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
const ownE = perBar(1).map(n => n.out); console.log("KEYS", JSON.stringify(await E(() => { const pr = SYNQUENZER.project(); const P = pr.project || pr; return [P.tracks[0].clips[0].key, Object.fromEntries(Object.entries(P.song.own || {}).map(([k, c]) => [k, c.key]))]; })));
await E(() => SYNQUENZER.dropOwn(0, 1));
log = await playLog(15.6);
const sceneE = perBar(1).map(n => n.out);
check('OS2 eigener Clip klingt unter E genau wie der Szenen-Clip (gleiche Abbildung)', eq(ownE, sceneE), {ownE, sceneE});
// NOTEN into an own clip under E with Eine Skala: 12 chromatic notes 64..75 in bar 2 (overdub), then playback
await E(() => { SYNQUENZER.songRecRange(1, 1, 'overdub', {clips: false, chords: false, notes: true}, {track: 0, preroll: false}); });
await p.waitForFunction(() => SYNQUENZER.runtime().song.rec, null, {timeout: 10000}).catch(() => 0);
const played = [];
for (let k = 0; k < 12; k++) { await p.waitForFunction(v => SYNQUENZER.runtime().song.beat >= v, 4 + k * .25 + .02, {timeout: 20000, polling: 3}); await E(n => SYNQUENZER.keyOn(n, .8, 'c' + n), 64 + k); played.push(64 + k); await sleep(60); await E(n => SYNQUENZER.keyOff(n, 'c' + n), 64 + k); }
// what was heard live during the take
await p.waitForFunction(() => !SYNQUENZER.runtime().song.rec, null, {timeout: 20000}).catch(() => 0);
const liveHeard = await E(() => SYNQUENZER.noteLog(400).filter(n => n.src === 'live' || n.src === 'kb').map(n => n.out));
await E(() => SYNQUENZER.songPlay(false)); await sleep(300);
log = await playLog(15.6);
const rec = perBar(1).filter(n => n.beat >= 4 && n.beat < 7.1 && Math.abs(((n.beat - 4) * 4) - Math.round((n.beat - 4) * 4)) < .2 && n.src === 'own');
const recOut = rec.map(n => [+(n.beat - 4).toFixed(2), n.clipNote, n.out]);
console.log('played', played.join(','), '\nback  ', JSON.stringify(recOut), '\nlive heard', JSON.stringify(liveHeard.slice(-14)));
const scE = pcs(scales[1]);
const inScaleBack = played.map((n, k) => { const r = rec.find(x => Math.abs(x.beat - (4 + k * .25)) < .1 && !perBar(1).some(y => y !== x && false)); return r ? r.out : null; });
const mism = played.map((n, k) => ({n, back: inScaleBack[k], ins: scE.includes(n % 12)})).filter(x => x.ins && x.back !== x.n);
check('OS3 NOTEN unter E mit Eine Skala: leitereigene gespielte Töne klingen beim Abspielen wie gespielt', mism.length === 0, mism);
const off = played.map((n, k) => ({n, back: inScaleBack[k], ins: scE.includes(n % 12)})).filter(x => !x.ins);
check('OS3 leiterfremde gespielte Töne rasten auf einen Skalenton (≤ 1 Halbton)', off.every(x => x.back != null && scE.includes(((x.back % 12) + 12) % 12) && Math.abs(x.back - x.n) <= 1), off);
// menu → Harmonie by touch: Eine Skala Aus → the F♯ of the scene clip under C sounds again
await T.tapSel('#bMenu').catch(() => 0);
let menuOpen = await E(() => !!document.querySelector('.mos'));
if (!menuOpen) { const mb = await T.rectText('button', /^≡$/); if (mb) await T.tap(mb.cx, mb.cy, 400); menuOpen = await E(() => !!document.querySelector('.mos')); }
console.log('menu open', menuOpen);
const segAus = await E(() => { const r = document.querySelector('.mos'); if (!r) return null; const b = [...r.querySelectorAll('button')].find(b => b.textContent.trim() === 'Aus'); if (!b) return null; b.scrollIntoView({block: 'center'}); const q = b.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2}; });
if (segAus) { await sleep(300); const q = await E(() => { const b = [...document.querySelector('.mos').querySelectorAll('button')].find(b => b.textContent.trim() === 'Aus'); const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }); await T.tap(q.x, q.y, 300); }
check('OS4 Menü → Harmonie → Eine Skala [Aus] per Tipp', (await E(() => SYNQUENZER.runtime().harmony.oneScale)) === false, segAus);
await E(() => SYNQUENZER.closeMenu()); await sleep(200);
log = await playLog(3.6);
check('OS4 aus: F♯ des Szenen-Clips unter C klingt wieder (66)', perBar(0).some(n => n.out === 66), perBar(0).map(n => n.out));
// save/load: oneScale settings + own clips survive
await E(() => SYNQUENZER.setHarmony({oneScale: true, osAmt: .7, osPass: true, osRef: 'auto', drums: true}));
await E(() => SYNQUENZER.setTrackScale(1, false));
const ser = await E(() => SYNQUENZER.serialize());
const H1 = await E(() => SYNQUENZER.runtime().harmony), F1 = await T.full();
await E(() => SYNQUENZER.newProject({init: true})); await sleep(200);
await E(s => SYNQUENZER.importJSON(typeof s === 'string' ? s : JSON.stringify(s)), ser); await sleep(300);
const H2 = await E(() => SYNQUENZER.runtime().harmony), F2 = await T.full();
const strip = j => { const o = JSON.parse(j); delete o.id; delete o.name; return JSON.stringify(o); };
check('OS5 Speichern/Laden: Harmonie-Einstellungen (Eine Skala, Stärke, Durchgang, Bezug, Drums, Spur-Schalter) und eigene Clips gleich', eq(H1, H2) && strip(F1) === strip(F2), {H1, H2});
check('OS 0 Konsolenfehler', errs.length === 0, errs);
done();
await T.br.close();
