// Atem – Stimme (0.1.6, Wort-Regel + Netz wie ton.js 0.1.5): „Stimme sagt den Takt“. Ein Wort je Phase aus dem Sprite stimme/<sp>/a.<hash>.mp3, genau auf der
// AudioContext-Uhr (dieselbe Uhr wie Kreis und Glocke in ton.js). Ohne Sprite (offline, Laden gescheitert): Systemstimme.
// Entscheidung wie ton.js 0.1.3.1/0.1.4 (ansage-test): je Lauf jeder Schritt höchstens einmal (Schlüssel Schritt + Startzeit),
// gleiches Wort direkt davor → still, Schritt < 2 s → still (Kurzwort 1,2–2 s nur mit kurzwort:true), „messen“ → still,
// zu spät (Hintergrund, Last) → still, Anhalten/Pause löscht alles Geplante, verschobene Schritte neu, Gesprochenes nie noch einmal.
const LANG = { de: 'de-DE', en: 'en-GB', ar: 'ar-EG', it: 'it-IT' };   // 020: + Italienisch
const ID = { ein: 'ein', ein2: 'ein2', halten_voll: 'halten_voll', halten_leer: 'halten_leer', aus: 'aus' };   // dieselben Phasen wie heute
const KURZ = { ein: 'ein_kurz', aus: 'aus_kurz', halten_voll: 'halten_voll_kurz', halten_leer: 'halten_leer_kurz' };
// Systemstimme: kurze Wörter (Sprach-Verzögerung); „Leer halten“ statt nur „Halten“ (texte/<sp>.json → ansagen)
const SYS = {
  de: { ein: 'Ein', ein2: 'Noch etwas', halten_voll: 'Halten', halten_leer: 'Leer halten', aus: 'Aus', ein_kurz: 'Ein', aus_kurz: 'Aus', halten_voll_kurz: 'Halten', halten_leer_kurz: 'Leer' },
  en: { ein: 'In', ein2: 'Sip in', halten_voll: 'Hold', halten_leer: 'Hold empty', aus: 'Out', ein_kurz: 'In', aus_kurz: 'Out', halten_voll_kurz: 'Hold', halten_leer_kurz: 'Empty' },
  ar: { ein: 'شهيق', ein2: 'زِدْ شهيقًا', halten_voll: 'احبِسْ', halten_leer: 'احبِسْ فارغًا', aus: 'زفير', ein_kurz: 'شهيق', aus_kurz: 'زفير', halten_voll_kurz: 'احبِسْ', halten_leer_kurz: 'فراغ' },
  it: {"ein": "Inspira", "ein2": "Ancora un po'", "halten_voll": "Trattieni", "halten_leer": "Trattieni a vuoto", "aus": "Espira", "ein_kurz": "Dentro", "aus_kurz": "Fuori", "halten_voll_kurz": "Trattieni", "halten_leer_kurz": "Vuoto"}   // 020: Italienisch (texte/it.json → ansagen)
};
const gleich = (a, b) => a && b && a.replace('_kurz', '') === b.replace('_kurz', '');
export const sprachen = () => Object.keys(LANG);
export const systemWort = (sp, id) => (SYS[sp] || SYS.de)[id];

// Sprite laden und dekodieren (ctx: AudioContext der App oder, vor dem ersten Tipp, new OfflineAudioContext(1, 1, 48000)); Einsatzverzögerung (Kodierer-Vorlauf) messen: erstes Signal im Dekodat minus signal_ab_ms aus a.json
export async function ladeSprite(ctx, sp, basis = './stimme/') {
  const k = await (await fetch(basis + sp + '/a.json')).json();
  const r = await fetch(basis + sp + '/' + k.datei); if (!r.ok) throw new Error('Sprite ' + r.status);
  const roh = await r.arrayBuffer();
  const buf = await new Promise((ok, f) => { const p = ctx.decodeAudioData(roh, ok, f); if (p && p.then) p.then(ok, f); });
  const d = buf.getChannelData(0), n = Math.min(d.length, Math.round(buf.sampleRate * 0.4)); let i = 0;
  while (i < n && Math.abs(d[i]) <= 0.01) i++;
  const onset = Math.min(150, Math.max(0, Math.round(1000 * i / buf.sampleRate) - (k.signal_ab_ms || 0)));
  return { sp, buf, woerter: k.woerter, onset };
}

// Ansager: wird von ton.js je geplantem Schritt gerufen (schritt), bei Knopf-Verschiebung (neuPlanen) und beim Anhalten (halt)
export function erzeugeAnsager(o = {}) {
  const jetztMs = o.jetzt || (() => performance.now());
  let sp = o.sprache || 'de', sprite = null, fest = null, uhr = null, lauf = 0, gesagt = new Map(), offen = new Map(), letzteU = null, letzteW = null;
  let einst = { laut: 0.6, stimme_laut: 1, kurzwort: false }, gctx = null, gain = null, proto = [];
  const log = (e) => { proto.push(e); if (proto.length > 4000) proto.shift(); };   // Protokoll für Tests (starte/halt/wort/verworfen/spaet)
  const pegel = () => Math.min(1.5, Math.max(0, (einst.laut ?? 0.6) / 0.6 * (einst.stimme_laut ?? 1) * 0.8));   // Stimme etwas leiser als in der Meditation
  function ausgang(ctx) {
    if (gctx !== ctx || !gain) { gctx = ctx; gain = ctx.createGain(); gain.connect(ctx.destination); }
    gain.gain.value = pegel(); return gain;
  }
  function sage(text) {   // Systemstimme wie ton.js: alte Schlange verwerfen, sonst käme das Wort zu spät oder doppelt
    try {
      const S = window.speechSynthesis; if (!S || !text) return;
      if (letzteW === text && letzteU && jetztMs() - letzteU < 1500) return;   // wie ton.js 0.1.5 Netz: dasselbe Wort nie zweimal binnen 1,5 s
      if (S.pending || (S.speaking && (!letzteU || jetztMs() - letzteU > 1200))) S.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = LANG[sp] || 'de-DE'; u.volume = Math.min(1, pegel());
      const v = (S.getVoices ? S.getVoices() : []).find((x) => x.lang && x.lang.replace('_', '-').startsWith(u.lang.slice(0, 2))); if (v) u.voice = v;
      letzteU = jetztMs(); letzteW = text; A._u = u; S.speak(u);   // 021b: Äußerung festhalten (iOS: sonst kann sie vor dem Ende eingesammelt werden, „speaking“ bleibt hängen)
    } catch {}
  }
  function weg(i, e) { if (e.q) { try { e.q.stop(); } catch {} try { e.q.disconnect(); } catch {} } if (e.t) clearTimeout(e.t); offen.delete(i); }
  const A = {
    get sprache() { return sp; },
    get bereit() { return !!sprite && sprite.sp === sp; },
    get weg() { return sprite && sprite.sp === sp ? 'sprite' : 'system'; }, get festerWeg() { return fest; },
    setzeSprache(s) { if (LANG[s]) sp = s; },
    setzeSprite(s) { sprite = s; },
    async lade(ctx, s = sp, basis) { sp = s; try { sprite = await ladeSprite(ctx, s, basis); } catch (f) { sprite = null; log({ art: 'ladefehler', sp: s, f: String(f) }); } return A.bereit; },
    einstellen(e) { einst = { ...einst, ...e }; if (gain && gctx) gain.gain.setTargetAtTime(pegel(), gctx.currentTime, 0.05); },
    starte(u) { uhr = u; A.halt(true); fest = A.bereit ? 'sprite' : 'system'; log({ art: 'starte', u: u && u.plan ? u.zeit() : 0, weg: fest }); },   // Weg je Lauf fest: nie zwei Stimmen gemischt
    // i: Schritt, plan: Plan der Uhr, st: Startzeit (ms Übungsuhr), jetzt: Übungsuhr, at: AudioContext-Zeit des Phasenbeginns (wie die Glocke)
    // regel: Wort aus ton.js sagWort (0.1.5) – kurzer Schritt (ab 0,9 s) zwischen zwei gleichen Ansagen („Aus – Ein – Aus“) wird auch angesagt
    schritt(i, plan, st, jetzt, at, ctx, regel) {
      const s = plan.schritte[i]; if (!s) return null;
      const ms = s.ms || 0; let id = ID[s.art], rand = 300;
      if (!id || plan.modus === 'messen') return null;
      if (ms < 2000) { if (regel && ms >= 900) { id = KURZ[s.art] || id; rand = 100; } else if (!einst.kurzwort || ms < 1200 || !KURZ[s.art]) return null; else id = KURZ[s.art]; }
      if (gesagt.has(i) || gleich(gesagt.get(i - 1), id)) return null;   // gleiches Wort direkt davor: schweigen
      gesagt.set(i, id);
      const w = (fest || A.weg) === 'sprite' && A.bereit && ctx ? sprite.woerter[id] : null;
      if (w) {
        if (jetzt - st > 150) { log({ art: 'spaet', i, id, st, jetzt }); return null; }   // wie ton.js: zu spät → lieber schweigen
        const wann = Math.max(ctx.currentTime, at);
        if (ms && (wann - at) * 1000 + w.dauer_ms > ms - rand && id !== ID[s.art]) return null;   // Kurzwort muss 300 ms (Regel 0.1.5: 100 ms) vor Schrittende fertig sein
        const q = ctx.createBufferSource(); q.buffer = sprite.buf; q.connect(ausgang(ctx));
        q.start(wann, (w.ab_ms + sprite.onset) / 1000, w.dauer_ms / 1000);
        const e = { q, st, wann, ctx, lauf, dauer_ms: w.dauer_ms };   // 020-klang: Wortlänge für das Zählton-Fenster
        offen.set(i, e); q.onended = () => { if (offen.get(i) === e) offen.delete(i); };
        log({ art: 'wort', weg: 'sprite', i, id, st, wann, at, jetzt, sp });
        return e;
      }
      // Systemstimme (wie ton.js 0.1.4): 250 ms vor Phasenbeginn anstoßen, > 400 ms zu spät → still
      const soll = Math.max(jetzt, st - 250), meinLauf = lauf, text = systemWort(sp, id);
      const e = { st, lauf, t: setTimeout(() => {
        offen.delete(i);
        if (meinLauf !== lauf || !uhr || uhr.pausiert || !uhr.plan || uhr.plan.start[i] !== st) return;
        if (uhr.zeit() - soll > 400) { log({ art: 'spaet', i, id, st }); return; }
        log({ art: 'wort', weg: 'system', i, id, st, u: uhr.zeit(), sp, text }); sage(text);
      }, soll - jetzt) };
      offen.set(i, e); return e;
    },
    // Startzeit eines Schritts hat sich geändert (Atmen-/Stopp-Knopf): noch nicht begonnene Wörter abbrechen und neu erlauben
    neuPlanen(plan) {
      for (const [i, e] of [...offen]) {
        if (plan.start[i] === e.st) continue;
        const begonnen = e.q ? e.wann <= e.ctx.currentTime + 0.005 : false;
        if (begonnen) continue;   // schon zu hören: nicht noch einmal
        weg(i, e); gesagt.delete(i); log({ art: 'verworfen', i });
      }
    },
    halt(still) {
      lauf++; for (const [i, e] of [...offen]) weg(i, e); gesagt = new Map(); if (!still) log({ art: 'halt', u: uhr && uhr.plan ? uhr.zeit() : null });
      if (gain && gctx) { const g = gain, t = gctx.currentTime; try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.05); } catch {} setTimeout(() => { try { g.disconnect(); } catch {} }, 120); gain = null; }
      if (!still) try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch {}
    },
    systemStimmeDa() { try { const v = speechSynthesis.getVoices(); return !v.length ? null : v.some((x) => (x.lang || '').startsWith(sp)); } catch { return false; } },
    offenBei: (i) => offen.get(i) || null,   // 021b: geplantes Wort eines Schritts (Zähltöne nachplanen, Fenster frei halten)
    protokoll: () => proto.slice(), leeren() { proto = []; }
  };
  return A;
}
// Für app.js (ein Aufruf): Ansager an ton hängen und das Sprite der gewählten Sprache laden (ohne Tipp: OfflineAudioContext zum Dekodieren)
export function bereiteVor(ton, e, basis = './stimme/') {
  if (!e || e.ansage !== 'stimme') return Promise.resolve(false);
  const n = (navigator.language || 'de').slice(0, 2), sp = LANG[e.stimme_sprache] ? e.stimme_sprache : LANG[n] ? n : 'de';
  if (ton.stimme && ton.stimme.sprache === sp && ton.stimme.bereit) return Promise.resolve(true);
  const A = ton.stimme || (ton.stimme = erzeugeAnsager({ sprache: sp }));
  A.setzeSprache(sp); A.einstellen({ laut: e.laut ?? 0.6 });
  const c = (ton.kontext && ton.kontext()) || (window.OfflineAudioContext ? new OfflineAudioContext(1, 1, 48000) : null);
  return c ? A.lade(c, sp, basis) : Promise.resolve(false);
}
