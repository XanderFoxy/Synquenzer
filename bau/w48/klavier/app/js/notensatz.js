// notensatz.js – zeichnet ein Stück als Klavier-Akkolade (Violin- + Bassschlüssel) in ein <svg>.
// Ohne Schriften/Bibliotheken: alle Zeichen (Schlüssel, Vorzeichen, Pausen, Fähnchen) sind SVG-Pfade.
//
// zeichne(svgEl, stück, { von, bis, farben: Map(noteId→Farbe), markiert: Set(noteId), beiTipp(noteId),
//                         beiTaktTipp?(nr), schleife?: {von, bis}, abstand? (Linienabstand px) })
// noteBox(noteId[, svgEl]) → {x, y, b, h, zeile, takt}  (SVG-Einheiten = CSS-Pixel ab linker oberer Ecke des SVG)
// Schnell ohne Neuzeichnen: faerbe(svgEl, farben), markiere(svgEl, set), positionBei(t[, svgEl]) → {x, y1, y2, zeile}
// setze(stück, {breite, …}) → {svg: Text, layout} – reine Funktion (auch in Node testbar).
import { stufe, tonartVorz, taktDauer } from './modell.js';

const EPS = 1e-6;
const WERTE = [[4, 'whole', 0], [3, 'half', 1], [2, 'half', 0], [1.5, 'quarter', 1], [1, 'quarter', 0], [0.75, 'eighth', 1], [0.5, 'eighth', 0], [0.375, '16th', 1], [0.25, '16th', 0], [0.125, '32nd', 0]];
const FAEHNCHEN = { eighth: 1, '16th': 2, '32nd': 3, '64th': 4 };
const UNTEN = { G: 30, F: 18 }; // Stufe der untersten Linie: G-Schlüssel e1, F-Schlüssel G
const KREUZ_POS = [38, 35, 39, 36, 33, 37, 34];
const BE_POS = [34, 37, 33, 36, 32, 35, 31];
const r1 = (x) => Math.round(x * 10) / 10;

const STIL = `.ns-l{stroke:currentColor;stroke-opacity:.45;stroke-width:1}
.ns-s{stroke:currentColor;fill:none;stroke-linecap:round}
.ns-halo{fill:var(--ns-markiert,#ffb020);opacity:0;transition:opacity .15s ease}
.ns-n.an .ns-halo{opacity:.5}
.ns-n.an .ns-k{transform-box:fill-box;transform-origin:center;transform:scale(1.12)}
.ns-k{transition:transform .15s ease}
.ns-takt,.ns-tipp{fill:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ns-takt.ns-schleife{fill:var(--ns-schleife,#3b82f6);fill-opacity:.12}
.ns-nr{font:600 11px system-ui,-apple-system,sans-serif;fill:currentColor;opacity:.55}
.ns-fi{font:700 10px system-ui,-apple-system,sans-serif;fill:currentColor;opacity:.8}
.ns-z{font:800 21px system-ui,-apple-system,"Helvetica Neue",sans-serif;fill:currentColor}
@media (prefers-reduced-motion:reduce){.ns-halo,.ns-k{transition:none}}`;

function wertVon(d) {
  if (Math.abs(d * 3 - Math.round(d * 3)) < EPS && !WERTE.some((w) => Math.abs(w[0] - d) < EPS)) d *= 1.5; // Triole
  for (const [v, typ, punkte] of WERTE) if (v <= d + EPS) return { typ, punkte };
  return { typ: '32nd', punkte: 0 };
}

// ───────────────────────── Takt vorbereiten ─────────────────────────
function taktVorbereiten(pt, SP, pausenBerechnen) {
  const { tk } = pt;
  const ende = tk.start + (tk.dauer ?? taktDauer(tk));
  const schl = { oben: tk.schluessel?.oben || 'G', unten: tk.schluessel?.unten || 'F' };
  const mitte = (sys) => UNTEN[schl[sys]] + 4;
  const q = tk.tonart?.quinten || 0;

  const akkMap = new Map();
  for (const n of pt.noten) {
    const k = n.system + '|' + n.stimme + '|' + n.t;
    if (!akkMap.has(k)) akkMap.set(k, { system: n.system, stimme: n.stimme, t: n.t, noten: [] });
    akkMap.get(k).noten.push(n);
  }
  const akkorde = [...akkMap.values()].sort((a, b) => a.t - b.t);
  const proStimme = new Map();
  for (const a of akkorde) { const k = a.system + '|' + a.stimme; if (!proStimme.has(k)) proStimme.set(k, []); proStimme.get(k).push(a); }
  for (const liste of proStimme.values()) liste.forEach((a, i) => {
    const minD = Math.min(...a.noten.map((n) => n.dauer));
    const naechste = liste[i + 1]?.t ?? ende;
    a.dauer = Math.max(0.125, Math.min(minD, naechste - a.t, ende - a.t));
    const mitTyp = a.noten.find((n) => n.typ);
    Object.assign(a, mitTyp && Math.abs(a.dauer - minD) < EPS ? { typ: mitTyp.typ, punkte: mitTyp.punkte || 0 } : wertVon(a.dauer));
    a.noten.sort((x, y) => stufe(x.schreibweise) - stufe(y.schreibweise));
    a.stufen = a.noten.map((n) => stufe(n.schreibweise));
  });

  let pausen = pt.pausen.map((p) => ({ ...p, ...(p.typ ? { typ: p.typ, punkte: p.punkte || 0 } : wertVon(p.dauer)) }));
  if (pausenBerechnen) pausen = berechnePausen(akkorde, tk, ende);
  const voll = Math.abs(ende - tk.start - taktDauer(tk)) < EPS; // Auftakt: echte Pausenwerte zeigen
  for (const p of pausen) p.ganz = p.ganzTakt || (voll && Math.abs(p.t - tk.start) < EPS && Math.abs(p.dauer - (ende - tk.start)) < EPS);

  // Stimmen je System → Halsrichtung
  const stimmen = { oben: [], unten: [] };
  for (const e of [...akkorde, ...pausen]) if (!stimmen[e.system].includes(e.stimme)) stimmen[e.system].push(e.stimme);
  stimmen.oben.sort((a, b) => a - b); stimmen.unten.sort((a, b) => a - b);
  const mehr = (sys) => stimmen[sys].length > 1;
  for (const a of akkorde) {
    if (mehr(a.system)) a.hoch = stimmen[a.system].indexOf(a.stimme) === 0;
    else { const m = mitte(a.system); a.hoch = m - a.stufen[0] > a.stufen[a.stufen.length - 1] - m; }
  }
  // Balken-Gruppen je Schlag
  const schlag = tk.taktart[1] === 8 && tk.taktart[0] % 3 === 0 ? 1.5 : tk.taktart[1] === 2 ? 2 : 1;
  const gruppen = [];
  for (const liste of proStimme.values()) {
    let g = [];
    const fertig = () => {
      if (g.length > 1) {
        if (!mehr(g[0].system)) {
          const m = mitte(g[0].system);
          const s = g.reduce((acc, a) => acc + (a.stufen[0] - m) + (a.stufen[a.stufen.length - 1] - m), 0);
          for (const a of g) a.hoch = s < 0;
        }
        for (const a of g) a.gruppe = g;
        gruppen.push(g);
      }
      g = [];
    };
    for (const a of liste) {
      if (!FAEHNCHEN[a.typ]) { fertig(); continue; }
      a.schlag = Math.floor((a.t - tk.start + EPS) / schlag);
      const v = g[g.length - 1];
      if (v && (v.schlag !== a.schlag || v.t + v.dauer < a.t - EPS)) fertig();
      g.push(a);
    }
    fertig();
  }
  // Vorzeichen je System (gelten bis Taktende)
  for (const sys of ['oben', 'unten']) {
    const zust = new Map();
    for (const a of akkorde.filter((x) => x.system === sys)) {
      a.akz = a.noten.map((n) => {
        const sw = n.schreibweise, s = stufe(sw);
        const ist = zust.has(s) ? zust.get(s) : tonartVorz(sw.stamm, q);
        zust.set(s, sw.vorz);
        if (n.bindung?.ende && Math.abs(n.t - tk.start) < EPS) return null;
        return ist === sw.vorz ? null : sw.vorz;
      });
      // Sekunden versetzen
      a.vers = a.noten.map(() => 0);
      if (a.hoch) { for (let i = 1; i < a.stufen.length; i++) if (a.stufen[i] - a.stufen[i - 1] === 1 && !a.vers[i - 1]) a.vers[i] = 1; }
      else { for (let i = a.stufen.length - 2; i >= 0; i--) if (a.stufen[i + 1] - a.stufen[i] === 1 && !a.vers[i + 1]) a.vers[i] = -1; }
      // Vorzeichen-Spalten (von oben nach unten)
      a.akzSp = a.noten.map(() => -1);
      const sp = [];
      for (let i = a.noten.length - 1; i >= 0; i--) {
        if (a.akz[i] == null) continue;
        let c = 0;
        while (sp[c] && sp[c].some((s) => Math.abs(s - a.stufen[i]) < 6)) c++;
        (sp[c] ||= []).push(a.stufen[i]);
        a.akzSp[i] = c;
      }
      a.akzBreite = sp.length;
    }
  }
  // Spalten (Zeitpunkte) und Breiten
  const zeiten = [...new Set([...akkorde.map((a) => a.t), ...pausen.filter((p) => !p.ganz).map((p) => p.t)])].sort((a, b) => a - b);
  if (!zeiten.length) zeiten.push(tk.start);
  let x = SP * 1.1;
  const spalten = zeiten.map((t, i) => {
    const hier = akkorde.filter((a) => Math.abs(a.t - t) < EPS);
    const gap = (zeiten[i + 1] ?? ende) - t;
    const links = Math.max(0, ...hier.map((a) => a.akzBreite)) * SP * 0.95 + (hier.some((a) => a.vers.includes(-1)) ? SP * 1.1 : 0);
    const rechts = (hier.some((a) => a.vers.includes(1)) ? SP * 1.1 : 0) + (hier.some((a) => a.punkte) ? SP * 0.5 : 0);
    x += links;
    const s = { t, x };
    x += SP * (1.25 + 2.1 * Math.pow(Math.max(gap, 0.125), 0.55)) + rechts;
    return s;
  });
  const innen = x + SP * 0.3;
  return { tk, ende, schl, akkorde, pausen, spalten, innen, stimmen, gruppen, q };
}

function berechnePausen(akkorde, tk, ende) {
  const aus = [];
  for (const sys of ['oben', 'unten']) {
    const iv = akkorde.filter((a) => a.system === sys).map((a) => [a.t, a.t + a.dauer]).sort((a, b) => a[0] - b[0]);
    const stimme = sys === 'oben' ? 1 : 5;
    if (!iv.length) { aus.push({ t: tk.start, dauer: ende - tk.start, system: sys, stimme, ganzTakt: true, ...wertVon(Math.min(4, ende - tk.start)) }); continue; }
    let p = tk.start;
    const fuelle = (bis) => {
      while (bis - p > 0.24) {
        let v = [4, 2, 1, 0.5, 0.25].find((w) => p + w <= bis + EPS && Math.abs(((p - tk.start) / w) - Math.round((p - tk.start) / w)) < EPS) || 0.25;
        aus.push({ t: p, dauer: v, system: sys, stimme, ...wertVon(v) });
        p += v;
      }
      p = Math.max(p, bis);
    };
    for (const [a, b] of iv) { if (a > p + EPS) fuelle(a); p = Math.max(p, b); }
    fuelle(ende);
  }
  return aus;
}

// ───────────────────────── Zeichen (Pfade in Linienabstand-Einheiten) ─────────────────────────
const pfad = (d, x, y, SP) => d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (m, a, b) => `${r1(x + a * SP)},${r1(y + b * SP)}`);
const G_SCHL = 'M1.35,3.35 C0.95,3.45 0.7,3.0 1.0,2.65 C1.4,2.25 2.05,2.6 2.0,3.25 C1.95,3.95 1.0,4.15 0.55,3.7 C0.05,3.2 0.2,2.35 0.9,1.75 C1.5,1.25 1.85,0.6 1.75,-0.25 C1.65,-1.05 1.2,-1.25 1.05,-0.6 C0.9,0 1.05,2 1.25,4.2 C1.35,5 1.3,5.5 0.8,5.6 C0.45,5.65 0.3,5.35 0.45,5.15';
const F_SCHL = 'M0.35,1 C0.3,0.25 0.9,-0.05 1.35,0 C2.1,0.05 2.45,0.7 2.3,1.45 C2.1,2.5 1.2,3.3 0.15,3.8';

function schluessel(art, x, top, SP) {
  if (art === 'F') return {
    s: `<path class="ns-s" stroke-width="${r1(SP * 0.3)}" d="${pfad(F_SCHL, x, top, SP)}"/>`,
    f: `<circle cx="${r1(x + 0.38 * SP)}" cy="${r1(top + SP)}" r="${r1(SP * 0.34)}"/><circle cx="${r1(x + 2.8 * SP)}" cy="${r1(top + 0.5 * SP)}" r="${r1(SP * 0.17)}"/><circle cx="${r1(x + 2.8 * SP)}" cy="${r1(top + 1.5 * SP)}" r="${r1(SP * 0.17)}"/>`,
  };
  return {
    s: `<path class="ns-s" stroke-width="${r1(SP * 0.24)}" d="${pfad(G_SCHL, x, top, SP)}"/>`,
    f: `<circle cx="${r1(x + 0.68 * SP)}" cy="${r1(top + 5.25 * SP)}" r="${r1(SP * 0.32)}"/>`,
  };
}

function vorzeichen(v, x, y, SP, farbe) {
  const st = farbe ? ` style="stroke:${farbe}"` : '';
  const l = (x1, y1, x2, y2, w) => `<line class="ns-s"${st} stroke-width="${r1(w * SP)}" x1="${r1(x + x1 * SP)}" y1="${r1(y + y1 * SP)}" x2="${r1(x + x2 * SP)}" y2="${r1(y + y2 * SP)}"/>`;
  if (v === 1) return l(-0.22, -1.35, -0.22, 1.25, 0.1) + l(0.22, -1.25, 0.22, 1.35, 0.1) + l(-0.5, -0.3, 0.5, -0.55, 0.26) + l(-0.5, 0.55, 0.5, 0.3, 0.26);
  if (v === 0) return l(-0.28, -1.35, -0.28, 0.55, 0.1) + l(0.28, -0.55, 0.28, 1.35, 0.1) + l(-0.28, -0.3, 0.28, -0.5, 0.24) + l(-0.28, 0.5, 0.28, 0.3, 0.24);
  if (v === 2) return l(-0.35, -0.35, 0.35, 0.35, 0.2) + l(-0.35, 0.35, 0.35, -0.35, 0.2);
  const be = (dx) => l(dx - 0.3, -1.75, dx - 0.3, 0.5, 0.1) + `<path class="ns-s"${st} stroke-width="${r1(0.2 * SP)}" d="M${r1(x + (dx - 0.3) * SP)},${r1(y + 0.5 * SP)} C${r1(x + (dx + 0.65) * SP)},${r1(y - 0.05 * SP)} ${r1(x + (dx + 0.45) * SP)},${r1(y - 0.85 * SP)} ${r1(x + (dx - 0.3) * SP)},${r1(y - 0.2 * SP)}"/>`;
  if (v === -1) return be(0);
  return be(-0.4) + be(0.4);
}

function pause(typ, x, y, SP) {
  const P = (d, w) => `<path class="ns-s" stroke-width="${r1(w * SP)}" stroke-linejoin="round" d="${pfad(d, x, y, SP)}"/>`;
  const R = (x1, y1, w, h) => `<rect class="ns-f" fill="currentColor" x="${r1(x + x1 * SP)}" y="${r1(y + y1 * SP)}" width="${r1(w * SP)}" height="${r1(h * SP)}"/>`;
  const D = (cx, cy) => `<circle fill="currentColor" cx="${r1(x + cx * SP)}" cy="${r1(y + cy * SP)}" r="${r1(0.24 * SP)}"/>`;
  switch (typ) {
    case 'whole': return R(-0.6, -1, 1.2, 0.5);
    case 'half': return R(-0.6, -0.5, 1.2, 0.5);
    case 'quarter': return P('M-0.15,-1.5 L0.45,-0.75 L-0.15,-0.05 L0.4,0.65 C-0.2,0.35 -0.5,0.85 0.0,1.35', 0.3);
    case 'eighth': return D(-0.3, -0.45) + P('M-0.3,-0.35 C0.0,-0.2 0.3,-0.35 0.5,-0.7 L-0.05,1.0', 0.16);
    default: return D(-0.3, -0.45) + D(-0.55, 0.45) + P('M-0.3,-0.35 C0.0,-0.2 0.3,-0.35 0.5,-0.7 L-0.25,1.75', 0.16) + P('M-0.55,0.55 C-0.25,0.7 0.05,0.55 0.25,0.25', 0.16);
  }
}

const zeitText = (taktart, x, top, SP) => `<text class="ns-z" text-anchor="middle" x="${r1(x)}" y="${r1(top + 1.75 * SP)}" style="font-size:${r1(2.15 * SP)}px">${taktart[0]}</text><text class="ns-z" text-anchor="middle" x="${r1(x)}" y="${r1(top + 3.75 * SP)}" style="font-size:${r1(2.15 * SP)}px">${taktart[1]}</text>`;

// ───────────────────────── Satz ─────────────────────────
export function setze(stück, opts = {}) {
  const B = Math.max(260, Math.round(opts.breite || 800));
  const SP = opts.abstand || (B < 560 ? 9 : 10);
  const RAND = Math.round(SP * 0.8);
  const farben = opts.farben || new Map();
  const markiert = opts.markiert || new Set();
  const takte = stück.takte.filter((t) => (opts.von == null || t.nr >= opts.von) && (opts.bis == null || t.nr <= opts.bis));
  const idx = new Map(takte.map((t, i) => [t.nr, i]));
  const pts = takte.map((tk) => ({ tk, noten: [], pausen: [] }));
  for (const n of stück.noten) { const i = idx.get(n.takt); if (i != null) pts[i].noten.push(n); }
  for (const p of stück.pausen || []) { const i = idx.get(p.takt); if (i != null) pts[i].pausen.push(p); }
  const vt = pts.map((pt) => taktVorbereiten(pt, SP, !stück.pausen));
  const letzteNr = stück.takte[stück.takte.length - 1]?.nr;

  const xL = RAND + SP * 1.4, xR = B - RAND;
  const anzahlVz = (q) => Math.abs(q || 0);
  const zeitWechsel = (i) => i === 0 || vt[i].tk.taktart.join('/') !== vt[i - 1].tk.taktart.join('/');
  const tonWechsel = (i) => i > 0 && vt[i].q !== vt[i - 1].q;
  const kopf = (i) => SP * 4.0 + anzahlVz(vt[i].q) * SP * 0.95 + SP * 0.5 + (zeitWechsel(i) ? SP * 2.6 : 0) + SP * 0.2;
  const vorsatz = (i) => (tonWechsel(i) ? anzahlVz(vt[i].q) * SP * 0.95 + SP * 1.0 : 0) + (zeitWechsel(i) && i > 0 ? SP * 2.8 : 0);

  // Zeilenumbruch
  const zeilen = [];
  for (let i = 0; i < vt.length;) {
    const kw = kopf(i), verf = xR - xL - kw;
    const z = { kw, verf, takte: [], summe: 0 };
    while (i < vt.length) {
      const pre = z.takte.length ? vorsatz(i) : 0;
      const w = vt[i].innen + pre;
      if (z.takte.length && z.summe + w > verf) break;
      z.takte.push({ v: vt[i], i, pre }); z.summe += w; i++;
    }
    zeilen.push(z);
  }

  const H = [], L = [], F = [], N = [], T = [];
  const boxen = new Map(), kopfPos = new Map(), taktBoxen = new Map(), zeitPunkte = [], zeilenInfo = [];
  let y = SP * 0.6;
  zeilen.forEach((z, zi) => {
    const pre = z.takte.reduce((a, t) => a + t.pre, 0);
    const letzte = zi === zeilen.length - 1;
    let f = (z.verf - pre) / Math.max(1, z.summe - pre);
    if (letzte && f > 1.35) f = 1;
    // Höhen aus den Tonumfängen
    let obO = 0, unO = 0, obU = 0, unU = 0, fiO = false, fiU = false;
    for (const { v } of z.takte) for (const a of v.akkorde) {
      const u = UNTEN[v.schl[a.system]], hi = a.stufen[a.stufen.length - 1], lo = a.stufen[0];
      const ob = Math.max(0, hi - (u + 8)) * SP / 2 + (a.hoch && a.typ !== 'whole' ? Math.max(0, hi + 7 - (u + 8)) * SP / 2 : 0);
      const un = Math.max(0, u - lo) * SP / 2 + (!a.hoch && a.typ !== 'whole' ? Math.max(0, u - (lo - 7)) * SP / 2 : 0);
      if (a.system === 'oben') { obO = Math.max(obO, ob); unO = Math.max(unO, un); fiO ||= a.noten.some((n) => n.finger); }
      else { obU = Math.max(obU, ob); unU = Math.max(unU, un); fiU ||= a.noten.some((n) => n.finger); }
    }
    const oberRand = SP * 1.4 + Math.max(SP * 1.2, obO + SP * 0.6) + (fiO ? SP * 1.2 : 0);
    const zwischen = Math.max(SP * 6, unO + obU + SP * 1.6);
    const unterRand = Math.max(SP * 1.6, unU + SP * 0.8) + (fiU ? SP * 2.2 : 0);
    const yO = y + oberRand, yU = yO + SP * 4 + zwischen, yEnde = yU + SP * 4;
    const ySys = { oben: yO, unten: yU };
    const v0 = z.takte[0].v;
    const yStufe = (sys, schl, s) => ySys[sys] + SP * 4 - (s - UNTEN[schl]) * SP / 2;

    // Linien, Klammer, Schlüssel, Vorzeichen, Taktart
    for (const top of [yO, yU]) for (let k = 0; k < 5; k++) L.push(`<line class="ns-l" x1="${r1(xL)}" x2="${r1(xR)}" y1="${r1(top + k * SP)}" y2="${r1(top + k * SP)}"/>`);
    L.push(`<line class="ns-s" stroke-width="1.2" x1="${r1(xL)}" x2="${r1(xL)}" y1="${r1(yO)}" y2="${r1(yEnde)}"/>`);
    const bx = RAND, bh = yEnde - yO, bm = (yO + yEnde) / 2;
    F.push(`<path d="M${r1(bx + SP)},${r1(yO)} C${r1(bx - SP * 0.1)},${r1(yO + bh * 0.08)} ${r1(bx + SP * 0.9)},${r1(bm - bh * 0.18)} ${r1(bx)},${r1(bm)} C${r1(bx + SP * 0.9)},${r1(bm + bh * 0.18)} ${r1(bx - SP * 0.1)},${r1(yEnde - bh * 0.08)} ${r1(bx + SP)},${r1(yEnde)} C${r1(bx + SP * 0.35)},${r1(yEnde - bh * 0.1)} ${r1(bx + SP * 1.35)},${r1(bm + bh * 0.16)} ${r1(bx + SP * 0.25)},${r1(bm)} C${r1(bx + SP * 1.35)},${r1(bm - bh * 0.16)} ${r1(bx + SP * 0.35)},${r1(yO + bh * 0.1)} ${r1(bx + SP)},${r1(yO)} Z"/>`);
    const tonartZeichnen = (q, x0) => {
      for (const sys of ['oben', 'unten']) {
        const schl = v0.schl[sys], verschub = schl === 'F' ? -14 : 0;
        const pos = q > 0 ? KREUZ_POS : BE_POS;
        for (let k = 0; k < anzahlVz(q); k++) L.push(vorzeichen(q > 0 ? 1 : -1, x0 + k * SP * 0.95 + SP * 0.45, yStufe(sys, schl, pos[k] + verschub), SP));
      }
    };
    for (const sys of ['oben', 'unten']) { const s = schluessel(v0.schl[sys], xL + SP * 0.5, ySys[sys], SP); L.push(s.s); F.push(s.f); }
    tonartZeichnen(v0.q, xL + SP * 3.8);
    if (zeitWechsel(z.takte[0].i)) for (const sys of ['oben', 'unten']) F.push(zeitText(v0.tk.taktart, xL + z.kw - SP * 1.6, ySys[sys], SP));
    if (v0.tk.nr > 1 || zi > 0) F.push(`<text class="ns-nr" x="${r1(xL)}" y="${r1(yO - SP * 1.3)}">${v0.tk.nr}</text>`);

    let mx = xL + z.kw;
    for (const { v, i, pre } of z.takte) {
      const mw = pre + v.innen * f;
      const tk = v.tk;
      const inSchleife = opts.schleife && tk.nr >= opts.schleife.von && tk.nr <= opts.schleife.bis;
      H.push(`<rect class="ns-takt${inSchleife ? ' ns-schleife' : ''}" data-takt="${tk.nr}" x="${r1(mx)}" y="${r1(yO - SP * 1.5)}" width="${r1(mw)}" height="${r1(yEnde - yO + SP * 3)}"/>`);
      taktBoxen.set(tk.nr, { x: mx, y: yO - SP * 1.5, b: mw, h: yEnde - yO + SP * 3, zeile: zi });
      if (pre) {
        let px = mx + SP * 0.3;
        if (tonWechsel(i)) { tonartZeichnen(v.q, px); px += anzahlVz(v.q) * SP * 0.95 + SP * 0.7; }
        if (zeitWechsel(i)) for (const sys of ['oben', 'unten']) F.push(zeitText(tk.taktart, px + SP * 1.1, ySys[sys], SP));
      }
      const cx = mx + pre;
      const spX = new Map(v.spalten.map((s) => [s.t, cx + s.x * f]));
      for (const s of v.spalten) zeitPunkte.push({ t: s.t, x: cx + s.x * f, zeile: zi });
      const yN = (sys, s) => yStufe(sys, v.schl[sys], s);
      const kb = SP * 1.18; // Notenkopf-Breite

      // Akkorde
      for (const a of v.akkorde) {
        const xh = spX.get(a.t) ?? cx + SP;
        const u = UNTEN[v.schl[a.system]];
        const hohl = a.typ === 'whole' || a.typ === 'half';
        const hatRechts = a.vers.includes(1), hatLinks = a.vers.includes(-1);
        // Hilfslinien
        const lo = a.stufen[0], hi = a.stufen[a.stufen.length - 1];
        const hx1 = xh - kb * 0.5 - SP * 0.35 - (hatLinks ? kb : 0), hx2 = xh + kb * 0.5 + SP * 0.35 + (hatRechts ? kb : 0);
        for (let s = u + 10; s <= hi; s += 2) L.push(`<line class="ns-s" stroke-width="1.1" x1="${r1(hx1)}" x2="${r1(hx2)}" y1="${r1(yN(a.system, s))}" y2="${r1(yN(a.system, s))}"/>`);
        for (let s = u - 2; s >= lo; s -= 2) L.push(`<line class="ns-s" stroke-width="1.1" x1="${r1(hx1)}" x2="${r1(hx2)}" y1="${r1(yN(a.system, s))}" y2="${r1(yN(a.system, s))}"/>`);
        // Köpfe, Vorzeichen, Punkte, Finger
        a.noten.forEach((n, k) => {
          const yy = yN(a.system, a.stufen[k]);
          const xk = xh + a.vers[k] * kb * 0.96;
          const farbe = farben.get(n.id);
          const kopfStil = hohl ? `fill:${farbe || 'currentColor'};fill-opacity:${farbe ? 0.28 : 0};stroke:${farbe || 'currentColor'};stroke-width:${r1(SP * 0.2)}` : farbe ? `fill:${farbe}` : '';
          const rx = hohl ? SP * 0.5 : SP * 0.6, ry = hohl ? SP * 0.36 : SP * 0.42;
          let g = `<g class="ns-n${markiert.has(n.id) ? ' an' : ''}" data-id="${n.id}"><circle class="ns-halo" cx="${r1(xk)}" cy="${r1(yy)}" r="${r1(SP * 1.05)}"/>`;
          g += `<ellipse class="ns-k" fill="currentColor" cx="${r1(xk)}" cy="${r1(yy)}" rx="${r1(rx)}" ry="${r1(ry)}" transform="rotate(-20 ${r1(xk)} ${r1(yy)})"${kopfStil ? ` style="${kopfStil}"` : ''}/>`;
          if (a.akz[k] != null) {
            const ax = xh - kb * 0.5 - (hatLinks ? kb : 0) - SP * 0.2 - (a.akzSp[k] + 0.5) * SP * 0.95;
            g += `<g class="ns-v">${vorzeichen(a.akz[k], ax, yy, SP, farbe)}</g>`;
          }
          g += '</g>';
          N.push(g);
          for (let p = 0; p < (a.punkte || 0); p++) {
            const aufLinie = (a.stufen[k] - u) % 2 === 0;
            F.push(`<circle cx="${r1(xh + kb * 0.5 + (hatRechts ? kb : 0) + SP * (0.45 + p * 0.5))}" cy="${r1(yy - (aufLinie ? SP / 2 : 0))}" r="${r1(SP * 0.17)}"/>`);
          }
          T.push(`<rect class="ns-tipp" data-id="${n.id}" x="${r1(xk - SP * 1.15)}" y="${r1(yy - SP * 1.1)}" width="${r1(SP * 2.3)}" height="${r1(SP * 2.2)}"/>`);
          boxen.set(n.id, { x: xk - kb / 2, y: yy - SP / 2, b: kb, h: SP, zeile: zi, takt: tk.nr });
          kopfPos.set(n.id, { x: xk, y: yy, zeile: zi, hoch: a.hoch, sys: a.system });
        });
        // Hals
        if (a.typ !== 'whole') {
          const yLo = yN(a.system, lo), yHi = yN(a.system, hi), yMitte = ySys[a.system] + SP * 2;
          const extra = Math.max(0, (FAEHNCHEN[a.typ] || 0) - 1) * SP * 0.6;
          a.hx = a.hoch ? xh + kb * 0.5 - 0.6 : xh - kb * 0.5 + 0.6;
          a.hy1 = a.hoch ? yLo : yHi;
          a.hy2 = a.hoch ? Math.min(yHi - SP * 3.4 - extra, yMitte) : Math.max(yLo + SP * 3.4 + extra, yMitte);
          a.yFern = a.hoch ? yHi : yLo;
        }
      }
      // Balken
      for (const g of v.gruppen) {
        const hoch = g[0].hoch, s0 = g[0], s1 = g[g.length - 1];
        let neig = (s1.hy2 - s0.hy2) / Math.max(1, s1.hx - s0.hx);
        neig = Math.max(-0.22, Math.min(0.22, neig));
        const yB = (x) => s0.hy2 + neig * (x - s0.hx);
        let schub = 0;
        for (const a of g) {
          const minL = SP * (2.6 + 0.6 * ((FAEHNCHEN[a.typ] || 1) - 1));
          const d = hoch ? (a.yFern - minL) - yB(a.hx) : (a.yFern + minL) - yB(a.hx);
          schub = hoch ? Math.min(schub, d) : Math.max(schub, d);
        }
        const yBeam = (x) => yB(x) + schub;
        for (const a of g) a.hy2 = yBeam(a.hx);
        const dick = SP * 0.48, dir = hoch ? 1 : -1;
        const balken = (xa, xb, ebene) => {
          const o = ebene * SP * 0.78 * dir;
          const ya = yBeam(xa) + o, yb = yBeam(xb) + o, d2 = dick * dir;
          F.push(`<path d="M${r1(xa)},${r1(ya)} L${r1(xb)},${r1(yb)} L${r1(xb)},${r1(yb + d2)} L${r1(xa)},${r1(ya + d2)} Z"/>`);
        };
        balken(s0.hx, s1.hx, 0);
        const maxE = Math.max(...g.map((a) => FAEHNCHEN[a.typ] || 1));
        for (let e = 2; e <= maxE; e++) {
          for (let k = 0; k < g.length; k++) {
            const hat = (j) => g[j] && (FAEHNCHEN[g[j].typ] || 1) >= e;
            if (!hat(k)) continue;
            if (hat(k + 1)) balken(g[k].hx, g[k + 1].hx, e - 1);
            else if (!hat(k - 1)) { const lang = SP * 1.1 * (k === 0 ? 1 : -1); balken(Math.min(g[k].hx, g[k].hx + lang), Math.max(g[k].hx, g[k].hx + lang), e - 1); }
          }
        }
      }
      // Hälse + Fähnchen
      for (const a of v.akkorde) {
        if (a.hx == null) continue;
        L.push(`<line class="ns-s" stroke-width="${r1(SP * 0.12)}" x1="${r1(a.hx)}" x2="${r1(a.hx)}" y1="${r1(a.hy1)}" y2="${r1(a.hy2)}"/>`);
        const fl = FAEHNCHEN[a.typ] || 0;
        if (fl && !a.gruppe) for (let k = 0; k < fl; k++) {
          const s = a.hoch ? 1 : -1, y0 = a.hy2 + s * k * SP * 0.8;
          F.push(`<path d="${pfad(`M0,0 C0.1,${0.9 * s} 1.25,${1.3 * s} 1.05,${2.7 * s} C1.0,${1.75 * s} 0.55,${1.25 * s} 0,${1.15 * s} Z`, a.hx, y0, SP)}"/>`);
        }
      }
      // Fingersätze: je Takt und System auf einer gemeinsamen Linie (unten unter Hälse/Balken, oben darüber)
      for (const sys of ['oben', 'unten']) {
        const mitF = v.akkorde.filter((a) => a.system === sys && a.noten.some((n) => n.finger != null));
        if (!mitF.length) continue;
        let basis = sys === 'unten' ? ySys.unten + SP * 5.6 : ySys.oben - SP * 1.4;
        for (const a of mitF) {
          const yLo = yN(sys, a.stufen[0]), yHi = yN(sys, a.stufen[a.stufen.length - 1]);
          if (sys === 'unten') basis = Math.max(basis, yLo + SP * 1.9, a.hx != null && !a.hoch ? a.hy2 + SP * 1.5 : 0);
          else basis = Math.min(basis, yHi - SP * 1.3, a.hx != null && a.hoch ? a.hy2 - SP * 0.7 : Infinity);
        }
        for (const a of mitF) {
          const xh = spX.get(a.t) ?? cx + SP;
          const fi = a.noten.map((n) => n.finger).filter((x) => x != null).reverse(); // oben zuerst
          fi.forEach((z, k) => F.push(`<text class="ns-fi" text-anchor="middle" x="${r1(xh)}" y="${r1(sys === 'unten' ? basis + k * SP * 1.05 : basis - (fi.length - 1 - k) * SP * 1.05)}">${z}</text>`));
        }
      }
      // Pausen
      for (const p of v.pausen) {
        const mehrere = v.stimmen[p.system].length > 1;
        const rang = mehrere ? (v.stimmen[p.system].indexOf(p.stimme) === 0 ? -1 : 1) : 0;
        let yy = ySys[p.system] + SP * 2;
        if (rang) {
          const andere = v.akkorde.filter((a) => a.system === p.system && a.stimme !== p.stimme && a.t < p.t + p.dauer - EPS && a.t + a.dauer > p.t + EPS);
          yy += rang * SP * (p.typ === 'whole' || p.typ === 'half' ? 1 : 2);
          for (const a of andere) {
            if (rang < 0) yy = Math.min(yy, yN(p.system, a.stufen[a.stufen.length - 1]) - SP * 2.2);
            else yy = Math.max(yy, yN(p.system, a.stufen[0]) + SP * 2.2);
          }
        }
        const xp = p.ganz ? cx + (v.innen * f) / 2 : (spX.get(p.t) ?? cx + SP);
        F.push(pause(p.ganz ? 'whole' : p.typ, xp, yy, SP));
        if (!p.ganz) for (let k = 0; k < (p.punkte || 0); k++) F.push(`<circle cx="${r1(xp + SP * 0.9)}" cy="${r1(yy - SP * 0.5)}" r="${r1(SP * 0.17)}"/>`);
      }
      // Taktstrich
      const xe = mx + mw;
      if (tk.nr === letzteNr && i === vt.length - 1) {
        L.push(`<line class="ns-s" stroke-width="1.1" x1="${r1(xe - SP * 0.75)}" x2="${r1(xe - SP * 0.75)}" y1="${r1(yO)}" y2="${r1(yEnde)}"/>`);
        F.push(`<rect x="${r1(xe - SP * 0.45)}" y="${r1(yO)}" width="${r1(SP * 0.45)}" height="${r1(yEnde - yO)}"/>`);
      } else L.push(`<line class="ns-s" stroke-width="1.1" x1="${r1(xe)}" x2="${r1(xe)}" y1="${r1(yO)}" y2="${r1(yEnde)}"/>`);
      mx = xe;
    }
    zeilenInfo.push({ y, yO, yU, yEnde, hoehe: yEnde + unterRand - y, vonTakt: v0.tk.nr, bisTakt: z.takte[z.takte.length - 1].v.tk.nr, xStart: xL + z.kw, xEnde: mx });
    y = yEnde + unterRand + SP * 0.8;
  });

  // Haltebögen
  const ziel = new Map();
  for (const n of stück.noten) if (n.bindung?.ende) ziel.set(`${n.system}|${n.midi}|${Math.round(n.t * 960)}`, n.id);
  const bogen = (x1, x2, yy, s) => {
    const h = Math.min(SP * 1.1, SP * 0.35 + (x2 - x1) * 0.08) * s, mxB = (x1 + x2) / 2, y0 = yy + s * SP * 0.6;
    F.push(`<path d="M${r1(x1)},${r1(y0)} Q${r1(mxB)},${r1(y0 + h * 1.5)} ${r1(x2)},${r1(y0)} Q${r1(mxB)},${r1(y0 + h * 1.15)} ${r1(x1)},${r1(y0)} Z"/>`);
  };
  for (const n of stück.noten) {
    if (!n.bindung?.start) continue;
    const a = kopfPos.get(n.id);
    if (!a) continue;
    const zid = ziel.get(`${n.system}|${n.midi}|${Math.round((n.t + n.dauer) * 960)}`);
    const b = zid && kopfPos.get(zid);
    const s = a.hoch ? 1 : -1;
    if (b && b.zeile === a.zeile) bogen(a.x + SP * 0.55, b.x - SP * 0.55, a.y, s);
    else {
      bogen(a.x + SP * 0.55, zeilenInfo[a.zeile].xEnde - SP * 0.3, a.y, s);
      if (b) bogen(zeilenInfo[b.zeile].xStart - SP * 1.2, b.x - SP * 0.55, b.y, b.hoch ? 1 : -1);
    }
  }

  const hoehe = Math.ceil(y + SP * 0.2);
  const svg = `<style>${STIL}</style><g class="ns-hg">${H.join('')}</g><g class="ns-lin">${L.join('')}</g><g fill="currentColor">${F.join('')}</g><g class="ns-noten">${N.join('')}</g><g class="ns-tipps">${T.join('')}</g>`;
  return { svg, layout: { breite: B, hoehe, SP, boxen, taktBoxen, zeitPunkte, zeilen: zeilenInfo } };
}

// ───────────────────────── Browser-Anbindung ─────────────────────────
const zustand = new WeakMap();
let letztes = null;

function breiteVon(svgEl) {
  const el = svgEl.parentElement;
  if (el) {
    const cs = getComputedStyle(el);
    const w = el.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
    if (w > 0) return w;
  }
  return svgEl.getBoundingClientRect().width || 800;
}

export function zeichne(svgEl, stück, opts = {}) {
  const breite = opts.breite || breiteVon(svgEl);
  const { svg, layout } = setze(stück, { ...opts, breite });
  svgEl.setAttribute('viewBox', `0 0 ${layout.breite} ${layout.hoehe}`);
  svgEl.setAttribute('width', layout.breite);
  svgEl.setAttribute('height', layout.hoehe);
  svgEl.style.maxWidth = '100%';
  svgEl.style.display = 'block';
  svgEl.classList.add('ns');
  svgEl.innerHTML = svg;
  let z = zustand.get(svgEl);
  if (!z) {
    z = {};
    zustand.set(svgEl, z);
    svgEl.addEventListener('click', (ev) => {
      const zz = zustand.get(svgEl);
      const n = ev.target.closest?.('[data-id]');
      if (n && zz.opts.beiTipp) return zz.opts.beiTipp(n.getAttribute('data-id'), ev);
      const t = ev.target.closest?.('[data-takt]');
      if (t && zz.opts.beiTaktTipp) zz.opts.beiTaktTipp(+t.getAttribute('data-takt'), ev);
    });
    if (typeof ResizeObserver !== 'undefined' && svgEl.parentElement) {
      let raf = 0;
      new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const zz = zustand.get(svgEl);
          if (!zz.opts.breite && Math.abs(breiteVon(svgEl) - zz.layout.breite) > 8) zeichne(svgEl, zz.stück, zz.opts);
        });
      }).observe(svgEl.parentElement);
    }
  }
  Object.assign(z, { stück, opts, layout, an: new Set(opts.markiert || []) });
  letztes = z;
  return layout;
}

const zu = (svgEl) => (svgEl ? zustand.get(svgEl) : letztes);

export function noteBox(noteId, svgEl) {
  return zu(svgEl)?.layout.boxen.get(noteId) || null;
}
export function taktBox(nr, svgEl) {
  return zu(svgEl)?.layout.taktBoxen.get(nr) || null;
}

/** Farben ändern ohne Neuzeichnen (Map noteId → Farbe; fehlende = schwarz). */
export function faerbe(svgEl, farben = new Map()) {
  const z = zu(svgEl);
  if (!z) return;
  z.opts = { ...z.opts, farben };
  for (const g of svgEl.querySelectorAll('.ns-n')) {
    const farbe = farben.get(g.getAttribute('data-id'));
    const k = g.querySelector('.ns-k');
    const hohl = k.style.fillOpacity !== '' || k.style.stroke;
    if (hohl) { k.style.fill = farbe || 'currentColor'; k.style.fillOpacity = farbe ? 0.28 : 0; k.style.stroke = farbe || 'currentColor'; }
    else k.style.fill = farbe || '';
    for (const s of g.querySelectorAll('.ns-v .ns-s')) s.style.stroke = farbe || '';
  }
}

/** Markierung (z. B. gerade klingende Noten) ohne Neuzeichnen setzen – berührt nur geänderte Noten. */
export function markiere(svgEl, set = new Set()) {
  const z = zu(svgEl);
  if (!z) return;
  for (const id of z.an) if (!set.has(id)) svgEl.querySelector(`.ns-n[data-id="${id}"]`)?.classList.remove('an');
  for (const id of set) if (!z.an.has(id)) svgEl.querySelector(`.ns-n[data-id="${id}"]`)?.classList.add('an');
  z.an = new Set(set);
  z.opts = { ...z.opts, markiert: z.an };
}

/** Wiedergabe-Zeiger: x-Position zur Zeit t (Viertel). */
export function positionBei(t, svgEl) {
  const z = zu(svgEl);
  if (!z) return null;
  const P = z.layout.zeitPunkte;
  if (!P.length) return null;
  let i = 0;
  while (i + 1 < P.length && P[i + 1].t <= t + EPS) i++;
  const a = P[i], b = P[i + 1];
  let x = a.x;
  if (b && b.zeile === a.zeile && t > a.t) x = a.x + ((t - a.t) / (b.t - a.t)) * (b.x - a.x);
  const zl = z.layout.zeilen[a.zeile];
  return { x, y1: zl.yO - z.layout.SP, y2: zl.yEnde + z.layout.SP, zeile: a.zeile };
}
