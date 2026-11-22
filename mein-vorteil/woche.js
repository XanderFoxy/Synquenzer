/* Mein Vorteil – Reiter „Woche“: die krassesten Prospekt-Angebote der Woche je Markt (Xander 16.11.2026: „je Markt die
   krassesten Angebote der Woche – Aldi, Netto, Marktkauf, Kaufland, Penny, Lidl, Rewe – gestaffelt ab 30 / 40 / 50 %, übersichtlich
   als Kacheln mit Produktbild wie in Prospekt-Apps“).
   Ehrlich: Rabatt nur mit Vergleichspreis aus dem Prospekt. Goldener Rahmen nur bei echtem Streichpreis; gegen die UVP des
   Herstellers (oft die großen Prozente) dünner Rahmen und graue Plakette. ab-Preis = „bis −n %“. App-/Kartenpreise gekennzeichnet.
   Eine Datei für alles (Logik + CSS mit Präfix .wo-). Nutzt nur die CSS-Variablen der Seite.
   Einbau (mein-vorteil/index.html, Reiter „Woche“):
     MeinVorteilWoche.start(element)   beim ersten Öffnen (zeichnet den letzten Stand sofort, holt dann frisch)
     MeinVorteilWoche.lade()           bei „Neu laden“ / Rückkehr zur Seite
   Daten: knaller.json vom Vorteils-Radar (Zweig vorteile-daten), erst beim ersten Öffnen geholt. Der letzte Stand liegt im
   Cache Storage („mv-woche“, nicht im localStorage – den teilt sich die Seite mit dem Synquenzer) und erscheint sofort, auch
   ohne Netz. Gemerkt im localStorage nur die Wahl: Stufe (mein-vorteil-woche-stufe) und Markt (mein-vorteil-woche-markt).
   Bilder: Prospekt-Ausschnitt (kaufDA) direkt verlinkt wie die Filmbilder – lazy, feste Maße, ohne Referrer; kaputt -> Platzhalter.
   Prüfer 16.11.2026: Bildfeld fest quadratisch (Bild absolut darin – ein Hochformat-Foto sprengt die Kachel nicht mehr);
   Rabatt abgerundet; Ende 00:00 zählt zum Vortag („bis Sa“, nicht „bis So“).
   Xander 16.11.2026 (2. Runde): Staffel 20/30/40/50 (Start bleibt 30). Was heute gilt, steht normal; was erst ab Do/Fr/Sa oder
   als Wochenend-Angebot kommt, steht als eigene Gruppe „Kommt diese Woche“ mit gestricheltem Rahmen und „ab Fr …“ – in der
   Sprung-Leiste mit Zähler. Ohne Vergleichspreis im Prospekt, aber mit Vergleichspreis desselben Artikels aus einem früheren
   Prospekt: „geschätzt“ (hellgraue Plakette „≈ −n %“). Merken: Haken an der Kachel (oder lange drücken) – gemerkt im
   localStorage (mein-vorteil-woche-gemerkt) und als Liste an den Radar (ntfy-Thema MERK_THEMA, öffentlich wie das Push-Thema,
   niemand abonniert es); der Radar erinnert per Push am ersten Gültigkeitstag ab 7 Uhr.
   Xander 16.11.2026 (Märkte vor Ort): „Es sollen Märkte sein, die wirklich in Döbeln sind … sonst ausblenden … Besser noch:
   anhand von GPS … je nachdem, von wo ich die App öffne – nur die Märkte zeigen, die für diese Gegend in Frage kommen.“
   Ohne Standort gilt Döbeln: ein Markt zählt, wenn seine nächste Filiale bis NAH_KM liegt (Radar: maerkte.<id>.nah/filiale aus
   kaufDA oder OpenStreetMap). Die übrigen (z. B. REWE: keine Filiale in Döbeln) stehen erst nach Tipp auf „weitere Märkte“ da.
   „Standort verwenden“ fragt – nur nach diesem Tipp – den Browser nach der Position; sie bleibt auf dem Gerät (localStorage
   mein-vorteil-woche-standort, auf etwa 1 km gerundet) und wird nirgends hingeschickt (kein IP-Dienst). Dann lädt die Seite die
   Filial-Liste filialen.json (Radar, OpenStreetMap; Kopie im Ordner als Ersatz) und zeigt nur Märkte mit Filiale bis
   UMKREIS_KM um die Position. Beim nächsten Öffnen wird neu geortet, wenn der Browser die Freigabe schon hat (ohne Frage).
   Die Prospekte bleiben die für Döbeln – liegt die Position weiter als WEIT_KM weg, steht das dabei. „Döbeln“ = vergessen.
   Merkliste (Musiker 22.11.2026: „Produkte auswählen und in eine Merkliste legen … am Start-Tag morgens eine Benachrichtigung
   ‚Heute ab: …, bis …, Markt, Preis' – nicht vorher, nicht jeden Tag … auf der Seite je Tag: Heute, Ab morgen, Ab Montag/Freitag“):
   oben in der Liste immer sichtbar. Zwei Wege: Haken an einer Kachel (dieses Angebot) und „Produkt merken“ (Produkt + Sorte,
   z. B. „Haribo XXL“ / „Goldbären“ – gilt für jedes künftige Angebot, auch ohne Rabatt). Produkte im localStorage
   (mein-vorteil-woche-produkte, höchstens WORTE_MAX) und mit der Merkliste an das ntfy-Thema (worte im ersten Teil). Der Radar
   sucht sie in allen Angeboten der Döbelner Prospekte (knaller.json merkTreffer) und schickt am Start-Tag zwischen 7 und 12 Uhr
   einen Push (ntfy, wie alle Pushes – keine Web-Push-Anmeldung nötig). Die Seite zeigt Haken + Treffer nach Tagen: Heute ·
   Ab morgen · Ab <Wochentag> <Datum>; sie sucht die Produkte auch selbst in den Knallern (falls der Radar ein neues Produkt
   noch nicht kennt). Für die Start-Kachel ein kleiner Auszug im localStorage (mein-vorteil-woche-merk-kachel). */
(function () {
  'use strict';
  const URL_STANDARD = 'https://raw.githubusercontent.com/XanderFoxy/Synquenzer/vorteile-daten/vorteile/data/knaller.json';
  const CACHE = 'mv-woche';
  const STUFE_SPEICHER = 'mein-vorteil-woche-stufe';
  const MARKT_SPEICHER = 'mein-vorteil-woche-markt';
  const STUFEN = [20, 30, 40, 50];
  const MERK_SPEICHER = 'mein-vorteil-woche-gemerkt';
  // gleich wie vorteile/config.json module.knaller.merkThema (Push-Thema + „-merken“); öffentlich, kein Geheimnis
  const MERK_URL = 'https://ntfy.sh/xander-schnaeppchen-b5cbf4442aaa9734f3-merken';
  const MERK_NEU_STUNDEN = 6; // ntfy.sh hält Nachrichten 12 h – die Liste regelmäßig neu schicken
  const LANG_MS = 550; // lange drücken = merken
  const PRODUKT_SPEICHER = 'mein-vorteil-woche-produkte'; // gemerkte Produkte { v: 1, liste: [{ w, sorte, seit }] }
  const KACHEL_SPEICHER = 'mein-vorteil-woche-merk-kachel'; // Auszug für die Start-Kachel / „Heute wichtig“
  const WORTE_MAX = 12; // wie MERK_WORTE_MAX im Radar (vorteile/scan/lib/merken.mjs)
  const ALT_STUNDEN = 36, HINWEIS_STUNDEN = 12;
  // Reihenfolge und Namen, falls die Datei keine Märkte nennt (gleich wie vorteile/config.json module.knaller.maerkte)
  // Märkte vor Ort (Xander 16.11.2026): Döbeln (kaufDA-Stadtmitte), Filial-Liste vom Radar, Kopie im Ordner als Ersatz
  const DOEBELN = { name: 'Döbeln', lat: 51.1211, lon: 13.1229 };
  // Umkreis mit Standort wie für Döbeln 10 km: mit 15 km käme REWE (Leisnig, 15 km Luftlinie laut OSM) in Döbeln wieder dazu
  const NAH_KM = 10, UMKREIS_KM = 10, WEIT_KM = 25;
  const FIL_URL = 'https://raw.githubusercontent.com/XanderFoxy/Synquenzer/vorteile-daten/vorteile/data/filialen.json';
  const FIL_LOKAL = 'filialen.json';
  // Radar erneuert die Filial-Liste wöchentlich (Prüfer 16.11.: mit 3 Tagen lud jedes Öffnen an Tag 4–7 neu)
  const FIL_FRISCH_TAGE = 7;
  const ORT_SPEICHER = 'mein-vorteil-woche-standort';
  const WEITERE_SPEICHER = 'mein-vorteil-woche-weitere';
  const MAERKTE = [['aldi-nord', 'Aldi Nord'], ['lidl', 'Lidl'], ['kaufland', 'Kaufland'], ['netto', 'Netto'], ['penny', 'Penny'], ['rewe', 'REWE'], ['marktkauf', 'Marktkauf']];

  // --- kleine Helfer ---------------------------------------------------------------------------------------------------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const zahl = v => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (typeof v === 'string' && /^\s*\d+(?:[.,]\d+)?\s*$/.test(v)) return Number(v.replace(',', '.'));
    return null;
  };
  const sicher = u => (typeof u === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(u.trim()) ? u.trim() : null);
  const euro = v => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lies = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const merk = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const zeitVon = v => { const t = Date.parse(typeof v === 'string' ? v : ''); return Number.isFinite(t) ? t : null; };
  let FMT = null;
  function teile(t) {
    FMT = FMT || new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const o = {};
    for (const p of FMT.formatToParts(new Date(t))) o[p.type] = p.value;
    return o;
  }
  const tagKey = t => { const p = teile(t); return `${p.year}-${p.month}-${p.day}`; };
  const wtTag = t => { const p = teile(t); return `${p.weekday.replace('.', '')} ${p.day}.${p.month}.`; }; // „Sa 21.11.“
  function standText(iso) { // „heute 14:05“, „gestern 09:10“, „Do 05.11., 14:05“
    const t = zeitVon(iso);
    if (t == null) return null;
    const p = teile(t), k = tagKey(t);
    const tag = k === tagKey(Date.now()) ? 'heute' : k === tagKey(Date.now() - 864e5) ? 'gestern' : `${wtTag(t)},`;
    return `${tag} ${p.hour}:${p.minute}`;
  }
  // Ende ist „bis Sa 23:59“ (kaufDA: 22:59 UTC) -> „bis Sa 21.11.“; heute -> „nur noch heute“. Penny & Co. schreiben 00:00 des
  // Folgetags (23:00 UTC) – das ist noch Samstag: eine Millisekunde zurück, sonst stünde „bis So“ da.
  function bisText(t) {
    if (t == null) return '';
    const e = t - 1;
    return tagKey(e) === tagKey(Date.now()) ? 'nur noch heute' : `bis ${wtTag(e)}`;
  }

  // --- Daten tolerant lesen ------------------------------------------------------------------------------------------
  const liste = x => (Array.isArray(x) ? x : x && typeof x === 'object' ? [x] : []);
  // ohneRabatt: Treffer eines gemerkten Produkts (merkTreffer) – auch ohne Vergleichspreis, dann ohne Prozent und „statt“
  function angebotNorm(a, jetzt, ohneRabatt = false) {
    if (!a || typeof a !== 'object') return null;
    const titel = typeof a.titel === 'string' ? a.titel.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
    const preis = zahl(a.preis);
    let vorher = zahl(a.vorher);
    const markt = typeof a.markt === 'string' && /^[a-z0-9-]{1,30}$/.test(a.markt) ? a.markt : null;
    if (!titel || !markt || !(preis > 0)) return null;
    // ohne Vergleichspreis kein Rabatt – und ohne Rabatt kein Knaller (die Seite rechnet selbst nach, statt pct zu glauben)
    let pct = vorher > preis ? Math.floor((1 - preis / vorher) * 100 + 1e-9) : null; // abgerundet wie der Radar: nie mehr versprechen
    if (!(pct > 0 && pct < 95)) { if (!ohneRabatt) return null; pct = null; vorher = null; }
    const bis = zeitVon(a.gueltigBis), ab = zeitVon(a.gueltigAb);
    if (bis != null && bis < jetzt) return null; // abgelaufen
    return {
      id: String(a.id ?? `${markt}|${titel}|${preis}`).slice(0, 80), markt, titel, preis, vorher, pct,
      start: ab, wort: typeof a.wort === 'string' ? a.wort.trim().slice(0, 40) : '', sorte: a.sorte === 'ja' || a.sorte === 'pruefen' ? a.sorte : '', fern: a.fern === true,
      info: typeof a.info === 'string' ? a.info.trim().slice(0, 120) : '',
      // streich = Streichpreis (Goldrahmen), uvp = Herstellerpreis; fehlt die Angabe -> 'unbekannt' (grau, ohne „UVP“)
      art: pct == null ? 'ohne' : a.vorherArt === 'streich' ? 'streich' : a.vorherArt === 'uvp' ? 'uvp' : a.vorherArt === 'geschaetzt' ? 'geschaetzt' : 'unbekannt',
      vorherQuelle: typeof a.vorherQuelle === 'string' ? a.vorherQuelle.trim().slice(0, 60) : '',
      wochenende: a.wochenende === true, merkwort: typeof a.merkwort === 'string' ? a.merkwort.slice(0, 30) : '',
      abPreis: a.abPreis === true, app: a.app === true,
      bedingung: typeof a.bedingung === 'string' ? a.bedingung.trim().slice(0, 60) : '',
      bild: sicher(a.bild), link: sicher(a.link), bis, ab: ab != null && ab > jetzt ? ab : null,
      region: typeof a.region === 'string' ? a.region.trim().slice(0, 40) : '',
    };
  }
  function filialeNorm(f) {
    if (!f || typeof f !== 'object') return null;
    const km = zahl(f.km);
    const adresse = typeof f.adresse === 'string' ? f.adresse.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
    return km != null && km >= 0 ? { km, adresse, quelle: typeof f.quelle === 'string' ? f.quelle.slice(0, 30) : '' } : null;
  }
  function kmZwischen(a, b) {
    const r = Math.PI / 180;
    const h = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lon - a.lon) * r / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  const kmText = v => (v < 20 ? String(Math.round(v * 10) / 10) : String(Math.round(v))).replace('.', ',');
  const gueltigePos = p => p && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180;
  const rund2 = v => Math.round(v * 100) / 100; // ~1 km: genug für „bis 10 km“, mehr bleibt nicht gespeichert
  // Filial-Liste (Radar-Modul filialen): { maerkte: { <id>: [[lat, lon, adresse], …] } } – tolerant, sonst null
  function filialenNorm(d) {
    if (!d || typeof d !== 'object' || !d.maerkte || typeof d.maerkte !== 'object') return null;
    const maerkte = {};
    let n = 0;
    for (const [id, l] of Object.entries(d.maerkte)) {
      if (!/^[a-z0-9-]{1,30}$/.test(id) || !Array.isArray(l)) continue;
      maerkte[id] = l.filter(f => Array.isArray(f) && Number.isFinite(f[0]) && Number.isFinite(f[1])).map(f => [f[0], f[1], typeof f[2] === 'string' ? f[2].slice(0, 60) : '']);
      n += maerkte[id].length;
    }
    if (!n) return null;
    const bbox = Array.isArray(d.bbox) && d.bbox.length === 4 && d.bbox.every(Number.isFinite) ? d.bbox.slice() : null;
    return { maerkte, bbox, stand: typeof d.osmStand === 'string' ? d.osmStand : typeof d.aktualisiert === 'string' ? d.aktualisiert : null };
  }
  // Liegt der Standort im Gebiet der Filial-Liste? (Prüfer 16.11.: Berlin/Hamburg ergaben „keine Filiale in der Nähe“ für
  // alle Märkte – die Liste deckt nur Sachsen und Nachbarländer ab.) Außerhalb des Rahmens bbox [Süd, West, Nord, Ost] oder
  // ohne irgendeine Filiale bis WEIT_KM gilt Döbeln.
  function imGebiet(pos, fil) {
    if (!pos || !fil) return false;
    const b = fil.bbox;
    if (b && (pos.lat < b[0] || pos.lat > b[2] || pos.lon < b[1] || pos.lon > b[3])) return false;
    for (const l of Object.values(fil.maerkte)) for (const f of l) if (kmZwischen(pos, { lat: f[0], lon: f[1] }) <= WEIT_KM) return true;
    return false;
  }
  // Lage eines Markts: { nah, km, adresse } – mit Standort aus der Filial-Liste (bis UMKREIS_KM), sonst Döbeln laut Radar.
  // Ohne jeden Beleg wird nichts ausgeblendet; „weder Filiale noch Prospekt für Döbeln“ (ältere Dateien, z. B. REWE nur mit
  // Chemnitzer Prospekt) zählt als nicht in der Nähe.
  function lageVon(m, n, pos, fil) {
    if (pos && fil && imGebiet(pos, fil)) {
      const l = fil.maerkte[m.id];
      if (!Array.isArray(l)) return { nah: true, km: null, adresse: '', unbekannt: true };
      let best = null;
      for (const f of l) { const d = kmZwischen(pos, { lat: f[0], lon: f[1] }); if (!best || d < best.km) best = { km: d, adresse: f[2] }; }
      return best ? { nah: best.km <= UMKREIS_KM, km: best.km, adresse: best.adresse } : { nah: false, km: null, adresse: '' };
    }
    const f = m.filiale;
    if (typeof m.nah === 'boolean') return { nah: m.nah, km: f ? f.km : null, adresse: f ? f.adresse : '' };
    if (f) return { nah: f.km <= NAH_KM, km: f.km, adresse: f.adresse };
    if (m.keinMarkt) return { nah: false, km: null, adresse: '' };
    if (m.ort && n.ort && m.ort !== n.ort) return { nah: false, km: null, adresse: '' };
    return { nah: true, km: null, adresse: '', unbekannt: true };
  }

  function normalisiere(d, jetzt = Date.now()) {
    const m = d && typeof d.maerkte === 'object' && d.maerkte && !Array.isArray(d.maerkte) ? d.maerkte : {};
    const namen = new Map(MAERKTE);
    for (const [id, x] of Object.entries(m)) if (/^[a-z0-9-]{1,30}$/.test(id)) namen.set(id, typeof x?.name === 'string' && x.name.trim() ? x.name.trim().slice(0, 24) : namen.get(id) || id);
    const gesehen = new Set();
    const angebote = liste(d?.angebote).map(a => angebotNorm(a, jetzt)).filter(a => a && !gesehen.has(a.id) && gesehen.add(a.id))
      .sort((a, b) => b.pct - a.pct || a.preis - b.preis);
    // Treffer der gemerkten Produkte (Radar ab 22.11.2026), auch ohne Rabatt; die nächsten zuerst
    const gesehenT = new Set();
    const treffer = liste(d?.merkTreffer).map(a => angebotNorm(a, jetzt, true)).filter(a => a && !gesehenT.has(a.id) && gesehenT.add(a.id));
    for (const a of [...angebote, ...treffer]) if (!namen.has(a.markt)) namen.set(a.markt, a.markt);
    // ort = Prospekt-Ort dieses Markts (Radar ab 16.11.2026: Döbeln, Chemnitz, Leipzig oder „bundesweit (Berlin)“)
    const maerkte = [...namen.entries()].map(([id, name]) => ({ id, name, link: sicher(m[id]?.link), alt: m[id]?.alt === true,
      ort: typeof m[id]?.ort === 'string' ? m[id].ort.trim().slice(0, 40) : '', keinMarkt: m[id]?.keinMarkt === true,
      gesamt: Number.isInteger(m[id]?.gesamt) ? m[id].gesamt : null, gelesen: Number.isInteger(m[id]?.gelesen) ? m[id].gelesen : null,
      // nächste Filiale von Döbeln (Radar: kaufDA oder OpenStreetMap) und nah = bis 10 km (fehlt bei älteren Dateien)
      filiale: filialeNorm(m[id]?.filiale), nah: typeof m[id]?.nah === 'boolean' ? m[id].nah : null }));
    const status = d && typeof d.status === 'object' && d.status ? d.status : {};
    return {
      aktualisiert: typeof d?.aktualisiert === 'string' ? d.aktualisiert : null,
      standort: typeof d?.standort === 'string' ? d.standort.slice(0, 30) : '', ort: typeof d?.ort === 'string' ? d.ort.slice(0, 30) : 'Döbeln',
      angebote, treffer, maerkte, status,
    };
  }

  // Ende dieser Woche: Montag 00:00:00.000 Berliner Zeit (was dann oder später beginnt, ist „ab nächster Woche“).
  // Prüfer 16.11.2026: früher Stunde und Minute abgezogen, Sekunden/Millisekunden blieben stehen -> Ende Mo 00:00:SS und der
  // ganze Prospekt ab Montag stand unter „Kommt diese Woche“. Jetzt über das Kalenderdatum: Montag als UTC-Mitternacht, dann
  // der Versatz, den die Berliner Uhr zu dieser Zeit zeigt (1 oder 2 h) – wie berlinMitternacht im Radar.
  function wochenEnde(jetzt) {
    const p = teile(jetzt);
    const wt = { Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6, So: 7 }[String(p.weekday).replace('.', '')] || 7;
    const roh = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day) + 8 - wt); // nächster Montag, 00:00 UTC
    return roh - Number(teile(roh).hour) * 36e5; // 00:00 Berliner Zeit
  }

  // --- Produkte merken: dieselbe Regel wie der Radar (vorteile/scan/lib/merken.mjs merkWort/wortPasst, Test regeln) ------
  const normT = s => String(s ?? '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/é|è/g, 'e').replace(/&/g, ' und ').replace(/[^a-z0-9,.%€+]+/g, ' ').replace(/\s+/g, ' ').trim();
  const wortText = (v, max) => (typeof v === 'string' ? v.normalize('NFC').replace(/[^\p{L}\p{N} &'’.+\/,-]+/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max).trim() : '');
  function wortNorm(x) {
    if (!x || typeof x !== 'object') return null;
    const w = wortText(x.w, 40).replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    if (w.length < 2 || !/\p{L}/u.test(w) || !normT(w)) return null;
    const sorte = wortText(x.sorte, 60);
    const t = zeitVon(x.seit);
    return { w, sorte: normT(sorte) ? sorte : '', seit: t != null ? new Date(t).toISOString() : null };
  }
  const wortSchluessel = x => `${normT(x.w)}|${normT(x.sorte || '')}`;
  // an Wortgrenzen (Prüfer 22.11.2026: „Eis“ traf „Rundreise“, „Gusseiserner“, „teilweise“; „Cola“ „Chocolate“; „Tee“ „Beste
  // Ernte“): ganzes Wort mit Endung, Wort-Ende (Stiel|eis), Wort-Anfang mit Form-Teil (Eis|riegel) oder ab 5 Buchstaben
  const woerter = s => normT(s).split(/[^a-z0-9]+/).filter(Boolean);
  const teileSpeicher = new Map();
  const teileVon = s => {
    const k = String(s ?? '');
    if (!teileSpeicher.has(k)) { const t = woerter(k), lang = t.filter(x => x.length > 1); if (teileSpeicher.size >= 500) teileSpeicher.clear(); teileSpeicher.set(k, lang.length ? lang : t); }
    return teileSpeicher.get(k);
  };
  const endungen = n => (n <= 2 ? ['er', 'ern'] : n <= 4 ? ['s', 'e', 'es'] : ['s', 'e', 'es', 'n', 'en', 'er', 'ern']);
  const FORM = new Set(['creme', 'riegel', 'sorte', 'sorten', 'becher', 'torte', 'konfekt', 'dessert', 'mix', 'mischung', 'packung', 'pack', 'box', 'kasten', 'kiste', 'dose', 'dosen', 'flasche', 'flaschen', 'beutel', 'sandwich', 'waffel', 'waffeln']);
  const FALSCH = ['preis', 'reis', 'reise', 'kreis', 'weis', 'gleis', 'greis', 'schwein', 'frottee', 'komitee', 'zentrum', 'spektrum', 'darum', 'warum', 'herum', 'origin'];
  const falsch = (stamm, wort, x) => FALSCH.some(f => f.length > x.length && f.includes(x) && (stamm.endsWith(f) || wort.endsWith(f)) && !(f === 'reis' && stamm.endsWith('ereis')));
  const textSpeicher = new Map(); // je Text einmal gerechnet (die Merkliste zeichnet oft neu)
  function textWorte(text) {
    const k = String(text ?? '');
    let T = textSpeicher.get(k);
    if (T) return T;
    const w = woerter(k), anf = [];
    let pos = 0;
    for (const x of w) { anf.push(pos); pos += x.length; }
    T = { w, anf, kette: w.join(''), grenze: new Set(anf), ende: new Set(anf.map((a, i) => a + w[i].length)) };
    if (textSpeicher.size >= 2000) textSpeicher.clear();
    textSpeicher.set(k, T);
    return T;
  }
  function passtTeil(T, x) {
    if (!x) return false;
    const { grenze, ende } = T;
    for (let i = T.kette.indexOf(x); i >= 0; i = T.kette.indexOf(x, i + 1)) {
      const j = i + x.length;
      let k = 0;
      while (k + 1 < T.anf.length && T.anf[k + 1] <= i) k++;
      const a = T.anf[k], wort = T.w[k];
      if (j > a + wort.length) { if (grenze.has(i) && ende.has(j)) return true; continue; }
      const vorn = wort.slice(0, i - a), hinten = wort.slice(j - a);
      const endung = !hinten || endungen(x.length).includes(hinten);
      if (!vorn && !hinten) return true;
      if (!vorn && endung) { if (!falsch(x, wort, x)) return true; continue; }
      if (!vorn) { if (x.length >= 5 || FORM.has(hinten)) return true; continue; }
      if (endung) { if (x.length >= 3 && vorn.length >= 3 && !falsch(wort.slice(0, j - a), wort, x)) return true; continue; }
      if (x.length >= 6) return true;
    }
    return false;
  }
  const SORTEN = /\b(sorten|sortiert|sortierung|versch|verschiedene|div|diverse|geschmacksrichtungen)\b/;
  function wortPasst(text, e) {
    const T = textWorte(text);
    const teile = teileVon(e && e.w);
    if (!T.kette || !teile.length || !teile.every(x => passtTeil(T, x))) return null;
    const sorten = String(e.sorte || '').split(/,|\/|\boder\b/i).map(teileVon).filter(l => l.length);
    if (!sorten.length) return { sorte: '' };
    if (sorten.some(l => l.every(x => passtTeil(T, x)))) return { sorte: 'ja' };
    return SORTEN.test(normT(text)) ? { sorte: 'pruefen' } : null;
  }
  const W = { liste: [], fehler: '' };
  function produkteLaden() {
    const d = lies(PRODUKT_SPEICHER, null);
    const gesehen = new Set();
    W.liste = (Array.isArray(d?.liste) ? d.liste : []).map(wortNorm).filter(x => x && !gesehen.has(wortSchluessel(x)) && gesehen.add(wortSchluessel(x))).slice(0, WORTE_MAX);
  }
  const produkteSichern = () => merk(PRODUKT_SPEICHER, { v: 1, liste: W.liste });
  // bestes gemerktes Produkt für ein Angebot (Sorte „ja“ vor „prüfen“) -> { e, sorte } oder null
  function produktFuer(a) {
    let best = null;
    for (const e of W.liste) { const p = wortPasst(`${a.titel} ${a.info || ''}`, e); if (p && (!best || (p.sorte === 'ja' && best.sorte !== 'ja'))) best = { e, sorte: p.sorte }; }
    return best;
  }

  // --- Merken ------------------------------------------------------------------------------------------------------------
  const M = { liste: [], gesendet: null, offen: false, timer: 0 };
  function merkLaden() {
    const d = lies(MERK_SPEICHER, null);
    const jetzt = Date.now();
    M.liste = (Array.isArray(d?.liste) ? d.liste : []).filter(x => x && typeof x.id === 'string' && typeof x.titel === 'string' && typeof x.markt === 'string' && !(zeitVon(x.bis) != null && zeitVon(x.bis) < jetzt)).slice(0, 60);
    M.gesendet = typeof d?.gesendet === 'string' ? d.gesendet : null;
    M.offen = d?.offen === true;
  }
  const merkSichern = () => merk(MERK_SPEICHER, { v: 1, liste: M.liste, gesendet: M.gesendet, offen: M.offen });
  const gemerkt = id => M.liste.some(x => x.id === id);
  // ntfy.sh nimmt im Nachrichtentext höchstens 4096 Byte, Größeres wird ein Anhang, den der Radar nicht liest (Prüfer 16.11.:
  // ab etwa 22 gemerkten Angeboten kam nichts mehr an). Darum in Teilen zu höchstens MERK_BYTES: { v, satz, teil, von, merken }
  // – der Radar nimmt den neuesten vollständigen Satz.
  const MERK_BYTES = 3500;
  const bytes = s => (typeof TextEncoder === 'function' ? new TextEncoder().encode(s).length : unescape(encodeURIComponent(s)).length);
  // worte (gemerkte Produkte, 22.11.2026) stehen nur im ersten Teil; ohne worte (alte Aufrufe) fehlt das Feld
  function merkTeile(merken, satz, worte) {
    const kopf = Array.isArray(worte) ? { worte } : {};
    const teile = [];
    let akt = [];
    for (const m of merken) {
      if (akt.length && bytes(JSON.stringify({ v: 1, satz, teil: 99, von: 99, merken: [...akt, m], ...(teile.length ? {} : kopf) })) > MERK_BYTES) { teile.push(akt); akt = []; }
      akt.push(m);
    }
    teile.push(akt); // leere Liste = eine Nachricht mit [] (alles vergessen)
    return teile.map((l, i) => JSON.stringify({ v: 1, satz, teil: i + 1, von: teile.length, merken: l, ...(i ? {} : kopf) }));
  }
  function merkSenden(sofort) {
    clearTimeout(M.timer);
    M.timer = setTimeout(async () => {
      const merken = M.liste.map(x => ({ id: x.id, titel: String(x.titel).slice(0, 90), markt: x.markt, preis: x.preis, vorher: x.vorher, pct: x.pct, ab: x.ab, bis: x.bis }));
      try {
        // einfache Anfrage (Text ohne eigene Kopfzeilen) – kein Preflight; alle Teile nacheinander, sonst gilt es als offen
        const worte = W.liste.map(x => ({ w: x.w, ...(x.sorte ? { sorte: x.sorte } : {}), ...(x.seit ? { seit: x.seit } : {}) }));
        for (const body of merkTeile(merken, Date.now().toString(36), worte)) {
          const r = await fetch(MERK_URL, { method: 'POST', body });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        }
        M.gesendet = new Date().toISOString(); M.offen = false;
      } catch { M.offen = true; }
      merkSichern();
      const h = S.el && S.el.querySelector('.wo-merkhinweis');
      if (h) h.outerHTML = merkHinweisHtml();
    }, sofort ? 0 : 1200);
  }
  function merkUmschalten(id) {
    if (!S.n) return;
    // die angetippte Kachel bleibt, wo sie ist (oben kommt/geht die Gruppe „Gemerkt“)
    const finde = () => [...(S.el?.querySelectorAll(`.wo-kachel[data-wo-id="${CSS_ESC(id)}"]`) || [])].find(k => !k.closest('.wo-merkliste'));
    const vorher = finde()?.getBoundingClientRect().top;
    const i = M.liste.findIndex(x => x.id === id);
    if (i >= 0) M.liste.splice(i, 1);
    else {
      const a = S.n.angebote.find(x => x.id === id) || S.n.treffer.find(x => x.id === id);
      if (!a) return;
      // ab = Start-Tag (auch wenn er schon war): die Merkliste sortiert nach Tagen, die Start-Kachel sagt „heute ab“
      M.liste.unshift({ id: a.id, titel: a.titel, markt: a.markt, preis: a.preis, vorher: a.vorher, pct: a.pct, art: a.art,
        ab: a.start != null ? new Date(a.start).toISOString() : null, bis: a.bis != null ? new Date(a.bis).toISOString() : null, bild: a.bild || null, gemerkt: new Date().toISOString(),
        mname: marktName(a.markt) });
      M.liste = M.liste.slice(0, 60);
    }
    M.offen = true;
    merkSichern();
    zeichne();
    const nachher = finde()?.getBoundingClientRect().top;
    if (vorher != null && nachher != null && Math.abs(nachher - vorher) > 1) scrollBy(0, nachher - vorher);
    merkSenden(false);
  }
  const CSS_ESC = s => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));
  function produktDazu(form) {
    const e = wortNorm({ w: form.elements.w.value, sorte: form.elements.sorte.value, seit: new Date().toISOString() });
    if (!e) { W.fehler = 'Bitte ein Produkt mit mindestens 2 Buchstaben eintragen.'; zeichne(); return; }
    if (W.liste.some(x => wortSchluessel(x) === wortSchluessel(e))) { W.fehler = `„${e.w}“ ist schon gemerkt.`; zeichne(); return; }
    if (W.liste.length >= WORTE_MAX) { W.fehler = `Höchstens ${WORTE_MAX} Produkte – erst eins vergessen (×).`; zeichne(); return; }
    W.fehler = '';
    W.liste.push(e);
    produkteSichern();
    form.elements.w.value = ''; form.elements.sorte.value = '';
    M.offen = true; merkSichern();
    zeichne();
    merkSenden(false);
  }
  function produktWeg(i) {
    if (!(i >= 0 && i < W.liste.length)) return;
    W.liste.splice(i, 1);
    W.fehler = '';
    produkteSichern();
    M.offen = true; merkSichern();
    zeichne();
    merkSenden(false);
  }
  function merkHinweisHtml() {
    const t = M.offen ? (navigator.onLine === false ? 'Wird an den Radar gemeldet, sobald du wieder Netz hast.' : 'Wird an den Radar gemeldet …')
      : 'Mitteilung am Start-Tag zwischen 7 und 12 Uhr: „Heute ab: …, bis …, Markt, Preis“ – einmal je Angebot, nicht vorher.';
    const push = typeof document !== 'undefined' && document.getElementById('push') ? ' <button type="button" class="wo-textknopf" data-wo-push="1">Push einrichten</button>' : '';
    return `<p class="wo-merkhinweis">${esc(t)}${push}</p>`;
  }

  // --- Zeichnen -----------------------------------------------------------------------------------------------------------
  const S = { el: null, url: URL_STANDARD, n: null, roh: '', laedt: false, gestoert: false, nichtDa: false, stufe: 30, markt: 'alle',
    weitere: false, pos: null, fil: null, gebiet: false, ortSucht: false, ortFehler: '', lagen: new Map() };
  const nachMarkt = (arr, m) => (m === 'alle' ? arr : arr.filter(a => a.markt === m));
  const istNah = id => S.lagen.get(id)?.nah !== false;
  // was gezeigt wird: ohne „weitere Märkte“ nur Angebote der Märkte in der Nähe
  const basis = () => (S.weitere ? S.n.angebote : S.n.angebote.filter(a => istNah(a.markt)));
  const mitStandort = () => !!(S.pos && S.fil && S.gebiet);
  const abStufe = (arr, st) => arr.filter(a => a.pct >= st);
  const marktName = id => S.n?.maerkte.find(x => x.id === id)?.name || id;
  function initialen(s) { return String(s || '').split(/[\s-]+/).filter(w => /^[\p{L}\d]/u.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join(''); }

  const HAKEN = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function kachel(a) {
    const streich = a.art === 'streich';
    const geschaetzt = a.art === 'geschaetzt';
    const ohne = a.pct == null; // Treffer eines gemerkten Produkts ohne Vergleichspreis: kein Prozent, kein „statt“
    const plakette = ohne ? '' : `${a.abPreis ? 'bis ' : ''}${geschaetzt ? '≈ ' : ''}−${a.pct} %`;
    const bild = a.bild
      ? `<img class="wo-bild" src="${esc(a.bild)}" alt="" width="160" height="160" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
      : `<span class="wo-bild wo-ohnebild" aria-hidden="true">${esc(marktName(a.markt))}</span>`;
    const marken = [];
    if (a.app) marken.push('<span class="wo-marke wo-warm">nur mit App/Karte</span>');
    if (a.abPreis) marken.push('<span class="wo-marke">ab-Preis</span>');
    if (a.ab) marken.push(`<span class="wo-marke wo-warm">ab ${esc(wtTag(a.ab))}</span>`);
    if (a.wochenende && a.ab) marken.push('<span class="wo-marke">Wochenende</span>');

    const fuss = [marktName(a.markt), a.bis != null ? bisText(a.bis) : ''].filter(Boolean).join(' · ');
    const innen = `<span class="wo-bildfeld">${bild}${ohne ? '' : `<span class="wo-pct${streich ? '' : geschaetzt ? ' wo-geschaetzt' : ' wo-uvp'}">${esc(plakette)}</span>`}</span>`
      + `<span class="wo-text"><span class="wo-preiszeile"><span class="wo-preis">${a.abPreis ? '<small>ab </small>' : ''}${esc(euro(a.preis))}</span></span>`
      + (ohne ? '<span class="wo-statt">Angebotspreis</span>' : `<span class="wo-statt">statt ${geschaetzt ? '~' : ''}<s>${esc(euro(a.vorher))}</s>${a.art === 'uvp' ? ' UVP' : geschaetzt ? ' geschätzt' : ''}</span>`)
      + `<span class="wo-titel">${esc(a.titel)}</span>`
      + (a.info || a.bedingung ? `<span class="wo-info">${esc([a.bedingung, a.info].filter(Boolean).join(' · '))}</span>` : '')
      + (marken.length ? `<span class="wo-marken">${marken.join('')}</span>` : '')
      + `<span class="wo-fuss">${esc(fuss)}</span></span>`;
    const an = gemerkt(a.id);
    const klasse = `wo-kachel${streich ? ' wo-streich' : ''}${a.ab ? ' wo-kommt' : ''}${an ? ' wo-gemerkt' : ''}`;
    const knopf = `<button type="button" class="wo-merk" data-wo-merk="${esc(a.id)}" aria-pressed="${an}" aria-label="${esc(`${an ? 'Gemerkt' : 'Merken'}: ${a.titel}`)}">${HAKEN}</button>`;
    return a.link
      ? `<li><a class="${klasse}" href="${esc(a.link)}" target="_blank" rel="noopener" data-wo-id="${esc(a.id)}" data-wo-markt="${esc(a.markt)}">${innen}</a>${knopf}</li>`
      : `<li><div class="${klasse}" data-wo-id="${esc(a.id)}" data-wo-markt="${esc(a.markt)}">${innen}</div>${knopf}</li>`;
  }
  // Merkliste: eine kompakte Zeile je Angebot (Bild 64 px, Titel, Preis, Markt · bis, Marken) – wie ein Einkaufszettel je Tag;
  // dieselben Klassen wie die Kachel (Haken, lange drücken, Bild-Ersatz funktionieren gleich)
  function zeile(a) {
    const ohne = a.pct == null, geschaetzt = a.art === 'geschaetzt';
    const bild = a.bild
      ? `<img class="wo-bild" src="${esc(a.bild)}" alt="" width="64" height="64" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
      : `<span class="wo-bild wo-ohnebild" aria-hidden="true">${esc(marktName(a.markt))}</span>`;
    const marken = [];
    if (a.ab == null && a.start != null && tagKey(a.start) === tagKey(Date.now())) marken.push('<span class="wo-marke wo-warm">ab heute</span>');
    if (a.app) marken.push('<span class="wo-marke wo-warm">nur mit App/Karte</span>');
    if (a.wort) marken.push(`<span class="wo-marke">gemerkt: ${esc(a.wort)}</span>`);
    if (a.sorte === 'pruefen') marken.push('<span class="wo-marke wo-warm">Sorte im Markt prüfen</span>');
    const preis = `<span class="wo-preis">${a.abPreis ? '<small>ab </small>' : ''}${esc(euro(a.preis))}</span>`
      + (ohne ? ' <span class="wo-statt">Angebotspreis</span>'
        : ` <span class="wo-statt">statt ${geschaetzt ? '~' : ''}<s>${esc(euro(a.vorher))}</s>${a.art === 'uvp' ? ' UVP' : ''}</span> <span class="wo-pct-text">${a.abPreis ? 'bis ' : ''}${geschaetzt ? '≈ ' : ''}−${a.pct} %</span>`);
    const fuss = [marktName(a.markt), a.bis != null ? bisText(a.bis) : ''].filter(Boolean).join(' · ');
    const innen = `<span class="wo-bildfeld">${bild}</span><span class="wo-text"><span class="wo-titel">${esc(a.titel)}</span>`
      + `<span class="wo-preiszeile">${preis}</span><span class="wo-fuss">${esc(fuss)}</span>`
      + (marken.length ? `<span class="wo-marken">${marken.join('')}</span>` : '') + '</span>';
    const an = gemerkt(a.id);
    const klasse = `wo-kachel wo-zeile${an ? ' wo-gemerkt' : ''}`;
    const knopf = `<button type="button" class="wo-merk" data-wo-merk="${esc(a.id)}" aria-pressed="${an}" aria-label="${esc(`${an ? 'Gemerkt' : 'Merken'}: ${a.titel}`)}">${HAKEN}</button>`;
    return a.link
      ? `<li><a class="${klasse}" href="${esc(a.link)}" target="_blank" rel="noopener" data-wo-id="${esc(a.id)}" data-wo-markt="${esc(a.markt)}">${innen}</a>${knopf}</li>`
      : `<li><div class="${klasse}" data-wo-id="${esc(a.id)}" data-wo-markt="${esc(a.markt)}">${innen}</div>${knopf}</li>`;
  }
  // Gruppen: ab 50 % · 40 bis 49 % · 30 bis 39 % (nur ab der gewählten Stufe), Angebote ab Montag/Donnerstag eigene Gruppe unten
  // Gruppen: was heute gilt (ab 50 % · 40 bis 49 % · 30 bis 39 % · 20 bis 29 %, nur ab der gewählten Stufe), dann „Kommt diese
  // Woche“ (ab Do/Fr/Sa, Wochenende), dann „Ab Montag“ (Prospekt der nächsten Woche)
  function teileAuf(arr) {
    const ende = wochenEnde(Date.now());
    return { jetzt: arr.filter(a => !a.ab), woche: arr.filter(a => a.ab && a.ab < ende), naechste: arr.filter(a => a.ab && a.ab >= ende) };
  }
  function gruppenHtml(arr) {
    const { jetzt, woche, naechste } = teileAuf(arr);
    const stufen = [[50, 101, 'ab 50 %'], [40, 50, '40 bis 49 %'], [30, 40, '30 bis 39 %'], [20, 30, '20 bis 29 %']];
    const teile = [];
    let erste = true;
    for (const [von, bis, name] of stufen) {
      const l = jetzt.filter(a => a.pct >= von && a.pct < bis);
      if (l.length) { teile.push(`<h3 class="wo-gruppe"${erste ? ' id="wo-g-jetzt"' : ''}>${esc(name)} <small>${l.length}</small></h3><ul class="wo-raster">${l.map(kachel).join('')}</ul>`); erste = false; }
    }
    if (woche.length) {
      const sortiert = [...woche].sort((a, b) => a.ab - b.ab || b.pct - a.pct);
      teile.push(`<h3 class="wo-gruppe wo-g-kommt" id="wo-g-kommt">Kommt diese Woche <small>${woche.length}</small></h3><p class="wo-gruppe-text">Gilt noch nicht – erst ab dem genannten Tag (oft Do, Fr/Sa oder Wochenende).</p><ul class="wo-raster">${sortiert.map(kachel).join('')}</ul>`);
    }
    if (naechste.length) {
      const erst = Math.min(...naechste.map(a => a.ab));
      teile.push(`<h3 class="wo-gruppe wo-g-kommt" id="wo-g-naechste">Ab ${esc(wtTag(erst).split(' ')[0] === 'Mo' ? 'Montag' : wtTag(erst))} <small>${naechste.length}</small></h3><ul class="wo-raster">${naechste.map(kachel).join('')}</ul>`);
    }
    return teile.join('');
  }
  // Merkliste (22.11.2026): per Haken gemerkte Angebote (frische Daten, sonst der gemerkte Stand) + Angebote zu den gemerkten
  // Produkten (Radar-Treffer und eigene Suche in den Knallern) – unabhängig von Stufe und Markt; ferne Märkte nur bei Haken oder
  // „weitere Märkte“. Jeder Eintrag mit start (Start-Tag, auch wenn er schon war).
  function gemerktListe() {
    if (!S.n || (!M.liste.length && !W.liste.length)) return [];
    const jetzt = Date.now();
    const out = [], ids = new Set();
    for (const x of M.liste) {
      const a = S.n.angebote.find(b => b.id === x.id) || S.n.treffer.find(b => b.id === x.id)
        || angebotNorm({ ...x, vorherArt: x.art, gueltigAb: x.ab, gueltigBis: x.bis, bild: x.bild }, jetzt, true);
      if (!a || ids.has(a.id)) continue;
      ids.add(a.id);
      const p = produktFuer(a);
      out.push({ ...a, wort: p ? p.e.w : '', sorte: p ? p.sorte : '' });
    }
    if (W.liste.length) {
      for (const a of [...S.n.treffer, ...S.n.angebote]) {
        if (ids.has(a.id) || a.fern || (!S.weitere && !istNah(a.markt))) continue;
        const p = produktFuer(a); // nur Produkte, die hier noch gemerkt sind (vergessen = weg, auch wenn der Radar noch nichts weiß)
        if (!p) continue;
        ids.add(a.id);
        out.push({ ...a, wort: p.e.w, sorte: p.sorte });
      }
    }
    return out;
  }
  const TAG_LANG = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag', Sa: 'Samstag', So: 'Sonntag' };
  // Gruppen je Tag: Heute (gilt jetzt; was heute beginnt zuerst) · Ab morgen · Ab <Wochentag> <Datum>
  function tagGruppen(arr) {
    const jetzt = Date.now(), heute = tagKey(jetzt), morgen = tagKey(jetzt + 864e5);
    const g = new Map();
    for (const a of arr) {
      const spaeter = a.start != null && a.start > jetzt;
      const k = spaeter ? tagKey(a.start) : 'heute';
      if (!g.has(k)) {
        const [wt, dat] = spaeter ? wtTag(a.start).split(' ') : [];
        g.set(k, { k, t: spaeter ? a.start : -Infinity, titel: !spaeter ? 'Heute' : k === morgen ? 'Ab morgen' : `Ab ${TAG_LANG[wt] || wt} ${dat}`, unter: !spaeter ? wtTag(jetzt) : k === morgen ? wtTag(a.start) : '', l: [] });
      }
      g.get(k).l.push(a);
    }
    const neuHeute = a => a.start != null && tagKey(a.start) === heute;
    for (const x of g.values()) x.l.sort((a, b) => (x.k === 'heute' ? (neuHeute(b) ? 1 : 0) - (neuHeute(a) ? 1 : 0) : 0) || (a.bis ?? Infinity) - (b.bis ?? Infinity) || (b.pct ?? -1) - (a.pct ?? -1));
    return [...g.values()].sort((a, b) => a.t - b.t);
  }
  function wortChipsHtml() {
    if (!W.liste.length) return '';
    return `<ul class="wo-worte" aria-label="Gemerkte Produkte">${W.liste.map((x, i) => `<li><span class="wo-wort">${esc(x.w)}${x.sorte ? `<small> · ${esc(x.sorte)}</small>` : ''}</span><button type="button" class="wo-wort-weg" data-wo-wort-weg="${i}" aria-label="${esc(`${x.w}${x.sorte ? ` (${x.sorte})` : ''} vergessen`)}">×</button></li>`).join('')}</ul>`;
  }
  function gemerktHtml() {
    const arr = gemerktListe();
    const gruppen = tagGruppen(arr);
    const form = `<form class="wo-produkt" data-wo-produkt autocomplete="off" novalidate>`
      + `<label class="wo-feld"><span class="wo-vh">Produkt</span><input name="w" type="text" maxlength="40" placeholder="Produkt merken, z. B. Crunchips" enterkeyhint="next" autocomplete="off" spellcheck="false"></label>`
      + `<label class="wo-feld wo-feld-sorte"><span class="wo-vh">Sorte (freiwillig)</span><input name="sorte" type="text" maxlength="60" placeholder="Sorte (freiwillig)" enterkeyhint="done" autocomplete="off" spellcheck="false"></label>`
      + `<button type="submit" class="wo-plus">Merken</button></form>`
      + `<p class="wo-produkt-fehler" role="status"${W.fehler ? '' : ' hidden'}>${esc(W.fehler)}</p>`;
    const tage = gruppen.map(x => `<h4 class="wo-tag" id="wo-tag-${esc(x.k)}">${esc(x.titel)}${x.unter ? ` <span class="wo-tag-dat">${esc(x.unter)}</span>` : ''} <small>${x.l.length}</small></h4><ul class="wo-mliste">${x.l.map(zeile).join('')}</ul>`).join('');
    const leer = !arr.length ? `<p class="wo-merk-leer">${W.liste.length ? 'Gerade kein Angebot zu deinen Produkten – sobald eins im Prospekt steht, erscheint es hier am richtigen Tag.' : 'Haken an einer Kachel oder ein Produkt eintragen (z. B. eine Eissorte, Chips, Fruchtgummi XXL) – hier steht dann je Tag, was ab wann gilt.'}</p>` : '';
    return `<section class="wo-merkliste" id="wo-g-gemerkt" aria-labelledby="wo-ml-h"><h3 class="wo-ml-kopf" id="wo-ml-h">Merkliste <small>${arr.length}</small></h3>${merkHinweisHtml()}${form}${wortChipsHtml()}${tage}${leer}</section>`;
  }
  // Auszug für die Start-Kachel und „Heute wichtig“ (index.html liest ihn ohne knaller.json): die nächsten 6, nur was gilt/kommt
  function kachelAuszug() {
    if (!S.n) return;
    const jetzt = Date.now();
    const l = gemerktListe().filter(a => !(a.bis != null && a.bis <= jetzt)).sort((a, b) => (a.start ?? 0) - (b.start ?? 0)).slice(0, 6)
      .map(a => ({ id: a.id, titel: a.titel.slice(0, 60), markt: marktName(a.markt), preis: a.preis, ...(a.start != null ? { ab: new Date(a.start).toISOString() } : {}), ...(a.bis != null ? { bis: new Date(a.bis).toISOString() } : {}), ...(a.wort ? { wort: a.wort } : {}) }));
    const neu = JSON.stringify(l);
    if (neu === letzterAuszug) return; // nur bei Änderung schreiben und die Startseite neu zeichnen lassen
    letzterAuszug = neu;
    merk(KACHEL_SPEICHER, { v: 1, t: new Date(jetzt).toISOString(), liste: l });
    try { dispatchEvent(new Event('mein-vorteil-woche')); } catch {}
  }
  let letzterAuszug = null;
  // Sprung-Leiste: Gilt jetzt · Kommt diese Woche · Ab Montag · Gemerkt – mit Zählern, tippen = hinscrollen
  function sprungHtml() {
    const { jetzt, woche, naechste } = teileAuf(abStufe(nachMarkt(basis(), S.markt), S.stufe));
    const g = gemerktListe().length;
    if (!woche.length && !naechste.length && !g) return '';
    const b = (ziel, name, n, kl = '') => (n ? `<button type="button" class="wo-sprung${kl}" data-wo-sprung="${ziel}">${esc(name)}<span class="wo-n">${n}</span></button>` : '');
    return `<div class="wo-spruenge" aria-label="Springen zu">${b('wo-g-jetzt', 'Gilt jetzt', jetzt.length)}${b('wo-g-kommt', 'Kommt diese Woche', woche.length, ' wo-sprung-kommt')}${b('wo-g-naechste', 'Ab Montag', naechste.length, ' wo-sprung-kommt')}${b('wo-g-gemerkt', 'Merkliste', g)}</div>`;
  }
  function leerHtml() {
    const imMarkt = nachMarkt(basis(), S.markt);
    const wo = S.markt === 'alle' ? '' : ` bei ${marktName(S.markt)}`;
    const tiefer = STUFEN.filter(s => s < S.stufe).map(s => [s, abStufe(imMarkt, s).length]).filter(([, n]) => n > 0).pop();
    if (tiefer) return `<div class="wo-leer"><p>Gerade nichts ab ${S.stufe} %${esc(wo)} – ab ${tiefer[0]} % gibt es ${tiefer[1]}.</p><button type="button" class="wo-knopf" data-wo-stufe="${tiefer[0]}">Ab ${tiefer[0]} % zeigen</button></div>`;
    const andere = S.markt !== 'alle' && abStufe(basis(), S.stufe).length;
    if (andere) return `<div class="wo-leer"><p>Gerade nichts ab ${S.stufe} %${esc(wo)}.</p><button type="button" class="wo-knopf" data-wo-markt="alle">Alle Märkte zeigen (${andere})</button></div>`;
    const st = Object.values(S.n.status).some(q => q && q.ok === false) ? ' Eine Quelle ist gerade gestört.' : '';
    // ausgeblendete Märkte (keine Filiale in der Nähe) nennen, damit „keine Angebote“ nicht nach leeren Prospekten klingt
    const weg = S.weitere ? [] : S.n.maerkte.filter(m => !istNah(m.id)).map(m => [m.name, abStufe(nachMarkt(S.n.angebote, m.id), S.stufe).length]).filter(([, n]) => n > 0);
    const wegText = weg.length ? ` Ausgeblendet, weil keine Filiale in der Nähe: ${weg.map(([name, n]) => `${name} (${n})`).join(', ')} – „weitere Märkte“ zeigt sie.` : '';
    return `<div class="wo-leer"><p>Gerade keine Angebote ab ${S.stufe} %${esc(wo)} in den Prospekten.${esc(st)}${esc(wegText)}</p></div>`;
  }
  function listeHtml() {
    const arr = abStufe(nachMarkt(basis(), S.markt), S.stufe);
    return gemerktHtml() + (arr.length ? gruppenHtml(arr) : leerHtml());
  }
  function standHtml() {
    const st = standText(S.n.aktualisiert);
    const t = zeitVon(S.n.aktualisiert);
    const alt = t == null || Date.now() - t > ALT_STUNDEN * 36e5;
    const spaet = !alt && Date.now() - t > HINWEIS_STUNDEN * 36e5;
    const zusatz = !S.gestoert ? (spaet ? ' · wird automatisch aufgefrischt' : '') : navigator.onLine === false ? ' · offline' : ' · Quelle gerade gestört – du siehst den letzten Stand';
    return `<p class="wo-stand${alt || S.gestoert ? ' wo-alt' : ''}">Stand: ${esc((st || 'unbekannt') + zusatz)}</p>`;
  }
  function stufenHtml() {
    const imMarkt = nachMarkt(basis(), S.markt);
    return `<div class="wo-stufen" role="radiogroup" aria-label="Rabatt ab">${STUFEN.map(s => {
      const an = s === S.stufe;
      return `<button type="button" class="wo-stufe" role="radio" aria-checked="${an}" tabindex="${an ? 0 : -1}" data-wo-stufe="${s}">ab ${s} %<span class="wo-n">${abStufe(imMarkt, s).length}</span></button>`;
    }).join('')}</div>`;
  }
  function maerkteHtml() {
    const ab = abStufe(basis(), S.stufe);
    const chips = [['alle', 'Alle', ab.length], ...S.n.maerkte.filter(m => S.weitere || istNah(m.id)).map(m => [m.id, m.name, nachMarkt(ab, m.id).length])];
    return `<div class="wo-chips" role="tablist" aria-label="Märkte">${chips.map(([id, name, n]) => {
      const an = id === S.markt;
      return `<button type="button" class="wo-chip${n ? '' : ' wo-null'}${id !== 'alle' && !istNah(id) ? ' wo-fern' : ''}" role="tab" aria-selected="${an}" tabindex="${an ? 0 : -1}" data-wo-markt="${esc(id)}" aria-controls="wo-liste">${esc(name)}<span class="wo-n">${n}</span></button>`;
    }).join('')}</div>`;
  }
  const PIN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.3" fill="currentColor"/></svg>';
  // Leiste „Märkte vor Ort“: wo gezählt wird, Standort verwenden / neu orten / Döbeln, „weitere Märkte“, ausgeblendete Märkte
  function ortHtml() {
    const mit = mitStandort();
    const fern = S.n.maerkte.filter(m => !istNah(m.id));
    const weg = S.pos ? kmZwischen(S.pos, DOEBELN) : 0;
    const wo = mit ? `Märkte mit Filiale bis ${UMKREIS_KM} km um deinen Standort${weg > 2 ? ` (${kmText(weg)} km von Döbeln)` : ''}`
      : `Märkte mit Filiale bis ${NAH_KM} km um Döbeln`;
    const knoepfe = [];
    if (S.ortSucht) knoepfe.push('<button type="button" class="wo-ortknopf wo-haupt" disabled>Standort wird bestimmt …</button>');
    else if (S.pos) knoepfe.push('<button type="button" class="wo-ortknopf" data-wo-ort="neu">Neu orten</button>', '<button type="button" class="wo-ortknopf" data-wo-ort="aus">Döbeln</button>');
    else knoepfe.push(`<button type="button" class="wo-ortknopf wo-haupt" data-wo-ort="an">${PIN}Standort verwenden</button>`);
    if (fern.length) knoepfe.push(`<button type="button" class="wo-ortknopf" data-wo-weitere="1" aria-pressed="${S.weitere}">weitere Märkte<span class="wo-n">${fern.length}</span></button>`);
    const hinweise = [];
    if (fern.length) {
      const t = fern.map(m => { const l = S.lagen.get(m.id); return `${m.name}${l && l.km != null ? ` (nächste ${kmText(l.km)} km${l.adresse && l.km <= 30 ? `, ${l.adresse}` : ''})` : ''}`; }).join(', ');
      hinweise.push(`<p class="wo-ort-hinweis">Keine Filiale in der Nähe: ${esc(t)}${S.weitere ? ' – gestrichelt dabei.' : ' – ausgeblendet.'}</p>`);
    }
    if (S.pos && S.fil && !S.gebiet) hinweise.push('<p class="wo-ort-hinweis wo-warn" role="status">Dein Standort liegt außerhalb der Filial-Liste (Sachsen und Nachbarländer) – es gilt Döbeln.</p>');
    if (S.ortFehler) hinweise.push(`<p class="wo-ort-hinweis wo-warn" role="status">${esc(S.ortFehler)}</p>`);
    if (mit && weg > WEIT_KM) hinweise.push(`<p class="wo-ort-hinweis wo-warn">Die Prospekte gelten für Döbeln – an deinem Standort können Angebote und Preise abweichen.</p>`);
    if (S.pos) hinweise.push(`<p class="wo-ort-hinweis">Der Standort bleibt auf diesem Gerät${S.fil?.stand ? ` · Filialen laut OpenStreetMap, Stand ${esc(standText(S.fil.stand) || '')}` : ''}.</p>`);
    return `<div class="wo-ort"><p class="wo-ort-text">${PIN}<span>${esc(wo)}</span></p><div class="wo-ort-knoepfe">${knoepfe.join('')}</div>${hinweise.join('')}</div>`;
  }
  // Prospekt-Orte nur der gezeigten Märkte, in der Reihenfolge des Radars (standort „Döbeln/Chemnitz/…“). Runde 9 (OFFEN A26):
  // REWE kommt nur mit Chemnitzer Prospekt und ohne Filiale bis 10 km – ausgeblendet, darf der Fuß nicht „Prospekte
  // Döbeln/Chemnitz … ob es das in Döbeln gibt“ sagen. Ohne Ort an den Märkten (ältere Dateien) gilt standort wie bisher.
  function gezeigterStandort() {
    const st = S.n.standort || '';
    const orte = new Set(S.n.maerkte.filter(m => m.ort && !m.keinMarkt && (S.weitere || istNah(m.id))).map(m => (/^bundesweit/.test(m.ort) ? 'bundesweit' : m.ort)));
    if (!orte.size) return st;
    const teile = st.split('/').filter(o => orte.has(o));
    for (const o of orte) if (!teile.includes(o)) teile.push(o);
    return teile.join('/');
  }
  function fussHtml() {
    const standort = gezeigterStandort();
    const ort = standort && standort !== 'bundesweit' ? `Prospekte ${standort}` : 'Prospekte bundesweit';
    // Prospekt für den eigenen Ort (Döbeln) oder nicht – Märkte aus Nachbarstadt/bundesweit sichtbar nennen
    const lokal = !!standort && standort === S.n.ort;
    const fremd = S.n.maerkte.filter(m => m.ort && m.ort !== S.n.ort && !m.keinMarkt && (S.weitere || istNah(m.id)));
    const ohneMarkt = S.n.maerkte.filter(m => m.keinMarkt).map(m => m.name);
    const ortText = lokal ? `Prospekte für ${S.n.ort} von kaufDA – einzelne Filialen können abweichen.` : `${ort} von kaufDA – ob es das in ${S.n.ort} gibt, im Markt oder in der App prüfen.`;
    const k = S.n.status.kaufda && typeof S.n.status.kaufda === 'object' ? S.n.status.kaufda : null;
    const stoer = k && Array.isArray(k.fehler) ? k.fehler.filter(x => typeof x === 'string').slice(0, 3) : [];
    const alt = S.n.maerkte.filter(m => m.alt).map(m => m.name);
    const markt = S.markt !== 'alle' ? S.n.maerkte.find(m => m.id === S.markt) : null;
    const ohneArt = (S.n.angebote.some(a => a.art === 'unbekannt') ? ' Grau ohne „UVP“ = der Prospekt sagt nicht, welcher Preis verglichen wird.' : '')
      + (S.n.angebote.some(a => a.art === 'geschaetzt') ? ' „≈ … geschätzt“ = im Prospekt steht kein Vergleichspreis; verglichen mit demselben Artikel im selben Markt aus einem früheren Prospekt.' : '');
    const gesamt = S.n.maerkte.filter(m => m.gesamt > 0 && (S.weitere || istNah(m.id))); // wie die Prospekt-Orte: nur gezeigte Märkte
    const gesamtText = gesamt.length ? `<p class="wo-fuss-text">Gelesen: ${esc(gesamt.map(m => `${m.name} ${m.gelesen ?? '?'} von ${m.gesamt}`).join(', '))} Angeboten der Prospekte – kaufDA zeigt je Markt nur einen Teil, der Radar sucht den Rest über Stichworte und sammelt die Woche über.</p>` : '';
    return `<p class="wo-fuss-text"><b>Gold umrandet</b> = echter Streichpreis im Prospekt. <b>UVP</b> = gegen die Preisempfehlung des Herstellers gerechnet – die liegt oft über dem üblichen Ladenpreis.${esc(ohneArt)} „bis −n %“ = ab-Preis (die günstigste Sorte). Rabatte abgerundet. ${esc(ortText)}</p>`
      + gesamtText
      + (fremd.length && standort !== 'bundesweit' ? `<p class="wo-fuss-text">Nicht aus dem Prospekt für ${esc(S.n.ort)}: ${esc(fremd.map(m => `${m.name} (${m.ort})`).join(', '))} – im Markt oder in der App prüfen.</p>` : '')
      + (ohneMarkt.length ? `<p class="wo-fuss-text">Kein Markt in der Nähe: ${esc(ohneMarkt.join(', '))}.</p>` : '')
      + (markt?.link ? `<p class="wo-fuss-text"><a class="wo-link" href="${esc(markt.link)}" target="_blank" rel="noopener">Alle Angebote von ${esc(markt.name)} bei kaufDA ›</a></p>` : '')
      + (stoer.length || alt.length ? `<details class="wo-quellen"><summary>Quellen</summary><ul>${stoer.map(f => `<li class="wo-stoerung">${esc(f)}</li>`).join('')}${alt.length ? `<li>Letzter Stand behalten: ${esc(alt.join(', '))}</li>` : ''}</ul></details>` : '');
  }
  function zeichne() {
    const el = S.el;
    if (!S.n) {
      el.innerHTML = `<p class="wo-leer wo-erst">${S.laedt ? 'Lade Wochen-Knaller …'
        : S.nichtDa ? 'Die Wochen-Knaller werden gerade zum ersten Mal gesucht – schau später noch einmal rein.'
        : navigator.onLine === false ? 'Keine Verbindung – die Angebote erscheinen, sobald du wieder Netz hast.'
        : 'Wochen-Knaller gerade nicht erreichbar. Später noch einmal auf ↻ tippen.'}</p>`;
      return;
    }
    S.gebiet = imGebiet(S.pos, S.fil);
    S.lagen = new Map(S.n.maerkte.map(m => [m.id, lageVon(m, S.n, S.pos, S.fil)]));
    if (S.markt !== 'alle' && (!S.n.maerkte.some(m => m.id === S.markt) || (!S.weitere && !istNah(S.markt)))) S.markt = 'alle';
    const alt = el.querySelector('.wo-chips');
    const links = alt ? alt.scrollLeft : null;
    // „Produkt merken“: Getipptes und Fokus überstehen das Neuzeichnen (neue Daten, Haken, Stufe)
    const f0 = el.querySelector('[data-wo-produkt]');
    const eingabe = f0 ? { w: f0.elements.w.value, sorte: f0.elements.sorte.value, fokus: f0.contains(document.activeElement) ? document.activeElement.name : null } : null;
    el.innerHTML = `<div class="wo">${standHtml()}${stufenHtml()}${ortHtml()}${maerkteHtml()}${sprungHtml()}`
      + `<div class="wo-liste" id="wo-liste" role="tabpanel">${listeHtml()}</div>${fussHtml()}</div>`;
    const leiste = el.querySelector('.wo-chips');
    if (links != null) leiste.scrollLeft = links; else zeigeChip(leiste, S.markt);
    const f1 = el.querySelector('[data-wo-produkt]');
    if (f1 && eingabe) { f1.elements.w.value = eingabe.w; f1.elements.sorte.value = eingabe.sorte; if (eingabe.fokus && f1.elements[eingabe.fokus]) f1.elements[eingabe.fokus].focus({ preventScroll: true }); }
    kachelAuszug();
  }
  function zeigeChip(leiste, k) {
    const c = leiste.querySelector(`[data-wo-markt="${k}"]`);
    if (!c) return;
    const l = c.offsetLeft, r = l + c.offsetWidth;
    if (l < leiste.scrollLeft + 16) leiste.scrollLeft = Math.max(0, l - 16);
    else if (r > leiste.scrollLeft + leiste.clientWidth - 16) leiste.scrollLeft = r - leiste.clientWidth + 16;
  }
  function setzeStufe(s) {
    if (!STUFEN.includes(s) || s === S.stufe) return;
    S.stufe = s; merk(STUFE_SPEICHER, s);
    zeichne();
    try { dispatchEvent(new Event('mein-vorteil-woche')); } catch {} // Start-Kachel/Zahl der Seite neu
  }
  function setzeMarkt(m) {
    if (m === S.markt) return;
    S.markt = m; merk(MARKT_SPEICHER, m);
    zeichne();
  }

  // --- Laden: letzter Stand aus dem Cache Storage sofort, dann frisch ----------------------------------------------------
  async function ausCache() {
    try { const c = await caches.open(CACHE); const r = await c.match(S.url); return r ? await r.text() : null; } catch { return null; }
  }
  async function inCache(text) {
    try { const c = await caches.open(CACHE); await c.put(S.url, new Response(text, { headers: { 'content-type': 'application/json' } })); } catch {}
  }
  async function hol(url) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(`${url}?t=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store', signal: ctl.signal });
      if (!r.ok) { const e = new Error(`HTTP ${r.status}`); e.status = r.status; throw e; }
      return await r.text();
    } finally { clearTimeout(t); }
  }
  function nimm(text) {
    let d;
    try { d = JSON.parse(text); } catch { return false; }
    if (!d || typeof d !== 'object') return false;
    S.roh = text; S.n = normalisiere(d);
    return true;
  }
  function lade() {
    if (!S.el || S.laedt) return;
    S.laedt = true;
    if (!S.n) zeichne();
    hol(S.url).then(text => {
      S.gestoert = false; S.nichtDa = false;
      if (text === S.roh && S.n) return 'gleich';
      if (!nimm(text)) throw new Error('kaputt');
      inCache(text);
      return 'neu';
    }).catch(e => {
      S.gestoert = true;
      S.nichtDa = !!(e && e.status === 404);
      return S.n ? 'stand' : 'neu';
    }).then(was => {
      S.laedt = false;
      if (was === 'neu') zeichne();
      else { const p = S.el.querySelector('.wo-stand'); if (p) p.outerHTML = standHtml(); }
    });
  }

  // --- Standort (nur nach Tipp) + Filial-Liste -----------------------------------------------------------------------------
  let filLaedt = null;
  function filialenLaden() {
    if (S.fil) return Promise.resolve(true);
    if (filLaedt) return filLaedt;
    filLaedt = (async () => {
      let d = null;
      try { const c = await caches.open(CACHE); const r = await c.match(FIL_URL); if (r) d = filialenNorm(JSON.parse(await r.text())); } catch {}
      const t = d && zeitVon(d.stand);
      if (!d || t == null || Date.now() - t > FIL_FRISCH_TAGE * 864e5) {
        for (const u of [S.filUrl || FIL_URL, FIL_LOKAL]) {
          try {
            const text = await hol(u);
            const n = filialenNorm(JSON.parse(text));
            // auch die Ersatzkopie cachen (Prüfer 16.11.: sonst bei jedem Öffnen neu geladen); ihr Stand entscheidet über das Auffrischen
            if (n) { d = n; try { const c = await caches.open(CACHE); await c.put(FIL_URL, new Response(text, { headers: { 'content-type': 'application/json' } })); } catch {} break; }
          } catch {}
        }
      }
      S.fil = d;
      filLaedt = null;
      return !!d;
    })();
    return filLaedt;
  }
  function posSetzen(p) {
    S.pos = { lat: rund2(p.lat), lon: rund2(p.lon) };
    merk(ORT_SPEICHER, { v: 1, lat: S.pos.lat, lon: S.pos.lon, t: new Date().toISOString() });
  }
  function posVergessen() {
    S.pos = null; S.ortFehler = '';
    try { localStorage.removeItem(ORT_SPEICHER); } catch {}
  }
  // still = beim Öffnen mit schon erteilter Freigabe: Fehler ändern nichts (der letzte Ort bleibt)
  function orten(still) {
    const geo = typeof navigator !== 'undefined' && navigator.geolocation;
    if (!geo) { if (!still) { S.ortFehler = 'Dieser Browser kann den Standort nicht bestimmen – es gilt Döbeln.'; zeichne(); } return; }
    if (!still) { S.ortSucht = true; S.ortFehler = ''; zeichne(); }
    geo.getCurrentPosition(p => {
      const q = { lat: p.coords.latitude, lon: p.coords.longitude };
      if (!gueltigePos(q)) { S.ortSucht = false; zeichne(); return; }
      posSetzen(q);
      filialenLaden().then(ok => {
        S.ortSucht = false;
        if (!ok) S.ortFehler = 'Filial-Liste gerade nicht erreichbar – es gilt Döbeln.';
        zeichne();
      });
    }, e => {
      S.ortSucht = false;
      if (!still) {
        if (e && e.code === 1) posVergessen(); // vor dem Hinweis: posVergessen leert ihn
        S.ortFehler = e && e.code === 1 ? 'Standort nicht freigegeben – es gilt Döbeln. Freigeben lässt er sich in den Einstellungen des Browsers.'
          : 'Standort gerade nicht bestimmbar – es gilt Döbeln.';
      }
      zeichne();
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60e3 });
  }
  function ortStart() {
    const p = lies(ORT_SPEICHER, null);
    if (!p || !gueltigePos(p)) return;
    S.pos = { lat: rund2(p.lat), lon: rund2(p.lon) };
    filialenLaden().then(ok => { if (!ok) S.ortFehler = 'Filial-Liste gerade nicht erreichbar – es gilt Döbeln.'; if (S.n) zeichne(); });
    // neu orten nur, wenn der Browser die Freigabe schon hat – keine Frage beim Öffnen
    try {
      navigator.permissions?.query({ name: 'geolocation' }).then(st => { if (st && st.state === 'granted' && S.pos) orten(true); }, () => {});
    } catch {}
  }

  function start(el, opt) {
    if (!el) return;
    if (S.el === el) { lade(); return; }
    S.el = el;
    if (opt && opt.url) S.url = opt.url;
    if (opt && opt.filialenUrl) S.filUrl = opt.filialenUrl;
    S.weitere = lies(WEITERE_SPEICHER, false) === true;
    ortStart();
    const st = Number(lies(STUFE_SPEICHER, 30));
    S.stufe = STUFEN.includes(st) ? st : 30;
    const m = lies(MARKT_SPEICHER, 'alle');
    S.markt = typeof m === 'string' && /^[a-z0-9-]{1,30}$/.test(m) ? m : 'alle';
    if (!document.getElementById('wo-stil')) {
      const s = document.createElement('style');
      s.id = 'wo-stil';
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    merkLaden();
    produkteLaden();
    const alt = M.gesendet ? Date.now() - Date.parse(M.gesendet) : Infinity;
    // offen = noch nicht angekommen (auch „alles vergessen“); sonst die Liste alle 6 h neu (ntfy hält 12 h)
    if (M.offen || ((M.liste.length || W.liste.length) && !(alt < MERK_NEU_STUNDEN * 36e5))) merkSenden(true);
    el.addEventListener('submit', ev => {
      const f = ev.target.closest('[data-wo-produkt]');
      if (!f) return;
      ev.preventDefault();
      produktDazu(f);
    });
    addEventListener('online', () => { if (M.offen) merkSenden(true); });
    el.addEventListener('click', ev => {
      const mk = ev.target.closest('[data-wo-merk]');
      if (mk) { ev.preventDefault(); merkUmschalten(mk.dataset.woMerk); return; }
      const ww = ev.target.closest('[data-wo-wort-weg]');
      if (ww) { produktWeg(Number(ww.dataset.woWortWeg)); return; }
      if (ev.target.closest('[data-wo-push]')) { document.getElementById('push')?.click(); return; }
      const sp = ev.target.closest('[data-wo-sprung]');
      if (sp) { document.getElementById(sp.dataset.woSprung)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (S.lang && ev.target.closest('.wo-kachel')) { ev.preventDefault(); S.lang = false; return; } // lange gedrückt = gemerkt, nicht öffnen
      const s = ev.target.closest('[data-wo-stufe]');
      if (s) { setzeStufe(Number(s.dataset.woStufe)); return; }
      const w = ev.target.closest('[data-wo-weitere]');
      if (w) { S.weitere = !S.weitere; merk(WEITERE_SPEICHER, S.weitere); zeichne(); return; }
      const o = ev.target.closest('[data-wo-ort]');
      if (o) {
        if (o.dataset.woOrt === 'aus') { posVergessen(); zeichne(); } else orten(false);
        return;
      }
      const m = ev.target.closest('button[data-wo-markt]');
      if (m) setzeMarkt(m.dataset.woMarkt);
    });
    el.addEventListener('keydown', ev => {
      const t = ev.target.closest && ev.target.closest('.wo-chip, .wo-stufe');
      if (!t || !S.n) return;
      const reihe = [...t.parentElement.children];
      const i = reihe.indexOf(t);
      const ziel = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: reihe.length - 1 }[ev.key];
      if (ziel == null) return;
      ev.preventDefault();
      const b = reihe[(ziel + reihe.length) % reihe.length];
      if (b.dataset.woStufe) setzeStufe(Number(b.dataset.woStufe)); else setzeMarkt(b.dataset.woMarkt);
      S.el.querySelector(b.dataset.woStufe ? `[data-wo-stufe="${b.dataset.woStufe}"].wo-stufe` : `.wo-chip[data-wo-markt="${b.dataset.woMarkt}"]`)?.focus();
    });
    // lange drücken (550 ms, ohne zu wischen) = merken/vergessen – wie der Haken
    let druck = null;
    const los = () => { if (druck) { clearTimeout(druck.t); druck = null; } };
    el.addEventListener('pointerdown', ev => {
      const k = ev.target.closest('.wo-kachel');
      if (!k || ev.button > 0 || ev.target.closest('[data-wo-merk]')) return;
      los();
      druck = { x: ev.clientX, y: ev.clientY, t: setTimeout(() => {
        druck = null; S.lang = true; setTimeout(() => { S.lang = false; }, 800);
        merkUmschalten(k.dataset.woId);
      }, LANG_MS) };
    });
    el.addEventListener('pointermove', ev => { if (druck && Math.hypot(ev.clientX - druck.x, ev.clientY - druck.y) > 10) los(); });
    for (const t of ['pointerup', 'pointercancel', 'pointerleave', 'scroll']) el.addEventListener(t, los, { passive: true });
    el.addEventListener('contextmenu', ev => { if (ev.target.closest('.wo-kachel')) ev.preventDefault(); });
    // kaputtes Bild -> gleich großer Platzhalter mit dem Marktnamen (kein Sprung, kein Fragezeichen-Symbol)
    el.addEventListener('error', ev => {
      const i = ev.target;
      if (!i || i.tagName !== 'IMG' || !i.classList.contains('wo-bild')) return;
      const k = i.closest('[data-wo-markt]');
      const ph = document.createElement('span');
      ph.className = 'wo-bild wo-ohnebild';
      ph.setAttribute('aria-hidden', 'true');
      ph.textContent = k ? marktName(k.dataset.woMarkt) : '';
      i.replaceWith(ph);
    }, true);
    S.laedt = true; // bis der gemerkte Stand gelesen ist: „Lade …“
    zeichne();
    ausCache().then(text => {
      S.laedt = false;
      if (text && !S.n) nimm(text);
      if (S.n) zeichne();
      lade();
    });
  }

  const CSS = `
.wo { padding-top: 2px; }
.wo-stand { margin: 10px 4px 0; font-size: 13px; color: var(--leise); }
.wo-stand.wo-alt { color: var(--rot); }
.wo-stufen { display: flex; gap: 8px; margin: 10px 0 0; }
.wo-stufe {
  flex: 1 1 0; min-height: 44px; min-width: 44px; padding: 0 8px; border-radius: 12px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 15px; font-weight: 700; white-space: nowrap;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
}
.wo-stufe[aria-checked="true"] { background: var(--akzent); border-color: var(--akzent); color: var(--akzent-text); }
.wo-chips {
  position: relative; display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none;
  -webkit-overflow-scrolling: touch; margin: 8px -16px 0; padding: 2px 16px 4px;
}
.wo-chips::-webkit-scrollbar { display: none; }
.wo-chip {
  flex: none; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 15px; font-weight: 600; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.wo-chip.wo-null { color: var(--leise); }
.wo-chip.wo-fern { border-style: dashed; }
.wo-ort { margin: 10px 0 0; padding: 8px 10px 10px; border: 1px solid var(--linie); border-radius: 14px; background: var(--karte); }
.wo-ort-text { margin: 2px 2px 8px; font-size: 14px; display: flex; align-items: center; gap: 6px; }
.wo-ort-text svg { flex: none; color: var(--akzent); }
.wo-ort-knoepfe { display: flex; flex-wrap: wrap; gap: 8px; }
.wo-ortknopf {
  min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--linie); background: transparent;
  color: var(--text); font: inherit; font-size: 14.5px; font-weight: 650; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.wo-ortknopf.wo-haupt { border-color: var(--akzent); color: var(--akzent); }
.wo-ortknopf[aria-pressed="true"] { background: var(--akzent); border-color: var(--akzent); color: var(--akzent-text); }
.wo-ortknopf:disabled { opacity: .7; cursor: default; }
.wo-ort-hinweis { margin: 8px 2px 0; font-size: 13px; color: var(--leise); }
.wo-ort-hinweis.wo-warn { color: var(--warm); }
.wo-chip[aria-selected="true"] { background: var(--akzent); border-color: var(--akzent); color: var(--akzent-text); }
.wo-n {
  font-size: 12px; font-weight: 700; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
  background: var(--akzent-hell); color: var(--akzent); display: inline-flex; align-items: center; justify-content: center;
  font-variant-numeric: tabular-nums;
}
[aria-selected="true"] > .wo-n, [aria-checked="true"] > .wo-n { background: var(--akzent-text); color: var(--akzent); }
.wo-gruppe {
  font-size: 17px; font-weight: 650; margin: 16px 4px 8px; display: flex; justify-content: space-between; gap: 8px; align-items: baseline;
}
.wo-gruppe small { font-size: 13px; font-weight: 400; color: var(--leise); }
.wo-raster {
  list-style: none; margin: 0 0 4px; padding: 0; display: grid; gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(min(150px, calc(50% - 5px)), 1fr));
}
.wo-raster > li { min-width: 0; position: relative; }
.wo-kachel {
  display: flex; flex-direction: column; height: 100%; text-decoration: none; color: inherit; background: var(--karte);
  border: 1px solid var(--linie); border-radius: 14px; overflow: hidden;
}
.wo-kachel.wo-streich { border-color: var(--akzent); box-shadow: 0 0 0 1px var(--akzent); } /* 2 px Goldring, ohne die Maße zu ändern */
.wo-kachel { -webkit-touch-callout: none; }
/* kommt diese Woche: ruhig gestrichelt statt durchgezogen (Gold bleibt beim Streichpreis, aber ohne Ring) */
.wo-kachel.wo-kommt { border-style: dashed; border-color: var(--leise); box-shadow: none; }
.wo-kachel.wo-kommt.wo-streich { border-color: var(--akzent); }
.wo-merk {
  position: absolute; top: 0; right: 0; width: 44px; height: 44px; padding: 0; border: 0; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: #5b5148; -webkit-tap-highlight-color: transparent;
}
.wo-merk::before {
  content: ''; position: absolute; top: 6px; right: 6px; width: 32px; height: 32px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.92); border: 1px solid rgba(91, 81, 72, 0.35);
}
.wo-merk svg { position: relative; top: -3px; right: -3px; opacity: 0.55; }
.wo-merk[aria-pressed="true"] { color: var(--akzent-text); }
.wo-merk[aria-pressed="true"]::before { background: var(--akzent); border-color: var(--akzent); }
.wo-merk[aria-pressed="true"] svg { opacity: 1; }
.wo-merk:focus-visible { outline: 2px solid var(--akzent); outline-offset: -4px; border-radius: 12px; }
.wo-spruenge { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin: 8px -16px 0; padding: 2px 16px 4px; }
.wo-spruenge::-webkit-scrollbar { display: none; }
.wo-sprung {
  flex: none; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--linie);
  background: transparent; color: var(--text); font: inherit; font-size: 14px; font-weight: 600; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.wo-sprung.wo-sprung-kommt { border-style: dashed; border-color: var(--leise); }
.wo-gruppe-text, .wo-merkhinweis { margin: -4px 4px 8px; font-size: 13px; color: var(--leise); }
/* Merkliste (22.11.2026): oben in der Liste, Karte mit Rand in der Bereichsfarbe; Tage als Unterüberschriften */
.wo-merkliste { margin: 14px 0 6px; padding: 2px 12px 10px; border: 1px solid var(--akzent-hell); border-radius: 16px; background: var(--flaeche, transparent); }
.wo-ml-kopf { font-size: 17px; font-weight: 650; margin: 12px 0 8px; display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.wo-ml-kopf small { font-size: 13px; font-weight: 400; color: var(--leise); }
.wo-merkliste .wo-merkhinweis { margin: -4px 0 8px; }
.wo-textknopf { min-height: 44px; margin: -14px 0; vertical-align: middle; padding: 0 2px; border: 0; background: none; color: var(--akzent); font: inherit; font-weight: 650; text-decoration: underline; cursor: pointer; }
.wo-produkt { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 0; }
.wo-feld { flex: 1 1 100%; min-width: 0; display: flex; }
.wo-feld-sorte { flex: 1 1 140px; }
.wo-feld input {
  width: 100%; min-width: 0; min-height: 44px; box-sizing: border-box; padding: 0 12px; border-radius: 12px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 16px; /* 16 px: iPhone zoomt nicht */
}
.wo-feld input::placeholder { color: var(--leise); }
.wo-feld input:focus-visible { outline: 2px solid var(--akzent); outline-offset: 1px; }
.wo-plus {
  flex: 0 0 auto; min-height: 44px; min-width: 64px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--akzent); background: var(--akzent);
  color: var(--akzent-text); font: inherit; font-weight: 700; cursor: pointer;
}
.wo-vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.wo-produkt-fehler { margin: 6px 2px 0; font-size: 13px; color: var(--warm); }
.wo-worte { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 0; padding: 0; }
.wo-worte li { display: inline-flex; align-items: center; min-height: 44px; border-radius: 999px; border: 1px solid var(--linie); background: var(--karte); padding-left: 12px; max-width: 100%; }
.wo-wort { font-size: 14px; font-weight: 650; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.wo-wort small { font-weight: 400; color: var(--leise); }
.wo-wort-weg { flex: none; width: 44px; height: 44px; border: 0; background: none; color: var(--leise); font: inherit; font-size: 20px; line-height: 1; cursor: pointer; border-radius: 999px; }
.wo-tag { font-size: 15px; font-weight: 700; margin: 14px 0 8px; display: flex; gap: 6px; align-items: baseline; }
.wo-tag small { margin-left: auto; font-size: 13px; font-weight: 400; color: var(--leise); }
.wo-tag-dat { font-size: 13px; font-weight: 400; color: var(--leise); }
.wo-merk-leer { margin: 10px 0 2px; font-size: 14px; color: var(--leise); }
.wo-mliste { list-style: none; margin: 0 0 4px; padding: 0; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); }
.wo-mliste > li { position: relative; min-width: 0; }
.wo-kachel.wo-zeile { flex-direction: row; align-items: stretch; min-height: 76px; padding-right: 40px; }
.wo-zeile .wo-bildfeld { width: 76px; flex: none; aspect-ratio: auto; }
.wo-zeile .wo-bild { padding: 5px; }
.wo-zeile .wo-ohnebild { font-size: 13px; padding: 6px; }
.wo-zeile .wo-text { padding: 7px 8px 8px 10px; gap: 1px; justify-content: center; }
.wo-zeile .wo-titel { margin: 0; font-size: 15px; -webkit-line-clamp: 2; }
.wo-zeile .wo-preiszeile { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 6px; }
.wo-zeile .wo-preis { font-size: 18px; }
.wo-zeile .wo-pct-text { font-size: 13px; font-weight: 750; color: var(--akzent); white-space: nowrap; }
.wo-zeile .wo-fuss { margin-top: 0; padding-top: 1px; }
.wo-zeile .wo-marken { margin-top: 3px; }
/* Sprung-Ziele: unter der festen Reiter-Leiste (--nav-h wie die Abschnitte der Startseite) */
.wo-g-kommt, #wo-g-jetzt, #wo-g-gemerkt, .wo-tag { scroll-margin-top: calc(var(--nav-h, 96px) + 8px); }
a.wo-kachel:active { background: var(--flaeche); }
.wo-bildfeld { position: relative; display: block; aspect-ratio: 1 / 1; background: #fbf7f1; overflow: hidden; flex: none; }
/* absolut im festen Quadrat: ein Hochformat-Foto (Flasche) kann das Feld nicht aufdrücken, kein Sprung beim Nachladen */
.wo-bild { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: contain; padding: 8px; box-sizing: border-box; }
.wo-ohnebild { display: flex; align-items: center; justify-content: center; text-align: center; color: #7a6a58; font-size: 17px; font-weight: 750; padding: 12px; overflow-wrap: anywhere; }
.wo-pct {
  position: absolute; left: 6px; top: 6px; font-size: 15px; font-weight: 800; padding: 3px 9px; border-radius: 999px;
  background: var(--akzent); color: var(--akzent-text); white-space: nowrap; font-variant-numeric: tabular-nums;
}
.wo-pct.wo-uvp { background: #5b5148; color: #fff7ec; }
.wo-pct.wo-geschaetzt { background: #e4ddd2; color: #3f362e; }
.wo-text { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px 10px; min-width: 0; overflow-wrap: anywhere; flex: 1; }
.wo-preis { font-size: 22px; font-weight: 750; letter-spacing: -0.02em; line-height: 1.1; white-space: nowrap; }
.wo-preis small { font-size: 13px; font-weight: 600; color: var(--leise); letter-spacing: 0; }
.wo-statt { font-size: 13px; color: var(--leise); }
.wo-statt s { white-space: nowrap; }
.wo-titel { font-size: 15px; line-height: 1.3; font-weight: 650; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 2px; }
.wo-info { font-size: 12.5px; line-height: 1.35; color: var(--leise); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wo-marken { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.wo-marke { font-size: 11.5px; font-weight: 650; border-radius: 6px; padding: 2px 6px; background: var(--akzent-hell); color: var(--akzent); white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.wo-marke.wo-warm { background: var(--warm-hell); color: var(--warm); }
.wo-fuss { margin-top: auto; padding-top: 6px; font-size: 12.5px; color: var(--leise); }
.wo-leer { color: var(--leise); font-size: 15px; padding: 14px 16px; border: 1px dashed var(--linie); border-radius: 16px; margin: 14px 0 12px; }
.wo-leer p { margin: 0; }
.wo-erst { margin-top: 16px; }
.wo-knopf {
  margin-top: 10px; min-height: 44px; padding: 0 16px; border-radius: 12px; border: 1px solid var(--akzent); background: transparent;
  color: var(--akzent); font: inherit; font-weight: 700; cursor: pointer;
}
.wo-fuss-text { margin: 14px 4px 4px; font-size: 13px; color: var(--leise); }
.wo-link { display: inline-flex; align-items: center; min-height: 44px; color: var(--akzent); font-weight: 650; }
.wo-quellen { margin: 0 4px 8px; }
.wo-quellen > summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; color: var(--leise); font-size: 14px; }
.wo-quellen ul { margin: 0 0 8px; padding-left: 18px; font-size: 14px; color: var(--leise); }
.wo-quellen .wo-stoerung { color: var(--warm); }
`;

  window.MeinVorteilWoche = {
    start, lade,
    get gestartet() { return !!S.el; },
    // für Tests (ohne Browser): reine Funktionen
    _intern: { normalisiere, angebotNorm, lageVon, imGebiet, filialenNorm, kmZwischen, NAH_KM, UMKREIS_KM, wochenEnde, merkTeile, MERK_BYTES, wortNorm, wortPasst, tagGruppen, WORTE_MAX, kachel: a => kachel(a), fuss: (n, lagen) => { const vor = S.n, vorL = S.lagen; S.n = n; if (lagen) S.lagen = lagen; try { return fussHtml(); } finally { S.n = vor; S.lagen = vorL; } }, STUFEN, CSS: () => CSS },
  };
})();
