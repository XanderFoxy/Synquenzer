// Kaninchenbau – Lernen-Teil (aus 0.1 übernommen): Startfragen → 3–5 Gänge, je Gang 3 Stufen mit kurzen Wissensfragen,
// Quellen, Baum mit Querverbindungen. Daten in K.Z.lernen (gleiches Format wie 0.1 'kaninchenbau.v1').
import { GEBIETE, AESTE, QUELLEN, BRUECKEN, STUFEN, TYP_NAME, SPRACHE, TYP_BRUECKE, gebietVon, brueckenVon } from './inhalt.js';
import { naechste, auswerten, fortschritt } from './profil.js';
import * as speicher from './speicher.js';
import { K, SEITEN, TATEN, sichern, $, esc, IC, balken, meldung } from './kern.js';

const GEPRUEFT = '22.11.2026';
const L = () => K.Z.lernen;
const zufall = () => (crypto.getRandomValues(new Uint8Array(1))[0] & 1);
const sterne = (n) => `<span class="sterne">${[1, 2, 3].map((i) => IC.stern(i <= n)).join('')}</span>`;

// ---------- Lernstand ----------
const info = (id, n) => L().stufen[id]?.[n] || null;
const geschafft = (id, n) => !!info(id, n)?.geschafft;
const frei = (id, n) => n === 1 || geschafft(id, n - 1);
const stand = (id) => [1, 2, 3].filter((n) => geschafft(id, n)).length;
const standName = (id) => (stand(id) ? STUFEN[stand(id) - 1].name : 'Neu');
const meine = () => L().profil?.aeste || [];
const istMein = (id) => meine().includes(id);
const moehren = () => Object.values(L().stufen).reduce((s, st) => s + Object.values(st).reduce((t, e) => t + e.beste + (e.geschafft ? 2 : 0), 0), 0);
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
// ---------- Seiten ----------
function gaenge() {
  if (!L().profil) {
    const weiter = L().lauf && Object.keys(L().lauf.antw).length;
    return { titel: 'Lernen', bereich: 'gaenge', html: `
<section class="held"><h2>Gänge graben</h2><p class="lead">Lernen, was dich wirklich interessiert – Schritt für Schritt tiefer, mit Querverbindungen und echten Quellen.</p>
<a class="knopf gross" href="#fragen">${weiter ? 'Weiter mit den Startfragen' : 'Los geht’s'}</a>${IC.hase('hase')}</section>
<div class="karte"><h3>So funktioniert’s</h3><ol>
<li>Ein paar einfache Fragen mit zwei bunten Knöpfen: Was reizt dich?</li>
<li>Daraus gräbt die App 3 bis 5 Gänge für dich – zum Beispiel Reisen → Rom → Caesar.</li>
<li>Jeder Gang hat drei Stufen wie ein Sprachkurs: Einsteiger, Fortgeschritten, Profi. Für jede richtige Antwort gibt es eine Möhre.</li>
<li>Querverbindungen zeigen, wo sich Gänge treffen: gleiche Zeit, gleiche Personen, gleiche Orte.</li>
<li>An jedem Gang stehen echte Quellen: Bücher, Artikel, Videos.</li></ol>
<p class="leise klein">Alles bleibt auf deinem Gerät. Was du hier lernst, fließt auch in deinen Bereich „Wissen“ ein.</p></div>` };
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
  const andere = Object.keys(AESTE).filter((id) => !gesehen.has(id) && L().stufen[id]);
  return { titel: 'Lernen', bereich: 'gaenge', html: `
<section class="held"><h2>Deine Gänge</h2><p>${ids.length} Gänge · ${fertig} von ${alle} Stufen geschafft</p>
<div class="held-zahlen"><span>${moehren()} Möhren</span><span>${Math.round(alle ? (fertig / alle) * 100 : 0)} % gegraben</span></div>
${weiterHtml}${IC.hase('hase')}</section>
${gruppen}
${neu.length ? `<h3>Neue Gänge entdecken</h3><p class="leise klein">Von deinen Gängen führen Querverbindungen hierher:</p><ul class="bruecken">${neu.slice(0, 6).map((b) => brueckeHtml(b, b.von)).join('')}</ul>` : ''}
${andere.length ? `<h3>Weitere Gänge mit Lernstand</h3>${andere.map((id) => astKarte(id)).join('')}` : ''}
<div class="reihe"><a class="knopf zweit" href="#baum">Baum ansehen</a><a class="knopf zweit" href="#quellen">Alle Quellen</a></div>
${neuFragenKarte()}` };
}

let frischGegraben = false;
function startfragen() {
  if (!L().lauf) {
    // Bau steht schon (z. B. Zurückwischen nach den Startfragen): keinen leeren Lauf anlegen, nichts überschreiben.
    // Neu beantworten geht nur bewusst über „Startfragen neu beantworten“ (Tat neu-fragen legt den Lauf an).
    if (L().profil) return { umleiten: 'gaenge' };
    L().lauf = { antw: {} }; sichern();
  }
  const antw = L().lauf.antw, f = naechste(antw);
  if (!f) { abschliessen(); return { umleiten: 'profil' }; }
  const fs = fortschritt(antw);
  const art = { gebiet: `Gebiet ${GEBIETE.findIndex((g) => g.id === f.gebiet) + 1} von ${GEBIETE.length}`, notfall: 'Entweder – oder', paar: 'Entweder – oder', zusatz: 'Noch ein Gang?', kaninchen: 'Kaninchenbau-Frage' }[f.art];
  return { titel: 'Startfragen', bereich: 'gaenge', zurueck: 'gaenge', html: `
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
  const alt = L().profil, vonAlt = alt?.antw ? auswerten(alt.antw) : [];
  const dazu = (alt?.aeste || []).filter((id) => AESTE[id] && !vonAlt.includes(id));
  const aeste = [...new Set([...auswerten(L().lauf.antw), ...dazu])];
  L().profil = { aeste, antw: L().lauf.antw, datum: new Date().toISOString() };
  L().lauf = null; sichern(); speicher.dauerhaft(); frischGegraben = true;
}

function profilSeite() {
  if (!L().profil) return { umleiten: 'gaenge' };
  const ids = meine();
  const innen = BRUECKEN.filter((b) => ids.includes(b.a) && ids.includes(b.b));
  const erster = naechsterSchritt();
  return { titel: 'Dein Bau', bereich: 'gaenge', zurueck: 'gaenge', konfetti: frischGegraben && (frischGegraben = false, true), html: `
<section class="ende"><h2>Dein Bau ist gegraben!</h2><p class="lead">${ids.length} Gänge passen zu deinen Antworten.</p></section>
${ids.map((id) => astKarte(id)).join('')}
${innen.length ? `<h3>Hier treffen sich deine Gänge</h3><ul class="bruecken">${innen.map((b) => brueckeHtml(b)).join('')}</ul>` : ''}
<div class="reihe">${erster ? `<a class="knopf haupt gross" href="#lernen/${erster.id}/${erster.n}">Erste Stufe starten</a>` : ''}<a class="knopf zweit" href="#gaenge">Zu den Gängen</a><a class="knopf zweit" href="#baum">Baum ansehen</a></div>` };
}

function astSeite(id) {
  const a = AESTE[id]; if (!a) return { umleiten: 'gaenge' };
  const g = gebietVon(id);
  const steck = [`Zeit: <b>${esc(a.zeit)}</b>`, a.orte.length ? `Orte: <b>${esc(a.orte.join(', '))}</b>` : '', a.personen.length ? `Personen: <b>${esc(a.personen.join(', '))}</b>` : ''].filter(Boolean).map((s) => `<span>${s}</span>`).join('');
  const stufen = STUFEN.map(({ n, name }) => {
    const i = info(id, n), fr = frei(id, n), ok = geschafft(id, n);
    const unter = ok ? `${sterne(i.beste)} geschafft` : i ? `Bestwert ${i.beste} von 3 – ab 2 richtigen geschafft` : fr ? '3 Fragen · ab 2 richtigen geschafft' : `Erst Stufe ${n - 1} schaffen`;
    const knopf = fr ? `<a class="knopf ${ok || i ? 'zweit' : 'haupt'}" href="#lernen/${id}/${n}">${ok || i ? 'Nochmal' : 'Starten'}</a>` : `<span class="knopf zweit" aria-disabled="true">${IC.schloss}<span class="sr">gesperrt</span></span>`;
    return `<li class="${fr ? '' : 'zu'}"><span class="nr">${n}</span><span class="txt"><b>${esc(name)}</b><small>${unter}</small></span>${knopf}</li>`;
  }).join('');
  return { titel: a.kurz, bereich: 'gaenge', zurueck: 'gaenge', html: `
<section class="ast-kopf g-${g.id}"><small>${esc(g.name)} · Stand: ${esc(standName(id))}</small><h2>${esc(a.titel)}</h2><p>${esc(a.intro)}</p></section>
<div class="steckbrief">${steck}</div>
${istMein(id) || !L().profil ? '' : `<button class="knopf haupt voll" type="button" data-tat="aufnehmen" data-ast="${id}">In meinen Bau aufnehmen</button>`}
<h3>Stufen</h3><ol class="stufen g-${g.id}">${stufen}</ol>
<h3>Querverbindungen</h3><ul class="bruecken">${brueckenVon(id).map((b) => brueckeHtml(b, id)).join('')}</ul>
<h3>Quellen</h3><ul class="quellen">${a.quellen.map((q) => quelleHtml(QUELLEN[q])).join('')}</ul>
<p class="fuss">Quellen geprüft am ${GEPRUEFT}. Bücher mit Verlag und ISBN findest du in jeder Bibliothek oder Buchhandlung.</p>` };
}

let frischRichtig = false;
function lernen(id, nText) {
  const a = AESTE[id], n = Number(nText);
  if (!a || ![1, 2, 3].includes(n)) return { umleiten: 'gaenge' };
  if (!frei(id, n)) return { umleiten: 'ast/' + id };
  if (!L().quiz || L().quiz.ast !== id || L().quiz.stufe !== n) { L().quiz = { ast: id, stufe: n, ok: [], seiten: [zufall(), zufall(), zufall()], offen: null }; sichern(); }
  const q = L().quiz, offen = q.offen;
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
  return { titel: `Stufe ${n} · ${a.kurz}`, bereich: 'gaenge', zurueck: 'ast/' + id, fokus: offen !== null ? '#weiter' : null, html: `
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
  const { ast: id, stufe: n, ok } = L().quiz;
  const richtig = ok.filter(Boolean).length, vorher = info(id, n);
  const beste = Math.max(vorher?.beste || 0, richtig);
  const ersterMal = !vorher?.geschafft && richtig >= 2;
  (L().stufen[id] ||= {})[n] = { beste, versuche: (vorher?.versuche || 0) + 1, geschafft: beste >= 2 };
  let aufgenommen = false;
  if (L().profil && !istMein(id) && richtig >= 2) { L().profil.aeste.push(id); aufgenommen = true; }
  L().letztes = { ast: id, stufe: n, richtig, neu: !vorher || richtig > vorher.beste, ersterMal, aufgenommen };
  L().quiz = null; sichern(); frischKonfetti = ersterMal;
}

function ergebnis(id, nText) {
  const a = AESTE[id], n = Number(nText);
  if (!a || ![1, 2, 3].includes(n)) return { umleiten: 'gaenge' };
  const l = L().letztes && L().letztes.ast === id && L().letztes.stufe === n ? L().letztes : { richtig: info(id, n)?.beste || 0, neu: false, ersterMal: false, aufgenommen: false };
  const ok = l.richtig >= 2;
  const kopf = ok ? (l.richtig === 3 ? 'Perfekt!' : 'Stufe geschafft!') : 'Fast!';
  const weiter = n < 3 && frei(id, n + 1) ? `<a class="knopf haupt gross" href="#lernen/${id}/${n + 1}">Weiter: Stufe ${n + 1} · ${esc(STUFEN[n].name)}</a>` : '';
  const tipp = brueckenVon(id).sort((p, q) => stand(p.zu) - stand(q.zu))[0];
  const q = QUELLEN[a.stufen[n - 1].q];
  return { titel: 'Ergebnis', bereich: 'gaenge', zurueck: 'ast/' + id, konfetti: frischKonfetti && (frischKonfetti = false, true), html: `
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
  return { titel: 'Baum', bereich: 'gaenge', nach: baumZeichnen, html: `
<h2>Dein Baum</h2><p class="leise">${L().profil ? 'Ausgefüllte Punkte sind deine Gänge.' : 'Noch kein Profil – alle Gänge zum Stöbern.'} Die Bögen rechts sind Querverbindungen. Tippe auf einen Gang.</p>
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
    const leise = L().profil && !mein.has(b.a) && !mein.has(b.b) ? ' leise' : '';
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
  return { titel: 'Quellen', bereich: 'gaenge', halten: true, html: `
<h2>Quellen</h2><p class="leise">Nur echte, prüfbare Titel: Bücher mit Verlag (und ISBN, wo vorhanden), Artikel, Videos und Übungsseiten mit Link. Geprüft am ${GEPRUEFT}. Links brauchen Internet.</p>
<div class="chips" role="group" aria-label="Art der Quelle">${typen.map((t) => `<button class="chip" type="button" data-tat="filter" data-typ="${t}" aria-pressed="${filter === t}">${name[t]}</button>`).join('')}</div>
<p class="leise klein">${zahl} Quellen</p>${teile}` };
}


function neuFragenKarte() {
  const ids = meine();
  return `<div class="karte weich"><h3>Startfragen</h3><p class="klein">${L().profil ? `${ids.length} Gänge · ${geschafftZahl(ids)} Stufen geschafft · ${moehren()} Möhren` : 'Noch keine Gänge.'}</p>
<a class="knopf voll zweit" href="#fragen" data-tat="neu-fragen">Startfragen ${L().profil ? 'neu beantworten' : 'beantworten'}</a><p class="leise klein">Dein Lernstand in den Stufen und selbst aufgenommene Gänge bleiben dabei erhalten.</p></div>`;
}

Object.assign(SEITEN, { gaenge, fragen: startfragen, profil: profilSeite, ast: astSeite, lernen, ergebnis, baum, quellen });
Object.assign(TATEN, {
  'start-antwort'(b) {
    if (K.sperre || !L().lauf) return; K.sperre = true;
    const f = naechste(L().lauf.antw); if (!f) return K.zeige();
    L().lauf.antw[f.id] = Number(b.dataset.wahl); sichern();
    for (const w of document.querySelectorAll('.wahl')) { w.disabled = true; w.classList.add(w === b ? 'gewaehlt' : 'weg'); }
    setTimeout(() => { if (!naechste(L().lauf.antw)) { abschliessen(); location.hash = '#profil'; } else K.zeige(); }, 260);
  },
  'start-zurueck'() {
    if (!L().lauf) return; const k = Object.keys(L().lauf.antw); if (!k.length) return;
    delete L().lauf.antw[k[k.length - 1]]; sichern(); K.zeige();
  },
  'lern-antwort'(b) {
    if (K.sperre || !L().quiz || L().quiz.offen !== null) return; K.sperre = true;
    const q = L().quiz, i = q.ok.length, w = Number(b.dataset.wahl);
    const richtigeSeite = q.seiten[i] === 0 ? 0 : 1;
    q.ok.push(w === richtigeSeite); q.offen = w; sichern();
    frischRichtig = w === richtigeSeite; K.zeige();
  },
  'lern-weiter'() {
    if (!L().quiz || L().quiz.offen === null) return;
    L().quiz.offen = null;
    if (L().quiz.ok.length >= 3) { const { ast, stufe } = L().quiz; beenden(); location.hash = `#ergebnis/${ast}/${stufe}`; return; }
    sichern(); K.zeige();
  },
  aufnehmen(b) {
    const id = b.dataset.ast; if (!L().profil || istMein(id) || !AESTE[id]) return;
    L().profil.aeste.push(id); sichern(); meldung(`„${AESTE[id].kurz}“ ist jetzt in deinem Bau.`); K.zeige();
  },
  filter(b) { filter = b.dataset.typ; try { localStorage.setItem('kaninchenbau.filter', filter); } catch { /* egal */ } K.zeige(); },
  'neu-fragen'() { L().lauf = { antw: {} }; sichern(); },
});

export { moehren, stand, meine, info };
export const titelVon = (id) => AESTE[id]?.titel || id;
// Nach dem Zeichnen: „+1 Möhre“ am gewählten Knopf
export function nachZeigen(main) {
  if (frischRichtig) { frischRichtig = false; const b = $('.wahl.gewaehlt', main); if (b) { const s = document.createElement('span'); s.className = 'plus'; s.innerHTML = `+1 ${IC.moehre}`; b.appendChild(s); } }
}
// Während einer Stufe zählen neue richtige Antworten sofort mit (über dem bisherigen Bestwert; der Bonus kommt am Ende)
export function moehrenJetzt() {
  const q = L().quiz;
  const lauf = q ? Math.max(0, q.ok.filter(Boolean).length - (info(q.ast, q.stufe)?.beste || 0)) : 0;
  return moehren() + lauf;
}
