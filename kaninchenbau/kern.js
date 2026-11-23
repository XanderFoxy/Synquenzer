// Kaninchenbau – gemeinsamer Kern: Zustand, Speichern, Bausteine, Symbole, Meldung. Seiten-Module tragen sich in SEITEN/TATEN ein.
import * as speicher from './speicher.js';
import { lage } from './auswertung.js';
import { LERN_THEMA } from './wesen.js';

export const VERSION = '0.2.1';
const geladen = speicher.laden();
export const K = { Z: geladen.z, quelle: geladen.quelle, ver: 0 };
export const SEITEN = {};
export const TATEN = {};

export function sichern() { K.ver++; const ok = speicher.sichern(K.Z); if (!ok) K.speicherWarnung?.(); return ok; }
export const $ = (s, w = document) => w.querySelector(s);
export const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Antworten aus dem Lernen-Teil (Startfragen von 0.1: „Gebiet spannend? Ja“) zählen als Neugier im Bereich Wissen
export function extraVonLernen(l = K.Z.lernen) {
  const a = l?.profil?.antw || {};
  return Object.entries(LERN_THEMA).filter(([g]) => a['g:' + g] === 0).map(([g, t]) => ({ m: 'w-neugier', x: t, quelle: 'lernen', g }));
}
// Auswertung, zwischengespeichert bis zur nächsten Änderung
let lgVer = -1, lgWert = null;
export function lg() {
  if (lgVer !== K.ver || !lgWert) { lgWert = lage(K.Z.wesen.antw, extraVonLernen()); lgVer = K.ver; }
  return lgWert;
}

// ---------- Symbole (SVG, keine Emojis) ----------
const S = (inner, extra = '') => `<svg class="sym" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${inner}</svg>`;
export const IC = {
  moehre: '<svg class="sym" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.6 8.4c-2.6-2.6-6.4.4-8.3 4.3L4 20l7.3-3.3c3.9-1.9 6.9-5.7 4.3-8.3z" fill="#ea580c"/><path d="M9.6 12.6l1.5 1.5M7.9 15.7l1.3 1.3M12.2 10.3l1.2 1.2" stroke="#9a3412" stroke-width="1.2" stroke-linecap="round"/><path d="M15.6 8.4l1.1-5M15.6 8.4l5-1.1M15.6 8.4l3.3-3.3" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/></svg>',
  hase: (cls = '', rand = false) => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"${rand ? ' stroke="#3a2f22" stroke-width="1.4"' : ''}><ellipse cx="14" cy="11" rx="4" ry="10" fill="#fff"/><ellipse cx="26" cy="11" rx="4" ry="10" fill="#fff"/><ellipse cx="14" cy="11.5" rx="1.7" ry="6.5" fill="#f9a8d4" stroke="none"/><ellipse cx="26" cy="11.5" rx="1.7" ry="6.5" fill="#f9a8d4" stroke="none"/><circle cx="20" cy="26" r="11" fill="#fff"/><circle cx="16" cy="24.5" r="1.6" fill="#1f1b16" stroke="none"/><circle cx="24" cy="24.5" r="1.6" fill="#1f1b16" stroke="none"/><ellipse cx="20" cy="29" rx="2" ry="1.4" fill="#f472b6" stroke="none"/></svg>`,
  stern: (an) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="${an ? 'stern-an' : 'stern-aus'}" stroke-width="1.8" stroke-linejoin="round" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>`,
  schloss: S('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  pfeil: S('<path d="M9 5l7 7-7 7"/>', ' stroke-width="2.2"'),
  raus: S('<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  // ↶ (Pfeil im Bogen gegen den Uhrzeigersinn)
  zurueck: S('<path d="M8.5 5.5L4 10l4.5 4.5"/><path d="M4 10h10a6 6 0 0 1 0 12h-3"/>', ' stroke-width="2.2"'),
  stift: S('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  weiter: S('<path d="M5 12h13"/><path d="M13 6l6 6-6 6"/>', ' stroke-width="2.2"'),
  sichern: S('<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
  laden: S('<path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/>'),
  loeschen: S('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>'),
  kopieren: S('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  ordnen: S('<rect x="3" y="4" width="4" height="4" rx=".6"/><rect x="10" y="4" width="4" height="4" rx=".6"/><rect x="17" y="4" width="4" height="4" rx=".6"/><rect x="3" y="11" width="4" height="4" rx=".6"/><rect x="10" y="11" width="4" height="4" rx=".6"/><path d="M5 19h14"/><path d="M16 16.5l3 2.5-3 2.5"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>', ' stroke-width="2.2"'),
  x: S('<path d="M6 6l12 12M18 6L6 18"/>', ' stroke-width="2.2"')
};

// Fortschrittsbalken mit Hase (wie 0.1)
export function balken(anteil, label) {
  const p = Math.round(Math.max(0, Math.min(1, anteil)) * 100);
  return `<div class="balken" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><span class="fuell" data-w="${p}"></span><span class="hase-mini" data-l="${p}">${IC.hase('', true)}</span></div>`;
}
// Schmaler Balken ohne Hase (Bereiche)
export function streifen(anteil, label, cls = '') {
  const p = Math.round(Math.max(0, Math.min(1, anteil)) * 100);
  return `<span class="streifen ${cls}" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><span data-w="${p}"></span></span>`;
}

let meldTimer = 0;
export function meldung(text, knopf, tat, ms = 4000) {
  const m = $('#meldung');
  m.innerHTML = `<span>${esc(text)}</span>${knopf ? `<button class="knopf" type="button">${knopf.startsWith('<') ? knopf : esc(knopf)}</button>` : ''}`;
  if (knopf) m.querySelector('button').addEventListener('click', () => { m.classList.remove('an'); tat?.(); });
  m.classList.add('an'); clearTimeout(meldTimer);
  if (ms) meldTimer = setTimeout(() => m.classList.remove('an'), ms);
}
export const meldungWeg = () => { clearTimeout(meldTimer); $('#meldung')?.classList.remove('an'); };

export function konfetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const k = document.createElement('div'); k.className = 'konfetti'; k.setAttribute('aria-hidden', 'true');
  const farben = ['#c2410c', '#be123c', '#0f766e', '#1d4ed8', '#6d28d9', '#15803d', '#eab308', '#ea580c'];
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('i');
    e.style.left = Math.random() * 100 + '%'; e.style.background = farben[i % farben.length];
    e.style.setProperty('--dx', (Math.random() * 140 - 70).toFixed(0) + 'px'); e.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
    e.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's'; k.appendChild(e);
  }
  document.body.appendChild(k); setTimeout(() => k.remove(), 2300);
}

// Datei speichern: iPhone → Teilen-Blatt („In Dateien sichern“), sonst Download. Nichts geht an einen Server.
export async function datei(name, inhalt, typ = 'application/json') {
  const blob = new Blob([inhalt], { type: typ });
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && navigator.canShare) {
    try { const f = new File([blob], name, { type: typ }); if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return 'geteilt'; } }
    catch (e) { if (e && e.name === 'AbortError') return 'abgebrochen'; }
  }
  const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; a.rel = 'noopener';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000);
  return 'geladen';
}
export async function kopieren(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* weiter */ }
  try {
    const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.className = 'sr';
    document.body.append(t); t.select(); t.setSelectionRange(0, text.length); const r = document.execCommand('copy'); t.remove(); return r;
  } catch { return false; }
}
export function zeitText(t) {
  const d = Date.now() - t, min = Math.round(d / 60000);
  if (min < 1) return 'gerade eben'; if (min < 60) return `vor ${min} Min.`;
  const h = Math.round(min / 60); if (h < 24) return `vor ${h} Std.`;
  const tg = Math.round(h / 24); if (tg < 8) return tg === 1 ? 'gestern' : `vor ${tg} Tagen`;
  return new Date(t).toLocaleDateString('de-DE');
}
