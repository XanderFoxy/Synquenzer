/* Mein Vorteil – Reiter „Filme“: Apple-TV-Filme, -Staffeln und -Boxen (Wunschliste, Für 3,99 €, Action & Thriller, Comedy,
   80er & Kult, Neu, Serien, Boxen, Disney; „Angebote“ nur, wenn dort etwas steht, das in keinem anderen Bereich vorkommt).
   Tiefstpreis ehrlich (Xander 15.11.2026): der Radar kennt nur, was er selbst seit Beobachtungsbeginn gesehen hat
   (tiefstQuelle 'eigen') – die Seite sagt „Tiefst seit Nov. 2026“, nie „Allzeit“. Ein Allzeit-Tiefst nur mit Quelle (extern).
   Eine Datei für alles (Logik + CSS mit Präfix .fi-). Nutzt nur die CSS-Variablen der Seite:
   --karte --flaeche --text --leise --linie --akzent --akzent-hell --akzent-text --warm --warm-hell --rot.
   Einbau (in mein-vorteil/index.html, Reiter „Filme“):
     MeinVorteilFilme.start(element)   beim ersten Öffnen des Reiters (zeichnet den letzten Stand sofort, holt dann frisch)
     MeinVorteilFilme.lade()           bei „Neu laden“ / Rückkehr zur Seite
   Daten: filme.json vom Vorteils-Wecker (Zweig vorteile-daten). Erst beim ersten Öffnen geholt; der letzte Stand liegt im
   localStorage und erscheint sofort, auch ohne Netz. Liest tolerant: fehlende Felder, Einzelobjekt statt Liste, Preis -1. */
(function () {
  'use strict';
  const URL_STANDARD = 'https://raw.githubusercontent.com/XanderFoxy/Synquenzer/vorteile-daten/vorteile/data/filme.json';
  const SPEICHER = 'mein-vorteil-daten-filme'; // wie die anderen Daten: { d, holZeit }
  const CHIP_SPEICHER = 'mein-vorteil-filme-chip';
  const GESEHEN = 'mein-vorteil-filme-wunsch-gesehen'; // welche Wunsch-Angebote schon einmal gezeigt wurden
  const ALT_STUNDEN = 36; // Stand älter -> rot
  // Bereiche nach Xanders Wunsch (14./15.11.2026): Wunschliste · Für 3,99 € · Action & Thriller · Comedy · 80er & Kult · Neu ·
  // Serien · Disney. Chart-Titel nur bekannt und gut bewertet (Vorteils-Radar: Wikidata/Rotten Tomatoes), nie Horror.
  const HINWEIS_STUNDEN = 6; // Stand älter -> kleiner Hinweis (kein Alarm)
  const CHIPS = [
    ['wunsch', 'Wunschliste', 'Deine Filme – sobald einer günstig ist, kommt eine Nachricht.'],
    // Xander 16.11.2026: „nur die 3,99-€-Filme als eigene Auswahl“ – einzelne Filme bis 3,99 €; Sets/Collections stehen unter Boxen
    ['fuer399', 'Für 3,99 €', 'Einzelne Filme zum Kaufen für 3,99 € (oder weniger) – deine Listen zuerst, dann die bekanntesten und bestbewerteten. Sets stehen unter „Boxen im Angebot“.'],
    // Xander 16.11.2026: „Bei den Filmen geht es mir nur um die 3,99-€-Sachen, teurere müssen nicht rein“ – alle Film-Bereiche
    // zeigen nur noch Filme bis 3,99 € (80er/Disney: deine Liste darunter eingeklappt), Neu nur, wenn dort einer 3,99 € kostet
    ['action', 'Action & Thriller', 'Action, Thriller und Sci-Fi zum Kaufen für 3,99 € – die besten zuerst.'],
    ['comedy', 'Comedy', 'Komödien zum Kaufen für 3,99 € – die besten zuerst.'],
    ['achtziger', '80er & Kult', 'Klassiker und Kultfilme für 3,99 € – der Rest deiner Liste eingeklappt darunter.'],
    ['neu', 'Neu', 'Neue Filme aus Komödie, Action und Thriller für 3,99 €.'],
    ['serien', 'Serien', 'Rick and Morty und Star Trek oben, darunter alle anderen Staffeln im Angebot – Preisknüller zuerst.'],
    // Film-Boxen (Vorteils-Radar ab 15.11.2026); Chip nur, wenn die Daten „boxen“ kennen. Xander 16.11.2026: nur Boxen, die gerade
    // deutlich reduziert sind (echter Unterschied zum Originalpreis) – Tipps ohne Vergleichspreis eingeklappt darunter
    ['boxen', 'Boxen im Angebot', 'Film- und Serien-Boxen, die gerade deutlich reduziert sind: mindestens 20 % unter dem üblichen Preis oder dem Vergleichspreis.'],
    ['disney', 'Disney', 'Disney und Pixar für 3,99 € – der Rest deiner Liste eingeklappt darunter.'],
    ['weitere', 'Angebote', 'Weitere Filme für 3,99 €, die in keinem anderen Bereich stehen.'], // Chip nur, wenn hier etwas steht
  ];
  const GRUPPEN = [...CHIPS.map(([k]) => k).filter(k => k !== 'weitere'), 'angebot']; // „angebot“ = alle Angebote des Radars
  const ALT_CHIPS = { angebot: 'fuer399' }; // gemerkter Bereich der Fassung vor dem 15.11.2026 („Angebote“ war der Start)
  const LEER = {
    wunsch: 'Deine Wunschliste ist gerade leer.',
    fuer399: 'Gerade keine guten Filme für 3,99 € – du bekommst eine Nachricht, sobald einer deiner Filme günstig ist.',
    action: 'Gerade keine Action- oder Thriller-Filme für 3,99 €.',
    comedy: 'Gerade keine Komödien für 3,99 €.',
    neu: 'Gerade kein neuer Film für 3,99 €.',
    weitere: 'Gerade keine weiteren Angebote.',
    achtziger: 'Gerade kein Film aus deiner 80er-Liste für 3,99 €.',
    serien: 'Gerade keine Staffeln von Rick and Morty oder Star Trek gefunden.',
    boxen: 'Gerade keine Box deutlich reduziert – der Radar prüft alle paar Stunden neu.',
    disney: 'Gerade kein Disney-Film für 3,99 €.',
  };
  const QUELLE = { 'apple-suche': 'Apple-Store', apple: 'Apple-Store', itunes: 'Apple-Store', 'apple-charts': 'Apple-Charts', charts: 'Apple-Charts', mydealz: 'mydealz', 'apple-preise': 'Apple-Preise', 'apple-tv-raeume': 'Apple-TV-Angebote (Räume der TV-App)', qualitaet: 'Wikidata (Bekanntheit, Kritik, Horror)', 'apple-boxen': 'Apple-Boxen', 'apple-serien': 'Apple-Serien-Charts', 'apple-breit': 'Apple-Charts je Genre', 'wikidata-details': 'Wikidata (Studio, Einspielergebnis, Besetzung)' };

  // --- kleine Helfer ---------------------------------------------------------------------------------------------------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const zahl = v => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (typeof v === 'string' && /^\s*\d+(?:[.,]\d+)?\s*$/.test(v)) return Number(v.replace(',', '.'));
    return null;
  };
  const preisVon = v => { const z = zahl(v); return z != null && z > 0 ? z : null; }; // -1 / 0 / fehlt = kein Preis
  const sicher = u => (typeof u === 'string' && /^https:\/\//i.test(u.trim()) ? u.trim() : null);
  const euro = v => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lies = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const merk = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const datum = v => { const m = /^(\d{4}-\d\d-\d\d)/.exec(typeof v === 'string' ? v : ''); return m ? m[1] : null; };
  const tm = d => { const m = /^\d{4}-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${m[2]}.${m[1]}.` : ''; }; // „07.11.“
  const MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
  const monatJahr = d => { const m = /^(\d{4})-(\d\d)/.exec(d || ''); return m ? `${MONATE[Number(m[2]) - 1]}\u00a0${m[1]}` : ''; }; // „Nov. 2026“ (geschützt: bricht nicht um)
  const tagMonat = d => { const m = /^\d{4}-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${Number(m[2])}.\u00a0${MONATE[Number(m[1]) - 1]}` : ''; }; // „7. Nov.“

  // Berliner Zeit
  let FMT = null;
  function teile(t) {
    FMT = FMT || new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const o = {};
    for (const p of FMT.formatToParts(new Date(t))) o[p.type] = p.value;
    return o;
  }
  const tagKey = t => { const p = teile(t); return `${p.year}-${p.month}-${p.day}`; };
  function standText(iso) { // „heute 14:05“, „gestern 09:10“, „Do 05.11., 14:05“
    const t = Date.parse(iso || '');
    if (!Number.isFinite(t)) return null;
    const p = teile(t), k = tagKey(t);
    const tag = k === tagKey(Date.now()) ? 'heute' : k === tagKey(Date.now() - 864e5) ? 'gestern' : `${p.weekday.replace('.', '')} ${p.day}.${p.month}.,`;
    return `${tag} ${p.hour}:${p.minute}`;
  }

  // Apple-Bilder: …/100x100bb.jpg -> …/200x200bb.jpg (scharf genug für 56 × 84 px, klein genug fürs Netz)
  const bildUrl = u => { const s = sicher(u); return s ? s.replace(/\/\d+x\d+bb\.(jpe?g|png|webp)(\?.*)?$/i, '/200x200bb.$1') : null; };
  const STAFFEL = /\b(?:Staffel|Season|Series|Volume|Vol\.|Teil)\s*(\d+)\b/i;
  const staffelNr = t => { const m = STAFFEL.exec(t.titel); return m ? Number(m[1]) : null; };
  function serieVon(t) { // „Star Trek: The Next Generation, Staffel 3“ -> „Star Trek: The Next Generation“
    if (t.serie) return t.serie;
    const m = /^(.*?)[\s,:–—(\[-]*\b(?:Staffel|Season|Series|Volume|Vol\.|Teil)\s*\d+\b/i.exec(t.titel); // auch „(Staffel 5)“
    return m && m[1].trim() ? m[1].trim() : t.titel;
  }

  // --- Daten tolerant lesen ------------------------------------------------------------------------------------------
  // gleiche Regel wie vorteile/scan/module/filme.mjs GERAET_TITEL und index.html FILM_GERAET
  const GERAET = /^\W*apple\s?tv(?:\s?4k|\s?hd)?\s*(?:\(\s*(?:\d\.\s*gen|20\d\d)|20\d\d\b|\d+\s?gb\b|$|wi-?fi|ethernet)|\bsiri remote\b|\bapple tv\s?4k\b.*\b(?:chip|gebraucht|refurbished|generation)\b/i;
  const liste = x => (Array.isArray(x) ? x : x && typeof x === 'object' ? [x] : []);
  function titelNorm(t) {
    if (!t || typeof t !== 'object') return null;
    const titel = typeof t.titel === 'string' ? t.titel.trim() : '';
    if (!titel) return null; // ohne Titel nicht zeigen
    if (GERAET.test(titel)) return null; // „Apple TV 4K (2026)“ ist ein Gerät, kein Film (mydealz-Gruppe apple-tv, 08.11.2026)
    const preisSd = preisVon(t.preisSd), preisHd = preisVon(t.preisHd);
    const j = /\b(1[89]\d\d|20\d\d)\b/.exec(String(t.jahr ?? ''));
    const tp = t.tiefst && typeof t.tiefst === 'object' ? preisVon(t.tiefst.p) : null;
    // Preisknüller-Felder (Vorteils-Radar ab 15.11.2026) – fehlen sie, bleibt alles wie vorher
    const ers = t.ersparnis && typeof t.ersparnis === 'object' ? t.ersparnis : null;
    const pct = ers ? zahl(ers.pct) : null;
    const ex = t.extern && typeof t.extern === 'object' ? t.extern : null;
    const exP = ex ? preisVon(ex.p) : null, exQ = ex && typeof ex.quelle === 'string' ? ex.quelle.trim().slice(0, 40) : '';
    const grund = t.knueller && typeof t.knueller === 'object' && typeof t.knueller.grund === 'string' ? t.knueller.grund.trim().slice(0, 60) : '';
    return {
      id: String(t.id ?? titel), typ: t.typ === 'staffel' || t.typ === 'box' ? t.typ : 'film', titel, jahr: j ? Number(j[1]) : null,
      genre: typeof t.genre === 'string' ? t.genre.trim() : '',
      preis: preisVon(t.preis) ?? preisHd ?? preisSd, leihe: preisVon(t.leihe), vorher: preisVon(t.vorher),
      tiefst: tp != null ? { p: tp, tag: datum(t.tiefst.tag) } : null, seit: datum(t.seit),
      istTiefst: t.istTiefst === true, angebot: t.angebot === true, unterZiel: t.unterZiel === true, ziel: preisVon(t.ziel),
      fehlt: t.fehlt === true, bild: bildUrl(t.bild), link: sicher(t.link),
      chart: zahl(t.chart) > 0 ? Math.round(zahl(t.chart)) : null, quelle: typeof t.quelle === 'string' ? t.quelle : '',
      serie: typeof t.serie === 'string' && t.serie.trim() ? t.serie.trim() : null,
      // Apple-TV-Angebotsraum („Filme für 3,99 €“), in dem der Film gerade steht (Vorteils-Radar ab Fassung 5)
      raum: typeof t.raum === 'string' && t.raum.trim() ? t.raum.trim().slice(0, 60) : null,
      // Rotten Tomatoes in % (Vorteils-Radar ab 14.11.2026), „neu“ = neuer Film aus den Charts
      rt: zahl(t.rt) != null && zahl(t.rt) >= 0 && zahl(t.rt) <= 100 ? Math.round(zahl(t.rt)) : null, neu: t.neu === true,
      bekannt: zahl(t.bekannt) != null && zahl(t.bekannt) >= 0 ? Math.round(zahl(t.bekannt)) : null, // in so vielen Wikipedia-Sprachen (Bekanntheit)
      ueblich: preisVon(t.ueblich), ersparnis: pct != null && pct > 0 && pct < 100 ? { eur: preisVon(ers.eur), pct: Math.round(pct) } : null,
      ueberTiefst: zahl(t.ueberTiefst) != null && zahl(t.ueberTiefst) >= 0 ? zahl(t.ueberTiefst) : null, nieSoGuenstig: t.nieSoGuenstig === true,
      // neuer Radar bewertet selbst (nieSoGuenstig vorhanden): dann gilt nur sein Urteil – nicht „so günstig wie nie“ nach einem Kurz-Hoch
      bewertet: typeof t.nieSoGuenstig === 'boolean', neuEntdeckt: t.neuEntdeckt === true, komplett: t.komplett === true,
      knueller: grund ? { grund } : null,
      // Allzeit-Tiefst nur vollständig: Preis, Quelle, https-Link (heute liefert der Radar keinen – keine erlaubte Quelle)
      extern: exP != null && exQ && sicher(ex.url) ? { p: exP, tag: datum(ex.tag), quelle: exQ, url: sicher(ex.url) } : null,
      wunsch: t.wunsch !== false, // Staffeln: false = andere Serie im Angebot (alte Daten: alles „deine Serien“)
      filme: zahl(t.filme) >= 2 ? Math.round(zahl(t.filme)) : null, jeFilm: preisVon(t.jeFilm),
      // Große Produktion/Kinohit und Besetzung (Vorteils-Radar ab 16.11.2026, Wikidata): gross = Grund ('kinohit' | 'studio' |
      // 'weltbekannt' | 'oscar'), null = eher kleine/Indie-Produktion, undefined = noch keine Daten (dann zählt die Bekanntheit)
      gross: typeof t.gross === 'string' && t.gross ? t.gross.slice(0, 20) : t.gross === null ? null : undefined,
      cast: Array.isArray(t.cast) ? t.cast.filter(x => typeof x === 'string' && x.trim()).slice(0, 8).map(x => x.trim().slice(0, 40)) : [],
      studio: typeof t.studio === 'string' && t.studio.trim() ? t.studio.trim().slice(0, 40) : null,
      einspiel: zahl(t.einspiel) > 0 ? Math.round(zahl(t.einspiel)) : null, oscars: zahl(t.oscars) > 0 ? Math.round(zahl(t.oscars)) : 0,
      // mydealz-Tipp, den der Radar einem Apple-Film zuordnen konnte (Link = TV-App), bzw. Hinweis bei einem Tipp ohne Zuordnung
      tipp: t.tipp && typeof t.tipp === 'object' && sicher(t.tipp.link) ? { link: sicher(t.tipp.link) } : null,
      hinweis: typeof t.hinweis === 'string' && t.hinweis.trim() ? t.hinweis.trim().slice(0, 80) : '',
    };
  }
  // „6 Filme in 4K …“ von mydealz: Preis je Film (wie preisJeFilm im Scanner) – erklärt, warum ein Set unter „Für 3,99 €“ steht
  const SET = /\b(\d{1,2})[\s-]*(?:filme|film-kollektion|film collection|filme-kollektion|movie collection|movies)\b/i;
  const zuerst = (arr, f) => [...arr.filter(f), ...arr.filter(x => !f(x))]; // stabil
  const FUER399 = 3.99, BOX_DEUTLICH = 20;
  // echter Vergleichspreis einer Box: der übliche Preis (Apple, vom Radar beobachtet) – sonst der Vergleichspreis/„statt“ (mydealz)
  // bzw. der zuletzt andere Preis; gleiche Regel wie „statt“ in karte()
  const boxStatt = t => (t.fehlt || t.preis == null ? null : t.ueblich != null ? (t.ueblich > t.preis + 0.004 ? t.ueblich : null)
    : t.vorher != null && t.vorher > t.preis + 0.004 ? t.vorher : null);
  const boxPct = t => { const s = boxStatt(t); return s ? Math.round((1 - t.preis / s) * 100) : 0; };
  const boxDeutlich = t => boxPct(t) >= BOX_DEUTLICH;
  // Reihenfolge in „Für 3,99 €“, „Action & Thriller“, „Comedy“ (Xander 15.11.2026: Kinderfilme ja, aber nicht vor den
  // Top-Filmen): deine Listen zuerst (wie der Scanner), dann Top-Filme, dann Kinderfilme, dann der Rest – je nach Bekanntheit
  // und Kritik (gleicher Wert wie qualiWert im Scanner); Tipps von mydealz und Angebots-Räume bleiben in Scanner-Reihenfolge hinten.
  // Top-Film = sehr bekannt (≥ 55 Wikipedia-Sprachen = qualiBlockbuster im Scanner) oder Kritik ≥ 80 % UND bekannt (≥ 30 Sprachen
  // = qualiBekannt) – sonst stünde Antigone (8 Sprachen) als „bekanntester“ Film vor Shrek (Prüfer-Befund MV8 5)
  const KINDER = /kinder|familie|animation/i, TOP_RT = 80, TOP_BEKANNT = 55, TOP_RT_BEKANNT = 30;
  const wert = t => (t.bekannt != null ? (t.rt ?? 55) + Math.min(t.bekannt, 120) / 2 : 0);
  function nachGuete(arr, g) {
    const wunsch = new Set(g.wunsch.map(t => t.id)), listen = new Set([...g.achtziger, ...g.disney].map(t => t.id));
    const rang = t => (!/^itunes:/.test(t.id) ? 9 : wunsch.has(t.id) || t.unterZiel || t.ziel != null ? 0
      // Listen-Titel prüft der Scanner nicht bei Wikidata (keine Bewertung) – Klassiker aus den Charts haben eine
      : listen.has(t.id) && t.bekannt == null && t.rt == null ? 1
      : KINDER.test(t.genre) ? 3 : ((t.rt ?? 0) >= TOP_RT && (t.bekannt ?? 0) >= TOP_RT_BEKANNT) || (t.bekannt ?? 0) >= TOP_BEKANNT ? 2 : 4);
    return arr.map((t, i) => [t, i, rang(t)])
      .sort((a, b) => a[2] - b[2] || (a[2] >= 2 && a[2] <= 4 ? wert(b[0]) - wert(a[0]) || (a[0].chart ?? 1e6) - (b[0].chart ?? 1e6) : 0) || a[1] - b[1])
      .map(x => x[0]);
  }
  // mydealz-Tipp zu genau einem Film, der in derselben Liste schon als Apple-Karte steht („Flow ~ 3,99€ | UHD …“ neben „Flow“)
  // -> nur die Apple-Karte (Prüfer-Befund MV8 4). Sets („6 Filme …“) bleiben; nach dem Apple-Titel muss ein Trenner folgen
  // (~ - | : ( , Preis, „für“), damit „Up“ nicht „Up to 5 …“ schluckt.
  const kleinTitel = s => String(s || '').toLowerCase().replace(/\s*\((?:1[89]|20)\d\d\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  function ohneDoppelTipp(arr) {
    const apple = arr.filter(t => !/mydealz/i.test(t.quelle)).map(t => kleinTitel(t.titel)).filter(x => x.length >= 2);
    return arr.filter(t => {
      if (!/mydealz/i.test(t.quelle) || Number(SET.exec(t.titel)?.[1]) >= 2) return true;
      const m = kleinTitel(t.titel);
      return !apple.some(a => m.startsWith(a) && /^(?:\s*$|\s*[~|:(\[,–—-]|\s+(?:für|for|ab|nur)\b|\s*\d)/.test(m.slice(a.length)));
    });
  }
  function normalisiere(d) {
    const g = d && typeof d === 'object' && d.gruppen && typeof d.gruppen === 'object' && !Array.isArray(d.gruppen) ? d.gruppen : {};
    const gruppen = {};
    for (const k of GRUPPEN) {
      const gesehen = new Set();
      gruppen[k] = liste(g[k]).map(titelNorm).filter(t => t && !gesehen.has(t.id) && gesehen.add(t.id));
    }
    // Reihenfolge kommt vom Scanner; die Seite sorgt dafür, dass Angebote oben stehen und Top-Filme vor Kinderfilmen
    gruppen.wunsch = zuerst(zuerst(gruppen.wunsch, t => !t.fehlt), t => t.angebot || t.unterZiel);
    const doppelt = new Set(); // weggelassene Doppel-Tipps stehen nicht unter „Angebote“ (die Apple-Karte ist ja da)
    for (const k of ['fuer399', 'action', 'comedy']) {
      const ohne = ohneDoppelTipp(gruppen[k]);
      for (const t of gruppen[k]) if (!ohne.includes(t)) doppelt.add(t.id);
      gruppen[k] = nachGuete(ohne, gruppen);
    }
    gruppen.neu = gruppen.neu.map((t, i) => [t, i]).sort((a, b) => (a[0].chart ?? 1e6) - (b[0].chart ?? 1e6) || a[1] - b[1]).map(x => x[0]);
    for (const k of ['achtziger', 'disney']) gruppen[k] = zuerst(gruppen[k], t => t.angebot);
    // „Für 3,99 €“ = einzelne Filme bis 3,99 € (ein Film aus einem Angebotsraum ohne Preis bleibt); mydealz-Sets („Indiana Jones
    // 4 Filme für 14,99 €“) wandern zu den Boxen (Xander 16.11.2026)
    // (nur mit neuen Daten, die „boxen“ kennen – eine alte Datei bleibt wie vorher)
    const neu = 'boxen' in g;
    const set = t => /mydealz/i.test(t.quelle) && Number(SET.exec(t.titel)?.[1]) >= 2;
    const sets = neu ? gruppen.fuer399.filter(set) : [];
    // nur 3,99 € (Xander 16.11.2026: „teurere müssen nicht rein; ich will sparen“): alle Film-Bereiche zeigen nur Filme bis 3,99 €
    // (ein Film aus einem Angebotsraum ohne Preis bleibt); deine 80er-/Disney-Liste bleibt vollständig, Teureres eingeklappt darunter
    const bis399 = t => t.typ === 'film' && (t.preis != null ? t.preis <= FUER399 + 0.004 : !!t.raum);
    gruppen.fuer399 = gruppen.fuer399.filter(t => !set(t) && bis399(t));
    for (const k of ['action', 'comedy', 'neu']) gruppen[k] = gruppen[k].filter(bis399);
    for (const k of ['achtziger', 'disney']) { gruppen[k + 'Teurer'] = gruppen[k].filter(t => !bis399(t)); gruppen[k] = gruppen[k].filter(bis399); }
    // Boxen im Angebot: Film-Boxen, mydealz-Sets und Komplett-Boxen von Serien – oben nur deutlich reduzierte (echter
    // Vergleichspreis, ≥ BOX_DEUTLICH %), darunter eingeklappt die Tipps ohne (oder mit kleinem) Vergleichspreis
    const boxGesehen = new Set();
    const boxAlle = [...gruppen.boxen, ...sets, ...(neu ? gruppen.serien.filter(t => t.komplett) : [])].filter(t => !boxGesehen.has(t.id) && boxGesehen.add(t.id));
    gruppen.boxen = zuerst(boxAlle.filter(boxDeutlich).sort((a, b) => boxPct(b) - boxPct(a)), t => t.knueller);
    gruppen.boxenTipps = boxAlle.filter(t => !boxDeutlich(t));
    // mydealz-Tipp, den der Radar einem Apple-Film zugeordnet hat (gleicher Deal-Link): nur die Apple-Karte, nicht zusätzlich der
    // Tipp unter „Angebote“ (echter Lauf 43826385997: „Der Grinch ~ 3,99€“ neben „Dr. Seuss' Der Grinch“)
    const tippLinks = new Set(GRUPPEN.flatMap(k => gruppen[k]).map(t => t.tipp && t.tipp.link).filter(Boolean));
    for (const t of gruppen.angebot) if (/mydealz/i.test(t.quelle) && t.link && tippLinks.has(t.link)) doppelt.add(t.id);
    // „Angebote“ nur mit dem, was sonst fehlt
    const sonst = new Set([...GRUPPEN.filter(k => k !== 'angebot').flatMap(k => gruppen[k].map(t => t.id)), ...gruppen.boxenTipps.map(t => t.id)]);
    gruppen.weitere = gruppen.angebot.filter(t => !sonst.has(t.id) && !doppelt.has(t.id) && bis399(t) && !set(t));
    const status = d && typeof d.status === 'object' && d.status ? d.status : {};
    const boxenOhneUeblich = 'boxen' in g && !liste(g.boxen).some(t => t && t.quelle !== 'mydealz' && zahl(t.ueblich) > 0);
    return { aktualisiert: typeof d?.aktualisiert === 'string' ? d.aktualisiert : null, gruppen, status, mitBoxen: 'boxen' in g, boxenOhneUeblich };
  }
  // Stand eines Scanners vor dem 14.11.2026, 23:39 (Prüfer-Befund MV8 9): ohne „Für 3,99 €“/Action/Comedy, „Angebote“ noch ohne
  // Horror- und Qualitätsfilter (Midsommar, Longlegs …). Der wird nicht aus dem Gerätespeicher gezeigt – lieber kurz „Lade Filme …“.
  function altFormat(d) {
    const g = d && d.gruppen && typeof d.gruppen === 'object' ? d.gruppen : {};
    if (!('fuer399' in g)) return true;
    return !liste(g.fuer399).length && !liste(g.action).length && !liste(g.comedy).length && liste(g.angebot).length > 0;
  }
  const sichtbar = n => CHIPS.filter(([k]) => (k !== 'weitere' || n.gruppen.weitere.length) && (k !== 'neu' || n.gruppen.neu.length) && (k !== 'boxen' || n.mitBoxen || n.gruppen.boxen.length || n.gruppen.boxenTipps.length));

  // --- Filter (Xander 16.11.2026: „Filter, um Indie-Produktionen auszublenden – nur bekannte große Produktionen/Kinohits; nach
  // Schauspieler filtern; Möglichkeiten, die die Apple-TV-Seite nicht hat“): nur bekannte, Genre, Jahrzehnt, Schauspieler,
  // Reihenfolge – alles lokal auf dem Gerät, Zustand gemerkt; gilt in den Film-Bereichen (nicht Wunschliste, Serien, Boxen)
  const FILTER_SPEICHER = 'mein-vorteil-filme-filter';
  const FILTER_CHIPS = new Set(['fuer399', 'action', 'comedy', 'achtziger', 'disney', 'neu', 'weitere']);
  const GENRES = [
    ['action', 'Action & Thriller', /action|abenteuer|thriller|krimi|krieg/i],
    ['scifi', 'Sci-Fi & Fantasy', /science|sci-?fi|fantasy/i],
    ['komoedie', 'Komödie', /kom(?:ö|oe)die|comedy/i],
    ['kinder', 'Kinder & Familie', /kinder|familie|animation|anime/i],
    ['drama', 'Drama & Romantik', /drama|roman/i],
    ['klassiker', 'Klassiker & Western', /klassiker|western/i],
    ['musik', 'Musik & Musicals', /musi[ck]/i],
    ['doku', 'Doku & Sport', /doku|sport/i],
  ];
  const genreVon = t => (GENRES.find(([, , re]) => re.test(t.genre || '')) || ['andere'])[0];
  const JAHRZEHNTE = [['2020', '2020er'], ['2010', '2010er'], ['2000', '2000er'], ['1990', '90er'], ['1980', '80er'], ['1970', '70er'], ['0', 'vor 1970']];
  const jahrzehntVon = t => (t.jahr == null ? '' : String(t.jahr >= 1970 ? Math.floor(t.jahr / 10) * 10 : 0));
  const SORTEN = [['', 'Beste zuerst'], ['kino', 'Kinohits zuerst'], ['neu', 'Neueste zuerst'], ['alt', 'Älteste zuerst'], ['kritik', 'Beste Kritiken']];
  // „bekannt“ = große Produktion oder Kinohit laut Radar (Wikidata: Einspielergebnis, großes Studio, Bekanntheit, Oscars);
  // ohne diese Daten (älterer Stand) wie bisher sehr bekannt (≥ 55 Wikipedia-Sprachen = qualiBlockbuster im Scanner)
  const istBekannt = t => (t.gross !== undefined ? !!t.gross : (t.bekannt ?? 0) >= 55);
  const fold = x => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function filterLesen() {
    const f = lies(FILTER_SPEICHER, null) || {};
    const text = (v, n = 20) => (typeof v === 'string' ? v.slice(0, n) : '');
    return { bekannt: f.bekannt === true, genre: text(f.genre), jahrzehnt: text(f.jahrzehnt), schauspieler: text(f.schauspieler, 60), sort: text(f.sort) };
  }
  const filterAktiv = f => !!(f.bekannt || f.genre || f.jahrzehnt || f.schauspieler);
  function filtere(arr, f, ohne = '') {
    return arr.filter(t => (ohne === 'bekannt' || !f.bekannt || istBekannt(t))
      && (ohne === 'genre' || !f.genre || genreVon(t) === f.genre)
      && (ohne === 'jahrzehnt' || !f.jahrzehnt || jahrzehntVon(t) === f.jahrzehnt)
      && (ohne === 'schauspieler' || !f.schauspieler || (t.cast || []).some(c => fold(c) === fold(f.schauspieler))));
  }
  function sortiere(arr, sort) {
    const by = { kino: t => -(t.einspiel ?? -1), neu: t => -(t.jahr ?? 0), alt: t => t.jahr ?? 9999, kritik: t => -(t.rt ?? -1) }[sort];
    return by ? arr.map((t, i) => [t, i]).sort((a, b) => by(a[0]) - by(b[0]) || a[1] - b[1]).map(x => x[0]) : arr;
  }
  const gefiltert = (k, f = S.f) => (FILTER_CHIPS.has(k) ? sortiere(filtere(S.n.gruppen[k] || [], f), f.sort) : S.n.gruppen[k] || []);
  /** Schauspieler der Liste mit Zahl der Filme (die anderen Filter gelten) – meiste Filme zuerst */
  function schauspielerListe(arr, f, suche = '') {
    const z = new Map();
    for (const t of filtere(arr, f, 'schauspieler')) for (const c of t.cast || []) z.set(c, (z.get(c) || 0) + 1);
    const q = fold(suche).trim();
    return [...z.entries()].filter(([c]) => !q || fold(c).includes(q)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'));
  }
  // Start: Wunschliste, wenn dort ein (neues) Angebot ist – sonst der zuletzt gewählte Bereich, sonst „Für 3,99 €“
  function startChip(n) {
    const sig = n.gruppen.wunsch.filter(t => t.angebot || t.unterZiel).map(t => `${t.id}@${t.preis}`).sort().join('|');
    const g0 = lies(CHIP_SPEICHER, null);
    const gemerkt = ALT_CHIPS[g0] || g0;
    if (sig !== lies(GESEHEN, '')) { merk(GESEHEN, sig); if (sig) return 'wunsch'; }
    return sichtbar(n).some(([k]) => k === gemerkt) ? gemerkt : sig ? 'wunsch' : 'fuer399';
  }

  // --- Karten ------------------------------------------------------------------------------------------------------------
  const zeigeTiefst = t => t.istTiefst && !t.fehlt && t.preis != null && (t.vorher != null || t.angebot || t.unterZiel || t.preis <= 3.99);
  // „Knüller“-Marke: kleines gezeichnetes Preisschild (SVG, kein Emoji), Grund steht in der Zeile darunter
  const KNUELLER_SVG = '<svg class="fi-ks" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1 6.2V1.6c0-.3.3-.6.6-.6h4.6l4.6 4.6c.3.3.3.7 0 1l-4 4c-.3.3-.7.3-1 0z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="3.6" cy="3.6" r="1" fill="currentColor"/></svg>';
  /**
   * Tiefstpreis-Zeile – ehrlich: eigene Beobachtung heißt „Tiefst seit <Monat Jahr>“ bzw. „so günstig wie nie (seit 7. Nov.)“,
   * ein Allzeit-Tiefst nur mit Quelle (extern). Nie „Allzeit“ ohne Quelle.
   */
  function tiefstTeile(t) {
    const teile = [];
    if (t.fehlt) return teile;
    if (t.tiefst) {
      const hoeher = t.preis == null || t.preis > t.tiefst.p + 0.004; // ohne Preis: zuletzt gesehener Tiefstpreis mit Tag
      const heute = t.seit === tagKey(Date.now());
      const nie = t.bewertet ? t.nieSoGuenstig : (!hoeher && t.vorher != null && t.vorher > t.preis + 0.004);
      if (!hoeher && t.vorher == null && !zeigeTiefst(t) && !nie) { // Preis hat sich nie bewegt
        if (t.seit && !heute) teile.push(esc(`Preis unverändert seit ${tagMonat(t.seit)}`));
      } else if (!hoeher && nie) {
        teile.push(esc(`so günstig wie nie${t.seit ? (heute ? ' (seit heute beobachtet)' : ` (seit ${tagMonat(t.seit)})`) : ''}`));
      } else {
        const seit = t.seit ? (heute ? ' seit heute' : ` seit ${monatJahr(t.seit)}`) : '';
        const ueber = hoeher && t.preis != null ? ` · ${euro(Math.round((t.preis - t.tiefst.p) * 100) / 100)} über Tiefst` : '';
        teile.push(esc(`Tiefst${seit}: ${euro(t.tiefst.p)}${hoeher && t.tiefst.tag ? ` am ${tagMonat(t.tiefst.tag)}` : ''}${ueber}`));
      }
    }
    if (t.extern) teile.push(esc(`Allzeit-Tiefst ${euro(t.extern.p)} laut ${t.extern.quelle}`));
    return teile;
  }
  function initialen(s) { return s.split(/[\s:–-]+/).filter(w => /^[\p{L}\d]/u.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join(''); }
  function karte(t, staffel, chip) {
    // andere Serien stehen ohne Serien-Überschrift: dort der volle Name („Breaking Bad, Staffel 2“); mydealz-Tipps und
    // Komplett-Boxen ebenso („Staffel 1 bis 7 je 9,99 €“ ist nicht „Staffel 1“)
    const name = staffel && chip !== 'andere' && !/mydealz/i.test(t.quelle) && !t.komplett && staffelNr(t) != null ? `Staffel ${staffelNr(t)}` : t.titel;
    // „Charade (1963)“ nicht noch einmal „(1963)“, „Scarface (1983)“ nicht „(1983) (1984)“ (Apple-Datum = deutscher Start)
    const jahrDoppelt = t.jahr != null && /\((?:1[89]|20)\d\d\)/.test(name);
    const marken = [];
    if (t.fehlt) marken.push('<span class="fi-marke fi-grau">nicht im Apple-Store</span>');
    if (t.knueller && !t.fehlt && t.preis != null) marken.push(`<span class="fi-marke fi-knueller">${KNUELLER_SVG}Knüller</span>`);
    // „Tiefstpreis“ nur, wenn es etwas heißt: gesenkt, Angebot oder ≤ 3,99 € – nicht bei einem Preis, der sich nie bewegt hat
    if (zeigeTiefst(t)) marken.push('<span class="fi-marke fi-stark">Tiefstpreis</span>');
    // Box-Tipp ohne deutlichen Vergleichspreis: kein „Angebot“ und kein Rahmen (der Rahmen heißt: echt reduziert)
    const tipp = chip === 'boxtipp';
    if (t.angebot && !t.fehlt && !tipp) marken.push('<span class="fi-marke">Angebot</span>');
    if (t.unterZiel && !t.fehlt) marken.push('<span class="fi-marke fi-warm">unter deinem Ziel</span>');
    if (t.raum && !t.fehlt) marken.push(`<span class="fi-marke">Apple TV: ${esc(t.raum)}</span>`);
    const preis = t.fehlt ? ''
      : t.preis != null ? `<span class="fi-preis">${esc(euro(t.preis))}</span>`
      : `<span class="fi-preis fi-ohnepreis">${t.leihe != null ? `nur leihen: ${esc(euro(t.leihe))}` : 'gerade nicht zu kaufen'}</span>`;
    const klein = [];
    if (t.fehlt) klein.push('Wird weiter gesucht – sobald er im Store ist, steht er hier.');
    // „statt“: der übliche Preis (am längsten gesehen), sobald der Radar einen kennt – auch wenn er dem heutigen gleicht (dann kein
    // „statt“: nach einem Kurz-Hoch ist der Normalpreis kein Angebot). Ohne üblichen Preis wie bisher der zuletzt andere.
    const statt = t.fehlt || t.preis == null ? null : t.ueblich != null ? (t.ueblich > t.preis + 0.004 ? t.ueblich : null)
      : t.vorher != null && t.vorher > t.preis + 0.004 ? t.vorher : null;
    const pctStatt = statt != null && t.ersparnis && Math.round((1 - t.preis / statt) * 100) === t.ersparnis.pct ? t.ersparnis.pct : null;
    if (statt != null) klein.push(`statt <s>${esc(euro(statt))}</s>${pctStatt != null ? esc(` (−${pctStatt} %)`) : ''}`);
    const tt = tiefstTeile(t);
    // Grund nur, wenn er mehr sagt als die Zeile ohnehin: „x % unter dem üblichen Preis“ (= statt … (−x %)), „so günstig wie nie“
    // (steht in der Tiefst-Zeile), „gesenkt, x € je Film“ (Box-Zeile) und „Staffel gesenkt auf …“ (Preis + statt) – Prüfer 15.11.
    const g = t.knueller && !t.fehlt && t.preis != null ? t.knueller.grund : '';
    const gesagt = (/^\d+ % unter dem üblichen Preis$/.test(g) && pctStatt != null) || (/^so günstig wie nie$/.test(g) && tt.some(x => x.startsWith('so günstig wie nie')))
      || (/je Film$/.test(g) && t.typ === 'box' && t.filme) || (/^Staffel gesenkt auf/.test(g) && statt != null);
    if (g && !gesagt) klein.push(esc(g));
    if (t.neuEntdeckt && !t.fehlt && t.preis != null) klein.push('neu in den Charts – noch kein Preisvergleich');
    klein.push(...tt);
    if (t.typ === 'box' && !t.fehlt && t.filme && t.preis != null) klein.push(esc(`${t.filme} Filme, je ${euro(t.jeFilm ?? t.preis / t.filme)}`));
    if (t.ziel != null && !t.fehlt && !t.unterZiel) klein.push(esc(`dein Ziel: ${euro(t.ziel)}`));
    const set = Number(SET.exec(t.titel)?.[1]);
    // kurz, damit die Zeile auch bei 375 px einzeilig bleibt (Prüfer-Befund MV8 2): „4 Filme, je 3,75 € · mydealz-Tipp“
    if (/mydealz/i.test(t.quelle) && set >= 2 && t.preis != null) klein.push(esc(`${set} Filme, je ${euro(t.preis / set)}`));
    if (/mydealz/i.test(t.quelle)) klein.push(set >= 2 && t.preis != null ? 'mydealz-Tipp' : 'Tipp von mydealz');
    if (/mydealz/i.test(t.quelle) && t.hinweis) klein.push(esc(t.hinweis));
    if (t.tipp && !/mydealz/i.test(t.quelle)) klein.push('Tipp von mydealz'); // vom Radar dem Apple-Film zugeordnet – Link: TV-App
    // Filter Schauspieler / Reihenfolge Kinohits: sagen, warum der Film hier steht (nur dann – die Karte bleibt sonst gleich hoch)
    if (FILTER_CHIPS.has(chip) && S.f.schauspieler && (t.cast || []).some(c => fold(c) === fold(S.f.schauspieler))) klein.push(esc(`mit ${S.f.schauspieler}`));
    if (FILTER_CHIPS.has(chip) && S.f.sort === 'kino' && t.einspiel) klein.push(esc(`Kinokasse ${t.einspiel.toLocaleString('de-DE')} Mio. $`));
    // Infozeile bleibt so kurz wie vorher (Karte nicht höher): Bewertung statt Chartplatz; unter „Neu“ wie gehabt der Chartplatz
    const platz = t.chart ? `Platz ${t.chart} der Charts` : '';
    const infoTeile = (chip === 'neu' ? [t.genre, platz]
      : [t.genre, t.neu ? 'neu' : '', t.rt != null ? `Rotten Tomatoes ${t.rt} %` : platz]).filter(Boolean);
    // eine Zeile auf jedem Handy (Prüfer-Befund MV8 2): wird es eng, kürzt sich das Genre („Kinder und Fa… · Rotten Tomatoes 89 %“)
    const info = infoTeile.length > 1 && t.genre && infoTeile[0] === t.genre
      ? `<span class="fi-ig">${esc(t.genre)}</span><span class="fi-ir">&nbsp;· ${esc(infoTeile.slice(1).join(' · '))}</span>`
      : esc(infoTeile.join(' · '));
    const gross = staffel ? 84 : 56;
    const bild = t.bild
      ? `<img class="fi-bild" src="${esc(t.bild)}" alt="" width="${gross}" height="84" loading="lazy" decoding="async">`
      : `<span class="fi-bild fi-ohnebild" aria-hidden="true">${esc(initialen(t.titel))}</span>`;
    const klasse = `fi-karte${(t.angebot && !tipp) || t.unterZiel || t.knueller ? ' fi-deal' : ''}${staffel ? ' fi-quadrat' : ''}`;
    const innen = `${bild}<span class="fi-text"><span class="fi-titel">${esc(name)}${t.jahr && !jahrDoppelt ? ` <span class="fi-jahr">(${t.jahr})</span>` : ''}</span>`
      + `${info ? `<span class="fi-info${info.startsWith('<span') ? ' fi-eng' : ''}">${info}</span>` : ''}`
      + `<span class="fi-preiszeile">${preis}${marken.join('')}</span>`
      + `${klein.length ? `<span class="fi-klein">${klein.join(' · ')}</span>` : ''}</span>`;
    return t.link
      ? `<li><a class="${klasse}" href="${esc(t.link)}" target="_blank" rel="noopener" data-fi-id="${esc(t.id)}">${innen}</a></li>`
      : `<li><div class="${klasse}" data-fi-id="${esc(t.id)}">${innen}</div></li>`;
  }
  function serienHtml(alle0) {
    // deine Serien (Liste „serien“) wie bisher nach Serie gruppiert; alle anderen Staffeln im Angebot darunter in Radar-Reihenfolge
    // (Preisknüller zuerst). Alte Daten ohne „wunsch“-Feld: alles gilt als deine Serien.
    const arr = alle0.filter(t => t.wunsch), andere = zuerst(alle0.filter(t => !t.wunsch), t => t.knueller);
    const neuN = andere.filter(t => t.neuEntdeckt).length; // erst gesehen, noch ohne Preisvergleich (nicht „im Angebot“)
    const unten = andere.length
      ? `<h3 class="fi-gruppe fi-andere">${neuN ? 'Weitere Serien' : 'Weitere Serien im Angebot'} <small>${neuN ? `${andere.length - neuN} im Angebot · ${neuN} neu entdeckt` : `${andere.length} ${andere.length === 1 ? 'Staffel' : 'Staffeln'}`}</small></h3>`
        + `<ul class="fi-karten">${andere.map(t => karte(t, t.typ === 'staffel', 'andere')).join('')}</ul>`
      : '';
    const gruppen = new Map();
    for (const t of arr) {
      const name = t.typ === 'staffel' ? serieVon(t) : 'Filme';
      const k = name.toLowerCase();
      if (!gruppen.has(k)) gruppen.set(k, { name, titel: [] });
      gruppen.get(k).titel.push(t);
    }
    const alle = zuerst([...gruppen.values()], g => g.titel.some(t => t.angebot));
    return alle.map(g => {
      const titel = g.titel.map((t, i) => [t, i]).sort((a, b) => (!!b[0].knueller - !!a[0].knueller) || (b[0].angebot - a[0].angebot) || ((staffelNr(a[0]) ?? 1e6) - (staffelNr(b[0]) ?? 1e6)) || a[1] - b[1]).map(x => x[0]);
      const deals = titel.filter(t => t.angebot).length;
      const anzahl = `${titel.length} ${g.name === 'Filme' ? (titel.length === 1 ? 'Film' : 'Filme') : titel.length === 1 ? 'Staffel' : 'Staffeln'}`;
      return `<h3 class="fi-gruppe">${esc(g.name)} <small>${deals ? `${deals} im Angebot · ` : ''}${anzahl}</small></h3>`
        + `<ul class="fi-karten">${titel.map(t => karte(t, t.typ === 'staffel')).join('')}</ul>`;
    }).join('') + unten;
  }
  function boxenHtml(arr) {
    const tipps = S.n.gruppen.boxenTipps || [];
    const oben = arr.length ? `<ul class="fi-karten">${arr.map(t => karte(t, t.typ === 'staffel', 'boxen')).join('')}</ul>` : `<p class="fi-leer">${esc(LEER.boxen)}</p>`;
    const unten = tipps.length
      ? `<details class="fi-tipps"><summary>${tipps.length} ${tipps.length === 1 ? 'Box' : 'Boxen'} ohne deutlichen Vergleichspreis</summary>`
        + `<p class="fi-fuss">Tipps ohne „statt“-Preis oder mit weniger als ${BOX_DEUTLICH} % Rabatt – ob das günstig ist, lässt sich nicht sagen.</p>`
        + `<ul class="fi-karten">${tipps.map(t => karte(t, t.typ === 'staffel', 'boxtipp')).join('')}</ul></details>`
      : '';
    const hinweis = S.n.boxenOhneUeblich ? '<p class="fi-fuss">Apple-Boxen: den üblichen Preis kennt der Radar erst nach einer Woche Beobachtung – bis dahin zählen nur Vergleichspreise von mydealz und eine frisch gesehene Senkung bei Apple.</p>' : '';
    return oben + unten + hinweis;
  }
  function listeHtml(k) {
    const roh = S.n.gruppen[k] || [];
    if (k === 'boxen') return boxenHtml(roh);
    const arr = gefiltert(k);
    // 80er/Disney: deine Liste bleibt vollständig – Filme über 3,99 € eingeklappt darunter (gleiche Filter)
    const teuer = FILTER_CHIPS.has(k) ? sortiere(filtere(S.n.gruppen[k + 'Teurer'] || [], S.f), S.f.sort) : [];
    const teuerHtml = teuer.length
      ? `<details class="fi-tipps"><summary>${teuer.length} ${teuer.length === 1 ? 'Film' : 'Filme'} aus deiner Liste über 3,99 €</summary>`
        + `<ul class="fi-karten">${teuer.map(t => karte(t, false, k)).join('')}</ul></details>`
      : '';
    if (!arr.length) {
      if (roh.length) return `<p class="fi-leer">Kein Film passt zu deinen Filtern. <button type="button" class="fi-link" data-fi-f="reset">Filter zurücksetzen</button></p>${teuerHtml}`;
      const st = Object.values(S.n.status).some(q => q && q.ok === false) ? ' Eine Quelle ist gerade gestört.' : '';
      return `<p class="fi-leer">${esc(LEER[k] + st)}</p>${teuerHtml}`;
    }
    return k === 'serien' ? serienHtml(arr) : `<ul class="fi-karten">${arr.map(t => karte(t, false, k)).join('')}</ul>${teuerHtml}`;
  }
  // Filter-Leiste: Chips wie die Bereiche (waagrecht wischbar, ≥ 44 px); Genre, Jahrzehnt und Reihenfolge sind native Auswahllisten
  // (iPhone-Rad), unsichtbar über dem Chip – gleiche Optik, volle Tippfläche
  const PFEIL_SVG = '<svg class="fi-pf" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const X_SVG = '<svg class="fi-pf" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const SUCHE_SVG = '<svg class="fi-pf" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7.8 7.8L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  function wahlHtml(key, titel, wert, optionen) {
    const gewaehlt = optionen.find(([v]) => v === wert);
    const an = !!wert;
    return `<label class="fi-chip fi-wahl${an ? ' fi-an' : ''}"><span>${esc(gewaehlt && wert ? gewaehlt[1] : titel)}</span>${PFEIL_SVG}`
      + `<select data-fi-f="${key}" aria-label="${esc(titel)}">${optionen.map(([v, n, z]) => `<option value="${esc(v)}"${v === wert ? ' selected' : ''}>${esc(n)}${z != null ? ` (${z})` : ''}</option>`).join('')}</select></label>`;
  }
  function vorschlaegeHtml(arr) {
    const l = schauspielerListe(arr, S.f, S.sucheText).slice(0, 8);
    if (!l.length) return `<p class="fi-fuss">${S.sucheText ? 'Kein Schauspieler mit diesem Namen in dieser Liste.' : 'Zu diesen Filmen kennt der Radar noch keine Besetzung – kommt mit den nächsten Läufen.'}</p>`;
    return l.map(([c, n]) => `<button type="button" class="fi-chip fi-vor" data-fi-actor="${esc(c)}">${esc(c)}<span class="fi-n">${n}</span></button>`).join('');
  }
  function filterHtml(k) {
    if (!FILTER_CHIPS.has(k)) return '';
    const f = S.f, basis = [...(S.n.gruppen[k] || []), ...(S.n.gruppen[k + 'Teurer'] || [])];
    if (!basis.length) return '';
    const nBek = filtere(S.n.gruppen[k] || [], f, 'bekannt').filter(istBekannt).length;
    const g0 = filtere(S.n.gruppen[k] || [], f, 'genre'), j0 = filtere(S.n.gruppen[k] || [], f, 'jahrzehnt');
    const genres = [['', 'Alle Genres', null], ...GENRES.map(([g, name]) => [g, name, g0.filter(t => genreVon(t) === g).length]).filter(x => x[2] || x[0] === f.genre)];
    const jahre = [['', 'Alle Jahre', null], ...JAHRZEHNTE.map(([j, name]) => [j, name, j0.filter(t => jahrzehntVon(t) === j).length]).filter(x => x[2] || x[0] === f.jahrzehnt)];
    const n = gefiltert(k).length, alle = (S.n.gruppen[k] || []).length;
    return `<div class="fi-filter" role="group" aria-label="Filter">`
      + `<button type="button" class="fi-chip${f.bekannt ? ' fi-an' : ''}" data-fi-f="bekannt" aria-pressed="${f.bekannt}">Nur bekannte<span class="fi-n">${nBek}</span></button>`
      + wahlHtml('genre', 'Genre', f.genre, genres)
      + wahlHtml('jahrzehnt', 'Jahrzehnt', f.jahrzehnt, jahre)
      + (f.schauspieler
        ? `<button type="button" class="fi-chip fi-an" data-fi-f="schauspieler-weg" aria-label="Schauspieler-Filter ${esc(f.schauspieler)} aufheben">${esc(f.schauspieler)}${X_SVG}</button>`
        : `<button type="button" class="fi-chip${S.suche ? ' fi-offen' : ''}" data-fi-f="schauspieler" aria-expanded="${!!S.suche}">${SUCHE_SVG}Schauspieler</button>`)
      + wahlHtml('sort', 'Reihenfolge', f.sort, SORTEN.map(([v, name]) => [v, name, null]))
      + `</div>`
      + (S.suche && !f.schauspieler
        ? `<div class="fi-suche"><input type="search" class="fi-eingabe" data-fi-f="suche" placeholder="Name, z. B. Tom Hanks" value="${esc(S.sucheText)}" autocomplete="off" autocapitalize="words" enterkeyhint="search" aria-label="Schauspieler suchen">`
          + `<div class="fi-vorschlaege" id="fi-vorschlaege">${vorschlaegeHtml(basis)}</div></div>`
        : '')
      + (filterAktiv(f) ? `<p class="fi-treffer">${n} von ${alle} ${alle === 1 ? 'Film' : 'Filmen'} · <button type="button" class="fi-link" data-fi-f="reset">Filter zurücksetzen</button></p>` : '');
  }

  // --- Zeichnen -----------------------------------------------------------------------------------------------------------
  const S = { el: null, url: URL_STANDARD, d: null, n: null, roh: '', laedt: false, gestoert: false, nichtDa: false, chip: null, f: filterLesen(), suche: false, sucheText: '' };

  function standHtml() {
    const st = standText(S.n.aktualisiert);
    const t = Date.parse(S.n.aktualisiert || '');
    const alt = !Number.isFinite(t) || Date.now() - t > ALT_STUNDEN * 36e5;
    // älter als 6 h (GitHub startet den Radar oft erst nach Stunden): ruhiger Hinweis, rot erst ab ALT_STUNDEN
    const spaet = !alt && Number.isFinite(t) && Date.now() - t > HINWEIS_STUNDEN * 36e5;
    const zusatz = !S.gestoert ? (spaet ? ' · wird automatisch aufgefrischt' : '') : navigator.onLine === false ? ' · offline' : ' · Quelle gerade gestört – du siehst den letzten Stand';
    return `<p class="fi-stand${alt || S.gestoert ? ' fi-alt' : ''}">Stand: ${esc((st || 'unbekannt') + zusatz)}</p>`;
  }
  function fussHtml() {
    const alle = Object.values(S.n.gruppen).flat();
    const seit = alle.map(t => t.seit).filter(Boolean).sort()[0];
    const md = alle.some(t => t.link && /mydealz/i.test(t.quelle));
    const quellen = Object.entries(S.n.status).filter(([, q]) => q && typeof q === 'object').map(([k, q]) => {
      const f = Array.isArray(q.fehler) ? q.fehler.filter(Boolean) : [];
      const text = q.ok === false ? `gestört${f.length ? ' – ' + f.slice(0, 2).join('; ') : ''}` : `${zahl(q.anzahl) ?? 0} gefunden`;
      return `<li${q.ok === false ? ' class="fi-stoerung"' : ''}>${esc(QUELLE[k] || k)}: ${esc(text)}</li>`;
    });
    // Angebots-Räume der TV-App, mit denen die Listen abgeglichen wurden (Link öffnet den Raum in der TV-App)
    const raeume = Array.isArray(S.n.status['apple-tv-raeume']?.raeume) ? S.n.status['apple-tv-raeume'].raeume.filter(r => r && sicher(r.url)) : [];
    const raumHtml = raeume.length ? `<p class="fi-fuss">Abgeglichen mit den Apple-TV-Angeboten: ${raeume.slice(0, 4).map(r => `<a href="${esc(sicher(r.url))}" target="_blank" rel="noopener" class="fi-raum">${esc(String(r.name || 'Angebote').slice(0, 40))}${zahl(r.filme) ? ` (${zahl(r.filme)} Filme)` : ''}</a>`).join(', ')}</p>` : '';
    // ehrlich: „Tiefst“ = was der Radar selbst gesehen hat; Allzeit-Tiefst nur mit genannter Quelle (Link)
    const ext = [...new Map(alle.filter(t => t.extern).map(t => [t.extern.quelle, t.extern.url])).entries()].slice(0, 3);
    const extHtml = ext.length ? ` Allzeit-Tiefst laut ${ext.map(([q, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener" class="fi-raum">${esc(q)}</a>`).join(', ')}.` : '';
    const kn = alle.some(t => t.knueller) ? ' Knüller = mindestens 30 % unter dem üblichen Preis, gerade so günstig wie nie oder Box/Staffel frisch um mindestens 20 % gesenkt.' : '';
    return raumHtml + `<p class="fi-fuss">Tiefst = niedrigster Preis, den der Radar selbst gesehen hat${seit ? ` (seit ${esc(tagMonat(seit))} ${esc(seit.slice(0, 4))})` : ''} – frühere Preise kennt er nicht.${extHtml}${kn} Tippen öffnet die TV-App${md ? ', Tipps von mydealz öffnen mydealz.de' : ''}.</p>`
      + (quellen.length ? `<details class="fi-quellen"><summary>Quellen</summary><ul>${quellen.join('')}</ul></details>` : '');
  }
  function chipHtml([k, name]) {
    const an = k === S.chip;
    return `<button type="button" class="fi-chip" role="tab" id="fi-c-${k}" data-fi-chip="${k}" aria-controls="fi-liste" aria-selected="${an}" tabindex="${an ? 0 : -1}">`
      + `${esc(name)}<span class="fi-n">${gefiltert(k).length}</span></button>`;
  }
  function zeichne() {
    const el = S.el;
    if (!S.n) {
      el.innerHTML = `<p class="fi-leer fi-erst">${S.laedt ? 'Lade Filme …'
        : S.nichtDa ? 'Die Filmliste wird gerade zum ersten Mal erstellt – schau später noch einmal rein.'
        : navigator.onLine === false ? 'Keine Verbindung – die Filme erscheinen, sobald du wieder Netz hast.'
        : 'Film-Daten gerade nicht erreichbar. Später noch einmal auf ↻ tippen.'}</p>`;
      return;
    }
    if (!S.chip || !sichtbar(S.n).some(([k]) => k === S.chip)) S.chip = startChip(S.n);
    const alt = el.querySelector('.fi-chips');
    const links = alt ? alt.scrollLeft : null;
    const altF = el.querySelector('.fi-filter');
    const filterLinks = altF ? altF.scrollLeft : null;
    const unter = CHIPS.find(([k]) => k === S.chip)[2];
    el.innerHTML = `<div class="fi">${standHtml()}`
      + `<div class="fi-chips" role="tablist" aria-label="Film-Bereiche">${sichtbar(S.n).map(chipHtml).join('')}</div>`
      + `<p class="fi-unter">${esc(unter)}</p>`
      + `<div id="fi-filterbox">${filterHtml(S.chip)}</div>`
      + `<div class="fi-liste" id="fi-liste" role="tabpanel" aria-labelledby="fi-c-${S.chip}">${listeHtml(S.chip)}</div>`
      + `${fussHtml()}</div>`;
    const leiste = el.querySelector('.fi-chips');
    if (links != null) leiste.scrollLeft = links; else zeigeChip(leiste, S.chip);
    const fl = el.querySelector('.fi-filter');
    if (fl && filterLinks != null) fl.scrollLeft = filterLinks;
  }
  // Filter geändert: merken, Chips (Zahlen), Filter-Leiste und Liste neu – die Seite springt nicht
  function filterNeu(fokusSuche) {
    merk(FILTER_SPEICHER, S.f);
    zeichne();
    if (fokusSuche) { const i = S.el.querySelector('.fi-eingabe'); if (i) { i.focus(); const n = i.value.length; try { i.setSelectionRange(n, n); } catch {} } }
  }
  function zeigeChip(leiste, k) { // gewählten Chip ins Bild holen (nur waagrecht, die Seite springt nicht)
    const c = leiste.querySelector(`[data-fi-chip="${k}"]`);
    if (!c) return;
    const l = c.offsetLeft, r = l + c.offsetWidth; // .fi-chips ist position: relative
    if (l < leiste.scrollLeft + 16) leiste.scrollLeft = Math.max(0, l - 16);
    else if (r > leiste.scrollLeft + leiste.clientWidth - 16) leiste.scrollLeft = r - leiste.clientWidth + 16;
  }
  function waehle(k, fokus) { // ein Rendern pro Wechsel: Chips nur umschalten, Liste einmal neu
    if (!S.n || !sichtbar(S.n).some(([x]) => x === k)) return;
    S.chip = k;
    merk(CHIP_SPEICHER, k);
    const el = S.el;
    for (const c of el.querySelectorAll('[data-fi-chip]')) {
      const an = c.dataset.fiChip === k;
      c.setAttribute('aria-selected', String(an));
      c.tabIndex = an ? 0 : -1;
    }
    el.querySelector('.fi-unter').textContent = CHIPS.find(([x]) => x === k)[2];
    S.suche = false;
    el.querySelector('#fi-filterbox').innerHTML = filterHtml(k);
    const l = el.querySelector('#fi-liste');
    l.setAttribute('aria-labelledby', `fi-c-${k}`);
    l.innerHTML = listeHtml(k);
    const leiste = el.querySelector('.fi-chips');
    zeigeChip(leiste, k);
    if (fokus) leiste.querySelector(`[data-fi-chip="${k}"]`).focus();
  }

  // --- Laden (wie die anderen Daten: gemerkter Stand sofort, dann frisch) -------------------------------------------------
  async function hol(url) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(`${url}?t=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store', signal: ctl.signal });
      if (!r.ok) { const e = new Error(`HTTP ${r.status}`); e.status = r.status; throw e; }
      return await r.text();
    } finally { clearTimeout(t); }
  }
  function lade() {
    if (!S.el || S.laedt) return;
    S.laedt = true;
    if (!S.n) zeichne();
    hol(S.url).then(text => {
      const d = JSON.parse(text);
      S.gestoert = false; S.nichtDa = false;
      merk(SPEICHER, { d, holZeit: Date.now() });
      const roh = JSON.stringify(d);
      if (roh === S.roh && S.n) return 'gleich';
      S.d = d; S.roh = roh; S.n = normalisiere(d);
      return 'neu';
    }).catch(e => {
      S.gestoert = true;
      S.nichtDa = e && e.status === 404;
      return S.n ? 'stand' : 'neu';
    }).then(was => {
      S.laedt = false;
      if (was === 'neu') zeichne();
      else { const p = S.el.querySelector('.fi-stand'); if (p) p.outerHTML = standHtml(); }
    });
  }

  function start(el, opt) {
    if (!el) return;
    if (S.el === el) { lade(); return; }
    S.el = el;
    if (opt && opt.url) S.url = opt.url;
    if (!document.getElementById('fi-stil')) {
      const st = document.createElement('style');
      st.id = 'fi-stil';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const alt = lies(SPEICHER, null);
    if (alt && alt.d && typeof alt.d === 'object' && !altFormat(alt.d)) { S.d = alt.d; S.roh = JSON.stringify(alt.d); S.n = normalisiere(alt.d); }
    el.addEventListener('click', ev => {
      const c = ev.target.closest('[data-fi-chip]');
      if (c && c.dataset.fiChip !== S.chip) { waehle(c.dataset.fiChip); return; }
      const v = ev.target.closest('[data-fi-actor]');
      if (v) { S.f.schauspieler = v.dataset.fiActor; S.suche = false; S.sucheText = ''; filterNeu(); return; }
      const b = ev.target.closest('button[data-fi-f]');
      if (!b) return;
      const was = b.dataset.fiF;
      if (was === 'bekannt') S.f.bekannt = !S.f.bekannt;
      else if (was === 'schauspieler') S.suche = !S.suche;
      else if (was === 'schauspieler-weg') S.f.schauspieler = '';
      else if (was === 'reset') { S.f = { ...S.f, bekannt: false, genre: '', jahrzehnt: '', schauspieler: '' }; S.suche = false; S.sucheText = ''; }
      else return;
      filterNeu(was === 'schauspieler' && S.suche);
    });
    el.addEventListener('change', ev => {
      const sel = ev.target.closest && ev.target.closest('select[data-fi-f]');
      if (!sel || !['genre', 'jahrzehnt', 'sort'].includes(sel.dataset.fiF)) return;
      S.f[sel.dataset.fiF] = sel.value;
      filterNeu();
    });
    // Tippen in der Schauspieler-Suche: nur die Vorschläge neu (Fokus und Tastatur bleiben)
    el.addEventListener('input', ev => {
      if (!ev.target.matches || !ev.target.matches('.fi-eingabe')) return;
      S.sucheText = ev.target.value.slice(0, 60);
      const box = el.querySelector('#fi-vorschlaege');
      if (box) box.innerHTML = vorschlaegeHtml([...(S.n.gruppen[S.chip] || []), ...(S.n.gruppen[S.chip + 'Teurer'] || [])]);
    });
    el.addEventListener('keydown', ev => {
      if (!ev.target.closest || !ev.target.closest('[data-fi-chip]')) return;
      const da = sichtbar(S.n), i = da.findIndex(([k]) => k === S.chip);
      const ziel = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: da.length - 1 }[ev.key];
      if (ziel == null) return;
      ev.preventDefault();
      waehle(da[(ziel + da.length) % da.length][0], true);
    });
    // kaputtes Bild -> gleich großer Platzhalter (kein Sprung, kein Fragezeichen-Symbol)
    el.addEventListener('error', ev => {
      const i = ev.target;
      if (!i || i.tagName !== 'IMG' || !i.classList.contains('fi-bild')) return;
      const t = i.closest('[data-fi-id]');
      const ph = document.createElement('span');
      ph.className = 'fi-bild fi-ohnebild';
      ph.setAttribute('aria-hidden', 'true');
      ph.textContent = initialen(t ? t.querySelector('.fi-titel').firstChild.textContent : '');
      i.replaceWith(ph);
    }, true);
    if (S.n) zeichne();
    lade();
  }

  const CSS = `
.fi { padding-top: 2px; }
.fi-stand { margin: 10px 4px 0; font-size: 13px; color: var(--leise); }
.fi-stand.fi-alt { color: var(--rot); }
.fi-chips {
  position: relative; display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none;
  -webkit-overflow-scrolling: touch; margin: 8px -16px 0; padding: 2px 16px 4px;
}
.fi-chips::-webkit-scrollbar { display: none; }
.fi-chip {
  flex: none; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 15px; font-weight: 600; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.fi-chip[aria-selected="true"] { background: var(--akzent); border-color: var(--akzent); color: var(--akzent-text); }
.fi-n {
  font-size: 12px; font-weight: 700; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
  background: var(--akzent-hell); color: var(--akzent); display: inline-flex; align-items: center; justify-content: center;
  font-variant-numeric: tabular-nums;
}
.fi-chip[aria-selected="true"] .fi-n { background: var(--akzent-text); color: var(--akzent); }
.fi-unter { margin: 8px 4px 10px; font-size: 14px; color: var(--leise); }
.fi-karten { list-style: none; margin: 0 0 4px; padding: 0; }
.fi-karten > li { margin-bottom: 8px; }
.fi-karte {
  display: flex; gap: 12px; align-items: flex-start; text-decoration: none; color: inherit; background: var(--karte);
  border: 1px solid var(--linie); border-radius: 14px; padding: 10px 12px; min-height: 106px;
}
.fi-karte.fi-deal { border: 2px solid var(--akzent); padding: 9px 11px; }
a.fi-karte:active { background: var(--flaeche); }
.fi-bild {
  flex: none; display: block; width: 56px; height: 84px; border-radius: 8px; object-fit: cover; background: var(--flaeche);
}
.fi-quadrat .fi-bild { width: 84px; }
.fi-ohnebild { display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: var(--leise); letter-spacing: .02em; }
.fi-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; overflow-wrap: anywhere; }
.fi-titel { font-size: 17px; line-height: 1.3; font-weight: 650; }
.fi-jahr { font-weight: 400; color: var(--leise); white-space: nowrap; }
.fi-info { font-size: 14px; color: var(--leise); }
.fi-info.fi-eng { display: flex; min-width: 0; white-space: nowrap; }
.fi-ig { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.fi-ir { flex: none; max-width: 100%; overflow: hidden; text-overflow: ellipsis; } /* Bewertung bleibt ganz, nur das Genre kürzt sich */
.fi-preiszeile { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin-top: 4px; }
.fi-preis { font-size: 24px; font-weight: 750; letter-spacing: -0.02em; line-height: 1.1; white-space: nowrap; }
.fi-preis.fi-ohnepreis { font-size: 15px; font-weight: 600; color: var(--leise); letter-spacing: 0; white-space: normal; }
.fi-marke {
  font-size: 12px; font-weight: 650; border-radius: 6px; padding: 2px 7px; background: var(--akzent-hell); color: var(--akzent);
  white-space: nowrap;
}
.fi-marke.fi-stark { background: var(--akzent); color: var(--akzent-text); }
.fi-marke.fi-warm { background: var(--warm-hell); color: var(--warm); }
.fi-marke.fi-grau { background: var(--flaeche); color: var(--leise); }
.fi-marke.fi-knueller { background: var(--warm); color: var(--karte); display: inline-flex; align-items: center; gap: 4px; }
.fi-ks { flex: none; display: block; }
.fi-andere { margin-top: 22px; border-top: 1px solid var(--linie); padding-top: 14px; }
.fi-klein { font-size: 13px; line-height: 1.4; color: var(--leise); }
.fi-klein s { white-space: nowrap; }
.fi-gruppe {
  font-size: 17px; font-weight: 650; margin: 16px 4px 8px; display: flex; justify-content: space-between; gap: 8px;
  align-items: baseline; flex-wrap: wrap;
}
.fi-gruppe small { font-size: 13px; font-weight: 400; color: var(--leise); }
.fi-leer { color: var(--leise); font-size: 15px; padding: 14px 16px; border: 1px dashed var(--linie); border-radius: 16px; margin: 0 0 12px; }
.fi-erst { margin-top: 16px; }
.fi-fuss { margin: 14px 4px 4px; font-size: 13px; color: var(--leise); }
.fi-raum { display: inline-flex; align-items: center; min-height: 44px; color: var(--akzent); font-weight: 650; }
.fi-tipps { margin: 12px 0 4px; }
.fi-tipps > summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; color: var(--leise); font-size: 15px; font-weight: 650; padding: 0 4px; }
.fi-tipps .fi-fuss { margin-top: 0; }
.fi-quellen { margin: 0 4px 8px; }
.fi-quellen > summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; color: var(--leise); font-size: 14px; }
.fi-quellen ul { margin: 0 0 8px; padding-left: 18px; font-size: 14px; color: var(--leise); }
.fi-quellen .fi-stoerung { color: var(--warm); }
.fi-filter {
  position: relative; display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none;
  -webkit-overflow-scrolling: touch; margin: -2px -16px 8px; padding: 2px 16px 4px;
}
.fi-filter::-webkit-scrollbar { display: none; }
.fi-filter .fi-chip { font-size: 14px; font-weight: 600; padding: 0 12px; }
.fi-chip.fi-an { background: var(--akzent-hell); border-color: var(--akzent); color: var(--akzent); }
.fi-chip.fi-offen { border-color: var(--akzent); }
.fi-chip.fi-an .fi-n { background: var(--karte); }
.fi-wahl { position: relative; }
.fi-wahl select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; font-size: 16px; cursor: pointer; -webkit-appearance: none; appearance: none; border: 0; }
.fi-pf { flex: none; display: block; }
.fi-suche { margin: 0 0 10px; }
.fi-eingabe {
  width: 100%; min-height: 44px; box-sizing: border-box; padding: 0 14px; border-radius: 12px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 16px;
}
.fi-vorschlaege { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.fi-vorschlaege .fi-chip { font-size: 14px; font-weight: 600; padding: 0 12px; }
.fi-vorschlaege .fi-fuss { margin: 4px; }
.fi-treffer { margin: 0 4px 10px; font-size: 14px; color: var(--leise); display: flex; flex-wrap: wrap; align-items: center; gap: 0 6px; }
.fi-link { min-height: 44px; padding: 0 4px; border: 0; background: none; color: var(--akzent); font: inherit; font-weight: 650; cursor: pointer; }
`;

  window.MeinVorteilFilme = {
    start, lade,
    get gestartet() { return !!S.el; },
    // für Tests (ohne Browser): reine Funktionen
    _intern: { normalisiere, altFormat, ohneDoppelTipp, titelNorm, serieVon, staffelNr, bildUrl, startChip, standText, karte, zeigeTiefst, tiefstTeile, sichtbar, CHIPS, CSS: () => CSS,
      filtere, sortiere, istBekannt, genreVon, jahrzehntVon, schauspielerListe, filterLesen, FILTER_SPEICHER },
  };
})();
