// M2 interessen – Interessen nach Holland (RIASEC), Tagesrhythmus, Ehrlichkeit-Bescheidenheit. Vertrag: ARCH.md §2–§4.
// Routen: fragen/interessen (Übersicht) · …/riasec (+ /bogen, ?genauer=1) · …/rhythmus (+ /eingabe) · …/ehrlichkeit (+ /bogen).
// Ergebnisse: interessen.riasec, interessen.rhythmus, interessen.ehrlichkeit (ARCH.md §3.3). Zwischenstände: m.interessen.
import { kern } from '../../kern.js';
import * as D from './daten.js';
import * as R from './rechnen.js';

const B = 'fragen/interessen';
const ui = kern.ui, S = kern.speicher;
const { esc, sym, marke, aussage, band } = ui;
const lies = (k, std) => S.lies('interessen', k, std);
const schreib = (k, v) => S.schreib('interessen', k, v);
const jung = () => kern.einst().alter === 'u16';
const merk = () => S.einwilligung() ? '' :
  `<div class="hinweis gelb" data-ia-merk><p><b>Nur für jetzt:</b> Dein Ergebnis ist nicht gemerkt und nach dem Schließen weg.</p><button type="button" class="knopf klein" data-aktion="merken">${sym('schloss')} Auf diesem Gerät merken</button></div>`;
const nichtHeisst = (punkte) => `<div class="karte weich"><h3>Was das nicht heißt</h3><ul>${punkte.join('')}</ul></div>`;
const li = (t) => `<li>${t}</li>`;

// Klicks auf [data-ia] im Inhalt; liefert die Aufräum-Funktion (auch für „einwilligung“).
function binde(el, aktionen) {
  const klick = (e) => { const b = e.target.closest('[data-ia]'); if (b && el.contains(b) && aktionen[b.dataset.ia]) { e.preventDefault(); aktionen[b.dataset.ia](b, e); } };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', () => el.querySelectorAll('[data-ia-merk]').forEach((m) => { if (S.einwilligung()) m.remove(); }));
  return () => { el.removeEventListener('click', klick); aus(); };
}

export default {
  id: 'interessen',
  schema: 1,
  migriere(daten) { return daten; },
  start(k) { k.ui.ladeStil(new URL('./stil.css', import.meta.url).href); },
  ansicht(ctx) {
    const [, , teil, unter] = ctx.pfad;
    if (teil === 'riasec') return unter === 'bogen' ? riasecBogen(ctx) : riasecSeite(ctx);
    if (teil === 'rhythmus') return unter === 'eingabe' || !gueltig(S.ergebnis('interessen.rhythmus')) ? rhythmusEingabe(ctx) : rhythmusErgebnis(ctx);
    if (teil === 'ehrlichkeit') return unter === 'bogen' ? ehrlichBogen(ctx) : ehrlichSeite(ctx);
    return uebersicht(ctx);
  }
};
const gueltig = (e) => !!(e && e.schema === 1);
// Start-Fragebogen läuft (kern.weg, Integration) → nach einem Teil und bei „Pause“ zurück zu #los, sonst zur eigenen Seite.
const wegZiel = () => (kern.weg ? kern.weg.nachBogen() : null);

// ======================================================================= Übersicht
function uebersicht({ el, titel, zurueckZu }) {
  titel('Interessen, Rhythmus, Ehrlichkeit'); zurueckZu('fragen');
  const info = (kern.module.find((m) => m.id === 'interessen') || { fragen: [] }).fragen;
  el.innerHTML = `<h2>Interessen, Rhythmus, Ehrlichkeit</h2>
    <p>Drei kurze Teile. Du kannst sie einzeln machen, in jeder Reihenfolge.</p>
    <ul class="zeilen">${info.map((f) => { const r = S.ergebnis(f.ergebnis);
      return `<li><a class="zeile" href="#${esc(f.route)}"><span><b>${esc(f.titel)}</b><small>${esc(f.kurz || '')}</small></span><span class="rechts">${r ? sym('haken') + ' ' + esc(ui.datum(r.zeit)) : esc(f.dauer || '')}${sym('weiter')}</span></a></li>`; }).join('')}</ul>
    ${merk()}${ui.fuss()}`;
  return binde(el, {});
}

// ======================================================================= Interessen (RIASEC)
function riasecSeite(ctx) {
  const { el, titel, zurueckZu } = ctx;
  titel('Interessen'); zurueckZu('fragen');
  const st = lies('riasec', {}) || {}, erg = S.ergebnis('interessen.riasec');
  const liste = st.genauer ? D.RIASEC_REST : D.RIASEC_KURZ;
  const beantwortet = liste.filter((f) => typeof (st.antworten || {})[f.id] === 'number').length;
  const laeuft = !!st.laeuft && beantwortet > 0;
  if (gueltig(erg) && (!laeuft || st.genauer)) return riasecErgebnis(ctx, erg, laeuft && st.genauer ? beantwortet : null);
  el.innerHTML = `<h2>Interessen</h2>
    <p class="lead">Welche Tätigkeiten ziehen dich an? Du siehst ${D.RIASEC_KURZ.length} kurze Beispiele und sagst jeweils, wie gern du das tun würdest.</p>
    <ul><li>Denk nicht daran, ob du es kannst, was man damit verdient oder welche Ausbildung man braucht.</li>
      <li>Dein erstes Gefühl zählt. Das dauert etwa 2 Minuten.</li><li>Am Computer gehen auch die Tasten 1 bis 5.</li></ul>
    ${aussage({ text: 'Die Einteilung in sechs Interessen-Bereiche nach Holland ist das am besten untersuchte Modell für Interessen.', stufe: 'belegt', quellen: ['tracey1993', 'nye2012'] })}
    ${jung() ? '<p class="hinweis">Interessen werden zwischen 12 und Anfang 20 noch deutlich klarer. Nimm das Ergebnis als Momentaufnahme.</p>' : ''}
    <div class="stapel">${laeuft
      ? `<button type="button" class="knopf haupt gross" data-ia="weiter">Weitermachen (${beantwortet} von ${liste.length})</button><button type="button" class="knopf zweit" data-ia="neu">Von vorn anfangen</button>`
      : `<button type="button" class="knopf haupt gross" data-ia="start">Los geht’s</button>`}</div>
    <p class="leise klein">Fragen: aus dem O*NET Interest Profiler (US-Arbeitsministerium), Auswahl nach Armstrong u. a. (2008), gekürzt und selbst übersetzt – vorläufig. Das US-Arbeitsministerium hat diese Fassung nicht geprüft oder empfohlen. ${marke('abgeleitet', ['armstrong2008', 'onet'])}</p>
    ${ui.fuss()}`;
  return binde(el, {
    start: () => { schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen'); },
    weiter: () => kern.geh(B + '/riasec/bogen' + (st.genauer ? '?genauer=1' : '')),
    neu: async () => { if (await ui.bestaetige({ titel: 'Von vorn anfangen?', text: 'Deine bisherigen Antworten in diesem Teil werden gelöscht.', ja: 'Von vorn' })) { schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen'); } }
  });
}

function riasecBogen({ el, titel, param, zurueckZu }) {
  titel('Interessen'); if (wegZiel()) zurueckZu(wegZiel());
  const vorher = S.ergebnis('interessen.riasec');
  let st = lies('riasec', {}) || {};
  const genauer = param.genauer === '1' && gueltig(vorher) && D.RIASEC_KURZ.every((f) => typeof (st.antworten || {})[f.id] === 'number');
  st = { antworten: { ...(st.antworten || {}) }, laeuft: true, genauer };
  schreib('riasec', st);
  const liste = genauer ? D.RIASEC_REST : D.RIASEC_KURZ;
  const fb = ui.fragebogen(el, {
    titel: genauer ? 'Interessen – genauer' : 'Interessen',
    fragen: liste.map((f) => ({ id: f.id, text: f.text, hilfe: D.RIASEC_HILFE })),
    skala: D.SKALA_GERN, antworten: st.antworten,
    beiAntwort: (id, w, alle) => { st = { ...st, antworten: alle }; schreib('riasec', st); },
    pause: () => kern.geh((!genauer && wegZiel()) || B + '/riasec'),
    fertig: (alle) => {
      const voll = D.RIASEC.every((f) => typeof alle[f.id] === 'number');
      const erg = R.riasecAuswerten(alle, voll ? 'voll' : 'kurz');
      if (!erg) { ui.meldung('Es fehlen noch Antworten.'); return; }
      S.setzeErgebnis('interessen.riasec', erg, { ersetzen: genauer && gueltig(vorher) && vorher.form === 'kurz' });
      schreib('riasec', { antworten: alle, laeuft: false, genauer: false });
      kern.geh((!genauer && wegZiel()) || B + '/riasec', { ersetzen: true });
    }
  });
  return () => fb.zerstoere();
}

// Sechseck nach Holland: Nachbarn ähneln sich. top = die drei stärksten Bereiche.
function sechseck(top) {
  const cx = 180, cy = 100, r = 62;
  const p = D.REIHE.map((t, i) => { const w = ((-120 + i * 60) * Math.PI) / 180; return { t, x: cx + r * Math.cos(w), y: cy + r * Math.sin(w), w }; });
  const kurzName = { R: 'praktisch', I: 'forschend', A: 'künstlerisch', S: 'sozial', E: 'unternehm.', C: 'ordnend' };
  const label = `Sechseck der Interessen: ${D.REIHE.map((t) => D.TYPEN[t].name).join(', ')} im Kreis. Deine stärksten: ${top.map((t) => D.TYPEN[t].name).join(', ')}.`;
  // Beschriftung: links/rechts neben dem Punkt, oben/unten darüber bzw. darunter (keine Überlappung mit dem Kreis)
  const lage = (q) => { const c = Math.cos(q.w), s = Math.sin(q.w);
    if (Math.abs(s) < 0.1) return { x: q.x + (c > 0 ? 20 : -20), y: q.y, a: c > 0 ? 'start' : 'end' };
    return { x: q.x + (c > 0 ? -10 : 10), y: q.y + (s > 0 ? 28 : -28), a: c > 0 ? 'start' : 'end' }; };
  return `<svg class="ia-hex" viewBox="0 0 360 200" role="img" aria-label="${esc(label)}">
    <polygon class="ia-hex-linie" points="${p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')}"/>
    ${p.map((q) => { const n = top.indexOf(q.t), l = lage(q);
      return `<g class="ia-hex-p${n >= 0 ? ' an' : ''}"><circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="14"/>
        <text class="ia-hex-b" x="${q.x.toFixed(1)}" y="${q.y.toFixed(1)}" dy=".36em" text-anchor="middle">${q.t}</text>
        <text class="ia-hex-name" x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" dy=".36em" text-anchor="${l.a}">${n >= 0 ? n + 1 + '. ' : ''}${kurzName[q.t]}</text></g>`; }).join('')}
  </svg>`;
}

function riasecErgebnis({ el }, e, genauerOffen) {
  if (!e.typen || !e.top || e.top.length < 3) {
    el.innerHTML = `<h2>Interessen</h2><p>Dieses Ergebnis stammt aus einer anderen Fassung. Bitte füll den Fragebogen noch einmal aus.</p><button type="button" class="knopf haupt" data-ia="neu">Neu ausfüllen</button>${ui.fuss()}`;
    return binde(el, { neu: () => { schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen'); } });
  }
  const T = D.TYPEN, [t1, t2, t3] = e.top, kurz = e.form !== 'voll';
  const sortiert = [...D.REIHE].sort((a, b) => e.typen[a].rang - e.typen[b].rang || D.REIHE.indexOf(a) - D.REIHE.indexOf(b));
  const knapp = e.knapp && e.knapp.drittVierter;
  const paar = D.PAARE[R.paarSchluessel(t1, t2)];
  const nachbar = {
    1: 'Deine zwei stärksten Bereiche liegen im Sechseck nebeneinander. Solche Paare sind häufig und lassen sich leicht in einer Tätigkeit verbinden.',
    2: 'Zwischen deinen zwei stärksten Bereichen liegt im Sechseck ein anderer Bereich. Sie passen gut zusammen, aber eine Tätigkeit, die beides verbindet, musst du etwas gezielter suchen.',
    3: 'Deine zwei stärksten Bereiche liegen sich im Sechseck gegenüber. Das ist seltener: Tätigkeiten, die beides verbinden, gibt es – du musst sie aber bewusst suchen.'
  }[e.nachbarn] || '';
  const v = S.verlauf('interessen.riasec');
  el.innerHTML = `<h2>Deine Interessen</h2>
    <div class="karte akzent">
      <p class="leise klein">Dein Holland-Code${kurz ? ' – vorläufig' : ''}</p>
      <p class="ia-code" aria-label="Holland-Code ${esc(e.top.join(' '))}">${esc(e.top.join(' – '))}</p>
      <p>Am meisten ziehen dich an: <b>${esc(T[t1].name)}</b>, <b>${esc(T[t2].name)}</b> und <b>${esc(T[t3].name)}</b>. ${marke('abgeleitet', ['armstrong2008'])}</p>
      ${knapp ? `<p class="klein">Platz 3 und 4 liegen sehr nah beieinander. Nimm <b>${esc(T[knapp].name)}</b> als vierten Bereich mit dazu.</p>` : ''}
      ${e.knapp && e.knapp.ersterZweiter ? '<p class="klein">Platz 1 und 2 sind fast gleich stark – sieh sie als gemeinsame Spitze.</p>' : ''}
      <p class="klein">Die Reihenfolge ist unsicher: Bereiche, die weniger als etwa ${Math.round((e.knapp && e.knapp.grenze) || (kurz ? 18 : 14))} Punkte auseinanderliegen, können bei einem zweiten Durchgang die Plätze tauschen.${kurz ? ' Bei der Kurzform gilt der Code als vorläufig.' : ''} ${marke('abgeleitet', ['armstrong2008'])}</p>
      <p class="leise klein">Die Buchstaben kommen aus dem Englischen: R praktisch-technisch, I forschend, A künstlerisch, S sozial, E unternehmerisch, C ordnend.</p>
    </div>
    ${jung() ? '<p class="hinweis">In deinem Alter sind Interessen noch stark in Bewegung. Nimm das als Momentaufnahme.</p>' : ''}
    ${e.hoehe < 35 ? '<p class="hinweis">Bei vielen Beispielen hast du „eher nicht gern“ gewählt. Das ist häufig, denn die Beispiele sind oft Berufe, die nicht nach dir klingen. Wichtig ist die Reihenfolge, nicht die Höhe.</p>' : ''}
    ${e.hoehe > 75 ? '<p class="hinweis">Dich zieht vieles an. Dann hilft die Reihenfolge, Schwerpunkte zu setzen.</p>' : ''}
    ${e.spreizung < 15 ? `<p class="hinweis">Deine sechs Bereiche liegen nah beieinander – ein klarer Schwerpunkt zeigt sich noch nicht.${kurz ? ' Mit „Genauer machen“ wird das Bild schärfer.' : ''}</p>` : ''}
    <h3>Alle sechs Bereiche</h3>
    <p class="leise klein">0 heißt: alles „gar nicht gern“, 100 heißt: alles „sehr gern“. Der Balken zeigt den Bereich, in dem dein Wert wahrscheinlich liegt${kurz ? ' – gestrichelt, weil die Kurzform grob misst' : ''}.</p>
    <p class="leise klein">Zu „Forschend“: Die Fragen dazu drehen sich fast nur um Natur und Medizin. Wer lieber Technik, Physik, Informatik oder Musik untersucht, landet hier oft zu niedrig. ${marke('abgeleitet', ['armstrong2008'])}</p>
    <div class="karte">${sortiert.map((t) => { const b = e.typen[t];
      return band({ name: `${b.rang}. ${T[t].name}`, unten: b.unten, oben: b.oben, min: 0, max: 100, mitte: [40, 60], wort: b.wort, grob: kurz,
        beschreibung: `${T[t].name}: Platz ${b.rang}, Bereich ${Math.round(b.unten)} bis ${Math.round(b.oben)} von 100, ${b.wort}.` }) + `<p class="ia-typ-kurz">${esc(T[t].kurz)}</p>`; }).join('')}
      <div class="band-pole" aria-hidden="true"><span>zieht dich wenig an</span><span>zieht dich stark an</span></div></div>
    ${genauerOffen !== null ? `<button type="button" class="knopf haupt voll" data-ia="genauer">Genauer machen – weiter (${genauerOffen} von ${D.RIASEC_REST.length})</button>`
      : kurz ? `<div class="karte weich"><p><b>Genauer machen:</b> ${D.RIASEC_REST.length} weitere Beispiele (etwa 2 Minuten) machen die Bereiche schmaler.</p><button type="button" class="knopf haupt voll" data-ia="genauer">Genauer machen</button></div>` : ''}
    <h3>Das Sechseck</h3>
    ${sechseck(e.top)}
    ${aussage({ text: 'Die sechs Bereiche ordnen sich wie ein Kreis: Nachbarn ähneln sich, Gegenüber sind sich am fremdesten.', stufe: 'belegt', quellen: ['tracey1993'] })}
    ${nachbar ? aussage({ text: nachbar, stufe: 'abgeleitet', quellen: ['tracey1993'] }) : ''}
    <h3>Was du damit machen kannst</h3>
    ${aussage({ text: 'Wer Tätigkeiten macht, die zu den eigenen Interessen passen, leistet im Mittel mehr und bleibt eher dabei.', stufe: 'belegt', quellen: ['nye2012'] })}
    ${e.top.map((t) => `<div class="karte"><h4>${esc(T[t].name)}</h4><p class="leise klein">${esc(T[t].kurz)}</p>
      <p>Zum Ausprobieren – Tätigkeiten und Projekte, nicht nur Berufe: ${marke('idee')}</p>
      <ul class="ia-ideen">${D.IDEEN[t].map((x) => li(esc(x))).join('')}</ul></div>`).join('')}
    ${paar ? `<div class="karte gruen"><h4>Beides verbinden: ${esc(T[t1].name)} und ${esc(T[t2].name)}</h4>${aussage({ text: paar, stufe: 'idee' })}</div>` : ''}
    ${aussage({ text: 'Ob ein Format im Netz mehr Reichweite bringt, weil es zu deinen Interessen passt, ist nicht erforscht. Probier es aus und vergleiche mit deiner eigenen Statistik.', stufe: 'idee' })}
    ${nichtHeisst([
      li(`Interessen zeigen, was dich anzieht – nicht, was du kannst. Beides hängt nur mäßig zusammen. ${marke('belegt', ['ackerman1997'])}`),
      li(`Interessen sind ziemlich beständig, besonders ab Anfang 20 – aber nicht in Stein gemeißelt. ${marke('belegt', ['low2005'])}`),
      li('Die Beispiele sind ältere Berufs-Tätigkeiten aus den USA, und die Forscher-Fragen drehen sich viel um Natur und Medizin. Forschen heißt aber auch: Klänge, Sprache oder Technik untersuchen.'),
      li('Es gibt noch keine deutschen Vergleichswerte. Die Balken zeigen deine eigenen Antworten, keinen Vergleich mit anderen. Die Übersetzung ist vorläufig.')
    ])}
    ${v.length > 1 ? `<details class="karte"><summary>Frühere Ergebnisse (${v.length - 1})</summary><ul>${v.slice(0, -1).reverse().map((x) => li(`${esc(ui.datum(x.zeit))}: ${esc((x.top || []).join(' – '))} ${x.form === 'voll' ? '(genau)' : '(kurz)'}`)).join('')}</ul></details>` : ''}
    ${merk()}
    <div class="stapel"><button type="button" class="knopf zweit" data-ia="neu">Noch einmal ausfüllen</button><a class="knopf zweit" href="#fragen">Zu allen Fragen</a></div>
    ${ui.fuss()}`;
  return binde(el, {
    genauer: () => kern.geh(B + '/riasec/bogen?genauer=1'),
    neu: async () => {
      if (!(await ui.bestaetige({ titel: 'Noch einmal ausfüllen?', text: 'Dein jetziges Ergebnis bleibt im Verlauf. So siehst du später, ob sich etwas verändert hat.', ja: 'Neu ausfüllen' }))) return;
      schreib('riasec', { antworten: {}, laeuft: true, genauer: false }); kern.geh(B + '/riasec/bogen');
    }
  });
}

// ======================================================================= Ehrlichkeit-Bescheidenheit
function ehrlichSeite(ctx) {
  const { el, titel, zurueckZu } = ctx;
  titel('Ehrlichkeit und Bescheidenheit'); zurueckZu('fragen');
  const st = lies('ehrlichkeit', {}) || {}, erg = S.ergebnis('interessen.ehrlichkeit');
  const n = D.EHRLICHKEIT.filter((f) => typeof (st.antworten || {})[f.id] === 'number').length;
  const laeuft = !!st.laeuft && n > 0;
  if (gueltig(erg) && !laeuft) return ehrlichErgebnis(ctx, erg);
  el.innerHTML = `<h2>Ehrlichkeit und Bescheidenheit</h2>
    <p class="lead">${D.EHRLICHKEIT.length} Aussagen darüber, wie wichtig dir Fairness ist – und wie wichtig dir dein eigener Vorteil, Geld und Status sind.</p>
    <ul><li>Antworte so, wie du wirklich bist – nicht, wie man sein sollte. Niemand sieht deine Antworten.</li><li>Das dauert etwa 1 Minute.</li></ul>
    ${aussage({ text: 'Ehrlichkeit-Bescheidenheit ist im HEXACO-Modell ein eigener sechster Grundzug neben den Big Five.', stufe: 'belegt', quellen: ['ashton2007'] })}
    ${jung() ? '<p class="hinweis">Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm alles als Momentaufnahme.</p>' : ''}
    <div class="stapel">${laeuft
      ? `<button type="button" class="knopf haupt gross" data-ia="weiter">Weitermachen (${n} von ${D.EHRLICHKEIT.length})</button><button type="button" class="knopf zweit" data-ia="neu">Von vorn anfangen</button>`
      : `<button type="button" class="knopf haupt gross" data-ia="start">Los geht’s</button>`}</div>
    <p class="leise klein">Fragen: gemeinfreie IPIP-Fragen, angelehnt an die IPIP-HEXACO-Skalen, eigene Übersetzung – vorläufig. ${marke('abgeleitet', ['ashton2007', 'sibley2011'])}</p>
    ${ui.fuss()}`;
  const neu = () => { schreib('ehrlichkeit', { antworten: {}, laeuft: true }); kern.geh(B + '/ehrlichkeit/bogen'); };
  return binde(el, {
    start: neu, weiter: () => kern.geh(B + '/ehrlichkeit/bogen'),
    neu: async () => { if (await ui.bestaetige({ titel: 'Von vorn anfangen?', text: 'Deine bisherigen Antworten in diesem Teil werden gelöscht.', ja: 'Von vorn' })) neu(); }
  });
}

function ehrlichBogen({ el, titel, zurueckZu }) {
  titel('Ehrlichkeit'); if (wegZiel()) zurueckZu(wegZiel());
  let st = lies('ehrlichkeit', {}) || {};
  st = { antworten: { ...(st.antworten || {}) }, laeuft: true };
  schreib('ehrlichkeit', st);
  const fb = ui.fragebogen(el, {
    titel: 'Ehrlichkeit', fragen: D.EHRLICHKEIT.map((f) => ({ id: f.id, text: f.text })), antworten: st.antworten,
    beiAntwort: (id, w, alle) => { st = { ...st, antworten: alle }; schreib('ehrlichkeit', st); },
    pause: () => kern.geh(wegZiel() || B + '/ehrlichkeit'),
    fertig: (alle) => {
      const erg = R.ehrlichkeitAuswerten(alle);
      if (!erg) { ui.meldung('Es fehlen noch Antworten.'); return; }
      S.setzeErgebnis('interessen.ehrlichkeit', erg);
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
  const teile = Object.keys(F).filter((k) => fac[k]);
  const tiefster = teile.length ? teile.reduce((a, b) => (fac[b].wert < fac[a].wert ? b : a)) : null;
  const hoechster = teile.length ? teile.reduce((a, b) => (fac[b].wert > fac[a].wert ? b : a)) : null;
  const streut = tiefster && fac[hoechster].wert - fac[tiefster].wert >= 20;
  let deutung;
  if (e.stufe >= 1) deutung = `<div class="karte gruen"><h3>Deine Stärke</h3>
      ${aussage({ text: 'Bei den meisten Aussagen hast du die faire, bescheidene Seite gewählt. Menschen mit solchen Antworten teilen in Studien mit Geld-Spielen fairer – vor allem dort, wo sie andere ausnutzen könnten.', stufe: 'belegt', quellen: ['thielmann2020'] })}
      ${aussage({ text: 'Kosten: Du verkaufst dich womöglich unter Wert – bei Preisen, in Verhandlungen oder wenn es darum geht, deine eigene Arbeit zu zeigen.', stufe: 'idee' })}</div>`;
  else if (e.stufe <= -1) deutung = `<div class="karte gelb"><h3>Hier lohnt ein genauerer Blick</h3>
      ${aussage({ text: 'Deine Antworten liegen eher auf der Seite „eigener Vorteil“: Geld, Status oder dein eigenes Vorankommen sind dir wichtig.', stufe: 'abgeleitet', quellen: ['ashton2007'] })}
      ${aussage({ text: 'Stärke: Du setzt dich für dich ein und lässt dir nicht leicht etwas wegnehmen – das kann bei Verhandlungen und im Wettbewerb helfen.', stufe: 'idee' })}
      ${aussage({ text: 'Kosten: Merken andere, dass es dir vor allem um deinen Vorteil geht, sinkt ihr Vertrauen – und Zusammenarbeit wird schwerer.', stufe: 'abgeleitet', quellen: ['thielmann2020'] })}</div>`;
  else deutung = `<div class="karte"><p>Deine Antworten liegen in der Mitte der Skala: Bei einigen Aussagen hast du die faire, bescheidene Seite gewählt, bei anderen nicht. Unten siehst du, in welchem Teil es auseinandergeht.</p></div>`;
  el.innerHTML = `<h2>Ehrlichkeit und Bescheidenheit</h2>
    <p>Wie wichtig dir Fairness ist – und wie wichtig dein eigener Vorteil, Geld und Status. ${marke('abgeleitet', ['ashton2007'])}</p>
    ${jung() ? '<p class="hinweis">Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm das als Momentaufnahme.</p>' : ''}
    <div class="karte">${band({ name: 'Ehrlichkeit-Bescheidenheit', unten: e.unten, oben: e.oben, min: 0, max: 100, mitte: [40, 60], wort: e.wort,
      links: 'eher strategisch, eigener Vorteil zählt', rechts: 'eher fair und bescheiden',
      beschreibung: `Ehrlichkeit-Bescheidenheit: Bereich ${Math.round(e.unten)} bis ${Math.round(e.oben)} von 100, ${e.wort}.` })}</div>
    ${deutung}
    <h3>Die vier Teile</h3>
    <p class="leise klein">Je drei Aussagen – darum sehr grob (gestrichelt).</p>
    <div class="karte">${teile.map((k) => band({ name: F[k].name, unten: fac[k].unten, oben: fac[k].oben, min: 0, max: 100, mitte: [40, 60], wort: fac[k].wort, grob: true,
      beschreibung: `${F[k].name} (${F[k].kurz}): Bereich ${Math.round(fac[k].unten)} bis ${Math.round(fac[k].oben)} von 100, ${fac[k].wort}.` }) + `<p class="ia-typ-kurz">${esc(F[k].kurz)}</p>`).join('')}
      <div class="band-pole" aria-hidden="true"><span>eigener Vorteil</span><span>fair und bescheiden</span></div></div>
    ${streut ? `<p>Am meisten auf der Seite „eigener Vorteil“ liegt bei dir <b>${esc(F[tiefster].name)}</b> (${esc(F[tiefster].kurz)}), am meisten auf der fairen Seite <b>${esc(F[hoechster].name)}</b>.</p>` : ''}
    ${e.stufe <= 0 ? `<h3>Wenn du hier etwas ausprobieren willst</h3>
      ${aussage({ text: 'Erzähl bei deinem nächsten Erfolg zuerst, wer dir geholfen hat.', stufe: 'idee' })}
      ${aussage({ text: 'Vor einem teuren Kauf eine Nacht darüber schlafen und dich fragen: Will ich das – oder will ich, dass andere es sehen?', stufe: 'idee' })}` : ''}
    ${nichtHeisst([
      li('Kein Urteil über deinen Charakter. Es zeigt, wie du dich selbst beschreibst.'),
      li('Bei solchen Fragen wählen viele Menschen eher die „gute“ Seite. Es gibt noch keine deutschen Vergleichswerte – darum zeigt der Balken nur deine Antworten, keinen Vergleich mit anderen.'),
      li('Zwölf Aussagen sind ein grober Blick, die Übersetzung ist vorläufig.'),
      li('Dieser Teil ist nur für dich. Er wird nie im Live gezeigt.')
    ])}
    ${merk()}
    <div class="stapel"><button type="button" class="knopf zweit" data-ia="neu">Noch einmal ausfüllen</button><a class="knopf zweit" href="#fragen">Zu allen Fragen</a></div>
    ${ui.fuss()}`;
  return binde(el, {
    neu: async () => {
      if (!(await ui.bestaetige({ titel: 'Noch einmal ausfüllen?', text: 'Dein jetziges Ergebnis bleibt im Verlauf.', ja: 'Neu ausfüllen' }))) return;
      schreib('ehrlichkeit', { antworten: {}, laeuft: true }); kern.geh(B + '/ehrlichkeit/bogen');
    }
  });
}

// ======================================================================= Tagesrhythmus
const LEER = { tage: null, freiEin: '', freiAuf: '', arbeitEin: '', arbeitAuf: '', weckerFrei: null, selbst: null };
function rhythmusEingabe({ el, titel, zurueckZu, pfad }) {
  titel('Tagesrhythmus'); zurueckZu(wegZiel() || (pfad[3] === 'eingabe' ? B + '/rhythmus' : 'fragen'));
  let e = { ...LEER, ...(lies('rhythmus', {}) || {}) };
  const speichere = () => schreib('rhythmus', e);
  const chip = (gruppe, wert, text) => `<button type="button" class="chip" role="radio" aria-checked="${e[gruppe] === wert}" data-ia="wahl" data-gruppe="${gruppe}" data-wert="${esc(JSON.stringify(wert))}">${esc(text)}</button>`;
  const zeit = (feld, text) => `<label class="ia-zeit"><span>${esc(text)}</span><input type="time" class="feld" data-feld="${feld}" value="${esc(e[feld] || '')}" step="300"></label>`;
  const male = (fokus) => {
    const t = e.tage;
    el.innerHTML = `<h2>Tagesrhythmus</h2>
      <p class="lead">Ein paar Fragen zu deinem Schlaf, etwa 1 Minute. Daraus schätzt die App, ob du eher früh oder spät tickst – und wann dein Kopf am klarsten ist.</p>
      <p class="leise klein">Denk an eine normale Woche der letzten Zeit. „Einschlafen“ heißt: wann du wirklich einschläfst, nicht wann du ins Bett gehst.</p>
      <h3 id="ia-tage-t">An wie vielen Tagen pro Woche musst du zu einer festen Zeit aufstehen?</h3>
      <p class="leise klein">Wegen Arbeit, Schule, Uni oder Terminen – mit Wecker.</p>
      <div class="chips ia-zahlen" role="radiogroup" aria-labelledby="ia-tage-t">${[0, 1, 2, 3, 4, 5, 6, 7].map((n) => chip('tage', n, String(n))).join('')}</div>
      ${t > 0 ? `<h3>An diesen Tagen</h3><div class="ia-zeiten">${zeit('arbeitEin', 'Einschlafen')}${zeit('arbeitAuf', 'Aufwachen')}</div>` : ''}
      ${t !== 7 ? `<h3>An freien Tagen</h3><p class="leise klein">Tage, an denen du ausschlafen kannst.</p><div class="ia-zeiten">${zeit('freiEin', 'Einschlafen')}${zeit('freiAuf', 'Aufwachen')}</div>
        <p id="ia-wecker-t"><b>Weckt dich an freien Tagen trotzdem etwas?</b> <span class="leise klein">Wecker, Kinder, Haustier</span></p>
        <div class="chips" role="radiogroup" aria-labelledby="ia-wecker-t">${chip('weckerFrei', false, 'Nein, ich wache von selbst auf')}${chip('weckerFrei', true, 'Ja')}</div>` : ''}
      <h3 id="ia-selbst-t">Wann kannst du dich am besten konzentrieren?</h3>
      <p class="leise klein">Freiwillig. Die App vergleicht das mit ihrer Rechnung.</p>
      <div class="chips" role="radiogroup" aria-labelledby="ia-selbst-t">${D.SELBST.map((s) => chip('selbst', s.wert, s.text)).join('')}</div>
      <p id="ia-fehler" class="hinweis gelb" role="alert" hidden></p>
      <button type="button" class="knopf haupt gross voll" data-ia="auswerten">Auswerten</button>
      <p class="leise klein">Eigene Fragen. Die Rechnung lehnt sich an die Schlafmitte nach Roenneberg an (nicht der Münchner Chronotyp-Fragebogen selbst). ${marke('abgeleitet', ['roenneberg2003'])}</p>
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
      S.setzeErgebnis('interessen.rhythmus', r);
      kern.geh(wegZiel() || B + '/rhythmus', { ersetzen: true });
    }
  });
  return () => { aus(); el.removeEventListener('input', eingabe); el.removeEventListener('change', eingabe); };
}

const SATZ = { frueh: 'Du tickst früh – ein Morgentyp.', 'eher-frueh': 'Du tickst eher früh.', mittel: 'Du tickst weder besonders früh noch besonders spät.', 'eher-spaet': 'Du tickst eher spät.', spaet: 'Du tickst spät – ein Abendtyp.' };
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

function rhythmusErgebnis({ el, titel, zurueckZu }) {
  titel('Tagesrhythmus'); zurueckZu('fragen');
  const r = S.ergebnis('interessen.rhythmus'), U = R.uhrText, Dt = R.dauerText;
  const spaet = r.typ === 'spaet' || r.typ === 'eher-spaet', frueh = r.typ === 'frueh' || r.typ === 'eher-frueh';
  const sel = D.SELBST.find((s) => s.wert === r.selbst);
  const h = r.hinweise || [];
  const korr = r.schlafmitteFrei != null && Math.abs(r.schlafmitteKorr - r.schlafmitteFrei) >= 0.08;
  el.innerHTML = `<h2>Dein Tagesrhythmus</h2>
    <div class="karte akzent">
      <p class="ia-gross">${esc(SATZ[r.typ] || '')} ${marke('abgeleitet', ['roenneberg2003'])}</p>
      <p>${r.schlafmitteFrei != null ? `Deine Schlafmitte an freien Tagen: <b>${U(r.schlafmitteFrei)} Uhr</b>${korr ? ` – ohne den nachgeholten Schlaf: <b>${U(r.schlafmitteKorr)} Uhr</b>` : ''}.` : `Deine Schlafmitte: <b>${U(r.schlafmitteKorr)} Uhr</b>.`}</p>
      ${band({ name: 'Schlafmitte', unten: r.schlafmitteKorr - 0.5, oben: r.schlafmitteKorr + 0.5, min: 0, max: 9, mitte: [3.5, 5], wort: r.wort,
        links: 'früher (0 Uhr)', rechts: 'später (9 Uhr)', beschreibung: `Schlafmitte etwa ${U(r.schlafmitteKorr - 0.5)} bis ${U(r.schlafmitteKorr + 0.5)} Uhr, ${r.wort}. Die Mitte der Skala liegt bei 3:30 bis 5 Uhr.` })}
      <p class="leise klein">Die Schlafmitte ist die Uhrzeit genau in der Mitte zwischen Einschlafen und Aufwachen. Sie ist der einfachste gute Hinweis auf die innere Uhr.</p>
    </div>
    ${h.includes('wecker') ? '<p class="hinweis">Weil dich an freien Tagen etwas weckt, ist die Einordnung ungenauer – wahrscheinlich tickst du etwas später.</p>' : ''}
    ${h.includes('keine-freien-tage') ? '<p class="hinweis">Ohne freie Tage rechnet die App mit deinen Tagen mit Termin. Die zeigen eher deinen Plan als deine innere Uhr.</p>' : ''}
    ${h.includes('ungewoehnliche-zeiten') ? '<p class="hinweis">Deine Zeiten sind ungewöhnlich, zum Beispiel bei Schicht- oder Nachtarbeit. Dann passt diese einfache Rechnung nicht gut.</p>' : ''}
    <h3>Dein Tag</h3>
    ${tagesbild(r)}
    ${aussage({ text: `Dein wahrscheinlich bestes Fenster für Konzentration: etwa ${U(r.fokus.von)} bis ${U(r.fokus.bis)} Uhr. Ein zweites, kürzeres Hoch: etwa ${U(r.fokus2.von)} bis ${U(r.fokus2.bis)} Uhr.`, stufe: 'abgeleitet', quellen: ['schmidt2007'] })}
    ${aussage({ text: `Dazwischen ein Tief, etwa ${U(r.tief.von)} bis ${U(r.tief.bis)} Uhr – gut für Routine wie Aufräumen, Nachrichten oder Hochladen.`, stufe: 'idee' })}
    ${r.ideen ? aussage({ text: `Für Einfälle und freies Rumspinnen kann gerade die „falsche“ Zeit helfen, bei dir etwa ${U(r.ideen.von)} bis ${U(r.ideen.bis)} Uhr: Dann ist der Kopf weniger streng.`, stufe: 'abgeleitet', quellen: ['wieth2011'] }) : ''}
    ${sel && sel.von != null ? (r.selbstPasst
      ? `<p>Du sagst, du kannst dich ${esc(sel.text)} am besten konzentrieren – das passt zur Rechnung.</p>`
      : aussage({ text: `Du sagst, du kannst dich ${sel.text} am besten konzentrieren. Die Rechnung sagt etwas anderes. Probier eine Woche lang beides aus und notier, wann es besser lief.`, stufe: 'idee' })) : ''}
    <p class="leise klein">Die Fenster sind grobe Schätzungen aus Durchschnitts-Befunden. Prüf sie an dir.</p>
    <h3>Tipps für deine Tagesplanung</h3>
    <ul class="ia-tipps">
      ${aussage({ tag: 'li', text: 'Leg schwere Denk-Aufgaben – Lernen, Schreiben, Mischen, Planen – in dein Fokus-Fenster.', stufe: 'abgeleitet', quellen: ['schmidt2007'] })}
      ${spaet ? aussage({ tag: 'li', text: 'Morgens raus ins Tageslicht, abends helles Licht dimmen: Das schiebt die innere Uhr nach vorn.', stufe: 'abgeleitet', quellen: ['wright2013'] }) : ''}
      ${frueh ? aussage({ tag: 'li', text: 'Willst du abends länger frisch sein, hilft viel Tageslicht am Nachmittag – und morgens nicht gleich ins grelle Licht.', stufe: 'abgeleitet', quellen: ['wright2013'] }) : ''}
      ${r.sozialerJetlag != null && r.sozialerJetlag >= 1 ? aussage({ tag: 'li', text: 'Steh auch an freien Tagen ungefähr zur gleichen Zeit auf (höchstens eine Stunde später). Das macht den Unterschied zwischen den Tagen kleiner.', stufe: 'abgeleitet', quellen: ['wittmann2006'] }) : ''}
      ${aussage({ tag: 'li', text: 'Termine, die du selbst legst – Sport, Proben, Aufnahmen –, in deine wachen Stunden legen.', stufe: 'idee' })}
      ${aussage({ tag: 'li', text: 'Eine Woche lang notieren, wann Konzentration leicht fiel und wann schwer. Dann weißt du es genauer als jede Rechnung.', stufe: 'idee' })}
    </ul>
    ${r.sozialerJetlag != null ? `<h3>Arbeitstage und freie Tage</h3>
      <p>Deine Schlafmitte verschiebt sich zwischen Tagen mit Termin und freien Tagen um <b>${Dt(r.sozialerJetlag)}</b>. Das nennt man „sozialen Jetlag“ – wie eine kleine Zeitreise jede Woche.</p>
      <p>Du schläfst an freien Tagen etwa <b>${Dt(r.schlafdauerFrei)}</b>, an Tagen mit Termin etwa <b>${Dt(r.schlafdauerArbeit)}</b>.</p>
      ${r.sozialerJetlag >= 2 ? aussage({ text: 'Ein so großer Unterschied heißt meist: Unter der Woche fehlt Schlaf, am Wochenende wird er nachgeholt. Das hängt in Studien mit schlechterem Schlaf und Befinden zusammen.', stufe: 'belegt', quellen: ['wittmann2006'] }) : ''}` : ''}
    ${h.includes('kurz-geschlafen') ? '<p class="hinweis">An Tagen mit Termin schläfst du weniger als 6 Stunden. Wenn du dich oft erschöpft fühlst, sprich mit deiner Hausarztpraxis – Termine vermittelt die <a href="tel:116117">116 117</a>.</p>' : ''}
    ${aussage({ text: 'Die innere Uhr wird in der Jugend immer später, ist um die 20 am spätesten und wird danach langsam wieder früher. Ein später Rhythmus ist darum oft Biologie, nicht Faulheit.', stufe: 'belegt', quellen: ['roenneberg2004'] })}
    ${nichtHeisst([
      li('Kein Typ ist besser. Abendtypen sind nicht fauler, Morgentypen nicht fleißiger.'),
      li('Keine Schlaf-Diagnose. Es sind eigene Fragen, angelehnt an die Schlafmitte nach Roenneberg – nicht der Münchner Chronotyp-Fragebogen selbst.'),
      li('Deine Zeiten sind Schätzungen. Darum zeigt die App die Schlafmitte als Bereich von etwa einer Stunde.')
    ])}
    ${merk()}
    <div class="stapel"><a class="knopf zweit" href="#${B}/rhythmus/eingabe">Zeiten ändern</a><a class="knopf zweit" href="#fragen">Zu allen Fragen</a></div>
    ${ui.fuss()}`;
  return binde(el, {});
}
