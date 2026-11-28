// Atem 0.2.3 – Klang-Atem: ein Klangteppich, der mit dem Atem geht (Web Audio, ohne Bibliothek, lädt erst auf „Klang & Vagus“).
// Ein Kontext je Start, angelegt im Tipp (iOS). Atem-Hülle als Attack–Sustain–Release: Einatmen schwillt an, Halten trägt,
// Ausatmen sinkt – als weiche Kosinus-Kurve aus kurzen linearen Stücken auf der Audio-Uhr (keine Sprünge, kein Knacksen).
// Rauschen: EINE nahtlose Schleife (Ende in den Anfang überblendet). Beats (optional): binaural (links/rechts getrennt,
// nur mit Kopfhörern) oder isochron (weicher Lautstärke-Puls). Lautstärke-Schutz: Obergrenze + Begrenzer + Einblenden.
export const TIEF = 0.16, HOCH = 1;
export const RHYTHMEN = {
  r6: { name: '6 pro Minute', kurz: '5 s ein · 5 s aus', phasen: [['ein', 5], ['aus', 5]], technik: 'resonanz', variante: '6_min_gleich' },
  l46: { name: 'Länger aus', kurz: '4 s ein · 6 s aus', phasen: [['ein', 4], ['aus', 6]], technik: 'lang_aus' },
  seufzer: { name: 'Seufzer', kurz: '2,5 s ein · 1 s nach · 7 s aus', phasen: [['ein', 2.5], ['ein2', 1], ['aus', 7]], technik: 'seufzer' },
  tief: { name: 'Sehr ruhig', kurz: '5 s ein · 7 s aus', phasen: [['ein', 5], ['aus', 7]], technik: 'lang_aus' }
};
export const BEATS = { delta: { name: 'Delta', hz: 2 }, theta: { name: 'Theta', hz: 6 }, alpha: { name: 'Alpha', hz: 10 } };
export const TRAEGER = { tief: 150, mittel: 220, hell: 330 };
const MAX_GAIN = 0.9, BEAT_MAX = 0.35, DECKE = 0.7;   // Regler (quadratisch, gehörgerecht) → höchstens 0,9; Beats höchstens 35 % davon; Begrenzer: nie über 0,7 (≈ −3 dBFS)

// Ziel-Pegel je Phase (0 … 1): ein → hoch (vor einem Nachfüllen etwas weniger), halten_voll trägt, aus/halten_leer → tief
export function zielPegel(phasen, i, vorher) {
  const a = phasen[i % phasen.length][0], nach = phasen[(i + 1) % phasen.length][0];
  if (a === 'ein') return nach === 'ein2' ? 0.78 : HOCH;
  if (a === 'ein2') return HOCH;
  if (a === 'halten_voll') return vorher;
  return TIEF;
}
// Wert an der Stelle t festhalten, ohne Sprung. Immer zusätzlich setValueAtTime(aktueller Wert): liegt t hinter dem letzten Ereignis,
// setzt Chrome bei cancelAndHold keinen Haltepunkt – die nächste Rampe begänne sonst beim alten Ereignis (gemessen: Sprung auf 20 %).
const halte = (p, t) => { const v = p.value; try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else p.cancelScheduledValues(t); } catch { p.cancelScheduledValues(t); } p.setValueAtTime(v, t); };
export const weich = (x) => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, x)))) / 2;   // Kosinus-Rampe 0 → 1
const hzVon = (p) => 340 * Math.pow(4.4, p);   // Filter: 340 Hz (tief) … ≈ 1500 Hz (hoch), hörbar „öffnet sich“ beim Einatmen

// Nahtlose Rauschschleife: rosa Rauschen (Kellet), die letzten F Proben werden in den Anfang überblendet (gleiche Leistung)
export function rauschDaten(n, f, zufall = Math.random) {
  const a = new Float32Array(n + f); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < a.length; i++) {
    const w = zufall() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
    a[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
  }
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) { if (i < f) { const x = i / f; d[i] = a[i] * Math.sin(x * Math.PI / 2) + a[n + i] * Math.cos(x * Math.PI / 2); } else d[i] = a[i]; }
  return d;
}

export function erzeugeKlang(o = {}) {
  let ctx = null, master = null, atemG = null, rauschG = null, tonG = null, filter = null, beat = null, quellen = [], plan = null;
  let phasen = (o.rhythmus || RHYTHMEN.r6).phasen, wechsel = null, k = 0, naechstAb = 0, pegel = TIEF, abl = [], t0 = 0, laeuft = false;
  let endeT = null, schlussAb = null, einBis = 0;   // Prüfung 0.2.3: Sitzungsende auf der Audio-Uhr (endeIn) – endet auch bei gesperrtem Bildschirm
  let einst = { klang: o.klang || 'meer', laut: o.laut ?? 0.5, beat: o.beat || null };
  const beiStoerung = o.beiStoerung || null;
  const zielLaut = () => Math.pow(Math.max(0, Math.min(1, einst.laut)), 2) * MAX_GAIN;
  const mix = () => ({ r: einst.klang === 'ton' ? 0 : einst.klang === 'beides' ? 0.75 : 1, t: einst.klang === 'meer' ? 0 : einst.klang === 'beides' ? 0.55 : 0.9 });
  function rampe(p, t, d, a, b, f = (x) => x) {   // weiche Kurve aus N linearen Stücken (iOS-sicher, keine überlappenden Kurven)
    const n = Math.max(4, Math.min(28, Math.round(d * 6)));
    for (let i = 1; i <= n; i++) p.linearRampToValueAtTime(f(a + (b - a) * weich(i / n)), t + d * i / n);
  }
  function planen() {
    if (!laeuft || !ctx) return;
    // Planung 2,5 s voraus (Prüfung: o.voraus); Seite verdeckt (Sperre/Hintergrund, Timer stehen oft): bis zum Sitzungsende im Voraus
    const weit = endeT != null && typeof document !== 'undefined' && document.hidden, bis = weit ? endeT : ctx.currentTime + (o.voraus || 2.5);
    while (naechstAb < bis && (endeT == null || naechstAb < endeT)) {
      if (wechsel && pegel <= TIEF + 1e-6) { phasen = wechsel; wechsel = null; k = 0; }   // neuer Rhythmus erst nach dem Ausatmen
      const [art, d] = phasen[k % phasen.length], nach = zielPegel(phasen, k, pegel);
      rampe(atemG.gain, naechstAb, d, pegel, nach);
      rampe(filter.frequency, naechstAb, d, pegel, nach, hzVon);
      abl.push({ ab: naechstAb, d, art, von: pegel, nach });
      pegel = nach; naechstAb += d; k++;
    }
    const alt = ctx.currentTime - 15; while (abl.length > 2 && abl[1].ab + abl[1].d < alt) abl.shift();
  }
  // Ende der Sitzung: Master 4 s linear aus (endet genau bei endeT), danach Quellen aus – ohne JS-Timer, also auch im Hintergrund
  function schlussPlanen() {
    if (!ctx || !master || endeT == null) return;
    const a = Math.max(ctx.currentTime + 0.3, einBis, endeT - 4), z = Math.max(a + 0.5, endeT);
    master.gain.linearRampToValueAtTime(zielLaut(), a); master.gain.linearRampToValueAtTime(0, z); schlussAb = a;
    for (const s of quellen) try { s.stop(z + 0.2); } catch {}
    if (beat) for (const s of beat.os) try { s.stop(z + 0.2); } catch {}
  }
  function baueBeat(b) {
    if (!ctx || !b || b.art === 'aus') return null;
    const g = ctx.createGain(), t = ctx.currentTime, hz = Math.max(0.5, Math.min(30, +b.hz || 6)), f0 = +b.traeger || TRAEGER.mittel, laut = Math.max(0, Math.min(1, b.laut ?? 0.5)) * BEAT_MAX;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(laut, t + 2.5); g.connect(master);
    const n = { g, os: [], art: b.art, hz, f0 };
    if (b.art === 'binaural') {   // links f0 − hz/2, rechts f0 + hz/2: den Schlag „baut“ erst das Gehör (nur mit Kopfhörern)
      const m = ctx.createChannelMerger(2), l = ctx.createOscillator(), r = ctx.createOscillator();
      l.frequency.value = f0 - hz / 2; r.frequency.value = f0 + hz / 2; l.connect(m, 0, 0); r.connect(m, 0, 1); m.connect(g);
      l.start(); r.start(); n.os.push(l, r); n.l = l; n.r = r;
    } else {   // isochron: ein Ton, dessen Lautstärke weich pulsiert (geformter Sinus, keine harten Kanten)
      const c = ctx.createOscillator(), a = ctx.createGain(), lfo = ctx.createOscillator(), form = ctx.createWaveShaper(), kurve = new Float32Array(256);
      for (let i = 0; i < 256; i++) kurve[i] = Math.pow((i / 255), 2.2);   // Eingang −1 … 1 → 0 … 1, Puls schmaler, Flanken weich
      form.curve = kurve; c.frequency.value = f0; a.gain.value = 0; lfo.frequency.value = hz; lfo.connect(form); form.connect(a.gain);
      c.connect(a); a.connect(g); c.start(); lfo.start(); n.os.push(c, lfo); n.lfo = lfo; n.c = c;
    }
    return n;
  }
  function beatWeg(n, blende = 0.6) {
    if (!n || !ctx) return; const t = ctx.currentTime;
    try { halte(n.g.gain, t); n.g.gain.linearRampToValueAtTime(0, t + blende); } catch {}
    for (const x of n.os) try { x.stop(t + blende + 0.05); } catch {}
    setTimeout(() => { try { n.g.disconnect(); } catch {} }, (blende + 0.2) * 1000);
  }
  const A = {
    // Im Tipp aufrufen (vor jedem await): legt den Kontext an und startet sofort leise (Einblenden 2 s)
    start() {
      A.stop(0.05, true);
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
      ctx = o.kontext ? o.kontext() : new AC({ latencyHint: 'playback' });   // o.kontext: nur für die Prüfung (OfflineAudioContext)
      try { const sb = ctx.createBuffer(1, 1, ctx.sampleRate), s = ctx.createBufferSource(); s.buffer = sb; s.connect(ctx.destination); s.start(0); } catch {}   // stiller Puffer im Tipp (iOS)
      if (ctx.state !== 'running' && !o.kontext) { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); }
      const c = ctx; c.onstatechange = () => { if (c === ctx && laeuft && c.state !== 'running' && c.state !== 'closed' && beiStoerung) beiStoerung(c.state); };
      const lim = ctx.createWaveShaper(), kv = new Float32Array(1025); for (let i = 0; i < 1025; i++) { const x = (i / 512 - 1) * 2; kv[i] = DECKE * Math.tanh(x / DECKE); }   // weicher Begrenzer ohne Nachverstärkung (ein Kompressor hebt leise Stellen an)
      lim.curve = kv; lim.oversample = '2x'; lim.connect(ctx.destination);
      const vor = ctx.createGain(); vor.gain.value = 0.5; vor.connect(lim);   // Kurve deckt −2 … 2 ab: Eingang halbieren, Ausgang ×2 in der Kurve
      master = ctx.createGain(); master.gain.value = 0; master.connect(vor);
      atemG = ctx.createGain(); atemG.gain.value = TIEF; atemG.connect(master);
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.Q.value = 0.4; filter.frequency.value = hzVon(TIEF);
      const m = mix(); rauschG = ctx.createGain(); rauschG.gain.value = m.r; tonG = ctx.createGain(); tonG.gain.value = m.t;
      const sr = ctx.sampleRate, n = Math.round(sr * 6), buf = ctx.createBuffer(2, n, sr);
      buf.getChannelData(0).set(rauschDaten(n, Math.round(sr * 0.5))); buf.getChannelData(1).set(rauschDaten(n, Math.round(sr * 0.5)));   // zwei Kanäle: etwas Raum
      const q = ctx.createBufferSource(); q.buffer = buf; q.loop = true; q.connect(filter); filter.connect(rauschG); rauschG.connect(atemG);
      const tf = ctx.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.value = 900; tf.connect(tonG); tonG.connect(atemG);
      for (const [hz, a] of [[110, 0.2], [164.8, 0.12], [220.6, 0.07]]) { const os = ctx.createOscillator(), g = ctx.createGain(); os.frequency.value = hz; g.gain.value = a; os.connect(g); g.connect(tf); os.start(); quellen.push(os); }   // leiser Grundton: Grundton, Quinte, Oktave (leicht verstimmt → schwebt)
      q.start(); quellen.push(q);
      t0 = ctx.currentTime + 0.05; naechstAb = t0; k = 0; pegel = TIEF; abl = [];
      if (wechsel) { phasen = wechsel; wechsel = null; }
      master.gain.setValueAtTime(0, ctx.currentTime); master.gain.linearRampToValueAtTime(zielLaut(), ctx.currentTime + 2); einBis = ctx.currentTime + 2;
      atemG.gain.setValueAtTime(TIEF, t0); filter.frequency.setValueAtTime(hzVon(TIEF), t0);
      laeuft = true; planen(); plan = setInterval(planen, 250);
      if (einst.beat && einst.beat.art !== 'aus') beat = baueBeat(einst.beat);
      return true;
    },
    // Ausblenden, dann Quellen stoppen und Kontext schließen
    stop(blende = 0.8, still) {
      clearInterval(plan); plan = null; laeuft = false;
      if (!ctx) return; const c = ctx, m = master, q = quellen, b = beat, t = c.currentTime;
      try { halte(m.gain, t); m.gain.linearRampToValueAtTime(0, t + blende); } catch {}
      for (const s of q) try { s.stop(t + blende + 0.05); } catch {}
      if (b) for (const s of b.os) try { s.stop(t + blende + 0.05); } catch {}
      ctx = null; master = null; quellen = []; beat = null; endeT = null; schlussAb = null;
      setTimeout(() => { try { const r = c.close && c.close(); if (r && r.catch) r.catch(() => {}); } catch {} }, (blende + 0.3) * 1000);
      if (!still) try { if (navigator.audioSession) navigator.audioSession.type = 'auto'; } catch {}
    },
    rhythmus(r) { const p = (r && r.phasen) || r; if (!p) return; if (!laeuft) { phasen = p; return; } wechsel = p; },
    klang(art) { einst.klang = art; if (!ctx) return; const m = mix(), t = ctx.currentTime; rauschG.gain.setTargetAtTime(m.r, t, 0.3); tonG.gain.setTargetAtTime(m.t, t, 0.3); },
    laut(v) { einst.laut = v; if (!ctx || !master) return; const t = ctx.currentTime; if (schlussAb != null && t > schlussAb - 0.4) return;   // im Schluss-Ausblenden nicht wieder lauter
      halte(master.gain, t); master.gain.linearRampToValueAtTime(zielLaut(), t + 0.15); schlussPlanen(); },
    // Sitzung endet in sek Sekunden (Audio-Uhr): Ausblenden + Quellen-Stopp jetzt schon planen; Seite verdeckt → sicht() plant den Atem bis dahin
    endeIn(sek) { if (!ctx || !master || !(sek > 0)) return; endeT = ctx.currentTime + sek; schlussPlanen(); planen(); },
    sicht() { planen(); },
    beat(b) {   // gleiche Art: Frequenzen gleiten (kein Neuaufbau), sonst überblenden
      einst.beat = b ? { ...b } : null; if (!ctx) return;
      const art = b && b.art !== 'aus' ? b.art : null, t = ctx.currentTime;
      if (beat && art === beat.art) {
        const hz = Math.max(0.5, Math.min(30, +b.hz || 6)), f0 = +b.traeger || TRAEGER.mittel;
        if (beat.l) { beat.l.frequency.setTargetAtTime(f0 - hz / 2, t, 0.2); beat.r.frequency.setTargetAtTime(f0 + hz / 2, t, 0.2); } else { beat.lfo.frequency.setTargetAtTime(hz, t, 0.2); beat.c.frequency.setTargetAtTime(f0, t, 0.2); }
        halte(beat.g.gain, t); beat.g.gain.setTargetAtTime(Math.max(0, Math.min(1, b.laut ?? 0.5)) * BEAT_MAX, t, 0.15); return;   // halte: mitten im Einblenden sonst Sprung (Prüfung: Knacks)
      }
      beatWeg(beat); beat = art ? baueBeat(b) : null;
    },
    // Wo steht der Atem gerade? (für Kreis und Wort; Ausgabe-Verzögerung abgezogen, damit Bild und Ton zusammenpassen)
    jetzt() {
      if (!ctx || !abl.length) return null;
      const t = ctx.currentTime - Math.min(0.3, ctx.outputLatency || ctx.baseLatency || 0);
      for (let i = abl.length - 1; i >= 0; i--) { const e = abl[i]; if (e.ab <= t) { const x = Math.min(1, (t - e.ab) / e.d); return { art: e.art, p: x, pegel: e.von + (e.nach - e.von) * weich(x), rest: Math.max(0, e.ab + e.d - t), dauer: e.d, seit: t - t0 }; } }
      return { art: 'ruhe', p: 0, pegel: TIEF, rest: abl[0].ab - t, dauer: 0, seit: 0 };
    },
    zustand: () => (ctx ? ctx.state : 'kein'),
    laeuft: () => laeuft,
    kontext: () => ctx,
    einst: () => ({ ...einst })
  };
  return A;
}
