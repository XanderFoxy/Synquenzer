// Wie ich ticke – „Deine Antworten“ (#antworten, #antworten/<modulid>): jede Antwort aus allen Teilen ansehen und ändern.
// Vertrag (benannte Exporte der Modul-Datei): antwortListe(k) → [{ id, gruppe, frage, art: 'wahl'|'text'|'zahl'|'zeit', wert, anzeige,
// optionen?: [{wert, text}], route?, vorher?: [{wert, anzeige, zeit}] }] und antwortSetzen(k, id, wert) (wert null = Antwort löschen;
// das Modul rechnet sein Ergebnis selbst neu und pflegt „vorher“). Ohne Export: Hinweis + Link in den Fragebogen.
// Wird von seiten.js erst beim Öffnen geladen; bekommt den Kern über ctx.kern (kein Import von kern.js → kein Kreis).
import { esc, sym, blatt, meldung, datum } from './ui.js';

const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
const offen = (a) => a.wert == null || a.wert === '';
const zielRoute = (m) => (m.fragen && m.fragen[0] && m.fragen[0].route) || (m.routen && m.routen[0]) || 'start';
const gueltig = (a) => a && a.id != null && typeof a.frage === 'string';
const vorherListe = (a) => (Array.isArray(a.vorher) ? a.vorher.filter(Boolean) : []).slice().sort((x, y) => String(y.zeit || '').localeCompare(String(x.zeit || ''))).slice(0, 5);
const ART = { wahl: 1, text: 1, zahl: 1, zeit: 1 };
const sel = (mid, id) => `.antw-zeile[data-modul="${CSS.escape(mid)}"][data-id="${CSS.escape(String(id))}"]`;

export function zeige(ctx, el) {
  const { kern } = ctx;
  const zielModul = ctx.pfad[1] || null;
  const S = new Map();                       // modul-id → { info, ns, liste (null = kein Export), fehler }
  let tot = false, suche = '', nurOffen = ctx.param.offen === '1', gesprungen = false, tSuche = 0;

  el.innerHTML = `<p class="lead">Hier steht alles, was du geantwortet hast. Tippe eine Antwort an, um sie zu ändern – dein Muster rechnet sofort neu. Es gibt kein Richtig oder Falsch.</p>
    <div class="antw-werkzeug">
      <label class="sr" for="antw-suche">In deinen Antworten suchen</label>
      <input id="antw-suche" class="feld" type="search" placeholder="Suchen …" autocomplete="off" enterkeyhint="search">
      <button type="button" class="chip" id="antw-offen" aria-pressed="${nurOffen}">Nur offene</button>
    </div>
    <p class="leise klein antw-stand" id="antw-stand" aria-live="polite"></p>
    <div class="antw-teile">${kern.module.map((m) => `<details class="karte antw-teil" id="a-${esc(m.id)}" data-teil="${esc(m.id)}">
      <summary><span class="antw-kopf"><b>${esc(m.name)}</b><small data-stand>lädt …</small></span></summary>
      <div class="antw-inhalt" data-inhalt><p class="leise klein">Lädt …</p></div></details>`).join('')}</div>`;

  const teil = (mid) => el.querySelector(`.antw-teil[data-teil="${CSS.escape(mid)}"]`);

  // ---------- Laden ----------
  async function exporteVon(m) {
    if (typeof kern.exporte === 'function') return kern.exporte(m.id);
    await kern.modul(m.id); return import(new URL(m.datei, import.meta.url).href);   // Rückfall für ältere Kerne
  }
  async function liste(s) {
    s.liste = null; s.fehler = null;
    if (!s.ns || typeof s.ns.antwortListe !== 'function') return;
    try { const l = await s.ns.antwortListe(kern); s.liste = Array.isArray(l) ? l.filter(gueltig) : []; }
    catch (e) { console.warn('antwortListe', s.info.id, e); s.fehler = e; }
  }
  async function lade(m) {
    const s = { info: m, ns: null, liste: null, fehler: null }; S.set(m.id, s);
    try { s.ns = await exporteVon(m); } catch (e) { s.fehler = e; }
    if (tot) return;
    await liste(s);
    if (tot) return;
    male(m.id);
    if (!gesprungen && zielModul === m.id) springe(m.id);
  }
  function springe(mid) {
    const t = teil(mid); if (!t) return;
    gesprungen = true; t.open = true;
    requestAnimationFrame(() => { if (tot || !t.isConnected) return; try { t.scrollIntoView({ block: 'start' }); } catch {} try { t.querySelector('summary').focus({ preventScroll: true }); } catch {} });
  }

  // ---------- Zeichnen ----------
  function zeile(mid, a) {
    const v = vorherListe(a)[0], o = offen(a);
    return `<li data-zeile data-text="${esc(norm(`${a.gruppe || ''} ${a.frage} ${a.anzeige || ''}`))}"${o ? ' data-offen' : ''}>
      <button type="button" class="zeile antw-zeile" data-modul="${esc(mid)}" data-id="${esc(String(a.id))}"><span class="antw-text"><span class="antw-frage">${esc(a.frage)}</span>${
        o ? '<small class="antw-wert offen">noch offen</small>' : `<small class="antw-wert">${esc(a.anzeige || String(a.wert))}</small>`}${
        v ? `<small class="antw-vorher">vorher: ${esc(v.anzeige || '–')}</small>` : ''}</span><span class="rechts">${sym('stift')}<span class="sr">${o ? 'beantworten' : 'ändern'}</span></span></button></li>`;
  }
  function male(mid) {
    const s = S.get(mid), t = teil(mid); if (!s || !t) return;
    const inhalt = t.querySelector('[data-inhalt]'), stand = t.querySelector('[data-stand]'), m = s.info, hin = zielRoute(m);
    const fb = m.fragen && m.fragen.length;
    if (s.liste === null) {
      if (s.fehler && !s.ns) {
        stand.textContent = 'gerade nicht geladen';
        inhalt.innerHTML = `<p>Dieser Teil konnte gerade nicht geladen werden. Bist du offline und öffnest ihn zum ersten Mal?</p><button type="button" class="knopf zweit klein" data-nochmal="${esc(mid)}">Nochmal versuchen</button>`;
      } else {
        stand.textContent = fb ? 'im Fragebogen änderbar' : 'direkt dort änderbar';
        inhalt.innerHTML = `<p>Antworten dieses Teils änderst du direkt ${fb ? 'im Fragebogen' : 'dort'}.</p><a class="knopf zweit klein" href="#${esc(hin)}">${esc(fb ? 'Zum Fragebogen' : 'Hin zu ' + m.name)}${sym('weiter')}</a>`;
      }
    } else if (!s.liste.length) {
      stand.textContent = 'noch nichts beantwortet';
      inhalt.innerHTML = `<p class="leise">Hier gibt es noch keine Antworten.</p><a class="knopf zweit klein" href="#${esc(hin)}">${esc(fb ? 'Zum Fragebogen' : 'Hin zu ' + m.name)}${sym('weiter')}</a>`;
    } else {
      const n = s.liste.length, o = s.liste.filter(offen).length;
      stand.textContent = o ? `${n - o} beantwortet · ${o} noch offen` : `${n} beantwortet`;
      const gruppen = new Map();
      for (const a of s.liste) { const g = String(a.gruppe || ''); if (!gruppen.has(g)) gruppen.set(g, []); gruppen.get(g).push(a); }
      inhalt.innerHTML = [...gruppen].map(([g, L]) => `<div class="antw-gruppe" data-gruppe>${g ? `<h4>${esc(g)}</h4>` : ''}<ul class="zeilen">${L.map((a) => zeile(mid, a)).join('')}</ul></div>`).join('')
        + '<p class="leise klein" data-leer hidden>Hier passt nichts zur Suche.</p>';
    }
    anwenden(!t.dataset.gezeichnet); t.dataset.gezeichnet = '1';
  }
  // Suche und „Nur offene“: Zeilen ein-/ausblenden (kein Neuzeichnen); aufklappen = passende Teile öffnen (nur bei neuer Suche/neuem Filter).
  function anwenden(aufklappen = false) {
    const q = norm(suche.trim()), aktiv = !!q || nurOffen; let sichtbar = 0;
    for (const t of el.querySelectorAll('.antw-teil')) {
      let n = 0; const zeilen = t.querySelectorAll('[data-zeile]');
      for (const li of zeilen) { const ok = (!nurOffen || li.hasAttribute('data-offen')) && (!q || li.dataset.text.includes(q)); li.hidden = !ok; if (ok) n++; }
      for (const g of t.querySelectorAll('[data-gruppe]')) g.hidden = !g.querySelector('[data-zeile]:not([hidden])');
      const leer = t.querySelector('[data-leer]'); if (leer) leer.hidden = !(aktiv && zeilen.length && !n);
      t.hidden = aktiv && !n;
      if (aufklappen && aktiv && n) t.open = true;
      sichtbar += n;
    }
    const st = el.querySelector('#antw-stand');
    if (st) st.textContent = !aktiv ? '' : sichtbar ? `${sichtbar} ${sichtbar === 1 ? 'Antwort passt' : 'Antworten passen'}${nurOffen ? ' (nur offene)' : ''}.` : (nurOffen && !q ? 'Keine offenen Fragen – alles beantwortet.' : 'Keine Antwort passt zu deiner Suche.');
  }

  // ---------- Ändern ----------
  async function bearbeiten(mid, id) {
    const s = S.get(mid); const a = s && s.liste && s.liste.find((x) => String(x.id) === id); if (!a) return;
    const opts = Array.isArray(a.optionen) && a.optionen.length ? a.optionen : null;
    const kannSetzen = !!(s.ns && typeof s.ns.antwortSetzen === 'function') && !(a.art === 'wahl' && !opts);   // Wahl ohne Optionen: nur im Fragebogen
    const art = opts ? 'wahl' : ART[a.art] ? a.art : 'text';
    const vorher = vorherListe(a), o = offen(a);
    let feld = null;
    const eingabe = !kannSetzen ? `<p>Diese Antwort änderst du direkt im Fragebogen.</p>`
      : art === 'wahl' ? `<div class="antworten" role="group" aria-label="Antwort wählen">${opts.map((x, i) => { const an = !o && String(x.wert) === String(a.wert);
          return `<button type="button" class="antwort" aria-pressed="${an}" data-w="opt-${i}"><span class="kreis" aria-hidden="true"></span><span>${esc(x.text)}</span>${an ? '<span class="sr"> (jetzige Antwort)</span>' : ''}</button>`; }).join('')}</div>`
      : art === 'text' ? `<label class="sr" for="antw-feld">Deine Antwort</label><textarea id="antw-feld" class="feld" rows="6">${esc(o ? '' : a.wert)}</textarea>`
      : `<label class="sr" for="antw-feld">Deine Antwort</label><input id="antw-feld" class="feld frage-feld" type="${art === 'zeit' ? 'time' : 'text'}"${art === 'zahl' ? ' inputmode="decimal"' : ''} value="${esc(o ? '' : a.wert)}">`;
    const html = `${a.gruppe ? `<p class="leise klein antw-blatt-gruppe">${esc(s.info.name)} › ${esc(a.gruppe)}</p>` : ''}<p class="antw-blatt-frage">${esc(a.frage)}</p>
      ${o ? '<p class="leise klein">Noch offen.</p>' : art === 'wahl' || !kannSetzen ? '' : `<p class="leise klein">Jetzt: ${esc(a.anzeige || String(a.wert))}</p>`}
      ${eingabe}
      <div class="reihe"><button type="button" class="knopf zweit" data-w="">${kannSetzen ? 'Abbrechen' : 'Schließen'}</button>${kannSetzen && art !== 'wahl' ? '<button type="button" class="knopf haupt" data-w="ok">Speichern</button>' : ''}</div>
      ${vorher.length && kannSetzen ? `<h3 class="klein antw-vorher-t">Vorher</h3><ul class="antw-vorher-liste">${vorher.map((v, i) => `<li><span>${esc(v.anzeige || '–')}${v.zeit ? `<small class="leise"> · ${esc(datum(v.zeit))}</small>` : ''}</span><button type="button" class="knopf zweit klein" data-w="vor-${i}" aria-label="${esc('Wieder nehmen: ' + (v.anzeige || ''))}">Wieder nehmen</button></li>`).join('')}</ul>` : ''}
      <p class="antw-blatt-links">${!o && kannSetzen ? '<button type="button" class="link" data-w="loeschen">Antwort löschen</button>' : ''}${a.route ? `<a class="link" href="#${esc(a.route)}" data-w="hin">Im Fragebogen ansehen</a>` : ''}</p>`;
    const w = await blatt(html, {
      titel: o ? 'Antwort geben' : 'Antwort ändern',
      binde: (d) => {
        feld = d.querySelector('#antw-feld');
        if (feld && feld.tagName === 'INPUT') feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); d.querySelector('[data-w=ok]')?.click(); } });
      }
    });
    if (w == null || tot) return;
    if (w === 'hin') { kern.geh(a.route); return; }
    let neu;
    const nr = (pre) => (w.startsWith(pre) ? Number(w.slice(pre.length)) : -1);
    if (w === 'loeschen') neu = null;
    else if (opts && opts[nr('opt-')]) neu = opts[nr('opt-')].wert;
    else if (vorher[nr('vor-')]) neu = vorher[nr('vor-')].wert;
    else if (w === 'ok') {
      const roh = feld ? feld.value : '';
      if (!String(roh).trim()) { meldung(o ? 'Nichts eingegeben.' : 'Leer gelassen – nichts geändert. Zum Löschen: „Antwort löschen“.', 4000); return; }
      if (art === 'zahl') { neu = Number(String(roh).replace(',', '.').trim()); if (!Number.isFinite(neu)) { meldung('Bitte eine Zahl eingeben.'); return; } }
      else neu = art === 'text' ? String(roh) : String(roh).trim();
    } else return;
    if (neu !== null && !o && String(neu) === String(a.wert)) { meldung('Unverändert.'); return; }
    try { await s.ns.antwortSetzen(kern, a.id, neu); }
    catch (e) { console.warn('antwortSetzen', mid, e); meldung('Das ging gerade nicht' + (e && e.message ? ': ' + e.message : '.'), 5000); return; }
    if (tot) return;
    await liste(s); if (tot) return;
    male(mid);
    meldung(neu === null ? 'Antwort gelöscht – dein Muster ist neu berechnet.' : 'Geändert – dein Muster ist neu berechnet.');
    const k = el.querySelector(sel(mid, id)); if (k) { try { k.focus({ preventScroll: true }); } catch {} }
  }

  // ---------- Ereignisse ----------
  const klick = (e) => {
    const z = e.target.closest('.antw-zeile'); if (z && el.contains(z)) { bearbeiten(z.dataset.modul, z.dataset.id); return; }
    const n = e.target.closest('[data-nochmal]'); if (n) { const m = kern.module.find((x) => x.id === n.dataset.nochmal); if (m) { teil(m.id).querySelector('[data-inhalt]').innerHTML = '<p class="leise klein">Lädt …</p>'; lade(m); } return; }
    const f = e.target.closest('#antw-offen'); if (f) { nurOffen = !nurOffen; f.setAttribute('aria-pressed', String(nurOffen)); anwenden(true); }
  };
  const tippen = (e) => { if (e.target.id !== 'antw-suche') return; clearTimeout(tSuche); tSuche = setTimeout(() => { if (tot) return; suche = e.target.value; anwenden(true); }, 120); };
  el.addEventListener('click', klick); el.addEventListener('input', tippen);
  const neuAlles = () => { if (!tot) for (const m of kern.module) lade(m); };
  const aus = [kern.on('importiert', neuAlles), kern.on('geloescht', neuAlles)];

  for (const m of kern.module) lade(m);    // alle Teile parallel; jeder Teil erscheint, sobald er da ist
  return () => { tot = true; clearTimeout(tSuche); el.removeEventListener('click', klick); el.removeEventListener('input', tippen); aus.forEach((f) => f()); };
}
