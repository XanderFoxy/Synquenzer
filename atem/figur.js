// Atem 0.2.0 – Figur „stilisiert-leuchtend“ (020-figur). Vorgabe: atem-020/DESIGN.md § 7–9, design-token.css.
// Gleiche Schnittstelle wie anatomie.erzeugeAnatomie (setze/ansicht/modus/namen/muskelAn/zustand/zerstoere/element),
// dazu: pose(), licht(), hand(), laufe()/halt() (Meditation ohne Takt). Eine SVG, gebaut einmal; je Bild werden nur
// transform/opacity geschrieben (Cache: nur bei Änderung). Kein filter/blur/blend; Leuchten = statische Gradienten.
// Posen: 'uebung' (vorn, Lunge, Zwerchfell, Pfeile, Hände), 'kissen' (einfacher Sitz auf Kissen), 'stuhl', 'liegen'.
// Haltung belegt nach recherche/technik.md § 1 (aufrecht; Kissen/Stuhl gleichwertig; Hände flach auf den Oberschenkeln, kein Finger-Kreis).
const NS = 'http://www.w3.org/2000/svg';
const cl = (x, a, b) => (x < a ? a : x > b ? b : x), r1 = (n) => Math.round(n * 10) / 10, r2 = (n) => Math.round(n * 100) / 100;
const sm = (t) => t * t * (3 - 2 * t);                       // sinus-ähnlich langsam rein/raus (--kurve-atem)
export const ZONE = { bauch: 'bauch', flanke: 'flanken', flanken: 'flanken', brust: 'brust', gemischt: 'beide', 'bauch+brust': 'beide', stuetze: 'flanken', singen_gestuetzt: 'flanken', staccato: 'bauch' };
export const zoneAus = (art) => ZONE[art] || 'bauch';
const PH = { ein: 'ein', ein2: 'noch', noch: 'noch', aus: 'aus', stoss_aus: 'aus', halten: 'halten', halten_voll: 'halten', halten_leer: 'leer', leer: 'leer', ruhe: 'ruhe' };
export const phaseAus = (p) => PH[p] || 'ruhe';
const MUNDWEGE = new Set(['mund', 'sss', 'fff', 'vokal', 'ha', 'brr', 'strohhalm']);
// Haltungs-IDs der Meditationen (meditation.js) → Pose. „sitzen“ zeigt den Standard (Kissen) oder, wenn gewünscht, den Stuhl.
export function poseAusHaltung(h, vorliebe = 'kissen') { return h === 'liegen' || h === 'im_bett' ? 'liegen' : h === 'sitzen_angelehnt' ? 'stuhl' : vorliebe === 'stuhl' ? 'stuhl' : 'kissen'; }
const TEXT = { bauch: 'Bauch', brust: 'Brust', flanken: 'Flanken', beide: 'Bauch + Brust', ein: 'Einatmen', noch: 'Noch etwas ein', aus: 'Ausatmen', halten: 'Halten', leer: 'Leer halten', ruhe: 'Ruhig atmen', figur: 'Figur' };
// Liter (Richtwerte wie anatomie.js, GA06/GA07/GA13): Ende des Einatmens je Atemart und Tiefe
const TIEFE_STD = { bauch: .6, flanke: .8, brust: .7, gemischt: .9, stuetze: .8, staccato: .5 };
function literEnde(art, tiefe) {
  const a = ({ flanken: 'flanke', 'bauch+brust': 'gemischt', singen_gestuetzt: 'stuetze' })[art] || (TIEFE_STD[art] != null ? art : 'bauch'), t = cl(tiefe ?? TIEFE_STD[a], 0, 1);
  if (a === 'bauch' || a === 'staccato') return 3 + (t <= .8 ? .4 + .75 * t : 1 + 7.5 * (t - .8));
  const bis = a === 'brust' ? 3.8 : a === 'gemischt' ? 4.52 : 4.6; return 3 + (bis - 3) * cl(t / TIEFE_STD[a], .25, 1.35);
}

// ---------------------------------------------------------------- Formen
const LL = 'M146 134 C120 126 95 150 91 196 C88 234 98 254 119 254 C135 254 146 245 146 232 Z';
const LR = 'M154 134 C180 126 205 150 209 196 C212 234 202 254 181 254 C165 254 154 245 154 232 Z';
const BRONCHIEN = 'M140 146 C128 170 122 196 120 226 M128 186 L112 196 M131 210 L120 218 M160 146 C172 170 178 196 180 226 M172 186 L188 196 M169 210 L180 218';
const ROHR = 'M150 96 L150 132 M150 132 L140 144 M150 132 L160 144';
function pfeil(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1), k = 11, w = .62;
  const d = `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}M${r1(x2 - k * Math.cos(a - w))} ${r1(y2 - k * Math.sin(a - w))}L${r1(x2)} ${r1(y2)}L${r1(x2 - k * Math.cos(a + w))} ${r1(y2 - k * Math.sin(a + w))}`;
  return `<path d="${d}" class="fg-pk"/><path d="${d}" class="fg-pw"/>`;
}
const PFEILE = {   // DESIGN § 7.7: Bauch ↓ + ← →, Brust ↑ + ↖ ↗, Flanken ← →; Ausatmen umgekehrt
  bauch: { ein: [[150, 270, 150, 300], [96, 314, 62, 314], [204, 314, 238, 314]], aus: [[150, 300, 150, 270], [56, 314, 90, 314], [244, 314, 210, 314]] },
  brust: { ein: [[112, 152, 86, 126], [188, 152, 214, 126], [150, 162, 150, 130]], aus: [[84, 124, 110, 150], [216, 124, 190, 150], [150, 126, 150, 158]] },
  flanken: { ein: [[72, 226, 40, 226], [228, 226, 260, 226]], aus: [[34, 226, 66, 226], [266, 226, 234, 226]] },
  beide: { ein: [[150, 270, 150, 300], [96, 314, 62, 314], [204, 314, 238, 314], [112, 152, 86, 126], [188, 152, 214, 126]], aus: [[150, 300, 150, 270], [56, 314, 90, 314], [244, 314, 210, 314], [84, 124, 110, 150], [216, 124, 190, 150]] },   // 020-nb M1: Bauch + Brust (Doppel-Einatmen, Kraftatmung)
};
function hand(x, y, flip = 1, s = 1) {   // flache Hand: Handfläche, 4 Finger, Daumen (kein Arm)
  let f = '';
  [[-13, 31], [-4.5, 35], [4.5, 33], [13, 27]].forEach(([fy, l]) => { f += `<rect x="${-l - 4}" y="${fy - 4.4}" width="${l + 10}" height="8.8" rx="4.4"/>`; });
  return `<g transform="translate(${x} ${y}) scale(${flip * s} ${s})" class="fg-haut">${f}<rect x="-24" y="-4.6" width="27" height="9.2" rx="4.6" transform="translate(8 -15) rotate(32)"/><rect x="-12" y="-19" width="34" height="38" rx="14"/></g>`;
}
const HAENDE = {   // Hi-Lo (Brust + Bauch) bzw. MARM (seitlich an den unteren Rippen), technik.md H10–H12
  bauch: [[214, 196, 1, .9, 'brust'], [136, 340, -1, .9, 'bauch']], brust: [[214, 196, 1, .9, 'brust'], [136, 340, -1, .9, 'bauch']], beide: [[214, 196, 1, .9, 'brust'], [136, 340, -1, .9, 'bauch']],   // Bauch-Hand unten mittig: verdeckt keinen Pfeil
  flanken: [[60, 262, -1, .82, 'links'], [240, 262, 1, .82, 'rechts']],
};
// Atemweg (Polylinie): von außen zur Nase, durch die Luftröhre, je Ast in einen Lungenflügel
const WEG = { nase: [[0, 92], [52, 80], [104, 72], [140, 76], [150, 98], [150, 132]], mund: [[0, 102], [52, 94], [104, 90], [140, 90], [150, 104], [150, 132]] };
const AST = { L: [[140, 146], [128, 174], [121, 204]], R: [[160, 146], [172, 174], [179, 204]] };
const MED_WEG = [[150, -10], [150, 24], [150, 66], [150, 96], [150, 118]];
const MED_AST = { L: [[143, 128], [134, 146], [130, 160]], R: [[157, 128], [166, 146], [170, 160]] };
function polylinie(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L, ges: L[L.length - 1] }; }
function punkt(pl, f) { const z = cl(f, 0, 1) * pl.ges; let i = 1; while (i < pl.L.length - 1 && pl.L[i] < z) i++; const t = (z - pl.L[i - 1]) / ((pl.L[i] - pl.L[i - 1]) || 1), a = pl.pts[i - 1], b = pl.pts[i]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
const dPfad = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join('');

function defs(id) {
  return `<defs>
<radialGradient id="${id}bh" cx=".5" cy=".45" r=".55"><stop offset="0" class="fg-s-ein" stop-opacity=".12"/><stop offset="1" class="fg-s-ein" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}hof" cx=".5" cy=".5" r=".5"><stop offset="0" class="fg-s-lunge" stop-opacity=".30"/><stop offset="1" class="fg-s-lunge" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ff3ac"/><stop offset=".45" class="fg-s-lunge"/><stop offset="1" class="fg-s-tief"/></linearGradient>
<linearGradient id="${id}kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3a78"/><stop offset="1" class="fg-s-figur"/></linearGradient>
<radialGradient id="${id}ph" cx=".5" cy=".5" r=".5"><stop offset="0" class="fg-s-strom" stop-opacity=".55"/><stop offset="1" class="fg-s-strom" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}mk" cx=".5" cy=".5" r=".5"><stop offset="0" class="fg-s-licht" stop-opacity=".45"/><stop offset=".6" class="fg-s-licht" stop-opacity=".13"/><stop offset="1" class="fg-s-licht" stop-opacity="0"/></radialGradient>
<clipPath id="${id}cL"><path d="${LL}"/></clipPath><clipPath id="${id}cR"><path d="${LR}"/></clipPath></defs>`;
}
// Lunge mit Licht-Füllung (Rechteck im clipPath, steigt per translateY) – zwei Flügel einzeln skalierbar
function lunge(id, rand = 2.2) {
  const fl = (s, p) => `<g class="fg-lu" data-l="${s}"><path d="${p}" fill="url(#${id}lg)"/><g clip-path="url(#${id}c${s})"><g class="fg-fill" data-l="${s}"><rect x="84" y="254" width="132" height="130" class="fg-licht"/><rect x="84" y="254" width="132" height="3" fill="#fff" opacity=".85"/></g></g><path d="${p}" fill="none" class="fg-lrand" stroke-width="${rand}"/></g>`;
  return `${fl('L', LL)}${fl('R', LR)}<path d="${BRONCHIEN}" class="fg-br"/>`;
}
const perlen = (id, n = 8) => Array.from({ length: n }, () => `<g class="fg-perle" opacity="0"><circle r="11" fill="url(#${id}ph)"/><circle r="5.2" class="fg-pkern"/></g>`).join('');
const ROHR_SVG = `<path d="${ROHR}" class="fg-rohr-hof"/><path d="${ROHR}" class="fg-rohr"/>`;

function bauUebung(id) {
  return `<rect x="-60" y="-20" width="420" height="420" fill="url(#${id}bh)"/>
<circle cx="150" cy="58" r="34" fill="url(#${id}kg)" class="fg-kontur"/>
<rect x="137" y="88" width="26" height="20" class="fg-koerper fg-kontur"/>
<path d="M66 136 Q66 110 98 106 L202 106 Q234 110 234 136 L242 336 Q242 362 220 362 L80 362 Q58 362 58 336 Z" fill="url(#${id}kg)" class="fg-kontur"/>
<ellipse cx="150" cy="195" rx="98" ry="88" fill="url(#${id}hof)"/>
<g class="fg-zmark" data-z="bauch"><ellipse cx="150" cy="314" rx="70" ry="30" class="fg-mark-bauch"/></g>
<g class="fg-zmark" data-z="flanken"><path d="M70 214 Q56 240 66 276 M230 214 Q244 240 234 276" class="fg-mark"/></g>
<g class="fg-zmark" data-z="brust"><path d="M92 128 Q150 104 208 128" class="fg-mark"/></g>
<g class="fg-lunge">${lunge(id)}</g>
${ROHR_SVG}
<g class="fg-zw"><path d="M84 266 Q150 236 216 266" class="fg-zwerchfell"/></g>
<path class="fg-weg" d=""/><path class="fg-weg2" d=""/>
<g class="fg-perlen">${perlen(id)}</g>
<g class="fg-pf" data-r="ein" opacity="0"></g><g class="fg-pf" data-r="aus" opacity="0"></g>
<g class="fg-haende"><g class="fg-hand" data-h="0"></g><g class="fg-hand" data-h="1"></g></g>
<text class="fg-liter" x="292" y="352" text-anchor="end"></text>`;
}
const LIDER = '<path d="M136 58 q5 4 10 0 M154 58 q5 4 10 0" class="fg-lid"/>';
const MED_LUNGE = (id) => `<ellipse cx="150" cy="168" rx="66" ry="64" fill="url(#${id}hof)"/><g transform="translate(150 118) scale(.74) translate(-150 -134)"><g class="fg-lunge">${lunge(id, 3)}</g></g><path d="M150 80 L150 118" class="fg-rohr-hof"/><path d="M150 80 L150 118" class="fg-rohr"/>`;
const KOPF = (id, cy = 56) => `<rect x="139" y="${cy + 24}" width="22" height="24" class="fg-koerper fg-kontur"/><circle cx="150" cy="${cy}" r="30" fill="url(#${id}kg)" class="fg-kontur"/>`;
function bauKissen(id) {   // einfacher Sitz auf einem Kissen: Knie tiefer als die Hüfte, Rücken aufrecht, Hände flach auf den Oberschenkeln
  return `<ellipse class="fg-kranz" cx="150" cy="168" rx="150" ry="150" fill="url(#${id}mk)"/>
<ellipse cx="150" cy="306" rx="118" ry="17" class="fg-kissen"/>
<path d="M40 286 Q150 248 260 286 Q272 306 238 310 L62 310 Q28 306 40 286 Z" fill="url(#${id}kg)" class="fg-kontur"/>
<path d="M58 290 Q120 300 196 306 M242 290 Q180 300 104 306" class="fg-schien"/><path d="M58 290 Q120 300 196 306 M242 290 Q180 300 104 306" class="fg-schienrand"/>
<path d="M100 124 Q100 106 122 102 L178 102 Q200 106 200 124 L212 278 L88 278 Z" fill="url(#${id}kg)" class="fg-kontur"/>
<path d="M104 118 Q76 176 84 270 M196 118 Q224 176 216 270" class="fg-arm"/><path d="M104 118 Q76 176 84 270 M196 118 Q224 176 216 270" class="fg-armrand"/>
${KOPF(id)}${LIDER}${MED_LUNGE(id)}
<path class="fg-weg" d=""/><path class="fg-weg2" d=""/><g class="fg-perlen">${perlen(id)}</g>
${hand(92, 276, 1, .74)}${hand(208, 276, -1, .74)}`;
}
function bauStuhl(id) {    // Stuhl: Füße flach, Knie etwa 90°, Hände auf den Oberschenkeln
  return `<ellipse class="fg-kranz" cx="150" cy="168" rx="150" ry="150" fill="url(#${id}mk)"/>
<rect x="94" y="112" width="112" height="150" rx="12" class="fg-stuhl"/>
<rect x="66" y="256" width="168" height="14" rx="6" class="fg-stuhl"/><path d="M78 270 L74 354 M222 270 L226 354" class="fg-stuhlbein"/>
<path d="M100 124 Q100 106 122 102 L178 102 Q200 106 200 124 L210 262 L90 262 Z" fill="url(#${id}kg)" class="fg-kontur"/>
<rect x="90" y="246" width="56" height="40" rx="14" fill="url(#${id}kg)" class="fg-kontur"/><rect x="154" y="246" width="56" height="40" rx="14" fill="url(#${id}kg)" class="fg-kontur"/>
<rect x="100" y="280" width="36" height="66" rx="12" fill="url(#${id}kg)" class="fg-kontur"/><rect x="164" y="280" width="36" height="66" rx="12" fill="url(#${id}kg)" class="fg-kontur"/>
<ellipse cx="116" cy="350" rx="24" ry="8" class="fg-koerper fg-kontur"/><ellipse cx="184" cy="350" rx="24" ry="8" class="fg-koerper fg-kontur"/>
<path d="M30 359 L270 359" class="fg-boden"/>
<path d="M104 118 Q78 180 98 258 M196 118 Q222 180 202 258" class="fg-arm"/><path d="M104 118 Q78 180 98 258 M196 118 Q222 180 202 258" class="fg-armrand"/>
${KOPF(id)}${LIDER}${MED_LUNGE(id)}
<path class="fg-weg" d=""/><path class="fg-weg2" d=""/><g class="fg-perlen">${perlen(id)}</g>
${hand(106, 262, 1, .7)}${hand(194, 262, -1, .7)}`;
}
function bauLiegen(id) {   // Rückenlage (Körperreise, Einschlafen): von oben gesehen, Kopf links, Kissen unter dem Kopf
  return `<ellipse class="fg-kranz" cx="150" cy="150" rx="190" ry="140" fill="url(#${id}mk)"/>
<rect x="8" y="96" width="384" height="120" rx="20" class="fg-matte"/><rect x="16" y="124" width="40" height="64" rx="16" class="fg-kissen"/>
<g transform="translate(14 246) scale(.6) rotate(-90)">
<path d="M126 340 L118 600 M174 340 L182 600" class="fg-bein"/><path d="M126 340 L118 600 M174 340 L182 600" class="fg-beinrand"/>
<path d="M60 140 Q42 236 50 330 M240 140 Q258 236 250 330" class="fg-arm"/><path d="M60 140 Q42 236 50 330 M240 140 Q258 236 250 330" class="fg-armrand"/>
<path d="M66 136 Q66 110 98 106 L202 106 Q234 110 234 136 L236 336 Q236 360 214 360 L86 360 Q64 360 64 336 Z" fill="url(#${id}kg)" class="fg-kontur"/>
<rect x="139" y="80" width="22" height="30" class="fg-koerper fg-kontur"/><circle cx="150" cy="56" r="32" fill="url(#${id}kg)" class="fg-kontur"/>${LIDER}
<ellipse cx="150" cy="195" rx="92" ry="84" fill="url(#${id}hof)"/><g class="fg-lunge">${lunge(id, 3)}</g>${ROHR_SVG}
<path class="fg-weg" d=""/><path class="fg-weg2" d=""/><g class="fg-perlen">${perlen(id)}</g></g>`;
}
const POSEN = { uebung: [bauUebung, '0 0 300 370'], kissen: [bauKissen, '0 0 300 330'], stuhl: [bauStuhl, '0 0 300 366'], liegen: [bauLiegen, '0 0 400 300'] };

function stil() {
  if (document.getElementById('fg-stil')) return;
  const s = document.createElement('style'); s.id = 'fg-stil';
  s.textContent = `.fg-figur{position:relative;width:100%;height:100%;min-height:60px;overflow:hidden;background:var(--buehne,#0b1020);contain:layout paint;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;
--fg-lunge:var(--lunge,#3fe08f);--fg-tief:var(--lunge-tief,#12a35b);--fg-lrand:var(--lunge-rand,#b8ffd8);--fg-licht-l:var(--lunge-licht,#9dffc9);--fg-figur:var(--figur,#232c5c);--fg-frand:var(--figur-rand,#5b6bc0);
--fg-zw:var(--zwerchfell,#ffcf5c);--fg-pfeil:var(--pfeil,#fff);--fg-pk:var(--pfeil-kante,#0b1020);--fg-haut:var(--haut,#f2c4a0);--fg-hrand:var(--haut-rand,#b9825e);--fg-ein:#5ad2ea;
--fg-strom:var(--strom-ein,#9befff);--fg-phase:#5ad2ea;--fg-licht:var(--gold,#ffcf5c)}
.fg-figur[data-licht=lila]{--fg-licht:var(--lila,#c79bff)}
.fg-figur[data-phase=ein],.fg-figur[data-phase=noch]{--fg-strom:var(--strom-ein,#9befff);--fg-phase:var(--ein,#5ad2ea)}.fg-figur[data-phase=noch]{--fg-phase:var(--noch,#9be9f7)}
.fg-figur[data-phase=aus]{--fg-strom:var(--strom-aus,#ffb877);--fg-phase:var(--aus,#f4a261)}
.fg-figur[data-phase=halten]{--fg-strom:var(--halten,#b4a7ff);--fg-phase:var(--halten,#b4a7ff)}.fg-figur[data-phase=leer]{--fg-strom:var(--leer,#8fb0ff);--fg-phase:var(--leer,#8fb0ff)}
.fg-figur[data-pose=kissen],.fg-figur[data-pose=stuhl],.fg-figur[data-pose=liegen]{--fg-strom:var(--fg-licht);--fg-phase:var(--fg-licht)}
.fg-figur svg{position:absolute;left:0;top:0;display:block;width:100%;height:100%}.fg-figur svg.fg-oben{will-change:transform;pointer-events:none}
.fg-kranz{position:absolute;inset:0;pointer-events:none;will-change:opacity;opacity:.7;background:radial-gradient(closest-side at 50% 51%,var(--fg-glut),rgba(0,0,0,0) 100%)}.fg-kranz[data-pose=liegen]{background:radial-gradient(farthest-side at 37% 50%,var(--fg-glut),rgba(0,0,0,0) 80%)}
.fg-figur{--fg-glut:rgba(255,207,92,.42)}.fg-figur[data-licht=lila]{--fg-glut:rgba(199,155,255,.42)}   /* wie 0.1.5: SVG bestimmt die Größe der Karte nicht mit */
.fg-s-ein{stop-color:var(--fg-ein)}.fg-s-lunge{stop-color:var(--fg-lunge)}.fg-s-tief{stop-color:var(--fg-tief)}.fg-s-figur{stop-color:var(--fg-figur)}.fg-s-strom{stop-color:var(--fg-strom)}.fg-s-licht{stop-color:var(--fg-licht)}
.fg-kontur{stroke:var(--fg-frand);stroke-width:1.5}.fg-koerper{fill:var(--fg-figur)}.fg-lrand{stroke:var(--fg-lrand)}.fg-licht{fill:var(--fg-licht-l);opacity:.45}
.fg-br{stroke:#0f7a45;stroke-width:2.4;fill:none;stroke-linecap:round;opacity:.8}
.fg-rohr-hof{stroke:#8fe9ff;stroke-width:8;fill:none;stroke-linecap:round;opacity:.3}.fg-rohr{stroke:var(--fg-lrand);stroke-width:2.6;fill:none;stroke-linecap:round}
.fg-zwerchfell{stroke:var(--fg-zw);stroke-width:5;fill:none;stroke-linecap:round}
.fg-mark{stroke:var(--fg-zw);stroke-opacity:.6;stroke-width:2.5;fill:none;stroke-dasharray:6 7;stroke-linecap:round}.fg-mark-bauch{fill:rgba(255,207,92,.07);stroke:var(--fg-zw);stroke-opacity:.55;stroke-width:2;stroke-dasharray:6 7}
.fg-zmark{opacity:0}.fg-figur[data-zone=bauch] .fg-zmark[data-z=bauch],.fg-figur[data-zone=brust] .fg-zmark[data-z=brust],.fg-figur[data-zone=flanken] .fg-zmark[data-z=flanken],.fg-figur[data-zone=beide] .fg-zmark[data-z=bauch],.fg-figur[data-zone=beide] .fg-zmark[data-z=brust]{opacity:1}
.fg-weg{stroke:var(--fg-strom);stroke-opacity:.16;stroke-width:16;fill:none;stroke-linecap:round;stroke-linejoin:round}
.fg-weg2{stroke:var(--fg-phase);stroke-width:3;fill:none;stroke-dasharray:3 9;stroke-linecap:round;opacity:0}
.fg-pkern{fill:#fff;stroke:var(--fg-strom);stroke-width:2.6}
.fg-pk{stroke:var(--fg-pk);stroke-width:11;fill:none;stroke-linecap:round;stroke-linejoin:round}.fg-pw{stroke:var(--fg-pfeil);stroke-width:5.5;fill:none;stroke-linecap:round;stroke-linejoin:round}
.fg-pf{transition:opacity var(--t-ui,180ms) linear}
.fg-haut{fill:var(--fg-haut);stroke:var(--fg-hrand);stroke-width:1.5}.fg-lid{stroke:var(--t2,#b0bccb);stroke-width:1.8;fill:none;stroke-linecap:round}
.fg-kissen{fill:#3a2f6b;stroke:#6a5bb0;stroke-width:1.5}.fg-schien{stroke:#2f3b7c;stroke-width:22;fill:none;stroke-linecap:round}.fg-schienrand{stroke:var(--fg-frand);stroke-width:1.5;fill:none;opacity:.55}
.fg-arm{stroke:#2a356c;stroke-width:20;fill:none;stroke-linecap:round}.fg-armrand{stroke:var(--fg-frand);stroke-width:1.5;fill:none;opacity:.6}
.fg-bein{stroke:#26306a;stroke-width:44;fill:none;stroke-linecap:round}.fg-beinrand{stroke:var(--fg-frand);stroke-width:1.5;fill:none;opacity:.5}
.fg-stuhl{fill:#1c2244;stroke:#4a5596;stroke-width:1.5}.fg-stuhlbein{stroke:#4a5596;stroke-width:6;stroke-linecap:round}.fg-boden{stroke:#2e3b4c;stroke-width:2}
.fg-matte{fill:#151b38;stroke:#2e3b6c;stroke-width:1.5}
.fg-liter{font:500 15px/1 var(--font,-apple-system,system-ui,sans-serif);fill:var(--t2,#b0bccb);opacity:0}.fg-figur[data-modus=gross] .fg-liter{opacity:1}
.fg-zone{position:absolute;left:10px;top:8px;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:rgba(29,39,52,.85);color:var(--t1,#eef2f6);font:600 13px/1.2 var(--font,-apple-system,system-ui,sans-serif);pointer-events:none}
.fg-zone i{width:9px;height:9px;border-radius:50%;background:var(--fg-lunge)}.fg-figur:not([data-pose=uebung]) .fg-zone{display:none}
@media (prefers-reduced-motion:reduce){.fg-pf{transition:none}}`;
  document.head.append(s);
}

let nr = 0;
let mqR = null; const reduziert = () => { try { mqR = mqR || matchMedia('(prefers-reduced-motion: reduce)'); return mqR.matches; } catch { return false; } };

export function erzeugeFigur(host, o = {}) {
  stil();
  const id = `fg${++nr}-`, box = document.createElement('div');
  box.className = 'fg-figur an-figur'; box.setAttribute('role', 'img');
  const T = { ...TEXT, ...(o.texte || {}) };
  const chip = document.createElement('span'); chip.className = 'fg-zone'; chip.setAttribute('aria-hidden', 'true'); chip.innerHTML = '<i></i><b></b>';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  // Ebenen: Lichtkranz (HTML, nur opacity → Compositor) · Figur-SVG · Perlen-SVG (eigene Ebene: bewegte Perlen zeichnen die Figur nicht neu)
  const kranz = document.createElement('div'); kranz.className = 'fg-kranz'; const svg2 = svg.cloneNode(); svg2.classList.add('fg-oben');
  box.append(kranz, svg, svg2, chip); host.append(box);
  const Z = { pose: '', zone: '', phase: '', art: '', weg: '', v: 0, p: 0, q: 0, fill: 0, hand: o.hand, handAn: false, ruhig: false, pfeile: '', perlenSichtbar: 0, schreib: 0, t: 0, liter: 3, tiefe: undefined, licht: o.licht === 'lila' ? 'lila' : 'gold' };
  let ans = o.ansicht === 'vorn' ? 'vorn' : 'seite', mod = o.modus === 'gross' ? 'gross' : 'klein', nam = !!o.namen, E = {}, raf = 0, laeuft = false, letztes = null;
  const put = (e, a, val) => { if (!e) return; const k = '_' + a; if (e[k] === val) return; e[k] = val; e.setAttribute(a, val); Z.schreib++; };
  const dk = (val) => { if (kranz._op === val) return; kranz._op = val; kranz.style.opacity = val; Z.schreib++; };   // Kranz: nur Deckkraft (Compositor)
  const attr = (a, val) => { if (box.getAttribute(a) !== val) box.setAttribute(a, val); };
  function pose(p) {
    p = POSEN[p] ? p : 'uebung'; if (p === Z.pose) return; Z.pose = p;
    const [bau, vb] = POSEN[p]; svg.setAttribute('viewBox', vb); svg.innerHTML = defs(id) + bau(id);
    { const pg = svg.querySelector('.fg-perlen'), par = pg.parentNode, g = document.createElementNS(NS, 'g'), alt = svg.querySelector('ellipse.fg-kranz');
      if (par !== svg) g.setAttribute('transform', par.getAttribute('transform') || '');
      g.append(svg.querySelector('.fg-weg'), svg.querySelector('.fg-weg2'), pg); svg2.setAttribute('viewBox', vb); svg2.replaceChildren(g);
      if (alt) alt.remove(); kranz.hidden = !alt; kranz.dataset.pose = p; }
    const q = (s) => svg.querySelector(s) || svg2.querySelector(s), qa = (s) => [...svg.querySelectorAll(s), ...svg2.querySelectorAll(s)];
    E = { lu: qa('.fg-lu'), fill: qa('.fg-fill'), zw: q('.fg-zw'), perlen: qa('.fg-perle'), weg: q('.fg-weg'), weg2: q('.fg-weg2'), pf: { ein: q('.fg-pf[data-r=ein]'), aus: q('.fg-pf[data-r=aus]') },
      hand: qa('.fg-hand'), zm: Object.fromEntries(qa('.fg-zmark').map((g) => [g.dataset.z, g])), kranz: kranz.hidden ? null : kranz, liter: q('.fg-liter') };
    attr('data-pose', p); Z.zone = ''; Z.weg = '\u0000'; Z.handKey = ''; Z.pfeile = '\u0000';
    if (letztes) setze(letztes, true); else if (p !== 'uebung') bildMed(performance.now());
  }
  function zone(z) {
    if (z === Z.zone) return; Z.zone = z; attr('data-zone', z); chip.lastChild.textContent = T[z] || z;
    if (Z.pose === 'uebung') for (const r of ['ein', 'aus']) { E.pf[r].innerHTML = PFEILE[z][r].map((a) => pfeil(...a)).join(''); }
    Z.handKey = '\u0000';
  }
  function wegSetzen(weg) {   // Pfad der Perlen je Pose/Atemweg
    const k = Z.pose === 'uebung' ? (MUNDWEGE.has(weg) ? 'mund' : 'nase') : 'med'; if (k === Z.weg) return; Z.weg = k;
    const basis = k === 'med' ? MED_WEG : WEG[k], ast = k === 'med' ? MED_AST : AST;
    Z.pl = [polylinie([...basis, ...ast.L]), polylinie([...basis, ...ast.R])];
    const d = dPfad(basis) + dPfad(ast.L) + dPfad(ast.R); put(E.weg, 'd', d); put(E.weg2, 'd', d);
  }
  function haende(an) {
    const key = an ? Z.zone : ''; if (key === Z.handKey) return; Z.handKey = key; Z.handAn = an;
    E.hand.forEach((g, i) => { const h = an && HAENDE[Z.zone] && HAENDE[Z.zone][i]; g.innerHTML = h ? hand(h[0], h[1], h[2], h[3]) : ''; g._rolle = h ? h[4] : ''; });
  }
  function perlenSetzen(fn) {   // fn(k) → [f 0..1 entlang Pfad oder <0 = aus, Deckkraft]
    let n = 0;
    E.perlen.forEach((g, k) => {
      const [f, op] = fn(k), pl = Z.pl[k % 2];
      if (op <= 0 || f < 0) { put(g, 'opacity', '0'); return; }
      const [x, y] = punkt(pl, f); n++;
      put(g, 'transform', `translate(${r1(x)} ${r1(y)})`); put(g, 'opacity', String(r2(op)));
    });
    Z.perlenSichtbar = n;
  }
  function fuellung(f) { const dy = Math.round(-124 * cl(f, 0, 1));   /* ganze Pixel: weniger Neuzeichnen */ E.fill.forEach((g) => put(g, 'transform', `translate(0 ${dy})`)); Z.fill = f; }

  // ---- Übung/Augen-auf: Zustand aus der Sitzungs-Uhr (gleiche Werte wie anatomie.setze)
  function setze(z = {}, nurNeu = false) {
    letztes = z; laeuft = false; if (raf) { cancelAnimationFrame(raf); raf = 0; }
    const art = z.art || 'bauch', ph = phaseAus(z.phase), p = cl(+z.anteil || 0, 0, 1), v = cl(+z.v || 0, -1, 1.25);
    const ruhig = !!(z.ruhig ?? o.ruhig ?? reduziert()), amp = ruhig ? .25 : 1;
    Z.v = v; Z.p = p; Z.art = art; Z.roh = z.phase || 'ruhe'; Z.tiefe = z.tiefe; Z.ruhig = ruhig; if (!nurNeu) Z.t = z.zeit ?? performance.now();
    if (ph !== Z.phase) { Z.phase = ph; attr('data-phase', ph); box.setAttribute('aria-label', `${T.figur}: ${T[zoneAus(art)]} · ${T[ph]}`); }
    zone(zoneAus(art)); wegSetzen(z.weg || 'nase');
    const L = literEnde(art, z.tiefe); Z.liter = Math.max(1.2, v >= 0 ? 3 + v * (Math.min(6, L) - 3) : 3 + v * 1.2);
    // Füllung: 0 → 85 % beim Einatmen, „noch etwas“ bis 100 %
    fuellung(v <= 1 ? .85 * cl(v, 0, 1) : .85 + .15 * cl((v - 1) / .2, 0, 1));
    const qv = cl(v, -.6, 1.2) * amp; Z.q = qv;
    if (Z.pose === 'uebung') {
      const zn = Z.zone;
      const [sx, sy, oy, dy] = zn === 'brust' ? [1 + .08 * qv, 1 + .05 * qv, 254, -3 * qv] : zn === 'beide' ? [1 + .06 * qv, 1 + .08 * qv, 194, -1.5 * qv] : zn === 'flanken' ? [1 + .09 * qv, 1 + .05 * qv, 194, 0] : [1 + .04 * qv, 1 + .10 * qv, 134, 0];
      for (const g of E.lu) { const cx = g.dataset.l === 'L' ? 146 : 154; put(g, 'transform', `translate(${cx} ${r1(oy + dy)}) scale(${r2(sx)} ${r2(sy)}) translate(-${cx} -${oy})`); }
      const zw = (zn === 'brust' ? 4 : zn === 'flanken' ? 9 : zn === 'beide' ? 11 : 14) * qv;
      put(E.zw, 'transform', `translate(0 ${r1(266 + zw)}) scale(1 ${r2(1 - .35 * cl(qv, 0, 1))}) translate(0 -266)`);
      if (zn === 'bauch' || zn === 'beide') put(E.zm.bauch, 'transform', `translate(150 314) scale(${r2(1 + .08 * qv)} ${r2(1 + .06 * qv)}) translate(-150 -314)`);
      if (zn === 'flanken') put(E.zm.flanken, 'transform', `translate(150 0) scale(${r2(1 + .05 * qv)} 1) translate(-150 0)`);
      if (zn === 'brust' || zn === 'beide') put(E.zm.brust, 'transform', `translate(0 ${r1(-6 * qv)})`);
      // Hände: Standard an bei Bauch/Brust/Flanken, nicht bei Kraft-/Wach-Atmung (staccato) und beim Anhalten
      const handAn = Z.hand != null ? !!Z.hand : art !== 'staccato' && !z.anhalten;
      haende(handAn);
      E.hand.forEach((g) => {
        const r = g._rolle; if (!r) return;
        const h2 = (x) => Math.round(x * 2) / 2, t = r === 'bauch' ? `translate(0 ${h2((zn === 'bauch' ? -14 : zn === 'beide' ? -10 : -2) * qv)})` : r === 'brust' ? `translate(0 ${h2((zn === 'brust' ? -11 : zn === 'beide' ? -8 : -1) * qv)})` : `translate(${h2((r === 'links' ? -9 : 9) * qv)} 0)`;   // 020-nb M2: Hand hebt sich deutlicher
        put(g, 'transform', t);
      });
      // Pfeile: immer dort, wohin die Übung führt; Halten/Leer/Ruhe: keine
      const pr = ph === 'ein' || ph === 'noch' ? 'ein' : ph === 'aus' ? 'aus' : '';
      if (pr !== Z.pfeile) { Z.pfeile = pr; put(E.pf.ein, 'opacity', pr === 'ein' ? '1' : '0'); put(E.pf.aus, 'opacity', pr === 'aus' ? '1' : '0'); }
      put(E.liter, 'opacity', mod === 'gross' ? '1' : '0');
      if (mod === 'gross') { const txt = `≈ ${Z.liter.toFixed(1).replace('.', ',')} L`; if (E.liter.textContent !== txt) { E.liter.textContent = txt; Z.schreib++; } }
    } else {
      for (const g of E.lu) { const cx = g.dataset.l === 'L' ? 146 : 154; put(g, 'transform', `translate(${cx} 134) scale(${r2(1 + .04 * qv)} ${r2(1 + .08 * qv)}) translate(-${cx} -134)`); }
      if (E.kranz) dk(r2(.55 + .3 * cl(v, 0, 1)));
    }
    // Atemstrom: ruhig = gestrichelter Pfad in Phasenfarbe, Perlen stehen nicht im Weg
    put(E.weg2, 'opacity', ruhig && ph !== 'ruhe' ? '.9' : '0');
    if (ruhig || ph === 'ruhe') perlenSetzen(() => [-1, 0]);
    else if (ph === 'halten' || ph === 'leer') perlenSetzen((k) => [.5 + .45 * (k >> 1) / 3, .3]);   // stehen, 30 %
    else {
      const P = sm(p), Lt = .55, aus = ph === 'aus';
      perlenSetzen((k) => { const f = P * (1 + Lt) - (k / 7) * Lt; if (f < 0 || f > 1) return [-1, 0]; const ff = aus ? 1 - f : f; return [ff, cl(f / .06, 0, 1) * cl((1 - f) / .08, 0, 1)]; });
    }
  }

  // ---- Meditation ohne Takt: Licht atmet mit 12 s Periode (Kranz 0,55–0,85), Perlen strömen ruhig über die Nase in die Lunge
  function bildMed(t) {
    const ruhig = !!(o.ruhig ?? reduziert()); Z.ruhig = ruhig; Z.t = t; Z.roh = 'ruhe'; wegSetzen('nase');
    if (Z.phase !== 'ruhe') { Z.phase = 'ruhe'; attr('data-phase', 'ruhe'); box.setAttribute('aria-label', `${T.figur}: ${T.ruhe}`); }
    const w = ruhig ? .5 : .5 - .5 * Math.cos(2 * Math.PI * t / 12000);
    if (E.kranz) dk(r2(.55 + .3 * w));
    fuellung(.35 + .3 * w);
    for (const g of E.lu) { const cx = g.dataset.l === 'L' ? 146 : 154; put(g, 'transform', `translate(${cx} 134) scale(${r2(1 + .01 * w)} ${r2(1 + .02 * w)}) translate(-${cx} -134)`); }
    put(E.weg2, 'opacity', ruhig ? '.9' : '0');
    if (ruhig) perlenSetzen(() => [-1, 0]);
    else { const u = t / 6000; perlenSetzen((k) => { const f = ((u + k / 8) % 1 + 1) % 1; return [f, cl(f / .08, 0, 1) * cl((1 - f) / .12, 0, 1) * .95]; }); }
  }
  const sicht = () => { if (!document.hidden && laeuft && !raf) raf = requestAnimationFrame(takt); };
  function takt(t) {
    raf = 0; if (!laeuft) return;
    if (!box.isConnected) { halt(); return; }
    if (document.hidden) return;                       // pausiert; visibilitychange setzt fort (aus der Uhrzeit, nichts nachholen)
    bildMed(t); raf = requestAnimationFrame(takt);
  }
  function laufe() {
    letztes = null; if (laeuft) return; laeuft = true; document.addEventListener('visibilitychange', sicht);
    if ((o.ruhig ?? reduziert())) { bildMed(performance.now()); laeuft = false; return; }   // ruhige Variante: ein stilles Bild, kein rAF
    if (!raf && !document.hidden) raf = requestAnimationFrame(takt);
  }
  function halt() { laeuft = false; if (raf) cancelAnimationFrame(raf); raf = 0; document.removeEventListener('visibilitychange', sicht); }

  attr('data-licht', Z.licht); attr('data-modus', mod);
  pose(o.pose || 'uebung');
  if (Z.pose === 'uebung') setze({ phase: 'ruhe', art: o.art || 'bauch', v: 0, anteil: 0 });
  return {
    setze,
    ansicht(a) { ans = a === 'vorn' ? 'vorn' : 'seite'; },   // die stilisierte Figur ist immer von vorn; Wert bleibt für die Einstellung erhalten
    modus(m) { mod = m === 'gross' ? 'gross' : 'klein'; attr('data-modus', mod); if (letztes) setze(letztes, true); },
    namen(b) { nam = !!b; },
    muskelAn(m) { const M = o.daten && o.daten.MUSKELN, d = Array.isArray(M) ? M.find((x) => x.id === m) : M && M[m]; return { id: m, name_ui: d ? d.name_ui : m, rolle: d ? d.rolle : '' }; },
    pose(p) { pose(p); if (Z.pose !== 'uebung' && !letztes) laufe(); },
    licht(c) { Z.licht = c === 'lila' ? 'lila' : 'gold'; attr('data-licht', Z.licht); },
    hand(b) { Z.hand = b == null ? undefined : !!b; Z.handKey = '\u0000'; if (letztes) setze(letztes, true); },
    laufe, halt,
    zustand: () => ({ pose: Z.pose, zone: Z.zone, art: Z.art, phase: Z.roh || Z.phase, fphase: Z.phase, v: Z.v, p: Z.p, fuellung: Z.fill, hand: Z.handAn, pfeile: Z.pfeile, perlen: Z.perlenSichtbar, ruhig: Z.ruhig, licht: Z.licht,
      ansicht: ans, modus: mod, namen: nam, liter: Z.liter, deckkraft: {}, schreib: Z.schreib, laeuft: !!raf, groesse: [box.clientWidth, box.clientHeight] }),
    zerstoere() { halt(); box.remove(); letztes = null; },
    element: box,
  };
}
export const erzeugeAnatomie = erzeugeFigur;   // gleiche Schnittstelle: sitzung.js/vorschau.js tauschen nur den Modulpfad
