// Modul spiel – „Entweder – oder“: Zwangswahl-Spiel in 4 Levels + Bonus, Profil mit Wahrscheinlichkeiten, Seite „So funktioniert’s“.
// Vertrag: ARCH.md §2. Routen: spiel (Übersicht) · spiel/runde (Spiel) · spiel/ergebnis · spiel/so.
// Speicher (nur über kern.speicher, Modul 'spiel'): lauf = { id, saat, i, antworten: {schritt: {w: 'a'|'b', l: links?, ms}}, quittiert, bonus, ende, aufl }.
// aufl = id der Kopfnuss, deren Auflösung gerade offen ist (übersteht Neuladen und Pause; „Weiter“ löscht sie).
// Ergebnis 'spiel' (rechnen.js auswerten). Nichts wird gesendet.
import { kern } from '../../kern.js';
import { BEREICHE, BEREICH, LEVEL, ABLAUF, SCHRITT, TYPEN, PFLICHT_ANZAHL } from './daten.js';
import * as R from './rechnen.js';

const M = 'spiel';
const sp = kern.speicher;
const ui = kern.ui;
const { esc, sym, marke } = ui;
const RUHIG = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const pz = (p) => Math.round(p * 100) + ' %';
const zahl = (x, n = 1) => Number(x).toLocaleString('de-DE', { minimumFractionDigits: n, maximumFractionDigits: n });
const LEVEL_START = LEVEL.map((L) => ABLAUF.findIndex((s) => s.level === L.nr));

// ---------- Lauf ----------
const lauf = () => sp.lies(M, 'lauf', null);
const speichere = (l) => sp.schreib(M, 'lauf', l);
function neuerLauf() {
  const q = new URLSearchParams(location.search), fest = kern.TEST && q.get('saat');
  const l = { id: new Date().toISOString(), saat: fest ? Number(fest) >>> 0 : (Math.random() * 4294967295) >>> 0, i: 0, antworten: {}, quittiert: 0, bonus: null, ende: null, aufl: null };
  speichere(l); return l;
}
const laeuft = (l) => !!(l && !l.ende && l.i > 0);
function abschliessen(l) {
  l.ende = new Date().toISOString(); speichere(l);
  const res = R.auswerten(l.antworten, { saat: l.saat, start: l.id, ende: l.ende });
  res.lauf = l.id;
  const alt = sp.ergebnis(M);
  sp.setzeErgebnis(M, res, { ersetzen: !!(alt && alt.lauf === l.id) });
  return res;
}

// ---------- kleine Bausteine ----------
const STERN = 'M12 2.8l2.85 5.8 6.4.93-4.63 4.5 1.1 6.37L12 17.4l-5.72 3l1.1-6.37-4.63-4.5 6.4-.93z';
const sterneSvg = (n) => `<div class="sp-sterne" role="img" aria-label="${n} von 3 Sternen">${[1, 2, 3].map((i) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="${i <= n ? 'sp-stern-an' : 'sp-stern-aus'}" d="${STERN}" stroke-width="1.6" stroke-linejoin="round"/></svg>`).join('')}</div>`;
const medaille = `<span class="sp-medaille" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${STERN}" fill="currentColor"/></svg></span>`;
const SATZ = {
  offenheit: ['Du suchst eher Neues.', 'Du bleibst eher beim Vertrauten.'],
  gewissenhaftigkeit: ['Du gehst eher geplant und gründlich vor.', 'Du gehst eher spontan und locker vor.'],
  extraversion: ['Du bist eher gesellig und aktiv.', 'Du bist eher ruhig und gern für dich.'],
  vertraeglichkeit: ['Du bist eher rücksichtsvoll und mitfühlend.', 'Du bist eher direkt und kritisch.'],
  stabilitaet: ['Du bleibst eher gelassen.', 'Du spürst Stress eher stärker.']
};
function satz(id, b) {
  if (!b.stufe) return 'Ungefähr in der Mitte: Beide Seiten sprechen dich ähnlich an.';
  return `${b.stufe === 2 ? 'Ziemlich sicher' : 'Wahrscheinlich'}: ${SATZ[id][b.richtung > 0 ? 0 : 1]}`;
}
function konfetti() {
  if (RUHIG()) return null;
  const d = document.createElement('div'); d.className = 'sp-konfetti'; d.setAttribute('aria-hidden', 'true');
  const F = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  d.innerHTML = Array.from({ length: 28 }, (_, i) => `<i style="left:${(i * 37) % 100}%;background:${F[i % F.length]};--dx:${((i * 53) % 60) - 30}vw;--rot:${(i * 97) % 720}deg;animation-delay:${(i % 7) * 0.05}s"></i>`).join('');
  document.body.append(d); setTimeout(() => d.remove(), 2200);
  return d;
}
const HINWEIS = { paar: 'Nimm, was eher stimmt – auch wenn beides oder keins ganz passt.', wieder: 'Nimm, was eher stimmt – auch wenn beides oder keins ganz passt.', kette: 'Nimm, was eher stimmt – auch wenn beides oder keins ganz passt.',
  kontrolle: 'Genau lesen!', leicht: 'Schnell und leicht.', kopf: 'Erst denken, dann tippen.', duell: 'Egal, ob du es kannst.' };
const ZURUECK_OK = new Set(['paar', 'wieder', 'kette', 'duell']);
// Im Spiel selbst sichtbar, solange nichts gemerkt wird: Neuladen (Safari tut das im Hintergrund oft) fängt sonst still von vorn an.
const merkKnopf = () => (sp.einwilligung() ? '' : `<button type="button" class="sp-merk" data-aktion="merken" aria-label="Nicht gemerkt: Neuladen oder Schließen startet das Spiel wieder bei Wahl 1. Antippen, um auf diesem Gerät zu merken.">${sym('schloss')}<span>Nicht gemerkt</span></button>`);

// ---------- Spiel ----------
function runde(ctx) {
  const { el } = ctx;
  ctx.titel('Entweder – oder'); ctx.zurueckZu('spiel');
  let l = lauf(); if (!l || l.ende) l = neuerLauf();
  let gesperrt = true, tZeig = 0, versteckt = false, schritt = null, modus = 'wahl';
  const timer = new Set();
  const spaeter = (fn, ms) => { const t = setTimeout(() => { timer.delete(t); if (ctx.aktuell()) fn(); }, ms); timer.add(t); };
  const sichtbar = () => { if (document.visibilityState === 'hidden') versteckt = true; };

  function male() {
    l = lauf() || l;
    // Offene Auflösung einer Kopfnuss (z. B. nach Neuladen oder Pause): erst die Auflösung, dann weiter
    if (l.aufl) {
      const k = l.i > 0 ? ABLAUF[l.i - 1] : null, a = k && l.antworten[k.id];
      if (k && k.id === l.aufl && a) { zeige(k, l.i - 1); aufloesung(k, a.w === k.richtig); return; }
      l.aufl = null; speichere(l);
    }
    if (l.i >= ABLAUF.length || (l.i >= PFLICHT_ANZAHL && l.bonus === false)) { abschliessen(l); kern.geh('spiel/ergebnis', { ersetzen: true }); return; }
    const s = ABLAUF[l.i];
    if (s.level > 1 && l.i === LEVEL_START[s.level - 1] && (l.quittiert || 0) < s.level - 1) return ende(s.level - 1);
    zeige(s);
  }

  // s = Schritt, ix = seine Stelle im Ablauf (Standard: der nächste offene)
  function zeige(s, ix = l.i) {
    const fa = document.activeElement, fokus = fa && el.contains(fa) ? (fa.classList.contains('sp-links') ? '.sp-links' : fa.classList.contains('sp-rechts') ? '.sp-rechts' : fa.closest('.sp-aufl,.sp-ende,[data-sp]') ? '.sp-links' : null) : null;
    schritt = s; modus = 'wahl'; gesperrt = true; versteckt = document.visibilityState === 'hidden';
    const L = LEVEL[s.level - 1], bonus = !!L.bonus;
    const links = R.seiteA(s, l.saat) === 'l' ? 'a' : 'b', rechts = links === 'a' ? 'b' : 'a';
    const nr = bonus ? ix - PFLICHT_ANZAHL + 1 : ix + 1, von = bonus ? ABLAUF.length - PFLICHT_ANZAHL : PFLICHT_ANZAHL;
    const p = R.punkte(l.antworten);
    const vorher = ix > 0 ? ABLAUF[ix - 1] : null;
    const zurueckGeht = vorher && vorher.level === s.level && ZURUECK_OK.has(vorher.art);
    el.innerHTML = `<section class="sp sp-spiel sp-${L.farbe}${RUHIG() ? '' : ' sp-rein'}" aria-labelledby="sp-h">
      <div class="sp-kopf"><h2 id="sp-h"><span class="sp-lv" aria-hidden="true">${L.nr}</span> <span>${bonus ? esc(L.name) : `Level ${L.nr} · ${esc(L.name)}`}</span></h2>${merkKnopf()}</div>
      <div class="sp-stand"><div class="sp-balken" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="${von}" aria-valuenow="${nr - 1}" aria-valuetext="Wahl ${nr} von ${von}"><span style="width:${Math.round(((nr - 1) / von) * 100)}%"></span></div>
        <span class="sp-punkte">${p} <span class="klein">Punkte</span></span></div>
      <p class="sp-frage" id="sp-frage">${esc(s.frage)}</p>
      <div class="sp-paar" role="group" aria-labelledby="sp-frage" data-schritt="${esc(s.id)}">
        <button type="button" class="sp-wahl sp-links" data-wahl="${links}"><span>${esc(s[links].t)}</span></button>
        <span class="sp-oder" aria-hidden="true">oder</span>
        <button type="button" class="sp-wahl sp-rechts" data-wahl="${rechts}"><span>${esc(s[rechts].t)}</span></button>
      </div>
      <div class="sp-unten">
        <button type="button" class="knopf zweit klein" data-sp="zurueck"${zurueckGeht ? '' : ' disabled'}>Eine zurück</button>
        <span class="leise">${esc(HINWEIS[s.art] || '')}</span>
        <a class="knopf zweit klein" href="#spiel">Pause</a>
      </div></section>`;
    if (fokus) el.querySelector(fokus)?.focus({ preventScroll: true });
    requestAnimationFrame(() => { tZeig = performance.now(); });
    // Doppeltipp-Sperre wie im Fragebogen (350 ms); danach data-bereit (für Tests und Hilfsmittel)
    spaeter(() => { gesperrt = false; const g = el.querySelector('.sp-paar'); if (g) g.dataset.bereit = '1'; }, kern.TEST ? 120 : 350);
  }

  function waehle(w, knopf) {
    if (gesperrt || modus !== 'wahl' || !schritt) return;
    gesperrt = true; modus = 'warte';   // bis die nächste Frage steht: kein zweites Tippen, kein „Eine zurück“
    const s = schritt, ms = versteckt || !tZeig ? null : Math.round(performance.now() - tZeig);
    const links = R.seiteA(s, l.saat) === 'l';
    l.antworten[s.id] = { w, l: (w === 'a') === links, ms };
    l.i += 1; if (s.art === 'kopf') l.aufl = s.id;   // Auflösung bleibt offen, bis „Weiter“ getippt ist
    speichere(l);
    const richtig = s.richtig ? w === s.richtig : null;
    let plus = 10; if (richtig && (s.art === 'kontrolle' || s.art === 'leicht')) plus += 20; if (richtig && s.art === 'kopf') plus += 30;
    const g = el.querySelector('.sp-paar'); if (g) delete g.dataset.bereit;
    if (knopf) {
      knopf.classList.add('sp-ja');
      el.querySelectorAll('.sp-wahl').forEach((b) => { if (b !== knopf) b.classList.add('sp-nein'); b.setAttribute('aria-disabled', 'true'); });
      if (!RUHIG()) { const x = document.createElement('span'); x.className = 'sp-plus'; x.textContent = '+' + (s.art === 'kopf' ? 10 : plus); x.setAttribute('aria-hidden', 'true'); knopf.append(x); }
    }
    const pk = el.querySelector('.sp-punkte'); if (pk) pk.firstChild.textContent = R.punkte(l.antworten) + ' ';
    if (s.art === 'kopf') { spaeter(() => aufloesung(s, richtig), RUHIG() ? 60 : 420); return; }
    if (s.art === 'kontrolle' || s.art === 'leicht') {
      const text = richtig ? (s.art === 'kontrolle' ? 'Adlerauge! +20' : 'Klar! +20') : 'Hoppla!';
      if (g && !RUHIG()) { const b = document.createElement('span'); b.className = 'sp-blitz'; b.textContent = text; b.setAttribute('role', 'status'); g.append(b); } else ui.meldung(text, 1400);
      spaeter(male, RUHIG() ? 120 : 700); return;
    }
    spaeter(male, RUHIG() ? 80 : 380);
  }

  function aufloesung(s, richtig) {
    modus = 'aufl';
    const box = el.querySelector('.sp-paar'), unten = el.querySelector('.sp-unten'), frage = el.querySelector('.sp-frage');
    if (!box) return male();
    if (unten) unten.remove();
    if (frage) frage.textContent = s.frage;
    box.outerHTML = `<div class="sp-aufl${richtig ? '' : ' sp-erwischt'}" role="status">
      <p class="sp-gross">${richtig ? 'Richtig!' : 'Erwischt!'}</p>
      <p>${esc(s.aufloesung)}</p>
      <p class="klein">${richtig ? '+30 Punkte für die Kopf-Bremse.' : 'Kein Problem – genau so funktionieren diese Fallen. Das Gehirn spart Arbeit.'} ${marke(s.beleg || 'belegt', s.quellen || [])}</p>
      <button type="button" class="knopf haupt gross voll" data-sp="weiter">Weiter</button></div>`;
    el.querySelector('[data-sp=weiter]')?.focus({ preventScroll: true });
  }

  function ende(nr) {
    modus = 'ende';
    const L = LEVEL[nr - 1], n = R.sterne(l.antworten, nr), p = R.punkte(l.antworten), z = R.zwischenstand(l.antworten), naechst = LEVEL[nr];
    const B = z && BEREICH[z.bereich];
    const spur = B ? `<div class="karte"><b>Erste Spur</b><p><b>${esc(SATZ[z.bereich][z.richtung > 0 ? 0 : 1])}</b> <span class="leise">(${esc(B.name)}, vorläufig ${pz(z.p)})</span> Das kann sich bis zum Ende noch drehen.</p></div>` : '';
    const knoepfe = nr < 4
      ? `<button type="button" class="knopf haupt gross voll" data-sp="level">Weiter: Level ${nr + 1} · ${esc(naechst.name)}</button><a class="knopf zweit voll" href="#spiel">Pause – später weiter</a>`
      : `<button type="button" class="knopf haupt gross voll" data-sp="bonus"><span>Bonus-Level: Interessen-Duell<br><span class="klein">15 Wahlen, etwa 1 Minute</span></span></button>
         <button type="button" class="knopf zweit voll" data-sp="fertig">Gleich zum Ergebnis</button>`;
    el.innerHTML = `<section class="sp sp-ende sp-${L.farbe}" aria-labelledby="sp-h">
      <h2 id="sp-h" tabindex="-1">${nr < 4 ? `Level ${nr} geschafft!` : 'Hauptteil geschafft!'}</h2>
      ${sterneSvg(n)}
      <p class="sp-gross-zahl">${p} Punkte</p>
      <p class="leise klein">Sterne gibt es fürs genaue Lesen und ruhige Tempo – nicht für bestimmte Antworten.</p>
      ${spur}
      ${naechst ? `<div class="karte weich"><b>${nr < 4 ? `Gleich in Level ${nr + 1}` : 'Im Bonus-Level'}</b><p>${esc(naechst.wissen)}</p></div>` : ''}
      ${knoepfe}
      ${ui.merkHinweis(sp.einwilligung(), 'Dein Spielstand ist beim Neuladen oder Schließen weg – dann geht es wieder bei Wahl 1 los.')}</section>`;
    konfetti();
    el.querySelector('#sp-h')?.focus?.({ preventScroll: true });
  }

  function zurueckSchritt() {
    if (modus !== 'wahl' || l.i < 1) return;
    const v = ABLAUF[l.i - 1]; if (!v || !ZURUECK_OK.has(v.art) || v.level !== ABLAUF[Math.min(l.i, ABLAUF.length - 1)].level) return;
    delete l.antworten[v.id]; l.i -= 1; speichere(l); male();
    el.querySelector('.sp-wahl')?.focus({ preventScroll: true });
  }

  const klick = (ev) => {
    const b = ev.target.closest('.sp-wahl'); if (b && el.contains(b)) { ev.preventDefault(); waehle(b.dataset.wahl, b); return; }
    const k = ev.target.closest('[data-sp]'); if (!k || !el.contains(k)) return;
    const was = k.dataset.sp;
    if (was === 'zurueck') zurueckSchritt();
    else if (was === 'weiter') { if (l.aufl) { l.aufl = null; speichere(l); } male(); }
    else if (was === 'level') { const nr = LEVEL.findIndex((L, i) => l.i === LEVEL_START[i]); l.quittiert = Math.max(l.quittiert || 0, nr); speichere(l); male(); }
    else if (was === 'bonus') { l.quittiert = 4; l.bonus = true; speichere(l); male(); }
    else if (was === 'fertig') { l.quittiert = 4; l.bonus = false; speichere(l); male(); }
  };
  const taste = (ev) => {
    if (modus !== 'wahl' || ev.defaultPrevented || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    if (document.querySelector('dialog[open]')) return;
    const seite = ev.key === 'ArrowLeft' || ev.key === '1' ? '.sp-links' : ev.key === 'ArrowRight' || ev.key === '2' ? '.sp-rechts' : null;
    if (!seite) return;
    const b = el.querySelector(seite); if (!b) return;
    ev.preventDefault(); gesperrt = false; waehle(b.dataset.wahl, b);   // Tastatur ohne Doppeltipp-Sperre
  };
  // „Merken“ eingeschaltet: Hinweise im Spiel sofort weg (der nächste Schritt fragt ohnehin neu)
  const einw = kern.on('einwilligung', ({ an }) => { if (an) el.querySelectorAll('.sp-merk,[data-merk-hinweis]').forEach((x) => x.remove()); });
  el.addEventListener('click', klick); document.addEventListener('keydown', taste); document.addEventListener('visibilitychange', sichtbar);
  male();
  return () => { einw(); el.removeEventListener('click', klick); document.removeEventListener('keydown', taste); document.removeEventListener('visibilitychange', sichtbar); for (const t of timer) clearTimeout(t); timer.clear(); };
}

// ---------- Übersicht ----------
function uebersicht(ctx) {
  const { el } = ctx;
  ctx.titel('Entweder – oder');
  const male = () => {
    const l = lauf(), res = sp.ergebnis(M), an = laeuft(l);
    const lvl = an ? (ABLAUF[Math.min(l.i, ABLAUF.length - 1)] || {}).level || 1 : 1;
    let knoepfe;
    if (an) knoepfe = `<a class="knopf haupt gross voll" href="#spiel/runde">Weiterspielen – ${lvl === 5 ? 'Bonus-Level' : 'Level ' + lvl}</a><button type="button" class="knopf zweit voll" data-sp="neu">Neu anfangen</button>`;
    else if (res) knoepfe = `<a class="knopf haupt gross voll" href="#spiel/ergebnis">Dein Ergebnis ansehen</a><button type="button" class="knopf zweit voll" data-sp="neu">Nochmal spielen</button>`;
    else knoepfe = `<button type="button" class="knopf haupt gross voll" data-sp="neu">Los geht’s</button>`;
    const kurz = res ? kurzfassung(res) : '';
    el.innerHTML = `<div class="sp sp-f1">
      <section class="sp-held" aria-labelledby="sp-h"><h2 id="sp-h">Entweder – oder</h2>
        <p>Tippen statt grübeln: ${PFLICHT_ANZAHL} schnelle Wahlen in 4 Levels, dazu ein Bonus-Level. Etwa 4 Minuten.</p>
        <div class="sp-vs" aria-hidden="true"><span>Ich liebe große Feiern.</span><span>Ich träume gern vor mich hin.</span></div>
        <p class="klein">Mit Kopfnüssen, Fallen und Punkten – und am Ende ein Profil mit Wahrscheinlichkeiten.</p></section>
      ${kurz}
      ${knoepfe}
      <h3>Die Levels</h3>
      <ul class="sp-levels">${LEVEL.map((L, i) => { const n = L.folge.length, st = l && l.antworten && L.folge.every((id) => l.antworten[id]) ? R.sterne(l.antworten, L.nr) : 0;
        return `<li class="sp sp-${L.farbe}"><span class="sp-punkt" style="background:linear-gradient(135deg,var(--sp-l1),var(--sp-r2))" aria-hidden="true">${L.nr}</span><span><b>${esc(L.name)}</b><small>${n} Wahlen${L.bonus ? ' · freiwillig' : ''}${i === 1 ? ' · mit Fallen' : ''}</small></span>${st ? `<span class="rechts" aria-label="${st} von 3 Sternen">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>` : ''}</li>`; }).join('')}</ul>
      <ul class="zeilen"><li><a class="zeile" href="#spiel/so"><span><b>So funktioniert’s</b><small>Das Modell und die Rechnung – einfach erklärt</small></span><span class="rechts">${sym('weiter')}</span></a></li></ul>
      <div class="karte weich"><p><b>Ehrlich gesagt:</b> Das ist ein Spiel mit einem echten Mess-Modell – keine Diagnose und kein Beweis. Jede Aussage kommt mit einer Wahrscheinlichkeit und ihren Grenzen. ${marke('abgeleitet', ['brown2011', 'johnson2014'])}</p>
        <p class="klein leise">Die Aussagen stammen aus dem gemeinfreien IPIP (eigene, vorläufige Übersetzung), die Tätigkeiten aus dem O*NET Interest Profiler. Alles wird auf deinem Gerät gerechnet.</p></div>
      ${ui.merkHinweis(sp.einwilligung(), 'Dein Spielstand und dein Ergebnis sind beim Neuladen oder Schließen weg.')}
      ${ui.fuss()}</div>`;
  };
  male();
  const klick = async (ev) => {
    const k = ev.target.closest('[data-sp=neu]'); if (!k) return;
    const l = lauf();
    if (laeuft(l) && !(await ui.bestaetige({ titel: 'Neu anfangen?', text: 'Dein angefangenes Spiel wird verworfen. Dein letztes Ergebnis bleibt.', ja: 'Neu anfangen' }))) return;
    neuerLauf(); kern.geh('spiel/runde');
  };
  el.addEventListener('click', klick);
  const aus = kern.on('einwilligung', male);
  return () => { el.removeEventListener('click', klick); aus(); };
}
function kurzfassung(res) {
  const top = BEREICHE.map((B) => ({ B, b: res.bereiche[B.id] })).filter((x) => x.b && x.b.stufe).sort((a, b) => Math.abs(b.b.pOben - 0.5) - Math.abs(a.b.pOben - 0.5)).slice(0, 2);
  return `<div class="karte"><b>Dein letztes Ergebnis</b> <span class="leise klein">vom ${esc(ui.datum(res.zeit))}</span>
    ${top.length ? `<ul>${top.map(({ B, b }) => `<li>${esc(SATZ[B.id][b.richtung > 0 ? 0 : 1])} <span class="leise">(${pz(Math.max(b.pOben, 1 - b.pOben))})</span></li>`).join('')}</ul>` : '<p>Kein Bereich zeigt deutlich von der Mitte weg.</p>'}
    <p class="klein leise">Aussagekraft: ${esc(URTEIL[res.qualitaet.urteil].kurz)}</p></div>`;
}

// ---------- Ergebnis ----------
const URTEIL = {
  gut: { kurz: 'gut', text: 'Das Ergebnis hat Gewicht: Du hast aufmerksam und beständig gewählt.' },
  mittel: { kurz: 'mit Vorsicht', text: 'Das Ergebnis ist brauchbar, aber mit Vorsicht zu lesen' },
  fraglich: { kurz: 'fraglich', text: 'Nimm das Ergebnis heute nicht ernst' }
};
const GRUND = {
  kontrolle: (Q) => (Q.kontrolle.von - Q.kontrolle.richtig >= 2 ? 'mehrere Kontrollfragen gingen daneben' : 'eine Kontrollfrage ging daneben'),
  leicht: () => 'leichte Fragen gingen daneben', wieder: () => 'bei den Wiederholungen hast du oft anders gewählt',
  ketten: () => 'beide Ketten liefen im Kreis', tempo: () => 'viele Wahlen kamen schneller, als man lesen kann', seiten: () => 'auffällig oft dieselbe Seite'
};
function ergebnis(ctx) {
  const { el } = ctx;
  ctx.titel('Dein Entweder-oder-Profil'); ctx.zurueckZu('spiel');
  const res = sp.ergebnis(M);
  if (!res || res.schema !== 1) {
    el.innerHTML = `<h2>Noch kein Ergebnis</h2><p>Spiel einmal „Entweder – oder“, dann steht hier dein Profil.</p><a class="knopf haupt voll" href="#spiel">Zum Spiel</a>${ui.fuss()}`;
    return;
  }
  const Q = res.qualitaet, l = lauf(), bonusNachholen = !res.interessen && l && l.id === res.lauf;
  const gruende = Q.gruende.map((g) => GRUND[g] && GRUND[g](Q)).filter(Boolean);
  const urteil = `<div class="karte sp-urteil ${Q.urteil}"><span class="sp-ampel" aria-hidden="true"></span><div><b>Aussagekraft: ${esc(URTEIL[Q.urteil].kurz)}</b>
    <p>${esc(URTEIL[Q.urteil].text)}${gruende.length ? ': ' + esc(gruende.join(', ')) + '.' : ''}${Q.urteil === 'fraglich' ? ' Spiel lieber noch einmal in Ruhe.' : ''}</p></div></div>`;

  const bereiche = BEREICHE.map((B) => {
    const b = res.bereiche[B.id]; if (!b) return '';
    return `<div class="sp-bereich"><h3>${esc(B.name)}</h3>
      <p class="sp-satz">${esc(satz(B.id, b))}</p>
      ${ui.band({ name: B.name, unten: b.unten, oben: b.oben, wort: 'Messung ' + b.sicherheit, links: B.links, rechts: B.rechts, ohneName: true,
        beschreibung: `${B.name}: wahrscheinlich zwischen ${Math.round(b.unten)} und ${Math.round(b.oben)} auf einer Skala von 20 bis 80, Mitte 50. ${pz(b.pOben)} für „${B.rechts}“.` })}
      <div class="sp-chance"><span class="klein">spricht für „${esc(B.rechts)}“</span><span class="sp-leiste" aria-hidden="true"><span style="width:${Math.round(b.pOben * 100)}%"></span></span><b>${pz(b.pOben)}</b></div></div>`;
  }).join('');
  const vgl = res.vergleiche.slice(0, 3).map((v) => `<tr><td>${esc(BEREICH[v.vor].name)} ist bei dir stärker als ${esc(BEREICH[v.nach].name)}</td><td>${pz(v.p)}</td></tr>`).join('');

  let intr = '';
  if (res.interessen) {
    intr = `<section class="karte" aria-labelledby="sp-i"><h3 id="sp-i">Interessen-Duell</h3>
      <p>Was du lieber tun würdest – im Vergleich der sechs Bereiche untereinander (nicht, wie stark dein Interesse insgesamt ist). ${marke('abgeleitet', ['armstrong2008', 'onet'])}</p>
      ${res.interessen.rang.map((t) => { const x = res.interessen.typen.find((y) => y.typ === t);
        return `<div class="sp-chance"><span><b>${esc(TYPEN[t].name)}</b><br><span class="klein leise">${esc(TYPEN[t].kurz)} · ${x.siege} von 5 Duellen</span></span><span class="sp-leiste" aria-hidden="true"><span style="width:${Math.round(x.pTop2 * 100)}%"></span></span><b>${pz(x.pTop2)}</b></div>`; }).join('')}
      <p class="klein leise">Prozent = Wahrscheinlichkeit, dass dieser Bereich zu deinen zwei liebsten gehört. Mit 15 Duellen ist das grob.</p></section>`;
  } else if (bonusNachholen) {
    intr = `<div class="karte weich"><b>Interessen-Duell</b><p>Das Bonus-Level hast du ausgelassen. 15 Wahlen, etwa 1 Minute.</p><button type="button" class="knopf voll" data-sp="bonus">Bonus-Level nachholen</button></div>`;
  }

  const K = res.kopf, nf = res.nachFalle;
  const kopf = `<section class="karte" aria-labelledby="sp-k"><h3 id="sp-k">Kopfnüsse und Ablenkung</h3>
    <p><b>${K.richtig} von ${K.von}</b> Kopfnüssen geknackt. ${marke('belegt', ['frederick2005', 'thomson2016'])}</p>
    <ul>${K.schwung != null ? `<li>Milch-Falle (nach dreimal „Milch“): ${K.schwung ? 'nicht reingefallen' : 'reingefallen – vorher gehörte Wörter drängen sich leicht vor'} ${marke('abgeleitet', ['meyer1971'])}</li>` : ''}
      ${K.taeuschung != null ? `<li>Eisbär-Frage mit eingebautem Fehler: ${K.taeuschung ? 'durchschaut' : 'übersehen – das passiert bei solchen Fragen sehr vielen, auch wenn „Da stimmt was nicht“ danebensteht'} ${marke('belegt', ['erickson1981', 'speckmann2021'])}</li>` : ''}
      ${nf ? `<li>Nach den Kopfnüssen hast du die nächsten Paare ${nf.faktor >= 1.15 ? `langsamer gelesen (etwa ${zahl(nf.faktor)}-mal so lange) – vorsichtiger geworden?` : nf.faktor <= 0.87 ? 'schneller gewählt als sonst' : 'etwa so schnell wie sonst gewählt'} ${marke('abgeleitet', ['rabbitt1966'])}</li>` : ''}</ul>
    <p class="klein leise">Ein Spiel, kein Intelligenz-Test: Wer solche Aufgaben kennt, hat einen Vorteil, und fünf Aufgaben sind sehr wenig.</p></section>`;

  const W = Q.wieder, KT = Q.ketten, V = Q.vorhersage, T = Q.tempo, S = Q.seiten;
  const treu = `<section class="karte" aria-labelledby="sp-t"><h3 id="sp-t">Wie beständig du gewählt hast</h3>
    <table class="sp-tab"><tbody>
      <tr><td>Kontrollfragen ${marke('belegt', ['meade2012'])}</td><td>${Q.kontrolle.richtig} von ${Q.kontrolle.von}</td></tr>
      <tr><td>Leichte Fragen</td><td>${Q.leicht.richtig} von ${Q.leicht.von}</td></tr>
      <tr><td>Wiederholte Paare gleich gewählt ${marke('belegt', ['curran2016'])}</td><td>${W.gleich} von ${W.von}</td></tr>
      <tr><td>Ketten ohne Kreis (A vor B, B vor C → A vor C) ${marke('belegt', ['kendall1940'])}</td><td>${KT.stimmig} von ${KT.von}</td></tr>
      <tr><td>Vorhersage: Dein Profil aus den 30 Paaren hat deine Ketten-Wahlen getroffen ${marke('abgeleitet', ['brown2011'])}</td><td>${V.treffer} von ${V.von}<br><span class="klein leise">erwartet ≈ ${zahl(V.erwartet)}</span></td></tr>
      <tr><td>Sehr schnell (schneller, als man lesen kann) ${marke('abgeleitet', ['huang2012', 'brysbaert2019'])}</td><td>${T.schnell} von ${T.von}${T.median ? `<br><span class="klein leise">typisch ${zahl(T.median / 1000)} s</span>` : ''}</td></tr>
      <tr><td>Linke Seite gewählt</td><td>${pz(S.anteil)}</td></tr>
    </tbody></table>
    ${KT.kreise.length ? '<p class="klein">Ein Kreis heißt nicht „falsch“: Er entsteht, wenn zwei Aussagen dich fast gleich ansprechen.</p>' : ''}</section>`;

  const zg = res.zoegern && res.zoegern.length ? `<section class="karte" aria-labelledby="sp-z"><h3 id="sp-z">Hier hast du am längsten überlegt</h3>
    ${res.zoegern.map((z) => `<p class="sp-zoeg">„${esc(z.gewaehlt)}“ statt „${esc(z.andere)}“ <span class="leise klein">– ${zahl(z.faktor)}-mal so lange wie sonst</span></p>`).join('')}
    <p class="klein">Langes Überlegen heißt oft: Beides passt ein bisschen – oder keins. ${marke('abgeleitet', ['ferrando2007'])}</p></section>` : '';

  const bf = sp.ergebnis('bigfive'), vb = R.vergleichBogen(bf, res.bereiche);
  const bogen = vb ? `<section class="karte" aria-labelledby="sp-b"><h3 id="sp-b">Spiel und Fragebogen im Vergleich</h3>
    <p>Reihenfolge deiner fünf Bereiche: <b>${vb.r >= 0.7 ? 'ähnlich' : vb.r >= 0.3 ? 'teils ähnlich' : 'verschieden'}</b> <span class="leise klein">(Rang-Übereinstimmung ${zahl(vb.r, 2)}, von −1 bis 1)</span></p>
    <ul><li>Am stärksten – Spiel: ${esc(BEREICH[vb.hoch.spiel].name)}, Fragebogen: ${esc(BEREICH[vb.hoch.bogen].name)}${vb.hoch.spiel === vb.hoch.bogen ? ' ✓' : ''}</li>
      <li>Am schwächsten – Spiel: ${esc(BEREICH[vb.tief.spiel].name)}, Fragebogen: ${esc(BEREICH[vb.tief.bogen].name)}${vb.tief.spiel === vb.tief.bogen ? ' ✓' : ''}</li></ul>
    <p class="klein leise">Der Fragebogen vergleicht dich mit anderen Menschen, das Spiel deine Bereiche untereinander. Darum zählt hier die Reihenfolge. Wo beide übereinstimmen, ist die Aussage stärker. Mit fünf Bereichen ist der Vergleich aber grob.</p></section>` : '';

  const abz = `<section class="karte" aria-labelledby="sp-a"><h3 id="sp-a">Abzeichen · ${res.punkte} Punkte</h3>
    ${res.abzeichen.length ? `<ul class="sp-abz">${res.abzeichen.map((a) => `<li>${medaille}<span><b>${esc(R.ABZEICHEN[a].name)}</b><br><span class="klein">${esc(R.ABZEICHEN[a].text)}</span></span></li>`).join('')}</ul>` : '<p>Diesmal ohne Abzeichen – beim nächsten Mal?</p>'}</section>`;

  const grenzen = `<section class="karte weich" aria-labelledby="sp-g"><h3 id="sp-g">Was das Ergebnis nicht ist</h3><ul>
    <li>Keine Diagnose und kein Beweis – das Spiel zeigt Tendenzen mit Wahrscheinlichkeiten.</li>
    <li>Die Werte der einzelnen Aussagen sind angenommen, nicht an vielen Menschen geschätzt. Darum macht die App jeden Bereich absichtlich breiter.</li>
    <li>„Mitte“ heißt: Aussagen beider Seiten sprechen dich gleich an – nicht „so wie der Durchschnitt“. Vergleichswerte anderer Menschen gibt es hier nicht.</li>
    <li>In einer Simulation mit erfundenen Spielern lag der wahre Wert in 88 von 100 Fällen im gezeigten Bereich. Bei echten Menschen ist es ungenauer, weil das Modell vereinfacht.</li>
    <li>Tagesform zählt: Müde, gestresst oder abgelenkt fällt es anders aus.</li></ul>
    <p class="klein"><a class="link" href="#spiel/so">So funktioniert’s – das Modell und die Rechnung</a></p></section>`;

  el.innerHTML = `<div class="sp sp-f1"><h2>Dein Entweder-oder-Profil</h2>
    <p class="leise klein">Gespielt am ${esc(ui.datum(res.zeit, true))}${res.dauer ? ` · ${Math.max(1, Math.round(res.dauer / 60))} Min.` : ''} · ${res.n} gewertete Paare</p>
    ${urteil}
    <section class="karte" aria-labelledby="sp-p"><h3 id="sp-p">Deine fünf Bereiche</h3>
      <p class="klein">Der Balken zeigt, wo du wahrscheinlich liegst (80-%-Bereich). Die Prozentzahl: wie wahrscheinlich die rechte Seite überwiegt. ${marke('abgeleitet', ['brown2011', 'johnson2014'])}</p>
      ${bereiche}</section>
    <section class="karte" aria-labelledby="sp-v"><h3 id="sp-v">Was bei dir überwiegt</h3>
      <p class="klein">Das misst Entweder-oder am besten: welcher Bereich bei dir im Vergleich stärker ist. ${marke('belegt', ['brown2013'])}</p>
      <table class="sp-tab"><tbody>${vgl}</tbody></table></section>
    ${intr}${kopf}${treu}${zg}${bogen}${abz}${grenzen}
    <div class="stapel"><a class="knopf zweit" href="#spiel/so">So funktioniert’s</a><button type="button" class="knopf zweit" data-sp="neu">Nochmal spielen</button><a class="knopf zweit" href="#start">Zur Startseite</a></div>
    ${ui.merkHinweis(sp.einwilligung(), 'Dein Ergebnis ist beim Neuladen oder Schließen weg.')}${ui.fuss()}</div>`;
  const klick = (ev) => {
    const k = ev.target.closest('[data-sp]'); if (!k) return;
    if (k.dataset.sp === 'neu') { neuerLauf(); kern.geh('spiel/runde'); }
    if (k.dataset.sp === 'bonus') { const x = lauf(); if (!x) return; x.ende = null; x.bonus = true; x.quittiert = 4; x.i = PFLICHT_ANZAHL; speichere(x); kern.geh('spiel/runde'); }
  };
  el.addEventListener('click', klick);
  return () => el.removeEventListener('click', klick);
}

// ---------- So funktioniert’s ----------
// Glockenkurve (Normalverteilung) einer Schätzung: Fläche rechts der Mitte = Wahrscheinlichkeit, gestrichelt = Mitte.
function glocke(m, sd, links, rechts) {
  const W = 320, H = 130, x0 = 10, x1 = W - 10, yb = 100, s = (x) => x0 + ((x + 3) / 6) * (x1 - x0);
  const pdf = (x) => Math.exp(-0.5 * ((x - m) / sd) ** 2), pk = [];
  for (let i = 0; i <= 120; i++) { const x = -3 + (6 * i) / 120; pk.push([s(x), yb - 80 * pdf(x)]); }
  const linie = pk.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const rechtsPk = pk.filter(([x]) => x >= s(0));
  const flaeche = `M${s(0).toFixed(1)} ${yb}` + rechtsPk.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join('') + `L${x1} ${yb}Z`;
  const p = R.Phi(m / sd);
  return `<svg class="sp-glocke" viewBox="0 0 ${W} ${H}" role="img" aria-label="Glockenkurve: Schätzung ${zahl(m, 2)}, Unsicherheit ${zahl(sd, 2)}. ${pz(p)} der Fläche liegen rechts der Mitte.">
    <path class="sp-g-flaeche" d="${flaeche}"/><path class="sp-g-linie" d="${linie}"/>
    <line class="sp-g-achse" x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}"/><line class="sp-g-mitte" x1="${s(0)}" y1="14" x2="${s(0)}" y2="${yb}"/>
    <text x="${s(0)}" y="${yb + 14}" text-anchor="middle">Mitte</text><text x="${x0}" y="${yb + 26}">${esc(links)}</text><text x="${x1}" y="${yb + 26}" text-anchor="end">${esc(rechts)}</text>
    <text x="${Math.min(x1 - 40, s(Math.max(0.4, m)) + 8)}" y="30">${pz(p)}</text></svg>`;
}
function so(ctx) {
  const { el } = ctx;
  ctx.titel('So funktioniert’s'); ctx.zurueckZu('spiel');
  const res = sp.ergebnis(M);
  let bsp = { id: 'offenheit', m: 0.5, sd: 0.6, eigen: false };
  if (res && res.bereiche) {
    const best = BEREICHE.map((B) => ({ id: B.id, ...res.bereiche[B.id] })).filter((x) => typeof x.m === 'number').sort((a, b) => Math.abs(b.pOben - 0.5) - Math.abs(a.pOben - 0.5))[0];
    if (best) bsp = { id: best.id, m: best.m, sd: best.sd, eigen: true };
  }
  const B = BEREICH[bsp.id];
  // Beispielrechnung für ein Paar: Offenheit +0,5 gegen Gewissenhaftigkeit −0,3, beide Aussagen „dafür“
  const zb = (0.5 - -0.3) / Math.SQRT2, pb = R.Phi(zb);
  el.innerHTML = `<div class="sp sp-f3"><h2>So funktioniert’s</h2>
    <p class="lead">Hinter dem Spiel steckt ein Mess-Modell aus der Forschung – vereinfacht, aber ehrlich gerechnet.</p>

    <section class="karte"><h3>1. Warum Entweder-oder?</h3>
      <p>Bei einzelnen Aussagen („Stimmt das für dich?“) sagt man leicht zu allem Gutem Ja. Wenn zwei Aussagen gegeneinander stehen, die beide gut klingen können, ist Schönfärben schwerer. ${marke('belegt', ['cao2019'])}</p>
      <p>Die Aussagen kommen aus dem gemeinfreien IPIP-Fragebogen, je 12 zu den fünf großen Bereichen der Persönlichkeit (Big Five). ${marke('belegt', ['johnson2014'])}</p></section>

    <section class="karte"><h3>2. Das Problem mit dem Zählen</h3>
      <p>Zählt man nur, wie oft du welchen Bereich gewählt hast, ergibt sich immer eine Rangfolge – wer überall hoch liegt, sieht genauso aus wie jemand, der überall niedrig liegt. Fachleute nennen das „ipsativ“. ${marke('belegt', ['brown2013'])}</p>
      <p>Die Lösung: ein Modell, das jede Wahl als Vergleich zweier „Reize“ versteht (Thurstone, 1927), und Paare, in denen eine Aussage für und die andere gegen ihren Bereich spricht. Die Hälfte der 30 Paare ist so gemischt. ${marke('belegt', ['thurstone1927', 'brown2011', 'buerkner2019'])}</p></section>

    <section class="karte"><h3>3. Die Rechnung</h3>
      <p><b>Reiz:</b> Jede Aussage reizt dich so stark, wie dein Bereich hoch ist (oder umgekehrt, wenn sie dagegen spricht) – plus ein wenig Zufall von Mal zu Mal.</p>
      <p><b>Wahl:</b> Du nimmst die Aussage mit dem stärkeren Reiz. Die Wahrscheinlichkeit dafür:</p>
      <p class="sp-formel">P(A statt B) = Φ( (Reiz A − Reiz B) / √2 )</p>
      <p class="klein">Φ macht aus einem Abstand eine Wahrscheinlichkeit zwischen 0 und 100 %. Beispiel: Offenheit +0,5, Gewissenhaftigkeit −0,3; A = „Ich habe eine lebhafte Fantasie.“, B = „Ich räume gern auf.“ → (0,5 − (−0,3)) / 1,41 = ${zahl(zb, 2)} → <b>${pz(pb)}</b> für A. Also meistens A – aber nicht immer.</p>
      <p><b>Rückwärts:</b> Die App kennt deine Werte nicht. Sie startet mit allen Bereichen in der Mitte und sucht dann die Werte, die deine 30 Wahlen am besten erklären. Jede Wahl schiebt die Schätzung ein Stück; zeigen viele Wahlen in dieselbe Richtung, wird die Glocke schmal.</p>
      ${glocke(bsp.m, bsp.sd, B.links, B.rechts)}
      <p class="klein">${bsp.eigen ? `Deine Glocke für ${esc(B.name)}` : `Beispiel-Glocke für ${esc(B.name)}`}: Die Spitze ist die beste Schätzung, die Breite die Unsicherheit. Der farbige Teil rechts der gestrichelten Mitte ist die Wahrscheinlichkeit für „${esc(B.rechts)}“. Der Balken im Ergebnis zeigt die mittleren 80 %.</p>
      <p class="klein leise">Für Fachleute: Thurstonian IRT für Paare mit festen Ladungen (λ = 1, ψ² = 1, Schwelle 0), Vorwissen N(0, I), MAP-Schätzung (Newton) mit Laplace-Näherung, Unsicherheit × 1,25. Interessen: Thurstone Fall V mit sechs Bereichen, Wahrscheinlichkeiten über 4000 Zufallszüge.</p></section>

    <section class="karte"><h3>4. Die Prüfungen</h3><ul>
      <li><b>Kontrollfragen</b> („Tippe auf Banane“, „Ich war schon einmal auf dem Mond“): Aufmerksame wählen hier fast immer gleich. ${marke('belegt', ['meade2012'])}</li>
      <li><b>Wiederholungen:</b> Vier Paare kommen später noch einmal, mit getauschten Seiten. ${marke('belegt', ['curran2016'])}</li>
      <li><b>Ketten:</b> Drei Aussagen, jede gegen jede, über das Spiel verteilt. Wer A vor B und B vor C nimmt, nimmt meist auch A vor C. ${marke('belegt', ['kendall1940'])}</li>
      <li><b>Vorhersage:</b> Aus den 30 Haupt-Paaren sagt die App deine Ketten-Wahlen vorher – und prüft, wie oft sie trifft. ${marke('abgeleitet', ['brown2011'])}</li>
      <li><b>Antwortzeiten:</b> Schneller als etwa 500 Wörter pro Minute kann man nicht lesen. Solche Wahlen zählen als „sehr schnell“. Lange Pausen zeigen, wo es knapp war. ${marke('abgeleitet', ['huang2012', 'brysbaert2019', 'ferrando2007'])}</li>
      <li><b>Kopfnüsse:</b> Aufgaben mit schneller, falscher Antwort (Seerosen, Rennen, Schafe). ${marke('belegt', ['frederick2005', 'thomson2016'])}</li>
      <li><b>Frage mit eingebautem Fehler</b> (Eisbären am Südpol): Richtig ist „Da stimmt was nicht“. Solche Fehler rutschen oft durch, auch wenn diese Antwort danebensteht („Moses-Täuschung“). ${marke('belegt', ['erickson1981', 'speckmann2021'])}</li>
      <li><b>Milch-Falle:</b> Nach drei „Milch“-Fragen kommt „Was trinkt die Kuh?“. Vorher gehörte Wörter liegen schon bereit und drängen sich vor („Bahnung“). Das ist ein bekanntes Rätsel, keine eigene Studie. ${marke('abgeleitet', ['meyer1971'])}</li>
      <li><b>Seiten:</b> Die Seiten werden gemischt. Wer fast nur links tippt, fällt auf. ${marke('belegt', ['curran2016'])}</li></ul>
      <p class="klein">Aus allen Prüfungen zusammen kommt die „Aussagekraft“: gut, mit Vorsicht oder fraglich. Eine einzelne Prüfung sagt wenig – auch Aufmerksame irren sich mal.</p></section>

    <section class="karte weich"><h3>5. Ehrliche Grenzen</h3><ul>
      <li>Keine Diagnose, kein Beweis. Das Spiel zeigt Tendenzen mit Wahrscheinlichkeiten.</li>
      <li>Die Werte der einzelnen Aussagen sind angenommen (alle gleich stark, gleich beliebt), nicht an vielen Menschen geschätzt. Echte Fragebögen schätzen sie an großen Gruppen. Darum sind alle Bereiche um ein Viertel breiter gerechnet.</li>
      <li>„Mitte“ heißt: Beide Seiten reizen dich gleich. Es heißt nicht „wie der Durchschnitt“ – deutsche Vergleichswerte gibt es hier nicht.</li>
      <li>Mit 12 Aussagen je Bereich ist die Messung meist grob – so steht es auch an den Balken im Ergebnis. In Simulationen mit erfundenen Spielern hießen 8 von 10 Bereichen „grob“ (80-%-Bereich etwa ±8 bis ±9 Punkte), etwa jeder sechste „mittelgenau“. Die Schätzungen trafen dort ordentlich (Zusammenhang 0,85), bei echten Menschen ist es weniger.</li>
      <li>Die Übersetzungen sind eigene und vorläufig.</li></ul></section>

    <p class="mitte"><a class="link" href="#einstellungen/quellen">Alle Quellen</a></p>
    <a class="knopf haupt voll" href="#spiel">Zum Spiel</a>${ui.fuss()}</div>`;
}

export default {
  id: M,
  schema: 1,
  start() { ui.ladeStil(new URL('./stil.css', import.meta.url).href); if (kern.TEST) window.__spiel = { ABLAUF, SCHRITT, LEVEL, PFLICHT_ANZAHL, R, lauf }; },
  ansicht(ctx) {
    const u = ctx.pfad[1];
    if (u === 'runde') return runde(ctx);
    if (u === 'ergebnis') return ergebnis(ctx);
    if (u === 'so') return so(ctx);
    return uebersicht(ctx);
  }
};
