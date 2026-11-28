/* Koran im Faktencheck – App (ohne Bibliotheken).
   Start lädt nur daten/index.json; Suren, Themen, Filter, Thesen und Suchindex erst, wenn man sie öffnet. */
'use strict';
(() => {
  const APP_URL = 'https://xanderfoxy.github.io/Synquenzer/koran/';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ESC[c]);
  const pad3 = (n) => String(n).padStart(3, '0');
  const ARZ = '٠١٢٣٤٥٦٧٨٩';
  const arabZahl = (n) => String(n).replace(/\d/g, (d) => ARZ[d]);
  const main = $('#ansicht');
  const kopf = $('#kopf');
  const blatt = $('#blatt');
  const blattInhalt = $('#blatt-inhalt');
  const blattGrund = $('#blatt-grund');

  // ------------------------------------------------------------ Speicher (nur dieses Gerät)
  let speicherOk = true;
  const Sp = {
    get(k, d) {
      try { const v = localStorage.getItem('koran.' + k); return v == null ? d : JSON.parse(v); } catch (e) { speicherOk = false; return d; }
    },
    set(k, v) {
      try { localStorage.setItem('koran.' + k, JSON.stringify(v)); return true; } catch (e) { speicherOk = false; return false; }
    },
  };
  const einst = Object.assign({ ar: true, en: false, no: true, gr: 1 }, Sp.get('einst', {}));
  let FAHNEN = Sp.get('fahnen', {});
  if (!FAHNEN || typeof FAHNEN !== 'object') FAHNEN = {};
  document.documentElement.style.setProperty('--gr', einst.gr);

  // ------------------------------------------------------------ Daten
  const cache = new Map();
  function lade(pfad) {
    if (!cache.has(pfad)) {
      const p = fetch('daten/' + pfad).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
      p.catch(() => cache.delete(pfad));
      cache.set(pfad, p);
    }
    return cache.get(pfad);
  }
  let IDX = null;
  const SUREN = {};
  const KAT = {};
  let KATLISTE = [];

  const STATUS = {
    belegt: ['belegt', 'durch Wortlaut, Quellen oder Forschung gut gesichert'],
    umstritten: ['umstritten', 'in Forschung oder Überlieferung strittig'],
    deutung: ['Deutung', 'Auslegung oder Einschätzung – nicht beweisbar'],
  };
  const AMPEL = {
    'gestützt': ['gestuetzt', 'gestützt'], teilweise: ['teilweise', 'teilweise gestützt'],
    'nicht gestützt': ['nicht', 'nicht gestützt'], offen: ['offen', 'offen'], ohne: ['ohne', 'ohne Kurzurteil'],
  };
  const AMPEL_REIHE = ['gestützt', 'teilweise', 'nicht gestützt', 'offen', 'ohne'];
  const ampelKl = (s) => (AMPEL[s] || AMPEL.ohne)[0];
  const ampelTxt = (s) => (AMPEL[s] || AMPEL.ohne)[1];
  const statusHTML = (s) => s && STATUS[s] ? `<span class="st st-${s}" title="${esc(STATUS[s][1])}">${STATUS[s][0]}</span>` : '';
  const ampelHTML = (s) => `<span class="am am-${ampelKl(s)}">${ampelTxt(s)}</span>`;
  const dot = (k) => `<i class="d k-${esc(k)}" title="${esc(KAT[k] ? KAT[k].n : k)}"></i>`;

  // ------------------------------------------------------------ Text-Helfer
  const BIBEL = /(?:Gen|Ex|Lev|Num|Dtn|Jos|Ri|Rut|Sam|Kön|Chr|Esr|Neh|Est|Ijob|Hiob|Ps|Spr|Koh|Hld|Jes|Jer|Klgl|Ez|Dan|Hos|Joel|Am|Obd|Jona|Mi|Nah|Hab|Zef|Hag|Sach|Mal|Mt|Mk|Lk|Joh|Apg|Röm|Kor|Gal|Eph|Phil|Kol|Thess|Tim|Tit|Phlm|Hebr|Jak|Petr|Jud|Offb|Mose|Makk|Tob|Sir|Weish|Bar|Genesis|Exodus)\.?\s*$/;
  function verlinke(html) {
    return html.replace(/(^|[^\w:/.#&;])(\d{1,3}):(\d{1,3})(?:\s?([-–])\s?(\d{1,3}))?(?![\d:])/g, (m, vor, s, a, st, b, off, str) => {
      const S = +s; const A = +a; const su = SUREN[S];
      if (!su || A < 1 || A > su.v) return m;
      if (BIBEL.test(str.slice(Math.max(0, off - 14), off + vor.length))) return m;
      return `${vor}<a class="vref" href="#/s/${S}/${A}">${s}:${a}${b ? '–' + b : ''}</a>`;
    });
  }
  const absaetze = (t) => String(t || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${verlinke(esc(p)).replace(/\n/g, '<br>')}</p>`).join('');
  const inline = (t) => verlinke(esc(t));
  function refTeile(ref) {
    const m = /^(\d+):(\d+)/.exec(String(ref || ''));
    return m ? [+m[1], +m[2]] : [0, 0];
  }
  const refHuebsch = (r) => String(r).replace(/-/g, '–');
  function norm(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss')
      .replace(/[ʿʾ'’`´]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ');
  }
  const VAR = { a: 'aäàáâāăą', o: 'oöòóôō', u: 'uüùúûū', e: 'eéèêē', i: 'iíìîī', s: 'sšṣś', h: 'hḥḫ', d: 'dḍḏ', t: 'tṭṯ', z: 'zẓž', g: 'gġǧ', c: 'cç', n: 'nñ' };
  function markRegex(terme) {
    const teile = terme.filter((w) => w.length > 1).map((w) => w.split('').map((c) => VAR[c] ? `[${VAR[c]}]` : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[ʿʾ\'’]?'));
    return teile.length ? new RegExp('(' + teile.join('|') + ')', 'giu') : null;
  }
  const markiere = (t, rx) => rx ? esc(t).replace(rx, '<mark>$1</mark>') : esc(t);
  function auszug(t, rx, len) {
    if (!rx) return t.length > len ? t.slice(0, len) + ' …' : t;
    rx.lastIndex = 0;
    const m = rx.exec(t); rx.lastIndex = 0;
    if (!m || t.length <= len) return t.length > len ? t.slice(0, len) + ' …' : t;
    const start = Math.max(0, m.index - Math.floor(len / 3));
    return (start > 0 ? '… ' : '') + t.slice(start, start + len) + (start + len < t.length ? ' …' : '');
  }

  // ------------------------------------------------------------ Toast, Kopieren
  let toastT = 0;
  function toast(text, knopf, aktion) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(text)}</span>` + (knopf ? `<button type="button">${esc(knopf)}</button>` : '');
    if (knopf) el.querySelector('button').onclick = aktion;
    el.classList.add('an');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('an'), knopf ? 9000 : 2200);
  }
  async function kopiere(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* Fallback */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  // ------------------------------------------------------------ Verlauf (eigener Stapel für den Zurück-Knopf)
  let stapel = [];
  try { stapel = JSON.parse(sessionStorage.getItem('koran.stapel') || '[]'); } catch (e) { stapel = []; }
  let ersetzenNaechste = false;
  let ohneScrollNaechste = false;
  let istZurueck = false;
  function stapelMerken() { try { sessionStorage.setItem('koran.stapel', JSON.stringify(stapel.slice(-60))); } catch (e) { /* egal */ } }
  function stapelAktualisieren() {
    const h = location.hash || '#/';
    istZurueck = false;
    if (ersetzenNaechste) { stapel[Math.max(0, stapel.length - 1)] = h; ersetzenNaechste = false; } else if (stapel.length > 1 && stapel[stapel.length - 2] === h) { stapel.pop(); istZurueck = true; } else if (stapel[stapel.length - 1] !== h) stapel.push(h);
    stapelMerken();
  }
  function geh(hash, opt = {}) {
    if (opt.ohneScroll) ohneScrollNaechste = true;
    if (('#' + location.hash.replace(/^#/, '')) === hash) { route(); return; }
    if (opt.ersetzen) { ersetzenNaechste = true; location.replace(hash); } else location.hash = hash;
  }
  function zurueck(elternHash) {
    if (stapel.length > 1) history.back(); else geh(elternHash || '#/', { ersetzen: true });
  }
  $('#zurueck').addEventListener('click', () => zurueck(elternVon(location.hash)));
  function elternVon(h) {
    if (/^#\/s\//.test(h)) return '#/';
    if (/^#\/t\//.test(h)) return '#/themen';
    if (/^#\/filter\//.test(h)) return '#/filter';
    return '#/';
  }

  // „Zurück zu 2:256“ nach einem Sprung aus der Notiz-Karte
  let rueckZiel = null;
  const rueckEl = $('#rueck');
  $('#rueck-knopf').addEventListener('click', () => { if (rueckZiel) history.back(); });
  function rueckZeigen() {
    const h = location.hash;
    if (rueckZiel && h === rueckZiel.nach) {
      rueckEl.querySelector('span').textContent = 'Zurück zu ' + rueckZiel.label;
      rueckEl.hidden = false;
    } else {
      if (rueckZiel && h !== rueckZiel.nach) rueckZiel = null;
      rueckEl.hidden = true;
    }
  }

  // ------------------------------------------------------------ Kopf, Leiste
  const TOP = { lesen: 1, themen: 1, filter: 1, thesen: 1, fahnen: 1 };
  function kopfSetzen(titel, tab, unterseite) {
    $('#seitentitel').textContent = titel || '';
    kopf.classList.toggle('unterseite', !!unterseite);
    $('#zurueck').hidden = !unterseite;
    document.title = titel ? titel + ' – Koran im Faktencheck' : 'Koran im Faktencheck';
    $$('.leiste a').forEach((a) => a.classList.toggle('an', a.dataset.tab === tab));
    $('#knopf-suche').classList.toggle('an', tab === 'suche');
  }
  const scrollMerk = new Map();
  let aktuellerHash = '';
  function seite(html, cls = '') {
    main.innerHTML = `<div class="seite ${cls}">${html}</div>`;
  }
  function ladeAnzeige() { main.innerHTML = '<div class="lade" aria-busy="true"><div class="lade-zeile breit"></div><div class="lade-zeile"></div><div class="lade-zeile"></div></div>'; }
  function fehlerAnzeige(e) {
    // 503 kommt vom Service Worker, wenn keine Verbindung da ist; „Failed to fetch“/„Load failed“ ohne Service Worker
    const offline = !navigator.onLine || /HTTP 503|fetch|network|load failed/i.test(String(e && e.message));
    seite(`<div class="hinweis fehler"><b>${offline ? 'Keine Verbindung.' : 'Das ließ sich nicht laden.'}</b><br>
      ${offline ? 'Dieser Teil wurde noch nicht geöffnet und ist darum nicht offline gespeichert.' : esc(e && e.message || '')}
      <p><button class="knopf" type="button" data-act="neu">Erneut versuchen</button></p></div>`);
  }

  // ------------------------------------------------------------ Router
  let ansicht = { typ: '' };
  let token = 0;
  async function route() {
    stapelAktualisieren();
    if (aktuellerHash && ansicht.typ !== 'sure') scrollMerk.set(aktuellerHash, window.scrollY);
    const h = location.hash || '#/';
    const teile = decodeURIComponent(h.replace(/^#\/?/, '')).split('/').filter(Boolean);
    const ohneScroll = ohneScrollNaechste; ohneScrollNaechste = false;
    const t = ++token;
    if (!IDX) {
      try { await indexLaden(); } catch (e) { fehlerAnzeige(e); return; }
      if (t !== token) return;
    }
    rueckZeigen();
    const [a, b, c, d] = teile;
    if (a !== 's' || ansicht.typ !== 'sure' || +b !== ansicht.nr) blattZu(true);
    try {
      if (!a) await zeigeStart(t);
      else if (a === 's') await zeigeSure(t, +b, c ? parseInt(c, 10) : 0, d || '', ohneScroll);
      else if (a === 'themen') await zeigeThemen(t);
      else if (a === 't') await zeigeThema(t, b, c);
      else if (a === 'filter') await zeigeFilter(t, b);
      else if (a === 'thesen') await zeigeThesen(t);
      else if (a === 'suche') await zeigeSuche(t, teile.slice(1).join('/'));
      else if (a === 'fahnen') zeigeFahnen();
      else if (a === 'ueber') zeigeUeber();
      else { kopfSetzen('Nicht gefunden', '', true); seite('<div class="hinweis">Diese Seite gibt es nicht. <a href="#/">Zur Startseite</a></div>'); }
    } catch (e) {
      if (t === token) { ansicht = { typ: 'fehler' }; fehlerAnzeige(e); }
      console.warn(e);
    }
    if (t !== token) return;
    if (ansicht.typ !== 'sure') {
      const y = istZurueck ? scrollMerk.get(h) : 0;
      window.scrollTo(0, y || 0);
    }
    aktuellerHash = h;
  }

  async function indexLaden() {
    IDX = await lade('index.json');
    IDX.suren.forEach((s) => { SUREN[s.nr] = s; });
    KATLISTE = IDX.kat;
    KATLISTE.forEach((k) => { KAT[k.k] = k; });
  }

  // ------------------------------------------------------------ Start (Lesen)
  let ortFilter = 'alle';
  function zeigeStart() {
    ansicht = { typ: 'start' };
    kopfSetzen('', 'lesen', false);
    const z = IDX.zahlen;
    const zu = Sp.get('zuletzt', null);
    const zuS = zu && SUREN[zu.s];
    const weiter = zuS ? `<a class="weiter-karte" href="#/s/${zu.s}/${zu.a}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4v16l7-4 7 4V4z"/></svg>
        <span><b>Weiterlesen: Sure ${zu.s}, Vers ${zu.a}</b><small>${esc(zuS.de)} · ${esc(zuS.name)}</small></span></a>` : '';
    const zeilen = IDX.suren.map((s) => sureZeile(s)).join('');
    seite(`
      <section class="held">
        <h2>Der ganze Koran – Vers für Vers geprüft</h2>
        <p>Arabisch, eigene deutsche Übersetzung, auf Wunsch Englisch. Dazu kritische, ehrliche Notizen: Widersprüche, Psychologie der Sprache, Wissenschaft, Geschichte, Parallelen, Hadith und Sira.</p>
        <div class="zahlen">
          <div><b>${z.suren}</b><span>Suren</span></div><div><b>${z.verse.toLocaleString('de-DE')}</b><span>Verse</span></div>
          <div><b>${z.notizen.toLocaleString('de-DE')}</b><span>Notizen</span></div><div><b>${z.themen}</b><span>Themen</span></div>
        </div>
        <div class="held-knoepfe">
          <a class="knopf hell" href="#/s/1">Mit Sure 1 beginnen</a>
          <a class="knopf" href="#/filter">Stellen nach Thema</a>
        </div>
      </section>
      ${weiter}
      <a class="suchfeld-falsch" href="#/suche"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>Suchen: Wort, Sure oder „4:34“</a>
      <div class="ort-filter" role="group" aria-label="Nach Ort filtern">
        <button type="button" class="chip ${ortFilter === 'alle' ? 'an' : ''}" data-act="ort" data-o="alle">Alle 114</button>
        <button type="button" class="chip ${ortFilter === 'mk' ? 'an' : ''}" data-act="ort" data-o="mk"><i style="background:var(--mk)"></i>Mekka</button>
        <button type="button" class="chip ${ortFilter === 'md' ? 'an' : ''}" data-act="ort" data-o="md"><i style="background:var(--md)"></i>Medina</button>
        <span class="legende">Balken = Notizen nach Kategorie</span>
      </div>
      <ul class="suren" id="surenliste">${zeilen}</ul>`);
    ortAnwenden();
  }
  function sureZeile(s) {
    const ges = Object.values(s.k).reduce((x, y) => x + y, 0) || 1;
    const bar = KATLISTE.filter((k) => s.k[k.k]).map((k) => `<i class="k-${k.k}" style="flex:${s.k[k.k]}"></i>`).join('');
    return `<li class="sure-zeile o-${s.o}" data-o="${s.o}"><a href="#/s/${s.nr}">
      <span class="nr">${s.nr}</span>
      <span class="sure-name"><b>${esc(s.de)}</b><small>${esc(s.name)} · ${s.o === 'md' ? 'Medina' : 'Mekka'}</small></span>
      <span class="sure-ar" lang="ar">${esc(s.ar.replace(/^سُ?و?ْ?رَ?ةُ?\s*/, ''))}</span>
      <span class="sure-meta"><span>${s.v} Verse · ${s.z} Notizen</span><span class="bar" aria-hidden="true" data-g="${ges}">${bar}</span></span>
    </a></li>`;
  }
  function ortAnwenden() {
    $$('#surenliste li').forEach((li) => { li.hidden = ortFilter !== 'alle' && li.dataset.o !== ortFilter; });
  }

  // ------------------------------------------------------------ Sure
  let SD = null;            // Daten der offenen Sure
  let sureRender = 0;
  async function zeigeSure(t, nr, vers, nid, ohneScroll) {
    const S = SUREN[nr];
    if (!S) { kopfSetzen('Nicht gefunden', 'lesen', true); seite('<div class="hinweis">Diese Sure gibt es nicht.</div>'); ansicht = { typ: 'x' }; return; }
    if (vers > S.v) vers = S.v;
    if (ansicht.typ === 'sure' && ansicht.nr === nr && SD && SD.nr === nr && $('#verse')) {
      kopfSetzen(`${nr} · ${S.de}`, 'lesen', true);
      if (vers && !ohneScroll && vers !== ansicht.vers) springe(vers, !nid);
      if (!ohneScroll) ansicht.vers = vers;
      if (nid) notizOeffnen(nid); else if (blattArt === 'notiz') blattZu();
      return;
    }
    kopfSetzen(`${nr} · ${S.de}`, 'lesen', true);
    ansicht = { typ: 'sure', nr, vers };
    ladeAnzeige();
    const d = await lade('s/' + pad3(nr) + '.json');
    if (t !== token) return;
    SD = d;
    SD.nachId = {};
    d.notizen.forEach((n, i) => { SD.nachId[n.id] = i; });
    sureAufbauen(vers);
    if (vers) springe(vers, !nid);
    else window.scrollTo(0, 0);
    if (nid) notizOeffnen(nid);
  }
  function sureAufbauen(bisVers) {
    const d = SD; const S = SUREN[d.nr];
    const intro = d.intro || {};
    const katZ = KATLISTE.filter((k) => S.k[k.k]);
    const felder = [['inhalt', 'Inhalt'], ['zeit', 'Zeit der Entstehung'], ['aufbau', 'Aufbau'], ['kontext', 'Kontext']]
      .filter(([k]) => intro[k])
      .map(([k, l], i) => `<details ${i === 0 ? 'open' : ''}><summary>${l}</summary><div class="txt">${absaetze(intro[k])}</div></details>`).join('');
    const vor = SUREN[d.nr - 1]; const nach = SUREN[d.nr + 1];
    seite(`
      <div class="unterkopf">
        <form class="vers-sprung" id="vers-sprung"><label for="vers-ein">Vers</label>
          <input id="vers-ein" inputmode="numeric" enterkeyhint="go" autocomplete="off" placeholder="1–${d.n}" aria-label="Zu Vers springen"></form>
        <button type="button" class="knopf" data-act="alle">Notizen ${d.notizen.length}</button>
        <span class="rechts"><button type="button" class="ikon-knopf text" data-act="en" aria-pressed="${einst.en}" aria-label="Englische Übersetzung (Pickthall) zeigen">EN</button>
          <button type="button" class="ikon-knopf" data-act="einst" aria-label="Ansicht einstellen">
          <svg viewBox="0 0 24 24" aria-hidden="true"><text x="2" y="17" style="font-size:13px">A</text><text x="11" y="17" style="font-size:9px">a</text><path d="M17 8h5M17 13h5M17 18h5"/></svg></button></span>
      </div>
      <header class="sure-kopf">
        <div class="ar-name" lang="ar">${esc(d.ar)}</div>
        <h2>${esc(d.de)}</h2>
        <div class="sub">Sure ${d.nr} · ${esc(d.name)}${d.en ? ' · ' + esc(d.en) : ''}</div>
        <div class="chips"><span class="chip ort-${d.o}">${esc(d.ort)}</span><span class="chip">${d.n} Verse</span><span class="chip">${d.notizen.length} Notizen</span></div>
      </header>
      <section class="einleitung" aria-label="Einleitung zur Sure">
        ${felder}
        ${katZ.length ? `<div class="kat-uebersicht"><span class="bar" aria-hidden="true">${katZ.map((k) => `<i class="k-${k.k}" style="flex:${S.k[k.k]}"></i>`).join('')}</span>
          <div class="chips">${katZ.map((k) => `<button type="button" class="chip" data-act="alle" data-k="${k.k}">${dot(k.k)}${esc(k.n)} ${S.k[k.k]}</button>`).join('')}</div></div>` : ''}
      </section>
      ${basmalaHTML()}
      <div class="verse ${einst.no ? '' : 'ohne-notizen'}" id="verse"></div>
      <div class="mehr-laden" id="mehr-laden">Verse werden geladen …</div>
      <nav class="sure-nav" aria-label="Nachbar-Suren">
        ${vor ? `<a href="#/s/${vor.nr}"><small>‹ Sure ${vor.nr}</small><b>${esc(vor.de)}</b></a>` : '<span style="flex:1"></span>'}
        ${nach ? `<a class="rechts" href="#/s/${nach.nr}"><small>Sure ${nach.nr} ›</small><b>${esc(nach.de)}</b></a>` : '<span style="flex:1"></span>'}
      </nav>`);
    $('#vers-sprung').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = parseInt(String($('#vers-ein').value).replace(/^\d+\s*:\s*/, ''), 10);
      if (v >= 1 && v <= d.n) { $('#vers-ein').blur(); ansicht.vers = 0; geh(`#/s/${d.nr}/${v}`); } else toast(`Vers 1 bis ${d.n}`);
    });
    // in Blöcken: bis zum Ziel sofort, den Rest stückweise anhängen (verschiebt nichts oberhalb)
    const box = $('#verse');
    const erst = Math.min(d.n, Math.max(30, (bisVers || 0) + 14));
    box.insertAdjacentHTML('beforeend', verseHTML(1, erst));
    const r = ++sureRender;
    const weiter = () => {          // zählt jedes Mal neu im DOM – springe() darf vorher schon Verse anhängen
      if (r !== sureRender || !document.body.contains(box)) return;
      const ab = box.children.length + 1;
      if (ab > d.n) { const m = $('#mehr-laden'); if (m) m.hidden = true; return; }
      box.insertAdjacentHTML('beforeend', verseHTML(ab, Math.min(d.n, ab + 39)));
      setTimeout(weiter, 16);
    };
    if (erst >= d.n) $('#mehr-laden').hidden = true; else setTimeout(weiter, 60);
  }
  // Basmala: in Sure 1 Vers 1, sonst Eingangsformel über der Sure (nicht mitgezählt), in Sure 9 fehlt sie.
  function basmalaHTML() {
    const b = SD && SD.bas;
    if (!b) return '';
    return `<div class="basmala" id="basmala">
      ${einst.ar ? `<p class="ar" lang="ar" dir="rtl">${esc(b[0])}</p>` : ''}
      <p class="de">${esc(b[1])}</p>
      <small>Basmala · steht über der Sure, wird hier nicht als Vers gezählt</small>
    </div>`;
  }
  function verseHTML(von, bis) {
    const out = [];
    for (let a = von; a <= bis; a++) out.push(versHTML(a));
    return out.join('');
  }
  function versHTML(a) {
    const d = SD; const [ar, de, en] = d.v[a - 1];
    const ank = d.anker[a] || [];
    const ber = d.bereich[a];
    let cls = 'v'; let st = '';
    const farbeVon = (i) => { const n = d.notizen[i]; return n && n.kat && n.kat[0] ? `--kb:var(--k-${n.kat[0]})` : ''; };
    if (ank.length) { cls += ' ank'; st = farbeVon(ank[0]); } else if (ber != null) { cls += ' inb'; st = farbeVon(ber); }
    const ref = `${d.nr}:${a}`;
    const fl = !!FAHNEN[ref];
    const kats = [];
    ank.forEach((i) => (d.notizen[i].kat || []).forEach((k) => { if (!kats.includes(k)) kats.push(k); }));
    const chips = ank.map((i) => {
      const n = d.notizen[i];
      return `<button type="button" class="nc" data-act="notiz" data-n="${i}" style="${farbeVon(i)}">
        <span class="dots">${(n.kat || []).slice(0, 5).map(dot).join('')}</span><span class="nct">${esc(n.titel)}</span>${statusHTML(n.status)}<span class="pfeil"></span></button>`;
    }).join('');
    return `<article class="${cls}" id="v${a}" data-a="${a}" style="${st}">
      <div class="vk"><button type="button" class="vn" data-act="vers" aria-label="Vers ${ref} kopieren">${ref}</button>
        ${kats.length ? `<span class="dots" aria-hidden="true">${kats.slice(0, 8).map(dot).join('')}</span>` : ''}
        <button type="button" class="fa" data-act="fahne" aria-pressed="${fl}" aria-label="Fähnchen an ${ref}">${FAHNE_SVG}</button></div>
      ${einst.ar ? `<p class="ar" lang="ar" dir="rtl">${esc(ar)}<span class="aend">${arabZahl(a)}</span></p>` : ''}
      <p class="de">${esc(de)}</p>
      ${einst.en && en ? `<p class="en" lang="en">${esc(en)}</p>` : ''}
      ${chips ? `<div class="nl">${chips}</div>` : ''}
    </article>`;
  }
  const FAHNE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4"/><path d="M6 4.5c4-2 7 2 12 0v8c-5 2-8-2-12 0z"/></svg>';
  function versOffset() {
    const uk = $('.unterkopf');
    const klebt = uk && getComputedStyle(uk).position === 'sticky';
    return kopf.offsetHeight + (klebt ? uk.offsetHeight : 0) + 6;
  }
  function springe(a, blitz) {
    let el = document.getElementById('v' + a);
    if (!el && SD) { // noch nicht angehängt: bis dahin sofort einfügen
      const box = $('#verse');
      const da = box ? box.children.length : 0;
      if (box && a > da) box.insertAdjacentHTML('beforeend', verseHTML(da + 1, Math.min(SD.n, a + 14)));
      el = document.getElementById('v' + a);
    }
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - versOffset();
    window.scrollTo(0, Math.max(0, y));
    if (blitz) { el.classList.remove('ziel'); void el.offsetWidth; el.classList.add('ziel'); }
    Sp.set('zuletzt', { s: SD.nr, a });
  }
  // Leseposition merken (für „Weiterlesen“)
  let merkT = 0;
  window.addEventListener('scroll', () => {
    if (ansicht.typ !== 'sure' || !SD) return;
    clearTimeout(merkT);
    merkT = setTimeout(() => {
      const el = document.elementFromPoint(Math.min(window.innerWidth - 30, window.innerWidth / 2), versOffset() + 20);
      const v = el && el.closest && el.closest('.v');
      if (v) Sp.set('zuletzt', { s: SD.nr, a: +v.dataset.a });
    }, 500);
  }, { passive: true });

  function neuZeichnenAmOrt() {
    if (ansicht.typ !== 'sure' || !SD) return;
    const el = document.elementFromPoint(window.innerWidth / 2, versOffset() + 20);
    const v = el && el.closest && el.closest('.v');
    const a = v ? +v.dataset.a : 0;
    const box = $('#verse');
    const enK = $('[data-act="en"]');
    if (enK) enK.setAttribute('aria-pressed', String(einst.en));
    const anzahl = box.children.length;
    box.className = 'verse' + (einst.no ? '' : ' ohne-notizen');
    const bas = $('#basmala');
    if (bas) bas.outerHTML = basmalaHTML();
    box.innerHTML = verseHTML(1, Math.max(anzahl, a + 10, 30) > SD.n ? SD.n : Math.max(anzahl, a + 10, 30));
    if (a) springe(a, false);
  }

  // ------------------------------------------------------------ Blatt (Notiz-Karte, Listen, Einstellungen)
  let blattArt = null;
  let blattGepusht = false;
  function blattAuf(html, art) {
    blattInhalt.innerHTML = html;
    blattArt = art;
    blatt.classList.toggle('kompakt', art === 'einst');
    if (blatt.hidden) {
      blatt.hidden = false; blattGrund.hidden = false;
      void blatt.offsetWidth;
      blatt.classList.add('auf'); blattGrund.classList.add('auf');
    }
    blattInhalt.scrollTop = 0;
    const zu = blattInhalt.querySelector('.zu');
    if (zu) zu.focus({ preventScroll: true });
  }
  function blattZu(sofort) {
    if (blatt.hidden) { blattArt = null; return; }
    blatt.classList.remove('auf'); blattGrund.classList.remove('auf');
    blattArt = null;
    const fertig = () => { if (!blatt.classList.contains('auf')) { blatt.hidden = true; blattGrund.hidden = true; } };
    if (sofort) fertig(); else setTimeout(fertig, 330);
  }
  function blattSchliessenNutzer() {
    if (blattArt === 'notiz' && /^#\/s\/\d+\/\d+\/n\d+/.test(location.hash)) {
      const ohne = location.hash.replace(/\/n\d+$/, '');
      if (blattGepusht && stapel.length > 1) { blattGepusht = false; ohneScrollNaechste = true; history.back(); } else geh(ohne, { ersetzen: true, ohneScroll: true });
      blattZu();
    } else blattZu();
  }
  blattGrund.addEventListener('click', blattSchliessenNutzer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !blatt.hidden) blattSchliessenNutzer(); });

  const IK = {
    psy: '<svg viewBox="0 0 24 24"><path d="M12 3a7 7 0 0 0-4 12.7V19h8v-3.3A7 7 0 0 0 12 3z"/><path d="M10 22h4"/></svg>',
    wiss: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/></svg>',
    vgl: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/></svg>',
    frage: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.6V14"/><path d="M12 17.2v.1"/></svg>',
    zu: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    kopie: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  };
  function notizOeffnen(nid) {
    if (!SD) return;
    const i = SD.nachId[nid];
    if (i == null) { toast('Notiz nicht gefunden'); return; }
    const n = SD.notizen[i];
    const [s, a] = refTeile(n.ref);
    const versTxt = SD.v[a - 1] ? SD.v[a - 1][1] : '';
    const andere = (SD.anker[a] || []).filter((j) => j !== i);
    const html = `
      <div class="bk">
        <button type="button" class="chip ref-knopf" data-act="zumvers" data-a="${a}" title="Zum Vers">${esc(refHuebsch(n.ref))}</button>
        ${statusHTML(n.status)}
        <button type="button" class="ikon-knopf zu" data-act="zu" aria-label="Schließen">${IK.zu}</button>
      </div>
      <h3 id="blatt-titel">${esc(n.titel)}</h3>
      ${(n.kat || []).length ? `<div class="katz">${n.kat.map((k) => `<span>${dot(k)}${esc(KAT[k] ? KAT[k].n : k)}</span>`).join('')}</div>` : ''}
      ${versTxt ? `<blockquote class="verszitat"><small>Vers ${s}:${a} · eigene Übersetzung</small>${esc(versTxt)}</blockquote>` : ''}
      <div class="prosa">${absaetze(n.text)}</div>
      ${n.psy ? `<section class="feld psy"><h4>${IK.psy}Psychologie der Sprache</h4><div class="prosa">${absaetze(n.psy)}</div></section>` : ''}
      ${n.wiss ? `<section class="feld wiss"><h4>${IK.wiss}Wissenschaft</h4><div class="prosa">${absaetze(n.wiss)}</div></section>` : ''}
      ${n.vgl ? `<section class="feld vgl"><h4>${IK.vgl}Vergleich: Bibel, Talmud, vorislamisch</h4><div class="prosa">${absaetze(n.vgl)}</div></section>` : ''}
      ${n.frage ? `<section class="feld frage"><h4>${IK.frage}Zum Nachdenken</h4><div class="prosa"><p>${inline(n.frage)}</p></div></section>` : ''}
      ${(n.qv || []).length ? `<h2 class="abschnitt-titel">Querverweise</h2><div class="qv">${n.qv.map((q) => `<button type="button" class="chip" data-act="qv" data-ref="${esc(q)}">${esc(refHuebsch(q))}</button>`).join('')}</div>` : ''}
      ${(n.quellen || []).length ? `<h2 class="abschnitt-titel">Quellen</h2><ul class="quellen">${n.quellen.map((q) => `<li>${q.u ? `<a href="${esc(q.u)}" target="_blank" rel="noopener noreferrer">${esc(q.t)}</a>` : esc(q.t)}</li>`).join('')}</ul>` : ''}
      <div class="aktionen">
        <button type="button" class="knopf" data-act="kopie" data-id="${esc(n.id)}">${IK.kopie}Karte kopieren</button>
        <button type="button" class="knopf" data-act="fahne-blatt" data-ref="${s}:${a}">${FAHNE_SVG.replace('<svg', '<svg style="width:19px;height:19px"')}${FAHNEN[`${s}:${a}`] ? 'Fähnchen entfernen' : 'Fähnchen setzen'}</button>
      </div>
      ${andere.length ? `<div class="weitere"><h2 class="abschnitt-titel">Weitere Notizen zu ${s}:${a}</h2><ul class="liste-notizen">${andere.map((j) => notizZeile(SD.notizen[j], j)).join('')}</ul></div>` : ''}`;
    blattAuf(html, 'notiz');
    blattInhalt.dataset.id = nid;
  }
  function notizZeile(n, j) {
    return `<li><button type="button" class="nc" data-act="notiz-wechsel" data-n="${j}" style="${n.kat && n.kat[0] ? `--kb:var(--k-${n.kat[0]})` : ''}">
      <span class="dots">${(n.kat || []).slice(0, 5).map(dot).join('')}</span><span class="nct"><small style="color:var(--ink3);font-weight:700">${esc(refHuebsch(n.ref))}</small> ${esc(n.titel)}</span>${statusHTML(n.status)}<span class="pfeil"></span></button></li>`;
  }
  function notizKarteText(n) {
    const [s, a] = refTeile(n.ref);
    const teile = String(n.ref).split(',')[0].split('-');
    const bis = Math.min(teile[1] ? +teile[1] : a, a + 2);
    const verse = [];
    for (let v = a; v <= bis; v++) if (SD.v[v - 1]) verse.push(`(${s}:${v}) ${SD.v[v - 1][1]}`);
    const L = [`„${n.titel}“ – Koran ${refHuebsch(n.ref)} [${STATUS[n.status] ? STATUS[n.status][0] : n.status}]`, ''];
    L.push('Vers (eigene Übersetzung): ' + verse.join(' ') + (bis < (teile[1] ? +teile[1] : a) ? ' …' : ''), '', n.text);
    if (n.psy) L.push('', 'Psychologie der Sprache: ' + n.psy);
    if (n.wiss) L.push('', 'Wissenschaft: ' + n.wiss);
    if (n.vgl) L.push('', 'Vergleich: ' + n.vgl);
    if (n.frage) L.push('', 'Frage: ' + n.frage);
    if ((n.quellen || []).length) { L.push('', 'Quellen:'); n.quellen.forEach((q) => L.push('- ' + q.t + (q.u ? ' – ' + q.u : ''))); }
    L.push('', 'Koran im Faktencheck: ' + APP_URL + `#/s/${s}/${a}`);
    return L.join('\n');
  }
  function alleNotizenBlatt(kFilter) {
    const d = SD; const S = SUREN[d.nr];
    const katZ = KATLISTE.filter((k) => S.k[k.k]);
    const liste = d.notizen.map((n, j) => [n, j]).filter(([n]) => !kFilter || (n.kat || []).includes(kFilter));
    blattAuf(`
      <div class="bk"><b style="font-size:17px">Notizen in Sure ${d.nr}</b><button type="button" class="ikon-knopf zu" data-act="zu" aria-label="Schließen">${IK.zu}</button></div>
      <div class="chips zeile" style="margin-bottom:12px">
        <button type="button" class="chip ${kFilter ? '' : 'an'}" data-act="alle">Alle ${d.notizen.length}</button>
        ${katZ.map((k) => `<button type="button" class="chip ${kFilter === k.k ? 'an' : ''}" data-act="alle" data-k="${k.k}">${dot(k.k)}${esc(k.n)} ${S.k[k.k]}</button>`).join('')}
      </div>
      <ul class="liste-notizen">${liste.map(([n, j]) => notizZeile(n, j)).join('') || '<li class="leer">Keine Notizen.</li>'}</ul>`, 'liste');
  }
  function einstBlatt() {
    const sch = (k, titel, unter) => `<label class="zeile"><span>${titel}<small>${unter}</small></span><span class="schalter"><input type="checkbox" data-einst="${k}" ${einst[k] ? 'checked' : ''}><i></i></span></label>`;
    blattAuf(`
      <div class="bk"><b style="font-size:17px">Ansicht</b><button type="button" class="ikon-knopf zu" data-act="zu" aria-label="Schließen">${IK.zu}</button></div>
      <div class="einstellungen">
        ${sch('ar', 'Arabischer Text', 'Tanzil, unverändert, von rechts nach links')}
        ${sch('en', 'Englisch (Pickthall 1930)', 'gemeinfreie Übersetzung zum Vergleich')}
        ${sch('no', 'Notizen an den Versen', 'farbige Punkte und Karten')}
        <div class="zeile"><span>Schriftgröße</span><span class="groesse">
          ${[[0.9, 'A−'], [1, 'A'], [1.15, 'A+'], [1.3, 'A++']].map(([g, l]) => `<button type="button" data-gr="${g}" class="${einst.gr === g ? 'an' : ''}" aria-label="Schriftgröße ${l}">${l}</button>`).join('')}
        </span></div>
      </div>
      <p class="such-info">${speicherOk ? 'Einstellungen bleiben auf diesem Gerät gespeichert.' : 'Dieser Browser-Modus erlaubt kein Speichern – die Einstellungen gelten nur bis zum Schließen.'}</p>`, 'einst');
  }
  blattInhalt.addEventListener('change', (e) => {
    const k = e.target.dataset && e.target.dataset.einst;
    if (!k) return;
    einst[k] = e.target.checked;
    Sp.set('einst', einst);
    neuZeichnenAmOrt();
  });

  // ------------------------------------------------------------ Fähnchen
  function fahneUmschalten(ref) {
    const [s, a] = refTeile(ref);
    if (FAHNEN[ref]) delete FAHNEN[ref];
    else {
      let de = '';
      if (SD && SD.nr === s && SD.v[a - 1]) de = SD.v[a - 1][1];
      FAHNEN[ref] = { t: Date.now(), de: de.length > 180 ? de.slice(0, 180) + ' …' : de };
    }
    const ok = Sp.set('fahnen', FAHNEN);
    $$(`#v${a} .fa`).forEach((b) => { if (SD && SD.nr === s) b.setAttribute('aria-pressed', String(!!FAHNEN[ref])); });
    toast(FAHNEN[ref] ? (ok ? `Fähnchen an ${ref} gesetzt` : `Fähnchen an ${ref} – kann hier nicht dauerhaft gespeichert werden`) : `Fähnchen an ${ref} entfernt`);
  }
  function zeigeFahnen() {
    ansicht = { typ: 'fahnen' };
    kopfSetzen('Meine Fähnchen', 'fahnen', true);
    const sort = Sp.get('fahnen-sort', 'koran');
    const refs = Object.keys(FAHNEN);
    refs.sort(sort === 'zeit' ? (x, y) => FAHNEN[y].t - FAHNEN[x].t : (x, y) => { const [a, b] = refTeile(x); const [c, d] = refTeile(y); return a - c || b - d; });
    const liste = refs.map((r) => {
      const [s, a] = refTeile(r); const S = SUREN[s];
      return `<li style="display:flex;gap:6px;align-items:stretch"><a class="eintrag" href="#/s/${s}/${a}"><span class="ref">${esc(r)}</span>
        <span class="mitte"><b>${esc(S ? S.de : '')}</b><small>${esc(FAHNEN[r].de || '')}</small></span></a>
        <button type="button" class="ikon-knopf" style="height:auto;min-height:48px" data-act="fahne-weg" data-ref="${esc(r)}" aria-label="Fähnchen ${esc(r)} entfernen">${IK.zu}</button></li>`;
    }).join('');
    seite(`
      <div class="seiten-kopf"><h2>Meine Fähnchen</h2><p>Verse, die du markiert hast – zum Wiederfinden und für Diskussionen.</p></div>
      ${refs.length ? `<div class="chips" style="margin:12px 0">
          <button type="button" class="chip ${sort === 'koran' ? 'an' : ''}" data-act="fsort" data-s="koran">Koran-Reihenfolge</button>
          <button type="button" class="chip ${sort === 'zeit' ? 'an' : ''}" data-act="fsort" data-s="zeit">Zuletzt gesetzt</button>
          <button type="button" class="chip" data-act="fkopie">Liste kopieren</button></div>
        <ul class="eintraege">${liste}</ul>` : `<div class="leer">${FAHNE_SVG.replace('<svg', '<svg width="54" height="54"')}
          <p><b>Noch keine Fähnchen.</b><br>Tippe beim Lesen auf das Fähnchen rechts neben der Versnummer.</p><a class="knopf haupt" href="#/s/1">Lesen beginnen</a></div>`}
      <p class="such-info">${speicherOk ? 'Fähnchen liegen nur in diesem Browser auf diesem Gerät – ohne Konto, ohne Synchronisierung. Wer die Website-Daten löscht oder im privaten Modus surft, verliert sie.' : 'Achtung: Dieser Browser-Modus erlaubt kein dauerhaftes Speichern. Fähnchen verschwinden beim Schließen.'}</p>`);
  }

  // ------------------------------------------------------------ Themen
  async function zeigeThemen(t) {
    kopfSetzen('Themen', 'themen', true);
    ansicht = { typ: 'themen' };
    ladeAnzeige();
    const liste = await lade('themen.json');
    if (t !== token) return;
    const karte = (x) => `<a class="thema-karte ${x.art}" href="#/t/${esc(x.key)}"><b>${esc(x.titel)}</b><p>${esc(x.kurz)}</p>
      <span class="mini"><span>${x.z.abschnitte} Abschnitte</span>${x.z.tabellen ? `<span>${x.z.tabellen} Tabellen</span>` : ''}${x.z.korrekturen ? `<span>${x.z.korrekturen} Korrekturen</span>` : ''}${x.z.thesen ? `<span>${x.z.thesen} Thesen</span>` : ''}</span></a>`;
    const dos = liste.filter((x) => x.art === 'dossier'); const sam = liste.filter((x) => x.art !== 'dossier');
    seite(`
      <div class="seiten-kopf"><h2>Themen</h2><p>${dos.length} Dossiers zu den großen Fragen – mit Tabellen, Korrekturen verbreiteter Irrtümer und geprüften Thesen. Versangaben sind antippbar.</p></div>
      <div class="thema-karten" style="margin-top:14px">${dos.map(karte).join('')}</div>
      ${sam.length ? `<h2 class="abschnitt-titel">Aus der ersten Recherche</h2><div class="thema-karten">${sam.map(karte).join('')}</div>` : ''}`);
  }
  async function zeigeThema(t, key, abschnitt) {
    kopfSetzen('Thema', 'themen', true);
    ansicht = { typ: 'thema', key };
    ladeAnzeige();
    const d = await lade('themen/' + encodeURIComponent(key) + '.json');
    if (t !== token) return;
    kopfSetzen(d.titel.split(/[–:]/)[0].trim(), 'themen', true);
    const verseChips = (vs) => vs.length ? `<div class="verse-chips">${vs.map((v) => `<a class="chip" href="#/s/${v.split(':')[0]}/${parseInt(v.split(':')[1], 10)}">${esc(refHuebsch(v))}</a>`).join('')}</div>` : '';
    const quellen = (qs) => qs && qs.length ? `<details class="q"><summary>Quellen (${qs.length})</summary><ul class="quellen">${qs.map((q) => `<li>${q.u ? `<a href="${esc(q.u)}" target="_blank" rel="noopener noreferrer">${esc(q.t)}</a>` : esc(q.t)}</li>`).join('')}</ul></details>` : '';
    const abs = d.abschnitte.map((a, i) => `<section class="block" id="ab${i}">
        <h3>${esc(a.titel)}</h3>
        <div class="meta">${statusHTML(a.status)}</div>
        ${verseChips(a.verse)}
        <div class="prosa">${absaetze(a.text)}</div>
        ${a.einwand ? `<div class="diskussion"><div class="einwand"><b>Einwand</b>${inline(a.einwand)}</div>${a.antwort ? `<div class="antwort"><b>Antwort</b>${inline(a.antwort)}</div>` : ''}</div>` : ''}
        ${a.frage ? `<section class="feld frage"><h4>${IK.frage}Zum Nachdenken</h4><div class="prosa"><p>${inline(a.frage)}</p></div></section>` : ''}
        ${quellen(a.quellen)}
      </section>`).join('');
    const tabs = d.tabellen.map((tb, i) => `<section class="block" id="tab${i}"><h3>${esc(tb.titel)}</h3><div class="tabelle-huelle"><table class="tab">
        <thead><tr>${tb.spalten.map((s) => `<th>${esc(s)}</th>`).join('')}</tr></thead>
        <tbody>${tb.zeilen.map((z) => `<tr>${z.map((c, j) => `<td data-l="${esc(tb.spalten[j])}">${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('');
    const X = '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>';
    const H = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    const kor = d.korrekturen.map((k) => `<div class="korrektur">
        ${k.behauptung ? `<div class="falsch"><span class="ikon">${X}</span><span>${inline(k.behauptung)}</span></div>` : ''}
        <div class="richtig"><span class="ikon">${H}</span><span><b>Richtig ist:</b>${inline(k.richtig)}</span></div></div>`).join('');
    const th = d.thesen.map((x) => `<div class="these-karte ac-${ampelKl(x.status)}"><q>${esc(x.these)}</q>${ampelHTML(x.status)}${x.bewertung ? `<p>${inline(x.bewertung)}</p>` : '<p>Im Thema behandelt; ohne eigenes Kurzurteil.</p>'}</div>`).join('');
    const disk = (d.diskussion || []).map((x) => `<section class="block diskussion"><h3>${esc(x.titel)}</h3>
        ${x.frage ? `<p style="margin:0 0 6px;color:var(--ink2)"><b>Frage:</b> ${inline(x.frage)}</p>` : ''}
        <div class="einwand"><b>Einwand</b>${inline(x.einwand)}</div><div class="antwort"><b>Antwort</b>${inline(x.antwort)}</div>${quellen(x.quellen)}</section>`).join('');
    const toc = [['abschnitte', 'Abschnitte', d.abschnitte.length], ['tabellen', 'Tabellen', d.tabellen.length], ['korrekturen', 'Korrekturen', d.korrekturen.length], ['thesen', 'Thesen Xander', d.thesen.length], ['diskussion', 'Für Diskussionen', (d.diskussion || []).length]]
      .filter((x) => x[2]).map(([id, l, z]) => `<button type="button" class="chip" data-act="sprung" data-id="sek-${id}">${l} ${z}</button>`).join('');
    seite(`
      <header class="thema-kopf"><div class="art">${d.art === 'dossier' ? 'Dossier' : 'Aus der ersten Recherche'}</div><h2>${esc(d.titel)}</h2><p class="lead">${inline(d.kurz)}</p></header>
      <div class="chips zeile inhalt-chips">${toc}</div>
      <div id="sek-abschnitte">${abs}</div>
      ${tabs ? `<h2 class="abschnitt-titel" id="sek-tabellen">Tabellen</h2>${tabs}` : ''}
      ${kor ? `<h2 class="abschnitt-titel" id="sek-korrekturen">Korrekturen: Das stimmt so nicht – richtig ist …</h2>${kor}` : ''}
      ${th ? `<h2 class="abschnitt-titel" id="sek-thesen">Thesen Xander – geprüft</h2>${th}` : ''}
      ${disk ? `<h2 class="abschnitt-titel" id="sek-diskussion">Für Diskussionen: Einwand und Antwort</h2>${disk}` : ''}
      <p style="margin-top:22px"><a class="knopf" href="#/themen">Alle Themen</a></p>`);
    if (abschnitt && document.getElementById(abschnitt)) setTimeout(() => sprungZu(abschnitt), 30);
  }
  function sprungZu(id) {
    const el = document.getElementById(id);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - kopf.offsetHeight - 10);
  }

  // ------------------------------------------------------------ Filter / Kategorien
  let filterStatus = '';
  async function zeigeFilter(t, k) {
    kopfSetzen(k && KAT[k] ? KAT[k].n : 'Filter', 'filter', true);
    ansicht = { typ: 'filter', k };
    if (!k || !KAT[k]) {
      seite(`<div class="seiten-kopf"><h2>Quer durch den Koran</h2><p>Alle Stellen einer Kategorie auf einen Blick – etwa alle Widersprüche, alle Gewaltstellen mit Kontext oder alle Wissenschaftsaussagen.</p></div>
        <div class="karten" style="margin-top:14px">${KATLISTE.map((x) => `<a class="kat-karte k-${x.k}" href="#/filter/${x.k}"><b>${dot(x.k)}${esc(x.n)}</b><small>${esc(x.t)}</small><span class="z">${x.z}</span></a>`).join('')}</div>
        <h2 class="abschnitt-titel">Wie sicher?</h2>
        <div class="hinweis">${Object.keys(STATUS).map((s) => `<p style="margin:4px 0">${statusHTML(s)} ${esc(STATUS[s][1])} – ${(IDX.status_z || {})[s] || 0} Notizen</p>`).join('')}</div>`);
      return;
    }
    ladeAnzeige();
    const d = await lade('kategorien.json');
    if (t !== token) return;
    const ids = d.liste[k] || [];
    const zs = { belegt: 0, umstritten: 0, deutung: 0 };
    ids.forEach((id) => { const n = d.notiz[id]; if (n) zs[n[2]] = (zs[n[2]] || 0) + 1; });
    let html = ''; let letzte = 0; let anzahl = 0;
    ids.forEach((id) => {
      const n = d.notiz[id]; if (!n) return;
      if (filterStatus && n[2] !== filterStatus) return;
      const [s, a] = refTeile(n[0]);
      if (s !== letzte) {
        if (letzte) html += '</ul>';
        const S = SUREN[s];
        html += `<div class="gruppe-titel"><span class="nr o-${S.o}">${s}</span>${esc(S.de)} <small style="color:var(--ink3);font-weight:600">${esc(S.name)}</small></div><ul class="eintraege">`;
        letzte = s;
      }
      anzahl++;
      html += `<li><a class="eintrag" href="#/s/${s}/${a}/${id}"><span class="ref">${esc(refHuebsch(n[0]))}</span><span class="mitte"><b>${esc(n[1])}</b></span>${statusHTML(n[2])}</a></li>`;
    });
    if (letzte) html += '</ul>';
    seite(`<div class="seiten-kopf"><h2>${dot(k)} ${esc(KAT[k].n)}</h2><p>${esc(KAT[k].t)} · ${ids.length} Stellen</p></div>
      <div class="chips zeile" style="margin:12px 0 4px">
        <button type="button" class="chip ${filterStatus ? '' : 'an'}" data-act="fstatus" data-s="">Alle ${ids.length}</button>
        ${Object.keys(STATUS).map((s) => `<button type="button" class="chip ${filterStatus === s ? 'an' : ''}" data-act="fstatus" data-s="${s}">${STATUS[s][0]} ${zs[s] || 0}</button>`).join('')}
      </div>
      <div class="chips zeile" style="margin:6px 0 2px">${KATLISTE.filter((x) => x.k !== k).map((x) => `<a class="chip" href="#/filter/${x.k}">${dot(x.k)}${esc(x.n)}</a>`).join('')}</div>
      ${anzahl ? html : '<div class="leer">Keine Stellen mit diesem Status.</div>'}`);
  }

  // ------------------------------------------------------------ Thesen
  let thesenFilter = '';
  async function zeigeThesen(t) {
    kopfSetzen('Thesen Xander', 'thesen', true);
    ansicht = { typ: 'thesen' };
    ladeAnzeige();
    const d = await lade('thesen.json');
    if (t !== token) return;
    const z = {}; AMPEL_REIHE.forEach((a) => { z[a] = 0; });
    d.dossier.forEach((x) => { z[x.status] = (z[x.status] || 0) + 1; });
    const ges = d.dossier.length || 1;
    const vertKl = { 'gestützt': 'g', teilweise: 't', 'nicht gestützt': 'n', offen: 'o', ohne: 'x' };
    const vert = (zz, n) => `<div class="verteilung" aria-hidden="true">${AMPEL_REIHE.filter((a) => zz[a]).map((a) => `<i class="${vertKl[a]}" style="width:${(100 * zz[a] / n).toFixed(2)}%"></i>`).join('')}</div>`;
    const passt = (s) => !thesenFilter || s === thesenFilter;
    // 1. aus den Dossiers, nach Thema
    const nachThema = {};
    d.dossier.filter((x) => passt(x.status)).forEach((x) => { (nachThema[x.thema] = nachThema[x.thema] || { titel: x.thema_titel, l: [] }).l.push(x); });
    const teil1 = Object.entries(nachThema).map(([key, g]) => `<div class="gruppe-titel" style="position:static"><a href="#/t/${esc(key)}/sek-thesen" style="text-decoration:none">${esc(g.titel)}</a></div>
      ${g.l.map((x) => `<div class="these-karte ac-${ampelKl(x.status)}"><q>${esc(x.these)}</q>${ampelHTML(x.status)}<p>${inline(x.bewertung)}</p></div>`).join('')}`).join('');
    // 2. an Versen
    const teil2 = d.vers.map((g) => {
      const ein = g.eintraege.filter((x) => passt(x.status));
      if (!ein.length) return '';
      const zz = {}; ein.forEach((x) => { zz[x.status] = (zz[x.status] || 0) + 1; });
      return `<details class="gruppe"><summary><b>${esc(g.label)}</b><small>${ein.length} Stellen · ${AMPEL_REIHE.filter((a) => zz[a]).map((a) => `${zz[a]} ${ampelTxt(a)}`).join(' · ')}</small>${vert(zz, ein.length)}</summary>
        <ul class="eintraege">${ein.map((x) => { const [s, a] = refTeile(x.ref); return `<li><a class="eintrag" href="#/s/${s}/${a}/${esc(x.id)}"><span class="ref">${esc(refHuebsch(x.ref))}</span><span class="mitte"><b>${esc(x.titel)}</b>${ampelHTML(x.status)}<small>${esc(x.bewertung)}</small></span></a></li>`; }).join('')}</ul></details>`;
    }).join('');
    // 3. erste Recherche
    const teil3 = (!thesenFilter || thesenFilter === 'ohne') ? d.alt.map((x) => `<div class="these-karte ac-ohne"><q>${esc(x.these)}</q>
        <div class="fuss">${ampelHTML('ohne')}<a href="#/t/${esc(x.thema)}">${esc(x.thema_titel)}</a></div></div>`).join('') : '';
    seite(`
      <div class="seiten-kopf"><h2>Thesen Xander – ehrlich geprüft</h2>
        <p>Xander, der Initiator dieser App, hat eigene Thesen eingebracht. Sie werden hier nicht übernommen, sondern geprüft wie jede andere Behauptung: mit Ampel und Begründung – auch dort, wo sie nicht halten.</p></div>
      ${vert(z, ges)}
      <div class="chips zeile" style="margin:8px 0 4px">
        <button type="button" class="chip ${thesenFilter ? '' : 'an'}" data-act="tfilter" data-s="">Alle</button>
        ${['gestützt', 'teilweise', 'nicht gestützt', 'offen'].map((a) => `<button type="button" class="chip ${thesenFilter === a ? 'an' : ''}" data-act="tfilter" data-s="${a}"><span class="am am-${ampelKl(a)}" style="padding:0;background:none"></span>${ampelTxt(a)}</button>`).join('')}
      </div>
      <h2 class="abschnitt-titel">Aus den Themen-Dossiers (${d.dossier.length})</h2>
      ${teil1 || '<div class="leer">Keine Thesen mit dieser Ampel.</div>'}
      <h2 class="abschnitt-titel">An einzelnen Versen geprüft (${d.vers.reduce((x, g) => x + g.eintraege.length, 0)})</h2>
      ${teil2 || '<div class="leer">Keine Stellen mit dieser Ampel.</div>'}
      ${teil3 ? `<h2 class="abschnitt-titel">Aus der ersten Recherche – ohne eigenes Kurzurteil</h2>${teil3}` : ''}`);
  }

  // ------------------------------------------------------------ Suche
  let SUCHE = null;
  let suchText = '';
  let suchMehr = 100;
  async function ladeSuche() {
    if (SUCHE) return SUCHE;
    const d = await lade('suche-de.json');
    const vn = [];
    d.v.forEach((arr, i) => arr.forEach((t, j) => vn.push([i + 1, j + 1, norm(t), t])));
    const nn = d.n.map((x) => [x, norm(x[2] + ' ' + x[3])]);
    SUCHE = { vn, nn };
    return SUCHE;
  }
  async function zeigeSuche(t, q) {
    kopfSetzen('Suche', 'suche', true);
    ansicht = { typ: 'suche' };
    if (q) suchText = q;
    seite(`
      <form class="suchleiste" id="suchform" role="search"><div class="feld-such">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>
        <input id="such-ein" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Wort, Sure oder 4:34" value="${esc(suchText)}" aria-label="Suchbegriff">
      </div></form>
      <div id="such-erg"></div>`);
    const ein = $('#such-ein');
    let st = 0;
    ein.addEventListener('input', () => { clearTimeout(st); suchMehr = 100; st = setTimeout(() => sucheAusfuehren(ein.value), 180); });
    $('#suchform').addEventListener('submit', (e) => {
      e.preventDefault();
      const r = direktRef(ein.value);
      if (r) { ein.blur(); geh(r.hash); } else sucheAusfuehren(ein.value);
    });
    if (!suchText) setTimeout(() => ein.focus(), 60);
    const merk = istZurueck ? scrollMerk.get(location.hash) : 0;
    sucheAusfuehren(suchText).then(() => { if (merk && t === token) window.scrollTo(0, merk); });
    ladeSuche().catch(() => {});      // Index schon holen, während getippt wird
  }
  function direktRef(q) {
    let m = /^\s*(?:sure\s*|q\s*)?(\d{1,3})\s*[:.,/ ]\s*(\d{1,3})\s*$/i.exec(q);
    if (m && SUREN[+m[1]] && +m[2] >= 1 && +m[2] <= SUREN[+m[1]].v) return { hash: `#/s/${+m[1]}/${+m[2]}`, label: `Vers ${+m[1]}:${+m[2]} öffnen`, s: +m[1], a: +m[2] };
    m = /^\s*(?:sure\s*)?(\d{1,3})\s*$/i.exec(q);
    if (m && SUREN[+m[1]]) return { hash: `#/s/${+m[1]}`, label: `Sure ${+m[1]} öffnen`, s: +m[1] };
    return null;
  }
  async function sucheAusfuehren(q) {
    suchText = q;
    const box = $('#such-erg'); if (!box) return;
    const n = norm(q).trim();
    if (!n) {
      box.innerHTML = `<div class="such-tipps"><p class="such-info">Probier zum Beispiel:</p><div class="chips">
        ${['4:34', '2:256', '9:5', 'Sure 18', 'Embryo', 'kein Zwang', 'Schwein', 'Mose', 'Paradies'].map((x) => `<button type="button" class="chip" data-act="tipp" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <p class="such-info">Die Suche durchsucht die deutsche Übersetzung, die Titel und Anfänge aller Notizen und die Surennamen. Eine Versangabe wie „4:34“ springt direkt hin.</p></div>`;
      return;
    }
    const dr = direktRef(q);
    let html = '';
    if (dr) {
      const S = SUREN[dr.s];
      html += `<h2 class="abschnitt-titel">Direkt</h2><ul class="eintraege"><li><a class="eintrag" href="${dr.hash}"><span class="ref">${dr.a ? dr.s + ':' + dr.a : dr.s}</span><span class="mitte"><b>${esc(dr.label)}</b><small>${esc(S.de)} · ${esc(S.name)}</small></span></a></li></ul>`;
    }
    const terme = n.split(' ').filter(Boolean);
    const rx = markRegex(terme);
    const sTreffer = IDX.suren.filter((s) => { const h = norm(s.de + ' ' + s.name + ' sure ' + s.nr); return terme.every((w) => h.includes(w)); }).slice(0, 12);
    if (sTreffer.length && !dr) html += `<h2 class="abschnitt-titel">Suren</h2><ul class="eintraege">${sTreffer.map((s) => `<li><a class="eintrag" href="#/s/${s.nr}"><span class="ref">${s.nr}</span><span class="mitte"><b>${markiere(s.de, rx)}</b><small>${markiere(s.name, rx)} · ${s.v} Verse</small></span></a></li>`).join('')}</ul>`;
    box.innerHTML = html + (SUCHE ? '' : '<p class="such-info">Suchindex wird geladen …</p>');
    if (terme.join('').length < 2) return;
    let S;
    try { S = await ladeSuche(); } catch (e) { box.insertAdjacentHTML('beforeend', '<div class="hinweis fehler">Der Suchindex ließ sich nicht laden (offline?).</div>'); return; }
    if (suchText !== q || !$('#such-erg')) return;
    const nT = S.nn.filter(([, h]) => terme.every((w) => h.includes(w)));
    const vT = [];
    for (const v of S.vn) if (terme.every((w) => v[2].includes(w))) vT.push(v);
    if (nT.length) {
      html += `<h2 class="abschnitt-titel">Notizen (${nT.length})</h2><ul class="eintraege">${nT.slice(0, 40).map(([x]) => { const [s, a] = refTeile(x[1]); return `<li><a class="eintrag" href="#/s/${s}/${a}/${esc(x[0])}"><span class="ref">${esc(refHuebsch(x[1]))}</span><span class="mitte"><b>${markiere(x[2], rx)}</b><small>${markiere(auszug(x[3], rx, 150), rx)}</small></span></a></li>`; }).join('')}</ul>${nT.length > 40 ? `<p class="such-info">… und ${nT.length - 40} weitere – Suche genauer eingrenzen.</p>` : ''}`;
    }
    if (vT.length) {
      html += `<h2 class="abschnitt-titel">Verse (${vT.length})</h2><ul class="eintraege">${vT.slice(0, suchMehr).map((v) => `<li><a class="eintrag" href="#/s/${v[0]}/${v[1]}"><span class="ref">${v[0]}:${v[1]}</span><span class="mitte"><small style="color:var(--ink);font-size:14.5px">${markiere(auszug(v[3], rx, 220), rx)}</small></span></a></li>`).join('')}</ul>
        ${vT.length > suchMehr ? `<p style="text-align:center"><button type="button" class="knopf" data-act="mehr">Weitere ${Math.min(100, vT.length - suchMehr)} Verse zeigen</button></p>` : ''}`;
    }
    if (!dr && !sTreffer.length && !nT.length && !vT.length) html += '<div class="leer"><p><b>Nichts gefunden.</b><br>Andere Schreibweise versuchen – die Übersetzung schreibt z. B. „Allah“, „Mose“, „Abraham“.</p></div>';
    box.innerHTML = html;
  }

  // ------------------------------------------------------------ Über
  function zeigeUeber() {
    ansicht = { typ: 'ueber' };
    kopfSetzen('Über diese App', '', true);
    seite(`<div class="text-seite">
      <div class="seiten-kopf"><h2>Über diese App</h2><p>${esc(IDX.einleitung)}</p></div>
      <h3>Methode</h3>
      <ul>
        <li><b>Arabischer Text:</b> unverändert aus dem Tanzil-Projekt (kufische Zählung, 6236 Verse).</li>
        <li><b>Deutsche Übersetzung:</b> eine eigene, wortnahe Übertragung aus dem Arabischen, KI-gestützt erarbeitet und gegen gängige Übersetzungen gegengeprüft. Sie ist <b>keine autorisierte</b> oder religiös anerkannte Übersetzung. Eckige Klammern [ ] sind Ergänzungen, runde Klammern nennen arabische Schlüsselwörter oder Deutungsvarianten.</li>
        <li><b>Englisch:</b> Marmaduke Pickthall, „The Meaning of the Glorious Koran“ (1930), gemeinfrei – zum Vergleich.</li>
        <li><b>Notizen und Themen:</b> kritisch und ehrlich. Sie benennen Widersprüche, die Wirkung der Sprache, Wissenschaftsaussagen, Geschichte und Kontext, Parallelen in Bibel, Talmud und vorislamischen Quellen und das, was Hadith und Sira erzählen. Wo Gelehrte oder Gläubige eine Stelle anders lesen, steht die Gegenposition dabei.</li>
        <li><b>Kritik an Texten und Ideen – nicht an Muslimen als Menschen.</b></li>
        <li><b>Thesen Xander:</b> Thesen des Initiators werden nicht übernommen, sondern geprüft – mit Ampel und Begründung.</li>
      </ul>
      <h3>Wie sicher ist eine Notiz?</h3>
      ${Object.keys(STATUS).map((s) => `<p>${statusHTML(s)} ${esc(STATUS[s][1])}</p>`).join('')}
      <h3>Kategorien</h3>
      <div class="chips">${KATLISTE.map((k) => `<a class="chip" href="#/filter/${k.k}">${dot(k.k)}${esc(k.n)}</a>`).join('')}</div>
      <h3>Ehrlich gesagt</h3>
      <ul>
        <li>Texte, Übersetzung und Notizen wurden mit KI-Unterstützung erarbeitet und geprüft. Fehler sind trotzdem möglich – darum sind die Quellen verlinkt. Im Zweifel gilt das arabische Original.</li>
        <li>Offline verfügbar ist, was du schon einmal geöffnet hast. Noch nicht geöffnete Suren brauchen eine Verbindung. Nach einer neuen Fassung lädt die App nur die geänderten Teile neu.</li>
        <li>Fähnchen, Leseposition und Einstellungen liegen nur in diesem Browser auf diesem Gerät. Es gibt kein Konto und keine Synchronisierung; im privaten Modus oder nach dem Löschen der Website-Daten sind sie weg.</li>
        <li>Die arabische Schrift kommt von deinem Gerät und sieht je nach System etwas anders aus.</li>
        <li>Keine Werbung, keine Zählpixel, keine Anmeldung.</li>
      </ul>
      <h3>Quellen und Lizenzen</h3>
      <p class="lizenz">Arabischer Text: Tanzil Quran Text, Copyright (C) 2007-2021 Tanzil Project, CC BY 3.0, <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">https://tanzil.net</a> – unverändert.</p>
      <p class="lizenz">Englische Übersetzung: M. M. Pickthall, The Meaning of the Glorious Koran (1930) – gemeinfrei.</p>
      <p class="lizenz">Deutsche Übersetzung, Notizen und Themen: eigene Texte dieser App. Zitate aus Fachliteratur sind kurz gehalten; Quellen werden verlinkt statt kopiert.</p>
      <p class="such-info">Fassung ${esc(IDX.fassung)} · Datenstand ${esc(IDX.stand)} · ${IDX.zahlen.notizen} Notizen in ${IDX.zahlen.suren} Suren</p>
    </div>`);
  }

  // ------------------------------------------------------------ Klicks (ein Verteiler für alles)
  document.addEventListener('click', async (e) => {
    const vref = e.target.closest('a.vref');
    if (vref && blatt.contains(vref) && blattArt === 'notiz' && SD) {
      e.preventDefault();
      const n = SD.notizen[SD.nachId[blattInhalt.dataset.id]];
      rueckZiel = { label: refHuebsch(n.ref).split(',')[0], nach: vref.getAttribute('href') };
      blattGepusht = false;
      geh(vref.getAttribute('href'));
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el) {
      const a = e.target.closest('.leiste a');
      if (a && a.getAttribute('href') === location.hash) { scrollMerk.delete(location.hash); window.scrollTo(0, 0); }
      return;
    }
    const act = el.dataset.act;
    if (act === 'notiz') {
      const n = SD.notizen[+el.dataset.n];
      blattGepusht = true;
      geh(`#/s/${SD.nr}/${refTeile(n.ref)[1]}/${n.id}`, { ohneScroll: true });
    } else if (act === 'notiz-wechsel') {
      const n = SD.notizen[+el.dataset.n];
      const ziel = `#/s/${SD.nr}/${refTeile(n.ref)[1]}/${n.id}`;
      if (blattArt === 'liste') { blattGepusht = true; geh(ziel, { ohneScroll: true }); setTimeout(() => springe(refTeile(n.ref)[1], false), 0); } else geh(ziel, { ersetzen: true, ohneScroll: true });
    } else if (act === 'zu') blattSchliessenNutzer();
    else if (act === 'zumvers') { const a = +el.dataset.a; blattSchliessenNutzer(); setTimeout(() => springe(a, true), 40); }
    else if (act === 'qv') {
      const [s, a] = refTeile(el.dataset.ref);
      const n = SD && SD.notizen[SD.nachId[blattInhalt.dataset.id]];
      const ziel = `#/s/${s}/${a}`;
      rueckZiel = { label: n ? refHuebsch(n.ref).split(',')[0] : 'Notiz', nach: ziel };
      blattGepusht = false;
      geh(ziel);
    } else if (act === 'vers') {
      const a = +el.closest('.v').dataset.a;
      const ok = await kopiere(`Koran ${SD.nr}:${a} (eigene Übersetzung): ${SD.v[a - 1][1]}\n${APP_URL}#/s/${SD.nr}/${a}`);
      toast(ok ? `Vers ${SD.nr}:${a} kopiert` : 'Kopieren nicht möglich');
    } else if (act === 'fahne') fahneUmschalten(`${SD.nr}:${el.closest('.v').dataset.a}`);
    else if (act === 'fahne-blatt') { fahneUmschalten(el.dataset.ref); el.lastChild.textContent = FAHNEN[el.dataset.ref] ? 'Fähnchen entfernen' : 'Fähnchen setzen'; }
    else if (act === 'fahne-weg') { delete FAHNEN[el.dataset.ref]; Sp.set('fahnen', FAHNEN); zeigeFahnen(); toast('Fähnchen entfernt'); }
    else if (act === 'fsort') { Sp.set('fahnen-sort', el.dataset.s); zeigeFahnen(); }
    else if (act === 'fkopie') {
      const refs = Object.keys(FAHNEN).sort((x, y) => { const [a, b] = refTeile(x); const [c, d] = refTeile(y); return a - c || b - d; });
      const ok = await kopiere('Meine Fähnchen (Koran im Faktencheck)\n' + refs.map((r) => `${r}: ${FAHNEN[r].de || ''}\n${APP_URL}#/s/${r.replace(':', '/')}`).join('\n'));
      toast(ok ? `${refs.length} Fähnchen kopiert` : 'Kopieren nicht möglich');
    } else if (act === 'kopie') {
      const n = SD.notizen[SD.nachId[el.dataset.id]];
      const ok = await kopiere(notizKarteText(n));
      toast(ok ? 'Karte kopiert – mit Vers und Quellen' : 'Kopieren nicht möglich');
    } else if (act === 'alle') alleNotizenBlatt(el.dataset.k || '');
    else if (act === 'einst') einstBlatt();
    else if (act === 'en') {
      einst.en = !einst.en; Sp.set('einst', einst);
      el.setAttribute('aria-pressed', String(einst.en));
      neuZeichnenAmOrt();
      toast(einst.en ? 'Englisch (Pickthall 1930) eingeblendet' : 'Englisch ausgeblendet');
    }
    else if (act === 'ort') { ortFilter = el.dataset.o; $$('[data-act="ort"]').forEach((b) => b.classList.toggle('an', b === el)); ortAnwenden(); }
    else if (act === 'fstatus') { filterStatus = el.dataset.s; const y = window.scrollY; await zeigeFilter(token, ansicht.k); window.scrollTo(0, Math.min(y, 120)); }
    else if (act === 'tfilter') { thesenFilter = el.dataset.s; const y = window.scrollY; await zeigeThesen(token); window.scrollTo(0, y); }
    else if (act === 'sprung') sprungZu(el.dataset.id);
    else if (act === 'tipp') { const ein = $('#such-ein'); ein.value = el.dataset.q; suchMehr = 100; const r = direktRef(el.dataset.q); if (r) geh(r.hash); else sucheAusfuehren(el.dataset.q); }
    else if (act === 'mehr') { suchMehr += 100; const y = window.scrollY; await sucheAusfuehren(suchText); window.scrollTo(0, y); }
    else if (act === 'neu') { cache.clear(); route(); }
  });
  blattInhalt.addEventListener('click', (e) => {
    const g = e.target.closest('[data-gr]');
    if (!g) return;
    einst.gr = +g.dataset.gr;
    Sp.set('einst', einst);
    document.documentElement.style.setProperty('--gr', einst.gr);
    $$('[data-gr]', blattInhalt).forEach((b) => b.classList.toggle('an', b === g));
  });

  // ------------------------------------------------------------ Start
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      let hatte = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hatte) { hatte = true; return; }
        toast('Neue Fassung ist da', 'Neu laden', () => location.reload());
      });
      navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Modus weiter */ });
    });
  }
})();
