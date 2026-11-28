// Gesangstrainer – bewertung.js: Rückmeldung nach jedem Durchgang. Reines ES-Modul ohne DOM (auch in Node testbar).
//
// export function bewerte(ziel, rahmen, opt) → Ergebnis eines gesungenen Durchgangs
//   ziel   [{t, dauer, midi, bis?, vokal?, gleit?, silbe?, einsatz?}]  Sekunden ab Beginn des Nachsingens
//          (bis = Endton eines Gleitens; einsatz:false = Ton schließt ohne neuen Einsatz an, z. B. Vokalwechsel)
//   rahmen [{t, m, p, F1?, F2?}]  Mikrofon-Rahmen: m = MIDI (Kommazahl) oder null (stimmlos), p = Pegel dBFS.
//          t im selben Zeitraster (negativ = vor dem Einsatz, also während des Einzählens).
//   opt    {schwelle (dB, ab da zählt ein Rahmen als Stimme), vokale (bool), stimme 'm'|'w', name(midi) → Notenname,
//           formanten (Tabelle {a:[F1,F2,…]} – Ziel-Vokale), sprechen (bool, nur Timing)}
// export function bewerteAtem(phasen, rahmen, opt) → Ergebnis einer Atem-Übung (Zischen auf „sss“)
// export function gesamt(liste) → Durchschnitt mehrerer Ergebnisse (nur gültige)
//
// Ergebnis: {gesamt 0–100, gueltig, teile:[{id, name, wert 0–1 | null, text}], atem:{text}, tipp, je:[…], centMittel,
//            einsatzMittel}. Alle Werte sind Messungen über das Mikrofon – ehrlich benannt, keine Noten über den Sänger.

const TREFF_CENT = 50;            // „Treffsicherheit“: Anteil innerhalb ±50 Cent
const EINSATZ_OK = 0.08, EINSATZ_NULL = 0.4;   // s: bis 80 ms voll, ab 400 ms null
const STABIL_OK = 18, STABIL_NULL = 60;        // Cent Streuung: bis 18 voll (leichtes Vibrato), ab 60 null

const klemme = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mittel = (v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
const median = (v) => { if (!v.length) return 0; const s = v.slice().sort((a, b) => a - b); return s[s.length >> 1]; };
const streuung = (v) => { if (v.length < 2) return 0; const m = mittel(v); return Math.sqrt(mittel(v.map((x) => (x - m) ** 2))); };
const prozent = (x) => Math.round(klemme(x) * 100);
const komma = (x, n = 1) => String(Math.round(x * 10 ** n) / 10 ** n).replace('.', ',');

/** Tonhöhe des Ziels zur Zeit t (Gleiten linear in Halbtönen). */
function zielTon(n, t) {
  if (n.bis == null || !isFinite(n.bis)) return n.midi;
  const u = klemme((t - n.t) / Math.max(0.01, n.dauer));
  return n.midi + (n.bis - n.midi) * u;
}
/** Abweichung in Halbtönen, auf die nächste Oktave gefaltet (Oktavfehler der Erkennung zählen nicht). */
function falte(m, z) { let d = m - z; d -= 12 * Math.round(d / 12); return d; }

// Vokal-Paar aus der Phonetik-Schreibung ('ei', 'ou', 'a' + gleit 'i' …)
const DI = { ai: ['a', 'i'], ei: ['e', 'i'], ay: ['a', 'i'], au: ['a', 'u'], ou: ['o', 'u'], eu: ['o', 'i'], 'äu': ['o', 'i'], oi: ['o', 'i'], ie: ['i', ''], ee: ['e', ''], oo: ['u', ''] };
export function vokalPaar(vokal, gleit) {
  let s = String(vokal || '').toLowerCase().replace('ae', 'ä').replace('oe', 'ö').replace('ue', 'ü');
  let g = String(gleit || '').toLowerCase()[0] || '';
  if (s.length > 1 && DI[s.slice(0, 2)]) { const p = DI[s.slice(0, 2)]; s = p[0]; g = g || p[1]; } else s = s[0] || '';
  if (s === 'y') s = 'i';
  return { a: 'aeiouäöü'.includes(s) && s ? s : '', b: 'aeiouäöü'.includes(g) && g ? g : '' };
}
const VNAME = (v) => (v === 'ö' ? 'Ö' : String(v || '').toUpperCase());
const VOKAL_TIPP = {
  a: 'Kiefer locker fallen lassen und die Zunge flach vorne liegen lassen – das A bleibt offen',
  e: 'Mundwinkel nicht breit ziehen, die Zunge vorne leicht anheben – ein klares E',
  i: 'Zunge vorne hoch, aber der Kiefer bleibt etwas offen – sonst wird das I eng',
  o: 'Lippen rund nach vorne, hinten im Mund Raum lassen – ein rundes O',
  u: 'Lippen spitz und rund, Kiefer locker – das U bleibt dunkel und weich',
  'ä': 'etwas offener als E, Zunge vorne – ein helles Ä',
  'ö': 'den Murmellaut leicht und locker nehmen, nicht drücken',
  'ü': 'wie I sprechen, aber mit runden Lippen',
};

/** Mikrofon-Rahmen, die als Stimme zählen. */
const istStimme = (r, schwelle) => r && r.m != null && isFinite(r.m) && r.p >= schwelle;

export function bewerte(ziel0, rahmen0, opt = {}) {
  const schwelle = opt.schwelle ?? -55;
  const name = typeof opt.name === 'function' ? opt.name : (m) => String(Math.round(m));
  const ziel = (ziel0 || []).filter((n) => n && isFinite(n.t) && isFinite(n.dauer) && n.dauer > 0 && (opt.sprechen || isFinite(n.midi)));
  const rahmen = (rahmen0 || []).filter((r) => r && isFinite(r.t)).sort((a, b) => a.t - b.t);
  const dt = rahmen.length > 2 ? median(rahmen.slice(1).map((r, i) => r.t - rahmen[i].t)) || 0.02 : 0.02;
  const ab = (t) => { let lo = 0, hi = rahmen.length; while (lo < hi) { const m = (lo + hi) >> 1; if (rahmen[m].t < t) lo = m + 1; else hi = m; } return lo; };
  const imFenster = (a, b) => rahmen.slice(ab(a), ab(b + 1e-9));
  const je = [];
  let treffTreffer = 0, treffNenner = 0, stimmeKern = 0, kernGesamt = 0;
  const cents = [], einsaetze = [], einsatzWerte = [], stabil = [], stabilGew = [], vokalWerte = [];
  const vokalNotizen = {};
  for (let i = 0; i < ziel.length; i++) {
    const n = ziel[i], vor = ziel[i - 1];
    const a = n.t + Math.min(0.1, n.dauer * 0.2), b = n.t + n.dauer - Math.min(0.08, n.dauer * 0.15);
    const kern = imFenster(a, b);
    const st = kern.filter((r) => istStimme(r, schwelle));
    const erw = Math.max(1, Math.round((b - a) / dt));
    const C = Math.max(kern.length, erw);
    let treffer = 0;
    const dCent = [];
    if (!opt.sprechen) {
      for (const r of st) {
        let d;
        if (n.bis != null && isFinite(n.bis)) { // Gleiten: bester Punkt der Zielbahn in ±0,2 s (zeit-tolerant)
          d = Infinity;
          for (let k = -4; k <= 4; k++) { const z = zielTon(n, r.t + k * 0.05); const x = falte(r.m, z); if (Math.abs(x) < Math.abs(d)) d = x; }
        } else d = falte(r.m, n.midi);
        dCent.push(d * 100);
        if (Math.abs(d * 100) <= TREFF_CENT) treffer++;
      }
      treffTreffer += treffer; treffNenner += Math.max(st.length, 0.7 * C);
      if (n.bis == null) cents.push(...dCent.filter((c) => Math.abs(c) < 300));
    }
    stimmeKern += Math.min(st.length, C); kernGesamt += C;
    // Einsatz: neuer Ton nach Pause, Tonwechsel oder ausdrücklich gewünscht
    const pauseDavor = !vor || n.t - (vor.t + vor.dauer) > 0.12;
    const gleicherTon = vor && !pauseDavor && isFinite(vor.midi) && Math.abs((vor.bis ?? vor.midi) - n.midi) < 0.5;
    const brauchtEinsatz = n.einsatz === true || (n.einsatz !== false && !gleicherTon);
    let einsatz = null;
    if (brauchtEinsatz) {
      const i0 = ab(n.t - 0.3), i1 = ab(n.t + Math.min(0.6, Math.max(0.25, n.dauer)));
      // angekommen = nah am neuen Ton und näher an ihm als am vorigen (wichtig bei Halbtonschritten)
      const vorTon = vor && !pauseDavor && isFinite(vor.midi) ? (vor.bis ?? vor.midi) : null;
      const passt = (r) => {
        if (opt.sprechen) return !!r && r.p >= schwelle;
        if (!istStimme(r, schwelle)) return false;
        const d = Math.abs(falte(r.m, zielTon(n, r.t)));
        return d <= 1.2 && (vorTon == null || d < Math.abs(falte(r.m, vorTon)));
      };
      let gefunden = null;
      for (let k = i0; k < i1; k++) {
        const r = rahmen[k];
        if (!passt(r)) continue;
        // nach einer Pause (Staccato, „ja-ja“, Sprechen) zählt nur ein echter neuer Beginn: direkt davor keine Stimme
        if (pauseDavor && vor && k > 0 && passt(rahmen[k - 1])) continue;
        let nach = 0; for (let j = k + 1; j < Math.min(i1, k + 4); j++) if (passt(rahmen[j]) || istStimme(rahmen[j], schwelle)) nach++;
        if (nach >= Math.min(2, i1 - k - 1)) { gefunden = r.t; break; }
      }
      if (gefunden != null) {
        const d = gefunden - n.t; einsatz = d; einsaetze.push(d);
        einsatzWerte.push(klemme(1 - (Math.abs(d) - EINSATZ_OK) / (EINSATZ_NULL - EINSATZ_OK)));
      } else einsatzWerte.push(0);
    }
    // Stabilität: nur gehaltene Töne (Kern ≥ 0,3 s), ohne das erste Anschleifen
    let sd = null;
    if (!opt.sprechen && n.bis == null && b - a >= 0.3) {
      const ruhig = st.filter((r) => r.t >= a + 0.12).map((r) => falte(r.m, n.midi) * 100).filter((c) => Math.abs(c) < 250);
      if (ruhig.length >= 6) { sd = streuung(ruhig); stabil.push(klemme(1 - (sd - STABIL_OK) / (STABIL_NULL - STABIL_OK))); stabilGew.push(b - a); }
    }
    // Vokal: Formanten im Kern gegen den Ziel-Vokal (vorhandene Vokal-Erkennung, F1/F2)
    let vokal = null;
    if (opt.vokale && opt.formanten && n.vokal && b - a >= 0.22) {
      const { a: va, b: vb } = vokalPaar(n.vokal, n.gleit);
      const F = opt.formanten;
      if (va && F[va]) {
        const k = opt.stimme === 'w' ? 1.15 : 1;
        const abst = (r, v) => Math.hypot(Math.log(r.F1 / (F[v][0] * k)) / 0.22, Math.log(r.F2 / (F[v][1] * k)) / 0.18);
        const ende = vb ? n.t + n.dauer * 0.6 : b;
        const mitF = st.filter((r) => r.F1 > 150 && r.F2 > 400 && r.t <= ende);
        if (mitF.length >= 3) {
          let gut = 0; const naechste = {};
          for (const r of mitF) {
            let best = va, bd = abst(r, va);
            for (const v of ['a', 'e', 'i', 'o', 'u']) { if (!F[v]) continue; const d = abst(r, v); if (d < bd) { bd = d; best = v; } }
            if (abst(r, va) <= 1.35 || best === va) gut++; else naechste[best] = (naechste[best] || 0) + 1;
          }
          vokal = gut / mitF.length;
          // Doppellaut: am Ende sollte der Nachlaut kommen
          if (vb && F[vb]) {
            const spaet = st.filter((r) => r.F1 > 150 && r.t > n.t + n.dauer * 0.7 && r.t <= n.t + n.dauer);
            if (spaet.length >= 2) { const g2 = spaet.filter((r) => abst(r, vb) < abst(r, va)).length / spaet.length; vokal = 0.75 * vokal + 0.25 * g2; }
          }
          vokalWerte.push(vokal);
          const falsch = Object.entries(naechste).sort((x, y) => y[1] - x[1])[0];
          const notiz = vokalNotizen[va] || (vokalNotizen[va] = { n: 0, summe: 0, falsch: {} });
          notiz.n++; notiz.summe += vokal; if (falsch) notiz.falsch[falsch[0]] = (notiz.falsch[falsch[0]] || 0) + falsch[1];
        }
      }
    }
    je.push({ i, silbe: n.silbe || '', midi: n.midi, treff: st.length ? treffer / Math.max(st.length, 0.7 * C) : 0,
      stimme: C ? Math.min(1, st.length / C) : 0, cent: dCent.length ? median(dCent) : null, einsatz, sd, vokal });
  }

  const gehoert = kernGesamt ? stimmeKern / kernGesamt : 0;
  const treff = opt.sprechen ? null : (treffNenner ? treffTreffer / treffNenner : 0);
  const timing = einsatzWerte.length ? mittel(einsatzWerte) : null;
  const stab = stabil.length ? stabil.reduce((s, x, k) => s + x * stabilGew[k], 0) / stabilGew.reduce((s, x) => s + x, 0) : null;
  const vok = vokalWerte.length ? mittel(vokalWerte) : null;
  const centMittel = cents.length ? median(cents) : 0;
  const einsatzMittel = einsaetze.length ? median(einsaetze) : 0;

  // Gewichte – fehlende Teile werden herausgerechnet
  const gew = opt.sprechen ? { timing: 1 } : vok != null ? { treff: 0.38, timing: 0.2, stab: 0.22, vok: 0.2 } : { treff: 0.45, timing: 0.25, stab: 0.3 };
  const werte = { treff, timing, stab, vok };
  // Pünktlich, ruhig und klarer Vokal zählen nur voll, wenn die Töne auch getroffen sind –
  // ein ruhiger, pünktlicher, aber falscher Ton (z. B. durchgehend einen Halbton daneben) ist kein gutes Ergebnis.
  const fTreff = treff == null ? 1 : 0.3 + 0.7 * klemme(treff / 0.6);
  let s = 0, g = 0;
  for (const [k, w] of Object.entries(gew)) if (werte[k] != null) { s += werte[k] * w * (k === 'treff' ? 1 : fTreff); g += w; }
  const gueltig = gehoert >= 0.1;
  const gesamtWert = gueltig && g ? s / g : 0;

  const teile = [];
  if (!opt.sprechen) teile.push({ id: 'treff', name: 'Treffsicherheit', wert: treff, text: 'Anteil der Zeit innerhalb ±50 Cent um den Zielton' });
  teile.push({ id: 'timing', name: opt.sprechen ? 'Rhythmus' : 'Timing / Einsatz', wert: timing, text: einsaetze.length ? `Einsatz im Mittel ${einsatzMittel >= 0 ? komma(einsatzMittel * 1000, 0) + ' ms später' : komma(-einsatzMittel * 1000, 0) + ' ms früher'} als der Klick` : 'Wie pünktlich die Töne beginnen' });
  if (!opt.sprechen) teile.push({ id: 'stab', name: 'Stabilität', wert: stab, text: stab == null ? 'Nur bei gehaltenen Tönen messbar' : 'Wie ruhig gehaltene Töne liegen (wenig Schwankung)' });
  if (opt.vokale) teile.push({ id: 'vok', name: 'Vokal sauber', wert: vok, text: vok == null ? 'Zu wenig klare Vokal-Messung (Schätzung über Formanten)' : 'Schätzung über die Formanten (F1/F2) deiner Vokale' });

  const atem = gehoert >= 0.1 ? atemText(ziel, rahmen, schwelle, opt) : { text: 'Atem: nichts gemessen – es war kaum Stimme zu hören.', absetzer: 0 };
  const tipp = tippVon({ gueltig, gehoert, treff, timing, stab, vok, centMittel, einsatzMittel, je, ziel, vokalNotizen, name, sprechen: opt.sprechen });
  return { gesamt: prozent(gesamtWert), gueltig, gehoert: Math.round(gehoert * 100) / 100, teile, atem, tipp, je, centMittel: Math.round(centMittel), einsatzMittel: Math.round(einsatzMittel * 1000) / 1000 };
}

/** Atem – ehrlich nur aus Pausen, Bogenlänge und Einatmen-Geräusch geschätzt. */
function atemText(ziel, rahmen, schwelle, opt) {
  if (!ziel.length || !rahmen.length) return { text: 'Atem: nichts gemessen.', absetzer: 0 };
  const stimme = (r) => istStimme(r, schwelle) || (opt.sprechen && r.p >= schwelle);
  // 1. Absetzen mitten im Bogen: Lücke > 0,25 s, wo die Melodie ohne Pause weitergeht
  let absetzer = 0;
  for (let i = 1; i < ziel.length; i++) {
    const a = ziel[i - 1], b = ziel[i];
    if (b.t - (a.t + a.dauer) > 0.15) continue;
    const f = rahmen.filter((r) => r.t > a.t + a.dauer * 0.5 && r.t < b.t + b.dauer * 0.5);
    let lauf = 0, max = 0, vt = null;
    for (const r of f) { if (!stimme(r)) { if (vt == null) vt = r.t; lauf = r.t - vt; max = Math.max(max, lauf); } else vt = null; }
    if (max > 0.25) absetzer++;
  }
  // 2. Bogen bis zum Ende gehalten? (letzter Ton jeder Phrase)
  const enden = ziel.filter((n, i) => !ziel[i + 1] || ziel[i + 1].t - (n.t + n.dauer) > 0.15);
  let kurz = 0;
  for (const n of enden) {
    if (n.dauer < 0.4) continue;
    const f = rahmen.filter((r) => r.t > n.t + n.dauer * 0.7 && r.t < n.t + n.dauer - 0.05);
    if (f.length >= 3 && f.filter(stimme).length / f.length < 0.5) kurz++;
  }
  // 3. Einatmen vor dem Einsatz: stimmloses Geräusch über dem Raum-Pegel im letzten Takt davor
  const vorher = rahmen.filter((r) => r.t < ziel[0].t - 0.05 && r.t > ziel[0].t - 2.2);
  let einatmen = false;
  if (vorher.length > 10) {
    const boden = median(vorher.map((r) => r.p));
    let lauf = 0;
    for (const r of vorher) { if (r.m == null && r.p > boden + 8 && r.p > schwelle - 6) { lauf += 0.02; if (lauf > 0.18) einatmen = true; } else lauf = 0; }
  }
  const teile = [];
  teile.push(absetzer ? `${absetzer === 1 ? 'einmal' : absetzer + '-mal'} mitten im Bogen abgesetzt` : 'Bögen ohne Absetzen');
  if (kurz) teile.push(`${kurz === 1 ? 'ein Phrasenende' : kurz + ' Phrasenenden'} zu früh losgelassen`);
  if (einatmen) teile.push('Einatmen deutlich hörbar – lieber leise durch den offenen Mund');
  return { text: `Atem (nur aus Pausen und Geräusch geschätzt): ${teile.join(', ')}.`, absetzer, kurz, einatmen };
}

function tippVon(x) {
  if (!x.gueltig) return 'Ich habe dich kaum gehört – sing etwas lauter oder halte das Telefon näher (etwa 30 cm), gern mit Kopfhörern.';
  const kandidaten = [];
  if (x.treff != null) kandidaten.push(['treff', x.treff]);
  if (x.timing != null) kandidaten.push(['timing', x.timing]);
  if (x.stab != null) kandidaten.push(['stab', x.stab]);
  if (x.vok != null) kandidaten.push(['vok', x.vok]);
  kandidaten.sort((a, b) => a[1] - b[1]);
  const [schwach, wert] = kandidaten[0] || ['', 1];
  const minus = (c) => (c < 0 ? '−' : '+') + Math.abs(Math.round(c));
  if (wert >= 0.85) {
    if (!x.sprechen && Math.abs(x.centMittel) > 25) return `Sehr gut getroffen – du liegst nur leicht ${x.centMittel > 0 ? 'zu hoch' : 'zu tief'} (im Mittel ${minus(x.centMittel)} Cent), ${x.centMittel > 0 ? 'nimm etwas Druck heraus' : 'denk die Töne von oben an'}.`;
    return 'Sehr sauber – nimm im nächsten Durchgang ein etwas schnelleres Tempo oder einen Halbton höher.';
  }
  if (x.sprechen || schwach === 'timing') {
    const d = x.einsatzMittel;
    if (Math.abs(d) < 0.06) return 'Einige Einsätze waren nicht klar – setz jeden Ton deutlich auf dem Klick an, damit ich den Beginn höre.';
    if (d > 0) return `Du setzt im Mittel ${komma(d, 2)} s zu spät ein – atme auf Zählzeit 4 ein und beginne genau mit dem Klick.`;
    return `Du kommst im Mittel ${komma(-d, 2)} s zu früh – warte auf den Klick und lass den Ton erst dann kommen.`;
  }
  if (schwach === 'treff') {
    // schlechtester Ton mit Richtung
    const schlecht = x.je.filter((n) => n.cent != null && n.stimme > 0.3).sort((a, b) => a.treff - b.treff)[0];
    const c = x.centMittel;
    const wo = schlecht && schlecht.treff < 0.6 ? `am deutlichsten bei ${schlecht.silbe ? `„${schlecht.silbe}“ auf ` : ''}${x.name(schlecht.midi)}` : '';
    if (c < -22) return `Du liegst meist etwas zu tief (im Mittel ${minus(c)} Cent${wo ? ', ' + wo : ''}) – denk den Ton leicht von oben an und lass die Luft gleichmäßig fließen.`;
    if (c > 22) return `Du liegst meist etwas zu hoch (im Mittel ${minus(c)} Cent${wo ? ', ' + wo : ''}) – weniger Druck, lass den Ton entspannt ankommen.`;
    return `Die Töne pendeln um das Ziel${wo ? ` (${wo})` : ''} – hör beim Vorsingen genau hin und lande jeden Ton ruhig, bevor du weitergehst.`;
  }
  if (schwach === 'stab') return 'Gehaltene Töne schwanken noch – Luft gleichmäßig weiterströmen lassen wie beim Zischen, ohne nachzudrücken.';
  if (schwach === 'vok') {
    const schlimm = Object.entries(x.vokalNotizen).map(([v, n]) => [v, n.summe / n.n, n.falsch]).sort((a, b) => a[1] - b[1])[0];
    if (schlimm) {
      const zu = Object.entries(schlimm[2]).sort((a, b) => b[1] - a[1])[0];
      return `Das ${VNAME(schlimm[0])}${zu ? ` klang eher nach ${VNAME(zu[0])}` : ' war noch nicht ganz klar'} – ${VOKAL_TIPP[schlimm[0]] || 'den Vokal bewusst formen'}.`;
    }
    return 'Die Vokale sind noch nicht ganz klar – sprich sie einmal langsam vor und sing sie dann genauso.';
  }
  return 'Gut – wiederhole den Durchgang einmal ganz locker.';
}

/**
 * Atem-Übung (Zischen „sss“): phasen [{t, dauer, art:'ein'|'halten'|'aus'}] (s ab Beginn), rahmen wie oben,
 * jeder Rahmen zusätzlich mit z (Nulldurchgangs-Rate 0–1). Gemessen wird nur das Luftgeräusch: Dauer, Gleichmäßigkeit,
 * Beginn – klar so benannt.
 */
export function bewerteAtem(phasen, rahmen0, opt = {}) {
  const rahmen = (rahmen0 || []).filter((r) => r && isFinite(r.t)).sort((a, b) => a.t - b.t);
  const ruhe = rahmen.filter((r) => phasen.some((p) => p.art !== 'aus' && r.t > p.t + 0.3 && r.t < p.t + p.dauer - 0.2));
  const boden = ruhe.length > 5 ? median(ruhe.map((r) => r.p)) : (rahmen.length ? Math.min(...rahmen.map((r) => r.p)) + 6 : -70);
  const zisch = (r) => r.p > boden + 9 && r.p > -70 && (r.m == null || (r.z ?? 0) > 0.12);
  const dauerW = [], gleichW = [], beginnW = [], langen = [];
  for (const p of phasen.filter((q) => q.art === 'aus')) {
    const f = rahmen.filter((r) => r.t >= p.t - 0.2 && r.t <= p.t + p.dauer + 0.1);
    const an = f.filter(zisch);
    if (!an.length) { dauerW.push(0); gleichW.push(0); beginnW.push(0); langen.push(0); continue; }
    const start = an[0].t;
    // längster zusammenhängender Lauf (Lücken < 0,25 s überbrücken)
    let lauf0 = an[0].t, ende = an[0].t, bestL = 0;
    for (let i = 1; i < an.length; i++) { if (an[i].t - an[i - 1].t > 0.25) { bestL = Math.max(bestL, ende - lauf0); lauf0 = an[i].t; } ende = an[i].t; }
    bestL = Math.max(bestL, ende - lauf0);
    langen.push(bestL);
    dauerW.push(klemme(bestL / (p.dauer * 0.92)));
    const pegel = an.map((r) => r.p);
    gleichW.push(klemme(1 - (streuung(pegel) - 2.5) / 6.5));
    beginnW.push(klemme(1 - (Math.abs(start - p.t) - 0.12) / 0.5));
  }
  const d = mittel(dauerW), gl = mittel(gleichW), be = mittel(beginnW);
  const gueltig = langen.some((x) => x > 0.6);
  const gesamtWert = gueltig ? 0.5 * d + 0.3 * gl + 0.2 * be : 0;
  const ziel = phasen.filter((q) => q.art === 'aus').reduce((s, p) => s + p.dauer, 0) / Math.max(1, phasen.filter((q) => q.art === 'aus').length);
  const lang = langen.length ? Math.max(...langen) : 0;
  let tipp;
  if (!gueltig) tipp = 'Ich habe kaum Zischen gehört – „sss“ etwas kräftiger und mit dem Mund zum Telefon (etwa 30 cm).';
  else if (d < 0.8) tipp = `Die Luft reichte ${komma(lang)} s von ${komma(ziel)} s – Flanken beim Ausatmen länger weit lassen und sparsamer beginnen.`;
  else if (gl < 0.7) tipp = 'Das Zischen schwankt in der Lautstärke – so gleichmäßig wie ein Reifen, der langsam Luft verliert.';
  else if (be < 0.7) tipp = 'Beginne das Zischen genau auf dem Klick – vorher in Ruhe einatmen.';
  else tipp = 'Ruhig und gleichmäßig – beim nächsten Mal das Ausatmen um 4 Zähler verlängern.';
  return {
    gesamt: prozent(gesamtWert), gueltig, atemUebung: true,
    teile: [
      { id: 'dauer', name: 'Luft gehalten', wert: gueltig ? d : 0, text: `Längstes gleichmäßiges Zischen ${komma(lang)} s (Ziel ${komma(ziel)} s)` },
      { id: 'gleich', name: 'Gleichmäßig', wert: gueltig ? gl : 0, text: 'Wie ruhig die Lautstärke des Zischens bleibt' },
      { id: 'beginn', name: 'Beginn auf dem Klick', wert: gueltig ? be : 0, text: 'Wie pünktlich das Ausatmen beginnt' },
    ],
    atem: { text: 'Atem gemessen am Zischen „sss“ (Dauer und Gleichmäßigkeit des Luftgeräuschs) – nicht an der Lunge selbst.' },
    tipp, je: [],
  };
}

/** Durchschnitt mehrerer Durchgänge (nur gültige); Teile werden gemittelt. */
export function gesamt(liste) {
  const g = (liste || []).filter((e) => e && e.gueltig);
  if (!g.length) return liste && liste.length ? { ...liste[liste.length - 1], gesamt: 0, gueltig: false } : null;
  const teile = g[0].teile.map((t) => {
    const w = g.map((e) => (e.teile.find((x) => x.id === t.id) || {}).wert).filter((x) => x != null);
    return { ...t, wert: w.length ? mittel(w) : null };
  });
  const letzte = g[g.length - 1];
  // Tipp: aus dem schwächsten Durchgang, damit er zur größten Baustelle passt
  const schwaechster = g.slice().sort((a, b) => a.gesamt - b.gesamt)[0];
  return { ...letzte, gesamt: Math.round(mittel(g.map((e) => e.gesamt))), teile, tipp: schwaechster.tipp, durchgaenge: g.map((e) => e.gesamt), atem: letzte.atem };
}
