// M1 bigfive – Big Five aus dem IPIP-NEO-120 (gemeinfrei): Kurzform 30 Sätze (einer je Facette, ca. 3 Min.), „Genauer hinschauen“
// je Bereich (die übrigen 18 Sätze). Fassung 24.11.2026 (Xanders Wunsch): KEINE Bewertung – je Bereich zwei gleichwertige Pole in Worten,
// Richtung nur aus den eigenen Antworten („klar“, „leicht“, „beides gehört zu dir“), kein Vergleich, keine Prozente/Balken.
// Alle Antworten jederzeit ansehen und ändern (#fragen/bigfive/antworten), das Muster rechnet sofort neu; frühere Antworten als „vorher“.
// Routen: fragen/bigfive (Übersicht/Ergebnis), …/start, …/vertiefung?bereich=, …/ergebnis, …/antworten?bereich=, …/methode.
// Vertrag (Muster-Baum, #antworten): export antwortListe(k), antwortSetzen(k, id, wert), muster(k), aeste().
import { kern } from '../../kern.js';
import { FRAGEN, NACH_ID, BEREICHE, BEREICH, VON_IPIP, FACETTEN, FACETTEN_POLE, START_REIHE, startFragen, vertiefungsFragen } from './daten.js';
import { wertung, startFertig, startBeantwortet, eigenesMuster, wortAus } from './rechnen.js';
import { TEXTE, satz, grundText, FRAGLICH, QUALITAET } from './texte.js';
import { aeste, AST_TITEL } from './aeste.js';

export { aeste };

const M = 'bigfive';
const sp = kern.speicher;
const ui = kern.ui;
const { esc } = ui;
const BASIS = 'fragen/bigfive';
const VORHER_MAX = 5;
const SKALA = ui.SKALA5 || [
  { wert: 1, text: 'stimmt gar nicht' }, { wert: 2, text: 'stimmt eher nicht' }, { wert: 3, text: 'teils, teils' }, { wert: 4, text: 'stimmt eher' }, { wert: 5, text: 'stimmt genau' }
];
const anzeigeVon = (w) => (SKALA.find((x) => x.wert === w) || {}).text || '';
const gueltig = (a) => typeof a === 'number' && a >= 1 && a <= 5;
const S_ = (k) => (k && k.speicher) || sp;
const titelVon = (id) => AST_TITEL[id] || (BEREICH[id] && BEREICH[id].name) || id;
const liste = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' und ' + xs[xs.length - 1]);
const zitat = (t) => `„${t}“`;

// ---------- Modul-Daten (Format der Vorlage; neu nur das Feld „vorher“) ----------
function daten(S = sp) {
  return { antworten: S.lies(M, 'antworten', {}) || {}, zeiten: S.lies(M, 'zeiten', {}) || {}, lauf: S.lies(M, 'lauf', null), gruppe: S.lies(M, 'gruppe', null) };
}
function gruppe() {
  const g = sp.lies(M, 'gruppe', null); if (g) return g;   // nur intern (Vergleichswerte für ältere Leser), wird nicht mehr gezeigt
  const a = kern.einst().alter; return a === 'u16' || a === '16-17' ? 'u21' : 'alle';
}
function reihe() { return [...startFragen(), ...vertiefungsFragen('alle')].map((q) => q.id); }
function rechne(d = daten()) { return wertung(d.antworten, { gruppe: gruppe(), zeiten: d.zeiten, lauf: d.lauf, reihe: reihe() }); }
// nachAenderung: auch speichern, wenn nach einer Korrektur die Kurzform nicht mehr vollständig ist (dasselbe Ergebnis wird ersetzt).
function speichereErgebnis({ nachAenderung = false } = {}) {
  const d = daten(), alt = sp.ergebnis(M);
  const gleicherLauf = !!(alt && d.lauf && alt.lauf === d.lauf);
  if (!startFertig(d.antworten) && !(nachAenderung && gleicherLauf)) return null;
  return sp.setzeErgebnis(M, rechne(d), { ersetzen: gleicherLauf });
}
// Frühere Antwort merken (neueste zuerst, höchstens VORHER_MAX je Satz).
function merkeVorher(S, id, alt) {
  if (!gueltig(alt)) return;
  const v = S.lies(M, 'vorher', {}) || {};
  v[id] = [{ wert: alt, anzeige: anzeigeVon(alt), zeit: new Date().toISOString() }, ...(v[id] || [])].slice(0, VORHER_MAX);
  S.schreib(M, 'vorher', v);
}
function neuerLauf() {
  const a = sp.lies(M, 'antworten', {}) || {};
  const v = sp.lies(M, 'vorher', {}) || {}, jetzt = new Date().toISOString();
  for (const [id, w] of Object.entries(a)) if (gueltig(w)) v[id] = [{ wert: w, anzeige: anzeigeVon(w), zeit: jetzt }, ...(v[id] || [])].slice(0, VORHER_MAX);
  sp.schreib(M, 'vorher', v);
  sp.schreib(M, 'antworten', {}); sp.schreib(M, 'zeiten', {}); sp.schreib(M, 'lauf', new Date().toISOString());
}
const gehoertZu = (e, d) => !!(e && d.lauf && e.lauf === d.lauf && startFertig(d.antworten));

// ---------- Das Muster in Worten: { bereiche: {id: {pol, deutlich, n}}, facetten: {'b.f': {…}}, fraglich, form: {id: 'start'|'vertieft'} } ----------
// Neue Ergebnisse tragen die Richtung selbst (eigen, facettenEigen). Ältere Ergebnisse der Vorlage: aus den Antworten nachrechnen,
// falls sie dazugehören; sonst vorsichtig aus den alten Feldern ableiten (klar/stufe).
function aus(b) { return b ? { pol: b.klar || Math.sign(b.stufe || 0), deutlich: b.klar ? 'klar' : b.stufe ? 'leicht' : 'beides', n: b.n || 0 } : null; }
function lagen(e, d) {
  const fertig = (L) => (Object.keys(L.bereiche).length ? L : null);
  if (!e || e.schema !== 1 || !e.bereiche) return d && Object.keys(d.antworten).length ? fertig({ ...eigenesMuster(d.antworten), form: {} }) : null;
  const fraglich = !!(e.qualitaet && e.qualitaet.fraglich);
  const form = Object.fromEntries(Object.entries(e.bereiche).map(([id, b]) => [id, b && b.form]));
  const neu = e.facettenEigen && Object.values(e.bereiche).every((b) => b && b.eigen);
  if (neu) return fertig({ bereiche: Object.fromEntries(Object.entries(e.bereiche).map(([id, b]) => [id, b.eigen])), facetten: e.facettenEigen, fraglich, form });
  if (d && gehoertZu(e, d)) return fertig({ ...eigenesMuster(d.antworten, fraglich), form });
  const bereiche = {}, facetten = {};
  for (const [id, b] of Object.entries(e.bereiche)) { const r = aus(b); if (r) bereiche[id] = fraglich && r.deutlich === 'klar' ? { ...r, deutlich: 'leicht' } : r; }
  for (const [id, b] of Object.entries(e.facetten || {})) { const r = aus(b); if (r) facetten[id] = r; }
  return fertig({ bereiche, facetten, fraglich, form });
}
function facettenVon(B, L) { return Object.entries(FACETTEN_POLE[B.id]).map(([f, P]) => ({ f, titel: P[0], pole: [P[1], P[2]], r: L.facetten[B.id + '.' + f] || null })); }
function woherText(B, r, L) {
  const quelle = L.form && L.form[B.id] === 'vertieft' ? 'Aus deinen Antworten zu allen Sätzen dieses Bereichs' : 'Aus deinen Antworten in der Kurzform (ein Satz je Facette)';
  const fac = facettenVon(B, L).filter((x) => x.r);
  if (r.pol) {
    const mit = fac.filter((x) => x.r.pol === r.pol && x.r.deutlich === 'klar').map((x) => zitat(x.titel));
    const mit2 = mit.length ? mit : fac.filter((x) => x.r.pol === r.pol).map((x) => zitat(x.titel));
    return `${quelle}${mit2.length ? ` – am deutlichsten bei ${liste(mit2.slice(0, 3))}` : ''}.`;
  }
  const P = TEXTE[B.id].pole, hin = fac.filter((x) => x.r.pol > 0).map((x) => zitat(x.titel)), her = fac.filter((x) => x.r.pol < 0).map((x) => zitat(x.titel));
  if (hin.length && her.length) return `${quelle}: ${liste(hin.slice(0, 3))} ${hin.length > 1 ? 'zeigen' : 'zeigt'} eher zu ${zitat(P[0].name)}, ${liste(her.slice(0, 3))} eher zu ${zitat(P[1].name)}.`;
  return `${quelle}.`;
}

// ---------- Vertrag: Antworten ansehen und ändern ----------
function reihenfolge(a, vorher) {
  const ids = [];
  for (const B of BEREICHE) {
    START_REIHE.map((n) => NACH_ID['bf' + n]).filter((q) => q.b === B.ipip).forEach((q) => ids.push(q.id));
    vertiefungsFragen(B.id).filter((q) => q.id in a || (vorher[q.id] && vorher[q.id].length)).forEach((q) => ids.push(q.id));
  }
  return ids;
}
function eintrag(id, a, vorher) {
  const q = NACH_ID[id], B = BEREICH[VON_IPIP[q.b]], w = gueltig(a[id]) ? a[id] : null;
  return {
    id, gruppe: titelVon(B.id), frage: q.t, art: 'wahl', wert: w, anzeige: w == null ? '' : anzeigeVon(w),
    optionen: SKALA.map((x) => ({ wert: x.wert, text: x.text })), route: `${BASIS}/antworten?bereich=${B.id}`,
    vorher: (vorher[id] || []).slice(0, VORHER_MAX).map((v) => ({ wert: v.wert, anzeige: v.anzeige || anzeigeVon(v.wert), zeit: v.zeit })),
    ...(q.h ? { hilfe: q.h } : {}), uebersprungen: a[id] === null, kurzform: !!q.start, bereich: B.id
  };
}
export function antwortListe(k = kern) {
  const S = S_(k), a = S.lies(M, 'antworten', {}) || {}, vorher = S.lies(M, 'vorher', {}) || {};
  return reihenfolge(a, vorher).map((id) => eintrag(id, a, vorher));
}
export async function antwortSetzen(k = kern, id, wert) {
  const S = S_(k), q = NACH_ID[id];
  if (!q) throw new Error('Unbekannte Frage: ' + id);
  const w = wert === null || wert === undefined || wert === '' ? null : Number(wert);
  if (w !== null && !(Number.isInteger(w) && w >= 1 && w <= 5)) throw new Error('Ungültige Antwort: ' + wert);
  const a = S.lies(M, 'antworten', {}) || {}, alt = a[id];
  if (w === null ? !(id in a) : alt === w) return eintrag(id, a, S.lies(M, 'vorher', {}) || {});   // nichts geändert
  merkeVorher(S, id, alt);
  if (w === null) delete a[id]; else a[id] = w;
  if (!S.lies(M, 'lauf', null)) S.schreib(M, 'lauf', new Date().toISOString());
  S.schreib(M, 'antworten', a);
  speichereErgebnis({ nachAenderung: true });
  kern.emit('bigfive:geaendert', { id, wert: w });
  return eintrag(id, a, S.lies(M, 'vorher', {}) || {});
}
export function muster(k = kern) {
  const S = S_(k), L = lagen(S.ergebnis(M), daten(S));
  if (!L) return [];
  return BEREICHE.filter((B) => L.bereiche[B.id]).map((B) => {
    const r = L.bereiche[B.id];
    return { ast: 'bigfive.' + B.id, titel: titelVon(B.id), richtung: satz(B.id, r), deutlich: r.deutlich, woher: woherText(B, r, L) + (L.fraglich ? ' Die Antworten wirkten eilig – darum vorsichtig gesagt.' : '') };
  });
}

// ---------- Fragebogen (Kurzform oder Vertiefung) ----------
function bogen(ctx, teil) {
  const { el } = ctx;
  const d = daten();
  const bereich = teil === 'start' ? null : teil;
  ctx.zurueckZu((!bereich && kern.weg && kern.weg.nachBogen()) || BASIS);   // Start-Fragebogen läuft → Kopf-Pfeil zu #los (Prüfung T10)
  if (bereich && !(bereich === 'alle' || BEREICH[bereich])) { kern.geh(BASIS, { ersetzen: true }); return; }
  if (bereich && !startFertig(d.antworten)) {
    ctx.titel('Genauer hinschauen');
    el.innerHTML = `<h2>Erst die Kurzform</h2><p>Für „Genauer hinschauen“ brauche ich deine Antworten aus der Kurzform. Sie sind auf diesem Gerät nicht mehr da – zum Beispiel, weil sie nicht gemerkt wurden.</p>
      <a class="knopf haupt voll" href="#${BASIS}/start">Kurzform ausfüllen (ca. 3 Min.)</a>${ui.fuss()}`;
    return;
  }
  if (!d.lauf) sp.schreib(M, 'lauf', new Date().toISOString());
  const qs = bereich ? vertiefungsFragen(bereich) : startFragen();
  const name = bereich ? (bereich === 'alle' ? 'Alle Bereiche genauer' : titelVon(bereich) + ' genauer') : 'Persönlichkeit';
  ctx.titel(bereich ? 'Genauer hinschauen' : 'Persönlichkeit');
  const fragen = qs.map((q, i) => ({ id: q.id, text: q.t, hilfe: q.h || (i === 0 ? 'Beschreib dich so, wie du jetzt meistens bist – nicht so, wie du gern wärst.' : '') }));
  const antworten = { ...d.antworten }, zeiten = { ...d.zeiten };
  const meine = Object.fromEntries(qs.filter((q) => q.id in antworten).map((q) => [q.id, antworten[q.id]]));
  let letzte = performance.now(), schnellFolge = 0, gestupst = false;
  const sichtbar = () => { if (document.visibilityState === 'visible') letzte = performance.now(); };
  document.addEventListener('visibilitychange', sichtbar);
  const fb = ui.fragebogen(el, {
    titel: name, fragen, antworten: meine, ueberspringen: true, weiterText: 'Weiter',
    beiAntwort(id, wert) {
      const jetzt = performance.now(), dt = Math.round(jetzt - letzte); letzte = jetzt;
      if (gueltig(antworten[id]) && antworten[id] !== wert) merkeVorher(sp, id, antworten[id]);   // umentschieden → „vorher“
      antworten[id] = wert; zeiten[id] = dt;
      sp.schreib(M, 'antworten', antworten); sp.schreib(M, 'zeiten', zeiten);
      schnellFolge = dt < 900 ? schnellFolge + 1 : 0;
      if (schnellFolge >= 6 && !gestupst) { gestupst = true; ui.meldung('Kein Stress – lies die Sätze ruhig. Es gibt kein Richtig oder Falsch.', 4000); }
      const fertigAnzahl = qs.filter((q) => q.id in antworten).length;
      kern.emit('bigfive:fortschritt', { teil: bereich || 'start', beantwortet: fertigAnzahl, gesamt: qs.length });
    },
    fertig() {
      const e = speichereErgebnis();
      const weg = !bereich && kern.weg ? kern.weg.nachBogen() : null;   // Start-Fragebogen läuft → zurück zu #los (Integration)
      if (weg) { kern.geh(weg, { ersetzen: true }); if (e) ui.meldung('Teil 1 fertig – weiter geht’s.'); return; }
      kern.geh(BASIS + (bereich && bereich !== 'alle' ? '?zu=' + bereich : ''), { ersetzen: true });
      if (e) ui.meldung(bereich ? 'Fertig – dein Muster ist jetzt genauer.' : 'Fertig – hier ist dein Muster.');
    },
    pause() { kern.geh((!bereich && kern.weg && kern.weg.nachBogen()) || BASIS); }
  });
  return () => { fb.zerstoere(); document.removeEventListener('visibilitychange', sichtbar); };
}

// ---------- Einstieg (noch kein Ergebnis oder neuer Durchgang läuft) ----------
function einstieg(ctx, e) {
  const { el } = ctx; ctx.zurueckZu('fragen'); ctx.titel('Persönlichkeit');
  const d = daten(), n = startBeantwortet(d.antworten), laeuft = n > 0 && !startFertig(d.antworten);
  const u16 = kern.einst().alter === 'u16';
  el.innerHTML = `<h2>Persönlichkeit (Big Five)</h2>
    <p class="lead">Fünf große Grundzüge, die in der Forschung am besten untersucht sind: Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit und der Umgang mit Stress. ${ui.marke('belegt', ['goldberg2006', 'soto2019'])}</p>
    <ul class="bf-liste">
      <li><b>30 kurze Sätze</b>, etwa 3 Minuten. Du sagst jeweils, wie sehr er auf dich zutrifft.</li>
      <li>Danach siehst du dein <b>Muster in Worten</b>: je Bereich zwei Seiten, beide mit Stärken – keine Punkte, kein Vergleich mit anderen.</li>
      <li>Jede Antwort kannst du später <b>ansehen und ändern</b>. Wo du magst, schaust du einzelne Bereiche genauer an.</li>
    </ul>
    <p class="hinweis klein">Beschreib dich so, wie du <b>jetzt meistens</b> bist – nicht so, wie du gern wärst. Es gibt kein Richtig oder Falsch. Du kannst Sätze überspringen.</p>
    ${u16 ? '<p class="hinweis gelb klein">Mit unter 16 ist Persönlichkeit noch stark in Bewegung. Nimm dein Muster als Momentaufnahme.</p>' : ''}
    ${laeuft ? `${ui.fortschritt(n / 30, 'Kurzform beantwortet')}<p class="leise klein">Frage ${n} von 30 beantwortet.</p>
      <a class="knopf haupt gross voll" href="#${BASIS}/start">Weitermachen</a>
      <a class="knopf zweit voll" href="#${BASIS}/antworten">Bisherige Antworten ansehen</a>
      <button type="button" class="knopf zweit voll" data-bf="neu">Von vorn beginnen</button>`
    : `<a class="knopf haupt gross voll" href="#${BASIS}/start">Los geht’s</a>`}
    ${e ? `<p class="mitte"><a class="link" href="#${BASIS}/ergebnis">Dein letztes Muster ansehen (${esc(ui.datum(e.zeit))})</a></p>` : ''}
    <p class="leise klein">${ui.sym('schloss')} ${sp.einwilligung() ? 'Deine Antworten bleiben auf diesem Gerät.' : 'Deine Antworten bleiben nur bis zum Schließen in diesem Fenster. Nichts wird gesendet.'}</p>
    <p class="mitte"><a class="link" href="#${BASIS}/methode">Woher die Sätze kommen und wie das Muster entsteht</a></p>
    ${ui.fuss()}`;
  const klick = async (ev) => {
    const b = ev.target.closest('[data-bf=neu]'); if (!b) return;
    if (await ui.bestaetige({ titel: 'Von vorn beginnen?', text: 'Deine Antworten in diesem Durchgang werden zurückgesetzt. Was du geantwortet hattest, bleibt als „vorher“ sichtbar.', ja: 'Von vorn' })) { neuerLauf(); kern.geh(BASIS + '/start'); }
  };
  el.addEventListener('click', klick);
  return () => el.removeEventListener('click', klick);
}

// ---------- Ergebnis: dein Muster in Worten ----------
function brauchtHilfe(e, a) {
  const s = e.bereiche.stabilitaet;
  return (s && s.oben < 45) || [11, 41, 71, 86].some((n) => a['bf' + n] >= 4) || a.bf101 === 1;
}
// Zwei gleichwertige Pole; der Pol, zu dem die Antworten zeigen, ist nur hervorgehoben (kein Punkt auf einer Skala).
function poleHtml(B, r) {
  const P = TEXTE[B.id].pole;
  const marke = (i) => {
    const zu = r.pol === (i === 0 ? 1 : -1);
    if (r.deutlich === 'beides' || !r.pol) return ['beide', 'gehört zu dir'];
    return zu ? [r.deutlich === 'klar' ? 'an' : 'halb', r.deutlich === 'klar' ? 'hierhin zeigen deine Antworten' : 'leicht hierhin'] : ['', ''];
  };
  return `<div class="bf-pole">${P.map((p, i) => { const [k, t] = marke(i); return `${i ? '<span class="bf-zw" aria-hidden="true">oder</span>' : ''}<div class="bf-pol ${k}">${t ? `<span class="bf-hier">${esc(t)}</span>` : ''}<b>${esc(p.name)}</b><span class="bf-poltext">${esc(p.text)}</span></div>`; }).join('')}</div>`;
}
function facettenHtml(B, L, offen) {
  const fac = facettenVon(B, L);
  if (!fac.some((x) => x.r)) return '';
  const vertieft = L.form && L.form[B.id] === 'vertieft';
  return `<details class="bf-facetten"${offen ? ' open' : ''}><summary>Die sechs Facetten</summary>
    <p class="klein leise">${vertieft ? 'Je Facette stehen jetzt mehrere Sätze dahinter.' : 'In der Kurzform steht hinter jeder Facette ein Satz – nimm sie als ersten Hinweis. Mit „Genauer hinschauen“ kommen je Facette weitere Sätze dazu.'}</p>
    <ul class="bf-fac">${fac.map((x) => `<li><b>${esc(x.titel)}</b><span>${x.r ? esc(wortAus(B.id + '.' + x.f, x.r)) : '<span class="leise">noch offen</span>'}</span><small class="leise">Die zwei Seiten: ${esc(zitat(x.pole[0]))} und ${esc(zitat(x.pole[1]))}${x.f === 'liberalitaet' ? ' · nur zwei Sätze, sehr grob' : ''}</small></li>`).join('')}</ul>
  </details>`;
}
function bereichHtml(B, e, L, aktiv) {
  const T = TEXTE[B.id], r = L.bereiche[B.id];
  if (!r) return `<section class="karte bf-bereich" id="bf-${B.id}"><h3>${esc(titelVon(B.id))}</h3><p class="leise">Für diesen Bereich fehlen noch Antworten.</p>
    <p><a class="knopf zweit klein" href="#${BASIS}/antworten?bereich=${B.id}">Antworten dazu</a></p></section>`;
  const b = e.bereiche[B.id] || {}, vertieft = b.form === 'vertieft';
  const grund = aktiv && !vertieft && e.vertiefung && e.vertiefung.gruende && e.vertiefung.gruende[B.id];
  const auf = (location.hash || '').includes('zu=' + B.id);
  return `<section class="karte bf-bereich" id="bf-${B.id}" aria-labelledby="bf-h-${B.id}">
    <h3 id="bf-h-${B.id}">${esc(titelVon(B.id))}</h3>
    <p class="klein leise">${esc(T.was)}</p>
    ${poleHtml(B, r)}
    <p class="bf-richtung">${esc(satz(B.id, r))}</p>
    <p class="klein leise bf-woher">${esc(woherText(B, r, L))}</p>
    ${facettenHtml(B, L, auf)}
    ${ui.aussage({ text: T.forschung.text, stufe: 'belegt', quellen: T.forschung.quellen })}
    <p class="klein leise"><b>Was das nicht heißt:</b> ${esc(T.nicht)}</p>
    ${grund ? `<div class="hinweis bf-angebot"><p class="klein">${esc(grundText(r))}</p><a class="knopf haupt klein" href="#${BASIS}/vertiefung?bereich=${B.id}">Genauer hinschauen · 18 Sätze</a></div>` : ''}
    <div class="bf-wege">
      <a class="knopf zweit klein" href="#muster/ast/bigfive.${B.id}">Mehr über diesen Ast</a>
      <a class="knopf zweit klein" href="#${BASIS}/antworten?bereich=${B.id}">Antworten dazu</a>
      ${aktiv && !vertieft && !grund ? `<a class="knopf zweit klein" href="#${BASIS}/vertiefung?bereich=${B.id}">Genauer hinschauen</a>` : ''}
    </div>
  </section>`;
}
function kurzHtml(L) {
  const name = (B) => zitat(TEXTE[B.id].pole[L.bereiche[B.id].pol > 0 ? 0 : 1].name);
  const da = BEREICHE.filter((B) => L.bereiche[B.id]);
  const klar = da.filter((B) => L.bereiche[B.id].deutlich === 'klar').map(name);
  const leicht = da.filter((B) => L.bereiche[B.id].deutlich === 'leicht').map(name);
  const beides = da.filter((B) => L.bereiche[B.id].deutlich === 'beides').map((B) => titelVon(B.id));
  return `${klar.length ? `<p>Klar zeigen deine Antworten in Richtung ${esc(liste(klar))}.</p>` : ''}${leicht.length ? `<p>Leicht in Richtung ${esc(liste(leicht))}.</p>` : ''}${beides.length ? `<p>Beide Seiten gehören zu dir bei: ${esc(liste(beides))}.</p>` : ''}`;
}
function ergebnis(ctx, e) {
  const { el } = ctx; ctx.zurueckZu('fragen'); ctx.titel('Persönlichkeit');
  if (!e || e.schema !== 1 || !e.bereiche) {
    el.innerHTML = `<h2>Bitte noch einmal ausfüllen</h2><p>Dieses Ergebnis stammt aus einer anderen Fassung der App.</p><a class="knopf haupt voll" href="#${BASIS}/start">Kurzform ausfüllen</a>${ui.fuss()}`;
    return;
  }
  const d = daten(), aktiv = gehoertZu(e, d) || !!(e.lauf && d.lauf === e.lauf), L = lagen(e, d);
  if (!L) { el.innerHTML = `<h2>Noch kein Muster</h2><p>Für ein Muster fehlen noch Antworten.</p><a class="knopf haupt voll" href="#${BASIS}/antworten">Deine Antworten</a>${ui.fuss()}`; return; }
  const q = e.qualitaet || {};
  const qText = [q.schnell && QUALITAET.schnell(), q.gleich && QUALITAET.gleich(), q.jaSager && QUALITAET.jaSager(), q.neinSager && QUALITAET.neinSager()].filter(Boolean);
  const offen = BEREICHE.filter((B) => e.bereiche[B.id] && e.bereiche[B.id].form !== 'vertieft').length;
  const rest = vertiefungsFragen('alle').filter((x) => !(x.id in d.antworten)).length;
  el.innerHTML = `<h2>Dein Muster: Persönlichkeit</h2>
    <p class="leise klein">Big Five · Stand ${esc(ui.datum(e.zeit))} · ${e.form === 'vertieft' ? 'teilweise genauer angeschaut' : 'Kurzform'}</p>
    <p>Jeder Bereich hat zwei Seiten. Keine ist besser – jede hat ihre Stärken und ihre Reibungen. ${ui.marke('belegt', ['nettle2006'])} Hier siehst du, wohin deine Antworten zeigen.</p>
    ${qText.length ? `<div class="karte gelb bf-qualitaet" role="note"><h3>Hier lohnt ein zweiter Blick</h3>${qText.map((t) => `<p>${esc(t)}</p>`).join('')}
      <p>${esc(FRAGLICH)} ${ui.marke('belegt', ['johnson2005', 'huang2012'])}</p>
      ${aktiv ? `<a class="knopf zweit voll" href="#${BASIS}/antworten">Antworten in Ruhe ansehen</a>` : ''}</div>` : ''}
    ${kern.einst().alter === 'u16' ? '<p class="hinweis gelb klein">Mit unter 16 ist Persönlichkeit noch stark in Bewegung. Nimm dein Muster als Momentaufnahme.</p>' : ''}
    <section class="karte weich bf-kurz" aria-labelledby="bf-kurz-h"><h3 id="bf-kurz-h">Kurz gesagt</h3>${kurzHtml(L)}
      <p class="klein leise">Das kommt nur aus deinen eigenen Antworten – ohne Vergleich mit anderen Menschen.</p></section>
    ${BEREICHE.map((B) => bereichHtml(B, e, L, aktiv)).join('')}
    ${brauchtHilfe(e, aktiv ? d.antworten : {}) ? ui.hilfeKarte({ titel: 'Falls es dir gerade schwer geht', text: 'Einige Antworten klingen nach viel Belastung. Das ist keine Diagnose. Wenn du magst, sprich mit jemandem. Die TelefonSeelsorge ist kostenlos, anonym und rund um die Uhr da.' }) : ''}
    <div class="stapel bf-aktionen">
      <a class="knopf haupt voll" href="#${BASIS}/antworten">Deine Antworten ansehen und ändern</a>
      <a class="knopf zweit voll" href="#muster">Dein ganzes Muster mit allen Ästen</a>
      ${aktiv && offen && rest ? `<a class="knopf zweit voll" href="#${BASIS}/vertiefung?bereich=alle">Alle Bereiche genauer · ${rest} Sätze, ca. ${Math.max(1, Math.round(rest * 6 / 60))} Min.</a>` : ''}
      ${sp.einwilligung() ? '' : '<button type="button" class="knopf zweit voll" data-aktion="merken">Auf diesem Gerät merken</button>'}
      <a class="knopf zweit voll" href="#passt">Was passt zu mir</a>
      <button type="button" class="knopf zweit voll" data-bf="neu">Noch einmal ganz neu ausfüllen</button>
      <a class="link" href="#${BASIS}/methode">Woher die Sätze kommen und wie das Muster entsteht</a>
    </div>
    <p class="klein leise">Kein Typ, keine Diagnose, keine Festlegung. Persönlichkeit verändert sich über die Jahre und durch Begleitung, etwa Therapie oder Training. ${ui.marke('belegt', ['roberts2017'])}</p>
    ${ui.fuss()}`;
  const zu = ctx.param.zu; if (zu) { const z = el.querySelector('#bf-' + CSS.escape(zu)); if (z) requestAnimationFrame(() => { try { z.scrollIntoView({ block: 'start' }); } catch {} }); }
  const klick = async (ev) => {
    const n = ev.target.closest('[data-bf=neu]');
    if (n && await ui.bestaetige({ titel: 'Noch einmal ganz neu ausfüllen?', text: 'Dein jetziges Muster bleibt im Verlauf. Du beantwortest die 30 Sätze neu; deine bisherigen Antworten bleiben als „vorher“ sichtbar.', ja: 'Neu beginnen' })) { neuerLauf(); kern.geh(BASIS + '/start'); }
  };
  el.addEventListener('click', klick);
  return () => el.removeEventListener('click', klick);
}

// ---------- Deine Antworten: ansehen und ändern ----------
function antwortenSeite(ctx) {
  const { el } = ctx; ctx.zurueckZu(BASIS); ctx.titel('Deine Antworten');
  const zeileHtml = (x) => {
    const stand = x.wert != null ? 'Deine Antwort: ' + x.anzeige : x.uebersprungen ? 'übersprungen' : 'noch offen';
    const vor = x.vorher.length ? ` · vorher: ${x.vorher[0].anzeige}` : '';
    return `<li><button type="button" class="zeile bf-antw" data-bf-frage="${esc(x.id)}" aria-haspopup="dialog"><span><b>${esc(x.frage)}</b><small>${esc(stand + vor)}</small></span><span class="rechts">ändern${ui.sym('weiter')}</span></button></li>`;
  };
  const male = () => {
    const alle = antwortListe(kern), L = lagen(sp.ergebnis(M), daten());
    const jetzt = L ? `<section class="karte weich bf-jetzt" aria-labelledby="bf-jetzt-h"><h3 id="bf-jetzt-h">Dein Muster jetzt</h3>
        <ul class="bf-jetzt-liste" id="bf-jetzt-liste">${BEREICHE.map((B) => `<li><b>${esc(titelVon(B.id))}:</b> ${L.bereiche[B.id] ? esc(wortAus(B.id, L.bereiche[B.id])) : '<span class="leise">noch offen</span>'}</li>`).join('')}</ul>
        <a class="link" href="#${BASIS}">Ganzes Muster ansehen</a></section>` : '';
    el.innerHTML = `<h2>Deine Antworten</h2>
      <p class="lead">Tippe einen Satz an, um deine Antwort zu ändern. Dein Muster rechnet sofort neu.</p>
      ${jetzt}
      <nav class="chips bf-sprung" aria-label="Zu einem Bereich springen">${BEREICHE.map((B) => `<a class="chip" href="#${BASIS}/antworten?bereich=${B.id}" data-bf-sprung="${B.id}">${esc(titelVon(B.id))}</a>`).join('')}</nav>
      ${BEREICHE.map((B) => { const xs = alle.filter((x) => x.bereich === B.id); return `<section class="bf-antw-gruppe" id="bf-a-${B.id}" aria-labelledby="bf-ah-${B.id}"><h3 id="bf-ah-${B.id}">${esc(titelVon(B.id))}</h3><ul class="zeilen">${xs.map(zeileHtml).join('')}</ul></section>`; }).join('')}
      <p class="klein leise">Was du vorher geantwortet hast, merkt sich die App – höchstens fünf frühere Antworten je Satz, nur auf diesem Gerät.</p>
      <p class="mitte"><a class="link" href="#antworten">Alle Antworten der App an einem Ort</a></p>
      ${ui.fuss()}`;
  };
  male();
  const springe = (b) => { const z = el.querySelector('#bf-a-' + CSS.escape(b)); if (z) requestAnimationFrame(() => { try { z.scrollIntoView({ block: 'start' }); } catch {} }); };
  if (ctx.param.bereich) springe(ctx.param.bereich);
  let offenBlatt = false;
  const klick = async (ev) => {
    const s = ev.target.closest('[data-bf-sprung]');
    if (s) { ev.preventDefault(); springe(s.dataset.bfSprung); return; }
    const z = ev.target.closest('[data-bf-frage]'); if (!z || offenBlatt) return;
    const id = z.dataset.bfFrage, x = antwortListe(kern).find((y) => y.id === id); if (!x) return;
    offenBlatt = true;
    let w;
    try {
      w = await ui.blatt(`<p class="bf-satz"><b>${esc(zitat(x.frage))}</b></p>${x.hilfe ? `<p class="klein leise">${esc(x.hilfe)}</p>` : ''}
        <div class="antworten" role="radiogroup" aria-label="Deine Antwort">${x.optionen.map((o) => `<button type="button" class="antwort" role="radio" aria-checked="${x.wert === o.wert}" data-w="${o.wert}"${x.wert === o.wert ? ' autofocus' : ''}><span class="kreis" aria-hidden="true"></span><span>${esc(o.text)}</span></button>`).join('')}</div>
        ${x.wert != null ? '<button type="button" class="knopf zweit voll" data-w="weg">Antwort entfernen</button>' : ''}
        ${x.vorher.length ? `<p class="klein leise bf-vorher">Vorher: ${x.vorher.map((v) => `${esc(v.anzeige)} (${esc(ui.datum(v.zeit))})`).join(' · ')}</p>` : ''}`, { titel: 'Antwort ändern' });
    } finally { offenBlatt = false; }
    if (w == null) return;
    const neu = w === 'weg' ? null : Number(w);
    if (neu === x.wert) return;
    await antwortSetzen(kern, id, neu);
    male();
    const f = el.querySelector(`[data-bf-frage="${CSS.escape(id)}"]`); if (f) { try { f.focus({ preventScroll: false }); } catch {} }
    ui.meldung(neu == null ? 'Antwort entfernt – dein Muster ist neu berechnet.' : 'Geändert – dein Muster ist neu berechnet.');
  };
  el.addEventListener('click', klick);
  return () => el.removeEventListener('click', klick);
}

// ---------- Woher die Sätze kommen und wie das Muster entsteht ----------
function methode(ctx) {
  const { el } = ctx; ctx.zurueckZu(BASIS); ctx.titel('So entsteht dein Muster');
  el.innerHTML = `<h2>So entsteht dein Muster</h2>
    <h3>Die Sätze</h3>
    <p>Alle Sätze stammen aus dem <b>IPIP-NEO-120</b>, einem frei nutzbaren (gemeinfreien) Fragebogen zu den Big Five und ihren 30 Facetten. ${ui.marke('belegt', ['johnson2014', 'goldberg2006'])}</p>
    <p>Die deutschen Sätze sind eine <b>eigene, vorläufige Übersetzung</b>. Sie ist noch nicht mit Rück-Übersetzung und Testgruppe geprüft. ${ui.marke('abgeleitet', ['itc2018'])}</p>
    <p><b>Kurzform:</b> 30 Sätze, je Facette einer. <b>Genauer hinschauen:</b> die übrigen drei Sätze je Facette. Zwei Sätze über die Wahl von US-Parteien sind weggelassen – deshalb hat die Facette „Werte hinterfragen“ nur zwei Sätze.</p>
    <p>Etwa die Hälfte der Sätze zeigt zur jeweils anderen Seite (zum Beispiel „Ich bin lieber allein“ zu „Ruhe und Tiefe“). So zählt jede Zustimmung für die Seite, zu der der Satz gehört.</p>
    <h3>Wie die Richtung entsteht</h3>
    <p>Die App schaut nur auf <b>deine eigenen Antworten</b>: Hast du in einem Bereich vor allem den Sätzen der einen Seite zugestimmt, zeigt dein Muster <b>klar</b> dorthin. Neigst du nur etwas dorthin, heißt es <b>leicht</b>. Hast du oft „teils, teils“ gewählt oder zeigen deine Antworten in verschiedene Richtungen, heißt es: <b>beides gehört zu dir</b>.</p>
    <p>Es gibt keine Punkte, keine Prozente und keinen Vergleich mit anderen Menschen. Keine Seite ist besser – jede hat Stärken und Reibungen. ${ui.marke('belegt', ['nettle2006'])} Die Grenzen zwischen „klar“, „leicht“ und „beides“ hat die App selbst gewählt. ${ui.marke('idee')}</p>
    <p>Jeder Mensch zeigt im Alltag beide Seiten – mal mehr die eine, mal mehr die andere. Dein Muster beschreibt, was bei dir häufiger vorkommt, nicht, was du immer tust.</p>
    <h3>Antworten ändern</h3>
    <p>Unter „Deine Antworten“ kannst du jede Antwort jederzeit ändern oder entfernen. Das Muster rechnet sofort neu. Was du vorher geantwortet hattest, bleibt als „vorher“ sichtbar (höchstens fünf je Satz) – nur auf diesem Gerät.</p>
    <p><a class="knopf zweit voll" href="#${BASIS}/antworten">Deine Antworten ansehen</a></p>
    <h3>Wenn die Antworten eilig wirken</h3>
    <p>Die App schaut freundlich nach drei Dingen: sehr schnelle Antworten, sehr oft dieselbe Antwort hintereinander und Zustimmung zu fast allem. Dann bekommst du einen Hinweis, und die App sagt die Richtungen vorsichtiger. Dass solche Antworten ein Muster unsicherer machen, ist gut untersucht. ${ui.marke('belegt', ['johnson2005', 'huang2012'])}</p>
    <h3>Wann „Genauer hinschauen“ vorgeschlagen wird</h3>
    <p>Wenn deine Antworten in einem Bereich in verschiedene Richtungen zeigen oder wenn eine Richtung besonders deutlich ist – dann zeigen die Facetten, woher das kommt. Für diesen Vorschlag nutzt die App intern noch Vergleichstabellen zum Fragebogen; angezeigt wird kein Vergleich. ${ui.marke('abgeleitet', ['johnsonnormen'])}</p>
    <h3>Fachwörter</h3>
    <p class="klein"><b>Big Five:</b> die fünf großen Grundzüge der Persönlichkeit. <b>Facette:</b> ein Teilbereich, zum Beispiel „Geselligkeit“ bei Extraversion. <b>Neurotizismus:</b> so heißt in der Forschung die Seite „Feines Gespür“ beim Umgang mit Stress. <b>Gemeinfrei:</b> darf von allen frei genutzt werden.</p>
    <details class="karte weich"><summary>Alle ${FRAGEN.length} Sätze ansehen</summary>
      ${BEREICHE.map((B) => `<h4>${esc(titelVon(B.id))}</h4><ol class="klein bf-saetze">${FRAGEN.filter((q) => q.b === B.ipip).map((q) => { const P = FACETTEN_POLE[B.id][FACETTEN[B.id][q.f - 1][0]], zuErst = (q.k > 0) !== !!B.umgepolt; return `<li>${esc(q.t)} <span class="leise">(${esc(P[0])} – zählt für ${esc(zitat(zuErst ? P[1] : P[2]))}${q.start ? ', Kurzform' : ''})</span></li>`; }).join('')}</ol>`).join('')}
    </details>
    ${ui.fuss()}`;
}

// ---------- Registrierung ----------
export default {
  id: M,
  schema: 1,
  start() { ui.ladeStil(new URL('./stil.css', import.meta.url).href); },
  ansicht(ctx) {
    const teil = ctx.pfad[2];
    if (teil === 'start') return bogen(ctx, 'start');
    if (teil === 'vertiefung') return bogen(ctx, ctx.param.bereich || 'alle');
    if (teil === 'methode') return methode(ctx);
    if (teil === 'antworten') return antwortenSeite(ctx);
    const e = sp.ergebnis(M), d = daten();
    if (teil === 'ergebnis') return e ? ergebnis(ctx, e) : einstieg(ctx, null);
    // Übersicht: läuft ein neuer Durchgang, der noch nicht fertig ist → Einstieg; sonst das neueste Ergebnis.
    const laeuft = startBeantwortet(d.antworten) > 0 && !startFertig(d.antworten) && !(e && e.lauf && e.lauf === d.lauf);
    if (e && !laeuft) return ergebnis(ctx, e);
    if (!e && startFertig(d.antworten)) { const neu = speichereErgebnis(); if (neu) return ergebnis(ctx, neu); }
    return einstieg(ctx, e);
  }
};

// Für Tests (nur ?test=1): Fragen + Rechnung + Vertrag erreichbar, ohne Code anderer Module zu brauchen.
if (kern.TEST) window.__bigfive = { FRAGEN, NACH_ID, wertung, rechne, antwortListe, antwortSetzen, muster, aeste };
