// Atem – Zähltöne (0.2.0, Paket 020-klang): sanfte Takt-Signale für die Übung mit geschlossenen Augen, auf der AudioContext-Uhr
// (dieselbe Uhr wie Glocke, Kreis und Stimme). Einatmen: ein weicher Ton je Sekunde, die Tonhöhe steigt (D4 → D5, höchstens +4 dB).
// Ausatmen: die Tonhöhe fällt bis zum Grundton G3 und wird je Ton leiser – der letzte ist der tiefste und leiseste, so hört man das Ende kommen.
// Halten: gleichbleibendes, sehr leises Glimmen ohne Zählen (Zählen beim Halten kann Druck machen). Letzter Zug einer Runde: weicher Zweiklang G4 + D5.
// Vor dem Ende langer Haltephasen und Pausen (≥ 6 s bzw. ≥ 4 s): ein Ton 2 s vorher auf dem Anfangston der nächsten Phase.
// Takt: die Töne liegen auf den Sekunden VOR dem Phasenende (t = Dauer − 1, − 2 …) – genau dann, wenn die Zahl im Kreis umspringt; bei ganzen Dauern
// ist das dasselbe wie „je volle Sekunde ab Beginn“, bei krummen Dauern bleibt der 1-s-Raster über den Phasenwechsel hinweg gleichmäßig.
// Nie ein Ton in einem gesprochenen Wort (Fenster je Wort), keiner später als 0,7 s vor Phasenende (ausgeklungen vor dem nächsten Wort).
// Belege und Klang-Entwurf: atem-020/recherche/technik.md §2 (K01–K11, BT07, BT08, L22, VD14). Leistung: höchstens 1 Ton/s, 2 Knoten je Ton, Planung im 100-ms-Takt von ton.js.
const TEST = typeof location !== 'undefined' && /[?&]test=1/.test(location.search);
export const HZ = { G3: 196, A3: 220, B3: 246.94, D4: 293.66, E4: 329.63, G4: 392, A4: 440, B4: 493.88, D5: 587.33, E5: 659.25 };   // G-Dur pentatonisch
const EIN = ['D4', 'E4', 'G4', 'A4', 'B4', 'D5'], AUS = ['D5', 'B4', 'A4', 'G4', 'E4', 'D4', 'B3', 'A3', 'G3'];
export const STILE = ['zaehlen', 'wechsel', 'aus'], STANDARD = 'zaehlen', LAUT_STD = 0.6, LAUT_MAX = 0.75;
export const stilVon = (e) => (e && STILE.includes(e.signale) ? e.signale : STANDARD);
const faktorVon = (e) => Math.max(0, Math.min(LAUT_MAX, e && e.signaleLaut != null && isFinite(e.signaleLaut) ? +e.signaleLaut : LAUT_STD)) / LAUT_STD;   // Regler 0 … 0,75 → still … +1,9 dB
const boost = (hz) => 3 * Math.min(1, Math.max(0, (300 - hz) / 104));   // Handy-Lautsprecher: unter 300 Hz bis +3 dB (G3)
const PHASE = /^(ein|ein2|aus|halten_voll|halten_leer)$/;
const schnellZug = (plan, s) => (plan.technik === 'wach' || plan.technik === 'kraft') && s.zug > 0 && s.abschnitt === 'uebung';

// Übernehmen die Zähltöne diesen Schritt (die Phasen-Glocke entfällt dann)? Nicht: Messen, offene Schritte, Phasen < 1,5 s (Schnellatmung behält ihren Tick), Ruhe/Wechsel.
export function zustaendig(plan, s, stil) {
  return !!(s && plan && stil !== 'aus' && plan.modus !== 'messen' && s.ms != null && s.ms >= 1500 && PHASE.test(s.art) && s.abschnitt !== 'ruhe' && s.abschnitt !== 'wechsel' && !schnellZug(plan, s));
}
const vorFaehig = (plan, s, stil) => !!(s && plan && stil !== 'aus' && plan.modus !== 'messen' && s.ms != null && !schnellZug(plan, s) &&
  ((/^halten/.test(s.art) && s.ms >= 6000) || ((s.art === 'ruhe' || s.abschnitt === 'ruhe' || s.abschnitt === 'wechsel') && s.ms >= 4000)));
const LZ = new WeakMap();   // je Plan: Index des letzten Einatmens je Runde/Übungsteil
function letzterZug(plan, i) {
  let m = LZ.get(plan);
  if (!m) { const g = new Map(); plan.schritte.forEach((s, j) => { if (s.art === 'ein' && s.zug > 0 && s.abschnitt === 'uebung') g.set((s.teil ?? '') + '|' + (s.runde || 0), j); }); m = new Set(g.values()); LZ.set(plan, m); }
  return m.has(i);
}
const startTon = (s, vorher) => !s ? null : s.art === 'ein' ? 'D4' : s.art === 'aus' ? 'D5' : s.art === 'ein2' ? 'E5' : s.art === 'halten_leer' ? 'G3' : s.art === 'halten_voll' ? vorher : null;

// Töne eines Schritts (rein, testbar): [{ t (s ab Phasenbeginn), ton, hz, db (Entwurf), dbe (wirklich, mit Tiefen-Ausgleich), tau, typ, j, bis? }]
// wort: null | 'system' (Systemstimme: Dauer unbekannt → nichts vor 1,25 s) | { von, bis } (s ab Phasenbeginn: Sprite-Wort −0,15 … +Dauer +0,25 s)
export function pulse(plan, i, stil = STANDARD, wort = null) {
  const s = plan && plan.schritte[i], out = []; if (!s || stil === 'aus') return out;
  const D = (s.ms || 0) / 1000, nx = plan.schritte[i + 1];
  const frei = (t) => !(wort === 'system' ? t < 1.25 : wort && t >= wort.von && t <= wort.bis);
  const voll = plan.schritte[i - 1] && plan.schritte[i - 1].art === 'ein2' ? 'E5' : 'D5';
  const neu = (t, ton, db, tau, typ, j) => { const rest = D - t; out.push({ t, ton, hz: HZ[ton], db, dbe: db + boost(HZ[ton]), tau: Math.min(tau, Math.max(0.05, (rest - 0.18) / 4.6)), typ, j }); };
  if (zustaendig(plan, s, stil)) {
    const T = [0]; for (let m = Math.floor(D - 0.7 + 1e-9); m >= 1; m--) if (D - m >= 0.75) T.push(Math.round((D - m) * 1000) / 1000);   // 0 = Phasenbeginn, dann D−m (0,7-s-Regel: m ≥ 1)
    const n = T.length, halten = /^halten/.test(s.art), P = s.art === 'halten_leer' ? 'G3' : voll;
    let zug = s.art === 'ein' && letzterZug(plan, i), ersterFrei = -1;
    T.forEach((t, j) => {
      if (!frei(t)) return;
      if (ersterFrei < 0) ersterFrei = t;
      if (zug) { neu(t, 'G4', -18, 0.6, 'zug', j); out[out.length - 1].ton2 = 'D5'; out[out.length - 1].hz2 = HZ.D5; zug = false; return; }   // letzter Zug: Zweiklang auf dem ersten freien Schlag
      if (j > 0 && (stil === 'wechsel' || halten || s.art === 'ein2')) return;   // „Nur Wechsel“, Halten und Nachfüllen: nicht zählen
      const f = n > 1 ? j / (n - 1) : 0, a = j === 0 ? 4 : 0, tau = j === 0 ? 0.3 : 0.12, typ = j === 0 ? 'akzent' : 'puls';
      if (s.art === 'ein') neu(t, EIN[n > 1 ? Math.round(f * 5) : 0], -20 + 4 * f + a, tau, typ, j);
      else if (s.art === 'aus') neu(t, AUS[n > 1 ? Math.round(f * 8) : 0], -16 - 14 * f + a, tau, typ, j);
      else if (s.art === 'ein2') neu(t, 'E5', -16, tau, typ, j);
      else neu(t, P, (s.art === 'halten_leer' ? -30 : -28) + a, tau, typ, j);
    });
    if (zug) {   // 020-nb M2: kein freier Schlag (Wort „Ein“ ≈ 0,8 s bei 2 s Einatmen) – Zweiklang direkt hinter das Wort, wenn noch ≥ 0,7 s bis Phasenende
      const t = wort === 'system' ? 1.25 : wort ? Math.round((Math.max(0, wort.bis) + 0.02) * 1000) / 1000 : null;
      if (t != null && D - t >= 0.7) { neu(t, 'G4', -18, 0.6, 'zug', T.length); out[out.length - 1].ton2 = 'D5'; out[out.length - 1].hz2 = HZ.D5; }
    }
    if (s.art === 'aus') { let v = Infinity; for (const p of out) if (p.typ !== 'zug') { p.dbe = Math.min(p.dbe, v - 0.5); v = p.dbe; } }   // wirklich leiser werdend, auch mit Tiefen-Ausgleich
    if (halten && stil === 'zaehlen') {   // Glimmen: nach dem Wort/Akzent bis kurz vor Phasenende
      const t0 = Math.max(0.35, wort === 'system' ? 1.3 : wort ? wort.bis + 0.05 : 0);
      if (D - t0 >= 1.2) out.push({ t: t0, bis: D, ton: P, hz: HZ[P], db: P === 'G3' ? -36 : -34, dbe: (P === 'G3' ? -36 : -34) + boost(HZ[P]), typ: 'glimmen', j: -1 });
    }
  }
  if (vorFaehig(plan, s, stil) && nx) {   // Vorankündigung 2 s vor dem Ende auf dem Anfangston der nächsten Phase
    const ton = startTon(nx, voll), t = Math.round((D - 2) * 1000) / 1000;
    if (ton && frei(t)) neu(t, ton, -22, 0.12, 'vor', -1);
  }
  return out.sort((a, b) => a.t - b.t);
}

// ---------- Klang (Web Audio) ----------
let pw = null;
const welle = (c) => { if (!pw || pw.c !== c) { let w = null; try { w = c.createPeriodicWave(new Float32Array([0, 0, 0, 0]), new Float32Array([0, 1, 0.2, 0.063])); } catch {} pw = { c, w }; } return pw.w; };   // nur harmonische Teiltöne (−14/−24 dB), je Kontext neu (iOS-Störung → neuer Kontext)
// Ein Ton: 30 ms linear an (kein Schreck-Einsatz < 25 ms), exponentiell ab; Glimmen: 0,4 s an, bis 0,6 s vor Ende, dann ab
function knoten(c, ziel, at, p, faktor) {
  const g = c.createGain(), os = [p.hz, p.hz2].filter(Boolean).map((hz) => { const o = c.createOscillator(), w = welle(c); if (w && o.setPeriodicWave) o.setPeriodicWave(w); else o.type = 'sine'; o.frequency.value = hz; o.connect(g); return o; });
  const amp = Math.pow(10, p.dbe / 20) * faktor; g.gain.value = 0; g.gain.setValueAtTime(0, at);
  let ende;
  if (p.typ === 'glimmen') { const e = at + (p.bis - p.t); g.gain.linearRampToValueAtTime(amp, at + 0.4); g.gain.setValueAtTime(amp, e - 0.6); g.gain.setTargetAtTime(0, e - 0.6, 0.1); ende = e + 0.1; }
  else { g.gain.linearRampToValueAtTime(amp, at + 0.03); g.gain.setTargetAtTime(0, at + 0.03, p.tau); ende = at + 0.03 + 7 * p.tau; }
  g.connect(ziel); for (const o of os) { o.start(at); o.stop(ende); }
  return { g, os, at };
}
// Ganze Pläne in einen Kontext legen (Vorhören, Prüfung im OfflineAudioContext): woerter = { i: {von, bis} | 'system' }
export function spiele(c, ziel, t0, plan, stil, faktor = 1, woerter = {}) {
  const n = []; plan.schritte.forEach((s, i) => { for (const p of pulse(plan, i, stil, woerter[i] || null)) n.push(knoten(c, ziel, t0 + plan.start[i] / 1000 + p.t, p, faktor)); }); return n;
}
const PROBE = { schritte: [{ art: 'ein', ms: 4000, abschnitt: 'uebung', zug: 0 }, { art: 'aus', ms: 6000, abschnitt: 'uebung', zug: 0 }], start: [0, 4000, 10000], modus: 'probe', technik: 'probe' };
const KURZ = { schritte: [{ art: 'ein', ms: 2000, abschnitt: 'uebung', zug: 0 }, { art: 'aus', ms: 3000, abschnitt: 'uebung', zug: 0 }], start: [0, 2000, 5000], modus: 'probe', technik: 'probe' };
// Vorhören: 4 s ein + 6 s aus; kurz (Klang-Chip, Lautstärke-Regler): 2 s ein + 3 s aus
export const probe = (c, ziel, t, e, kurz) => sicher(spiele, [])(c, ziel, t, kurz ? KURZ : PROBE, stilVon(e) === 'aus' ? STANDARD : stilVon(e), faktorVon(e));

// ---------- Anbindung an ton.js (020-klang): planeSchritt → nimmt(), Wort → wort(), Ende von takt() → plane(), neuPlanen/halt ----------
let offen = new Set(), woerter = new Map(), eintraege = new Map(), meinLauf = null, stil = STANDARD, faktor = 1;
// Knoten abschalten ohne Knacken: noch nicht begonnene sofort (stumm), klingende nach dem 50-ms-Ausblenden von haupt (ton.halt) bzw. ausklingen lassen
function aus(k, c, hart) { if (!k.g) return; const t = c ? c.currentTime : 0; if (!c || k.at > t + 0.005) { try { k.g.disconnect(); } catch {} for (const o of k.os) try { o.stop(); } catch {} } else if (hart) for (const o of k.os) try { o.stop(t + 0.08); } catch {} }
function stoppe(c, jetzt) {   // jetzt (Übungsuhr): im Testmodus Abgesagtes im Protokoll kennzeichnen
  for (const e of eintraege.values()) for (const k of e.n) { aus(k, c, true); if (k.r && jetzt != null) { if (k.gl) k.r.bis_ms = Math.min(k.r.bis_ms, Math.max(jetzt, k.t_ms)); else if (k.t_ms > jetzt) k.r.weg = true; } }
  eintraege = new Map();
}
let fehler = null;
const sicher = (f, std) => function (...a) { try { return f.apply(this, a); } catch (e) { fehler = String(e && e.message || e); return std; } };   // Zähltöne dürfen die Übung nie anhalten
export const signale = {
  // aus planeSchritt (Klang-Art ≠ aus): Schritt vormerken; true = Zähltöne übernehmen den Phasenbeginn (keine Glocke)
  nimmt(i, plan, einst) {
    stil = stilVon(einst); faktor = faktorVon(einst); const s = plan && plan.schritte[i];
    const z = zustaendig(plan, s, stil); if (z || vorFaehig(plan, s, stil)) offen.add(i); return z;
  },
  // geplantes Wort zu Schritt i: 'system' oder das Ergebnis von stimme.schritt() ({ q, wann, dauer_ms? } = Sprite, sonst Systemstimme)
  wort(i, e) { if (e) woerter.set(i, e === 'system' || !e.q ? 'system' : { wann: e.wann, dauer: (e.dauer_ms ?? 1000) / 1000 }); },
  // am Ende von takt(): vorgemerkte Schritte planen – jetzt sind die Wörter dieses Takts bekannt
  plane({ ctx, ziel, jetzt, ausgleich = 0, plan, lauf, log }) {
    if (lauf !== meinLauf) { stoppe(ctx); meinLauf = lauf; }   // neuer Lauf (Start, Weiter nach Pause): Altes nie mitnehmen
    if (!offen.size || !plan) return;
    for (const i of offen) {
      const st = plan.start[i], alt = eintraege.get(i); if (alt && alt.st === st) continue;
      const at0 = ctx ? ctx.currentTime + (st - jetzt) / 1000 - ausgleich : 0, w = woerter.get(i);
      const wort = !w ? null : w === 'system' ? 'system' : { von: w.wann - 0.15 - at0, bis: w.wann + w.dauer + 0.25 - at0 };
      const e = { st, ende: plan.start[i + 1], n: [] };
      for (const p of pulse(plan, i, stil, wort)) {
        const t_ms = st + p.t * 1000;
        if (!TEST && !ctx) break;   // ohne Web Audio: nichts planen, nichts mitschreiben
        if (TEST) { const r = { art: p.typ === 'glimmen' ? 'glimmen' : 'puls', typ: p.typ, lauf: meinLauf, i, j: p.j, ton: p.ton, hz: p.hz, db: p.db, dbe: Math.round(p.dbe * 10) / 10, t_ms }; if (p.hz2) r.hz2 = p.hz2; if (p.bis != null) r.bis_ms = st + p.bis * 1000; if (log) log(r); e.n.push({ t_ms, r, gl: p.typ === 'glimmen' }); continue; }
        const at = at0 + p.t; if (at < ctx.currentTime - 0.02 - ausgleich - (p.t === 0 ? 0.25 : 0) || !ziel) continue;   // verpasst (Hintergrund, Last): lieber still. 020-nb M1: Latenzausgleich zählt nicht als „verpasst“; Phasenbeginn wie die Glocke noch bis 0,25 s spät „jetzt“
        e.n.push({ t_ms, gl: p.typ === 'glimmen', ...knoten(ctx, ziel, Math.max(ctx.currentTime, at), p, faktor) });
      }
      eintraege.set(i, e);
    }
    offen.clear(); woerter.clear();
  },
  // Atmen-/Stopp-Knopf: verschobene Schritte ganz neu; endet der laufende Schritt früher, Töne danach weg und Glimmen jetzt ausblenden (nie doppelt, nie verwaist)
  neuPlanen(plan, jetzt, ctx) {
    const weg = (k) => { if (k.r) k.r.weg = true; aus(k, ctx, false); };
    for (const [i, e] of eintraege) {
      if (plan.start[i] !== e.st) { for (const k of e.n) if (k.t_ms > jetzt) weg(k); eintraege.delete(i); continue; }
      const ende = plan.start[i + 1]; if (ende === e.ende) continue; e.ende = ende;
      for (const k of e.n) {
        if (k.gl) { if (k.r) k.r.bis_ms = Math.min(k.r.bis_ms, Math.max(jetzt, ende)); if (k.g && ctx) { const t = ctx.currentTime; try { k.g.gain.cancelScheduledValues(t); k.g.gain.setValueAtTime(k.g.gain.value, t); k.g.gain.setTargetAtTime(0, t, 0.04); for (const o of k.os) o.stop(t + 0.3); } catch {} } }
        else if (k.t_ms > jetzt && k.t_ms > ende - 700) weg(k);
      }
    }
  },
  halt(ctx, jetzt) { stoppe(ctx, jetzt); offen = new Set(); woerter = new Map(); },
  // 020-nb M3: „Ton aus“ in der Übung wirkt sofort – geplante Zähltöne weg, klingende in 20 ms ausblenden (kein Knacks)
  still(ctx, jetzt) {
    const t = ctx ? ctx.currentTime : 0;
    for (const e of eintraege.values()) for (const k of e.n) {
      if (k.r && jetzt != null) { if (k.gl) k.r.bis_ms = Math.min(k.r.bis_ms, Math.max(jetzt, k.t_ms)); else if (k.t_ms > jetzt) k.r.weg = true; }
      if (!k.g) continue;
      if (!ctx || k.at > t + 0.005) aus(k, ctx, false);
      else try { k.g.gain.cancelScheduledValues(t); k.g.gain.setValueAtTime(k.g.gain.value, t); k.g.gain.setTargetAtTime(0, t, 0.02); for (const o of k.os) o.stop(t + 0.15); } catch {}
    }
    eintraege = new Map(); offen = new Set(); woerter = new Map();
  },
  stand: (alle) => ({ stil, faktor, geplant: eintraege.size, fehler, toene: alle ? [...eintraege].flatMap(([i, e]) => e.n.map((k) => ({ i, at: k.at, gl: !!k.gl }))) : undefined })
};
for (const k of ['nimmt', 'wort', 'plane', 'neuPlanen', 'halt', 'still']) signale[k] = sicher(signale[k], k === 'nimmt' ? false : undefined);

// ---------- Einstellungen (Karte „Ton“ in app.js): Stil-Chips, Vorhören, eigene Lautstärke ----------
const NAME = { zaehlen: 'Zählen', wechsel: 'Nur Wechsel', aus: 'Aus' };
export const TEXT = { zaehlen: 'Zählen: ein leiser Ton je Sekunde – steigt beim Einatmen, fällt beim Ausatmen und wird leiser.', wechsel: 'Nur Wechsel: ein leiser Ton, wenn die Phase wechselt – und kurz vorher.', aus: 'Ohne Zähltöne.' };
export function zaehlKarte(e, sym) {
  const s = stilVon(e), l = e && e.signaleLaut != null ? e.signaleLaut : LAUT_STD;
  return `<div class="zt" id="zaehltoene"><b class="zt-titel">Zähltöne</b><div class="chips">${STILE.map((t) => `<button class="chip ${s === t ? 'an' : ''}" data-zt="${t}" aria-pressed="${s === t}">${NAME[t]}</button>`).join('')}</div>
    <button class="knopf klein zweit" id="ztprobe">${sym('play')}<span>Vorhören</span></button><label class="schieber">Lautstärke Zähltöne <input type="range" min="0" max="${LAUT_MAX}" step="0.05" value="${l}" data-k="signaleLaut"></label></div>`;
}
// Tipp auf Chip/Vorhören: wählen, merken und sofort hören (wie die Klang-Wahl). true = erledigt
const zeigeText = (t) => { const pt = document.querySelector('#probetext'), pw = document.querySelector('#probewort'); if (pt && pw) { pw.textContent = t; pt.classList.remove('puls'); void pt.offsetWidth; pt.classList.add('puls'); } };
export function zaehlKlick(b, { ton, speicher, zeige = zeigeText }) {
  if (!b.dataset.zt && b.id !== 'ztprobe') return false;
  const e = b.dataset.zt ? speicher.setzeEinst({ signale: b.dataset.zt }) : speicher.einst(), s = stilVon(e);
  if (b.dataset.zt) b.parentNode.querySelectorAll('[data-zt]').forEach((c) => { c.classList.toggle('an', c === b); c.setAttribute('aria-pressed', c === b); });
  ton.entsperren(e.musik); ton.einstellen({ signale: s, signaleLaut: e.signaleLaut, laut: e.laut });
  if (s !== 'aus' || b.id === 'ztprobe') ton.probe(s === 'aus' ? 'zaehlen' : s); else ton.probe('aus');
  if (zeige) zeige(TEXT[s]);
  return true;
}
