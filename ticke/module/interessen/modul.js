// M2 interessen – Interessen nach Holland (RIASEC), Tagesrhythmus, Ehrlichkeit-Bescheidenheit. Vertrag: ARCH.md §2–§4.
// Routen: fragen/interessen (Übersicht) · …/riasec (+ /bogen, ?genauer=1, ?frage=<id>) · …/rhythmus (+ /eingabe) · …/ehrlichkeit (+ /bogen, ?frage=<id>).
// Ergebnisse: interessen.riasec, interessen.rhythmus, interessen.ehrlichkeit (ARCH.md §3.3, Format unverändert; Rhythmus zusätzlich „eingabe“).
// Zwischenstände: m.interessen (riasec, ehrlichkeit, rhythmus wie bisher; neu: vorher = { '<antwort-id>': [{wert, anzeige, zeit}] }, neueste zuerst, höchstens 5).
// Anzeige: nur Richtungen in Worten – keine Zahl, kein Balken, kein Platz, keine Wertung. Zahlen im Ergebnis sind nur Rechenweg (andere Module lesen sie).
// Zusätzliche Exporte (Vertrag zwischen den Modulen): antwortListe, antwortSetzen, muster, aeste.
import { kern } from '../../kern.js';
import * as D from './daten.js';
import * as R from './rechnen.js';
import { AESTE } from './texte.js';

const B = 'fragen/interessen';
const K = { E: 'interessen.ehrlichkeit', R: 'interessen.riasec', Y: 'interessen.rhythmus' };
const ui = kern.ui, S = kern.speicher;
const { esc, sym, marke, aussage } = ui;
const lies = (k, std) => S.lies('interessen', k, std);
const schreib = (k, v) => S.schreib('interessen', k, v);
const sp = (k) => (k && k.speicher) || S;
const num = (x) => typeof x === 'number' && Number.isFinite(x);
const jung = () => kern.einst().alter === 'u16';
const ast = (id) => '#muster/ast/' + id;
const merk = () => S.einwilligung() ? '' :
  `<div class="hinweis gelb" data-ia-merk><p><b>Nur für jetzt:</b> Deine Antworten sind nicht gemerkt und beim Neuladen oder Schließen weg.</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
const nichtHeisst = (punkte) => `<div class="karte weich"><h3>Was das nicht heißt</h3><ul>${punkte.join('')}</ul></div>`;
const li = (t) => `<li>${t}</li>`;
const knoepfe = (extra = '') => `<div class="stapel"><a class="knopf haupt" href="#antworten/interessen">Antworten ansehen und ändern</a>
  <a class="knopf zweit" href="#muster">Zu deinem Muster</a>${extra}<a class="knopf zweit" href="#fragen">Zu allen Fragen</a></div>`;

// Klicks auf [data-ia] im Inhalt; liefert die Aufräum-Funktion (auch für „einwilligung“).
function binde(el, aktionen) {
  const klick = (e) => { const b = e.target.closest('[data-ia]'); if (b && el.contains(b) && aktionen[b.dataset.ia]) { e.preventDefault(); aktionen[b.dataset.ia](b, e); } };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', () => el.querySelectorAll('[data-ia-merk]').forEach((m) => { if (S.einwilligung()) m.remove(); }));
  return () => { el.removeEventListener('click', klick); aus(); };
}

// Zwei gleichwertige Pole nebeneinander (kein Balken, keine Skala). an: 0 | 1 | 'beide'
function pole(p, an, label) {
  return `<div class="ia-pole" role="group" aria-label="${esc(label)}">${p.map((x, i) => { const on = an === 'beide' || an === i;
    return `<div class="ia-pol${on ? ' an' : ''}"><b>${esc(x.name)}</b><span>${esc(x.text)}</span>${on ? `<small>${an === 'beide' ? 'gehört zu dir' : 'deine Richtung'}</small>` : ''}</div>`; }).join('')}</div>`;
}

export default {
  id: 'interessen',
  schema: 1,
  migriere(daten) { return daten; },
  start(k) { k.ui.ladeStil(new URL('./stil.css', import.meta.url).href); },
  ansicht(ctx) {
    const [, , teil, unter] = ctx.pfad;
    if (teil === 'riasec') return unter === 'bogen' ? riasecBogen(ctx) : riasecSeite(ctx);
    if (teil === 'rhythmus') return unter === 'eingabe' || !gueltig(S.ergebnis(K.Y)) ? rhythmusEingabe(ctx) : rhythmusErgebnis(ctx);
    if (teil === 'ehrlichkeit') return unter === 'bogen' ? ehrlichBogen(ctx) : ehrlichSeite(ctx);
    return uebersicht(ctx);
  }
};
const gueltig = (e) => !!(e && e.schema === 1);
// Start-Fragebogen läuft (kern.weg, Integration) → nach einem Teil und bei „Pause“ zurück zu #los, sonst zur eigenen Seite.
const wegZiel = () => (kern.weg ? kern.weg.nachBogen() : null);
const startBei = (liste, id) => { const i = id ? liste.findIndex((f) => f.id === id) : -1; return i >= 0 ? i : undefined; };

// ======================================================================= Antworten: vorher, neu rechnen
const tageText = (n) => (n === 0 ? 'an keinem Tag' : n === 1 ? 'an 1 Tag' : `an ${n} Tagen`);
const ZEIT_FRAGE = { arbeitEin: 'Einschlafen an Tagen mit Termin', arbeitAuf: 'Aufwachen an Tagen mit Termin', freiEin: 'Einschlafen an freien Tagen', freiAuf: 'Aufwachen an freien Tagen' };
const WECKER = [{ wert: false, text: 'Nein, ich wache von selbst auf' }, { wert: true, text: 'Ja' }];
const textAus = (liste, w) => { const o = liste.find((x) => x.wert === w); return o ? o.text : ''; };
function anzeigeVon(id, w) {
  if (w === null || w === undefined || w === '') return '';
  const [teil, f] = String(id).split('.');
  if (teil === 'ehrlichkeit') return textAus(ui.SKALA5, w);
  if (teil === 'riasec') return textAus(D.SKALA_GERN, w);
  if (f === 'tage') return tageText(w);
  if (ZEIT_FRAGE[f]) return `${w} Uhr`;
  if (f === 'weckerFrei') return textAus(WECKER, w);
  if (f === 'selbst') return textAus(D.SELBST, w);
  return String(w);
}
// Alte Antworten merken (neueste zuerst, höchstens 5 je Frage). eintraege: [{ id, wert }] mit dem ALTEN Wert.
function merkeVorher(Sp, eintraege) {
  const v = { ...(Sp.lies('interessen', 'vorher', {}) || {}) }, zeit = new Date().toISOString(); let n = 0;
  for (const { id, wert } of eintraege) {
    if (wert === null || wert === undefined || wert === '') continue;
    v[id] = [{ wert, anzeige: anzeigeVon(id, wert), zeit }, ...(Array.isArray(v[id]) ? v[id] : [])].slice(0, 5); n++;
  }
  if (n) Sp.schreib('interessen', 'vorher', v);
}
const merkeAlle = (Sp, teil, antworten) => merkeVorher(Sp, Object.entries(antworten || {}).filter(([, w]) => num(w)).map(([id, wert]) => ({ id: teil + '.' + id, wert })));

// Ehrlichkeit nach einer Änderung: läuft ein Durchgang (oder gibt es noch kein Ergebnis) → erst fertig, wenn alles beantwortet ist;
// sonst sofort neu rechnen und das jüngste Ergebnis ersetzen (Korrektur, kein neuer Eintrag im Verlauf).
function ehrlichNeu(Sp) {
  const st = Sp.lies('interessen', 'ehrlichkeit', {}) || {}, a = st.antworten || {}, alt = Sp.ergebnis(K.E);
  if (st.laeuft || !gueltig(alt)) {
    if (!D.EHRLICHKEIT.every((f) => num(a[f.id]))) return 'gemerkt';
    Sp.setzeErgebnis(K.E, R.ehrlichkeitAuswerten(a)); Sp.schreib('interessen', 'ehrlichkeit', { antworten: a, laeuft: false }); return 'neu';
  }
  const erg = R.ehrlichkeitAuswerten(a);
  if (!erg) { Sp.loescheErgebnis(K.E); return 'geloescht'; }
  Sp.setzeErgebnis(K.E, erg, { ersetzen: true }); return 'neu';
}
function riasecNeu(Sp) {
  const st = Sp.lies('interessen', 'riasec', {}) || {}, a = st.antworten || {}, alt = Sp.ergebnis(K.R);
  const kurzVoll = D.RIASEC_KURZ.every((f) => num(a[f.id])), allesVoll = D.RIASEC.every((f) => num(a[f.id]));
  if ((st.laeuft && !st.genauer) || !gueltig(alt)) {          // erster Durchgang (oder „noch einmal“) läuft
    if (!kurzVoll) return 'gemerkt';
    Sp.setzeErgebnis(K.R, R.riasecAuswerten(a, allesVoll ? 'voll' : 'kurz'));
    Sp.schreib('interessen', 'riasec', { antworten: a, laeuft: false, genauer: false }); return 'neu';
  }
  const erg = R.riasecAuswerten(a, allesVoll ? 'voll' : 'kurz');
  if (!erg) { Sp.loescheErgebnis(K.R); return 'geloescht'; }
  Sp.setzeErgebnis(K.R, erg, { ersetzen: true });
  if (st.genauer && allesVoll) Sp.schreib('interessen', 'riasec', { antworten: a, laeuft: false, genauer: false });
  return 'neu';
}
const LEER = { tage: null, freiEin: '', freiAuf: '', arbeitEin: '', arbeitAuf: '', weckerFrei: null, selbst: null };
const eingabeVon = (e) => Object.fromEntries(Object.keys(LEER).map((f) => [f, e[f] === undefined ? LEER[f] : e[f]]));
const istLeer = (e) => Object.keys(LEER).every((f) => e[f] === null || e[f] === undefined || e[f] === '');
function rhythmusNeu(Sp) {
  const e = { ...LEER, ...(Sp.lies('interessen', 'rhythmus', {}) || {}) };
  if (istLeer(e)) { if (Sp.ergebnis(K.Y)) Sp.loescheErgebnis(K.Y); return { ok: true, ergebnis: 'geloescht' }; }
  const r = R.rhythmusAuswerten(e);
  // Antwort ist gemerkt, aber noch unvollständig: das bisherige Ergebnis bleibt stehen, bis die fehlende Angabe da ist.
  if (r.fehler) return { ok: true, ergebnis: 'gemerkt', hinweis: r.fehler + (gueltig(Sp.ergebnis(K.Y)) ? ' Bis dahin bleibt die bisherige Richtung stehen.' : '') };
  Sp.setzeErgebnis(K.Y, { ...r, eingabe: eingabeVon(e) }, { ersetzen: gueltig(Sp.ergebnis(K.Y)) });
  return { ok: true, ergebnis: 'neu' };
}

// ======================================================================= Vertrag: antwortListe / antwortSetzen
export function antwortListe(k = kern) {
  const Sp = sp(k), L = (s, std) => Sp.lies('interessen', s, std);
  const vor = L('vorher', {}) || {}, out = [];
  const vh = (id) => (Array.isArray(vor[id]) ? vor[id].slice(0, 5) : []);
  const add = (o) => out.push({ ...o, anzeige: anzeigeVon(o.id, o.wert), vorher: vh(o.id) });
  const ea = (L('ehrlichkeit', {}) || {}).antworten || {};
  for (const f of D.EHRLICHKEIT) add({ id: 'ehrlichkeit.' + f.id, gruppe: 'Ehrlichkeit und Bescheidenheit', frage: f.text, art: 'wahl',
    wert: num(ea[f.id]) ? ea[f.id] : null, optionen: ui.SKALA5.map(({ wert, text }) => ({ wert, text })), route: `${B}/ehrlichkeit/bogen?frage=${f.id}` });
  const ra = (L('riasec', {}) || {}).antworten || {}, er = Sp.ergebnis(K.R);
  const mitRest = D.RIASEC_REST.some((f) => num(ra[f.id])) || (gueltig(er) && er.form === 'voll');
  for (const t of D.REIHE) for (const f of D.RIASEC.filter((x) => x.typ === t && (x.k || mitRest))) add({ id: 'riasec.' + f.id, gruppe: 'Interessen: ' + D.TYPEN[t].name,
    frage: f.text, art: 'wahl', wert: num(ra[f.id]) ? ra[f.id] : null, optionen: D.SKALA_GERN.map(({ wert, text }) => ({ wert, text })),
    route: `${B}/riasec/bogen?${f.k ? '' : 'genauer=1&'}frage=${f.id}` });
  const e = { ...LEER, ...(L('rhythmus', {}) || {}) }, G = 'Tagesrhythmus', Ro = `${B}/rhythmus/eingabe`;
  const t = num(e.tage) ? e.tage : null;
  add({ id: 'rhythmus.tage', gruppe: G, frage: 'An wie vielen Tagen pro Woche musst du zu einer festen Zeit aufstehen?', art: 'wahl', wert: t,
    optionen: [0, 1, 2, 3, 4, 5, 6, 7].map((n) => ({ wert: n, text: String(n) })), route: Ro });
  const felder = [...(t === null || t > 0 ? ['arbeitEin', 'arbeitAuf'] : []), ...(t === null || t < 7 ? ['freiEin', 'freiAuf'] : [])];
  for (const f of felder) add({ id: 'rhythmus.' + f, gruppe: G, frage: ZEIT_FRAGE[f], art: 'zeit', wert: R.stunden(e[f]) === null ? null : e[f], route: Ro });
  if (t === null || t < 7) add({ id: 'rhythmus.weckerFrei', gruppe: G, frage: 'Weckt dich an freien Tagen trotzdem etwas (Wecker, Kinder, Haustier)?', art: 'wahl',
    wert: typeof e.weckerFrei === 'boolean' ? e.weckerFrei : null, optionen: WECKER, route: Ro });
  add({ id: 'rhythmus.selbst', gruppe: G, frage: 'Wann kannst du dich am besten konzentrieren?', art: 'wahl',
    wert: D.SELBST.some((s) => s.wert === e.selbst) ? e.selbst : null, optionen: D.SELBST.map(({ wert, text }) => ({ wert, text })), route: Ro });
  return out;
}

// Rückgabe: { ok: true, ergebnis?: 'neu'|'gemerkt'|'geloescht', unveraendert?, hinweis? } oder { ok: false, fehler } (dann nichts gespeichert).
// 'gemerkt' = Antwort gespeichert, Ergebnis kommt erst, wenn der Teil vollständig ist (oder ein Durchgang läuft gerade).
export async function antwortSetzen(k = kern, id, wert) {
  const Sp = sp(k), s = String(id || ''), p = s.indexOf('.'), teil = s.slice(0, p), f = s.slice(p + 1);
  const falsch = { ok: false, fehler: 'Diese Antwort passt nicht zur Frage.' };
  if (teil === 'ehrlichkeit' || teil === 'riasec') {
    const liste = teil === 'ehrlichkeit' ? D.EHRLICHKEIT : D.RIASEC;
    if (!liste.some((x) => x.id === f)) return { ok: false, fehler: 'Unbekannte Frage.' };
    const w = wert === null || wert === undefined || wert === '' ? null : Number(wert);
    if (w !== null && !(Number.isInteger(w) && w >= 1 && w <= 5)) return falsch;
    const st = Sp.lies('interessen', teil, {}) || {}, a = { ...(st.antworten || {}) }, alt = num(a[f]) ? a[f] : null;
    if (alt === w) return { ok: true, unveraendert: true };
    if (alt !== null) merkeVorher(Sp, [{ id: s, wert: alt }]);
    if (w === null) delete a[f]; else a[f] = w;
    Sp.schreib('interessen', teil, { ...st, antworten: a });
    return { ok: true, ergebnis: teil === 'ehrlichkeit' ? ehrlichNeu(Sp) : riasecNeu(Sp) };
  }
  if (teil === 'rhythmus' && f in LEER) {
    let w = wert === undefined || wert === '' ? null : wert;
    if (f === 'tage' && w !== null) { w = Number(w); if (!(Number.isInteger(w) && w >= 0 && w <= 7)) return falsch; }
    if (ZEIT_FRAGE[f] && w !== null) { if (R.stunden(w) === null) return falsch; const [h, m] = String(w).split(':'); w = `${h.padStart(2, '0')}:${m.slice(0, 2)}`; }
    if (f === 'weckerFrei' && w !== null) { if (w === 'true') w = true; else if (w === 'false') w = false; if (typeof w !== 'boolean') return falsch; }
    if (f === 'selbst' && w !== null && !D.SELBST.some((x) => x.wert === w)) return falsch;
    const e = { ...LEER, ...(Sp.lies('interessen', 'rhythmus', {}) || {}) };
    const alt = e[f] === '' || e[f] === undefined ? null : e[f];
    if (alt === w) return { ok: true, unveraendert: true };
    if (alt !== null) merkeVorher(Sp, [{ id: s, wert: alt }]);
    e[f] = w === null ? LEER[f] : w;
    Sp.schreib('interessen', 'rhythmus', e);
    return rhythmusNeu(Sp);
  }
  return { ok: false, fehler: 'Unbekannte Frage.' };
}

// ======================================================================= Vertrag: muster / aeste
const gross = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const SATZ_INTERESSE = {
  '2': (x) => `${gross(x)} zieht dich klar an.`, '1': (x) => `${gross(x)} zieht dich eher an.`,
  '0': (x) => `${gross(x)}: mal ja, mal nein – beides gehört zu dir.`,
  '-1': (x) => `${gross(x)} ruft dich im Moment eher wenig.`, '-2': (x) => `${gross(x)} ruft dich im Moment kaum.`
};
const SATZ_RHYTHMUS = {
  frueh: 'Deine innere Uhr geht klar in Richtung früh.', 'eher-frueh': 'Deine innere Uhr geht leicht in Richtung früh.',
  mittel: 'Deine innere Uhr liegt dazwischen – weder besonders früh noch besonders spät.',
  'eher-spaet': 'Deine innere Uhr geht leicht in Richtung spät.', spaet: 'Deine innere Uhr geht klar in Richtung spät.'
};
const ehrlichSatz = (g) => (g.pol ? `Du beschreibst dich ${g.wort}.` : 'Beides gehört zu dir: Mal beschreibst du dich auf der fairen, bescheidenen Seite, mal auf der strategischen.');
const facetteWort = (k, b) => { const g = R.ehrlichRichtung(b), [l, r] = D.POLE_FACETTE[k];
  return g.pol ? `${g.deutlich} in Richtung „${g.pol === 'fair' ? r : l}“` : 'beides gehört zu dir'; };
const liste3 = (xs) => (xs.length > 1 ? xs.slice(0, -1).join(', ') + ' und ' + xs[xs.length - 1] : xs[0] || '');

export function muster(k = kern) {
  const Sp = sp(k), out = [];
  const h = Sp.ergebnis(K.E);
  if (gueltig(h) && num(h.wert)) {
    const g = R.ehrlichRichtung(h), fac = h.facetten || {};
    const teile = Object.keys(D.FACETTEN).filter((x) => fac[x]);
    const klarste = teile.filter((x) => R.ehrlichRichtung(fac[x]).deutlich === 'klar').map((x) => `${D.FACETTEN[x].name} (${facetteWort(x, fac[x])})`);
    out.push({ ast: K.E, titel: 'Ehrlichkeit und Bescheidenheit', richtung: ehrlichSatz(g), deutlich: g.deutlich,
      woher: `Aus deinen Antworten zu den Aussagen über Aufrichtigkeit, Fairness, Genügsamkeit und Bescheidenheit.${klarste.length ? ' Am deutlichsten: ' + liste3(klarste) + '.' : ''}` });
  }
  const r = Sp.ergebnis(K.R);
  if (gueltig(r) && r.typen && Array.isArray(r.top) && r.top.length >= 3 && D.REIHE.every((t) => r.typen[t] && num(r.typen[t].wert))) {
    const T = D.TYPEN, a = R.riasecAchsen(r.typen), kurz = r.form !== 'voll';
    const achse = (x, key) => { const P = D.ACHSEN[key].pole, pol = P.find((q) => q.id === x.pol); return pol ? `${x.deutlich} in Richtung ${pol.name}` : 'beides gehört zu dir'; };
    out.push({ ast: K.R, titel: 'Was dich anzieht', deutlich: r.spreizung < 15 ? 'beides' : r.spreizung < 30 ? 'leicht' : 'klar',
      richtung: `Am meisten ziehen dich ${liste3(r.top.map((t) => T[t].name))} an.${a ? ` Zwischen Dingen und Menschen: ${achse(a.dingeMenschen, 'dingeMenschen')}; zwischen Daten und Ideen: ${achse(a.datenIdeen, 'datenIdeen')}.` : ''}`,
      woher: `Aus deinen Antworten, wie gern du ${kurz ? '24' : '48'} verschiedene Tätigkeiten tun würdest${kurz ? ' (Kurzform, noch vorläufig)' : ''}.` });
    for (const t of R.riasecReihenfolge(r)) {
      const g = R.interesseRichtung(r.typen[t]), bsp = D.RIASEC.filter((f) => f.typ === t && f.k).slice(0, 2).map((f) => `„${f.text}“`);
      out.push({ ast: 'interessen.' + t, titel: T[t].name, deutlich: g.deutlich,
        richtung: SATZ_INTERESSE[String(g.stufe)](T[t].satz) + (r.top.includes(t) ? ' Es gehört zu dem, was dich am meisten anzieht.' : ''),
        woher: `Aus deinen Antworten zu Tätigkeiten wie ${bsp.join(' und ')}.` });
    }
  }
  const y = Sp.ergebnis(K.Y);
  if (gueltig(y) && typeof y.typ === 'string' && SATZ_RHYTHMUS[y.typ]) {
    const g = R.rhythmusRichtung(y.typ);
    out.push({ ast: K.Y, titel: 'Tagesrhythmus', richtung: SATZ_RHYTHMUS[y.typ], deutlich: g.deutlich,
      woher: `Aus deinen Schlafzeiten an freien Tagen${y.einschlafenArbeit != null ? ' und an Tagen mit Termin' : ''}${y.weckerFrei ? ' (an freien Tagen weckt dich etwas, darum ungenauer)' : ''}.` });
  }
  return out;
}

export function aeste() { return JSON.parse(JSON.stringify(AESTE)); }

// ======================================================================= Übersicht
function uebersicht({ el, titel, zurueckZu }) {
  titel('Interessen, Rhythmus, Ehrlichkeit'); zurueckZu('fragen');
  const info = (kern.module.find((m) => m.id === 'interessen') || { fragen: [] }).fragen;
  const etwas = info.some((f) => S.ergebnis(f.ergebnis));
  el.innerHTML = `<h2>Interessen, Rhythmus, Ehrlichkeit</h2>
    <p>Drei kurze Teile. Du kannst sie einzeln machen, in jeder Reihenfolge. Es gibt kein Richtig und kein Falsch – nur deine Richtung.</p>
    <ul class="zeilen">${info.map((f) => { const r = S.ergebnis(f.ergebnis);
      return `<li><a class="zeile" href="#${esc(f.route)}"><span><b>${esc(f.titel)}</b><small>${esc(f.kurz || '')}</small></span><span class="rechts">${r ? sym('haken') + ' ' + esc(ui.datum(r.zeit)) : esc(f.dauer || '')}${sym('weiter')}</span></a></li>`; }).join('')}</ul>
    ${etwas ? '<p><a class="link" href="#antworten/interessen">Deine Antworten ansehen und ändern</a></p>' : ''}
    ${merk()}${ui.fuss()}`;
  return binde(el, {});
}

// ======================================================================= Interessen (RIASEC)
function riasecSeite(ctx) {
  const { el, titel, zurueckZu } = ctx;
  titel('Interessen'); zurueckZu('fragen');
  const st = lies('riasec', {}) || {}, erg = S.ergebnis(K.R);
  const liste = st.genauer ? D.RIASEC_REST : D.RIASEC_KURZ;
  const beantwortet = liste.filter((f) => num((st.antworten || {})[f.id])).length;
  const laeuft = !!st.laeuft && beantwortet > 0;
  if (gueltig(erg) && (!laeuft || st.genauer)) return riasecErgebnis(ctx, erg, laeuft && st.genauer ? beantwortet : null);
  el.innerHTML = `<h2>Interessen</h2>
    <p class="lead">Welche Tätigkeiten ziehen dich an? Du siehst ${D.RIASEC_KURZ.length} kurze Beispiele und sagst jeweils, wie gern du das tun würdest.</p>
    <ul><li>Denk nicht daran, ob du es kannst, was man damit verdient oder welche Ausbildung man braucht.</li>
      <li>Dein erstes Gefühl zählt. Das dauert etwa 2 Minuten.</li><li>Jede Antwort kannst du später ansehen und ändern.</li><li>Am Computer gehen auch die Tasten 1 bis 5.</li></ul>
    ${aussage({ text: 'Die Einteilung in sechs Interessen-Bereiche nach Holland ist das am besten untersuchte Modell für Interessen.', stufe: 'belegt', quellen: ['holland1997', 'tracey1993', 'nye2012'] })}
    ${jung() ? '<p class="hinweis">Interessen werden zwischen 12 und Anfang 20 noch deutlich klarer. Nimm das Bild als Momentaufnahme.</p>' : ''}
    <div class="stapel">${laeuft
      ? `<button type="button" class="knopf haupt gross" data-ia="weiter">Weitermachen (${beantwortet} von ${liste.length})</button><button type="button" class="knopf zweit" data-ia="neu">Von vorn anfangen</button>`
      : `<button type="button" class="knopf haupt gross" data-ia="start">Los geht’s</button>`}</div>
    <p class="leise klein">Fragen: aus dem O*NET Interest Profiler (US-Arbeitsministerium), Auswahl nach Armstrong u. a. (2008), gekürzt und selbst übersetzt – vorläufig. Das US-Arbeitsministerium hat diese Fassung nicht geprüft oder empfohlen. ${marke('abgeleitet', ['armstrong2008', 'onet'])}</p>
    ${ui.fuss()}`;
  return binde(el, {
    start: () => { merkeAlle(S, 'riasec', st.antworten); schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen'); },
    weiter: () => kern.geh(B + '/riasec/bogen' + (st.genauer ? '?genauer=1' : '')),
    neu: async () => { if (await ui.bestaetige({ titel: 'Von vorn anfangen?', text: 'Deine bisherigen Antworten in diesem Teil werden zurückgesetzt. Die alten bleiben bei „vorher“ sichtbar.', ja: 'Von vorn' })) {
      merkeAlle(S, 'riasec', st.antworten); schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen'); } }
  });
}

function riasecBogen({ el, titel, param, zurueckZu }) {
  titel('Interessen'); if (wegZiel()) zurueckZu(wegZiel());
  const vorher = S.ergebnis(K.R);
  let st = lies('riasec', {}) || {};
  const a0 = { ...(st.antworten || {}) };
  const genauer = param.genauer === '1' && gueltig(vorher) && D.RIASEC_KURZ.every((f) => num(a0[f.id]));
  const liste = genauer ? D.RIASEC_REST : D.RIASEC_KURZ;
  // Korrektur: Ergebnis da und kein Durchgang läuft (für die 24 weiteren: nur wenn „Genauer“ schon fertig ist) → jede Änderung
  // rechnet sofort neu und ersetzt das Ergebnis; offene Fragen (z. B. gelöschte Antworten) lassen sich hier auch wieder beantworten.
  const korrektur = gueltig(vorher) && (genauer ? !st.laeuft && vorher.form === 'voll' : !(st.laeuft && !st.genauer));
  st = korrektur ? { ...st, antworten: a0 } : { antworten: a0, laeuft: true, genauer };
  schreib('riasec', st);
  const fb = ui.fragebogen(el, {
    titel: korrektur ? 'Interessen – Antworten ändern' : genauer ? 'Interessen – genauer' : 'Interessen',
    fragen: liste.map((f) => ({ id: f.id, text: f.text, hilfe: D.RIASEC_HILFE })),
    skala: D.SKALA_GERN, antworten: st.antworten, start: startBei(liste, param.frage),
    beiAntwort: (id, w, alle) => {
      if (num(st.antworten[id]) && st.antworten[id] !== w) merkeVorher(S, [{ id: 'riasec.' + id, wert: st.antworten[id] }]);
      st = { ...(lies('riasec', {}) || st), antworten: alle }; schreib('riasec', st);
      if (korrektur) riasecNeu(S);
    },
    pause: () => kern.geh((!genauer && !korrektur && wegZiel()) || B + '/riasec'),
    fertig: (alle) => {
      if (korrektur) { kern.geh(B + '/riasec', { ersetzen: true }); return; }
      const voll = D.RIASEC.every((f) => num(alle[f.id]));
      const erg = R.riasecAuswerten(alle, voll ? 'voll' : 'kurz');
      if (!erg) { ui.meldung('Es fehlen noch Antworten.'); return; }
      S.setzeErgebnis(K.R, erg, { ersetzen: genauer && gueltig(vorher) && vorher.form === 'kurz' });
      schreib('riasec', { antworten: alle, laeuft: false, genauer: false });
      kern.geh((!genauer && wegZiel()) || B + '/riasec', { ersetzen: true });
    }
  });
  return () => fb.zerstoere();
}

// Sechseck nach Holland: Nachbarn ähneln sich. top = die drei Bereiche, die am meisten anziehen (hervorgehoben, ohne Platz-Zahl).
function sechseck(top) {
  const cx = 180, cy = 100, r = 62;
  const p = D.REIHE.map((t, i) => { const w = ((-120 + i * 60) * Math.PI) / 180; return { t, x: cx + r * Math.cos(w), y: cy + r * Math.sin(w), w }; });
  const kurzName = { R: 'praktisch', I: 'forschend', A: 'künstlerisch', S: 'sozial', E: 'unternehm.', C: 'ordnend' };
  const label = `Sechseck der Interessen: ${D.REIHE.map((t) => D.TYPEN[t].name).join(', ')} im Kreis. Was dich am meisten anzieht: ${top.map((t) => D.TYPEN[t].name).join(', ')}.`;
  // Beschriftung: links/rechts neben dem Punkt, oben/unten darüber bzw. darunter (keine Überlappung mit dem Kreis)
  const lage = (q) => { const c = Math.cos(q.w), s = Math.sin(q.w);
    if (Math.abs(s) < 0.1) return { x: q.x + (c > 0 ? 20 : -20), y: q.y, a: c > 0 ? 'start' : 'end' };
    return { x: q.x + (c > 0 ? -10 : 10), y: q.y + (s > 0 ? 28 : -28), a: c > 0 ? 'start' : 'end' }; };
  return `<svg class="ia-hex" viewBox="0 0 360 200" role="img" aria-label="${esc(label)}">
    <polygon class="ia-hex-linie" points="${p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')}"/>
    ${p.map((q) => { const an = top.includes(q.t), l = lage(q);
      return `<g class="ia-hex-p${an ? ' an' : ''}"><circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="14"/>
        <text class="ia-hex-b" x="${q.x.toFixed(1)}" y="${q.y.toFixed(1)}" dy=".36em" text-anchor="middle">${q.t}</text>
        <text class="ia-hex-name" x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" dy=".36em" text-anchor="${l.a}">${kurzName[q.t]}</text></g>`; }).join('')}
  </svg>`;
}
function achsenHtml(a) {
  if (!a) return '';
  const zeile = (key) => { const A = D.ACHSEN[key], x = a[key], i = A.pole.findIndex((q) => q.id === x.pol);
    const wort = i >= 0 ? `${x.deutlich} in Richtung ${A.pole[i].name}` : 'beides gehört zu dir';
    return `<p class="ia-achse-t"><b>${esc(A.name)}:</b> ${esc(wort)}</p>${pole(A.pole, i >= 0 ? i : 'beide', `${A.name}: ${wort}`)}`; };
  return `<div class="karte weich"><h4>Zwei Achsen hinter dem Sechseck</h4>${zeile('dingeMenschen')}${zeile('datenIdeen')}
    ${aussage({ text: 'Hinter Hollands Sechseck stecken zwei Achsen: Dinge oder Menschen, Daten oder Ideen. Die Richtung hier ist aus deinen sechs Bereichen zusammengesetzt.', stufe: 'abgeleitet', quellen: ['prediger1982'] })}
    <p><a class="link" href="${ast(K.R)}">Mehr über das Sechseck und die Achsen</a></p></div>`;
}

function riasecErgebnis({ el }, e, genauerOffen) {
  if (!e.typen || !e.top || e.top.length < 3 || !D.REIHE.every((t) => e.typen[t] && num(e.typen[t].wert))) {
    el.innerHTML = `<h2>Interessen</h2><p>Dieses Ergebnis stammt aus einer anderen Fassung. Bitte füll den Fragebogen noch einmal aus.</p><button type="button" class="knopf haupt" data-ia="neu">Neu ausfüllen</button>${ui.fuss()}`;
    return binde(el, { neu: () => { schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen'); } });
  }
  const T = D.TYPEN, [t1, t2, t3] = e.top, kurz = e.form !== 'voll';
  const reihe = R.riasecReihenfolge(e);
  const knapp = e.knapp && e.knapp.drittVierter;
  const paar = D.PAARE[R.paarSchluessel(t1, t2)];
  const nachbar = {
    1: 'Die zwei Bereiche, die dich am meisten anziehen, liegen im Sechseck nebeneinander. Solche Paare sind häufig und lassen sich leicht in einer Tätigkeit verbinden.',
    2: 'Zwischen den zwei Bereichen, die dich am meisten anziehen, liegt im Sechseck ein anderer Bereich. Sie passen gut zusammen; eine Tätigkeit, die beides verbindet, suchst du etwas gezielter.',
    3: 'Die zwei Bereiche, die dich am meisten anziehen, liegen sich im Sechseck gegenüber. Das ist seltener: Tätigkeiten, die beides verbinden, gibt es – du suchst sie bewusst.'
  }[e.nachbarn] || '';
  const v = S.verlauf(K.R);
  el.innerHTML = `<h2>Was dich anzieht</h2>
    <div class="karte akzent">
      <p class="ia-gross">Am meisten ziehen dich an: <b>${esc(T[t1].name)}</b>, <b>${esc(T[t2].name)}</b> und <b>${esc(T[t3].name)}</b>. ${marke('abgeleitet', ['armstrong2008'])}</p>
      ${knapp ? `<p class="klein">Fast gleichauf liegt <b>${esc(T[knapp].name)}</b> – nimm es mit dazu.</p>` : ''}
      ${e.knapp && e.knapp.ersterZweiter ? `<p class="klein">${esc(T[t1].name)} und ${esc(T[t2].name)} ziehen dich etwa gleich stark an.</p>` : ''}
      <p class="klein">Die Reihenfolge ist nicht in Stein gemeißelt: Bereiche, die nah beieinanderliegen, können beim nächsten Mal tauschen.${kurz ? ' Mit der Kurzform ist das Bild noch vorläufig.' : ''}</p>
      <p class="leise klein">In Holland-Buchstaben: ${esc(e.top.join(' – '))}. Sie kommen aus dem Englischen: R praktisch-technisch, I forschend, A künstlerisch, S sozial, E unternehmerisch, C ordnend.</p>
    </div>
    ${jung() ? '<p class="hinweis">In deinem Alter sind Interessen noch stark in Bewegung. Nimm das als Momentaufnahme.</p>' : ''}
    ${e.hoehe < 35 ? '<p class="hinweis">Bei vielen Beispielen hast du „eher nicht gern“ gewählt. Das ist häufig, denn die Beispiele sind oft Berufe, die nicht nach dir klingen. Wichtig ist, was dich im Vergleich zu den anderen Bereichen anzieht.</p>' : ''}
    ${e.hoehe > 75 ? '<p class="hinweis">Dich zieht vieles an. Dann hilft die Reihenfolge, Schwerpunkte zu setzen.</p>' : ''}
    ${e.spreizung < 15 ? `<p class="hinweis">Deine sechs Bereiche liegen nah beieinander – ein klarer Schwerpunkt zeigt sich noch nicht. Auch das ist ein Muster: Dich spricht vieles ähnlich an.${kurz ? ' Mit „Genauer machen“ wird das Bild schärfer.' : ''}</p>` : ''}
    <h3>Alle sechs Bereiche</h3>
    <p class="leise klein">Geordnet nach dem, was dich am meisten anzieht – nur in Worten. Tipp auf einen Bereich, um mehr darüber zu lernen.</p>
    <ul class="zeilen ia-bereiche">${reihe.map((t) => { const g = R.interesseRichtung(e.typen[t]);
      return `<li><a class="zeile" href="${ast('interessen.' + t)}"><span><b>${esc(T[t].name)}</b><span class="ia-wort">${esc(g.wort)}</span><small>${esc(T[t].kurz)}</small></span><span class="rechts">${sym('weiter')}</span></a></li>`; }).join('')}</ul>
    <p class="leise klein">Zu „Forschend“: Die Fragen dazu drehen sich fast nur um Natur und Medizin. Wer lieber Technik, Physik, Informatik oder Musik untersucht, findet sich darin weniger wieder. ${marke('abgeleitet', ['armstrong2008'])}</p>
    ${genauerOffen !== null ? `<button type="button" class="knopf haupt voll" data-ia="genauer">Genauer machen – weiter (${genauerOffen} von ${D.RIASEC_REST.length})</button>`
      : kurz ? `<div class="karte weich"><p><b>Genauer machen:</b> ${D.RIASEC_REST.length} weitere Beispiele (etwa 2 Minuten) machen das Bild klarer.</p><button type="button" class="knopf haupt voll" data-ia="genauer">Genauer machen</button></div>` : ''}
    <h3>Dein Muster im Sechseck</h3>
    ${sechseck(e.top)}
    ${aussage({ text: 'Die sechs Bereiche ordnen sich wie ein Kreis: Nachbarn ähneln sich, Gegenüber sind sich am fremdesten.', stufe: 'belegt', quellen: ['tracey1993'] })}
    ${nachbar ? aussage({ text: nachbar, stufe: 'abgeleitet', quellen: ['tracey1993'] }) : ''}
    ${achsenHtml(R.riasecAchsen(e.typen))}
    <h3>Was du damit machen kannst</h3>
    ${aussage({ text: 'Wer Tätigkeiten macht, die zu den eigenen Interessen passen, leistet im Mittel mehr und bleibt eher dabei.', stufe: 'belegt', quellen: ['nye2012'] })}
    ${e.top.map((t) => `<div class="karte"><h4>${esc(T[t].name)}</h4><p class="leise klein">${esc(T[t].kurz)}</p>
      <p>Zum Ausprobieren – Tätigkeiten und Projekte, nicht nur Berufe: ${marke('idee')}</p>
      <ul class="ia-ideen">${D.IDEEN[t].map((x) => li(esc(x))).join('')}</ul>
      <p><a class="link" href="${ast('interessen.' + t)}">Mehr über „${esc(T[t].name)}“</a></p></div>`).join('')}
    ${paar ? `<div class="karte gruen"><h4>Beides verbinden: ${esc(T[t1].name)} und ${esc(T[t2].name)}</h4>${aussage({ text: paar, stufe: 'idee' })}</div>` : ''}
    ${nichtHeisst([
      li('Kein Bereich ist besser als ein anderer. Es ist dein Muster – so, wie du zusammengesetzt bist.'),
      li(`Interessen zeigen, was dich anzieht – nicht, was du kannst. Beides hängt nur mäßig zusammen. ${marke('belegt', ['ackerman1997'])}`),
      li(`Interessen sind ziemlich beständig, besonders ab Anfang 20 – aber nicht in Stein gemeißelt. ${marke('belegt', ['low2005'])}`),
      li('Die Beispiele sind ältere Berufs-Tätigkeiten aus den USA, und die Forscher-Fragen drehen sich viel um Natur und Medizin. Forschen heißt aber auch: Klänge, Sprache oder Technik untersuchen.'),
      li('Kein Vergleich mit anderen: Die Reihenfolge kommt nur aus deinen eigenen Antworten. Die Übersetzung ist vorläufig.')
    ])}
    ${v.length > 1 ? `<details class="karte"><summary>Frühere Durchgänge (${v.length - 1})</summary><ul>${v.slice(0, -1).reverse().map((x) => li(`${esc(ui.datum(x.zeit))}: am meisten angezogen von ${esc((x.top || []).map((t) => (T[t] ? T[t].name : t)).join(', '))}`)).join('')}</ul></details>` : ''}
    ${merk()}
    ${knoepfe('<button type="button" class="knopf zweit" data-ia="neu">Noch einmal ganz neu ausfüllen</button>')}
    ${ui.fuss()}`;
  return binde(el, {
    genauer: () => kern.geh(B + '/riasec/bogen?genauer=1'),
    neu: async () => {
      if (!(await ui.bestaetige({ titel: 'Noch einmal ganz neu ausfüllen?', text: 'Dein jetziges Bild bleibt bei „Frühere Durchgänge“. Einzelne Antworten änderst du einfacher über „Antworten ansehen und ändern“.', ja: 'Neu ausfüllen' }))) return;
      merkeAlle(S, 'riasec', (lies('riasec', {}) || {}).antworten);
      schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen');
    }
  });
}

// ======================================================================= Ehrlichkeit-Bescheidenheit
function ehrlichSeite(ctx) {
  const { el, titel, zurueckZu } = ctx;
  titel('Ehrlichkeit und Bescheidenheit'); zurueckZu('fragen');
  const st = lies('ehrlichkeit', {}) || {}, erg = S.ergebnis(K.E);
  const n = D.EHRLICHKEIT.filter((f) => num((st.antworten || {})[f.id])).length;
  const laeuft = !!st.laeuft && n > 0;
  if (gueltig(erg) && !laeuft) return ehrlichErgebnis(ctx, erg);
  el.innerHTML = `<h2>Ehrlichkeit und Bescheidenheit</h2>
    <p class="lead">${D.EHRLICHKEIT.length} Aussagen darüber, wie wichtig dir Fairness ist – und wie wichtig dir dein eigener Vorteil, Geld und Status sind.</p>
    <ul><li>Antworte so, wie du wirklich bist – nicht, wie man sein sollte. Niemand sieht deine Antworten.</li><li>Beide Richtungen haben Stärken. Es gibt kein Richtig und kein Falsch.</li><li>Das dauert etwa 1 Minute. Jede Antwort kannst du später ändern.</li></ul>
    ${aussage({ text: 'Ehrlichkeit-Bescheidenheit ist im HEXACO-Modell ein eigener sechster Grundzug neben den Big Five.', stufe: 'belegt', quellen: ['ashton2007'] })}
    ${jung() ? '<p class="hinweis">Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm alles als Momentaufnahme.</p>' : ''}
    <div class="stapel">${laeuft
      ? `<button type="button" class="knopf haupt gross" data-ia="weiter">Weitermachen (${n} von ${D.EHRLICHKEIT.length})</button><button type="button" class="knopf zweit" data-ia="neu">Von vorn anfangen</button>`
      : `<button type="button" class="knopf haupt gross" data-ia="start">Los geht’s</button>`}</div>
    <p class="leise klein">Fragen: gemeinfreie IPIP-Fragen, angelehnt an die IPIP-HEXACO-Skalen, eigene Übersetzung – vorläufig. ${marke('abgeleitet', ['ashton2007', 'sibley2011'])}</p>
    ${ui.fuss()}`;
  const neu = () => { merkeAlle(S, 'ehrlichkeit', st.antworten); schreib('ehrlichkeit', { antworten: {}, laeuft: true }); kern.geh(B + '/ehrlichkeit/bogen'); };
  return binde(el, {
    start: neu, weiter: () => kern.geh(B + '/ehrlichkeit/bogen'),
    neu: async () => { if (await ui.bestaetige({ titel: 'Von vorn anfangen?', text: 'Deine bisherigen Antworten in diesem Teil werden zurückgesetzt. Die alten bleiben bei „vorher“ sichtbar.', ja: 'Von vorn' })) neu(); }
  });
}

function ehrlichBogen({ el, titel, zurueckZu, param }) {
  titel('Ehrlichkeit'); if (wegZiel()) zurueckZu(wegZiel());
  let st = lies('ehrlichkeit', {}) || {};
  const a0 = { ...(st.antworten || {}) };
  const korrektur = gueltig(S.ergebnis(K.E)) && !st.laeuft;      // Ergebnis da, kein Durchgang läuft → Antworten ändern
  st = { antworten: a0, laeuft: !korrektur };
  schreib('ehrlichkeit', st);
  const fb = ui.fragebogen(el, {
    titel: korrektur ? 'Ehrlichkeit – Antworten ändern' : 'Ehrlichkeit', fragen: D.EHRLICHKEIT.map((f) => ({ id: f.id, text: f.text })),
    antworten: st.antworten, start: startBei(D.EHRLICHKEIT, param && param.frage),
    beiAntwort: (id, w, alle) => {
      if (num(st.antworten[id]) && st.antworten[id] !== w) merkeVorher(S, [{ id: 'ehrlichkeit.' + id, wert: st.antworten[id] }]);
      st = { ...st, antworten: alle }; schreib('ehrlichkeit', st);
      if (korrektur) ehrlichNeu(S);
    },
    pause: () => kern.geh((!korrektur && wegZiel()) || B + '/ehrlichkeit'),
    fertig: (alle) => {
      if (korrektur) { kern.geh(B + '/ehrlichkeit', { ersetzen: true }); return; }
      const erg = R.ehrlichkeitAuswerten(alle);
      if (!erg) { ui.meldung('Es fehlen noch Antworten.'); return; }
      S.setzeErgebnis(K.E, erg);
      schreib('ehrlichkeit', { antworten: alle, laeuft: false });
      kern.geh(wegZiel() || B + '/ehrlichkeit', { ersetzen: true });
    }
  });
  return () => fb.zerstoere();
}

function ehrlichErgebnis({ el }, e) {
  if (typeof e.wert !== 'number') {
    el.innerHTML = `<h2>Ehrlichkeit und Bescheidenheit</h2><p>Dieses Ergebnis stammt aus einer anderen Fassung. Bitte füll den Fragebogen noch einmal aus.</p><button type="button" class="knopf haupt" data-ia="neu">Neu ausfüllen</button>${ui.fuss()}`;
    return binde(el, { neu: () => { schreib('ehrlichkeit', { antworten: {}, laeuft: true }); kern.geh(B + '/ehrlichkeit/bogen'); } });
  }
  const F = D.FACETTEN, fac = e.facetten || {};
  const teile = Object.keys(F).filter((k) => fac[k] && num(fac[k].wert));
  const g = R.ehrlichRichtung(e), an = g.pol === 'fair' ? 1 : g.pol === 'strategisch' ? 0 : 'beide';
  const A = AESTE.find((x) => x.id === K.E);
  el.innerHTML = `<h2>Ehrlichkeit und Bescheidenheit</h2>
    <p>Wie viel Raum du deinem eigenen Vorteil gibst – und wie viel dem fairen Ausgleich mit anderen. Beide Richtungen haben Stärken. ${marke('abgeleitet', ['ashton2007'])}</p>
    ${jung() ? '<p class="hinweis">Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm das als Momentaufnahme.</p>' : ''}
    <div class="karte akzent"><p class="ia-gross">${esc(ehrlichSatz(g))}</p>
      ${pole(D.POLE_EHRLICH, an, 'Zwei gleichwertige Richtungen: ' + D.POLE_EHRLICH.map((p) => p.name).join(' und ') + '. ' + ehrlichSatz(g))}</div>
    <h3>Was beide Seiten mitbringen</h3>
    <div class="karte"><h4>Fair und bescheiden</h4>
      ${aussage({ text: 'Stärke: Menschen, die sich so beschreiben, teilen in Studien mit Geld-Spielen im Mittel fairer – vor allem dort, wo sie andere ausnutzen könnten. Das schafft Vertrauen.', stufe: 'belegt', quellen: ['thielmann2020'] })}
      ${aussage({ text: 'Wo es reiben kann: Du verkaufst dich womöglich unter Wert – bei Preisen, in Verhandlungen oder wenn es darum geht, deine eigene Arbeit zu zeigen.', stufe: 'idee' })}</div>
    <div class="karte"><h4>Strategisch und statusbewusst</h4>
      ${aussage({ text: 'Stärke: Du setzt dich für dich ein, lässt dir nicht leicht etwas wegnehmen und zeigst, was du kannst – das hilft bei Verhandlungen und im Wettbewerb.', stufe: 'idee' })}
      ${aussage({ text: 'Wo es reiben kann: Merken andere, dass es vor allem um den eigenen Vorteil geht, kann ihr Vertrauen sinken – und Zusammenarbeit wird schwerer.', stufe: 'abgeleitet', quellen: ['thielmann2020'] })}</div>
    <h3>Die vier Teile</h3>
    <p class="leise klein">Je drei Aussagen – darum nur ein grober Blick.</p>
    <ul class="zeilen">${teile.map((k) => `<li><div class="zeile"><span><b>${esc(F[k].name)}</b><span class="ia-wort">${esc(facetteWort(k, fac[k]))}</span><small>${esc(F[k].kurz)}</small></span></div></li>`).join('')}</ul>
    ${A ? `<h3>Zum Weiterdenken</h3><ul>${A.weiterdenken.slice(0, 3).map((q) => li(esc(q))).join('')}</ul>
      <p><a class="link" href="${ast(K.E)}">Mehr über Ehrlichkeit und Bescheidenheit</a></p>` : ''}
    ${nichtHeisst([
      li('Kein Urteil über deinen Charakter und keine Seite ist die bessere. Es zeigt, wie du dich selbst beschreibst.'),
      li('Bei solchen Fragen beschreiben sich viele Menschen eher so, wie man sein „sollte“. Ehrlich zu antworten lohnt sich – niemand sieht es außer dir.'),
      li('Kein Vergleich mit anderen: Es gibt noch keine deutschen Vergleichswerte. Die Richtung kommt nur aus deinen eigenen Antworten.'),
      li('Zwölf Aussagen sind ein grober Blick, die Übersetzung ist vorläufig.'),
      li('Dieser Teil ist nur für dich. Er wird nie im Live gezeigt.')
    ])}
    ${merk()}
    ${knoepfe('<button type="button" class="knopf zweit" data-ia="neu">Noch einmal ganz neu ausfüllen</button>')}
    ${ui.fuss()}`;
  return binde(el, {
    neu: async () => {
      if (!(await ui.bestaetige({ titel: 'Noch einmal ganz neu ausfüllen?', text: 'Dein jetziges Bild bleibt im Verlauf. Einzelne Antworten änderst du einfacher über „Antworten ansehen und ändern“.', ja: 'Neu ausfüllen' }))) return;
      merkeAlle(S, 'ehrlichkeit', (lies('ehrlichkeit', {}) || {}).antworten);
      schreib('ehrlichkeit', { antworten: {}, laeuft: true }); kern.geh(B + '/ehrlichkeit/bogen');
    }
  });
}

// ======================================================================= Tagesrhythmus
function rhythmusEingabe({ el, titel, zurueckZu, pfad }) {
  titel('Tagesrhythmus'); zurueckZu(wegZiel() || (pfad[3] === 'eingabe' ? B + '/rhythmus' : 'fragen'));
  let e = { ...LEER, ...(lies('rhythmus', {}) || {}) };
  const alt = S.ergebnis(K.Y);
  const vorDem = gueltig(alt) && alt.eingabe ? { ...LEER, ...alt.eingabe } : { ...e };   // Stand der letzten Auswertung (für „vorher“)
  const speichere = () => schreib('rhythmus', e);
  const chip = (gruppe, wert, text) => `<button type="button" class="chip" role="radio" aria-checked="${e[gruppe] === wert}" data-ia="wahl" data-gruppe="${gruppe}" data-wert="${esc(JSON.stringify(wert))}">${esc(text)}</button>`;
  const zeit = (feld, text) => `<label class="ia-zeit"><span>${esc(text)}</span><input type="time" class="feld" data-feld="${feld}" value="${esc(e[feld] || '')}" step="300"></label>`;
  const male = (fokus) => {
    const t = e.tage;
    el.innerHTML = `<h2>Tagesrhythmus</h2>
      <p class="lead">Ein paar Fragen zu deinem Schlaf, etwa 1 Minute. Daraus zeigt die App, ob deine innere Uhr eher früh oder eher spät geht – und wann dein Kopf wahrscheinlich am klarsten ist.</p>
      <p class="leise klein">Denk an eine normale Woche der letzten Zeit. „Einschlafen“ heißt: wann du wirklich einschläfst, nicht wann du ins Bett gehst.</p>
      <h3 id="ia-tage-t">An wie vielen Tagen pro Woche musst du zu einer festen Zeit aufstehen?</h3>
      <p class="leise klein">Wegen Arbeit, Schule, Uni oder Terminen – mit Wecker.</p>
      <div class="chips ia-zahlen" role="radiogroup" aria-labelledby="ia-tage-t">${[0, 1, 2, 3, 4, 5, 6, 7].map((n) => chip('tage', n, String(n))).join('')}</div>
      ${t > 0 ? `<h3>An diesen Tagen</h3><div class="ia-zeiten">${zeit('arbeitEin', 'Einschlafen')}${zeit('arbeitAuf', 'Aufwachen')}</div>` : ''}
      ${t !== 7 ? `<h3>An freien Tagen</h3><p class="leise klein">Tage, an denen du ausschlafen kannst.</p><div class="ia-zeiten">${zeit('freiEin', 'Einschlafen')}${zeit('freiAuf', 'Aufwachen')}</div>
        <p id="ia-wecker-t"><b>Weckt dich an freien Tagen trotzdem etwas?</b> <span class="leise klein">Wecker, Kinder, Haustier</span></p>
        <div class="chips" role="radiogroup" aria-labelledby="ia-wecker-t">${chip('weckerFrei', false, 'Nein, ich wache von selbst auf')}${chip('weckerFrei', true, 'Ja')}</div>` : ''}
      <h3 id="ia-selbst-t">Wann kannst du dich am besten konzentrieren?</h3>
      <p class="leise klein">Freiwillig. Die App legt das neben deine Schlafzeiten.</p>
      <div class="chips" role="radiogroup" aria-labelledby="ia-selbst-t">${D.SELBST.map((s) => chip('selbst', s.wert, s.text)).join('')}</div>
      <p id="ia-fehler" class="hinweis gelb" role="alert" hidden></p>
      <button type="button" class="knopf haupt gross voll" data-ia="auswerten">Fertig – meine Richtung zeigen</button>
      <p class="leise klein">Eigene Fragen, angelehnt an die Schlafmitte nach Roenneberg (nicht der Münchner Chronotyp-Fragebogen selbst). ${marke('abgeleitet', ['roenneberg2003'])}</p>
      ${ui.fuss()}`;
    if (fokus) el.querySelector(fokus)?.focus();
  };
  male();
  const eingabe = (ev) => { const f = ev.target.closest('[data-feld]'); if (!f) return; e = { ...e, [f.dataset.feld]: f.value }; speichere(); };
  el.addEventListener('input', eingabe); el.addEventListener('change', eingabe);
  const aus = binde(el, {
    wahl: (b) => {
      const g = b.dataset.gruppe; let w; try { w = JSON.parse(b.dataset.wert); } catch { return; }
      e = { ...e, [g]: e[g] === w && g === 'selbst' ? null : w }; speichere();
      male(`[data-gruppe="${g}"][data-wert="${CSS.escape(b.dataset.wert)}"]`);
    },
    auswerten: () => {
      const r = R.rhythmusAuswerten(e);
      if (r.fehler) { const f = el.querySelector('#ia-fehler'); f.textContent = r.fehler; f.hidden = false; f.scrollIntoView({ block: 'center' }); return; }
      merkeVorher(S, Object.keys(LEER).filter((f) => vorDem[f] !== e[f] && vorDem[f] !== null && vorDem[f] !== '').map((f) => ({ id: 'rhythmus.' + f, wert: vorDem[f] })));
      S.setzeErgebnis(K.Y, { ...r, eingabe: eingabeVon(e) }, { ersetzen: gueltig(alt) });
      kern.geh(wegZiel() || B + '/rhythmus', { ersetzen: true });
    }
  });
  return () => { aus(); el.removeEventListener('input', eingabe); el.removeEventListener('change', eingabe); };
}

// Ein Tag von 0 bis 24 Uhr; Stücke, die über Mitternacht gehen, werden geteilt.
function spur(stuecke) {
  const teile = [];
  for (const s of stuecke) {
    const a = R.uhr24(s.von), b = R.uhr24(s.bis);
    if (a <= b) teile.push([a, b, s.k]); else { teile.push([a, 24, s.k]); teile.push([0, b, s.k]); }
  }
  return `<div class="ia-spur">${teile.map(([a, b, k]) => `<span class="ia-stueck ${k}" style="left:${(a / 24) * 100}%;width:${((b - a) / 24) * 100}%"></span>`).join('')}</div>`;
}
function tagesbild(r) {
  const z = [];
  const frei = r.einschlafenFrei != null ? { von: r.einschlafenFrei, bis: r.einschlafenFrei + r.schlafdauerFrei } : null;
  const arb = r.einschlafenArbeit != null ? { von: r.einschlafenArbeit, bis: r.einschlafenArbeit + r.schlafdauerArbeit } : null;
  const U = R.uhrText;
  if (frei) z.push(['Schlaf an freien Tagen', spur([{ ...frei, k: 'ia-schlaf' }]), `Schlaf an freien Tagen ${U(frei.von)} bis ${U(frei.bis)} Uhr`]);
  if (arb) z.push(['Schlaf mit Termin', spur([{ ...arb, k: 'ia-schlaf' }]), `Schlaf an Tagen mit Termin ${U(arb.von)} bis ${U(arb.bis)} Uhr`]);
  const fen = [{ ...r.fokus, k: 'ia-fokus' }, { ...r.fokus2, k: 'ia-fokus' }, { ...r.tief, k: 'ia-tief' }];
  if (r.ideen) fen.push({ ...r.ideen, k: 'ia-einfall' });
  z.push(['Tagesfenster', spur(fen), `Fokus ${U(r.fokus.von)} bis ${U(r.fokus.bis)} und ${U(r.fokus2.von)} bis ${U(r.fokus2.bis)} Uhr, Tief ${U(r.tief.von)} bis ${U(r.tief.bis)} Uhr${r.ideen ? `, Einfälle ${U(r.ideen.von)} bis ${U(r.ideen.bis)} Uhr` : ''}`]);
  return `<div class="ia-tag" role="img" aria-label="${esc('Tagesbild: ' + z.map((x) => x[2]).join('; ') + '.')}">
    ${z.map(([n, s]) => `<div class="ia-zeile" aria-hidden="true"><span>${esc(n)}</span>${s}</div>`).join('')}
    <div class="ia-zeile ia-uhr" aria-hidden="true"><span></span><div>${[0, 6, 12, 18, 24].map((h) => `<i style="left:${(h / 24) * 100}%">${h}</i>`).join('')}</div></div>
    <p class="ia-legende" aria-hidden="true"><span><i class="ia-schlaf"></i>Schlaf</span><span><i class="ia-fokus"></i>Fokus</span><span><i class="ia-tief"></i>Tief</span>${r.ideen ? '<span><i class="ia-einfall"></i>Einfälle</span>' : ''}</p></div>`;
}
// Seine eigenen Angaben (keine errechneten Werte). Ältere Ergebnisse ohne „eingabe“: aus Einschlafzeit + Dauer zurückgerechnet.
function angaben(r) {
  const U = R.uhrText, e = r.eingabe || null, teile = [];
  const paar = (ein, auf) => `einschlafen ${esc(ein)} Uhr, aufwachen ${esc(auf)} Uhr`;
  const t = num(r.tageMitTermin) ? r.tageMitTermin : e && num(e.tage) ? e.tage : null;
  if (r.einschlafenArbeit != null) teile.push(`Tage mit Termin (${t ?? '?'} ${t === 1 ? 'Tag' : 'Tage'} pro Woche): ${e && e.arbeitEin ? paar(e.arbeitEin, e.arbeitAuf) : paar(U(r.einschlafenArbeit), U(r.einschlafenArbeit + r.schlafdauerArbeit))}`);
  else if (t === 0) teile.push('keine Tage mit fester Aufstehzeit');
  if (r.einschlafenFrei != null) teile.push(`freie Tage: ${e && e.freiEin ? paar(e.freiEin, e.freiAuf) : paar(U(r.einschlafenFrei), U(r.einschlafenFrei + r.schlafdauerFrei))}${r.weckerFrei ? ', mit Wecker' : ''}`);
  return teile.join(' · ');
}

function rhythmusErgebnis({ el, titel, zurueckZu }) {
  titel('Tagesrhythmus'); zurueckZu('fragen');
  const r = S.ergebnis(K.Y), U = R.uhrText;
  const g = R.rhythmusRichtung(r.typ), an = g.pol === 'frueh' ? 0 : g.pol === 'spaet' ? 1 : 'beide';
  const spaet = g.pol === 'spaet', frueh = g.pol === 'frueh';
  const sel = D.SELBST.find((s) => s.wert === r.selbst);
  const h = r.hinweise || [];
  const jl = r.sozialerJetlag, jlWort = jl == null ? '' : jl < 1 ? 'kaum' : jl < 2 ? 'spürbar' : 'deutlich';
  const dauer = r.schlafdauerFrei != null && r.schlafdauerArbeit != null ? r.schlafdauerFrei - r.schlafdauerArbeit : null;
  el.innerHTML = `<h2>Dein Tagesrhythmus</h2>
    <div class="karte akzent">
      <p class="ia-gross">${esc(SATZ_RHYTHMUS[r.typ] || '')} ${marke('abgeleitet', ['roenneberg2003'])}</p>
      ${pole(D.POLE_RHYTHMUS, an, 'Zwei gleichwertige Richtungen: früh und spät. ' + (SATZ_RHYTHMUS[r.typ] || ''))}
      <p class="klein"><b>Deine Angaben:</b> ${angaben(r)}.</p>
      <p class="leise klein">Die Richtung kommt aus der Mitte deines Schlafs an freien Tagen – dann bestimmt kein Wecker. Holst du an freien Tagen Schlaf nach, rechnet die App das heraus. Es ist eine Richtung in Worten, kein Messwert.</p>
    </div>
    ${h.includes('wecker') ? '<p class="hinweis">Weil dich an freien Tagen etwas weckt, ist die Richtung ungenauer – wahrscheinlich geht deine innere Uhr etwas später.</p>' : ''}
    ${h.includes('keine-freien-tage') ? '<p class="hinweis">Ohne freie Tage nimmt die App deine Tage mit Termin. Die zeigen eher deinen Plan als deine innere Uhr.</p>' : ''}
    ${h.includes('ungewoehnliche-zeiten') ? '<p class="hinweis">Deine Zeiten sind ungewöhnlich, zum Beispiel bei Schicht- oder Nachtarbeit. Dann passt diese einfache Rechnung nicht gut.</p>' : ''}
    <h3>Dein Tag</h3>
    ${tagesbild(r)}
    ${aussage({ text: `Zum Ausprobieren: Dein wahrscheinlich bestes Fenster für Konzentration liegt etwa bei ${U(r.fokus.von)} bis ${U(r.fokus.bis)} Uhr, ein zweites, kürzeres etwa bei ${U(r.fokus2.von)} bis ${U(r.fokus2.bis)} Uhr.`, stufe: 'abgeleitet', quellen: ['schmidt2007'] })}
    ${aussage({ text: `Dazwischen ein Tief, etwa ${U(r.tief.von)} bis ${U(r.tief.bis)} Uhr – gut für Routine wie Aufräumen, Nachrichten oder Hochladen.`, stufe: 'idee' })}
    ${r.ideen ? aussage({ text: `Für Einfälle und freies Rumspinnen kann gerade die „falsche“ Zeit helfen, bei dir etwa ${U(r.ideen.von)} bis ${U(r.ideen.bis)} Uhr: Dann ist der Kopf weniger streng.`, stufe: 'abgeleitet', quellen: ['wieth2011'] }) : ''}
    ${sel && sel.von != null ? (r.selbstPasst
      ? `<p>Du sagst, du kannst dich ${esc(sel.text)} am besten konzentrieren – das passt zu deinen Schlafzeiten.</p>`
      : aussage({ text: `Du sagst, du kannst dich ${sel.text} am besten konzentrieren. Deine Schlafzeiten deuten auf eine andere Zeit. Beides kann stimmen: Probier eine Woche lang beides aus und notier, wann es besser lief.`, stufe: 'idee' })) : ''}
    <p class="leise klein">Die Fenster sind grobe Schätzungen aus Durchschnitts-Befunden. Prüf sie an dir.</p>
    <h3>Tipps für deine Tagesplanung</h3>
    <ul class="ia-tipps">
      ${aussage({ tag: 'li', text: 'Leg schwere Denk-Aufgaben – Lernen, Schreiben, Mischen, Planen – in dein Fokus-Fenster.', stufe: 'abgeleitet', quellen: ['schmidt2007'] })}
      ${spaet ? aussage({ tag: 'li', text: 'Morgens raus ins Tageslicht, abends helles Licht dimmen: Das schiebt die innere Uhr nach vorn.', stufe: 'abgeleitet', quellen: ['wright2013'] }) : ''}
      ${frueh ? aussage({ tag: 'li', text: 'Willst du abends länger frisch sein, hilft viel Tageslicht am Nachmittag – und morgens nicht gleich ins grelle Licht.', stufe: 'abgeleitet', quellen: ['wright2013'] }) : ''}
      ${jl != null && jl >= 1 ? aussage({ tag: 'li', text: 'Steh auch an freien Tagen ungefähr zur gleichen Zeit auf (höchstens eine Stunde später). Das macht den Unterschied zwischen den Tagen kleiner.', stufe: 'abgeleitet', quellen: ['wittmann2006'] }) : ''}
      ${aussage({ tag: 'li', text: 'Termine, die du selbst legst – Sport, Proben, Aufnahmen –, in deine wachen Stunden legen.', stufe: 'idee' })}
      ${aussage({ tag: 'li', text: 'Eine Woche lang notieren, wann Konzentration leicht fiel und wann schwer. Dann weißt du es genauer als jede Rechnung.', stufe: 'idee' })}
    </ul>
    ${jl != null ? `<h3>Tage mit Termin und freie Tage</h3>
      <p>Zwischen Tagen mit Termin und freien Tagen verschiebt sich die Mitte deines Schlafs <b>${jlWort}</b>. Das nennt man „sozialen Jetlag“ – wie eine kleine Zeitreise jede Woche.</p>
      ${dauer != null ? `<p>${dauer > 0.75 ? 'An freien Tagen schläfst du länger als an Tagen mit Termin.' : dauer < -0.75 ? 'An Tagen mit Termin schläfst du länger als an freien Tagen.' : 'An beiden Arten von Tagen schläfst du ungefähr gleich lang.'}</p>` : ''}
      ${jl >= 2 ? aussage({ text: 'Ein so großer Unterschied heißt meist: Unter der Woche fehlt Schlaf, am Wochenende wird er nachgeholt. Das hängt in Studien mit schlechterem Schlaf und Befinden zusammen.', stufe: 'belegt', quellen: ['wittmann2006'] }) : ''}` : ''}
    ${h.includes('kurz-geschlafen') ? '<p class="hinweis">Nach deinen Zeiten bleibt dir an Tagen mit Termin recht wenig Schlaf. Wenn du dich oft erschöpft fühlst, sprich mit deiner Hausarztpraxis – Termine vermittelt die <a href="tel:116117">116 117</a>.</p>' : ''}
    ${aussage({ text: 'Die innere Uhr wird in der Jugend immer später, ist um die 20 am spätesten und wird danach langsam wieder früher. Ein später Rhythmus ist darum oft Biologie, nicht Faulheit.', stufe: 'belegt', quellen: ['roenneberg2004'] })}
    <p><a class="link" href="${ast(K.Y)}">Mehr über den Tagesrhythmus</a></p>
    ${nichtHeisst([
      li('Keine Richtung ist besser. Wer spät tickt, ist nicht fauler; wer früh tickt, nicht fleißiger.'),
      li('Keine Schlaf-Diagnose. Es sind eigene Fragen, angelehnt an die Schlafmitte nach Roenneberg – nicht der Münchner Chronotyp-Fragebogen selbst.'),
      li('Kein Messwert: Die Richtung steht in Worten. Die Uhrzeiten oben sind deine eigenen Angaben, die Fenster grobe Schätzungen.')
    ])}
    ${merk()}
    ${knoepfe(`<a class="knopf zweit" href="#${B}/rhythmus/eingabe">Zeiten ändern</a>`)}
    ${ui.fuss()}`;
  return binde(el, {});
}
