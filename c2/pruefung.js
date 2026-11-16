// Feinschliff – Prüfungssimulation nach dem Aufbau des C2-Formats (eigene Aufgaben, kein Prüfungsmaterial).
// Ganzes Modul: alle Teile hintereinander mit den Zeiten laut Format, keine Rückmeldung unterwegs, Auswertung am Ende
// (Punkte je Teil gewichtet auf 100, bestanden ab 60). Einzelner Teil: kurze Simulation für wenig Zeit.
import { esc, speicher, tag } from './speicher.js';
import { SYM } from './symbole.js';
import { lade, liste } from './daten.js';
import { waehle } from './wiederholung.js';
import { sitzung, kandidatenAus } from './ueben.js';
import { kopf } from './app.js';

// Zeiten und Gewichtung aus recherche/format.json (Goethe-Zertifikat C2: GDS, Stand 2025)
export const FORMAT = {
  lesen: { name: 'Lesen', dauer: 80, info: '80 Min. · 4 Teile', text: 'Kommentar, Sachtext, Reportage, kurze Texte', teile: [
    { id: 'L1', titel: 'Meinungstext genau verstehen', zeit: 25, punkte: 40, quelle: 'lesen', teil: 'Teil 1' },
    { id: 'L2', titel: 'Hauptaussagen den Abschnitten zuordnen', zeit: 20, punkte: 18, quelle: 'lesen', teil: 'Teil 2' },
    { id: 'L3', titel: 'Textrekonstruktion', zeit: 25, punkte: 18, quelle: 'lesen', teil: 'Teil 3' },
    { id: 'L4', titel: 'Schnelles, selektives Lesen', zeit: 10, punkte: 24, quelle: 'lesen', teil: 'Teil 4' }] },
  hoeren: { name: 'Hören', dauer: 35, info: 'ca. 35 Min. · 3 Teile', text: 'Radioausschnitte (1×), Gespräch (1×), Interview (2×)', teile: [
    { id: 'H1', titel: 'Radioausschnitte, einmal hören', punkte: 30, quelle: 'hoeren', teil: 'Teil 1' },
    { id: 'H2', titel: 'Gespräch: Wer meint was?', punkte: 20, quelle: 'hoeren', teil: 'Teil 2' },
    { id: 'H3', titel: 'Experteninterview, zweimal hören', punkte: 50, quelle: 'hoeren', teil: 'Teil 3' }] },
  schreiben: { name: 'Schreiben', dauer: 80, info: '80 Min. · 2 Teile', text: 'Umformulieren (20 Min.) und Text mit ca. 350 Wörtern (60 Min.)', teile: [
    { id: 'S1', titel: 'Text umformulieren', zeit: 20, punkte: 50, quelle: 'umformen' },
    { id: 'S2', titel: 'Textproduktion, ca. 350 Wörter', zeit: 60, punkte: 50, quelle: 'thema', selbst: true }] },
  sprechen: { name: 'Sprechen', dauer: 15, info: 'ca. 15 Min. + 15 Min. Vorbereitung', text: 'Vortrag (ca. 5 Min.) mit Nachfragen und Diskussion', teile: [
    { id: 'P1', titel: 'Vortrag mit Nachfragen (nach 15 Min. Vorbereitung)', zeit: 10, punkte: 50, quelle: 'thema', selbst: true },
    { id: 'P2', titel: 'Diskussion', zeit: 5, punkte: 50, quelle: 'thema', selbst: true, mitP1: true }] },
};
export const NOTEN = [[90, 'sehr gut'], [80, 'gut'], [70, 'befriedigend'], [60, 'ausreichend'], [0, 'nicht bestanden']];
export const note = (p) => NOTEN.find(([ab]) => p >= ab)[1];
export const teilPunkte = (t, richtig, gesamt) => (gesamt ? Math.round((t.punkte * richtig) / gesamt) : 0);
const S1_AUFGABEN = 10;

const gesehen = (b) => ({ ...speicher.lies('erledigt', {}), ...Object.fromEntries((speicher.lies('pruefung_texte', [])).map((k) => [k, 1])) });
async function textFuer(t) {   // ein Text dieses Teils, der in Simulationen noch nicht dran war
  const l = (await liste(t.quelle)).filter((x) => String(x.teil || '').startsWith(t.teil));
  if (!l.length) return null; const g = gesehen();
  const sim = speicher.lies('pruefung_texte', []); const k = (x) => `${t.quelle}/${x.id}`;
  // zuerst ganz neu, dann nur im Bereich geübt, sonst der am längsten nicht simulierte Text (statt Zufall)
  return l.find((x) => !g[k(x)]) || l.find((x) => !sim.includes(k(x))) || [...l].sort((a, b) => sim.lastIndexOf(k(a)) - sim.lastIndexOf(k(b)))[0];
}
async function themaFuer(art) {
  const l = await liste('themen'); if (!l.length) return null; const g = gesehen();
  return l.find((x) => !g[`${art}/${x.id}`]) || l[Math.floor(Math.random() * l.length)];
}
const merkeText = (k) => speicher.aendere('pruefung_texte', [], (x) => { const i = x.indexOf(k); if (i >= 0) x.splice(i, 1); x.push(k); });   // Reihenfolge = zuletzt simuliert hinten

export async function seite(view, modul, teil) {
  if (modul === 'grammatik') return grammatikTest(view);
  const m = FORMAT[modul];
  if (m && teil) return einzelTeil(view, modul, m.teile.find((t) => t.id === teil) || m.teile[0]);
  if (m) return modulStart(view, modul);
  const verlauf = speicher.lies('pruefungen', []).slice(-3).reverse();
  view.innerHTML = `${kopf('Prüfung', '#/heute', 'pruefung')}<div class="bereich-seite" data-bereich="pruefung">
    <p class="einleitung">Aufgebaut wie das Goethe-Zertifikat C2 (Großes Deutsches Sprachdiplom): vier Module, jedes einzeln mit 100 Punkten, bestanden ab 60. Alle Aufgaben sind eigene Übungen im Prüfungsformat.</p>
    <ul class="liste">${Object.entries(FORMAT).map(([id, x]) => `<li><a href="#/pruefung/${id}" data-bereich="${id}"><span class="l-sym">${SYM[id]}</span><span class="l-text"><b>${x.name}</b><small>${x.info}</small><small>${x.text}</small></span>${SYM.weiter}</a></li>`).join('')}
      <li><a href="#/pruefung/grammatik" data-bereich="grammatik"><span class="l-sym">${SYM.grammatik}</span><span class="l-text"><b>Grammatik-Test</b><small>20 Aufgaben · Korrektur am Ende</small><small>Strukturen sicher beherrschen (Grundlage für Schreiben Teil 1)</small></span>${SYM.weiter}</a></li></ul>
    ${verlauf.length ? `<section class="karte"><h3>Letzte Simulationen</h3><ul class="liste kompakt">${verlauf.map(zeileVerlauf).join('')}</ul></section>` : ''}
    <p class="leise">Wenig Zeit? In jedem Modul kannst du auch einen einzelnen Teil üben.</p></div>`;
}
const zeileVerlauf = (r) => `<li><span class="l-text"><b>${esc(FORMAT[r.modul]?.name || r.modul)} · ${!r.max ? 'Selbstkontrolle' : r.auto ? `${r.punkte} von ${r.max} Punkten (automatisch)` : `${r.punkte} Punkte · ${esc(note(r.punkte))}`}</b><small>${esc(r.tag)} · ${r.teile.map((t) => `${t.id} ${t.selbst ? 'selbst' : `${t.richtig}/${t.gesamt}`}`).join(' · ')}</small></span></li>`;

function modulStart(view, modul) {
  const m = FORMAT[modul];
  view.innerHTML = `${kopf(`Prüfung ${m.name}`, '#/pruefung', 'pruefung')}<div class="bereich-seite" data-bereich="${modul}">
    <section class="karte held"><div class="held-text"><span class="ueber">Ganzes Modul · ${esc(m.info)}</span><h2>${esc(m.name)} wie in der Prüfung</h2>
      <p>${modul === 'sprechen' ? '15 Minuten Vorbereitung mit Notizen, dann Vortrag und Diskussion. Nimm dich auf und hör dich danach an.' : 'Alle Teile hintereinander, mit den Zeiten der Prüfung. Keine Rückmeldung unterwegs – die Korrektur kommt am Ende.'}</p></div>
      <button class="knopf haupt gross" data-modul-start>${SYM.play} Simulation starten</button></section>
    <h3 class="zwischen">Oder einen Teil einzeln</h3>
    <ul class="liste">${m.teile.filter((t) => !t.mitP1).map((t) => `<li><a href="#/pruefung/${modul}/${t.id}"><span class="chip">${t.id}</span><span class="l-text"><b>${esc(t.titel)}</b><small>${t.zeit ? `${t.zeit} Min. · ` : ''}${t.selbst ? 'Selbstkontrolle' : `${t.punkte} von 100 Punkten`}</small></span>${SYM.weiter}</a></li>`).join('')}</ul></div>`;
  view.querySelector('[data-modul-start]').addEventListener('click', () => lauf(view, modul));
}

// Ein Teil: zeigt Text/Aufgaben im Prüfungsmodus und meldet {richtig, gesamt} zurück
async function teilZeigen(view, modul, t, { kopfzeile = '', fertig }) {
  const zurueck = `#/pruefung/${modul}`;
  if (t.quelle === 'lesen' || t.quelle === 'hoeren') {
    const e = await textFuer(t);
    if (!e) { view.innerHTML = `${kopf('Prüfung', zurueck, 'pruefung')}<p class="karte">Für ${esc(t.id)} gibt es noch keinen Text.</p>`; return; }
    merkeText(`${t.quelle}/${e.id}`);
    await (await import(`./${t.quelle}.js`)).seite(view, e.id, { modus: 'pruefung', zurueck, zeit_min: t.zeit, kopfzeile, onAbgabe: (r) => fertig({ richtig: r.richtig, gesamt: r.gesamt, text: e.titel }, view.querySelector('.ergebnis-box')) });
    return;
  }
  if (t.quelle === 'umformen') {
    const kand = []; for (const g of await liste('grammatik')) kand.push(...kandidatenAus(await lade(g.datei)).filter((k) => k.u.aus === 'umformen' || k.u.typ === 'umformen'));   // 0.2: Umformung bauen oder auswählen statt tippen
    view.innerHTML = `${kopfzeile}<div class="lesen-leiste"><span class="uhr-chip" data-uhr>${SYM.uhr} ${t.zeit}:00</span></div><div data-s1></div>`;
    const chip = view.querySelector('[data-uhr]'); let rest = t.zeit * 60;
    const uhr = setInterval(() => { if (!chip.isConnected) return clearInterval(uhr); rest--; chip.innerHTML = rest > 0 ? `${SYM.uhr} ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : `${SYM.uhr} Zeit um – bitte abgeben`; if (rest <= 0) { chip.classList.add('vorbei'); clearInterval(uhr); } }, 1000);
    const box = view.querySelector('[data-s1]');
    sitzung(box, { titel: `${t.id}: ${t.titel}`, bereich: 'grammatik', eintraege: waehle(kand, S1_AUFGABEN), modus: 'pruefung', zurueck,
      onEnde: (erg, eintr) => { clearInterval(uhr); fertig({ richtig: erg.filter((r) => r?.erg?.richtig).length, gesamt: eintr.length }, box.querySelector('.s-fuss')); } });
    return;
  }
  const art = modul === 'sprechen' ? 'sprechen' : 'schreiben'; const e = await themaFuer(art);
  if (!e) { view.innerHTML = `${kopf('Prüfung', zurueck, 'pruefung')}<p class="karte">Noch keine Themen vorhanden.</p>`; return; }
  merkeText(`${art}/${e.id}`);
  await (await import('./schreiben.js')).seite(view, e.id, art, { pruefung: true, zurueck, kopfzeile, onFertig: (r) => fertig({ selbst: true, ...r, text: e.thema }, null) });
}
async function einzelTeil(view, modul, t) {
  await teilZeigen(view, modul, t, { fertig: (r, ort) => { if (!ort || r.selbst) return; ort.insertAdjacentHTML('beforeend', `<p class="leise">${esc(t.id)}: ${teilPunkte(t, r.richtig, r.gesamt)} von ${t.punkte} Punkten im Prüfungsmaßstab.</p><a class="knopf zweit breit" href="#/pruefung/${modul}">Zurück zum Modul</a>`); } });
}
// Ganzes Modul
async function lauf(view, modul) {
  const m = FORMAT[modul]; const teile = m.teile.filter((t) => !t.mitP1); const erg = []; const start = Date.now(); const hash = location.hash;
  const leiste = (k) => `<div class="modul-leiste karte klein" data-modul-leiste><span class="ueber">Simulation ${esc(m.name)} · ${teile[k].id} von ${teile.length} Teilen</span><b>${esc(teile[k].titel)}</b><small class="leise">${teile[k].zeit ? `${teile[k].zeit} Min. für diesen Teil · ` : ''}Gesamt ${m.dauer} Min.</small></div>`;
  const schritt = async (k) => {
    if (location.hash !== hash) return;
    if (k >= teile.length) return auswertung(view, modul, erg, Math.round((Date.now() - start) / 60000));
    const t = teile[k];
    await teilZeigen(view, modul, t, { kopfzeile: leiste(k), fertig: (r, ort) => {
      erg[k] = { id: t.id, titel: t.titel, punkte: r.selbst ? null : teilPunkte(t, r.richtig, r.gesamt), max: t.punkte, ...r };
      if (r.selbst && modul === 'sprechen') erg.push({ id: 'P2', titel: m.teile[1].titel, selbst: true, max: m.teile[1].punkte, haken: r.haken, von: r.von });
      const weiter = k + 1 < teile.length ? `Weiter: ${teile[k + 1].id} ${teile[k + 1].titel}` : 'Zur Auswertung';
      if (!ort) return schritt(k + 1);
      ort.insertAdjacentHTML('beforeend', `<button class="knopf haupt breit" data-naechster>${esc(weiter)}</button>`);
      ort.querySelector('[data-naechster]').addEventListener('click', () => { scrollTo(0, 0); schritt(k + 1); });
    } });
    view.querySelector('.seitenkopf')?.insertAdjacentHTML('afterend', view.querySelector('[data-modul-leiste]') ? '' : leiste(k));
  };
  schritt(0);
}
function auswertung(view, modul, erg, minuten) {
  const m = FORMAT[modul]; const auto = erg.filter((r) => !r.selbst); const selbst = erg.filter((r) => r.selbst);
  const punkte = auto.reduce((a, r) => a + r.punkte, 0); const max = auto.reduce((a, r) => a + r.max, 0);
  const voll = max === 100; const quote = max ? Math.round((punkte / max) * 100) : 0;
  speicher.aendere('pruefungen', [], (x) => { x.push({ tag: tag(), modul, punkte, max, auto: !voll, minuten, teile: erg.map((r) => ({ id: r.id, richtig: r.richtig, gesamt: r.gesamt, selbst: !!r.selbst })) }); if (x.length > 50) x.splice(0, x.length - 50); });
  const zeile = (r) => r.selbst
    ? `<li><span class="chip">${esc(r.id)}</span><span class="l-text"><b>${esc(r.titel)}</b><small>Selbstkontrolle${r.von ? `: ${r.haken} von ${r.von} Punkten der Checkliste` : ''}${r.woerter != null ? ` · ${r.woerter} Wörter` : ''} · mit der KI-Vorlage korrigieren lassen</small></span></li>`
    : `<li><span class="chip">${esc(r.id)}</span><span class="l-text"><b>${esc(r.titel)}</b><small>${r.richtig} von ${r.gesamt} richtig${r.text ? ` · ${esc(r.text)}` : ''}</small></span><span class="teil-punkte"><b>${r.punkte}</b>/${r.max}</span><span class="balken mini"><i style="width:${Math.round((r.punkte / r.max) * 100)}%"></i></span></li>`;
  view.innerHTML = `${kopf(`Auswertung ${m.name}`, `#/pruefung/${modul}`, 'pruefung')}<div class="bereich-seite auswertung" data-bereich="${modul}">
    <section class="karte">${max ? `<div class="ergebnis-kopf"><div class="ring" style="--w:${quote}">${voll ? punkte : `${quote} %`}</div><div><h3>${voll ? `${punkte} von 100 Punkten` : `${punkte} von ${max} Punkten`}</h3>
      <p class="leise">${voll ? `${esc(note(punkte))} · ${punkte >= 60 ? 'bestanden (ab 60 Punkten)' : 'bestanden ab 60 Punkten'}` : 'automatisch bewertet; der Rest ist Selbstkontrolle'}</p></div></div>` : `<h3>Geschafft</h3><p class="leise">Sprechen wird nicht automatisch bewertet. Hör dir deine Aufnahme an und nutze die Vorlage für Sprech-Feedback.</p>`}
      <ul class="liste kompakt teile-liste">${erg.map(zeile).join('')}</ul>
      <p class="leise">${minuten ? `${minuten} Min. gebraucht · ` : ''}Notenstufen: ab 90 sehr gut, ab 80 gut, ab 70 befriedigend, ab 60 ausreichend.</p></section>
    ${auto.length ? `<p class="leise">Die Korrektur jeder Aufgabe steht nach „Zurück“ nicht mehr zur Verfügung – schau sie dir in den Teilen direkt nach der Abgabe an.</p>` : ''}
    <a class="knopf haupt breit" href="#/pruefung">Fertig</a><a class="knopf zweit breit" href="#/fortschritt">Zum Fortschritt</a></div>`;
  scrollTo(0, 0);
}
async function grammatikTest(view) {
  const kand = []; for (const e of await liste('grammatik')) kand.push(...kandidatenAus(await lade(e.datei)));
  sitzung(view, { titel: 'Grammatik-Test', bereich: 'grammatik', eintraege: waehle(kand, 20), modus: 'pruefung', zurueck: '#/pruefung' });
}
export const _intern = { FORMAT, esc };
