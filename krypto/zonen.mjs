// Krypto-Rechnung und Zonen (Xander 07.11.2026) – für den Wecker (GitHub-Action) UND die Seite Mein Vorteil.
// Der Block zwischen „<krypto-zonen>“ und „</krypto-zonen>“ steht Wort für Wort auch in mein-vorteil/index.html
// (dort ohne „export “); mein-vorteil/test/regeln.test.mjs prüft, dass beide gleich sind.
//
// Datenschutz: Mengen, Einsätze und Kaufkurse stehen nur auf Xanders iPhone (localStorage) bzw. im GitHub-Secret KRYPTO.
// Gemerkt wird nur die Zone als Wort (tief/minus/plus/hoch/top) – nie eine Zahl.

// <krypto-zonen>
export const KRYPTO_COINS = Object.freeze({
  btc: { name: 'Bitcoin', kurz: 'BTC', zeichen: '₿', min: 1000, max: 1e7 },
  eth: { name: 'Ethereum', kurz: 'ETH', zeichen: 'Ξ', min: 10, max: 1e6 },
});
// Zonen nach Gewinn/Verlust in Prozent: tief ≤ −10 | minus < 0 | plus ≥ 0 | hoch ≥ +5 | top ≥ +10
export const ZONEN = ['tief', 'minus', 'plus', 'hoch', 'top'];
export const HYSTERESE = 0.5; // Prozentpunkte
// Gemeldet wird: Wechsel Gewinn ↔ Verlust, Erreichen von +5 %, +10 % und −10 %
export const MELDUNG = Object.freeze({ gewinn: 'jetzt im Gewinn', verlust: 'jetzt im Verlust', plus5: '+5 % erreicht', plus10: '+10 % erreicht', minus10: '−10 % erreicht' });
// Zonen-Grenzen: hoch über Grenze i (von Zone i nach i+1) ab AUF[i]; runter (von i+1 nach i) erst unter AB[i].
// Die Meldungs-Richtung löst genau an der Grenze aus, die Gegenrichtung erst 0,5 Punkte dahinter (macht wieder „scharf“);
// Gewinn ↔ Verlust in beide Richtungen erst 0,5 Punkte hinter der Null (kein Hin und Her bei ±0,1 %).
const GRENZEN = [
  { auf: -10 + HYSTERESE, ab: -10, aufMeldung: null, abMeldung: 'minus10', abBisGleich: true },
  { auf: HYSTERESE, ab: -HYSTERESE, aufMeldung: 'gewinn', abMeldung: 'verlust' },
  { auf: 5, ab: 5 - HYSTERESE, aufMeldung: 'plus5', abMeldung: null },
  { auf: 10, ab: 10 - HYSTERESE, aufMeldung: 'plus10', abMeldung: null },
];

// Rechen-Rauschen weg (0,02 × 45.000 ist im Rechner 900,0000000000001): auf Millionstel-Prozent runden
const glatt = p => Math.round(p * 1e6) / 1e6;

/** Zone ohne Vorgeschichte (erster Blick): reine Grenzen −10 / 0 / +5 / +10. */
export function rohZone(prozent) {
  if (!Number.isFinite(prozent)) return null;
  prozent = glatt(prozent);
  return prozent <= -10 ? 'tief' : prozent < 0 ? 'minus' : prozent < 5 ? 'plus' : prozent < 10 ? 'hoch' : 'top';
}

/**
 * Nächste Zone mit Hysterese. alt = zuletzt gemerkte Zone (oder nichts), prozent = Gewinn/Verlust in Prozent.
 * -> { zone, meldung } – meldung ist null oder ein Schlüssel von MELDUNG (bei einem Sprung über mehrere Grenzen die
 * äußerste, z. B. von minus direkt auf top -> plus10). Ohne gültige alte Zone: rohZone, keine Meldung.
 */
export function naechsteZone(alt, prozent) {
  if (!Number.isFinite(prozent)) return { zone: ZONEN.includes(alt) ? alt : null, meldung: null };
  let i = ZONEN.indexOf(alt);
  if (i < 0) return { zone: rohZone(prozent), meldung: null };
  prozent = glatt(prozent);
  let meldung = null;
  while (i < ZONEN.length - 1 && prozent >= GRENZEN[i].auf) { meldung = GRENZEN[i].aufMeldung || meldung; i++; }
  while (i > 0 && (GRENZEN[i - 1].abBisGleich ? prozent <= GRENZEN[i - 1].ab : prozent < GRENZEN[i - 1].ab)) { meldung = GRENZEN[i - 1].abMeldung || meldung; i--; }
  return { zone: ZONEN[i], meldung };
}

/**
 * Käufe -> Position. k = { kaeufe: [{ betrag (€ inkl. Gebühren), kurs (€ je Coin) ODER menge }], aktuell? (Menge jetzt,
 * z. B. durch Auto Earn gewachsen – überschreibt die Summe) }.
 * -> { einsatz, mengeKaeufe, menge, kaufkurs (Ø), schwelle (Kurs, ab dem im Plus), kaeufe: Anzahl } | null
 */
export function kryptoPosition(k) {
  let einsatz = 0, mengeKaeufe = 0, n = 0;
  for (const x of Array.isArray(k?.kaeufe) ? k.kaeufe : []) {
    const betrag = Number(x?.betrag);
    if (!(betrag > 0) || !Number.isFinite(betrag)) continue;
    const menge = Number(x.menge) > 0 ? Number(x.menge) : Number(x.kurs) > 0 ? betrag / Number(x.kurs) : NaN;
    if (!(menge > 0) || !Number.isFinite(menge)) continue;
    einsatz += betrag; mengeKaeufe += menge; n++;
  }
  if (!n) return null;
  const aktuell = Number(k.aktuell);
  const menge = aktuell > 0 && Number.isFinite(aktuell) ? aktuell : mengeKaeufe;
  return { einsatz, mengeKaeufe, menge, kaufkurs: einsatz / mengeKaeufe, schwelle: einsatz / menge, kaeufe: n };
}

/** Position + Kurs -> { kurs, wert, gv (€), prozent (z. B. 5.3 = +5,3 %), einsatz, menge, kaufkurs, schwelle } | null */
export function kryptoErgebnis(pos, kurs) {
  if (!pos || !(kurs > 0)) return null;
  const wert = pos.menge * kurs;
  return { kurs, wert, gv: wert - pos.einsatz, prozent: (wert / pos.einsatz - 1) * 100, einsatz: pos.einsatz, menge: pos.menge, kaufkurs: pos.kaufkurs, schwelle: pos.schwelle };
}

/**
 * Import-Text (Link-Fragment #krypto=… und GitHub-Secret KRYPTO): „btc:<menge>:<einsatz>,eth:<menge>:<einsatz>“,
 * Dezimalpunkt (0.0123), Einsatz in € inkl. Gebühren. -> { ok: true, coins: { btc: { menge, einsatz } } } | { ok: false, fehler }
 * Ein ungültiger Teil -> nichts übernehmen (kein halber Import).
 */
export function leseKryptoText(text) {
  let s = String(text ?? '').trim();
  try { s = decodeURIComponent(s); } catch {}
  s = s.replace(/^#?krypto=/i, '').trim();
  if (!s) return { ok: false, fehler: 'leer' };
  const coins = {};
  for (const teil of s.split(/[,;\s]+/).filter(Boolean)) {
    const m = teil.match(/^([a-z]{2,6}):(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/i);
    if (!m) return { ok: false, fehler: 'Format' };
    const c = m[1].toLowerCase(), menge = Number(m[2]), einsatz = Number(m[3]);
    if (!KRYPTO_COINS[c]) return { ok: false, fehler: 'unbekannter Coin' };
    if (!(menge > 0 && menge < 1e6 && einsatz > 0 && einsatz < 1e9)) return { ok: false, fehler: 'Zahl' };
    coins[c] = { menge, einsatz };
  }
  return Object.keys(coins).length ? { ok: true, coins } : { ok: false, fehler: 'leer' };
}
// </krypto-zonen>
