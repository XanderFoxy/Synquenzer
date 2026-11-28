// app.js – Klavier-Lernhilfe: Seiten #start, #stueck/<id>, #uebungen[/<übung>]. Alles lokal, nichts wird gesendet.
import { einlesen } from './einlesen.js';
import { klingendeNoten, schreibweiseAus, taktAn } from './modell.js';
import { intervall, langText, vomGrundton } from './intervalle.js';
import { zeichne, faerbe, markiere, positionBei } from './notensatz.js';
import { analysiere, farbKarte, rollenKarte, segmentBei, notenName, ortImSystem, rollenFarbe, istDunkel, ROLLEN_NAME, ROLLEN_KURZ } from './akkorde.js';
import { tastatur } from './tastatur.js';
import { spieler, klinge, audioKontext } from './wiedergabe.js';
import { uebungen } from './uebungen.js';

// Noten-Scanner (Bild/Foto → MusicXML): Link trägt die Hauptsitzung ein. Leer = Hinweis ausgeblendet.
const SCANNER_URL = '';

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const ruhig = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ───────── Symbole (SVG, keine Emoji) ─────────
const I = (d, k = 'ico') => `<svg class="${k}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  zurueck: I(`<path d="M15 5l-7 7 7 7" ${S} stroke-width="2.4"/>`),
  spielen: I('<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/>'),
  pause: I('<rect x="6.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/>'),
  datei: I(`<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" ${S}/><path d="M14 3v5h5" ${S}/><path d="M12 11v6M9 14l3-3 3 3" ${S}/>`),
  note: I('<ellipse cx="9" cy="17" rx="3.6" ry="2.7" transform="rotate(-20 9 17)" fill="currentColor"/><path d="M12.2 16V4.5c2.4 1 5.6 2 6 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  schleife: I(`<path d="M17 2l3 3-3 3" ${S}/><path d="M4 11V9a4 4 0 0 1 4-4h12" ${S}/><path d="M7 22l-3-3 3-3" ${S}/><path d="M20 13v2a4 4 0 0 1-4 4H4" ${S}/>`, 'ico-k'),
  x: I(`<path d="M7 7l10 10M17 7L7 17" ${S} stroke-width="2.2"/>`, 'ico-k'),
  weg: I(`<path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" ${S}/>`, 'ico-k'),
  ohr: I(`<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" ${S}/>`, 'ico-k'),
  takt: I(`<path d="M8 21h8l-2.6-17h-2.8z" ${S}/><path d="M12 15l5-8" ${S}/><path d="M7 21h10" ${S}/>`, 'ico-k'),
  namen: I(`<rect x="3" y="5" width="18" height="14" rx="2" ${S}/><path d="M9 5v8M15 5v8" ${S}/><path d="M7.5 17h3M13.5 17h3" ${S}/>`, 'ico-k'),
  bild: I(`<rect x="3" y="4" width="18" height="16" rx="3" ${S}/><circle cx="9" cy="10" r="2" ${S}/><path d="M21 16l-5-5-8 8" ${S}/>`),
  bass: I('<path d="M6 7.5c3.5-2.6 9-1.5 8.6 3.6-.3 4.2-4.6 6.8-8.6 8.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="6.8" cy="9.6" r="1.8" fill="currentColor"/><circle cx="18" cy="8.5" r="1.2" fill="currentColor"/><circle cx="18" cy="13" r="1.2" fill="currentColor"/>'),
  stufen: I('<rect x="4" y="14" width="4" height="6" rx="1" fill="#22a06b"/><rect x="10" y="9" width="4" height="11" rx="1" fill="#f59e0b"/><rect x="16" y="4" width="4" height="16" rx="1" fill="#e5484d"/>'),
  abstand: I(`<path d="M5 18V6M19 18V6" ${S}/><path d="M8 12h8M10 9.5L8 12l2 2.5M14 9.5l2 2.5-2 2.5" ${S}/>`),
  pfeil: I(`<path d="M9 5l7 7-7 7" ${S}/>`, 'ico-k'),
  teilen: I(`<path d="M12 3.5v11M8 7.5l4-4 4 4" ${S}/><path d="M7 10.5H6a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-1" ${S}/>`, 'ico-k'),
  blatt: I(`<rect x="5" y="3" width="14" height="18" rx="2.2" ${S}/><path d="M8 8h8M8 11h8M8 14h8" ${S} stroke-width="1.4"/><ellipse cx="10.2" cy="17.2" rx="1.9" ry="1.4" transform="rotate(-20 10.2 17.2)" fill="currentColor"/>`),
  klaviatur: I(`<rect x="3" y="5" width="18" height="14" rx="2.2" ${S}/><path d="M9 12.5V19M15 12.5V19" ${S}/><rect x="7.4" y="5" width="3.2" height="8" rx=".8" fill="currentColor"/><rect x="13.4" y="5" width="3.2" height="8" rx=".8" fill="currentColor"/>`),
  scanner: I(`<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" ${S}/><path d="M8 10h8M8 14h8" ${S} stroke-width="1.6"/>`),
  finden: I(`<rect x="3" y="9" width="18" height="11" rx="2" ${S}/><path d="M9 9v6M15 9v6" ${S}/><circle cx="12" cy="4.5" r="2" fill="currentColor"/><path d="M12 6.5V9" ${S}/>`),
};
const DREI = (a = 'var(--r1)', b = 'var(--r3)', c = 'var(--r5)') => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="16" r="3.4" fill="${a}"/><circle cx="12" cy="11" r="3.4" fill="${b}"/><circle cx="18" cy="6" r="3.4" fill="${c}"/></svg>`;
const ROLLE_VAR = { grundton: '--r1', terz: '--r3', quinte: '--r5', septime: '--r7', option: '--ro', fremd: '--rf' };

const BEISPIELE = [
  { id: 'umkehrungen', datei: 'beispiele/uebung-umkehrungen-bass.musicxml', titel: 'Umkehrungen im Bassschlüssel', wer: 'Übungsstück', text: 'a-Moll: Grundstellung, 1. und 2. Umkehrung' },
  { id: 'elise', datei: 'beispiele/beethoven-fuer-elise.musicxml', titel: 'Für Elise', wer: 'L. v. Beethoven', text: 'Auftakt und Takt 1–8' },
  { id: 'bach', datei: 'beispiele/bach-praeludium-c-dur.musicxml', titel: 'Präludium C-Dur', wer: 'J. S. Bach · BWV 846', text: 'Takt 1–8, gebrochene Akkorde' },
];

// ───────── Eigene Stücke: IndexedDB (mit Ersatz im Speicher) ─────────
const speicher = new Map();
let dbVersprechen = null;
function db() {
  if (!dbVersprechen) dbVersprechen = new Promise((ok) => {
    try {
      const r = indexedDB.open('klavier-lernhilfe', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('stuecke', { keyPath: 'id' });
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ok(null);
      r.onblocked = () => ok(null);
    } catch { ok(null); }
  });
  return dbVersprechen;
}
async function dbTun(modus, fn) {
  const d = await db();
  if (!d) return null;
  try {
    return await new Promise((ok, nein) => {
      const tx = d.transaction('stuecke', modus);
      const r = fn(tx.objectStore('stuecke'));
      tx.oncomplete = () => ok(r && r.result);
      tx.onerror = () => nein(tx.error);
      tx.onabort = () => nein(tx.error);
    });
  } catch { return null; }
}
async function eigeneListe() {
  const alle = (await dbTun('readonly', (s) => s.getAll())) || [];
  for (const e of speicher.values()) if (!alle.some((a) => a.id === e.id)) alle.push(e);
  return alle.sort((a, b) => (b.datum || 0) - (a.datum || 0));
}
async function eigenesSpeichern(e) { speicher.set(e.id, e); await dbTun('readwrite', (s) => s.put(e)); }
async function eigenesHolen(id) { return speicher.get(id) || (await dbTun('readonly', (s) => s.get(id))); }
async function eigenesLoeschen(id) { speicher.delete(id); geladen.delete(id); await dbTun('readwrite', (s) => s.delete(id)); }

const geladen = new Map(); // id → {titel, wer, stück}
async function stueckHolen(id) {
  if (geladen.has(id)) return geladen.get(id);
  const b = BEISPIELE.find((x) => x.id === id);
  let e;
  if (b) {
    const r = await fetch(b.datei);
    if (!r.ok) throw new Error('Beispiel nicht gefunden');
    const st = await einlesen(await r.text(), b.datei);
    e = { titel: b.titel, wer: b.wer, stück: st };
  } else {
    const roh = await eigenesHolen(id);
    if (!roh) throw new Error('Stück nicht gefunden');
    const st = await einlesen(roh.daten, roh.name, { haende: roh.haende });
    e = { titel: roh.titel || st.titel, wer: roh.name, stück: st, eigen: true };
  }
  geladen.set(id, e);
  return e;
}

// ───────── Hinweis-Blatt & Toast ─────────
function hinweis({ bild = ICON.bild, titel, text, knopf = 'Alles klar', klasse = '' }) {
  const el = $('#hinweis');
  el.innerHTML = `<div class="blatt ${klasse}" role="document"><div class="bild">${bild}</div><h3>${esc(titel)}</h3>${text}<button class="ok" type="button">${esc(knopf)}</button></div>`;
  el.hidden = false;
  const zu = () => { el.hidden = true; el.innerHTML = ''; };
  el.onclick = (ev) => { if (ev.target === el || ev.target.closest('.ok')) zu(); };
  $('.ok', el).focus();
  return { el, zu };
}
let toastZeit = 0;
function toast(text) {
  const t = $('#toast');
  t.textContent = text; t.classList.add('an');
  clearTimeout(toastZeit); toastZeit = setTimeout(() => t.classList.remove('an'), 2400);
}

// ───────── Datei laden ─────────
const MAX_DATEI = 30 * 1024 * 1024; // größer ist kein Klavierstück mehr – und würde das Gerät lange blockieren
async function dateiLaden(datei) {
  if (!datei) return;
  try {
    if (datei.size > MAX_DATEI) throw Object.assign(new Error('gross'), { text: `Die Datei ist zu groß (${(datei.size / 1048576).toFixed(0)} MB, bis ${MAX_DATEI / 1048576} MB gehen). Teile das Stück in kürzere Abschnitte.` });
    const daten = await datei.arrayBuffer();
    const st = await einlesen(daten, datei.name);
    if (!st.noten || !st.noten.length) throw Object.assign(new Error('leer'), { text: 'In dieser Datei habe ich keine Noten gefunden.' });
    const id = 'eigen-' + Date.now().toString(36);
    const titel = (st.titel && st.titel.trim()) || datei.name.replace(/\.[^.]+$/, '');
    await eigenesSpeichern({ id, titel, name: datei.name, daten, datum: Date.now() });
    geladen.set(id, { titel, wer: datei.name, stück: st });
    location.hash = '#stueck/' + id;
  } catch (e) {
    if (e && e.art === 'nicht-verfuegbar') {
      hinweis({
        bild: SCANNER_URL ? ICON.scanner : ICON.bild,
        titel: 'Bild oder PDF – noch nicht direkt',
        text: `<p>${esc(e.text)}.</p>${SCANNER_URL ? `<p>Dafür gibt es den <b>Noten-Scanner</b>: Foto hinein, er macht daraus MusicXML oder MIDI – die Datei lädst du dann hier.</p><a class="scanner-knopf" href="${esc(SCANNER_URL)}" target="_blank" rel="noopener">${ICON.scanner}<span>Zum Noten-Scanner</span></a>` : ''}<p>Was hier <b>sofort</b> klappt: <b>MusicXML</b> (.musicxml, .xml, .mxl) und <b>MIDI</b> (.mid). Viele Notenseiten und Notenprogramme bieten diese Formate zum Herunterladen an.</p><p>Ich erfinde keine Noten aus einem Bild – lieber ehrlich als falsch geübt.</p>`,
      });
    } else {
      hinweis({ bild: ICON.datei, titel: 'Das konnte ich nicht lesen', text: `<p>${esc((e && e.text) || (e && e.message) || 'Unbekannter Fehler')}</p><p>Möglich sind MusicXML (.musicxml, .xml, .mxl) und MIDI (.mid).</p>` });
    }
  }
}

// ───────── MIDI-Herkunft: ehrlich zeigen, was gerundet wurde; Hände umschaltbar ─────────
const HAENDE_TEXT = { spur: 'nach Spur', tonhoehe: 'nach Tonhöhe', auto: 'automatisch' };
const HAENDE_HILFE = { spur: 'Jede Spur (oder jeder Kanal) gehört zu einer Hand – nach Spurname, sonst nach Tonlage.', tonhoehe: 'Ab c1 (Mitte) rechte Hand, darunter linke Hand.', auto: 'Akkorde so geteilt, dass jede Hand spielbar bleibt.' };
function quelleHtml(q) {
  if (!q || q.art !== 'midi') return '';
  const r = q.raster || {};
  const teile = [];
  if (r.art === 'geschaetzt') teile.push(`<b>Eingespielt, nicht taktgenau:</b> ${r.anfaenge} von ${r.gesamt} Notenanfängen aufs Raster (Sechzehntel/Triolen) gerückt – Rhythmus bitte mit dem Gehör prüfen.`);
  else if (r.anfaenge) teile.push(`${r.anfaenge} von ${r.gesamt} Notenanfängen gerundet.`);
  else teile.push('Rhythmus genau übernommen' + (r.enden ? `, ${r.enden} Notenlängen leicht angepasst.` : ' – nichts gerundet.'));
  if (q.gekuerzt) teile.push(`${q.gekuerzt}× gleiche Taste neu angeschlagen, bevor sie losgelassen war – der erste Ton endet dort.`);
  if (q.doppelt) teile.push(`${q.doppelt} doppelte Töne zusammengefasst.`);
  if (q.ohneEnde) teile.push(`${q.ohneEnde} Töne ohne Ende in der Datei – bis zum Schluss gehalten (höchstens 8 Viertel über den letzten Ton hinaus).`);
  if (q.abgeschnitten) teile.push(`<b>Sehr lang:</b> nur die ersten ${q.abgeschnitten.takte} Takte geladen – ${q.abgeschnitten.noten} ${q.abgeschnitten.noten === 1 ? 'Ton' : 'Töne'} danach weggelassen.`);
  if (q.schlagzeug) teile.push('Schlagzeug (Kanal 10) ausgeblendet.');
  if (q.auftakt) teile.push('Auftakt erkannt.');
  if (q.tempoWechsel) teile.push(`${q.tempoWechsel} Tempowechsel – die Wiedergabe folgt ihnen.`);
  const knoepfe = (q.haendeModi || []).map((m) => `<button type="button" data-haende="${m}" aria-pressed="${m === q.haende}" title="${esc(HAENDE_HILFE[m])}">${HAENDE_TEXT[m]}</button>`).join('');
  const spuren = q.spuren?.length || 0;
  return `<div class="quelle" id="quelle"><p><span class="q-marke">MIDI</span> ${spuren} ${spuren === 1 ? 'Spur' : 'Spuren'} · ${teile.join(' ')}</p>
    <div class="q-haende" role="group" aria-label="Hände aufteilen"><span>Hände</span>${knoepfe}</div></div>`;
}
async function haendeSetzen(id, modus) {
  const roh = await eigenesHolen(id);
  if (!roh) return;
  await eigenesSpeichern({ ...roh, haende: modus });
  geladen.delete(id);
  toast('Hände: ' + HAENDE_TEXT[modus]);
  route();
}

// ───────── Speichern als … (MusicXML / MIDI) ─────────
let ausgebenModul = null, ausgebenLaden = null;
const ausgebenHolen = () => (ausgebenLaden ||= import('./ausgeben.js').then((m) => (ausgebenModul = m)));
const kannTeilen = () => { try { return !!(navigator.share && navigator.canShare); } catch { return false; } };

/** iPhone: Teilen-Menü mit Datei (dort „In Dateien sichern“). Sonst: normaler Download. */
async function teilenOderLaden(blob, name) {
  if (kannTeilen()) {
    try {
      const datei = new File([blob], name, { type: blob.type });
      if (navigator.canShare({ files: [datei] })) { await navigator.share({ files: [datei], title: name }); return 'geteilt'; }
    } catch (err) {
      if (err && err.name === 'AbortError') return 'abgebrochen';
      // sonst (z. B. Dateityp nicht teilbar): Download versuchen
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return 'geladen';
}
function speichernBlatt(e) {
  ausgebenHolen();
  const teilen = kannTeilen();
  const { el, zu } = hinweis({
    bild: ICON.teilen, titel: 'Speichern als …', knopf: 'Schließen', klasse: 'speichern-blatt',
    text: `<p>Das Stück als Datei – für Notenprogramme, Keyboards oder zum Weitergeben.</p>
      <div class="format-wahl">
        <button class="format-knopf" type="button" data-format="musicxml"><span class="fk-ico">${ICON.blatt}</span><span><b>MusicXML</b><small>.musicxml · Noten mit Tonart, Bögen, Fingersatz</small></span></button>
        <button class="format-knopf" type="button" data-format="midi"><span class="fk-ico">${ICON.klaviatur}</span><span><b>MIDI</b><small>.mid · Töne und Tempo für Klavier-Apps und Keyboards</small></span></button>
      </div>
      <p class="klein">${teilen ? 'Auf dem Handy öffnet sich „Teilen“ – dort „In Dateien sichern“ wählen.' : 'Die Datei landet in deinen Downloads.'} Alles bleibt im Gerät, nichts wird hochgeladen.</p>`,
  });
  for (const b of el.querySelectorAll('[data-format]')) b.onclick = async (ev) => {
    ev.stopPropagation();
    const m = ausgebenModul || (await ausgebenHolen());
    const xml = b.dataset.format === 'musicxml';
    let blob, name;
    try {
      blob = xml ? new Blob([m.alsMusicXML(e.stück, { titel: e.titel })], { type: 'application/vnd.recordare.musicxml+xml' })
        : new Blob([m.alsMidi(e.stück, { titel: e.titel })], { type: 'audio/midi' });
      name = m.dateiname(e.titel, xml ? 'musicxml' : 'mid');
    } catch (err) { toast('Speichern ging nicht: ' + (err.message || err)); return; }
    const ergebnis = await teilenOderLaden(blob, name);
    if (ergebnis !== 'abgebrochen') { zu(); toast(ergebnis === 'geteilt' ? 'Geteilt: ' + name : 'Gespeichert: ' + name); }
  };
}

// ───────── Router ─────────
let aufraeumen = null;
function route() {
  if (aufraeumen) { try { aufraeumen(); } catch { /* egal */ } aufraeumen = null; }
  if ($('#hinweis .speichern-blatt')) { const h = $('#hinweis'); h.hidden = true; h.innerHTML = ''; } // Speichern-Blatt gehört zur alten Seite
  const h = location.hash.replace(/^#/, '') || 'start';
  const [seite, arg] = h.split('/');
  if (seite === 'stueck' && arg) return seiteStueck(decodeURIComponent(arg));
  if (seite === 'uebungen') return seiteUeben(arg);
  return seiteStart();
}
addEventListener('hashchange', route);

// ───────── Startseite ─────────
async function seiteStart() {
  document.title = 'Klavier-Lernhilfe';
  const kartenB = BEISPIELE.map((b, i) => `<a class="karte" href="#stueck/${b.id}"><div class="bild">${i === 0 ? ICON.bass : DREI()}</div><div class="txt"><b>${esc(b.titel)}</b><small>${esc(b.wer)} · ${esc(b.text)}</small></div><span class="marke">Beispiel</span></a>`).join('');
  const legende = ['grundton', 'terz', 'quinte', 'septime', 'option', 'fremd'].map((r) => `<span class="chip"><i style="background:var(${ROLLE_VAR[r]})">${ROLLEN_KURZ[r] || '·'}</i>${ROLLEN_NAME[r]}</span>`).join('');
  app.innerHTML = `<div class="start seite">
    <header class="held"><img src="icon.svg" alt=""><div><h1>Klavier-Lernhilfe</h1><p>Noten sehen · Akkorde verstehen · Tasten finden</p></div></header>
    <button class="laden" type="button" id="laden"><span class="kreis">${ICON.datei}</span><span><b>Notenblatt laden</b><span>Tippen – oder Datei hierher ziehen</span></span></button>
    <div class="formate"><span class="ok">MusicXML</span><span class="ok">MXL</span><span class="ok">MIDI</span><span>PDF / Foto: Hinweis</span></div>
    ${SCANNER_URL ? `<a class="scanner-hinweis" href="${esc(SCANNER_URL)}" target="_blank" rel="noopener"><span class="kreis">${ICON.scanner}</span><span><b>Bild oder Foto?</b> → Noten-Scanner</span>${ICON.pfeil}</a>` : ''}
    <input type="file" id="datei" hidden accept=".musicxml,.xml,.mxl,.mid,.midi,application/vnd.recordare.musicxml+xml,application/vnd.recordare.musicxml,audio/midi,audio/x-midi,application/pdf,image/*">
    <h2 class="abschnitt">Meine Stücke</h2>
    <div class="liste" id="eigene"></div>
    <h2 class="abschnitt">Beispiele</h2>
    <div class="liste">${kartenB}</div>
    <h2 class="abschnitt">Üben</h2>
    <div class="liste">
      <a class="karte" href="#uebungen/lesen"><div class="bild">${ICON.bass}</div><div class="txt"><b>Bassschlüssel lesen</b><small>Note sehen – Taste finden</small></div>${ICON.pfeil}</a>
      <a class="karte" href="#uebungen/akkord"><div class="bild">${ICON.stufen}</div><div class="txt"><b>Umkehrungen erkennen</b><small>Grundstellung, 1. oder 2. Umkehrung?</small></div>${ICON.pfeil}</a>
      <a class="karte" href="#uebungen/intervall"><div class="bild">${ICON.abstand}</div><div class="txt"><b>Intervalle</b><small>Abstände sehen und hören</small></div>${ICON.pfeil}</a>
      <a class="karte" href="#uebungen/finden"><div class="bild">${ICON.finden}</div><div class="txt"><b>Intervalle finden</b><small>Hören und auf der Tastatur finden</small></div>${ICON.pfeil}</a>
    </div>
    <h2 class="abschnitt">Farben der Akkordtöne</h2>
    <div class="legende">${legende}</div>
  </div>`;
  const inp = $('#datei'), knopf = $('#laden');
  knopf.onclick = () => inp.click();
  inp.onchange = () => { dateiLaden(inp.files[0]); inp.value = ''; };
  const ziel = app.firstElementChild;
  ziel.addEventListener('dragover', (e) => { e.preventDefault(); knopf.classList.add('zieh'); });
  ziel.addEventListener('dragleave', () => knopf.classList.remove('zieh'));
  ziel.addEventListener('drop', (e) => { e.preventDefault(); knopf.classList.remove('zieh'); dateiLaden(e.dataTransfer.files[0]); });

  const box = $('#eigene');
  const liste = await eigeneListe();
  if (!box.isConnected) return;
  box.innerHTML = liste.length ? liste.map((e) => `<a class="karte" href="#stueck/${encodeURIComponent(e.id)}"><div class="bild">${ICON.note}</div><div class="txt"><b>${esc(e.titel)}</b><small>${esc(e.name)}</small></div><button class="weg" type="button" data-weg="${esc(e.id)}" aria-label="${esc(e.titel)} entfernen">${ICON.weg}</button></a>`).join('')
    : '<p class="leer">Noch keine eigenen Stücke – lade oben ein Notenblatt.</p>';
  box.onclick = async (ev) => {
    const w = ev.target.closest('[data-weg]');
    if (!w) return;
    ev.preventDefault();
    await eigenesLoeschen(w.dataset.weg);
    toast('Stück entfernt');
    seiteStart();
  };
}

// ───────── Üben ─────────
function seiteUeben(art) {
  document.title = 'Üben · Klavier-Lernhilfe';
  app.innerHTML = `<div class="seite"><header class="kopf"><a class="rund" href="#start" aria-label="Zurück">${ICON.zurueck}</a><h1>Üben<small>Bassschlüssel · Umkehrungen · Intervalle</small></h1></header><div class="ueben" id="ue"></div></div>`;
  const u = art === 'finden' ? uebungen($('#ue'), { start: 'intervall', stufe: 'finden-leicht' })
    : uebungen($('#ue'), { start: ['lesen', 'akkord', 'intervall'].includes(art) ? art : 'lesen' });
  aufraeumen = () => u.zerstoere();
}

// ───────── Stück ─────────
async function seiteStueck(id) {
  app.innerHTML = '<div class="lade"><span class="lade-punkt"></span></div>';
  let e;
  try { e = await stueckHolen(id); } catch (err) {
    hinweis({ bild: ICON.datei, titel: 'Stück nicht gefunden', text: `<p>${esc(err.message)}</p>` });
    location.hash = '#start';
    return;
  }
  const st = e.stück;
  document.title = e.titel + ' · Klavier-Lernhilfe';
  const takte = st.takte;
  const erster = takte[0].nr, letzter = takte[takte.length - 1].nr;

  app.innerHTML = `<div class="stueck seite">
    <header class="kopf">
      <a class="rund" href="#start" aria-label="Zurück">${ICON.zurueck}</a>
      <h1>${esc(e.titel)}<small>${esc(e.wer || '')}</small></h1>
      <button class="schalter" id="farben" type="button" aria-pressed="true" aria-label="Akkordfarben"><span class="regen"><i style="background:var(--r1)"></i><i style="background:var(--r3)"></i><i style="background:var(--r5)"></i></span>Farben</button>
      <button class="schalter" id="namen" type="button" aria-pressed="false" aria-label="Tastennamen">${ICON.namen}Namen</button>
      <button class="schalter nur-ico" id="takt" type="button" aria-pressed="false" aria-label="Metronom-Klick">${ICON.takt}</button>
    </header>
    <div class="notenflaeche" id="flaeche">${quelleHtml(st.quelle)}<svg id="noten" role="img" aria-label="Notenblatt"></svg></div>
    <section class="akkordkarte leer-k" id="karte" aria-live="polite"></section>
    <div class="steuer">
      <button class="spielen" id="spiel" type="button" aria-label="Abspielen">${ICON.spielen}</button>
      <div class="bereich"><button class="pille" id="bereich" type="button" aria-label="Bereich zurücksetzen"><span id="bereichText"></span><i class="x">${ICON.x}</i></button></div>
      <button class="schalter schleife-k" id="schleife" type="button" aria-pressed="true" aria-label="Schleife">${ICON.schleife}</button>
      <button class="schalter nur-ico speichern-k" id="speichern" type="button" aria-label="Speichern als …" title="Speichern als …">${ICON.teilen}</button>
      <label class="tempo">Tempo<input id="tempo" type="range" min="40" max="100" step="5" value="70" aria-label="Tempo in Prozent"><output id="tempoW">70 %</output></label>
      <div class="hand" role="group" aria-label="Hand">
        <button type="button" data-hand="" aria-pressed="true">Beide</button><button type="button" data-hand="links" aria-pressed="false">Links</button><button type="button" data-hand="rechts" aria-pressed="false">Rechts</button>
      </div>
    </div>
    <div class="tastenflaeche"><div id="tasten"></div></div>
  </div>`;

  const svg = $('#noten'), flaeche = $('#flaeche'), karte = $('#karte');
  const notenNachId = new Map(st.noten.map((n) => [n.id, n]));
  const segmente = analysiere(st);
  const rollen = rollenKarte(segmente);
  let farbenKarte = farbKarte(segmente);
  const segNachNote = new Map();
  segmente.forEach((s, i) => { for (const id of s.neu) if (!segNachNote.has(id)) segNachNote.set(id, i); });

  const Z = {
    farben: true, namen: false, schleife: true, hand: null, tempo: 0.7, metronom: false,
    von: erster, bis: letzter, wahl: 0, // wahl: 0 = nächster Tipp setzt Anfang, 1 = nächster Tipp setzt Ende
    gewaehlt: -1, getippt: null, aktSeg: -1, zeile: -1, layout: null, klingt: new Set(), schmutzig: false, kopfRaum: 0,
  };
  // Intervalle: Bezugston (getippte Note/Taste) + Töne, die gerade klingen oder gewählt sind
  const IV = { bezug: null, kontext: [], tasten: [] }; // bezug {midi, sw, id?}; kontext [{id, midi, sw}] aus dem Notenblatt; tasten [{midi, sw}]
  const tast = tastatur($('#tasten'), { von: 21, bis: 108, namen: 'c', beiTipp: (m) => { audioKontext(); klinge([m], { dauer: 0.9 }); tast.leuchte(m, Z.farben ? 'septime' : null, 400); tasteGetippt(m); } });
  requestAnimationFrame(() => tast.zeigeBereich(43, 57, 'Bassschlüssel'));

  // Noten zeichnen + Akkordnamen darüber
  const NS = 'http://www.w3.org/2000/svg';
  const breite = () => { const cs = getComputedStyle(flaeche); return flaeche.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); };
  let zeiger = null, namenG = null;
  function malen() {
    const B = Math.max(260, Math.floor(breite()));
    const SP = B < 560 ? 9 : 10;
    Z.kopfRaum = SP * 3.1;
    Z.layout = zeichne(svg, st, {
      breite: B, kopfRaum: Z.kopfRaum, farben: Z.farben ? farbenKarte : new Map(), markiert: Z.klingt,
      schleife: { von: Z.von, bis: Z.bis }, beiTipp: noteGetippt, beiTaktTipp: taktGetippt,
    });
    namenG = document.createElementNS(NS, 'g');
    namenG.setAttribute('class', 'ak-namen');
    const belegt = new Map();
    segmente.forEach((s, i) => {
      const p = positionBei(s.von, svg);
      if (!p) return;
      const zl = Z.layout.zeilen[p.zeile];
      const bassTeil = s.art !== 'einzelton' && (s.umkehrung > 0 || s.bassFremd) ? '/' + s.bass : '';
      const txt = s.art === 'einzelton' ? s.grundton : s.kurz + bassTeil;
      const u = s.art === 'einzelton' ? '' : s.bassFremd ? 'Bass fremd' : ['Grundst.', '1. Umk.', '2. Umk.', '3. Umk.'][s.umkehrung];
      let fs = 13, w = Math.max(txt.length * 8 + 10, u ? u.length * 5.6 + 8 : 0);
      const x0 = Math.max(4, p.x - 6);
      const frei = belegt.get(p.zeile) ?? 0;
      let zeigU = !!u;
      if (x0 < frei) { fs = 11; zeigU = false; w = txt.length * 6.8 + 8; if (x0 < frei - 2) return; }
      belegt.set(p.zeile, x0 + w + 3);
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'ak-name');
      g.dataset.seg = i;
      const y = zl.y + 2, h = zeigU ? 26 : 18;
      g.innerHTML = `<rect x="${x0}" y="${y}" width="${w}" height="${h}" rx="7"/><text class="ak-k" x="${x0 + 5}" y="${y + 13}" font-size="${fs}">${esc(txt)}</text>${zeigU ? `<text class="ak-u" x="${x0 + 5}" y="${y + 23}" font-size="9">${esc(u)}</text>` : ''}`;
      g.addEventListener('click', (ev) => { ev.stopPropagation(); akkordGewaehlt(i, true); });
      namenG.appendChild(g);
    });
    svg.appendChild(namenG);
    zeiger = document.createElementNS(NS, 'rect');
    zeiger.setAttribute('class', 'zeiger'); zeiger.setAttribute('width', '2.5'); zeiger.setAttribute('rx', '1.2');
    zeiger.setAttribute('visibility', 'hidden');
    svg.appendChild(zeiger);
    markiereAkkord();
    ivG = null;
    ivZeichnen();
  }
  function markiereAkkord() {
    if (!namenG) return;
    for (const g of namenG.children) {
      const i = +g.dataset.seg;
      g.classList.toggle('gewaehlt', i === Z.gewaehlt);
      g.classList.toggle('akt', i === Z.aktSeg && i !== Z.gewaehlt);
    }
  }

  // Akkord-Karte
  const tonChip = (n, rolle, getippt) => `<span class="ton${getippt ? ' getippt' : ''}"><i style="background:var(${ROLLE_VAR[rolle] || '--rf'})">${ROLLEN_KURZ[rolle] || '·'}</i>${esc(notenName(n.schreibweise || n.midi))}</span>`;
  function karteZeigen(i, getipptId = null) {
    const s = segmente[i];
    if (!s) { karteLeer(); return; }
    const gesehen = new Set();
    const toene = s.noten.slice().sort((a, b) => a.midi - b.midi).filter((n) => { if (gesehen.has(n.midi)) return false; gesehen.add(n.midi); return true; });
    const getippt = getipptId && notenNachId.get(getipptId);
    let erkl = esc(s.erklaerung);
    if (getippt) {
      const r = s.rollen.get(getippt.id) || 'fremd';
      const sys = getippt.system === 'oben' ? 'violin' : 'bass';
      erkl = `<b>${esc(notenName(getippt.schreibweise || getippt.midi))}</b> = ${esc(ROLLEN_NAME[r])}${r === 'fremd' ? '' : ' von ' + esc(s.name)} · steht im ${sys === 'bass' ? 'Bassschlüssel' : 'Violinschlüssel'} ${esc(ortImSystem(getippt.schreibweise, sys))}. ` + erkl;
    }
    karte.className = 'akkordkarte' + (ruhig() ? '' : ' neu');
    const kurzBass = s.art === 'einzelton' ? s.grundton : s.kurz + (s.umkehrung > 0 || s.bassFremd ? '/' + s.bass : '');
    karte.innerHTML = `<div class="gross">${esc(kurzBass)}<small>${esc(s.name)}</small></div>
      <div><span class="umk">${esc(s.umkehrungText)}${s.art !== 'einzelton' ? ' · ' + (s.lage === 'weit' ? 'weite Lage' : 'enge Lage') : ''}</span><div class="toene">${toene.map((n) => tonChip(n, s.rollen.get(n.id), getippt && getippt.midi === n.midi)).join('')}</div></div>
      <button class="rund hoer" type="button" aria-label="Akkord anhören">${ICON.ohr}</button>
      ${ivHtml(s)}<p class="erkl">${erkl}</p>`;
    $('.hoer', karte).onclick = () => akkordGewaehlt(i, true);
    tastenZeigen(s, toene);
  }
  function karteLeer() {
    karte.className = 'akkordkarte leer-k';
    karte.innerHTML = '<div>Tippe auf eine <b>Note</b> oder einen <b>Akkordnamen</b> – oder auf einen Takt, um den Übe-Bereich zu wählen. Getippte Note oder Taste = <b>Bezugston</b> für Intervalle.</div>';
  }
  karteLeer();

  // ───── Intervalle ─────
  const bezugNote = () => ({ midi: IV.bezug.midi, schreibweise: IV.bezug.sw });
  const tonartJetzt = () => taktAn(st, segmente[Z.gewaehlt]?.von ?? segmente[Z.aktSeg]?.von ?? takte[0].start)?.tonart;
  // Schreibweise einer getippten Taste: aus dem Notenblatt, wenn sie dort klingt; als Bezugston nach Tonart; sonst passend zum Bezugston
  const swFuerTaste = (m, alsBezug) => IV.kontext.find((x) => x.midi === m)?.sw || (alsBezug ? schreibweiseAus(m, tonartJetzt()) : undefined);
  /** Andere Töne (einmal je Taste), sortiert – ohne den Bezugston selbst */
  function ivAndere() {
    const gesehen = new Set(IV.bezug ? [IV.bezug.midi] : []);
    const aus = [];
    for (const x of [...IV.kontext, ...IV.tasten]) { if (gesehen.has(x.midi)) continue; gesehen.add(x.midi); aus.push(x); }
    return aus.sort((a, b) => a.midi - b.midi);
  }
  const ivChip = (name, iv) => `<span class="iv-chip" title="${esc(langText(iv))}">${esc(name)} <b>${esc(iv.kurz)}</b></span>`;
  /** Intervalle aller Akkordtöne vom Bass und vom Grundton */
  function basisHtml(s) {
    const akk = s.noten.filter((n) => s.rollen.get(n.id) !== 'fremd');
    const proTaste = new Map();
    for (const n of akk.sort((a, b) => a.midi - b.midi)) if (!proTaste.has(n.midi)) proTaste.set(n.midi, n);
    const liste = [...proTaste.values()];
    if (liste.length < 2) return '';
    const bass = liste[0];
    const bassIv = liste.slice(1).map((n) => ({ n, iv: intervall(bass, n) }));
    const vomBass = bassIv.map(({ n, iv }) => ivChip(notenName(n.schreibweise || n.midi), iv));
    const wurzelNote = liste.find((n) => ((n.midi % 12) + 12) % 12 === s.grundtonPc);
    const wurzelSw = wurzelNote?.schreibweise || s.grundtonSw || schreibweiseAus(s.grundtonPc + 60); // wie im Akkordnamen geschrieben
    const proKlasse = new Map();
    for (const n of liste) { const pc = ((n.midi % 12) + 12) % 12; if (pc !== s.grundtonPc && !proKlasse.has(pc)) proKlasse.set(pc, n); }
    const grundIv = [...proKlasse.values()].map((n) => ({ n, iv: vomGrundton(wurzelSw, n.schreibweise || schreibweiseAus(n.midi)) }))
      .sort((a, b) => a.iv.zahl - b.iv.zahl || a.iv.halbtoene - b.iv.halbtoene);
    const vomGrund = grundIv.map(({ n, iv }) => ivChip(notenName(n.schreibweise || n.midi, false), iv));
    const bassName = notenName(bass.schreibweise || bass.midi), grundName = notenName(wurzelSw, false);
    // Grundstellung in enger Lage: beide Reihen wären gleich → nur eine zeigen
    const gleich = ((bass.midi % 12) + 12) % 12 === s.grundtonPc && bassIv.map((x) => x.iv.kurz).join() === grundIv.map((x) => x.iv.kurz).join();
    if (gleich) return `<div class="iv-basis"><span class="iv-bl">Vom Grundton = Bass ${esc(bassName)}</span>${vomBass.join('')}</div>`;
    return `<div class="iv-basis"><span class="iv-bl">Vom Bass ${esc(bassName)}</span>${vomBass.join('')}</div>`
      + `<div class="iv-basis"><span class="iv-bl">Vom Grundton ${esc(grundName)}</span>${vomGrund.join('')}</div>`;
  }
  function ivHtml(s) {
    let h = '';
    if (IV.bezug) {
      const zeilen = ivAndere().map((x) => {
        const iv = intervall(bezugNote(), { midi: x.midi, schreibweise: x.sw });
        return `<li><span class="iv-k">${esc(iv.kurz)}</span><span>${esc(langText(iv))}${iv.zusatz ? ` <small>· ${esc(iv.zusatz)}</small>` : ''}</span></li>`;
      }).join('');
      h += `<div class="iv-kopf"><span>Bezugston <b>${esc(notenName(IV.bezug.sw))}</b></span><button class="iv-weg" type="button" aria-label="Bezugston lösen">${ICON.x}</button></div>`;
      h += zeilen ? `<ul class="iv-liste">${zeilen}</ul>` : '<p class="iv-leer">Tippe weitere Tasten – jede zeigt ihren Abstand zum Bezugston.</p>';
    }
    if (s && s.art !== 'einzelton') h += basisHtml(s);
    return h ? `<div class="iv">${h}</div>` : '';
  }
  /** Tastatur: Akkordtöne in Rollenfarben (1·3·5·7), dazu getippte Tasten; Intervall-Schilder zum Bezugston */
  function tastenZeigen(s, toene) {
    const fb = new Map(), text = new Map();
    if (s) for (const n of toene) if (!fb.has(n.midi)) { const r = Z.farben ? s.rollen.get(n.id) : 'fremd'; fb.set(n.midi, r); text.set(n.midi, ROLLEN_KURZ[r] ?? ''); }
    for (const x of [...IV.tasten, ...(IV.bezug ? [IV.bezug] : [])]) if (!fb.has(x.midi)) { fb.set(x.midi, 'var(--akzent)'); text.set(x.midi, ''); }
    tast.zeige(new Set(fb.keys()), fb, text);
    if (!IV.bezug) { tast.intervalle(null, null); return; }
    const marken = new Map();
    for (const x of ivAndere()) marken.set(x.midi, intervall(bezugNote(), { midi: x.midi, schreibweise: x.sw }).kurz);
    tast.intervalle(marken, IV.bezug.midi);
  }
  /** Karte + Tastatur neu, ohne den Rest anzufassen */
  function karteAktualisieren() {
    const i = Z.gewaehlt >= 0 ? Z.gewaehlt : sp.laeuft ? Z.aktSeg : -1;
    if (i >= 0 && segmente[i]) { karteZeigen(i, Z.gewaehlt >= 0 ? Z.getippt : null); return; }
    if (IV.bezug || IV.tasten.length) {
      karte.className = 'akkordkarte nur-iv';
      karte.innerHTML = ivHtml(null) || '<div class="iv"><p class="iv-leer">Tippe eine Taste: Sie wird zum Bezugston.</p></div>';
      tastenZeigen(null, []);
    } else { karteLeer(); tastenZeigen(null, []); }
  }
  /** Kurze Intervall-Marken an den Noten im Notenblatt (nicht während der Wiedergabe) */
  let ivG = null;
  function ivZeichnen() {
    if (ivG) { ivG.remove(); ivG = null; }
    if (!IV.bezug || sp.laeuft || !Z.layout) return;
    const { boxen, SP } = Z.layout;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'iv-marken');
    let html = '';
    const b0 = IV.bezug.id && boxen.get(IV.bezug.id);
    if (b0) html += `<circle class="iv-ring" cx="${(b0.x + b0.b / 2).toFixed(1)}" cy="${(b0.y + b0.h / 2).toFixed(1)}" r="${(SP * 1.2).toFixed(1)}"/>`;
    const belegt = [];
    const frei = (x, y, w, h) => !belegt.some((r) => r.x < x + w && x < r.x + r.w && r.y < y + h && y < r.y + r.h);
    for (const x of IV.kontext) {
      if (x.id === IV.bezug.id || x.midi === IV.bezug.midi) continue;
      const b = boxen.get(x.id);
      if (!b) continue;
      const txt = intervall(bezugNote(), { midi: x.midi, schreibweise: x.sw }).kurz;
      const w = txt.length * 5.6 + 9, h = 13, ym = b.y + b.h / 2 - h / 2;
      const rechts = b.x + b.b + 3, links = b.x - w - 3;
      const kand = [[rechts, ym], [links, ym], [rechts, ym - h - 1], [rechts, ym + h + 1], [links, ym - h - 1], [links, ym + h + 1]]
        .filter(([xx]) => xx >= 1 && xx + w <= Z.layout.breite - 1);
      const [xx, yy] = kand.find(([a, c]) => frei(a, c, w, h)) || kand[0] || [rechts, ym];
      belegt.push({ x: xx, y: yy, w, h });
      html += `<g class="iv-marke"><rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="6.5"/><text x="${(xx + w / 2).toFixed(1)}" y="${(yy + 9.6).toFixed(1)}" text-anchor="middle">${esc(txt)}</text></g>`;
    }
    g.innerHTML = html;
    svg.appendChild(g);
    ivG = g;
  }
  /** Taste getippt: wird Bezugston; der vorige Bezugston bleibt als gewählter Ton stehen. Bezugston nochmal = lösen. */
  function tasteGetippt(m) {
    if (IV.bezug && IV.bezug.midi === m) IV.bezug = null;
    else {
      const b = IV.bezug;
      if (b && !IV.kontext.some((x) => x.midi === b.midi) && !IV.tasten.some((x) => x.midi === b.midi)) IV.tasten.push({ midi: b.midi });
      IV.tasten = IV.tasten.filter((x) => x.midi !== m).slice(-7);
      IV.bezug = { midi: m, sw: swFuerTaste(m, true), id: IV.kontext.find((x) => x.midi === m)?.id || null };
    }
    karteAktualisieren();
    ivZeichnen();
  }
  const ausNote = (n) => ({ id: n.id, midi: n.midi, sw: n.schreibweise });
  /** Töne, die mit Note n zusammen klingen, plus die Töne ihres Akkord-Abschnitts */
  function kontextFuer(n, s) {
    const ids = new Set(), aus = [];
    const dazu = (x) => { if (!ids.has(x.id)) { ids.add(x.id); aus.push(ausNote(x)); } };
    for (const x of st.noten) if (x.t <= n.t + 1e-6 && x.t + x.dauer > n.t + 1e-6) dazu(x);
    if (s) for (const x of s.noten) dazu(x);
    return aus;
  }
  karte.addEventListener('click', (ev) => {
    if (!ev.target.closest('.iv-weg')) return;
    IV.bezug = null; IV.tasten = [];
    karteAktualisieren(); ivZeichnen();
  });

  function noteGetippt(id) {
    const n = notenNachId.get(id);
    if (!n) return;
    audioKontext();
    klinge([n.midi], { dauer: 1 });
    const i = segNachNote.get(id) ?? segmente.indexOf(segmentBei(segmente, n.t));
    Z.gewaehlt = i; Z.getippt = id; markiereAkkord();
    IV.bezug = { midi: n.midi, sw: n.schreibweise, id };
    IV.kontext = kontextFuer(n, segmente[i]);
    IV.tasten = [];
    karteZeigen(i, id);
    tast.leuchte(n.midi, Z.farben ? rollen.get(id) || 'fremd' : 'septime', 1200);
    tast.scrolleZu(n.midi);
    if (!sp.laeuft) markiere(svg, new Set([id]));
    ivZeichnen();
  }
  function akkordGewaehlt(i, hoeren) {
    const s = segmente[i];
    if (!s) return;
    Z.gewaehlt = i; Z.getippt = null; markiereAkkord();
    IV.kontext = s.noten.map(ausNote);
    IV.tasten = [];
    if (IV.bezug?.id && !s.noten.some((n) => n.id === IV.bezug.id)) IV.bezug = null; // Bezug aus einem anderen Akkord lösen
    karteZeigen(i);
    ivZeichnen();
    const midis = [...new Set(s.noten.map((n) => n.midi))].sort((a, b) => a - b);
    if (hoeren) { audioKontext(); klinge(midis, { dauer: 1.4, arpeggio: 0.07 }); }
    tast.scrolleZuBereich(midis[0], midis[midis.length - 1]);
    if (!sp.laeuft) markiere(svg, new Set(s.noten.map((n) => n.id)));
  }

  // Bereich (Schleife) über Takt-Tipps: 1. Tipp = Anfang, 2. Tipp = Ende
  let tippHinweis = null;
  function bereichSetzen(von, bis) {
    Z.von = von; Z.bis = bis;
    for (const r of svg.querySelectorAll('.ns-takt')) { const nr = +r.dataset.takt; r.classList.toggle('ns-schleife', nr >= von && nr <= bis); }
    const ganz = von === erster && bis === letzter;
    $('#bereichText').innerHTML = ganz ? `Ganzes Stück <small>· Takt antippen zum Wählen</small>` : `Takt ${von === bis ? von : von + '–' + bis} <small>${Z.wahl ? '· Ende antippen' : ''}</small>`;
    $('#bereich').querySelector('.x').style.visibility = ganz ? 'hidden' : 'visible';
    if (sp.laeuft) starten();
  }
  function taktGetippt(nr) {
    if (Z.wahl === 0) { Z.wahl = 1; bereichSetzen(nr, nr); zeigeTippHinweis('Jetzt den letzten Takt antippen'); }
    else { Z.wahl = 0; bereichSetzen(Math.min(Z.von, nr), Math.max(Z.von, nr)); zeigeTippHinweis(null); }
  }
  function zeigeTippHinweis(text) {
    if (tippHinweis) { tippHinweis.remove(); tippHinweis = null; }
    if (!text) return;
    tippHinweis = document.createElement('div'); tippHinweis.className = 'bereich-tipp'; tippHinweis.textContent = text;
    flaeche.appendChild(tippHinweis);
  }
  $('#bereich').onclick = () => { Z.wahl = 0; zeigeTippHinweis(null); bereichSetzen(erster, letzter); };

  // Wiedergabe
  const klingend = klingendeNoten(st);
  const sp = spieler({ ...st, noten: klingend }, {
    onNote(k, { an, stumm }) {
      if (stumm) return;
      const rolle = Z.farben ? rollen.get(k.id) || 'fremd' : 'septime';
      if (an) { tast.leuchte(k.midi, rolle, 0); for (const id of k.ids) Z.klingt.add(id); }
      else { tast.aus(k.midi); for (const id of k.ids) Z.klingt.delete(id); }
      Z.schmutzig = true;
    },
    onZeit(q) {
      if (Z.schmutzig) { markiere(svg, Z.klingt); Z.schmutzig = false; }
      const p = positionBei(q, svg);
      if (p && zeiger) {
        zeiger.setAttribute('visibility', 'visible');
        zeiger.setAttribute('x', p.x - 1.2); zeiger.setAttribute('y', p.y1); zeiger.setAttribute('height', p.y2 - p.y1);
        if (p.zeile !== Z.zeile) {
          Z.zeile = p.zeile;
          const zl = Z.layout.zeilen[p.zeile];
          const off = svg.offsetTop;
          const oben = off + zl.y, unten = off + zl.y + zl.hoehe;
          if (oben < flaeche.scrollTop || unten > flaeche.scrollTop + flaeche.clientHeight) flaeche.scrollTo({ top: Math.max(0, oben - 4), behavior: ruhig() ? 'auto' : 'smooth' });
        }
      }
      const s = segmentBei(segmente, q);
      const i = s ? segmente.indexOf(s) : -1;
      if (i !== Z.aktSeg) {
        Z.aktSeg = i; markiereAkkord();
        if (s) {
          if (IV.bezug) { IV.kontext = s.noten.map(ausNote); IV.tasten = []; }
          karteZeigen(i);
          const ms = s.noten.filter((n) => !Z.hand || (Z.hand === 'links' ? n.system === 'unten' : n.system === 'oben')).map((n) => n.midi);
          if (ms.length) tast.scrolleZuBereich(Math.min(...ms), Math.max(...ms));
        }
      }
    },
    onEnde() { gestoppt(); },
  });
  function starten() {
    audioKontext();
    Z.klingt.clear(); tast.alleAus(); Z.zeile = -1; Z.aktSeg = -1; Z.gewaehlt = -1; markiereAkkord();
    sp.spiele(Z.von, Z.bis, { schleife: Z.schleife, tempoFaktor: Z.tempo, nurHand: Z.hand, metronom: Z.metronom });
    ivZeichnen();
    const k = $('#spiel'); k.innerHTML = ICON.pause; k.setAttribute('aria-label', 'Anhalten');
  }
  function gestoppt() {
    Z.klingt.clear(); markiere(svg, Z.klingt); tast.alleAus();
    if (zeiger) zeiger.setAttribute('visibility', 'hidden');
    ivZeichnen();
    const k = $('#spiel'); if (!k) return;
    k.innerHTML = ICON.spielen; k.setAttribute('aria-label', 'Abspielen');
  }
  $('#spiel').onclick = () => { if (sp.laeuft) { sp.stopp(); gestoppt(); } else starten(); };

  const tempo = $('#tempo');
  tempo.oninput = () => { Z.tempo = +tempo.value / 100; $('#tempoW').textContent = tempo.value + ' %'; if (sp.laeuft) sp.setzeTempo(Z.tempo); };
  $('#schleife').onclick = (ev) => { Z.schleife = !Z.schleife; ev.currentTarget.setAttribute('aria-pressed', Z.schleife); toast(Z.schleife ? 'Schleife an' : 'Schleife aus'); if (sp.laeuft) starten(); };
  for (const b of app.querySelectorAll('.hand button')) b.onclick = () => {
    Z.hand = b.dataset.hand || null;
    for (const x of app.querySelectorAll('.hand button')) x.setAttribute('aria-pressed', x === b);
    if (sp.laeuft) starten();
  };
  $('#farben').onclick = (ev) => {
    Z.farben = !Z.farben; ev.currentTarget.setAttribute('aria-pressed', Z.farben);
    faerbe(svg, Z.farben ? farbenKarte : new Map());
    if (Z.gewaehlt >= 0) karteZeigen(Z.gewaehlt, Z.getippt); else if (Z.aktSeg >= 0) karteZeigen(Z.aktSeg); else karteAktualisieren();
  };
  $('#takt').onclick = (ev) => { audioKontext(); Z.metronom = !Z.metronom; ev.currentTarget.setAttribute('aria-pressed', Z.metronom); toast(Z.metronom ? 'Klick an' : 'Klick aus'); if (sp.laeuft) sp.setzeMetronom(Z.metronom); };
  $('#namen').onclick = (ev) => { Z.namen = !Z.namen; ev.currentTarget.setAttribute('aria-pressed', Z.namen); tast.setNamen(Z.namen ? 'alle' : 'c'); };
  $('#speichern').onclick = () => speichernBlatt(e);
  for (const b of app.querySelectorAll('[data-haende]')) b.onclick = () => { if (b.getAttribute('aria-pressed') !== 'true') haendeSetzen(id, b.dataset.haende); };

  // Hell/dunkel live: Farben neu berechnen
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const themaNeu = () => { farbenKarte = farbKarte(segmente, { dunkel: istDunkel() }); if (Z.farben) faerbe(svg, farbenKarte); };
  mq.addEventListener?.('change', themaNeu);

  // Breite: selbst neu umbrechen (hoch/quer)
  let letzteB = 0, raf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { const b = Math.floor(breite()); if (Math.abs(b - letzteB) > 8) { letzteB = b; malen(); Z.zeile = -1; } });
  });
  letzteB = Math.floor(breite());
  malen();
  bereichSetzen(erster, letzter);
  ro.observe(flaeche);
  // Tastatur: zum ersten Bass-Akkord
  requestAnimationFrame(() => { const s0 = segmente[0]; if (s0) tast.scrolleZu(s0.bassMidi, false); else tast.scrolleZu(48, false); });

  aufraeumen = () => { sp.stopp(); ro.disconnect(); mq.removeEventListener?.('change', themaNeu); };
  window.__klavier = { Z, IV, segmente, sp, tast, starten, stueck: st, rollenFarbe };
}

route();
