/* Mein Vorteil – Reiter „Spartricks“: kuratierte Spar-Tipps mit Quellen (Top 10 · Geld zurück · Clever einkaufen ·
   Gratis & Proben · Geburtstag gratis · Freizeit & Reisen · Gewinnspiele), Suche, „gemerkt“-Stern.
   Eine Datei für Logik + CSS (Präfix .sp-); nutzt nur die CSS-Variablen der Seite
   (--karte --flaeche --text --leise --schwach --linie --akzent --akzent-hell --akzent-text --warm --warm-hell).
   Einbau (mein-vorteil/index.html):
     MeinVorteilSpartricks.start(element)   beim ersten Öffnen des Reiters (letzter Stand sofort, dann frisch)
     MeinVorteilSpartricks.lade()           bei „Neu laden“
   Daten: spartricks.json (statisch, gleicher Ordner, versioniert mit „stand“). Nur beim Öffnen geholt – die Startseite
   holt sie nie (lazy). Der letzte Stand liegt im Cache Storage („mv-spartricks“, nicht im localStorage, den sich die
   Seite mit dem Synquenzer teilt); die Start-Kachel liest nur einen kleinen Auszug (mein-vorteil-spartricks-kachel,
   wenige KB). Gemerkt, gewählter Chip und Geburtstag nur im localStorage dieses Geräts – nichts davon geht ans Netz.
   Kein Tracking, keine fremden Skripte; Quellen öffnen mit rel="noopener noreferrer". */
(function () {
  'use strict';
  const DATEI = 'spartricks.json';
  const SPEICHER_ALT = 'mein-vorteil-daten-spartricks'; // bis 15.11.2026: ganze Datei im localStorage (~107 000 Zeichen) – nur noch gelesen, dann gelöscht
  const KACHEL_SPEICHER = 'mein-vorteil-spartricks-kachel'; // { d: { stand, tipps: [{ id, titel, nutzen, top?, sicherheit?, bis? }] }, holZeit } für die Start-Kachel
  const ABLAGE = 'mv-spartricks'; // Cache Storage; Name ohne „mein-vorteil-“, sonst räumt sw.js ihn beim Aktivieren weg
  const CHIP_SPEICHER = 'mein-vorteil-spartricks-chip';
  const STERN_SPEICHER = 'mein-vorteil-spartricks-gemerkt'; // [id, …]
  const GEB_SPEICHER = 'mein-vorteil-spartricks-geburtstag'; // „MM-TT“ (ohne Jahr)
  const VERSION = 1; // höchste Daten-Fassung, die diese Seite versteht
  const REGIONEN = ['Döbeln', 'Leipzig', 'Dresden', 'Chemnitz', 'Sachsen', 'bundesweit'];
  const BEREICHE = [ // Reihenfolge nach Auftrag (15.11.2026); Name/Text kommen sonst aus den Daten
    ['top', 'Top 10', 'Die zehn Tipps mit dem meisten Geld – Fristen zuerst.'],
    ['geld', 'Geld zurück', 'Erstattungen, Entschädigungen, Steuer, Verträge und Abos.'],
    ['einkaufen', 'Clever einkaufen', 'Payback, Coupons, Apps, Abverkauf und Preisschilder richtig lesen.'],
    ['gratis', 'Gratis & Proben', 'Gratis testen, Proben, Lebensmittel retten, leihen und verschenken.'],
    ['geburtstag', 'Geburtstag gratis', 'Was es am Geburtstag gratis gibt – und wann du dich am besten vorher anmeldest.'],
    ['freizeit', 'Freizeit & Reisen', 'Bahn, Kino, Museen, Thermen und Reisen günstiger.'],
    ['gewinnspiele', 'Gewinnspiele', 'Wo sich Mitmachen lohnt – und wie du Fakes erkennst.'],
  ];
  const GEMERKT = ['gemerkt', 'Gemerkt', 'Deine gemerkten Tipps – nur auf diesem Gerät.']; // Chip nur, wenn etwas gemerkt ist
  const TOP_N = 10;

  // --- kleine Helfer ---------------------------------------------------------------------------------------------------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lies = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const merk = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const text = (v, max = 1200) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
  function sicherUrl(u) { // nur echte https-Adressen
    if (typeof u !== 'string') return null;
    try { const x = new URL(u.trim()); return x.protocol === 'https:' && x.hostname.includes('.') ? x.href : null; } catch { return null; }
  }
  const isoTag = v => (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00Z')) ? v : null);
  let FMT = null;
  function heute(t = Date.now()) { // „2026-11-15“ in Berliner Zeit
    FMT = FMT || new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' });
    const o = {};
    for (const p of FMT.formatToParts(new Date(t))) o[p.type] = p.value;
    return `${o.year}-${o.month}-${o.day}`;
  }
  const tageZwischen = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
  const plusTage = (iso, n) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
  const tm = iso => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`; // „30.11.“
  const tmj = iso => `${tm(iso)}${iso.slice(0, 4)}`;
  const faltung = s => String(s || '').toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9€%]+/g, ' ').trim();
  const kurzName = n => { const k = String(n).split(/\s[–—-]\s|:\s/)[0].trim(); return k.length > 2 ? k : String(n); }; // „Finanztip – …“ -> „Finanztip“
  /** Knopf-Texte der Quellen einer Karte: kurz („Finanztip“); heißen zwei gleich („mydealz · mydealz“), kommt das Thema dazu */
  function quellNamen(qs) {
    const k = qs.map(q => kurzName(q.name));
    const l = qs.map((q, i) => {
      if (k.filter(x => x === k[i]).length < 2) return k[i];
      let rest = String(q.name).slice(k[i].length).replace(/^\s*(?:[–—-]|:)\s*/, '').trim();
      if (rest.length > 26) rest = rest.slice(0, 26).replace(/\s+\S*$/, '') + ' …';
      return rest ? `${k[i]}: ${rest}` : k[i];
    });
    // immer noch gleich (gleicher Anfang): durchzählen
    return l.map((x, i) => (l.filter(y => y === x).length < 2 ? x : `${x.replace(/ …$/, '')} (${l.slice(0, i + 1).filter(y => y === x).length})`));
  }

  // --- Daten tolerant lesen ------------------------------------------------------------------------------------------
  function normalisiere(d) {
    const ok = d && typeof d === 'object' && !Array.isArray(d);
    const namen = new Map(BEREICHE.map(([k, n, u]) => [k, { name: n, text: u }]));
    for (const b of ok && Array.isArray(d.bereiche) ? d.bereiche : []) {
      if (b && namen.has(b.id)) namen.set(b.id, { name: text(b.name, 40) || namen.get(b.id).name, text: text(b.text, 200) || namen.get(b.id).text });
    }
    const ids = new Set(), tipps = [];
    for (const t of ok && Array.isArray(d.tipps) ? d.tipps : []) {
      if (!t || typeof t !== 'object') continue;
      const id = typeof t.id === 'string' && /^[a-z0-9-]{2,60}$/.test(t.id) ? t.id : null;
      const titel = text(t.titel, 160), so = text(t.text, 1200);
      if (!id || ids.has(id) || !titel || !so || !namen.has(t.bereich) || t.bereich === 'top') continue; // ohne Pflichtfeld oder doppelt: weg
      ids.add(id);
      const quellen = [];
      for (const q of Array.isArray(t.quellen) ? t.quellen : []) {
        const url = sicherUrl(q && q.url);
        if (url && !quellen.some(x => x.url === url)) quellen.push({ name: text(q.name, 160) || new URL(url).hostname, url });
      }
      const region = (Array.isArray(t.region) ? t.region : []).filter(r => REGIONEN.includes(r));
      const a = t.anmelden && typeof t.anmelden === 'object' ? t.anmelden : null;
      const tage = a && Number.isInteger(a.tage) && a.tage >= 0 && a.tage <= 120 ? a.tage : null;
      tipps.push({
        id, bereich: t.bereich, titel, text: so, nutzen: text(t.nutzen, 300), quellen,
        top: Number.isInteger(t.top) && t.top > 0 ? t.top : null, stand: text(t.stand, 80),
        sicher: t.sicherheit === 'belegt', region: region.length ? [...new Set(region)] : ['bundesweit'], ort: text(t.ort, 160),
        bis: isoTag(t.bis), einmalig: t.einmalig === true, aktionBis: isoTag(t.aktionBis), art: t.art === 'anleitung' ? 'anleitung' : null,
        anmelden: tage != null ? { tage, text: text(a.text, 200) } : null,
      });
    }
    return {
      version: ok && Number.isInteger(d.version) ? d.version : null, stand: ok ? isoTag(d.stand) : null,
      hinweis: ok ? text(d.hinweis, 400) : '', namen, tipps,
    };
  }
  const laeuft = (t, h) => !t.bis || t.bis >= h;
  const erledigt = (t, h) => t.einmalig && !laeuft(t, h); // einmalige Frist (z. B. Steuer 2022) vorbei: kommt nie wieder -> nicht mehr zeigen
  /** Tipps eines Chips in Anzeige-Reihenfolge (Top-Tipps zuerst = Reihenfolge der Daten; jährliche Frist vorbei ans Ende) */
  function liste(n, chip, h = heute(), gemerkt = []) {
    if (chip === 'top') return n.tipps.filter(t => t.top != null && laeuft(t, h)).sort((a, b) => a.top - b.top).slice(0, TOP_N);
    if (chip === 'gemerkt') { const g = new Set(gemerkt); return n.tipps.filter(t => g.has(t.id)); }
    const l = n.tipps.filter(t => t.bereich === chip && !erledigt(t, h));
    return [...l.filter(t => laeuft(t, h)), ...l.filter(t => !laeuft(t, h))];
  }
  /** Suche: alle Wörter müssen vorkommen (ä = ae = a, Groß/klein egal) – in Titel, Text, Nutzen, Region, Ort, Quellen */
  function passt(t, q, n) {
    const w = faltung(q).split(' ').filter(Boolean);
    if (!w.length) return true;
    const heu = faltung([t.titel, t.text, t.nutzen, t.region.join(' '), t.ort, n.namen.get(t.bereich)?.name, t.quellen.map(x => x.name).join(' '), t.anmelden?.text].join(' '));
    const heu2 = heu.replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
    return w.every(x => heu.includes(x) || heu2.includes(x.replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u')));
  }
  /** nächster Geburtstag (ISO) ab heute für „MM-TT“ */
  function naechsterGeburtstag(mmtt, h = heute()) {
    if (!/^\d\d-\d\d$/.test(mmtt || '')) return null;
    for (const j of [Number(h.slice(0, 4)), Number(h.slice(0, 4)) + 1, Number(h.slice(0, 4)) + 2]) {
      const iso = `${j}-${mmtt}`;
      if (!isoTag(iso) || new Date(iso + 'T00:00:00Z').toISOString().slice(0, 10) !== iso) continue; // 29.02. nur im Schaltjahr
      if (iso >= h) return iso;
    }
    return null;
  }
  /** „Am besten anmelden bis …“ – Zeile für eine Geburtstags-Karte. Der Vorlauf (anmelden.tage) ist eine Faustregel
      (2–4 Wochen, weil Coupons erst nach Tagen erscheinen), keine Frist des Anbieters – so steht es auch da. */
  function anmeldeZeile(t, geb, h = heute()) {
    const a = t.anmelden;
    if (!a) return '';
    if (a.tage === 0) {
      const rest = a.text.replace(/^keine Anmeldung\s*[–-]\s*/i, '');
      return /^keine Anmeldung/i.test(a.text) ? `<b>Ohne Anmeldung</b> – ${esc(rest)}` : `<b>Vorher:</b> ${esc(a.text)}`;
    }
    const wann = a.tage % 7 === 0 ? `${a.tage / 7} ${a.tage === 7 ? 'Woche' : 'Wochen'}` : `${a.tage} Tage`;
    if (!geb) return `<b>Rechtzeitig anmelden:</b> Faustregel ${wann} vor dem Geburtstag – ${esc(a.text)}`;
    const bis = plusTage(geb, -a.tage);
    if (bis >= h) return `<b>Am besten anmelden bis ${tm(bis)}</b> (Faustregel ${wann} vorher) – ${esc(a.text)}`;
    return `<b>Jetzt anmelden</b> – Faustregel wäre ${wann} vorher, der Geburtstag ist in ${tageZwischen(h, geb)} ${tageZwischen(h, geb) === 1 ? 'Tag' : 'Tagen'}: ${esc(a.text)}`;
  }

  // --- Zustand -----------------------------------------------------------------------------------------------------------
  const S = { el: null, n: null, roh: null, chip: null, q: '', laedt: false, fehler: null, url: DATEI, gemerkt: [], geb: null, ablage: null };
  function chipsDa() {
    const da = BEREICHE.map(([k]) => k);
    return S.gemerkt.some(id => S.n.tipps.some(t => t.id === id)) ? [...da, 'gemerkt'] : da;
  }
  const chipName = k => (k === 'gemerkt' ? GEMERKT[1] : S.n.namen.get(k)?.name || k);
  const chipText = k => (k === 'gemerkt' ? GEMERKT[2] : S.n.namen.get(k)?.text || '');
  function treffer(k) { return liste(S.n, k, heute(), S.gemerkt).filter(t => passt(t, S.q, S.n)); }

  // --- Zeichnen ----------------------------------------------------------------------------------------------------------
  const STERN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8z"/></svg>';
  function karte(t, chip, h = heute()) {
    const an = S.gemerkt.includes(t.id);
    const marken = [];
    const zeigeRegion = chip === 'geburtstag' || t.region.some(r => r !== 'bundesweit');
    if (zeigeRegion) for (const r of t.region) marken.push(`<span class="sp-region${r === 'bundesweit' ? ' sp-weit' : ''}">${esc(r)}</span>`);
    if (t.art === 'anleitung') marken.push('<span class="sp-anleitung">Anleitung</span>');
    if (t.bis) {
      if (laeuft(t, h)) { const d = tageZwischen(h, t.bis); marken.push(`<span class="sp-frist">Frist: bis ${tm(t.bis)}${d <= 60 ? ` · noch ${d === 0 ? 'heute' : d === 1 ? '1 Tag' : `${d} Tage`}` : ''}</span>`); }
      else marken.push(`<span class="sp-frist sp-vorbei">${t.einmalig ? 'Frist abgelaufen' : 'Frist für dieses Jahr vorbei'}</span>`);
    }
    if (t.aktionBis) marken.push(t.aktionBis >= h ? `<span class="sp-aktion">Aktion bis ${tmj(t.aktionBis)}</span>` : '<span class="sp-aktion sp-vorbei">Aktion vorbei? Beim Anbieter prüfen</span>');
    if (!t.sicher) marken.push('<span class="sp-erfahrung">Erfahrung aus der Community</span>');
    const namen = quellNamen(t.quellen);
    const quellen = t.quellen.map((q, i) => `<a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer" title="${esc(q.name)}">${esc(namen[i])}</a>`).join('');
    return `<article class="sp-karte${t.top != null && chip === 'top' ? ' sp-top' : ''}" id="sp-${esc(t.id)}" data-sp-id="${esc(t.id)}">`
      + `<div class="sp-kopf"><h3 class="sp-titel">${chip === 'top' ? `<span class="sp-platz">${t.top}</span>` : ''}${esc(t.titel)}</h3>`
      + `<button type="button" class="sp-stern" data-sp-stern="${esc(t.id)}" aria-pressed="${an}" aria-label="${an ? 'Gemerkt – nicht mehr merken' : 'Merken'}">${STERN}</button></div>`
      + (marken.length ? `<p class="sp-marken">${marken.join('')}</p>` : '')
      + (t.ort && zeigeRegion ? `<p class="sp-ort">${esc(t.ort)}</p>` : '')
      + (t.nutzen ? `<p class="sp-nutzen"><b>Bringt:</b> ${esc(t.nutzen)}</p>` : '')
      + `<p class="sp-so"><b>So geht’s:</b> ${esc(t.text)}</p>`
      + (chip === 'geburtstag' && t.anmelden ? `<p class="sp-anmelden">${anmeldeZeile(t, S.geb ? naechsterGeburtstag(S.geb, h) : null, h)}</p>` : '')
      + `<div class="sp-fuss">${quellen ? `<span class="sp-ql">Quellen</span>${quellen}` : ''}${t.stand ? `<span class="sp-stand">Stand ${esc(t.stand)}</span>` : ''}</div>`
      + '</article>';
  }
  function gebHtml() {
    const g = S.geb ? naechsterGeburtstag(S.geb) : null;
    const wert = g || '';
    const d = g ? tageZwischen(heute(), g) : null;
    return `<div class="sp-geb"><label for="sp-geb-tag">Dein nächster Geburtstag</label>`
      + `<input type="date" id="sp-geb-tag" value="${esc(wert)}" min="${heute()}">`
      + `<p class="sp-geb-info">${g ? (d === 0 ? 'Heute – alles Gute!' : `in ${d} ${d === 1 ? 'Tag' : 'Tagen'} – darunter steht, bis wann du dich am besten anmeldest (Faustregel, keine Frist des Anbieters).`) : 'Trag ihn ein, dann steht an jeder Karte, bis wann du dich am besten anmeldest.'} Nur auf diesem Gerät gemerkt.</p></div>`;
  }
  function listeHtml(k) {
    const l = treffer(k);
    const vorne = k === 'geburtstag' ? gebHtml() : '';
    if (l.length) return vorne + (S.q ? `<p class="sp-trefferzahl">${l.length} ${l.length === 1 ? 'Treffer' : 'Treffer'} für „${esc(S.q)}“</p>` : '') + l.map(t => karte(t, k)).join('');
    if (S.q) {
      const woanders = chipsDa().filter(c => c !== k).map(c => [c, treffer(c).length]).filter(([, z]) => z > 0);
      return vorne + `<p class="sp-leer">Keine Treffer für „${esc(S.q)}“ unter „${esc(chipName(k))}“.`
        + (woanders.length ? ` Dafür hier:</p><p class="sp-woanders">${woanders.map(([c, z]) => `<button type="button" class="sp-chip" data-sp-chip="${c}">${esc(chipName(c))}<span class="sp-n">${z}</span></button>`).join('')}</p>` : '</p>');
    }
    return vorne + `<p class="sp-leer">${k === 'gemerkt' ? 'Noch nichts gemerkt – tippe auf den Stern einer Karte.' : 'Hier steht gerade nichts.'}</p>`;
  }
  function chipHtml(k) {
    const an = k === S.chip;
    const z = S.q ? treffer(k).length : liste(S.n, k, heute(), S.gemerkt).length;
    return `<button type="button" class="sp-chip${S.q && !z ? ' sp-ohne' : ''}" role="tab" id="sp-c-${k}" data-sp-chip="${k}" aria-controls="sp-liste" aria-selected="${an}" tabindex="${an ? 0 : -1}">`
      + `${k === 'gemerkt' ? STERN : ''}${esc(chipName(k))}<span class="sp-n">${z}</span></button>`;
  }
  const WARN = { netz: 'gerade offline – letzter Stand', neu: 'neue Fassung da – Seite neu laden', kaputt: 'Datei gerade fehlerhaft – letzter Stand' };
  function standHtml() {
    const s = S.n.stand ? `Stand der Tipps: ${tmj(S.n.stand)}` : 'Stand unbekannt';
    const h = heute();
    return `<p class="sp-standzeile">${s} · ${S.n.tipps.filter(t => !erledigt(t, h)).length} Tipps mit Quellen${S.fehler ? ` · <span class="sp-warn">${WARN[S.fehler]}</span>` : ''}</p>`;
  }
  function zeichne() {
    const el = S.el;
    if (!S.n || !S.n.tipps.length) {
      el.innerHTML = S.laedt ? '<p class="sp-leer sp-erst">Lade Spartricks …</p>'
        : S.fehler === 'neu' ? '<p class="sp-leer sp-erst">Es gibt eine neue Fassung der Spartricks – bitte die Seite neu laden.</p><p class="sp-woanders"><button type="button" class="sp-chip" data-sp-neuladen>Seite neu laden</button></p>'
        : S.fehler === 'kaputt' ? '<p class="sp-leer sp-erst">Die Spartricks-Datei ist gerade fehlerhaft – bitte später die Seite neu laden.</p>'
        : `<p class="sp-leer sp-erst">${navigator.onLine === false ? 'Keine Verbindung – die Spartricks erscheinen, sobald du wieder Netz hast.' : 'Spartricks gerade nicht erreichbar. Später noch einmal auf ↻ tippen.'}</p>`;
      return;
    }
    if (!chipsDa().includes(S.chip)) S.chip = 'top';
    const alt = el.querySelector('.sp-chips');
    const links = alt ? alt.scrollLeft : null;
    const fokusSuche = document.activeElement && document.activeElement.id === 'sp-suche';
    el.innerHTML = `<div class="sp">${standHtml()}`
      + `<div class="sp-suchzeile"><label class="sp-unsichtbar" for="sp-suche">Spartricks durchsuchen</label>`
      + `<input type="search" id="sp-suche" class="sp-suche" placeholder="Suchen: Bahn, Payback, Döbeln …" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" maxlength="60" value="${esc(S.q)}"></div>`
      + `<div class="sp-chips" role="tablist" aria-label="Spartricks-Bereiche">${chipsDa().map(chipHtml).join('')}</div>`
      + `<p class="sp-unter">${esc(chipText(S.chip))}</p>`
      + `<div class="sp-liste" id="sp-liste" role="tabpanel" aria-labelledby="sp-c-${S.chip}">${listeHtml(S.chip)}</div>`
      + `<p class="sp-hinweis">${esc(S.n.hinweis || 'Bedingungen ändern sich – vor dem Nutzen beim Anbieter prüfen.')} Alles ohne Gewähr, keine Werbung, kein Tracking.</p></div>`;
    const leiste = el.querySelector('.sp-chips');
    if (links != null) leiste.scrollLeft = links; else zeigeChip(leiste, S.chip);
    if (fokusSuche) { const i = el.querySelector('#sp-suche'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }
  function zeigeChip(leiste, k) {
    const c = leiste.querySelector(`[data-sp-chip="${k}"]`);
    if (!c) return;
    const l = c.offsetLeft, r = l + c.offsetWidth;
    if (l < leiste.scrollLeft + 16) leiste.scrollLeft = Math.max(0, l - 16);
    else if (r > leiste.scrollLeft + leiste.clientWidth - 16) leiste.scrollLeft = r - leiste.clientWidth + 16;
  }
  function neuListe() { // Liste + Zähler der Chips neu (Suche, Stern), Suchfeld bleibt stehen
    const el = S.el;
    const leiste = el.querySelector('.sp-chips');
    if (!leiste) { zeichne(); return; }
    const links = leiste.scrollLeft;
    if (!chipsDa().includes(S.chip)) S.chip = 'top';
    leiste.innerHTML = chipsDa().map(chipHtml).join('');
    leiste.scrollLeft = links;
    el.querySelector('.sp-unter').textContent = chipText(S.chip);
    const l = el.querySelector('#sp-liste');
    l.setAttribute('aria-labelledby', `sp-c-${S.chip}`);
    l.innerHTML = listeHtml(S.chip);
  }
  function waehle(k, fokus) {
    if (!S.n || !chipsDa().includes(k)) return;
    S.chip = k;
    merk(CHIP_SPEICHER, k);
    neuListe();
    const leiste = S.el.querySelector('.sp-chips');
    zeigeChip(leiste, k);
    if (fokus) leiste.querySelector(`[data-sp-chip="${k}"]`).focus();
  }
  function stern(id) {
    const an = S.gemerkt.includes(id);
    S.gemerkt = an ? S.gemerkt.filter(x => x !== id) : [...S.gemerkt, id];
    merk(STERN_SPEICHER, S.gemerkt);
    // nur Knopf + Chips umschalten (die Liste springt nicht), außer im Chip „Gemerkt“
    if (S.chip === 'gemerkt' && an) { neuListe(); return; }
    for (const b of S.el.querySelectorAll(`[data-sp-stern="${CSS_ESC(id)}"]`)) { b.setAttribute('aria-pressed', String(!an)); b.setAttribute('aria-label', !an ? 'Gemerkt – nicht mehr merken' : 'Merken'); }
    const leiste = S.el.querySelector('.sp-chips');
    const links = leiste.scrollLeft;
    leiste.innerHTML = chipsDa().map(chipHtml).join('');
    leiste.scrollLeft = links;
  }
  const CSS_ESC = s => String(s).replace(/["\\]/g, '\\$&');

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
  // letzter Stand: Cache Storage (eigener Browser-Speicher, kein localStorage); alter localStorage-Stand nur zum Übergang
  const ablageUrl = () => { try { return new URL(S.url, location.href).href; } catch { return S.url; } };
  async function inAblage(s) {
    try { if (typeof caches !== 'undefined') await (await caches.open(ABLAGE)).put(ablageUrl(), new Response(s, { headers: { 'content-type': 'application/json' } })); } catch {}
  }
  async function ausAblage() {
    try {
      if (typeof caches !== 'undefined') { const r = await (await caches.open(ABLAGE)).match(ablageUrl()); if (r) return await r.text(); }
    } catch {}
    const alt = lies(SPEICHER_ALT, null);
    if (!alt || !alt.d) return null;
    const s = JSON.stringify(alt.d);
    inAblage(s);
    return s;
  }
  /** kleiner Auszug für die Start-Kachel („Tipp des Tages“ + nächste Frist) statt der ganzen Datei im localStorage */
  function kachelAuszug(d) {
    const tipps = [];
    for (const t of d.tipps) {
      if (!t || typeof t.id !== 'string' || typeof t.titel !== 'string' || !(Number.isInteger(t.top) || t.sicherheit === 'belegt' || isoTag(t.bis))) continue;
      const k = { id: t.id, titel: text(t.titel, 120), nutzen: text(t.nutzen, 160) };
      if (Number.isInteger(t.top)) k.top = t.top;
      if (t.sicherheit === 'belegt') k.sicherheit = 'belegt';
      if (isoTag(t.bis)) k.bis = t.bis;
      tipps.push(k);
    }
    return { stand: isoTag(d.stand), tipps };
  }
  function merkKachel(d) {
    merk(KACHEL_SPEICHER, { d: kachelAuszug(d), holZeit: Date.now() });
    try { localStorage.removeItem(SPEICHER_ALT); } catch {}
  }
  const tauglich = d => d && typeof d === 'object' && Array.isArray(d.tipps) && !(Number.isInteger(d.version) && d.version > VERSION);
  async function lade() {
    if (!S.el || S.laedt) return;
    S.laedt = true;
    if (!S.n) zeichne();
    let was = 'neu';
    try {
      const roh = await hol(S.url);
      let d = null;
      try { d = JSON.parse(roh); } catch {}
      if (!d || typeof d !== 'object' || !Array.isArray(d.tipps)) throw new Error('kaputt');
      if (!tauglich(d)) throw new Error('neu');
      S.fehler = null;
      merkKachel(d);
      const s = JSON.stringify(d);
      if (s === S.roh && S.n) was = 'gleich';
      else {
        inAblage(s);
        S.roh = s; S.n = normalisiere(d);
        try { window.dispatchEvent(new CustomEvent('mein-vorteil-spartricks')); } catch {} // Start-Kachel neu (Tipp des Tages)
      }
    } catch (e) {
      S.fehler = e && (e.message === 'neu' || e.message === 'kaputt') ? e.message : 'netz';
      if (!S.n && S.ablage) await S.ablage; // letzter Stand noch unterwegs: erst ihn zeigen, nicht „nicht erreichbar“
      was = S.n ? 'stand' : 'neu';
    }
    S.laedt = false;
    if (was === 'neu') zeichne();
    else { const p = S.el.querySelector('.sp-standzeile'); if (p) p.outerHTML = standHtml(); }
  }
  function start(el, opt) {
    if (!el) return;
    if (S.el === el) { lade(); return; }
    S.el = el;
    if (opt && opt.url) S.url = opt.url;
    if (!document.getElementById('sp-stil')) {
      const st = document.createElement('style');
      st.id = 'sp-stil';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const g = lies(STERN_SPEICHER, []);
    S.gemerkt = Array.isArray(g) ? g.filter(x => typeof x === 'string').slice(0, 300) : [];
    const gb = lies(GEB_SPEICHER, null);
    S.geb = typeof gb === 'string' && /^\d\d-\d\d$/.test(gb) ? gb : null;
    const c = lies(CHIP_SPEICHER, 'top');
    S.chip = typeof c === 'string' ? c : 'top';
    // letzter Stand sofort (parallel zum Netz); kommt das Netz zuerst, bleibt es dabei
    S.ablage = ausAblage().then(roh => {
      if (!roh || S.n) return;
      let d = null;
      try { d = JSON.parse(roh); } catch { return; }
      if (!tauglich(d)) return;
      S.roh = JSON.stringify(d); S.n = normalisiere(d);
      zeichne();
    }).catch(() => {});
    el.addEventListener('click', ev => {
      if (ev.target.closest('[data-sp-neuladen]')) { location.reload(); return; }
      const s = ev.target.closest('[data-sp-stern]');
      if (s) { stern(s.dataset.spStern); return; }
      const c2 = ev.target.closest('[data-sp-chip]');
      if (c2 && (c2.dataset.spChip !== S.chip || c2.closest('.sp-woanders'))) waehle(c2.dataset.spChip);
    });
    el.addEventListener('keydown', ev => {
      if (!ev.target.closest || !ev.target.closest('.sp-chips [data-sp-chip]')) return;
      const da = chipsDa(), i = da.indexOf(S.chip);
      const ziel = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: da.length - 1 }[ev.key];
      if (ziel == null) return;
      ev.preventDefault();
      waehle(da[(ziel + da.length) % da.length], true);
    });
    let warte = null;
    el.addEventListener('input', ev => {
      if (ev.target.id === 'sp-suche') {
        clearTimeout(warte);
        warte = setTimeout(() => { S.q = ev.target.value.slice(0, 60); neuListe(); }, 120);
      }
    });
    el.addEventListener('change', ev => {
      if (ev.target.id !== 'sp-geb-tag') return;
      const m = /^\d{4}-(\d\d-\d\d)$/.exec(ev.target.value || '');
      S.geb = m ? m[1] : null;
      merk(GEB_SPEICHER, S.geb);
      neuListe();
    });
    el.addEventListener('submit', ev => ev.preventDefault());
    lade();
  }

  const CSS = `
.sp { padding-top: 2px; }
.sp-standzeile { margin: 4px 4px 8px; font-size: 13px; color: var(--leise); }
.sp-warn { color: var(--warm); }
.sp-suchzeile { margin: 0 0 4px; }
.sp-suche {
  width: 100%; min-height: 46px; padding: 0 14px; border-radius: 14px; border: 1px solid var(--linie); background: var(--karte);
  color: var(--text); font: inherit; font-size: 16px; -webkit-appearance: none; appearance: none;
}
.sp-suche::placeholder { color: var(--schwach); }
.sp-suche:focus { outline: 2px solid var(--akzent); outline-offset: 1px; }
.sp-unsichtbar { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.sp-chips {
  position: relative; display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none;
  -webkit-overflow-scrolling: touch; margin: 8px -16px 0; padding: 2px 16px 4px;
}
.sp-chips::-webkit-scrollbar { display: none; }
.sp-chip {
  flex: none; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 15px; font-weight: 600; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.sp-chip svg { width: 16px; height: 16px; fill: currentColor; }
.sp-chip[aria-selected="true"] { background: var(--akzent); border-color: var(--akzent); color: var(--akzent-text); }
.sp-chip.sp-ohne { opacity: .55; }
.sp-n {
  font-size: 12px; font-weight: 700; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
  background: var(--akzent-hell); color: var(--akzent); display: inline-flex; align-items: center; justify-content: center;
  font-variant-numeric: tabular-nums;
}
.sp-chip[aria-selected="true"] .sp-n { background: var(--akzent-text); color: var(--akzent); }
.sp-unter { margin: 8px 4px 10px; font-size: 14px; color: var(--leise); }
.sp-trefferzahl { margin: 0 4px 8px; font-size: 13px; color: var(--leise); }
.sp-karte {
  background: var(--karte); border: 1px solid var(--linie); border-radius: 16px; padding: 12px 14px 10px; margin: 0 0 10px;
  overflow-wrap: anywhere; scroll-margin-top: calc(var(--nav-h, 96px) + 8px);
}
.sp-karte.sp-top { border-left: 4px solid var(--akzent); padding-left: 12px; }
.sp-kopf { display: flex; gap: 8px; align-items: flex-start; }
.sp-titel { flex: 1; min-width: 0; margin: 2px 0 0; font-size: 17px; line-height: 1.3; font-weight: 700; }
.sp-platz {
  display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; margin-right: 8px; padding: 0 6px;
  border-radius: 8px; background: var(--akzent); color: var(--akzent-text); font-size: 13px; font-weight: 800; vertical-align: 2px;
}
.sp-stern {
  flex: none; width: 44px; height: 44px; margin: -8px -10px 0 0; border: 0; border-radius: 12px; background: transparent;
  color: var(--schwach); display: grid; place-items: center; cursor: pointer;
}
.sp-stern svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; }
.sp-stern[aria-pressed="true"] { color: var(--warm); }
.sp-stern[aria-pressed="true"] svg { fill: currentColor; }
.sp-marken { display: flex; flex-wrap: wrap; gap: 4px 6px; margin: 4px 0 0; }
.sp-marken span { font-size: 12px; font-weight: 650; border-radius: 6px; padding: 2px 7px; line-height: 1.4; }
.sp-region { background: var(--akzent-hell); color: var(--akzent); }
.sp-region.sp-weit { background: var(--flaeche); color: var(--leise); }
.sp-frist { background: var(--warm-hell); color: var(--warm); }
.sp-frist.sp-vorbei { background: var(--flaeche); color: var(--leise); }
.sp-erfahrung { background: var(--flaeche); color: var(--leise); font-weight: 600 !important; }
.sp-anleitung { background: var(--flaeche); color: var(--text); }
.sp-aktion { background: var(--warm-hell); color: var(--warm); }
.sp-aktion.sp-vorbei { background: var(--flaeche); color: var(--leise); }
.sp-ort { margin: 4px 0 0; font-size: 13px; color: var(--leise); }
.sp-nutzen { margin: 8px 0 0; font-size: 15px; line-height: 1.4; color: var(--akzent); font-weight: 600; }
.sp-nutzen b { color: var(--text); }
.sp-so { margin: 6px 0 0; font-size: 15px; line-height: 1.45; color: var(--text); }
.sp-anmelden { margin: 8px 0 0; padding: 8px 10px; border-radius: 10px; background: var(--warm-hell); color: var(--text); font-size: 14px; line-height: 1.4; }
.sp-anmelden b { color: var(--warm); }
.sp-fuss { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; margin: 8px 0 0; font-size: 13px; color: var(--leise); }
.sp-ql { margin-right: 2px; }
.sp-fuss a {
  display: inline-flex; align-items: center; max-width: 100%; min-height: 44px; padding: 0 12px; border-radius: 999px;
  background: var(--flaeche); color: var(--text); text-decoration: none; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sp-fuss a:active { background: var(--linie); }
.sp-stand { margin-left: auto; white-space: nowrap; }
.sp-geb { margin: 0 0 12px; padding: 10px 12px; border-radius: 14px; background: var(--akzent-hell); }
.sp-geb label { display: block; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
.sp-geb input {
  min-height: 44px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--linie); background: var(--karte); color: var(--text);
  font: inherit; font-size: 16px; color-scheme: dark; max-width: 100%;
}
.sp-geb-info { margin: 6px 0 0; font-size: 13px; color: var(--leise); }
.sp-leer { color: var(--leise); font-size: 15px; padding: 14px 16px; border: 1px dashed var(--linie); border-radius: 16px; margin: 0 0 12px; }
.sp-erst { margin-top: 16px; }
.sp-woanders { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 12px; }
.sp-hinweis { margin: 14px 4px 4px; font-size: 13px; color: var(--leise); }
`;

  window.MeinVorteilSpartricks = {
    start, lade,
    get gestartet() { return !!S.el; },
    // für Tests (ohne Browser): reine Funktionen
    _intern: { normalisiere, liste, passt, naechsterGeburtstag, anmeldeZeile, heute, kurzName, quellNamen, kachelAuszug, sicherUrl, BEREICHE, REGIONEN, CSS: () => CSS },
  };
})();
