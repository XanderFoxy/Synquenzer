// Gesangstrainer – vokalspiegel.js: Live-„Vokal-Spiegel“ beim Mitsingen. Alles lokal, nichts wird gesendet.
//
// export function vokalSpiegel(el, {stimme, ziel, onRahmen}) → {start(ctx) (nur aus einem Tipp!), stopp(), zeileFertig(name), laeuft}
//   ziel()     → aktuelle Silbe {vokal, gleit, t, ende, text} oder null (Ziel-Vokal wird hervorgehoben)
//   onRahmen   ← {zeit, hz, midiGenau, F1, F2, pegel} ≈ alle 30 ms (für die Tonhöhen-Linie in mitsingen.js)
// Ablauf: Mikrofon → AnalyserNode, im rAF je 30 ms: f0 (einzelTon aus ton.js, YIN) und F1/F2 (LPC, vokalfilter.js)
//   → Punkt im Vokal-Dreieck (F2 waagrecht, F1 senkrecht), Männer-Zielbereiche in den Vokalfarben der App.
//   Rückmeldung nur in Worten (ruhig/wackelig, sauber/wandert, Doppellaut zu früh/zu spät), keine Zähler, keine Prozente.

import { formantenRahmen, VOKAL_FORMANTEN, vokalPaar } from './vokalfilter.js';

const FARBE = { a: '#ff7f4e', e: '#ffc23e', i: '#33cdd0', o: '#b56cff', u: '#5a98ff', 'ä': '#ffa253', 'ö': '#b9a3cf', 'ü': '#5fd884' };
const GUT = { a: 'offen', e: 'klar', i: 'hell', o: 'rund', u: 'rund', 'ä': 'klar', 'ö': 'locker', 'ü': 'rund' };
const NAME = (v) => (v === 'ö' ? 'ö' : v.toUpperCase());
const F1MIN = 220, F1MAX = 900, F2MIN = 550, F2MAX = 2700;

function stil() {
  if (document.getElementById('vs-stil')) return;
  const s = document.createElement('style'); s.id = 'vs-stil';
  s.textContent = `
.vs { display: grid; gap: 10px; }
.vs-flaeche { position: relative; width: 100%; aspect-ratio: 1.35; max-height: 300px; border-radius: 18px; overflow: hidden; background: var(--karte2); }
.vs-flaeche canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.vs-worte { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; min-height: 36px; }
.vs-worte span { padding: 6px 12px; border-radius: 999px; background: var(--karte2); font-size: 15px; font-weight: 700; }
.vs-worte span.gut { color: var(--gut); } .vs-worte span.achtung { color: var(--sanft); }
.vs-fazit { text-align: center; color: var(--leise); font-size: 16px; min-height: 24px; }
`;
  document.head.append(s);
}

export function vokalSpiegel(el, { stimme = 'm', ziel = () => null, onRahmen = null } = {}) {
  stil();
  const k = stimme === 'w' ? 1.15 : 1;
  const leinwand = document.createElement('canvas');
  const flaeche = document.createElement('div'); flaeche.className = 'vs-flaeche'; flaeche.append(leinwand);
  const worte = document.createElement('div'); worte.className = 'vs-worte'; worte.setAttribute('aria-live', 'polite');
  const fazit = document.createElement('p'); fazit.className = 'vs-fazit';
  fazit.textContent = 'Vokal-Spiegel: Mikrofon einschalten und mitsingen (Kopfhörer helfen).';
  const box = document.createElement('div'); box.className = 'vs'; box.append(flaeche, worte, fazit);
  el.append(box);

  let ctx = null, strom = null, quelle = null, ana = null, puffer = null, raf = 0, letzte = 0, laeuft = false, einzelTon = null;
  const spur = [];            // letzte 0,5 s für die Spur im Dreieck
  let silbe = null, daten = [], zeilenNotizen = [];

  const xy = (F1, F2, w, h) => [w * (1 - (Math.log(F2 / F2MIN) / Math.log(F2MAX / F2MIN))), h * (Math.log(F1 / F1MIN) / Math.log(F1MAX / F1MIN))];
  const imZiel = (v, F1, F2) => { const Z = VOKAL_FORMANTEN[v]; return Z && Math.hypot(Math.log(F1 / (Z[0] * k)) / 0.2, Math.log(F2 / (Z[1] * k)) / 0.16) <= 1; };
  const naechster = (F1, F2) => {
    let best = 'a', bd = 1e9;
    for (const v of ['a', 'e', 'i', 'o', 'u']) { const Z = VOKAL_FORMANTEN[v]; const d = Math.hypot(Math.log(F1 / (Z[0] * k)), Math.log(F2 / (Z[1] * k))); if (d < bd) { bd = d; best = v; } }
    return best;
  };

  function zeichne() {
    const r = flaeche.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
    if (leinwand.width !== w * dpr) { leinwand.width = w * dpr; leinwand.height = h * dpr; }
    const g = leinwand.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const z = ziel(), zv = z ? vokalPaar(z.vokal, z.gleit) : { a: '', b: '' };
    for (const v of Object.keys(VOKAL_FORMANTEN)) {
      const Z = VOKAL_FORMANTEN[v], [x, y] = xy(Z[0] * k, Z[1] * k, w, h);
      const hervor = v === zv.a || v === zv.b, klein = !'aeiou'.includes(v);
      const rx = w * 0.16 / Math.log(F2MAX / F2MIN) * (klein ? 0.8 : 1), ry = h * 0.2 / Math.log(F1MAX / F1MIN) * (klein ? 0.8 : 1);
      g.globalAlpha = hervor ? 0.62 : klein ? 0.14 : 0.24; g.fillStyle = FARBE[v];
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
      if (hervor) { g.globalAlpha = 1; g.lineWidth = 3; g.strokeStyle = FARBE[v]; g.stroke(); }
      g.globalAlpha = hervor ? 1 : 0.8; g.fillStyle = hervor ? '#2a1622' : getComputedStyle(box).color;
      g.font = `800 ${hervor ? 22 : klein ? 13 : 17}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(NAME(v), x, y);
    }
    if (zv.b) { // Gleitweg des Doppellauts
      const A = VOKAL_FORMANTEN[zv.a], B = VOKAL_FORMANTEN[zv.b], p = xy(A[0] * k, A[1] * k, w, h), q = xy(B[0] * k, B[1] * k, w, h);
      g.globalAlpha = 0.7; g.setLineDash([6, 6]); g.lineWidth = 2; g.strokeStyle = FARBE[zv.b]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.setLineDash([]);
    }
    const jetzt = performance.now() / 1000;
    const sicht = spur.filter((p) => jetzt - p.t < 0.5);
    if (sicht.length) {
      g.globalAlpha = 0.5; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = getComputedStyle(box).color;
      g.beginPath(); sicht.forEach((p, i) => { const [x, y] = xy(p.F1, p.F2, w, h); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      const l = sicht[sicht.length - 1], [x, y] = xy(l.F1, l.F2, w, h);
      g.globalAlpha = 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
      g.lineWidth = 3; g.strokeStyle = FARBE[naechster(l.F1, l.F2)]; g.stroke();
    }
    g.globalAlpha = 1;
  }

  // ---- Auswertung je Silbe (in Worten) ----
  function silbeFertig(s, d) {
    if (!s || d.length < 4) return;
    const { a, b } = vokalPaar(s.vokal, s.gleit); if (!a) return;
    const dauer = Math.max(0.05, s.ende - s.t);
    const kern = d.filter((p) => { const u = (p.zeit - s.t) / dauer; return u > 0.2 && u < (b ? 0.6 : 0.85); });
    const tonD = kern.filter((p) => p.midiGenau != null);
    let ton = null;
    if (tonD.length >= 4) {
      const m = tonD.reduce((x, p) => x + p.midiGenau, 0) / tonD.length;
      const sd = Math.sqrt(tonD.reduce((x, p) => x + (p.midiGenau - m) ** 2, 0) / tonD.length) * 100;
      ton = sd < 28 ? 'ruhig' : sd < 55 ? 'etwas unruhig' : 'wackelig';
    }
    const fD = kern.filter((p) => p.F1);
    let vokal = null, ende = null, uebergang = null;
    if (fD.length >= 3) {
      const treffer = fD.filter((p) => imZiel(a, p.F1, p.F2)).length / fD.length;
      const l1 = fD.map((p) => Math.log(p.F1)), l2 = fD.map((p) => Math.log(p.F2));
      const sd = (v) => { const m = v.reduce((x, y) => x + y, 0) / v.length; return Math.sqrt(v.reduce((x, y) => x + (y - m) ** 2, 0) / v.length); };
      const streu = Math.hypot(sd(l1) / 0.2, sd(l2) / 0.16);
      if (treffer >= 0.55 && streu < 0.8) vokal = GUT[a] || 'sauber';
      else {
        const mF1 = Math.exp(l1.reduce((x, y) => x + y, 0) / l1.length), mF2 = Math.exp(l2.reduce((x, y) => x + y, 0) / l2.length);
        const nv = naechster(mF1, mF2);
        vokal = streu >= 0.8 ? 'wandert' : nv !== a ? `klingt nach ${NAME(nv)}` : 'noch nicht ganz im Ziel';
      }
      if (!b) {
        const spaet = d.filter((p) => p.F1 && (p.zeit - s.t) / dauer > 0.75);
        if (spaet.length >= 3) {
          const mF1 = Math.exp(spaet.reduce((x, p) => x + Math.log(p.F1), 0) / spaet.length), mF2 = Math.exp(spaet.reduce((x, p) => x + Math.log(p.F2), 0) / spaet.length);
          const nv = naechster(mF1, mF2); if (nv !== a && !imZiel(a, mF1, mF2)) ende = `rutscht am Ende ins ${NAME(nv)}`;
        }
      }
    }
    if (b) { // Doppellaut: wann kippt der Klang vom Haupt- zum Nachlaut?
      const A = VOKAL_FORMANTEN[a], B = VOKAL_FORMANTEN[b];
      const naeher = (p) => Math.hypot(Math.log(p.F1 / B[0] / k), Math.log(p.F2 / B[1] / k)) < Math.hypot(Math.log(p.F1 / A[0] / k), Math.log(p.F2 / A[1] / k));
      const f = d.filter((p) => p.F1); const kipp = f.find((p, i) => naeher(p) && f.slice(i, i + 3).every(naeher));
      const u = kipp ? (kipp.zeit - s.t) / dauer : null;
      uebergang = u == null ? `${NAME(a)}${b} gleitet nicht hinüber` : u < 0.5 ? `${NAME(a)}${b}: Gleiten zu früh` : u > 0.93 ? `${NAME(a)}${b}: Gleiten zu spät` : `${NAME(a)}${b} gleitet schön`;
    }
    const notiz = { vokal: a, gleit: b, ton, klang: vokal, ende, uebergang };
    zeilenNotizen.push(notiz);
    const teile = [];
    if (vokal) teile.push([`${NAME(a)}${b || ''} ${vokal}`, /offen|klar|hell|rund|locker|sauber/.test(vokal) ? 'gut' : 'achtung']);
    if (ton) teile.push([`Ton ${ton}`, ton === 'ruhig' ? 'gut' : 'achtung']);
    if (ende) teile.push([ende, 'achtung']);
    if (uebergang) teile.push([uebergang, /schön/.test(uebergang) ? 'gut' : 'achtung']);
    worte.replaceChildren(...teile.map(([t, c]) => { const sp = document.createElement('span'); sp.className = c; sp.textContent = t; return sp; }));
  }

  /** Nach jeder Zeile: kurze Zusammenfassung in Worten. */
  function zeileFertig() {
    if (silbe) { silbeFertig(silbe, daten); silbe = null; daten = []; }
    const n = zeilenNotizen; zeilenNotizen = [];
    if (!n.length) return '';
    const saetze = [];
    const probleme = n.filter((x) => x.ende || (x.klang && !/offen|klar|hell|rund|locker|sauber/.test(x.klang)) || (x.uebergang && !/schön/.test(x.uebergang)));
    for (const p of probleme.slice(0, 2)) saetze.push(p.ende ? `${NAME(p.vokal)} ${p.ende}` : p.uebergang && !/schön/.test(p.uebergang) ? p.uebergang : `${NAME(p.vokal)} ${p.klang}`);
    const gut = n.find((x) => x.klang && /offen|klar|hell|rund|locker|sauber/.test(x.klang) && !probleme.includes(x));
    if (gut) saetze.unshift(`${NAME(gut.vokal)} ${gut.klang}${gut.ton ? ' und ' + gut.ton : ''}`);
    const wack = n.filter((x) => x.ton === 'wackelig').length, ruhig = n.filter((x) => x.ton === 'ruhig').length;
    if (!gut) saetze.push(wack > ruhig ? 'Tonhöhe noch wackelig – Luft gleichmäßig fließen lassen' : 'Tonhöhe ruhig');
    const text = saetze.slice(0, 3).join(', ');
    fazit.textContent = text ? text.charAt(0).toUpperCase() + text.slice(1) + '.' : '';
    return fazit.textContent;
  }

  function schritt() {
    raf = requestAnimationFrame(schritt);
    const jetzt = performance.now();
    if (ana && jetzt - letzte >= 30) {
      letzte = jetzt;
      ana.getFloatTimeDomainData(puffer);
      const sr = ctx.sampleRate, L = Math.min(puffer.length, Math.round(0.03 * sr));
      const fr = puffer.subarray(puffer.length - L);
      let e = 0; for (let i = 0; i < fr.length; i++) e += fr[i] * fr[i];
      const pegel = 10 * Math.log10(e / fr.length + 1e-12);
      let hz = 0, midiGenau = null, F = null;
      if (pegel > -55) {
        const D = Math.max(1, Math.floor(sr / 8000)), xd = new Float32Array(Math.floor(puffer.length / D));
        for (let i = 0; i < xd.length; i++) { let s = 0; for (let j = 0; j < D; j++) s += puffer[i * D + j]; xd[i] = s / D; }
        const r = einzelTon ? einzelTon(xd, sr / D, { fmin: 65, fmax: 1100 }) : null;
        if (r && r.hz > 0 && (r.sicher == null || r.sicher > 0.5)) { hz = r.hz; midiGenau = 69 + 12 * Math.log2(hz / 440); }
        if (hz) F = formantenRahmen(fr, sr);
      }
      const z = ziel(), zeit = z && z.liedZeit != null ? z.liedZeit : null;
      const p = { zeit: zeit ?? jetzt / 1000, hz, midiGenau, F1: F ? F[0] : 0, F2: F ? F[1] : 0, pegel };
      if (F) spur.push({ t: jetzt / 1000, F1: F[0], F2: F[1] });
      while (spur.length && jetzt / 1000 - spur[0].t > 0.6) spur.shift();
      if (onRahmen) onRahmen(p);
      // Silbenwechsel erkennen
      const key = z && z.t != null ? z.t : null;
      if (!silbe || key !== silbe.t) { if (silbe) silbeFertig(silbe, daten); silbe = z && z.vokal ? z : null; daten = []; }
      if (silbe && zeit != null) daten.push(p);
    }
    zeichne();
  }

  async function start(audioCtx) {
    if (laeuft) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Kein Mikrofon verfügbar');
    try { einzelTon = (await import('./ton.js')).einzelTon; } catch (e) { einzelTon = null; }
    ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
    strom = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    quelle = ctx.createMediaStreamSource(strom);
    ana = ctx.createAnalyser(); ana.fftSize = 2048; ana.smoothingTimeConstant = 0;
    puffer = new Float32Array(ana.fftSize);
    quelle.connect(ana);
    laeuft = true; fazit.textContent = 'Sing mit – der Punkt zeigt deinen Vokal.';
    cancelAnimationFrame(raf); raf = requestAnimationFrame(schritt);
  }
  function stopp() {
    laeuft = false; cancelAnimationFrame(raf); raf = 0;
    try { quelle && quelle.disconnect(); } catch (e) { /* nichts */ }
    if (strom) strom.getTracks().forEach((t) => t.stop());
    strom = null; quelle = null; ana = null; spur.length = 0; zeichne();
  }
  requestAnimationFrame(zeichne);
  return { start, stopp, zeileFertig, zeichne, get laeuft() { return laeuft; }, el: box };
}
