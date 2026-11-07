import test from 'node:test';
import assert from 'node:assert/strict';
import { leereHistorie, eintragen, statistik, median, aufraeumen, pruefeHistorie, tiefstSeit } from '../history.mjs';
import { versandkosten, technikBewertung, altpreisAus, tiefstInfo } from '../deals.mjs';

const cfg = {
  deal: { rabattMin: 0.25, schaetzungMaxRabatt: 0.6, tiefstpreisMinPunkte: 10, tiefstpreisMinRabatt: 0.1, historieMinTage: 5, normalpreisFensterTage: 56, technikRabattMin: 0.6 },
  versand: { amazonPrime: false, amazonKostenlosAb: 39, amazonKosten: 3.99, standardKosten: 4.95 },
};
const T0 = Date.parse('2026-09-01T12:00:00Z');

test('Median', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), null);
});

test('Historie: Normalpreis = Median der letzten 8 Wochen, Tiefstpreis', () => {
  const h = leereHistorie();
  for (let d = 0; d < 70; d++) eintragen(h, 'g', '100g', { p: d < 14 ? 0.5 : 1.0, shop: 'A' }, T0 + d * 864e5);
  eintragen(h, 'g', '100g', { p: 0.9, shop: 'A' }, T0 + 69 * 864e5); // same day -> keeps the lower one
  const s = statistik(h, 'g', 56, T0 + 69 * 864e5);
  assert.equal(s.normal, 1.0);
  assert.equal(s.tiefst.p, 0.5);
  assert.equal(h.gruppen.g.punkte.length, 70);
  aufraeumen(h, 30, T0 + 69 * 864e5);
  assert.equal(h.gruppen.g.punkte.length, 31);
  assert.equal(h.gruppen.g.tiefst.p, 0.5, 'Tiefstpreis bleibt nach dem Aufräumen erhalten');
});

test('Ist das der Tiefstpreis? – ehrliche Antwort', () => {
  const kauf = { einheitspreis: 0.186, mengeSicher: true, online: false, shop: 'Kaufland' };
  const h = leereHistorie();
  eintragen(h, 'k', 'stueck', { p: 0.186, shop: 'Kaufland' }, T0);
  let st = statistik(h, 'k', 56, T0);
  const eins = tiefstInfo({ bestes: kauf, sichere: [kauf], stats: st, tiefst30: tiefstSeit(h, 'k', 30, T0), basis: 'stueck', cfg });
  assert.deepEqual(eins, { status: 'unbekannt', text: 'Einziges gefundenes Angebot in deiner Nähe · Verlauf erst seit 1 Tag', heuteGuenstigstes: true, tage: 1, tiefst30: 0.186, anzahl: 1, anzahlSicher: 1 });
  const zwei = { einheitspreis: 0.25, mengeSicher: true, online: true };
  assert.match(tiefstInfo({ bestes: kauf, sichere: [kauf, zwei, zwei], stats: st, tiefst30: null, basis: 'stueck', cfg }).text,
    /^Günstigstes von 3 gefundenen Angeboten in deiner Nähe und online · /);
  // eine Woche Verlauf, nie billiger -> ja
  for (let d = 1; d <= 6; d++) eintragen(h, 'k', 'stueck', { p: 0.3, shop: 'Netto' }, T0 - d * 864e5);
  st = statistik(h, 'k', 56, T0);
  const ja = tiefstInfo({ bestes: kauf, sichere: [kauf], stats: st, tiefst30: tiefstSeit(h, 'k', 30, T0), basis: 'stueck', cfg });
  assert.equal(ja.status, 'ja');
  assert.equal(ja.text, 'Einziges gefundenes Angebot in deiner Nähe · so günstig wie nie in 7 Tagen');
  // vor 3 Tagen gab es das schon billiger -> nein
  eintragen(h, 'k', 'stueck', { p: 0.15, shop: 'Lidl' }, T0 - 3 * 864e5);
  const nein = tiefstInfo({ bestes: kauf, sichere: [kauf], stats: statistik(h, 'k', 56, T0), tiefst30: tiefstSeit(h, 'k', 30, T0), basis: 'stueck', cfg });
  assert.equal(nein.status, 'nein');
  assert.equal(nein.text, 'Schon günstiger gesehen: 0,15 € pro Stück am 29.08. bei Lidl');
  // Menge unklar -> keine Aussage
  assert.equal(tiefstInfo({ bestes: { ...kauf, mengeSicher: false }, sichere: [], stats: st, tiefst30: null, basis: 'stueck', cfg }).status, 'unbekannt');
  assert.equal(tiefstInfo({ bestes: null, sichere: [], stats: st, tiefst30: null, basis: 'stueck', cfg }).text, 'Gerade kein Angebot');
});

test('Tiefstpreis: ein billigeres Angebot mit unklarer Packung zählt mit – nie „Einziges Angebot“ (echter Fall Ben & Jerry\'s)', () => {
  const J = Date.parse('2026-10-31T16:35:00Z');
  const lidl = { shop: 'Lidl', preis: 3.99, einheitspreis: 1.0, mengeSicher: true, online: false, gueltigAb: '2026-11-01T23:00:00Z' };
  const penny = { shop: 'PENNY', preis: 3.49, einheitspreis: 0.75, mengeSicher: false, online: false, nurMitApp: true, gueltigAb: '2026-11-01T23:00:00.000Z' };
  const st = { tage: 0 };
  const t = tiefstInfo({ bestes: lidl, sichere: [lidl], angebote: [lidl, penny], stats: st, tiefst30: null, basis: '100ml', cfg, jetztMs: J });
  assert.equal(t.status, 'unbekannt');
  assert.equal(t.text, 'PENNY hat 3,49 € (mit App, ab Mo 2.11.) – Packungsgröße dort nicht sicher');
  assert.equal(t.heuteGuenstigstes, false);
  assert.equal(t.anzahl, 2);
  assert.doesNotMatch(t.text, /Einziges/);
  // teurer und Packung unklar: kein „Einziges Angebot“, sondern „mit bekannter Packungsgröße“
  const teuer = { ...penny, preis: 4.49 };
  assert.equal(tiefstInfo({ bestes: lidl, sichere: [lidl], angebote: [lidl, teuer], stats: st, tiefst30: null, basis: '100ml', cfg, jetztMs: J }).text,
    'Einziges gefundenes Angebot mit bekannter Packungsgröße in deiner Nähe · noch kein Preisverlauf');
  // unplausible Treffer (eher ein anderes Produkt) zählen nicht
  assert.equal(tiefstInfo({ bestes: lidl, sichere: [lidl], angebote: [lidl, { ...penny, unsicher: true }], stats: st, tiefst30: null, basis: '100ml', cfg, jetztMs: J }).text,
    'Einziges gefundenes Angebot in deiner Nähe · noch kein Preisverlauf');
});

test('Alter Verlauf (Version 1, falsche Packungsgrößen) wird einmal verworfen', () => {
  const alt = { version: 1, gruppen: { 'knoppers-schnitte': { basis: 'stueck', punkte: [{ tag: '2026-10-31', p: 0.07, shop: 'Kaufland' }], tiefst: { p: 0.07 } } } };
  const r = pruefeHistorie(alt);
  assert.equal(r.neu, true);
  assert.deepEqual(r.historie, leereHistorie());
  const neu = leereHistorie();
  assert.equal(pruefeHistorie(neu).historie, neu);
  assert.equal(pruefeHistorie(null).neu, false);
});

test('Versandkosten', () => {
  assert.equal(versandkosten({ online: false, preis: 1 }, cfg), 0);
  assert.equal(versandkosten({ online: true, shop: 'Amazon', preis: 6.49, titel: 'Knoppers' }, cfg), 3.99);
  assert.equal(versandkosten({ online: true, shop: 'Amazon', preis: 45, titel: 'x' }, cfg), 0);
  assert.equal(versandkosten({ online: true, shop: 'Otto', preis: 5, titel: 'x versandkostenfrei' }, cfg), 0);
  assert.equal(versandkosten({ online: true, shop: 'Otto', preis: 5, titel: 'x' }, cfg), 4.95);
  assert.equal(versandkosten({ online: true, shop: 'Amazon', preis: 5, versand: 0, titel: 'x' }, cfg), 0);
});

test('Technik-Preisfehler', () => {
  const technik = { woerter: ['tv', 'ps5', 'playstation', 'kopfhoerer'] };
  assert.equal(altpreisAus('für 29,99 € statt 499 €', 29.99), 499);
  assert.equal(altpreisAus('Sim Only, sonst 5,95€ Versand', 0.99), null, '„sonst“ = Versand');
  assert.equal(altpreisAus('50% Rabatt statt 10%', 23.92), null, 'Prozent ist kein Preis');
  assert.equal(technikBewertung({ titel: 'Samsung QLED TV für 29,99 € statt 499 €', preis: 29.99 }, technik, cfg).deal, true);
  assert.equal(technikBewertung({ titel: 'Sony Kopfhörer für 249 €', beschreibung: 'UVP 419 €', preis: 249 }, technik, cfg), null);
  assert.equal(technikBewertung({ titel: 'PlayStation 5 für 44 €', preis: 44, preisfehlerFeed: true }, technik, cfg).deal, true);
  assert.equal(technikBewertung({ titel: 'Tchibo Kaffee statt 30 € nur 5 €', preis: 5 }, technik, cfg), null, 'keine Technik');
  assert.equal(technikBewertung({ titel: 'Tvorog Quark', preis: 1 }, technik, cfg), null, 'kurze Wörter nur als ganzes Wort');
});

test('Technik: Vergleichspreis von der Deal-Seite hat Vorrang, vorher/jetzt/Ersparnis als ganze Prozent', () => {
  const technik = { woerter: ['ps5', 'playstation'] };
  const e = { titel: 'PlayStation 5 für 44 € statt 499 €', preis: 44, preisfehlerFeed: true };
  const mitSeite = technikBewertung(e, technik, cfg, { preis: 44, vergleichspreis: 449 });
  assert.equal(mitSeite.preisVorher, 449);
  assert.equal(mitSeite.vorherQuelle, 'Vergleichspreis laut mydealz');
  assert.equal(mitSeite.ersparnisEuro, 405);
  assert.equal(mitSeite.ersparnisProzent, 90);
  assert.equal(mitSeite.grund, 'Preisfehler, 90 % unter Vergleichspreis');
  const ohne = technikBewertung(e, technik, cfg, { preis: 44, vergleichspreis: null });
  assert.equal(ohne.preisVorher, 499);
  assert.equal(ohne.vorherQuelle, 'statt-Preis laut Deal-Text');
  const rtx = technikBewertung({ titel: 'Zotac RTX 5070 Grafikkarte Preisfehler', preis: 165, preisfehlerFeed: true }, { woerter: ['grafikkarte'] }, cfg, { preis: 165 });
  assert.deepEqual([rtx.preisVorher, rtx.vorherQuelle, rtx.ersparnisEuro, rtx.ersparnisProzent, rtx.grund], [null, null, null, null, 'Preisfehler gemeldet']);
});
