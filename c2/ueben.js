// Feinschliff – Übungs-Engine (auswahl, zuordnen, sortieren, fehler, rf, rfn) und Sitzung in zwei Modi: „ueben“ / „pruefung“.
// Seit 0.2 wird nichts getippt: Lücke = Auswahl, Umformen = Sortieren, Fehler = Antippen; alte luecke/umformen nur aufdecken.
import { esc, mische } from './speicher.js';
import { vergleiche, liste, lueckenLoesungen, fehlerSpanne } from './pruefen.js';
import { SYM } from './symbole.js';
import { wunschLink } from './wunsch-link.js';
import { vermerke } from './wiederholung.js';
import { buche, einheit } from './konto.js';

export const TYP_NAME = { luecke: 'Lücke', auswahl: 'Auswahl', umformen: 'Umformen', zuordnen: 'Verbinden', sortieren: 'Sortieren', fehler: 'Fehler finden', rf: 'Richtig oder falsch', rfn: 'Richtig, falsch, nicht im Text' };
const ANLEITUNG = { luecke: 'Wie heißt es richtig?', umformen: 'Wie heißt die Umformung?', zuordnen: 'Tippe links, dann rechts, um zu verbinden.', sortieren: 'Tippe die Teile in die richtige Reihenfolge. Ziehen stellt um.', fehler: 'Tippe auf das falsche Wort.', rf: 'Stimmt die Aussage?', rfn: 'Stimmt das laut Text?' };
const LUECKE = /_{3,}/;
const istLuecke = (u) => u.typ === 'auswahl' && LUECKE.test(String(u.frage || ''));
export function typName(u) { return u.typ === 'auswahl' && u.aus === 'luecke' ? 'Lücke' : u.aus === 'umformen' ? 'Umformen' : TYP_NAME[u.typ] || u.typ; }
function anleitung(u) {
  if (istLuecke(u)) return 'Tippe auf das passende Wort für die Lücke.';
  if (u.typ === 'auswahl' && u.aus === 'umformen') return 'Welche Umformung ist richtig?';
  if (u.typ === 'sortieren' && u.ausgang) return 'Bau die Umformung aus den Teilen. Ziehen stellt um.';
  return ANLEITUNG[u.typ] || '';
}
// Mischtyp: Lücken-Auswahl zählt eigen
export const mischTyp = (u) => (istLuecke(u) ? 'luecke' : u.typ);
const SOFORT = new Set(['auswahl', 'rf', 'rfn']);
const OFFEN = new Set(['sortieren']);   // mehr richtige Reihenfolgen möglich
const ALT = new Set(['luecke', 'umformen']);   // alte Eintipp-Typen
const lueckeHtml = (t) => String(t).split(LUECKE).map(esc).join('<span class="luecke-platz" aria-label="Lücke">&#8202;</span>');
const RF_STD = ['richtig', 'falsch'], RFN = ['richtig', 'falsch', 'nicht im Text'];
const q = (s) => `„${esc(s)}“`;

// Kurzbeschreibung einer Aufgabe für Übersichten
export function kurz(u) {
  const t = (u.ausgang && u.typ === 'sortieren' ? `${u.ausgang} → ${u.anweisung || ''}` : '') || u.satz || u.frage || u.ausgang || u.aussage || (u.typ === 'zuordnen' ? 'Verbinden: ' + u.paare.map((p) => p[0]).join(', ') : u.typ === 'sortieren' ? 'Satz bauen: ' + u.teile.join(' · ') : '');
  return String(t).length > 140 ? String(t).slice(0, 137) + '…' : String(t);
}
export function loesungText(u) {
  switch (u.typ) {
    case 'luecke': return lueckenLoesungen(u).map((l) => l[0]).join(' / ');
    case 'auswahl': return u.optionen[u.richtig];
    case 'zuordnen': return u.paare.map((p) => `${p[0]} – ${p[1]}`).join('; ');
    case 'sortieren': return u.loesung;
    case 'fehler': return `${u.fehler} → ${liste(u.korrektur)[0]}`;
    case 'umformen': return liste(u.loesungen)[0] || '';
    case 'rf': return (u.beschriftung || RF_STD)[u.wert ? 0 : 1];
    case 'rfn': return u.wert;
    default: return '';
  }
}
// Reine Auswertung (auch für Tests und Prüfungsübersicht)
export function auswerten(u, a) {
  const leer = { richtig: false, komma: false, antwortText: '–' };
  if (a == null) return leer;
  switch (u.typ) {
    case 'luecke': case 'umformen': return { richtig: a === true, komma: false, antwortText: a === true ? 'gewusst (selbst eingeschätzt)' : 'noch nicht gewusst' };
    case 'auswahl': return { richtig: a === u.richtig, komma: false, antwortText: u.optionen[a] ?? '–' };
    case 'zuordnen': {
      const ok = u.paare.map((p, i) => a[i] != null && a[i] === p[1]);
      return { richtig: ok.every(Boolean), komma: false, antwortText: u.paare.map((p, i) => `${p[0]} – ${a[i] ?? '?'}`).join('; '), teile: ok, anzahl: ok.filter(Boolean).length };
    }
    case 'sortieren': {
      const satz = a.join(' '); const e = vergleiche(satz, [u.loesung, ...liste(u.loesungen)], { ganzKlein: true });
      return { richtig: e.richtig, komma: e.komma, antwortText: satz || '–' };
    }
    case 'fehler': {   // richtig, wenn alle angetippten Wörter im Fehler liegen
      const span = fehlerSpanne(u); const idx = a.idx || [];
      const t = idx.length > 0 && span.length > 0 && idx.every((i) => span.includes(i));
      return { richtig: t, komma: false, antwortText: (a.wahl || []).join(' ') || '–', treffer: t };
    }
    case 'rf': return { richtig: a === !!u.wert, komma: false, antwortText: (u.beschriftung || RF_STD)[a ? 0 : 1] };
    case 'rfn': return { richtig: a === u.wert, komma: false, antwortText: a };
    default: return leer;
  }
}
export function rueckHtml(u, erg) {
  const erkl = u.erklaerung ? `<p class="erkl">${esc(u.erklaerung)}</p>` : '';
  if (erg.richtig) return `<div class="rueck gut" role="status">${SYM.haken}<div><b>Richtig.</b>${u.typ === 'fehler' ? `<p>Richtig heißt es: ${q(loesungText(u))}</p>` : ''}${erg.komma ? ` <span class="leise">Achte auf das Komma: ${q(liste(u.loesungen || u.loesung)[0] || u.loesung)}</span>` : ''}${erkl}</div></div>`;
  const teil = u.typ === 'zuordnen' && erg.anzahl ? ` <span class="leise">(${erg.anzahl} von ${u.paare.length} Paaren richtig)</span>` : '';
  return `<div class="rueck schlecht" role="status">${SYM.kreuz}<div><b>Noch nicht.</b>${teil}<p>Richtig: ${q(loesungText(u))}</p>${erkl}</div></div>`;
}

/**
 * Zeichnet eine Übung in el. modus 'ueben' → prüft selbst und ruft onFertig(erg, antwort);
 * modus 'pruefung' → sammelt nur (ctrl.antwort()), Auswertung später (ctrl.zeige(erg)).
 */
export function zeichneUebung(u, el, { modus = 'ueben', onFertig = () => {}, onAenderung = () => {} } = {}) {
  let a = null, fertig = false;
  const anl = anleitung(u);
  const kopf = `<div class="u-kopf"><span class="u-typ">${esc(typName(u))}</span>${u.grundlage ? '<span class="u-typ grundlage" title="Wiederholung von Grundlagen">Grundlagen</span>' : ''}${anl ? `<span class="u-anl">${anl}</span>` : ''}</div>`;
  el.className = 'uebung'; el.dataset.typ = u.typ; if (u.id) el.dataset.uid = el.dataset.uid || u.id;
  const brauchtKnopf = modus === 'ueben' && !SOFORT.has(u.typ) && !ALT.has(u.typ);
  let koerper = '';
  const reihe = { auswahl: null, zuordnen: null, sortieren: null };
  switch (u.typ) {
    case 'luecke': case 'umformen': {   // alt: aufdecken + selbst einschätzen
      const aufg = u.typ === 'luecke' ? `<p class="satz">${lueckeHtml(u.satz)}</p>` : `<blockquote class="ausgang">${esc(u.ausgang)}</blockquote><p class="frage">${esc(u.anweisung)}</p>`;
      koerper = `${aufg}<div class="aufdecken"><button class="knopf zweit" data-aufdecken>Lösung zeigen</button></div>`;
      break;
    }
    case 'auswahl': {
      reihe.auswahl = mische(u.optionen.map((_, i) => i));
      koerper = `<p class="frage${istLuecke(u) ? ' satz' : ''}">${istLuecke(u) ? lueckeHtml(u.frage) : esc(u.frage)}</p>${u.hinweis ? `<p class="hinweis">${esc(u.hinweis)}</p>` : ''}<div class="optionen">${reihe.auswahl.map((i, k) => `<button class="option" data-o="${i}"><span class="buchst">${'abcdef'[k]}</span><span>${esc(u.optionen[i])}</span></button>`).join('')}</div>`;
      break;
    }
    case 'zuordnen': {
      reihe.zuordnen = mische(u.paare.map((p) => p[1]));
      koerper = `${u.anweisung ? `<p class="frage">${esc(u.anweisung)}</p>` : ''}<div class="verbinden"><div class="spalte">${u.paare.map((p, i) => `<button class="vchip" data-l="${i}">${esc(p[0])}</button>`).join('')}</div><div class="spalte">${reihe.zuordnen.map((r, j) => `<button class="vchip" data-r="${j}">${esc(r)}</button>`).join('')}</div></div>`;
      a = {};
      break;
    }
    case 'sortieren': {
      let m; do { m = mische(u.teile.map((_, i) => i)); } while (u.teile.length > 2 && m.every((x, i) => x === i));
      reihe.sortieren = m; a = [];
      koerper = `${u.ausgang ? `<blockquote class="ausgang">${esc(u.ausgang)}</blockquote><p class="frage">${esc(u.anweisung || '')}</p>` : ''}<div class="bau" aria-label="Dein Satz"></div><div class="vorrat">${m.map((i) => `<button class="tchip" data-t="${i}">${esc(u.teile[i])}</button>`).join('')}</div><button class="textknopf" data-reset>Zurücksetzen</button>`;
      break;
    }
    case 'fehler': {
      const w = String(u.satz).split(/\s+/);
      koerper = `<p class="satz woerter">${w.map((x, i) => `<button class="wort" data-w="${i}">${esc(x)}</button>`).join(' ')}</p>`;
      a = { wahl: [], idx: [] }; el._woerter = w;
      break;
    }
    case 'rf': case 'rfn': {
      const opts = u.typ === 'rf' ? (u.beschriftung || RF_STD) : RFN;
      koerper = `<p class="frage aussage">${esc(u.aussage)}</p><div class="optionen reihe">${opts.map((o, i) => `<button class="option kurz" data-v="${u.typ === 'rf' ? (i === 0 ? 'true' : 'false') : esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      break;
    }
    default: koerper = `<p class="leise">Unbekannter Übungstyp „${esc(u.typ)}“.</p>`;
  }
  el.innerHTML = `${kopf}<div class="u-koerper">${koerper}</div>${brauchtKnopf ? '<div class="u-aktion"><button class="knopf haupt" data-pruefen disabled>Prüfen</button></div>' : ''}<div class="u-rueck"></div>`;
  const knopf = el.querySelector('[data-pruefen]');
  const vollstaendig = () => {
    switch (u.typ) {
      case 'zuordnen': return Object.keys(a).length === u.paare.length;
      case 'sortieren': return a.length === u.teile.length;
      case 'fehler': return a.idx.length > 0;
      default: return a != null;
    }
  };
  const geaendert = () => { if (knopf) knopf.disabled = !vollstaendig(); onAenderung(); };
  const pruefe = () => {
    if (fertig || !vollstaendig()) return;
    fertig = true; const erg = auswerten(u, ctrl.antwort()); ctrl.zeige(erg); onFertig(erg, ctrl.antwort());
  };
  // ---- Ereignisse je Typ ----
  el.addEventListener('click', (e) => {
    if (fertig && modus === 'ueben') return;
    const b = e.target.closest('button'); if (!b || !el.contains(b)) return;
    if (b.hasAttribute('data-pruefen')) return pruefe();
    if (b.hasAttribute('data-aufdecken')) {
      b.parentElement.innerHTML = `<p class="loesung-zeige"><span class="leise">Lösung:</span> ${esc(loesungText(u))}</p><p class="leise">Wusstest du es?</p><div class="optionen reihe"><button class="option kurz" data-selbst="1">Gewusst</button><button class="option kurz" data-selbst="0">Noch nicht</button></div>`;
      return;
    }
    if (b.dataset.selbst != null) { a = b.dataset.selbst === '1'; el.querySelectorAll('[data-selbst]').forEach((x) => x.setAttribute('aria-pressed', x === b)); geaendert(); if (modus === 'ueben') pruefe(); return; }
    if (b.dataset.o != null) { a = +b.dataset.o; el.querySelectorAll('.option').forEach((x) => x.setAttribute('aria-pressed', x === b)); geaendert(); if (modus === 'ueben') pruefe(); return; }
    if (b.dataset.v != null) { a = u.typ === 'rf' ? b.dataset.v === 'true' : b.dataset.v; el.querySelectorAll('.option').forEach((x) => x.setAttribute('aria-pressed', x === b)); geaendert(); if (modus === 'ueben') pruefe(); return; }
    if (u.typ === 'zuordnen') return zuordnenKlick(b);
    if (u.typ === 'sortieren') { if (b.classList.contains('drin') && e.detail === 0) { a.splice(+b.dataset.k, 1); zeichneBau(); geaendert(); return; } if (b.hasAttribute('data-reset')) { a = []; zeichneBau(); geaendert(); return; } if (b.dataset.t != null && b.parentElement.classList.contains('vorrat')) { a.push(+b.dataset.t); zeichneBau(); geaendert(); } return; }
    if (u.typ === 'fehler' && b.dataset.w != null) {
      const i = +b.dataset.w; const sel = new Set(el._wahlIdx || []); sel.has(i) ? sel.delete(i) : sel.add(i);
      el._wahlIdx = [...sel].sort((x, y) => x - y); a.idx = el._wahlIdx; a.wahl = el._wahlIdx.map((k) => el._woerter[k]);
      b.setAttribute('aria-pressed', sel.has(i)); geaendert();
    }
  });
  // Verbinden: links wählen, dann rechts (oder umgekehrt); erneutes Tippen löst die Verbindung
  let aktivL = null, aktivR = null;
  const farbeVon = (l) => Object.keys(a).map(Number).sort((x, y) => x - y).indexOf(l);
  function zeichneVerb() {
    const rechtsBelegt = new Map(); for (const [l, r] of Object.entries(el._rIdx || {})) rechtsBelegt.set(r, +l);
    el.querySelectorAll('[data-l]').forEach((b) => { const l = +b.dataset.l; const v = a[l] != null; b.dataset.p = v ? farbeVon(l) % 6 : ''; b.classList.toggle('aktiv', aktivL === l); b.setAttribute('aria-pressed', v || aktivL === l); });
    el.querySelectorAll('[data-r]').forEach((b) => { const r = +b.dataset.r; const l = rechtsBelegt.get(r); b.dataset.p = l != null ? farbeVon(l) % 6 : ''; b.classList.toggle('aktiv', aktivR === r); b.setAttribute('aria-pressed', l != null || aktivR === r); });
  }
  function verbinde(l, r) {
    el._rIdx = el._rIdx || {};
    for (const [k, v] of Object.entries(el._rIdx)) if (v === r) { delete el._rIdx[k]; delete a[k]; }
    el._rIdx[l] = r; a[l] = reihe.zuordnen[r]; aktivL = aktivR = null;
  }
  function zuordnenKlick(b) {
    el._rIdx = el._rIdx || {};
    if (b.dataset.l != null) {
      const l = +b.dataset.l;
      if (a[l] != null && aktivR == null) { delete a[l]; delete el._rIdx[l]; aktivL = null; }
      else if (aktivR != null) verbinde(l, aktivR); else aktivL = aktivL === l ? null : l;
    } else if (b.dataset.r != null) {
      const r = +b.dataset.r; const belegt = Object.entries(el._rIdx).find(([, v]) => v === r);
      if (belegt && aktivL == null) { delete a[belegt[0]]; delete el._rIdx[belegt[0]]; aktivR = null; }
      else if (aktivL != null) verbinde(aktivL, r); else aktivR = aktivR === r ? null : r;
    }
    zeichneVerb(); geaendert();
  }
  // Sortieren: Bau-Zeile zeichnen + Ziehen zum Umstellen (Zeiger-Ereignisse, funktioniert mit Finger und Maus)
  function zeichneBau() {
    const bau = el.querySelector('.bau'), vor = el.querySelector('.vorrat');
    bau.innerHTML = a.map((i, k) => `<button class="tchip drin" data-t="${i}" data-k="${k}">${esc(u.teile[i])}</button>`).join('') || '<span class="leer">Tippe unten auf die Teile.</span>';
    vor.querySelectorAll('.tchip').forEach((b) => { b.hidden = a.includes(+b.dataset.t); });
  }
  if (u.typ === 'sortieren') {
    zeichneBau();
    const bau = el.querySelector('.bau'); let zug = null;
    bau.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.tchip'); if (!b || (fertig && modus === 'ueben')) return;
      zug = { b, k: +b.dataset.k, x: e.clientX, y: e.clientY, bewegt: false }; b.setPointerCapture?.(e.pointerId);
    });
    bau.addEventListener('pointermove', (e) => {
      if (!zug) return; const dx = e.clientX - zug.x, dy = e.clientY - zug.y;
      if (!zug.bewegt && Math.hypot(dx, dy) < 8) return;
      zug.bewegt = true; zug.b.classList.add('zieht'); zug.b.style.transform = `translate(${dx}px,${dy}px)`; e.preventDefault();
    });
    const ende = (e) => {
      if (!zug) return; const z = zug; zug = null;
      if (!z.bewegt) { a.splice(z.k, 1); zeichneBau(); geaendert(); return; }
      const andere = [...bau.querySelectorAll('.tchip')].filter((x) => x !== z.b);
      let ziel = andere.length;
      for (let i = 0; i < andere.length; i++) { const r = andere[i].getBoundingClientRect(); if (e.clientY < r.top || (e.clientY <= r.bottom && e.clientX < r.left + r.width / 2)) { ziel = i; break; } }
      const [t] = a.splice(z.k, 1); a.splice(ziel, 0, t); zeichneBau(); geaendert();
    };
    bau.addEventListener('pointerup', ende); bau.addEventListener('pointercancel', () => { if (zug) { zug.b.style.transform = ''; zug.b.classList.remove('zieht'); zug = null; } });
  }
  const ctrl = {
    u, el,
    antwort() {
      switch (u.typ) {
        case 'zuordnen': return Object.keys(a).length ? { ...a } : null;
        case 'sortieren': return a.length ? a.map((i) => u.teile[i]) : null;
        case 'fehler': return a.idx.length ? { wahl: [...a.wahl], idx: [...a.idx] } : null;
        default: return a;
      }
    },
    zeige(erg) {
      fertig = true;
      el.classList.add('fertig', erg.richtig ? 'ist-richtig' : 'ist-falsch');
      el.querySelectorAll('button:not(.textknopf-bleibt)').forEach((b) => { b.disabled = true; });
      if (u.typ === 'auswahl') el.querySelectorAll('.option').forEach((b) => { if (+b.dataset.o === u.richtig) b.classList.add('loesung'); else if (b.getAttribute('aria-pressed') === 'true') b.classList.add('daneben'); });
      if (u.typ === 'rf' || u.typ === 'rfn') { const soll = u.typ === 'rf' ? String(!!u.wert) : u.wert; el.querySelectorAll('.option').forEach((b) => { if (b.dataset.v === soll) b.classList.add('loesung'); else if (b.getAttribute('aria-pressed') === 'true') b.classList.add('daneben'); }); }
      if (istLuecke(u)) { const p = el.querySelector('.luecke-platz'); if (p) { p.textContent = u.optionen[u.richtig]; p.classList.add('gefuellt'); } }
      if (u.typ === 'fehler') { const span = fehlerSpanne(u); el.querySelectorAll('.wort').forEach((b) => { const i = +b.dataset.w; if (span.includes(i)) b.classList.add('loesung'); else if (b.getAttribute('aria-pressed') === 'true') b.classList.add('daneben'); }); }
      if (u.typ === 'zuordnen' && erg.teile) el.querySelectorAll('[data-l]').forEach((b) => b.classList.add(erg.teile[+b.dataset.l] ? 'ok' : 'nok'));
      el.querySelector('.u-rueck').innerHTML = rueckHtml(u, erg);
      knopf?.parentElement?.remove();
    },
    get fertig() { return fertig; },
  };
  return ctrl;
}

/**
 * Sitzung: eine Übung nach der anderen.
 * eintraege: [{ u, uid, pool, bereich, thema }]; modus 'ueben' | 'pruefung'
 */
export function sitzung(view, { titel = 'Üben', bereich = 'grammatik', eintraege, modus = 'ueben', zurueck = '#/heute', nochmal = null, onEnde = null }) {
  const ergebnisse = new Array(eintraege.length).fill(null); let i = 0, ctrl = null, gebucht = false;
  view.innerHTML = `<section class="sitzung" data-bereich="${esc(bereich)}" data-modus="${modus}">
    <header class="s-kopf"><a class="rund" href="${esc(zurueck)}" aria-label="Beenden">${SYM.kreuz}</a>
      <div class="s-fort"><div class="balken"><i></i></div><span class="s-zahl"></span></div>
      <span class="modus-chip">${modus === 'pruefung' ? 'Prüfung' : 'Üben'}</span></header>
    <h2 class="s-titel">${esc(titel)}</h2><div class="s-karte karte"></div><div class="s-fuss"></div></section>`;
  const karte = view.querySelector('.s-karte'), fuss = view.querySelector('.s-fuss');
  const fort = () => { view.querySelector('.balken i').style.width = `${(i / eintraege.length) * 100}%`; view.querySelector('.s-zahl').textContent = `${Math.min(i + 1, eintraege.length)} / ${eintraege.length}`; };
  const buchen = (k, erg) => { const e = eintraege[k]; vermerke(e.uid, e.pool, erg.richtig); buche({ bereich: e.bereich || bereich, thema: e.thema, richtig: erg.richtig }); };
  function zeige() {
    fort(); const e = eintraege[i]; karte.dataset.uid = e.uid; karte.innerHTML = '<div></div>';
    ctrl = zeichneUebung(e.u, karte.firstChild, {
      modus,
      onFertig: (erg) => {
        ergebnisse[i] = { erg, antwort: ctrl.antwort() };
        const auch = !erg.richtig && OFFEN.has(e.u.typ) ? '<button class="textknopf auch-richtig" data-auch>Meine Antwort ist auch richtig</button>' : '';
        fuss.innerHTML = `<button class="knopf haupt breit" data-weiter>${i < eintraege.length - 1 ? 'Weiter' : 'Auswertung'}</button>${auch}`; fuss.querySelector('button').focus({ preventScroll: true });
      },
    });
    karte.dataset.uid = e.uid;
    fuss.innerHTML = modus === 'pruefung' ? `<button class="knopf haupt breit" data-weiter>${i < eintraege.length - 1 ? 'Weiter' : 'Abgeben'}</button>` : '';
    view.querySelector('.sitzung').scrollIntoView?.({ block: 'start' });
  }
  fuss.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-auch]') && ergebnisse[i]) {   // Selbsteinschätzung: nur bei offenen Antworten, die eine Lösungsliste nicht vorhersehen kann
      ergebnisse[i].erg = { ...ergebnisse[i].erg, richtig: true, selbst: true };
      karte.querySelector('.rueck')?.replaceWith(Object.assign(document.createElement('div'), { className: 'rueck gut', role: 'status', innerHTML: `${SYM.haken}<div><b>Als richtig gezählt.</b> <span class="leise">Vergleiche trotzdem mit der Musterlösung.</span></div>` }));
      ev.target.closest('[data-auch]').remove(); return;
    }
    if (!ev.target.closest('[data-weiter]')) return;
    if (modus === 'pruefung') ergebnisse[i] = { antwort: ctrl.antwort() };
    else if (ergebnisse[i] && !ergebnisse[i].gebucht) { buchen(i, ergebnisse[i].erg); ergebnisse[i].gebucht = true; }
    i++; if (i < eintraege.length) zeige(); else ende();
  });
  function ende() {
    if (modus === 'pruefung') eintraege.forEach((e, k) => { const r = ergebnisse[k] || { antwort: null }; r.erg = auswerten(e.u, r.antwort); ergebnisse[k] = r; buchen(k, r.erg); });
    const bearbeitet = ergebnisse.filter(Boolean); const richtig = bearbeitet.filter((r) => r.erg.richtig).length;
    if (!gebucht && bearbeitet.length >= Math.min(5, eintraege.length)) { einheit(); gebucht = true; }
    const quote = eintraege.length ? Math.round((richtig / eintraege.length) * 100) : 0;
    view.querySelector('.balken i').style.width = '100%';
    const liste = eintraege.map((e, k) => {
      const r = ergebnisse[k]; if (!r) return '';
      if (modus === 'ueben' && r.erg.richtig) return '';
      return `<li class="${r.erg.richtig ? 'ok' : 'nok'}">${r.erg.richtig ? SYM.haken : SYM.kreuz}<div><p class="ue-aufg">${esc(kurz(e.u))}</p><p><span class="leise">Deine Antwort:</span> ${esc(r.erg.antwortText)}</p>${r.erg.richtig ? '' : `<p><span class="leise">Lösung:</span> ${esc(loesungText(e.u))}</p>`}${e.u.erklaerung ? `<details><summary>Erklärung</summary><p>${esc(e.u.erklaerung)}</p></details>` : ''}</div></li>`;
    }).join('');
    karte.className = 's-karte karte ende'; delete karte.dataset.uid;
    karte.innerHTML = `<div class="ergebnis-kopf"><div class="ring" style="--w:${quote}">${quote} %</div><div><h3>${richtig} von ${eintraege.length} richtig</h3><p class="leise">+${richtig * 10} Punkte${modus === 'pruefung' ? ` · ${quote >= 60 ? 'Prüfungsziel (60 %) erreicht' : 'Ziel in der Prüfung: 60 %'}` : ''}</p></div></div>
      ${liste ? `<h4>${modus === 'pruefung' ? 'Korrektur' : 'Zum Nachlesen'}</h4><ul class="uebersicht">${liste}</ul>` : '<p class="lob">Alles richtig. Stark.</p>'}`;
    fuss.innerHTML = `${nochmal ? '<button class="knopf haupt breit" data-nochmal>Noch eine Runde</button>' : ''}<a class="knopf breit zweit" href="${esc(zurueck)}">Fertig</a>${wunschLink(zurueck === '#/heute' ? 'heute' : bereich)}`;
    fuss.querySelector('[data-nochmal]')?.addEventListener('click', nochmal);
    onEnde?.(ergebnisse, eintraege);
  }
  if (!eintraege.length) { karte.innerHTML = '<p>Hier gibt es gerade nichts zu üben.</p>'; fuss.innerHTML = `<a class="knopf breit" href="${esc(zurueck)}">Zurück</a>`; return; }
  zeige();
}
// Kandidaten aus einer Grammatik-Datei
export const kandidatenAus = (d, bereich = 'grammatik') => (d.uebungen || []).map((u) => ({ u, uid: `${bereich}/${d.id}/${u.id}`, pool: `${bereich}/${d.id}`, bereich, thema: `${bereich}/${d.id}`, typ: mischTyp(u) }));
