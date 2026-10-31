// G3 Abnahme: node g3-accept.mjs [A B C D F]
import {fresh, ok, fails, sleep, tones, singAt, waitBeat, beatNow, idle, deq, SB} from './g3-lib.mjs';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
const MEL_T = 5;
// ein Take mit Auftakt: 660 Hz in der zweiten Hälfte des Takts vor dem Clip-Anfang S, dann 440 / 523 Hz, die letzten 1,5 Schläge still
const PHRASE = S => [[S - 2, .9, 659.26, .3], [S - 1, .9, 659.26, .3], [S, 3.5, 440, .3], [S + 4, 2.5, 523.25, .3]];

async function recTake(H, scene, S, o = {}) {
  const p = H.p;
  await p.evaluate(([s, len]) => { SYNQUENZER.setRecOptions({countIn: 0, length: len}); SYNQUENZER.selectSlot(0, s); }, [scene, o.len || 2]);
  const t0 = await beatNow(p);
  if (S - 4 - t0 < 1.5) throw new Error('zu spät für die Aufnahme bei ' + S);
  await singAt(p, (await import('./g3-lib.mjs')).tones(PHRASE(S), H.sr, S - 2), S - 2);
  await waitBeat(p, (o.press != null ? o.press : S - 3.5));
  await p.evaluate(() => SYNQUENZER.rec());
  const st = await p.evaluate(() => SYNQUENZER.state().rec);
  await waitBeat(p, S + (o.len || 2) * 4 + 0.3);
  if (o.stop) await p.evaluate(() => SYNQUENZER.rec());
  await idle(p, 40000);
  return st;
}

// A — G3-01: Anlauf ½ Takt vor Takt 1 aufgenommen → in der Szene beim Einstieg hörbar, bei Wiederholung nicht
if (want('A')) {
  const H = await fresh(), p = H.p;
  await p.evaluate(() => SYNQUENZER.play());
  const st = await recTake(H, 1, 12);
  const I = await p.evaluate(() => SYNQUENZER.tkInfo()), sti = I.stimme;
  const mel = await p.evaluate(() => SYNQUENZER.getClip(5, 1)), stc = await p.evaluate(t => SYNQUENZER.getClip(t, 1), sti);
  ok(sti >= 0 && stc && stc.audio, 'STIMME-Clip in Szene 2: ' + JSON.stringify(stc && stc.audio));
  const tk = await p.evaluate(() => SYNQUENZER.takes()), m = stc && tk[stc.audio.take];
  ok(m && m.pre && Math.abs(m.pre.in - stc.audio.in) < 1e-4 && m.pre.sec > 0.9 && m.pre.sec < 1.3, 'Take-Anlauf ≈ ½ Takt (1,0 s): ' + JSON.stringify(m && m.pre) + ' in ' + (stc && stc.audio.in));
  ok(m && stc.audio.in >= 4 * 2 * SB - 1e-3, 'der Take behält bis 2 Takte vor dem Clip-Anfang (in = ' + (stc && stc.audio.in.toFixed(3)) + ' s)');
  ok(m && m.len / m.sr >= stc.audio.out + 4 * SB - 0.01, 'der Take behält 1 Takt nach dem Clip-Ende (Länge ' + (m.len / m.sr).toFixed(3) + ' s, out ' + stc.audio.out + ')');
  ok(stc.len === 2 && mel && mel.len === 2, 'Klammer unverändert: STIMME ' + stc.len + ' / MELODIE ' + (mel && mel.len) + ' Takte');
  ok(mel && Array.isArray(mel.pre) && mel.pre.length === 2 && Math.abs(mel.pre[0].t + 2) < .13 && Math.abs(mel.pre[1].t + 1) < .13, 'MELODIE-Clip: Auftakt-Noten als Vorlauf ' + JSON.stringify(mel && mel.pre));
  ok(mel && mel.notes.every(n => n.t >= 0) && mel.notes.length >= 2, 'Clip-Noten ab 0: ' + JSON.stringify(mel && mel.notes.map(n => [n.t, n.n])));
  // Einstieg: STIMME + MELODIE gestoppt, MELODIE stumm (nur Audio prüfen); Start am nächsten Taktstrich
  await p.evaluate(t => { SYNQUENZER.stopAllClips(); SYNQUENZER.setMute(5, true); }, sti);
  let b = await beatNow(p); const nb = Math.ceil(b / 4 + 1e-6) * 4; await waitBeat(p, nb + 0.05);
  await p.evaluate(() => { window.__capMore(); window.__capStart(); });
  await p.evaluate(t => SYNQUENZER.launchClip(t, 1), sti);
  const B = nb + 4;
  await waitBeat(p, B + 8 + 3);
  const cap = await p.evaluate(() => window.__capStop());
  const c = await p.evaluate(() => SYNQUENZER.vsClock()), T = x => c.start + x * c.spb;
  const at = (a, b) => p.evaluate(([t0, a, b]) => window.__capAt(t0, a, b), [cap.t0, T(a), T(b)]);
  const e1 = await at(B - 1.9, B - .1), e2 = await at(B + 8 - 1.9, B + 8 - .1), main = await at(B + .2, B + 3.3);
  console.log('  Einstieg  660 Hz', e1.f660.toFixed(1), 'dB  rms', e1.rms.toFixed(1), '| Wiederholung 660 Hz', e2.f660.toFixed(1), 'rms', e2.rms.toFixed(1), '| Clip 440', main.f440.toFixed(1));
  ok(e1.f660 > -40 && e1.f660 - e2.f660 > 20, `Anlauf beim Einstieg hörbar (660 Hz ${e1.f660.toFixed(1)} dB), bei der Wiederholung nicht (${e2.f660.toFixed(1)} dB)`);
  ok(main.f440 > -40, 'Clip spielt (440 Hz ' + main.f440.toFixed(1) + ' dB)');
  const lg = await p.evaluate(() => SYNQUENZER.g3Info().log);
  ok(lg.filter(x => x.kind === 'pre' && Math.abs(x.B - B) < 1e-3).length === 1 && !lg.some(x => x.kind === 'pre' && Math.abs(x.B - B - 8) < 1e-3), 'ein Anlauf (Takt ' + (B / 4 + 1) + '), keiner bei der Wiederholung: ' + JSON.stringify(lg.slice(-4)));
  const ck = await p.evaluate(([t0, a, b]) => window.__capClick(t0, a, b), [cap.t0, T(B - .02), T(B + .02)]);
  ok(ck.d2 < 0.05, 'Übergang Anlauf → Clip ohne Knacken (2. Differenz ' + ck.d2.toFixed(4) + ')');
  // MELODIE: Auftakt-Noten beim Einstieg (Stimmen-Protokoll)
  await p.evaluate(t => { SYNQUENZER.setMute(5, false); SYNQUENZER.setMute(t, true); SYNQUENZER.stopTrack(5); }, sti);
  b = await beatNow(p); const nb2 = Math.ceil(b / 4 + 1e-6) * 4; await waitBeat(p, nb2 + 0.05);
  await p.evaluate(() => SYNQUENZER.launchClip(5, 1));
  const B2 = nb2 + 4; await waitBeat(p, B2 + .3);
  const g = await p.evaluate(() => SYNQUENZER.g3Info());
  const ent = g.ent.find(e => e.i === 5 && Math.abs(e.B - B2) < 1e-3);
  ok(ent && ent.voices === 2, 'MELODIE: 2 Auftakt-Noten beim Einstieg gespielt: ' + JSON.stringify(ent));
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  H.A = {st}; await H.br.close();
}
console.log(fails() ? `FEHLER: ${fails()}` : 'ALLE OK');
process.exit(fails() ? 1 : 0);
