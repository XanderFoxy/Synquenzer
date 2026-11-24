// M1 bigfive – Big Five aus dem IPIP-NEO-120 (gemeinfrei): Startform 30 Fragen (eine je Facette, ca. 3 Min.), adaptive Vertiefung
// je Bereich (die übrigen 18 Fragen → 6 Facetten), Ergebnis als Band mit vorläufigen Vergleichswerten, Antwort-Qualität.
// Vertrag: ARCH.md §2–§4. Routen: fragen/bigfive (Übersicht/Ergebnis), …/start, …/vertiefung?bereich=, …/ergebnis, …/methode.
import { kern } from '../../kern.js';
import { FRAGEN, NACH_ID, BEREICHE, BEREICH, FACETTEN, NORMEN, startFragen, vertiefungsFragen } from './daten.js';
import { wertung, startFertig, startBeantwortet, GRUPPEN, GRENZEN } from './rechnen.js';
import { TEXTE, MITTE, UNKLAR, FRAGLICH, GRUENDE, QUALITAET } from './texte.js';

const M = 'bigfive';
const sp = kern.speicher;
const ui = kern.ui;
const { esc } = ui;
const BASIS = 'fragen/bigfive';
const zahl = (x, n = 0) => Number(x).toLocaleString('de-DE', { maximumFractionDigits: n });

// ---------- Modul-Daten ----------
function daten() {
  return { antworten: sp.lies(M, 'antworten', {}), zeiten: sp.lies(M, 'zeiten', {}), lauf: sp.lies(M, 'lauf', null), gruppe: sp.lies(M, 'gruppe', null) };
}
function gruppe() {
  const g = sp.lies(M, 'gruppe', null); if (g && GRUPPEN[g]) return g;
  const a = kern.einst().alter; return a === 'u16' || a === '16-17' ? 'u21' : 'alle';
}
function reihe() { return [...startFragen(), ...vertiefungsFragen('alle')].map((q) => q.id); }
function rechne(d = daten()) { return wertung(d.antworten, { gruppe: gruppe(), zeiten: d.zeiten, lauf: d.lauf, reihe: reihe() }); }
function speichereErgebnis() {
  const d = daten(); if (!startFertig(d.antworten)) return null;
  const res = rechne(d), alt = sp.ergebnis(M);
  return sp.setzeErgebnis(M, res, { ersetzen: !!(alt && d.lauf && alt.lauf === d.lauf) });
}
function neuerLauf() { sp.schreib(M, 'antworten', {}); sp.schreib(M, 'zeiten', {}); sp.schreib(M, 'lauf', new Date().toISOString()); }
const gehoertZu = (e, d) => !!(e && d.lauf && e.lauf === d.lauf && startFertig(d.antworten));

// ---------- Fragebogen (Start oder Vertiefung) ----------
function bogen(ctx, teil) {
  const { el } = ctx;
  const d = daten();
  const bereich = teil === 'start' ? null : teil;
  ctx.zurueckZu((!bereich && kern.weg && kern.weg.nachBogen()) || BASIS);   // Start-Fragebogen läuft → Kopf-Pfeil zu #los (Prüfung T10)
  if (bereich && !(bereich === 'alle' || BEREICH[bereich])) { kern.geh(BASIS, { ersetzen: true }); return; }
  if (bereich && !startFertig(d.antworten)) {
    ctx.titel('Genauer hinschauen');
    el.innerHTML = `<h2>Erst die Kurzform</h2><p>Für die Vertiefung brauche ich deine Antworten aus der Kurzform. Sie sind auf diesem Gerät nicht mehr da – zum Beispiel, weil sie nicht gemerkt wurden.</p>
      <a class="knopf haupt voll" href="#${BASIS}/start">Kurzform ausfüllen (ca. 3 Min.)</a>${ui.fuss()}`;
    return;
  }
  if (!d.lauf) sp.schreib(M, 'lauf', new Date().toISOString());
  const qs = bereich ? vertiefungsFragen(bereich) : startFragen();
  const name = bereich ? (bereich === 'alle' ? 'Alle Bereiche genauer' : BEREICH[bereich].name + ' genauer') : 'Persönlichkeit';
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
      if (weg) { kern.geh(weg, { ersetzen: true }); if (e) ui.meldung('Teil 1 geschafft – weiter geht’s.'); return; }
      kern.geh(BASIS + (bereich && bereich !== 'alle' ? '?zu=' + bereich : ''), { ersetzen: true });
      if (e) ui.meldung(bereich ? 'Fertig – dein Ergebnis ist jetzt genauer.' : 'Fertig – hier ist dein Ergebnis.');
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
    <p class="lead">Fünf große Grundzüge, die in der Forschung am besten belegt sind: Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit und emotionale Stabilität. ${ui.marke('belegt', ['goldberg2006', 'soto2019'])}</p>
    <ul class="bf-liste">
      <li><b>30 kurze Sätze</b>, etwa 3 Minuten. Du sagst jeweils, wie sehr er auf dich zutrifft.</li>
      <li>Danach kannst du einzelne Bereiche <b>genauer anschauen</b> – die App schlägt vor, wo es sich lohnt.</li>
      <li>Ergebnis als <b>Bereich</b>, nicht als genaue Zahl – jede Messung hat einen Messfehler.</li>
    </ul>
    <p class="hinweis klein">Beschreib dich so, wie du <b>jetzt meistens</b> bist – nicht so, wie du gern wärst. Es gibt kein Richtig oder Falsch. Du kannst Fragen überspringen.</p>
    ${u16 ? '<p class="hinweis gelb klein">Mit unter 16 ist Persönlichkeit noch stark in Bewegung. Nimm das Ergebnis als Momentaufnahme.</p>' : ''}
    ${laeuft ? `${ui.fortschritt(n / 30, 'Kurzform beantwortet')}<p class="leise klein">${n} von 30 beantwortet.</p>
      <a class="knopf haupt gross voll" href="#${BASIS}/start">Weitermachen</a>
      <button type="button" class="knopf zweit voll" data-bf="neu">Von vorn beginnen</button>`
    : `<a class="knopf haupt gross voll" href="#${BASIS}/start">Los geht’s</a>`}
    ${e ? `<p class="mitte"><a class="link" href="#${BASIS}/ergebnis">Letztes Ergebnis ansehen (${esc(ui.datum(e.zeit))})</a></p>` : ''}
    <p class="leise klein">${ui.sym('schloss')} ${sp.einwilligung() ? 'Deine Antworten bleiben auf diesem Gerät.' : 'Deine Antworten bleiben nur bis zum Schließen in diesem Fenster. Nichts wird gesendet.'}</p>
    <p class="mitte"><a class="link" href="#${BASIS}/methode">Woher die Fragen kommen und wie gerechnet wird</a></p>
    ${ui.fuss()}`;
  const klick = async (ev) => {
    const b = ev.target.closest('[data-bf=neu]'); if (!b) return;
    if (await ui.bestaetige({ titel: 'Von vorn beginnen?', text: 'Deine bisherigen Antworten in diesem Durchgang werden gelöscht.', ja: 'Von vorn' })) { neuerLauf(); kern.geh(BASIS + '/start'); }
  };
  el.addEventListener('click', klick);
  return () => el.removeEventListener('click', klick);
}

// ---------- Ergebnis ----------
const lage = (b) => (b.klar > 0 || b.stufe >= 1 ? 'hoch' : b.klar < 0 || b.stufe <= -1 ? 'niedrig' : 'mitte');
function bandHtml(name, b, B, klein = false) {
  const pr = `Von 100 Menschen der Vergleichsgruppe liegen etwa ${b.pr[0]} bis ${b.pr[1]} darunter.`;
  return ui.band({ name, unten: b.unten, oben: b.oben, wort: b.wort, links: klein ? '' : B.links, rechts: klein ? '' : B.rechts, grob: !!b.grob,
    beschreibung: `${name}: ${b.wort}. Bereich ${zahl(b.unten)} bis ${zahl(b.oben)} auf einer Skala von 20 bis 80, Mitte 50. ${pr}` });
}
function brauchtHilfe(e, a) {
  const s = e.bereiche.stabilitaet;
  return (s && s.oben < 45) || [11, 41, 71, 86].some((n) => a['bf' + n] >= 4) || a.bf101 === 1;
}
function bereichHtml(B, e, mitAktion) {
  const b = e.bereiche[B.id], T = TEXTE[B.id];
  if (!b) return `<section class="karte bf-bereich" id="bf-${B.id}"><h3>${esc(B.name)}</h3><p class="leise">Zu wenige Antworten für diesen Bereich.</p></section>`;
  const fraglich = !!(e.qualitaet && e.qualitaet.fraglich);   // Prüfung 17.11. (F6): bei fraglicher Qualität keine Stärken/Kosten zu einem Pol
  const l = fraglich ? 'mitte' : lage(b), t = T[l];
  const grund = e.vertiefung && e.vertiefung.gruende && e.vertiefung.gruende[B.id];
  const fac = FACETTEN[B.id].map(([fid, fname, fkurz]) => [fid, fname, fkurz, e.facetten && e.facetten[B.id + '.' + fid]]).filter((x) => x[3]);
  let facHtml = '';
  if (fac.length) {
    const sort = [...fac].sort((x, y) => y[3].wert - x[3].wert), hoch = sort[0], tief = sort[sort.length - 1];
    facHtml = `<details class="bf-facetten" ${location.hash.includes('zu=' + B.id) ? 'open' : ''}><summary>Die 6 Facetten</summary>
      <p class="klein leise">Je Facette 4 Fragen – deshalb grob (gestrichelt). Am höchsten: <b>${esc(hoch[1])}</b>, am niedrigsten: <b>${esc(tief[1])}</b>. ${ui.marke('abgeleitet', ['johnson2014'])}</p>
      ${fac.map(([fid, fname, fkurz, fb]) => `<div class="bf-facette">${bandHtml(fname, fb, B, true)}<p class="klein leise">${esc(fkurz)}${fid === 'liberalitaet' ? ' · nur 2 Fragen, sehr grob' : ''}</p></div>`).join('')}
    </details>`;
  }
  const vertieft = b.form === 'vertieft';
  return `<section class="karte bf-bereich" id="bf-${B.id}" aria-labelledby="bf-h-${B.id}">
    <h3 id="bf-h-${B.id}">${esc(B.name)}</h3>
    <p class="klein leise">${esc(T.was)}</p>
    ${bandHtml(B.name, b, B)}
    <p class="klein bf-pr">Von 100 Menschen der Vergleichsgruppe liegen etwa <b>${b.pr[0]} bis ${b.pr[1]}</b> darunter. ${ui.marke('abgeleitet', ['johnson2014', 'johnsonnormen'])}</p>
    ${fraglich
      ? `<p class="aussage">${esc(FRAGLICH)} ${ui.marke('abgeleitet', ['johnson2005'])}</p>`
      : l === 'mitte'
      ? `<p class="aussage">${esc(MITTE + (b.oben - b.unten > 24 ? ' ' + UNKLAR : ''))} ${ui.marke('abgeleitet', ['johnson2014'])}</p>`
      : ui.aussage({ html: true, text: (b.klar ? '' : '<span class="leise">Eher so – der Bereich ist noch breit:</span> ') + esc(t.staerke), stufe: l === 'niedrig' ? 'idee' : 'abgeleitet', quellen: l === 'niedrig' ? [] : ['johnson2014'],
          kosten: esc(t.kosten) + ' ' + ui.marke(t.kostenStufe || 'idee', t.kostenStufe ? ['johnson2014'] : []) })}
    ${ui.aussage({ text: T.belegt.text, stufe: 'belegt', quellen: T.belegt.quellen })}
    <p class="klein leise"><b>Was das nicht heißt:</b> ${esc(fraglich ? 'Ein Ergebnis aus fraglichen Antworten ist kein Urteil über dich.' : l === 'mitte' ? 'Mitte heißt nicht „langweilig“ oder „nichts Besonderes“.' : T.nicht[l])}</p>
    ${facHtml}
    ${mitAktion && !vertieft ? (grund
      ? `<div class="hinweis bf-angebot"><p class="klein">${esc(GRUENDE[grund])}</p><a class="knopf haupt klein" href="#${BASIS}/vertiefung?bereich=${B.id}">Genauer hinschauen · 18 Fragen</a></div>`
      : `<p><a class="knopf zweit klein" href="#${BASIS}/vertiefung?bereich=${B.id}">Genauer hinschauen · 18 Fragen</a></p>`) : ''}
  </section>`;
}
function ergebnis(ctx, e) {
  const { el } = ctx; ctx.zurueckZu('fragen'); ctx.titel('Persönlichkeit');
  if (!e || e.schema !== 1 || !e.bereiche) {
    el.innerHTML = `<h2>Bitte noch einmal ausfüllen</h2><p>Dieses Ergebnis stammt aus einer anderen Fassung der App.</p><a class="knopf haupt voll" href="#${BASIS}/start">Kurzform ausfüllen</a>${ui.fuss()}`;
    return;
  }
  const d = daten(), aktiv = gehoertZu(e, d);
  const klarHoch = BEREICHE.filter((B) => e.bereiche[B.id] && e.bereiche[B.id].klar > 0).map((B) => B.name);
  const klarTief = BEREICHE.filter((B) => e.bereiche[B.id] && e.bereiche[B.id].klar < 0).map((B) => B.name);
  const q = e.qualitaet || {};
  const qText = [q.schnell && QUALITAET.schnell(q.medianMs), q.gleich && QUALITAET.gleich(q.laengsterLauf), q.jaSager && QUALITAET.jaSager(), q.neinSager && QUALITAET.neinSager()].filter(Boolean);
  const offen = BEREICHE.filter((B) => e.bereiche[B.id] && e.bereiche[B.id].form !== 'vertieft').length;
  el.innerHTML = `<h2>Deine Persönlichkeit</h2>
    <p class="leise klein">Big Five · ${esc(ui.datum(e.zeit))} · ${e.form === 'vertieft' ? 'teilweise vertieft' : 'Kurzform'} · ${e.beantwortet || ''} Antworten</p>
    ${qText.length ? `<div class="karte gelb bf-qualitaet" role="note"><h3>Hier lohnt ein genauerer Blick</h3>${qText.map((t) => `<p>${esc(t)}</p>`).join('')}
      <p>Die Bereiche sind deshalb breiter. Das ist okay – nur ist das Ergebnis dann unsicherer. ${ui.marke('belegt', ['johnson2005', 'huang2012'])}</p>
      <p>Darum zeigt die App diesmal keine Stärken und Kosten zu einzelnen Bereichen, nur die Balken. ${ui.marke('abgeleitet', ['johnson2005'])}</p>
      ${aktiv ? '<button type="button" class="knopf zweit voll" data-bf="neu">Noch einmal in Ruhe ausfüllen</button>' : ''}</div>` : ''}
    ${kern.einst().alter === 'u16' ? '<p class="hinweis gelb klein">Mit unter 16 ist Persönlichkeit noch stark in Bewegung, und die Vergleichswerte passen nur grob. Nimm das als Momentaufnahme.</p>' : ''}
    <section class="karte weich bf-kurz" aria-labelledby="bf-kurz-h"><h3 id="bf-kurz-h">Kurz gesagt</h3>
      ${klarHoch.length || klarTief.length
        ? `${klarHoch.length ? `<p>Klar <b>höher</b> als die meisten: ${esc(klarHoch.join(', '))}.</p>` : ''}${klarTief.length ? `<p>Klar <b>niedriger</b> als die meisten: ${esc(klarTief.join(', '))}.</p>` : ''}<p class="klein leise">„Klar“ heißt: der ganze Bereich liegt außerhalb des Mittelfelds. Alles andere ist Mittelfeld oder noch unsicher. ${ui.marke('abgeleitet', ['johnson2014', 'johnsonnormen'])}</p>`
        : `<p>Bei keinem der fünf Bereiche liegt der ganze Bereich klar außerhalb der Mitte. Das ist häufig – besonders bei der Kurzform. ${ui.marke('abgeleitet', ['johnson2014', 'johnsonnormen'])}</p>`}
    </section>
    <p class="klein leise bf-lesehilfe">Verglichen mit: <b>${esc(GRUPPEN[e.gruppe] || GRUPPEN.alle)}</b> – vorläufig ${aktiv ? '<button type="button" class="link" data-bf="zum-vergleich">ändern</button>' : ''}<br>Der farbige Bereich zeigt, wo dein Wert mit großer Wahrscheinlichkeit (95 %) liegt. Grau in der Mitte: das Mittelfeld. Gestrichelt: noch grob.</p>
    ${BEREICHE.map((B) => bereichHtml(B, e, aktiv)).join('')}
    <section class="karte weich bf-vergleich" id="bf-vergleich" aria-labelledby="bf-v-h"><h3 id="bf-v-h">Womit verglichen wird</h3>
      <p class="klein">Vergleichsgruppe: <b>${esc(GRUPPEN[e.gruppe] || GRUPPEN.alle)}</b>, Frauen und Männer gemischt, aus einer großen englischsprachigen Online-Stichprobe. <b>Vorläufig:</b> eigene deutsche Übersetzung, deutsche Vergleichswerte gibt es noch nicht. ${ui.marke('abgeleitet', ['johnsonnormen', 'johnson2014'])}</p>
      ${aktiv ? `<p class="klein leise" id="bf-g-t">Vergleichsgruppe wählen (nach Alter):</p><div class="chips" role="radiogroup" aria-labelledby="bf-g-t">${Object.entries(GRUPPEN).map(([g, t]) => `<button type="button" class="chip" role="radio" aria-checked="${e.gruppe === g}" data-gruppe="${g}">${esc(t)}</button>`).join('')}</div>` : ''}
    </section>
    ${brauchtHilfe(e, aktiv ? d.antworten : {}) ? ui.hilfeKarte({ titel: 'Falls es dir gerade schwer geht', text: 'Einige Antworten klingen nach viel Belastung. Das ist keine Diagnose. Wenn du magst, sprich mit jemandem. Die TelefonSeelsorge ist kostenlos, anonym und rund um die Uhr da.' }) : ''}
    <div class="stapel bf-aktionen">
      ${aktiv && offen ? `<a class="knopf zweit voll" href="#${BASIS}/vertiefung?bereich=alle">Alle Bereiche genauer · ${vertiefungsFragen('alle').filter((x) => !(x.id in d.antworten)).length} Fragen, ca. ${Math.max(1, Math.round(vertiefungsFragen('alle').filter((x) => !(x.id in d.antworten)).length * 6 / 60))} Min.</a>` : ''}
      ${sp.einwilligung() ? '' : '<button type="button" class="knopf haupt voll" data-aktion="merken">Auf diesem Gerät merken</button>'}
      <a class="knopf zweit voll" href="#passt">Weiter: Was passt zu mir</a>
      <button type="button" class="knopf zweit voll" data-bf="neu">Noch einmal ausfüllen</button>
      <a class="link" href="#${BASIS}/methode">So wird gerechnet</a>
    </div>
    <p class="klein leise">Was das alles nicht heißt: kein Typ, keine Diagnose, keine Garantie. Persönlichkeit verändert sich über die Jahre und durch Begleitung, etwa Therapie oder Training. ${ui.marke('belegt', ['roberts2017'])}</p>
    ${ui.fuss()}`;
  const zu = ctx.param.zu; if (zu) { const z = el.querySelector('#bf-' + CSS.escape(zu)); if (z) requestAnimationFrame(() => { try { z.scrollIntoView({ block: 'start' }); } catch {} }); }
  const klick = async (ev) => {
    const g = ev.target.closest('[data-gruppe]');
    if (g && aktiv) {
      sp.schreib(M, 'gruppe', g.dataset.gruppe);
      const neu = speichereErgebnis(); ergebnis(ctx, neu || e);
      const f = el.querySelector(`[data-gruppe="${g.dataset.gruppe}"]`); if (f) f.focus();
      ui.meldung('Vergleichsgruppe: ' + GRUPPEN[g.dataset.gruppe]);
      return;
    }
    if (ev.target.closest('[data-bf=zum-vergleich]')) { const v = el.querySelector('#bf-vergleich'); if (v) { v.scrollIntoView({ block: 'start' }); const c = v.querySelector('[aria-checked=true]'); if (c) c.focus({ preventScroll: true }); } return; }
    const n = ev.target.closest('[data-bf=neu]');
    if (n && await ui.bestaetige({ titel: 'Noch einmal ausfüllen?', text: 'Dein jetziges Ergebnis bleibt im Verlauf. Du beantwortest die 30 Sätze neu.', ja: 'Neu beginnen' })) { neuerLauf(); kern.geh(BASIS + '/start'); }
  };
  if (el._bfKlick) el.removeEventListener('click', el._bfKlick);
  el._bfKlick = klick; el.addEventListener('click', klick);
  return () => { if (el._bfKlick) el.removeEventListener('click', el._bfKlick); el._bfKlick = null; };
}

// ---------- Methode ----------
function methode(ctx) {
  const { el } = ctx; ctx.zurueckZu(BASIS); ctx.titel('So wird gerechnet');
  const R = NORMEN.r, name = { N: 'Emotionale Stabilität', E: 'Extraversion', O: 'Offenheit', A: 'Verträglichkeit', C: 'Gewissenhaftigkeit' };
  const halb = (r, extra = 0) => zahl(1.96 * Math.sqrt(100 * (1 - r) + extra * extra), 0);
  el.innerHTML = `<h2>So wird gerechnet</h2>
    <h3>Die Fragen</h3>
    <p>Alle Sätze stammen aus dem <b>IPIP-NEO-120</b>, einem frei nutzbaren (gemeinfreien) Fragebogen zu den Big Five und ihren 30 Facetten. ${ui.marke('belegt', ['johnson2014', 'goldberg2006'])}</p>
    <p>Die deutschen Sätze sind eine <b>eigene, vorläufige Übersetzung</b>. Sie ist noch nicht mit Rück-Übersetzung und Testgruppe geprüft. ${ui.marke('abgeleitet', ['itc2018'])}</p>
    <p><b>Kurzform:</b> 30 Sätze, je Facette einer. <b>Genauer hinschauen:</b> die übrigen 3 Sätze je Facette, also 18 je Bereich. Zwei Sätze über die Wahl von US-Parteien sind weggelassen – deshalb hat die Facette „Werte hinterfragen“ nur 2 Sätze.</p>
    <p>Etwa die Hälfte der Sätze ist „umgedreht“ gestellt (z. B. „Ich bin lieber allein“ bei Extraversion). Deren Antworten werden umgerechnet (5 → 1, 4 → 2 …). So fällt auf, wenn jemand einfach allem zustimmt.</p>
    <h3>Der Vergleich</h3>
    <p>Dein Mittelwert wird mit Vergleichswerten aus einer großen englischsprachigen Online-Stichprobe verglichen (Auswertungsprogramm zum IPIP-NEO-120, getrennt nach Alter und Geschlecht). Die App fragt nicht nach dem Geschlecht und mischt deshalb Frauen und Männer zu gleichen Teilen. ${ui.marke('abgeleitet', ['johnsonnormen'])}</p>
    <p>Das Ergebnis ist ein <b>T-Wert</b>: 50 ist der Durchschnitt der Vergleichsgruppe, etwa zwei Drittel liegen zwischen 40 und 60. Daraus folgt der <b>Prozentrang</b>: wie viele von 100 Menschen darunter liegen. Er nimmt eine Normalverteilung an und ist an den Rändern ungenau; darum zeigt die App höchstens „1 bis 99“.</p>
    <p>Für die Kurzform sind die Vergleichswerte nur angenähert (aus den Facetten-Werten berechnet). Dafür wird der Bereich etwas breiter: Eine Näherungs-Unsicherheit von etwa ${zahl(GRENZEN.naeherung, 0)} T-Punkten ist eingerechnet. Diese ${zahl(GRENZEN.naeherung, 0)} Punkte sind eine eigene Schätzung, nicht gemessen. Die Gruppe „alle Altersgruppen“ mischt die Altersgruppen zu gleichen Teilen. ${ui.marke('abgeleitet', ['johnsonnormen'])}</p>
    <h3>Warum ein Bereich statt einer Zahl</h3>
    <p>Jede Messung hat einen Messfehler. Wie groß, hängt von der <b>Zuverlässigkeit</b> ab (0 bis 1). Der Balken zeigt den Bereich, in dem dein Wert mit 95 % Wahrscheinlichkeit liegt. ${ui.marke('belegt', ['johnson2014'])} Gehen deine Antworten in einem Bereich weit auseinander, macht die App den Balken zusätzlich breiter – das ist eine eigene Regel. ${ui.marke('abgeleitet', ['johnson2014'])}</p>
    <div class="bf-tabelle" role="table" aria-label="Zuverlässigkeit je Bereich">
      <div role="row" class="bf-zeile kopf"><span role="columnheader">Bereich</span><span role="columnheader">Kurzform</span><span role="columnheader">genauer</span></div>
      ${['O', 'C', 'E', 'A', 'N'].map((b) => `<div role="row" class="bf-zeile"><span role="cell">${name[b]}</span><span role="cell">r ≈ ${zahl(R[b].rStart, 2)} · ±${halb(R[b].rStart, GRENZEN.naeherung)}</span><span role="cell">r ≈ ${zahl(R[b].r24, 2)} · ±${halb(R[b].r24)}</span></div>`).join('')}
    </div>
    <p class="klein leise">Die Zuverlässigkeit ist aus den Vergleichstabellen geschätzt (Annahme: Sätze derselben Facette hängen etwa so zusammen wie in Facetten mit α = .75). Facetten mit 4 Sätzen: r ≈ .70, also grob.</p>
    <h3>Antwort-Qualität</h3>
    <p>Die App schaut freundlich nach drei Dingen: sehr schnelle Antworten (im Mittel unter ${zahl(GRENZEN.schnellMs / 1000, 1)} Sekunden), sehr oft dieselbe Antwort (${GRENZEN.gleichLauf}-mal hintereinander oder ${zahl(GRENZEN.gleichAnteil * 100)} % gleich) und Zustimmung zu fast allem. Dann wird der Bereich breiter, und du bekommst einen Hinweis. Dass solche Antworten ein Ergebnis ungenauer machen, ist gut untersucht. ${ui.marke('belegt', ['johnson2005', 'huang2012'])} Die genauen Grenzen hat die App selbst gewählt. ${ui.marke('abgeleitet', ['johnson2005', 'huang2012'])}</p>
    <h3>Wann „Genauer hinschauen“ vorgeschlagen wird</h3>
    <ul><li>wenn deine Antworten in einem Bereich weit auseinandergehen,</li><li>wenn du nahe der Mitte liegst (dann gleichen sich oft hohe und niedrige Facetten aus),</li><li>wenn du deutlich außerhalb der Mitte liegst (dann zeigen die Facetten, woher das kommt).</li></ul>
    <p class="klein leise">Das ist eine einfache Regel, kein „echter“ adaptiver Test. Dafür bräuchte es Daten von mehreren hundert Menschen auf Deutsch. ${ui.marke('abgeleitet', ['johnson2014'])}</p>
    <h3>Fachwörter</h3>
    <p class="klein"><b>Neurotizismus</b> heißt in der Forschung die Gegenseite der emotionalen Stabilität. <b>Facette</b>: ein Teilbereich, z. B. „Geselligkeit“ bei Extraversion. <b>Gemeinfrei</b>: darf von allen frei genutzt werden.</p>
    <details class="karte weich"><summary>Alle ${FRAGEN.length} Sätze ansehen</summary>
      ${BEREICHE.map((B) => `<h4>${esc(B.name)}</h4><ol class="klein bf-saetze">${FRAGEN.filter((q) => q.b === B.ipip).map((q) => `<li>${esc(q.t)} <span class="leise">(${esc(FACETTEN[B.id][q.f - 1][1])}${q.k < 0 ? ', umgedreht' : ''}${q.start ? ', Kurzform' : ''})</span></li>`).join('')}</ol>`).join('')}
      ${B_HINWEIS}
    </details>
    ${ui.fuss()}`;
}
const B_HINWEIS = '<p class="klein leise">Bei emotionaler Stabilität sind die Sätze in Richtung Neurotizismus gestellt; „umgedreht“ heißt dort: Zustimmung spricht für mehr Stabilität.</p>';

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
    const e = sp.ergebnis(M), d = daten();
    if (teil === 'ergebnis') return e ? ergebnis(ctx, e) : einstieg(ctx, null);
    // Übersicht: läuft ein neuer Durchgang, der noch nicht fertig ist → Einstieg; sonst das neueste Ergebnis.
    const laeuft = startBeantwortet(d.antworten) > 0 && !startFertig(d.antworten);
    if (e && !laeuft) return ergebnis(ctx, e);
    if (!e && startFertig(d.antworten)) { const neu = speichereErgebnis(); if (neu) return ergebnis(ctx, neu); }
    return einstieg(ctx, e);
  }
};

// Für Tests (nur ?test=1): Fragen + Rechnung erreichbar, ohne Code anderer Module zu brauchen.
if (kern.TEST) window.__bigfive = { FRAGEN, NACH_ID, wertung, rechne };
