// M3 textspiegel – Text-Spiegel: 4 Schreibaufgaben, lokale Wortzählung als „Spiegel, kein Urteil“, Vergleich mit dem Fragebogen
// als Gesprächsanstoß, „Mit Claude tiefer lesen“ (nur Text zum Kopieren – die App sendet nichts), Blindtest. Vertrag: ARCH.md §2–§4.
// Routen: text · text/schreiben/<aufgabe> · text/spiegel · text/claude · text/blindtest
// Ergebnis: textspiegel (ARCH §3.3, ohne Texte). Modul-Daten m.textspiegel: { texte, muttersprache, wirkung, blind, sig }.
import { kern } from '../../kern.js';
import * as A from './analyse.js';
import * as X from './texte.js';
import { GRUPPEN, ANZAHL } from './woerter.js';

const M = 'textspiegel';
const ui = kern.ui, S = kern.speicher;
const { esc, sym, marke, aussage } = ui;
const lies = (k, std) => { const v = S.lies(M, k, std); return v == null ? std : v; };
const schreib = (k, v) => S.schreib(M, k, v);
const texte = () => ({ ...(lies('texte', {}) || {}) });
const alter = () => kern.einst().alter;
const jung = () => alter() === 'u16';
const unter18 = () => alter() === 'u16' || alter() === '16-17';
const zahl = (x) => String(x).replace('.', ',');
const SITZ = { namen: '', claude: null, antwort: '', blind: null };     // nur Arbeitsspeicher dieser Sitzung, nie gespeichert

const merk = () => S.einwilligung() ? '' :
  `<div class="hinweis gelb" data-ts-merk><p><b>Nur für jetzt:</b> Deine Texte sind nicht gemerkt und nach dem Schließen weg.</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
function binde(el, aktionen = {}, extra = []) {
  const klick = (e) => { const b = e.target.closest('[data-ts]'); if (b && el.contains(b) && aktionen[b.dataset.ts]) { e.preventDefault(); aktionen[b.dataset.ts](b, e); } };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', () => el.querySelectorAll('[data-ts-merk]').forEach((m) => { if (S.einwilligung()) m.remove(); }));
  return () => { el.removeEventListener('click', klick); aus(); extra.forEach((f) => { try { f(); } catch {} }); };
}
const neu = () => kern.geh(kern.route().hash, { ersetzen: true });

export default {
  id: M,
  schema: 1,
  migriere(daten) { return daten; },
  start(k) {
    k.ui.ladeStil(new URL('./stil.css', import.meta.url).href);
    // „Alles löschen“ und „Sicherung laden“: auch die Sitzungs-Eingaben (Namen, Claude-Text, Antwort, Blindtest) vergessen
    const vergiss = () => { SITZ.namen = ''; SITZ.claude = null; SITZ.antwort = ''; SITZ.blind = null; };
    k.on('geloescht', vergiss); k.on('importiert', vergiss);
  },
  ansicht(ctx) {
    const teil = ctx.pfad[1];
    if (teil === 'schreiben') return schreiben(ctx);
    if (teil === 'spiegel') return spiegel(ctx);
    if (teil === 'claude') return claude(ctx);
    if (teil === 'blindtest') return blindtest(ctx);
    return uebersicht(ctx);
  }
};

// ======================================================================= Übersicht
function uebersicht({ el, titel }) {
  titel('Text-Spiegel');
  const t = texte(), n = Object.fromEntries(X.REIHE.map((id) => [id, A.zaehleWoerter(t[id] || '')]));
  const ges = Object.values(n).reduce((s, x) => s + x, 0);
  const stand = ges < A.GRENZEN.min ? `Ab ${A.GRENZEN.min} Wörtern gibt es einen ersten Spiegel.`
    : ges < A.GRENZEN.stil ? `Noch ${A.GRENZEN.stil - ges} Wörter bis zu schwachen Hinweisen.` : 'Genug für schwache Hinweise.';
  el.innerHTML = `<h2>Text-Spiegel</h2>
    <p class="lead">Vier kurze Schreibaufgaben. Danach zeigt dir die App, wie deine Texte gebaut sind – ein Spiegel, kein Urteil.</p>
    <ol class="zeilen">${X.AUFGABEN.map((a, i) => `<li><a class="zeile" href="#text/schreiben/${a.id}"><span><b>${i + 1}. ${esc(a.titel)}</b><small>${n[a.id] ? n[a.id] + (n[a.id] === 1 ? ' Wort' : ' Wörter') : 'noch offen'}</small></span><span class="rechts">${n[a.id] >= A.GRENZEN.ziel[0] ? sym('haken') + '<span class="sr">fertig</span>' : ''}${sym('weiter')}</span></a></li>`).join('')}</ol>
    <div class="karte weich">${ui.fortschritt(Math.min(1, ges / A.GRENZEN.stil), 'Wörter bis zum vollen Spiegel')}
      <p class="klein"><b>${ges} ${ges === 1 ? 'Wort' : 'Wörter'}</b> · ${esc(stand)}</p>
      <a class="knopf haupt voll" href="#text/spiegel">Spiegel ansehen</a></div>
    <p class="hinweis">Bitte nur <b>eigene</b> Texte – keine Chats oder Nachrichten von anderen Menschen.</p>
    <details class="karte"><summary>Was der Spiegel kann – und was nicht</summary>
      <h4>Er kann</h4><ul><li>Wörter in 14 Gruppen zählen, mit einem eigenen deutschen Wörterbuch (${ANZAHL} Einträge).</li>
        <li>Verhältnisse zeigen, etwa „mehr nach vorn als zurück“ – immer mit den gefundenen Wörtern als Beleg.</li>
        <li>Dir Fragen zu deinen Texten stellen.</li><li>Alles auf dem Gerät rechnen, in Millisekunden. Nichts wird gesendet.</li></ul>
      <h4>Er kann nicht</h4><ul><li>${aussage({ text: 'Deine Persönlichkeit sicher erkennen: Einzelne Wortgruppen hängen nur sehr schwach mit Persönlichkeit zusammen (r ≈ .1).', stufe: 'belegt', quellen: ['koutsoumpis2022'], tag: 'span' })}</li>
        <li>Krankheiten erkennen – und er tut auch nicht so.</li><li>Ironie, Zitate oder Zusammenhänge verstehen.</li></ul></details>
    ${merk()}
    ${ges ? `<button type="button" class="knopf gefahr klein" data-ts="loeschen">${sym('loeschen')} Alle Texte löschen</button>` : ''}
    ${ui.fuss()}`;
  return binde(el, {
    loeschen: async () => {
      if (!(await ui.bestaetige({ titel: 'Alle Texte löschen?', text: 'Deine vier Texte und dein Text-Spiegel werden von diesem Gerät gelöscht.', ja: 'Löschen', gefahr: true }))) return;
      S.loescheModul(M); S.loescheErgebnis(M); SITZ.claude = null; SITZ.blind = null; ui.meldung('Texte gelöscht.'); neu();
    }
  });
}

// ======================================================================= Schreiben
function schreiben({ el, titel, zurueckZu, pfad }) {
  const id = pfad[2], a = X.AUFGABE[id];
  if (!a) { kern.geh('text', { ersetzen: true }); return; }
  titel('Text-Spiegel'); zurueckZu('text');
  const i = X.REIHE.indexOf(id), naechste = X.AUFGABEN[i + 1];
  const wert = texte()[id] || '';
  el.innerHTML = `<p class="klein leise ts-schritt">Aufgabe ${i + 1} von ${X.AUFGABEN.length}</p>
    <h2>${esc(a.titel)}</h2>
    <p class="lead" id="ts-frage">${esc(a.frage)}</p>
    <details class="ts-details"><summary>Ideen zum Anfangen</summary><ul>${a.hilfen.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></details>
    <label class="sr" for="ts-feld">Dein Text: ${esc(a.titel)}</label>
    <textarea id="ts-feld" class="feld ts-feld" lang="de" spellcheck="true" autocapitalize="sentences" autocomplete="off" maxlength="8000" aria-describedby="ts-frage ts-tipp">${esc(wert)}</textarea>
    <div class="ts-zaehler" aria-hidden="true"><span id="ts-balken"></span><span id="ts-zahl"></span></div>
    <p class="sr" id="ts-live" aria-live="polite"></p>
    <p id="ts-tipp" class="leise klein">Schreib so, wie du sprichst. ${A.GRENZEN.ziel[0]} bis ${A.GRENZEN.ziel[1]} Wörter reichen, Rechtschreibung ist egal. Schreib nur, was du teilen magst.</p>
    <div id="ts-hilfe"></div>
    <div class="stapel">${naechste ? `<a class="knopf haupt" href="#text/schreiben/${naechste.id}">Weiter: ${esc(naechste.titel)}</a>` : '<a class="knopf haupt" href="#text/spiegel">Zum Spiegel</a>'}
      <a class="knopf zweit" href="#text">Zur Übersicht</a></div>
    ${merk()}${ui.fuss()}`;
  const feld = el.querySelector('#ts-feld');
  let tSpeichern = 0, tLive = 0, tKrise = 0, offen = false;
  const zeigeZahl = () => {
    const n = A.zaehleWoerter(feld.value), [z0, z1] = A.GRENZEN.ziel;
    el.querySelector('#ts-balken').innerHTML = ui.fortschritt(Math.min(1, n / z0), 'Wörter');
    el.querySelector('#ts-zahl').textContent = `${n} ${n === 1 ? 'Wort' : 'Wörter'} · ${n < z0 ? `Ziel ${z0}–${z1}` : n <= z1 ? 'gut so' : 'gern auch mehr'}`;
    return n;
  };
  const speichern = () => { clearTimeout(tSpeichern); if (!offen) return; offen = false; schreib('texte', { ...texte(), [id]: feld.value }); };
  const pruefeKrise = () => {
    const h = el.querySelector('#ts-hilfe'); if (!h) return;
    const an = A.krise({ [id]: feld.value }).an;
    if (an && !h.firstChild) h.innerHTML = ui.hilfeKarte({ titel: 'Wenn es dir gerade nicht gut geht', text: 'Was du schreibst, klingt nach großer Not. Du musst das nicht allein tragen. Die TelefonSeelsorge ist kostenlos, anonym und rund um die Uhr da.' }) + (unter18() && !ui.HILFE_JUNG ? jugendNummer() : '');   // Kern zeigt 116 111 unter 18 selbst
    if (!an) h.innerHTML = '';
  };
  zeigeZahl(); pruefeKrise();
  const eingabe = () => {
    const n = zeigeZahl(); offen = true;
    clearTimeout(tSpeichern); tSpeichern = setTimeout(speichern, 400);
    clearTimeout(tLive); tLive = setTimeout(() => { const l = el.querySelector('#ts-live'); if (l) l.textContent = `${n} Wörter`; }, 1500);
    clearTimeout(tKrise); tKrise = setTimeout(pruefeKrise, 700);
  };
  feld.addEventListener('input', eingabe);
  feld.addEventListener('blur', speichern);
  // Neuladen, App-Wechsel oder Schließen kurz nach dem Tippen: sofort sichern (sonst wären die letzten 400 ms weg)
  const versteckt = () => { if (document.visibilityState === 'hidden') speichern(); };
  window.addEventListener('pagehide', speichern); document.addEventListener('visibilitychange', versteckt);
  return binde(el, {}, [() => { speichern(); clearTimeout(tLive); clearTimeout(tKrise); feld.removeEventListener('input', eingabe); feld.removeEventListener('blur', speichern);
    window.removeEventListener('pagehide', speichern); document.removeEventListener('visibilitychange', versteckt); }]);
}
const jugendNummer = () => `<section class="karte hilfe" aria-label="Hilfe für Kinder und Jugendliche"><a class="tel" href="tel:116111"><span>Nummer gegen Kummer – für Kinder und Jugendliche (Mo–Sa 14–20 Uhr)</span><b>116 111</b></a></section>`;

// ======================================================================= Krise: keine Auswertung, nur Hilfe
function kriseAnsicht(el, kr, titelText = 'Dein Text-Spiegel') {
  el.innerHTML = `<h2>${esc(titelText)}</h2>
    ${ui.hilfeKarte({ titel: 'Wenn es dir gerade nicht gut geht', text: 'In deinem Text stehen Worte, die nach großer Not klingen. Darum zeigt die App hier keine Auswertung. Du musst das nicht allein tragen. Die TelefonSeelsorge ist kostenlos, anonym und rund um die Uhr da.' })}
    ${unter18() && !ui.HILFE_JUNG ? jugendNummer() : ''}
    <p class="klein">Gefunden in: ${kr.aufgaben.map((id) => `„${esc(X.titelVon(id))}“`).join(', ')}. War es nur eine Redewendung oder ein Zitat, kannst du die Stelle ändern – dann zeigt der Spiegel wieder eine Auswertung.</p>
    <div class="stapel">${kr.aufgaben.map((id) => `<a class="knopf zweit" href="#text/schreiben/${id}">Text „${esc(X.titelVon(id))}“ öffnen</a>`).join('')}</div>
    ${ui.fuss()}`;
  return binde(el);
}
function zuKurz(el, an) {
  el.innerHTML = `<h2>Dein Text-Spiegel</h2>
    <div class="karte"><p class="lead">Schreib noch etwas mehr.</p>
      <p>Bisher ${an.woerter} ${an.woerter === 1 ? 'Wort' : 'Wörter'}. Unter ${A.GRENZEN.min} Wörtern wäre jede Aussage Zufall – darum zeigt der Spiegel noch nichts.</p>
      <a class="knopf haupt voll" href="#text/schreiben/${X.REIHE.find((id) => A.zaehleWoerter(texte()[id] || '') < A.GRENZEN.ziel[0]) || X.REIHE[0]}">Weiterschreiben</a></div>
    ${ui.fuss()}`;
  return binde(el);
}

// ======================================================================= Spiegel
function speichereErgebnis(an, ms, saetze) {
  const sig = A.fingerabdruck({ t: texte(), ms });
  const alt = S.ergebnis(M);
  if (lies('sig', null) === sig && alt) return;
  const ersetzen = !!(alt && alt.zeit && Date.now() - new Date(alt.zeit).getTime() < 12 * 3600 * 1000);
  S.setzeErgebnis(M, {
    schema: 1, woerter: an.woerter, umfang: an.umfang, muttersprache: ms,
    aufgaben: Object.fromEntries(Object.entries(an.aufgaben).map(([id, a]) => [id, { woerter: a.woerter }])),
    merkmale: Object.fromEntries(Object.entries(an.merkmale).map(([k, m]) => [k, { anzahl: m.anzahl, pro100: m.pro100 }])),
    satzlaenge: an.satzlaenge.unklar ? null : an.satzlaenge.mittel, vielfalt: an.vielfalt.wert,
    deutungen: saetze.filter((s) => s.stufe).map((s) => ({ text: s.text, stufe: s.stufe, quellen: s.quellen || [] })),
    quellen: ['koutsoumpis2022', 'dodds2015', 'carey2015', 'chen2020', 'tackman2019']
  }, { ersetzen });
  schreib('sig', sig);
}
function waageHtml(an, W) {
  const w = X.waageWerte(an, W), s = w.a + w.b, pa = s ? Math.round((w.a / s) * 100) : 50;
  return `<div class="ts-waage" role="img" aria-label="${esc(`${W.links}: ${w.a}, ${W.rechts}: ${w.b}`)}"><span class="ts-waage-a" style="width:${pa}%"></span><span class="ts-waage-b" style="width:${100 - pa}%"></span></div>
    <div class="ts-pole" aria-hidden="true"><span><i class="ts-punkt ts-punkt-a"></i>${esc(W.links)} <b>${w.a}</b></span><span><b>${w.b}</b> ${esc(W.rechts)} <i class="ts-punkt ts-punkt-b"></i></span></div>`;
}
function belegeHtml(an, gruppen) {
  return gruppen.map((g) => { const m = an.merkmale[g];
    return `<p class="klein ts-beleg"><b>${esc(GRUPPEN[g].name)}</b> ${zahl(m.pro100)} von 100 Wörtern · ${m.anzahl}×${m.belege.length ? ` – ${esc(X.belegListe(m.belege, 5))}` : ''}</p>`; }).join('');
}
const satzHtml = (s) => s.stufe ? aussage({ text: s.text, stufe: s.stufe, quellen: s.quellen || [], kosten: s.kosten || '' }) : `<p>${esc(s.text)}</p>`;

function spiegel({ el, titel, zurueckZu }) {
  titel('Text-Spiegel'); zurueckZu('text');
  const t = texte(), kr = A.krise(t);
  if (kr.an) return kriseAnsicht(el, kr);
  const an = A.analysiere(t, X.REIHE);
  if (an.umfang === 'zu-kurz') return zuKurz(el, an);
  const ms = lies('muttersprache', null);
  const deuten = an.umfang === 'hinweise' && ms !== false;
  const reihen = X.WAAGEN.map((W) => ({ W, saetze: X.waageSaetze(an, W, { deuten }) }));
  speichereErgebnis(an, ms, reihen.flatMap((r) => r.saetze));
  const k = Object.values(an.aufgaben).filter((a) => a.woerter > 0).length;
  const stufeText = an.umfang === 'stil'
    ? `Unter ${A.GRENZEN.stil} Wörtern beschreibt der Spiegel nur diese Texte – nicht dich. Noch ${A.GRENZEN.stil - an.woerter} Wörter bis zu schwachen Hinweisen.`
    : ms === false ? 'Der Spiegel zeigt nur den Stil, weil Deutsch nicht deine Muttersprache ist.'
      : 'Ab 300 Wörtern zeigt der Spiegel schwache Hinweise. Schwach heißt: Sie können genauso gut danebenliegen.';
  const skala = X.SKALA.map((z) => `<li><span>${esc(z.name)}${z.stufe ? ' ' + marke(z.stufe, z.quellen) : ''}<br><span class="klein leise">${esc(z.notiz)}</span></span><b>${z.wert} von 100</b><span class="ts-bar" aria-hidden="true"><span style="width:${Math.round(((z.wert - 50) / 35) * 100)}%"></span></span></li>`).join('');
  const skalaLabel = 'Treffer bei über oder unter dem Durchschnitt: ' + X.SKALA.map((z) => `${z.name} ${z.wert} von 100`).join(', ');
  const absolut = an.merkmale.absolut;
  el.innerHTML = `<h2>Dein Text-Spiegel</h2>
    <p class="lead">Spiegel, kein Urteil: Die App hat die Wörter in deinen Texten gezählt und zeigt, wie sie gebaut sind.</p>
    <div class="karte akzent"><p><b>${an.woerter} Wörter aus ${k} ${k === 1 ? 'Text' : 'Texten'}</b> · ${an.umfang === 'stil' ? 'nur Stil' : deuten ? 'schwache Hinweise' : 'nur Stil'}</p><p class="klein">${esc(stufeText)}</p>
      ${jung() ? '<p class="klein">Dein Schreibstil verändert sich in deinem Alter noch stark. Nimm alles als Momentaufnahme.</p>' : ''}</div>
    ${an.umfang === 'hinweise' ? mutterspracheHtml(ms) : ''}
    <section class="karte"><h3>Wie viel verrät ein Text?</h3>
      <p class="klein">Wie oft liegt eine Methode richtig, wenn sie sagt, ob du bei einem Merkmal über oder unter dem Durchschnitt liegst?</p>
      <ul class="ts-skala" role="img" aria-label="${esc(skalaLabel)}">${skala}</ul>
      <p class="klein leise">Die Wortzählung hier liegt also kaum über einem Münzwurf. Darum zeigt sie Zahlen und Fragen, keine Urteile. ${marke('abgeleitet', ['koutsoumpis2022', 'moreno2021'])}</p></section>
    ${reihen.map(({ W, saetze }) => `<section class="karte"><h3>${esc(W.titel)}</h3>${waageHtml(an, W)}${saetze.map(satzHtml).join('')}
      <details class="ts-details"><summary>Gefundene Wörter</summary>${belegeHtml(an, [W.a, ...(Array.isArray(W.b) ? W.b : [W.b])].concat(W.id === 'wer' ? ['man'] : []))}</details></section>`).join('')}
    <section class="karte"><h3>Absolute Wörter</h3>
      <p>${absolut.anzahl ? `${absolut.anzahl}-mal Wörter wie ${esc(X.belegListe(absolut.belege, 4))} – ${zahl(absolut.pro100)} von 100 Wörtern.` : 'Keine Wörter wie „immer“, „nie“ oder „alles“.'}</p>
      <p class="klein leise">Solche Wörter machen Aussagen absolut. Die App zählt sie nur – ob das bei dir etwas bedeutet, kann eine Zählung nicht sagen.</p></section>
    <section class="karte"><h3>Stil</h3><ul>${X.stilSaetze(an).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <details class="ts-details"><summary>Je Aufgabe</summary>${tabelle(an)}</details></section>
    ${deuten ? vergleichHtml(an) : `<p class="hinweis klein">Ab ${A.GRENZEN.stil} Wörtern${ms === false ? ' und mit Deutsch als Muttersprache' : ''} zeigt der Spiegel auch Selbstbild und Text nebeneinander.</p>`}
    <section class="karte weich"><h3>Fragen an dich ${marke('idee')}</h3><p class="klein leise">Nachfragen statt Urteil – die Antwort weißt nur du.</p>
      <ul>${X.nachfragen(an).map((f) => `<li>${esc(f)}</li>`).join('')}</ul></section>
    <section class="karte weich"><h3>Was das nicht heißt</h3><ul>${X.NICHT_HEISST.map((s) => `<li>${s.stufe ? aussage({ ...s, tag: 'span' }) : esc(s.text)}</li>`).join('')}</ul></section>
    <a class="karte" href="#text/claude"><span><b>Mit Claude tiefer lesen</b><br><span class="klein leise">${unter18() ? 'erst ab 18' : 'Text zum Kopieren in deine eigene Claude-App – die App sendet nichts'}</span></span><span class="rechts">${sym('weiter')}</span></a>
    <a class="karte" href="#text/blindtest"><span><b>Blindtest</b><br><span class="klein leise">Erkennst du die Beschreibung deiner Texte unter dreien?</span></span><span class="rechts">${sym('weiter')}</span></a>
    <details class="karte"><summary>So zählt der Spiegel</summary><ul class="klein">
      <li>Eigenes deutsches Wörterbuch mit ${ANZAHL} Einträgen in 14 Gruppen. Fremde Wortlisten (zum Beispiel LIWC) werden nicht benutzt.</li>
      <li>Ein „nicht“ oder „kein“ bis zu 3 Wörter vor einem Gefühlswort dreht es um – dann zählt es nicht mit.</li>
      <li>Sätze enden an Punkt, Ausrufe- oder Fragezeichen und am Zeilenende. „z. B.“ und ähnliche Abkürzungen beenden keinen Satz.</li>
      <li>${aussage({ text: 'Wortvielfalt über ein gleitendes Fenster von 50 Wörtern – so hängt sie kaum von der Textlänge ab.', stufe: 'belegt', quellen: ['covington2010'], tag: 'span' })}</li>
      <li>${aussage({ text: 'Kleine Wörter wie ich, wir, nicht oder weil zu zählen ist eine bekannte Methode – mit kleinen Effekten.', stufe: 'belegt', quellen: ['tausczik2010'], tag: 'span' })}</li>
      <li>${aussage({ text: 'Absolute Wörter kamen in Studien in Online-Foren über seelische Belastungen häufiger vor. Das ist ein Befund über Foren, nicht über einzelne Menschen – darum zeigt die App dazu keine Warnung.', stufe: 'belegt', quellen: ['almosaiwi2018'], tag: 'span' })}</li>
      <li>Die Auswertung dauerte ${zahl(an.ms)} ms, hier auf dem Gerät. Nichts wurde gesendet.</li></ul></details>
    ${merk()}${ui.fuss()}`;
  return binde(el, {
    mutter: (b) => { schreib('muttersprache', b.dataset.wert === 'ja'); neu(); },
    mutterAendern: () => { schreib('muttersprache', undefined); neu(); },
    wirkung: (b) => {
      const w = { ...(lies('wirkung', {}) || {}), [b.dataset.bereich]: b.dataset.wert }; schreib('wirkung', w);
      const box = el.querySelector(`#ts-vgl-${b.dataset.bereich}`); if (!box) return;
      box.querySelectorAll('[data-ts=wirkung]').forEach((c) => c.setAttribute('aria-checked', String(c === b)));
      const bf = S.ergebnis('bigfive'), r = X.vergleichAntwort(b.dataset.wert, bf.bereiche[b.dataset.bereich].stufe);
      box.querySelector('.ts-antwort').innerHTML = aussage({ text: r.text, stufe: r.stufe || 'idee', quellen: r.quellen || [] });
    }
  });
}
function mutterspracheHtml(ms) {
  if (ms === false) return `<p class="hinweis klein">Du hast gesagt: Deutsch ist nicht deine Muttersprache. <button type="button" class="link" data-ts="mutterAendern">Ändern</button></p>`;
  if (ms === true) return '';
  return `<section class="karte"><h3 id="ts-ms">Ist Deutsch deine Muttersprache?</h3>
    <p class="klein">Bei Menschen, die Deutsch lernen, misst eine Wortzählung vor allem das Sprachniveau. Dann zeigt der Spiegel nur den Stil.</p>
    <div class="chips" role="radiogroup" aria-labelledby="ts-ms"><button type="button" class="chip" role="radio" aria-checked="false" data-ts="mutter" data-wert="ja">Ja</button><button type="button" class="chip" role="radio" aria-checked="false" data-ts="mutter" data-wert="nein">Nein</button></div></section>`;
}
function tabelle(an) {
  const sp = [['woerter', 'Wörter'], ['ich', 'Ich'], ['freude', 'Freude'], ['belastung', 'Belastung'], ['zukunft', 'Zukunft']];
  return `<table class="ts-tabelle"><caption class="sr">Zahlen je Aufgabe (Anzahl)</caption><thead><tr><th scope="col">Aufgabe</th>${sp.map(([, n]) => `<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>
    ${X.AUFGABEN.map((a, i) => { const x = an.aufgaben[a.id]; return `<tr><th scope="row"><abbr title="${esc(a.titel)}">${i + 1}. ${esc(a.kurz)}</abbr></th>${sp.map(([k]) => `<td>${k === 'woerter' ? x.woerter : x.merkmale[k]}</td>`).join('')}</tr>`; }).join('')}</tbody></table>`;
}
function vergleichHtml(an) {
  const bf = S.ergebnis('bigfive');
  if (!bf || bf.schema !== 1 || !bf.bereiche) return `<section class="karte"><h3>Selbstbild und Text</h3><p>Für diesen Vergleich fehlt noch dein Fragebogen zur Persönlichkeit.</p><a class="knopf zweit voll" href="#fragen/bigfive">Zum Fragebogen</a></section>`;
  const wirkung = lies('wirkung', {}) || {};
  return `<section class="karte" id="ts-vergleich"><h3>Selbstbild und Text</h3>
    <p class="klein">Nur ein Gesprächsanstoß: Der Fragebogen zeigt, wie du dich selbst siehst. Ein Text zeigt eher, wie du wirken könntest.</p>
    ${X.VERGLEICH.map((V) => { const b = bf.bereiche[V.bereich]; if (!b || b.unten == null) return '';
      const ant = wirkung[V.bereich], r = ant ? X.vergleichAntwort(ant, b.stufe) : null;
      return `<div class="ts-vgl" id="ts-vgl-${V.bereich}"><h4>${esc(V.name)}</h4>
        <p><b>Fragebogen:</b> ${esc(b.wort || '')} (Bereich ${Math.round(b.unten)} bis ${Math.round(b.oben)})</p>
        <p><b>Text:</b> ${esc(X.textSeite(an, V))}</p>
        ${aussage(V.forschung)}
        <p id="ts-f-${V.bereich}"><b>${esc(V.frage)}</b></p>
        <div class="chips" role="radiogroup" aria-labelledby="ts-f-${V.bereich}">${V.optionen.map(([w, txt]) => `<button type="button" class="chip" role="radio" aria-checked="${ant === w}" data-ts="wirkung" data-bereich="${V.bereich}" data-wert="${w}">${esc(txt)}</button>`).join('')}</div>
        <div class="ts-antwort" aria-live="polite">${r ? aussage({ text: r.text, stufe: r.stufe || 'idee', quellen: r.quellen || [] }) : ''}</div>
        <a class="link" href="#fragen/bigfive/vertiefung?bereich=${V.bereich}">Genauer nachfragen – das Urteil kommt aus dem Fragebogen</a></div>`; }).join('')}</section>`;
}

// ======================================================================= Mit Claude tiefer lesen (nur Text zum Kopieren)
function claude({ el, titel, zurueckZu }) {
  titel('Mit Claude tiefer lesen'); zurueckZu('text/spiegel');
  const t = texte(), kr = A.krise(t);
  if (kr.an) return kriseAnsicht(el, kr, 'Mit Claude tiefer lesen');
  const an = A.analysiere(t, X.REIHE);
  if (an.umfang === 'zu-kurz') return zuKurz(el, an);
  if (unter18()) {
    el.innerHTML = `<h2>Mit Claude tiefer lesen</h2><div class="karte"><p>Claude darf man laut den Nutzungsbedingungen von Anthropic erst ab 18 Jahren nutzen. Darum bietet die App das hier nicht an.</p>
      <p>Der Spiegel und die Fragen an dich funktionieren ohne Claude.</p><a class="knopf zweit voll" href="#text/spiegel">Zurück zum Spiegel</a></div>${ui.fuss()}`;
    return binde(el);
  }
  const male = () => {
    el.innerHTML = `<h2>Mit Claude tiefer lesen</h2>
      <p class="lead">Die App stellt einen fertigen Text zusammen: eine Anleitung für Claude, deine vier Texte und dein Fragebogen-Ergebnis. Du kopierst ihn selbst in deine eigene Claude-App.</p>
      <div class="hinweis gelb"><p><b>Wichtig:</b> Die App sendet nichts. Aber wenn du den Text in Claude einfügst, verlässt er dein Gerät – er geht unter deinem Claude-Konto an Anthropic.</p>
        <p class="klein">Schreib keine Gesundheitsdaten hinein und keine Namen oder Geheimnisse anderer Menschen.</p></div>
      ${aussage({ text: 'Ein Sprachmodell versteht Bedeutung und Zusammenhänge, die eine Wortzählung übersieht. Sprachmodelle trafen bei englischen Texten etwa r = .29 – ungefähr 6 von 10 richtig bei „über oder unter dem Durchschnitt“.', stufe: 'belegt', quellen: ['peters2024'] })}
      ${aussage({ text: 'Für Claude und deutsche Texte gibt es keine veröffentlichten Genauigkeitswerte. Gezielte Nachfragen halfen in einer Studie am meisten – darum bittet der Text Claude um drei Nachfragen.', stufe: 'abgeleitet', quellen: ['peters2024b'] })}
      <label class="ueber" for="ts-namen">Namen in deinen Texten (freiwillig)</label>
      <input id="ts-namen" class="feld" type="text" autocomplete="off" autocapitalize="words" spellcheck="false" value="${esc(SITZ.namen)}" placeholder="Vornamen, mit Komma getrennt" aria-describedby="ts-namen-h">
      <p class="klein leise" id="ts-namen-h">Die App ersetzt sie durch [Person 1], [Person 2] … E-Mail-Adressen, Telefonnummern, Links und @-Namen ersetzt sie immer. Die Namen werden nicht gespeichert.</p>
      <button type="button" class="knopf haupt gross voll" data-ts="erstellen">Text zum Kopieren erstellen</button>
      ${SITZ.claude ? `<section class="karte" id="ts-schritt2"><h3 id="ts-t2">Dein Text für Claude</h3>
        <textarea id="ts-claude" class="feld ts-claude" aria-labelledby="ts-t2" spellcheck="false">${esc(SITZ.claude)}</textarea>
        <p class="klein leise">${SITZ.claude.length.toLocaleString('de-DE')} Zeichen. Du kannst ihn hier noch ändern. Die App merkt ihn sich nicht.</p>
        <div class="reihe"><button type="button" class="knopf haupt" data-ts="kopieren">${sym('kopieren')} Kopieren</button><button type="button" class="knopf zweit" data-ts="datei">${sym('sichern')} Als Datei sichern</button></div>
        <ol class="klein"><li>Öffne deine Claude-App und starte einen neuen Chat.</li><li>Füge den Text ein und sende ihn.</li><li>Komm zurück und lass die Zitate prüfen.</li></ol></section>
      <section class="karte weich"><h3 id="ts-t3">Antwort prüfen (freiwillig)</h3>
        <p class="klein">Füge Claudes Antwort hier ein. Die App prüft auf dem Gerät, ob jedes Zitat in »…« wirklich in deinen Texten steht.</p>
        <textarea id="ts-antwort" class="feld" aria-labelledby="ts-t3" spellcheck="false">${esc(SITZ.antwort)}</textarea>
        <button type="button" class="knopf zweit voll" data-ts="pruefen">Zitate prüfen</button>
        <div id="ts-zitate" aria-live="polite"></div></section>` : ''}
      ${ui.fuss()}`;
    const n = el.querySelector('#ts-namen'); n.addEventListener('input', () => { SITZ.namen = n.value; });
    const a = el.querySelector('#ts-antwort'); if (a) a.addEventListener('input', () => { SITZ.antwort = a.value; });
  };
  male();
  return binde(el, {
    erstellen: () => {
      const namen = SITZ.namen.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
      SITZ.claude = X.claudeText({ texte: texte(), bigfive: S.ergebnis('bigfive'), riasec: S.ergebnis('interessen.riasec'), an, maske: (s) => A.maskiere(s, namen) });
      male();
      const z = el.querySelector('#ts-t2'); if (z) { z.tabIndex = -1; try { z.focus({ preventScroll: true }); z.scrollIntoView({ block: 'start' }); } catch {} }
      ui.meldung('Text erstellt – noch nichts gesendet.');
    },
    kopieren: async () => {
      const f = el.querySelector('#ts-claude'); const ok = await ui.kopieren(f.value);
      if (ok) ui.meldung('Kopiert. Füge den Text in deiner Claude-App ein.');
      else { f.focus(); f.select(); ui.meldung('Kopieren ging nicht – der Text ist markiert, kopiere ihn selbst.', 4000); }
    },
    datei: () => ui.datei('text-spiegel-fuer-claude.txt', el.querySelector('#ts-claude').value, 'text/plain'),
    pruefen: () => {
      const erg = A.pruefeZitate(el.querySelector('#ts-antwort').value, texte()), box = el.querySelector('#ts-zitate');
      if (!erg.length) { box.innerHTML = '<p class="hinweis klein">Keine Zitate in »…« gefunden. Bitte Claude, jede Aussage mit wörtlichen Zitaten in »…« zu belegen.</p>'; return; }
      const ok = erg.filter((z) => z.gefunden).length;
      box.innerHTML = `<p><b>${ok} von ${erg.length} ${erg.length === 1 ? 'Zitat steht' : 'Zitaten stehen'} wörtlich in deinen Texten.</b></p>
        <ul class="ts-zitate">${erg.map((z) => `<li class="${z.gefunden ? 'ts-ok' : 'ts-fehlt'}">${z.gefunden ? sym('haken') : sym('schliessen')}<span>»${esc(z.zitat)}«<br><span class="klein leise">${z.gefunden ? 'gefunden' : 'nicht in deinen Texten – Aussagen, die sich nur darauf stützen, solltest du nicht glauben'}</span></span></li>`).join('')}</ul>`;
    }
  });
}

// ======================================================================= Blindtest
function blindtest({ el, titel, zurueckZu }) {
  titel('Blindtest'); zurueckZu('text/spiegel');
  const t = texte(), kr = A.krise(t);
  if (kr.an) return kriseAnsicht(el, kr, 'Blindtest');
  const an = A.analysiere(t, X.REIHE);
  if (an.umfang === 'zu-kurz') return zuKurz(el, an);
  const sig = A.fingerabdruck(t), b = lies('blind', null) || { versuche: 0, treffer: 0 };
  if (!SITZ.blind || SITZ.blind.sig !== sig) {
    const eigen = X.blindProfil(an), alle = [eigen, ...X.blindKoeder(eigen)];
    const reihe = alle.map((p, i) => ({ p, eigen: i === 0 })).sort(() => Math.random() - 0.5);
    SITZ.blind = { sig, reihe };
  }
  const stat = b.versuche ? `<p class="klein">Bisher: ${b.treffer} von ${b.versuche} ${b.versuche === 1 ? 'Versuch' : 'Versuchen'} erkannt. Zufall wäre etwa 1 von 3.</p>` : '';
  const erklaerung = `${aussage({ text: 'Beschreibungen, die auf fast alle passen, wirken trotzdem persönlich zutreffend (Barnum-Effekt). Der Blindtest prüft, ob die Beschreibung wirklich zu deinen Texten passt – nicht, ob sie dich durchschaut.', stufe: 'belegt', quellen: ['forer1949'] })}
    <p class="klein leise">Die Grenzen für „kurze“ oder „lange“ Sätze und „oft“ oder „selten“ Gefühle sind eigene, grobe Grenzen. ${marke('idee')}</p>`;
  const buchst = ['A', 'B', 'C'];
  if (b.sig === sig && b.letzte) {
    const eigenIdx = SITZ.blind.reihe.findIndex((x) => x.eigen);
    el.innerHTML = `<h2>Blindtest</h2>
      <div class="karte ${b.letzte === 'ja' ? 'gruen' : 'gelb'}"><p class="lead">${b.letzte === 'ja' ? 'Richtig erkannt – das war die Beschreibung deiner Texte.' : 'Das war nicht deine Beschreibung.'}</p>
        <p>Deine Texte: ${esc(X.blindText(SITZ.blind.reihe[eigenIdx].p).join(', '))}.</p></div>
      ${stat}${erklaerung}
      <p class="klein">Einen neuen Versuch gibt es, wenn du deine Texte änderst oder neue schreibst.</p>
      <a class="knopf zweit voll" href="#text/spiegel">Zurück zum Spiegel</a>${ui.fuss()}`;
    return binde(el);
  }
  el.innerHTML = `<h2>Blindtest</h2>
    <p class="lead">Eine dieser drei Beschreibungen gehört zu deinen Texten, zwei sind ausgedacht. Welche ist deine?</p>
    <div class="ts-blind" role="group" aria-label="Drei Beschreibungen">${SITZ.blind.reihe.map((x, i) => `<button type="button" class="ts-blind-karte" data-ts="waehle" data-i="${i}"><b>Beschreibung ${buchst[i]}</b><ul>${X.blindText(x.p).map((s) => `<li>${esc(s)}</li>`).join('')}</ul></button>`).join('')}</div>
    ${stat}${erklaerung}${merk()}${ui.fuss()}`;
  return binde(el, {
    waehle: (btn) => {
      const richtig = SITZ.blind.reihe[Number(btn.dataset.i)].eigen;
      schreib('blind', { versuche: b.versuche + 1, treffer: b.treffer + (richtig ? 1 : 0), sig, letzte: richtig ? 'ja' : 'nein' });
      neu();
    }
  });
}
