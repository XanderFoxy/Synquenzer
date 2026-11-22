// M5 training – „Jeden Tag ein kleiner Schritt“. Vertrag: ARCH.md §2–§4. Routen:
//   #training                          Heute: Vorschlag, Herausforderung, Schwerpunkt, Zeit, Serie, Pläne, alle Bereiche
//   #training/gruppe/<id>              Übungen eines Bereichs
//   #training/uebung/<id>[?von=…]      eine Übung: Schritte, Timer, Felder, Warum (mit Marke), Geschafft + „Wie war’s?“
//   #training/herausforderung/<i>      Herausforderung zur Wachstums-Richtung aus M4 (Ergebnis passt.wachstum)
//   #training/wachsen                  deine Richtung, Herausforderungen, passende Übungen
//   #training/plaene                   WOOP-Ziele, Wenn-dann-Pläne, Gewohnheiten (heute abhaken)
//   #training/woche[?w=-1]             Wochenrückblick (Montag bis Sonntag)
//   #training/erinnerung               Kalender-Datei (.ics) zum Selbst-Importieren – die App schickt nichts
// Liest Ergebnisse anderer Module NUR über kern.speicher (bigfive, interessen.rhythmus, passt.wachstum). Schreibt nur Modul-Daten
// (m.training) über kern.speicher – ohne Einwilligung bleibt alles im Arbeitsspeicher. Rechnen: plan.js (ohne DOM).
import { kern } from '../../kern.js';
import { GRUPPEN, GRUPPE, UEBUNGEN, UEBUNG, RICHTUNG_UEBUNGEN, SCHWERPUNKTE, ZEITEN } from './uebungen.js';
import * as P from './plan.js';

const ui = kern.ui, { esc, sym, marke } = ui;
const S = kern.speicher, M = 'training';
const ENTWURF = new Map();   // Eingaben in Übungs-Feldern bis „Geschafft“ (nur Arbeitsspeicher dieser Sitzung)
const GUT = [[2, 'hat gutgetan'], [1, 'ging so'], [0, 'eher nicht']];
const GUT_WORT = { 2: 'hat gutgetan', 1: 'ging so', 0: 'eher nicht' };
const U16 = 'Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm alles hier als Momentaufnahme.';

// ---------- Daten ----------
function daten() {
  const d = S.modulDaten(M), heute = P.tagText();
  const w = d.wechsel && d.wechsel.datum === heute ? d.wechsel : { datum: heute, n: 0, weg: [] };
  return {
    tage: d.tage && typeof d.tage === 'object' ? d.tage : {}, schwerpunkt: GRUPPE[d.schwerpunkt] ? d.schwerpunkt : 'gemischt',
    zeit: [0, 2, 5, 10].includes(Number(d.zeit)) ? Number(d.zeit) : 0, wechsel: { n: Number(w.n) || 0, weg: Array.isArray(w.weg) ? w.weg : [], datum: heute },
    plaene: Array.isArray(d.plaene) ? d.plaene.filter((p) => p && p.id && P.PLAN_ART[p.art]) : [],
    rueckblick: d.rueckblick && typeof d.rueckblick === 'object' ? d.rueckblick : {}, erinnerung: d.erinnerung || null
  };
}
function profil() {
  return P.profilAus({ bigfive: S.ergebnis('bigfive'), rhythmus: S.ergebnis('interessen.rhythmus'), wachstum: S.ergebnis('passt.wachstum'), alter: kern.einst().alter });
}
// Eintrag „geschafft“ für heute; gibt den Index im Tag zurück. Notizen nur, wenn etwas eingetragen wurde.
function erledigt(id, extra = {}) {
  const heute = P.tagText(), d = daten(), tage = P.kuerze(d.tage, heute);
  const liste = [...(tage[heute] || [])]; const e = { id, t: P.uhrzeit(), gut: null };
  if (extra.notiz && Object.keys(extra.notiz).length) e.notiz = extra.notiz;
  if (extra.text) e.text = String(extra.text).slice(0, 300);
  liste.push(e); tage[heute] = liste; S.schreib(M, 'tage', tage);
  kern.emit('training:erledigt', { id, datum: heute });
  return liste.length - 1;
}
function bewerte(id, gut) {
  const heute = P.tagText(), d = daten(), l = [...(d.tage[heute] || [])];
  for (let i = l.length - 1; i >= 0; i--) if (l[i].id === id) { l[i] = { ...l[i], gut }; break; }
  S.schreib(M, 'tage', { ...d.tage, [heute]: l });
}
function letzterEintrag(tage, id) { const l = tage[P.tagText()] || []; for (let i = l.length - 1; i >= 0; i--) if (l[i].id === id) return l[i]; return null; }
function nameVon(id, text) {
  if (UEBUNG[id]) return UEBUNG[id].titel;
  if (String(id).startsWith('hf-')) return 'Herausforderung' + (text ? ': ' + text : '');
  return 'Übung';
}

// ---------- Bausteine ----------
const merkHtml = () => S.einwilligung() ? '' :
  `<div class="hinweis gelb tr-merk"><p><b>Nur für jetzt:</b> Dein Fortschritt ist nicht gemerkt und beim Neuladen oder Schließen weg.</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
const stufeHtml = (s) => `<span class="tr-stufe tr-stufe-${esc(s)}">${esc(ui.STUFEN_NAME[s] || 'Idee')}</span>`;
const fussHtml = () => `<p class="klein leise tr-grenze">Übungen für den Alltag – keine Behandlung, keine Diagnose.</p>${ui.fuss()}`;
function zeileUebung(u, tage, von = '') {
  const n = P.heuteGemacht(tage, P.tagText(), u.id);
  return `<li><a class="zeile" href="#training/uebung/${esc(u.id)}${von ? '?von=' + esc(von) : ''}"><span><b>${esc(u.titel)}</b><small>${esc(GRUPPE[u.gruppe].titel)} · ${u.dauer} Min.</small></span>
    <span class="rechts">${stufeHtml(u.warum.stufe)}${n ? `${sym('haken')}<span class="sr">heute gemacht</span>` : ''}${sym('weiter')}</span></a></li>`;
}
function chips(name, liste, wert, labelId) {
  return `<div class="chips" role="radiogroup" aria-labelledby="${labelId}">${liste.map(([w, t], i) => {
    const an = String(w) === String(wert);
    return `<button type="button" class="chip" role="radio" aria-checked="${an}" tabindex="${an ? 0 : -1}" data-${name}="${esc(w)}" data-fokus="${name}-${esc(w)}">${esc(t)}</button>`;
  }).join('')}</div>`;
}
function punkteHtml(tage, label) {
  return `<div class="tr-punkte" role="img" aria-label="${esc(label)}">${tage.map((t) => `<span class="tr-punkt${t.anzahl || (t.eintraege && t.eintraege.length) ? ' an' : ''}${t.datum === P.tagText() ? ' heute' : ''}${t.zukunft ? ' spaeter' : ''}" aria-hidden="true"><i></i>${esc(t.wt)}</span>`).join('')}</div>`;
}
function bewertungHtml(e) {
  const gut = e ? e.gut : null;
  return `<p class="tr-frage" id="tr-gut-t">Wie war’s?</p>
    <div class="chips" role="radiogroup" aria-labelledby="tr-gut-t">${GUT.map(([w, t], i) => `<button type="button" class="chip" role="radio" aria-checked="${gut === w}" tabindex="${(gut == null ? i === 0 : gut === w) ? 0 : -1}" data-gut="${w}" data-fokus="gut-${w}">${esc(t)}</button>`).join('')}</div>
    <p class="klein leise">Dein Gefühl hilft der App, dir öfter vorzuschlagen, was dir guttut – und seltener, was nicht passt.</p>`;
}
// Abschnitt „Geschafft?“ (für Übungen und Herausforderungen gleich)
function fertigHtml(id, tage) {
  const n = P.heuteGemacht(tage, P.tagText(), id);
  return `<section class="tr-fertig karte" aria-labelledby="tr-f-t"><h3 id="tr-f-t">${n ? `${sym('haken')} Heute geschafft${n > 1 ? ` (${n}×)` : ''}` : 'Geschafft?'}</h3>
    ${n ? bewertungHtml(letzterEintrag(tage, id)) : '<p class="klein leise">Tipp auf „Geschafft“, wenn du die Übung gemacht hast. Ehrlich zählt mehr als oft.</p>'}
    <button type="button" class="knopf ${n ? 'zweit' : 'haupt gross'} voll" data-tr="geschafft" data-fokus="geschafft">${sym('haken')} ${n ? 'Noch einmal gemacht' : 'Geschafft'}</button>
    ${n ? '<a class="knopf zweit voll" href="#training">Zurück zu Heute</a>' : ''}</section>`;
}
// Radiogruppen: Pfeiltasten bewegen die Auswahl (ARIA-Muster)
function pfeile(e) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  const g = e.target.closest('[role=radiogroup]'); if (!g || !e.target.matches('[role=radio]')) return;
  const k = [...g.querySelectorAll('[role=radio]')], i = k.indexOf(e.target), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
  e.preventDefault(); const z = k[(i + d + k.length) % k.length]; const f = z.dataset.fokus; z.click();
  setTimeout(() => { const n = document.querySelector(`[data-fokus="${f}"]`); if (n) n.focus(); }, 0);
}
function fokusNach(el, key) { if (!key) return; const n = el.querySelector(`[data-fokus="${key}"]`); if (n) try { n.focus({ preventScroll: true }); } catch {} }
// gemeinsamer Rahmen: Neu malen bei Ergebnis/Einwilligung/Import/Löschen, Tageswechsel beim Zurückkommen, Pfeiltasten, Aufräumen
function rahmen(ctx, male, klick, extraAus = () => {}) {
  const { el } = ctx; let stand = P.tagText();
  const neu = () => { if (ctx.aktuell()) { stand = P.tagText(); male(); } };
  const sicht = () => { if (document.visibilityState === 'visible' && P.tagText() !== stand) neu(); };
  el.addEventListener('click', klick); el.addEventListener('keydown', pfeile); document.addEventListener('visibilitychange', sicht);
  const aus = ['ergebnis', 'einwilligung', 'importiert', 'geloescht', 'einst'].map((n) => kern.on(n, neu));
  return () => { el.removeEventListener('click', klick); el.removeEventListener('keydown', pfeile); document.removeEventListener('visibilitychange', sicht); aus.forEach((f) => f()); extraAus(); };
}

// ================= Heute =================
function heute(ctx) {
  const { el } = ctx; let fokus = null, letzter = null;
  const male = () => {
    const d = daten(), pr = profil(), datum = P.tagText();
    const v = P.vorschlag({ tage: d.tage, datum, schwerpunkt: d.schwerpunkt, zeit: d.zeit, wechsel: d.wechsel.n, weg: d.wechsel.weg, profil: pr });
    const u = v.haupt; letzter = u;
    const heuteListe = d.tage[datum] || [], se = P.serie(d.tage, datum), lt = P.letzteTage(d.tage, datum);
    const aktiv7 = lt.filter((t) => t.anzahl).length;
    const hf = pr.wachstum ? P.herausforderungHeute(pr.wachstum, d.tage, datum) : null;
    const hfE = hf ? letzterEintrag(d.tage, hf.id) : null;
    const plaene = d.plaene.filter((p) => !p.aus);
    const persoenlich = v.gruende.some((g) => g.stufe);
    el.innerHTML = `<h2>Training</h2>
      <p class="tr-motto">Jeden Tag ein kleiner Schritt</p>
      <p class="lead">Eine kleine Übung am Tag, 1 bis 10 Minuten. Du entscheidest, worauf du achtest.</p>
      ${heuteListe.length ? `<div class="karte gruen tr-geschafft"><p>${sym('haken')} <b>Heute geschafft:</b> ${esc([...new Set(heuteListe.map((e) => nameVon(e.id, e.text)))].join(', '))}. Mehr ist erlaubt, nicht nötig.</p></div>` : ''}
      ${u ? `<section class="karte akzent tr-heute" aria-labelledby="tr-h-t">
        <p class="tr-kopf"><span>${esc(P.datumLang(datum))}</span><span>${heuteListe.length ? 'Noch Lust?' : 'Vorschlag für heute'}</span></p>
        <h3 id="tr-h-t" class="tr-gross">${esc(u.titel)}</h3>
        <p class="tr-meta">${esc(GRUPPE[u.gruppe].titel)} · ${u.dauer} Min. ${marke(u.warum.stufe, u.warum.quellen)}</p>
        <p>${esc(u.kurz)}</p>
        <div class="tr-warum-dir"><p class="klein"><b>${persoenlich ? 'Warum für dich' : 'So ausgewählt'}:</b></p><ul class="tr-gruende">${v.gruende.map((g) => `<li>${esc(g.text)}${g.stufe ? ' ' + marke(g.stufe, g.quellen) : ''}</li>`).join('')}</ul></div>
        <a class="knopf haupt gross voll" href="#training/uebung/${esc(u.id)}" data-fokus="los">Los geht’s<span class="sr">: ${esc(u.titel)}</span></a>
        <button type="button" class="knopf zweit voll" data-tr="anders" data-fokus="anders">Anderer Vorschlag</button>
      </section>` : ''}
      ${hf ? `<section class="karte tr-hf" aria-labelledby="tr-hf-t">
        <p class="tr-kopf"><span>Deine Richtung</span><span>${esc(pr.wachstum.titel || '')}</span></p>
        <h3 id="tr-hf-t">Herausforderung für heute</h3>
        <p>${esc(hf.text)} ${marke('idee')}</p>
        <p class="klein leise">Wirklich machen zählt – nur vornehmen reicht nicht. ${marke('belegt', ['hudson2019'])}</p>
        ${hfE ? `<p class="tr-ok">${sym('haken')} Heute gemacht</p>${bewertungHtml(hfE).replace(/data-gut=/g, `data-hf="${esc(hf.id)}" data-gut=`)}`
          : `<button type="button" class="knopf haupt voll" data-tr="hf" data-id="${esc(hf.id)}" data-i="${hf.i}" data-fokus="hf">${sym('haken')} Gemacht</button>`}
        <a class="link" href="#training/wachsen">Alle Herausforderungen und passende Übungen</a>
      </section>` : ''}
      ${v.weitere.length ? `<h3>Oder lieber</h3><ul class="zeilen tr-zeilen">${v.weitere.map((x) => zeileUebung(x, d.tage)).join('')}</ul>` : ''}
      <h3>Vorschlag anpassen</h3>
      <p class="tr-frage" id="tr-sp-t">Worauf willst du achten?</p>${chips('sp', SCHWERPUNKTE, d.schwerpunkt, 'tr-sp-t')}
      <p class="tr-frage" id="tr-z-t">Wie viel Zeit hast du?</p>${chips('zeit', ZEITEN, d.zeit, 'tr-z-t')}
      <h3>Dein Fortschritt</h3>
      <div class="karte tr-fort">
        <p class="tr-serie"><b class="tr-zahl">${se.tage}</b> <span>${se.tage === 1 ? 'Tag' : 'Tage'} in Folge${se.offen ? ' – heute noch offen' : se.tage ? '' : ' – heute ist ein guter Tag zum Anfangen'}</span></p>
        ${punkteHtml(lt, `Letzte 7 Tage: an ${aktiv7} von 7 Tagen geübt`)}
        <p class="klein leise">Ein Tag Pause ist kein Rückschritt. ${marke('belegt', ['lally2010'])}</p>
        <a class="knopf zweit voll" href="#training/woche">Wochenrückblick: Was hat gutgetan?</a>
      </div>
      ${plaene.length ? `<h3>Deine Pläne heute</h3><ul class="zeilen tr-zeilen tr-plaene">${plaene.slice(0, 5).map((p) => planZeile(p, datum)).join('')}</ul>
        <p><a class="link" href="#training/plaene">Alle Pläne${plaene.length > 5 ? ` (${plaene.length})` : ''}</a></p>` : ''}
      <h3>Alle Übungen</h3>
      <ul class="zeilen tr-zeilen">${GRUPPEN.map((g) => `<li><a class="zeile" href="#training/gruppe/${g.id}"><span><b>${esc(g.titel)}</b><small>${esc(g.kurz)}</small></span><span class="rechts">${UEBUNGEN.filter((x) => x.gruppe === g.id).length}${sym('weiter')}</span></a></li>`).join('')}</ul>
      <p class="klein leise">${UEBUNGEN.length} Übungen, je 1 bis 10 Minuten. Jede mit Herkunft: belegt, abgeleitet oder Idee – tipp auf die Marke.</p>
      <h3>Mehr</h3>
      <ul class="zeilen tr-zeilen">
        <li><a class="zeile" href="#training/plaene"><span><b>Deine Pläne</b><small>WOOP-Ziele, Wenn-dann-Pläne, Gewohnheiten</small></span><span class="rechts">${plaene.length || ''}${sym('weiter')}</span></a></li>
        <li><a class="zeile" href="#training/wachsen"><span><b>Persönlichkeit wachsen</b><small>${pr.wachstum ? 'Deine Richtung: ' + esc(pr.wachstum.titel || '') : 'Noch keine Richtung gewählt'}</small></span><span class="rechts">${sym('weiter')}</span></a></li>
        <li><a class="zeile" href="#training/erinnerung"><span><b>Erinnerung im Kalender</b><small>Datei zum Selbst-Importieren – die App schickt nichts</small></span><span class="rechts">${sym('weiter')}</span></a></li>
        <li><a class="zeile" href="../atem/"><span><b>Atem-App</b><small>Geführte Atemübungen (eigene App)</small></span><span class="rechts">${sym('weiter')}</span></a></li>
      </ul>
      ${!pr.bigfive && !pr.rhythmus ? `<div class="hinweis"><p>Tipp: Mit deinem Profil passen die Vorschläge besser zu dir. Das Training liest dafür nur deine Ergebnisse auf diesem Gerät.</p>
        <p><a class="link" href="#fragen/bigfive">Persönlichkeit (ca. 3 Min.)</a><br><a class="link" href="#fragen/interessen/rhythmus">Tagesrhythmus (ca. 1 Min.)</a></p></div>` : ''}
      ${merkHtml()}${fussHtml()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = (e) => {
    const t = e.target.closest('[data-tr],[data-sp],[data-zeit],[data-gut]'); if (!t || !el.contains(t)) return;
    const d = daten();
    if (t.dataset.sp !== undefined) { S.schreib(M, 'schwerpunkt', t.dataset.sp); fokus = 'sp-' + t.dataset.sp; male(); if (letzter) ui.meldung('Neuer Vorschlag: ' + letzter.titel); return; }
    if (t.dataset.zeit !== undefined) { S.schreib(M, 'zeit', Number(t.dataset.zeit)); fokus = 'zeit-' + t.dataset.zeit; male(); if (letzter) ui.meldung('Neuer Vorschlag: ' + letzter.titel); return; }
    if (t.dataset.gut !== undefined && t.dataset.hf) { bewerte(t.dataset.hf, Number(t.dataset.gut)); fokus = 'gut-' + t.dataset.gut; male(); return; }
    const was = t.dataset.tr;
    if (was === 'anders' && letzter) {
      S.schreib(M, 'wechsel', { datum: P.tagText(), n: d.wechsel.n + 1, weg: [...d.wechsel.weg, letzter.id].slice(-40) });
      fokus = 'anders'; male(); ui.meldung('Neuer Vorschlag: ' + letzter.titel);
    } else if (was === 'hf') {
      const pr = profil(), h = P.herausforderungen(pr.wachstum).find((x) => x.id === t.dataset.id);
      if (h) { erledigt(h.id, { text: h.text }); fokus = 'gut-2'; male(); ui.meldung('Gemacht – stark. Wie war’s?'); }
    } else if (was === 'haken') { hakenUm(t.dataset.id); fokus = 'h-' + t.dataset.id; male(); }
  };
  return rahmen(ctx, male, klick);
}
function planZeile(p, datum) {
  const an = (p.haken || []).includes(datum);
  return `<li class="tr-planzeile"><span class="tr-plantext"><small>${esc(P.PLAN_ART[p.art])} · diese Woche ${P.hakenWoche(p, datum)} von 7</small>${esc(P.planText(p))}</span>
    <button type="button" class="knopf klein ${an ? 'haupt' : 'zweit'}" aria-pressed="${an}" data-tr="haken" data-id="${esc(p.id)}" data-fokus="h-${esc(p.id)}">${an ? sym('haken') : ''}Heute gemacht</button></li>`;
}
function hakenUm(id) {
  const d = daten(), datum = P.tagText();
  const neu = d.plaene.map((p) => (p.id === id ? P.hakenUmschalten(p, datum) : p));
  S.schreib(M, 'plaene', neu);
  const p = neu.find((x) => x.id === id); if (p) ui.meldung((p.haken || []).includes(datum) ? 'Abgehakt.' : 'Haken entfernt.');
}

// ================= Bereich =================
function gruppe(ctx, gid) {
  const { el } = ctx, g = GRUPPE[gid]; ctx.zurueckZu('training');
  const male = () => {
    const d = daten(), pr = profil(), G = P.profilGruende(pr);
    const liste = UEBUNGEN.filter((u) => u.gruppe === gid);
    const fuerDich = liste.filter((u) => (G[u.id] || []).some((x) => x.art !== 'wachstum' || gid === 'wachsen'));
    el.innerHTML = `<h2>${esc(g.titel)}</h2><p class="lead">${esc(g.kurz)}</p>
      ${ui.aussage(g.intro)}${g.extra ? ui.aussage(g.extra) : ''}
      ${g.hinweis ? `<div class="hinweis"><p class="klein">${esc(g.hinweis)}</p></div>` : ''}
      ${gid === 'wachsen' ? `<a class="karte tr-link-karte" href="#training/wachsen">${sym('passt')}<span><b>${pr.wachstum ? 'Deine Richtung: ' + esc(pr.wachstum.titel || '') : 'Richtung wählen'}</b><br><span class="klein leise">${pr.wachstum ? 'Herausforderungen und passende Übungen' : 'Unter „Was passt zu mir“ wählst du, was du üben willst'}</span></span><span class="rechts">${sym('weiter')}</span></a>` : ''}
      ${fuerDich.length ? `<p class="klein leise">Passt laut deinem Profil besonders: ${esc(fuerDich.map((u) => u.titel).join(', '))}.</p>` : ''}
      <ul class="zeilen tr-zeilen">${liste.map((u) => zeileUebung(u, d.tage, 'gruppe')).join('')}</ul>
      ${merkHtml()}${fussHtml()}`;
  };
  male();
  return rahmen(ctx, male, () => {});
}

// ================= Übung =================
function uebung(ctx, id) {
  const { el } = ctx, u = UEBUNG[id], g = GRUPPE[u.gruppe], w = u.werkzeug || {};
  const von = ctx.param.von; ctx.zurueckZu(von === 'gruppe' ? 'training/gruppe/' + u.gruppe : von === 'wachsen' ? 'training/wachsen' : von === 'plaene' ? 'training/plaene' : 'training');
  let fokus = null;
  const T = { gesamt: (w.timer || 0) * 60000, rest: (w.timer || 0) * 60000, ende: 0, laeuft: false, fertig: false, iv: 0, lock: null, ansage: -1 };
  const entw = () => { if (!ENTWURF.has(id)) ENTWURF.set(id, {}); return ENTWURF.get(id); };
  const felderHtml = () => {
    const e = entw();
    return `<h3>Zum Ausfüllen <span class="leise klein">(freiwillig)</span></h3><div class="tr-felder">${w.felder.map((f) => `<label class="ueber" for="tr-f-${f.k}">${esc(f.label)}</label>${f.lang
      ? `<textarea class="feld" id="tr-f-${f.k}" data-feld="${f.k}" rows="3" placeholder="${esc(f.platz || '')}">${esc(e[f.k] || '')}</textarea>`
      : `<input class="feld" id="tr-f-${f.k}" data-feld="${f.k}" type="text" autocomplete="off" enterkeyhint="next" placeholder="${esc(f.platz || '')}" value="${esc(e[f.k] || '')}">`}`).join('')}</div>
      ${w.vorlage ? `<p class="klein leise">Dein Satz:</p><p class="tr-satz">${esc(P.fuelle(w.vorlage, e))}</p><button type="button" class="knopf zweit klein" data-tr="kopieren">${sym('kopieren')} Satz kopieren</button>` : ''}
      ${w.plan ? `<button type="button" class="knopf haupt voll" data-tr="plan" data-fokus="plan">${sym('sichern')} Als Plan speichern</button><p class="klein leise">Pläne findest du unter „Deine Pläne“. Dort hakst du sie jeden Tag ab.</p>` : ''}
      <p class="klein leise">Was du hier schreibst, wird mit „Geschafft“ gemerkt – nur auf diesem Gerät.${S.einwilligung() ? '' : ' Ohne „Merken“ ist es beim Neuladen oder Schließen weg.'}</p>`;
  };
  const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const timerHtml = () => `<div class="karte weich tr-timer"><p class="tr-uhr" aria-hidden="true" data-uhr>${mmss(T.rest)}</p>${ui.fortschritt(1 - T.rest / T.gesamt, 'Verstrichene Zeit')}
    <p class="sr" aria-live="polite" data-ansage>${T.fertig ? 'Zeit ist um.' : ''}</p>
    <div class="reihe">${T.laeuft ? `<button type="button" class="knopf zweit" data-tr="t-pause" data-fokus="t-pause">Pause</button><button type="button" class="knopf zweit" data-tr="t-stopp" data-fokus="t-stopp">Stopp</button>`
      : T.fertig ? `<p class="tr-ok">${sym('haken')} Zeit ist um.</p><button type="button" class="knopf zweit" data-tr="t-stopp" data-fokus="t-stopp">Neu starten</button>`
      : T.rest < T.gesamt ? `<button type="button" class="knopf haupt" data-tr="t-start" data-fokus="t-start">Weiter</button><button type="button" class="knopf zweit" data-tr="t-stopp" data-fokus="t-stopp">Stopp</button>`
      : `<button type="button" class="knopf haupt" data-tr="t-start" data-fokus="t-start">Timer starten (${w.timer} Min.)</button>`}</div></div>`;
  const male = () => {
    const d = daten(), pr = profil(), G = P.profilGruende(pr)[id] || [];
    el.innerHTML = `<p class="tr-kopf"><span>${esc(g.titel)}</span><span>${u.dauer} Min.</span></p>
      <h2>${esc(u.titel)}</h2><p class="lead">${esc(u.kurz)}</p>
      ${G.length ? `<div class="hinweis tr-fuerdich"><p class="klein"><b>Für dich:</b></p>${G.slice(0, 2).map((x) => `<p class="klein">${esc(x.text)} ${marke(x.stufe, x.quellen)}</p>`).join('')}</div>` : ''}
      <h3>So geht’s</h3><ol class="tr-schritte">${u.schritte.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      ${w.timer ? `<div data-timer-platz>${timerHtml()}</div>` : ''}
      ${w.felder ? felderHtml() : ''}
      ${w.link ? `<a class="knopf zweit voll" href="${esc(w.link.href)}">${esc(w.link.text)}</a>${w.link.hinweis ? `<p class="klein leise">${esc(w.link.hinweis)}</p>` : ''}` : ''}
      <h3>Warum das hilft</h3>${ui.aussage(u.warum)}
      ${u.gut ? `<div class="hinweis"><p><b>Gut zu wissen:</b> ${esc(u.gut.text)} ${marke(u.gut.stufe, u.gut.quellen)}</p></div>` : ''}
      ${g.hinweis ? `<p class="klein leise">${esc(g.hinweis)}</p>` : ''}
      ${fertigHtml(id, d.tage)}
      ${merkHtml()}${fussHtml()}`;
    fokusNach(el, fokus); fokus = null;
  };
  // ---------- Timer (Endzeit statt Zählen: stimmt auch, wenn Safari im Hintergrund drosselt) ----------
  const timerMalen = (f = null) => { const p = el.querySelector('[data-timer-platz]'); if (!p) return; p.innerHTML = timerHtml(); if (f) fokusNach(el, f); };
  const tick = () => {
    if (!T.laeuft) return;
    T.rest = Math.max(0, T.ende - Date.now());
    const uhr = el.querySelector('[data-uhr]'); if (uhr) uhr.textContent = mmss(T.rest);
    const bar = el.querySelector('.tr-timer .fortschritt'); if (bar) { const p = Math.round((1 - T.rest / T.gesamt) * 100); bar.setAttribute('aria-valuenow', p); bar.firstElementChild.style.width = p + '%'; }
    const min = Math.ceil(T.rest / 60000);
    if (min !== T.ansage && T.rest > 0) { T.ansage = min; const a = el.querySelector('[data-ansage]'); if (a) a.textContent = `Noch ${min} ${min === 1 ? 'Minute' : 'Minuten'}.`; }
    if (T.rest <= 0) {
      T.laeuft = false; T.fertig = true; clearInterval(T.iv); sperreFrei();
      timerMalen(); try { navigator.vibrate && navigator.vibrate(200); } catch {}
      ui.meldung('Zeit ist um. Tipp auf „Geschafft“, wenn du fertig bist.', 4000);
      fokusNach(el, 'geschafft');
    }
  };
  const sperre = async () => { try { if (navigator.wakeLock && document.visibilityState === 'visible') T.lock = await navigator.wakeLock.request('screen'); } catch { T.lock = null; } };
  const sperreFrei = () => { try { T.lock && T.lock.release(); } catch {} T.lock = null; };
  const start = () => { T.fertig = false; T.ende = Date.now() + T.rest; T.laeuft = true; T.ansage = -1; clearInterval(T.iv); T.iv = setInterval(tick, 250); sperre(); timerMalen('t-pause'); tick(); };
  const pause = () => { T.rest = Math.max(0, T.ende - Date.now()); T.laeuft = false; clearInterval(T.iv); sperreFrei(); timerMalen('t-start'); };
  const stopp = () => { T.laeuft = false; T.fertig = false; T.rest = T.gesamt; clearInterval(T.iv); sperreFrei(); timerMalen('t-start'); };
  const sicht = () => { if (document.visibilityState === 'visible' && T.laeuft) { tick(); if (!T.lock) sperre(); } };
  document.addEventListener('visibilitychange', sicht);

  male();
  const werte = () => { const r = {}; el.querySelectorAll('[data-feld]').forEach((f) => { const v = f.value.trim(); if (v) r[f.dataset.feld] = v.slice(0, 1000); }); return r; };
  const eingabe = (e) => {
    const f = e.target.closest('[data-feld]'); if (!f) return;
    entw()[f.dataset.feld] = f.value;
    const satz = el.querySelector('.tr-satz'); if (satz && w.vorlage) satz.textContent = P.fuelle(w.vorlage, entw());
  };
  el.addEventListener('input', eingabe);
  const klick = async (e) => {
    const t = e.target.closest('[data-tr],[data-gut]'); if (!t || !el.contains(t)) return;
    if (t.dataset.gut !== undefined) { bewerte(id, Number(t.dataset.gut)); fokus = 'gut-' + t.dataset.gut; male(); ui.meldung('Danke – gemerkt: ' + GUT_WORT[t.dataset.gut] + '.'); return; }
    const was = t.dataset.tr;
    if (was === 't-start') start();
    else if (was === 't-pause') pause();
    else if (was === 't-stopp') stopp();
    else if (was === 'kopieren') { const ok = await ui.kopieren(P.fuelle(w.vorlage, werte())); ui.meldung(ok ? 'Kopiert.' : 'Kopieren ging nicht – markier den Satz und kopier ihn selbst.'); }
    else if (was === 'plan') {
      const v = werte(), fehlt = (w.pflicht || []).filter((k) => !v[k]);
      if (fehlt.length) { const f = w.felder.filter((x) => fehlt.includes(x.k)); ui.meldung('Bitte noch ausfüllen: ' + f.map((x) => x.label.replace(/\s*…$/, '')).join(', ') + '.', 3500); fokusNach(el, null); const n = el.querySelector(`#tr-f-${fehlt[0]}`); if (n) n.focus(); return; }
      const d = daten(); S.schreib(M, 'plaene', [P.neuerPlan(w.plan, v), ...d.plaene].slice(0, 40));
      if (!P.heuteGemacht(d.tage, P.tagText(), id)) erledigt(id, { notiz: v });
      ENTWURF.delete(id); fokus = 'gut-2'; if (T.laeuft) stopp(); male(); ui.meldung('Plan gespeichert. Du findest ihn unter „Deine Pläne“.', 3500);
    } else if (was === 'geschafft') {
      erledigt(id, { notiz: werte() }); ENTWURF.delete(id);
      if (T.laeuft || T.fertig) { T.laeuft = false; T.fertig = false; T.rest = T.gesamt; clearInterval(T.iv); sperreFrei(); }
      fokus = 'gut-2'; male(); ui.meldung('Geschafft. Wie war’s?');
    }
  };
  return rahmen(ctx, male, klick, () => { clearInterval(T.iv); sperreFrei(); document.removeEventListener('visibilitychange', sicht); el.removeEventListener('input', eingabe); });
}

// ================= Herausforderung (aus M4) =================
function herausforderung(ctx, i) {
  const { el } = ctx; ctx.zurueckZu(ctx.param.von === 'heute' ? 'training' : 'training/wachsen');
  let fokus = null;
  const male = () => {
    const d = daten(), pr = profil(), h = P.herausforderungen(pr.wachstum).find((x) => x.i === i);
    if (!h) { el.innerHTML = `<h2>Herausforderung</h2><div class="karte weich"><p>Diese Herausforderung gibt es nicht mehr – vielleicht hast du eine andere Richtung gewählt.</p><a class="knopf haupt voll" href="#training/wachsen">Zu deinen Herausforderungen</a></div>${fussHtml()}`; return; }
    const B = P.bewertungen(d.tage)[h.id];
    el.innerHTML = `<p class="tr-kopf"><span>Deine Richtung</span><span>${esc(pr.wachstum.titel || '')}</span></p>
      <h2>Herausforderung</h2><p class="lead">${esc(h.text)} ${marke('idee')}</p>
      ${B ? `<p class="klein leise">Bisher ${B.n}-mal gemacht.</p>` : ''}
      ${ui.aussage({ text: 'Wirklich machen zählt: Wer Herausforderungen annahm, aber nicht machte, veränderte sich eher in die Gegenrichtung. Lieber klein anfangen.', stufe: 'belegt', quellen: ['hudson2019'] })}
      ${pr.alter === 'u16' ? `<p class="hinweis">${esc(U16)}</p>` : ''}
      ${fertigHtml(h.id, d.tage)}
      <p><a class="link" href="#passt/wachstum/${esc(pr.wachstum.id)}">Mehr zu deiner Richtung</a></p>
      ${merkHtml()}${fussHtml()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = (e) => {
    const t = e.target.closest('[data-tr],[data-gut]'); if (!t || !el.contains(t)) return;
    const h = P.herausforderungen(profil().wachstum).find((x) => x.i === i); if (!h) return;
    if (t.dataset.gut !== undefined) { bewerte(h.id, Number(t.dataset.gut)); fokus = 'gut-' + t.dataset.gut; male(); return; }
    if (t.dataset.tr === 'geschafft') { erledigt(h.id, { text: h.text }); fokus = 'gut-2'; male(); ui.meldung('Gemacht – stark. Wie war’s?'); }
  };
  return rahmen(ctx, male, klick);
}

// ================= Wachsen =================
function wachsen(ctx) {
  const { el } = ctx; ctx.zurueckZu('training');
  const male = () => {
    const d = daten(), pr = profil(), w = pr.wachstum, g = GRUPPE.wachsen, B = P.bewertungen(d.tage), datum = P.tagText();
    const H = P.herausforderungen(w);
    const passend = w ? (RICHTUNG_UEBUNGEN[w.id] || []).map((x) => UEBUNG[x]).filter(Boolean) : [];
    el.innerHTML = `<h2>Persönlichkeit wachsen</h2>
      ${pr.alter === 'u16' ? `<p class="hinweis">${esc(U16)}</p>` : ''}
      ${ui.aussage(g.intro)}${ui.aussage(g.extra)}
      ${w ? `<section class="karte akzent" aria-labelledby="tr-w-t"><p class="tr-kopf"><span>Deine Richtung</span><span>${esc(ui.datum(w.gewaehlt || w.zeit))}</span></p>
          <h3 id="tr-w-t">${esc(w.titel || w.id)}</h3>${w.warum ? `<p class="klein leise">Warum: ${esc(w.warum)}</p>` : ''}
          ${H.length ? `<h4>Kleine Herausforderungen</h4><ul class="zeilen tr-zeilen">${H.map((h) => { const b = B[h.id], heute = P.heuteGemacht(d.tage, datum, h.id);
            return `<li><a class="zeile" href="#training/herausforderung/${h.i}"><span><b>${esc(h.text)}</b><small>${b ? `${b.n}-mal gemacht` : 'noch nicht gemacht'}</small></span><span class="rechts">${stufeHtml('idee')}${heute ? `${sym('haken')}<span class="sr">heute gemacht</span>` : ''}${sym('weiter')}</span></a></li>`; }).join('')}</ul>
          <p class="klein">Eine am Tag oder in der Woche reicht. Wichtig ist, sie wirklich zu machen. ${marke('belegt', ['hudson2019'])}</p>` : '<p class="leise">Zu dieser Richtung sind keine Herausforderungen gespeichert. Wähl sie unter „Was passt zu mir“ noch einmal.</p>'}
          <a class="knopf zweit voll" href="#passt/wachstum/${esc(w.id)}">Richtung ansehen oder ändern</a></section>
        ${passend.length ? `<h3>Passende Übungen</h3><ul class="zeilen tr-zeilen">${passend.map((u) => zeileUebung(u, d.tage, 'wachsen')).join('')}</ul>` : ''}`
      : `<div class="karte weich"><p><b>Noch keine Richtung gewählt.</b> Unter „Was passt zu mir → Wachsen“ wählst du selbst, was du üben möchtest. Dann findest du hier kleine Herausforderungen dazu.</p>
          <a class="knopf haupt voll" href="#passt/wachstum">Richtung wählen</a></div>`}
      <h3>Übungen zum Wachsen</h3><ul class="zeilen tr-zeilen">${UEBUNGEN.filter((u) => u.gruppe === 'wachsen').map((u) => zeileUebung(u, d.tage, 'wachsen')).join('')}</ul>
      ${merkHtml()}${fussHtml()}`;
  };
  male();
  return rahmen(ctx, male, () => {});
}

// ================= Pläne =================
function plaene(ctx) {
  const { el } = ctx; ctx.zurueckZu('training');
  let fokus = null;
  const male = () => {
    const d = daten(), datum = P.tagText(), alle = d.plaene.filter((p) => !p.aus);
    const teil = (art, titel, neu, neuText) => {
      const l = alle.filter((p) => p.art === art);
      return `<h3>${esc(titel)}</h3>${l.length ? `<ul class="tr-planliste">${l.map((p) => { const an = (p.haken || []).includes(datum);
        return `<li class="karte tr-plan"><p>${esc(P.planText(p))}</p><p class="klein leise">Seit ${esc(ui.datum(p.erstellt))} · diese Woche ${P.hakenWoche(p, datum)} von 7 Tagen</p>
          <div class="reihe"><button type="button" class="knopf ${an ? 'haupt' : 'zweit'}" aria-pressed="${an}" data-tr="haken" data-id="${esc(p.id)}" data-fokus="h-${esc(p.id)}">${an ? sym('haken') : ''}Heute gemacht</button>
          <button type="button" class="knopf zweit" data-tr="weg" data-id="${esc(p.id)}" aria-label="Plan löschen: ${esc(P.planText(p).slice(0, 60))}">${sym('loeschen')} Löschen</button></div></li>`; }).join('')}</ul>` : '<p class="leise klein">Noch keiner.</p>'}
        <a class="knopf zweit voll" href="#training/uebung/${neu}?von=plaene">${esc(neuText)}</a>`;
    };
    el.innerHTML = `<h2>Deine Pläne</h2><p class="lead">Ziele mit WOOP, Wenn-dann-Pläne und Gewohnheiten. Hak ab, was du heute gemacht hast.</p>
      ${ui.aussage({ text: 'Fortschritt aufzuschreiben hilft im Mittel, Ziele zu erreichen.', stufe: 'belegt', quellen: ['harkin2016'] })}
      ${teil('gewohnheit', 'Gewohnheiten', 'g-anker', 'Neue Gewohnheit')}
      ${teil('wenndann', 'Wenn-dann-Pläne', 'z-wenndann', 'Neuer Wenn-dann-Plan')}
      ${teil('woop', 'WOOP-Ziele', 'z-woop', 'Neues WOOP-Ziel')}
      ${merkHtml()}${fussHtml()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = async (e) => {
    const t = e.target.closest('[data-tr]'); if (!t || !el.contains(t)) return;
    if (t.dataset.tr === 'haken') { hakenUm(t.dataset.id); fokus = 'h-' + t.dataset.id; male(); }
    else if (t.dataset.tr === 'weg') {
      if (await ui.bestaetige({ titel: 'Plan löschen?', text: 'Der Plan und seine Haken werden gelöscht.', ja: 'Löschen', gefahr: true })) {
        S.schreib(M, 'plaene', daten().plaene.filter((p) => p.id !== t.dataset.id)); male(); ui.meldung('Plan gelöscht.');
      }
    }
  };
  return rahmen(ctx, male, klick);
}

// ================= Wochenrückblick =================
function woche(ctx) {
  const { el } = ctx; ctx.zurueckZu('training');
  const vers = Math.max(-104, Math.min(0, Math.round(Number(ctx.param.w) || 0)));
  let fokus = null;
  const male = () => {
    const d = daten(), datum = P.tagText(), W = P.woche(d.tage, datum, vers, d.plaene), rb = d.rueckblick[W.schluessel];
    const zeile = (x, zusatz) => `<li>${esc(nameVon(x.id, x.text))} <span class="leise klein">${esc(zusatz)}</span></li>`;
    const gruppen = Object.entries(W.gruppen).sort((a, b) => b[1] - a[1]);
    el.innerHTML = `<h2>Wochenrückblick</h2><p class="lead">${W.aktuell ? 'Diese Woche' : 'Woche'}: ${esc(P.datumKurz(W.von))} bis ${esc(P.datumKurz(W.bis))}</p>
      <div class="reihe tr-wnav"><a class="knopf zweit klein" href="#training/woche?w=${vers - 1}">${sym('zurueck')} Woche davor</a>${vers < 0 ? `<a class="knopf zweit klein" href="#training/woche${vers + 1 === 0 ? '' : '?w=' + (vers + 1)}">Woche danach ${sym('weiter')}</a>` : ''}</div>
      <div class="karte"><p class="tr-serie"><b class="tr-zahl">${W.aktiveTage}</b> <span>von 7 Tagen geübt · ${W.anzahl} ${W.anzahl === 1 ? 'Übung' : 'Übungen'}</span></p>
        ${punkteHtml(W.tage, `Montag bis Sonntag: an ${W.aktiveTage} von 7 Tagen geübt`)}
        <p class="klein leise">Woche davor: an ${W.vorherAktiv} ${W.vorherAktiv === 1 ? 'Tag' : 'Tagen'}.</p></div>
      <h3>Was hat gutgetan?</h3>
      ${W.gutgetan.length ? `<ul class="tr-liste tr-gut">${W.gutgetan.map((x) => zeile(x, `${x.gut[2]}-mal „hat gutgetan“`)).join('')}</ul><p class="klein leise">Das schlägt dir die App öfter vor.</p>`
        : `<p class="leise">${W.anzahl ? 'Noch nichts als „hat gutgetan“ markiert. Tipp: Sag nach jeder Übung kurz, wie es war.' : 'In dieser Woche noch keine Übung.'}</p>`}
      ${W.gehtSo.length ? `<h3>Ging so</h3><ul class="tr-liste">${W.gehtSo.map((x) => zeile(x, `${x.n}-mal`)).join('')}</ul>` : ''}
      ${W.eherNicht.length ? `<h3>Eher nicht</h3><ul class="tr-liste">${W.eherNicht.map((x) => zeile(x, `${x.gut[0]}-mal`)).join('')}</ul><p class="klein leise">Lass sie ruhig weg oder probier eine andere Form. Die App schlägt sie seltener vor.</p>` : ''}
      ${gruppen.length ? `<h3>Bereiche</h3><ul class="tr-liste">${gruppen.map(([gid, n]) => `<li>${esc(GRUPPE[gid] ? GRUPPE[gid].titel : gid)} <span class="leise klein">${n}-mal</span></li>`).join('')}</ul>` : ''}
      ${W.plaene.length ? `<h3>Pläne</h3><ul class="tr-liste">${W.plaene.map((p) => `<li>${esc(p.text)} <span class="leise klein">${p.haken} von 7 Tagen</span></li>`).join('')}</ul>` : ''}
      ${W.anzahl ? `<details class="karte"><summary>Alle Einträge der Woche</summary>${W.tage.filter((t) => t.eintraege.length).map((t) => `<h4>${esc(P.datumLang(t.datum))}</h4><ul class="tr-liste">${t.eintraege.map((e) => `<li>${esc(e.t || '')} ${esc(nameVon(e.id, e.text))}${e.gut != null ? ` <span class="leise klein">– ${esc(GUT_WORT[e.gut])}</span>` : ''}${e.notiz ? `<br><span class="klein leise">${esc(Object.values(e.notiz).join(' · '))}</span>` : ''}</li>`).join('')}</ul>`).join('')}</details>` : ''}
      <h3 id="tr-rb-t">Was nimmst du mit?</h3>
      <textarea id="tr-rb" class="feld" rows="4" aria-labelledby="tr-rb-t" placeholder="z. B. Morgens raus tut mir gut. Nächste Woche: zweimal Danke schreiben.">${esc(rb ? rb.text : '')}</textarea>
      <button type="button" class="knopf haupt voll" data-tr="rb" data-fokus="rb">Notiz speichern</button>
      ${rb ? `<p class="klein leise">Gespeichert am ${esc(ui.datum(rb.zeit))}.</p>` : ''}
      <p class="klein leise">Das ist dein eigenes Gefühl, kein Messwert. Muster zeigen sich oft erst nach ein paar Wochen. ${marke('idee')}</p>
      ${merkHtml()}${fussHtml()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = (e) => {
    const t = e.target.closest('[data-tr=rb]'); if (!t || !el.contains(t)) return;
    const d = daten(), W = P.woche(d.tage, P.tagText(), vers, d.plaene), text = (el.querySelector('#tr-rb').value || '').trim().slice(0, 2000);
    const rb = { ...d.rueckblick }; if (text) rb[W.schluessel] = { text, zeit: new Date().toISOString() }; else delete rb[W.schluessel];
    S.schreib(M, 'rueckblick', rb); fokus = 'rb'; male(); ui.meldung(text ? 'Notiz gespeichert.' : 'Notiz gelöscht.');
  };
  return rahmen(ctx, male, klick);
}

// ================= Erinnerung (.ics) =================
function erinnerung(ctx) {
  const { el } = ctx; ctx.zurueckZu('training');
  const d0 = daten().erinnerung || {};
  const st = { zeit: /^\d{2}:\d{2}$/.test(d0.zeit || '') ? d0.zeit : '19:00', tage: Array.isArray(d0.tage) && d0.tage.length ? d0.tage : [...P.WT_ICS], woche: d0.woche !== false };
  let fokus = null;
  const male = () => {
    el.innerHTML = `<h2>Erinnerung im Kalender</h2>
      <p class="lead">Die App schickt keine Mitteilungen und hat keinen Server. Du bekommst eine Kalender-Datei und importierst sie selbst – dein Kalender erinnert dich dann.</p>
      <label class="ueber" for="tr-uhr">Uhrzeit</label><input id="tr-uhr" class="feld tr-uhrfeld" type="time" value="${esc(st.zeit)}">
      <p class="tr-frage" id="tr-tage-t">An welchen Tagen?</p>
      <div class="chips" role="group" aria-labelledby="tr-tage-t">${P.WT_ICS.map((t, i) => `<button type="button" class="chip" aria-pressed="${st.tage.includes(t)}" data-tag="${t}" data-fokus="tag-${t}" aria-label="${P.WT_LANG[i]}">${P.WT_KURZ[i]}</button>`).join('')}</div>
      <p class="tr-frage" id="tr-wo-t">Dazu</p>
      <div class="chips" role="group" aria-labelledby="tr-wo-t"><button type="button" class="chip" aria-pressed="${st.woche}" data-tr="woche-an" data-fokus="woche-an">Sonntags 18 Uhr: Wochenrückblick</button></div>
      <button type="button" class="knopf haupt gross voll" data-tr="ics" data-fokus="ics">${sym('sichern')} Kalender-Datei sichern</button>
      <details class="karte"><summary>So importierst du die Datei</summary>
        <ol class="tr-schritte"><li><b>iPhone:</b> Im Teilen-Blatt „In Dateien sichern“ wählen. Dann in der App „Dateien“ die Datei antippen und die Termine zum Kalender hinzufügen.</li>
        <li><b>Android:</b> Die geladene Datei antippen und mit dem Kalender öffnen.</li>
        <li><b>Computer:</b> Die Datei doppelt anklicken oder im Kalender-Programm „Importieren“ wählen.</li></ol></details>
      <p class="klein leise">In der Datei stehen nur: Titel, Uhrzeit, Wochentage und ein kurzer Hinweis. Keine Ergebnisse, keine Antworten, keine Namen.</p>
      <p class="klein leise">Ändern oder beenden: den Termin in deinem Kalender bearbeiten oder löschen.</p>
      ${fussHtml()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = async (e) => {
    const uhr = el.querySelector('#tr-uhr'); if (uhr && /^\d{2}:\d{2}$/.test(uhr.value)) st.zeit = uhr.value;
    const tag = e.target.closest('[data-tag]');
    if (tag) { const t = tag.dataset.tag; st.tage = st.tage.includes(t) ? st.tage.filter((x) => x !== t) : P.WT_ICS.filter((x) => x === t || st.tage.includes(x)); fokus = 'tag-' + t; male(); return; }
    const b = e.target.closest('[data-tr]'); if (!b || !el.contains(b)) return;
    if (b.dataset.tr === 'woche-an') { st.woche = !st.woche; fokus = 'woche-an'; male(); return; }
    if (b.dataset.tr === 'ics') {
      if (!st.tage.length) { ui.meldung('Wähl mindestens einen Tag.'); return; }
      const ev = [{ titel: 'Kleiner Schritt (Wie ich ticke)', text: 'Zeit für deinen kleinen Schritt: Öffne „Wie ich ticke“ → Training. Eine Übung, 1 bis 10 Minuten.', zeit: st.zeit, tage: st.tage, dauer: 10 }];
      if (st.woche) ev.push({ titel: 'Wochenrückblick (Wie ich ticke)', text: 'Was hat dir diese Woche gutgetan? Öffne „Wie ich ticke“ → Training → Wochenrückblick.', zeit: '18:00', tage: ['SU'], dauer: 10 });
      let url = ''; try { if (/^https?:$/.test(location.protocol)) url = new URL('./#training', location.href.split('#')[0]).href; } catch {}
      const text = P.ics({ ereignisse: ev, url });
      S.schreib(M, 'erinnerung', { zeit: st.zeit, tage: st.tage, woche: st.woche });
      const w = await ui.datei('wie-ich-ticke-erinnerung.ics', text, 'text/calendar');
      ui.meldung(w === 'abgebrochen' ? 'Abgebrochen.' : 'Kalender-Datei bereit. Jetzt im Kalender importieren.', 3500);
    }
  };
  return rahmen(ctx, male, klick);
}

export default {
  id: 'training',
  schema: 1,
  migriere(daten) { return daten; },   // Schema 1 ist das erste – noch nichts umzubauen
  start(k) {
    ui.ladeStil(new URL('./stil.css', import.meta.url).href);
    // „Alles löschen“ und „Sicherung laden“: offene Übungs-Entwürfe (nur Arbeitsspeicher) mit vergessen
    k.on('geloescht', () => ENTWURF.clear()); k.on('importiert', () => ENTWURF.clear());
  },
  ansicht(ctx) {
    const [, unter, dritt, viert] = ctx.pfad;
    if (!unter) return heute(ctx);
    if (!viert) {
      if (unter === 'gruppe' && GRUPPE[dritt]) return gruppe(ctx, dritt);
      if (unter === 'uebung' && UEBUNG[dritt]) return uebung(ctx, dritt);
      if (unter === 'herausforderung' && /^\d+$/.test(dritt || '')) return herausforderung(ctx, Number(dritt));
      if (!dritt && unter === 'wachsen') return wachsen(ctx);
      if (!dritt && unter === 'plaene') return plaene(ctx);
      if (!dritt && unter === 'woche') return woche(ctx);
      if (!dritt && unter === 'erinnerung') return erinnerung(ctx);
    }
    kern.geh('training', { ersetzen: true });
  }
};
