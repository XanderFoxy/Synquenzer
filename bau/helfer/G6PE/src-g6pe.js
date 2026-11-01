/* G6PE-BEGIN */
/* =====================================================================================================================
   G6+e (Nachtrag 10 §1.1–§1.3, Nachtrag „Kopplung Lead ↔ Chor“): Blatt „Chor“ neu.
   Oben das Stil-Raster (8 Kacheln, hochkant 2 × 4, quer 4 × 2), darunter das Mischpult der Chor-Gruppe: Gruppen-Zeile
   ([Chor an], [Gekoppelt], Regler „Chor“ = Abstand zum Lead, Hall, Echo, [Klang ▸], [Auf alle Stellen]) und je Chor-Spur eine Zeile
   (Farbfeld mit Ziffer, Name, [S] Solo, [M] Stumm, Pegel, Pan, [♪], [⋯]). Ein Chor aus 4.25 (ohne v) zeigt die alte Ansicht
   „Chor (Fassung 4.25)“ mit [Auf Chor-Gruppe umstellen].
   Daten: liest/schreibt nur die Spec-Felder (§2.2): clip.audio.chor / song.vox[k].chor = {v: 2, style, grp, voices[{lane, rule, n, db, pan, w, dbl, take?}]},
   S.tracks[st].chor = {lanes: [{id, role, name, mute?}], mute?, cpl?}. Kopplung (Nachtrag): cpl = {off: true, ref: Lead-dB beim Trennen} nur wenn AUS.
   Fehlt eine Funktion eines Nachbar-Pakets (G6+a Daten, G6+c Klangweg, G6+d Stile, G6+f Entkoppeln), steht unten ein schmaler
   Platzhalter mit genau dem Spec-Namen; das Paket ersetzt ihn beim Zusammenführen.
   ===================================================================================================================== */
const G6PE = {kl: false, dot: null, busy: null, live: null, add: false, ren: null, tap: null};
const G6PE_TILES = [   // Kachel: Schlüssel, Name, Zeile (≤ 20 Zeichen)
  ['80', '80er großer Refrain', 'Terz+Okt · viel Hall'], ['pop', 'Pop modern', 'eng gedoppelt'], ['gospel', 'Gospel', 'Sopran · Alt · Tenor'],
  ['barber', 'Barbershop', 'vierstimmig, trocken'], ['rock', 'Rock-Shout', 'Gang-Ruf, breit'], ['ballade', 'Ballade', 'Terz+Sexte · Hall'],
  ['disco', 'Disco/Falsett', 'Falsett Okt+Terz'], ['wave', 'New Wave dunkel', 'tief · Okt+Quinte']];
const G6PE_ADD = [['st+2', 'Terz oben'], ['st-2', 'Terz unten'], ['st+3', 'Quarte oben'], ['st-3', 'Quarte unten'], ['st+4', 'Quinte oben'], ['st-4', 'Quinte unten'],
  ['st+5', 'Sexte oben'], ['st-5', 'Sexte unten'], ['oct+1', 'Oktave oben'], ['oct-1', 'Oktave unten'], ['ch+1', 'Akkordton oben'], ['ch-1', 'Akkordton unten'],
  ['root-', 'Grundton unten'], ['st+2/o+1', 'Terz + Oktave'], ['uni', 'Unisono-Doppel']];
const G6PE_MAXV = 6, G6PE_MAXL = 8;
const G6PE_PRE = [['', 'aus'], ['1/64', '1/64'], ['1/32', '1/32'], ['1/16', '1/16']];
const G6PE_SIB = [[0, 'ganz'], [-12, 'leiser'], [-60, 'weg']];

/* ---------- Platzhalter (G6+d): Stil-Tabelle §3 G6+d, eingefroren mit chor.v = 2 ---------- */
const G6PE_STYLE0 = (() => {
  const C = (...a) => a.map(([ms, ct, p]) => ({ms, ct, p})), V = (rule, pan, w, db, dbl, name) => ({rule, pan, w, db, dbl, name});
  const g = (below, hp, mid, midF, air, sib, rev, pre, dly) => ({below, hp, mid, midF, air, sib, rev, pre, dly});
  const POP = C([8, -4, -1], [15, 5, 1]), GOS = o => C([9 + o, -10, -1], [21 + o, 5, 0], [34 + o, 12, 1]), ROCK = C([17, -14, -1], [28, 12, 1], [41, -19, -.5], [52, 17, .5]);
  return {
    '80': {label: '80er großer Refrain', echo: '1/4', voices: [V('uni', 0, 1, 0, C([16, -8, -1], [29, 9, 1])), V('st+2', 0, .7, -1, C([12, -6, -1], [24, 8, 1])), V('oct+1', 0, .4, -4, C([20, -5, -1], [33, 7, 1]))], grp: g(8, 180, -3, 400, 3, -12, .75, '1/32', .12)},
    pop: {label: 'Pop modern', echo: '1/8.', voices: [V('uni', 0, 1, 0, POP), V('st+2', 0, .6, -2, C([10, -5, -1], [18, 6, 1])), V('oct-1', 0, .3, -7, POP)], grp: g(9, 200, -2, 350, 4, -60, .35, '1/64', .18)},
    gospel: {label: 'Gospel', echo: null, voices: [V('ch+1', -.45, .25, 0, GOS(0), 'Chor Sopran'), V('ch-1', .45, .25, 0, GOS(2), 'Chor Alt'), V('ch-2', 0, .35, -1, GOS(4), 'Chor Tenor')], grp: g(6, 120, -1, 300, 2, -12, .5, '1/32', 0)},
    barber: {label: 'Barbershop', echo: null, voices: [V('ch+1', -.3, 0, -1, C([0, 0, 0]), 'Chor Tenor'), V('ch-1', .3, 0, 0, C([0, 0, 0]), 'Chor Bariton'), V('root-', 0, 0, 1, C([0, 0, 0]), 'Chor Bass')], grp: g(4, 70, 0, 400, 1, -6, .2, '1/64', 0)},
    rock: {label: 'Rock-Shout', echo: null, voices: [V('uni', 0, .8, 0, ROCK), V('oct-1', 0, .6, -3, ROCK)], grp: g(5, 250, 2, 1500, 0, -12, .2, '', 0)},
    ballade: {label: 'Ballade', echo: '1/4.', voices: [V('st+2', -.35, .35, -1, C([20, -6, -1], [35, 7, 1])), V('st-5', .35, .35, -2, C([20, -6, -1], [35, 7, 1]))], grp: g(10, 150, -2, 300, -2, -60, .85, '1/16', .2)},
    disco: {label: 'Disco/Falsett', echo: '1/8', voices: [V('oct+1', -.5, .3, 0, C([10, -7, -1], [18, 7, 1]), 'Chor Falsett Oktave'), V('st+2/o+1', .5, .3, -2, C([10, -7, -1], [18, 7, 1]), 'Chor Falsett Terz')], grp: g(7, 300, -2, 500, 5, -18, .5, '1/32', .15)},
    wave: {label: 'New Wave dunkel', echo: '1/4.', voices: [V('oct-1', -.4, 0, 0, C([25, -5, 0])), V('st-4', .4, 0, -2, C([28, 5, 0]))], grp: g(9, 80, -2, 2500, -3, -12, .6, '1/32', .25)},
    bg: {label: 'Background', echo: '1/4', voices: [V('free', -.6, .15, 0, C([12, -6, -1], [24, 8, 1]))], grp: g(9, 180, -2, 400, 2, -12, .5, '1/32', .1)}
  };
})();
try { if (typeof G6P_STYLE === 'undefined') window.G6P_STYLE = G6PE_STYLE0; } catch (e) { /* G6+d deklariert G6P_STYLE weiter unten selbst */ }
const g6peStyles = () => { try { return G6P_STYLE || G6PE_STYLE0; } catch (e) { return G6PE_STYLE0; } };

/* ---------- Rollen: Name, Intervall, Farbe (§1.6, §2.2) ---------- */
const g6peRole = s => { const m = /^(st|oct|ch)([+-])(\d)(?:\/o([+-]\d))?$/.exec(s || ''); return m ? {k: m[1], n: (m[2] === '-' ? -1 : 1) * +m[3], o: m[4] ? +m[4] : 0} : {k: s === 'root-' ? 'root' : s === 'uni' ? 'uni' : 'free', n: 0, o: 0}; };
function g6peRoleName(role, free) {
  const R = g6peRole(role), ud = R.n < 0 ? 'unten' : 'oben', ST = {1: 'Sekunde', 2: 'Terz', 3: 'Quarte', 4: 'Quinte', 5: 'Sexte', 6: 'Septime', 7: 'Oktave'};
  if (role === 'st+2/o+1') return 'Chor Terz + Oktave';
  if (R.k === 'st') return 'Chor ' + (ST[Math.abs(R.n)] || 'Stufe ' + Math.abs(R.n)) + ' ' + ud + (R.o ? ' + Oktave' : '');
  if (R.k === 'oct') return 'Chor Oktave ' + ud + (Math.abs(R.n) > 1 ? ' 2' : '');
  if (R.k === 'ch') return 'Chor Akkordton ' + ud + (Math.abs(R.n) > 1 ? ' ' + Math.abs(R.n) : '');
  if (R.k === 'root') return 'Chor Grundton';
  if (R.k === 'uni') return 'Chor Unisono';
  return 'Gegenstimme ' + (free || 1);
}
// Farbe/Ziffer aus Stufen d und Oktaven o einer Note (Tabelle §1.6)
function g6peIvCls(d, o) {
  const a = Math.abs(d | 0), m = a % 7;
  if (m === 0) return a === 0 && !o ? {c: 1, z: '1'} : {c: 8, z: '8'};
  if (m === 2) return {c: 3, z: a === 9 ? '10' : '3'};
  if (m === 4) return {c: 5, z: '5'}; if (m === 5) return {c: 6, z: '6'}; if (m === 3) return {c: 4, z: '4'};
  return {c: 2, z: m === 1 ? '2' : '7'};
}
// Farbe der Spur an dieser Stelle: Intervall-Rolle aus der Rolle, Akkord-Rolle aus dem häufigsten Intervall der Stimme (gleich: das kleinere)
function g6peLaneCls(lane, v) {
  const R = g6peRole(lane.role);
  if (R.k === 'free' || (v && v.rule === 'free')) return {c: 'f', z: '·'};
  if (R.k === 'st') return g6peIvCls(R.n, R.o); if (R.k === 'oct') return {c: 8, z: '8'}; if (R.k === 'uni') return {c: 1, z: '1'};
  const cnt = new Map(); for (const n of (v && v.n) || []) { const d = isNum(n.d) ? n.d : g6peStepsOf(n.iv); const x = g6peIvCls(d, n.o || 0); const k = x.z; cnt.set(k, (cnt.get(k) || 0) + 1); }
  let best = null, bn = -1; for (const [k, n] of cnt) if (n > bn || (n === bn && +k < +best)) { best = k; bn = n; }
  const C = {'1': 1, '2': 2, '3': 3, '10': 3, '4': 4, '5': 5, '6': 6, '7': 2, '8': 8};
  return best ? {c: C[best], z: best} : {c: 3, z: '3'};
}
const g6peStepsOf = iv => { const a = Math.abs(iv | 0) % 12, s = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6][a] + 7 * Math.floor(Math.abs(iv | 0) / 12); return iv < 0 ? -s : s; };

/* ---------- Platzhalter (G6+a): Spur-Daten, Normalisieren v2, Spur-Herkunft ---------- */
if (typeof g6pTrackOf !== 'function') window.g6pTrackOf = r => stimmeT();
if (typeof g6pNormLanes !== 'function') window.g6pNormLanes = c => {
  if (!c || typeof c !== 'object') return null;
  const ids = new Set(), lanes = (Array.isArray(c.lanes) ? c.lanes : []).filter(l => l && /^c[1-8]$/.test(l.id) && !ids.has(l.id) && ids.add(l.id)).slice(0, G6PE_MAXL)
    .map(l => { const o = {id: l.id, role: typeof l.role === 'string' ? l.role.slice(0, 12) : 'free', name: typeof l.name === 'string' && l.name.trim() ? l.name.slice(0, 24) : g6peRoleName(l.role)}; if (l.mute === true) o.mute = true; return o; });
  const o = {lanes}; if (c.mute === true) o.mute = true;
  if (c.cpl && c.cpl.off === true) o.cpl = {off: true, ref: isNum(c.cpl.ref) ? +clamp(c.cpl.ref, -96, 12).toFixed(2) : 0};
  return lanes.length || o.mute || o.cpl ? o : null;
};
if (typeof g6pNorm2 !== 'function') window.g6pNorm2 = c => {
  const r1 = x => +(+x).toFixed(2), G = c.grp || {}, num = (x, a, b, d) => isNum(x) ? r1(clamp(x, a, b)) : d;
  const grp = {below: num(G.below, 2, 20, 9), hp: num(G.hp, 20, 1000, 180), mid: num(G.mid, -12, 12, 0), midF: num(G.midF, 100, 8000, 400), air: num(G.air, -12, 12, 0),
    sib: [0, -6, -12, -18, -60].includes(G.sib) ? G.sib : -12, rev: num(G.rev, 0, 1, .5), pre: ['', '1/64', '1/32', '1/16'].includes(G.pre) ? G.pre : '1/32', dly: num(G.dly, 0, 1, 0)};
  const voices = [];
  for (const v of (Array.isArray(c.voices) ? c.voices : []).slice(0, G6PE_MAXV)) {
    if (!v || !Array.isArray(v.n)) continue;
    const n = v.n.slice(0, 4000).filter(x => x && isNum(x.t0) && isNum(x.t1) && x.t1 > x.t0 && isNum(x.m)).map(x => {
      const o = {t0: tkR6(x.t0), t1: tkR6(x.t1), m: +clamp(x.m, 0, 127).toFixed(3), d: clamp(Math.round(isNum(x.d) ? x.d : 0), -21, 21), iv: clamp(Math.round(isNum(x.iv) ? x.iv : 0), -36, 36)};
      if (isNum(x.o) && x.o) o.o = clamp(Math.round(x.o), -2, 2); if (isNum(x.x) && x.x) o.x = clamp(Math.round(x.x), -2, 2); return o; });
    const dbl = (Array.isArray(v.dbl) ? v.dbl : []).slice(0, 4).filter(q => q && isNum(q.ms)).map(q => ({ms: num(q.ms, 0, 80, 0), ct: num(q.ct, -50, 50, 0), p: num(q.p, -1, 1, 0)}));
    const o = {lane: /^c[1-8]$/.test(v.lane) ? v.lane : 'c1', rule: typeof v.rule === 'string' ? v.rule.slice(0, 12) : 'free', n, db: num(v.db, -24, 6, 0), pan: num(v.pan, -1, 1, 0), w: num(v.w, 0, 1, 0),
      dbl: dbl.length ? dbl : [{ms: 0, ct: 0, p: 0}],
      name: typeof v.name === 'string' ? v.name.slice(0, 40) : 'Stimme', vol: 1, rev: grp.rev, dly: grp.dly};   // Rückfall-Felder für 4.25 (§2.2)
    const t = v.take ? tkNormSeg(v.take) : null; if (t) o.take = t; if (v.dblOff === true) o.dblOff = true;
    voices.push(o);
  }
  if (!voices.length) return null;
  const out = {v: 2, style: typeof c.style === 'string' && c.style.length < 12 ? c.style : null, grp, voices,
    rec: G6_REC.some(r => r[0] === c.rec) ? c.rec : 'terz', dir: c.dir === 'down' ? 'down' : 'up', mix: '80'};
  return out;
};
// Spur-Liste der STIMME-Spur (legt S.tracks[st].chor an, wenn nötig)
function g6peLanes(st, make) {
  const tr = S.tracks[st]; if (!tr) return [];
  if (!tr.chor && make) tr.chor = {lanes: []};
  return tr.chor ? tr.chor.lanes : [];
}
const g6peLaneSnap = st => S.tracks[st] && S.tracks[st].chor ? JSON.stringify(S.tracks[st].chor) : null;
function g6peLaneRestore(st, val) { const tr = S.tracks[st]; if (!tr) return; const c = val ? g6pNormLanes(JSON.parse(val)) : null; if (c) tr.chor = c; else delete tr.chor; g6peHear(); if (G6.sheet) g6SheetPaint(); }
// Spur für eine Rolle finden oder anlegen (nicht benutzte graue Spur wird übernommen); null = Grenze 8
function g6peLaneFor(st, role, name, used) {
  const L = g6peLanes(st, true), hit = L.find(l => l.role === role && !(used && used.has(l.id)) && role !== 'free'); if (hit) return hit;
  const ids = new Set(L.map(l => l.id)); let id = null; for (let k = 1; k <= G6PE_MAXL; k++) if (!ids.has('c' + k)) { id = 'c' + k; break; }
  const nfree = L.filter(l => l.role === 'free').length + 1;
  if (!id) { const grey = L.find(l => !g6peLaneUsed(st, l.id) && !(used && used.has(l.id))); if (!grey) return null; grey.role = role; grey.name = name || g6peRoleName(role, nfree); delete grey.mute; return grey; }
  const l = {id, role, name: name || g6peRoleName(role, nfree)}; L.push(l); return l;
}
// alle Chor-Stellen der STIMME-Spur (Clips aller Szenen + Song-Stimmen)
function g6peStellen(st) {
  const out = []; const tr = S.tracks[st];
  if (tr) tr.clips.forEach((c, s) => { if (c && c.audio && c.audio.chor) out.push({r: {t: st, s}, a: c.audio}); });
  if (S.song && S.song.vox) for (const v of S.song.vox) if (v.chor) out.push({r: {vox: v.id}, a: v});
  return out;
}
const g6peLaneUsed = (st, id) => g6peStellen(st).some(x => x.a.chor.v === 2 && x.a.chor.voices.some(v => v.lane === id));

/* ---------- Ändern: ein Undo-Schritt je Geste (Stelle + ggf. Spur-Daten `chorlanes`) ---------- */
function g6peEdit(r, label, fn, opt) {
  opt = opt || {}; const x = tkRef(r); if (!x) return false;
  const st = g6pTrackOf(r), lb = opt.lanes ? g6peLaneSnap(st) : null, snap = opt.before;
  const items = [];
  if (snap != null) {   // Regler-Geste: nur ein Schritt, wenn sich wirklich etwas geändert hat
    const nowS = r.vox ? (() => { const v = S.song.vox.find(z => z.id === r.vox), n = tkNormAudio(v); if (n && n.chor) v.chor = n.chor; return songSnapshot(); })() : JSON.stringify(cleanClip(x.clip));
    if (nowS === (r.vox ? snap : JSON.stringify(snap))) return false;
  }
  if (r.vox) { const before = snap != null ? snap : songSnapshot(); if (fn(x.a) === false) { if (opt.lanes) g6peLaneRestore(st, lb); return false; } const v = S.song.vox.find(z => z.id === r.vox), n = tkNormAudio(v); if (n && n.chor) v.chor = n.chor; else delete v.chor; items.push({kind: 'song', before}); songChanged(); }
  else { const before = snap != null ? snap : cleanClip(x.clip); if (fn(x.clip.audio) === false) { if (opt.lanes) g6peLaneRestore(st, lb); return false; } const n = tkNormAudio(x.clip.audio); if (n && n.chor) x.clip.audio.chor = n.chor; else delete x.clip.audio.chor; items.push({kind: 'clip', track: r.t, scene: r.s, before: before ? cleanClip(before) : null}); clipChanged(r.t, r.s); }
  if (opt.lanes) items.push({kind: 'chorlanes', track: st, before: lb});
  undoPush(items.length === 1 ? Object.assign(items[0], {label}) : {kind: 'group', label, items});
  markDirty(); UI.dirty.all = true; haptic('tick'); g6Refresh();
  return true;
}
// nur Spur-Daten (Umbenennen, Spur stumm, Chor an/aus, Kopplung, Spur löschen): ein Schritt `chorlanes`
function g6peLaneEdit(st, label, fn) {
  const before = g6peLaneSnap(st); if (fn(S.tracks[st]) === false) return false;
  const c = g6pNormLanes(S.tracks[st].chor); if (c) S.tracks[st].chor = c; else delete S.tracks[st].chor;
  if (before === g6peLaneSnap(st)) return false;
  undoPush({kind: 'chorlanes', track: st, before, label}); markDirty(); haptic('tick'); g6peHear(); UI.dirty.grid = UI.dirty.song = true;
  if (G6.sheet) g6SheetPaint(); return true;
}
// Klang sofort (20-ms-Rampen über g6Apply), ohne neu zu rechnen
function g6peHear() { if (!AU.ctx) return; const st = stimmeT(); for (const x of g6peStellen(st)) try { g6Apply(x.a, st); } catch (e) { logErr(e); } }

/* ---------- Platzhalter (G6+d): Stil auf eine Stelle ---------- */
// Noten einer Regel aus den Lead-Noten (Stufen d / Oktaven o, iv = Halbtöne zum Rechnen)
function g6peNotes(r, a, notes, rule) {
  const key = g2KeyAt(r), sp = spb(), R = g6peRole(rule), sc = g6Scale(key);
  const stepsBetween = (p, q) => { if (q === p) return 0; const sg = Math.sign(q - p); let d = 0, z = p; while (z !== q && Math.abs(d) < 30) { z += sg; if (sc.includes(((z % 12) + 12) % 12)) d += sg; } return d; };
  return notes.map(n => {
    const p = Math.round(n.m), beat = (n.t0 - a.in) / sp + (a.at || 0), tri = g6Chord(p, key, g6HeardPcs(r, beat)); let q = p, d = 0, o = 0;
    if (R.k === 'st') { q = g6Step(p, R.n, key) + 12 * R.o; d = R.n; o = R.o; }
    else if (R.k === 'oct') { q = p + 12 * R.n; o = R.n; }
    else if (R.k === 'ch') { q = p; for (let k = 0; k < Math.abs(R.n); k++) q = R.n > 0 ? g6Above(q, tri) : g6Below(q, tri); d = stepsBetween(p, q); }
    else if (R.k === 'root') { const b = g6Below(p, tri); q = b - 1; while ((((q % 12) + 12) % 12) !== tri[0] || q > b - 3) q--; d = stepsBetween(p, q); }
    const e = {t0: n.t0, t1: n.t1, m: n.m, d: clamp(d, -21, 21), iv: clamp(q - p, -36, 36)}; if (o) e.o = o; return e;
  });
}
async function g6peLeadNotes(r) {
  const x = tkRef(r); if (!x) return null; const a = x.a, b = g6Lead(a); if (!b) { tkLoad(a.take); toast('Take wird geladen …'); return null; }
  const A = await g2Call({op: 'an', key: 'h:' + a.take + '@' + wpBid(b), x: b.getChannelData(0), sr: b.sampleRate});
  return (A.notes || []).filter(n => n.t1 > a.in && n.t0 < a.out);
}
if (typeof g6pApplyStyle !== 'function') window.g6pApplyStyle = async (r, key) => {
  const ST = g6peStyles()[key], x = tkRef(r); if (!ST || !x) return false;
  const notes = await g6peLeadNotes(r); if (!notes) return false; if (!notes.length) { toast('Keine Töne erkannt'); return false; }
  const st = g6pTrackOf(r), cur = x.a.chor && x.a.chor.v === 2 ? x.a.chor : null, keep = cur ? cur.voices.filter(v => v.take) : [];
  if (keep.length + ST.voices.length > G6PE_MAXV) { toast('Höchstens 6 Stimmen – eine Stimme löschen'); return false; }
  const ok = g6peEdit(r, 'Chor · ' + ST.label, au => {
    const used = new Set(keep.map(v => v.lane)), voices = keep.slice();
    for (const sv of ST.voices) {
      const l = g6peLaneFor(st, sv.rule, sv.name, used); if (!l) { toast('Höchstens 8 Chor-Spuren – eine Spur löschen'); return false; }
      used.add(l.id); voices.push({lane: l.id, rule: sv.rule, n: g6peNotes(r, au, notes, sv.rule), db: sv.db, pan: sv.pan, w: sv.w, dbl: deep(sv.dbl), name: l.name});
    }
    au.chor = {v: 2, style: key, grp: deep(ST.grp), voices, rec: 'terz', dir: 'up', mix: '80'};   // §1.1 Nr. 5: die Gruppe bekommt die Werte des Stils
  }, {lanes: true});
  if (ok) { const c = tkRef(r).a.chor; toast(ST.label + ': ' + c.voices.length + (c.voices.length === 1 ? ' Stimme' : ' Stimmen') + ' · ' + String(c.grp.below).replace('.', ',') + ' dB unter dem Lead'); }
  return ok;
};
// [Auf Chor-Gruppe umstellen]: v1 → v2 mit denselben Noten (ein Undo, der Klang ändert sich)
if (typeof g6pConvert !== 'function') window.g6pConvert = r => {
  const x = tkRef(r), c = x && x.a.chor; if (!c || c.v === 2) return false;
  const up = c.dir !== 'down', RU = {terz: [up ? 'st+2' : 'st-2'], sexte: [up ? 'st+5' : 'st-5'], quinte: [up ? 'st+4' : 'st-4'], oktave: [up ? 'oct+1' : 'oct-1'], drei: ['ch+1', 'ch+2'],
    falsett: ['oct+1', 'st+2/o+1'], barber: ['ch+1', 'ch-1', 'root-'], unisono: ['uni']}[c.rec] || ['uni'];
  const st = g6pTrackOf(r), G = g6peStyles()[c.mix === 'pop' ? 'pop' : '80'];
  const ok = g6peEdit(r, 'Chor · auf Chor-Gruppe umgestellt', au => {
    const used = new Set(), voices = [];
    for (const [k, v] of au.chor.voices.entries()) {
      const rule = RU[k] || 'uni', l = g6peLaneFor(st, rule, null, used); if (!l) return false; used.add(l.id);
      const o = {lane: l.id, rule, n: v.n.map(n => ({t0: n.t0, t1: n.t1, m: n.m, d: g6peStepsOf(n.iv), iv: n.iv})), db: v.db || 0, pan: v.pan || 0, w: .15, dbl: G6_COPY.map(q => ({ms: q.ms, ct: q.ct, p: q.pan < 0 ? -1 : 1})), name: l.name};
      if (v.take) o.take = v.take; voices.push(o);
    }
    au.chor = {v: 2, style: null, grp: deep(G.grp), voices, rec: au.chor.rec, dir: au.chor.dir, mix: '80'};
  }, {lanes: true});
  if (ok) toast('Neue Chor-Fassung – klingt anders');
  return ok;
};
// Platzhalter (G6+f): Entkoppeln
if (typeof g6pDecouple !== 'function') window.g6pDecouple = (r, k) => { toast('Entkoppeln kommt mit G6+f'); return false; };

/* ---------- Klang-Platzhalter (G6+c): Stumm/Solo/Spur, Chor an/aus, Kopplung, Gruppen-Abstand auf dem 4.25-Klangweg ---------- */
// Lead-Pegel der STIMME-Spur in dB (Spur-Regler)
const g6peLeadDb = st => { const t = S.tracks[st], f = t && t.sound && t.sound.fx; return f && isNum(f.vol) ? 20 * Math.log10(Math.max(1e-6, f.vol * f.vol)) : 0; };
// Faktor einer Stimme v2: Spur stumm, Chor aus → 0; Kopplung AUS → Lead-Regler-Änderung seit dem Trennen wird ausgeglichen
function g6pVoiceMul(a, v) {
  const c = a && a.chor; if (!c || c.v !== 2) return 1;
  const st = stimmeT(), tc = st >= 0 && S.tracks[st].chor; if (!tc) return 1;
  if (tc.mute) return 0;
  const l = tc.lanes.find(z => z.id === v.lane); if (l && l.mute) return 0;
  if (tc.cpl && tc.cpl.off) return Math.pow(10, (tc.cpl.ref - g6peLeadDb(st)) / 20);
  return 1;
}

/* ---------- Kopplung (Nachtrag 01.11.): [Gekoppelt] AN/AUS ---------- */
function g6peCouple(st, on) {
  return g6peLaneEdit(st, on ? 'Chor gekoppelt' : 'Chor entkoppelt vom Lead-Regler', tr => {
    const c = tr.chor || (tr.chor = {lanes: []}), was = !(c.cpl && c.cpl.off);
    if (on === was) return false;
    if (!on) { c.cpl = {off: true, ref: +g6peLeadDb(st).toFixed(2)}; return; }
    // wieder AN: der jetzige Abstand bleibt – der Ausgleich geht in den Gruppen-Abstand jeder Stelle (eigener Undo-Teil unten)
    const dd = g6peLeadDb(st) - c.cpl.ref; delete c.cpl;
    if (Math.abs(dd) > 1e-3) G6PE.recouple = dd;
  });
}

/* ---------- Blatt ---------- */
function g6peCur() { const r = G6.sheet, x = r && tkRef(r); return x ? {r, x, a: x.a, c: x.a.chor, st: g6pTrackOf(r)} : null; }
const g6peFmtDb = v => (v > 0 ? '+' : v < 0 ? '−' : '') + String(Math.abs(Math.round(v * 10) / 10)).replace('.', ',') + ' dB';
const g6peFmtPan = v => Math.abs(v) < .03 ? 'Mitte' : (v < 0 ? 'L ' : 'R ') + Math.round(Math.abs(v) * 100);
function g6peSlider(id, min, max, step, val, txt, cls) {
  return `<label class="g6pe-sl ${cls || ''}"><span class="g6pe-sll">${id.lab}</span><input type="range" class="pan-x" min="${min}" max="${max}" step="${step}" value="${val}" data-sl="${id.k}"${id.i != null ? ` data-i="${id.i}"` : ''} aria-label="${esc(id.aria || id.lab)}"><output>${esc(txt)}</output></label>`;
}
function g6pePaint(p, X) {
  if (G6PE.hold) { G6PE.pend = true; return; }
  const {r, a, c, st} = X, tc = S.tracks[st] && S.tracks[st].chor, lanes = tc ? tc.lanes : [], busy = G6PE.busy && G6PE.busy.k;
  const tiles = G6PE_TILES.map(([k, n, z]) => `<button class="mbtn g6pe-tile${busy === k ? ' busy' : ''}" data-sty="${k}"${c && c.style === k ? ' aria-pressed="true"' : ''}${busy ? ' disabled' : ''}><b>${esc(n)}</b><small>${esc(z)}</small></button>`).join('');
  let h = `<h4>Chor · STIMME · ${esc(X.x.label)}</h4><div class="g6pe-grid" role="group" aria-label="Stil">${tiles}</div>`;
  if (!c) {
    h += `<div class="small g6pe-hint">Ein Tipp auf einen Stil setzt den ganzen Chor: Stimmen, Doppel, Panorama, Abstand zum Lead, Hall, Echo und Klang. Danach hat jede Stimme ihre eigene Spur.</div>` +
      `<div class="savrow"><button class="mbtn rb" data-pe="x">OK</button></div>`;
    p.innerHTML = h; return;
  }
  const g = c.grp, on = !(tc && tc.mute), cpl = !(tc && tc.cpl && tc.cpl.off), rd = g6Ready(a);
  h += `<div class="g6pe-grp"><div class="g6pe-gtop"><button class="mbtn rb" data-pe="chor"${on ? ' aria-pressed="true"' : ''}>Chor ${on ? 'an' : 'aus'}</button>` +
    `<button class="mbtn rb" data-pe="cpl"${cpl ? ' aria-pressed="true"' : ''}>Gekoppelt${cpl ? '' : ' aus'}</button>` +
    `<button class="mbtn rb" data-pe="kl"${G6PE.kl ? ' aria-pressed="true"' : ''}>Klang ${G6PE.kl ? '▾' : '▸'}</button><button class="mbtn rb" data-pe="all">Auf alle Stellen</button></div>` +
    g6peSlider({k: 'below', lab: 'Chor', aria: 'Chor: Abstand zum Lead'}, 2, 20, .5, 22 - g.below, '−' + String(g.below).replace('.', ',') + ' dB', 'wide') +
    g6peSlider({k: 'rev', lab: 'Hall'}, 0, 100, 1, Math.round(g.rev * 100), Math.round(g.rev * 100) + ' %') +
    g6peSlider({k: 'dly', lab: 'Echo'}, 0, 100, 1, Math.round(g.dly * 100), Math.round(g.dly * 100) + ' %') + '</div>';
  if (G6PE.kl) {
    const ST = c.style && g6peStyles()[c.style], ech = ST && ST.echo && g.dly > 0 ? ST.echo : null, now = S.fxBus && S.fxBus.echo ? S.fxBus.echo.divL : null;
    h += `<div class="g6pe-kl">` + g6peSlider({k: 'hp', lab: 'Tief'}, 20, 600, 5, g.hp, Math.round(g.hp) + ' Hz') + g6peSlider({k: 'mid', lab: 'Mitte'}, -12, 12, .5, g.mid, g6peFmtDb(g.mid)) +
      g6peSlider({k: 'air', lab: 'Luft'}, -12, 12, .5, g.air, g6peFmtDb(g.air)) +
      `<div class="g6pe-seg"><span>Zischlaute</span>` + G6PE_SIB.map(([v, l]) => `<button class="mbtn rb" data-sib="${v}"${(g.sib === v || (v === -12 && (g.sib === -6 || g.sib === -18) && false)) ? ' aria-pressed="true"' : ''}>${l}</button>`).join('') + '</div>' +
      `<div class="g6pe-seg"><span>Hall vor</span>` + G6PE_PRE.map(([v, l]) => `<button class="mbtn rb" data-pre="${v}"${g.pre === v ? ' aria-pressed="true"' : ''}>${l}</button>`).join('') + '</div>' +
      (ech ? `<div class="g6pe-echo"><span>Echo-Zeit des Songs: ${esc(now || '–')}</span>${now === ech ? '' : `<button class="mbtn rb" data-pe="echo" data-v="${esc(ech)}">Stil-Wert ${esc(ech)} übernehmen</button>`}</div>` : '') + '</div>';
  }
  // Spur-Zeilen: Spuren dieser Stelle, dann graue (nicht benutzte) Spuren
  const rows = [], byLane = new Map(c.voices.map((v, k) => [v.lane, k]));
  for (const l of lanes) {
    const k = byLane.has(l.id) ? byLane.get(l.id) : -1, v = k >= 0 ? c.voices[k] : null, cl = g6peLaneCls(l, v), used = v || g6peLaneUsed(st, l.id);
    const open = G6PE.dot === l.id, ren = G6PE.ren === l.id;
    let row = `<div class="g6pe-lane${v ? '' : ' grey'}${l.mute ? ' muted' : ''}" data-lane="${l.id}"><div class="g6pe-l1"><span class="g6pe-chip" style="--cc:var(--chor${cl.c})">${esc(cl.z)}</span>` +
      (ren ? `<input class="g6pe-ren" maxlength="24" value="${esc(l.name)}" data-ren="${l.id}" aria-label="Name der Spur">` : `<button class="mbtn g6pe-name" data-pe="ren" data-l="${l.id}"><b>${esc(l.name)}</b>${v ? (v.take ? '<small>eigene Aufnahme</small>' : '') : `<small>${used ? 'nicht an dieser Stelle' : 'nicht benutzt'}</small>`}</button>`);
    if (v) row += `<button class="mbtn rb g6pe-sq" data-solo="${k}"${G6.solo === k ? ' aria-pressed="true"' : ''} aria-label="Solo">S</button><button class="mbtn rb g6pe-sq" data-pe="mute" data-l="${l.id}"${l.mute ? ' aria-pressed="true"' : ''} aria-label="Stumm">M</button>` +
      `<button class="mbtn rb g6pe-sq" data-notes="${k}" aria-label="Noten">♪</button>`;
    row += `<button class="mbtn rb g6pe-sq" data-pe="dot" data-l="${l.id}"${open ? ' aria-pressed="true"' : ''} aria-label="Mehr">⋯</button></div>`;
    if (v) row += `<div class="g6pe-l2">` + g6peSlider({k: 'db', i: k, lab: 'Pegel'}, -24, 6, .5, v.db, g6peFmtDb(v.db)) + g6peSlider({k: 'pan', i: k, lab: 'Pan'}, -100, 100, 1, Math.round(v.pan * 100), g6peFmtPan(v.pan)) + '</div>';
    if (open) {
      if (v) {
        const nd = v.dblOff ? 0 : v.dbl.length, d0 = v.dbl[0] || {ms: 0, ct: 0};
        row += `<div class="g6pe-dot"><div class="g6pe-seg"><span>Doppel</span>` + [1, 2, 3, 4].map(n => `<button class="mbtn rb" data-dbl="${n}" data-i="${k}"${nd === n ? ' aria-pressed="true"' : ''}>${n}</button>`).join('') + '</div>' +
          g6peSlider({k: 'ms', i: k, lab: 'Versatz'}, 0, 60, 1, Math.round(Math.abs(v.dbl[v.dbl.length - 1].ms - (v.dbl.length > 1 ? 0 : 0))), Math.round(v.dbl[v.dbl.length - 1].ms) + ' ms') +
          g6peSlider({k: 'ct', i: k, lab: 'Cent', aria: 'Verstimmung'}, 0, 30, 1, Math.round(Math.max(...v.dbl.map(q => Math.abs(q.ct)))), Math.round(Math.max(...v.dbl.map(q => Math.abs(q.ct)))) + ' ct') +
          g6peSlider({k: 'w', i: k, lab: 'Breite'}, 0, 100, 1, Math.round(v.w * 100), Math.round(v.w * 100) + ' %') +
          `<div class="g6pe-acts"><button class="mbtn rb" data-self="${k}">Selbst singen</button><button class="mbtn rb" data-pe="dec" data-i="${k}"${v.take ? ' disabled' : ''}>Entkoppeln</button><button class="mbtn rb" data-pe="vdel" data-i="${k}">Stimme löschen</button></div></div>`;
      } else row += `<div class="g6pe-dot"><div class="g6pe-acts">${used ? '<span class="small">Spur wird an einer anderen Stelle benutzt</span>' : `<button class="mbtn rb" data-pe="ldel" data-l="${l.id}">Spur löschen</button>`}</div></div>`;
    }
    rows.push(row + '</div>');
  }
  const roles = new Set(c.voices.map(v => v.rule));
  h += `<div class="g6pe-lanes pan-y">${rows.join('')}</div>`;
  h += `<div class="g6pe-addrow"><button class="mbtn rb" data-pe="add"${G6PE.add ? ' aria-pressed="true"' : ''}${c.voices.length >= G6PE_MAXV ? ' disabled' : ''}>+ Stimme ${G6PE.add ? '▴' : '▾'}</button><button class="mbtn rb" data-pe="del">Chor löschen</button><button class="mbtn rb" data-pe="x">OK</button></div>`;
  if (G6PE.add) h += `<div class="g6pe-add pan-y">` + G6PE_ADD.map(([k, l]) => `<button class="mbtn rb" data-addr="${k}"${roles.has(k) ? ' disabled' : ''}>${esc(l)}</button>`).join('') + '</div>';
  h += `<div class="small g6pe-st">${rd ? c.voices.length + (c.voices.length === 1 ? ' Stimme' : ' Stimmen') + ' · Chor ' + String(g.below).replace('.', ',') + ' dB unter dem Lead' + (cpl ? ' · folgt dem Lead-Regler' : ' · vom Lead-Regler getrennt') : 'Stimmen werden gerechnet …'}</div>`;
  const sc = p.querySelector('.g6pe-lanes'), top = sc ? sc.scrollTop : 0;
  p.innerHTML = h;
  const sc2 = p.querySelector('.g6pe-lanes'); if (sc2) sc2.scrollTop = top;
  const ri = p.querySelector('.g6pe-ren'); if (ri) { ri.focus(); ri.select(); }
}
// v1-Ansicht: alter Aufbau + Kopfzeile „Chor (Fassung 4.25)“ mit [Auf Chor-Gruppe umstellen]
function g6peV1Head(p) {
  const d = document.createElement('div'); d.className = 'g6pe-v1';
  d.innerHTML = `<span>Chor (Fassung 4.25)</span><button class="mbtn rb" data-pe="conv">Auf Chor-Gruppe umstellen</button>`;
  const h4 = p.querySelector('h4'); if (h4) h4.after(d); else p.prepend(d);
  const grid = document.createElement('div'); grid.className = 'g6pe-grid';
  grid.innerHTML = G6PE_TILES.map(([k, n, z]) => `<button class="mbtn g6pe-tile" data-sty="${k}"><b>${esc(n)}</b><small>${esc(z)}</small></button>`).join('');
  const rec = p.querySelector('.g6rec'); if (rec) { rec.before(grid); }
}
// Tipp im Blatt (true = erledigt)
function g6peTap(b) {
  const X = g6peCur(); if (!X) return false; const d = b.dataset, {r, st} = X;
  if (d.sty) {
    if (G6PE.busy) return true;
    G6PE.busy = {k: d.sty}; G6PE.add = false; G6PE.dot = null; g6SheetPaint();
    Promise.resolve(g6pApplyStyle(r, d.sty)).catch(logErr).then(() => { G6PE.busy = null; g6SheetPaint(); });
    return true;
  }
  if (d.addr) { g6peAddVoice(r, d.addr); return true; }
  if (d.sib != null) { g6peGrpSet(r, {sib: +d.sib}, 'Chor · Zischlaute'); return true; }
  if (d.pre != null) { g6peGrpSet(r, {pre: d.pre}, 'Chor · Hall-Vorverzögerung'); return true; }
  if (d.dbl) { g6peDblCount(r, +d.i, +d.dbl); return true; }
  if (d.pe === 'conv') { g6pConvert(r); g6SheetPaint(); return true; }
  if (!X.c || X.c.v !== 2) return false;
  switch (d.pe) {
    case 'chor': g6peLaneEdit(st, 'Chor an/aus', tr => { const c = tr.chor || (tr.chor = {lanes: []}); if (c.mute) delete c.mute; else c.mute = true; }); return true;
    case 'cpl': g6peCoupleTap(r, st); return true;
    case 'kl': G6PE.kl = !G6PE.kl; g6SheetPaint(); return true;
    case 'all': g6peAll(r); return true;
    case 'echo': g6peEcho(d.v); return true;
    case 'mute': g6peLaneEdit(st, 'Chor-Spur stumm', tr => { const l = tr.chor && tr.chor.lanes.find(z => z.id === d.l); if (!l) return false; if (l.mute) delete l.mute; else l.mute = true; }); return true;
    case 'ren': G6PE.ren = d.l; g6SheetPaint(); return true;
    case 'dot': G6PE.dot = G6PE.dot === d.l ? null : d.l; g6SheetPaint(); return true;
    case 'add': G6PE.add = !G6PE.add; g6SheetPaint(); return true;
    case 'dec': g6pDecouple(r, +d.i); return true;
    case 'vdel': g6peEdit(r, 'Chor-Stimme gelöscht', au => { au.chor.voices.splice(+d.i, 1); if (!au.chor.voices.length) delete au.chor; }); G6PE.dot = null; if (G6.solo != null) g6Solo(G6.solo); g6SheetPaint(); return true;
    case 'ldel': g6peLaneEdit(st, 'Chor-Spur gelöscht', tr => { const L = tr.chor && tr.chor.lanes, k = L ? L.findIndex(z => z.id === d.l) : -1; if (k < 0 || g6peLaneUsed(st, d.l)) return false; L.splice(k, 1); }); G6PE.dot = null; g6SheetPaint(); return true;
    case 'del': g6Del(r); G6PE.dot = null; G6PE.add = false; g6SheetPaint(); return true;
    case 'x': closePop(); return true;
  }
  return false;
}
function g6peCoupleTap(r, st) {
  const tc = S.tracks[st].chor, on = !!(tc && tc.cpl && tc.cpl.off);
  if (!on) { g6peCouple(st, false); toast('Chor folgt dem Lead-Regler nicht mehr'); return; }
  // wieder AN: Spur-Daten + Abstand aller Stellen in einem Undo (der jetzige Abstand bleibt)
  const lb = g6peLaneSnap(st), dd = g6peLeadDb(st) - tc.cpl.ref, items = [];
  if (Math.abs(dd) > .05) for (const x of g6peStellen(st)) if (x.a.chor.v === 2) {
    if (x.r.vox) { if (!items.some(i => i.kind === 'song')) items.push({kind: 'song', before: songSnapshot()}); } else items.push({kind: 'clip', track: x.r.t, scene: x.r.s, before: cleanClip(S.tracks[x.r.t].clips[x.r.s])});
    x.a.chor.grp.below = +clamp(x.a.chor.grp.below + dd, 2, 20).toFixed(1);
  }
  delete tc.cpl; const n = g6pNormLanes(tc); if (n) S.tracks[st].chor = n; else delete S.tracks[st].chor;
  items.push({kind: 'chorlanes', track: st, before: lb});
  undoPush({kind: 'group', label: 'Chor gekoppelt', items}); markDirty(); haptic('tick'); UI.dirty.all = true; if (items.some(i => i.kind === 'song')) songChanged(); g6Refresh(); g6peHear();
  toast('Chor folgt wieder dem Lead-Regler · Abstand bleibt');
}
function g6peGrpSet(r, o, label) { g6peEdit(r, label, au => { if (!au.chor || au.chor.v !== 2) return false; Object.assign(au.chor.grp, o); for (const v of au.chor.voices) { v.rev = au.chor.grp.rev; v.dly = au.chor.grp.dly; } }); g6SheetPaint(); }
function g6peDblCount(r, k, n) {
  g6peEdit(r, 'Chor · Doppel', au => {
    const v = au.chor && au.chor.voices[k]; if (!v) return false; delete v.dblOff;
    const ms = Math.max(8, ...v.dbl.map(q => q.ms)), ct = Math.max(4, ...v.dbl.map(q => Math.abs(q.ct)));
    v.dbl = Array.from({length: n}, (_, j) => n === 1 ? {ms: v.dbl[0] ? v.dbl[0].ms : 0, ct: v.dbl[0] ? v.dbl[0].ct : 0, p: 0} : {ms: Math.round(ms * (j + 1) / n), ct: Math.round(ct * (j % 2 ? 1 : -1) * (1 - .25 * Math.floor(j / 2))), p: j % 2 ? 1 : -1});
  });
  g6SheetPaint();
}
function g6peAddVoice(r, rule) {
  const X = g6peCur(); if (!X || !X.c || X.c.v !== 2) return;
  if (X.c.voices.length >= G6PE_MAXV) { toast('Höchstens 6 Stimmen – eine Stimme löschen'); return; }
  g6peLeadNotes(r).then(notes => {
    if (!notes || !notes.length) return;
    const st = X.st, used = new Set(X.c.voices.map(v => v.lane));
    const ok = g6peEdit(r, 'Chor · Stimme dazu', au => { const l = g6peLaneFor(st, rule, null, used); if (!l) { toast('Höchstens 8 Chor-Spuren – eine Spur löschen'); return false; }
      au.chor.voices.push({lane: l.id, rule, n: g6peNotes(r, au, notes, rule), db: -2, pan: 0, w: .5, dbl: [{ms: 12, ct: -6, p: -1}, {ms: 24, ct: 8, p: 1}], name: l.name}); }, {lanes: true});
    if (ok) G6PE.add = false; g6SheetPaint();
  });
}
// [Auf alle Stellen]: Gruppe dieser Stelle auf alle v2-Stellen der Spur (ein Gruppen-Undo)
function g6peAll(r) {
  const X = g6peCur(); if (!X || !X.c || X.c.v !== 2) return; const g = JSON.stringify(X.c.grp), items = [];
  let n = 0, songB = null;
  for (const x of g6peStellen(X.st)) { if (x.a.chor.v !== 2 || JSON.stringify(x.a.chor.grp) === g) continue;
    if (x.r.vox) { if (!songB) { songB = songSnapshot(); items.push({kind: 'song', before: songB}); } } else items.push({kind: 'clip', track: x.r.t, scene: x.r.s, before: cleanClip(S.tracks[x.r.t].clips[x.r.s])});
    x.a.chor.grp = JSON.parse(g); for (const v of x.a.chor.voices) { v.rev = x.a.chor.grp.rev; v.dly = x.a.chor.grp.dly; } n++; }
  if (!n) { toast('Alle Chor-Stellen haben schon diese Gruppe'); return; }
  undoPush({kind: 'group', label: 'Chor · auf alle Stellen', items}); markDirty(); UI.dirty.all = true; if (songB) songChanged(); for (const i of items) if (i.kind === 'clip') clipChanged(i.track, i.scene); g6Refresh();
  toast('Gruppe auf ' + n + (n === 1 ? ' weitere Stelle' : ' weitere Stellen') + ' übertragen');
}
// Echo-Zeit des Songs auf den Stil-Wert (ein Schritt `fx`, gilt für alle Spuren)
function g6peEcho(v) {
  if (!S.fxBus || !S.fxBus.echo) return; const before = fxSnapshot(); S.fxBus.echo.divL = v; if (S.fxBus.echo.divR != null && S.fxBus.echo.mode !== 'st') S.fxBus.echo.divR = v;
  try { applyEcho(); } catch (e) { logErr(e); } undoPush({kind: 'fx', before, label: 'Echo-Zeit ' + v}); markDirty(); toast('Echo-Zeit ' + v + ' · gilt für alle Spuren'); g6SheetPaint();
}
// Regler: während des Ziehens live (Daten + Knoten), beim Loslassen ein Undo-Schritt; Doppeltipp = Wert des Stils
function g6peSlVal(el) { const k = el.dataset.sl, v = +el.value; return k === 'below' ? 22 - v : k === 'rev' || k === 'dly' || k === 'w' ? v / 100 : k === 'pan' ? v / 100 : v; }
function g6peSlPut(c, k, i, v) {
  if (['below', 'rev', 'dly', 'hp', 'mid', 'air'].includes(k)) { c.grp[k] = +(+v).toFixed(2); if (k === 'rev' || k === 'dly') for (const z of c.voices) z[k] = c.grp[k]; return; }
  const z = c.voices[i]; if (!z) return;
  if (k === 'db' || k === 'pan' || k === 'w') { z[k] = +(+v).toFixed(2); return; }
  if (k === 'ms') { const mx = Math.max(1, ...z.dbl.map(q => q.ms)); z.dbl.forEach(q => { q.ms = Math.round(z.dbl.length === 1 ? v : q.ms / mx * v); }); return; }
  if (k === 'ct') { const mx = Math.max(1, ...z.dbl.map(q => Math.abs(q.ct))); z.dbl.forEach(q => { q.ct = Math.round(z.dbl.length === 1 ? Math.sign(q.ct || -1) * v : q.ct / mx * v); }); }
}
const g6peSlTxt = (k, v) => k === 'below' ? '−' + String(v).replace('.', ',') + ' dB' : k === 'rev' || k === 'dly' || k === 'w' ? Math.round(v * 100) + ' %' : k === 'pan' ? g6peFmtPan(v) :
  k === 'hp' ? Math.round(v) + ' Hz' : k === 'ms' ? Math.round(v) + ' ms' : k === 'ct' ? Math.round(v) + ' ct' : g6peFmtDb(v);
const G6PE_LBL = {below: 'Chor-Abstand', rev: 'Chor-Hall', dly: 'Chor-Echo', hp: 'Chor-Tiefschnitt', mid: 'Chor-Mitte', air: 'Chor-Luft', db: 'Chor-Pegel', pan: 'Chor-Pan', ms: 'Chor-Versatz', ct: 'Chor-Verstimmung', w: 'Chor-Breite'};
function g6peStyleVal(c, k, i) {
  const ST = c.style && g6peStyles()[c.style]; if (!ST) return null;
  if (k in ST.grp) return ST.grp[k];
  const v = c.voices[i], sv = v && ST.voices.find(q => q.rule === v.rule); if (!sv) return null;
  return k === 'db' || k === 'pan' || k === 'w' ? sv[k] : null;
}
function g6peSlBind(p) {
  // während ein Regler gehalten wird, kein Neuaufbau des Blatts (fertig gerechnete Stimmen o. ä.) – danach einmal nachholen
  const hold = e => { if (e.target && e.target.dataset && e.target.dataset.sl) G6PE.hold = true; };
  const free = () => { if (!G6PE.hold) return; G6PE.hold = false; if (G6PE.pend) { G6PE.pend = false; setTimeout(() => g6SheetPaint(), 0); } };
  // Geister-Tipp: nach einem Tipp, der das Blatt umbaut, landen die nachgeschobenen Maus-Ereignisse auf dem Regler darunter – ignorieren
  const ghost = () => !G6PE.hold && UI.ghost && performance.now() - UI.ghost.t < 600;
  p.addEventListener('mousedown', e => { if (e.target && e.target.dataset && e.target.dataset.sl && ghost()) { e.preventDefault(); e.stopPropagation(); } }, true);
  p.addEventListener('pointerdown', hold, true); p.addEventListener('pointerup', free); p.addEventListener('pointercancel', free); p.addEventListener('lostpointercapture', free);
  p.addEventListener('input', e => {
    const el = e.target; if (!el.dataset || !el.dataset.sl) return; const X = g6peCur(); if (!X || !X.c || X.c.v !== 2) return;
    if (!G6PE.hold && UI.ghost && performance.now() - UI.ghost.t < 600 && !(G6PE.live && G6PE.live.el === el)) { G6PE.pend = false; setTimeout(() => g6SheetPaint(), 0); return; }   // Geister-Tipp: Wert bleibt
    if (!G6PE.live || G6PE.live.el !== el) G6PE.live = {el, before: X.r.vox ? songSnapshot() : cleanClip(X.x.clip)};
    const v = g6peSlVal(el), i = +el.dataset.i; g6peSlPut(X.c, el.dataset.sl, i, v);
    const o = el.parentNode.querySelector('output'); if (o) o.textContent = g6peSlTxt(el.dataset.sl, v);
    g6peHear();
  });
  p.addEventListener('change', e => {
    const el = e.target; if (!el.dataset || !el.dataset.sl || !G6PE.live || G6PE.live.el !== el) return; const L = G6PE.live; G6PE.live = null;
    const X = g6peCur(); if (!X) return; const k = el.dataset.sl;
    if (g6peEdit(X.r, G6PE_LBL[k] || 'Chor', () => {}, {before: L.before})) UNDO[UNDO.length - 1].g6pe = k + ':' + (el.dataset.i || '');
    if (k === 'below') toast('Chor ' + String(X.c.grp.below).replace('.', ',') + ' dB unter dem Lead');
  });
  // Doppeltipp auf einen Regler = Wert des Stils (ein Schritt)
  p.addEventListener('pointerup', e => {
    const el = e.target; if (!el.dataset || !el.dataset.sl) return; const t = performance.now(), T = G6PE.tap, id = el.dataset.sl + ':' + (el.dataset.i || '');
    G6PE.tap = {id, t, x: e.clientX};
    if (!T || T.id !== id || t - T.t > 320 || Math.abs(T.x - e.clientX) > 16) return;
    G6PE.tap = null; const X = g6peCur(); if (!X || !X.c || X.c.v !== 2) return; const k = el.dataset.sl, i = +el.dataset.i, sv = g6peStyleVal(X.c, k, i); if (sv == null) return;
    setTimeout(() => {   // nach den change-Ereignissen der beiden Tipps: deren Schritte zurücknehmen → ein Schritt „= Stil“
      G6PE.live = null; const lim = performance.now() - 900;
      while (UNDO.length && UNDO[UNDO.length - 1].g6pe === id && UNDO[UNDO.length - 1].time > lim) { const u = UNDO.pop(); if (u.kind === 'group') groupSwap(u, true); else undoApply(u, u.before); }
      REDO.length = 0;
      g6peEdit(X.r, (G6PE_LBL[k] || 'Chor') + ' = Stil', au => { g6peSlPut(au.chor, k, i, sv); });
      g6SheetPaint();
    }, 0);
    return;
    g6SheetPaint();
  });
  // Umbenennen: Enter/Verlassen übernimmt (≤ 24 Zeichen), Esc bricht ab
  p.addEventListener('keydown', e => { const el = e.target; if (!el.dataset || !el.dataset.ren) return; if (e.key === 'Enter') { e.preventDefault(); el.blur(); } else if (e.key === 'Escape') { G6PE.ren = null; g6SheetPaint(); } });
  p.addEventListener('focusout', e => {
    const el = e.target; if (!el.dataset || !el.dataset.ren || G6PE.ren !== el.dataset.ren) return; const id = el.dataset.ren, nm = el.value.trim().slice(0, 24); G6PE.ren = null;
    const X = g6peCur(); if (X && nm) g6peLaneEdit(X.st, 'Chor-Spur umbenannt', tr => { const l = tr.chor && tr.chor.lanes.find(z => z.id === id); if (!l || l.name === nm) return false; l.name = nm; for (const x of g6peStellen(X.st)) for (const v of x.a.chor.voices || []) if (v.lane === id) v.name = nm; });
    setTimeout(() => g6SheetPaint(), 0);
  });
}

/* ---------- Test-API (G6+e) ---------- */
if (typeof g6pInfo !== 'function') window.g6pInfo = r => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), st = stimmeT(); return x ? {chor: x.a.chor ? deep(x.a.chor) : null, lanes: st >= 0 && S.tracks[st].chor ? deep(S.tracks[st].chor) : null, ready: g6Ready(x.a), solo: G6.solo} : null; };
const G6PE_API = {
  g6pInfo: r => g6pInfo(r),
  g6pStyle: (r, k) => g6pApplyStyle(r || {t: stimmeT(), s: R.selS}, k),
  g6pConvert: r => g6pConvert(r || {t: stimmeT(), s: R.selS}),
  g6peState: () => ({kl: G6PE.kl, dot: G6PE.dot, add: G6PE.add, busy: G6PE.busy ? G6PE.busy.k : null, ren: G6PE.ren}),
  g6peMul: (r, k) => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), v = x && x.a.chor && x.a.chor.voices[k]; return v ? g6pVoiceMul(x.a, v) : null; },
  g6peLeadDb: () => g6peLeadDb(stimmeT()),
  g6peLeadVol: v => { const st = stimmeT(), f = S.tracks[st].sound.fx; f.vol = clamp(v, 0, 1); applyTrackParams(st); g6peHear(); return f.vol; },
  g6peRoundtrip: () => { importJSON(serializeProject()); return true; },
  g6peUndoLabels: n => UNDO.slice(-(n || 8)).map(u => u.label),
  g6peTiles: () => G6PE_TILES.map(t => ({k: t[0], name: t[1], line: t[2]}))
};
/* G6PE-END */
