// Wie ich ticke – Seiten des Kerns: Start („Dein Weg“), Einstieg, Start-Fragebogen (#los), Fragen-Übersicht, Einstellungen (Daten,
// Quellen, Hinweise), Muster (nur ?test=1).
// Bekommt den Kern über ctx.kern (kein Import von kern.js → kein Kreis).
import { esc, sym, marke, aussage, band, fortschritt, hilfeKarte, fuss, blatt, bestaetige, meldung, datei, dateiWaehlen, datum, fragebogen, SKALA5, merkHinweis as merkBaustein } from './ui.js';

export function zeige(ctx) {
  const [top, unter] = ctx.pfad;
  if (top === 'einstieg') return einstieg(ctx);
  if (top === 'los') return los(ctx);
  if (top === 'fragen') return fragen(ctx);
  if (top === 'einstellungen') {
    if (unter === 'quellen') return quellenSeite(ctx);
    if (unter === 'hinweise') return hinweise(ctx);
    return einstellungen(ctx);
  }
  if (top === 'muster' && ctx.kern.TEST) return muster(ctx);
  return start(ctx);
}

// Alle Fragebögen aller Module, in fester Reihenfolge (KONZEPT §2.2: Reihenfolge fest, damit Ergebnisse vergleichbar bleiben)
const alleFragen = (k) => k.module.flatMap((m) => (m.fragen || []).map((f) => ({ ...f, modul: m.id })));
const merkHinweis = (k, text) => merkBaustein(k.speicher.einwilligung(), text);

// ---------- Start ----------
const KANN = [
  'Deine Persönlichkeit als Bereich zeigen – nicht als Schublade.',
  'Interessen, Tagesrhythmus und Ehrlichkeit einordnen.',
  'Zeigen, was zu dir passt: Stärken immer mit ihren Kosten, Arbeitsweise, Tätigkeiten, Umgang mit dir und anderen.',
  'Kurze tägliche Übungen für Fokus, Ziele, Lernen und Gesundheit.',
  'Deinen Schreibstil spiegeln – lokal, ohne Netz.'
];
const KANN_NICHT = [
  'Keine Diagnose: Sie erkennt keine Krankheiten und tut auch nicht so.',
  'Keine Typ-Schublade (kein „INFP“), keine Lernstile, kein Horoskop.',
  'Keine Garantie: Sie gibt begründete Hinweise – du prüfst, was stimmt.'
];
function start({ el, kern }) {
  const e = kern.einst(), erg = kern.speicher.ergebnisse(), F = alleFragen(kern);
  const begonnen = e.einstieg || Object.keys(erg).length > 0;
  const kannHtml = `<h3>Das kann die App</h3><ul>${KANN.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <h3>Das kann sie nicht</h3><ul>${KANN_NICHT.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const marken = `<p>Jeder Hinweis trägt eine Marke: ${marke('belegt')} ${marke('abgeleitet')} ${marke('idee')} – tippe darauf, dann siehst du, woher er kommt.</p>`;
  if (!begonnen) {
    el.innerHTML = `<h2 class="gross">Wie ich ticke</h2>
      <p class="lead">Versteh dich selbst besser – mit anerkannten Fragebögen und ehrlich in den Grenzen.</p>
      <a class="knopf haupt gross voll" href="#einstieg">Für mich starten</a>
      <p class="leise klein mitte">Etwa 15 Minuten für alles, gern in Etappen. Deine Antworten bleiben auf diesem Gerät.</p>
      <a class="kachel spiel-kachel" href="#spiel">${sym('spiel')}<b>Oder erst spielen: Entweder – oder</b><span>Schnelle Wahlen, Kopfnüsse, Punkte – etwa 4 Minuten</span></a>
      <div class="karte">${kannHtml}</div>
      <div class="karte weich">${marken}</div>
      <p class="leise klein mitte">Live mit Gästen: kommt später.</p>${fuss()}`;
    return;
  }
  const W = kern.weg.status();
  el.innerHTML = `<h2 class="gross">Wie ich ticke</h2>
    ${wegKarte(kern, W)}
    ${merkHinweis(kern)}
    ${heuteKarte(kern)}
    <ul class="kacheln">
      <li class="breit"><a class="kachel spiel-kachel" href="#spiel">${sym('spiel')}<b>Entweder – oder</b><span>Das Spiel: schnelle Wahlen, Kopfnüsse, Profil mit Wahrscheinlichkeiten</span></a></li>
      <li><a class="kachel" href="#profil">${sym('profil')}<b>Profil</b><span>Deine Bereiche auf einen Blick</span></a></li>
      <li><a class="kachel" href="#passt">${sym('passt')}<b>Was passt zu mir</b><span>Stärken, Arbeitsweise, Wachstum</span></a></li>
      <li><a class="kachel" href="#training">${sym('training')}<b>Training</b><span>Kleine Übungen für heute</span></a></li>
      <li><a class="kachel" href="#text">${sym('text')}<b>Text-Spiegel</b><span>Was dein Text verrät – und was nicht</span></a></li>
    </ul>
    <details class="karte"><summary>Alle Fragebögen einzeln</summary>${fragenStand(kern, erg, F)}</details>
    <details class="karte"><summary>Was die App kann und nicht kann</summary>${kannHtml}${marken}</details>${fuss()}`;
  const klick = (ev) => {
    const a = ev.target.closest('[data-weg-auslassen]');
    if (a) { kern.weg.auslassen(a.dataset.wegAuslassen); meldung('Ausgelassen – du kannst es jederzeit nachholen.'); start({ el, kern }); el.querySelector('.weg-liste')?.focus?.(); }
  };
  if (el._startKlick) el.removeEventListener('click', el._startKlick);
  el._startKlick = klick; el.addEventListener('click', klick);
  return () => { el.removeEventListener('click', klick); el._startKlick = null; };
}

// „Dein Weg“: sieben Schritte mit Stand und dem nächsten Knopf (weg.js)
function wegInfo(id, W, kern) {
  const s = W.s[id], st = W.st, vt = W.vt;
  if (id === 'start') return s === 'fertig' ? 'alle vier Teile beantwortet' : st.begonnen ? `${st.erledigt} von ${st.teile.length} Teilen · noch etwa ${st.rest} Min.` : `vier kurze Teile · etwa ${st.minuten} Min.`;
  if (id === 'vertiefung') {
    if (s === 'nicht-noetig') return 'gerade nicht nötig – kein Bereich fällt auf';
    if (s === 'aus') return 'ausgelassen – jederzeit möglich';
    if (s === 'fertig') return 'erledigt';
    if (vt.liste.length && W.s.start === 'fertig') return 'lohnt sich bei: ' + vt.offen.map((b) => kern.weg.BEREICH_NAME[b] || b).join(', ');
    return 'nur wo es sich lohnt';
  }
  if (id === 'text') return s === 'fertig' ? 'erledigt' : s === 'aus' ? 'ausgelassen – jederzeit möglich' : 'freiwillig · vier kurze Texte';
  if (s === 'fertig') return 'erledigt';
  return kern.weg.STUFEN.find((x) => x.id === id).kurz;
}
function wegKarte(kern, W) {
  const naechste = W.naechste;
  const zeilen = kern.weg.STUFEN.map((x, i) => {
    const s = W.s[x.id], jetzt = naechste && naechste.id === x.id;
    const z = kern.weg.ziel(x.id, W);
    const cls = s === 'fertig' ? 'fertig' : s === 'offen' ? (jetzt ? 'jetzt' : '') : 'frei';
    const sr = s === 'fertig' ? 'erledigt' : s === 'aus' ? 'ausgelassen' : s === 'nicht-noetig' ? 'nicht nötig' : jetzt ? 'als Nächstes' : 'offen';
    return `<li class="${cls}"><span class="punkt" aria-hidden="true"></span><span class="weg-text"><a href="#${esc(z.route)}">${i + 1}. ${esc(x.titel)}</a><small>${esc(wegInfo(x.id, W, kern))}</small></span>${s === 'offen' ? `<span class="sr">${sr}</span>` : ''}
      ${x.frei && s === 'offen' && W.s.start === 'fertig' ? `<button type="button" class="knopf zweit klein" data-weg-auslassen="${x.id}" aria-label="${esc(x.titel)} auslassen">Auslassen</button>` : ''}</li>`;
  }).join('');
  const knopf = naechste
    ? `<a class="knopf haupt voll" href="#${esc(naechste.route)}">Weiter: ${esc(naechste.knopf)}</a>`
    : `<p class="weg-geschafft">${sym('haken')} <b>Geschafft – du hast den ganzen Weg einmal durchlaufen.</b> Ab jetzt: jeden Tag ein kleiner Schritt im Training. Wiederhole die Fragebögen in ein paar Monaten, dann siehst du, was sich bewegt.</p>
       <a class="knopf haupt voll" href="#training">${sym('training')} Training für heute</a>`;
  const liste = `<ol class="stand weg-liste" tabindex="-1">${zeilen}</ol>`;
  return `<section class="karte weg" aria-labelledby="weg-t"><h3 id="weg-t">Dein Weg</h3>
    ${fortschritt(W.erledigt / W.gesamt, 'Schritte erledigt')}<p class="leise klein">${W.erledigt} von ${W.gesamt} Schritten erledigt</p>
    ${naechste ? liste + knopf : knopf + `<details class="weg-alle"><summary>Die ${W.gesamt} Schritte ansehen</summary>${liste}</details>`}</section>`;
}
// Richtung aus „Was passt zu mir“ und Training-Serie (ohne Modul-Code: nur Speicher lesen)
const tagText = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function serie(tage) {
  const aktiv = (s) => Array.isArray(tage[s]) && tage[s].length > 0;
  const d = new Date(); d.setHours(12, 0, 0, 0);
  const heute = aktiv(tagText(d)); if (!heute) d.setDate(d.getDate() - 1);
  let n = 0; while (aktiv(tagText(d)) && n < 3660) { n++; d.setDate(d.getDate() - 1); }
  return { n, heute };
}
function heuteKarte(kern) {
  const w = kern.speicher.ergebnis('passt.wachstum'), tage = kern.speicher.lies('training', 'tage', {}) || {};
  const se = serie(tage), zeilen = [];
  if (w && w.schema === 1 && w.titel) zeilen.push(`<li><a class="zeile" href="#training/wachsen"><span><b>Deine Richtung: ${esc(w.titel)}</b><small>Kleine Herausforderungen im Training</small></span><span class="rechts">${sym('weiter')}</span></a></li>`);
  if (se.n > 0) zeilen.push(`<li><a class="zeile" href="#training"><span><b>Training: ${se.n} ${se.n === 1 ? 'Tag' : 'Tage'} in Folge</b><small>${se.heute ? 'Heute schon geschafft' : 'Heute noch offen'}</small></span><span class="rechts">${sym('weiter')}</span></a></li>`);
  return zeilen.length ? `<ul class="zeilen">${zeilen.join('')}</ul>` : '';
}
// Alle Fragebögen einzeln (mit „genauer“ bzw. Hinweis auf die Antwort-Qualität)
function fragenStand(kern, erg, F) {
  const zeile = (ok, titel, href, rechts, extra = '') => `<li class="${ok ? 'fertig' : ''}"><span class="punkt" aria-hidden="true"></span><a href="${href}">${esc(titel)}</a><span class="leise klein">${ok ? '– ' + esc(rechts) : ''}${extra}</span><span class="sr">${ok ? 'erledigt' : 'offen'}</span></li>`;
  const bf = erg.bigfive;
  const bfExtra = bf ? `${bf.form === 'vertieft' ? ' · genauer' : ''}${bf.qualitaet && bf.qualitaet.fraglich ? ' <span class="gelb-punkt" title="noch einmal in Ruhe?"></span><span class="sr"> – vielleicht noch einmal in Ruhe ausfüllen</span>' : ''}` : '';
  return `<ul class="stand">${F.map((f) => zeile(!!erg[f.ergebnis], f.titel, '#' + f.route, 'am ' + datum(erg[f.ergebnis] && erg[f.ergebnis].zeit), f.ergebnis === 'bigfive' ? bfExtra : '')).join('')}</ul>
    <p class="mitte"><a class="link" href="#fragen">Zur Übersicht „Fragen“</a></p>`;
}

// ---------- Start-Fragebogen (#los): vier Teile in fester Reihenfolge, Fortschritt, Pause, später weiter ----------
function los({ el, kern }) {
  const male = () => {
    const st = kern.weg.start(), T = st.teile, n = st.naechster, u16 = kern.einst().alter === 'u16';
    const zeile = (t, i) => `<li><a class="zeile" href="#${esc(t.fertig ? t.route : t.bogen)}" data-los-teil><span><b>${i + 1}. ${esc(t.titel)}</b><small>${
      t.fertig ? 'fertig' + (t.vertieft ? ' · genauer' : '') : t.ausgelassen ? 'ausgelassen' : t.n ? `${t.n} von ${t.anzahl}` : `${t.anzahl > 1 ? t.anzahl + ' kurze Sätze' : 'ein paar Angaben'}`}</small></span><span class="rechts">${t.fertig ? sym('haken') : esc(t.dauer || '')}${sym('weiter')}</span></a></li>`;
    if (st.fertig) {
      el.innerHTML = `<h2>Start-Fragebogen geschafft</h2>
        <p class="lead">Danke fürs Mitmachen! Als Nächstes siehst du deine Profil-Karte – mit Bereichen statt Punkten und ehrlichen Grenzen.</p>
        ${fortschritt(1, 'Start-Fragebogen')}
        <a class="knopf haupt gross voll" href="#profil">${sym('profil')} Weiter: Deine Profil-Karte</a>
        <ol class="zeilen los-teile" aria-label="Die vier Teile">${T.map(zeile).join('')}</ol>
        ${merkHinweis(kern, 'Deine Ergebnisse sind nicht gemerkt und beim Neuladen oder Schließen weg.')}${fuss()}`;
      return;
    }
    el.innerHTML = `<h2>Start-Fragebogen</h2>
      <p class="lead">${st.begonnen ? `${st.erledigt} von ${T.length} Teilen geschafft – noch etwa ${Math.max(1, st.rest)} ${st.rest === 1 ? 'Minute' : 'Minuten'}.` : `Vier kurze Teile, etwa ${st.minuten} Minuten. Danach siehst du deine Profil-Karte.`}</p>
      ${fortschritt(st.anteil, 'Start-Fragebogen')}
      ${u16 ? '<p class="hinweis">Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm alle Ergebnisse als Momentaufnahme.</p>' : ''}
      <button type="button" class="knopf haupt gross voll" data-los="weiter">${st.begonnen ? 'Weiter' : 'Los geht’s'}: ${esc(n.titel)}</button>
      ${st.begonnen ? `<a class="knopf zweit voll" href="#start">Pause – später weitermachen</a>` : ''}
      <ol class="zeilen los-teile" aria-label="Die vier Teile">${T.map(zeile).join('')}</ol>
      ${!n.pflicht && st.begonnen ? `<p class="mitte"><button type="button" class="link" data-los="auslassen">„${esc(n.titel)}“ auslassen</button></p>` : ''}
      <p class="leise klein">Antworte, wie du <b>meistens</b> bist – nicht, wie du gern wärst. Es gibt kein Richtig oder Falsch. Die Reihenfolge ist fest, damit spätere Wiederholungen vergleichbar bleiben. Pause geht jederzeit.</p>
      ${merkHinweis(kern, kern.speicher.einwilligung() ? '' : 'Dein Stand ist beim Neuladen oder Schließen weg.')}${fuss()}`;
  };
  male();
  const klick = (ev) => {
    if (ev.target.closest('[data-los-teil]')) { kern.weg.beginneStart(); return; }   // Link führt in den Teil
    const b = ev.target.closest('[data-los]'); if (!b) return;
    const st = kern.weg.start(), n = st.naechster; if (!n) return;
    if (b.dataset.los === 'weiter') { kern.weg.beginneStart(); kern.geh(n.bogen); }
    else if (b.dataset.los === 'auslassen') { kern.weg.auslassen(n.ergebnis); meldung(`„${n.titel}“ ausgelassen – du kannst ihn jederzeit nachholen.`); male(); el.querySelector('[data-los=weiter],a.knopf.haupt')?.focus(); }
  };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', male);
  return () => { el.removeEventListener('click', klick); aus(); };
}

// ---------- Einstieg (etwa 30 Sekunden) ----------
const ALTER = [['u16', 'unter 16'], ['16-17', '16–17'], ['18+', 'ab 18'], ['', 'sag ich lieber nicht']];
function einstieg({ el, kern }) {
  let alter = kern.einst().alter || '';
  const male = () => {
    el.innerHTML = `<h2>Für mich</h2>
      <p class="lead">Das ist Selbstreflexion – keine Diagnose und keine Garantie. Deine Antworten bleiben auf diesem Gerät.</p>
      <h3 id="alter-t">Wie alt bist du?</h3><p class="leise klein">Freiwillig. Nur damit die Texte zu dir passen.</p>
      <div class="chips" role="radiogroup" aria-labelledby="alter-t">${ALTER.map(([w, t]) => `<button type="button" class="chip" role="radio" aria-checked="${alter === w}" data-alter="${w}">${esc(t)}</button>`).join('')}</div>
      ${alter === 'u16' ? '<p class="hinweis">Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm alle Ergebnisse als Momentaufnahme.</p>' : ''}
      <h3>So geht es weiter</h3>
      <p>Zuerst ein Start-Fragebogen mit vier kurzen Teilen (etwa 7 Minuten), dann deine Profil-Karte. Genauer wird es nur, wo es sich lohnt. Danach: was zu dir passt und kleine Übungen für jeden Tag.</p>
      <h3>Sollen deine Antworten gemerkt werden?</h3>
      <p>Nur auf diesem Gerät, nichts geht ins Netz. Löschen geht jederzeit mit einem Knopf.</p>
      <div class="stapel"><button type="button" class="knopf haupt gross" data-los="ja">${sym('schloss')} Ja, auf diesem Gerät merken</button>
      <button type="button" class="knopf zweit" data-los="nein">Nein, nur für jetzt</button></div>
      <p class="leise klein">Ohne Merken ist alles weg, sobald du die Seite neu lädst oder schließt.</p>${fuss()}`;
  };
  male();
  const klick = (e) => {
    const c = e.target.closest('[data-alter]');
    if (c) { alter = c.dataset.alter; male(); el.querySelector(`[data-alter="${alter}"]`).focus(); return; }
    const l = e.target.closest('[data-los]'); if (!l) return;
    if (l.dataset.los === 'ja') kern.speicher.setzeEinwilligung(true);
    kern.setzeEinst({ einstieg: true, alter: alter || null });
    kern.geh('los');
  };
  el.addEventListener('click', klick);
  return () => el.removeEventListener('click', klick);
}

// ---------- Fragen-Übersicht ----------
function fragen({ el, kern }) {
  const erg = kern.speicher.ergebnisse(), F = alleFragen(kern);
  el.innerHTML = `<h2>Fragen</h2>
    <p>Eine Frage pro Bildschirm, jederzeit zurück. Es gibt kein Richtig oder Falsch: Antworte, wie du <b>meistens</b> bist – nicht, wie du gern wärst.</p>
    ${kern.weg.start().fertig ? '' : `<a class="karte akzent" href="#los">${sym('fragen')}<span><b>Start-Fragebogen</b><br><span class="klein leise">Alle vier Teile hintereinander, mit Pause – etwa 7 Minuten</span></span><span class="rechts">${sym('weiter')}</span></a>`}
    <ol class="zeilen">${F.map((f) => { const r = erg[f.ergebnis];
      return `<li><a class="zeile" href="#${esc(f.route)}"><span><b>${esc(f.titel)}</b><small>${esc(f.kurz || '')}</small></span><span class="rechts">${r ? sym('haken') + ' ' + esc(datum(r.zeit)) : esc(f.dauer || '')}${sym('weiter')}</span></a></li>`; }).join('')}</ol>
    <p class="leise klein">Die Reihenfolge ist fest, damit spätere Wiederholungen vergleichbar bleiben. Pausen sind jederzeit möglich.</p>
    <a class="karte akzent" href="#spiel">${sym('spiel')}<span><b>Entweder – oder</b><br><span class="klein leise">Das Spiel: immer zwei Aussagen, eine Wahl – mit Kopfnüssen, etwa 4 Minuten</span></span><span class="rechts">${sym('weiter')}</span></a>
    ${merkHinweis(kern)}
    <a class="knopf zweit voll" href="#profil">Zum Profil</a>${fuss()}`;
}

// ---------- Einstellungen ----------
const SCHRIFT = [[1, 'Normal'], [1.15, 'Größer'], [1.3, 'Sehr groß']];
function einstellungen({ el, kern }) {
  const S = kern.speicher;
  const male = async () => {
    const e = kern.einst(), an = S.einwilligung(), n = S.anzahl(), kb = Math.max(1, Math.round(S.groesse() / 1024));
    el.innerHTML = `<h2>Einstellungen</h2>
      <h3>Deine Daten</h3>
      <div class="karte">
        <div class="schalter"><label for="einw"><b>Auf diesem Gerät merken</b><br><span class="leise klein">${an ? 'An: Antworten und Ergebnisse bleiben in diesem Browser.' : 'Aus: Alles ist beim Neuladen oder Schließen weg.'}</span></label><input type="checkbox" role="switch" id="einw" ${an ? 'checked' : ''}></div>
        <p class="leise klein">${n} ${n === 1 ? 'Ergebnis' : 'Ergebnisse'} · etwa ${kb} KB · Nichts wird gesendet. Die Sicherungs-Datei enthält auch deine Texte aus dem Text-Spiegel – bewahre sie gut auf.</p>
        <div class="stapel">
          <button type="button" class="knopf" id="export">${sym('sichern')} Als Datei sichern</button>
          <button type="button" class="knopf zweit" id="import">${sym('laden')} Sicherung laden</button>
          <button type="button" class="knopf gefahr" id="loeschen">${sym('loeschen')} Alles löschen</button>
        </div>
      </div>
      <h3>Anzeige</h3>
      <div class="karte"><p id="schrift-t"><b>Schriftgröße</b></p>
        <div class="chips" role="radiogroup" aria-labelledby="schrift-t">${SCHRIFT.map(([w, t]) => `<button type="button" class="chip" role="radio" aria-checked="${Number(e.schrift) === w}" data-schrift="${w}">${t}</button>`).join('')}</div>
        <p class="leise klein">Hell oder dunkel folgt deinem Gerät.</p></div>
      <h3>Mehr</h3>
      <ul class="zeilen"><li><a class="zeile" href="#einstellungen/quellen"><span><b>Quellen</b><small>Woher jede Aussage kommt</small></span><span class="rechts">${sym('weiter')}</span></a></li>
        <li><a class="zeile" href="#einstellungen/hinweise"><span><b>Hinweise und Grenzen</b><small>Keine Diagnose, Datenschutz, Hilfe</small></span><span class="rechts">${sym('weiter')}</span></a></li></ul>
      <p class="leise klein">Fassung ${esc(kern.VERSION)} · <span id="offline">Offline: wird geprüft …</span></p>${fuss()}`;
    const o = await kern.offlineBereit(); const os = el.querySelector('#offline'); if (os) os.textContent = o ? 'Offline bereit' : 'Offline noch nicht bereit';
  };
  male();
  const klick = async (ev) => {
    const t = ev.target;
    const sch = t.closest('[data-schrift]');
    if (sch) { kern.setzeEinst({ schrift: Number(sch.dataset.schrift) }); await male(); el.querySelector(`[data-schrift="${sch.dataset.schrift}"]`)?.focus(); return; }
    if (t.closest('#export')) {
      const name = 'wie-ich-ticke-' + new Date().toISOString().slice(0, 10) + '.json';
      const r = await datei(name, JSON.stringify(S.export(), null, 2), 'application/json');
      if (r !== 'abgebrochen') meldung('Datei erstellt: ' + name);
      return;
    }
    if (t.closest('#import')) {
      const text = await dateiWaehlen(); if (!text) return;
      let obj; try { obj = JSON.parse(text); } catch { meldung('Die Datei ist keine gültige Sicherung.'); return; }
      if (!(await bestaetige({ titel: 'Sicherung laden?', text: 'Deine aktuellen Daten in der App werden durch die Sicherung ersetzt.', ja: 'Laden' }))) return;
      try { S.import(obj); meldung(S.einwilligung() ? 'Sicherung geladen.' : 'Sicherung geladen – nur für jetzt. Zum Behalten: „Auf diesem Gerät merken“ einschalten.', S.einwilligung() ? undefined : 6000); male(); } catch (f) { meldung(f.message, 5000); }
      return;
    }
    if (t.closest('#loeschen')) {
      if (!(await bestaetige({ titel: 'Alles löschen?', text: 'Alle Antworten, Ergebnisse, Texte und Fortschritte dieser App werden von diesem Gerät gelöscht. Das lässt sich nicht rückgängig machen.', ja: 'Alles löschen', gefahr: true }))) return;
      await S.allesLoeschen(); meldung('Alles gelöscht.'); kern.geh('start');
    }
  };
  const wechsel = async (ev) => {
    if (ev.target.id !== 'einw') return;
    if (ev.target.checked) { S.setzeEinwilligung(true); meldung('Gemerkt – nur auf diesem Gerät.'); }
    else if (await bestaetige({ titel: 'Nicht mehr merken?', text: 'Die gespeicherte Kopie wird vom Gerät gelöscht. Bis du die Seite neu lädst oder schließt, bleibt alles noch da.', ja: 'Vom Gerät löschen' })) { S.setzeEinwilligung(false); meldung('Vom Gerät gelöscht.'); }
    male();
  };
  el.addEventListener('click', klick); el.addEventListener('change', wechsel);
  return () => { el.removeEventListener('click', klick); el.removeEventListener('change', wechsel); };
}

// ---------- Quellen ----------
function quellenSeite({ el, kern, titel }) {
  titel('Quellen');
  el.innerHTML = '<h2>Quellen</h2><p class="leise">Lädt …</p>';
  kern.quellen().then((Q) => {
    if (!el.isConnected || kern.route().pfad[1] !== 'quellen') return;
    const gruppe = (titel, q) => { const e = Object.entries(q || {}); if (!e.length) return '';
      return `<h3>${esc(titel)}</h3><ul class="quellen">${e.map(([id, v]) => `<li id="q-${esc(id)}">${esc(v.text)}${v.notiz ? `<br><span class="leise">${esc(v.notiz)}</span>` : ''}${v.url ? `<br><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">Quelle öffnen</a> <span class="leise klein">(fremde Seite)</span>` : ''}</li>`).join('')}</ul>`; };
    el.innerHTML = `<h2>Quellen</h2>
      <div class="karte">${['belegt', 'abgeleitet', 'idee'].map((s) => `<p>${marke(s)} <b>${esc(Q.STUFEN[s].kurz)}.</b> ${esc(Q.STUFEN[s].text)}</p>`).join('')}</div>
      ${gruppe('Grundlagen', Q.nachModul.kern)}
      ${kern.module.map((m) => gruppe(m.name, Q.nachModul[m.id])).join('')}
      <p class="leise klein">Links führen zu fremden Seiten (meist doi.org). Die App selbst sendet nichts.</p>${fuss()}`;
  }).catch(() => { el.innerHTML = '<h2>Quellen</h2><p>Die Quellen konnten nicht geladen werden.</p>'; });
}

// ---------- Hinweise und Grenzen ----------
function hinweise({ el, titel }) {
  titel('Hinweise und Grenzen');
  el.innerHTML = `<h2>Hinweise und Grenzen</h2>
    <div class="karte"><h3>Keine Diagnose</h3>
      <p>„Wie ich ticke“ ist Selbstreflexion. Die App stellt keine Diagnose, erkennt keine Krankheiten und ersetzt keine Ärztin, keinen Arzt und keine Psychotherapie.</p>
      <p>Wenn es dir nicht gut geht, sprich mit einer Fachperson. Erste Anlaufstelle ist die Hausarztpraxis; Termine vermittelt die 116 117.</p></div>
    <div class="karte"><h3>Was die Marken heißen</h3>
      ${aussage({ text: 'Direkt aus der Forschung.', stufe: 'belegt' })}
      ${aussage({ text: 'Aus der Forschung übertragen, so aber nicht eigens geprüft.', stufe: 'abgeleitet' })}
      ${aussage({ text: 'Zum Ausprobieren, nicht geprüft.', stufe: 'idee' })}</div>
    <div class="karte"><h3>Bereiche statt Punkte</h3>
      <p>Jede Messung hat einen Messfehler – auch ein guter Fragebogen. Darum zeigt die App einen Bereich: Dort liegt dein Wert sehr wahrscheinlich. Ein breiter Bereich heißt: Hier ist die Messung unsicherer.</p>
      ${band({ name: 'Beispiel', unten: 52, oben: 66, wort: 'eher höher als die meisten', links: 'niedriger', rechts: 'höher' })}
      <p class="leise klein">Die Fragen sind eigene deutsche Übersetzungen frei nutzbarer Fragebögen (IPIP und O*NET Interest Profiler). Deutsche Vergleichswerte fehlen noch, darum gilt jeder Vergleich als vorläufig.</p></div>
    <div class="karte"><h3>Deine Daten</h3><ul>
      <li>Alles wird auf deinem Gerät berechnet. Es gibt keine Anmeldung, keine Werbung und keine Analyse-Werkzeuge.</li>
      <li>Gespeichert wird nur, wenn du „Auf diesem Gerät merken“ wählst – und nur in diesem Browser.</li>
      <li>Sichern als Datei und „Alles löschen“ findest du in den Einstellungen.</li>
      <li>„Mit Claude tiefer lesen“ erzeugt nur einen Text zum Kopieren. Ob und wohin du ihn einfügst, entscheidest du selbst.</li>
      <li>iPhone: Leg die App auf den Home-Bildschirm (Teilen → „Zum Home-Bildschirm“). Sonst kann Safari gespeicherte Daten nach einigen Tagen ohne Besuch löschen.</li></ul></div>
    <div class="karte"><h3>Was bewusst fehlt</h3><ul>
      <li>Typen wie bei MBTI („16 Typen“): Sie sind wenig stabil – bei einer Wiederholung bekommt ein großer Teil einen anderen Typ. ${marke('belegt', ['pittenger2005'])}</li>
      <li>Lernstile („visuell“, „auditiv“): Dass Lernen nach dem eigenen Lernstil besser klappt, ist nicht nachgewiesen. ${marke('belegt', ['pashler2008'])}</li>
      <li>Horoskope: Im Doppelblind-Test trafen sie nicht besser als der Zufall. ${marke('belegt', ['carlson1985'])} Für Tarot gibt es keinen Beleg.</li>
      <li>Tests auf Krankheiten wie ADHS, Depression, Angst oder Zwang.</li></ul></div>
    ${hilfeKarte()}${fuss()}`;
}

// ---------- Muster (nur mit ?test=1): alle Bausteine auf einer Seite ----------
function muster({ el, kern }) {
  el.innerHTML = `<h2>Muster</h2><p class="leise">Nur zum Testen (?test=1). Bausteine aus ui.js.</p>
    <h3>Marken</h3><p>${marke('belegt', ['dunlosky2013'])} ${marke('abgeleitet', ['soto2019'])} ${marke('idee')}</p>
    ${aussage({ text: 'Sich selbst abfragen hilft beim Lernen mehr als Wiederlesen.', stufe: 'belegt', quellen: ['dunlosky2013'] })}
    ${aussage({ text: 'Du arbeitest gern konzentriert allein.', stufe: 'abgeleitet', quellen: ['soto2019'], kosten: 'Lange Gruppen-Runden kosten dich mehr Kraft.' })}
    <h3>Bänder</h3>
    ${band({ name: 'Offenheit', unten: 54, oben: 68, wort: 'eher höher als die meisten', links: 'bewährt', rechts: 'neugierig' })}
    ${band({ name: 'Extraversion', unten: 28, oben: 40, wort: 'deutlich niedriger als die meisten', links: 'ruhiger', rechts: 'geselliger' })}
    ${band({ name: 'Kurzform (grob)', unten: 40, oben: 64, wort: 'im Mittelfeld', links: 'niedriger', rechts: 'höher', grob: true })}
    <h3>Fortschritt</h3>${fortschritt(0.4)}
    <h3>Karten</h3><div class="karte gruen"><b>Deine Stärken</b><p>grün</p></div><div class="karte gelb"><b>Hier lohnt ein genauerer Blick</b><p>gelb</p></div>
    ${hilfeKarte()}
    <h3>Fragebogen</h3><div id="fb" class="karte"></div><p id="fb-aus" class="leise klein"></p>
    <h3>Blatt</h3><button type="button" class="knopf" id="blatt-probe">Blatt öffnen</button>${fuss()}`;
  const fb = fragebogen(el.querySelector('#fb'), {
    titel: 'Probe', fragen: [{ id: 'p1', text: 'Ich gehe gern auf Menschen zu.' }, { id: 'p2', text: 'Ich plane gern voraus.', hilfe: 'Denk an die letzten Wochen.' }, { id: 'p3', text: 'Wann stehst du an freien Tagen auf?', typ: 'zeit' }],
    skala: SKALA5, fertig: (a) => { el.querySelector('#fb-aus').textContent = 'Fertig: ' + JSON.stringify(a); }
  });
  const b = el.querySelector('#blatt-probe');
  b.onclick = () => blatt('<p>Ein Blatt mit Knöpfen.</p><div class="reihe"><button class="knopf" data-w="a">A</button><button class="knopf haupt" data-w="b">B</button></div>', { titel: 'Probe' }).then((w) => meldung('Blatt: ' + w));
  return () => fb.zerstoere();
}
