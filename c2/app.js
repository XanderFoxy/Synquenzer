// Feinschliff – Rahmen, Navigation und die leichten Seiten (Heute, Bereiche, Grammatik, Mehr).
// 0.4.0: Die Übungs-Engine (ueben.js + pruefen.js, ~27 kB) lädt erst nach dem ersten Bild bzw. beim ersten Üben.
// Schwere Teile (Hören, Lesen, Quiz, Prüfung, Schreiben/Sprechen, Fortschritt, Erinnerung, Links) werden erst beim Aufruf geladen.
import { speicher, esc, tag, mische } from './speicher.js';
import { SYM, LOGO } from './symbole.js';
import { lade, ladeIndex, liste, allesVorladen } from './daten.js';
import { waehle, poolStand } from './wiederholung.js';
import { einst, setzeEinst, serie, zielStand, wocheAktiv, summe, heutePunkte } from './konto.js';

export const VERSION = '0.5.0';
export const BEREICHE = [
  { id: 'hoeren', name: 'Hören', text: 'Ohne Text, wie in der Prüfung' },
  { id: 'lesen', name: 'Lesen', text: 'Kommentare, Sachtexte, Literatur' },
  { id: 'grammatik', name: 'Grammatik', text: 'Tafel, Fallen, Drills' },
  { id: 'schreiben', name: 'Schreiben', text: 'Ideen, Redemittel, Timer' },
  { id: 'sprechen', name: 'Sprechen', text: 'Vortrag und Diskussion' },
  { id: 'wortschatz', name: 'Wortschatz', text: 'Fremdwörter, Wendungen, Rektion' },
  { id: 'pruefung', name: 'Prüfung', text: 'Simulation, Korrektur am Ende' },
];
const view = () => document.getElementById('ansicht');
const U = () => import('./ueben.js');   // sitzung, kandidatenAus
const NAV = [['heute', 'Heute'], ['bereiche', 'Bereiche'], ['quiz', 'Quiz'], ['fortschritt', 'Fortschritt'], ['mehr', 'Mehr']];
function nav(aktiv) {
  document.getElementById('nav').innerHTML = NAV.map(([id, n]) => `<a href="#/${id}" class="nav-${id}" ${aktiv === id ? 'aria-current="page"' : ''}>${SYM[id]}<span>${n}</span>${id === 'mehr' ? walkiePunkt() : ''}</a>`).join('');
}
// Wünsche-Kanal: kleiner Punkt, wenn Claude etwas gefragt oder geantwortet hat (Stand aus der letzten Prüfung, kein Netz nötig)
const walkie = () => speicher.lies('walkie', {});
const walkieNeu = () => { const w = walkie(); return (w.offen || 0) + (w.neuAntw || 0) + (w.neuGesehen !== VERSION ? 1 : 0); };
const walkiePunkt = () => (walkieNeu() ? '<i class="w-punkt" role="img" aria-label="Neues von Claude"></i>' : '');
function walkieKarte() {
  const w = walkie(); const f = w.offen || 0, a = w.neuAntw || 0; if (!f && !a) return '';
  const titel = a ? (a === 1 ? 'Claude hat dir geantwortet' : `Claude hat dir ${a}-mal geantwortet`) : (f === 1 ? 'Claude hat eine kurze Frage an dich' : `Claude hat ${f} kurze Fragen an dich`);
  return `<a class="karte klein w-karte" href="#/wuensche">${SYM.wunsch}<div><b>${titel}</b><p class="leise">${a ? 'Unter „Wünsche“ bei deinen Nachrichten.' : 'Antippen und antworten – dauert eine Minute.'}</p></div>${SYM.weiter}</a>`;
}
export function walkieAuffrischen() {   // nach einer Prüfung im Hintergrund: Punkt und Heute-Karte neu zeichnen
  document.querySelectorAll('.nav-mehr .w-punkt, .w-knopf .w-punkt').forEach((x) => x.remove());
  if (walkieNeu()) { document.querySelector('.nav-mehr')?.insertAdjacentHTML('beforeend', walkiePunkt()); document.querySelector('.w-knopf')?.insertAdjacentHTML('beforeend', walkiePunkt()); }
  const box = document.getElementById('w-heute'); if (box) box.innerHTML = walkieKarte();
}
export const kachel = (b) => `<a class="kachel" data-bereich="${b.id}" href="#/${b.id === 'pruefung' ? 'pruefung' : 'bereich/' + b.id}"><span class="k-sym">${SYM[b.id]}</span><b>${b.name}</b><small>${b.text}</small></a>`;
export const kopf = (titel, zurueck = '#/heute', bereich = '') => `<header class="seitenkopf" ${bereich ? `data-bereich="${bereich}"` : ''}><a class="rund" href="${zurueck}" aria-label="Zurück">${SYM.zurueck}</a><h1>${esc(titel)}</h1></header>`;
const gruss = () => { const h = new Date().getHours(); return h < 11 ? 'Guten Morgen' : h < 17 ? 'Schönen Tag' : 'Guten Abend'; };
const MODI = (m) => `<div class="segment" role="group" aria-label="Modus"><button data-modus="ueben" aria-pressed="${m === 'ueben'}">Üben <small>sofort Rückmeldung</small></button><button data-modus="pruefung" aria-pressed="${m === 'pruefung'}">Prüfung <small>Korrektur am Ende</small></button></div>`;
function modusSchalter(box, nachher) {
  box.addEventListener('click', (e) => { const b = e.target.closest('[data-modus]'); if (!b) return; setzeEinst({ modus: b.dataset.modus }); box.querySelectorAll('[data-modus]').forEach((x) => x.setAttribute('aria-pressed', x === b)); nachher?.(); });
}

// ---------- Heute ----------
function serieKarte() {
  const s = serie(), w = wocheAktiv();
  const text = s.tage === 0 ? (s.pause ? 'Schön, dass du wieder da bist.' : 'Deine Serie beginnt mit der ersten Runde.') : `${s.tage} ${s.tage === 1 ? 'Lerntag' : 'Lerntage'} in Folge`;
  return `<div class="karte klein serie">${SYM.pflanze}<div><b>${text}</b><p class="leise">Pausen sind erlaubt: bis zu 2 freie Tage unterbrechen nichts.</p>
    <div class="punkte-woche" aria-label="Diese Woche">${w.map((d, i) => `<i class="${d.aktiv ? 'an' : ''} ${d.heute ? 'jetzt' : ''}" title="${d.tag}">${'MDMDFSS'[i]}</i>`).join('')}</div></div></div>`;
}
function zielKarte() {
  const z = zielStand(), anteil = Math.min(1, z.erreicht / z.wert), U = 2 * Math.PI * 20;
  return `<a class="karte klein ziel" href="#/mehr">${`<svg class="ring-svg" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" class="ring-grund"/><circle cx="24" cy="24" r="20" class="ring-wert" stroke-dasharray="${U}" stroke-dashoffset="${U * (1 - anteil)}"/></svg>`}<div><b>${z.erreicht} von ${z.wert} Einheiten</b><p class="leise">Ziel ${z.art === 'monat' ? 'diesen Monat' : 'diese Woche'}${z.erreicht >= z.wert ? ' – erreicht' : ''}</p></div></a>`;
}
async function heute() {
  nav('heute'); const m = einst().modus;
  view().innerHTML = `<header class="appkopf">${LOGO}<div><h1>Feinschliff</h1><p class="leise">${gruss()}. Deutsch auf C2-Niveau, zehn Minuten am Stück.</p></div><a class="rund w-knopf" href="#/wuensche" aria-label="Wünsche an Claude" title="Wünsche an Claude">${SYM.wunsch}${walkiePunkt()}</a></header>
    <div id="w-heute">${walkieKarte()}</div>
    <section class="karte held"><div class="held-text"><span class="ueber">Heute</span><h2>Deine 10 Minuten</h2><p>Eine Mischung aus deinen Baustellen und Neuem. Keine Übung kommt doppelt, bevor alle dran waren.</p></div>
      ${MODI(m)}<button class="knopf haupt gross" data-start>${SYM.play} Los geht’s</button></section>
    <div class="zwei">${serieKarte()}${zielKarte()}</div>
    <div class="karte klein punkte">${SYM.stern}<div><b><span data-punkte-heute>${heutePunkte()}</span> Punkte heute</b><p class="leise">${summe()} Punkte insgesamt</p></div><a class="textknopf" href="#/fortschritt">Verlauf</a></div>
    ${iosHinweis()}<div id="dazu"></div>
    <h3 class="zwischen">Bereiche</h3><nav class="kacheln">${BEREICHE.map(kachel).join('')}</nav>`;
  modusSchalter(view().querySelector('.held'));
  view().querySelector('[data-start]').addEventListener('click', starteHeute);
  heuteDazu().catch(() => {});
  view().querySelector('[data-ios-weg]')?.addEventListener('click', (ev) => { speicher.schreib('iosHinweis', 1); ev.target.closest('.ios-hinweis')?.remove(); });
}
// iPhone/iPad: Safari löscht Website-Daten nach 7 Tagen ohne Besuch; die Home-Bildschirm-App hat einen eigenen, dauerhaften Speicher.
const istIos = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const alsApp = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
function iosHinweis() {
  if (!istIos() || alsApp() || speicher.lies('iosHinweis', 0)) return '';
  return `<div class="karte klein ios-hinweis">${SYM.idee}<div><b>Tipp fürs iPhone</b><p class="leise">Tippe in Safari auf „Teilen“ und dann auf „Zum Home-Bildschirm“. So bleibt dein Fortschritt dauerhaft gespeichert – Safari allein löscht ihn nach 7 Tagen Pause. Die Home-Bildschirm-App hat einen eigenen Speicher: Sichere deinen Stand vorher unter „Mehr“ als Datei und lade ihn dort wieder.</p><button class="textknopf" data-ios-weg>Verstanden</button></div></div>`;
}
async function heuteDazu() {   // Vorschlag: nächster Hör- oder Lesetext bzw. ein Thema, das noch nicht dran war
  const erledigt = speicher.lies('erledigt', {}); const t = tag(); const wahl = [];
  for (const [b, pfad, wort] of [['hoeren', 'hoeren', 'Hören'], ['lesen', 'lesen', 'Lesen'], ['themen', 'thema', 'Sprechen']]) {
    const schl = b === 'themen' ? 'sprechen' : b;
    const l = (await liste(b)).filter((e) => !erledigt[`${schl}/${e.id}`]); if (l.length) wahl.push({ b, e: l[0], pfad, wort });
  }
  if (!wahl.length) return;
  const w = wahl[(Number(t.slice(-2)) || 0) % wahl.length];
  const href = w.b === 'themen' ? `#/thema/${w.e.id}/sprechen` : `#/${w.pfad}/${w.e.id}`;
  const dauer = w.e.dauer_s ? `${Math.max(1, Math.round(w.e.dauer_s / 60))} Min. Audio` : w.e.zeit_min ? `${w.e.zeit_min} Min.` : '';
  const box = document.getElementById('dazu'); if (!box) return;
  box.innerHTML = `<a class="karte klein dazu" data-bereich="${w.b === 'themen' ? 'sprechen' : w.b}" href="${href}">${SYM[w.b === 'themen' ? 'sprechen' : w.b]}<div><span class="ueber">Wenn du noch Lust hast · ${w.wort}</span><b>${esc(w.e.titel || w.e.thema)}</b><p class="leise">${esc(dauer)}</p></div>${SYM.weiter}</a>`;
}
export async function starteHeute() {
  const v = view(); v.innerHTML = '<p class="laden">Einen Moment …</p>';
  try {
    const idx = await ladeIndex(); const th = speicher.lies('themen', {});
    const gram = idx.bereiche?.grammatik || [];
    const eintraege = await heuteMischung(idx, th);
    (await U()).sitzung(v, { titel: 'Deine 10 Minuten', bereich: 'grammatik', eintraege, modus: einst().modus, zurueck: '#/heute', nochmal: starteHeute });
  } catch (e) { v.innerHTML = `${kopf('Heute')}<p class="karte">Die Übungen konnten nicht geladen werden. ${navigator.onLine ? '' : 'Du bist offline – öffne die App einmal mit Internet.'}</p>`; }
}

// Mischung für „Deine 10 Minuten“: 6 Grammatik + 4 Wortschatz. Grammatik: ein schwaches Thema (zufällig unter den drei
// schwächsten unter 80 %) und zwei Themen, die am wenigsten geübt wurden – so kommen nach und nach alle 28 Themen dran.
// Typen: Grammatik 3 aktiv (Sortieren/Fehler/Verbinden), 2 Lücken, 1 Auswahl; Wortschatz 1 Verbinden, 2 Lücken, 1 Auswahl.
export async function heuteMischung(idx, th = speicher.lies('themen', {}), n = 10) {
  const gram = idx.bereiche?.grammatik || [];
  const st = (e) => th['grammatik/' + e.id]; const quote = (e) => { const x = st(e); return x && x.n >= 3 ? x.r / x.n : null; };
  const schwach = mische(gram.filter((e) => quote(e) != null && quote(e) < 0.8).sort((a, b) => quote(a) - quote(b)).slice(0, 3)).slice(0, 1);
  const wenig = mische(gram.filter((e) => !schwach.includes(e))).sort((a, b) => (st(a)?.n || 0) - (st(b)?.n || 0));
  const wahlG = [...schwach, ...wenig].slice(0, 3);
  const ws = idx.bereiche?.wortschatz || []; const wsWahl = mische(ws).slice(0, 2);
  const kg = [], kw = []; const { kandidatenAus } = await U();
  for (const e of wahlG) { try { kg.push(...kandidatenAus(await lade(e.datei))); } catch { /* offline: ohne dieses Thema */ } }
  if (wsWahl.length) { const { kandidatenFuer } = await import('./wortschatz.js'); for (const e of wsWahl) { try { kw.push(...await kandidatenFuer(e)); } catch { /* offline */ } } }
  if (!kg.length && !kw.length) throw new Error('keine Daten');
  const nG = kw.length ? Math.round(n * 0.6) : n;
  const aktiv = (k) => k.typ === 'sortieren' || k.typ === 'fehler' || k.typ === 'zuordnen'; const T = { durchlauf: false };
  const gAktiv = waehle(kg.filter(aktiv), Math.min(3, nG - 1), T);
  const gLuecke = waehle(kg.filter((k) => k.typ === 'luecke'), Math.min(2, nG - gAktiv.length - 1), T);
  const gAus = waehle(kg.filter((k) => !aktiv(k) && k.typ !== 'luecke'), nG - gAktiv.length - gLuecke.length, T);
  const wVerb = waehle(kw.filter((k) => k.typ === 'zuordnen'), 1, T);
  const wRest = waehle(kw.filter((k) => k.typ !== 'zuordnen' && k.typ !== 'auswahl'), n - nG - wVerb.length - 1, T);
  const wAus = waehle(kw.filter((k) => k.typ === 'auswahl'), n - nG - wVerb.length - wRest.length, T);
  let alle = [...gAktiv, ...gLuecke, ...gAus, ...wVerb, ...wRest, ...wAus];
  if (alle.length < n) { const da = new Set(alle.map((k) => k.uid)); alle.push(...waehle([...kg, ...kw].filter((k) => !da.has(k.uid)), n - alle.length)); }
  const r = mische(alle.slice(0, n));   // Typen streuen: nie zweimal derselbe Typ hintereinander, wenn möglich
  for (let i = 1; i < r.length; i++) if (r[i].typ === r[i - 1].typ) { const j = r.findIndex((k, x) => x > i && k.typ !== r[i - 1].typ); if (j > 0) [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

// ---------- Bereiche ----------
function bereiche() { nav('bereiche'); view().innerHTML = `${kopf('Bereiche')}<nav class="kacheln gross">${BEREICHE.map(kachel).join('')}</nav>`; }
async function bereich(id) {
  nav('bereiche'); const b = BEREICHE.find((x) => x.id === id); if (!b) return bereiche();
  const v = view(); v.innerHTML = `${kopf(b.name, '#/bereiche', id)}<p class="laden">Lädt …</p>`;
  const erledigt = speicher.lies('erledigt', {}); let html = '';
  if (id === 'grammatik') {
    const l = await liste('grammatik'); const th = speicher.lies('themen', {});
    html = `<p class="einleitung">Wiederholung auf C-Niveau – mit kurzen Erklärungen wie an der Tafel und Extra-Drills zu den typischen Baustellen.</p>
      <button class="knopf haupt breit" data-gemischt>${SYM.play} Gemischt üben (10)</button>
      <ul class="liste">${l.map((e) => { const x = th['grammatik/' + e.id]; return `<li><a href="#/grammatik/${esc(e.id)}"><span class="chip">${esc(e.niveau || 'C1')}</span><span class="l-text"><b>${esc(e.titel)}</b><small>${e.uebungen || 0} Übungen${x ? ` · ${Math.round((x.r / x.n) * 100)} % richtig` : ''}</small></span>${SYM.weiter}</a></li>`; }).join('')}</ul>`;
  } else if (id === 'hoeren') {
    const l = await liste('hoeren');
    html = `<p class="einleitung">Wie in der Prüfung: Du liest die Aufgaben, hörst den Text so oft wie dort erlaubt – und siehst den Text erst nach der Abgabe.</p>
      <ul class="liste">${l.map((e) => `<li><a href="#/hoeren/${esc(e.id)}"><span class="chip">${esc(e.teil || '')}</span><span class="l-text"><b>${esc(e.titel)}</b><small>${esc(e.art || '')} · ${Math.max(1, Math.round((e.dauer_s || 60) / 60))} Min. · ${e.abspielen === 2 ? '2×' : '1×'} hören</small></span>${erledigt['hoeren/' + e.id] ? `<span class="erledigt">${SYM.haken}</span>` : SYM.weiter}</a></li>`).join('')}</ul>`;
  } else if (id === 'lesen') {
    const l = await liste('lesen');
    html = `<p class="einleitung">Kommentare, Sachtexte und Literatur – mit Aufgaben im Prüfungsformat.</p>
      <ul class="liste">${l.map((e) => `<li><a href="#/lesen/${esc(e.id)}"><span class="chip">${esc(e.art || '')}</span><span class="l-text"><b>${esc(e.titel)}</b><small>${e.zeit_min || 10} Min. · ${e.aufgaben || 0} Aufgaben</small></span>${erledigt['lesen/' + e.id] ? `<span class="erledigt">${SYM.haken}</span>` : SYM.weiter}</a></li>`).join('')}</ul>
      <div class="karte klein">${SYM.idee}<div><b>Buch-Quintessenz</b><p class="leise">Ein Buch auf seine Kernidee bringen: Vorlage kopieren und in der Claude-App mit dem Buchtitel einfügen.</p><button class="knopf zweit" data-vorlage="buch_quintessenz">${SYM.kopie} Vorlage kopieren</button></div></div>`;
  } else if (id === 'schreiben' || id === 'sprechen') {
    const l = await liste('themen');
    html = `<p class="einleitung">${id === 'schreiben' ? 'Erst Ideen sammeln (Perspektiven, Pro und Contra, Redemittel), dann mit Timer schreiben. Den Text kannst du zur Korrektur kopieren.' : 'Ideen sammeln, Vortrag mit Timer halten, dich selbst aufnehmen und anhören. Nichts wird hochgeladen.'}</p>
      ${id === 'schreiben' ? '<button class="knopf zweit breit" data-umformen>Umformulieren üben (Schreiben Teil 1)</button>' : ''}
      <div class="zwei">${Object.entries((await ladeIndex()).sammlungen || {}).map(([sid, s]) => `<a class="karte klein" href="#/sammlung/${esc(sid)}/${id}">${sid === 'warum-c2' ? SYM.stern : SYM.idee}<div><b>${esc(sid === 'warum-c2' ? 'Warum C2? 20 Sätze' : s.titel)}</b><p class="leise">${s.anzahl} ${sid === 'warum-c2' ? 'Formulierungen mit C2-Wendung' : 'Redemittel nach Funktion'}</p></div></a>`).join('')}</div>
      <ul class="liste">${l.map((e) => `<li><a href="#/thema/${esc(e.id)}/${id}"><span class="l-text"><b>${esc(e.thema || e.titel)}</b><small>${erledigt[`${id}/${e.id}`] ? 'erledigt' : 'Ideen · Redemittel · Musterbeitrag'}</small></span>${erledigt[`${id}/${e.id}`] ? `<span class="erledigt">${SYM.haken}</span>` : SYM.weiter}</a></li>`).join('')}</ul>`;
  } else if (id === 'wortschatz') {
    const l = await liste('wortschatz');
    html = `<p class="einleitung">Fremdwörter, Redewendungen, Nomen-Verb-Verbindungen, Rektion und Genus – als Karten und als Drill.</p>
      <ul class="liste">${l.map((e) => `<li><a href="#/wortschatz/${esc(e.id)}"><span class="l-text"><b>${esc(e.titel)}</b><small>${e.eintraege || 0} Einträge</small></span>${SYM.weiter}</a></li>`).join('')}</ul>`;
  }
  v.innerHTML = `${kopf(b.name, '#/bereiche', id)}<div class="bereich-seite" data-bereich="${id}">${html || '<p class="karte">Hier kommen bald Inhalte.</p>'}</div>`;
  v.querySelector('[data-gemischt]')?.addEventListener('click', () => gemischt('grammatik'));
  v.querySelector('[data-umformen]')?.addEventListener('click', () => gemischt('grammatik', (u) => u.aus === 'umformen' || u.typ === 'umformen', 'Umformulieren (Schreiben Teil 1)', '#/bereich/schreiben'));
  v.querySelector('[data-vorlage]')?.addEventListener('click', (e) => kopiereVorlage(e.target.closest('button'), 'buch_quintessenz', {}));
  if (v.querySelector('[data-vorlage]')) vorlagenVorladen();
}
async function gemischt(bereichId, filter = () => true, titel = 'Grammatik gemischt', zurueck = '#/bereich/grammatik') {
  const v = view(); v.innerHTML = '<p class="laden">Einen Moment …</p>';
  const { kandidatenAus, sitzung } = await U();
  const kand = []; for (const e of await liste(bereichId)) kand.push(...kandidatenAus(await lade(e.datei)).filter((k) => filter(k.u)));
  const start = () => sitzung(v, { titel, bereich: bereichId, eintraege: waehle(kand, 10), modus: einst().modus, zurueck, nochmal: start });
  start();
}
// ---------- Grammatik-Thema mit Tafel ----------
async function grammatikThema(id) {
  nav('bereiche'); const v = view();
  const e = (await liste('grammatik')).find((x) => x.id === id); if (!e) return bereich('grammatik');
  const [d, { kandidatenAus, sitzung }] = await Promise.all([lade(e.datei), U()]); const kand = kandidatenAus(d); const st = poolStand(kand); const m = einst().modus;
  const falle = (f) => typeof f === 'string' ? `<li>${esc(f)}</li>` : `<li><span class="falsch">${SYM.kreuz}${esc(f.falsch)}</span><span class="richtig">${SYM.haken}${esc(f.richtig)}</span>${f.warum ? `<small>${esc(f.warum)}</small>` : ''}</li>`;
  v.innerHTML = `${kopf(d.titel, '#/bereich/grammatik', 'grammatik')}<div class="bereich-seite" data-bereich="grammatik">
    <section class="tafel" aria-label="Tafel"><span class="ueber">${SYM.tafel} Tafel · ${esc(d.niveau || '')}</span><ol>${(d.tafel || []).map((z) => `<li>${esc(z)}</li>`).join('')}</ol></section>
    ${d.beispiele?.length ? `<section class="karte"><h3>Beispiele</h3><ul class="beispiele">${d.beispiele.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></section>` : ''}
    ${d.fallen?.length ? `<section class="karte"><h3>Typische Fallen</h3><ul class="fallen">${d.fallen.map(falle).join('')}</ul></section>` : ''}
    <section class="karte"><p class="leise">${st.gesehen} von ${st.gesamt} Übungen gesehen${st.quote != null ? ` · ${Math.round(st.quote * 100)} % richtig` : ''}</p>${MODI(m)}<button class="knopf haupt breit" data-los>${SYM.play} 10 Übungen</button></section></div>`;
  modusSchalter(v.querySelector('.karte:last-child'));
  const start = () => sitzung(v, { titel: d.titel, bereich: 'grammatik', eintraege: waehle(kand, 10), modus: einst().modus, zurueck: `#/grammatik/${id}`, nochmal: start });
  v.querySelector('[data-los]').addEventListener('click', start);
}
// ---------- Vorlagen (KI-Korrektur, Buch-Quintessenz) ----------
let VORLAGEN = null;
export const vorlagenVorladen = () => lade('vorlagen.json').then((v) => { VORLAGEN = v; }).catch(() => {});
export async function kopiereVorlage(knopf, art, felder) {
  let text = '';
  if (!VORLAGEN) { try { VORLAGEN = await lade('vorlagen.json'); } catch { /* Platzhalter unten */ } }   // iPhone: vorab geladen, damit das Kopieren im selben Tipp passiert
  text = VORLAGEN?.[art]?.text || '';
  if (!text) text = 'Bitte korrigiere meinen Text auf C2-Niveau.\n\n{TEXT}';
  for (const [k, w] of Object.entries(felder)) text = text.split(`{${k}}`).join(w || '');
  let ok = false; try { await navigator.clipboard.writeText(text); ok = true; } catch { /* Fallback */ }
  if (!ok) { const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.append(t); t.select(); try { ok = document.execCommand('copy'); } catch { ok = false; } t.remove(); }
  if (knopf) { const alt = knopf.innerHTML; knopf.innerHTML = ok ? `${SYM.haken} Kopiert` : 'Kopieren nicht möglich'; setTimeout(() => { knopf.innerHTML = alt; }, 1800); }
  document.body.dataset.zwischenablage = text;   // für Tests und als Rückfall
  return text;
}
// ---------- Mehr ----------
async function mehr() {
  nav('mehr'); const e = einst(); const v = view();
  const ziele = { woche: [3, 5, 7, 10], monat: [10, 20, 30] };
  v.innerHTML = `${kopf('Mehr')}
    <a class="karte klein w-mehr" href="#/wuensche">${SYM.wunsch}<div><b>Wünsche an Claude</b><p class="leise">Etwas klappt nicht, soll feiner werden oder fehlt dir? Schreib es hier – Claude liest es und verbessert die App.</p></div>${walkiePunkt()}${SYM.weiter}</a>
    <section class="karte"><h3>${SYM.ziel} Ziel</h3><div class="segment" data-zielart>${['woche', 'monat'].map((a) => `<button data-art="${a}" aria-pressed="${e.ziel.art === a}">${a === 'woche' ? 'Woche' : 'Monat'}</button>`).join('')}</div>
      <div class="chips" data-zielwert>${ziele[e.ziel.art].map((n) => `<button class="chip-knopf" data-wert="${n}" aria-pressed="${e.ziel.wert === n}">${n} Einheiten</button>`).join('')}</div>
      <p class="leise">Eine Einheit ist eine Runde (ca. 10 Minuten), ein Hör- oder Lesetext, eine Schreib- oder Sprechaufgabe oder eine Quiz-Runde. Ein Ziel ist eine Einladung, keine Pflicht.</p></section>
    <section class="karte"><h3>Standard-Modus</h3>${MODI(e.modus)}</section>
    <section class="karte"><h3>${SYM.glocke} Erinnerung</h3><div id="erinnerung"><p class="leise">Lädt …</p></div></section>
    <a class="karte klein" href="#/links">${SYM.link}<div><b>Videos &amp; Links</b><p class="leise">Ausgewählte Kanäle und Seiten zum Weiterlernen</p></div>${SYM.weiter}</a>
    <section class="karte"><h3>Offline</h3><p class="leise">Übungen und Texte werden nach dem ersten Öffnen im Hintergrund gespeichert und laufen dann ohne Internet. Hördateien kommen beim ersten Abspielen dazu – oder hier alle auf einmal (ca. 11 MB, besser im WLAN).</p><button class="knopf zweit" data-offline>Alles offline speichern</button> <span class="leise" data-offline-status></span></section>
    <section class="karte"><h3>Deine Daten</h3><p class="leise">Dein Lernstand bleibt auf diesem Gerät. Es gibt kein Konto, und hochgeladen wird nur, was du unter „Wünsche“ selbst abschickst. Sichere deinen Stand ab und zu als Datei – zum Beispiel bevor du die App zum Home-Bildschirm hinzufügst oder das Gerät wechselst.</p>
      <div class="knopfzeile"><button class="knopf zweit" data-sichern>${SYM.kopie} Stand sichern</button><label class="knopf zweit">Stand laden<input type="file" accept="application/json,.json" data-laden hidden></label></div>
      <p class="leise" data-daten-status></p><button class="knopf zweit warn" data-loeschen>Fortschritt löschen</button></section>
    <p class="leise mitte">Feinschliff ${VERSION}</p>`;
  v.querySelector('[data-zielart]').addEventListener('click', (ev) => { const b = ev.target.closest('[data-art]'); if (!b) return; const art = b.dataset.art; setzeEinst({ ziel: { art, wert: art === 'woche' ? 5 : 20 } }); mehr(); });
  v.querySelector('[data-zielwert]').addEventListener('click', (ev) => { const b = ev.target.closest('[data-wert]'); if (!b) return; setzeEinst({ ziel: { ...einst().ziel, wert: +b.dataset.wert } }); mehr(); });
  modusSchalter(v.querySelectorAll('section.karte')[1]);
  v.querySelector('[data-offline]').addEventListener('click', async (ev) => { const s = v.querySelector('[data-offline-status]'); ev.target.disabled = true; s.textContent = 'Speichert …'; try { const n = await allesVorladen({ audio: true }); s.textContent = `${n} Dateien gespeichert.`; } catch { s.textContent = 'Gerade nicht möglich.'; } ev.target.disabled = false; });
  v.querySelector('[data-loeschen]').addEventListener('click', () => { if (confirm('Wirklich allen Fortschritt auf diesem Gerät löschen?')) { speicher.allesLoeschen(); location.hash = '#/heute'; } });
  const ds = v.querySelector('[data-daten-status]');
  v.querySelector('[data-sichern]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(speicher.export(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `feinschliff-stand-${tag()}.json`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); ds.textContent = 'Datei erstellt. Bewahre sie in „Dateien“ auf.';
  });
  v.querySelector('[data-laden]').addEventListener('change', async (ev) => {
    const f = ev.target.files?.[0]; if (!f) return;
    try { const n = speicher.import(JSON.parse(await f.text())); ds.textContent = `${n} Einträge geladen.`; setTimeout(() => { location.hash = '#/fortschritt'; }, 600); }
    catch { ds.textContent = 'Diese Datei passt nicht. Bitte eine Sicherung aus Feinschliff wählen.'; }
  });
  import('./erinnerung.js').then((m) => m.fuelle(document.getElementById('erinnerung'))).catch(() => { document.getElementById('erinnerung').innerHTML = '<p class="leise">Gerade nicht verfügbar.</p>'; });
}

// ---------- Router ----------
let hierHash = null, vorherHash = '#/heute';
// Neue Fassung im Hintergrund aktiv (Service Worker gewechselt): beim nächsten Seitenwechsel neu laden, nie mitten in einer Übung –
// sonst liefen alte, schon geladene Module mit neuen gemischt.
let neuLaden = false;
async function route() {
  if (neuLaden) { neuLaden = false; location.reload(); return; }
  dispatchEvent(new Event('fs-weg'));   // laufendes Audio/Mikrofon der alten Seite beenden
  const h = location.hash || '#/heute'; if (hierHash && hierHash !== h) vorherHash = hierHash; hierHash = h;
  const teile = (location.hash.replace(/^#\/?/, '') || 'heute').split('/').map(decodeURIComponent);
  const [a, b, c] = teile; document.body.dataset.seite = a;
  window.scrollTo(0, 0);
  try {
    switch (a) {
      case 'heute': return await heute();
      case 'bereiche': return bereiche();
      case 'bereich': return await bereich(b);
      case 'grammatik': return await grammatikThema(b);
      case 'hoeren': nav('bereiche'); return (await import('./hoeren.js')).seite(view(), b);
      case 'lesen': nav('bereiche'); return (await import('./lesen.js')).seite(view(), b);
      case 'thema': nav('bereiche'); return (await import('./schreiben.js')).seite(view(), b, c || 'schreiben');
      case 'wortschatz': nav('bereiche'); return (await import('./wortschatz.js')).seite(view(), b);
      case 'quiz': nav('quiz'); return (await import('./quiz.js')).seite(view());
      case 'pruefung': nav('bereiche'); return (await import('./pruefung.js')).seite(view(), b, c);
      case 'fortschritt': nav('fortschritt'); return (await import('./fortschritt.js')).seite(view());
      case 'links': nav('mehr'); return (await import('./links.js')).seite(view());
      case 'sammlung': nav('bereiche'); return (await import('./schreiben.js')).sammlung(view(), b, `#/bereich/${c === 'sprechen' ? 'sprechen' : 'schreiben'}`);
      case 'mehr': return await mehr();
      case 'wuensche': nav('mehr'); return (await import('./wuensche.js')).seite(view(), b, /^#\/(wuensche|$)/.test(vorherHash) ? '#/mehr' : vorherHash);
      default: return await heute();
    }
  } catch (e) {
    // Rückfall: passt ein nachgeladenes Modul nicht zu den schon geladenen (Update mitten in der Sitzung), einmal neu laden
    if (e instanceof SyntaxError && navigator.serviceWorker?.controller) { let einmal = false; try { const k = VERSION + location.hash; einmal = sessionStorage.getItem('fs-neu') !== k; sessionStorage.setItem('fs-neu', k); } catch { /* ohne Speicher kein Neuladen */ } if (einmal) { location.reload(); return; } }
    console.error(e);
    view().innerHTML = `${kopf('Hoppla')}<p class="karte">Diese Seite konnte nicht geladen werden${navigator.onLine ? '' : ' (offline)'}.</p>`;
  }
}
window.addEventListener('hashchange', route);
document.addEventListener('click', (ev) => {
  const a = ev.target.closest?.('a[href^="#"]'); if (!a || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey) return;
  const ziel = a.getAttribute('href'); const jetzt = location.hash || '#/heute';
  if (ziel === jetzt || (ziel === '#/heute' && !location.hash)) { ev.preventDefault(); route(); }
});
route();
try { navigator.storage?.persist?.().catch(() => {}); } catch { /* ältere Browser */ }   // Fortschritt vor automatischem Löschen schützen
if (speicher.lies('erinnerung', {}).an) import('./erinnerung.js').then((m) => m.planen()).catch(() => {});   // geplante Erinnerungen auffrischen (nur wenn eingeschaltet)
// Wünsche-Kanal: Wartendes nachsenden und nach Rückfragen/Antworten schauen – erst nach dem Start, höchstens alle 3 Stunden
function walkiePruefen(immer = false) {
  if (navigator.onLine === false) return; const w = walkie();
  if (!immer && !w.warte?.length && Date.now() - (w.geprueft || 0) < 3 * 3600e3) return;
  import('./wuensche.js').then((m) => m.pruefe()).then(walkieAuffrischen).catch(() => {});
}
setTimeout(walkiePruefen, 2500);
setTimeout(() => U().catch(() => {}), 1200);   // Übungs-Engine vorab holen, damit „Los geht’s“ sofort startet
addEventListener('online', () => { if (walkie().warte?.length) walkiePruefen(true); });
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !/[?&]nosw\b/.test(location.search)) {
  const hatteWorker = !!navigator.serviceWorker.controller;   // beim allerersten Einrichten nicht neu laden
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hatteWorker) neuLaden = true; });
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});   // Inhalte (JSON, Audio) landen erst beim Öffnen im Speicher – oder über „Alles offline speichern“
  });
}
