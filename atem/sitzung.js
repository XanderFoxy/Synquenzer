// Atem – „Übung läuft“ (KONZEPT §2.7, §4.4): verbindet Uhr, Ton, Kreis, Anatomie, Wake Lock, Sichtbarkeit.
import { erzeugeUhr } from './uhr.js';
import { ton } from './ton.js';
import { erzeugeFuehrung, phasenFarbe } from './fuehrung.js';
import { sym } from './symbole.js';
import { MUSKELN } from './daten.js';

const $ = (s, r = document) => r.querySelector(s);
const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let aktiv = null;
export const laeuft = () => aktiv;

export function oeffne(plan, opt) {
  if (aktiv) aktiv.beenden('gestoppt', true);
  const { T, einst = {}, quelle = 'frei', beiEnde, riskant = false, test = false } = opt;
  const host = $('#sitzung'); host.classList.remove('figur-gross'); host.classList.toggle('riskant', riskant);
  const ruhigMedia = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ruhig = !!einst.ruhig || ruhigMedia;
  host.innerHTML = `
    <div class="sz-kopf"><button class="knopf-ico" data-a="beenden" aria-label="Beenden">${sym('schliessen')}</button>
      <div class="sz-titel">${plan.name}</div>
      <button class="knopf-ico" data-a="ton" aria-label="Ton an oder aus">${sym(einst.ton === 'aus' ? 'tonAus' : 'ton')}</button></div>
    <div class="sz-haupt">
      <div class="sz-kreis"><canvas></canvas><div class="sz-mitte"><div class="sz-wort">Gleich geht's los</div><div class="sz-zahl">3</div><div class="sz-hinweis"></div></div></div>
      <div class="sz-zeile"><span class="sz-weg"></span><span class="sz-zug"></span><span class="sz-rest"></span></div>
      ${plan.tabelle ? `<div class="sz-tab">${plan.tabelle.map((r, i) => `<div class="sz-tab-sp" data-r="${i + 1}"><b style="height:${Math.round(8 + 40 * r.halten_s / 180)}px"></b><i style="height:${Math.round(8 + 40 * r.pause_s / 180)}px"></i></div>`).join('')}</div>` : ''}
      <div class="sz-anat ${einst.figur === false ? 'aus' : ''}" role="button" aria-label="Figur groß oder klein"><button class="sz-ans" data-a="seitevorn" aria-label="Ansicht Seite oder Vorne">${einst.ansicht === 'vorn' ? 'Seite' : 'Vorne'}</button></div>
    </div>
    <div class="sz-unten">
      ${riskant ? `<p class="sz-warn">Bei Schwindel oder Kribbeln: sofort normal atmen.</p>` : ''}
      <button class="sz-atmen" data-a="atmen" hidden>Atmen</button>
      <button class="sz-stopp" data-a="stopp" hidden>Stopp</button>
      <div class="sz-knoepfe">
        ${riskant ? `<button class="knopf gefahr sz-normal" data-a="normal">Jetzt normal atmen</button><button class="sz-pause" data-a="pause" aria-label="Pause">${sym('pause')}</button>`
    : `<button class="knopf-ico" data-a="ansicht" aria-label="Ansicht wechseln">${sym('figur')}</button><button class="sz-pause" data-a="pause" aria-label="Pause">${sym('pause')}</button><button class="knopf-ico" data-a="ansage" aria-label="Ansage an oder aus">${sym(einst.ansage ? 'ton' : 'tonAus')}</button>`}
      </div>
    </div>
    <div class="sz-blatt" hidden></div>`;
  host.hidden = false; document.body.classList.add('in-sitzung');
  const cv = $('canvas', host), quer = () => innerWidth > innerHeight;
  const kreisPx = () => (gross ? 120 : quer() ? Math.min(riskant ? 240 : 300, innerHeight - 110) : Math.min(320, innerWidth - 60));   // quer + riskant: Platz für die Bedienspalte
  let gross = false;
  const f = erzeugeFuehrung(cv, { ruhig, blumen: einst.blumen !== false, px: kreisPx() });
  const uhr = erzeugeUhr();
  let an = null, raf = 0, letzteSek = -1, letzterI = -1, zustand = 'zaehlen', zaehlStart = performance.now(), wake = null, offenWand = null, tippZahl = 0, gekuerzt = [];
  const el = { wort: $('.sz-wort', host), zahl: $('.sz-zahl', host), hinweis: $('.sz-hinweis', host), weg: $('.sz-weg', host), zug: $('.sz-zug', host), rest: $('.sz-rest', host), atmen: $('.sz-atmen', host), stopp: $('.sz-stopp', host), blatt: $('.sz-blatt', host), anat: $('.sz-anat', host) };
  if (einst.figur !== false) import('./anatomie.js').then((m) => { if (!aktiv || aktiv.uhr !== uhr) return; an = m.erzeugeAnatomie(el.anat, { ansicht: einst.ansicht || 'seite', modus: gross ? 'gross' : 'klein', daten: { MUSKELN } }); figurRuhe(); }).catch(() => { el.anat.classList.add('aus'); });
  ton.einstellen({ art: einst.ton || 'klang', laut: einst.laut ?? 0.6, sekunden: !!einst.sekunden, ansage: !!einst.ansage });
  ton.entsperren(einst.musik);
  holeWake();
  async function holeWake() { try { if (navigator.wakeLock && document.visibilityState === 'visible') { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch { wake = null; } }
  const lasseWake = () => { try { if (wake) wake.release(); } catch {} wake = null; };

  // Figur in Ruhelage (Einzählen): gleiche Art/Weg wie der erste Schritt, v = 0 wie der Kreis
  let zeitFigur = 0;
  function figurRuhe() {
    if (!an) return; const P = uhr.plan || plan, s0 = P.schritte[Math.max(0, letzterI)] || P.schritte[0];
    const t = performance.now(); zeitFigur = t - (uhr.plan ? uhr.zeit() : 0);
    an.setze({ phase: 'ruhe', anteil: 0, v: 0, art: s0.art_anat, tiefe: s0.tiefe, weg: s0.weg, liegend: !!T.liegend, zeit: t, ruhig });
  }
  function zaehleEin(dann) { zustand = 'zaehlen'; zaehlStart = performance.now(); aktiv._nachZaehlen = dann; lauf(); }
  function lauf() { if (!raf) raf = requestAnimationFrame(bild); }
  function bild() {
    raf = 0;
    if (zustand === 'zaehlen') {
      const rest = 3000 - (performance.now() - zaehlStart);
      el.zahl.textContent = String(Math.max(1, Math.ceil(rest / 1000)));
      if (rest <= 0) { const d = aktiv._nachZaehlen; aktiv._nachZaehlen = null; d(); }
      else { f.zeichne({ i: 0, schritt: { art: 'ruhe', zug: 0 }, p: 0, v: 0, rest_ms: rest }, { schritte: [{ art: 'ruhe', ms: 3000, zug: 0, abschnitt: 'ruhe' }], start: [0, 3000], ring: 'zyklus' }); figurRuhe(); }
      lauf(); return;
    }
    if (zustand !== 'laeuft') return;
    const z = uhr.zustand();
    f.zeichne(z, uhr.plan);
    const s = z.schritt;
    if (an) an.setze({ phase: s.art, anteil: z.p, v: z.v, vz: s.vz, art: s.art_anat, tiefe: s.tiefe, weg: s.weg, liegend: !!T.liegend, zeit: zeitFigur + uhr.zeit(), ruhig });
    if (z.i !== letzterI) neuerSchritt(z);
    const sek = z.offen_ms != null ? Math.floor(z.offen_ms / 1000) : z.sekunde;
    if (sek !== letzteSek) { letzteSek = sek; el.zahl.textContent = z.offen_ms != null ? String(sek) : String(Math.max(0, sek)); el.rest.textContent = z.gesamt_rest_ms != null ? 'noch ' + mmss(z.gesamt_rest_ms) : ''; }
    if (z.fertig) { beenden('fertig'); return; }
    lauf();
  }
  function neuerSchritt(z) {
    letzterI = z.i; const s = z.schritt;
    el.wort.textContent = s.wort; el.hinweis.textContent = s.hinweis || (s.abschnitt === 'erholung' && s.wort === 'Erholung' ? WORT_KURZ[s.art] || '' : '');
    el.wort.style.color = s.art === 'halten_leer' ? '#8d9cc0' : phasenFarbe(s.art);   // Kontrast ≥ 4,5:1 auch klein
    el.weg.innerHTML = s.art.startsWith('halten') || s.art === 'ruhe' ? '' : sym(s.weg === 'summen' ? 'summen' : s.weg === 'mund' || s.weg === 'ha' || s.weg === 'vokal' ? 'mund' : s.weg === 'links' ? 'links' : s.weg === 'rechts' ? 'rechts' : 'nase') + '<span>' + WEG[s.weg] + '</span>';
    el.zug.textContent = s.runden ? 'Runde ' + s.runde + '/' + s.runden + (s.zuege && s.zug ? ' · Zug ' + s.zug + '/' + s.zuege : '') : s.zuege ? 'Zug ' + s.zug + '/' + s.zuege : '';
    const offen = s.ms == null;
    el.atmen.hidden = !(s.kuerzbar && !offen && (s.art.startsWith('halten')));
    el.stopp.hidden = !offen;
    if (offen) { offenWand = Date.now(); tippZahl = 0; el.stopp.textContent = T.id === 'kontrollpause' ? 'Erster Atemreiz – Stopp' : T.id === 'sss_messen' ? 'Luft aus – Stopp' : 'Atmen'; }
    if (T.id === 'ruhe_zuege') { el.stopp.hidden = false; el.stopp.textContent = 'Einatmen (' + tippZahl + ')'; }
    const tab = host.querySelectorAll('.sz-tab-sp'); tab.forEach((x) => x.classList.toggle('jetzt', +x.dataset.r === s.runde));
    if (ton.neuPlanen) ton.neuPlanen();
  }
  function pause(grund) {
    if (zustand !== 'laeuft' && zustand !== 'zaehlen') return;
    if (zustand === 'laeuft') uhr.pause();
    zustand = 'pause'; cancelAnimationFrame(raf); raf = 0; ton.halt(); lasseWake();
    if (offenWand != null && uhr.plan && uhr.plan.offenAb >= 0 && grund === 'hidden') { beenden('unterbrochen'); return; }
    zeigeBlatt(`<h2>Pausiert</h2><button class="knopf haupt" data-a="weiter">Weiter</button><button class="knopf" data-a="beenden2">Beenden</button>`);
  }
  function weiter() {
    el.blatt.hidden = true; ton.entsperren(einst.musik); holeWake();
    zaehleEin(uhr.plan ? () => { uhr.weiter(); zustand = 'laeuft'; letzterI = -1; letzteSek = -1; ton.starte(uhr, uhr.plan); } : los);   // Pause im ersten 3-2-1: Uhr lief noch nicht
  }
  function zeigeBlatt(html) { el.blatt.innerHTML = '<div class="blatt-innen">' + html + '</div>'; el.blatt.hidden = false; }
  function kuerze() {
    const z = uhr.zustand(); const s = z.schritt;
    const wandMs = offenWand != null ? Date.now() - offenWand : null;
    const r = uhr.kuerze(); if (!r) return;
    gekuerzt.push({ i: r.i, ms: r.ms, wand_ms: wandMs, art: s.art, runde: s.runde });
    if (s.ms == null) offenWand = null;
    letzterI = -1; ton.neuPlanen();
  }
  function beenden(ende, still) {
    if (zustand === 'ende') return;
    const war = zustand; zustand = 'ende'; cancelAnimationFrame(raf); raf = 0; ton.halt(); lasseWake();
    const stp = uhr.plan ? uhr.stopp() : { ist_ms: 0 };
    if (ende === 'fertig') ton.ende();
    const erg = { plan, uhrPlan: uhr.plan, ende, ist_ms: stp.ist_ms, gekuerzt, tippZahl, quelle, T, war };
    aufraeumen(); aktiv = null;
    if (still) { schliessen(); return; }
    beiEnde(erg, { zeigeBlatt, schliessen, nochmal: () => oeffne(plan, opt) });
  }
  function schliessen() { host.hidden = true; host.innerHTML = ''; host.classList.remove('figur-gross'); document.body.classList.remove('in-sitzung'); if (an && an.zerstoere) an.zerstoere(); }
  function klick(e) {
    if (!wake && zustand === 'laeuft') holeWake();   // vom System freigegeben → beim nächsten Tipp neu
    const b = e.target.closest('[data-a]'); if (!b) { if (e.target.closest('.sz-anat') && an) { gross = !gross; host.classList.toggle('figur-gross', gross); f.groesse(kreisPx()); if (an.modus) an.modus(gross ? 'gross' : 'klein'); } return; }
    const a = b.dataset.a;
    if (a === 'pause') pause('knopf');
    else if (a === 'weiter') weiter();
    else if (a === 'beenden' || a === 'beenden2') beenden('gestoppt');
    else if (a === 'normal') beenden('abbruch');
    else if (a === 'atmen') kuerze();
    else if (a === 'stopp') { if (T.id === 'ruhe_zuege') { tippZahl++; el.stopp.textContent = 'Einatmen (' + tippZahl + ')'; } else kuerze(); }
    else if (a === 'ton') { einst.ton = einst.ton === 'aus' ? 'klang' : 'aus'; ton.einstellen({ art: einst.ton }); b.innerHTML = sym(einst.ton === 'aus' ? 'tonAus' : 'ton'); if (opt.merke) opt.merke({ ton: einst.ton }); }
    else if (a === 'ansage') { einst.ansage = !einst.ansage; ton.einstellen({ ansage: einst.ansage }); b.innerHTML = sym(einst.ansage ? 'ton' : 'tonAus'); if (opt.merke) opt.merke({ ansage: einst.ansage }); }
    else if (a === 'seitevorn') { einst.ansicht = einst.ansicht === 'vorn' ? 'seite' : 'vorn'; b.textContent = einst.ansicht === 'vorn' ? 'Seite' : 'Vorne'; if (an) an.ansicht(einst.ansicht); if (opt.merke) opt.merke({ ansicht: einst.ansicht }); }
    else if (a === 'ansicht' && an) { gross = !gross; host.classList.toggle('figur-gross', gross); f.groesse(kreisPx()); if (an.modus) an.modus(gross ? 'gross' : 'klein'); }
  }
  function aufraeumen() { host.removeEventListener('click', klick); document.removeEventListener('visibilitychange', sicht); removeEventListener('resize', lage); }
  host.addEventListener('click', klick);
  const sicht = () => { if (document.visibilityState === 'hidden') pause('hidden'); };
  const lage = () => { f.groesse(kreisPx()); letzteSek = -1; };
  document.addEventListener('visibilitychange', sicht); addEventListener('resize', lage);
  ton.beiStoerung = () => pause('ton');
  aktiv = { uhr, plan, pause, weiter, kuerze, beenden, f, get zustand() { return zustand; }, get an() { return an; }, _nachZaehlen: null };
  function los() { uhr.starte(plan); zustand = 'laeuft'; ton.starte(uhr, uhr.plan); }
  zaehleEin(los);
  return aktiv;
}
const WEG = { nase: 'Nase', mund: 'Mund', nase_oder_mund: 'Nase oder Mund', summen: 'Summen', links: 'Links', rechts: 'Rechts', sss: 'sss', fff: 'fff', brr: 'Lippen', strohhalm: 'Halm', vokal: 'Vokal', ha: 'Ha' };
const WORT_KURZ = { ein: 'ein', halten_voll: 'kurz halten', aus: 'aus' };
