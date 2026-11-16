// anatomie.js – „Atem“: gläserne Figur (Seite + Vorn, 0.1.5): Hülle aus Glas, Skelett-Andeutung, Lunge mit Lappen, Bronchialbaum, Zwerchfell, arbeitende Muskeln,
// Luftstrom nur zur aktuellen Phase (Stationen nacheinander) und Bewegungs-Pfeile nur zur aktuellen Phase.
// Schnittstelle KONZEPT §5. Werte: recherche-gesang.json → animation (cm am Ende des Einatmens, „Darstellung“ bis ×1,5 überhöht).
// Keine Bibliothek, keine Filter, keine Masken, ein SVG je Ansicht (einmal gebaut), je Bild nur geänderte Attribute. Glas = Verläufe + Transparenz.
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

// ---------------------------------------------------------------- Zeichnung (gläsern; Rig oben unverändert)
const S = 3;                                            // Einheiten je cm (Zeichnung in cm, Ursprung = Drosselgrube)
const r1 = (n) => Math.round(n * 10) / 10;
const q = (x, y) => `${r1(x * S)} ${r1(y * S)}`;
const sm = (t) => t * t * (3 - 2 * t);
// Catmull-Rom → Bézier (glatte Kurve durch Punkte). zu = geschlossen.
function kurve(p, zu = false, sp = 1) {
  const n = p.length; if (n < 2) return '';
  const g = (i) => (zu ? p[(i + n) % n] : p[cl(i, 0, n - 1)]);
  let d = `M${q(...p[0])}`;
  for (let i = 0; i < (zu ? n : n - 1); i++) {
    const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
    d += `C${q(b[0] + (c[0] - a[0]) / 6 * sp, b[1] + (c[1] - a[1]) / 6 * sp)} ${q(c[0] - (e[0] - b[0]) / 6 * sp, c[1] - (e[1] - b[1]) / 6 * sp)} ${q(...c)}`;
  }
  return zu ? d + 'Z' : d;
}
// Punkte entlang derselben Kurve (für Leitpunkt / Länge)
function proben(p, k = 10) {
  const n = p.length, g = (i) => p[cl(i, 0, n - 1)], out = [];
  for (let i = 0; i < n - 1; i++) {
    const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    for (let j = i ? 1 : 0; j <= k; j++) { const t = j / k, u = 1 - t; out.push([u * u * u * b[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * c[0], u * u * u * b[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * c[1]]); }
  }
  const L = [0]; for (let i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pkt: out, L, ges: L[L.length - 1] };
}
function punktBei(pr, f) { const z = cl(f, 0, 1) * pr.ges; let i = 1; while (i < pr.L.length - 1 && pr.L[i] < z) i++; const t = (z - pr.L[i - 1]) / ((pr.L[i] - pr.L[i - 1]) || 1); return [lerp(pr.pkt[i - 1][0], pr.pkt[i][0], t), lerp(pr.pkt[i - 1][1], pr.pkt[i][1], t)]; }
const spiegel = (p) => p.map(([x, y]) => [-x, y]);
const bz = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
const rot = (p, j, w) => { const co = Math.cos(w), si = Math.sin(w); return [j[0] + (p[0] - j[0]) * co - (p[1] - j[1]) * si, j[1] + (p[0] - j[0]) * si + (p[1] - j[1]) * co]; };
const C3 = (a, b, c, d) => `M${q(...a)}C${q(...b)} ${q(...c)} ${q(...d)}`;
// Bronchialbaum: feste Verzweigung (2 Kinder je Ast, ±Winkel, Länge × .66), deterministisch
function baum(start, w0, len, tiefe, spreiz, out, lvl = 0) {
  const ende = [start[0] + Math.cos(w0) * len, start[1] + Math.sin(w0) * len];
  (out[lvl] = out[lvl] || []).push([start, ende]);
  if (tiefe > 0) for (const s of [-1, 1]) baum(ende, w0 + s * spreiz, len * .66, tiefe - 1, spreiz * .92, out, lvl + 1);
  else (out.spitzen = out.spitzen || []).push(ende);
  return out;
}
const ast = (segs) => segs.map(([a, b]) => `M${q(...a)}L${q(...b)}`).join('');

// ---------------------------------------------------------------- Texte (Stationen)
const ST_NAME = { nase: 'Nase', mund: 'Mund', luftroehre: 'Luftröhre', bronchien: 'Bronchien', lunge: 'Lunge' };

// ---------------------------------------------------------------- Geometrie VORN (cm; x nach rechts im Bild, y nach unten)
const V = {
  box: [-32, -36.5, 64, 94],
  hull(g) {
    const sh = g.sh, b = g.ba * .22 + g.ri * .3;
    const H = [[0, -32.6], [4.7, -31.2], [7.2, -27], [7.7, -21.5], [7.0, -16.4], [5.3, -12.4], [3.3, -10.3], [3.9, -7.6], [4.6, -4.8 - sh * .3], [8.4, -2.8 - sh * .7],
      [13.4, -1.4 - sh], [17.4, -.2 - sh], [18.6, 2 - sh * .7], [17.3, 6.6 - sh * .2], [16.0, 11.5], [15.7 + g.ri * .5, 18], [15.0 + g.ri * .9, 25], [13.4 + b, 31], [12.8 + b, 35.6], [14.3, 41], [15.5, 47], [15.8, 57]];
    return kurve([...H, ...spiegel(H.slice(1)).reverse()], true);
  },
  arm: () => kurve([[16.9, .1], [19.6, .9], [21.6, 3.5], [22.4, 8], [22.6, 15], [22.4, 22], [22.1, 30], [21.8, 38], [21.6, 46], [21.5, 57], [18.4, 57], [18.3, 46], [18.0, 38], [17.6, 30], [17.0, 22], [16.4, 15], [16.0, 9], [16.2, 4]], true),
  dome(x, g) {   // Oberkante Zwerchfell bei x (cm)
    const kz = g.kz, P = [[-14.6 - g.ri * .8, 27.5], [-13.4 - g.ri * .6, 20.5 + kz * .45], [-10.6, 15.8 + kz * .9], [-7, 14.6 + kz], [-3.4, 15.7 + kz * .95], [0, 17.3 + kz * .7], [3.8, 16.5 + kz * .95], [7.6, 15.8 + kz], [11, 16.9 + kz * .9], [13.6 + g.ri * .6, 21.2 + kz * .45], [14.6 + g.ri * .8, 27.5]];
    if (x === undefined) return P;
    for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const t = (x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return lerp(P[i - 1][1], P[i][1], sm(cl(t, 0, 1))); }
    return P[P.length - 1][1];
  },
  geo(g) {
    const { kz, ri, bh, sh, sl } = g, a = sl * .5 + bh * .35, o = {};
    o.hull = V.hull(g);
    // Rippen
    const W = [7.2, 10.4, 12.6, 14.0, 14.8, 15.1, 15.1, 14.7, 14.0, 13.0], AX = [3.0, 4.0, 5.0, 6.0, 6.8, 7.6, 8.8, 11.0, 12.8, 13.8], AY = [2.2, 5.0, 7.8, 10.6, 13.4, 16.6, 21.6, 24.4, 26.8, 28.6];
    const SY = [1.6, 4.4, 7.4, 10.2, 12.8, 15.2, 17.2];
    let hint = '', vorn = '', knorpel = '', ia = '', ii = ''; const RV = [[], []];
    for (const s of [-1, 1]) {
      const c = s < 0 ? 0 : 1;
      for (let k = 0; k < 10; k++) {
        const yv = -1.2 + 2.5 * k, rk = ri * (.15 + .09 * k), lift = bh * (1 - k / 11) * .85;
        const L = [s * (W[k] + rk), yv + 3 + .3 * k - lift * .4], A = [s * (AX[k] + rk * .7), AY[k] - lift];
        hint += C3([s * 1.3, yv], [s * W[k] * .45, yv - 1.6], [s * (W[k] + rk) * .97, yv + .4 - lift * .4], L);
        const pv = [L, [s * (W[k] + rk) * 1.02, L[1] + 3.2], [A[0] + s * 2.6, A[1] + .4], A]; RV[c].push(pv);
        vorn += C3(...pv);
        if (k < 7) { const St = [s * 1.6, SY[k] - bh]; knorpel += `M${q(...A)}Q${q((A[0] + St[0]) / 2, Math.max(A[1], St[1]) + .5)} ${q(...St)}`; }
        else if (k < 9) { const J = k === 7 ? [s * 7.0, 21.0 - bh * .5] : [s * 9.8, 23.4 - bh * .4]; knorpel += `M${q(...A)}Q${q((A[0] + J[0]) / 2, A[1] - .2)} ${q(...J)}`; }
      }
      knorpel += kurve([[s * 1.4, 17.4 - bh], [s * 4.2, 19.3 - bh * .8], [s * 7.0, 21.0 - bh * .5], [s * 9.8, 23.4 - bh * .4], [s * (12.4 + ri * .9), 26.2]]);
      for (let k = 2; k < 9; k++) for (const t0 of [.25, .5]) { const t = t0 + (k % 2) * .08, p = bz(...RV[c][k], t), p2 = bz(...RV[c][k + 1], t - .06); ia += `M${q(...p)}L${q(...p2)}`; }
      for (let k = 1; k < 7; k++) { const p = bz(...RV[c][k], .93), p2 = bz(...RV[c][k + 1], .86); ii += `M${q(...p)}L${q(...p2)}`; }
    }
    o.rHint = hint; o.rVorn = vorn; o.knorpel = knorpel;
    // Schlüsselbeine + Brustbein + Schulter
    o.schl = [-1, 1].map((s) => kurve([[s * 1.6, .7 - bh], [s * 4.6, .9 - sl * .3 - bh * .7], [s * 8.6, -.2 - sl * .7], [s * 12.6, -1.2 - sl * .9 - sh * .5], [s * 15.4, -.9 - sl - sh * .7], [s * 17.4, -1.6 - Math.max(sh, sl) * .95]])).join('');
    o.brustbein = `translate(0 ${r1(-bh * S)})`;
    o.arm = `translate(0 ${r1(-sh * S)})`;
    // Lunge
    const D = (x) => V.dome(x, g);
    const luR = [[-3.8, -3.4 - a], [-6.6, -2.6 - a * .6], [-9.6, .4], [-12.2, 4.8], [-13.6 - ri * .35, 10.5], [-14.2 - ri * .6, 17], [-14.0 - ri * .8, 22 + kz * .5], [-13.3 - ri * .8, 25.4 + kz * .85],
      ...[-11.8, -9.6, -7, -4.4].map((x) => [x, D(x) - .5]), [-2.8, 15.2 + kz * .3], [-2.6, 10], [-2.2, 4], [-2.6, -.2]];
    const luL = [[3.8, -3.6 - a], [6.6, -2.8 - a * .6], [9.6, .2], [12.2, 4.6], [13.6 + ri * .35, 10.3], [14.2 + ri * .6, 17], [14.0 + ri * .8, 22.4 + kz * .5], [13.3 + ri * .8, 26 + kz * .85],
      ...[11.8, 9.8, 7.8].map((x) => [x, D(x) - .5]), [5.6, D(5.6) - .7], [4.0, 18.4 + kz * .6], [4.4, 16.2 + kz * .3], [6.6, 13.6 + kz * .2], [4.8, 10.6], [2.6, 8], [2.2, 3], [2.6, -.4]];
    o.lu1 = kurve(luR, true); o.lu2 = kurve(luL, true);
    o.spalt = kurve([[-2.8, 9.2], [-7, 8.8 - bh * .2], [-11, 9.4], [-13.7 - ri * .45, 10.4]]) + kurve([[-13.9 - ri * .55, 13.4], [-11.2, 15.6 + kz * .35], [-8.6, D(-8.6) - .6]])
      + kurve([[13.6 + ri * .4, 9.2], [11.2, 13.2 + kz * .2], [8.8, 16.4 + kz * .5], [6.8, D(6.8) - .7]]);
    o.dz = kurve(V.dome(undefined, g));
    o.herz = `translate(0 ${r1(kz * .55 * S)})`;
    const sx = 1 + ri / 15, sy = 1 + kz / 24;
    o.baum = `translate(0 ${r1(7.2 * S - bh * .3 * S)}) scale(${r1(sx * 100) / 100} ${r1(sy * 100) / 100}) translate(0 ${r1(-7.2 * S)})`;
    o.rohr = `translate(0 ${r1(-bh * .3 * S)})`;
    // Muskeln
    const m = {};
    m.zwischenrippen_aussen = () => ia; m.zwischenrippen_innen = () => ii;
    m.kopfwender = () => [-1, 1].map((s) => kurve([[s * 6.2, -14.6], [s * 5.0, -9.5], [s * 3.2, -4.4], [s * 1.6, .2 - bh]]) + kurve([[s * 6.0, -13.8], [s * 5.6, -8.6], [s * 4.8, -3.6], [s * 4.3, 0 - sl * .5]])).join('');
    m.treppenmuskeln = () => [-1, 1].map((s) => kurve([[s * 3.0, -10], [s * 4.0, -6], [s * 5.4, -2.6 - sh * .4], [s * 6.4, .6 - bh * .6]]) + kurve([[s * 3.4, -9.4], [s * 5.0, -5.4], [s * 6.6, -2.2 - sh * .4], [s * 7.8, .8 - bh * .5]])).join('');
    m.trapez_oben = () => [-1, 1].map((s) => kurve([[s * 4.4, -7], [s * 7.6, -3.4 - sh * .7], [s * 12.6, -1.6 - sh], [s * 16.6, -.6 - sh]]) + kurve([[s * 4.9, -5.6], [s * 8.4, -2.2 - sh * .6], [s * 13, -.6 - sh * .9]])).join('');
    m.brustmuskel_klein = () => [-1, 1].map((s) => [2, 3, 4].map((k) => { const p = bz(...RV[s < 0 ? 0 : 1][k], .82); return `M${q(s * 13.6, 2.4 - sh)}Q${q(s * 10.4, (2.4 - sh + p[1]) / 2 - 1)} ${q(...p)}`; }).join('')).join('');
    m.ruecken_breit = () => [-1, 1].map((s) => kurve([[s * 16.4, 9 - sh * .3], [s * (16.2 + ri * .4), 16], [s * (15.4 + ri * .6), 23], [s * 14.4, 30]]) + kurve([[s * 15.4, 11], [s * (15.0 + ri * .4), 18], [s * (14.2 + ri * .5), 25]])).join('');
    const bw = g.ba * .22;
    m.bauchmuskeln = () => [-1, 1].map((s) => kurve([[s * 1.0, 19.5], [s * 1.2, 30], [s * 1.2, 40], [s * 1.0, 50]]) + kurve([[s * (5.2 + bw * .4), 19.8], [s * (5.8 + bw * .6), 30], [s * (5.4 + bw * .5), 40], [s * 3.4, 50]])
      + [24.8, 30.2, 35.8].map((y) => `M${q(s * 1.2, y)}Q${q(s * 3.4, y - .7)} ${q(s * (5.6 + bw * .5), y - .2)}`).join('') + kurve([[s * (12.6 + ri * .5), 27], [s * (11.2 + bw), 34], [s * 8.4, 41], [s * 5.4, 46]])).join('');
    m.zwerchfell = () => o.dz;
    o.m = m;
    return o;
  },
};
// Luftweg VORN (Stationen); Punkte in cm, Pfade von außen nach innen
V.weg = {
  nase: [[[-1.0, -16.9], [-1.5, -18.6], [-1.0, -20.4], [-.2, -19.4], [-.1, -16], [0, -12.6], [0, -8.6]], [[1.0, -16.9], [1.5, -18.6], [1.0, -20.4], [.2, -19.4], [.1, -16], [0, -12.6], [0, -8.6]]],
  mund: [[[0, -14.2], [0, -12.6], [0, -10.6], [0, -8.6]]],
  luftroehre: [[[0, -8.6], [0, -3], [0, 2], [0, 7.2]]],
  bronchien: [[[0, 7.2], [-2.4, 9.0], [-3.6, 10.4]], [[-2.0, 8.7], [-4.6, 6.8], [-6.6, 4.2]], [[-3.6, 10.4], [-5.6, 11.8], [-7.6, 12.6]], [[-3.6, 10.4], [-4.8, 13.6], [-6.2, 16.2]],
    [[0, 7.2], [2.8, 8.6], [4.8, 10.2]], [[4.8, 10.2], [6.4, 8.2], [8.0, 5.4]], [[4.8, 10.2], [6.2, 13.6], [7.6, 16.4]]],
};
V.zweige = [[[-6.6, 4.2], -2.2], [[-7.6, 12.6], -2.9], [[-6.2, 16.2], 2.1], [[8.0, 5.4], -.95], [[7.6, 16.4], 1.05]];   // [Start, Richtung rad]
V.lab = [['nase', 1, -.2, -18.4], ['mund', 1, 0, -14.2], ['luftroehre', 1, .9, -3], ['bronchien', 1, 4.4, 9.8], ['lunge', 1, 10.6, 3],
  ['kopfwender', 0, -4.4, -7.2], ['treppenmuskeln', 1, 5.6, -3.4], ['trapez_oben', 0, -12.4, -1.8], ['brustmuskel_klein', 0, -10.4, 5.2], ['zwischenrippen_aussen', 1, 15.0, 20],
  ['zwischenrippen_innen', 0, -3.6, 13.6], ['zwerchfell', 0, -10.6, 16.2], ['ruecken_breit', 0, -15.6, 23], ['bauchmuskeln', 1, 4.6, 37]];
V.pf = [   // Bewegungs-Pfeile: [Name, Phase, Art-Gewicht-Schlüssel, Start (Anteil), Punkte]
  ['zw', 'ein', 'zw', 0, [[-7, 19.4], [-7, 25.4]]], ['zw2', 'ein', 'zw', 0, [[7.6, 20.4], [7.6, 26.4]]], ['zw', 'aus', 'zw', 0, [[-7, 25.4], [-7, 19.4]]], ['zw2', 'aus', 'zw', 0, [[7.6, 26.4], [7.6, 20.4]]],
  ['ri', 'ein', 'ri', .15, [[-16.4, 26.4], [-21.2, 26.4]]], ['ri2', 'ein', 'ri', .15, [[16.4, 26.4], [21.2, 26.4]]], ['ri', 'aus', 'ri', .1, [[-21.2, 26.4], [-16.4, 26.4]]], ['ri2', 'aus', 'ri', .1, [[21.2, 26.4], [16.4, 26.4]]],
  ['sh', 'ein', 'sh', .2, [[-16.2, -3.2], [-16.2, -9.2]]], ['sh2', 'ein', 'sh', .2, [[16.2, -3.2], [16.2, -9.2]]], ['sh', 'aus', 'sh', .05, [[-16.2, -9.2], [-16.2, -3.2]]], ['sh2', 'aus', 'sh', .05, [[16.2, -9.2], [16.2, -3.2]]]];

// ---------------------------------------------------------------- Geometrie SEITE (cm; x nach vorn = rechts im Bild)
const SJ = [[-7.4, -3.2], [-8.0, -1.3], [-8.6, .7], [-9.1, 2.8], [-9.5, 4.9], [-9.8, 7.1], [-10.0, 9.3], [-10.0, 11.6], [-9.9, 13.9], [-9.6, 16.3]];
const WSS = [[-5.0, -13.5], [-5.2, -11.8], [-5.5, -10.1], [-5.8, -8.4], [-6.2, -6.7], [-6.8, -5.0], ...SJ, [-9.2, 18.8], [-8.7, 21.4], [-8.1, 24.2], [-7.6, 27.1], [-7.3, 30.1], [-7.4, 33.2], [-8.0, 36.4]];
const SS = {
  box: [-34, -36.5, 64, 94],
  dome(x, g) {
    const kz = g.kz, P = [[-9.6 - g.fl * .4, 26.4], [-9.3 - g.fl * .4, 22.4 + kz * .4], [-7.2, 17.6 + kz * .8], [-4, 14.6 + kz * .95], [-1, 13.8 + kz], [1.4, 14.2 + kz * .95], [3.4, 15.6 + kz * .75], [4.8 + g.bv * .5, 19.4 - g.bh * .2]];
    if (x === undefined) return P;
    for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const t = (x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return lerp(P[i - 1][1], P[i][1], sm(cl(t, 0, 1))); }
    return P[P.length - 1][1];
  },
  geo(g) {
    const { kz, ri, bv, bh, ba, fl, sh, sl } = g, a = sl * .5 + bh * .35, o = {};
    o.hull = kurve([[-3, -32.4], [2.6, -31.2], [6.0, -27.6], [7.3, -23.4], [7.0, -21.6], [9.6, -18.4], [7.8, -16.9], [8.0, -15.7], [7.4, -14.7], [7.7, -13.8], [7.2, -11.6], [4.6, -9.9], [2.6, -8.6], [2.2, -4.4], [1.8 + bv * .2, -.4 - bh * .6],
      [4.4 + bv * .5, 3 - bh], [6.4 + bv, 9 - bh * .7], [7.0 + bv * .8, 15 - bh * .4], [6.5 + ba * .25, 21], [6.2 + ba * .6, 27], [6.9 + ba, 33], [7.2 + ba * .85, 39], [6.6 + ba * .45, 45], [5.9, 50], [5.6, 57],
      [-12.6, 57], [-13.4, 48], [-12.4, 41], [-10.8 - fl * .3, 34], [-11.9 - fl, 26], [-13.2 - fl * .6, 17], [-13.0, 8], [-11.2, 1], [-8.4, -4.6 - sh], [-7.6, -9], [-9.6, -15], [-10.4, -20.4], [-9.2, -26.6], [-6.6, -30.6]], true);
    o.arm = `translate(0 ${r1(-sh * S)})`;
    // Rippen (Pumpenschwengel: Drehung um das Wirbelgelenk)
    const St = [[1.6 + bv * .3, .5 - bh], [5.0 + bv, 17.4 - bh * .5]], sp = (t) => [lerp(St[0][0], St[1][0], t), lerp(St[0][1], St[1][1], t)];
    const bhA = bh / 3.4, riA = ri / 2.6;
    let hint = '', vorn = '', knorpel = '', ia = '', ii = ''; const R = [];
    for (let k = 0; k < 10; k++) {
      const J = SJ[k], w = -((5.5 - .45 * k) * bhA + (2 + .9 * k) * riA) * Math.PI / 180;
      const Sk = k < 7 ? sp([.03, .16, .3, .45, .6, .76, .93][k]) : [[4.6 + bv * .8, 19.6 - bh * .3], [4.0 + bv * .6, 21.8 - bh * .2], [3.0 + bv * .4, 23.8]][k - 7];
      const A0 = [Sk[0] - (k < 7 ? 2.0 + .25 * k : 1.4), Sk[1] + (k < 7 ? .9 + .1 * k : 1.0)];
      const pr = [J, [J[0] - 1.6, J[1] + 3.4 + .25 * k], [A0[0] - 7.5, A0[1] + 2.2], A0].map((p, i) => (i ? rot(p, J, w) : p));
      R.push(pr);
      hint += `M${q(...J)}Q${q(J[0] - 1.4, J[1] + 1.6)} ${q(...bz(...pr, .25))}`;
      vorn += C3(...pr);
      knorpel += `M${q(...pr[3])}Q${q((pr[3][0] + Sk[0]) / 2, Math.max(pr[3][1], Sk[1]) + .4)} ${q(...Sk)}`;
    }
    for (let k = 1; k < 9; k++) for (const t0 of [.42, .6, .78]) { const t = t0 + (k % 2) * .05, p = bz(...R[k], t), p2 = bz(...R[k + 1], t + .03); ia += `M${q(...p)}L${q(...p2)}`; }
    for (let k = 1; k < 8; k++) { const p = bz(...R[k], .9), p2 = bz(...R[k + 1], .82); ii += `M${q(...p)}L${q(...p2)}`; }
    o.rHint = hint; o.rVorn = vorn; o.knorpel = knorpel;
    o.brustbein = `M${q(...St[0])}L${q(...St[1])}`;
    o.schl = kurve([[1.8 + bv * .2, .1 - bh], [-.6, -.6 - sl * .6], [-3.0, -.4 - sl * .8 - sh * .4], [-4.8, -1 - Math.max(sh, sl) * .9]]);
    const D = (x) => SS.dome(x, g);
    o.lu1 = kurve([[-3.2, -3.6 - a], [.2, -1.4 - a * .6], [3.4 + bv * .5, 3 - bh * .6], [4.8 + bv * .8, 8 - bh * .5], [5.2 + bv * .8, 13 - bh * .3], [4.4 + bv * .6, D(4.4) - .4],
      ...[2.4, -.4, -3.6, -6.6].map((x) => [x, D(x) - .5]), [-9.0 - fl * .45, D(-9.0) + 1.2], [-10.3 - fl * .5, 24.6 + kz * .9], [-11.3 - fl * .4, 18], [-11.0 - fl * .2, 10], [-9.4, 3], [-6.6, -1.6]], true);
    o.spalt = kurve([[-9.4, 2], [-5.6, 7], [-2.4, 11.4], [.6, 15.4 + kz * .3], [2.6, D(2.6) - .6]]) + kurve([[-3.4, 10.0], [.4, 9.6 - bh * .3], [5.0 + bv * .8, 9.2 - bh * .45]]);
    o.dz = kurve(SS.dome(undefined, g)); o.crus = `M${q(-9.6 - fl * .4, 26.4)}Q${q(-8.4, 28.6)} ${q(-7.8, 31)}`;
    o.herz = `translate(${r1(bv * .3 * S)} ${r1(kz * .5 * S)})`;
    const sx = 1 + bv / 14, sy = 1 + kz / 22;
    o.baum = `translate(${r1(-1.6 * S)} ${r1(7.6 * S - bh * .3 * S)}) scale(${r1(sx * 100) / 100} ${r1(sy * 100) / 100}) translate(${r1(1.6 * S)} ${r1(-7.6 * S)})`;
    o.rohr = `translate(0 ${r1(-bh * .3 * S)})`;
    const m = {};
    m.zwischenrippen_aussen = () => ia; m.zwischenrippen_innen = () => ii;
    m.kopfwender = () => kurve([[-4.4, -16.2], [-2.6, -11], [-.4, -5.2], [1.6 + bv * .2, -.2 - bh * .8]]) + kurve([[-4.8, -15.4], [-3.4, -10.2], [-1.6, -4.4], [-.2, -.4 - sl * .6]]);
    m.treppenmuskeln = () => kurve([[-5.4, -11.8], [-4.8, -7.4], [-3.6, -3.4 - sh * .3], [-2.4, -.6 - bh * .6]]) + kurve([[-6.0, -10.6], [-5.6, -6.6], [-4.8, -2.8 - sh * .4], [-4.0, -.2 - bh * .5]]);
    m.trapez_oben = () => kurve([[-9.4, -15.4], [-8.4, -9.6], [-7.6, -5.2 - sh * .6], [-5.4, -1.6 - sh]]) + kurve([[-8.8, -14.2], [-7.6, -9], [-6.4, -4.8 - sh * .7], [-4.2, -1.2 - sh * .9]]);
    m.brustmuskel_klein = () => [2, 3, 4].map((k) => { const p = bz(...R[k], .86); return `M${q(.2, 2.6 - sh)}Q${q(1.6, (2.6 - sh + p[1]) / 2 - .6)} ${q(...p)}`; }).join('');
    m.ruecken_breit = () => kurve([[-3.6, 8.4 - sh * .4], [-7.6, 14], [-11.0 - fl * .7, 22], [-11.2 - fl * .4, 32]]) + kurve([[-4.2, 10.4 - sh * .3], [-7.8, 18], [-10.0 - fl * .5, 27], [-10.2 - fl * .3, 36]]);
    m.bauchmuskeln = () => kurve([[5.0 + bv * .5, 19.4], [5.0 + ba * .5, 26], [5.6 + ba * .9, 33], [5.8 + ba * .8, 39], [5.0 + ba * .4, 46], [4.4, 51]])
      + [25, 30.4, 36].map((y) => { const x = y < 28 ? 5.4 + ba * .55 : y < 33 ? 6.0 + ba * .9 : 6.2 + ba * .85; return `M${q(x - 1.6, y + .5)}L${q(x, y)}`; }).join('')
      + kurve([[2.6, 23], [3.4 + ba * .4, 30], [3.8 + ba * .6, 37], [3.2 + ba * .3, 44]]) + kurve([[-1.6, 25], [-.6 + ba * .2, 33], [.2 + ba * .3, 41]]);
    m.zwerchfell = () => o.dz;
    o.m = m;
    return o;
  },
};
SS.weg = {
  nase: [[[8.5, -17.2], [6.4, -18.5], [3.5, -19.1], [.2, -19.0], [-2.6, -17.8], [-3.4, -15], [-2.9, -11.9], [-.8, -9.6], [1.8, -8.6]]],
  mund: [[[7.6, -14.4], [4.8, -14.1], [1.2, -13.9], [-2.2, -13.2], [-2.9, -11.9], [-.8, -9.6], [1.8, -8.6]]],
  luftroehre: [[[1.8, -8.6], [1.7, -4], [.6, 1], [-.9, 6.0], [-1.6, 7.6]]],
  bronchien: [[[-1.6, 7.6], [-3.0, 9.6]], [[-3.0, 9.4], [-3.8, 7.6], [-5.0, 4.6]], [[-2.6, 9.8], [.4, 11.4], [2.8, 12.4]], [[-3.0, 9.6], [-4.6, 13.4], [-6.0, 17.2]]],
};
SS.zweige = [[[-5.0, 4.6], -1.95], [[2.8, 12.4], .35], [[-6.0, 17.2], 1.9], [[-3.8, 7.6], -2.7], [[-4.4, 12.6], 2.75]];
SS.lab = [['nase', 1, 7.4, -18.6], ['mund', 1, 7.6, -14.4], ['luftroehre', 1, 2.2, -5], ['bronchien', 1, 1.0, 11.0], ['lunge', 1, 4.0, 4.6],
  ['trapez_oben', 0, -8.6, -8], ['treppenmuskeln', 0, -5.4, -5.4], ['kopfwender', 1, -1.0, -8.2], ['brustmuskel_klein', 1, 2.4, 5.2], ['zwischenrippen_aussen', 1, 1.4, 16.6],
  ['zwischenrippen_innen', 1, 4.0, 19.6], ['zwerchfell', 0, -5.4, 16.0], ['ruecken_breit', 0, -10.8, 24], ['bauchmuskeln', 1, 6.4, 33]];
SS.pf = [
  ['zw', 'ein', 'zw', 0, [[-1.6, 18.0], [-1.6, 24.4]]], ['zw', 'aus', 'zw', 0, [[-1.6, 24.4], [-1.6, 18.0]]],
  ['ba', 'ein', 'ba', .15, [[9.6, 31], [14.6, 31]]], ['ba', 'aus', 'ba', .05, [[14.6, 31], [9.6, 31]]],
  ['ri', 'ein', 'fl', .2, [[-14.4, 20], [-18.6, 20]]], ['ri', 'aus', 'fl', .1, [[-18.6, 20], [-14.4, 20]]],
  ['bh', 'ein', 'bh', .05, [[9.0, 9.0], [11.4, 2.6]]], ['bh', 'aus', 'bh', 0, [[11.4, 2.6], [9.0, 9.0]]],
  ['sh', 'ein', 'sh', .2, [[-2.8, -2.6], [-2.8, -8.4]]], ['sh', 'aus', 'sh', .05, [[-2.8, -8.4], [-2.8, -2.6]]]];

// Mundformen je Weg (cm): Summen = Schallbögen, Lippen, Lippenflattern, Strohhalm
function mundformen(seite) {
  const bog = (x, y, d, h) => `M${q(x, y - h)}Q${q(x + d, y)} ${q(x, y + h)}`;
  const st = 'fill="none" stroke="#bfeaf3" stroke-width="1.3" stroke-linecap="round"';
  return seite
    ? `<g data-k="summen" opacity="0" ${st}>${[0, 1, 2].map((i) => bog(10.0 + 1.3 * i, -15.6, 1.2 + .4 * i, 1.4 + .9 * i)).join('')}</g>
<path data-k="lippen" opacity="0" d="M${q(7.0, -14.7)}Q${q(8.0, -14.9)} ${q(8.2, -14.3)}Q${q(7.9, -13.7)} ${q(7.0, -13.9)}Z" fill="#f0b8a8"/>
<path data-k="brr" opacity="0" d="M${q(9.2, -15.6)}l${q(.6, .5)}l${q(-.6, .5)}l${q(.6, .5)}l${q(-.6, .5)}M${q(10.4, -15.6)}l${q(.6, .5)}l${q(-.6, .5)}l${q(.6, .5)}l${q(-.6, .5)}" ${st}/>
<path data-k="halm" opacity="0" d="M${q(7.4, -14.3)}L${q(13.4, -13.5)}" fill="none" stroke="#e9eef7" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>`
    : `<g data-k="summen" opacity="0" ${st}>${[0, 1, 2].map((i) => bog(8.6 + 1.3 * i, -15.4, 1.2 + .4 * i, 1.4 + .9 * i) + bog(-8.6 - 1.3 * i, -15.4, -1.2 - .4 * i, 1.4 + .9 * i)).join('')}</g>
<path data-k="lippen" opacity="0" d="M${q(-1.8, -13.9)}Q${q(0, -14.7)} ${q(1.8, -13.9)}Q${q(0, -13.0)} ${q(-1.8, -13.9)}Z" fill="#f0b8a8"/>
<path data-k="brr" opacity="0" d="M${q(-3.6, -14.6)}l${q(-.5, .4)}l${q(.5, .4)}l${q(-.5, .4)}M${q(3.6, -14.6)}l${q(.5, .4)}l${q(-.5, .4)}l${q(.5, .4)}" ${st}/>
<circle data-k="halm" opacity="0" cx="0" cy="${r1(-13.9 * S)}" r="2.4" fill="none" stroke="#e9eef7" stroke-opacity=".85" stroke-width="1.4"/>`;
}

// ---------------------------------------------------------------- Farben
const LUNGE = { rosa: ['#ffe3e8', '#ec9fb1', '#a24f69', '#ffd1db'], blau: ['#d6f6ff', '#79cfe2', '#2f6f8a', '#bfeaf3'] };
const LUFT = { ein: '#c9f6ff', aus: '#ffd49e' };   // Einatmen kühl (wie Kreis), Ausatmen warm (wie Ausatem-Bogen)

function baue(ans, id, lungeFarbe) {
  const Gm = ans === 'seite' ? SS : V, seite = ans === 'seite';
  const L = LUNGE[lungeFarbe] || LUNGE.rosa;
  const g0 = { kz: 0, ri: 0, bv: 0, bh: 0, ba: 0, fl: 0, sh: 0, sl: 0 }, G = Gm.geo(g0);
  // Bronchialbaum (fest, wird als Gruppe mit der Lunge skaliert)
  const tr = {}; Gm.zweige.forEach(([p, w]) => baum(p, w, 2.0, 2, .5, tr));
  const sp = tr.spitzen || [];
  const wegP = (k) => (Gm.weg[k] || []).map((pp) => kurve(pp)).join('');
  const spitzenPfad = ast([...(tr[0] || []), ...(tr[1] || []), ...(tr[2] || [])]);
  // Stationen: Strom-Pfade (Punkt-Strich). Luftröhre/Nase/Mund in "rohr" (fest), Bronchien/Lunge im Baum (mitskaliert).
  const strom = (k, d, grp) => `<path data-k="s_${k}" d="${d}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0 6.6" opacity="0"/>`;
  const kopf = seite
    ? `<path d="${kurve([[7.0, -18.0], [4.6, -18.9], [1.4, -19.6], [-1.6, -19.2], [-2.8, -17.6], [-1.2, -16.7], [2.2, -17.0], [5.6, -16.9]], true)}" fill="#bfe3ff" fill-opacity=".07" stroke="#cfe9ff" stroke-opacity=".28" stroke-width=".6"/>
<path d="M${q(5.6, -18.2)}Q${q(2.4, -18.9)} ${q(-.4, -18.4)}M${q(5.2, -17.4)}Q${q(2.0, -17.9)} ${q(-.8, -17.5)}" fill="none" stroke="#cfe9ff" stroke-opacity=".22" stroke-width=".5" stroke-linecap="round"/>
<path d="${kurve([[6.6, -14.4], [3.4, -15.2], [-.2, -15.0], [-2.0, -13.6], [-.6, -12.4], [3.0, -12.6], [6.0, -13.2]], true)}" fill="#e7a3b5" fill-opacity=".08" stroke="#e7a3b5" stroke-opacity=".18" stroke-width=".5"/>
<path d="${kurve([[-3.2, -21.6], [-4.4, -22.4], [-5.2, -20.4], [-4.6, -18.2], [-3.4, -18.6]], true)}" fill="#bfe3ff" fill-opacity=".06" stroke="#cfe9ff" stroke-opacity=".3" stroke-width=".6"/>`
    : `<path d="M${q(0, -24)}L${q(0, -18.4)}M${q(-1.6, -17.2)}Q${q(0, -16.2)} ${q(1.6, -17.2)}" fill="none" stroke="#cfe9ff" stroke-opacity=".3" stroke-width=".6" stroke-linecap="round"/>
<path d="M${q(-2.2, -13.9)}Q${q(0, -13.2)} ${q(2.2, -13.9)}" fill="none" stroke="#cfe9ff" stroke-opacity=".25" stroke-width=".6" stroke-linecap="round"/>
<path d="${kurve([[-.2, -20.8], [-2.2, -20.2], [-2.4, -18.0], [-1.0, -17.4], [-.2, -18.4]], true)}${kurve([[.2, -20.8], [2.2, -20.2], [2.4, -18.0], [1.0, -17.4], [.2, -18.4]], true)}" fill="#bfe3ff" fill-opacity=".07" stroke="#cfe9ff" stroke-opacity=".22" stroke-width=".5"/>
<ellipse cx="${-7.9 * S}" cy="${-20.4 * S}" rx="${1.0 * S}" ry="${2.3 * S}" fill="#bfe3ff" fill-opacity=".05" stroke="#cfe9ff" stroke-opacity=".3" stroke-width=".6"/><ellipse cx="${7.9 * S}" cy="${-20.4 * S}" rx="${1.0 * S}" ry="${2.3 * S}" fill="#bfe3ff" fill-opacity=".05" stroke="#cfe9ff" stroke-opacity=".3" stroke-width=".6"/>`;
  // Wirbelsäule
  const ws = seite
    ? WSS.map(([x, y], i) => { const n = WSS[Math.min(i + 1, WSS.length - 1)], p = WSS[Math.max(i - 1, 0)], w = Math.atan2(n[1] - p[1], n[0] - p[0]) * 180 / Math.PI - 90, b = i < 6 ? 1.5 : i < 18 ? 2.0 : 2.5;
      return `<g transform="translate(${r1(x * S)} ${r1(y * S)}) rotate(${r1(w)})"><rect x="${r1(-b * S)}" y="${-2.6}" width="${r1(2 * b * S)}" height="${i < 6 ? 4.4 : 5.6}" rx="1.6"/><path d="M${r1(-b * S)} 0l${r1(-1.5 * S)} ${i < 18 ? 2 : .6}" fill="none" stroke-opacity=".55"/></g>`; }).join('')
    : Array.from({ length: 22 }, (_, i) => { const y = -12 + i * 2.55, b = i < 6 ? 1.2 : i < 18 ? 1.5 + i * .02 : 2.0; return `<rect x="${r1(-b * S)}" y="${r1(y * S)}" width="${r1(2 * b * S)}" height="${r1(2.0 * S)}" rx="1.6"${i < 9 ? ' opacity=".35"' : ''}/>`; }).join('');
  const mBasis = MUSKEL_IDS.slice(1).map((m) => `<path d="${G.m[m]()}"/>`).join('');   // blasse Grundlage: feste Ruhelage (keine Schreibzugriffe je Bild)
  const pfeile = Gm.pf.map(([k, ph, , , pts], i) => { const d = kurve(pts), e = pts[pts.length - 1], b = pts[pts.length - 2], w = Math.atan2(e[1] - b[1], e[0] - b[0]) * 180 / Math.PI;
    const kopf = `M-5.4 -5L.6 0L-5.4 5`, tf = `translate(${q(...e)}) rotate(${r1(w)})`;
    return `<g data-p="${i}" data-phase="${ph}" opacity="0"><path d="${d}" fill="none" stroke="#0d1218" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" stroke-dasharray="0 5" data-ph="${i}"/><path d="${kopf}" transform="${tf}" fill="none" stroke="#0d1218" stroke-opacity=".55" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${d}" fill="none" stroke="#fff6ec" stroke-width="2.9" stroke-linecap="round" stroke-dasharray="0 5" data-pd="${i}"/><path d="${kopf}" transform="${tf}" fill="none" stroke="#fff6ec" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g>`; }).join('');
  const labs = Gm.lab.map(([k]) => `<g data-l="${k}" opacity="0"><path fill="none" stroke-width=".9"/><circle r="1.9"/><text>${(KURZ[k] || [ST_NAME[k]]).map((t) => `<tspan>${t}</tspan>`).join('')}</text></g>`).join('');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('data-ansicht', ans);
  svg.innerHTML = `<defs>
<linearGradient id="${id}glas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fd4ff" stop-opacity=".2"/><stop offset=".22" stop-color="#7fb3e8" stop-opacity=".07"/><stop offset=".5" stop-color="#6e9fd6" stop-opacity=".035"/><stop offset=".8" stop-color="#7fb3e8" stop-opacity=".08"/><stop offset="1" stop-color="#9fd4ff" stop-opacity=".2"/></linearGradient>
<linearGradient id="${id}rand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f5ff" stop-opacity=".85"/><stop offset=".55" stop-color="#a8d4f5" stop-opacity=".45"/><stop offset="1" stop-color="#6d9cc8" stop-opacity=".25"/></linearGradient>
<radialGradient id="${id}lu" cx=".42" cy=".32" r=".8"><stop offset="0" stop-color="${L[0]}" stop-opacity=".8"/><stop offset=".5" stop-color="${L[1]}" stop-opacity=".58"/><stop offset="1" stop-color="${L[2]}" stop-opacity=".7"/></radialGradient>
<radialGradient id="${id}luft" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#f2fdff" stop-opacity=".9"/><stop offset=".6" stop-color="#9be6f6" stop-opacity=".45"/><stop offset="1" stop-color="#9be6f6" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}alv" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f4feff" stop-opacity=".95"/><stop offset="1" stop-color="#9be6f6" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}mus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a66"/><stop offset="1" stop-color="#e2463f"/></linearGradient>
<linearGradient id="${id}knochen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfd9ea"/><stop offset=".5" stop-color="#fbfcff"/><stop offset="1" stop-color="#cfd9ea"/></linearGradient>
<linearGradient id="${id}aus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--an-grund,#151c25)" stop-opacity="0"/><stop offset="1" style="stop-color:var(--an-grund,#151c25)"/></linearGradient>
<linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${L[1]}" stop-opacity=".85"/><stop data-k="f1" offset=".5" stop-color="${L[1]}" stop-opacity=".85"/><stop data-k="f2" offset=".5" stop-color="${L[1]}" stop-opacity=".12"/><stop offset="1" stop-color="${L[1]}" stop-opacity=".12"/></linearGradient>
${MUSKEL_IDS.map((m) => `<path id="${id}m${m}" d="${m === 'zwerchfell' ? G.dz : ''}"/>`).join('')}<path id="${id}pl1" data-k="lu1" d="${G.lu1}"/>${G.lu2 ? `<path id="${id}pl2" data-k="lu2" d="${G.lu2}"/>` : ''}</defs>
<g data-k="arm">${seite ? `<path d="${kurve([[-6.6, 1.4], [-2.6, -1.4], [1.0, 1.6], [1.2, 6.6], [-.6, 13], [-4.0, 15.2], [-7.0, 12], [-7.6, 6]], true)}" fill="url(#${id}glas)" stroke="url(#${id}rand)" stroke-width="1" stroke-opacity=".6"/>`
    : `<path d="${G.arm = V.arm()}" fill="url(#${id}glas)" stroke="url(#${id}rand)" stroke-width="1"/><path d="${kurve(spiegel([[16.9, .1], [19.6, .9], [21.6, 3.5], [22.4, 8], [22.6, 15], [22.4, 22], [22.1, 30], [21.8, 38], [21.6, 46], [21.5, 57], [18.4, 57], [18.3, 46], [18.0, 38], [17.6, 30], [17.0, 22], [16.4, 15], [16.0, 9], [16.2, 4]]), true)}" fill="url(#${id}glas)" stroke="url(#${id}rand)" stroke-width="1"/>`}</g>
<path data-k="hull" d="${G.hull}" fill="url(#${id}glas)" stroke="url(#${id}rand)" stroke-width="1.1"/>
<path d="${G.hull}" fill="none" stroke="#bfe3ff" stroke-opacity=".05" stroke-width="7"/>
<g fill="#e3ebf7" fill-opacity=".16" stroke="#e8eff9" stroke-opacity=".34" stroke-width=".7">${ws}</g>
${seite ? '' : `<path d="${kurve([[-13.4, 41], [-9, 39.4], [-5, 43], [-3.4, 47.6]])}${kurve([[13.4, 41], [9, 39.4], [5, 43], [3.4, 47.6]])}" fill="none" stroke="#e8eff9" stroke-opacity=".28" stroke-width="2.4" stroke-linecap="round"/>`}
${seite ? `<path d="${kurve([[-12.4, 40.6], [-8.6, 38.4], [-3.6, 40.4], [-.4, 44.6]])}" fill="none" stroke="#e8eff9" stroke-opacity=".26" stroke-width="2.4" stroke-linecap="round"/>` : ''}
<path data-k="rHint" d="${G.rHint}" fill="none" stroke="#e8eff9" stroke-opacity=".17" stroke-width="1.5" stroke-linecap="round"/>
${seite ? `<path data-k="crus" d="${G.crus}" fill="none" stroke="#d9707f" stroke-opacity=".3" stroke-width="2.4" stroke-linecap="round"/>` : ''}
<g data-k="herz" transform="${G.herz}"><path d="${seite ? kurve([[-.4, 8.6], [3.4, 8.2], [5.4, 11], [4.8, 14.6], [1.6, 16.2], [-1.6, 15.4], [-2.4, 12]], true) : kurve([[-3.2, 9.8], [.5, 8.4], [4.5, 9.2], [7.2, 12.6], [7.2, 16], [3.5, 18], [-1.6, 17.6], [-3.6, 14.5]], true)}" fill="#b04e6a" fill-opacity=".34" stroke="#e48aa3" stroke-opacity=".35" stroke-width=".7"/></g>
<g data-k="lungen" fill="url(#${id}lu)" stroke="${L[3]}" stroke-opacity=".55" stroke-width="1"><use href="#${id}pl1"/>${G.lu2 ? `<use href="#${id}pl2"/>` : ''}
<g data-k="luft" opacity=".3" fill="url(#${id}luft)" stroke="none"><use href="#${id}pl1"/>${G.lu2 ? `<use href="#${id}pl2"/>` : ''}</g>
<path data-k="spalt" d="${G.spalt}" fill="none" stroke="${L[2]}" stroke-opacity=".75" stroke-width="1.1" stroke-linecap="round"/></g>
<g data-k="rohr" transform="${G.rohr}">
<path d="${wegP('luftroehre')}" fill="none" stroke="#eaf3ff" stroke-opacity=".3" stroke-width="5.8" stroke-linecap="round"/>
<path d="${wegP('luftroehre')}" fill="none" stroke="#f4f9ff" stroke-opacity=".62" stroke-width="4.6" stroke-linecap="butt" stroke-dasharray="1.2 1.5"/>
<path d="${seite ? kurve([[.6, -11.6], [3.0, -11.0], [3.2, -8.8], [1.6, -7.6], [.4, -8.6]], true) : kurve([[-2.2, -10.4], [2.2, -10.4], [1.8, -8.2], [0, -7.4], [-1.8, -8.2]], true)}" fill="#eaf3ff" fill-opacity=".12" stroke="#eaf3ff" stroke-opacity=".4" stroke-width=".7"/>
<g data-k="sr" stroke="${LUFT.ein}">${strom('nase', wegP('nase'))}${seite ? '' : strom('nasL', kurve(Gm.weg.nase[0])) + strom('nasR', kurve(Gm.weg.nase[1]))}${strom('mund', wegP('mund'))}${strom('luftroehre', wegP('luftroehre'))}</g>
<circle data-k="kopf" r="2.2" fill="#ffffff" opacity="0"/></g>
<g data-k="baum" transform="${G.baum}">
<path d="${wegP('bronchien')}" fill="none" stroke="#eaf3ff" stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round"/>
<path d="${ast(tr[0] || [])}" fill="none" stroke="#eaf3ff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>
<path d="${ast([...(tr[1] || []), ...(tr[2] || [])])}" fill="none" stroke="#eaf3ff" stroke-opacity=".32" stroke-width=".9" stroke-linecap="round"/>
<g data-k="sb" stroke="${LUFT.ein}">${strom('bronchien', wegP('bronchien'))}${strom('lunge', spitzenPfad)}</g>
<g data-k="alv" opacity="0">${sp.map(([x, y]) => `<circle cx="${r1(x * S)}" cy="${r1(y * S)}" r="3.2" fill="url(#${id}alv)"/>`).join('')}</g></g>
<path data-k="knorpel" d="${G.knorpel}" fill="none" stroke="#bfe0ec" stroke-opacity=".38" stroke-width="1.5" stroke-linecap="round"/>
<path data-k="rVorn" d="${G.rVorn}" fill="none" stroke="#f3f7fd" stroke-opacity=".5" stroke-width="2.1" stroke-linecap="round"/>
${seite ? `<path data-k="brustbein" d="${G.brustbein}" fill="none" stroke="url(#${id}knochen)" stroke-opacity=".7" stroke-width="3.6" stroke-linecap="round"/>`
    : `<g data-k="brustbein" transform="${G.brustbein}"><path d="${kurve([[-2.2, .6], [2.2, .6], [1.6, 4.8], [1.6, 10], [1.7, 16.5], [0, 19.8], [-1.7, 16.5], [-1.6, 10], [-1.6, 4.8]], true, .5)}" fill="url(#${id}knochen)" fill-opacity=".42" stroke="#f3f7fd" stroke-opacity=".55" stroke-width=".7"/></g>`}
<path data-k="schl" d="${G.schl}" fill="none" stroke="url(#${id}knochen)" stroke-opacity=".8" stroke-width="2.8" stroke-linecap="round"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<use data-k="zwB" href="#${id}mzwerchfell" stroke="#d9707f" stroke-opacity=".38" stroke-width="3.4"/>
<g stroke="#e0a9b4" stroke-opacity=".13" stroke-width="1.6">${mBasis}</g>
${MUSKEL_IDS.map((m) => `<g data-m="${m}" opacity="0"><use href="#${id}m${m}" stroke="#ff7a59" stroke-opacity=".22" stroke-width="${m === 'zwerchfell' ? 12 : 9}"/><use href="#${id}m${m}" stroke="url(#${id}mus)" stroke-opacity=".85" stroke-width="${m === 'zwerchfell' ? 4.4 : 3.2}"/><use href="#${id}m${m}" stroke="#ffe0d6" stroke-opacity=".75" stroke-width="1"/></g>`).join('')}</g>
<path d="${seite ? kurve([[4.0, -29.4], [5.6, -26.2], [6.2, -23.4]]) + kurve([[5.6, 4.4], [6.4, 9.6], [6.6, 14]]) : kurve([[-5.6, -28.4], [-6.6, -24.6], [-6.8, -21.2]]) + kurve([[-12.6, 1.2], [-15.6, 4.8], [-15.0, 12]])}" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="1.6" stroke-linecap="round"/>
${kopf}
<rect x="${Gm.box[0] * S * 1.6}" y="${46 * S}" width="${Gm.box[2] * S * 1.6}" height="${12 * S}" fill="url(#${id}aus)"/>
${pfeile}
${mundformen(seite)}
<g class="an-lab">${labs}</g>
<g class="an-info" opacity="0" data-k="hinweis"><text data-k="hw"><tspan>Lunge: Richtwert,</tspan><tspan>nicht deine Messung</tspan></text></g>
<g class="an-info" opacity="0" data-k="lern"><text data-k="lw"><tspan>Ausatmen geschieht</tspan><tspan>von selbst.</tspan></text></g>
<g class="an-hit" fill="none" stroke="#000" stroke-opacity="0" stroke-width="16" stroke-linecap="round">${MUSKEL_IDS.map((m) => `<path data-m="${m}" d="${G.m[m]()}"/>`).join('')}</g>
<text data-k="liter" class="an-liter" text-anchor="middle" x="${seite ? -3 * S : 0}" y="${54 * S}" opacity="0"></text>`;
  const qs = (k) => svg.querySelector(`[data-k="${k}"]`);
  const el = {};
  for (const k of ['crus', 'arm', 'rHint', 'rVorn', 'knorpel', 'brustbein', 'schl', 'herz', 'lungen', 'luft', 'spalt', 'rohr', 'baum', 'kopf', 'alv', 'liter']) el[k] = qs(k);
  for (const k of ['hull', 'lu1', 'lu2', 'la1', 'la2', 'zwB']) el[k] = qs(k);
  for (const k of ['nase', 'nasL', 'nasR', 'mund', 'luftroehre', 'bronchien', 'lunge']) el['s_' + k] = qs('s_' + k);
  for (const k of ['f1', 'f2', 'summen', 'lippen', 'brr', 'halm', 'hinweis', 'lern', 'hw', 'lw']) el[k] = qs(k);
  for (const m of MUSKEL_IDS) { el['M' + m] = svg.querySelector(`g[data-m="${m}"]`); el['A' + m] = m === 'zwerchfell' ? [] : [svg.querySelector(`[id="${id}m${m}"]`)]; }
  el.zwP = svg.querySelector(`[id="${id}mzwerchfell"]`); el.sr = qs('sr'); el.sb = qs('sb');
  el.pf = Gm.pf.map(([k, ph, gw, st, pts], i) => ({ k, ph, gw, st, g: svg.querySelector(`g[data-p="${i}"]`), d: svg.querySelector(`[data-pd="${i}"]`), h: svg.querySelector(`[data-ph="${i}"]`) }));
  el.lab = Gm.lab.map(([k, s, x, y]) => ({ k, s, x, y, g: svg.querySelector(`g[data-l="${k}"]`), n: (KURZ[k] || [1]).length, w: Math.max(...(KURZ[k] || [ST_NAME[k]]).map((t) => t.length)) }));
  // Leitpunkt-Wege (cm-Proben): Nase/Mund → Luftröhre
  el.leit = { nase: proben([...Gm.weg.nase[0], ...Gm.weg.luftroehre[0].slice(1)]), mund: proben([...Gm.weg.mund[0], ...Gm.weg.luftroehre[0].slice(1)]) };
  el.leit.nasL = el.leit.nase; if (Gm.weg.nase[1]) el.leit.nasR = proben([...Gm.weg.nase[1], ...Gm.weg.luftroehre[0].slice(1)]);
  return { svg, el, Gm, ans, id };
}

// ---------------------------------------------------------------- Stil (einmal je Dokument; CSP erlaubt 'unsafe-inline' für style)
function stil() {
  if (document.getElementById('an-stil-015')) return;   // eigene Kennung: nie mit dem Stil einer älteren Figur mischen
  const s = document.createElement('style'); s.id = 'an-stil-015';
  s.textContent = `.an-figur{position:relative;width:100%;height:100%;min-height:60px;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;background:radial-gradient(ellipse 62% 50% at 50% 40%,rgba(130,180,240,.075),transparent 72%)}
.an-figur svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible}
.an-figur text{fill:var(--text,#e3e9f4);paint-order:stroke;stroke:var(--an-grund,#121a28);stroke-linejoin:round;font-family:inherit;font-weight:500}
.an-lab path{stroke:#f0907f;stroke-opacity:.8}.an-lab circle{fill:#f0907f}.an-lab g[data-st] path{stroke:#9be6f6}.an-lab g[data-st] circle{fill:#9be6f6}.an-lab g[data-st] text{fill:#d9f7ff}
.an-figur .an-liter{font-weight:600;fill:#eafaff}.an-figur .an-info text{fill:var(--leise,#9aa6bf)}
.an-hit path{pointer-events:none}.an-namen .an-hit path{pointer-events:stroke;cursor:pointer}
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

// ---------------------------------------------------------------- Figur (gläsern, 0.1.5). Schnittstelle wie bisher (KONZEPT §5).
let nr = 0;
let mqR = null; const reduziert = () => { try { mqR = mqR || matchMedia('(prefers-reduced-motion: reduce)'); return mqR.matches; } catch { return false; } };
const STR = ['nase', 'nasL', 'nasR', 'mund', 'luftroehre', 'bronchien', 'lunge'];
export function erzeugeAnatomie(host, o = {}) {
  stil();
  const id = `an${++nr}-`, box = document.createElement('div');
  box.className = 'an-figur'; box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Figur: Atmung');
  const VV = { seite: baue('seite', id + 's', o.lunge), vorn: baue('vorn', id + 'v', o.lunge) };
  box.append(VV.seite.svg, VV.vorn.svg); host.append(box);
  let ans = o.ansicht === 'vorn' ? 'vorn' : 'seite', mod = o.modus === 'gross' ? 'gross' : 'klein', nam = !!o.namen, B = 0, H = 0, letztes = null;
  const Z = { t: 0, v: 0, dv: 0, phase: '', art: '', weg: '', wans: '', off: 0, offP: 0, op: Object.fromEntries(MUSKEL_IDS.map((m) => [m, 0])), stoss0: -1e9, lern: 0, lernFertig: false, sichtSet: '', schreib: 0, c: null, gkey: '', G: null, so: {} };
  const put = (e, a, val) => { if (!e) return; const k = '_' + a; if (e[k] === val) return; e[k] = val; e.setAttribute(a, val); Z.schreib++; };
  const info = (m) => { const M = o.daten && o.daten.MUSKELN, d = Array.isArray(M) ? M.find((x) => x.id === m) : M && M[m]; return { id: m, name_ui: d ? d.name_ui : KURZ[m].join(' '), rolle: d ? d.rolle : ROLLE[m] }; };
  for (const v of Object.values(VV)) v.el.lab.forEach((l) => { if (!KURZ[l.k]) l.g.setAttribute('data-st', ''); });
  function layout() {
    if (!B || !H) return;
    const fs = mod === 'gross' ? 13 : 12.5;   // gerendert ≥ 12 px (Prüfung 15:57)
    for (const v of Object.values(VV)) {
      const [x0, y0, w0, h0] = v.Gm.box, s = Math.min(B / (w0 * S), H / (h0 * S)), vw = B / s, vh = H / s, cx = (x0 + w0 / 2) * S, cy = (y0 + h0 / 2) * S;
      v.svg.setAttribute('viewBox', `${r1(cx - vw / 2)} ${r1(cy - vh / 2)} ${r1(vw)} ${r1(vh)}`);
      v.vb = [cx - vw / 2, cy - vh / 2, vw, vh]; v.fu = fs / s; v.s = s;
      const lab = v.svg.querySelector('.an-lab'); lab.setAttribute('font-size', r1(v.fu)); lab.setAttribute('stroke-width', r1(3 / s));
      v.el.liter.setAttribute('font-size', r1(v.fu * 1.05));
      for (const k of ['hw', 'lw']) { const t = v.el[k], yy = v.vb[1] + vh - v.fu * (k === 'hw' ? 1.6 : 4.4); t.setAttribute('font-size', r1(v.fu)); t.setAttribute('stroke-width', r1(3 / s)); [...t.children].forEach((sp, j) => { sp.setAttribute('x', r1(v.vb[0] + 4 / s)); sp.setAttribute('y', r1(yy + j * v.fu * 1.1)); }); }
    }
    Z.sichtSet = ''; if (letztes) setze(letztes, true);
  }
  function stapel(v, sicht) {   // Beschriftung: sichtbare je Seite nach y sortiert, ohne Überlappung (groß: unten links Platz für den Hinweis)
    const [vx, vy, vw, vh] = v.vb, fu = v.fu;
    for (const seite of [0, 1]) {
      const L = v.el.lab.filter((l) => l.s === seite && sicht.has(l.k)).sort((a, b) => a.y - b.y);
      let y = vy + fu * 1.4 + (seite ? 46 / v.s : 0); const ys = [];   // rechts oben/unten liegen Knöpfe der Karte (Vorne/Seite, Vorschau): 46 px frei
      for (const l of L) { y = Math.max(y, l.y * S - (l.n - 1) * fu * .55); ys.push(y); y += l.n * fu * 1.15 + fu * .5; }
      let lim = vy + vh - (seite ? 46 / v.s : fu * (mod === 'gross' ? 5.6 : .6)); for (let i = L.length - 1; i >= 0; i--) { ys[i] = Math.min(ys[i], lim - (L[i].n - 1) * fu * 1.15); lim = ys[i] - fu * 1.15 - fu * .5 + fu * .2; }
      L.forEach((l, i) => {
        const x = seite ? vx + vw - 4 / v.s : vx + 4 / v.s, t = l.g.querySelector('text'), w = l.w * fu * .56;
        t.setAttribute('text-anchor', seite ? 'end' : 'start');
        [...t.children].forEach((sp, j) => { sp.setAttribute('x', r1(x)); sp.setAttribute('y', r1(ys[i] + j * fu * 1.15)); });
        const lx = seite ? x - w - 3 / v.s : x + w + 3 / v.s, ly = ys[i] - fu * .35;
        l.g.querySelector('path').setAttribute('d', `M${r1(lx)} ${r1(ly)}L${r1(lx + (seite ? -5 : 5) / v.s)} ${r1(ly)}L${r1(l.x * S)} ${r1(l.y * S)}`);
        const c = l.g.querySelector('circle'); c.setAttribute('cx', r1(l.x * S)); c.setAttribute('cy', r1(l.y * S));
      });
    }
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver((es) => { const c = es[es.length - 1].contentRect; B = c.width; H = c.height; layout(); }) : null;
  if (ro) ro.observe(box); else { B = host.clientWidth; H = host.clientHeight; }
  const zeige = () => { VV.seite.svg.style.display = ans === 'seite' ? '' : 'none'; VV.vorn.svg.style.display = ans === 'vorn' ? '' : 'none'; box.classList.toggle('an-namen', nam); Z.sichtSet = ''; };
  zeige();
  box.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-m],[data-l]'); if (!nam || !t) return; const m = t.getAttribute('data-m') || t.getAttribute('data-l'); if (!KURZ[m]) return; if (o.beimMuskel) o.beimMuskel(m, info(m)); box.dispatchEvent(new CustomEvent('anatomie-muskel', { bubbles: true, detail: info(m) })); });

  function setze(z = {}, nurNeu = false) {
    letztes = z;
    const t = z.zeit ?? performance.now();
    const erst = !Z.t; let dt = Z.t ? t - Z.t : 16; if (nurNeu) dt = 0; else { if (dt < 0 || dt > 250) dt = 16; Z.t = t; }
    const art = artAus(z.art), tiefe = cl(z.tiefe ?? TIEFE_STD[art], 0, 1), phase = z.phase || 'ruhe', p = cl(+z.anteil || 0, 0, 1);
    const v = cl(+z.v || 0, -1, 1.2), ruhig = !!(z.ruhig ?? o.ruhig ?? reduziert()), weg = z.weg || 'nase', mund = MUNDWEGE.has(weg);
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
    const W = VV[ans], E = W.el, k = 1.5;
    // ruhig (Einstellung oder „Bewegung reduzieren“): Form bleibt, nur Füllstand und Deckkraft ändern sich
    const g = ruhig ? { kz: 0, ri: 0, bv: 0, bh: 0, ba: 0, fl: 0, sh: 0, sl: 0 } : { kz: -c.kz * 1.1, ri: c.ri * k, bv: c.bv * k, bh: c.bh * k, ba: c.ba * 1.2, fl: c.fl * k, sh: c.sh * k, sl: c.sl * k };
    const gkey = ans + Math.round(g.kz * 50) + ',' + Math.round(g.ri * 50) + ',' + Math.round(g.bv * 50) + ',' + Math.round(g.bh * 50) + ',' + Math.round(g.ba * 50) + ',' + Math.round(g.fl * 50) + ',' + Math.round(g.sh * 50) + ',' + Math.round(g.sl * 50);
    let G = Z.G;
    if (gkey !== Z.gkey) {   // Form nur neu rechnen, wenn sie sich sichtbar ändert (Halten, ruhig: keine Arbeit)
      Z.gkey = gkey; G = Z.G = W.Gm.geo(g); G.mc = {};
      put(E.hull, 'd', G.hull); put(E.rHint, 'd', G.rHint); put(E.rVorn, 'd', G.rVorn); put(E.knorpel, 'd', G.knorpel); put(E.schl, 'd', G.schl);
      put(E.brustbein, ans === 'seite' ? 'd' : 'transform', G.brustbein); put(E.arm, 'transform', G.arm); put(E.herz, 'transform', G.herz);
      if (E.crus) put(E.crus, 'd', G.crus);
      put(E.lu1, 'd', G.lu1); if (E.lu2) put(E.lu2, 'd', G.lu2); put(E.zwP, 'd', G.dz); put(E.spalt, 'd', G.spalt); put(E.baum, 'transform', G.baum); put(E.rohr, 'transform', G.rohr);
    }
    const fL = cl((c.liter - 2.4) / 3.1, 0, 1);   // Füllstand: sichtbarer Bereich 2,4–5,5 L
    const fu = ruhig ? `url(#${W.id}f)` : `url(#${W.id}lu)`; put(E.lungen, 'fill', fu);
    if (ruhig) { const of = r1(fL * 100) / 100; put(E.f1, 'offset', of); put(E.f2, 'offset', of); }
    put(E.luft, 'opacity', ruhig ? 0 : Math.round((.12 + .7 * fL) * 50) / 50);
    for (const m of MUSKEL_IDS) { const op = r1(Z.op[m] * 100) / 100; put(E['M' + m], 'opacity', op); if (op > 0 && E['A' + m].length) { const d = G.mc[m] || (G.mc[m] = G.m[m]()); put(E['A' + m][0], 'd', d); } }   // Muskelform nur schreiben, wenn sichtbar
    // Mundformen je Weg (Summen, Lippen, Lippenflattern, Strohhalm)
    if (weg !== Z.weg || ans !== Z.wans) {
      Z.weg = weg; Z.wans = ans;
      put(E.summen, 'opacity', weg === 'summen' ? 1 : 0); put(E.lippen, 'opacity', mund ? .9 : 0); put(E.brr, 'opacity', weg === 'brr' ? 1 : 0); put(E.halm, 'opacity', weg === 'strohhalm' ? 1 : 0);
    }
    // ---- Strom: nur die aktuelle Phase, Stationen nacheinander (Wechselatmung vorn: nur das eine Nasenloch)
    const ein = phase === 'ein' || phase === 'ein2', aus = phase === 'aus' || phase === 'stoss_aus', fl = ein || aus;
    const nk = mund ? 'mund' : ans === 'vorn' && weg === 'links' ? 'nasL' : ans === 'vorn' && weg === 'rechts' ? 'nasR' : 'nase';
    const reihe = ein ? [nk, 'luftroehre', 'bronchien', 'lunge'] : ['lunge', 'bronchien', 'luftroehre', nk];
    const front = fl ? cl(p / .5, 0, 1) : 0, schluss = fl ? 1 - cl((p - .9) / .1, 0, 1) : 0;
    const farbe = ein ? LUFT.ein : LUFT.aus;
    if (!ruhig && fl) { Z.off += (ein ? -1 : 1) * (10 + 70 * Math.abs(Z.dv)) * dt / 1000; Z.off %= 660; }
    const sichtbar = new Set();
    for (const s of STR) {
      const e = E['s_' + s]; if (!e) continue;
      const i = reihe.indexOf(s); let op = 0;
      if (fl && i >= 0) op = cl((front - i / 4) / .1, 0, 1) * schluss;
      op = r1(op * 100) / 100; put(e, 'opacity', op); Z.so[s] = op;
      if (op > 0) sichtbar.add(s === 'nasL' || s === 'nasR' ? 'nase' : s);
    }
    Z.so.nase = Math.max(Z.so.nase || 0, Z.so.nasL || 0, Z.so.nasR || 0);
    const ov = r1(Z.off);   // Farbe + Versatz an der Gruppe (vererbt)
    if (sichtbar.has('nase') || sichtbar.has('mund') || sichtbar.has('luftroehre')) { put(E.sr, 'stroke', farbe); put(E.sr, 'stroke-dashoffset', ov); }
    if (sichtbar.has('bronchien') || sichtbar.has('lunge')) { put(E.sb, 'stroke', farbe); put(E.sb, 'stroke-dashoffset', ov); }
    // Leitpunkt (Kopf des Stroms) bis zur Gabelung
    const leit = E.leit[nk] || E.leit.nase;
    if (fl && !ruhig && front < 1) { const f = ein ? cl(front * 2, 0, 1) : 1 - cl((front - .5) * 2, 0, 1), pt = punktBei(leit, f), vis = ein ? front < .5 : front > .5;
      put(E.kopf, 'opacity', vis ? .95 * schluss : 0); put(E.kopf, 'cx', r1(pt[0] * S)); put(E.kopf, 'cy', r1(pt[1] * S)); put(E.kopf, 'fill', farbe); }
    else put(E.kopf, 'opacity', 0);
    put(E.alv, 'opacity', r1((ein ? cl((front - .75) / .25, 0, 1) * (.35 + .65 * fL) * schluss : aus ? cl(1 - front * 3, 0, 1) * fL * schluss : 0) * 100) / 100);
    // ---- Bewegungs-Pfeile: nur Bewegungen der aktuellen Phase, nacheinander; nie Gegenpfeile
    const gk = art + tiefe; if (Z.gk !== gk) { const e0 = koerper({ art, tiefe, phase: 'ein', anteil: 1, v: 1 }); Z.gk = gk; Z.gw = { zw: -e0.kz > 1.5, ba: e0.ba > .8, ri: e0.ri > .45, fl: e0.fl > .45, bh: e0.bh > .6, sh: e0.sh > .8 }; }
    const gw = Z.gw;
    if (!ruhig) { Z.offP += 12 * dt / 1000; Z.offP %= 50; }
    for (const P of E.pf) {
      const an = !ruhig && P.ph === (ein ? 'ein' : aus ? 'aus' : '-') && gw[P.gw], op = an ? cl((p - P.st) / .08, 0, 1) * (1 - cl((p - .88) / .12, 0, 1)) : 0;
      put(P.g, 'opacity', r1(op * 100) / 100); if (op > 0) put(P.g, 'stroke-dashoffset', r1(-Z.offP));
    }
    // ---- Beschriftung: arbeitende Muskeln + erreichte Stationen (Namen-Modus: alle Muskeln blass)
    for (const m of MUSKEL_IDS) if (nam || Z.op[m] > .12) sichtbar.add(m);
    const key = [...sichtbar].sort().join(',') + ans;
    if (key !== Z.sichtSet) { Z.sichtSet = key; stapel(W, sichtbar); }
    for (const l of E.lab) { const mu = !!KURZ[l.k], sOp = mu ? cl(Z.op[l.k] / .3, 0, 1) : Z.so[l.k] || 0; put(l.g, 'opacity', r1((sichtbar.has(l.k) ? (mu && nam ? .45 + .55 * sOp : sOp) : 0) * 100) / 100); }
    // Liter, Hinweis, Lernsatz (nur groß)
    const gr = mod === 'gross'; put(E.liter, 'opacity', gr ? 1 : 0); put(E.hinweis, 'opacity', gr ? 1 : 0);
    if (gr) { const txt = `≈ ${c.liter.toFixed(1).replace('.', ',')} L`; if (E.liter.textContent !== txt) { E.liter.textContent = txt; Z.schreib++; } }
    put(E.lern, 'opacity', gr && Z.lern ? 1 : 0);
  }
  return {
    setze,
    ansicht(a) { ans = a === 'vorn' ? 'vorn' : 'seite'; Z.gkey = ''; Z.weg = ''; zeige(); if (letztes) setze(letztes, true); },
    modus(m) { mod = m === 'gross' ? 'gross' : 'klein'; layout(); },
    namen(b) { nam = !!b; zeige(); if (letztes) setze(letztes, true); },
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
