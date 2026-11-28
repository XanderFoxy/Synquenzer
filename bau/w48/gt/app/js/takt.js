// Gesangstrainer – takt.js: Klick, Einzähler, Begleitung (Klavier-Akkord oder Bordun) – alles auf der Audio-Uhr geplant,
// damit Klang und Bild (Cursor) exakt zusammenpassen. Reines ES-Modul, keine Bibliotheken.
//
// export function neuerPlan(ctx) → {klick(zeit, betont), akkord(klavier, toene, zeit, dauer, staerke), bordun(toene, von, bis),
//                                    puffer(buffer, zeit, ab, dauer, lautstaerke), stopp()}
// export function akkordAus(text) → {grund, moll, sus, bass} | null   („Ebm“, „Ab/C“, „Bbsus4“ …)
// export function voicing(akkord|grundMidi, {dur}) → {bass, toene:[midi…]}  (Bass tief, Dreiklang über der Männerstimme)

const rauschCache = new WeakMap();
function rauschen(ctx) {
  let b = rauschCache.get(ctx);
  if (!b) {
    b = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.05), ctx.sampleRate);
    const d = b.getChannelData(0); let s = 12345;
    for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff - 1) * Math.exp(-i / (ctx.sampleRate * 0.006)); }
    rauschCache.set(ctx, b);
  }
  return b;
}

export function neuerPlan(ctx, ziel = ctx.destination) {
  const knoten = new Set();
  const instrumente = new Set();
  const merk = (n, ende) => { knoten.add(n); n.onended = () => knoten.delete(n); return n; };
  const bus = ctx.createGain(); bus.gain.value = 1; bus.connect(ziel);
  return {
    bus,
    merke: (n) => merk(n),
    instrument: (i) => { if (i) instrumente.add(i); return i; },
    /** Holzklick (gefiltertes Rauschen + kurzer Ton): kaum Tonhöhe, stört die Stimm-Erkennung nicht. */
    klick(zeit, betont = false, laut = 1) {
      const q = ctx.createBufferSource(); q.buffer = rauschen(ctx);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = betont ? 3200 : 2400; f.Q.value = 1.6;
      const g = ctx.createGain(); g.gain.value = (betont ? 0.9 : 0.55) * laut;
      q.connect(f).connect(g).connect(bus);
      q.start(zeit); q.stop(zeit + 0.05); merk(q);
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = betont ? 1760 : 1320;
      const og = ctx.createGain(); og.gain.setValueAtTime(0, zeit); og.gain.linearRampToValueAtTime(0.16 * laut * (betont ? 1 : 0.7), zeit + 0.002);
      og.gain.exponentialRampToValueAtTime(0.0005, zeit + 0.035);
      o.connect(og).connect(bus); o.start(zeit); o.stop(zeit + 0.05); merk(o);
    },
    akkord(klavier, toene, zeit, dauer, staerke = 0.45) {
      if (!klavier || !klavier.spiele) return;
      instrumente.add(klavier);
      toene.forEach((m, i) => { try { klavier.spiele(m, zeit + i * 0.012, dauer, staerke * (i === 0 ? 1 : 0.8)); } catch (e) { /* egal */ } });
    },
    /** Bordun: weicher, gleichbleibender Grundton (+ Quinte), sanft ein- und ausgeblendet. */
    bordun(toene, von, bis, laut = 0.5) {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(bus);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4; lp.connect(g);
      const an = Math.min(0.4, (bis - von) / 4);
      g.gain.setValueAtTime(0, von); g.gain.linearRampToValueAtTime(0.12 * laut, von + an);
      g.gain.setValueAtTime(0.12 * laut, Math.max(von + an, bis - 0.35)); g.gain.linearRampToValueAtTime(0, bis);
      for (const m of toene) for (const v of [-4, 4]) {
        const o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.value = 440 * Math.pow(2, (m - 69) / 12) * Math.pow(2, v / 1200);
        o.connect(lp); o.start(von); o.stop(bis + 0.05); merk(o);
      }
      knoten.add({ stop: () => { try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, 0.03); } catch (e) { /* egal */ } } });
    },
    /** Ausschnitt einer Aufnahme (eigene Stimme, Original-Instrumental) auf die Audio-Uhr legen. */
    puffer(buffer, zeit, ab, dauer, laut = 1) {
      if (!buffer) return null;
      const q = ctx.createBufferSource(); q.buffer = buffer;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, zeit); g.gain.linearRampToValueAtTime(laut, zeit + 0.02);
      g.gain.setValueAtTime(laut, zeit + Math.max(0.03, dauer - 0.08)); g.gain.linearRampToValueAtTime(0, zeit + dauer);
      q.connect(g).connect(bus);
      const start = Math.max(0, ab);
      q.start(zeit + Math.max(0, -ab), start, Math.max(0.05, Math.min(dauer, buffer.duration - start)));
      merk(q); return q;
    },
    stopp() {
      for (const n of knoten) { try { n.stop(); } catch (e) { /* schon aus */ } }
      knoten.clear();
      for (const i of instrumente) { try { i.stopp && i.stopp(); } catch (e) { /* egal */ } }
      try { bus.gain.setTargetAtTime(0, ctx.currentTime, 0.02); } catch (e) { /* egal */ }
      setTimeout(() => { try { bus.disconnect(); } catch (e) { /* egal */ } }, 300);
    },
  };
}

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };
function tonklasse(b, vz) { let p = PC[b]; if (p == null) return null; if (vz === 'b' || vz === 'es') p -= 1; if (vz === '#' || vz === 'is') p += 1; return (p + 12) % 12; }
/** Akkordsymbol (englisch: B = H, Bb = B) → Tonklassen. */
export function akkordAus(text) {
  const m = String(text || '').trim().match(/^([A-G])(b|#)?(m(?!aj))?(maj7|sus4|sus2|7)?(?:\/([A-G])(b|#)?)?$/);
  if (!m) return null;
  const grund = tonklasse(m[1], m[2]);
  return { grund, moll: !!m[3], sus: m[4] === 'sus4' ? 4 : m[4] === 'sus2' ? 2 : 0, sieben: m[4] === '7', bass: m[5] ? tonklasse(m[5], m[6]) : grund, name: text.trim() };
}
/** Bass in der großen Oktave (A1–Gis2), Dreiklang ab D4 aufwärts – über der Männerstimme, damit die Erkennung nicht stolpert. */
export function voicing(a, { dur = true } = {}) {
  const ak = typeof a === 'number' ? { grund: ((a % 12) + 12) % 12, moll: !dur, sus: 0, bass: ((a % 12) + 12) % 12 } : a;
  if (!ak) return null;
  const bass = 33 + ((ak.bass - 9 + 12) % 12);
  const terz = ak.sus === 4 ? 5 : ak.sus === 2 ? 2 : ak.moll ? 3 : 4;
  let r = 62 + ((ak.grund - 2 + 12) % 12);
  if (r > 69) r -= 12;
  const toene = [r, r + terz, r + 7].map((x) => (x > 74 ? x - 12 : x)).sort((x, y) => x - y);
  return { bass, toene };
}
/** Akkord eines Lieds zur Zeit t (s): Teil-Akkorde wechseln alle 2 Takte und wiederholen sich (vereinfacht). */
export function liedAkkord(lied, t) {
  const bpm = lied.bpm || 120, takt = 4 * 60 / bpm;
  const teil = (lied.teile || []).find((x) => isFinite(x.start) && isFinite(x.ende) && t >= x.start - 1e-6 && t < x.ende - 1e-6);
  if (!teil || !teil.akkorde) return null;
  const liste = String(teil.akkorde).split(/\s+[–-]\s+/).map(akkordAus).filter(Boolean);
  if (!liste.length) return null;
  const k = Math.floor((t - teil.start + 1e-6) / (2 * takt));
  return liste[((k % liste.length) + liste.length) % liste.length];
}
