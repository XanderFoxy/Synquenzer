// scan-bild.js – Noten-Foto vorbereiten, alles im Gerät (nichts wird gesendet):
// Graustufen → Licht ausgleichen → Schwellwert → Schräglage (Projektion) → Notenlinien (waagrechte Projektion)
// → Klavier-Zeilen (Akkoladen) → Taktstriche (senkrechte Projektion je Zeile) → grobe Notenkopf-Zählung
// → scharfe Zuschnitte je Zeile für die KI (unter der 1,2-Megapixel-Grenze, ab der die KI verkleinert).
// Die reinen Rechen-Funktionen arbeiten auf Uint8Array (auch in Node testbar).

export const GRENZEN = { analyse: 1600, meister: 3400, kiPixel: 1150000, kiKante: 2000, taktKante: 1600, minAbstandKi: 12 };
const ruhe = () => new Promise((r) => setTimeout(r, 0));

// ───────── Grundbausteine (rein) ─────────

/** Papierhelligkeit je Block schätzen und herausrechnen: Schatten und Lichtverlauf eines Fotos verschwinden. */
export function lichtAusgleich(g, w, h) {
  const B = Math.max(12, Math.round(Math.max(w, h) / 40));
  const bw = Math.ceil(w / B), bh = Math.ceil(h / B);
  let hell = new Float32Array(bw * bh);
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    let m = 0;
    const y1 = Math.min(h, (by + 1) * B), x1 = Math.min(w, (bx + 1) * B);
    for (let y = by * B; y < y1; y += 2) { const o = y * w; for (let x = bx * B; x < x1; x += 2) { const v = g[o + x]; if (v > m) m = v; } }
    hell[by * bw + bx] = m;
  }
  // erst das Maximum der Nachbarn (ein fast schwarzer Block nimmt die Papierfarbe daneben an), dann zweimal glätten
  const filter = (quelle, art) => {
    const aus = new Float32Array(quelle.length);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      let s = 0, n = 0, m = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || yy >= bh || xx < 0 || xx >= bw) continue;
        const v = quelle[yy * bw + xx]; s += v; n++; if (v > m) m = v;
      }
      aus[y * bw + x] = art === 'max' ? m : s / n;
    }
    return aus;
  };
  hell = filter(filter(filter(hell, 'max'), 'mittel'), 'mittel');
  const aus = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    const fy = Math.min(bh - 1, Math.max(0, (y + 0.5) / B - 0.5)), y0 = Math.floor(fy), y1 = Math.min(bh - 1, y0 + 1), ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const fx = Math.min(bw - 1, Math.max(0, (x + 0.5) / B - 0.5)), x0 = Math.floor(fx), x1 = Math.min(bw - 1, x0 + 1), tx = fx - x0;
      const a = hell[y0 * bw + x0] * (1 - tx) + hell[y0 * bw + x1] * tx, b = hell[y1 * bw + x0] * (1 - tx) + hell[y1 * bw + x1] * tx;
      const bg = Math.max(48, a * (1 - ty) + b * ty);
      aus[y * w + x] = (g[y * w + x] * 255) / bg;
    }
  }
  return aus;
}

/** Schwellwert nach Otsu (trennt Tinte und Papier). */
export function otsu(g) {
  const hist = new Float64Array(256);
  for (let i = 0; i < g.length; i++) hist[g[i]]++;
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sB = 0, wB = 0, best = 0, t = 128;
  for (let i = 0; i < 256; i++) {
    wB += hist[i]; if (!wB) continue;
    const wF = g.length - wB; if (!wF) break;
    sB += i * hist[i];
    const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
    if (v > best) { best = v; t = i; }
  }
  return t;
}
export function binaer(g, t) { const b = new Uint8Array(g.length); for (let i = 0; i < g.length; i++) b[i] = g[i] <= t ? 1 : 0; return b; }

/** Schräglage in Grad: Winkel, bei dem die waagrechte Projektion am schärfsten wird (Notenlinien bilden Spitzen). */
export function schraeglage(bin, w, h, max = 8) {
  let n = 0;
  for (let i = 0; i < bin.length; i++) n += bin[i];
  if (!n) return 0;
  const schritt = Math.max(1, Math.ceil(n / 300000));
  const xs = new Float32Array(Math.ceil(n / schritt) + 1), ys = new Float32Array(xs.length);
  let k = 0, z = 0;
  for (let y = 0; y < h; y++) { const o = y * w; for (let x = 0; x < w; x++) if (bin[o + x] && (z++ % schritt === 0) && k < xs.length) { xs[k] = x; ys[k] = y; k++; } }
  const off = Math.ceil(Math.tan((max + 1) * Math.PI / 180) * w) + 2;
  const P = new Uint32Array(h + 2 * off);
  const wert = (grad) => {
    const t = Math.tan(grad * Math.PI / 180);
    P.fill(0);
    for (let i = 0; i < k; i++) P[(ys[i] - xs[i] * t + off + 0.5) | 0]++;
    let s = 0; for (let i = 0; i < P.length; i++) s += P[i] * P[i];
    return s;
  };
  let best = 0, bs = -1;
  for (let a = -max; a <= max + 1e-9; a += 0.5) { const s = wert(a); if (s > bs) { bs = s; best = a; } }
  const grob = best;
  for (let a = grob - 0.5; a <= grob + 0.5 + 1e-9; a += 0.05) { const s = wert(a); if (s > bs) { bs = s; best = a; } }
  return Math.round(best * 100) / 100;
}

/** Liniendicke und Linienabstand aus senkrechten Läufen (häufigster schwarzer Lauf, häufigstes Schwarz+Weiß-Paar). */
export function linienMasse(bin, w, h) {
  const schwarz = new Uint32Array(64), paar = new Uint32Array(320);
  const schritt = Math.max(1, Math.floor(w / 320));
  for (let x = schritt >> 1; x < w; x += schritt) {
    let y = 0, vorB = 0;
    while (y < h) {
      const ws = y; while (y < h && !bin[y * w + x]) y++;
      const weiss = y - ws;
      if (y >= h) break;
      const bs = y; while (y < h && bin[y * w + x]) y++;
      const b = y - bs;
      if (vorB > 0 && vorB < 12 && weiss > 1 && vorB + weiss < 320) paar[vorB + weiss]++;
      if (b < 64) schwarz[b]++;
      vorB = b;
    }
  }
  const gipfel = (hist, ab) => { let m = ab, mv = -1; for (let i = ab; i < hist.length - 1; i++) { const v = hist[i - 1] * 0.5 + hist[i] + hist[i + 1] * 0.5; if (v > mv) { mv = v; m = i; } } return m; };
  return { dicke: gipfel(schwarz, 1), abstand: gipfel(paar, 4) };
}

/** Notenlinien: waagrechte Projektion im mittleren Bereich, Spitzen mit Mindestabstand. */
export function notenlinien(bin, w, h, { dicke, abstand }) {
  const x0 = Math.floor(w * 0.18), x1 = Math.ceil(w * 0.82), band = Math.max(1, x1 - x0);
  const P = new Float32Array(h);
  for (let y = 0; y < h; y++) { let s = 0; const o = y * w; for (let x = x0; x < x1; x++) s += bin[o + x]; P[y] = s / band; }
  // Stärke: Deckung einer Zeile – eine leicht schräge/krumme Linie verteilt sich auf zwei Zeilen
  const Q = new Float32Array(h);
  for (let y = 0; y < h; y++) Q[y] = Math.min(1, Math.max(P[y], P[y] + (P[y - 1] || 0) * 0.8, P[y] + (P[y + 1] || 0) * 0.8));
  const kand = [];
  for (let y = 0; y < h; y++) if (Q[y] >= 0.42 && Q[y] >= (Q[y - 1] || 0) && Q[y] > (Q[y + 1] || 0)) kand.push(y);
  const radius = Math.max(2, abstand * 0.42);
  kand.sort((a, b) => Q[b] - Q[a]);
  const genommen = [];
  for (const y of kand) if (!genommen.some((z) => Math.abs(z - y) < radius)) genommen.push(y);
  const fen = Math.max(1, Math.ceil(dicke / 2) + 1);
  return genommen.sort((a, b) => a - b).map((y) => {
    let s = 0, m = 0;
    for (let d = -fen; d <= fen; d++) { const yy = y + d; if (yy >= 0 && yy < h && P[yy] > 0.25) { s += P[yy]; m += P[yy] * yy; } }
    return { y: s ? m / s : y, staerke: Q[y] };
  });
}

/** Je fünf gleich weit entfernte Linien = ein Notensystem. Gibt es mehrere Möglichkeiten, gewinnen die kräftigsten Linien. */
export function fuenferGruppen(linien, abstand) {
  const ys = linien.map((l) => l.y), st = linien.map((l) => l.staerke ?? 1);
  const kand = [];
  for (let i = 0; i < ys.length; i++) {
    let g = abstand, liste = [i], ok = true;
    for (let k = 1; k <= 4; k++) {
      const ziel = ys[i] + k * g;
      let bj = -1, bd = Infinity;
      for (let j = liste[liste.length - 1] + 1; j < ys.length && ys[j] < ziel + 0.4 * g; j++) { const d = Math.abs(ys[j] - ziel); if (d < bd) { bd = d; bj = j; } }
      if (bj < 0 || bd > 0.26 * g) { ok = false; break; }
      liste.push(bj); g = (ys[bj] - ys[i]) / k;
    }
    if (!ok) continue;
    const luecken = liste.slice(1).map((j, k) => ys[j] - ys[liste[k]]);
    const mittel = luecken.reduce((a, b) => a + b, 0) / 4;
    if (luecken.some((x) => Math.abs(x - mittel) > 0.22 * mittel)) continue;
    const staerke = Math.min(...liste.map((j) => st[j])) + liste.reduce((a, j) => a + st[j], 0) / 50;
    kand.push({ liste, mittel, staerke });
  }
  kand.sort((a, b) => b.staerke - a.staerke);
  const aus = [], benutzt = new Set();
  for (const k of kand) {
    if (k.liste.some((j) => benutzt.has(j))) continue;
    const y0 = ys[k.liste[0]], y4 = ys[k.liste[4]];
    if (aus.some((a) => a.y[0] < y4 + 0.5 * k.mittel && y0 < a.y[4] + 0.5 * k.mittel)) continue;
    k.liste.forEach((j) => benutzt.add(j));
    aus.push({ y: k.liste.map((j) => ys[j]), g: k.mittel });
  }
  return aus.sort((a, b) => a.y[0] - b.y[0]);
}

const schwarzBei = (bin, w, h, x, y) => x >= 0 && x < w && y >= 0 && y < h && bin[y * w + x] === 1;

/** Waagrechte Ausdehnung eines Notensystems (wo mindestens 4 der 5 Linien schwarz sind). */
export function ausdehnung(bin, w, h, st) {
  const reihen = st.y.map((y) => Math.round(y));
  const da = new Uint8Array(w);
  for (let x = 0; x < w; x++) {
    let n = 0;
    for (const r of reihen) if (schwarzBei(bin, w, h, x, r) || schwarzBei(bin, w, h, x, r - 1) || schwarzBei(bin, w, h, x, r + 1)) n++;
    da[x] = n >= 4 ? 1 : 0;
  }
  const luecke = Math.max(3, st.g * 1.5);
  const teile = [];
  let a = -1, letzt = -1;
  for (let x = 0; x <= w; x++) {
    if (x < w && da[x]) { if (a < 0) a = x; letzt = x; continue; }
    if (a >= 0 && x - letzt > luecke) { teile.push([a, letzt]); a = -1; }
  }
  if (a >= 0) teile.push([a, letzt]);
  if (!teile.length) return { x0: 0, x1: w - 1 };
  teile.sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]));
  return { x0: teile[0][0], x1: teile[0][1] };
}

/** Sind zwei Notensysteme durch einen senkrechten Strich verbunden (Taktstrich/Klammer einer Klavier-Zeile)? */
export function verbunden(bin, w, h, a, b) {
  const y0 = Math.round(a.y[4] + 2), y1 = Math.round(b.y[0] - 2);
  if (y1 <= y0) return true;
  const g = (a.g + b.g) / 2;
  const xa = Math.max(1, Math.round(Math.max(a.x0, b.x0) - 1.5 * g)), xb = Math.min(w - 2, Math.round(Math.min(a.x1, b.x1) + g));
  const hoehe = y1 - y0;
  let treffer = 0;
  for (let x = xa; x <= xb; x++) {
    let s = 0;
    for (let y = y0; y < y1; y++) { const o = y * w + x; if (bin[o] || bin[o - 1] || bin[o + 1]) s++; else if (y - y0 - s > 0.08 * hoehe) break; }
    if (s >= 0.92 * hoehe) { treffer++; x += Math.ceil(g); }
  }
  return treffer >= 1;
}

/** Notensysteme zu Zeilen gruppieren: verbundene gehören zusammen; sonst Paare nach Abstandsmuster (Klavier). */
export function zeilenBilden(bin, w, h, staves) {
  if (!staves.length) return [];
  const verb = staves.slice(1).map((s, i) => verbunden(bin, w, h, staves[i], s));
  let gruppen = [];
  if (verb.some(Boolean)) {
    let akt = [0];
    verb.forEach((v, i) => { if (v) akt.push(i + 1); else { gruppen.push(akt); akt = [i + 1]; } });
    gruppen.push(akt);
  } else if (staves.length % 2 === 0 && staves.length >= 2) {
    const l = staves.slice(1).map((s, i) => s.y[0] - staves[i].y[4]);
    const innen = l.filter((_, i) => i % 2 === 0), aussen = l.filter((_, i) => i % 2 === 1);
    const maxI = Math.max(...innen), minA = aussen.length ? Math.min(...aussen) : Infinity;
    if (minA > maxI * 1.12) for (let i = 0; i < staves.length; i += 2) gruppen.push([i, i + 1]);
    else gruppen = staves.map((_, i) => [i]);
  } else gruppen = staves.map((_, i) => [i]);
  return gruppen.map((idx) => {
    let liste = idx.map((i) => staves[i]);
    const zuviel = liste.length > 2;
    if (zuviel) liste = liste.slice(-2); // Klavier steht unten (z. B. Gesang + Klavier)
    const g = liste.reduce((a, s) => a + s.g, 0) / liste.length;
    return { staves: liste, g, x0: Math.min(...liste.map((s) => s.x0)), x1: Math.max(...liste.map((s) => s.x1)), top: liste[0].y[0], bot: liste[liste.length - 1].y[4], zuviel };
  });
}

/** Taktstriche einer Zeile: Spalten, die jedes Notensystem ganz durchziehen und darüber/darunter frei sind. */
export function taktstriche(bin, w, h, z) {
  const g = z.g;
  const xa = Math.max(1, Math.round(z.x0 + 0.7 * g)), xb = Math.min(w - 2, Math.round(z.x1 + 0.6 * g));
  const deckung = (x, y0, y1) => {
    let s = 0;
    for (let y = Math.max(0, Math.round(y0)); y <= Math.min(h - 1, Math.round(y1)); y++) { const o = y * w + x; if (bin[o] || bin[o - 1] || bin[o + 1]) s++; }
    return s / Math.max(1, Math.round(y1) - Math.round(y0) + 1);
  };
  const spalten = [];
  for (let x = xa; x <= xb; x++) {
    let ok = true;
    for (const st of z.staves) if (deckung(x, st.y[0], st.y[4]) < 0.9) { ok = false; break; }
    if (!ok) continue;
    // Taktstriche enden an den äußeren Linien, Hälse von Akkorden ragen meist darüber hinaus
    const oben = deckung(x, z.top - 1.3 * g, z.top - 0.35 * g), unten = deckung(x, z.bot + 0.35 * g, z.bot + 1.3 * g);
    if (oben > 0.6 || unten > 0.6) continue;
    spalten.push(x);
  }
  const gruppen = [];
  for (const x of spalten) {
    const l = gruppen[gruppen.length - 1];
    if (l && x - l.x1 <= 1) l.x1 = x; else gruppen.push({ x0: x, x1: x });
  }
  let schmal = gruppen.filter((q) => q.x1 - q.x0 + 1 <= Math.max(4, 0.9 * g));
  // Klavier: Taktstriche gehen meist durch die Lücke zwischen den Systemen – Hälse und Taktangaben nicht.
  if (z.staves.length === 2) {
    const a = z.staves[0].y[4] + 1, b = z.staves[1].y[0] - 1;
    for (const q of schmal) { let m = 0; for (let x = q.x0; x <= q.x1; x++) m = Math.max(m, deckung(x, a, b)); q.luecke = m; }
    const durch = schmal.filter((q) => q.luecke >= 0.9);
    if (durch.length >= Math.max(2, 0.6 * schmal.length)) schmal = durch;
  }
  // doppelte Striche, Schluss- und Wiederholungsstriche zu einem zusammenfassen
  const striche = [];
  for (const q of schmal) {
    const l = striche[striche.length - 1];
    if (l && q.x0 - l.x1 <= 1.4 * g) { l.x1 = q.x1; l.n++; } else striche.push({ ...q, n: 1 });
  }
  return striche.map((q) => ({ x: (q.x0 + q.x1) / 2, x0: q.x0, x1: q.x1, doppelt: q.n > 1 }));
}

/** Tinte (ohne Notenlinien) in einem Bereich einer Zeile – in Linienabstand² gemessen.
 *  Gezählt werden nur senkrecht dickere Stellen als eine Linie (so stört auch eine leicht schräge Linie nicht). */
export function tinte(bin, w, h, z, xa, xb) {
  let n = 0;
  const grenze = Math.max(3, 2 * (z.dicke || 1) + 1);
  const y0 = Math.max(0, Math.round(z.top - 3 * z.g)), y1 = Math.min(h - 1, Math.round(z.bot + 3 * z.g));
  for (let x = Math.max(0, Math.round(xa)); x <= Math.min(w - 1, Math.round(xb)); x++) {
    let lauf = 0;
    for (let y = y0; y <= y1 + 1; y++) {
      if (y <= y1 && bin[y * w + x]) { lauf++; continue; }
      if (lauf > grenze && lauf <= 5 * z.g) n += lauf; // sehr lange Läufe: Bildrand/Hintergrund, keine Noten
      lauf = 0;
    }
  }
  return n / (z.g * z.g);
}

/** Takt-Grenzen aus den Taktstrichen. Hinter dem letzten Strich zählt ein Takt nur, wenn dort Noten stehen. */
export function taktGrenzen(z, striche, bin, w, h) { // bin: strenger Schwellwert (Rauschen zählt nicht als Tinte)
  const g = z.g, xs = striche.map((s) => s.x).filter((x) => x > z.x0 + 1.5 * g);
  const grenzen = [z.x0, ...xs];
  const letzt = grenzen[grenzen.length - 1];
  z.restTinte = z.x1 - letzt > 4 * g && bin ? tinte(bin, w, h, z, letzt + 0.6 * g, z.x1 - 0.3 * g) : null;
  if (z.x1 - letzt > 4 * g && (z.restTinte == null || z.restTinte > 2.5)) grenzen.push(z.x1);
  const takte = [];
  for (let i = 0; i + 1 < grenzen.length; i++) if (grenzen[i + 1] - grenzen[i] > 1.5 * g) takte.push({ x0: grenzen[i], x1: grenzen[i + 1] });
  if (!takte.length) takte.push({ x0: z.x0, x1: z.x1 });
  return takte;
}

/**
 * Gefüllte Notenköpfe grob zählen: Notenlinien entfernen, mit einem Quadrat (~½ Linienabstand) „abtragen“ –
 * übrig bleiben die dicken, runden Flecken (gefüllte Köpfe). Hälse, Balken, Linien, Punkte, Schrift verschwinden.
 * Halbe und Ganze (hohl) zählt das nicht – die Prüfung vergleicht deshalb nur gefüllte Köpfe.
 */
export function koepfeFinden(binQ, w, h, z) {
  const g = z.g, k = Math.max(2, Math.round(0.55 * g));
  const aus = [];
  z.staves.forEach((st, si) => {
    const nachbarOben = si > 0 ? (z.staves[si - 1].y[4] + st.y[0]) / 2 : st.y[0] - 3.2 * g;
    const nachbarUnten = si < z.staves.length - 1 ? (st.y[4] + z.staves[si + 1].y[0]) / 2 : st.y[4] + 3.2 * g;
    const ry0 = Math.max(0, Math.floor(nachbarOben)), ry1 = Math.min(h - 1, Math.ceil(nachbarUnten));
    const rx0 = Math.max(0, Math.floor(z.x0)), rx1 = Math.min(w - 1, Math.ceil(z.x1 + g));
    const rw = rx1 - rx0 + 1, rh = ry1 - ry0 + 1;
    if (rw < 4 || rh < 4) return;
    const b = new Uint8Array(rw * rh);
    for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) b[y * rw + x] = binQ[(y + ry0) * w + x + rx0];
    // Notenlinien entfernen, wo nichts darüber/darunter hängt
    const dick = Math.max(1, Math.round(z.dicke || 1));
    for (const ly of st.y) {
      const a = Math.round(ly - (dick - 1) / 2) - ry0, e = a + dick - 1;
      for (let x = 0; x < rw; x++) {
        const ob = a - 1 >= 0 ? b[(a - 1) * rw + x] : 0, un = e + 1 < rh ? b[(e + 1) * rw + x] : 0;
        if (!ob && !un) for (let y = Math.max(0, a); y <= Math.min(rh - 1, e); y++) b[y * rw + x] = 0;
      }
    }
    // Integralbild → Kernpunkte (k×k ganz schwarz)
    const I = new Uint32Array((rw + 1) * (rh + 1));
    for (let y = 0; y < rh; y++) { let s = 0; for (let x = 0; x < rw; x++) { s += b[y * rw + x]; I[(y + 1) * (rw + 1) + x + 1] = I[y * (rw + 1) + x + 1] + s; } }
    const kern = new Uint8Array(rw * rh), r = k >> 1, voll = k * k - 1;
    for (let y = 0; y + k <= rh; y++) for (let x = 0; x + k <= rw; x++) {
      const s = I[(y + k) * (rw + 1) + x + k] - I[y * (rw + 1) + x + k] - I[(y + k) * (rw + 1) + x] + I[y * (rw + 1) + x];
      if (s >= voll) kern[(y + r) * rw + x + r] = 1;
    }
    // zusammenhängende Flecken
    const stapel = [];
    for (let i = 0; i < kern.length; i++) {
      if (kern[i] !== 1) continue;
      let n = 0, xa = rw, xe = 0, ya = rh, ye = 0, sx = 0, sy = 0;
      kern[i] = 2; stapel.push(i);
      while (stapel.length) {
        const p = stapel.pop(), px = p % rw, py = (p - px) / rw;
        n++; sx += px; sy += py;
        if (px < xa) xa = px; if (px > xe) xe = px; if (py < ya) ya = py; if (py > ye) ye = py;
        if (px > 0 && kern[p - 1] === 1) { kern[p - 1] = 2; stapel.push(p - 1); }
        if (px < rw - 1 && kern[p + 1] === 1) { kern[p + 1] = 2; stapel.push(p + 1); }
        if (py > 0 && kern[p - rw] === 1) { kern[p - rw] = 2; stapel.push(p - rw); }
        if (py < rh - 1 && kern[p + rw] === 1) { kern[p + rw] = 2; stapel.push(p + rw); }
      }
      const bb = xe - xa + 1, hh = ye - ya + 1;
      if (bb > 2.6 * g || hh > 2.4 * g || n < 2) continue;
      aus.push({ x: rx0 + sx / n, y: ry0 + sy / n, flaeche: n, b: bb, h: hh, staff: si });
    }
  });
  // typische Fläche eines einzelnen Kopfes → Köpfe je Fleck
  // typische Fläche eines einzelnen Kopfes (Ellipse ~1,3 × 1,0 Linienabstände, abgetragen um k)
  const theorie = Math.max(2, (1.3 * g - k) * (1.0 * g - k) * 0.8);
  const einzeln = aus.filter((f) => f.b >= 0.35 * g && f.b <= 1.15 * g && f.h >= 0.2 * g && f.h <= 0.8 * g).map((f) => f.flaeche).sort((a, b) => a - b);
  const A1 = einzeln.length >= 5 ? Math.min(theorie * 1.6, Math.max(theorie * 0.6, einzeln[einzeln.length >> 1])) : theorie;
  const echt = aus.filter((f) => f.flaeche >= 0.35 * A1);
  for (const f of echt) f.n = Math.max(1, Math.round(f.flaeche / A1));
  return echt;
}

// ───────── Browser: Bild laden, ausrichten, zuschneiden ─────────

function leinwand(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
const ctx2d = (c) => c.getContext('2d', { willReadFrequently: true });
function grauVon(c) {
  const d = ctx2d(c).getImageData(0, 0, c.width, c.height).data, g = new Uint8ClampedArray(c.width * c.height);
  for (let i = 0, j = 0; i < g.length; i++, j += 4) g[i] = (d[j] * 77 + d[j + 1] * 150 + d[j + 2] * 29) >> 8;
  return g;
}
function grauSchreiben(c, g) {
  const ctx = ctx2d(c), id = ctx.createImageData(c.width, c.height), d = id.data;
  for (let i = 0, j = 0; i < g.length; i++, j += 4) { d[j] = d[j + 1] = d[j + 2] = g[i]; d[j + 3] = 255; }
  ctx.putImageData(id, 0, 0);
}
const alsBlob = (c, typ = 'image/png', q) => new Promise((ok, nein) => c.toBlob((b) => (b ? ok(b) : nein(new Error('Bild ließ sich nicht speichern'))), typ, q));

export async function bildOeffnen(datei) {
  const url = URL.createObjectURL(datei);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try { await img.decode(); } catch { URL.revokeObjectURL(url); throw Object.assign(new Error('decode'), { text: 'Dieses Bild lässt sich nicht öffnen. Bitte ein Foto als JPEG oder PNG wählen.' }); }
  if (!img.naturalWidth || !img.naturalHeight) { URL.revokeObjectURL(url); throw Object.assign(new Error('leer'), { text: 'Das Bild ist leer.' }); }
  return { img, w: img.naturalWidth, h: img.naturalHeight, frei: () => URL.revokeObjectURL(url) };
}

/** Ausgerichtetes Bild zeichnen (Drehung um die Mitte, weißer Rand). */
function gedreht(quelle, sw, sh, w, h, grad) {
  const c = leinwand(w, h), ctx = ctx2d(c);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.translate(w / 2, h / 2);
  if (grad) ctx.rotate((-grad * Math.PI) / 180);
  ctx.drawImage(quelle, 0, 0, sw, sh, -w / 2, -h / 2, w, h);
  return c;
}

/**
 * Ganze Seite vorbereiten.
 * @returns {Promise<{ok, w, h, winkel, masse, zeilen:[…], vorschau:{blob,w,h}, hinweise:string[]}>}
 */
export async function seiteVorbereiten(datei, { schritt = () => {} } = {}) {
  schritt('Bild öffnen');
  const { img, w: W0, h: H0, frei } = await bildOeffnen(datei);
  try {
    await ruhe();
    // 1) Arbeitsgröße, Graustufen, Licht, Schwellwert, Schräglage
    const aw = Math.max(200, Math.round(W0 * Math.min(1, GRENZEN.analyse / W0, (GRENZEN.analyse * 1.45) / H0))), ah = Math.round((H0 * aw) / W0);
    schritt('Licht ausgleichen');
    let ana = gedreht(img, W0, H0, aw, ah, 0);
    let g = lichtAusgleich(grauVon(ana), aw, ah);
    let t = otsu(g);
    let bin = binaer(g, Math.min(215, Math.round((t + 255) / 2)));
    await ruhe();
    schritt('Schräglage messen');
    const winkel = schraeglage(bin, aw, ah);
    await ruhe();
    // 2) Meister (scharf, ausgerichtet) und ausgerichtete Arbeitsgröße
    schritt('Ausrichten');
    const fm = Math.min(1, GRENZEN.meister / Math.max(W0, H0));
    const MW = Math.round(W0 * fm), MH = Math.round(H0 * fm);
    const meister = gedreht(img, W0, H0, MW, MH, winkel);
    if (Math.abs(winkel) >= 0.05) ana = gedreht(img, W0, H0, aw, ah, winkel);
    g = lichtAusgleich(grauVon(ana), aw, ah);
    t = otsu(g);
    const binL = binaer(g, Math.min(215, Math.round((t + 255) / 2))); // großzügig: auch blasse Linien
    const binQ = binaer(g, t); // streng: für Notenköpfe
    ana.width = ana.height = 0;
    await ruhe();
    // 3) Linien, Systeme, Zeilen, Taktstriche
    schritt('Notenlinien suchen');
    const masse = linienMasse(binL, aw, ah);
    let linien = notenlinien(binL, aw, ah, masse);
    let staves = fuenferGruppen(linien, masse.abstand);
    if (!staves.length && linien.length >= 5) {
      const lk = linien.slice(1).map((l, i) => l.y - linien[i].y).sort((a, b) => a - b);
      const alt = lk[lk.length >> 2] || masse.abstand;
      staves = fuenferGruppen(linien, alt);
      if (staves.length) masse.abstand = alt;
    }
    for (const st of staves) Object.assign(st, ausdehnung(binL, aw, ah, st));
    staves = staves.filter((st) => st.x1 - st.x0 > 12 * st.g);
    const zeilen = zeilenBilden(binL, aw, ah, staves);
    schritt('Takte zählen');
    for (const z of zeilen) {
      z.dicke = masse.dicke;
      z.striche = taktstriche(binL, aw, ah, z);
      z.takte = taktGrenzen(z, z.striche, binQ, aw, ah);
      z.koepfe = koepfeFinden(binQ, aw, ah, z);
    }
    await ruhe();
    // 4) in Meister-Koordinaten umrechnen und zuschneiden
    const f = MW / aw;
    const hinweise = [];
    if (!zeilen.length) hinweise.push('Keine Notenlinien gefunden.');
    if (zeilen.some((z) => z.zuviel)) hinweise.push('Eine Zeile hat mehr als zwei Notensysteme – gelesen werden die unteren zwei (Klavier).');
    const mz = zeilen.map((z, i) => {
      const s = (v) => v * f;
      return {
        i, g: s(z.g), dicke: s(z.dicke), x0: s(z.x0), x1: s(z.x1), top: s(z.top), bot: s(z.bot),
        staves: z.staves.map((st) => ({ y: st.y.map(s), g: s(st.g) })),
        takte: z.takte.map((tk) => ({ x0: s(tk.x0), x1: s(tk.x1) })),
        striche: z.striche.map((q) => s(q.x)),
        koepfe: z.koepfe.map((k) => ({ x: s(k.x), y: s(k.y), n: k.n, staff: k.staff })),
        zuviel: z.zuviel, restTinte: z.restTinte,
      };
    });
    schritt('Zeilen zuschneiden');
    // ganzes ausgerichtetes Bild einmal glätten (Licht) – daraus alle Zuschnitte
    const mg = lichtAusgleich(grauVon(meister), MW, MH);
    grauSchreiben(meister, mg);
    await ruhe();
    mz.forEach((z, i) => {
      const vor = mz[i - 1], nach = mz[i + 1];
      const yo = Math.max(vor ? (vor.bot + z.top) / 2 : 0, z.top - 4.6 * z.g), yu = Math.min(nach ? (z.bot + nach.top) / 2 : MH, z.bot + 4.6 * z.g);
      const y0 = Math.max(0, Math.min(yo, z.top - 2.4 * z.g)), y1 = Math.min(MH, Math.max(yu, z.bot + 2.4 * z.g));
      const x0 = Math.max(0, z.x0 - 2.6 * z.g), x1 = Math.min(MW, z.x1 + 1.4 * z.g);
      z.region = { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
    });
    for (const z of mz) {
      const r = z.region, c = leinwand(r.w, r.h);
      ctx2d(c).drawImage(meister, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      z.quelle = await alsBlob(c, 'image/jpeg', 0.92);
      z.ki = await kiBilderZeile(c, z);
      c.width = c.height = 0;
      await ruhe();
    }
    // Vorschau der ganzen Seite
    const vw = Math.min(900, MW), vh = Math.round((MH * vw) / MW);
    const vc = leinwand(vw, vh);
    ctx2d(vc).drawImage(meister, 0, 0, vw, vh);
    const vorschau = { blob: await alsBlob(vc, 'image/jpeg', 0.82), w: vw, h: vh, f: vw / MW };
    vc.width = vc.height = 0;
    const ganz = mz.length ? null : await ganzeSeiteKi(meister);
    meister.width = meister.height = 0;
    return { ok: mz.length > 0, w: MW, h: MH, winkel, masse: { dicke: masse.dicke * f, abstand: masse.abstand * f }, zeilen: mz, vorschau, hinweise, ganz };
  } finally { frei(); }
}

/** Notfall: keine Linien gefunden → ganze Seite (wird von der KI ohnehin auf ~1,2 MP verkleinert). */
async function ganzeSeiteKi(meister) {
  const s = Math.min(1, Math.sqrt(GRENZEN.kiPixel / (meister.width * meister.height)));
  const c = leinwand(meister.width * s, meister.height * s);
  ctx2d(c).drawImage(meister, 0, 0, c.width, c.height);
  const blob = await alsBlob(c, 'image/png');
  const aus = { blob, w: c.width, h: c.height };
  c.width = c.height = 0;
  return aus;
}

/**
 * Bilder einer Zeile für die KI: über jedem Takt eine kleine blaue Nummer (Takt-Zähler der App),
 * damit Takt n der Antwort sicher zu Takt n im Bild gehört. Ist die Schrift sonst zu klein,
 * wird die Zeile an einem Taktstrich in zwei Bilder geteilt.
 */
async function kiBilderZeile(c, z) {
  const r = z.region, g = z.g;
  const takte = z.takte.map((tk, k) => ({ k, x0: tk.x0 - r.x, x1: tk.x1 - r.x }));
  const passt = (bw) => Math.min(GRENZEN.kiKante / bw, Math.sqrt(GRENZEN.kiPixel / (bw * (r.h + 2.6 * g))), 3);
  let teile = [{ sx: 0, sw: r.w, takte }];
  if (passt(r.w) * g < GRENZEN.minAbstandKi && takte.length >= 2) {
    const mitte = r.w / 2;
    let best = 1, bd = Infinity;
    for (let k = 1; k < takte.length; k++) { const d = Math.abs(takte[k].x0 - mitte); if (d < bd) { bd = d; best = k; } }
    const schnitt = takte[best].x0;
    teile = [
      { sx: 0, sw: Math.min(r.w, schnitt + 0.6 * g), takte: takte.slice(0, best) },
      { sx: Math.max(0, schnitt - 0.6 * g), sw: r.w - Math.max(0, schnitt - 0.6 * g), takte: takte.slice(best) },
    ];
  }
  const aus = [];
  for (const t of teile) {
    const s = passt(t.sw), band = 2.6 * g;
    const W = Math.round(t.sw * s), H = Math.round((r.h + band) * s);
    const k = leinwand(W, H), ctx = ctx2d(k);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(c, t.sx, 0, t.sw, r.h, 0, band * s, W, r.h * s);
    const fs = Math.max(11, Math.round(1.45 * g * s));
    ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const tk of t.takte) {
      const cx = ((tk.x0 + tk.x1) / 2 - t.sx) * s, cy = band * s * 0.5;
      const txt = String(tk.k + 1), bw = ctx.measureText(txt).width + fs * 0.7, bh = fs * 1.25;
      ctx.fillStyle = '#e3ecff'; ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = Math.max(1, fs * 0.08);
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, bh * 0.3) : ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1d4ed8'; ctx.fillText(txt, cx, cy + fs * 0.04);
      // kleine Marken an den Taktgrenzen
      ctx.fillStyle = '#1d4ed8';
      for (const xg of [tk.x0, tk.x1]) { const x = (xg - t.sx) * s; if (x > 1 && x < W - 1) ctx.fillRect(x - 1, band * s * 0.78, 2, band * s * 0.22); }
    }
    aus.push({ blob: await alsBlob(k, 'image/png'), w: W, h: H, takte: t.takte.map((x) => x.k), s, sx: t.sx });
    k.width = k.height = 0;
  }
  return aus;
}

const bitmapCache = new Map();
async function quelleBild(z) {
  if (bitmapCache.has(z.quelle)) return bitmapCache.get(z.quelle);
  let bm;
  if (typeof createImageBitmap === 'function') bm = await createImageBitmap(z.quelle);
  else { const u = URL.createObjectURL(z.quelle); const i = new Image(); i.src = u; await i.decode(); bm = i; }
  if (bitmapCache.size > 3) { const [k, v] = bitmapCache.entries().next().value; v.close?.(); bitmapCache.delete(k); }
  bitmapCache.set(z.quelle, bm);
  return bm;
}

/**
 * Einen Takt für die KI (zweiter Durchgang): eng an den Taktstrichen geschnitten, hoch aufgelöst.
 * Links davor (bei Takt > 1 der Zeile) zum Nachschauen Schlüssel und Vorzeichen vom Zeilenanfang, getrennt durch eine Lücke.
 * variante 1 = etwas anderer Rand (zweites, unabhängiges Lesen).
 */
export async function taktFuerKi(z, k, { quinten = 0, variante = 0 } = {}) {
  const bm = await quelleBild(z), r = z.region, g = z.g, tk = z.takte[k];
  const rand = (variante ? 0.9 : 0.5) * g;
  const mx0 = Math.max(0, tk.x0 - r.x - rand), mx1 = Math.min(r.w, tk.x1 - r.x + rand);
  const kopf = k > 0 ? { x0: Math.max(0, z.x0 - r.x - 2.4 * g), x1: Math.min(r.w, z.x0 - r.x + (4.1 + Math.abs(quinten) * 1.0) * g) } : null;
  const luecke = kopf ? 2 * g : 0;
  const cw = (kopf ? kopf.x1 - kopf.x0 : 0) + luecke + (mx1 - mx0);
  const s = Math.min(GRENZEN.taktKante / cw, Math.sqrt(GRENZEN.kiPixel / (cw * r.h)), 4);
  const W = Math.round(cw * s), H = Math.round(r.h * s);
  const c = leinwand(W, H), ctx = ctx2d(c);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = 'high';
  let x = 0;
  if (kopf) {
    ctx.drawImage(bm, kopf.x0, 0, kopf.x1 - kopf.x0, r.h, 0, 0, (kopf.x1 - kopf.x0) * s, H);
    x = (kopf.x1 - kopf.x0 + luecke) * s;
    ctx.fillStyle = '#9aa3b5';
    for (let y = 0; y < H; y += 10) ctx.fillRect(x - luecke * s * 0.5 - 1, y, 2, 5);
  }
  ctx.drawImage(bm, mx0, 0, mx1 - mx0, r.h, x, 0, (mx1 - mx0) * s, H);
  const blob = await alsBlob(c, 'image/png');
  c.width = c.height = 0;
  return { blob, w: W, h: H, mitKopf: !!kopf };
}

/** Takt (oder ganze Zeile mit Rahmen um den Takt) zum Anzeigen in eine Leinwand zeichnen. */
export async function taktZeigen(canvas, z, k, { ganzeZeile = false, breite = 600, dpr = 1 } = {}) {
  const bm = await quelleBild(z), r = z.region, g = z.g;
  const tk = z.takte[k] || { x0: z.x0, x1: z.x1 };
  const x0 = ganzeZeile ? 0 : Math.max(0, tk.x0 - r.x - 1.2 * g), x1 = ganzeZeile ? r.w : Math.min(r.w, tk.x1 - r.x + 1.2 * g);
  const s = Math.min(3, (breite * dpr) / (x1 - x0));
  canvas.width = Math.round((x1 - x0) * s); canvas.height = Math.round(r.h * s);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bm, x0, 0, x1 - x0, r.h, 0, 0, canvas.width, canvas.height);
  if (ganzeZeile && z.takte[k]) {
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = Math.max(2, 3 * s);
    ctx.strokeRect((tk.x0 - r.x) * s, 2, (tk.x1 - tk.x0) * s, canvas.height - 4);
  }
  return { s, x0 };
}
