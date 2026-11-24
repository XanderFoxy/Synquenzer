// Wie ich ticke – Kern: Ereignisse, Speicher (nur mit Einwilligung), Navigation ohne Neuladen, Modul-Lader, Service Worker.
// Vertrag für Module: ARCH.md. Nichts wird gesendet: kein fetch zu fremden Hosts, keine Analyse, CSP connect-src 'self'.
import * as ui from './ui.js';
import { MODULE } from './module/liste.js';
import * as seiten from './seiten.js';
import { mass } from './mass.js';
import * as WEG from './weg.js';

export const VERSION = '0.2.1';
export const FORMAT = 1;                      // Format der gespeicherten Daten (ARCH.md §3); höher → MIGRATIONEN
const P = 'ticke.v1.';                        // einziger Präfix in localStorage (Ursprung teilen sich alle Synquenzer-Apps!)
const TEST = /[?&]test=1/.test(location.search);
const klon = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const jetzt = () => new Date().toISOString();

// ---------- Ereignisse ----------
const bus = new EventTarget();
function on(name, fn) { const h = (e) => { try { fn(e.detail); } catch (f) { console.error(f); } }; bus.addEventListener(name, h); return () => bus.removeEventListener(name, h); }
function emit(name, detail = {}) { bus.dispatchEvent(new CustomEvent(name, { detail })); }

// ---------- Speicher ----------
// MEM hält alles (Schlüssel ohne Präfix): 'kern' {format, einwilligung, einst}, 'ergebnisse' {schluessel: Eintrag[]}, 'm.<modul>' {…}.
// Ohne Einwilligung bleibt alles nur im Arbeitsspeicher (weg beim Schließen). Mit Einwilligung wird jede Änderung sofort geschrieben.
const MEM = new Map();
let EINW = false;
const SCHEMA = {};                            // modul → schema (bekannt, sobald das Modul geladen ist)
const VERLAUF_MAX = 30;
const STD_EINST = { alter: null, schrift: 1, einstieg: false };
const MIGRATIONEN = {                         // FORMAT n → Funktion(alles) für den Schritt von n-1 nach n. Noch keine.
};
function store() { try { return window.localStorage; } catch { return null; } }
function eigeneSchluessel() { const s = store(), k = []; if (!s) return k; try { for (let i = 0; i < s.length; i++) { const n = s.key(i); if (n && n.startsWith(P)) k.push(n); } } catch {} return k; }
function kernDaten() { if (!MEM.has('kern')) MEM.set('kern', { format: FORMAT, einwilligung: { an: false, zeit: null }, einst: { ...STD_EINST } }); return MEM.get('kern'); }
function schreibeDurch(k) {
  if (!EINW) return true; const s = store(); if (!s) return false;
  try { if (MEM.has(k)) s.setItem(P + k, JSON.stringify(MEM.get(k))); else s.removeItem(P + k); return true; }
  catch { ui.meldung('Speichern ging nicht (Speicher voll oder gesperrt). Sichere deine Daten als Datei.', 5000); return false; }
}
function migriere(alles) {   // alles: {schluessel ohne Präfix: wert}; gibt migrierte Daten zurück
  let f = (alles.kern && alles.kern.format) || 1;
  while (f < FORMAT) { f++; if (MIGRATIONEN[f]) alles = MIGRATIONEN[f](alles) || alles; if (alles.kern) alles.kern.format = f; }
  return alles;
}
function ladeGespeichert() {
  const s = store(); if (!s) return;
  try {
    const kern = JSON.parse(s.getItem(P + 'kern') || 'null');
    if (!kern || !kern.einwilligung || !kern.einwilligung.an) return;   // ohne Einwilligung wird nichts gelesen
    let alles = {};
    for (const n of eigeneSchluessel()) { try { alles[n.slice(P.length)] = JSON.parse(s.getItem(n)); } catch {} }
    const vorher = (alles.kern && alles.kern.format) || 1;
    alles = migriere(alles);
    for (const [k, v] of Object.entries(alles)) MEM.set(k, v);
    EINW = true;
    if (vorher !== FORMAT) for (const k of MEM.keys()) schreibeDurch(k);
  } catch (e) { console.warn('Speicher nicht lesbar', e); }
}

const speicher = {
  einwilligung: () => EINW,
  // an=true: ab jetzt alles auf diesem Gerät merken (schreibt auch, was bisher nur im Arbeitsspeicher war).
  // an=false: gespeicherte Kopie auf dem Gerät löschen; diese Sitzung behält ihre Daten im Arbeitsspeicher.
  setzeEinwilligung(an) {
    const k = kernDaten();
    if (an) {
      EINW = true; k.einwilligung = { an: true, zeit: jetzt() }; k.format = FORMAT;
      for (const key of MEM.keys()) schreibeDurch(key);
      try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
    } else {
      k.einwilligung = { an: false, zeit: jetzt() }; EINW = false;
      const s = store(); if (s) for (const n of eigeneSchluessel()) { try { s.removeItem(n); } catch {} }
    }
    emit('einwilligung', { an: !!an });
  },
  // Modul-eigene Daten (Zwischenstände, Fortschritt). wert === undefined löscht den Schlüssel.
  lies(modul, schluessel, std = null) { const m = MEM.get('m.' + modul); return m && schluessel in m ? klon(m[schluessel]) : std; },
  schreib(modul, schluessel, wert) {
    const k = 'm.' + modul, m = { ...(MEM.get(k) || {}) };
    if (wert === undefined) delete m[schluessel]; else m[schluessel] = klon(wert);
    if (SCHEMA[modul]) m._schema = SCHEMA[modul];
    MEM.set(k, m); schreibeDurch(k); emit('daten', { modul, schluessel });
  },
  modulDaten: (modul) => klon(MEM.get('m.' + modul) || {}),
  loescheModul(modul) { MEM.delete('m.' + modul); schreibeDurch('m.' + modul); emit('daten', { modul, schluessel: null }); },
  // Ergebnisse: Schlüssel 'modul' oder 'modul.teil'. Jeder Eintrag ist ein Objekt mit mindestens {schema}; der Kern ergänzt zeit, version.
  ergebnis(schluessel) { const v = (MEM.get('ergebnisse') || {})[schluessel]; return v && v.length ? klon(v[v.length - 1]) : null; },
  verlauf: (schluessel) => klon(((MEM.get('ergebnisse') || {})[schluessel]) || []),
  ergebnisse() { const e = MEM.get('ergebnisse') || {}, r = {}; for (const [k, v] of Object.entries(e)) if (v.length) r[k] = klon(v[v.length - 1]); return r; },
  setzeErgebnis(schluessel, daten, { ersetzen = false } = {}) {
    if (!/^[a-z0-9]+(\.[a-z0-9-]+)?$/.test(schluessel)) throw new Error('Ergebnis-Schlüssel ungültig: ' + schluessel);
    const eintrag = { schema: 1, ...klon(daten), zeit: (daten && daten.zeit) || jetzt(), version: VERSION };
    const alle = { ...(MEM.get('ergebnisse') || {}) }; const liste = [...(alle[schluessel] || [])];
    if (ersetzen && liste.length) liste[liste.length - 1] = eintrag; else liste.push(eintrag);
    while (liste.length > VERLAUF_MAX) liste.shift();
    alle[schluessel] = liste; MEM.set('ergebnisse', alle); schreibeDurch('ergebnisse');
    emit('ergebnis', { schluessel, ergebnis: klon(eintrag) });
    return klon(eintrag);
  },
  loescheErgebnis(schluessel) { const alle = { ...(MEM.get('ergebnisse') || {}) }; delete alle[schluessel]; MEM.set('ergebnisse', alle); schreibeDurch('ergebnisse'); emit('ergebnis', { schluessel, ergebnis: null }); },
  // Export: alles, was diese App weiß (auch ohne Einwilligung: der aktuelle Arbeitsspeicher).
  export() { const daten = {}; for (const [k, v] of MEM) daten[P + k] = klon(v); return { app: 'wie-ich-ticke', format: FORMAT, version: VERSION, erstellt: jetzt(), daten }; },
  import(obj) {
    if (!obj || obj.app !== 'wie-ich-ticke' || typeof obj.daten !== 'object' || !(obj.format >= 1)) throw new Error('Das ist keine Sicherung von „Wie ich ticke“.');
    if (obj.format > FORMAT) throw new Error('Diese Sicherung ist von einer neueren Fassung. Bitte erst die App aktualisieren.');
    let alles = {}; for (const [k, v] of Object.entries(obj.daten)) if (k.startsWith(P)) alles[k.slice(P.length)] = v;
    alles = migriere(alles);
    const einwVorher = EINW; MEM.clear(); for (const [k, v] of Object.entries(alles)) MEM.set(k, v);
    const kd = kernDaten(); kd.einwilligung = { an: einwVorher, zeit: jetzt() }; kd.format = FORMAT;
    if (EINW) { const s = store(); if (s) for (const n of eigeneSchluessel()) { try { s.removeItem(n); } catch {} } for (const k of MEM.keys()) schreibeDurch(k); }
    wendeEinstAn(); emit('importiert', {}); emit('ergebnis', { schluessel: null, ergebnis: null });
  },
  // Löscht ALLES dieser App: Arbeitsspeicher, localStorage 'ticke.*', IndexedDB 'ticke*', Caches 'ticke-*' außer der Programm-Schale.
  async allesLoeschen() {
    MEM.clear(); EINW = false;
    const s = store(); if (s) for (const n of eigeneSchluessel()) { try { s.removeItem(n); } catch {} }
    try { if (indexedDB.databases) for (const d of await indexedDB.databases()) if (d.name && d.name.startsWith('ticke')) indexedDB.deleteDatabase(d.name); } catch {}
    try { if (self.caches) for (const n of await caches.keys()) if (n.startsWith('ticke-') && !n.startsWith('ticke-schale-')) await caches.delete(n); } catch {}
    wendeEinstAn(); emit('geloescht', {});
  },
  groesse() { let b = 0; for (const [k, v] of MEM) b += (P + k).length + JSON.stringify(v).length; return b; },
  anzahl() { const e = MEM.get('ergebnisse') || {}; return Object.values(e).reduce((s, l) => s + l.length, 0); }
};

// ---------- Einstellungen ----------
function einst() { return { ...STD_EINST, ...(kernDaten().einst || {}) }; }
function setzeEinst(teil) { const k = kernDaten(); k.einst = { ...einst(), ...teil }; schreibeDurch('kern'); wendeEinstAn(); emit('einst', klon(k.einst)); return klon(k.einst); }
function wendeEinstAn() { const e = einst(), s = Number(e.schrift) || 1; document.documentElement.style.setProperty('--schrift', String(Math.max(0.9, Math.min(1.5, s)))); ui.setzeAlter(e.alter); }

// ---------- Rechen-Hilfen für Bänder: mass.js (ohne DOM, auch in Node testbar) ----------

// ---------- Navigation ----------
// Sechs Reiter (bei 428 px lesbar, je ≥ 44 px): „Profil“ und „Was passt zu mir“ teilen sich einen Reiter mit Unterreitern (UNTER).
export const NAV = [['start', 'Start'], ['muster', 'Muster'], ['fragen', 'Fragen'], ['profil', 'Profil'], ['training', 'Training'], ['text', 'Text']];
const NAV_ZU = { los: 'fragen', spiel: 'fragen', passt: 'profil' };          // Seiten, die zu einem anderen Reiter gehören
const UNTER = { profil: [['profil', 'Profil'], ['passt', 'Was passt zu mir']] }; // Reiter → Unterreiter (oben unter dem Kopf)
const TITEL = { start: 'Wie ich ticke', einstieg: 'Für mich', los: 'Start-Fragebogen', fragen: 'Fragen', profil: 'Profil', passt: 'Was passt zu mir', training: 'Training', text: 'Text-Spiegel', einstellungen: 'Einstellungen', muster: 'Dein Muster', antworten: 'Deine Antworten', spiel: 'Entweder – oder', bausteine: 'Bausteine' };
const KERN_ROUTEN = ['start', 'einstieg', 'los', 'fragen', 'einstellungen', 'antworten', 'bausteine'];
function leseRoute(hash = location.hash) {
  let h = hash.replace(/^#/, ''); try { h = decodeURIComponent(h); } catch {}
  const [p, q = ''] = h.split('?');
  const pfad = p.split('/').filter(Boolean); if (!pfad.length) pfad.push('start');
  return { hash: pfad.join('/') + (q ? '?' + q : ''), pfad, param: Object.fromEntries(new URLSearchParams(q)) };
}
function besitzer(pfad) {
  const weg = pfad.join('/'); let best = null, len = -1;
  for (const m of MODULE) for (const r of m.routen || []) if ((weg === r || weg.startsWith(r + '/')) && r.length > len) { best = m.id; len = r.length; }
  if (best) return best;
  return KERN_ROUTEN.includes(pfad[0]) ? 'kern' : null;
}
function geh(route, { ersetzen = false } = {}) {
  const h = '#' + String(route).replace(/^#/, '');
  if (ersetzen) { history.replaceState(null, '', h); zeige(); } else if (location.hash === h) zeige(); else location.hash = h;
}
const besucht = [];
let aufraeumen = null, nr = 0, zurueckZiel = null;
function zurueck() {
  const r = leseRoute(); const ziel = zurueckZiel || (r.pfad.length > 1 ? r.pfad.slice(0, -1).join('/') : 'start');
  if (besucht.length > 1 && besucht[besucht.length - 2] === ziel) history.back(); else geh(ziel);
}
async function zeige() {
  const r = leseRoute(), meinNr = ++nr, el = document.getElementById('inhalt');
  if (besucht[besucht.length - 1] !== r.hash) { if (besucht[besucht.length - 2] === r.hash) besucht.pop(); else besucht.push(r.hash); if (besucht.length > 50) besucht.shift(); }
  if (typeof aufraeumen === 'function') { try { aufraeumen(); } catch (e) { console.error(e); } }
  aufraeumen = null; zurueckZiel = null;
  const top = r.pfad[0], wer = besitzer(r.pfad);
  wegLeiste(r);
  const navTop = NAV_ZU[top] || top;   // Start-Fragebogen und Entweder – oder gehören zu „Fragen“, „Was passt“ zu „Profil“
  document.querySelectorAll('#leiste a').forEach((a) => { if (a.dataset.r === navTop) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const zg = document.getElementById('zu-einst'); if (zg) { if (top === 'einstellungen') zg.setAttribute('aria-current', 'page'); else zg.removeAttribute('aria-current'); }
  unterreiter(navTop, top);
  const ist = (NAV.some(([id]) => id === top) || (UNTER[navTop] || []).some(([id]) => id === top)) && r.pfad.length === 1;
  document.getElementById('zurueck').hidden = ist;
  setzeTitel(TITEL[top] || 'Wie ich ticke');
  const ctx = {
    el, pfad: r.pfad, param: r.param, route: r.hash, kern,
    titel: setzeTitel, zurueckZu: (route) => { zurueckZiel = route; }, aktuell: () => meinNr === nr
  };
  try {
    if (wer === 'kern') aufraeumen = seiten.zeige(ctx);
    else if (wer) {
      const t = setTimeout(() => { if (meinNr === nr) el.innerHTML = '<p class="leise lade">Lädt …</p>'; }, 150);
      const m = await modul(wer); clearTimeout(t);
      if (meinNr !== nr) return;
      el.innerHTML = '';
      aufraeumen = await m.ansicht(ctx);
    } else { geh('start', { ersetzen: true }); return; }
  } catch (e) {
    console.error(e); if (meinNr !== nr) return;
    el.innerHTML = `<h2>Das ging gerade nicht</h2><p>Dieser Teil konnte nicht geladen werden. Bist du offline und öffnest ihn zum ersten Mal?</p><button class="knopf haupt" type="button" id="nochmal">Nochmal versuchen</button>`;
    document.getElementById('nochmal').onclick = () => zeige();
  }
  if (meinNr !== nr) return;
  el.scrollTop = 0;
  wegNach(r);
  const h = el.querySelector('h2'); if (h && !el.contains(document.activeElement)) { if (!h.hasAttribute('tabindex')) h.tabIndex = -1; try { h.focus({ preventScroll: true }); } catch {} }
  emit('ansicht', { route: r.hash, pfad: r.pfad, param: r.param, besitzer: wer });
}
// Unterreiter (z. B. Profil | Was passt zu mir): eigene Zeile unter dem Kopf, damit Modul-Ansichten sie nicht überschreiben.
function unterreiter(navTop, top) {
  const u = document.getElementById('unterreiter'); if (!u) return;
  const L = UNTER[navTop];
  if (!L) { if (!u.hidden) { u.hidden = true; u.innerHTML = ''; u.dataset.fuer = ''; } return; }
  if (u.dataset.fuer !== navTop) { u.innerHTML = `<div class="unter-innen">${L.map(([id, n]) => `<a href="#${id}" data-r="${id}">${ui.esc(n)}</a>`).join('')}</div>`; u.dataset.fuer = navTop; }
  u.querySelectorAll('a').forEach((a) => { if (a.dataset.r === top) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  u.hidden = false;
}
function setzeTitel(t) { document.getElementById('titel').textContent = t; document.title = t === 'Wie ich ticke' ? t : t + ' – Wie ich ticke'; }

// ---------- Dein Weg (weg.js): Leiste „Als Nächstes … Weiter“ unter dem Inhalt ----------
const weg = {
  STUFEN: WEG.STUFEN, BEREICH_NAME: WEG.BEREICH_NAME,
  ziel: (id, W = WEG.status(kern)) => WEG.ziel(id, W.st, W.vt),
  status: () => WEG.status(kern),
  start: () => WEG.startStand(kern),
  beginneStart: () => WEG.beginneStart(kern),
  imStart: () => WEG.imStart(kern),
  // Module rufen das am Ende (und bei „Pause“) eines Start-Teils: läuft der Start-Fragebogen, geht es zurück zu #los.
  nachBogen: () => (WEG.startLaeuft(kern) ? 'los' : null),
  auslassen: (id) => WEG.auslassen(kern, id),
  zuruecknehmen: (id) => WEG.zuruecknehmen(kern, id),
  leiste: (r = leseRoute()) => WEG.leiste(kern, r)
};
function wegLeiste(r = leseRoute()) {
  const d = document.getElementById('weg-leiste'); if (!d) return;
  let L = null; try { L = WEG.leiste(kern, r); } catch (e) { console.error(e); }
  document.body.classList.toggle('weg-an', !!L);
  if (!L) { d.hidden = true; d.innerHTML = ''; return; }
  const frei = L.hier.frei && L.hierStatus === 'offen' ? ' (freiwillig)' : '';
  d.innerHTML = `<a class="weg-wo" href="#start"><small>Dein Weg · Schritt ${L.hier.nr} von ${L.gesamt}${ui.esc(frei)}</small><span id="weg-als">Als Nächstes: <b>${ui.esc(L.ziel.knopf)}</b></span></a>
    <a class="knopf haupt weg-weiter" href="#${ui.esc(L.ziel.route)}" aria-describedby="weg-als"${L.aus ? ` data-weg-aus="${ui.esc(L.aus)}"` : ''}>Weiter${ui.sym('weiter')}</a>`;
  d.hidden = false;
}
function wegNach(r = leseRoute()) {
  let neu = null; try { neu = WEG.nachfuehren(kern, r.pfad); } catch (e) { console.error(e); }
  wegLeiste(r);
  if (neu === 'geschafft') ui.meldung('Du bist den Weg einmal ganz gegangen. Ab hier springst du frei durch dein Muster.', 4500);
}

// ---------- Module ----------
const GELADEN = new Map();
const EXPORTE = new Map();                    // id → alle Exporte der Modul-Datei (antwortListe, antwortSetzen, muster, aeste …)
function modul(id) {
  if (!GELADEN.has(id)) {
    const info = MODULE.find((m) => m.id === id);
    if (!info) return Promise.reject(new Error('Unbekanntes Modul: ' + id));
    const p = import(new URL(info.datei, import.meta.url).href).then((mod) => {
      const m = mod.default;
      if (!m || m.id !== id || typeof m.ansicht !== 'function') throw new Error('Modul ' + id + ' hält den Vertrag nicht ein (default {id, ansicht}).');
      EXPORTE.set(id, mod);
      if (m.schema) {
        SCHEMA[id] = m.schema;
        const d = MEM.get('m.' + id);
        if (d && (d._schema || 1) < m.schema && typeof m.migriere === 'function') {
          const neu = m.migriere(klon(d), d._schema || 1) || d; neu._schema = m.schema; MEM.set('m.' + id, neu); schreibeDurch('m.' + id);
        }
      }
      if (typeof m.start === 'function') m.start(kern);
      emit('modul', { id });
      return m;
    }).catch((e) => { GELADEN.delete(id); throw e; });
    GELADEN.set(id, p);
  }
  return GELADEN.get(id);
}
// Lädt ein Modul wie modul(id) (Schema-Umzug und start() inklusive) und gibt alle benannten Exporte der Datei zurück.
function exporte(id) { return modul(id).then(() => EXPORTE.get(id)); }

// ---------- Quellen + Evidenz-Blatt ----------
let QP = null;
function quellen() {
  if (!QP) QP = Promise.all([import('./quellen.js'), ...MODULE.map((m) => import(new URL(m.quellen, import.meta.url).href).catch(() => ({ QUELLEN: {} })))])
    .then(([k, ...ms]) => {
      const alle = { ...k.QUELLEN }, nachModul = { kern: k.QUELLEN };
      ms.forEach((x, i) => {
        const q = x.QUELLEN || {}; nachModul[MODULE[i].id] = q;
        for (const [id, v] of Object.entries(q)) { if (!alle[id]) alle[id] = v; else if (TEST && alle[id].text !== v.text) console.warn('Quelle doppelt mit anderem Text:', id); }
      });
      return { alle, nachModul, STUFEN: k.STUFEN };
    }).catch((e) => { QP = null; throw e; });
  return QP;
}
function quelleHtml(id, q) {
  if (!q) return `<li>Quelle „${ui.esc(id)}“ fehlt noch.</li>`;
  const erkl = q.erklaerung || q.notiz;       // keine Links: Was in der Quelle steht, erklärt die App selbst
  return `<li><span class="quelle-text">${ui.esc(q.text)}</span>${erkl ? `<span class="quelle-erkl">${ui.esc(erkl)}</span>` : ''}</li>`;
}
async function zeigeBeleg(stufe, ids = []) {
  let Q; try { Q = await quellen(); } catch { Q = { alle: {}, STUFEN: {} }; }
  const s = (Q.STUFEN || {})[stufe] || { name: stufe, text: '' };
  await ui.blatt(`<p><span class="marke marke-${ui.esc(stufe)}" aria-hidden="true">${ui.esc(s.name)}</span> ${ui.esc(s.kurz || '')}</p><p>${ui.esc(s.text)}</p>
    ${ids.length ? `<h3>${ids.length > 1 ? 'Quellen' : 'Quelle'}</h3><ul class="quellen">${ids.map((id) => quelleHtml(id, Q.alle[id])).join('')}</ul>` : '<p class="leise">Für diese Aussage ist keine eigene Quelle hinterlegt.</p>'}
    <p class="klein"><a class="link" href="#einstellungen/quellen" data-w="quellen">Woher das Wissen kommt – alle Quellen</a></p>`, { titel: 'Woher kommt das?' }).then((w) => { if (w === 'quellen') geh('einstellungen/quellen'); });
}

// ---------- Einwilligung abfragen (Knopf „Auf diesem Gerät merken“) ----------
async function frageEinwilligung() {
  if (EINW) { ui.meldung('Wird schon auf diesem Gerät gemerkt.'); return true; }
  const w = await ui.blatt(`<p>Dann legt die App deine Antworten und Ergebnisse im Speicher dieses Browsers ab – <b>nur hier auf dem Gerät</b>, nichts geht ins Netz.</p>
    <p>Du kannst alles jederzeit als Datei sichern oder mit einem Knopf löschen (Einstellungen).</p>
    <p class="klein leise">Ohne Merken ist alles weg, sobald du die Seite neu lädst oder schließt (Safari lädt Seiten im Hintergrund manchmal von selbst neu). Tipp fürs iPhone: Leg die App auf den Home-Bildschirm – sonst kann Safari gespeicherte Daten nach einigen Tagen ohne Besuch löschen.</p>
    <div class="stapel"><button type="button" class="knopf haupt gross" data-w="ja">Ja, auf diesem Gerät merken</button><button type="button" class="knopf zweit" data-w="nein">Nein, nur für jetzt</button></div>`, { titel: 'Auf diesem Gerät merken?' });
  if (w === 'ja') { speicher.setzeEinwilligung(true); ui.meldung('Gemerkt – nur auf diesem Gerät.'); return true; }
  return false;
}

// ---------- Service Worker (offline) ----------
function zeigeNeueFassung(reg) {
  if (document.querySelector('.neu-fassung')) return;
  const d = document.createElement('div'); d.className = 'neu-fassung'; d.setAttribute('role', 'status');
  d.innerHTML = `<span>Neue Fassung bereit.</span><span class="neu-knoepfe"><button type="button" class="knopf haupt klein" data-neu="laden">Jetzt laden</button><button type="button" class="knopf-ico" data-neu="spaeter" aria-label="Später – Hinweis schließen">${ui.sym('schliessen')}</button></span>`;
  // Der Hinweis schiebt den Inhalt nach unten (verdeckt keine Frage) und lässt sich schließen; die neue Fassung kommt dann beim nächsten Start.
  d.querySelector('[data-neu=spaeter]').onclick = () => { d.remove(); document.body.classList.remove('neu-an'); };
  d.querySelector('[data-neu=laden]').onclick = async () => {
    if (!EINW && speicher.anzahl() > 0 && !(await ui.bestaetige({ titel: 'Neu laden?', text: 'Deine Antworten sind nicht auf dem Gerät gemerkt und gehen beim Neuladen verloren.', ja: 'Trotzdem neu laden' }))) return;
    if (reg.waiting) reg.waiting.postMessage('jetzt'); else location.reload();
  };
  document.body.append(d); document.body.classList.add('neu-an');
}
function starteSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  let neuGeladen = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (neuGeladen || !navigator.serviceWorker.controller) return; neuGeladen = true; if (wartetAufNeu) location.reload(); });
  let wartetAufNeu = false;
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    const pruefe = () => { if (reg.waiting && navigator.serviceWorker.controller) { wartetAufNeu = true; zeigeNeueFassung(reg); emit('neue-fassung', {}); } };
    pruefe();
    reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed') pruefe(); }); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
}
async function offlineBereit() {
  try { if (!self.caches) return false; const n = await caches.keys(); return n.some((k) => k === 'ticke-schale-' + VERSION); } catch { return false; }
}

// ---------- öffentliches Objekt ----------
export const kern = {
  VERSION, FORMAT, TEST, on, emit, geh, zurueck, route: () => leseRoute(), modul, exporte, module: MODULE,
  speicher, einst, setzeEinst, mass, ui, quellen, zeigeBeleg, frageEinwilligung, offlineBereit, weg
};

// ---------- Start ----------
function rahmen() {
  const SYM = { start: 'start', muster: 'muster', fragen: 'fragen', profil: 'profil', passt: 'passt', training: 'training', text: 'text' };
  document.getElementById('leiste').innerHTML = NAV.map(([id, n]) => `<a href="#${id}" data-r="${id}">${ui.sym(SYM[id])}<span>${n}</span></a>`).join('');
  document.getElementById('zurueck').addEventListener('click', zurueck);
  document.addEventListener('click', (e) => {
    const m = e.target.closest('[data-marke]'); if (m && !m.closest('dialog')) { e.preventDefault(); zeigeBeleg(m.dataset.marke, (m.dataset.quellen || '').split(',').filter(Boolean)); return; }
    const a = e.target.closest('[data-aktion=merken]'); if (a) { e.preventDefault(); frageEinwilligung(); return; }
    const w = e.target.closest('[data-weg-aus]'); if (w) WEG.auslassen(kern, w.dataset.wegAus);   // Link führt danach weiter
  });
  // Radiogruppen (Chips): Pfeiltasten bewegen die Auswahl (ARIA-Muster). Module mit eigenem Helfer rufen preventDefault → hier nichts.
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const t = e.target; if (!t.matches || !t.matches('[role=radio]')) return;
    const g = t.closest('[role=radiogroup]'); if (!g) return;
    const k = [...g.querySelectorAll('[role=radio]')].filter((x) => !x.disabled); const i = k.indexOf(t); if (i < 0) return;
    e.preventDefault();
    const z = k[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + k.length) % k.length];
    const sel = z.id ? '#' + CSS.escape(z.id) : [...z.attributes].filter((x) => x.name.startsWith('data-')).map((x) => `[${x.name}="${CSS.escape(x.value)}"]`).join('');
    z.click();
    requestAnimationFrame(() => { const n = (sel && document.querySelector(sel)) || z; if (n && n.isConnected) try { n.focus(); } catch {} });
  });
  ['ergebnis', 'einwilligung', 'geloescht', 'importiert', 'einst'].forEach((n) => on(n, () => wegLeiste()));
  window.addEventListener('hashchange', zeige);
}
function starte() {
  ladeGespeichert(); wendeEinstAn(); rahmen();
  if (TEST) window.__ticke = kern;
  zeige();
  // Service Worker erst nach dem Laden: Die Startseite kommt zuerst, der Offline-Vorrat (alle Dateien) danach im Hintergrund.
  if (document.readyState === 'complete') setTimeout(starteSW, 0); else window.addEventListener('load', () => setTimeout(starteSW, 0), { once: true });
  emit('bereit', { version: VERSION });
}
starte();
