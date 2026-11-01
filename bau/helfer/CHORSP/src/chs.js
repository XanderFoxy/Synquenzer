/* CHS-BEGIN */
/* =====================================================================================================================
   CHOR-SPUREN (Paket CHORSP, Basis 4.30.0): Background-Gruppe als echte Spuren, steuerbarer Gesangs-Editor, Auge der Legende.
   1. Background-Gruppe in Clip-Matrix und Song: unter der STIMME-Spur eine aufklappbare Zeile „Background“ und je Chor-Spur
      (S.tracks[st].chor.lanes, G6+a) eine Unterzeile mit Farbfeld/Ziffer, Name, Stumm, Zellen je Szene bzw. Song-Stück
      (Tipp = Noten der Stimme). Mischpult (Blatt „Background“): Lead, Background (ganzer Chor), Gesang gesamt (Lead + Chor),
      [Gekoppelt], je Spur S/M/Pegel/Pan/♪, [Spur teilen].
      Daten nur additiv an S.tracks[st].chor (Felder fehlen = Klang bitgleich, Regel 28):
        chor.db  (dB, Background-Regler)      chor.sum (dB, Gesang gesamt: Lead-Kette und Chor)
        chor.cpl = false + chor.ref (dB des Lead-Reglers beim Trennen)    lanes[k].db (dB) · lanes[k].pan (−1…1, zum Pan der Stelle)
      Gekoppelt (Standard): der Chor folgt dem Lead-Regler im gleichen dB-Schritt (G6+c). Getrennt: der Lead-Anteil steht auf ref.
      Wieder koppeln: chor.db += ref − Lead jetzt → kein Sprung. Ein Undo-Schritt je Geste (Element 'chorlanes' bzw. 'sound').
   2. Gesangs-Editor (Noten G2 und Marken WP der STIMME): Lineal unten (Tipp = ab dort spielen mit Begleitung und Chor, Ziehen =
      Loop, Doppeltipp = Zoom), [▶/■] und [Loop], Laufstrich; zwei Finger = Zoom, Doppeltipp auf leere Fläche = Zoom, ein Finger =
      schwenken; eine Note verschiebt nur, wer sie vorher gewählt hat (oder ¼ s hält); nach ▲▼/Ziehen kurz vorhören, im Loop live.
   3. Auge der Legende: gemerkt je Clip (auch nach Neuzeichnen), Lead-Chip (graue Lead-Balken ein/aus), Unisono sichtbar als
      gestrichelter Rahmen um den Lead-Block (lag vorher genau unter ihm), Chip der gerade bearbeiteten Stimme ohne Auge.
   Nichts läuft beim App-Start; ohne Chor-Spuren bleiben Matrix und Song pixelgleich.
   ===================================================================================================================== */
const CHS = {hide: new Map(), open: null, nLanes: -1, mx: null, mxSig: '', sv: '', run: null, raf: 0, tap: null, pts: new Map(), pinch: null, aud: null, loopT: 0, log: []};
const CHS_LEAD = '_lead';
const CHS_RH = 26;                       // Lineal-Band unten im Editor (Trefferfläche 44 px)
const CHS_SVG = {
  play: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
  stop: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="5.5" y="5.5" width="13" height="13" rx="1.5" fill="currentColor"/></svg>',
  loop: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 10a5 5 0 0 1 5-5h7l-2.5-2.5M19 14a5 5 0 0 1-5 5H7l2.5 2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mix: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 3v18M12 3v18M18 3v18" stroke="currentColor" stroke-width="1.6" opacity=".55"/><rect x="3.5" y="13" width="5" height="3.4" rx="1" fill="currentColor"/><rect x="9.5" y="6" width="5" height="3.4" rx="1" fill="currentColor"/><rect x="15.5" y="10" width="5" height="3.4" rx="1" fill="currentColor"/></svg>',
  tri: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3.5 2l5 4-5 4z" fill="currentColor"/></svg>'
};
const chsDb = g => 20 * Math.log10(Math.max(1e-6, g));
const chsK = db => (db ? Math.pow(10, db / 20) : 1);
const chsTrk = () => { const st = stimmeT(), t = st >= 0 ? S.tracks[st] : null; return t && t.chor && typeof t.chor === 'object' ? t.chor : null; };
const chsLanes = () => { const L = chsTrk(); return L && Array.isArray(L.lanes) ? L.lanes : []; };
const chsLane = id => chsLanes().find(l => l && l.id === id) || null;
const chsFmtDb = v => (v > 0.05 ? '+' : v < -0.05 ? '−' : '±') + fmtDecC(Math.abs(v), 1) + ' dB';
function fmtDecC(v, n) { return (+v).toFixed(n).replace('.', ','); }

/* ---------- 3. Auge der Legende ---------- */
const chsHideKey = r => (r ? (r.vox ? 'v' + r.vox : r.t + ':' + r.s) : '-');
function chsHideOf(r) { const k = chsHideKey(r); let s = CHS.hide.get(k); if (!s) { s = new Set(); CHS.hide.set(k, s); } return s; }
// Unisono (gleiche Stufe wie der Lead) liegt im Lead-Editor genau unter dem Lead-Block: als gestrichelter Rahmen außen herum zeigen
const chsOnLead = (E, n) => E.voice == null && n.c === 'c1';
function chsHalo(q, x0, y, w, h, col, strong) { q.globalAlpha = 1; q.strokeStyle = col; q.lineWidth = strong ? 2.5 : 2; q.setLineDash([4, 3]); q.strokeRect(x0 - 2.5, y - h / 2 - 3.5, w + 5, h + 7); q.setLineDash([]); }
function chsLeadChip(E) {
  if (!E.chsLead) return ''; const off = G6PG.hide.has(CHS_LEAD);
  return `<span class="g6pgc chslead${off ? ' off' : ''}" style="--cc:#969eac"><i class="g6pgsw">L</i><b>Lead</b><button class="rb g6pgeye" data-a="eye" data-id="${CHS_LEAD}" data-k="-1" aria-pressed="${off ? 'false' : 'true'}" aria-label="Lead zeigen">${G6PG_EYE}</button></span>`;
}
function chsTakeK(a, id) { const c = a && a.chor; if (!c || !Array.isArray(c.voices) || id === a.take) return null; const k = c.voices.findIndex(v => v && v.take && v.take.take === id); return k < 0 ? null : k; }

/* ---------- 1. Daten: Normalisieren (additiv) ---------- */
function chsNormLane(l, o) {
  if (isNum(l.db) && Math.abs(l.db) > 1e-9) o.db = +clamp(l.db, -60, 12).toFixed(2);
  if (isNum(l.pan) && Math.abs(l.pan) > 1e-9) o.pan = +clamp(l.pan, -1, 1).toFixed(3);
}
function chsNormGrp(ch, o) {
  if (isNum(ch.db) && Math.abs(ch.db) > 1e-9) o.db = +clamp(ch.db, -60, 12).toFixed(2);
  if (isNum(ch.sum) && Math.abs(ch.sum) > 1e-9) o.sum = +clamp(ch.sum, -60, 12).toFixed(2);
  if (ch.cpl === false) { o.cpl = false; o.ref = isNum(ch.ref) ? +clamp(ch.ref, -120, 12).toFixed(2) : 0; }
}
/* ---------- 1. Klang: Faktoren (ohne Felder genau 1 → bitgleich) ---------- */
const chsSumDb = () => { const L = chsTrk(); return L && isNum(L.sum) ? L.sum : 0; };
// Gesang gesamt wirkt auf die Lead-Kette über den Spur-Pegel (vol² × 10^(sum/20)); der gekoppelte Chor folgt damit von selbst
function chsFx(tr, fx) { if (!tr || !tr.stimme || !tr.chor || !isNum(tr.chor.sum) || !tr.chor.sum) return fx; return Object.assign({}, fx, {vol: fx.vol * Math.pow(10, tr.chor.sum / 40)}); }
// Lead-Regler allein (ohne Gesang gesamt) in dB
function chsVolDb() { const st = stimmeT(), tr = st >= 0 ? S.tracks[st] : null; let vol = .8; try { if (tr && tr.sound) vol = fxOfSound(tr.sound).vol; } catch (e) {} return chsDb(vol * vol); }
// Lead-Pegel, dem der Chor folgt: gekoppelt = live (G6+c); getrennt = Regler-Stand beim Trennen + Gesang gesamt + Pegel des Stücks
function chsLeadDb(a) {
  const L = chsTrk(); if (!L || L.cpl !== false) return g6pcLeadDb(a);
  const ag = a && isNum(a.gain) ? a.gain : 1;
  return (isNum(L.ref) ? L.ref : chsVolDb()) + chsSumDb() + chsDb(ag);
}
const chsBgK = () => { const L = chsTrk(); return L && isNum(L.db) ? chsK(L.db) : 1; };
const chsLaneK = id => { const l = id ? chsLane(id) : null; return l && isNum(l.db) ? chsK(l.db) : 1; };
function chsPanOf(v, C, meas) { const p = g6pcPanOf(v, C); if (meas) return p; const l = v && v.lane ? chsLane(v.lane) : null; return l && isNum(l.pan) && l.pan ? clamp(p + l.pan, -1, 1) : p; }
function chsApply() { const st = stimmeT(); if (st >= 0 && AU.ctx) applyTrackParams(st); else if (typeof g6pcApplyAll === 'function') g6pcApplyAll(); UI.dirty.grid = UI.dirty.song = true; }
// Faktor der Gruppe einer Stelle ohne gA (für Messung/Test): Chor an × Lead-Anteil × Background
function chsGrpK(a) { if (!a || !g6pcIs2(a)) return null; return (g6pcChorOn() ? 1 : 0) * g6pcLeadK(a) * chsBgK(); }

/* ---------- 1. Gesten (live ohne Undo, Loslassen = ein Schritt) ---------- */
function chsLiveBegin() { const st = stimmeT(); if (st < 0) return null; if (!CHS.drag) CHS.drag = {st, before: g6pLanesSnap(st), snd: soundSnapshot(st)}; return CHS.drag; }
function chsTrkW() { const st = stimmeT(); if (st < 0) return null; const T = S.tracks[st]; if (!T.chor || typeof T.chor !== 'object') T.chor = {lanes: []}; if (!Array.isArray(T.chor.lanes)) T.chor.lanes = []; return T.chor; }
function chsLiveEnd(label) {
  const d = CHS.drag; CHS.drag = null; if (!d) return false;
  const T = S.tracks[d.st]; if (!T) return false;
  const n = T.chor ? g6pNormLanes(T.chor) : null; if (n) T.chor = n; else delete T.chor;
  const after = g6pLanesSnap(d.st), sndCh = soundSnapshot(d.st) !== d.snd;
  if (after === d.before && !sndCh) return false;
  if (sndCh && after !== d.before) undoPush({kind: 'group', label, items: [{kind: 'sound', track: d.st, before: d.snd, label}, {kind: 'chorlanes', track: d.st, before: d.before, label}]});
  else if (sndCh) undoPush({kind: 'sound', track: d.st, before: d.snd, label});
  else undoPush({kind: 'chorlanes', track: d.st, before: d.before, label});
  markDirty(); UI.dirty.grid = UI.dirty.song = true; return true;
}
function chsSet(key, v, fin) {
  const st = stimmeT(); if (st < 0) return false; chsLiveBegin();
  if (key === 'lead') { const snd = S.tracks[st].sound; if (!snd.fx) snd.fx = {}; snd.fx.vol = +clamp(Math.pow(10, v / 40), 0, 1).toFixed(4); }
  else { const L = chsTrkW(); if (key === 'bg') L.db = +clamp(v, -60, 12).toFixed(2); else if (key === 'sum') L.sum = +clamp(v, -60, 12).toFixed(2); }
  chsApply(); markDirty();
  if (fin) chsLiveEnd(key === 'lead' ? 'Lead-Pegel' : key === 'bg' ? 'Background-Pegel' : 'Gesang gesamt');
  return true;
}
function chsLaneSet(id, key, v, fin) {
  const L = chsTrkW(); if (!L) return false; const ln = L.lanes.find(l => l.id === id); if (!ln) return false; chsLiveBegin();
  if (key === 'db') ln.db = +clamp(v, -60, 12).toFixed(2); else if (key === 'pan') ln.pan = +clamp(v, -1, 1).toFixed(3);
  if (typeof g6pcApplyAll === 'function') g6pcApplyAll(); markDirty();
  if (fin) chsLiveEnd(key === 'db' ? 'Background-Spur · Pegel' : 'Background-Spur · Pan');
  return true;
}
// [Gekoppelt] der ganzen Gruppe: aus → ref = Lead-Regler jetzt; wieder an → db += ref − Lead jetzt (hörbarer Abstand bleibt)
function chsCouple(on) {
  const st = stimmeT(); if (st < 0) return false; const L0 = chsTrk(), now = !(L0 && L0.cpl === false); if (now === !!on) return true;
  const v = chsVolDb();
  const ok = g6pLanesEdit(on ? 'Background gekoppelt' : 'Background vom Lead getrennt', ch => {
    if (on) { const d = (isNum(ch.ref) ? ch.ref : v) - v; ch.db = +((isNum(ch.db) ? ch.db : 0) + d).toFixed(2); delete ch.cpl; delete ch.ref; }
    else { ch.cpl = false; ch.ref = +v.toFixed(2); }
  }, st);
  chsApply(); return ok;
}
function chsLaneMute(id) { const l = chsLane(id); return g6pLaneMute(id, !(l && l.mute)); }
function chsSolo(id) { g6pSolo(id); if (typeof g6pcApplyAll === 'function') g6pcApplyAll(); UI.dirty.grid = UI.dirty.song = true; return G6.solo; }

/* ---------- 1. Stellen und Stimmen einer Spur ---------- */
function chsVoiceAt(r, id) { const x = tkRef(r), c = x && x.a.chor; if (!c || c.v !== 2 || !Array.isArray(c.voices)) return null; const k = c.voices.findIndex(v => v && v.lane === id); return k < 0 ? null : {k, v: c.voices[k], a: x.a}; }
function chsOpenVoice(r, id) {
  const z = chsVoiceAt(r, id); if (!z) { toast('Hier singt diese Stimme nicht – im Blatt „Chor“ hinzufügen'); return false; }
  closePop(); return z.v.take && S.takes && S.takes[z.v.take.take] ? g2Open(r, {take: z.v.take.take}) : g2Open(r, {voice: z.k});
}
// die Stelle für [♪] im Mischpult: gewählte Szene, sonst die erste Stelle mit dieser Stimme
function chsPlaceOf(id) { const st = stimmeT(); if (st < 0) return null; const r0 = {t: st, s: R.selS}; if (chsVoiceAt(r0, id)) return r0; const p = g6pfStellen().find(z => chsVoiceAt(z.r, id)); return p ? p.r : null; }
function chsColor(ln, voice) { const c = g6pLaneColor(ln.role, voice); return {tok: c.tok, dig: c.dig}; }
function chsLaneVoice(id) { for (const z of g6pfStellen()) { const q = chsVoiceAt(z.r, id); if (q) return q.v; } return null; }
// eine neue Spur (Stil, [Spur teilen]) klappt die Gruppe auf, damit sie sofort sichtbar ist
function chsLanesChanged(n) { const was = CHS.nLanes; CHS.nLanes = n; if (was >= 0 && n > was && !chsIsOpen()) { CHS.open = true; try { localStorage.setItem('synq-chs-open', '1'); } catch (e) {} UI.dirty.song = true; CHS.svKey = ''; } }
function chsIsOpen() { if (CHS.open == null) { try { CHS.open = localStorage.getItem('synq-chs-open') === '1'; } catch (e) { CHS.open = false; } } return CHS.open; }
function chsSetOpen(on, quiet) { CHS.open = !!on; try { localStorage.setItem('synq-chs-open', on ? '1' : '0'); } catch (e) {} CHS.mxSig = ''; CHS.svKey = ''; MX.key = ''; if (EL.grid && UI.heads) { chsMxSync(true); mxLayout(); mxApply(); if (on) chsMxShow(); } if (UI.songView) svLayout(); UI.dirty.grid = UI.dirty.song = true; if (!quiet) haptic('tick'); return CHS.open; }

/* ---------- 1a. Clip-Matrix: Zeilen unter der STIMME-Spur ---------- */
// Zahl der Zusatz-Zeilen (Gruppe + Spuren, wenn aufgeklappt)
function chsMxExtra() { const st = stimmeT(), n = st >= 0 ? chsLanes().length : 0; return n ? 1 + (chsIsOpen() ? n : 0) : 0; }
// Seiten der Synth-Zeilen mit Gewicht (die STIMME-Zeile zählt mit ihren Zusatz-Zeilen)
function chsPages(synth, per) {
  const st = stimmeT(), E = chsMxExtra(), pg = []; let cur = [], used = 0;
  if (!E || !synth.includes(st)) { for (let k = 0; k < synth.length; k += per) pg.push(synth.slice(k, k + per)); return pg; }
  for (const i of synth) { const w = i === st ? 1 + E : 1; if (cur.length && used + w > per) { pg.push(cur); cur = []; used = 0; } cur.push(i); used += w; }
  if (cur.length) pg.push(cur);
  if (pg.length <= 2) return pg;
  // die Spur-Bank kennt zwei Seiten: Seite 2 = STIMME mit ihrer Gruppe (+ was daneben passt), Seite 1 = der Rest (Zeilen werden notfalls flacher)
  const oth = synth.filter(i => i !== st), room = Math.max(0, per - 1 - E), B = [st].concat(oth.slice(oth.length - room)), A = oth.slice(0, oth.length - room);
  return A.length ? [A, synth.filter(i => B.includes(i))] : [synth.filter(i => B.includes(i))];
}
function chsPageRows(pages, per) { const st = stimmeT(), E = chsMxExtra(); let m = per; for (const p of pages) m = Math.max(m, p.length + (p.includes(st) ? E : 0)); return m; }
function chsMxVis(vt) { const st = stimmeT(); return st >= 0 && vt.has(st) && UI.heads[st] && !UI.heads[st].el.classList.contains('mxoff'); }
function chsMxRowEls(kind, id) {
  const g = EL.grid, row = {kind, id, cells: []};
  const h = el('button', 'chsth rb' + (kind === 'grp' ? ' chsgrp' : ''), kind === 'grp' ? `<span class="chstri">${CHS_SVG.tri}</span><span class="chsnm">BACKGROUND</span><span class="chssb"></span>` : `<i class="chssw"></i><span class="chsnm"></span><span class="chssb"></span>`);
  h.dataset.chs = kind === 'grp' ? 'grp' : 'lane'; if (id) h.dataset.id = id; row.h = h;
  for (let s = 0; s < N_SCN; s++) { const c = el('button', 'chsc rb' + (kind === 'grp' ? ' chsgrp' : ''), '<span class="chsmini"></span>'); c.dataset.chs = kind === 'grp' ? 'gcell' : 'cell'; c.dataset.s = s; if (id) c.dataset.id = id; row.cells.push({el: c, sig: null}); }
  const e = el('button', 'chse rb' + (kind === 'grp' ? ' chsgrp' : ''), kind === 'grp' ? CHS_SVG.mix : 'M'); e.dataset.chs = kind === 'grp' ? 'mix' : 'mute'; if (id) e.dataset.id = id; row.e = e;
  e.setAttribute('aria-label', kind === 'grp' ? 'Background-Mischpult' : 'Spur stumm');
  return row;
}
function chsMxSync(force) {
  const g = EL.grid, st = stimmeT(); if (!g || !UI.heads) return false;
  const L = st >= 0 ? chsLanes() : [], open = chsIsOpen(), key = st + '|' + open + '|' + L.map(l => l.id).join(',');
  chsLanesChanged(L.length);
  if (!force && CHS.mx && CHS.mx.key === key && CHS.mx.g === g && (!CHS.mx.rows.length || CHS.mx.rows[0].h.isConnected)) return false;
  if (CHS.mx) for (const r of CHS.mx.rows) { r.h.remove(); r.e.remove(); for (const c of r.cells) c.el.remove(); }
  CHS.mx = {key, g, rows: []};
  if (st < 0 || !L.length || !UI.stops[st]) return true;
  const rows = [chsMxRowEls('grp', null)]; if (open) for (const l of L) rows.push(chsMxRowEls('lane', l.id));
  let after = UI.stops[st];
  for (const r of rows) { for (const n of [r.h, ...r.cells.map(c => c.el), r.e]) { after.after(n); after = n; } }
  CHS.mx.rows = rows; CHS.mxSig = '';
  // Füllzellen: eine Seite kann jetzt mehr leere Zeilen brauchen (bis 9 Zusatz-Zeilen)
  while (UI.fill.length < 12 * (N_SCN + 2)) { const f = el('div', 'mxfill mxoff'); f.setAttribute('aria-hidden', 'true'); UI.fill.push(f); g.appendChild(f); }
  return true;
}
function chsMxApply(vt, vs) {
  if (!CHS.mx) return; const on = chsMxVis(vt);
  for (const r of CHS.mx.rows) { r.h.classList.toggle('mxoff', !on); r.e.classList.toggle('mxoff', !on); r.cells.forEach((c, s) => c.el.classList.toggle('mxoff', !on || !vs.has(s))); }
}
const chsMxVisExtra = vt => (CHS.mx && CHS.mx.rows.length && chsMxVis(vt) ? CHS.mx.rows.length : 0);
// Mini-Bild einer Stimme im Clip: Noten (Take-Zeit → Clip-Schlag) bzw. ein Band für eigene Aufnahmen
function chsMiniSvg(a, v, L) {
  const sp = spb(), t0 = wpT0(a.take, a), ns = v && Array.isArray(v.n) ? v.n : [];
  if (!ns.length) { const x0 = clamp(a.at / L * 100, 0, 100), x1 = clamp((a.at + (a.out - a.in) / sp) / L * 100, 0, 100); return `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="${x0.toFixed(2)}" y="38" width="${Math.max(1, x1 - x0).toFixed(2)}" height="24" rx="2"/></svg>`; }
  let lo = 127, hi = 0; const P = ns.map(n => n.m + (isNum(n.iv) ? n.iv : 0)); for (const p of P) { if (p < lo) lo = p; if (p > hi) hi = p; }
  const span = Math.max(hi - lo, 6); let r = '';
  ns.slice(0, 160).forEach((n, k) => { const b0 = (n.t0 - t0) / sp, b1 = (n.t1 - t0) / sp; if (b1 <= 0 || b0 >= L) return; const x = Math.max(0, b0) / L * 100, w = Math.max(1.2, (Math.min(L, b1) - Math.max(0, b0)) / L * 100), y = (1 - (P[k] - lo) / span) * 78 + 4; r += `<rect x="${x.toFixed(2)}" y="${y.toFixed(1)}" width="${w.toFixed(2)}" height="14" rx="1"/>`; });
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${r}</svg>`;
}
function chsGrpMini(a, L) {
  const c = a.chor; if (!c || c.v !== 2 || !c.voices.length) return '';
  const n = c.voices.length, h = Math.min(14, 80 / n), y0 = 50 - n * h / 2, x0 = clamp(a.at / L * 100, 0, 100), x1 = clamp((a.at + (a.out - a.in) / spb()) / L * 100, 0, 100);
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` + c.voices.map((v, k) => { const ln = chsLane(v.lane), col = ln ? chsColor(ln, v) : {tok: 'chorf'}; return `<rect x="${x0.toFixed(2)}" y="${(y0 + k * h + 1).toFixed(1)}" width="${Math.max(1, x1 - x0).toFixed(2)}" height="${Math.max(2, h - 2).toFixed(1)}" rx="1" style="fill:var(--${col.tok})"/>`; }).join('') + '</svg>';
}
// aufgeklappt auf einer anderen Seite (▲▼): zur Seite der STIMME-Spur blättern, damit die Gruppe zu sehen ist
function chsMxShow() { const st = stimmeT(); if (st < 0 || !MX.bankT || !MX.pages || !chsIsOpen()) return; const pg = MX.pages.findIndex(p => p.includes(st)); if (pg >= 0 && pg !== trackBankOf()) setTrackBank(pg); }
function chsMxRender() {
  if (!EL.grid || !UI.heads) return;
  if (chsMxSync(false)) { MX.key = ''; mxLayout(); mxApply(); chsMxShow(); }
  const M = CHS.mx; if (!M || !M.rows.length) return;
  const st = stimmeT(), T = S.tracks[st], L = chsTrk() || {lanes: []}, so = G6.solo;
  for (const r of M.rows) {
    if (r.kind === 'grp') {
      const sb = L.lanes.length + (L.lanes.length === 1 ? ' Stimme' : ' Stimmen') + (L.mute ? ' · aus' : '') + (L.cpl === false ? ' · getrennt' : '') + (isNum(L.db) && L.db ? ' · ' + chsFmtDb(L.db) : '');
      setTxt(r.h.children[2], r, 'sb', sb); setCls(r.h, r, 'open', chsIsOpen()); r.h.setAttribute('aria-expanded', String(chsIsOpen()));
      r.h.setAttribute('aria-label', 'Background-Gruppe ' + (chsIsOpen() ? 'zuklappen' : 'aufklappen'));
      for (let s = 0; s < N_SCN; s++) { const c = T.clips[s], a = c && c.audio, sig = a && a.chor && a.chor.v === 2 ? JSON.stringify([a.at, a.in, a.out, c.len, a.chor.voices.map(v => v.lane)]) + L.lanes.map(l => l.role).join() : ''; const C = r.cells[s]; if (C.sig !== sig) { C.sig = sig; C.el.firstChild.innerHTML = sig ? chsGrpMini(a, c.len * 4) : ''; C.el.classList.toggle('filled', !!sig); C.el.setAttribute('aria-label', sig ? 'Chor in Szene ' + (s + 1) + ' (Blatt Chor)' : 'Kein Chor in Szene ' + (s + 1)); } }
      continue;
    }
    const ln = L.lanes.find(l => l.id === r.id); if (!ln) continue;
    const v0 = chsLaneVoice(ln.id), col = chsColor(ln, v0);
    if (r.tok !== col.tok) { r.tok = col.tok; for (const n of [r.h, r.e, ...r.cells.map(c => c.el)]) n.style.setProperty('--cc', 'var(--' + col.tok + ')'); }
    setTxt(r.h.children[0], r, 'dig', col.dig); setTxt(r.h.children[1], r, 'nm', ln.name);
    setTxt(r.h.children[2], r, 'sb2', (ln.mute ? 'stumm' : so === ln.id ? 'Solo' : (isNum(ln.db) && ln.db ? chsFmtDb(ln.db) : '0 dB')) + (isNum(ln.pan) && ln.pan ? ' · ' + chsPanTxt(ln.pan) : ''));
    setCls(r.h, r, 'muted', !!ln.mute || !!L.mute); setCls(r.e, r, 'on', !!ln.mute); r.e.setAttribute('aria-pressed', String(!!ln.mute)); r.e.setAttribute('aria-label', ln.name + ' stumm');
    r.h.setAttribute('aria-label', ln.name + ' – Mischpult');
    for (let s = 0; s < N_SCN; s++) {
      const c = T.clips[s], a = c && c.audio, z = a ? chsVoiceAt({t: st, s}, ln.id) : null, C = r.cells[s];
      const sig = z ? JSON.stringify([a.at, a.in, a.out, c.len, z.v.n.length, z.v.n.length ? z.v.n[0].t0 + z.v.n[z.v.n.length - 1].t1 : 0, z.v.take ? 1 : 0]) + col.tok : '';
      if (C.sig !== sig) { C.sig = sig; C.el.firstChild.innerHTML = sig ? chsMiniSvg(a, z.v, c.len * 4) : ''; C.el.classList.toggle('filled', !!sig); C.el.setAttribute('aria-label', ln.name + (sig ? ' · Noten in Szene ' + (s + 1) : ' · leer in Szene ' + (s + 1))); }
      setCls(C.el, C, 'muted', !!ln.mute || !!L.mute);
    }
  }
}
const chsPanTxt = p => (Math.abs(p) < .005 ? 'Mitte' : (p < 0 ? 'L ' : 'R ') + Math.round(Math.abs(p) * 100));
function chsMxTap(b) {
  const k = b.dataset.chs, id = b.dataset.id, st = stimmeT(); if (st < 0) return;
  if (k === 'grp') { chsSetOpen(!chsIsOpen()); return; }
  if (k === 'mix') { chsMixer(b, null); return; }
  if (k === 'lane') { chsMixer(b, id); return; }
  if (k === 'mute') { chsLaneMute(id); haptic('tick'); return; }
  const s = +b.dataset.s, r = {t: st, s}; R.selS = s;
  if (k === 'gcell') { const x = tkRef(r); if (x && x.a.chor) g6Sheet(r, b); else toast('Kein Chor in Szene ' + (s + 1) + ' – STIMME-Clip ✎ → [Chor]'); return; }
  if (k === 'cell') chsOpenVoice(r, id);
}

/* ---------- 1b. Song: Zeilen unter der STIMME-Spur (Codes −100 Gruppe, −101 … Spuren; für die übrige Song-Logik leere Zeilen) ---------- */
const CHS_SV0 = -100;
const chsSvCode = r => (isNum(r) && r <= CHS_SV0 ? r : null);
function chsSvExtra() { return chsMxExtra(); }
function chsSvRows() {
  const st = stimmeT(), E = chsSvExtra(); if (E <= 0 || !SV.rows) return;
  const k = SV.rows.indexOf(st); if (k < 0) return;
  const add = [CHS_SV0]; if (chsIsOpen()) chsLanes().forEach((l, j) => add.push(CHS_SV0 - 1 - j));
  SV.rows = SV.rows.slice(0, k + 1).concat(add, SV.rows.slice(k + 1));
}
function chsSvLabels() {
  const Lb = SV.labs; if (!Lb) return; const L = chsLanes(), key = SV.rowsKey + '|' + L.map(l => l.id + l.name + (l.mute ? 1 : 0)).join(',') + (chsIsOpen() ? 'o' : '') + (G6.solo || '');
  if (CHS.svLab === key) return; CHS.svLab = key;
  for (const d of Lb.querySelectorAll('.sv-l.trk')) {
    const t = +d.dataset.t, c = chsSvCode(t); if (c == null) continue;
    d.classList.remove('blank'); d.classList.add('chs');
    if (c === CHS_SV0) { d.classList.add('chsgrp'); d.innerHTML = `<span class="chstri${chsIsOpen() ? ' open' : ''}">${CHS_SVG.tri}</span><span>BG ${L.length}</span>`; d.setAttribute('aria-label', 'Background-Gruppe'); d.style.removeProperty('--tc'); continue; }
    const ln = L[CHS_SV0 - 1 - c]; if (!ln) continue; const col = chsColor(ln, chsLaneVoice(ln.id));
    d.style.setProperty('--tc', 'var(--' + col.tok + ')'); d.classList.toggle('muted', !!ln.mute);
    d.innerHTML = `<i></i><b class="chsdg">${esc(col.dig)}</b><span>${esc(ln.name.replace(/^Chor /, ''))}</span>`; d.setAttribute('aria-label', ln.name + ' – Mischpult');
  }
}
function chsSvDraw(g, song, XB, ru, rh, W) {
  chsLanesChanged(stimmeT() >= 0 ? chsLanes().length : 0);
  const sk = stimmeT() + '|' + chsIsOpen() + '|' + chsLanes().map(l => l.id).join();
  if (CHS.svKey !== sk) { CHS.svKey = sk; requestAnimationFrame(() => { if (UI.songView) { svLayout(); UI.dirty.song = true; } }); }
  chsSvLabels();
  const st = stimmeT(), vx = song && song.vox; if (st < 0 || !SV.rows) return;
  const L = chsLanes(); if (!L.length) return;
  for (let r = 0; r < SV.rows.length; r++) {
    const c = chsSvCode(SV.rows[r]); if (c == null) continue; const y = ru + r * rh;
    g.fillStyle = 'rgba(255,255,255,.025)'; g.fillRect(0, y, W, rh);
    if (!vx) continue;
    for (const v of vx) {
      const ch = v.chor; if (!ch || ch.v !== 2 || !ch.voices.length) continue;
      const x0 = XB(v.bar * 4), x1 = XB((v.bar + v.len) * 4); if (x1 < 0 || x0 > W) continue;
      if (c === CHS_SV0) { const n = ch.voices.length, h = Math.max(2, Math.min(5, (rh - 8) / n)); ch.voices.forEach((vv, k) => { const ln = chsLane(vv.lane); g.fillStyle = ln ? chsCol(chsColor(ln, vv).tok) : '#888'; g.fillRect(x0 + 2, y + rh / 2 - n * h / 2 + k * h, x1 - x0 - 5, Math.max(1, h - 1)); }); continue; }
      const ln = L[CHS_SV0 - 1 - c]; if (!ln) continue; const k = ch.voices.findIndex(z => z.lane === ln.id); if (k < 0) continue;
      const vv = ch.voices[k], col = chsCol(chsColor(ln, vv).tok);
      g.globalAlpha = ln.mute ? .12 : .26; g.fillStyle = col; g.fillRect(x0 + 1, y + 2, x1 - x0 - 3, rh - 4);
      g.globalAlpha = ln.mute ? .35 : .95; g.strokeStyle = col; g.lineWidth = 1; g.strokeRect(x0 + 1.5, y + 2.5, x1 - x0 - 4, rh - 5);
      const ns = vv.n || [], sp = spb(), t0 = wpT0(v.take, v); if (ns.length && rh > 10) { let lo = 127, hi = 0; for (const n of ns) { const p = n.m + (n.iv || 0); if (p < lo) lo = p; if (p > hi) hi = p; } const span = Math.max(6, hi - lo);
        g.fillStyle = col; for (const n of ns) { const b0 = (n.t0 - t0) / sp, b1 = (n.t1 - t0) / sp, xa = XB(v.bar * 4 + Math.max(0, b0)), xb = XB(v.bar * 4 + Math.min(v.len * 4, b1)); if (xb <= xa) continue; const yy = y + 3 + (1 - (n.m + (n.iv || 0) - lo) / span) * (rh - 8); g.fillRect(xa, yy, Math.max(1, xb - xa - .5), 2); } }
      g.globalAlpha = 1;
    }
  }
}
const CHS_COLC = new Map();
function chsCol(tok) { let c = CHS_COLC.get(tok); if (!c) { c = getComputedStyle(document.documentElement).getPropertyValue('--' + tok).trim() || '#999'; CHS_COLC.set(tok, c); } return c; }
function chsSvTap(code, bar) {
  const v = tkVoxAt(bar); if (code === CHS_SV0) { if (v && v.chor) g6Sheet({vox: v.id}, SV.cv); else chsSetOpen(!chsIsOpen()); return; }
  const ln = chsLanes()[CHS_SV0 - 1 - code]; if (!ln) return;
  if (!v) { toast('Kein Song-Gesang in Takt ' + (bar + 1)); return; }
  chsOpenVoice({vox: v.id}, ln.id);
}
function chsSvLabTap(d) { const c = chsSvCode(+d.dataset.t); if (c == null) return false; if (c === CHS_SV0) chsSetOpen(!chsIsOpen()); else { const ln = chsLanes()[CHS_SV0 - 1 - c]; if (ln) chsMixer(d, ln.id); } return true; }

/* ---------- 1c. Blatt „Background“ (Mischpult) ---------- */
function chsSl(k, lab, min, max, step, val, txt, id) { return `<label class="chs-sl"><span class="chs-sll">${esc(lab)}</span><input type="range" class="pan-x" min="${min}" max="${max}" step="${step}" value="${val}" data-k="${k}"${id ? ` data-id="${esc(id)}"` : ''} aria-label="${esc(lab)}"><output>${esc(txt)}</output></label>`; }
function chsMixPaint(p) {
  const st = stimmeT(), L = chsTrk() || {lanes: []}; if (st < 0) { p.innerHTML = '<div class="chs-mh"><b>Background</b></div><div class="qnote">Keine STIMME-Spur.</div>'; return; }
  const cpl = L.cpl !== false, lead = chsVolDb(), so = G6.solo;
  let h = `<div class="chs-mh"><b>Background</b><button class="rb chs-cpl${cpl ? ' on' : ''}" data-a="cpl" aria-pressed="${cpl}">Gekoppelt</button><button class="rb chs-mute${L.mute ? ' on' : ''}" data-a="chor" aria-pressed="${!L.mute}">${L.mute ? 'Chor aus' : 'Chor an'}</button><button class="rb sh-x chs-x" data-a="x" aria-label="Schließen">✕</button></div>`;
  h += '<div class="chs-mg">' + chsSl('lead', 'Lead', -40, 0, .5, lead.toFixed(1), chsFmtDb(lead)) + chsSl('bg', 'Background', -24, 12, .5, (L.db || 0).toFixed(1), chsFmtDb(L.db || 0)) + chsSl('sum', 'Gesang gesamt', -24, 12, .5, (L.sum || 0).toFixed(1), chsFmtDb(L.sum || 0)) + '</div>';
  h += `<div class="qnote chs-note">${cpl ? 'Gekoppelt: der Lead-Regler nimmt den Chor im gleichen Schritt mit.' : 'Getrennt: Lead und Background regeln unabhängig.'} Gesang gesamt = Lead + Background.</div>`;
  h += '<div class="chs-lanes">';
  for (const ln of L.lanes) {
    const col = chsColor(ln, chsLaneVoice(ln.id)), hl = CHS.mixHl === ln.id ? ' hl' : '';
    h += `<div class="chs-lane${ln.mute ? ' muted' : ''}${hl}" style="--cc:var(--${col.tok})" data-id="${esc(ln.id)}"><div class="chs-lt"><i class="chs-chip">${esc(col.dig)}</i><b>${esc(ln.name)}</b>` +
      `<button class="rb chs-s${so === ln.id ? ' on' : ''}" data-a="solo" data-id="${esc(ln.id)}" aria-pressed="${so === ln.id}" aria-label="${esc(ln.name)} solo">S</button>` +
      `<button class="rb chs-m${ln.mute ? ' on' : ''}" data-a="mute" data-id="${esc(ln.id)}" aria-pressed="${!!ln.mute}" aria-label="${esc(ln.name)} stumm">M</button>` +
      `<button class="rb chs-n" data-a="notes" data-id="${esc(ln.id)}" aria-label="Noten von ${esc(ln.name)}">♪</button></div><div class="chs-lr">` +
      chsSl('db', 'Pegel', -24, 12, .5, (ln.db || 0).toFixed(1), chsFmtDb(ln.db || 0), ln.id) + chsSl('pan', 'Pan', -100, 100, 1, Math.round((ln.pan || 0) * 100), chsPanTxt(ln.pan || 0), ln.id) + '</div></div>';
  }
  h += '</div><div class="chs-mf"><button class="mbtn rb" data-a="dup">Spur teilen · Gegenstimme</button><button class="mbtn rb" data-a="sheet">Blatt „Chor“</button></div>';
  p.innerHTML = h;
  if (CHS.mixHl) { const e = p.querySelector('.chs-lane.hl'); if (e) try { e.scrollIntoView({block: 'nearest'}); } catch (er) {} }
}
function chsMixer(anchor, hl) {
  CHS.mixHl = hl || null;
  openPop(anchor || EL.grid, p => {
    p.classList.add('tksheet', 'chsmix'); guardTouch(p); chsMixPaint(p);
    const val = (inp, fin) => {
      const k = inp.dataset.k, id = inp.dataset.id, v = +inp.value, o = inp.parentNode.querySelector('output');
      if (k === 'pan') { chsLaneSet(id, 'pan', v / 100, fin); o.textContent = chsPanTxt(v / 100); }
      else if (k === 'db') { chsLaneSet(id, 'db', v, fin); o.textContent = chsFmtDb(v); }
      else { chsSet(k, v, fin); o.textContent = chsFmtDb(v); }
    };
    p.addEventListener('input', e => { const t = e.target; if (t.matches && t.matches('input[type=range][data-k]')) val(t, false); });
    p.addEventListener('change', e => { const t = e.target; if (t.matches && t.matches('input[type=range][data-k]')) { val(t, true); } });
    // Doppeltipp auf einen Regler = 0 dB / Mitte (ein Schritt)
    p.addEventListener('dblclick', e => { const t = e.target.closest && e.target.closest('input[type=range][data-k]'); if (!t || t.dataset.k === 'lead') return; t.value = 0; val(t, true); });
    onTap(p, b => {
      const a = b.dataset.a, id = b.dataset.id;
      if (a === 'x') { closePop(); return; }
      if (a === 'cpl') { const L = chsTrk(); chsCouple(L && L.cpl === false); }
      else if (a === 'chor') { const L = chsTrk(); g6pLaneMute(null, !(L && L.mute)); }
      else if (a === 'solo') chsSolo(id);
      else if (a === 'mute') chsLaneMute(id);
      else if (a === 'notes') { const r = chsPlaceOf(id); if (r) chsOpenVoice(r, id); else toast('Diese Stimme singt noch nirgends'); return; }
      else if (a === 'dup') { const st = stimmeT(), r = st >= 0 && tkRef({t: st, s: R.selS}) ? {t: st, s: R.selS} : (g6pfStellen()[0] || {}).r; closePop(); if (r) g6pDuplizieren(r, true); else toast('Erst Gesang aufnehmen'); return; }
      else if (a === 'sheet') { const st = stimmeT(), r = st >= 0 && tkRef({t: st, s: R.selS}) ? {t: st, s: R.selS} : (g6pfStellen()[0] || {}).r; closePop(); if (r) g6Sheet(r, anchor); return; }
      haptic('tick'); if (UI.pop && UI.pop.name === 'chsmix') chsMixPaint(UI.pop.el);
    }, 'button[data-a]');
  }, {name: 'chsmix', onClose: () => { if (CHS.drag) chsLiveEnd('Background'); }});
}

/* ---------- 2. Gesangs-Editor: Lineal, Abspielen, Loop, Zoom, Vorhören ---------- */
const chsEdKind = E => (E && G2.ed === E ? 'g2' : E && WP.ed === E ? 'wp' : null);
const chsEdPaintAll = E => { const k = chsEdKind(E); if (k === 'g2') g2Paint(); else if (k === 'wp') wpPaint(); };
// Raster: Take-Zeit ↔ Schlag im Clip bzw. im Song-Stück (Bezug wie die Taktlinien der Editoren)
function chsGrid(E) { const x = tkRef(E.r); if (!x) return null; const a = x.a, sp = spb(); return {a, x, sp, t0: wpT0(a.take, a), L: E.r.vox ? a.len * 4 : x.clip.len * 4}; }
function chsSnap(E, t) { const G = chsGrid(E); if (!G) return t; const pxB = G.sp / E.vw.W * E.cv.clientWidth, step = E.r.vox ? 4 : pxB >= 18 ? 1 : 4, b = Math.round((t - G.t0) / G.sp / step) * step; return G.t0 + clamp(b, 0, G.L) * G.sp; }
function chsEdAttach(E) {
  if (!E || !E.cvw || E.chsOv) return;
  const cvw = E.cvw, ov = el('canvas', 'chsov'), rul = el('div', 'chsrul');
  ov.setAttribute('aria-hidden', 'true');
  rul.innerHTML = `<button class="rb chspl" data-a="play" aria-label="Ab Lineal abspielen">${CHS_SVG.play}</button><span class="chsrz" aria-label="Lineal: tippen = ab hier spielen, ziehen = Loop, Doppeltipp = Zoom"></span><button class="rb chslp" data-a="loop" aria-pressed="false" aria-label="Loop an/aus">${CHS_SVG.loop}</button>`;
  cvw.append(ov, rul); cvw.classList.add('chsr');
  Object.assign(E, {chsOv: ov, chsRul: rul, chsLoop: E.chsLoop || null});
  onTap(rul, b => {
    if (b.dataset.a === 'play') { if (chsRunning(E)) chsStop(); else chsPlayFrom(E, E.chsLoop && E.chsLoop.on ? E.chsLoop.a : E.chsCur != null ? E.chsCur : E.vw.a); return; }
    const Lp = E.chsLoop; if (!Lp) { toast('Loop: auf dem Lineal einen Bereich ziehen'); return; } Lp.on = !Lp.on; haptic('tick'); if (chsRunning(E)) chsPlayFrom(E, Lp.on ? Lp.a : chsPlayT(E) || Lp.a); chsEdOverlay(E);
  }, 'button[data-a]');
  const zone = rul.querySelector('.chsrz'), tOf = e => { const rc = E.cv.getBoundingClientRect(); return E.vw.a + (e.clientX - rc.left) / rc.width * E.vw.W; };
  zone.addEventListener('pointerdown', e => { if (e.button > 0) return; try { zone.setPointerCapture(e.pointerId); } catch (er) {} E.chsP = {id: e.pointerId, x0: e.clientX, t0: tOf(e), tm: performance.now(), mode: null}; e.preventDefault(); });
  zone.addEventListener('pointermove', e => { const P = E.chsP; if (!P || P.id !== e.pointerId) return; if (!P.mode && Math.abs(e.clientX - P.x0) > 8) P.mode = 'loop'; if (P.mode === 'loop') { const a = chsSnap(E, Math.min(P.t0, tOf(e))), b = chsSnap(E, Math.max(P.t0, tOf(e))); E.chsDraft = {a, b}; chsEdOverlay(E); } });
  const end = (e, cancel) => {
    const P = E.chsP; if (!P || P.id !== e.pointerId) return; E.chsP = null; const D = E.chsDraft; E.chsDraft = null;
    if (cancel) { chsEdOverlay(E); return; }
    if (P.mode === 'loop') { if (D && D.b - D.a > spb() * .9) { E.chsLoop = {a: D.a, b: D.b, on: true}; CHS.loopLast = {a: D.a, b: D.b}; haptic('tick'); toast('Loop ' + chsBeatTxt(E, D.a) + ' – ' + chsBeatTxt(E, D.b)); if (chsRunning(E)) chsPlayFrom(E, D.a); } chsEdOverlay(E); return; }
    const t = chsSnap(E, P.t0), now = performance.now(), last = CHS.rtap; CHS.rtap = {t: now, x: e.clientX};
    if (last && now - last.t < 330 && Math.abs(last.x - e.clientX) < 30) { CHS.rtap = null; chsZoomToggle(E, P.t0, e.clientX); return; }
    E.chsCur = t; chsPlayFrom(E, t);
  };
  zone.addEventListener('pointerup', e => end(e, false)); zone.addEventListener('pointercancel', e => end(e, true));
  // zwei Finger = Zoom (vor den Gesten der Editoren: Erfassung am Rahmen), Doppeltipp leer (Noten-Editor) = Zoom
  cvw.addEventListener('pointerdown', e => {
    if (!e.target.closest || e.target.closest('.chsrul,.g6pgleg,button,input')) return; CHS.pts.set(e.pointerId, {x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, tm: performance.now()});
    if (CHS.pts.size === 2) { e.stopPropagation(); chsPinchStart(E); }
    else if (CHS.pts.size > 2) e.stopPropagation();
  }, true);
  cvw.addEventListener('pointermove', e => { const q = CHS.pts.get(e.pointerId); if (!q) return; q.x = e.clientX; q.y = e.clientY; if (CHS.pinch && CHS.pinch.E === E) { e.stopPropagation(); chsPinchMove(E); } }, true);
  const pend = (e, cancel) => {
    const q = CHS.pts.get(e.pointerId); if (!q) return; CHS.pts.delete(e.pointerId);
    if (CHS.pinch && CHS.pinch.E === E) { e.stopPropagation(); if (CHS.pts.size < 2) { CHS.pinch.done = true; if (!CHS.pts.size) CHS.pinch = null; } return; }
    if (cancel || chsEdKind(E) !== 'g2') return;
    const tap = Math.hypot(e.clientX - q.x0, e.clientY - q.y0) < 10 && performance.now() - q.tm < 350; if (!tap) { CHS.ctap = null; return; }
    const rc = E.cv.getBoundingClientRect(), cx = e.clientX - rc.left, cy = e.clientY - rc.top;
    if (g2Hit(E, cx, cy) >= 0) { CHS.ctap = null; return; }
    const now = performance.now(), last = CHS.ctap; CHS.ctap = {t: now, x: e.clientX, y: e.clientY};
    if (last && now - last.t < 330 && Math.hypot(last.x - e.clientX, last.y - e.clientY) < 30) { CHS.ctap = null; e.stopPropagation(); E.p = null; E.ghost = null; chsZoomToggle(E, E.vw.a + cx / rc.width * E.vw.W, e.clientX); }
  };
  cvw.addEventListener('pointerup', e => pend(e, false), true); cvw.addEventListener('pointercancel', e => pend(e, true), true);
  chsEdOverlay(E);
}
function chsPinchStart(E) {
  const [p1, p2] = [...CHS.pts.values()], rc = E.cv.getBoundingClientRect(), cx = (p1.x + p2.x) / 2 - rc.left;
  E.p = null; E.ghost = null;                                         // der erste Finger verschiebt nichts mehr
  CHS.pinch = {E, d0: Math.max(20, Math.abs(p1.x - p2.x)), W0: E.vw.W, tc: E.vw.a + cx / rc.width * E.vw.W};
  chsEdPaintAll(E);
}
function chsPinchMove(E) {
  const P = CHS.pinch; if (!P || P.done || CHS.pts.size < 2) return;
  const [p1, p2] = [...CHS.pts.values()], rc = E.cv.getBoundingClientRect(), d = Math.max(20, Math.abs(p1.x - p2.x)), cx = (p1.x + p2.x) / 2 - rc.left;
  const W = P.W0 * P.d0 / d; chsSetView(E, W, P.tc - cx / rc.width * W);
  if (!E.chsRq) E.chsRq = requestAnimationFrame(() => { E.chsRq = 0; chsEdPaintAll(E); });
}
// Ansicht: eigene Breite W (Sekunden) – gilt, bis jemand den Zoom-Knopf tippt
function chsSetView(E, W, va) { const x = tkRef(E.r); if (!x) return; const a = x.a, segL = Math.max(a.out - a.in, spb()), sp = spb(); E.chsW = clamp(W, sp * .5, segL * 1.1); E.chsZ0 = E.zoom; E.va = va; }
function chsViewW(E, W, segL) { if (E.chsW && E.chsZ0 === E.zoom) return Math.min(E.chsW, Math.max(segL, spb()) * 1.1); E.chsW = 0; return W; }
function chsZoomToggle(E, t, clientX) {
  const rc = E.cv.getBoundingClientRect(), f = clamp((clientX - rc.left) / rc.width, 0, 1), x = tkRef(E.r); if (!x) return;
  const full = Math.max(x.a.out - x.a.in, .05), W = E.vw.W;
  if (W > full * .55 || W > spb() * 8.5) chsSetView(E, Math.max(spb() * 2, W / 4), t - f * Math.max(spb() * 2, W / 4));
  else { E.chsW = 0; E.zoom = 0; E.va = x.a.in; }
  haptic('tick'); chsEdPaintAll(E);
}
const chsBeatTxt = (E, t) => { const G = chsGrid(E); if (!G) return ''; const b = Math.round((t - G.t0) / G.sp), bar = Math.floor(b / 4) + 1 + (E.r.vox ? G.a.bar : 0), be = ((b % 4) + 4) % 4 + 1; return 'Takt ' + bar + (be > 1 ? '.' + be : ''); };
// eine Note nur verschieben, wenn sie gewählt war oder ¼ s gehalten wird (sonst schwenkt der Finger) – nichts verrutscht versehentlich
function chsMayMove(E, p) { return p.k === E.sel || performance.now() - p.t0 >= 250; }

/* Abspielen ab Take-Zeit t: Szene des Clips (alle Spuren der Szene im gleichen Takt) bzw. Song ab dem Takt; Loop im Editor */
function chsRunning(E) { return !!(CHS.run && R.playing && (!E || chsHideKey(CHS.run.r) === chsHideKey(E.r))); }
function chsStop() {
  const run = CHS.run; CHS.run = null; clearInterval(CHS.loopT); CHS.loopT = 0;
  if (run && run.song0 !== undefined && S.song) { S.song.loop = run.song0; UI.dirty.song = true; }
  if (R.songPlay) songPlayEnd(true); else if (R.playing) stop();
  for (const E of [G2.ed, WP.ed]) if (E && E.chsOv) chsEdOverlay(E);
  return true;
}
function chsPlayFrom(E, t) {
  const G = chsGrid(E); if (!G) return false; ensureAudio(); if (!AU.ctx) return false;
  const Lp = E.chsLoop && E.chsLoop.on ? E.chsLoop : null;
  let b = (t - G.t0) / G.sp;
  const lA = Lp ? Math.round((Lp.a - G.t0) / G.sp) : null, lB = Lp ? Math.round((Lp.b - G.t0) / G.sp) : null;
  if (Lp && !(b >= lA && b < lB)) b = lA;
  const old = CHS.run; if (old) { CHS.run = null; clearInterval(CHS.loopT); CHS.loopT = 0; if (old.song0 !== undefined && S.song) S.song.loop = old.song0; }
  if (R.songPlay) songPlayEnd(true); else if (R.playing) stop();
  if (E.r.vox) {
    if (!S.song) return false; const run = {r: E.r, mode: 'song', song0: S.song.loop ? deep(S.song.loop) : null};
    const bar = clamp(G.a.bar + Math.floor(Math.max(0, b) / 4), 0, Math.max(0, S.song.bars - 1));
    if (Lp) { const a0 = clamp(G.a.bar + Math.floor(lA / 4), 0, S.song.bars - 1), b0 = clamp(G.a.bar + Math.ceil(lB / 4), a0 + 1, S.song.bars); S.song.loop = {on: true, a: a0, b: b0}; }
    CHS.run = run; if (!songPlayStart(Lp ? S.song.loop.a : bar)) { chsStop(); return false; }
  } else {
    const s = E.r.s, L = G.L; b = clamp(b, 0, L - 1e-6);
    for (let i = 0; i < NT(); i++) { const has = !!S.tracks[i].clips[s]; R.slot[i] = has ? s : -1; R.pend[i] = null; R.prev[i] = null; R.own[i] = null; }
    R.startCs = new Array(NT()).fill(-b); R.selS = s;
    CHS.run = {r: E.r, mode: 'clip', s, b0: b, lp: Lp ? {A: lA, B: lB, next: lB - b} : null};
    play();
    if (Lp) CHS.loopT = setInterval(chsLoopTick, 40);
  }
  CHS.log.push({t: performance.now(), mode: CHS.run.mode, from: +b.toFixed(3), loop: Lp ? [lA, lB] : null}); if (CHS.log.length > 20) CHS.log.shift();
  haptic('tick'); chsEdRaf(); return true;
}
// Loop im Clip: am Ende des Bereichs startet jede Spur der Szene wieder an seinem Anfang (über den Planer, im Takt – kein Neustart)
function chsLoopTick() {
  const run = CHS.run; if (!run || run.mode !== 'clip' || !run.lp || !R.playing || !AU.ctx) { clearInterval(CHS.loopT); CHS.loopT = 0; return; }
  const P = run.lp; if (audBeat() < P.next - 2 || P.q === P.next) return;
  P.q = P.next;
  for (let i = 0; i < NT(); i++) if (R.slot[i] === run.s || (R.pend[i] && R.pend[i].slot === run.s)) switchTrackAt(i, run.s, P.next, P.next - P.A);
  P.next += P.B - P.A;
}
// Laufstrich: Take-Zeit, die gerade klingt (oder null)
function chsPlayT(E) {
  if (!R.playing || !AU.ctx || !E) return null; const G = chsGrid(E); if (!G) return null;
  const bA = audBeat(); let pos;
  if (E.r.vox) { if (!R.songPlay) return null; const sb = songBeatOf(bA); if (sb == null) return null; pos = sb - G.a.bar * 4; if (pos < 0 || pos > G.L) return null; }
  else { const st = stimmeT(); if (st < 0 || R.slot[st] !== E.r.s) return null; const cs = audCstart(st, bA); pos = ((bA - cs) % G.L + G.L) % G.L; }
  return G.t0 + pos * G.sp;
}
function chsEdRaf() {
  if (CHS.raf) return;
  const loop = () => { CHS.raf = 0; let any = false; for (const E of [G2.ed, WP.ed]) if (E && E.chsOv) { chsEdOverlay(E); any = true; } if (any && R.playing) CHS.raf = requestAnimationFrame(loop); else if (any) { for (const E of [G2.ed, WP.ed]) if (E && E.chsOv) chsEdOverlay(E); } };
  CHS.raf = requestAnimationFrame(loop);
}
function chsEdPaint(E) { if (!E || !E.cvw) return; if (!E.chsOv) chsEdAttach(E); else chsEdOverlay(E); }
// Lineal-Band, Loop-Bereich und Laufstrich auf eigener Leinwand (die Editor-Leinwand bleibt unberührt)
function chsEdOverlay(E) {
  const ov = E.chsOv; if (!ov || !E.vw || !E.X) return;
  const hide = !!E.g9; ov.hidden = hide; E.chsRul.hidden = hide; if (hide) return;
  const rc = E.cv.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1), Wp = Math.max(1, Math.round(rc.width)), Hp = Math.max(1, Math.round(rc.height));
  if (ov.width !== Wp * dpr || ov.height !== Hp * dpr) { ov.width = Wp * dpr; ov.height = Hp * dpr; }
  const g = ov.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, Wp, Hp);
  const G = chsGrid(E); if (!G) return; const X = t => (t - E.vw.a) / E.vw.W * Wp, y0 = Hp - CHS_RH;
  // Loop
  const Lp = E.chsDraft || E.chsLoop;
  if (Lp) { const on = E.chsDraft || Lp.on, xa = X(Lp.a), xb = X(Lp.b); g.fillStyle = on ? 'rgba(255,178,46,.10)' : 'rgba(255,255,255,.04)'; g.fillRect(xa, 0, xb - xa, y0); g.fillStyle = on ? '#ffb22e' : '#6b7080'; g.fillRect(Math.round(xa), 0, 1.5, Hp); g.fillRect(Math.round(xb) - 1, 0, 1.5, Hp); }
  // Lineal
  g.fillStyle = 'rgba(14,16,20,.86)'; g.fillRect(0, y0, Wp, CHS_RH); g.fillStyle = '#2a303b'; g.fillRect(0, y0, Wp, 1);
  if (Lp) { g.fillStyle = (E.chsDraft || Lp.on) ? 'rgba(255,178,46,.55)' : 'rgba(255,255,255,.14)'; g.fillRect(X(Lp.a), y0 + 3, X(Lp.b) - X(Lp.a), 6); }
  g.font = '700 10px ' + (getComputedStyle(document.body).fontFamily || 'sans-serif'); g.textBaseline = 'alphabetic';
  const pxB = G.sp / E.vw.W * Wp, bf = Math.floor((E.vw.a - G.t0) / G.sp), bl = Math.ceil((E.vw.a + E.vw.W - G.t0) / G.sp);
  for (let b = bf; b <= bl; b++) { const xx = Math.round(X(G.t0 + b * G.sp)) + .5, bar = ((b % 4) + 4) % 4 === 0; if (!bar && pxB < 7) continue; g.fillStyle = bar ? '#8a93a6' : '#4a5466'; g.fillRect(xx - .5, bar ? y0 + 2 : y0 + CHS_RH - 8, 1, bar ? CHS_RH - 4 : 6);
    if (bar && (pxB * 4 >= 26 || (b / 4) % 2 === 0)) { const n = b / 4 + 1 + (E.r.vox ? G.a.bar : 0); if (n >= 1) { g.fillStyle = '#c9cfdb'; g.fillText(String(n), xx + 3, y0 + CHS_RH - 8); } } }
  if (E.chsCur != null && !R.playing) { const xx = X(E.chsCur); g.fillStyle = '#3ddc84'; g.beginPath(); g.moveTo(xx - 5, y0 + 1); g.lineTo(xx + 5, y0 + 1); g.lineTo(xx, y0 + 8); g.fill(); }
  // Laufstrich
  const pt = chsRunning(E) ? chsPlayT(E) : null; E.chsPt = pt;
  if (pt != null) { const xx = Math.round(X(pt)) + .5; g.fillStyle = '#3ddc84'; g.fillRect(xx - 1, 0, 2, Hp); }
  const pl = E.chsRul.querySelector('[data-a=play]'), lp = E.chsRul.querySelector('[data-a=loop]'), run = chsRunning(E);
  if (pl._run !== run) { pl._run = run; pl.innerHTML = run ? CHS_SVG.stop : CHS_SVG.play; pl.classList.toggle('on', run); pl.setAttribute('aria-label', run ? 'Stopp' : 'Ab Lineal abspielen'); }
  const lon = !!(E.chsLoop && E.chsLoop.on); if (lp._on !== lon) { lp._on = lon; lp.classList.toggle('on', lon); lp.setAttribute('aria-pressed', String(lon)); }
}
function chsEdClosed(E) { if (!E) return; if (E.chsRq) cancelAnimationFrame(E.chsRq); CHS.pinch = null; CHS.pts.clear(); if (CHS.run && chsHideKey(CHS.run.r) === chsHideKey(E.r) && CHS.run.mode === 'clip' && CHS.run.lp) { clearInterval(CHS.loopT); CHS.loopT = 0; CHS.run.lp = null; } if (CHS.run && CHS.run.song0 !== undefined && S.song) { S.song.loop = CHS.run.song0; delete CHS.run.song0; UI.dirty.song = true; } }

/* Vorhören nach einer Tonhöhen-Änderung: sobald die neue Fassung gerechnet ist, die Note kurz allein (im Loop: live, nichts extra) */
function chsAudition(E, k) {
  if (!E || k == null || k < 0) return; const x = tkRef(E.r); if (!x) return;
  if (chsRunning(E)) return;                                          // läuft der Editor: die neue Fassung kommt im nächsten Durchgang (tkTrackResync / g6Refresh)
  ensureAudio(); const c = AU.ctx; if (!c) return;
  const a = x.a, voice = E.voice, id = E.id, tok = CHS.aud = {};
  const n = voice != null ? (a.chor && a.chor.voices[voice] && a.chor.voices[voice].n[k]) : (g2Notes(id) || [])[k]; if (!n) return;
  const old = voice != null ? null : tkHeard(id, a);
  const t0 = performance.now();
  const go = () => {
    if (CHS.aud !== tok) return; const y = tkRef(E.r); if (!y) return; const A = y.a;
    let b = null, off = 0;
    if (voice != null) { const v = A.chor && A.chor.voices[voice]; if (!v) return; if (!g6Ready(A) && performance.now() - t0 < 4000) { setTimeout(go, 50); return; } b = g6pcIs2(A) ? g6pcBuf(A, v, 0) : g6Buf(A, v, 0); off = b && b.g6pT0 ? b.g6pT0 : 0; }
    else { if ((!g2Ready(id, A) || tkHeard(id, A) === old) && performance.now() - t0 < 4000) { if (!g2Ready(id, A)) tkPlayBuf(id, A); setTimeout(go, 50); return; } b = tkHeard(id, A); }
    if (!b) return;
    const s0 = Math.max(0, n.t0 - .04 - off), dur = Math.min(1.6, Math.max(.15, n.t1 - n.t0 + .1)); if (s0 >= b.duration) return;
    const now = c.currentTime + .02, src = c.createBufferSource(), gn = c.createGain(); src.buffer = b;
    gn.gain.setValueAtTime(0, now); gn.gain.linearRampToValueAtTime(.9, now + .01); gn.gain.setValueAtTime(.9, now + dur - .03); gn.gain.linearRampToValueAtTime(0, now + dur);
    src.connect(gn); gn.connect(AU.masterSum || c.destination); src.start(now, s0, dur + .01); src.onended = () => { try { gn.disconnect(); } catch (e) {} };
    CHS.lastAud = {k, voice, s0: +s0.toFixed(4), dur: +dur.toFixed(3), ms: Math.round(performance.now() - t0), buf: wpBid(b)};
  };
  setTimeout(go, 30);
}

/* ---------- Test-API ---------- */
const CHS_API = {
  chsInfo: () => { const L = chsTrk(); return {lanes: L ? deep(L.lanes) : [], db: L && L.db || 0, sum: L && L.sum || 0, cpl: !(L && L.cpl === false), ref: L ? L.ref : null, open: chsIsOpen(), extra: chsMxExtra(), lead: chsVolDb(),
    mx: CHS.mx ? CHS.mx.rows.map(r => ({kind: r.kind, id: r.id, vis: !r.h.classList.contains('mxoff'), h: Math.round(r.h.getBoundingClientRect().height), cells: r.cells.filter(c => c.el.classList.contains('filled')).map(c => +c.el.dataset.s)})) : [],
    sv: SV.rows ? SV.rows.filter(x => chsSvCode(x) != null) : [], run: CHS.run ? {mode: CHS.run.mode, s: CHS.run.s, b0: CHS.run.b0, lp: CHS.run.lp ? Object.assign({}, CHS.run.lp) : null} : null, log: CHS.log.slice(), aud: CHS.lastAud || null}; },
  chsSet: (k, v) => chsSet(k, v, true), chsLaneSet: (id, k, v) => chsLaneSet(id, k, v, true), chsCouple: on => chsCouple(on), chsOpen: on => chsSetOpen(on, true), chsSolo: id => chsSolo(id),
  chsGrpK: r => { const x = tkRef(r || {t: stimmeT(), s: R.selS}); return x ? chsGrpK(x.a) : null; },
  chsLaneK: id => chsLaneK(id),
  // laufende Knoten: Gruppen-Pegel (lvl) und Stimmen-Pegel je Kopie
  chsNodes: () => (AU.ctx ? TK.src.filter(r => !r.dead && r.chG).map(r => ({lvl: r.chG.lvl.gain.value, ch: (r.ch || []).map(x => ({vi: x.vi, vg: x.vg.gain.value, pan: x.pan ? x.pan.pan.value : 0}))})) : []),
  chsMixer: id => { chsMixer(EL.grid, id || null); return !!(UI.pop && UI.pop.name === 'chsmix'); },
  chsPlayFrom: t => { const E = G2.ed || WP.ed; return E ? chsPlayFrom(E, t) : false; },
  chsLoop: (a, b, on) => { const E = G2.ed || WP.ed; if (!E) return false; E.chsLoop = a == null ? null : {a, b, on: on !== false}; chsEdOverlay(E); return true; },
  chsStop: () => chsStop(),
  chsEd: () => { const E = G2.ed || WP.ed; if (!E) return null; const rc = E.cv.getBoundingClientRect(), G = chsGrid(E); return {kind: chsEdKind(E), view: {a: E.vw.a, W: E.vw.W}, zoom: E.zoom, chsW: E.chsW || 0, loop: E.chsLoop ? Object.assign({}, E.chsLoop) : null, cur: E.chsCur, pt: E.chsPt == null ? null : E.chsPt, sel: E.sel, t0: G ? G.t0 : null, sp: G ? G.sp : null, L: G ? G.L : null,
    cv: {x: rc.left, y: rc.top, w: rc.width, h: rc.height}, rul: (() => { const r = E.chsRul && E.chsRul.querySelector('.chsrz').getBoundingClientRect(); return r ? {x: r.left, y: r.top, w: r.width, h: r.height} : null; })(), lead: !!E.chsLead, hide: [...G6PG.hide]}; },
  chsHide: r => [...chsHideOf(r || {t: stimmeT(), s: R.selS})]
};
/* CHS-END */
