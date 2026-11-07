/* Mein Vorteil – Reiter „Filme“: Apple-TV-Filme und -Staffeln (Wunschliste, Angebote, Neu, 80er & Kult, Serien, Disney).
   Eine Datei für alles (Logik + CSS mit Präfix .fi-). Nutzt nur die CSS-Variablen der Seite:
   --karte --flaeche --text --leise --linie --akzent --akzent-hell --akzent-text --warm --warm-hell --rot.
   Einbau (siehe FILME-SEITE-NOTES.md):
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
  const CHIPS = [
    ['wunsch', 'Wunschliste', 'Deine Filme – sobald einer günstig ist, kommt eine Nachricht.'],
    ['angebot', 'Angebote', 'Filme zum Kaufen für 3,99 € oder stark gesenkt.'],
    ['neu', 'Neu', 'Neue Filme aus Komödie, Action und Thriller – nach Platz in den Apple-Charts.'],
    ['achtziger', '80er & Kult', 'Klassiker und Kultfilme für die Sammlung – Angebote zuerst.'],
    ['serien', 'Serien', 'Rick and Morty und Star Trek – Angebote zuerst.'],
    ['disney', 'Disney', 'Disney und Pixar – Angebote zuerst, mit Tiefstpreis.'],
  ];
  const LEER = {
    wunsch: 'Deine Wunschliste ist gerade leer.',
    angebot: 'Gerade keine Angebote – du bekommst eine Nachricht, sobald einer deiner Filme günstig ist.',
    neu: 'Gerade keine neuen Filme aus Komödie, Action oder Thriller in den Charts.',
    achtziger: 'Gerade keine 80er-Klassiker gefunden – beim nächsten Lauf noch einmal.',
    serien: 'Gerade keine Staffeln von Rick and Morty oder Star Trek gefunden.',
    disney: 'Gerade keine Disney-Filme gefunden.',
  };
  const QUELLE = { 'apple-suche': 'Apple-Store', apple: 'Apple-Store', itunes: 'Apple-Store', 'apple-charts': 'Apple-Charts', charts: 'Apple-Charts', mydealz: 'mydealz' };

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
  const liste = x => (Array.isArray(x) ? x : x && typeof x === 'object' ? [x] : []);
  function titelNorm(t) {
    if (!t || typeof t !== 'object') return null;
    const titel = typeof t.titel === 'string' ? t.titel.trim() : '';
    if (!titel) return null; // ohne Titel nicht zeigen
    const preisSd = preisVon(t.preisSd), preisHd = preisVon(t.preisHd);
    const j = /\b(1[89]\d\d|20\d\d)\b/.exec(String(t.jahr ?? ''));
    const tp = t.tiefst && typeof t.tiefst === 'object' ? preisVon(t.tiefst.p) : null;
    return {
      id: String(t.id ?? titel), typ: t.typ === 'staffel' ? 'staffel' : 'film', titel, jahr: j ? Number(j[1]) : null,
      genre: typeof t.genre === 'string' ? t.genre.trim() : '',
      preis: preisVon(t.preis) ?? preisHd ?? preisSd, leihe: preisVon(t.leihe), vorher: preisVon(t.vorher),
      tiefst: tp != null ? { p: tp, tag: datum(t.tiefst.tag) } : null, seit: datum(t.seit),
      istTiefst: t.istTiefst === true, angebot: t.angebot === true, unterZiel: t.unterZiel === true, ziel: preisVon(t.ziel),
      fehlt: t.fehlt === true, bild: bildUrl(t.bild), link: sicher(t.link),
      chart: zahl(t.chart) > 0 ? Math.round(zahl(t.chart)) : null, quelle: typeof t.quelle === 'string' ? t.quelle : '',
      serie: typeof t.serie === 'string' && t.serie.trim() ? t.serie.trim() : null,
    };
  }
  const zuerst = (arr, f) => [...arr.filter(f), ...arr.filter(x => !f(x))]; // stabil
  function normalisiere(d) {
    const g = d && typeof d === 'object' && d.gruppen && typeof d.gruppen === 'object' ? d.gruppen : {};
    const gruppen = {};
    for (const [k] of CHIPS) {
      const gesehen = new Set();
      gruppen[k] = liste(g[k]).map(titelNorm).filter(t => t && !gesehen.has(t.id) && gesehen.add(t.id));
    }
    // Reihenfolge kommt vom Scanner; die Seite sorgt nur dafür, dass Angebote oben stehen
    gruppen.wunsch = zuerst(zuerst(gruppen.wunsch, t => !t.fehlt), t => t.angebot || t.unterZiel);
    gruppen.neu = gruppen.neu.map((t, i) => [t, i]).sort((a, b) => (a[0].chart ?? 1e6) - (b[0].chart ?? 1e6) || a[1] - b[1]).map(x => x[0]);
    for (const k of ['angebot', 'achtziger', 'disney']) gruppen[k] = zuerst(gruppen[k], t => t.angebot);
    const status = d && typeof d.status === 'object' && d.status ? d.status : {};
    return { aktualisiert: typeof d?.aktualisiert === 'string' ? d.aktualisiert : null, gruppen, status };
  }
  // Start: Wunschliste, wenn dort ein (neues) Angebot ist – sonst der zuletzt gewählte Bereich, sonst „Angebote“
  function startChip(n) {
    const sig = n.gruppen.wunsch.filter(t => t.angebot || t.unterZiel).map(t => `${t.id}@${t.preis}`).sort().join('|');
    const gemerkt = lies(CHIP_SPEICHER, null);
    if (sig !== lies(GESEHEN, '')) { merk(GESEHEN, sig); if (sig) return 'wunsch'; }
    return CHIPS.some(([k]) => k === gemerkt) ? gemerkt : sig ? 'wunsch' : 'angebot';
  }

  // --- Karten ------------------------------------------------------------------------------------------------------------
  const zeigeTiefst = t => t.istTiefst && !t.fehlt && t.preis != null && (t.vorher != null || t.angebot || t.unterZiel || t.preis <= 3.99);
  function initialen(s) { return s.split(/[\s:–-]+/).filter(w => /^[\p{L}\d]/u.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join(''); }
  function karte(t, staffel) {
    const name = staffel && staffelNr(t) != null ? `Staffel ${staffelNr(t)}` : t.titel;
    const marken = [];
    if (t.fehlt) marken.push('<span class="fi-marke fi-grau">nicht im Apple-Store</span>');
    // „Tiefstpreis“ nur, wenn es etwas heißt: gesenkt, Angebot oder ≤ 3,99 € – nicht bei einem Preis, der sich nie bewegt hat
    if (zeigeTiefst(t)) marken.push('<span class="fi-marke fi-stark">Tiefstpreis</span>');
    if (t.angebot && !t.fehlt) marken.push('<span class="fi-marke">Angebot</span>');
    if (t.unterZiel && !t.fehlt) marken.push('<span class="fi-marke fi-warm">unter deinem Ziel</span>');
    const preis = t.fehlt ? ''
      : t.preis != null ? `<span class="fi-preis">${esc(euro(t.preis))}</span>`
      : `<span class="fi-preis fi-ohnepreis">${t.leihe != null ? `nur leihen: ${esc(euro(t.leihe))}` : 'gerade nicht zu kaufen'}</span>`;
    const klein = [];
    if (t.fehlt) klein.push('Wird weiter gesucht – sobald er im Store ist, steht er hier.');
    if (!t.fehlt && t.preis != null && t.vorher != null && t.vorher > t.preis + 0.004) klein.push(`statt <s>${esc(euro(t.vorher))}</s>`);
    if (!t.fehlt && t.tiefst) {
      const hoeher = t.preis == null || t.preis > t.tiefst.p + 0.004; // ohne Preis: zuletzt gesehener Tiefstpreis mit Tag
      const heute = t.seit === tagKey(Date.now());
      if (!hoeher && t.vorher == null && !zeigeTiefst(t)) { // Preis hat sich nie bewegt
        if (t.seit && !heute) klein.push(esc(`Preis unverändert seit ${tm(t.seit)}`));
      } else {
        const am = hoeher && t.tiefst.tag ? ` am ${tm(t.tiefst.tag)}` : '';
        const seit = t.seit ? (heute ? ' (seit heute)' : ` (seit ${tm(t.seit)})`) : '';
        klein.push(esc(`Tiefstpreis ${euro(t.tiefst.p)}${am}${seit}`));
      }
    }
    if (t.ziel != null && !t.fehlt && !t.unterZiel) klein.push(esc(`dein Ziel: ${euro(t.ziel)}`));
    if (/mydealz/i.test(t.quelle)) klein.push('Tipp von mydealz');
    const info = [t.genre, t.chart ? `Platz ${t.chart} der Charts` : ''].filter(Boolean).join(' · ');
    const gross = staffel ? 84 : 56;
    const bild = t.bild
      ? `<img class="fi-bild" src="${esc(t.bild)}" alt="" width="${gross}" height="84" loading="lazy" decoding="async">`
      : `<span class="fi-bild fi-ohnebild" aria-hidden="true">${esc(initialen(t.titel))}</span>`;
    const klasse = `fi-karte${t.angebot || t.unterZiel ? ' fi-deal' : ''}${staffel ? ' fi-quadrat' : ''}`;
    const innen = `${bild}<span class="fi-text"><span class="fi-titel">${esc(name)}${t.jahr ? ` <span class="fi-jahr">(${t.jahr})</span>` : ''}</span>`
      + `${info ? `<span class="fi-info">${esc(info)}</span>` : ''}`
      + `<span class="fi-preiszeile">${preis}${marken.join('')}</span>`
      + `${klein.length ? `<span class="fi-klein">${klein.join(' · ')}</span>` : ''}</span>`;
    return t.link
      ? `<li><a class="${klasse}" href="${esc(t.link)}" target="_blank" rel="noopener" data-fi-id="${esc(t.id)}">${innen}</a></li>`
      : `<li><div class="${klasse}" data-fi-id="${esc(t.id)}">${innen}</div></li>`;
  }
  function serienHtml(arr) {
    const gruppen = new Map();
    for (const t of arr) {
      const name = t.typ === 'staffel' ? serieVon(t) : 'Filme';
      const k = name.toLowerCase();
      if (!gruppen.has(k)) gruppen.set(k, { name, titel: [] });
      gruppen.get(k).titel.push(t);
    }
    const alle = zuerst([...gruppen.values()], g => g.titel.some(t => t.angebot));
    return alle.map(g => {
      const titel = g.titel.map((t, i) => [t, i]).sort((a, b) => (b[0].angebot - a[0].angebot) || ((staffelNr(a[0]) ?? 1e6) - (staffelNr(b[0]) ?? 1e6)) || a[1] - b[1]).map(x => x[0]);
      const deals = titel.filter(t => t.angebot).length;
      const anzahl = `${titel.length} ${g.name === 'Filme' ? (titel.length === 1 ? 'Film' : 'Filme') : titel.length === 1 ? 'Staffel' : 'Staffeln'}`;
      return `<h3 class="fi-gruppe">${esc(g.name)} <small>${deals ? `${deals} im Angebot · ` : ''}${anzahl}</small></h3>`
        + `<ul class="fi-karten">${titel.map(t => karte(t, t.typ === 'staffel')).join('')}</ul>`;
    }).join('');
  }
  function listeHtml(k) {
    const arr = S.n.gruppen[k] || [];
    if (!arr.length) {
      const st = Object.values(S.n.status).some(q => q && q.ok === false) ? ' Eine Quelle ist gerade gestört.' : '';
      return `<p class="fi-leer">${esc(LEER[k] + st)}</p>`;
    }
    return k === 'serien' ? serienHtml(arr) : `<ul class="fi-karten">${arr.map(t => karte(t, false)).join('')}</ul>`;
  }

  // --- Zeichnen -----------------------------------------------------------------------------------------------------------
  const S = { el: null, url: URL_STANDARD, d: null, n: null, roh: '', laedt: false, gestoert: false, nichtDa: false, chip: null };

  function standHtml() {
    const st = standText(S.n.aktualisiert);
    const t = Date.parse(S.n.aktualisiert || '');
    const alt = !Number.isFinite(t) || Date.now() - t > ALT_STUNDEN * 36e5;
    const zusatz = !S.gestoert ? '' : navigator.onLine === false ? ' · offline' : ' · Quelle gerade gestört – du siehst den letzten Stand';
    return `<p class="fi-stand${alt || S.gestoert ? ' fi-alt' : ''}">Stand: ${esc((st || 'unbekannt') + zusatz)}</p>`;
  }
  function fussHtml() {
    const seit = Object.values(S.n.gruppen).flat().map(t => t.seit).filter(Boolean).sort()[0];
    const quellen = Object.entries(S.n.status).filter(([, q]) => q && typeof q === 'object').map(([k, q]) => {
      const f = Array.isArray(q.fehler) ? q.fehler.filter(Boolean) : [];
      const text = q.ok === false ? `gestört${f.length ? ' – ' + f.slice(0, 2).join('; ') : ''}` : `${zahl(q.anzahl) ?? 0} gefunden`;
      return `<li${q.ok === false ? ' class="fi-stoerung"' : ''}>${esc(QUELLE[k] || k)}: ${esc(text)}</li>`;
    });
    return `<p class="fi-fuss">Tiefstpreis = niedrigster Preis seit Beobachtung${seit ? ` (seit ${esc(tm(seit))})` : ''}. Tippen öffnet die TV-App.</p>`
      + (quellen.length ? `<details class="fi-quellen"><summary>Quellen</summary><ul>${quellen.join('')}</ul></details>` : '');
  }
  function chipHtml([k, name]) {
    const an = k === S.chip;
    return `<button type="button" class="fi-chip" role="tab" id="fi-c-${k}" data-fi-chip="${k}" aria-controls="fi-liste" aria-selected="${an}" tabindex="${an ? 0 : -1}">`
      + `${esc(name)}<span class="fi-n">${S.n.gruppen[k].length}</span></button>`;
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
    if (!S.chip) S.chip = startChip(S.n);
    const alt = el.querySelector('.fi-chips');
    const links = alt ? alt.scrollLeft : null;
    const unter = CHIPS.find(([k]) => k === S.chip)[2];
    el.innerHTML = `<div class="fi">${standHtml()}`
      + `<div class="fi-chips" role="tablist" aria-label="Film-Bereiche">${CHIPS.map(chipHtml).join('')}</div>`
      + `<p class="fi-unter">${esc(unter)}</p>`
      + `<div class="fi-liste" id="fi-liste" role="tabpanel" aria-labelledby="fi-c-${S.chip}">${listeHtml(S.chip)}</div>`
      + `${fussHtml()}</div>`;
    const leiste = el.querySelector('.fi-chips');
    if (links != null) leiste.scrollLeft = links; else zeigeChip(leiste, S.chip);
  }
  function zeigeChip(leiste, k) { // gewählten Chip ins Bild holen (nur waagrecht, die Seite springt nicht)
    const c = leiste.querySelector(`[data-fi-chip="${k}"]`);
    if (!c) return;
    const l = c.offsetLeft, r = l + c.offsetWidth; // .fi-chips ist position: relative
    if (l < leiste.scrollLeft + 16) leiste.scrollLeft = Math.max(0, l - 16);
    else if (r > leiste.scrollLeft + leiste.clientWidth - 16) leiste.scrollLeft = r - leiste.clientWidth + 16;
  }
  function waehle(k, fokus) { // ein Rendern pro Wechsel: Chips nur umschalten, Liste einmal neu
    if (!S.n || !CHIPS.some(([x]) => x === k)) return;
    S.chip = k;
    merk(CHIP_SPEICHER, k);
    const el = S.el;
    for (const c of el.querySelectorAll('[data-fi-chip]')) {
      const an = c.dataset.fiChip === k;
      c.setAttribute('aria-selected', String(an));
      c.tabIndex = an ? 0 : -1;
    }
    el.querySelector('.fi-unter').textContent = CHIPS.find(([x]) => x === k)[2];
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
    if (alt && alt.d && typeof alt.d === 'object') { S.d = alt.d; S.roh = JSON.stringify(alt.d); S.n = normalisiere(alt.d); }
    el.addEventListener('click', ev => {
      const c = ev.target.closest('[data-fi-chip]');
      if (c && c.dataset.fiChip !== S.chip) waehle(c.dataset.fiChip);
    });
    el.addEventListener('keydown', ev => {
      if (!ev.target.closest || !ev.target.closest('[data-fi-chip]')) return;
      const i = CHIPS.findIndex(([k]) => k === S.chip);
      const ziel = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: CHIPS.length - 1 }[ev.key];
      if (ziel == null) return;
      ev.preventDefault();
      waehle(CHIPS[(ziel + CHIPS.length) % CHIPS.length][0], true);
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
.fi-quellen { margin: 0 4px 8px; }
.fi-quellen > summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; color: var(--leise); font-size: 14px; }
.fi-quellen ul { margin: 0 0 8px; padding-left: 18px; font-size: 14px; color: var(--leise); }
.fi-quellen .fi-stoerung { color: var(--warm); }
`;

  window.MeinVorteilFilme = {
    start, lade,
    get gestartet() { return !!S.el; },
    // für Tests (ohne Browser): reine Funktionen
    _intern: { normalisiere, titelNorm, serieVon, staffelNr, bildUrl, startChip, standText, karte, zeigeTiefst, CHIPS, CSS: () => CSS },
  };
})();
