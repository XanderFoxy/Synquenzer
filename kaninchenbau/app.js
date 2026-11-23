// Kaninchenbau 0.2 – Start: Seiten zeigen, Tipps verteilen, hell/dunkel, offline. Alles bleibt auf dem Gerät (speicher.js).
// Teile: seiten.js („Dein Wesen“: Runden, Antworten, Karte), lernen.js (Lernen-Teil aus 0.1), auswertung.js (Rechnung), wesen.js (Fragen).
import { VERSION, K, SEITEN, TATEN, $, IC, meldung, konfetti, sichern, lg } from './kern.js';
import * as speicher from './speicher.js';
import { moehrenJetzt, meine, nachZeigen } from './lernen.js';
import { vorRoute } from './seiten.js';
import { prozent } from './auswertung.js';

// ---------- Darstellung ----------
K.sperre = false; K.letzteRoute = '';
const scrollJe = new Map();
function zeige() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'start';
  const [name, ...arg] = h.split('/');
  vorRoute(name);
  const v = (SEITEN[name] || SEITEN.start)(...arg);
  if (v.umleiten) { location.replace('#' + v.umleiten); return; }
  const main = $('#inhalt'), gleich = h === K.letzteRoute;
  if (K.letzteRoute) scrollJe.set(K.letzteRoute, main.scrollTop);
  main.innerHTML = v.html;
  for (const el of main.querySelectorAll('[data-w]')) el.style.width = el.dataset.w + '%';
  for (const el of main.querySelectorAll('[data-l]')) el.style.left = el.dataset.l + '%';
  $('#titel').textContent = v.titel; document.title = v.titel === 'Kaninchenbau' ? 'Kaninchenbau' : `${v.titel} – Kaninchenbau`;
  const zb = $('#zurueck');
  if (v.zurueck) { zb.hidden = false; zb.setAttribute('href', '#' + v.zurueck); } else zb.hidden = true;
  for (const a of document.querySelectorAll('#leiste a')) { if (a.dataset.bereich === v.bereich) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
  kopfZahl(v.bereich);
  if (gleich && v.halten) main.scrollTop = scrollJe.get(h) || 0; else main.scrollTop = 0;
  if (!gleich) main.focus({ preventScroll: true });
  if (v.fokus) $(v.fokus, main)?.focus({ preventScroll: true });
  K.letzteRoute = h; K.sperre = false;
  v.nach?.();
  nachZeigen(main);
  if (v.konfetti) konfetti();
}
K.zeige = zeige;
// Oben rechts: im Lernen-Teil die Möhren, sonst wie viel schon ausgewertet ist
function kopfZahl(bereich) {
  const el = $('#moehren');
  if (bereich === 'gaenge') {
    const m = moehrenJetzt();
    el.innerHTML = meine().length || m ? `${IC.moehre}<span>${m}</span>` : '';
    el.setAttribute('aria-label', `${m} Möhren`); el.className = 'moehren';
  } else {
    const p = prozent(lg().gesamt);
    el.innerHTML = `<span>${p}%</span>`; el.setAttribute('aria-label', `${p} Prozent ausgewertet`); el.className = 'moehren kopf-prozent';
  }
}

function thema() {
  const r = document.documentElement, t = K.Z.thema;
  if (t === 'hell') r.dataset.theme = 'light'; else if (t === 'dunkel') r.dataset.theme = 'dark'; else delete r.dataset.theme;
  const dunkel = t === 'dunkel' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  for (const m of document.querySelectorAll('meta[name=theme-color]')) m.setAttribute('content', dunkel ? '#14130f' : '#f6f3ec');
}
K.thema = thema;
TATEN.thema = (b) => { K.Z.thema = b.dataset.thema; sichern(); thema(); zeige(); };

// ---------- Tipps ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-tat]'); if (!el || el.disabled) return;
  const fn = TATEN[el.dataset.tat]; if (!fn) return;
  if (el.tagName === 'BUTTON') e.preventDefault();
  fn(el, e);
  if (el.tagName === 'A' && el.getAttribute('href') === location.hash) zeige();
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault(); TATEN['f:' + f.dataset.form]?.(f, e);
});
window.addEventListener('hashchange', zeige);
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', thema);
// Beim Verlassen sofort auch die Sicherheitskopie schreiben
addEventListener('pagehide', () => speicher.sicherJetzt(K.Z));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') speicher.sicherJetzt(K.Z); });

// ---------- Offline (Service Worker) ----------
let neuLaden = false;
if ('serviceWorker' in navigator && !new URLSearchParams(location.search).has('nosw')) {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    const bereit = () => meldung('Neue Fassung bereit.', 'Jetzt laden', () => { neuLaden = true; reg.waiting?.postMessage('jetzt'); }, 0);
    if (reg.waiting && navigator.serviceWorker.controller) bereit();
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) bereit(); });
    });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (neuLaden) { neuLaden = false; location.reload(); } });
}

// Für Tests und Fehlersuche (liest nur)
window.__kb = { version: VERSION, zustand: () => JSON.parse(JSON.stringify(K.Z)), lage: () => JSON.parse(JSON.stringify(lg())), quelle: () => K.quelle };

thema();
zeige();

// ---------- Übernahme alter Daten / Sicherheitskopie ----------
// 0.2.1: Beim Start wird IMMER zuerst die IndexedDB-Kopie gelesen, bevor irgendetwas sie überschreiben darf.
//  - v2 fehlt, 0.1-Daten liegen noch da: erst die Kopie (das sind die 0.2-Antworten), nur ohne Kopie die 0.1-Daten übernehmen.
//  - v2 fehlt ganz: Kopie zurückholen (wie bisher).
//  - v2 da, aber älter als die Kopie (Speichern im Browser schlug fehl, z. B. Speicher voll): die neuere Kopie nehmen.
const ver0 = K.ver;
let gewarnt = false;
const kopie = speicher.idbLaden();
speicher.torSetzen(kopie);
speicher.dauerhaft();
function zusammen(z) {                    // Antworten, die in den ersten Millisekunden schon gegeben wurden, gehen nicht verloren
  for (const [id, x] of Object.entries(K.Z.wesen.antw)) { const y = z.wesen.antw[id]; if (!y || x.t > y.t) z.wesen.antw[id] = x; }
  return z;
}
function zurueckAusKopie(z, text) {
  K.Z = K.ver === ver0 ? z : zusammen(z); K.quelle = 'idb';
  gewarnt = true; sichern(); thema(); zeige();          // die Warnung steckt dann schon in dieser Meldung
  meldung(speicher.speicherOk() ? text : text + ' Der Browser-Speicher ist aber voll – sichere sie bitte auch als Datei (Mehr).', null, null, 7000);
}
kopie.then((z) => {
  if (K.geloescht) return;
  const hat = speicher.hatInhalt(z);
  if (K.quelle === 'v1') {
    if (hat) { zurueckAusKopie(z, 'Deine Antworten sind aus der Sicherheitskopie zurück.'); return; }
    sichern();
    if (speicher.speicherOk()) meldung('Deine Daten aus Fassung 0.1 sind übernommen.');
  } else if (K.quelle === 'leer') {
    if (hat) zurueckAusKopie(z, 'Deine Antworten sind aus der Sicherheitskopie zurück.');
  } else if (K.quelle === 'v2') {
    if (hat && K.ver === ver0 && (z.stand || 0) > (K.Z.stand || 0) + 1000) zurueckAusKopie(z, 'Neuere Antworten aus der Sicherheitskopie geladen.');
  }
  speicherWarnung();
});

// Speichern schlägt fehl (privates Fenster, Speicher des Ursprungs voll): sofort sichtbar sagen, nicht erst unter „Mehr“
function speicherWarnung() {
  if (gewarnt || speicher.speicherOk()) return;
  gewarnt = true;
  meldung(speicher.kopieOk() ? 'Speichern im Browser klappt gerade nicht. Deine Antworten liegen in der Sicherheitskopie – sichere sie bitte auch als Datei.'
    : 'Speichern klappt auf diesem Gerät gerade nicht. Sichere deine Antworten bitte als Datei.', 'Als Datei', () => TATEN['w-export']?.(), 9000);
}
K.speicherWarnung = speicherWarnung;
