// 020-ziele: Fortschritt (nur auf dem Gerät). Wochen-Blume, Tagesreihe, Summen, Selbst-Einschätzungen als ruhige Kurve, „Was ist belegt“ mit Quelle.
// Keine „Serie verloren“-Meldung, kein Rot, keine Ampel (recherche/ziele.json fortschritt.f_tage, wochenrueckblick.regeln).
import { speicher } from './speicher.js';
import { zustand, zielInfo, heute, tagKey, geuebt, blume, zeile, esc, leds, selbst, selbstWert, stil, PLAN, name, dauer } from './ziele.js';
import * as D from './ziele-daten.js';

const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const mittel = (a) => a.length ? Math.round(10 * a.reduce((x, y) => x + y, 0) / a.length) / 10 : null;
const zahl = (x) => x == null ? '–' : String(x).replace('.', ',');
// Wochenmittel je Programmwoche (1–4) einer Selbst-Einschätzung
function wochen(art, z) {
  const s = selbst().filter((x) => x.a === art), st = new Date(z.start + 'T12:00:00');
  const w = [[], [], [], []]; for (const x of s) { const i = Math.floor((new Date(x.t) - st + 12 * 3600e3) / (7 * 864e5)); if (i >= 0 && i < 4) w[i].push(x.w); }
  return w.map(mittel);
}
function kurve(reihen, max) {   // ruhige Linie, 4 Punkte (Wochen), statisch
  const X = (i) => 10 + i * 93, Y = (v) => 50 - (v / max) * 42;
  return `<svg class="zl-kurve" viewBox="0 0 300 56" aria-hidden="true"><line x1="0" y1="50" x2="300" y2="50" stroke="var(--zl-li)"/>${reihen.map(([w, k]) => { const p = w.map((v, i) => v == null ? null : X(i) + ',' + Y(v)).filter(Boolean);
    return p.length ? `<polyline class="${k}" points="${p.join(' ')}"/>${k === 'nach' ? p.map((q) => `<circle cx="${q.split(',')[0]}" cy="${q.split(',')[1]}" r="3"/>`).join('') : ''}` : ''; }).join('')}</svg>`;
}
const quellenHtml = (ids) => `<ul class="zl-leise">${ids.map((id) => D.Q[id]).filter(Boolean).map((q) => `<li><a class="zl-link" href="${esc(q.l)}" target="_blank" rel="noopener">${esc(q.k)}</a> <small>${esc(q.o || '')} · ${esc(q.a || '')}</small></li>`).join('')}</ul><p class="zl-mini">Links brauchen Internet.</p>`;

export function fuelle(box, ctx = {}) {
  stil(); box.classList.add('zl');
  const z = zustand(), h = heute(), heuteK = tagKey(new Date());
  const tage = h.fenster.map((f) => `<span class="zl-tag"><i class="${geuebt(h.m[tagKey(f)]) ? 'an' : ''}${tagKey(f) === heuteK ? ' heute' : ''}"></i>${WT[f.getDay()]}</span>`).join('');
  const summen = `<div class="zl-karte zl-stat"><div><span class="zl-zahl">${h.gesamtTage}</span><small>Übungstage</small></div><div><span class="zl-zahl">${h.gesamtMin}</span><small>Minuten</small></div><div><span class="zl-zahl">${h.serie >= 2 ? h.serie : '–'}</span><small>Tage in Folge</small></div></div>`;
  if (!z) {
    const n = h.fenster.filter((f) => geuebt(h.m[tagKey(f)])).length;
    box.innerHTML = `<div class="zl-karte"><span class="zl-ueber">Diese Woche</span><div class="zl-ziel">${blume(h.fenster.map((f) => geuebt(h.m[tagKey(f)])), 96)}<span><b>${n} von 7 Tagen</b></span></div><div class="zl-tage">${tage}</div></div>${summen}
      <div class="zl-karte">${zeile('#ziel', 'Ziel wählen', 'Programm mit Fortschritt')}${zeile('#erinnerung', 'Erinnerung')}${zeile('#health', 'Achtsamkeitsminuten')}</div>`;
    return;
  }
  const zi = zielInfo(z.id), T = D.ZT[z.id], P = D.PT[z.p], wi = h.woche;
  const seg = [1, 2, 3, 4].map((i) => `<i class="${i < wi || h.fertig ? 'an' : i === wi ? 'jetzt' : ''}"></i>`).join('');
  const erw = P.e[wi >= 4 ? '4' : wi >= 2 ? '2' : '1'] || P.e['1'];
  const fs = T.f.filter((f) => f !== 'f_tage');
  let mess = '';
  for (const f of fs) {
    const F = D.F[f]; if (!F) continue;
    if (f === 'f_stress') { const v = wochen('stress_vor', z), n = wochen('stress_nach', z), lv = v.filter((x) => x != null).pop(), ln = n.filter((x) => x != null).pop();
      mess += `<div class="zl-karte"><span class="zl-ueber">Anspannung, selbst eingeschätzt</span>${n.some((x) => x != null) ? `<p>Vorher ${zahl(lv)} · nachher ${zahl(ln)} <small class="zl-leise">(0–10, Wochenmittel)</small></p>${kurve([[v, 'vor'], [n, 'nach']], 10)}` : '<p class="zl-leise">Nach einer Übung kannst du sie freiwillig eintragen.</p>'}<p class="zl-mini">${esc(F.d || '')}</p></div>`; }
    else if (f === 'f_ruhe_af') { const m = (speicher.messwerte()['M-AF'] || []).filter((x) => x.t >= z.start); const a = m[0], b = m[m.length - 1];
      mess += `<div class="zl-karte"><span class="zl-ueber">Ruhe-Atemzüge pro Minute</span>${a ? `<p>${a.n}${b !== a ? ' → ' + b.n : ''} pro Minute</p>` : '<p class="zl-leise">Einmal zu Beginn und am Ende zählen – sitzend, gleiche Tageszeit.</p>'}
        <a class="zl-link" href="#uebung/ruhe_zuege">Jetzt zählen · 1 min</a><p class="zl-mini">${esc(F.d || '')}</p></div>`; }
    else { const art = { f_leichtigkeit: 'leicht', f_einschlafen: 'einschlafen', f_erholt: 'erholt', f_fokus: 'fokus', f_imt_stufe: 'imt_stufe' }[f]; if (!art) continue;
      const w = wochen(art, z), max = art === 'einschlafen' ? 120 : 10, l = w.filter((x) => x != null).pop();
      mess += `<div class="zl-karte"><span class="zl-ueber">${esc(F.n)}</span>${w.some((x) => x != null) ? `<p>Diese Woche im Mittel: ${zahl(l)}${art === 'einschlafen' ? ' min' : ''}</p>${kurve([[w, 'nach']], max)}` : ''}
        <details><summary>Eintragen (freiwillig)</summary><label class="zl-schieber"><span>${art === 'einschlafen' ? 'Minuten' : '0–10'}</span> <b id="zl-w-${art}">${art === 'einschlafen' ? 20 : 5}</b><input type="range" min="${art === 'imt_stufe' ? 1 : 0}" max="${max}" step="${art === 'einschlafen' ? 5 : 1}" value="${art === 'einschlafen' ? 20 : 5}" data-zl-art="${art}"></label><button class="zl-los zweit" data-zl-speichern="${art}">Eintragen</button></details>
        ${F.d ? `<p class="zl-mini">${esc(F.d)}</p>` : ''}</div>`; }
  }
  const W = PLAN[z.p].w[Math.min(3, wi - 1)], tipp = P.tipps[Math.min(3, wi - 1)], hw = (P.hw || [])[Math.min(3, wi - 1)];   // 021 N5: Wochenhinweis
  box.innerHTML = `<div class="zl-karte"><span class="zl-ueber">${esc(zi.name)} · Woche ${Math.min(4, wi)}</span><div class="zl-seg">${seg}</div>
      <div class="zl-ziel">${blume(h.fenster.map((f) => geuebt(h.m[tagKey(f)])), 120, h.fenster.findIndex((f) => tagKey(f) === heuteK))}<span><b>${h.wocheTage} von ${h.zielTage} Tagen</b><span>${h.wocheMin} min diese Woche</span></span></div>
      <div class="zl-tage">${tage}</div><p class="zl-leise">Diese Woche: ${esc(W.t)} · ${W.u.map((u) => esc(name(u)) + ' ' + esc(dauer(u))).join(' + ')}</p>${hw ? `<p class="zl-mini">${esc(hw)}</p>` : ''}${tipp ? `<p class="zl-mini">${esc(tipp)}</p>` : ''}</div>
    ${summen}${mess}
    <div class="zl-karte"><span class="zl-ueber">Was ist belegt</span><p class="zl-leise">${esc(erw.t)}</p>${leds({ hoch: 'gut', mittel: 'mittel', gering: 'schwach' }[erw.b] || erw.b || '')}
      <details><summary>${erw.q.length ? (erw.q.length === 1 ? 'Quelle' : 'Quellen') : 'Quellen zum Programm'} (${erw.q.length || P.q.length})</summary>${quellenHtml(erw.q.length ? erw.q : P.q)}</details></div>
    <div class="zl-karte">${zeile('#health', 'In Health eintragen')}${zeile('#erinnerung', 'Erinnerung')}${zeile('#ziel', 'Ziel ändern', esc(zi.name))}</div>`;
  box.oninput = (e) => { const i = e.target.closest('[data-zl-art]'); if (i) box.querySelector('#zl-w-' + i.dataset.zlArt).textContent = i.value; };
  box.onclick = (e) => { const b = e.target.closest('[data-zl-speichern]'); if (!b) return; const a = b.dataset.zlSpeichern, i = box.querySelector(`[data-zl-art="${a}"]`); selbstWert({ t: new Date().toISOString(), a, w: +i.value }); fuelle(box, ctx); };
}
