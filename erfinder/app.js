// Erfinder-Check – Wer war's wirklich?
// Statische App ohne Bibliotheken. Daten: daten/app/register.json (klein, sofort) und
// daten/app/akten-<bereich>.json (volle Akten, erst bei Bedarf). Gebaut von skripte/bau_app.py.
'use strict';
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#ansicht');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');

  // ---------- Grafik (alles als SVG gezeichnet) ----------
  const ICON = {
    licht: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.3V17h5v-.9c0-.9.4-1.7 1.1-2.3A6 6 0 0 0 12 3z"/>',
    kommunikation: '<circle cx="12" cy="10" r="1.8"/><path d="M12 12v9M8.5 21h7M8.2 6.2a5.4 5.4 0 0 0 0 7.6M15.8 6.2a5.4 5.4 0 0 1 0 7.6M5.4 3.4a9.4 9.4 0 0 0 0 13.2M18.6 3.4a9.4 9.4 0 0 1 0 13.2"/>',
    verkehr: '<circle cx="6" cy="16" r="3.6"/><circle cx="18" cy="16" r="3.6"/><path d="M6 16l3.5-7h6L18 16M9.5 9L12 16H6M14 6h3"/>',
    computer: '<rect x="7" y="7" width="10" height="10" rx="1.6"/><rect x="10" y="10" width="4" height="4" rx=".6"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
    medizin: '<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z"/>',
    alltag: '<path d="M4.5 19.5l1.2-4.4L16.3 4.5a2 2 0 0 1 2.9 0l.3.3a2 2 0 0 1 0 2.9L8.9 18.3z"/><path d="M14.5 6.3l3.2 3.2M4.5 19.5l2.5-.6"/>',
    wissenschaft: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9.2" ry="3.6"/><ellipse cx="12" cy="12" rx="9.2" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.2" ry="3.6" transform="rotate(120 12 12)"/>',
    suche: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    kreuz: '<path d="M6 6l12 12M18 6L6 18"/>',
    kopieren: '<rect x="8" y="8" width="12" height="12" rx="2.2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    teilen: '<path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    wuerfel: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.3" class="v"/><circle cx="15" cy="15" r="1.3" class="v"/><circle cx="15" cy="9" r="1.3" class="v"/><circle cx="9" cy="15" r="1.3" class="v"/><circle cx="12" cy="12" r="1.3" class="v"/>',
    pfeil: '<path d="M7 17L17 7M9 7h8v8"/>',
    haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    frage: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.6 2.6 0 1 1 3.8 2.3c-.9.5-1.4 1-1.4 2"/><circle cx="12" cy="16.9" r=".7" class="v"/>',
    halb: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" class="v"/>',
    uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    waage: '<path d="M12 4v16M7.5 20h9M5 7.5h14"/><path d="M5 7.5l-3 6.5a3 3 0 0 0 6 0zM19 7.5l-3 6.5a3 3 0 0 0 6 0z"/>',
    zeit: '<path d="M3 12h18"/><circle cx="6.5" cy="12" r="2.2"/><circle cx="12.5" cy="12" r="2.2"/><circle cx="18" cy="12" r="2.2"/>',
    buch: '<path d="M5 4.5h9a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z"/><path d="M8.5 19.5H19V8"/>',
    lampe: '<path d="M12 2.5v2M5.3 5.3l1.4 1.4M2.5 12h2M19.5 12h2M17.3 6.7l1.4-1.4"/><path d="M8 15.5a5 5 0 1 1 8 0c-.8.8-1 1.4-1 2.4H9c0-1-.2-1.6-1-2.4zM10 21h4"/>',
    person: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".7" class="v"/>',
    lupe: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M8 10.5h5"/>',
    ordner: '<path d="M3 7.5V18a1.5 1.5 0 0 0 1.5 1.5h15A1.5 1.5 0 0 0 21 18V9a1.5 1.5 0 0 0-1.5-1.5h-8L9.6 5.2a1.5 1.5 0 0 0-1.2-.7H4.5A1.5 1.5 0 0 0 3 6z"/>',
    siegel: '<path d="M12 2.5l2.2 2 2.9-.6.9 2.8 2.8.9-.6 2.9 2 2.2-2 2.2.6 2.9-2.8.9-.9 2.8-2.9-.6-2.2 2-2.2-2-2.9.6-.9-2.8-2.8-.9.6-2.9-2-2.2 2-2.2-.6-2.9 2.8-.9.9-2.8 2.9.6z"/>',
    rakete: '<path d="M12 2.5c3 2.2 4.5 5.5 4.5 9.5l-1.5 4h-6L7.5 12c0-4 1.5-7.3 4.5-9.5z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M9 16l-2.5 3 3.5-.5M15 16l2.5 3-3.5-.5M12 18v3"/>',
  };
  const svg = (n, cls = '') => `<svg viewBox="0 0 24 24" class="ic ${cls}" aria-hidden="true">${ICON[n] || ''}</svg>`;
  const SIEGEL = '<svg viewBox="0 0 32 32" aria-hidden="true"><path class="siegel-zacken" d="M16 1l3 3.2 4.2-1 1.2 4.2 4.2 1.2-1 4.2L31 16l-3.2 3 1 4.2-4.2 1.2-1.2 4.2-4.2-1L16 31l-3-3.2-4.2 1-1.2-4.2-4.2-1.2 1-4.2L1 16l3.2-3-1-4.2 4.2-1.2L8.6 3.4l4.2 1z"/><circle class="siegel-innen" cx="16" cy="16" r="8.5"/><path class="siegel-innen" d="M12.5 16.3l2.4 2.4 4.8-5"/></svg>';

  const ROLLEN = {
    vorlaeufer: { n: 'Vorläufer', lang: 'War vorher dran' },
    parallel: { n: 'Zur selben Zeit', lang: 'Kam parallel darauf' },
    patent: { n: 'Patent', lang: 'Hatte ein Patent' },
    durchbruch: { n: 'Durchbruch', lang: 'Brachte den Durchbruch' },
    verbesserer: { n: 'Verbesserer', lang: 'Machte es besser' },
  };
  const ROLLEN_FOLGE = ['vorlaeufer', 'parallel', 'patent', 'durchbruch', 'verbesserer'];
  const AMPEL = {
    mythos: { n: 'Mythos', satz: 'Die bekannte Geschichte stimmt so nicht – andere waren klar vorher dran, oder es ist eine Legende.' },
    teils: { n: 'Teils', satz: 'Da steckt Wahres drin, aber die Ehre gehört mehreren.' },
    stimmt: { n: 'Stimmt', satz: 'Die bekannte Person verdient die Ehre im Wesentlichen zu Recht.' },
  };
  const PRUEF = {
    websuche: { n: 'Kernangaben per Websuche gegengeprüft', k: 'gut', i: 'haken' },
    teilweise: { n: 'Teilweise per Websuche gegengeprüft, einzelne Details aus Fachwissen', k: 'halb', i: 'halb' },
    fachwissen: { n: 'Aus gesichertem Fachwissen zusammengestellt – noch nicht online gegengeprüft', k: 'offen', i: 'frage' },
  };

  // ---------- Zustand ----------
  let REG = null;
  const AKTE = new Map();      // id -> Register-Eintrag
  const BEREICH = {};          // k -> Bereich
  const STUECK = new Map();    // bereich -> Promise
  const VOLL = new Map();      // id -> volle Akte
  let PERS = [];               // Personen (Index = Nummer in den Daten)
  const PERS_K = new Map();    // schluessel -> Index
  let AUFTR = [];              // je Person: [{a, r, j}]
  const zustand = { q: '', ampel: 'alle', bSort: 'zeit', bAmpel: 'alle', pq: '', pFilter: 'alle', rolle: null };
  const SCROLL = new Map();
  const verlauf = [];
  let perKlick = false;
  let volltextBereit = false;
  let ansichtNr = 0;           // verhindert, dass eine langsam geladene Akte eine neuere Ansicht überschreibt

  async function ladeJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return r.json();
  }
  function ladeBereich(k) {
    if (!STUECK.has(k)) {
      STUECK.set(k, ladeJSON(`daten/app/akten-${k}.json`).then((o) => {
        for (const id in o) {
          VOLL.set(id, o[id]);
          const a = AKTE.get(id);
          if (a) a._t = volltext(o[id]);
        }
        return o;
      }).catch((e) => { STUECK.delete(k); throw e; }));
    }
    return STUECK.get(k);
  }
  async function ladeAkte(id) {
    if (VOLL.has(id)) return VOLL.get(id);
    const a = AKTE.get(id);
    if (!a) return null;
    await ladeBereich(a.b[0]);
    return VOLL.get(id);
  }
  const ladeAlle = () => Promise.all(REG.bereiche.map((b) => ladeBereich(b.k)));
  const volltext = (v) => norm([v.wz, v.ks, v.vb, v.cr, v.ba.w, v.ba.pat, ...v.bt.map((b) => b.t + ' ' + b.l + ' ' + b.p)].join(' '));

  function vorbereiten(reg) {
    REG = reg;
    PERS = reg.personen;
    PERS.forEach((p, i) => { PERS_K.set(p.k, i); p._n = norm(p.n); p._s = nachname(p.n); });
    AUFTR = PERS.map(() => []);
    reg.bereiche.forEach((b) => { BEREICH[b.k] = b; });
    reg.akten.forEach((a, i) => {
      a._nr = String(i + 1).padStart(3, '0');
      AKTE.set(a.id, a);
      a._n = norm(a.n); a._p = norm(a.p);
      a._pers = norm(a.t.flatMap((t) => t[0].map((x) => PERS[x].n)).join(' '));
      a._b = norm(a.b.map((k) => BEREICH[k].name + ' ' + BEREICH[k].unter).join(' '));
      a._jahre = new Set([a.js, ...a.t.map((t) => t[3])].filter((x) => x != null));
      a.t.forEach((t, ti) => t[0].forEach((x) => AUFTR[x].push({ a, r: t[1], j: t[2], ti })));
      a.pk.forEach((x) => AUFTR[x].push({ a, r: 'bekannt', j: a.j }));
    });
    PERS.forEach((p, i) => {
      const akten = new Set(AUFTR[i].map((x) => x.a.id));
      p._zahl = akten.size;
      p._rollen = new Set(AUFTR[i].map((x) => x.r));
    });
  }
  function nachname(n) {
    const w = n.replace(/\s*\(.*\)/, '').split(/\s+/);
    return norm(w.length > 1 ? w[w.length - 1] + ' ' + w.slice(0, -1).join(' ') : n);
  }

  // ---------- Hilfen ----------
  const kurzJahr = (js, ca) => (js == null ? '?' : (ca ? 'ca. ' : '') + (js < 0 ? `${-js} v. Chr.` : String(js)));
  function vorlaufText(vl, vlx, kurz) {
    if (vl == null) return '';
    if (vl === 0) return kurz ? 'kein Vorlauf' : 'kein Vorlauf';
    const vor = vlx === 'mind' ? 'mind. ' : vlx === 'rund' ? 'rund ' : '';
    return `${vor}${vl.toLocaleString('de-DE')} ${kurz ? 'J.' : (vl === 1 ? 'Jahr' : 'Jahre')}`;
  }
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
  function meldung(t) {
    const m = $('#meldung');
    m.textContent = t;
    m.classList.add('zeigen');
    clearTimeout(meldung._t);
    meldung._t = setTimeout(() => m.classList.remove('zeigen'), 2600);
  }
  const ampelHTML = (a) => `<div class="ampel a-${a}" role="img" aria-label="Ampel: ${AMPEL[a].n}"><i class="l-mythos"></i><i class="l-teils"></i><i class="l-stimmt"></i></div>`;
  const personHref = (i) => `#/person/${encodeURIComponent(PERS[i].k)}`;

  function karteHTML(a) {
    const b = BEREICH[a.b[0]];
    const vl = vorlaufText(a.vl, a.vlx, true);
    return `<a class="karte b-${a.b[0]}" href="#/akte/${encodeURIComponent(a.id)}">
      <div class="karte-kopf">${svg(a.b[0], 'mini')}<span>Nr. ${a._nr} · ${esc(b.name)}</span><span class="stempel s-${a.a}">${AMPEL[a.a].n}</span></div>
      <h3>${esc(a.n)}</h3>
      <div class="vs-zeile"><span class="lbl">Bekannt</span><span><b>${esc(a.p)}</b> <span class="jahr">· ${esc(a.j)}</span></span></div>
      ${a.e ? `<div class="vs-zeile echt"><span class="lbl">Zuerst</span><span><b>${esc(a.e[0])}</b> <span class="jahr">· ${esc(a.e[1])}</span></span></div>` : ''}
      <div class="karte-fuss">${vl ? `<span class="marke">${svg('uhr')}${esc(vl)} Vorlauf</span>` : ''}${a.pat ? `<span class="marke">${svg('siegel')}Patent</span>` : ''}<span class="marke">${svg('person')}${a.t.length} Beteiligte</span></div>
    </a>`;
  }

  // ---------- Kopf, Navigation ----------
  function setzeKopf({ titel = '', unterseite = false, zurueck = '#/', tab = 'akten', aktion = '' } = {}) {
    document.body.classList.toggle('ist-unterseite', unterseite);
    const z = $('#zurueck');
    z.hidden = !unterseite;
    z.setAttribute('href', zurueck);
    const st = $('#seitentitel');
    st.textContent = titel;
    st.classList.toggle('sichtbar', false);
    $('#kopfaktion').innerHTML = aktion;
    document.querySelectorAll('.leiste-unten a').forEach((a) => {
      const an = a.dataset.tab === tab;
      a.classList.toggle('aktiv', an);
      if (an) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  // Seitentitel im Kopf erst zeigen, wenn die große Überschrift weggescrollt ist
  let titelBeob = null;
  function beobachteTitel() {
    if (titelBeob) titelBeob.disconnect();
    const h = main.querySelector('h1');
    const st = $('#seitentitel');
    if (!h || !document.body.classList.contains('ist-unterseite') || !('IntersectionObserver' in window)) return;
    titelBeob = new IntersectionObserver(([e]) => st.classList.toggle('sichtbar', !e.isIntersecting), { rootMargin: '-60px 0px 0px 0px' });
    titelBeob.observe(h);
  }

  $('#zurueck').addEventListener('click', (e) => {
    if (verlauf.length) { e.preventDefault(); history.back(); }
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.id !== 'zurueck') perKlick = true;
  });
  window.addEventListener('hashchange', (e) => {
    const alt = new URL(e.oldURL).hash || '#/';
    SCROLL.set(alt, window.scrollY);
    if (perKlick) verlauf.push(alt);
    else if (verlauf.length && verlauf[verlauf.length - 1] === (location.hash || '#/')) verlauf.pop();
    zeige();
  });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function zeige() {
    const h = location.hash.replace(/^#\/?/, '');
    const [teil, roh] = h.split('/');
    const arg = roh ? decodeURIComponent(roh) : '';
    const ziel = location.hash || '#/';
    const scrollZiel = perKlick ? 0 : (SCROLL.get(ziel) || 0);
    perKlick = false;
    ansichtNr++;
    let fertig;
    if (teil === 'akte' && AKTE.has(arg)) fertig = zeigeAkte(arg);
    else if (teil === 'bereich' && BEREICH[arg]) fertig = zeigeBereich(arg);
    else if (teil === 'personen') fertig = zeigePersonen();
    else if (teil === 'person' && PERS_K.has(arg)) fertig = zeigePerson(arg);
    else if (teil === 'info') fertig = zeigeInfo();
    else fertig = zeigeStart();
    main.classList.remove('einblenden');
    void main.offsetWidth;
    main.classList.add('einblenden');
    Promise.resolve(fertig).then(() => {
      window.scrollTo(0, scrollZiel);
      beobachteTitel();
    });
  }

  // ---------- Startseite ----------
  function zeigeStart() {
    document.title = "Erfinder-Check – Wer war's wirklich?";
    setzeKopf({ tab: 'akten' });
    const zahl = { mythos: 0, teils: 0, stimmt: 0 };
    REG.akten.forEach((a) => { zahl[a.a]++; });
    main.innerHTML = `
      <section class="held">
        <svg class="held-deko" viewBox="0 0 100 100" aria-hidden="true"><circle class="stempel-ring" cx="40" cy="40" r="36"/><circle class="glas" cx="40" cy="40" r="25"/><circle class="ring" cx="40" cy="40" r="25"/><path class="griff" d="M58 58l26 26"/><text x="40" y="44" text-anchor="middle">GEPRÜFT?</text></svg>
        <p class="kicker">Akten-Archiv · ${REG.akten.length} Fälle</p>
        <h1>Wer war's <em>wirklich?</em></h1>
        <p class="unter">Bekannt gemacht, patentiert – oder doch zuerst erfunden? Hier stehen alle Beteiligten nebeneinander, mit Zeitleiste und Quellen.</p>
      </section>
      <label class="suchfeld">${svg('suche')}<input id="q" type="search" placeholder="Erfindung, Person oder Jahr" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-label="Akten durchsuchen" value="${esc(zustand.q)}"><button type="button" class="knopf-rund" id="q-weg" aria-label="Suche leeren"${zustand.q ? '' : ' hidden'}>${svg('kreuz')}</button></label>
      <div class="chips" role="group" aria-label="Nach Ampel filtern">
        ${['alle', 'mythos', 'teils', 'stimmt'].map((k) => `<button type="button" class="chip" data-ampel="${k}" aria-pressed="${zustand.ampel === k}">${k === 'alle' ? 'Alle' : `<span class="punkt" style="background:var(--a-${k})"></span>${AMPEL[k].n} <small>${zahl[k]}</small>`}</button>`).join('')}
      </div>
      <div id="start-inhalt"></div>`;
    const q = $('#q');
    let warte;
    q.addEventListener('input', () => {
      zustand.q = q.value;
      $('#q-weg').hidden = !q.value;
      clearTimeout(warte);
      warte = setTimeout(startInhalt, 70);
      if (!volltextBereit && q.value.trim().length >= 3) {
        volltextBereit = true;
        ladeAlle().then(() => { if (zustand.q.trim()) startInhalt(); }).catch(() => { volltextBereit = false; });
      }
    });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter') q.blur(); });
    $('#q-weg').addEventListener('click', () => { zustand.q = ''; q.value = ''; $('#q-weg').hidden = true; startInhalt(); q.focus(); });
    main.querySelectorAll('[data-ampel]').forEach((b) => b.addEventListener('click', () => {
      zustand.ampel = b.dataset.ampel;
      main.querySelectorAll('[data-ampel]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      startInhalt();
    }));
    startInhalt();
  }

  function suche(q) {
    const toks = norm(q).split(/[\s,;]+/).filter(Boolean);
    if (!toks.length) return { akten: [], personen: [] };
    const akten = [];
    for (const a of REG.akten) {
      let score = 0, ok = true;
      for (const t of toks) {
        let s = 0;
        if (a._n.includes(t)) s = a._n.startsWith(t) ? 14 : 10;
        else if (a._p.includes(t)) s = 7;
        else if (a._pers.includes(t)) s = 5;
        else if (/^-?\d{3,4}$/.test(t) && a._jahre.has(+t)) s = 4;
        else if (a._b.includes(t)) s = 3;
        else if (a._t && a._t.includes(t)) s = 1;
        if (!s) { ok = false; break; }
        score += s;
      }
      if (ok) akten.push([score, a]);
    }
    akten.sort((x, y) => y[0] - x[0] || (x[1].js ?? 0) - (y[1].js ?? 0));
    const personen = [];
    PERS.forEach((p, i) => { if (toks.every((t) => p._n.includes(t))) personen.push(i); });
    personen.sort((x, y) => PERS[y]._zahl - PERS[x]._zahl);
    return { akten: akten.map((x) => x[1]), personen: personen.slice(0, 10) };
  }

  function startInhalt() {
    const box = $('#start-inhalt');
    if (!box) return;
    const q = zustand.q.trim();
    const filt = (liste) => (zustand.ampel === 'alle' ? liste : liste.filter((a) => a.a === zustand.ampel));
    if (q) {
      const r = suche(q);
      const akten = filt(r.akten);
      box.innerHTML = `
        <p class="leise" id="treffer">${akten.length} ${akten.length === 1 ? 'Akte' : 'Akten'}${r.personen.length ? ` · ${r.personen.length} ${r.personen.length === 1 ? 'Person' : 'Personen'}` : ''}${volltextBereit && !REG.akten.every((a) => a._t) ? ' · Volltext lädt …' : ''}</p>
        ${r.personen.length ? `<div class="top-personen" style="margin:6px 0 16px">${r.personen.map((i) => `<a class="chip" href="${personHref(i)}">${svg('person', 'mini')}${esc(PERS[i].n)} <b>${PERS[i]._zahl}</b></a>`).join('')}</div>` : ''}
        ${akten.length ? `<div class="liste-akten">${akten.map(karteHTML).join('')}</div>`
          : `<div class="leer">${svg('lupe')}<p>Keine Akte gefunden.<br>Tipp: nur den Nachnamen, ein Jahr (z. B. 1879) oder ein Stichwort wie „Motor“ probieren.</p></div>`}`;
      return;
    }
    if (zustand.ampel !== 'alle') {
      const akten = filt(REG.akten);
      box.innerHTML = `<div class="abschnitt-kopf" style="margin-top:14px"><h2>${AMPEL[zustand.ampel].n}: ${akten.length} Akten</h2></div>
        <p class="leise" style="margin:-4px 0 14px">${esc(AMPEL[zustand.ampel].satz)}</p>
        <div class="liste-akten">${akten.map(karteHTML).join('')}</div>`;
      return;
    }
    const mythen = REG.akten.filter((a) => a.a === 'mythos');
    box.innerHTML = `
      <section class="abschnitt" style="margin-top:18px">
        <div class="abschnitt-kopf"><h2>${svg('ordner')}Bereiche</h2></div>
        <div class="raster-bereiche">${REG.bereiche.map((b) => `
          <a class="kachel b-${b.k}" href="#/bereich/${b.k}">
            <span class="kachel-symbol">${svg(b.k)}</span>
            <span class="kachel-name">${esc(b.name)}</span>
            <span class="kachel-unter">${esc(b.unter)}</span>
            <span class="kachel-fuss">${b.n} Akten<span class="ampelbalken" aria-hidden="true"><i class="m" style="flex:${b.amp.mythos}"></i><i class="t" style="flex:${b.amp.teils}"></i><i class="s" style="flex:${b.amp.stimmt}"></i></span></span>
          </a>`).join('')}
        </div>
      </section>
      <section class="abschnitt">
        <div class="abschnitt-kopf"><h2>${svg('warn')}Die größten Mythen</h2><button type="button" class="chip" data-ampel-link="mythos">Alle ${mythen.length}</button></div>
        <div class="band">${mythen.map(karteHTML).join('')}</div>
      </section>
      <section class="abschnitt">
        <div class="knopf-reihe">
          <button type="button" class="knopf" id="zufall">${svg('wuerfel')}Zufällige Akte öffnen</button>
          <a class="knopf zweit" href="#/personen">${svg('person')}Wer taucht wo auf?</a>
        </div>
      </section>`;
    $('#zufall').addEventListener('click', () => {
      const a = REG.akten[Math.floor(Math.random() * REG.akten.length)];
      perKlick = true;
      location.hash = `#/akte/${encodeURIComponent(a.id)}`;
    });
    box.querySelector('[data-ampel-link]').addEventListener('click', () => {
      zustand.ampel = 'mythos';
      main.querySelectorAll('[data-ampel]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.ampel === 'mythos')));
      startInhalt();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Bereich ----------
  function zeigeBereich(k) {
    const b = BEREICH[k];
    document.title = `${b.name} – Erfinder-Check`;
    setzeKopf({ titel: b.name, unterseite: true, zurueck: '#/', tab: 'akten' });
    main.innerHTML = `
      <div class="bereich-kopf b-${k}"><span class="kachel-symbol">${svg(k)}</span><div><p class="kicker">Bereich · ${b.n} Akten</p><h1>${esc(b.name)}</h1></div></div>
      <div class="werkzeug">
        <div class="chips" role="group" aria-label="Nach Ampel filtern">${['alle', 'mythos', 'teils', 'stimmt'].map((a) => `<button type="button" class="chip" data-f="${a}" aria-pressed="${zustand.bAmpel === a}">${a === 'alle' ? 'Alle' : `<span class="punkt" style="background:var(--a-${a})"></span>${AMPEL[a].n} <small>${b.amp[a]}</small>`}</button>`).join('')}</div>
        <div class="chips" role="group" aria-label="Sortieren">${[['zeit', 'Nach Jahr'], ['az', 'A–Z'], ['vorlauf', 'Längster Vorlauf']].map(([s, n]) => `<button type="button" class="chip" data-s="${s}" aria-pressed="${zustand.bSort === s}">${n}</button>`).join('')}</div>
      </div>
      <div class="liste-akten" id="bliste"></div>`;
    const liste = () => {
      let l = REG.akten.filter((a) => a.b.includes(k) && (zustand.bAmpel === 'alle' || a.a === zustand.bAmpel));
      if (zustand.bSort === 'az') l = l.slice().sort((x, y) => x.n.localeCompare(y.n, 'de'));
      else if (zustand.bSort === 'vorlauf') l = l.slice().sort((x, y) => (y.vl ?? -1) - (x.vl ?? -1));
      else l = l.slice().sort((x, y) => (x.js ?? 9999) - (y.js ?? 9999));
      $('#bliste').innerHTML = l.length ? l.map(karteHTML).join('') : `<div class="leer">${svg('ordner')}<p>In diesem Bereich gibt es keine Akte mit dieser Ampel.</p></div>`;
    };
    main.querySelectorAll('[data-f]').forEach((x) => x.addEventListener('click', () => {
      zustand.bAmpel = x.dataset.f;
      main.querySelectorAll('[data-f]').forEach((y) => y.setAttribute('aria-pressed', String(y === x)));
      liste();
    }));
    main.querySelectorAll('[data-s]').forEach((x) => x.addEventListener('click', () => {
      zustand.bSort = x.dataset.s;
      main.querySelectorAll('[data-s]').forEach((y) => y.setAttribute('aria-pressed', String(y === x)));
      liste();
    }));
    liste();
  }

  // ---------- Akte ----------
  async function zeigeAkte(id) {
    const a = AKTE.get(id);
    const b = BEREICH[a.b[0]];
    document.title = `${a.n} – Erfinder-Check`;
    const knopfKopf = `<button type="button" class="knopf-rund" id="kopf-kopieren" aria-label="Diskussions-Karte kopieren">${svg('kopieren')}</button>`;
    setzeKopf({ titel: a.n, unterseite: true, zurueck: `#/bereich/${a.b[0]}`, tab: 'akten', aktion: knopfKopf });
    main.innerHTML = `<div class="lade-schale"><div class="lade-zeile breit"></div><div class="lade-zeile"></div><div class="lade-raster"><div></div><div></div></div></div>`;
    const nr = ansichtNr;
    let v;
    try { v = await ladeAkte(id); } catch (e) { v = null; }
    if (nr !== ansichtNr) return;
    if (!v) {
      main.innerHTML = `<div class="leer">${svg('warn')}<p>Diese Akte konnte nicht geladen werden. Ohne Netz geht das nur, wenn die App schon einmal ganz geladen war.</p><button type="button" class="knopf" id="nochmal">Noch einmal versuchen</button></div>`;
      $('#nochmal').addEventListener('click', () => zeige());
      return;
    }
    const bkSet = new Set(v.ba.pk);
    const frueh = v.bt.find((x) => x.js != null);
    const datiert = v.bt.filter((x) => x.js != null);
    const jahre = datiert.map((x) => x.js).concat(v.ba.js != null ? [v.ba.js] : []);
    const min = Math.min(...jahre), max = Math.max(...jahre);
    const spanne = max - min;
    const gestaucht = spanne > 400;
    const pos = (y) => (spanne ? (gestaucht ? 1 - Math.sqrt((max - y) / spanne) : (y - min) / spanne) : 0.5);
    const pct = (y) => `calc(8px + ${(pos(y) * 100).toFixed(2)}% - ${(pos(y) * 16).toFixed(2)}px)`;
    const vlText = vorlaufText(v.vl, v.vlx, false);
    const liste = REG.akten.filter((x) => x.b[0] === a.b[0]);
    const idx = liste.indexOf(a);
    const vor = liste[idx - 1], nach = liste[idx + 1];
    const verwandt = siehAuch(a);
    const zp = v.zp || [];
    const linksOk = v.q.filter((q) => q.s === 'ok').length;
    const pr = PRUEF[v.pr] || PRUEF.fachwissen;

    main.innerHTML = `
      <header class="akte-kopf">
        <div>
          <p class="kicker">Akte Nr. ${a._nr} · <a href="#/bereich/${a.b[0]}">${esc(b.name)}</a>${a.b[1] ? ` · <a href="#/bereich/${a.b[1]}">${esc(BEREICH[a.b[1]].name)}</a>` : ''}</p>
          <h1>${esc(v.n)}</h1>
        </div>
        <div class="ampel-block">${ampelHTML(v.a)}<span class="stempel gross s-${v.a} landen">${AMPEL[v.a].n}</span></div>
      </header>
      <p class="ampel-satz"><b>${AMPEL[v.a].n}:</b> ${esc(AMPEL[v.a].satz)}</p>

      <section class="duell" aria-label="Gegenüberstellung">
        <article class="seite bekannt">
          <p class="kicker">${svg('lampe')}Bekannt als</p>
          <h2>${esc(v.ba.p)}</h2>
          <div class="jahr-gross">${esc(kurzJahr(v.ba.js, v.ba.j !== String(v.ba.js)))}</div>
          ${v.ba.j !== kurzJahr(v.ba.js, false) ? `<p class="jahr-lang">${esc(v.ba.j)}</p>` : ''}
          <p>${esc(v.ba.w)}</p>
          ${v.ba.pat ? `<div class="patent-box">${SIEGEL}<div><b>Patent</b>${esc(v.ba.pat)}${patentPruef(v)}</div></div>` : ''}
        </article>
        <div class="vs-siegel" aria-hidden="true">VS</div>
        <article class="seite zuerst">
          <p class="kicker">${svg('lupe')}Wirklich zuerst</p>
          ${frueh ? `<h2>${esc(frueh.p)}</h2><div class="jahr-gross">${esc(kurzJahr(frueh.js, frueh.ca))}</div>${frueh.j !== kurzJahr(frueh.js, false) ? `<p class="jahr-lang">${esc(frueh.j)}</p>` : ''}` : ''}
          <p>${esc(v.wz)}</p>
        </article>
      </section>

      <section class="vorlauf" aria-label="Wie lange es die Idee schon gab">
        <p class="kicker">${svg('uhr', 'mini')}Wie lange gab es das Konzept schon?</p>
        ${v.vl != null ? `<div class="vorlauf-zahl"><strong>${esc(vlText)}</strong><span>${v.vl === 0 ? 'Die bekannte Person steht ganz am Anfang.' : `vom frühesten Beitrag (${esc(frueh ? frueh.j : '')}) bis zu ${esc(v.ba.p)} (${esc(v.ba.j)})`}</span></div>` : '<div class="vorlauf-zahl"><span>Zeitspanne nicht sicher datierbar.</span></div>'}
        <p>Konzept seit: ${esc(v.ks)}</p>
        ${jahre.length > 1 ? `<button type="button" class="zeitstrahl" id="zum-strahl" aria-label="Zur Zeitleiste springen">
          <span class="achse"></span>
          ${v.ba.js != null && frueh && v.ba.js > frueh.js ? `<span class="spanne" style="left:${pct(frueh.js)};width:calc(${pct(v.ba.js)} - ${pct(frueh.js)})"></span>` : ''}
          ${datiert.map((x) => `<span class="zp r-${x.r}" style="left:${pct(x.js)}"></span>`).join('')}
          ${v.ba.js != null ? `<span class="bekannt-flagge" style="left:${pct(v.ba.js)}"></span>` : ''}
          <span class="jz links">${esc(kurzJahr(min, false))}</span><span class="jz rechts">${esc(kurzJahr(max, false))}</span>
          ${v.ba.js != null && pos(v.ba.js) > 0.16 && pos(v.ba.js) < 0.84 ? `<span class="jz mitte" style="left:${pct(v.ba.js)}">bekannt ${esc(kurzJahr(v.ba.js, false))}</span>` : ''}
        </button>
        <div class="zeitstrahl-hinweis">Fahne = bekannt geworden${gestaucht ? ' · Zeitachse gestaucht (frühe Jahrhunderte enger)' : ''} · antippen für die Zeitleiste</div>` : ''}
      </section>

      <section class="abschnitt" id="zeitleiste">
        <div class="abschnitt-kopf"><h2>${svg('zeit')}Zeitleiste: alle Beteiligten</h2></div>
        <div class="legende" role="group" aria-label="Rollen hervorheben">${ROLLEN_FOLGE.filter((r) => v.bt.some((x) => x.r === r)).map((r) => `<button type="button" class="chip r-${r}" data-rolle="${r}" aria-pressed="true"><span class="marker r-${r}"></span>${ROLLEN[r].n} <small>${v.bt.filter((x) => x.r === r).length}</small></button>`).join('')}</div>
        <ol class="zeitleiste">${v.bt.map((x, i) => {
          const istBk = x.pk.some((p) => bkSet.has(p));
          const lang = x.j && x.j !== kurzJahr(x.js, false);
          const name = x.pk.length === 1 ? `<a href="${personHref(x.pk[0])}">${esc(x.p)}</a>` : esc(x.p);
          return `<li class="ereignis r-${x.r}${istBk ? ' ist-bekannt' : ''}" id="e-${i}" data-rolle="${x.r}">
            <div class="jahr">${esc(kurzJahr(x.js, x.ca))}</div>
            <div class="knoten"><span class="marker r-${x.r}"></span></div>
            <div class="inhalt">
              <div class="rolle">${esc(ROLLEN[x.r].n)}${istBk ? '<span class="bekannt-marke">Bekannt geworden</span>' : ''}</div>
              <h4>${name}</h4>
              <div class="land">${esc(x.l)}${lang ? ` · ${esc(x.j)}` : ''}</div>
              <p>${esc(x.t)}</p>
              ${x.pk.length > 1 ? `<div class="personen-links">${x.pk.map((p) => `<a href="${personHref(p)}">${esc(PERS[p].n)}</a>`).join('')}</div>` : ''}
            </div>
          </li>`;
        }).join('')}</ol>
      </section>

      <section class="abschnitt">
        <div class="abschnitt-kopf"><h2>${svg('rakete')}Wie es berühmt wurde</h2></div>
        <div class="textkarte"><p>${esc(v.vb)}</p></div>
      </section>

      <section class="abschnitt">
        <div class="abschnitt-kopf"><h2>${svg('waage')}Wem stehen die Credits zu?</h2></div>
        <div class="urteil"><span class="stempel s-${v.a}">${AMPEL[v.a].n}</span><p>${esc(v.cr)}</p></div>
      </section>

      <section class="aktionen" aria-label="Teilen">
        <h2>Diskussions-Karte</h2>
        <p>Kurzfassung mit Zeitleiste, Urteil und ${v.q.length} Quellen – zum Einfügen in einen Chat oder eine Nachricht.</p>
        <div class="knopf-reihe">
          <button type="button" class="knopf rot" id="kopieren">${svg('kopieren')}Diskussions-Karte kopieren</button>
          ${navigator.share ? `<button type="button" class="knopf zweit" id="teilen">${svg('teilen')}Teilen</button>` : ''}
        </div>
      </section>

      <section class="abschnitt">
        <div class="abschnitt-kopf"><h2>${svg('haken')}Wie sicher ist diese Akte?</h2></div>
        <div class="pruefstand">
          <div class="pruef-zeile ${pr.k}">${svg(pr.i)}<div>${esc(pr.n)} (Stand ${esc(datumDE(REG.stand))}).</div></div>
          <div class="pruef-zeile ${linksOk === v.q.length ? 'gut' : 'halb'}">${svg('buch')}<div>${linksOk} von ${v.q.length} Links am ${esc(datumDE(REG.stand))} erfolgreich aufgerufen${linksOk < v.q.length ? `; ${v.q.length - linksOk} ließen sich von der Prüfumgebung aus nicht erreichen (nicht unbedingt kaputt)` : ''}.</div></div>
          ${(v.zpok || []).length ? `<div class="pruef-zeile gut">${svg('haken')}<div>Patentnummer bei der Gegenprobe in Wikipedia gefunden:<ul>${v.zpok.map((z) => `<li>${esc(z)}</li>`).join('')}</ul></div></div>` : ''}
          ${zp.length ? `<div class="pruef-zeile halb">${svg('warn')}<div>Noch offen, bitte selbst nachprüfen:<ul>${zp.map((z) => `<li>${esc(z)}</li>`).join('')}</ul></div></div>` : ''}
        </div>
      </section>

      <section class="abschnitt">
        <div class="abschnitt-kopf"><h2>${svg('buch')}Quellen</h2></div>
        <ul class="quellen">${v.q.map((q) => `<li><a href="${esc(q.u)}" target="_blank" rel="noopener noreferrer">
          <span class="q-titel">${esc(q.t)}</span>${svg('pfeil', 'q-pfeil')}
          <span class="q-host">${esc(host(q.u))}${q.s === 'ok' ? `<span class="ok">· Link geprüft</span>` : '<span>· nicht geprüft</span>'}</span></a></li>`).join('')}</ul>
      </section>

      ${verwandt.length ? `<section class="abschnitt"><div class="abschnitt-kopf"><h2>${svg('person')}Dieselben Leute in anderen Akten</h2></div><div class="liste-akten">${verwandt.map(karteHTML).join('')}</div></section>` : ''}

      <nav class="blaettern" aria-label="Blättern im Bereich">
        ${vor ? `<a href="#/akte/${encodeURIComponent(vor.id)}"><span>Vorige Akte</span><b>${esc(vor.n)}</b></a>` : ''}
        ${nach ? `<a class="weiter" href="#/akte/${encodeURIComponent(nach.id)}"><span>Nächste Akte</span><b>${esc(nach.n)}</b></a>` : ''}
      </nav>`;

    const kopieren = async () => {
      const text = karteText(a, v);
      if (await inZwischenablage(text)) meldung(`Kopiert – mit ${v.q.length} Quellen`);
      else zeigeTextBlatt(text);
    };
    $('#kopieren').addEventListener('click', kopieren);
    $('#kopf-kopieren').addEventListener('click', kopieren);
    const t = $('#teilen');
    if (t) t.addEventListener('click', async () => {
      try { await navigator.share({ title: `Erfinder-Check: ${v.n}`, text: karteText(a, v) }); } catch (e) { /* abgebrochen */ }
    });
    const strahl = $('#zum-strahl');
    if (strahl) strahl.addEventListener('click', () => $('#zeitleiste').scrollIntoView({ behavior: 'smooth', block: 'start' }));
    main.querySelectorAll('[data-rolle].chip').forEach((c) => c.addEventListener('click', () => {
      const r = c.dataset.rolle;
      zustand.rolle = zustand.rolle === r ? null : r;
      c.parentElement.classList.toggle('aktiv', !!zustand.rolle);
      main.querySelectorAll('[data-rolle].chip').forEach((x) => x.setAttribute('aria-pressed', String(!zustand.rolle || x.dataset.rolle === zustand.rolle)));
      main.querySelectorAll('.ereignis').forEach((e) => e.classList.toggle('gedimmt', !!zustand.rolle && e.dataset.rolle !== zustand.rolle));
    }));
    zustand.rolle = null;
  }

  function patentPruef(v) {
    if (!v.patp) return '';
    if (v.patp.gefunden) return `<span class="patent-pruef ok">${svg('haken', 'mini')}Nummer bei der Gegenprobe gefunden: <a href="${esc(v.patp.wo)}" target="_blank" rel="noopener noreferrer">${esc(wikiTitel(v.patp.wo))}</a></span>`;
    return `<span class="patent-pruef">${svg('frage', 'mini')}Nummer bei der Gegenprobe in Wikipedia nicht gefunden – bitte prüfen.</span>`;
  }
  function wikiTitel(u) {
    try { const x = new URL(u); return `Wikipedia (${x.hostname.split('.')[0]}): ${decodeURIComponent(x.pathname.replace('/wiki/', '')).replace(/_/g, ' ')}`; } catch (e) { return u; }
  }

  function siehAuch(a) {
    const meine = new Set();
    a.t.forEach((t) => t[0].forEach((x) => { if (!PERS[x].g) meine.add(x); }));
    const zaehler = new Map();
    meine.forEach((x) => AUFTR[x].forEach((au) => {
      if (au.a !== a) zaehler.set(au.a, (zaehler.get(au.a) || new Set()).add(x));
    }));
    return [...zaehler.entries()].sort((x, y) => y[1].size - x[1].size).slice(0, 4).map((x) => x[0]);
  }

  const datumDE = (iso) => { const [j, m, t] = String(iso).split('-'); return `${+t}.${+m}.${j}`; };

  function karteText(a, v) {
    const z = [];
    z.push(`ERFINDER-CHECK: ${v.n}`);
    z.push(`Ampel: ${AMPEL[v.a].n.toUpperCase()} – ${AMPEL[v.a].satz}`);
    z.push('');
    z.push(`BEKANNT ALS: ${v.ba.p} (${v.ba.j}) – ${v.ba.w}`);
    if (v.ba.pat) z.push(`Patent: ${v.ba.pat}${v.patp ? (v.patp.gefunden ? ' – Nummer per Wikipedia gegengeprüft' : ' – Nummer noch nicht bestätigt') : ''}`);
    z.push('');
    const frueh = v.bt.find((x) => x.js != null);
    z.push(`WIRKLICH ZUERST${frueh ? `: ${frueh.p} (${frueh.j})` : ''}`);
    z.push(v.wz);
    z.push('');
    z.push('ZEITLEISTE');
    v.bt.forEach((x) => z.push(`• ${x.j || kurzJahr(x.js, x.ca)} · ${ROLLEN[x.r].n} · ${x.p}${x.l ? ` (${x.l})` : ''}`));
    z.push(`Konzept seit: ${v.ks}`);
    if (v.vl != null && v.vl > 0) z.push(`Vorlauf bis zur Bekanntheit: ${vorlaufText(v.vl, v.vlx, false)}`);
    z.push('');
    z.push('WEM STEHEN DIE CREDITS ZU?');
    z.push(v.cr);
    z.push('');
    z.push('QUELLEN');
    v.q.forEach((q) => z.push(`- ${q.t}: ${q.u}`));
    z.push('');
    z.push(`Stand ${datumDE(REG.stand)} · ${(PRUEF[v.pr] || PRUEF.fachwissen).n}.`);
    z.push(`Mehr: ${location.origin}${location.pathname}#/akte/${encodeURIComponent(a.id)}`);
    return z.join('\n');
  }

  async function inZwischenablage(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* weiter mit Ersatzweg */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  function zeigeTextBlatt(text) {
    const h = document.createElement('div');
    h.className = 'blatt-huelle';
    h.innerHTML = `<div class="blatt" role="dialog" aria-modal="true" aria-label="Diskussions-Karte">
      <h2>Diskussions-Karte</h2>
      <p class="leise" style="margin:0">Automatisches Kopieren hat dieser Browser nicht erlaubt. Der Text ist markiert – einfach lange drücken und „Kopieren“ wählen.</p>
      <textarea readonly>${esc(text)}</textarea>
      <button type="button" class="knopf breit">Schließen</button></div>`;
    document.body.appendChild(h);
    requestAnimationFrame(() => h.classList.add('offen'));
    const ta = h.querySelector('textarea');
    ta.focus(); ta.select();
    const zu = () => { h.classList.remove('offen'); setTimeout(() => h.remove(), 250); };
    h.querySelector('button').addEventListener('click', zu);
    h.addEventListener('click', (e) => { if (e.target === h) zu(); });
  }

  // ---------- Personen ----------
  const PFILTER = [
    ['alle', 'Alle Personen'],
    ['mehrfach', 'Mehrfach dabei'],
    ['bekannt', 'Bekannte Namen'],
    ['vergessen', 'Vergessene Vorläufer'],
    ['gruppen', 'Teams & Gruppen'],
  ];
  function personPasst(p, f) {
    if (f === 'gruppen') return !!p.g;
    if (p.g) return false;
    if (f === 'mehrfach') return p._zahl > 1;
    if (f === 'bekannt') return p._rollen.has('bekannt');
    if (f === 'vergessen') return !p._rollen.has('bekannt') && [...p._rollen].every((r) => r === 'vorlaeufer' || r === 'parallel');
    return true;
  }
  function rollenPunkte(i) {
    const rs = [...new Set(AUFTR[i].map((x) => x.r))];
    return `<span class="rollen-punkte" aria-hidden="true">${rs.map((r) => (r === 'bekannt' ? '<i class="bk"></i>' : `<i class="r-${r}"></i>`)).join('')}</span>`;
  }
  function zeigePersonen() {
    document.title = 'Personen – Erfinder-Check';
    setzeKopf({ tab: 'personen' });
    const echte = PERS.filter((p) => !p.g).length;
    main.innerHTML = `
      <p class="kicker">Personen-Register</p>
      <h1>Wer taucht wo auf?</h1>
      <p class="leise" style="margin:8px 0 0">${echte} Namen aus allen Akten – mit ihren Rollen: bekannt geworden, Vorläufer, parallel, Patent, Durchbruch, Verbesserung.</p>
      <label class="suchfeld">${svg('suche')}<input id="pq" type="search" placeholder="Name suchen" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-label="Personen durchsuchen" value="${esc(zustand.pq)}"><button type="button" class="knopf-rund" id="pq-weg" aria-label="Suche leeren"${zustand.pq ? '' : ' hidden'}>${svg('kreuz')}</button></label>
      <div class="chips" role="group" aria-label="Personen filtern">${PFILTER.map(([k, n]) => `<button type="button" class="chip" data-pf="${k}" aria-pressed="${zustand.pFilter === k}">${n}</button>`).join('')}</div>
      <div id="pinhalt"></div>`;
    const inhalt = () => {
      const toks = norm(zustand.pq).split(/\s+/).filter(Boolean);
      let ids = PERS.map((p, i) => i).filter((i) => personPasst(PERS[i], zustand.pFilter) && toks.every((t) => PERS[i]._n.includes(t)));
      const nachZahl = zustand.pFilter === 'mehrfach';
      ids.sort(nachZahl ? (x, y) => PERS[y]._zahl - PERS[x]._zahl || PERS[x]._s.localeCompare(PERS[y]._s) : (x, y) => PERS[x]._s.localeCompare(PERS[y]._s, 'de'));
      const top = !toks.length && zustand.pFilter === 'alle'
        ? PERS.map((p, i) => i).filter((i) => !PERS[i].g).sort((x, y) => PERS[y]._zahl - PERS[x]._zahl).slice(0, 10) : [];
      let buchst = '';
      const zeilen = ids.map((i) => {
        const p = PERS[i];
        let kopf = '';
        if (!nachZahl && !p.g) {
          const b = (p._s[0] || '#').toUpperCase();
          if (b !== buchst) { buchst = b; kopf = `<li class="buchstabe" aria-hidden="true">${esc(b)}</li>`; }
        }
        return `${kopf}<li><a href="${personHref(i)}"><span class="p-name">${esc(p.n)}</span><span class="p-zahl" aria-label="${p._zahl} Akten">${p._zahl}</span><span class="p-info">${rollenPunkte(i)}<span>${esc(p.la.join(', ') || (p.g ? 'Gruppe' : ''))}</span></span></a></li>`;
      }).join('');
      $('#pinhalt').innerHTML = `
        ${top.length ? `<section class="abschnitt" style="margin-top:16px"><div class="abschnitt-kopf"><h2>Am häufigsten dabei</h2></div><div class="top-personen">${top.map((i) => `<a class="chip" href="${personHref(i)}">${esc(PERS[i].n)} <b>${PERS[i]._zahl}</b></a>`).join('')}</div></section>` : ''}
        <p class="leise" style="margin:18px 0 4px">${ids.length} ${ids.length === 1 ? 'Eintrag' : 'Einträge'}${zustand.pFilter === 'vergessen' ? ' – waren vorher oder gleichzeitig dran, sind aber nirgends die bekannte Person' : ''}</p>
        ${ids.length ? `<ul class="personen-liste">${zeilen}</ul>` : `<div class="leer">${svg('person')}<p>Niemand gefunden.</p></div>`}`;
    };
    let warte;
    const pq = $('#pq');
    pq.addEventListener('input', () => { zustand.pq = pq.value; $('#pq-weg').hidden = !pq.value; clearTimeout(warte); warte = setTimeout(inhalt, 70); });
    pq.addEventListener('keydown', (e) => { if (e.key === 'Enter') pq.blur(); });
    $('#pq-weg').addEventListener('click', () => { zustand.pq = ''; pq.value = ''; $('#pq-weg').hidden = true; inhalt(); pq.focus(); });
    main.querySelectorAll('[data-pf]').forEach((c) => c.addEventListener('click', () => {
      zustand.pFilter = c.dataset.pf;
      main.querySelectorAll('[data-pf]').forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      inhalt();
    }));
    inhalt();
  }

  async function zeigePerson(k) {
    const i = PERS_K.get(k);
    const p = PERS[i];
    document.title = `${p.n} – Erfinder-Check`;
    setzeKopf({ titel: p.n, unterseite: true, zurueck: '#/personen', tab: 'personen' });
    const au = AUFTR[i];
    const nachAkte = new Map();
    au.forEach((x) => { if (!nachAkte.has(x.a)) nachAkte.set(x.a, []); nachAkte.get(x.a).push(x); });
    const zahl = {};
    au.forEach((x) => { zahl[x.r] = (zahl[x.r] || 0) + 1; });
    const stat = [['bekannt', 'mal bekannt geworden']].concat(ROLLEN_FOLGE.map((r) => [r, ROLLEN[r].n])).filter(([r]) => zahl[r]);
    const kopf = `
      <p class="kicker">${p.g ? 'Team / Gruppe' : 'Personenakte'}</p>
      <h1>${esc(p.n)}</h1>
      ${p.la.length ? `<p class="leise" style="margin:6px 0 0">${esc(p.la.join(' · '))}</p>` : ''}
      <div class="stat-reihe">
        <div class="stat"><b>${nachAkte.size}</b><span>${nachAkte.size === 1 ? 'Akte' : 'Akten'}</span></div>
        ${stat.map(([r, n]) => `<div class="stat ${r === 'bekannt' ? '' : 'r-' + r}" ${r === 'bekannt' ? 'style="--farbe:var(--rot-text)"' : ''}><b>${zahl[r]}×</b><span>${esc(r === 'bekannt' ? 'bekannt geworden' : n)}</span></div>`).join('')}
      </div>`;
    main.innerHTML = kopf + `<div class="lade-schale"><div class="lade-raster"><div></div><div></div></div></div>`;
    const bereiche = [...new Set([...nachAkte.keys()].map((a) => a.b[0]))];
    const nr = ansichtNr;
    try { await Promise.all(bereiche.map(ladeBereich)); } catch (e) { /* ohne Texte weiter */ }
    if (nr !== ansichtNr) return;
    const eintraege = [...nachAkte.entries()].sort((x, y) => (x[0].js ?? 0) - (y[0].js ?? 0));
    main.innerHTML = kopf + `
      <section class="abschnitt"><div class="abschnitt-kopf"><h2>${svg('ordner')}Taucht auf in</h2></div>
      <ol class="auftritte">${eintraege.map(([a, xs]) => {
        const v = VOLL.get(a.id);
        const texte = v ? xs.filter((x) => x.r !== 'bekannt').map((x) => v.bt[x.ti] && v.bt[x.ti].t).filter(Boolean) : [];
        return `<li><a class="auftritt b-${a.b[0]}" href="#/akte/${encodeURIComponent(a.id)}">
          <div class="auftritt-kopf"><h3>${esc(a.n)}</h3><span class="stempel s-${a.a}">${AMPEL[a.a].n}</span></div>
          <div class="rollen-zeile">${xs.map((x) => (x.r === 'bekannt'
            ? `<span class="rolle-marke bk">${svg('lampe', 'mini')}Bekannt geworden · ${esc(x.j)}</span>`
            : `<span class="rolle-marke r-${x.r}"><span class="marker r-${x.r}"></span>${esc(ROLLEN[x.r].n)} · ${esc(x.j)}</span>`)).join('')}</div>
          ${texte.map((t) => `<p>${esc(t)}</p>`).join('')}
        </a></li>`;
      }).join('')}</ol></section>`;
  }

  // ---------- Info / Prüfstand ----------
  function zeigeInfo() {
    document.title = 'So geprüft – Erfinder-Check';
    setzeKopf({ tab: 'info' });
    const pz = { websuche: 0, teilweise: 0, fachwissen: 0 };
    REG.akten.forEach((a) => { pz[a.pr in pz ? a.pr : 'fachwissen']++; });
    const n = REG.akten.length;
    const l = REG.links;
    const lsum = l.ok + l.offen + l.fehlt;
    const sw = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
    let thema = 'auto';
    try { thema = localStorage.getItem('erfinder-thema') || 'auto'; } catch (e) { /* privat */ }
    main.innerHTML = `
      <p class="kicker">Prüfstand · Fassung ${REG.fassung} · Stand ${esc(datumDE(REG.stand))}</p>
      <h1>So geprüft</h1>
      <p class="leise" style="margin:8px 0 0">Ehrlich gesagt: Was hier steht, ist sorgfältig zusammengetragen – aber nicht alles ist schon gegen Originalquellen geprüft. Jede Akte sagt deshalb selbst, wie sicher sie ist.</p>

      <section class="abschnitt"><div class="abschnitt-kopf"><h2>Die Ampel</h2></div>
        <div class="info-raster">${['mythos', 'teils', 'stimmt'].map((a) => `<div class="info-zeile">${ampelHTML(a)}<div><b>${AMPEL[a].n}</b> <span class="leise">· ${REG.akten.filter((x) => x.a === a).length} Akten</span><p>${esc(AMPEL[a].satz)}</p></div></div>`).join('')}</div>
      </section>

      <section class="abschnitt"><div class="abschnitt-kopf"><h2>Die Rollen in der Zeitleiste</h2></div>
        <div class="info-raster">${ROLLEN_FOLGE.map((r) => `<div class="info-zeile r-${r}"><span class="marker r-${r}" style="margin-top:4px"></span><div><b>${ROLLEN[r].n}</b><p>${esc(ROLLEN[r].lang)}.</p></div></div>`).join('')}
        <div class="info-zeile"><span class="bekannt-flagge-ic" aria-hidden="true">${svg('lampe')}</span><div><b>Bekannt geworden</b><p>Die Person, die man heute meist als Erfinder:in nennt – rot umrandet in der Zeitleiste.</p></div></div></div>
      </section>

      <section class="abschnitt"><div class="abschnitt-kopf"><h2>Wie sicher sind die Angaben?</h2></div>
        <div class="textkarte" style="display:grid;gap:14px">
          ${[['websuche', 'var(--gruen)'], ['teilweise', 'var(--gold)'], ['fachwissen', 'var(--tinte-3)']].map(([k, f]) => `<div class="balken-zeile" style="--farbe:${f}"><span>${esc(PRUEF[k].n)}</span><b>${pz[k]}</b><div class="balken"><i style="width:${(pz[k] / n * 100).toFixed(1)}%"></i></div></div>`).join('')}
          <div class="balken-zeile" style="--farbe:var(--gruen)"><span>Quellen-Links am ${esc(datumDE(REG.stand))} erfolgreich aufgerufen</span><b>${l.ok} / ${lsum}</b><div class="balken"><i style="width:${(l.ok / lsum * 100).toFixed(1)}%"></i></div></div>
        </div>
        <div class="hinweis-box" style="margin-top:12px">
          <p><b>Was das heißt:</b> Die meisten Akten wurden aus gesichertem Standardwissen geschrieben, weil die Websuche bei der Recherche erschöpft war. Unsichere Jahre sind als „ca.“ oder Zeitraum markiert, offene Punkte stehen in jeder Akte unter „Noch offen“.</p>
          <p>Patentnummern stehen nur dort, wo sie als sehr sicher galten. Am ${esc(datumDE(REG.stand))} wurden alle ${REG.patente.gesamt} Nummern gegen Wikipedia gegengeprüft: ${REG.patente.gefunden} dort gefunden${REG.patente.gesamt - REG.patente.gefunden ? `, ${REG.patente.gesamt - REG.patente.gefunden} nicht (in der Akte als offen markiert)` : ''}. Das ist eine Gegenprobe mit einer Nachschlage-Quelle, keine Abfrage beim Patentamt.</p>
          <p>Die Wikipedia-Links wurden einzeln aufgerufen; einige andere Seiten (z. B. Patent-Datenbanken, Museen) waren von der Prüfumgebung aus gesperrt und sind deshalb als „nicht geprüft“ markiert.</p>
          <p>Texte sind selbst geschrieben, nichts ist abgeschrieben. Die Ampel ist eine Einschätzung, kein Gerichtsurteil.</p>
        </div>
      </section>

      <section class="abschnitt"><div class="abschnitt-kopf"><h2>App</h2></div>
        <div class="info-raster">
          <div class="info-zeile">${svg(sw ? 'haken' : 'uhr')}<div><b>${sw ? 'Offline bereit' : 'Offline-Speicher wird eingerichtet'}</b><p>${sw ? 'Alle Akten sind auf diesem Gerät gespeichert und gehen auch ohne Netz.' : 'Beim nächsten Öffnen funktioniert die App auch ohne Netz.'}</p></div></div>
          <div class="info-zeile">${svg('teilen')}<div><b>Auf den Home-Bildschirm</b><p>Im Browser „Teilen“ und dann „Zum Home-Bildschirm“ wählen – dann startet der Erfinder-Check wie eine App.</p></div></div>
        </div>
        <div class="chips" role="group" aria-label="Darstellung" style="margin-top:12px">${[['auto', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, n]) => `<button type="button" class="chip" data-thema="${k}" aria-pressed="${thema === k}">${n}</button>`).join('')}</div>
      </section>`;
    main.querySelectorAll('[data-thema]').forEach((c) => c.addEventListener('click', () => {
      const t = c.dataset.thema;
      setzeThema(t);
      try { localStorage.setItem('erfinder-thema', t); } catch (e) { /* privat */ }
      main.querySelectorAll('[data-thema]').forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    }));
  }
  function setzeThema(t) {
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }

  // ---------- Start ----------
  try { setzeThema(localStorage.getItem('erfinder-thema') || 'auto'); } catch (e) { /* privat */ }
  const offlineAnzeige = () => { $('#offline').hidden = navigator.onLine !== false; };
  window.addEventListener('online', offlineAnzeige);
  window.addEventListener('offline', offlineAnzeige);
  offlineAnzeige();

  async function start() {
    try {
      vorbereiten(await ladeJSON('daten/app/register.json'));
    } catch (e) {
      main.innerHTML = `<div class="leer">${svg('warn')}<p>Das Akten-Archiv konnte nicht geladen werden. Bitte Verbindung prüfen.</p><button type="button" class="knopf" id="nochmal">Noch einmal versuchen</button></div>`;
      $('#nochmal').addEventListener('click', start);
      return;
    }
    zeige();
  }
  start();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
})();
