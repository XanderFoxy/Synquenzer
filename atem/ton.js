// Atem – Ton (KONZEPT §7). Das Bild führt, der Ton hilft. Im Testmodus (?test=1) nur Protokoll, kein AudioContext.
const TEST = typeof location !== 'undefined' && /[?&]test=1/.test(location.search);
const HZ = { ein: 392, ein2: 494, aus: 294, halten: 330 };
let Z = null, zProbe = null;   // 020-klang: Zähltöne (signale.js), erst bei Bedarf geladen
const zLade = () => (Z ? Promise.resolve(Z) : import('./signale.js').then((m) => { zProbe = m.probe; return (Z = m.signale); }, () => null));
let ctx = null, haupt = null, einst = { art: 'klang', laut: 0.6, sekunden: false, ansage: false }, planer = null, geplant = new Map(), proto = [], wind = null, rausch = null;
// Ansage (0.1.3.1): je Lauf (starte…halt) jeder Schritt höchstens einmal (Schlüssel Schritt + Startzeit), Timer gemerkt und beim Anhalten gelöscht
let lauf = 0, ansageT = new Map(), gesagt = new Map(), letzteU = null, glocken = new Map(), knoten = null;   // glocken: vorausgeplante Glocken je Schritt
let uhrRef = null, planRef = null, testZeit = null, wachSeit = 0, ersatzT = -1e9, musikZ = false, ctxAb = 0, weckT = 0, zaehlK = [];
// 021b: Vorlauf 0,6 → 1,5 s (Wort/Töne auf der ctx-Uhr) – ein Hänger ≥ 0,75 s ließ sonst das Wort der Phase fallen
const VORLAUF = 1500;
const db = (d) => Math.pow(10, d / 20);
const still0 = (c) => { try { const b = c.createBuffer(1, 1, c.sampleRate), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch {} };   // stiller Puffer im Tipp (iOS)

function neuerKontext() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const c = new AC({ latencyHint: 'interactive' }); ctxAb = performance.now(); wachSeit = 0;
  haupt = c.createGain(); haupt.gain.value = einst.laut * 0.4; haupt.connect(c.destination);
  still0(c);
  c.onstatechange = () => { if (c !== ctx) return; if (c.state === 'running') { wachSeit = 0; nachholen(); } else if (c.state !== 'closed' && ton.beiStoerung) ton.beiStoerung(c.state); };   // nur der aktuelle Kontext zählt; 021b: läuft er wieder → nachplanen
  return c;
}
// 021b: Ton hängt = Kontext läuft nach 0,8 s nicht (iOS: ohne Tipp, „interrupted“ nach Sperre)
const haengt = () => !TEST && !!ctx && ctx.state !== 'running' && ctx.state !== 'closed' && performance.now() - ctxAb > 800;
function glocke(at, hz, lautDb = 0, dauer = 1.5, ziel = haupt) {
  if (TEST) { proto.push({ art: 'glocke', hz, t_ms: testZeit }); return; }
  if (!ctx) return;
  for (const [f, a] of [[hz, 1], [hz * 2, 0.15]]) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.value = 0;
    g.gain.setTargetAtTime(a * db(lautDb), at, 0.02); g.gain.setTargetAtTime(0, at + 0.08, dauer / 4);
    o.connect(g); g.connect(ziel); o.start(at); o.stop(at + dauer + 0.5); if (knoten) knoten.push(g);
  }
}
function tick(at, lautDb = -14) {
  if (TEST) { proto.push({ art: 'tick', t_ms: testZeit }); return; }
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 1800; g.gain.value = 0;
  g.gain.setTargetAtTime(db(lautDb), at, 0.003); g.gain.setTargetAtTime(0, at + 0.02, 0.01); o.connect(g); g.connect(haupt); o.start(at); o.stop(at + 0.1); if (knoten) knoten.push(g);
}
function windStart() {
  if (!ctx || wind) return;
  if (!rausch) { rausch = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = rausch.getChannelData(0); let x = 0; for (let i = 0; i < d.length; i++) { x = 0.97 * x + 0.03 * (Math.random() * 2 - 1); d[i] = x * 3; } }
  const s = ctx.createBufferSource(); s.buffer = rausch; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.value = 400;
  const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(haupt); s.start();
  wind = { s, f, g };
}
function ansage(wort) {
  try {
    if (!einst.ansage || !window.speechSynthesis) return;
    // Hängt noch eine alte Äußerung (iOS: Schlange, leere Entsperr-Äußerung), erst verwerfen – sonst käme das Wort zu spät oder doppelt
    if (letzteU && letzteU.w === wort && performance.now() - letzteU.t < 1500) return;   // 0.1.5 Netz: dasselbe Wort nie zweimal binnen 1,5 s
    if (speechSynthesis.pending || (speechSynthesis.speaking && (!letzteU || performance.now() - letzteU.t > 1200))) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(wort); u.lang = 'de-DE'; letzteU = { t: performance.now(), w: wort, u }; speechSynthesis.speak(u);
  } catch {}
}
function ansageWeg() { for (const t of ansageT.values()) clearTimeout(t); ansageT = new Map(); }
function zaehlWeg() { for (const g of zaehlK) try { g.disconnect(); } catch {} zaehlK = []; }   // 0.2.1: Einzähltöne abhängen (Ton aus, Pause, Beenden)
const ANSAGE = { ein: 'Ein', ein2: 'Noch etwas', halten_voll: 'Halten', halten_leer: 'Halten', aus: 'Aus' };
// Wort für Schritt i: ab 2 s; 0.1.5: kurzes Einatmen (ab 0,9 s) zwischen zwei gleichen Ansagen (Aus – Ein – Aus) auch – sonst hört man „Aus … Aus“
const lang2 = (s) => s && (s.ms || 0) >= 2000 ? ANSAGE[s.art] : null;
export function sagWort(plan, i) {
  const s = plan.schritte[i], w = s && ANSAGE[s.art]; if (!w) return null; if ((s.ms || 0) >= 2000) return w;
  const a = lang2(plan.schritte[i - 1]); return (s.ms || 0) >= 900 && a && a !== w && a === lang2(plan.schritte[i + 1]) ? w : null;
}

function planeSchritt(i, at) {
  const s = planRef.schritte[i]; if (!s) return;
  const dauer = (s.ms || 0) / 1000, schnell = planRef.technik === 'wach' || planRef.technik === 'kraft';
  if (einst.art === 'aus') return;
  const zt = !!Z && Z.nimmt(i, planRef, einst);   // 020-klang: vormerken, geplant am Ende von takt()
  if (einst.art === 'wind' && ctx && wind) {
    const g = wind.g.gain, f = wind.f.frequency, ende = at + Math.max(0.05, dauer);
    g.setTargetAtTime(s.art === 'ein' || s.art === 'ein2' ? 0.5 : s.art === 'aus' ? 0.35 : 0, at, 0.08);
    if (s.art === 'ein' || s.art === 'ein2') { f.setValueAtTime(400, at); f.linearRampToValueAtTime(1200, ende); }
    else if (s.art === 'aus') { f.setValueAtTime(1200, at); f.linearRampToValueAtTime(400, ende); }
    return;
  }
  if (schnell && s.zug > 0 && s.abschnitt === 'uebung') { if (s.art === 'ein') tick(at); if (s.zug === 1 && s.art !== 'ein') glocke(at, HZ.ein, -6, 0.8); return; }
  if (s.abschnitt === 'ruhe' || s.abschnitt === 'wechsel') { glocke(at, HZ.aus, -6); glocke(at + 0.25, HZ.ein, -6); return; }
  if (dauer < 1.5 && s.ms != null) return;
  if (zt) { /* 020-klang */ } else if (s.art === 'ein') glocke(at, HZ.ein); else if (s.art === 'ein2') glocke(at, HZ.ein2, 0, 0.4); else if (s.art === 'aus') glocke(at, HZ.aus);
  else if (s.art.startsWith('halten')) glocke(at, HZ.halten, -8);
  if (einst.sekunden && s.art.startsWith('halten') && dauer >= 3) for (let k = 1; k < dauer; k++) tick(at + k, -20);
}
function takt() {
  if (!uhrRef || !planRef || uhrRef.pausiert) return;
  const jetzt = uhrRef.zeit(), plan = uhrRef.plan || planRef;
  planRef = plan;
  for (const [k] of glocken) if (!(plan.start[k] > jetzt)) glocken.delete(k);
  const ausgleich = ctx ? Math.min(0.3, Math.max(0, ctx.outputLatency || ctx.baseLatency || 0)) : 0;
  // 021b: Kontext steht → nichts in seine Uhr legen (käme beim Entsperren alles auf einmal); Systemstimme geht ohne ihn
  const steht = !TEST && !!ctx && ctx.state !== 'running', sprite = einst.ansage === 'stimme' && ton.stimme && (ton.stimme.festerWeg || ton.stimme.weg) === 'sprite';
  if (steht && ctx.state !== 'closed' && performance.now() - weckT > 1500) { weckT = performance.now(); try { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); } catch {} }   // gestört: leise weiter versuchen
  for (let i = 0; i < plan.schritte.length; i++) {
    const st = plan.start[i];
    if (st > jetzt + VORLAUF) break;
    if (st < jetzt - 50 || geplant.get(i) === st) continue;   // schon geplant (gleicher Schritt, gleiche Startzeit)
    if (plan.offenAb >= 0 && i > plan.offenAb) break;
    if (steht && sprite) continue;
    geplant.set(i, st);
    testZeit = st;
    const at = ctx ? ctx.currentTime + (st - jetzt) / 1000 - ausgleich : 0;
    knoten = st > jetzt ? [] : null; if (!steht) planeSchritt(i, Math.max(ctx ? ctx.currentTime : 0, at)); if (knoten && knoten.length) glocken.set(i, knoten); knoten = null;
    const w = sagWort(plan, i);
    if (einst.ansage === 'stimme' && ton.stimme) { const e = ton.stimme.schritt(i, plan, st, jetzt, at, steht ? null : ctx, w); if (Z) Z.wort(i, e); continue; }   // 020-klang: Sprite-Wort freihalten |   // 016: echte Stimme (stimme.js); w = Wort-Regel sagWort 0.1.5
    if (!einst.ansage || plan.modus === 'messen' || !w || gesagt.has(i) || gesagt.get(i - 1) === w) continue;   // gleiches Wort direkt davor: schweigen
    gesagt.set(i, w); clearTimeout(ansageT.get(i));
    if (Z) Z.wort(i, 'system');   // 020-klang
    const soll = Math.max(jetzt, st - 250), meinLauf = lauf;
    ansageT.set(i, setTimeout(() => {
      ansageT.delete(i);
      if (meinLauf !== lauf || !uhrRef || uhrRef.pausiert || !uhrRef.plan || uhrRef.plan.start[i] !== st) return;
      if (uhrRef.zeit() - soll > 400) return;   // mehr als 400 ms zu spät (Hintergrund, Last): lieber schweigen
      ansage(w);
    }, soll - jetzt));
  }
  if (Z && !steht) Z.plane({ ctx, ziel: haupt, jetzt, ausgleich, plan, lauf, log: (e) => proto.push(e) });   // 020-klang
}
// 021b: „Ton an“/entsperrt wirkt sofort: Zähltöne des laufenden Schritts nachplanen (nur kommende Schläge)
function nachholen() {
  if (!Z || !planer || !uhrRef || !uhrRef.plan || uhrRef.pausiert || einst.art === 'aus' || !ctx || ctx.state !== 'running') return;
  const plan = uhrRef.plan, jetzt = uhrRef.zeit(), z = uhrRef.zustand(); if (z.fertig || !(plan.start[z.i] <= jetzt)) return;
  if (!Z.nimmt(z.i, plan, einst)) return;
  const e = ton.stimme && ton.stimme.offenBei ? ton.stimme.offenBei(z.i) : null; if (e) Z.wort(z.i, e);
  Z.plane({ ctx, ziel: haupt, jetzt, ausgleich: Math.min(0.3, Math.max(0, ctx.outputLatency || ctx.baseLatency || 0)), plan, lauf, log: (x) => proto.push(x) });
}
// 0.1.5 Probehören (Klang-Wahl wie Klingelton-Auswahl): eigener Proben-Zweig im vorhandenen Kontext; neuer Tipp blendet die alte Probe in 50 ms aus
let probeG = null, probeQ = [];
function probeStopp() {
  if (!ctx || !probeG) return; const t = ctx.currentTime, g = probeG, q = probeQ;
  g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.05);
  setTimeout(() => { for (const s of q) try { s.stop(); } catch {} try { g.disconnect(); } catch {} }, 90); probeG = null; probeQ = [];
}
function rauschen() { if (!rausch) { rausch = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = rausch.getChannelData(0); let x = 0; for (let i = 0; i < d.length; i++) { x = 0.97 * x + 0.03 * (Math.random() * 2 - 1); d[i] = x * 3; } } return rausch; }
// 0.1.5 Eigene Musik: Mono-Puffer (aus musik.js) läuft in Schleife UNTER der Führung – eigener Zweig Gain → Kompressor → Ausgang, ein-/ausgeblendet
let mPuffer = null, mPegel = 1, mQuelle = null, mGain = null, mStart = 0, mPos = 0;
function musikZweig() {
  if (!ctx) return null;
  if (!mGain || mGain.context !== ctx) {
    const k = ctx.createDynamicsCompressor(); k.threshold.value = -24; k.ratio.value = 4; k.knee.value = 6; k.attack.value = 0.01; k.release.value = 0.3; k.connect(ctx.destination);
    mGain = ctx.createGain(); mGain.gain.value = 0; mGain.connect(k);
  }
  return mGain;
}
const musikZiel = () => Math.max(0, Math.min(1, einst.musikLaut ?? 0.5)) * 0.5 * mPegel;
function musikAn(probe) {
  if (TEST) { proto.push({ art: probe ? 'musik_probe' : 'musik', an: true, t_ms: uhrRef ? uhrRef.zeit() : 0 }); if (!probe) mQuelle = true; return; }
  if (!ctx || !mPuffer) return;
  musikAus(0.02); const g = musikZweig(), t = ctx.currentTime + 0.02, s = ctx.createBufferSource();
  s.buffer = mPuffer; s.loop = !probe; s.connect(g);
  const ab = probe ? Math.max(0, mPuffer.duration / 2 - 2) : mPos % mPuffer.duration;
  g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(musikZiel(), t + (probe ? 0.3 : 1.5));
  if (probe) { g.gain.setValueAtTime(musikZiel(), t + 3.7); g.gain.linearRampToValueAtTime(0, t + 4); s.start(t, ab, 4.05); }
  else s.start(t, ab);
  mQuelle = s; mStart = t - ab; if (probe) s.onended = () => { if (mQuelle === s) mQuelle = null; };
}
function musikAus(blende = 0.6) {
  if (TEST) { if (mQuelle) proto.push({ art: 'musik', an: false }); mQuelle = null; return; }
  if (!ctx || !mQuelle) return; const t = ctx.currentTime, s = mQuelle, g = mGain;
  if (s.loop) mPos = Math.max(0, t - mStart);
  g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + blende);
  try { s.stop(t + blende + 0.02); } catch {} mQuelle = null;
}
export const ton = {
  beiStoerung: null, stimme: null, kontext: () => ctx,   // 016: Ansager aus stimme.js
  // Im Tipp. 021b o.neu (Start/Weiter/„Ton antippen“): hängt der Kontext (resume() kommt auf iOS oft nicht an, WebKit 281566), im selben Tipp neu anlegen.
  // o.ansage: Systemstimme im Tipp freischalten, solange das Sprite nicht bereit ist.
  entsperren(musik, o = {}) {
    if (TEST) return true;
    musikZ = !!musik;
    try { if (navigator.audioSession) navigator.audioSession.type = musik ? 'ambient' : 'playback'; } catch {}
    try {
      const t = performance.now();
      const geste = !navigator.userActivation || navigator.userActivation.isActive;   // neu nur im Tipp
      if (geste && haengt() && (o.neu || ctx.state === 'interrupted' || (wachSeit && t - wachSeit > 300)) && t - ersatzT > (o.neu ? 0 : 2000)) { ersatzT = t; try { ctx.close(); } catch {} ctx = null; }
      if (!ctx || ctx.state === 'closed') { ctx = neuerKontext(); wind = null; if (planer && einst.art === 'wind') windStart(); }
      if (ctx && ctx.state !== 'running') { if (!wachSeit) wachSeit = t; const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); still0(ctx); }
      if (haupt) haupt.gain.value = einst.laut * 0.4;
      const sprich = o.ansage != null ? o.ansage : einst.ansage;
      if (sprich && window.speechSynthesis && !(ton.stimme && ton.stimme.bereit) && !speechSynthesis.pending && !speechSynthesis.speaking) { const u = new SpeechSynthesisUtterance(''); u.volume = 0; speechSynthesis.speak(u); }
    } catch { return false; }
    return true;
  },
  // 0.1.4/021b: jeder Tipp holt gestörten Ton zurück; läuft er 0,3 s nach resume() nicht (oder „interrupted“), neuer Kontext (höchstens alle 2 s)
  wecken() {
    if (TEST || !ctx || ctx.state === 'running') return;
    ton.entsperren(musikZ);
  },
  zustand: () => (TEST ? 'test' : ctx ? ctx.state : 'kein'),
  gesperrt: () => haengt(),   // 021b: Symbol „Ton antippen“
  // 0.2.1 (B2): leiser Einzählton je Zahl (3-2-1) im neuen Kontext – der Ton ist ab dem Start-Tipp zu hören, nicht erst nach 3 s
  einzaehlen(n = 3) {
    zaehlWeg(); if (einst.art === 'aus') return;
    if (TEST) { for (let k = 0; k < n; k++) proto.push({ art: 'einzaehlen', k, t_ms: k * 1000 }); return; }
    if (!ctx || !haupt) return;
    const t = ctx.currentTime + 0.03; knoten = []; for (let k = 0; k < n; k++) glocke(t + k, HZ.halten, -12, 0.6); zaehlK = knoten; knoten = null;
  },
  einstellen(e) { const warAus = einst.art === 'aus'; einst = { ...einst, ...e }; if (e.art === 'aus') { zaehlWeg(); if (Z && Z.still) Z.still(ctx, uhrRef && uhrRef.plan ? uhrRef.zeit() : null); for (const ks of glocken.values()) for (const g of ks) try { g.disconnect(); } catch {} glocken = new Map(); } /* 020-nb M3 + 021b: geplante Töne sofort weg */ if ('ansage' in e && !e.ansage && ton.stimme && planer) ton.stimme.halt(true); if (warAus && e.art && e.art !== 'aus') nachholen(); if (ton.stimme) ton.stimme.einstellen(einst); /* 016 */ if (haupt && ctx) haupt.gain.setTargetAtTime(einst.laut * 0.4, ctx.currentTime, 0.05); if (mQuelle && mGain && ctx && 'musikLaut' in e) mGain.gain.setTargetAtTime(musikZiel(), ctx.currentTime, 0.1); },
  starte(uhr, plan) { uhrRef = uhr; planRef = plan; lauf++; ansageWeg(); geplant = new Map(); gesagt = new Map(); glocken = new Map(); if (ton.stimme) ton.stimme.starte(uhr); /* 016 */ if (einst.art === 'wind') windStart(); clearInterval(planer); planer = setInterval(takt, 100); takt(); if (einst.musikAn && (mPuffer || TEST)) musikAn(false); },
  neuPlanen() {   // nur Schritte, deren Startzeit sich geändert hat (Atmen-/Stopp-Knopf), neu planen – nie den gerade laufenden noch einmal
    const p = uhrRef && uhrRef.plan; if (!p) return;
    if (Z) Z.neuPlanen(p, uhrRef.zeit(), ctx);   // 020-klang
    for (const [i, st] of geplant) if (p.start[i] !== st) {
      geplant.delete(i); if (ansageT.has(i)) { gesagt.delete(i); clearTimeout(ansageT.get(i)); ansageT.delete(i); }   // schon gesprochen: nicht noch einmal
      for (const g of glocken.get(i) || []) try { g.disconnect(); } catch {}   // Glocke zur alten Startzeit abschalten (sonst zwei Glocken)
      glocken.delete(i);
    }
    if (ton.stimme) ton.stimme.neuPlanen(p);   // 016
    if (planer) takt();   // Schritt, der durch den Knopf jetzt beginnt, sofort planen (nicht erst beim nächsten Takt, sonst > 50 ms und still)
  },
  halt() {
    clearInterval(planer); planer = null; zaehlWeg();
    if (Z) Z.halt(ctx, uhrRef && uhrRef.plan ? uhrRef.zeit() : null);   // 020-klang
    if (ctx && haupt) { const t = ctx.currentTime; haupt.gain.cancelScheduledValues(t); haupt.gain.setValueAtTime(haupt.gain.value, t); haupt.gain.linearRampToValueAtTime(0, t + 0.05); const h = haupt; setTimeout(() => { try { h.disconnect(); } catch {} }, 120); haupt = ctx.createGain(); haupt.gain.value = einst.laut * 0.4; haupt.connect(ctx.destination); }
    wind = null; geplant = new Map(); gesagt = new Map(); glocken = new Map(); lauf++; ansageWeg(); musikAus(); if (ton.stimme) ton.stimme.halt();   // 016
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch {}
  },
  zaehltoene: zLade,   // 020-klang
  ende() { if (TEST) { proto.push({ art: 'ende', t_ms: uhrRef ? uhrRef.zeit() : 0 }); return; } if (!ctx || einst.art === 'aus' || ctx.state !== 'running') return; const t = ctx.currentTime + 0.05; glocke(t, 294); glocke(t + 0.3, 392); glocke(t + 0.6, 494); },
  async pruefen() {
    if (TEST) { for (const a of ['ein', 'halten', 'aus']) proto.push({ art: 'pruefen', hz: HZ[a], t_ms: 0 }); return { ok: true, zustand: 'test', latenz_ms: 0 }; }
    ton.entsperren(); if (!ctx) return { ok: false, zustand: 'kein Web Audio', latenz_ms: 0 };
    const t = ctx.currentTime + 0.1; glocke(t, HZ.ein); glocke(t + 1.2, HZ.halten, -8); glocke(t + 2.4, HZ.aus);
    return { ok: ctx.state === 'running', zustand: ctx.state, latenz_ms: Math.round(1000 * (ctx.outputLatency || ctx.baseLatency || 0)) };
  },
  schliessen() { try { if (ctx) ctx.close(); } catch {} ctx = null; haupt = null; wind = null; mGain = null; mQuelle = null; mPuffer = null; probeG = null; probeQ = []; rausch = null; try { if (navigator.audioSession) navigator.audioSession.type = 'auto'; } catch {} },
  // Probe zur Klang-Wahl (≈ 2,5 s): 'klang' Ein- dann Aus-Glocke · 'wind' 1,2 s steigend + 1,2 s fallend · 'aus' still · 'glocke' eine kurze Glocke (Lautstärke)
  probe(art) {
    if (TEST) { proto.push({ art: 'probe', ton: art, t_ms: Math.round(performance.now()) }); return true; }
    probeStopp(); musikAus(0.05); if (!ctx || !haupt || art === 'aus') return !!ctx;
    const g = ctx.createGain(); g.gain.value = 1; g.connect(haupt); probeG = g; const t = ctx.currentTime + 0.03;
    if (art === 'klang') { glocke(t, HZ.ein, 0, 1.2, g); glocke(t + 1.2, HZ.aus, 0, 1.2, g); }
    else if (art === 'glocke') glocke(t, HZ.ein, -4, 0.8, g);
    else if (/^(zaehlen|wechsel)/.test(art) && zProbe) zProbe(ctx, g, t, { ...einst, signale: art.replace('_kurz', '') }, art.endsWith('_kurz'));   // 020-klang
    else if (art === 'wind') {
      const s = ctx.createBufferSource(); s.buffer = rauschen(); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8; const v = ctx.createGain(); v.gain.value = 0;
      s.connect(f); f.connect(v); v.connect(g);
      f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1200, t + 1.2); f.frequency.linearRampToValueAtTime(400, t + 2.4);
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.5, t + 0.08); v.gain.linearRampToValueAtTime(0.35, t + 1.2); v.gain.setValueAtTime(0.35, t + 2.32); v.gain.linearRampToValueAtTime(0, t + 2.4);
      s.start(t); s.stop(t + 2.5); probeQ.push(s);
    }
    return true;
  },
  // Eigene Musik: pcm = Int16Array (Mono, rate), pegel = Ausgleich auf etwa −20 dBFS. Ohne pcm: Musik vergessen.
  musikSetzen(pcm, rate = 22050, pegel = 1) {
    musikAus(0.05); mPuffer = null; mPegel = pegel || 1; mPos = 0;
    if (TEST || !pcm || !ctx) return !!pcm;
    try { const b = ctx.createBuffer(1, pcm.length, rate), d = b.getChannelData(0); for (let i = 0; i < pcm.length; i++) d[i] = pcm[i] / 32768; mPuffer = b; } catch { mPuffer = null; }
    return !!mPuffer;
  },
  musikProbe() { probeStopp(); musikAn(true); },
  musikStopp() { musikAus(0.05); },
  musikDa: () => !!mPuffer,
  protokoll() { return proto.slice(); },
  leeren() { proto = []; }
};
