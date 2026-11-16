// Atem – „Übung läuft“ (KONZEPT §2.7, §4.4)
import { erzeugeUhr } from './uhr.js';
import { ton } from './ton.js';
import { erzeugeFuehrung, phasenFarbe, querKreis } from './fuehrung.js';
import { sym } from './symbole.js';
import { MUSKELN } from './daten.js';

const $ = (s, r = document) => r.querySelector(s);
const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let aktiv = null;
export const laeuft = () => aktiv;

export function oeffne(plan, opt) {
  if (aktiv) aktiv.beenden('gestoppt', true);
  const { T, einst = {}, quelle = 'frei', beiEnde, riskant = false, test = false } = opt;
  const host = $('#sitzung'); host.classList.remove('figur-gross', 'eng'); host.classList.toggle('riskant', riskant);
  const kk = plan.runden > 0;
  host.classList.toggle('mit-kk', kk);
  const ruhigMedia = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ruhig = !!einst.ruhig || ruhigMedia;
  host.innerHTML = `
    <div class="sz-kopf"><button class="knopf-ico" data-a="beenden" aria-label="Beenden">${sym('schliessen')}</button>
      <div class="sz-titel">${plan.name}</div>
      <button class="knopf-ico" data-a="ton" aria-label="Ton an oder aus">${sym(einst.ton === 'aus' ? 'tonAus' : 'ton')}</button></div>
    <div class="sz-haupt">
      ${kk ? '<div class="sz-kk-block"><div class="sz-kk" role="status"><b class="sz-kk-runde"></b><span class="sz-kk-phase"></span></div>' : ''}<div class="sz-kreis"><canvas></canvas><div class="sz-mitte"><div class="sz-wort">Gleich geht's los</div><div class="sz-zahl">3</div><div class="sz-hinweis"></div></div></div>${kk ? '</div>' : ''}
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
  // hochkant + Karte: Kreis bei knappem Platz bis Kartenhöhe kleiner
  const knopfPlan = kk && plan.schritte.some((x) => x.kuerzbar && /^halten/.test(x.art));
  const kreisHoch = () => {
    const K = Math.min(320, innerWidth - 60), q = (s) => $(s, host), h = kk ? q('.sz-kk').offsetHeight : 0, tab = q('.sz-tab');
    if (!h) return K;
    const frei = q('.sz-haupt').clientHeight - (knopfPlan && q('.sz-atmen').hidden && q('.sz-stopp').hidden ? 104 : 0) - 28 - K - q('.sz-zeile').offsetHeight - (tab ? tab.offsetHeight + 8 : 0) - (q('.sz-anat.aus') ? 0 : 170);
    const r = K - h + Math.min(h, Math.max(0, Math.floor(frei))); host.style.setProperty('--kk-b', r + 'px'); return r;
  };
  const spalte = plan.offen || T.id === 'ruhe_zuege' || plan.schritte.some((x) => x.kuerzbar && /^halten/.test(x.art));
  const sT = T.id === 'kontrollpause' ? 'Erster Atemreiz – Stopp' : T.id === 'sss_messen' ? 'Luft aus – Stopp' : 'Atmen';
  const zx = plan.schritte.reduce((a, x) => (/^halten|^ruhe$/.test(x.art) || (WEG[x.weg] || '').length <= a.length ? a : WEG[x.weg]), ''), zn = Math.max(0, ...plan.schritte.map((x) => x.zuege || 0));
  const kreisPx = () => (quer() ? querKreis(host, { gross, riskant, kk, spalte, zt: [zx && sym('nase') + '<span>' + zx + '</span>', zugText({ runden: plan.runden, runde: plan.runden, zuege: zn, zug: zn }), 'noch ' + mmss(plan.gesamt_ms), plan.offen && sT] }) : (host.classList.remove('eng'), gross ? 120 : kreisHoch()));
  let gross = false;
  const f = erzeugeFuehrung(cv, { ruhig, blumen: einst.blumen !== false, px: kreisPx() });
  const uhr = erzeugeUhr();
  let an = null, raf = 0, letzteSek = -1, letzterI = -1, zustand = 'zaehlen', zaehlStart = performance.now(), wake = null, offenWand = null, tippZahl = 0, gekuerzt = [];
  const el = { wort: $('.sz-wort', host), zahl: $('.sz-zahl', host), hinweis: $('.sz-hinweis', host), weg: $('.sz-weg', host), zug: $('.sz-zug', host), rest: $('.sz-rest', host), atmen: $('.sz-atmen', host), stopp: $('.sz-stopp', host), blatt: $('.sz-blatt', host), anat: $('.sz-anat', host), kkRunde: $('.sz-kk-runde', host), kkPhase: $('.sz-kk-phase', host) };
  // Kopfkarte: Abschnitt; nach dem letzten Halten einer Tabelle „Erholung“
  let kkText = '';
  const letztesHalten = kk ? plan.schritte.reduce((a, x, k) => (x.abschnitt === 'halten' ? k : a), -1) : -1;
  function kopfkarte(s, i) {
    if (!kk) return;
    const [wort, art] = s.abschnitt === 'ruhe' ? ['Ruhe', 'ruhe'] : plan.modus === 'tabelle' ? (s.abschnitt === 'halten' ? ['Halten', 'halten'] : i > letztesHalten ? ['Erholung', 'ruhe'] : ['Pause', 'pause']) : s.zug > 0 ? ['Atemzüge', 'zuege'] : s.abschnitt === 'halten' ? ['Anhalten', 'halten'] : [s.wort, 'zuege'];
    const t = 'Runde ' + (s.runde || 1) + '/' + (s.runden || plan.runden) + '|' + wort;
    if (t === kkText) return; kkText = t;
    el.kkRunde.textContent = 'Runde ' + (s.runde || 1) + '/' + (s.runden || plan.runden); el.kkPhase.textContent = wort; el.kkPhase.dataset.art = art;
  }
  kopfkarte(plan.schritte[0], 0);
  // Zeile: Runde steht in der Kopfkarte – außer quer bei „Figur groß“
  function zeile(s) { el.zug.textContent = zugText(s); }
  function zugText(s) {
    return kk && !(gross && quer()) ? (s.zuege && s.zug ? 'Zug ' + s.zug + '/' + s.zuege : '')
      : s.runden ? 'Runde ' + s.runde + '/' + s.runden + (s.zuege && s.zug ? ' · Zug ' + s.zug + '/' + s.zuege : '') : s.zuege ? 'Zug ' + s.zug + '/' + s.zuege : '';
  }
  const zeileNeu = () => { if (kk && uhr.plan) zeile(uhr.zustand().schritt); };
  if (einst.figur !== false) import('./anatomie.js').then((m) => { if (!aktiv || aktiv.uhr !== uhr) return; an = m.erzeugeAnatomie(el.anat, { ansicht: einst.ansicht || 'seite', modus: gross ? 'gross' : 'klein', daten: { MUSKELN } }); figurRuhe(); }).catch(() => { el.anat.classList.add('aus'); });
  ton.einstellen({ art: einst.ton || 'klang', laut: einst.laut ?? 0.6, sekunden: !!einst.sekunden, ansage: !!einst.ansage });
  ton.entsperren(einst.musik);
  holeWake();
  async function holeWake() { try { if (navigator.wakeLock && document.visibilityState === 'visible') { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch { wake = null; } }
  const lasseWake = () => { try { if (wake) wake.release(); } catch {} wake = null; };

  // Figur in Ruhelage (Einzählen), v = 0 wie der Kreis
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
    el.wort.style.color = s.art === 'halten_leer' ? '#8d9cc0' : phasenFarbe(s.art);
    el.weg.innerHTML = s.art.startsWith('halten') || s.art === 'ruhe' ? '' : sym(s.weg === 'summen' ? 'summen' : s.weg === 'mund' || s.weg === 'ha' || s.weg === 'vokal' ? 'mund' : s.weg === 'links' ? 'links' : s.weg === 'rechts' ? 'rechts' : 'nase') + '<span>' + WEG[s.weg] + '</span>';
    zeile(s);
    kopfkarte(s, z.i);
    const offen = s.ms == null;
    el.atmen.hidden = !(s.kuerzbar && !offen && (s.art.startsWith('halten')));
    el.stopp.hidden = !offen;
    if (offen) { offenWand = Date.now(); tippZahl = 0; el.stopp.textContent = sT; }
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
    zaehleEin(uhr.plan ? () => { uhr.weiter(); zustand = 'laeuft'; letzterI = -1; letzteSek = -1; ton.starte(uhr, uhr.plan); } : los);
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
  function schliessen() { host.hidden = true; host.innerHTML = ''; host.classList.remove('figur-gross', 'mit-kk', 'eng'); document.body.classList.remove('in-sitzung'); if (an && an.zerstoere) an.zerstoere(); }
  function klick(e) {
    if (!wake && zustand === 'laeuft') holeWake();
    const b = e.target.closest('[data-a]'); if (!b) { if (e.target.closest('.sz-anat') && an) { gross = !gross; host.classList.toggle('figur-gross', gross); f.groesse(kreisPx()); if (an.modus) an.modus(gross ? 'gross' : 'klein'); zeileNeu(); } return; }
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
    else if (a === 'ansicht' && an) { gross = !gross; host.classList.toggle('figur-gross', gross); f.groesse(kreisPx()); if (an.modus) an.modus(gross ? 'gross' : 'klein'); zeileNeu(); }
  }
  function aufraeumen() { host.removeEventListener('click', klick); document.removeEventListener('visibilitychange', sicht); removeEventListener('resize', lage); }
  host.addEventListener('click', klick);
  const sicht = () => { if (document.visibilityState === 'hidden') pause('hidden'); };
  const lage = () => { f.groesse(kreisPx()); letzteSek = -1; zeileNeu(); };
  document.addEventListener('visibilitychange', sicht); addEventListener('resize', lage);
  ton.beiStoerung = () => {};   // 0.1.2.1: Ton-Störung (iOS „interrupted“) hält die Übung nicht an
  aktiv = { uhr, plan, pause, weiter, kuerze, beenden, f, get zustand() { return zustand; }, get an() { return an; }, _nachZaehlen: null };
  function los() { uhr.starte(plan); zustand = 'laeuft'; ton.starte(uhr, uhr.plan); }
  zaehleEin(los);
  return aktiv;
}
const WEG = { nase: 'Nase', mund: 'Mund', nase_oder_mund: 'Nase oder Mund', summen: 'Summen', links: 'Links', rechts: 'Rechts', sss: 'sss', fff: 'fff', brr: 'Lippen', strohhalm: 'Halm', vokal: 'Vokal', ha: 'Ha' };
const WORT_KURZ = { ein: 'ein', halten_voll: 'kurz halten', aus: 'aus' };
