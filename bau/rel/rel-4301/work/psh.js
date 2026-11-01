/* ---------- 4.30.1 (Xander 01.11.): hohe Blätter (Chor, Takes, Mikro) – fester Kopf mit ✕, [Ablegen] und (Chor/Takes) Transport ----------
   Ursache, warum sich das Chor-Blatt in der Vorschau (428 × 650) nicht schließen ließ: die Blätter sind dort fast so hoch wie das Bild;
   [OK] lag im Chor-Blatt unten außerhalb, Takes und Mikro haben gar keinen Schließen-Knopf (nur Tipp außerhalb: 8–24 px Rand), und das
   Blatt ließ sich mit dem Finger nicht verschieben (guardTouch schluckt die Wischgeste außer in Listen). Ein Wischen nach unten landete
   so bei der Claude-App, die daraufhin die ganze Vorschau schloss.
   Jetzt: ein Kopf, der oben am Blatt klebt (sticky, auch quer), mit ✕; der Inhalt darunter scrollt mit dem Finger (nur innen, kein
   Durchreichen an die Seite); Wischen nach unten am Kopf schließt; Tipp außerhalb schließt wie bisher.
   [Ablegen] (Pfeil nach unten): das Blatt fährt auf eine schmale Leiste unten zusammen (eigene Ebene unter Menü und Video, die App bleibt
   bedienbar, kleine Fenster gehen darüber auf); ein Tipp auf die Leiste holt es mit demselben Zustand zurück (aufgeklappte Teile,
   Scroll-Stand). Ein anderes hohes Blatt ersetzt ein abgelegtes.
   Transport im Kopf (Chor und Takes): [⏮] von vorn, [▶/■] spielt die Stelle mit Chor (Song-Stimme: der Song über ihre Takte;
   Szenen-Clip: die Szene von vorn) bzw. hält an, [Schleife] wiederholt die Stelle (aus: einmal, dann Stopp). Die Schleife gilt nur für
   dieses Abspielen (R.loopX) – die Song-Schleife und das Projekt bleiben unverändert. */
const PSH = {dock: null, layer: null, wt: 0, until: null};
const PSH_I = {
  first: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.4v14H6z" fill="currentColor"/><path d="M19 5.2v13.6L9.6 12z" fill="currentColor"/></svg>',
  play: '<svg class="ip" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5v14l11.5-7z" fill="currentColor"/></svg><svg class="is" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/></svg>',
  loop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5V10a3 3 0 0 1 3-3h10M15 4l3 3-3 3M19.5 11.5V14a3 3 0 0 1-3 3h-10M9 20l-3-3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14.5l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
// die sicheren Ränder (Notch, Home-Leiste; viewport-fit=cover): ein Blatt beginnt nie darunter, sein Kopf bleibt erreichbar
function pshSafe() {
  let e = PSH.sp; if (!e || !e.isConnected) { e = PSH.sp = document.createElement('div'); e.setAttribute('aria-hidden', 'true'); e.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)'; document.body.appendChild(e); }
  const cs = getComputedStyle(e); return {t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0};
}
const pshLoopOn = () => uiPrefs().pshLoop !== false;              // Vorgabe: Schleife an (wie ein Clip in der Matrix)
// the head of a sheet pop; o = {title(), ref() (Transport), valid(), repaint(p)}
function pshMake(p, o) {
  const tr = !!o.ref;
  const hd = el('div', 'psh-h', '<i class="psh-grip" aria-hidden="true"></i><b class="psh-t"></b>' +
    (tr ? `<button class="rb psh-b" data-psh="first" aria-label="Von vorn">${PSH_I.first}</button><button class="rb psh-b psh-pl" data-psh="play" aria-label="Abspielen oder anhalten">${PSH_I.play}</button>` +
      `<button class="rb psh-b psh-lp" data-psh="loop" aria-label="Schleife an oder aus">${PSH_I.loop}</button>` : '') +
    `<button class="rb psh-b psh-dk" data-psh="dock" aria-label="Ablegen">${PSH_I.down}${PSH_I.up}</button><button class="rb psh-b psh-x" data-psh="x" aria-label="Schließen">✕</button>`);
  hd.setAttribute('role', 'toolbar'); hd.setAttribute('aria-label', 'Blatt');
  p._psh = hd; p._pshO = o; p.classList.add('psh', 'pan-y');      // pan-y: der Inhalt scrollt mit dem Finger (guardTouch lässt ihn)
  hd.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); }, {passive: false});   // der Kopf: keine Lupe, kein Seiten-Wischen
  onTap(hd, b => pshTap(p, b.dataset.psh), 'button[data-psh]');
  hd.addEventListener('pointerdown', e => { hd._btn = !!(e.target && e.target.closest && e.target.closest('button')); }, true);
  onTap(hd, () => { if (p.classList.contains('abg') && !hd._btn) pshUndock(); });   // Tipp auf die Leiste (nicht auf einen Knopf): zurückholen
  // Wischen nach unten am Kopf schließt (das Blatt folgt dem Finger; unter 64 px federt es zurück)
  let G = null;
  hd.addEventListener('pointerdown', e => { if (e.button > 0) return; G = {id: e.pointerId, y: e.clientY, dy: 0}; });
  hd.addEventListener('pointermove', e => {
    if (!G || e.pointerId !== G.id) return;
    G.dy = Math.max(0, e.clientY - G.y);
    if (G.dy > 8) { if (!G.cap) { G.cap = true; try { hd.setPointerCapture(e.pointerId); } catch (x) {} } p.style.transform = 'translateY(' + Math.round(G.dy) + 'px)'; }
  });
  const end = e => {
    if (!G || e.pointerId !== G.id) return; const d = G.dy; G = null; p.style.transform = '';
    if (e.type === 'pointerup' && d >= 64) { haptic('tick'); if (p.classList.contains('abg')) pshDockClose(); else if (UI.pop && UI.pop.el === p) closePop(); }
  };
  hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
  pshKeep(p);
  try { const mo = new MutationObserver(() => pshKeep(p)); mo.observe(p, {childList: true}); p._pshMo = mo; } catch (e) {}   // ein Neuzeichnen (innerHTML) nimmt den Kopf mit
  return hd;
}
// the head stays the first child (after an innerHTML repaint) and shows the current title / loop state
function pshKeep(p) {
  const hd = p && p._psh; if (!hd) return;
  if (hd.parentNode !== p || p.firstChild !== hd) p.prepend(hd);
  pshHeadSync(p);
}
function pshHeadSync(p) {
  const hd = p && p._psh, o = p && p._pshO; if (!hd || !o) return;
  let t = ''; try { t = o.title ? o.title(p.classList.contains('abg')) : ''; } catch (e) { t = ''; }   // offen: kurz (die Zeile darunter nennt die Stelle); abgelegt: mit Stelle
  const tb = hd.querySelector('.psh-t'); if (tb.textContent !== t) tb.textContent = t;
  const lp = hd.querySelector('.psh-lp'); if (lp) lp.setAttribute('aria-pressed', String(pshLoopOn()));
  const dk = hd.querySelector('.psh-dk'), ab = p.classList.contains('abg');
  if (dk && dk.dataset.st !== String(ab)) { dk.dataset.st = String(ab); dk.setAttribute('aria-label', ab ? 'Zurückholen' : 'Ablegen'); }   // Pfeil per CSS (kein Austausch unter dem Finger)
}
function pshTap(p, a) {
  const o = p._pshO || {};
  if (a === 'x') { if (p.classList.contains('abg')) pshDockClose(); else if (UI.pop && UI.pop.el === p) closePop(); return; }
  if (a === 'dock') { if (p.classList.contains('abg')) pshUndock(); else pshDock(); return; }
  const r = o.ref ? o.ref() : null; if (!r) return;
  if (a === 'play') { if (R.playing) { stop(); pshWatch(); } else pshStart(r); return; }
  if (a === 'first') { pshStart(r); return; }
  if (a === 'loop') { pshLoopSet(!pshLoopOn()); haptic('tick'); pshHeadSync(p); }
}
function pshLayer() {
  if (PSH.layer && PSH.layer.isConnected) return PSH.layer;
  const L = PSH.layer = el('div'); L.id = 'pshDock'; document.body.appendChild(L); return L;
}
const pshScrolls = p => [p].concat([...p.querySelectorAll('.pan-y')]);
function pshDock() {
  const P = UI.pop; if (!P || !P.sheet) return false;
  const p = P.el; P.scr = pshScrolls(p).map(x => x.scrollTop); P.pos = {l: p.style.left, t: p.style.top};
  UI.pop = null; EL.popLayer.classList.remove('open');           // die modale Ebene geht, die Leiste liegt in ihrer eigenen
  p.classList.add('abg'); pshLayer().appendChild(p); PSH.dock = P;
  pshHeadSync(p); haptic('tick');
  return true;
}
function pshUndock() {
  const P = PSH.dock; if (!P) return false;
  if (P.sheet.valid && !P.sheet.valid()) { pshDockClose(); toast('Diese Stelle gibt es nicht mehr'); return false; }
  if (UI.pop) closePop();
  PSH.dock = null; const p = P.el;
  p.classList.remove('abg'); EL.popLayer.appendChild(p); EL.popLayer.classList.add('open');
  p.style.left = P.pos.l; p.style.top = P.pos.t; UI.pop = P;
  if (P.sheet.repaint) { try { P.sheet.repaint(p); } catch (e) { logErr(e); } }   // inzwischen Geändertes zeigen (Zustand des Blatts bleibt)
  pshKeep(p); popFit(p);
  const sc = pshScrolls(p); (P.scr || []).forEach((v, k) => { if (sc[k]) sc[k].scrollTop = v; });
  haptic('tick');
  return true;
}
function pshDockClose() {
  const P = PSH.dock; if (!P) return false;
  PSH.dock = null;
  try { if (P.el._pshMo) P.el._pshMo.disconnect(); P.el.remove(); } catch (e) {}
  if (P.onClose) { try { P.onClose(); } catch (e) { logErr(e); } }
  return true;
}
// a sheet of this kind opens again: an abgelegtes Blatt derselben Stelle kommt zurück (true), sonst geht es zu
function pshReopen(name, same) {
  const P = PSH.dock; if (!P) return false;
  if (P.name === name && same) return pshUndock();
  pshDockClose(); return false;
}
/* ---------- Transport im Kopf ---------- */
// the place: a song voice → the song over its bars (R.loopX = Schleife nur für dieses Abspielen); a scene clip → its scene from the start
function pshStart(r) {
  const x = r && tkRef(r); if (!x) return false;
  ensureAudio(); if (!AU.ctx) return false;
  if (rec.state !== 'off' || R.songRec) { toast('Erst Aufnahme beenden'); return false; }
  const lp = pshLoopOn(); PSH.until = null;
  if (r.vox) {
    const song = S.song; if (!song || !song.bars) return false;
    const a = clamp(x.a.bar | 0, 0, song.bars - 1), b = clamp(a + Math.max(1, Math.round(x.a.len || 1)), a + 1, song.bars);
    if (!songPlayStart(a, {loopX: {on: lp, a, b}})) return false;
  } else {
    if (R.playing) stop();
    launchScene(r.s);
    if (!R.playing) return false;
    PSH.until = {beat: Math.max(1, x.clip.len || 1) * 4, len: Math.max(1, x.clip.len || 1) * 4, t: r.t, s: r.s};
  }
  haptic('tick'); pshWatch();
  return true;
}
function pshLoopSet(on) {
  setUiPref('pshLoop', !!on);
  if (R.loopX && R.playing) R.loopX.on = !!on;                  // Song-Stimme: gilt ab dem nächsten Takt-Ende der Stelle
  if (PSH.until && R.playing && AU.ctx) { const b = audBeat(), L = PSH.until.len; PSH.until.beat = Math.max(L, Math.ceil((b + .02) / L) * L); }   // Szene: Ende des laufenden Durchgangs
}
// Szenen-Clip ohne Schleife: nach einem Durchgang anhalten; endet die Wiedergabe sonst, ist die Wache fertig
function pshWatch() {
  clearInterval(PSH.wt); PSH.wt = 0;
  if (!R.playing || !PSH.until) { PSH.until = R.playing ? PSH.until : null; return; }
  PSH.wt = setInterval(() => {
    const u = PSH.until;
    if (!R.playing || !u || !AU.ctx) { clearInterval(PSH.wt); PSH.wt = 0; PSH.until = null; return; }
    if (pshLoopOn()) return;
    if (audBeat() >= u.beat - .02) { clearInterval(PSH.wt); PSH.wt = 0; PSH.until = null; stop(); }
  }, 40);
}
