// Entweder – oder (Modul „spiel“) – Daten: Aussagen, Paare, Prüf-Fragen, Level. Kein DOM, kein Import → auch in Node testbar.
// Aussagen: IPIP-NEO-120 (Johnson 2014, gemeinfrei, ipip.ori.org), dieselbe eigene deutsche Übersetzung wie im Modul bigfive
// (vorläufig). nr = Platz im IPIP-NEO-120. b = Bereich der App, k = +1: die Aussage spricht für „mehr“ vom Bereich, −1: dagegen.
// Bei „stabilitaet“ sprechen IPIP-Neurotizismus-Aussagen GEGEN den Bereich (k = −1).
// Zwangswahl-Paare (forced choice, Blockgröße 2) nach dem Thurstone-Modell (Brown & Maydeu-Olivares 2011): 30 Paare, jedes
// Bereichs-Paar 3-mal, 12 Aussagen je Bereich, 11 Paare gleich gepolt (+/+), 4 Paare gleich gepolt (−/−), 15 Paare gemischt
// (+/−) – die gemischten machen die Lage auf der Skala schätzbar, nicht nur die Rangfolge.
// Interessen-Duell: Tätigkeiten aus den IIP RIASEC Markers (Armstrong, Allison & Rounds 2008, aus dem O*NET Interest Profiler;
// Hinweis zur O*NET-Lizenz in module/interessen/quellen.js „onet“), dieselbe Übersetzung wie im Modul interessen.

export const FASSUNG = 'eo-1';

export const BEREICHE = [
  { id: 'offenheit', name: 'Offenheit', links: 'mag Vertrautes', rechts: 'sucht Neues', mehr: 'offen für Neues', weniger: 'lieber beim Vertrauten' },
  { id: 'gewissenhaftigkeit', name: 'Gewissenhaftigkeit', links: 'spontan, locker', rechts: 'geplant, gründlich', mehr: 'geplant und gründlich', weniger: 'spontan und locker' },
  { id: 'extraversion', name: 'Extraversion', links: 'eher ruhig, für sich', rechts: 'gesellig, aktiv', mehr: 'gesellig und aktiv', weniger: 'eher ruhig und für dich' },
  { id: 'vertraeglichkeit', name: 'Verträglichkeit', links: 'direkt, kritisch', rechts: 'rücksichtsvoll, mitfühlend', mehr: 'rücksichtsvoll und mitfühlend', weniger: 'direkt und kritisch' },
  { id: 'stabilitaet', name: 'Emotionale Stabilität', links: 'spürt Stress stärker', rechts: 'gelassen', mehr: 'gelassen', weniger: 'spürst Stress eher stärker' }
];
export const BEREICH = Object.fromEntries(BEREICHE.map((b, i) => [b.id, { ...b, i }]));

const A = (nr, b, k, t) => ({ nr, b, k, t });
export const AUSSAGEN = {
  // Extraversion
  e1: A(2, 'extraversion', 1, 'Ich finde leicht Freunde.'),
  e2: A(32, 'extraversion', 1, 'Unter Menschen fühle ich mich wohl.'),
  e3: A(7, 'extraversion', 1, 'Ich liebe große Feiern.'),
  e4: A(37, 'extraversion', 1, 'Auf Feiern rede ich mit vielen verschiedenen Leuten.'),
  e5: A(12, 'extraversion', 1, 'Ich übernehme die Führung.'),
  e6: A(77, 'extraversion', 1, 'In meiner Freizeit unternehme ich viel.'),
  e7: A(22, 'extraversion', 1, 'Ich liebe es, wenn es aufregend wird.'),
  e8: A(57, 'extraversion', 1, 'Ich habe viel Spaß.'),
  e9: A(67, 'extraversion', -1, 'Ich bin lieber allein.'),
  e10: A(97, 'extraversion', -1, 'Ich meide Menschenmengen.'),
  e11: A(107, 'extraversion', -1, 'Ich lasse es gern ruhig angehen.'),
  e12: A(102, 'extraversion', -1, 'Ich warte, bis andere vorangehen.'),
  // Offenheit
  o1: A(3, 'offenheit', 1, 'Ich habe eine lebhafte Fantasie.'),
  o2: A(8, 'offenheit', 1, 'Ich finde Kunst wichtig.'),
  o3: A(38, 'offenheit', 1, 'Ich sehe Schönheit in Dingen, die anderen vielleicht nicht auffallen.'),
  o4: A(18, 'offenheit', 1, 'Ich mag Abwechslung lieber als Routine.'),
  o5: A(23, 'offenheit', 1, 'Ich lese gern anspruchsvolle Texte.'),
  o6: A(63, 'offenheit', 1, 'Ich träume gern vor mich hin.'),
  o7: A(13, 'offenheit', 1, 'Ich erlebe meine Gefühle sehr stark.'),
  o8: A(33, 'offenheit', 1, 'Ich lasse meine Fantasie gern wild schweifen.'),
  o9: A(48, 'offenheit', -1, 'Ich bleibe lieber bei dem, was ich kenne.'),
  o10: A(78, 'offenheit', -1, 'Ich mag keine Veränderungen.'),
  o11: A(113, 'offenheit', -1, 'Theoretische Diskussionen interessieren mich nicht.'),
  o12: A(68, 'offenheit', -1, 'Ich mag keine Gedichte.'),
  // Gewissenhaftigkeit
  c1: A(10, 'gewissenhaftigkeit', 1, 'Ich räume gern auf.'),
  c2: A(20, 'gewissenhaftigkeit', 1, 'Ich arbeite hart.'),
  c3: A(25, 'gewissenhaftigkeit', 1, 'Ich bin immer vorbereitet.'),
  c4: A(55, 'gewissenhaftigkeit', 1, 'Ich setze meine Pläne um.'),
  c5: A(5, 'gewissenhaftigkeit', 1, 'Ich erledige Aufgaben erfolgreich.'),
  c6: A(50, 'gewissenhaftigkeit', 1, 'Ich mache mehr, als von mir erwartet wird.'),
  c7: A(95, 'gewissenhaftigkeit', 1, 'Ich weiß, wie ich Dinge geregelt bekomme.'),
  c8: A(15, 'gewissenhaftigkeit', 1, 'Ich halte meine Versprechen.'),
  c9: A(100, 'gewissenhaftigkeit', -1, 'Ich lasse meine Sachen herumliegen.'),
  c10: A(40, 'gewissenhaftigkeit', -1, 'Ich vergesse oft, Dinge wieder an ihren Platz zu legen.'),
  c11: A(115, 'gewissenhaftigkeit', -1, 'Es fällt mir schwer, mit Aufgaben anzufangen.'),
  c12: A(30, 'gewissenhaftigkeit', -1, 'Ich stürze mich in Dinge, ohne nachzudenken.'),
  // Verträglichkeit
  a1: A(4, 'vertraeglichkeit', 1, 'Ich vertraue anderen.'),
  a2: A(34, 'vertraeglichkeit', 1, 'Ich glaube, dass andere es gut meinen.'),
  a3: A(14, 'vertraeglichkeit', 1, 'Ich helfe anderen sehr gern.'),
  a4: A(44, 'vertraeglichkeit', 1, 'Andere Menschen liegen mir am Herzen.'),
  a5: A(59, 'vertraeglichkeit', 1, 'Ich fühle mit Menschen, denen es schlechter geht als mir.'),
  a6: A(64, 'vertraeglichkeit', 1, 'Ich glaube, was Leute mir sagen.'),
  a7: A(29, 'vertraeglichkeit', 1, 'Ich habe Mitgefühl mit obdachlosen Menschen.'),
  a8: A(19, 'vertraeglichkeit', -1, 'Ich streite mich gern so richtig.'),
  a9: A(54, 'vertraeglichkeit', -1, 'Ich halte viel von mir.'),
  a10: A(94, 'vertraeglichkeit', -1, 'Ich misstraue Menschen.'),
  a11: A(84, 'vertraeglichkeit', -1, 'Ich habe eine hohe Meinung von mir.'),
  a12: A(24, 'vertraeglichkeit', -1, 'Ich glaube, dass ich besser bin als andere.'),
  // Emotionale Stabilität (IPIP-Neurotizismus umgepolt)
  s1: A(96, 'stabilitaet', 1, 'Ich lasse mich nicht leicht ärgern.'),
  s2: A(116, 'stabilitaet', 1, 'Unter Druck bleibe ich ruhig.'),
  s3: A(106, 'stabilitaet', 1, 'Schwierige Situationen mit anderen Menschen machen mir nichts aus.'),
  s4: A(81, 'stabilitaet', 1, 'Ich kann Versuchungen leicht widerstehen.'),
  s5: A(111, 'stabilitaet', 1, 'Wenn ich große Lust auf etwas habe, kann ich mich gut beherrschen.'),
  s6: A(101, 'stabilitaet', 1, 'Ich fühle mich wohl mit mir selbst.'),
  s7: A(1, 'stabilitaet', -1, 'Ich mache mir über vieles Sorgen.'),
  s8: A(91, 'stabilitaet', -1, 'Ich bin schnell gestresst.'),
  s9: A(6, 'stabilitaet', -1, 'Ich werde schnell wütend.'),
  s10: A(36, 'stabilitaet', -1, 'Ich bin schnell genervt.'),
  s11: A(16, 'stabilitaet', -1, 'Es fällt mir schwer, auf andere zuzugehen.'),
  s12: A(31, 'stabilitaet', -1, 'Ich rechne mit dem Schlimmsten.')
};

// 30 Haupt-Paare (werden gewertet). Reihenfolge = Reihenfolge im Spiel (Bereiche wechseln sich ab).
const P = (id, a, b) => ({ id, a, b });
export const PAARE = [
  P('p01', 'e5', 'c7'), P('p02', 'o9', 'e7'), P('p03', 'a10', 's3'), P('p04', 'c10', 'o1'), P('p05', 'e1', 'a1'),
  P('p06', 's8', 'e6'), P('p07', 'o4', 'a2'), P('p08', 'c12', 's2'), P('p09', 'e12', 'a6'), P('p10', 'o3', 's4'),
  P('p11', 'a11', 'c3'), P('p12', 'e9', 'o6'), P('p13', 's7', 'a4'), P('p14', 'o11', 'c1'), P('p15', 'e2', 's1'),
  P('p16', 'c5', 'a3'), P('p17', 'e10', 'o10'), P('p18', 's11', 'o2'), P('p19', 'e11', 'c2'), P('p20', 'a12', 'o5'),
  P('p21', 'c9', 's10'), P('p22', 'e4', 'c6'), P('p23', 'o7', 'a7'), P('p24', 's12', 'c4'), P('p25', 'a9', 'e3'),
  P('p26', 'o12', 'c11'), P('p27', 'e8', 's6'), P('p28', 'c8', 'a5'), P('p29', 'a8', 's9'), P('p30', 'o8', 's5')
];
export const PAAR = Object.fromEntries(PAARE.map((p) => [p.id, p]));

// Wiederholungen: dasselbe Paar später noch einmal, Seiten getauscht (nicht gewertet, nur für die Beständigkeit).
export const WIEDER = [{ id: 'w1', von: 'p03' }, { id: 'w2', von: 'p07' }, { id: 'w3', von: 'p12' }, { id: 'w4', von: 'p20' }];

// Ketten: drei Aussagen, jede gegen jede (A–B, B–C, C–A), über das Spiel verteilt. Wer A vor B und B vor C nimmt, „sollte“ auch
// A vor C nehmen (Transitivität). Ein Kreis (A>B, B>C, C>A) heißt: hier war es knapp oder egal (Kendall & Babington Smith 1940).
// Nicht gewertet, aber: Das Profil aus den 30 Haupt-Paaren sagt diese Wahlen vorher (Vorhersage-Treffer).
export const KETTEN = [
  { id: 'k1', aus: ['o4', 'c1', 'e3'] },
  { id: 'k2', aus: ['a3', 's2', 'o1'] }
];
export const KETTEN_PAARE = KETTEN.flatMap((k) => [[0, 1], [1, 2], [2, 0]].map(([x, y], j) => ({ id: `${k.id}${'abc'[j]}`, kette: k.id, a: k.aus[x], b: k.aus[y] })));

// Kontrollfragen (Meade & Craig 2012): eine Anweisung und zwei „unmögliche“ Aussagen. Aufmerksame wählen fast immer gleich.
export const KONTROLLE = [
  { id: 'x1', art: 'anweisung', frage: 'Kontrolle: Tippe auf „Banane“.', a: 'Apfel', b: 'Banane', richtig: 'b' },
  { id: 'x2', art: 'unsinn', frage: 'Was passt eher zu dir?', a: 'Ich war schon einmal auf dem Mond.', b: 'Ich habe schon einmal Wasser getrunken.', richtig: 'b' },
  { id: 'x3', art: 'unsinn', frage: 'Was passt eher zu dir?', a: 'Ich habe schon einmal ein Fenster geöffnet.', b: 'Ich kann mit Fischen telefonieren.', richtig: 'a' }
];

// Leichte Fragen vor einer Falle (bauen Schwung auf). seite: feste Seite von Antwort a (sonst zufällig) – so steht die richtige
// Antwort der leichten Fragen immer links, die schnelle Antwort der Falle auch.
// Kopfnüsse: richtig ist die bedachte Antwort, intuitiv die schnelle, falsche. Danach kommt sofort die Auflösung.
// beleg: Marke der Auflösung (Standard 'belegt'). n4 ist ein bekanntes Rätsel (Bahnung/Priming), keine eigene Studie → 'abgeleitet'.
// n5 („Moses-Täuschung“): Der zweite Knopf verrät den Fehler nicht, er sagt nur „Da stimmt was nicht“ – wie die Antwort
// „kann man nicht beantworten“ bei Speckmann & Unkelbach (2021), wo die Täuschung trotzdem auftrat.
export const LEICHT = [
  { id: 'm1', frage: 'Was ist weiß?', a: 'Milch', b: 'Kohle', richtig: 'a', seite: 'l', vor: 'n4' },
  { id: 'm2', frage: 'Was kommt in den Milchkaffee?', a: 'Milch', b: 'Senf', richtig: 'a', seite: 'l', vor: 'n4' },
  { id: 'm3', frage: 'Was gibt die Kuh?', a: 'Milch', b: 'Saft', richtig: 'a', seite: 'l', vor: 'n4' },
  { id: 'm4', frage: 'Welche Farbe hat das Fell von Eisbären?', a: 'Weiß', b: 'Grün', richtig: 'a', seite: 'l', vor: 'n5' },
  { id: 'm5', frage: 'Wo ist es kälter?', a: 'Am Nordpol', b: 'Auf Mallorca', richtig: 'a', seite: 'l', vor: 'n5' }
];
export const KOPF = [
  { id: 'n1', art: 'reflexion', frage: 'Du läufst ein Rennen und überholst die Person auf Platz 2. Auf welchem Platz bist du jetzt?', a: 'Platz 1', b: 'Platz 2', richtig: 'b',
    aufloesung: 'Platz 2: Du hast den Platz der Person übernommen, die du überholt hast. Platz 1 ist noch vor dir.', quellen: ['thomson2016'] },
  { id: 'n2', art: 'reflexion', frage: 'Ein Bauer hat 15 Schafe. Alle bis auf 8 laufen weg. Wie viele bleiben ihm?', a: '7', b: '8', richtig: 'b',
    aufloesung: '8: „Alle bis auf 8“ heißt, 8 bleiben. Die 7 entsteht, wenn man schnell 15 − 8 rechnet.', quellen: ['thomson2016'] },
  { id: 'n3', art: 'reflexion', frage: 'Seerosen auf einem Teich verdoppeln jeden Tag ihre Fläche. Nach 40 Tagen ist der Teich ganz bedeckt. Nach wie vielen Tagen war er halb bedeckt?', a: 'Nach 20 Tagen', b: 'Nach 39 Tagen', richtig: 'b',
    aufloesung: 'Nach 39 Tagen: Am letzten Tag verdoppelt sich die Fläche noch einmal – von halb auf ganz.', quellen: ['frederick2005'] },
  { id: 'n4', art: 'schwung', frage: 'Was trinkt die Kuh?', a: 'Milch', b: 'Wasser', richtig: 'b', seite: 'l',
    aufloesung: 'Wasser! Milch gibt die Kuh – trinken tut sie Wasser (nur Kälber trinken Milch). Nach drei Mal „Milch“ liegt das Wort schon bereit und rutscht leicht heraus.', quellen: ['meyer1971'], beleg: 'abgeleitet' },
  { id: 'n5', art: 'taeuschung', frage: 'Wie heißt der Kontinent am Südpol, auf dem die Eisbären leben?', a: 'Antarktis', b: 'Da stimmt was nicht', richtig: 'b', seite: 'l',
    aufloesung: 'Da stimmt was nicht: Eisbären leben nur im hohen Norden, rund um den Nordpol – am Südpol gibt es keine. Die Frage klingt so vertraut, dass der Fehler leicht durchrutscht, wie bei der berühmten „Moses-Täuschung“.', quellen: ['erickson1981', 'speckmann2021'] }
];

// Interessen-Duell (Bonus): 15 Paare, jede Kombination der sechs Bereiche genau einmal, jeder Bereich 5-mal.
export const TYPEN = {
  R: { name: 'Praktisch-technisch', kurz: 'mit Händen, Werkzeug und Technik' },
  I: { name: 'Forschend', kurz: 'verstehen und untersuchen' },
  A: { name: 'Künstlerisch-gestaltend', kurz: 'Eigenes erschaffen' },
  S: { name: 'Sozial', kurz: 'helfen, beraten, beibringen' },
  E: { name: 'Unternehmerisch', kurz: 'anstoßen, leiten, verkaufen' },
  C: { name: 'Ordnend', kurz: 'Ordnung, Zahlen, Abläufe' }
};
export const TYP_REIHE = ['R', 'I', 'A', 'S', 'E', 'C'];
// id = Frage im Modul interessen (daten.js RIASEC), dort mit englischem Original
export const TAETIGKEITEN = {
  r6: { typ: 'R', t: 'Einen kaputten Wasserhahn reparieren' }, r4: { typ: 'R', t: 'Elektronische Bauteile zusammenbauen' },
  r8: { typ: 'R', t: 'Einen gepflasterten Gartenweg bauen' }, r7: { typ: 'R', t: 'Fische in einer Fischzucht aufziehen' },
  r2: { typ: 'R', t: 'Ziegel mauern oder Fliesen legen' },
  i6: { typ: 'I', t: 'Wale und andere Meerestiere erforschen' }, i8: { typ: 'I', t: 'Eine Karte vom Meeresboden erstellen' },
  i1: { typ: 'I', t: 'Erforschen, wie der menschliche Körper aufgebaut ist' }, i4: { typ: 'I', t: 'Eine neue medizinische Behandlung entwickeln' },
  i2: { typ: 'I', t: 'Das Verhalten von Tieren erforschen' },
  a4: { typ: 'A', t: 'Einen Song schreiben' }, a3: { typ: 'A', t: 'Bilder und Grafiken für Zeitschriften gestalten' },
  a6: { typ: 'A', t: 'Ein Instrument spielen' }, a2: { typ: 'A', t: 'Bei einem Theaterstück Regie führen' },
  a5: { typ: 'A', t: 'Bücher oder Theaterstücke schreiben' },
  s7: { typ: 'S', t: 'Kindern das Lesen beibringen' }, s4: { typ: 'S', t: 'Jemandem ein Trainingsprogramm beibringen' },
  s1: { typ: 'S', t: 'Menschen bei der Berufswahl beraten' }, s6: { typ: 'S', t: 'In einem Ferienlager Kinder betreuen' },
  s8: { typ: 'S', t: 'Älteren Menschen im Alltag helfen' },
  e8: { typ: 'E', t: 'Einen Spielzeugladen führen' }, e5: { typ: 'E', t: 'Eine Abteilung in einer großen Firma leiten' },
  e3: { typ: 'E', t: 'Ein Hotel leiten' }, e7: { typ: 'E', t: 'Häuser verkaufen' }, e4: { typ: 'E', t: 'Einen eigenen Friseur- oder Kosmetiksalon führen' },
  c2: { typ: 'C', t: 'Mit einem Handscanner den Lagerbestand erfassen' }, c5: { typ: 'C', t: 'Statistiken und andere Zahlen berechnen und festhalten' },
  c1: { typ: 'C', t: 'Für ein Büro die monatlichen Gehaltsabrechnungen erstellen' }, c8: { typ: 'C', t: 'Listen über ein- und ausgehende Lieferungen führen' },
  c6: { typ: 'C', t: 'Mit dem Taschenrechner Zahlen ausrechnen' }
};
export const DUELLE = [
  ['r6', 'i6'], ['a4', 'r4'], ['r8', 's7'], ['e8', 'r7'], ['r2', 'c2'],
  ['i8', 'a3'], ['s4', 'i1'], ['i4', 'e5'], ['c5', 'i2'], ['a6', 's1'],
  ['e3', 'a2'], ['a5', 'c1'], ['s6', 'e7'], ['c8', 's8'], ['e4', 'c6']
].map(([a, b], i) => ({ id: 'd' + String(i + 1).padStart(2, '0'), a, b }));

// ---------- Level: Reihenfolge der Schritte ----------
// Arten: paar (gewertet), wieder, kette, kontrolle, leicht, kopf, duell. Farben: Paare von Verläufen je Level (stil.css).
export const LEVEL = [
  { nr: 1, name: 'Aufwärmen', farbe: 'f1', wissen: 'Zwei Aussagen, eine Wahl: So eine „Zwangswahl“ macht Schönfärben schwerer, weil beide Seiten gut klingen können.',
    folge: ['p01', 'p02', 'p03', 'p04', 'p05', 'x1', 'p06', 'p07', 'k1a', 'p08'] },
  { nr: 2, name: 'Kopfnüsse', farbe: 'f2', wissen: 'Forschende bauen kleine Fallen ein, um zu sehen, ob man noch genau liest. Gute Nachricht: Wer reinfällt, ist nicht dumm – das Gehirn spart nur Arbeit.',
    folge: ['p09', 'p10', 'p11', 'm1', 'm2', 'm3', 'n4', 'p12', 'k2a', 'p13', 'n1', 'p14'] },
  { nr: 3, name: 'Dranbleiben', farbe: 'f3', wissen: 'Manche Paare kommen zweimal. Wer sich treu bleibt, macht das Ergebnis sicherer. Ein Wechsel ist erlaubt – er zeigt nur, wo es knapp war.',
    folge: ['p15', 'p16', 'k1b', 'p17', 'x2', 'p18', 'w1', 'p19', 'n2', 'p20', 'k2b', 'p21', 'w2', 'p22'] },
  { nr: 4, name: 'Endspurt', farbe: 'f4', wissen: 'Am Ende rechnet die App: Jede Wahl schiebt deine Schätzung ein Stück – und je mehr Wahlen in dieselbe Richtung zeigen, desto schmaler wird der Bereich.',
    folge: ['p23', 'p24', 'm4', 'm5', 'n5', 'p25', 'k1c', 'p26', 'w3', 'x3', 'p27', 'k2c', 'p28', 'n3', 'p29', 'w4', 'p30'] },
  { nr: 5, name: 'Bonus: Interessen-Duell', farbe: 'f5', bonus: true, wissen: 'Interessen sind ziemlich beständig. Hier zählt nur, was du lieber tun würdest – egal, ob du es kannst.',
    folge: DUELLE.map((d) => d.id) }
];

// Schritt-Objekt zu einer id (Texte aufgelöst). Rückgabe: { id, art, frage, a: {id?, t}, b: {id?, t}, … }
const ALLE = {};
for (const p of PAARE) ALLE[p.id] = { id: p.id, art: 'paar', frage: 'Was passt eher zu dir?', a: { id: p.a, t: AUSSAGEN[p.a].t }, b: { id: p.b, t: AUSSAGEN[p.b].t } };
for (const w of WIEDER) { const p = PAAR[w.von]; ALLE[w.id] = { id: w.id, art: 'wieder', von: w.von, frage: 'Was passt eher zu dir?', a: { id: p.a, t: AUSSAGEN[p.a].t }, b: { id: p.b, t: AUSSAGEN[p.b].t } }; }
for (const k of KETTEN_PAARE) ALLE[k.id] = { id: k.id, art: 'kette', kette: k.kette, frage: 'Was passt eher zu dir?', a: { id: k.a, t: AUSSAGEN[k.a].t }, b: { id: k.b, t: AUSSAGEN[k.b].t } };
for (const x of KONTROLLE) ALLE[x.id] = { id: x.id, art: 'kontrolle', sorte: x.art, frage: x.frage, a: { t: x.a }, b: { t: x.b }, richtig: x.richtig };
for (const m of LEICHT) ALLE[m.id] = { id: m.id, art: 'leicht', frage: m.frage, a: { t: m.a }, b: { t: m.b }, richtig: m.richtig, seite: m.seite, vor: m.vor };
for (const n of KOPF) ALLE[n.id] = { id: n.id, art: 'kopf', sorte: n.art, frage: n.frage, a: { t: n.a }, b: { t: n.b }, richtig: n.richtig, seite: n.seite || null, aufloesung: n.aufloesung, quellen: n.quellen, beleg: n.beleg || 'belegt' };
for (const d of DUELLE) ALLE[d.id] = { id: d.id, art: 'duell', frage: 'Was würdest du lieber tun?', a: { id: d.a, t: TAETIGKEITEN[d.a].t, typ: TAETIGKEITEN[d.a].typ }, b: { id: d.b, t: TAETIGKEITEN[d.b].t, typ: TAETIGKEITEN[d.b].typ } };
export const SCHRITT = ALLE;

// Alle Schritte in Spiel-Reihenfolge, mit Level-Nummer
export const ABLAUF = LEVEL.flatMap((L) => L.folge.map((id) => ({ ...ALLE[id], level: L.nr })));
export const PFLICHT_ANZAHL = ABLAUF.filter((s) => s.level < 5).length;   // Level 1–4

// Wörter einer Wahl (für die Lese-Zeit)
export const woerter = (s) => `${s.frage} ${s.a.t} ${s.b.t}`.split(/\s+/).filter(Boolean).length;
