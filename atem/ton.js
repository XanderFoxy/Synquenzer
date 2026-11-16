// Atem – Ton (KONZEPT §7). Das Bild führt, der Ton hilft. Im Testmodus (?test=1) nur Protokoll, kein AudioContext.
const TEST = typeof location !== 'undefined' && /[?&]test=1/.test(location.search);
const HZ = { ein: 392, ein2: 494, aus: 294, halten: 330 };
let ctx = null, haupt = null, einst = { art: 'klang', laut: 0.6, sekunden: false, ansage: false }, planer = null, geplant = new Set(), proto = [], wind = null, rausch = null;
let uhrRef = null, planRef = null, testZeit = null;
const db = (d) => Math.pow(10, d / 20);

function neuerKontext() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const c = new AC({ latencyHint: 'interactive' });
  haupt = c.createGain(); haupt.gain.value = einst.laut * 0.4; haupt.connect(c.destination);
  const b = c.createBuffer(1, 1, c.sampleRate), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
  c.onstatechange = () => { if ((c.state === 'interrupted' || c.state === 'suspended') && ton.beiStoerung) ton.beiStoerung(c.state); };
  return c;
}
function glocke(at, hz, lautDb = 0, dauer = 1.5) {
  if (TEST) { proto.push({ art: 'glocke', hz, t_ms: testZeit }); return; }
  if (!ctx) return;
  for (const [f, a] of [[hz, 1], [hz * 2, 0.15]]) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.value = 0;
    g.gain.setTargetAtTime(a * db(lautDb), at, 0.02); g.gain.setTargetAtTime(0, at + 0.08, dauer / 4);
    o.connect(g); g.connect(haupt); o.start(at); o.stop(at + dauer + 0.5);
  }
}
function tick(at, lautDb = -14) {
  if (TEST) { proto.push({ art: 'tick', t_ms: testZeit }); return; }
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 1800; g.gain.value = 0;
  g.gain.setTargetAtTime(db(lautDb), at, 0.003); g.gain.setTargetAtTime(0, at + 0.02, 0.01); o.connect(g); g.connect(haupt); o.start(at); o.stop(at + 0.1);
}
function windStart() {
  if (!ctx || wind) return;
  if (!rausch) { rausch = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = rausch.getChannelData(0); let x = 0; for (let i = 0; i < d.length; i++) { x = 0.97 * x + 0.03 * (Math.random() * 2 - 1); d[i] = x * 3; } }
  const s = ctx.createBufferSource(); s.buffer = rausch; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.value = 400;
  const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(haupt); s.start();
  wind = { s, f, g };
}
function ansage(wort) { try { if (!einst.ansage || !window.speechSynthesis) return; const u = new SpeechSynthesisUtterance(wort); u.lang = 'de-DE'; speechSynthesis.speak(u); } catch {} }
const ANSAGE = { ein: 'Ein', ein2: 'Noch etwas', halten_voll: 'Halten', halten_leer: 'Halten', aus: 'Aus' };

function planeSchritt(i, at) {
  const s = planRef.schritte[i]; if (!s) return;
  const dauer = (s.ms || 0) / 1000, schnell = planRef.technik === 'wach' || planRef.technik === 'kraft';
  if (einst.art === 'aus') return;
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
  if (s.art === 'ein') glocke(at, HZ.ein); else if (s.art === 'ein2') glocke(at, HZ.ein2, 0, 0.4); else if (s.art === 'aus') glocke(at, HZ.aus);
  else if (s.art.startsWith('halten')) glocke(at, HZ.halten, -8);
  if (einst.sekunden && s.art.startsWith('halten') && dauer >= 3) for (let k = 1; k < dauer; k++) tick(at + k, -20);
}
function takt() {
  if (!uhrRef || !planRef || uhrRef.pausiert) return;
  const jetzt = uhrRef.zeit(), plan = uhrRef.plan || planRef;
  planRef = plan;
  const ausgleich = ctx ? Math.min(0.3, Math.max(0, ctx.outputLatency || ctx.baseLatency || 0)) : 0;
  for (let i = 0; i < plan.schritte.length; i++) {
    const st = plan.start[i];
    if (st > jetzt + 600) break;
    if (st < jetzt - 50 || geplant.has(i)) continue;
    if (plan.offenAb >= 0 && i > plan.offenAb) break;
    geplant.add(i);
    testZeit = st;
    const at = ctx ? ctx.currentTime + (st - jetzt) / 1000 - ausgleich : 0;
    planeSchritt(i, Math.max(ctx ? ctx.currentTime : 0, at));
    if (einst.ansage && plan.modus !== 'messen' && (plan.schritte[i].ms || 0) >= 2000 && ANSAGE[plan.schritte[i].art]) setTimeout(() => ansage(ANSAGE[plan.schritte[i].art]), Math.max(0, st - jetzt - 250));
  }
}
export const ton = {
  beiStoerung: null,
  entsperren(musik) {
    if (TEST) return true;
    try { if (navigator.audioSession) navigator.audioSession.type = musik ? 'ambient' : 'playback'; } catch {}
    try {
      if (!ctx || ctx.state === 'closed') { ctx = neuerKontext(); wind = null; }   // 0.1.2.1: bei „interrupted“ nicht immer neue Kontexte anlegen
      if (ctx && ctx.state !== 'running') { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); }
      if (haupt) haupt.gain.value = einst.laut * 0.4;
      if (einst.ansage && window.speechSynthesis) { const u = new SpeechSynthesisUtterance(''); u.volume = 0; speechSynthesis.speak(u); }
    } catch { return false; }
    return true;
  },
  einstellen(e) { einst = { ...einst, ...e }; if (haupt && ctx) haupt.gain.setTargetAtTime(einst.laut * 0.4, ctx.currentTime, 0.05); },
  starte(uhr, plan) { uhrRef = uhr; planRef = plan; geplant = new Set(); if (einst.art === 'wind') windStart(); clearInterval(planer); planer = setInterval(takt, 100); takt(); },
  neuPlanen() { geplant = new Set([...geplant].filter((i) => uhrRef && uhrRef.plan && uhrRef.plan.start[i] < uhrRef.zeit() - 50)); },
  halt() {
    clearInterval(planer); planer = null;
    if (ctx && haupt) { const t = ctx.currentTime; haupt.gain.cancelScheduledValues(t); haupt.gain.setValueAtTime(haupt.gain.value, t); haupt.gain.linearRampToValueAtTime(0, t + 0.05); const h = haupt; setTimeout(() => { try { h.disconnect(); } catch {} }, 120); haupt = ctx.createGain(); haupt.gain.value = einst.laut * 0.4; haupt.connect(ctx.destination); }
    wind = null; geplant = new Set();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch {}
  },
  ende() { if (TEST) { proto.push({ art: 'ende', t_ms: uhrRef ? uhrRef.zeit() : 0 }); return; } if (!ctx || einst.art === 'aus') return; const t = ctx.currentTime + 0.05; glocke(t, 294); glocke(t + 0.3, 392); glocke(t + 0.6, 494); },
  async pruefen() {
    if (TEST) { for (const a of ['ein', 'halten', 'aus']) proto.push({ art: 'pruefen', hz: HZ[a], t_ms: 0 }); return { ok: true, zustand: 'test', latenz_ms: 0 }; }
    ton.entsperren(); if (!ctx) return { ok: false, zustand: 'kein Web Audio', latenz_ms: 0 };
    const t = ctx.currentTime + 0.1; glocke(t, HZ.ein); glocke(t + 1.2, HZ.halten, -8); glocke(t + 2.4, HZ.aus);
    return { ok: ctx.state === 'running', zustand: ctx.state, latenz_ms: Math.round(1000 * (ctx.outputLatency || ctx.baseLatency || 0)) };
  },
  schliessen() { try { if (ctx) ctx.close(); } catch {} ctx = null; haupt = null; wind = null; try { if (navigator.audioSession) navigator.audioSession.type = 'auto'; } catch {} },
  protokoll() { return proto.slice(); },
  leeren() { proto = []; }
};
