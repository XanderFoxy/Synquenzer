// muster – „Dein Muster“: Zusammenschau aller Module in Worten, der Baum der Verästelungen, Ast-Seiten zum Weiterlernen
// und der eigene Fragebogen „Denkweise“. Keine Bewertung: nur Richtungen zwischen gleichwertigen Polen, in Worten.
// Routen: muster (Baum, ?bereich=<slug>) · muster/ast/<ast-id> · muster/fragen (Übersicht, Antworten ändern) · muster/fragen/bogen (?frage=<id>)
// Vertrag für andere Teile (Schnittstelle): antwortListe(k), antwortSetzen(k, id, wert), muster(k), aeste().
// Kein statischer Import von kern.js: Der Kern gibt sich über ctx.kern bzw. das Argument k mit.
import { SKALA, SKALA_TEXT, ZWEIGE, ZWEIG, AUSSAGEN, AUSSAGE, auswerten, beantwortet, fertig } from './fragen.js';
import { AESTE } from './aeste.js';
import { sammle, springen, slug } from './sammeln.js';
import { baumSvg, zustand, bereichStand } from './baum.js';

const M = 'muster';
const VORHER_MAX = 5;
const DAUER = 'ca. 4 Min.';

// ======================================================================= Daten
const antwortenVon = (k) => { const a = k.speicher.lies(M, 'antworten', {}); return a && typeof a === 'object' ? a : {}; };
const vorherVon = (k) => { const v = k.speicher.lies(M, 'vorher', {}); return v && typeof v === 'object' ? v : {}; };
const anzeige = (w) => (w == null ? '' : SKALA_TEXT[w] || String(w));

// Schreibt eine Antwort (wert null = übersprungen/gelöscht) und pflegt „vorher“ (höchstens 5 je Frage).
function schreibeAntwort(k, id, wert, { loeschen = false } = {}) {
  const A = antwortenVon(k), hatte = id in A, alt = A[id];
  if (loeschen) delete A[id]; else A[id] = wert;
  if (hatte && alt != null && alt !== wert) {
    const V = vorherVon(k), l = Array.isArray(V[id]) ? V[id] : [];
    l.push({ wert: alt, anzeige: anzeige(alt), zeit: new Date().toISOString() });
    V[id] = l.slice(-VORHER_MAX); k.speicher.schreib(M, 'vorher', V);
  }
  k.speicher.schreib(M, 'antworten', A);
  return A;
}
// Ergebnis 'muster' neu rechnen: nach dem ersten vollständigen Durchgang bei jeder Änderung (ersetzt den letzten Eintrag).
function aktualisiereErgebnis(k, { zumSchluss = false } = {}) {
  const S = k.speicher, A = antwortenVon(k), alt = S.ergebnis(M);
  const gueltige = AUSSAGEN.filter((a) => Number.isInteger(A[a.id])).length;
  if (!alt && !(zumSchluss || fertig(A))) return null;
  if (!gueltige) { if (alt) S.loescheErgebnis(M); return null; }
  const R = auswerten(A), richtungen = {};
  for (const [z, r] of Object.entries(R)) if (r) richtungen[z] = { deutlich: r.deutlich, pol: r.pol, wege: r.wege, wort: r.wort, richtung: r.richtung };
  const e = S.setzeErgebnis(M, { schema: 1, art: 'denkweise', richtungen, vollstaendig: fertig(A) }, { ersetzen: !!alt });
  k.emit('muster:neu', { richtungen });
  return e;
}

// ======================================================================= Schnittstelle (Vertrag zwischen den Teilen)
export function antwortListe(k) {
  const A = antwortenVon(k), V = vorherVon(k);
  return AUSSAGEN.map((a) => {
    const w = Number.isInteger(A[a.id]) ? A[a.id] : null;
    const eintrag = { id: a.id, gruppe: 'Denkweise · ' + ZWEIG[a.zweig].titel, frage: a.text, art: 'wahl', wert: w, anzeige: anzeige(w),
      optionen: SKALA.map((s) => ({ ...s })), route: 'muster/fragen/bogen?frage=' + a.id };
    if (Array.isArray(V[a.id]) && V[a.id].length) eintrag.vorher = V[a.id].map((x) => ({ ...x }));
    return eintrag;
  });
}
export async function antwortSetzen(k, id, wert) {
  if (!AUSSAGE[id]) throw new Error('Unbekannte Frage: ' + id);
  if (wert === null || wert === undefined) schreibeAntwort(k, id, null, { loeschen: true });
  else {
    const w = Number(wert);
    if (!Number.isInteger(w) || w < 1 || w > 5) throw new Error('Ungültige Antwort: ' + wert);
    schreibeAntwort(k, id, w);
  }
  aktualisiereErgebnis(k);
  return true;
}
export function muster(k) {
  const A = antwortenVon(k), R = auswerten(A), raus = [];
  for (const Z of ZWEIGE) {
    const r = R[Z.id]; if (!r) continue;
    const belege = r.belege.map((b) => `„${AUSSAGE[b.id].text}“ – ${SKALA_TEXT[b.wert]}`);
    raus.push({ ast: 'muster.' + Z.id, titel: Z.titel, richtung: r.richtung, deutlich: r.deutlich,
      woher: `Aus deinen Antworten in „Denkweise“: ${belege.join('; ')}.`, pol: r.pol, wege: r.wege, wort: r.wort });
  }
  return raus;
}
export function aeste() { return AESTE.map((a) => ({ ...a })); }
const SELBST = { aeste, muster, antwortListe };

// ======================================================================= Hilfen für die Ansichten
let OFFEN = null;                 // offene Hauptäste im Baum (nur Arbeitsspeicher)
const SPUR = [];                  // zuletzt besuchte Äste (nur Arbeitsspeicher)
const STAPEL = [];                // Sprung-Weg von Ast zu Ast (für den Zurück-Pfeil)
const astHref = (id) => '#muster/ast/' + encodeURIComponent(id).replace(/%2E/gi, '.');
function lade(el) { el.innerHTML = '<p class="leise lade">Dein Muster wird zusammengesetzt …</p>'; }
function spurHtml(S, ohne, esc) {
  const ids = SPUR.filter((x) => x !== ohne && S.nachId.has(x)).slice(0, 5);
  if (!ids.length) return '';
  return `<nav class="mu-spur" aria-label="Zuletzt besucht"><span class="leise klein">Zuletzt besucht:</span>
    ${ids.map((x) => `<a class="mu-chip" href="${astHref(x)}">${esc(S.nachId.get(x).titel)}</a>`).join('')}</nav>`;
}
function fragebogenRoute(k, modul) {
  if (modul === M) return 'muster/fragen';
  const info = (k.module || []).find((m) => m.id === modul); if (!info) return null;
  return (info.fragen && info.fragen[0] && info.fragen[0].route) || (info.routen && info.routen[0]) || null;
}

// ======================================================================= #muster – Zusammenschau und Baum
async function baumSeite(ctx) {
  const { el, kern: k } = ctx, ui = k.ui, { esc } = ui;
  ctx.titel('Dein Muster');
  STAPEL.length = 0;
  lade(el);
  const S = await sammle(k, SELBST);
  if (!ctx.aktuell()) return;
  if (!OFFEN) {
    OFFEN = new Set(S.bereiche.filter((B) => bereichStand(S, B).da).map((B) => B.slug));
    if (!OFFEN.size) { const B = S.bereiche.find((x) => x.aeste.some((a) => a.fragen)) || S.bereiche[0]; if (B) OFFEN.add(B.slug); }
  }
  const ziel = ctx.param && ctx.param.bereich ? slug(ctx.param.bereich) : null;
  if (ziel) OFFEN.add(ziel);
  const nRicht = S.richtung.size;
  const saetze = S.saetze;
  const satzHtml = saetze.map((s) => `<li><p>${esc(s.text)}</p>${s.aeste.length ? `<p class="mu-zu">${s.aeste.filter((x) => S.nachId.has(x)).map((x) => `<a class="mu-chip" href="${astHref(x)}">${esc(S.nachId.get(x).titel)}</a>`).join('')}</p>` : ''}</li>`).join('');
  const oben = nRicht
    ? `<section class="karte mu-zusammen" aria-labelledby="mu-zs-t"><h3 id="mu-zs-t">So bist du zusammengesetzt</h3><ul class="mu-saetze">${satzHtml}</ul>
        ${saetze.length < 3 ? '<p class="klein leise">Mit jedem Teil, den du beantwortest, wachsen weitere Zweige – und es entstehen mehr Sätze über dich.</p>' : ''}</section>`
    : `<section class="karte weich mu-zusammen"><h3>Noch ist dein Baum kahl</h3>
        <p>Sobald du Fragen beantwortest, wachsen Zweige mit deinen Richtungen – und hier steht in ein paar Sätzen, wie du zusammengesetzt bist.</p>
        <p class="klein leise">Lesen kannst du jeden Ast schon jetzt: Tipp im Baum oder in der Liste darauf.</p></section>`;
  el.innerHTML = `<h2>Dein Muster</h2>
    <p class="lead">Kein Ergebnis mit Punkten – nur Richtungen. Beide Seiten eines Pols haben ihre Stärken. Das ist deine Mischung.</p>
    ${oben}
    <div class="reihe mu-knoepfe"><a class="knopf haupt" href="#muster/fragen">${ui.sym('fragen')} Denkweise-Fragen</a><a class="knopf zweit" href="#antworten">${ui.sym('profil')} Antworten ändern</a></div>
    ${spurHtml(S, null, esc)}
    <h3 id="mu-baum-t">Dein Baum</h3>
    <p class="leise klein" id="mu-baum-hilfe">Tipp auf einen Hauptast zum Auf- und Zuklappen, auf einen Zweig zum Lesen. „Du“ klappt alles auf oder zu.</p>
    <div class="mu-huelle" id="mu-baum" aria-describedby="mu-baum-hilfe"></div>
    <h3 id="mu-liste-t">Alle Äste als Liste</h3>
    ${S.bereiche.map((B) => `<h4 class="mu-b-t" id="mu-l-${esc(B.slug)}">${esc(B.name)} <span class="leise klein">${esc(bereichStand(S, B).text)}</span></h4>
      <ul class="zeilen mu-liste">${B.aeste.map((a) => { const z = zustand(S, a); return `<li><a class="zeile mu-z-${z.art}" href="${astHref(a.id)}"><span><b>${esc(a.titel)}</b><small>${esc(z.wort)}</small></span><span class="rechts">${ui.sym('weiter')}</span></a></li>`; }).join('')}</ul>`).join('')}
    ${S.stand.some((s) => !s.aeste && s.id !== M) ? `<p class="klein leise">Noch ohne eigene Äste: ${esc(S.stand.filter((s) => !s.aeste && s.id !== M).map((s) => s.name).join(', '))}.</p>` : ''}
    ${ui.fuss()}`;
  const huelle = el.querySelector('#mu-baum');
  let breite = 0;
  const zeichne = (fokus) => {
    const w = huelle.clientWidth; if (!w) return;
    breite = w;
    const cs = getComputedStyle(document.documentElement), rem = parseFloat(cs.fontSize) || 17;
    huelle.innerHTML = baumSvg(S, OFFEN, w, rem, getComputedStyle(document.body).fontFamily || 'sans-serif');
    if (fokus) { const n = huelle.querySelector(fokus); if (n) try { n.focus({ preventScroll: true }); } catch {} }
  };
  zeichne();
  // erst nach dem Kern (der danach scrollTop = 0 setzt) zum gewünschten Hauptast springen
  if (ziel) setTimeout(() => { const n = huelle.querySelector('#mu-b-' + CSS.escape(ziel)); if (n && ctx.aktuell()) { try { n.scrollIntoView({ block: 'center' }); n.focus({ preventScroll: true }); } catch {} } }, 30);
  const umschalten = (k0) => {
    if (k0.dataset.alle) { const alle = S.bereiche.every((B) => OFFEN.has(B.slug)); S.bereiche.forEach((B) => (alle ? OFFEN.delete(B.slug) : OFFEN.add(B.slug))); zeichne('[data-alle]'); return; }
    const b = k0.dataset.bereich; if (!b) return;
    if (OFFEN.has(b)) OFFEN.delete(b); else OFFEN.add(b);
    zeichne('#mu-b-' + CSS.escape(b));
  };
  const klick = (e) => { const k0 = e.target.closest('[role=button][data-bereich],[role=button][data-alle]'); if (k0 && huelle.contains(k0)) { e.preventDefault(); umschalten(k0); } };
  const taste = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const k0 = e.target.closest('[role=button][data-bereich],[role=button][data-alle]'); if (!k0) return;
    e.preventDefault(); umschalten(k0);
  };
  huelle.addEventListener('click', klick); huelle.addEventListener('keydown', taste);
  let ro = null, raf = 0;
  const neu = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (Math.abs(huelle.clientWidth - breite) >= 2) zeichne(); }); };
  if ('ResizeObserver' in window) { ro = new ResizeObserver(neu); ro.observe(huelle); } else window.addEventListener('resize', neu);
  return () => { huelle.removeEventListener('click', klick); huelle.removeEventListener('keydown', taste); if (ro) ro.disconnect(); else window.removeEventListener('resize', neu); cancelAnimationFrame(raf); };
}

// ======================================================================= #muster/ast/<id> – eine Verästelung
async function astSeite(ctx, id) {
  const { el, kern: k } = ctx, ui = k.ui, { esc } = ui;
  lade(el);
  const S = await sammle(k, SELBST);
  if (!ctx.aktuell()) return;
  const echt = S.finde(id), a = echt && S.nachId.get(echt);
  if (!a) {
    ctx.titel('Dein Muster'); ctx.zurueckZu('muster');
    el.innerHTML = `<h2>Diesen Ast gibt es hier nicht</h2>
      <p>Vielleicht hat er einen neuen Namen bekommen, oder der Teil, zu dem er gehört, ist gerade nicht geladen.</p>
      <a class="knopf haupt voll" href="#muster">Zum Baum</a>${spurHtml(S, null, esc)}${ui.fuss()}`;
    return;
  }
  if (echt !== id) { k.geh('muster/ast/' + echt, { ersetzen: true }); return; }
  // Spur und Zurück-Weg
  const i = SPUR.indexOf(id); if (i >= 0) SPUR.splice(i, 1); SPUR.unshift(id); if (SPUR.length > 8) SPUR.length = 8;
  if (STAPEL[STAPEL.length - 2] === id) STAPEL.pop(); else if (STAPEL[STAPEL.length - 1] !== id) STAPEL.push(id);
  ctx.zurueckZu(STAPEL.length > 1 ? 'muster/ast/' + STAPEL[STAPEL.length - 2] : 'muster');
  ctx.titel(a.titel);
  const e = S.richtung.get(id), z = zustand(S, a);
  const bSlug = slug(a.bereich);
  const fragRoute = fragebogenRoute(k, a.modul);
  // Richtung
  let richtung;
  if (e) {
    richtung = `<section class="karte akzent mu-richtung" aria-labelledby="mu-r-t"><h3 id="mu-r-t">Deine Richtung</h3>
      <p class="mu-r-satz">${esc(e.richtung)}</p>
      ${e.woher ? `<p class="klein leise">Woher: ${esc(e.woher)}</p>` : ''}
      <div class="reihe"><a class="knopf zweit" href="#antworten/${esc(a.modul)}">Antworten dazu ändern</a>${a.modul === M ? '<a class="knopf zweit" href="#muster/fragen">Zur Denkweise</a>' : ''}</div></section>`;
  } else if (z.art === 'lernen') {
    richtung = '<p class="hinweis mu-lern">Ein Ast zum Entdecken: ohne Fragen, zum Lesen und Weiterdenken. Vielleicht erkennst du dich in einem der beiden Pole wieder – beide sind gleich viel wert.</p>';
  } else {
    richtung = `<section class="karte weich mu-richtung"><h3>Noch offen</h3><p>Zu diesem Ast hast du noch nichts beantwortet. Dann wächst hier deine Richtung – in Worten, ohne Punkte.</p>
      ${fragRoute ? `<a class="knopf haupt voll" href="#${esc(fragRoute)}">Fragen dazu beantworten</a>` : ''}</section>`;
  }
  // Pole bzw. Wege – gleichwertig nebeneinander
  const neigung = (i0, name) => (e && e.deutlich !== 'beides' && ((e.pol === i0) || (Array.isArray(e.wege) && e.wege.includes(name)) || (e.pol == null && !e.wege && e.wort === name)));
  const P = a.pole || a.wege;
  const pole = P ? `<section class="mu-pole${a.wege ? ' drei' : ''}" aria-label="${a.wege ? 'Drei gleichwertige Wege' : 'Zwei gleichwertige Pole'}">
      ${P.map((p, i0) => `<div class="mu-pol${neigung(i0, p.name) ? ' deins' : ''}"><b>${esc(p.name)}</b><p>${esc(p.text)}</p>${neigung(i0, p.name) ? '<span class="mu-deins">hier neigst du hin</span>' : ''}</div>${!a.wege && i0 === 0 ? '<div class="mu-pol-band" aria-hidden="true"><span></span></div>' : ''}`).join('')}
    </section>${!a.wege ? '<p class="klein leise mitte">Beide Pole haben ihre Stärken – keiner ist besser.</p>' : '<p class="klein leise mitte">Keiner der Wege ist besser – die meisten Menschen gehen mehrere.</p>'}` : '';
  const ul = (l, kl = '') => `<ul class="mu-punkte${kl}">${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const abschnitt = (t, l, kl) => (l && l.length ? `<h3>${t}</h3>${ul(l, kl)}` : '');
  const unter = a.unteraeste.length ? `<h3>Tiefer: Verästelungen</h3>${a.unteraeste.map((u) => `<details class="karte mu-unter"><summary>${esc(u.titel)}</summary><p>${esc(u.text || '')}</p></details>`).join('')}` : '';
  const ueben = a.ueben.length ? `<h3>Üben in der App</h3><ul class="zeilen">${a.ueben.map((u) => `<li><a class="zeile" href="#${esc(u.route.replace(/^#/, ''))}"><span><b>${esc(u.titel)}</b></span><span class="rechts">${ui.sym('training')}</span></a></li>`).join('')}</ul>` : '';
  const J = springen(S, id);
  const karte = (x) => { const zz = zustand(S, x); return `<a class="mu-sprung mu-z-${zz.art}" href="${astHref(x.id)}"><small>${esc(x.bereich)}</small><b>${esc(x.titel)}</b><span>${esc(zz.wort)}</span></a>`; };
  const gruppe = (t, l) => (l.length ? `<h4>${t}</h4><div class="mu-spruenge">${l.map(karte).join('')}</div>` : '');
  const weiter = J.verwandt.length || J.geschwister.length || J.ferne.length
    ? `<h3>Weiter springen</h3>${gruppe('Verwandt', J.verwandt)}${gruppe('Im selben Bereich: ' + esc(a.bereich), J.geschwister)}${gruppe('Aus anderen Bereichen', J.ferne)}` : '';
  el.innerHTML = `<nav class="mu-krumen" aria-label="Wo du bist"><a href="#muster">Du</a><span aria-hidden="true">›</span><a href="#muster?bereich=${esc(bSlug)}">${esc(a.bereich)}</a><span aria-hidden="true">›</span><span aria-current="page">${esc(a.titel)}</span></nav>
    <h2>${esc(a.titel)}</h2>
    ${richtung}
    ${pole}
    ${a.wasEsIst ? `<h3>Was es ist</h3><p>${esc(a.wasEsIst)}</p>` : ''}
    ${abschnitt('Im Alltag', a.imAlltag)}
    ${abschnitt('Stärken', a.staerken)}
    ${abschnitt('Wo es reiben kann', a.reibung)}
    ${abschnitt('Weiterdenken', a.weiterdenken, ' mu-weiterdenken')}
    ${unter}${ueben}${weiter}
    ${a.wissen ? `<h3>Woher das Wissen kommt</h3><p class="klein">${esc(a.wissen)}</p>` : ''}
    ${spurHtml(S, id, esc)}
    <p><a class="knopf zweit voll" href="#muster">Zurück zum Baum</a></p>
    ${ui.fuss()}`;
}

// ======================================================================= #muster/fragen – Übersicht, Richtungen, Antworten ändern
function fragenSeite(ctx) {
  const { el, kern: k } = ctx, ui = k.ui, { esc } = ui;
  ctx.titel('Denkweise'); ctx.zurueckZu('muster');
  const male = (fokus) => {
    const A = antwortenVon(k), V = vorherVon(k), n = beantwortet(A), R = auswerten(A), N = AUSSAGEN.length;
    const kopf = n === 0
      ? `<p class="lead">Wie du denkst, entscheidest und was dir wichtig ist – ${N} kurze Aussagen, ${DAUER}.</p>
         <p>Es gibt kein richtig oder falsch und keine Punkte. Aus deinen Antworten werden Richtungen in Worten – zwischen zwei Polen, die beide ihre Stärken haben.</p>
         <a class="knopf haupt gross voll" href="#muster/fragen/bogen">Los geht’s</a>`
      : n < N
        ? `<p class="lead">Du hast ${n} von ${N} Aussagen gesehen.</p><a class="knopf haupt gross voll" href="#muster/fragen/bogen">Weitermachen</a>`
        : `<p class="lead">Deine Denkweise in Richtungen. Jede Antwort kannst du unten jederzeit ändern – das Muster rechnet sofort neu.</p>`;
    el.innerHTML = `<h2>Denkweise</h2>${kopf}
      ${ui.merkHinweis(k.speicher.einwilligung())}
      <h3>Deine Richtungen</h3>
      <div class="mu-spruenge breit">${ZWEIGE.map((Z) => { const r = R[Z.id]; return `<a class="mu-sprung mu-z-${r ? 'da' : 'offen'}" href="${astHref('muster.' + Z.id)}"><b>${esc(Z.titel)}</b><span>${esc(r ? r.richtung : 'noch offen – dafür braucht es mindestens zwei Antworten')}</span></a>`; }).join('')}</div>
      <p class="reihe"><a class="knopf zweit" href="#muster">${ui.sym('passt')} Dein Muster ansehen</a></p>
      ${n ? `<h3 id="mu-antw-t">Deine Antworten</h3><p class="leise klein">Tipp auf eine Aussage, um deine Antwort zu ändern oder zu löschen.</p>
      <ul class="zeilen mu-antworten" aria-labelledby="mu-antw-t">${AUSSAGEN.map((a) => {
        const w = A[a.id], v = Array.isArray(V[a.id]) ? V[a.id] : [];
        const stand = !(a.id in A) ? 'noch offen' : w == null ? 'übersprungen' : SKALA_TEXT[w];
        return `<li><button type="button" class="zeile" data-aendern="${a.id}"><span><b class="mu-aussage">${esc(a.text)}</b><small>${esc(stand)}${v.length ? ` · vorher: ${esc(v.slice(-2).map((x) => x.anzeige).join(', '))}` : ''}</small></span><span class="rechts">${ui.sym('weiter')}</span></button></li>`;
      }).join('')}</ul>` : ''}
      <p class="klein leise">Eigene Aussagen, angelehnt an Denkrichtungen aus Philosophie und Psychologie (Stoa, Frankl, Schwartz, Kahneman, Frenkel-Brunswik, Rotter, Dweck). Keine geprüfte Skala und keine Diagnose. ${ui.marke('idee', ['cacioppo1982', 'frenkel1949', 'dweck1988', 'rotter1966', 'kahneman2011', 'schwartz1992', 'deci2000', 'frankl1946'])}</p>
      ${ui.fuss()}`;
    if (fokus) { const b = el.querySelector(fokus); if (b) try { b.focus({ preventScroll: false }); } catch {} }
  };
  male();
  const klick = async (e) => {
    const b = e.target.closest('[data-aendern]'); if (!b || !el.contains(b)) return;
    const id = b.dataset.aendern, a = AUSSAGE[id], A = antwortenVon(k), w = A[id], V = vorherVon(k)[id] || [];
    const html = `<p class="mu-blatt-frage">${esc(a.text)}</p>
      <div class="stapel" role="group" aria-label="Antwort wählen">${SKALA.map((s) => `<button type="button" class="knopf ${w === s.wert ? 'haupt' : 'zweit'}" data-w="${s.wert}"${w === s.wert ? ' aria-pressed="true"' : ''}>${esc(s.text)}</button>`).join('')}</div>
      ${id in A ? '<p class="mitte"><button type="button" class="link" data-w="loeschen">Antwort löschen</button></p>' : ''}
      ${V.length ? `<p class="klein leise">Vorher: ${esc(V.map((x) => `${x.anzeige} (${ui.datum(x.zeit)})`).join(' · '))}</p>` : ''}`;
    const wahl = await ui.blatt(html, { titel: 'Antwort ändern' });
    if (wahl == null || !ctx.aktuell()) return;
    await antwortSetzen(k, id, wahl === 'loeschen' ? null : Number(wahl));
    male(`[data-aendern="${id}"]`);
    ui.meldung(wahl === 'loeschen' ? 'Antwort gelöscht – dein Muster ist neu berechnet.' : 'Geändert – dein Muster ist neu berechnet.');
  };
  el.addEventListener('click', klick);
  return () => el.removeEventListener('click', klick);
}

// ======================================================================= #muster/fragen/bogen – eine Aussage pro Bildschirm
function bogen(ctx) {
  const { el, kern: k } = ctx, ui = k.ui;
  ctx.titel('Denkweise'); ctx.zurueckZu('muster/fragen');
  const A = antwortenVon(k);
  const fragen = AUSSAGEN.map((a, i) => ({ id: a.id, text: a.text, hilfe: i === 0 ? 'Es gibt kein richtig oder falsch. Antworte so, wie du meistens bist – nicht so, wie du gern wärst.' : '' }));
  const gewuenscht = ctx.param && ctx.param.frage ? AUSSAGEN.findIndex((a) => a.id === ctx.param.frage) : -1;
  const fb = ui.fragebogen(el, {
    titel: 'Denkweise', fragen, antworten: A, skala: ui.SKALA5 || SKALA, ueberspringen: true, weiterText: 'Weiter',
    ...(gewuenscht >= 0 ? { start: gewuenscht } : {}),
    beiAntwort(id, wert) { schreibeAntwort(k, id, wert == null ? null : Number(wert)); aktualisiereErgebnis(k); },
    fertig() {
      aktualisiereErgebnis(k, { zumSchluss: true });
      k.geh('muster/fragen', { ersetzen: true });
      ui.meldung('Fertig – dein Baum hat neue Zweige.');
    },
    pause() { k.geh('muster/fragen'); }
  });
  return () => fb.zerstoere();
}

// ======================================================================= Registrierung
export default {
  id: M,
  schema: 1,
  start(k) { k.ui.ladeStil(new URL('./stil.css', import.meta.url).href); },
  ansicht(ctx) {
    const [, teil, unter] = ctx.pfad;
    if (!teil) return baumSeite(ctx);
    if (teil === 'ast') { const id = ctx.pfad.slice(2).join('/'); if (id) return astSeite(ctx, id); ctx.kern.geh('muster', { ersetzen: true }); return; }
    if (teil === 'fragen') return unter === 'bogen' ? bogen(ctx) : fragenSeite(ctx);
    ctx.kern.geh('muster', { ersetzen: true });
  }
};
