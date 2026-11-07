// A2: Konsolidieren eines Bereichs mit LAUF (Richtung / Start / Schrittlänge / Chance / Zufall / Schritt-Effekte).
// node a2-test.mjs <index.html> <ordner> [nur=variante,…] [--rt]
// Vergleich „vorher == nachher“: alle Noten (Spur, Tonhöhe wie gespielt, Schlag, Dauer, Velocity) des Bereichs im Song vor dem
// Konsolidieren gegen den konsolidierten Teil, den Song danach, den Teil im Song eingefügt (Song-Wiedergabe + MIDI-Export).
// Zufall/Chance sind in der App deterministisch (DrumSeq.rand01(Startwert, Schritt-Zähler ab Clip-Start, …)) – „gleich“ heißt
// deshalb auch dort: genau dieselben Noten (und damit dieselbe Notenmenge je Takt-Durchlauf).
// Erfassung: der Scheduler läuft im Zeitraffer (tick in kleinen Fenstern), spawnClipVoice wird nur mitgeschrieben – derselbe Weg
// wie beim Abspielen (scheduleTrack, Song-Spuren, Teile); --rt prüft einmal in Echtzeit über noteLog gegen.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const FILE = path.resolve(process.argv[2]), OUT = (process.argv[3] || '.').replace(/\/?$/, '/');
const ONLY = (process.argv.find(a => a.startsWith('nur=')) || '').slice(4).split(',').filter(Boolean);
const RT = process.argv.includes('--rt');
fs.mkdirSync(OUT, {recursive: true});
const VARS = ['plain', 'rev', 'pend', 'rnd', 'pb', 'st', 'g', 'gst', 'fx', 'pbrev'];
const SCENS = ['S1', 'S2', 'S3'];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [], res = [];
const ok = (name, cond, info) => { res.push({name, ok: !!cond, info}); console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info !== undefined && !cond ? ' · ' + JSON.stringify(info).slice(0, 900) : '')); };

// MIDI: Noten-Ereignisse einer Spur (Track-Chunk k) als [Tonhöhe, Schlag, Dauer]
function midiNotes(bytes, k) {
  const u = Uint8Array.from(bytes); let p = 14, trk = -1; const out = [];
  const ppq = (u[12] << 8) | u[13];
  while (p < u.length) {
    const len = (u[p + 4] << 24) | (u[p + 5] << 16) | (u[p + 6] << 8) | u[p + 7]; trk++;
    if (trk === k) {
      let q = p + 8, end = q + len, tk = 0, rs = 0; const on = new Map();
      while (q < end) {
        let d = 0, c; do { c = u[q++]; d = (d << 7) | (c & 127); } while (c & 128); tk += d;
        let st = u[q]; if (st & 128) q++; else st = rs;
        if (st === 0xFF) { q++; let l = 0; do { c = u[q++]; l = (l << 7) | (c & 127); } while (c & 128); q += l; continue; }
        if (st === 0xF0 || st === 0xF7) { let l = 0; do { c = u[q++]; l = (l << 7) | (c & 127); } while (c & 128); q += l; continue; }
        rs = st; const hi = st & 0xF0, a1 = u[q++], a2 = (hi === 0xC0 || hi === 0xD0) ? 0 : u[q++];
        if (hi === 0x90 && a2 > 0) on.set(a1 + ':' + tk, tk), out.push({n: a1, tk, v: a2, e: null});
        else if (hi === 0x80 || (hi === 0x90 && a2 === 0)) { const o = out.find(x => x.n === a1 && x.e == null && x.tk <= tk); if (o) o.e = tk; }
      }
      return out.map(x => [x.n, +(x.tk / ppq).toFixed(3), +(((x.e ?? x.tk) - x.tk) / ppq).toFixed(2)]).sort((x, y) => x[1] - y[1] || x[0] - y[0]);
    }
    p += 8 + len;
  }
  return out;
}

async function runCase(scen, variant) {
  const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  p.on('pageerror', e => errs.push(scen + '/' + variant + ' PE ' + String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(scen + '/' + variant + ' ' + m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(700);
  await p.touchscreen.tap(5, 300); await p.waitForTimeout(250);
  const r = await p.evaluate(async ([scen, variant, rt]) => {
    const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    ensureAudio(); for (let k = 0; k < 40 && !(AU.ctx && AU.ctx.state === 'running'); k++) await sl(50);
    if (R.playing) stop(); A.setMetronome(false); A.setBpm(240); S.settings.countIn = 0; A.resetCarrier();
    for (const tr of S.tracks) tr.clips = tr.clips.map(() => null);
    partsEnsure(); S.parts = S.parts.map(() => null);
    // ---- Clip + LAUF-Variante
    const L1 = scen === 'S2' ? 2 : 1, NN = L1 * 8, sc = [0, 2, 4, 5, 7, 9, 11, 12, 14, 12, 11, 9, 7, 5, 4, 2];
    const notes = Array.from({length: NN}, (_, i) => ({t: i * .5, d: .25, n: 60 + sc[i % 16], v: .8}));
    S.tracks[0].clips[0] = normClip({len: L1, key: {root: 2, scale: 'aeolian'}, notes}, 'synth', S.key);
    const c0 = S.tracks[0].clips[0]; c0.key.src = 'user';
    const V = variant;
    if (V === 'rev') c0.lf = {dir: 'rev'};
    if (V === 'pend') c0.lf = {dir: 'pend'};
    if (V === 'rnd') c0.lf = {dir: 'rnd', seed: 7};
    if (V === 'pb' || V === 'pbrev') { c0.notes[2].pb = .5; c0.notes[5].pb = .5; c0.notes[6].pb = .3; }
    if (V === 'pbrev') c0.lf = {dir: 'rev'};
    if (V === 'st') c0.lf = {st: 4};
    if (V === 'g') c0.lf = {dir: 'rev', g: '1/8'};
    if (V === 'gst') c0.lf = {st: 3, g: '1/8'};
    if (V === 'fx') { c0.notes[1].rt = 3; c0.notes[3].tp = 7; c0.notes[4].off = true; c0.notes[NN - 1].rt = 2; }
    S.tracks[0].clips[0] = normClip(cleanClip(c0), 'synth', S.key);
    const clipBefore = JSON.stringify(cleanClip(S.tracks[0].clips[0]));
    // ---- Song: S1 4 Takte, eigener Clip in Takt 2 (+ Zusatznote), Bereich 1–4 · S2 2-Takt-Clip, 6 Takte, eigener Clip im
    //      Durchlauf Takt 3–4, Bereich Takt 2–5 (beginnt mitten im Durchlauf) · S3 4 Takte, kein eigener Clip, Bereich Takt 3–4
    const bars = scen === 'S2' ? 6 : 4, ra = scen === 'S2' ? 1 : scen === 'S3' ? 2 : 0, re = scen === 'S2' ? 5 : 4;
    const nt = NT(), lanes = Array.from({length: nt}, () => []); lanes[0] = [{bar: 0, slot: 0}];
    A.setSong({bars, lanes, carrier: [], mel: {}, marks: [{id: 'M1', a: 0, len: bars, name: 'Strophe'}]});
    if (scen !== 'S3') {
      const ob = scen === 'S2' ? 3 : 1;
      A.makeOwn(0, ob, false); const o = ownRun(S.song, 0, ob), id = o && o.o.own; const c = S.song.own[id];
      const xt = scen === 'S2' ? 7.75 : 3.75;
      c.notes.push(Object.assign({t: xt, d: .2, n: 84, v: .9}, V === 'pb' || V === 'pbrev' ? {pb: .6} : null)); c.notes.sort((u, v) => u.t - v.t);
    }
    restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged(); UNDO.length = 0; REDO.length = 0;
    // ---- Erfassung
    const cap = (start, beats) => {
      if (R.playing) stop(); if (R.songPlay) songPlayEnd(true);
      const ev = [], orig = spawnClipVoice;
      spawnClipVoice = (i, out, vel, t, dur) => { ev.push([i, out, +t2b(t).toFixed(3), +(dur / spb()).toFixed(3), +vel.toFixed(2)]); return null; };
      try {
        start();
        for (let h = .02; h < 120 && R.playing && R.schedBeat < beats + .5; h += .02) tick(h);
      } finally { stop(); if (R.songPlay) songPlayEnd(true); spawnClipVoice = orig; }
      return ev.filter(e => e[2] >= -1e-6 && e[2] < beats - 1e-6).sort((x, y) => x[2] - y[2] || x[0] - y[0] || x[1] - y[1]);
    };
    const capRt = async (start, beats) => {
      if (R.playing) stop(); if (R.songPlay) songPlayEnd(true);
      await sl(120); clearLog(); start();
      await new Promise(res => { const iv = setInterval(() => { if (audBeat() >= beats + .3 || !R.playing) { clearInterval(iv); res(); } }, 10); });
      const L = noteLog(4096).filter(e => e.src !== 'click' && e.beat != null && e.beat < beats - 1e-6).map(e => [e.track, e.out, +(+e.beat).toFixed(3)]);
      stop(); if (R.songPlay) songPlayEnd(true); await sl(150);
      return L.sort((x, y) => x[2] - y[2] || x[0] - y[0] || x[1] - y[1]);
    };
    const song = n => cap(() => songPlayStart(0), n), part = (k, n) => cap(() => launchPart(k), n);
    const win = (ev, a, e) => ev.filter(x => x[2] >= a - 1e-6 && x[2] < e - 1e-6).map(x => [x[0], x[1], +(x[2] - a).toFixed(3), x[3], x[4]]);
    const J = x => JSON.stringify(x), A0 = ra * 4, E0 = re * 4, RB = E0 - A0;
    const out = {scen, variant, bars, ra, re};
    const s0 = song(bars * 4), rng0 = win(s0, A0, E0);
    out.nRange = rng0.length;
    if (rt) { out.rtSong = J(await capRt(() => songPlayStart(0), bars * 4)) === J(s0.map(x => x.slice(0, 3))); }
    const midi0 = Array.from(buildMidiSong(false).bytes);
    // ---- Konsolidieren
    const r = A.konsolidieren(ra, re - 1, 'Kern');
    out.ext = r.ext; out.win = A.clipWindow(0, 0);
    const lw = S.tracks[0].clips[0].lw; out.lwKeys = lw ? Object.keys(lw).sort().join(',') : null;
    const p1 = part(r.part, RB), s1 = song(bars * 4);
    out.part = J(p1) === J(rng0); out.song1 = J(s1) === J(s0);
    if (!out.part) { out.partD = {want: rng0.map(x => x[1] + '@' + x[2]).join(' '), got: p1.map(x => x[1] + '@' + x[2]).join(' ')}; const k1 = p1.map(J), k0 = rng0.map(J); out.partX = {nur_vorher: rng0.filter(x => !k1.includes(J(x))).slice(0, 12), nur_nachher: p1.filter(x => !k0.includes(J(x))).slice(0, 12)}; }
    if (rt) { out.rtPart = J(await capRt(() => launchPart(r.part), RB)) === J(rng0.map(x => x.slice(0, 3))); }
    // ---- Song-Render / Export: der Teil im Song (eigener Clip mit dem ganzen Inhalt) – Wiedergabe + MIDI
    const keep = songSnapshot();
    placePart(r.part, bars, 'insert');
    const s2 = song((bars * 4) + RB);
    out.placed = J(win(s2, bars * 4, bars * 4 + RB)) === J(rng0);
    if (!out.placed) out.placedD = {want: rng0.map(x => x[1] + '@' + x[2]).join(' '), got: win(s2, bars * 4, bars * 4 + RB).map(x => x[1] + '@' + x[2]).join(' ')};
    out.midi1 = Array.from(buildMidiSong(false).bytes); out.midi0 = midi0;
    // vvClip (Video): der ganze Inhalt wie gespielt (kein LAUF mehr darauf)
    { const w = vvClip(0, 0, '~'); out.vvPlain = !!w && !w.lw && !lf1Plan(w); }
    restoreSong(JSON.parse(keep)); songTidy(S.song); songChanged();
    // ---- Fenster ▶ (der Teil klingt gleich)
    if (r.ext) {
      const u0 = UNDO.length, mv = A.clipWindowMove(0, 0, 1) || A.clipWindowMove(0, 0, -1);   // ▶ (am Ende: ◀)
      out.winMove = mv ? J(part(r.part, RB)) === J(rng0) : 'kein ◀ ▶'; out.winAt = A.clipWindow(0, 0);
      if (mv) undo(); while (UNDO.length > u0) undo();
    }
    // ---- Speichern / Laden
    { const js = serializeProject(); importJSON(js); await sl(400); const k = S.parts.findIndex(x => x && x.name === 'Kern'); out.reload = k >= 0 ? J(part(k, RB)) === J(rng0) : 'kein Teil'; out.reloadLw = S.tracks[0].clips[0] && S.tracks[0].clips[0].lw ? Object.keys(S.tracks[0].clips[0].lw).sort().join(',') : null; }
    return out;
  }, [scen, variant, RT]);
  // ↶ / ↷, Zurückholen, Clip ziehen: frischer Durchgang auf derselben Seite
  const r2 = await p.evaluate(async ([scen, variant]) => {
    const A = SYNQUENZER, J = x => JSON.stringify(x), sl = ms => new Promise(r => setTimeout(r, ms));
    const ra = scen === 'S2' ? 1 : scen === 'S3' ? 2 : 0, re = scen === 'S2' ? 5 : 4, bars = S.song.bars, A0 = ra * 4, E0 = re * 4, RB = E0 - A0;
    // zurück auf den Stand vor dem Konsolidieren: Zurückholen
    const cap = (start, beats) => {
      if (R.playing) stop(); if (R.songPlay) songPlayEnd(true);
      const ev = [], orig = spawnClipVoice;
      spawnClipVoice = (i, out, vel, t, dur) => { ev.push([i, out, +t2b(t).toFixed(3), +(dur / spb()).toFixed(3), +vel.toFixed(2)]); return null; };
      try { start(); for (let h = .02; h < 120 && R.playing && R.schedBeat < beats + .5; h += .02) tick(h); }
      finally { stop(); if (R.songPlay) songPlayEnd(true); spawnClipVoice = orig; }
      return ev.filter(e => e[2] >= -1e-6 && e[2] < beats - 1e-6).sort((x, y) => x[2] - y[2] || x[0] - y[0] || x[1] - y[1]);
    };
    const win = (ev, a, e) => ev.filter(x => x[2] >= a - 1e-6 && x[2] < e - 1e-6).map(x => [x[0], x[1], +(x[2] - a).toFixed(3), x[3], x[4]]);
    const out = {};
    const mk = S.song.marks.find(m => m.part && S.parts[+m.part.slice(1) - 1] && S.parts[+m.part.slice(1) - 1].name === 'Kern');
    if (!mk) return {err: 'keine Marke'};
    const k = +mk.part.slice(1) - 1, ext = !!S.tracks[0].clips[0].lw;
    const sNow = cap(() => songPlayStart(0), bars * 4), rng = win(sNow, A0, E0);
    out.partNow = J(cap(() => launchPart(k), RB)) === J(rng);
    // Zurückholen
    UNDO.length = 0; REDO.length = 0;
    const back = A.zurueckholen(mk.id);
    out.back = back; out.backLw = !S.tracks[0].clips[0].lw;
    out.backSong = J(cap(() => songPlayStart(0), bars * 4)) === J(sNow);
    // ↶ (Zurückholen zurück) → der Teil ist wieder da und klingt gleich; ↷ wieder weg
    undo(); await sl(50);
    const k2 = S.parts.findIndex(x => x && x.name === 'Kern');
    out.undoBack = k2 >= 0 && (!ext || !!S.tracks[0].clips[0].lw) && J(cap(() => launchPart(k2), RB)) === J(rng);
    redo(); await sl(50); out.redoBack = !S.tracks[0].clips[0].lw && S.parts.findIndex(x => x && x.name === 'Kern') < 0;
    undo(); await sl(50);
    // ↶ des Konsolidierens selbst: neu konsolidieren, dann ↶ → Clip wie vorher, kein Teil; ↷ → Teil klingt gleich
    { const c0 = J(cleanClip(S.tracks[0].clips[0]));
      A.zurueckholen(S.song.marks.find(m => m.part && S.parts[+m.part.slice(1) - 1] && S.parts[+m.part.slice(1) - 1].name === 'Kern').id);
      const plain = J(cleanClip(S.tracks[0].clips[0]));
      UNDO.length = 0; REDO.length = 0;
      const r = A.konsolidieren(ra, re - 1, 'Kern2');
      const after = J(cleanClip(S.tracks[0].clips[0]));
      undo(); await sl(50);
      out.undoKon = J(cleanClip(S.tracks[0].clips[0])) === plain && !S.parts[r.part];
      redo(); await sl(50);
      out.redoKon = J(cleanClip(S.tracks[0].clips[0])) === after && !!S.parts[r.part] && J(cap(() => launchPart(r.part), RB)) === J(rng);
      void c0;
      // Clip ziehen (UX2: Szene 1 → 3) nach dem Konsolidieren: Teil klingt gleich, Zurückholen findet den Clip
      const mv = A.ux2Exchange(0, 0, 0, 2);
      const where = S.tracks[0].clips.map((c, s) => c ? s + (c.lw ? 'lw' : '') : null).filter(Boolean);
      out.ux2 = {mv: !!mv, where: where.join(' ')};
      out.ux2Part = J(cap(() => launchPart(r.part), RB)).replace(/\[0,/g, '[0,') === J(rng);
      const m2 = S.song.marks.find(m => m.part === S.parts[r.part].id);
      out.ux2Back = !!A.zurueckholen(m2.id) && S.tracks[0].clips.every(c => !c || !c.lw);
      out.ux2Song = J(cap(() => songPlayStart(0), bars * 4)) === J(sNow);
    }
    return out;
  }, [scen, variant]);
  await p.close();
  return Object.assign(r, r2);
}

for (const scen of SCENS) for (const v of VARS) {
  if (ONLY.length && !ONLY.includes(v) && !ONLY.includes(scen + '/' + v)) continue;
  let r;
  try { r = await runCase(scen, v); } catch (e) { ok(scen + '/' + v + ' lief', false, String(e).slice(0, 400)); continue; }
  const tag = scen + '/' + v;
  // MIDI: der eingefügte Teil (hinten) = der Bereich (vorher, Spur 1 = Track-Chunk 1)
  const m0 = midiNotes(r.midi0, 1), m1 = midiNotes(r.midi1, 1), A0 = r.ra * 4, E0 = r.re * 4, off = r.bars * 4;
  const mR = m0.filter(x => x[1] >= A0 - 1e-6 && x[1] < E0 - 1e-6).map(x => [x[0], +(x[1] - A0).toFixed(3), x[2]]);
  const mP = m1.filter(x => x[1] >= off - 1e-6 && x[1] < off + E0 - A0 - 1e-6).map(x => [x[0], +(x[1] - off).toFixed(3), x[2]]);
  const midiOk = JSON.stringify(mR) === JSON.stringify(mP);
  delete r.midi0; delete r.midi1;
  ok(tag + ' Teil klingt wie der Bereich (' + r.nRange + ' Noten' + (r.ext ? ', erweitert' : '') + ')', r.part, r.partD ? {d: r.partD, x: r.partX} : r);
  ok(tag + ' Song danach unverändert', r.song1);
  ok(tag + ' Teil im Song eingefügt klingt wie der Bereich', r.placed, r.placedD);
  ok(tag + ' MIDI-Export: eingefügter Teil = Bereich', midiOk, {mR: mR.map(x => x[0] + '@' + x[1]).join(' '), mP: mP.map(x => x[0] + '@' + x[1]).join(' ')});
  ok(tag + ' Video-Clip „ganz“ ohne LAUF-Plan (wie gespielt)', r.vvPlain || !r.ext, r.vvPlain);
  if (r.ext) ok(tag + ' Fenster ◀/▶ verschoben – Teil klingt gleich', r.winMove === true, r.winMove);
  ok(tag + ' Speichern/Laden – Teil klingt gleich', r.reload === true, {reload: r.reload, lw: r.reloadLw});
  if (r.err) { ok(tag + ' Regression', false, r.err); continue; }
  ok(tag + ' Zurückholen: Clip ohne Erweiterung, Song gleich', r.back && r.backLw && r.backSong, {back: r.back, lw: r.backLw, song: r.backSong});
  ok(tag + ' ↶ Zurückholen: Teil wieder da, klingt gleich', r.undoBack);
  ok(tag + ' ↷ Zurückholen', r.redoBack);
  ok(tag + ' ↶ Konsolidieren: Clip wie vorher, kein Teil', r.undoKon);
  ok(tag + ' ↷ Konsolidieren: Teil klingt gleich', r.redoKon);
  ok(tag + ' Clip ziehen (ux2) danach: Teil klingt gleich', r.ux2 && r.ux2.mv && r.ux2Part, r.ux2);
  ok(tag + ' Clip ziehen danach: Zurückholen findet den Clip, Song gleich', r.ux2Back && r.ux2Song, {b: r.ux2Back, s: r.ux2Song});
  if (RT) ok(tag + ' Echtzeit-Gegenprobe (noteLog) = Zeitraffer', r.rtSong && r.rtPart, {song: r.rtSong, part: r.rtPart});
  console.log('     ' + tag + ' erweitert: ' + (r.ext ? 'ja' : 'nein') + (r.lwKeys ? ' · lw ' + r.lwKeys + ' · Fenster ' + JSON.stringify(r.win) : ''));
}
const fail = res.filter(x => !x.ok);
console.log('\nA2-Test: ' + (res.length - fail.length) + '/' + res.length + ' OK · errors ' + JSON.stringify(errs.slice(0, 6)));
fs.writeFileSync(OUT + 'a2-test.json', JSON.stringify({file: FILE, ok: res.length - fail.length, n: res.length, fail, errs, res}, null, 1));
await b.close();
process.exit(fail.length || errs.length ? 1 : 0);
