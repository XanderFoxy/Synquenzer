// Bildwerk 0.7 – Oberfläche der Labor-Modi: Licht (Abwedeln/Nachbelichten), Schärfe, Bereiche, Haare, Hintergrund.
// Wird erst geladen, wenn einer dieser Modi geöffnet wird. Rechnet nichts selbst: alles über labor.js (Teil 1).
// Bedienung je Modus: oben in der Werkzeugleiste (#werkzeug) die Wahl/Schalter, darunter (#regler) die Regler.
// Ein Finger malt nur, wenn ein Pinsel aktiv ist; zwei Finger zoomen/schieben immer (app.js).
import { ART, neueId } from './typen.js';
import { reglerZeile, reglerWert } from './regler.js';
import { bildschirmZuQuelle } from './zuschnitt.js';

const S = (d, g = 22) => `<svg viewBox="0 0 24 24" width="${g}" height="${g}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  auge: S('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 20),
  augeZu: S('<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.3 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.4-1.1"/>', 20),
  plus: S('<path d="M12 5v14M5 12h14"/>', 20),
  hell: S('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>', 20),
  dunkel: S('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', 20),
  auto: S('<path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3z"/>', 20),
  tipp: S('<circle cx="12" cy="9" r="3"/><path d="M12 2v2M5 9H3M21 9h-2M7 4l1.4 1.4M17 4l-1.4 1.4"/><path d="M10 13.5V21l2.2-1.6L14 22l1.6-.8-1.8-2.8 2.7-.4z"/>', 20),
  zurueck: S('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-4"/>', 20),
  muell: S('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', 20),
  stift: S('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>', 18),
  maske: S('<circle cx="12" cy="12" r="8"/><path d="M7 17l10-10M5 13l8-8M11 19l8-8"/>', 20),
  person: S('<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.4-3.6 3.1-6 6.5-6s6.1 2.4 6.5 6"/>', 20),
  pinsel: S('<path d="M14.5 4.5l5 5-7.5 7.5-5-5z"/><path d="M7 12c-2.5 0-3.5 2-3.5 4.5S2 20 2 20s5 .5 6.5-1.5S9 15 9 14"/>', 20),
  umkehren: S('<path d="M4 8h13l-3-3M20 16H7l3 3"/>', 20),
};
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const klemme = (v, a, b) => Math.min(b, Math.max(a, v));
/** Werte, die beim Wechsel zwischen den Modi erhalten bleiben (nur Bedienung, nicht im Dokument). */
const MERK = { licht: { unter: 'auto', groesse: 44, deckkraft: 30, haerte: 30 }, schaerfe: { wirkung: true }, bereiche: { aktiv: null } };

// ================================================================ Bausteine
function knopf(html, attr = '', klasse = 'chip') { return `<button type="button" class="${klasse}" ${attr}>${html}</button>`; }
function setzePfad(o, pfad, wert) { const t = pfad.split('.'); let x = o; for (let i = 0; i < t.length - 1; i++) { x[t[i]] ??= {}; x = x[t[i]]; } x[t[t.length - 1]] = wert; }
function lesePfad(o, pfad) { return pfad.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o); }

/** Reglergruppe in el. defs: [{ id (Pfad in params), titel, min, max, standard, schritt?, einheit? } | { kopf: 'Titel' }]. */
function regler(el, defs, params, onAendern) {
  const box = el.ownerDocument.createElement('div'); box.className = 'rg'; el.appendChild(box);
  const zeilen = new Map();
  for (const d of defs) {
    if (d.kopf) { const h = el.ownerDocument.createElement('h3'); h.textContent = d.kopf; box.appendChild(h); continue; }
    const w = lesePfad(params || {}, d.id); const z = reglerZeile(box, d, w ?? d.standard, (id, wert, phase) => onAendern(d, wert, phase));
    if (d.hinweis) z.el.title = d.hinweis;
    zeilen.set(d.id, z);
  }
  return { setze(p) { for (const [id, z] of zeilen) { const w = lesePfad(p || {}, id); z.setze(w ?? defs.find((d) => d.id === id).standard); } }, el: box };
}
/** Kurzer erklärender Kasten mit gezeichnetem Symbol. */
function hinweis(el, icon, titel, text) {
  const k = el.ownerDocument.createElement('div'); k.className = 'mo-karte';
  k.innerHTML = `<span class="mo-symbol">${icon}</span><div><strong>${esc(titel)}</strong><p>${text}</p></div>`;
  el.appendChild(k); return k;
}
function knopfReihe(el, html) { const r = el.ownerDocument.createElement('div'); r.className = 'mo-reihe'; r.innerHTML = html; el.appendChild(r); return r; }

/** OKLab (linear) → '#rrggbb' (für das Farbfeld eines Bereichs). */
export function oklabZuHex(ziel) {
  if (!Array.isArray(ziel)) return '#777777';
  const [L, a, b] = ziel, l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return '#' + lin.map((v) => { v = klemme(v, 0, 1); v = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; return Math.round(v * 255).toString(16).padStart(2, '0'); }).join('');
}
/** Gewähltes Element in einer waagerechten Leiste sichtbar machen (nur die Leiste scrollt). */
function inSicht(leiste, el) {
  if (!el || !leiste) return; const l = leiste.getBoundingClientRect(), r = el.getBoundingClientRect();
  if (r.left < l.left) leiste.scrollLeft -= l.left - r.left + 8; else if (r.right > l.right) leiste.scrollLeft += r.right - l.right + 8;
}
/** Farbname aus OKLab [L, a, b] (für „Bereich 2 – Gelb“). Nur eine grobe, ehrliche Beschreibung der angetippten Farbe. */
export function farbname(ziel) {
  if (!Array.isArray(ziel)) return 'Farbe';
  const [L, a, b] = ziel, C = Math.hypot(a, b); let h = (Math.atan2(b, a) * 180) / Math.PI; if (h < 0) h += 360;
  if (C < 0.035) return L < 0.3 ? 'Schwarz' : L < 0.52 ? 'Dunkelgrau' : L < 0.82 ? 'Grau' : 'Weiß';
  let n;
  if (h >= 35 && h < 85 && C < 0.1 && L > 0.55) n = 'Beige';
  else if (h < 10 || h >= 345) n = 'Pink';
  else if (h < 45) n = L > 0.8 ? 'Rosa' : 'Rot';
  else if (h < 75) n = L < 0.55 ? 'Braun' : 'Orange';
  else if (h < 120) n = L < 0.55 ? 'Oliv' : 'Gelb';
  else if (h < 170) n = 'Grün';
  else if (h < 230) n = 'Türkis';
  else if (h < 290) n = 'Blau';
  else n = 'Violett';
  if (['Rosa', 'Beige', 'Braun', 'Oliv'].includes(n)) return n;
  return L < 0.45 ? `Dunkles ${n}` : L > 0.86 ? `Helles ${n}` : n;
}

/**
 * Pinsel auf der Bildfläche: ein Finger malt, ein zweiter Finger bricht den Strich ab (dann zoomt app.js).
 * opts: { farbe(): css, groesse(): CSS-px Durchmesser, onStrich({ punkte (Quelle normiert), radius (Anteil kurze Seite) }) }
 */
function pinsel(app, opts) {
  const flaeche = app.bildflaeche, d = flaeche.ownerDocument;
  const ueber = d.createElement('canvas'); ueber.className = 'mo-ueber'; flaeche.appendChild(ueber);
  app.tippModus = true;
  let zug = null, ring = null, ringTimer = 0, rahmen = 0; const finger = new Set();
  const lokal = (e) => { const r = flaeche.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const zeichne = () => {
    rahmen = 0; const r = flaeche.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    const B = Math.round(r.width * dpr), H = Math.round(r.height * dpr); if (ueber.width !== B || ueber.height !== H) { ueber.width = B; ueber.height = H; }
    const c = ueber.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, r.width, r.height);
    const g = opts.groesse();
    if (zug && zug.css.length) {
      c.strokeStyle = opts.farbe(); c.lineCap = c.lineJoin = 'round'; c.lineWidth = g; c.beginPath();
      zug.css.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); if (zug.css.length === 1) c.lineTo(zug.css[0][0] + 0.1, zug.css[0][1]); c.stroke();
    }
    const p = zug ? zug.css[zug.css.length - 1] : ring;
    if (p) { c.lineWidth = 1.5; c.strokeStyle = 'rgba(239,232,220,.9)'; c.beginPath(); c.arc(p[0], p[1], g / 2, 0, 7); c.stroke(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.arc(p[0], p[1], g / 2 + 1.5, 0, 7); c.stroke(); }
  };
  const plane = () => { if (!rahmen) rahmen = requestAnimationFrame(zeichne); };
  const runter = (e) => {
    finger.add(e.pointerId);
    if (finger.size > 1) { if (zug) { zug = null; plane(); } return; }   // zweiter Finger: Zoom, kein Strich
    if (!app.zustand().doc) return;
    zug = { id: e.pointerId, css: [lokal(e)] }; plane();
  };
  const bewegt = (e) => {
    if (!zug || e.pointerId !== zug.id) return; const p = lokal(e), l = zug.css[zug.css.length - 1];
    if (Math.hypot(p[0] - l[0], p[1] - l[1]) >= 2) { zug.css.push(p); plane(); }
  };
  const hoch = (e) => {
    finger.delete(e.pointerId); if (!zug || e.pointerId !== zug.id) return;
    const z = zug; zug = null; plane(); if (e.type === 'pointercancel') return;
    const doc = app.zustand().doc; if (!doc) return;
    const a = app.ansicht(), q = doc.quelle, zu = (x, y) => bildschirmZuQuelle({ x, y }, a, doc.geometrie, q.b, q.h);
    const schritt = Math.max(1, Math.ceil(z.css.length / 300));
    const punkte = z.css.filter((_, i) => i % schritt === 0 || i === z.css.length - 1).map(([x, y]) => zu(x, y)).map((p) => ({ x: Math.round(p.x * 1e5) / 1e5, y: Math.round(p.y * 1e5) / 1e5 }));
    const r = flaeche.getBoundingClientRect(), p0 = zu(r.width / 2, r.height / 2), p1 = zu(r.width / 2 + opts.groesse() / 2, r.height / 2);
    const radius = Math.hypot((p1.x - p0.x) * q.b, (p1.y - p0.y) * q.h) / Math.min(q.b, q.h);
    if (!punkte.some((p) => p.x > -0.05 && p.x < 1.05 && p.y > -0.05 && p.y < 1.05)) return;   // ganz neben dem Bild
    opts.onStrich({ punkte, radius: Math.round(radius * 1e5) / 1e5 });
  };
  flaeche.addEventListener('pointerdown', runter); flaeche.addEventListener('pointermove', bewegt);
  flaeche.addEventListener('pointerup', hoch); flaeche.addEventListener('pointercancel', hoch);
  return {
    /** Größe zeigen (Ring in der Bildmitte, kurz). */
    zeigeGroesse() { const r = flaeche.getBoundingClientRect(); ring = [r.width / 2, r.height / 2]; plane(); clearTimeout(ringTimer); ringTimer = setTimeout(() => { ring = null; plane(); }, 900); },
    zerstoere() {
      app.tippModus = false; clearTimeout(ringTimer); cancelAnimationFrame(rahmen);
      flaeche.removeEventListener('pointerdown', runter); flaeche.removeEventListener('pointermove', bewegt);
      flaeche.removeEventListener('pointerup', hoch); flaeche.removeEventListener('pointercancel', hoch); ueber.remove();
    },
  };
}

/** Gemeinsamer Rahmen je Modus: Werte ändern (Ziehen = ein Undo-Eintrag), Status, Aufräumen. */
function basis(ctx) {
  const { app } = ctx; const aus = [];
  const doc = () => app.zustand().doc;
  const finde = (id) => doc()?.schritte.find((s) => s.id === id) || null;
  /** Wert eines Schritts setzen; fehlt der Schritt, legt neu() ihn im selben Undo-Eintrag an. → Schritt-ID */
  function setze(schrittId, neu, pfad, wert, phase, name) {
    if (phase === 'start') app.setzeQualitaet('zieh');
    let id = schrittId;
    app.aendere((d) => {
      let s = id ? d.schritte.find((x) => x.id === id) : null;
      if (!s && neu) { s = neu(); d.schritte.push(s); }
      if (s) { setzePfad(s.params, pfad, wert); id = s.id; }
      return d;
    }, { zusammenfassen: `${name}:${pfad}`, name });
    if (phase === 'ende') { app.setzeQualitaet('voll'); app.zugEnde(); }
    return id;
  }
  /** Mehrere Werte auf einmal (Voreinstellung, Auto) – ein Undo-Eintrag. */
  function setzeViele(schrittId, neu, werte, name) {
    let id = schrittId;
    app.aendere((d) => {
      let s = id ? d.schritte.find((x) => x.id === id) : null;
      if (!s && neu) { s = neu(); d.schritte.push(s); }
      if (s) { for (const [k, v] of Object.entries(werte)) setzePfad(s.params, k, v); id = s.id; }
      return d;
    }, { name });
    return id;
  }
  function entferne(id, name) { app.aendere((d) => { d.schritte = d.schritte.filter((s) => s.id !== id); return d; }, { name }); }
  /** Wert in die Statuszeile (beim Ziehen), danach zurück zum Modus-Status. */
  const wertStatus = (vor, d, w, phase) => ctx.ui.wert(vor, `${d.titel} ${reglerWert(d, w)}`, phase);
  return { app, aus, doc, finde, setze, setzeViele, entferne, wertStatus, zerstoere() { for (const f of aus.splice(0)) try { f(); } catch (e) { console.warn(e); } } };
}

/** Modell-Frage im Blatt (lädt nie still). → true, wenn das Modell jetzt da ist. */
async function frageModell(ctx, ids, hinweisText) {
  const M = await import('./modelle.js');
  return new Promise((ok) => {
    let fertig = false;
    const h = ctx.app.blatt('Modell laden', (c) => M.modellUI(c, { ids, ki: ctx.app.ki, hinweis: hinweisText, onFertig: (g) => { if (fertig) return; fertig = true; ok(!!g); setTimeout(() => h.schliesse(), 0); } }));
  });
}

// ================================================================ 1) Licht und Schatten (Abwedeln / Nachbelichten)
const LICHT_AUTO = [
  { id: 'staerke', titel: 'Stärke', min: 0, max: 100, standard: 50, einheit: '%' },
  { kopf: 'Feinregler (50 = wie der Stil)' },
  { id: 'fein.licht', titel: 'Licht formen', min: 0, max: 100, standard: 50 },
  { id: 'fein.mikro', titel: 'Mikrokontrast', min: 0, max: 100, standard: 50 },
  { id: 'fein.glanz', titel: 'Glanzlichter', min: 0, max: 100, standard: 50 },
  { id: 'fein.rand', titel: 'Randlicht', min: 0, max: 100, standard: 50 },
  { id: 'fein.farbe', titel: 'Farbtiefe', min: 0, max: 100, standard: 50 },
  { id: 'fein.malen', titel: 'Malerisch', min: 0, max: 100, standard: 50 },
];
const PINSEL_DEFS = [
  { id: 'groesse', titel: 'Größe', min: 8, max: 160, standard: 44, einheit: 'px' },
  { id: 'deckkraft', titel: 'Stärke je Strich', min: 5, max: 100, standard: 30, einheit: '%' },
  { id: 'haerte', titel: 'Härte', min: 0, max: 100, standard: 30, einheit: '%' },
];
function licht(ctx) {
  const B = basis(ctx), { app, L, wz, rg, ui } = { ...ctx, ...B }, m = MERK.licht;
  const schritt = () => B.doc()?.schritte.filter((s) => s.art === ART.PLASTIK && !s.maske).pop() || null;
  const neu = (start = {}) => () => L.plastikSchritt(start);
  let pin = null, griffe = [];
  const istPinsel = () => m.unter === 'abwedeln' || m.unter === 'nachbelichten';
  const pinselName = () => (m.unter === 'nachbelichten' ? 'Nachbelichten' : 'Abwedeln');
  function status() {
    const s = schritt();
    if (istPinsel()) ui.status('Pinsel', `${pinselName()} ${m.deckkraft} %`);
    else if (!s) ui.status('Licht und Schatten', 'Stil wählen oder malen');
    else { const stil = L.PLASTIK_STILE[s.params.stil]?.titel || 'Plastisch'; ui.status('Du bearbeitest', `Licht: ${stil} ${Math.round(s.params.staerke ?? 50)} %`); }
  }
  function maskeRegistrieren() {
    const s = schritt();
    ui.maske(s ? (an) => L.zeigeKarte(app, schritt()?.id, an) : null, 'Karte');
  }
  function baue() {
    pin?.zerstoere(); pin = null; rg.textContent = ''; griffe = []; ui.wertAus(); const s = schritt();
    wz.innerHTML = knopf(`${ICON.auto}<span>Automatisch</span>`, `data-u="auto" aria-pressed="${m.unter === 'auto'}"`)
      + knopf(`${ICON.hell}<span>Abwedeln</span>`, `data-u="abwedeln" aria-pressed="${m.unter === 'abwedeln'}"`)
      + knopf(`${ICON.dunkel}<span>Nachbelichten</span>`, `data-u="nachbelichten" aria-pressed="${m.unter === 'nachbelichten'}"`);
    if (!istPinsel()) {
      const stil = s?.params?.stil;
      knopfReihe(rg, Object.entries(L.PLASTIK_STILE).map(([id, st]) => knopf(esc(st.titel), `data-stil="${id}" aria-pressed="${stil === id}"`)).join(''));
      const h = regler(rg, LICHT_AUTO, s?.params || {}, (d, w, phase) => {
        B.setze(schritt()?.id, neu({ staerke: 50 }), d.id, w, phase, 'Licht und Schatten');
        B.wertStatus('Licht und Schatten', d, w, phase); if (phase === 'ende') { status(); maskeRegistrieren(); }
      });
      griffe.push(h);
      if (!s) hinweis(rg, ICON.hell, 'Licht formt das Bild', 'Stil antippen: das Bild bekommt Tiefe aus Licht und Schatten. Oder oben „Abwedeln“ / „Nachbelichten“ wählen und selbst malen.');
    } else {
      regler(rg, PINSEL_DEFS, m, (d, w, phase) => {
        m[d.id] = w; if (d.id === 'groesse') pin?.zeigeGroesse();
        if (phase === 'ende') status(); else ui.wert('Pinsel', `${d.titel} ${reglerWert(d, w)}`, phase);
      });
      const striche = s?.params?.pinsel?.striche?.length || 0;
      const r = regler(rg, [{ id: 'pinselStaerke', titel: 'Wirkung aller Striche', min: 0, max: 200, standard: 100, einheit: '%' }], s?.params || {}, (d, w, phase) => {
        B.setze(schritt()?.id, neu({ staerke: 0 }), d.id, w, phase, 'Pinsel-Wirkung'); B.wertStatus('Pinsel', d, w, phase); if (phase === 'ende') status();
      });
      griffe.push(r);
      knopfReihe(rg, knopf(`${ICON.muell}<span>Alle Striche löschen</span>`, `data-a="leeren" ${striche ? '' : 'disabled'}`, 'chip leise'));
      pin = pinsel(app, {
        groesse: () => m.groesse,
        farbe: () => (m.unter === 'nachbelichten' ? 'rgba(90,120,220,.38)' : 'rgba(255,214,140,.42)'),
        onStrich: ({ punkte, radius }) => {
          const strich = { punkte, radius, haerte: m.haerte / 100, deckkraft: m.deckkraft / 100, modus: m.unter };
          const x = schritt();
          if (x) L.malePinsel(app, x.id, strich);
          else { const n = L.plastikSchritt({ staerke: 0 }); n.params.pinsel.striche.push({ id: neueId('p'), ...strich }); app.aendere((d) => { d.schritte.push(n); return d; }, { name: pinselName() }); }
          const k = rg.querySelector('[data-a="leeren"]'); if (k) k.disabled = false;
          maskeRegistrieren();
        },
      });
    }
    status(); maskeRegistrieren();
  }
  const klick = (e) => {
    const u = e.target.closest('[data-u]'); if (u) { m.unter = u.dataset.u; baue(); return; }
    const st = e.target.closest('[data-stil]');
    if (st) { const id = B.setzeViele(schritt()?.id, neu({ staerke: 50 }), { stil: st.dataset.stil }, 'Stil'); if (id) baue(); return; }
    if (e.target.closest('[data-a="leeren"]')) { const s = schritt(); if (s) L.pinselLeeren(app, s.id); baue(); }
  };
  wz.addEventListener('click', klick); rg.addEventListener('click', klick);
  B.aus.push(app.on('zustand', () => { const x = schritt(); if (x) for (const g of griffe) g.setze(x.params); }));
  B.aus.push(() => { wz.removeEventListener('click', klick); rg.removeEventListener('click', klick); pin?.zerstoere(); L.ansichtAus(app); });
  baue();
  return B;
}

// ================================================================ 2) Schärfe in Stufen
const SCHUTZ = [
  { kopf: 'Schutz' },
  { id: 'rauschSchwelle', titel: 'Rauschschwelle', min: 0, max: 100, standard: 40, hinweis: 'Rauschen unter dieser Schwelle wird nicht geschärft' },
  { id: 'halo', titel: 'Halo-Bremse', min: 0, max: 100, standard: 60, hinweis: 'Begrenzt helle/dunkle Säume an Kanten' },
  { id: 'hautschutz', titel: 'Hautschutz', min: 0, max: 100, standard: 60, hinweis: 'Haut wird weniger geschärft' },
];
function schaerfe(ctx) {
  const B = basis(ctx), { app, L, wz, rg, ui } = { ...ctx, ...B }, m = MERK.schaerfe;
  const schritt = () => B.doc()?.schritte.filter((s) => s.art === ART.MEHRBAND && !s.maske).pop() || null;
  const neu = () => L.mehrbandSchritt({});
  const defs = [{ kopf: 'Bänder (+ schärfen, − beruhigen)' }, ...L.BAENDER.map((b, k) => ({ id: b.id, titel: b.titel, min: -100, max: 100, standard: 0, band: k + 1, hinweis: b.beschreibung })), ...SCHUTZ];
  const status = (t) => ui.status(schritt() || t ? 'Du bearbeitest' : 'Schärfe in Stufen', t || (schritt() ? 'Schärfe in Stufen' : 'Auto oder Band ziehen'));
  let h = null, sicht = null;
  function sichtbarkeit() {
    if (!sicht) return;
    const d = B.doc(); if (!d) return; const a = app.ansicht(), z = d.geometrie.zuschnitt, ausB = d.quelle.b * z.b, ausH = d.quelle.h * z.h;
    const px = Math.min(a.cssB / ausB, a.cssH / ausH) * (a.zoom || 1) * (a.dpr || 1);
    const weg = L.bandSichtbarkeit(px).filter((b) => !b.sichtbar).map((b) => L.BAENDER.find((x) => x.id === b.id)?.titel).filter(Boolean);
    const t = weg.length ? `In dieser Ansicht nur angedeutet: ${weg.join(', ')}. Zum Prüfen auf 100 % zoomen (Doppeltipp ins Bild) oder das gesicherte Bild ansehen.` : 'Alle Bänder sind in dieser Ansicht sichtbar.';
    if (sicht.textContent !== t) sicht.textContent = t;
  }
  function baue() {
    rg.textContent = ''; ui.wertAus();
    wz.innerHTML = knopf(`${ICON.auto}<span>Auto-Schärfe</span>`, 'data-a="auto"')
      + knopf(`${ICON.maske}<span>Wirkung zeigen</span>`, `data-a="wirkung" aria-pressed="${m.wirkung}"`)
      + knopf(`${ICON.zurueck}<span>Zurücksetzen</span>`, `data-a="null" ${schritt() ? '' : 'disabled'}`);
    h = regler(rg, defs, schritt()?.params || {}, (d, w, phase) => {
      const id = B.setze(schritt()?.id, neu, d.id, w, phase, 'Schärfe');
      if (d.band && m.wirkung) { if (phase === 'ende') L.ansichtAus(app); else if (id) L.zeigeBand(app, id, d.band); }
      B.wertStatus('Schärfe', d, w, phase); if (phase === 'ende') { status(); const k = wz.querySelector('[data-a="null"]'); if (k) k.disabled = false; }
    });
    sicht = document.createElement('p'); sicht.className = 'mo-leise'; rg.appendChild(sicht); sichtbarkeit();
    status();
  }
  const klick = async (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'wirkung') { m.wirkung = !m.wirkung; e.target.closest('[data-a]').setAttribute('aria-pressed', String(m.wirkung)); ctx.meldung(m.wirkung ? 'Beim Ziehen eines Bandes siehst du, wo es wirkt (gelb).' : 'Beim Ziehen siehst du das Ergebnis.'); }
    if (a === 'null') { const s = schritt(); if (s) { B.entferne(s.id, 'Schärfe zurücksetzen'); baue(); } }
    if (a === 'auto') {
      const k = e.target.closest('button'); k.disabled = true; status('Schärfe wird gemessen …');
      try {
        const v = await L.autoSchaerfe(app);
        const werte = {}; for (const id of ['fein', 'haare', 'textur', 'kanten', 'plastizitaet', 'rauschSchwelle', 'hautschutz']) if (typeof v[id] === 'number') werte[id] = Math.round(v[id]);
        B.setzeViele(schritt()?.id, neu, werte, 'Auto-Schärfe'); baue();
        if (v.grund) ctx.meldung(v.grund);
      } catch (err) { ctx.fehler(err); status(); } finally { k.disabled = false; }
    }
  };
  wz.addEventListener('click', klick);
  B.aus.push(() => { wz.removeEventListener('click', klick); L.ansichtAus(app); });
  B.aus.push(app.on('zustand', () => { const s = schritt(); if (s && h) h.setze(s.params); }));
  B.aus.push(app.on('gerendert', sichtbarkeit));
  ui.maske(null);
  baue();
  return B;
}

// ================================================================ 3) Bereiche nach Farbe
const BEREICH_DEFS = [
  { id: 'belichtung', titel: 'Helligkeit', min: -3, max: 3, standard: 0, schritt: 0.05, einheit: 'EV' },
  { id: 'lichter', titel: 'Lichter', min: -100, max: 100, standard: 0 },
  { id: 'leuchten', titel: 'Leuchten', min: 0, max: 100, standard: 0 },
  { id: 'waerme', titel: 'Wärme', min: -100, max: 100, standard: 0 },
  { id: 'saettigung', titel: 'Sättigung', min: -100, max: 100, standard: 0 },
];
const BEREICH_AUSWAHL = [
  { kopf: 'Was gehört dazu?' },
  { id: 'toleranz', titel: 'Toleranz', min: 0, max: 100, standard: 35, hinweis: 'Wie ähnlich die Farbe sein muss' },
  { id: 'weich', titel: 'Weiche Kante', min: 0, max: 100, standard: 30 },
];
const BEREICH_VORLAGEN = [
  { id: 'hervor', titel: 'Hervorheben', werte: { belichtung: 0.4, lichter: 0, leuchten: 15, saettigung: 15, waerme: 0 } },
  { id: 'leuchten', titel: 'Leuchten lassen', werte: { belichtung: 0.25, leuchten: 60, waerme: 25, saettigung: 10, lichter: 0 } },
  { id: 'dunkler', titel: 'Abdunkeln', werte: { belichtung: -0.6, lichter: -20, leuchten: 0, saettigung: -10, waerme: 0 } },
  { id: 'grau', titel: 'Farbe weg', werte: { saettigung: -100, belichtung: 0, leuchten: 0, waerme: 0, lichter: 0 } },
];
function bereiche(ctx) {
  const B = basis(ctx), { app, L, wz, rg, ui } = { ...ctx, ...B }, m = MERK.bereiche;
  const liste = () => (B.doc()?.schritte || []).filter((s) => s.art === ART.BEREICH);
  const aktiv = () => liste().find((s) => s.id === m.aktiv) || null;
  let neuFuer = null, laeuft = false, blitz = 0, h = null;
  const titel = (s) => s?.name || 'Bereich';
  function status() {
    const s = aktiv();
    if (neuFuer) ui.status(`${titel(s)} · neu antippen`, 'Tippe auf die neue Farbe');
    else if (s) ui.status('Du bearbeitest', titel(s));
    else ui.status('Bereiche', 'Tippe auf eine Farbe im Bild');
  }
  function maskeRegistrieren() { const s = aktiv(); ui.maske(s ? (an) => L.zeigeMaske(app, aktiv()?.id, an) : null, 'Maske'); }
  function blitzeMaske(id) {
    clearTimeout(blitz); if (ui.maskeAn()) return;
    L.zeigeMaske(app, id, true); blitz = setTimeout(() => { blitz = 0; if (!ui.maskeAn()) L.ansichtAus(app); }, 1400);
  }
  /** Kurzes Aufblitzen der Maske sofort beenden (sonst sähe man beim Einstellen die Maske statt des Ergebnisses). */
  function blitzAus() { if (!blitz) return; clearTimeout(blitz); blitz = 0; if (!ui.maskeAn()) L.ansichtAus(app); }
  function leiste() {
    const l = liste();
    wz.innerHTML = l.map((s) => `<div class="mo-bereich" data-id="${s.id}" aria-current="${s.id === m.aktiv}">
        <button type="button" class="mo-auge" data-auge="${s.id}" aria-pressed="${s.an !== false}" aria-label="${esc(titel(s))} ${s.an !== false ? 'ausblenden' : 'einblenden'}">${s.an !== false ? ICON.auge : ICON.augeZu}</button>
        <button type="button" class="mo-name" data-wahl="${s.id}"><i class="mo-punkt" style="background:${oklabZuHex(s.params.ziel)}"></i>${esc(titel(s))}</button></div>`).join('')
      + knopf(`${ICON.plus}<span>Neu</span>`, `data-a="neu" aria-pressed="${!aktiv() && !neuFuer}"`);
    inSicht(wz, wz.querySelector('[aria-current="true"]'));
  }
  function baue() {
    rg.textContent = ''; ui.wertAus(); const s = aktiv(); leiste(); maskeRegistrieren(); status();
    if (!s) {
      hinweis(rg, ICON.tipp, 'Etwas hervorheben', 'Tippe im Bild auf das, was du ändern willst – zum Beispiel ein Fenster, den Himmel oder ein Kleid. Bildwerk wählt dabei nach <b>Farbe</b>: ähnliche Farben an dieser Stelle gehören dazu.');
      return;
    }
    const kopf = document.createElement('label'); kopf.className = 'mo-namefeld';
    kopf.innerHTML = `<span class="mo-farbfeld" style="background:${oklabZuHex(s.params.ziel)}"></span><input type="text" value="${esc(s.etikett || farbname(s.params.ziel))}" aria-label="Name des Bereichs" maxlength="40" enterkeyhint="done"><span class="mo-stift">${ICON.stift}</span>`;
    rg.appendChild(kopf);
    const feld = kopf.querySelector('input');
    feld.addEventListener('change', () => { const t = feld.value.trim(); umbenennen(s.id, t || farbname(s.params.ziel), !t); });
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') feld.blur(); });
    knopfReihe(rg, BEREICH_VORLAGEN.map((v) => knopf(esc(v.titel), `data-vorlage="${v.id}"`)).join(''));
    h = regler(rg, [...BEREICH_DEFS, ...BEREICH_AUSWAHL], s.params, (d, w, phase) => {
      const id = aktiv()?.id; if (!id) return;
      if (phase === 'start' && d.id !== 'toleranz' && d.id !== 'weich') blitzAus();
      B.setze(id, null, d.id, w, phase, titel(aktiv()));
      if (d.id === 'toleranz' || d.id === 'weich') { if (phase === 'start') L.zeigeMaske(app, id, true); if (phase === 'ende' && !ui.maskeAn()) L.ansichtAus(app); }
      B.wertStatus(titel(aktiv()), d, w, phase); if (phase === 'ende') status();
    });
    const zus = s.params.modus !== 'ueberall';
    knopfReihe(rg, `<div class="mo-seg" role="group" aria-label="Fläche">${knopf('Nur diese Fläche', `data-modus="zusammen" aria-pressed="${zus}"`)}${knopf('Überall im Bild', `data-modus="ueberall" aria-pressed="${!zus}"`)}</div>`);
    knopfReihe(rg, knopf(`${ICON.tipp}<span>Neu antippen</span>`, 'data-a="punkt"') + knopf(`${ICON.muell}<span>Löschen</span>`, 'data-a="weg"', 'chip leise'));
  }
  function umbenennen(id, etikett, auto = false) {
    app.aendere((d) => { const s = d.schritte.find((x) => x.id === id); if (s) { s.etikett = etikett; s.etikettAuto = auto; s.name = `Bereich ${s.nr || ''} – ${etikett}`.replace('Bereich  –', 'Bereich –'); } return d; }, { name: 'Bereich umbenennen' });
    leiste(); status();
  }
  /** Ähnliche Farbe wie ein vorhandener Bereich? Dann diesen wählen statt doppelt anlegen. */
  function gleicherBereich(ziel) {
    for (const s of liste()) {
      const z = s.params.ziel; if (!Array.isArray(z)) continue;
      const g = L.bereichGrenzen(s.params.toleranz, s.params.weich), dist = Math.hypot((ziel[0] - z[0]) * g.gew[0], (ziel[1] - z[1]) * g.gew[1], (ziel[2] - z[2]) * g.gew[1]);
      if (dist < g.gr[0] * 0.6) return s;
    }
    return null;
  }
  async function tipp(p) {
    if (laeuft || !B.doc() || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) return;
    laeuft = true;
    try {
      if (neuFuer) { const id = neuFuer; neuFuer = null; await L.bereichPunkt(app, id, p); const s = B.finde(id); if (s && s.etikettAuto !== false) umbenennen(id, farbname(s.params.ziel), true); baue(); blitzeMaske(id); return; }
      const s = await L.neuerBereich(app, p, { modus: 'zusammen' });
      const gleich = gleicherBereich(s.params.ziel);
      if (gleich) { m.aktiv = gleich.id; baue(); blitzeMaske(gleich.id); ctx.meldung(`${titel(gleich)} gewählt`); return; }
      const nr = Math.max(0, ...liste().map((x) => x.nr || 0)) + 1, etikett = farbname(s.params.ziel);
      Object.assign(s, { nr, etikett, etikettAuto: true, name: `Bereich ${nr} – ${etikett}` });
      app.aendere((d) => { d.schritte.push(s); return d; }, { name: s.name });
      m.aktiv = s.id; baue(); blitzeMaske(s.id);
    } catch (e) { ctx.fehler(e); } finally { laeuft = false; }
  }
  const klick = (e) => {
    const auge = e.target.closest('[data-auge]');
    if (auge) { const id = auge.dataset.auge; app.aendere((d) => { const s = d.schritte.find((x) => x.id === id); if (s) s.an = s.an === false; return d; }, { name: 'Bereich ein/aus' }); leiste(); return; }
    const w = e.target.closest('[data-wahl]'); if (w) { m.aktiv = w.dataset.wahl; neuFuer = null; baue(); blitzeMaske(m.aktiv); return; }
    const v = e.target.closest('[data-vorlage]');
    if (v && aktiv()) { blitzAus(); const vl = BEREICH_VORLAGEN.find((x) => x.id === v.dataset.vorlage); B.setzeViele(aktiv().id, null, vl.werte, `${titel(aktiv())}: ${vl.titel}`); h?.setze(aktiv().params); ui.status('Du bearbeitest', `${titel(aktiv())} – ${vl.titel}`); return; }
    const mo = e.target.closest('[data-modus]');
    if (mo && aktiv()) { B.setzeViele(aktiv().id, null, { modus: mo.dataset.modus }, 'Fläche'); baue(); blitzeMaske(m.aktiv); return; }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'neu') { m.aktiv = null; neuFuer = null; ui.maskeAus(); baue(); }
    if (a === 'punkt' && aktiv()) { neuFuer = aktiv().id; status(); ctx.meldung('Tippe im Bild auf die neue Farbe.'); }
    if (a === 'weg' && aktiv()) { const s = aktiv(); ui.maskeAus(); B.entferne(s.id, `${titel(s)} löschen`); m.aktiv = null; baue(); }
  };
  wz.addEventListener('click', klick); rg.addEventListener('click', klick);
  B.aus.push(app.on('tipp', (p) => { tipp(p); }));
  B.aus.push(app.on('zustand', () => { const s = aktiv(); if (s && h) h.setze(s.params); }));
  B.aus.push(() => { wz.removeEventListener('click', klick); rg.removeEventListener('click', klick); clearTimeout(blitz); L.ansichtAus(app); });
  if (m.aktiv && !aktiv()) m.aktiv = null;
  if (!m.aktiv) m.aktiv = liste().slice(-1)[0]?.id || null;
  baue();
  return Object.assign(B, { _tipp: tipp });
}

// ================================================================ 4) Haarfarbe · 5) Hintergrund (beide brauchen eine Maske)
const HAAR_DEFS = [
  { id: 'staerke', titel: 'Stärke', min: 0, max: 100, standard: 80, einheit: '%' },
  { id: 'helligkeit', titel: 'Helligkeit', min: -100, max: 100, standard: 0 },
  { id: 'glanz', titel: 'Glanz erhalten', min: 0, max: 100, standard: 60 },
];
const FOKUS_DEFS = [
  { id: 'unschaerfe', titel: 'Unschärfe', min: 0, max: 100, standard: 50 },
  { id: 'abdunkeln', titel: 'Abdunkeln', min: 0, max: 100, standard: 15 },
  { id: 'entsaettigen', titel: 'Entsättigen', min: 0, max: 100, standard: 15 },
  { kopf: 'Feinheiten' },
  { id: 'kante', titel: 'Übergang', min: 0, max: 100, standard: 40, hinweis: 'Wie weich der Rand des Motivs ausläuft' },
  { id: 'lichter', titel: 'Lichtpunkte', min: 0, max: 100, standard: 50, hinweis: 'Helle Punkte im Hintergrund werden zu runden Lichtern' },
];
const FOKUS_VORLAGEN = [
  { id: 'sanft', titel: 'Sanft', werte: { unschaerfe: 30, abdunkeln: 8, entsaettigen: 8 } },
  { id: 'portraet', titel: 'Porträt', werte: { unschaerfe: 60, abdunkeln: 18, entsaettigen: 15 } },
  { id: 'stark', titel: 'Stark', werte: { unschaerfe: 90, abdunkeln: 30, entsaettigen: 30 } },
  { id: 'nurdunkel', titel: 'Nur dunkler', werte: { unschaerfe: 0, abdunkeln: 40, entsaettigen: 20 } },
];
/** Gemeinsamer Ablauf: Maske holen (Modell oder selbst wählen), Schritt anlegen, dann Regler. */
function maskenModus(ctx, art) {
  const B = basis(ctx), { app, L, wz, rg, ui } = { ...ctx, ...B };
  const haar = art === 'haare';
  const ARTX = haar ? ART.HAARFARBE : ART.FOKUS, zweck = haar ? 'haar' : 'motiv', name = haar ? 'Haarfarbe' : 'Hintergrund';
  const schritt = () => (B.doc()?.schritte || []).filter((s) => s.art === ARTX).pop() || null;
  let auswahl = null, h = null, altParams = null, altId = null;
  function status(t) {
    const s = schritt();
    if (t) { ui.status('Du bearbeitest', t); return; }
    if (auswahl) ui.status('Auswahl', haar ? 'Haare selbst wählen' : 'Motiv selbst wählen');
    else if (!s) ui.status(name, haar ? 'Zuerst die Haare finden' : 'Zuerst das Motiv finden');
    else if (haar) { const f = L.HAARFARBEN.find((x) => x.farbe.toLowerCase() === String(s.params.farbe).toLowerCase()); ui.status('Du bearbeitest', `Haarfarbe – ${f ? f.titel : 'Eigene Farbe'} ${Math.round(s.params.staerke ?? 80)} %`); }
    else ui.status('Du bearbeitest', `Hintergrund – Unschärfe ${Math.round(s.params.unschaerfe ?? 50)}`);
  }
  function maskeRegistrieren() { ui.maske(schritt() && !auswahl ? (an) => L.zeigeMaske(app, schritt()?.id, an) : null, 'Maske'); }
  function anlegen(maske, extra = {}) {
    const p = { ...(altParams || {}), ...extra };
    const s = haar ? L.haarfarbeSchritt(maske, p) : L.fokusSchritt(maske, p);
    const weg = altId; altId = null; altParams = null;
    app.aendere((d) => { if (weg) d.schritte = d.schritte.filter((x) => x.id !== weg); d.schritte.push(s); return d; }, { name });
    auswahl?.zerstoere(); auswahl = null; baue();
    clearTimeout(anlegen.t); if (!ui.maskeAn()) { L.zeigeMaske(app, s.id, true); anlegen.t = setTimeout(() => { anlegen.t = 0; if (!ui.maskeAn()) L.ansichtAus(app); }, 1400); }
  }
  function blitzAus() { if (!anlegen.t) return; clearTimeout(anlegen.t); anlegen.t = 0; if (!ui.maskeAn()) L.ansichtAus(app); }
  async function automatisch(knopfEl) {
    knopfEl.disabled = true; status(haar ? 'Haare werden gesucht …' : 'Motiv wird gesucht …');
    try {
      let bed = await L.modellBedarf(app, zweck);
      if (!bed.bereit) {
        const ok = await frageModell(ctx, bed.fehlen, haar ? 'Zum Finden der Haare wird ein kleines Modell geladen (unter 1 MB, beim ersten Mal dazu die Bild-Laufzeit). Es bleibt danach auf dem Gerät, auch offline.' : 'Zum Finden des Motivs wird das Modell „Haut, Haare, Kleidung“ geladen (etwa 16 MB, beim ersten Mal dazu die Bild-Laufzeit). Es bleibt danach auf dem Gerät, auch offline.');
        if (!ok) { ctx.meldung('Ohne Modell: „Selbst wählen“ nutzen.'); return; }
        bed = await L.modellBedarf(app, zweck); if (!bed.bereit) return;
      }
      const maske = haar ? await L.haarMaske(app) : await L.motivMaske(app);
      anlegen(maske, haar ? {} : { maskeArt: 'motiv' });
    } catch (e) { ctx.fehler(e); } finally { knopfEl.disabled = false; status(); }
  }
  async function selbst() {
    const A = await import('./auswahl.js');
    rg.textContent = ''; wz.textContent = '';
    knopfReihe(rg, knopf(`${ICON.zurueck}<span>Zurück</span>`, 'data-a="zurueck"', 'chip leise'));
    const box = document.createElement('div'); rg.appendChild(box);
    const werkzeuge = haar ? ['farbe', 'pinsel', 'antippen', 'haar'] : ['antippen', 'person', 'pinsel', 'hintergrund', 'farbe'];
    auswahl = A.auswahlUI(box, { app, werkzeug: wz, ohneLokal: true, werkzeuge, onFertig: (ref) => {
      const hinter = !haar && ref.teile?.[0]?.quelle === 'hintergrund' && ref.teile.length === 1;
      anlegen(ref, haar ? {} : { maskeArt: hinter ? 'hintergrund' : 'motiv' });
    } });
    auswahl.setze?.({ werkzeug: werkzeuge[0] });
    status(); maskeRegistrieren();
  }
  function baue() {
    rg.textContent = ''; ui.wertAus(); h = null; const s = schritt(); maskeRegistrieren(); status();
    if (!s || altId) {
      wz.innerHTML = knopf(`${haar ? ICON.auto : ICON.person}<span>${haar ? 'Haare finden' : 'Motiv finden'}</span>`, 'data-a="auto"', 'chip haupt') + knopf(`${ICON.pinsel}<span>Selbst wählen</span>`, 'data-a="selbst"')
        + (altId ? knopf(`${ICON.zurueck}<span>Abbrechen</span>`, 'data-a="abbrechen"', 'chip leise') : '');
      if (haar) hinweis(rg, ICON.pinsel, 'Haarfarbe ändern', '„Haare finden“ erkennt die Haare mit einem kleinen Modell (unter 1 MB, wird einmal nach Rückfrage geladen). Ohne Modell: „Selbst wählen“ – auf die Haarfarbe tippen oder darüber malen. Die Struktur der Haare bleibt erhalten.');
      else hinweis(rg, ICON.person, 'Hintergrund weich machen', '„Motiv finden“ erkennt Personen mit einem Modell (etwa 16 MB, wird einmal nach Rückfrage geladen). Für andere Motive: „Selbst wählen“ – antippen oder übermalen. Alles außerhalb wird weich, dunkler oder blasser.');
      return;
    }
    if (haar) {
      wz.innerHTML = L.HAARFARBEN.map((f) => `<button type="button" class="mo-farbe" data-farbe="${f.farbe}" aria-pressed="${f.farbe.toLowerCase() === String(s.params.farbe).toLowerCase()}" aria-label="${esc(f.titel)}"><i style="background:${f.farbe}"></i><span>${esc(f.titel)}</span></button>`).join('')
        + `<label class="mo-farbe eigen" aria-label="Eigene Farbe"><i style="background:conic-gradient(#c33,#c93,#9c3,#3c9,#39c,#93c,#c33)"></i><span>Eigene</span><input type="color" value="${esc(s.params.farbe)}" data-eigen></label>`;
      requestAnimationFrame(() => inSicht(wz, wz.querySelector('[aria-pressed="true"]')));
    } else {
      const umk = s.params.maskeArt === 'hintergrund';
      wz.innerHTML = FOKUS_VORLAGEN.map((v) => knopf(esc(v.titel), `data-vorlage="${v.id}"`)).join('') + knopf(`${ICON.umkehren}<span>Umkehren</span>`, `data-a="umkehren" aria-pressed="${umk}"`);
    }
    h = regler(rg, haar ? HAAR_DEFS : FOKUS_DEFS, s.params, (d, w, phase) => {
      if (phase === 'start') blitzAus();
      B.setze(schritt()?.id, null, d.id, w, phase, name); B.wertStatus(name, d, w, phase); if (phase === 'ende') status();
    });
    knopfReihe(rg, knopf(`${ICON.tipp}<span>Maske neu</span>`, 'data-a="neumaske"') + knopf(`${ICON.muell}<span>${name} entfernen</span>`, 'data-a="weg"', 'chip leise'));
  }
  const klick = (e) => {
    if (e.target.closest('.aw')) return;   // Knöpfe der eingebetteten Auswahl (Umkehren, Fertig …) gehören auswahl.js
    const f = e.target.closest('[data-farbe]');
    if ((f || e.target.closest('[data-vorlage]')) && schritt()) blitzAus();
    if (f && schritt()) { B.setzeViele(schritt().id, null, { farbe: f.dataset.farbe }, 'Haarfarbe'); for (const b of wz.querySelectorAll('[data-farbe]')) b.setAttribute('aria-pressed', String(b === f)); status(); return; }
    const v = e.target.closest('[data-vorlage]');
    if (v && schritt()) { const vl = FOKUS_VORLAGEN.find((x) => x.id === v.dataset.vorlage); B.setzeViele(schritt().id, null, vl.werte, `Hintergrund: ${vl.titel}`); h?.setze(schritt().params); status(`Hintergrund – ${vl.titel}`); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    const was = a.dataset.a;
    if (was === 'auto') automatisch(a);
    if (was === 'selbst') selbst().catch(ctx.fehler);
    if (was === 'zurueck' || was === 'abbrechen') { auswahl?.zerstoere(); auswahl = null; if (was === 'abbrechen') { altId = null; altParams = null; } baue(); }
    if (was === 'umkehren' && schritt()) { const s = schritt(); const neuArt = s.params.maskeArt === 'hintergrund' ? 'motiv' : 'hintergrund'; B.setzeViele(s.id, null, { maskeArt: neuArt }, 'Umkehren'); a.setAttribute('aria-pressed', String(neuArt === 'hintergrund')); ctx.meldung(neuArt === 'hintergrund' ? 'Jetzt wirkt es auf das Motiv.' : 'Jetzt wirkt es auf den Hintergrund.'); }
    if (was === 'neumaske' && schritt()) { const s = schritt(); altId = s.id; altParams = structuredClone(s.params); ui.maskeAus(); baue(); }
    if (was === 'weg' && schritt()) { ui.maskeAus(); B.entferne(schritt().id, `${name} entfernen`); baue(); }
  };
  const eingabe = (e) => { if (e.target.matches?.('[data-eigen]') && schritt()) { B.setze(schritt().id, null, 'farbe', e.target.value, 'zieh', 'Haarfarbe'); status(); } };
  const eingabeEnde = (e) => { if (e.target.matches?.('[data-eigen]')) { app.zugEnde(); for (const b of wz.querySelectorAll('[data-farbe]')) b.setAttribute('aria-pressed', 'false'); } };
  wz.addEventListener('click', klick); rg.addEventListener('click', klick); wz.addEventListener('input', eingabe); wz.addEventListener('change', eingabeEnde);
  B.aus.push(app.on('zustand', () => { const s = schritt(); if (s && h && !auswahl) h.setze(s.params); }));
  B.aus.push(() => { wz.removeEventListener('click', klick); rg.removeEventListener('click', klick); wz.removeEventListener('input', eingabe); wz.removeEventListener('change', eingabeEnde); clearTimeout(anlegen.t); auswahl?.zerstoere(); auswahl = null; L.ansichtAus(app); });
  baue();
  return B;
}

/**
 * Einstieg für app.js. id: 'licht' | 'schaerfe' | 'bereiche' | 'haare' | 'hintergrund'.
 * ctx: { app, L (labor.js), wz (#werkzeug), rg (#regler), ui: { status, wert, maske, maskeAn, maskeAus }, meldung, fehler }
 */
export function modusUI(id, ctx) {
  if (id === 'licht') return licht(ctx);
  if (id === 'schaerfe') return schaerfe(ctx);
  if (id === 'bereiche') return bereiche(ctx);
  if (id === 'haare' || id === 'hintergrund') return maskenModus(ctx, id);
  throw new Error('Unbekannter Modus ' + id);
}
