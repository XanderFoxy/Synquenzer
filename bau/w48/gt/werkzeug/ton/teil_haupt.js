
// ---------------------------------------------------------------- tonhoehe / melodieAusAudio

export function tonhoehe(x, sr, opt = {}) {
  if (!x || !x.length || !(sr > 0)) return { t: [], hz: [], sicher: [], pegel: [], hop: opt.hop ?? 0.01, sr };
  const hop = opt.hop ?? 0.01;
  const s = verfolgen(x, sr, hop, { fmin: opt.fmin ?? 65, fmax: opt.fmax ?? 1100, schwelle: opt.schwelle, stimmlos: opt.stimmlos, fortschritt: opt.fortschritt });
  return { t: Array.from(s.t), hz: Array.from(s.f0), sicher: Array.from(s.sicher), pegel: Array.from(s.pegel), hop, sr };
}

// Spur vereinheitlichen: tonhoehe()-Ergebnis oder Liste von Mikrofon-Meldungen
function alsSpur(spur) {
  if (Array.isArray(spur)) {
    const hz = [], sicher = [], pegel = [], t = [];
    let hop = 1 / 30;
    if (spur.length > 2 && spur[0].zeit != null && spur[spur.length - 1].zeit != null) {
      const d = (spur[spur.length - 1].zeit - spur[0].zeit) / (spur.length - 1);
      if (d > 0.005 && d < 0.2) hop = d;
    }
    spur.forEach((e, i) => { hz.push(e && e.hz > 0 ? e.hz : 0); sicher.push(e ? e.sicher || 0 : 0); pegel.push(e && isFinite(e.pegel) ? e.pegel : -100); t.push(i * hop); });
    return { t, hz, f0: hz, sicher, pegel, hop };
  }
  const hz = spur.hz || spur.f0 || [];
  return { ...spur, hz, f0: hz, hop: spur.hop ?? (spur.t && spur.t.length > 1 ? spur.t[1] - spur.t[0] : 0.01) };
}

function gewQuantil(werte, gew, q) {
  const idx = werte.map((_, i) => i).sort((a, b) => werte[a] - werte[b]);
  let sum = 0; for (const g of gew) sum += g;
  if (!sum) return NaN;
  let acc = 0;
  for (const i of idx) { acc += gew[i]; if (acc >= q * sum) return werte[i]; }
  return werte[idx[idx.length - 1]];
}

export function melodieAusAudio(x, sr, silbenZeiten) {
  const spur = tonhoehe(x, sr, { hop: 0.01 });
  return melodieAusSpur(spur, silbenZeiten);
}

export function melodieAusSpur(spur0, silbenZeiten) {
  const spur = alsSpur(spur0), hop = spur.hop, N = spur.hz.length;
  if (!silbenZeiten || !silbenZeiten.length) {
    return noten(spur, { minSicher: 0.5, minDauer: 0.08 }).map((n) => ({
      t: Math.round(n.t0 * 1000) / 1000, dauer: Math.round((n.t1 - n.t0) * 1000) / 1000, midi: n.midi, cent: Math.round(n.cent),
    }));
  }
  const fenster = silbenZeiten.map((s, i) => {
    if (typeof s === 'number') {
      const n = silbenZeiten[i + 1];
      return { t: s, dauer: typeof n === 'number' ? Math.max(0.05, n - s) : 0.5 };
    }
    const t = s.t ?? s.start ?? 0;
    const dauer = s.dauer ?? (s.ende != null ? s.ende - t : 0.4);
    return { t, dauer: Math.max(0.02, dauer) };
  });
  return fenster.map(({ t, dauer }) => {
    // mittlere 70 % der Silbe (Konsonanten und Gleiten an den Rändern weglassen)
    const a = Math.max(0, Math.floor((t + 0.15 * dauer) / hop)), b = Math.min(N - 1, Math.ceil((t + 0.85 * dauer) / hop));
    const m = [], w = [];
    for (let i = a; i <= b; i++) if (spur.hz[i] > 0 && spur.sicher[i] >= 0.5) { m.push(hzZuMidi(spur.hz[i])); w.push(spur.sicher[i]); }
    if (m.length < 2) return { t, dauer, midi: null, cent: 0 };
    const med = gewQuantil(m, w, 0.5);
    return { t, dauer, midi: Math.round(med), cent: Math.round((med - Math.round(med)) * 100) };
  });
}

// ---------------------------------------------------------------- stimmlage

// Kernbereich (bequeme Lage, MIDI) je Stimmfach – grobe Richtwerte
const FAECHER = [
  { typ: 'Bass', g: 'm', kern: [45, 59], umfang: [40, 64] },
  { typ: 'Bariton', g: 'm', kern: [48, 63], umfang: [45, 69] },
  { typ: 'Tenor', g: 'm', kern: [52, 67], umfang: [48, 72] },
  { typ: 'Alt', g: 'w', kern: [55, 70], umfang: [53, 77] },
  { typ: 'Mezzosopran', g: 'w', kern: [58, 74], umfang: [57, 81] },
  { typ: 'Sopran', g: 'w', kern: [62, 79], umfang: [60, 84] },
];

export function stimmlage(spur0, opt = {}) {
  const spur = alsSpur(spur0), ton = opt.tonart;
  const minS = opt.minSicher ?? 0.55;
  const nn = noten(spur, { minSicher: minS, minDauer: 0.15 });
  // Lautstärke-Filter: nur Töne, die nicht viel leiser sind als der laute Teil (kein Hauch, kein Übersprechen)
  const pg = nn.map((n) => n.pegel).filter(isFinite).sort((a, b) => a - b);
  const laut = pg.length ? pg[Math.floor(0.9 * (pg.length - 1))] : -20;
  const gut = nn.filter((n) => n.pegel >= laut - 24 && n.sicher >= minS && n.streuung < 160);
  const leer = { tief: null, hoch: null, kern: [null, null], typ: '', sicherheit: 0, sekunden: 0, anzahl: 0, typen: [],
    tiefName: '', hochName: '', kernName: ['', ''],
    text: 'Noch keine sichere Stimmlage: In der Aufnahme waren zu wenige klare, gehaltene Töne. Sing am besten eine langsame Tonleiter auf „a“ – von bequem tief bis bequem hoch.' };
  if (!gut.length) return leer;
  // gehaltene Zeit je Halbton → tiefster/höchster SICHERER Ton (mind. 0,3 s insgesamt oder ein Ton ≥ 0,25 s)
  const zeit = new Map(), lang = new Map();
  const werte = [], gew = [];
  let sek = 0;
  for (const n of gut) {
    const d = n.t1 - n.t0; sek += d;
    zeit.set(n.midi, (zeit.get(n.midi) || 0) + d);
    lang.set(n.midi, Math.max(lang.get(n.midi) || 0, d));
    for (const v of n.kurve) { werte.push(v); gew.push(1); }
  }
  const sicherTon = [...zeit.keys()].filter((m) => zeit.get(m) >= 0.3 || lang.get(m) >= 0.25).sort((a, b) => a - b);
  const alle = [...zeit.keys()].sort((a, b) => a - b);
  const liste = sicherTon.length ? sicherTon : alle;
  const tief = liste[0], hoch = liste[liste.length - 1];
  const lo = Math.round(gewQuantil(werte, gew, 0.1)), hi = Math.round(gewQuantil(werte, gew, 0.9));
  // Stimmfach: Abstand des Kernbereichs (und des Umfangs) zu den Richtwerten
  let kand = FAECHER;
  if (opt.geschlecht === 'm' || opt.geschlecht === 'w') kand = FAECHER.filter((f) => f.g === opt.geschlecht);
  const mitte = (lo + hi) / 2;
  const bewertet = kand.map((f) => {
    const fm = (f.kern[0] + f.kern[1]) / 2;
    let d = Math.abs(mitte - fm);
    if (tief < f.umfang[0]) d += 0.5 * (f.umfang[0] - tief);
    if (hoch > f.umfang[1]) d += 0.5 * (hoch - f.umfang[1]);
    return { typ: f.typ, d };
  }).sort((a, b) => a.d - b.d);
  const typ = bewertet[0].typ;
  const nachbar = bewertet[1] && bewertet[1].d - bewertet[0].d < 1.5 ? bewertet[1].typ : '';
  // Sicherheit: genug gesungene Zeit, genug verschiedene Töne, klarer Abstand zum Nachbarfach
  const sicherheit = Math.round(Math.min(1, sek / 40) * Math.min(1, (hoch - tief + 1) / 12) * (nachbar ? 0.75 : 1) * 100) / 100;
  const N = (m) => midiName(m, ton);
  const grob = sicherheit < 0.4;
  let text = `Schätzung aus deiner Aufnahme (${Math.round(sek)} s klar gesungen): tiefster sicherer Ton ${N(tief)}, höchster ${N(hoch)}, `
    + `am wohlsten zwischen ${N(lo)} und ${N(hi)}. Das passt am ehesten zu ${typ}${nachbar ? ` (oder ${nachbar})` : ''}.`;
  if (!opt.geschlecht) text += ' Männer- und Frauenstimmen überschneiden sich – die Tonhöhe allein ist kein sicheres Urteil.';
  if (grob) text += ' Für eine genauere Schätzung: langsam von ganz unten bis ganz oben auf „a“ singen, ohne zu drücken.';
  return { tief, hoch, kern: [lo, hi], typ, sicherheit, text, sekunden: Math.round(sek * 10) / 10, anzahl: gut.length,
    typen: nachbar ? [typ, nachbar] : [typ], tiefName: N(tief), hochName: N(hoch), kernName: [N(lo), N(hi)] };
}

// ---------------------------------------------------------------- Echtzeit-Tonhöhe (ein Puffer, YIN)

const ARB = { d: new Float64Array(0) };
export function einzelTon(buf, sr, opt = {}) {
  const fmin = opt.fmin ?? 65, fmax = opt.fmax ?? 1100, thr = opt.schwelle ?? 0.15;
  const n = buf.length;
  let e = 0; for (let i = 0; i < n; i++) e += buf[i] * buf[i];
  const pegel = 10 * Math.log10(e / Math.max(1, n) + 1e-12);
  const tauMin = Math.max(2, Math.floor(sr / fmax)), tauMax = Math.min(Math.ceil(sr / fmin), Math.floor(n / 2));
  if (tauMax <= tauMin + 2) return { hz: 0, sicher: 0, pegel };
  const W = n - tauMax - 1;
  if (ARB.d.length < tauMax + 2) ARB.d = new Float64Array(tauMax + 2);
  const d = ARB.d;
  let cum = 0; d[0] = 1;
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let s = 0;
    for (let j = 0; j < W; j++) { const a = buf[j] - buf[j + tau]; s += a * a; }
    cum += s; d[tau] = cum > 0 ? s * tau / cum : 1;
  }
  let best = -1;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (d[tau] < thr) { while (tau + 1 <= tauMax && d[tau + 1] < d[tau]) tau++; best = tau; break; }
  }
  if (best < 0) { let bv = 1e9; for (let tau = tauMin; tau <= tauMax; tau++) if (d[tau] < bv) { bv = d[tau]; best = tau; } }
  // Stetigkeit: liegt nahe der letzten Tonhöhe ein fast ebenso gutes Tal, dieses nehmen (keine Oktavsprünge)
  if (opt.vorher > 0) {
    const tv = sr / opt.vorher, a = Math.max(tauMin, Math.floor(tv * 0.94)), b = Math.min(tauMax, Math.ceil(tv * 1.06));
    let bi = -1, bv = 1e9;
    for (let tau = a; tau <= b; tau++) if (d[tau] < bv && d[tau] <= d[tau - 1] && d[tau] <= d[tau + 1]) { bv = d[tau]; bi = tau; }
    if (bi > 0 && Math.abs(bi - best) > 2 && bv < d[best] + 0.1) best = bi;
  }
  const y0 = d[best - 1], y1 = d[best], y2 = d[best + 1], den = y0 - 2 * y1 + y2;
  const dt = den > 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (y0 - y2) / den)) : 0;
  const sicher = Math.max(0, Math.min(1, 1 - y1));
  if (y1 > 0.35) return { hz: 0, sicher, pegel };
  return { hz: sr / (best + dt), sicher, pegel };
}

export async function mikrofon({ onTon, onFehler, ctx, fmin = 65, fmax = 1100, minPegel = -58, rate = 30 } = {}) {
  const md = G.navigator && G.navigator.mediaDevices;
  if (!md || !md.getUserMedia) throw new Error('Mikrofon ist hier nicht verfügbar (die Seite braucht https und einen Browser mit Mikrofon-Zugriff).');
  let stream;
  try {
    stream = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
  } catch (e) {
    const t = e && e.name === 'NotAllowedError' ? 'Mikrofon-Zugriff wurde nicht erlaubt. In den Einstellungen für diese Seite erlauben und noch einmal tippen.'
      : 'Mikrofon konnte nicht gestartet werden: ' + (e && e.message || e);
    throw new Error(t);
  }
  const AC = G.AudioContext || G.webkitAudioContext;
  const eigen = !ctx;
  const ac = ctx || new AC();
  if (ac.state === 'suspended') { try { await ac.resume(); } catch (e) { /* egal */ } }
  const quelle = ac.createMediaStreamSource(stream);
  const an = ac.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0;
  const still = ac.createGain(); still.gain.value = 0; // Safari rechnet Analyser nur, wenn sie am Ausgang hängen
  quelle.connect(an); an.connect(still); still.connect(ac.destination);
  const roh = new Float32Array(an.fftSize);
  const D = ac.sampleRate >= 32000 ? 2 : 1, srd = ac.sampleRate / D;
  const klein = new Float32Array(Math.floor(roh.length / D));
  const verlauf = [];
  let vorher = 0, vorherZeit = -1, aus = false;
  const t0 = performance.now();
  const schritt = () => {
    if (aus) return;
    try {
      an.getFloatTimeDomainData(roh);
      if (D === 2) for (let i = 0, j = 0; j < klein.length; i += 2, j++) klein[j] = 0.25 * (roh[i > 0 ? i - 1 : 0]) + 0.5 * roh[i] + 0.25 * roh[i + 1];
      else klein.set(roh.subarray(0, klein.length));
      const zeit = (performance.now() - t0) / 1000;
      const r = einzelTon(klein, srd, { fmin, fmax, vorher: zeit - vorherZeit < 0.25 ? vorher : 0 });
      const st = r.hz > 0 && r.pegel >= minPegel;
      let ereignis;
      if (st) {
        vorher = r.hz; vorherZeit = zeit;
        verlauf.push(hzZuMidi(r.hz)); if (verlauf.length > 3) verlauf.shift();
        const s = verlauf.slice().sort((a, b) => a - b), m = s[s.length >> 1];
        const midi = Math.round(m);
        ereignis = { hz: midiZuHz(m), midi, midiGenau: m, cent: Math.round((m - midi) * 100), sicher: r.sicher, pegel: r.pegel, name: midiName(midi), zeit };
      } else {
        if (zeit - vorherZeit > 0.12) verlauf.length = 0;
        ereignis = { hz: 0, midi: null, midiGenau: null, cent: 0, sicher: 0, pegel: r.pegel, name: '', zeit };
      }
      if (onTon) onTon(ereignis);
    } catch (e) { if (onFehler) onFehler(e); }
  };
  const uhr = setInterval(schritt, Math.round(1000 / rate));
  const stop = () => {
    if (aus) return; aus = true;
    clearInterval(uhr);
    try { quelle.disconnect(); an.disconnect(); still.disconnect(); } catch (e) { /* egal */ }
    for (const tr of stream.getTracks()) tr.stop();
    if (eigen) { try { ac.close(); } catch (e) { /* egal */ } }
  };
  stop.ctx = ac; stop.stream = stream;
  return stop;
}

// ---------------------------------------------------------------- vokalStimme (Formant-Synthese)

// Männerstimme, deutsche Vokale: [F1, F2, F3, F4] Hz und Bandbreiten; Frauen ≈ ×1,15
const FORMANTEN = {
  a: [730, 1250, 2500, 3400], e: [360, 2050, 2600, 3400], i: [280, 2250, 2950, 3500],
  o: [400, 760, 2450, 3300], u: [310, 690, 2300, 3200], 'ä': [560, 1750, 2500, 3400],
  'ö': [420, 1450, 2350, 3300], 'ü': [290, 1700, 2150, 3300],
};
const BANDBREITE = [90, 110, 160, 220];
const GEWICHT = [1, 0.85, 0.5, 0.3];

function normVokal(v) {
  let s = String(v ?? 'a').trim().toLowerCase();
  s = s.replace('ae', 'ä').replace('oe', 'ö').replace('ue', 'ü').replace('ə', 'ö').replace('schwa', 'ö');
  return s;
}
function vokalTeile(vokal, gleit) {
  const s = normVokal(vokal);
  let a = s[0] || 'a', b = gleit ? normVokal(gleit)[0] : '';
  if (!b && s.length > 1) {
    const zwei = s.slice(0, 2);
    const DI = { ai: ['a', 'i'], ei: ['a', 'i'], ay: ['a', 'i'], au: ['a', 'u'], ou: ['o', 'u'], eu: ['o', 'ü'], 'äu': ['o', 'ü'], oi: ['o', 'i'], ie: ['i', ''], 'ee': ['e', ''], oo: ['o', ''] };
    if (DI[zwei]) { a = DI[zwei][0]; b = DI[zwei][1]; }
  }
  if (!FORMANTEN[a]) a = 'ö';
  if (b && !FORMANTEN[b]) b = '';
  return { a, b };
}
function formantSatz(v, f0, stimme) {
  const k = stimme === 'w' ? 1.15 : 1;
  const F = FORMANTEN[v].map((f) => f * k);
  // hohe Töne: F1 folgt dem Grundton (so machen es Sänger auch – der Vokal öffnet sich etwas)
  if (F[0] < f0 * 1.08) F[0] = f0 * 1.08;
  if (F[1] < F[0] * 1.4) F[1] = F[0] * 1.4;
  return F;
}

export function vokalStimme(ctx, opt = {}) {
  const ziel = opt.ziel || ctx.destination;
  const aus = ctx.createGain(); aus.gain.value = opt.lautstaerke ?? 0.8; aus.connect(ziel);
  const vib = opt.vibrato ?? 25, stimme = opt.stimme || 'm';
  const aktiv = new Set();
  function singe(vokal, midi, start, dauer = 1, gleit = '') {
    const jetzt = ctx.currentTime;
    const t0 = Math.max(start ?? jetzt, jetzt), d = Math.max(0.1, dauer || 0), t1 = t0 + d;
    const f0 = midiZuHz(midi);
    const { a, b } = vokalTeile(vokal, gleit);
    const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(f0, t0);
    const nodes = [osc];
    // leichtes Vibrato, setzt nach ~0,3 s weich ein
    let lfo = null;
    if (vib > 0 && d > 0.35) {
      lfo = ctx.createOscillator(); lfo.frequency.value = 5.3;
      const lg = ctx.createGain(), hub = f0 * (Math.pow(2, vib / 1200) - 1);
      lg.gain.setValueAtTime(0, t0); lg.gain.setValueAtTime(0, t0 + 0.25); lg.gain.linearRampToValueAtTime(hub, t0 + Math.min(0.7, d * 0.6));
      lfo.connect(lg); lg.connect(osc.frequency); nodes.push(lfo, lg);
    }
    const glatt = ctx.createBiquadFilter(); glatt.type = 'lowpass'; glatt.frequency.value = 5000; glatt.Q.value = 0.5;
    osc.connect(glatt); nodes.push(glatt);
    const huelle = ctx.createGain(); huelle.gain.value = 0; huelle.connect(aus); nodes.push(huelle);
    const F = formantSatz(a, f0, stimme), Z = b ? formantSatz(b, f0, stimme) : null;
    const gDauer = Math.min(0.28, Math.max(0.08, d * 0.35)), gEnde = t1 - Math.min(0.06, d * 0.1), gStart = gEnde - gDauer;
    for (let k = 0; k < 4; k++) {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      const bw = Math.max(BANDBREITE[k], k === 0 ? f0 * 0.5 : 0);
      bp.frequency.setValueAtTime(F[k], t0); bp.Q.setValueAtTime(F[k] / bw, t0);
      if (Z && gStart > t0 + 0.05) {
        bp.frequency.setValueAtTime(F[k], gStart); bp.frequency.linearRampToValueAtTime(Z[k], gEnde);
        bp.Q.setValueAtTime(F[k] / bw, gStart); bp.Q.linearRampToValueAtTime(Z[k] / Math.max(BANDBREITE[k], k === 0 ? f0 * 0.5 : 0), gEnde);
      }
      const g = ctx.createGain(); g.gain.value = GEWICHT[k] * 3.2;
      glatt.connect(bp); bp.connect(g); g.connect(huelle); nodes.push(bp, g);
    }
    // Grundton-Wärme (tiefe Vokale u/o/i haben einen kräftigen Grundton)
    const tp = ctx.createBiquadFilter(); tp.type = 'lowpass'; tp.frequency.value = f0 * 1.5; tp.Q.value = 0.7;
    const tg = ctx.createGain(); tg.gain.value = 0.35;
    glatt.connect(tp); tp.connect(tg); tg.connect(huelle); nodes.push(tp, tg);
    // sanfte Hüllkurve
    const att = Math.min(0.07, d * 0.25), rel = Math.min(0.12, d * 0.3);
    huelle.gain.setValueAtTime(0, t0);
    huelle.gain.linearRampToValueAtTime(1, t0 + att);
    huelle.gain.setValueAtTime(1, t1 - rel);
    huelle.gain.linearRampToValueAtTime(0, t1);
    const eintrag = { osc, lfo, huelle, nodes };
    aktiv.add(eintrag);
    osc.onended = () => { aktiv.delete(eintrag); for (const n of nodes) { try { n.disconnect(); } catch (e) { /* egal */ } } };
    osc.start(t0); osc.stop(t1 + 0.03);
    if (lfo) { lfo.start(t0); lfo.stop(t1 + 0.03); }
    return { start: t0, ende: t1 };
  }
  function stopp() {
    const t = ctx.currentTime;
    for (const e of aktiv) {
      try {
        e.huelle.gain.cancelScheduledValues(t); e.huelle.gain.setValueAtTime(e.huelle.gain.value, t); e.huelle.gain.linearRampToValueAtTime(0, t + 0.04);
        e.osc.stop(t + 0.05); if (e.lfo) e.lfo.stop(t + 0.05);
      } catch (err) { /* schon beendet */ }
    }
  }
  return { singe, stopp, ausgang: aus };
}

// ---------------------------------------------------------------- klavier

export function klavier(ctx, opt = {}) {
  const ziel = opt.ziel || ctx.destination;
  const aus = ctx.createGain(); aus.gain.value = opt.lautstaerke ?? 0.6; aus.connect(ziel);
  const wellen = new Map();
  const welle = (hell) => {
    if (wellen.has(hell)) return wellen.get(hell);
    const H = 16, re = new Float32Array(H + 1), im = new Float32Array(H + 1);
    for (let n = 1; n <= H; n++) im[n] = Math.pow(n, -(hell ? 1.15 : 1.6)) * (n % 7 === 0 ? 0.3 : 1);
    const w = ctx.createPeriodicWave(re, im); wellen.set(hell, w); return w;
  };
  const aktiv = new Set();
  function spiele(midi, start, dauer = 0.8, staerke = 0.8) {
    const jetzt = ctx.currentTime, t0 = Math.max(start ?? jetzt, jetzt), t1 = t0 + Math.max(0.05, dauer || 0);
    const f = midiZuHz(midi), w = welle(midi < 60);
    const g = ctx.createGain(); g.gain.value = 0; g.connect(aus);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.6;
    const hell = Math.min(16000, f * (5 + 9 * staerke));
    lp.frequency.setValueAtTime(hell, t0); lp.frequency.setTargetAtTime(Math.max(f * 2.2, 400), t0 + 0.01, 0.35);
    lp.connect(g);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.setPeriodicWave(w); o2.setPeriodicWave(w);
    o1.frequency.value = f * Math.pow(2, 1.2 / 1200); o2.frequency.value = f * Math.pow(2, -1.2 / 1200);
    const m = ctx.createGain(); m.gain.value = 0.5;
    o1.connect(m); o2.connect(m); m.connect(lp);
    const spitze = 0.35 * Math.max(0.1, Math.min(1, staerke));
    const tau = Math.max(0.25, Math.min(2.5, 1.1 * Math.pow(2, -(midi - 60) / 18)));
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(spitze, t0 + 0.005);
    g.gain.setTargetAtTime(spitze * 0.02, t0 + 0.005, tau);
    g.gain.setTargetAtTime(0, t1, 0.07);
    const nodes = [o1, o2, m, lp, g], e = { o1, o2, g, nodes };
    aktiv.add(e);
    o1.onended = () => { aktiv.delete(e); for (const n of nodes) { try { n.disconnect(); } catch (err) { /* egal */ } } };
    o1.start(t0); o2.start(t0); o1.stop(t1 + 0.5); o2.stop(t1 + 0.5);
    return { start: t0, ende: t1 };
  }
  function stopp() {
    const t = ctx.currentTime;
    for (const e of aktiv) {
      try { e.g.gain.cancelScheduledValues(t); e.g.gain.setValueAtTime(e.g.gain.value, t); e.g.gain.linearRampToValueAtTime(0, t + 0.04); e.o1.stop(t + 0.05); e.o2.stop(t + 0.05); } catch (err) { /* egal */ }
    }
  }
  return { spiele, stopp, ausgang: aus };
}

// ---------------------------------------------------------------- im Hintergrund (Worker)

let arbeiter = null, auftragNr = 0;
const offen = new Map();
function lokal(auftrag, x, sr, opt) {
  if (auftrag === 'melodie') return melodieAusAudio(x, sr, opt && opt.silbenZeiten);
  const spur = tonhoehe(x, sr, opt);
  if (auftrag === 'stimmlage') return { spur, stimme: stimmlage(spur, opt) };
  return spur;
}
export function imHintergrund(auftrag, x, sr, opt = {}) {
  const o = { ...opt }; delete o.fortschritt;
  if (!G.Worker || typeof document === 'undefined') return Promise.resolve().then(() => lokal(auftrag, x, sr, opt));
  try {
    if (!arbeiter) {
      arbeiter = new Worker(new URL('./ton-worker.js', import.meta.url), { type: 'module' });
      arbeiter.onmessage = (e) => {
        const p = offen.get(e.data.id); if (!p) return;
        if (e.data.stand != null) { if (p.fortschritt) p.fortschritt(e.data.stand); return; }
        offen.delete(e.data.id);
        e.data.ok ? p.res(e.data.r) : p.rej(new Error(e.data.fehler));
      };
      arbeiter.onerror = () => { for (const [, p] of offen) p.lokal(); offen.clear(); arbeiter = null; };
    }
    return new Promise((res, rej) => {
      const id = ++auftragNr;
      offen.set(id, { res, rej, fortschritt: opt.fortschritt, lokal: () => { try { res(lokal(auftrag, x, sr, opt)); } catch (e) { rej(e); } } });
      arbeiter.postMessage({ id, auftrag, x, sr, opt: o });
    });
  } catch (e) {
    return Promise.resolve().then(() => lokal(auftrag, x, sr, opt));
  }
}
