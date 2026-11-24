// js/wiedergabe.js – WebAudio-Klavierklang + Wiedergabe mit Schleife, Tempo und Hand-Auswahl
// Start nur nach einem Tipp (iOS). Alles lokal, nichts wird gesendet.

let ctx = null, ausgang = null, welle = null, rauschen = null;
const stimmen = new Set();

/** AudioContext holen/entsperren – im Tipp-Handler aufrufen. */
export function audioKontext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    const komp = ctx.createDynamicsCompressor();
    komp.threshold.value = -14; komp.ratio.value = 3; komp.attack.value = 0.004; komp.release.value = 0.2;
    ausgang = ctx.createGain(); ausgang.gain.value = 0.9;
    ausgang.connect(komp).connect(ctx.destination);
    const re = new Float32Array([0, 1, 0.42, 0.22, 0.12, 0.07, 0.045, 0.03, 0.02, 0.012]);
    welle = ctx.createPeriodicWave(re, new Float32Array(re.length));
    rauschen = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
    const d = rauschen.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* älteres iOS */ }
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  return ctx;
}
export const entsperren = audioKontext;

/** Ein Klavierton. wann/dauer in Sekunden (Audio-Zeit). */
export function ton(midi, wann, dauer = 0.5, staerke = 0.8) {
  const c = audioKontext();
  wann = Math.max(wann ?? c.currentTime, c.currentTime);
  const f = 440 * 2 ** ((midi - 69) / 12);
  const g = c.createGain();
  const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.Q.value = 0.4;
  const hell = Math.min(14000, f * 9 + 1500);
  filt.frequency.setValueAtTime(hell, wann);
  filt.frequency.setTargetAtTime(Math.max(f * 2.2, 500), wann + 0.01, 0.5);
  const o1 = c.createOscillator(); o1.setPeriodicWave(welle); o1.frequency.value = f;
  const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.002;
  const g2 = c.createGain(); g2.gain.value = 0.12;
  o1.connect(filt); o2.connect(g2).connect(filt); filt.connect(g).connect(ausgang);
  const v = 0.2 * staerke * (midi < 48 ? 1.15 : midi > 84 ? 0.8 : 1);
  const abkling = Math.min(5, Math.max(1.1, 4.4 - (midi - 40) * 0.045));
  g.gain.setValueAtTime(0.0001, wann);
  g.gain.exponentialRampToValueAtTime(v, wann + 0.005);
  g.gain.setTargetAtTime(v * 0.35, wann + 0.006, 0.18);
  const aus = wann + Math.max(0.08, dauer);
  if (aus > wann + 0.4) g.gain.setTargetAtTime(0.0001, wann + 0.4, abkling / 3);
  g.gain.setTargetAtTime(0.0001, aus, 0.09);
  // kurzer Hammer-Anschlag
  const r = c.createBufferSource(); r.buffer = rauschen;
  const rf = c.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = Math.min(9000, f * 5); rf.Q.value = 1.2;
  const rg = c.createGain(); rg.gain.value = 0.05 * staerke;
  r.connect(rf).connect(rg).connect(ausgang);
  r.start(wann);
  const ende = aus + 0.6;
  o1.start(wann); o2.start(wann); o1.stop(ende); o2.stop(ende);
  const s = { g, o1, o2 };
  stimmen.add(s);
  o1.onended = () => { stimmen.delete(s); try { g.disconnect(); } catch { /* schon getrennt */ } };
  return s;
}

/** Mehrere Töne sofort spielen (Übungen). arpeggio = Abstand in s zwischen den Tönen. */
export function klinge(midis, { dauer = 1.2, arpeggio = 0, staerke = 0.8 } = {}) {
  const c = audioKontext();
  const t0 = c.currentTime + 0.03;
  [...midis].sort((a, b) => a - b).forEach((m, i) => ton(m, t0 + i * arpeggio, dauer, staerke));
}

export function alleStimmenAus() {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (const s of stimmen) {
    try {
      s.g.gain.cancelScheduledValues(t);
      s.g.gain.setTargetAtTime(0.0001, t, 0.03);
      s.o1.stop(t + 0.2); s.o2.stop(t + 0.2);
    } catch { /* bereits gestoppt */ }
  }
  stimmen.clear();
}

const taktLaenge = (t) => ((t.taktart ? t.taktart[0] : 4) * 4) / (t.taktart ? t.taktart[1] : 4);

/**
 * @param {object} stueck  Stück laut modell.js
 * @param {{onNote?:(note, info:{an:boolean, stumm:boolean, runde:number})=>void, onZeit?:(q:number)=>void, onEnde?:()=>void}} cb
 */
export function spieler(stueck, { onNote, onZeit, onEnde } = {}) {
  const noten = [...(stueck.noten || [])].sort((a, b) => a.t - b.t || a.midi - b.midi);
  const takte = stueck.takte || [];
  let lauf = null;

  function bereich(vonTakt, bisTakt) {
    const letzteNote = noten.reduce((m, n) => Math.max(m, n.t + n.dauer), 0);
    if (!takte.length) return { a: 0, b: letzteNote };
    const ta = takte.find((t) => t.nr === vonTakt) || takte[0];
    const tb = takte.find((t) => t.nr === bisTakt) || takte[takte.length - 1];
    const i = takte.indexOf(tb);
    const b = takte[i + 1] ? takte[i + 1].start : tb.start + taktLaenge(tb);
    return { a: ta.start, b: Math.max(b, ta.start + 0.25) };
  }

  function stopp() {
    if (!lauf) return;
    clearInterval(lauf.timer); cancelAnimationFrame(lauf.raf);
    for (const e of lauf.offen) if (e.an === false && onNote) onNote(e.note, { an: false, stumm: e.stumm, runde: e.runde });
    lauf = null;
    alleStimmenAus();
  }

  function spiele(vonTakt, bisTakt, { schleife = false, tempoFaktor = 1, nurHand = null, vorlauf = 0.12 } = {}) {
    stopp();
    const c = audioKontext();
    const { a, b } = bereich(vonTakt, bisTakt);
    const L = b - a;
    const auswahl = noten.filter((n) => n.t >= a - 1e-6 && n.t < b - 1e-6);
    const bpm = stueck.tempo || 90;
    const l = {
      a, b, L, auswahl, schleife, nurHand, faktor: tempoFaktor,
      anker: { zeit: c.currentTime + vorlauf, v: a }, idx: 0, runde: 0, offen: [], timer: 0, raf: 0,
    };
    lauf = l;
    const spq = () => 60 / (bpm * l.faktor);
    const vZuZeit = (v) => l.anker.zeit + (v - l.anker.v) * spq();
    const zeitZuV = (t) => l.anker.v + (t - l.anker.zeit) / spq();
    l.zeitZuV = zeitZuV;
    const hoerbar = (n) => !nurHand || (nurHand === 'links' ? n.system === 'unten' : n.system === 'oben');

    function plane() {
      if (lauf !== l) return;
      const horizont = zeitZuV(c.currentTime + 0.2);
      for (let schutz = 0; schutz < 2000; schutz++) {
        if (l.idx >= auswahl.length) {
          if (!schleife || !auswahl.length) break;
          if (a + (l.runde + 1) * L > horizont) break;
          l.runde++; l.idx = 0;
        }
        const n = auswahl[l.idx];
        const v = n.t + l.runde * L;
        if (v > horizont) break;
        const wann = vZuZeit(v);
        const dq = Math.min(n.dauer, b - n.t);
        const dauerS = Math.max(0.05, dq * spq() * 0.97);
        const stumm = !hoerbar(n);
        if (!stumm) ton(n.midi, wann, dauerS, n.system === 'unten' ? 0.75 : 0.85);
        l.offen.push({ zeit: wann, note: n, an: true, stumm, runde: l.runde }, { zeit: wann + dauerS, note: n, an: false, stumm, runde: l.runde });
        l.idx++;
      }
    }
    function bild() {
      if (lauf !== l) return;
      const jetzt = c.currentTime - (c.outputLatency || 0);
      if (l.offen.length) {
        l.offen.sort((x, y) => x.zeit - y.zeit);
        let i = 0;
        while (i < l.offen.length && l.offen[i].zeit <= jetzt) {
          const e = l.offen[i++];
          if (onNote) onNote(e.note, { an: e.an, stumm: e.stumm, runde: e.runde });
        }
        if (i) l.offen.splice(0, i);
      }
      const v = zeitZuV(jetzt);
      if (v >= a && onZeit) onZeit(schleife ? a + ((((v - a) % L) + L) % L) : Math.min(v, b));
      if (!schleife && v >= b && !l.offen.length) { stopp(); onEnde && onEnde(); return; }
      l.raf = requestAnimationFrame(bild);
    }
    plane();
    l.timer = setInterval(plane, 25);
    l.raf = requestAnimationFrame(bild);
  }

  /** Tempo während des Spielens ändern (z. B. 0.5 = halbes Tempo) */
  function setzeTempo(f) {
    if (!lauf || !ctx) return;
    const t = ctx.currentTime;
    lauf.anker = { zeit: t, v: lauf.zeitZuV(t) };
    lauf.faktor = f;
  }

  return { spiele, stopp, setzeTempo, get laeuft() { return !!lauf; } };
}
