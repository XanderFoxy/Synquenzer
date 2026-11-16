// Atem – gezeichnete Symbole (24×24, Linie currentColor 1,75). Keine Emojis.
export const S = (d, cls = '') => `<svg class="sym ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const P = (d) => `<path d="${d}"/>`, K = (x, y, r = 2) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
export const SYM = {
  start: P('M4 11l8-7 8 7v9h-5v-6h-6v6H4z'),
  training: P('M3 17l5-5 4 4 8-9') + P('M15 7h5v5'),
  uebungen: P('M5 6h14M5 12h14M5 18h9'),
  singen: P('M9 18V6l10-2v12') + '<circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  wissen: P('M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z') + P('M12 6v14'),
  zahnrad: '<circle cx="12" cy="12" r="3"/>' + P('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1'),
  zurueck: P('M15 5l-7 7 7 7'),
  weiter: P('M9 5l7 7-7 7'),
  schliessen: P('M6 6l12 12M18 6L6 18'),
  pause: P('M9 6v12M15 6v12'),
  play: P('M8 5l11 7-11 7z'),
  ton: P('M4 10v4h4l5 4V6L8 10z') + P('M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11'),
  tonAus: P('M4 10v4h4l5 4V6L8 10z') + P('M17 9l5 6M22 9l-5 6'),
  warnung: P('M12 3l10 18H2z') + P('M12 10v5M12 18v.01'),
  telefon: P('M5 4h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z'),
  haken: P('M5 12l5 5 9-10'),
  plus: P('M12 5v14M5 12h14'), minus: P('M5 12h14'),
  // 0.1.5: „Figur groß/klein“ = Lunge mit Luftröhre in Vergrößern-Ecken (vorher Person auf Hocker – wirkte wie ein Stuhl)
  figur: P('M12 5v6M12 9.4l-1.6 1.4M12 9.4l1.6 1.4') + P('M10.4 8.6C8 8.6 6.8 11.6 6.8 15c0 1.6 1.2 2.2 2.6 1.6l1.6-.8V10M13.6 8.6c2.4 0 3.6 3 3.6 6.4 0 1.6-1.2 2.2-2.6 1.6l-1.6-.8V10') + P('M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4'),
  kreis: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  // Situationen
  stress: P('M3 12h3l2-5 3 10 3-8 2 3h5'),
  akut_unruhe: P('M12 3v4M12 17v4M3 12h4M17 12h4') + '<circle cx="12" cy="12" r="3"/>',
  einschlafen: P('M20 14A8 8 0 1110 4a6 6 0 0010 10z'),
  spannungskopfschmerz: '<circle cx="12" cy="10" r="6"/>' + P('M8 20h8M6 7l-2-2M18 7l2-2'),
  konzentration: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
  energie: P('M13 2L5 14h6l-1 8 8-12h-6z'),
  lampenfieber: P('M4 20V8l8-4 8 4v12') + P('M9 20v-6h6v6'),
  erholung_sport: P('M5 17c3-6 7-8 14-9') + '<circle cx="7" cy="6" r="2"/>' + P('M5 21h14'),
  schmerz: P('M12 21s-7-5-7-11a4 4 0 017-2.6A4 4 0 0119 10c0 6-7 11-7 11z'),
  uebelkeit: P('M4 12c2-3 4-3 6 0s4 3 6 0 4-3 4-3') + P('M4 17c2-3 4-3 6 0s4 3 6 0 4-3 4-3'),
  blutdruck_hrv: P('M3 13h4l2-4 3 8 2-6 2 2h5') + P('M12 21s-8-5-8-11'),
  nervensystem: '<circle cx="12" cy="5" r="2.5"/>' + P('M12 8v2c-2 1-2 3 0 4s2 3 0 4v2') + P('M12 12l-4 2M12 16l4 2'),
  nicht_gut: '<circle cx="12" cy="12" r="9"/>' + P('M8 16c2-2 6-2 8 0M9 9.5v.01M15 9.5v.01'),
  // Wege
  // 0.1.5: Gesichtsprofil + Luft-Punkte an Nase bzw. Mund (vorher ⅃-Form – wirkte wie ein Stuhl)
  nase: P('M7 2.6c.4 2 1 3.4 1.8 4.6l3.6 4.6c.4.6.1 1.2-.6 1.2H10l.6 1.4-.9.8.9.9-.5 1.9c-.3 1.2-1.4 1.9-2.7 1.9H7v2.6') + '<circle cx="15.4" cy="12.2" r="1" fill="currentColor" stroke="none"/><circle cx="18.4" cy="11.4" r="1" fill="currentColor" stroke="none"/><circle cx="21.4" cy="10.6" r="1" fill="currentColor" stroke="none"/>',
  mund: P('M7 2.6c.4 2 1 3.4 1.8 4.6l3.6 4.6c.4.6.1 1.2-.6 1.2H10l.6 1.4-.9.8.9.9-.5 1.9c-.3 1.2-1.4 1.9-2.7 1.9H7v2.6') + '<circle cx="14.2" cy="15.2" r="1" fill="currentColor" stroke="none"/><circle cx="17.2" cy="15.6" r="1" fill="currentColor" stroke="none"/><circle cx="20.2" cy="16" r="1" fill="currentColor" stroke="none"/>',
  summen: P('M5 12c3 3 11 3 14 0') + P('M8 6c1 1 1 2 0 3M12 5c1 1 1 3 0 4M16 6c1 1 1 2 0 3'),
  links: P('M15 5l-7 7 7 7') + '<circle cx="18" cy="12" r="1"/>',
  rechts: P('M9 5l7 7-7 7') + '<circle cx="6" cy="12" r="1"/>',
  // Sicherheit
  wasserAus: P('M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0') + P('M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0') + P('M4 4l16 16'),
  lenkradAus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/>' + P('M4 4l16 16M4 12h6M14 12h6'),
  // 0.1.5 Haltung eindeutig: Sitzen = Mensch im Profil auf Stuhl mit Lehne; Liegen = Rückenlage, Knie angewinkelt, auf Unterlage; Stehen = von vorn auf dem Boden
  sitzen: K(11, 3.6) + P('M11 6.6v6.6h6v6.6h2.2') + P('M7.2 6.2v14.8M7.2 16.2h7.6M14.8 16.2v4.8'),
  stehen: K(12, 3.6) + P('M12 6.6v7.6M12 14.2l-3 6.6M12 14.2l3 6.6M12 8.6l-3.6 4.2M12 8.6l3.6 4.2') + P('M6.5 21.2h11'),
  spirale: P('M12 12a1.5 1.5 0 113 0 3 3 0 11-6 0 4.5 4.5 0 119 0 6 6 0 11-12 0'),
  liegen: K(4.4, 12.4) + P('M7.4 13.2h12.8v-2.4') + '<rect x="2" y="16" width="20" height="3" rx="1.2"/>'
};
export const sym = (n, cls) => S(SYM[n] || SYM.kreis, cls);
// Haltung aus dem Text („sitzend oder stehend“ → zwei Symbole); ohne Treffer: liegend/sitzend wie bisher
export function haltungSym(text, liegend) {
  const t = String(text || '').toLowerCase(), n = [];
  if (/sitz/.test(t)) n.push('sitzen'); if (/lieg/.test(t)) n.push('liegen'); if (/steh/.test(t)) n.push('stehen');
  if (!n.length) n.push(liegend ? 'liegen' : 'sitzen');
  return `<span class="haltung-sym">${n.map((k) => sym(k)).join('')}</span>`;
}
const STUFE_N = { gut: 3, mittel: 2, schwach: 1, unbelegt: 0 };
export function abzeichen(stufe, wort) {
  const n = STUFE_N[stufe] ?? 0;
  const bal = [0, 1, 2].map((k) => `<rect x="${k * 6}" y="${10 - (k + 1) * 3}" width="4" height="${(k + 1) * 3}" rx="1" class="${k < n ? 'voll' : 'leer'}"/>`).join('');
  return `<span class="abz abz-${stufe}"><svg viewBox="0 0 16 10" aria-hidden="true">${bal}</svg><span>${wort ? wort + ': ' : ''}${stufe}</span></span>`;
}
