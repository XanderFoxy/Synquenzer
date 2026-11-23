// Kaninchenbau 0.2 – Seiten „Dein Wesen“: Bau (Start), Runde, Runden-Ende, Bereich, Antworten, Karte (Defragmentieren), Mehr.
import { BEREICHE, BEREICH, MERKMALE, MERKMAL, FRAGEN, FRAGE, THEMEN } from './wesen.js';
import * as A from './auswertung.js';
import * as speicher from './speicher.js';
import { VERSION, K, SEITEN, TATEN, sichern, $, esc, IC, balken, streifen, meldung, konfetti, datei, kopieren, zeitText, extraVonLernen, lg } from './kern.js';
import { moehren, stand, meine, titelVon } from './lernen.js';

const W = () => K.Z.wesen;
const LAENGEN = [[5, 'Kurz', 'ca. 1 Min.'], [8, 'Mittel', 'ca. 2 Min.'], [12, 'Lang', 'ca. 3 Min.']];
const minuten = (n) => (LAENGEN.find(([x]) => x === n) || LAENGEN[1])[2];
const SICHER = { offen: 'noch offen', vorläufig: 'vorläufig', gemischt: 'gemischt', eher: 'eher', klar: 'klar' };
const pct = (x) => A.prozent(x) + ' %';
const fuss = '<p class="fuss">Selbstbeobachtung, keine Diagnose. Alles bleibt auf deinem Gerät – nichts wird gesendet.</p>';

// ---------- Antworten ändern (gemeinsam für Runde und Übersicht) ----------
// Nachfragen, deren Bedingung nach einer Änderung nicht mehr gilt, werden entfernt (sie würden sonst falsch mitzählen).
function aufraeumen() {
  const weg = {};
  const l = A.lage(W().antw, extraVonLernen());
  for (const id of l.ungueltig) { weg[id] = W().antw[id]; delete W().antw[id]; }
  const r = W().runde;
  if (r && Object.keys(weg).length) { const vor = r.ids.slice(0, r.i).filter((id) => weg[id]).length; r.ids = r.ids.filter((id) => !weg[id]); r.i = Math.max(0, Math.min(r.ids.length, r.i - vor)); }
  return weg;
}
function setze(id, w) {
  const jetzt = Date.now(), alt = W().antw[id];
  W().antw[id] = { w, t: jetzt, t0: alt?.t0 || jetzt };
  const weg = aufraeumen();
  sichern();
  return { id, alt: alt ? { ...alt } : null, weg };
}
function rueckgaengig(u) {
  if (u.alt) W().antw[u.id] = u.alt; else delete W().antw[u.id];
  Object.assign(W().antw, u.weg);
  sichern();
}

// ---------- Bausteine ----------
const bName = (b) => BEREICH[b]?.name || b;
function optionenHtml(f, gewaehlt, { klein = false, tat = 'w-antwort' } = {}) {
  const opts = A.optionen(f);
  const knopf = (o, i, cls) => `<button class="wahl ${cls}${gewaehlt === i ? ' gewaehlt' : ''}" type="button" data-tat="${tat}" data-id="${f.id}" data-a="${i}" aria-pressed="${gewaehlt === i}">${esc(o[0])}</button>`;
  if (klein) return `<div class="mini-wahl" role="group" aria-label="${esc(A.frageText(f))}">${opts.map((o, i) => `<button class="chip${gewaehlt === i ? ' an' : ''}" type="button" data-tat="${tat}" data-id="${f.id}" data-a="${i}" aria-pressed="${gewaehlt === i}">${esc(o[0])}</button>`).join('')}</div>`;
  if (f.art === 'zwei') return `<div class="paar" role="group" aria-labelledby="frage-text">${knopf(opts[0], 0, 'links')}<span class="oder" aria-hidden="true">oder</span>${knopf(opts[1], 1, 'rechts')}</div>`;
  const art = f.art === 'skala' ? 'skala' : f.art === 'stufe' ? 'stufen4' : 'liste';
  const pre = f.art === 'skala' ? 's' : f.art === 'stufe' ? 'k' : 'w';
  return `<div class="${art} n${opts.length}" role="group" aria-labelledby="frage-text">${opts.map((o, i) => knopf(o, i, pre + i)).join('')}</div>`;
}
function bereichKarte(B) {
  const b = lg().b[B.id];
  return `<a class="karte bereich-karte b-${B.id}" href="#bereich/${B.id}" data-bereich="${B.id}"><span class="band" aria-hidden="true"></span>
<span class="mitte-teil"><b>${esc(B.name)}</b><small>${esc(B.kurz)}</small>${streifen(b.anteil, `${B.name}: ${pct(b.anteil)} ausgewertet`)}</span><span class="prozent">${pct(b.anteil)}</span></a>`;
}
function ring(anteil, groesse = 84) {
  const r = 34, u = 2 * Math.PI * r, p = Math.max(0, Math.min(1, anteil));
  return `<svg class="ring" viewBox="0 0 84 84" width="${groesse}" height="${groesse}" aria-hidden="true"><circle cx="42" cy="42" r="${r}" class="ring-hg"/><circle cx="42" cy="42" r="${r}" class="ring-an" stroke-dasharray="${(u * p).toFixed(1)} ${u.toFixed(1)}" transform="rotate(-90 42 42)"/><text x="42" y="48" text-anchor="middle" class="ring-zahl">${A.prozent(p)}%</text></svg>`;
}
// Eine Zeile der Antworten-Liste, aufklappbar zum Ändern
let offenId = null;
function zeile(f, { zeit = true } = {}) {
  const a = W().antw[f.id], offen = offenId === f.id, ueber = a && a.w === -1;
  return `<li class="zeile b-${f.b}${offen ? ' offen' : ''}" data-id="${f.id}"><div class="zeile-kopf"><span class="band" aria-hidden="true"></span>
<span class="zeile-text"><small>${esc(bName(f.b))}${zeit && a ? ' · ' + esc(zeitText(a.t)) : ''}</small><span class="zeile-frage">${esc(A.frageText(f))}</span>
<b class="zeile-antw${ueber ? ' leise' : ''}">${esc(a ? A.antwortText(f, a.w) : '–')}</b></span>
<button class="knopf klein-knopf" type="button" data-tat="w-aendern" data-id="${f.id}" aria-expanded="${offen}">${offen ? 'Zu' : ueber ? 'Antworten' : 'Ändern'}</button></div>
${offen ? `<div class="aendern-feld">${optionenHtml(f, a ? a.w : -2, { klein: true, tat: 'w-neu' })}<div class="reihe"><button class="knopf zweit" type="button" data-tat="w-zuruecknehmen" data-id="${f.id}">${IC.x} Antwort zurücknehmen</button></div></div>` : ''}</li>`;
}

// ---------- Runde ----------
function rundeNeu(bereich = null) {
  const w = W();
  if (w.runde) rundeAbschliessen();
  w.runde = { ids: [], i: 0, n: w.laenge, bereich, saat: (crypto.getRandomValues(new Uint32Array(1))[0] >>> 0) || 1, start: Date.now(), anteil0: lg().gesamt, fertig: false };
  sichern();
}
function rundeAbschliessen() {
  const r = W().runde; if (!r) return;
  if (r.ids.some((id) => W().antw[id])) W().runden++;
  W().runde = null;
}
const erledigt = (r) => r.ids.filter((id) => W().antw[id]).length;
const ersteOffene = (r) => { const i = r.ids.findIndex((id) => !W().antw[id]); return i < 0 ? r.ids.length : i; };
// Frage an Position i (oder eine neue, angepasst an alle bisherigen Antworten)
function rundeFrage() {
  const r = W().runde; if (!r) return null;
  // Offene Nachfrage, deren Bedingung inzwischen nicht mehr gilt (Antwort geändert): aus der Runde nehmen
  r.ids = r.ids.filter((id) => FRAGE[id] && (W().antw[id] || !MERKMAL[FRAGE[id].m].zusatz || A.wennOk(FRAGE[id], lg().m)));
  r.i = Math.min(r.i, r.ids.length);
  if (r.i < r.ids.length) return FRAGE[r.ids[r.i]];
  if (erledigt(r) >= r.n) return null;
  const f = A.naechste(W().antw, { bereich: r.bereich, gestellt: r.ids, saat: r.saat + r.ids.length, extra: extraVonLernen(), lg: lg() });
  if (!f) return null;
  r.ids.push(f.id); r.i = r.ids.length - 1; sichern();
  return f;
}
function runde() {
  const r = W().runde;
  if (!r) return { umleiten: 'start' };
  if (r.fertig && r.i >= r.ids.length) return { umleiten: 'ende' };
  const f = rundeFrage();
  if (!f) { r.fertig = true; r.i = r.ids.length; sichern(); return { umleiten: 'ende' }; }
  const a = W().antw[f.id], zurueck = a !== undefined, gew = a ? a.w : -2;
  const n = Math.max(r.n, erledigt(r)), nr = Math.min(r.i + 1, n);
  const hinweis = zurueck && a.w >= 0 ? `<p class="frage-unter">Deine Antwort: <b>${esc(A.antwortText(f, a.w))}</b> – tippe neu oder „Weiter“.</p>`
    : zurueck ? '<p class="frage-unter">Übersprungen – du kannst jetzt antworten oder „Weiter“ tippen.</p>' : '';
  return { titel: r.bereich ? bName(r.bereich) : 'Runde', bereich: 'start', zurueck: r.bereich ? 'bereich/' + r.bereich : 'start', html: `
<section class="spiel runde b-${f.b} art-${f.art}${zurueck ? '' : ' rein'}" data-frage="${f.id}" data-i="${r.i}">
<div class="stand">${balken(r.i / n, 'Fortschritt der Runde')}<span class="zahl">${nr}/${n}</span></div>
<p class="frage-art"><span class="punkt" aria-hidden="true"></span>${esc(bName(f.b))}</p>
<p class="frage" id="frage-text">${esc(A.frageText(f))}</p>
${hinweis}
${optionenHtml(f, gew)}
<div class="unten"><button class="knopf zweit" type="button" data-tat="w-zurueck"${r.i > 0 ? '' : ' disabled'} aria-label="Zurück zur vorigen Frage">${IC.zurueck}<span>Zurück</span></button>
${zurueck ? `<button class="knopf zweit" type="button" data-tat="w-weiter">Weiter ${IC.weiter}</button>` : '<button class="knopf zweit leiser" type="button" data-tat="w-skip">Überspringen</button>'}</div>
</section>` };
}
function ende() {
  const r = W().runde;
  if (!r) return { umleiten: 'start' };
  if (!r.fertig) return { umleiten: 'runde' };
  const l = lg(), ids = r.ids.filter((id) => W().antw[id]), beantwortet = ids.filter((id) => W().antw[id].w >= 0);
  const plus = Math.max(0, A.prozent(l.gesamt) - A.prozent(r.anteil0));
  const merk = [...new Set(beantwortet.map((id) => FRAGE[id].m))].map((m) => l.m[m]).filter((L) => L.n >= 1 && L.satz && !L.zusatz)
    .sort((p, q) => q.n - p.n).slice(0, 3);
  const leer = !ids.length;
  return { titel: 'Runde geschafft', bereich: 'start', zurueck: 'start', konfetti: frischEnde && !r.gefeiert && (frischEnde = false, r.gefeiert = true), html: `
<section class="ende runde-ende">
<div class="stuecke-mini" aria-hidden="true">${beantwortet.map((id) => `<i class="b-${FRAGE[id].b}"></i>`).join('')}</div>
<h2>${leer ? 'Alles beantwortet' : 'Runde geschafft!'}</h2>
<p class="lead">${leer ? 'In diesem Teil gibt es gerade keine offenen Fragen.' : `${beantwortet.length} ${beantwortet.length === 1 ? 'Antwort' : 'Antworten'} · gesamt jetzt <b>${pct(l.gesamt)}</b> ausgewertet${plus ? ` (vorher ${A.prozent(r.anteil0)} %)` : ''}`}</p>
${merk.length ? `<div class="karte"><h3>Das hat der Bau gelernt</h3><ul class="kern-liste">${merk.map((L) => `<li class="b-${L.b}"><span class="punkt" aria-hidden="true"></span><span>${esc(L.satz)} <span class="sicher s-${L.sicher}">${SICHER[L.sicher]}</span></span></li>`).join('')}</ul></div>` : ''}
<div class="reihe"><button class="knopf haupt gross" type="button" data-tat="w-runde" data-bereich="${r.bereich || ''}">Noch eine Runde</button><a class="knopf zweit" href="#karte">Defragmentieren</a></div>
${ids.length ? `<h3>Deine Antworten in dieser Runde</h3><p class="leise klein">Vertippt? Tippe auf „Ändern“.</p><ul class="zeilen">${ids.map((id) => zeile(FRAGE[id], { zeit: false })).join('')}</ul>
<button class="knopf zweit voll" type="button" data-tat="w-zurueck">${IC.zurueck}<span>Letzte Antwort ändern</span></button>` : ''}
</section>`, halten: true };
}
let frischEnde = false;

// ---------- Bau (Start) ----------
function start() {
  const l = lg(), w = W(), r = w.runde, neu = !l.antworten && !l.extra;
  const laeuft = r && !r.fertig && erledigt(r) > 0;
  const knopf = laeuft ? `Runde fortsetzen · ${erledigt(r)}/${r.n}` : `Runde starten · ${minuten(w.laenge)}`;
  const st = A.stuecke(w.antw, w.defrag?.t || 0, l);
  const kn = w.defrag ? A.kern(A.lage(schnappAntw(), extraVonLernen())) : null;
  const ids = meine(), m = moehren();
  return { titel: 'Kaninchenbau', bereich: 'start', html: `
<section class="held held-bau">
${ring(l.gesamt)}
<h2>${neu ? 'Dein Kaninchenbau' : 'Dein Bau'}</h2>
${neu ? '<p class="lead">Kurze Runden, jede Antwort ein Tipp. Der Bau sammelt, wie du denkst, fühlst und Ideen hast – und ordnet alles zu einer Karte.</p>'
    : `<p>${pct(l.gesamt)} ausgewertet · ${l.antworten} ${l.antworten === 1 ? 'Antwort' : 'Antworten'}${l.extra ? ` + ${l.extra} aus den Lern-Startfragen` : ''}</p>`}
<button class="knopf gross" type="button" data-tat="w-runde" data-bereich="">${knopf}</button>
</section>
${kn && kn.saetze.length ? `<a class="karte kern-teaser" href="#karte"><small>Dein Kern</small><b>${esc(kn.kurz ? 'Kurz gesagt: ' + kn.kurz + '.' : kn.saetze[0].text)}</b><span class="leise klein">${st.neu ? `${st.neu} neue Stücke warten aufs Defragmentieren` : 'Zur Karte'} ${IC.pfeil}</span></a>`
    : l.antworten >= 6 ? `<a class="karte kern-teaser" href="#karte"><small>Defragmentieren</small><b>${st.neu} Stücke liegen verstreut</b><span class="leise klein">Ordnen und den Kern sehen ${IC.pfeil}</span></a>` : ''}
<h3>Bereiche</h3>
<div class="bereiche-gitter">${BEREICHE.map(bereichKarte).join('')}</div>
<a class="karte lernen-teaser" href="#gaenge"><small>Lernen</small><b>${ids.length ? `${ids.length} Gänge · ${m} Möhren` : 'Gänge graben: lernen, was dich interessiert'}</b><span class="leise klein">Wissensfragen in drei Stufen, mit Quellen ${IC.pfeil}</span></a>
${fuss}` };
}

// ---------- Bereich ----------
function bereichSeite(id) {
  const B = BEREICH[id]; if (!B) return { umleiten: 'start' };
  const l = lg(), b = l.b[id];
  const offen = A.offeneZahl(W().antw, id);
  const merk = MERKMALE.filter((mm) => mm.b === id && !mm.zusatz).map((mm) => merkmalHtml(mm, l.m[mm.id])).join('');
  const zusatz = MERKMALE.filter((mm) => mm.b === id && mm.zusatz && l.m[mm.id].n).map((mm) => `<li>${esc(l.m[mm.id].satz)}</li>`).join('');
  const fragen = FRAGEN.filter((f) => f.b === id && W().antw[f.id]).sort((p, q) => W().antw[q.id].t - W().antw[p.id].t);
  const extra = id === 'wissen' ? lernenKarte() : id === 'ideen' ? ideenKarte() : id === 'gefuehl' ? hilfeKarte() : '';
  return { titel: B.name, bereich: 'start', zurueck: 'start', halten: true, html: `
<section class="bereich-kopf b-${id}"><small>${esc(B.kurz)}</small><h2>${esc(B.name)}</h2><p>${esc(B.text)}</p>
<div class="held-zahlen"><span>${pct(b.anteil)} ausgewertet</span><span>${b.n} ${b.n === 1 ? 'Antwort' : 'Antworten'}</span></div>
${offen ? `<button class="knopf gross" type="button" data-tat="w-runde" data-bereich="${id}">Runde in „${esc(B.name)}“</button>` : '<p class="klein"><b>Alle Fragen beantwortet.</b> Ändern geht unten jederzeit.</p>'}
</section>
<h3>Was der Bau sieht</h3>
<div class="merkmale">${merk}</div>
${zusatz ? `<p class="leise klein">Aus Nachfragen:</p><ul class="klein">${zusatz}</ul>` : ''}
${extra}
<h3>Deine Antworten hier</h3>
${fragen.length ? `<ul class="zeilen">${fragen.map((f) => zeile(f)).join('')}</ul>` : '<p class="leise">Noch keine. Starte oben eine Runde.</p>'}
${fuss}` };
}
function merkmalHtml(mm, L) {
  const kopf = `<div class="merkmal-kopf"><b>${esc(mm.name)}</b><span class="sicher s-${L.sicher}">${SICHER[L.sicher]}</span></div>`;
  let mitte = '';
  if (mm.art === 'achse') {
    const p = Math.round(((L.mittel || 0) + 1) * 50);
    mitte = `<div class="achse" role="img" aria-label="${esc(`${mm.links} bis ${mm.rechts}: ${L.n ? (L.pol < 0 ? 'eher ' + mm.links : L.pol > 0 ? 'eher ' + mm.rechts : 'Mitte') : 'noch offen'}`)}"><span>${esc(mm.links)}</span><span class="spur">${L.n ? `<i class="marke-punkt" data-l="${p}"></i>` : ''}</span><span>${esc(mm.rechts)}</span></div>`;
  } else if (mm.art === 'thema') {
    mitte = L.n ? `<div class="themen">${L.rang.map((t) => `<span class="thema${L.top.includes(t) ? ' vorn' : ''}">${esc(A.wortVon(mm, t))} <small>${L.tags[t]}×</small></span>`).join('')}</div>` : '';
  } else if (mm.art === 'stufe') {
    const g = Object.entries(L.gebiete).sort((a, b) => b[1] - a[1]);
    mitte = g.length ? `<ul class="kenntnis">${g.map(([k, s]) => `<li><span>${esc(mm.gebiete[k])}</span><span class="punkte" aria-label="${s} von 3">${[1, 2, 3].map((i) => `<i${i <= s ? ' class="an"' : ''}></i>`).join('')}</span></li>`).join('')}</ul>` : '';
  }
  const ziel = A.zielVon(mm.id);
  return `<div class="merkmal karte">${kopf}${mitte}<p class="klein">${L.n ? esc(L.satz) : '<span class="leise">Noch keine Antwort.</span>'}</p><p class="leise mini">${Math.min(L.n, ziel)} von ${ziel} Antworten${L.n > ziel ? ` (+${L.n - ziel})` : ''}</p></div>`;
}
function lernenKarte() {
  const ids = meine(), st = ids.reduce((s, x) => s + stand(x), 0), ex = extraVonLernen();
  return `<div class="karte weich"><h3>Aus dem Lernen-Teil</h3><p class="klein">${ids.length ? `${ids.length} Gänge · ${st} Stufen geschafft · ${moehren()} Möhren.` : 'Noch keine Gänge gegraben.'}
${ex.length ? ` Deine Startfragen zählen als Neugier: ${esc(ex.map((e) => THEMEN[e.x]).join(', '))}.` : ''}</p><a class="knopf zweit voll" href="#gaenge">Zum Lernen</a></div>`;
}
function ideenKarte() {
  const ideen = W().ideen;
  return `<div class="karte"><h3>Ideen festhalten</h3><p class="leise klein">Ein paar Worte reichen. Beim Defragmentieren werden sie nach Themen sortiert.</p>
<form class="idee-form" data-form="idee" autocomplete="off"><label class="sr" for="idee-text">Deine Idee</label><input id="idee-text" name="idee" type="text" maxlength="280" placeholder="Meine Idee …" enterkeyhint="done"><button class="knopf haupt" type="submit">${IC.plus}<span>Festhalten</span></button></form>
${ideen.length ? `<ul class="ideen-liste">${[...ideen].reverse().map((x) => `<li><span>${esc(x.text)}<small class="leise"> · ${esc(zeitText(x.t))}</small></span><button class="knopf-ico" type="button" data-tat="w-idee-loeschen" data-id="${esc(x.id)}" aria-label="Idee löschen">${IC.x}</button></li>`).join('')}</ul>` : ''}</div>`;
}
const hilfeKarte = () => `<div class="karte weich"><p class="klein">Diese Fragen beschreiben, wie du dich selbst siehst – keine Diagnose. Wenn es dir länger nicht gut geht, sprich mit jemandem, dem du vertraust, oder mit einer Ärztin oder einem Arzt. Sofort reden: TelefonSeelsorge <a href="tel:08001110111">0800 111 0 111</a> (kostenlos, rund um die Uhr). Im Notfall <a href="tel:112">112</a>.</p></div>`;

// ---------- Antworten (Übersicht) ----------
let filterB = 'alle';
try { filterB = localStorage.getItem('kaninchenbau.antwFilter') || 'alle'; } catch { /* egal */ }
function antworten() {
  if (filterB !== 'alle' && !BEREICH[filterB]) filterB = 'alle';
  const l = lg(), alle = FRAGEN.filter((f) => W().antw[f.id] && (filterB === 'alle' || f.b === filterB));
  const da = alle.filter((f) => W().antw[f.id].w >= 0).sort((p, q) => W().antw[q.id].t - W().antw[p.id].t);
  const ueber = alle.filter((f) => W().antw[f.id].w === -1);
  const ex = extraVonLernen().filter(() => filterB === 'alle' || filterB === 'wissen');
  return { titel: 'Antworten', bereich: 'antworten', halten: true, html: `
<h2>Deine Antworten</h2>
<p class="leise">${l.antworten} ${l.antworten === 1 ? 'Antwort' : 'Antworten'}${l.uebersprungen ? ` · ${l.uebersprungen} übersprungen` : ''}. Vertippt? Tippe auf „Ändern“ – das geht jederzeit.</p>
<div class="chips" role="group" aria-label="Bereich wählen"><button class="chip" type="button" data-tat="w-filter" data-b="alle" aria-pressed="${filterB === 'alle'}">Alle</button>${BEREICHE.map((B) => `<button class="chip" type="button" data-tat="w-filter" data-b="${B.id}" aria-pressed="${filterB === B.id}">${esc(B.name)}</button>`).join('')}</div>
${da.length ? `<ul class="zeilen">${da.map((f) => zeile(f)).join('')}</ul>` : `<p class="leise">Noch keine Antworten${filterB === 'alle' ? '' : ' in diesem Bereich'}.</p><button class="knopf haupt voll" type="button" data-tat="w-runde" data-bereich="${filterB === 'alle' ? '' : filterB}">Runde starten</button>`}
${ueber.length ? `<h3>Übersprungen</h3><ul class="zeilen">${ueber.map((f) => zeile(f)).join('')}</ul>` : ''}
${ex.length ? `<h3>Aus den Lern-Startfragen</h3><ul class="zeilen">${ex.map((e) => `<li class="zeile b-wissen"><div class="zeile-kopf"><span class="band" aria-hidden="true"></span><span class="zeile-text"><small>Wissen · Neugier</small><span class="zeile-frage">Gebiet spannend?</span><b class="zeile-antw">${esc(THEMEN[e.x])}: Ja</b></span><a class="knopf klein-knopf" href="#fragen" data-tat="neu-fragen">Ändern</a></div></li>`).join('')}</ul>` : ''}
${fuss}` };
}

// ---------- Karte: Defragmentieren ----------
const schnappAntw = () => { const t = W().defrag?.t || 0; return Object.fromEntries(Object.entries(W().antw).filter(([, a]) => a.t <= t)); };
function plattenHtml(st) {
  const zellen = Array.from({ length: st.N }, (_, i) => i);
  const besetzt = new Map(st.stuecke.map((s) => [s.pos, s]));
  return zellen.map((i) => { const s = besetzt.get(i); return s ? `<i class="st b-${s.b}${s.neu ? ' neu' : ''}" data-id="${s.id}" data-o="${i}"></i>` : `<i class="st frei" data-o="${i}"></i>`; }).join('');
}
function karteSeite() {
  const w = W(), l = lg(), st = A.stuecke(w.antw, w.defrag?.t || 0, l);
  const hat = !!w.defrag && st.sortiert > 0;
  let erg = '';
  if (hat) {
    const ls = A.lage(schnappAntw(), extraVonLernen());
    const kn = A.kern(ls), vb = A.verbindungen(ls), fd = A.faeden(ls);
    const zk = A.zukunft(ls, { stand, titel: titelVon, weg: w.weg });
    const ideen = w.ideen.filter((x) => x.t <= w.defrag.t);
    const gruppen = {};
    for (const x of ideen) { const t = A.ideenThema(x.text) || 'andere'; (gruppen[t] ||= []).push(x); }
    erg = `<section id="ergebnis" class="ergebnis">
<p class="leise klein">Stand: ${esc(new Date(w.defrag.t).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }))} · aus ${st.sortiert} Stücken</p>
<h3>Dein Kern</h3>
<div class="karte kern">${kn.kurz ? `<p class="kurz">Kurz gesagt: <b>${esc(kn.kurz)}</b>.</p>` : ''}
${kn.saetze.length ? `<ul class="kern-liste">${kn.saetze.map((s) => `<li class="b-${s.b}"><span class="punkt" aria-hidden="true"></span><span><small>${esc(bName(s.b))}</small> ${esc(s.text)} <span class="sicher s-${s.sicher}">${SICHER[s.sicher]}</span></span></li>`).join('')}</ul>` : '<p class="leise">Noch zu wenige Stücke für einen Kern. Ein, zwei Runden mehr – dann wird er deutlich.</p>'}
${kn.faden ? `<p class="faden"><b>Roter Faden: ${esc(kn.faden.name)}</b> – taucht auf in ${esc(kn.faden.bereiche.map(bName).join(', '))}.</p>` : ''}
${kn.spannung ? `<p class="spannung"><b>Spannung:</b> ${esc(kn.spannung.text)}</p>` : ''}
${kn.saetze.length ? `<button class="knopf zweit" type="button" data-tat="w-kern-kopieren">${IC.kopieren}<span>Kern kopieren</span></button>` : ''}</div>
<h3>Karte</h3>
${karteSvg(ls, vb, fd)}
${vb.length || fd.length ? `<ul class="verbindungen">${fd.map((f) => `<li class="faden-z"><span class="typ">roter Faden</span><span><b>${esc(f.name)}</b><small>${esc(f.bereiche.map(bName).join(' · '))}</small></span></li>`).join('')}${vb.map((v) => `<li class="${v.art}"><span class="typ">${v.art === 'spannung' ? 'Spannung' : 'passt'}</span><span><b>${esc(bName(v.ba))}${v.ba !== v.bb ? ' ↔ ' + esc(bName(v.bb)) : ''}</b><small>${esc(v.text)}</small></span></li>`).join('')}</ul>`
    : '<p class="leise klein">Noch keine Verbindungen – sie erscheinen, wenn einzelne Merkmale deutlich werden.</p>'}
<h3>Ideen für die Zukunft</h3>
${zk.length ? zk.map((z) => `<div class="karte idee"><h4>${esc(z.titel)}</h4><p>${esc(z.text)}</p><p class="leise klein">Aus deinen Antworten: ${esc(z.weil)}.</p>
<div class="reihe">${z.link ? `<a class="knopf zweit" href="${esc(z.link[0])}">${esc(z.link[1])}</a>` : ''}<button class="knopf zweit leiser" type="button" data-tat="w-idee-weg" data-id="${z.id}">Passt nicht</button></div></div>`).join('')
    : '<p class="leise">Noch keine Ideen – nach ein paar Runden kommen hier Vorschläge, die zu deinen Antworten passen.</p>'}
${w.weg.length ? `<button class="knopf zweit voll leiser" type="button" data-tat="w-ideen-zurueck">Ausgeblendete Ideen zurückholen (${w.weg.length})</button>` : ''}
${ideen.length ? `<h3>Deine Ideen, sortiert</h3>${Object.entries(gruppen).map(([t, xs]) => `<p class="ideen-gruppe"><b>${esc(THEMEN[t] || 'Ohne Thema')}</b></p><ul class="ideen-liste">${xs.map((x) => `<li><span>${esc(x.text)}</span></li>`).join('')}</ul>`).join('')}` : ''}
</section>`;
  }
  return { titel: 'Karte', bereich: 'karte', html: `
<h2>Defragmentieren</h2>
<details class="karte weich erklaer"${hat ? '' : ' open'}><summary><b>Was heißt das?</b></summary>
<p>Auf einer Festplatte liegen die Stücke einer Datei oft verstreut – sie ist <b>fragmentiert</b>. Beim <b>Defragmentieren</b> werden die Stücke zusammengelegt. Dann findet der Rechner alles schneller.</p>
<p>Hier sind die Stücke deine Antworten. Sie kommen bunt gemischt aus vielen Runden. Defragmentieren legt sie nach Bereichen zusammen, sucht Verbindungen und verdichtet alles zu einem kurzen <b>Kern</b>.</p></details>
<div class="platte" id="platte" role="img" aria-label="${st.stuecke.length} Stücke, davon ${st.neu} verstreut">${plattenHtml(st)}</div>
<div class="legende-b">${BEREICHE.map((B) => `<span class="b-${B.id}"><i aria-hidden="true"></i>${esc(B.name)}</span>`).join('')}<span><i class="frei" aria-hidden="true"></i>noch offen</span></div>
<p class="leise klein mitte" id="platte-info">${st.stuecke.length} Stücke${st.neu ? ` · ${st.neu} neu verstreut` : ' · alles sortiert'}</p>
<button class="knopf haupt gross voll" type="button" data-tat="w-defrag"${st.stuecke.length ? '' : ' disabled'}>${IC.ordnen}<span>${hat && !st.neu ? 'Nochmal defragmentieren' : 'Defragmentieren'}</span></button>
${st.stuecke.length ? '' : '<p class="leise mitte">Noch keine Stücke. <a href="#start">Starte eine Runde</a>.</p>'}
${erg}
<p class="fuss">Regelbasiert aus deinen eigenen Antworten – ohne KI, ohne Internet. Keine Diagnose, sondern ein Spiegel, den du jederzeit ändern kannst.</p>`, nach: platteOrdnen };
}
// Stücke an ihren Platz (CSS-Reihenfolge; per Skript, weil die Seite keine Inline-Stile erlaubt)
function platteOrdnen() { for (const el of document.querySelectorAll('#platte .st')) el.style.order = el.dataset.o; }

function karteSvg(ls, vb, fd) {
  const cx = 170, cy = 140, R = 100, pos = {};
  BEREICHE.forEach((B, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / BEREICHE.length; pos[B.id] = [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  const linie = (a, b, cls) => `<line x1="${pos[a][0].toFixed(1)}" y1="${pos[a][1].toFixed(1)}" x2="${pos[b][0].toFixed(1)}" y2="${pos[b][1].toFixed(1)}" class="${cls}"/>`;
  let s = '';
  fd.forEach((f, k) => {
    const p = f.bereiche.map((b) => pos[b]);
    const d = p.map(([x, y], i) => `${i ? 'L' : 'M'}${(x + (k - 1) * 3).toFixed(1)} ${(y + (k - 1) * 3).toFixed(1)}`).join('');
    s += `<path d="${d}" class="fadenzug f${k}"/>`;
  });
  const gesehen = new Set();
  for (const v of vb) { if (v.ba === v.bb) continue; const k = [v.ba, v.bb].sort().join() + v.art; if (gesehen.has(k)) continue; gesehen.add(k); s += linie(v.ba, v.bb, 'kante ' + v.art); }
  for (const B of BEREICHE) {
    const [x, y] = pos[B.id], a = ls.b[B.id].anteil, r = 13 + 13 * a;
    const unten = y > cy + 10, ty = unten ? y + r + 13 : y - r - 6;
    s += `<g class="knoten b-${B.id}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" class="kn-zahl">${A.prozent(a)}</text>
<text x="${x.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" class="kn-name">${esc(B.name)}</text></g>`;
  }
  return `<svg class="karte-svg" viewBox="0 0 340 290" role="img" aria-label="Karte deiner Bereiche mit Verbindungen">${s}</svg>
<p class="leise mini mitte">Kreise: Bereiche (Zahl = % ausgewertet). Linien: Verbindungen. Farbige Züge: rote Fäden.</p>`;
}
// FLIP: Stücke gleiten an ihren sortierten Platz
function defragAnimation(fertig) {
  const box = $('#platte');
  if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches || !box.animate) { fertig(); return; }
  const els = [...box.querySelectorAll('.st[data-id]')], vorher = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
  const st = A.defragOrdnung(W().antw, lg()), neuPos = new Map(st.stuecke.map((s) => [s.id, s.pos]));
  const frei = [...box.querySelectorAll('.st.frei')]; let k = st.stuecke.length;
  for (const el of els) { el.style.order = neuPos.get(el.dataset.id); el.classList.remove('neu'); }
  for (const el of frei) el.style.order = k++;
  let lang = 0;
  els.forEach((el, i) => {
    const a = vorher.get(el), b = el.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
    if (!dx && !dy) return;
    const ms = 520 + Math.min(500, Math.hypot(dx, dy) * 1.4), verz = (Number(el.style.order) % 40) * 9;
    lang = Math.max(lang, ms + verz);
    el.animate([{ transform: `translate(${dx}px,${dy}px) scale(1.15)` }, { transform: 'none' }], { duration: ms, delay: verz, easing: 'cubic-bezier(.3,.8,.25,1)', fill: 'backwards' });
  });
  setTimeout(fertig, lang + 120);
}

// ---------- Mehr ----------
let loeschFrage = false, importDaten = null;
function mehr() {
  const w = W(), l = lg(), kb = Math.max(1, Math.round(speicher.groesse(K.Z) / 1024));
  const themen = [['auto', 'Wie das Gerät'], ['hell', 'Hell'], ['dunkel', 'Dunkel']];
  return { titel: 'Mehr', bereich: 'mehr', html: `
<h2>Mehr</h2>
<div class="karte"><h3>Rundenlänge</h3><div class="wahlreihe" role="radiogroup" aria-label="Rundenlänge">${LAENGEN.map(([n, t, d]) => `<button class="chip" type="button" role="radio" data-tat="w-laenge" data-n="${n}" aria-checked="${w.laenge === n}" aria-pressed="${w.laenge === n}"><span><b>${t}</b> · ${n} Fragen<br><small>${d}</small></span></button>`).join('')}</div></div>
<div class="karte"><h3>Darstellung</h3><div class="wahlreihe" role="radiogroup" aria-label="Darstellung">${themen.map(([v, t]) => `<button class="chip" type="button" role="radio" data-tat="thema" data-thema="${v}" aria-checked="${K.Z.thema === v}" aria-pressed="${K.Z.thema === v}">${t}</button>`).join('')}</div></div>
<div class="karte"><h3>Deine Daten</h3><p class="klein">${l.antworten} ${l.antworten === 1 ? 'Antwort' : 'Antworten'} · ${w.ideen.length} ${w.ideen.length === 1 ? 'Idee' : 'Ideen'} · ${w.runden} ${w.runden === 1 ? 'Runde' : 'Runden'} · Lernen: ${meine().length} Gänge, ${moehren()} Möhren. Etwa ${kb} KB – nur auf diesem Gerät.</p>
${importDaten ? `<div class="hinweis"><p><b>Sicherung laden?</b> ${esc(importDaten.info)} Deine jetzigen Daten werden dabei ersetzt.</p><div class="reihe"><button class="knopf haupt" type="button" data-tat="w-import-ja">Ersetzen</button><button class="knopf zweit" type="button" data-tat="w-import-nein">Abbrechen</button></div></div>` : ''}
<div class="stapel"><button class="knopf" type="button" data-tat="w-export">${IC.sichern}<span>Als Datei sichern</span></button>
<button class="knopf zweit" type="button" data-tat="w-import">${IC.laden}<span>Sicherung laden</span></button>
${loeschFrage ? '<div class="hinweis gefahr-hinweis"><p><b>Wirklich alles löschen?</b> Antworten, Ideen, Gänge und Möhren sind dann weg. Tipp: vorher als Datei sichern.</p><div class="reihe"><button class="knopf gefahr" type="button" data-tat="w-loeschen-ja">Ja, alles löschen</button><button class="knopf zweit" type="button" data-tat="w-loeschen-nein">Abbrechen</button></div></div>'
    : `<button class="knopf gefahr" type="button" data-tat="w-loeschen">${IC.loeschen}<span>Alles löschen</span></button>`}</div>
${speicher.speicherOk() ? '' : '<p class="leise klein">Hinweis: Dieser Browser erlaubt gerade kein Speichern (zum Beispiel im privaten Fenster). Sichere deine Antworten als Datei.</p>'}</div>
<div class="karte weich"><h3>Über den Kaninchenbau</h3>
<p>Fassung ${VERSION}. Läuft nach dem ersten Besuch auch offline. Alles bleibt auf diesem Gerät – nichts wird gesendet, es gibt keine Konten und keine Werbung.</p>
<p>Die Fragen sind eigene Fragen zur Selbstbeobachtung, kein wissenschaftlicher Test und keine Diagnose. Sie zeigen, wie du dich heute selbst siehst. Jede Antwort lässt sich ändern.</p>
<p>„Wie ich ticke“ misst mit erprobten Fragebögen. Der Kaninchenbau sammelt deine eigenen Antworten in kurzen Runden und ordnet sie zu einer Karte – und hat den Lernen-Teil mit Gängen und Quellen.</p>
${K.Z.migriert ? '<p class="klein">Deine Daten aus Fassung 0.1 (Gänge, Stufen, Möhren) wurden übernommen.</p>' : ''}
<p class="klein">Wenn es dir länger nicht gut geht: Sprich mit jemandem, dem du vertraust. TelefonSeelsorge <a href="tel:08001110111">0800 111 0 111</a> (kostenlos, rund um die Uhr), Notruf <a href="tel:112">112</a>.</p></div>` };
}
// Für die Datei: lesbare Auswertung dazu (Prozent, Merkmale, Kern) – gut weiter auswertbar
function auswertungFuerDatei() {
  const l = lg(), kn = A.kern(l);
  return {
    gesamtProzent: A.prozent(l.gesamt),
    bereiche: Object.fromEntries(BEREICHE.map((B) => [B.id, { name: B.name, prozent: A.prozent(l.b[B.id].anteil), antworten: l.b[B.id].n }])),
    merkmale: Object.fromEntries(MERKMALE.filter((mm) => l.m[mm.id].n).map((mm) => { const L = l.m[mm.id]; return [mm.id, { name: mm.name, bereich: mm.b, antworten: L.n, sicher: L.sicher, satz: L.satz, ...(mm.art === 'achse' ? { wert: Math.round(L.mittel * 100) / 100, links: mm.links, rechts: mm.rechts } : mm.art === 'thema' ? { themen: L.tags } : { gebiete: L.gebiete }) }]; })),
    kern: { kurz: kn.kurz, saetze: kn.saetze.map((s) => s.text), faden: kn.faden?.name || null },
    antworten: FRAGEN.filter((f) => W().antw[f.id]).map((f) => ({ id: f.id, bereich: f.b, frage: A.frageText(f), antwort: A.antwortText(f, W().antw[f.id].w) }))
  };
}
function kernText() {
  const ls = A.lage(schnappAntw(), extraVonLernen()), kn = A.kern(ls);
  return ['Mein Kern (Kaninchenbau)', kn.kurz ? `Kurz gesagt: ${kn.kurz}.` : '', ...kn.saetze.map((s) => `- ${bName(s.b)}: ${s.text}`), kn.faden ? `Roter Faden: ${kn.faden.name}` : ''].filter(Boolean).join('\n');
}

Object.assign(SEITEN, { start, runde, ende, bereich: bereichSeite, antworten, karte: karteSeite, mehr });

// ---------- Taten ----------
let undo = null;
const zurBereich = () => (K.letzteRoute || '').split('/')[0];
Object.assign(TATEN, {
  'w-runde'(b) {
    const bereich = b.dataset.bereich || null, r = W().runde;
    if (!(r && !r.fertig && (r.bereich || null) === bereich)) rundeNeu(bereich);
    location.hash = '#runde'; if (zurBereich() === 'runde') K.zeige();
  },
  'w-antwort'(b) {
    const r = W().runde; if (K.sperre || !r) return;
    const id = b.dataset.id, w = Number(b.dataset.a); if (r.ids[r.i] !== id) return;
    K.sperre = true;
    setze(id, w);
    for (const x of document.querySelectorAll('.runde .wahl')) { x.disabled = true; x.classList.toggle('gewaehlt', x === b); x.classList.toggle('weg', x !== b); }
    r.i = ersteOffene(r); if (r.i >= r.ids.length && erledigt(r) >= r.n) { r.fertig = true; frischEnde = true; } sichern();
    setTimeout(() => { if (r.fertig) location.hash = '#ende'; else K.zeige(); }, 230);
  },
  'w-skip'() {
    const r = W().runde; if (K.sperre || !r) return; const id = r.ids[r.i]; if (!id) return;
    K.sperre = true; setze(id, -1);
    r.i = ersteOffene(r); if (r.i >= r.ids.length && erledigt(r) >= r.n) { r.fertig = true; frischEnde = true; } sichern();
    if (r.fertig) location.hash = '#ende'; else K.zeige();
  },
  'w-weiter'() { const r = W().runde; if (!r) return; r.i = Math.min(r.ids.length, r.i + 1); if (r.i >= r.ids.length && erledigt(r) >= r.n) { r.fertig = true; sichern(); location.hash = '#ende'; return; } sichern(); K.zeige(); },
  'w-zurueck'() {
    const r = W().runde; if (!r) return;
    if (r.fertig) { r.fertig = false; r.i = Math.max(0, r.ids.length - 1); sichern(); location.hash = '#runde'; return; }
    if (r.i > 0) { r.i--; sichern(); K.zeige(); }
  },
  'w-aendern'(b) { offenId = offenId === b.dataset.id ? null : b.dataset.id; K.zeige(); },
  'w-neu'(b) {
    const id = b.dataset.id, w = Number(b.dataset.a), f = FRAGE[id]; if (!f) return;
    if (W().antw[id]?.w === w) { offenId = null; K.zeige(); return; }
    undo = setze(id, w); offenId = null; K.zeige();
    meldung('Antwort geändert.', `${IC.zurueck}<span>Rückgängig</span>`, () => { if (undo) { rueckgaengig(undo); undo = null; K.zeige(); meldung('Wieder wie vorher.'); } }, 6000);
  },
  'w-zuruecknehmen'(b) {
    const id = b.dataset.id; if (!W().antw[id]) return;
    const alt = { ...W().antw[id] }; delete W().antw[id]; const weg = aufraeumen(); sichern();
    undo = { id, alt, weg }; offenId = null; K.zeige();
    meldung('Antwort zurückgenommen.', `${IC.zurueck}<span>Rückgängig</span>`, () => { if (undo) { rueckgaengig(undo); undo = null; K.zeige(); } }, 6000);
  },
  'w-filter'(b) { filterB = b.dataset.b; offenId = null; try { localStorage.setItem('kaninchenbau.antwFilter', filterB); } catch { /* egal */ } K.zeige(); },
  'w-defrag'(b) {
    if (K.sperre) return; K.sperre = true; b.disabled = true;
    defragAnimation(() => {
      W().defrag = { t: Date.now(), n: lg().antworten }; sichern(); speicher.dauerhaft();
      K.sperre = false; K.zeige();
      requestAnimationFrame(() => { const e = $('#ergebnis'); if (e) e.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
      meldung('Defragmentiert: alles sortiert.');
    });
  },
  async 'w-kern-kopieren'() { meldung((await kopieren(kernText())) ? 'Kern kopiert – nur in deine Zwischenablage.' : 'Kopieren ging nicht.'); },
  'w-idee-weg'(b) { if (!W().weg.includes(b.dataset.id)) W().weg.push(b.dataset.id); sichern(); K.zeige(); meldung('Ausgeblendet.'); },
  'w-ideen-zurueck'() { W().weg = []; sichern(); K.zeige(); },
  'w-idee-loeschen'(b) {
    const i = W().ideen.findIndex((x) => x.id === b.dataset.id); if (i < 0) return;
    const [alt] = W().ideen.splice(i, 1); sichern(); K.zeige();
    meldung('Idee gelöscht.', `${IC.zurueck}<span>Rückgängig</span>`, () => { W().ideen.splice(i, 0, alt); sichern(); K.zeige(); }, 6000);
  },
  'w-laenge'(b) { const n = Number(b.dataset.n); if ([5, 8, 12].includes(n)) { W().laenge = n; if (W().runde && !W().runde.fertig) W().runde.n = Math.max(n, erledigt(W().runde)); sichern(); K.zeige(); } },
  async 'w-export'() {
    const name = 'kaninchenbau-' + new Date().toISOString().slice(0, 10) + '.json';
    const r = await datei(name, JSON.stringify(speicher.sicherung(K.Z, auswertungFuerDatei()), null, 1));
    if (r !== 'abgebrochen') meldung('Gesichert: ' + name);
  },
  'w-import'() {
    const i = document.createElement('input'); i.type = 'file'; i.className = 'sr';
    i.addEventListener('change', async () => {
      const f = i.files && i.files[0]; i.remove(); if (!f) return;
      try {
        if (f.size > 5e6) throw new Error('Die Datei ist zu groß für eine Kaninchenbau-Sicherung.');
        const obj = JSON.parse(await f.text()), z = speicher.ausSicherung(obj);
        const n = Object.values(z.wesen.antw).filter((a) => a.w >= 0).length;
        importDaten = { z, info: `${obj.erstellt ? 'Vom ' + new Date(obj.erstellt).toLocaleDateString('de-DE') + ': ' : ''}${n} Antworten, ${z.wesen.ideen.length} Ideen, ${z.lernen.profil?.aeste.length || 0} Gänge.` };
        K.zeige();
      } catch (e) { meldung(e instanceof SyntaxError ? 'Diese Datei ist keine gültige Sicherung.' : e.message, null, null, 5000); }
    });
    document.body.append(i); i.click();
  },
  'w-import-ja'() { if (!importDaten) return; K.Z = importDaten.z; importDaten = null; offenId = null; sichern(); K.thema(); K.zeige(); meldung('Sicherung geladen.'); },
  'w-import-nein'() { importDaten = null; K.zeige(); },
  'w-loeschen'() { loeschFrage = true; K.zeige(); },
  'w-loeschen-nein'() { loeschFrage = false; K.zeige(); },
  async 'w-loeschen-ja'() {
    loeschFrage = false; await speicher.loeschen(); K.Z = speicher.leer(); K.geloescht = true; K.ver++;
    speicher.sichern(K.Z); K.thema(); meldung('Alles gelöscht.'); location.hash = '#start'; if (zurBereich() === 'start') K.zeige();
  },
  'f:idee'(form) {
    const inp = form.querySelector('input'); const t = (inp.value || '').trim().slice(0, 280); if (!t) { inp.focus(); return; }
    W().ideen.push({ id: 'i' + Date.now().toString(36), text: t, t: Date.now() }); sichern(); K.zeige();
    meldung('Idee festgehalten.'); requestAnimationFrame(() => $('#idee-text')?.focus({ preventScroll: true }));
  }
});

export function vorRoute(name) { if (name !== 'antworten' && name !== 'bereich' && name !== 'ende') offenId = null; if (name !== 'mehr') { loeschFrage = false; importDaten = null; } }
