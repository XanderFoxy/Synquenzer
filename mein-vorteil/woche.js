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
   Rabatt abgerundet; Ende 00:00 zählt zum Vortag („bis Sa“, nicht „bis So“). */
(function () {
  'use strict';
  const URL_STANDARD = 'https://raw.githubusercontent.com/XanderFoxy/Synquenzer/vorteile-daten/vorteile/data/knaller.json';
  const CACHE = 'mv-woche';
  const STUFE_SPEICHER = 'mein-vorteil-woche-stufe';
  const MARKT_SPEICHER = 'mein-vorteil-woche-markt';
  const STUFEN = [30, 40, 50];
  const ALT_STUNDEN = 36, HINWEIS_STUNDEN = 12;
  // Reihenfolge und Namen, falls die Datei keine Märkte nennt (gleich wie vorteile/config.json module.knaller.maerkte)
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
  function angebotNorm(a, jetzt) {
    if (!a || typeof a !== 'object') return null;
    const titel = typeof a.titel === 'string' ? a.titel.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
    const preis = zahl(a.preis), vorher = zahl(a.vorher);
    const markt = typeof a.markt === 'string' && /^[a-z0-9-]{1,30}$/.test(a.markt) ? a.markt : null;
    if (!titel || !markt || !(preis > 0)) return null;
    // ohne Vergleichspreis kein Rabatt – und ohne Rabatt kein Knaller (die Seite rechnet selbst nach, statt pct zu glauben)
    if (!(vorher > preis)) return null;
    const pct = Math.floor((1 - preis / vorher) * 100 + 1e-9); // abgerundet wie der Radar: nie mehr versprechen
    if (!(pct > 0 && pct < 95)) return null;
    const bis = zeitVon(a.gueltigBis), ab = zeitVon(a.gueltigAb);
    if (bis != null && bis < jetzt) return null; // abgelaufen
    return {
      id: String(a.id ?? `${markt}|${titel}|${preis}`).slice(0, 80), markt, titel, preis, vorher, pct,
      info: typeof a.info === 'string' ? a.info.trim().slice(0, 120) : '',
      // streich = Streichpreis (Goldrahmen), uvp = Herstellerpreis; fehlt die Angabe -> 'unbekannt' (grau, ohne „UVP“)
      art: a.vorherArt === 'streich' ? 'streich' : a.vorherArt === 'uvp' ? 'uvp' : 'unbekannt',
      abPreis: a.abPreis === true, app: a.app === true,
      bedingung: typeof a.bedingung === 'string' ? a.bedingung.trim().slice(0, 60) : '',
      bild: sicher(a.bild), link: sicher(a.link), bis, ab: ab != null && ab > jetzt ? ab : null,
      region: typeof a.region === 'string' ? a.region.trim().slice(0, 40) : '',
    };
  }
  function normalisiere(d, jetzt = Date.now()) {
    const m = d && typeof d.maerkte === 'object' && d.maerkte && !Array.isArray(d.maerkte) ? d.maerkte : {};
    const namen = new Map(MAERKTE);
    for (const [id, x] of Object.entries(m)) if (/^[a-z0-9-]{1,30}$/.test(id)) namen.set(id, typeof x?.name === 'string' && x.name.trim() ? x.name.trim().slice(0, 24) : namen.get(id) || id);
    const gesehen = new Set();
    const angebote = liste(d?.angebote).map(a => angebotNorm(a, jetzt)).filter(a => a && !gesehen.has(a.id) && gesehen.add(a.id))
      .sort((a, b) => b.pct - a.pct || a.preis - b.preis);
    for (const a of angebote) if (!namen.has(a.markt)) namen.set(a.markt, a.markt);
    // ort = Prospekt-Ort dieses Markts (Radar ab 16.11.2026: Döbeln, Chemnitz, Leipzig oder „bundesweit (Berlin)“)
    const maerkte = [...namen.entries()].map(([id, name]) => ({ id, name, link: sicher(m[id]?.link), alt: m[id]?.alt === true,
      ort: typeof m[id]?.ort === 'string' ? m[id].ort.trim().slice(0, 40) : '', keinMarkt: m[id]?.keinMarkt === true }));
    const status = d && typeof d.status === 'object' && d.status ? d.status : {};
    return {
      aktualisiert: typeof d?.aktualisiert === 'string' ? d.aktualisiert : null,
      standort: typeof d?.standort === 'string' ? d.standort.slice(0, 30) : '', ort: typeof d?.ort === 'string' ? d.ort.slice(0, 30) : 'Döbeln',
      angebote, maerkte, status,
    };
  }

  // --- Zeichnen -----------------------------------------------------------------------------------------------------------
  const S = { el: null, url: URL_STANDARD, n: null, roh: '', laedt: false, gestoert: false, nichtDa: false, stufe: 30, markt: 'alle' };
  const nachMarkt = (arr, m) => (m === 'alle' ? arr : arr.filter(a => a.markt === m));
  const abStufe = (arr, st) => arr.filter(a => a.pct >= st);
  const marktName = id => S.n?.maerkte.find(x => x.id === id)?.name || id;
  function initialen(s) { return String(s || '').split(/[\s-]+/).filter(w => /^[\p{L}\d]/u.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join(''); }

  function kachel(a) {
    const streich = a.art === 'streich';
    const plakette = `${a.abPreis ? 'bis ' : ''}−${a.pct} %`;
    const bild = a.bild
      ? `<img class="wo-bild" src="${esc(a.bild)}" alt="" width="160" height="160" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
      : `<span class="wo-bild wo-ohnebild" aria-hidden="true">${esc(marktName(a.markt))}</span>`;
    const marken = [];
    if (a.app) marken.push('<span class="wo-marke wo-warm">nur mit App/Karte</span>');
    if (a.abPreis) marken.push('<span class="wo-marke">ab-Preis</span>');
    if (a.ab) marken.push(`<span class="wo-marke wo-warm">ab ${esc(wtTag(a.ab))}</span>`);
    const fuss = [marktName(a.markt), a.bis != null ? bisText(a.bis) : ''].filter(Boolean).join(' · ');
    const innen = `<span class="wo-bildfeld">${bild}<span class="wo-pct${streich ? '' : ' wo-uvp'}">${esc(plakette)}</span></span>`
      + `<span class="wo-text"><span class="wo-preiszeile"><span class="wo-preis">${a.abPreis ? '<small>ab </small>' : ''}${esc(euro(a.preis))}</span></span>`
      + `<span class="wo-statt">statt <s>${esc(euro(a.vorher))}</s>${a.art === 'uvp' ? ' UVP' : ''}</span>`
      + `<span class="wo-titel">${esc(a.titel)}</span>`
      + (a.info || a.bedingung ? `<span class="wo-info">${esc([a.bedingung, a.info].filter(Boolean).join(' · '))}</span>` : '')
      + (marken.length ? `<span class="wo-marken">${marken.join('')}</span>` : '')
      + `<span class="wo-fuss">${esc(fuss)}</span></span>`;
    const klasse = `wo-kachel${streich ? ' wo-streich' : ''}`;
    return a.link
      ? `<li><a class="${klasse}" href="${esc(a.link)}" target="_blank" rel="noopener" data-wo-id="${esc(a.id)}" data-wo-markt="${esc(a.markt)}">${innen}</a></li>`
      : `<li><div class="${klasse}" data-wo-id="${esc(a.id)}" data-wo-markt="${esc(a.markt)}">${innen}</div></li>`;
  }
  // Gruppen: ab 50 % · 40 bis 49 % · 30 bis 39 % (nur ab der gewählten Stufe), Angebote ab Montag/Donnerstag eigene Gruppe unten
  function gruppenHtml(arr) {
    const jetzt = arr.filter(a => !a.ab), spaeter = arr.filter(a => a.ab);
    const stufen = [[50, 101, 'ab 50 %'], [40, 50, '40 bis 49 %'], [30, 40, '30 bis 39 %']];
    const teile = [];
    for (const [von, bis, name] of stufen) {
      const l = jetzt.filter(a => a.pct >= von && a.pct < bis);
      if (l.length) teile.push(`<h3 class="wo-gruppe">${esc(name)} <small>${l.length}</small></h3><ul class="wo-raster">${l.map(kachel).join('')}</ul>`);
    }
    if (spaeter.length) {
      const erst = Math.min(...spaeter.map(a => a.ab));
      teile.push(`<h3 class="wo-gruppe">Ab ${esc(wtTag(erst).split(' ')[0] === 'Mo' ? 'Montag' : wtTag(erst))} <small>${spaeter.length}</small></h3><ul class="wo-raster">${spaeter.map(kachel).join('')}</ul>`);
    }
    return teile.join('');
  }
  function leerHtml() {
    const imMarkt = nachMarkt(S.n.angebote, S.markt);
    const wo = S.markt === 'alle' ? '' : ` bei ${marktName(S.markt)}`;
    const tiefer = STUFEN.filter(s => s < S.stufe).map(s => [s, abStufe(imMarkt, s).length]).filter(([, n]) => n > 0).pop();
    if (tiefer) return `<div class="wo-leer"><p>Gerade nichts ab ${S.stufe} %${esc(wo)} – ab ${tiefer[0]} % gibt es ${tiefer[1]}.</p><button type="button" class="wo-knopf" data-wo-stufe="${tiefer[0]}">Ab ${tiefer[0]} % zeigen</button></div>`;
    const andere = S.markt !== 'alle' && abStufe(S.n.angebote, S.stufe).length;
    if (andere) return `<div class="wo-leer"><p>Gerade nichts ab ${S.stufe} %${esc(wo)}.</p><button type="button" class="wo-knopf" data-wo-markt="alle">Alle Märkte zeigen (${andere})</button></div>`;
    const st = Object.values(S.n.status).some(q => q && q.ok === false) ? ' Eine Quelle ist gerade gestört.' : '';
    return `<div class="wo-leer"><p>Gerade keine Angebote ab ${S.stufe} %${esc(wo)} in den Prospekten.${esc(st)}</p></div>`;
  }
  function listeHtml() {
    const arr = abStufe(nachMarkt(S.n.angebote, S.markt), S.stufe);
    return arr.length ? gruppenHtml(arr) : leerHtml();
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
    const imMarkt = nachMarkt(S.n.angebote, S.markt);
    return `<div class="wo-stufen" role="radiogroup" aria-label="Rabatt ab">${STUFEN.map(s => {
      const an = s === S.stufe;
      return `<button type="button" class="wo-stufe" role="radio" aria-checked="${an}" tabindex="${an ? 0 : -1}" data-wo-stufe="${s}">ab ${s} %<span class="wo-n">${abStufe(imMarkt, s).length}</span></button>`;
    }).join('')}</div>`;
  }
  function maerkteHtml() {
    const ab = abStufe(S.n.angebote, S.stufe);
    const chips = [['alle', 'Alle', ab.length], ...S.n.maerkte.map(m => [m.id, m.name, nachMarkt(ab, m.id).length])];
    return `<div class="wo-chips" role="tablist" aria-label="Märkte">${chips.map(([id, name, n]) => {
      const an = id === S.markt;
      return `<button type="button" class="wo-chip${n ? '' : ' wo-null'}" role="tab" aria-selected="${an}" tabindex="${an ? 0 : -1}" data-wo-markt="${esc(id)}" aria-controls="wo-liste">${esc(name)}<span class="wo-n">${n}</span></button>`;
    }).join('')}</div>`;
  }
  function fussHtml() {
    const ort = S.n.standort && S.n.standort !== 'bundesweit' ? `Prospekte ${S.n.standort}` : 'Prospekte bundesweit';
    // Prospekt für den eigenen Ort (Döbeln) oder nicht – Märkte aus Nachbarstadt/bundesweit sichtbar nennen
    const lokal = !!S.n.standort && S.n.standort === S.n.ort;
    const fremd = S.n.maerkte.filter(m => m.ort && m.ort !== S.n.ort && !m.keinMarkt);
    const ohneMarkt = S.n.maerkte.filter(m => m.keinMarkt).map(m => m.name);
    const ortText = lokal ? `Prospekte für ${S.n.ort} von kaufDA – einzelne Filialen können abweichen.` : `${ort} von kaufDA – ob es das in ${S.n.ort} gibt, im Markt oder in der App prüfen.`;
    const k = S.n.status.kaufda && typeof S.n.status.kaufda === 'object' ? S.n.status.kaufda : null;
    const stoer = k && Array.isArray(k.fehler) ? k.fehler.filter(x => typeof x === 'string').slice(0, 3) : [];
    const alt = S.n.maerkte.filter(m => m.alt).map(m => m.name);
    const markt = S.markt !== 'alle' ? S.n.maerkte.find(m => m.id === S.markt) : null;
    const ohneArt = S.n.angebote.some(a => a.art === 'unbekannt') ? ' Grau ohne „UVP“ = der Prospekt sagt nicht, welcher Preis verglichen wird.' : '';
    return `<p class="wo-fuss-text"><b>Gold umrandet</b> = echter Streichpreis im Prospekt. <b>UVP</b> = gegen die Preisempfehlung des Herstellers gerechnet – die liegt oft über dem üblichen Ladenpreis.${esc(ohneArt)} „bis −n %“ = ab-Preis (die günstigste Sorte). Rabatte abgerundet. ${esc(ortText)}</p>`
      + (fremd.length && S.n.standort !== 'bundesweit' ? `<p class="wo-fuss-text">Nicht aus dem Prospekt für ${esc(S.n.ort)}: ${esc(fremd.map(m => `${m.name} (${m.ort})`).join(', '))} – im Markt oder in der App prüfen.</p>` : '')
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
    if (S.markt !== 'alle' && !S.n.maerkte.some(m => m.id === S.markt)) S.markt = 'alle';
    const alt = el.querySelector('.wo-chips');
    const links = alt ? alt.scrollLeft : null;
    el.innerHTML = `<div class="wo">${standHtml()}${stufenHtml()}${maerkteHtml()}`
      + `<div class="wo-liste" id="wo-liste" role="tabpanel">${listeHtml()}</div>${fussHtml()}</div>`;
    const leiste = el.querySelector('.wo-chips');
    if (links != null) leiste.scrollLeft = links; else zeigeChip(leiste, S.markt);
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

  function start(el, opt) {
    if (!el) return;
    if (S.el === el) { lade(); return; }
    S.el = el;
    if (opt && opt.url) S.url = opt.url;
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
    el.addEventListener('click', ev => {
      const s = ev.target.closest('[data-wo-stufe]');
      if (s) { setzeStufe(Number(s.dataset.woStufe)); return; }
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
.wo-raster > li { min-width: 0; }
.wo-kachel {
  display: flex; flex-direction: column; height: 100%; text-decoration: none; color: inherit; background: var(--karte);
  border: 1px solid var(--linie); border-radius: 14px; overflow: hidden;
}
.wo-kachel.wo-streich { border-color: var(--akzent); box-shadow: 0 0 0 1px var(--akzent); } /* 2 px Goldring, ohne die Maße zu ändern */
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
    _intern: { normalisiere, angebotNorm, kachel: a => kachel(a), fuss: n => { const vor = S.n; S.n = n; try { return fussHtml(); } finally { S.n = vor; } }, STUFEN, CSS: () => CSS },
  };
})();
