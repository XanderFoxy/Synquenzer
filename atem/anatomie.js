// anatomie.js – „Atem“: 2,5D-SVG-Figur (Seite + Vorn), arbeitende Muskeln, Lunge, Zwerchfell, Luftweg, Pfeile.
// Schnittstelle KONZEPT §5. Werte: recherche-gesang.json → animation (cm am Ende des Einatmens, „Darstellung“ bis ×1,5 überhöht).
// Keine Bibliothek, keine Filter, ein SVG je Ansicht (einmal gebaut), je Bild nur geänderte Attribute.
const NS = 'http://www.w3.org/2000/svg';
const W0 = 150, H0 = 250, KERN = 96;              // Figurraum in Einheiten; KERN = Rumpfbreite, die frei bleiben soll
const U = 3.6;                                     // Einheiten je cm
export const MUSKEL_IDS = ['zwerchfell', 'zwischenrippen_aussen', 'zwischenrippen_innen', 'bauchmuskeln', 'treppenmuskeln', 'kopfwender', 'trapez_oben', 'brustmuskel_klein', 'ruecken_breit'];
const KURZ = { zwerchfell: ['Zwerchfell'], zwischenrippen_aussen: ['Zwischenrippen', 'außen'], zwischenrippen_innen: ['Zwischenrippen', 'innen'],
  bauchmuskeln: ['Bauchmuskeln'], treppenmuskeln: ['Treppenmuskeln'], kopfwender: ['Kopfwender'], trapez_oben: ['Kapuzenmuskel', 'oben'],
  brustmuskel_klein: ['Kleiner', 'Brustmuskel'], ruecken_breit: ['Breiter', 'Rückenmuskel'] };
const ROLLE = { zwerchfell: 'Haupt-Einatemmuskel: Die Kuppel wird flacher und rückt nach unten, Luft strömt ein. In Ruhe steigt sie beim Ausatmen von selbst zurück.',
  zwischenrippen_aussen: 'Heben beim Einatmen die Rippen: unten zur Seite wie ein Eimerhenkel, oben das Brustbein nach vorn.',
  zwischenrippen_innen: 'Senken und verengen die Rippen beim aktiven Ausatmen. In Ruhe kaum nötig.',
  bauchmuskeln: 'Aktives Ausatmen: drücken den Bauch nach innen und schieben das Zwerchfell hoch. Beim Singen, Husten und Staccato aktiv.',
  treppenmuskeln: 'Seitlich am Hals. Heben die oberste Rippe, stark beim tiefen oder angestrengten Einatmen.',
  kopfwender: 'Atemhilfsmuskel: hebt Brustbein und Schlüsselbein bei angestrengter Hochatmung.',
  trapez_oben: 'Hebt die Schultern. Bei Hochatmung sichtbar aktiv.',
  brustmuskel_klein: 'Atemhilfsmuskel beim angestrengten Einatmen, vorn an der oberen Brust.',
  ruecken_breit: 'Hilft beim kräftigen Ausatmen, etwa beim Husten oder am Ende langer Phrasen.' };
export const GEWICHTE = { bauch: { zw: 1, ri: .3, hoch: 0, aktivAus: 0 }, flanke: { zw: .6, ri: 1, hoch: 0, aktivAus: 0 }, brust: { zw: .2, ri: .8, hoch: 1, aktivAus: 0 },
  gemischt: { zw: .8, ri: .6, hoch: .4, aktivAus: 0 }, stuetze: { zw: .8, ri: .8, hoch: 0, aktivAus: .5 }, staccato: { zw: .8, ri: .4, hoch: 0, aktivAus: 1 } };
export const TIEFE_STD = { bauch: .6, flanke: .8, brust: .7, gemischt: .9, stuetze: .8, staccato: .5 };
const ARTEN = { bauch: 'bauch', flanke: 'flanke', flanken: 'flanke', brust: 'brust', gemischt: 'gemischt', 'bauch+brust': 'gemischt', stuetze: 'stuetze', singen_gestuetzt: 'stuetze', staccato: 'staccato' };
export const artAus = (b) => ARTEN[b] || 'bauch';
// cm am Ende des Einatmens: [Kuppel (− = runter), Rippen seitlich je Seite, Brustbein vor, Brustbein hoch, Bauchwand vor, Flanken hinten, Schultern hoch, Schlüsselbein hoch]
const CM = { ruhig: [-1.8, .2, .2, .1, .6, .2, 0, 0], tief: [-5.5, .5, .5, .3, 3, .5, 0, 0], flanke: [-4.5, 1, .6, .3, 1.5, 1, 0, 0], brust: [-1, .2, 1, 1.5, -.3, 0, 2, 1.5] };
const STUFE_OP = [0, .3, .55, .85];
const MUNDWEGE = new Set(['mund', 'sss', 'fff', 'vokal', 'ha', 'brr', 'strohhalm']);
const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a, b) => (x < a ? a : x > b ? b : x), r = (n) => Math.round(n * 10) / 10;

function ende(art, tiefe) {   // Werte am Ende des Einatmens (cm) und Liter (Richtwerte GA06/GA07/GA13)
  if (art === 'bauch' || art === 'staccato') return { e: CM.ruhig.map((x, i) => lerp(x, CM.tief[i], tiefe)), L: 3 + (tiefe <= .8 ? .4 + .75 * tiefe : 1 + 7.5 * (tiefe - .8)) };   // Atemzug: ruhig ≤ 1,0 L (GA06 0,5 L), tief bis 2,5 L
  const g = art === 'brust' ? CM.brust : art === 'gemischt' ? CM.tief.map((x, i) => .6 * x + .4 * CM.brust[i]) : CM.flanke;
  const bis = art === 'brust' ? 3.8 : art === 'gemischt' ? 4.52 : 4.6, f = cl(tiefe / TIEFE_STD[art], .25, 1.35);
  return { e: g.map((x) => x * f), L: 3 + (bis - 3) * f };
}
// Reiner Rig: Körperwerte in cm + Liter zu einem Zeitpunkt. stoss = Hülle 0..1 eines Staccato-Stoßes.
export function koerper({ art = 'bauch', tiefe, phase = 'ruhe', anteil = 0, v = 0, liegend = false, stoss = 0 } = {}) {
  art = artAus(art); tiefe = tiefe ?? TIEFE_STD[art];
  const { e, L } = ende(art, cl(tiefe, 0, 1)), m = v >= 0 ? v : v * .7;
  let [kz, ri, bv, bh, ba, fl, sh, sl] = e.map((x) => x * m);
  if (v < 0) sh = sl = 0;                                   // Schultern sinken nicht unter die Ruhelage
  if (art === 'stuetze' && phase === 'aus') {               // singen_phrase: Rippen bleiben in der ersten Hälfte weit, Bauch geht stetig nach innen
    const q = cl(anteil, 0, 1), q2 = q * q;
    kz = lerp(e[0], .5, q); ri = e[1] * (1 - q2); bv = e[2] * (1 - q2); bh = e[3] * (1 - q2); fl = lerp(e[5], .1, q2); sh = sl = 0;
    ba = lerp(e[4] * .8, -.6, q) - .3 * cl(q / .06, 0, 1) * (1 - q);   // kurz vor dem Ton leicht nach innen (BT44)
  }
  if (stoss) { ba -= .5 * stoss; kz += .4 * stoss; }
  if (liegend) { kz *= 1.25; ba *= 1.3; ri *= .7; fl *= .7; sh *= .5; sl *= .5; }
  const liter = (v >= 0 ? 3 + v * (Math.min(6, L) - 3) : 3 + v * 1.2) - .08 * stoss;
  return { kz, ri, bv, bh, ba, fl, sh, sl, liter: cl(liter, 1.2, 6), ruhe_kz: liegend ? 1.5 : 0 };
}
// Muskelstufen 0–3 (KONZEPT §5.3). aktiv = Ausatmen unter die Ruhelage (vz < 0).
export function muster(art, phase, anteil = 0, tiefe, aktiv = false) {
  art = artAus(art); tiefe = tiefe ?? TIEFE_STD[art];
  const r = {};
  if (phase === 'ein' || phase === 'ein2') {
    if (art === 'bauch') { r.zwerchfell = Math.min(3, 2 + tiefe); r.zwischenrippen_aussen = 1; if (tiefe < .3) r.treppenmuskeln = 1; }
    else if (art === 'flanke' || art === 'stuetze') { r.zwerchfell = 3; r.zwischenrippen_aussen = 2; }
    else if (art === 'brust') Object.assign(r, { zwerchfell: 1, zwischenrippen_aussen: 2, treppenmuskeln: 3, kopfwender: 3, trapez_oben: 2, brustmuskel_klein: 2 });
    else if (art === 'gemischt') Object.assign(r, { zwerchfell: 3, zwischenrippen_aussen: 2, treppenmuskeln: 1 });
    else r.zwerchfell = 2;
  } else if (phase === 'halten_voll') { if (art === 'brust') r.treppenmuskeln = 1; else if (art !== 'staccato') r.zwerchfell = 1; }
  else if (phase === 'aus') {
    if (art === 'stuetze') Object.assign(r, anteil < 1 / 3 ? { zwerchfell: 1, zwischenrippen_aussen: 1, bauchmuskeln: 1 } : anteil < 2 / 3 ? { bauchmuskeln: 2, zwischenrippen_innen: 1 } : { bauchmuskeln: 3, zwischenrippen_innen: 2, ruecken_breit: 1 });
    else if (aktiv) { r.bauchmuskeln = 2; r.zwischenrippen_innen = 2; }
  } else if (phase === 'stoss_aus') r.bauchmuskeln = 3;
  return r;
}
export const deckkraft = (s) => { s = cl(s || 0, 0, 3); const i = Math.floor(s); return i >= 3 ? STUFE_OP[3] : lerp(STUFE_OP[i], STUFE_OP[i + 1], s - i); };
export const liter = (v, art = 'bauch', tiefe) => koerper({ art, tiefe, v }).liter;
const ARIA = { ein: { bauch: 'Zwerchfell senkt sich, Bauch hebt sich', flanke: 'Zwerchfell senkt sich, untere Rippen weiten sich zur Seite', brust: 'obere Brust und Schultern heben sich, Halsmuskeln arbeiten',
  gemischt: 'Bauch und Brust heben sich beide etwas', stuetze: 'Zwerchfell senkt sich, Flanken weiten sich', staccato: 'Zwerchfell senkt sich' } };
function ariaText(phase, art, aktiv) {
  if (phase === 'ein' || phase === 'ein2') return (phase === 'ein' ? 'Einatmen: ' : 'Nachfüllen: ') + ARIA.ein[art];
  if (phase === 'aus') return art === 'stuetze' ? 'Ausatmen gestützt: Rippen bleiben weit, Bauch geht langsam nach innen' : aktiv ? 'Ausatmen aktiv: Bauchmuskeln helfen' : 'Ausatmen: geschieht von selbst, das Zwerchfell steigt zurück';
  return { halten_voll: 'Halten: Lunge bleibt gefüllt', halten_leer: 'Leer halten', stoss_aus: 'Stoß: Bauchmuskeln ziehen kurz nach innen' }[phase] || 'Ruhig atmen';
}

// ---------------------------------------------------------------- Zeichnung
const P = (x, y) => `${r(x)} ${r(y)}`;
const bz = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
const rot = (p, j, co, si) => [j[0] + (p[0] - j[0]) * co - (p[1] - j[1]) * si, j[1] + (p[0] - j[0]) * si + (p[1] - j[1]) * co];
const pfeil = (k, x, y, w) => `<g data-k="${k}" transform="translate(${x} ${y}) rotate(${w})" opacity="0"><g data-k="${k}r"><path d="M-9 0H7M2-5l6 5-6 5" fill="none" stroke="#e9eef7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
const SJ = [[60, 70], [57, 81], [55, 92], [54, 103], [54, 114], [55, 125]];   // Rippengelenke an der Wirbelsäule (Seite)
const WS = [[72, 44], [69, 50], [66, 56], [63, 62], [60, 69], [57, 80], [55, 91], [54, 102], [54, 113], [55, 124], [56, 135], [58, 146], [60, 158], [61, 170], [61, 182], [59, 194], [56, 206]];
const LAB = {   // [Muskel, Seite der Beschriftung, Ankerpunkt]
  seite: [['trapez_oben', 0, 61, 46], ['treppenmuskeln', 0, 71, 55], ['zwerchfell', 0, 62, 128], ['ruecken_breit', 0, 49, 160],
    ['kopfwender', 1, 84, 49], ['brustmuskel_klein', 1, 86, 84], ['zwischenrippen_aussen', 1, 74, 106], ['zwischenrippen_innen', 1, 96, 124], ['bauchmuskeln', 1, 103, 190]],
  vorn: [['kopfwender', 0, 67, 46], ['trapez_oben', 0, 55, 53], ['brustmuskel_klein', 0, 51, 86], ['zwischenrippen_aussen', 0, 42, 112], ['ruecken_breit', 0, 40, 142],
    ['treppenmuskeln', 1, 85, 50], ['zwischenrippen_innen', 1, 82, 104], ['zwerchfell', 1, 97, 112], ['bauchmuskeln', 1, 81, 182]] };

function baue(ans, id) {
  const seite = ans === 'seite';
  const ws = WS.map(([x, y], i) => { const [nx, ny] = WS[Math.min(i + 1, WS.length - 1)], [px, py] = WS[Math.max(i - 1, 0)], dx = nx - px, dy = ny - py, l = Math.hypot(dx, dy) || 1; return `M${P(x - dx / l * 2.6, y - dy / l * 2.6)}L${P(x + dx / l * 2.6, y + dy / l * 2.6)}`; }).join('');
  const kopf = seite ? 'M66 34C58 22 66 4 82 4C94 4 100 13 99 22L103 29C103 31 101 32 99 32C100 35 99 37 97 38C98 41 96 43 92 43C88 43 85 41 84 40C78 42 70 40 66 34Z' : 'M75 3C66 3 61 11 61 21C61 31 67 39 75 39C83 39 89 31 89 21C89 11 84 3 75 3Z';
  const arm = (s) => { const x = (v) => (s ? 150 - v : v); return `M${x(42)} 60C${x(32)} 58 ${x(25)} 64 ${x(24)} 76C${x(22)} 100 ${x(20)} 128 ${x(21)} 158C${x(22)} 165 ${x(30)} 165 ${x(31)} 158C${x(32)} 132 ${x(33)} 108 ${x(35)} 90Z`; };
  const mus = MUSKEL_IDS.map((m) => `<path id="${id}${ans}-${m}"/>`).join('');
  const u = (m, a) => `<use href="#${id}${ans}-${m}" ${a}/>`;
  const marks = seite
    ? `<g data-k="summen" opacity="0" fill="none" stroke="#bfeaf3" stroke-width="1.4" stroke-linecap="round"><path d="M106 26q3 4 0 8M110 23q5 7 0 14M114 20q7 10 0 20"/></g><path data-k="lippen" opacity="0" d="M96.5 35.2q2.5-1.2 3.6.4q-1.2 1.8-3.6.2" fill="#f0b8a8"/><path data-k="halm" opacity="0" d="M99 36.5L116 38.5" stroke="#d9e2f2" stroke-width="2.4" stroke-linecap="round"/><g data-k="brr" opacity="0" stroke="#f0b8a8" stroke-width="1.2" stroke-linecap="round"><path d="M103 33.5h3M103 36h4M103 38.5h3"/></g><ellipse data-k="nl" cx="100.4" cy="30.6" rx="1.5" ry="1" fill="#bfeaf3" opacity="0"/><ellipse data-k="nr" cx="100.4" cy="30.6" rx="0" ry="0" opacity="0"/>`
    : `<g data-k="summen" opacity="0" fill="none" stroke="#bfeaf3" stroke-width="1.4" stroke-linecap="round"><path d="M64 24q-3 4 0 8M60 21q-5 7 0 14M86 24q3 4 0 8M90 21q5 7 0 14"/></g><path data-k="lippen" opacity="0" d="M70.5 35q4.5-2 9 0q-4.5 3.4-9 0Z" fill="#f0b8a8"/><path data-k="halm" opacity="0" d="M75 36v0" stroke="none"/><g data-k="brr" opacity="0" stroke="#f0b8a8" stroke-width="1.2" stroke-linecap="round"><path d="M67 33.5l-3-1M67 36h-4M67 38.5l-3 1M83 33.5l3-1M83 36h4M83 38.5l3 1"/></g><ellipse data-k="nl" cx="72.6" cy="30.4" rx="1.7" ry="1.1" fill="#bfeaf3" opacity="0"/><ellipse data-k="nr" cx="77.4" cy="30.4" rx="1.7" ry="1.1" fill="#bfeaf3" opacity="0"/>`;
  const luft = seite
    ? ['M101 30C92 30 84 28 80 33C78 38 80 44 84 48L84 74C84 78 82 82 79 87', 'M98 37C92 37 84 38 81 41C80 44 82 46 84 48L84 74C84 78 82 82 79 87']
    : ['M75 30V82C75 86 70 88 65 93M75 82C75 86 80 88 85 93', 'M75 36.5V82C75 86 70 88 65 93M75 82C75 86 80 88 85 93'];
  const pf = seite ? pfeil('pz', 78, 150, 90) + pfeil('pb', 124, 194, 0) + pfeil('pr', 112, 78, -45) + pfeil('ps', 64, 47, -90)
    : pfeil('pz', 57, 164, 90) + pfeil('pr', 27, 146, 180) + pfeil('pr2', 123, 146, 0) + pfeil('ps', 38, 46, -90) + pfeil('ps2', 112, 46, -90);
  const labs = LAB[ans].map(([m]) => `<g data-l="${m}" opacity="0"><path class="an-ll" fill="none" stroke="#f0907f" stroke-opacity=".75" stroke-width=".8"/><circle r="1.8" fill="#f0907f"/><text>${KURZ[m].map((t) => `<tspan>${t}</tspan>`).join('')}</text></g>`).join('');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('data-ansicht', ans);
  svg.innerHTML = `<defs><linearGradient id="${id}${ans}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#27324d"/><stop offset="1" stop-color="#171f31"/></linearGradient>
<radialGradient id="${id}${ans}l" cx=".45" cy=".3" r=".85"><stop offset="0" stop-color="#9ee0ee"/><stop offset=".6" stop-color="#5fb4cc"/><stop offset="1" stop-color="#2f6f8a"/></radialGradient>
<linearGradient id="${id}${ans}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6cc4d9" stop-opacity=".8"/><stop data-k="f1" offset=".5" stop-color="#6cc4d9" stop-opacity=".8"/><stop data-k="f2" offset=".5" stop-color="#6cc4d9" stop-opacity=".1"/><stop offset="1" stop-color="#6cc4d9" stop-opacity=".1"/></linearGradient>
${mus}</defs>
<g data-k="sch" class="an-sch">${seite ? '<path d="M52 72C52 58 76 58 76 72C76 86 70 96 64 98C58 96 52 86 52 72Z" fill="#2b3754" fill-opacity=".55" stroke="#45547a" stroke-width="1.2"/>' : `<path d="${arm(0)}" fill="url(#${id}${ans}h)" stroke="#3d4a6b" stroke-width="1.3"/><path d="${arm(1)}" fill="url(#${id}${ans}h)" stroke="#3d4a6b" stroke-width="1.3"/>`}</g>
<path data-k="koerper" fill="url(#${id}${ans}h)" stroke="#3d4a6b" stroke-width="1.4" stroke-linejoin="round"/>
<path d="${kopf}" fill="url(#${id}${ans}h)" stroke="#3d4a6b" stroke-width="1.4"/>
${seite ? `<path d="${ws}" stroke="#6f7d9e" stroke-opacity=".55" stroke-width="4.6" stroke-linecap="round"/>` : `<path data-k="herz" d="M70 98C64 100 62 112 68 118C74 122 86 120 88 114C90 106 84 96 76 96C74 96 72 97 70 98Z" fill="#8a5466" fill-opacity=".55"/>`}
<g data-k="lungen" fill="url(#${id}${ans}l)" fill-opacity=".7" stroke="#8fd8ea" stroke-opacity=".55" stroke-width="1.1"><path data-k="lu1"/>${seite ? '' : '<path data-k="lu2"/>'}</g>
<path data-k="luN" d="${luft[0]}" fill="none" stroke="#c9eef6" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="0 6.5" opacity=".2"/>
<path data-k="luM" d="${luft[1]}" fill="none" stroke="#c9eef6" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="0 6.5" opacity="0"/>
<path data-k="knorpel" fill="none" stroke="#cfd8ea" stroke-opacity=".22" stroke-width="1.4" stroke-linecap="round"/>
<path data-k="knochen" fill="none" stroke="#d6deef" stroke-opacity=".42" stroke-width="2" stroke-linecap="round"/>
${u('zwerchfell', 'fill="none" stroke="#8e9bbd" stroke-opacity=".8" stroke-width="3.2" stroke-linecap="round"')}
<g fill="none" stroke="#6a7aa3" stroke-opacity=".3" stroke-width="1.7" stroke-linecap="round">${MUSKEL_IDS.slice(1).map((m) => u(m, '')).join('')}</g>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">${MUSKEL_IDS.map((m) => `<g data-m="${m}" opacity="0">${u(m, 'stroke="#f0907f" stroke-opacity=".25" stroke-width="11"')}${u(m, 'stroke="#f0907f" stroke-opacity=".55" stroke-width="5"')}${u(m, 'stroke="#ffd9cf" stroke-opacity=".7" stroke-width="1.4"')}</g>`).join('')}</g>
${marks}${pf}
<g class="an-lab">${labs}</g>
<text data-k="liter" class="an-liter" text-anchor="middle" x="${seite ? 76 : 95}" y="${seite ? 94 : 92}" opacity="0"></text>
<g class="an-info" opacity="0" data-k="hinweis"><text data-k="hw"><tspan>Lunge: Richtwert,</tspan><tspan>nicht deine Messung</tspan></text></g>
<g class="an-info" opacity="0" data-k="lern"><text data-k="lw"><tspan>Ausatmen geschieht</tspan><tspan>von selbst.</tspan></text></g>
<g class="an-hit" fill="none" stroke="#000" stroke-opacity="0" stroke-width="16" stroke-linecap="round">${MUSKEL_IDS.map((m) => `<use href="#${id}${ans}-${m}" data-m="${m}"/>`).join('')}</g>`;
  const q = (k) => svg.querySelector(`[data-k="${k}"]`);
  const el = {}; for (const k of ['koerper', 'sch', 'herz', 'lungen', 'lu1', 'lu2', 'luN', 'luM', 'knorpel', 'knochen', 'summen', 'lippen', 'halm', 'brr', 'nl', 'nr', 'liter', 'hinweis', 'lern', 'hw', 'lw', 'f1', 'f2']) el[k] = q(k);
  el.pf = (seite ? ['pz', 'pb', 'pr', 'ps'] : ['pz', 'pr', 'pr2', 'ps', 'ps2']).map((k) => [k, q(k), q(k + 'r')]);
  for (const m of MUSKEL_IDS) { el['P' + m] = svg.querySelector(`[id="${id}${ans}-${m}"]`); el['M' + m] = svg.querySelector(`g[data-m="${m}"]`); el['L' + m] = svg.querySelector(`g[data-l="${m}"]`); }
  el.zw = el.Pzwerchfell;
  return { svg, el, ans, lab: LAB[ans].map(([m, s, x, y]) => ({ m, s, x, y, g: el['L' + m] })) };
}

// Geometrie je Ansicht: g in Einheiten (positiv kz = Kuppel tiefer). Liefert Pfad-Zeichenketten, Setzen macht der Aufrufer.
function seiteGeo(g) {
  const { kz, ri, bv, bh, ba, fl, sh, sl, rk } = g;
  const st = [95 + bv * .7, 63 - bh], xi = [102 + bv, 127 - bh * .5];
  const bhA = bh / (1.5 * U * 1.5), riA = ri / (U * 1.5) * .8;
  const R = [], S = [];
  let kn = `M${P(66, 63 - sh)}Q${P(80, 61 - sh * .5 - bh * .5)} ${P(st[0] - 1, st[1])}M${P(st[0], st[1])}L${P(xi[0], xi[1])}`, ko = '';
  for (let k = 0; k < 6; k++) {
    const j = SJ[k], s = [lerp(st[0], xi[0], k / 5), lerp(st[1], xi[1], k / 5)], f0 = [88.5 + 1.4 * k - 1.5, 71 + 14.8 * k];
    const th = -((6 - .5 * k) * bhA + (4 + k) * riA) * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
    const p = [j, [j[0] + 10, j[1] + 14 + k], [f0[0] - 16, f0[1] + 8], f0].map((q, i) => (i ? rot(q, j, co, si) : q));
    R.push(p); S.push(s);
    kn += `M${P(...p[0])}C${P(...p[1])} ${P(...p[2])} ${P(...p[3])}`;
    ko += `M${P(...p[3])}Q${P(p[3][0] + 4, s[1] + 4)} ${P(...s)}`;
  }
  let ia = '', ii = '';
  for (let k = 0; k < 5; k++) for (const t0 of [.36, .54, .72]) { const t = t0 + (k % 2) * .08, a = bz(...R[k], t), b = bz(...R[k + 1], t + .04); ia += `M${P(...a)}L${P(...b)}`; }
  for (let k = 1; k < 5; k++) { const a = bz(...R[k], .9), b = bz(...R[k + 1], .8); ii += `M${P(...a)}L${P(...b)}`; }
  const Df = [xi[0] - 3, xi[1] + 7], Dt = [78, 108 + kz - rk], Db = [52 - fl * .4, 168];
  const dz = `M${P(...Df)}C${P(Df[0] - 2, Dt[1] + 2)} ${P(Dt[0] + 14, Dt[1])} ${P(...Dt)}C${P(Dt[0] - 16, Dt[1])} ${P(Db[0] + 4, Db[1] - 30)} ${P(...Db)}`;
  const A = [80, 54 - sl * .4 - bh * .3], F1 = [st[0] - 4, 72 - bh], F2 = [xi[0] - 5, 121 - bh * .5];
  const lu = `M${P(...A)}C${P(88, A[1])} ${P(F1[0], F1[1] - 8)} ${P(...F1)}C${P(F1[0] + 3, 90)} ${P(F2[0], 108)} ${P(...F2)}L${P(Df[0] - 1, Df[1] - 3)}C${P(Df[0] - 3, Dt[1])} ${P(Dt[0] + 14, Dt[1] - 2)} ${P(Dt[0], Dt[1] - 2)}C${P(Dt[0] - 16, Dt[1] - 2)} ${P(Db[0] + 3, Db[1] - 32)} ${P(Db[0] + 1, Db[1] - 3)}C${P(47 - fl * .8, 140)} ${P(50, 100)} ${P(56, 80)}C${P(60, 66)} ${P(70, A[1])} ${P(...A)}Z`;
  const Cf = [104 + bv * .5, 136 - bh * .3], Pb = [98, 232];
  const bauch = `C${P(Cf[0] + 2, 148)} ${P(104 + ba * .6, 160)} ${P(106 + ba * .9, 178)}C${P(108 + ba, 196)} ${P(104 + ba * .6, 222)} ${P(...Pb)}`;
  const koerper = `M70 38C66 46 64 52 60 58C44 66 38 84 38 104C38 120 ${P(40 - fl, 142)} ${P(42 - fl, 160)}C44 176 50 186 48 200C46 214 38 222 40 236L42 246H96L98 232C${P(104 + ba * .6, 222)} ${P(108 + ba, 196)} ${P(106 + ba * .9, 178)}C${P(104 + ba * .6, 160)} ${P(Cf[0] + 2, 148)} ${P(...Cf)}C${P(106 + bv, 120 - bh)} ${P(106 + bv, 84 - bh)} ${P(100 + bv, 66 - bh)}C${P(97 + bv * .6, 61 - bh)} 92 56 90 50L88 42C82 41 74 41 70 38Z`;
  const abs = `M${P(Cf[0] - 3, Cf[1] + 4)}${bauch.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${r(+x - 4)} ${y}`)}M${P(R[5][3][0] - 6, R[5][3][1] + 2)}C${P(90, 160)} ${P(96 + ba * .4, 190)} ${P(97, 214)}M${P(78, 150)}C${P(84, 172)} ${P(90 + ba * .3, 200)} ${P(92, 226)}`;
  const f = (k) => R[k][3];
  return { kn, ko, dz, lu, koerper, sch: sh, herz: 0,
    m: { zwischenrippen_aussen: ia, zwischenrippen_innen: ii, bauchmuskeln: abs,
      treppenmuskeln: `M70 40Q72 54 ${P(74, 68 - bh * .8)}M66 42Q68 56 ${P(70, 70 - bh * .8)}`,
      kopfwender: `M72 34Q84 46 ${P(st[0] - 1, st[1] + 1)}`,
      trapez_oben: `M64 26C60 40 60 52 ${P(62, 62 - sh)}`,
      brustmuskel_klein: [1, 2, 3].map((k) => `M${P(76, 72 - sh)}L${P(f(k)[0] - 1, f(k)[1] - 2)}`).join(''),
      ruecken_breit: `M${P(66, 90 - sh * .5)}C56 110 ${P(46 - fl, 150)} 48 188` } };
}
function vornGeo(g) {
  const { kz, ri, bv, bh, ba, fl, sh, sl, rk } = g, fw = fl * .5 + ba * .12;
  let kn = '', ko = '';
  const R = [[], []];
  for (const s of [-1, 1]) {
    const c = s < 0 ? 0 : 1, X = (d) => 75 + s * d;
    kn += `M${P(X(2), 61 - bh)}C${P(X(13), 63 - bh)} ${P(X(25), 58 - sl)} ${P(X(35), 58 - Math.max(sh, sl) * .9)}`;
    for (let k = 0; k < 6; k++) {
      const lift = bh * (1 - k / 7) * .8 + ri * .05 * k, S = [X(3), 66 + 11 * k - bh * (1 - k / 7)], L = [X(19 + 3.2 * k + ri * (.25 + .15 * k)), 80 + 12.5 * k - lift];
      const p = [S, [S[0] + 10 * s, S[1] - 3], [L[0] - 2 * s, L[1] - 14 + k], L];
      R[c].push(p); kn += `M${P(...S)}C${P(...p[1])} ${P(...p[2])} ${P(...L)}`;
    }
    ko += `M${P(75, 126 - bh * .5)}C${P(X(6), 132)} ${P(X(22 + ri * .6), 142)} ${P(X(31 + ri * .9), 147)}`;
  }
  kn += `M${P(75, 62 - bh)}L${P(75, 126 - bh * .5)}`;
  const ML = [41 - ri, 150], MR = [109 + ri, 150], DL = [57, 113 + kz - rk], C = [75, 121 + kz * .7 - rk], DR = [93, 108 + kz - rk];
  const dz = `M${P(...ML)}C${P(ML[0], ML[1] - 30)} ${P(DL[0] - 10, DL[1])} ${P(...DL)}C${P(DL[0] + 9, DL[1])} ${P(C[0] - 8, C[1])} ${P(...C)}C${P(C[0] + 8, C[1])} ${P(DR[0] - 9, DR[1])} ${P(...DR)}C${P(DR[0] + 10, DR[1])} ${P(MR[0], MR[1] - 30)} ${P(...MR)}`;
  const a = sl * .5 + bh * .3;
  const lu1 = `M${P(61, 52 - a)}C${P(54, 52 - a)} ${P(47 - ri * .4, 64)} ${P(45 - ri * .6, 84)}C${P(43 - ri * .9, 104)} ${P(41 - ri, 124)} ${P(ML[0] + 1, ML[1] - 6)}C${P(ML[0] + 2, ML[1] - 32)} ${P(DL[0] - 10, DL[1] - 2)} ${P(DL[0], DL[1] - 2)}C${P(DL[0] + 5, DL[1] - 2)} ${P(65, DL[1] + 1)} ${P(66, (DL[1] + C[1]) / 2 - 2)}C63 104 69 96 69 84C69 70 68 58 ${P(61, 52 - a)}Z`;
  const lu2 = `M${P(89, 50 - a)}C${P(96, 50 - a)} ${P(103 + ri * .4, 62)} ${P(105 + ri * .6, 82)}C${P(107 + ri * .9, 102)} ${P(109 + ri, 122)} ${P(MR[0] - 1, MR[1] - 6)}C${P(MR[0] - 2, MR[1] - 32)} ${P(DR[0] + 10, DR[1] - 2)} ${P(DR[0], DR[1] - 2)}C${P(DR[0] - 5, DR[1] - 2)} ${P(84, DR[1] + 1)} ${P(83, (DR[1] + C[1]) / 2 - 2)}C82 96 81 76 82 66C83 58 85 ${r(50 - a)} 89 ${r(50 - a)}Z`;
  const side = (s) => { const X = (d) => 75 + s * d; return [[X(39), 84 - sh * .5], [X(39 + ri * .2), 100], [X(38 + ri * .6), 125], [X(36 + ri), 146], [X(34 + ri * .8 + fw), 160], [X(30 + fw), 172], [X(31 + fw * .5), 186], [X(33), 204], [X(37), 218], [X(36), 246]]; };
  const Lr = side(-1), Rr = side(1);
  const koerper = `M68 38L67 50C60 54 50 56 ${P(42, 58 - sh)}C${P(34, 60 - sh)} ${P(32, 70 - sh)} ${P(...Lr[0])}C${P(...Lr[1])} ${P(...Lr[2])} ${P(...Lr[3])}C${P(...Lr[4])} ${P(...Lr[5])} ${P(...Lr[6])}C${P(...Lr[7])} ${P(...Lr[8])} ${P(...Lr[9])}L${P(...Rr[9])}C${P(...Rr[8])} ${P(...Rr[7])} ${P(...Rr[6])}C${P(...Rr[5])} ${P(...Rr[4])} ${P(...Rr[3])}C${P(...Rr[2])} ${P(...Rr[1])} ${P(...Rr[0])}C${P(118, 70 - sh)} ${P(116, 60 - sh)} ${P(108, 58 - sh)}C100 56 90 54 83 50L82 38Z`;
  let ia = '', ii = '';
  for (const c of [0, 1]) {
    for (let k = 0; k < 5; k++) for (const t0 of [.66, .84]) { const t = t0 + (k % 2) * .07, p = bz(...R[c][k], t), q = bz(...R[c][k + 1], t - .06); ia += `M${P(...p)}L${P(...q)}`; }
    for (let k = 1; k < 5; k++) { const p = bz(...R[c][k], .16), q = bz(...R[c][k + 1], .26); ii += `M${P(...p)}L${P(...q)}`; }
  }
  const pt = (c, k, t) => bz(...R[c][k], t);
  const abs = `M68 140C67 170 68 200 71 226M82 140C83 170 82 200 79 226M75 132V228M69 156H81M68.5 172H81.5M69 190H81M${P(41 - ri * .8, 153)}C48 176 58 200 68 214M${P(109 + ri * .8, 153)}C102 176 92 200 82 214`;
  return { kn, ko, dz, lu: lu1, lu2, koerper, sch: sh, herz: kz * .7 - rk,
    m: { zwischenrippen_aussen: ia, zwischenrippen_innen: ii, bauchmuskeln: abs,
      treppenmuskeln: `M66 40C64 48 60 56 ${P(56, 65 - bh * .7)}M84 40C86 48 90 56 ${P(94, 65 - bh * .7)}`,
      kopfwender: `M64 33C66 44 70 54 ${P(73, 61 - bh)}M86 33C84 44 80 54 ${P(77, 61 - bh)}`,
      trapez_oben: `M68 44C62 52 ${P(52, 55 - sh * .6)} ${P(42, 58 - sh)}M82 44C88 52 ${P(98, 55 - sh * .6)} ${P(108, 58 - sh)}`,
      brustmuskel_klein: [0, 1].map((c) => { const o = [c ? 106 : 44, 68 - sh]; return [2, 3, 4].map((k) => `M${P(...o)}L${P(...pt(c, k, .45))}`).join(''); }).join(''),
      ruecken_breit: `M${P(37, 88 - sh * .5)}C${P(37 - ri * .4, 110)} ${P(40 - ri * .8, 136)} ${P(44 - fw, 166)}M${P(113, 88 - sh * .5)}C${P(113 + ri * .4, 110)} ${P(110 + ri * .8, 136)} ${P(106 + fw, 166)}` } };
}

// ---------------------------------------------------------------- Stil (einmal je Dokument; CSP erlaubt 'unsafe-inline' für style)
function stil() {
  if (document.getElementById('an-stil')) return;
  const s = document.createElement('style'); s.id = 'an-stil';
  s.textContent = `.an-figur{position:relative;width:100%;height:100%;min-height:60px;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
.an-figur svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible}
.an-figur text{fill:var(--text,#e3e9f4);paint-order:stroke;stroke:var(--an-grund,#121a28);stroke-linejoin:round;font-family:inherit;font-weight:500}
.an-figur .an-liter{font-weight:600;fill:#e9f8fc}.an-figur .an-info text{fill:var(--leise,#9aa6bf)}
.an-hit use{pointer-events:none}.an-namen .an-hit use{pointer-events:stroke;cursor:pointer}
.an-v{position:relative;display:flex;flex-direction:column;gap:12px;color:var(--text,#e3e9f4);--an-grund:var(--karte,#141c2b)}
.an-v-mitte{display:contents}.an-v-seg,.an-v-knoepfe{display:flex;gap:6px;order:-1}.an-v-knoepfe{order:0;flex-wrap:wrap}
.an-v button{flex:1;min-height:44px;min-width:44px;padding:0 10px;border-radius:12px;border:1px solid var(--linie,#2a3550);background:var(--karte,#141c2b);color:inherit;font:inherit;font-size:15px}
.an-v button[aria-pressed=true]{border-color:var(--akzent,#6cc4d9);background:var(--akzent-weich,#1d3a4c)}
.an-v-fig{position:relative;height:clamp(300px,48vh,440px);border-radius:16px;background:var(--karte,#141c2b);overflow:hidden}
.an-v-fig[data-f=b],.an-v-tab,.an-v-name{display:none}
.an-v-name{position:absolute;left:12px;top:10px;font-size:13px;color:var(--leise,#9aa6bf)}
.an-v dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0;font-size:15px}.an-v dt{color:var(--leise,#9aa6bf)}.an-v dd{margin:0}
.an-v p{margin:0;font-size:15px;line-height:1.4}.an-v-lern{color:var(--leise,#9aa6bf)}
.an-v-tab{border-collapse:collapse;font-size:13px;width:100%}.an-v-tab th,.an-v-tab td{padding:5px 4px;border-bottom:1px solid var(--linie,#2a3550);text-align:left;vertical-align:top}
.an-v-tab th{color:var(--leise,#9aa6bf);font-weight:500}
.an-v-blase{position:absolute;left:8px;right:8px;top:60px;z-index:2;padding:12px 14px;border-radius:14px;background:#1f2a40;border:1px solid #f0907f;box-shadow:0 8px 24px #0008;font-size:15px;line-height:1.4}
.an-v-blase b{display:block;margin-bottom:4px}.an-v-blase button{margin-top:10px;width:100%}
@media (orientation:landscape){.an-v{display:grid;grid-template-columns:1fr minmax(200px,.85fr) 1fr;gap:10px;height:max(300px,calc(100svh - 70px - env(safe-area-inset-top) - env(safe-area-inset-bottom)))}
.an-v-fig{height:auto;min-height:0}.an-v-fig[data-f=b],.an-v-name{display:block}.an-v-mitte{display:flex;flex-direction:column;gap:8px;overflow:auto;min-height:0}
.an-v-tab{display:table}.an-v .an-v-info{display:none}.an-v-seg{flex-wrap:wrap}.an-v-seg button{flex:1 1 40%}.an-v-mitte p{font-size:13px}.an-v-fig[data-f=a]{grid-column:1;grid-row:1}.an-v-mitte{grid-column:2;grid-row:1}.an-v-fig[data-f=b]{grid-column:3;grid-row:1}.an-v-blase{top:auto;bottom:8px;left:25%;right:25%}}`;
  document.head.append(s);
}

// ---------------------------------------------------------------- Figur
let nr = 0;
let mqR = null; const reduziert = () => { try { mqR = mqR || matchMedia('(prefers-reduced-motion: reduce)'); return mqR.matches; } catch { return false; } };
export function erzeugeAnatomie(host, o = {}) {
  stil();
  const id = `an${++nr}-`, box = document.createElement('div');
  box.className = 'an-figur'; box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Figur: Atmung');
  const V = { seite: baue('seite', id), vorn: baue('vorn', id) };
  box.append(V.seite.svg, V.vorn.svg); host.append(box);
  let ans = o.ansicht === 'vorn' ? 'vorn' : 'seite', mod = o.modus === 'gross' ? 'gross' : 'klein', nam = !!o.namen, B = 0, H = 0, letztes = null;
  const Z = { t: 0, v: 0, dv: 0, phase: '', art: '', weg: '', op: Object.fromEntries(MUSKEL_IDS.map((m) => [m, 0])), stoss0: -1e9, lern: 0, lernFertig: false, ruhig: null, off: 0, schreib: 0, dir: {}, c: null };
  const put = (e, a, val) => { if (!e) return; const k = '_' + a; if (e[k] === val) return; e[k] = val; e.setAttribute(a, val); Z.schreib++; };
  const info = (m) => { const M = o.daten && o.daten.MUSKELN, d = Array.isArray(M) ? M.find((x) => x.id === m) : M && M[m]; return { id: m, name_ui: d ? d.name_ui : KURZ[m].join(' '), rolle: d ? d.rolle : ROLLE[m] }; };
  function layout() {
    if (!B || !H) return;
    const fs = mod === 'gross' ? 13 : 12, lw = 8.2 * fs;   // gerendert ≥ 12 px (Prüfung 15:57)
    const s = Math.max(.3, Math.min(H / H0, B / W0, (B - 2 * lw) / KERN));
    const vw = B / s, vh = H / s, ox = (vw - W0) / 2, oy = Math.max(0, (vh - H0) / 2), fu = fs / s;
    for (const v of Object.values(V)) {
      v.svg.setAttribute('viewBox', `${r(-ox)} ${r(-oy)} ${r(vw)} ${r(vh)}`);
      const lab = v.svg.querySelector('.an-lab'); lab.setAttribute('font-size', r(fu * 10) / 10); lab.setAttribute('stroke-width', r(3 / s * 10) / 10);
      for (const seite of [0, 1]) {
        const L = v.lab.filter((l) => l.s === seite).sort((a, b) => a.y - b.y);
        let y = -oy + fu * 1.2; const ys = [];
        for (const l of L) { const n = KURZ[l.m].length; y = Math.max(y, l.y - (n - 1) * fu * .55); ys.push(y); y += n * fu * 1.15 + fu * .55; }
        const ueber = y - (H0 + oy - fu * .4); if (ueber > 0) for (let i = ys.length - 1, lim = H0 + oy - fu * .4; i >= 0; i--) { const n = KURZ[L[i].m].length; ys[i] = Math.min(ys[i], lim - n * fu * 1.15); lim = ys[i] - fu * .55; }
        L.forEach((l, i) => {
          const x = seite ? W0 + ox - 4 / s : -ox + 4 / s, t = l.g.querySelector('text'), w = Math.max(...KURZ[l.m].map((z) => z.length)) * fu * .56;
          t.setAttribute('text-anchor', seite ? 'end' : 'start');
          [...t.children].forEach((sp, j) => { sp.setAttribute('x', r(x)); sp.setAttribute('y', r(ys[i] + j * fu * 1.15)); });
          const lx = seite ? x - w - 3 / s : x + w + 3 / s, ly = ys[i] - fu * .35;
          l.g.querySelector('path').setAttribute('d', `M${P(lx, ly)}L${P(lx + (seite ? -4 : 4) / s, ly)}L${P(l.x, l.y)}`);
          const c = l.g.querySelector('circle'); c.setAttribute('cx', l.x); c.setAttribute('cy', l.y);
        });
      }
      for (const k of ['hw', 'lw']) { const t = v.el[k], y0 = k === 'hw' ? H0 + oy - fu * 1.6 : H0 + oy - fu * 4.4; t.setAttribute('font-size', r(fu * 10) / 10); [...t.children].forEach((sp, j) => { sp.setAttribute('x', r(-ox + 4 / s)); sp.setAttribute('y', r(y0 + j * fu * 1.1)); }); }
      v.el.liter.setAttribute('font-size', r(fu * 1.05 * 10) / 10);
    }
    if (letztes) setze(letztes, true);
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver((es) => { const c = es[es.length - 1].contentRect; B = c.width; H = c.height; layout(); }) : null;
  if (ro) ro.observe(box); else { B = host.clientWidth; H = host.clientHeight; }
  function zeigeAnsicht() { V.seite.svg.style.display = ans === 'seite' ? '' : 'none'; V.vorn.svg.style.display = ans === 'vorn' ? '' : 'none'; box.classList.toggle('an-namen', nam); }
  zeigeAnsicht();
  box.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-m],[data-l]'); if (!nam || !t) return; const m = t.getAttribute('data-m') || t.getAttribute('data-l'); if (o.beimMuskel) o.beimMuskel(m, info(m)); box.dispatchEvent(new CustomEvent('anatomie-muskel', { bubbles: true, detail: info(m) })); });

  function setze(z = {}, nurNeu = false) {
    letztes = z;
    const t = z.zeit ?? performance.now();
    const erst = !Z.t; let dt = Z.t ? t - Z.t : 16; if (nurNeu) dt = 0; else { if (dt < 0 || dt > 250) dt = 16; Z.t = t; }
    const art = artAus(z.art), tiefe = cl(z.tiefe ?? TIEFE_STD[art], 0, 1), phase = z.phase || 'ruhe', p = cl(+z.anteil || 0, 0, 1);
    const v = cl(+z.v || 0, -1, 1.2), ruhig = z.ruhig ?? o.ruhig ?? reduziert(), weg = z.weg || 'nase';
    if (dt > 0) { const roh = (v - Z.v) / (dt / 1000); Z.dv += (cl(roh, -20, 20) - Z.dv) * Math.min(1, dt / 90); } Z.v = v;
    const aktiv = phase === 'aus' && (z.vz != null ? z.vz < 0 : v < -.02);
    if (phase === 'stoss_aus' && Z.phase !== 'stoss_aus') Z.stoss0 = t;
    const ts = t - Z.stoss0, env = ts < 0 ? 0 : ts < 120 ? 1 - (1 - ts / 120) ** 2 : Math.max(0, 1 - (ts - 120) / 250);
    if (phase !== Z.phase || art !== Z.art) {
      box.setAttribute('aria-label', ariaText(phase, art, aktiv)); box.setAttribute('data-art', art); box.setAttribute('data-phase', phase);
      if (Z.lern && phase !== Z.phase) { Z.lern = 0; Z.lernFertig = true; }
      if (mod === 'gross' && phase === 'aus' && !aktiv && art !== 'stuetze' && !Z.lernFertig && !z.muskeln) Z.lern = 1;
      Z.phase = phase; Z.art = art;
    }
    const c = koerper({ art, tiefe, phase, anteil: p, v, liegend: !!z.liegend, stoss: env }); Z.c = c;
    const lv = z.muskeln || muster(art, phase, p, tiefe, aktiv), schritt = dt * .85 / 300;
    for (const m of MUSKEL_IDS) {
      let ziel = deckkraft(lv[m]), cur = Z.op[m];
      if (m === 'bauchmuskeln' && !z.muskeln && env > 0 && (phase === 'stoss_aus' || ts < 370)) cur = Math.max(deckkraft(3 * env), phase === 'stoss_aus' ? 0 : ziel);
      else cur = erst ? ziel : cur + cl(ziel - cur, -schritt, schritt);
      Z.op[m] = cur;
    }
    if (!B || !H) return;                                   // unsichtbar: nur Zustand merken
    const VV = V[ans], E = VV.el, k = U * 1.5;
    const g = ruhig ? { kz: 0, ri: 0, bv: 0, bh: 0, ba: 0, fl: 0, sh: 0, sl: 0, rk: z.liegend ? 1.5 * U : 0 }
      : { kz: -c.kz * U * 1.1, ri: c.ri * k, bv: c.bv * k, bh: c.bh * k, ba: c.ba * U * 1.2, fl: c.fl * k, sh: c.sh * k, sl: c.sl * k, rk: c.ruhe_kz * U };
    const G = ans === 'seite' ? seiteGeo(g) : vornGeo(g);
    put(E.koerper, 'd', G.koerper); put(E.knochen, 'd', G.kn); put(E.knorpel, 'd', G.ko); put(E.zw, 'd', G.dz);
    put(E.lu1, 'd', G.lu); if (E.lu2) put(E.lu2, 'd', G.lu2);
    put(E.sch, 'transform', `translate(0 ${r(-G.sch)})`); if (E.herz) put(E.herz, 'transform', `translate(0 ${r(G.herz)})`);
    for (const m in G.m) put(E['P' + m], 'd', G.m[m]);
    // Lunge: Füllung (ruhig: Füllstand statt Form)
    const fL = (c.liter - 2.4) / 3.1;   // Füllstand (ruhige Ansicht): sichtbarer Bereich 2,4–5,5 L
    put(E.lungen, 'fill', ruhig ? `url(#${id}${ans}f)` : `url(#${id}${ans}l)`);
    if (ruhig) { const of = r(cl(fL, 0, 1) * 100) / 100; put(E.f1, 'offset', of); put(E.f2, 'offset', of); put(E.lungen, 'fill-opacity', 1); }
    else put(E.lungen, 'fill-opacity', r((.42 + .5 * fL) * 100) / 100);
    // Muskeln
    for (const m of MUSKEL_IDS) {
      const cur = Z.op[m], oq = r(cur * 100) / 100; put(E['M' + m], 'opacity', oq);
      put(E['L' + m], 'opacity', nam ? r((.45 + .55 * cl(cur / .3, 0, 1)) * 100) / 100 : r(cl(cur / .3, 0, 1) * 100) / 100);
    }
    // Luftweg
    const mund = MUNDWEGE.has(weg), fliesst = /^(ein|ein2|aus|stoss_aus)$/.test(phase), sp = Math.abs(Z.dv);
    if (!ruhig && fliesst) { Z.off += (Z.dv > 0 ? -1 : 1) * (6 + 55 * sp) * dt / 1000; Z.off %= 650; }
    const lo = r((fliesst ? (ruhig ? .55 : cl(.25 + sp * 1.6, .25, .9)) : .14) * 100) / 100;
    put(E.luN, 'opacity', mund ? 0 : lo); put(E.luM, 'opacity', mund ? lo : 0); put(mund ? E.luM : E.luN, 'stroke-dashoffset', r(Z.off));
    if (weg !== Z.weg || ans !== Z.wans) {
      Z.weg = weg; Z.wans = ans;
      put(E.summen, 'opacity', weg === 'summen' ? 1 : 0); put(E.lippen, 'opacity', mund ? .9 : 0); put(E.brr, 'opacity', weg === 'brr' ? 1 : 0); put(E.halm, 'opacity', weg === 'strohhalm' ? 1 : 0);
      put(E.nl, 'opacity', weg === 'links' ? 1 : weg === 'rechts' ? .12 : mund ? 0 : .55); put(E.nr, 'opacity', weg === 'rechts' ? 1 : weg === 'links' ? .12 : mund ? 0 : .55);
    }
    // Pfeile (nur bei Bewegung, nicht ruhig)
    const W = GEWICHTE[art], sicht = ruhig ? 0 : cl((sp - .05) / .3, 0, 1) * .9, dir = Z.dv >= 0 ? 1 : -1;
    const rel = { pz: W.zw, pb: Math.min(1, Math.abs(ende(art, tiefe).e[4]) / 1.2), pr: ans === 'seite' ? W.hoch : W.ri * (art === 'bauch' ? .4 : 1), ps: W.hoch };
    for (const [a, e, inner] of E.pf) {
      put(e, 'opacity', r(sicht * rel[a.slice(0, 2)] * 100) / 100);
      const fl = a === 'pb' && art === 'brust' ? -dir : dir;
      if (Z.dir[ans + a] !== fl) { Z.dir[ans + a] = fl; inner.setAttribute('transform', `scale(${fl} 1)`); }
    }
    // Liter, Hinweis, Lernsatz (nur groß)
    const gr = mod === 'gross';
    put(E.liter, 'opacity', gr ? 1 : 0); put(E.hinweis, 'opacity', gr ? 1 : 0);
    if (gr) { const txt = `≈ ${c.liter.toFixed(1).replace('.', ',')} L`; if (E.liter.textContent !== txt) { E.liter.textContent = txt; Z.schreib++; } }
    put(E.lern, 'opacity', gr && Z.lern ? 1 : 0);
  }
  return {
    setze,
    ansicht(a) { ans = a === 'vorn' ? 'vorn' : 'seite'; zeigeAnsicht(); if (letztes) setze(letztes, true); },
    modus(m) { mod = m === 'gross' ? 'gross' : 'klein'; layout(); },
    namen(b) { nam = !!b; zeigeAnsicht(); if (letztes) setze(letztes, true); },
    muskelAn: info,
    zustand: () => ({ art: Z.art, phase: Z.phase, v: Z.v, dv: Z.dv, ansicht: ans, modus: mod, liter: Z.c && Z.c.liter, koerper: Z.c, deckkraft: { ...Z.op }, schreib: Z.schreib, groesse: [B, H] }),
    zerstoere() { if (ro) ro.disconnect(); box.remove(); letztes = null; },
    element: box,
  };
}

// ---------------------------------------------------------------- Vergleich „Zwerchfell oder Brust?“ (KONZEPT §2.11)
const VGL = { titel: 'Bauch- und Brustatmung im Vergleich', hinweis_ui: 'Das Zwerchfell arbeitet bei beiden – nur unterschiedlich stark.',
  zeilen: [['Was hebt sich?', 'Bauch, Taille, untere Rippen', 'Obere Brust, Schlüsselbein, Schultern'], ['Hauptmuskel', 'Zwerchfell', 'Hilfsmuskeln an Hals und Brust'],
    ['Luft pro Atemzug', 'viel bei wenig Mühe', 'weniger bei mehr Mühe'], ['Hals und Schultern', 'locker', 'angespannt'], ['Gut für', 'Ruhe, Singen, lange Sätze', 'kurz bei großer Anstrengung']].map(([merkmal, bauch_flanke, brust_hoch]) => ({ merkmal, bauch_flanke, brust_hoch })) };
const VART = [['bauch', 'Bauch', 'Atme so, dass sich der Bauch hebt – die Schultern bleiben unten.'], ['flanke', 'Flanke', 'Hände an die unteren Rippen: Beim Einatmen schieben sie sich zur Seite. Schultern bleiben unten.'],
  ['brust', 'Brust', 'Wenn sich die Schultern beim Einatmen heben, atmest du hoch in die Brust. Beim Singen besser tiefer atmen.'], ['gemischt', 'Gemischt', 'Brustkorb und Bauch bewegen sich beide ein wenig. Im Liegen bewegt sich mehr der Bauch.']];
export function schleife(ms) {   // Dauerschleife 4 s ein, 6 s aus (sanft)
  const t = ((ms % 10000) + 10000) % 10000;
  if (t < 4000) { const p = t / 4000; return { phase: 'ein', anteil: p, v: .5 - .5 * Math.cos(Math.PI * p) }; }
  const p = (t - 4000) / 6000; return { phase: 'aus', anteil: p, v: .5 + .5 * Math.cos(Math.PI * p) };
}
export function vergleich(host, o = {}) {
  stil();
  const T = o.vergleich || VGL, el = document.createElement('div'), esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  el.className = 'an-v';
  el.innerHTML = `<div class="an-v-fig" data-f="a"><div class="an-v-name"></div></div><div class="an-v-mitte">
<div class="an-v-seg" role="group" aria-label="Atemart">${VART.map(([a, n]) => `<button type="button" data-art="${a}" aria-pressed="false">${n}</button>`).join('')}</div>
<dl class="an-v-info"></dl>
<table class="an-v-tab"><thead><tr><th></th><th>Bauch/Flanke</th><th>Brust</th></tr></thead><tbody>${T.zeilen.map((z) => `<tr><th>${esc(z.merkmal)}</th><td>${esc(z.bauch_flanke)}</td><td>${esc(z.brust_hoch)}</td></tr>`).join('')}</tbody></table>
<p class="an-v-kern"><b>${esc(T.hinweis_ui)}</b></p><p class="an-v-lern">Beim ruhigen Ausatmen leuchtet nichts: Es geschieht von selbst.</p>
<div class="an-v-knoepfe"><button type="button" data-k="ansicht">${o.ansicht === 'vorn' ? 'Seite' : 'Vorne'}</button><button type="button" data-k="liegen" aria-pressed="false">Im Liegen</button><button type="button" data-k="selbst">Selbst spüren</button></div>
</div><div class="an-v-fig" data-f="b"><div class="an-v-name">Brust</div></div><div class="an-v-blase" hidden></div>`;
  host.append(el);
  const blase = el.querySelector('.an-v-blase');
  const zeige = (m, i) => { blase.innerHTML = `<b>${esc(i.name_ui)}</b>${esc(i.rolle)}<button type="button">Schließen</button>`; blase.hidden = false; };
  blase.addEventListener('click', (e) => { if (e.target.closest('button')) blase.hidden = true; });
  let ans = o.ansicht === 'vorn' ? 'vorn' : 'seite', art = 'bauch', liegend = false, raf = 0, an = true, sicht = true, t0 = performance.now();
  const opt = { ansicht: ans, modus: 'gross', namen: true, daten: o.daten, beimMuskel: zeige, ruhig: o.ruhig };
  const A = erzeugeAnatomie(el.querySelector('[data-f=a]'), opt), Bf = erzeugeAnatomie(el.querySelector('[data-f=b]'), opt);
  const mq = typeof matchMedia === 'function' ? matchMedia('(orientation: landscape)') : null;
  function setArt(a) {
    art = VART.some(([x]) => x === a) ? a : 'bauch'; blase.hidden = true;
    el.querySelectorAll('.an-v-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.art === art)));
    const i = VART.find(([x]) => x === art), spalte = art === 'brust' ? 'brust_hoch' : 'bauch_flanke';
    el.querySelector('.an-v-info').innerHTML = (art === 'gemischt' ? [['Was hebt sich?', 'Brustkorb und Bauch, beide ein wenig'], ['Hauptmuskel', 'Zwerchfell']] : T.zeilen.map((z) => [z.merkmal, z[spalte]])).map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('') + `<dt></dt><dd>${esc(i[2])}</dd>`;
    el.querySelector('[data-f=a] .an-v-name').textContent = (art === 'brust' ? VART[0] : i)[1];
  }
  function takt(t) {
    raf = 0;
    if (!an || !el.isConnected || !sicht || document.hidden) return;
    const z = { ...schleife(t - t0), liegend, zeit: t }, quer = mq && mq.matches;
    A.setze({ ...z, art: quer && art === 'brust' ? 'bauch' : art }); if (quer) Bf.setze({ ...z, art: 'brust' });
    raf = requestAnimationFrame(takt);
  }
  const start = () => { if (!raf && an && sicht && !document.hidden && el.isConnected) raf = requestAnimationFrame(takt); };
  const stopp = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => { sicht = es[es.length - 1].isIntersecting; sicht ? start() : stopp(); }) : null;
  if (io) io.observe(el);
  const vis = () => (document.hidden ? stopp() : start());
  document.addEventListener('visibilitychange', vis);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.closest('.an-v-blase')) return;
    if (b.dataset.art) setArt(b.dataset.art);
    else if (b.dataset.k === 'ansicht') { ans = ans === 'seite' ? 'vorn' : 'seite'; A.ansicht(ans); Bf.ansicht(ans); b.textContent = ans === 'seite' ? 'Vorne' : 'Seite'; }
    else if (b.dataset.k === 'liegen') { liegend = !liegend; b.setAttribute('aria-pressed', String(liegend)); }
    else if (b.dataset.k === 'selbst') { if (o.selbstSpueren) o.selbstSpueren('g_vergleich_brust_bauch'); el.dispatchEvent(new CustomEvent('atem-selbst-spueren', { bubbles: true, detail: { technik: 'g_vergleich_brust_bauch' } })); }
  });
  setArt(o.art || 'bauch'); start();
  return {
    art: setArt, ansicht(a) { ans = a === 'vorn' ? 'vorn' : 'seite'; A.ansicht(ans); Bf.ansicht(ans); },
    zerstoere() { an = false; stopp(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', vis); A.zerstoere(); Bf.zerstoere(); el.remove(); },
    figuren: [A, Bf], element: el,
  };
}
