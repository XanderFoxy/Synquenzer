// Modul spiel – „Entweder – oder: schnelle Wahl“. Immer zwei Aussagen, eine Wahl. Kein Spiel: keine Punkte, keine Fangfragen,
// kein richtig/falsch, keine Zahl über dich. Ergebnis = dein Muster in Worten; jede Wahl lässt sich jederzeit ändern.
// Vertrag: ARCH.md §2 + Schnittstelle 0.3 (antwortListe, antwortSetzen, muster, aeste).
// Routen: spiel (Übersicht) · spiel/runde (wählen) · spiel/ergebnis (Muster) · spiel/wahlen[?id=…] (alle Wahlen ändern) · spiel/so.
// Speicher (nur über kern.speicher, Modul 'spiel'): lauf = { id, saat, i, antworten: {schritt: {w: 'a'|'b', l: links?, ms, z?}},
//   bonus (Tätigkeiten: true = ja, false = ausgelassen, null = offen), ende, vorher?: {schritt: [{w, zeit}] (höchstens 5)} }.
//   Aus der Vorlage 0.2.1 können noch quittiert, aufl und Antworten auf Kontroll-/Kopfnuss-Fragen da sein – sie werden übergangen.
// Ergebnis 'spiel' (schema 2, nur Worte, rechnen.js auswerten). Nichts wird gesendet.
import { kern } from '../../kern.js';
import { BEREICHE, BEREICH, TEILE, TEILE_HAUPT, ABLAUF, HAUPT, HAUPT_ANZAHL, DUELL_ANZAHL, SCHRITT, TYPEN, AUSSAGEN, KETTEN, PAAR } from './daten.js';
import * as R from './rechnen.js';
import { AESTE } from './aeste.js';

const M = 'spiel';
const ui = kern.ui;
const { esc, sym, marke } = ui;
const SP = (k) => (k && k.speicher) || kern.speicher;
const RUHIG = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const jetzt = () => new Date().toISOString();
const klein = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const DUELLE = ABLAUF.filter((s) => s.art === 'duell');

// ---------- Lauf ----------
const lauf = (S = kern.speicher) => S.lies(M, 'lauf', null);
const beantwortet = (l, s) => R.gewaehlt(l && l.antworten && l.antworten[s.id]);
const zahlOffen = (l, liste) => liste.filter((s) => !beantwortet(l, s)).length;
const hauptFertig = (l) => !!l && HAUPT.every((s) => beantwortet(l, s));
const duelleFertig = (l) => !!l && DUELLE.every((s) => beantwortet(l, s));
const irgendwas = (l) => !!l && ABLAUF.some((s) => beantwortet(l, s));
// Nächste offene Wahl: erst alle 40 Haupt-Wahlen, dann (nur wenn gewollt) die Tätigkeiten.
function naechster(l) {
  const h = HAUPT.find((s) => !beantwortet(l, s)); if (h) return h;
  return l.bonus === true ? DUELLE.find((s) => !beantwortet(l, s)) || null : null;
}
const vorherPlus = (V, id, a, zeit) => { V[id] = [...(V[id] || []), { w: a.w, zeit }].slice(-5); };
// Neuer Lauf. Die Wahlen des alten Laufs bleiben je Frage als „vorher“ (höchstens 5) erhalten.
function neuerLauf(S = kern.speicher) {
  const alt = lauf(S), q = new URLSearchParams(location.search), fest = kern.TEST && q.get('saat');
  const vorher = alt && alt.vorher && typeof alt.vorher === 'object' ? JSON.parse(JSON.stringify(alt.vorher)) : {};
  if (alt && alt.antworten) for (const s of ABLAUF) { const a = alt.antworten[s.id]; if (R.gewaehlt(a)) vorherPlus(vorher, s.id, a, a.z || alt.ende || alt.id); }
  const l = { id: jetzt(), saat: fest ? Number(fest) >>> 0 : (Math.random() * 4294967295) >>> 0, i: 0, antworten: {}, bonus: null, ende: null, vorher };
  S.schreib(M, 'lauf', l); return l;
}
// Eine Wahl setzen (w = 'a' | 'b' | null). Gibt false zurück, wenn sich nichts ändert. Alte Wahl → vorher.
function setzeWahl(l, s, w, ms = null) {
  const alt = l.antworten[s.id], war = R.gewaehlt(alt);
  if ((war && alt.w === w) || (!war && w === null)) return false;
  if (war) { l.vorher = l.vorher && typeof l.vorher === 'object' ? l.vorher : {}; vorherPlus(l.vorher, s.id, alt, alt.z || l.ende || l.id); }
  if (w === null) delete l.antworten[s.id];
  else l.antworten[s.id] = { w, l: (w === 'a') === (R.seiteA(s, l.saat) === 'l'), ms: war ? null : ms, z: jetzt() };
  if (w !== null && s.art === 'duell') l.bonus = true;
  l.i = ABLAUF.filter((x) => beantwortet(l, x)).length;
  return true;
}
// Ergebnis in Worten ablegen (derselbe Lauf ersetzt sein Ergebnis, statt einen neuen Eintrag anzuhängen).
function sichere(l, S) {
  const res = R.auswerten(l.antworten, { saat: l.saat }); res.lauf = l.id;
  const alt = S.ergebnis(M);
  return S.setzeErgebnis(M, res, { ersetzen: !!(alt && alt.lauf === l.id) });
}
// Nach jeder Änderung: speichern; sind die 40 Haupt-Wahlen da, gilt der Lauf als fertig und das Muster wird (neu) abgelegt.
function nachWahl(l, S) {
  if (!l.ende && hauptFertig(l)) l.ende = jetzt();
  if (l.aufl) l.aufl = null;
  S.schreib(M, 'lauf', l);
  if (l.ende) sichere(l, S);
}

// ---------- Muster (immer frisch aus den Wahlen; sonst aus dem zuletzt gespeicherten Ergebnis) ----------
let CACHE = { k: '', e: null };
function auswertung(l) {
  const k = l.id + '|' + l.saat + '|' + JSON.stringify(l.antworten);
  if (CACHE.k !== k) CACHE = { k, e: R.auswerten(l.antworten, { saat: l.saat }) };
  return CACHE.e;
}
function quelle(S) {
  const l = lauf(S);
  if (irgendwas(l)) return { l, e: auswertung(l) };
  const res = S.ergebnis(M);
  if (res) return { l, e: res.schema === 2 ? res : R.ausAlt(res), gespeichert: true, zeit: res.zeit };
  return { l, e: null };
}
const VORN = { klar: 'Klar', leicht: 'Leicht' };
function richtungSatz(B, b) {
  if (!b.richtung || b.deutlich === 'beides') return `Beides gehört zu dir – ${B.satz[2]}`;   // satz[2] beginnt mit einem Hauptwort
  const pol = b.richtung > 0 ? B.rechts : B.links;
  return `${VORN[b.deutlich] || 'Leicht'} in Richtung „${pol}“ – ${klein(B.satz[b.richtung > 0 ? 0 : 1])}`;
}
const typText = (t) => `${TYPEN[t].name} (${TYPEN[t].kurz})`;
function interessenSatz(I) {
  const v = I.vorn.map(typText).join(' und ');
  const h = I.hinten ? ` Weniger zieht dich gerade ${TYPEN[I.hinten].name} an.` : '';
  if (I.deutlich === 'klar') return `Klar vorn liegen für dich ${v}.${h}`;
  if (I.deutlich === 'leicht') return `Leicht vorn liegen für dich ${v}.${h}`;
  return `Deine Interessen verteilen sich breit – knapp vorn liegen ${v}. Vieles davon gehört zu dir.`;
}
function woherBereich(B, b, q) {
  if (!q.l || !irgendwas(q.l)) return 'Aus deinen Wahlen bei „Entweder – oder“ (zuletzt gespeichertes Muster).';
  const x = R.beispiel(q.l.antworten, B.id, b.richtung);
  return `Aus deinen Wahlen bei „Entweder – oder“ zwischen je zwei Aussagen, in denen es um ${B.thema} ging${x ? ` – zum Beispiel hast du „${x.gewaehlt}“ statt „${x.andere}“ genommen` : ''}.`;
}
function woherInteressen(q) {
  if (!q.l || !irgendwas(q.l)) return 'Aus deinen Wahlen zwischen je zwei Tätigkeiten (zuletzt gespeichertes Muster).';
  const d = DUELLE.find((s) => beantwortet(q.l, s)), a = d && q.l.antworten[d.id];
  return `Aus deinen Wahlen zwischen je zwei Tätigkeiten${a ? ` – zum Beispiel „${d[a.w].t}“ statt „${d[a.w === 'a' ? 'b' : 'a'].t}“` : ''}.`;
}

// ---------- Schnittstelle 0.3 ----------
export function muster(k) {
  const S = SP(k), q = quelle(S); if (!q.e) return [];
  const out = [];
  for (const B of BEREICHE) {
    const b = q.e.bereiche && q.e.bereiche[B.id]; if (!b) continue;
    out.push({ ast: 'spiel.' + B.id, titel: B.titel, richtung: richtungSatz(B, b), deutlich: b.deutlich, woher: woherBereich(B, b, q) });
  }
  const I = q.e.interessen;
  if (I && Array.isArray(I.vorn) && I.vorn.length === 2) out.push({ ast: 'spiel.interessen', titel: 'Was du lieber tun würdest', richtung: interessenSatz(I), deutlich: I.deutlich || 'leicht', woher: woherInteressen(q) });
  return out;
}
export function aeste() { return JSON.parse(JSON.stringify(AESTE)); }
const GRUPPE = { paar: 'Zwei Aussagen', wieder: 'Noch einmal gefragt', kette: 'Dreier-Vergleiche', duell: 'Tätigkeiten (freiwillig)' };
const frageText = (s) => `„${s.a.t}“ oder „${s.b.t}“?`;
export function antwortListe(k) {
  const S = SP(k), l = lauf(S), A = (l && l.antworten) || {}, V = (l && l.vorher) || {};
  return ABLAUF.map((s) => {
    const a = A[s.id], w = R.gewaehlt(a) ? a.w : null;
    return {
      id: s.id, gruppe: GRUPPE[s.art], frage: frageText(s), art: 'wahl', wert: w, anzeige: w ? s[w].t : '',
      optionen: [{ wert: 'a', text: s.a.t }, { wert: 'b', text: s.b.t }], route: 'spiel/wahlen?id=' + s.id,
      vorher: (Array.isArray(V[s.id]) ? V[s.id] : []).filter((v) => v && s[v.w]).map((v) => ({ wert: v.w, anzeige: s[v.w].t, zeit: v.zeit || null }))
    };
  });
}
export async function antwortSetzen(k, id, wert) {
  const S = SP(k), s = SCHRITT[id];
  if (!s) throw new Error('Entweder – oder: unbekannte Wahl ' + id);
  if (wert !== null && wert !== 'a' && wert !== 'b') throw new Error('Entweder – oder: Wert muss „a“, „b“ oder null sein');
  const l = lauf(S) || neuerLauf(S);
  if (!setzeWahl(l, s, wert)) return false;
  nachWahl(l, S);
  return true;
}

// ---------- kleine Bausteine ----------
const HINWEIS = { paar: 'Nimm, was eher stimmt – auch wenn beides oder keins ganz passt.', wieder: 'Nimm, was eher stimmt – auch wenn beides oder keins ganz passt.',
  kette: 'Nimm, was eher stimmt – auch wenn beides oder keins ganz passt.', duell: 'Egal, ob du es kannst – was würdest du lieber tun?' };
// Im Wählen selbst sichtbar, solange nichts gemerkt wird: Neuladen (Safari tut das im Hintergrund oft) fängt sonst still von vorn an.
const merkKnopf = () => (kern.speicher.einwilligung() ? '' : `<button type="button" class="sp-merk" data-aktion="merken" aria-label="Nicht gemerkt: Neuladen oder Schließen startet wieder bei Wahl 1. Antippen, um auf diesem Gerät zu merken.">${sym('schloss')}<span>Nicht gemerkt</span></button>`);
// Zwei Pole als Worte, dazwischen eine ruhige Linie – ohne Zahl, ohne Markierung. Hervorgehoben: der Pol, zu dem die Wahlen neigen (bei „beides“ beide).
function pole(B, b) {
  const an = (seite) => (!b || !b.richtung || b.deutlich === 'beides' || b.richtung === seite ? ' sp-pol-an' : '');
  return `<div class="sp-pole" aria-hidden="true"><span class="sp-pol${b ? an(-1) : ''}">${esc(B.links)}</span><span class="sp-pol-linie"></span><span class="sp-pol${b ? an(1) : ''}">${esc(B.rechts)}</span></div>`;
}
function kurzMuster(e, n = 3) {
  const RANG = { klar: 0, leicht: 1, beides: 2 };
  const z = BEREICHE.filter((B) => e.bereiche && e.bereiche[B.id]).map((B) => ({ B, b: e.bereiche[B.id] })).sort((x, y) => RANG[x.b.deutlich] - RANG[y.b.deutlich]).slice(0, n);
  return z.map(({ B, b }) => `<li>${esc(richtungSatz(B, b))}</li>`).join('');
}

// ---------- Wählen ----------
function runde(ctx) {
  const { el } = ctx, S = kern.speicher;
  ctx.titel('Entweder – oder'); ctx.zurueckZu('spiel');
  let l = lauf(S) || neuerLauf(S);
  let gesperrt = true, tZeig = 0, versteckt = false, schritt = null, modus = 'wahl';
  const timer = new Set();
  const spaeter = (fn, ms) => { const t = setTimeout(() => { timer.delete(t); if (ctx.aktuell()) fn(); }, ms); timer.add(t); };
  const sichtbar = () => { if (document.visibilityState === 'hidden') versteckt = true; };

  function male() {
    l = lauf(S) || l;
    const s = naechster(l);
    if (s) return zeige(s);
    if (!l.ende) nachWahl(l, S);
    if (l.bonus === true && duelleFertig(l)) { kern.geh('spiel/ergebnis', { ersetzen: true }); return; }
    fertig();
  }

  // s = die Wahl, nochmal = schon beantwortete Wahl erneut ansehen („Eine zurück“)
  function zeige(s, nochmal = false) {
    const fa = document.activeElement, fokus = fa && el.contains(fa) ? (fa.classList.contains('sp-links') ? '.sp-links' : fa.classList.contains('sp-rechts') ? '.sp-rechts' : fa.closest('[data-sp]') ? '.sp-links' : null) : null;
    schritt = s; modus = 'wahl'; gesperrt = true; versteckt = document.visibilityState === 'hidden';
    const T = TEILE[s.teil - 1], frei = !!T.frei, liste = frei ? DUELLE : HAUPT;
    const nr = liste.findIndex((x) => x.id === s.id) + 1, von = liste.length;
    const links = R.seiteA(s, l.saat) === 'l' ? 'a' : 'b', rechts = links === 'a' ? 'b' : 'a';
    const bisher = nochmal && beantwortet(l, s) ? l.antworten[s.id].w : null;
    const vorIx = ABLAUF.findIndex((x) => x.id === s.id) - 1;
    const knopf = (seite, w) => `<button type="button" class="sp-wahl sp-${seite}${bisher === w ? ' sp-bisher' : ''}" data-wahl="${w}"${bisher ? ` aria-pressed="${bisher === w}"` : ''}><span>${esc(s[w].t)}</span>${bisher === w ? '<small class="sp-bisher-wort">bisher</small>' : ''}</button>`;
    el.innerHTML = `<section class="sp sp-spiel sp-${T.farbe}${RUHIG() || nochmal ? '' : ' sp-rein'}" aria-labelledby="sp-h">
      <div class="sp-kopf"><h2 id="sp-h">${frei ? 'Tätigkeiten · freiwillig' : `Schnelle Wahl · Teil ${T.nr} von ${TEILE_HAUPT}`}</h2>${merkKnopf()}</div>
      <div class="sp-stand"><div class="sp-balken" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="${von}" aria-valuenow="${nr - 1}" aria-valuetext="Wahl ${nr} von ${von}"><span style="width:${Math.round(((nr - 1) / von) * 100)}%"></span></div>
        <span class="sp-nr">Wahl ${nr} von ${von}</span></div>
      <p class="sp-frage" id="sp-frage">${esc(s.frage)}</p>
      <div class="sp-paar" role="group" aria-labelledby="sp-frage" data-schritt="${esc(s.id)}">
        ${knopf('links', links)}
        <span class="sp-oder" aria-hidden="true">oder</span>
        ${knopf('rechts', rechts)}
      </div>
      <div class="sp-unten">
        <button type="button" class="knopf zweit klein" data-sp="zurueck"${vorIx >= 0 ? '' : ' disabled'}>Eine zurück</button>
        ${bisher ? '<button type="button" class="knopf zweit klein" data-sp="lassen">So lassen</button>' : `<span class="leise">${esc(HINWEIS[s.art] || '')}</span>`}
        <a class="knopf zweit klein" href="#spiel">Pause</a>
      </div></section>`;
    if (fokus) el.querySelector(fokus)?.focus({ preventScroll: true });
    requestAnimationFrame(() => { tZeig = performance.now(); });
    // Doppeltipp-Sperre wie im Fragebogen (350 ms); danach data-bereit (für Tests und Hilfsmittel)
    spaeter(() => { gesperrt = false; const g = el.querySelector('.sp-paar'); if (g) g.dataset.bereit = '1'; }, kern.TEST ? 120 : 350);
  }

  function waehle(w, knopf) {
    if (gesperrt || modus !== 'wahl' || !schritt) return;
    gesperrt = true; modus = 'warte';   // bis die nächste Wahl steht: kein zweites Tippen
    const s = schritt, frisch = !beantwortet(l, s);
    const ms = !frisch || versteckt || !tZeig ? null : Math.round(performance.now() - tZeig);
    if (setzeWahl(l, s, w, ms)) nachWahl(l, S);
    const g = el.querySelector('.sp-paar'); if (g) delete g.dataset.bereit;
    if (knopf) {
      knopf.classList.add('sp-ja');
      el.querySelectorAll('.sp-wahl').forEach((b) => { if (b !== knopf) b.classList.add('sp-nein'); b.setAttribute('aria-disabled', 'true'); });
    }
    spaeter(male, RUHIG() ? 80 : 300);
  }

  function fertig() {
    modus = 'ende';
    const e = auswertung(l), offen = !duelleFertig(l), liste = kurzMuster(e);
    el.innerHTML = `<section class="sp sp-ende sp-f1" aria-labelledby="sp-h">
      <h2 id="sp-h" tabindex="-1">Alle ${HAUPT_ANZAHL} Wahlen sind da</h2>
      <p>Danke fürs Wählen. Dein Muster steht in Worten bereit – und jede Wahl kannst du später noch ändern.</p>
      ${liste ? `<div class="karte"><b>Erste Richtungen</b><ul class="sp-kurz">${liste}</ul></div>` : ''}
      <a class="knopf haupt gross voll" href="#spiel/ergebnis">Dein Muster ansehen</a>
      ${offen ? `<div class="karte weich"><b>Noch ${zahlOffen(l, DUELLE)} Wahlen zu Tätigkeiten?</b><p>Freiwillig, etwa eine Minute: Was würdest du lieber tun? Daraus wird sichtbar, welche Arten von Tätigkeiten dich anziehen.</p>
        <button type="button" class="knopf voll" data-sp="duelle">Tätigkeiten wählen</button></div>` : ''}
      <a class="knopf zweit voll" href="#spiel/wahlen">Deine Wahlen ansehen und ändern</a>
      ${ui.merkHinweis(S.einwilligung(), 'Deine Wahlen sind beim Neuladen oder Schließen weg.')}</section>`;
    el.querySelector('#sp-h')?.focus?.({ preventScroll: true });
  }

  function zurueckSchritt() {
    if (modus !== 'wahl' || !schritt) return;
    const i = ABLAUF.findIndex((x) => x.id === schritt.id); if (i < 1) return;
    zeige(ABLAUF[i - 1], true);
    el.querySelector('.sp-wahl')?.focus({ preventScroll: true });
  }

  const klick = (ev) => {
    const b = ev.target.closest('.sp-wahl'); if (b && el.contains(b)) { ev.preventDefault(); waehle(b.dataset.wahl, b); return; }
    const k = ev.target.closest('[data-sp]'); if (!k || !el.contains(k)) return;
    const was = k.dataset.sp;
    if (was === 'zurueck') zurueckSchritt();
    else if (was === 'lassen') { if (modus === 'wahl') male(); }
    else if (was === 'duelle') { l.bonus = true; S.schreib(M, 'lauf', l); male(); }
  };
  const taste = (ev) => {
    if (modus !== 'wahl' || ev.defaultPrevented || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    if (document.querySelector('dialog[open]')) return;
    const seite = ev.key === 'ArrowLeft' || ev.key === '1' ? '.sp-links' : ev.key === 'ArrowRight' || ev.key === '2' ? '.sp-rechts' : null;
    if (!seite) return;
    const b = el.querySelector(seite); if (!b) return;
    ev.preventDefault(); gesperrt = false; waehle(b.dataset.wahl, b);   // Tastatur ohne Doppeltipp-Sperre
  };
  // „Merken“ eingeschaltet: Hinweise sofort weg
  const einw = kern.on('einwilligung', ({ an }) => { if (an) el.querySelectorAll('.sp-merk,[data-merk-hinweis]').forEach((x) => x.remove()); });
  el.addEventListener('click', klick); document.addEventListener('keydown', taste); document.addEventListener('visibilitychange', sichtbar);
  male();
  return () => { einw(); el.removeEventListener('click', klick); document.removeEventListener('keydown', taste); document.removeEventListener('visibilitychange', sichtbar); for (const t of timer) clearTimeout(t); timer.clear(); };
}

// ---------- Übersicht ----------
function uebersicht(ctx) {
  const { el } = ctx, S = kern.speicher;
  ctx.titel('Entweder – oder');
  const male = () => {
    const l = lauf(S), q = quelle(S), nHaupt = l ? HAUPT_ANZAHL - zahlOffen(l, HAUPT) : 0;
    const imHaupt = l && nHaupt > 0 && !hauptFertig(l), imDuell = hauptFertig(l) && l.bonus === true && !duelleFertig(l);
    let knoepfe;
    if (imHaupt) knoepfe = `<a class="knopf haupt gross voll" href="#spiel/runde">Weiter wählen <span class="klein">· Wahl ${nHaupt + 1} von ${HAUPT_ANZAHL}</span></a>`;
    else if (imDuell) knoepfe = `<a class="knopf haupt gross voll" href="#spiel/runde">Weiter mit den Tätigkeiten</a>`;
    else if (q.e) knoepfe = `<a class="knopf haupt gross voll" href="#spiel/ergebnis">Dein Muster ansehen</a>`;
    else knoepfe = `<a class="knopf haupt gross voll" href="#spiel/runde">Anfangen</a>`;
    if (irgendwas(l)) knoepfe += `<a class="knopf zweit voll" href="#spiel/wahlen">Deine Wahlen ansehen und ändern</a>`;
    const kurz = q.e ? kurzMuster(q.e) : '';
    el.innerHTML = `<div class="sp sp-f1">
      <section class="sp-held" aria-labelledby="sp-h"><h2 id="sp-h">Entweder – oder</h2>
        <p><b>Schnelle Wahl zwischen zwei Möglichkeiten:</b> ${HAUPT_ANZAHL}-mal zwei Aussagen – du nimmst, was eher zu dir passt. Etwa 3 Minuten.</p>
        <div class="sp-vs" aria-hidden="true"><span>Ich liebe große Feiern.</span><span>Ich träume gern vor mich hin.</span></div>
        <p class="klein">Es gibt kein richtig oder falsch und keine Eile. Am Ende steht dein Muster in Worten – und jede Wahl kannst du jederzeit ändern.</p></section>
      ${kurz ? `<div class="karte"><b>Dein Muster bisher</b>${q.gespeichert && q.zeit ? ` <span class="leise klein">vom ${esc(ui.datum(q.zeit))}</span>` : ''}<ul class="sp-kurz">${kurz}</ul></div>` : ''}
      ${knoepfe}
      <ul class="zeilen">
        ${q.e ? `<li><a class="zeile" href="#muster"><span><b>Dein ganzes Muster</b><small>Alle Äste, auch aus den anderen Teilen der App</small></span><span class="rechts">${sym('weiter')}</span></a></li>` : ''}
        <li><a class="zeile" href="#spiel/so"><span><b>So funktioniert’s</b><small>Wie aus deinen Wahlen ein Muster in Worten wird</small></span><span class="rechts">${sym('weiter')}</span></a></li>
      </ul>
      ${irgendwas(l) ? '<button type="button" class="knopf zweit voll" data-sp="neu">Von vorn wählen</button>' : ''}
      <div class="karte weich"><p><b>Ehrlich gesagt:</b> Das ist keine Diagnose und kein Test. Es zeigt Richtungen, in die deine Wahlen neigen – beide Seiten jeder Richtung haben ihre Stärken. ${marke('abgeleitet', ['brown2011', 'johnson2014'])}</p>
        <p class="klein leise">Die Aussagen stammen aus dem gemeinfreien IPIP (eigene, vorläufige Übersetzung), die Tätigkeiten aus dem O*NET Interest Profiler. Alles wird auf deinem Gerät gerechnet.</p></div>
      ${ui.merkHinweis(S.einwilligung(), 'Deine Wahlen und dein Muster sind beim Neuladen oder Schließen weg.')}
      ${ui.fuss()}</div>`;
  };
  male();
  const klick = async (ev) => {
    const k = ev.target.closest('[data-sp=neu]'); if (!k) return;
    if (!(await ui.bestaetige({ titel: 'Von vorn wählen?', text: 'Alle Wahlen werden geleert, und du wählst noch einmal neu. Deine bisherigen Wahlen bleiben je Paar als „vorher“ sichtbar.', ja: 'Von vorn wählen' }))) return;
    neuerLauf(S); kern.geh('spiel/runde');
  };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', male);
  return () => { el.removeEventListener('click', klick); aus(); };
}

// ---------- Muster ----------
function ergebnis(ctx) {
  const { el } = ctx, S = kern.speicher;
  ctx.titel('Dein Muster'); ctx.zurueckZu('spiel');
  const male = () => {
    const q = quelle(S), e = q.e, l = q.l;
    if (!e || (!Object.keys(e.bereiche || {}).length && !e.interessen)) {
      el.innerHTML = `<div class="sp sp-f1"><h2>Noch kein Muster</h2><p>${irgendwas(l) ? 'Für ein Muster braucht es noch ein paar Wahlen mehr.' : 'Wähle einmal „Entweder – oder“, dann steht hier dein Muster in Worten.'}</p>
        <a class="knopf haupt voll" href="#spiel/runde">${irgendwas(l) ? 'Weiter wählen' : 'Anfangen'}</a>${ui.fuss()}</div>`;
      return;
    }
    const bereiche = BEREICHE.map((B) => {
      const b = e.bereiche[B.id];
      return `<section class="karte sp-ri" aria-labelledby="sp-r-${B.id}"><h3 id="sp-r-${B.id}">${esc(B.titel)}</h3>
        ${pole(B, b)}
        ${b ? `<p class="sp-satz">${esc(richtungSatz(B, b))}</p><p class="klein leise">${esc(woherBereich(B, b, q))}</p>`
    : '<p class="sp-satz leise">Noch offen – dazu fehlen noch ein paar Wahlen.</p>'}
        <a class="link sp-ast" href="#muster/ast/spiel.${B.id}">Mehr über diesen Ast: ${esc(B.titel)}${sym('weiter')}</a></section>`;
    }).join('');

    const zw = (e.zweimal || []).filter((x) => !x.gleich), kr = (e.dreier || []).filter((x) => x.kreis);
    const beides = l && irgendwas(l) ? (zw.length || kr.length ? `<section class="karte" aria-labelledby="sp-z"><h3 id="sp-z">Einmal so, einmal so</h3>
      <ul class="sp-liste">${zw.map((x) => { const p = PAAR[x.von], a = l.antworten[x.von], b = l.antworten[x.id];
        return a && b ? `<li>„${esc(AUSSAGEN[p.a].t)}“ oder „${esc(AUSSAGEN[p.b].t)}“: Einmal hast du „${esc(AUSSAGEN[a.w === 'a' ? p.a : p.b].t)}“ genommen, beim zweiten Mal „${esc(AUSSAGEN[b.w === 'a' ? p.a : p.b].t)}“.</li>` : ''; }).join('')}
        ${kr.map((x) => { const K = KETTEN.find((y) => y.id === x.id); return K ? `<li>${K.aus.map((id) => `„${esc(AUSSAGEN[id].t)}“`).join(', ')}: Jede dieser drei lag einmal vorn.</li>` : ''; }).join('')}</ul>
      <p>Hier hast du einmal so, einmal so gewählt – beides gehört zu dir. Oft heißt das: Beide Seiten passen, je nach Tag und Lage. ${marke('abgeleitet', ['kendall1940'])}</p></section>`
      : (e.zweimal || []).length ? '<p class="klein leise">Bei den Paaren, die zweimal kamen, hast du beide Male gleich gewählt.</p>' : '') : '';

    const zg = e.zoegern && e.zoegern.length ? `<section class="karte" aria-labelledby="sp-l"><h3 id="sp-l">Hier hast du länger überlegt</h3>
      <ul class="sp-liste">${e.zoegern.map((z) => `<li>„${esc(z.gewaehlt)}“ statt „${esc(z.andere)}“</li>`).join('')}</ul>
      <p class="klein">Langes Überlegen heißt oft: Beides passt ein bisschen – oder keins ganz. ${marke('abgeleitet', ['ferrando2007'])}</p></section>` : '';

    const I = e.interessen;
    let intr = '';
    if (I && Array.isArray(I.vorn)) {
      intr = `<section class="karte sp-ri" aria-labelledby="sp-i"><h3 id="sp-i">Was du lieber tun würdest</h3>
        <p class="sp-satz">${esc(interessenSatz(I))}</p>
        <ul class="sp-liste">${I.vorn.map((t) => `<li><b>${esc(TYPEN[t].name)}:</b> ${esc(TYPEN[t].kurz)}</li>`).join('')}</ul>
        <p class="klein leise">${esc(woherInteressen(q))} Es geht darum, was dich anzieht – nicht darum, was du kannst. ${marke('abgeleitet', ['armstrong2008', 'onet'])}</p>
        <a class="link sp-ast" href="#muster/ast/spiel.interessen">Mehr über diesen Ast: Was du lieber tun würdest${sym('weiter')}</a></section>`;
    } else if (l && hauptFertig(l)) {
      intr = `<div class="karte weich"><b>Tätigkeiten (freiwillig)</b><p>Noch ${zahlOffen(l, DUELLE)} Wahlen, etwa eine Minute: Was würdest du lieber tun? Daraus wird sichtbar, welche Arten von Tätigkeiten dich anziehen.</p><button type="button" class="knopf voll" data-sp="duelle">Tätigkeiten wählen</button></div>`;
    }

    const grenzen = `<section class="karte weich" aria-labelledby="sp-g"><h3 id="sp-g">Was das Muster nicht ist</h3><ul>
      <li>Keine Diagnose und kein Test. Es gibt hier kein besser oder schlechter – jede Seite einer Richtung hat ihre Stärken.</li>
      <li>Kein Vergleich mit anderen Menschen: Es zeigt nur, welche Seiten in deinen eigenen Wahlen öfter vorn lagen.</li>
      <li>„Beides gehört zu dir“ heißt: Deine Wahlen halten sich ungefähr die Waage. Das ist eine eigene Richtung, keine Lücke.</li>
      <li>Tagesform zählt: Müde, gestresst oder abgelenkt wählst du vielleicht anders. Du kannst jede Wahl jederzeit ändern.</li>
      <li>Die Übersetzungen der Aussagen sind eigene und vorläufig.</li></ul></section>`;

    el.innerHTML = `<div class="sp sp-f1"><h2>Dein Muster aus Entweder – oder</h2>
      <p class="lead">So zeigen sich deine Wahlen – in Worten, mit zwei gleichwertigen Seiten je Richtung.</p>
      ${q.gespeichert && q.zeit ? `<p class="klein leise">Aus deinem zuletzt gespeicherten Muster vom ${esc(ui.datum(q.zeit, true))}.</p>` : ''}
      ${bereiche}${intr}${beides}${zg}${grenzen}
      <div class="stapel"><a class="knopf haupt" href="#spiel/wahlen">Deine Wahlen ansehen und ändern</a><a class="knopf zweit" href="#muster">Dein ganzes Muster</a><a class="knopf zweit" href="#spiel/so">So funktioniert’s</a></div>
      ${ui.merkHinweis(S.einwilligung(), 'Deine Wahlen und dein Muster sind beim Neuladen oder Schließen weg.')}${ui.fuss()}</div>`;
  };
  male();
  const klick = (ev) => {
    const k = ev.target.closest('[data-sp=duelle]'); if (!k) return;
    const l = lauf(S); if (!l) return; l.bonus = true; S.schreib(M, 'lauf', l); kern.geh('spiel/runde');
  };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', male);
  return () => { el.removeEventListener('click', klick); aus(); };
}

// ---------- Alle Wahlen ansehen und ändern ----------
function wahlen(ctx) {
  const { el } = ctx, S = kern.speicher;
  ctx.titel('Deine Wahlen'); ctx.zurueckZu('spiel');
  const nrIn = Object.fromEntries(HAUPT.filter((s) => s.art === 'paar').map((s, i) => [s.id, i + 1]));
  const eintrag = (s, l) => {
    const a = l && l.antworten[s.id], w = R.gewaehlt(a) ? a.w : null;
    const V = (l && l.vorher && Array.isArray(l.vorher[s.id]) ? l.vorher[s.id] : []).filter((v) => v && s[v.w]);
    const v = V.length ? V[V.length - 1] : null;
    const zusatz = s.art === 'wieder' ? `Dasselbe Paar wie Paar ${nrIn[s.von]} – es kam zweimal.` : '';
    const info = [zusatz, w ? '' : 'noch offen', v && v.w !== w ? `vorher: „${s[v.w].t}“` : ''].filter(Boolean).join(' · ');
    const knopf = (x) => `<button type="button" class="sp-w-knopf" data-id="${esc(s.id)}" data-wert="${x}" aria-pressed="${w === x}">${w === x ? sym('haken') : ''}<span>${esc(s[x].t)}</span></button>`;
    return `<li class="sp-w${w ? '' : ' sp-w-offen'}" id="sp-w-${esc(s.id)}"><div class="sp-w-paar" role="group" aria-label="${esc(frageText(s))}">${knopf('a')}<span class="sp-w-oder" aria-hidden="true">oder</span>${knopf('b')}</div>
      ${info ? `<p class="sp-w-info klein leise">${esc(info)}</p>` : ''}</li>`;
  };
  const stand = (l) => { const n = ABLAUF.length - zahlOffen(l, ABLAUF); return `${n} von ${ABLAUF.length} Wahlen getroffen${hauptFertig(l) ? '' : ` · noch ${zahlOffen(l, HAUPT)} der ${HAUPT_ANZAHL} Haupt-Wahlen offen`}`; };
  const male = () => {
    const l = lauf(S);
    const gruppe = (art, titel, text) => { const liste = ABLAUF.filter((s) => s.art === art);
      return `<section class="sp-wg" aria-labelledby="sp-wg-${art}"><h3 id="sp-wg-${art}">${esc(titel)}</h3>${text ? `<p class="klein leise">${esc(text)}</p>` : ''}<ul class="sp-wl">${liste.map((s) => eintrag(s, l)).join('')}</ul></section>`; };
    el.innerHTML = `<div class="sp sp-f1"><h2>Deine Wahlen</h2>
      <p>Hier steht jedes Paar mit deiner Wahl. Tippe auf die andere Seite, um umzuwählen – dein Muster rechnet sofort neu.</p>
      <p class="klein leise" id="sp-w-stand" aria-live="polite">${esc(stand(l))}</p>
      <div class="stapel"><a class="knopf zweit" href="#spiel/ergebnis">Zu deinem Muster</a>${hauptFertig(l) ? '' : '<a class="knopf zweit" href="#spiel/runde">Weiter wählen</a>'}</div>
      ${gruppe('paar', GRUPPE.paar, '')}
      ${gruppe('wieder', GRUPPE.wieder, 'Diese Paare kamen zweimal, mit getauschten Seiten. Wählst du einmal so, einmal so, gehört beides zu dir.')}
      ${gruppe('kette', GRUPPE.kette, 'Drei Aussagen, jede gegen jede.')}
      ${gruppe('duell', GRUPPE.duell, 'Was würdest du lieber tun – egal, ob du es kannst.')}
      <div class="stapel"><a class="knopf haupt" href="#spiel/ergebnis">Zu deinem Muster</a></div>
      ${ui.merkHinweis(S.einwilligung(), 'Deine Wahlen sind beim Neuladen oder Schließen weg.')}${ui.fuss()}</div>`;
  };
  male();
  const ziel = ctx.param && ctx.param.id && SCHRITT[ctx.param.id] ? el.querySelector('#sp-w-' + ctx.param.id) : null;
  if (ziel) { ziel.classList.add('sp-w-ziel'); requestAnimationFrame(() => { try { ziel.scrollIntoView({ block: 'center' }); } catch {} ziel.querySelector('.sp-w-knopf')?.focus({ preventScroll: true }); }); }
  const klick = (ev) => {
    const b = ev.target.closest('.sp-w-knopf'); if (!b || !el.contains(b)) return;
    const s = SCHRITT[b.dataset.id], w = b.dataset.wert; if (!s || (w !== 'a' && w !== 'b')) return;
    let l = lauf(S) || neuerLauf(S);
    if (!setzeWahl(l, s, w)) return;
    nachWahl(l, S); l = lauf(S);
    const li = el.querySelector('#sp-w-' + s.id);
    if (li) { li.outerHTML = eintrag(s, l); el.querySelector(`#sp-w-${s.id} [data-wert="${w}"]`)?.focus({ preventScroll: true }); }
    const st = el.querySelector('#sp-w-stand'); if (st) st.textContent = stand(l);
    ui.meldung(hauptFertig(l) ? 'Geändert – dein Muster ist neu berechnet.' : 'Gemerkt.', 1800);
  };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', () => el.querySelectorAll('[data-merk-hinweis]').forEach((x) => x.remove()));
  return () => { el.removeEventListener('click', klick); aus(); };
}

// ---------- So funktioniert’s ----------
function so(ctx) {
  const { el } = ctx;
  ctx.titel('So funktioniert’s'); ctx.zurueckZu('spiel');
  el.innerHTML = `<div class="sp sp-f3"><h2>So funktioniert’s</h2>
    <p class="lead">Hinter „Entweder – oder“ steckt ein Gedanke aus der Forschung: Aus vielen kleinen Vergleichen wird eine Richtung sichtbar.</p>

    <section class="karte"><h3>1. Warum immer zwei Aussagen?</h3>
      <p>Bei einzelnen Aussagen („Stimmt das für dich?“) sagt man leicht zu allem Guten Ja. Wenn zwei Aussagen nebeneinanderstehen, die beide gut klingen können, zeigt sich klarer, was dir näher ist. ${marke('belegt', ['cao2019'])}</p>
      <p>Die Aussagen kommen aus dem gemeinfreien IPIP-Fragebogen, je 12 zu den fünf großen Bereichen der Persönlichkeit (Big Five). ${marke('belegt', ['johnson2014'])}</p></section>

    <section class="karte"><h3>2. Wie aus Wahlen eine Richtung wird</h3>
      <p>Jede Wahl ist ein Vergleich: Welche der beiden Aussagen spricht dich mehr an? (Thurstone, 1927) ${marke('belegt', ['thurstone1927'])}</p>
      <p>Jede Wahl schiebt eine Richtung ein kleines Stück. Zeigen viele Wahlen in dieselbe Richtung, heißt es <b>„klar in Richtung …“</b>, zeigen einige dorthin, <b>„leicht in Richtung …“</b>. Halten sie sich die Waage, heißt es <b>„beides gehört zu dir“</b>.</p>
      <p>Damit nicht einfach nur eine Reihenfolge herauskommt, steht in vielen Paaren eine Aussage <i>für</i> einen Bereich gegen eine Aussage, die <i>für die andere Seite</i> eines Bereichs spricht. ${marke('belegt', ['brown2011', 'brown2013', 'buerkner2019'])}</p>
      <p class="klein leise">Für Fachleute: Thurstone-Modell für Paare (Thurstonian IRT) mit angenommenen, nicht geschätzten Aussagen-Werten; Schätzung auf dem Gerät. Die Rechnung bleibt innen – nach außen gehen nur Worte.</p></section>

    <section class="karte"><h3>3. Zwei Seiten, beide gleich viel wert</h3>
      <p>Jede Richtung hat zwei Pole, zum Beispiel „Neues“ und „Vertrautes“ oder „feinfühlig“ und „gelassen“. Keiner ist besser. Wer Neues sucht, gewinnt Breite, wer beim Vertrauten bleibt, oft Tiefe. Du siehst nur, wohin deine eigenen Wahlen neigen – nicht, wie du im Vergleich zu anderen Menschen liegst.</p></section>

    <section class="karte"><h3>4. Paare, die zweimal kommen</h3><ul>
      <li><b>Noch einmal gefragt:</b> Vier Paare kommen später noch einmal, mit getauschten Seiten. Wählst du einmal so, einmal so, heißt das nur: Beides passt zu dir.</li>
      <li><b>Dreier-Vergleiche:</b> Drei Aussagen, jede gegen jede. Liegt jede einmal vorn, sprechen dich die drei ähnlich an. ${marke('belegt', ['kendall1940'])}</li>
      <li><b>Länger überlegt:</b> Die App merkt sich, wo du länger gebraucht hast als sonst. Dort passt oft beides ein bisschen. Eile gibt es keine – nimm dir die Zeit, die du brauchst. ${marke('abgeleitet', ['ferrando2007'])}</li></ul></section>

    <section class="karte"><h3>5. Alles änderbar</h3>
      <p>Jede Wahl kannst du unter „Deine Wahlen“ ansehen und umwählen; dein Muster rechnet sofort neu. Die vorige Wahl bleibt klein als „vorher“ stehen.</p>
      <a class="knopf zweit voll" href="#spiel/wahlen">Deine Wahlen</a></section>

    <section class="karte weich"><h3>6. Ehrliche Grenzen</h3><ul>
      <li>Keine Diagnose, kein Test. Es zeigt Richtungen in Worten.</li>
      <li>Die Werte der einzelnen Aussagen sind angenommen (alle gleich stark), nicht an vielen Menschen geschätzt. Darum spricht die App vorsichtig von Richtungen.</li>
      <li>Mit 12 Aussagen je Bereich ist das Bild grob. Tagesform und Stimmung können es verschieben.</li>
      <li>Die Übersetzungen sind eigene und vorläufig.</li></ul></section>

    <p class="mitte"><a class="link" href="#einstellungen/quellen">Woher das Wissen kommt</a></p>
    <a class="knopf haupt voll" href="#spiel">Zu Entweder – oder</a>${ui.fuss()}</div>`;
}

export default {
  id: M,
  schema: 1,
  start() {
    ui.ladeStil(new URL('./stil.css', import.meta.url).href);
    if (kern.TEST) window.__spiel = { ABLAUF, SCHRITT, TEILE, HAUPT_ANZAHL, DUELL_ANZAHL, BEREICH, R, lauf: () => lauf(), muster: () => muster(kern), antwortListe: () => antwortListe(kern), antwortSetzen: (id, w) => antwortSetzen(kern, id, w), aeste };
  },
  ansicht(ctx) {
    const u = ctx.pfad[1];
    if (u === 'runde') return runde(ctx);
    if (u === 'ergebnis') return ergebnis(ctx);
    if (u === 'wahlen') return wahlen(ctx);
    if (u === 'so') return so(ctx);
    return uebersicht(ctx);
  }
};
