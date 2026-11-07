// Nur KRASSE Preisfehler (Xander, 07.11.2026): „ein 4K-Fernseher für 35 €“ ja – „Switch-2-Spiel 49 → 39 €“ nein.
// Diese Datei gibt es zweimal, Wort für Wort gleich: schnaeppchen/scan/krass.mjs und vorteile/scan/lib/krass.mjs
// (jeder Wecker lädt nur seinen eigenen Ordner). Die Seite mein-vorteil/index.html hat dieselben Regeln eingebaut;
// mein-vorteil/test/regeln.test.mjs prüft, dass alle drei gleich entscheiden.
//
// Regeln (Grenzen in der config, sonst KRASS_STANDARD):
//  1. Spiele (Switch/Switch 2/PS5/Xbox/PC): nur praktisch geschenkt (≤ spielMaxEuro) oder ein wirklich spürbarer
//     Unterschied (≥ spielMinProzent UND ≥ spielMinErsparnisEuro gespart).
//  2. Vorher-Preis bekannt: ≥ minProzent unter dem Vorher-Preis UND ≥ minErsparnisEuro gespart,
//     oder absurd billig (≤ absurdMaxEuro, obwohl es sonst ≥ absurdMinVorher kostete).
//  3. Vorher-Preis unbekannt: nur teure Geräte (Fernseher, Laptop, Konsole …, kein Zubehör), deren Preis ≥ minProzent
//     unter dem, was so ein Gerät mindestens kostet („Fernseher ab ca. 200 €“ -> höchstens 50 €).
export const KRASS_STANDARD = Object.freeze({
  minProzent: 75, minErsparnisEuro: 20, absurdMaxEuro: 5, absurdMinVorher: 15,
  spielMaxEuro: 2, spielMinProzent: 85, spielMinErsparnisEuro: 40,
});

// Was so ein Gerät mindestens kostet (vorsichtig niedrig) – nur für Preisfehler ohne bekannten Vorher-Preis
export const GERAETE_AB = [
  [/\b(fernseher|smart[-\s]?tv|tv|oled[-\s]?tv|qled[-\s]?tv)\b/i, 'Fernseher', 200],
  [/\b(laptop|notebook|macbook|chromebook)\b/i, 'Laptops', 300],
  [/\b(playstation|ps5|xbox series|xbox|nintendo switch|switch 2|steam deck|konsole)\b/i, 'Konsolen', 250],
  [/\b(grafikkarte|rtx\s?\d{4}|radeon rx)\b/i, 'Grafikkarten', 250],
  [/\b(iphone|smartphone|galaxy s\d+|pixel \d+)\b/i, 'Smartphones', 200],
  [/\b(ipad|tablet)\b/i, 'Tablets', 150],
  [/\b(beamer|projektor)\b/i, 'Beamer', 150],
  [/\b(saugroboter|staubsauger[-\s]?roboter)\b/i, 'Saugroboter', 150],
  [/\b(synthesizer|synth|minilogue|microfreak|digitakt|keystep)\b/i, 'Synthesizer', 150],
  [/\b(monitor|bildschirm)\b/i, 'Monitore', 120],
  [/\b(smartwatch|apple watch)\b/i, 'Smartwatches', 120],
  [/\b(soundbar)\b/i, 'Soundbars', 100],
  [/\b(airpods)\b/i, 'AirPods', 100],
  [/\b(kopfhörer|kopfhoerer|headphones|earbuds|in-ears?)\b/i, 'Kopfhörer', 60],
];
// Zubehör kostet wenig – „iPhone-Hülle für 1 €“ ist kein Preisfehler
const ZUBEHOER = /\b(hülle|huelle|case|cover|schutzfolie|displayschutz|panzerglas|folie|kabel|adapter|halterung|wandhalterung|ladegerät|ladegeraet|ladekabel|netzteil|tasche|ständer|staender|fernbedienung|ersatz\w*|armband|skin|sticker|reiniger|stick|dongle)\b/i;
// Spiele: Spiel-Wort, Plattform in Klammern („(Switch 2)“, „[PS5]“) oder bekannte Reihe + Plattform – aber keine Konsole/kein Controller
const KEIN_SPIEL = /\b(konsole|console|controller|joy-?cons?|headset|ladestation|dock|speicherkarte|micro\s?sd|amiibo)\b/i;
const SPIEL_WORT = /\b(spiel|videospiel|game|games|dlc|season pass|switch 2 edition|deluxe edition|complete edition|goty)\b/i;
const PLATTFORM_KLAMMER = /[([]\s*(nintendo\s*)?(switch(\s*2)?|ps\s?[45]|playstation\s*[45]?|xbox[^)\]]{0,20}|pc)\s*[)\]]/i;
const PLATTFORM = /\b(nintendo\s*)?switch(\s*2)?\b|\bps\s?[45]\b|\bplaystation\b|\bxbox\b|\bsteam\b/i;
const REIHE = /\b(mario|zelda|pok[eé]mon|kirby|metroid|donkey kong|ea sports fc|fifa|call of duty|assassin'?s creed|hogwarts|minecraft|gta|grand theft auto|elden ring|final fantasy|resident evil|sonic|animal crossing|splatoon|smash bros)\b/i;

export function istSpiel(titel) {
  const t = String(titel || '');
  if (KEIN_SPIEL.test(t)) return false;
  return SPIEL_WORT.test(t) || PLATTFORM_KLAMMER.test(t) || (PLATTFORM.test(t) && REIHE.test(t));
}
export const istZubehoer = titel => ZUBEHOER.test(String(titel || ''));
export function geraetAb(titel) {
  const t = String(titel || '');
  if (istZubehoer(t) || istSpiel(t)) return null;
  for (const [re, name, ab] of GERAETE_AB) if (re.test(t)) return { name, ab };
  return null;
}
const euro = v => `${(Math.round(v * 100) / 100).toFixed(2).replace('.', ',').replace(/,00$/, '')} €`;

/**
 * Ist das ein krasser Preisfehler? e = { titel, preis, preisVorher } (Preise in €, inkl. Versand, wenn bekannt).
 * -> { ok: true, grund, normalAb? } oder { ok: false, grund }
 */
export function krass(e, regeln = {}) {
  const r = { ...KRASS_STANDARD, ...(regeln || {}) };
  const preis = typeof e?.preis === 'number' && Number.isFinite(e.preis) ? e.preis : null;
  if (preis == null || preis < 0) return { ok: false, grund: 'Preis unbekannt' };
  const vorher = typeof e.preisVorher === 'number' && e.preisVorher > preis ? e.preisVorher : null;
  const pz = vorher ? Math.round((1 - preis / vorher) * 100) : null;
  const spar = vorher ? Math.round((vorher - preis) * 100) / 100 : null;
  const titel = String(e.titel || '');
  if (istSpiel(titel)) {
    if (preis <= r.spielMaxEuro && (vorher == null || vorher >= 10)) return { ok: true, grund: `Spiel für ${euro(preis)} – praktisch geschenkt` };
    if (pz != null && pz >= r.spielMinProzent && spar >= r.spielMinErsparnisEuro) return { ok: true, grund: `Spiel ${pz} % unter dem Vorher-Preis` };
    return { ok: false, grund: 'Spiel – nicht krass genug' };
  }
  if (vorher != null) {
    if (pz >= r.minProzent && spar >= r.minErsparnisEuro) return { ok: true, grund: `${pz} % unter dem Vorher-Preis` };
    if (preis <= r.absurdMaxEuro && vorher >= r.absurdMinVorher) return { ok: true, grund: `nur ${euro(preis)} statt ${euro(vorher)}` };
    return { ok: false, grund: `nur ${pz} % / ${euro(spar)} unter dem Vorher-Preis` };
  }
  const g = geraetAb(titel);
  if (g && preis <= g.ab * (1 - r.minProzent / 100)) return { ok: true, grund: `${g.name} kosten sonst ab ca. ${euro(g.ab)}`, normalAb: g.ab };
  return { ok: false, grund: g ? `für ${g.name} nicht krass genug` : 'Vorher-Preis unbekannt' };
}
