// Werkstatt 3 – arbeiter.js
// Module-Worker (dünne Hülle): holt die Rechen-Module und führt Aufträge aus. Alles lokal – die Datei verlässt nie das Gerät.
// Lässt sich auch im Hauptfaden importieren (Ersatz, wenn kein Module-Worker geht): export bearbeiten(msg, melde).
//
// Aufträge (postMessage):
//   {typ:'auto', id, x, sr, opt}   → {typ:'stand', id, schritt:'reinigen'|'timing'|'tonhoehe', prozent}
//                                  → {typ:'fertig', id, y, gereinigt, getimed, noten, anker, bericht, tr}
//        opt = {reinigen:{klicks:true,…}|false, raster:{bpm, offset, teilung, staerke}, timing:true,
//               ziel:{skala, grundton, staerke, uebergang_ms, vibratoErhalten}, tonhoehe:true}
//   {typ:'warp', id, x, sr, anker} → {typ:'fertig', id, y}          (Ausschnitt; Anker relativ zum Ausschnitt)
//   {typ:'ton', id, x, sr, note, cent} → {typ:'fertig', id, y, note} (Ausschnitt; Note relativ zum Ausschnitt)
//   {typ:'analyse', id, x, sr}     → {typ:'fertig', id, noten}     (Tonhöhe/Noten ohne Änderung, z. B. fürs Original)
//   Fehler → {typ:'fehler', id, text}
// Fehlt ein Modul (z. B. tonhoehe.js), springt ein einfacher Ersatz ein, damit die Seite trotzdem arbeitet.

let M = null;
async function module() {
  if (M) return M;
  const lade = async (n) => { try { return await import('./' + n + '.js'); } catch (e) { return null; } };
  const [rein, tim, ton] = await Promise.all([lade('reinigen'), lade('timing'), lade('tonhoehe')]);
  M = { rein, tim, ton, fehlt: [!rein && 'reinigen', !tim && 'timing', !ton && 'tonhoehe'].filter(Boolean) };
  return M;
}

const DUR = [0, 2, 4, 5, 7, 9, 11], MOLL = [0, 2, 3, 5, 7, 8, 10];
export function stufe(m, ziel = {}) {
  const sk = String(ziel.skala || 'chromatisch').toLowerCase();
  if (!(m === m)) return m;
  if (sk.startsWith('chrom')) return Math.round(m);
  const g = ((ziel.grundton | 0) % 12 + 12) % 12, ton = sk.startsWith('moll') || sk === 'minor' ? MOLL : DUR;
  let best = Math.round(m), bd = 1e9;
  for (let k = Math.floor(m) - 2; k <= Math.ceil(m) + 2; k++) {
    if (!ton.includes(((k - g) % 12 + 12) % 12)) continue;
    const d = Math.abs(k - m); if (d < bd) { bd = d; best = k; }
  }
  return best;
}

const midiVonHz = (f) => (f > 0 ? 69 + 12 * Math.log2(f / 440) : NaN);

// Kurve einer Note in ein einheitliches Format bringen: Float32Array mit MIDI-Werten (NaN = stimmlos), gleichmäßig über t0…t1
export function kurveMidi(n) {
  const k = n && n.kurve;
  if (!k || !k.length) return new Float32Array([n.midi + (n.cent || 0) / 100]);
  const out = new Float32Array(k.length);
  for (let i = 0; i < k.length; i++) {
    let v = k[i];
    if (v && typeof v === 'object') v = Array.isArray(v) ? v[1] : (v.midi ?? (v.f0 ? midiVonHz(v.f0) : v.m ?? v.wert ?? v.v));
    v = +v;
    out[i] = !(v > 0) ? NaN : v > 140 ? midiVonHz(v) : v;
  }
  return out;
}

// ---------------------------------------------------------------- Ersatz, falls tonhoehe.js fehlt

function ersatzSpur(x, sr, hop = 0.01) {
  const D = Math.max(1, Math.round(sr / 12000)), fs = sr / D, n = Math.floor(x.length / D);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < D; j++) s += x[i * D + j]; y[i] = s / D; }
  const W = Math.round(0.03 * fs), tMin = Math.floor(fs / 1000), tMax = Math.ceil(fs / 70), H = Math.round(hop * fs);
  const F = Math.max(0, Math.floor((n - W - tMax) / H)), t = new Float32Array(F), f0 = new Float32Array(F), sicher = new Float32Array(F);
  const d = new Float32Array(tMax + 1);
  let rmsMax = 1e-9; const rms = new Float32Array(F);
  for (let k = 0; k < F; k++) { let e = 0; const a = k * H; for (let i = 0; i < W; i++) e += y[a + i] * y[a + i]; rms[k] = Math.sqrt(e / W); if (rms[k] > rmsMax) rmsMax = rms[k]; }
  for (let k = 0; k < F; k++) {
    t[k] = (k * H + W / 2) / fs;
    if (rms[k] < rmsMax * 0.03) continue;
    const a = k * H; let sum = 0, best = -1;
    for (let tau = 1; tau <= tMax; tau++) {
      let s = 0; for (let i = 0; i < W; i++) { const q = y[a + i] - y[a + i + tau]; s += q * q; }
      sum += s; d[tau] = s * tau / (sum || 1);
      if (tau >= tMin && best < 0 && d[tau] < 0.15) { while (tau + 1 <= tMax) { let s2 = 0; for (let i = 0; i < W; i++) { const q = y[a + i] - y[a + i + tau + 1]; s2 += q * q; } const d2 = s2 * (tau + 1) / (sum + s2); if (d2 < d[tau]) { tau++; sum += s2; d[tau] = d2; } else break; } best = tau; break; }
    }
    if (best > 0) { f0[k] = fs / best; sicher[k] = 1 - d[best]; }
  }
  return { t, f0, sicher };
}

function ersatzNoten(spur) {
  const { t, f0 } = spur, out = []; let cur = null;
  const fertig = () => { if (cur && cur.k.length >= 6) { const s = cur.k.slice().sort((a, b) => a - b), med = s[s.length >> 1]; out.push({ id: out.length + 1, t0: cur.t0, t1: cur.t1, midi: Math.round(med), cent: Math.round((med - Math.round(med)) * 100), f0Mittel: 440 * 2 ** ((med - 69) / 12), kurve: cur.k, hop: 0.01 }); } cur = null; };
  for (let i = 0; i < t.length; i++) {
    const m = midiVonHz(f0[i]);
    if (!(m === m)) { if (cur && t[i] - cur.t1 > 0.03) fertig(); continue; }
    if (cur && Math.abs(m - cur.ref) > 0.8) fertig();
    if (!cur) cur = { t0: t[i], t1: t[i], k: [], ref: m };
    cur.k.push(m); cur.t1 = t[i] + 0.005; cur.ref = cur.ref * 0.8 + m * 0.2;
  }
  fertig();
  return out;
}

// Tonhöhe ohne Längenänderung (zwei Lesezeiger, Überblendung) – nur Ersatz
function ersatzSchieben(x, sr, faktor) {
  const N = x.length, y = new Float32Array(N), W = Math.round(sr * 0.035);
  let d = 0;
  const lies = (p) => { if (p < 0) return 0; const i = Math.floor(p), f = p - i; return i + 1 < N ? x[i] * (1 - f) + x[i + 1] * f : 0; };
  for (let i = 0; i < N; i++) {
    d += 1 - faktor; if (d < 0) d += W; else if (d >= W) d -= W;
    const d2 = (d + W / 2) % W, g = Math.sin(Math.PI * d / W) ** 2;
    y[i] = g * lies(i - d) + (1 - g) * lies(i - d2);
  }
  return y;
}

// ---------------------------------------------------------------- Aufträge

function abb(anker, t) {
  if (!anker || anker.length < 2) return t;
  let lo = 0, hi = anker.length - 1;
  if (t <= anker[0].src) return anker[0].dst + (t - anker[0].src);
  if (t >= anker[hi].src) return anker[hi].dst + (t - anker[hi].src);
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (anker[m].src <= t) lo = m; else hi = m; }
  const a = anker[lo], b = anker[hi]; return a.dst + (t - a.src) / (b.src - a.src) * (b.dst - a.dst);
}

async function auto(x, sr, opt = {}, melde = () => {}) {
  const m = await module();
  const bericht = { fehlt: m.fehlt };
  // 1) Reinigen
  let gereinigt = x;
  if (m.rein && opt.reinigen !== false) {
    const r = m.rein.reinigen(x, sr, Object.assign({}, opt.reinigen || {}, { fortschritt: (s, p) => melde('reinigen', p, s) }));
    gereinigt = r.y; bericht.reinigen = r.bericht;
  }
  melde('reinigen', 100);
  // 2) Timing: Spitzen auf die Rasterlinien, Vorlauf bleibt links davor
  let getimed = gereinigt, anker = null, tr = [];
  const raster = opt.raster || {};
  if (m.tim) {
    tr = m.tim.transienten(gereinigt, sr);
    melde('timing', 10);
    if (opt.timing !== false && raster.teilung !== 'frei' && (raster.staerke ?? 1) > 0 && tr.length) {
      anker = m.tim.zeitkarte(tr, raster);
      melde('timing', 20);
      getimed = m.tim.warp(gereinigt, sr, anker, { stand: (p) => melde('timing', 20 + 0.8 * p) });
      bericht.timing = { pins: anker.pins ? anker.pins.length : 0, frei: anker.frei || 0, transienten: tr.length };
      tr = tr.map((t) => ({ peak: abb(anker, t.peak), onset: abb(anker, t.onset), staerke: t.staerke }));
      try { bericht.timing.abweichung = m.tim.rasterAbweichung(tr, raster); delete bericht.timing.abweichung.werte; } catch (e) { /* egal */ }
    } else bericht.timing = { pins: 0, transienten: tr.length, aus: true };
  }
  melde('timing', 100);
  // 3) Tonhöhe: verfolgen → Noten → je Note zur Stufe
  let noten = [], y = getimed;
  const ziel = Object.assign({ skala: 'chromatisch', staerke: 1, uebergang_ms: 40, vibratoErhalten: true }, opt.ziel || {});
  if (m.ton) {
    const spur = m.ton.verfolgen(getimed, sr, 0.005);
    melde('tonhoehe', 35);
    noten = m.ton.noten(spur, opt.notenOpt || {}) || [];
    melde('tonhoehe', 50);
    if (opt.tonhoehe !== false && ziel.staerke > 0 && noten.length) {
      y = m.ton.korrigieren(getimed, sr, noten, ziel) || getimed;
      bericht.ton = { noten: noten.length, gestimmt: true };
    } else bericht.ton = { noten: noten.length, gestimmt: false };
  } else {
    noten = ersatzNoten(ersatzSpur(getimed, sr));
    bericht.ton = { noten: noten.length, gestimmt: false, ersatz: true };
  }
  melde('tonhoehe', 90);
  // Noten für die Anzeige: so, wie sie nach der Korrektur klingen (Kurve als MIDI je hop), Spitze/Vorlauf dazu
  const gestimmt = bericht.ton.gestimmt;
  let anzeige = noten;
  if (gestimmt) {
    if (m.ton && m.ton.korrigierteNoten) { try { anzeige = m.ton.korrigierteNoten(noten, ziel); } catch (e) { anzeige = null; } }
    if (!anzeige || anzeige.length !== noten.length) anzeige = noten.map((n) => {
      const ist = n.midi + (n.cent || 0) / 100, z = stufe(ist, ziel), d = (z - ist) * Math.min(1, Math.max(0, ziel.staerke));
      const kurve = Array.from(kurveMidi(n), (v) => v + d), neu = ist + d, mi = Math.round(neu);
      return Object.assign({}, n, { kurve, midi: mi, cent: Math.round((neu - mi) * 100) });
    });
  }
  noten = anzeige.map((n, i) => {
    const alt = noten[i] || n;
    const sp = tr.find((t) => t.peak >= n.t0 - 0.06 && t.peak <= Math.min(n.t1, n.t0 + 0.25));
    return Object.assign({}, n, { id: n.id ?? i + 1, kurve: Array.from(kurveMidi(n)), hop: n.hop ?? alt.hop ?? null,
      peak: sp ? sp.peak : null, onset: sp ? Math.min(sp.onset, sp.peak) : null, vorher: alt.midi + (alt.cent || 0) / 100 });
  });
  if (gestimmt) bericht.ton.gestimmtAnzahl = noten.filter((n) => Math.abs(n.midi + n.cent / 100 - n.vorher) > 0.05).length;
  melde('tonhoehe', 100);
  return { y, gereinigt, getimed, noten, anker, bericht, tr };
}

async function tonSchieben(x, sr, note, cent) {
  const m = await module();
  if (m.ton && m.ton.verschieben) {
    try { const y = m.ton.verschieben(x, sr, note, cent); if (y && y.length === x.length) return y; } catch (e) { /* Ersatz */ }
  }
  // Ersatz: ganzen Ausschnitt schieben, Ränder (außerhalb der Note) überblenden
  const y = ersatzSchieben(x, sr, 2 ** (cent / 1200)), out = Float32Array.from(x);
  const a = Math.max(0, Math.round(note.t0 * sr)), b = Math.min(x.length, Math.round(note.t1 * sr)), F = Math.round(0.01 * sr);
  for (let i = a; i < b; i++) { const g = Math.min(1, (i - a) / F, (b - i) / F); out[i] = x[i] * (1 - g) + y[i] * g; }
  return out;
}

export async function bearbeiten(msg, melde = () => {}) {
  const m = await module();
  if (msg.typ === 'auto') return auto(msg.x, msg.sr, msg.opt, melde);
  if (msg.typ === 'warp') {
    if (!m.tim) throw new Error('timing.js fehlt');
    return { y: m.tim.warp(msg.x, msg.sr, msg.anker) };
  }
  if (msg.typ === 'ton') {
    const y = await tonSchieben(msg.x, msg.sr, msg.note, msg.cent);
    let note = null;
    if (m.ton && m.ton.noteVerschoben && msg.note.kurve && msg.note.kurve.length) { try { note = m.ton.noteVerschoben(msg.note, msg.cent); } catch (e) { note = null; } }
    return { y, note };
  }
  if (msg.typ === 'analyse') {
    if (m.ton) { const sp = m.ton.verfolgen(msg.x, msg.sr, 0.005); return { noten: (m.ton.noten(sp) || []).map((n) => Object.assign({}, n, { kurve: Array.from(kurveMidi(n)) })) }; }
    return { noten: ersatzNoten(ersatzSpur(msg.x, msg.sr)) };
  }
  if (msg.typ === 'module') return { fehlt: m.fehlt };
  throw new Error('unbekannter Auftrag ' + msg.typ);
}

// ---------------------------------------------------------------- Worker-Anschluss (nur im Worker aktiv)
const imWorker = typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope;
if (imWorker) {
  self.onmessage = async (e) => {
    const msg = e.data || {}, id = msg.id;
    let letzt = -1, letztS = '';
    const melde = (schritt, prozent) => {
      const p = Math.round(prozent);
      if (p === letzt && schritt === letztS) return;
      letzt = p; letztS = schritt;
      self.postMessage({ typ: 'stand', id, schritt, prozent: p });
    };
    try {
      const r = await bearbeiten(msg, melde);
      const tr = [];
      for (const k of ['y', 'gereinigt', 'getimed']) if (r[k] && r[k].buffer && !tr.includes(r[k].buffer)) tr.push(r[k].buffer);
      // gleiche Puffer nicht doppelt übertragen (z. B. Timing aus → getimed === gereinigt)
      self.postMessage(Object.assign({ typ: 'fertig', id }, r), tr);
    } catch (err) {
      self.postMessage({ typ: 'fehler', id, text: String((err && err.message) || err) });
    }
  };
}
