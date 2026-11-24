// Werkstatt 3 – ui.js
// Oberfläche: Datei laden, „Automatisch fertig machen“, Pianorolle = Warp-Fenster, Versions-Zwiebel, Export.
// Alles lokal im Browser – die Datei verlässt nie das Gerät.

import * as io from './io.js';
import * as verlauf from './verlauf.js';

const $ = (id) => document.getElementById(id);
const klemm = (v, a, b) => (v < a ? a : v > b ? b : v);
const NAMEN = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'];
const notenName = (m) => NAMEN[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1);
const fmtZeit = (s) => { s = Math.max(0, s || 0); const m = Math.floor(s / 60); return m + ':' + (s - m * 60).toFixed(3).padStart(6, '0'); };
const uhr = (ms) => new Date(ms).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const minus = (v) => (v < 0 ? '−' : '+') + Math.abs(v);

// ---------------------------------------------------------------- Einstellungen

const STD = { bpm: 120, taktart: '4/4', versatz: 0, teilung: '1/16', skala: 'chromatisch', grundton: 0, timing: 100, ton: 100,
  rein: { klicks: true, brumm: true, rauschen: true, schmatzer: true, atmer: true, ausgleich: true } };
let E = JSON.parse(JSON.stringify(STD));
try { const s = JSON.parse(localStorage.getItem('w3-einst') || 'null'); if (s) E = Object.assign(E, s, { rein: Object.assign({}, STD.rein, s.rein) }); } catch (e) { /* ohne Speicher */ }
const einstSichern = () => { try { localStorage.setItem('w3-einst', JSON.stringify(E)); } catch (e) { /* egal */ } };

function takt() { const [z, n] = E.taktart.split('/').map(Number); const schlag = 60 / E.bpm * 4 / n; return { z, n, schlag, takt: schlag * z }; }
function rasterG() { if (E.teilung === 'frei') return 0; const t = +E.teilung.split('/')[1]; return 60 / E.bpm * 4 / t; }
function position(t) {
  const { z, schlag } = takt(), s = (t - E.versatz) / schlag, tk = Math.floor(s / z), sch = Math.floor(s - tk * z + 1e-6);
  const g = rasterG(), teil = g > 0 ? Math.floor((s - tk * z - sch) * schlag / g + 1e-6) : 0;
  return (tk + 1) + '.' + (sch + 1) + (g > 0 && schlag / g > 1 ? '.' + (teil + 1) : '');
}
const naechsteLinie = (t) => { const g = rasterG(); return g > 0 ? E.versatz + Math.round((t - E.versatz) / g) * g : t; };

// ---------------------------------------------------------------- Zustand

const Z = { name: '', v: null, sicht: { t0: 0, pps: 60, m0: 76, pph: 16 }, wahl: -1, auswahl: null, kopf: 0,
  fein: false, schleife: false, metro: false, beschaeftigt: false, zug: null, fehlt: [] };
const noten = () => (Z.v && Z.v.noten) || [];

// ---------------------------------------------------------------- Rechen-Arbeiter (Module-Worker, sonst Hauptfaden)

let w, wNr = 0, wBereit = null;
const offen = new Map();
function arbeiterStart() {
  try {
    w = new Worker(new URL('./arbeiter.js', import.meta.url), { type: 'module' });
    w.onmessage = (e) => {
      const d = e.data || {}, o = offen.get(d.id);
      if (!o) return;
      if (d.typ === 'stand') { if (o.stand) o.stand(d.schritt, d.prozent); return; }
      offen.delete(d.id);
      if (d.typ === 'fehler') o.nein(new Error(d.text)); else o.ja(d);
    };
    w.onerror = (e) => { if (e && e.preventDefault) e.preventDefault(); w = null; const alle = [...offen.values()]; offen.clear(); for (const o of alle) o.ersatz(); };
  } catch (e) { w = null; }
  wBereit = new Promise((ok) => {
    if (!w) return ok(false);
    const t = setTimeout(() => { w = null; ok(false); }, 8000);
    const id = ++wNr;
    offen.set(id, { ja: (d) => { clearTimeout(t); Z.fehlt = d.fehlt || []; ok(true); }, nein: () => { clearTimeout(t); ok(false); }, ersatz: () => { clearTimeout(t); ok(false); } });
    w.postMessage({ typ: 'module', id });
  });
}
async function rufen(msg, transfer = [], stand = null) {
  await wBereit;
  return new Promise((ja, nein) => {
    const ersatz = () => import('./arbeiter.js').then((m) => m.bearbeiten(msg, (s, p) => stand && stand(s, Math.round(p)))).then(ja, nein);
    if (!w) { ersatz(); return; }
    const id = ++wNr;
    offen.set(id, { ja, nein, stand, ersatz: () => nein(new Error('Rechen-Arbeiter ist ausgefallen – bitte nochmal')) });
    w.postMessage(Object.assign({}, msg, { id }), transfer);
  });
}

// ---------------------------------------------------------------- Bühne: Pianorolle + Warp

const buehne = $('buehne'), cv = $('rolle'), cu = $('ueber');
let g = null, gu = null, W = 0, H = 0, dpr = 1;
const K = 44, R = 30, B = 40;
let F = {};
function farben() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n, d) => (cs.getPropertyValue(n) || '').trim() || d;
  F = { bg: v('--rolle-grund', v('--bg', '#fff')), zeile: v('--rolle-zeile', v('--band1', '#f4f1eb')), zeileD: v('--rolle-zeile-dunkel', v('--band2', '#ebe7df')),
    fein: v('--raster-fein', v('--lin', '#e7e3db')), raster: v('--raster', v('--lin2', '#cfc9be')), takt: v('--taktstrich', v('--mut', '#857f75')),
    lineal: v('--lineal', v('--band1', '#f4f1eb')), linealText: v('--lineal-text', v('--mut', '#857f75')), tasten: v('--tasten', v('--band2', '#ebe7df')),
    tastenText: v('--tasten-text', v('--mut', '#857f75')), note: v('--note', v('--c-neu', '#3b4652')), wahl: v('--note-gewaehlt', v('--gold', '#a87908')),
    ton: v('--tonlinie', v('--rot', '#b03a2e')), kopf: v('--spielkopf', v('--gold', '#a87908')), welle: v('--welle', '#4f5b67'),
    bereich: v('--bereich', 'rgba(168,121,8,.13)'), ok: v('--ok', '#2b7a4b'), warn: v('--warn', '#b25d12'), fg: v('--fg', '#1d1c1a'), mut: v('--mut', '#857f75'),
    gold: v('--gold', '#a87908'), lin: v('--lin', '#e7e3db') };
}
const xOf = (t) => K + (t - Z.sicht.t0) * Z.sicht.pps;
const tOf = (x) => Z.sicht.t0 + (x - K) / Z.sicht.pps;
const yOf = (m) => R + (Z.sicht.m0 - m) * Z.sicht.pph;

function groesse() {
  const r = buehne.getBoundingClientRect();
  if (!r.width || !r.height) return;
  dpr = Math.min(3, window.devicePixelRatio || 1); W = Math.round(r.width); H = Math.round(r.height);
  for (const c of [cv, cu]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  g = cv.getContext('2d'); gu = cu.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0); gu.setTransform(dpr, 0, 0, dpr, 0, 0);
  begrenzen(); zeichnen(); kopfZeichnen();
}
let rafZ = 0;
function neu() { if (!rafZ) rafZ = requestAnimationFrame(() => { rafZ = 0; zeichnen(); kopfZeichnen(); }); }

function begrenzen() {
  const s = Z.sicht, dur = Z.v ? Z.v.dauer : 10, breite = Math.max(1, W - K);
  s.pps = klemm(s.pps, breite / (dur + 1), 3000);
  const sicht = breite / s.pps;
  s.t0 = klemm(s.t0, -0.5, Math.max(-0.5, dur + 0.5 - sicht));
  s.pph = klemm(s.pph, 5, 44);
  const zeilen = (H - R - B) / s.pph;
  s.m0 = klemm(s.m0, 24 + zeilen, 108);
}

let wcache = { key: '', d: null };
function spalten() {
  const v = Z.v, s = Z.sicht, n = Math.max(1, W - K);
  const key = v.id + '|' + s.t0.toFixed(5) + '|' + s.pps.toFixed(4) + '|' + n + '|' + (v.x ? 1 : 0);
  if (wcache.key === key) return wcache.d;
  const t1 = s.t0 + n / s.pps;
  let d;
  if (v.x && t1 - s.t0 < 120) d = io.spitzenFenster(v.x, v.sr, s.t0, t1, n);
  else {
    d = new Float32Array(2 * n);
    const sp = v.spitzen, ps = v.spitzenProSek || 100;
    if (sp) for (let i = 0; i < n; i++) {
      const a = Math.floor((s.t0 + i / s.pps) * ps), b = Math.max(a + 1, Math.floor((s.t0 + (i + 1) / s.pps) * ps));
      let lo = 0, hi = 0;
      for (let j = Math.max(0, a); j < b && 2 * j + 1 < sp.length; j++) { if (sp[2 * j] < lo) lo = sp[2 * j]; if (sp[2 * j + 1] > hi) hi = sp[2 * j + 1]; }
      d[2 * i] = lo; d[2 * i + 1] = hi;
    }
  }
  wcache = { key, d };
  return d;
}
function vMax(v) {
  if (v._max) return v._max;
  let m = 1e-4; const sp = v.spitzen;
  if (sp) for (let i = 0; i < sp.length; i++) { const a = Math.abs(sp[i]); if (a > m) m = a; }
  v._max = m; return m;
}

function zeichnen() {
  if (!g || !W) return;
  const s = Z.sicht, v = Z.v;
  g.fillStyle = F.bg; g.fillRect(0, 0, W, H);
  if (!v) return;
  const yBot = H - B;
  // Halbton-Zeilen
  const mHi = s.m0, mLo = s.m0 - (yBot - R) / s.pph;
  g.save(); g.beginPath(); g.rect(K, R, W - K, yBot - R); g.clip();
  for (let n = Math.floor(mLo) - 1; n <= Math.ceil(mHi) + 1; n++) {
    const y = yOf(n + 0.5), sw = [1, 3, 6, 8, 10].includes(((n % 12) + 12) % 12);
    g.fillStyle = sw ? F.zeileD : F.zeile; g.fillRect(K, y, W - K, s.pph);
    if (((n % 12) + 12) % 12 === 0) { g.fillStyle = F.raster; g.fillRect(K, Math.round(y + s.pph) - 0.5, W - K, 1); }
  }
  g.restore();
  // Auswahl
  if (Z.auswahl) {
    const a = xOf(Z.auswahl.a), b = xOf(Z.auswahl.b);
    g.fillStyle = F.bereich; g.fillRect(Math.max(K, a), 0, Math.max(0, Math.min(W, b) - Math.max(K, a)), H);
  }
  // Raster: fein, Schläge, Takte (Taktstriche kräftiger)
  const tA = tOf(K), tB = tOf(W), { z, schlag, takt: tk } = takt(), gr = rasterG(), off = E.versatz;
  const linien = (step, farbe, breite, oben) => {
    if (!(step > 0)) return;
    g.fillStyle = farbe;
    for (let k = Math.ceil((tA - off) / step); off + k * step <= tB; k++) g.fillRect(Math.round(xOf(off + k * step)) - breite / 2, oben, breite, H - oben);
  };
  if (gr > 0 && gr * s.pps >= 7 && Math.abs(gr - schlag) > 1e-9) linien(gr, F.fein, 1, R);
  if (schlag * s.pps >= 5) linien(schlag, F.raster, 1, R);
  let tstep = tk; while (tstep * s.pps < 8) tstep *= 2;
  linien(tstep, F.takt, 1.6, R - 10);
  // Welle unten
  const d = spalten(), mx = vMax(v), yW = yBot + B / 2;
  g.fillStyle = F.zeile; g.fillRect(K, yBot, W - K, B);
  g.fillStyle = F.welle; g.globalAlpha = 0.75;
  for (let i = 0; i < W - K; i++) {
    const lo = d[2 * i] / mx, hi = d[2 * i + 1] / mx;
    const a = yW - hi * (B / 2 - 2), b = yW - lo * (B / 2 - 2);
    g.fillRect(K + i, a, 1, Math.max(1, b - a));
  }
  g.globalAlpha = 1;
  // Noten
  g.save(); g.beginPath(); g.rect(K, R, W - K, yBot - R); g.clip();
  const N = noten(), zug = Z.zug;
  for (let i = 0; i < N.length; i++) {
    const n = N[i];
    if (n.t1 < tA - 1 || n.t0 > tB + 1) continue;
    if (zug && zug.i === i) { blob(n, i, 0, 0, d, mx, 'geist'); continue; }
    blob(n, i, 0, 0, d, mx, i === Z.wahl ? 'wahl' : '');
  }
  if (zug) {
    const n = N[zug.i];
    if (zug.dt) { const x = xOf((n.peak ?? n.t0) + zug.dt); g.fillStyle = F.gold; g.fillRect(Math.round(x) - 1, R, 2, yBot - R); }
    blob(n, zug.i, zug.dt, zug.dm, d, mx, 'zug');
  }
  g.restore();
  // Lineal
  g.fillStyle = F.lineal; g.fillRect(K, 0, W - K, R);
  g.fillStyle = F.raster; g.fillRect(K, R - 1, W - K, 1);
  g.font = '600 11px -apple-system,system-ui,sans-serif'; g.textBaseline = 'middle';
  let lstep = tk; while (lstep * s.pps < 30) lstep *= 2;
  for (let k = Math.ceil((tA - off) / lstep); off + k * lstep <= tB; k++) {
    const t = off + k * lstep, x = xOf(t);
    g.fillStyle = F.takt; g.fillRect(Math.round(x) - 0.8, 12, 1.6, R - 12);
    g.fillStyle = F.linealText; g.fillText(String(Math.round((t - off) / tk) + 1), x + 3, 9);
  }
  if (schlag * s.pps >= 10) { g.fillStyle = F.raster; for (let k = Math.ceil((tA - off) / schlag); off + k * schlag <= tB; k++) g.fillRect(Math.round(xOf(off + k * schlag)), R - 7, 1, 6); }
  // Spitzen-Marken: grün = auf dem Strich, orange = daneben
  for (let i = 0; i < N.length; i++) {
    const n = N[i]; if (n.peak == null || n.peak < tA || n.peak > tB) continue;
    const x = xOf(n.peak), auf = gr > 0 && Math.abs(n.peak - naechsteLinie(n.peak)) < 0.003;
    g.fillStyle = auf ? F.ok : F.warn;
    g.beginPath(); g.moveTo(x - 4, R - 8); g.lineTo(x + 4, R - 8); g.lineTo(x, R - 1); g.closePath(); g.fill();
  }
  if (Z.auswahl) { g.fillStyle = F.gold; const a = xOf(Z.auswahl.a), b = xOf(Z.auswahl.b); g.fillRect(Math.max(K, a), 0, Math.max(0, Math.min(W, b) - Math.max(K, a)), 3); }
  // Tasten
  g.fillStyle = F.tasten; g.fillRect(0, 0, K, H);
  g.save(); g.beginPath(); g.rect(0, R, K, yBot - R); g.clip();
  for (let n = Math.floor(mLo) - 1; n <= Math.ceil(mHi) + 1; n++) {
    const y = yOf(n + 0.5), pc = ((n % 12) + 12) % 12, sw = [1, 3, 6, 8, 10].includes(pc);
    g.fillStyle = sw ? F.fg : F.bg; g.globalAlpha = sw ? 0.78 : 1;
    g.fillRect(sw ? 0 : 0, y + 0.5, sw ? K * 0.62 : K - 1, s.pph - 1);
    g.globalAlpha = 1;
    if (pc === 0 && s.pph >= 9) { g.fillStyle = F.tastenText; g.font = '600 10px -apple-system,system-ui,sans-serif'; g.fillText(notenName(n), K - 24, y + s.pph / 2); }
  }
  g.restore();
  g.fillStyle = F.lineal; g.fillRect(0, 0, K, R);
  g.fillStyle = F.raster; g.fillRect(K - 1, 0, 1, H);
  g.fillStyle = F.linealText; g.font = '600 10px -apple-system,system-ui,sans-serif'; g.fillText('Takt', 6, R / 2);
  g.fillStyle = F.tasten; g.fillRect(0, yBot, K, B); g.fillStyle = F.tastenText; g.fillText('Welle', 5, yBot + B / 2);
}

function blob(n, i, dt, dm, d, mx, art) {
  const s = Z.sicht, x0 = xOf(n.t0 + dt), x1 = xOf(n.t1 + dt);
  if (x1 < K - 2 || x0 > W + 2) return;
  const mid = n.midi + (n.cent || 0) / 100 + dm, yc = yOf(mid);
  const hMax = Math.max(8, s.pph * 1.7), hMin = Math.max(2.5, s.pph * 0.22);
  const halb = (x) => {
    const c = Math.round(x - dt * s.pps) - K;
    const a = c >= 0 && c < W - K ? Math.max(-d[2 * c], d[2 * c + 1]) / mx : 0;
    const rand = Math.min(1, (x - x0) / 4, (x1 - x) / 4);
    return Math.max(0.5, (hMin + (hMax - hMin) * Math.min(1, Math.pow(a, 0.5))) * 0.5 * Math.max(0.25, rand));
  };
  const xa = Math.max(K - 2, x0), xb = Math.min(W + 2, x1), st = Math.max(1.5, (xb - xa) / 300);
  g.beginPath();
  g.moveTo(xa, yc);
  for (let x = xa; x <= xb; x += st) g.lineTo(x, yc - halb(x));
  g.lineTo(xb, yc);
  for (let x = xb; x >= xa; x -= st) g.lineTo(x, yc + halb(x));
  g.closePath();
  if (art === 'geist') { g.setLineDash([3, 3]); g.strokeStyle = F.mut; g.lineWidth = 1; g.stroke(); g.setLineDash([]); return; }
  g.fillStyle = art === 'wahl' || art === 'zug' ? F.wahl : F.note;
  g.globalAlpha = art === 'zug' ? 0.9 : 0.82; g.fill(); g.globalAlpha = 1;
  // Vorlauf (onset → Spitze) als Keil, der zur Spitze hin anwächst; Spitze als Strich (grün = auf dem Raster)
  if (n.peak != null) {
    const xp = xOf(n.peak + dt), xo = xOf((n.onset ?? n.peak) + dt);
    const auf = rasterG() > 0 && Math.abs(n.peak + dt - naechsteLinie(n.peak + dt)) < 0.003;
    g.fillStyle = auf ? F.ok : F.warn;
    if (xp - xo > 1.5) { g.globalAlpha = 0.32; g.beginPath(); g.moveTo(xo, yc); g.lineTo(xp, yc - hMax / 2); g.lineTo(xp, yc + hMax / 2); g.closePath(); g.fill(); g.globalAlpha = 1; }
    g.fillRect(Math.round(xp) - 1, yc - hMax / 2 - 2, 2, hMax + 4);
  }
  // Tonhöhenkurve
  const k = n.kurve;
  if (k && k.length > 1) {
    const hop = n.hop, L = k.length, schritt = Math.max(1, Math.floor(L / Math.max(2, (x1 - x0) / 2)));
    g.strokeStyle = F.ton; g.lineWidth = 1.5; g.beginPath();
    let auf = false;
    for (let j = 0; j < L; j += schritt) {
      const v = k[j];
      if (!(v > 0) || Math.abs(v + dm - mid) > 2.5) { auf = false; continue; }
      const t = hop ? n.t0 + j * hop : n.t0 + (j + 0.5) / L * (n.t1 - n.t0);
      const x = xOf(t + dt), y = yOf(v + dm);
      if (auf) g.lineTo(x, y); else { g.moveTo(x, y); auf = true; }
    }
    g.stroke();
  }
  if (x1 - x0 > 30 && s.pph >= 11) {
    const m = n.midi + Math.round(dm), c = Math.round((n.cent || 0) + (dm - Math.round(dm)) * 100);
    g.fillStyle = art ? F.wahl : F.tastenText; g.font = '600 10.5px -apple-system,system-ui,sans-serif';
    g.fillText(notenName(m) + (Math.abs(c) >= 5 ? ' ' + minus(c) : ''), Math.max(K + 2, x0 + 2), yc - hMax / 2 - 8);
  }
}

function kopfZeichnen(p) {
  if (!gu || !W) return;
  gu.clearRect(0, 0, W, H);
  if (!Z.v) return;
  const t = p ?? (spiel ? pos() : Z.kopf), x = xOf(t);
  if (x < K || x > W) return;
  gu.fillStyle = F.kopf; gu.fillRect(Math.round(x) - 1, 0, 2, H);
  gu.beginPath(); gu.moveTo(x - 6, 0); gu.lineTo(x + 6, 0); gu.lineTo(x, 9); gu.closePath(); gu.fill();
}

// ---------------------------------------------------------------- Gesten

const zeiger = new Map();
let geste = null, tipp = { t: 0, i: -1 };
const punkt = (e) => { const r = buehne.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

function treffer(px, py) {
  const t = tOf(px), N = noten(), tol = 4 / Z.sicht.pps;
  let best = -1, bd = 1e9;
  for (let i = 0; i < N.length; i++) {
    const n = N[i]; if (t < n.t0 - tol || t > n.t1 + tol) continue;
    const dd = Math.abs(py - yOf(n.midi + (n.cent || 0) / 100));
    if (dd < Math.max(22, Z.sicht.pph * 0.8) && dd < bd) { bd = dd; best = i; }
  }
  return best;
}

function zeitPlan(i) {
  const N = noten(), n = N[i], dur = Z.v.dauer;
  const pk = n.peak ?? Math.min(n.t1, n.t0 + 0.02), on = Math.min(n.onset ?? n.t0, pk);
  const b = Math.min(n.t1, pk + Math.max(0.01, Math.min(0.08, (n.t1 - pk) / 2)));
  const prev = N[i - 1], next = N[i + 1];
  const L = Math.max(0, prev ? Math.min(on - 0.02, (prev.peak ?? prev.t0) + 0.03) : on - 1);
  const Rr = Math.min(dur, next ? Math.max(b + 0.02, Math.min(next.onset ?? next.t0, next.t0)) : b + 1);
  return { pk, on, b, L, R: Rr, lo: L + 0.25 * (on - L) - on, hi: Rr - 0.25 * (Rr - b) - b };
}
function zeitZiel(i, roh, fein) {
  const P = zeitPlan(i), gr = rasterG();
  let dt = roh;
  if (gr > 0 && !(Z.fein || fein)) dt = naechsteLinie(P.pk + roh) - P.pk;
  else dt = Math.round(dt * 1000) / 1000;
  return klemm(dt, P.lo, P.hi);
}
function tonZiel(n, roh, fein) {
  const cur = n.midi + (n.cent || 0) / 100;
  if (Z.fein || fein) return Math.round(roh * 100) / 100;
  return Math.round(cur + roh) - cur;
}

buehne.addEventListener('pointerdown', (e) => {
  if (!Z.v) return;
  try { buehne.setPointerCapture(e.pointerId); } catch (er) { /* egal */ }
  const p = punkt(e); zeiger.set(e.pointerId, p);
  if (zeiger.size === 2) {
    const [a, b] = [...zeiger.values()];
    geste = { art: 'pinch', a0: { ...a }, b0: { ...b }, s0: { ...Z.sicht } }; Z.zug = null; neu(); return;
  }
  if (zeiger.size > 2) return;
  if (p.y < R + 10 && p.x > K) { geste = { art: 'lineal', x0: p.x, y0: p.y, t0: tOf(p.x), bewegt: false }; return; }
  const i = p.x > K && p.y < H - B ? treffer(p.x, p.y) : -1;
  if (i >= 0 && !Z.beschaeftigt) geste = { art: 'note', i, x0: p.x, y0: p.y, achse: null, bewegt: false };
  else geste = { art: 'pan', x0: p.x, y0: p.y, s0: { ...Z.sicht }, bewegt: false };
});
buehne.addEventListener('pointermove', (e) => {
  if (!zeiger.has(e.pointerId)) return;
  const p = punkt(e); zeiger.set(e.pointerId, p);
  if (!geste) return;
  if (geste.art === 'pinch') {
    if (zeiger.size < 2) return;
    const [a, b] = [...zeiger.values()], s0 = geste.s0, A = geste.a0, Bb = geste.b0;
    const dx0 = Math.abs(Bb.x - A.x), dx1 = Math.abs(b.x - a.x), dy0 = Math.abs(Bb.y - A.y), dy1 = Math.abs(b.y - a.y);
    const fx = dx0 > 40 ? Math.max(40, dx1) / dx0 : 1, fy = dy0 > 40 ? Math.max(40, dy1) / dy0 : 1;
    const mx0 = (A.x + Bb.x) / 2, my0 = (A.y + Bb.y) / 2, mx1 = (a.x + b.x) / 2, my1 = (a.y + b.y) / 2;
    const tAn = s0.t0 + (mx0 - K) / s0.pps, mAn = s0.m0 - (my0 - R) / s0.pph;
    Z.sicht.pps = s0.pps * fx; Z.sicht.pph = s0.pph * fy; begrenzen();
    Z.sicht.t0 = tAn - (mx1 - K) / Z.sicht.pps; Z.sicht.m0 = mAn + (my1 - R) / Z.sicht.pph; begrenzen(); neu();
    return;
  }
  const dx = p.x - geste.x0, dy = p.y - geste.y0;
  if (!geste.bewegt && Math.hypot(dx, dy) < 8) return;
  geste.bewegt = true;
  if (geste.art === 'pan') {
    Z.sicht.t0 = geste.s0.t0 - dx / Z.sicht.pps; Z.sicht.m0 = geste.s0.m0 + dy / Z.sicht.pph; begrenzen(); neu();
  } else if (geste.art === 'lineal') {
    const t = klemm(tOf(p.x), 0, Z.v.dauer); Z.auswahl = { a: Math.min(geste.t0, t), b: Math.max(geste.t0, t) }; infoAuswahl(); neu();
  } else if (geste.art === 'note') {
    if (!geste.achse) geste.achse = Math.abs(dx) >= Math.abs(dy) ? 'zeit' : 'ton';
    const n = noten()[geste.i];
    Z.zug = geste.achse === 'zeit' ? { i: geste.i, dt: zeitZiel(geste.i, dx / Z.sicht.pps, e.shiftKey), dm: 0 }
      : { i: geste.i, dt: 0, dm: tonZiel(n, -dy / Z.sicht.pph, e.shiftKey) };
    infoZug(); neu();
  }
});
function hoch(e) {
  if (!zeiger.has(e.pointerId)) return;
  const p = zeiger.get(e.pointerId);
  zeiger.delete(e.pointerId);
  const ge = geste;
  if (ge && ge.art === 'pinch') { if (!zeiger.size) geste = null; return; }
  geste = null;
  if (!ge || e.type === 'pointercancel') { Z.zug = null; neu(); return; }
  if (ge.art === 'note') {
    const z = Z.zug; Z.zug = null;
    if (ge.bewegt && z) {
      if (z.dt && Math.abs(z.dt) >= 0.0005) zeitZug(z.i, z.dt);
      else if (z.dm && Math.abs(z.dm) >= 0.005) tonZug(z.i, z.dm);
      else { neu(); infoNote(); }
    } else if (!ge.bewegt) {
      const jetzt = performance.now();
      if (tipp.i === ge.i && jetzt - tipp.t < 380) { tipp = { t: 0, i: -1 }; aufStufe(ge.i); }
      else { tipp = { t: jetzt, i: ge.i }; Z.wahl = ge.i; infoNote(); neu(); vorhoeren(noten()[ge.i]); }
    }
  } else if (ge.art === 'lineal') {
    if (!ge.bewegt) { Z.auswahl = null; springen(ge.t0); neu(); }
    else if (Z.auswahl && Z.auswahl.b - Z.auswahl.a < 0.05) Z.auswahl = null;
    else if (Z.auswahl) springen(Z.auswahl.a);
  } else if (ge.art === 'pan' && !ge.bewegt && p.x > K) {
    Z.wahl = -1; springen(tOf(p.x)); infoStandard(); neu();
  }
}
buehne.addEventListener('pointerup', hoch);
buehne.addEventListener('pointercancel', hoch);
buehne.addEventListener('wheel', (e) => {
  if (!Z.v) return;
  e.preventDefault();
  const p = punkt(e), s = Z.sicht;
  if (e.ctrlKey || e.metaKey) {
    const f = Math.exp(-e.deltaY * 0.01), t = tOf(p.x);
    s.pps *= f; begrenzen(); s.t0 = t - (p.x - K) / s.pps;
  } else if (e.shiftKey) s.t0 += (e.deltaY || e.deltaX) / s.pps;
  else { s.t0 += e.deltaX / s.pps; s.m0 -= e.deltaY / s.pph; }
  begrenzen(); neu();
}, { passive: false });

function zoom(f) { const s = Z.sicht, t = tOf(K + (W - K) / 2); s.pps *= f; begrenzen(); s.t0 = t - (W - K) / 2 / s.pps; begrenzen(); neu(); }

// ---------------------------------------------------------------- Info-Zeile

const infoText = $('infoText');
function infoStandard() { infoText.innerHTML = 'Note antippen: hören. Waagrecht ziehen: Timing. Senkrecht: Tonhöhe. Doppeltipp: auf die Stufe.'; }
function infoNote() {
  const n = noten()[Z.wahl]; if (!n) return infoStandard();
  const pk = n.peak ?? n.t0, ab = rasterG() > 0 ? Math.round((pk - naechsteLinie(pk)) * 1000) : null;
  infoText.innerHTML = `<b>Note ${Z.wahl + 1}</b> · ${notenName(n.midi)}${Math.abs(n.cent || 0) >= 1 ? ' ' + minus(Math.round(n.cent)) + ' ct' : ''} · Takt ${position(pk)}<br><small>${fmtZeit(pk)}${ab === null ? '' : ab === 0 ? ' · Spitze auf dem Strich' : ' · Spitze ' + minus(ab) + ' ms neben dem Strich'}</small>`;
}
function infoZug() {
  const z = Z.zug, n = noten()[z.i];
  if (z.dt) infoText.innerHTML = `<b>Timing ${minus(Math.round(z.dt * 1000))} ms</b> → Takt ${position((n.peak ?? n.t0) + z.dt)}<br><small>Spitze auf den Strich, Vorlauf bleibt links</small>`;
  else { const m = n.midi + (n.cent || 0) / 100 + z.dm; infoText.innerHTML = `<b>Tonhöhe ${tonText(z.dm, n.midi + (n.cent || 0) / 100)}</b> → ${notenName(m)}${Math.abs(Math.round((m - Math.round(m)) * 100)) >= 1 ? ' ' + minus(Math.round((m - Math.round(m)) * 100)) + ' ct' : ''}`; }
}
function infoAuswahl() { if (Z.auswahl) infoText.innerHTML = `<b>Auswahl</b> ${fmtZeit(Z.auswahl.a)} – ${fmtZeit(Z.auswahl.b)}<br><small>Schleife einschalten zum Wiederholen</small>`; }
function tonText(dm, cur) {
  if (cur != null) {
    const zz = cur + dm, zr = Math.round(zz);
    if (Math.abs(zz - zr) < 0.005) { const hs = zr - Math.round(cur); return hs ? minus(hs) + (Math.abs(hs) === 1 ? ' Halbton' : ' Halbtöne') : 'auf ' + notenName(zr); }
  }
  const h = Math.round(dm);
  if (Math.abs(dm - h) < 0.005 && h) return minus(h) + (Math.abs(h) === 1 ? ' Halbton' : ' Halbtöne');
  return minus(Math.round(dm * 100)) + ' Cent';
}

// ---------------------------------------------------------------- Bearbeiten (jeder Zug = neue Version)

function einsetzen(x, y, a0) {
  const out = x.slice(), F = Math.min(Math.round(0.003 * (Z.v.sr || 48000)), y.length >> 2);
  out.set(y, a0);
  for (let j = 0; j < F; j++) {
    const gg = j / F;
    out[a0 + j] = x[a0 + j] * (1 - gg) + y[j] * gg;
    const k = a0 + y.length - 1 - j; if (k < x.length) out[k] = x[k] * (1 - gg) + y[y.length - 1 - j] * gg;
  }
  return out;
}
function abb(anker, t) {
  if (t <= anker[0].src || t >= anker[anker.length - 1].src) return t;
  let i = 1; while (anker[i].src < t) i++;
  const a = anker[i - 1], b = anker[i]; return a.dst + (t - a.src) / (b.src - a.src) * (b.dst - a.dst);
}

function beschaeftigt(an, text = 'Rechnet …') {
  Z.beschaeftigt = an; $('warte').hidden = !an; $('warte').textContent = text;
  $('bAuto').disabled = an || !Z.v;
}

async function aktuellX() { const v = Z.v; if (!v) return null; if (!v.x) { const h = await verlauf.holen(v.id); return h && h.x; } return v.x; }

async function zeitZug(i, dt) {
  const v = Z.v, x = await aktuellX(); if (!x || Z.beschaeftigt) return;
  const P = zeitPlan(i), sr = v.sr, N = noten();
  const s0 = Math.max(0, P.L - 0.05), s1 = Math.min(v.dauer, P.R + 0.05);
  const a0 = Math.round(s0 * sr), a1 = Math.min(x.length, Math.round(s1 * sr)), r0 = a0 / sr;
  const seg = x.slice(a0, a1), len = seg.length / sr;
  const anker = [{ src: 0, dst: 0 }];
  const dazu = (s, d) => { s -= r0; d -= r0; const l = anker[anker.length - 1]; if (s > l.src + 2e-4 && d > l.dst + 2e-4 && s < len - 2e-4 && d < len - 2e-4) anker.push({ src: s, dst: d }); };
  dazu(P.L, P.L); dazu(P.on, P.on + dt); dazu(P.pk, P.pk + dt); dazu(P.b, P.b + dt); dazu(P.R, P.R);
  anker.push({ src: len, dst: len });
  beschaeftigt(true);
  try {
    const r = await rufen({ typ: 'warp', x: seg, sr, anker }, [seg.buffer]);
    const neuX = einsetzen(x, r.y, a0);
    const karte = anker.map((a) => ({ src: a.src + r0, dst: a.dst + r0 }));
    const NN = N.map((n) => Object.assign({}, n, { t0: abb(karte, n.t0), t1: abb(karte, n.t1), peak: n.peak == null ? null : abb(karte, n.peak), onset: n.onset == null ? null : abb(karte, n.onset) }));
    const auf = rasterG() > 0 && Math.abs(P.pk + dt - naechsteLinie(P.pk + dt)) < 0.003;
    Z.wahl = i;
    versionNeu(`Note ${i + 1} ${minus(Math.round(dt * 1000))} ms${auf ? ' → ' + position(P.pk + dt) : ''}`, { x: neuX, noten: NN, stufe: 'bearbeitet' });
    vorhoeren(NN[i]);
  } catch (e) { meldung('Timing ging nicht: ' + e.message); neu(); }
  beschaeftigt(false);
}

async function tonZug(i, dm, name) {
  const v = Z.v, x = await aktuellX(); if (!x || Z.beschaeftigt) return;
  const n = noten()[i], sr = v.sr, hop = n.hop || 0.005;
  const s0 = Math.max(0, Math.floor((n.t0 - 0.25) / hop) * hop), s1 = Math.min(v.dauer, n.t1 + 0.25);
  const a0 = Math.round(s0 * sr), a1 = Math.min(x.length, Math.round(s1 * sr)), r0 = a0 / sr;
  const seg = x.slice(a0, a1);
  const note = Object.assign({}, n, { t0: n.t0 - r0, t1: n.t1 - r0, peak: null, onset: null, kurve: Array.from(n.kurve || []) });
  beschaeftigt(true);
  try {
    const r = await rufen({ typ: 'ton', x: seg, sr, note, cent: dm * 100 }, [seg.buffer]);
    const neuX = einsetzen(x, r.y, a0);
    let nn;
    if (r.note) nn = Object.assign({}, n, r.note, { t0: n.t0, t1: n.t1, peak: n.peak, onset: n.onset, id: n.id });
    else {
      const neuM = n.midi + (n.cent || 0) / 100 + dm, mi = Math.round(neuM);
      nn = Object.assign({}, n, { midi: mi, cent: Math.round((neuM - mi) * 100), kurve: (n.kurve || []).map((k) => (k > 0 ? k + dm : k)) });
    }
    const NN = noten().slice(); NN[i] = nn;
    Z.wahl = i;
    versionNeu(name || `Note ${i + 1} ${tonText(dm, n.midi + (n.cent || 0) / 100)}`, { x: neuX, noten: NN, stufe: 'bearbeitet' });
    vorhoeren(nn);
  } catch (e) { meldung('Tonhöhe ging nicht: ' + e.message); neu(); }
  beschaeftigt(false);
}

let stufeFn = null;
async function aufStufe(i) {
  const n = noten()[i]; if (!n) return;
  if (!stufeFn) { try { const m = await import('./tonhoehe.js'); stufeFn = (c) => m.zielStufe(c, zielOpt()); } catch (e) { const a = await import('./arbeiter.js'); stufeFn = (c) => a.stufe(c, zielOpt()); } }
  const cur = n.midi + (n.cent || 0) / 100, dm = stufeFn(cur) - cur;
  Z.wahl = i;
  if (Math.abs(dm) < 0.005) { meldung(`Note ${i + 1} liegt schon auf der Stufe`); infoNote(); neu(); return; }
  tonZug(i, Math.round(dm * 100) / 100, `Note ${i + 1} auf Stufe`);
}

function versionNeu(name, daten) {
  const v = Z.v;
  verlauf.neu(name, Object.assign({ sr: v.sr, datei: Z.name, basis: v.id }, daten));
}

// ---------------------------------------------------------------- Versions-Zwiebel

const stapel = $('stapel'), lagen = new Map();
const DY = 46, HC = 66;
function zwiebel(liste) {
  liste = liste || verlauf.liste();
  const vorne = liste.find((v) => v.vorne) || liste[0];
  const reihe = vorne ? [vorne, ...liste.filter((v) => v !== vorne)] : [];
  for (const [id, el] of lagen) if (!liste.some((v) => v.id === id)) { el.remove(); lagen.delete(id); }
  const n = reihe.length, Wc = stapel.clientWidth || 300;
  const dx = n > 1 ? Math.min(14, (Wc * 0.22) / (n - 1)) : 0, bw = Math.round(Wc - dx * (n - 1));
  reihe.forEach((v, i) => {
    let el = lagen.get(v.id);
    if (!el) {
      el = document.createElement('div'); el.className = 'lage'; el.setAttribute('role', 'button'); el.tabIndex = 0; el.dataset.id = v.id;
      el.innerHTML = '<canvas></canvas><span class="fahne"><b></b><time></time></span>';
      stapel.appendChild(el); lagen.set(v.id, el);
    }
    el.style.setProperty('--c', `var(--layer-${((v.nr - 1) % 6) + 1})`);
    el.style.setProperty('--a', String(i === 0 ? 0.9 : Math.max(0.28, 0.72 - i * 0.07)));
    el.style.width = bw + 'px';
    el.style.transform = `translate(${(i * dx).toFixed(1)}px,${i * DY}px)`;
    el.style.zIndex = String(n - i + 1);
    el.classList.toggle('vorne', !!v.vorne);
    const fa = el.querySelector('.fahne');
    fa.querySelector('b').textContent = v.name;
    const tm = fa.querySelector('time'); tm.textContent = uhr(v.zeit); tm.dateTime = new Date(v.zeit).toISOString();
    let mk = fa.querySelector('.marke');
    const mt = v.vorne && !v.neueste ? 'vorne' : v.neueste ? 'neueste' : '';
    if (mt) { if (!mk) { mk = document.createElement('span'); mk.className = 'marke'; fa.appendChild(mk); } mk.textContent = mt; mk.classList.toggle('vorn', mt === 'vorne'); } else if (mk) mk.remove();
    el.setAttribute('aria-label', `Version ${v.nr}: ${v.name}, ${uhr(v.zeit)}${v.vorne ? ' (vorne)' : ' – nach vorne holen'}`);
    el.setAttribute('aria-pressed', String(!!v.vorne));
    if (el._b !== bw || el._id !== v.id) { miniWelle(el.querySelector('canvas'), v, bw); el._b = bw; el._id = v.id; }
  });
  stapel.style.height = (n ? HC + (n - 1) * DY : 0) + 'px';
  $('bAktuell').disabled = !liste.length || !!liste[0].vorne;
  $('zwiebelZahl').textContent = n ? `· ${n}` : '';
  $('bExportRein').disabled = !liste.some((v) => v.stufe === 'gereinigt');
  $('bExportTim').disabled = !getimedQuelle(liste);
}
function miniWelle(c, v, bw) {
  const d = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(bw * d); c.height = Math.round(HC * d);
  const q = c.getContext('2d'); q.setTransform(d, 0, 0, d, 0, 0); q.clearRect(0, 0, bw, HC);
  const sp = v.spitzen; if (!sp || !sp.length) return;
  const n = sp.length / 2, mx = vMax(v), yc = HC * 0.42, h = HC * 0.36;
  q.fillStyle = getComputedStyle(c.parentNode).getPropertyValue('--c').trim() || F.welle;
  for (let i = 0; i < bw; i++) {
    const a = Math.floor(i * n / bw), b = Math.max(a + 1, Math.floor((i + 1) * n / bw));
    let lo = 0, hi = 0; for (let j = a; j < b; j++) { if (sp[2 * j] < lo) lo = sp[2 * j]; if (sp[2 * j + 1] > hi) hi = sp[2 * j + 1]; }
    q.fillRect(i, yc - (hi / mx) * h, 1, Math.max(1, ((hi - lo) / mx) * h));
  }
}
function lageWaehlen(el) { if (el && el.dataset.id) verlauf.nachVorne(el.dataset.id); }
stapel.addEventListener('click', (e) => lageWaehlen(e.target.closest('.lage')));
stapel.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lageWaehlen(e.target.closest('.lage')); } });
$('bAktuell').addEventListener('click', () => verlauf.zurNeuesten());

async function vorneSetzen(v) {
  if (!v) return;
  if (!v.x) { try { await verlauf.holen(v.id); } catch (e) { /* bleibt ohne Audio */ } }
  const lief = spiel && !spiel.vorhoer, p = lief ? pos() : null, schl = spiel && spiel.loop ? { a: spiel.a, b: spiel.b } : null;
  if (spiel) stopp(false);
  const neuDatei = !Z.v;
  Z.v = v;
  if (v.noten) v.noten.sort((a, b) => a.t0 - b.t0);
  if (Z.wahl >= noten().length) Z.wahl = -1;
  wcache.key = '';
  sichtbar(true);
  if (neuDatei) { groesse(); ansichtPassen(); }
  if (!v.noten && v.stufe === 'original' && v.x && !v._analyse) analyse(v);
  neu();
  if (Z.wahl >= 0) infoNote(); else infoStandard();
  if (lief) abspielen(p, schl ? schl.b : null, !!schl, schl ? schl.a : null);
}

async function analyse(v) {
  v._analyse = true;
  try {
    const x = v.x.slice();
    const r = await rufen({ typ: 'analyse', x, sr: v.sr }, [x.buffer]);
    if (r.noten && !v.noten) { v.noten = r.noten; verlauf.umbenennen(v.id, v.name); if (Z.v === v) { tonhoeheMitte(); neu(); } }
  } catch (e) { /* Anzeige ohne Noten */ }
}

function ansichtPassen() {
  const v = Z.v; if (!v || !W) return;
  const s = Z.sicht, breite = W - K;
  s.pps = Math.max(breite / (v.dauer + 0.2), 70); s.t0 = -0.1;
  s.pph = klemm((H - R - B) / 24, 9, 22);
  tonhoeheMitte();
  begrenzen();
}
function tonhoeheMitte() {
  const N = noten(), s = Z.sicht;
  let mitte = 64;
  if (N.length) { const m = N.map((n) => n.midi).sort((a, b) => a - b); mitte = m[m.length >> 1]; }
  s.m0 = mitte + (H - R - B) / s.pph / 2; begrenzen();
}

function sichtbar(an) {
  $('leer').hidden = an;
  for (const id of ['werk', 'transport', 'zwiebel', 'export']) $(id).hidden = !an;
  $('bAuto').disabled = !an || Z.beschaeftigt;
}

// ---------------------------------------------------------------- Abspielen, Schleife, Metronom

let ac = null, quelle = null, spiel = null, puf = { id: null, b: null }, rafK = 0;
function acHolen() {
  if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function pufferVon(v) {
  if (puf.id === v.id && puf.b) return puf.b;
  const b = ac.createBuffer(1, v.x.length, v.sr);
  if (b.copyToChannel) b.copyToChannel(v.x, 0); else b.getChannelData(0).set(v.x);
  puf = { id: v.id, b }; return b;
}
function pos() {
  if (!spiel || !ac) return Z.kopf;
  const e = Math.max(0, ac.currentTime - spiel.ctxT);
  if (spiel.loop) { const L = spiel.b - spiel.a; return spiel.a + (((spiel.off - spiel.a + e) % L) + L) % L; }
  return Math.min(spiel.off + e, spiel.ende ?? 1e9);
}
function abspielen(von, bis = null, schleife = false, a = null, vorhoer = false) {
  stopp(false);
  const c = acHolen(), v = Z.v; if (!c || !v || !v.x) return;
  const b = pufferVon(v), q = c.createBufferSource();
  q.buffer = b; q.connect(c.destination);
  von = klemm(von, 0, Math.max(0, v.dauer - 0.01));
  const t = c.currentTime + 0.03;
  if (schleife && bis) { a = a ?? von; q.loop = true; q.loopStart = a; q.loopEnd = bis; q.start(t, klemm(von, a, bis - 0.01)); }
  else if (bis) q.start(t, von, Math.max(0.02, bis - von)); else q.start(t, von);
  q.onended = () => { if (quelle === q) stopp(!vorhoer); };
  quelle = q;
  spiel = { ctxT: t, off: schleife ? klemm(von, a, bis) : von, a: a ?? von, b: bis, loop: !!(schleife && bis), ende: bis ?? v.dauer, vorhoer };
  metroStart(); kopfLauf(); spielKnopf();
}
function stopp(merken = true) {
  if (quelle) { const p = pos(); try { quelle.onended = null; quelle.stop(); } catch (e) { /* schon aus */ } quelle = null; if (merken && spiel && !spiel.vorhoer) Z.kopf = p; }
  spiel = null; metroStopp(); spielKnopf(); kopfZeichnen(); zeitAnzeige(Z.kopf);
}
function vorhoeren(n) { if (n) abspielen(Math.max(0, n.t0 - 0.2), Math.min(Z.v.dauer, n.t1 + 0.25), false, null, true); }
function springen(t) { Z.kopf = klemm(t, 0, Z.v ? Z.v.dauer : 0); if (spiel && !spiel.vorhoer) abspielen(Z.kopf); else { if (spiel) stopp(false); kopfZeichnen(); zeitAnzeige(Z.kopf); } }
function spielKnopf() {
  const an = !!(spiel && !spiel.vorhoer);
  $('bSpiel').setAttribute('aria-label', an ? 'Anhalten' : 'Abspielen');
  $('icSpiel').innerHTML = an ? '<rect x="6" y="6" width="12" height="12" rx="1.5"/>' : '<path d="M7 5l12 7-12 7z"/>';
}
function zeitAnzeige(t) { $('zeit').innerHTML = `${fmtZeit(t)}<small>Takt ${position(t)}</small>`; }
function kopfLauf() {
  if (rafK) return;
  let letzt = 0;
  const f = (ts) => {
    rafK = 0; if (!spiel) { kopfZeichnen(); return; }
    const p = pos(), s = Z.sicht, sicht = (W - K) / s.pps;
    if (!geste && !spiel.vorhoer && (p > s.t0 + sicht * 0.97 || p < s.t0)) { s.t0 = p - sicht * 0.08; begrenzen(); neu(); }
    kopfZeichnen(p);
    if (ts - letzt > 90) { zeitAnzeige(p); letzt = ts; }
    rafK = requestAnimationFrame(f);
  };
  rafK = requestAnimationFrame(f);
}
let metroIv = 0, metroBis = 0;
function metroStart() { metroStopp(); if (!Z.metro || !spiel || spiel.vorhoer) return; metroBis = 0; metroIv = setInterval(metroTakt, 25); metroTakt(); }
function metroStopp() { if (metroIv) clearInterval(metroIv); metroIv = 0; }
function liedZeit(c) {
  const e = c - spiel.ctxT;
  if (spiel.loop) { const L = spiel.b - spiel.a; return spiel.a + (((spiel.off - spiel.a + e) % L) + L) % L; }
  return spiel.off + e;
}
function metroTakt() {
  if (!spiel || !ac) return metroStopp();
  const bis = ac.currentTime + 0.12, { z, schlag } = takt();
  let c = Math.max(metroBis, spiel.ctxT, ac.currentTime), schutz = 0;
  while (c < bis && schutz++ < 8) {
    const s = liedZeit(c);
    let ende = bis;
    if (spiel.loop) ende = Math.min(bis, c + (spiel.b - s));
    const sEnde = s + (ende - c);
    for (let k = Math.ceil((s - E.versatz) / schlag - 1e-9); E.versatz + k * schlag < sEnde; k++) {
      const tb = E.versatz + k * schlag; klick(c + (tb - s), ((k % z) + z) % z === 0);
    }
    c = ende + 1e-4;
  }
  metroBis = bis;
}
function klick(t, betont) {
  const o = ac.createOscillator(), gn = ac.createGain();
  o.frequency.value = betont ? 2000 : 1400;
  gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(betont ? 0.5 : 0.3, t + 0.002); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(gn); gn.connect(ac.destination); o.start(t); o.stop(t + 0.06);
}

$('bSpiel').addEventListener('click', () => {
  if (!Z.v) return;
  if (spiel && !spiel.vorhoer) { stopp(); return; }
  if (Z.schleife) {
    const n = noten()[Z.wahl], sel = Z.auswahl || (n ? { a: Math.max(0, n.t0 - 0.1), b: Math.min(Z.v.dauer, n.t1 + 0.1) } : null);
    if (sel) { abspielen(Z.kopf >= sel.a && Z.kopf < sel.b ? Z.kopf : sel.a, sel.b, true, sel.a); return; }
  }
  abspielen(Z.kopf >= Z.v.dauer - 0.05 ? 0 : Z.kopf);
});
const schalter = (id, k, nach) => $(id).addEventListener('click', () => { Z[k] = !Z[k]; $(id).setAttribute('aria-pressed', String(Z[k])); if (nach) nach(); });
schalter('bSchleife', 'schleife', () => { if (spiel && !spiel.vorhoer) { const p = pos(); stopp(false); Z.kopf = p; $('bSpiel').click(); } });
schalter('bMetro', 'metro', () => { if (spiel) metroStart(); });
schalter('bFein', 'fein', () => meldung(Z.fein ? 'Fein: Cent und Millisekunden, ohne Einrasten' : 'Einrasten: Halbton und Raster'));
$('bZoomEin').addEventListener('click', () => zoom(1.6));
$('bZoomAus').addEventListener('click', () => zoom(1 / 1.6));
document.addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input,select,textarea')) return;
  if (e.key === ' ' && Z.v) { e.preventDefault(); $('bSpiel').click(); }
});

// ---------------------------------------------------------------- Automatisch fertig machen

const SCHR = { reinigen: ['sbReinigen', 'spReinigen'], tonhoehe: ['sbTon', 'spTon'], timing: ['sbTiming', 'spTiming'] };
function standSetzen(schritt, p, fertig) {
  const s = SCHR[schritt]; if (!s) return;
  const b = $(s[0]); b.firstElementChild.style.transform = `scaleX(${klemm(p / 100, 0, 1)})`; b.classList.toggle('fertig', !!fertig);
  $(s[1]).textContent = fertig ? 'fertig' : Math.round(p) + ' %';
}
function zielOpt() { return { skala: E.skala, grundton: E.grundton, staerke: E.ton / 100, uebergang_ms: 40, vibratoErhalten: true }; }
function autoOpt() {
  return { reinigen: Object.assign({}, E.rein), raster: { bpm: E.bpm, offset: E.versatz, teilung: E.teilung, staerke: E.timing / 100 },
    timing: E.timing > 0 && E.teilung !== 'frei', ziel: zielOpt(), tonhoehe: E.ton > 0 };
}
$('bAuto').addEventListener('click', async () => {
  const v = Z.v; if (!v || Z.beschaeftigt) return;
  const x0 = await aktuellX(); if (!x0) return;
  stopp(false);
  beschaeftigt(true, 'Automatisch …');
  $('stand').hidden = false; $('bericht').hidden = true; $('bericht').classList.remove('fehler');
  for (const k in SCHR) standSetzen(k, 0);
  const reihe = ['reinigen', 'tonhoehe', 'timing'];
  const x = x0.slice(), sr = v.sr, basis = v.id;
  try {
    const r = await rufen({ typ: 'auto', x, sr, opt: autoOpt() }, [x.buffer], (schritt, p) => {
      const i = reihe.indexOf(schritt); for (let j = 0; j < i; j++) standSetzen(reihe[j], 100, true);
      standSetzen(schritt, p, p >= 100);
    });
    for (const k of reihe) standSetzen(k, 100, true);
    const b = r.bericht || {}, N = r.noten || [];
    const gem = { sr, datei: Z.name };
    const vg = verlauf.neu('Gereinigt', Object.assign({}, gem, { x: r.gereinigt, stufe: 'gereinigt', bericht: b.reinigen || null, noten: r.roh || null, basis }));
    verlauf.neu('Auto-Durchlauf', Object.assign({}, gem, { x: r.y, stufe: 'fertig', noten: N, anker: r.anker, bericht: b, basis: vg.id, einst: JSON.parse(JSON.stringify(E)) }));
    $('bericht').textContent = berichtText(b, N);
    $('bericht').hidden = false;
    tonhoeheMitte(); neu();
  } catch (e) {
    $('bericht').textContent = 'Das ging nicht: ' + e.message; $('bericht').classList.add('fehler'); $('bericht').hidden = false;
  }
  beschaeftigt(false);
});
function berichtText(b, N) {
  const t = [], r = b.reinigen || {}, db = (x) => '−' + Math.abs(Math.round(x)) + ' dB';
  if (r.klicks && r.klicks.an) t.push(`Klicks ${r.klicks.anzahl || 0}`);
  if (r.brumm && r.brumm.an) t.push(r.brumm.anzahl ? `Brummen ${db(r.brumm.db || 0)}` : 'kein Brummen');
  if (r.rauschen && r.rauschen.an && r.rauschen.db) t.push(`Rauschen ${db(r.rauschen.db)}`);
  if (r.schmatzer && r.schmatzer.an) t.push(`Schmatzer ${r.schmatzer.anzahl || 0}`);
  if (r.atmer && r.atmer.an && r.atmer.anzahl) t.push(`Atmer ${r.atmer.anzahl} leiser`);
  if (b.timing) t.push(b.timing.aus ? 'Timing aus' : `${b.timing.pins} Anschläge auf dem Raster`);
  if (b.ton) t.push(b.ton.gestimmt ? `${b.ton.gestimmtAnzahl ?? N.length} Noten gestimmt` : `${N.length} Noten erkannt`);
  if (b.fehlt && b.fehlt.length) t.push(`ohne ${b.fehlt.join(', ')}`);
  return t.join(' · ');
}

// ---------------------------------------------------------------- Datei laden, Export

const dateiInfo = $('dateiInfo');
function dateiZeile(v) {
  if (!v) return;
  const kHz = (v.sr / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  dateiInfo.innerHTML = '';
  const b = document.createElement('b'); b.textContent = Z.name || v.datei || 'Aufnahme';
  dateiInfo.append(b, ` · ${fmtZeit(v.dauer).replace(/\.\d+$/, '')} · ${kHz} kHz`);
}
async function dateiLaden(f) {
  if (!f || Z.beschaeftigt) return;
  stopp(false);
  beschaeftigt(true, 'Lädt …'); dateiInfo.textContent = 'Lädt ' + (f.name || '') + ' …';
  try {
    const r = await io.laden(f);
    await verlauf.leeren();
    Z.name = r.name || f.name || 'Aufnahme'; Z.v = null; Z.wahl = -1; Z.auswahl = null; Z.kopf = 0;
    $('bericht').hidden = true; $('stand').hidden = true;
    verlauf.neu('Original', { x: r.x, sr: r.sr, stufe: 'original', datei: Z.name, basis: null });
    dateiZeile(Z.v);
  } catch (e) { dateiInfo.textContent = 'Datei ließ sich nicht lesen: ' + e.message; }
  beschaeftigt(false);
}
$('dateiEingabe').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; dateiLaden(f).then(() => { e.target.value = ''; }); });
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) dateiLaden(f); });

const basisName = () => String(Z.name || 'Gesang').replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'Gesang';
async function exportVon(v, zusatz) {
  if (!v) return;
  let x = v.x; if (!x) { const h = await verlauf.holen(v.id); x = h && h.x; }
  if (!x) { meldung('Diese Version ist nicht mehr im Speicher'); return; }
  const name = basisName() + '_' + zusatz + '.wav';
  await io.exportieren(io.wav(x, v.sr, 24), name);
  meldung(name + ' geladen (' + v.name + ')');
}
const neuesteStufe = (st) => verlauf.liste().find((v) => v.stufe === st);
// „nur getimed“ = neueste gereinigte Fassung + Timing (ohne Tonhöhenkorrektur), wird erst beim Tippen gerechnet –
// mit den Takt-Einstellungen des zugehörigen Auto-Durchlaufs
function getimedQuelle(liste) {
  liste = liste || verlauf.liste();
  const g = liste.find((v) => v.stufe === 'gereinigt'); if (!g) return null;
  const f = liste.find((v) => v.stufe === 'fertig' && v.basis === g.id);
  return { f, g };
}
async function exportGetimed() {
  const q = getimedQuelle(); if (!q || Z.beschaeftigt) return;
  let x = q.g.x; if (!x) { const h = await verlauf.holen(q.g.id); x = h && h.x; }
  if (!x) { meldung('„Gereinigt“ ist nicht mehr im Speicher'); return; }
  beschaeftigt(true, 'Timing …');
  try {
    const seg = x.slice();
    const e = (q.f && q.f.einst) || E;
    const raster = { bpm: e.bpm, offset: e.versatz, teilung: e.teilung === 'frei' ? '1/16' : e.teilung, staerke: Math.max(0.01, (e.timing ?? 100) / 100) };
    const r = await rufen({ typ: 'timing', x: seg, sr: q.g.sr, raster, klicks: (e.rein || {}).klicks !== false }, [seg.buffer]);
    const name = basisName() + '_getimed.wav';
    await io.exportieren(io.wav(r.y, q.g.sr, 24), name);
    meldung(name + ' geladen (gereinigt + Timing, ohne Tonhöhe)');
  } catch (e) { meldung('Das ging nicht: ' + e.message); }
  beschaeftigt(false);
}
$('bExport').addEventListener('click', () => exportVon(Z.v, 'fertig'));
$('bExportRein').addEventListener('click', () => exportVon(neuesteStufe('gereinigt'), 'gereinigt'));
$('bExportTim').addEventListener('click', exportGetimed);

let meldT = 0;
function meldung(t) { const m = $('meldung'); m.textContent = t; m.hidden = false; clearTimeout(meldT); meldT = setTimeout(() => { m.hidden = true; }, 2600); }

// ---------------------------------------------------------------- Einstellungs-Felder

function einstKurz() {
  const sk = E.skala === 'chromatisch' ? 'chromatisch' : NAMEN[E.grundton] + '-' + (E.skala === 'dur' ? 'Dur' : 'Moll');
  $('einstKurz').textContent = `${+E.bpm} BPM · ${E.taktart} · ${E.teilung} · ${sk}`;
  $('fGrund').disabled = E.skala === 'chromatisch';
  $('wTiming').textContent = E.timing + ' %'; $('wTon').textContent = E.ton + ' %';
}
function segBinden(id, k) {
  const seg = $(id);
  const zeig = () => seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === E[k])));
  seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; E[k] = b.dataset.v; zeig(); geaendert(); });
  zeig();
}
function geaendert() { einstSichern(); einstKurz(); stufeFn = null; neu(); if (Z.wahl >= 0) infoNote(); }
$('fBpm').value = E.bpm; $('fTaktart').value = E.taktart; $('fVersatz').value = E.versatz; $('fGrund').value = String(E.grundton);
$('fTiming').value = E.timing; $('fTon').value = E.ton;
$('fBpm').addEventListener('change', (e) => { const v = parseFloat(String(e.target.value).replace(',', '.')); E.bpm = v >= 40 && v <= 240 ? v : 120; e.target.value = E.bpm; geaendert(); });
$('fTaktart').addEventListener('change', (e) => { E.taktart = e.target.value; geaendert(); });
$('fVersatz').addEventListener('change', (e) => { const v = parseFloat(String(e.target.value).replace(',', '.')); E.versatz = Number.isFinite(v) ? v : 0; geaendert(); });
$('fGrund').addEventListener('change', (e) => { E.grundton = +e.target.value; geaendert(); });
$('fTiming').addEventListener('input', (e) => { E.timing = +e.target.value; geaendert(); });
$('fTon').addEventListener('input', (e) => { E.ton = +e.target.value; geaendert(); });
segBinden('segRaster', 'teilung'); segBinden('segSkala', 'skala');
$('chipsRein').querySelectorAll('button').forEach((b) => {
  b.setAttribute('aria-pressed', String(E.rein[b.dataset.k] !== false));
  b.addEventListener('click', () => { E.rein[b.dataset.k] = !(E.rein[b.dataset.k] !== false); b.setAttribute('aria-pressed', String(E.rein[b.dataset.k])); geaendert(); });
});
einstKurz();

// ---------------------------------------------------------------- Farbschema

function themaSetzen(t, merken) {
  const H0 = document.documentElement;
  if (t === 'konsole') H0.dataset.thema = 'konsole'; else delete H0.dataset.thema;
  if (merken) { try { localStorage.setItem('w3-thema', t); } catch (e) { /* egal */ } }
  document.querySelectorAll('[data-thema-wahl]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themaWahl === (t === 'konsole' ? 'konsole' : 'klassisch'))));
  farben(); neu(); for (const el of lagen.values()) el._b = -1; zwiebel();
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-thema-wahl]'); if (b) themaSetzen(b.dataset.themaWahl, true); });
try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { farben(); neu(); }); } catch (e) { /* alt */ }

// ---------------------------------------------------------------- Start

farben();
themaSetzen(document.documentElement.dataset.thema || 'klassisch', false);
arbeiterStart();
new ResizeObserver(() => { groesse(); zwiebel(); }).observe(buehne);
new ResizeObserver(() => zwiebel()).observe(stapel);
verlauf.beobachten((liste, akt) => { zwiebel(liste); if (akt && akt !== Z.v) vorneSetzen(akt); else if (!akt) { Z.v = null; sichtbar(false); } });
verlauf.wiederherstellen().then((l) => {
  if (l && l.length) { const v = verlauf.aktuell() || l[0]; Z.name = v.datei || Z.name; dateiZeile(v); }
}).catch(() => { /* nur im Speicher */ });

// für Tests und Fehlersuche
window.werkstatt3 = { Z, E, verlauf, rufen, zeichnen: neu, zeichnenSofort() { zeichnen(); },
  ort(i) { const n = noten()[i], r = buehne.getBoundingClientRect(); if (!n) return null; const t = Math.min(n.t1 - 0.01, (n.peak ?? n.t0) + 0.03); return { x: r.left + xOf(t), y: r.top + yOf(n.midi + (n.cent || 0) / 100), sichtbar: xOf(t) > K && xOf(t) < W }; },
  zeige(t) { Z.sicht.t0 = t; begrenzen(); neu(); },
  hoertGerade() { if (!spiel || !puf.id) return null; const v = verlauf.liste().find((w) => w.id === puf.id); return v ? v.name : null; } };
