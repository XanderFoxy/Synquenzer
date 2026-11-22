// Kaninchenbau 0.1 – Lern-App: Startfragen → 3–5 Äste, je Ast 3 Stufen mit kurzen Wissensfragen und Quellen,
// Baum mit Querverbindungen. Alles bleibt auf dem Gerät (speicher.js). Offline über sw.js.
import { GEBIETE, AESTE, QUELLEN, BRUECKEN, STUFEN, TYP_NAME, SPRACHE, TYP_BRUECKE, gebietVon, brueckenVon } from './inhalt.js';
import { naechste, auswerten, fortschritt } from './profil.js';
import * as speicher from './speicher.js';

export const VERSION = '0.1.0';
const GEPRUEFT = '22.11.2026';

let Z = speicher.laden();
const sichern = () => speicher.sichern(Z);
const $ = (s, w = document) => w.querySelector(s);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const zufall = () => (crypto.getRandomValues(new Uint8Array(1))[0] & 1);

// ---------- Symbole ----------
const IC = {
  moehre: '<svg class="sym" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.6 8.4c-2.6-2.6-6.4.4-8.3 4.3L4 20l7.3-3.3c3.9-1.9 6.9-5.7 4.3-8.3z" fill="#ea580c"/><path d="M9.6 12.6l1.5 1.5M7.9 15.7l1.3 1.3M12.2 10.3l1.2 1.2" stroke="#9a3412" stroke-width="1.2" stroke-linecap="round"/><path d="M15.6 8.4l1.1-5M15.6 8.4l5-1.1M15.6 8.4l3.3-3.3" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/></svg>',
  hase: (cls = '', rand = false) => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"${rand ? ' stroke="#3a2f22" stroke-width="1.4"' : ''}><ellipse cx="14" cy="11" rx="4" ry="10" fill="#fff"/><ellipse cx="26" cy="11" rx="4" ry="10" fill="#fff"/><ellipse cx="14" cy="11.5" rx="1.7" ry="6.5" fill="#f9a8d4" stroke="none"/><ellipse cx="26" cy="11.5" rx="1.7" ry="6.5" fill="#f9a8d4" stroke="none"/><circle cx="20" cy="26" r="11" fill="#fff"/><circle cx="16" cy="24.5" r="1.6" fill="#1f1b16" stroke="none"/><circle cx="24" cy="24.5" r="1.6" fill="#1f1b16" stroke="none"/><ellipse cx="20" cy="29" rx="2" ry="1.4" fill="#f472b6" stroke="none"/></svg>`,
  stern: (an) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="${an ? 'stern-an' : 'stern-aus'}" stroke-width="1.8" stroke-linejoin="round" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>`,
  schloss: '<svg class="sym" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  pfeil: '<svg class="sym" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  raus: '<svg class="sym" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
};
const sterne = (n) => `<span class="sterne">${[1, 2, 3].map((i) => IC.stern(i <= n)).join('')}</span>`;

// ---------- Lernstand ----------
const info = (id, n) => Z.stufen[id]?.[n] || null;
const geschafft = (id, n) => !!info(id, n)?.geschafft;
const frei = (id, n) => n === 1 || geschafft(id, n - 1);
const stand = (id) => [1, 2, 3].filter((n) => geschafft(id, n)).length;
const standName = (id) => (stand(id) ? STUFEN[stand(id) - 1].name : 'Neu');
const meine = () => Z.profil?.aeste || [];
const istMein = (id) => meine().includes(id);
const moehren = () => Object.values(Z.stufen).reduce((s, st) => s + Object.values(st).reduce((t, e) => t + e.beste + (e.geschafft ? 2 : 0), 0), 0);
const geschafftZahl = (ids) => ids.reduce((s, id) => s + stand(id), 0);
function naechsterSchritt() {
  for (const id of meine()) for (const n of [1, 2, 3]) if (frei(id, n) && !geschafft(id, n)) return { id, n };
  return null;
}
const punkteHtml = (id) => `<span class="punkte" aria-label="${stand(id)} von 3 Stufen geschafft">${[1, 2, 3].map((n) => `<i${geschafft(id, n) ? ' class="an"' : ''}></i>`).join('')}</span>`;

// ---------- Bausteine ----------
const linkText = { buch: 'Online lesen', artikel: 'Lesen', video: 'Ansehen', uebung: 'Ausprobieren' };
function quelleHtml(q) {
  const host = q.url ? new URL(q.url).hostname.replace(/^www\./, '') : '';
  const wo = [q.wo, q.isbn ? 'ISBN ' + q.isbn : ''].filter(Boolean).join(' · ');
  return `<li class="quelle"><span class="art">${esc(TYP_NAME[q.typ])} · ${esc(SPRACHE[q.sprache] || '')}</span><b>${esc(q.titel)}</b><span class="wer">${esc(q.wer)}</span>`
    + (wo ? `<span class="wo">${esc(wo)}</span>` : '') + (q.notiz ? `<span class="notiz">${esc(q.notiz)}</span>` : '')
    + (q.url ? `<a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer">${linkText[q.typ]} auf ${esc(host)} ${IC.raus}</a>` : '') + '</li>';
}
function astKarte(id, zusatz = '') {
  const a = AESTE[id], g = gebietVon(id);
  return `<a class="karte ast-karte g-${g.id}" href="#ast/${id}" data-ast="${id}"><span class="band" aria-hidden="true"></span><span class="mitte-teil"><b>${esc(a.titel)}</b><small>${esc(g.name)} · Stand: ${esc(standName(id))}${zusatz}</small>${punkteHtml(id)}</span><span class="rechts">${IC.pfeil}</span></a>`;
}
function brueckeHtml(b, vonId) {
  const zu = vonId ? b.zu : b.b, an = vonId ? null : b.a;
  const titel = vonId ? AESTE[zu].titel : `${AESTE[an].kurz} ↔ ${AESTE[zu].kurz}`;
  return `<li><a class="bruecke" href="#ast/${vonId ? zu : an}"><span class="typ t-${b.typ}">${esc(TYP_BRUECKE[b.typ])}</span><span><b>${esc(titel)}</b><small>${esc(b.was)}: ${esc(b.text)}</small></span></a></li>`;
}
function balken(anteil, label) {
  const p = Math.round(Math.max(0, Math.min(1, anteil)) * 100);
  return `<div class="balken" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><span class="fuell" data-w="${p}"></span><span class="hase-mini" data-l="${p}">${IC.hase('', true)}</span></div>`;
}

// ---------- Seiten ----------
function start() {
  if (!Z.profil) {
    const weiter = Z.lauf && Object.keys(Z.lauf.antw).length;
    return { titel: 'Kaninchenbau', bereich: 'start', html: `
<section class="held"><h2>Kaninchenbau</h2><p class="lead">Lernen, was dich wirklich interessiert – Schritt für Schritt tiefer, mit Querverbindungen und echten Quellen.</p>
<a class="knopf gross" href="#fragen">${weiter ? 'Weiter mit den Startfragen' : 'Los geht’s'}</a>${IC.hase('hase')}</section>
<div class="karte"><h3>So funktioniert’s</h3><ol>
<li>Ein paar einfache Fragen mit zwei bunten Knöpfen: Was reizt dich?</li>
<li>Daraus gräbt die App 3 bis 5 Gänge für dich – zum Beispiel Reisen → Rom → Caesar.</li>
<li>Jeder Gang hat drei Stufen wie ein Sprachkurs: Einsteiger, Fortgeschritten, Profi. Für jede richtige Antwort gibt es eine Möhre.</li>
<li>Querverbindungen zeigen, wo sich Gänge treffen: gleiche Zeit, gleiche Personen, gleiche Orte.</li>
<li>An jedem Gang stehen echte Quellen: Bücher, Artikel, Videos.</li></ol>
<p class="leise klein">Alles bleibt auf deinem Gerät. Getrennt von „Wie ich ticke“ – nur die Fragen-Technik ist dieselbe.</p></div>` };
  }
  const ids = meine(), schritt = naechsterSchritt(), alle = ids.length * 3, fertig = geschafftZahl(ids);
  const weiterHtml = schritt
    ? `<a class="knopf gross" href="#lernen/${schritt.id}/${schritt.n}" data-weiter>Weiter graben: ${esc(AESTE[schritt.id].kurz)} · Stufe ${schritt.n}</a>`
    : '<a class="knopf gross" href="#baum">Alles geschafft – neuen Gang suchen</a>';
  const gruppen = GEBIETE.map((g) => {
    const da = g.aeste.filter(istMein); if (!da.length) return '';
    return `<div class="gebiet-kopf"><h3>${esc(g.name)}</h3></div>${da.map((id) => astKarte(id)).join('')}`;
  }).join('');
  const neu = []; const gesehen = new Set(ids);
  for (const id of ids) for (const b of brueckenVon(id)) if (!gesehen.has(b.zu)) { gesehen.add(b.zu); neu.push({ ...b, von: id }); }
  const andere = Object.keys(AESTE).filter((id) => !gesehen.has(id) && Z.stufen[id]);
  return { titel: 'Kaninchenbau', bereich: 'start', html: `
<section class="held"><h2>Dein Bau</h2><p>${ids.length} Gänge · ${fertig} von ${alle} Stufen geschafft</p>
<div class="held-zahlen"><span>${moehren()} Möhren</span><span>${Math.round(alle ? (fertig / alle) * 100 : 0)} % gegraben</span></div>
${weiterHtml}${IC.hase('hase')}</section>
${gruppen}
${neu.length ? `<h3>Neue Gänge entdecken</h3><p class="leise klein">Von deinen Gängen führen Querverbindungen hierher:</p><ul class="bruecken">${neu.slice(0, 6).map((b) => brueckeHtml(b, b.von)).join('')}</ul>` : ''}
${andere.length ? `<h3>Weitere Gänge mit Lernstand</h3>${andere.map((id) => astKarte(id)).join('')}` : ''}
<div class="reihe"><a class="knopf zweit" href="#baum">Baum ansehen</a><a class="knopf zweit" href="#quellen">Alle Quellen</a></div>` };
}

let frischGegraben = false;
function startfragen() {
  if (!Z.lauf) {
    // Bau steht schon (z. B. Zurückwischen nach den Startfragen): keinen leeren Lauf anlegen, nichts überschreiben.
    // Neu beantworten geht nur bewusst über „Mehr“ (Tat neu-fragen legt den Lauf an).
    if (Z.profil) return { umleiten: 'start' };
    Z.lauf = { antw: {} }; sichern();
  }
  const antw = Z.lauf.antw, f = naechste(antw);
  if (!f) { abschliessen(); return { umleiten: 'profil' }; }
  const fs = fortschritt(antw);
  const art = { gebiet: `Gebiet ${GEBIETE.findIndex((g) => g.id === f.gebiet) + 1} von ${GEBIETE.length}`, notfall: 'Entweder – oder', paar: 'Entweder – oder', zusatz: 'Noch ein Gang?', kaninchen: 'Kaninchenbau-Frage' }[f.art];
  return { titel: 'Startfragen', bereich: 'start', zurueck: 'start', html: `
<section class="spiel rein" data-frage="${esc(f.id)}">
<div class="stand">${balken(fs.n / fs.gesamt, 'Fortschritt der Startfragen')}<span class="zahl">${fs.n + 1}/${fs.gesamt}</span></div>
<p class="frage-art">${esc(art)}</p>
<p class="frage" id="frage-text">${esc(f.text)}</p>
${f.unter ? `<p class="frage-unter">${esc(f.unter)}</p>` : ''}
<div class="paar" role="group" aria-labelledby="frage-text">
<button class="wahl links" type="button" data-tat="start-antwort" data-wahl="0">${esc(f.links)}</button>
<span class="oder" aria-hidden="true">oder</span>
<button class="wahl rechts" type="button" data-tat="start-antwort" data-wahl="1">${esc(f.rechts)}</button></div>
<div class="unten">${fs.n ? '<button class="knopf zweit" type="button" data-tat="start-zurueck">Eine Frage zurück</button>' : ''}<span class="leise">Deine Antworten bleiben auf dem Gerät.</span></div>
</section>` };
}
function abschliessen() {
  // Selbst aufgenommene Gänge (alles im alten Bau, was nicht aus den alten Antworten kam) bleiben beim Neu-Beantworten erhalten.
  const alt = Z.profil, vonAlt = alt?.antw ? auswerten(alt.antw) : [];
  const dazu = (alt?.aeste || []).filter((id) => AESTE[id] && !vonAlt.includes(id));
  const aeste = [...new Set([...auswerten(Z.lauf.antw), ...dazu])];
  Z.profil = { aeste, antw: Z.lauf.antw, datum: new Date().toISOString() };
  Z.lauf = null; sichern(); speicher.dauerhaft(); frischGegraben = true;
}

function profilSeite() {
  if (!Z.profil) return { umleiten: 'start' };
  const ids = meine();
  const innen = BRUECKEN.filter((b) => ids.includes(b.a) && ids.includes(b.b));
  const erster = naechsterSchritt();
  return { titel: 'Dein Bau', bereich: 'start', zurueck: 'start', konfetti: frischGegraben && (frischGegraben = false, true), html: `
<section class="ende"><h2>Dein Bau ist gegraben!</h2><p class="lead">${ids.length} Gänge passen zu deinen Antworten.</p></section>
${ids.map((id) => astKarte(id)).join('')}
${innen.length ? `<h3>Hier treffen sich deine Gänge</h3><ul class="bruecken">${innen.map((b) => brueckeHtml(b)).join('')}</ul>` : ''}
<div class="reihe">${erster ? `<a class="knopf haupt gross" href="#lernen/${erster.id}/${erster.n}">Erste Stufe starten</a>` : ''}<a class="knopf zweit" href="#start">Zum Bau</a><a class="knopf zweit" href="#baum">Baum ansehen</a></div>` };
}

function astSeite(id) {
  const a = AESTE[id]; if (!a) return { umleiten: 'start' };
  const g = gebietVon(id);
  const steck = [`Zeit: <b>${esc(a.zeit)}</b>`, a.orte.length ? `Orte: <b>${esc(a.orte.join(', '))}</b>` : '', a.personen.length ? `Personen: <b>${esc(a.personen.join(', '))}</b>` : ''].filter(Boolean).map((s) => `<span>${s}</span>`).join('');
  const stufen = STUFEN.map(({ n, name }) => {
    const i = info(id, n), fr = frei(id, n), ok = geschafft(id, n);
    const unter = ok ? `${sterne(i.beste)} geschafft` : i ? `Bestwert ${i.beste} von 3 – ab 2 richtigen geschafft` : fr ? '3 Fragen · ab 2 richtigen geschafft' : `Erst Stufe ${n - 1} schaffen`;
    const knopf = fr ? `<a class="knopf ${ok || i ? 'zweit' : 'haupt'}" href="#lernen/${id}/${n}">${ok || i ? 'Nochmal' : 'Starten'}</a>` : `<span class="knopf zweit" aria-disabled="true">${IC.schloss}<span class="sr">gesperrt</span></span>`;
    return `<li class="${fr ? '' : 'zu'}"><span class="nr">${n}</span><span class="txt"><b>${esc(name)}</b><small>${unter}</small></span>${knopf}</li>`;
  }).join('');
  return { titel: a.kurz, bereich: 'start', zurueck: 'start', html: `
<section class="ast-kopf g-${g.id}"><small>${esc(g.name)} · Stand: ${esc(standName(id))}</small><h2>${esc(a.titel)}</h2><p>${esc(a.intro)}</p></section>
<div class="steckbrief">${steck}</div>
${istMein(id) || !Z.profil ? '' : `<button class="knopf haupt voll" type="button" data-tat="aufnehmen" data-ast="${id}">In meinen Bau aufnehmen</button>`}
<h3>Stufen</h3><ol class="stufen g-${g.id}">${stufen}</ol>
<h3>Querverbindungen</h3><ul class="bruecken">${brueckenVon(id).map((b) => brueckeHtml(b, id)).join('')}</ul>
<h3>Quellen</h3><ul class="quellen">${a.quellen.map((q) => quelleHtml(QUELLEN[q])).join('')}</ul>
<p class="fuss">Quellen geprüft am ${GEPRUEFT}. Bücher mit Verlag und ISBN findest du in jeder Bibliothek oder Buchhandlung.</p>` };
}

let frischRichtig = false;
function lernen(id, nText) {
  const a = AESTE[id], n = Number(nText);
  if (!a || ![1, 2, 3].includes(n)) return { umleiten: 'start' };
  if (!frei(id, n)) return { umleiten: 'ast/' + id };
  if (!Z.quiz || Z.quiz.ast !== id || Z.quiz.stufe !== n) { Z.quiz = { ast: id, stufe: n, ok: [], seiten: [zufall(), zufall(), zufall()], offen: null }; sichern(); }
  const q = Z.quiz, offen = q.offen;
  const i = offen === null ? q.ok.length : q.ok.length - 1;
  if (i >= 3) { beenden(); return { umleiten: `ergebnis/${id}/${n}` }; }
  const F = a.stufen[n - 1].fragen[i], seite = q.seiten[i];
  const opt = seite === 0 ? [F.r, F.x] : [F.x, F.r];
  const richtigeSeite = seite === 0 ? 0 : 1;
  const g = gebietVon(id);
  const knopf = (w) => {
    let k = '';
    if (offen !== null) k = w === offen ? ' gewaehlt' + (w === richtigeSeite ? ' stimmt' : '') : (w === richtigeSeite ? ' richtig-war' : ' weg');
    return `<button class="wahl ${w ? 'rechts' : 'links'}${k}" type="button" data-tat="lern-antwort" data-wahl="${w}"${offen !== null ? ' disabled' : ''}>${esc(opt[w])}</button>`;
  };
  const ok = offen !== null && q.ok[i];
  const rueck = offen === null ? '<p class="leise klein mitte">Tippe auf die Antwort, die du für richtig hältst.</p>'
    : `<div class="rueck${ok ? '' : ' daneben'}" role="status"><p class="gross">${ok ? 'Richtig! +1 Möhre' : 'Knapp daneben'}</p>${ok ? '' : `<p>Richtig ist: <b>${esc(F.r)}</b></p>`}<p><b>Gut zu wissen:</b> ${esc(F.e)}</p></div>
<button class="knopf haupt voll gross" type="button" data-tat="lern-weiter" id="weiter">${i < 2 ? 'Weiter' : 'Auswerten'}</button>`;
  return { titel: `Stufe ${n} · ${a.kurz}`, bereich: 'start', zurueck: 'ast/' + id, fokus: offen !== null ? '#weiter' : null, html: `
<section class="spiel${offen === null ? ' rein' : ''} g-${g.id}" data-frage="${id}-${n}-${i}" data-offen="${offen === null ? '' : offen}">
<div class="stand">${balken((i + (offen === null ? 0 : 1)) / 3, 'Fortschritt der Stufe')}<span class="zahl">Frage ${i + 1}/3</span></div>
<p class="frage-art">${esc(a.kurz)} · Stufe ${n} · ${esc(STUFEN[n - 1].name)}</p>
<p class="frage" id="frage-text">${esc(F.f)}</p>
<div class="paar" role="group" aria-labelledby="frage-text">${knopf(0)}<span class="oder" aria-hidden="true">oder</span>${knopf(1)}</div>
${rueck}
</section>` };
}

let frischKonfetti = false;
function beenden() {
  const { ast: id, stufe: n, ok } = Z.quiz;
  const richtig = ok.filter(Boolean).length, vorher = info(id, n);
  const beste = Math.max(vorher?.beste || 0, richtig);
  const ersterMal = !vorher?.geschafft && richtig >= 2;
  (Z.stufen[id] ||= {})[n] = { beste, versuche: (vorher?.versuche || 0) + 1, geschafft: beste >= 2 };
  let aufgenommen = false;
  if (Z.profil && !istMein(id) && richtig >= 2) { Z.profil.aeste.push(id); aufgenommen = true; }
  Z.letztes = { ast: id, stufe: n, richtig, neu: !vorher || richtig > vorher.beste, ersterMal, aufgenommen };
  Z.quiz = null; sichern(); frischKonfetti = ersterMal;
}

function ergebnis(id, nText) {
  const a = AESTE[id], n = Number(nText);
  if (!a || ![1, 2, 3].includes(n)) return { umleiten: 'start' };
  const l = Z.letztes && Z.letztes.ast === id && Z.letztes.stufe === n ? Z.letztes : { richtig: info(id, n)?.beste || 0, neu: false, ersterMal: false, aufgenommen: false };
  const ok = l.richtig >= 2;
  const kopf = ok ? (l.richtig === 3 ? 'Perfekt!' : 'Stufe geschafft!') : 'Fast!';
  const weiter = n < 3 && frei(id, n + 1) ? `<a class="knopf haupt gross" href="#lernen/${id}/${n + 1}">Weiter: Stufe ${n + 1} · ${esc(STUFEN[n].name)}</a>` : '';
  const tipp = brueckenVon(id).sort((p, q) => stand(p.zu) - stand(q.zu))[0];
  const q = QUELLEN[a.stufen[n - 1].q];
  return { titel: 'Ergebnis', bereich: 'start', zurueck: 'ast/' + id, konfetti: frischKonfetti && (frischKonfetti = false, true), html: `
<section class="ende" data-ergebnis="${l.richtig}">
<div class="sterne" role="img" aria-label="${l.richtig} von 3 richtig">${[1, 2, 3].map((i) => IC.stern(i <= l.richtig)).join('')}</div>
<h2>${kopf}</h2>
<p class="lead">${esc(a.kurz)} · Stufe ${n}: ${l.richtig} von 3 richtig${ok ? '' : ' – ab 2 richtigen ist die Stufe geschafft.'}</p>
<p class="gross-zahl">${IC.moehre}<span>${moehren()}</span></p><p class="leise klein">Möhren gesamt${l.neu && l.richtig ? ' · neuer Bestwert' : ''}</p>
${l.aufgenommen ? `<p><b>Neuer Gang in deinem Bau:</b> ${esc(a.titel)}</p>` : ''}
<div class="reihe">${weiter}<a class="knopf ${ok ? 'zweit' : 'haupt'}" href="#lernen/${id}/${n}">Nochmal</a><a class="knopf zweit" href="#ast/${id}">Zum Gang</a></div>
<div class="karte"><h3>Zum Vertiefen</h3><ul class="quellen">${quelleHtml(q)}</ul></div>
${tipp ? `<div class="karte weich"><h3>Kaninchenbau-Tipp</h3><p class="klein leise">Von hier führt ein Gang weiter:</p><ul class="bruecken">${brueckeHtml(tipp, id)}</ul></div>` : ''}
</section>` };
}

function baum() {
  const mein = new Set(meine());
  const liste = GEBIETE.map((g) => {
    const st = Math.max(0, ...g.aeste.map(stand));
    return `<li class="baum-gebiet g-${g.id}"><span class="baum-knoten"></span><b>${esc(g.name)}</b><small>${st ? 'Stand: ' + esc(STUFEN[st - 1].name) : ''}</small></li>`
      + g.aeste.map((id) => `<li><a class="baum-ast g-${g.id}${mein.has(id) ? ' mein' : ''}" href="#ast/${id}" data-ast="${id}"><span class="baum-knoten"></span><span class="name">${esc(AESTE[id].kurz)}</span>${punkteHtml(id)}</a></li>`).join('');
  }).join('');
  const legende = Object.keys(TYP_BRUECKE).map((t) => `<span><svg viewBox="0 0 36 10" aria-hidden="true"><path class="baum-bogen bogen-${t}" d="M2 5H34"/></svg>${esc(TYP_BRUECKE[t])}</span>`).join('');
  return { titel: 'Baum', bereich: 'baum', nach: baumZeichnen, html: `
<h2>Dein Baum</h2><p class="leise">${Z.profil ? 'Ausgefüllte Punkte sind deine Gänge.' : 'Noch kein Profil – alle Gänge zum Stöbern.'} Die Bögen rechts sind Querverbindungen. Tippe auf einen Gang.</p>
<div class="baum" id="baum"><svg class="baum-linien" aria-hidden="true" focusable="false"></svg><ol class="baum-liste">${liste}</ol></div>
<div class="legende">${legende}</div>
<h3>Alle Querverbindungen</h3><ul class="bruecken">${BRUECKEN.map((b) => brueckeHtml(b)).join('')}</ul>` };
}
let baumBeobachter = null;
function baumZeichnen() {
  const box = $('#baum'); if (!box) return;
  const svg = box.querySelector('svg'), r0 = box.getBoundingClientRect();
  if (!r0.width) return;
  const mitte = (el) => { const k = el.querySelector('.baum-knoten').getBoundingClientRect(); return { x: k.left - r0.left + k.width / 2, y: k.top - r0.top + k.height / 2 }; };
  const y = {}; let p = '';
  const gebiete = [...box.querySelectorAll('.baum-gebiet')], aeste = [...box.querySelectorAll('.baum-ast')];
  const stamm = mitte(gebiete[0]).x, oben = mitte(gebiete[0]).y, unten = mitte(aeste[aeste.length - 1]).y;
  p += `<path class="baum-pfad baum-stamm" d="M${stamm} ${oben}V${unten - 14}Q${stamm} ${unten} ${stamm + 14} ${unten}"/>`;
  for (const el of aeste) {
    const m = mitte(el); y[el.dataset.ast] = m.y;
    const g = el.className.match(/g-(\w+)/)[1];
    p += `<path class="baum-pfad g-${g}" d="M${stamm} ${m.y - 14}Q${stamm} ${m.y} ${stamm + 14} ${m.y}H${m.x - 9}"/>`;
  }
  const bogen = parseFloat(getComputedStyle(box).getPropertyValue('--bogen')) * parseFloat(getComputedStyle(document.documentElement).fontSize) || 100;
  const x0 = r0.width - bogen + 6, mein = new Set(meine());
  // Bogendiagramm: je größer der Abstand, desto weiter der Bogen (geschachtelt statt gebündelt)
  const boegen = BRUECKEN.filter((b) => y[b.a] != null && y[b.b] != null).sort((p1, p2) => Math.abs(y[p1.a] - y[p1.b]) - Math.abs(y[p2.a] - y[p2.b]));
  boegen.forEach((b, rang) => {
    const ya = y[b.a], yb = y[b.b];
    const d = 14 + (rang / Math.max(1, boegen.length - 1)) * (bogen - 26);
    const leise = Z.profil && !mein.has(b.a) && !mein.has(b.b) ? ' leise' : '';
    p += `<path class="baum-bogen bogen-${b.typ}${leise}" d="M${x0} ${ya}C${x0 + d * 1.33} ${ya} ${x0 + d * 1.33} ${yb} ${x0} ${yb}"/>`;
  });
  svg.setAttribute('viewBox', `0 0 ${r0.width} ${r0.height}`);
  svg.innerHTML = p;
  if (!baumBeobachter && 'ResizeObserver' in window) {
    let w = r0.width;
    baumBeobachter = new ResizeObserver(() => { const b = $('#baum'); if (b && Math.abs(b.getBoundingClientRect().width - w) > 1) { w = b.getBoundingClientRect().width; baumZeichnen(); } });
  }
  baumBeobachter?.disconnect(); baumBeobachter?.observe(box);
}

let filter = 'alle';
try { filter = localStorage.getItem('kaninchenbau.filter') || 'alle'; } catch { /* egal */ }
function quellen() {
  const typen = ['alle', 'buch', 'artikel', 'video', 'uebung'];
  if (!typen.includes(filter)) filter = 'alle';
  const name = { alle: 'Alle', buch: 'Bücher', artikel: 'Artikel', video: 'Videos', uebung: 'Zum Üben' };
  const passt = (q) => filter === 'alle' || QUELLEN[q].typ === filter;
  const teile = GEBIETE.map((g) => {
    const inner = g.aeste.map((id) => {
      const qs = AESTE[id].quellen.filter(passt); if (!qs.length) return '';
      return `<a class="quellen-gang" href="#ast/${id}">${esc(AESTE[id].titel)} ${IC.pfeil}</a><ul class="quellen">${qs.map((q) => quelleHtml(QUELLEN[q])).join('')}</ul>`;
    }).join('');
    return inner ? `<h3>${esc(g.name)}</h3>${inner}` : '';
  }).join('');
  const zahl = Object.values(QUELLEN).filter((q) => filter === 'alle' || q.typ === filter).length;
  return { titel: 'Quellen', bereich: 'quellen', halten: true, html: `
<h2>Quellen</h2><p class="leise">Nur echte, prüfbare Titel: Bücher mit Verlag (und ISBN, wo vorhanden), Artikel, Videos und Übungsseiten mit Link. Geprüft am ${GEPRUEFT}. Links brauchen Internet.</p>
<div class="chips" role="group" aria-label="Art der Quelle">${typen.map((t) => `<button class="chip" type="button" data-tat="filter" data-typ="${t}" aria-pressed="${filter === t}">${name[t]}</button>`).join('')}</div>
<p class="leise klein">${zahl} Quellen</p>${teile}` };
}

let loeschFrage = false;
function mehr() {
  const ids = meine();
  const themen = [['auto', 'Wie das Gerät'], ['hell', 'Hell'], ['dunkel', 'Dunkel']];
  return { titel: 'Mehr', bereich: 'mehr', html: `
<h2>Mehr</h2>
<div class="karte"><h3>Darstellung</h3><div class="wahlreihe" role="radiogroup" aria-label="Darstellung">${themen.map(([w, t]) => `<button class="chip" type="button" role="radio" data-tat="thema" data-thema="${w}" aria-checked="${Z.thema === w}" aria-pressed="${Z.thema === w}">${t}</button>`).join('')}</div></div>
<div class="karte"><h3>Dein Profil</h3><p>${Z.profil ? `${ids.length} Gänge · ${geschafftZahl(ids)} Stufen geschafft · ${moehren()} Möhren` : 'Noch kein Profil.'}</p>
<a class="knopf voll" href="#fragen" data-tat="neu-fragen">Startfragen ${Z.profil ? 'neu beantworten' : 'beantworten'}</a><p class="leise klein">Dein Lernstand in den Stufen und selbst aufgenommene Gänge bleiben dabei erhalten.</p>
${loeschFrage ? '<p><b>Wirklich alles löschen?</b> Profil, Stufen und Möhren sind dann weg.</p><div class="reihe"><button class="knopf gefahr" type="button" data-tat="loeschen-ja">Ja, alles löschen</button><button class="knopf zweit" type="button" data-tat="loeschen-nein">Abbrechen</button></div>'
    : '<button class="knopf gefahr voll" type="button" data-tat="loeschen">Alles löschen</button>'}</div>
<div class="karte weich"><h3>Über Kaninchenbau</h3><p>Fassung ${VERSION}. Läuft nach dem ersten Besuch auch offline. Alles bleibt auf diesem Gerät – nichts wird gesendet.</p>
<p>Getrennt von „Wie ich ticke“: Dort geht es um dich selbst, hier um das, was dich interessiert. Die Fragen-Technik mit zwei bunten Knöpfen ist dieselbe.</p>
${speicher.speicherOk() ? '' : '<p class="leise klein">Hinweis: Dieser Browser erlaubt gerade kein Speichern (zum Beispiel im privaten Fenster). Der Fortschritt geht beim Schließen verloren.</p>'}</div>` };
}

const SEITEN = { start, fragen: startfragen, profil: profilSeite, ast: astSeite, lernen, ergebnis, baum, quellen, mehr };

// ---------- Darstellung ----------
let sperre = false, letzteRoute = '';
function zeige() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'start';
  const [name, ...arg] = h.split('/');
  const v = (SEITEN[name] || start)(...arg);
  if (v.umleiten) { location.replace('#' + v.umleiten); return; }
  const main = $('#inhalt'), gleich = h === letzteRoute;
  const scroll = main.scrollTop;
  main.innerHTML = v.html;
  for (const el of main.querySelectorAll('[data-w]')) el.style.width = el.dataset.w + '%';
  for (const el of main.querySelectorAll('[data-l]')) el.style.left = el.dataset.l + '%';
  $('#titel').textContent = v.titel; document.title = v.titel === 'Kaninchenbau' ? 'Kaninchenbau' : `${v.titel} – Kaninchenbau`;
  const zb = $('#zurueck');
  if (v.zurueck) { zb.hidden = false; zb.setAttribute('href', '#' + v.zurueck); } else zb.hidden = true;
  for (const a of document.querySelectorAll('#leiste a')) { if (a.dataset.bereich === v.bereich) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
  // Während einer Stufe zählen neue richtige Antworten sofort mit (über dem bisherigen Bestwert; der Bonus kommt am Ende)
  const lauf = Z.quiz ? Math.max(0, Z.quiz.ok.filter(Boolean).length - (info(Z.quiz.ast, Z.quiz.stufe)?.beste || 0)) : 0;
  const m = moehren() + lauf, mo = $('#moehren');
  mo.innerHTML = Z.profil || m ? `${IC.moehre}<span>${m}</span>` : '';
  mo.setAttribute('aria-label', `${m} Möhren`);
  if (gleich && v.halten) main.scrollTop = scroll; else main.scrollTop = 0;
  if (!gleich) main.focus({ preventScroll: true });
  if (v.fokus) $(v.fokus, main)?.focus({ preventScroll: true });
  letzteRoute = h; sperre = false;
  v.nach?.();
  if (v.konfetti) konfetti();
  if (frischRichtig) { frischRichtig = false; const b = $('.wahl.gewaehlt', main); if (b) { const s = document.createElement('span'); s.className = 'plus'; s.innerHTML = `+1 ${IC.moehre}`; b.appendChild(s); } }
}

function konfetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const k = document.createElement('div'); k.className = 'konfetti'; k.setAttribute('aria-hidden', 'true');
  const farben = ['#c2410c', '#be123c', '#0f766e', '#1d4ed8', '#6d28d9', '#15803d', '#eab308', '#ea580c'];
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('i');
    e.style.left = Math.random() * 100 + '%'; e.style.background = farben[i % farben.length];
    e.style.setProperty('--dx', (Math.random() * 140 - 70).toFixed(0) + 'px'); e.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
    e.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's'; k.appendChild(e);
  }
  document.body.appendChild(k); setTimeout(() => k.remove(), 2300);
}

let meldTimer = 0;
function meldung(text, knopf, tat, ms = 4000) {
  const m = $('#meldung');
  m.innerHTML = `<span>${esc(text)}</span>${knopf ? `<button class="knopf" type="button">${esc(knopf)}</button>` : ''}`;
  if (knopf) m.querySelector('button').addEventListener('click', () => { m.classList.remove('an'); tat?.(); });
  m.classList.add('an'); clearTimeout(meldTimer);
  if (ms) meldTimer = setTimeout(() => m.classList.remove('an'), ms);
}

function thema() {
  const r = document.documentElement;
  if (Z.thema === 'hell') r.dataset.theme = 'light'; else if (Z.thema === 'dunkel') r.dataset.theme = 'dark'; else delete r.dataset.theme;
  const dunkel = Z.thema === 'dunkel' || (Z.thema === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  for (const m of document.querySelectorAll('meta[name=theme-color]')) m.setAttribute('content', dunkel ? '#14130f' : '#f6f3ec');
}

// ---------- Taten ----------
const TATEN = {
  'start-antwort'(b) {
    if (sperre || !Z.lauf) return; sperre = true;
    const f = naechste(Z.lauf.antw); if (!f) return zeige();
    Z.lauf.antw[f.id] = Number(b.dataset.wahl); sichern();
    for (const w of document.querySelectorAll('.wahl')) { w.disabled = true; w.classList.add(w === b ? 'gewaehlt' : 'weg'); }
    setTimeout(() => { if (!naechste(Z.lauf.antw)) { abschliessen(); location.hash = '#profil'; } else zeige(); }, 260);
  },
  'start-zurueck'() {
    if (!Z.lauf) return; const k = Object.keys(Z.lauf.antw); if (!k.length) return;
    delete Z.lauf.antw[k[k.length - 1]]; sichern(); zeige();
  },
  'lern-antwort'(b) {
    if (sperre || !Z.quiz || Z.quiz.offen !== null) return; sperre = true;
    const q = Z.quiz, i = q.ok.length, w = Number(b.dataset.wahl);
    const richtigeSeite = q.seiten[i] === 0 ? 0 : 1;
    q.ok.push(w === richtigeSeite); q.offen = w; sichern();
    frischRichtig = w === richtigeSeite; zeige();
  },
  'lern-weiter'() {
    if (!Z.quiz || Z.quiz.offen === null) return;
    Z.quiz.offen = null;
    if (Z.quiz.ok.length >= 3) { const { ast, stufe } = Z.quiz; beenden(); location.hash = `#ergebnis/${ast}/${stufe}`; return; }
    sichern(); zeige();
  },
  aufnehmen(b) {
    const id = b.dataset.ast; if (!Z.profil || istMein(id) || !AESTE[id]) return;
    Z.profil.aeste.push(id); sichern(); meldung(`„${AESTE[id].kurz}“ ist jetzt in deinem Bau.`); zeige();
  },
  filter(b) { filter = b.dataset.typ; try { localStorage.setItem('kaninchenbau.filter', filter); } catch { /* egal */ } zeige(); },
  thema(b) { Z.thema = b.dataset.thema; sichern(); thema(); zeige(); },
  'neu-fragen'() { Z.lauf = { antw: {} }; sichern(); },
  loeschen() { loeschFrage = true; zeige(); },
  'loeschen-nein'() { loeschFrage = false; zeige(); },
  'loeschen-ja'() { loeschFrage = false; speicher.loeschen(); Z = speicher.leer(); sichern(); thema(); meldung('Alles gelöscht.'); location.hash = '#start'; if (letzteRoute === 'start') zeige(); }
};
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-tat]'); if (!el) return;
  const fn = TATEN[el.dataset.tat]; if (!fn) return;
  fn(el, e);
  if (el.tagName === 'A' && el.getAttribute('href') === location.hash) zeige();
});
window.addEventListener('hashchange', zeige);
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', thema);

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
window.__kb = { version: VERSION, zustand: () => JSON.parse(JSON.stringify(Z)), moehren };

thema();
zeige();
