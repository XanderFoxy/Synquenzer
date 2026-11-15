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

  // --- Zustand -----------------------------------------------------------------------------------------------------------
  const S = { el: null, n: null, roh: null, chip: null, laedt: false, fehler: null, url: DATEI, ablage: null, opt: {}, uhr: null };
  const live = () => { try { const l = S.opt.live ? S.opt.live() : []; return Array.isArray(l) ? l.filter(x => x && typeof x.titel === 'string') : []; } catch { return []; } };
  const chipsDa = () => (live().length ? [...CHIPS.map(c => c[0]), 'aktuell'] : CHIPS.map(c => c[0]));
  const chipInfo = k => (k === 'aktuell' ? AKTUELL : CHIPS.find(c => c[0] === k) || CHIPS[0]);
  function zahl(k, j) {
    if (k === 'aktuell') return live().length;
    if (k === 'heute') return heuteTeile(S.n, j).heute.filter(x => x.s !== 'vorbei').length;
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
  function chipHtml(k, j) {
    const an = k === S.chip;
    return `<button type="button" class="ess-chip" role="tab" id="ess-c-${k}" data-ess-chip="${k}" aria-controls="ess-liste" aria-selected="${an}" tabindex="${an ? 0 : -1}">`
      + `${esc(chipInfo(k)[1])}<span class="ess-n">${zahl(k, j)}</span></button>`;
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
      const c2 = ev.target.closest('[data-ess-chip]');
      if (c2 && c2.dataset.essChip !== S.chip) waehle(c2.dataset.essChip);
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
`;

  window.MeinVorteilEssen = {
    start, lade, auffrischen,
    get gestartet() { return !!S.el; },
    // für Tests (ohne Browser): reine Funktionen
    _intern: { normalisiere, giltAm, naechsterTag, heuteStatus, heuteTeile, liste, kachelAuszug, kachelZeilen, jetztBerlin, sicherUrl, CHIPS, REGIONEN, CSS: () => CSS },
  };
})();
