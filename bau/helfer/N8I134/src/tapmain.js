/* ===== I4c (Nachtrag 8 B.4 6.1, 6.7, 7.4): the one note source for every caller. vsAnalyse hangs the taps of TIP.ring with a start in
   [ta, tb] at the analysis as A.tips (analysis seconds through A.secOfH); vsNotesOf then takes the notes from tapNotes, in the same
   form as before, and the result sheet shows the count line. Without taps everything is exactly as before (I4-28).
   TIP.ring holds heard context seconds {c0, c1} (I4a's touch surface and I4b's clock bridge fill it; until they are on the line the
   test API tipFeed does). ===== */
const TIP = {ring: [], cut: 0, max: 20000};
function tipFeed(list) {
  for (const t of list || []) { if (!t || !isFinite(t.c0)) continue; TIP.ring.push({c0: +t.c0, c1: t.c1 == null || !isFinite(t.c1) ? null : Math.max(+t.c0 + .005, +t.c1)}); }
  TIP.ring.sort((a, b) => a.c0 - b.c0);
  const ctx = AU.ctx, lo = ctx ? ctx.currentTime - 130 : -Infinity;
  while (TIP.ring.length && (TIP.ring[0].c0 < lo || TIP.ring.length > TIP.max)) { TIP.ring.shift(); TIP.cut++; }
  return TIP.ring.length;
}
function tipAttach(A) {
  if (!A || !TIP.ring.length) return A;
  const L = TIP.ring.filter(t => t.c0 >= A.ta && t.c0 <= A.tb);
  if (L.length) A.tips = L.map(t => ({s0: A.secOfH(t.c0), s1: t.c1 == null ? null : A.secOfH(Math.min(t.c1, A.tb))}));
  return A;
}
// the tap notes of an analysis, in vsNotesOf's form {notes: [{b, d, n, raw, m, v, by}], tuneCt, key} + tip (counts); cached per snap|oct
function tipNotesOf(A, o) {
  const ck = (o.snap !== false) + '|' + (o.oct || 0) + '|' + (o.key ? o.key.root + o.key.scale : '');
  if (A.tipCache && A.tipCache[ck]) return A.tipCache[ck];
  const mid = A.beatOf(A.tr.n * A.tr.hop / A.fs / 2), key = o.key || A.key || vsKeyAt(b2t(Math.max(0, mid)));
  const SC = Harmony.SCALES[key.scale] || Harmony.SCALES.ionian, scale = Array.from({length: 12}, (_, k) => SC.indexOf(k) >= 0);
  const seg = VSD.segment(A.tr, {snap: o.snap !== false, scale, root: key.root, tuning: 'auto', attack: A.inst});
  const tp = VSD.tapNotes(A.tr, A.tips, {snap: o.snap !== false, scale, root: key.root, tuning: 'auto', segNotes: seg.notes, bleed: A.bleed, end: A.tr.n * A.tr.hop / A.fs});
  const notes = tp.notes.map(n => {
    const b0 = A.beatOf(n.t0), b1 = A.beatOf(n.t1), lv = isFinite(n.lv) ? n.lv : -30;
    return {b: b0, d: Math.max(1 / 32, b1 - b0), n: clamp(n.n + 12 * (o.oct || 0), 0, 127), raw: n.raw, m: n.m, v: clamp(Math.round((0.5 + (lv + 26) / 40) * 1000) / 1000, 0.3, 1), by: n.by};
  });
  const tip = {n: notes.length, taps: tp.taps, noTone: tp.noTone, two: tp.two, open: tp.open.length};
  A.tipInfo = tip;
  const r = {notes, tuneCt: tp.tuneCt, key, tip};
  (A.tipCache || (A.tipCache = {}))[ck] = r;
  return r;
}
// the count line of the result sheet (F1 default): „12 Noten · aus 12 Tipps · 2 Tipps ohne Ton – Höhe vom Ton davor · …“
function tipLine(t) {
  if (!t) return '';
  const pl = (n, a, b) => n + ' ' + (n === 1 ? a : b);
  const p = [pl(t.n, 'Note', 'Noten') + ' · aus ' + pl(t.taps, 'Tipp', 'Tipps')];
  if (t.noTone) p.push(pl(t.noTone, 'Tipp', 'Tipps') + ' ohne Ton – Höhe vom Ton davor');
  if (t.two) p.push(pl(t.two, 'Tipp', 'Tipps') + ' mit 2 Tönen');
  if (t.open) p.push(pl(t.open, 'Stelle', 'Stellen') + ' ohne Tipp');
  return p.join(' · ');
}
SYNQUENZER.tip = {
  feed: list => tipFeed(list), clear: () => { TIP.ring.length = 0; TIP.cut = 0; return 0; },
  info: () => ({n: TIP.ring.length, cut: TIP.cut}),
  notes: (tr, taps, o) => VSD.tapNotes(tr, taps, o), line: t => tipLine(t),
};
