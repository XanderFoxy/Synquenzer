// Weltküche – eine statische Web-App ohne Bibliotheken.
// Start lädt nur daten/app/index.json (Länder + Gerichtnamen); die ganzen Gerichte eines Kontinents
// (daten/app/k-<kontinent>.json) kommen erst, wenn man ein Gericht öffnet.
'use strict';
(() => {
  const FASSUNG = '3';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const falten = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/đ/g, 'd')
    .replace(/ł/g, 'l').replace(/ı/g, 'i').replace(/[’ʼʻ`´]/g, "'");
  const reduziert = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Speicher (nur Bequemlichkeit auf diesem Gerät; darf fehlen) ----------
  const sp = {
    lesen(k, d) { try { const v = localStorage.getItem('wk.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    schreiben(k, v) { try { localStorage.setItem('wk.' + k, JSON.stringify(v)); } catch (e) { /* privat/voll: egal */ } },
    weg(k) { try { localStorage.removeItem('wk.' + k); } catch (e) { /* egal */ } },
  };
  const alsListe = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

  const S = {
    index: null, gerichte: [], byId: {}, laender: [], kontName: {}, kont: {}, laden: {},
    filter: sp.lesen('filter', 'alle'), suche: '', merk: alsListe(sp.lesen('merkliste', [])),
    aktuell: null, portionen: 4, erledigt: [], zutatHaken: {}, startScroll: 0, letzterZufall: null,
  };

  // ---------- Hilfen ----------
  const symbol = (y, kl = '') => `<span class="sym ${kl}"><svg aria-hidden="true"><use href="#s-${esc(y)}"/></svg></span>`;
  function teile(name) { const m = /^(.*?)\s*\((.+)\)\s*$/.exec(name); return m ? [m[1], m[2]] : [name, '']; }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  const sicher = (u) => typeof u === 'string' && /^https:\/\//.test(u);
  function text(s) { // Text mit markierten Jahreszahlen und Vorsichtswörtern
    return esc(s)
      .replace(/(^|[^\d,.])(1[1-9]\d\d|20[0-2]\d)(er)?(?![\d,])/g, '$1<mark class="jahr">$2$3</mark>')
      .replace(/\b(angeblich|Legende|Legenden|umstritten)\b/g, '<em class="vorsicht">$1</em>');
  }
  let meldungZeit = 0;
  function meldung(t, ms = 2600) {
    const m = $('#meldung'); m.textContent = t; m.classList.add('zeigen');
    clearTimeout(meldungZeit); meldungZeit = setTimeout(() => m.classList.remove('zeigen'), ms);
  }

  // ---------- Daten ----------
  async function ladeIndex() {
    const r = await fetch('daten/app/index.json');
    if (!r.ok) throw new Error('index ' + r.status);
    const d = await r.json();
    S.index = d;
    S.kontName = Object.fromEntries(d.kontinente.map((k) => [k.id, k.name]));
    for (const l of d.laender) {
      l.lf = falten(l.l);
      l.g.forEach((g, i) => {
        g.land = l; g.nr = i; g.tf = falten(g.n + ' ' + g.o); g.uf = falten(g.u);
        S.byId[g.id] = g; S.gerichte.push(g);
      });
    }
    S.laender = d.laender;
    if (S.filter !== 'alle' && !S.kontName[S.filter]) S.filter = 'alle';
    S.merk = S.merk.filter((id) => S.byId[id]);
  }
  function ladeKontinent(k) {
    if (S.kont[k]) return Promise.resolve(S.kont[k]);
    if (!S.laden[k]) {
      S.laden[k] = fetch(`daten/app/k-${k}.json`)
        .then((r) => { if (!r.ok) throw new Error('daten ' + r.status); return r.json(); })
        .then((d) => (S.kont[k] = d))
        .catch((e) => { delete S.laden[k]; throw e; });
    }
    return S.laden[k];
  }

  // ---------- Ansichten umschalten ----------
  function zeige(ansicht, titel = '') {
    if (!$('#start').hidden && ansicht !== 'start') S.startScroll = window.scrollY;
    for (const id of ['start', 'seite', 'merk']) $('#' + id).hidden = id !== ansicht;
    $('#aktionsleiste').hidden = ansicht !== 'seite';
    $('#zurueck').hidden = ansicht === 'start';
    $('#marke').hidden = ansicht !== 'start';
    $('#seitentitel').textContent = titel;
    $('#seitentitel').hidden = ansicht === 'start';
    $('#merkliste-knopf').classList.toggle('aktiv', ansicht === 'merk');
  }

  function route() {
    if (!S.index) return;
    const h = decodeURIComponent(location.hash || '#/');
    const m = /^#\/g\/([^/]+)(\/kochen)?$/.exec(h);
    if (!(m && m[2])) kochenAus();
    if (m) zeigeGericht(m[1]);
    else if (h === '#/merkliste') zeigeMerk();
    else zeigeStart();
  }

  // ---------- Start ----------
  function imFilter(l) { return S.filter === 'alle' || l.k === S.filter || (l.a && l.a.includes(S.filter)); }

  function renderChips() {
    const k = S.index.kontinente;
    $('#chips').innerHTML =
      `<button type="button" class="chip" data-f="alle" aria-pressed="${S.filter === 'alle'}"><svg aria-hidden="true" style="width:18px;height:18px"><use href="#i-welt"/></svg>Alle <small>${S.laender.length}</small></button>` +
      k.map((x) => `<button type="button" class="chip" data-f="${x.id}" data-k="${x.id}" aria-pressed="${S.filter === x.id}"><i></i>${esc(x.name)} <small>${x.laender}</small></button>`).join('');
  }

  function karte(l) {
    const g = l.g[0];
    const nat = l.g.slice(1).filter((x) => !x.x);
    const welt = l.g.filter((x) => x.x);
    let mehr = '';
    if (nat.length) mehr += 'und ' + esc(teile(nat[0].n)[0]);
    if (welt.length) mehr += (mehr ? ' · ' : '') + `<span class="welt">+ ${esc(welt[0].x)}</span>`;
    return `<a class="karte" href="#/g/${esc(g.id)}" data-k="${l.k}">${symbol(g.y)}<span class="karte-land">${esc(l.l)}</span><span class="karte-gericht">${esc(teile(g.n)[0])}</span>${mehr ? `<span class="karte-mehr">${mehr}</span>` : ''}</a>`;
  }

  function highlights() {
    const out = [];
    const welt = S.gerichte.find((g) => g.x); if (welt) out.push(welt);
    const chili = S.gerichte.find((g) => g.land.i === 'US' && /chili/i.test(g.n)); if (chili) out.push(chili);
    const koshari = S.gerichte.find((g) => g.land.i === 'EG' && /koshari/i.test(g.n)); if (koshari) out.push(koshari);
    if (!out.length) return '';
    return `<div class="abschnitt-kopf"><h2>Unbedingt probieren</h2></div><div class="highlights">${out.map((g) =>
      `<a class="highlight" href="#/g/${esc(g.id)}" data-k="${g.land.k}">${g.x ? `<span class="welt-band"><svg aria-hidden="true"><use href="#i-stern"/></svg>${esc(g.x)}</span>` : ''}${symbol(g.y)}<span class="land-zeile">${esc(g.land.l)}</span><b>${esc(teile(g.n)[0])}</b><small>${esc(g.u)}</small></a>`).join('')}</div>`;
  }

  function uebersicht() {
    let h = S.filter === 'alle' ? highlights() : '';
    const gruppen = S.filter === 'alle' ? S.index.kontinente : S.index.kontinente.filter((k) => k.id === S.filter);
    for (const k of gruppen) {
      const ls = S.laender.filter((l) => l.k === k.id || (S.filter === k.id && l.a && l.a.includes(k.id)));
      h += `<section class="kontinent-block" aria-labelledby="k-${k.id}"><div class="abschnitt-kopf"><h2 id="k-${k.id}">${esc(k.name)}</h2><span>${ls.length} Länder</span></div><div class="raster">${ls.map(karte).join('')}</div></section>`;
    }
    return h;
  }

  function zeile(g, zusatz = '') {
    const [t, u] = teile(g.n);
    const unter = [g.land.l, u || (falten(g.o) !== falten(t) ? g.o : '')].filter(Boolean).join(' · ');
    const welt = g.x ? ` · ${esc(g.x)}` : '';
    return `<li class="${zusatz ? 'merk-zeile' : ''}"><a class="zeile" href="#/g/${esc(g.id)}" data-k="${g.land.k}">${symbol(g.y, 'klein')}<span class="zeile-text"><b>${esc(t)}</b><small>${esc(unter)}${welt}</small></span><svg aria-hidden="true"><use href="#i-weiter"/></svg></a>${zusatz}</li>`;
  }

  function suchErgebnis(q) {
    const woerter = q.split(/\s+/).filter(Boolean);
    const bewerte = (g) => {
      let p = 0;
      for (const w of woerter) {
        let s = 0;
        if (g.land.lf.startsWith(w) || g.tf.startsWith(w)) s = 6;
        else if (g.land.lf.includes(' ' + w) || g.tf.includes(' ' + w) || g.tf.includes('(' + w)) s = 5;
        else if (g.land.lf.includes(w) || g.tf.includes(w)) s = 4;
        else if (g.uf.includes(w)) s = 1;
        if (!s) return 0;
        p += s;
      }
      return p;
    };
    const drin = [], draussen = [];
    for (const g of S.gerichte) {
      const p = bewerte(g);
      if (p) (imFilter(g.land) ? drin : draussen).push([p, g]);
    }
    drin.sort((a, b) => b[0] - a[0] || a[1].land.lf.localeCompare(b[1].land.lf) || a[1].nr - b[1].nr);
    let h = `<p class="treffer-info">${drin.length ? `${drin.length} ${drin.length === 1 ? 'Treffer' : 'Treffer'}` : 'Nichts gefunden'}${S.filter !== 'alle' ? ` in ${esc(S.kontName[S.filter])}` : ''}</p>`;
    if (drin.length) h += `<ul class="zeilen">${drin.slice(0, 120).map(([, g]) => zeile(g)).join('')}</ul>`;
    if (S.filter !== 'alle' && draussen.length) {
      h += `<div class="leer"><p>${draussen.length} weitere Treffer in anderen Kontinenten.</p><button type="button" class="knopf zweit" data-f="alle">In allen Ländern suchen</button></div>`;
    } else if (!drin.length) {
      h += `<div class="leer"><svg aria-hidden="true"><use href="#i-suche"/></svg><b>Kein Gericht gefunden</b><p>Versuch es mit dem Land, z. B. „Peru“, oder mit einer Zutat wie „Kokos“.</p></div>`;
    }
    return h;
  }

  function zeigeStartInhalt() {
    const q = falten(S.suche.trim());
    $('#start-inhalt').innerHTML = q ? suchErgebnis(q) : uebersicht();
  }

  function zeigeStart() {
    const warVersteckt = $('#start').hidden;
    zeige('start');
    document.title = 'Weltküche – ein Gericht aus jedem Land';
    if (warVersteckt) requestAnimationFrame(() => window.scrollTo(0, S.startScroll));
  }

  function setzeFilter(f) {
    if (!S.kontName[f] && f !== 'alle') return;
    S.filter = f; sp.schreiben('filter', f);
    renderChips(); zeigeStartInhalt();
    const w = $('#werkzeug');
    const ziel = w.getBoundingClientRect().top + window.scrollY - $('#kopf').offsetHeight;
    if (window.scrollY > ziel) window.scrollTo(0, ziel);
    const aktiv = $(`.chip[data-f="${f}"]`);
    if (aktiv && aktiv.scrollIntoView) aktiv.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  // ---------- Merkliste ----------
  const gemerkt = (id) => S.merk.includes(id);
  function merkZahl() {
    const z = $('#merk-zahl'); z.textContent = String(S.merk.length); z.hidden = !S.merk.length;
  }
  function merkUmschalten(id) {
    if (gemerkt(id)) { S.merk = S.merk.filter((x) => x !== id); meldung('Von der Merkliste genommen'); }
    else { S.merk = [id, ...S.merk]; meldung('Auf der Merkliste – auch offline da, wenn einmal geöffnet'); }
    sp.schreiben('merkliste', S.merk);
    merkZahl(); merkKnopf();
  }
  function merkKnopf() {
    const a = S.aktuell; if (!a) return;
    const an = gemerkt(a.id);
    const b = $('#aktion-merken');
    b.setAttribute('aria-pressed', String(an));
    b.querySelector('span').textContent = an ? 'Gemerkt' : 'Merken';
  }
  function zeigeMerk() {
    zeige('merk', 'Merkliste');
    document.title = 'Merkliste – Weltküche';
    const box = $('#merk');
    const liste = S.merk.map((id) => S.byId[id]).filter(Boolean);
    let h = `<div class="merk-kopf"><h1 tabindex="-1">Merkliste</h1><p>${liste.length ? `${liste.length} ${liste.length === 1 ? 'Gericht' : 'Gerichte'} – gespeichert nur auf diesem Gerät.` : 'Noch leer.'}</p></div>`;
    if (liste.length) {
      h += `<ul class="zeilen" style="margin-top:12px">${liste.map((g) => zeile(g, `<button type="button" class="zeile-weg" data-weg="${esc(g.id)}" aria-label="${esc(teile(g.n)[0])} von der Merkliste nehmen"><svg><use href="#i-x"/></svg></button>`)).join('')}</ul>`;
    } else {
      h += `<div class="leer"><svg aria-hidden="true"><use href="#i-merken"/></svg><b>Was willst du kochen?</b><p>Tippe bei einem Gericht unten auf „Merken“ – dann findest du es hier wieder.</p><a class="knopf erst" href="#/">Gerichte entdecken</a></div>`;
    }
    box.innerHTML = h;
    window.scrollTo(0, 0);
  }

  // ---------- Gericht ----------
  function gerichtKopf(g) {
    const [t, u] = teile(g.n);
    const zeigOriginal = falten(g.o) !== falten(t) && falten(g.o) !== falten(g.n);
    const land = g.land;
    const tabs = land.g.length > 1 ? `<nav class="g-tabs" aria-label="Gerichte aus ${esc(land.l)}">${land.g.map((x) =>
      `<a class="g-tab" href="#/g/${esc(x.id)}" ${x.id === g.id ? 'aria-current="page"' : ''}>${x.x ? '<svg class="stern" aria-hidden="true"><use href="#i-stern"/></svg>' : ''}<span>${esc(teile(x.n)[0])}</span></a>`).join('')}</nav>` : '';
    const stufe = ['', 'leicht', 'mittel', 'anspruchsvoll'][g.s] || 'mittel';
    return `<article class="gericht" data-k="${land.k}">
      <header class="g-held" data-k="${land.k}">
        <div class="g-oben"><div class="g-sym"><svg aria-hidden="true"><use href="#s-${esc(g.y)}"/></svg></div>
          <p class="g-ueber"><span class="land">${esc(land.l)}</span>${g.x
            ? `<span class="abzeichen welt"><svg aria-hidden="true"><use href="#i-stern"/></svg>${esc(g.x)}</span>`
            : `<span class="abzeichen">${land.g.filter((x) => !x.x).length > 1 ? (g.nr === 0 ? 'Nationalgericht' : 'Auch typisch') : 'Nationalgericht'}</span>`}</p></div>
        <h1 tabindex="-1">${esc(t)}</h1>
        ${u ? `<p class="g-unter">${esc(u)}</p>` : ''}
        ${zeigOriginal ? `<p class="g-original">${esc(g.o)}</p>` : ''}
        <p class="g-kurz">${esc(g.u)}</p>
        <ul class="g-meta">
          <li><svg aria-hidden="true"><use href="#i-uhr"/></svg>${g.t >= 60 ? `${Math.floor(g.t / 60)} Std${g.t % 60 ? ` ${g.t % 60} Min` : ''}` : `${g.t} Min`}</li>
          <li><span class="punkte" aria-hidden="true">${[1, 2, 3].map((i) => `<i class="${i <= g.s ? 'an' : ''}"></i>`).join('')}</span>${stufe}</li>
          <li id="meta-portionen"><svg aria-hidden="true"><use href="#i-personen"/></svg><span>…</span></li>
        </ul>
      </header>
      ${tabs}
      <div class="sprungmarken" aria-label="Springen zu">
        <a href="#" data-ziel="b-geschichte">Geschichte</a><a href="#" data-ziel="b-echt">Echt vs. Abwandlung</a><a href="#" data-ziel="b-zutaten">Zutaten</a><a href="#" data-ziel="b-schritte">Zubereitung</a><a href="#" data-ziel="b-quellen">Quellen</a>
      </div>
      <div class="g-spalten" id="g-spalten"><div class="lade-block" style="margin-top:18px"></div><div class="lade-block"></div></div>
    </article>`;
  }

  function zeitleiste(d) {
    const punkte = [
      ['i-ort', 'Ursprung', `<p>${text(d.herkunft)}</p>`],
      ['i-buch', 'Das Ur-Rezept', `<p>${text(d.urrezept)}</p>`],
    ];
    const v = d.beruehmte_versionen || [];
    if (v.length) {
      punkte.push(['i-stern', v.length > 1 ? 'Wer es berühmt machte' : 'Wer es berühmt machte', v.map((x) =>
        `<div class="zl-version"><b>${esc(x.wer)}</b><p>${text(x.was)}</p>${sicher(x.url) ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Dort ansehen (${esc(host(x.url))})<svg aria-hidden="true"><use href="#i-link"/></svg></a>` : ''}</div>`).join('')]);
    }
    punkte.push(['i-heute', 'Heute', `<p>${text(d.heute)}</p>`]);
    return `<ol class="zeitleiste">${punkte.map(([i, t, h]) => `<li class="zl-punkt"><span class="zl-marke"><svg aria-hidden="true"><use href="#${i}"/></svg></span><div class="zl-titel">${t}</div>${h}</li>`).join('')}</ol>`;
  }

  function echtListe(d) {
    let mitStatt = false;
    const zeilen = d.echt_tipps.map((t) => {
      const m = /^(.*?)\s+statt\s+(.+)$/.exec(t);
      if (!m) return `<li><div class="echt-ja"><svg aria-hidden="true"><use href="#i-haken"/></svg><span>${esc(t)}</span></div></li>`;
      mitStatt = true;
      let ja = m[1], nein = m[2];
      const strich = nein.indexOf(' – ');
      if (strich > 0) { ja += ' – ' + nein.slice(strich + 3); nein = nein.slice(0, strich); }
      return `<li class="mit-statt"><div class="echt-ja"><svg aria-hidden="true"><use href="#i-haken"/></svg><span>${esc(ja)}</span></div><div class="echt-nein"><svg aria-hidden="true"><use href="#i-x"/></svg><div><small>statt </small><span>${esc(nein)}</span></div></div></li>`;
    });
    return (mitStatt ? '<div class="echt-kopf"><span>Echt</span><span>Abwandlung</span></div>' : '') + `<ul class="echt-liste">${zeilen.join('')}</ul>`;
  }

  // Mengen schön runden und auf Deutsch schreiben
  const rund = (v, s) => Number((Math.round(v / s) * s).toFixed(3));
  const de = (n) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  function gRund(v) { if (v < 1) return Math.max(0.1, rund(v, 0.1)); if (v < 10) return rund(v, 0.5); if (v < 50) return Math.round(v); if (v < 250) return rund(v, 5); return rund(v, 10); }
  function bruch(v, schritt) {
    let r = rund(v, schritt); if (r <= 0) r = schritt;
    const ganz = Math.floor(r + 1e-9), rest = r - ganz;
    const b = rest < 0.01 ? '' : rest < 0.3 ? '¼' : rest < 0.6 ? '½' : '¾';
    return (ganz ? String(ganz) : '') + b;
  }
  const MEHRZAHL = { Zehe: 'Zehen', Zehen: 'Zehen', Zweig: 'Zweige', Zweige: 'Zweige', Scheiben: 'Scheiben', Dose: 'Dosen', Stange: 'Stangen', 'Stängel': 'Stängel' };
  const EINZAHL = { Zehe: 'Zehe', Zehen: 'Zehe', Zweig: 'Zweig', Zweige: 'Zweig', Scheiben: 'Scheibe', Dose: 'Dose', Stange: 'Stange', 'Stängel': 'Stängel' };
  function menge(v, e) {
    switch (e) {
      case 'g': return v >= 1000 ? `${de(rund(v / 1000, 0.05))} kg` : `${de(gRund(v))} g`;
      case 'kg': return v < 1 ? `${de(gRund(v * 1000))} g` : `${de(rund(v, 0.05))} kg`;
      case 'ml': return v >= 1000 ? `${de(rund(v / 1000, 0.05))} l` : `${de(gRund(v))} ml`;
      case 'l': return v < 1 ? `${de(gRund(v * 1000))} ml` : `${de(rund(v, 0.05))} l`;
      case 'm': return `${de(Math.max(0.1, rund(v, 0.1)))} m`;
      case 'Prise': { const n = Math.max(1, Math.round(v)); return n === 1 ? '1 Prise' : `${n} Prisen`; }
      case 'Stk': case 'Stück': return bruch(v, 0.5);
      case 'TL': case 'EL': return `${bruch(v, 0.25)} ${e}`;
      default: {
        const z = bruch(v, 0.5);
        if (MEHRZAHL[e]) return `${z} ${rund(v, 0.5) > 1 ? MEHRZAHL[e] : EINZAHL[e]}`;
        return `${z} ${e}`;
      }
    }
  }

  function zutatenZeilen(d) {
    const f = S.portionen / d.portionen;
    return d.zutaten.map((z, i) => `<li><button type="button" class="zutat" data-zi="${i}" aria-pressed="${!!S.zutatHaken[i]}"><span class="kasten"><svg aria-hidden="true"><use href="#i-haken"/></svg></span><span class="menge">${esc(menge(z.menge * f, z.einheit))}</span><span class="name">${esc(z.zutat)}</span></button></li>`).join('');
  }

  function gerichtInhalt(d) {
    const n = d.schritte.length;
    return `<div class="g-links">
        <section class="block b-geschichte" id="b-geschichte" aria-labelledby="h-geschichte"><h2 id="h-geschichte"><svg aria-hidden="true"><use href="#i-buch"/></svg>Geschichte</h2>
          <p class="unterzeile">Vom Ur-Rezept bis heute</p>${zeitleiste(d)}</section>
        <section class="block b-echt" id="b-echt" aria-labelledby="h-echt"><h2 id="h-echt"><svg aria-hidden="true"><use href="#i-haken"/></svg>Echt vs. Abwandlung</h2>
          <p class="unterzeile">Woran du die echte Version erkennst</p>${echtListe(d)}</section>
        <section class="block b-quellen" id="b-quellen" aria-labelledby="h-quellen"><h2 id="h-quellen"><svg aria-hidden="true"><use href="#i-link"/></svg>Quellen</h2>
          <p class="unterzeile">Zum Nachlesen – öffnet die Seite außerhalb der App</p>
          <ul class="quellen">${d.quellen.filter((q) => sicher(q.url)).map((q) => `<li><a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer"><span><b>${esc(q.titel)}</b><small>${esc(host(q.url))}</small></span><svg aria-hidden="true"><use href="#i-link"/></svg></a></li>`).join('')}</ul></section>
      </div>
      <div class="g-rechts">
        <section class="block b-zutaten" id="b-zutaten" aria-labelledby="h-zutaten"><h2 id="h-zutaten"><svg aria-hidden="true"><use href="#i-liste"/></svg>Zutaten</h2>
          <div class="portionen" role="group" aria-label="Portionen">
            <button type="button" data-p="-1" aria-label="Eine Portion weniger"><svg><use href="#i-minus"/></svg></button>
            <output id="portionen-zahl" aria-live="polite"><b>${S.portionen}</b>Portionen</output>
            <button type="button" data-p="1" aria-label="Eine Portion mehr"><svg><use href="#i-plus"/></svg></button>
          </div>
          <ul class="zutaten" id="zutaten-liste">${zutatenZeilen(d)}</ul>
          <p class="hinweis-klein">Tippen hakt ab. Mengen sind für ${d.portionen} Portionen geschrieben und werden umgerechnet – Gewürze nach Geschmack anpassen.</p>
        </section>
        <section class="block b-schritte" id="b-schritte" aria-labelledby="h-schritte"><h2 id="h-schritte"><svg aria-hidden="true"><use href="#i-topf"/></svg>Zubereitung</h2>
          <div class="fortschritt"><div class="fortschritt-balken"><i id="schritt-balken"></i></div><span id="schritt-zahl">0 von ${n}</span></div>
          <ol class="schritte">${d.schritte.map((s, i) => `<li><button type="button" class="schritt" data-si="${i}" aria-pressed="${!!S.erledigt[i]}"><span class="nr">${i + 1}</span><span class="text">${esc(s)}</span></button></li>`).join('')}</ol>
          <button type="button" class="klein-knopf" id="schritte-weg">Alle Haken entfernen</button>
        </section>
      </div>`;
  }

  async function zeigeGericht(id) {
    const g = S.byId[id];
    if (!g) { location.replace('#/'); return; }
    const [t] = teile(g.n);
    zeige('seite', g.land.l);
    document.title = `${t} – ${g.land.l} | Weltküche`;
    if (!S.aktuell || S.aktuell.id !== id) {
      S.aktuell = { id, g, d: null };
      S.zutatHaken = {};
      $('#seite').innerHTML = gerichtKopf(g);
      window.scrollTo(0, 0);
      const h1 = $('#seite h1'); if (h1) h1.focus({ preventScroll: true });
      merkKnopf();
      await fuelleGericht(id);
    }
    if (/\/kochen$/.test(location.hash)) oeffneKochen();
  }

  async function fuelleGericht(id) {
    const g = S.byId[id];
    try {
      const daten = await ladeKontinent(g.land.k);
      if (!S.aktuell || S.aktuell.id !== id) return;
      const d = daten[id];
      if (!d) throw new Error('Gericht fehlt in den Daten');
      S.aktuell.d = d;
      const p = sp.lesen('portionen.' + id, null);
      S.portionen = Number.isInteger(p) && p > 0 && p <= 40 ? p : d.portionen;
      const e = sp.lesen('schritte.' + id, []);
      S.erledigt = Array.isArray(e) ? d.schritte.map((_, i) => !!e[i]) : [];
      $('#g-spalten').innerHTML = gerichtInhalt(d);
      $('#meta-portionen span').textContent = `für ${d.portionen}`;
      schrittFortschritt();
      portionenKnoepfe();
    } catch (err) {
      if (!S.aktuell || S.aktuell.id !== id) return;
      $('#g-spalten').innerHTML = `<div class="fehler-box"><p><b>Das Rezept konnte gerade nicht geladen werden.</b></p><p>${navigator.onLine === false ? 'Du bist offline, und dieses Gericht wurde noch nie geöffnet.' : 'Die Verbindung hat nicht geklappt.'}</p><button type="button" class="knopf erst" id="nochmal-laden">Noch mal versuchen</button></div>`;
    }
  }

  function portionenAendern(delta) {
    const a = S.aktuell; if (!a || !a.d) return;
    const neu = Math.min(40, Math.max(1, S.portionen + delta));
    if (neu === S.portionen) return;
    S.portionen = neu;
    if (neu === a.d.portionen) sp.weg('portionen.' + a.id); else sp.schreiben('portionen.' + a.id, neu);
    const f = neu / a.d.portionen;
    $$('#zutaten-liste .zutat').forEach((b) => {
      const z = a.d.zutaten[+b.dataset.zi];
      b.querySelector('.menge').textContent = menge(z.menge * f, z.einheit);
    });
    const o = $('#portionen-zahl');
    o.innerHTML = `<b>${neu}</b>${neu === 1 ? 'Portion' : 'Portionen'}`;
    o.classList.remove('zuckt'); void o.offsetWidth; o.classList.add('zuckt');
    portionenKnoepfe();
    if (!$('#kochen').hidden) kochenZutaten();
  }
  function portionenKnoepfe() {
    const m = $('[data-p="-1"]'), p = $('[data-p="1"]');
    if (m) m.disabled = S.portionen <= 1;
    if (p) p.disabled = S.portionen >= 40;
  }

  function schrittFortschritt() {
    const a = S.aktuell; if (!a || !a.d) return;
    const n = a.d.schritte.length, fertig = S.erledigt.filter(Boolean).length;
    const balken = $('#schritt-balken'); if (balken) balken.style.transform = `scaleX(${n ? fertig / n : 0})`;
    const z = $('#schritt-zahl'); if (z) z.textContent = fertig === n ? 'Alles erledigt – guten Appetit!' : `${fertig} von ${n} erledigt`;
  }
  function schrittSetzen(i, an) {
    const a = S.aktuell; if (!a || !a.d) return;
    S.erledigt[i] = an;
    if (S.erledigt.some(Boolean)) sp.schreiben('schritte.' + a.id, S.erledigt); else sp.weg('schritte.' + a.id);
    const b = $(`.schritt[data-si="${i}"]`); if (b) b.setAttribute('aria-pressed', String(an));
    schrittFortschritt();
  }

  // ---------- Zufall ----------
  function zufallOeffnen() {
    if (!S.index) return;
    $('#zufall').hidden = false;
    wuerfeln();
    $('#zufall-ansehen').focus({ preventScroll: true });
  }
  function zufallZu() { $('#zufall').hidden = true; }
  function wuerfeln() {
    const pool = S.gerichte.filter((g) => imFilter(g.land));
    if (!pool.length) return;
    let g;
    do { g = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && g === S.letzterZufall);
    S.letzterZufall = g;
    const w = $('#zufall-wuerfel');
    w.classList.remove('rollt'); void w.offsetWidth; w.classList.add('rollt');
    const k = $('#zufall-karte');
    const [t, u] = teile(g.n);
    k.dataset.k = g.land.k;
    k.innerHTML = `${symbol(g.y)}<span class="land-zeile">${esc(g.land.l)}</span><b id="zufall-titel">${esc(t)}</b>${u ? `<small>${esc(u)}</small>` : ''}<p>${esc(g.u)}</p>`;
    k.classList.remove('neu'); void k.offsetWidth; k.classList.add('neu');
    $('#zufall-aus').textContent = S.filter === 'alle' ? `Aus ${S.gerichte.length} Gerichten der ganzen Welt` : `Aus ${S.kontName[S.filter]} (${pool.length} Gerichte)`;
    $('#zufall-ansehen').href = '#/g/' + g.id;
    ladeKontinent(g.land.k).catch(() => {});
  }

  // ---------- Kochmodus ----------
  const K = { offen: false, i: 0, lock: null, gepusht: false };
  function oeffneKochen() {
    const a = S.aktuell;
    if (!a || !a.d || K.offen) return;
    K.offen = true;
    const n = a.d.schritte.length;
    K.i = S.erledigt.findIndex((x) => !x); if (K.i < 0 || K.i >= n) K.i = 0;
    $('#kochen').hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('#kochen-titel').textContent = teile(a.g.n)[0];
    $('#kochen-land').textContent = a.g.land.l;
    kochenZeigen(0);
    kochenZutaten();
    wachHalten();
    timerAnzeige();
    $('#kochen-weiter').focus({ preventScroll: true });
  }
  function kochenAus() {
    if (!K.offen) return;
    K.offen = false; K.gepusht = false;
    $('#kochen').hidden = true; $('#kochen-zutaten').hidden = true;
    $('#kochen-zutaten-knopf').setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    loslassen();
    timerAnzeige();
  }
  function kochenSchliessen() {
    if (/\/kochen$/.test(location.hash)) {
      if (K.gepusht) history.back();
      else location.replace('#/g/' + S.aktuell.id);
    } else kochenAus();
  }
  function kochenZeigen(richtung) {
    const d = S.aktuell.d, n = d.schritte.length, el = $('#kochen-schritt');
    const setze = () => {
      const fertig = K.i >= n;
      if (fertig) {
        el.textContent = 'Fertig – guten Appetit!'; el.classList.add('fertig');
        $('#kochen-zaehler').textContent = 'Alle Schritte erledigt';
        $('#kochen-timer').innerHTML = '';
      } else {
        el.textContent = d.schritte[K.i]; el.classList.remove('fertig');
        $('#kochen-zaehler').textContent = `Schritt ${K.i + 1} von ${n}`;
        timerKnoepfe();
      }
      $('#kochen-fortschritt').style.transform = `scaleX(${Math.min(K.i, n) / n})`;
      $('#kochen-zurueck').disabled = K.i === 0;
      $('#kochen-weiter span').textContent = fertig ? 'Schließen' : K.i === n - 1 ? 'Fertig' : 'Weiter';
      $('#kochen-buehne').scrollTop = 0;
    };
    if (!richtung || reduziert()) { setze(); return; }
    el.classList.add(richtung > 0 ? 'raus-links' : 'raus-rechts');
    setTimeout(() => {
      el.style.transition = 'none';
      el.classList.remove('raus-links', 'raus-rechts');
      el.classList.add(richtung > 0 ? 'raus-rechts' : 'raus-links');
      setze();
      void el.offsetWidth;
      el.style.transition = '';
      el.classList.remove('raus-links', 'raus-rechts');
    }, 170);
  }
  function kochenWeiter() {
    const n = S.aktuell.d.schritte.length;
    if (K.i >= n) { kochenSchliessen(); return; }
    schrittSetzen(K.i, true);
    K.i += 1;
    kochenZeigen(1);
  }
  function kochenZurueck() { if (K.i > 0) { K.i -= 1; kochenZeigen(-1); } }
  function kochenZutaten() {
    const a = S.aktuell; if (!a || !a.d) return;
    const f = S.portionen / a.d.portionen;
    $('#kochen-zutaten-portionen').textContent = `für ${S.portionen} ${S.portionen === 1 ? 'Portion' : 'Portionen'}`;
    $('#kochen-zutaten-liste').innerHTML = a.d.zutaten.map((z) => `<li><b>${esc(menge(z.menge * f, z.einheit))}</b><span>${esc(z.zutat)}</span></li>`).join('');
  }

  // Bildschirm wach halten – nur wenn der Browser es kann und erlaubt; sonst ehrlich sagen.
  function wachText(zustand, t) { const b = $('#wach'); b.dataset.zustand = zustand; $('#wach-text').textContent = t; }
  async function wachHalten() {
    if (!('wakeLock' in navigator)) { wachText('nein', 'Bildschirm geht evtl. aus'); return; }
    try {
      K.lock = await navigator.wakeLock.request('screen');
      if (!K.offen) { loslassen(); return; }
      wachText('an', 'Bildschirm bleibt an');
      K.lock.addEventListener('release', () => { if (K.offen) wachText('aus', 'Bildschirm-Sperre wieder aktiv'); });
    } catch (e) {
      wachText('nein', 'Bildschirm geht evtl. aus');
    }
  }
  function loslassen() { try { if (K.lock) K.lock.release(); } catch (e) { /* egal */ } K.lock = null; }
  function wachInfo() {
    const z = $('#wach').dataset.zustand;
    if (z === 'an') meldung('Der Bildschirm bleibt an, solange der Kochmodus offen ist.', 3200);
    else if (z === 'aus') wachHalten();
    else meldung('Dein Browser lässt die App den Bildschirm nicht wach halten. Tipp: die automatische Sperre in den Einstellungen solange verlängern.', 5200);
  }

  // Timer aus dem Schritt-Text („10 Minuten“, „1½ Stunden“, „20–25 Minuten“ → kleinere Zahl)
  const T = { ende: 0, min: 0, gid: null, takt: 0, klingelt: false, audio: null, piepTakt: 0 };
  function zeitenAus(s) {
    const rx = /(\d+(?:[,.]\d+)?½?|½)\s*(?:(?:–|-|bis)\s*\d+(?:[,.]\d+)?½?\s*)?(Minuten|Minute|Min\.?|Stunden|Stunde|Std\.?)(?![A-Za-zäöüÄÖÜß])/g;
    const out = []; let m;
    while ((m = rx.exec(s)) && out.length < 3) {
      let z = m[1];
      let v = z === '½' ? 0.5 : parseFloat(z.replace(',', '.').replace('½', '')) + (z.endsWith('½') && z !== '½' ? 0.5 : 0);
      if (/^St/i.test(m[2])) v *= 60;
      if (v >= 0.5 && v <= 720 && !out.some((x) => x === v)) out.push(v);
    }
    return out;
  }
  const dauerText = (min) => (min >= 60 ? `${de(min / 60)} Std` : `${de(min)} Min`);
  const uhr = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(x).padStart(2, '0'); };
  function timerKnoepfe() {
    const box = $('#kochen-timer');
    const a = S.aktuell; if (!a || !a.d || K.i >= a.d.schritte.length) { box.innerHTML = ''; return; }
    const zeiten = zeitenAus(a.d.schritte[K.i]);
    let h = '';
    if (T.ende || T.klingelt) h += `<button type="button" class="timer-knopf laeuft${T.klingelt ? ' klingelt' : ''}" data-timer="stopp"><svg aria-hidden="true"><use href="#i-wecker"/></svg><span class="timer-rest">${T.klingelt ? 'Abgelaufen – stoppen' : uhr(T.ende - Date.now()) + ' · stoppen'}</span></button>`;
    h += zeiten.filter((z) => !(T.ende && z === T.min && T.gid === a.id)).map((z) => `<button type="button" class="timer-knopf" data-timer="${z}"><svg aria-hidden="true"><use href="#i-wecker"/></svg>Timer ${dauerText(z)}</button>`).join('');
    if (h) h += '<p class="timer-hinweis">Der Timer läuft nur, solange die App offen ist. Ton nur, wenn das Telefon nicht stumm ist.</p>';
    box.innerHTML = h;
  }
  function timerStart(min) {
    try {
      if (!T.audio) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) T.audio = new AC(); }
      if (T.audio && T.audio.state === 'suspended') T.audio.resume();
    } catch (e) { T.audio = null; }
    T.ende = Date.now() + min * 60000; T.min = min; T.gid = S.aktuell ? S.aktuell.id : null; T.klingelt = false;
    clearInterval(T.takt); T.takt = setInterval(timerTick, 500);
    meldung(`Timer ${dauerText(min)} läuft`);
    timerAnzeige();
  }
  function timerStopp() {
    T.ende = 0; T.klingelt = false; clearInterval(T.takt); clearInterval(T.piepTakt);
    timerAnzeige();
  }
  function timerTick() {
    if (!T.ende) return;
    if (Date.now() >= T.ende) {
      T.ende = 0; T.klingelt = true; clearInterval(T.takt);
      piep(); let n = 0; clearInterval(T.piepTakt);
      T.piepTakt = setInterval(() => { if (!T.klingelt || ++n > 15) { clearInterval(T.piepTakt); return; } piep(); }, 1400);
      try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* egal */ }
      meldung('Timer abgelaufen!', 4000);
    }
    timerAnzeige();
  }
  function timerAnzeige() {
    const laeuft = T.ende || T.klingelt;
    const pille = $('#timer-pille');
    pille.hidden = !laeuft || K.offen;
    pille.classList.toggle('klingelt', T.klingelt);
    $('#timer-pille-text').textContent = T.klingelt ? 'Timer abgelaufen' : laeuft ? uhr(T.ende - Date.now()) : '';
    if (K.offen) {
      const r = $('#kochen-timer .timer-rest');
      if (r && T.ende && !T.klingelt) r.textContent = uhr(T.ende - Date.now()) + ' · stoppen';
      else timerKnoepfeWennNoetig();
    }
  }
  let timerZustand = '';
  function timerKnoepfeWennNoetig() {
    const z = `${T.ende ? 1 : 0}${T.klingelt ? 1 : 0}${K.i}`;
    if (z !== timerZustand) { timerZustand = z; timerKnoepfe(); }
  }
  function piep() {
    const a = T.audio; if (!a) return;
    try {
      const t = a.currentTime;
      for (let i = 0; i < 3; i++) {
        const o = a.createOscillator(), g = a.createGain();
        o.type = 'sine'; o.frequency.value = i === 2 ? 1046 : 880;
        g.gain.setValueAtTime(0.0001, t + i * 0.28);
        g.gain.exponentialRampToValueAtTime(0.35, t + i * 0.28 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.28 + 0.22);
        o.connect(g); g.connect(a.destination);
        o.start(t + i * 0.28); o.stop(t + i * 0.28 + 0.25);
      }
    } catch (e) { /* kein Ton möglich */ }
  }

  // ---------- Fuß ----------
  function fuss() {
    $('#fuss').innerHTML = `<details><summary>Über diese Sammlung</summary>
      <p>Von jedem Land ein Nationalgericht, bei vielen ein zweites. Alle Texte und Rezepte sind für diese App selbst geschrieben. Rezepte bekannter Köche stehen nur als Link drin.</p>
      <p>Die Geschichte ist nach bestem Wissen erzählt. Legenden und Unsicheres stehen als solche im Text („angeblich“, „Legende“). Hat ein Land kein festes Nationalgericht, sagt der Text das und nennt ein typisches Gericht. Streiten sich mehrere Länder um ein Gericht, steht es bei einem Land, und der Streit steht unter „Ursprung“.</p>
      <p>Nicht jede Angabe ließ sich online gegenprüfen – im Zweifel gilt die verlinkte Quelle.</p>
      <p>Die Länder sind die Mitglieder der Vereinten Nationen, dazu Taiwan. Länder auf zwei Kontinenten (Türkei, Russland, Zypern, Georgien, Armenien, Aserbaidschan) findest du unter beiden.</p>
      <p>Kochmodus: Den Bildschirm wach halten kann die App nur, wenn der Browser es erlaubt. Der Timer läuft nur, solange die App offen ist. Merkliste, Haken und Portionen bleiben nur auf diesem Gerät.</p>
      </details><p class="fassung">Fassung ${FASSUNG} · Stand ${esc(S.index.stand || '')}</p>`;
  }

  // ---------- Ereignisse ----------
  function verdrahten() {
    let suchTakt = 0;
    const suche = $('#suche');
    suche.addEventListener('input', () => {
      S.suche = suche.value;
      $('#suche-x').hidden = !suche.value;
      clearTimeout(suchTakt); suchTakt = setTimeout(zeigeStartInhalt, 70);
    });
    suche.addEventListener('keydown', (e) => { if (e.key === 'Enter') suche.blur(); });
    $('#suche-x').addEventListener('click', () => { suche.value = ''; S.suche = ''; $('#suche-x').hidden = true; zeigeStartInhalt(); suche.focus(); });
    $('#chips').addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) setzeFilter(b.dataset.f); });
    $('#start-inhalt').addEventListener('click', (e) => { const b = e.target.closest('button[data-f]'); if (b) setzeFilter(b.dataset.f); });
    // Daten schon beim Antippen holen (spart die Zeit bis zum Loslassen)
    document.addEventListener('pointerdown', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#/g/"]'); if (!a) return;
      const g = S.byId[decodeURIComponent(a.getAttribute('href').slice(4))];
      if (g) ladeKontinent(g.land.k).catch(() => {});
    }, { passive: true });

    $('#zufall-knopf').addEventListener('click', zufallOeffnen);
    $('#zufall-nochmal').addEventListener('click', wuerfeln);
    $('#zufall-ansehen').addEventListener('click', zufallZu);
    $$('#zufall [data-zu]').forEach((b) => b.addEventListener('click', zufallZu));

    $('#seite').addEventListener('click', (e) => {
      const z = e.target.closest('.zutat');
      if (z) { const i = +z.dataset.zi; S.zutatHaken[i] = !S.zutatHaken[i]; z.setAttribute('aria-pressed', String(S.zutatHaken[i])); return; }
      const s = e.target.closest('.schritt');
      if (s) { const i = +s.dataset.si; schrittSetzen(i, !S.erledigt[i]); return; }
      const p = e.target.closest('[data-p]');
      if (p) { portionenAendern(+p.dataset.p); return; }
      const sm = e.target.closest('[data-ziel]');
      if (sm) { e.preventDefault(); const ziel = document.getElementById(sm.dataset.ziel); if (ziel) ziel.scrollIntoView({ behavior: reduziert() ? 'auto' : 'smooth', block: 'start' }); return; }
      if (e.target.closest('#schritte-weg')) { S.erledigt = S.erledigt.map(() => false); sp.weg('schritte.' + S.aktuell.id); $$('.schritt').forEach((b) => b.setAttribute('aria-pressed', 'false')); schrittFortschritt(); return; }
      if (e.target.closest('#nochmal-laden')) { $('#g-spalten').innerHTML = '<div class="lade-block" style="margin-top:18px"></div>'; fuelleGericht(S.aktuell.id); }
    });
    $('#merk').addEventListener('click', (e) => {
      const b = e.target.closest('[data-weg]'); if (!b) return;
      S.merk = S.merk.filter((x) => x !== b.dataset.weg); sp.schreiben('merkliste', S.merk); merkZahl(); zeigeMerk();
      meldung('Von der Merkliste genommen');
    });
    $('#aktion-merken').addEventListener('click', () => { if (S.aktuell) merkUmschalten(S.aktuell.id); });
    $('#aktion-kochen').addEventListener('click', () => {
      const a = S.aktuell; if (!a) return;
      if (!a.d) { meldung('Rezept lädt noch …'); return; }
      K.gepusht = true; location.hash = '#/g/' + a.id + '/kochen';
    });

    $('#kochen-zu').addEventListener('click', kochenSchliessen);
    $('#kochen-weiter').addEventListener('click', kochenWeiter);
    $('#kochen-zurueck').addEventListener('click', kochenZurueck);
    $('#wach').addEventListener('click', wachInfo);
    const zutatenSchalter = (auf) => { $('#kochen-zutaten').hidden = !auf; $('#kochen-zutaten-knopf').setAttribute('aria-expanded', String(auf)); };
    $('#kochen-zutaten-knopf').addEventListener('click', () => zutatenSchalter($('#kochen-zutaten').hidden));
    $('#kochen-zutaten-zu').addEventListener('click', () => zutatenSchalter(false));
    $('#kochen-timer').addEventListener('click', (e) => {
      const b = e.target.closest('[data-timer]'); if (!b) return;
      if (b.dataset.timer === 'stopp') timerStopp(); else timerStart(+b.dataset.timer);
    });
    $('#timer-pille').addEventListener('click', () => {
      if (T.klingelt) { timerStopp(); return; }
      if (T.gid) { K.gepusht = true; location.hash = '#/g/' + T.gid + '/kochen'; }
    });
    // Wischen im Kochmodus
    let start = null;
    const buehne = $('#kochen-buehne');
    buehne.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY }; });
    buehne.addEventListener('pointerup', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y; start = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx < 0) kochenWeiter(); else kochenZurueck(); }
    });
    buehne.addEventListener('pointercancel', () => { start = null; });

    document.addEventListener('keydown', (e) => {
      if (K.offen) {
        if (e.key === 'Escape') { if (!$('#kochen-zutaten').hidden) zutatenSchalter(false); else kochenSchliessen(); }
        else if (e.key === 'ArrowRight') kochenWeiter();
        else if (e.key === 'ArrowLeft') kochenZurueck();
      } else if (!$('#zufall').hidden && e.key === 'Escape') zufallZu();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (K.offen && (!K.lock || K.lock.released)) wachHalten();
        timerTick();
      }
    });
    window.addEventListener('hashchange', () => { zufallZu(); route(); });
    let tick = false;
    window.addEventListener('scroll', () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => { tick = false; $('#kopf').classList.toggle('mit-linie', window.scrollY > 4); });
    }, { passive: true });
    const netz = () => { $('#offline').hidden = navigator.onLine !== false; };
    window.addEventListener('online', netz); window.addEventListener('offline', netz); netz();
  }

  async function los() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    verdrahten();
    merkZahl();
    try {
      await ladeIndex();
    } catch (e) {
      $('#start-inhalt').innerHTML = `<div class="fehler-box"><p><b>Die Länderliste konnte nicht geladen werden.</b></p><p>Bitte Verbindung prüfen.</p><button type="button" class="knopf erst" onclick="location.reload()">Neu laden</button></div>`;
      return;
    }
    const gerichte = S.gerichte.length;
    $('#zahlen').textContent = `${S.laender.length} Länder · ${gerichte} Gerichte · 6 Kontinente`;
    merkZahl();
    renderChips();
    zeigeStartInhalt();
    fuss();
    route();
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      const anmelden = () => navigator.serviceWorker.register('sw.js').catch(() => {});
      if (document.readyState === 'complete') anmelden(); else window.addEventListener('load', anmelden);
    }
  }
  los();
})();
