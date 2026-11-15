import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    n = s.count(a)
    if n != 1: raise SystemExit('Treffer %d für: %r' % (n, a[:90]))
    s = s.replace(a, b)

# --- Kopf-Kommentar: Prüfung
rep("""   Kein Projektfeld (die Auswahl lebt nur zur Laufzeit), kein Formatwechsel. */""",
"""   • Prüfung (15.11.): ↶ ↷ in der Leiste (die Leiste deckt das ↶ der Spur-Leiste); Hinweise nach einer Aktion ohne Aktionsknopf und
     über der Leiste. Große Auswahl blockweise (≈ 8 ms je Aufgabe, ein Bild dazwischen), Vorschaubilder gestaffelt (Haken renderGrid),
     afterClipEdit einmal je Clip. ↶ ↷ eines MTX4-Schritts im Lauf ebenfalls am nächsten Taktstrich (Haken undo/redo).
     Pentatonik: leitereigene Töne bleiben, fremde zum Nachbarn. Höchstens EINE automatische Version je Clip (nur wenn er noch keine
     hat und als v1 im Song spielt). ÷2 bei ungerader Länge sagt es im Hinweis.
   Kein Projektfeld (die Auswahl lebt nur zur Laufzeit), kein Formatwechsel. */""")

rep("""const M4 = {on: false, sel: [], drums: false, bar: null, rows: null, btn: {}, hold: [], inSched: false, press: null, iv: 0, proj: null, n: 0, last: null, lay: '', range: 0, ver: []};""",
"""const M4 = {on: false, sel: [], drums: false, bar: null, rows: null, btn: {}, hold: [], inSched: false, press: null, iv: 0, proj: null, n: 0, last: null, lay: '', range: 0, ver: [],
  job: null, q: [], stag: 0, thN: 0, th0: 0, thDef: false, thMax: 0};""")

# --- CSS: Hinweis über der Leiste, solange sie steht
rep("""      '@media (orientation:landscape){#clipSheet .cs3 .cgrid .hb.mtx4cs{height:44px;align-self:center}}';   // wie [Werkzeugkasten ▾]""",
"""      'body.mtx4m #toast{z-index:72}' +                                   // Prüfung 1: was man sieht, tippt man – nie ein Leisten-Knopf unter einem Hinweis
      '@media (orientation:landscape){#clipSheet .cs3 .cgrid .hb.mtx4cs{height:44px;align-self:center}}';   // wie [Werkzeugkasten ▾]""")

# --- Prüfung 10: kein Hinweis nach jedem Tipp (der Zähler in der Leiste zeigt es)
rep("""  const on = mtx4Set(t, s); haptic('tick'); mtx4Say(); UI.dirty.grid = true; mtx4Sync();
  return on;""", """  const on = mtx4Set(t, s); haptic('tick'); UI.dirty.grid = true; mtx4Sync();      // Prüfung 10: der Zähler der Leiste sagt es (kein Hinweis über den Szenen-Köpfen)
  return on;""")
rep("""  for (const t of L) mtx4Set(t, s, !all);
  haptic('tick'); mtx4Say(); UI.dirty.grid = true; mtx4Sync();""", """  for (const t of L) mtx4Set(t, s, !all);
  haptic('tick'); UI.dirty.grid = true; mtx4Sync();""")

# --- Markierung: Zähler der gestaffelten Vorschaubilder zurücksetzen
rep("""function mtx4Grid() {
  if (!EL.grid || !UI.cells) return;""", """function mtx4Grid() {
  if (M4.thDef) UI.dirty.grid = true;                                // Prüfung 2: zurückgestellte Vorschaubilder im nächsten Bild
  M4.thN = 0; M4.thDef = false;
  if (!EL.grid || !UI.cells) return;""")

# --- Leiste: ↶ ↷
rep("""    x: mk('x', '✕', 'Auswahl beenden', 'x'),""", """    x: mk('x', '✕', 'Auswahl beenden', 'x'),
    un: mk('un', '↶', 'Rückgängig', 'x'), re: mk('re', '↷', 'Wiederholen', 'x'),          // Prüfung 1: die Leiste deckt das ↶ der Spur-Leiste""")
rep("""  if (k === 'x') { mtx4End(); sx4Say('Auswahl beendet'); return; }""", """  if (k === 'x') { mtx4End(); sx4Say('Auswahl beendet'); return; }
  if (k === 'un' || k === 're') { mtx4Undo(k === 're'); return; }""")
rep("""  if (land) { R4[0].append(B.n, ...dr, B.x); R4[1].append(B.m12, B.m1, B.p1, B.p12); R4[2].append(B.su, B.sd, B.h2, B.x2); R4[3].append(B.fit, B.q); }
  else { R4[0].append(B.n, ...dr, B.fit, B.q, B.x); R4[1].append(B.m12, B.m1, B.p1, B.p12, B.su, B.sd, B.h2, B.x2); }""",
"""  if (land) { R4[0].append(B.n, ...dr, B.x); R4[1].append(B.m12, B.m1, B.p1, B.p12); R4[2].append(B.su, B.sd, B.h2, B.x2); R4[3].append(B.fit, B.q, B.un, B.re); }
  else { R4[0].append(B.n, ...dr, B.fit, B.q, B.un, B.re, B.x); R4[1].append(B.m12, B.m1, B.p1, B.p12, B.su, B.sd, B.h2, B.x2); }""")
# mtx4Sync: Körper-Klasse + ↶ ↷ blass ohne Schritt
rep("""  if (!M4.on) { if (M4.bar) M4.bar.hidden = true; if (M4.iv) { clearInterval(M4.iv); M4.iv = 0; } UI.dirty.grid = true; return; }""",
"""  if (!M4.on) { if (M4.bar) M4.bar.hidden = true; if (M4.iv) { clearInterval(M4.iv); M4.iv = 0; } document.body.classList.remove('mtx4m'); UI.dirty.grid = true; return; }""")
rep("""  if (b.hidden !== hide) b.hidden = hide;
  if (hide) return;""", """  if (b.hidden !== hide) b.hidden = hide;
  if (document.body.classList.contains('mtx4m') === hide) document.body.classList.toggle('mtx4m', !hide);
  if (hide) return;""")
rep("""  for (const k of ['m12', 'm1', 'p1', 'p12', 'su', 'sd', 'h2', 'x2', 'fit', 'q']) { const off = !c.n; if (M4.btn[k].classList.contains('dim') !== off) M4.btn[k].classList.toggle('dim', off); }""",
"""  for (const k of ['m12', 'm1', 'p1', 'p12', 'su', 'sd', 'h2', 'x2', 'fit', 'q']) { const off = !c.n; if (M4.btn[k].classList.contains('dim') !== off) M4.btn[k].classList.toggle('dim', off); }
  for (const [k, A] of [['un', UNDO], ['re', REDO]]) { const off = !A.length; if (M4.btn[k].classList.contains('dim') !== off) M4.btn[k].classList.toggle('dim', off); }""")

# --- Kern: mtx4HoldSet mit gemeinsamem Taktstrich
rep("""function mtx4HoldSet(t, s, old) {
  if (!R.playing || !AU.ctx || R.slot[t] !== s || (typeof ownPlaying === 'function' && ownPlaying(t))) return;
  const c = S.tracks[t].clips[s], h = M4.hold[t];
  if (h && h.s === s && h.clip === c && h.bar > R.schedBeat) return;              // schon gehalten: der älteste Inhalt bleibt bis zum Takt
  let bar; try { bar = nextBarFromAudible(); } catch (e) { return; }
  if (!isFinite(bar)) return;
  M4.hold[t] = {s, old, clip: c, bar};
}""", """function mtx4HoldSet(t, s, old, bar0) {
  if (!R.playing || !AU.ctx || R.slot[t] !== s || (typeof ownPlaying === 'function' && ownPlaying(t))) return;
  const c = S.tracks[t].clips[s], h = M4.hold[t];
  if (h && h.s === s && h.clip === c && h.bar > R.schedBeat) return;              // schon gehalten: der älteste Inhalt bleibt bis zum Takt
  let bar = bar0; if (bar == null) { try { bar = nextBarFromAudible(); } catch (e) { return; } }
  if (!isFinite(bar)) return;
  M4.hold[t] = {s, old, clip: c, bar};
}
// Prüfung 6: ↶ ↷ eines MTX4-Schritts (Haken in undo/redo, vor dem Anwenden) – der laufende Inhalt bleibt bis zum nächsten Taktstrich.
// Das neue Clip-Objekt entsteht erst in undoApply: die Haltung bindet sich beim ersten Planen danach (clip null, cur0 = das alte Objekt)
function mtx4HoldFor(u) {
  if (!u || !u.mtx4) return;
  M4.stag = performance.now() + 3000;                                // Vorschaubilder gestaffelt
  if (!R.playing || !AU.ctx) return;
  let bar; try { bar = nextBarFromAudible(); } catch (e) { return; }
  if (!isFinite(bar)) return;
  for (const it of (u.kind === 'group' ? u.items : [u])) {
    if (!it || it.kind !== 'clip') continue;
    const t = it.track, s = it.scene, tr = S.tracks[t], c = tr && tr.clips[s];
    if (!c || R.slot[t] !== s || (typeof ownPlaying === 'function' && ownPlaying(t))) continue;
    const h = M4.hold[t];
    M4.hold[t] = {s, old: h && h.s === s && h.clip === c && h.bar > R.schedBeat ? h.old : deep(c), clip: null, cur0: c, bar: h && h.s === s && h.clip === c && h.bar > R.schedBeat ? h.bar : bar};
  }
}""")
rep("""  const h = M4.hold[i]; if (!h || M4.inSched) return false;
  const tr = S.tracks[i];
  if (!R.playing || !tr || R.slot[i] !== h.s || tr.clips[h.s] !== h.clip || from >= h.bar - 1e-9) { M4.hold[i] = null; return false; }""",
"""  const h = M4.hold[i]; if (!h || M4.inSched) return false;
  const tr = S.tracks[i];
  if (h.clip === null && tr && R.playing && R.slot[i] === h.s && from < h.bar - 1e-9) { if (tr.clips[h.s] === h.cur0) return false; h.clip = tr.clips[h.s]; }   // Prüfung 6
  if (!R.playing || !tr || R.slot[i] !== h.s || tr.clips[h.s] !== h.clip || from >= h.bar - 1e-9) { M4.hold[i] = null; return false; }""")

# --- Kern: mtx4Run blockweise
a0 = s.index("function mtx4Run(label, kind, fn) {")
a1 = s.index("// Halbtöne / Oktaven.")
s = s[:a0] + r"""// Prüfung 2: eine Aktion läuft blockweise (≈ 8 ms je Aufgabe, dazwischen ein Bild – die Vorschaubilder folgen gestaffelt); eine zweite
// Aktion oder ↶ ↷ der Leiste wartet, bis die erste fertig ist. Kleine Auswahl = sofort fertig (Rückgabe n), große = Promise auf n.
const MTX4_SLICE = 8;
function mtx4Later(f) { if (document.hidden || typeof requestAnimationFrame !== 'function') setTimeout(f, 16); else requestAnimationFrame(() => setTimeout(f, 0)); }
function mtx4Next() { M4.job = null; const f = M4.q.shift(); if (f) { try { f(); } catch (e) { logErr(e); } } }
function mtx4Run(label, kind, fn) {
  if (M4.job) return new Promise(res => M4.q.push(() => { const r = mtx4Run(label, kind, fn); if (r && typeof r.then === 'function') r.then(res); else { res(r); } }));
  const L = mtx4List(); if (!L.length) { toast('Erst Clips antippen'); mtx4Next(); return null; }
  if (rec.state !== 'off') { toast('Erst Aufnahme beenden'); mtx4Next(); return null; }
  let bar = null;
  if (R.playing && AU.ctx) {                                         // ein Taktstrich für alle Clips der Aktion
    try { bar = nextBarFromAudible(); if (L.length > 8 && b2t(bar) - AU.ctx.currentTime < .3) bar = nextBarFromAudible(b2t(bar) + AU.outLat + .05); } catch (e) { bar = null; }
    if (bar != null && !isFinite(bar)) bar = null;
  }
  const J = {label, kind, fn, L, k: 0, items: [], olds: [], skipD: 0, skipR: 0, odd: null, oddN: 0, uB: UNDO[UNDO.length - 1], bar, proj: S, res: null, done: false, n: 0};
  M4.job = J; M4.stag = performance.now() + 3000;
  mtx4Work(J);
  return J.done ? J.n : new Promise(res => { J.res = res; });
}
function mtx4Work(J) {
  if (J.proj !== S) { J.done = true; M4.q.length = 0; mtx4Next(); if (J.res) J.res(0); return; }   // anderes Projekt geladen
  const t0 = performance.now();
  while (J.k < J.L.length) {
    const {t, s} = J.L[J.k++];
    mtx4One(J, t, s);
    if (J.k < J.L.length && performance.now() - t0 > MTX4_SLICE) { mtx4Later(() => { try { mtx4Work(J); } catch (e) { logErr(e); J.done = true; mtx4Next(); if (J.res) J.res(0); } }); return; }
  }
  mtx4Finish(J);
}
function mtx4One(J, t, s) {
  const tr = S.tracks[t], c = tr && tr.clips[s]; if (!c) return;
  const dr = mtx4Drum(tr), kind = J.kind;
  if (dr && (kind === 'deg' || kind === 'fit' || (kind === 'semi' && !M4.drums))) { J.skipD++; return; }
  const before = cleanClip(c), b0 = JSON.stringify(before), play = !!(R.playing && R.slot[t] === s);
  const old = play ? deep(c) : null;                                 // nur ein laufender Clip braucht den alten Inhalt zum Planen
  if (play) mtx4HoldSet(t, s, old, J.bar);
  if (kind === 'len' && J.fn.f === .5 && c.len > 1 && c.len % 2) { J.oddN++; if (!J.odd) J.odd = {a: c.len, b: c.len >> 1}; }
  let ok = false; try { ok = J.fn(t, s, c, dr); } catch (e) { logErr(e); ok = false; }
  if (ok === 'range') { J.skipR++; ok = false; }
  const cc = tr.clips[s];
  if (!ok || JSON.stringify(cleanClip(cc)) === b0) { if (M4.hold[t] && M4.hold[t].old === old) M4.hold[t] = null; if (J.odd && J.odd.a === c.len && !ok) { J.oddN--; if (!J.oddN) J.odd = null; } return; }
  J.items.push({kind: 'clip', track: t, scene: s, before, label: J.label, mergeKey: null}); J.olds.push({t, s, old: before});
  if (ok !== 'edited') afterClipEdit(t, s);                          // Länge: clipLength hat afterClipEdit schon gerufen
  if (ED.roll && ED.rollAt && ED.rollAt.t === t && ED.rollAt.s === s) { try { ED.roll.refresh(); } catch (e) {} }
}
function mtx4Finish(J) {
  const {label, kind, items, olds, skipD, skipR} = J, n = items.length, uB = J.uB, gl = label + ' · ' + n + ' Clips';
  if (n) undoPush(Object.assign(n > 1 ? {kind: 'group', label: gl, items} : items[0], {mtx4: 1}));
  // Teil 2: die Fassung von vorher wird eine neue Clip-Version (im selben ↶-Schritt)
  let vs = null; try { vs = n ? mtx4Vers(olds) : null; } catch (e) { logErr(e); }
  if (vs && vs.made.length) { undoMergeSince(uB, gl); const top = UNDO[UNDO.length - 1]; if (top) top.mtx4 = 1; }
  M4.n++; M4.last = {label, n, skipD, skipR, vers: vs ? vs.made.map(x => x.v) : [], odd: J.oddN};
  const extra = (skipD ? ' · Drums fest' + (kind === 'semi' ? ' (Drums ± = mit)' : '') : '') + (skipR ? ' · ' + skipR + (kind === 'len' ? ' am Rand (1–64 Takte)' : ' am Rand (zu hoch/tief)') : '') +
    (J.oddN ? ' · ' + (J.oddN > 1 ? J.oddN + '× ' : '') + 'ungerade Länge abgerundet (' + J.odd.a + ' → ' + J.odd.b + (J.odd.b === 1 ? ' Takt)' : ' Takte)') : '') +
    (vs && vs.made.length ? (vs.made.length === 1 ? ' · vorher = v' + vs.made[0].v : ' · vorher als Versionen gemerkt') : '') + (vs && vs.full ? ' · Versionen voll (v' + sx9Max() + ')' : '');
  if (n) toast(label + ' · ' + n + (n === 1 ? ' Clip' : ' Clips') + extra);          // Prüfung 1: ohne Aktionsknopf – ↶ ↷ stehen in der Leiste
  else toast(label + ': nichts geändert' + extra);
  haptic(n ? 'tick' : 'pop'); UI.dirty.grid = true; mtx4Sync();
  J.done = true; J.n = n;
  mtx4Next();
  if (J.res) J.res(n);
}
// ↶ ↷ der Leiste: wartet auf eine laufende Aktion; der Hinweis danach ohne Aktionsknopf (der läge sonst unter der Leiste)
function mtx4Undo(fwd) {
  if (M4.job) return new Promise(res => M4.q.push(() => res(mtx4Undo(fwd))));
  const ok = fwd ? redo() : undo();
  if (ok && UI.toastActs && UI.lastToast) toast(UI.lastToast);
  mtx4Sync();
  return ok;
}
// Vorschaubilder gestaffelt (Haken in renderGrid vor dem Neuzeichnen eines Vorschaubilds): im Modus und 3 s nach einer Sammel-Aktion
// oder ihrem ↶ ↷ zeichnet ein Bild höchstens ≈ 5 ms Vorschaubilder (mindestens 2); der Rest folgt im nächsten Bild
function mtx4Thumb() {
  const now = performance.now();
  if (!M4.on && now > M4.stag) return false;
  if (!M4.thN++) { M4.th0 = now; return false; }
  if (M4.thN <= 2 || now - M4.th0 < 5) return false;
  M4.thDef = true; return true;
}
function mtx4Idle() { return new Promise(res => { const f = () => (M4.job || M4.q.length ? setTimeout(f, 10) : res(true)); f(); }); }
""" + s[a1:]

# --- Pentatonik (Prüfung 3): leitereigene bleiben, fremde zum Nachbarn
rep("""  if (mode === 'pent') {
    const P = G10G_SCALES[SRC[2] === 4 ? 'pentMaj' : 'pentMin'], Z = P.map(x => PCx(root + x));
    const ps = [...new Set(c.notes.map(n => n.n))].sort((a, b) => a - b);
    const items = ps.map(p => { let dur = 0, dir = 0; c.notes.forEach((n, j) => { if (n.n === p) { dur = Math.max(dur, n.d); dir += dirOf.get(j); } }); return {p, q: p, dir: dir >= 0 ? 1 : -1, dur, pass: false}; });
    const out = Harmony.oneScaleMap(items, Z, {amt: 1}), m = new Map(ps.map((p, j) => [p, out[j]]));
    return c.notes.map(n => m.get(n.n));
  }""", """  if (mode === 'pent') {                                            // Prüfung 3: Töne der Pentatonik bleiben stehen, fremde gehen zum Nachbarn
    const P = G10G_SCALES[SRC[2] === 4 ? 'pentMaj' : 'pentMin'], Z = P.map(x => PCx(root + x));
    return c.notes.map((n, j) => Harmony.snapToScale(n.n, Z, dirOf.get(j)));   // gleicher Ton zur gleichen Zeit: mtx4Fit legt zusammen
  }""")

# --- Länge: afterClipEdit nur einmal (clipLength ruft es selbst)
rep("""    try { clipLength(t, s, f); } finally { pushUndo = pu; }
    return true;
  });""", """    try { clipLength(t, s, f); } finally { pushUndo = pu; }
    return 'edited';                                                  // Prüfung 2: clipLength hat afterClipEdit schon gerufen
  }, f);""")
rep("""function mtx4Len(f) {
  if (f !== 2 && f !== .5) return null;
  return mtx4Run('Länge ' + (f === 2 ? '×2' : '÷2'), 'len', (t, s, c) => {""", """function mtx4Len(f) {
  if (f !== 2 && f !== .5) return null;
  return mtx4RunF('Länge ' + (f === 2 ? '×2' : '÷2'), 'len', (t, s, c) => {""")
rep("""/* ---------- Teil 2: Länge ÷2 / ×2""", """function mtx4RunF(label, kind, fn, f) { fn.f = f; return mtx4Run(label, kind, fn); }
/* ---------- Teil 2: Länge ÷2 / ×2""")

# --- Versionen (Prüfung 4 + 9)
rep("""function mtx4InSong(song, t, s) { for (let x = 0; x < song.bars; x++) { const h = sx9At(song, t, x); if (h && h.s === s) return true; } return false; }""",
"""function mtx4InSong(song, t, s) { for (let x = 0; x < song.bars; x++) { const h = sx9At(song, t, x); if (h && h.s === s && h.v === 1) return true; } return false; }   // Prüfung 9: nur v1 = der Clip selbst""")
rep("""  const todo = list.filter(x => { const tr = S.tracks[x.t], m = M4.ver.find(v => v.tr === tr && v.s === x.s); return !mine(x, m) && mtx4InSong(song, x.t, x.s); });""",
"""  // Prüfung 4: höchstens EINE automatische Version je Clip – nur ein Clip ohne Versionen bekommt v2 (bewusst angelegte Plätze bleiben frei)
  const todo = list.filter(x => { const tr = S.tracks[x.t], m = M4.ver.find(v => v.tr === tr && v.s === x.s); return !mine(x, m) && !sx9List(song, x.t, x.s).length && mtx4InSong(song, x.t, x.s); });""")

# --- Guide-Text
rep("""Spielt ein Clip im Song, bleibt die Fassung von vorher als neue Version (Clip-Blatt › Versionen).',""",
"""↶ ↷ stehen in der Leiste. Spielt ein Clip im Song und hat noch keine Versionen, bleibt die Fassung von vorher als v2 (Clip-Blatt › Versionen).',""")

# --- Test-API
rep("""  bar: () => M4.bar, sync: () => mtx4Sync(),
};""", """  bar: () => M4.bar, sync: () => mtx4Sync(), idle: () => mtx4Idle(), undo: fwd => mtx4Undo(!!fwd), busy: () => !!M4.job || M4.q.length > 0,
  thumbs: () => ({def: M4.thDef, stag: M4.stag > performance.now()}),
};""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
