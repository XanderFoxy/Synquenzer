// M3 textspiegel – Text-Spiegel: 4 Schreibaufgaben, lokale Wortzählung als „Spiegel, kein Urteil“. Seit 0.3 (Xander, 24.11.2026):
// keine Bewertung und keine Zahl über ihn – jedes Merkmal ist eine Richtung zwischen zwei gleichwertigen Polen (aeste.js), in Worten.
// „Tiefer lesen“ IN der App (Stellen aus den eigenen Texten + was die Merkmale bedeuten) ersetzt „Mit Claude tiefer lesen“.
// Routen: text · text/schreiben/<aufgabe> · text/spiegel · text/tiefer · text/blindtest · text/claude (→ text/tiefer, alte Lesezeichen)
// Ergebnis: textspiegel (Format der Vorlage + Feld richtungen). Modul-Daten m.textspiegel: { texte, muttersprache, wirkung, blind, sig,
// vorher } – vorher: { <antwort-id>: [{ wert, anzeige, zeit }] } (neueste zuerst, höchstens 5). Vertrag für #muster/#antworten:
// antwortListe(k), antwortSetzen(k, id, wert), muster(k), aeste() – siehe unten.
import { kern } from '../../kern.js';
import * as A from './analyse.js';
import * as X from './texte.js';
import { ASTE } from './aeste.js';
import { ANZAHL } from './woerter.js';

const M = 'textspiegel';
const ui = kern.ui, S = kern.speicher;
const { esc, sym, marke, aussage } = ui;
const sp = (k) => (k && k.speicher) || S;
const lies = (k, std, s = S) => { const v = s.lies(M, k, std); return v == null ? std : v; };
const schreib = (k, v, s = S) => s.schreib(M, k, v);
const texte = (s = S) => ({ ...(lies('texte', {}, s) || {}) });
const alter = () => kern.einst().alter;
const jung = () => alter() === 'u16';
const unter18 = () => alter() === 'u16' || alter() === '16-17';
const SITZ = { blind: null };     // nur Arbeitsspeicher dieser Sitzung (Reihenfolge im Blindtest), nie gespeichert
const MAX_VORHER = 5;
const woerterText = (n) => `${n} ${n === 1 ? 'Wort' : 'Wörter'}`;
const zahlWort = (n) => ['keinen', 'einen', 'zwei', 'drei', 'vier'][n] || String(n);

const merk = () => S.einwilligung() ? '' :
  `<div class="hinweis gelb" data-ts-merk><p><b>Nur für jetzt:</b> Deine Texte sind nicht gemerkt und beim Neuladen oder Schließen weg.</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
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
    // „Alles löschen“ und „Sicherung laden“: auch die Sitzungs-Reihenfolge des Blindtests vergessen
    const vergiss = () => { SITZ.blind = null; };
    k.on('geloescht', vergiss); k.on('importiert', vergiss);
  },
  ansicht(ctx) {
    const teil = ctx.pfad[1];
    if (teil === 'schreiben') return schreiben(ctx);
    if (teil === 'spiegel') return spiegel(ctx);
    if (teil === 'tiefer') return tiefer(ctx);
    if (teil === 'claude') { kern.geh('text/tiefer', { ersetzen: true }); return; }     // alte Lesezeichen
    if (teil === 'blindtest') return blindtest(ctx);
    return uebersicht(ctx);
  }
};

// ======================================================================= Antworten, „vorher“, Neu-Rechnen
const vorschau = (t, n = 90) => { const s = String(t || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + ' …' : s; };
const textAnzeige = (t) => { const s = String(t || '').trim(); return s ? `„${vorschau(s)}“ (${woerterText(A.zaehleWoerter(s))})` : ''; };
const vorherAlle = (s = S) => ({ ...(lies('vorher', {}, s) || {}) });
function merkeVorher(id, wert, anzeige, s = S) {
  if (wert == null || wert === '') return;
  const v = vorherAlle(s), l = Array.isArray(v[id]) ? v[id] : [];
  if (l.length && JSON.stringify(l[0].wert) === JSON.stringify(wert)) return;
  v[id] = [{ wert, anzeige, zeit: new Date().toISOString() }, ...l].slice(0, MAX_VORHER);
  schreib('vorher', v, s);
}
function speichereErgebnis(an, ms, s = S) {
  const sig = A.fingerabdruck({ t: texte(s), ms });
  const alt = s.ergebnis(M);
  if (lies('sig', null, s) === sig && alt && alt.richtungen) return;
  const ersetzen = !!(alt && alt.zeit && Date.now() - new Date(alt.zeit).getTime() < 12 * 3600 * 1000);
  const rr = X.richtungen(an, { muttersprache: ms });
  s.setzeErgebnis(M, {
    schema: 1, woerter: an.woerter, umfang: an.umfang, muttersprache: ms,
    aufgaben: Object.fromEntries(Object.entries(an.aufgaben).map(([id, a]) => [id, { woerter: a.woerter }])),
    merkmale: Object.fromEntries(Object.entries(an.merkmale).map(([k, m]) => [k, { anzahl: m.anzahl, pro100: m.pro100 }])),   // intern (Format der Vorlage), wird nicht angezeigt
    satzlaenge: an.satzlaenge.unklar ? null : an.satzlaenge.mittel, vielfalt: an.vielfalt.wert,
    richtungen: Object.fromEntries(rr.filter((r) => r.seite).map((r) => [r.id, { seite: r.seite, deutlich: r.deutlich, richtung: r.satz }])),
    deutungen: rr.filter((r) => r.seite).map((r) => ({ text: r.satz, stufe: 'idee', quellen: [] })),
    quellen: ['koutsoumpis2022', 'dodds2015', 'carey2015', 'chen2020', 'tackman2019']
  }, { ersetzen });
  schreib('sig', sig, s);
}
// Ergebnis nach jeder Änderung neu rechnen. Unter 50 Wörtern gibt es kein Ergebnis; bei Krisen-Wörtern keine Auswertung.
function neuRechnen(s = S) {
  const t = texte(s), an = A.analysiere(t, X.REIHE);
  if (an.umfang === 'zu-kurz') { if (s.ergebnis(M)) s.loescheErgebnis(M); if (lies('sig', null, s) != null) schreib('sig', undefined, s); return null; }
  if (A.krise(t).an) return null;
  speichereErgebnis(an, lies('muttersprache', null, s), s);
  return an;
}

// Alle Antworten dieses Teils (für '#antworten'): die vier Texte, Muttersprache, die zwei Wirkungs-Fragen.
export function antwortListe(k) {
  const s = sp(k), t = texte(s), v = vorherAlle(s), ms = lies('muttersprache', null, s), w = lies('wirkung', {}, s) || {};
  const liste = X.AUFGABEN.map((a) => {
    const wert = String(t[a.id] || '').trim() ? t[a.id] : null;
    return { id: a.id, gruppe: 'Deine Texte', frage: a.frage, titel: a.titel, art: 'text', wert, anzeige: textAnzeige(wert), route: 'text/schreiben/' + a.id, vorher: v[a.id] || [] };
  });
  liste.push({ id: 'muttersprache', gruppe: 'Zum Text-Spiegel', frage: 'Ist Deutsch deine Muttersprache?', art: 'wahl', wert: typeof ms === 'boolean' ? ms : null,
    anzeige: ms === true ? 'Ja' : ms === false ? 'Nein' : '', optionen: [{ wert: true, text: 'Ja' }, { wert: false, text: 'Nein' }], route: 'text/spiegel', vorher: v.muttersprache || [] });
  for (const V of X.VERGLEICH) {
    const id = 'wirkung.' + V.bereich, wert = w[V.bereich] || null, o = V.optionen.find(([x]) => x === wert);
    liste.push({ id, gruppe: 'Selbstbild und Text', frage: V.frage, art: 'wahl', wert, anzeige: o ? o[1] : '',
      optionen: V.optionen.map(([x, txt]) => ({ wert: x, text: txt })), route: 'text/spiegel', vorher: v[id] || [] });
  }
  return liste;
}
// Eine Antwort setzen (null = löschen). Pflegt „vorher“, rechnet das Ergebnis neu. Gibt true zurück, wenn die id bekannt ist.
export async function antwortSetzen(k, id, wert) {
  const s = sp(k);
  if (X.AUFGABE[id]) {
    let w = wert == null ? '' : String(wert).slice(0, 8000);
    if (!w.trim()) w = '';
    const t = texte(s), alt = t[id] || '';
    if (alt === w) return true;
    if (alt.trim()) merkeVorher(id, alt, textAnzeige(alt), s);
    if (w) t[id] = w; else delete t[id];
    schreib('texte', t, s); neuRechnen(s);
    return true;
  }
  if (id === 'muttersprache') {
    const w = wert == null || wert === '' ? null : (wert === true || wert === 'ja' || wert === 'true');
    const alt = lies('muttersprache', null, s);
    if (alt === w) return true;
    if (typeof alt === 'boolean') merkeVorher(id, alt, alt ? 'Ja' : 'Nein', s);
    schreib('muttersprache', w === null ? undefined : w, s); neuRechnen(s);
    return true;
  }
  if (typeof id === 'string' && id.startsWith('wirkung.')) {
    const bereich = id.slice(8), V = X.VERGLEICH.find((x) => x.bereich === bereich);
    if (!V || (wert != null && !V.optionen.some(([x]) => x === wert))) return false;
    const w = { ...(lies('wirkung', {}, s) || {}) }, alt = w[bereich] || null;
    if (alt === (wert || null)) return true;
    if (alt) merkeVorher(id, alt, (V.optionen.find(([x]) => x === alt) || [])[1] || String(alt), s);
    if (wert == null) delete w[bereich]; else w[bereich] = wert;
    schreib('wirkung', w, s);
    return true;
  }
  return false;
}
// Richtungen der Texte für „Dein Muster“ – [] solange zu wenig geschrieben ist (oder bei Krisen-Wörtern: dann keine Auswertung).
export function muster(k) {
  const s = sp(k), t = texte(s);
  if (A.krise(t).an) return [];
  const an = A.analysiere(t, X.REIHE);
  if (an.umfang === 'zu-kurz') return [];
  const ms = lies('muttersprache', null, s);
  const zusatz = (an.umfang === 'stil' ? ' Bei so wenig Text beschreibt das nur diese Texte, noch nicht dich.' : '') +
    (ms === false ? ' Deutsch ist nicht deine Muttersprache – die Wörter zeigen darum auch, welche Wörter dir schon vertraut sind.' : '');
  return X.richtungen(an, { muttersprache: ms }).filter((r) => r.seite)
    .map((r) => ({ ast: r.ast, titel: r.titel, richtung: r.satz, deutlich: r.deutlich, woher: r.woher + zusatz }));
}
// Lerninhalt je Sprachmerkmal (unabhängig von den Antworten). „Was die Zählung nicht sieht“ als letzter Unterast.
export function aeste() {
  return ASTE.map(({ saetze, grenze, ...a }) => JSON.parse(JSON.stringify({
    ...a, unteraeste: [...(a.unteraeste || []), { id: a.id + '.grenze', titel: 'Was die Zählung nicht sieht', text: grenze }]
  })));
}

// ======================================================================= Übersicht
function uebersicht({ el, titel }) {
  titel('Text-Spiegel');
  const t = texte(), n = Object.fromEntries(X.REIHE.map((id) => [id, A.zaehleWoerter(t[id] || '')]));
  const ges = Object.values(n).reduce((s, x) => s + x, 0), k = Object.values(n).filter(Boolean).length;
  const stand = ges < A.GRENZEN.min ? `Ab ${A.GRENZEN.min} Wörtern zeigt der Spiegel erste Richtungen.`
    : ges < A.GRENZEN.stil ? `Noch etwa ${A.GRENZEN.stil - ges} Wörter, dann können die Richtungen deutlicher werden.` : 'Genug Text für alle Richtungen.';
  el.innerHTML = `<h2>Text-Spiegel</h2>
    <p class="lead">Vier kurze Schreibaufgaben. Danach zeigt dir die App, wohin deine Texte gehen – ein Spiegel, kein Urteil. Es gibt kein richtig oder falsch.</p>
    <ol class="zeilen">${X.AUFGABEN.map((a, i) => `<li><a class="zeile" href="#text/schreiben/${a.id}"><span><b>${i + 1}. ${esc(a.titel)}</b><small>${n[a.id] ? woerterText(n[a.id]) : 'noch offen'}</small></span><span class="rechts">${n[a.id] >= A.GRENZEN.ziel[0] ? sym('haken') + '<span class="sr">geschrieben</span>' : ''}${sym('weiter')}</span></a></li>`).join('')}</ol>
    <div class="karte weich">${ui.fortschritt(Math.min(1, ges / A.GRENZEN.stil), 'Geschrieben, bis alle Richtungen möglich sind')}
      <p class="klein"><b>${k ? `Du hast ${zahlWort(k)} ${k === 1 ? 'Text' : 'Texte'} geschrieben, zusammen ${woerterText(ges)}.` : 'Noch kein Text geschrieben.'}</b> ${esc(stand)}</p>
      <div class="stapel"><a class="knopf haupt voll" href="#text/spiegel">Spiegel ansehen</a>
        <a class="knopf zweit voll" href="#text/tiefer">Tiefer lesen</a></div></div>
    <ul class="zeilen"><li><a class="zeile" href="#muster"><span><b>Dein Muster</b><small>Alle Richtungen und Verästelungen zusammen</small></span><span class="rechts">${sym('weiter')}</span></a></li>
      <li><a class="zeile" href="#antworten/textspiegel"><span><b>Texte und Antworten ändern</b><small>Alles ansehen, ändern oder löschen</small></span><span class="rechts">${sym('weiter')}</span></a></li></ul>
    <p class="hinweis">Bitte nur <b>eigene</b> Texte – keine Chats oder Nachrichten von anderen Menschen.</p>
    <details class="karte"><summary>Was der Spiegel kann – und was nicht</summary>
      <h4>Er kann</h4><ul><li>Wörter in ${A.GRUPPEN_IDS.length} Gruppen finden, mit einem eigenen deutschen Wörterbuch (${ANZAHL} Einträge).</li>
        <li>Richtungen in Worten zeigen, etwa „eher nach vorn als zurück“ – mit den gefundenen Wörtern und den Stellen aus deinen Texten als Beleg.</li>
        <li>Erklären, was jedes Merkmal bedeutet, und dir Fragen zu deinen Texten stellen.</li><li>Alles auf dem Gerät rechnen. Nichts wird gesendet.</li></ul>
      <h4>Er kann nicht</h4><ul><li>${aussage({ text: 'Deine Persönlichkeit sicher erkennen: Einzelne Wortgruppen hängen nur sehr schwach mit Persönlichkeit zusammen.', stufe: 'belegt', quellen: ['koutsoumpis2022'], tag: 'span' })}</li>
        <li>Krankheiten erkennen – und er tut auch nicht so.</li><li>Ironie, Zitate oder Zusammenhänge verstehen.</li></ul></details>
    ${merk()}
    ${ges ? `<button type="button" class="knopf gefahr klein" data-ts="loeschen">${sym('loeschen')} Alle Texte löschen</button>` : ''}
    ${ui.fuss()}`;
  return binde(el, {
    loeschen: async () => {
      if (!(await ui.bestaetige({ titel: 'Alle Texte löschen?', text: 'Deine vier Texte, ihre früheren Fassungen und dein Text-Spiegel werden von diesem Gerät gelöscht.', ja: 'Löschen', gefahr: true }))) return;
      S.loescheModul(M); S.loescheErgebnis(M); SITZ.blind = null; ui.meldung('Texte gelöscht.'); neu();
    }
  });
}

// ======================================================================= Schreiben
function schreiben({ el, titel, zurueckZu, pfad }) {
  const id = pfad[2], a = X.AUFGABE[id];
  if (!a) { kern.geh('text', { ersetzen: true }); return; }
  titel('Text-Spiegel'); zurueckZu('text');
  const i = X.REIHE.indexOf(id), naechste = X.AUFGABEN[i + 1];
  const wert = texte()[id] || '', fassungen = vorherAlle()[id] || [];
  el.innerHTML = `<p class="klein leise ts-schritt">Aufgabe ${i + 1} von ${X.AUFGABEN.length}</p>
    <h2>${esc(a.titel)}</h2>
    <p class="lead" id="ts-frage">${esc(a.frage)}</p>
    <details class="ts-details"><summary>Ideen zum Anfangen</summary><ul>${a.hilfen.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></details>
    <label class="sr" for="ts-feld">Dein Text: ${esc(a.titel)}</label>
    <textarea id="ts-feld" class="feld ts-feld" lang="de" spellcheck="true" autocapitalize="sentences" autocomplete="off" maxlength="8000" aria-describedby="ts-frage ts-tipp">${esc(wert)}</textarea>
    <div class="ts-zaehler" aria-hidden="true"><span id="ts-balken"></span><span id="ts-zahl"></span></div>
    <p class="sr" id="ts-live" aria-live="polite"></p>
    <p id="ts-tipp" class="leise klein">Schreib so, wie du sprichst. ${A.GRENZEN.ziel[0]} bis ${A.GRENZEN.ziel[1]} Wörter reichen, Rechtschreibung ist egal. Schreib nur, was du teilen magst. Du kannst den Text jederzeit ändern.</p>
    <div id="ts-hilfe"></div>
    <div class="stapel">${naechste ? `<a class="knopf haupt" href="#text/schreiben/${naechste.id}">Weiter: ${esc(naechste.titel)}</a>` : '<a class="knopf haupt" href="#text/spiegel">Zum Spiegel</a>'}
      <a class="knopf zweit" href="#text">Zur Übersicht</a></div>
    ${fassungen.length ? `<details class="karte ts-fassungen"><summary>Frühere Fassungen</summary>
      <p class="klein leise">Wenn du einen Text änderst, merkt sich die App die vorige Fassung (die letzten ${MAX_VORHER}).</p>
      <ul>${fassungen.map((f, j) => `<li><span><span class="klein leise">${esc(ui.datum(f.zeit, true))}</span><br>${esc(vorschau(f.wert, 140))}</span><button type="button" class="knopf zweit klein" data-ts="zurueckholen" data-i="${j}">Zurückholen</button></li>`).join('')}</ul></details>` : ''}
    ${wert.trim() ? `<button type="button" class="knopf gefahr klein" data-ts="leeren">${sym('loeschen')} Diesen Text löschen</button>` : ''}
    ${merk()}${ui.fuss()}`;
  const feld = el.querySelector('#ts-feld');
  let tSpeichern = 0, tLive = 0, tKrise = 0, offen = false, geaendert = false, vorherGemerkt = false;
  const zeigeZahl = () => {
    const n = A.zaehleWoerter(feld.value), [z0, z1] = A.GRENZEN.ziel;
    el.querySelector('#ts-balken').innerHTML = ui.fortschritt(Math.min(1, n / z0), 'Geschrieben');
    el.querySelector('#ts-zahl').textContent = `${woerterText(n)} · ${n < z0 ? `${z0} bis ${z1} reichen` : n <= z1 ? 'reicht für den Spiegel' : 'reicht – mehr geht auch'}`;
    return n;
  };
  const speichern = () => {
    clearTimeout(tSpeichern); if (!offen) return; offen = false;
    if (!vorherGemerkt && wert.trim() && feld.value !== wert) { merkeVorher(id, wert, textAnzeige(wert)); vorherGemerkt = true; }
    schreib('texte', { ...texte(), [id]: feld.value }); geaendert = true;
  };
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
    clearTimeout(tLive); tLive = setTimeout(() => { const l = el.querySelector('#ts-live'); if (l) l.textContent = woerterText(n); }, 1500);
    clearTimeout(tKrise); tKrise = setTimeout(pruefeKrise, 700);
  };
  feld.addEventListener('input', eingabe);
  feld.addEventListener('blur', speichern);
  // Neuladen, App-Wechsel oder Schließen kurz nach dem Tippen: sofort sichern (sonst wären die letzten 400 ms weg)
  const versteckt = () => { if (document.visibilityState === 'hidden') speichern(); };
  window.addEventListener('pagehide', speichern); document.addEventListener('visibilitychange', versteckt);
  const ersetze = async (neuWert, meldung) => { speichern(); offen = false; geaendert = false; await antwortSetzen(kern, id, neuWert); ui.meldung(meldung, 3200); neu(); };
  return binde(el, {
    zurueckholen: (b) => { const f = fassungen[Number(b.dataset.i)]; if (f) ersetze(f.wert, 'Frühere Fassung zurückgeholt – die bisherige liegt jetzt unter „Frühere Fassungen“.'); },
    leeren: async () => {
      if (!(await ui.bestaetige({ titel: 'Diesen Text löschen?', text: 'Der Text verschwindet aus dem Spiegel. Unter „Frühere Fassungen“ kannst du ihn zurückholen.', ja: 'Löschen', gefahr: true }))) return;
      ersetze(null, 'Text gelöscht.');
    }
  }, [() => { speichern(); if (geaendert) neuRechnen(); clearTimeout(tLive); clearTimeout(tKrise); feld.removeEventListener('input', eingabe); feld.removeEventListener('blur', speichern);
    window.removeEventListener('pagehide', speichern); document.removeEventListener('visibilitychange', versteckt); }]);
}
const jugendNummer = () => `<section class="karte hilfe" aria-label="Hilfe für Kinder und Jugendliche"><a class="tel" href="tel:116111"><span>Nummer gegen Kummer – für Kinder und Jugendliche (Mo–Sa 14–20 Uhr)</span><b>116 111</b></a></section>`;

// ======================================================================= Krise: keine Auswertung, nur Hilfe
function kriseAnsicht(el, kr, titelText = 'Dein Text-Spiegel') {
  el.innerHTML = `<h2>${esc(titelText)}</h2>
    ${ui.hilfeKarte({ titel: 'Wenn es dir gerade nicht gut geht', text: 'In deinem Text stehen Worte, die nach großer Not klingen. Darum zeigt die App hier keine Auswertung. Du musst das nicht allein tragen. Die TelefonSeelsorge ist kostenlos, anonym und rund um die Uhr da.' })}
    ${unter18() && !ui.HILFE_JUNG ? jugendNummer() : ''}
    <p class="klein">Gefunden in: ${kr.aufgaben.map((id) => `„${esc(X.titelVon(id))}“`).join(', ')}. War es nur eine Redewendung oder ein Zitat, kannst du die Stelle ändern – dann zeigt der Spiegel wieder seine Richtungen.</p>
    <div class="stapel">${kr.aufgaben.map((id) => `<a class="knopf zweit" href="#text/schreiben/${id}">Text „${esc(X.titelVon(id))}“ öffnen</a>`).join('')}</div>
    ${ui.fuss()}`;
  return binde(el);
}
function zuKurz(el, an) {
  el.innerHTML = `<h2>Dein Text-Spiegel</h2>
    <div class="karte"><p class="lead">Schreib noch etwas mehr.</p>
      <p>Bisher ${woerterText(an.woerter)}. Unter ${A.GRENZEN.min} Wörtern wäre jede Aussage Zufall – darum zeigt der Spiegel noch nichts.</p>
      <a class="knopf haupt voll" href="#text/schreiben/${X.REIHE.find((id) => A.zaehleWoerter(texte()[id] || '') < A.GRENZEN.ziel[0]) || X.REIHE[0]}">Weiterschreiben</a></div>
    ${ui.fuss()}`;
  return binde(el);
}
// Gemeinsamer Anfang von Spiegel und Tiefer lesen: Krise → Hilfe, zu kurz → Hinweis, sonst Analyse.
function vorbereiten(el, titelText) {
  const t = texte(), kr = A.krise(t);
  if (kr.an) return { fertig: kriseAnsicht(el, kr, titelText) };
  const an = A.analysiere(t, X.REIHE);
  if (an.umfang === 'zu-kurz') return { fertig: zuKurz(el, an) };
  const ms = lies('muttersprache', null);
  return { t, an, ms, rr: X.richtungen(an, { muttersprache: ms }) };
}

// ======================================================================= Bausteine: Richtung in Worten, Belege, Stellen
// Zwei gleichwertige Pole, dazwischen eine ruhige Linie – ohne Zahl, ohne Markierung. Hervorgehoben: die Seite, zu der die Texte gehen.
function richtungHtml(r) {
  const an = (i) => r.seite === 'beide' || r.seite === (i ? 'b' : 'a');
  const wort = r.seite == null ? 'Dazu sagen deine Texte noch wenig.'
    : r.seite === 'beide' ? 'Beides gehört zu deinen Texten.' : `${r.deutlich === 'klar' ? 'Deutlich' : 'Eher'} in Richtung „${r.pole[r.seite === 'a' ? 0 : 1].name}“.`;
  return `<div class="ts-richtung" data-deutlich="${esc(r.deutlich || 'offen')}">
      <span class="ts-pol${an(0) ? ' an' : ''}">${esc(r.pole[0].name)}</span><span class="ts-linie" aria-hidden="true"></span><span class="ts-pol${an(1) ? ' an' : ''}">${esc(r.pole[1].name)}</span></div>
    <p class="klein ts-wort">${esc(wort)}</p>`;
}
function belegeHtml(r) {
  const zeile = (name, b) => `<p class="klein ts-beleg"><b>${esc(name)}:</b> ${b && b.length ? esc(X.belegListe(b, 6)) : 'kaum Wörter dafür'}</p>`;
  if (r.belege.a) return zeile(r.pole[1].name, r.belege.b) + zeile(r.pole[0].name, r.belege.a);
  if (r.belege.b) return zeile('Gefundene Wörter', r.belege.b);
  return '';
}
function stelleHtml(f) {
  const html = A.stuecke(f.satz, f.woerter).map((x) => (x.an ? `<mark>${esc(x.t)}</mark>` : esc(x.t))).join('');
  return `<blockquote class="ts-stelle"><p>${html}</p><footer class="klein leise">aus „${esc(X.titelVon(f.aufgabe))}“</footer></blockquote>`;
}
const astLink = (r, text = 'Mehr über diesen Ast') => `<a class="link ts-astlink" href="#muster/ast/${esc(r.ast)}">${esc(text)}</a>`;

// ======================================================================= Spiegel
function spiegel({ el, titel, zurueckZu }) {
  titel('Text-Spiegel'); zurueckZu('text');
  const v = vorbereiten(el, 'Dein Text-Spiegel'); if (v.fertig !== undefined) return v.fertig;
  const { an, ms, rr } = v;
  speichereErgebnis(an, ms);
  const k = Object.values(an.aufgaben).filter((a) => a.woerter > 0).length;
  const stufeText = an.umfang === 'stil'
    ? `Bei so wenig Text beschreibt der Spiegel nur diese Texte – noch nicht dich. Darum sagt er höchstens „eher“. Ab etwa ${A.GRENZEN.stil} Wörtern können Richtungen deutlicher werden.`
    : ms === false ? 'Deutsch ist nicht deine Muttersprache. Darum sagt der Spiegel höchstens „eher“ – die Wörter zeigen auch, welche Wörter dir schon vertraut sind.'
      : 'Die Richtungen beschreiben deine Texte. Ob sie zu dir passen, weißt nur du.';
  const da = rr.filter((r) => r.seite), offen = rr.filter((r) => !r.seite);
  el.innerHTML = `<h2>Dein Text-Spiegel</h2>
    <p class="lead">Spiegel, kein Urteil: So sind deine Texte gebaut. Jede Richtung hat zwei Seiten, und beide haben ihre Stärken.</p>
    <div class="karte akzent"><p><b>Du hast ${zahlWort(k)} ${k === 1 ? 'Text' : 'Texte'} geschrieben, zusammen ${woerterText(an.woerter)}.</b></p><p class="klein">${esc(stufeText)}</p>
      ${jung() ? '<p class="klein">Dein Schreibstil verändert sich in deinem Alter noch stark. Nimm alles als Momentaufnahme.</p>' : ''}</div>
    ${an.umfang === 'hinweise' ? mutterspracheHtml(ms) : ''}
    ${da.map((r) => `<section class="karte ts-ast"><h3>${esc(r.titel)}</h3>${richtungHtml(r)}<p>${esc(r.satz)}</p>
      ${r.belege.a || r.belege.b ? `<details class="ts-details"><summary>Gefundene Wörter</summary>${belegeHtml(r)}${r.thema ? `<p class="klein leise">Vieles davon steht in „${esc(X.titelVon(r.thema))}“ – das liegt nahe am Thema.</p>` : ''}</details>` : ''}
      ${astLink(r)}</section>`).join('')}
    ${offen.length ? `<section class="karte weich"><h3>Dazu sagen deine Texte noch wenig</h3><ul>${offen.map((r) => `<li><a class="link" href="#muster/ast/${esc(r.ast)}">${esc(r.titel)}</a></li>`).join('')}</ul>
      <p class="klein leise">Dafür stehen in deinen Texten noch zu wenige passende Wörter oder Sätze. Mit mehr Text kann sich das ändern.</p></section>` : ''}
    <section class="karte"><h3>Kleine Beobachtungen</h3><ul>${X.stilNotizen(an).map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>
    ${an.umfang === 'hinweise' && ms !== false ? vergleichHtml(an, rr) : ''}
    <section class="karte weich"><h3>Fragen an dich ${marke('idee')}</h3><p class="klein leise">Nachfragen statt Urteil – die Antwort weißt nur du.</p>
      <ul>${X.nachfragen(an, rr).map((f) => `<li>${esc(f)}</li>`).join('')}</ul></section>
    <a class="karte" href="#text/tiefer">${sym('text')}<span><b>Tiefer lesen</b><br><span class="klein leise">Die Stellen aus deinen Texten und was jedes Merkmal bedeutet</span></span><span class="rechts">${sym('weiter')}</span></a>
    <a class="karte" href="#muster">${sym('profil')}<span><b>Dein Muster</b><br><span class="klein leise">Alle Verästelungen – auch aus den anderen Teilen</span></span><span class="rechts">${sym('weiter')}</span></a>
    <a class="karte" href="#antworten/textspiegel">${sym('fragen')}<span><b>Texte und Antworten ändern</b><br><span class="klein leise">Der Spiegel rechnet sofort neu</span></span><span class="rechts">${sym('weiter')}</span></a>
    <a class="karte" href="#text/blindtest">${sym('spiel')}<span><b>Blindtest</b><br><span class="klein leise">Welche von drei Beschreibungen fühlt sich nach deinen Texten an?</span></span><span class="rechts">${sym('weiter')}</span></a>
    <section class="karte weich"><h3>Was das nicht heißt</h3><ul>${X.NICHT_HEISST.map((s) => `<li>${s.stufe ? aussage({ ...s, tag: 'span' }) : esc(s.text)}</li>`).join('')}</ul></section>
    <details class="karte"><summary>So liest der Spiegel</summary><ul class="klein">
      <li>${aussage({ text: 'Wie viel verrät ein Text über einen Menschen? Wenig: Wortzählungen hängen nur sehr schwach mit Persönlichkeit zusammen, auch Computer-Modelle mit sehr viel Text nur mäßig. Darum beschreibt der Spiegel deine Texte und stellt Fragen – er urteilt nicht über dich.', stufe: 'belegt', quellen: ['koutsoumpis2022', 'moreno2021', 'azucar2018'], tag: 'span' })}</li>
      <li>Eigenes deutsches Wörterbuch mit ${ANZAHL} Einträgen in ${A.GRUPPEN_IDS.length} Gruppen. Fremde Wortlisten (zum Beispiel LIWC) werden nicht benutzt.</li>
      <li>Jede Richtung vergleicht nur Wörter in deinen eigenen Texten miteinander – nie mit anderen Menschen.</li>
      <li>„Deutlich“ heißt: Eine Seite überwiegt klar und es ist genug Text da. „Eher“ heißt: Sie überwiegt etwas, oder der Text ist noch kurz. Die Grenzen dafür hat die App selbst grob gewählt. ${marke('idee')}</li>
      <li>Ein „nicht“ oder „kein“ bis zu 3 Wörter vor einem Gefühlswort dreht es um – dann zählt es nicht mit.</li>
      <li>Sätze enden an Punkt, Ausrufe- oder Fragezeichen und am Zeilenende. „z. B.“ und ähnliche Abkürzungen beenden keinen Satz.</li>
      <li>${aussage({ text: 'Wortvielfalt über ein wanderndes Fenster von 50 Wörtern – so hängt sie kaum von der Textlänge ab.', stufe: 'belegt', quellen: ['covington2010'], tag: 'span' })}</li>
      <li>${aussage({ text: 'Kleine Wörter wie ich, wir, nicht oder weil zu zählen ist eine bekannte Methode – mit kleinen Effekten.', stufe: 'belegt', quellen: ['tausczik2010'], tag: 'span' })}</li>
      <li>${aussage({ text: 'Wörter wie „immer“ und „nie“ wurden in Studien über viele Online-Foren gezählt. Das ist ein Befund über sehr viele Texte, nicht über einzelne Menschen – darum zeigt die App dazu keine Warnung.', stufe: 'belegt', quellen: ['almosaiwi2018'], tag: 'span' })}</li>
      <li>Alles wurde hier auf dem Gerät gerechnet. Nichts wurde gesendet.</li></ul></details>
    ${merk()}${ui.fuss()}`;
  return binde(el, {
    mutter: async (b) => { await antwortSetzen(kern, 'muttersprache', b.dataset.wert === 'ja'); neu(); },
    mutterAendern: async () => { await antwortSetzen(kern, 'muttersprache', null); neu(); },
    wirkung: async (b) => {
      const bereich = b.dataset.bereich, box = el.querySelector(`#ts-vgl-${bereich}`);
      await antwortSetzen(kern, 'wirkung.' + bereich, b.dataset.wert);
      if (!box) return;
      box.querySelectorAll('[data-ts=wirkung]').forEach((c) => c.setAttribute('aria-checked', String(c === b)));
      const bf = S.ergebnis('bigfive'), st = bf && bf.bereiche && bf.bereiche[bereich] ? bf.bereiche[bereich].stufe : 0;
      const r = X.vergleichAntwort(b.dataset.wert, st);
      box.querySelector('.ts-antwort').innerHTML = aussage({ text: r.text, stufe: r.stufe || 'idee', quellen: r.quellen || [] });
    }
  });
}
function mutterspracheHtml(ms) {
  if (ms === false) return `<p class="hinweis klein">Du hast gesagt: Deutsch ist nicht deine Muttersprache. <button type="button" class="link" data-ts="mutterAendern">Ändern</button></p>`;
  if (ms === true) return '';
  return `<section class="karte"><h3 id="ts-ms">Ist Deutsch deine Muttersprache?</h3>
    <p class="klein">Bei Menschen, die Deutsch lernen, zeigen Wörter vor allem, welche Wörter schon vertraut sind. Dann bleibt der Spiegel bei „eher“.</p>
    <div class="chips" role="radiogroup" aria-labelledby="ts-ms"><button type="button" class="chip" role="radio" aria-checked="false" data-ts="mutter" data-wert="ja">Ja</button><button type="button" class="chip" role="radio" aria-checked="false" data-ts="mutter" data-wert="nein">Nein</button></div></section>`;
}
function vergleichHtml(an, rr) {
  const bf = S.ergebnis('bigfive');
  if (!bf || !bf.bereiche) return `<section class="karte"><h3>Selbstbild und Text</h3><p>Für diesen Vergleich fehlt noch dein Fragebogen zur Persönlichkeit.</p><a class="knopf zweit voll" href="#fragen/bigfive">Zum Fragebogen</a></section>`;
  const wirkung = lies('wirkung', {}) || {};
  const teile = X.VERGLEICH.map((V) => {
    const b = bf.bereiche[V.bereich]; if (!b || typeof b.stufe !== 'number') return '';
    const ant = wirkung[V.bereich], r = ant ? X.vergleichAntwort(ant, b.stufe) : null;
    return `<div class="ts-vgl" id="ts-vgl-${V.bereich}"><h4>${esc(V.name)}</h4>
      <p><b>Fragebogen:</b> ${esc(X.selbstSeite(V, b.stufe))}</p>
      <p><b>Text:</b> ${esc(X.textSeite(an, V, rr))}</p>
      ${aussage(V.forschung)}
      <p id="ts-f-${V.bereich}"><b>${esc(V.frage)}</b></p>
      <div class="chips" role="radiogroup" aria-labelledby="ts-f-${V.bereich}">${V.optionen.map(([w, txt]) => `<button type="button" class="chip" role="radio" aria-checked="${ant === w}" data-ts="wirkung" data-bereich="${V.bereich}" data-wert="${w}">${esc(txt)}</button>`).join('')}</div>
      <div class="ts-antwort" aria-live="polite">${r ? aussage({ text: r.text, stufe: r.stufe || 'idee', quellen: r.quellen || [] }) : ''}</div>
      <a class="link" href="#fragen/bigfive/vertiefung?bereich=${V.bereich}">Im Fragebogen genauer nachfragen</a></div>`;
  }).join('');
  if (!teile) return '';
  return `<section class="karte" id="ts-vergleich"><h3>Selbstbild und Text</h3>
    <p class="klein">Nur ein Gesprächsanstoß: Der Fragebogen zeigt, wie du dich selbst siehst. Ein Text zeigt eher, wie du wirken könntest. Beides darf verschieden sein.</p>${teile}</section>`;
}

// ======================================================================= Tiefer lesen (in der App, auf dem Gerät)
function tiefer({ el, titel, zurueckZu }) {
  titel('Tiefer lesen'); zurueckZu('text/spiegel');
  const v = vorbereiten(el, 'Tiefer lesen'); if (v.fertig !== undefined) return v.fertig;
  const { t, an, ms, rr } = v;
  speichereErgebnis(an, ms);
  const R = Object.fromEntries(X.RICHTUNGEN.map((x) => [x.id, x]));
  const AS = Object.fromEntries(ASTE.map((x) => [x.id, x]));
  const stellen = (r) => {
    const D = R[r.id];
    if (D.art === 'waage') {
      const sb = A.fundstellen(t, X.REIHE, D.b, 2), sa = A.fundstellen(t, X.REIHE, D.a, 2);
      const block = (name, liste) => `<p class="klein"><b>${esc(name)}</b></p>${liste.length ? liste.map(stelleHtml).join('') : '<p class="klein leise">Dafür steht kaum etwas in deinen Texten.</p>'}`;
      return block(r.pole[1].name, sb) + block(r.pole[0].name, sa);
    }
    if (D.art === 'dichte') { const l = A.fundstellen(t, X.REIHE, D.gruppen, 3); return l.length ? l.map(stelleHtml).join('') : '<p class="klein leise">In deinen Texten stehen dafür kaum Wörter – auch das ist eine Richtung.</p>'; }
    if (r.id === 'satzlaenge') {
      const e = A.extremSaetze(t, X.REIHE); if (!e) return '';
      return `<p class="klein"><b>Dein kürzester Satz</b></p>${stelleHtml({ ...e.kurz, woerter: [] })}<p class="klein"><b>Dein längster Satz</b></p>${stelleHtml({ ...e.lang, woerter: [] })}`;
    }
    const w = A.wiederkehrend(t, X.REIHE, 8);
    return w.length ? `<p class="klein"><b>Wörter, die in deinen Texten wiederkehren</b></p><p class="ts-woerter">${w.map((x) => `<span>${esc(x)}</span>`).join('')}</p>` : '<p class="klein leise">Kein Wort taucht öfter auf – außer den kleinen Wörtern, die in jedem Text stehen.</p>';
  };
  const frage = (r) => { const a = AS[r.ast]; return a.weiterdenken[(r.seite === 'b' ? 1 : r.seite === 'beide' ? 2 : 0) % a.weiterdenken.length]; };
  const jeText = X.AUFGABEN.map((a) => {
    const n = A.zaehleWoerter(t[a.id] || ''); if (n < 30) return '';
    const an1 = A.analysiere({ [a.id]: t[a.id] }, [a.id]);
    const seiten = X.richtungen(an1, { min: 4, ohneThema: true }).filter((r) => r.seite === 'a' || r.seite === 'b').map((r) => r.pole[r.seite === 'a' ? 0 : 1].name).slice(0, 4);
    return `<li><b>${esc(a.titel)}</b><br><span class="klein">${seiten.length ? 'eher: ' + esc(seiten.join(' · ')) : 'Hier halten sich die Seiten die Waage.'}</span></li>`;
  }).filter(Boolean);
  el.innerHTML = `<h2>Tiefer lesen</h2>
    <p class="lead">Hier liest die App deine Texte genauer – Merkmal für Merkmal: was in deinen Texten steht, was das Merkmal bedeutet, was die Zählung nicht sieht, und eine Frage zum Weiterdenken.</p>
    <p class="hinweis klein">Alles bleibt auf diesem Gerät. Es gibt kein richtig oder falsch – beide Seiten jeder Richtung haben ihre Stärken.${an.umfang === 'stil' ? ' Bei so wenig Text beschreibt das nur diese Texte, noch nicht dich.' : ''}</p>
    ${rr.map((r) => { const a = AS[r.ast]; return `<details class="karte ts-tief"><summary><span><b>${esc(r.titel)}</b><br><span class="klein leise">${esc(r.seite == null ? 'dazu sagen deine Texte noch wenig' : r.seite === 'beide' ? 'beides' : `${r.deutlich === 'klar' ? 'deutlich' : 'eher'}: ${r.pole[r.seite === 'a' ? 0 : 1].name}`)}</span></span></summary>
      ${richtungHtml(r)}${r.satz ? `<p>${esc(r.satz)}</p><p class="klein leise">${esc(r.woher)}</p>` : ''}
      <h4>In deinen Texten</h4>${stellen(r)}
      <h4>Was das bedeutet</h4><p>${esc(a.wasEsIst)}</p>
      <h4>Zwei Seiten, beide mit Stärken</h4><ul>${a.pole.map((p) => `<li><b>${esc(p.name)}:</b> ${esc(p.text)}</li>`).join('')}</ul>
      <h4>Was die Zählung nicht sieht</h4><p class="klein">${esc(a.grenze)}</p>
      <h4>Zum Weiterdenken</h4><p>${esc(frage(r))}</p>
      ${astLink(r, 'Ganzer Ast: Alltag, Stärken, Reibung, Verästelungen')}</details>`; }).join('')}
    ${jeText.length > 1 ? `<section class="karte"><h3>Deine Texte nebeneinander</h3><p class="klein leise">Jeder Text hat sein Thema – darum gehen sie oft in verschiedene Richtungen. Das ist kein Widerspruch.</p><ul class="ts-jetext">${jeText.join('')}</ul></section>` : ''}
    <section class="karte weich"><h3>Was das nicht heißt</h3><ul>${X.NICHT_HEISST.map((s) => `<li>${s.stufe ? aussage({ ...s, tag: 'span' }) : esc(s.text)}</li>`).join('')}</ul></section>
    <div class="stapel"><a class="knopf zweit voll" href="#text/spiegel">Zurück zum Spiegel</a><a class="knopf zweit voll" href="#antworten/textspiegel">Texte ändern</a></div>
    ${merk()}${ui.fuss()}`;
  return binde(el);
}

// ======================================================================= Blindtest (ohne richtig/falsch)
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
  const erklaerung = `${aussage({ text: 'Beschreibungen, die auf fast alle passen, wirken trotzdem persönlich (Barnum-Effekt). Der Blindtest zeigt, ob eine Beschreibung wirklich zu deinen Texten passt – nicht, ob sie dich durchschaut.', stufe: 'belegt', quellen: ['forer1949'] })}
    <p class="klein leise">Die Grenzen für „kurze“ oder „lange“ Sätze und „oft“ oder „selten“ Gefühle sind eigene, grobe Grenzen. ${marke('idee')}</p>`;
  const buchst = ['A', 'B', 'C'];
  const liste = (p) => `<ul>${X.blindText(p).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
  if (b.sig === sig && b.letzte) {
    const eigen = SITZ.blind.reihe.find((x) => x.eigen).p, gleich = b.letzte === 'ja';
    el.innerHTML = `<h2>Blindtest</h2>
      <div class="karte weich"><p class="lead">So beschreibt die Zählung deine Texte:</p>${liste(eigen)}
        ${gleich ? '<p>Du hast genau diese Beschreibung gewählt – dein Blick auf deine Texte und die Zählung zeigen in dieselbe Richtung.</p>'
          : `${b.wahl ? `<p>Du hast diese gewählt:</p>${liste(b.wahl)}` : ''}<p>Beides kann stimmen: Die Zählung sieht nur Wörter, du kennst ihre Bedeutung. Was an deiner Wahl fühlt sich nach dir an?</p>`}</div>
      ${erklaerung}
      <p class="klein">Neu gemischt wird, wenn du deine Texte änderst oder neue schreibst.</p>
      <a class="knopf zweit voll" href="#text/spiegel">Zurück zum Spiegel</a>${ui.fuss()}`;
    return binde(el);
  }
  el.innerHTML = `<h2>Blindtest</h2>
    <p class="lead">Eine dieser drei Beschreibungen kommt aus der Zählung deiner Texte, zwei sind ausgedacht. Welche fühlt sich nach deinen Texten an?</p>
    <div class="ts-blind" role="group" aria-label="Drei Beschreibungen">${SITZ.blind.reihe.map((x, i) => `<button type="button" class="ts-blind-karte" data-ts="waehle" data-i="${i}"><b>Beschreibung ${buchst[i]}</b>${liste(x.p)}</button>`).join('')}</div>
    ${erklaerung}${merk()}${ui.fuss()}`;
  return binde(el, {
    waehle: (btn) => {
      const x = SITZ.blind.reihe[Number(btn.dataset.i)];
      schreib('blind', { versuche: (b.versuche || 0) + 1, treffer: b.treffer || 0, sig, letzte: x.eigen ? 'ja' : 'nein', wahl: x.p });
      neu();
    }
  });
}
