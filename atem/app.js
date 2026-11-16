// Atem – Start, Router, Bildschirme (KONZEPT §2). Ohne Build-Schritt, ohne fremde Bibliotheken, nichts wird gesendet.
import { TECHNIKEN, SITUATIONEN, PROGRAMME, TRAINING, SICHERHEIT, ZIELNAMEN, REIHENFOLGE } from './daten.js';
import { sym, abzeichen, haltungSym } from './symbole.js';
import { speicher } from './speicher.js';
import { baue, baueProgramm, wortFuer, grenzen } from './plan.js';
import * as TRN from './training.js';
import { ton } from './ton.js';   // statisch: der Ton entsteht im Tipp auf Start, vor jedem await (iOS)
import * as LAY from './layout.js';   // 020-layout: Navigation, Heute, Fortschritt, Mehr, Hinweise
let ZM = null; const zmLade = () => import('./signale.js').then((m) => { ZM = m; if (ton.zaehltoene) ton.zaehltoene(); return m; }, () => null);   // 020-klang: Zähltöne erst bei Bedarf

export const VERSION = '0.2.1';   // 021
const TEST = /[?&]test=1/.test(location.search);
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dauerText = (T) => T.dauer ? T.dauer.standard + ' min' : T.zyklen ? T.zyklen.standard + '×' : T.modus === 'tabelle' ? 'ca. 15 min' : T.modus === 'messen' ? '1–3 min' : T.ablauf ? einheit(T.ablauf.runden, 'runden') : '';
const RISIKO_HOCH = (T) => T.risiko === 'hoch' || T.risiko === 'mittel';
const KEIN_ERSATZ = '';   // 020-layout: „Kein Ersatz für ärztlichen Rat“ steht nur noch in Mehr (Fußzeile) und unter der Ziel-Wahl (DESIGN §6)
// 0.1.4: Herkunft je Übung/Karte (Buch nur als Thema, ohne Autorennamen)
const HERK = { buch: 'Aus dem Buch „Atem“', buch_zusatz: 'Thema aus dem Buch „Atem“, Studien zusätzlich recherchiert', recherche: 'Zusätzlich recherchiert (nicht aus dem Buch)' };
const HERK_K = { buch: 'aus dem Buch', buch_zusatz: 'Buch-Thema + Studien', recherche: 'zusätzlich recherchiert' };
const herk = (h, kap) => h ? `<p class="herk">${HERK[h]}${kap ? ' · ' + esc(kap) : ''}</p>` : '';
const einheit = (w, e) => e === 'min' ? w + ' min' : w + ' ' + (e === 'runden' ? (w === 1 ? 'Runde' : 'Runden') : w === 1 ? 'Zyklus' : 'Zyklen');
let SZ = null, SZda = false, WISSEN = null, letzteSitzung = null, startet = false, neuLaden = false;
// 0.1.4 Doppeltipp-Schutz: Öffnet oder schließt ein Tipp ein Blatt, die Übung oder eine Seite, wird ein zweiter Tipp an derselben Stelle
// (≤ 40 px, ≤ 400 ms) verworfen – sonst träfe er den Knopf, der jetzt darunter liegt (Pause → Beenden, Weiter → Ansicht, Fertig → Leiste).
const SPERR_MS = 400, SPERR_PX = 40;
let tipp = { t: -1e9, x: 0, y: 0 }, sperre = null;
const tippSperre = () => { if (performance.now() - tipp.t < SPERR_MS) sperre = { ...tipp }; };
const sitzungModul = () => SZ || (SZ = import('./sitzung.js').then((m) => { SZda = true; return m; }, (e) => { SZ = null; throw e; }));   // Fehlschlag nicht merken (Funkloch)
let ZIELE = null; const zieleModul = () => import('./ziele.js').then((m) => (ZIELE = m));   // 020-ziele: Ziele/Programm/Fortschritt/Erinnerung (lädt nach dem ersten Bild)
(window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => { zieleModul().then((Z) => Z.leerlauf()).catch(() => {}); });   // 020-ziele: Erinnerung nachplanen (nur wenn an und fällig; erinnerung.js lädt erst dann)
const wissenModul = () => WISSEN || (WISSEN = import('./wissen.js').catch((e) => { WISSEN = null; throw e; }));
// 016 Anfang: Meditation (meditation-seite.js, erst beim Öffnen geladen) + „Stimme sagt den Takt“ (stimme.js). alt=true beim Start: die frühere
// iPhone-Ansage (ansage true) wird zur echten Stimme; ohne Sprite/Netz spricht stimme.js weiter mit der Systemstimme (Rückfall).
const stimmeVor = (alt) => { let e = speicher.einst(); if (alt && e.ansage === true) e = speicher.setzeEinst({ ansage: 'stimme' }); if (e.ansage === 'stimme' && alt !== 'nur_umstellen') import('./stimme.js').then((S) => S.bereiteVor(ton, e)).catch(() => {}); };   // 016-nb B4: Startseite stellt nur um, Sprite erst auf der Übungsseite
function zeigeMeditation(id) { seite('Meditation', '<p class="leise">Lädt …</p>', 'start', id ? 2 : 1); import('./meditation-seite.js').then((m) => m.zeige({ seite: (t, h, r, tf) => seite(t, h, 'start', tf), blatt, tippSperre, host: document.body, taktGeaendert: () => stimmeVor(), neuLaden: () => neuLaden }, id), keinNetz); }
const M016 = { karte: '<a class="karte" href="#meditation"><b>Meditation</b><span>Geführte Übungen mit Stimme – Deutsch, English, <span lang="ar" dir="rtl">العربية</span></span></a>',
  schalter: (e) => `<label class="schalter"><span>Stimme sagt den Takt</span><input type="checkbox" id="stimmetakt" ${e.ansage ? 'checked' : ''}></label><p class="leise">Stimme künstlich erzeugt (neuronale Sprachsynthese).</p><a class="link" href="#meditation">Sprache der Stimme wählen</a>` };
// 016 Ende
function keinNetz() { const i = $('#inhalt'); i.querySelectorAll('p.leise').forEach((p) => { if (p.textContent === 'Lädt …') p.remove(); }); i.insertAdjacentHTML('afterbegin', '<div class="karte hinweis">Keine Verbindung. <button class="knopf klein zweit" id="nochmal">Nochmal versuchen</button></div>'); $('#nochmal').onclick = () => location.reload(); scrollTo(0, 0); }   // Neu laden: Browser merken sich fehlgeschlagene Module
const hauptBeleg = (T) => { const e = Object.entries(T.beleg || {}); return e.length ? e[0] : null; };

// ---------- Rahmen ----------
const REITER = [['start', 'Start', 'start'], ['training', 'Training', 'training'], ['uebungen', 'Übungen', 'uebungen'], ['singen', 'Singen', 'singen'], ['wissen', 'Wissen', 'wissen']];
function rahmen() {
  $('#leiste').innerHTML = LAY.leisteHtml(); LAY.einrichten();   // 020-layout: Heute · Üben · Meditation · Fortschritt · Mehr (REITER oben bleibt ungenutzt)
  $('#kopf').innerHTML = `<button class="knopf-ico" id="zurueck" aria-label="Zurück">${sym('zurueck')}</button><h1 id="titel">Atem</h1>`;   // 020-layout: Zahnrad entfällt (Mehr)
  $('#zurueck').onclick = () => { if (history.length > 1) history.back(); else location.hash = '#start'; };
}
function seite(titel, html, reiter, tiefe = 1) {
  const ti = $('#titel'); ti.textContent = titel; ti.removeAttribute('dir'); ti.removeAttribute('lang');   // 016-nb N5: Meditation setzt dir/lang selbst
  $('#zurueck').style.visibility = tiefe > 1 ? 'visible' : 'hidden';
  document.body.dataset.tiefe = tiefe; const ziel = LAY.zielFuer(location.hash);   // 020-layout: Display-Titel auf den 5 Zielen, leuchtendes Ziel aus dem Hash
  document.querySelectorAll('#leiste a').forEach((a) => { const an = a.dataset.r === ziel; a.classList.toggle('an', an); if (an) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const i = $('#inhalt'); i.innerHTML = html; i.scrollTop = 0;
}

// ---------- Blätter ----------
function blatt(html, binde) {
  const b = $('#blatt'); b.innerHTML = `<div class="dunkel"></div><div class="blatt-innen" role="dialog" aria-modal="true">${html}</div>`; b.hidden = false; tippSperre();
  return new Promise((ok) => { b.onclick = (e) => { const k = e.target.closest('[data-w]'); if (!k) { if (binde) binde(e); return; } b.hidden = true; b.innerHTML = ''; tippSperre(); ok(k.dataset.w); }; });
}
const BILDER = [['wasserAus', 'Nie im oder am Wasser, nicht in der Wanne'], ['lenkradAus', 'Nie beim Fahren'], ['sitzen', 'Nur sitzend oder liegend'], ['spirale', 'Schwindel oder Kribbeln: sofort normal atmen']];
function erststart() {
  return blatt(LAY.erstHtml(SICHERHEIT, esc)).then(() => speicher.setzeSicherheit({ erst: new Date().toISOString() }));   // 020-layout: einmal ruhig, 3 Punkte; alle Punkte in Mehr › Hinweise
}
async function sicherheitsBlatt(T) {
  const si = speicher.sicherheit(), erstes = !(si.lang_gesehen || {})[T.id];
  const liegend = T.modus === 'tabelle' || T.id === 'bestwert';
  const lang = T.risiko === 'hoch' && erstes;
  const text = lang ? [...SICHERHEIT.riskante_techniken_hinweis, SICHERHEIT.warum_wasser] : [SICHERHEIT.kurz_vor_riskanter_uebung];
  // 020-layout: ruhige Form B – Überschrift „Kurz vorab“ (kein Warndreieck), „Zurück“ statt „Abbrechen“; Texte unverändert
  const w = await blatt(`<h2>Kurz vorab</h2><div class="bilder">${BILDER.map(([s, t]) => `<div>${sym(s, 'gross')}<span>${t}</span></div>`).join('')}</div>
    ${text.map((t) => `<p>${esc(t)}</p>`).join('')}<p class="leise">Nicht bei: ${esc(SICHERHEIT.ausschluss.join(', '))}.</p>
    <div class="zwei"><button class="knopf" data-w="nein">Zurück</button><button class="knopf haupt" data-w="ja">${liegend ? 'Verstanden – ich liege' : 'Verstanden – ich sitze/liege'}</button></div>`);
  if (w !== 'ja') return false;
  if (lang) speicher.setzeSicherheit({ lang_gesehen: { ...(si.lang_gesehen || {}), [T.id]: new Date().toISOString() } });
  return true;
}

// ---------- Start ----------
function kachel(id, name, ziel, href) { return `<a class="kachel" href="${href}">${sym(id)}<b>${esc(name)}</b><span>${esc(ziel || '')}</span></a>`; }
// 020-layout Anfang: Heute ersetzt die alte Startseite (Lage-Kacheln jetzt oben in Üben). Kontext für layout.js / ziele.js:
const LCTX = () => ({ seite, blatt, esc, sym, speicher, TECHNIKEN, SITUATIONEN, REIHENFOLGE, SICHERHEIT, VERSION, dauerText, route, heuteTraining, starteUebung,   // 020: + blatt/starteUebung für ziele.js
  starteTraining: (x) => starte(TECHNIKEN[x.technik], { variante: x.variante, dauer_min: x.dauer_min, stufe: x.stufe, bestwert_s: x.bestwert_s, letzte_halten_s: x.letzte_halten_s, laengen: speicher.einst().laengen }, 'training', null, { baustein: x.baustein, stufe: x.stufe }) });
function zeigeStart() { LAY.zeigeHeute(LCTX()); $('#schnell').onclick = () => starte(TECHNIKEN.seufzer, { variante: 'kurz' }, 'frei'); }
// 020-layout Ende
// 020-ziele: Ein-Tipp-Start aus Heute (Ton im Tipp: starte() ohne await davor); gesperrte/intensive Übungen und solche mit Hinweiszeile öffnen ihre Seite
function starteUebung(id, o = {}, quelle = 'frei') {
  const T = TECHNIKEN[id]; if (!T) return;
  if (TRN.gesperrt(T, { training: speicher.training(), sicherheit: speicher.sicherheit() }) || RISIKO_HOCH(T) || T.warnung === 'zeile' || T.modus !== 'takt' && T.modus !== 'runden') { location.hash = '#uebung/' + id; return; }   // Hinweiszeile bleibt an ihrem Ort (Übungsseite)
  const gz = grenzen(T, { d: o.min, v: o.v });
  starte(T, { variante: o.v || null, dauer_min: gz.dauer_min ?? (T.dauer ? T.dauer.standard : null), zyklen: gz.zyklen, runden: gz.runden, laengen: speicher.einst().laengen || {} }, quelle);
}
const ZCTX = () => ({ seite, blatt, esc, sym, speicher, TECHNIKEN, VERSION, starteUebung, route });   // 020-ziele
function zeigeNichtGut() {   // 020: 112-Knopf oben in der Karte – auch quer ohne Scrollen sichtbar
  seite('Gerade nicht gut?', `<p class="akut-satz">Erst einmal: langsam ausatmen. Wir machen das zusammen.</p><button class="knopf haupt voll" id="schnell">1 Minute runterkommen</button>
    <div class="karte notfall"><a class="knopf gefahr voll" href="tel:112">${sym('telefon')} 112 anrufen</a><b>Sofort 112 bei:</b><ul>${SICHERHEIT.notruf_112.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
    <details class="karte"><summary>Wann ärztlich abklären?</summary><ul>${SICHERHEIT.aerztlich_abklaeren.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>
    <h3>Was ist los?</h3><div class="kacheln">${['akut_unruhe', 'spannungskopfschmerz', 'uebelkeit', 'schmerz', 'energie', 'stress'].map((id) => kachel(id, SITUATIONEN[id].name, SITUATIONEN[id].ziel_ui, '#lage/' + id)).join('')}</div>
    `, 'start', 2);
  $('#schnell').onclick = () => starte(TECHNIKEN.seufzer, { variante: 'kurz' }, 'frei');   // 020-layout
}
function belegReihe(beleg) { return Object.entries(beleg || {}).map(([k, s]) => abzeichen(s, ZIELNAMEN[k] || k.replace(/_/g, ' '))).join(' '); }
function zeigeLage(id) {
  if (id === 'nicht_gut') return zeigeNichtGut();
  const L = SITUATIONEN[id]; if (!L) return zeigeStart();
  const warn = L.warnzeichen ? `<div class="karte notfall warnkarte"><b>${sym('warnung', 'warn')} Erst prüfen: Warnzeichen</b><ul>${L.warnzeichen.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <a class="knopf gefahr voll" href="tel:112">${sym('telefon')} 112 anrufen</a>${id === 'spannungskopfschmerz' ? '<p>Gegen akute Kopfschmerzen ist Atmen nicht als wirksam belegt. Es kann beim Entspannen helfen.</p>' : ''}</div>` : '';
  const emp = L.empfehlung.slice().sort((a, b) => (RISIKO_HOCH(TECHNIKEN[a.technik]) ? 1 : 0) - (RISIKO_HOCH(TECHNIKEN[b.technik]) ? 1 : 0));
  // 020-layout: in den Zeilen neutrale Marke „intensiv“ statt Warndreieck
  const zeile = (e, i) => { const T = TECHNIKEN[e.technik], hb = hauptBeleg(T), d = e.dauer_min ? e.dauer_min + ' min' : e.zyklen ? e.zyklen + ' Zyklen' : e.runden ? einheit(e.runden, 'runden') : dauerText(T);
    const href = `#uebung/${T.id}?l=${id}${e.dauer_min ? '&d=' + e.dauer_min : ''}${e.zyklen ? '&z=' + e.zyklen : ''}${e.variante ? '&v=' + e.variante : ''}${e.runden ? '&r=' + e.runden : ''}`;
    return i === 0 ? `<div class="karte empf1"><b>${esc(T.name)}</b><p>${esc(e.warum || e.hinweis || e.dazu || T.kurz)}</p>${hb ? abzeichen(hb[1], ZIELNAMEN[hb[0]] || hb[0]) : ''}${herk(T.herkunft)}<a class="knopf haupt voll" href="${href}&s=1">Start · ${d}</a></div>`
      : `<a class="zeile" href="${href}"><span><b>${esc(T.name)}</b>${RISIKO_HOCH(T) ? LAY.INTENSIV : ''}<small>${esc(e.warum || e.hinweis || e.dazu || T.kurz)} · <i>${HERK_K[T.herkunft] || ''}</i></small></span><span class="rechts">${d}${hb ? abzeichen(hb[1]) : ''}</span></a>`; };
  seite(L.name, `<div class="zweispaltig"><div><p class="ziel">${esc(L.ziel_ui)}</p><div class="belege">${belegReihe(L.beleg)}</div><p class="leise">${esc(L.beleg_ui)}</p>${warn}</div>
    <div>${L.nicht_empfohlen_wenn ? `<p class="hinweis">${sym('warnung', 'warn')} Nicht bei: ${esc(L.nicht_empfohlen_wenn.join(', '))}</p>` : ''}<h3>Empfohlen</h3>${emp.map(zeile).join('')}${L.hinweis_ui ? `<p class="hinweis">${esc(L.hinweis_ui)}</p>` : ''}${L.regelmaessig ? `<p class="hinweis">${esc(L.regelmaessig)}</p>` : ''}
    ${L.nicht_empfohlen.length ? `<p class="leise">Hier nicht empfohlen: ${L.nicht_empfohlen.map((t) => esc(TECHNIKEN[t] ? TECHNIKEN[t].name : t)).join(', ')}</p>` : ''}
    <a class="link" href="#wissen/lage-${id}">Was sagt die Forschung?</a>${L.wissen ? ` <a class="link" href="#wissen/${L.wissen}">Wie das wirkt – und was nicht</a>` : ''}</div></div>${KEIN_ERSATZ}`, 'start', 2);
  const s1 = $('.empf1 a'); if (s1) s1.onclick = (ev) => { ev.preventDefault(); history.pushState(null, '', s1.getAttribute('href')); route(); };   // starte() noch im Tipp
}

// ---------- Übungen ----------
const FILTER = [['alle', 'Alle'], ['beruhigen', 'Beruhigen'], ['aktivieren', 'Aktivieren'], ['messen', 'Messen'], ['singen', 'Singen'], ['anhalten', 'Anhalten']];   // 020-layout: Reihenfolge/Wörter nach DESIGN §4
let filter = 'alle';
function zeigeUebungen() {
  const e = speicher.einst(), tr = speicher.training(), si = speicher.sicherheit();
  const liste = Object.values(TECHNIKEN).filter((T) => (filter === 'alle' || T.gruppe === filter) && (T.gruppe !== 'geraet' || e.geraet));
  // 020-layout: Lage-Kacheln oben (früher Startseite), Wirkungs-Symbol, Beleg-LEDs, neutrale Marke „intensiv“, Anzahl
  seite('Üben', `${LAY.lageReihe(LCTX())}<div class="chips" role="tablist">${FILTER.map(([id, n]) => `<button class="chip ${filter === id ? 'an' : ''}" data-f="${id}">${n}</button>`).join('')}</div>
    <p class="anzahl">${liste.length} Übungen</p><div class="liste2">${liste.map((T) => { const hb = hauptBeleg(T), g = TRN.gesperrt(T, { training: tr, sicherheit: si });
      return `<a class="zeile ${g ? 'grau' : ''}" href="#uebung/${T.id}"><span class="zl">${LAY.wirkSym(T)}<span><b>${esc(T.name)}</b>${RISIKO_HOCH(T) ? LAY.INTENSIV : ''}<small>${esc(g || dauerText(T))}</small></span></span><span class="rechts">${hb ? LAY.leds(hb[1], true) : ''}</span></a>`; }).join('')}
    ${filter === 'singen' || filter === 'alle' ? Object.values(PROGRAMME).filter((p) => p.schritte).map((p) => `<a class="zeile" href="#programm/${p.id}"><span><b>${esc(p.name)}</b><small>Programm · ${p.schritte.length} Übungen</small></span><span class="rechts">${sym('weiter')}</span></a>`).join('') : ''}</div>`, 'uebungen', 1);
  $('#inhalt').querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { filter = b.dataset.f; zeigeUebungen(); }));
}
function ablaufLeiste(plan) {
  const s = plan.schritte; let ende = 0; const z1 = [];
  for (let i = 0; i < s.length && z1.length < 16; i++) { if (s[i].zug > 1 && plan.modus !== 'tabelle') break; z1.push(s[i]); }
  const summe = z1.reduce((a, x) => a + (x.ms ?? 20000), 0) || 1; let x = 0;
  const bal = z1.map((st) => { const w = 100 * (st.ms ?? 20000) / summe, r = `<rect x="${x}%" y="0" width="${Math.max(0.5, w - 0.6)}%" height="28" rx="6" class="ph-${st.art}"/>`; x += w; return r; }).join('');
  const txt = z1.filter((st) => st.ms == null || st.ms >= 900).slice(0, 6).map((st) => (st.ms == null ? 'offen' : Math.round(st.ms / 100) / 10) + ' ' + ({ ein: 'ein', ein2: 'nach', halten_voll: 'halten', halten_leer: 'leer', aus: 'aus', stoss_aus: 'Stoß', ruhe: 'ruhig' }[st.art] || st.art)).join(' · ');
  const extra = plan.runden ? ` · ${plan.zuege ? plan.zuege + ' Züge, ' : ''}${einheit(plan.runden, 'runden')}` : plan.zuege ? ` · ${plan.zuege}×` : '';
  return `<svg class="ablauf" width="100%" height="28" aria-hidden="true">${bal}</svg><p class="leise">${txt}${extra} · ${Math.round(plan.gesamt_ms / 6000) / 10} min</p>`;
}
function optAusHash(q) { const o = {}; for (const [k, v] of new URLSearchParams(q)) o[k] = v; return o; }
function zeigeUebung(id, q) {
  const T = TECHNIKEN[id]; if (!T) return zeigeUebungen();
  if (speicher.einst().ansage === 'stimme') setTimeout(stimmeVor, 600);   // 016-nb B4: Takt-Stimme erst hier vorbereiten (nach dem ersten Bild der Übungsseite)
  const o = optAusHash(q), e = speicher.einst(), tr = speicher.training(), si = speicher.sicherheit();
  if (ton.zaehltoene) ton.zaehltoene();   // 020-klang: Zähltöne schon auf der Übungsseite laden
  const gz = grenzen(T, o);   // 0.1.4: d/z/r aus dem Link nur innerhalb der Grenzen („Nicht verlängerbar“ gilt auch für #uebung/kraft?r=6)
  const st = { variante: o.v || null, dauer_min: gz.dauer_min ?? (T.dauer ? T.dauer.standard : null), zyklen: gz.zyklen, runden: gz.runden, laengen: e.laengen || {} };
  if (T.modus === 'tabelle') { const pb = letzterBestwert(); st.bestwert_s = pb ? pb.s : null; st.stufe = (tr && tr.stufen && tr.stufen[T.id === 'co2_tabelle' ? 'B-CO2' : 'B-O2']) || 1; }
  const g = TRN.gesperrt(T, { training: tr, sicherheit: si });
  const offenLaenge = T.phasen.find((p) => p.s && typeof p.s === 'object');
  const male = () => {
    const plan = T.modus === 'tabelle' && !st.bestwert_s ? null : baue(T, st);
    $('#abl').innerHTML = plan ? ablaufLeiste(plan) : '<p class="hinweis">Erst den Anhalte-Bestwert messen – die Zeiten werden daraus berechnet.</p>';
    if ($('#dauerw')) $('#dauerw').textContent = st.zyklen ? st.zyklen + ' Zyklen' : st.dauer_min + ' min';
    document.querySelectorAll('#stufen .chip').forEach((c) => c.classList.toggle('an', SF[c.dataset.st] === stW()));
    LAY.losText(plan);   // 020-layout: „Starten · 5 min“
    return plan;
  };
  const verlauf = T.messwert ? verlaufSvg(speicher.messwerte()[T.messwert] || [], T.messwert === 'M-AF' ? 'n' : 's') : '';
  const SF = T.stufen, stW = () => !SF ? null : SF.einheit === 'runden' ? st.runden || T.ablauf.runden : SF.einheit === 'zyklen' ? st.zyklen || T.zyklen.standard : st.dauer_min;
  // 020-layout Anfang: Info-Seite nach DESIGN §4 (ein Satz, 3 Fakten, Kurz/Normal/Lang, höchstens ein ruhiger Hinweis, Rest unter „Mehr zur Übung“). Alle ids bleiben.
  const hinweisEins = g ? '' : new Date().getHours() >= 21 && (T.modus === 'tabelle' || T.id === 'bestwert') ? LAY.ruhig('Anhalte-Übungen machen wach – lieber nicht kurz vor dem Schlafen.')
    : RISIKO_HOCH(T) ? LAY.ruhig('Nur im Sitzen oder Liegen – nicht im Wasser, nicht beim Fahren.') : T.hinweis_zeile ? LAY.ruhig(esc(T.hinweis_zeile))
    : T.gruppe === 'beruhigen' && T.modus !== 'messen' ? LAY.ruhig('Wird dir leicht schwindlig, atme einfach normal weiter.') : '';
  const teile = { T, esc, g, hb: hauptBeleg(T), dauer: dauerText(T), verlauf,
    vorschau: T.modus === 'messen' || RISIKO_HOCH(T) ? '' : vorschauHtml(''),
    stufen: SF ? `<div class="chips stufen" id="stufen">${[['kurz', 'Kurz'], ['normal', 'Normal'], ['lang', 'Lang']].map(([k, n]) => `<button class="chip" data-st="${k}" ${SF[k] == null ? 'disabled' : ''}>${n}${SF[k] != null ? '<br><small>' + (SF.einheit === 'min' ? SF[k] : einheit(SF[k], SF.einheit)) + '</small>' : ''}</button>`).join('')}</div>` : '',
    stepper: (T.dauer || T.zyklen) ? `${SF ? '<h3>Eigene Dauer</h3>' : ''}<div class="stepper"><button class="knopf-ico" data-s="-" aria-label="Kürzer">${sym('minus')}</button><b id="dauerw"></b><button class="knopf-ico" data-s="+" aria-label="Länger">${sym('plus')}</button></div>` : '',
    varianten: T.varianten.filter((v) => v.phasen || v.dauer).length ? `<div class="chips">${[{ id: '', name: 'Standard' }, ...T.varianten.filter((v) => v.phasen || v.dauer)].map((v) => `<button class="chip ${(st.variante || '') === v.id ? 'an' : ''}" data-v="${v.id}">${esc(v.name)}</button>`).join('')}</div>` : '',
    laenge: offenLaenge ? `<label class="schieber">Ausatmen ${offenLaenge.s.min}–${offenLaenge.s.max} s <input type="range" min="${offenLaenge.s.min}" max="${offenLaenge.s.max}" step="1" value="${(e.laengen || {})[T.id] || offenLaenge.s.min}" id="laenge"></label>` : '',
    hinweis: hinweisEins, haltung: '',
    mehrInhalt: `${SF ? '%STEPPER%' : ''}%VARIANTEN%${T.anleitung.length ? `<h3>So geht's</h3><ol class="anleitung">${T.anleitung.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>` : ''}<p class="haltung">${haltungSym(T.haltung, T.liegend)} ${esc(T.haltung)}</p>
      <h3>Was Studien zeigen</h3><p class="leise">${esc(T.wirkung_ui)}</p><div class="belege">${belegReihe(T.beleg)}</div>${T.beleg_ui ? `<p class="leise">${esc(T.beleg_ui)}</p>` : ''}
      ${SF ? `<p class="leise">${esc(SF.grund || 'Lieber jeden Tag kurz als selten lang.')} <a class="link" href="#wissen/T-DAUER">Muss ich lange üben?</a></p>` : ''}
      ${T.risiken.length ? `<h3>Gut zu wissen</h3><ul>${T.risiken.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
      ${RISIKO_HOCH(T) ? `<p class="leise">Nicht bei: ${esc(SICHERHEIT.ausschluss.join(', '))}.</p>` : ''}${herk(T.herkunft)}
      <button class="link" id="quellen">Quellen (${T.quellen.length})</button><div id="qliste"></div>` };
  if (SF) { teile.mehrInhalt = teile.mehrInhalt.replace('%STEPPER%', teile.stepper); teile.stepper = ''; }
  teile.mehrInhalt = teile.mehrInhalt.replace('%VARIANTEN%', teile.varianten ? '<h3>Varianten</h3>' + teile.varianten : ''); teile.varianten = '';   // Varianten unter „mehr“   // feine Dauer unter „mehr“, Kurz/Normal/Lang sichtbar
  seite(T.name, LAY.infoHtml(teile), 'uebungen', 2);
  // 020-layout Ende
  let plan = male();
  const merkeWahl = () => {   // Wahl im Link merken: übersteht das Aktualisieren (ohne neuen Verlaufseintrag)
    const p = new URLSearchParams(q || ''); p.delete('s');
    for (const [k, w] of [['d', T.dauer && !st.zyklen ? st.dauer_min : null], ['z', st.zyklen], ['r', st.runden], ['v', st.variante]]) if (w) p.set(k, w); else p.delete(k);
    const s = p.toString(); history.replaceState(null, '', location.hash.split('?')[0] + (s ? '?' + s : ''));
  };
  $('#inhalt').onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.st) { const w = SF[b.dataset.st]; if (w == null) return; st[SF.einheit === 'min' ? 'dauer_min' : SF.einheit] = w; plan = male(); merkeWahl(); }
    else if (b.dataset.s) { if (st.zyklen || (!T.dauer && T.zyklen)) { const z = T.zyklen || { min: 1, max: 8, standard: 4 }; st.zyklen = Math.min(z.max, Math.max(z.min, (st.zyklen || z.standard) + (b.dataset.s === '+' ? 1 : -1))); } else { st.dauer_min = Math.min(T.dauer.max, Math.max(T.dauer.min, Math.round(st.dauer_min) + (b.dataset.s === '+' ? 1 : -1))); } plan = male(); merkeWahl(); }
    else if (b.dataset.v != null) { st.variante = b.dataset.v || null; b.parentNode.querySelectorAll('.chip').forEach((c) => c.classList.toggle('an', c === b)); plan = male(); merkeWahl(); }
    else if (b.id === 'quellen') wissenModul().then((W) => { $('#qliste').innerHTML = quellenListe(T.quellen, W.QUELLEN); }, keinNetz);
    else if (b.id === 'los' && plan) starte(T, st, o.l ? 'lage:' + o.l : o.q || 'frei', plan);
  };
  if ($('#laenge')) $('#laenge').oninput = (ev) => { st.laengen = { ...st.laengen, [T.id]: +ev.target.value }; plan = male(); speicher.setzeEinst({ laengen: st.laengen }); };
  if (T.zyklen && !T.dauer && !st.zyklen) { st.zyklen = T.zyklen.standard; plan = male(); }
  if (T.modus !== 'messen' && !RISIKO_HOCH(T)) vorschau(() => plan, { ansicht: T.id === 'wechsel' ? 'vorn' : undefined });
  if (o.s === '1') { const p = new URLSearchParams(q || ''); p.delete('s'); const r = p.toString(); history.replaceState(null, '', location.hash.split('?')[0] + (r ? '?' + r : '')); }   // Autostart nur einmal (020-nb H1: auch „?s=1“ aus „Jetzt starten“)
  if (o.s === '1' && !g && !RISIKO_HOCH(T)) starte(T, st, o.l ? 'lage:' + o.l : 'frei', plan);
}
function quellenListe(ids, Q) { return `<ul class="quellen">${ids.map((id) => Q[id]).filter(Boolean).map((q) => `<li><a href="${esc(q.link)}" target="_blank" rel="noopener">${esc(q.kurz)}</a> <small>${esc(q.art || '')}${q.jahr ? ' · ' + q.jahr : ''}</small></li>`).join('')}</ul><p class="leise">Links brauchen Internet.</p>`; }
function verlaufSvg(werte, feld) {
  if (!werte.length) return '<p class="leise">Noch keine Werte.</p>';
  const w = werte.slice(-12), max = Math.max(...w.map((x) => x[feld])) || 1, n = w.length;
  const pts = w.map((x, i) => `${n === 1 ? 50 : 4 + 92 * i / (n - 1)},${36 - 30 * x[feld] / max}`).join(' ');
  return `<div class="verlauf"><b>${w[n - 1][feld]}${feld === 's' ? ' s' : '/min'}</b><svg viewBox="0 0 100 40" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg><small>Persönlicher Verlaufswert – vergleiche nur mit dir selbst.</small></div>`;
}
const letzterBestwert = () => (speicher.messwerte()['M-PB'] || []).slice(-1)[0] || null;

// ---------- Figur-Vorschau (Vorbereitung, Singen, Wissen) ----------
// Derselbe Plan und dieselbe Kurve wie in der Übung (zustandBei → setze), nur auf Tippen, höchstens 2 Zyklen bzw. 24 s.
// rAF nur während der Vorschau; Ende bei Seitenwechsel, Hintergrund oder wenn die Karte verschwindet.
let vorschauStop = null;
const vorschauHtml = (titel, gross) => `<div class="karte vorschau${gross ? ' gross' : ''}"><div class="vs-fig"></div><div class="vs-leiste"><span class="vs-wort">${esc(titel)}</span><button class="knopf klein zweit" id="vs-los">${sym('play')}<span>Vorschau</span></button></div></div>`;
function vorschau(quelle, opt) {   // lädt vorschau.js + anatomie.js erst hier (nicht auf der Startseite)
  if (vorschauStop) { vorschauStop(); vorschauStop = null; }
  const karte = $('.vorschau'); if (!karte) return;
  import('./vorschau.js').then((m) => m.vorschau(karte, quelle, opt)).then((stop) => { if (!stop) return; if (vorschauStop) vorschauStop(); vorschauStop = stop; }).catch(() => {});
}
// Wissen-Themen mit passender Übung für die Vorschau (riskante Techniken und Skoliose bewusst ohne Figur)
const WISSEN_FIGUR = { 'T-VAGUS': 'lang_aus', 'T-NASE': 'bauch', 'T-LANGSAM': 'resonanz', 'T-AUSATMEN': 'lang_aus', 'T-WENIGER': 'weniger', 'T-HALTUNG': 'bauch', 'T-SINGEN': 'g_sss', 'T-WECHSEL': 'wechsel', 'T-KOPFSCHMERZ': 'lang_aus' };

// ---------- Sitzung starten und beenden ----------
// 0.1.4: Ton im Tipp anlegen (vor jedem await), Doppeltipp sperren, Knopf sofort quittieren
async function starte(T, st, quelle, plan, extra = {}) {
  if (startet) return; startet = true;
  const e = speicher.einst(), k = $('#los'), kt = k && k.textContent;
  ton.entsperren(e.musik, { neu: true, ansage: e.ansage }); stimmeVor();   // 016 | 021b: hängender Ton wird im selben Tipp ersetzt, Systemstimme freigeschaltet
  try {
    if (T.warnung === 'voll' || T.warnung === 'kurz') { if (!(await sicherheitsBlatt(T))) { ton.schliessen(); return; } ton.entsperren(e.musik, { neu: true, ansage: e.ansage }); }
    if (!plan) plan = T.id === 'programm' ? st.plan : baue(T, st);
    if (e.eigeneMusik && e.musikName && !ton.musikDa()) { const M = await import('./musik.js').catch(() => null); const v = M && await M.laden(); if (v) ton.musikSetzen(v.pcm, v.meta.rate, v.meta.pegel); }   // 0.1.5 eigene Musik (bleibt auf dem Gerät)
    if (k && !SZda) { k.disabled = true; k.textContent = 'Lädt …'; }
    const SZm = await sitzungModul().catch(keinNetz); if (!SZm) return;
    letzteSitzung = SZm.oeffne(plan, { T, einst: { ...e }, quelle, riskant: RISIKO_HOCH(T), merke: (x) => speicher.setzeEinst(x), sperre: tippSperre, beiEnde: (erg, ui) => endeSitzung(erg, ui, st, extra) });
    if (T.id !== 'programm') speicher.setzeEinst({ letzte: T.id });
  } finally { startet = false; if (k && k.textContent === 'Lädt …') { k.textContent = kt; k.disabled = false; } }
}
async function endeSitzung(erg, ui, st, extra) {
  const { T, plan, ende } = erg;
  const ist_s = Math.round(erg.ist_ms / 100) / 10;
  const eintrag = { t: new Date().toISOString(), technik: T.id, variante: plan.variante, plan_s: Math.round(plan.gesamt_ms / 1000), ist_s, ende, quelle: erg.quelle };
  if (extra.baustein) { eintrag.baustein = extra.baustein; eintrag.stufe = extra.stufe; }
  if (T.id === 'kraft' && erg.war !== 'zaehlen') speicher.setzeSicherheit({ kraft_zuletzt: new Date().toISOString() });
  // Messwerte
  let messText = '';
  if (T.messwert && ende !== 'unterbrochen') {
    let w = null;
    if (T.id === 'ruhe_zuege') { if (ende === 'fertig') w = { t: eintrag.t, n: erg.tippZahl }; }
    else { const k = erg.gekuerzt.find((x) => x.wand_ms != null); if (k) w = { t: eintrag.t, s: Math.round(k.wand_ms / 1000) }; }
    if (w) { speicher.messwert(T.messwert, w); messText = `<p class="messwert">${w.s != null ? w.s + ' s' : w.n + '/min'}</p><p class="leise">Persönlicher Verlaufswert – vergleiche nur mit dir selbst.</p>`; if (!eintrag.baustein) eintrag.baustein = T.messwert; }
  }
  if (ende === 'unterbrochen') messText = '<p class="hinweis">Messung unterbrochen – nicht gespeichert.</p>';
  if (plan.tabelle) eintrag.tabelle = plan.tabelle.map((r, i) => { const k = erg.gekuerzt.find((x) => x.runde === i + 1 && x.art === 'halten_voll'); return { halten_s: r.halten_s, ist_s: k ? Math.round(k.ms / 1000) : r.halten_s }; });
  const riskant = RISIKO_HOCH(T);
  const frage = riskant ? `<p><b>Hattest du Schwindel, Kribbeln, Sehflimmern oder Ähnliches?</b></p><div class="zwei"><button class="knopf" data-z="nein">Nein</button><button class="knopf" data-z="ja">Ja</button></div>` : '';
  const anstr = plan.tabelle ? `<label class="schieber">Wie anstrengend? <b id="anw">5</b> <input type="range" min="0" max="10" value="5" id="anstr"></label>` : '';
  const titel = ende === 'abbruch' ? 'Atme ruhig und normal. Bleib sitzen.' : ende === 'fertig' ? 'Fertig · ' + Math.floor(ist_s / 60) + ':' + String(Math.round(ist_s % 60)).padStart(2, '0') + ' min' : 'Beendet';
  ui.zeigeBlatt(`<h2>${titel}</h2>${messText}${anstr}${frage}${ZIELE ? ZIELE.endeHtml(eintrag) : ''}<div id="zantw"></div><div class="zwei"><button class="knopf" data-e="nochmal">Nochmal</button><button class="knopf haupt" data-e="fertig">Fertig</button></div>`);
  const host = $('#sitzung'); let zeichen = null, angegeben = false;
  await new Promise((ok) => {
    host.onclick = (ev) => {
      const z = ev.target.closest('[data-z]'), b = ev.target.closest('[data-e]');
      if (z) { zeichen = z.dataset.z === 'ja'; z.parentNode.querySelectorAll('button').forEach((x) => x.classList.toggle('an', x === z)); $('#zantw').innerHTML = zeichen ? `<p class="hinweis">Für heute keine Anhalte- oder Schnellatem-Übungen mehr. Bei wiederholtem Auftreten: ärztlich abklären. Brustschmerz, anhaltende Atemnot oder Ohnmacht: 112.</p><a class="knopf gefahr voll" href="tel:112">112 anrufen</a>` : ''; }
      if (b) { host.onclick = null; ok(b.dataset.e); eintrag._wahl = b.dataset.e; }
    };
    const a = $('#anstr'); if (a) a.oninput = () => { angegeben = true; $('#anw').textContent = a.value; };
  });
  if (ZIELE) ZIELE.nachEnde(eintrag);   // 020-ziele: freiwillige Anspannung/Leichtigkeit (nur auf dem Gerät)
  if ($('#anstr') && angegeben) eintrag.anstrengung = +$('#anstr').value;
  if (eintrag.tabelle) { const su = (f) => eintrag.tabelle.reduce((x, r) => x + r[f], 0); eintrag.anteil = Math.round(100 * su('ist_s') / su('halten_s')) / 100; }
  if (zeichen != null) eintrag.zeichen = zeichen;
  const wahl = eintrag._wahl; delete eintrag._wahl;
  const altP = speicher.protokoll();
  speicher.eintrag(eintrag);
  if (zeichen) speicher.setzeSicherheit(TRN.abbruchSperre(speicher.sicherheit(), new Date()));
  const tr = speicher.training();
  if (tr && eintrag.baustein) speicher.setzeTraining(TRN.nachEinheit(tr, eintrag, altP, new Date()));
  if (ende === 'fertig' && !altP.some((x) => x.ende === 'fertig')) speicher.persist();
  if (wahl === 'nochmal') ui.nochmal(); else { ui.schliessen(); route(); }
}

// ---------- Training ----------
function heuteTraining(datum = new Date()) {
  const tr = speicher.training(); if (!tr || !tr.start) return null;
  const h = TRN.heute({ training: tr, protokoll: speicher.protokoll(), messwerte: speicher.messwerte(), sicherheit: speicher.sicherheit(), einst: speicher.einst(), datum, TRAINING });
  if (h && h.training !== tr) speicher.setzeTraining(h.training);
  return h;
}
const MESS_T = { 'M-KP': 'kontrollpause', 'M-PB': 'bestwert', 'M-AF': 'ruhe_zuege', 'M-AUS': 'sss_messen' };
function zeigeTraining() {
  const tr = speicher.training();
  if (!tr || !tr.start) {
    seite('Training', `<div class="karte"><h2>${esc(TRAINING.titel_ui)}</h2><p>${esc(TRAINING.ehrliche_einordnung)}</p><p class="hinweis">${esc(TRAINING.lunge_ui)}</p></div>
      <div class="karte"><b>Vorher ärztlich besprechen bei:</b><ul>${TRAINING.nicht_fuer.vorher_aerztlich_besprechen.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <button class="knopf haupt voll" id="beginn">Training beginnen</button>${KEIN_ERSATZ}`, 'training', 1);
    $('#beginn').onclick = async () => {
      const a = await blatt(`<h2>Trifft etwas davon auf dich zu?</h2><ul>${TRAINING.nicht_fuer.keine_kraftatmung_keine_anhalte_tabellen.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><div class="zwei"><button class="knopf" data-w="ja">Ja, etwas davon</button><button class="knopf" data-w="nein">Nein, nichts davon</button></div>`);
      const g = await blatt(`<h2>Hast du einen Atemtrainer (Gerät)?</h2><div class="zwei"><button class="knopf" data-w="ja">Ja</button><button class="knopf" data-w="nein">Nein</button></div>`);
      speicher.setzeTraining(TRN.neuesTraining(new Date(), { ausschluss: a === 'ja', geraet: g === 'ja' }));
      if (g === 'ja') speicher.setzeEinst({ geraet: true });
      zeigeTraining();
    };
    return;
  }
  const h = heuteTraining();
  const T0 = TRN.tagNr(h.wochen_start), heuteNr = TRN.tagNr(TRN.tag(new Date()));
  const prot = speicher.protokoll().filter((x) => x.baustein);
  const punkte = [0, 1, 2, 3, 4, 5, 6].map((k) => { const d = T0 + k, an = prot.some((x) => TRN.tagNr(TRN.tag(x.t)) === d); return `<span class="punkt ${an ? 'voll' : d === heuteNr ? 'heute' : d < heuteNr ? 'ring' : ''}"></span>`; }).join('');
  const mw = speicher.messwerte();
  const kurve = (id, n, feld) => `<div class="karte klein"><b>${n}</b>${verlaufSvg(mw[id] || [], feld)}</div>`;
  seite('Training', `<div class="zweispaltig"><div><div class="karte"><b>Woche ${h.woche} von 8 · ${esc(h.stufe_name)}</b><div class="woche">${punkte}</div></div>
    ${h.hinweise.map((t) => `<p class="hinweis">${esc(t)}</p>`).join('')}
    <h3>Heute</h3>${h.einheiten.map((x) => { const T = TECHNIKEN[x.technik]; return `<div class="zeile"><span><b>${esc(T.name)}</b><small>${x.dauer_min ? x.dauer_min + ' min' : ''}${x.stufe ? ' · Stufe ' + x.stufe : ''}${x.pflicht ? '' : ' · freiwillig'}</small></span>${x.erledigt ? `<span class="rechts ok">${sym('haken')}</span>` : `<button class="knopf klein" data-t='${esc(JSON.stringify(x))}'>Start</button>`}</div>`; }).join('')}
    ${h.messen.map((m) => `<div class="zeile"><span><b>${esc(TECHNIKEN[MESS_T[m.id]].name)}</b><small>Messen · ${esc(m.grund)}</small></span><a class="knopf klein" href="#uebung/${MESS_T[m.id]}?q=training">Messen</a></div>`).join('')}
    ${h.gesperrt.map((g) => `<p class="leise">${esc(TECHNIKEN[g.technik] ? TECHNIKEN[g.technik].name : g.technik)}: ${esc(g.grund)}</p>`).join('')}
    <div class="zwei"><button class="knopf zweit" id="mued">Heute geht's mir nicht so gut</button><button class="knopf zweit" id="krank">Ich war krank (≥ 3 Tage)</button></div><p class="leise">Mit Fieber: kein Training.</p></div>
    <div><h3>Fortschritt</h3><div class="kurven">${kurve('M-KP', 'Kontrollpause', 's')}${kurve('M-AF', 'Ruhe-Atemzüge', 'n')}${kurve('M-AUS', '„sss“-Dauer', 's')}${kurve('M-PB', 'Anhalte-Bestwert', 's')}</div><p class="leise">Vergleiche nur mit dir selbst.</p>
    <details class="karte"><summary>Plan ansehen</summary>${TRAINING.programm.map((w) => `<p><b>Woche ${w.woche} · ${esc(w.stufe)}</b><br>${esc(w.taeglich.join(' · '))}${w.zusatz.length ? '<br><small>' + esc(w.zusatz.join(' · ')) + '</small>' : ''}</p>`).join('')}</details>
    <details class="karte"><summary>Regeln</summary><ul>${[...TRAINING.steigerungsregeln, ...TRAINING.zurueckstufen, ...TRAINING.pausen].map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>
    <div class="zwei"><button class="knopf zweit" id="reset">Training zurücksetzen</button><button class="knopf zweit" id="loeschen">Alles löschen</button></div></div></div>${KEIN_ERSATZ}`, 'training', 1);
  if (h.fertig && !tr.fertig) blatt(`<h2>8 Wochen geschafft</h2><p>Vergleiche Woche 1 und 8 in deinem Fortschritt.</p><div class="zwei"><button class="knopf" data-w="w">Wochen 5–8 wiederholen</button><button class="knopf" data-w="r">Nur täglich Resonanz-Atmung</button></div>`).then((w) => { speicher.setzeTraining(w === 'w' ? TRN.wiederhole58(tr) : { ...tr, fertig: new Date().toISOString() }); zeigeTraining(); });
  $('#inhalt').onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.t) { const x = JSON.parse(b.dataset.t), T = TECHNIKEN[x.technik]; starte(T, { variante: x.variante, dauer_min: x.dauer_min, stufe: x.stufe, bestwert_s: x.bestwert_s, letzte_halten_s: x.letzte_halten_s, laengen: speicher.einst().laengen }, 'training', null, { baustein: x.baustein, stufe: x.stufe }); }
    else if (b.id === 'mued') { speicher.setzeTraining(TRN.mued(speicher.training())); zeigeTraining(); }
    else if (b.id === 'krank') { speicher.setzeTraining(TRN.krank(speicher.training())); zeigeTraining(); }
    else if (b.id === 'reset') blatt('<h2>Training zurücksetzen?</h2><div class="zwei"><button class="knopf" data-w="n">Abbrechen</button><button class="knopf gefahr" data-w="j">Zurücksetzen</button></div>').then((w) => { if (w === 'j') { try { localStorage.removeItem('atem.v1.training'); } catch {} zeigeTraining(); } });
    else if (b.id === 'loeschen') allesLoeschen();
  };
}

// ---------- Singen ----------
async function zeigeSingen() {
  const gs = Object.values(TECHNIKEN).filter((T) => T.gruppe === 'singen');
  const pz = (p) => `<a class="zeile" href="#programm/${p.id}"><span><b>${esc(p.name)}</b><small>${p.schritte.map((s) => esc(TECHNIKEN[s.uebung].name)).join(' · ')}</small></span><span class="rechts">${sym('weiter')}</span></a>`;
  seite('Singen', `<div class="zweispaltig"><div><h3>Einsingen nach Ziel</h3>${Object.values(PROGRAMME).filter((p) => p.schritte && p.ziel).map(pz).join('')}<h3>Programme</h3>${Object.values(PROGRAMME).filter((p) => p.schritte && !p.ziel).map((p) => `<a class="zeile" href="#programm/${p.id}"><span><b>${esc(p.name)}</b><small>${p.schritte.map((s) => esc(TECHNIKEN[s.uebung].name)).join(' · ')}</small></span><span class="rechts">${sym('weiter')}</span></a>`).join('')}
    <a class="karte" href="#vergleich"><b>Zwerchfell oder Brust?</b><span>Sieh, was sich bewegt – und welcher Muskel arbeitet.</span></a>
    <h3>Übungen</h3>${gs.map((T) => `<a class="zeile" href="#uebung/${T.id}"><span><b>${esc(T.name)}</b><small>${esc(T.kurz)}</small></span><span class="rechts">${dauerText(T)}</span></a>`).join('')}</div>
    <div id="sw"><p class="leise">Lädt …</p></div></div>${KEIN_ERSATZ}`, 'singen', 1);
  const W = await wissenModul().catch(keinNetz); if (!W) return; const a = W.SINGEN_WISSEN.atemstuetze;
  if ($('#sw')) $('#sw').innerHTML = `<div class="karte"><b>Atemstütze – was stimmt?</b><p>${esc(a.erklaerung_ui)}</p>${vorschauHtml('Atemstütze: Flanken weit, Bauch arbeitet beim „sss“')}<details><summary>Belegt</summary><ul>${a.was_belegt_ist.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details><details><summary>Nicht belegt</summary><ul>${a.was_nicht_belegt_ist.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details><details><summary>3 Mythen</summary><ul>${a.mythen_ui.map((t) => `<li>${esc(typeof t === 'string' ? t : t.mythos + ' – ' + (t.stimmt || t.richtig || ''))}</li>`).join('')}</ul></details></div>
    <div class="karte"><b>Stimme schonen</b><ul>${SICHERHEIT.gesang.punkte.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><b>${sym('warnung', 'warn')} Zum Arzt (HNO)</b><ul>${SICHERHEIT.stimme_warnzeichen.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  if (TECHNIKEN.g_sss && location.hash === '#singen') vorschau(baue(TECHNIKEN.g_sss, { zyklen: 2 }));
}
// 0.1.5: echte Dauer je Teil (gerechnet, nicht geschätzt) und die Hinweise der Übungen auch im Programm
const dauerTxt = (ms) => ms < 60000 ? Math.round(ms / 5000) * 5 + ' s' : String(Math.round(ms / 30000) / 2).replace('.', ',') + ' min';
const risikoTxt = (P) => { const r = [...new Set(P.schritte.flatMap((s) => TECHNIKEN[s.uebung].risiken || []))].filter((t) => !/mühelosen Umfang/.test(t)); return r.length ? `<div class="hinweis"><b>Achte darauf</b><ul>${r.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''; };
function zeigeProgramm(id) {
  const P = PROGRAMME[id]; if (!P || !P.schritte) return zeigeSingen();
  const plan = baueProgramm(P, TECHNIKEN);
  seite(P.name, `<div id="abl">${ablaufLeiste({ ...plan, modus: 'tabelle' })}</div><ol class="anleitung">${P.schritte.map((s, i) => `<li>${esc(TECHNIKEN[s.uebung].name)} · ${dauerTxt(plan.schritte.reduce((a, st) => a + (st.teil === i ? st.ms || 0 : 0), 0))}</li>`).join('')}</ol>${P.hinweis ? `<p class="hinweis">${esc(P.hinweis)}</p>` : ''}${risikoTxt(P)}${P.beleg ? `<p class="leise">${esc(P.beleg)}</p>` : ''}${P.ziel ? '<p class="leise">Nur im mühelosen Umfang – kein Schmerz, kein Pressen. Heiserkeit länger als 2–3 Wochen: ärztlich abklären lassen.</p>' : ''}<p class="leise">Die App spielt keine Töne vor – sing in deiner bequemen Lage.</p><button class="knopf haupt voll" id="los">Start</button>${KEIN_ERSATZ}`, 'singen', 2);
  $('#los').onclick = () => starte({ id: 'programm', name: P.name, risiko: 'niedrig', warnung: 'keine', liegend: false }, { plan }, 'programm:' + id, plan);
}
let vergleichStop = null;
async function zeigeVergleich() {
  seite('Zwerchfell oder Brust?', `<div id="vg"><p class="leise">Lädt …</p></div><p class="leise">Eine Hand auf die Brust, eine auf den Bauch – dann „Selbst spüren“.</p>${KEIN_ERSATZ}`, 'singen', 2);
  const r = await Promise.all([wissenModul(), import('./daten.js')]).catch(keinNetz); if (!r) return; const [W, D] = r;
  const host = $('#vg'); if (!host) return;
  try {
    const A = await import('./anatomie.js'); host.innerHTML = '';
    const v = A.vergleich(host, { vergleich: W.VERGLEICH, daten: { MUSKELN: D.MUSKELN, ATEMARTEN: D.ATEMARTEN }, ruhig: speicher.einst().ruhig, ansicht: speicher.einst().ansicht, selbstSpueren: (id) => { location.hash = '#uebung/' + id; } });
    vergleichStop = () => v.zerstoere();
  } catch {
    host.innerHTML = `<table class="vtab"><tr><th></th><th>Bauch/Flanke</th><th>Brust</th></tr>${W.VERGLEICH.zeilen.map((z) => `<tr><td>${esc(z.merkmal)}</td><td>${esc(z.bauch_flanke)}</td><td>${esc(z.brust_hoch)}</td></tr>`).join('')}</table><p><b>${esc(W.VERGLEICH.hinweis_ui)}</b></p><a class="knopf haupt voll" href="#uebung/g_vergleich_brust_bauch">Selbst spüren</a>`;
  }
}

// ---------- Wissen ----------
async function zeigeWissen(id) {
  seite('Was sagt die Forschung?', '<p class="leise">Lädt …</p>', 'wissen', id ? 2 : 1);
  const W = await wissenModul().catch(keinNetz); if (!W) return;
  if (id === 'quellen') return seite('Quellen', `<p class="leise">Das Buch „${esc(W.BUCH.titel)}“ ist nur Anregung (${W.BUCH.quelle}). Keine Texte übernommen.</p>${quellenListe(Object.keys(W.QUELLEN).filter((k) => !W.QUELLEN[k].alias).sort(), W.QUELLEN)}`, 'wissen', 2);
  if (id && id.startsWith('lage-')) { const L = SITUATIONEN[id.slice(5)]; if (L) return seite(L.name, `<div class="belege">${belegReihe(L.beleg)}</div><p>${esc(L.beleg_ui)}</p>${L.warnzeichen ? `<div class="karte notfall"><b>Warnzeichen</b><ul>${L.warnzeichen.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><a class="knopf gefahr voll" href="tel:112">${sym('telefon')} 112 anrufen</a></div>` : ''}${quellenListe(L.quellen, W.QUELLEN)}${KEIN_ERSATZ}`, 'wissen', 2); }
  if (id === 'lunge') { const lv = W.LUNGE.volumen; seite('Lunge – was wächst wirklich?', `${herk(W.LUNGE.herkunft, W.LUNGE.kapitel)}<p>${esc(W.LUNGE.realistisch.ui_text)}</p><p class="leise">${esc(W.LUNGE.realistisch.kurz)}</p><svg class="lunge-balken" viewBox="0 0 100 16"><rect x="0" y="4" width="100" height="8" rx="4" class="leer"/><rect x="${(1.2 / 6) * 100}" y="4" width="${(4.8 / 6) * 100}" height="8" rx="4" class="voll"/></svg><p class="leise">1,2 L Restluft bis etwa 6 L Gesamt – ${esc(lv.hinweis)}</p>${vorschauHtml('Ruhig, dann tief in den Bauch', true)}${KEIN_ERSATZ}`, 'wissen', 2); return vorschau(baue(TECHNIKEN.bauch, { dauer_min: 1 }), { modus: 'gross' }); }
  const T = id && W.THEMEN.find((t) => t.id === id);
  if (T) seite(T.titel_ui, `<div class="lesen">${herk(T.herkunft, T.kapitel)}<h3>${T.herkunft === 'recherche' ? 'Worum es geht' : 'Die Idee (sinngemäß)'}</h3><p>${esc(T.kernaussage_buch)}</p><h3>Was Studien zeigen</h3><div class="belege">${belegReihe(T.beleg)}</div><ul>${T.was_studien_zeigen.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><h3>Was die App daraus macht</h3><p>${esc(T.app_folgerung)}</p>${T.id === 'T-SKOLIOSE' ? '<p class="hinweis">Nur mit Fachleuten.</p>' : ''}${WISSEN_FIGUR[T.id] && TECHNIKEN[WISSEN_FIGUR[T.id]] ? vorschauHtml(TECHNIKEN[WISSEN_FIGUR[T.id]].name) : ''}<h3>Quellen</h3>${quellenListe(T.quellen, W.QUELLEN)}</div>${KEIN_ERSATZ}`, 'wissen', 2);
  if (T && WISSEN_FIGUR[T.id] && TECHNIKEN[WISSEN_FIGUR[T.id]]) { const TT = TECHNIKEN[WISSEN_FIGUR[T.id]]; vorschau(baue(TT, TT.dauer ? { dauer_min: TT.dauer.min } : {}), { ansicht: TT.id === 'wechsel' ? 'vorn' : undefined }); }
  if (T) return;
  seite('Was sagt die Forschung?', `<div class="karte"><b>So bewerten wir</b><ul class="skala">${Object.entries(W.SKALA).map(([s, t]) => `<li>${abzeichen(s)} ${esc(t)}</li>`).join('')}</ul><p>Regelmäßig ruhig atmen zählt offenbar mehr als die genaue Technik.</p></div>
    <div class="liste2">${W.THEMEN.map((t) => `<a class="karte thema" href="#wissen/${t.id}"><b>${esc(t.titel_ui)}</b><div class="belege">${Object.values(t.beleg).map((s) => abzeichen(s)).join('')}</div><span>${esc(t.ui_kurztext)}</span><i class="herk">${HERK_K[t.herkunft]}</i></a>`).join('')}
    <a class="karte" href="#wissen/lunge"><b>Lunge – was wächst wirklich?</b><span>${esc(TRAINING.lunge_ui)}</span></a></div>
    <details class="karte"><summary>Buch-Kapitel – wo sie in der App stehen</summary><ul class="kapitel">${W.BUCH.kapitel.map((k) => `<li><b>${esc(k.k)}:</b> ${esc(k.thema)} → ${esc(k.app)}</li>`).join('')}</ul><p class="leise">Nur Themen in eigenen Worten, keine Buchtexte.</p></details>
    <h3>Situationen</h3>${REIHENFOLGE.map((s) => `<a class="zeile" href="#wissen/lage-${s}"><span><b>${esc(SITUATIONEN[s].name)}</b></span><span class="rechts">${Object.values(SITUATIONEN[s].beleg).map((x) => abzeichen(x)).join('')}</span></a>`).join('')}
    <a class="knopf zweit voll" href="#wissen/quellen">Alle Quellen</a>${KEIN_ERSATZ}`, 'wissen', 1);
}

// ---------- Einstellungen ----------
function zeigeEinstellungen() {
  if (!ZM) zmLade().then((m) => { if (m && location.hash.startsWith('#einstellungen')) zeigeEinstellungen(); });   // 020-klang: Zähltöne-Zeile nach dem Laden zeigen
  const e = speicher.einst(), tr = speicher.training();
  const sch = (k, n) => `<label class="schalter"><span>${n}</span><input type="checkbox" data-k="${k}" ${e[k] ? 'checked' : ''}></label>`;
  seite('Einstellungen', `<div class="zweispaltig"><div><div class="karte"><b>Ton</b><div class="chips">${['klang', 'wind', 'aus'].map((t) => `<button class="chip ${e.ton === t ? 'an' : ''}" data-ton="${t}" aria-pressed="${e.ton === t}">${{ klang: 'Klang', wind: 'Wind', aus: 'Aus' }[t]}</button>`).join('')}</div>
      ${ZM ? ZM.zaehlKarte(e, sym) : '<div id="zaehltoene"></div>' /* 020-klang */}
      <p class="leise probe" id="probetext"><span class="pkreis" aria-hidden="true"></span><span id="probewort">Tippen = Probehören</span></p>
      <label class="schieber">Lautstärke <input type="range" min="0" max="1" step="0.05" value="${e.laut}" data-k="laut"></label>${sch('sekunden', 'Leises Ticken beim Halten')}${sch('musik', 'Zur eigenen Musik')}${M016.schalter(e)}
      <a class="zeile" href="#musik" id="musikzeile"><span><b>Eigene Musik</b><small>${e.eigeneMusik && e.musikName ? 'An: ' + esc(e.musikName) : e.musikName ? 'Aus: ' + esc(e.musikName) : 'Ein ruhiges Stück von deinem Gerät unter die Übung legen'}</small></span><span class="rechts">${sym('weiter')}</span></a>
      <button class="knopf zweit voll" id="tonpruef">Ton prüfen</button><div id="tonerg"></div></div>
    <div class="karte"><b>Anzeige</b>${sch('ruhig', 'Ruhige Anzeige')}${sch('figur', 'Figur zeigen')}${sch('blumen', 'Blüte statt Kreis')}<div class="chips">${['seite', 'vorn'].map((t) => `<button class="chip ${e.ansicht === t ? 'an' : ''}" data-ans="${t}">${t === 'seite' ? 'Seite' : 'Vorne'}</button>`).join('')}</div></div>
    <div class="karte"><b>Übungen</b>${sch('vorherNachher', 'Anspannung vorher/nachher fragen')}${sch('geraet', 'Ich habe einen Atemtrainer')}
      ${tr ? `<label class="schalter"><span>Ausschlussgrund angegeben</span><input type="checkbox" id="ausschl" ${tr.ausschluss ? 'checked' : ''}></label>` : ''}</div></div>
    <div><div class="karte"><b>Sicherheit</b><button class="knopf zweit voll" id="sichlesen">Sicherheitshinweise lesen</button><a class="knopf gefahr voll" href="tel:112">${sym('telefon')} Notfall: 112</a></div>
    <div class="karte"><b>Daten</b><button class="knopf zweit voll" id="export">Sichern (Datei)</button><label class="knopf zweit voll">Wiederherstellen<input type="file" accept="application/json,.json" id="import" hidden></label><button class="knopf zweit voll" id="loeschen">Alles löschen</button><p class="leise">Die Home-Bildschirm-App hat einen eigenen Speicher, getrennt von Safari.</p></div>
    <div class="karte"><b>Über</b><p>Version ${VERSION} · <span id="offline">${navigator.serviceWorker && navigator.serviceWorker.controller ? 'Offline bereit' : 'Offline noch nicht bereit'}</span></p><p>Keine Gesundheitsdaten verlassen dein Gerät. Nur mit Erinnerung gehen Thema, Uhrzeit, Satz und App-Adresse an den Erinnerungsdienst (wie bei jedem Abruf auch deine IP-Adresse).</p><a class="link" href="#wissen/quellen">Quellen</a></div></div></div>`, 'start', 2);
  const i = $('#inhalt');
  i.querySelectorAll('[data-k]').forEach((x) => (x.onchange = () => {
    speicher.setzeEinst({ [x.dataset.k]: x.type === 'checkbox' ? x.checked : +x.value });
    if (x.dataset.k === 'laut') { ton.entsperren(speicher.einst().musik); ton.einstellen({ laut: +x.value }); ton.probe('glocke'); }   // beim Loslassen: kurze Glocke in neuer Lautstärke
    if (x.dataset.k === 'signaleLaut') { const e3 = speicher.einst(), s3 = ZM ? ZM.stilVon(e3) : 'zaehlen'; ton.entsperren(e3.musik); ton.einstellen({ signaleLaut: +x.value }); ton.probe((s3 === 'aus' ? 'zaehlen' : s3) + '_kurz'); }   // 020-klang: kurz hören (2 s ein + 3 s aus)
  }));
  i.onclick = async (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (ZM && ZM.zaehlKlick(b, { ton, speicher })) return;   // 020-klang: Zähltöne wählen / vorhören
    if (b.dataset.ton) {   // 0.1.5: wählen UND sofort Probe hören (wie Klingelton-Auswahl); kein neues Neuzeichnen der Seite (Ton läuft weiter)
      const t = b.dataset.ton, e2 = speicher.setzeEinst({ ton: t });
      ton.entsperren(e2.musik); ton.einstellen({ art: t, laut: e2.laut }); const zt = ZM && t === 'klang' && ZM.stilVon(e2) !== 'aus' ? ZM.stilVon(e2) : ''; ton.probe(zt ? zt + '_kurz' : t);   // 020-klang: mit Zähltönen klingt „Klang“ so (kurz)
      i.querySelectorAll('[data-ton]').forEach((c) => { c.classList.toggle('an', c === b); c.setAttribute('aria-pressed', c === b); });
      const pt = $('#probetext'), pw = $('#probewort'); if (pt && pw) { pw.textContent = zt ? ZM.TEXT[zt] : t === 'aus' ? 'Ohne Ton – Kreis und Figur führen allein.' : t === 'wind' ? 'Wind: rauscht beim Einatmen auf, beim Ausatmen ab.' : 'Klang: eine Glocke beim Einatmen, eine tiefere beim Ausatmen.'; pt.classList.remove('puls'); void pt.offsetWidth; pt.classList.add('puls'); }
    }
    else if (b.dataset.ans) { speicher.setzeEinst({ ansicht: b.dataset.ans }); zeigeEinstellungen(); }
    else if (b.id === 'tonpruef') { ton.einstellen({ art: 'klang', laut: speicher.einst().laut }); const r = await ton.pruefen(); $('#tonerg').innerHTML = `<p>Hörst du drei Töne?</p><div class="zwei"><button class="knopf" id="tja">Ja</button><button class="knopf" id="tnein">Nein</button></div>`; $('#tonerg').dataset.zustand = r.zustand; }
    else if (b.id === 'tnein') $('#tonerg').innerHTML = '<p class="hinweis">Prüfe den Stummschalter und die Lautstärke. Öffne die App sonst einmal neu. Das Bild führt dich auch ohne Ton.</p>';
    else if (b.id === 'tja') $('#tonerg').innerHTML = '<p class="leise">Gut.</p>';
    else if (b.id === 'sichlesen') erststart();
    else if (b.id === 'export') exportiere();
    else if (b.id === 'loeschen') allesLoeschen();
  };
  $('#stimmetakt').onchange = (ev) => { speicher.setzeEinst({ ansage: ev.target.checked ? 'stimme' : false }); stimmeVor(); };   // 016
  if ($('#ausschl')) $('#ausschl').onchange = (ev) => speicher.setzeTraining({ ...speicher.training(), ausschluss: ev.target.checked });
  $('#import').onchange = async (ev) => { const f = ev.target.files[0]; if (!f) return; try { const obj = JSON.parse(await f.text()); const w = await blatt('<h2>Wiederherstellen?</h2><p>Deine jetzigen Atem-Daten werden ersetzt.</p><div class="zwei"><button class="knopf" data-w="n">Abbrechen</button><button class="knopf haupt" data-w="j">Ersetzen</button></div>'); if (w === 'j') { speicher.import(obj); location.reload(); } } catch { blatt('<h2>Keine gültige Sicherung</h2><button class="knopf voll" data-w="ok">OK</button>'); } };
}
// ---------- Eigene Musik (0.1.5) – Seite, Messung und Code liegen in musik.js (erst hier geladen) ----------
async function zeigeMusik() {
  seite('Eigene Musik', '<p class="leise">Lädt …</p>', 'start', 3);
  const r = await Promise.all([import('./musik.js'), wissenModul()]).catch(keinNetz); if (!r) return;
  r[0].musikSeite({ W: r[1], $, esc, sym, abzeichen, quellenListe, KEIN_ERSATZ, speicher, ton });
}
async function exportiere() {
  const obj = speicher.export(VERSION), name = 'atem-sicherung-' + TRN.tag(new Date()) + '.json';
  const datei = new File([JSON.stringify(obj, null, 1)], name, { type: 'application/json' });
  try { if (navigator.canShare && navigator.canShare({ files: [datei] })) { await navigator.share({ files: [datei] }); return; } } catch {}
  const a = document.createElement('a'); a.href = URL.createObjectURL(datei); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
async function allesLoeschen() {
  const w1 = await blatt('<h2>Alles löschen?</h2><p>Einstellungen, Protokoll, Messwerte und Training werden von diesem Gerät gelöscht.</p><div class="zwei"><button class="knopf" data-w="n">Abbrechen</button><button class="knopf gefahr" data-w="j">Weiter</button></div>');
  if (w1 !== 'j') return;
  const w2 = await blatt('<h2>Wirklich alles löschen?</h2><div class="zwei"><button class="knopf" data-w="n">Abbrechen</button><button class="knopf gefahr" data-w="j">Endgültig löschen</button></div>');
  if (w2 !== 'j') return;
  try { await (await import('./erinnerung.js')).ausschalten(); } catch {}   // 020-ziele: geplante Erinnerungen beim Dienst streichen
  await speicher.allesLoeschen(); location.hash = '#start'; location.reload();
}

// ---------- Router ----------
const frei = () => $('#sitzung').hidden && !document.querySelector('.md-spieler');   // 016-nb B1: auch eine laufende Meditation nie durch Neuladen abbrechen
const ohneAutostart = () => { const [w, q] = location.hash.split('?'), p = new URLSearchParams(q || ''); if (p.get('s') !== '1') return; p.delete('s'); const r = p.toString(); history.replaceState(null, '', w + (r ? '?' + r : '')); };   // 021 M2: nach dem Neuladen kein stummer Autostart
function route() {
  if (neuLaden && frei()) { ohneAutostart(); return location.reload(); }
  { const b = $('#blatt'); if (!b.hidden) { b.hidden = true; b.innerHTML = ''; } }   // 021 K8: offenes Blatt schließt beim Seitenwechsel (nichts gewählt)
  tippSperre();   // neue Seite: ein zweiter Tipp an derselben Stelle trifft nicht gleich den Knopf darunter   // neue Fassung aktiv: sauber neu laden, nie alt+neu mischen
  if (vergleichStop) { vergleichStop(); vergleichStop = null; }
  if (vorschauStop) { vorschauStop(); vorschauStop = null; }
  const h = location.hash.slice(1) || 'start';
  const [weg, q] = h.split('?'); const [a, b] = weg.split('/');
  switch (a) {
    case 'lage': return zeigeLage(b);
    case 'uebungen': return zeigeUebungen();
    case 'uebung': case 'messen': return zeigeUebung(b, q);
    case 'training': return zeigeTraining();
    case 'singen': return zeigeSingen();
    case 'programm': return zeigeProgramm(b);
    case 'vergleich': return zeigeVergleich();
    case 'wissen': return zeigeWissen(b);
    case 'einstellungen': return zeigeEinstellungen();
    case 'musik': return zeigeMusik();
    case 'meditation': return zeigeMeditation(b);   // 016
    case 'sicherheit': erststart(); return zeigeStart();
    default: if (LAY.zeige(a, b, LCTX())) return; return zeigeStart();   // 020-layout: fortschritt, mehr, hinweise + 020-ziele: ziel/erinnerung/health über layout.js (ZIELE_MODUL)
  }
}
rahmen(); addEventListener('hashchange', route); route();
if (!speicher.sicherheit().erst) erststart();
if (!TEST || /[?&]sw=1/.test(location.search)) {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    // Versions-Prüfung: meldet der Service Worker eine andere Fassung, laden wir neu – sofort, oder nach der laufenden Übung (route)
    navigator.serviceWorker.addEventListener('message', (m) => { if (m.data && m.data.atem && m.data.atem !== VERSION) { neuLaden = true; if (frei()) location.reload(); } });
  }
}
document.addEventListener('click', (e) => {
  const echt = e.isTrusted && e.detail > 0, t = performance.now();   // nur echte Tipps (kein el.click(), keine Tastatur)
  if (echt && sperre && t - sperre.t < SPERR_MS && Math.hypot(e.clientX - sperre.x, e.clientY - sperre.y) < SPERR_PX) { e.preventDefault(); e.stopImmediatePropagation(); return; }
  if (echt) tipp = { t, x: e.clientX, y: e.clientY };
  ton.wecken();   // jeder Tipp holt gestörten Ton zurück (iOS)
}, true);
addEventListener('pageshow', (e) => { if (e.persisted && neuLaden && frei()) location.reload(); });
// Module für die Übung nach dem ersten Bild vorab holen (nicht auf ruhenden Seiten animieren)
(window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => { if (!TEST) { sitzungModul(); stimmeVor('nur_umstellen'); } });   // 016: frühere Ansage → Takt-Stimme (Sprite erst auf der Übungsseite, B4)
window.atem = { VERSION, test: TEST ? {
  plan: () => letzteSitzung && letzteSitzung.uhr && letzteSitzung.uhr.plan, zustand: () => letzteSitzung && letzteSitzung.uhr && letzteSitzung.uhr.plan ? letzteSitzung.uhr.zustand() : null,
  sitzung: () => letzteSitzung, tonProtokoll: async () => (await import('./ton.js')).ton.protokoll(), speicher: () => ({ einst: speicher.einst(), sicherheit: speicher.sicherheit(), protokoll: speicher.protokoll(), messwerte: speicher.messwerte(), training: speicher.training() }),
  heute: (d) => heuteTraining(d ? new Date(d) : new Date()), ziele: () => zieleModul() /* 020-ziele */, baue: (id, o) => baue(TECHNIKEN[id], o || {}), speicherObj: speicher
} : undefined };
