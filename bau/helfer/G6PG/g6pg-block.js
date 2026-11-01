/* G6PG-BEGIN */
/* =====================================================================================================================
   G6+g (Nachtrag 10 §1.6): farbige Schatten der Chorstimmen als Vorlage zum Nachsingen.
   - Farbe + Ziffer je Note nach dem Intervall zum Lead (Stufen, ohne Oktave): Terz rot 3 (Dezime 10), Quinte grün 5, Sexte blau 6,
     Oktave violett 8, Quarte orange 4, Sekunde/Septime braun 2/7, Unisono grau 1, freie Gegenstimme gelb (ohne Ziffer).
     Farbe der Spur: Intervall-Rolle (st±n, oct±n, uni) aus der Rolle, free gelb, Akkord-Rolle (ch±n, root-) und v1 = häufigstes
     Intervall der Stimme an dieser Stelle (gleich häufig: das kleinere).
   - Noten-Editor (g2Paint): Chorstimmen halbtransparent hinter den Lead-Blöcken (in einer Chorstimme: Lead grau, die anderen farbig).
     Marken-/Wellen-Editor (wpPaint): dünne farbige Tonhöhenlinien über der Welle.
   - Legende oben (Chip je Chor-Spur: Farbfeld mit Ziffer, Name, Auge, Solo). Solo aus der Legende endet mit dem Schließen des Editors.
     Tipp auf einen Schatten (Noten-Editor) öffnet diese Stimme.
   - „Selbst singen“ v2 (g6pgSing): Zielstimme als Führung, Lead leise (−12 dB, Schalter „Lead leise“), andere Stimmen stumm,
     ihr Schatten kräftig, die anderen blass; die Aufnahme ersetzt die Stimme (Spur/Pan/Pegel bleiben, v2: dblOff).
   - Leistung (iPhone): Geometrie je Stelle (Zeit/Ton je Note) im Cache nach Daten-Prüfsumme; je Ansicht ein Bild-Puffer (Offscreen-
     Canvas), neu gezeichnet nur, wenn sich Ansicht, Daten, Auge oder Hervorhebung ändern – sonst ein drawImage.
   Schnittstellen zu G6+a…f (Platzhalter, Spec §2.2): v2-Daten chor.v === 2, voices[].lane/rule/n[].d/o/x, Spuren an der STIMME-Spur
   S.tracks[st].chor.lanes [{id, role, name, mute}], g6pTrackOf(r) (falls vorhanden), g6pSolo(laneId) (falls vorhanden, sonst v1-Solo).
   Daten werden hier nie geändert (keine neuen Felder außer dblOff beim Selbst-Singen v2, Regel 28).
   ===================================================================================================================== */
const G6PG = {hide: new Set(), hl: null, legSolo: false, leadQ: true, geo: new Map(), st: {geo: 0, geoHit: 0, img: 0, imgHit: 0}};
const G6PG_LEADQ = Math.pow(10, -12 / 20);          // Lead leise beim Selbst-Singen: −12 dB
// Farb-Tokens (gleich in CSS als --chor1 … --chorF): dunkel = Editor-Leinwand #0e1014, hell = heller Grund
const G6PG_PAL = {
  dark: {c3: '#ff5f5f', c5: '#3ddc84', c6: '#4d9dff', c8: '#b585ff', c4: '#ff9d42', c2: '#c8956a', c1: '#a2a8b3', cF: '#ffd23f'},
  light: {c3: '#c62828', c5: '#1b7f3b', c6: '#1f5fc4', c8: '#7b3fd1', c4: '#b35300', c2: '#7a4e2a', c1: '#5d636e', cF: '#806500'}
};
const G6PG_NAME = {c3: 'Terz', c5: 'Quinte', c6: 'Sexte', c8: 'Oktave', c4: 'Quarte', c2: 'Sekunde/Septime', c1: 'Unisono', cF: 'frei'};
const g6pgPal = () => (document.documentElement.dataset.theme === 'light' ? G6PG_PAL.light : G6PG_PAL.dark);
// Halbtöne → Stufen (v1 kennt nur iv): kleine/große Sekunde 1, Terz 2, Quarte 3 (Tritonus 3), Quinte 4, Sexte 5, Septime 6, je Oktave 7
function g6pgSemiSteps(iv) { const s = Math.abs(Math.round(iv)), o = Math.floor(s / 12), r = s % 12; return Math.sign(iv) * (o * 7 + [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6][r]); }
// Stufen D (mit Oktaven, D = d + 7·o) → Farbe/Ziffer
function g6pgCls(D) {
  const a = Math.abs(D | 0); if (a === 0) return {c: 'c1', dig: '1'};
  const r = a % 7;
  if (r === 0) return {c: 'c8', dig: '8'};
  if (r === 2) return {c: 'c3', dig: a === 9 ? '10' : '3'};
  if (r === 4) return {c: 'c5', dig: '5'}; if (r === 5) return {c: 'c6', dig: '6'}; if (r === 3) return {c: 'c4', dig: '4'};
  return {c: 'c2', dig: r === 1 ? '2' : '7'};
}
// Rolle (Spec §2.2: st±n, oct±n, ch±n, root-, uni, free, Zusatz /o±n) → Stufen, null = Akkord-Rolle (je Note), 'free'
function g6pgRoleD(role) {
  if (typeof role !== 'string') return null; if (role === 'free') return 'free';
  const m = /^(st|oct|uni)([+-]\d)?(?:\/o([+-]\d))?$/.exec(role); if (!m) return null;
  const n = m[2] ? +m[2] : 0, o = m[3] ? +m[3] : 0;
  return (m[1] === 'st' ? n : m[1] === 'oct' ? 7 * n : 0) + 7 * o;
}
const g6pgNoteD = (v, n) => (n && isNum(n.d) ? n.d + 7 * (isNum(n.o) ? n.o : 0) : g6pgSemiSteps(n && isNum(n.iv) ? n.iv : 0));
// Farbe der Spur an dieser Stelle (Farbfeld, Legenden-Chip): Rolle, sonst häufigstes Intervall (gleich häufig: das kleinere)
function g6pgVoiceCls(v, role) {
  const R = g6pgRoleD(role || (v && v.rule));
  if (R === 'free') return {c: 'cF', dig: '–'};
  if (typeof R === 'number') return g6pgCls(R);
  const cnt = new Map(); for (const n of (v && v.n) || []) { const a = Math.abs(g6pgNoteD(v, n)); cnt.set(a, (cnt.get(a) || 0) + 1); }
  let best = 0, bn = -1; for (const [a, k] of cnt) if (k > bn || (k === bn && a < best)) { best = a; bn = k; }
  return g6pgCls(best);
}
// Spuren der Stelle: v2 aus S.tracks[st].chor.lanes (Name, Stumm), v1 je Stimme
function g6pgTrack(r) { try { if (typeof g6pTrackOf === 'function') return g6pTrackOf(r); } catch (e) {} return r && !r.vox && isNum(r.t) ? r.t : stimmeT(); }
function g6pgLanes(r, a) {
  const c = a && a.chor; if (!c || !Array.isArray(c.voices)) return [];
  const t = c.v === 2 ? S.tracks[g6pgTrack(r)] : null, L = t && t.chor && Array.isArray(t.chor.lanes) ? t.chor.lanes : [];
  return c.voices.map((v, k) => {
    const ln = c.v === 2 ? L.find(z => z && z.id === v.lane) : null, id = c.v === 2 && v.lane ? v.lane : 'v' + k;
    const free = (v.rule || (ln && ln.role)) === 'free', cl = free ? {c: 'cF', dig: '–'} : g6pgVoiceCls(v, ln ? ln.role : v.rule);
    return {k, id, name: (ln && ln.name) || v.name || (free ? 'Gegenstimme' : 'Chor ' + (G6PG_NAME[cl.c] || '')), c: cl.c, dig: cl.dig, free, mute: !!(ln && ln.mute)};
  });
}
// Ton der Chornote: v1 = Lead-Note + iv; v2 = Stufe(n) vom Lead-Ziel in der Tonart der Stelle (+ Oktaven, chromatisch), Rückfall m + iv
function g6pgLeadMap(id) { const ns = g2Notes(id) || [], M = new Map(); for (const n of ns) M.set(tkR6(n.t0), n); return M; }
function g6pgPitch(c, n, L, P, key) {
  if (c.v === 2 && isNum(n.d) && key) {
    const ln = L.get(tkR6(n.t0));
    if (ln) { const tg = Math.round(P ? g2Target(P, ln) : ln.m); return g6Step(tg, n.d, key) + 12 * (isNum(n.o) ? n.o : 0) + (isNum(n.x) ? n.x : 0); }
  }
  return n.m + (isNum(n.iv) ? n.iv : 0);
}
// Prüfsumme der Daten, von denen die Geometrie abhängt (O(Noten), ohne JSON)
function g6pgSig(r, a) {
  const c = a.chor, id = a.take, P = S.takes && S.takes[id] && S.takes[id].pitch; let h = (c.v || 1) * 31 + c.voices.length, s = 0;
  for (const v of c.voices) { h = h * 7 + v.n.length + (v.lane ? v.lane.length : 0) + (v.rule ? v.rule.length * 3 : 0) + (v.take ? 5 : 0);
    for (const n of v.n) s += n.t0 * 1000 + n.t1 * 7 + (n.iv || 0) * 13 + (n.d || 0) * 17 + (n.o || 0) * 19 + (n.x || 0) * 23 + n.m * 3; }
  let ps = 0; if (c.v === 2) { const ns = g2Notes(id) || []; for (const n of ns) ps += (P ? g2Target(P, n) : n.m) * 11 + n.t0 * 3; const k = P && P.key || g2KeyAt(r); ps += k.root * 97 + String(k.scale).length; }
  const ln = g6pgLanes(r, a).map(l => l.id + l.c + l.name + (l.mute ? 1 : 0)).join(',');
  return id + '|' + h + '|' + s.toFixed(3) + '|' + ps.toFixed(3) + '|' + ln;
}
// Geometrie je Stelle: [{k, id, c, dig, t0, t1, p}] + Bereich lo/hi; Cache nach Prüfsumme (Zoomen/Scrollen = Treffer)
function g6pgGeo(r, a) {
  if (!a || !a.chor || !Array.isArray(a.chor.voices) || !a.chor.voices.length) return null;
  const sig = g6pgSig(r, a), ck = (r.vox ? 'v' + r.vox : r.t + ':' + r.s), hit = G6PG.geo.get(ck);
  if (hit && hit.sig === sig) { G6PG.st.geoHit++; return hit; }
  const c = a.chor, P = S.takes && S.takes[a.take] && S.takes[a.take].pitch, key = c.v === 2 ? (P && P.key || g2KeyAt(r)) : null, L = c.v === 2 ? g6pgLeadMap(a.take) : null;
  const lanes = g6pgLanes(r, a), notes = []; let lo = Infinity, hi = -Infinity;
  c.voices.forEach((v, k) => { const ln = lanes[k];
    for (const n of v.n) { const p = g6pgPitch(c, n, L, P, key), cl = ln.free ? {c: 'cF', dig: ''} : g6pgCls(g6pgNoteD(v, n));
      notes.push({k, id: ln.id, c: cl.c, dig: cl.dig, t0: n.t0, t1: n.t1, p}); if (p < lo) lo = p; if (p > hi) hi = p; } });
  const G = {sig, lanes, notes, lo, hi};
  if (G6PG.geo.size > 16) G6PG.geo.clear();
  G6PG.geo.set(ck, G); G6PG.st.geo++;
  return G;
}
// Bild-Puffer je Ansicht (Noten-Editor bzw. Marken-Editor): Offscreen-Canvas in Gerätepixeln
function g6pgImg(E, key, Wp, Hp, dpr, draw) {
  let B = E.g6b; const W = Math.round(Wp * dpr), H = Math.round(Hp * dpr);
  if (B && B.key === key && B.cv.width === W && B.cv.height === H) { G6PG.st.imgHit++; return B; }
  if (!B) B = E.g6b = {cv: document.createElement('canvas'), key: null, hit: []};
  if (B.cv.width !== W || B.cv.height !== H) { B.cv.width = W; B.cv.height = H; }
  const g = B.cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  B.hit = []; draw(g, B.hit); B.key = key; G6PG.st.img++;
  return B;
}
// Hervorhebung beim Selbst-Singen: die Spur der scharfen Stimme dieser Stelle
function g6pgHl(r, G) { const A = G6.arm; if (!A || !G || r.vox || A.t !== r.t || A.s !== r.s) return null; const l = G.lanes[A.k]; return l ? l.id : null; }
// Noten-Editor: Schatten (hinter den Lead-Blöcken). lead = Lead-Noten grau, wenn eine Chorstimme bearbeitet wird
function g6pgPaintG2(g, E, x, Wp, Hp, dpr, lead, G0) {
  const G = G0 !== undefined ? G0 : g6pgGeo(E.r, x.a); E.g6hit = null; if (!G) return;
  const pal = g6pgPal(), hl = g6pgHl(E.r, G), hide = [...G6PG.hide].join(','), V = E.vw;
  const key = [G.sig, V.a, V.W, Wp, Hp, dpr, E.lo, E.rowH.toFixed(4), hide, hl, E.voice, lead ? lead.sig : ''].join('|');
  const B = g6pgImg(E, key, Wp, Hp, dpr, (q, hit) => {
    const X = E.X, Y = E.Y, h = Math.max(4, E.rowH - 2);
    if (lead) { q.fillStyle = 'rgba(150,158,172,.30)'; for (const n of lead.ns) { const x0 = X(n.t0), x1 = X(n.t1); if (x1 < 0 || x0 > Wp) continue; q.fillRect(x0, Y(n.p) - h / 2, Math.max(2, x1 - x0), h); hit.push({k: -1, x0, x1, y: Y(n.p), h}); } }
    q.font = WP.font || '600 10px sans-serif';
    for (const n of G.notes) {
      if (n.k === E.voice || G6PG.hide.has(n.id)) continue;
      const x0 = X(n.t0), x1 = X(n.t1); if (x1 < 0 || x0 > Wp) continue;
      const y = Y(n.p), w = Math.max(2, x1 - x0), col = pal[n.c], strong = hl == null || hl === n.id;
      q.globalAlpha = hl == null ? .34 : strong ? .62 : .12; q.fillStyle = col; q.fillRect(x0, y - h / 2, w, h);
      q.globalAlpha = hl == null ? .9 : strong ? 1 : .25; q.strokeStyle = col; q.lineWidth = strong && hl != null ? 2 : 1; q.strokeRect(x0 + .5, y - h / 2 + .5, w - 1, h - 1);
      if (n.dig && w > 12 && h >= 9) { q.fillStyle = col; q.fillText(n.dig, x0 + 2, y + 3.5, Math.max(8, w - 3)); }
      q.globalAlpha = 1;
      hit.push({k: n.k, x0, x1, y, h});
    }
  });
  g.drawImage(B.cv, 0, 0, Wp, Hp); E.g6hit = B.hit;
}
// Marken-/Wellen-Editor: dünne farbige Tonhöhenlinien über der Welle (Band oben, Ton → Höhe nach dem Bereich der Stelle)
function g6pgPaintWp(g, E, x, Wp, Hp, dpr) {
  const G = g6pgGeo(E.r, x.a); if (!G || !G.notes.length) return;
  const pal = g6pgPal(), hl = g6pgHl(E.r, G), hide = [...G6PG.hide].join(','), V = E.vw;
  const key = [G.sig, V.a, V.W, Wp, Hp, dpr, hide, hl].join('|');
  const B = g6pgImg(E, key, Wp, Hp, dpr, q => {
    const lo = G.lo - 1, hi = Math.max(G.hi + 1, lo + 6), y0 = 16, y1 = Hp * .9, Y = p => y1 - (p - lo) / (hi - lo) * (y1 - y0), X = E.X;
    q.font = WP.font || '600 10px sans-serif';
    for (const n of G.notes) {
      if (G6PG.hide.has(n.id)) continue; const x0 = X(n.t0), x1 = X(n.t1); if (x1 < 0 || x0 > Wp) continue;
      const y = Math.round(Y(n.p)), col = pal[n.c], strong = hl == null || hl === n.id;
      q.globalAlpha = hl == null ? .95 : strong ? 1 : .3; q.fillStyle = col; q.fillRect(x0, y - 1, Math.max(2, x1 - x0), strong && hl != null ? 3 : 2);
      if (n.dig && x1 - x0 > 14) q.fillText(n.dig, x0 + 1, y - 3);
      q.globalAlpha = 1;
    }
  });
  g.drawImage(B.cv, 0, 0, Wp, Hp);
}
// Lead-Noten (grau) für den Noten-Editor einer Chorstimme
function g6pgLeadNs(E) {
  const id = E.id, ns = g2Notes(id) || [], P = S.takes && S.takes[id] && S.takes[id].pitch;
  const out = ns.map(n => ({t0: n.t0, t1: n.t1, p: P ? g2Target(P, n) : n.m})); let s = 0; for (const n of out) s += n.p * 3 + n.t0;
  return {ns: out, sig: out.length + ':' + s.toFixed(3)};
}
// Tipp auf einen Schatten (Noten-Editor): diese Stimme öffnen (grauer Lead im Chor-Editor: den Lead öffnen)
function g6pgTap(E, cx, cy) {
  for (const b of E.g6hit || []) if (cx >= b.x0 - 4 && cx <= b.x1 + 4 && Math.abs(cy - b.y) <= Math.max(10, b.h / 2 + 3)) {
    const r = E.r; haptic('tick'); setTimeout(() => g2Open(r, b.k >= 0 ? {voice: b.k} : undefined), 0); return true;
  }
  return false;
}
/* ---------- Legende (Chip je Chor-Spur: Farbfeld + Ziffer, Name, Auge, Solo) ---------- */
const G6PG_EYE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M2 12c2.6-4.4 6-6.6 10-6.6S19.4 7.6 22 12c-2.6 4.4-6 6.6-10 6.6S4.6 16.4 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/><path class="g6pgx" d="M4 20L20 4" stroke="currentColor" stroke-width="2.2"/></svg>';
function g6pgSoloId(r, a) { const c = a && a.chor; if (!c || G6.solo == null || G6.solo < 0) return null; const l = g6pgLanes(r, a)[G6.solo]; return l ? l.id : null; }
function g6pgLegend(E, host, before) { E.legHost = host; E.legBefore = before; g6pgLegSync(E); }
function g6pgLegMake(E) {
  const d = el('div', 'g6pgleg pan-x'); d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Chorstimmen');
  E.legHost.insertBefore(d, E.legBefore || E.legHost.firstChild); E.leg = d; E.legSt = null;
  d.addEventListener('click', e => {
    const bt = e.target.closest('button[data-a]'); if (!bt) return; const ed = G2.ed && G2.ed.leg === d ? G2.ed : WP.ed && WP.ed.leg === d ? WP.ed : null; if (!ed) return;
    const a = bt.dataset.a, id = bt.dataset.id, k = +bt.dataset.k;
    if (a === 'eye') { if (G6PG.hide.has(id)) G6PG.hide.delete(id); else G6PG.hide.add(id); haptic('tick'); }
    else if (a === 'solo') { g6pgSoloLane(ed.r, k); }
    else if (a === 'lq') { G6PG.leadQ = !G6PG.leadQ; g6LeadMute(); toast(G6PG.leadQ ? 'Lead leise mithören (−12 dB)' : 'Lead stumm'); }
    if (ed === G2.ed) g2Paint(); else wpPaint();
  });
}
function g6pgLegSync(E) {
  if (!E || !E.legHost) return; const x = tkRef(E.r), has = !!(x && x.a.chor && Array.isArray(x.a.chor.voices) && x.a.chor.voices.length);
  if (!has) { if (E.leg) { E.leg.remove(); E.leg = null; } return; }
  if (!E.leg) g6pgLegMake(E); const d = E.leg;
  const L = g6pgLanes(E.r, x.a), so = g6pgSoloId(E.r, x.a), arm = G6.arm && !E.r.vox && G6.arm.t === E.r.t && G6.arm.s === E.r.s;
  const st = L.map(l => l.id + l.c + l.dig + l.name + (G6PG.hide.has(l.id) ? 'h' : '') + (so === l.id ? 's' : '') + (E.voice === l.k ? 'e' : '')).join(',') + (arm ? '|a' + G6.arm.k + G6PG.leadQ : '');
  if (st === E.legSt) return; E.legSt = st;
  d.innerHTML = (arm ? `<button class="rb g6pglq${G6PG.leadQ ? ' on' : ''}" data-a="lq" aria-pressed="${G6PG.leadQ}" aria-label="Lead leise mithören">Lead leise</button>` : '') + L.map(l => `<span class="g6pgc${G6PG.hide.has(l.id) ? ' off' : ''}${E.voice === l.k ? ' cur' : ''}" style="--cc:var(--chor${l.c.slice(1)})"><i class="g6pgsw">${esc(l.dig)}</i><b>${esc(l.name)}</b>` +
    `<button class="rb g6pgeye" data-a="eye" data-id="${esc(l.id)}" data-k="${l.k}" aria-pressed="${G6PG.hide.has(l.id) ? 'false' : 'true'}" aria-label="${esc(l.name)} zeigen">${G6PG_EYE}</button>` +
    `<button class="rb g6pgso${so === l.id ? ' on' : ''}" data-a="solo" data-id="${esc(l.id)}" data-k="${l.k}" aria-pressed="${so === l.id}" aria-label="${esc(l.name)} solo">S</button></span>`).join('');
}
// Solo über die Legende (v2: g6pSolo der Spur, falls G6+c/e es liefert; sonst das Solo von G6 v1 je Stimme)
function g6pgSoloLane(r, k) {
  const x = tkRef(r); if (!x || !x.a.chor) return;
  const l = g6pgLanes(r, x.a)[k];
  if (x.a.chor.v === 2 && typeof g6pSolo === 'function') { try { g6pSolo(l.id); } catch (e) { logErr(e); } }
  else g6Solo(k);
  G6PG.legSolo = G6.solo != null;
}
// Editor zu: ein Solo aus der Legende endet (Selbst-Singen-Scharf bleibt, bis aufgenommen oder abgebrochen wird)
function g6pgClosed() {
  if (!G6PG.legSolo) return; G6PG.legSolo = false;
  if (G6.arm) return;
  if (typeof g6pSolo === 'function' && G6.solo == null) { try { g6pSolo(null); } catch (e) {} }
  if (G6.solo != null) g6Solo(G6.solo);
}
/* ---------- „Selbst singen“ v2 ---------- */
// Lead-Pegel während Solo/Selbst singen: scharf + „Lead leise“ = −12 dB, sonst stumm (Solo)
function g6pgLeadG(r) { return G6.arm && G6PG.leadQ && G6.solo === G6.arm.k && !r.vox && G6.arm.t != null ? r.G * G6PG_LEADQ : 0; }
function g6pgSing(r, k, o) {
  o = o || {}; if (o.leadQ != null) G6PG.leadQ = !!o.leadQ;
  const ok = g6Arm(r, k); if (!ok) return false;
  G6PG.legSolo = false; g6LeadMute();
  if (G2.ed && G2.ed.leg) { G2.ed.legSt = null; g2Paint(); } if (WP.ed && WP.ed.leg) { WP.ed.legSt = null; wpPaint(); }
  return true;
}
/* ---------- Test-API ---------- */
const G6PG_API = {
  g6pgCls: D => g6pgCls(D), g6pgSemi: iv => g6pgCls(g6pgSemiSteps(iv)), g6pgRole: (role, v) => g6pgVoiceCls(v || {n: []}, role),
  g6pgPal: () => deep(G6PG_PAL),
  g6pgLanes: r => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r); return x ? g6pgLanes(r, x.a) : null; },
  g6pgGeo: r => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), G = x && g6pgGeo(r, x.a); return G ? {lo: G.lo, hi: G.hi, notes: deep(G.notes), lanes: deep(G.lanes)} : null; },
  g6pgHit: () => { const E = G2.ed; if (!E || !E.cv) return null; const rc = E.cv.getBoundingClientRect(); return (E.g6hit || []).map(b => ({k: b.k, x0: rc.left + b.x0, x1: rc.left + b.x1, y: rc.top + b.y, h: b.h})); },
  g6pgHide: (id, on) => { if (on) G6PG.hide.add(id); else G6PG.hide.delete(id); if (G2.ed) g2Paint(); if (WP.ed) wpPaint(); return [...G6PG.hide]; },
  g6pgSing: (r, k, o) => g6pgSing(r || {t: stimmeT(), s: R.selS}, k, o),
  g6pgLeadQ: v => { G6PG.leadQ = !!v; g6LeadMute(); return G6PG.leadQ; },
  g6pgInfo: () => ({st: Object.assign({}, G6PG.st), hide: [...G6PG.hide], legSolo: G6PG.legSolo, leadQ: G6PG.leadQ, solo: G6.solo, arm: G6.arm ? Object.assign({}, G6.arm) : null,
    lead: AU.ctx ? TK.src.filter(r => !r.dead && r.aud && r.aud.chor).map(r => ({G: r.G, g: r.g.gain.value})) : []}),
  g6pgReset: () => { G6PG.st = {geo: 0, geoHit: 0, img: 0, imgHit: 0}; return true; }
};
/* G6PG-END */
