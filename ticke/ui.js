// Wie ich ticke – Bausteine der Oberfläche (ARCH.md §5). Keine Abhängigkeit zu kern.js (kein Kreis-Import).
// Alles gibt HTML-Text zurück (zum Einsetzen) oder steuert ein übergebenes Element. Texte immer durch esc().

export const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RUHIG = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

// ---------- Symbole (selbst gezeichnet, 24×24, currentColor) ----------
const PFADE = {
  start: '<path d="M4 11.5L12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
  fragen: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/>',
  profil: '<path d="M4 7h16M4 12h16M4 17h16" opacity=".35"/><path d="M8 7h5M10 12h7M6 17h5" stroke-width="3.2"/>',
  passt: '<path d="M12 3.5l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.7z"/>',
  training: '<path d="M4 14a8 8 0 0 1 16 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1.6"/><path d="M4 19h16"/>',
  text: '<path d="M5 5h14M5 9.5h14M5 14h9M5 18.5h6"/><path d="M15.5 19.5l4-4"/>',
  zahnrad: '<path d="M19.16 9.45L21.78 9.92L21.78 14.08L19.16 14.55L18.87 15.26L20.39 17.44L17.44 20.39L15.26 18.87L14.55 19.16L14.08 21.78L9.92 21.78L9.45 19.16L8.74 18.87L6.56 20.39L3.61 17.44L5.13 15.26L4.84 14.55L2.22 14.08L2.22 9.92L4.84 9.45L5.13 8.74L3.61 6.56L6.56 3.61L8.74 5.13L9.45 4.84L9.92 2.22L14.08 2.22L14.55 4.84L15.26 5.13L17.44 3.61L20.39 6.56L18.87 8.74Z" stroke-width="1.7"/><circle cx="12" cy="12" r="3.2"/>',
  weiter: '<path d="M9 5l7 7-7 7"/>',
  zurueck: '<path d="M15 5l-7 7 7 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  telefon: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
  kopieren: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  sichern: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  laden: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14"/>',
  loeschen: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  schliessen: '<path d="M6 6l12 12M18 6L6 18"/>',
  schloss: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  herz: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
};
export function sym(name, klasse = '') {
  return `<svg class="sym ${klasse}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PFADE[name] || PFADE.info}</svg>`;
}

// ---------- Evidenz-Marke ----------
// stufe: 'belegt' | 'abgeleitet' | 'idee'; quellen: Liste von Quellen-IDs (quellen.js oder module/<id>/quellen.js).
// Tippen öffnet das Info-Blatt (kern.js, Klick-Delegation auf [data-marke]).
export const STUFEN_NAME = { belegt: 'belegt', abgeleitet: 'abgeleitet', idee: 'Idee' };
export function marke(stufe, quellen = []) {
  const s = STUFEN_NAME[stufe] ? stufe : 'idee';
  const q = (Array.isArray(quellen) ? quellen : [quellen]).filter(Boolean).join(',');
  return `<button type="button" class="marke marke-${s}" data-marke="${s}" data-quellen="${esc(q)}" aria-label="${STUFEN_NAME[s]} – Herkunft und Quelle zeigen">${STUFEN_NAME[s]}</button>`;
}
// Eine Aussage mit Marke; optional Kosten (Kehrseite einer Stärke) und Tag-Name (p/li).
export function aussage({ text, stufe = 'idee', quellen = [], kosten = '', tag = 'p', html = false }) {
  const t = html ? text : esc(text);
  return `<${tag} class="aussage">${t} ${marke(stufe, quellen)}${kosten ? `<span class="kosten">Kosten: ${html ? kosten : esc(kosten)}</span>` : ''}</${tag}>`;
}

// ---------- Band: Bereich statt Punkt ----------
// unten/oben auf der Skala min..max (Standard T-Werte 20–80); mitte = Mittelfeld, das blass hinterlegt wird.
// ohneName: Kopfzeile ohne Namen (wenn die Karte darüber schon so heißt); das aria-label bleibt vollständig.
export function band({ name, unten, oben, min = 20, max = 80, mitte = [45, 55], wort = '', links = '', rechts = '', grob = false, beschreibung = '', ohneName = false }) {
  const pos = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const a = pos(Math.min(unten, oben)), b = pos(Math.max(unten, oben));
  const m0 = pos(mitte[0]), m1 = pos(mitte[1]);
  const label = beschreibung || `${name}: Bereich von ${Math.round(Math.min(unten, oben))} bis ${Math.round(Math.max(unten, oben))} auf einer Skala von ${min} bis ${max}${wort ? ', ' + wort : ''}.`;
  return `<div class="band${grob ? ' grob' : ''}" role="img" aria-label="${esc(label)}">
    <div class="band-kopf" aria-hidden="true">${ohneName ? '<span></span>' : `<span class="band-name">${esc(name)}</span>`}<span class="band-wort">${esc(wort)}</span></div>
    <div class="band-spur" aria-hidden="true"><span class="band-mitte" style="left:${m0}%;width:${m1 - m0}%"></span><span class="band-bereich" style="left:${a}%;width:${Math.max(0, b - a)}%"></span></div>
    ${links || rechts ? `<div class="band-pole" aria-hidden="true"><span>${esc(links)}</span><span>${esc(rechts)}</span></div>` : ''}</div>`;
}

export function fortschritt(anteil, label = 'Fortschritt') {
  const p = Math.round(Math.max(0, Math.min(1, anteil)) * 100);
  return `<div class="fortschritt" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><span style="width:${p}%"></span></div>`;
}

export function baustelle(titel, text = 'Dieser Teil wird gerade gebaut.') {
  return `<h2>${esc(titel)}</h2><div class="baustelle"><p><b>Kommt bald</b></p><p>${esc(text)}</p></div>`;
}

export function datum(iso, mitZeit = false) {
  if (!iso) return '';
  const d = new Date(iso); if (isNaN(d)) return '';
  const o = { day: 'numeric', month: 'numeric', year: 'numeric' }; if (mitZeit) Object.assign(o, { hour: '2-digit', minute: '2-digit' });
  try { return d.toLocaleString('de-DE', o); } catch { return d.toISOString().slice(0, 10); }
}

// ---------- Hilfe (ruhig, klein; volle Karte nur, wenn sie gebraucht wird) ----------
export const HILFE = [
  ['Notruf', '112', '112'],
  ['TelefonSeelsorge, kostenlos, rund um die Uhr', '0800 111 0 111', '08001110111'],
  ['TelefonSeelsorge, zweite Nummer', '0800 111 0 222', '08001110222'],
  ['Hilfetelefon für seelische Krisen (EU-weite Nummer)', '116 123', '116123'],
  ['Ärztlicher Bereitschaftsdienst', '116 117', '116117']
];
export const HILFE_JUNG = ['Nummer gegen Kummer – für Kinder und Jugendliche (Mo–Sa 14–20 Uhr)', '116 111', '116111'];
let ALTER = null;                                    // setzt der Kern aus den Einstellungen (unter 18 → zusätzlich 116 111)
export function setzeAlter(a) { ALTER = a || null; }
export const jung = () => ALTER === 'u16' || ALTER === '16-17';
export function hilfeKarte({ titel = 'Wenn es dir gerade nicht gut geht', text = 'Du musst das nicht allein tragen. Die TelefonSeelsorge ist kostenlos, anonym und rund um die Uhr da.' } = {}) {
  const liste = jung() ? [HILFE[0], HILFE_JUNG, ...HILFE.slice(1)] : HILFE;
  return `<section class="karte hilfe" aria-label="Hilfe-Nummern"><h3>${esc(titel)}</h3><p>${esc(text)}</p>
    ${liste.map(([n, z, t]) => `<a class="tel" href="tel:${t}"><span>${esc(n)}</span><b>${esc(z)}</b></a>`).join('')}
    <p class="klein leise">Bei akuter Gefahr: 112.</p></section>`;
}
// Hinweis „Nur für jetzt“ mit Merken-Knopf (leer, wenn schon gemerkt wird). an = kern.speicher.einwilligung().
export function merkHinweis(an, text = 'Deine Antworten sind nicht gemerkt und nach dem Schließen weg.') {
  return an ? '' : `<div class="hinweis gelb" data-merk-hinweis><p><b>Nur für jetzt:</b> ${esc(text)}</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
}
export function fuss() {
  return `<p class="fuss">Selbstreflexion, keine Diagnose. Hilfe: <a href="tel:112">112</a> · <a href="tel:08001110111">0800 111 0 111</a> · <a href="tel:116117">116 117</a> · <a href="#einstellungen/hinweise">Hinweise</a></p>`;
}

// ---------- Meldung (kurz, aria-live) ----------
let mT = 0;
export function meldung(text, ms = 2600) {
  const m = $('#meldung'); if (!m) return;
  m.textContent = text; m.classList.add('an'); clearTimeout(mT); mT = setTimeout(() => m.classList.remove('an'), ms);
}

// ---------- Blatt (Dialog) ----------
// html darf Knöpfe mit data-w="wert" enthalten; ein Tipp darauf schließt das Blatt und liefert den Wert. Escape/Hintergrund → null.
// optionen.binde(dialog) wird nach dem Öffnen aufgerufen (eigene Ereignisse). Gibt Promise<string|null> zurück.
export function blatt(html, { titel = '', schliessbar = true, binde = null, label = '' } = {}) {
  const vorher = document.activeElement;
  const d = document.createElement('dialog'); d.className = 'blatt';
  d.setAttribute('aria-label', label || titel || 'Hinweis');
  d.innerHTML = `<div class="blatt-innen">${titel ? `<div class="blatt-kopf"><h2>${esc(titel)}</h2>${schliessbar ? `<button type="button" class="knopf-ico" data-w="" aria-label="Schließen">${sym('schliessen')}</button>` : ''}</div>` : ''}${html}</div>`;
  document.body.append(d);
  return new Promise((ok) => {
    let fertig = false;
    const zu = (w) => { if (fertig) return; fertig = true; try { d.close(); } catch {} d.remove(); try { vorher && vorher.focus && vorher.focus({ preventScroll: true }); } catch {} ok(w); };
    d.addEventListener('click', (e) => {
      const k = e.target.closest('[data-w]');
      if (k && d.contains(k)) { e.preventDefault(); zu(k.dataset.w === '' ? null : k.dataset.w); return; }
      if (e.target === d && schliessbar) zu(null);   // Tipp auf den Hintergrund
    });
    d.addEventListener('cancel', (e) => { e.preventDefault(); if (schliessbar) zu(null); });
    d._zu = zu;
    try { d.showModal(); } catch { d.setAttribute('open', ''); }
    const erstes = d.querySelector('[autofocus]') || d.querySelector('.blatt-innen h2') || d.querySelector('button,a,input');
    if (erstes) { if (erstes.tagName === 'H2') erstes.tabIndex = -1; try { erstes.focus({ preventScroll: true }); } catch {} }
    if (binde) binde(d, zu);
  });
}
export async function bestaetige({ titel, text = '', ja = 'Ja', nein = 'Abbrechen', gefahr = false }) {
  const w = await blatt(`${text ? `<p>${esc(text)}</p>` : ''}<div class="reihe"><button type="button" class="knopf zweit" data-w="nein">${esc(nein)}</button><button type="button" class="knopf ${gefahr ? 'gefahr' : 'haupt'}" data-w="ja">${esc(ja)}</button></div>`, { titel });
  return w === 'ja';
}

// ---------- Modul-Stil nachladen (module/<id>/stil.css, Klassen mit Modul-Präfix) ----------
const STILE = new Set();
export function ladeStil(url) {
  if (STILE.has(url)) return; STILE.add(url);
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = url; document.head.append(l);
}

// ---------- Kopieren, Datei ----------
export async function kopieren(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  try {
    const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.append(t); t.select(); t.setSelectionRange(0, text.length); const ok = document.execCommand('copy'); t.remove(); return ok;
  } catch { return false; }
}
// Speichert eine Datei auf dem Gerät. iPhone/iPad: Teilen-Blatt („In Dateien sichern“), sonst Download. Nichts geht an einen Server.
export async function datei(name, inhalt, typ = 'application/json') {
  const blob = inhalt instanceof Blob ? inhalt : new Blob([inhalt], { type: typ });
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && navigator.canShare) {
    try { const f = new File([blob], name, { type: blob.type || typ }); if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return 'geteilt'; } }
    catch (e) { if (e && e.name === 'AbortError') return 'abgebrochen'; }
  }
  const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; a.rel = 'noopener';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000);
  return 'geladen';
}
// Öffnet die Dateiauswahl und liefert den Text der gewählten Datei (oder null).
export function dateiWaehlen(accept = '.json,application/json') {
  return new Promise((ok) => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.style.display = 'none';
    i.onchange = async () => { const f = i.files && i.files[0]; i.remove(); ok(f ? await f.text() : null); };
    document.body.append(i); i.click();
  });
}

// ---------- Fragebogen: eine Frage pro Bildschirm ----------
export const SKALA5 = [
  { wert: 1, text: 'stimmt gar nicht' }, { wert: 2, text: 'stimmt eher nicht' }, { wert: 3, text: 'teils, teils' },
  { wert: 4, text: 'stimmt eher' }, { wert: 5, text: 'stimmt genau' }
];
// el: Container. o: { titel, fragen:[{id, text, hilfe?, typ?:'skala'|'wahl'|'zeit', optionen?:[{wert,text}]}], skala?, antworten?, start?,
//   beiAntwort?(id, wert, alle), beiZeigen?(index, id), fertig(alle), pause?(alle), ueberspringen?:bool, weiterText? }
// Rückgabe: { zeige(i), antworten(), index(), zerstoere() }
export function fragebogen(el, o) {
  const F = o.fragen || [], N = F.length, antw = { ...(o.antworten || {}) };
  const skalaStd = o.skala || SKALA5;
  const offen = (j) => !(F[j].id in antw);
  let i = typeof o.start === 'number' ? o.start : Math.max(0, F.findIndex((f, j) => offen(j)));
  if (i >= N || i < 0) i = 0;
  // Schutz vor Doppeltippen (Prüfung 17.11. T3): Tipps (Maus/Finger) auf Antworten zählen erst SPERRE ms nach dem Zeigen einer Frage.
  // Tastatur (Ziffern 1–5) ist ausgenommen. Danach steht data-bereit an der Frage (für Tests und Hilfsmittel).
  const SPERRE = 350;
  let tmr = 0, tot = false, ab = 0, tBereit = 0;
  const beantwortet = () => F.filter((f) => f.id in antw).length;
  function weiter() {
    if (tot) return;
    if (i < N - 1) return zeige(i + 1);
    const erstOffen = F.findIndex((f, j) => offen(j));
    if (erstOffen >= 0) return zeige(erstOffen);
    o.fertig && o.fertig({ ...antw });
  }
  function setze(wert) {
    const f = F[i]; antw[f.id] = wert;
    o.beiAntwort && o.beiAntwort(f.id, wert, { ...antw });
  }
  function zeige(n) {
    if (tot) return; clearTimeout(tmr); clearTimeout(tBereit);
    i = Math.max(0, Math.min(N - 1, n)); const f = F[i];
    ab = performance.now() + SPERRE;
    const typ = f.typ || 'skala', opts = f.optionen || skalaStd, w = antw[f.id];
    const eingabe = typ === 'zeit'
      ? `<label class="sr" for="fb-zeit">${esc(f.text)}</label><input id="fb-zeit" class="frage-feld" type="time" value="${esc(w || f.vorgabe || '')}">`
      : `<div class="antworten" role="radiogroup" aria-labelledby="fb-text">${opts.map((x, k) => {
          const an = w === x.wert;
          const tab = (w == null ? k === 0 : an) ? 0 : -1;
          return `<button type="button" class="antwort" role="radio" aria-checked="${an}" tabindex="${tab}" data-wert="${esc(x.wert)}" data-k="${k}"><span class="kreis" aria-hidden="true"></span><span>${esc(x.text)}</span></button>`;
        }).join('')}</div>`;
    el.innerHTML = `<section class="frage" aria-label="${esc(o.titel || 'Fragebogen')}">
      <div class="frage-kopf"><span>${esc(o.titel || '')}</span><span>Frage ${i + 1} von ${N}</span></div>
      ${fortschritt(beantwortet() / N, 'Beantwortet')}
      <h2 class="frage-text" id="fb-text" tabindex="-1">${esc(f.text)}</h2>
      ${f.hilfe ? `<p class="frage-hilfe">${esc(f.hilfe)}</p>` : ''}
      ${eingabe}
      <div class="frage-fuss">
        <button type="button" class="knopf zweit" data-fb="zurueck" ${i === 0 ? 'disabled' : ''}>${sym('zurueck')} Zurück</button>
        ${o.ueberspringen ? '<button type="button" class="knopf zweit" data-fb="skip">Überspringen</button>' : ''}
        ${typ === 'zeit' || w != null ? `<button type="button" class="knopf ${typ === 'zeit' ? 'haupt' : 'zweit'}" data-fb="weiter" ${typ === 'zeit' && !w && !f.vorgabe ? 'disabled' : ''}>${esc(o.weiterText || 'Weiter')}</button>` : ''}
      </div>
      ${o.pause ? '<p class="mitte"><button type="button" class="link" data-fb="pause">Pause – später weitermachen</button></p>' : ''}
    </section>`;
    const h = el.querySelector('#fb-text'); try { h.focus({ preventScroll: true }); } catch {}
    const sek = el.querySelector('.frage'); tBereit = setTimeout(() => { if (sek) sek.dataset.bereit = '1'; }, SPERRE);
    if (o.beiZeigen) { try { o.beiZeigen(i, f.id); } catch (e) { console.error(e); } }
    const z = el.querySelector('#fb-zeit');
    if (z) z.addEventListener('input', () => { const b = el.querySelector('[data-fb=weiter]'); if (b) b.disabled = !z.value; });
  }
  function klick(e) {
    const a = e.target.closest('.antwort');
    if (a && el.contains(a)) {
      if (e.detail > 0 && performance.now() < ab) return;          // zweiter Tipp eines Doppeltipps → nicht schon die nächste Frage beantworten
      const roh = a.dataset.wert; const opt = (F[i].optionen || skalaStd).find((x) => String(x.wert) === roh);
      setze(opt ? opt.wert : roh);
      el.querySelectorAll('.antwort').forEach((b) => { const an = b === a; b.setAttribute('aria-checked', an); b.tabIndex = an ? 0 : -1; });
      clearTimeout(tmr); tmr = setTimeout(weiter, RUHIG() ? 120 : 220);
      return;
    }
    const b = e.target.closest('[data-fb]'); if (!b || !el.contains(b)) return;
    const was = b.dataset.fb;
    if (was === 'zurueck' && i > 0) zeige(i - 1);
    else if (was === 'skip') { setze(null); weiter(); }
    else if (was === 'weiter') { const z = el.querySelector('#fb-zeit'); if (z) { if (!z.value) return; setze(z.value); } weiter(); }
    else if (was === 'pause') o.pause && o.pause({ ...antw });
  }
  function taste(e) {
    if (e.target.matches('input,textarea')) { if (e.key === 'Enter') { e.preventDefault(); el.querySelector('[data-fb=weiter]')?.click(); } return; }
    const knoepfe = [...el.querySelectorAll('.antwort')];
    const nr = parseInt(e.key, 10);
    if (nr >= 1 && nr <= knoepfe.length) { e.preventDefault(); knoepfe[nr - 1].click(); return; }
    const pos = knoepfe.indexOf(document.activeElement);
    if (pos >= 0 && ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault(); const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
      const z = knoepfe[(pos + d + knoepfe.length) % knoepfe.length]; z.focus();
    } else if (e.key === 'Backspace' && i > 0) { e.preventDefault(); zeige(i - 1); }
  }
  el.addEventListener('click', klick); el.addEventListener('keydown', taste);
  zeige(i);
  return {
    zeige, antworten: () => ({ ...antw }), index: () => i,
    zerstoere() { tot = true; clearTimeout(tmr); clearTimeout(tBereit); el.removeEventListener('click', klick); el.removeEventListener('keydown', taste); }
  };
}
