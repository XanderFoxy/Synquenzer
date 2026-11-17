// M4 passt – Profil-Karte und „Was passt zu mir“. Vertrag: ARCH.md §2–§4. Routen:
//   #profil                      Profil-Karte (Bänder, Ehrlichkeit, Interessen, Rhythmus, Profil-Name nur wenn eindeutig, Bild sichern)
//   #passt                       Übersicht: Kurz gesagt, sechs Abschnitte, Treffer-Probe
//   #passt/<abschnitt>           staerken | arbeit | geeignet | selbst | andere
//   #passt/wachstum[/<id>]       Richtungen zum Wachsen, Wahl → Ergebnis passt.wachstum (liest M5 training)
// Liest Ergebnisse anderer Module NUR über kern.speicher (bigfive, interessen.*, textspiegel). Rechnung: regeln.js (ohne DOM).
import { kern } from '../../kern.js';
import { auswerten, ABSCHNITTE, FRAGEBOEGEN, profilNameText, entwicklung, uhrText, wortT } from './regeln.js';
import { BEREICHE, RIASEC, WACHSTUM, U16 } from './texte.js';

const ui = kern.ui, { esc, sym, marke } = ui;
const S = kern.speicher;
const ABSCHNITT = Object.fromEntries(ABSCHNITTE.map((a) => [a.id, a]));
const RICHTUNG = Object.fromEntries(WACHSTUM.richtungen.map((r) => [r.id, r]));

// ---------- Daten ----------
function lese() {
  const roh = {};
  for (const k of Object.keys(FRAGEBOEGEN)) roh[k] = S.ergebnis(k);
  const R = auswerten(roh, { alter: kern.einst().alter });
  return { roh, R, ts: S.ergebnis('textspiegel'), wahl: gueltigeWahl(S.ergebnis('passt.wachstum')) };
}
function gueltigeWahl(w) { return w && w.schema === 1 && RICHTUNG[w.id] ? w : null; }
const hatEtwas = (R) => !!(R.eingaben.bigfive || R.eingaben.riasec || R.eingaben.rhythmus || R.eingaben.ehrlichkeit);

// ---------- Bausteine ----------
const u16Html = (R) => R.u16 ? `<p class="hinweis">${esc(U16)}</p>` : '';
const merkHtml = () => S.einwilligung() ? '' :
  `<div class="hinweis gelb pa-merk"><p><b>Nur für jetzt:</b> Deine Ergebnisse sind nicht gemerkt und nach dem Schließen weg.</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
function weilHtml(a) { return a.sicher === 'alle' ? `<p class="pa-weil">Gilt für alle – unabhängig von deinem Profil.</p>` : `<p class="pa-weil">Weil: ${esc(a.weil)}</p>`; }
function aussageHtml(a, { ohneWeil = false } = {}) {
  return `<li class="pa-aussage">${a.titel ? `<p class="pa-titel">${esc(a.titel)}</p>` : ''}
    <p class="pa-text">${esc(a.text)} ${marke(a.stufe, a.quellen)}</p>
    ${a.kosten ? `<p class="pa-preis"><b>Preis:</b> ${esc(a.kosten.text)} ${marke(a.kosten.stufe, a.kosten.quellen)}</p>` : ''}
    ${ohneWeil ? '' : weilHtml(a)}</li>`;
}
function fehltHtml(R, nur = null) {
  const offen = R.eingaben.fehlt.filter((k) => !nur || nur.includes(k)), alt = R.eingaben.unbekannt.filter((k) => !nur || nur.includes(k));
  if (!offen.length && !alt.length) return '';
  const z = (k, t) => `<li><a class="zeile" href="#${esc(FRAGEBOEGEN[k].route)}"><span><b>${esc(FRAGEBOEGEN[k].titel)}</b><small>${esc(t)}</small></span><span class="rechts">${sym('weiter')}</span></a></li>`;
  return `<h3>Noch offen</h3><p class="klein leise">Je mehr du ausfüllst, desto mehr kann die App sagen. Ohne diese Teile bleiben Lücken – sie werden nicht geraten.</p>
    <ul class="zeilen">${offen.map((k) => z(k, 'noch nicht ausgefüllt')).join('')}${alt.map((k) => z(k, 'bitte noch einmal ausfüllen (ältere Fassung)')).join('')}</ul>`;
}
function leerHtml(titel) {
  return `<h2>${esc(titel)}</h2><div class="karte weich"><p><b>Noch keine Ergebnisse.</b> Hier steht, was zu dir passt, sobald du mindestens einen Fragebogen ausgefüllt hast. Am meisten sagt die Persönlichkeit (ca. 3 Minuten).</p>
    <a class="knopf haupt voll" href="#fragen/bigfive">Mit der Persönlichkeit anfangen</a><a class="knopf zweit voll" href="#fragen">Alle Fragebögen</a></div>${ui.fuss()}`;
}
const unsicherHtml = (liste) => liste.some((a) => a.sicher === 'eher' && /noch unsicher/.test(a.weil))
  ? `<p class="klein leise">„Noch unsicher“ heißt: Dein Bereich reicht noch ins Mittelfeld. Mit „Genauer hinschauen“ wird er schmaler. <a class="link" href="#fragen/bigfive">Zur Persönlichkeit</a></p>` : '';
const nichtHtml = (R, id) => `<div class="hinweis pa-nicht"><p><b>Was das nicht heißt:</b> ${esc(R.nicht[id])}</p></div>`;

// Radiogruppen: Pfeiltasten bewegen die Auswahl (ARIA-Muster)
function pfeile(e) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  const g = e.target.closest('[role=radiogroup]'); if (!g || !e.target.matches('[role=radio]')) return;
  const k = [...g.querySelectorAll('[role=radio]')], i = k.indexOf(e.target), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
  e.preventDefault(); const z = k[(i + d + k.length) % k.length]; z.click(); setTimeout(() => { const n = document.querySelector(`[data-fokus="${z.dataset.fokus}"]`); if (n) n.focus(); }, 0);
}
function fokusNach(el, key) { if (!key) return; const n = el.querySelector(`[data-fokus="${key}"]`); if (n) try { n.focus({ preventScroll: true }); } catch {} }

// Fragliche Antwort-Qualität im letzten Big-Five-Durchgang (Fach-Prüfung 17.11., F6): Bänder ja, Stärken/Kosten zu einem Pol nein
const FRAGLICH_HTML = `<p class="hinweis gelb klein">Deine Antworten im letzten Persönlichkeits-Fragebogen wirken fraglich (zum Beispiel sehr schnell). Darum leitet die App daraus keine Stärken und Kosten ab – nur die Bereiche sind zu sehen. <a class="link" href="#fragen/bigfive">In Ruhe noch einmal ausfüllen</a></p>`;
// ---------- Profil-Karte ----------
function profil(ctx) {
  const { el } = ctx;   // Titel im Kopf bleibt „Profil“ (Name der Leisten-Route)
  const male = () => {
    const { R, ts } = lese(), E = R.eingaben;
    if (!hatEtwas(R)) { el.innerHTML = leerHtml('Dein Profil'); return; }
    const b = E.bigfive, L = R.L;
    const baender = b ? BEREICHE.filter((B) => L[B.id]).map((B) => ui.band({ name: B.name, unten: Math.max(20, L[B.id].unten), oben: Math.min(80, L[B.id].oben), wort: wortT(L[B.id].stufe), links: B.links, rechts: B.rechts, grob: L[B.id].grob })).join('') : '';
    const h = L.ehrlichkeit;
    const ehr = h ? ui.band({ name: 'Ehrlichkeit-Bescheidenheit', unten: h.unten, oben: h.oben, min: 0, max: 100, mitte: [40, 60], wort: h.wort, links: 'eigener Vorteil zählt', rechts: 'fair und bescheiden',
      beschreibung: `Ehrlichkeit-Bescheidenheit: Bereich von ${Math.round(h.unten)} bis ${Math.round(h.oben)} von 100, ${h.wort}. Ohne Vergleichsgruppe.` }) : '';
    const r = E.riasec, y = E.rhythmus;
    const name = R.name.name;
    const verlauf = S.verlauf('bigfive').filter((x) => x && x.schema === 1 && x.skala === 'T');
    const ent = verlauf.length >= 2 ? entwicklung(verlauf[verlauf.length - 2], verlauf[verlauf.length - 1]) : [];
    el.innerHTML = `<h2>Dein Profil</h2>${u16Html(R)}
      <section class="karte pa-karte" aria-label="Profil-Karte">
        <p class="pa-kopf"><span>Wie ich ticke · Profil-Karte</span><span>${esc(ui.datum(new Date().toISOString()))}</span></p>
        ${b ? (name ? `<p class="pa-name">${esc(name)}</p><p class="klein leise">${esc(profilNameText(R.name))}</p>`
          : `<p class="pa-name pa-ohne">Kein Profil-Name</p><p class="klein leise">${esc(profilNameText(R.name))}</p>`) : ''}
        ${b ? `<h3>Fünf Grundzüge</h3><p class="klein leise">Vergleich: ${esc(b.vergleich || 'vorläufig')}${b.form === 'start' ? ' · Kurzform: gestrichelte Bereiche sind noch breit' : ''}</p>${R.fraglich ? FRAGLICH_HTML : ''}${baender}` : ''}
        ${ehr ? `<h3>Ehrlichkeit</h3>${ehr}` : ''}
        ${r ? `<h3>Interessen</h3><ol class="pa-top">${r.top.slice(0, 3).map((t) => `<li><b>${esc(RIASEC[t].name)}</b> <span class="leise">– ${esc(r.typen[t].wort || '')}</span></li>`).join('')}</ol>
          ${r.knapp && r.knapp.drittVierter && RIASEC[r.knapp.drittVierter] ? `<p class="klein leise">Knapp dahinter: ${esc(RIASEC[r.knapp.drittVierter].name)}.</p>` : ''}` : ''}
        ${y ? `<h3>Tagesrhythmus</h3><p><b>${esc(y.wort || '')}</b>${typeof y.schlafmitteKorr === 'number' ? ` · Schlafmitte an freien Tagen ≈ ${esc(uhrText(y.schlafmitteKorr))} Uhr` : ''}${y.fokus ? ` · Fokus etwa ${esc(uhrText(y.fokus.von))}–${esc(uhrText(y.fokus.bis))} Uhr` : ''} ${marke('abgeleitet', ['roenneberg2003'])}</p>` : ''}
        ${ts ? `<p class="klein leise">Text-Spiegel: ausgewertet${typeof ts.woerter === 'number' ? ` (${ts.woerter} Wörter)` : ''} – <a class="link" href="#text">ansehen</a></p>` : ''}
      </section>
      <div class="hinweis pa-nicht"><p><b>Was das nicht heißt:</b> kein Typ und keine Diagnose. Jede Messung hat Messfehler – darum Bereiche statt Punkte. Reicht ein Bereich ins graue Mittelfeld, ist die Lage noch nicht sicher.</p>
        <p class="klein">Profil-Namen sind eine Vereinfachung; feste Typen sind in der Forschung umstritten. ${marke('belegt', ['gerlach2018', 'freudenstein2019'])}</p></div>
      ${ent.length ? `<h3>Entwicklung seit ${esc(ui.datum(verlauf[verlauf.length - 2].zeit))}</h3><ul class="pa-ent">${ent.map((x) => `<li><b>${esc(x.name)}</b>: ${x.diff > 0 ? '+' : ''}${x.diff} ${x.deutlich ? '<span class="pa-deutlich">– deutlich</span>' : `<span class="leise">– im Messfehler (unter ±${x.grenze})</span>`}</li>`).join('')}</ul>
        <p class="klein leise">Nur Unterschiede, die größer sind als der Messfehler beider Messungen, heißen „deutlich“.</p>` : ''}
      <div class="stapel pa-aktionen"><a class="knopf haupt voll" href="#passt">${sym('passt')} Was passt zu mir</a>
        <button type="button" class="knopf zweit voll" data-pa="bild">${sym('sichern')} Als Bild sichern</button></div>
      ${fehltHtml(R)}${merkHtml()}${ui.fuss()}`;
  };
  male();
  const klick = (e) => { const k = e.target.closest('[data-pa=bild]'); if (k) { e.preventDefault(); bildBlatt(); } };
  el.addEventListener('click', klick);
  const aus = ['ergebnis', 'einwilligung', 'importiert', 'geloescht', 'einst'].map((n) => kern.on(n, () => { if (ctx.aktuell()) male(); }));
  return () => { el.removeEventListener('click', klick); aus.forEach((f) => f()); };
}

// Profil-Karte als Bild – nur lokal (Canvas), ohne Namen, Ehrlichkeit nur auf Wunsch.
async function bildBlatt() {
  const { R } = lese(); if (!hatEtwas(R)) return;
  const { bildErzeugen } = await import('./karte.js');
  let mitEhr = false, url = null, blob = null;
  const daten = () => ({
    name: R.name.name, datum: ui.datum(new Date().toISOString()),
    bereiche: BEREICHE.filter((B) => R.L[B.id]).map((B) => ({ name: B.name, unten: Math.max(20, R.L[B.id].unten), oben: Math.min(80, R.L[B.id].oben), wort: wortT(R.L[B.id].stufe), grob: R.L[B.id].grob })),
    ehrlichkeit: mitEhr && R.L.ehrlichkeit ? { unten: R.L.ehrlichkeit.unten, oben: R.L.ehrlichkeit.oben, wort: R.L.ehrlichkeit.wort } : null,
    interessen: R.eingaben.riasec ? R.eingaben.riasec.top.slice(0, 3).map((t) => RIASEC[t].name) : [],
    rhythmus: R.eingaben.rhythmus ? R.eingaben.rhythmus.wort : '',
    vergleich: R.eingaben.bigfive ? 'Vergleich vorläufig' : ''
  });
  const zeichne = async (d) => {
    blob = await bildErzeugen(daten());
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    const img = d.querySelector('.pa-bild img'); if (img) img.src = url;
  };
  await ui.blatt(`<div class="pa-bild"><img alt="Vorschau deiner Profil-Karte als Bild" width="1080" height="1350"></div>
    <p class="klein leise">Das Bild entsteht nur auf diesem Gerät. Es enthält keinen Namen von dir. Nichts wird hochgeladen – du entscheidest, ob und wo du es zeigst.</p>
    ${R.L.ehrlichkeit ? `<label class="schalter"><span>Ehrlichkeit mit aufs Bild</span><input type="checkbox" role="switch" data-pa="ehr"></label>` : ''}
    <div class="stapel"><button type="button" class="knopf haupt gross" data-pa="sichern">${sym('sichern')} Bild sichern</button><button type="button" class="knopf zweit" data-w="">Schließen</button></div>`,
  { titel: 'Profil-Karte als Bild', binde: (d) => {
    zeichne(d);
    d.addEventListener('change', (e) => { if (e.target.matches('[data-pa=ehr]')) { mitEhr = e.target.checked; zeichne(d); } });
    d.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-pa=sichern]')) return;
      if (!blob) await zeichne(d);
      const w = await ui.datei(`wie-ich-ticke-profil-${new Date().toISOString().slice(0, 10)}.png`, blob, 'image/png');
      if (w !== 'abgebrochen') ui.meldung('Bild gesichert – nur auf diesem Gerät.');
    });
  } });
  if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Was passt zu mir: Übersicht ----------
function uebersicht(ctx) {
  const { el } = ctx; ctx.titel('Was passt zu mir');
  let fokus = null;
  const male = () => {
    const { R } = lese();
    if (!hatEtwas(R)) { el.innerHTML = leerHtml('Was passt zu mir'); return; }
    const probe = S.lies('passt', 'probe', {}) || {};
    const V = R.vorhersagen, beantwortet = V.filter((v) => probe[v.bereich]), treffer = beantwortet.filter((v) => probe[v.bereich] === v.erwartet).length;
    el.innerHTML = `<h2>Was passt zu mir</h2>${u16Html(R)}${R.fraglich ? FRAGLICH_HTML : ''}
      <p class="lead">Aus deinen Ergebnissen abgeleitet. Jede Aussage trägt ihre Herkunft – tippe auf die Marke, dann siehst du die Quelle.</p>
      ${R.kurz.length ? `<section class="karte gruen"><h3>Kurz gesagt: deine Stärken</h3><ul class="pa-kurz">${R.kurz.map((a) => `<li>${esc(a.text)} ${marke(a.stufe, a.quellen)}<br><span class="pa-preis-kurz"><b>Preis:</b> ${esc(a.kosten.text)}</span></li>`).join('')}</ul></section>` : ''}
      ${R.mitte.length ? `<p class="klein leise">Nahe der Mitte: ${R.mitte.map((id) => esc(BEREICHE.find((B) => B.id === id).name)).join(', ')}. Dazu sagt die App bewusst nichts Bestimmtes – dort kommt es auf die Lage an. Das ist häufig und kein Mangel.</p>` : ''}
      <ul class="zeilen pa-abschnitte">${ABSCHNITTE.map((a) => { const n = a.id === 'wachstum' ? R.richtungen.alle.length : R.abschnitte[a.id].length;
        return `<li><a class="zeile" href="#passt/${a.id}"><span><b>${esc(a.titel)}</b><small>${esc(a.kurz)}</small></span><span class="rechts">${n ? `${n}<span class="sr"> Punkte</span>` : ''}${sym('weiter')}</span></a></li>`; }).join('')}</ul>
      ${V.length ? `<section class="karte pa-probe" aria-labelledby="pa-probe-t"><h3 id="pa-probe-t">Stimmt das? Die Treffer-Probe</h3>
        <p class="klein">Die App sagt vorher, was du eher wählst. Antworte ehrlich – dann siehst du, wie oft sie bei dir richtig liegt.</p>
        ${V.map((v, i) => { const w = probe[v.bereich]; return `<div class="pa-frage"><p id="pa-f${i}"><b>${esc(v.frage)}</b></p>
          <div class="chips" role="radiogroup" aria-labelledby="pa-f${i}">${['a', 'b'].map((x) => `<button type="button" class="chip" role="radio" aria-checked="${w === x}" tabindex="${(w ? w === x : x === 'a') ? 0 : -1}" data-probe="${v.bereich}" data-wahl="${x}" data-fokus="p-${v.bereich}-${x}">${esc(v[x])}</button>`).join('')}</div>
          ${w ? `<p class="pa-urteil ${w === v.erwartet ? 'pa-ja' : 'pa-nein'}">${w === v.erwartet ? `${sym('haken')} Passt zur Vorhersage.` : 'Passt nicht – hier liegt die App bei dir daneben. Das ist ein wichtiger Hinweis.'}<span class="leise klein"> Vorhersage aus: ${esc(v.weil)}</span></p>` : ''}</div>`; }).join('')}
        ${beantwortet.length ? `<p class="pa-summe" role="status"><b>Die App lag bei dir ${treffer} von ${beantwortet.length} Mal richtig.</b>${beantwortet.length === V.length && treffer < V.length ? ' Wo sie danebenliegt, vertrau eher dir als der App.' : ''}</p>` : ''}
        <p class="klein leise">Prüfbare Vorhersagen statt allgemeiner Sätze – gegen den Barnum-Effekt. ${marke('belegt', ['forer1949'])}</p></section>` : ''}
      ${fehltHtml(R)}${merkHtml()}${ui.fuss()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = (e) => {
    const c = e.target.closest('[data-probe]'); if (!c) return;
    const probe = { ...(S.lies('passt', 'probe', {}) || {}), [c.dataset.probe]: c.dataset.wahl };
    fokus = c.dataset.fokus; S.schreib('passt', 'probe', probe); male();
  };
  el.addEventListener('click', klick); el.addEventListener('keydown', pfeile);
  const aus = ['ergebnis', 'einwilligung', 'importiert', 'geloescht', 'einst'].map((n) => kern.on(n, () => { if (ctx.aktuell()) male(); }));
  return () => { el.removeEventListener('click', klick); el.removeEventListener('keydown', pfeile); aus.forEach((f) => f()); };
}

// ---------- Ein Abschnitt ----------
function abschnitt(ctx, id) {
  const { el } = ctx, A = ABSCHNITT[id]; ctx.titel(A.titel); ctx.zurueckZu('passt');
  const male = () => {
    const { R } = lese();
    if (!hatEtwas(R)) { el.innerHTML = leerHtml(A.titel); return; }
    const liste = R.abschnitte[id], i = ABSCHNITTE.findIndex((a) => a.id === id), naechster = ABSCHNITTE[i + 1];
    const brauchtBF = id !== 'geeignet' && !R.eingaben.bigfive;
    let leer = '';
    if (!liste.length || (brauchtBF && liste.every((a) => a.sicher === 'alle'))) {
      leer = brauchtBF || (id === 'geeignet' && !R.eingaben.riasec && !R.eingaben.bigfive)
        ? `<div class="karte weich"><p>Dafür braucht die App deine ${id === 'geeignet' ? 'Interessen oder deine ' : ''}Persönlichkeit.</p><a class="knopf haupt voll" href="#${id === 'geeignet' ? 'fragen/interessen/riasec' : 'fragen/bigfive'}">${id === 'geeignet' ? 'Interessen ausfüllen' : 'Persönlichkeit ausfüllen'}</a></div>`
        : `<div class="karte weich"><p>Deine Bereiche liegen nahe der Mitte. Dazu sagt die App bewusst nichts Bestimmtes – sonst wären es Sätze, die auf fast alle passen.</p><p class="klein leise">Genauere Fragen können zeigen, ob einzelne Facetten herausragen.</p><a class="knopf zweit voll" href="#fragen/bigfive">Genauer hinschauen</a></div>`;
    }
    const formate = id === 'geeignet' && liste.some((a) => a.titel === 'Format-Idee');
    el.innerHTML = `<h2>${esc(A.titel)}</h2>${u16Html(R)}
      ${id === 'staerken' ? '<p class="lead">Jede Stärke hat einen Preis – zwei Seiten derselben Eigenart.</p>' : ''}
      ${leer}${liste.length ? `<ul class="pa-liste">${liste.map((a) => aussageHtml(a)).join('')}</ul>` : ''}
      ${formate ? `<p class="klein leise">${esc('Ob passende Formate mehr Reichweite bringen, ist nicht erforscht. Probier es aus und vergleich mit deiner eigenen Statistik.')} ${marke('idee')}</p>` : ''}
      ${id === 'selbst' ? `<a class="karte" href="#training">${sym('training')}<span><b>Training</b><br><span class="klein leise">Kleine Übungen für Schlaf, Bewegung, Ruhe und Fokus</span></span><span class="rechts">${sym('weiter')}</span></a>` : ''}
      ${unsicherHtml(liste)}${nichtHtml(R, id)}
      ${fehltHtml(R, id === 'geeignet' ? ['interessen.riasec', 'bigfive'] : id === 'arbeit' || id === 'selbst' ? ['bigfive', 'interessen.rhythmus'] : ['bigfive'])}
      ${naechster ? `<a class="knopf zweit voll" href="#passt/${naechster.id}">Weiter: ${esc(naechster.titel)} ${sym('weiter')}</a>` : ''}
      ${merkHtml()}${ui.fuss()}`;
  };
  male();
  const aus = ['ergebnis', 'einwilligung', 'importiert', 'geloescht', 'einst'].map((n) => kern.on(n, () => { if (ctx.aktuell()) male(); }));
  return () => aus.forEach((f) => f());
}

// ---------- Wachstum ----------
function wachstum(ctx) {
  const { el } = ctx; ctx.titel('Wachsen'); ctx.zurueckZu('passt');
  const male = () => {
    const { R, wahl } = lese(), W = R.richtungen;
    const zeile = (r) => `<li><a class="zeile" href="#passt/wachstum/${r.id}"><span><b>${esc(r.titel)}</b><small>${esc(r.wofuer)}${r.weil ? ` · <span class="pa-bei">bei dir: ${esc(r.weil)}</span>` : ''}</small></span><span class="rechts">${wahl && wahl.id === r.id ? `${sym('haken')}<span class="sr">gewählt</span>` : ''}${sym('weiter')}</span></a></li>`;
    const rest = W.alle.filter((r) => !W.nahe.includes(r));
    el.innerHTML = `<h2>Wachsen – wenn du willst</h2>${u16Html(R)}
      ${wahl ? wahlHtml(wahl) : ''}
      <ul class="pa-liste">${R.abschnitte.wachstum.map((a) => aussageHtml(a, { ohneWeil: true })).join('')}</ul>
      ${W.hatBF ? (W.nahe.length ? `<h3>Hier hast du am meisten Spielraum</h3><p class="klein leise">Aus deinen Ergebnissen – kein Muss. Jede Richtung hat auch einen Preis.</p><ul class="zeilen">${W.nahe.map(zeile).join('')}</ul>`
        : '<p class="klein leise">Aus deinen Ergebnissen sticht keine Richtung heraus. Alle stehen dir offen.</p>')
        : `<div class="karte weich"><p>Mit deiner Persönlichkeit (Big Five) sieht die App, wo du am meisten Spielraum hast.</p><a class="knopf zweit voll" href="#fragen/bigfive">Persönlichkeit ausfüllen</a></div>`}
      <h3>${W.nahe.length ? 'Weitere Richtungen' : 'Alle Richtungen'}</h3><ul class="zeilen">${rest.map(zeile).join('')}</ul>
      ${nichtHtml(R, 'wachstum')}${merkHtml()}${ui.fuss()}`;
  };
  male();
  const klick = async (e) => { if (e.target.closest('[data-pa=abwaehlen]')) { e.preventDefault(); await abwaehlen(); } };
  el.addEventListener('click', klick);
  const aus = ['ergebnis', 'einwilligung', 'importiert', 'geloescht', 'einst'].map((n) => kern.on(n, () => { if (ctx.aktuell()) male(); }));
  return () => { el.removeEventListener('click', klick); aus.forEach((f) => f()); };
}
function wahlHtml(w) {
  const r = RICHTUNG[w.id];
  return `<section class="karte akzent pa-wahl" aria-labelledby="pa-wahl-t"><h3 id="pa-wahl-t">Deine Richtung: ${esc(r.titel)}</h3>
    <p class="klein leise">Gewählt am ${esc(ui.datum(w.gewaehlt || w.zeit))}${w.warum ? ` · ${esc(w.warum)}` : ''}</p>
    <h4>Kleine Herausforderungen</h4><ol class="pa-aufgaben">${r.aufgaben.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
    <p class="klein">Eine am Tag oder in der Woche reicht. Wichtig ist, sie wirklich zu machen. ${marke('belegt', ['hudson2019'])}</p>
    <a class="knopf haupt voll" href="#training">${sym('training')} Im Training üben</a>
    <button type="button" class="knopf zweit voll" data-pa="abwaehlen">Wahl zurücknehmen</button></section>`;
}
async function abwaehlen() {
  if (await ui.bestaetige({ titel: 'Wahl zurücknehmen?', text: 'Die gewählte Richtung wird gelöscht. Du kannst jederzeit eine neue wählen.', ja: 'Zurücknehmen' })) {
    S.loescheErgebnis('passt.wachstum'); ui.meldung('Wahl zurückgenommen.');
  }
}

function richtung(ctx, id) {
  const { el } = ctx, r0 = RICHTUNG[id]; ctx.titel(r0.titel); ctx.zurueckZu('passt/wachstum');
  let warum = null, fokus = null;
  const male = () => {
    const { R, wahl } = lese();
    const r = R.richtungen.alle.find((x) => x.id === id) || r0, aktiv = wahl && wahl.id === id;
    if (aktiv && warum === null) warum = wahl.warumId || null;
    el.innerHTML = `<h2>${esc(r.titel)}</h2>${u16Html(R)}
      <p class="lead">${esc(r.wofuer)}</p>
      ${r.weil ? `<p class="pa-weil">Bei dir: ${esc(r.weil)}</p>` : ''}
      ${r.beleg ? `<ul class="pa-liste">${aussageHtml({ ...r.beleg, quellen: r.beleg.quellen || [], sicher: 'alle' }, { ohneWeil: true })}</ul>` : ''}
      <p class="pa-preis"><b>Preis:</b> ${esc(r.preis)} ${marke('idee')}</p>
      <h3>Kleine Herausforderungen</h3>
      <p class="klein leise">Zum Ausprobieren, nach dem Muster einer Studie mit wöchentlichen kleinen Herausforderungen. ${marke('abgeleitet', ['hudson2019'])}</p>
      <ol class="pa-aufgaben">${r.aufgaben.map((t) => `<li>${esc(t)} ${marke('idee')}</li>`).join('')}</ol>
      ${aktiv ? `<div class="hinweis"><p>${sym('haken')} <b>Das ist deine gewählte Richtung.</b></p></div>` : ''}
      <h3 id="pa-warum-t">Warum möchtest du das? <span class="leise klein">(freiwillig)</span></h3>
      <div class="chips" role="radiogroup" aria-labelledby="pa-warum-t">${WACHSTUM.warum.map(([w, t], i) => `<button type="button" class="chip" role="radio" aria-checked="${warum === w}" tabindex="${(warum ? warum === w : i === 0) ? 0 : -1}" data-warum="${w}" data-fokus="w-${w}">${esc(t)}</button>`).join('')}</div>
      <button type="button" class="knopf haupt gross voll" data-pa="waehlen">${aktiv ? 'Richtung behalten' : 'Diese Richtung wählen'}</button>
      ${aktiv ? '<button type="button" class="knopf zweit voll" data-pa="abwaehlen">Wahl zurücknehmen</button>' : ''}
      <p class="klein leise">Die Wahl bleibt auf diesem Gerät. Das Training schlägt dir dazu kleine Schritte vor. Du kannst sie jederzeit ändern.</p>
      ${nichtHtml(R, 'wachstum')}${merkHtml()}${ui.fuss()}`;
    fokusNach(el, fokus); fokus = null;
  };
  male();
  const klick = async (e) => {
    const c = e.target.closest('[data-warum]');
    if (c) { warum = warum === c.dataset.warum ? null : c.dataset.warum; fokus = c.dataset.fokus; male(); return; }
    if (e.target.closest('[data-pa=abwaehlen]')) { e.preventDefault(); await abwaehlen(); return; }
    if (e.target.closest('[data-pa=waehlen]')) {
      const t = WACHSTUM.warum.find(([w]) => w === warum);
      S.setzeErgebnis('passt.wachstum', { schema: 1, id, richtung: r0.richtung, ziel: r0.ziel, titel: r0.titel, warum: t ? t[1] : null, warumId: t ? t[0] : null,
        gewaehlt: new Date().toISOString(), aufgaben: r0.aufgaben, quellen: ['hudson2015', 'hudson2019'] });
      ui.meldung('Gewählt – im Training findest du kleine Schritte dazu.');
      kern.geh('passt/wachstum');
    }
  };
  el.addEventListener('click', klick); el.addEventListener('keydown', pfeile);
  const aus = ['ergebnis', 'einwilligung', 'importiert', 'geloescht', 'einst'].map((n) => kern.on(n, () => { if (ctx.aktuell()) male(); }));
  return () => { el.removeEventListener('click', klick); el.removeEventListener('keydown', pfeile); aus.forEach((f) => f()); };
}

export default {
  id: 'passt',
  schema: 1,
  start() { ui.ladeStil(new URL('./stil.css', import.meta.url).href); },
  ansicht(ctx) {
    const [top, unter, dritt] = ctx.pfad;
    if (top === 'profil') { if (unter) { kern.geh('profil', { ersetzen: true }); return; } return profil(ctx); }
    if (!unter) return uebersicht(ctx);
    if (unter === 'wachstum') {
      if (!dritt) return wachstum(ctx);
      if (RICHTUNG[dritt]) return richtung(ctx, dritt);
      kern.geh('passt/wachstum', { ersetzen: true }); return;
    }
    if (ABSCHNITT[unter] && !dritt) return abschnitt(ctx, unter);
    kern.geh('passt', { ersetzen: true });
  }
};
