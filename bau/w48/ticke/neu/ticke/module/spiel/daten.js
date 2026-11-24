// Entweder – oder (Modul „spiel“) – Daten: Richtungen, Aussagen, Paare, Teile. Kein DOM, kein Import → auch in Node testbar.
// Aussagen: IPIP-NEO-120 (Johnson 2014, gemeinfrei), dieselbe eigene deutsche Übersetzung wie im Modul bigfive
// (vorläufig). nr = Platz im IPIP-NEO-120. b = Bereich der App, k = +1: die Aussage spricht für den Pol „rechts“, −1: für „links“.
// Bei „stabilitaet“ sprechen die IPIP-Neurotizismus-Aussagen für den Pol „feinfühlig, wachsam“ (k = −1).
// Zwangswahl-Paare (forced choice, Blockgröße 2) nach dem Thurstone-Modell (Brown & Maydeu-Olivares 2011): 30 Paare, jedes
// Bereichs-Paar 3-mal, 12 Aussagen je Bereich, 11 Paare gleich gepolt (+/+), 4 Paare gleich gepolt (−/−), 15 Paare gemischt
// (+/−) – die gemischten zeigen die Richtung, nicht nur eine Reihenfolge.
// Tätigkeiten: aus den IIP RIASEC Markers (Armstrong, Allison & Rounds 2008, aus dem O*NET Interest Profiler;
// Hinweis zur O*NET-Lizenz in module/interessen/quellen.js „onet“), dieselbe Übersetzung wie im Modul interessen.
// 0.3: kein Spiel mehr – keine Punkte, keine Fang- oder Kontrollfragen, kein richtig/falsch. Ergebnis nur in Worten.

export const FASSUNG = 'eo-2';

// Fünf Richtungen mit zwei gleichwertigen Polen. links = Pol „weniger“ (Aussagen mit k = −1), rechts = Pol „mehr“ (k = +1).
// id = Bereichs-ID der Vorlage (bleibt so, alte Daten laden weiter). forschung = Name des Bereichs in der Big-Five-Forschung.
// thema: worum es geht (für „woher“). satz: [rechts, links, beides] – je ein Satz in Worten, beide Pole mit ihren Stärken.
export const BEREICHE = [
  { id: 'offenheit', titel: 'Neues oder Vertrautes', thema: 'Neues und Vertrautes', forschung: 'Offenheit für Erfahrungen', links: 'Vertrautes', rechts: 'Neues',
    satz: ['Du gehst gern auf Neues zu: Ideen, Fantasie und Abwechslung ziehen dich an.',
      'Du hältst dich gern an Vertrautes: Bewährtes gibt dir Boden, und du gehst Dingen lieber in die Tiefe als in die Breite.',
      'Neues und Vertrautes ziehen dich ähnlich an – je nach Lage nimmst du das eine oder das andere.'] },
  { id: 'gewissenhaftigkeit', titel: 'Spontan oder geplant', thema: 'Spontaneität und Planung', forschung: 'Gewissenhaftigkeit', links: 'spontan, beweglich', rechts: 'geplant, gründlich',
    satz: ['Du gehst eher geplant und gründlich vor: Ordnung und ein klarer Weg geben dir Ruhe.',
      'Du gehst eher spontan und beweglich vor: Du lässt dich vom Moment leiten und kannst gut umplanen.',
      'Planen und Losgehen liegen bei dir nah beieinander – du nimmst, was die Lage braucht.'] },
  { id: 'extraversion', titel: 'Ruhe oder Trubel', thema: 'Ruhe und Geselligkeit', forschung: 'Extraversion', links: 'ruhig, für dich', rechts: 'gesellig, aktiv',
    satz: ['Du bist eher gesellig und aktiv: Menschen und Bewegung geben dir Schwung.',
      'Du bist eher ruhig und gern für dich: Stille und wenige, nahe Menschen geben dir Kraft.',
      'Trubel und Ruhe tun dir beide gut – du wechselst je nach Tag zwischen beidem.'] },
  { id: 'vertraeglichkeit', titel: 'Direkt oder rücksichtsvoll', thema: 'Klartext und Rücksicht', forschung: 'Verträglichkeit', links: 'direkt, kritisch', rechts: 'rücksichtsvoll, mitfühlend',
    satz: ['Du bist eher rücksichtsvoll und mitfühlend: Du achtest darauf, wie es anderen geht.',
      'Du bist eher direkt und kritisch: Du sagst, was du denkst, und prüfst, bevor du vertraust.',
      'Rücksicht und Klartext gehören bei dir beide dazu – je nachdem, mit wem du es zu tun hast.'] },
  { id: 'stabilitaet', titel: 'Feinfühlig oder gelassen', thema: 'Feingefühl und Gelassenheit', forschung: 'Emotionale Stabilität (umgekehrt: Neurotizismus)', links: 'feinfühlig, wachsam', rechts: 'gelassen, ruhig',
    satz: ['Du bleibst eher gelassen: Vieles lässt du an dir abperlen und behältst die Ruhe.',
      'Du bist eher feinfühlig und wachsam: Du spürst Stimmungen und Anspannung früh und deutlich.',
      'Gelassenheit und Feingefühl wechseln sich bei dir ab – je nach Lage spürst du mehr oder bleibst ruhig.'] }
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

// 30 Haupt-Paare (aus ihnen kommt die Richtung). Bereiche wechseln sich ab.
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

// Wiederholungen: dasselbe Paar später noch einmal, Seiten getauscht. Fließt nicht in die Richtung ein; wählst du einmal so, einmal so,
// zeigt das Muster: beides gehört zu dir.
export const WIEDER = [{ id: 'w1', von: 'p03' }, { id: 'w2', von: 'p07' }, { id: 'w3', von: 'p12' }, { id: 'w4', von: 'p20' }];

// Dreier-Vergleiche (Ketten): drei Aussagen, jede gegen jede (A–B, B–C, C–A), über alle Wahlen verteilt. Ein Kreis (A vor B, B vor C,
// C vor A) heißt nur: Diese drei sprechen dich ähnlich an (Kendall & Babington Smith 1940). Fließt nicht in die Richtung ein.
export const KETTEN = [
  { id: 'k1', aus: ['o4', 'c1', 'e3'] },
  { id: 'k2', aus: ['a3', 's2', 'o1'] }
];
export const KETTEN_PAARE = KETTEN.flatMap((k) => [[0, 1], [1, 2], [2, 0]].map(([x, y], j) => ({ id: `${k.id}${'abc'[j]}`, kette: k.id, a: k.aus[x], b: k.aus[y] })));

// Tätigkeiten (freiwillig): 15 Paare, jede Kombination der sechs Bereiche genau einmal, jeder Bereich 5-mal.
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

// ---------- Teile: Reihenfolge der Wahlen ----------
// Arten: paar (30 Haupt-Paare), wieder (dasselbe Paar später noch einmal, Seiten getauscht), kette (Dreier-Vergleich), duell (Tätigkeiten).
// Vier ruhige Teile à 10 Wahlen (nur für die Orientierung und die Farbe), dazu freiwillig die Tätigkeiten.
// Die Vorlage 0.2.1 hatte zusätzlich Kontroll-, leichte und Kopfnuss-Fragen (x1–x3, m1–m5, n1–n5); deren alte Antworten werden still übergangen.
export const TEILE = [
  { nr: 1, farbe: 'f1', folge: ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'k1a', 'p08', 'p09'] },
  { nr: 2, farbe: 'f2', folge: ['p10', 'p11', 'p12', 'k2a', 'p13', 'p14', 'p15', 'p16', 'k1b', 'p17'] },
  { nr: 3, farbe: 'f3', folge: ['p18', 'w1', 'p19', 'p20', 'k2b', 'p21', 'w2', 'p22', 'p23', 'p24'] },
  { nr: 4, farbe: 'f4', folge: ['p25', 'k1c', 'p26', 'w3', 'p27', 'k2c', 'p28', 'p29', 'w4', 'p30'] },
  { nr: 5, farbe: 'f5', frei: true, name: 'Tätigkeiten', folge: DUELLE.map((d) => d.id) }
];
export const TEILE_HAUPT = TEILE.filter((T) => !T.frei).length;

// Schritt-Objekt zu einer id (Texte aufgelöst). Rückgabe: { id, art, frage, a: {id?, t}, b: {id?, t}, … }
const ALLE = {};
for (const p of PAARE) ALLE[p.id] = { id: p.id, art: 'paar', frage: 'Was passt eher zu dir?', a: { id: p.a, t: AUSSAGEN[p.a].t }, b: { id: p.b, t: AUSSAGEN[p.b].t } };
for (const w of WIEDER) { const p = PAAR[w.von]; ALLE[w.id] = { id: w.id, art: 'wieder', von: w.von, frage: 'Was passt eher zu dir?', a: { id: p.a, t: AUSSAGEN[p.a].t }, b: { id: p.b, t: AUSSAGEN[p.b].t } }; }
for (const k of KETTEN_PAARE) ALLE[k.id] = { id: k.id, art: 'kette', kette: k.kette, frage: 'Was passt eher zu dir?', a: { id: k.a, t: AUSSAGEN[k.a].t }, b: { id: k.b, t: AUSSAGEN[k.b].t } };
for (const d of DUELLE) ALLE[d.id] = { id: d.id, art: 'duell', frage: 'Was würdest du lieber tun?', a: { id: d.a, t: TAETIGKEITEN[d.a].t, typ: TAETIGKEITEN[d.a].typ }, b: { id: d.b, t: TAETIGKEITEN[d.b].t, typ: TAETIGKEITEN[d.b].typ } };
export const SCHRITT = ALLE;

// Alle Wahlen in Reihenfolge, mit Teil-Nummer (teil; level = dasselbe, für alte Hilfsmittel)
export const ABLAUF = TEILE.flatMap((T) => T.folge.map((id) => ({ ...ALLE[id], teil: T.nr, level: T.nr })));
export const HAUPT = ABLAUF.filter((s) => s.art !== 'duell');
export const HAUPT_ANZAHL = HAUPT.length;                    // 40
export const PFLICHT_ANZAHL = HAUPT_ANZAHL;                  // alter Name
export const DUELL_ANZAHL = ABLAUF.length - HAUPT_ANZAHL;    // 15

// Wörter einer Wahl (für die Lese-Zeit)
export const woerter = (s) => `${s.frage} ${s.a.t} ${s.b.t}`.split(/\s+/).filter(Boolean).length;
