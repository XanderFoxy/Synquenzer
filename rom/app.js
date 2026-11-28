/* Roma – römische Geschichte spielerisch lernen + Rom-Stadtführer.
   Ohne Bibliotheken. Die Karte lädt Leaflet erst, wenn man sie öffnet (cdnjs, feste Version, Prüfsumme).
   Daten: daten/app/geschichte.json und daten/app/orte.json (gebaut von skripte/bau_app.py). */
'use strict';
(() => {
  const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
  const LEAFLET_SRI = 'sha512-BwHfrr4c9kmRkLw6iXFdzcdWV/PGkVgiIyIWLLlTSXzWQzxuSg4DiQUCpauz/EWjgk5TYQqX/kvn9pG1NpYfqg==';
  const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
  const KACHELN = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const OSM_HINWEIS = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende';
  const ROM_MITTE = [41.8955, 12.4823];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const ruhig = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zahl = (n) => String(n).replace('.', ',');

  /* ---------- Symbole (selbst gezeichnet) ---------- */
  const IK = {
    saeule: '<path d="M4.5 5.5h15M6 8h12M8 8v10M12 8v10M16 8v10M6 18h12M4.5 20.5h15"/><path d="M6.5 5.5C5.6 4 6.6 3.3 8 3.3h8c1.4 0 2.4.7 1.5 2.2"/>',
    lorbeer: '<path d="M12 20.5C7 19 4.5 15 5 8M12 20.5c5-1.5 7.5-5.5 7-12.5"/><g class="voll"><ellipse cx="8.5" cy="20.6" rx="1.25" ry="2.5" transform="rotate(-83 8.5 20.6)"/><ellipse cx="5.57" cy="17.75" rx="1.25" ry="2.5" transform="rotate(-60 5.57 17.75)"/><ellipse cx="3.89" cy="13.85" rx="1.25" ry="2.5" transform="rotate(-38 3.89 13.85)"/><ellipse cx="3.5" cy="7.9" rx="1.25" ry="2.5" transform="rotate(-21 3.5 7.9)"/><ellipse cx="5.1" cy="5.6" rx="1.25" ry="2.5" transform="rotate(4 5.1 5.6)"/><ellipse cx="15.5" cy="20.6" rx="1.25" ry="2.5" transform="rotate(83 15.5 20.6)"/><ellipse cx="18.43" cy="17.75" rx="1.25" ry="2.5" transform="rotate(60 18.43 17.75)"/><ellipse cx="20.11" cy="13.85" rx="1.25" ry="2.5" transform="rotate(38 20.11 13.85)"/><ellipse cx="20.5" cy="7.9" rx="1.25" ry="2.5" transform="rotate(21 20.5 7.9)"/><ellipse cx="18.9" cy="5.6" rx="1.25" ry="2.5" transform="rotate(-4 18.9 5.6)"/></g>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    amphore: '<path d="M9.5 3.5h5M10.3 3.5v2.3C7.4 7.2 6 9.6 6 12.6c0 3.4 2.3 6.2 4.3 7.9h3.4c2-1.7 4.3-4.5 4.3-7.9 0-3-1.4-5.4-4.3-6.8V3.5"/><path d="M10.3 6.2C8 5.6 5.6 6.8 5.6 9.2M13.7 6.2c2.3-.6 4.7.6 4.7 3M7.2 14h9.6"/>',
    bogen: '<path d="M3 20.5h18M4.5 20.5V10c0-2.8 3.4-5 7.5-5s7.5 2.2 7.5 5v10.5"/><path d="M4.5 13h15M8 20.5v-3.2a1.3 1.3 0 0 1 2.6 0v3.2M13.4 20.5v-3.2a1.3 1.3 0 0 1 2.6 0v3.2M8 13v-1.6a1.3 1.3 0 0 1 2.6 0V13M13.4 13v-1.6a1.3 1.3 0 0 1 2.6 0V13"/>',
    schluessel: '<circle cx="7.5" cy="12" r="3.8"/><path d="M11.3 12H21M18.2 12v3.2M15.4 12v2.4"/>',
    weg: '<circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="5.5" r="2"/><path d="M7.5 18.5h7a3.3 3.3 0 0 0 0-6.6h-5a3.3 3.3 0 0 1 0-6.6h7" stroke-dasharray="2.2 2.6"/>',
    karte: '<path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>',
    liste: '<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12"/><circle cx="4.2" cy="6.5" r="1.1" class="voll"/><circle cx="4.2" cy="12" r="1.1" class="voll"/><circle cx="4.2" cy="17.5" r="1.1" class="voll"/>',
    stern: '<path class="voll" d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.86l-5.5 2.9 1.05-6.13L3.1 9.3l6.15-.9z"/>',
    uhr: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    muenze: '<circle cx="12" cy="12" r="8.5"/><path d="M15 8.6a4.2 4.2 0 1 0 0 6.8M7.5 11h6M7.5 13.2h6"/>',
    haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    kreuz: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    merken: '<path d="M7 3.5h10v17l-5-3.8-5 3.8z"/>',
    auge: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    links: '<path d="M15 5l-7 7 7 7"/>',
    rechts: '<path d="M9 5l7 7-7 7"/>',
    extern: '<path d="M14 4.5h5.5V10M19.5 4.5 11 13"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    drehen: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7"/>',
    griff: '<circle cx="9" cy="6" r="1.6" class="voll"/><circle cx="15" cy="6" r="1.6" class="voll"/><circle cx="9" cy="12" r="1.6" class="voll"/><circle cx="15" cy="12" r="1.6" class="voll"/><circle cx="9" cy="18" r="1.6" class="voll"/><circle cx="15" cy="18" r="1.6" class="voll"/>',
    standort: '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" class="voll"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    alle: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    frage: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 1 1 4 2.6c-.8.4-1.3 1-1.3 1.9v.6"/><circle cx="12" cy="17.2" r="1" class="voll"/>',
    sanduhr: '<path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5S7.5 16 7.5 20.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5"/><path d="M9.5 18.5c.8-1.3 1.6-1.8 2.5-1.8s1.7.5 2.5 1.8z" class="voll"/>',
    karten: '<rect x="3.5" y="7" width="12.5" height="13.5" rx="2"/><path d="M8 7V5a1.5 1.5 0 0 1 1.5-1.5H19A1.5 1.5 0 0 1 20.5 5v11a1.5 1.5 0 0 1-1.5 1.5h-3"/>',
    person: '<circle cx="12" cy="8.5" r="3.7"/><path d="M4.8 20.5a7.2 7.2 0 0 1 14.4 0"/>',
    personen: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
    feder: '<path d="M20 4c-7 0-12.5 5-13.6 12.3L5 20"/><path d="M20 4c0 6.5-4.6 11.6-11.6 12.6M9.5 12.5h5"/>',
    rolle: '<path d="M7 4.5h10.5a2.5 2.5 0 0 1 0 5H16v8.5a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5V17H5V7a2.5 2.5 0 0 1 2.5-2.5zM16 9.5h-6M8 12.5h5M8 15.5h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.7" r=".9" class="voll"/>',
    achtung: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r=".9" class="voll"/>',
    zitat: '<path class="voll" d="M4 17.5v-4.6C4 9 6 6.5 9.6 5.6l.7 1.6C8.3 8 7.4 9.5 7.3 11.5H10v6zm9.5 0v-4.6c0-3.9 2-6.4 5.6-7.3l.7 1.6c-2 .8-2.9 2.3-3 4.3h2.7v6z"/>',
    suche: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    schritte: '<circle cx="13.5" cy="4.5" r="1.9"/><path d="M9.5 21l2.2-6.2 3 2.7V21M8.3 12.8l1.8-4.6 3.8 1.1 2 3.4M10.1 8.2 7 10.5v3"/>',
    kirche: '<path d="M12 2.5v3.5M10.5 4h3"/><path d="M6.5 11.5a5.5 5.5 0 0 1 11 0"/><path d="M4.5 20.5v-9h15v9M3 20.5h18M10 20.5v-4a2 2 0 0 1 4 0v4"/>',
    museum: '<path d="M3 9 12 4l9 5M4.5 9h15M3.5 20.5h17M5 18.5h14M6.5 11v7.5M10 11v7.5M14 11v7.5M17.5 11v7.5"/>',
    platz: '<path d="M12 2.5 10.2 6v12.5h3.6V6z"/><path d="M7.5 18.5h9l1 2h-11zM3 20.5h18"/>',
    brunnen: '<path d="M3.5 14h17l-1.6 4.2a3 3 0 0 1-2.8 1.8H7.9a3 3 0 0 1-2.8-1.8z"/><path d="M12 14V7.5M12 7.5c-2.2 0-4 1.3-4.5 3.5M12 7.5c2.2 0 4 1.3 4.5 3.5"/><path d="M12 3.2c-.9 1.2-1.3 2-1.3 2.7a1.3 1.3 0 0 0 2.6 0c0-.7-.4-1.5-1.3-2.7z"/>',
    viertel: '<path d="M3 20.5h18M4.5 20.5v-8l4-3.5 4 3.5v8M12.5 20.5V8.5l4-3.5 4 3.5v12"/><path d="M7.5 20.5v-3h2v3M15.5 11h2M15.5 14.5h2"/>',
    aussicht: '<path d="M2.5 19.5l6-7 4 4.5 3-3.2 6 5.7z"/><circle cx="16.5" cy="7" r="2.8"/>',
    ausflug: '<path d="M8 20.5 10.5 3.5M16 20.5 13.5 3.5M12 6v2.2M12 11v2.4M12 16.5v3"/>',
    besteck: '<path d="M7 3v7.5M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 10.5v10M17 20.5V3c-2.5 1.5-3.5 4-3.5 7.5V13H17"/>',
    tasse: '<path d="M4.5 9.5h12v4.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 11h1.5a2.5 2.5 0 0 1 0 5h-2M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3"/>',
    mond: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
    fest: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="2.6"/>',
    erlebnis: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 16v4M16.5 18h4"/>',
    ticket: '<path d="M3.5 8V6.5h17V8a2.5 2.5 0 0 0 0 5v4.5h-17V13a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2"/>',
    kleidung: '<path d="M8.5 3.5 4 6l1.5 4 2-.8v11.3h9V9.2l2 .8L20 6l-4.5-2.5c-.5 1.5-1.8 2.5-3.5 2.5s-3-1-3.5-2.5z"/>',
    tropfen: '<path d="M12 3.5c-3.5 4.5-5.5 7.7-5.5 10.3a5.5 5.5 0 0 0 11 0c0-2.6-2-5.8-5.5-10.3z"/>',
    schloss: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
    bus: '<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8 17.5v2.5M16 17.5v2.5"/><circle cx="8.5" cy="14.3" r=".9" class="voll"/><circle cx="15.5" cy="14.3" r=".9" class="voll"/>',
    kalender: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><circle cx="12" cy="14.5" r="1.4" class="voll"/>',
    sonne: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/>',
    flugzeug: '<path d="M10.5 20.5 12 15l-7.5 1.5v-2L12 10V4.8a1.5 1.5 0 0 1 3 0V10l6.5 4.5v2L15 15l1.5 5.5z"/>',
    telefon: '<path d="M5 4h3.5l1.5 4-2 1.3a10.5 10.5 0 0 0 6.7 6.7l1.3-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
    pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };
  IK.antik = IK.saeule;
  const ic = (n, k = '') => `<svg class="ic ${k}" viewBox="0 0 24 24" aria-hidden="true">${IK[n] || IK.info}</svg>`;
  const KRANZ = '<svg class="kranz ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5C7 19 4.5 15 5 8M12 20.5c5-1.5 7.5-5.5 7-12.5"/><g class="voll"><ellipse cx="8.5" cy="20.6" rx="1.25" ry="2.5" transform="rotate(-83 8.5 20.6)"/><ellipse cx="5.57" cy="17.75" rx="1.25" ry="2.5" transform="rotate(-60 5.57 17.75)"/><ellipse cx="3.89" cy="13.85" rx="1.25" ry="2.5" transform="rotate(-38 3.89 13.85)"/><ellipse cx="3.5" cy="7.9" rx="1.25" ry="2.5" transform="rotate(-21 3.5 7.9)"/><ellipse cx="5.1" cy="5.6" rx="1.25" ry="2.5" transform="rotate(4 5.1 5.6)"/><ellipse cx="15.5" cy="20.6" rx="1.25" ry="2.5" transform="rotate(83 15.5 20.6)"/><ellipse cx="18.43" cy="17.75" rx="1.25" ry="2.5" transform="rotate(60 18.43 17.75)"/><ellipse cx="20.11" cy="13.85" rx="1.25" ry="2.5" transform="rotate(38 20.11 13.85)"/><ellipse cx="20.5" cy="7.9" rx="1.25" ry="2.5" transform="rotate(21 20.5 7.9)"/><ellipse cx="18.9" cy="5.6" rx="1.25" ry="2.5" transform="rotate(-4 18.9 5.6)"/></g></svg>';

  /* ---------- Feste Zuordnungen ---------- */
  const ARTEN = {
    antik: { name: 'Antike', eins: 'Antike Stätte', farbe: '#A84B29', ik: 'saeule' },
    kirche: { name: 'Kirchen', eins: 'Kirche', farbe: '#2C5F8A', ik: 'kirche' },
    museum: { name: 'Museen', eins: 'Museum', farbe: '#6B2A6E', ik: 'museum' },
    platz: { name: 'Plätze', eins: 'Platz', farbe: '#9A6E1C', ik: 'platz' },
    brunnen: { name: 'Brunnen', eins: 'Brunnen', farbe: '#23808C', ik: 'brunnen' },
    viertel: { name: 'Viertel', eins: 'Viertel', farbe: '#5F7530', ik: 'viertel' },
    aussicht: { name: 'Aussichten', eins: 'Aussicht', farbe: '#C0602F', ik: 'aussicht' },
    ausflug: { name: 'Ausflüge', eins: 'Ausflug', farbe: '#55596E', ik: 'ausflug' },
  };
  const ORT_EP = {
    'Königszeit': '#9B4F2E', 'Republik': '#C8653A', 'Kaiserzeit': '#6B2A6E', 'Spätantike': '#2C5F8A',
    'Mittelalter': '#2A7C7A', 'Renaissance': '#B0487A', 'Barock': '#B8862A', 'Neuzeit': '#4E9A3A',
  };
  const ERL_TYP = {
    essen: { name: 'Essen & Trinken', farbe: '#B5532F', ik: 'besteck' },
    erlebnis: { name: 'Erlebnisse', farbe: '#23808C', ik: 'erlebnis' },
    abend: { name: 'Abends', farbe: '#4A3F7A', ik: 'mond' },
    fest: { name: 'Feste', farbe: '#9A6E1C', ik: 'fest' },
  };
  const STUFEN = {
    1: { name: 'Leicht', unter: 'für Rekruten', farbe: '#4E8A3A' },
    2: { name: 'Mittel', unter: 'für Legionäre', farbe: '#C0602F' },
    3: { name: 'Schwer', unter: 'für Konsuln', farbe: '#6B2A6E' },
  };
  const DECKS = {
    merk: { name: 'Eselsbrücken', unter: 'Merkhilfen für die großen Daten', farbe: '#B8862A', ik: 'lorbeer' },
    daten: { name: 'Kerndaten', unter: 'Die wichtigsten Jahreszahlen', farbe: '#A84B29', ik: 'kalender' },
    koepfe: { name: 'Köpfe Roms', unter: 'Personen mit Merksatz', farbe: '#2C5F8A', ik: 'person' },
  };
  const RAENGE = [
    { ab: 0, name: 'Tiro', was: 'Rekrut' }, { ab: 3, name: 'Legionär', was: 'Soldat' }, { ab: 7, name: 'Centurio', was: 'Hauptmann' },
    { ab: 11, name: 'Tribun', was: 'Offizier' }, { ab: 15, name: 'Senator', was: 'Ratsherr' }, { ab: 19, name: 'Konsul', was: 'Staatsoberhaupt' },
    { ab: 23, name: 'Imperator', was: 'Feldherr' },
  ];
  const MAX_STERNE = 24;
  const ROEM_NR = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  /* ---------- Speicher (nur auf diesem Gerät) ---------- */
  const SP_KEY = 'roma-v1';
  let sp = {};
  try { sp = JSON.parse(localStorage.getItem(SP_KEY)) || {}; } catch (e) { sp = {}; }
  if (typeof sp !== 'object' || !sp) sp = {};
  const speichern = () => { try { localStorage.setItem(SP_KEY, JSON.stringify(sp)); } catch (e) { /* privat/voll: dann eben nur für diese Sitzung */ } };
  const liste = (k) => (Array.isArray(sp[k]) ? sp[k] : (sp[k] = []));
  const hat = (k, id) => liste(k).includes(id);
  function umschalten(k, id) {
    const l = liste(k);
    const i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    speichern();
    return i < 0;
  }

  /* ---------- Hilfen ---------- */
  function jahrKurz(e) {
    const j = e.jahr;
    const t = j < 0 ? `${-j} v. Chr.` : (j < 1000 ? `${j} n. Chr.` : String(j));
    return (e.ca ? 'um ' : '') + t;
  }
  function jahrNackt(j) { return j < 0 ? `${-j} v. Chr.` : (j < 600 ? `${j} n. Chr.` : String(j)); }
  function zeitraum(von, bis) {
    if (von < 0 && bis <= 0) return `${-von}–${-bis} v. Chr.`;
    if (von < 0) return `${-von} v. Chr. – ${bis} n. Chr.`;
    return `${von}–${bis}`;
  }
  function roemisch(n) {
    n = Math.abs(n);
    if (!n || n > 3999) return '';
    const W = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = '';
    for (const [w, z] of W) while (n >= w) { s += z; n -= w; }
    return s;
  }
  const ABK = new Set(['v', 'n', 'Chr', 'ca', 'Jh', 'z', 'B', 'St', 'Nr', 'bzw', 'u', 'a', 'd', 'h', 'Mio', 'Mrd', 'gest', 'geb']);
  function ersterSatz(t) {
    const re = /([.!?])\s+(?=[A-ZÄÖÜ„])/g;
    let m;
    while ((m = re.exec(t))) {
      const vor = t.slice(0, m.index).split(/\s/).pop();
      if (ABK.has(vor) || /\d$/.test(vor) || /^[IVXLC]+$/.test(vor)) continue;
      return t.slice(0, m.index + 1);
    }
    return t;
  }
  function mischen(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function norm(s) {
    return String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'´`]/g, '');
  }
  function abstand(a, b) {
    const r = 6371000, p1 = a.lat * Math.PI / 180, p2 = b.lat * Math.PI / 180;
    const dp = p2 - p1, dl = (b.lon - a.lon) * Math.PI / 180;
    const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * r * Math.asin(Math.sqrt(x));
  }
  const meter = (m) => (m < 950 ? `${Math.round(m / 50) * 50 || 50} m` : `${zahl((m / 1000).toFixed(1))} km`);
  const minuten = (m) => (m < 60 ? `${m} Min.` : `${Math.floor(m / 60)} Std.${m % 60 ? ' ' + (m % 60) + ' Min.' : ''}`);
  function sterneHtml(n, gross) {
    return `<span class="sterne${gross ? ' gross' : ''}" aria-label="${n} von 3 Sternen">${[0, 1, 2].map((i) => ic('stern', i < n ? 'an' : 'aus')).join('')}</span>`;
  }
  let meldungZeit = 0;
  function meldung(t) {
    const m = $('#meldung');
    m.textContent = t;
    m.classList.add('zeigen');
    clearTimeout(meldungZeit);
    meldungZeit = setTimeout(() => m.classList.remove('zeigen'), 2600);
  }

  /* ---------- Daten (erst laden, wenn gebraucht) ---------- */
  const daten = {};
  function lade(name) {
    if (!daten[name]) {
      daten[name] = fetch(`daten/app/${name}.json`)
        .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then((d) => (name === 'geschichte' ? aufbereitenG(d) : aufbereitenO(d)));
      daten[name].catch(() => { delete daten[name]; });
    }
    return daten[name];
  }
  const ladeG = () => lade('geschichte');
  const ladeO = () => lade('orte');
  function aufbereitenG(G) {
    G.ep = {}; G.ev = {}; G.pers = {}; G.evNachOrt = {}; G.evNachPerson = {};
    G.epochen.forEach((e) => { G.ep[e.id] = e; });
    G.personen.forEach((p) => { G.pers[p.id] = p; });
    G.ereignisse.forEach((e, i) => {
      e.i = i;
      G.ev[e.id] = e;
      e.orte.forEach((o) => (G.evNachOrt[o] = G.evNachOrt[o] || []).push(e));
      (e.personen || []).forEach((p) => (G.evNachPerson[p] = G.evNachPerson[p] || []).push(e));
    });
    return G;
  }
  function aufbereitenO(O) {
    O.ort = {}; O.tippsNachOrt = {}; O.routeNachOrt = {};
    O.orte.forEach((o) => { O.ort[o.id] = o; });
    O.geheimtipps.forEach((t) => { if (t.ort_id) (O.tippsNachOrt[t.ort_id] = O.tippsNachOrt[t.ort_id] || []).push(t); });
    O.routen.forEach((r) => r.stopps.forEach((s) => (O.routeNachOrt[s] = O.routeNachOrt[s] || []).push(r)));
    return O;
  }

  /* ---------- Rang und Sterne ---------- */
  function deckSterne(d) {
    const k = sp.karten && sp.karten[d];
    if (!k || !k.n) return 0;
    const a = (k.g || []).length / k.n;
    return a >= 1 ? 3 : a >= 0.6 ? 2 : a >= 0.3 ? 1 : 0;
  }
  function entdeckerSterne() { const n = liste('gesehen').length; return n >= 30 ? 3 : n >= 15 ? 2 : n >= 5 ? 1 : 0; }
  function rang() {
    const q = sp.quiz || {};
    let s = (q[1] || 0) + (q[2] || 0) + (q[3] || 0) + ((sp.zr && sp.zr.best) || 0);
    s += deckSterne('merk') + deckSterne('daten') + deckSterne('koepfe') + entdeckerSterne();
    let i = 0;
    RAENGE.forEach((r, k) => { if (s >= r.ab) i = k; });
    const jetzt = RAENGE[i], naechster = RAENGE[i + 1];
    const anteil = naechster ? (s - jetzt.ab) / (naechster.ab - jetzt.ab) : 1;
    return { sterne: s, ...jetzt, i, naechster, anteil };
  }

  /* ---------- Bausteine ---------- */
  const SEG = {
    geschichte: [{ key: 'zeit', href: '#/zeit', label: 'Zeitstrahl', ik: 'saeule' }, { key: 'personen', href: '#/personen', label: 'Personen', ik: 'personen' }],
    orte: [{ key: 'orte', href: '#/orte', label: 'Liste', ik: 'liste' }, { key: 'karte', href: '#/karte', label: 'Karte', ik: 'karte' }, { key: 'wege', href: '#/wege', label: 'Spaziergänge', ik: 'weg' }],
    erleben: [{ key: 'erleben', href: '#/erleben', label: 'Erleben', ik: 'erlebnis' }, { key: 'tipps', href: '#/tipps', label: 'Geheimtipps', ik: 'schluessel' }, { key: 'praktisch', href: '#/praktisch', label: 'Praktisch', ik: 'info' }],
  };
  const segZuletzt = {};
  function segment(gruppe, aktiv) {
    const items = SEG[gruppe];
    const i = Math.max(0, items.findIndex((x) => x.key === aktiv));
    const vorher = segZuletzt[gruppe] == null ? i : segZuletzt[gruppe];
    segZuletzt[gruppe] = i;
    return `<nav class="segment" aria-label="Ansicht wählen"><span class="segment-zeiger" data-ziel="${i}" style="width:calc((100% - 8px) / ${items.length});transform:translateX(${vorher * 100}%)"></span>${
      items.map((x) => `<a href="${x.href}"${x.key === aktiv ? ' class="aktiv" aria-current="page"' : ''}>${ic(x.ik)}<span>${x.label}</span></a>`).join('')}</nav>`;
  }
  function ortKarte(o, extra = '', kompakt = false) {
    const a = ARTEN[o.art] || ARTEN.antik;
    if (kompakt) {
      return `<a class="link-karte ort-karte" href="#/ort/${o.id}"><span class="ort-ikon" style="--f:${a.farbe}">${ic(a.ik)}</span>
        <span class="lk-text"><b>${esc(o.name)}</b><span class="ort-meta">${extra}${o.geheimtipp ? `<span class="marke-tag gt">${ic('schluessel')}Geheimtipp</span>` : ''}</span></span>${ic('rechts')}</a>`;
    }
    return `<a class="link-karte ort-karte" href="#/ort/${o.id}">
      <span class="ort-ikon" style="--f:${a.farbe}">${ic(a.ik)}</span>
      <span class="lk-text"><b>${esc(o.name)}</b><small class="kurz">${esc(o.kurz)}</small>
        <span class="ort-meta"><span class="ep-tag" style="--f:${ORT_EP[o.epoche] || '#888'}">${esc(o.epoche)}</span>
        <span class="marke-tag">${ic('uhr')}${minuten(o.dauer_min)}</span>
        ${o.geheimtipp ? `<span class="marke-tag gt">${ic('schluessel')}Geheimtipp</span>` : ''}
        ${hat('gesehen', o.id) ? `<span class="marke-tag belegt">${ic('haken')}gesehen</span>` : ''}${extra}</span></span>
      ${ic('rechts')}</a>`;
  }
  function evKarte(e, G) {
    const ep = G.ep[e.epoche];
    return `<a class="link-karte" href="#/ereignis/${e.id}"><span class="jahr-marke" style="--f:${ep.farbe}">${esc(jahrKurz(e))}</span>
      <span class="lk-text"><b>${esc(e.titel)}</b><small>${e.mythos ? `<span class="marke-tag sage">${ic('feder')}Sage</span> ` : ''}${esc(ep.name)}</small></span>${ic('rechts')}</a>`;
  }
  function personKarte(p) {
    return `<a class="link-karte person-karte" href="#/person/${p.id}"><span class="monogramm${p.sage ? ' sage' : ''}">${esc(p.name.replace(/^(Papst|Kaiser|König)\s+/, '').charAt(0))}</span>
      <span class="lk-text"><b>${esc(p.name)}</b><small>${esc(p.lebte)} · ${esc(p.rolle)}</small></span>${ic('rechts')}</a>`;
  }
  function quelle(q) {
    if (!q || !q.url) return '';
    return `<a class="quelle-link" href="${esc(q.url)}" target="_blank" rel="noopener">${ic('extern')}${esc(q.titel || 'Quelle')}</a>`;
  }
  const sageTag = () => `<span class="marke-tag sage">${ic('feder')}Sage</span>`;

  /* ---------- Startbild (gezeichnet) ---------- */
  function heldSvg() {
    let boegen = '';
    for (let x = 28; x <= 146; x += 15) {
      boegen += `M${x} 160v-17a5 5 0 0 1 10 0v17z`;
      if (x <= 141) boegen += `M${x} 134v-14a5 5 0 0 1 10 0v14z`;
      if (x <= 131) boegen += `M${x} 110v-12a5 5 0 0 1 10 0v12z`;
    }
    let fenster = '';
    for (let x = 30; x <= 120; x += 15) fenster += `M${x} 86h6v5h-6z`;
    return `<svg viewBox="0 0 400 220" aria-hidden="true">
      <defs><linearGradient id="hh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6BE7E"/><stop offset=".55" stop-color="#EC925F"/><stop offset="1" stop-color="#D06A3E"/></linearGradient></defs>
      <rect width="400" height="220" fill="url(#hh)"/>
      <circle cx="292" cy="98" r="36" fill="#FCE0AE" opacity=".8"/>
      <path d="M0 146c60-20 110-12 160-6s100-16 160-6 80-4 80-4v90H0z" fill="#D9774C" opacity=".75"/>
      <g fill="#8A3A1E"><path d="M248 128h88v34h-88zM242 130l50-12 50 12z"/><path d="M270 112h44v18h-44z"/><path d="M266 113a26 26 0 0 1 52 0z"/><path d="M288 74h8v14h-8z"/><circle cx="292" cy="72" r="3.4"/><path d="M291 60h2v9h-2zM289 63h6v1.6h-6z"/></g>
      <g fill="#6A2A14"><path d="M210 162c2-18-1-30-8-42l3-1.5c8 12 11 25 9 43.5z"/><path d="M168 118c6-15 30-19 43-12 10-9 35-7 41 6 9 0 13 7 6 11-21 6-72 6-91 0-6-1-6-4 1-5z"/></g>
      <path d="M360 162c-6-22-4-54 4-76 8 22 10 54 4 76z" fill="#6A2A14"/><path d="M378 162c-4-15-3-37 3-52 6 15 7 37 3 52z" fill="#6A2A14" opacity=".85"/>
      <path d="M20 160V80q50-14 100-10l6 6 4-2 8 12 6-3 10 18 6-2 10 16V160z" fill="#F7E9D3"/>
      <path d="M20 80q50-14 100-10v6q-50-4-100 10z" fill="#E4CDA9"/>
      <path d="${boegen}" fill="#C26A3F"/><path d="${fenster}" fill="#D8B48E"/>
      <path d="M20 136h150M20 112h122" stroke="#E4CDA9" stroke-width="2"/>
      <rect y="160" width="400" height="60" fill="#7A3018"/><rect y="160" width="400" height="3" fill="#5E2410"/>
    </svg>`;
  }

  /* ================= Ansichten ================= */

  async function vStart() {
    const r = rang();
    const kachel = (href, ik, farbe, titel, text) => `<a class="kachel" href="${href}" style="--f:${farbe}">${ic(ik)}<b>${titel}</b><small>${text}</small></a>`;
    const html = `
      <section class="held">${heldSvg()}<div class="held-text"><h1 class="roemisch">Roma</h1><p>Geschichte spielerisch lernen – und die Ewige Stadt entdecken.</p></div></section>
      <a class="rang-karte" href="#/lernen">${ic('lorbeer')}<span class="rang-text"><small>Dein Rang</small><b>${r.name}</b>
        <span class="balken"><i style="transform:scaleX(${r.anteil.toFixed(3)})"></i></span>
        <small>${r.sterne} von ${MAX_STERNE} Sternen${r.naechster ? ` · noch ${r.naechster.ab - r.sterne} bis ${r.naechster.name}` : ' · höchster Rang!'}</small></span>${ic('rechts')}</a>
      <div class="kacheln">
        ${kachel('#/zeit', 'saeule', '#8A3A1E', 'Zeitstrahl', 'Von der Sage bis 1929 – farbig nach Epochen')}
        ${kachel('#/lernen', 'lorbeer', '#9A6E1C', 'Lernen', 'Quiz, Zeitreise, Karteikarten, Sterne')}
        ${kachel('#/orte', 'pin', '#2C5F8A', 'Sehenswürdigkeiten', 'Was es ist, warum hin, Tipps')}
        ${kachel('#/karte', 'karte', '#23808C', 'Karte', 'Alle Orte auf dem Stadtplan')}
        ${kachel('#/wege', 'weg', '#5F7530', 'Spaziergänge', 'Drei Routen zu Fuß')}
        ${kachel('#/erleben', 'erlebnis', '#B5532F', 'Erleben', 'Essen, Abende, Feste – und warum')}
        ${kachel('#/tipps', 'schluessel', '#6B2A6E', 'Geheimtipps', 'Wo kaum jemand hinschaut')}
        ${kachel('#/praktisch', 'info', '#55596E', 'Praktisch', 'Tickets, Kleidung, Wasser, Verkehr')}
      </div>
      <section class="abschnitt"><h2>${ic('sonne')}Heute entdecken</h2><div class="raster" id="fund"><div class="lade-block"></div><div class="lade-block"></div></div></section>`;
    return {
      tab: 'start', titel: '', html,
      nach: async () => {
        const fund = $('#fund');
        try {
          const [G, O] = await Promise.all([ladeG(), ladeO()]);
          if (!fund.isConnected) return;
          const tag = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
          const pool = G.ereignisse.filter((e) => e.orte.length && e.wichtig >= 2);
          const e = pool[tag % pool.length];
          const ep = G.ep[e.epoche];
          const t = O.geheimtipps[(tag * 7) % O.geheimtipps.length];
          fund.innerHTML = `
            <a class="karte fund-karte" href="#/ereignis/${e.id}" style="--f:${ep.farbe}"><span class="jahr">${esc(jahrKurz(e))} · ${esc(ep.name)}</span>
              <h3>${esc(e.titel)}</h3><p>${esc(ersterSatz(e.text))}</p><span class="weiter-link">Weiterlesen ${ic('pfeil')}</span></a>
            <a class="karte fund-karte" href="${t.ort_id ? '#/ort/' + t.ort_id : '#/tipps'}" style="--f:#9A6E1C"><span class="jahr">${ic('schluessel', 'klein')} Geheimtipp</span>
              <h3>${esc(t.titel)}</h3><p>${esc(t.warum)}</p><span class="weiter-link">${t.ort_id ? 'Zum Ort' : 'Alle Geheimtipps'} ${ic('pfeil')}</span></a>`;
        } catch (err) {
          fund.innerHTML = `<p class="leise">Gerade keine Verbindung – die Bereiche oben funktionieren, sobald die Daten einmal geladen sind.</p>`;
        }
      },
    };
  }

  /* ----- Zeitstrahl ----- */
  function zeitListe(G, f) {
    return G.epochen.map((ep) => {
      const evs = G.ereignisse.filter((e) => e.epoche === ep.id && (!f.kern || e.wichtig === 3) && (f.sage || !e.mythos));
      return `<li class="epoche" id="ep-${ep.id}" style="--f:${ep.farbe}">
        <div class="epoche-kopf"><span class="anzahl">${evs.length}</span><span class="zeitraum">${esc(zeitraum(ep.von, ep.bis))}</span><h2>${esc(ep.name)}</h2><p>${esc(ep.kurz)}</p></div>
        <ol class="ereignisse">${evs.map((e) => `<li><a class="ev w${e.wichtig}${e.mythos ? ' sage' : ''}" href="#/ereignis/${e.id}">
          <span class="knoten"></span>
          <span class="ev-text"><span class="jahr">${esc(jahrKurz(e))}</span><span class="titel">${esc(e.titel)}</span>
            ${(e.mythos || e.wichtig === 3 || e.orte.length) ? `<span class="ev-marken">${e.mythos ? sageTag() : ''}${e.wichtig === 3 ? `<span class="marke-tag kern">${ic('stern')}Kerndatum</span>` : ''}${e.orte.length ? `<span class="marke-tag">${ic('pin')}${e.orte.length === 1 ? '1 Ort' : e.orte.length + ' Orte'}</span>` : ''}</span>` : ''}
          </span>${ic('rechts', 'pfeil')}</a></li>`).join('') || '<li class="leer klein-text">Keine Ereignisse mit diesem Filter.</li>'}</ol></li>`;
    }).join('');
  }
  async function vZeit(epId) {
    const G = await ladeG();
    const f = sp.zeit && typeof sp.zeit === 'object' ? sp.zeit : (sp.zeit = { kern: false, sage: true });
    const html = `${segment('geschichte', 'zeit')}
      <div class="epochen-leiste" id="epleiste"><div class="chips" id="epchips">${G.epochen.map((ep) => `<button type="button" class="chip" data-ep="${ep.id}" style="--f:${ep.farbe}"><span class="punkt"></span>${esc(ep.name)}</button>`).join('')}</div></div>
      <div class="filter-zeile">
        <button type="button" class="chip${f.kern ? ' an' : ''}" data-aktion="zeit-kern" aria-pressed="${!!f.kern}">${ic('stern')}Nur Kerndaten</button>
        <button type="button" class="chip${f.sage ? ' an' : ''}" data-aktion="zeit-sage" aria-pressed="${!!f.sage}">${ic('feder')}Sagen zeigen</button>
      </div>
      <div class="legende"><span><i class="leg-knoten"></i>Geschichte</span><span><i class="leg-knoten sage"></i>Sage / Legende</span><span>Tippen für Details, Personen und Orte</span></div>
      <ol class="zeitstrahl" id="zeitstrahl">${zeitListe(G, f)}</ol>`;
    return {
      tab: 'geschichte', titel: 'Geschichte', html,
      aktionen: {
        'zeit-kern': (b) => { f.kern = !f.kern; speichern(); b.classList.toggle('an', f.kern); b.setAttribute('aria-pressed', f.kern); $('#zeitstrahl').innerHTML = zeitListe(G, f); },
        'zeit-sage': (b) => { f.sage = !f.sage; speichern(); b.classList.toggle('an', f.sage); b.setAttribute('aria-pressed', f.sage); $('#zeitstrahl').innerHTML = zeitListe(G, f); },
      },
      nach: (el, ctx) => {
        const leiste = $('#epleiste'), chips = $('#epchips');
        const hoehe = () => leiste.getBoundingClientRect().height;
        const springe = (id, weich) => {
          const z = document.getElementById('ep-' + id);
          if (!z) return;
          const top = z.getBoundingClientRect().top + window.scrollY - $('#kopf').getBoundingClientRect().height - hoehe() - 6;
          const weit = Math.abs(top - window.scrollY) > 2400;   // lange Strecken springen statt gleiten
          window.scrollTo({ top, behavior: weich && !weit && !ruhig() ? 'smooth' : 'auto' });
        };
        chips.addEventListener('click', (e) => { const c = e.target.closest('[data-ep]'); if (c) springe(c.dataset.ep, true); });
        let aktiv = '', plan = 0;
        const pruefe = () => {
          plan = 0;
          const grenze = $('#kopf').getBoundingClientRect().height + hoehe() + 40;
          let id = G.epochen[0].id;
          for (const ep of G.epochen) { const z = document.getElementById('ep-' + ep.id); if (z && z.getBoundingClientRect().top <= grenze) id = ep.id; }
          leiste.classList.toggle('klebt', window.scrollY > 40);
          if (id === aktiv) return;
          aktiv = id;
          $$('.chip', chips).forEach((c) => c.classList.toggle('jetzt', c.dataset.ep === id));
          const c = chips.querySelector(`[data-ep="${id}"]`);
          if (c) chips.scrollTo({ left: c.offsetLeft - 16, behavior: ruhig() ? 'auto' : 'smooth' });
        };
        const beimScrollen = () => { if (!plan) plan = requestAnimationFrame(pruefe); };
        window.addEventListener('scroll', beimScrollen, { passive: true });
        ctx.aufraeumen.push(() => { window.removeEventListener('scroll', beimScrollen); if (plan) cancelAnimationFrame(plan); });
        if (epId && G.ep[epId] && !ctx.zurueck) requestAnimationFrame(() => springe(epId, false));
        requestAnimationFrame(pruefe);
      },
    };
  }

  async function vPersonen() {
    const G = await ladeG();
    const html = `${segment('geschichte', 'personen')}
      <label class="suche">${ic('suche')}<input type="search" id="psuche" placeholder="Person suchen …" autocomplete="off" enterkeyhint="search"><span class="vh">Person suchen</span></label>
      <p class="anzahl-zeile" id="panzahl"></p>
      <div class="raster" id="pliste"></div>`;
    return {
      tab: 'geschichte', titel: 'Personen', html,
      nach: () => {
        const male = () => {
          const q = norm($('#psuche').value.trim());
          const l = G.personen.filter((p) => !q || norm(p.name + ' ' + p.rolle + ' ' + p.kurz).includes(q));
          $('#panzahl').textContent = `${l.length} ${l.length === 1 ? 'Person' : 'Personen'} · nach ihrem ersten Auftritt im Zeitstrahl`;
          $('#pliste').innerHTML = l.map(personKarte).join('') || '<p class="leer">Niemand gefunden.</p>';
        };
        $('#psuche').addEventListener('input', male);
        male();
      },
    };
  }

  async function vEreignis(id) {
    const [rg, ro] = await Promise.allSettled([ladeG(), ladeO()]);
    if (rg.status !== 'fulfilled') throw rg.reason;
    const G = rg.value, O = ro.status === 'fulfilled' ? ro.value : null;
    const e = G.ev[id];
    if (!e) return nichtGefunden('Dieses Ereignis gibt es nicht (mehr).', '#/zeit');
    const ep = G.ep[e.epoche];
    const vor = G.ereignisse[e.i - 1], nach = G.ereignisse[e.i + 1];
    const rz = roemisch(e.jahr);
    const orte = e.orte.map((oid) => (O && O.ort[oid]) || null).filter(Boolean);
    const pers = (e.personen || []).map((p) => G.pers[p]).filter(Boolean);
    const html = `
      <header class="detail-kopf" style="--f:${ep.farbe}">${ic(e.mythos ? 'feder' : 'saeule', 'deko')}
        <a class="ep-link" href="#/zeit/${ep.id}">${esc(ep.name)} ${ic('rechts', 'klein')}</a>
        <div class="grosses-jahr" style="margin-top:12px">${esc(jahrKurz(e))}</div>
        ${rz && !e.ca ? `<div class="roem-jahr" title="Jahreszahl in römischen Ziffern">${rz}${e.jahr < 0 ? ' v. Chr.' : ''}</div>` : ''}
        <h1>${esc(e.titel)}</h1>
        <div class="marken">${e.mythos ? sageTag() : `<span class="marke-tag belegt">${ic('haken')}Geschichte</span>`}${e.wichtig === 3 ? `<span class="marke-tag kern">${ic('stern')}Kerndatum</span>` : ''}${e.ca ? '<span class="marke-tag">Jahr ungefähr</span>' : ''}</div>
      </header>
      <div class="zweispaltig"><div>
        ${e.jahrText ? `<p class="leise klein-text" style="margin:14px 2px 0">${ic('kalender', 'klein')}<span class="vh">Datum:</span> ${esc(e.jahrText)}</p>` : ''}
        <div class="fliess"><p>${esc(e.text)}</p></div>
        ${e.mythos ? `<div class="hinweis-box sage">${ic('feder')}<p><b>Sage, nicht belegt</b>So erzählt es die Überlieferung. Spannend und wichtig für das Selbstbild der Römer – aber keine gesicherte Tatsache.</p></div>` : ''}
        ${e.umstritten ? `<div class="hinweis-box" style="margin-top:10px">${ic('achtung')}<p><b>Umstritten oder unsicher</b>${esc(e.umstritten)}</p></div>` : ''}
        ${quelle(e.quelle)}
      </div><div>
        ${orte.length ? `<section class="abschnitt"><h2>${ic('pin')}Hier kannst du es sehen</h2><div class="liste-luft">${orte.map((o) => ortKarte(o)).join('')}</div></section>` : (e.orte.length ? `<p class="leise klein-text">Orte konnten gerade nicht geladen werden.</p>` : '')}
        ${pers.length ? `<section class="abschnitt"><h2>${ic('personen')}Wer war dabei?</h2><div class="liste-luft">${pers.map(personKarte).join('')}</div></section>` : ''}
      </div></div>
      <nav class="blaettern" aria-label="Weiter im Zeitstrahl">
        ${vor ? `<a href="#/ereignis/${vor.id}" data-ersetzen><small>${ic('links')}früher · ${esc(jahrKurz(vor))}</small><b>${esc(vor.titel)}</b></a>` : '<span></span>'}
        ${nach ? `<a class="spaeter" href="#/ereignis/${nach.id}" data-ersetzen><small>später · ${esc(jahrKurz(nach))}${ic('rechts')}</small><b>${esc(nach.titel)}</b></a>` : '<span></span>'}
      </nav>`;
    return { tab: 'geschichte', titel: e.titel, zurueck: '#/zeit/' + ep.id, html };
  }

  async function vPerson(id) {
    const [rg, ro] = await Promise.allSettled([ladeG(), ladeO()]);
    if (rg.status !== 'fulfilled') throw rg.reason;
    const G = rg.value, O = ro.status === 'fulfilled' ? ro.value : null;
    const p = G.pers[id];
    if (!p) return nichtGefunden('Diese Person gibt es nicht.', '#/personen');
    const evs = G.evNachPerson[p.id] || [];
    const ortIds = [...new Set(evs.flatMap((e) => e.orte))];
    const orte = O ? ortIds.map((o) => O.ort[o]).filter(Boolean) : [];
    const farbe = evs.length ? G.ep[evs[0].epoche].farbe : '#8A3A1E';
    const html = `
      <header class="detail-kopf" style="--f:${farbe}">${ic(p.sage ? 'feder' : 'person', 'deko')}
        <div class="marken">${p.sage ? sageTag() : `<span class="marke-tag belegt">${ic('haken')}historische Person</span>`}</div>
        <h1>${esc(p.name)}</h1>
        <div class="roem-jahr" style="font-size:14px;letter-spacing:.06em">${esc(p.lebte)}</div>
        <p style="margin:8px 0 0;font-size:16px">${esc(p.rolle)}</p>
      </header>
      <div class="zweispaltig"><div>
        <div class="merksatz">${ic('zitat')}<small>Merksatz</small>${esc(p.merksatz)}</div>
        <div class="fliess"><p>${esc(p.kurz)}</p></div>
        ${p.sage ? `<div class="hinweis-box sage">${ic('feder')}<p>Vor allem aus Sage und Überlieferung bekannt – ob es diese Person so gab, ist nicht gesichert.</p></div>` : ''}
      </div><div>
        ${evs.length ? `<section class="abschnitt"><h2>${ic('saeule')}Im Zeitstrahl</h2><div class="liste-luft">${evs.map((e) => evKarte(e, G)).join('')}</div></section>` : ''}
        ${orte.length ? `<section class="abschnitt"><h2>${ic('pin')}Orte zu dieser Person</h2><div class="liste-luft">${orte.map((o) => ortKarte(o)).join('')}</div></section>` : ''}
      </div></div>`;
    return { tab: 'geschichte', titel: p.name, zurueck: '#/personen', html };
  }

  /* ----- Lernen ----- */
  async function vLernen() {
    const G = await ladeG();
    const r = rang();
    const q = sp.quiz || {};
    const zr = sp.zr || {};
    const deckGroesse = { merk: G.merkhilfen.length, daten: G.ereignisse.filter((e) => e.wichtig === 3).length, koepfe: G.personen.length };
    const spiel = (href, farbe, ik, titel, text, rechts) => `<a class="spiel-karte" href="${href}"><span class="spiel-ikon" style="--f:${farbe}">${ic(ik)}</span><span class="spiel-text"><b>${titel}</b><small>${text}</small></span>${rechts || ic('rechts')}</a>`;
    const html = `
      <section class="karte lern-rang">${KRANZ}<div style="flex:1;min-width:0"><small class="leise">Dein Rang</small><h2>${r.name} <small class="leise" style="font-size:14px;letter-spacing:0;font-family:var(--sans)">(${r.was})</small></h2>
        <span class="balken"><i style="transform:scaleX(${r.anteil.toFixed(3)})"></i></span>
        <small class="leise">${r.sterne} von ${MAX_STERNE} Sternen${r.naechster ? ` · noch ${r.naechster.ab - r.sterne} bis ${r.naechster.name}` : ' · höchster Rang erreicht!'}</small></div></section>
      <div class="raenge" aria-label="Alle Ränge">${RAENGE.map((x, i) => `<span class="${i === r.i ? 'jetzt' : i < r.i ? 'erreicht' : ''}">${x.name} · ${x.ab}</span>`).join('')}</div>
      <section class="abschnitt"><h2>${ic('frage')}Quiz</h2><div class="raster">
        ${[1, 2, 3].map((s) => spiel(`#/quiz/${s}`, STUFEN[s].farbe, 'frage', `${STUFEN[s].name} <small style="display:inline;font-family:var(--sans);font-size:13px;color:var(--tinte2)">${STUFEN[s].unter}</small>`,
          `${G.quiz.filter((x) => x.stufe === s).length} Fragen · 10 pro Runde · mit Erklärung`, sterneHtml(q[s] || 0))).join('')}
      </div></section>
      <section class="abschnitt"><h2>${ic('sanduhr')}Zeitreise</h2>
        ${spiel('#/zeitreise', '#8A3A1E', 'sanduhr', 'Was kam zuerst?', `Sechs Ereignisse in die richtige Reihenfolge ziehen${zr.runden ? ` · ${zr.runden} ${zr.runden === 1 ? 'Runde' : 'Runden'} gespielt` : ''}`, sterneHtml(zr.best || 0))}
      </section>
      <section class="abschnitt"><h2>${ic('karten')}Karteikarten</h2><div class="raster">
        ${Object.keys(DECKS).map((d) => {
          const k = (sp.karten && sp.karten[d]) || {};
          const g = (k.g || []).length, n = deckGroesse[d];
          return spiel(`#/karten/${d}`, DECKS[d].farbe, DECKS[d].ik, DECKS[d].name, `${DECKS[d].unter} · ${g} von ${n} gewusst<span class="mini-balken" style="--f:${DECKS[d].farbe}"><i style="transform:scaleX(${n ? (g / n).toFixed(3) : 0})"></i></span>`, sterneHtml(deckSterne(d)));
        }).join('')}
      </div></section>
      <section class="abschnitt"><h2>${ic('auge')}Entdecker</h2>
        ${spiel('#/orte', '#2C5F8A', 'auge', 'Orte in Rom abhaken', `${liste('gesehen').length} Orte als „gesehen“ markiert · Sterne ab 5, 15 und 30 Orten`, sterneHtml(entdeckerSterne()))}
      </section>
      <p class="leise klein-text" style="margin-top:18px">${ic('info', 'klein')} Fortschritt und Sterne werden nur auf diesem Gerät gespeichert.</p>`;
    // Deckgrößen merken, damit die Sterne auf der Startseite stimmen
    sp.karten = sp.karten || {};
    Object.keys(deckGroesse).forEach((d) => { sp.karten[d] = { g: [], ...(sp.karten[d] || {}), n: deckGroesse[d] }; });
    speichern();
    return { tab: 'lernen', titel: 'Lernen', html };
  }

  async function vQuiz(stufe) {
    stufe = +stufe;
    if (!STUFEN[stufe]) return nichtGefunden('Diese Stufe gibt es nicht.', '#/lernen');
    const G = await ladeG();
    const runde = mischen(G.quiz.filter((x) => x.stufe === stufe)).slice(0, 10);
    let i = 0, punkte = 0;
    const fehler = [];
    const html = `<div id="quiz"></div>`;
    return {
      tab: 'lernen', titel: `Quiz · ${STUFEN[stufe].name}`, zurueck: '#/lernen', html,
      nach: () => {
        const box = $('#quiz');
        const frage = () => {
          const f = runde[i];
          const ep = f.epoche && G.ep[f.epoche];
          box.innerHTML = `<div class="rein">
            <div class="quiz-kopf"><span>Frage ${i + 1} von ${runde.length}</span><span>${punkte} richtig</span></div>
            <div class="fortschritt"><i style="transform:scaleX(${(i / runde.length).toFixed(3)})"></i></div>
            <div class="frage-karte">${ep ? `<span class="ep-tag" style="--f:${ep.farbe}">${esc(ep.name)}</span>` : ''}<h2>${esc(f.frage)}</h2></div>
            <div class="antworten" id="antworten">${f.antworten.map((a, k) => `<button type="button" class="antwort" data-k="${k}"><span class="nr">${ROEM_NR[k]}</span><span>${esc(a)}</span></button>`).join('')}</div>
            <div id="nachher"></div></div>`;
        };
        const antwort = (k) => {
          const f = runde[i];
          const gut = k === f.richtig;
          if (gut) punkte++; else fehler.push(f);
          const ant = $('#antworten');
          ant.classList.add('fertig');
          $$('.antwort', ant).forEach((b) => {
            const n = +b.dataset.k;
            if (n === f.richtig) { b.classList.add('richtig'); b.insertAdjacentHTML('beforeend', ic('haken', 'zeichen')); }
            else if (n === k) { b.classList.add('falsch'); b.insertAdjacentHTML('beforeend', ic('kreuz', 'zeichen')); }
            else b.classList.add('blass');
            b.disabled = true;
          });
          const letzte = i === runde.length - 1;
          $('#nachher').innerHTML = `<div class="erklaerung ${gut ? 'gut' : 'schlecht'}"><b>${ic(gut ? 'haken' : 'kreuz')}${gut ? 'Richtig!' : 'Leider nicht.'}</b><p>${gut ? '' : `Richtig ist: <b style="display:inline">${esc(f.antworten[f.richtig])}</b>. `}${esc(f.erklaerung || '')}</p></div>
            <div class="knopf-reihe"><button type="button" class="knopf" data-q="weiter">${letzte ? 'Zum Ergebnis' : 'Weiter'} ${ic('pfeil')}</button></div>`;
          $('.quiz-kopf span:last-child').textContent = `${punkte} richtig`;
          const w = $('[data-q="weiter"]');
          w.focus({ preventScroll: true });
          const r = w.getBoundingClientRect();
          if (r.bottom > window.innerHeight - 70) window.scrollBy({ top: r.bottom - window.innerHeight + 90, behavior: ruhig() ? 'auto' : 'smooth' });
        };
        const ende = () => {
          const st = punkte >= 9 ? 3 : punkte >= 7 ? 2 : punkte >= 5 ? 1 : 0;
          sp.quiz = sp.quiz || {};
          const neu = st > (sp.quiz[stufe] || 0);
          if (neu) sp.quiz[stufe] = st;
          speichern();
          const lob = punkte === runde.length ? 'Perfekt – ave!' : punkte >= 7 ? 'Stark!' : punkte >= 5 ? 'Gut gemacht!' : 'Weiter üben!';
          box.innerHTML = `<div class="rein"><section class="karte ergebnis">${sterneHtml(st, true)}<h2>${lob}</h2>
              <p class="punktzahl">${punkte} von ${runde.length} richtig</p>
              <p class="leise">${neu ? 'Neuer Bestwert in dieser Stufe!' : `Bestwert: ${sp.quiz[stufe] || 0} von 3 Sternen`}</p>
              <div class="knopf-reihe">
                <button type="button" class="knopf" data-aktion="neu">${ic('drehen')}Nochmal</button>
                ${stufe < 3 ? `<a class="knopf zweit" href="#/quiz/${stufe + 1}" data-ersetzen>Nächste Stufe ${ic('pfeil')}</a>` : ''}
                <a class="knopf leise-knopf" href="#/lernen">Übersicht</a>
              </div></section>
            ${fehler.length ? `<section class="abschnitt"><h2>${ic('lorbeer')}Das solltest du dir merken</h2><div class="fehler-liste">${fehler.map((f) => `<div class="karte"><b>${esc(f.frage)}</b><span>${esc(f.antworten[f.richtig])}</span><p class="leise klein-text" style="margin:4px 0 0">${esc(f.erklaerung || '')}</p></div>`).join('')}</div></section>` : ''}</div>`;
          window.scrollTo(0, 0);
        };
        box.addEventListener('click', (ev) => {
          const a = ev.target.closest('.antwort');
          if (a && !a.disabled) { antwort(+a.dataset.k); return; }
          if (ev.target.closest('[data-q="weiter"]')) {
            i++;
            if (i >= runde.length) ende(); else { frage(); window.scrollTo(0, 0); }
          }
        });
        if (runde.length) frage(); else box.innerHTML = '<p class="leer">Keine Fragen vorhanden.</p>';
      },
    };
  }

  async function vZeitreise() {
    const G = await ladeG();
    const pool = G.ereignisse.filter((e) => e.wichtig >= 2 && !e.ca && !/^Warum/.test(e.titel));
    const runde = [];
    for (const e of mischen(pool)) {
      if (runde.every((x) => Math.abs(x.jahr - e.jahr) >= 8)) runde.push(e);
      if (runde.length === 6) break;
    }
    let reihe = mischen(runde);
    const sortiert = runde.slice().sort((a, b) => a.jahr - b.jahr);
    if (reihe.every((e, k) => e === sortiert[k])) reihe = reihe.reverse();
    const html = `
      <p class="anleitung">${ic('sanduhr')}<span>Bring die Ereignisse in die richtige Reihenfolge: <b>das älteste nach oben</b>. Halte den Griff rechts fest und zieh.</span></p>
      <ol class="zr-liste" id="zrl">${reihe.map((e) => `<li class="zr-karte" data-id="${e.id}" tabindex="0" aria-label="${esc(e.titel)}. Mit Pfeiltasten verschieben.">
        <span class="zr-nr"></span><span class="zr-text"><b>${esc(e.titel)}</b><small hidden></small></span>
        <span class="zr-griff" aria-hidden="true">${ic('griff')}</span></li>`).join('')}</ol>
      <div id="zr-unten" class="knopf-reihe"><button type="button" class="knopf breit" id="zr-pruefen">${ic('haken')}Prüfen</button></div>`;
    return {
      tab: 'lernen', titel: 'Zeitreise', zurueck: '#/lernen', html,
      nach: (el, ctx) => {
        const l = $('#zrl');
        const nummern = () => $$('.zr-karte', l).forEach((k, i) => { $('.zr-nr', k).textContent = ROEM_NR[i]; });
        nummern();
        ctx.aufraeumen.push(ziehbar(l, nummern));
        l.addEventListener('keydown', (ev) => {
          const k = ev.target.closest('.zr-karte');
          if (!k || l.classList.contains('zr-fertig')) return;
          if (ev.key === 'ArrowUp' && k.previousElementSibling) { k.previousElementSibling.before(k); ev.preventDefault(); }
          else if (ev.key === 'ArrowDown' && k.nextElementSibling) { k.nextElementSibling.after(k); ev.preventDefault(); }
          else return;
          nummern(); k.focus();
        });
        $('#zr-pruefen').addEventListener('click', () => {
          const karten = $$('.zr-karte', l);
          let ok = 0;
          karten.forEach((k, i) => {
            const e = G.ev[k.dataset.id];
            const gut = sortiert[i].id === e.id;
            if (gut) ok++;
            k.classList.add(gut ? 'ok' : 'nein');
            const sm = $('small', k);
            sm.hidden = false;
            sm.textContent = jahrKurz(e) + (e.mythos ? ' (Sage)' : '');
          });
          l.classList.add('zr-fertig');
          const st = ok === 6 ? 3 : ok >= 4 ? 2 : ok >= 2 ? 1 : 0;
          sp.zr = sp.zr || {};
          const neu = st > (sp.zr.best || 0);
          sp.zr.best = Math.max(sp.zr.best || 0, st);
          sp.zr.runden = (sp.zr.runden || 0) + 1;
          if (ok === 6) sp.zr.perfekt = (sp.zr.perfekt || 0) + 1;
          speichern();
          $('#zr-unten').outerHTML = `<section class="karte ergebnis rein" style="margin-top:16px">${sterneHtml(st, true)}
            <h2>${ok === 6 ? 'Perfekt – du kennst die Zeit!' : ok >= 4 ? 'Fast!' : 'Die Zeit ist knifflig.'}</h2>
            <p class="punktzahl">${ok} von 6 an der richtigen Stelle</p>${neu ? '<p class="leise">Neuer Bestwert!</p>' : ''}
            <div class="knopf-reihe"><button type="button" class="knopf" data-aktion="neu">${ic('drehen')}Neue Runde</button><a class="knopf leise-knopf" href="#/lernen">Übersicht</a></div></section>
            <section class="abschnitt"><h2>${ic('saeule')}Richtige Reihenfolge</h2><div class="liste-luft">${sortiert.map((e) => evKarte(e, G)).join('')}</div></section>`;
        });
      },
    };
  }

  // Ziehen per Griff (Zeiger: Finger, Maus, Stift). Animation nur mit transform.
  function ziehbar(l, nachAenderung) {
    let zug = null, rolle = 0;
    const abstandY = 10;
    const bewege = () => {
      const y = zug.letzteY + window.scrollY;
      const dy = y - zug.y0;
      zug.karte.style.transform = `translateY(${dy}px) scale(1.02)`;
      const mitte = zug.mitten[zug.start] + dy;
      let ziel = zug.start;
      zug.mitten.forEach((m, i) => {
        if (i < zug.start && mitte < m) ziel = Math.min(ziel, i);
        if (i > zug.start && mitte > m) ziel = Math.max(ziel, i);
      });
      zug.ziel = ziel;
      zug.karten.forEach((k, i) => {
        if (k === zug.karte) return;
        let s = 0;
        if (ziel > zug.start && i > zug.start && i <= ziel) s = -zug.schritt;
        if (ziel < zug.start && i < zug.start && i >= ziel) s = zug.schritt;
        k.style.transform = s ? `translateY(${s}px)` : '';
      });
    };
    const schleife = () => {
      if (!zug) return;
      const oben = $('#kopf').getBoundingClientRect().bottom + 50;
      const unten = window.innerHeight - 90;
      let d = 0;
      if (zug.letzteY < oben) d = -Math.min(14, (oben - zug.letzteY) / 3 + 2);
      else if (zug.letzteY > unten) d = Math.min(14, (zug.letzteY - unten) / 3 + 2);
      if (d) { window.scrollBy(0, d); bewege(); }
      rolle = requestAnimationFrame(schleife);
    };
    const runter = (e) => {
      const griff = e.target.closest('.zr-griff');
      if (!griff || l.classList.contains('zr-fertig') || zug) return;
      e.preventDefault();
      const karte = griff.closest('.zr-karte');
      const karten = [...l.children];
      const sy = window.scrollY;
      const mitten = karten.map((k) => { const r = k.getBoundingClientRect(); return r.top + sy + r.height / 2; });
      zug = { karte, karten, start: karten.indexOf(karte), ziel: karten.indexOf(karte), y0: e.clientY + sy, letzteY: e.clientY, mitten,
        schritt: karte.getBoundingClientRect().height + abstandY, id: e.pointerId };
      try { griff.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
      karte.classList.add('zieht');
      rolle = requestAnimationFrame(schleife);
    };
    const bewegt = (e) => { if (!zug || e.pointerId !== zug.id) return; e.preventDefault(); zug.letzteY = e.clientY; bewege(); };
    const los = (e) => {
      if (!zug || (e && e.pointerId !== zug.id)) return;
      const { karte, karten, start, ziel } = zug;
      zug = null;
      cancelAnimationFrame(rolle);
      l.classList.add('ruht');
      karten.forEach((k) => { k.style.transform = ''; });
      karte.classList.remove('zieht');
      if (ziel !== start) { if (ziel > start) karten[ziel].after(karte); else karten[ziel].before(karte); }
      void l.offsetWidth;
      l.classList.remove('ruht');
      nachAenderung();
    };
    l.addEventListener('pointerdown', runter);
    l.addEventListener('pointermove', bewegt);
    l.addEventListener('pointerup', los);
    l.addEventListener('pointercancel', los);
    return () => { cancelAnimationFrame(rolle); zug = null; };
  }

  async function vKarten(deck) {
    if (!DECKS[deck]) return nichtGefunden('Diesen Kartenstapel gibt es nicht.', '#/lernen');
    const G = await ladeG();
    const D = DECKS[deck];
    let karten;
    if (deck === 'merk') {
      karten = G.merkhilfen.map((m) => ({ id: m.id, vorn: `<small>Merkhilfe</small><div class="kk-gross">${esc(m.thema)}</div>`, hinten: `<small>Eselsbrücke</small><div class="kk-mittel">${esc(m.eselsbruecke)}</div>` }));
    } else if (deck === 'daten') {
      karten = G.ereignisse.filter((e) => e.wichtig === 3).map((e) => ({ id: e.id, vorn: `<small>Wann war das?</small><div class="kk-gross">${esc(e.titel)}</div>${e.mythos ? `<p style="margin-top:8px">${sageTag()}</p>` : ''}`,
        hinten: `<small>${esc(G.ep[e.epoche].name)}</small><div class="kk-gross">${esc(jahrKurz(e))}</div><p style="margin:10px 0 0;font-size:15px;opacity:.95">${esc(ersterSatz(e.text))}</p>` }));
    } else {
      karten = G.personen.map((p) => ({ id: p.id, vorn: `<small>Wer war das?</small><div class="kk-gross">${esc(p.name)}</div><p style="margin:8px 0 0" class="leise">${esc(p.lebte)}</p>`,
        hinten: `<small>${esc(p.rolle)}</small><div class="kk-mittel">${esc(p.merksatz)}</div>` }));
    }
    sp.karten = sp.karten || {};
    const st = sp.karten[deck] = { g: [], ...(sp.karten[deck] || {}), n: karten.length };
    st.g = (st.g || []).filter((id) => karten.some((k) => k.id === id));
    speichern();
    let alleGewusst = st.g.length >= karten.length;
    let stapel = mischen(alleGewusst ? karten : karten.filter((k) => !st.g.includes(k.id)));
    let runde = 0;
    const html = `<div id="kk"></div>`;
    return {
      tab: 'lernen', titel: D.name, zurueck: '#/lernen', html,
      nach: () => {
        const box = $('#kk');
        const zeige = () => {
          if (!stapel.length) {
            box.innerHTML = `<section class="karte ergebnis rein">${sterneHtml(deckSterne(deck), true)}<h2>Stapel geschafft!</h2>
              <p class="punktzahl">${st.g.length} von ${karten.length} gewusst</p>
              <div class="knopf-reihe"><button type="button" class="knopf" data-kk="alle">${ic('drehen')}Alle nochmal</button>
              ${st.g.length < karten.length ? `<button type="button" class="knopf zweit" data-kk="offen">Nur offene</button>` : `<button type="button" class="knopf zweit" data-kk="vergessen">Neu anfangen</button>`}
              <a class="knopf leise-knopf" href="#/lernen">Übersicht</a></div></section>`;
            return;
          }
          const k = stapel[0];
          runde++;
          box.innerHTML = `<div class="rein">
            <div class="kk-zaehler"><span>${alleGewusst ? 'Wiederholung' : 'Noch offen'}: ${stapel.length}</span><span>${st.g.length} / ${karten.length} gewusst</span></div>
            <div class="fortschritt" style="margin-top:8px"><i style="transform:scaleX(${(st.g.length / karten.length).toFixed(3)})"></i></div>
            <div class="kk-buehne"><div class="kk" role="button" tabindex="0" aria-label="Karte umdrehen" id="kkarte">
              <div class="kk-innen"><div class="kk-vorn">${k.vorn}<span class="kk-tipp">${ic('drehen', 'klein')}Tippen zum Umdrehen</span></div>
              <div class="kk-hinten">${k.hinten}</div></div></div></div>
            <div class="knopf-reihe"><button type="button" class="knopf zweit" data-kk="nochmal" disabled>${ic('drehen')}Nochmal</button>
              <button type="button" class="knopf" data-kk="gewusst" disabled>${ic('haken')}Gewusst</button></div></div>`;
        };
        const drehen = () => {
          const kk = $('#kkarte');
          if (!kk) return;
          kk.classList.toggle('offen');
          $$('[data-kk="nochmal"],[data-kk="gewusst"]', box).forEach((b) => { b.disabled = false; });
        };
        box.addEventListener('click', (ev) => {
          if (ev.target.closest('#kkarte')) { drehen(); return; }
          const b = ev.target.closest('[data-kk]');
          if (!b) return;
          const was = b.dataset.kk;
          if (was === 'gewusst') {
            const k = stapel.shift();
            if (!st.g.includes(k.id)) st.g.push(k.id);
            speichern();
          } else if (was === 'nochmal') {
            const k = stapel.shift();
            stapel.splice(Math.min(stapel.length, 3), 0, k);
          } else if (was === 'alle') { alleGewusst = true; stapel = mischen(karten); }
          else if (was === 'offen') { alleGewusst = false; stapel = mischen(karten.filter((k) => !st.g.includes(k.id))); }
          else if (was === 'vergessen') { st.g = []; speichern(); alleGewusst = false; stapel = mischen(karten); }
          zeige();
        });
        box.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.id === 'kkarte') { ev.preventDefault(); drehen(); } });
        zeige();
      },
    };
  }

  /* ----- Orte ----- */
  const ART_FILTER = [['alle', 'Alle', 'pin'], ['geheimtipp', 'Geheimtipps', 'schluessel'], ['gemerkt', 'Gemerkt', 'merken'],
    ...Object.keys(ARTEN).map((k) => [k, ARTEN[k].name, ARTEN[k].ik])];
  function orteFilter() {
    const f = sp.orteF && typeof sp.orteF === 'object' ? sp.orteF : (sp.orteF = {});
    if (!f.art) f.art = 'alle';
    if (!f.ep) f.ep = 'alle';
    return f;
  }
  function passt(o, f, q, ohneEpoche) {
    if (f.art === 'geheimtipp' && !o.geheimtipp) return false;
    if (f.art === 'gemerkt' && !hat('gemerkt', o.id)) return false;
    if (ARTEN[f.art] && o.art !== f.art) return false;
    if (!ohneEpoche && f.ep !== 'alle' && o.epoche !== f.ep) return false;
    if (q && !norm(o.name + ' ' + o.kurz + ' ' + o.id).includes(q)) return false;
    return true;
  }
  const artChips = (f) => `<div class="chips" id="artchips">${ART_FILTER.map(([k, n, ik]) => `<button type="button" class="chip${f.art === k ? ' an' : ''}" data-art="${k}" style="--f:${ARTEN[k] ? ARTEN[k].farbe : '#A84B29'}">${ic(ik)}${n}</button>`).join('')}</div>`;
  const epChips = (f) => `<div class="chips" id="epfilter"><button type="button" class="chip${f.ep === 'alle' ? ' an' : ''}" data-oep="alle">Alle Epochen</button>${Object.keys(ORT_EP).map((k) => `<button type="button" class="chip${f.ep === k ? ' an' : ''}" data-oep="${k}" style="--f:${ORT_EP[k]}"><span class="punkt"></span>${k}</button>`).join('')}</div>`;

  async function vOrte() {
    const O = await ladeO();
    const f = orteFilter();
    const html = `${segment('orte', 'orte')}
      <label class="suche">${ic('suche')}<input type="search" id="osuche" placeholder="Ort suchen …" autocomplete="off" enterkeyhint="search"><span class="vh">Ort suchen</span></label>
      ${artChips(f)}${epChips(f)}
      <p class="anzahl-zeile" id="oanzahl"></p>
      <div class="raster" id="oliste"></div>`;
    return {
      tab: 'orte', titel: 'Sehenswürdigkeiten', html,
      nach: () => {
        const male = () => {
          const q = norm($('#osuche').value.trim());
          const l = O.orte.filter((o) => passt(o, f, q));
          $('#oanzahl').innerHTML = `<span>${l.length} ${l.length === 1 ? 'Ort' : 'Orte'}</span><a href="#/karte" style="font-weight:700;display:inline-flex;align-items:center;gap:5px;min-height:44px">${ic('karte', 'klein')}Auf der Karte</a>`;
          $('#oliste').innerHTML = l.map((o) => ortKarte(o)).join('') || `<p class="leer">${f.art === 'gemerkt' ? 'Noch nichts gemerkt – auf einer Ortsseite „Merken“ tippen.' : 'Kein Ort passt zu diesem Filter.'}</p>`;
        };
        $('#artchips').addEventListener('click', (e) => { const c = e.target.closest('[data-art]'); if (!c) return; f.art = c.dataset.art; speichern(); $$('[data-art]').forEach((x) => x.classList.toggle('an', x === c)); male(); });
        $('#epfilter').addEventListener('click', (e) => { const c = e.target.closest('[data-oep]'); if (!c) return; f.ep = c.dataset.oep; speichern(); $$('[data-oep]').forEach((x) => x.classList.toggle('an', x === c)); male(); });
        $('#osuche').addEventListener('input', male);
        male();
      },
    };
  }

  // Leaflet erst bei Bedarf laden
  let leafletLaden = null;
  function ladeLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (leafletLaden) return leafletLaden;
    leafletLaden = new Promise((ok, nein) => {
      if (navigator.onLine === false) { nein(new Error('offline')); return; }
      if (!$('link[data-leaflet]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet'; css.href = LEAFLET_CSS; css.crossOrigin = 'anonymous'; css.dataset.leaflet = '1';
        document.head.appendChild(css);
      }
      const s = document.createElement('script');
      s.src = LEAFLET_JS; s.integrity = LEAFLET_SRI; s.crossOrigin = 'anonymous'; s.referrerPolicy = 'no-referrer';
      const zeit = setTimeout(() => { s.remove(); nein(new Error('zeit')); }, 12000);
      s.onload = () => { clearTimeout(zeit); if (window.L && window.L.map) ok(window.L); else nein(new Error('leer')); };
      s.onerror = () => { clearTimeout(zeit); s.remove(); nein(new Error('laden')); };
      document.head.appendChild(s);
    });
    leafletLaden.catch(() => { leafletLaden = null; });
    return leafletLaden;
  }
  function pinIcon(L, o, nr) {
    const a = ARTEN[o.art] || ARTEN.antik;
    return L.divIcon({ className: 'pin-huelle', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -14],
      html: nr ? `<span class="pin nr" style="--f:${nr.farbe}">${nr.n}</span>` : `<span class="pin${o.geheimtipp ? ' gt' : ''}" style="--f:${a.farbe}">${ic(a.ik)}</span>` });
  }
  function popupHtml(o) {
    return `<div class="pop"><b>${esc(o.name)}</b><small>${esc(o.kurz)}</small><a class="knopf" href="#/ort/${o.id}">Ansehen ${ic('pfeil')}</a></div>`;
  }
  function neueKarte(L, el) {
    const k = L.map(el, { zoomControl: true, attributionControl: true, tapTolerance: 20, zoomSnap: 0.5 }).setView(ROM_MITTE, 14);
    k.attributionControl.setPrefix(false);
    L.tileLayer(KACHELN, { maxZoom: 19, attribution: OSM_HINWEIS }).addTo(k);
    return k;
  }
  // Karte sauber abbauen: laufende Schwenk-Animation stoppen, dann entfernen (sonst Fehler mitten im Gleiten)
  function karteWeg(k) {
    if (!k) return;
    try { k.stop(); } catch (e) { /* egal */ }
    // Leaflet beendet eine Zoom-Animation erst nach 250 ms – vorher entfernen gibt einen Fehler
    setTimeout(() => { try { k.remove(); } catch (e) { /* schon weg */ } }, 400);
  }
  function kartenHoehe(rahmen, minimum) {
    const r = rahmen.getBoundingClientRect();
    const leiste = $('#leiste').getBoundingClientRect();
    const untenFrei = leiste.top > window.innerHeight / 2 ? leiste.height : 0;
    rahmen.style.height = Math.max(minimum, Math.round(window.innerHeight - r.top - untenFrei - 14)) + 'px';
  }

  async function vKarte(ortId) {
    const O = await ladeO();
    const f = orteFilter();
    const fokus = ortId && O.ort[ortId];
    const epWahl = `<label class="chip waehler${f.ep !== 'alle' ? ' an' : ''}" id="kepchip">${ic('saeule')}<select id="kep" aria-label="Epoche wählen"><option value="alle">Alle Epochen</option>${Object.keys(ORT_EP).map((k) => `<option value="${k}"${f.ep === k ? ' selected' : ''}>${k}</option>`).join('')}</select></label>`;
    const html = `${segment('orte', 'karte')}
      ${artChips(f).replace('<div class="chips" id="artchips">', '<div class="chips" id="artchips">' + epWahl)}
      <div class="karte-rahmen" id="krahmen"><div class="karte-flaeche" id="kflaeche"><div class="karte-laedt">${ic('karte')} Karte lädt …</div></div>
        <div class="karte-knoepfe" id="kknoepfe" hidden>
          <button type="button" class="karte-knopf" data-aktion="k-alle" aria-label="Alle sichtbaren Orte zeigen">${ic('alle')}</button>
          <button type="button" class="karte-knopf" data-aktion="k-ich" aria-label="Meinen Standort zeigen">${ic('standort')}</button>
        </div></div>
      <div id="kersatz"></div>`;
    let karte = null, schicht = null, ich = null;
    const marker = {};
    const sichtbar = () => O.orte.filter((o) => passt(o, f, '') || (fokus && o.id === fokus.id));
    const zeichne = (L) => {
      if (schicht) schicht.remove();
      schicht = L.layerGroup().addTo(karte);
      sichtbar().forEach((o) => {
        marker[o.id] = L.marker([o.lat, o.lon], { icon: pinIcon(L, o), title: o.name, riseOnHover: true }).bindPopup(popupHtml(o), { autoPanPadding: [30, 30] }).addTo(schicht);
      });
    };
    const ersatz = (grund) => {
      const r = $('#krahmen');
      if (r) r.remove();
      if (!$('#kersatz')) return;
      const l = sichtbar();
      $('#kersatz').innerHTML = `<div class="hinweis-box">${ic('karte')}<p><b>Karte gerade nicht verfügbar</b>Die Karte braucht Internet (Stadtplan-Kacheln von OpenStreetMap)${grund === 'offline' ? ' – du bist offline' : ''}. Hier sind die Orte als Liste.</p></div>
        <div class="knopf-reihe"><button type="button" class="knopf zweit" data-aktion="neu">${ic('drehen')}Nochmal versuchen</button></div>
        <p class="anzahl-zeile">${l.length} Orte</p><div class="raster">${l.map((o) => ortKarte(o)).join('')}</div>`;
    };
    return {
      tab: 'orte', titel: 'Karte', zurueck: fokus ? '#/ort/' + fokus.id : null, html,
      aktionen: {
        'k-alle': () => {
          if (!karte || !window.L) return;
          const l = sichtbar();
          if (l.length) karte.fitBounds(window.L.latLngBounds(l.map((o) => [o.lat, o.lon])), { padding: [36, 36], maxZoom: 16 });
        },
        'k-ich': () => {
          if (!karte || !navigator.geolocation) { meldung('Standort ist auf diesem Gerät nicht verfügbar.'); return; }
          meldung('Suche deinen Standort …');
          navigator.geolocation.getCurrentPosition((p) => {
            if (!karte) return;
            const ll = [p.coords.latitude, p.coords.longitude];
            if (ich) ich.remove();
            ich = window.L.marker(ll, { icon: window.L.divIcon({ className: 'pin-huelle', html: '<span class="ich-punkt"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }), keyboard: false, title: 'Du bist hier' }).addTo(karte);
            karte.setView(ll, Math.max(karte.getZoom(), 15));
            const nah = O.orte.map((o) => ({ o, d: abstand({ lat: ll[0], lon: ll[1] }, o) })).sort((a, b) => a.d - b.d)[0];
            meldung(nah.d < 20000 ? `Am nächsten: ${nah.o.name} (ca. ${meter(nah.d)} Luftlinie)` : 'Du bist gerade nicht in Rom.');
          }, () => meldung('Standort nicht freigegeben – das geht in den Einstellungen des Browsers.'), { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
        },
      },
      nach: (el, ctx) => {
        const rahmen = $('#krahmen');
        const groesse = () => { if (rahmen.isConnected) { kartenHoehe(rahmen, window.innerHeight < 560 ? 200 : 280); if (karte) karte.invalidateSize(); } };
        groesse();
        window.addEventListener('resize', groesse);
        ctx.aufraeumen.push(() => { window.removeEventListener('resize', groesse); karteWeg(karte); karte = null; });
        $('#artchips').addEventListener('click', (e) => {
          const c = e.target.closest('[data-art]');
          if (!c) return;
          f.art = c.dataset.art; speichern();
          $$('[data-art]').forEach((x) => x.classList.toggle('an', x === c));
          if (karte && window.L) zeichne(window.L); else if (!$('#krahmen')) ersatz();
        });
        $('#kep').addEventListener('change', (e) => {
          f.ep = e.target.value; speichern();
          $('#kepchip').classList.toggle('an', f.ep !== 'alle');
          if (karte && window.L) zeichne(window.L); else if (!$('#krahmen')) ersatz();
        });
        ladeLeaflet().then((L) => {
          if (!ctx.aktiv() || !rahmen.isConnected) return;
          $('#kflaeche').innerHTML = '';
          karte = neueKarte(L, $('#kflaeche'));
          zeichne(L);
          $('#kknoepfe').hidden = false;
          if (fokus) { karte.setView([fokus.lat, fokus.lon], 17, { animate: false }); marker[fokus.id].openPopup(); }
          setTimeout(groesse, 60);
        }).catch((err) => { if (ctx.aktiv()) ersatz(err && err.message); });
      },
    };
  }

  async function vWege() {
    const O = await ladeO();
    const html = `${segment('orte', 'wege')}
      <p class="leise klein-text" style="margin:0 0 12px">${ic('info', 'klein')} ${esc(O.meta.routen_hinweis || '')}</p>
      <div class="raster">${O.routen.map((r) => `<a class="karte weg-karte" href="#/weg/${r.id}" style="--f:${r.farbe}"><div class="weg-band"></div><div class="weg-inhalt">
        <h3>${esc(r.name)}</h3><p>${esc(r.kurz)}</p>
        <div class="weg-zahlen"><span>${ic('pin')}${r.stopps.length} Stopps</span><span>${ic('schritte')}ca. ${zahl(r.km)} km</span><span>${ic('uhr')}ca. ${minuten(r.geh_min)} gehen</span></div>
        <div class="weg-stopps-kurz">${r.stopps.slice(0, 4).map((s) => esc(O.ort[s].name)).join(' · ')} …</div></div></a>`).join('')}</div>`;
    return { tab: 'orte', titel: 'Spaziergänge', html };
  }

  async function vWeg(id) {
    const O = await ladeO();
    const r = O.routen.find((x) => x.id === id);
    if (!r) return nichtGefunden('Diesen Spaziergang gibt es nicht.', '#/wege');
    const html = `
      <header class="detail-kopf" style="--f:${r.farbe}">${ic('weg', 'deko')}<h1 style="margin-top:0">${esc(r.name)}</h1><p style="margin:0 0 12px;font-size:16px">${esc(r.kurz)}</p>
        <div class="marken"><span class="marke-tag">${ic('pin')}${r.stopps.length} Stopps</span><span class="marke-tag">${ic('schritte')}ca. ${zahl(r.km)} km</span><span class="marke-tag">${ic('uhr')}ca. ${minuten(r.geh_min)} gehen</span><span class="marke-tag">mit Besichtigung ca. ${minuten(Math.round((r.besuch_min + r.geh_min) / 30) * 30)}</span></div></header>
      <div class="zweispaltig"><div>
        <div class="warum-box">${'<b>' + ic('sonne') + 'Beste Zeit</b>'}<p>${esc(r.beste_zeit)}</p></div>
        <section class="abschnitt"><h2>${ic('haken')}Gut zu wissen</h2><ul class="tipp-liste">${r.tipps.map((t) => `<li>${ic('haken')}<span>${esc(t)}</span></li>`).join('')}</ul></section>
        <div class="karte-rahmen weg-karte-klein" id="wkarte"><div class="karte-flaeche" id="wflaeche"><div class="karte-laedt">${ic('karte')} Karte lädt …</div></div></div>
        <p class="leise klein-text">${ic('info', 'klein')} ${esc(O.meta.routen_hinweis || '')} Die Linie verbindet die Stopps direkt – sie ist kein genauer Fußweg.</p>
      </div><div>
        <section class="abschnitt"><h2>${ic('weg')}Die Stopps</h2><ol class="stopps" style="--f:${r.farbe}">
        ${r.stopps.map((s, i) => `<li class="stopp"><span class="stopp-nr">${i + 1}</span>${ortKarte(O.ort[s])}
          ${i < r.stopps.length - 1 ? `<div class="abschnitt-weg">${ic('schritte')}weiter ca. ${meter(r.abschnitte_m[i])} · ca. ${Math.max(1, Math.round(r.abschnitte_m[i] / 75))} Min.</div>` : ''}</li>`).join('')}
        </ol></section>
      </div></div>`;
    return {
      tab: 'orte', titel: r.name, zurueck: '#/wege', html,
      nach: (el, ctx) => {
        let karte = null;
        ctx.aufraeumen.push(() => { karteWeg(karte); karte = null; });
        ladeLeaflet().then((L) => {
          if (!ctx.aktiv()) return;
          $('#wflaeche').innerHTML = '';
          karte = neueKarte(L, $('#wflaeche'));
          const pkte = r.stopps.map((s) => [O.ort[s].lat, O.ort[s].lon]);
          L.polyline(pkte, { color: r.farbe, weight: 4, opacity: 0.85, dashArray: '2 9', lineCap: 'round' }).addTo(karte);
          r.stopps.forEach((s, i) => L.marker(pkte[i], { icon: pinIcon(L, O.ort[s], { n: i + 1, farbe: r.farbe }), title: O.ort[s].name }).bindPopup(popupHtml(O.ort[s])).addTo(karte));
          karte.fitBounds(L.latLngBounds(pkte), { padding: [30, 30] });
        }).catch(() => {
          const w = $('#wkarte');
          if (w) w.outerHTML = `<div class="hinweis-box" style="margin-top:14px">${ic('karte')}<p>Die Karte braucht Internet. Die Stopps unten funktionieren auch offline.</p></div>`;
        });
      },
    };
  }

  async function vOrt(id) {
    const [ro, rg] = await Promise.allSettled([ladeO(), ladeG()]);
    if (ro.status !== 'fulfilled') throw ro.reason;
    const O = ro.value, G = rg.status === 'fulfilled' ? rg.value : null;
    const o = O.ort[id];
    if (!o) return nichtGefunden('Diesen Ort gibt es nicht.', '#/orte');
    const a = ARTEN[o.art] || ARTEN.antik;
    const evs = G ? (G.evNachOrt[o.id] || []) : [];
    const tipps = O.tippsNachOrt[o.id] || [];
    const routen = O.routeNachOrt[o.id] || [];
    const nah = O.orte.filter((x) => x.id !== o.id).map((x) => ({ x, d: abstand(o, x) })).filter((n) => n.d < 2500).sort((p, q) => p.d - q.d).slice(0, 4);
    const ep = G && G.ep[o.ep];
    const aktion = (ak, ik, an, text, href) => href
      ? `<a class="aktion" href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${ic(ik)}<span>${text}</span></a>`
      : `<button type="button" class="aktion${an ? ' an' : ''}" data-aktion="${ak}" data-id="${o.id}" aria-pressed="${an}">${ic(ik)}<span>${text}</span></button>`;
    const html = `
      <header class="detail-kopf" style="--f:${a.farbe}">${ic(a.ik, 'deko')}
        <div class="marken"><span class="marke-tag">${esc(a.eins)}</span>${o.geheimtipp ? `<span class="marke-tag gt">${ic('schluessel')}Geheimtipp</span>` : ''}</div>
        <h1>${esc(o.name)}</h1><p style="margin:0;font-size:16.5px">${esc(o.kurz)}</p>
      </header>
      <div class="aktionen">
        ${aktion('merken', 'merken', hat('gemerkt', o.id), hat('gemerkt', o.id) ? 'Gemerkt' : 'Merken')}
        ${aktion('gesehen', 'auge', hat('gesehen', o.id), hat('gesehen', o.id) ? 'Gesehen' : 'Gesehen?')}
        ${aktion('', 'karte', false, 'Auf der Karte', '#/karte/' + o.id)}
        ${aktion('', 'schritte', false, 'Weg dorthin', `https://maps.apple.com/?daddr=${o.lat},${o.lon}&dirflg=w`)}
      </div>
      <div class="zweispaltig"><div>
        <div class="warum-box"><b>${ic('stern')}Warum hin?</b><p>${esc(o.warum_hin)}</p></div>
        <div class="fakten">
          <div class="fakt">${ic('kalender')}<div><small>Erbaut</small><span>${esc(o.erbaut)}</span></div></div>
          <div class="fakt">${ic('saeule')}<div><small>Epoche</small><span>${ep ? `<a href="#/zeit/${o.ep}">${esc(o.epoche)}</a>` : esc(o.epoche)}</span></div></div>
          <div class="fakt">${ic('uhr')}<div><small>Zeit vor Ort</small><span>ca. ${minuten(o.dauer_min)}</span></div></div>
          <div class="fakt">${ic('muenze')}<div><small>Eintritt</small><span>${esc(o.kosten)}</span></div></div>
        </div>
        <section class="abschnitt"><h2>${ic('rolle')}Geschichte</h2><div class="fliess" style="margin-top:0"><p>${esc(o.geschichte)}</p></div>${quelle(o.quelle)}</section>
        <section class="abschnitt"><h2>${ic('haken')}Tipps</h2><ul class="tipp-liste">${o.tipps.map((t) => `<li>${ic('haken')}<span>${esc(t)}</span></li>`).join('')}</ul></section>
      </div><div>
        <section class="abschnitt"><h2>${ic('sanduhr')}Was geschah hier?</h2>
          ${evs.length ? `<div class="liste-luft">${evs.map((e) => evKarte(e, G)).join('')}</div>`
            : `<div class="hinweis-box">${ic('info')}<p>${G ? `Zu diesem Ort gibt es im Zeitstrahl kein eigenes Ereignis – seine Geschichte steht links bzw. oben.${ep ? ` Passende Epoche: <a href="#/zeit/${o.ep}">${esc(ep.name)}</a>.` : ''}` : 'Die Geschichte-Daten konnten gerade nicht geladen werden.'}</p></div>`}
        </section>
        ${tipps.length ? `<section class="abschnitt"><h2>${ic('schluessel')}Geheimtipp hier</h2><div class="liste-luft">${tipps.map((t) => `<div class="karte tipp-karte"><b>${esc(t.titel)}</b><p style="margin:4px 0 0">${esc(t.was)}</p><div class="warum-zeile"><b>Warum</b>${esc(t.warum)}</div>${t.wo ? `<div class="wann-zeile">${ic('pin')}${esc(t.wo)}</div>` : ''}</div>`).join('')}</div></section>` : ''}
        ${routen.length ? `<section class="abschnitt"><h2>${ic('weg')}Liegt auf dem Spaziergang</h2><div class="mini-links">${routen.map((r) => `<a href="#/weg/${r.id}">${ic('weg')}${esc(r.name)}</a>`).join('')}</div></section>` : ''}
        ${nah.length ? `<section class="abschnitt"><h2>${ic('pin')}In der Nähe</h2><div class="liste-luft">${nah.map((n) => ortKarte(n.x, `<span class="marke-tag">${ic('schritte')}ca. ${meter(n.d)}</span>`, true)).join('')}</div><p class="leise klein-text">Entfernung als Luftlinie.</p></section>` : ''}
      </div></div>`;
    return {
      tab: 'orte', titel: o.name, zurueck: '#/orte', html,
      aktionen: {
        merken: (b) => { const an = umschalten('gemerkt', o.id); b.classList.toggle('an', an); b.setAttribute('aria-pressed', an); $('span', b).textContent = an ? 'Gemerkt' : 'Merken'; meldung(an ? 'Auf deiner Merkliste' : 'Von der Merkliste genommen'); },
        gesehen: (b) => { const an = umschalten('gesehen', o.id); b.classList.toggle('an', an); b.setAttribute('aria-pressed', an); $('span', b).textContent = an ? 'Gesehen' : 'Gesehen?'; meldung(an ? `Abgehakt – ${liste('gesehen').length} Orte gesehen` : 'Nicht mehr abgehakt'); },
      },
    };
  }

  /* ----- Erleben ----- */
  async function vErleben() {
    const [ro, rg] = await Promise.allSettled([ladeO(), ladeG()]);
    if (ro.status !== 'fulfilled') throw ro.reason;
    const O = ro.value, G = rg.status === 'fulfilled' ? rg.value : null;
    let typ = sp.erlF && (sp.erlF === 'alle' || ERL_TYP[sp.erlF]) ? sp.erlF : 'alle';
    const ikonFuer = (x) => (/Espresso|Aperitivo/.test(x.titel) ? 'tasse' : ERL_TYP[x.typ].ik);
    const karte = (x) => {
      const t = ERL_TYP[x.typ] || ERL_TYP.erlebnis;
      const links = [...(x.orte || []).map((oid) => O.ort[oid] && `<a href="#/ort/${oid}">${ic('pin')}${esc(O.ort[oid].name)}</a>`),
        x.ereignis && G && G.ev[x.ereignis] ? `<a href="#/ereignis/${x.ereignis}">${ic('saeule')}${esc(G.ev[x.ereignis].titel)}</a>` : ''].filter(Boolean);
      return `<article class="karte erleben-karte"><div class="ek-kopf"><span class="ort-ikon" style="--f:${t.farbe}">${ic(ikonFuer(x))}</span><h3>${esc(x.titel)}</h3></div>
        <p class="was">${esc(x.was)}</p><div class="warum-zeile"><b>Warum</b>${esc(x.warum)}</div>
        <div class="wann-zeile">${ic('uhr')}<span>${esc(x.wann)}</span></div>${links.length ? `<div class="mini-links">${links.join('')}</div>` : ''}</article>`;
    };
    const html = `${segment('erleben', 'erleben')}
      <div class="chips" id="erlchips"><button type="button" class="chip${typ === 'alle' ? ' an' : ''}" data-typ="alle">Alles</button>${Object.keys(ERL_TYP).map((k) => `<button type="button" class="chip${typ === k ? ' an' : ''}" data-typ="${k}" style="--f:${ERL_TYP[k].farbe}">${ic(ERL_TYP[k].ik)}${ERL_TYP[k].name}</button>`).join('')}</div>
      <div class="raster" id="erlliste"></div>`;
    return {
      tab: 'erleben', titel: 'Erleben', html,
      nach: () => {
        const male = () => { $('#erlliste').innerHTML = O.erleben.filter((x) => typ === 'alle' || x.typ === typ).map(karte).join(''); };
        $('#erlchips').addEventListener('click', (e) => { const c = e.target.closest('[data-typ]'); if (!c) return; typ = c.dataset.typ; sp.erlF = typ; speichern(); $$('[data-typ]').forEach((x) => x.classList.toggle('an', x === c)); male(); });
        male();
      },
    };
  }

  async function vTipps() {
    const O = await ladeO();
    const html = `${segment('erleben', 'tipps')}
      <p class="leise" style="margin:0 0 12px">Orte, an denen die meisten vorbeigehen – und warum sie sich lohnen.</p>
      <div class="raster">${O.geheimtipps.map((t) => `<article class="karte tipp-karte erleben-karte"><div class="ek-kopf"><span class="ort-ikon" style="--f:#9A6E1C">${ic('schluessel')}</span><h3>${esc(t.titel)}</h3></div>
        <p class="was">${esc(t.was)}</p><div class="warum-zeile"><b>Warum</b>${esc(t.warum)}</div>
        ${t.wo ? `<div class="wann-zeile">${ic('pin')}<span>${esc(t.wo)}</span></div>` : ''}
        ${t.ort_id && O.ort[t.ort_id] ? `<div class="mini-links"><a href="#/ort/${t.ort_id}">${ic('pfeil')}${esc(O.ort[t.ort_id].name)}</a></div>` : ''}</article>`).join('')}</div>`;
    return { tab: 'erleben', titel: 'Geheimtipps', html };
  }

  async function vPraktisch() {
    const O = await ladeO();
    const html = `${segment('erleben', 'praktisch')}
      <div class="hinweis-box" style="margin-bottom:12px">${ic('info')}<p>${esc(O.meta.hinweis || '')}</p></div>
      <div class="akkordeon">${O.praktisch.map((x, i) => `<details${i === 0 ? ' open' : ''}><summary>${ic(x.ikon)}<span>${esc(x.thema)}</span>${ic('rechts', 'auf')}</summary><div class="ak-text">${esc(x.text)}</div></details>`).join('')}</div>
      ${(O.meta.offizielle_seiten || []).length ? `<section class="abschnitt"><h2>${ic('extern')}Offizielle Seiten zum Nachprüfen</h2><div class="seiten-liste">${O.meta.offizielle_seiten.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${ic('extern')}<span>${esc(s.titel)}</span></a>`).join('')}</div></section>` : ''}`;
    return { tab: 'erleben', titel: 'Praktisch', html };
  }

  async function vInfo() {
    const [rg, ro] = await Promise.allSettled([ladeG(), ladeO()]);
    const G = rg.value, O = ro.value;
    const html = `
      <section class="karte"><h2 class="roemisch" style="font-size:20px">Über Roma</h2>
        <p style="margin-top:8px">Römische Geschichte zum Anfassen – und ein Begleiter für die Stadt.${G ? ` ${G.epochen.length} Epochen, ${G.ereignisse.length} Ereignisse, ${G.personen.length} Personen, ${G.quiz.length} Quizfragen.` : ''}${O ? ` ${O.orte.length} Orte, ${O.geheimtipps.length} Geheimtipps, ${O.routen.length} Spaziergänge.` : ''}</p>
        <p style="margin:0">Alle Texte sind selbst geschrieben. Jedes Ereignis und jeder Ort verlinkt eine Quelle zum Weiterlesen.</p></section>
      <section class="abschnitt"><h2>${ic('feder')}Sage oder Geschichte?</h2>
        <div class="karte"><div class="legende" style="margin:0 0 8px"><span><i class="leg-knoten"></i>Geschichte: durch Quellen oder Funde belegt</span><span><i class="leg-knoten sage"></i>Sage: so erzählt es die Überlieferung</span></div>
        <p style="margin:0">„um“ vor einer Jahreszahl heißt: ungefähr. Wo Forscher streiten, steht ein Hinweis „Umstritten“ direkt beim Ereignis.</p></div></section>
      <section class="abschnitt"><h2>${ic('achtung')}Ehrlich gesagt</h2><ul class="tipp-liste">
        <li>${ic('muenze')}<span>Preise und Öffnungszeiten sind Circa-Angaben, Stand 2026. Bitte vor Ort oder auf den offiziellen Seiten prüfen (unter Erleben › Praktisch).</span></li>
        <li>${ic('schritte')}<span>Entfernungen und Gehzeiten der Spaziergänge sind geschätzt (Luftlinie mal 1,3).</span></li>
        <li>${ic('karte')}<span>Die Karte braucht Internet. Ohne Netz zeigt die App die Orte als Liste – alles andere läuft auch offline, sobald es einmal geladen war.</span></li>
        <li>${ic('standort')}<span>Dein Standort wird nur auf Wunsch abgefragt und nur auf diesem Gerät verwendet.</span></li>
        <li>${ic('stern')}<span>Sterne, Merkliste und „gesehen“ werden nur in diesem Browser gespeichert. Privates Surfen oder Löschen der Websitedaten setzt sie zurück.</span></li>
      </ul></section>
      <section class="abschnitt"><h2>${ic('rolle')}Quellen und Rechte</h2><div class="karte klein-text">
        <p>Geschichte und Orte: eigene Texte nach Fachliteratur und Wikipedia-Artikeln (jeweils verlinkt). Koordinaten aus Wikipedia.</p>
        <p style="margin:0">Kartendaten © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap-Mitwirkende</a> (ODbL). Kartenanzeige mit einer freien Bibliothek (BSD-Lizenz), die erst beim Öffnen der Karte geladen wird.</p></div></section>
      <section class="abschnitt"><h2>${ic('drehen')}Fortschritt</h2><button type="button" class="knopf zweit" data-aktion="zuruecksetzen">${ic('drehen')}Alles zurücksetzen</button></section>`;
    return {
      tab: '', titel: 'Über die App', zurueck: '#/', html,
      aktionen: {
        zuruecksetzen: () => {
          if (!confirm('Sterne, Karteikarten, Merkliste und „gesehen“ wirklich löschen?')) return;
          sp = {};
          speichern();
          meldung('Zurückgesetzt');
          zeige(true);
        },
      },
    };
  }

  function nichtGefunden(text, zurueck) {
    return { tab: '', titel: 'Nicht gefunden', zurueck, html: `<div class="hinweis-box">${ic('achtung')}<p><b>Nicht gefunden</b>${esc(text)}</p></div><div class="knopf-reihe"><a class="knopf" href="${zurueck}">Zurück</a></div>` };
  }

  /* ================= Router ================= */
  const ROUTEN = [
    [/^$/, vStart], [/^zeit(?:\/([\w-]+))?$/, vZeit], [/^personen$/, vPersonen], [/^ereignis\/([\w-]+)$/, vEreignis], [/^person\/([\w-]+)$/, vPerson],
    [/^lernen$/, vLernen], [/^quiz\/(\d)$/, vQuiz], [/^zeitreise$/, vZeitreise], [/^karten\/(\w+)$/, vKarten],
    [/^orte$/, vOrte], [/^karte(?:\/([\w-]+))?$/, vKarte], [/^wege$/, vWege], [/^weg\/([\w-]+)$/, vWeg], [/^ort\/([\w-]+)$/, vOrt],
    [/^erleben$/, vErleben], [/^tipps$/, vTipps], [/^praktisch$/, vPraktisch], [/^info$/, vInfo],
  ];
  const ansicht = $('#ansicht');
  const verlauf = [];
  const scrollMerk = {};
  let jetzt = null;
  let marke = 0;
  let ersetzenNaechste = false;
  let ctx = { aufraeumen: [], aktionen: {}, aktiv: () => false };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const pfad = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')).replace(/\/+$/, '');

  async function zeige(neuLaden) {
    const p = pfad();
    let zurueck = false;
    if (!neuLaden) {
      if (jetzt !== null) scrollMerk[jetzt] = window.scrollY;
      if (verlauf.length >= 2 && verlauf[verlauf.length - 2] === p) { verlauf.pop(); zurueck = true; }
      else if (ersetzenNaechste && verlauf.length) { verlauf[verlauf.length - 1] = p; }
      else if (verlauf[verlauf.length - 1] !== p) verlauf.push(p);
    }
    ersetzenNaechste = false;
    jetzt = p;
    $('#meldung').classList.remove('zeigen');
    const nr = ++marke;
    ctx.aufraeumen.forEach((f) => { try { f(); } catch (e) { /* weiter */ } });
    const meinCtx = { aufraeumen: [], aktionen: {}, aktiv: () => nr === marke, zurueck };
    ctx = meinCtx;
    let fn = vStart, args = [];
    for (const [re, f] of ROUTEN) { const m = p.match(re); if (m) { fn = f; args = m.slice(1); break; } }
    const lader = setTimeout(() => { if (nr === marke) ansicht.innerHTML = '<div class="seite lade-schale" aria-busy="true"><div class="lade-block gross"></div><div class="lade-block"></div><div class="lade-block"></div></div>'; }, 150);
    let erg;
    try { erg = await fn(...args); } catch (err) {
      erg = { tab: '', titel: 'Keine Verbindung', zurueck: '#/', html: `<div class="hinweis-box">${ic('achtung')}<p><b>Daten konnten nicht geladen werden</b>Bitte Internetverbindung prüfen. Was einmal geöffnet war, geht danach auch offline.</p></div><div class="knopf-reihe"><button type="button" class="knopf" data-aktion="neu">${ic('drehen')}Nochmal versuchen</button></div>` };
    }
    clearTimeout(lader);
    if (nr !== marke) return;
    meinCtx.aktionen = erg.aktionen || {};
    kopf(erg, p);
    ansicht.innerHTML = `<div class="seite${neuLaden && !zurueck ? '' : ' rein'}">${erg.html}</div>`;
    document.title = erg.titel ? `${erg.titel} – Roma` : 'Roma – Geschichte & Stadt';
    if (erg.nach) {
      try { const r = erg.nach(ansicht, meinCtx); if (r && r.catch) r.catch((e) => console.warn(e)); } catch (e) { console.warn(e); }
    }
    if (nr !== marke) return;
    requestAnimationFrame(() => {
      $$('.segment-zeiger', ansicht).forEach((z) => { z.style.transform = `translateX(${(+z.dataset.ziel) * 100}%)`; });
    });
    if (zurueck && scrollMerk[p] != null) window.scrollTo(0, scrollMerk[p]);
    else if (!(neuLaden && erg.tab === 'orte')) window.scrollTo(0, 0);
  }

  function kopf(erg, p) {
    const unter = !!erg.zurueck;
    $('#kopf').classList.toggle('unterseite', unter);
    $('#zurueck').hidden = !unter;
    $('#kopftitel').textContent = erg.titel || '';
    $('#infoknopf').hidden = p === 'info';
    $$('#leiste a').forEach((a) => {
      const an = a.dataset.tab === erg.tab;
      a.classList.toggle('aktiv', an);
      if (an) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#zurueck').dataset.ziel = erg.zurueck || '#/';
  }

  $('#zurueck').addEventListener('click', () => {
    if (verlauf.length > 1) history.back();
    else location.hash = $('#zurueck').dataset.ziel || '#/';
  });
  // Tipp auf den aktiven Reiter: nach oben
  $('#leiste').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') === '#/' + jetzt) { e.preventDefault(); window.scrollTo({ top: 0, behavior: ruhig() ? 'auto' : 'smooth' }); }
  });
  document.addEventListener('click', (e) => {
    const z = e.target.closest('[data-aktion]');
    if (z) {
      const n = z.dataset.aktion;
      if (n === 'neu') { e.preventDefault(); zeige(true); return; }
      const f = ctx.aktionen[n];
      if (f) { e.preventDefault(); f(z, e); }
      return;
    }
    const a = e.target.closest('a[data-ersetzen]');
    if (a && !e.metaKey && !e.ctrlKey) {   // blättern: Verlauf ersetzen statt stapeln
      e.preventDefault();
      ersetzenNaechste = true;
      location.replace(a.getAttribute('href'));
    }
  });
  window.addEventListener('hashchange', () => zeige(false));
  zeige(false);

  // Nach dem ersten Bild: Daten im Leerlauf vorladen, damit die Bereiche sofort da sind
  const leerlauf = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
  leerlauf(() => { ladeG().catch(() => {}); ladeO().catch(() => {}); });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
})();
