/* Mein Vorteil – Reiter „Essen“ (Xander 15.11.2026: „kostenlos essen, besondere Tage, Gutscheine, Aktionen bei McDonald's
   oder Subway, Abholpizza zum halben Preis, XXL-Restaurants – wo sich sowas befindet – und wann All-you-can-eat ist“).
   Unterreiter: Heute · Fastfood & Ketten · Pizza & Abholen · All-you-can-eat · XXL & Challenges · Gratis-Tage
   (+ „Aktuell“, nur wenn der Radar Essen-Einträge liefert). „Heute“ rechnet in Berliner Zeit, was jetzt gilt und was als
   Nächstes kommt. Eine Datei für Logik + CSS (Präfix .ess-), nutzt nur die CSS-Variablen der Seite.
   Einbau (mein-vorteil/index.html):
     MeinVorteilEssen.start(element, { live, zuSpartricks })   beim ersten Öffnen des Reiters
     MeinVorteilEssen.lade()                                     bei „Neu laden“
   Daten: essen.json (statisch, gleicher Ordner). Nur beim Öffnen geholt – die Startseite holt sie nie (lazy). Letzter Stand
   im Cache Storage („mv-essen“); die Start-Kachel liest nur einen kleinen Auszug (mein-vorteil-essen-kachel, wenige KB).
   Regeln: nur Einträge mit https-Quelle und Prüfdatum; Ende („bis“) vorbei -> weg; Aktionstag ohne Ende nie „aktuell“;
   „nurHinweis“ nur im Kasten „Kommt immer wieder“; Prüfdatum älter als 45 Tage -> „bitte prüfen“, nie auf der Kachel.
   Kein Tracking, keine fremden Skripte; Quellen öffnen mit rel="noopener noreferrer". */
(function () {
  'use strict';
  const DATEI = 'essen.json';
  const KACHEL_SPEICHER = 'mein-vorteil-essen-kachel'; // { d: { stand, e: [{ id, titel, art, kette?, wochentage?, ab?, bis?, gratis?, marke? }] }, holZeit }
  const ABLAGE = 'mv-essen'; // Cache Storage; Name ohne „mein-vorteil-“, sonst räumt sw.js ihn beim Aktivieren weg
  const CHIP_SPEICHER = 'mein-vorteil-essen-chip';
  const VERSION = 1;
  const ALT_TAGE = 45;
  const REGIONEN = ['Döbeln', 'Leipzig', 'Dresden', 'Chemnitz', 'Sachsen', 'bundesweit'];
  const RUBRIKEN = ['ketten', 'pizza', 'ayce', 'xxl', 'lokal'];
  const ARTEN = ['aktionstag', 'wochentag', 'dauerhaft', 'app', 'abholung', 'ayce', 'xxl', 'gratis'];
  const CHIPS = [
    ['heute', 'Heute', 'Was heute gilt, was als Nächstes kommt – nach Wochentag und Uhrzeit.'],
    ['lokale', 'Lokale', 'Restaurants um Döbeln: nach Küche, Entfernung und Bewertung filtern – mit Öffnungszeiten, Karte und Ketten in der Nähe.'],
    ['regel', 'Regelmäßig', 'Was an welchem Wochentag immer wieder läuft – zum Planen der Woche.'],
    ['ketten', 'Fastfood & Ketten', 'McDonald’s, Burger King, Subway, IKEA & Co.: Aktionstage, Apps, Coupons.'],
    ['pizza', 'Pizza & Abholen', 'Abhol-Pizza, Rabatt fürs Selbstabholen, gerettetes Essen.'],
    ['ayce', 'All-you-can-eat', 'Buffets und „so viel du magst“ – nach Entfernung ab Döbeln.'],
    ['xxl', 'XXL & Challenges', 'Riesen-Portionen, Ess-Challenges und feste Tagesessen in der Region.'],
    ['gratis', 'Gratis-Tage', 'Was ohne Kauf gratis ist – und Tage mit Sonderpreis.'],
  ];
  const AKTUELL = ['aktuell', 'Aktuell', 'Frisch vom Radar: Essen-Deals der letzten Tage.'];
  const WT = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // --- kleine Helfer ---------------------------------------------------------------------------------------------------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lies = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const merk = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const text = (v, max = 600) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
  function sicherUrl(u) {
    if (typeof u !== 'string') return null;
    try { const x = new URL(u.trim()); return x.protocol === 'https:' && x.hostname.includes('.') ? x.href : null; } catch { return null; }
  }
  const isoTag = v => (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00Z')) ? v : null);
  const uhr = v => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null);
  const minuten = v => (v ? Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5)) : null);
  let FMT = null;
  /** Berliner Zeit: { iso: „2026-11-15“, wt: 1 (Mo) … 7 (So), min: Minuten seit Mitternacht } */
  function jetztBerlin(t = Date.now()) {
    FMT = FMT || new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const o = {};
    for (const p of FMT.formatToParts(new Date(t))) o[p.type] = p.value;
    const iso = `${o.year}-${o.month}-${o.day}`;
    return { iso, wt: wochentag(iso), min: Number(o.hour) * 60 + Number(o.minute) };
  }
  const wochentag = iso => new Date(iso + 'T12:00:00Z').getUTCDay() || 7;
  const plusTage = (iso, n) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
  const tageZwischen = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
  const tm = iso => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;
  const tmj = iso => `${tm(iso)}${iso.slice(0, 4)}`;
  const wtm = iso => `${WT[wochentag(iso)]} ${tm(iso)}`; // „Mo 16.11.“

  // --- Daten tolerant lesen ------------------------------------------------------------------------------------------
  function normalisiere(d) {
    const ok = d && typeof d === 'object' && !Array.isArray(d);
    const ids = new Set(), eintraege = [];
    for (const e of ok && Array.isArray(d.eintraege) ? d.eintraege : []) {
      if (!e || typeof e !== 'object') continue;
      const id = typeof e.id === 'string' && /^[a-z0-9-]{2,60}$/.test(e.id) ? e.id : null;
      const titel = text(e.titel, 140), geprueft = isoTag(e.geprueft);
      const quellen = [];
      for (const q of Array.isArray(e.quellen) ? e.quellen : []) {
        const url = sicherUrl(q && q.url);
        if (url && !quellen.some(x => x.url === url)) quellen.push({ name: text(q.name, 60) || new URL(url).hostname, url });
      }
      // ohne Pflichtfeld, ohne Quelle oder doppelt: weg (nichts ohne Beleg)
      if (!id || ids.has(id) || !titel || !geprueft || !quellen.length || !RUBRIKEN.includes(e.rubrik)) continue;
      ids.add(id);
      const wt = [...new Set((Array.isArray(e.wochentage) ? e.wochentage : []).filter(x => Number.isInteger(x) && x >= 1 && x <= 7))].sort((a, b) => a - b);
      const z = e.zeit && typeof e.zeit === 'object' ? { von: uhr(e.zeit.von), bis: uhr(e.zeit.bis), text: text(e.zeit.text, 60) } : null;
      // Pause im Fenster (z. B. 12–15:30 und 16:30–21 Uhr): in der Pause nicht „läuft“
      const pz = z && e.zeit.pause && typeof e.zeit.pause === 'object' ? { von: uhr(e.zeit.pause.von), bis: uhr(e.zeit.pause.bis) } : null;
      if (z && pz && pz.von && pz.bis && pz.von < pz.bis) z.pause = pz;
      const region = (Array.isArray(e.region) ? e.region : []).filter(r => REGIONEN.includes(r));
      const plan = {};
      if (e.plan && typeof e.plan === 'object') for (let i = 1; i <= 7; i++) { const p = text(e.plan[i], 60); if (p) plan[i] = p; }
      const sp = e.spartricks && typeof e.spartricks === 'object' && /^[a-z]{2,20}$/.test(e.spartricks.chip || '') ? { chip: e.spartricks.chip, id: /^[a-z0-9-]{2,60}$/.test(e.spartricks.id || '') ? e.spartricks.id : null } : null;
      eintraege.push({
        id, titel, rubrik: e.rubrik, art: ARTEN.includes(e.art) ? e.art : 'dauerhaft', kette: text(e.kette, 60), ort: text(e.ort, 60),
        ortZusatz: text(e.ortZusatz, 60), was: text(e.was, 300), adresse: text(e.adresse, 120),
        region: region.length ? [...new Set(region)] : ['bundesweit'], km: Number.isFinite(e.km) && e.km >= 0 && e.km < 1000 ? Math.round(e.km) : null,
        wann: text(e.wann, 240), wochentage: wt.length ? wt : null, zeit: z && (z.von || z.bis) ? z : null,
        ab: isoTag(e.ab), bis: isoTag(e.bis), plan: Object.keys(plan).length ? plan : null,
        preis: text(e.preis, 240), bedingung: text(e.bedingung, 500), gratis: e.gratis === true, nurHinweis: e.nurHinweis === true,
        spartricks: sp, quellen: quellen.slice(0, 3), quelleStand: text(e.quelleStand, 80), geprueft, sicher: e.sicher === 'ja' ? 'ja' : 'pruefen',
      });
    }
    const dq = ok && d.doebeln && typeof d.doebeln === 'object' ? d.doebeln : null;
    const doebeln = dq && text(dq.text, 400) ? { text: text(dq.text, 400), quellen: (Array.isArray(dq.quellen) ? dq.quellen : []).map(q => ({ name: text(q?.name, 60), url: sicherUrl(q?.url) })).filter(q => q.url), geprueft: isoTag(dq.geprueft) } : null;
    const hinweise = {};
    if (ok && d.hinweise && typeof d.hinweise === 'object') for (const k of ['xxl', 'pizza', 'gratis', 'ayce', 'ketten']) if (text(d.hinweise[k], 400)) hinweise[k] = text(d.hinweise[k], 400);
    return { version: ok && Number.isInteger(d.version) ? d.version : null, stand: ok ? isoTag(d.stand) : null, hinweis: ok ? text(d.hinweis, 500) : '', eintraege, doebeln, hinweise };
  }

  // --- Tageslogik (rein, für Tests) -------------------------------------------------------------------------------------
  const vorbei = (e, iso) => !!e.bis && e.bis < iso; // Ende vorbei: nie mehr zeigen
  const alt = (e, iso) => tageZwischen(e.geprueft, iso) > ALT_TAGE;
  const taeglich = e => !!e.wochentage && e.wochentage.length === 7;
  /** gilt der Eintrag an diesem Kalendertag? (nurHinweis und Aktionstag ohne Ende: nie) */
  function giltAm(e, iso) {
    if (e.nurHinweis) return false;
    if (e.art === 'aktionstag' && !e.bis) return false;
    if (e.ab && iso < e.ab) return false;
    if (e.bis && iso > e.bis) return false;
    if (e.wochentage && !e.wochentage.includes(wochentag(iso))) return false;
    return true;
  }
  /** nächster Tag nach iso, an dem der Eintrag gilt (höchstens 70 Tage voraus) */
  function naechsterTag(e, iso) {
    if (e.nurHinweis || (e.art === 'aktionstag' && !e.bis)) return null;
    for (let i = 1; i <= 70; i++) { const t = plusTage(iso, i); if (e.bis && t > e.bis) return null; if (giltAm(e, t)) return t; }
    return null;
  }
  /** heute: 'jetzt' (im Fenster von–bis) | 'offen' (nur „ab“ oder nur „bis“ bekannt: kein „läuft“) | 'spaeter' (Uhrzeit noch
      nicht erreicht oder Pause) | 'vorbei' (Uhrzeit heute vorbei) | 'heute' (ohne Uhrzeit) | null */
  function heuteStatus(e, j) {
    if (!giltAm(e, j.iso)) return null;
    if (!e.zeit) return 'heute';
    const von = minuten(e.zeit.von), bis = minuten(e.zeit.bis);
    if (bis != null && j.min >= bis) return 'vorbei';
    if (von != null && j.min < von) return 'spaeter';
    if (von == null || bis == null) return 'offen'; // Ende/Beginn unbekannt: „läuft“ wäre geraten
    const p = e.zeit.pause;
    if (p && j.min >= minuten(p.von) && j.min < minuten(p.bis)) return 'spaeter';
    return 'jetzt';
  }
  /** „besonders“ = an diesem Tag etwas Eigenes (Aktionstag oder fester Wochentag, nicht täglich und nicht dauerhaft) */
  const besonders = e => e.art === 'aktionstag' || (!!e.wochentage && !taeglich(e));
  const regionRang = e => (e.region.includes('Döbeln') ? 0 : e.region.includes('bundesweit') ? 2 : 1);
  const STATUS_RANG = { jetzt: 0, offen: 1, heute: 1, spaeter: 2, vorbei: 3 };
  /** Heute-Reiter: { heute: [{e, s}], bald: [{e, tag}], morgen: [e], taeglich: [e], woche: {1..7: [e]} } */
  function heuteTeile(n, j) {
    const da = n.eintraege.filter(e => !vorbei(e, j.iso) && !e.nurHinweis);
    const heute = da.filter(e => besonders(e) && giltAm(e, j.iso)).map(e => ({ e, s: heuteStatus(e, j) }))
      .sort((a, b) => STATUS_RANG[a.s] - STATUS_RANG[b.s] || (a.e.sicher === 'ja' ? 0 : 1) - (b.e.sicher === 'ja' ? 0 : 1) || regionRang(a.e) - regionRang(b.e) || (a.e.km ?? 0) - (b.e.km ?? 0));
    const bald = da.filter(e => e.art === 'aktionstag' && !giltAm(e, j.iso)).map(e => ({ e, tag: naechsterTag(e, j.iso) }))
      .filter(x => x.tag && tageZwischen(j.iso, x.tag) <= 35).sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0)).slice(0, 4);
    const morgenIso = plusTage(j.iso, 1);
    const morgen = da.filter(e => besonders(e) && e.art !== 'aktionstag' && giltAm(e, morgenIso));
    const taeglichL = da.filter(e => taeglich(e) && giltAm(e, j.iso)).sort((a, b) => regionRang(a) - regionRang(b) || (a.km ?? 0) - (b.km ?? 0));
    const woche = {};
    for (let w = 1; w <= 7; w++) woche[w] = da.filter(e => e.art !== 'aktionstag' && e.wochentage && !taeglich(e) && e.wochentage.length <= 3 && e.wochentage.includes(w));
    return { heute, bald, morgen, taeglich: taeglichL, woche };
  }
  /** Liste eines Unterreiters (ohne „heute“): laufende/kommende Aktionstage zuerst, dann sicher, dann nach km; Hinweise extra */
  function liste(n, chip, iso) {
    const da = n.eintraege.filter(e => !vorbei(e, iso));
    const passt = chip === 'gratis' ? e => e.gratis || e.art === 'aktionstag' : chip === 'xxl' ? e => e.rubrik === 'xxl' || e.rubrik === 'lokal' : e => e.rubrik === chip;
    const l = da.filter(passt);
    const rang = e => (e.art === 'aktionstag' && !e.nurHinweis ? (giltAm(e, iso) ? 0 : 1) : 2);
    const tagVon = e => (giltAm(e, iso) ? iso : naechsterTag(e, iso) || '9999');
    const sortiert = l.filter(e => !e.nurHinweis).map((e, i) => ({ e, i })).sort((a, b) =>
      (chip === 'gratis' ? (b.e.gratis - a.e.gratis) : 0) // Gratis-Tage: was ohne Kauf gratis ist, steht oben
      || rang(a.e) - rang(b.e) || (rang(a.e) < 2 ? (tagVon(a.e) < tagVon(b.e) ? -1 : tagVon(a.e) > tagVon(b.e) ? 1 : 0) : 0)
      || (a.e.rubrik === 'lokal') - (b.e.rubrik === 'lokal')
      || (a.e.km ?? -1) - (b.e.km ?? -1) || (a.e.sicher === 'ja' ? 0 : 1) - (b.e.sicher === 'ja' ? 0 : 1) || a.i - b.i).map(x => x.e);
    return { l: sortiert, hinweise: l.filter(e => e.nurHinweis) };
  }
  /** Start-Kachel: höchstens 2 Zeilen, nur sicher belegte, nur nicht veraltete. Reihenfolge: Aktionstag heute,
      Gratis-Tag heute, Wochentags-Aktion heute, nächster Aktionstag (≤ 14 Tage), dauerhaft gratis, weitere Aktionstage.
      Gleiche Regeln wie essenKachel() in index.html (die Startseite lädt dieses Skript nicht). */
  function kachelZeilen(auszug, t = Date.now()) {
    const j = jetztBerlin(t);
    const l = (Array.isArray(auszug?.e) ? auszug.e : []).filter(e => e && typeof e.id === 'string' && typeof e.titel === 'string' && e.titel)
      .map(e => ({ ...e, wochentage: Array.isArray(e.wochentage) && e.wochentage.length ? e.wochentage : null, ab: isoTag(e.ab), bis: isoTag(e.bis) }))
      .filter(e => !vorbei(e, j.iso) && !e.nurHinweis && (!isoTag(e.geprueft) || !alt(e, j.iso)));
    const z = [], schon = new Set();
    const dazu = (e, zeile, gut) => { if (z.length < 2 && !schon.has(e.id)) { schon.add(e.id); z.push([e.titel, zeile, gut]); } };
    const marke = e => (e.marke ? ` · ${e.marke}` : '');
    for (const e of l) if (e.art === 'aktionstag' && giltAm(e, j.iso)) dazu(e, `heute${e.bis && e.bis !== j.iso ? ` bis ${wtm(e.bis)}` : ''}${marke(e)}`, true);
    for (const e of l) if (e.gratis && besonders(e) && giltAm(e, j.iso)) dazu(e, `heute gratis${marke(e)}`, true);
    for (const e of l) if (besonders(e) && e.art !== 'aktionstag' && giltAm(e, j.iso)) dazu(e, `heute${marke(e)}`, true);
    const bald = l.filter(e => e.art === 'aktionstag' && !giltAm(e, j.iso)).map(e => [e, naechsterTag(e, j.iso)]).filter(([, tg]) => tg && tageZwischen(j.iso, tg) <= 14)
      .sort((a, b) => (a[1] < b[1] ? -1 : 1));
    // Abwechslung: höchstens ein „ab …“ vor dem, was heute ohne Kauf gratis ist; weitere Aktionstage nur, wenn noch Platz ist
    const baldZeile = ([e, tg]) => dazu(e, `ab ${wtm(tg)}${marke(e)}`, false);
    bald.slice(0, 1).forEach(baldZeile);
    for (const e of l) if (e.gratis && !besonders(e) && giltAm(e, j.iso)) dazu(e, e.marke || 'gratis', false);
    bald.slice(1).forEach(baldZeile);
    return z;
  }
  const markeVon = e => (e.gratis ? 'gratis ohne Kauf' : e.art === 'app' || /\bnur (registrierte )?App|App-Nutzer|nur App\b/i.test(`${e.titel} ${e.bedingung}`) ? 'nur mit App' : e.art === 'abholung' ? 'Abholung' : '');
  /** kleiner Auszug für die Start-Kachel: nur sicher belegte Einträge, nur Felder für die Tageslogik. Die Kachel ist schmal
      (hochkant ca. 190 px): „nur mit App“ heißt dort „nur App“, und eine Klammer am Titelende, die nur „App“ wiederholt, fällt weg. */
  function kachelAuszug(d) {
    const n = normalisiere(d);
    const e = n.eintraege.filter(x => x.sicher === 'ja' && !x.nurHinweis).map(x => {
      const m = markeVon(x);
      const t = m === 'nur mit App' ? x.titel.replace(/\s*\([^()]*\bApp\b[^()]*\)$/, '') : x.titel;
      const k = { id: x.id, titel: (x.kette && !t.toLowerCase().includes(x.kette.toLowerCase().split(' ')[0]) ? `${x.kette}: ` : '') + t, art: x.art, geprueft: x.geprueft };
      if (x.wochentage) k.wochentage = x.wochentage;
      if (x.ab) k.ab = x.ab;
      if (x.bis) k.bis = x.bis;
      if (x.gratis) k.gratis = true;
      if (m) k.marke = m === 'nur mit App' ? 'nur App' : m;
      return k;
    });
    return { stand: n.stand, e };
  }


  // --- Lokale um Döbeln + Regelmäßig (Xander 16.11.2026: „die besten Italiener, Griechen, Inder, Türken … nach Bewertung und
  // was die Leute sagen, in der Nähe von Döbeln; wann All-you-can-eat; Ketten wie Domino's – gibt es einen in der Nähe;
  // wiederkehrende Muster zum Planen“). Daten: vom Radar (vorteile-daten …/essen.json: gepflegte Liste + OpenStreetMap mit
  // Öffnungszeiten, weitere Lokale, nächste Filiale je Kette); fehlt die Datei, die gepflegte Liste (../vorteile/essen.json).
  // Erst beim ersten Öffnen von „Lokale“ oder „Regelmäßig“ geholt (lazy). Merken: nur auf diesem Gerät (localStorage).
  const LOKALE_URLS = ['https://raw.githubusercontent.com/XanderFoxy/Synquenzer/vorteile-daten/vorteile/data/essen.json', '../vorteile/essen.json'];
  const LOK_ABLAGE = 'essen-lokale.json'; // Schlüssel in der Ablage „mv-essen“ (relativ zur Seite)
  const FILTER_SPEICHER = 'mein-vorteil-essen-filter';
  const MERK_SPEICHER = 'mein-vorteil-essen-gemerkt';
  const LOK_ZEIGEN = 30; // so viele Karten sofort, der Rest auf Tipp
  const KUECHE_NAME = {
    italienisch: 'Italienisch', pizza: 'Pizza', griechisch: 'Griechisch', indisch: 'Indisch', tuerkisch: 'Türkisch', doener: 'Döner',
    asiatisch: 'Asiatisch', chinesisch: 'Chinesisch', vietnamesisch: 'Vietnamesisch', japanisch: 'Japanisch/Sushi', mongolisch: 'Mongolisch',
    burger: 'Burger', deutsch: 'Deutsch', saechsisch: 'Sächsisch', mexikanisch: 'Mexikanisch', steak: 'Steak', haehnchen: 'Hähnchen',
    fisch: 'Fisch', balkan: 'Balkan', orientalisch: 'Orientalisch', mediterran: 'Mediterran', vegan: 'Vegan', vegetarisch: 'Vegetarisch',
    imbiss: 'Imbiss', international: 'International', fruehstueck: 'Frühstück',
  };
  /** Küchen-Filter: [schlüssel, Name, Küchen] */
  const KUECHE_FILTER = [
    ['italienisch', 'Italienisch & Pizza', ['italienisch', 'pizza']], ['griechisch', 'Griechisch', ['griechisch']], ['indisch', 'Indisch', ['indisch']],
    ['tuerkisch', 'Türkisch & Döner', ['tuerkisch', 'doener', 'orientalisch']], ['asiatisch', 'Asiatisch', ['asiatisch', 'chinesisch', 'vietnamesisch', 'japanisch', 'mongolisch']],
    ['burger', 'Burger', ['burger', 'steak', 'haehnchen']], ['deutsch', 'Deutsch', ['deutsch', 'saechsisch', 'balkan']],
  ];
  const UMKREIS = [5, 15, 30, 70];
  const WEIT_KM = 70; // All-you-can-eat und XXL: bis Leipzig/Chemnitz/Dresden
  const FILTER_LEER = { kueche: '', km: 30, bew: 0, offen: false, ayce: false, xxl: false, merk: false, sort: 'beste' };
  const STERN = '<svg class="ess-stern" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z"/></svg>';
  const KUECHE_TEXT = [[/griech/i, 'griechisch'], [/mongol/i, 'mongolisch'], [/sushi|japan/i, 'japanisch'], [/asia|wok|chines|vietnam/i, 'asiatisch'],
    [/steak|rodizio/i, 'steak'], [/vegan/i, 'vegan'], [/mexik/i, 'mexikanisch'], [/diner|burger/i, 'burger'], [/schnitzel|kartoffel|sächs|deutsch/i, 'deutsch'],
    [/pizza/i, 'pizza'], [/brunch|frühstück/i, 'fruehstueck'], [/indisch|indian/i, 'indisch']];
  const kuecheAusText = s => [...new Set(KUECHE_TEXT.filter(([re]) => re.test(s)).map(([, k]) => k))];
  const zahlDe = (v, n = 1) => v.toLocaleString('de-DE', { minimumFractionDigits: n, maximumFractionDigits: n });
  const kmText = v => (v == null ? '' : v < 10 ? `${zahlDe(v, v % 1 ? 1 : 0)} km` : `${Math.round(v)} km`);
  const geo = v => (Number.isFinite(v) && Math.abs(v) <= 180 ? v : null);

  /** Lokale-Datei (Radar oder gepflegte Liste) tolerant lesen -> { stand, osmStand, live, lokale, ketten, neu, weg } | null */
  function normLokale(d) {
    if (!d || typeof d !== 'object' || !Array.isArray(d.lokale)) return null;
    const ids = new Set();
    const eins = (l, osmNur) => {
      if (!l || typeof l !== 'object') return null;
      const id = typeof l.id === 'string' && /^[a-z0-9-]{2,80}$/.test(l.id) ? l.id : null;
      const name = text(l.name, 90);
      if (!id || !name || ids.has(id)) return null;
      ids.add(id);
      const bew = (Array.isArray(l.bewertungen) ? l.bewertungen : []).map(b => (b && Number.isFinite(b.wert) && Number.isInteger(b.anzahl) && b.anzahl > 0 && sicherUrl(b.url)
        ? { wert: Math.max(0, Math.min(b.wert, Number(b.max) || 5)), max: Number(b.max) || 5, anzahl: b.anzahl, quelle: text(b.quelle, 50) || new URL(b.url).hostname, url: sicherUrl(b.url), stand: isoTag(b.stand) } : null)).filter(Boolean).slice(0, 3);
      const ay = l.ayce && typeof l.ayce === 'object' ? { wochentage: (Array.isArray(l.ayce.wochentage) ? l.ayce.wochentage : []).filter(x => Number.isInteger(x) && x >= 1 && x <= 7), text: text(l.ayce.text, 80), preis: text(l.ayce.preis, 80) } : null;
      const hinweise = (Array.isArray(l.hinweise) ? l.hinweise : []).map(h => text(h, 160)).filter(Boolean).slice(0, 4);
      const quellen = (Array.isArray(l.quellen) ? l.quellen : []).map(q => ({ name: text(q?.name, 50), url: sicherUrl(q?.url) })).filter(q => q.url && q.name).slice(0, 3);
      return {
        id, name, zusatz: text(l.zusatz, 60), kueche: (Array.isArray(l.kueche) ? l.kueche : []).filter(k => typeof k === 'string' && KUECHE_NAME[k]).slice(0, 4),
        ort: text(l.ort, 60), km: Number.isFinite(l.km) && l.km >= 0 && l.km < 500 ? l.km : null, lat: geo(l.lat), lon: geo(l.lon),
        adresse: text(l.adresse, 120), oeffnung: text(l.oeffnung, 200), website: sicherUrl(l.website), bew, leute: text(l.leuteSagen, 240),
        hinweise, ayce: ay && ay.wochentage.length ? ay : null, xxl: l.xxl === true || hinweise.some(h => /große Portion|XXL|riesig/i.test(h)),
        liefert: l.liefert === true, quellen, geprueft: isoTag(l.geprueft), osmNur, osm: typeof l.osm === 'string' ? l.osm.slice(0, 30) : null,
      };
    };
    const lokale = d.lokale.map(l => eins(l, false)).filter(Boolean);
    const weitere = (Array.isArray(d.weitere) ? d.weitere : []).map(l => eins(l, true)).filter(Boolean);
    const ketten = (Array.isArray(d.ketten) ? d.ketten : []).map(k => {
      if (!k || typeof k !== 'object' || !text(k.kette, 40)) return null;
      const n = k.naechste && typeof k.naechste === 'object' ? { name: text(k.naechste.name, 80), ort: text(k.naechste.ort, 60), adresse: text(k.naechste.adresse, 120), km: Number.isFinite(k.naechste.km) ? k.naechste.km : null, lat: geo(k.naechste.lat), lon: geo(k.naechste.lon), oeffnung: text(k.naechste.oeffnung, 200) } : null;
      return {
        id: text(k.id, 60), kette: text(k.kette, 40), filiale: text(k.filiale, 120), ort: text(k.ort, 60), km: Number.isFinite(k.km) ? k.km : null,
        oeffnungText: text(k.oeffnungText, 160), lieferung: k.lieferung === true ? true : k.lieferung === false ? false : null, lieferungText: text(k.lieferungText, 240),
        aktionen: (Array.isArray(k.aktionen) ? k.aktionen : []).filter(a => typeof a === 'string').slice(0, 6), naechste: n && n.km != null ? n : null,
        quellen: (Array.isArray(k.quellen) ? k.quellen : []).map(q => ({ name: text(q?.name, 50), url: sicherUrl(q?.url) })).filter(q => q.url && q.name).slice(0, 3), geprueft: isoTag(k.geprueft),
      };
    }).filter(Boolean);
    const liste = x => (Array.isArray(x) ? x : []).map(y => ({ name: text(y?.name, 80), ort: text(y?.ort, 60), km: Number.isFinite(y?.km) ? y.km : null, seit: isoTag(y?.seit) })).filter(y => y.name).slice(0, 20);
    return { stand: isoTag(d.stand), osmStand: typeof d.osmStand === 'string' ? d.osmStand.slice(0, 10) : null, live: Array.isArray(d.weitere), lokale, weitere, ketten, neu: liste(d.neu), weg: liste(d.weg) };
  }
  /** Lokale aus essen.json der Seite (All-you-can-eat, XXL, feste Tagesessen mit Ort) als Lokal-Karten */
  function lokaleAusEintraegen(n, iso) {
    return n.eintraege.filter(e => e.ort && ['ayce', 'xxl', 'lokal'].includes(e.rubrik) && !vorbei(e, iso) && !e.nurHinweis).map(e => ({
      id: e.id, name: e.titel, zusatz: '', kueche: kuecheAusText(`${e.titel} ${e.was}`), ort: e.ortZusatz || e.ort, km: e.km, lat: null, lon: null, adresse: e.adresse,
      oeffnung: '', website: null, bew: [], leute: '', hinweise: [], ayce: e.rubrik === 'ayce' ? { wochentage: e.wochentage || [], text: e.wann, preis: e.preis } : null,
      xxl: e.rubrik === 'xxl', liefert: false, quellen: e.quellen, geprueft: e.geprueft, osmNur: false, eintrag: e,
    }));
  }

  // OSM-Öffnungszeiten (häufige Formen): „Mo-Fr 11:00-14:00,17:00-22:00; Sa,Su 12:00-22:00; Tu off“, „24/7“. Feiertage (PH)
  // werden übergangen; Unbekanntes (Monate, Wochen, sunrise …) -> null (dann nur der Text, kein „offen“).
  const OSM_TAG = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 7 };
  function oeffnungPlan(oh) {
    const s = String(oh || '').trim();
    if (!s) return null;
    const plan = {};
    if (s === '24/7') { for (let t = 1; t <= 7; t++) plan[t] = [[0, 1440]]; return plan; }
    let ok = false;
    for (const teil0 of s.split(';')) {
      const teil = teil0.trim();
      if (!teil) continue;
      if (/^PH\b/.test(teil)) continue;
      const m = /^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:\s*,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su|PH)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)\s+(.+)$/.exec(teil);
      let tage = [], zeiten;
      if (m) {
        for (const st of m[1].split(',').map(x => x.trim()).filter(x => x !== 'PH')) {
          const [a, b] = st.split('-').map(x => OSM_TAG[x.trim()]);
          if (!a) return null;
          if (!b) tage.push(a); else for (let t = a, i = 0; i < 7; i++, t = t % 7 + 1) { tage.push(t); if (t === b) break; }
        }
        zeiten = m[2].trim();
      } else if (/^\d\d:\d\d/.test(teil)) { tage = [1, 2, 3, 4, 5, 6, 7]; zeiten = teil; } else return null;
      if (/^(off|closed)$/i.test(zeiten)) { for (const t of tage) plan[t] = []; ok = true; continue; }
      const fenster = [];
      for (const z of zeiten.split(',')) {
        const f = /^\s*(\d\d):(\d\d)\s*-\s*(\d\d):(\d\d)\+?\s*$/.exec(z);
        if (!f) return null;
        const von = +f[1] * 60 + +f[2];
        let bis = +f[3] * 60 + +f[4];
        if (bis <= von) bis += 1440;
        fenster.push([von, bis]);
      }
      for (const t of tage) plan[t] = fenster;
      ok = true;
    }
    return ok ? plan : null;
  }
  const uhrText = m => { const h = Math.floor(m / 60) % 24, mi = m % 60; return mi ? `${h}:${String(mi).padStart(2, '0')}` : `${h}`; };
  /** jetzt: { s: 'offen'|'spaeter'|'vorbei'|'zu', text } | null (Öffnungszeiten unbekannt) */
  function oeffnungJetzt(plan, j) {
    if (!plan) return null;
    const vor = plan[j.wt === 1 ? 7 : j.wt - 1] || [];
    for (const [, b] of vor) if (b > 1440 && j.min < b - 1440) return { s: 'offen', text: `offen bis ${uhrText(b - 1440)} Uhr` };
    const heute = plan[j.wt] || [];
    for (const [v, b] of heute) if (j.min >= v && j.min < b) return { s: 'offen', text: `offen bis ${uhrText(b)} Uhr` };
    const naechst = heute.find(([v]) => v > j.min);
    if (naechst) return { s: 'spaeter', text: `heute ab ${uhrText(naechst[0])} Uhr` };
    if (!heute.length) return { s: 'zu', text: 'heute Ruhetag' };
    return { s: 'vorbei', text: 'heute schon zu' };
  }
  const oeffnungDe = oh => String(oh || '').replace(/\bMo\b/g, 'Mo').replace(/\bTu\b/g, 'Di').replace(/\bWe\b/g, 'Mi').replace(/\bTh\b/g, 'Do')
    .replace(/\bSu\b/g, 'So').replace(/\bPH\b/g, 'Feiertag').replace(/\b(off|closed)\b/gi, 'Ruhetag').replace(/;\s*/g, ' · ').replace(/(\d)-(\d)/g, '$1–$2').replace(/([A-Za-z])-([A-Z])/g, '$1–$2');
  /** Bewertung zum Sortieren/Filtern: die mit den meisten Stimmen */
  const hauptBew = l => (l.bew.length ? [...l.bew].sort((a, b) => b.anzahl - a.anzahl)[0] : null);
  /** Rang für „Beste zuerst“: Wert, mit wenigen Stimmen zur Mitte gezogen (4 Stimmen mit 5,0 schlagen nicht 600 mit 4,7) */
  const rangWert = l => { const b = hauptBew(l); if (!b) return -1; const w = (b.wert / b.max) * 5; return (w * b.anzahl + 3.8 * 25) / (b.anzahl + 25); };
  /** heute für Lokal: { s, text } aus OSM-Zeiten, bei Einträgen der Seite aus Wochentag/Uhrzeit */
  function heuteLokal(l, j) {
    if (l.eintrag) {
      const s = heuteStatus(l.eintrag, j);
      if (!s) return l.eintrag.wochentage ? { s: 'zu', text: '' } : null;
      return { s: s === 'vorbei' ? 'vorbei' : s === 'spaeter' ? 'spaeter' : 'offen', text: '' };
    }
    return oeffnungJetzt(oeffnungPlan(l.oeffnung), j);
  }
  const kuecheGruppe = k => KUECHE_FILTER.find(f => f[0] === k);
  /** gefilterte, sortierte Lokale */
  function filtereLokale(alle, f, j, gemerkt) {
    const weit = f.ayce || f.xxl ? Math.max(f.km, WEIT_KM) : f.km;
    const kg = f.kueche ? kuecheGruppe(f.kueche) : null;
    const l = alle.filter(x => {
      if (x.km != null && x.km > weit) return false;
      if (x.km == null && weit < 30) return false;
      if (kg && !x.kueche.some(k => kg[2].includes(k))) return false;
      if (f.bew) { const b = hauptBew(x); if (!b || (b.wert / b.max) * 5 < f.bew) return false; }
      if (f.ayce && !x.ayce) return false;
      if (f.xxl && !x.xxl) return false;
      if (f.merk && !gemerkt.has(x.id)) return false;
      if (f.offen) { const h = heuteLokal(x, j); if (!h || !['offen', 'spaeter'].includes(h.s)) return false; }
      return true;
    });
    const km = x => (x.km == null ? 999 : x.km);
    return l.map((x, i) => ({ x, i })).sort((a, b) => (f.sort === 'nah' ? km(a.x) - km(b.x) : rangWert(b.x) - rangWert(a.x) || km(a.x) - km(b.x)) || a.i - b.i).map(y => y.x);
  }
  const ART_REGEL = e => (e.rubrik === 'ayce' ? 'All-you-can-eat' : e.rubrik === 'xxl' ? 'XXL' : e.rubrik === 'lokal' ? 'Tagesessen' : 'Aktion');
  /** fast jeden Tag (ab 5 Wochentagen, ohne Tagesplan): nicht in jeder Tageszeile, sondern einmal unter „Fast täglich“ */
  const oft = e => !e.plan && e.wochentage.length >= 5;
  /** Regelmäßig: 7 Tage ab heute, je Tag die wiederkehrenden Muster; dazu, was täglich gilt */
  function regelTage(n, lok, j) {
    const da = n.eintraege.filter(e => !vorbei(e, j.iso) && !e.nurHinweis && e.wochentage && e.art !== 'aktionstag');
    const tage = [];
    const nah = (lok ? [...lok.lokale] : []).filter(l => l.km == null || l.km <= 15);
    for (let i = 0; i < 7; i++) {
      const iso = plusTage(j.iso, i), wt = wochentag(iso), z = [];
      for (const e of da) {
        if (oft(e)) continue;
        if (!giltAm(e, iso)) continue;
        const art = ART_REGEL(e);
        const was = e.plan && e.plan[wt] ? `${e.kette || e.titel.split(/:\s/)[0]}: ${e.titel.split(/:\s/)[0] === e.kette ? '' : `${e.titel.split(/:\s/)[0]} – `}${e.plan[wt]}` : e.kette ? `${e.kette}: ${e.titel}` : e.titel;
        z.push({ art, was, wo: e.ort ? `${e.ortZusatz || e.ort}${e.km != null ? ` · ${e.km} km` : ''}` : e.region.includes('bundesweit') ? 'teilnehmende Filialen' : '', zeit: e.zeit?.text || '', id: e.id });
      }
      for (const l of lok ? lok.lokale : []) if (l.ayce && l.ayce.wochentage.includes(wt) && l.ayce.wochentage.length < 7) z.push({ art: 'All-you-can-eat', was: l.name, wo: `${l.ort}${l.km != null ? ` · ${kmText(l.km)}` : ''}`, zeit: l.ayce.text, id: l.id });
      const zu = nah.filter(l => { const p = oeffnungPlan(l.oeffnung); return p && Array.isArray(p[wt]) && !p[wt].length; }).map(l => l.name);
      tage.push({ iso, wt, z, zu });
    }
    const immer = da.filter(e => oft(e) && (e.rubrik !== 'ketten' || e.ort)).sort((a, b) => (a.rubrik !== 'ayce') - (b.rubrik !== 'ayce') || (a.km ?? 0) - (b.km ?? 0));
    return { tage, immer };
  }

  // --- Zustand -----------------------------------------------------------------------------------------------------------
  const S = { el: null, n: null, roh: null, chip: null, laedt: false, fehler: null, url: DATEI, ablage: null, opt: {}, uhr: null,
    lok: null, lokLaedt: false, lokFehler: null, lokQuelle: null, lokMehr: false, filter: { ...FILTER_LEER }, gemerkt: [] };
  const live = () => { try { const l = S.opt.live ? S.opt.live() : []; return Array.isArray(l) ? l.filter(x => x && typeof x.titel === 'string') : []; } catch { return []; } };
  const chipsDa = () => (live().length ? [...CHIPS.map(c => c[0]), 'aktuell'] : CHIPS.map(c => c[0]));
  const chipInfo = k => (k === 'aktuell' ? AKTUELL : CHIPS.find(c => c[0] === k) || CHIPS[0]);
  function zahl(k, j) {
    if (k === 'aktuell') return live().length;
    if (k === 'heute') return heuteTeile(S.n, j).heute.filter(x => x.s !== 'vorbei').length;
    if (k === 'lokale') return S.lok ? filtereLokale(alleLokale(j), S.filter, j, merkSet()).length : '';
    if (k === 'regel') { const r = regelTage(S.n, null, j); return new Set(r.tage.flatMap(t => t.z.map(x => x.id))).size + r.immer.length; }
    return liste(S.n, k, j.iso).l.length;
  }

  // --- Zeichnen ----------------------------------------------------------------------------------------------------------
  function statusMarke(e, j, s) {
    if (e.art === 'aktionstag' && e.bis) {
      if (giltAm(e, j.iso)) return `<span class="ess-jetzt">heute${e.bis !== j.iso ? ` · bis ${wtm(e.bis)}` : ' · letzter Tag'}</span>`;
      const t = naechsterTag(e, j.iso);
      return t ? `<span class="ess-bald">${e.ab && e.ab !== e.bis ? `${wtm(e.ab)} – ${wtm(e.bis)}` : wtm(t)}${tageZwischen(j.iso, t) <= 14 ? ` · in ${tageZwischen(j.iso, t) === 1 ? '1 Tag' : `${tageZwischen(j.iso, t)} Tagen`}` : ''}</span>` : '';
    }
    if (!e.wochentage || taeglich(e) && !e.zeit) return e.bis ? `<span class="ess-bald">bis ${tmj(e.bis)}</span>` : '';
    const st = s !== undefined ? s : heuteStatus(e, j);
    const zt = e.zeit?.text ? ` ${e.zeit.text}` : '';
    if (st === 'jetzt') return `<span class="ess-jetzt">heute${zt} · läuft</span>`;
    if (st === 'offen') return `<span class="ess-jetzt">heute${zt}</span>`;
    if (st === 'spaeter') return `<span class="ess-jetzt">heute${zt}</span>`;
    if (st === 'heute') return '<span class="ess-jetzt">heute</span>';
    const n = naechsterTag(e, j.iso);
    if (st === 'vorbei') return `<span class="ess-alt">heute vorbei${n ? ` · nächster: ${wtm(n)}` : ''}</span>`;
    return n ? `<span class="ess-bald">nächster: ${wtm(n)}</span>` : '';
  }
  function karte(e, j, s) {
    const m = [];
    if (e.kette) m.push(`<span class="ess-kette">${esc(e.kette)}</span>`);
    if (e.ort) m.push(`<span class="ess-region">${esc(e.ortZusatz || e.ort)}${e.km != null ? ` · ${e.km} km` : ''}</span>`);
    const st = e.nurHinweis ? '' : statusMarke(e, j, s);
    if (st) m.push(st);
    const mk = markeVon(e);
    if (mk) m.push(`<span class="${e.gratis ? 'ess-gratis' : 'ess-bed'}">${esc(mk)}</span>`);
    if (alt(e, j.iso)) m.push(`<span class="ess-alt">Stand ${tm(e.geprueft)} – bitte prüfen</span>`);
    else if (e.sicher !== 'ja') m.push('<span class="ess-pruefen">bitte vor Ort prüfen</span>');
    else m.push('<span class="ess-belegt">belegt</span>');
    const zeile = (k, v) => (v ? `<p class="ess-zeile"><b>${k}</b> ${esc(v)}</p>` : '');
    const heutePlan = e.plan && giltAm(e, j.iso) && e.plan[j.wt] ? `<p class="ess-zeile ess-plan"><b>Heute:</b> ${esc(e.plan[j.wt])}</p>` : '';
    const quellen = e.quellen.map(q => `<a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer" title="${esc(q.name)}">${esc(q.name)}</a>`).join('');
    return `<article class="ess-karte${e.nurHinweis ? ' ess-muster' : ''}" id="ess-${esc(e.id)}" data-ess-id="${esc(e.id)}">`
      + `<h3 class="ess-titel">${esc(e.titel)}</h3><p class="ess-marken">${m.join('')}</p>`
      + (e.was ? `<p class="ess-was">${esc(e.was)}</p>` : '')
      + zeile('Wann:', e.wann) + heutePlan
      + zeile(/^(undatiert|ohne Datum)$/i.test(e.quelleStand) ? 'Preis laut Quelle (ohne Datum):' : e.quelleStand ? `Preis (laut Quelle, Stand ${esc(e.quelleStand)}):` : 'Preis:', e.preis)
      + zeile('Bedingung:', e.bedingung)
      + (e.adresse ? `<p class="ess-ort">${esc(e.adresse)}</p>` : '')
      + (e.spartricks ? `<p class="ess-mehr"><button type="button" class="ess-link" data-ess-spar="${esc(e.spartricks.chip)}" data-ess-spar-id="${esc(e.spartricks.id || '')}">Ausführlich in Spartricks ›</button></p>` : '')
      + `<div class="ess-fuss"><span class="ess-ql">Quelle</span>${quellen}<span class="ess-stand">geprüft ${tmj(e.geprueft)}</span></div></article>`;
  }
  function liveKarte(x) {
    const url = sicherUrl(x.link);
    return `<article class="ess-karte"><h3 class="ess-titel">${esc(text(x.titel, 140))}</h3>`
      + `<p class="ess-marken"><span class="ess-pruefen">vom Radar – bitte prüfen</span>${isoTag(String(x.bis || '').slice(0, 10)) ? `<span class="ess-bald">bis ${tmj(String(x.bis).slice(0, 10))}</span>` : ''}</p>`
      + (x.zeile ? `<p class="ess-zeile">${esc(text(x.zeile, 200))}</p>` : '')
      + (url ? `<div class="ess-fuss"><span class="ess-ql">Quelle</span><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text(x.quelle, 40) || new URL(url).hostname)}</a></div>` : '') + '</article>';
  }
  const kasten = (titel, inhalt, cls = '') => `<section class="ess-abschnitt${cls}"><h3 class="ess-ab-titel">${titel}</h3>${inhalt}</section>`;
  function doebelnHtml() {
    const d = S.n.doebeln;
    if (!d) return '';
    return `<p class="ess-doebeln"><b>Döbeln:</b> ${esc(d.text)}${d.quellen.length ? ` <a class="ess-inline" href="${esc(d.quellen[0].url)}" target="_blank" rel="noopener noreferrer">${esc(d.quellen[0].name)}</a>` : ''}</p>`;
  }
  function heuteHtml(j) {
    const t = heuteTeile(S.n, j);
    const teile = [];
    teile.push(kasten(`Heute, ${esc(wtm(j.iso))}`, t.heute.length ? t.heute.map(x => karte(x.e, j, x.s)).join('') : '<p class="ess-leer">Heute keine feste Tages-Aktion. Unten: was täglich gilt und was als Nächstes kommt.</p>'));
    if (t.bald.length || t.morgen.length) {
      const morgen = t.morgen.length ? `<p class="ess-morgen"><b>Morgen, ${esc(wtm(plusTage(j.iso, 1)))}:</b> ${t.morgen.map(e => esc(e.kette ? `${e.kette}: ${e.titel}` : e.titel)).join(' · ')}</p>` : '';
      teile.push(kasten('Als Nächstes', morgen + t.bald.map(x => karte(x.e, j)).join('')));
    }
    const wz = [];
    for (let w = 1; w <= 7; w++) if (t.woche[w].length) wz.push(`<li${w === j.wt ? ' class="ess-heute"' : ''}><b>${WT[w]}</b><span>${t.woche[w].map(e => esc(e.ort ? `${e.titel.split(/\s[–(]/)[0]} (${e.ort})` : `${e.kette}: ${e.titel.split(/:\s/)[0]}`)).join(' · ')}</span></li>`);
    if (wz.length) teile.push(kasten('Die Woche', `<ul class="ess-woche">${wz.join('')}</ul>`));
    if (t.taeglich.length) teile.push(`<details class="ess-auf"><summary>Täglich (${t.taeglich.length})</summary>${t.taeglich.map(e => karte(e, j)).join('')}</details>`);
    return teile.join('') + doebelnHtml();
  }
  function listeHtml(k, j) {
    if (k === 'heute') return heuteHtml(j);
    if (k === 'lokale') return lokaleHtml(j);
    if (k === 'regel') return regelHtml(j);
    if (k === 'aktuell') { const l = live(); return l.length ? l.map(liveKarte).join('') : '<p class="ess-leer">Gerade nichts vom Radar.</p>'; }
    const { l, hinweise } = liste(S.n, k, j.iso);
    const vorne = [];
    if (k === 'gratis') vorne.push(`<p class="ess-spar"><span>${esc(S.n.hinweise.gratis || 'Geburtstag und Proben: in Spartricks.')}</span><button type="button" class="ess-link" data-ess-spar="geburtstag">Geburtstag gratis ›</button><button type="button" class="ess-link" data-ess-spar="gratis">Gratis &amp; Proben ›</button></p>`);
    else if (S.n.hinweise[k]) vorne.push(`<p class="ess-hinweis-box">${esc(S.n.hinweise[k])}</p>`);
    if (k === 'ayce') vorne.push(doebelnHtml());
    let lokalKopf = false, gratisKopf = 0;
    const karten = l.map(e => {
      let kopf = k === 'xxl' && e.rubrik === 'lokal' && !lokalKopf ? (lokalKopf = true, '<h3 class="ess-ab-titel">Feste Tagesessen in der Region</h3>') : '';
      const stufe = e.gratis ? 1 : 2; // Gratis-Tage: zwei Zwischenüberschriften (Liste steht schon gratis-zuerst)
      if (k === 'gratis' && gratisKopf < stufe) { gratisKopf = stufe; kopf = `<h3 class="ess-ab-titel">${e.gratis ? 'Ohne Kauf gratis' : 'Tage mit Sonderpreis (beim Kauf)'}</h3>`; }
      return kopf + karte(e, j);
    }).join('');
    const muster = hinweise.length ? `<details class="ess-auf"><summary>Kommt immer wieder (${hinweise.length})</summary><p class="ess-unter">Gerade keine laufende Aktion – so lief es zuletzt. Nicht aktuell.</p>${hinweise.map(e => karte(e, j)).join('')}</details>` : '';
    return vorne.join('') + (karten || '<p class="ess-leer">Hier läuft gerade nichts.</p>') + muster;
  }
  // --- Lokale: laden, zeichnen -------------------------------------------------------------------------------------------
  const merkSet = () => new Set(Array.isArray(S.gemerkt) ? S.gemerkt : []);
  function alleLokale(j) {
    if (!S.lok) return [];
    const ids = new Set(S.lok.lokale.map(l => l.id));
    return [...S.lok.lokale, ...S.lok.weitere.filter(l => !ids.has(l.id)), ...(S.n ? lokaleAusEintraegen(S.n, j.iso) : [])];
  }
  async function ladeLokale() {
    if (S.lokLaedt) return;
    S.lokLaedt = true;
    const ablUrl = (() => { try { return new URL(LOK_ABLAGE, location.href).href; } catch { return LOK_ABLAGE; } })();
    let n = null, roh = null, quelle = null;
    for (const [i, u] of (S.opt.lokaleUrls || LOKALE_URLS).entries()) {
      try { roh = await hol(u); n = normLokale(JSON.parse(roh)); if (n && n.lokale.length) { quelle = i === 0 ? 'radar' : 'liste'; break; } } catch {}
      n = null;
    }
    if (n) { try { if (typeof caches !== 'undefined') await (await caches.open(ABLAGE)).put(ablUrl, new Response(roh, { headers: { 'content-type': 'application/json' } })); } catch {} }
    else {
      try { if (typeof caches !== 'undefined') { const r = await (await caches.open(ABLAGE)).match(ablUrl); if (r) { n = normLokale(JSON.parse(await r.text())); quelle = 'ablage'; } } } catch {}
    }
    S.lokLaedt = false;
    if (n) { S.lok = n; S.lokQuelle = quelle; S.lokFehler = null; } else if (!S.lok) S.lokFehler = 'netz';
    if (S.el && S.el.isConnected && (S.chip === 'lokale' || S.chip === 'regel')) zeichne();
  }
  function bewHtml(b) {
    const w = zahlDe((b.wert / b.max) * 5);
    return `<p class="ess-bew"><span class="ess-bw" aria-label="${w} von 5">${STERN}<b>${w}</b></span><span>${b.anzahl.toLocaleString('de-DE')} ${b.anzahl === 1 ? 'Stimme' : 'Stimmen'}</span>`
      + `<a href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(b.quelle)}</a>${b.stand ? `<span class="ess-bw-stand">Stand ${tmj(b.stand)}</span>` : ''}</p>`;
  }
  const karteUrl = l => (l.lat != null ? `https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lon}#map=18/${l.lat}/${l.lon}` : `https://www.openstreetmap.org/search?query=${encodeURIComponent([l.name, l.adresse || l.ort].filter(Boolean).join(', '))}`);
  const appleUrl = l => `https://maps.apple.com/?q=${encodeURIComponent(l.name)}${l.lat != null ? `&ll=${l.lat},${l.lon}` : `&address=${encodeURIComponent(l.adresse || l.ort || '')}`}`;
  function lokKarte(l, j, gemerkt) {
    const m = [];
    for (const k of l.kueche.slice(0, 3)) m.push(`<span class="ess-kette">${esc(KUECHE_NAME[k])}</span>`);
    if (l.ort || l.km != null) m.push(`<span class="ess-region">${esc(l.ort)}${l.km != null ? ` · ${kmText(l.km)}` : ''}</span>`);
    const h = l.eintrag ? null : heuteLokal(l, j);
    if (h) m.push(`<span class="${h.s === 'offen' || h.s === 'spaeter' ? 'ess-jetzt' : 'ess-alt'}">${esc(h.text)}</span>`);
    if (l.eintrag) { const st = statusMarke(l.eintrag, j); if (st) m.push(st); }
    if (l.ayce) m.push('<span class="ess-bald">All-you-can-eat</span>');
    if (l.xxl) m.push('<span class="ess-bald">XXL</span>');
    if (l.liefert) m.push('<span class="ess-bed">liefert</span>');
    if (l.osmNur) m.push('<span class="ess-alt">noch ohne Bewertung</span>');
    const an = gemerkt.has(l.id);
    const quellen = l.quellen.map(q => `<a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer">${esc(q.name)}</a>`).join('');
    const e = l.eintrag;
    return `<article class="ess-karte ess-lok" id="ess-lok-${esc(l.id)}" data-ess-lok="${esc(l.id)}">`
      + `<div class="ess-lok-kopf"><h3 class="ess-titel">${esc(l.name)}${l.zusatz ? `<span class="ess-zusatz"> · ${esc(l.zusatz)}</span>` : ''}</h3>`
      + `<button type="button" class="ess-merk" data-ess-merk="${esc(l.id)}" aria-pressed="${an}" aria-label="${esc(l.name)} ${an ? 'nicht mehr merken' : 'merken'}">${STERN}</button></div>`
      + `<p class="ess-marken">${m.join('')}</p>`
      + l.bew.map(bewHtml).join('')
      + (l.leute ? `<p class="ess-was"><b>Leute sagen:</b> ${esc(l.leute)}</p>` : '')
      + (e && e.was ? `<p class="ess-was">${esc(e.was)}</p>` : '')
      + l.hinweise.map(x => `<p class="ess-zeile">${esc(x)}</p>`).join('')
      + (l.oeffnung ? `<p class="ess-zeile"><b>Öffnungszeiten:</b> ${esc(oeffnungDe(l.oeffnung))} <span class="ess-osm">(OpenStreetMap)</span></p>` : '')
      + (e ? `<p class="ess-zeile"><b>Wann:</b> ${esc(e.wann)}</p>${e.preis ? `<p class="ess-zeile"><b>Preis:</b> ${esc(e.preis)}</p>` : ''}` : '')
      + (l.adresse ? `<p class="ess-ort">${esc(l.adresse)}</p>` : '')
      + `<div class="ess-fuss"><a href="${esc(karteUrl(l))}" target="_blank" rel="noopener noreferrer">Karte</a><a href="${esc(appleUrl(l))}" target="_blank" rel="noopener noreferrer">Apple Karten</a>`
      + (l.website ? `<a href="${esc(l.website)}" target="_blank" rel="noopener noreferrer">Website</a>` : '') + quellen
      + `${l.geprueft ? `<span class="ess-stand">geprüft ${tmj(l.geprueft)}</span>` : l.osmNur ? '<span class="ess-stand">aus OpenStreetMap</span>' : ''}</div></article>`;
  }
  const fKnopf = (k, v, name, an) => `<button type="button" class="ess-f" data-ess-f="${k}" data-ess-v="${esc(String(v))}" aria-pressed="${an}">${name}</button>`;
  function filterHtml(f) {
    const r1 = [fKnopf('kueche', '', 'Alle Küchen', !f.kueche), ...KUECHE_FILTER.map(([k, name]) => fKnopf('kueche', k, esc(name), f.kueche === k))];
    const r2 = [...UMKREIS.map(k => fKnopf('km', k, `bis ${k} km`, f.km === k)), fKnopf('bew', 4, `${STERN} ab 4,0`, f.bew === 4), fKnopf('bew', 4.5, `${STERN} ab 4,5`, f.bew === 4.5)];
    const r3 = [fKnopf('offen', 1, 'Heute offen', f.offen), fKnopf('ayce', 1, 'All-you-can-eat', f.ayce), fKnopf('xxl', 1, 'XXL', f.xxl), fKnopf('merk', 1, `${STERN} Gemerkt`, f.merk),
      fKnopf('sort', f.sort === 'nah' ? 'beste' : 'nah', f.sort === 'nah' ? 'Nächste zuerst' : 'Beste zuerst', false)];
    return `<div class="ess-filter" role="group" aria-label="Lokale filtern"><div class="ess-frei">${r1.join('')}</div><div class="ess-frei">${r2.join('')}</div><div class="ess-frei">${r3.join('')}</div></div>`;
  }
  function kettenHtml(j) {
    const ks = S.lok.ketten;
    if (!ks.length) return '';
    const titel = id => { const e = S.n?.eintraege.find(x => x.id === id); return e && !vorbei(e, j.iso) ? e.titel : null; };
    const k = ks.map(c => {
      const n = c.naechste;
      const wo = n ? `${n.name}${n.adresse ? `, ${n.adresse}` : n.ort ? `, ${n.ort}` : ''}` : c.filiale;
      const km = n ? n.km : c.km;
      const akt = c.aktionen.map(titel).filter(Boolean);
      const ziel = n && n.lat != null ? { name: n.name, lat: n.lat, lon: n.lon } : { name: c.kette, adresse: c.filiale };
      return `<article class="ess-karte ess-lok" id="ess-kette-${esc(c.id)}"><h3 class="ess-titel">${esc(c.kette)}</h3>`
        + `<p class="ess-marken"><span class="ess-region">nächste: ${esc(n?.ort || c.ort)}${km != null ? ` · ${kmText(km)}` : ''}</span>`
        + `<span class="${c.lieferung ? 'ess-jetzt' : 'ess-alt'}">${c.lieferung === true ? 'liefert nach Döbeln' : c.lieferung === false ? 'keine Lieferung nach Döbeln' : 'Lieferung unklar'}</span></p>`
        + `<p class="ess-zeile"><b>Filiale:</b> ${esc(wo)}</p>`
        + (c.lieferungText ? `<p class="ess-zeile">${esc(c.lieferungText)}</p>` : '')
        + (n?.oeffnung ? `<p class="ess-zeile"><b>Öffnungszeiten:</b> ${esc(oeffnungDe(n.oeffnung))} <span class="ess-osm">(OpenStreetMap)</span></p>` : c.oeffnungText ? `<p class="ess-zeile"><b>Öffnungszeiten:</b> ${esc(c.oeffnungText)}</p>` : '')
        + (akt.length ? `<p class="ess-zeile"><b>Aktionen:</b> ${akt.map(esc).join(' · ')}</p><p class="ess-mehr"><button type="button" class="ess-link" data-ess-chip="${c.kette === "Domino's" || c.kette === 'Freddy Fresh' || c.kette === 'Pizza Hut' ? 'pizza' : 'ketten'}">Alle Aktionen ›</button></p>` : '')
        + `<div class="ess-fuss"><a href="${esc(karteUrl(ziel))}" target="_blank" rel="noopener noreferrer">Karte</a>${c.quellen.map(q => `<a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer">${esc(q.name)}</a>`).join('')}${c.geprueft ? `<span class="ess-stand">geprüft ${tmj(c.geprueft)}</span>` : ''}</div></article>`;
    }).join('');
    return `<details class="ess-auf"><summary>Ketten in der Nähe (${ks.length})</summary><p class="ess-unter">Nächste Filiale (Luftlinie ab Döbeln), Lieferung und wiederkehrende Aktionen.</p>${k}</details>`;
  }
  function lokaleHtml(j) {
    if (!S.lok) {
      if (!S.lokLaedt) ladeLokale();
      return S.lokFehler && !S.lokLaedt ? `<p class="ess-leer">${navigator.onLine === false ? 'Keine Verbindung – die Lokale erscheinen, sobald du wieder Netz hast.' : 'Lokale gerade nicht erreichbar. Später noch einmal auf ↻ tippen.'}</p>` : '<p class="ess-leer">Lade Lokale …</p>';
    }
    const f = S.filter, gemerkt = merkSet();
    const alle = alleLokale(j);
    const l = filtereLokale(alle, f, j, gemerkt);
    const zeigen = S.lokMehr ? l : l.slice(0, LOK_ZEIGEN);
    const weit = f.ayce || f.xxl ? Math.max(f.km, WEIT_KM) : f.km;
    const kopf = `<p class="ess-standzeile">${l.length} von ${alle.length} Lokalen · bis ${weit} km${f.ayce || f.xxl ? ' (All-you-can-eat/XXL: bis Leipzig, Chemnitz, Dresden)' : ''}`
      + ` · ${S.lokQuelle === 'radar' && S.lok.osmStand ? `Öffnungszeiten OpenStreetMap, Stand ${tmj(S.lok.osmStand)}` : 'Öffnungszeiten folgen mit dem nächsten Radar-Lauf'}</p>`;
    const neu = S.lok.neu.length ? `<p class="ess-hinweis-box"><b>Neu bei OpenStreetMap:</b> ${S.lok.neu.slice(0, 6).map(x => esc(`${x.name} (${x.ort || 'Umgebung'}${x.km != null ? `, ${kmText(x.km)}` : ''})`)).join(' · ')}</p>` : '';
    const weg = S.lok.weg.length ? `<p class="ess-hinweis-box"><b>Nicht mehr bei OpenStreetMap</b> (vielleicht geschlossen): ${S.lok.weg.slice(0, 6).map(x => esc(x.name)).join(' · ')}</p>` : '';
    const leer = !l.length ? `<p class="ess-leer">${f.merk ? 'Noch nichts gemerkt – tippe auf den Stern an einem Lokal.' : 'Mit diesen Filtern nichts gefunden.'}</p>${f.km < 70 && !f.merk ? '<p class="ess-woanders"><button type="button" class="ess-link" data-ess-f="km" data-ess-v="70">Bis 70 km zeigen</button></p>' : ''}` : '';
    const mehr = l.length > zeigen.length ? `<p class="ess-woanders"><button type="button" class="ess-link" data-ess-lok-mehr>${l.length - zeigen.length} weitere zeigen</button></p>` : '';
    const privat = gemerkt.size ? '<p class="ess-unter">Gemerkt nur auf diesem iPhone. Push am All-you-can-eat-Tag: Claude sagen, welches Lokal.</p>' : '';
    return filterHtml(f) + kopf + neu + weg + zeigen.map(x => lokKarte(x, j, gemerkt)).join('') + leer + mehr + privat + kettenHtml(j)
      + '<p class="ess-hinweis">Bewertungen: so, wie die Portale sie am genannten Tag zeigten – sie ändern sich. „Leute sagen“ fasst sichtbare Bewertungstexte in eigenen Worten zusammen. Karten- und Öffnungsdaten: OpenStreetMap-Mitwirkende (Lizenz ODbL).</p>';
  }
  function regelHtml(j) {
    if (!S.lok && !S.lokLaedt && !S.lokFehler) ladeLokale(); // Ruhetage kommen dazu, sobald die Lokale da sind
    const { tage, immer } = regelTage(S.n, S.lok, j);
    const zeilen = tage.map(t => {
      const z = t.z.map(x => `<li><span class="ess-art${x.art === 'All-you-can-eat' ? ' ess-art-ayce' : ''}">${esc(x.art)}</span><span>${esc(x.was)}${x.wo ? ` <i>· ${esc(x.wo)}</i>` : ''}${x.zeit ? ` <i>· ${esc(x.zeit)}</i>` : ''}</span></li>`);
      if (t.zu.length) z.push(`<li class="ess-zu"><span class="ess-art">Ruhetag</span><span>${esc(t.zu.slice(0, 6).join(' · '))}</span></li>`);
      return `<section class="ess-abschnitt"><h3 class="ess-ab-titel">${esc(wtm(t.iso))}${t.iso === j.iso ? ' · heute' : ''}</h3>${z.length ? `<ul class="ess-regel">${z.join('')}</ul>` : '<p class="ess-unter">Nichts Festes – siehe „Fast täglich“ unten.</p>'}</section>`;
    }).join('');
    const tgl = immer.length ? `<details class="ess-auf"><summary>Fast täglich (${immer.length})</summary><ul class="ess-regel">${immer.map(e => `<li><span class="ess-art${e.rubrik === 'ayce' ? ' ess-art-ayce' : ''}">${esc(ART_REGEL(e))}</span><span>${esc(e.kette ? `${e.kette}: ${e.titel}` : e.titel)} <i>· ${esc(e.wann)}${e.ort ? ` · ${esc(e.ortZusatz || e.ort)}` : ''}${e.km != null ? ` · ${e.km} km` : ''}</i></span></li>`).join('')}</ul></details>` : '';
    return `<p class="ess-unter">Feste Wochentage aus allen Bereichen: All-you-can-eat, Tagesessen, Ketten-Aktionen${S.lok ? ' und Ruhetage der Lokale bis 15 km' : ''}. Einmalige Aktionstage stehen unter „Heute“.</p>` + zeilen + tgl;
  }
  function filterSetzen(k, v) {
    const f = { ...S.filter };
    if (k === 'kueche') f.kueche = f.kueche === v ? '' : v;
    else if (k === 'km') f.km = UMKREIS.includes(Number(v)) ? Number(v) : 30;
    else if (k === 'bew') f.bew = f.bew === Number(v) ? 0 : Number(v);
    else if (k === 'sort') f.sort = v === 'nah' ? 'nah' : 'beste';
    else if (['offen', 'ayce', 'xxl', 'merk'].includes(k)) f[k] = !f[k];
    S.filter = f; S.lokMehr = false;
    merk(FILTER_SPEICHER, f);
    zeichne();
  }
  function merkUmschalten(id) {
    const g = merkSet();
    if (g.has(id)) g.delete(id); else g.add(id);
    S.gemerkt = [...g].slice(-200);
    merk(MERK_SPEICHER, S.gemerkt);
    const b = S.el.querySelector(`[data-ess-merk="${id}"]`);
    if (b && !S.filter.merk) { const an = g.has(id); b.setAttribute('aria-pressed', String(an)); b.setAttribute('aria-label', b.getAttribute('aria-label').replace(/ (nicht mehr merken|merken)$/, an ? ' nicht mehr merken' : ' merken')); }
    else zeichne();
  }
  function chipHtml(k, j) {
    const an = k === S.chip;
    return `<button type="button" class="ess-chip" role="tab" id="ess-c-${k}" data-ess-chip="${k}" aria-controls="ess-liste" aria-selected="${an}" tabindex="${an ? 0 : -1}">`
      + `${esc(chipInfo(k)[1])}${(z => (z === '' ? '' : `<span class="ess-n">${z}</span>`))(zahl(k, j))}</button>`;
  }
  const WARN = { netz: 'gerade offline – letzter Stand', neu: 'neue Fassung da – Seite neu laden', kaputt: 'Datei gerade fehlerhaft – letzter Stand' };
  function standHtml(j = jetztBerlin()) {
    const n = S.n.eintraege.filter(e => !vorbei(e, j.iso)).length;
    return `<p class="ess-standzeile">${S.n.stand ? `Stand ${tmj(S.n.stand)}` : 'Stand unbekannt'} · ${n} Einträge mit Quelle${S.fehler ? ` · <span class="ess-warn">${WARN[S.fehler]}</span>` : ''}</p>`;
  }
  function zeichne() {
    const el = S.el;
    if (!S.n || !S.n.eintraege.length) {
      el.innerHTML = S.laedt ? '<p class="ess-leer ess-erst">Lade Essen …</p>'
        : S.fehler === 'neu' ? '<p class="ess-leer ess-erst">Es gibt eine neue Fassung der Essen-Liste – bitte die Seite neu laden.</p><p class="ess-woanders"><button type="button" class="ess-chip" data-ess-neuladen>Seite neu laden</button></p>'
        : S.fehler === 'kaputt' ? '<p class="ess-leer ess-erst">Die Essen-Datei ist gerade fehlerhaft – bitte später die Seite neu laden.</p>'
        : `<p class="ess-leer ess-erst">${navigator.onLine === false ? 'Keine Verbindung – die Essen-Liste erscheint, sobald du wieder Netz hast.' : 'Essen gerade nicht erreichbar. Später noch einmal auf ↻ tippen.'}</p>`;
      return;
    }
    const j = jetztBerlin();
    if (!chipsDa().includes(S.chip)) S.chip = 'heute';
    const alt0 = el.querySelector('.ess-chips');
    const links = alt0 ? alt0.scrollLeft : null;
    el.innerHTML = `<div class="ess">${standHtml(j)}`
      + `<div class="ess-chips" role="tablist" aria-label="Essen-Bereiche">${chipsDa().map(k => chipHtml(k, j)).join('')}</div>`
      + `<p class="ess-unter">${esc(chipInfo(S.chip)[2])}</p>`
      + `<div class="ess-liste" id="ess-liste" role="tabpanel" aria-labelledby="ess-c-${S.chip}">${listeHtml(S.chip, j)}</div>`
      + `<p class="ess-hinweis">${esc(S.n.hinweis || 'Bedingungen ändern sich – vor Ort prüfen.')} Alles ohne Gewähr, keine Werbung, kein Tracking.</p></div>`;
    const leiste = el.querySelector('.ess-chips');
    if (links != null) leiste.scrollLeft = links; else zeigeChip(leiste, S.chip);
    plane(j);
  }
  /** neu zeichnen um Mitternacht und zum nächsten Uhrzeit-Wechsel (Beginn/Ende eines Fensters heute) */
  function plane(j) {
    clearTimeout(S.uhr);
    const grenzen = [24 * 60];
    for (const e of S.n.eintraege) if (e.zeit && giltAm(e, j.iso)) for (const g of [e.zeit.von, e.zeit.bis, e.zeit.pause?.von, e.zeit.pause?.bis].map(minuten)) if (g != null && g > j.min) grenzen.push(g);
    const ms = (Math.min(...grenzen) - j.min) * 60000 + 1500;
    S.uhr = setTimeout(() => { if (S.el && S.el.isConnected) zeichne(); }, Math.min(Math.max(ms, 30000), 6 * 3600e3));
  }
  function zeigeChip(leiste, k) {
    const c = leiste.querySelector(`[data-ess-chip="${k}"]`);
    if (!c) return;
    const l = c.offsetLeft, r = l + c.offsetWidth;
    if (l < leiste.scrollLeft + 16) leiste.scrollLeft = Math.max(0, l - 16);
    else if (r > leiste.scrollLeft + leiste.clientWidth - 16) leiste.scrollLeft = r - leiste.clientWidth + 16;
  }
  function waehle(k, fokus) {
    if (!S.n || !chipsDa().includes(k)) return;
    S.chip = k;
    merk(CHIP_SPEICHER, k);
    zeichne();
    const leiste = S.el.querySelector('.ess-chips');
    zeigeChip(leiste, k);
    if (fokus) leiste.querySelector(`[data-ess-chip="${k}"]`).focus();
  }

  // --- Laden (gemerkter Stand sofort, dann frisch) --------------------------------------------------------------------------
  async function hol(url) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(url, { cache: 'no-cache', signal: ctl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } finally { clearTimeout(t); }
  }
  const ablageUrl = () => { try { return new URL(S.url, location.href).href; } catch { return S.url; } };
  async function inAblage(s) {
    try { if (typeof caches !== 'undefined') await (await caches.open(ABLAGE)).put(ablageUrl(), new Response(s, { headers: { 'content-type': 'application/json' } })); } catch {}
  }
  async function ausAblage() {
    try { if (typeof caches !== 'undefined') { const r = await (await caches.open(ABLAGE)).match(ablageUrl()); if (r) return await r.text(); } } catch {}
    return null;
  }
  const tauglich = d => d && typeof d === 'object' && Array.isArray(d.eintraege) && !(Number.isInteger(d.version) && d.version > VERSION);
  async function lade() {
    if (!S.el || S.laedt) return;
    if (S.lok && !S.lokLaedt) ladeLokale(); // ↻: Lokale auch frisch
    S.laedt = true;
    if (!S.n) zeichne();
    let was = 'neu';
    try {
      const roh = await hol(S.url);
      let d = null;
      try { d = JSON.parse(roh); } catch {}
      if (!d || typeof d !== 'object' || !Array.isArray(d.eintraege)) throw new Error('kaputt');
      if (!tauglich(d)) throw new Error('neu');
      S.fehler = null;
      merk(KACHEL_SPEICHER, { d: kachelAuszug(d), holZeit: Date.now() });
      const s = JSON.stringify(d);
      if (s === S.roh && S.n) was = 'gleich';
      else {
        inAblage(s);
        S.roh = s; S.n = normalisiere(d);
        try { window.dispatchEvent(new CustomEvent('mein-vorteil-essen')); } catch {} // Start-Kachel neu
      }
    } catch (e) {
      S.fehler = e && (e.message === 'neu' || e.message === 'kaputt') ? e.message : 'netz';
      if (!S.n && S.ablage) await S.ablage;
      was = S.n ? 'stand' : 'neu';
    }
    S.laedt = false;
    if (was === 'neu') zeichne();
    else { const p = S.el.querySelector('.ess-standzeile'); if (p) p.outerHTML = standHtml(); }
  }
  function start(el, opt) {
    if (!el) return;
    if (opt && typeof opt === 'object') S.opt = opt;
    if (S.el === el) { lade(); return; }
    S.el = el;
    if (opt && opt.url) S.url = opt.url;
    if (!document.getElementById('ess-stil')) {
      const st = document.createElement('style');
      st.id = 'ess-stil';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const fl = lies(FILTER_SPEICHER, null);
    if (fl && typeof fl === 'object') S.filter = { ...FILTER_LEER, kueche: KUECHE_FILTER.some(x => x[0] === fl.kueche) ? fl.kueche : '', km: UMKREIS.includes(fl.km) ? fl.km : 30, bew: [4, 4.5].includes(fl.bew) ? fl.bew : 0, offen: fl.offen === true, ayce: fl.ayce === true, xxl: fl.xxl === true, merk: fl.merk === true, sort: fl.sort === 'nah' ? 'nah' : 'beste' };
    const gm = lies(MERK_SPEICHER, []);
    S.gemerkt = Array.isArray(gm) ? gm.filter(x => typeof x === 'string' && /^[a-z0-9-]{2,80}$/.test(x)) : [];
    const c = lies(CHIP_SPEICHER, 'heute');
    S.chip = typeof c === 'string' ? c : 'heute';
    S.ablage = ausAblage().then(roh => {
      if (!roh || S.n) return;
      let d = null;
      try { d = JSON.parse(roh); } catch { return; }
      if (!tauglich(d)) return;
      S.roh = JSON.stringify(d); S.n = normalisiere(d);
      zeichne();
    }).catch(() => {});
    el.addEventListener('click', ev => {
      if (ev.target.closest('[data-ess-neuladen]')) { location.reload(); return; }
      const sp = ev.target.closest('[data-ess-spar]');
      if (sp) { try { S.opt.zuSpartricks?.(sp.dataset.essSpar, sp.dataset.essSparId || null); } catch {} return; }
      const fb = ev.target.closest('[data-ess-f]');
      if (fb) { filterSetzen(fb.dataset.essF, fb.dataset.essV); return; }
      const mb = ev.target.closest('[data-ess-merk]');
      if (mb) { merkUmschalten(mb.dataset.essMerk); return; }
      if (ev.target.closest('[data-ess-lok-mehr]')) { S.lokMehr = true; zeichne(); return; }
      const c2 = ev.target.closest('[data-ess-chip]');
      if (c2 && c2.dataset.essChip !== S.chip) { waehle(c2.dataset.essChip); if (!c2.closest('.ess-chips')) S.el.querySelector('.ess-chips')?.scrollIntoView({ block: 'nearest' }); }
    });
    el.addEventListener('keydown', ev => {
      if (!ev.target.closest || !ev.target.closest('.ess-chips [data-ess-chip]')) return;
      const da = chipsDa(), i = da.indexOf(S.chip);
      const ziel = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: da.length - 1 }[ev.key];
      if (ziel == null) return;
      ev.preventDefault();
      waehle(da[(ziel + da.length) % da.length], true);
    });
    lade();
  }
  /** Radar-Daten neu (Seite hat frisch eingeteilt): nur neu zeichnen, wenn offen und geladen */
  function auffrischen() { if (S.el && S.n) zeichne(); }

  const CSS = `
.ess { padding-top: 2px; }
.ess-standzeile { margin: 4px 4px 8px; font-size: 13px; color: var(--leise); }
.ess-warn { color: var(--warm); }
.ess-chips {
  position: relative; display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none;
  -webkit-overflow-scrolling: touch; margin: 4px -16px 0; padding: 2px 16px 4px;
}
.ess-chips::-webkit-scrollbar { display: none; }
.ess-chip {
  flex: none; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 15px; font-weight: 600; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.ess-chip[aria-selected="true"] { background: var(--akzent); border-color: var(--akzent); color: var(--akzent-text); }
.ess-n {
  font-size: 12px; font-weight: 700; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
  background: var(--akzent-hell); color: var(--akzent); display: inline-flex; align-items: center; justify-content: center; font-variant-numeric: tabular-nums;
}
.ess-chip[aria-selected="true"] .ess-n { background: var(--akzent-text); color: var(--akzent); }
.ess-unter { margin: 8px 4px 10px; font-size: 14px; color: var(--leise); }
.ess-abschnitt { margin: 0 0 6px; }
.ess-ab-titel { margin: 14px 4px 8px; font-size: 15px; font-weight: 800; color: var(--akzent); }
.ess-abschnitt:first-child .ess-ab-titel { margin-top: 2px; }
.ess-karte {
  background: var(--karte); border: 1px solid var(--linie); border-radius: 16px; padding: 12px 14px 10px; margin: 0 0 10px;
  overflow-wrap: anywhere; scroll-margin-top: calc(var(--nav-h, 96px) + 8px);
}
.ess-karte.ess-muster { opacity: .82; border-style: dashed; }
.ess-titel { margin: 2px 0 0; font-size: 17px; line-height: 1.3; font-weight: 700; }
.ess-marken { display: flex; flex-wrap: wrap; gap: 4px 6px; margin: 6px 0 0; }
.ess-marken span { font-size: 12px; font-weight: 650; border-radius: 6px; padding: 2px 7px; line-height: 1.4; }
.ess-kette { background: var(--flaeche); color: var(--text); }
.ess-region { background: var(--akzent-hell); color: var(--akzent); }
.ess-jetzt { background: var(--akzent); color: var(--akzent-text); }
.ess-bald { background: var(--warm-hell); color: var(--warm); }
.ess-gratis { background: #2f4a25; color: #b8f08a; }
.ess-bed { background: var(--flaeche); color: var(--leise); }
.ess-belegt { background: var(--flaeche); color: var(--leise); }
.ess-pruefen { background: var(--rot-hell); color: var(--rot); }
.ess-alt { background: var(--flaeche); color: var(--leise); }
.ess-was { margin: 8px 0 0; font-size: 15px; line-height: 1.4; color: var(--text); font-weight: 600; }
.ess-zeile { margin: 5px 0 0; font-size: 14.5px; line-height: 1.45; color: var(--text); }
.ess-zeile b { color: var(--leise); font-weight: 650; }
.ess-plan b { color: var(--akzent); }
.ess-ort { margin: 5px 0 0; font-size: 13px; color: var(--leise); }
.ess-mehr { margin: 6px 0 0; }
.ess-link {
  min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--linie); background: transparent; color: var(--akzent);
  font: inherit; font-size: 14px; font-weight: 650; cursor: pointer;
}
.ess-fuss { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; margin: 8px 0 0; font-size: 13px; color: var(--leise); }
.ess-ql { margin-right: 2px; }
.ess-fuss a {
  display: inline-flex; align-items: center; max-width: 100%; min-height: 44px; padding: 0 12px; border-radius: 999px;
  background: var(--flaeche); color: var(--text); text-decoration: none; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ess-fuss a:active { background: var(--linie); }
.ess-stand { margin-left: auto; white-space: nowrap; }
.ess-morgen { margin: 0 4px 10px; font-size: 14px; line-height: 1.45; color: var(--text); }
.ess-morgen b { color: var(--akzent); }
.ess-woche { list-style: none; margin: 0 0 10px; padding: 4px 12px; background: var(--karte); border: 1px solid var(--linie); border-radius: 16px; }
.ess-woche li { display: flex; gap: 10px; padding: 7px 0; border-top: 1px solid var(--linie); font-size: 14px; line-height: 1.4; }
.ess-woche li:first-child { border-top: 0; }
.ess-woche li b { flex: none; width: 26px; color: var(--leise); }
.ess-woche li.ess-heute b { color: var(--akzent); }
.ess-woche li span { min-width: 0; }
.ess-auf { margin: 4px 0 10px; }
.ess-auf > summary {
  min-height: 44px; display: flex; align-items: center; padding: 0 14px; border-radius: 14px; background: var(--flaeche); color: var(--text);
  font-weight: 700; font-size: 15px; cursor: pointer; list-style: none; margin-bottom: 10px;
}
.ess-auf > summary::-webkit-details-marker { display: none; }
.ess-auf > summary::after { content: "›"; margin-left: auto; transform: rotate(90deg); color: var(--leise); }
.ess-auf[open] > summary::after { transform: rotate(-90deg); }
.ess-doebeln, .ess-hinweis-box, .ess-spar { margin: 4px 0 12px; padding: 10px 12px; border-radius: 14px; background: var(--akzent-hell); font-size: 14px; line-height: 1.45; color: var(--text); }
.ess-doebeln b { color: var(--akzent); }
.ess-spar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.ess-spar span { flex: 1 1 100%; }
.ess-inline { color: var(--akzent); display: inline-flex; align-items: center; min-height: 44px; min-width: 44px; padding: 0 4px; }
.ess-leer { color: var(--leise); font-size: 15px; padding: 14px 16px; border: 1px dashed var(--linie); border-radius: 16px; margin: 0 0 12px; }
.ess-erst { margin-top: 16px; }
.ess-woanders { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 12px; }
.ess-hinweis { margin: 14px 4px 4px; font-size: 13px; color: var(--leise); }
.ess-filter { margin: 0 0 6px; }
.ess-frei {
  display: flex; gap: 6px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch; margin: 0 -16px 6px; padding: 2px 16px;
}
.ess-frei::-webkit-scrollbar { display: none; }
.ess-f {
  flex: none; min-height: 44px; min-width: 44px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--linie); background: transparent;
  color: var(--text); font: inherit; font-size: 14px; font-weight: 600; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;
}
.ess-f[aria-pressed="true"] { background: var(--akzent-hell); border-color: var(--akzent); color: var(--akzent); }
.ess-stern { width: 15px; height: 15px; fill: currentColor; flex: none; }
.ess-lok-kopf { display: flex; align-items: flex-start; gap: 8px; }
.ess-lok-kopf .ess-titel { flex: 1; min-width: 0; padding-top: 8px; }
.ess-zusatz { font-weight: 500; color: var(--leise); font-size: 15px; }
.ess-merk {
  flex: none; width: 44px; height: 44px; margin: -2px -6px 0 0; border-radius: 999px; border: 0; background: transparent; color: var(--leise);
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
}
.ess-merk .ess-stern { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linejoin: round; }
.ess-merk[aria-pressed="true"] { color: var(--warm); }
.ess-merk[aria-pressed="true"] .ess-stern { fill: currentColor; }
.ess-bew { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; margin: 6px 0 0; font-size: 14px; color: var(--leise); }
.ess-bw { display: inline-flex; align-items: center; gap: 4px; color: var(--warm); }
.ess-bw b { color: var(--text); font-size: 16px; }
.ess-bew a { color: var(--akzent); min-height: 44px; display: inline-flex; align-items: center; padding: 0 2px; }
.ess-bw-stand { font-size: 12.5px; }
.ess-was b { color: var(--leise); font-weight: 650; }
.ess-osm { font-size: 12px; color: var(--leise); }
.ess-regel { list-style: none; margin: 0 0 8px; padding: 4px 12px; background: var(--karte); border: 1px solid var(--linie); border-radius: 16px; }
.ess-regel li { display: flex; gap: 10px; align-items: baseline; padding: 8px 0; border-top: 1px solid var(--linie); font-size: 14.5px; line-height: 1.4; }
.ess-regel li:first-child { border-top: 0; }
.ess-regel i { font-style: normal; color: var(--leise); }
.ess-art { flex: none; width: 112px; font-size: 12px; font-weight: 700; color: var(--leise); text-transform: none; }
.ess-art-ayce { color: var(--warm); }
.ess-zu span:last-child { color: var(--leise); }
`;

  window.MeinVorteilEssen = {
    start, lade, auffrischen,
    get gestartet() { return !!S.el; },
    // für Tests (ohne Browser): reine Funktionen
    _intern: { normLokale, oeffnungPlan, oeffnungJetzt, filtereLokale, regelTage, lokaleAusEintraegen, rangWert, KUECHE_FILTER, normalisiere, giltAm, naechsterTag, heuteStatus, heuteTeile, liste, kachelAuszug, kachelZeilen, jetztBerlin, sicherUrl, CHIPS, REGIONEN, CSS: () => CSS },
  };
})();
