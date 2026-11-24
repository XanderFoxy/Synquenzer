// M4 passt – Profil (Zusammenschau in Worten) und „Was passt zu mir“ (Vorschläge mit Begründung in Worten). Vertrag: ARCH.md §2–§4.
//   #profil                      Zusammenschau: Sätze, Richtungen mit zwei gleichwertigen Polen, Sprung zu #muster und #antworten, Bild sichern
//   #passt                       Übersicht: Kurz gesagt, sechs Abschnitte, „Im Alltag“ (fünf Wahlen, früher Treffer-Probe)
//   #passt/<abschnitt>           staerken | arbeit | geeignet | selbst | andere
//   #passt/wachstum[/<id>]       Richtungen zum Wachsen, Wahl → Ergebnis passt.wachstum (liest M5 training)
// KEINE Bewertung (Wunsch Xander 24.11.2026): keine Zahlen, Prozente, Ränge, Treffer-Zählung, kein richtig/falsch.
// Liest Ergebnisse anderer Module NUR über kern.speicher (bigfive, interessen.*, textspiegel). Rechnung: regeln.js (ohne DOM).
// Benannte Exporte für „Dein Muster“ und „Antworten ändern“: antwortListe(k), antwortSetzen(k, id, wert), muster(k), aeste().
// Eigene Daten (Speicherformat der Vorlage, nur ergänzt): m.passt.probe {bereich: 'a'|'b'}, m.passt.vorher {id: [{wert, anzeige, zeit}]},
// Ergebnis passt.wachstum {schema 1, id, richtung, ziel, titel, warum, warumId, gewaehlt, aufgaben, quellen}.
import { kern } from '../../kern.js';
import { auswerten, ABSCHNITTE, FRAGEBOEGEN, profilNameText, entwicklung, zusammenschau, richtungsListe, musterAus } from './regeln.js';
import { BEREICH, RIASEC, WACHSTUM, U16, VORHERSAGEN, ALLTAG_REIHE, AESTE, ANDERE } from './texte.js';

const ui = kern.ui, { esc, sym, marke } = ui;
const ABSCHNITT = Object.fromEntries(ABSCHNITTE.map((a) => [a.id, a]));
const RICHTUNG = Object.fromEntries(WACHSTUM.richtungen.map((r) => [r.id, r]));
const WARUM = Object.fromEntries(WACHSTUM.warum);
const VORHER_MAX = 5;
const EREIGNISSE = ['ergebnis', 'einwilligung', 'importiert', 'geloescht', 'einst'];

// ---------- Daten ----------
const sp = (k) => (k && k.speicher) || kern.speicher;
function lese(k) {
  const S = sp(k), roh = {};
  for (const x of Object.keys(FRAGEBOEGEN)) roh[x] = S.ergebnis(x);
  let einst = {}; try { einst = (k && typeof k.einst === 'function' ? k.einst() : kern.einst()) || {}; } catch {}
  const probe = S.lies('passt', 'probe', {}) || {};
  const R = auswerten(roh, { alter: einst.alter, probe });
  return { roh, R, probe, ts: S.ergebnis('textspiegel'), wahl: gueltigeWahl(S.ergebnis('passt.wachstum')) };
}
function gueltigeWahl(w) { return w && w.schema === 1 && RICHTUNG[w.id] ? w : null; }
const hatEtwas = (R) => !!(R.eingaben.bigfive || R.eingaben.riasec || R.eingaben.rhythmus || R.eingaben.ehrlichkeit);
// Neu zeichnen bei Kern-Ereignissen und wenn die eigenen Daten (Alltag, vorher) anderswo geändert wurden (#antworten)
function abonniere(ctx, male) {
  const aus = EREIGNISSE.map((n) => kern.on(n, () => { if (ctx.aktuell()) male(); }));
  aus.push(kern.on('daten', (d) => { if (d && d.modul === 'passt' && d.schluessel === 'probe' && ctx.aktuell()) male(); }));
  return () => aus.forEach((f) => f());
}

// ---------- Antworten setzen (eine Stelle für Ansichten und antwortSetzen) ----------
function merkeVorher(S, id, wert, anzeige) {
  if (wert === null || wert === undefined) return;
  const v = S.lies('passt', 'vorher', {}) || {}, alt = Array.isArray(v[id]) ? v[id] : [];
  v[id] = [{ wert, anzeige: anzeige || '', zeit: new Date().toISOString() }, ...alt].slice(0, VORHER_MAX);
  S.schreib('passt', 'vorher', v);
}
function setzeAlltag(S, bereich, wert) {
  const v = VORHERSAGEN[bereich]; if (!v || (wert !== null && wert !== 'a' && wert !== 'b')) return false;
  const probe = { ...(S.lies('passt', 'probe', {}) || {}) }, alt = probe[bereich] === 'a' || probe[bereich] === 'b' ? probe[bereich] : null;
  if (alt === wert) return true;
  merkeVorher(S, 'alltag.' + bereich, alt, alt ? v[alt] : '');
  if (wert === null) delete probe[bereich]; else probe[bereich] = wert;
  S.schreib('passt', 'probe', probe);
  return true;
}
// id === null nimmt die Wahl zurück; warumId === undefined behält das bisherige Warum (bei gleicher Richtung)
function setzeRichtung(S, id, warumId) {
  const alt = gueltigeWahl(S.ergebnis('passt.wachstum'));
  if (id === null) { if (alt) { merkeVorher(S, 'wachstum.richtung', alt.id, alt.titel); S.loescheErgebnis('passt.wachstum'); } return true; }
  const r = RICHTUNG[id]; if (!r) return false;
  const w = warumId === undefined ? (alt && alt.id === id ? alt.warumId || null : null) : warumId;
  if (w !== null && !WARUM[w]) return false;
  if (alt && alt.id === id && (alt.warumId || null) === w) return true;
  if (alt && alt.id !== id) merkeVorher(S, 'wachstum.richtung', alt.id, alt.titel);
  if (alt && alt.id === id && (alt.warumId || null) !== w) merkeVorher(S, 'wachstum.warum', alt.warumId || null, alt.warum || '');
  S.setzeErgebnis('passt.wachstum', { schema: 1, id, richtung: r.richtung, ziel: r.ziel, titel: r.titel, warum: w ? WARUM[w] : null, warumId: w,
    gewaehlt: alt && alt.id === id && alt.gewaehlt ? alt.gewaehlt : new Date().toISOString(), aufgaben: r.aufgaben, quellen: ['hudson2015', 'hudson2019'] },
  { ersetzen: !!(alt && alt.id === id) });
  return true;
}

// ---------- Bausteine ----------
const u16Html = (R) => R.u16 ? `<p class="hinweis">${esc(U16)}</p>` : '';
const merkHtml = () => kern.speicher.einwilligung() ? '' :
  `<div class="hinweis gelb pa-merk"><p><b>Nur für jetzt:</b> Deine Antworten sind nicht gemerkt und beim Neuladen oder Schließen weg.</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
const astLink = (id) => `#muster/ast/${esc(id)}`;
function weilHtml(a) {
  return a.sicher === 'alle' ? `<p class="pa-weil">Gilt für alle – unabhängig von deinen Richtungen.</p>`
    : a.sicher === 'idee' ? `<p class="pa-weil">Eine Idee, die zu deiner Richtung passen könnte – ${esc(a.weil)}.</p>`
      : a.sicher === 'mitte' ? `<p class="pa-weil">Aus deinen Antworten – ${esc(a.weil)}.</p>`
      : `<p class="pa-weil">Passt zu deiner Richtung – ${esc(a.weil)}.</p>`;
}
function aussageHtml(a, { ohneWeil = false } = {}) {
  return `<li class="pa-aussage">${a.titel ? `<p class="pa-titel">${esc(a.titel)}</p>` : ''}
    <p class="pa-text">${esc(a.text)} ${marke(a.stufe, a.quellen)}</p>
    ${a.kosten ? `<p class="pa-preis"><b>Wo es reiben kann:</b> ${esc(a.kosten.text)} ${marke(a.kosten.stufe, a.kosten.quellen)}</p>` : ''}
    ${ohneWeil ? '' : weilHtml(a)}</li>`;
}
function fehltHtml(R, nur = null) {
  const offen = R.eingaben.fehlt.filter((k) => !nur || nur.includes(k)), alt = R.eingaben.unbekannt.filter((k) => !nur || nur.includes(k));
  if (!offen.length && !alt.length) return '';
  const z = (k, t) => `<li><a class="zeile" href="#${esc(FRAGEBOEGEN[k].route)}"><span><b>${esc(FRAGEBOEGEN[k].titel)}</b><small>${esc(t)}</small></span><span class="rechts">${sym('weiter')}</span></a></li>`;
  return `<h3>Noch offen</h3><p class="klein leise">Je mehr du ausfüllst, desto mehr kann die App beschreiben. Was fehlt, wird nicht geraten.</p>
    <ul class="zeilen">${offen.map((k) => z(k, 'noch nicht ausgefüllt')).join('')}${alt.map((k) => z(k, 'bitte noch einmal ausfüllen (ältere Fassung)')).join('')}</ul>`;
}
function leerHtml(titel) {
  return `<h2>${esc(titel)}</h2><div class="karte weich"><p><b>Noch nichts zum Zusammenschauen.</b> Hier steht, was zu dir passt, sobald du mindestens einen Fragebogen ausgefüllt hast. Am meisten beschreibt die Persönlichkeit (ca. 3 Minuten).</p>
    <a class="knopf haupt voll" href="#fragen/bigfive">Mit der Persönlichkeit anfangen</a><a class="knopf zweit voll" href="#fragen">Alle Fragebögen</a></div>`;
}
const leichtHtml = (liste) => liste.some((a) => a.sicher === 'eher' && / leicht in Richtung/.test(a.weil))
  ? `<p class="klein leise">„Leicht in Richtung“ heißt: Die Richtung zeigt sich, ist aber noch nicht klar. Mit „Genauer hinschauen“ in der Persönlichkeit wird sie klarer. <a class="link" href="#fragen/bigfive">Zur Persönlichkeit</a></p>` : '';
const nichtHtml = (R, id) => `<div class="hinweis pa-nicht"><p><b>Was das nicht heißt:</b> ${esc(R.nicht[id])}</p></div>`;
const springHtml = (ids, titel = 'Weiter springen') => {
  const a = ids.map((id) => AESTE.find((x) => x.id === id)).filter(Boolean);
  return a.length ? `<h3>${esc(titel)}</h3><ul class="zeilen pa-spring">${a.map((x) => `<li><a class="zeile" href="${astLink(x.id)}"><span><b>${esc(x.titel)}</b><small>Was es ist, im Alltag, Stärken, wo es reibt, Fragen zum Weiterdenken</small></span><span class="rechts">${sym('weiter')}</span></a></li>`).join('')}</ul>` : '';
};
const ABSCHNITT_AESTE = {
  staerken: ['passt.staerken'], arbeit: ['passt.arbeit_struktur', 'passt.arbeit_team', 'passt.arbeit_druck', 'passt.arbeit_neues', 'passt.arbeit_miteinander', 'passt.umgebung', 'passt.lernen'],
  geeignet: ['passt.geeignet'], selbst: ['passt.selbst'], andere: ['passt.andere_streit', 'passt.andere_naehe'], wachstum: ['passt.wachstum']
};
const RI_AST = { ehrlichkeit: 'interessen.ehrlichkeit', rhythmus: 'interessen.rhythmus' };

// Eine Richtung: zwei gleichwertige Pole als Worte, dazwischen eine ruhige Linie – ohne Zahl, ohne Markierung auf einer Skala
function richtungHtml(r, { link = true } = {}) {
  const an = (i) => (r.deutlich === 'beides' && !r.offen) || (r.seite > 0 ? i === 1 : r.seite < 0 ? i === 0 : false);
  const pol = (i) => `<span class="pa-pol${an(i) ? ' an' : ''}${an(i) && r.deutlich === 'klar' ? ' klar' : ''}">${esc(r.pole[i])}</span>`;
  const innen = `<span class="pa-ri-kopf"><b>${esc(r.titel)}</b>${link ? sym('weiter') : ''}</span>
    <span class="pa-ri-pole" aria-hidden="true">${pol(0)}<span class="pa-ri-linie"></span>${pol(1)}</span>
    <span class="pa-ri-text">${esc(r.text.charAt(0).toUpperCase() + r.text.slice(1))}</span>`;
  return link ? `<a class="pa-ri" href="${astLink(RI_AST[r.id] || 'bigfive.' + r.id)}" aria-label="${esc(`${r.titel}: ${r.text}. Mehr dazu`)}">${innen}</a>`
    : `<div class="pa-ri" role="group" aria-label="${esc(`${r.titel}: ${r.text}`)}">${innen}</div>`;
}

// Radiogruppen: Pfeiltasten bewegen die Auswahl (ARIA-Muster)
function pfeile(e) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  const g = e.target.closest('[role=radiogroup]'); if (!g || !e.target.matches('[role=radio]')) return;
  const k = [...g.querySelectorAll('[role=radio]')], i = k.indexOf(e.target), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
  e.preventDefault(); const z = k[(i + d + k.length) % k.length]; z.click(); setTimeout(() => { const n = document.querySelector(`[data-fokus="${z.dataset.fokus}"]`); if (n) n.focus(); }, 0);
}
function fokusNach(el, key) { if (!key) return; const n = el.querySelector(`[data-fokus="${key}"]`); if (n) try { n.focus({ preventScroll: true }); } catch {} }

// Sehr schneller letzter Big-Five-Durchgang (Fach-Prüfung 17.11., F6): dann keine Richtungen und Stärken daraus – ohne Urteil
const FRAGLICH_HTML = `<p class="hinweis gelb klein">Dein letzter Durchgang im Persönlichkeits-Fragebogen ging sehr schnell. Darum leitet die App daraus noch keine Richtungen ab. Wenn du magst: <a class="link" href="#fragen/bigfive">in Ruhe noch einmal</a></p>`;

// ---------- Profil ----------
function profil(ctx) {
  const { el } = ctx;   // Titel im Kopf bleibt „Profil“ (Name der Leisten-Route)
  const male = () => {
    const { R, ts, wahl } = lese(), E = R.eingaben;
    if (!hatEtwas(R)) { el.innerHTML = leerHtml('Dein Profil') + aktionenHtml(false) + ui.fuss(); return; }
    const saetze = zusammenschau(R, wahl), ri = richtungsListe(R), name = R.fraglich ? null : R.name.name;
    const r = E.riasec, top = r ? r.top.slice(0, 3).filter((t) => RIASEC[t]) : [];
    const verlauf = kern.speicher.verlauf('bigfive').filter((x) => x && x.schema === 1 && x.skala === 'T');
    const ent = verlauf.length >= 2 ? entwicklung(verlauf[verlauf.length - 2], verlauf[verlauf.length - 1]) : [];
    el.innerHTML = `<h2>Dein Profil</h2>${u16Html(R)}
      <p class="lead">So, wie du dich beschrieben hast – in Worten, ohne Wertung und ohne richtig oder falsch.</p>
      <section class="karte pa-karte" aria-label="Profil-Karte">
        <p class="pa-kopf"><span>Wie ich ticke · Profil-Karte</span><span>${esc(ui.datum(new Date().toISOString()))}</span></p>
        ${name ? `<p class="pa-name">${esc(name)}</p><p class="klein leise">${esc(profilNameText(R.name))}</p>` : ''}
        ${saetze.length ? `<h3>So bist du zusammengesetzt</h3><ul class="pa-saetze">${saetze.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
        ${R.fraglich ? FRAGLICH_HTML : ''}
        ${ri.length ? `<h3>Deine Richtungen</h3><p class="klein leise">Zwei Seiten, beide mit Stärken. Tippe auf eine Richtung, um mehr darüber zu lernen.</p><div class="pa-ris">${ri.map((x) => richtungHtml(x)).join('')}</div>` : ''}
        ${top.length ? `<h3>Was dich anzieht</h3><p>${esc(top.map((t) => RIASEC[t].name).join(' · '))}</p>
          ${r.knapp && r.knapp.drittVierter && RIASEC[r.knapp.drittVierter] ? `<p class="klein leise">Ganz nah dabei: ${esc(RIASEC[r.knapp.drittVierter].name)}.</p>` : ''}` : ''}
        ${ts ? `<p class="klein leise">Text-Spiegel: Du hast schon einen Text spiegeln lassen – <a class="link" href="#text">ansehen</a></p>` : ''}
      </section>
      ${aktionenHtml(true)}
      ${ent.length && ent.some((x) => x.verschoben) ? `<h3>Seit dem ${esc(ui.datum(verlauf[verlauf.length - 2].zeit))}</h3><ul class="pa-ent">${ent.map((x) => `<li><b>${esc(x.name)}</b> ${esc(x.text)}</li>`).join('')}</ul>
        <p class="klein leise">„Verschoben“ heißt nur: anders als beim letzten Mal, mehr als ein Fragebogen von selbst schwankt. Beides gehört zu dir.</p>` : ''}
      <div class="hinweis pa-nicht"><p><b>Was das nicht heißt:</b> kein Typ und keine Diagnose. Beide Seiten jeder Richtung haben Stärken. Fragebögen sind ungenau – darum sagt die App nur „klar“, „leicht“ oder „beides gehört zu dir“.</p>
        <p class="klein">Wort-Bilder sind eine Vereinfachung; feste Typen sind in der Forschung umstritten. ${marke('belegt', ['gerlach2018', 'freudenstein2019'])}</p></div>
      ${fehltHtml(R)}${merkHtml()}${ui.fuss()}`;
  };
  male();
  const klick = (e) => { const k = e.target.closest('[data-pa=bild]'); if (k) { e.preventDefault(); bildBlatt(); } };
  el.addEventListener('click', klick);
  const aus = abonniere(ctx, male);
  return () => { el.removeEventListener('click', klick); aus(); };
}
function aktionenHtml(mitBild) {
  return `<div class="stapel pa-aktionen"><a class="knopf haupt voll" href="#muster">Dein Muster als Baum ${sym('weiter')}</a>
    <a class="knopf zweit voll" href="#antworten">Antworten ansehen und ändern</a>
    <a class="knopf zweit voll" href="#passt">${sym('passt')} Was passt zu mir</a>
    ${mitBild ? `<button type="button" class="knopf zweit voll" data-pa="bild">${sym('sichern')} Als Bild sichern</button>` : ''}</div>`;
}

// Profil-Karte als Bild – nur lokal (Canvas), ohne Namen, Ehrlichkeit nur auf Wunsch. Nur Worte, keine Zahlen.
async function bildBlatt() {
  const { R, wahl } = lese(); if (!hatEtwas(R)) return;
  const { bildErzeugen } = await import('./karte.js');
  let mitEhr = false, url = null, blob = null;
  const daten = () => ({
    name: R.fraglich ? null : R.name.name, datum: ui.datum(new Date().toISOString()),
    richtungen: richtungsListe(R).filter((x) => mitEhr || x.id !== 'ehrlichkeit'),
    interessen: R.eingaben.riasec ? R.eingaben.riasec.top.slice(0, 3).filter((t) => RIASEC[t]).map((t) => RIASEC[t].name) : [],
    wachstum: wahl ? wahl.titel : ''
  });
  const zeichne = async (d) => {
    blob = await bildErzeugen(daten());
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    const img = d.querySelector('.pa-bild img'); if (img) img.src = url;
  };
  await ui.blatt(`<div class="pa-bild"><img alt="Vorschau deiner Profil-Karte als Bild" width="1080" height="1350"></div>
    <p class="klein leise">Das Bild entsteht nur auf diesem Gerät. Es enthält keinen Namen von dir. Nichts wird hochgeladen – du entscheidest, ob und wo du es zeigst.</p>
    ${R.L.ehrlichkeit ? `<label class="schalter"><span>Ehrlichkeit mit aufs Bild</span><input type="checkbox" role="switch" data-pa="ehr"></label>` : ''}
    <div class="stapel"><button type="button" class="knopf haupt gross" data-pa="sichern">${sym('sichern')} Bild sichern</button><button type="button" class="knopf zweit" data-w="">Schließen</button></div>`,
  { titel: 'Profil-Karte als Bild', binde: (d) => {
    zeichne(d);
    d.addEventListener('change', (e) => { if (e.target.matches('[data-pa=ehr]')) { mitEhr = e.target.checked; zeichne(d); } });
    d.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-pa=sichern]')) return;
      if (!blob) await zeichne(d);
      const w = await ui.datei(`wie-ich-ticke-profil-${new Date().toISOString().slice(0, 10)}.png`, blob, 'image/png');
      if (w !== 'abgebrochen') ui.meldung('Bild gesichert – nur auf diesem Gerät.');
    });
  } });
  if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Im Alltag (fünf Wahlen) ----------
const ALLTAG_AST = Object.fromEntries(AESTE.filter((a) => a.alltag).map((a) => [a.alltag, a.id]));
function bezugText(x) {
  const B = BEREICH[x.bereich], seitePol = x.seite > 0 ? B.rechts : B.links;
  if (x.vergleich === 'gleich') return `Zeigt in dieselbe Richtung wie dein Fragebogen – ${x.weil}.`;
  if (x.vergleich === 'anders') return `Im Alltag wählst du hier die andere Seite als im Fragebogen (${x.weil}). Beides gehört zu dir – Situationen machen viel aus.`;
  if (x.vergleich === 'beides') return `Im Fragebogen gehört hier beides zu dir; im Alltag wählst du eher „${seitePol}“.`;
  return `Deine Wahl zeigt in Richtung „${seitePol}“.`;
}
function alltagHtml(R) {
  return `<section class="karte pa-alltag" aria-labelledby="pa-alltag-t"><h3 id="pa-alltag-t">Im Alltag: Wie wählst du?</h3>
    <p class="klein">Fünf kleine Situationen. Es gibt kein richtig oder falsch – wähl, was du eher tun würdest. Umwählen geht jederzeit.</p>
    ${R.alltag.map((x, i) => `<div class="pa-frage"><p id="pa-f${i}"><b>${esc(x.frage)}</b></p>
      <div class="chips" role="radiogroup" aria-labelledby="pa-f${i}">${['a', 'b'].map((w) => `<button type="button" class="chip" role="radio" aria-checked="${x.wahl === w}" tabindex="${(x.wahl ? x.wahl === w : w === 'a') ? 0 : -1}" data-probe="${x.bereich}" data-wahl="${w}" data-fokus="p-${x.bereich}-${w}">${esc(x[w])}</button>`).join('')}</div>
      ${x.wahl ? `<p class="pa-bezug">${esc(bezugText(x))} ${ALLTAG_AST[x.bereich] ? `<a class="link" href="${astLink(ALLTAG_AST[x.bereich])}">Mehr dazu</a>` : ''}</p>` : ''}</div>`).join('')}
    <p class="klein leise">Konkrete Situationen statt allgemeiner Sätze – so prüfst du selbst, ob eine Beschreibung zu dir passt. ${marke('belegt', ['forer1949'])}</p></section>`;
}

// ---------- Was passt zu mir: Übersicht ----------
function uebersicht(ctx) {
  const { el } = ctx; ctx.titel('Was passt zu mir');
  let fokus = null;
  const male = () => {
    const { R } = lese();
    if (!hatEtwas(R)) { el.innerHTML = `${leerHtml('Was passt zu mir')}<p class="klein leise">Schon jetzt kannst du hier fünf Alltags-Fragen beantworten.</p>${alltagHtml(R)}${merkHtml()}${ui.fuss()}`; fokusNach(el, fokus); fokus = null; return; }
    el.innerHTML = `<h2>Was passt zu mir</h2>${u16Html(R)}${R.fraglich ? FRAGLICH_HTML : ''}
      <p class="lead">Vorschläge aus deinen Richtungen – jeweils mit dem Grund in Worten. Nimm, was zu dir passt; der Rest darf liegen bleiben.</p>
      ${R.kurz.length ? `<section class="karte gruen"><h3>Kurz gesagt: was dir liegt</h3><ul class="pa-kurz">${R.kurz.map((a) => `<li>${esc(a.text)} ${marke(a.stufe, a.quellen)}${a.kosten ? `<br><span class="pa-preis-kurz"><b>Wo es reiben kann:</b> ${esc(a.kosten.text)}</span>` : ''}</li>`).join('')}</ul></section>` : ''}
      ${R.mitte.length ? `<p class="klein leise">Beides gehört zu dir bei ${R.mitte.map((id) => esc(BEREICH[id].name)).join(', ')}. Dazu sagt die App bewusst nichts Bestimmtes – dort kommt es auf die Lage an.</p>` : ''}
      <ul class="zeilen pa-abschnitte">${ABSCHNITTE.map((a) => `<li><a class="zeile" href="#passt/${a.id}"><span><b>${esc(a.titel)}</b><small>${esc(a.kurz)}</small></span><span class="rechts">${sym('weiter')}</span></a></li>`).join('')}</ul>
      ${alltagHtml(R)}
      ${aktionenHtml(false).replace(`<a class="knopf zweit voll" href="#passt">${sym('passt')} Was passt zu mir</a>`, `<a class="knopf zweit voll" href="#profil">${sym('profil')} Dein Profil</a>`)}
      ${fehltHtml(R)}${merkHtml()}${ui.fuss()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = (e) => {
    const c = e.target.closest('[data-probe]'); if (!c) return;
    fokus = c.dataset.fokus;
    setzeAlltag(kern.speicher, c.dataset.probe, c.dataset.wahl);   // schreibt → Ereignis 'daten' → male()
  };
  el.addEventListener('click', klick); el.addEventListener('keydown', pfeile);
  const aus = abonniere(ctx, male);
  return () => { el.removeEventListener('click', klick); el.removeEventListener('keydown', pfeile); aus(); };
}

// ---------- Ein Abschnitt ----------
function abschnitt(ctx, id) {
  const { el } = ctx, A = ABSCHNITT[id]; ctx.titel(A.titel); ctx.zurueckZu('passt');
  const male = () => {
    const { R } = lese();
    if (!hatEtwas(R)) { el.innerHTML = leerHtml(A.titel) + springHtml(ABSCHNITT_AESTE[id] || [], 'Schon jetzt zum Lesen') + ui.fuss(); return; }
    const liste = R.abschnitte[id], i = ABSCHNITTE.findIndex((a) => a.id === id), naechster = ABSCHNITTE[i + 1];
    const brauchtBF = id !== 'geeignet' && !R.eingaben.bigfive;
    let leer = '';
    if (!liste.length || (brauchtBF && liste.every((a) => a.sicher === 'alle'))) {
      leer = brauchtBF || (id === 'geeignet' && !R.eingaben.riasec && !R.eingaben.bigfive)
        ? `<div class="karte weich"><p>Dafür braucht die App deine ${id === 'geeignet' ? 'Interessen oder deine ' : ''}Persönlichkeit.</p><a class="knopf haupt voll" href="#${id === 'geeignet' ? 'fragen/interessen/riasec' : 'fragen/bigfive'}">${id === 'geeignet' ? 'Interessen ausfüllen' : 'Persönlichkeit ausfüllen'}</a></div>`
        : `<div class="karte weich"><p>Bei dir gehört hier beides zu dir. Dazu sagt die App bewusst nichts Bestimmtes – sonst wären es Sätze, die auf fast alle passen.</p><p class="klein leise">Genauere Fragen können zeigen, ob einzelne Seiten deutlicher werden.</p><a class="knopf zweit voll" href="#fragen/bigfive">Genauer hinschauen</a></div>`;
    }
    const formate = id === 'geeignet' && liste.some((a) => a.titel === 'Format-Idee');
    el.innerHTML = `<h2>${esc(A.titel)}</h2>${u16Html(R)}
      ${id === 'staerken' ? '<p class="lead">Jede Stärke hat eine andere Seite – zwei Seiten derselben Eigenart, keine Fehler.</p>' : ''}
      ${leer}${liste.length ? `<ul class="pa-liste">${liste.map((a) => aussageHtml(a)).join('')}</ul>` : ''}
      ${formate ? `<p class="klein leise">${esc('Ob passende Formate besser ankommen, ist nicht erforscht. Probier aus, welches sich für dich stimmig anfühlt.')} ${marke('idee')}</p>` : ''}
      ${id === 'selbst' ? `<a class="karte" href="#training">${sym('training')}<span><b>Training</b><br><span class="klein leise">Kleine Übungen für Schlaf, Bewegung, Ruhe und Fokus</span></span><span class="rechts">${sym('weiter')}</span></a>` : ''}
      ${leichtHtml(liste)}${nichtHtml(R, id)}
      ${springHtml(ABSCHNITT_AESTE[id] || [])}
      ${fehltHtml(R, id === 'geeignet' ? ['interessen.riasec', 'bigfive'] : id === 'arbeit' || id === 'selbst' ? ['bigfive', 'interessen.rhythmus'] : ['bigfive'])}
      ${naechster ? `<a class="knopf zweit voll" href="#passt/${naechster.id}">Weiter: ${esc(naechster.titel)} ${sym('weiter')}</a>` : ''}
      ${merkHtml()}${ui.fuss()}`;
  };
  male();
  return abonniere(ctx, male);
}

// ---------- Wachstum ----------
function wachstum(ctx) {
  const { el } = ctx; ctx.titel('Wachsen'); ctx.zurueckZu('passt');
  const male = () => {
    const { R, wahl } = lese(), W = R.richtungen;
    const zeile = (r) => `<li><a class="zeile" href="#passt/wachstum/${r.id}"><span><b>${esc(r.titel)}</b><small>${esc(r.wofuer)}${r.weil ? ` · <span class="pa-bei">passt zu deiner Richtung – ${esc(r.weil)}</span>` : ''}</small></span><span class="rechts">${wahl && wahl.id === r.id ? `${sym('haken')}<span class="sr">gewählt</span>` : ''}${sym('weiter')}</span></a></li>`;
    const rest = W.alle.filter((r) => !W.nahe.includes(r));
    el.innerHTML = `<h2>Wachsen – wenn du willst</h2>${u16Html(R)}
      ${wahl ? wahlHtml(wahl) : ''}
      <ul class="pa-liste">${R.abschnitte.wachstum.map((a) => aussageHtml(a, { ohneWeil: true })).join('')}</ul>
      ${W.hatBF ? (W.nahe.length ? `<h3>Hier hast du viel Spielraum</h3><p class="klein leise">Aus deinen Richtungen – kein Muss. Jede Richtung hat auch eine andere Seite.</p><ul class="zeilen">${W.nahe.map(zeile).join('')}</ul>`
        : '<p class="klein leise">Aus deinen Richtungen sticht keine heraus. Alle stehen dir offen.</p>')
        : `<div class="karte weich"><p>Mit deiner Persönlichkeit (Big Five) sieht die App, wo du viel Spielraum hast.</p><a class="knopf zweit voll" href="#fragen/bigfive">Persönlichkeit ausfüllen</a></div>`}
      <h3>${W.nahe.length ? 'Weitere Richtungen' : 'Alle Richtungen'}</h3><ul class="zeilen">${rest.map(zeile).join('')}</ul>
      ${nichtHtml(R, 'wachstum')}${springHtml(['passt.wachstum', 'passt.staerken'])}${merkHtml()}${ui.fuss()}`;
  };
  male();
  const klick = async (e) => { if (e.target.closest('[data-pa=abwaehlen]')) { e.preventDefault(); await abwaehlen(); } };
  el.addEventListener('click', klick);
  const aus = abonniere(ctx, male);
  return () => { el.removeEventListener('click', klick); aus(); };
}
function wahlHtml(w) {
  const r = RICHTUNG[w.id];
  return `<section class="karte akzent pa-wahl" aria-labelledby="pa-wahl-t"><h3 id="pa-wahl-t">Deine Richtung: ${esc(r.titel)}</h3>
    <p class="klein leise">Gewählt am ${esc(ui.datum(w.gewaehlt || w.zeit))}${w.warum ? ` · ${esc(w.warum)}` : ''}</p>
    <h4>Kleine Herausforderungen</h4><ul class="pa-aufgaben">${r.aufgaben.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <p class="klein">Eine am Tag oder in der Woche reicht. Wichtig ist, sie wirklich zu machen. ${marke('belegt', ['hudson2019'])}</p>
    <a class="knopf haupt voll" href="#training">${sym('training')} Im Training üben</a>
    <button type="button" class="knopf zweit voll" data-pa="abwaehlen">Wahl zurücknehmen</button></section>`;
}
async function abwaehlen() {
  if (await ui.bestaetige({ titel: 'Wahl zurücknehmen?', text: 'Die gewählte Richtung wird gelöscht. Du kannst jederzeit eine neue wählen.', ja: 'Zurücknehmen' })) {
    setzeRichtung(kern.speicher, null); ui.meldung('Wahl zurückgenommen.');
  }
}

function richtung(ctx, id) {
  const { el } = ctx, r0 = RICHTUNG[id]; ctx.titel(r0.titel); ctx.zurueckZu('passt/wachstum');
  let warum = null, fokus = null;
  const male = () => {
    const { R, wahl } = lese();
    const r = R.richtungen.alle.find((x) => x.id === id) || r0, aktiv = wahl && wahl.id === id;
    if (aktiv && warum === null) warum = wahl.warumId || null;
    el.innerHTML = `<h2>${esc(r.titel)}</h2>${u16Html(R)}
      <p class="lead">${esc(r.wofuer)}</p>
      ${r.weil ? `<p class="pa-weil">Passt zu deiner Richtung – ${esc(r.weil)}.</p>` : ''}
      ${r.beleg ? `<ul class="pa-liste">${aussageHtml({ ...r.beleg, quellen: r.beleg.quellen || [], sicher: 'alle' }, { ohneWeil: true })}</ul>` : ''}
      <p class="pa-preis"><b>Wo es reiben kann:</b> ${esc(r.preis)} ${marke('idee')}</p>
      <h3>Kleine Herausforderungen</h3>
      <p class="klein leise">Zum Ausprobieren, nach dem Muster einer Studie mit wöchentlichen kleinen Herausforderungen. ${marke('abgeleitet', ['hudson2019'])}</p>
      <ul class="pa-aufgaben">${r.aufgaben.map((t) => `<li>${esc(t)} ${marke('idee')}</li>`).join('')}</ul>
      ${aktiv ? `<div class="hinweis"><p>${sym('haken')} <b>Das ist deine gewählte Richtung.</b></p></div>` : ''}
      <h3 id="pa-warum-t">Warum möchtest du das? <span class="leise klein">(freiwillig)</span></h3>
      <div class="chips" role="radiogroup" aria-labelledby="pa-warum-t">${WACHSTUM.warum.map(([w, t], i) => `<button type="button" class="chip" role="radio" aria-checked="${warum === w}" tabindex="${(warum ? warum === w : i === 0) ? 0 : -1}" data-warum="${w}" data-fokus="w-${w}">${esc(t)}</button>`).join('')}</div>
      <button type="button" class="knopf haupt gross voll" data-pa="waehlen">${aktiv ? 'Richtung behalten' : 'Diese Richtung wählen'}</button>
      ${aktiv ? '<button type="button" class="knopf zweit voll" data-pa="abwaehlen">Wahl zurücknehmen</button>' : ''}
      <p class="klein leise">Die Wahl bleibt auf diesem Gerät. Das Training schlägt dir dazu kleine Schritte vor. Du kannst sie jederzeit ändern – auch unter „Antworten ändern“.</p>
      ${nichtHtml(R, 'wachstum')}<p><a class="link" href="${astLink('passt.wachstum')}">Mehr über Wachsen lernen</a></p>${merkHtml()}${ui.fuss()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = async (e) => {
    const c = e.target.closest('[data-warum]');
    if (c) { warum = warum === c.dataset.warum ? null : c.dataset.warum; fokus = c.dataset.fokus; male(); return; }
    if (e.target.closest('[data-pa=abwaehlen]')) { e.preventDefault(); await abwaehlen(); return; }
    if (e.target.closest('[data-pa=waehlen]')) {
      setzeRichtung(kern.speicher, id, warum);
      ui.meldung('Gewählt – im Training findest du kleine Schritte dazu.');
      kern.geh('passt/wachstum');
    }
  };
  el.addEventListener('click', klick); el.addEventListener('keydown', pfeile);
  const aus = abonniere(ctx, male);
  return () => { el.removeEventListener('click', klick); el.removeEventListener('keydown', pfeile); aus(); };
}

// ---------- Vertrag: Antworten, Muster, Äste ----------
// Alle Antworten dieses Moduls: fünf Alltags-Wahlen und die Wachstums-Richtung (+ Warum, sobald eine Richtung gewählt ist).
export function antwortListe(k) {
  const S = sp(k), probe = S.lies('passt', 'probe', {}) || {}, vorher = S.lies('passt', 'vorher', {}) || {}, wahl = gueltigeWahl(S.ergebnis('passt.wachstum'));
  const vh = (id) => (Array.isArray(vorher[id]) ? vorher[id].slice(0, VORHER_MAX) : []);
  const liste = ALLTAG_REIHE.map((b) => {
    const v = VORHERSAGEN[b], w = probe[b] === 'a' || probe[b] === 'b' ? probe[b] : null, id = 'alltag.' + b;
    return { id, gruppe: 'Im Alltag', frage: v.frage, art: 'wahl', wert: w, anzeige: w ? v[w] : '', optionen: [{ wert: 'a', text: v.a }, { wert: 'b', text: v.b }], route: 'passt', vorher: vh(id) };
  });
  liste.push({ id: 'wachstum.richtung', gruppe: 'Wachsen', frage: 'Welche Richtung möchtest du gerade üben? (freiwillig)', art: 'wahl', wert: wahl ? wahl.id : null, anzeige: wahl ? wahl.titel : '',
    optionen: WACHSTUM.richtungen.map((r) => ({ wert: r.id, text: r.titel })), route: wahl ? 'passt/wachstum/' + wahl.id : 'passt/wachstum', vorher: vh('wachstum.richtung') });
  if (wahl) liste.push({ id: 'wachstum.warum', gruppe: 'Wachsen', frage: 'Warum möchtest du das? (freiwillig)', art: 'wahl', wert: wahl.warumId || null, anzeige: wahl.warumId ? WARUM[wahl.warumId] || '' : '',
    optionen: WACHSTUM.warum.map(([w, t]) => ({ wert: w, text: t })), route: 'passt/wachstum/' + wahl.id, vorher: vh('wachstum.warum') });
  return liste;
}
// Speichert wie die Ansichten (dieselben Funktionen), pflegt „vorher“; wert === null löscht. Ergebnis-Texte rechnen beim nächsten Zeichnen neu
// (regeln.js rechnet ohne Zwischenspeicher); geschrieben wird über den Kern, der 'daten'/'ergebnis' meldet. Gibt true/false zurück.
export async function antwortSetzen(k, id, wert) {
  const S = sp(k), w = wert === undefined ? null : wert;
  if (typeof id !== 'string') return false;
  if (id.startsWith('alltag.')) return setzeAlltag(S, id.slice(7), w);
  if (id === 'wachstum.richtung') return setzeRichtung(S, w);
  if (id === 'wachstum.warum') { const wahl = gueltigeWahl(S.ergebnis('passt.wachstum')); return wahl ? setzeRichtung(S, wahl.id, w) : false; }
  return false;
}
// Richtungen in Worten zu den eigenen Ästen (aus Persönlichkeit, Interessen, Alltags-Wahlen, Wachstums-Wahl). [] solange nichts da ist.
export function muster(k) {
  try { const { R, wahl } = lese(k); return musterAus(R, wahl); } catch (e) { console.error(e); return []; }
}
// Lerninhalt je Ast, unabhängig von den Antworten (Felder basis/alltag sind intern und werden nicht mitgegeben).
export function aeste() {
  const unter = (a) => a.unteraeste === 'RIASEC' ? Object.entries(RIASEC).map(([t, x]) => ({ id: t, titel: x.name, text: `${x.taetigkeit} Passende Rolle im Team: ${x.rolle}. Ein Projekt dazu: ${x.projekt}.` }))
    : a.unteraeste === 'STREIT' ? [['ausweichen', 'Ausweichen'], ['durchsetzen', 'Sich durchsetzen'], ['loesen', 'Gemeinsam lösen']].map(([s, t]) => ({ id: s, titel: t, text: ANDERE.streit[s].text }))
      .concat([{ id: 'satz', titel: '„Mir ist wichtig, dass …“', text: 'Ein Satz, der mit dem eigenen Anliegen beginnt statt mit einem Vorwurf, macht es anderen leichter zuzuhören – und klärt trotzdem.' }])
      : a.unteraeste === 'WACHSTUM' ? WACHSTUM.richtungen.map((r) => ({ id: r.id, titel: r.titel, text: `${r.wofuer} Wo es reiben kann: ${r.preis} Zum Beispiel: ${r.aufgaben[0]}` }))
        : (a.unteraeste || []);
  return AESTE.map(({ basis, alltag, ...a }) => ({ ...a, unteraeste: unter(a), imAlltag: [...a.imAlltag], staerken: [...a.staerken], reibung: [...a.reibung], weiterdenken: [...a.weiterdenken],
    ueben: (a.ueben || []).map((u) => ({ ...u })), verwandt: [...(a.verwandt || [])], ...(a.pole ? { pole: a.pole.map((p) => ({ ...p })) } : {}) }));
}

export default {
  id: 'passt',
  schema: 1,
  start() { ui.ladeStil(new URL('./stil.css', import.meta.url).href); },
  ansicht(ctx) {
    const [top, unter, dritt] = ctx.pfad;
    if (top === 'profil') { if (unter) { kern.geh('profil', { ersetzen: true }); return; } return profil(ctx); }
    if (!unter) return uebersicht(ctx);
    if (unter === 'wachstum') {
      if (!dritt) return wachstum(ctx);
      if (RICHTUNG[dritt]) return richtung(ctx, dritt);
      kern.geh('passt/wachstum', { ersetzen: true }); return;
    }
    if (ABSCHNITT[unter] && !dritt) return abschnitt(ctx, unter);
    kern.geh('passt', { ersetzen: true });
  }
};
