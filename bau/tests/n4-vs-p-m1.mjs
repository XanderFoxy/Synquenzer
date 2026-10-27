// VS-P Schritt 1 (Ursache): Pegel über den ganzen Weg in der UNVERÄNDERTEN App messen. node n4-vs-p-m1.mjs [app]
import {open, micOn, sleep, waitBeat, idle, voice, b64, BASE} from './n4-vs-p-h.mjs';
const FILE = process.argv[2] || BASE, BPM = 120, SB = 60 / BPM;
const out = {};
// A — Synth-Spuren des Demo-Projekts: Lautheit je Spur am Spur-Ausgang (nach Pegel/Pan, vor Hall/Echo) und Summe am Master
{
  const H = await open({file: FILE}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); });
  await p.evaluate(() => SYNQUENZER.play()); await sleep(600);
  const info = await p.evaluate(() => ({slot: R.slot.slice(), bpm: S.bpm, names: S.tracks.map(t => t.name + '/' + t.sound.engine + '/' + (t.sound.name || t.sound.id || ''))}));
  await p.evaluate(() => { for (let i = 0; i < NT(); i++) if (AU.tracks[i]) window.__cap('t' + i, AU.tracks[i].cut); window.__cap('m', AU.M.ceil); });
  await sleep(17000);
  const st = await p.evaluate(() => { const o = {}; for (let i = 0; i < NT(); i++) if (window.__caps['t' + i]) o['t' + i] = window.__capStat('t' + i, 0.5); o.master = window.__capStat('m', 0.5); return o; });
  out.A = {info, st};
  console.log('A Demo-Projekt', JSON.stringify(info));
  for (const k in st) console.log('  ', k, JSON.stringify(st[k]));
  await H.br.close();
}
// B — Gesang über den echten Weg: Mikro-Attrappe (−36/−28/−20 dBFS RMS) → Ringpuffer → ● REC mit 🎤 → Take → STIMME-Spur → Ausgang
for (const route of ['wired', 'speaker']) for (const lv of [-36, -28, -20]) {
  if (route === 'speaker' && lv !== -28) continue;
  const H = await open({file: FILE}), p = H.p, sr = await micOn(H.p, route);
  await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(0, 2); }, BPM);
  const y = voice(5, BPM, sr, lv);
  await p.evaluate(([b]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(y)]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 21); await idle(p);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  const tk = await p.evaluate(async () => { const st = SYNQUENZER.tkInfo().stimme, c = SYNQUENZER.getClip(st, 2), a = c.audio, m = SYNQUENZER.takes()[a.take];
    const raw = tkBuffer(a.take).getChannelData(0), sr = m.sr; let s = 0, n = 0;
    const lu = window.__L.lufs([raw], sr);
    return {st, len: c.len, a, route: m.route, cl: m.cl || 0, rawLufs: lu.lufs, rawTp: window.__L.truePeakDb([raw]), vol: S.tracks[st].sound.fx.vol, pan: S.tracks[st].sound.fx.pan, drive: S.tracks[st].sound.fx.drive, rev: S.tracks[st].sound.fx.rev}; });
  let cl = null;
  if (tk.cl) { await p.evaluate(id => SYNQUENZER.clWait ? SYNQUENZER.clWait(id) : null, tk.a.take); await sleep(500);
    cl = await p.evaluate(id => { const b = tkPlayBuf(id, null); const raw = tkBuffer(id); return b && b !== raw ? {lufs: window.__L.lufs([b.getChannelData(0)], b.sampleRate).lufs, tp: window.__L.truePeakDb([b.getChannelData(0)])} : null; }, tk.a.take); }
  // Wiedergabe: nur Szene 2, STIMME-Spur-Ausgang mitschneiden (ganzer Clip, 2 Durchgänge)
  await p.evaluate(st => { SYNQUENZER.selectSlot(st, 2); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1; window.__cap('v', AU.tracks[st].cut); window.__cap('vin', AU.tracks[st].trackIn); SYNQUENZER.play(); }, tk.st);
  await sleep(16500);
  const o = await p.evaluate(() => ({out: window.__capStat('v', 0.3), trackIn: window.__capStat('vin', 0.3), slot: R.slot.slice()}));
  out['B-' + route + lv] = {tk, cl, o};
  console.log('B', route, lv, 'dBFS RMS → Take', JSON.stringify({len: tk.len, cl: tk.cl, rawLufs: tk.rawLufs, rawTp: tk.rawTp, vol: tk.vol, drive: tk.drive}), 'gesäubert', JSON.stringify(cl), '\n   trackIn', JSON.stringify(o.trackIn), '\n   Ausgang', JSON.stringify(o.out), 'slots', o.slot.join(','));
  if (H.errs.length) console.log('  Fehler', H.errs.slice(0, 3));
  await H.br.close();
}
import fs from 'fs'; fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n4vsp/m1-' + (process.argv[3] || 'base') + '.json', JSON.stringify(out, null, 1));
