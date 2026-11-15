// Bildwerk – Zuschnitt, Drehen, Spiegeln, Ränder, Einrasten. Signaturen FEST (ARCH.md §4.5).
// erkenneRaender / rasterEinrasten / geometrieMatrix / Umrechnungen sind rein (Worker-tauglich, kein DOM).
//
// Geometrie-Festlegung (Klarstellung zu ARCH §3.1, siehe LOG): Rahmen F = Quelle nach Spiegeln (am Schirm) und
// Vierteldrehung (viertel·90° im Uhrzeigersinn); `drehung` (Grad, + = Uhrzeigersinn) dreht den Inhalt um die
// Rahmenmitte; `zuschnitt` ist normiert auf F. Bei viertel 0 ohne Spiegeln ist F = Quelle.
// Matrizen: 3×3, spaltenweise (wie GLSL mat3), Abbildung Ausgabe normiert (0..1) → Quelle normiert.

export const VERHAELTNISSE = Object.freeze([
  { id: 'frei', titel: 'Frei', wert: null }, { id: 'original', titel: 'Original', wert: 'original' },
  { id: '1:1', titel: '1:1', wert: 1 }, { id: '4:5', titel: '4:5', wert: 4 / 5 }, { id: '3:2', titel: '3:2', wert: 3 / 2 },
  { id: '16:9', titel: '16:9', wert: 16 / 9 }, { id: '9:16', titel: '9:16', wert: 9 / 16 },
]);
const STANDARD_VERH = [1, 5 / 4, 4 / 5, 4 / 3, 3 / 4, 3 / 2, 2 / 3, 16 / 9, 9 / 16, 2, 1 / 2];

// ---------- 3×3-Mathe (spaltenweise) ----------
export function mal3(a, b) {
  const o = new Float32Array(9);
  for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];
  return o;
}
export function invers3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;   // Spalten: (a,b,c), (d,e,f), (g,h,i)
  const D = a * (e * i - f * h) - d * (b * i - c * h) + g * (b * f - c * e);
  const k = 1 / (D || 1e-12);
  return new Float32Array([
    (e * i - f * h) * k, (c * h - b * i) * k, (b * f - c * e) * k,
    (f * g - d * i) * k, (a * i - c * g) * k, (c * d - a * f) * k,
    (d * h - e * g) * k, (b * g - a * h) * k, (a * e - b * d) * k,
  ]);
}
const affin = (sx, sy, tx, ty) => new Float32Array([sx, 0, 0, 0, sy, 0, tx, ty, 1]);
const dreh = (rad) => { const c = Math.cos(rad), s = Math.sin(rad); return new Float32Array([c, s, 0, -s, c, 0, 0, 0, 1]); };
export const wende = (m, x, y) => [m[0] * x + m[3] * y + m[6], m[1] * x + m[4] * y + m[7]];

/** Rahmengröße nach Vierteldrehung. */
export function rahmen(g, qB, qH) { const v = (((g.viertel || 0) % 4) + 4) % 4; return v % 2 ? { b: qH, h: qB, v } : { b: qB, h: qH, v }; }

/** Rahmen-Pixel → Quell-Pixel (ohne freie Drehung). */
function rahmenZuQuelle(g, qB, qH) {
  const { b: FB, h: FH, v } = rahmen(g, qB, qH);
  let m = affin(1, 1, 0, 0);
  // erst Spiegeln im Rahmen rückgängig, dann Vierteldrehung rückgängig
  const sp = affin(g.spiegelnH ? -1 : 1, g.spiegelnV ? -1 : 1, g.spiegelnH ? FB : 0, g.spiegelnV ? FH : 0);
  let vq;   // Rahmen (fx,fy) → Quelle (sx,sy)
  if (v === 0) vq = affin(1, 1, 0, 0);
  else if (v === 1) vq = new Float32Array([0, -1, 0, 1, 0, 0, 0, qH, 1]);        // sx = fy, sy = qH - fx
  else if (v === 2) vq = new Float32Array([-1, 0, 0, 0, -1, 0, qB, qH, 1]);
  else vq = new Float32Array([0, 1, 0, -1, 0, 0, qB, 0, 1]);                     // sx = qB - fy, sy = fx
  m = mal3(vq, sp);
  return m;
}

/** @returns {{matrix:Float32Array, ausgabeB:number, ausgabeH:number}} Ausgabe normiert → Quelle normiert */
export function geometrieMatrix(g, quelleB, quelleH) {
  const { b: FB, h: FH } = rahmen(g, quelleB, quelleH);
  const z = g.zuschnitt || { x: 0, y: 0, b: 1, h: 1 };
  const ausgabeB = Math.max(1, Math.round(z.b * FB)), ausgabeH = Math.max(1, Math.round(z.h * FH));
  const m1 = affin(z.b * FB, z.h * FH, z.x * FB, z.y * FH);                   // Ausgabe norm → Rahmen px
  const rad = -((g.drehung || 0) * Math.PI) / 180;                              // abtasten = rückwärts drehen
  const m2 = mal3(affin(1, 1, FB / 2, FH / 2), mal3(dreh(rad), affin(1, 1, -FB / 2, -FH / 2)));
  const m3 = rahmenZuQuelle(g, quelleB, quelleH);
  const m4 = affin(1 / quelleB, 1 / quelleH, 0, 0);
  return { matrix: mal3(m4, mal3(m3, mal3(m2, m1))), ausgabeB, ausgabeH };
}

/** Schirm-uv (0..1, y nach unten) → Ausgabe normiert, für ansicht = { zoom, mitteX, mitteY, cssB, cssH }. */
export function ansichtMatrix(ansicht, ausB, ausH) {
  const { cssB, cssH } = ansicht; const z = ansicht.zoom || 1;
  const s = Math.min(cssB / ausB, cssH / ausH) * z;                              // CSS-px je Ausgabe-px
  const mx = ansicht.mitteX ?? 0.5, my = ansicht.mitteY ?? 0.5;
  // u_aus = ((uS*cssB - cssB/2)/s + mx*ausB)/ausB
  return affin(cssB / (s * ausB), cssH / (s * ausH), mx - cssB / (2 * s * ausB), my - cssH / (2 * s * ausH));
}

/** Bildschirm (CSS-px relativ zur Bildfläche) → Quelle normiert. */
export function bildschirmZuQuelle(p, ansicht, g, quelleB, quelleH) {
  const gm = geometrieMatrix(g, quelleB, quelleH); const am = ansichtMatrix(ansicht, gm.ausgabeB, gm.ausgabeH);
  const [x, y] = wende(mal3(gm.matrix, am), p.x / ansicht.cssB, p.y / ansicht.cssH); return { x, y };
}
/** Quelle normiert → Bildschirm (CSS-px). */
export function quelleZuBildschirm(p, ansicht, g, quelleB, quelleH) {
  const gm = geometrieMatrix(g, quelleB, quelleH); const am = ansichtMatrix(ansicht, gm.ausgabeB, gm.ausgabeH);
  const [u, v] = wende(invers3(mal3(gm.matrix, am)), p.x, p.y); return { x: u * ansicht.cssB, y: v * ansicht.cssH };
}
/** Ausgabe normiert ↔ Bildschirm (für Rahmen-Bedienung). */
export function ausgabeZuBildschirm(p, ansicht, ausB, ausH) { const [u, v] = wende(invers3(ansichtMatrix(ansicht, ausB, ausH)), p.x, p.y); return { x: u * ansicht.cssB, y: v * ansicht.cssH }; }
export function bildschirmZuAusgabe(p, ansicht, ausB, ausH) { const [x, y] = wende(ansichtMatrix(ansicht, ausB, ausH), p.x / ansicht.cssB, p.y / ansicht.cssH); return { x, y }; }

/**
 * Schwarze/weiße Balken finden. bild: BildF32 (linear). Rand = Zeilen/Spalten vom Bildrand, in denen höchstens 2 %
 * der Pixel heller (bzw. dunkler) als die Schwelle sind und die Streuung klein ist; Ende beim Profil-Sprung.
 */
export function erkenneRaender(bild, opts = {}) {
  const schwelle = opts.schwelle ?? 0.04, mindestPx = opts.mindestPx ?? 2;
  const { b, h, daten } = bild; const k = bild.kanaele || 4;
  const L = new Float32Array(b * h);
  for (let i = 0, j = 0; i < b * h; i++, j += k) L[i] = 0.2126 * daten[j] + 0.7152 * daten[j + 1] + 0.0722 * daten[j + 2];
  // Profile: Anteil über/unter Schwelle, Mittel, Streuung je Zeile und Spalte
  const zeile = (y) => linie(L, y * b, 1, b), spalte = (x) => linie(L, x, b, h);
  function linie(A, start, schritt, n) {
    let ueber = 0, unter = 0, s = 0, s2 = 0;
    for (let i = 0, p = start; i < n; i++, p += schritt) { const v = A[p]; if (v > schwelle) ueber++; if (v < 1 - schwelle) unter++; s += v; s2 += v * v; }
    const m = s / n; return { hell: ueber / n, dunkel: unter / n, m, sd: Math.sqrt(Math.max(0, s2 / n - m * m)) };
  }
  function seite(n, f) {
    // Balken sind fast schwarz (Mittel < 0,012 linear ≈ sRGB 28) bzw. fast weiß (> 0,9) – dunkle Bildinhalte nicht
    const p0 = f(0); const art = p0.hell <= 0.02 && p0.m < 0.012 ? 'schwarz' : p0.dunkel <= 0.02 && p0.m > 0.9 ? 'weiss' : null;
    if (!art) return { px: 0, art: null, kontrast: 0 };
    let i = 0; const ref = p0.m; const max = Math.floor(n * 0.45);
    while (i < max) {
      const p = f(i);
      const istRand = (art === 'schwarz' ? p.hell <= 0.02 : p.dunkel <= 0.02) && p.sd < 0.03 && Math.abs(Math.sqrt(p.m) - Math.sqrt(ref)) < 0.06;
      if (!istRand) break; i++;
    }
    // Profil-Sprung: Mittel der nächsten 3 Zeilen gegen den Rand (wahrnehmungsnah, Wurzel), sonst kein Balken
    let mi = 0; for (let j = 1; j <= 3; j++) mi += f(Math.min(n - 1, i + j)).m; mi /= 3;
    const kontrast = Math.abs(Math.sqrt(Math.max(0, mi)) - Math.sqrt(Math.max(0, ref)));
    if (kontrast < 0.08) return { px: 0, art: null, kontrast };
    return { px: i, art, kontrast };
  }
  const o = seite(h, (i) => zeile(i)), u = seite(h, (i) => zeile(h - 1 - i));
  const l = seite(b, (i) => spalte(i)), r = seite(b, (i) => spalte(b - 1 - i));
  const s = { oben: o.px, unten: u.px, links: l.px, rechts: r.px };
  for (const key of Object.keys(s)) if (s[key] < mindestPx) s[key] = 0;
  if (b - s.links - s.rechts < b * 0.2 || h - s.oben - s.unten < h * 0.2) { s.oben = s.unten = s.links = s.rechts = 0; }
  const gefunden = s.oben + s.unten + s.links + s.rechts > 0;
  const kontraste = [o, u, l, r].filter((x, i) => [s.oben, s.unten, s.links, s.rechts][i] > 0).map((x) => x.kontrast);
  const sicherheit = gefunden ? Math.min(1, 0.3 + 2 * Math.min(...kontraste)) : 0;
  return { rechteck: { x: s.links / b, y: s.oben / h, b: (b - s.links - s.rechts) / b, h: (h - s.oben - s.unten) / h }, seiten: s, sicherheit, b, h };
}

/**
 * Rechteck einrasten: auf ganze Quell-Pixel, optional `innen` px nach innen, und auf ein Standard-Seitenverhältnis
 * ziehen, wenn es innerhalb `toleranz` liegt (verhaeltnis null/undefined = automatisch, Zahl = erzwingen,
 * 'original' = Quellverhältnis). Es wird nur verkleinert, nie vergrößert.
 */
export function rasterEinrasten(r, opts) {
  const { quelleB: QB, quelleH: QH } = opts; const tol = opts.toleranz ?? 0.015; const innen = opts.innen ?? 0;
  let x0 = r.x * QB + innen, y0 = r.y * QH + innen, x1 = (r.x + r.b) * QB - innen, y1 = (r.y + r.h) * QH - innen;
  x0 = Math.max(0, Math.ceil(x0 - 1e-6)); y0 = Math.max(0, Math.ceil(y0 - 1e-6)); x1 = Math.min(QB, Math.floor(x1 + 1e-6)); y1 = Math.min(QH, Math.floor(y1 + 1e-6));
  let w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
  let ziel = opts.verhaeltnis === 'original' ? QB / QH : (typeof opts.verhaeltnis === 'number' ? opts.verhaeltnis : null);
  if (ziel == null && opts.verhaeltnis !== 'frei') {
    const ist = w / h; let best = null, bestD = Infinity;
    for (const c of [...STANDARD_VERH, QB / QH]) { const d = Math.abs(Math.log(ist / c)); if (d < bestD) { bestD = d; best = c; } }
    if (bestD <= tol) ziel = best;
  }
  if (ziel) {
    const cx = x0 + w / 2, cy = y0 + h / 2;
    if (w / h > ziel) w = Math.max(1, Math.floor(h * ziel + 1e-6)); else h = Math.max(1, Math.floor(w / ziel + 1e-6));
    x0 = Math.round(cx - w / 2); y0 = Math.round(cy - h / 2);
    x0 = Math.min(Math.max(0, x0), QB - w); y0 = Math.min(Math.max(0, y0), QH - h);
  }
  return { x: x0 / QB, y: y0 / QH, b: w / QB, h: h / QH };
}

/** Zuschnitt so verkleinern (um seine Mitte), dass er bei freier Drehung ganz im Bildinhalt liegt. */
export function passeEin(g, qB, qH) {
  const { b: FB, h: FH } = rahmen(g, qB, qH); const z = g.zuschnitt; const rad = ((g.drehung || 0) * Math.PI) / 180;
  if (!rad) return g;
  const cx = (z.x + z.b / 2) * FB, cy = (z.y + z.h / 2) * FH; const c = Math.cos(-rad), s = Math.sin(-rad);
  const drin = (k) => {
    const w = z.b * FB * k / 2, h = z.h * FH * k / 2;
    for (const [dx, dy] of [[-w, -h], [w, -h], [-w, h], [w, h]]) {
      const px = cx + dx - FB / 2, py = cy + dy - FH / 2; const rx = c * px - s * py + FB / 2, ry = s * px + c * py + FH / 2;
      if (rx < -0.01 || ry < -0.01 || rx > FB + 0.01 || ry > FH + 0.01) return false;
    }
    return true;
  };
  if (drin(1)) return g;
  let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (drin(m)) lo = m; else hi = m; }
  const nb = z.b * lo, nh = z.h * lo;
  return { ...g, zuschnitt: { x: z.x + (z.b - nb) / 2, y: z.y + (z.h - nh) / 2, b: nb, h: nh } };
}

/** Rand-Ergebnis (in Pixeln des Analysebilds) → Zuschnitt-Vorschlag in Quell-Koordinaten (2 px nach innen). */
export function vorschlagAusRaendern(ergebnis, quelleB, quelleH, opts = {}) {
  if (!ergebnis || ergebnis.sicherheit < (opts.mindestSicherheit ?? 0.5)) return null;
  const s = ergebnis.seiten; if (s.oben + s.unten + s.links + s.rechts === 0) return null;
  return rasterEinrasten(ergebnis.rechteck, { quelleB, quelleH, innen: opts.innen ?? 2, verhaeltnis: opts.verhaeltnis });
}

// ---------- Bedienung ----------
const SVG = (d) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON = {
  links: SVG('<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4h4"/>'),
  spH: SVG('<path d="M12 3v18"/><path d="M8 7l-5 5 5 5z"/><path d="M16 7l5 5-5 5z"/>'),
  spV: SVG('<path d="M3 12h18"/><path d="M7 8l5-5 5 5z"/><path d="M7 16l5 5 5-5z"/>'),
};

/**
 * Zuschnitt-Bedienung. container = Werkzeug-/Regler-Fläche; opts.flaeche = Bildfläche (für den Rahmen),
 * opts.ansicht() = aktuelle Ansicht (Rahmen-Ansicht ohne Zuschnitt), opts.vorschlag = erkannter Inhalt.
 */
export function zuschnittUI(container, opts) {
  const doc = opts.doc; const QB = doc.quelle.b, QH = doc.quelle.h;
  let g = structuredClone(doc.geometrie); let verh = null;
  const wurzel = document.createElement('div'); wurzel.className = 'zs';
  wurzel.innerHTML = `
    <div class="zs-reihe zs-verh" role="group" aria-label="Seitenverhältnis">${VERHAELTNISSE.map((v) => `<button data-v="${v.id}" aria-pressed="${v.id === 'frei'}">${v.titel}</button>`).join('')}</div>
    <div class="zs-reihe">
      <button data-a="links" aria-label="90 Grad drehen">${ICON.links}</button>
      <button data-a="spH" aria-label="Waagerecht spiegeln">${ICON.spH}</button>
      <button data-a="spV" aria-label="Senkrecht spiegeln">${ICON.spV}</button>
      <button data-a="vorschlag" ${opts.vorschlag ? '' : 'hidden'}>Ränder weg</button>
      <button data-a="zurueck">Zurücksetzen</button>
      <span class="platz"></span>
      <button data-a="fertig" class="haupt">Fertig</button>
    </div>
    <label class="zs-dreh"><span>Drehen</span><input type="range" min="-45" max="45" step="0.1" value="${g.drehung || 0}" aria-label="Drehen"><output>${(g.drehung || 0).toFixed(1)}°</output></label>`;
  container.appendChild(wurzel);
  const flaeche = opts.flaeche || container;
  const rahmenEl = document.createElement('div'); rahmenEl.className = 'zs-rahmen';
  rahmenEl.innerHTML = '<div class="zs-drittel"></div>' + ['nw', 'n', 'no', 'o', 'so', 's', 'sw', 'w'].map((e) => `<div class="zs-griff" data-e="${e}"></div>`).join('') + '<div class="zs-inhalt"></div>';
  flaeche.appendChild(rahmenEl);
  const inhaltEl = rahmenEl.querySelector('.zs-inhalt');
  const melde = (phase) => opts.onAendern?.(structuredClone(g), phase);
  const ansicht = () => opts.ansicht();
  const fr = () => rahmen(g, QB, QH);
  function zeichne() {
    const a = ansicht(); const { b: FB, h: FH } = fr(); const z = g.zuschnitt;
    const p0 = ausgabeZuBildschirm({ x: z.x, y: z.y }, a, FB, FH), p1 = ausgabeZuBildschirm({ x: z.x + z.b, y: z.y + z.h }, a, FB, FH);
    Object.assign(rahmenEl.style, { left: p0.x + 'px', top: p0.y + 'px', width: (p1.x - p0.x) + 'px', height: (p1.y - p0.y) + 'px' });
    if (opts.vorschlag && !g.viertel && !g.spiegelnH && !g.spiegelnV) {
      const v = opts.vorschlag; const q0 = ausgabeZuBildschirm({ x: v.x, y: v.y }, a, FB, FH), q1 = ausgabeZuBildschirm({ x: v.x + v.b, y: v.y + v.h }, a, FB, FH);
      Object.assign(inhaltEl.style, { display: 'block', left: (q0.x - p0.x) + 'px', top: (q0.y - p0.y) + 'px', width: (q1.x - q0.x) + 'px', height: (q1.y - q0.y) + 'px' });
    } else inhaltEl.style.display = 'none';
    wurzel.querySelector('output').textContent = `${(g.drehung || 0).toFixed(1)}°`;
  }
  // Griffe ziehen (mit Einrasten an Bildkante und erkanntem Inhalt)
  let zug = null;
  rahmenEl.addEventListener('pointerdown', (e) => {
    const griff = e.target.closest('.zs-griff'); e.preventDefault(); e.stopPropagation();
    rahmenEl.setPointerCapture(e.pointerId);
    zug = { e: griff ? griff.dataset.e : 'mitte', x: e.clientX, y: e.clientY, z: { ...g.zuschnitt } }; melde('start');
  });
  rahmenEl.addEventListener('pointermove', (e) => {
    if (!zug) return; const a = ansicht(); const { b: FB, h: FH } = fr();
    const s = Math.min(a.cssB / FB, a.cssH / FH) * (a.zoom || 1);
    const dx = (e.clientX - zug.x) / (s * FB), dy = (e.clientY - zug.y) / (s * FH);
    let { x, y, b, h } = zug.z; let x1 = x + b, y1 = y + h; const min = 32 / Math.min(FB, FH);
    if (zug.e === 'mitte') { x = Math.min(Math.max(0, x + dx), 1 - b); y = Math.min(Math.max(0, y + dy), 1 - h); x1 = x + b; y1 = y + h; }
    else {
      if (zug.e.includes('w')) x = Math.min(x1 - min, Math.max(0, x + dx)); if (zug.e.includes('o')) x1 = Math.max(x + min, Math.min(1, x1 + dx));
      if (zug.e.includes('n')) y = Math.min(y1 - min, Math.max(0, y + dy)); if (zug.e.includes('s')) y1 = Math.max(y + min, Math.min(1, y1 + dy));
      // Einrasten an Kanten: Bildkante, erkannter Inhalt (12 CSS-px)
      const fangX = 12 / (s * FB), fangY = 12 / (s * FH); const v = opts.vorschlag;
      const ziele = (achse) => (achse === 'x' ? [0, 1, ...(v ? [v.x, v.x + v.b] : [])] : [0, 1, ...(v ? [v.y, v.y + v.h] : [])]);
      const rast = (w, achse, fang) => { for (const t of ziele(achse)) if (Math.abs(w - t) < fang) return t; return w; };
      x = rast(x, 'x', fangX); x1 = rast(x1, 'x', fangX); y = rast(y, 'y', fangY); y1 = rast(y1, 'y', fangY);
      if (verh) {   // Seitenverhältnis halten
        const r = verh === 'original' ? QB / QH : verh; const w = (x1 - x) * FB, hh = (y1 - y) * FH;
        if (zug.e === 'n' || zug.e === 's') { const nw = hh * r / FB; const cx = (x + x1) / 2; x = cx - nw / 2; x1 = cx + nw / 2; }
        else { const nh = w / r / FH; if (zug.e.includes('n')) y = y1 - nh; else y1 = y + nh; }
      }
    }
    g.zuschnitt = klemmeRechteck({ x, y, b: x1 - x, h: y1 - y });
    g = passeEin(g, QB, QH); zeichne(); melde('zieh');
  });
  const ende = () => { if (!zug) return; zug = null; melde('ende'); };
  rahmenEl.addEventListener('pointerup', ende); rahmenEl.addEventListener('pointercancel', ende);

  function setzeVerh(v) {
    verh = v === 'frei' ? null : VERHAELTNISSE.find((x) => x.id === v).wert;
    for (const b of wurzel.querySelectorAll('[data-v]')) b.setAttribute('aria-pressed', String(b.dataset.v === v));
    if (verh) {
      const { b: FB, h: FH } = fr(); const r = verh === 'original' ? QB / QH : verh; const z = g.zuschnitt;
      let w = z.b * FB, h = z.h * FH; if (w / h > r) w = h * r; else h = w / r;
      g.zuschnitt = klemmeRechteck({ x: z.x + (z.b - w / FB) / 2, y: z.y + (z.h - h / FH) / 2, b: w / FB, h: h / FH });
      g = passeEin(g, QB, QH); zeichne(); melde('ende');
    }
  }
  wurzel.addEventListener('click', (e) => {
    const v = e.target.closest('[data-v]'); if (v) { setzeVerh(v.dataset.v); return; }
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'links') { const z = g.zuschnitt; g.viertel = ((g.viertel || 0) + 1) % 4; g.zuschnitt = { x: 1 - z.y - z.h, y: z.x, b: z.h, h: z.b }; }
    if (a === 'spH') { g.spiegelnH = !g.spiegelnH; g.zuschnitt = { ...g.zuschnitt, x: 1 - g.zuschnitt.x - g.zuschnitt.b }; }
    if (a === 'spV') { g.spiegelnV = !g.spiegelnV; g.zuschnitt = { ...g.zuschnitt, y: 1 - g.zuschnitt.y - g.zuschnitt.h }; }
    if (a === 'vorschlag' && opts.vorschlag) { g = { ...g, viertel: 0, spiegelnH: false, spiegelnV: false, drehung: 0, zuschnitt: { ...opts.vorschlag } }; wurzel.querySelector('input').value = 0; }
    if (a === 'zurueck') { g = { zuschnitt: { x: 0, y: 0, b: 1, h: 1 }, drehung: 0, viertel: 0, spiegelnH: false, spiegelnV: false }; wurzel.querySelector('input').value = 0; }
    if (a === 'fertig') { opts.onFertig?.(structuredClone(g)); return; }
    zeichne(); melde('ende');
  });
  const dreh = wurzel.querySelector('input');
  dreh.addEventListener('pointerdown', () => melde('start'));
  dreh.addEventListener('input', () => { let w = Number(dreh.value); if (Math.abs(w) < 0.6) w = 0; g.drehung = w; g = passeEin(g, QB, QH); zeichne(); melde('zieh'); });
  dreh.addEventListener('change', () => melde('ende'));
  dreh.addEventListener('dblclick', () => { dreh.value = 0; g.drehung = 0; zeichne(); melde('ende'); });
  requestAnimationFrame(zeichne);
  return {
    setze(p) { if (p?.geometrie) g = structuredClone(p.geometrie); zeichne(); },
    neuZeichnen: zeichne,
    zerstoere() { wurzel.remove(); rahmenEl.remove(); },
  };
}
function klemmeRechteck(r) {
  const x = Math.max(0, Math.min(1, r.x)), y = Math.max(0, Math.min(1, r.y));
  return { x, y, b: Math.max(0.005, Math.min(1 - x, r.b)), h: Math.max(0.005, Math.min(1 - y, r.h)) };
}
