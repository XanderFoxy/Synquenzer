// Baut die Vertrags-Fixtures (test/fixtures/vertrag/) aus den echten Daten vom 31.10.2026 (v2) plus den Fällen,
// die es an diesem Tag nicht gab: laufender Preisfehler mit Vorher-Preis, einer ohne, abgelaufene Einträge,
// ein neuer Bereich „Prämien & Freunde werben“, Konzerte (TM_KEY fehlte) inkl. vergangener.
// Aufruf: npm run fixtures   (= node werkzeug/baue-vertrag.mjs; Zeitpunkt der Tests: 2026-10-31T16:35:00Z)
// Liegt absichtlich nicht unter test/: „node --test“ würde jede .mjs dort als Test ausführen (und vertrag/ neu schreiben).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = join(dirname(fileURLToPath(import.meta.url)), '..', 'test', 'fixtures');
const lies = n => JSON.parse(readFileSync(join(HIER, n), 'utf8'));
const schreibIn = ordner => (n, o) => { mkdirSync(join(HIER, ordner), { recursive: true }); writeFileSync(join(HIER, ordner, n), JSON.stringify(o, null, 1) + '\n'); };
const schreib = schreibIn('vertrag');

// --- Schnäppchen ---------------------------------------------------------------------------------------------------
const s = lies('echt-2026-10-31/v2/schnaeppchen-current.json');
s.technik = [
  { // Werte der echten Deal-Seite 2861129 (Lumaland, price 23.99, nextBestPrice 96.99) – hier als noch laufend
    typ: 'technik', id: 'technik-preisfehler', name: 'Technik-Preisfehler',
    titel: 'Möglicher Preisfehler: Lumaland Outdoor Pop-Up Pavillon 2,5 x 2,5 m in Schwarz & Grau',
    shop: 'Amazon', preis: 23.99, versand: 0,
    preisVorher: 96.99, vorherQuelle: 'Vergleichspreis laut mydealz', ersparnisEuro: 73, ersparnisProzent: 75,
    preisAlt: 96.99, ersparnis: 0.753, grund: 'Preisfehler, 75 % unter Vergleichspreis', preisfehler: true,
    link: 'https://www.mydealz.de/deals/test-lumaland-2861129', bild: '',
    // ohne Ende auf der Deal-Seite: gemeldet + 24 h (Schnäppchen-Wecker und Vorteils-Radar gleich)
    datum: '2026-10-31T15:50:00.000Z', bis: '2026-11-01T15:50:00.000Z', bisGeschaetzt: true, geprueft: '2026-10-31T16:30:00.000Z',
  },
  { // wie RTX 5070: kein Vorher-Preis bekannt
    typ: 'technik', id: 'technik-preisfehler', name: 'Technik-Preisfehler',
    titel: 'Zotac Gaming GeForce RTX 5070 Twin Edge OC Nvidia Grafikkarte 12GB Preisfehler',
    shop: 'MediaMarkt', preis: 165, versand: null,
    preisVorher: null, vorherQuelle: null, ersparnisEuro: null, ersparnisProzent: null,
    preisAlt: null, ersparnis: null, grund: 'Preisfehler gemeldet', preisfehler: true,
    link: 'https://www.mydealz.de/deals/test-rtx-5070-2852994', bild: '',
    datum: '2026-10-31T16:05:00.000Z', bis: '2026-11-01T16:05:00.000Z', bisGeschaetzt: true,
  },
  { // kein gemeldeter Preisfehler, aber ≥ 60 % unter „statt“-Preis; echtes Ende von der Deal-Seite (endDate)
    typ: 'technik', id: 'technik-preisfehler', name: 'Technik-Preisfehler',
    titel: 'Samsung 55" QLED TV GQ55Q60 für 199 € statt 499 €', shop: 'MediaMarkt', preis: 199, versand: 4.99,
    preisVorher: 499, vorherQuelle: 'statt-Preis laut Deal-Text', ersparnisEuro: 300, ersparnisProzent: 60,
    preisAlt: 499, ersparnis: 0.601, grund: '60 % unter Vergleichspreis', preisfehler: false,
    link: 'https://www.mydealz.de/deals/test-samsung-2500002', bild: '',
    datum: '2026-10-31T14:00:00.000Z', bis: '2026-10-31T20:00:00.000Z', bisGeschaetzt: false, geprueft: '2026-10-31T16:30:00.000Z',
  },
  { // abgelaufen (Deal-Seite: endDate vorbei) – darf nicht erscheinen
    typ: 'technik', id: 'technik-preisfehler', name: 'Technik-Preisfehler',
    titel: 'ABGELAUFEN Faltpavillon Preisfehler', shop: 'Amazon', preis: 15.95,
    preisVorher: 199.99, vorherQuelle: 'Vergleichspreis laut mydealz', ersparnisEuro: 184.04, ersparnisProzent: 92,
    grund: 'Preisfehler', link: 'https://www.mydealz.de/deals/test-faltpavillon-2861134',
    datum: '2026-10-31T11:34:13.000Z', bis: '2026-10-31T11:41:00.000Z',
  },
];
// Ein abgelaufenes Prospekt-Angebot zusätzlich (Ende gestern) – darf nicht erscheinen
const chips = s.produkte.find(p => p.id === 'crunchips');
chips.bestes = {
  shop: 'Netto Marken-Discount', titel: 'ABGELAUFEN Lorenz Crunchips', beschreibung: 'versch. Sorten, je 150 g', preis: 0.99, versand: 0,
  einheitspreis: 0.66, packung: '150 g', menge: { gramm: 150 }, mengeSicher: true, mengeQuelle: 'grundpreis', preisVorher: null,
  gueltigAb: '2026-10-25T23:00:00Z', gueltigBis: '2026-10-30T22:59:00Z', ab: '2026-10-25T23:00:00Z', bis: '2026-10-30T22:59:00Z',
  link: 'https://www.marktguru.de/offers/1', quelle: 'marktguru', online: false, deal: true, grund: '59 % unter Normalpreis', ersparnis: 0.59,
};
chips.deal = true; chips.ersparnis = 0.59;
// … und ein teureres, noch laufendes Angebot: nach dem Ende des besten zeigt die Karte dieses, ohne den alten Tiefstpreis-Satz
chips.weitere = [{
  shop: 'REWE', titel: 'Lorenz Crunchips', beschreibung: 'versch. Sorten, je 150 g', preis: 1.49, versand: 0,
  einheitspreis: 0.993, packung: '150 g', menge: { gramm: 150 }, mengeSicher: true, mengeQuelle: 'grundpreis', preisVorher: null,
  gueltigAb: '2026-10-25T23:00:00Z', gueltigBis: '2026-11-07T22:59:00Z', ab: '2026-10-25T23:00:00Z', bis: '2026-11-07T22:59:00Z',
  link: 'https://www.marktguru.de/offers/2', quelle: 'marktguru', online: false, deal: false, grund: '', ersparnis: 0.38,
}];
chips.tiefst = { status: 'unbekannt', text: 'Günstigstes von 2 Angeboten in deiner Nähe · Verlauf erst seit 1 Tag', heuteGuenstigstes: true, tage: 1, tiefst30: 0.66, anzahl: 2 };
schreib('schnaeppchen-current.json', s);

// --- Vorteile --------------------------------------------------------------------------------------------------------
const v = lies('echt-2026-10-31/v2/vorteile-aktuell.json');
v.namen = { ...v.namen, praemien: 'Prämien & Freunde werben' };
v.kategorien.praemien = [
  {
    id: 'praemie-test-1', kategorie: 'praemien', titel: 'Girokonto mit 75 € Startprämie (Test)', quelle: 'gepflegte Liste',
    link: 'https://example.com/praemie', zeile: '75 € Prämie · ca. 20 Min. · ≈ 225 € pro Stunde', soGehts: 'Konto eröffnen, 3 Monate Geldeingang.',
    wert: 80, sofort: false, grund: 'konto', datum: '2026-10-31T10:00:00.000Z', bis: null, bisQuelle: null, ab: null, sichtbarBis: '2026-11-14T10:00:00.000Z',
    preisfehler: false, extra: { art: 'konto', haken: ['Geldeingang 700 € pro Monat'], sortWert: 225 },
  },
  {
    id: 'praemie-test-2', kategorie: 'praemien', titel: 'Freunde werben: 20 € für beide (Test)', quelle: 'gepflegte Liste',
    link: 'https://example.com/werben', zeile: '20 € · ca. 5 Min.', soGehts: 'Link teilen.',
    wert: 60, sofort: false, grund: 'werben', datum: '2026-10-31T10:00:00.000Z', bis: null, sichtbarBis: '2026-11-14T10:00:00.000Z',
    preisfehler: false, extra: { art: 'werben', haken: [], sortWert: 240 },
  },
];
v.status.praemien = { ok: true, anzahl: 2, fehler: [], ms: 10, stand: v.aktualisiert };
// abgelaufener Reise-Eintrag (bis vorbei) und ein Preisfehler im Radar (gleicher Link wie im Schnäppchen-Wecker)
v.kategorien.reisen.push({
  id: 'reise-abgelaufen', kategorie: 'reisen', titel: 'ABGELAUFEN Flash Sale bis gestern', zeile: '19,99 €', soGehts: 'x', link: 'https://www.mydealz.de/deals/test-abgelaufen-1',
  quelle: 'mydealz Reisen', wert: 99, sofort: false, grund: 'Knaller', datum: '2026-10-29T10:00:00.000Z',
  bis: '2026-10-30T22:59:59.000Z', bisQuelle: 'text', ab: null, sichtbarBis: '2026-10-30T22:59:59.000Z', preisfehler: false,
});
v.kategorien.deals.push({
  id: 'pf-radar-lumaland', kategorie: 'deals', titel: 'Möglicher Preisfehler: Lumaland Outdoor Pop-Up Pavillon 2,5 x 2,5 m',
  zeile: 'vorher 96,99 € → jetzt 23,99 € (−75 %)', soGehts: 'Schnell bestellen, nur mit Käuferschutz.',
  link: 'https://www.mydealz.de/deals/test-lumaland-2861129', quelle: 'mydealz Preisfehler', wert: 95, sofort: true, grund: 'Preisfehler',
  datum: '2026-10-31T15:50:00.000Z', bis: null, bisQuelle: null, ab: null, sichtbarBis: '2026-11-01T15:50:00.000Z', preisfehler: true,
  preis: 23.99, preisVorher: 96.99, vorherQuelle: 'Vergleichspreis laut mydealz', ersparnisEuro: 73, ersparnisProzent: 75,
  extra: { shop: 'Amazon', versand: 0, temperatur: 250, geprueft: true },
});
v.kategorien.reisen.push({
  id: 'pf-radar-hotel', kategorie: 'reisen', titel: '[Preisfehler] Hotel Test – 1 Nacht', zeile: 'jetzt 15,00 € (Preis vorher unbekannt)',
  soGehts: 'x', link: 'https://www.mydealz.de/deals/test-hotel-1', quelle: 'mydealz Reisen', wert: 88, sofort: true, grund: 'Preisfehler',
  datum: '2026-10-31T09:00:00.000Z', bis: '2026-10-31T12:00:00.000Z', bisQuelle: 'deal-seite', sichtbarBis: '2026-10-31T12:00:00.000Z', preisfehler: true,
  preis: 15, preisVorher: null, vorherQuelle: null, ersparnisEuro: null, ersparnisProzent: null,
});
v.sofort = ['pf-radar-lumaland', 'pf-radar-hotel'];
schreib('vorteile-aktuell.json', v);

// --- Konzerte (Format laut konzerte/README.md, Ticketmaster-Felder) ----------------------------------------------------
const k = lies('echt-2026-10-31/v1/konzerte-konzerte.json');
k.konzerte = [
  {
    quelle: 'ticketmaster', band: 'Depeche Mode', titel: 'Depeche Mode – Memento Mori Tour', datum: '2026-11-20', zeit: '20:00',
    bis: '2026-11-20T22:59:00.000Z', ort: 'Quarterback Immobilien Arena', stadt: 'Leipzig', land: 'DE', km: 52,
    link: 'https://www.ticketmaster.de/event/test-1', festival: false, status: '', key: 'k|dm|2026-11-20', neu: true,
    vorverkauf: [{ art: 'presale', name: 'Magenta-Vorverkauf', ab: '2026-11-02T09:00:00.000Z', bis: '2026-11-04T09:00:00.000Z' }],
  },
  {
    quelle: 'ticketmaster', band: 'OMD', titel: 'OMD', datum: '2027-02-14', zeit: '19:30', bis: '2027-02-14T22:59:00.000Z',
    ort: 'Columbiahalle', stadt: 'Berlin', land: 'DE', km: 168, link: 'https://www.ticketmaster.de/event/test-2', festival: false, neu: false,
    vorverkauf: [],
  },
  {
    quelle: 'ticketmaster', band: 'Camouflage', titel: 'Camouflage', datum: '2027-03-06', zeit: '20:00', bis: '2027-03-06T22:59:00.000Z',
    ort: 'Stadthalle', stadt: 'Hamburg', land: 'DE', km: 372, link: 'https://www.ticketmaster.de/event/test-3', festival: false, neu: false,
  },
  {
    quelle: 'ticketmaster', band: 'ABGELAUFEN Erasure', titel: 'Erasure', datum: '2026-10-30', zeit: '20:00', bis: '2026-10-30T22:59:00.000Z',
    ort: 'Haus Auensee', stadt: 'Leipzig', land: 'DE', km: 55, link: 'https://www.ticketmaster.de/event/test-4', festival: false, neu: false,
  },
  {
    quelle: 'seite:alt', band: 'ABGELAUFEN Alte Daten', titel: 'ohne bis', datum: '2026-10-29', zeit: '',
    ort: 'Werk 2', stadt: 'Leipzig', km: 55, link: 'https://example.com/alt', festival: false, neu: false,
  },
];
schreib('konzerte-konzerte.json', k);
const st = lies('echt-2026-10-31/v1/konzerte-status.json');
st.quellen.ticketmaster = { ok: true, treffer: 4, fehler: [], uebersprungen: null, ms: 900 };
schreib('konzerte-status.json', st);
schreib('konzerte-releases.json', lies('echt-2026-10-31/v1/konzerte-releases.json'));

// --- vertrag-b: Sonderfälle aus der zweiten Prüfung -------------------------------------------------------------------
// Versand steckt im Preis (CAMELBAK), Technik-Deal mit echtem Ende NACH dem 24-h-Fenster, unplausibles Angebot als
// einziges übrig (Knoppers Minis nach Ende des Kaufland-Angebots)
const sb = JSON.parse(JSON.stringify(s));
sb.technik = [
  { // echte Werte CAMELBAK 2852900: price 6,98 = 0,99 + 5,99 Versand, nextBestPrice 11,99
    typ: 'technik', id: 'technik-preisfehler', name: 'Technik-Preisfehler', titel: '(Preisfehler) CAMELBAK Stash Belt für 0,99€ + VSK',
    shop: 'Talk-Point', preis: 6.98, versand: 0, versandInklusive: true,
    preisVorher: 11.99, vorherQuelle: 'Vergleichspreis laut mydealz', ersparnisEuro: 5.01, ersparnisProzent: 42, grund: 'Preisfehler', preisfehler: true,
    link: 'https://www.mydealz.de/deals/test-camelbak-2852900', datum: '2026-10-31T15:00:00.000Z', bis: '2026-11-01T15:00:00.000Z', bisGeschaetzt: true,
  },
  { // Technik-Deal, Deal-Seite nennt ein Ende in 3 Tagen – die Karte verschwindet trotzdem 24 h nach dem Melden
    typ: 'technik', id: 'technik-preisfehler', name: 'Technik-Preisfehler', titel: 'Sony WH-1000XM6 Kopfhörer für 129 € statt 399 €',
    shop: 'Otto', preis: 129, versand: null, preisVorher: 399, vorherQuelle: 'statt-Preis laut Deal-Text', ersparnisEuro: 270, ersparnisProzent: 68,
    grund: '68 % unter Vergleichspreis', preisfehler: false,
    link: 'https://www.mydealz.de/deals/test-sony-2500009', datum: '2026-10-31T10:00:00.000Z', bis: '2026-11-03T11:00:00.000Z', bisGeschaetzt: false,
  },
];
const kn = sb.produkte.find(p => p.id === 'knoppers-schnitte');
kn.weitere = [{
  shop: 'PENNY', titel: 'Knoppers Minis (anderes Produkt, unplausibel)', beschreibung: '200 g', preis: 1.99, versand: 0, einheitspreis: 0.05,
  packung: '40 × 5 g', menge: { gramm: 200, stueck: 40 }, mengeSicher: true, mengeQuelle: 'text', preisVorher: null,
  gueltigAb: '2026-10-25T23:00:00Z', gueltigBis: '2026-11-07T22:59:00Z', ab: '2026-10-25T23:00:00Z', bis: '2026-11-07T22:59:00Z',
  link: 'https://www.marktguru.de/offers/9', quelle: 'marktguru', online: false, deal: false, grund: '', ersparnis: null, unsicher: true,
}];
// Daten wie vom Lauf vor der Korrektur: „Einziges Angebot“, obwohl PENNY (Packung unklar) billiger ist -> die Seite
// widerspricht nicht sich selbst, sondern nennt das billigere Angebot
const bjB = sb.produkte.find(p => p.id === 'ben-jerrys');
bjB.tiefst = { status: 'unbekannt', text: 'Einziges Angebot in deiner Nähe · noch kein Preisverlauf', heuteGuenstigstes: true, tage: 0, tiefst30: null, anzahl: 1 };
const sbB = schreibIn('vertrag-b');
sbB('schnaeppchen-current.json', sb);
for (const n of ['vorteile-aktuell.json', 'konzerte-konzerte.json', 'konzerte-status.json', 'konzerte-releases.json']) sbB(n, JSON.parse(readFileSync(join(HIER, 'vertrag', n), 'utf8')));
console.log('vertrag/ und vertrag-b/ geschrieben');
