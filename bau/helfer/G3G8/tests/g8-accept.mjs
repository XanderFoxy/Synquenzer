// G8 Abnahme: node g8-accept.mjs [S A B C]   (S = Stück-Weg erzwungen bei kurzer Song-Aufnahme, A = G8-01 5 min, B = G8-02, C = G8-03)
import {fresh, ok, fails, sleep, waitBeat, beatNow, idle, deq, open} from './g3-lib.mjs';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
const MIN = +(process.env.G8_MIN || 5);
// Muster ins Mikro (im Seiten-Kontext): ab Kontext-Zeit t0 je Sekunde j ein Ton f(j) = 300 + 25·(j mod 20) Hz, 0,9 s an, 0,1 s Pause
const PATTERN = ([t0, sec]) => {
  const ctx = window.__ctx, F = window.__fake, o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0;
  for (let j = 0; j < sec; j++) { const t = t0 + j; o.frequency.setValueAtTime(300 + 25 * (j % 20), t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.25, t + .01); g.gain.setValueAtTime(.25, t + .89); g.gain.linearRampToValueAtTime(0, t + .9); }
  o.connect(g); g.connect(F.bus); o.start(t0); o.stop(t0 + sec + .1); window.__pat = {o, g, t0, sec}; return t0;
};
const fOf = j => 300 + 25 * (j % 20);
// Leistung im Seiten-Kontext: lange Aufgaben im Hauptfaden, Takt-Fehler
const PERF = () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} };

async function songTake(H, sec, force) {
  const p = H.p;
  await p.evaluate(PERF);
  const nt = await p.evaluate(() => SYNQUENZER.project().tracks.length);
  await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 2, lanes: Array.from({length: nt}, () => []), carrier: [], mel: {}, marks: []});
  await p.evaluate(f => SYNQUENZER.g8Force(f), !!force);
  const heap0 = await p.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize : null);
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
  await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const off = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
  const t0 = await p.evaluate(([off, sec, pat]) => { const c = SYNQUENZER.vsClock(); return (new Function('return ' + pat)())([c.start + off * c.spb, sec]); }, [off, sec, PATTERN.toString()]);
  const endBeat = off + sec * 2;                                      // 120 BPM: 2 Schläge je Sekunde
  let peak = 0, heapPk = heap0 || 0;
  while (true) {
    const b = await beatNow(p); if (b >= endBeat + .3) break;
    const i = await p.evaluate(() => ({g: SYNQUENZER.g8Info(), h: performance.memory ? performance.memory.usedJSHeapSize : 0}));
    if (i.g.st) peak = Math.max(peak, i.g.st.kept); heapPk = Math.max(heapPk, i.h);
    await sleep(Math.min(5000, Math.max(200, (endBeat + .3 - b) * 500)));
  }
  await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), Math.round(endBeat / 4) * 4);
  const tEnd = Date.now();
  await idle(p, 60000);
  const doneMs = Date.now() - tEnd;
  const I = await p.evaluate(() => ({vox: SYNQUENZER.tkInfo().vox, last: SYNQUENZER.tkInfo().last, g8: SYNQUENZER.g8Info(), lt: window.__lt, tick: SYNQUENZER.tickErrors ? SYNQUENZER.tickErrors() : null, heap: performance.memory ? performance.memory.usedJSHeapSize : 0}));
  return {off, t0, I, heap0, heapPk, peak, doneMs};
}
async function checkTake(p, v, sec, label) {
  // Take-Sekunde j des Musters = in + j (in: Song-Takt 0 liegt auf in); je 10. Sekunde Frequenz, alle Ton-Strecken ohne Loch
  const js = []; for (let j = 0; j < sec; j += Math.max(1, Math.floor(sec / 30))) js.push(j); if (!js.includes(sec - 1)) js.push(sec - 1);
  const gz = []; for (const j of js) { gz.push([v.in + j + .3, fOf(j), .4]); gz.push([v.in + j + .3, fOf(j) + 12.5, .4]); }
  const iv = []; for (let j = 0; j < sec; j++) iv.push([v.in + j + .05, v.in + j + .85]);
  const r = await p.evaluate(([id, o]) => SYNQUENZER.g8Scan(id, o), [v.take, {gz, iv}]);
  const right = [], bad = [];
  for (let k = 0; k < js.length; k++) { const a = r.gz[2 * k], b = r.gz[2 * k + 1]; right.push(a); if (!(a > -30 && a - b > 10)) bad.push([js[k], a, b]); }
  const holes = r.iv.map((x, j) => [j, x]).filter(([, x]) => x < -35);
  ok(r.sec >= v.in + sec, `${label}: Take ${r.sec} s im Speicher (≥ ${(v.in + sec).toFixed(1)} s)`);
  ok(!bad.length, `${label}: Anfang da und alles am Platz – ${js.length} Stichproben (Sek. 0 … ${sec - 1}) mit der richtigen Tonhöhe` + (bad.length ? ' FEHLT: ' + JSON.stringify(bad.slice(0, 5)) : ''));
  ok(!holes.length, `${label}: kein Aussetzer – ${iv.length} Ton-Strecken, kleinster 20-ms-Pegel ${Math.min(...r.iv).toFixed(1)} dB` + (holes.length ? ' LÖCHER: ' + JSON.stringify(holes.slice(0, 5)) : ''));
  return r;
}

// S — Stück-Weg (erzwungen) bei einer kurzen Song-Aufnahme: gleiches Ergebnis wie der Ringpuffer-Weg, Neuladen bitgleich
if (want('S')) {
  const H = await fresh(), p = H.p, br = H.br, ctx = H.ctx;
  const r = await songTake(H, 24, true);
  const v = r.I.vox && r.I.vox[0];
  ok(r.I.last && r.I.last.stream === true && r.I.g8.last && r.I.g8.last.chunks >= 1, 'Take aus dem Strom: ' + JSON.stringify(r.I.g8.last));
  ok(v && v.bar === 0 && v.len >= 12, 'Song-Stimme ab Takt 1: ' + JSON.stringify(v && [v.bar, v.len, v.in]));
  if (v) await checkTake(p, v, 24, 'Strom 24 s');
  const h0 = v && await p.evaluate(id => SYNQUENZER.tkPcmHash(id), v.take);
  const P0 = await p.evaluate(() => SYNQUENZER.project());
  await p.evaluate(() => SYNQUENZER.save()); await sleep(1500); await p.close();
  const H2 = await open({br, ctx}); await sleep(1500);
  const h1 = v && await H2.p.evaluate(id => SYNQUENZER.tkPcmHash(id), v.take), P1 = await H2.p.evaluate(() => SYNQUENZER.project());
  const strip = o => { const x = JSON.parse(JSON.stringify(o)); for (const k of ['id', 'name', 'view', 'saved', 'updated']) delete x[k]; return x; };
  ok(h0 && h0 === h1 && deq(strip(P0), strip(P1)), 'Neuladen: Take bitgleich (' + h0 + '), Projekt deep-equal');
  ok(!H.errs.length && !H2.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.concat(H2.errs).slice(0, 3)));
  await br.close();
}

// A — G8-01: Song-Aufnahme 5 min mit 🎤 → Take vollständig (Anfang da), kein Aussetzer; G8-04 Speicher/CPU
if (want('A')) {
  const H = await fresh(), p = H.p, sec = Math.round(MIN * 60);
  const ring = await p.evaluate(() => SYNQUENZER.g8Info().ringSec);
  console.log('  Ringpuffer', ring, 's – Aufnahme', sec, 's');
  const r = await songTake(H, sec, false);
  const v = r.I.vox && r.I.vox[0];
  ok(sec > ring + 10, `die Aufnahme (${sec} s) ist länger als der Ringpuffer (${ring} s)`);
  ok(r.I.last && r.I.last.stream === true, 'Take aus den mitgeschriebenen Stücken: ' + JSON.stringify(r.I.g8.last));
  ok(v && v.bar === 0, 'Song-Stimme ab Takt 1, ' + (v && v.len) + ' Takte');
  if (v) await checkTake(p, v, sec, `${MIN} min`);
  const lt = r.I.lt || [];
  console.log('  G8-04: Stücke im Speicher während der Aufnahme (max)', r.peak, '× 1 MB; Heap', r.heap0 && (r.heap0 / 1e6).toFixed(1), '→ Spitze', (r.heapPk / 1e6).toFixed(1), '→ danach', (r.I.heap / 1e6).toFixed(1), 'MB; lange Aufgaben', JSON.stringify(lt.slice(0, 20)), '; fertig', r.doneMs, 'ms nach dem Ende');
  ok(!lt.some(d => d > 200), 'keine lange Aufgabe > 200 ms im Hauptfaden (größte ' + (lt.length ? Math.max(...lt) : 0) + ' ms, Anzahl > 50 ms: ' + lt.length + ')');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// Töne je Takt ins Mikro (Kontext-Zeit), Takt j: f(j), 0,6 Takt lang
const BARTONES = ([t0, bars, bar, base]) => {
  const ctx = window.__ctx, F = window.__fake, o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0;
  for (let j = 0; j < bars; j++) { const t = t0 + j * bar, f = 220 * Math.pow(2, ((base + j) % 12 + 3) / 12); o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3, t + .01); g.gain.setValueAtTime(.3, t + bar * .6); g.gain.linearRampToValueAtTime(0, t + bar * .6 + .01); }
  o.connect(g); g.connect(F.bus); o.start(t0); o.stop(t0 + bars * bar + .1); return t0;
};
const fBar = (j, base) => 220 * Math.pow(2, ((base + j) % 12 + 3) / 12);

// B — G8-02: Clip 32 / 64 Takte aufnehmen (Noten und Gesang), speichern, laden, Schleife phasengleich
if (want('B')) {
  for (const LEN of (process.env.G8_LENS || '32,64').split(',').map(Number)) {
    const H = await fresh(), p = H.p, br = H.br, ctx = H.ctx, BPMx = 240, spbx = 60 / BPMx;
    await p.evaluate(([b, L]) => { SYNQUENZER.setBpm(b); SYNQUENZER.setRecOptions({countIn: 0, length: L}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); }, [BPMx, LEN]);
    await sleep(300);
    const S0 = 8;                                                   // Aufnahme ab Takt 3 (Schlag 8)
    await p.evaluate(([S0, n, bar, pat]) => { const c = SYNQUENZER.vsClock(); return (new Function('return ' + pat)())([c.start + S0 * c.spb + .02, n, bar, 0]); }, [S0, LEN, 4 * spbx, BARTONES.toString()]);
    await waitBeat(p, 5); await p.evaluate(() => SYNQUENZER.rec());
    const rs = await p.evaluate(() => SYNQUENZER.runtime().rec);
    ok(rs.startBeat === S0 && rs.length === LEN, `● REC Länge ${LEN}: ab Schlag ${rs.startBeat}`);
    await waitBeat(p, S0 + LEN * 4 + .5, 300000); await idle(p, 60000);
    const sti = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
    const mel = await p.evaluate(() => SYNQUENZER.getClip(5, 3)), stc = await p.evaluate(t => SYNQUENZER.getClip(t, 3), sti);
    ok(mel && mel.len === LEN && mel.notes.length >= LEN - 1, `MELODIE-Clip ${mel && mel.len} Takte, ${mel && mel.notes.length} Noten`);
    ok(stc && stc.len === LEN && stc.audio && Math.abs(stc.audio.out - stc.audio.in - LEN * 4 * spbx) < .01, `STIMME-Clip ${stc && stc.len} Takte, Audio ${stc && (stc.audio.out - stc.audio.in).toFixed(3)} s`);
    if (mel) { const last = mel.notes[mel.notes.length - 1]; ok(last.t >= (LEN - 1) * 4 - .2, `letzte Note im letzten Takt (t = ${last.t})`); }
    // Schleife: zweiter Durchgang beginnt bei S0 + LEN·4, beide Spuren am selben Ursprung; STIMME klingt im 2. Durchgang am richtigen Takt
    await sleep(4 * spbx * 1000 + 300);                                 // der Wechsel (nächster Taktstrich) ist durch
    const rt = await p.evaluate(() => SYNQUENZER.runtime());
    console.log('  Zustand:', JSON.stringify({slots: rt.slots, cstart: rt.cstart, clock: await p.evaluate(() => SYNQUENZER.vsClock()).then ? null : null}), JSON.stringify(await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return {pl: c.playing, start: c.start, now: c.now, beat: (c.now - c.start) / c.spb}; })));
    ok(rt.cstart[5] === S0 && rt.cstart[sti] === S0, `beide Clips laufen ab demselben Schlag (MELODIE ${rt.cstart[5]}, STIMME ${rt.cstart[sti]})`);
    await p.evaluate(() => { SYNQUENZER.setMute(5, true); window.__capMore(); window.__capStart(); });
    const P2 = S0 + LEN * 4, bn = await beatNow(p), k = Math.min(LEN - 2, Math.max(5, Math.ceil((bn - P2) / 4) + 1));   // ein Takt nach dem Mitschnitt-Start
    await waitBeat(p, P2 + 4 * (k + 1) + .2, 300000);
    const cap = await p.evaluate(() => window.__capStop()), c = await p.evaluate(() => SYNQUENZER.vsClock()), T = x => c.start + x * c.spb;
    const e = await p.evaluate(([t0, a, b]) => window.__capAt(t0, a, b), [cap.t0, T(P2 + 4 * k + .3), T(P2 + 4 * k + 2)]);
    const src = await p.evaluate(() => SYNQUENZER.tkInfo().src);
    const pass2 = src.filter(r => r.key && r.key.endsWith(':' + P2.toFixed(4))), a2 = stc.audio;
    // phasengleich: Stelle im Take = in + (Startzeit − Schlag P2) (ein später eingesetztes Stück beginnt mit passendem Versatz)
    const ph = pass2.length ? (pass2[0].off - a2.in) - (pass2[0].start - T(P2)) : null;
    ok(pass2.length === 1 && Math.abs(ph) < .002, `2. Durchgang der STIMME phasengleich ab Schlag ${P2} (Abweichung ${ph == null ? '–' : (ph * 1000).toFixed(2)} ms, Start ${pass2.length ? (pass2[0].start - T(P2)).toFixed(3) : '–'} s nach dem Taktstrich)`);
    const fk = await p.evaluate(([t0, a, b, f]) => { const x = window.__capAt(t0, a, b); return x; }, [cap.t0, T(P2 + 4 * k + .3), T(P2 + 4 * k + 2), 0]);
    void fk;
    const want = fBar(k, 0), gz = await p.evaluate(([t0, a, b, f]) => { const x = window.__capX, sr = window.__ctx.sampleRate, i0 = Math.round((a - t0) * sr), i1 = Math.round((b - t0) * sr), c2 = 2 * Math.cos(2 * Math.PI * f / sr); let s1 = 0, s2 = 0; for (let i = i0; i < i1; i++) { const s0 = x[i] + c2 * s1 - s2; s2 = s1; s1 = s0; } return 10 * Math.log10((s1 * s1 + s2 * s2 - c2 * s1 * s2) / ((i1 - i0) ** 2) + 1e-20); }, [cap.t0, T(P2 + 4 * k + .2), T(P2 + 4 * k + 2.2), want]);
    ok(gz > -35, `2. Durchgang, Takt ${k + 1}: die Stimme dieses Takts klingt (${want.toFixed(1)} Hz: ${gz.toFixed(1)} dB; RMS ${e.rms.toFixed(1)} dB)`);
    await p.evaluate(() => SYNQUENZER.stop());
    // Speichern → Laden
    const P0 = await p.evaluate(() => SYNQUENZER.project());
    await p.evaluate(() => SYNQUENZER.save()); await sleep(1500); await p.close();
    const H2 = await open({br, ctx}); await sleep(1500);
    const P1 = await H2.p.evaluate(() => SYNQUENZER.project());
    const strip = o => { const x = JSON.parse(JSON.stringify(o)); for (const k of ['id', 'name', 'view', 'saved', 'updated']) delete x[k]; return x; };
    ok(deq(strip(P0), strip(P1)) && P1.tracks[5].clips[3].len === LEN && P1.tracks[sti].clips[3].len === LEN, `Speichern → Laden: deep-equal, beide Clips ${LEN} Takte`);
    await H2.p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.launchScene(3); }); await sleep(1500);
    const rt2 = await H2.p.evaluate(() => SYNQUENZER.runtime());
    ok(rt2.slots[5] === 3 && rt2.slots[sti] === 3 && rt2.cstart[5] === rt2.cstart[sti], `nach dem Laden: beide Clips starten zusammen (cstart ${rt2.cstart[5]} / ${rt2.cstart[sti]})`);
    ok(!H.errs.length && !H2.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.concat(H2.errs).slice(0, 3)));
    await br.close();
  }
}

// C — G8-03: FANG einer 24-Takt-Phrase → 32-Takt-Clip (Tasten-FANG und Stimme-FANG)
if (want('C')) {
  const H = await fresh(), p = H.p, BPMx = 240, spbx = 60 / BPMx;
  await p.evaluate(b => { SYNQUENZER.setBpm(b); SYNQUENZER.stopAllClips(); SYNQUENZER.selectSlot(1, 2); SYNQUENZER.play(); }, BPMx);
  await sleep(300);
  // Tasten: ab Schlag 8 je 2 Schläge eine Note, 24 Takte lang (Spur SYN 2)
  await p.evaluate(([b0, n, spb]) => { const c = SYNQUENZER.vsClock(), now = c.now; for (let k = 0; k < n; k++) { const t = c.start + (b0 + 2 * k) * spb - now; setTimeout(() => SYNQUENZER.keyOn(60 + (k % 12)), t * 1000); setTimeout(() => SYNQUENZER.keyOff(60 + (k % 12)), (t + spb) * 1000); } }, [8, 48, spbx]);
  await waitBeat(p, 8 + 96 + 1, 120000);
  ok(await p.evaluate(() => SYNQUENZER.capture()) !== false, 'FANG (Tasten) angenommen');
  const ck = await p.evaluate(() => SYNQUENZER.getClip(1, 2));
  ok(ck && ck.len === 32 && ck.notes.length === 48, `Tasten-FANG: 24-Takt-Phrase → ${ck && ck.len}-Takt-Clip, ${ck && ck.notes.length} Noten`);
  // Stimme: 24 Takte singen, dann Stimme-FANG
  const S0 = await beatNow(p).then(b => Math.ceil(b / 4 + 2) * 4);
  await p.evaluate(([S0, n, bar, pat]) => { const c = SYNQUENZER.vsClock(); return (new Function('return ' + pat)())([c.start + S0 * c.spb + .02, n, bar, 2]); }, [S0, 24, 4 * spbx, BARTONES.toString()]);
  await waitBeat(p, S0 + 96 + 1, 120000);
  ok(await p.evaluate(b => SYNQUENZER.vsFang({beat: b}), S0 + 96 + 1), 'Stimme-FANG angenommen');
  await idle(p, 60000);
  const fl = await p.evaluate(() => SYNQUENZER.vsInfo().lastFang), sti = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
  const mel = await p.evaluate(s => SYNQUENZER.getClip(5, s), fl.si), stc = await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [sti, fl.si]);
  ok(fl && fl.len === 32 && mel && mel.len === 32 && mel.notes.length >= 23, `Stimme-FANG: 24-Takt-Phrase → MELODIE ${mel && mel.len} Takte (${mel && mel.notes.length} Noten), Anfang Takt ${fl && fl.start + 1}`);
  ok(stc && stc.len === 32 && stc.audio, `STIMME-Clip ${stc && stc.len} Takte`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// R — G8 Nr. 1: Restzeit nur, wenn < 2 min; bei 0 endet die Aufnahme (Speicher-Schätzung im Test vorgegeben)
if (want('R')) {
  const H = await fresh(), p = H.p;
  const nt = await p.evaluate(() => SYNQUENZER.project().tracks.length);
  await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 2, lanes: Array.from({length: nt}, () => []), carrier: [], mel: {}, marks: []});
  const sr = H.sr, quota = Math.round(150 * sr * 2 / .9);            // reicht für 150 s
  await p.evaluate(q => SYNQUENZER.g8EstFake({quota: q, usage: 0}), quota);
  await p.evaluate(() => { window.__toasts = []; const t = document.querySelector('#toast') || document.querySelector('.toast'); const mo = new MutationObserver(() => { const x = (t && t.textContent) || ''; if (x && window.__toasts[window.__toasts.length - 1] !== x) window.__toasts.push(x); }); if (t) mo.observe(t, {childList: true, subtree: true, characterData: true}); });
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
  await p.waitForFunction(() => SYNQUENZER.runtime().song.rec, null, {timeout: 5000});
  await sleep(10000);
  const r1 = await p.evaluate(() => ({rest: SYNQUENZER.g8Info().rest, toasts: window.__toasts.slice()}));
  ok(r1.rest > 120 && !r1.toasts.some(x => /Aufnahmezeit/.test(x)), `bei > 2 min Rest keine Anzeige (Rest ${r1.rest && r1.rest.toFixed(0)} s)`);
  await p.waitForFunction(() => SYNQUENZER.g8Info().rest < 115, null, {timeout: 60000});
  await sleep(1500);
  const r2 = await p.evaluate(() => ({rest: SYNQUENZER.g8Info().rest, toasts: window.__toasts.slice()}));
  ok(r2.toasts.some(x => /noch 1:[0-5]\d Aufnahmezeit/.test(x)), 'unter 2 min: Restzeit angezeigt ' + JSON.stringify(r2.toasts.filter(x => /Aufnahmezeit/.test(x))));
  await p.waitForFunction(() => !SYNQUENZER.runtime().song.rec, null, {timeout: 200000});
  const r3 = await p.evaluate(() => ({toasts: window.__toasts.slice(), log: SYNQUENZER.g8Info().log}));
  ok(r3.toasts.some(x => /Speicher knapp – Aufnahme beendet/.test(x)) && r3.log.some(x => x.kind === 'full'), 'Rest 0: „Speicher knapp – Aufnahme beendet“, die Aufnahme endet ' + JSON.stringify(r3.log.filter(x => x.kind === 'full')));
  await idle(p, 60000);
  const vx = await p.evaluate(() => SYNQUENZER.tkInfo().vox);
  ok(vx && vx.length === 1 && vx[0].len >= 70, 'der Take bis dahin ist gespeichert: ' + JSON.stringify(vx && vx.map(v => [v.bar, v.len])));
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}
console.log(fails() ? `FEHLER: ${fails()}` : 'ALLE OK');
process.exit(fails() ? 1 : 0);
