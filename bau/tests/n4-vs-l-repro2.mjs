// VS-L: weitere Nachweise im unveränderten Stand. node n4-vs-l-repro2.mjs <file> <case> [bpm]
import {open, micOn, sleep, sing, playAt, waitBeat, idle, mel16} from './n4-vs-l-h.mjs';
const file = process.argv[2], cs = process.argv[3], BPM = +(process.argv[4] || 120);
const H = await open({file}), p = H.p;
const out = {case: cs, bpm: BPM, ver: await p.evaluate(() => SYNQUENZER.version)};
if (cs === 'len16') {
  out.r = await p.evaluate(() => { SYNQUENZER.setRecOptions({length: 16}); return {st: SYNQUENZER.project().settings.recLength, rt: SYNQUENZER.state().runtime.rec.length}; });
  out.norm = await p.evaluate(() => { const j = JSON.parse(SYNQUENZER.serialize()); j.project.settings.recLength = 16; SYNQUENZER.importJSON(JSON.stringify(j)); return SYNQUENZER.project().settings.recLength; });
} else {
  const sr = await micOn(p);
  await p.evaluate(bpm => { SYNQUENZER.loadDemo(); SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 'auto'}); }, BPM);
  const info = async (scene) => p.evaluate(async s => { const I = SYNQUENZER.tkInfo(), st = I.stimme; const c = st >= 0 ? SYNQUENZER.getClip(st, s) : null, m = SYNQUENZER.getClip(5, s); const tk = c && c.audio ? SYNQUENZER.takes()[c.audio.take] : null;
    return {stLen: c && c.len, audio: c && c.audio && {in: c.audio.in, out: c.audio.out, at: c.audio.at, alt: (c.audio.alt || []).length}, takeSec: tk && +(tk.len / tk.sr).toFixed(2), mel: m && {len: m.len, n: m.notes.length}, last: I.last && {late: I.last.late, pre: I.last.pre}}; }, scene);
  if (cs === 'mel4') {            // Demo, Szene 1: MELODIE-Clip 4 Takte; MELODIE gewählt, ● REC, 16 Takte singen, ●
    await p.evaluate(() => SYNQUENZER.setClip(5, 0, {len: 4, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 8, d: 1, n: 64, v: .8}]}));
    await p.evaluate(() => SYNQUENZER.play());
    await waitBeat(p, 3.5); await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.rec(); });
    const r0 = await p.evaluate(() => SYNQUENZER.state().runtime.rec); out.rec0 = {state: r0.state, start: r0.startBeat};
    await playAt(p, sing(mel16(16), BPM), 4, sr, false);
    await waitBeat(p, 4 + 64 + 0.1); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 4 + 66); await idle(p);
    out.r = await info(0);
  }
  if (cs === 'song16') {          // ● SONG (Überschreiben ab Takt 1) mit 🎤, 16 Takte singen
    await p.evaluate(() => SYNQUENZER.setSong({bars: 16, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}}));
    await p.evaluate(() => SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
    await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
    const off = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
    await playAt(p, sing(mel16(16), BPM), off, sr, false);
    await waitBeat(p, off + 64 + 0.2); await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), off + 64); await idle(p);
    const v = await p.evaluate(() => SYNQUENZER.tkInfo().vox); out.vox = v && v.map(x => ({bar: x.bar, len: x.len, in: x.in, out: x.out}));
    out.last = await p.evaluate(() => SYNQUENZER.tkInfo().last);
  }
}
out.errs = H.errs.slice(0, 3);
console.log(JSON.stringify(out));
await H.br.close();
