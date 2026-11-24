// app.js – Klavier-Lernhilfe: Seiten #start, #stueck/<id>, #uebungen[/<übung>]. Alles lokal, nichts wird gesendet.
import { einlesen } from './einlesen.js';
import { klingendeNoten } from './modell.js';
import { zeichne, faerbe, markiere, positionBei } from './notensatz.js';
import { analysiere, farbKarte, rollenKarte, segmentBei, notenName, ortImSystem, rollenFarbe, istDunkel, ROLLEN_NAME, ROLLEN_KURZ } from './akkorde.js';
import { tastatur } from './tastatur.js';
import { spieler, klinge, audioKontext } from './wiedergabe.js';
import { uebungen } from './uebungen.js';

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
  namen: I(`<rect x="3" y="5" width="18" height="14" rx="2" ${S}/><path d="M9 5v8M15 5v8" ${S}/><path d="M7.5 17h3M13.5 17h3" ${S}/>`, 'ico-k'),
  bild: I(`<rect x="3" y="4" width="18" height="16" rx="3" ${S}/><circle cx="9" cy="10" r="2" ${S}/><path d="M21 16l-5-5-8 8" ${S}/>`),
  bass: I('<path d="M6 7.5c3.5-2.6 9-1.5 8.6 3.6-.3 4.2-4.6 6.8-8.6 8.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="6.8" cy="9.6" r="1.8" fill="currentColor"/><circle cx="18" cy="8.5" r="1.2" fill="currentColor"/><circle cx="18" cy="13" r="1.2" fill="currentColor"/>'),
  stufen: I('<rect x="4" y="14" width="4" height="6" rx="1" fill="#22a06b"/><rect x="10" y="9" width="4" height="11" rx="1" fill="#f59e0b"/><rect x="16" y="4" width="4" height="16" rx="1" fill="#e5484d"/>'),
  abstand: I(`<path d="M5 18V6M19 18V6" ${S}/><path d="M8 12h8M10 9.5L8 12l2 2.5M14 9.5l2 2.5-2 2.5" ${S}/>`),
  pfeil: I(`<path d="M9 5l7 7-7 7" ${S}/>`, 'ico-k'),
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
    const st = await einlesen(roh.daten, roh.name);
    e = { titel: roh.titel || st.titel, wer: roh.name, stück: st };
  }
  geladen.set(id, e);
  return e;
}

// ───────── Hinweis-Blatt & Toast ─────────
function hinweis({ bild = ICON.bild, titel, text }) {
  const el = $('#hinweis');
  el.innerHTML = `<div class="blatt" role="document"><div class="bild">${bild}</div><h3>${esc(titel)}</h3>${text}<button class="ok" type="button">Alles klar</button></div>`;
  el.hidden = false;
  const zu = () => { el.hidden = true; el.innerHTML = ''; };
  el.onclick = (ev) => { if (ev.target === el || ev.target.closest('.ok')) zu(); };
  $('.ok', el).focus();
}
let toastZeit = 0;
function toast(text) {
  const t = $('#toast');
  t.textContent = text; t.classList.add('an');
  clearTimeout(toastZeit); toastZeit = setTimeout(() => t.classList.remove('an'), 2400);
}

// ───────── Datei laden ─────────
async function dateiLaden(datei) {
  if (!datei) return;
  try {
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
        titel: 'Bild oder PDF – noch nicht direkt',
        text: `<p>${esc(e.text)}.</p><p>Was hier <b>sofort</b> klappt: <b>MusicXML</b> (.musicxml, .xml, .mxl) und <b>MIDI</b> (.mid). Viele Notenseiten und Programme (z. B. MuseScore) bieten diese Formate zum Herunterladen an.</p><p>Ich erfinde keine Noten aus einem Bild – lieber ehrlich als falsch geübt.</p>`,
      });
    } else {
      hinweis({ bild: ICON.datei, titel: 'Das konnte ich nicht lesen', text: `<p>${esc((e && e.text) || (e && e.message) || 'Unbekannter Fehler')}</p><p>Möglich sind MusicXML (.musicxml, .xml, .mxl) und MIDI (.mid).</p>` });
    }
  }
}

// ───────── Router ─────────
let aufraeumen = null;
function route() {
  if (aufraeumen) { try { aufraeumen(); } catch { /* egal */ } aufraeumen = null; }
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
  const u = uebungen($('#ue'), { start: ['lesen', 'akkord', 'intervall'].includes(art) ? art : 'lesen' });
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
    </header>
    <div class="notenflaeche" id="flaeche"><svg id="noten" role="img" aria-label="Notenblatt"></svg></div>
    <section class="akkordkarte leer-k" id="karte" aria-live="polite"></section>
    <div class="steuer">
      <button class="spielen" id="spiel" type="button" aria-label="Abspielen">${ICON.spielen}</button>
      <div class="bereich"><button class="pille" id="bereich" type="button" aria-label="Bereich zurücksetzen"><span id="bereichText"></span><i class="x">${ICON.x}</i></button></div>
      <button class="schalter schleife-k" id="schleife" type="button" aria-pressed="true" aria-label="Schleife">${ICON.schleife}</button>
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
    farben: true, namen: false, schleife: true, hand: null, tempo: 0.7,
    von: erster, bis: letzter, wahl: 0, // wahl: 0 = nächster Tipp setzt Anfang, 1 = nächster Tipp setzt Ende
    gewaehlt: -1, aktSeg: -1, zeile: -1, layout: null, klingt: new Set(), schmutzig: false, kopfRaum: 0,
  };
  const tast = tastatur($('#tasten'), { von: 21, bis: 108, namen: 'c', beiTipp: (m) => { audioKontext(); klinge([m], { dauer: 0.9 }); tast.leuchte(m, Z.farben ? 'septime' : null, 400); } });
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
    karte.innerHTML = `<div class="gross">${esc(s.art === 'einzelton' ? s.grundton : s.kurz)}<small>${esc(s.name)}</small></div>
      <div><span class="umk">${esc(s.umkehrungText)}${s.art !== 'einzelton' ? ' · ' + (s.lage === 'weit' ? 'weite Lage' : 'enge Lage') : ''}</span><div class="toene">${toene.map((n) => tonChip(n, s.rollen.get(n.id), getippt && getippt.midi === n.midi)).join('')}</div></div>
      <button class="rund hoer" type="button" aria-label="Akkord anhören">${ICON.ohr}</button>
      <p class="erkl">${erkl}</p>`;
    $('.hoer', karte).onclick = () => akkordGewaehlt(i, true);
    // Tastatur: Akkordtöne in Rollenfarben, mit 1·3·5·7
    const fb = new Map();
    for (const n of toene) fb.set(n.midi, Z.farben ? s.rollen.get(n.id) : 'fremd');
    tast.zeige(new Set(fb.keys()), fb);
  }
  function karteLeer() {
    karte.className = 'akkordkarte leer-k';
    karte.innerHTML = '<div>Tippe auf eine <b>Note</b> oder einen <b>Akkordnamen</b> – oder auf einen Takt, um den Übe-Bereich zu wählen.</div>';
  }
  karteLeer();

  function noteGetippt(id) {
    const n = notenNachId.get(id);
    if (!n) return;
    audioKontext();
    klinge([n.midi], { dauer: 1 });
    const i = segNachNote.get(id) ?? segmente.indexOf(segmentBei(segmente, n.t));
    Z.gewaehlt = i; markiereAkkord();
    karteZeigen(i, id);
    tast.leuchte(n.midi, Z.farben ? rollen.get(id) || 'fremd' : 'septime', 1200);
    tast.scrolleZu(n.midi);
    if (!sp.laeuft) markiere(svg, new Set([id]));
  }
  function akkordGewaehlt(i, hoeren) {
    const s = segmente[i];
    if (!s) return;
    Z.gewaehlt = i; markiereAkkord();
    karteZeigen(i);
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
          const oben = zl.y, unten = zl.y + zl.hoehe;
          if (oben < flaeche.scrollTop || unten > flaeche.scrollTop + flaeche.clientHeight) flaeche.scrollTo({ top: Math.max(0, oben - 4), behavior: ruhig() ? 'auto' : 'smooth' });
        }
      }
      const s = segmentBei(segmente, q);
      const i = s ? segmente.indexOf(s) : -1;
      if (i !== Z.aktSeg) {
        Z.aktSeg = i; markiereAkkord();
        if (s) {
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
    sp.spiele(Z.von, Z.bis, { schleife: Z.schleife, tempoFaktor: Z.tempo, nurHand: Z.hand });
    const k = $('#spiel'); k.innerHTML = ICON.pause; k.setAttribute('aria-label', 'Anhalten');
  }
  function gestoppt() {
    Z.klingt.clear(); markiere(svg, Z.klingt); tast.alleAus();
    if (zeiger) zeiger.setAttribute('visibility', 'hidden');
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
    if (Z.gewaehlt >= 0) karteZeigen(Z.gewaehlt); else if (Z.aktSeg >= 0) karteZeigen(Z.aktSeg);
  };
  $('#namen').onclick = (ev) => { Z.namen = !Z.namen; ev.currentTarget.setAttribute('aria-pressed', Z.namen); tast.setNamen(Z.namen ? 'alle' : 'c'); };

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
  window.__klavier = { Z, segmente, sp, tast, starten, stueck: st, rollenFarbe };
}

route();
