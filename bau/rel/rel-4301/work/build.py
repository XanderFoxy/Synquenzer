# 4.30.1 – baut rel-4301/index.html aus R-4300.html (alle Änderungen als exakte Ersetzungen, je genau 1 Treffer)
# Aufruf: python3 build.py <R-4300.html> <psh.js> <ziel.html>
import sys
src, pshjs, dst = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    assert n == cnt, (n, old[:140])
    s = s.replace(old, new)

# ---------------- A: Logo-Abspann deckungsgleich ----------------
rep("const VERSION = '4.30.0';", "const VERSION = '4.30.1';")
rep("""   Beide Wege: WebCodecs (Bild für Bild per Suchen im Logo) und Aufnahme in Echtzeit (Logo läuft mit).
   Videolänge = Song + 0,5 s + Logo + 0,5 s. */""",
"""   Beide Wege: WebCodecs (Bild für Bild per Suchen im Logo) und Aufnahme in Echtzeit (Logo läuft mit).
   4.30.1 (Xander 01.11.: „Beide Videos müssen deckungsgleich enden“): das Logo liegt IM Video, nichts wird angehängt. Videolänge =
   Song/Bereich samt Ausklang wie ohne Logo; das Logo beginnt Logo-Länge vor dem Ende (vom Ende zurückgerechnet), seine letzte
   Sekunde ist die letzte Sekunde des Videos. Im selben Moment, in dem es sich zu schreiben beginnt, blendet das laufende Hauptbild
   flächig in 2 s auf Schwarz (linear, wie eine Abblende im Schnitt), danach Schwarz bis zum Ende; das Logo einmal mittig per
   Luma-Key wie bisher. Ist das Video kürzer als das Logo, läuft das Logo ab Bild 1 mit Versatz in seine Animation (Ende bleibt
   deckungsgleich; dann blendet es in 0,25 s ein). Der Ton bleibt unverändert (kein Ausblenden, keine Stille angehängt).
   WebCodecs: Ende = Bildzahl / 30 (das letzte Bild zeigt das letzte Logo-Bild); Aufnahme in Echtzeit: Ende = Songlänge. */""")
rep("const VVL_FILES = ['medien/abspann-logo.mp4', 'medien/abspann-logo.mov'], VVL_FADE = 1, VVL_AT = .5, VVL_IN = .5, VVL_END = .5, VVL_SIZE = .6, VVL_K0 = .05, VVL_K1 = .2;   // AT: das Logo setzt bei 50 % Abdunklung ein; K0…K1: weiche Luma-Schwelle",
    "const VVL_FILES = ['medien/abspann-logo.mp4', 'medien/abspann-logo.mov'], VVL_FADE = 2, VVL_IN = .25, VVL_SIZE = .6, VVL_K0 = .05, VVL_K1 = .2;   // 4.30.1: FADE = Abblende ab Logo-Start; IN nur bei Versatz (Video kürzer als Logo); K0…K1: weiche Luma-Schwelle")
rep("""  return {v, L: L.dur, own: L.own, name: L.name, songSec, extra: Math.max(VVL_FADE, VVL_AT + L.dur) + VVL_END};
}""", """  return {v, L: L.dur, own: L.own, name: L.name, songSec, at: null, end: null};   // 4.30.1: at/end (Logo-Start, Videoende) setzt der Kodier-Weg
}
// 4.30.1: the logo's start in video time for a video that ends at E (vom Ende zurückgerechnet; kürzer als das Logo: 0)
const vvlStartOf = (ol, E) => Math.max(0, E - ol.L);""")
rep("""// one picture of the Abspann at video time t (> r.dur): WebCodecs (the logo frame by seeking) …
async function vvlFrame(g, W, H, job, r, t) {
  const ol = job.outro, u = t - r.dur, tau = u - VVL_AT;
  if (u < VVL_FADE) { vvDraw(g, W, H, job.view, vvStateAt(r, r.dur), job.rt); vvlDark(g, W, H, u / VVL_FADE); } else vvlDark(g, W, H, 1);
  if (tau >= 0 && tau < ol.L) { await vvlSeek(ol.v, tau + 1e-3); vvlLogo(g, W, H, ol.v, tau / VVL_IN); }
}
// … and in real time (the logo plays along; after a pause it is set to the right place again)
function vvlFrameRT(g, W, H, job, r, t) {
  const ol = job.outro, v = ol.v, u = t - r.dur, tau = u - VVL_AT;
  if (u < VVL_FADE) { vvDraw(g, W, H, job.view, vvStateAt(r, r.dur), job.rt); vvlDark(g, W, H, u / VVL_FADE); } else vvlDark(g, W, H, 1);
  if (tau < 0) return;
  if (tau < ol.L) {
    if (!v.ended) {
      try { if (Math.abs(v.currentTime - tau) > .25) v.currentTime = Math.min(tau, ol.L - .001); } catch (e) {}
      if (v.paused) { const q = v.play(); if (q && q.catch) q.catch(() => {}); }
    }
    if (v.readyState >= 2) vvlLogo(g, W, H, v, tau / VVL_IN);
  } else if (!v.paused) v.pause();
}
function vvlRewind(ol) { if (!ol) return; try { ol.v.pause(); ol.v.currentTime = 0; } catch (e) {} }""",
"""// one picture at video time t ≥ ol.at (4.30.1: inside the video, which ends at ol.end): the main picture keeps running and fades
// to black from the logo start (2 s), the logo on top; WebCodecs (the logo frame by seeking) …
async function vvlFrame(g, W, H, job, r, t) {
  const ol = job.outro, u = t - ol.at, tau = t - ol.end + ol.L;    // tau: logo time (its end = the video end)
  if (u < VVL_FADE) { vvDraw(g, W, H, job.view, vvStateAt(r, Math.min(r.dur, t)), job.rt); vvlDark(g, W, H, u / VVL_FADE); } else vvlDark(g, W, H, 1);
  if (tau >= 0) { await vvlSeek(ol.v, Math.min(tau, ol.L - 1e-3) + 1e-3); vvlLogo(g, W, H, ol.v, ol.L > ol.end ? u / VVL_IN : 1); }
}
// … and in real time (the logo plays along from its place; after a pause it is set to the right place again)
function vvlFrameRT(g, W, H, job, r, t) {
  const ol = job.outro, v = ol.v, u = t - ol.at, tau = t - ol.end + ol.L;
  if (u < VVL_FADE) { vvDraw(g, W, H, job.view, vvStateAt(r, Math.max(0, Math.min(r.dur, t))), job.rt); vvlDark(g, W, H, Math.max(0, u) / VVL_FADE); } else vvlDark(g, W, H, 1);
  if (tau < 0) return;
  if (tau < ol.L) {
    if (!v.ended) {
      try { if (Math.abs(v.currentTime - tau) > .25) v.currentTime = Math.min(tau, ol.L - .001); } catch (e) {}
      if (v.paused) { const q = v.play(); if (q && q.catch) q.catch(() => {}); }
    }
  } else if (!v.paused) v.pause();
  if (v.readyState >= 2) vvlLogo(g, W, H, v, ol.L > ol.end ? u / VVL_IN : 1);
}
function vvlRewind(ol, at) { if (!ol) return; try { ol.v.pause(); ol.v.currentTime = at || 0; } catch (e) {} }""")
rep("""      const nF = r ? Math.max(1, Math.round((r.dur + (job.outro ? job.outro.extra : 0)) * fps)) : Infinity;   // VV-LOGO: + Abblende, Logo, Schwarz
      if (f >= nF) break;
      // VV-LOGO: with an Abspann the frames behind the song wait for the trimmed length (the Ausklang end is known only then)
      if (!r && (f / fps > live.t - .05 || (job.outro && f / fps >= job.outro.songSec - .1))) { await Promise.race([rP, new Promise(res => setTimeout(res, 8))]); continue; }""",
"""      const nF = r ? Math.max(1, Math.round(r.dur * fps)) : Infinity;   // VV-LOGO 4.30.1: the logo lies inside the song length (nothing appended)
      if (job.outro && r && job.outro.end == null) { job.outro.end = nF / fps; job.outro.at = vvlStartOf(job.outro, job.outro.end); }   // the end in whole frames: the last frame = the last logo frame
      if (f >= nF) break;
      // VV-LOGO: with a logo the frames from (song − logo) on wait for the trimmed length (the Ausklang end, hence the logo start, is known only then)
      if (!r && (f / fps > live.t - .05 || (job.outro && f / fps >= job.outro.songSec - job.outro.L - .1))) { await Promise.race([rP, new Promise(res => setTimeout(res, 8))]); continue; }""")
# Befund 4.30.1: ohne Logo konnte die Bildspur länger werden als der Ton (Bilder hinter dem Song wurden schon gezeichnet, während der
# Offline-Render noch den bis zu 10 s langen Ausklang rechnete; erst danach steht die gekürzte Länge fest) – jetzt warten auch ohne Logo die
# Bilder ab Songende auf die gekürzte Länge (wie bisher schon mit Logo)
rep("""      if (!r && (f / fps > live.t - .05 || (job.outro && f / fps >= job.outro.songSec - job.outro.L - .1))) { await Promise.race([rP, new Promise(res => setTimeout(res, 8))]); continue; }""",
    """      if (!r && (f / fps > live.t - .05 || f / fps >= (job.outro ? job.outro.songSec - job.outro.L : live.songSec) - .1)) { await Promise.race([rP, new Promise(res => setTimeout(res, 8))]); continue; }   // 4.30.1: auch ohne Logo – nie Bilder hinter dem gekürzten Ende (sonst Bildspur länger als der Ton)""")
rep("""      if (S.song) { const rg = o.range || vvRange(false); live.est = (rg.b - rg.a) * 4 * spb() + 2; }""",
    """      if (S.song) { const rg = o.range || vvRange(false); live.est = (rg.b - rg.a) * 4 * spb() + 2; live.songSec = (rg.b - rg.a) * 4 * spb(); }   // 4.30.1: songSec – Bilder ab hier warten auf die gekürzte Länge""")
rep("""      if (job.outro && r && f / fps >= r.dur) await vvlFrame(g, W, H, job, r, f / fps);""",
    """      if (job.outro && r && f / fps >= job.outro.at) await vvlFrame(g, W, H, job, r, f / fps);""")
rep("""    const src = {length: A0.length}, aLen = A0.length + (job.outro ? Math.round(job.outro.extra * asr) : 0);   // VV-LOGO: Stille unter dem Abspann""",
    """    const src = {length: A0.length}, aLen = A0.length;               // VV-LOGO 4.30.1: der Ton bleibt, wie er ist (nichts angehängt)""")
rep("""  const ol = job.outro, Dt = r.dur + (ol ? ol.extra : 0); vvlRewind(ol);   // VV-LOGO: the recording runs on through the Abspann (the sound is silent there)""",
    """  const ol = job.outro, Dt = r.dur; if (ol) { ol.end = r.dur; ol.at = vvlStartOf(ol, r.dur); } vvlRewind(ol, ol ? Math.max(0, ol.L - r.dur) : 0);   // VV-LOGO 4.30.1: the logo ends with the song (nothing appended)""")
rep("""  let cz = null; if (ol && c.createConstantSource) { try { cz = c.createConstantSource(); cz.offset.value = 0; cz.connect(dst); cz.start(t0); } catch (e) { cz = null; } }   // VV-LOGO: the sound track runs on (silent) under the Abspann
""", "")
rep("""      if (fi !== fl) { fl = fi; if (ol && t > r.dur) vvlFrameRT(g, W, H, job, r, t); else""",
    """      if (fi !== fl) { fl = fi; if (ol && t >= ol.at) vvlFrameRT(g, W, H, job, r, t); else""")
rep("""  if (cz) { try { cz.stop(); } catch (e) {} try { cz.disconnect(); } catch (e) {} }
""", "")
rep("""W, H, dur: r.dur + (outro ? outro.extra : 0), songSec:""", """W, H, dur: r.dur, songSec:""")
rep("""      logo: outro ? {name: outro.name, own: outro.own, at: r.dur, fade: VVL_FADE, in: r.dur + VVL_AT, len: outro.L, end: VVL_END} : null,   // VV-LOGO (dur = ganze Videolänge)""",
    """      logo: outro ? {name: outro.name, own: outro.own, at: outro.at, fade: VVL_FADE, len: outro.L, off: Math.max(0, outro.L - outro.end), end: outro.end} : null,   // VV-LOGO 4.30.1: at = Logo-Start (Videozeit), end = Videoende = Logo-Ende, off = Versatz in die Animation""")

# ---------------- B: Blatt-Rahmen (Kopf, Ablegen, Transport) ----------------
js = open(pshjs, encoding='utf-8').read()
rep("""function segHTML(id, opts, cur) {""", js + """function segHTML(id, opts, cur) {""")
rep("""function openPop(anchor, build, opts) {
  closePop(); UI.shield = null;          // a newly opened layer is what the next tap is meant for
  opts = opts || {};
  const L = EL.popLayer, p = el('div', 'pop');
  build(p); L.appendChild(p); L.classList.add('open');""",
"""function openPop(anchor, build, opts) {
  opts = opts || {};
  if (opts.sheet && PSH.dock) pshDockClose();                     // 4.30.1: ein neues hohes Blatt ersetzt ein abgelegtes
  closePop(); UI.shield = null;          // a newly opened layer is what the next tap is meant for
  const L = EL.popLayer, p = el('div', 'pop');
  if (opts.sheet) pshMake(p, opts.sheet);                         // 4.30.1: Kopf mit ✕, Ablegen, Transport
  build(p); if (opts.sheet) pshKeep(p); L.appendChild(p); L.classList.add('open');""")
rep("""  UI.pop = {el: p, onClose: opts.onClose, name: opts.name};
  return p;
}""", """  UI.pop = {el: p, onClose: opts.onClose, name: opts.name, sheet: opts.sheet || null};
  return p;
}""")
rep("""function popFit(p) {
  if (!p || !p.isConnected) return;
  const vh = window.innerHeight, vw = window.innerWidth, ph = p.offsetHeight, pw = p.offsetWidth;
  const top = parseFloat(p.style.top) || 8, left = parseFloat(p.style.left) || 8;
  if (top + ph > vh - 8) p.style.top = Math.round(Math.max(8, vh - ph - 8)) + 'px';
  if (left + pw > vw - 8) p.style.left = Math.round(Math.max(8, vw - pw - 8)) + 'px';
}""", """function popFit(p) {
  if (!p || !p.isConnected || p.classList.contains('abg')) return;   // 4.30.1: die abgelegte Leiste sitzt per CSS unten
  if (p._psh) pshKeep(p);
  const sa = p._psh ? pshSafe() : {t: 0, r: 0, b: 0, l: 0};          // 4.30.1: hohe Blätter halten die sicheren Ränder ein (Kopf nie unter der Notch)
  const vh = window.innerHeight, vw = window.innerWidth, ph = p.offsetHeight, pw = p.offsetWidth;
  const top = parseFloat(p.style.top) || 8, left = parseFloat(p.style.left) || 8;
  if (top + ph > vh - 8 - sa.b) p.style.top = Math.round(Math.max(8 + sa.t, vh - ph - 8 - sa.b)) + 'px';
  else if (top < 8 + sa.t) p.style.top = Math.round(8 + sa.t) + 'px';
  if (left + pw > vw - 8 - sa.r) p.style.left = Math.round(Math.max(8 + sa.l, vw - pw - 8 - sa.r)) + 'px';
}""")
rep("""  p.style.left = Math.round(x) + 'px'; p.style.top = Math.round(Math.max(8, y)) + 'px';
  UI.pop = {el: p, onClose: opts.onClose, name: opts.name, sheet: opts.sheet || null};""", """  if (opts.sheet) { const sa = pshSafe(); x = clamp(x, 8 + sa.l, Math.max(8 + sa.l, vw - pw - 8 - sa.r)); y = Math.max(y, 8 + sa.t); }   // 4.30.1
  p.style.left = Math.round(x) + 'px'; p.style.top = Math.round(Math.max(8, y)) + 'px';
  UI.pop = {el: p, onClose: opts.onClose, name: opts.name, sheet: opts.sheet || null};""")
rep("""  const p = UI.pop; UI.pop = null;
  if (UI.lastUp && UI.lastUp.pop && performance.now() - UI.lastUp.t < 300) shieldTap();   // closed by a tap on one of its items
  try { p.el.remove(); } catch (e) {}""", """  const p = UI.pop; UI.pop = null;
  if (UI.lastUp && UI.lastUp.pop && performance.now() - UI.lastUp.t < 300) shieldTap();   // closed by a tap on one of its items
  try { if (p.el._pshMo) p.el._pshMo.disconnect(); p.el.remove(); } catch (e) {}""")
# Transport: Schleife nur für dieses Abspielen (R.loopX)
rep("""  if (o.next && R.playing && !R.songPlay) return songPlayStartAt(fromBar, nextBarFromAudible());
  if (R.playing) stop();
  carrierSave();
  const bar0 = clamp(fromBar | 0, 0, song.bars - 1);""",
"""  if (o.next && R.playing && !R.songPlay) { R.loopX = null; return songPlayStartAt(fromBar, nextBarFromAudible()); }
  if (R.playing) stop();
  carrierSave();
  const bar0 = clamp(fromBar | 0, 0, song.bars - 1);
  R.loopX = o.loopX && isNum(o.loopX.a) && isNum(o.loopX.b) && o.loopX.b > o.loopX.a ? {on: !!o.loopX.on, a: o.loopX.a | 0, b: Math.min(song.bars, o.loopX.b | 0)} : null;   // 4.30.1: Blatt-Transport (nur dieses Abspielen)""")
rep("""  R.songPlay = null; R.songEndBeat = null; R.songOverride.fill(false); R.carrierLive = false;
  if (TK.src.length && AU.ctx) tkVoxCut(AU.ctx.currentTime + .004);   // VS3""",
"""  R.songPlay = null; R.songEndBeat = null; R.songOverride.fill(false); R.carrierLive = false; R.loopX = null;
  if (TK.src.length && AU.ctx) tkVoxCut(AU.ctx.currentTime + .004);   // VS3""")
rep("""      const off = sp.off, lp = song.loop, sr = R.songRec, recOver = !!(sr && sr.over);""",
"""      const off = sp.off, sr = R.songRec, lx = R.loopX && !sr ? R.loopX : null, lp = lx || song.loop, recOver = !!(sr && sr.over);   // 4.30.1: lx = Schleife/Ende des Blatt-Transports""")
rep("""      let E = looping ? lp.b * 4 : song.bars * 4;
      if (looping && b0 - off > E + 1e-6) E = song.bars * 4;""",
"""      let E = looping ? lp.b * 4 : lx ? lx.b * 4 : song.bars * 4;
      if (looping && b0 - off > E + 1e-6) E = song.bars * 4;""")
rep("""      if (!(loopAll(song) && !recOver)) {
        // a range (or a take over the song): every track jumps to what the song plays at the loop start, in phase with its""",
"""      if (lx || !(loopAll(song) && !recOver)) {
        // a range (or a take over the song): every track jumps to what the song plays at the loop start, in phase with its""")
rep("songEndBeat: null, melRec: null,", "songEndBeat: null, melRec: null, loopX: null,")
# Blätter an den Rahmen anschließen
rep("""function g6Sheet(r, anchor) {
  const x = tkRef(r); if (!x || !tkAudioOk()) return false;
  G6.sheet = r;
  G6PE.kl = false; G6PE.dot = null; G6PE.add = false; G6PE.ren = null;""",
"""const pshSame = (a, b) => !!(a && b && (a.vox ? a.vox === b.vox : !b.vox && a.t === b.t && a.s === b.s));
function g6Sheet(r, anchor) {
  const x = tkRef(r); if (!x || !tkAudioOk()) return false;
  if (pshReopen('chor', pshSame(G6.sheet, r))) return true;       // 4.30.1: abgelegt → zurückholen (sonst geht das abgelegte zu)
  G6.sheet = r;
  G6PE.kl = false; G6PE.dot = null; G6PE.add = false; G6PE.ren = null; G6PE.dupAsk = false;""")
rep("""  }, {name: 'chor', onClose: () => { G6.sheet = null; G6PE.live = null; G6PE.ren = null; if (G6.solo != null) g6Solo(G6.solo); }});""",
"""  }, {name: 'chor', sheet: {title: ab => { const y = ab && G6.sheet && tkRef(G6.sheet); return 'Chor' + (y ? ' · ' + y.label : ''); }, ref: () => G6.sheet, valid: () => !!g6peCur(), repaint: p => g6SheetPaint(p)},   // 4.30.1: Kopf
    onClose: () => { G6.sheet = null; G6PE.live = null; G6PE.ren = null; G6PE.dupAsk = false; if (G6.solo != null) g6Solo(G6.solo); }});""")
rep("""  if (!tkRef(r)) return false;
  TK.sheet = r;
  openPop(anchor || EL.top, p => { p.classList.add('tksheet'); guardTouch(p); tkSheetPaint(p);""",
"""  if (!tkRef(r)) return false;
  if (pshReopen('takes', pshSame(TK.sheet, r))) return true;      // 4.30.1
  TK.sheet = r;
  openPop(anchor || EL.top, p => { p.classList.add('tksheet'); guardTouch(p); tkSheetPaint(p);""")
rep("""  }, {name: 'takes', onClose: () => { TK.dupAsk = false; clSheetClosed(); }});""",
"""  }, {name: 'takes', sheet: {title: ab => { const y = ab && TK.sheet && tkRef(TK.sheet); return 'Takes' + (y ? ' · ' + y.label : ''); }, ref: () => TK.sheet, valid: () => !!(TK.sheet && tkRef(TK.sheet)), repaint: p => tkSheetPaint(p)},   // 4.30.1: Kopf
    onClose: () => { TK.dupAsk = false; clSheetClosed(); }});""")
rep("""  if (UI.pop && UI.pop.name === 'stimme') { stSheetFill(UI.pop.el); return true; }
  const a = anchor || (ST.ui.row && !ST.ui.row.hidden ? ST.ui.row : isLand() ? EL.bMicT : EL.segMic);
  openPop(a, p => { p.classList.add('stpop', 'pan-y'); guardTouch(p); stSheetFill(p); bindStSheet(p); }, {name: 'stimme'});""",
"""  if (UI.pop && UI.pop.name === 'stimme') { stSheetFill(UI.pop.el); return true; }
  if (pshReopen('stimme', true)) return true;                     // 4.30.1
  const a = anchor || (ST.ui.row && !ST.ui.row.hidden ? ST.ui.row : isLand() ? EL.bMicT : EL.segMic);
  openPop(a, p => { p.classList.add('stpop', 'pan-y'); guardTouch(p); stSheetFill(p); bindStSheet(p); }, {name: 'stimme', sheet: {title: () => 'Mikrofon', valid: () => micAvail(), repaint: p => stSheetFill(p)}});   // 4.30.1: Kopf""")
# Chor-Blatt: OK im leeren Blatt, Aufteilen
rep("""  if (d.pe === 'conv') { g6pConvert(r); g6SheetPaint(); return true; }
  if (!X.c || X.c.v !== 2) return false;""",
"""  if (d.pe === 'conv') { g6pConvert(r); g6SheetPaint(); return true; }
  if (d.pe === 'x') { closePop(); return true; }                  // 4.30.1: [OK] schließt auch das leere Blatt (vorher ohne Wirkung)
  // 4.30.1: Aufteilen direkt hier – [Als Chor-Stimme duplizieren] → [Diese Stelle] / [Ganze Spur]; das Blatt bleibt offen
  if (d.pe === 'dup' || d.pe === 'dupx') { G6PE.dupAsk = d.pe === 'dup'; g6SheetPaint(); return true; }
  if (d.pe === 'dup1' || d.pe === 'dupall') { G6PE.dupAsk = false; g6pDuplizieren(r, d.pe === 'dupall', {stay: true}); G6PE.add = false; g6SheetPaint(); return true; }
  if (!X.c || X.c.v !== 2) return false;""")
rep("""    h += `<div class="small g6pe-hint">Ein Tipp auf einen Stil setzt den ganzen Chor: Stimmen, Doppel, Panorama, Abstand zum Lead, Hall, Echo und Klang. Danach hat jede Stimme ihre eigene Spur.</div>` +
      `<div class="savrow"><button class="mbtn rb" data-pe="x">OK</button></div>`;""",
"""    h += `<div class="small g6pe-hint">Ein Tipp auf einen Stil setzt den ganzen Chor: Stimmen, Doppel, Panorama, Abstand zum Lead, Hall, Echo und Klang. Danach hat jede Stimme ihre eigene Spur.</div>` +
      g6peDupHtml(a) + `<div class="savrow"><button class="mbtn rb" data-pe="x">OK</button></div>`;""")
rep("""  h += `<div class="g6pe-addrow"><button class="mbtn rb" data-pe="add"${G6PE.add ? ' aria-pressed="true"' : ''}${c.voices.length >= G6PE_MAXV ? ' disabled' : ''}>+ Stimme ${G6PE.add ? '▴' : '▾'}</button><button class="mbtn rb" data-pe="del">Chor löschen</button><button class="mbtn rb" data-pe="x">OK</button></div>`;""",
"""  h += `<div class="g6pe-addrow"><button class="mbtn rb" data-pe="add"${G6PE.add ? ' aria-pressed="true"' : ''}${c.voices.length >= G6PE_MAXV ? ' disabled' : ''}>+ Stimme ${G6PE.add ? '▴' : '▾'}</button><button class="mbtn rb" data-pe="del">Chor löschen</button>` +
    g6peDupHtml(a, c.voices.length >= G6PE_MAXV) + `<button class="mbtn rb" data-pe="x">OK</button></div>`;   // 4.30.1: Aufteilen im Blatt (hochkant eigene Zeile darunter, quer in derselben Zeile)""")
rep("""const g6peStTxt = (c, rd) =>""",
"""// 4.30.1: [Als Chor-Stimme duplizieren] im Chor-Blatt (wie im Takes-Blatt: erst die Wahl Diese Stelle / Ganze Spur); grau bei Comping
function g6peDupHtml(a, full) {
  const dis = g6pfComp(a) || full ? ' disabled' : '';
  if (G6PE.dupAsk) return `<div class="g6pe-dup"><button class="mbtn rb" data-pe="dup1"${dis}>Diese Stelle</button><button class="mbtn rb" data-pe="dupall"${g6pfComp(a) ? ' disabled' : ''}>Ganze Spur</button><button class="mbtn rb" data-pe="dupx" aria-label="Abbrechen">✕</button></div>`;
  return `<div class="g6pe-dup one"><button class="mbtn rb" data-pe="dup"${g6pfComp(a) ? ' disabled' : ''}>Als Chor\\u2011Stimme duplizieren</button></div>`;
}
const g6peStTxt = (c, rd) =>""")
rep("""function g6pDuplizieren(r, whole) {""", """function g6pDuplizieren(r, whole, o) {""")
rep("""' – Noten ziehen, dann [⋯] → [Background]');""", """(o && o.stay ? ' – Noten: [♪] in ihrer Zeile, dann [⋯] → [Background]' : ' – Noten ziehen, dann [⋯] → [Background]'));""")
rep("""  if (vo && tkAudioOk()) { closePop(); g2Open(own, {take: vo.take.take}); }
  return ids;""", """  if (vo && tkAudioOk() && !(o && o.stay)) { closePop(); g2Open(own, {take: vo.take.take}); }   // 4.30.1: aus dem Chor-Blatt bleibt das Blatt offen
  return ids;""")
# CSS
anchor = "#popLayer .bd{position:absolute;inset:0;background:var(--backdrop)}\n"
css = r"""/* 4.30.1: hohe Blätter (Chor, Takes, Mikro) – Kopf klebt oben mit ✕, [Ablegen] und Transport; Inhalt scrollt mit dem Finger (nur innen);
   abgelegt: schmale Leiste unten (#pshDock, unter Menü 50 / Video 55, über der App) */
.pop.psh{padding-top:0 !important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;max-height:calc(100% - 16px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))}
.psh-h{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:4px;min-height:52px;box-sizing:border-box;margin:0 calc(-1 * var(--psx,12px)) 6px;padding:6px var(--psx,12px) 2px;background:var(--chassis-2);border-bottom:1px solid var(--line);touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.psh-grip{position:absolute;left:50%;top:4px;width:36px;height:4px;margin-left:-18px;border-radius:2px;background:var(--text-faint);opacity:.7}
.psh-t{flex:1 1 auto;min-width:0;font:700 12px/1.2 var(--font-ui);letter-spacing:.06em;text-transform:uppercase;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.psh-h .psh-b{flex:none;width:44px;min-width:44px;height:44px;padding:0;margin:0;display:inline-flex;align-items:center;justify-content:center;font-size:16px}
.psh-b svg{width:20px;height:20px;display:block}
.psh-dk svg+svg,.pop.psh.abg .psh-dk svg:first-child{display:none}.pop.psh.abg .psh-dk svg+svg{display:block}
.psh-b.psh-lp[aria-pressed=true]{color:var(--amber);box-shadow:inset 0 0 0 1px var(--amber)}
.psh-pl .is{display:none}
#app.playing ~ #popLayer .psh-pl .ip,#app.playing ~ #pshDock .psh-pl .ip{display:none}
#app.playing ~ #popLayer .psh-pl .is,#app.playing ~ #pshDock .psh-pl .is{display:block}
#app.playing ~ #popLayer .psh-pl,#app.playing ~ #pshDock .psh-pl{color:var(--play)}
#pshDock{position:fixed;left:0;right:0;bottom:0;z-index:49;display:flex;justify-content:center;pointer-events:none;padding:0 max(8px,env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px))}
#pshDock:empty{display:none}
.pop.psh.abg{position:relative;left:auto !important;top:auto !important;width:min(440px,100%) !important;max-width:100% !important;min-width:0;height:auto !important;max-height:none !important;display:block !important;overflow:hidden !important;padding:0 var(--psx,12px) !important;pointer-events:auto;box-shadow:0 -6px 24px rgba(0,0,0,.6)}
.pop.psh.abg > :not(.psh-h){display:none !important}
.pop.psh.abg .psh-h{position:relative;margin-bottom:0;border-bottom:0;cursor:pointer}
.pop.psh.abg .psh-t{color:var(--text)}
@media (max-width:360px){.pop.g6sheet.g6pe{--psx:8px}.psh-h{gap:2px}}
@media (orientation:landscape) and (max-height:500px){.pop.g6sheet.g6pe{--psx:10px}.psh-h{min-height:48px;padding-top:4px}}
"""
rep(anchor, anchor + css)
rep(""".pop.stpop{width:min(720px,calc(100vw - 16px));display:grid;grid-template-columns:minmax(336px,1fr) minmax(0,300px);grid-template-rows:auto 1fr;grid-template-areas:"a b" "c b";column-gap:16px;align-items:start}""",
""".pop.stpop{width:min(720px,calc(100vw - 16px));display:grid;grid-template-columns:minmax(336px,1fr) minmax(0,300px);grid-template-rows:auto 1fr;grid-template-areas:"a b" "c b";column-gap:16px;align-items:start}
.pop.stpop.psh{grid-template-rows:auto auto 1fr;grid-template-areas:"h h" "a b" "c b"}.pop.stpop .psh-h{grid-area:h}   /* 4.30.1: Kopf über beiden Spalten */""")
rep(""".g6sheet .g6pe-addrow .mbtn{min-height:44px;margin:0;width:100%;padding:0 4px;font-size:12px}""",
""".g6sheet .g6pe-addrow .mbtn{min-height:44px;margin:0;width:100%;padding:0 4px;font-size:12px}
.g6sheet .g6pe-dup{display:grid;grid-template-columns:1fr 1fr 48px;gap:6px;margin:4px 0}.g6sheet .g6pe-dup.one{grid-template-columns:1fr}   /* 4.30.1: Aufteilen im Chor-Blatt */
.g6sheet .g6pe-dup .mbtn{min-height:44px;margin:0;width:100%;padding:0 4px;font-size:12px;line-height:1.12}
.g6sheet .g6pe-addrow .g6pe-dup{grid-column:1/-1;order:1;margin:0}
@media (orientation:landscape) and (max-height:500px){.g6sheet .g6pe-addrow{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.7fr) minmax(0,1fr)}.g6sheet .g6pe-addrow .g6pe-dup{grid-column:auto;order:0}.g6sheet .g6pe-addrow .g6pe-dup:not(.one){grid-template-columns:1fr 1fr 44px;gap:4px}}""")
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s.encode('utf-8')))
