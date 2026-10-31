// G3 Abnahme: node g3-accept.mjs [A B C D F]
import {fresh, ok, fails, sleep, tones, singAt, waitBeat, beatNow, idle, deq, SB} from './g3-lib.mjs';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
const MEL_T = 5;
// ein Take mit Auftakt: 660 Hz in der zweiten Hälfte des Takts vor dem Clip-Anfang S, dann 440 / 523 Hz, die letzten 1,5 Schläge still
const PHRASE = S => [[S - 2, .9, 659.26, .3], [S - 1, .9, 659.26, .3], [S, 3.5, 440, .3], [S + 4, 2.5, 523.25, .3]];

async function recTake(H, scene, S, o = {}) {
  const PH = o.phrase || PHRASE(S), b0 = Math.min(...PH.map(x => x[0]));
  const p = H.p;
  await p.evaluate(([s, len]) => { SYNQUENZER.setRecOptions({countIn: 0, length: len}); SYNQUENZER.selectSlot(0, s); }, [scene, o.len || 2]);
  const t0 = await beatNow(p);
  if (Math.min(b0, S - 4) - t0 < 1) throw new Error('zu spät für die Aufnahme bei ' + S);
  await singAt(p, tones(PH, H.sr, b0), b0);
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

// Hilfe: Song abspielen ab Takt 0 und den Ausgang zwischen Song-Schlägen a…b mitschneiden
async function songCap(p, until) {
  await p.evaluate(() => { window.__capMore(); window.__capStart(); SYNQUENZER.songPlay(0); });
  await p.waitForFunction(() => SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const off = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
  await waitBeat(p, until + off);
  const cap = await p.evaluate(() => window.__capStop());
  const c = await p.evaluate(() => SYNQUENZER.vsClock()), T = x => c.start + (x + off) * c.spb;
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  return {at: (a, b) => p.evaluate(([t0, a, b]) => window.__capAt(t0, a, b), [cap.t0, T(a), T(b)]), click: (a, b) => p.evaluate(([t0, a, b]) => window.__capClick(t0, a, b), [cap.t0, T(a), T(b)])};
}
const lanesFor = (nt, map) => Array.from({length: nt}, (_, t) => map[t] || []);

// B — G3-02: im Song vor dem Teil hörbar und gezeichnet, nach Verschieben des Teils mit (Szenen-Clip als Teil und Song-Stimme)
if (want('B')) {
  const H = await fresh(), p = H.p;
  await p.evaluate(() => SYNQUENZER.play());
  await recTake(H, 1, 12);
  await p.evaluate(() => { SYNQUENZER.stop(); });
  const sti = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), nt = await p.evaluate(() => SYNQUENZER.project().tracks.length);
  const mk = [{id: 'M1', a: 0, len: 4, part: 'S1'}, {id: 'M2', a: 4, len: 4, part: 'S1'}, {id: 'M3', a: 8, len: 4, part: 'S2'}];
  const ln = {[sti]: [{bar: 9, slot: 1}, {bar: 11, slot: -1}], 5: [{bar: 9, slot: 1}, {bar: 11, slot: -1}]};
  ok(await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 12, lanes: lanesFor(nt, ln), carrier: [], mel: {}, marks: mk}), 'Song: Teil M3 (Takt 9–12) mit dem STIMME-Clip ab Takt 10');
  await p.evaluate(() => { SYNQUENZER.setMute(5, true); SYNQUENZER.songView(true); }); await sleep(600);
  let g = await p.evaluate(() => SYNQUENZER.g3Info());
  let tail = g.drawn.find(d => d.t === sti && d.what === 'pre'), mtail = g.drawn.find(d => d.t === 5 && d.what === 'notes');
  ok(tail && tail.x1 - tail.x0 > 4, 'Schwänzchen vor dem Teil gezeichnet (STIMME): ' + JSON.stringify(tail));
  ok(!!mtail, 'Schwänzchen der Auftakt-Noten (MELODIE): ' + JSON.stringify(mtail));
  let C = await songCap(p, 44);
  let e1 = await C.at(34.1, 35.9), e0 = await C.at(30.1, 33.9), e2 = await C.at(36.2, 39.3);
  ok(e1.f660 > -40 && e1.f660 - e0.f660 > 20, `Song: Anlauf vor dem Teil hörbar (660 Hz ${e1.f660.toFixed(1)} dB, davor ${e0.f660.toFixed(1)} dB)`);
  ok(e2.f440 > -40, 'Song: der Teil spielt (440 Hz ' + e2.f440.toFixed(1) + ' dB)');
  // Teil verschieben: M3 an den Anfang → der STIMME-Clip beginnt bei Takt 2, Anlauf in Takt 1
  ok(await p.evaluate(() => SYNQUENZER.markAction('M3', 'move', 0)), 'Teil M3 an den Anfang verschoben');
  const lanes = await p.evaluate(t => SYNQUENZER.project().song.lanes[t], sti);
  ok(lanes.some(e => e.bar === 1 && e.slot === 1), 'STIMME-Eintrag jetzt bei Takt 2: ' + JSON.stringify(lanes));
  await sleep(500);
  g = await p.evaluate(() => SYNQUENZER.g3Info()); tail = g.drawn.find(d => d.t === sti && d.what === 'pre');
  const xb = await p.evaluate(() => SYNQUENZER.svGeom ? SYNQUENZER.svGeom() : null);
  ok(tail && tail.x1 - tail.x0 > 4, 'Schwänzchen geht mit (gezeichnet bei ' + (tail && tail.x0) + '…' + (tail && tail.x1) + ' px)');
  C = await songCap(p, 10);
  e1 = await C.at(2.1, 3.9); e0 = await C.at(.3, 1.7);
  ok(e1.f660 > -40 && e1.f660 - e0.f660 > 20, `nach dem Verschieben: Anlauf vor dem Teil hörbar (660 Hz ${e1.f660.toFixed(1)} dB, davor ${e0.f660.toFixed(1)} dB)`);
  // Song-Stimme (Punch mit 🎤): Anlauf vor Takt 5, Teil M2 (Takt 5–8) verschieben → Song-Stimme samt Anlauf geht mit
  await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 12, lanes: lanesFor(nt, {}), carrier: [], mel: {}, marks: mk});
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 4, to: 6, mode: 'replace', targets: {clips: false, chords: false, mel: true}, preroll: true}));
  await p.waitForFunction(() => SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const off = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
  const bNow = await beatNow(p); console.log('  Punch: Transport', bNow.toFixed(2), 'off', off);
  await singAt(p, tones(PHRASE(16), H.sr, 14), 14 + off);
  await p.waitForFunction(() => !SYNQUENZER.runtime().song.rec, null, {timeout: 30000}).catch(() => {});
  await sleep(500); await p.evaluate(() => SYNQUENZER.stop()); await idle(p, 40000);
  const vx = await p.evaluate(() => SYNQUENZER.tkInfo().vox), tk = await p.evaluate(() => SYNQUENZER.takes());
  const v = vx && vx.find(x => x.bar === 4), m = v && tk[v.take];
  ok(v && m && m.pre && Math.abs(m.pre.in - v.in) < 1e-4 && m.pre.sec > .9, 'Song-Stimme Takt 5–6 mit Anlauf ' + JSON.stringify(m && m.pre) + ' ' + JSON.stringify(vx && vx.map(x => [x.bar, x.len])));
  await sleep(300); g = await p.evaluate(() => SYNQUENZER.g3Info());
  ok(g.drawn.some(d => d.what === 'vox-pre'), 'Schwänzchen der Song-Stimme gezeichnet');
  C = await songCap(p, 24);
  e1 = await C.at(14.1, 15.9); e0 = await C.at(10.1, 13.5);
  ok(e1.f660 > -40 && e1.f660 - e0.f660 > 20, `Song-Stimme: Anlauf vor Takt 5 hörbar (660 Hz ${e1.f660.toFixed(1)} dB, davor ${e0.f660.toFixed(1)} dB)`);
  ok(await p.evaluate(() => SYNQUENZER.markAction('M2', 'move', 12)), 'Teil M2 (Takt 5–8) ans Ende verschoben');
  const vx2 = await p.evaluate(() => SYNQUENZER.tkInfo().vox);
  ok(vx2 && vx2.some(x => x.bar === 8 && x.take === v.take && Math.abs(x.in - v.in) < 1e-6), 'Song-Stimme geht mit (jetzt Takt 9): ' + JSON.stringify(vx2 && vx2.map(x => [x.bar, x.len])));
  C = await songCap(p, 40);
  e1 = await C.at(30.1, 31.9); e0 = await C.at(14.1, 15.9);
  ok(e1.f660 > -40 && e1.f660 - e0.f660 > 20, `nach dem Verschieben: Anlauf vor Takt 9 (660 Hz ${e1.f660.toFixed(1)} dB), an der alten Stelle nichts (${e0.f660.toFixed(1)} dB)`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// C — G3-03: zwei Teile hintereinander – Ausklang des ersten und Anlauf des zweiten überlappen, beide hörbar, kein Knacken
if (want('C')) {
  const H = await fresh(), p = H.p;
  await p.evaluate(() => SYNQUENZER.play());
  await recTake(H, 1, 12, {phrase: [[12, 3.5, 329.63, .3], [16, 5, 392, .3]]});            // Ton über das Clip-Ende hinaus (Ausklang)
  await recTake(H, 2, 36);
  await p.evaluate(() => { SYNQUENZER.stop(); });
  const sti = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), nt = await p.evaluate(() => SYNQUENZER.project().tracks.length);
  const ca = await p.evaluate(t => SYNQUENZER.getClip(t, 1), sti), cb = await p.evaluate(t => SYNQUENZER.getClip(t, 2), sti), tk = await p.evaluate(() => SYNQUENZER.takes());
  const ma = tk[ca.audio.take], mb = tk[cb.audio.take];
  ok(ma.post && Math.abs(ma.post.out - ca.audio.out) < 1e-4 && ma.post.sec > .4 && ma.post.sec < .8, 'Take A: Ausklang ≈ 1 Schlag ' + JSON.stringify(ma.post));
  ok(mb.pre && mb.pre.sec > .9, 'Take B: Anlauf ≈ ½ Takt ' + JSON.stringify(mb.pre));
  await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 6, lanes: lanesFor(nt, {[sti]: [{bar: 1, slot: 1}, {bar: 3, slot: 2}, {bar: 5, slot: -1}]}), carrier: [], mel: {}, marks: []});
  await p.evaluate(() => { SYNQUENZER.setMute(5, true); SYNQUENZER.songView(true); }); await sleep(500);
  const g = await p.evaluate(() => SYNQUENZER.g3Info());
  ok(g.drawn.some(d => d.t === sti && d.what === 'post') && g.drawn.some(d => d.t === sti && d.what === 'pre'), 'gezeichnet: Ausklang nach Teil A und Anlauf vor Teil B ' + JSON.stringify(g.drawn.map(d => [d.what, d.x0, d.x1])));
  const C = await songCap(p, 22);
  const x1 = await C.at(10.1, 11.9), x2 = await C.at(12.1, 12.9), x3 = await C.at(13.6, 15.4);
  console.log('  vor B:', x1.f392.toFixed(1), '(A)', x1.f660.toFixed(1), '(Anlauf B) | nach dem Strich:', x2.f392.toFixed(1), '(Ausklang A)', x2.f440.toFixed(1), '(B) | später A', x3.f392.toFixed(1));
  ok(x1.f392 > -40 && x1.f660 > -40, 'vor Teil B: Ende von A und Anlauf von B klingen beide');
  ok(x2.f392 > -40 && x2.f440 > -40, 'nach dem Taktstrich: Ausklang von A und Anfang von B klingen beide');
  ok(x3.f392 < x2.f392 - 20, `der Ausklang endet (392 Hz danach ${x3.f392.toFixed(1)} dB)`);
  const k = await C.click(9.9, 13.2);
  const cT = await p.evaluate(() => SYNQUENZER.vsClock()), offC = 0;
  ok(k.d2 < 0.02, 'kein Knacken an den Rändern (größte 2. Differenz ' + k.d2.toFixed(4) + ' bei Schlag ' + ((k.at - cT.start) / cT.spb).toFixed(3) + ', Mitschnitt-Block-Sample ' + k.blk + ')');
  if (k.d2 >= .02) console.log('  Plan:', JSON.stringify(await p.evaluate(() => SYNQUENZER.g3Info().log)), JSON.stringify(await p.evaluate(() => SYNQUENZER.tkInfo().src)));
  const lg = await p.evaluate(() => SYNQUENZER.g3Info().log);
  ok(lg.some(x => x.kind === 'post') && lg.some(x => x.kind === 'pre' && x.song), 'Plan: ' + JSON.stringify(lg.filter(x => x.kind !== 'drop').slice(-4)));
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// D — G3-04: Undo / Speichern / Laden deep-equal (Take pre/post, MELODIE pre)
if (want('D')) {
  let H = await fresh(); let p = H.p; const br = H.br, ctx = H.ctx;
  await p.evaluate(() => SYNQUENZER.play());
  await recTake(H, 1, 12, {phrase: [[10, .9, 659.26, .3], [11, .9, 659.26, .3], [12, 3.5, 440, .3], [16, 5, 392, .3]]});
  await p.evaluate(() => SYNQUENZER.stop());
  const P0 = await p.evaluate(() => SYNQUENZER.project()), sti = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
  const tk0 = P0.takes, id = P0.tracks[sti].clips[1].audio.take;
  ok(tk0[id].pre && tk0[id].post && P0.tracks[5].clips[1].pre, 'Projekt trägt Take pre ' + JSON.stringify(tk0[id].pre) + ', post ' + JSON.stringify(tk0[id].post) + ', MELODIE pre (' + (P0.tracks[5].clips[1].pre || []).length + ')');
  await p.evaluate(() => SYNQUENZER.undo());
  const P1 = await p.evaluate(() => SYNQUENZER.project());
  ok(!P1.takes || !P1.takes[id], 'Undo nimmt Take samt Anlauf zurück');
  await p.evaluate(() => SYNQUENZER.redo());
  const P2 = await p.evaluate(() => SYNQUENZER.project());
  ok(deq(P2, P0), 'Redo → deep-equal');
  // Normalisieren ist idempotent (Laden einer gespeicherten Datei)
  const rt = await p.evaluate(() => { const a = SYNQUENZER.project(); const n = SYNQUENZER.normalize ? SYNQUENZER.normalize(a) : null; return n; });
  if (rt) ok(deq(rt, P0), 'normalize(Projekt) deep-equal');
  await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
  await p.close();
  H = await (await import('./g3-lib.mjs')).open({br, ctx}); p = H.p; await sleep(1500);
  const P3 = await p.evaluate(() => SYNQUENZER.project());
  const strip = o => { const x = JSON.parse(JSON.stringify(o)); delete x.id; delete x.name; delete x.view; delete x.saved; delete x.updated; return x; };
  ok(deq(strip(P3), strip(P0)), 'Speichern → Neuladen: Projekt deep-equal (mit pre/post)');
  if (!deq(strip(P3), strip(P0))) { const a = strip(P0), b = strip(P3); for (const k of Object.keys(a)) if (!deq(a[k], b[k])) console.log('  Unterschied in', k, JSON.stringify(a[k]).slice(0, 200), '→', JSON.stringify(b[k]).slice(0, 200)); }
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await br.close();
}

// F — G3-06: Auftakt ½ Takt vor Takt 5 aus einem laufenden 4-Takt-Loop → STIMME- und MELODIE-Clip beginnen bei Takt 5 (nicht 4)
if (want('F')) {
  for (const how of ['rec', 'fang']) {
    const H = await fresh(), p = H.p;
    await p.evaluate(() => { SYNQUENZER.launchScene(0); });          // der laufende 4-Takt-Loop (Demo-Szene 1)
    const phr = [[14, .9, 659.26, .3], [15, .9, 659.26, .3], [16, 3.5, 440, .3], [20, 3.5, 523.25, .3], [24, 3.5, 392, .3], [28, 2.5, 440, .3]];
    await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 'auto'}); SYNQUENZER.selectSlot(0, 1); });
    await singAt(p, tones(phr, H.sr, 14), 14);
    if (how === 'rec') {
      await waitBeat(p, 9); await p.evaluate(() => SYNQUENZER.rec());               // ● in Takt 3 → Aufnahme ab Takt 4
      const rs = await p.evaluate(() => SYNQUENZER.runtime().rec); console.log('  ● REC:', JSON.stringify(rs));
      await waitBeat(p, 30.5); await p.evaluate(() => SYNQUENZER.rec());            // Ende am Taktstrich 9
      await waitBeat(p, 33); await idle(p, 40000);
    } else {
      await waitBeat(p, 32.6); ok(await p.evaluate(() => SYNQUENZER.vsFang({beat: 32.6})), 'Stimme-FANG angenommen');
      await idle(p, 40000); await p.evaluate(() => SYNQUENZER.vsResultOk());
    }
    const r = await p.evaluate(() => SYNQUENZER.vsResult && SYNQUENZER.vsResult()), si = how === 'rec' ? 1 : (await p.evaluate(() => SYNQUENZER.vsInfo().lastFang)).si;
    const sti = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
    const mel = await p.evaluate(s => SYNQUENZER.getClip(5, s), si), stc = await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [sti, si]);
    const rt = await p.evaluate(() => SYNQUENZER.runtime());
    const cs = rt.cstart ? rt.cstart : null;
    const tk = stc && (await p.evaluate(() => SYNQUENZER.takes()))[stc.audio.take];
    const fl = how === 'fang' ? await p.evaluate(() => SYNQUENZER.vsInfo().lastFang) : null;
    console.log('  ' + how + ':', JSON.stringify({mel: mel && {len: mel.len, n: mel.notes.map(n => [n.t, n.n]), pre: mel.pre}, st: stc && stc.audio, take: tk && {pre: tk.pre}, fl}));
    // Anfang: Clip-Phase der laufenden Spuren (cstart) – 16 = Takt 5
    const csM = await p.evaluate(() => SYNQUENZER.runtime().slots ? null : null);
    const ph = await p.evaluate(([t]) => { const s = SYNQUENZER.g3Info ? null : null; return null; }, [sti]);
    void csM; void ph;
    const phs = await p.evaluate(t => ({m: SYNQUENZER.runtime().cstart ? SYNQUENZER.runtime().cstart[5] : null, s: SYNQUENZER.runtime().cstart ? SYNQUENZER.runtime().cstart[t] : null}), sti);
    ok(mel && mel.len === 4 && mel.notes.length && Math.abs(mel.notes[0].t) < .13 && mel.notes[0].n === 69, `${how}: MELODIE-Clip 4 Takte, beginnt mit dem ersten Wort (A4 auf 0): ` + JSON.stringify(mel && mel.notes.slice(0, 2)));
    ok(mel && mel.pre && mel.pre.length === 2 && mel.pre.every(n => n.n === 76), `${how}: Auftakt (2 × E5) ist Vorlauf: ` + JSON.stringify(mel && mel.pre));
    ok(stc && stc.len === 4 && tk && tk.pre && tk.pre.sec > .9 && tk.pre.sec < 1.3, `${how}: STIMME-Clip 4 Takte, Anlauf ${tk && tk.pre && tk.pre.sec} s`);
    if (phs.m != null) ok(((phs.m % 16) + 16) % 16 === 0 && ((phs.s % 16) + 16) % 16 === 0, `${how}: beide Clips laufen phasengleich ab Takt 5 (cstart MELODIE ${phs.m}, STIMME ${phs.s})`);
    if (how === 'fang') ok(fl && fl.start === 4, 'FANG: Clip-Anfang Takt 5 (start ' + (fl && fl.start) + ')');
    // Vorlauf beim Einstieg hörbar, im Song vor dem Teil sichtbar
    await p.evaluate(t => { SYNQUENZER.stopAllClips(); SYNQUENZER.setMute(5, true); }, sti);
    let b = await beatNow(p); const nb = Math.ceil(b / 4 + 1e-6) * 4; await waitBeat(p, nb + .05);
    await p.evaluate(([t, s]) => { window.__capMore(); window.__capStart(); SYNQUENZER.launchClip(t, s); }, [sti, si]);
    const B = nb + 4; await waitBeat(p, B + .5);
    const cap = await p.evaluate(() => window.__capStop()), c = await p.evaluate(() => SYNQUENZER.vsClock()), T = x => c.start + x * c.spb;
    const e1 = await p.evaluate(([t0, a, b]) => window.__capAt(t0, a, b), [cap.t0, T(B - 1.9), T(B - .1)]);
    ok(e1.f660 > -40, `${how}: Vorlauf beim Einstieg hörbar (660 Hz ${e1.f660.toFixed(1)} dB)`);
    await p.evaluate(() => SYNQUENZER.stop());
    const nt = await p.evaluate(() => SYNQUENZER.project().tracks.length);
    await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 8, lanes: Array.from({length: nt}, (_, t) => (t === sti || t === 5 ? [{bar: 2, slot: si}, {bar: 6, slot: -1}] : [])), carrier: [], mel: {}, marks: []});
    await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(500);
    const g = await p.evaluate(() => SYNQUENZER.g3Info());
    ok(g.drawn.some(d => d.t === sti && d.what === 'pre') && g.drawn.some(d => d.t === 5 && d.what === 'notes'), `${how}: im Song als Schwänzchen sichtbar (STIMME + MELODIE)`);
    const C = await songCap(p, 10);
    const s1 = await C.at(6.1, 7.9);
    ok(s1.f660 > -40, `${how}: im Song vor dem Teil hörbar (660 Hz ${s1.f660.toFixed(1)} dB)`);
    ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
    await H.br.close();
  }
}
console.log(fails() ? `FEHLER: ${fails()}` : 'ALLE OK');
process.exit(fails() ? 1 : 0);
