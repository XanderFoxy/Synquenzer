// HARM-T2: Wechsel genau am Taktstrich (Noten-Log-Zeiten) – Tastatur, MIDI-Eingang, Szenen-, Clip-, Teil-Wechsel (Teile-Leiste,
// Teil-Akkordzeile), ▶ Ab hier; keine hängenden und keine doppelten Noten am Wechsel; ein Lauf bleibt bis zum Taktstrich in seiner Skala
import { open, mkCheck, APP } from './lib.mjs';
import { SONG_JS, FAELLE } from './pruefsong.mjs';
import { LIVE_JS, KEYS } from './live.mjs';
const file = process.argv[2] || APP;
const {check, done} = mkCheck('HARM-T2 Wechsel');
const {b, p, errs} = await open(file);
await p.evaluate(SONG_JS); await p.evaluate(LIVE_JS);
const PC = n => ((n % 12) + 12) % 12, onBar = x => x != null && Math.abs(x / 4 - Math.round(x / 4)) < 1e-3;
const F = FAELLE['A-Moll i–VI–III–VII / i–VI–iv–V'];
const zOf = names => p.evaluate(([k, ns]) => ns.map(x => Harmony.oneScale(window.SYNQUENZER.parseChord(x), k, S.settings.harmony.mode, hopts())), [F.key, names]);
const dupes = log => { const m = new Map(); let d = []; for (const e of log) { if (e.beat == null) continue; const k = e.track + '@' + e.beat.toFixed(3) + '#' + e.clipNote; if (m.has(k)) d.push([e.track, e.beat, m.get(k), e.out]); m.set(k, e.out); } return d; };
// stuck: voices still alive although their end is long gone (in the page, while playing)
await p.evaluate(() => { window.__stuck = () => { const t = nowT(); return VOICES.filter(v => !v.dead && isFinite(v.end) && v.end < t - .4).length; }; });

// 1) Tastatur + MIDI, Drücke mitten im Takt und knapp nach dem Taktstrich (Gnadenzeit), Standard-Werte
await p.evaluate(([k, c]) => { __harmSong(k, c, {}); window.SYNQUENZER.setSong(null); }, [F.key, F.chords]);
await p.evaluate(() => __harmSettle());
const pr = [{beat: 1.4, chord: 'F'}, {beat: 6.9, chord: 'C', midi: true}, {beat: 8.05, chord: 'E'}, {beat: 13.5, chord: 'Dm', midi: true}, {beat: 15.97, chord: 'G'}, {beat: 21.2, chord: 'Am'}].map(x => ({...x, keys: KEYS[x.chord]}));
const r = await p.evaluate(([pr]) => __harmLive(pr, {until: 30}), [pr]);
const ent = r.presses.map(x => x.entry && x.entry.beat != null ? +x.entry.beat.toFixed(4) : null);
check('Tastatur/MIDI: jeder Akkord-Wechsel liegt genau auf einem Taktstrich', ent.every(onBar), ent);
check('Tastatur/MIDI: Wechsel am NÄCHSTEN Taktstrich (Druck 1,4 → 4; 6,9 → 8; 13,5 → 16; 21,2 → 24)', ent[0] === 4 && ent[1] === 8 && ent[3] === 16 && ent[5] === 24, ent);
check('Gnadenzeit: knapp nach dem Taktstrich gedrückt (8,05) zählt für diesen Takt', ent[2] === 8 || ent[2] === 12, ent[2]);
const Z = await zOf(r.presses.map(x => x.chord));
const syn = r.log.filter(e => e.src === 'clip' && e.track !== 4 && e.beat != null);
// the last beat before each change: still the OLD Träger's scale (the run stays in its scale up to the bar line)
let bad = [];
for (let k = 1; k < ent.length; k++) { if (ent[k] == null || ent[k - 1] == null || ent[k] === ent[k - 1]) continue;
  const prevZ = Z[r.presses.findLastIndex((x, j) => j < k && ent[j] < ent[k])];
  for (const e of syn) if (e.beat >= ent[k] - 1 - 1e-6 && e.beat < ent[k] - 1e-6 && prevZ && !prevZ.includes(PC(e.out))) bad.push([ent[k], e.beat, e.out]); }
check('ein laufender Lauf bleibt bis zum Taktstrich in seiner Skala (letzter Schlag vor jedem Wechsel)', bad.length === 0, bad.slice(0, 5));
check('keine doppelten Noten am Wechsel (Spur, Zeit, Clip-Note einmal)', dupes(syn).length === 0, dupes(syn).slice(0, 4));
check('keine hängenden Noten: nach Stopp keine Stimme mehr', r.voices === 0, r.voices);

// 2) Szenen-, Clip-, Teil-Wechsel mitten im Takt -> am nächsten Taktstrich, keine hängenden Noten
const res = await p.evaluate(async ([k]) => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), bn = () => t2b(nowT()), out = {};
  const C = n => Q.parseChord(n);
  // scene 1: other clips (low notes 40..47) – so the log tells which clip played
  Q.setClip(0, 1, {len: 1, key: {root: k.root, scale: k.scale}, notes: [0, 1, 2, 3].map(t => ({t, d: .4, n: 40 + t * 2, v: .8}))});
  Q.setClip(1, 1, {len: 1, key: {root: k.root, scale: k.scale}, notes: [0, 2].map(t => ({t, d: .8, n: 45, v: .8}))});
  Q.setPart(0, {name: 'Teil A', slots: [{s: 1}, {s: 1}, -1, -1, {s: 0}, -1], chords: {len: 4, ch: [{b: 0, tg: C('F')}, {b: 4, tg: C('G')}, {b: 8, tg: C('E')}, {b: 12, tg: C('Am')}]}});
  const wait = async x => { while (bn() < x) await sl(4); };
  Q.play(); Q.launchScene(0); await sl(100); Q.clearLog();
  await wait(2.5); out.sceneAt = +bn().toFixed(2); Q.launchScene(1);
  await wait(5.3); out.st1 = __stuck();
  await wait(6.6); out.clipAt = +bn().toFixed(2); Q.tapSlot(0, 0);           // Clip-Wechsel Spur 1: Szene 2 → Szene 1
  await wait(9.2); out.partAt = +bn().toFixed(2); Q.launchPart(0);           // Teile-Leiste: Teil A mitten im Takt
  await wait(17.5); out.st2 = __stuck();
  out.log = Q.noteLog(4096).filter(e => e.src === 'clip' || e.src === 'own'); out.tl = Q.timeline().map(e => ({beat: e.beat, name: e.name}));
  Q.stop(); await sl(900); out.voices = VOICES.filter(v => !v.dead).length;
  return out;
}, [F.key]);
const t0 = res.log.filter(e => e.track === 0);
const firstLow = t0.find(e => e.clipNote < 50), lastHigh0 = t0.filter(e => e.clipNote >= 50 && e.beat < 6).pop();
check('Szenen-Wechsel (gedrückt ' + res.sceneAt + '): neue Szene beginnt genau am nächsten Taktstrich (4)', firstLow && firstLow.beat === 4, firstLow && firstLow.beat);
check('Szenen-Wechsel: der alte Clip spielt bis zum Taktstrich, danach nichts mehr', lastHigh0 && lastHigh0.beat < 4, lastHigh0 && lastHigh0.beat);
const backHigh = t0.find(e => e.clipNote >= 50 && e.beat > 6);
check('Clip-Wechsel (gedrückt ' + res.clipAt + '): Clip startet am nächsten Taktstrich (8)', backHigh && backHigh.beat === 8, backHigh && backHigh.beat);
const tl = res.tl.filter(e => e.beat != null && e.beat > 9);
check('Teil-Wechsel (Teile-Leiste, gedrückt ' + res.partAt + '): Teil + seine Akkordzeile beginnen am Taktstrich 12', tl.length >= 2 && tl[0].beat === 12 && tl.every(e => onBar(e.beat)), tl);
const partLow = t0.find(e => e.clipNote < 50 && e.beat > 9);
check('Teil-Wechsel: die Clips des Teils beginnen am Taktstrich 12', partLow && partLow.beat === 12, partLow && partLow.beat);
check('keine hängenden Noten beim Szenen-/Teil-Wechsel (laufend und nach Stopp)', res.st1 === 0 && res.st2 === 0 && res.voices === 0, [res.st1, res.st2, res.voices]);
check('keine doppelten Noten bei Szenen-/Clip-/Teil-Wechsel', dupes(res.log).length === 0, dupes(res.log).slice(0, 4));

// 3) ▶ Ab hier (Song ab Takt 3) – die Akkordzeile gilt vom ersten Ton an, Wechsel auf Taktstrichen
await p.evaluate(([k, c]) => __harmSong(k, c, {}), [F.key, F.chords]);
await p.evaluate(() => __harmSettle());
const ab = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); Q.clearLog(); Q.songPlay(2); await sl(3200);
  const l = Q.noteLog(4096).filter(e => e.src === 'clip' && e.track !== 4), tl = Q.timeline().map(e => ({beat: e.beat, name: e.name})); const off = R.songPlay ? R.songPlay.off : 0; Q.stop(); await sl(800);
  return {l, tl, off, voices: VOICES.filter(v => !v.dead).length}; });
const ZS = await zOf(F.chords);
const abBad = ab.l.filter(e => { const sb = e.beat - ab.off, bar = Math.floor(sb / 4 + 1e-6); return !ZS[bar] || !ZS[bar].includes(PC(e.out)); });
check('▶ Ab hier (Takt 3): erster Ton am Taktstrich, jede Note in der Skala ihres Song-Takts', ab.l.length > 40 && onBar(ab.l[0].beat - ab.off) && abBad.length === 0, {n: ab.l.length, first: ab.l[0] && ab.l[0].beat - ab.off, bad: abBad.slice(0, 3)});
check('▶ Ab hier: Träger-Wechsel nur auf Taktstrichen', ab.tl.filter(e => e.beat != null).every(e => onBar(e.beat - ab.off)), ab.tl);
check('▶ Ab hier: keine hängenden Noten nach Stopp', ab.voices === 0, ab.voices);
check('keine Fehler auf der Seite', errs.length === 0, errs.slice(0, 3));
await b.close(); done();
