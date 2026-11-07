// Unabhängige Prüfung A2, Teil 2: Fenster ◀ ▶, Länge, LAUF danach geändert, Drums mit Chance. node p2.mjs <index.html> [nur=…]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const FILE = path.resolve(process.argv[2]);
const ONLY = (process.argv.find(a => a.startsWith('nur=')) || '').slice(4).split(',').filter(Boolean);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [], res = [];
const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info !== undefined && !cond ? ' · ' + JSON.stringify(info).slice(0, 900) : '')); };

const CASES = {
  W1: {code: `mk(0, 1, {dir:'pend'}); song(8, [[{bar:0,slot:0}]]); own(0, 4, 3.25, 86); return {ra:3, re:7};`},
  W2: {code: `mk(0, 1, {dir:'rnd', seed:21}, n => { n[2].pb=.5; }); song(6, [[{bar:0,slot:0}]]); own(0, 2, 1.75, 86); return {ra:1, re:5};`},
  W3: {code: `mk(0, 2, {dir:'rev', g:'1/8'}, n => { n[4].rt=2; }); song(8, [[{bar:0,slot:0}]]); own(0, 2, 6.25, 86); return {ra:2, re:6};`},
  // Drums: Chance je Schritt (p), eigener Clip mit Zusatz-Treffer, Bereich mitten im Song
  D1: {drum: true, code: `const t = DRUM_T; const notes = []; for (let i = 0; i < 16; i++) notes.push({t: i*.25, d:.1, n: i%4===0?36:42, v:.8, p: i%4===0?undefined:.5});
       S.tracks[t].clips[0] = normClip({len:1, notes: notes.map(n => { const x = Object.assign({}, n); if (x.p == null) delete x.p; return x; })}, 'drum', S.key);
       const lanes = Array.from({length: NT()}, () => []); lanes[t] = [{bar:0,slot:0}]; A.setSong({bars:6, lanes, carrier:[], mel:{}, marks:[]});
       A.makeOwn(t, 2, false); const o = ownRun(S.song, t, 2), c = S.song.own[o.o.own]; c.notes.push({t:2.5, d:.1, n:38, v:.9}); c.notes.sort((u,v)=>u.t-v.t);
       return {ra:1, re:5, t};`},
};

async function runCase(name) {
  const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  p.on('pageerror', e => errs.push(name + ' PE ' + String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(name + ' ' + m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(700);
  await p.touchscreen.tap(5, 300); await p.waitForTimeout(250);
  const r = await p.evaluate(async ([name, C]) => {
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
      c.notes.push(Object.assign({t: xt, d: .2, n: xn, v: .9}, ex || null)); c.notes.sort((u, v) => u.t - v.t); if (lf) c.lf = lf;
    };
    const cfg = (new Function('A', 'mk', 'song', 'own', C.code))(A, mk, song, own);
    restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged(); UNDO.length = 0; REDO.length = 0;
    const T = cfg.t || 0, bars = S.song.bars, {ra, re} = cfg, A0 = barBeat(ra), E0 = barBeat(re), RB = E0 - A0;
    const cap = (start, beats) => {
      if (R.playing) stop(); if (R.songPlay) songPlayEnd(true);
      const ev = [], orig = spawnClipVoice, od = drumHit;
      spawnClipVoice = (i, out, vel, t, dur) => { ev.push([i, out, +t2b(t).toFixed(3), +(dur / spb()).toFixed(3), +vel.toFixed(2)]); return null; };
      drumHit = (gm, vel, t, src) => { if (src === 'clip') ev.push([DRUM_T, gm, +t2b(t).toFixed(3), 0, +vel.toFixed(2)]); return null; };
      try { start(); for (let h = .02; h < 200 && R.playing && R.schedBeat < beats + .5; h += .02) tick(h); }
      finally { stop(); if (R.songPlay) songPlayEnd(true); spawnClipVoice = orig; drumHit = od; }
      return ev.filter(e => e[2] >= -1e-6 && e[2] < beats - 1e-6).sort((x, y) => x[2] - y[2] || x[0] - y[0] || x[1] - y[1]);
    };
    const win = (ev, a, e) => ev.filter(x => x[2] >= a - 1e-6 && x[2] < e - 1e-6).map(x => [x[0], x[1], +(x[2] - a).toFixed(3), x[3], x[4]]);
    const diff = (want, got) => { const k1 = got.map(J), k0 = want.map(J); return {nurVorher: want.filter(x => !k1.includes(J(x))).slice(0, 8), nurNachher: got.filter(x => !k0.includes(J(x))).slice(0, 8), nW: want.length, nG: got.length}; };
    const out = {name};
    const s0 = cap(() => songPlayStart(0), barBeat(bars)), rng0 = win(s0, A0, E0); out.n = rng0.length;
    const mClip = cap(() => { launchClip(T, 0); }, 8);           // Matrix: der Clip allein (vorher)
    const r = A.konsolidieren(ra, re - 1, 'Kern'); out.ext = r.ext; const c = S.tracks[T].clips[0];
    out.lw = c.lw ? Object.keys(c.lw).sort().join(',') + ' a=' + c.lw.a + ' b=' + c.lw.b + ' len=' + c.lw.len + ' sk=' + (c.lw.sk || 0) : null;
    const part = () => cap(() => launchPart(r.part), RB);
    const p1 = part(); out.part = J(p1) === J(rng0); if (!out.part) out.partD = diff(rng0, p1);
    const mClip1 = cap(() => { launchClip(T, 0); }, 8); out.matrix = J(mClip1) === J(mClip); if (!out.matrix) out.matrixD = diff(mClip, mClip1);
    if (c.lw) {
      // ◀ ▶ alle Stellungen
      const W = [];
      for (let k = 0; k < 6; k++) { if (!A.clipWindowMove(T, 0, 1)) break; const q = part(); W.push(J(q) === J(rng0) ? 1 : J(diff(rng0, q))); }
      for (let k = 0; k < 8; k++) { if (!A.clipWindowMove(T, 0, -1)) break; const q = part(); W.push(J(q) === J(rng0) ? 1 : J(diff(rng0, q))); }
      out.moves = W;
      // Länge −1/+1 (Fenster), ½, ×2
      const L = []; const keepC = cleanClip(c);
      for (const f of [.5, 2, 1, -1]) { clipLength(T, 0, f); const q = part(); L.push(f + ':' + (J(q) === J(rng0) ? 'gleich' : J(diff(rng0, q)).slice(0, 300))); }
      out.lens = L;
      S.tracks[T].clips[0] = normClip(keepC, S.tracks[T].kind, S.key); clipChanged(T, 0);
      const q2 = part(); out.back = J(q2) === J(rng0);
      // Undo-Kette: alles zurück, Teil gleich
      while (UNDO.length) undo(); await sl(30); out.undoAll = !S.tracks[T].clips[0].lw;
      while (REDO.length) redo(); await sl(30); { const k = S.parts.findIndex(x => x && x.name === 'Kern'); const q = k >= 0 ? cap(() => launchPart(k), RB) : null; out.redoAll = !!q && J(q) === J(rng0); if (!out.redoAll) out.redoAllD = q ? diff(rng0, q) : 'kein Teil'; }
      // LAUF danach geändert (nur Synth): der Teil folgt dem neuen LAUF (kein Absturz, Daten bleiben), zurück → wieder gleich
      if (!cfg.t) {
        const c2 = S.tracks[T].clips[0], lf0 = c2.lf ? Object.assign({}, c2.lf) : null;
        c2.lf = {dir: 'pend'}; clipChanged(T, 0); const q = part(); out.lfChanged = q.length > 0;
        if (lf0) c2.lf = lf0; else delete c2.lf; clipChanged(T, 0); const q3 = part(); out.lfBack = J(q3) === J(rng0); if (!out.lfBack) out.lfBackD = diff(rng0, q3);
      }
    }
    return out;
  }, [name, CASES[name]]);
  await p.close();
  return r;
}
for (const name of Object.keys(CASES)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  let r; try { r = await runCase(name); } catch (e) { ok(name + ' lief', false, String(e).slice(0, 600)); continue; }
  ok(name + ' (' + r.n + ' Ereignisse, erw ' + r.ext + ', ' + r.lw + ') Teil = Bereich', r.part, r.partD);
  ok(name + ' Matrix-Clip danach wie vorher', r.matrix, r.matrixD);
  if (r.moves) ok(name + ' Fenster ◀ ▶ (' + r.moves.length + ' Stellungen) Teil gleich', r.moves.every(x => x === 1), r.moves.filter(x => x !== 1));
  if (r.lens) ok(name + ' Länge ½ ×2 +1 −1: Teil gleich', r.lens.every(x => x.endsWith('gleich')), r.lens);
  if (r.back !== undefined) ok(name + ' Clip zurückgesetzt: Teil gleich', r.back);
  if (r.undoAll !== undefined) ok(name + ' ↶ alles / ↷ alles: Teil gleich', r.undoAll && r.redoAll, {u: r.undoAll, d: r.redoAllD});
  if (r.lfBack !== undefined) ok(name + ' LAUF geändert und zurück: Teil gleich', r.lfChanged && r.lfBack, r.lfBackD);
}
const fail = res.filter(x => !x.ok);
console.log('\nPrüfung 2: ' + (res.length - fail.length) + '/' + res.length + ' OK · errors ' + JSON.stringify(errs.slice(0, 6)));
await b.close();
