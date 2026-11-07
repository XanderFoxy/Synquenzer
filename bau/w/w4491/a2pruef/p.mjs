// Unabhängige Prüfung A2: eigene Fälle. node p.mjs <index.html> [nur=C1,C2]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const FILE = path.resolve(process.argv[2]);
const ONLY = (process.argv.find(a => a.startsWith('nur=')) || '').slice(4).split(',').filter(Boolean);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [], res = [];
const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info !== undefined && !cond ? ' · ' + JSON.stringify(info).slice(0, 1400) : '')); };

function midiNotes(bytes, k) {
  const u = Uint8Array.from(bytes); let p = 14, trk = -1; const out = [];
  const ppq = (u[12] << 8) | u[13];
  while (p < u.length) {
    const len = (u[p + 4] << 24) | (u[p + 5] << 16) | (u[p + 6] << 8) | u[p + 7]; trk++;
    if (trk === k) {
      let q = p + 8, end = q + len, tk = 0, rs = 0;
      while (q < end) {
        let d = 0, c; do { c = u[q++]; d = (d << 7) | (c & 127); } while (c & 128); tk += d;
        let st = u[q]; if (st & 128) q++; else st = rs;
        if (st === 0xFF) { q++; let l = 0; do { c = u[q++]; l = (l << 7) | (c & 127); } while (c & 128); q += l; continue; }
        if (st === 0xF0 || st === 0xF7) { let l = 0; do { c = u[q++]; l = (l << 7) | (c & 127); } while (c & 128); q += l; continue; }
        rs = st; const hi = st & 0xF0, a1 = u[q++], a2 = (hi === 0xC0 || hi === 0xD0) ? 0 : u[q++];
        if (hi === 0x90 && a2 > 0) out.push({n: a1, tk, e: null});
        else if (hi === 0x80 || (hi === 0x90 && a2 === 0)) { const o = out.find(x => x.n === a1 && x.e == null && x.tk <= tk); if (o) o.e = tk; }
      }
      return out.map(x => [x.n, +(x.tk / ppq).toFixed(3)]).sort((x, y) => x[1] - y[1] || x[0] - y[0]);
    }
    p += 8 + len;
  }
  return out;
}

// Fälle: Aufbau im Browser (Text, mit A = SYNQUENZER). ra/re: Takte [ra, re). Rückgabe: {bars, ra, re, tr}
const CASES = {
  // pend, Bereich mitten im Song (Zähler > 0), eigener Clip mit Zusatznote in Takt 5
  C1: `const c = mk(0, 1, {dir:'pend'}); song(8, [[{bar:0,slot:0}]]); own(0, 4, 3.25, 86); return {ra:3, re:7};`,
  // rnd, 2-Takt-Clip, Bereich = genau ein eigener 2-Takt-Durchlauf (Teil-Grenzen = Clip-Grenzen)
  C2: `mk(0, 2, {dir:'rnd', seed:13}); song(6, [[{bar:0,slot:0}]]); own(0, 2, 6.5, 88); return {ra:2, re:4};`,
  // Chance + rev + Schrittlänge 1/8 + Wirbel + Transponieren, Spur mit Neustart (re) bei Takt 3, eigener Clip Takt 4
  C3: `const c = mk(0, 1, {dir:'rev', g:'1/8'}, n => { n[1].pb=.5; n[2].rt=3; n[3].tp=5; n[6].pb=.35; });
       song(6, [[{bar:0,slot:0},{bar:2,slot:0,re:1}]]); own(0, 3, 3.5, 84, {pb:.6}); return {ra:1, re:5};`,
  // Startschritt fwd, eigener Clip mit EIGENER Richtung (rev)
  C4: `mk(0, 1, {st:5}); song(4, [[{bar:0,slot:0}]]); own(0, 1, 3.75, 84, null, {dir:'rev'}); return {ra:0, re:4};`,
  // Szenen-Clip OHNE LAUF, eigener Clip mit LAUF (rev)
  C5: `mk(0, 1, null); song(4, [[{bar:0,slot:0}]]); own(0, 2, 3.75, 84, null, {dir:'rev'}); return {ra:0, re:4};`,
  // zwei Spuren: Spur 0 Zufall, Spur 1 ohne LAUF mit eigenem Clip; Bereich 2 Takte mitten im Song
  C6: `mk(0, 1, {dir:'rnd', seed:3}); mk(1, 1, null); song(6, [[{bar:0,slot:0}],[{bar:0,slot:0}]]); own(1, 3, 2.5, 72); own(0, 2, 1.25, 90); return {ra:2, re:4};`,
  // Phase (ph) im Song: Spur springt in Takt 2 um einen halben Takt, pend, eigener Clip in Takt 3
  C7: `mk(0, 1, {dir:'pend'}); song(5, [[{bar:0,slot:0},{bar:2,slot:0,ph:2}]]); own(0, 3, 0.75, 85); return {ra:1, re:5};`,
  // 4-Takt-Clip rev (über 4 Takte), Bereich 2 Takte in der Mitte mit eigenem Clip → Fenster hinter dem Bereich
  C8: `mk(0, 4, {dir:'rev'}); song(8, [[{bar:0,slot:0}]]); own(0, 1, 5.5, 88); return {ra:1, re:3};`,
  // nur Chance (kein lf), Bereich ohne eigenen Clip mitten im Song (Durchlauf-Zähler)
  C9: `mk(0, 1, null, n => { n[0].pb=.5; n[3].pb=.4; n[5].pb=.7; }); song(8, [[{bar:0,slot:0}]]); return {ra:3, re:5};`,
  // rückwärts, 1 Takt, Bereich über 2 Takte mit eigenem Clip (Original-Befund, kurz)
  C10: `mk(0, 1, {dir:'rev'}); song(4, [[{bar:0,slot:0}]]); own(0, 2, 3.75, 84); return {ra:2, re:4};`,
  // 2-Takt-Clip hin-her, Bereich beginnt mitten im Durchlauf ohne eigenen Clip (nicht erweitert? muss trotzdem gleich klingen)
  C11: `mk(0, 2, {dir:'rev'}); song(6, [[{bar:0,slot:0}]]); return {ra:1, re:3};`,
  // Drums: Chance + Wirbel + Akzent + Verschiebung, eigener Clip, Bereich mitten im Song
  D2: `dk(1, n => { n[2].p=.5; n[3].p=.3; n[6].p=.6; n[6].r=3; n[9].a=1; n[9].p=.7; n[11].m=.2; n[14].p=.4; }); dsong(8); own(DRUM_T, 4, 2.5, 38); return {ra:3, re:7};`,
  // Drums: nur Chance, kein eigener Clip, Bereich mitten im Song (nicht erweitert hieße: Zähler ab Teil-Anfang)
  D3: `dk(1, n => { for (const k of [1,3,5,7,9,11,13,15]) n[k].p=.5; }); dsong(8); return {ra:2, re:4};`,
  // Drums: 2-Takt-Clip mit Chance, Bereich ab Takt 1 (Anfang = Zähler 0: nicht erweitern, Daten wie bisher)
  D4: `dk(2, n => { for (const k of [1,3,5,7]) n[k].p=.5; }); dsong(4); return {ra:0, re:2};`,
};

async function runCase(name) {
  const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  p.on('pageerror', e => errs.push(name + ' PE ' + String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(name + ' ' + m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(700);
  await p.touchscreen.tap(5, 300); await p.waitForTimeout(250);
  const r = await p.evaluate(async ([name, code]) => {
    const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), J = x => JSON.stringify(x);
    ensureAudio(); for (let k = 0; k < 40 && !(AU.ctx && AU.ctx.state === 'running'); k++) await sl(50);
    if (R.playing) stop(); A.setMetronome(false); A.setBpm(240); S.settings.countIn = 0; A.resetCarrier();
    for (const tr of S.tracks) tr.clips = tr.clips.map(() => null);
    partsEnsure(); S.parts = S.parts.map(() => null);
    const sc = [0, 2, 4, 5, 7, 9, 11, 12, 14, 12, 11, 9, 7, 5, 4, 2];
    const mk = (t, len, lf, fx) => {
      const notes = Array.from({length: len * 8}, (_, i) => ({t: i * .5, d: .3, n: 55 + t * 5 + sc[i % 16], v: .5 + (i % 5) * .1}));
      const c = normClip({len, key: {root: 0, scale: 'major'}, notes}, 'synth', S.key); c.key.src = 'user';
      if (lf) c.lf = lf; if (fx) fx(c.notes);
      S.tracks[t].clips[0] = normClip(cleanClip(c), 'synth', S.key); return S.tracks[t].clips[0];
    };
    const song = (bars, ls) => { const lanes = Array.from({length: NT()}, (_, i) => ls[i] || []); A.setSong({bars, lanes, carrier: [], mel: {}, marks: []}); };
    const own = (t, bar, xt, xn, ex, lf) => {
      A.makeOwn(t, bar, false); const o = ownRun(S.song, t, bar), id = o && o.o.own, c = S.song.own[id];
      if (!c) throw new Error('kein eigener Clip ' + t + '/' + bar);
      c.notes.push(Object.assign({t: xt, d: .2, n: xn, v: .9}, ex || null)); c.notes.sort((u, v) => u.t - v.t);
      if (lf) c.lf = lf;
    };
    const dk = (len, fx) => { const notes = []; for (let i = 0; i < len * 16; i++) notes.push({t: i * .25, d: .1, n: [36, 42, 38, 42][i % 4], v: .7 + (i % 3) * .1}); if (fx) fx(notes);
      S.tracks[DRUM_T].clips[0] = normClip({len, notes}, 'drum', S.key); return S.tracks[DRUM_T].clips[0]; };
    const dsong = bars => { const ls = []; ls[DRUM_T] = [{bar: 0, slot: 0}]; song(bars, ls); };
    const cfg = (new Function('A', 'mk', 'song', 'own', 'dk', 'dsong', code))(A, mk, song, own, dk, dsong);
    restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged(); UNDO.length = 0; REDO.length = 0;
    const bars = S.song.bars, {ra, re} = cfg, A0 = barBeat(ra), E0 = barBeat(re), RB = E0 - A0;
    const cap = (start, beats) => {
      if (R.playing) stop(); if (R.songPlay) songPlayEnd(true);
      const ev = [], orig = spawnClipVoice, od = drumHit;
      spawnClipVoice = (i, out, vel, t, dur) => { ev.push([i, out, +t2b(t).toFixed(3), +(dur / spb()).toFixed(3), +vel.toFixed(2)]); return null; };
      drumHit = (gm, vel, t, src, ex) => { if (src === 'clip') ev.push([DRUM_T, gm, +t2b(t).toFixed(3), ex && ex.acc ? 1 : 0, +vel.toFixed(2)]); return null; };
      try { start(); for (let h = .02; h < 200 && R.playing && R.schedBeat < beats + .5; h += .02) tick(h); }
      finally { stop(); if (R.songPlay) songPlayEnd(true); spawnClipVoice = orig; drumHit = od; }
      return ev.filter(e => e[2] >= -1e-6 && e[2] < beats - 1e-6).sort((x, y) => x[2] - y[2] || x[0] - y[0] || x[1] - y[1]);
    };
    const win = (ev, a, e) => ev.filter(x => x[2] >= a - 1e-6 && x[2] < e - 1e-6).map(x => [x[0], x[1], +(x[2] - a).toFixed(3), x[3], x[4]]);
    const diff = (want, got) => { const k1 = got.map(J), k0 = want.map(J); return {nurVorher: want.filter(x => !k1.includes(J(x))).slice(0, 10), nurNachher: got.filter(x => !k0.includes(J(x))).slice(0, 10), nW: want.length, nG: got.length}; };
    const out = {name, bars, ra, re};
    const s0 = cap(() => songPlayStart(0), barBeat(bars)), rng0 = win(s0, A0, E0);
    out.n = rng0.length;
    // Konsolidieren
    const r = A.konsolidieren(ra, re - 1, 'Kern'); out.ext = r.ext;
    out.lw = S.tracks.map((tr, t) => tr.clips[0] && tr.clips[0].lw ? t + ':' + Object.keys(tr.clips[0].lw).sort().join(',') + ' a=' + tr.clips[0].lw.a + ' sk=' + (tr.clips[0].lw.sk || 0) : null).filter(Boolean);
    out.clipAfter = S.tracks.map(tr => tr.clips[0] ? JSON.stringify(cleanClip(tr.clips[0])) : null);
    const p1 = cap(() => launchPart(r.part), RB);
    out.part = J(p1) === J(rng0); if (!out.part) out.partD = diff(rng0, p1);
    const s1 = cap(() => songPlayStart(0), barBeat(bars));
    out.song1 = J(s1) === J(s0); if (!out.song1) out.song1D = diff(s0, s1);
    // Teil zweimal hintereinander gestartet? (Teil = RB lang: die zweite Runde gleich der ersten)
    // Song-Render: den Teil ans Ende einfügen; Wiedergabe + MIDI des eingefügten Teils
    const keep = songSnapshot();
    placePart(r.part, bars, 'insert');
    const s2 = cap(() => songPlayStart(0), barBeat(bars) + RB), pl = win(s2, barBeat(bars), barBeat(bars) + RB);
    out.placed = J(pl) === J(rng0); if (!out.placed) out.placedD = diff(rng0, pl);
    out.midi = Array.from(buildMidiSong(false).bytes);
    out.played = s2.map(x => [x[0], x[1], x[2]]);
    out.endB = barBeat(bars);
    // Teil ersetzt den Bereich (replace an derselben Stelle): der Song klingt im Bereich gleich
    restoreSong(JSON.parse(keep)); songTidy(S.song); songChanged();
    placePart(r.part, ra, 'replace');
    const s3 = cap(() => songPlayStart(0), barBeat(bars));
    out.repl = J(win(s3, A0, E0)) === J(rng0); if (!out.repl) out.replD = diff(rng0, win(s3, A0, E0));
    out.replAfter = J(win(s3, E0, barBeat(bars))) === J(win(s0, E0, barBeat(bars)));
    if (!out.replAfter) out.replAfterD = diff(win(s0, E0, barBeat(bars)), win(s3, E0, barBeat(bars)));
    restoreSong(JSON.parse(keep)); songTidy(S.song); songChanged();
    // Video: vvClip ganz
    out.vv = S.tracks.every((tr, t) => !tr.clips[0] || !tr.clips[0].lw || (w => w && !w.lw && !lf1Plan(w))(vvClip(t, 0, '~')));
    // Speichern / Laden
    { const js = serializeProject(); importJSON(js); await sl(400); const k = S.parts.findIndex(x => x && x.name === 'Kern'); const pp = k >= 0 ? cap(() => launchPart(k), RB) : null; out.reload = !!pp && J(pp) === J(rng0); if (!out.reload) out.reloadD = pp ? diff(rng0, pp) : 'kein Teil'; }
    // Zurückholen
    { const mk_ = S.song.marks.find(m => m.part && S.parts[+m.part.slice(1) - 1] && S.parts[+m.part.slice(1) - 1].name === 'Kern');
      out.back = !!mk_ && A.zurueckholen(mk_.id); out.backLw = S.tracks.every(tr => !tr.clips[0] || !tr.clips[0].lw);
      const s4 = cap(() => songPlayStart(0), barBeat(bars)); out.backSong = J(s4) === J(s0); if (!out.backSong) out.backSongD = diff(s0, s4);
      // ↶ Zurückholen → Teil klingt gleich
      undo(); await sl(50); const k2 = S.parts.findIndex(x => x && x.name === 'Kern');
      const p5 = k2 >= 0 ? cap(() => launchPart(k2), RB) : null; out.undoBack = !!p5 && J(p5) === J(rng0); if (!out.undoBack) out.undoBackD = p5 ? diff(rng0, p5) : 'kein Teil';
    }
    // Matrix: der Szenen-Clip (Fenster) klingt wie vorher
    return out;
  }, [name, CASES[name]]);
  await p.close();
  return r;
}

for (const name of Object.keys(CASES)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  let r;
  try { r = await runCase(name); } catch (e) { ok(name + ' lief', false, String(e).slice(0, 600)); continue; }
  const RB = (r.re - r.ra) * 4;
  // MIDI des eingefügten Teils (alle Spuren) gegen das Gespielte im eingefügten Teil
  let mOk = true; const md = [];
  for (const t of [0, 1, 4]) {
    const m = midiNotes(r.midi, t + 1).filter(x => x[1] >= r.endB - 1e-6 && x[1] < r.endB + RB - 1e-6).map(x => [x[0], +(x[1] - r.endB).toFixed(3)]);
    const pl = r.played.filter(x => x[0] === t && x[2] >= r.endB - 1e-6 && x[2] < r.endB + RB - 1e-6).map(x => [x[1], +(x[2] - r.endB).toFixed(3)]).sort((x, y) => x[1] - y[1] || x[0] - y[0]);
    if (JSON.stringify(m) !== JSON.stringify(pl)) { mOk = false; md.push({t, midi: m.map(x => x[0] + '@' + x[1]).join(' '), played: pl.map(x => x[0] + '@' + x[1]).join(' ')}); }
  }
  const tag = name + ' (' + r.n + ' Noten, erweitert ' + r.ext + ', ' + r.lw.join(' | ') + ')';
  console.log('     ' + name + ' Clip-Daten danach #' + (await import('node:crypto')).createHash('md5').update(JSON.stringify(r.clipAfter)).digest('hex').slice(0, 10));
  ok(tag + ' Teil = Bereich', r.part, r.partD);
  ok(name + ' Song danach gleich', r.song1, r.song1D);
  ok(name + ' Teil eingefügt = Bereich', r.placed, r.placedD);
  ok(name + ' MIDI-Export eingefügter Teil = gespielt', mOk, md);
  ok(name + ' Teil ersetzt Bereich: Bereich gleich', r.repl, r.replD);
  ok(name + ' Teil ersetzt Bereich: Takte danach gleich (Info)', r.replAfter, r.replAfterD);
  ok(name + ' Video ganz ohne LAUF', r.vv);
  ok(name + ' Laden: Teil = Bereich', r.reload, r.reloadD);
  ok(name + ' Zurückholen: Song gleich, kein lw', r.back && r.backLw && r.backSong, {b: r.back, lw: r.backLw, d: r.backSongD});
  ok(name + ' ↶ Zurückholen: Teil = Bereich', r.undoBack, r.undoBackD);
}
const fail = res.filter(x => !x.ok);
console.log('\nPrüfung: ' + (res.length - fail.length) + '/' + res.length + ' OK · errors ' + JSON.stringify(errs.slice(0, 6)));
await b.close();
