// Atem – Bereich „Meditation“ (0.1.6): Liste der 12, Start-Blatt (Länge, Haltung, Einschlafen, Wissen & Quelle, Offline laden),
// Sprachwahl DE/EN/AR (AR rechts nach links), Schalter „Stimme sagt den Takt“, Offenlegung „Stimme künstlich erzeugt“.
// Wird erst beim Öffnen des Bereichs geladen (import()). Texte aus stimme/<sp>/ui.json (geprüfte Drehbuch-Texte, unverändert).
import { sym } from './symbole.js';
import { speicher } from './speicher.js';
import { erzeugeSpieler, allesLaden, istOffline, stimmenLoeschen, speicherBelegt, LAENGEN, zeitplan } from './meditation.js';

const BASIS = './stimme/';
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mmss = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const NAME = { de: 'Deutsch', en: 'English', ar: 'العربية', it: 'Italiano' };   // 020: + Italienisch
// Bedienwörter, die nicht in ui.json stehen
const W = {
  de: { pause: 'Pause', pausiert: 'Pausiert', weiter: 'Weiter', beenden: 'Beenden', fertig: 'Fertig', noch: 'noch', laedt: 'Lädt …', system: 'Systemstimme', loeschen: 'Gespeicherte Stimmen löschen', gespeichert: 'Dateien gespeichert', fehler: 'Keine Verbindung. Bitte später nochmal versuchen.', min: 'min', quellen: 'Quellen', leer: 'Was heißt „leer“?' },
  en: { pause: 'Pause', pausiert: 'Paused', weiter: 'Continue', beenden: 'End', fertig: 'Done', noch: 'left', laedt: 'Loading …', system: 'System voice', loeschen: 'Delete saved voices', gespeichert: 'files saved', fehler: 'No connection. Please try again later.', min: 'min', quellen: 'Sources', leer: 'What does “empty” mean?' },
  ar: { pause: 'إيقاف مؤقت', pausiert: 'متوقّف مؤقتًا', weiter: 'متابعة', beenden: 'إنهاء', fertig: 'تمّ', noch: 'المتبقّي', laedt: 'جارٍ التحميل…', system: 'صوت النظام', loeschen: 'حذف الأصوات المحفوظة', gespeichert: 'ملفات محفوظة', fehler: 'لا يوجد اتصال. حاول لاحقًا.', min: 'د', quellen: 'المصادر', leer: 'ما معنى «فارغًا»؟' },
  it: {"pause": "Pausa", "pausiert": "In pausa", "weiter": "Continua", "beenden": "Termina", "fertig": "Fatto", "noch": "mancano", "laedt": "Caricamento …", "system": "Voce di sistema", "loeschen": "Elimina le voci salvate", "gespeichert": "file salvati", "fehler": "Nessuna connessione. Riprova più tardi.", "min": "min", "quellen": "Fonti", "leer": "Che cosa significa «a vuoto»?"}   // 020: Italienisch
};
const HSYM = { liegen: 'liegen', sitzen: 'sitzen', sitzen_angelehnt: 'sitzen', im_bett: 'einschlafen' };
const STUFE_N = { gut: 3, mittel: 2, schwach: 1, unbelegt: 0 };
const STIL = `.md-spieler{position:fixed;inset:0;z-index:25;background:#05080c;color:#7d8a98;display:flex;flex-direction:column;padding:var(--st) var(--sr) var(--sb) var(--sl);touch-action:manipulation}
.md-mitte{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:0 24px;text-align:center}
.md-titel{font-size:17px;color:#8a97a6}.md-zeit{font-size:44px;font-weight:300;font-variant-numeric:tabular-nums;color:#5d6b7a;margin:0}
.md-text{font-size:17px;max-width:520px;min-height:4.5em;color:#7d8a98}.md-text[hidden]{display:block;visibility:hidden}.md-hinweis{font-size:13px;color:#4b5866}
.md-unten{display:flex;justify-content:center;align-items:center;gap:16px;padding:12px 16px 20px}.md-spieler .sz-pause{background:#0d1218;color:#8a97a6}
.md-sys{font-size:13px;color:var(--warnung)}.md-fort{height:4px;background:var(--rand);border-radius:2px;overflow:hidden}.md-fort i{display:block;height:100%;background:var(--akzent);width:0}
.md-buehne{height:220px;border-radius:20px;overflow:hidden;margin:4px 0 12px;position:relative}.md-spieler .md-buehne{width:min(78vw,300px);height:min(36vh,300px);margin:0;background:transparent}
.md-seite .chips.stufen{flex-wrap:wrap}[dir=rtl] .zeile .rechts{align-items:flex-start}[dir=rtl] .abz{margin:2px 0 2px 6px}
/* 020-nb H2: quer und niedrig – Figur links, Zeit/Text rechts, Pause und Mitlesen bleiben im Bild */
@media (orientation:landscape) and (max-height:560px){.md-mitte{display:grid;grid-template-columns:auto minmax(0,1fr);align-content:center;justify-content:center;column-gap:24px;row-gap:6px;text-align:start;padding:0 16px}.md-spieler .md-buehne{grid-row:1/span 4;width:min(40vw,280px);height:min(calc(100vh - 150px),280px)}.md-zeit{font-size:36px}.md-text{min-height:0;max-width:none}.md-text[hidden]{display:none}.md-unten{padding:4px 16px 8px}}`;
// 020-figur: Meditationsfigur (Kissen/Stuhl/Liegen, leuchtende Lunge, Gold- oder Lila-Licht); figur.js lädt erst hier
const figLicht = (id, wahl) => speicher.einst().med_licht || (id === 'einschlafen' || wahl.schlaf || wahl.haltung === 'im_bett' ? 'lila' : 'gold');
function figurIn(host, id, wahl) { if (!host) return Promise.resolve(null); return import('./figur.js').then((F) => { if (!host.isConnected) return null; const f = F.erzeugeFigur(host, { pose: F.poseAusHaltung(wahl.haltung, speicher.einst().med_sitz), licht: figLicht(id, wahl) }); f.laufe(); f.F = F; return f; }, () => { host.hidden = true; return null; }); }
function stil() { if (!document.getElementById('md-stil')) { const s = document.createElement('style'); s.id = 'md-stil'; s.textContent = STIL; document.head.appendChild(s); } }

let cache = {}, spieler = null;
const holeJson = async (p) => cache[p] || (cache[p] = fetch(BASIS + p).then((r) => { if (!r.ok) throw new Error(p); return r.json(); }).catch((f) => { delete cache[p]; throw f; }));
export function sprache() { const e = speicher.einst(); if (e.stimme_sprache) return e.stimme_sprache; const n = (navigator.language || 'de').slice(0, 2); return NAME[n] ? n : 'de'; }
async function daten(sp) { const [man, ui] = await Promise.all([holeJson(sp + '/manifest.json'), holeJson(sp + '/ui.json')]); return { man, ui, O: ui.oberflaeche, w: W[sp] }; }
const rahmenAttr = (sp, ui) => `dir="${ui.richtung === 'rtl' ? 'rtl' : 'ltr'}" lang="${sp}"`;
const titelSprache = (sp, ui) => { const t = document.getElementById('titel'); if (t) { t.setAttribute('dir', ui.richtung === 'rtl' ? 'rtl' : 'ltr'); t.setAttribute('lang', sp); } };   // 016-nb N5 (app.js seite() setzt zurück)
export function abzeichen(stufe, O, knapp) {   // knapp (Liste, 020-nb): nur die drei Balken, Wort als Bezeichnung (Detailseite zeigt es ausgeschrieben)
  const n = STUFE_N[stufe] ?? 0, bal = [0, 1, 2].map((k) => `<rect x="${k * 6}" y="${10 - (k + 1) * 3}" width="4" height="${(k + 1) * 3}" rx="1" class="${k < n ? 'voll' : 'leer'}"/>`).join(''), wort = esc((O.belegstaerke_namen || {})[stufe] || stufe);
  return knapp ? `<span class="abz abz-${stufe}" role="img" aria-label="${wort}" title="${wort}"><svg viewBox="0 0 16 10" aria-hidden="true">${bal}</svg></span>` : `<span class="abz abz-${stufe}"><svg viewBox="0 0 16 10" aria-hidden="true">${bal}</svg><span>${wort}</span></span>`;
}
const dauerSpanne = (m) => { const d = LAENGEN.map((L) => m.laengen[L]).filter(Boolean).map((x) => Math.round(x.ziel_s / 60)); return d[0] + '–' + d[d.length - 1]; };
const sprachWahl = (sp) => `<div class="chips md-sp" role="radiogroup">${Object.keys(NAME).map((k) => `<button class="chip ${k === sp ? 'an' : ''}" data-sp="${k}" lang="${k}" role="radio" aria-checked="${k === sp}">${NAME[k]}</button>`).join('')}</div>`;

// ---------- Liste ----------
export async function zeigeListe(api) {
  stil(); const sp = sprache();
  api.seite('Meditation', `<p class="leise">${esc(W[sp].laedt)}</p>`, 'meditation', 1);
  let D; try { D = await daten(sp); } catch { return api.seite('Meditation', `${sprachWahl(sp)}<p class="hinweis">${esc(W[sp].fehler)}</p>`, 'meditation', 1); }
  const { man, ui, O, w } = D, e = speicher.einst(), info = Object.fromEntries(ui.liste.map((x) => [x.id, x]));
  api.seite(O.bereich_titel, `<div class="md-seite" data-id="" ${rahmenAttr(sp, ui)}>${sprachWahl(sp)}<p>${esc(O.bereich_untertitel)}</p>
    <div class="liste2">${man.meditationen.map((m) => { const x = info[m.id] || {}, st = (x.wissen || {}).belegstaerke;
      return `<a class="zeile" href="#meditation/${m.id}"><span><b>${esc(m.titel)}</b><small>${esc((x.zweck_namen || [])[0] || '')}</small></span><span class="rechts"><span>${dauerSpanne(m)} ${w.min}</span>${st ? abzeichen(st, O, true) : ''}<span class="haltung-sym">${[...new Set(m.haltung.map((h) => HSYM[h]))].map((h) => sym(h)).join('')}</span></span></a>`; }).join('')}</div>
    <div class="karte"><label class="schalter"><span><b>${esc(O.atem_stimme.schalter)}</b></span><input type="checkbox" id="md-takt" ${e.ansage === 'stimme' ? 'checked' : ''}></label>
      <p class="leise">${esc(O.atem_stimme.schalter_hinweis)}</p><details><summary>${esc(w.leer)}</summary><p class="leise">${esc(O.atem_stimme.leer_erklaerung)}</p></details></div>
    <p class="leise md-offen">${esc(O.offenlegung_stimme)}</p>
    <button class="knopf zweit voll" id="md-loeschen">${esc(w.loeschen)}</button><p class="leise" id="md-belegt"></p></div>`, 'meditation', 1);
  titelSprache(sp, ui);
  speicherBelegt().then((n) => { const p = document.getElementById('md-belegt'); if (p && n) p.textContent = n + ' ' + w.gespeichert; });
  const i = document.querySelector('.md-seite');
  i.onclick = async (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.sp) { speicher.setzeEinst({ stimme_sprache: b.dataset.sp }); if (api.taktGeaendert) api.taktGeaendert(); zeigeListe(api); }   // B3: Takt-Stimme gleich in der neuen Sprache vorbereiten
    else if (b.id === 'md-loeschen') { await stimmenLoeschen(); const p = document.getElementById('md-belegt'); if (p) p.textContent = ''; }
  };
  document.getElementById('md-takt').onchange = (ev) => { speicher.setzeEinst({ ansage: ev.target.checked ? 'stimme' : false }); if (api.taktGeaendert) api.taktGeaendert(ev.target.checked); };
}

// ---------- Start-Blatt ----------
export async function zeigeMeditation(api, id) {
  stil(); const sp = sprache();
  let D; try { D = await daten(sp); } catch { return zeigeListe(api); }
  const { man, ui, O, w } = D, m0 = man.meditationen.find((x) => x.id === id); if (!m0) return zeigeListe(api);
  const x = (ui.liste.find((y) => y.id === id)) || {}, wi = x.wissen || {}, SB = O.start_blatt;
  const e = speicher.einst(), wahl = { laenge: (e.med_laenge && m0.laengen[e.med_laenge]) ? e.med_laenge : 'normal', haltung: m0.haltung[0], schlaf: false };
  if (!m0.laengen[wahl.laenge]) wahl.laenge = LAENGEN.find((L) => m0.laengen[L]);
  wahl.schlaf = m0.schlaf_modus && wahl.haltung === 'im_bett';
  const mb = (m0.kb / 1024).toFixed(1).replace('.', sp === 'de' || sp === 'it' ? ',' : '.');
  let med = null;   // Knöpfe sofort bedienbar (vor dem Laden des Manifests), sonst gehen frühe Tipps verloren
  // 016-nb N3: im Einschlaf-Modus zählt die Schluss-Stille mit (echte Dauer aus dem Zeitplan, sobald das Manifest da ist)
  const minuten = (L) => Math.round((wahl.schlaf && med && med.laengen[L] ? zeitplan(med, L, true).gesamt : m0.laengen[L].ziel_s) / 60);
  const chipText = (L) => m0.laengen[L] ? SB.laenge_minuten.replace('{laenge}', SB[L]).replace('{min}', minuten(L)) : SB[L];
  const male = () => {   // 020: nur die Chips (die Figur nutzt data-l für ihre Lungenflügel)
    document.querySelectorAll('.md-seite button[data-l]').forEach((c) => { const t = chipText(c.dataset.l); if (c.textContent !== t) c.textContent = t; });
    document.querySelectorAll('.md-seite button[data-l]').forEach((c) => c.classList.toggle('an', c.dataset.l === wahl.laenge));
    document.querySelectorAll('.md-seite button[data-h]').forEach((c) => c.classList.toggle('an', c.dataset.h === wahl.haltung));
    const ht = document.getElementById('md-ht'); if (ht) ht.textContent = (O.haltungen || {})[wahl.haltung] || '';
    const s = document.getElementById('md-schlaf'); if (s) s.checked = wahl.schlaf;
    const f = document.getElementById('md-fahr'); if (f) f.textContent = id === 'einschlafen' || wahl.schlaf ? SB.nicht_fahren_einschlafen : SB.nicht_fahren;
    if (fig && fig.F) { fig.pose(fig.F.poseAusHaltung(wahl.haltung, speicher.einst().med_sitz)); fig.licht(figLicht(id, wahl)); }   // 020-figur
  };
  api.seite(m0.titel, `<div class="md-seite zweispaltig" data-id="${id}" ${rahmenAttr(sp, ui)}><div>${sprachWahl(sp)}<div class="md-buehne nachtbuehne" id="md-buehne" aria-hidden="true"></div>
    <p>${esc(x.untertitel)}</p>${x.start_hinweis ? `<p class="leise">${esc(x.start_hinweis)}</p>` : ''}<p class="leise">${esc(x.wirkung)}</p>
    <h3>${esc(SB.laenge)}</h3><div class="chips stufen">${LAENGEN.map((L) => `<button class="chip" data-l="${L}" ${m0.laengen[L] ? '' : 'disabled'}>${esc(chipText(L))}</button>`).join('')}</div>
    <h3>${esc(SB.haltung)}</h3><div class="chips">${m0.haltung.map((h) => `<button class="chip" data-h="${h}">${esc((O.haltung_kurz || {})[h] || h)}</button>`).join('')}</div>
    <p class="haltung"><span class="haltung-sym">${sym(HSYM[m0.haltung[0]])}</span><span id="md-ht"></span></p><p class="leise">${esc((O.haltungen || {}).augen)}</p>
    ${m0.schlaf_modus ? `<label class="schalter"><span><b>${esc(SB.schlaf_modus)}</b><small class="leise" style="display:block">${esc(SB.schlaf_modus_hinweis)}</small></span><input type="checkbox" id="md-schlaf"></label>` : ''}
    <p class="hinweis">${sym('warnung', 'warn')} <span id="md-fahr"></span></p>
    ${(x.gegenhinweise || []).length ? `<ul>${x.gegenhinweise.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}</div>
    <div><details class="karte"><summary>${esc(O.wissen_titel)}</summary>${wi.belegstaerke ? `<div class="belege">${abzeichen(wi.belegstaerke, O)}</div>` : ''}
      ${wi.belegstaerke_detail ? `<p class="leise">${esc(wi.belegstaerke_detail)}</p>` : ''}<p>${esc(wi.beleg)}</p><p class="leise">${esc(wi.ehrlich)}</p>
      <h3>${esc(w.quellen)}</h3><ul class="quellen">${(wi.quellen || []).map((q) => ui.quellen[q]).filter(Boolean).map((q) => `<li><a href="${esc(q.link)}" target="_blank" rel="noopener">${esc(q.kurz)}</a> <small>${esc(q.art || '')}</small></li>`).join('')}</ul></details>
    <button class="knopf zweit voll" id="md-laden">${esc(SB.laden.replace('{mb}', mb))}</button><div class="md-fort" hidden><i></i></div>
    <button class="knopf haupt voll startknopf" id="md-los">${sym('play')}<span>${esc(SB.starten)}</span></button>
    <p class="leise mitte">${esc(SB.augen_zu)}</p><p class="leise md-offen">${esc(O.offenlegung_stimme)}</p></div></div>`, 'meditation', 2);
  let fig = null; figurIn(document.getElementById('md-buehne'), id, wahl).then((f) => { fig = f; });   // 020-figur
  male(); titelSprache(sp, ui);
  const root = document.querySelector('.md-seite');
  root.onclick = async (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.sp) { speicher.setzeEinst({ stimme_sprache: b.dataset.sp }); if (api.taktGeaendert) api.taktGeaendert(); return zeigeMeditation(api, id); }
    if (b.dataset.l) { wahl.laenge = b.dataset.l; speicher.setzeEinst({ med_laenge: wahl.laenge }); male(); }
    else if (b.dataset.h) { wahl.haltung = b.dataset.h; if (m0.schlaf_modus) wahl.schlaf = wahl.haltung === 'im_bett'; male(); }
    else if (b.id === 'md-laden' && med) {
      const f = document.querySelector('.md-fort'), bal = f.firstChild; f.hidden = false; b.disabled = true;
      const r = await allesLaden(BASIS, sp, med, (n, g) => { bal.style.width = Math.round(100 * n / g) + '%'; });
      b.textContent = r.fehler ? SB.offline_fehlt : SB.geladen; b.disabled = !r.fehler; f.hidden = true;
    } else if (b.id === 'md-los') starte(api, sp, D, m0, med, wahl);
  };
  const s = document.getElementById('md-schlaf'); if (s) s.onchange = () => { wahl.schlaf = s.checked; male(); };
  med = await holeJson(sp + '/' + m0.manifest).catch(() => null);
  if (med && document.body.contains(root)) male();   // N3
  if (med && document.body.contains(root) && (await istOffline(BASIS, sp, med))) { const k = document.getElementById('md-laden'); if (k) { k.textContent = SB.geladen; k.disabled = true; } }
}

// ---------- Erst-Hinweis + Spieler ----------
async function erstHinweis(api, sp, D) {
  const si = speicher.sicherheit(); if (si.med_erst) return true;
  const { O, ui } = D, bild = ['warnung', 'lenkradAus', 'kreis', 'liegen', 'telefon'];
  const w = await api.blatt(`<div ${rahmenAttr(sp, ui)}><h2>${esc(O.erststart_titel)}</h2><ul class="sicher-liste">${O.erststart.map((t, i) => `<li>${sym(bild[i] || 'warnung', 'gross')}<span>${esc(t)}</span></li>`).join('')}</ul>
    <p class="hinweis">${esc(O.erststart_vorsicht)}</p><p class="leise">${esc(O.nebenwirkungen)}</p><button class="knopf haupt voll" data-w="ok">${esc(O.erststart_knopf)}</button></div>`);
  if (w !== 'ok') return false;
  speicher.setzeSicherheit({ med_erst: new Date().toISOString() }); return true;
}
async function starte(api, sp, D, m0, med, wahl) {
  if (spieler) spieler.beenden('gestoppt');
  let beiStand = null, beiEnde = null;
  const sp0 = erzeugeSpieler({ basis: BASIS, laut: speicher.einst().laut, bereich: D.O.bereich_titel, beiStand: (s) => beiStand && beiStand(s), beiEnde: (r) => beiEnde && beiEnde(r) });
  sp0.entsperren();   // im Tipp, vor jedem await (iOS)
  if (!(await erstHinweis(api, sp, D))) return;
  spieler = sp0;
  if (!med) { try { med = await sp0.lade(sp, m0.kurz); } catch { return api.blatt(`<div ${rahmenAttr(sp, D.ui)}><p class="hinweis">${esc(D.w.fehler)}</p><button class="knopf voll" data-w="ok">OK</button></div>`); } }
  sp0.setzeManifest(med, sp);
  const { O, w, ui } = D, host = api.host || document.body, v = document.createElement('div');
  v.className = 'md-spieler'; v.setAttribute('dir', ui.richtung === 'rtl' ? 'rtl' : 'ltr'); v.setAttribute('lang', sp);
  v.innerHTML = `<div class="sz-kopf"><button class="knopf-ico" data-m="ende" aria-label="${esc(w.beenden)}">${sym('schliessen')}</button><div class="sz-titel md-titel">${esc(m0.titel)}</div><span style="width:44px"></span></div>
    <div class="md-mitte"><div class="md-buehne" aria-hidden="true"></div><p class="md-zeit"></p><p class="md-text" hidden></p><p class="md-sys" hidden>${esc(w.system)}</p><p class="md-hinweis">${esc(O.stopp_hinweis)}</p></div>
    <div class="md-unten"><button class="sz-pause" data-m="pause" aria-label="${esc(w.pause)}">${sym('pause')}</button><button class="knopf klein zweit" data-m="mitlesen">${esc(O.start_blatt.mitlesen)}</button></div><div class="sz-blatt" hidden></div>`;
  host.appendChild(v); document.body.classList.add('in-sitzung');
  let sfig = null; figurIn(v.querySelector('.md-buehne'), m0.id, wahl).then((f) => { sfig = f; });   // 020-figur: Kranz atmet 12 s, Perlen ruhig (kein Takt)
  const $ = (s) => v.querySelector(s), ab = performance.now();
  const blattZeigen = (html) => { const b = $('.sz-blatt'); b.innerHTML = '<div class="blatt-innen">' + html + '</div>'; b.hidden = false; b.dataset.art = ''; if (api.tippSperre) api.tippSperre(); };
  const zu = () => { if (sfig) sfig.zerstoere(); v.remove(); if (!document.querySelector('.md-spieler')) document.body.classList.remove('in-sitzung'); spieler = null; if (api.neuLaden && api.neuLaden()) location.reload(); };   // B1: neue Fassung erst nach der Meditation
  const pauseBlatt = () => { const b = $('.sz-blatt'); if (!b.hidden && b.dataset.art === 'pause') return; blattZeigen(`<h2>${esc(w.pausiert)}</h2><button class="knopf haupt voll" data-m="weiter">${esc(w.weiter)}</button><button class="knopf voll" data-m="ende">${esc(w.beenden)}</button>`); b.dataset.art = 'pause'; };
  const stand = (s) => {
    const b = $('.sz-blatt');   // B2: jede Pause (Knopf, Störung, Sperrbildschirm) zeigt „Weiter“; läuft es wieder (Sperrbildschirm „Play“), verschwindet das Blatt
    if (s.zustand === 'pause') pauseBlatt(); else if (s.zustand === 'laeuft' && !b.hidden && b.dataset.art === 'pause') { b.hidden = true; b.dataset.art = ''; }
    $('.md-zeit').textContent = mmss(s.rest); $('.md-sys').hidden = !s.system;
    const t = $('.md-text'); if (t.textContent !== s.text) t.textContent = s.text;
  };
  v.onclick = (ev) => {
    const b = ev.target.closest('[data-m]');
    if (!b) { if (!ev.target.closest('.sz-blatt') && sp0.zustand === 'laeuft' && performance.now() - ab > 1000) sp0.beenden('gestoppt'); return; }   // Tippen irgendwo beendet (nicht in der 1. Sekunde)
    const a = b.dataset.m;
    if (a === 'ende') sp0.beenden('gestoppt');
    else if (a === 'pause') { sp0.pause(); if (sp0.zustand === 'pause') pauseBlatt(); }
    else if (a === 'weiter') { const b = $('.sz-blatt'); b.hidden = true; b.dataset.art = ''; sp0.weiter(); }
    else if (a === 'mitlesen') { const t = $('.md-text'); t.hidden = !t.hidden; }
    else if (a === 'zu') zu();
  };
  const fertig = (r) => {
    const s = Math.round(r.t);
    try { speicher.eintrag({ t: new Date().toISOString(), technik: 'med:' + m0.id, sprache: sp, laenge: wahl.laenge, schlaf: wahl.schlaf, ist_s: s, plan_s: Math.round(r.gesamt), ende: r.grund, quelle: 'meditation', system: r.system }); } catch {}   // B6: auch im Einschlaf-Modus
    if (r.grund === 'fertig' && wahl.schlaf) return zu();   // Einschlafen: still aufhören, kein Blatt
    blattZeigen(`<h2>${esc(r.grund === 'fertig' ? w.fertig : w.beenden)} · ${mmss(Math.min(s, r.gesamt))}</h2><button class="knopf haupt voll" data-m="zu">${esc(w.fertig)}</button>`);
  };
  beiStand = stand; beiEnde = fertig;
  await sp0.starte({ laenge: wahl.laenge, schlaf: wahl.schlaf });
  return sp0;
}
export const aktiverSpieler = () => spieler;
// Einstieg für app.js: route() → case 'meditation': import('./meditation-seite.js').then((m) => m.zeige(api, b))
export function zeige(api, id) { return id ? zeigeMeditation(api, id) : zeigeListe(api); }
