/* ===================== UE-C / UE-D (Konzept Übergänge §1.3 D/E, §1.4, §1.5, §1.6): Werks-Übergänge, Breaks, Einwürfe =====================
   Datenmodell §1.5 (verbindlich): song.ue = [{id, m?, at?, a, len, k, t, notes, mode, stop?, dens, dir, g?, src, kit?, baked?}],
   alle Zeiten in SCHLÄGEN. Kanten-Übergänge hängen an der Marke des folgenden Teils (m), Einwürfe und freie Breaks am Song-Schlag (at).
   - UE-C: 12 Werks-Übergänge, je 3 Dichten (0 leicht · 1 mittel · 2 voll) und Richtung (auf/ab/gleich; 'auto' zählt die aktiven
     Clips vor und nach der Kante). Gespeichert werden nur Noten (Form der Drum-Clip-Noten {t,d,n,v,a?,r?,lk?}) – sie klingen immer mit
     dem Kit der Spur (auch North-Pads, über drumHit).
   - UE-D: Breaks (k 'break', stop = Spur-Indizes; mode 'dazu' = [Kick bleibt]) und Einwürfe (k 'adlib', frei auf 1/16).
   Ohne song.ue läuft kein zusätzlicher Code (jede Stelle prüft zuerst song.ue). */
const UE_GM = {K: 36, S: 38, R: 37, C: 39, h: 42, o: 46, L: 45, M: 47, H: 50, Y: 49};
const UE_K = ['fill', 'tom', 'build', 'crash', 'break', 'adlib', 'riser', 'down', 'rev', 'lauf'];
const UE_DENS = ['leicht', 'mittel', 'voll'];
const UE_DIRS = {auto: 'Auto', auf: 'aufbauend', ab: 'abbauend', gleich: 'gleich'};
const UE_ARR = {auf: '↗', ab: '↘', gleich: '→'};          // ↗ ↘ → (Textpfeile, kein Emoji)
const UE_RAMP = .012;                                                      // Break: Blende 12 ms an Anfang und Ende (kein Klick)
const UE_SNAP = 2;                                                         // Fangbereich ±½ Takt (in Schlägen)
// Muster je Dichte: eine Zeile je Instrument, ein Zeichen je Schritt (Standard 1/16): . Pause · x Schlag · X Akzent · g Geist · 2–4 Wirbel
const UE_FILL_LANG = [
  {K: 'x.......x.......', S: '..g...g.x.......', H: '............x...', L: '..............X.'},
  {K: 'x.......x.......', S: 'g.g.g.x.g.x.....', H: '............x...', M: '.............x..', L: '..............X.'},
  {K: 'x.......x.......', S: 'gggxgggxgxgx....', H: '............xx..', M: '..............X.', L: '...............x'}];
/* UE_VK: Anschlags-Faktor je Werk und Dichte (leicht, mittel, voll), aus der Messung UE-12 über alle 7 Kits so gesetzt, dass die Mitte
   zwischen leisestem und lautestem Kit bei 0 LU zum Groove liegt (Pegel der Engine = v², Faktor k = 10^(−LU/40)). */
const UE_VK = {'w-fill-kurz': [1.12,1.013,0.861],'w-fill-lang': [1.237,1.114,1.071],'w-tom-wirbel': [1.12,1.078,0.928],'w-snare-wirbel': [1.336,0.97,0.902],'w-build': [1.002,0.908,0.805],'w-fill-crash': [1.24,1.118,1.07],'w-crash-eins': [0.856,0.853,0.588],'w-hh-auf': [1.31,1.198,0.98],'w-kick-auftakt': [0.779,0.699,0.64],'w-halbzeit': [1.329,1.281,1.05],'w-clap-treppe': [0.929,0.925,0.899],'w-rim-ping': [0.856,0.821,0.786]};
const UE_WERK = [
  // ---- Übergänge (UE-C, §1.4) ----
  {id: 'w-fill-kurz', tab: 'ue', name: 'Fill kurz', sh: 'Fill', k: 'fill', lens: [2], mode: 'ersetzt', eins: 1, P: [
    {K: 'x...x...', S: 'x.x.....', H: '....x...', L: '......x.'},
    {K: 'x.......', S: 'x.xx....', H: '....xx..', M: '......x.', L: '.......x'},
    {K: 'x...x...', S: 'Xxxx....', H: '....Xx..', M: '......x.', L: '.......X'}]},
  {id: 'w-fill-lang', tab: 'ue', name: 'Fill lang', sh: 'Fill', k: 'fill', lens: [4], mode: 'ersetzt', eins: 1, P: UE_FILL_LANG},
  {id: 'w-tom-wirbel', tab: 'ue', name: 'Tom-Wirbel', sh: 'Toms', k: 'tom', lens: [2, 4], mode: 'ersetzt', eins: 1, gen: 'tom'},
  {id: 'w-snare-wirbel', tab: 'ue', name: 'Snare-Wirbel', sh: 'Wirbel', k: 'fill', lens: [2], mode: 'ersetzt', eins: 1, gen: 'roll'},
  {id: 'w-build', tab: 'ue', name: 'Build-up', sh: 'Build', k: 'build', lens: [8, 16], mode: 'ersetzt', gen: 'build'},
  {id: 'w-fill-crash', tab: 'ue', name: 'Fill + Crash', sh: 'Fill+Cr', k: 'fill', lens: [4], mode: 'ersetzt', crash: 1, P: UE_FILL_LANG},
  {id: 'w-crash-eins', tab: 'ue', name: 'Crash auf die Eins', sh: 'Crash', k: 'crash', lens: [0], mode: 'dazu', P: [{Y: 'x'}, {Y: 'x', K: 'x'}, {Y: 'X', K: 'x'}]},
  {id: 'w-hh-auf', tab: 'ue', name: 'Hi-Hat öffnen', sh: 'HH auf', k: 'fill', lens: [1], mode: 'ersetzt', P: [
    {K: 'x...', S: 'x...', o: '..x.'}, {K: 'x...', S: 'x...', h: 'x...', o: '..x.'}, {K: 'x...', S: 'X...', h: 'xx..', o: '..X.'}]},
  {id: 'w-kick-auftakt', tab: 'ue', name: 'Kick-Auftakt', sh: 'Kick', k: 'fill', lens: [1], mode: 'dazu', P: [{K: '...x'}, {K: '..xx'}, {K: '..xx', h: '..x.'}]},
  {id: 'w-halbzeit', tab: 'ue', name: 'Halbzeit-Fill', sh: 'Halbz.', k: 'fill', lens: [4], mode: 'ersetzt', eins: 1, P: [
    {K: 'x.....x.........', S: '........x.......', h: 'x.x.x.x.x.x.....', H: '............x...', L: '..............x.'},
    {K: 'x.....x.........', S: '........x.......', H: '............x...', M: '.............x..', L: '..............x.'},
    {K: 'x.....x.x.......', S: '........X.......', h: 'x.x.x.x.x.x.....', H: '............xx..', M: '..............x.', L: '...............X'}]},
  {id: 'w-clap-treppe', tab: 'ue', name: 'Clap-Treppe', sh: 'Claps', k: 'fill', lens: [2], mode: 'dazu', eins: 1, P: [
    {C: 'x.x.x.xx'}, {C: 'x.x.xxxx'}, {K: 'x...x...', C: 'X.x.xxxx'}]},
  {id: 'w-rim-ping', tab: 'ue', name: 'Rim-Ping', sh: 'Rim', k: 'fill', lens: [2], mode: 'dazu', eins: 1, P: [
    {R: 'g...g...', H: '..x...x.', K: 'x...x...'}, {R: 'g.g.g.g.', H: '.x.x.x.x'}, {K: 'x...x...', R: 'x.g.x.g.', H: '.x.x.xXx'}]},
  // ---- Breaks (UE-D, §1.3 D) ----
  {id: 'w-stopp-1', tab: 'brk', name: 'Stopp 1 Schlag', sh: 'Stopp', k: 'break', lens: [1]},
  {id: 'w-stopp-halb', tab: 'brk', name: 'Stopp ½ Takt', sh: 'Stopp', k: 'break', lens: [2]},
  {id: 'w-stopp-takt', tab: 'brk', name: 'Stopp 1 Takt', sh: 'Stopp', k: 'break', lens: [4], kick: 1},
  {id: 'w-breakdown', tab: 'brk', name: 'Breakdown', sh: 'Breakd.', k: 'break', lens: [8], drums: 1},
  // ---- Einwürfe (UE-D, §1.3 E) ----
  {id: 'w-tom-doppel', tab: 'adl', name: 'Tom-Doppel', sh: 'Toms', k: 'adlib', lens: [1], mode: 'dazu', P: [{M: 'x...', L: '..x.'}, {M: 'xx..', L: '..xx'}, {K: 'x...', M: 'Xx..', L: '..xX'}]},
  {id: 'w-becken', tab: 'adl', name: 'Becken', sh: 'Becken', k: 'adlib', lens: [0], mode: 'dazu', P: [{Y: 'x'}, {Y: 'X'}, {Y: 'X', K: 'x'}]},
  {id: 'w-wirbel-kurz', tab: 'adl', name: 'Wirbel kurz', sh: 'Wirbel', k: 'adlib', lens: [1], mode: 'dazu', P: [{S: '4...'}, {S: '4.4.'}, {S: '44X4'}]},
  {id: 'w-clap-einwurf', tab: 'adl', name: 'Clap-Einwurf', sh: 'Clap', k: 'adlib', lens: [.5], mode: 'dazu', P: [{C: 'x.'}, {C: 'X.'}, {C: 'Xx'}]},
];
const UE_TABS = [['ue', 'Übergänge'], ['brk', 'Breaks'], ['adl', 'Einwürfe']];   // [Verknüpfer] [Eigene] kommen mit UE-G / UE-E
const UE = {win: null, hk: new Map(), open: false, el: null, tab: 'ue', drag: null, chips: [], css: false, prevT: 0};
function ueWerk(id) { for (const w of UE_WERK) if (w.id === id) return w; return null; }
// Anschlags-Kurve über die Länge: aufbauend steigt, abbauend fällt, gleich bleibt
function ueCurve(x, dir) { return dir === 'auf' ? .76 + .3 * x : dir === 'ab' ? 1.06 - .3 * x : .92; }   // Mittel je Richtung ≈ .92 (gleiche Lautheit)
function ueNote(t, gm, v, o) { const n = {t: +t.toFixed(4), d: .25, n: gm, v: +clamp(v, .05, 1).toFixed(2)}; if (o) Object.assign(n, o); return n; }
function uePat(rows, step, L, dir) {
  const out = [];
  for (const k of Object.keys(rows)) {
    const gm = UE_GM[k], p = rows[k];
    for (let i = 0; i < p.length; i++) {
      const c = p[i]; if (c === '.') continue;
      const t = i * step; if (t > L + 1e-9) continue;
      const x = L > 0 ? t / L : 1, v = ueCurve(x, dir) * (c === 'g' ? .42 : c === 'X' ? 1 : .88);
      out.push(ueNote(t, gm, v, c === 'X' ? {a: 1} : c >= '2' && c <= '4' ? {r: +c} : null));
    }
  }
  return out;
}
const UE_GEN = {
  // TOM HOCH → MITTE → TIEF (16tel; leicht 8tel), Kick auf jedem Schlag, Akzent je Schlag, letzter Schlag mit Wirbel 2
  tom(L, dens, dir) {
    const st = dens ? .25 : .5, n = Math.round(L / st), out = [];
    for (let i = 0; i < n; i++) {
      const t = i * st, gm = [UE_GM.H, UE_GM.M, UE_GM.L][Math.min(2, Math.floor(i * 3 / n))], acc = dens === 2 && Math.abs(t % 1) < 1e-9;
      out.push(ueNote(t, gm, ueCurve(t / L, dir) * (acc ? 1 : .88), acc ? {a: 1} : dens === 2 && t >= L - .5 - 1e-9 ? {r: 2} : null));
    }
    for (let b = 0; b < L - 1e-9; b++) out.push(ueNote(b, UE_GM.K, ueCurve(b / L, dir) * .9));   // Kick auf jedem Schlag (gleichmäßiger Pegel über die Kits)
    return out;
  },
  // Snare, Wirbel (Ratsche) 2 → 4, der Anschlag steigt (abbauend: fällt)
  roll(L, dens, dir) {
    const st = dens ? .25 : .5, n = Math.round(L / st), out = [];
    for (let i = 0; i < n; i++) {
      const x = n > 1 ? i / (n - 1) : 1, r = dens === 0 ? 2 : dens === 1 ? (x < .5 ? 2 : 3) : 2 + Math.min(2, Math.floor(x * 3));
      const up = dir === 'ab' ? 1 - .45 * x : .5 + .5 * x;
      out.push(ueNote(i * st, UE_GM.S, up, Object.assign({r}, dens === 2 && i === n - 1 ? {a: 1} : null)));
    }
    return out;
  },
  // Snare 4tel → 8tel → 16tel → Ratsche 4 (leicht: ohne Ratsche), Tune +0 → +7 Halbtöne; voll: Kick auf jedem Schlag
  build(L, dens, dir) {
    const out = [], q = L / 4, top = 1;
    for (let t = 0; t < L - 1e-9;) {
      const seg = Math.min(3, Math.floor(t / q + 1e-9)), st = [1, .5, .25, .25][seg], x = t / L, tune = Math.round(7 * x);
      const o = {}; if (tune) o.lk = {tune}; if (seg === 3 && dens) o.r = 4; if (dens === 2 && Math.abs(t % 1) < 1e-9 && seg >= 2) o.a = 1;
      out.push(ueNote(t, UE_GM.S, (.5 + .5 * x) * top, Object.keys(o).length ? o : null));
      t = +(t + st).toFixed(4);
    }
    if (dens === 2) for (let b = 0; b < L - 1e-9; b++) out.push(ueNote(b, UE_GM.K, (.6 + .35 * b / L) * top));
    return out;
  },
};
// die Noten eines Werks-Übergangs für Länge L (Schläge), Dichte und (aufgelöste) Richtung – deterministisch, nach Zeit sortiert
function ueGen(w, L, dens, dir) {
  if (!w || w.k === 'break') return [];
  dens = clamp(dens | 0, 0, 2); if (dir !== 'auf' && dir !== 'ab') dir = 'gleich';
  const cdir = L <= 1 ? 'gleich' : dir;                          // ≤ 1 Schlag: keine Kurve (die Richtung zeigt der Crash auf der Eins)
  const out = w.gen ? UE_GEN[w.gen](L, dens, cdir) : uePat(w.P[dens], w.step || .25, L, cdir);
  const k = UE_VK[w.id] ? UE_VK[w.id][dens] : 1;
  // auf die Eins des neuen Teils (t = L): „Fill + Crash“ immer; aufbauend (mittel/voll) bei den Fills mit Eins und beim Build-up
  if (w.crash || ((w.eins || w.gen === 'build') && dir === 'auf' && dens >= 1)) out.push(ueNote(L, UE_GM.Y, dens === 2 ? 1 : .86, dens === 2 ? {a: 1} : null));
  if (k !== 1) for (const n of out) n.v = +clamp(n.v * k, .05, 1).toFixed(2);
  return out.sort((a, b) => a.t - b.t || a.n - b.n);
}
function ueNotesNorm(list) {
  const out = [];
  for (const n of Array.isArray(list) ? list.slice(0, 1024) : []) {
    if (!n || !isNum(n.t) || !isNum(n.n) || !isNum(n.v)) continue;
    const o = {t: +clamp(+n.t, 0, 256).toFixed(4), d: isNum(n.d) ? +Math.max(1 / 64, +n.d).toFixed(4) : .25, n: clamp(Math.round(n.n), 0, 127), v: +clamp(+n.v, .05, 1).toFixed(2)};
    if (n.a) o.a = 1; if (isNum(n.p) && n.p < 1) o.p = +clamp(n.p, .05, 1).toFixed(2); if (isNum(n.r) && n.r > 1) o.r = clamp(Math.round(n.r), 2, 4);
    if (isNum(n.m) && n.m) o.m = +clamp(n.m, -.45, .45).toFixed(2);
    if (n.lk && typeof n.lk === 'object') { const lk = {}; if (isNum(n.lk.tune) && n.lk.tune) lk.tune = clamp(Math.round(n.lk.tune), -24, 24); if (isNum(n.lk.dec) && n.lk.dec > 0 && n.lk.dec !== 1) lk.dec = +clamp(n.lk.dec, .25, 4).toFixed(2); if (Object.keys(lk).length) o.lk = lk; }
    out.push(o);
  }
  return out.sort((a, b) => a.t - b.t || a.n - b.n);
}
/* ---------- UE-Kern minimal – beim Merge durch UE-A ersetzt: Normieren, Haken (songShift/Clear/Cut/Write/Tidy), Abspielen ---------- */
// UE-Kern minimal – beim Merge durch UE-A ersetzt
function ueNorm(list, marks, nt) {
  if (!Array.isArray(list) || !list.length) return null;
  nt = nt || MAX_T;
  const ids = new Set(), mk = new Set((marks || []).map(m => m.id)), out = [];
  for (const u of list.slice(0, 512)) {
    if (!u || typeof u !== 'object') continue;
    let id = typeof u.id === 'string' && /^U\d{1,6}$/.test(u.id) && !ids.has(u.id) ? u.id : null;
    if (!id) { let n = 1; while (ids.has('U' + n)) n++; id = 'U' + n; }
    const o = {id};
    if (typeof u.m === 'string') { if (!mk.has(u.m)) continue; o.m = u.m; }
    else if (isNum(u.at) && u.at >= 0) o.at = +(+u.at).toFixed(4);
    else continue;
    ids.add(id);
    o.a = isNum(u.a) ? +clamp(+u.a, -64, 64).toFixed(4) : 0;
    o.len = isNum(u.len) ? +clamp(+u.len, 0, 64).toFixed(4) : 0;
    o.k = UE_K.includes(u.k) ? u.k : 'fill';
    o.t = isNum(u.t) ? clamp(Math.round(u.t), 0, nt - 1) : DRUM_T;
    o.notes = ueNotesNorm(u.notes);
    o.mode = u.mode === 'dazu' ? 'dazu' : 'ersetzt';
    if (Array.isArray(u.stop)) o.stop = [...new Set(u.stop.filter(isNum).map(x => Math.round(x)).filter(x => x >= 0 && x < nt))].sort((x, y) => x - y);
    o.dens = isNum(u.dens) ? clamp(Math.round(u.dens), 0, 2) : 1;
    o.dir = u.dir === 'auf' || u.dir === 'ab' ? u.dir : 'auto';
    if (typeof u.g === 'string' && u.g) o.g = u.g.slice(0, 16);
    if (typeof u.src === 'string' && u.src) o.src = u.src.slice(0, 40);
    if (u.kit && typeof u.kit === 'object') o.kit = deep(u.kit);         // UE-E (eigenes Kit) – hier nur durchgereicht
    if (u.baked != null) o.baked = deep(u.baked);                         // UE-H – hier nur durchgereicht
    out.push(o);
  }
  return out.length ? out : null;
}
function ueNewId(song) { let n = 0; for (const u of song.ue || []) { const k = +String(u.id).slice(1); if (k > n) n = k; } return 'U' + (n + 1); }
// Song-Schlag der Kante bzw. des Ankers (null: Marke fehlt)
function ueAnchor(song, u) { if (u.m == null) return isNum(u.at) ? u.at : null; const m = song.marks.find(x => x.id === u.m); return m ? m.a * 4 : null; }
// Haken: alles ab Takt n rückt um d Takte (Kanten-Übergänge wandern mit ihrer Marke)
function ueShift(song, n, d) { for (const u of song.ue) if (u.m == null && u.at >= n * 4 - 1e-6) u.at = +(u.at + d * 4).toFixed(4); }
function ueClear(song, a, b) { song.ue = song.ue.filter(u => u.m != null || !(u.at >= a * 4 - 1e-6 && u.at < b * 4 - 1e-6)); if (!song.ue.length) delete song.ue; }
// songCut: Kanten-Übergänge der Marken, die im Bereich beginnen (mi = Index in ch.marks), und freie Einträge im Bereich
function ueCutTo(song, a, b, ch) {
  if (!song.ue) return ch;
  const out = [];
  for (const u of song.ue) {
    if (u.m != null) { const mi = (ch.marks || []).findIndex(m => m.id === u.m), m = song.marks.find(x => x.id === u.m); if (mi < 0 || !m || m.a < a || m.a >= b) continue; const c = deep(u); delete c.id; delete c.m; c.mi = mi; out.push(c); }
    else if (u.at >= a * 4 - 1e-6 && u.at < b * 4 - 1e-6) { const c = deep(u); delete c.id; c.at = +(u.at - a * 4).toFixed(4); out.push(c); }
  }
  if (out.length) ch.ue = out;
  return ch;
}
// songWrite: wIds = die Marken-IDs, unter denen ch.marks geschrieben wurden; eine belegte Kante wird ersetzt
function ueWrite(song, n, ch, wIds) {
  for (const c of ch.ue) {
    const u = deep(c); delete u.mi;
    if (c.mi != null) { const id = wIds[c.mi]; if (!id) continue; u.m = id; song.ue = (song.ue || []).filter(x => !(x.m === id && ueSlot(x) === ueSlot(u))); }
    else u.at = +(n * 4 + c.at).toFixed(4);
    u.id = ueNewId(song); (song.ue || (song.ue = [])).push(u);
  }
}
// eine Kante hat einen Platz für einen Übergang und einen für einen Break
const ueSlot = u => (u.k === 'break' ? 'b' : 'u');
function ueTidy(song) {
  const mk = new Map(song.marks.map(m => [m.id, m]));
  song.ue = song.ue.filter(u => (u.m != null ? mk.has(u.m) : isNum(u.at) && u.at < song.bars * 4 - 1e-9));   // eine Marke auf Takt 1 behält ihren Übergang (er klingt dort nicht)
  for (const u of song.ue) if (u.dir === 'auto' && u.m != null) ueRegen(song, u);   // Richtung Auto folgt den Clips vor/nach der Kante
  if (!song.ue.length) delete song.ue;
}
// aktive Clips eines Takts (für die Richtung, §1.4: m.off aus S0 steht schon als „aus“ in den Spuren)
function ueActive(song, x) { if (x < 0) return 0; let n = 0; for (let t = 0; t < song.lanes.length; t++) if (laneClipOk(song, t, laneOriginAt(song.lanes[t], x))) n++; return n; }
function ueDirOf(song, u) {
  if (u.dir === 'auf' || u.dir === 'ab') return u.dir;
  if (u.k === 'adlib' || u.k === 'break' || u.m == null) return 'gleich';
  const m = song.marks.find(x => x.id === u.m); if (!m) return 'gleich';
  const b = ueActive(song, m.a - 1), f = ueActive(song, m.a);
  return f > b ? 'auf' : f < b ? 'ab' : 'gleich';
}
// Noten eines Werks-Eintrags neu erzeugen – nur solange sie unverändert einem Werks-Stand entsprechen (eigene Änderungen bleiben)
function ueRegen(song, u, force) {
  const w = ueWerk(u.src); if (!w || w.k === 'break') return;
  const want = ueGen(w, u.len, u.dens, ueDirOf(song, u)), J = JSON.stringify;
  if (J(want) === J(u.notes)) return;
  if (!force && !['auf', 'ab', 'gleich'].some(d => J(ueGen(w, u.len, u.dens, d)) === J(u.notes))) return;
  u.notes = want;
}
/* ---------- Abspielen (Scheduler): Fenster je Song-Stand, Treffer in songTickInner, „ersetzt“/Break in scheduleTrack ---------- */
function ueWin(song) {
  const key = UI.songVer | 0;
  if (UE.win && UE.win.song === song && UE.win.key === key && UE.win.ref === song.ue) return UE.win;
  const W = {song, key, ref: song.ue, ev: [], mute: [], stop: []};
  for (const u of song.ue || []) {
    const A = ueAnchor(song, u); if (A == null) continue;
    const s = A + u.a, e = s + u.len;
    if (u.k === 'break') { W.stop.push({s, e, tr: new Set(u.stop || []), kick: u.mode === 'dazu'}); continue; }
    if (u.mode === 'ersetzt' && u.len > 0) W.mute.push({s, e, t: u.t});
    for (const nt of u.notes) W.ev.push({sb: s + nt.t, nt, t: u.t});
  }
  W.ev.sort((x, y) => x.sb - y.sb);
  return (UE.win = W);
}
// Spur i schweigt bei Song-Schlag sb (Break; mit [Kick bleibt] spielt auf der Drum-Spur nur die Kick)
function ueStopAt(W, i, sb, gm) { for (const w of W.stop) if (sb >= w.s - 1e-9 && sb < w.e - 1e-9 && w.tr.has(i) && !(w.kick && i === DRUM_T && gm === UE_GM.K)) return true; return false; }
// die Fenster, in denen Spur i (Groove/Clip-Noten) schweigt: „ersetzt“ und Breaks; null = keine (schneller Weg)
function ueMuteFor(i) {
  const song = S.song; if (!song || !song.ue || !R.songPlay) return null;
  const W = ueWin(song); let L = null;
  for (const w of W.mute) if (w.t === i) (L || (L = [])).push(w);
  for (const w of W.stop) if (w.tr.has(i)) (L || (L = [])).push(w.kick && i === DRUM_T ? {s: w.s, e: w.e, keep: UE_GM.K, brk: 1} : Object.assign({brk: 1}, w));
  return L;
}
function ueMutedAt(L, B, gm) { const sb = songBeatOf(B); if (sb == null) return false; for (const w of L) if (sb >= w.s - 1e-9 && sb < w.e - 1e-9 && !(w.keep && w.keep === gm)) return true; return false; }
// eine Synth-Note, die in einen Break hineinklingen würde, endet an seinem Anfang (Schläge)
function ueDurCut(L, B, d) { const sb = songBeatOf(B); if (sb == null) return d; for (const w of L) if (w.brk && w.s > sb + 1e-9 && w.s < sb + d) d = w.s - sb; return d; }
// Melodie-Noten des Songs (Song-Schlag)
function ueMelCut(song, i, sb, d) {
  const W = ueWin(song); for (const w of W.stop) if (w.tr.has(i)) { if (sb >= w.s - 1e-9 && sb < w.e - 1e-9) return -1; if (w.s > sb + 1e-9 && w.s < sb + d) d = w.s - sb; }
  return d;
}
// derselbe Pad-Treffer zur selben Zeit von Übergang und Groove: nur einmal (der Übergang gewinnt)
function ueHitMark(gm, t) { let a = UE.hk.get(gm); if (!a) UE.hk.set(gm, a = []); a.push(t); if (a.length > 64) a.splice(0, a.length - 64); }
function ueDup(gm, t) { const a = UE.hk.get(gm); if (a) for (let k = a.length - 1; k >= 0; k--) if (Math.abs(a[k] - t) < 5e-4) return true; return false; }
// songTickInner, je Durchgang: Breaks, die im Fenster beginnen (Blende + Ausklingen), und die Treffer der Übergänge/Einwürfe
function ueSongTick(song, b0, b1, off, E, insB, lo) {
  const W = ueWin(song), from = Math.max(b0, lo), now = AU.ctx.currentTime;
  for (const w of W.stop) { const B = w.s + off; if (w.s < E - 1e-9 && w.s < insB - 1e-9 && B >= from - 1e-9 && B < b1 - 1e-9) ueBreakGo(w, b2t(B), b2t(Math.min(w.e, E) + off)); }
  const dt = S.settings.harmony.drums;
  for (const x of W.ev) {
    if (x.sb + off >= b1 + .5) break;
    if (x.sb + off < from - .5 || x.sb >= E - 1e-9 || x.sb >= insB - 1e-9) continue;
    const tr = S.tracks[x.t]; if (!tr || tr.kind !== 'drum' || tr.mute) continue;
    if (ueStopAt(W, x.t, x.sb, x.nt.n)) continue;                 // ein Break gewinnt
    for (const h of DrumSeq.expandStep(x.nt, 0, 0)) {
      const hb = x.sb + h.beat + off; if (hb < from - 1e-9 || hb >= b1 - 1e-9) continue;
      let t = b2t(hb + swingOffset(x.sb + h.beat)); if (t < now - .02) continue; if (t < now) t = now;
      let ex = h.acc || h.lk ? h : null; const tu = dt ? drumTune(t) : 0;
      if (tu) ex = Object.assign({}, ex, {lk: Object.assign({}, ex && ex.lk, {tune: ((ex && ex.lk && ex.lk.tune) || 0) + tu})});
      ueHitMark(x.nt.n, t);
      drumHit(x.nt.n, h.v, t, 'ue', ex);
    }
  }
}
// Break: die Spuren werden ab t0 in 12 ms still und ab t1 wieder hörbar (Hall/Echo hängen danach und klingen aus); klingende
// Clip-/Melodie-Stimmen enden mit ihrem Release; die Chor-Gruppen der Spur schweigen mit
function ueBreakGo(w, t0, t1) {
  if (!(t1 > t0 + 2 * UE_RAMP)) t1 = t0 + 2 * UE_RAMP;
  for (const i of w.tr) {
    const A = AU.tracks[i]; if (!A) continue;
    if (!(w.kick && i === DRUM_T) && A.ueB) ueGainHole(A.ueB.gain, t0, t1);
    if (S.tracks[i] && S.tracks[i].kind !== 'drum') for (const v of VOICES) if (!v.dead && v.track === i && (v.src === 'clip' || v.src === 'melody' || v.src === 'own') && v.start < t0 && v.end > t0) v.release(t0);
    for (const r of TK.src) if (!r.dead && r.i === i && r.chG && r.chG.ueB) ueGainHole(r.chG.ueB.gain, t0, t1);
  }
  (UE.brk || (UE.brk = [])).push({tr: w.tr, kick: w.kick, t0, t1}); if (UE.brk.length > 16) UE.brk.shift();
}
function ueGainHole(p, t0, t1) {
  try { p.cancelScheduledValues(t0); p.setValueAtTime(1, t0); p.linearRampToValueAtTime(0, t0 + UE_RAMP); p.setValueAtTime(0, t1 - UE_RAMP); p.linearRampToValueAtTime(1, t1); } catch (e) { logErr(e); }
}
// eine Chor-Gruppe, die während eines geplanten Breaks ihrer Spur entsteht, schweigt mit
function ueChorJoin(G, i) {
  if (!UE.brk || !G.ueB) return; const now = G.c.currentTime;
  for (const b of UE.brk) if (b.t1 > now && b.tr.has(i)) ueGainHole(G.ueB.gain, Math.max(now, b.t0), b.t1);
}
// Stopp: jede Break-Blende zurück auf 1
function ueReset(now) {
  UE.brk = null; UE.hk.clear();
  for (const A of AU.tracks) if (A && A.ueB) { try { A.ueB.gain.cancelScheduledValues(0); A.ueB.gain.setValueAtTime(1, now); } catch (e) {} }
  for (const r of TK.src) if (r.chG && r.chG.ueB) { try { r.chG.ueB.gain.cancelScheduledValues(0); r.chG.ueB.gain.setValueAtTime(1, now); } catch (e) {} }
}
/* ---------- Ablegen, Ändern, Entfernen (je 1 Undo über songEdit) ---------- */
// alle Spuren außer Gesang (STIMME-Spuren) – Standard eines Breaks (§1.3 D); Breakdown: nur die Drums
function ueStopDefault(w) { if (w && w.drums) return [DRUM_T]; const o = []; for (let i = 0; i < NT(); i++) if (S.tracks[i] && !S.tracks[i].stimme) o.push(i); return o; }
function ueEdgeMarks(song) { return song ? song.marks.filter(m => m.a > 0) : []; }
// pl: {m: Marken-ID} (Kante) oder {at: Song-Schlag}; o: {len, dens, dir, mode, stop}
function ueAdd(src, pl, o) {
  const w = ueWerk(src); if (!w || !S.song || !pl || R.songRec) return null;
  o = o || {};
  const L = isNum(o.len) && w.lens.includes(+o.len) ? +o.len : w.lens[0];
  if (pl.m != null) { if (w.tab === 'adl') return null; const m = S.song.marks.find(x => x.id === pl.m); if (!m || m.a <= 0) return null; }
  else if (!(isNum(pl.at) && pl.at >= 0 && pl.at < S.song.bars * 4)) return null;
  let id = null;
  const r = songEdit(w.name, song => {
    const u = {id: ueNewId(song)};
    if (pl.m != null) u.m = pl.m; else u.at = +(Math.round(pl.at * 4) / 4).toFixed(4);
    u.a = pl.m != null && w.k !== 'crash' ? -L : 0; u.len = L; u.k = w.k; u.t = DRUM_T; u.notes = [];
    u.mode = w.k === 'break' ? (o.kick ? 'dazu' : 'ersetzt') : (o.mode === 'dazu' || o.mode === 'ersetzt' ? o.mode : w.mode);
    if (w.k === 'break') u.stop = Array.isArray(o.stop) ? o.stop.slice() : ueStopDefault(w);
    u.dens = isNum(o.dens) ? clamp(Math.round(o.dens), 0, 2) : 1;
    u.dir = o.dir === 'auf' || o.dir === 'ab' ? o.dir : 'auto';
    u.src = w.id;
    if (w.k !== 'break') u.notes = ueGen(w, L, u.dens, ueDirOf(song, u));
    if (u.m != null) song.ue = (song.ue || []).filter(x => !(x.m === u.m && ueSlot(x) === ueSlot(u)));   // belegte Kante: ersetzen
    (song.ue || (song.ue = [])).push(u); id = u.id;
  });
  return r ? id : null;
}
function ueGet(id) { return S.song && S.song.ue ? S.song.ue.find(u => u.id === id) || null : null; }
// Felder ändern: {len, dens, dir, mode, stop, kick}; die Noten folgen (Werks-Eintrag)
function ueSet(id, p, label) {
  const u0 = ueGet(id); if (!u0 || R.songRec) return false;
  return !!songEdit(label || 'Übergang ändern', song => {
    const u = song.ue.find(x => x.id === id), w = ueWerk(u.src);
    if (isNum(p.len) && (!w || w.lens.includes(+p.len))) { if (u.m != null && u.a === -u.len) u.a = -(+p.len); u.len = +p.len; }
    if (isNum(p.dens)) u.dens = clamp(Math.round(p.dens), 0, 2);
    if (p.dir) u.dir = p.dir === 'auf' || p.dir === 'ab' ? p.dir : 'auto';
    if (p.mode && u.k !== 'break') u.mode = p.mode === 'dazu' ? 'dazu' : 'ersetzt';
    if (u.k === 'break') { if (Array.isArray(p.stop)) u.stop = [...new Set(p.stop)].filter(x => x >= 0 && x < NT()).sort((a, b) => a - b); if (p.kick != null) u.mode = p.kick ? 'dazu' : 'ersetzt'; }
    if (w && u.k !== 'break') ueRegen(song, u, true);
  });
}
function ueDel(id) { if (!ueGet(id) || R.songRec) return false; return !!songEdit('Übergang entfernen', song => { song.ue = song.ue.filter(x => x.id !== id); if (!song.ue.length) delete song.ue; }); }
// verschieben: Einwurf/freier Break auf einen Song-Schlag (1/16), Kanten-Eintrag auf eine andere Kante
function ueMove(id, pl) {
  const u0 = ueGet(id); if (!u0 || !pl || R.songRec) return false;
  if (pl.m != null) { const m = S.song.marks.find(x => x.id === pl.m); if (!m || m.a <= 0 || u0.k === 'adlib') return false; }
  else if (!(isNum(pl.at) && pl.at >= 0 && pl.at < S.song.bars * 4)) return false;
  return !!songEdit('Übergang verschieben', song => {
    const u = song.ue.find(x => x.id === id);
    if (pl.m != null) { song.ue = song.ue.filter(x => x === u || !(x.m === pl.m && ueSlot(x) === ueSlot(u))); delete u.at; u.m = pl.m; if (u.a === 0 && u.k !== 'crash' && u.len) u.a = -u.len; ueRegen(song, u); }
    else { delete u.m; u.at = +(Math.round(pl.at * 4) / 4).toFixed(4); u.a = 0; }
  });
}
// Vorhören einer Kachel mit dem Kit der Spur (≤ 50 ms nach dem Tipp, UE-08)
function uePreview(src, o) {
  const w = ueWerk(src); if (!w) return false;
  o = o || {};
  if (w.k === 'break') { lcdOrToast(w.name + ' · ' + ueLenTxt(w.lens[0]) + ' · ' + (w.drums ? 'die Drums schweigen' : 'alle außer Gesang schweigen')); return true; }
  ensureAudio(); const c = AU.ctx; if (!c) return false;
  const L = isNum(o.len) ? o.len : w.lens[0], dens = isNum(o.dens) ? o.dens : 1, sp = spb(), t0 = c.currentTime + .008;
  UE.prevT = t0;
  for (const nt of ueGen(w, L, dens, o.dir || 'gleich')) for (const h of DrumSeq.expandStep(nt, 0, 0)) drumHit(nt.n, h.v, t0 + (nt.t + h.beat) * sp, 'preview', h.acc || h.lk ? h : null);
  return true;
}
const UE_LENT = {0: '–', .5: '⅛', 1: '¼', 2: '½', 4: '1', 8: '2', 16: '4'};
const ueLenTxt = L => (L === 0 ? 'auf die Eins' : (UE_LENT[L] || String(L / 4)) + (L === 4 ? ' Takt' : L > 4 ? ' Takte' : ' Takt'));
