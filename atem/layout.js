// 020-layout: Atem 0.2.0 „Klar-Warm+“ – Navigation (5 Ziele), Heute, Fortschritt, Mehr, Hinweise, „mehr“-Muster, Darstellung.
// Vorgabe: atem-020/DESIGN.md §4–§6. Keine Farbwerte hier (nur Klassen → layout.css/design-token.css). Nichts wird gesendet.
// Heute kommt ohne JS-Animation aus; die Figur entsteht erst auf Info/läuft/Meditation (Paket „figur“).
import { S } from './symbole.js';

// ---------- Haken für das Paket „ziele“ ----------
// ziele.js exportiert zeigeHeute(container, ctx) und optional zeigeFortschritt(container, ctx) / zeigeSeite(name, container, ctx)
// (Seiten 'ziel' | 'erinnerung' | 'health'). Beim Zusammenführen hier true setzen – dann lädt Heute das Modul, sonst ruhiger Ersatz.
export const ZIELE_MODUL = true;   // 020: zusammengeführt mit Paket ziele
const zieleModul = () => import('./ziele.js');

// ---------- eigene Linien-Symbole (24 px, Strich 1,75, runde Enden) ----------
const P = {
  heute: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  ueben: '<path d="M12 3v7M12 10c-1.5 1.2-3 1.8-4 1.6M12 10c1.5 1.2 3 1.8 4 1.6"/><path d="M9.5 7C6 7.5 4 12 4 16.5c0 2 1.3 3.2 3 2.8 2-.5 3.3-2.3 3.3-5.3V8.4M14.5 7c3.5.5 5.5 5 5.5 9.5 0 2-1.3 3.2-3 2.8-2-.5-3.3-2.3-3.3-5.3V8.4"/>',
  meditation: '<circle cx="12" cy="5" r="2.2"/><path d="M12 8.5v5.5M8 11.5c1.3 1 2.6 1.5 4 1.5s2.7-.5 4-1.5"/><path d="M4 19c2.5-2.2 5.2-3.2 8-3.2s5.5 1 8 3.2M7 19.5h10"/>',
  fortschritt: '<path d="M4 20V14M10 20V9M16 20v-4M20 4l-6 6-3-3-7 7"/>',
  mehr: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  haken: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  lunge: '<path d="M12 3v8M12 11c-1.4 1.1-2.6 1.6-3.6 1.5M12 11c1.4 1.1 2.6 1.6 3.6 1.5"/><path d="M9.6 7.2C6.3 7.7 4.4 12 4.4 16.2c0 1.8 1.2 2.9 2.8 2.5 1.9-.5 3.1-2.1 3.1-5V8.4M14.4 7.2c3.3.5 5.2 4.8 5.2 9 0 1.8-1.2 2.9-2.8 2.5-1.9-.5-3.1-2.1-3.1-5V8.4"/><path d="M3.5 21c2.8-1.6 5.6-2.4 8.5-2.4s5.7.8 8.5 2.4"/>',
  welle: '<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>',
  singen: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  messen: '<circle cx="12" cy="13" r="7"/><path d="M12 13l3-3M12 3v3"/>',
  anhalten: '<rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/>',
  aktivieren: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
};
export const ls = (n, cls = '') => S(P[n] || P.chev, cls);
const CHEV = () => ls('chev', 'chev');

// ---------- Leiste ----------
// Ziel 'start' bleibt der Hash für Heute (alte Links/Lesezeichen und Tests: #start).
export const REITER = [['start', 'Heute', 'heute'], ['uebungen', 'Üben', 'ueben'], ['meditation', 'Meditation', 'meditation'], ['fortschritt', 'Fortschritt', 'fortschritt'], ['mehr', 'Mehr', 'mehr']];
export const leisteHtml = () => REITER.map(([id, n, s]) => `<a href="#${id}" data-r="${id}">${ls(s)}<span>${n}</span>${id === 'fortschritt' && neuZeigen('fortschritt') ? '<b class="neu" data-neu="fortschritt">neu</b>' : ''}</a>`).join('');
// Welches Ziel leuchtet: allein aus dem Hash (die alten seite(…, reiter)-Angaben bleiben unverändert stehen).
const ZIEL_VON = { start: 'start', heute: 'start', lage: 'uebungen', uebungen: 'uebungen', uebung: 'uebungen', messen: 'uebungen', singen: 'uebungen', programm: 'uebungen', vergleich: 'uebungen',
  meditation: 'meditation', fortschritt: 'fortschritt', training: 'fortschritt', ziel: 'fortschritt', mehr: 'mehr', wissen: 'mehr', einstellungen: 'mehr', musik: 'mehr', hinweise: 'mehr', erinnerung: 'mehr', health: 'mehr', sicherheit: 'start', klang: 'mehr' };   // 023: + klang
export function zielFuer(hash) { const a = (hash || '').replace(/^#/, '').split(/[/?]/)[0] || 'start'; return a === 'lage' && /nicht_gut/.test(hash) ? 'start' : ZIEL_VON[a] || 'start'; }

// ---------- „neu“-Marke: verschwindet nach dem ersten Antippen oder nach 14 Tagen ----------
const NEU_KEY = 'atem.v1.neu';
const neuLesen = () => { try { return JSON.parse(localStorage.getItem(NEU_KEY) || '{}'); } catch { return {}; } };
const NEU_AB = Date.parse('2026-11-16T00:00:00Z');   // 020: 14 Tage ab Fassung 0.2.0 – ohne Schreiben beim Anzeigen (nach „Alles löschen“ entsteht so kein neuer Schlüssel)
function neuZeigen(k) {
  const n = neuLesen(); if (n[k] === 'weg') return false;
  return Date.now() - (typeof n[k] === 'number' ? n[k] : NEU_AB) < 14 * 864e5;
}
function neuWeg(k) { const n = neuLesen(); n[k] = 'weg'; try { localStorage.setItem(NEU_KEY, JSON.stringify(n)); } catch {} document.querySelectorAll(`[data-neu="${k}"]`).forEach((e) => e.remove()); }

// ---------- Darstellung: Dunkel (Standard) / Hell / Automatisch ----------
const THEMA_KEY = 'atem.v1.thema';
export const themaLesen = () => { try { return localStorage.getItem(THEMA_KEY) || 'dunkel'; } catch { return 'dunkel'; } };
let mq = null;
export function themaSetzen(t, merken = true) {   // 020: beim Start nur anwenden, gespeichert wird nur eine echte Wahl
  if (merken) try { localStorage.setItem(THEMA_KEY, t); } catch {}
  mq = mq || (window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null);
  const hell = t === 'hell' || (t === 'auto' && mq && mq.matches);
  if (hell) document.documentElement.dataset.thema = 'hell'; else delete document.documentElement.dataset.thema;
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = hell ? '#f5f1ea' : '#0d1218';
}

// ---------- Rahmen-Helfer: einmal beim Start ----------
export function einrichten() {
  themaSetzen(themaLesen(), false);
  if (mq && mq.addEventListener) mq.addEventListener('change', () => { if (themaLesen() === 'auto') themaSetzen('auto'); });
  // „mehr“-Muster: klappt an Ort und Stelle auf (ein Klick-Hörer für alle Seiten)
  document.addEventListener('click', (e) => {
    const k = e.target.closest('.mehr-knopf');
    if (k) { const t = document.getElementById(k.getAttribute('aria-controls')); if (!t) return; const auf = k.getAttribute('aria-expanded') !== 'true'; k.setAttribute('aria-expanded', auf); t.hidden = !auf; const w = k.querySelector('.mk-w'); if (w) w.textContent = auf ? 'Weniger anzeigen' : k.dataset.zu; return; }
    const n = e.target.closest('[data-neu], a[data-r="fortschritt"]'); if (n && document.querySelector('[data-neu="fortschritt"]')) neuWeg('fortschritt');
  });
}
let mehrNr = 0;
export const mehr = (text, inhalt, offen = false) => { const id = 'mehr-' + (++mehrNr); return `<button class="mehr-knopf" aria-expanded="${offen}" aria-controls="${id}" data-zu="${text}"><span class="mk-w">${offen ? 'Weniger anzeigen' : text}</span>${ls('chev')}</button><div class="mehr-teil" id="${id}" ${offen ? '' : 'hidden'}>${inhalt}</div>`; };
export const zeile = (href, titel, unter = '', extra = '') => `<a class="zeile" href="${href}"><span><b>${titel}</b>${unter ? `<small>${unter}</small>` : ''}</span>${extra}${CHEV()}</a>`;
export const ruhig = (text) => `<p class="hinweis ruhig">${text}</p>`;
export const INTENSIV = '<span class="intensiv">intensiv</span>';
const STUFE_N = { gut: 3, mittel: 2, schwach: 1, unbelegt: 0 };
const STUFE_W = { gut: 'gut belegt', mittel: 'teils belegt', schwach: 'wenig belegt', unbelegt: 'nicht belegt' };
const STUFE_K = { gut: 'gut', mittel: 'teils', schwach: 'wenig', unbelegt: 'offen' };
export const leds = (stufe, kurz) => `<span class="leds" title="${STUFE_W[stufe] || ''}" aria-label="${STUFE_W[stufe] || ''}">${[0, 1, 2].map((k) => `<i class="${k < (STUFE_N[stufe] ?? 0) ? 'an' : ''}"></i>`).join('')}<span>${(kurz ? STUFE_K : STUFE_W)[stufe] || stufe}</span></span>`;
const ZONE = { bauch: 'Bauch', brust: 'Brust', flanken: 'Flanken', 'bauch+brust': 'Bauch + Brust' };
export const zoneText = (T) => ZONE[T && T.bewegung] || (T && T.gruppe === 'singen' ? 'Flanken' : 'Bauch');
export const wirkKlasse = (T) => 'w-' + (T.gruppe || 'beruhigen');
const WIRK_SYM = { beruhigen: 'welle', aktivieren: 'aktivieren', singen: 'singen', messen: 'messen', anhalten: 'anhalten', geraet: 'messen' };
export const wirkSym = (T) => `<span class="w-sym ${wirkKlasse(T)}">${ls(WIRK_SYM[T.gruppe] || 'welle')}</span>`;

// ---------- Heute ----------
const TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const tagKey = (d) => { const x = new Date(d); return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate(); };
export function woche(protokoll, jetzt = new Date()) {   // Mo–So dieser Woche: geübt (fertig/beendet ≥ 30 s), heute, Minuten
  const mo = new Date(jetzt); mo.setHours(0, 0, 0, 0); mo.setDate(mo.getDate() - ((mo.getDay() + 6) % 7));
  const tage = [], min = { s: 0 };
  for (let k = 0; k < 7; k++) { const d = new Date(mo); d.setDate(mo.getDate() + k); tage.push({ d, key: tagKey(d), an: false, heute: tagKey(d) === tagKey(jetzt) }); }
  for (const p of protokoll || []) { const t = tage.find((x) => x.key === tagKey(p.t)); if (t && (p.ist_s || 0) >= 30) { t.an = true; min.s += p.ist_s || 0; } }
  return { tage, an: tage.filter((t) => t.an).length, min: Math.round(min.s / 60) };
}
export const wochenReihe = (w) => `<div class="woche-reihe" aria-label="Diese Woche">${w.tage.map((t) => `<span><i class="${t.an ? 'an' : t.heute ? 'heute' : ''}">${t.an ? ls('haken') : ''}</i>${TAGE[t.d.getDay()]}</span>`).join('')}</div>`;

// Nächste Übung: offenes Training > zuletzt geübt > Resonanz-Atmung (gut belegt, ruhig)
function naechste(c) {
  const { TECHNIKEN, speicher } = c, h = c.heuteTraining && c.heuteTraining();
  if (h && h.einheiten) { const x = h.einheiten.find((u) => !u.erledigt && TECHNIKEN[u.technik]); if (x) return { T: TECHNIKEN[x.technik], ueber: 'Training · Woche ' + h.woche, training: x }; }
  const e = speicher.einst(), L = e.letzte && TECHNIKEN[e.letzte];
  if (L && L.id !== 'seufzer' && L.risiko !== 'hoch') return { T: L, ueber: 'Zuletzt geübt' };
  return { T: TECHNIKEN.resonanz || Object.values(TECHNIKEN)[0], ueber: 'Für den Anfang' };
}
export function zeigeHeute(c) {
  const { esc, speicher } = c, n = naechste(c), T = n.T, w = woche(speicher.protokoll());
  const d = new Date(), datum = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  // 020 (Zusammenführung): mit gewähltem Ziel ist die Ziel-Karte die „Nächste Übung“ – keine zweite Karte mit zweitem „Jetzt starten“ (laufendes 8-Wochen-Training geht vor)
  const mitZiel = ZIELE_MODUL && !n.training && speicher.wert && speicher.wert('ziel', null);
  c.seite('Heute', `<div class="heute">
    <p class="datum">${esc(datum)}</p>
    <div>${mitZiel ? '' : `<section class="karte naechste" aria-label="Nächste Übung"><span class="lungen-sym">${ls('lunge')}</span><div><span class="ueber">${esc(n.ueber)}</span><h2>${esc(T.name)}</h2></div>
      <div class="chips-klein"><span class="chip-info">${esc(c.dauerText(T))}</span><span class="chip-info"><i class="pkt"></i>${esc(zoneText(T))}</span></div>
      <a class="knopf haupt voll" id="heute-los" href="#uebung/${T.id}?s=1">Jetzt starten</a></section>
    <a class="heute-zeile" href="#uebungen"><span>Lieber anders?</span>${CHEV()}</a>`}</div>
    <div><section id="heute-ziel"></section>
    <p class="akut-zeile ruhig">Gerade nicht gut? <button class="link" id="schnell">1 Minute runterkommen</button> · <a class="link" href="#lage/nicht_gut">Hilfe</a></p></div></div>`, 'start', 1);
  const los = document.getElementById('heute-los');
  if (los) los.onclick = (ev) => {   // ein Tipp: Übung startet noch im Tipp (Ton auf iOS), wie die Lage-Seite
    ev.preventDefault();
    if (n.training) return c.starteTraining(n.training);
    history.pushState(null, '', los.getAttribute('href')); c.route();
  };
  const box = document.getElementById('heute-ziel');
  if (ZIELE_MODUL) zieleModul().then((m) => { if (box.isConnected) m.zeigeHeute(box, c); }).catch(() => heuteErsatz(box, w));
  else heuteErsatz(box, w);
}
function heuteErsatz(box, w) {   // ohne Paket „ziele“: ruhige Wochen-Karte (Fortschritt sichtbar, nichts erfunden)
  box.innerHTML = `<a class="karte" href="#fortschritt" style="display:block"><span class="ueber">Diese Woche</span>${wochenReihe(w)}<span>${w.an} von 7 Tagen · ${w.min} min</span></a>`;
}

// ---------- Üben: Lage-Reihe oben ----------
export function lageReihe(c) {
  const { SITUATIONEN, REIHENFOLGE, sym, esc } = c;
  return `<span class="ueber">Was ist los?</span><div class="lage-reihe">${REIHENFOLGE.map((id) => `<a class="kachel" href="#lage/${id}">${sym(id)}<b>${esc(SITUATIONEN[id].name)}</b></a>`).join('')}</div>`;
}

// ---------- Fortschritt ----------
export function zeigeFortschritt(c) {
  const { speicher, esc, TECHNIKEN } = c, w = woche(speicher.protokoll()), prot = speicher.protokoll(), tr = speicher.training();
  const h = tr && tr.start && c.heuteTraining ? c.heuteTraining() : null;
  const gesamt = prot.filter((p) => (p.ist_s || 0) >= 30), minGes = Math.round(gesamt.reduce((a, p) => a + (p.ist_s || 0), 0) / 60);
  const oft = Object.entries(gesamt.reduce((a, p) => ((a[p.technik] = (a[p.technik] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1])[0];
  c.seite('Fortschritt', `<div class="zweispaltig"><div><section id="fortschritt-ziel"></section>
    <div class="karte" id="lay-woche" ${ZIELE_MODUL ? 'hidden' : ''}><span class="ueber">Diese Woche</span>${wochenReihe(w)}<b>${w.an} von 7 Tagen · ${w.min} min</b></div>
    <div class="karte"><span class="ueber">Bisher</span><b>${gesamt.length} Übungen · ${minGes} min</b>${oft && TECHNIKEN[oft[0]] ? `<span style="display:block">Am häufigsten: ${esc(TECHNIKEN[oft[0]].name)}</span>` : ''}</div></div>
    <div><div class="gruppe">${zeile('#training', '8-Wochen-Training', h ? 'Woche ' + h.woche + ' von 8' : 'Atem stärken, Schritt für Schritt')}${zeile('#wissen/T-DAUER', 'Was ist belegt', 'Regelmäßig zählt mehr als lang')}</div></div></div>`, 'fortschritt', 1);
  const wocheZeigen = () => { const k = document.getElementById('lay-woche'); if (k) k.hidden = false; };   // 020: Ersatz, falls fortschritt.js nicht lädt (Woche bleibt sichtbar, nie doppelt)
  if (ZIELE_MODUL) zieleModul().then((m) => { const b = document.getElementById('fortschritt-ziel'); if (b && m.zeigeFortschritt) return m.zeigeFortschritt(b, c); wocheZeigen(); }).catch(wocheZeigen);
}

// ---------- Mehr ----------
export function zeigeMehr(c) {
  const t = themaLesen(), z = ZIELE_MODUL;
  c.seite('Mehr', `<div class="zweispaltig"><div><span class="ueber">Beim Üben</span><div class="gruppe">${zeile('#einstellungen', 'Töne und Stimme', 'Klang, Lautstärke, Anzeige')}${zeile('#meditation', 'Sprache der Stimme')}${zeile('#musik', 'Eigene Musik')}${z ? zeile('#erinnerung', 'Erinnerung') + zeile('#health', 'Achtsamkeitsminuten') : ''}</div>
    <span class="ueber">Wissen</span><div class="gruppe">${zeile('#klang', 'Klang &amp; Vagus', 'Klang-Atem, Beats, Summen, Selbsthypnose')}${zeile('#wissen', 'Wie Atmen wirkt')}${zeile('#vergleich', 'Zwerchfell oder Brust?')}${zeile('#singen', 'Singen und Atemstütze')}${zeile('#wissen/quellen', 'Alle Quellen')}</div></div>
    <div><span class="ueber">Darstellung</span><div class="seg" role="group" aria-label="Darstellung">${[['dunkel', 'Dunkel'], ['hell', 'Hell'], ['auto', 'Automatisch']].map(([k, n]) => `<button class="chip ${t === k ? 'an' : ''}" data-thema="${k}" aria-pressed="${t === k}">${n}</button>`).join('')}</div>
    <span class="ueber">Hilfe und Daten</span><div class="gruppe">${zeile('#lage/nicht_gut', 'Wenn es dir nicht gut geht')}${zeile('#hinweise', 'Hinweise zur Sicherheit')}${zeile('#einstellungen', 'Daten und Sicherung')}</div>
    <p class="mehr-fuss">Atemübungen ersetzen keinen ärztlichen Rat. Deine Übungsdaten bleiben auf deinem Gerät.<br>Version ${c.VERSION}</p></div></div>`, 'mehr', 1);
  document.querySelectorAll('[data-thema]').forEach((b) => (b.onclick = () => { themaSetzen(b.dataset.thema); document.querySelectorAll('[data-thema]').forEach((x) => { x.classList.toggle('an', x === b); x.setAttribute('aria-pressed', x === b); }); }));
}

// ---------- Hinweise (alle Details, ruhig; Texte unverändert aus daten.js) ----------
export function zeigeHinweise(c) {
  const { SICHERHEIT: S0, esc } = c, li = (a) => `<ul>${a.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  c.seite('Hinweise', `<div class="lesen"><p>Damit Üben sich gut anfühlt – in Ruhe zum Nachlesen.</p>
    <div class="karte"><b>Grundsätze</b>${li(S0.erststart_text)}</div>
    <div class="karte">${mehr('Intensive Übungen (Wach-, Kraftatmung, Anhalten)', `<p>${esc(S0.kurz_vor_riskanter_uebung)}</p>${li(S0.riskante_techniken_hinweis || [])}<p>${esc(S0.warum_wasser || '')}</p><p>Nicht bei: ${esc(S0.ausschluss.join(', '))}.</p>`)}</div>
    <div class="karte">${mehr('Wann aufhören?', li(S0.abbruch_zeichen))}</div>
    <div class="karte">${mehr('Wann ärztlich abklären?', li(S0.aerztlich_abklaeren))}</div>
    ${zeile('#lage/nicht_gut', 'Gerade nicht gut?', '1 Minute runterkommen · Notruf')}</div>`, 'mehr', 2);
}

// ---------- Erster Start: einmal ruhig, höchstens 3 Punkte (Form B). Die übrigen Punkte stehen an ihrem Ort + in Mehr › Hinweise ----------
export const erstHtml = (S0, esc) => `<h2>Kurz vorab</h2><ul class="sicher-liste">${S0.erststart_text.slice(0, 3).map((t) => `<li>${S('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>')}<span>${esc(t)}</span></li>`).join('')}</ul>
  <button class="knopf haupt voll" data-w="ok">Verstanden</button><p class="leise mitte">Alles Weitere unter Mehr › Hinweise. Deine Übungsdaten bleiben auf deinem Gerät.</p>`;

// ---------- Info-Seite (Übung): ein Satz, 3 Fakten, Kurz/Normal/Lang, höchstens ein ruhiger Hinweis, Rest unter „mehr“ ----------
export function infoHtml(p) {
  const { T, esc, kopfZeile, stufen, stepper, varianten, laenge, hinweis, mehrInhalt, verlauf, vorschau, hb, haltung, g } = p;
  return `<div class="zweispaltig info"><div>${vorschau}${vorschau ? '<div class="info-chips"><span class="chip-info" id="rhythmus" title="Sekunden"></span></div>' : ''}
    <p class="info-kurz">${esc(T.kurz)}</p>
    <div class="fakten"><div class="fakt"><small>Dauer</small><b id="fakt-dauer">${esc(p.dauer)}</b></div><div class="fakt"><small>Atmung</small><b>${esc(zoneText(T))}</b></div><div class="fakt"><small>Belegt</small>${hb ? leds(hb[1], true) : leds('unbelegt', true)}</div></div>
    ${verlauf}${kopfZeile || ''}</div>
    <div>${stufen}${stepper}${varianten}${laenge}<div id="abl"></div>
    ${hinweis}${haltung}
    ${mehr('Mehr zur Übung', mehrInhalt)}
    <div class="info-start">${g ? `<p class="hinweis gesperrt">${esc(g)}</p>` : ''}<button class="knopf haupt voll startknopf" id="los" ${g ? 'disabled' : ''}>Starten</button></div></div></div>`;
}
// Start-Knopf trägt die echte Dauer („Starten · 5 min“), aus dem Plan gerechnet
export function losText(plan) {
  const k = document.getElementById('los'); if (!k || !plan || k.textContent === 'Lädt …') return;
  const m = plan.gesamt_ms / 60000, t = m < 1 ? Math.round(plan.gesamt_ms / 5000) * 5 + ' s' : (Math.round(m * 2) / 2 + ' min').replace('.', ',');
  k.textContent = 'Starten · ' + t; const f = document.getElementById('fakt-dauer'); if (f) f.textContent = t;
  const r = document.getElementById('rhythmus'), W = { ein: 'ein', ein2: 'noch', halten_voll: 'halten', halten_leer: 'leer', aus: 'aus', stoss_aus: 'Stoß' }, z = [];   // Rhythmus-Chip „4 s ein · 6 s aus“
  for (const st of plan.schritte || []) { if (st.zug > 1 || z.length >= 4) break; if (st.ms && W[st.art]) z.push(String(Math.round(st.ms / 100) / 10).replace('.', ',') + ' ' + W[st.art]); }
  if (r) { r.textContent = z.join(' · '); r.hidden = !z.length; }
  const v = document.getElementById('vs-los'); if (v) v.setAttribute('aria-label', 'Vorschau');   // Info: nur das Abspiel-Symbol (Wort per CSS aus)
}

// ---------- Platzhalter-Ziele dieses Pakets (im Zusammenbau mit 0.1.6 greift dort zuerst der echte case 'meditation') ----------
export function zeige(a, b, c) {
  if (a === 'fortschritt') return zeigeFortschritt(c), true;
  if (a === 'mehr') return zeigeMehr(c), true;
  if (a === 'hinweise') return zeigeHinweise(c), true;
  if ((a === 'ziel' || a === 'erinnerung' || a === 'health') && ZIELE_MODUL) { c.seite('…', '<p class="leise">Lädt …</p>', 'mehr', 2); zieleModul().then((m) => m.zeigeSeite && m.zeigeSeite(a, document.getElementById('inhalt'), c)).catch(() => {}); return true; }
  if (a === 'meditation') return c.seite('Meditation', '<p class="leise">Die Meditationen kommen mit Fassung 0.1.6.</p>', 'meditation', 1), true;
  return false;
}
