/* =====================================================================================================================
   G6 (Nachtrag 5): Chor-Generator – Background-Stimmen per Knopf aus dem eigenen Take.
   Takes-Blatt → [Chor] → Rezept → die Stimmen-Noten werden aus der Lead-Melodie (Noten der gehörten Fassung, G2-Analyse) und den
   Akkorden der Stelle (Töne der anderen Spuren der Szene; ohne Begleitung der leitereigene Dreiklang, der den Ton enthält) berechnet.
   Jede Stimme = die gehörte Lead-Fassung, nur stimmhafte Teile verschoben (G2-Technik, formant-erhaltend), künstlich gedoppelt:
   2 Kopien je Stimme (+12 ms / −6 Cent und +24 ms / +8 Cent), Panorama links/rechts, Pegel so, dass der Chor gesamt 8 dB unter dem
   Lead liegt, Hall und Echo als Send (vor dem Pegel: Stimme leise → nur Hall).
   Daten (additiv am Audio-Stück, Format bleibt): audio.chor = {rec, dir 'up'|'down', mix '80'|'pop', voices: [{name, n: [{t0, t1, m, iv}],
     pan (−1…1), db (Pegel je Kopie), rev, dly (Sends 0…1), take?: {take, in, out, at} (selbst gesungen)}]}
   Abspielen: tkStartSrc legt zu jedem Lead-Stück die Stimmen-Stücke an (gleiche Zeit, gleiche Blenden), sie enden mit ihm.
   ===================================================================================================================== */
const G6 = {cache: new Map(), job: new Map(), nodes: new Map(), solo: null, arm: null, renders: 0, last: null, sheet: null};
const G6_REC = [['terz', 'Terz'], ['sexte', 'Sexte'], ['quinte', 'Quinte'], ['oktave', 'Oktave'], ['drei', 'Dreistimmig'], ['falsett', 'Falsett-Chor 80er'], ['barber', 'Barbershop 4-stimmig'], ['unisono', 'Unisono-Doppel']];
const G6_DIR = new Set(['terz', 'sexte', 'quinte', 'oktave']);
const G6_COPY = [{ms: 12, ct: -6, pan: -0.15}, {ms: 24, ct: 8, pan: 0.15}];   // künstliches Doppeln je Stimme
// Mischung (Voreinstellung): Hall/Echo-Sends je Chor-Stimme und für den Lead (STIMME-Spur), Hall-Vorverzögerung und Echo im Tempo
const G6_MIX = {
  '80': {label: '80er großer Refrain', rev: 0.75, dly: 0.12, leadRev: 0.3, leadDly: 0.1, pre: '1/32', echo: '1/4', below: 8},
  pop: {label: 'Pop modern', rev: 0.4, dly: 0.18, leadRev: 0.15, leadDly: 0.12, pre: '1/64', echo: '1/8.', below: 9}
};
function g6NormChor(c) {
  if (!c || typeof c !== 'object' || !Array.isArray(c.voices)) return null;
  const rec = G6_REC.some(r => r[0] === c.rec) ? c.rec : 'terz', voices = [];
  for (const v of c.voices.slice(0, 4)) {
    if (!v || !Array.isArray(v.n)) continue;
    const n = v.n.slice(0, 4000).filter(x => x && isNum(x.t0) && isNum(x.t1) && x.t1 > x.t0 && isNum(x.m) && isNum(x.iv)).map(x => ({t0: tkR6(x.t0), t1: tkR6(x.t1), m: +clamp(x.m, 0, 127).toFixed(3), iv: clamp(Math.round(x.iv), -36, 36)}));
    const o = {name: typeof v.name === 'string' ? v.name.slice(0, 40) : 'Stimme', n, pan: isNum(v.pan) ? +clamp(v.pan, -1, 1).toFixed(2) : 0, db: isNum(v.db) ? +clamp(v.db, -60, 6).toFixed(1) : -12,
      rev: isNum(v.rev) ? +clamp(v.rev, 0, 1).toFixed(2) : 0.5, dly: isNum(v.dly) ? +clamp(v.dly, 0, 1).toFixed(2) : 0};
    const t = v.take ? tkNormSeg(v.take) : null; if (t) o.take = t;
    voices.push(o);
  }
  return voices.length ? {rec, dir: c.dir === 'down' ? 'down' : 'up', mix: G6_MIX[c.mix] ? c.mix : '80', voices} : null;
}
tkExt().audio.push((raw, o) => { const c = g6NormChor(raw.chor); if (c) o.chor = c; });

/* ---------- Stimmen-Noten aus Lead + Akkorden (Rezepte) ---------- */
function g6Scale(key) { const SC = Harmony.SCALES[key.scale] || Harmony.SCALES.ionian; return SC.map(x => (x + key.root) % 12); }
// leitereigener Schritt: p (MIDI) um d Stufen (Ton außerhalb der Leiter: vom nächsten Leiterton aus)
function g6Step(p, d, key) {
  const pcs = g6Scale(key), ins = q => pcs.includes(((q % 12) + 12) % 12);
  let q = p; if (!ins(q)) { let k = 1; while (k < 6 && !ins(p - k) && !ins(p + k)) k++; q = ins(p - k) ? p - k : p + k; }
  const sg = Math.sign(d); for (let k = 0; k < Math.abs(d); k++) { q += sg; while (!ins(q)) q += sg; }
  return q;
}
// Akkord an einer Stelle (Tonklassen): die leitereigenen Dreiklänge, die p enthalten – bewertet nach den Tönen, die die anderen
// Spuren der Szene dort spielen (sonst I, IV, V vor den anderen Stufen)
function g6Chord(p, key, pcsHeard) {
  const sc = g6Scale(key), pref = [0, 3, 4, 5, 1, 2, 6]; let best = null, bs = -1;
  for (const dg of pref) {
    const tri = [sc[dg], sc[(dg + 2) % 7], sc[(dg + 4) % 7]]; if (sc.length !== 7) break;
    if (!tri.includes(((p % 12) + 12) % 12)) continue;
    let s = 0; if (pcsHeard) for (const q of pcsHeard) if (tri.includes(q)) s += 2; else s -= 1;
    s += (7 - pref.indexOf(dg)) * 0.1;
    if (s > bs) { bs = s; best = tri; }
  }
  return best || [((p % 12) + 12) % 12, (p + 4) % 12, (p + 7) % 12];
}
const g6Above = (p, tri) => { let q = p + 1; while (!tri.includes(((q % 12) + 12) % 12)) q++; return q; };
const g6Below = (p, tri) => { let q = p - 1; while (!tri.includes(((q % 12) + 12) % 12)) q--; return q; };
// Töne der anderen Synth-Spuren der Szene, die an Schlag b (im Clip) klingen
function g6HeardPcs(r, beat) {
  if (!r || r.t == null) return null;
  const out = new Set();
  S.tracks.forEach((tr, i) => {
    if (!tr || tr.kind !== 'synth' || tr.stimme || i === MEL_T) return;
    const c = tr.clips[r.s]; if (!c || !c.notes || !c.notes.length) return;
    const L = c.len * 4, b = ((beat % L) + L) % L;
    for (const n of c.notes) { const nb = isNum(n.b) ? n.b : n.t, nd = isNum(n.d) ? n.d : n.len; if (isNum(nb) && isNum(nd) && b >= nb - 1e-6 && b < nb + nd) out.add(((n.n % 12) + 12) % 12); }
  });
  return out.size >= 2 ? out : null;
}
// Rezept → Stimmen [{name, ivs: (p, tri) → Zielton}]
function g6Recipe(rec, dir, key) {
  const up = dir !== 'down', S1 = (n, f) => ({name: n, f});
  switch (rec) {
    case 'terz': return [S1(up ? 'Terz oben' : 'Terz unten', p => g6Step(p, up ? 2 : -2, key))];
    case 'sexte': return [S1(up ? 'Sexte oben' : 'Sexte unten', p => g6Step(p, up ? 5 : -5, key))];
    case 'quinte': return [S1(up ? 'Quinte oben' : 'Quinte unten', p => { const q = p + (up ? 7 : -7), sc = g6Scale(key); return sc.includes(((q % 12) + 12) % 12) ? q : g6Step(p, up ? 4 : -4, key); })];
    case 'oktave': return [S1(up ? 'Oktave oben' : 'Oktave unten', p => p + (up ? 12 : -12))];
    case 'drei': return [S1('Akkordton 1', (p, tri) => g6Above(p, tri)), S1('Akkordton 2', (p, tri) => g6Above(g6Above(p, tri), tri))];
    case 'falsett': return [S1('Falsett Oktave', p => p + 12), S1('Falsett Terz', p => g6Step(p, 2, key) + 12)];
    case 'barber': return [S1('Tenor', (p, tri) => g6Above(p, tri)), S1('Bariton', (p, tri) => g6Below(p, tri)), S1('Bass', (p, tri) => { const b = g6Below(p, tri); let q = b - 1; while ((((q % 12) + 12) % 12) !== tri[0] || q > b - 3) q--; return q; })];
    default: return [S1('Unisono', p => p)];
  }
}
const G6_PAN = {1: [-0.6], 2: [-0.6, 0.6], 3: [-0.65, 0.65, 0]};
// Stimmen für ein Audio-Stück: Lead-Noten (gehörte Fassung) → je Stimme Noten mit Intervall
function g6Build(r, notes, rec, dir, mix) {
  const x = tkRef(r), key = g2KeyAt(r), M = G6_MIX[mix] || G6_MIX['80'], R = g6Recipe(rec, dir, key), pans = G6_PAN[R.length] || G6_PAN[3];
  const a = x.a, sp = spb(), copies = G6_COPY.length * R.length, db = -M.below - 10 * Math.log10(copies);   // Chor gesamt M.below dB unter dem Lead
  return R.map((v, k) => ({name: v.name, pan: pans[k], db: +db.toFixed(1), rev: M.rev, dly: M.dly,
    n: notes.map(n => { const p = Math.round(n.m), beat = (n.t0 - a.in) / sp + a.at, tri = g6Chord(p, key, g6HeardPcs(r, beat)); return {t0: n.t0, t1: n.t1, m: n.m, iv: clamp(v.f(p, tri) - p, -36, 36)}; })}));
}
/* ---------- Rechnen (G2-Worker) und Cache ---------- */
const g6Lead = a => (a && a.take ? tkHeard(a.take, a) : null);
function g6Key(v, c, b) { return G2P.planKey(g6Plan(v, c)) + '@' + wpBid(b); }
function g6Plan(v, c) { const C = G6_COPY[c]; return {mode: 'soft', notes: v.n.map(n => ({t0: n.t0, t1: n.t1, m: n.m, to: n.m, s: 0, e: n.iv * 100 + C.ct}))}; }
// Puffer einer Kopie (oder null, solange er gerechnet wird – dann schweigt diese Kopie)
function g6Buf(a, v, c) {
  if (v.take) { const b = tkHeard(v.take.take, v.take); if (!b) tkLoad(v.take.take); return b; }
  const b = g6Lead(a); if (!b) return null;
  const k = g6Key(v, c, b), hit = G6.cache.get(k); if (hit) { hit.t = performance.now(); return hit.buf; }
  if (!G6.job.has(k)) {
    G6.job.set(k, 1); const t0 = performance.now(), sr = b.sampleRate;
    g2Call({op: 'render', key: 'h:' + a.take + '@' + wpBid(b), x: b.getChannelData(0), sr, plan: g6Plan(v, c)}).then(r => {
      G6.job.delete(k); const ab = wpToBuf(r.y, sr); if (!ab) return;
      G6.cache.set(k, {buf: ab, t: performance.now(), n: ab.length});
      while (G6.cache.size > 24) { let ok = null, ot = Infinity; for (const [kk, x] of G6.cache) if (x.t < ot) { ot = x.t; ok = kk; } G6.cache.delete(ok); }
      G6.renders++; G6.last = {ms: Math.round(performance.now() - t0), how: G2.how};
      g6Refresh();
    }, e => { G6.job.delete(k); logErr(e); });
  }
  return null;
}
function g6Ready(a) { const c = a && a.chor; if (!c) return true; for (const v of c.voices) for (let k = 0; k < G6_COPY.length; k++) { if (v.take) { if (!tkHeard(v.take.take, v.take)) return false; continue; } const b = g6Lead(a); if (!b || !G6.cache.has(g6Key(v, k, b))) return false; if (v.take) break; } return true; }
/* ---------- Abspielen: Knoten je Stimme (Pegel × Solo → Panorama → Spur; Sends vor dem Pegel an HALL und ECHO) ---------- */
function g6Node(v, k, i) {
  const c = AU.ctx, key = k + ':' + i; let N = G6.nodes.get(key);
  if (!N || N.ctx !== c) {
    N = {ctx: c, g: c.createGain(), pan: c.createStereoPanner ? c.createStereoPanner() : null, rev: c.createGain(), dly: c.createGain(), inp: c.createGain()};
    N.inp.connect(N.g); if (N.pan) { N.g.connect(N.pan); } N.inp.connect(N.rev); N.inp.connect(N.dly);
    if (AU.hallIn) N.rev.connect(AU.hallIn); if (AU.echoIn) N.dly.connect(AU.echoIn);
    G6.nodes.set(key, N);
  }
  const A = AU.tracks[i]; if (A && A.trackIn && N.dst !== A.trackIn) { try { (N.pan || N.g).disconnect(); } catch (e) {} (N.pan || N.g).connect(A.trackIn); N.dst = A.trackIn; }
  return N;
}
// Pegel jetzt (Solo: nur die gewählte Stimme bzw. der Lead)
function g6Gain(v, vi) { const so = G6.solo; return so == null || so === vi ? Math.pow(10, v.db / 20) : 0; }
function g6Apply(a, i) {
  const c = a && a.chor; if (!c || !AU.ctx) return;
  const t = AU.ctx.currentTime;
  c.voices.forEach((v, vi) => G6_COPY.forEach((C, k) => {
    const N = g6Node(v, a.take + ':' + vi + ':' + k, i), g = g6Gain(v, vi);
    N.g.gain.setTargetAtTime(g, t, .01); N.rev.gain.setTargetAtTime(v.rev * (G6.solo == null || G6.solo === vi ? 1 : 0), t, .01); N.dly.gain.setTargetAtTime(v.dly * (G6.solo == null || G6.solo === vi ? 1 : 0), t, .01);
    if (N.pan) N.pan.pan.setTargetAtTime(clamp(v.pan + C.pan, -1, 1), t, .01);
  }));
}
// zu einem Lead-Stück r (tkStartSrc) die Stimmen-Stücke: gleiche Zeit + Versatz der Kopie, gleiche Blenden
function g6Start(o, r) {
  const a = o.aud, c = a && a.chor; if (!c || o.ctx || !AU.ctx) return;
  const ctx = AU.ctx, sp = spb(); r.ch = [];
  g6Apply(a, o.i);
  c.voices.forEach((v, vi) => G6_COPY.forEach((C, k) => {
    if (v.take && k > 0) return;                                  // selbst gesungen: eine Spur, kein künstliches Doppeln
    const b = g6Buf(a, v, k); if (!b) return;
    let off = o.off, when = o.when + (v.take ? 0 : C.ms / 1000);
    if (v.take) off = v.take.in + (o.off - a.in) + (a.at - v.take.at) * sp;
    if (off < 0 || off >= b.duration - .002) return;
    const end = Math.min(o.end + (v.take ? 0 : C.ms / 1000), when + (b.duration - off)), dur = end - when; if (!(dur > .01)) return;
    const s = ctx.createBufferSource(), g = ctx.createGain(), G = isNum(o.gain) ? o.gain : 1, fi = Math.min(o.fi || 0, dur / 2), fo = Math.min(o.fo || 0, dur / 2);
    s.buffer = b; g.gain.value = fi > 0 ? 0 : G; g.gain.setValueAtTime(fi > 0 ? 0 : G, when); if (fi > 0) g.gain.linearRampToValueAtTime(G, when + fi);
    if (fo > 0) { g.gain.setValueAtTime(G, end - fo); g.gain.linearRampToValueAtTime(0, end); }
    s.connect(g); g.connect(g6Node(v, a.take + ':' + vi + ':' + (v.take ? 0 : k), o.i).inp);
    try { s.start(when, off); s.stop(end + .005); } catch (e) { try { s.disconnect(); g.disconnect(); } catch (e2) {} return; }
    r.ch.push({s, g, when, end, G});
  }));
}
// mit dem Lead-Stück: enden (tkDrop), sofort stoppen (tkKill), ausblenden (tkFadeAt, tkXfOut)
function g6Drop(r) { if (!r.ch) return; for (const x of r.ch) { try { x.s.disconnect(); x.g.disconnect(); } catch (e) {} } r.ch = null; }
function g6Kill(r) { if (r.ch) for (const x of r.ch) { try { x.s.stop(); } catch (e) {} } }
function g6Fade(r, t, tau) { if (r.ch) for (const x of r.ch) { try { const p = x.g.gain; if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else p.cancelScheduledValues(t); p.setTargetAtTime(0, t, tau || .004); x.s.stop(t + 10 * (tau || .004) + .01); } catch (e) {} } }
// neue Stimmen-Fassung (fertig gerechnet, Rezept, Solo): die laufenden Stimmen-Stücke ab jetzt + 30 ms neu (10-ms-Blende), der Lead läuft durch
function g6Refresh() {
  UI.dirty.grid = UI.dirty.song = true; if (G6.sheet) g6SheetPaint();
  if (!AU.ctx || !R.playing) return;
  const at = AU.ctx.currentTime + .03;
  for (const r of TK.src) {
    if (r.dead || !r.o || !r.aud || r.end <= at + .02) continue;
    if (r.ch) { g6Fade(r, at, .003); }
    if (!r.aud.chor) { r.ch = null; continue; }
    const o = Object.assign({}, r.o, {when: Math.max(at, r.start), off: r.o.off + Math.max(0, at - r.start), fi: .01, end: r.end});
    const keep = r.ch; g6Start(o, r); if (keep) r.ch = (r.ch || []).concat(keep);
  }
}
/* ---------- Ändern (je ein Undo: Clip bzw. Song) ---------- */
function g6Edit(r, label, fn) {
  const x = tkRef(r); if (!x) return false;
  if (r.vox) { const before = songSnapshot(); if (fn(x.a) === false) return false; const v = S.song.vox.find(z => z.id === r.vox), n = tkNormAudio(v); if (n && n.chor) v.chor = n.chor; else delete v.chor; pushSongUndo(before, label); songChanged(); }
  else { const before = cleanClip(x.clip); if (fn(x.clip.audio) === false) return false; const n = tkNormAudio(x.clip.audio); if (n && n.chor) x.clip.audio.chor = n.chor; else delete x.clip.audio.chor; pushUndo(r.t, r.s, before, label); clipChanged(r.t, r.s); }
  markDirty(); UI.dirty.all = true; haptic('tick');
  g6Refresh();
  return true;
}
// Rezept wählen: Lead-Noten der gehörten Fassung (Analyse im Worker) → Stimmen; Mischung der Wahl
async function g6Make(r, rec, dir, mix) {
  const x = tkRef(r); if (!x) return false;
  const a = x.a, b = g6Lead(a); if (!b) { tkLoad(a.take); toast('Take wird geladen …'); return false; }
  const t0 = performance.now(), A = await g2Call({op: 'an', key: 'h:' + a.take + '@' + wpBid(b), x: b.getChannelData(0), sr: b.sampleRate});
  const notes = (A.notes || []).filter(n => n.t1 > a.in && n.t0 < a.out);
  if (!notes.length) { toast('Keine Töne erkannt'); return false; }
  const prevMix = a.chor && a.chor.mix;
  const ok = g6Edit(r, 'Chor · ' + G6_REC.find(q => q[0] === rec)[1], au => { au.chor = {rec, dir: dir || 'up', mix: mix || prevMix || '80', voices: g6Build(r, notes, rec, dir, mix || prevMix || '80')}; });
  G6.lastMake = {ms: Math.round(performance.now() - t0), n: notes.length};
  return ok;
}
// Mischung: Sends der Stimmen + Lead-Sends der STIMME-Spur + Hall-Vorverzögerung und Echo im Tempo (ein Undo)
function g6Mix(r, mix) {
  const M = G6_MIX[mix]; if (!M) return false;
  const x = tkRef(r); if (!x || !x.a.chor) return false;
  const st = stimmeT(), items = [];
  const fxBefore = fxSnapshot(), sdBefore = st >= 0 ? soundSnapshot(st) : null;
  g6Edit(r, 'Chor · Mischung', au => { au.chor.mix = mix; const n = au.chor.voices.filter(v => !v.take).length * G6_COPY.length + au.chor.voices.filter(v => v.take).length; au.chor.voices.forEach(v => { v.rev = M.rev; v.dly = M.dly; v.db = +(-M.below - 10 * Math.log10(Math.max(1, n))).toFixed(1); }); });
  const top = UNDO.pop();
  if (st >= 0 && S.tracks[st].sound) { const sd = S.tracks[st].sound, f = sd.fx || (sd.fx = {}); f.rev = M.leadRev; f.dly = M.leadDly; try { applyTrackParams(st); } catch (e) { logErr(e); } items.push({kind: 'sound', track: st, before: sdBefore}); }
  S.fxBus.hall.predelay = M.pre; S.fxBus.echo.divL = M.echo; if (S.fxBus.echo.divR != null && S.fxBus.echo.mode !== 'st') S.fxBus.echo.divR = M.echo;
  try { applyHall(S.fxBus.hall); applyEcho(); } catch (e) { logErr(e); }
  items.push({kind: 'fx', before: fxBefore});
  if (top) items.unshift(top);
  undoPush({kind: 'group', label: 'Chor · ' + M.label, items}); markDirty();
  return true;
}
const g6Del = r => g6Edit(r, 'Chor gelöscht', au => { if (!au.chor) return false; delete au.chor; });
const g6VoiceSet = (r, k, p) => g6Edit(r, 'Chor-Stimme', au => { const v = au.chor && au.chor.voices[k]; if (!v) return false; Object.assign(v, p); });
const g6NoteShift = (r, k, j, d) => g6Edit(r, 'Chor-Note verschoben', au => { const v = au.chor && au.chor.voices[k], n = v && v.n[j]; if (!n || !d) return false; n.iv += d; });
function g6Solo(k) { G6.solo = G6.solo === k ? null : k; const st = stimmeT(); for (const t of S.tracks) for (const c of t.clips) if (c && c.audio && c.audio.chor) g6Apply(c.audio, st); if (S.song) for (const v of S.song.vox || []) if (v.chor) g6Apply(v, st); g6LeadMute(); if (G6.sheet) g6SheetPaint(); return G6.solo; }
// Solo einer Chor-Stimme: der Lead (STIMME-Stücke) schweigt so lange (die Stimme klingt allein mit der Begleitung)
function g6LeadMute() { if (!AU.ctx) return; const t = AU.ctx.currentTime; for (const r of TK.src) if (!r.dead && r.aud && r.aud.chor) { try { r.g.gain.cancelScheduledValues(t); r.g.gain.setTargetAtTime(G6.solo == null ? r.G : 0, t, .01); } catch (e) {} } }
// „Selbst singen“: die Stimme spielt allein als Führung; die nächste Aufnahme (● REC mit 🎤) in diesem Clip ersetzt sie
function g6Arm(r, k) {
  const x = tkRef(r); if (!x || r.vox || !x.a.chor || !x.a.chor.voices[k]) return false;
  G6.arm = {t: r.t, s: r.s, k}; if (G6.solo !== k) g6Solo(k);
  toast('● REC mit 🎤: ' + x.a.chor.voices[k].name + ' läuft als Führung – nachsingen'); if (G6.sheet) g6SheetPaint();
  return true;
}
// Haken in der Aufnahme: der neue Take (Overdub) dieses Clips wird die Stimme; oben bleibt der Lead (gleiches Undo wie die Aufnahme)
function g6Took(t, s, clip, prev, seg) {
  const A = G6.arm; if (!A || A.t !== t || A.s !== s || !clip.audio.chor || !clip.audio.chor.voices[A.k]) return false;
  const v = clip.audio.chor.voices[A.k];
  v.take = {take: seg.take, in: seg.in, out: seg.out, at: seg.at};
  Object.assign(clip.audio, prev); clip.audio.alt = (clip.audio.alt || []).slice(1); if (!clip.audio.alt.length) delete clip.audio.alt;
  const n = clip.audio.chor.voices.filter(x => !x.take).length * G6_COPY.length + clip.audio.chor.voices.filter(x => x.take).length, M = G6_MIX[clip.audio.chor.mix] || G6_MIX['80'];
  clip.audio.chor.voices.forEach(x => { x.db = +(-M.below - 10 * Math.log10(Math.max(1, n))).toFixed(1); });
  G6.arm = null; if (G6.solo != null) g6Solo(G6.solo);
  setTimeout(() => toast(v.name + ': selbst gesungen – eingemischt'), 50);
  return true;
}
/* ---------- Blatt „Chor“ ---------- */
function g6Sheet(r, anchor) {
  const x = tkRef(r); if (!x || !tkAudioOk()) return false;
  G6.sheet = r;
  openPop(anchor || EL.top, p => { p.classList.add('tksheet', 'g6sheet'); guardTouch(p); g6SheetPaint(p);
    onTap(p, b => {
      const d = b.dataset, rr = G6.sheet; if (!rr) return;
      const cur = tkRef(rr) && tkRef(rr).a.chor;
      if (d.rec) { b.disabled = true; toast('Chor wird gerechnet …'); g6Make(rr, d.rec, cur && G6_DIR.has(d.rec) ? cur.dir : 'up', cur ? cur.mix : '80').then(() => g6SheetPaint()); return; }
      if (d.dir && cur) { g6Make(rr, cur.rec, d.dir, cur.mix).then(() => g6SheetPaint()); return; }
      if (d.mix) { g6Mix(rr, d.mix); g6SheetPaint(); return; }
      if (d.solo != null) { g6Solo(+d.solo); return; }
      if (d.notes != null) { closePop(); g2Open(rr, {voice: +d.notes}); return; }
      if (d.self != null) { g6Arm(rr, +d.self); return; }
      if (d.a === 'del') { g6Del(rr); g6SheetPaint(); return; }
      if (d.a === 'x') closePop();
    }, 'button');
  }, {name: 'chor', onClose: () => { G6.sheet = null; }});
  return true;
}
function g6SheetPaint(p) {
  p = p || (UI.pop && UI.pop.name === 'chor' ? UI.pop.el : null); const r = G6.sheet, x = r && tkRef(r); if (!p || !x) return;
  const c = x.a.chor, rd = g6Ready(x.a);
  const recs = G6_REC.map(([k, l]) => `<button class="mbtn rb" data-rec="${k}"${c && c.rec === k ? ' aria-pressed="true"' : ''}>${esc(l)}</button>`).join('');
  const dir = c && G6_DIR.has(c.rec) ? `<div class="clab g6dir"><button class="mbtn rb" data-dir="up"${c.dir === 'up' ? ' aria-pressed="true"' : ''}>oben</button><button class="mbtn rb" data-dir="down"${c.dir === 'down' ? ' aria-pressed="true"' : ''}>unten</button></div>` : '';
  const mix = c ? `<div class="small">Mischung</div><div class="clab">` + Object.keys(G6_MIX).map(k => `<button class="mbtn rb" data-mix="${k}"${c.mix === k ? ' aria-pressed="true"' : ''}>${esc(G6_MIX[k].label)}</button>`).join('') + '</div>' : '';
  const vs = c ? '<div class="tklist pan-y">' + c.voices.map((v, k) => `<div class="tkrow g6v"><div class="g6n"><b>${esc(v.name)}</b><small>${v.take ? 'selbst gesungen' : (v.pan < -0.2 ? 'links' : v.pan > 0.2 ? 'rechts' : 'Mitte') + ' · ' + fmtDec(v.db, 1).replace('-', '−') + ' dB'}${G6.arm && G6.arm.k === k ? ' · bereit für ● REC' : ''}</small></div>` +
    `<button class="mbtn rb" data-solo="${k}"${G6.solo === k ? ' aria-pressed="true"' : ''}>Solo</button><button class="mbtn rb" data-notes="${k}">♪ Noten</button><button class="mbtn rb" data-self="${k}">Selbst singen</button></div>`).join('') + '</div>' : '';
  p.innerHTML = `<h4>Chor · STIMME · ${esc(x.label)}</h4><div class="g6rec">${recs}</div>${dir}${mix}${vs}` +
    (c ? `<div class="savrow"><button class="mbtn rb" data-a="del">Chor löschen</button><button class="mbtn rb" data-a="x">OK</button></div>` : '') +
    `<div class="small">${c ? (rd ? c.voices.length + (c.voices.length === 1 ? ' Stimme' : ' Stimmen') + ' · je 2× gedoppelt' : 'Stimmen werden gerechnet …') : 'Background-Stimmen folgen meist festen Rezepten: Terz (leitereigen, je nach Ton groß oder klein) über oder unter der Melodie, Sexte, Quinte, Oktave; Dreistimmig = Akkordtöne eng darüber; Falsett-Chor 80er = Oktave + Terz hoch, viel Hall; Barbershop = vier Stimmen eng nach den Akkordtönen; Unisono = dieselben Töne gedoppelt.'}</div>`;
}
/* ---------- Test-API ---------- */
const G6_API = {
  g6Info: r => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r); return x ? {chor: x.a.chor ? deep(x.a.chor) : null, ready: g6Ready(x.a), renders: G6.renders, last: G6.last, lastMake: G6.lastMake || null, solo: G6.solo, arm: G6.arm ? Object.assign({}, G6.arm) : null, jobs: G6.job.size} : null; },
  g6Make: (r, rec, dir, mix) => g6Make(r || {t: stimmeT(), s: R.selS}, rec || 'terz', dir || 'up', mix || '80'),
  g6Mix: (r, mix) => g6Mix(r || {t: stimmeT(), s: R.selS}, mix),
  g6Voice: (r, k, p) => g6VoiceSet(r || {t: stimmeT(), s: R.selS}, k, p),
  g6Note: (r, k, j, d) => g6NoteShift(r || {t: stimmeT(), s: R.selS}, k, j, d),
  g6Solo: k => g6Solo(k), g6Arm: (r, k) => g6Arm(r || {t: stimmeT(), s: R.selS}, k), g6Del: r => g6Del(r || {t: stimmeT(), s: R.selS}),
  g6Sheet: r => g6Sheet(r || {t: stimmeT(), s: R.selS}),
  g6Wait: async r => { r = r || {t: stimmeT(), s: R.selS}; for (let n = 0; n < 1200; n++) { const x = tkRef(r); if (x && x.a.chor) { x.a.chor.voices.forEach((v, vi) => G6_COPY.forEach((C, k) => g6Buf(x.a, v, k))); if (g6Ready(x.a) && !G6.job.size) return true; } await sleep(25); } return false; },
  g6Buf: (r, k, c, a0, b0) => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), v = x && x.a.chor && x.a.chor.voices[k], b = v && g6Buf(x.a, v, c || 0); return b ? {sr: b.sampleRate, n: b.length, data: Array.from(b.getChannelData(0).subarray(a0 || 0, b0 == null ? b.length : b0))} : null; },
  g6Nodes: () => [...G6.nodes.entries()].map(([k, N]) => ({k, g: N.g.gain.value, rev: N.rev.gain.value, dly: N.dly.gain.value, pan: N.pan ? N.pan.pan.value : 0}))
};
