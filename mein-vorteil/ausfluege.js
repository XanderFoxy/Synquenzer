/* Mein Vorteil – Reiter „Ausflüge“ (Xander 16.11.2026: Stadtfeste und coole Veranstaltungen im Umkreis, Tage an denen man
   etwas kostenlos bekommt, Mitmachen mit Belohnung, Produkttester – am liebsten Synthesizer/Technik, am besten in der Nähe).
   Ansichten: Termine (Filter Art · Entfernung · Zeitraum) und Regelmäßig (jedes Jahr / immer – zum Planen).
   Eine Datei für Logik + CSS (Präfix .aus-), nutzt nur die CSS-Variablen der Seite.
   Einbau (mein-vorteil/index.html):  MeinVorteilAusfluege.start(element) beim ersten Öffnen, .lade() bei „Neu laden“.
   Daten: events.json vom Vorteils-Radar (Zweig vorteile-daten, Modul vorteile/scan/module/events.mjs), erst beim Öffnen
   geholt; letzter Stand in localStorage (mein-vorteil-ausfluege). Fehlt die Datei noch: die recherchierte Liste
   ../vorteile/ausfluege.json (nur feste Termine, ohne Entfernung). Jede Karte mit Quelle und Stand; Vergangenes nie.
   Kein Standort, kein Tracking: Entfernungen rechnet der Radar ab Döbeln. */
(function () {
  'use strict';
  const URL_STANDARD = 'https://raw.githubusercontent.com/XanderFoxy/Synquenzer/vorteile-daten/vorteile/data/events.json';
  const URL_LISTE = '../vorteile/ausfluege.json';
  const SPEICHER = 'mein-vorteil-ausfluege';
  const FILTER = 'mein-vorteil-ausfluege-filter';
  const ARTEN = [['alle', 'Alle'], ['fest', 'Feste'], ['gratis', 'Gratis'], ['mitmachen', 'Mitmachen'], ['testen', 'Testen']];
  const KM = [[30, 'bis 30 km'], [60, 'bis 60 km'], [0, 'egal']];
  const ZEIT = [['woche', 'Diese Woche'], ['wochenende', 'Wochenende'], ['monat', 'Monat'], ['alle', 'Alle']];
  const ART_NAME = { fest: 'Fest', gratis: 'Gratis', mitmachen: 'Mitmachen', testen: 'Testen' };
  const WT = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lies = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const merk = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const istIso = v => typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00Z'));
  const text = (v, max = 300) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
  function sicherUrl(u) { try { const x = new URL(String(u)); return x.protocol === 'https:' ? x.href : null; } catch { return null; } }
  const plusTage = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
  const wochentag = d => new Date(d + 'T12:00:00Z').getUTCDay() || 7;
  let FMT = null;
  function heuteBerlin(t = Date.now()) {
    FMT = FMT || new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' });
    const o = {}; for (const p of FMT.formatToParts(new Date(t))) o[p.type] = p.value;
    return `${o.year}-${o.month}-${o.day}`;
  }
  const tm = d => `${d.slice(8, 10)}.${d.slice(5, 7)}.`;
  const wtm = d => `${WT[wochentag(d)]} ${tm(d)}`;

  // --- Daten tolerant lesen ------------------------------------------------------------------------------------------
  function karte(e, heute) {
    if (!e || typeof e !== 'object' || !ART_NAME[e.art]) return null;
    const url = sicherUrl(e.quelle?.url), titel = text(e.titel, 140);
    if (!url || !titel) return null;
    const ab = istIso(e.ab) ? e.ab : null, bis = istIso(e.bis) ? e.bis : ab;
    if (bis && bis < heute) return null; // vorbei
    const km = Number.isFinite(e.km) ? Math.round(e.km) : null;
    return {
      id: text(e.id, 80) || titel, art: e.art, titel, ab, bis, km, fahrMin: Number.isFinite(e.fahrMin) ? e.fahrMin : null,
      ort: text(e.ort, 40) || null, region: text(e.region, 60) || null, vorteil: text(e.vorteil, 200), wann: text(e.wann, 140),
      quelle: { name: text(e.quelle?.name, 60) || new URL(url).hostname, url }, stand: istIso(e.stand) ? e.stand : (istIso(e.geprueft) ? e.geprueft : null),
      sicherheit: text(e.sicherheit, 20), serioes: text(e.serioes, 20) || null, musik: !!e.musik, warnung: !!e.warnung,
      ausMuster: !!e.ausMuster, dauerhaft: !!e.dauerhaft, herkunft: e.herkunft === 'radar' ? 'radar' : 'liste',
      naechster: e.naechster && istIso(e.naechster.ab) ? { ab: e.naechster.ab, bis: istIso(e.naechster.bis) ? e.naechster.bis : e.naechster.ab } : null,
    };
  }
  /** events.json (Radar) oder ausfluege.json (Liste) -> { stand, termine, regel, ausListe } */
  function normalisiere(d, heute = heuteBerlin()) {
    if (!d || typeof d !== 'object') return { stand: null, termine: [], regel: [], ausListe: false };
    if (Array.isArray(d.eintraege)) { // Ausweich: recherchierte Liste (ohne Entfernung, nur feste Termine)
      const termine = [], regel = [];
      for (const e of d.eintraege) {
        const basis = { ...e, ort: e.ort, stand: e.geprueft };
        if (e.muster || e.dauerhaft || Array.isArray(e.termine)) { const k = karte({ ...basis, ab: null, bis: null }, heute); if (k) regel.push(k); }
        for (const t of Array.isArray(e.termine) ? e.termine : []) { const k = karte({ ...basis, ab: t.ab, bis: t.bis }, heute); if (k) termine.push(k); }
      }
      return { stand: istIso(d.stand) ? d.stand : null, termine: termine.sort(nachDatum), regel, ausListe: true };
    }
    const ids = new Set();
    const termine = (Array.isArray(d.termine) ? d.termine : []).map(e => karte(e, heute)).filter(k => k && !ids.has(k.id) && ids.add(k.id)).sort(nachDatum);
    const regel = (Array.isArray(d.regelmaessig) ? d.regelmaessig : []).map(e => karte({ ...e, ab: null, bis: null }, heute)).filter(Boolean);
    return { stand: istIso(d.stand) ? d.stand : null, termine, regel, ausListe: false };
  }
  const nachDatum = (a, b) => ((a.ab || '9999') < (b.ab || '9999') ? -1 : (a.ab || '9999') > (b.ab || '9999') ? 1 : (a.km ?? 999) - (b.km ?? 999));

  // --- Filter (rein, für Tests) ---------------------------------------------------------------------------------------
  /** Zeitraum -> [von, bis] (Kalendertage, Berlin). Wochenende = nächster Sa+So (am Sa/So: dieses). */
  function zeitraum(z, heute) {
    if (z === 'woche') return [heute, plusTage(heute, 6)];
    if (z === 'monat') return [heute, plusTage(heute, 30)];
    if (z === 'wochenende') { const wt = wochentag(heute); const sa = wt === 7 ? plusTage(heute, -1) : plusTage(heute, 6 - wt); return [wt >= 6 ? heute : sa, plusTage(sa, 1)]; }
    return null;
  }
  function filtere(termine, f, heute) {
    const r = zeitraum(f.zeit, heute);
    return termine.filter(t => {
      if (f.art !== 'alle' && t.art !== f.art) return false;
      if (f.km && t.km != null && t.km > f.km) return false;
      if (!r) return true;
      if (!t.ab) return f.zeit === 'monat'; // ohne Datum: nur unter „Monat“ und „Alle“
      return t.ab <= r[1] && (t.bis || t.ab) >= r[0];
    });
  }
  function datumText(t, heute) {
    if (!t.ab) return t.wann || 'Datum in der Quelle';
    const bis = t.bis || t.ab;
    if (t.ab <= heute && bis > heute) return `läuft · bis ${wtm(bis)}`;
    if (t.ab === heute) return 'heute';
    if (t.ab === plusTage(heute, 1) && bis === t.ab) return `morgen · ${wtm(t.ab)}`;
    return bis !== t.ab ? `${wtm(t.ab)} – ${wtm(bis)}` : wtm(t.ab);
  }
  const ortText = t => [t.ort || t.region || '', t.km != null && t.km > 0 ? `${t.km} km` : t.km === 0 ? 'vor Ort' : '', t.fahrMin && t.km > 0 ? `≈ ${t.fahrMin} Min. Auto` : ''].filter(Boolean).join(' · ');

  // --- Zustand + Zeichnen ---------------------------------------------------------------------------------------------
  const S = { el: null, daten: null, ansicht: 'termine', f: { art: 'alle', km: 60, zeit: 'monat' }, fehler: null };
  function ladeFilter() {
    const v = lies(FILTER, null);
    if (v && typeof v === 'object') {
      if (['termine', 'regel'].includes(v.ansicht)) S.ansicht = v.ansicht;
      if (ARTEN.some(([k]) => k === v.art)) S.f.art = v.art;
      if (KM.some(([k]) => k === v.km)) S.f.km = v.km;
      if (ZEIT.some(([k]) => k === v.zeit)) S.f.zeit = v.zeit;
    }
  }
  const chip = (gruppe, k, name, an) => `<button type="button" class="aus-chip" data-aus="${gruppe}" data-wert="${esc(k)}" aria-pressed="${an}">${esc(name)}</button>`;
  function karteHtml(t, heute, regel = false) {
    const marke = [`<span class="aus-art aus-${t.art}">${esc(ART_NAME[t.art])}</span>`];
    if (t.serioes === 'seriös') marke.push('<span class="aus-marke aus-ok">seriös</span>');
    if (t.serioes === 'vorsicht' || t.serioes === 'unseriös') marke.push('<span class="aus-marke aus-warn">Vorsicht</span>');
    if (t.musik) marke.push('<span class="aus-marke">Musiktechnik</span>');
    if (t.ausMuster || t.sicherheit === 'muster') marke.push('<span class="aus-marke">aus Regel – vorher prüfen</span>');
    if (t.herkunft === 'radar') marke.push('<span class="aus-marke">neu gemeldet</span>');
    const wann = regel ? `${esc(t.wann)}${t.naechster ? ` · nächster: <b>${esc(datumText(t.naechster, heute))}</b>` : t.dauerhaft ? '' : ''}` : `<b>${esc(datumText(t, heute))}</b>`;
    const ort = ortText(t);
    return `<article class="aus-karte f-ausfluege"><div class="aus-kopf">${marke.join('')}</div>`
      + `<h4 class="aus-titel">${esc(t.titel)}</h4><p class="aus-wann">${wann}</p>`
      + (ort ? `<p class="aus-ort">${esc(ort)}</p>` : '')
      + (t.vorteil ? `<p class="aus-vorteil">${esc(t.vorteil)}</p>` : '')
      + `<p class="aus-quelle"><a href="${esc(t.quelle.url)}" target="_blank" rel="noopener noreferrer">Quelle: ${esc(t.quelle.name)}</a>${t.stand ? `<span>Stand ${esc(tm(t.stand))}</span>` : ''}</p></article>`;
  }
  function zeichne() {
    if (!S.el) return;
    const heute = heuteBerlin();
    const d = S.daten;
    const kopf = `<div class="aus-ansicht" role="group" aria-label="Ansicht">${chip('ansicht', 'termine', 'Termine', S.ansicht === 'termine')}${chip('ansicht', 'regel', 'Regelmäßig', S.ansicht === 'regel')}</div>`
      + `<div class="aus-zeile" role="group" aria-label="Art">${ARTEN.map(([k, n]) => chip('art', k, n, S.f.art === k)).join('')}</div>`;
    if (!d) { S.el.innerHTML = kopf + `<p class="leer">${S.fehler ? 'Ausflüge gerade nicht erreichbar. Später noch einmal auf ↻ tippen.' : 'Lade Ausflüge …'}</p>`; return; }
    let inhalt = '';
    if (S.ansicht === 'termine') {
      const l = filtere(d.termine, S.f, heute);
      inhalt = `<div class="aus-zeile" role="group" aria-label="Entfernung">${KM.map(([k, n]) => chip('km', k, n, S.f.km === k)).join('')}</div>`
        + `<div class="aus-zeile" role="group" aria-label="Zeitraum">${ZEIT.map(([k, n]) => chip('zeit', k, n, S.f.zeit === k)).join('')}</div>`
        + (l.length ? `<div class="aus-liste">${l.map(t => karteHtml(t, heute)).join('')}</div>`
          : `<p class="leer">In diesem Zeitraum nichts${S.f.km ? ` bis ${S.f.km} km` : ''}. Tipp: Zeitraum „Alle“ oder „Regelmäßig“ zum Planen.</p>`);
      // Mitmachen/Testen sind meist „immer möglich“ (ohne Termin): dann direkt darunter
      const immer = S.f.art === 'alle' ? [] : d.regel.filter(t => t.dauerhaft && t.art === S.f.art);
      if (immer.length) inhalt += `<h3 class="aus-ab">Immer möglich</h3><div class="aus-liste">${immer.map(t => karteHtml(t, heute, true)).join('')}</div>`;
    } else {
      const l = d.regel.filter(t => S.f.art === 'alle' || t.art === S.f.art);
      const gruppen = ['fest', 'gratis', 'mitmachen', 'testen'].map(a => [a, l.filter(t => t.art === a)]).filter(([, x]) => x.length);
      inhalt = gruppen.map(([a, x]) => `<h3 class="aus-ab">${esc({ fest: 'Feste & Märkte', gratis: 'Gratis-Tage', mitmachen: 'Mitmachen mit Belohnung', testen: 'Produkttests & Beta' }[a])}</h3><div class="aus-liste">${x.map(t => karteHtml(t, heute, true)).join('')}</div>`).join('')
        || '<p class="leer">Keine regelmäßigen Termine für diese Auswahl.</p>';
    }
    const stand = d.stand ? `Stand ${tm(d.stand)}${d.ausListe ? ' · Liste (Entfernungen kommen mit dem nächsten Radar-Lauf)' : ' · ab Döbeln, Luftlinie'}` : '';
    S.el.innerHTML = kopf + inhalt + (stand ? `<p class="aus-stand">${esc(stand)}</p>` : '');
  }

  // --- Laden ------------------------------------------------------------------------------------------------------------
  async function hole(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  async function lade() {
    const alt = lies(SPEICHER, null);
    if (!S.daten && alt?.d) { S.daten = normalisiere(alt.d); zeichne(); }
    try {
      let d;
      try { d = await hole(URL_STANDARD); } catch { d = await hole(URL_LISTE); }
      S.daten = normalisiere(d); S.fehler = null;
      merk(SPEICHER, { d, holZeit: Date.now() });
    } catch (e) { S.fehler = String(e?.message || e); }
    zeichne();
  }
  function start(el) {
    if (api.gestartet) return;
    api.gestartet = true;
    S.el = el;
    if (!document.getElementById('aus-css')) { const st = document.createElement('style'); st.id = 'aus-css'; st.textContent = CSS; document.head.appendChild(st); }
    ladeFilter();
    el.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('[data-aus]');
      if (!b) return;
      const g = b.dataset.aus, w = b.dataset.wert;
      if (g === 'ansicht') S.ansicht = w; else if (g === 'km') S.f.km = Number(w); else S.f[g] = w;
      merk(FILTER, { ansicht: S.ansicht, ...S.f });
      zeichne();
    });
    zeichne();
    lade();
  }

  const CSS = `
.aus-ansicht, .aus-zeile { display: flex; gap: 8px; overflow-x: auto; padding: 2px 4px 8px; scrollbar-width: none; }
.aus-ansicht::-webkit-scrollbar, .aus-zeile::-webkit-scrollbar { display: none; }
.aus-chip { flex: none; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--linie);
  background: var(--karte); color: var(--text); font: inherit; font-size: 15px; font-weight: 600; white-space: nowrap; cursor: pointer; }
.aus-chip[aria-pressed="true"] { background: var(--akzent); border-color: var(--akzent); color: var(--akzent-text); }
.aus-ansicht .aus-chip { font-weight: 800; }
.aus-liste { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 10px; margin: 4px 0 10px; }
.aus-karte { background: var(--karte); border: 1px solid var(--linie); border-radius: 16px; padding: 12px 14px 6px; overflow-wrap: anywhere; }
.aus-kopf { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.aus-art, .aus-marke { font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: var(--flaeche); color: var(--text); }
.aus-art { background: var(--akzent-hell); color: var(--akzent); }
.aus-ok { background: var(--akzent-hell); color: var(--akzent); }
.aus-warn { background: var(--warm-hell, #4a2a20); color: var(--warm, #ff9b7a); }
.aus-titel { margin: 0 0 4px; font-size: 17px; line-height: 1.25; }
.aus-wann, .aus-ort, .aus-vorteil { margin: 2px 0; font-size: 15px; }
.aus-wann b { color: var(--akzent); }
.aus-ort { color: var(--leise); }
.aus-quelle { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; margin: 4px 0 0; font-size: 14px; color: var(--leise); }
.aus-quelle a { display: inline-flex; align-items: center; min-height: 44px; color: var(--akzent); font-weight: 700; text-decoration: none; }
.aus-ab { margin: 14px 4px 8px; font-size: 15px; font-weight: 800; color: var(--akzent); }
.aus-stand { margin: 6px 4px 12px; font-size: 13px; color: var(--leise); }
`;
  const api = { start, lade, gestartet: false, _intern: { normalisiere, filtere, zeitraum, datumText, heuteBerlin } };
  window.MeinVorteilAusfluege = api;
})();
