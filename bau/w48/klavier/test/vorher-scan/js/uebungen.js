// js/uebungen.js – Übungen: Bassschlüssel lesen, Akkord-Umkehrungen, Intervalle. Ohne Punkte, mit sanfter Rückmeldung.
import { tastatur } from './tastatur.js';
import { ton, klinge, audioKontext } from './wiedergabe.js';
import {
  STAMM, tonName, oktavName, midiAus, notenName, ortImSystem, systemPosition,
  rollenFarbe, akkordAusMidis, ROLLEN_NAME,
} from './akkorde.js';
import { intervall as ivBerechnen, langText, nachHalbtoenen } from './intervalle.js';

export const UEBUNGEN = [
  { id: 'lesen', titel: 'Noten lesen', text: 'Note im Bassschlüssel sehen – Taste finden' },
  { id: 'akkord', titel: 'Umkehrungen', text: 'Grundstellung oder Umkehrung? Dann greifen' },
  { id: 'intervall', titel: 'Intervalle', text: 'Abstand sehen, hören und auf der Tastatur finden' },
];
export const MERKSAETZE = {
  linien: { toene: 'G · H · D · F · A', satz: '„Geh Heim, Du Fauler Affe"' },
  raeume: { toene: 'A · C · E · G', satz: '„Alle Cowboys essen Gras"' },
};

const NS = 'http://www.w3.org/2000/svg';
const G = 14, UNTEN = 124; // Linienabstand, y der untersten Linie
const yVon = (p) => UNTEN - (p * G) / 2;
const ruhig = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const zufall = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ausPos = (p) => { const d = 18 + p; return { stamm: STAMM[((d % 7) + 7) % 7], vorz: 0, oktave: Math.floor(d / 7) }; };
const STUFEN_NAME = ['Prime', 'Sekunde', 'Terz', 'Quarte', 'Quinte', 'Sexte', 'Septime', 'Oktave'];

const ICON = {
  hoeren: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  weiter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  hilfe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/></svg>',
  namen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 10h18M3 14h18M3 18h18" stroke="currentColor" stroke-width="1.6"/><text x="12" y="13.5" font-size="9" font-weight="700" text-anchor="middle" fill="currentColor" font-family="system-ui">A</text></svg>',
};

const STIL = `
.ue{--ue-bg:#f6f7fb;--ue-karte:#ffffff;--ue-text:#1c2330;--ue-leise:#6b7280;--ue-linie:#2a3140;--ue-akzent:#5b5bd6;--ue-chip:#eef0f6;--ue-gut:#22a06b;--ue-hinweis:#b7791f;--ue-schatten:0 6px 24px rgba(20,30,60,.08);
 display:flex;flex-direction:column;gap:12px;color:var(--ue-text);font:16px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;max-width:760px;margin:0 auto;padding:0 16px 16px;box-sizing:border-box}
:where(.ue) *{box-sizing:border-box}
:where(.ue) button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ue-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border-radius:14px;background:var(--ue-chip)}
.ue-tab{min-height:44px;border-radius:11px;font-weight:600;font-size:15px;color:var(--ue-leise)!important;transition:background-color .2s ease,color .2s ease}
.ue-tab[aria-selected="true"]{background:var(--ue-karte);color:var(--ue-text)!important;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.ue-karte{background:var(--ue-karte);border-radius:20px;box-shadow:var(--ue-schatten);padding:14px 14px 12px;display:flex;flex-direction:column;gap:10px}
.ue-kopf{display:flex;align-items:center;gap:8px}
.ue-titel{margin:0;font-size:18px;font-weight:700;flex:1}
.ue-rund{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--ue-chip)}
.ue-rund svg{width:22px;height:22px}.ue-rund[aria-pressed="true"]{background:var(--ue-akzent);color:#fff!important}
.ue-stufen{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 -2px;padding:2px}
.ue-chip{flex:none;min-height:44px;padding:0 14px;border-radius:22px;background:var(--ue-chip);font-size:14px;font-weight:600;transition:background-color .2s ease}
.ue-chip[aria-pressed="true"]{background:var(--ue-akzent);color:#fff!important}
.ue-system{width:100%;height:auto;max-height:34vh;color:var(--ue-linie);display:block}
.ue-frage{margin:0;font-weight:600;text-align:center;font-size:17px}
.ue-antworten{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px}
.ue-antwort{min-height:48px;border-radius:14px;background:var(--ue-chip);font-weight:600;font-size:15px;padding:6px 8px;transition:transform .12s ease,background-color .2s ease}
.ue-antwort:active{transform:scale(.97)}
.ue-antwort.ist-richtig{background:color-mix(in srgb,var(--ue-gut) 22%,var(--ue-karte))}
.ue-antwort.ist-falsch{opacity:.55}
.ue-rueck{margin:0;min-height:1.4em;text-align:center;color:var(--ue-leise);font-size:15px}
.ue-rueck.gut{color:var(--ue-gut);font-weight:600}.ue-rueck.hinweis{color:var(--ue-hinweis)}
.ue-rueck.neu{animation:ue-ein .28s ease both}
.ue-erkl{margin:0;font-size:14px;color:var(--ue-leise);text-align:center}
.ue-leiste{display:flex;gap:8px;justify-content:center}
.ue-knopf{min-height:44px;padding:0 18px;border-radius:22px;background:var(--ue-chip);font-weight:600;display:inline-flex;align-items:center;gap:6px}
.ue-knopf svg{width:20px;height:20px}.ue-knopf.haupt{background:var(--ue-akzent);color:#fff!important}
.ue-hilfe{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));animation:ue-ein .25s ease both}
.ue-hilfe[hidden]{display:none}
.ue-merk{border-radius:14px;padding:10px 12px;background:var(--ue-chip)}
.ue-merk b{display:block;font-size:13px;color:var(--ue-leise);font-weight:600}
.ue-merk span{display:block;font-size:17px;font-weight:700;letter-spacing:.02em}
.ue-merk i{display:block;font-style:normal;font-size:14px}
.ue-legende{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;font-size:13px;color:var(--ue-leise)}
.ue-legende span{display:inline-flex;align-items:center;gap:5px}.ue-legende span::before{content:'';width:11px;height:11px;border-radius:50%;background:var(--f)}
.ue-tastatur{border-radius:14px}
.ue-note{transition:opacity .25s ease,transform .25s ease;transform-box:fill-box;transform-origin:center}
.ue-note.ein{animation:ue-note .3s ease both}
@keyframes ue-ein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes ue-note{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:none}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]):not([data-theme="hell"]) .ue{--ue-bg:#0f1218;--ue-karte:#181c24;--ue-text:#e8ebf1;--ue-leise:#9aa3b2;--ue-linie:#d5dae3;--ue-akzent:#7c7cf0;--ue-chip:#232834;--ue-gut:#3dd68c;--ue-hinweis:#f0b45a;--ue-schatten:none}}
:root[data-theme="dark"] .ue,:root[data-theme="dunkel"] .ue{--ue-bg:#0f1218;--ue-karte:#181c24;--ue-text:#e8ebf1;--ue-leise:#9aa3b2;--ue-linie:#d5dae3;--ue-akzent:#7c7cf0;--ue-chip:#232834;--ue-gut:#3dd68c;--ue-hinweis:#f0b45a;--ue-schatten:none}
@media (prefers-reduced-motion:reduce){.ue *{animation:none!important;transition:none!important}}
`;
function stilEinfuegen() {
  if (document.getElementById('ue-stil')) return;
  const s = document.createElement('style'); s.id = 'ue-stil'; s.textContent = STIL; document.head.appendChild(s);
}
function sv(tag, a, eltern) {
  const e = document.createElementNS(NS, tag);
  for (const k in a) e.setAttribute(k, a[k]);
  if (eltern) eltern.appendChild(e);
  return e;
}
function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

// ---------- Bass-System (eigene, große Darstellung für die Übungen) ----------
function bassSchluessel(svg, x) {
  const y = yVon(6); // F-Linie
  sv('path', { d: `M${x + 2},${y - 1}C${x + 4},${y - 17} ${x + 31},${y - 20} ${x + 34},${y - 1}C${x + 36},${y + 17} ${x + 20},${y + 31} ${x + 1},${y + 35}C${x + 17},${y + 26} ${x + 28},${y + 14} ${x + 27},${y - 1}C${x + 26},${y - 13} ${x + 10},${y - 13} ${x + 7},${y - 3}Z`, fill: 'currentColor' }, svg);
  sv('circle', { cx: x + 6, cy: y, r: 4.6, fill: 'currentColor' }, svg);
  sv('circle', { cx: x + 42, cy: y - G / 2, r: 2.5, fill: 'currentColor' }, svg);
  sv('circle', { cx: x + 42, cy: y + G / 2, r: 2.5, fill: 'currentColor' }, svg);
}
function kopfPfad(x, y) {
  const o = `M${x - 8.6},${y}a8.6,6 0 1,0 17.2,0a8.6,6 0 1,0 -17.2,0Z`;
  const th = (-35 * Math.PI) / 180, rx = 4.5, ry = 2.7, dx = rx * Math.cos(th), dy = rx * Math.sin(th);
  return o + `M${x - dx},${y - dy}a${rx},${ry} -35 1,0 ${2 * dx},${2 * dy}a${rx},${ry} -35 1,0 ${-2 * dx},${-2 * dy}Z`;
}
function vorzeichen(g, x, y, vorz, farbe) {
  if (vorz > 0) {
    sv('path', { d: `M${x - 2.6},${y - 10}V${y + 11}M${x + 2.6},${y - 11}V${y + 10}`, stroke: farbe, 'stroke-width': 1.4 }, g);
    sv('path', { d: `M${x - 6},${y - 2}L${x + 6},${y - 5.4}V${y - 2.6}L${x - 6},${y + 0.8}ZM${x - 6},${y + 4.8}L${x + 6},${y + 1.4}V${y + 4.2}L${x - 6},${y + 7.6}Z`, fill: farbe }, g);
  } else if (vorz < 0) {
    sv('path', { d: `M${x - 3},${y - 16}V${y + 5}`, stroke: farbe, 'stroke-width': 1.5 }, g);
    sv('path', { d: `M${x - 3},${y + 5}C${x + 6},${y + 1} ${x + 7},${y - 7} ${x - 3},${y - 2.5}V${y - 0.5}C${x + 3},${y - 4} ${x + 3},${y + 1} ${x - 3},${y + 3.5}Z`, fill: farbe }, g);
  }
}
/**
 * noten: [{s:{stamm,vorz,oktave}, farbe?, x?}] – ohne x: als Akkord bei x=200
 */
export function zeichneBassSystem(svg, noten, { namen = false } = {}) {
  svg.textContent = '';
  svg.setAttribute('viewBox', '0 0 340 190');
  svg.setAttribute('role', 'img');
  for (let i = 0; i < 5; i++) sv('line', { x1: 6, x2: 334, y1: yVon(2 * i), y2: yVon(2 * i), stroke: 'currentColor', 'stroke-width': 1.3, opacity: 0.8 }, svg);
  bassSchluessel(svg, 12);
  if (namen) {
    const L = ['G', 'H', 'D', 'F', 'A'], R = ['A', 'C', 'E', 'G'];
    L.forEach((n, i) => sv('text', { x: 318, y: yVon(2 * i) + 4, 'font-size': 11, 'font-weight': 700, fill: rollenFarbe('septime'), 'font-family': 'system-ui,sans-serif' }, svg).textContent = n);
    R.forEach((n, i) => sv('text', { x: 304, y: yVon(2 * i + 1) + 4, 'font-size': 11, 'font-weight': 700, fill: rollenFarbe('terz'), 'font-family': 'system-ui,sans-serif' }, svg).textContent = n);
  }
  const ps = noten.map((n) => systemPosition(n.s, 'bass'));
  // Sekunden im Akkord versetzen
  const versatz = new Map();
  const sortiert = noten.map((n, i) => i).filter((i) => noten[i].x == null).sort((a, b) => ps[a] - ps[b]);
  sortiert.forEach((i, k) => { const vor = sortiert[k - 1]; versatz.set(i, vor != null && ps[i] - ps[vor] === 1 && !versatz.get(vor) ? 17 : 0); });
  const spalten = []; // Vorzeichen-Spalten gegen Überlappung
  [...noten.keys()].sort((a, b) => ps[b] - ps[a]).forEach((i) => {
    if (!noten[i].s.vorz) return;
    let sp = 0; while (spalten.some((e) => e.sp === sp && Math.abs(e.p - ps[i]) < 6)) sp++;
    spalten.push({ i, sp, p: ps[i] });
  });
  noten.forEach((n, i) => {
    const p = ps[i];
    const x = (n.x ?? 200) + (versatz.get(i) || 0);
    const y = yVon(p);
    const farbe = n.farbe || 'currentColor';
    const g = sv('g', { class: 'ue-note' + (n.ein ? ' ein' : '') }, svg);
    const hl = [];
    for (let q = -2; q >= p; q -= 2) hl.push(q);
    for (let q = 10; q <= p; q += 2) hl.push(q);
    for (const q of hl) sv('line', { x1: x - 14, x2: x + 14, y1: yVon(q), y2: yVon(q), stroke: 'currentColor', 'stroke-width': 1.3 }, g);
    const sp = spalten.find((e) => e.i === i);
    if (sp) vorzeichen(g, (n.x ?? 200) - 21 - sp.sp * 13, y, n.s.vorz, farbe);
    sv('path', { d: kopfPfad(x, y), fill: farbe, 'fill-rule': 'evenodd' }, g);
  });
}

// ---------- Übungs-Oberfläche ----------
/**
 * @param {HTMLElement} el  Container
 * @param {{start?:'lesen'|'akkord'|'intervall'}} [opt]
 * @returns {{zeige(id:string):void, zerstoere():void}}
 */
export function uebungen(el, opt = {}) {
  stilEinfuegen();
  el.textContent = '';
  const wurzel = h('div', 'ue');
  const tabs = h('div', 'ue-tabs'); tabs.setAttribute('role', 'tablist');
  const karte = h('section', 'ue-karte');
  const kopf = h('div', 'ue-kopf');
  const titel = h('h2', 'ue-titel');
  const namenKnopf = h('button', 'ue-rund', ICON.namen); namenKnopf.setAttribute('aria-label', 'Notennamen an den Linien'); namenKnopf.setAttribute('aria-pressed', 'false');
  const hilfeKnopf = h('button', 'ue-rund', ICON.hilfe); hilfeKnopf.setAttribute('aria-label', 'Hilfe und Merksätze'); hilfeKnopf.setAttribute('aria-pressed', 'false');
  kopf.append(titel, namenKnopf, hilfeKnopf);
  const stufen = h('div', 'ue-stufen');
  const hilfe = h('div', 'ue-hilfe'); hilfe.hidden = true;
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'ue-system');
  const legende = h('div', 'ue-legende');
  const frage = h('p', 'ue-frage');
  const antworten = h('div', 'ue-antworten');
  const rueck = h('p', 'ue-rueck'); rueck.setAttribute('aria-live', 'polite');
  const erkl = h('p', 'ue-erkl');
  const leiste = h('div', 'ue-leiste');
  const hoerKnopf = h('button', 'ue-knopf', ICON.hoeren + '<span>Anhören</span>');
  const weiterKnopf = h('button', 'ue-knopf haupt', '<span>Weiter</span>' + ICON.weiter);
  leiste.append(hoerKnopf, weiterKnopf);
  karte.append(kopf, stufen, hilfe, svg, legende, frage, antworten, rueck, erkl, leiste);
  const tEl = h('div', 'ue-tastatur');
  wurzel.append(tabs, karte, tEl);
  el.appendChild(wurzel);

  let akt = null; // aktuelle Übung {tipp(midi), neu(), hoeren(), zeichne()}
  let namen = false;
  let warte = 0;
  const tast = tastatur(tEl, { von: 28, bis: 76, hoehe: 150, beiTipp: (m) => { audioKontext(); akt && akt.tipp && akt.tipp(m); } });
  requestAnimationFrame(() => { tast.zeigeBereich(43, 57, 'Bassschlüssel: großes G bis kleines a'); tast.scrolleZu(50, false); });

  const sage = (text, art = '') => {
    rueck.className = 'ue-rueck ' + art; rueck.textContent = text;
    if (!ruhig()) { void rueck.offsetWidth; rueck.classList.add('neu'); }
  };
  const spaeter = (fn, ms) => { clearTimeout(warte); warte = setTimeout(fn, ms); };
  const zeigeLegende = (rollen) => {
    legende.innerHTML = rollen.map((r) => `<span style="--f:${rollenFarbe(r)}">${ROLLEN_NAME[r]}</span>`).join('');
  };
  const merkHtml = (extra = '') => `
    <div class="ue-merk"><b>Linien von unten</b><span>${MERKSAETZE.linien.toene}</span><i>${MERKSAETZE.linien.satz}</i></div>
    <div class="ue-merk"><b>Zwischenräume von unten</b><span>${MERKSAETZE.raeume.toene}</span><i>${MERKSAETZE.raeume.satz}</i></div>
    <div class="ue-merk"><b>Ankerpunkte</b><i>Die zwei Punkte des Schlüssels umschließen die F-Linie (kleines f). Eine Hilfslinie über dem System = c1, die Mitte der Tastatur. Zwei Hilfslinien darunter = großes C.</i></div>${extra}`;

  // ----- 1. Noten lesen -----
  const LESEN_STUFEN = [
    { id: 'linien', titel: 'Linien', pos: [0, 2, 4, 6, 8] },
    { id: 'raeume', titel: 'Zwischenräume', pos: [1, 3, 5, 7] },
    { id: 'system', titel: 'Ganzes System', pos: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    { id: 'hilfslinien', titel: 'Mit Hilfslinien', pos: [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  ];
  function lesen() {
    let stufe = LESEN_STUFEN[0], p = null, ziel = 0, s = null, versuche = 0, fertig = false;
    const neu = () => {
      let q; do q = zufall(stufe.pos); while (q === p && stufe.pos.length > 1);
      p = q; s = ausPos(p); ziel = midiAus(s); versuche = 0; fertig = false;
      tast.zeige([]);
      zeichne(true);
      frage.textContent = 'Welche Taste ist das?';
      sage('Tippe die Taste auf der Tastatur.');
      erkl.textContent = '';
    };
    const zeichne = (ein = false) => zeichneBassSystem(svg, [{ s, farbe: fertig ? rollenFarbe('quinte') : null, ein }], { namen });
    return {
      titel: 'Noten im Bassschlüssel', stufen: LESEN_STUFEN, stufe: () => stufe.id,
      setzeStufe(id) { stufe = LESEN_STUFEN.find((x) => x.id === id) || stufe; neu(); },
      hilfe: () => merkHtml(), legende: [], neu, zeichne,
      hoeren() { ton(ziel, undefined, 0.9); },
      tipp(m) {
        ton(m, undefined, 0.7);
        if (fertig) return;
        if (m === ziel) {
          fertig = true;
          tast.leuchte(m, 'quinte', 900); tast.zeige([m], { [m]: 'quinte' }, { [m]: '✓' });
          zeichne();
          sage(`Ja! ${oktavName(tonName(s.stamm), s.oktave)} – ${ortImSystem(s)}.`, 'gut');
          spaeter(neu, 1300);
          return;
        }
        versuche++;
        tast.leuchte(m, 'fremd', 500);
        const linie = p % 2 === 0;
        const tipp = p < 0 || p > 8 ? 'Zähle vom großen G (unterste Linie) oder vom c1 (Hilfslinie oben) aus.'
          : linie ? `Linien: ${MERKSAETZE.linien.toene} – ${MERKSAETZE.linien.satz}` : `Zwischenräume: ${MERKSAETZE.raeume.toene} – ${MERKSAETZE.raeume.satz}`;
        if (m % 12 === ziel % 12) sage(`Richtiger Ton, andere Oktave. Gesucht ist ${notenName(ziel)}.`, 'hinweis');
        else sage(`Das war ${notenName(m)}. ${tipp}`, 'hinweis');
        if (versuche >= 2) { tast.zeige([ziel], { [ziel]: 'grundton' }, { [ziel]: '?' }); tast.scrolleZu(ziel); erkl.textContent = 'Die gesuchte Taste ist markiert.'; }
      },
    };
  }

  // ----- 2. Akkord-Umkehrungen -----
  const LEICHT = [['C', 0, 'dur'], ['D', 0, 'moll'], ['E', 0, 'moll'], ['F', 0, 'dur'], ['G', 0, 'dur'], ['A', 0, 'moll']];
  const ALLE = [...LEICHT, ['D', 0, 'dur'], ['E', 0, 'dur'], ['A', 0, 'dur'], ['H', -1, 'dur'], ['E', -1, 'dur'], ['A', -1, 'dur'],
    ['C', 0, 'moll'], ['G', 0, 'moll'], ['F', 0, 'moll'], ['H', 0, 'moll'], ['F', 1, 'moll'], ['C', 1, 'moll']];
  const AKK_STUFEN = [{ id: 'leicht', titel: 'Ohne Vorzeichen' }, { id: 'alle', titel: 'Alle Dur & Moll' }];
  const LAGEN = ['Grundstellung', '1. Umkehrung', '2. Umkehrung'];
  const baueTon = (grund, stufenZahl, halb) => {
    const d = grund.oktave * 7 + STAMM.indexOf(grund.stamm) + stufenZahl;
    const s = { stamm: STAMM[d % 7], vorz: 0, oktave: Math.floor(d / 7) };
    s.vorz = midiAus(grund) + halb - midiAus(s);
    return s;
  };
  function akkord() {
    let stufe = 'leicht', toene = [], umk = 0, phase = 'lage', versuche = 0, gegriffen = new Set(), info = null;
    const neu = () => {
      const [st, vz, art] = zufall(stufe === 'leicht' ? LEICHT : ALLE);
      const grund = { stamm: st, vorz: vz, oktave: 2 };
      let t = [
        { s: grund, rolle: 'grundton' },
        { s: baueTon(grund, 2, art === 'dur' ? 4 : 3), rolle: 'terz' },
        { s: baueTon(grund, 4, 7), rolle: 'quinte' },
      ];
      umk = Math.floor(Math.random() * 3);
      for (let k = 0; k < umk; k++) t[k].s = { ...t[k].s, oktave: t[k].s.oktave + 1 };
      const tief = () => Math.min(...t.map((x) => midiAus(x.s)));
      while (tief() < 40) t = t.map((x) => ({ ...x, s: { ...x.s, oktave: x.s.oktave + 1 } }));
      while (tief() > 52) t = t.map((x) => ({ ...x, s: { ...x.s, oktave: x.s.oktave - 1 } }));
      toene = t.map((x) => ({ ...x, midi: midiAus(x.s) })).sort((a, b) => a.midi - b.midi);
      info = akkordAusMidis(toene.map((x) => x.midi), { schreibweisen: toene.map((x) => x.s) });
      phase = 'lage'; versuche = 0; gegriffen = new Set();
      tast.zeige([]); zeichne(false, true); zeigeAntworten();
      frage.textContent = 'Grundstellung oder Umkehrung?';
      sage('Schau, wo der große Abstand liegt.'); erkl.textContent = '';
    };
    const zeichne = (farbig, ein = false) => zeichneBassSystem(svg, toene.map((x) => ({
      s: x.s, ein, farbe: farbig || gegriffen.has(x.midi) ? rollenFarbe(x.rolle) : null,
    })), { namen });
    const zeigeAntworten = () => {
      antworten.textContent = '';
      LAGEN.forEach((txt, i) => {
        const b = h('button', 'ue-antwort', txt);
        b.addEventListener('click', () => antwort(i, b));
        antworten.appendChild(b);
      });
    };
    const antwort = (i, b) => {
      if (phase !== 'lage') return;
      audioKontext();
      if (i === umk) {
        b.classList.add('ist-richtig');
        klinge(toene.map((x) => x.midi), { arpeggio: 0.09, dauer: 1.4 });
        zeichne(true);
        sage(`Richtig: ${info.name}, ${LAGEN[umk]}.`, 'gut');
        erkl.textContent = info.erklaerung.split('. Enge Lage')[0].replace(/\.$/, '') + '.';
        phase = 'greifen';
        spaeter(() => {
          antworten.textContent = '';
          frage.textContent = 'Jetzt greifen: tippe die drei Tasten.';
          tast.scrolleZuBereich(toene[0].midi, toene[2].midi);
        }, 900);
        return;
      }
      versuche++;
      b.classList.add('ist-falsch');
      const form = umk === 0 ? 'keine Lücke – alle Töne auf Linien oder alle in Zwischenräumen („Schneemann")'
        : umk === 1 ? 'die große Lücke (Quarte) oben' : 'die große Lücke (Quarte) unten';
      if (versuche >= 2) { sage(`Hier ist ${form} → ${LAGEN[umk]}.`, 'hinweis'); zeichne(true); }
      else sage('Noch nicht. Grundstellung: keine Lücke · 1. Umkehrung: Lücke oben · 2. Umkehrung: Lücke unten.', 'hinweis');
    };
    return {
      titel: 'Akkord-Umkehrungen', stufen: AKK_STUFEN, stufe: () => stufe,
      setzeStufe(id) { stufe = id; neu(); },
      hilfe: () => merkHtml(`<div class="ue-merk"><b>Akkord-Formen</b><i>Grundstellung: Linie-Linie-Linie oder Raum-Raum-Raum. 1. Umkehrung: Terz unten, Lücke oben. 2. Umkehrung: Quinte unten, Lücke unten.</i></div>`),
      legende: ['grundton', 'terz', 'quinte'], neu, zeichne: () => zeichne(phase !== 'lage'),
      hoeren() { klinge(toene.map((x) => x.midi), { arpeggio: 0.12, dauer: 1.6 }); },
      tipp(m) {
        ton(m, undefined, 0.8);
        if (phase !== 'greifen') return;
        const t = toene.find((x) => x.midi === m);
        if (t) {
          gegriffen.add(m);
          const f = {}, txt = {};
          for (const g of gegriffen) { const x = toene.find((y) => y.midi === g); f[g] = x.rolle; txt[g] = { grundton: '1', terz: '3', quinte: '5' }[x.rolle]; }
          tast.zeige(gegriffen, f, txt); tast.leuchte(m, t.rolle, 500);
          zeichne(true);
          if (gegriffen.size === toene.length) {
            phase = 'fertig';
            spaeter(() => klinge(toene.map((x) => x.midi), { dauer: 1.8 }), 250);
            sage(`Geschafft: ${info.name}, ${LAGEN[umk]}.`, 'gut');
            frage.textContent = 'So klingt er.';
          } else sage(`${ROLLEN_NAME[t.rolle]} ${notenName(t.s)} – weiter so.`, 'gut');
          return;
        }
        tast.leuchte(m, 'fremd', 500);
        const gleich = toene.find((x) => x.midi % 12 === m % 12);
        sage(gleich ? `Richtiger Ton, andere Oktave – nimm ${notenName(gleich.s)}.` : `${notenName(m)} gehört nicht zu ${info.name}.`, 'hinweis');
      },
    };
  }

  // ----- 3. Intervalle -----
  const IV_STUFEN = [{ id: 'sehen', titel: 'Sehen & hören' }, { id: 'hoeren', titel: 'Nur hören' }, { id: 'finden-leicht', titel: 'Finden: leicht' }, { id: 'finden', titel: 'Finden: alle' }];
  // Finden: Bezugston (weiße Taste im Bassschlüssel) + Abstand in Halbtönen → gesuchter Ton darüber
  const FINDEN_LEICHT = [3, 4, 5, 7, 12], FINDEN_ALLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const BEZUG_TASTEN = [41, 43, 45, 47, 48, 50, 52];
  const ZAHL_AUS_HALB = [1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8];
  const swAusMidi = (m) => { const d = [['C', 0], ['C', 1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['A', -1], ['A', 0], ['H', -1], ['H', 0]][((m % 12) + 12) % 12]; return { stamm: d[0], vorz: d[1], oktave: Math.floor(m / 12) - 1 }; };
  const zielSchreibweise = (bezug, h) => {
    const d = bezug.oktave * 7 + STAMM.indexOf(bezug.stamm) + ZAHL_AUS_HALB[h] - 1;
    const t = { stamm: STAMM[d % 7], vorz: 0, oktave: Math.floor(d / 7) };
    t.vorz = midiAus(bezug) + h - midiAus(t);
    return Math.abs(t.vorz) > 1 ? swAusMidi(midiAus(bezug) + h) : t;
  };
  function intervall() {
    let stufe = 'sehen', p1 = 0, schritt = 2, s1 = null, s2 = null, fertig = false, versuche = 0;
    const findet = () => stufe.startsWith('finden');
    let halb = 0; // Finden: gesuchter Abstand in Halbtönen
    const neuFinden = () => {
      const pool = stufe === 'finden' ? FINDEN_ALLE : FINDEN_LEICHT;
      let h; do h = zufall(pool); while (h === halb && pool.length > 1);
      halb = h;
      s1 = swAusMidi(zufall(BEZUG_TASTEN)); s2 = zielSchreibweise(s1, halb);
      fertig = false; versuche = 0;
      const m1 = midiAus(s1);
      tast.zeige([m1], { [m1]: 'grundton' }, { [m1]: '1' }); tast.intervalle(null, m1);
      requestAnimationFrame(() => requestAnimationFrame(() => tast.scrolleZuBereich(m1, m1 + 12))); // nach dem Start-Bildlauf der Übung
      zeichne(true); antworten.textContent = '';
      frage.textContent = 'Hör zu – und finde den zweiten Ton auf der Tastatur.';
      sage(`Bezugston: ${notenName(s1)} (rot). Der gesuchte Ton liegt darüber.`); erkl.textContent = '';
      if (audioKontextBereit()) spaeter(() => api.hoeren(), 250);
    };
    const neu = () => {
      if (findet()) return neuFinden();
      tast.intervalle(null, null);
      schritt = 1 + Math.floor(Math.random() * 7);
      p1 = Math.floor(Math.random() * Math.max(1, 11 - schritt));
      s1 = ausPos(p1); s2 = ausPos(p1 + schritt); fertig = false; versuche = 0;
      tast.zeige([]); zeichne(true); zeigeAntworten();
      frage.textContent = stufe === 'hoeren' ? 'Welches Intervall hörst du?' : 'Welcher Abstand ist das?';
      sage(stufe === 'hoeren' ? 'Tippe auf „Anhören".' : 'Zähle: der untere Ton ist 1.'); erkl.textContent = '';
      if (audioKontextBereit()) spaeter(() => api.hoeren(), 250);
    };
    const zeichne = (ein = false) => {
      if (findet()) {
        zeichneBassSystem(svg, [{ s: s1, x: 150, ein, farbe: rollenFarbe('grundton') }, ...(fertig ? [{ s: s2, x: 240, ein: true, farbe: rollenFarbe('septime') }] : [])], { namen });
        return;
      }
      const verdeckt = stufe === 'hoeren' && !fertig;
      if (verdeckt) { zeichneBassSystem(svg, [], { namen }); return; }
      zeichneBassSystem(svg, [
        { s: s1, x: 150, ein, farbe: fertig ? rollenFarbe('grundton') : null },
        { s: s2, x: 240, ein, farbe: fertig ? rollenFarbe('septime') : null },
      ], { namen });
    };
    const tippFinden = (m) => {
      if (fertig) return;
      const m1 = midiAus(s1), m2 = midiAus(s2);
      const bezug = { midi: m1, schreibweise: s1 };
      if (m === m2) {
        fertig = true;
        const iv = ivBerechnen(bezug, { midi: m2, schreibweise: s2 });
        tast.zeige([m1, m2], { [m1]: 'grundton', [m2]: 'septime' }, { [m1]: '1', [m2]: '' });
        tast.intervalle(new Map([[m2, iv.kurz]]), m1); tast.leuchte(m2, 'quinte', 900);
        zeichne();
        sage(`Richtig! ${langText(iv)}.`, 'gut');
        erkl.textContent = iv.zusatz ? `${iv.zusatz[0].toUpperCase()}${iv.zusatz.slice(1)}.` : 'Tippe „Weiter“ für das nächste Intervall.';
        spaeter(() => { const c = audioKontext(), t = c.currentTime + 0.05; ton(m1, t, 1.2); ton(m2, t, 1.2); }, 450);
        return;
      }
      versuche++;
      tast.leuchte(m, 'fremd', 500);
      if (m === m1) sage('Das ist der Bezugston selbst. Der gesuchte Ton liegt höher.', 'hinweis');
      else if (m < m1) sage(`${notenName(m)} liegt unter dem Bezugston – der gesuchte Ton liegt darüber.`, 'hinweis');
      else {
        const iv = ivBerechnen(bezug, { midi: m });
        tast.intervalle(new Map([[m, iv.kurz]]), m1);
        sage(`Das war ${iv.lang === 'Tritonus' ? 'ein Tritonus' : 'eine ' + iv.lang} (${m - m1} ${m - m1 === 1 ? 'Halbton' : 'Halbtöne'}). Gesucht ist ein ${m > m2 ? 'kleinerer' : 'größerer'} Abstand.`, 'hinweis');
      }
      if (versuche >= 2) erkl.textContent = `Tipp: Gesucht ist ${halb === 6 ? 'der Tritonus' : 'die ' + nachHalbtoenen(halb).lang} – ${halb} ${halb === 1 ? 'Halbton' : 'Halbtöne'} über ${notenName(s1)}.`;
      if (versuche >= 3) { tast.zeige([m1, m2], { [m1]: 'grundton', [m2]: 'septime' }, { [m1]: '1', [m2]: '?' }); erkl.textContent += ' Die Taste ist markiert.'; }
    };
    const zeigeAntworten = () => {
      antworten.textContent = '';
      STUFEN_NAME.slice(1).forEach((txt, i) => {
        const b = h('button', 'ue-antwort', txt);
        b.addEventListener('click', () => antwort(i + 1, b));
        antworten.appendChild(b);
      });
    };
    const antwort = (k, b) => {
      if (fertig) return;
      audioKontext();
      const m1 = midiAus(s1), m2 = midiAus(s2);
      if (k === schritt) {
        fertig = true; b.classList.add('ist-richtig');
        zeichne();
        const art = schritt === 7 ? 'gleicher Ton, eine Oktave höher' : schritt % 2 === 0 ? 'Linie → Linie oder Raum → Raum' : 'Linie → Raum oder Raum → Linie';
        sage(`Richtig: ${STUFEN_NAME[schritt]}.`, 'gut');
        // nach Notennamen benennen (H → F = verminderte Quinte, F → H = übermäßige Quarte), nicht nur nach Halbtönen
        const ivS = ivBerechnen({ midi: m1, schreibweise: s1 }, { midi: m2, schreibweise: s2 });
        erkl.textContent = `Genau: ${ivS.lang} (${m2 - m1} Halbtöne${ivS.zusatz === 'Tritonus' ? ', Tritonus' : ''}) · ${art}.`;
        tast.zeige([m1, m2], { [m1]: 'grundton', [m2]: 'septime' }, { [m1]: '1', [m2]: String(schritt + 1) });
        tast.scrolleZuBereich(m1, m2);
        klinge([m1, m2], { dauer: 1.2 });
        return;
      }
      versuche++; b.classList.add('ist-falsch');
      sage(versuche >= 2 ? `Es ist eine ${STUFEN_NAME[schritt]} – zähle mit: ${Array.from({ length: schritt + 1 }, (_, i) => i + 1).join(' · ')}.` : 'Noch nicht. Zähle jede Linie und jeden Zwischenraum mit.', 'hinweis');
    };
    const api = {
      titel: 'Intervalle', stufen: IV_STUFEN, stufe: () => stufe,
      setzeStufe(id) { stufe = IV_STUFEN.some((x) => x.id === id) ? id : stufe; neu(); },
      hilfe: () => `<div class="ue-merk"><b>Zählen</b><i>Der untere Ton ist 1. Jede Linie und jeder Zwischenraum zählt einen Schritt.</i></div>
        <div class="ue-merk"><b>Gerade oder ungerade?</b><i>Terz, Quinte, Septime: Linie → Linie (oder Raum → Raum). Sekunde, Quarte, Sexte: Linie → Raum.</i></div>
        <div class="ue-merk"><b>Finden: Halbtöne zählen</b><i>Jede Taste (schwarz oder weiß) ist ein Halbton. Kleine Terz 3 · große Terz 4 · Quarte 5 · Quinte 7 · Oktave 12.</i></div>`,
      legende: [], neu, zeichne: () => zeichne(),
      hoeren() {
        const c = audioKontext(), m1 = midiAus(s1), m2 = midiAus(s2), t = c.currentTime + 0.05;
        ton(m1, t, 0.55); ton(m2, t + 0.6, 0.55); ton(m1, t + 1.3, 1); ton(m2, t + 1.3, 1);
      },
      tipp(m) { ton(m, undefined, 0.7); if (findet()) tippFinden(m); },
    };
    return api;
  }
  let audioGenutzt = false;
  const audioKontextBereit = () => audioGenutzt;
  wurzel.addEventListener('pointerdown', () => { audioGenutzt = true; }, { once: true });

  const FABRIK = { lesen, akkord, intervall };
  const cache = {};
  UEBUNGEN.forEach((u) => {
    const b = h('button', 'ue-tab', u.titel);
    b.setAttribute('role', 'tab'); b.dataset.id = u.id; b.title = u.text;
    b.addEventListener('click', () => zeige(u.id));
    tabs.appendChild(b);
  });

  function baueStufen() {
    stufen.textContent = '';
    for (const st of akt.stufen) {
      const b = h('button', 'ue-chip', st.titel);
      b.setAttribute('aria-pressed', String(akt.stufe() === st.id));
      b.addEventListener('click', () => { akt.setzeStufe(st.id); baueStufen(); });
      stufen.appendChild(b);
    }
  }
  function zeige(id) {
    clearTimeout(warte);
    akt = cache[id] || (cache[id] = FABRIK[id]());
    tast.intervalle(null, null);
    [...tabs.children].forEach((b) => b.setAttribute('aria-selected', String(b.dataset.id === id)));
    titel.textContent = akt.titel;
    hilfe.innerHTML = akt.hilfe();
    zeigeLegende(akt.legende);
    antworten.textContent = '';
    hoerKnopf.hidden = false;
    baueStufen();
    akt.neu();
  }
  hilfeKnopf.addEventListener('click', () => { hilfe.hidden = !hilfe.hidden; hilfeKnopf.setAttribute('aria-pressed', String(!hilfe.hidden)); });
  namenKnopf.addEventListener('click', () => { namen = !namen; namenKnopf.setAttribute('aria-pressed', String(namen)); akt && akt.zeichne(); });
  hoerKnopf.addEventListener('click', () => { audioKontext(); akt && akt.hoeren(); });
  weiterKnopf.addEventListener('click', () => { akt && akt.neu(); });

  zeige(opt.start || 'lesen');
  if (opt.stufe && akt.stufen.some((x) => x.id === opt.stufe)) { akt.setzeStufe(opt.stufe); baueStufen(); }
  return {
    zeige,
    tastatur: tast,
    zerstoere() { clearTimeout(warte); el.textContent = ''; },
  };
}
