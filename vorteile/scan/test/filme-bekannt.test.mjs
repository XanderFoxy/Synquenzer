// Filter „Nur bekannte“ (Xander 16.11.2026: „Filter, um Indie-Produktionen auszublenden – nur bekannte große Produktionen/
// Kinohits“): Schwellen von grossGrund an echten Wikidata-Antworten aus dem Roh-Lauf 43820663637 (16.11.2026, Filme für 3,99 €).
// Die Zeilen unten sind wörtlich aus diesen Antworten (Einspielergebnis, Produktionsfirma P272, Verleih P750, Auszeichnungen);
// l = Wikipedia-Sprachen, j = Filmjahr aus dem Qualitäts-Schritt desselben Laufs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leseDetails, detailKurz, grossGrund, detailAbfrage, teuerung, DETAIL_V, GROSSE_STUDIOS, KEIN_GROSSES_STUDIO } from '../module/filme.mjs';

const ZEILEN = [
  // Shrek (2001) – Kinohit
  ['Q483815', 'b', '268163011'], ['Q483815', 'b', '488351320'], ['Q483815', 'a', 'Academy Award for Best Animated Feature'],
  ['Q483815', 's', 'DreamWorks'], ['Q483815', 's', 'DreamWorks Animation'], ['Q483815', 'v', 'UIP-Dunafilm'],
  // Hundstage (1975) – 50 Mio. $ von 1975, heute weit über 50 Mio.
  ['Q458656', 'b', '50000000'], ['Q458656', 'v', 'Warner Bros. Entertainment'], ['Q458656', 'a', 'Academy Award for Best Writing, Original Screenplay'],
  // Charade (1963) – 13,5 Mio. $ von 1963; Produktion „Stanley Donen Films“, Verleih Universal
  ['Q496266', 'b', '13474588'], ['Q496266', 's', 'Stanley Donen Films'], ['Q496266', 'v', 'Universal Pictures'], ['Q496266', 'v', 'Netflix'],
  // Drei Farben: Rot (1994) – Arthouse, Verleih Miramax/Netflix
  ['Q952142', 'b', '3600996'], ['Q952142', 's', 'France 3'], ['Q952142', 's', 'Canal+'], ['Q952142', 'v', 'Miramax'], ['Q952142', 'v', 'Netflix'],
  // Die Nächte der Cabiria (1957) – Arthouse, nur Verleih Paramount, Oscar „International Feature“
  ['Q18405', 'v', 'Paramount Pictures'], ['Q18405', 'v', 'Netflix'], ['Q18405', 'a', 'Academy Award for Best International Feature Film'],
  // Der diskrete Charme der Bourgeoisie (1972) – Verleih 20th Century Studios, Oscar „International Feature“
  ['Q308920', 'v', '20th Century Studios'], ['Q308920', 'a', 'Academy Award for Best International Feature Film'],
  // Die 42. Straße (1933) – Warner-Produktion
  ['Q44662', 's', 'Warner Bros. Entertainment'], ['Q44662', 'v', 'Warner Bros. Entertainment'], ['Q44662', 'v', 'Netflix'],
  // Down by Law (1986) – Indie, Verleih Universal
  ['Q192409', 'b', '1529199'], ['Q192409', 's', 'PolyGram Filmed Entertainment'], ['Q192409', 'v', 'Universal Pictures'],
  // Antigone (2019) – kanadischer Festivalfilm
  ['Q68025431', 's', 'Association coopérative de productions audio-visuelles'], ['Q68025431', 'v', 'Maison 4:3'],
  ['Q68025431', 'a', 'Toronto International Film Festival Award for Best Canadian Film'],
];
const BEKANNT = { Q483815: [112, 2001], Q458656: [55, 1975], Q496266: [51, 1963], Q952142: [42, 1994], Q18405: [49, 1957], Q308920: [51, 1972], Q44662: [33, 1933], Q192409: [40, 1986], Q68025431: [8, 2019] };
const antwort = JSON.stringify({ results: { bindings: [
  ...ZEILEN.map(([q, art, wert]) => ({ item: { value: `http://www.wikidata.org/entity/${q}` }, art: { value: art }, wert: { value: wert } })),
  { item: { value: 'http://www.wikidata.org/entity/Q483815' }, art: { value: 'c' }, wert: { value: 'Mike Myers' }, n: { value: '70' } },
  { item: { value: 'http://www.wikidata.org/entity/Q483815' }, art: { value: 'c' }, wert: { value: 'Eddie Murphy' }, n: { value: '80' } },
] } });

test('Nur bekannte: echte Wikidata-Antworten – Kinohits und große Studio-Produktionen ja, Arthouse und Festivalfilme nein', () => {
  const roh = leseDetails(antwort);
  const grund = q => grossGrund(BEKANNT[q][0], detailKurz(roh.get(q), '2026-11-16'), BEKANNT[q][1]);
  assert.equal(grund('Q483815'), 'kinohit', 'Shrek');
  assert.equal(grund('Q458656'), 'kinohit', 'Hundstage (50 Mio. $ von 1975)');
  assert.equal(grund('Q496266'), 'kinohit', 'Charade: 13,5 Mio. $ von 1963 sind heute über 100 Mio.');
  assert.equal(grund('Q44662'), 'studio', 'Die 42. Straße (Warner-Produktion, 33 Sprachen)');
  assert.equal(grund('Q952142'), null, 'Drei Farben: Rot – 3,6 Mio., Verleih Miramax zählt nicht');
  assert.equal(grund('Q18405'), null, 'Die Nächte der Cabiria – nur Verleih Paramount, Oscar „International“ zählt nicht');
  assert.equal(grund('Q308920'), null, 'Der diskrete Charme – Verleih 20th Century Studios zählt nicht');
  assert.equal(grund('Q192409'), null, 'Down by Law – 1,5 Mio.');
  assert.equal(grund('Q68025431'), null, 'Antigone – Festivalfilm, 8 Sprachen');
  // Besetzung: bekannteste zuerst (Wikipedia-Sprachen), Studio: das große zuerst, sonst die erste Produktionsfirma
  const s = detailKurz(roh.get('Q483815'), 't');
  assert.deepEqual(s.c, ['Eddie Murphy', 'Mike Myers']);
  assert.equal(s.st, 'DreamWorks'); assert.equal(s.gs, 1); assert.equal(s.b, 488); assert.equal(s.o, 1); assert.equal(s.v, DETAIL_V);
  assert.equal(detailKurz(roh.get('Q18405'), 't').st, null, 'ohne Produktionsfirma kein Studio – der Verleih (Paramount, Netflix) ist keins');
  assert.equal(detailKurz(roh.get('Q18405'), 't').o, 0);
});

test('Schwellen: weltbekannt ab 60 Sprachen, Oscar nur mit 45 Sprachen, ohne Wikidata nie „bekannt“', () => {
  const leer = { b: null, o: 0, gs: 0 };
  assert.equal(grossGrund(60, leer, 1990), 'weltbekannt');
  assert.equal(grossGrund(59, leer, 1990), null);
  assert.equal(grossGrund(45, { ...leer, o: 1 }, 1990), 'oscar');
  assert.equal(grossGrund(44, { ...leer, o: 1 }, 1990), null);
  assert.equal(grossGrund(20, { ...leer, gs: 1 }, 1990), 'studio');
  assert.equal(grossGrund(19, { ...leer, gs: 1 }, 1990), null, 'Video-Ableger eines großen Studios');
  assert.equal(grossGrund(-1, { ...leer, b: 900 }, 2010), null, 'ohne Wikidata-Treffer');
  assert.equal(grossGrund(null, null, 2010), null);
  assert.equal(grossGrund(10, { ...leer, b: 50 }, 2025), 'kinohit');
  assert.equal(grossGrund(10, { ...leer, b: 49 }, 2025), null);
  // Teuerung: grob 3,7 % im Jahr, gedeckelt; ohne Jahr keine
  assert.ok(teuerung(1963) > 8 && teuerung(1963) < 11);
  assert.equal(teuerung(1900), 1); assert.equal(teuerung(undefined), 1); assert.equal(teuerung(2026), 1);
  assert.equal(teuerung(1920), 15);
});

test('Studios: Produktionsfirmen der Majors ja, Arthouse-Labels, Fernsehen und Streaming nein', () => {
  const gross = x => GROSSE_STUDIOS.test(x) && !KEIN_GROSSES_STUDIO.test(x);
  for (const x of ['Warner Bros. Entertainment', 'Universal Pictures', 'DreamWorks Animation', 'Metro-Goldwyn-Mayer', 'Columbia Pictures', 'Lucasfilm', 'Paramount Pictures', 'Constantin Film', 'Walt Disney Pictures', '20th Century Studios'])
    assert.ok(gross(x), x);
  for (const x of ['Sony Pictures Classics', 'Paramount Vantage', 'Focus Features', 'Searchlight Pictures', 'Disney+', 'Warner Bros. Television', 'Universal Pictures Home Entertainment', 'Netflix', 'France 3', 'Miramax', 'StudioCanal', 'Stanley Donen Films'])
    assert.ok(!gross(x), x);
});

test('Abfrage: Einspielergebnis nur in US-Dollar oder Euro, Besetzung mit Sprechern, kurze URL', () => {
  const a = detailAbfrage(['Q483815', 'Q458656', 'kaputt', 'Q483815']);
  assert.match(a, /p:P2142\/psv:P2142/);
  assert.match(a, /FILTER\(\?bu IN \(wd:Q4917, wd:Q4916\)\)/);
  assert.match(a, /wdt:P161\|wdt:P725/);
  assert.equal((a.match(/wd:Q483815/g) || []).length, 1);
  assert.ok(!a.includes('kaputt'));
});
