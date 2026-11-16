// Atem – Meditation (0.1.6): spielt eine geführte Meditation aus stimme/<sp>/<kurz>.json. Satz-Clips + Pausen + Stillen aus dem
// Manifest, alles auf der AudioContext-Uhr geplant (kein Timer je Satz). Kurz/normal/lang aus denselben Clips, Einschlaf-Modus
// (modus wach/schlaf), Ausblenden, Pause/Weiter (ab Satzanfang)/Beenden. Clips erst bei Bedarf, die nächsten 3 vorab;
// bei Bildschirm aus (hidden) alles Restliche laden und planen, damit der Ton ohne JavaScript weiterläuft (soweit iOS es erlaubt).
// Fehlt ein Clip (offline, nicht im Cache): diesen Satz spricht die Systemstimme zur selben Zeit („Systemstimme“).
export const CACHE = 'atem-stimme-v1';
export const LAENGEN = ['kurz', 'normal', 'lang'];
const LANG = { de: 'de-DE', en: 'en-GB', ar: 'ar-EG', it: 'it-IT' };   // 020: + Italienisch
const VORAUS_S = 20, VORAB = 3, PARALLEL = 3;
const db = (d) => Math.pow(10, (d || 0) / 20);

// Reine Funktion (Tests, Anzeige): Einträge in Spielreihenfolge mit Startzeit ab (s ab Beginn)
export function zeitplan(med, laenge, schlaf = false) {
  const z = []; let t = 0;
  for (const a of med.abschnitte) for (const s of a.segmente) {
    if (s.in && !s.in.includes(laenge)) continue;
    if (s.modus && s.modus !== (schlaf ? 'schlaf' : 'wach')) continue;   // wach überspringt „schlaf“, Einschlafen überspringt „wach“
    if (s.art === 'sprache') { const d = s.ms / 1000, p = (s.pause_s || {})[laenge] || 0; z.push({ art: 'sprache', id: s.id, datei: s.datei, text: s.text, ab: t, dauer: d, pause: p, db: (a.pegel_db || 0) + (s.pegel_db || 0) }); t += d + p; }
    else if (s.art === 'stille') { const d = s.dauer_s[laenge]; z.push({ art: 'stille', id: s.id, ab: t, dauer: d, ende_stille: !!s.ende_stille }); t += d; }
    else if (s.art === 'glocke') z.push({ art: 'glocke', id: s.id, ab: t, dauer: 0 });
  }
  return { eintraege: z, gesamt: t, glocke: z.some((e) => e.art === 'glocke') };
}
export const dateien = (med) => [...new Set(med.abschnitte.flatMap((a) => a.segmente.map((s) => s.datei).filter(Boolean)))];

// Offline: alle Dateien einer Meditation holen (der Service Worker legt sie in atem-stimme-v1; ohne Worker legen wir selbst ab)
export async function allesLaden(basis, sp, med, fortschritt) {
  const liste = [basis + sp + '/' + med.kurz + '.json', ...dateien(med).map((d) => basis + sp + '/' + d)];
  const ohneSW = !(navigator.serviceWorker && navigator.serviceWorker.controller), c = ohneSW && self.caches ? await caches.open(CACHE) : null;
  let fertig = 0, fehler = 0, k = 0;
  const arbeiter = async () => { while (k < liste.length) { const u = liste[k++]; try { const r = await fetch(u); if (!r.ok) throw 0; if (c) await c.put(u, r.clone()); await r.arrayBuffer(); } catch { fehler++; } fertig++; if (fortschritt) fortschritt(fertig, liste.length); } };
  await Promise.all(Array.from({ length: 4 }, arbeiter));
  return { fertig, fehler, gesamt: liste.length };
}
export async function istOffline(basis, sp, med) {
  try { const c = await caches.open(CACHE); for (const d of dateien(med)) if (!(await c.match(new URL(basis + sp + '/' + d, location.href).href))) return false; return true; } catch { return false; }
}
export async function speicherBelegt() { try { const c = await caches.open(CACHE); return (await c.keys()).length; } catch { return 0; } }
export async function stimmenLoeschen() { try { return await caches.delete(CACHE); } catch { return false; } }

export function erzeugeSpieler(o = {}) {
  const basis = o.basis || './stimme/', AC = o.AudioContext || window.AudioContext || window.webkitAudioContext;
  let ctx = o.ctx || null, eigen = !o.ctx, master = null, med = null, sp = 'de', plan = null, laenge = 'normal', schlaf = false;
  let t0 = 0, pos = 0, zustand = 'leer', naechster = 0, takt = null, burst = false, system = false, wake = null, laut = o.laut ?? 0.6, ctxAb = 0, pruefT = null;
  const puffer = new Map(), fehlt = new Set(), laden = new Set(), quellen = new Map(), timer = new Map(), proto = [];
  const ereignis = { stand: o.beiStand || null, ende: o.beiEnde || null };
  const log = (e) => { proto.push(e); if (proto.length > 5000) proto.shift(); };
  const uhr = () => (ctx ? ctx.currentTime : performance.now() / 1000);
  const pegel = () => Math.min(1.5, Math.max(0, laut / 0.6));   // Lautstärke-Kopplung an die App (0,6 = Normalpegel der Clips)
  const url = (d) => basis + sp + '/' + d;
  async function hole(d) {   // Clip holen + dekodieren (einmal je Datei; Wiederholungen teilen den Puffer)
    if (puffer.has(d) || fehlt.has(d) || laden.has(d)) return;
    laden.add(d); const c0 = ctx;
    try {
      let r = null; try { r = await fetch(url(d)); } catch {}
      if ((!r || !r.ok) && self.caches) { const c = await caches.open(CACHE); r = await c.match(new URL(url(d), location.href).href); }
      if (!r || !r.ok) throw new Error('fehlt');
      const roh = await r.arrayBuffer();
      puffer.set(d, await new Promise((ok, f) => { const p = ctx.decodeAudioData(roh, ok, f); if (p && p.then) p.then(ok, f); }));
      log({ art: 'geladen', d });
    } catch { if (c0 !== ctx) log({ art: 'neu_laden', d }); else { fehlt.add(d); system = true; log({ art: 'fehlt', d }); } }   // 0.2.1: Kontext im Tipp ersetzt → nicht „fehlt“, beim nächsten Planen neu
    finally { laden.delete(d); if (zustand === 'laeuft') plane(); }
  }
  function vorladen() {
    const n = burst ? Infinity : VORAB, par = burst ? 4 : PARALLEL; let k = 0;
    for (let i = naechster; i < plan.eintraege.length && k < n; i++) {
      const e = plan.eintraege[i]; if (e.art !== 'sprache') continue; k++;
      if (laden.size >= par) break;
      hole(e.datei);
    }
  }
  function glocke(at) {   // Endton wie ton.js ende(): drei leise Töne
    for (const [hz, dt] of [[294, 0], [392, 0.3], [494, 0.6]]) for (const [f, a] of [[hz, 1], [hz * 2, 0.15]]) {
      const os = ctx.createOscillator(), g = ctx.createGain(); os.frequency.value = f; g.gain.value = 0;
      g.gain.setTargetAtTime(a * 0.4, at + dt, 0.02); g.gain.setTargetAtTime(0, at + dt + 0.08, 1.5 / 4); os.connect(g); g.connect(master); os.start(at + dt); os.stop(at + dt + 2); quellen.set('g' + dt + f, os);
    }
  }
  function sage(text, lautst) {
    try { const S = window.speechSynthesis; if (!S) return; const u = new SpeechSynthesisUtterance(text); u.lang = LANG[sp] || 'de-DE'; u.rate = 0.9; u.volume = Math.min(1, lautst * Math.min(1, pegel()));
      const v = (S.getVoices ? S.getVoices() : []).find((x) => (x.lang || '').replace('_', '-').startsWith(u.lang.slice(0, 2))); if (v) u.voice = v; S.speak(u); } catch {}
  }
  function plane() {   // der Reihe nach planen, bis VORAUS_S (bei Bildschirm aus: alles, was geladen ist)
    if (zustand !== 'laeuft') return;
    const jetzt = uhr() - t0;
    vorladen();
    while (naechster < plan.eintraege.length) {
      const i = naechster, e = plan.eintraege[i];
      if (!burst && e.ab > jetzt + VORAUS_S) break;
      const wann = Math.max(uhr(), t0 + e.ab);
      if (e.art === 'sprache') {
        const b = puffer.get(e.datei);
        if (!b && !fehlt.has(e.datei)) {   // noch nicht da: kurz vor seinem Einsatz die Zeitleiste anhalten (puffern statt Satz verlieren)
          if (e.ab - jetzt < 0.15) { t0 = uhr() + 0.15 - e.ab; log({ art: 'puffert', i }); }
          hole(e.datei); break;
        }
        if (b) {
          const q = ctx.createBufferSource(), g = ctx.createGain(); q.buffer = b; g.gain.value = db(e.db); q.connect(g); g.connect(master);
          q.start(wann); quellen.set(i, q); q.onended = () => { if (quellen.get(i) === q) quellen.delete(i); };
          log({ art: 'satz', i, id: e.id, datei: e.datei, wann, soll: t0 + e.ab, ab: e.ab, db: e.db });
        } else {
          const ms = Math.max(0, (wann - uhr()) * 1000);
          timer.set(i, setTimeout(() => { timer.delete(i); if (zustand === 'laeuft') { log({ art: 'system', i, id: e.id, text: e.text }); sage(e.text, db(e.db)); } }, ms));
          log({ art: 'satz_system', i, id: e.id, wann, soll: t0 + e.ab, ab: e.ab });
        }
      } else if (e.art === 'glocke') { if (ctx) glocke(wann); log({ art: 'glocke', i, wann, ab: e.ab }); }
      else if (e.art === 'stille' && e.ende_stille && ctx) {   // Einschlafen: Klang über die Schluss-Stille ausblenden
        const m = master.gain; m.setValueAtTime(pegel(), wann); m.linearRampToValueAtTime(0.0001, wann + Math.max(1, Math.min(30, e.dauer)));
        log({ art: 'ausblenden', i, wann, dauer: e.dauer });
      } else log({ art: 'stille', i, ab: e.ab, dauer: e.dauer });
      naechster++;
    }
    const ende = plan.gesamt + (plan.glocke && !schlaf ? 2.5 : 0);
    if (jetzt >= ende) { pos = jetzt; beenden('fertig'); }
    else if (ereignis.stand) ereignis.stand(A.stand());
  }
  function stopAlles(ausblende = 0.05) {
    const t = uhr();
    if (master) { const m = master, g = m.gain; try { g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + ausblende); } catch {} setTimeout(() => { try { m.disconnect(); } catch {} }, ausblende * 1000 + 80); }
    for (const q of quellen.values()) try { q.stop(t + ausblende + 0.02); } catch {}
    quellen.clear(); for (const x of timer.values()) clearTimeout(x); timer.clear();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch {}
    master = null;
  }
  function neuerAusgang() { master = ctx.createGain(); master.gain.value = pegel(); master.connect(ctx.destination); }
  // 0.2.1 (wie ton.js 021b): Störung (Anruf, Sperre) → Pause; nur der aktuelle Kontext zählt
  function wache() { const c = ctx; if (c) c.onstatechange = () => { if (c === ctx && c.state !== 'running' && c.state !== 'closed' && zustand === 'laeuft') A.pause('stoerung'); }; }
  // 0.2.1: läuft der Ton 1,2 s nach Start/Weiter nicht (iOS: resume() hängt), ehrlich anhalten – das Blatt „Weiter“ erscheint, der Tipp darauf legt einen neuen Kontext an
  function pruefeLauf() { clearTimeout(pruefT); pruefT = setTimeout(() => { pruefT = null; if (zustand === 'laeuft' && ctx && ctx.state !== 'running' && ctx.state !== 'closed') A.pause('stumm'); }, 1200); }
  const sicht = () => { burst = document.visibilityState === 'hidden'; if (zustand === 'laeuft') { if (burst) vorladen(); else holeWake(); plane(); } };
  async function holeWake() { try { if (o.wach !== false && !wake && navigator.wakeLock && document.visibilityState === 'visible') { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch { wake = null; } }
  function lasseWake() { try { if (wake) wake.release(); } catch {} wake = null; }
  function medien(an) {
    try {
      if (navigator.audioSession) navigator.audioSession.type = an ? 'playback' : 'auto';
      const M = navigator.mediaSession; if (!M) return;
      if (!an) { M.metadata = null; M.playbackState = 'none'; for (const a of ['play', 'pause', 'stop']) M.setActionHandler(a, null); return; }
      if (window.MediaMetadata) M.metadata = new MediaMetadata({ title: med.titel, artist: o.app || 'Atem', album: o.bereich || 'Meditation' });   // ohne Marken- oder Stimmennamen
      M.playbackState = zustand === 'laeuft' ? 'playing' : 'paused';
      M.setActionHandler('play', () => A.weiter()); M.setActionHandler('pause', () => A.pause()); M.setActionHandler('stop', () => A.beenden('gestoppt'));
    } catch {}
  }
  function beenden(grund, ausblende) {
    if (zustand === 'ende' || zustand === 'leer') return;
    const war = zustand; zustand = 'ende'; clearInterval(takt); takt = null; clearTimeout(pruefT);
    stopAlles(ausblende ?? (grund === 'fertig' ? 0.05 : 1.2));
    document.removeEventListener('visibilitychange', sicht); lasseWake(); medien(false);
    if (ctx && eigen) { const c = ctx; setTimeout(() => { try { c.close(); } catch {} }, 1500); ctx = null; }
    log({ art: 'ende', grund, war });
    if (ereignis.ende) ereignis.ende({ grund, t: pos, gesamt: plan.gesamt, system });
  }
  const A = {
    // Im Tipp auf „Starten“ rufen (iOS: Ton vor jedem await anlegen)
    // 0.2.1 (B1): hängt der Kontext (iOS nach Sperre „interrupted“, resume() kommt nicht an – WebKit 281566), im Tipp einen neuen anlegen.
    // Die Puffer bleiben (AudioBuffer gehören keinem Kontext); der alte wird erst nach 2 s geschlossen (laufendes Dekodieren).
    entsperren() {
      const t = performance.now(), geste = !navigator.userActivation || navigator.userActivation.isActive;
      if (ctx && eigen && geste && zustand !== 'laeuft' && ctx.state !== 'running' && ctx.state !== 'closed' && (ctx.state === 'interrupted' || t - ctxAb > 800)) {
        const alt = ctx; ctx = null; alt.onstatechange = null; setTimeout(() => { try { alt.close(); } catch {} }, 2000); log({ art: 'neuer_kontext', war: alt.state });
      }
      if (!ctx && AC) { try { ctx = new AC({ latencyHint: 'playback', sampleRate: 24000 }); } catch { ctx = new AC(); } eigen = true; ctxAb = t; wache(); }
      if (ctx && ctx.state !== 'running') { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); }
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
      return ctx;
    },
    async lade(sprache, kurz) { sp = sprache; const r = await fetch(basis + sp + '/' + kurz + '.json'); if (!r.ok) throw new Error('Manifest ' + r.status); med = await r.json(); return med; },
    setzeManifest(m, sprache) { med = m; sp = sprache || m.sprache; },
    get manifest() { return med; },
    async starte({ laenge: L = 'normal', schlaf: s = false, ab = 0 } = {}) {
      if (!med) throw new Error('kein Manifest');
      if (!med.laengen[L]) L = LAENGEN.find((x) => med.laengen[x]);
      laenge = L; schlaf = !!(s && med.schlaf_modus); plan = zeitplan(med, laenge, schlaf);
      A.entsperren(); neuerAusgang(); wache();   // Anruf/Sperre: Pause
      naechster = plan.eintraege.findIndex((e) => e.ab + (e.dauer || 0) > ab); if (naechster < 0) naechster = plan.eintraege.length;
      t0 = uhr() + 0.3 - (naechster < plan.eintraege.length ? plan.eintraege[naechster].ab : ab);
      zustand = 'laeuft'; burst = document.visibilityState === 'hidden';
      document.addEventListener('visibilitychange', sicht); holeWake(); medien(true);
      log({ art: 'start', laenge, schlaf, sp, gesamt: plan.gesamt, t0 });
      clearInterval(takt); takt = setInterval(plane, 250); plane(); pruefeLauf();
      return plan;
    },
    pause(grund = 'knopf') {
      if (zustand !== 'laeuft') return;
      pos = Math.max(0, uhr() - t0); zustand = 'pause'; clearInterval(takt); takt = null; clearTimeout(pruefT); stopAlles(0.25); lasseWake(); medien(true);
      log({ art: 'pause', pos, grund });
      if (ereignis.stand) ereignis.stand(A.stand());
    },
    weiter() {   // ab Satzanfang (in einer Stille: an derselben Stelle)
      if (zustand !== 'pause') return;
      A.entsperren(); neuerAusgang();
      let i = plan.eintraege.findIndex((e) => pos < e.ab + e.dauer + (e.pause || 0)); if (i < 0) i = plan.eintraege.length;
      const e = plan.eintraege[i], neu = !e ? plan.gesamt : e.art === 'sprache' ? e.ab : Math.max(e.ab, pos);
      naechster = i; t0 = uhr() + 0.3 - neu; zustand = 'laeuft'; holeWake(); medien(true);
      log({ art: 'weiter', ab: neu, i });
      clearInterval(takt); takt = setInterval(plane, 250); plane(); pruefeLauf();
    },
    beenden(grund = 'gestoppt') { if (zustand === 'laeuft') pos = uhr() - t0; beenden(grund); },
    lautstaerke(l) { laut = l; if (master && ctx) master.gain.setTargetAtTime(pegel(), ctx.currentTime, 0.05); },
    stand() {
      const t = zustand === 'laeuft' ? Math.max(0, uhr() - t0) : pos;
      let akt = null; if (plan) for (const e of plan.eintraege) { if (e.ab > t) break; if (e.art === 'sprache' && t < e.ab + e.dauer + 0.5) akt = e; }
      return { zustand, t, gesamt: plan ? plan.gesamt : 0, rest: plan ? Math.max(0, plan.gesamt - t) : 0, text: akt ? akt.text : '', system, laenge, schlaf };
    },
    get zustand() { return zustand; }, get plan() { return plan; }, get ctx() { return ctx; },
    protokoll: () => proto.slice(), _sicht: sicht
  };
  return A;
}
