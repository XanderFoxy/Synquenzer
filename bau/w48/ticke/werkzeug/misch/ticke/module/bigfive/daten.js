// M1 bigfive – Fragen, Bereiche, Facetten, Vergleichswerte. Keine DOM-Abhängigkeit (auch in Node testbar).
// Fragen: IPIP-NEO-120 (Johnson 2014, gemeinfrei, ipip.ori.org), eigene deutsche Übersetzung (vorläufig, QUELLEN.md §3.1).
// nr = Platz im IPIP-NEO-120 (Johnsons Reihenfolge), b = IPIP-Bereich (N E O A C, N = Neurotizismus), f = Facette 1–6,
// k = +1: Zustimmung erhöht den IPIP-Bereich, −1: umgepolt. t = Text, h = kurze Erklärung unter der Frage.
// Nicht übernommen: Nr. 28 und 88 (O6, Wahl „liberaler/konservativer“ Kandidaten) – die Wahl von US-Parteien ist nicht
// übertragbar. O6 „liberalitaet“ hat deshalb nur 2 Fragen (sehr grob); Nr. 118 („hart durchgreifen“) bleibt als allgemeine Haltung.

export const FASSUNG = 'ipip-neo-120-de-1';

export const FRAGEN = [
  // N1 Ängstlichkeit (App: gelassenheit, umgepolt)
  { nr: 1, b: 'N', f: 1, k: 1, t: 'Ich mache mir über vieles Sorgen.' },
  { nr: 31, b: 'N', f: 1, k: 1, t: 'Ich rechne mit dem Schlimmsten.' },
  { nr: 61, b: 'N', f: 1, k: 1, t: 'Ich habe vor vielen Dingen Angst.' },
  { nr: 91, b: 'N', f: 1, k: 1, t: 'Ich bin schnell gestresst.' },
  // N2 Reizbarkeit (ausgeglichenheit)
  { nr: 6, b: 'N', f: 2, k: 1, t: 'Ich werde schnell wütend.' },
  { nr: 36, b: 'N', f: 2, k: 1, t: 'Ich bin schnell genervt.' },
  { nr: 66, b: 'N', f: 2, k: 1, t: 'Ich verliere die Beherrschung.' },
  { nr: 96, b: 'N', f: 2, k: -1, t: 'Ich lasse mich nicht leicht ärgern.' },
  // N3 Niedergeschlagenheit (grundstimmung)
  { nr: 11, b: 'N', f: 3, k: 1, t: 'Ich bin oft traurig.' },
  { nr: 41, b: 'N', f: 3, k: 1, t: 'Ich mag mich selbst nicht.' },
  { nr: 71, b: 'N', f: 3, k: 1, t: 'Ich bin oft niedergeschlagen.' },
  { nr: 101, b: 'N', f: 3, k: -1, t: 'Ich fühle mich wohl mit mir selbst.' },
  // N4 Befangenheit (selbstsicherheit)
  { nr: 16, b: 'N', f: 4, k: 1, t: 'Es fällt mir schwer, auf andere zuzugehen.' },
  { nr: 46, b: 'N', f: 4, k: 1, t: 'Ich habe Angst, Aufmerksamkeit auf mich zu ziehen.' },
  { nr: 76, b: 'N', f: 4, k: 1, t: 'Ich fühle mich nur unter Freunden wohl.' },
  { nr: 106, b: 'N', f: 4, k: -1, t: 'Schwierige Situationen mit anderen Menschen machen mir nichts aus.' },
  // N5 Unmäßigkeit (masshalten)
  { nr: 21, b: 'N', f: 5, k: 1, t: 'Ich übertreibe es – zum Beispiel beim Essen, Trinken oder Einkaufen.' },
  { nr: 51, b: 'N', f: 5, k: -1, t: 'Ich gönne mir selten zu viel des Guten.' },
  { nr: 81, b: 'N', f: 5, k: -1, t: 'Ich kann Versuchungen leicht widerstehen.' },
  { nr: 111, b: 'N', f: 5, k: -1, t: 'Wenn ich große Lust auf etwas habe, kann ich mich gut beherrschen.' },
  // N6 Verletzlichkeit (belastbarkeit)
  { nr: 26, b: 'N', f: 6, k: 1, t: 'Ich gerate schnell in Panik.' },
  { nr: 56, b: 'N', f: 6, k: 1, t: 'Ich fühle mich von dem, was passiert, überfordert.' },
  { nr: 86, b: 'N', f: 6, k: 1, t: 'Ich habe das Gefühl, mit den Dingen nicht klarzukommen.' },
  { nr: 116, b: 'N', f: 6, k: -1, t: 'Unter Druck bleibe ich ruhig.' },

  // E1 Herzlichkeit (freundlichkeit)
  { nr: 2, b: 'E', f: 1, k: 1, t: 'Ich finde leicht Freunde.' },
  { nr: 32, b: 'E', f: 1, k: 1, t: 'Unter Menschen fühle ich mich wohl.' },
  { nr: 62, b: 'E', f: 1, k: -1, t: 'Ich meide den Kontakt zu anderen.' },
  { nr: 92, b: 'E', f: 1, k: -1, t: 'Ich halte andere auf Abstand.' },
  // E2 Geselligkeit
  { nr: 7, b: 'E', f: 2, k: 1, t: 'Ich liebe große Feiern.' },
  { nr: 37, b: 'E', f: 2, k: 1, t: 'Auf Feiern rede ich mit vielen verschiedenen Leuten.' },
  { nr: 67, b: 'E', f: 2, k: -1, t: 'Ich bin lieber allein.' },
  { nr: 97, b: 'E', f: 2, k: -1, t: 'Ich meide Menschenmengen.' },
  // E3 Durchsetzung
  { nr: 12, b: 'E', f: 3, k: 1, t: 'Ich übernehme die Führung.' },
  { nr: 42, b: 'E', f: 3, k: 1, t: 'Ich versuche, andere zu führen.' },
  { nr: 72, b: 'E', f: 3, k: 1, t: 'Ich nehme die Dinge in die Hand.' },
  { nr: 102, b: 'E', f: 3, k: -1, t: 'Ich warte, bis andere vorangehen.' },
  // E4 Aktivität
  { nr: 17, b: 'E', f: 4, k: 1, t: 'Ich bin immer beschäftigt.' },
  { nr: 47, b: 'E', f: 4, k: 1, t: 'Ich bin ständig in Bewegung.' },
  { nr: 77, b: 'E', f: 4, k: 1, t: 'In meiner Freizeit unternehme ich viel.' },
  { nr: 107, b: 'E', f: 4, k: -1, t: 'Ich lasse es gern ruhig angehen.' },
  // E5 Erlebnishunger
  { nr: 22, b: 'E', f: 5, k: 1, t: 'Ich liebe es, wenn es aufregend wird.' },
  { nr: 52, b: 'E', f: 5, k: 1, t: 'Ich suche das Abenteuer.' },
  { nr: 82, b: 'E', f: 5, k: 1, t: 'Ich bin gern leichtsinnig.' },
  { nr: 112, b: 'E', f: 5, k: 1, t: 'Ich benehme mich wild und verrückt.' },
  // E6 Frohsinn
  { nr: 27, b: 'E', f: 6, k: 1, t: 'Ich strahle Freude aus.' },
  { nr: 57, b: 'E', f: 6, k: 1, t: 'Ich habe viel Spaß.' },
  { nr: 87, b: 'E', f: 6, k: 1, t: 'Ich liebe das Leben.' },
  { nr: 117, b: 'E', f: 6, k: 1, t: 'Ich schaue auf die guten Seiten des Lebens.' },

  // O1 Fantasie
  { nr: 3, b: 'O', f: 1, k: 1, t: 'Ich habe eine lebhafte Fantasie.' },
  { nr: 33, b: 'O', f: 1, k: 1, t: 'Ich lasse meine Fantasie gern wild schweifen.' },
  { nr: 63, b: 'O', f: 1, k: 1, t: 'Ich träume gern vor mich hin.' },
  { nr: 93, b: 'O', f: 1, k: 1, t: 'Ich versinke gern in Gedanken.' },
  // O2 Sinn für Kunst
  { nr: 8, b: 'O', f: 2, k: 1, t: 'Ich finde Kunst wichtig.' },
  { nr: 38, b: 'O', f: 2, k: 1, t: 'Ich sehe Schönheit in Dingen, die anderen vielleicht nicht auffallen.' },
  { nr: 68, b: 'O', f: 2, k: -1, t: 'Ich mag keine Gedichte.' },
  { nr: 98, b: 'O', f: 2, k: -1, t: 'Ich gehe nicht gern in Kunstmuseen.' },
  // O3 Gefühle
  { nr: 13, b: 'O', f: 3, k: 1, t: 'Ich erlebe meine Gefühle sehr stark.' },
  { nr: 43, b: 'O', f: 3, k: 1, t: 'Ich spüre, was andere fühlen.' },
  { nr: 73, b: 'O', f: 3, k: -1, t: 'Ich merke selten, wie ich gefühlsmäßig auf etwas reagiere.' },
  { nr: 103, b: 'O', f: 3, k: -1, t: 'Ich verstehe Menschen nicht, die emotional werden.' },
  // O4 Abenteuerlust
  { nr: 18, b: 'O', f: 4, k: 1, t: 'Ich mag Abwechslung lieber als Routine.' },
  { nr: 48, b: 'O', f: 4, k: -1, t: 'Ich bleibe lieber bei dem, was ich kenne.' },
  { nr: 78, b: 'O', f: 4, k: -1, t: 'Ich mag keine Veränderungen.' },
  { nr: 108, b: 'O', f: 4, k: -1, t: 'Ich halte daran fest, wie man es schon immer gemacht hat.' },
  // O5 Intellekt
  { nr: 23, b: 'O', f: 5, k: 1, t: 'Ich lese gern anspruchsvolle Texte.' },
  { nr: 53, b: 'O', f: 5, k: -1, t: 'Ich gehe Gesprächen über philosophische Fragen aus dem Weg.', h: 'Philosophische Fragen sind große Fragen, zum Beispiel: Was ist ein gutes Leben?' },
  { nr: 83, b: 'O', f: 5, k: -1, t: 'Abstrakte Ideen verstehe ich nur schwer.', h: 'Abstrakt heißt: Gedanken, die man nicht sehen oder anfassen kann, zum Beispiel „Gerechtigkeit“.' },
  { nr: 113, b: 'O', f: 5, k: -1, t: 'Theoretische Diskussionen interessieren mich nicht.' },
  // O6 Liberalität – nur 2 der 4 Fragen (siehe oben)
  { nr: 58, b: 'O', f: 6, k: 1, t: 'Ich glaube, es gibt kein absolutes Richtig und Falsch.' },
  { nr: 118, b: 'O', f: 6, k: -1, t: 'Ich finde, gegen Kriminalität sollte man hart durchgreifen.' },

  // A1 Vertrauen
  { nr: 4, b: 'A', f: 1, k: 1, t: 'Ich vertraue anderen.' },
  { nr: 34, b: 'A', f: 1, k: 1, t: 'Ich glaube, dass andere es gut meinen.' },
  { nr: 64, b: 'A', f: 1, k: 1, t: 'Ich glaube, was Leute mir sagen.' },
  { nr: 94, b: 'A', f: 1, k: -1, t: 'Ich misstraue Menschen.' },
  // A2 Moral (aufrichtigkeit)
  { nr: 9, b: 'A', f: 2, k: -1, t: 'Ich benutze andere für meine Zwecke.' },
  { nr: 39, b: 'A', f: 2, k: -1, t: 'Ich schummle, um weiterzukommen.' },
  { nr: 69, b: 'A', f: 2, k: -1, t: 'Ich nutze andere aus.' },
  { nr: 99, b: 'A', f: 2, k: -1, t: 'Ich durchkreuze die Pläne anderer.' },
  // A3 Altruismus (hilfsbereitschaft)
  { nr: 14, b: 'A', f: 3, k: 1, t: 'Ich helfe anderen sehr gern.' },
  { nr: 44, b: 'A', f: 3, k: 1, t: 'Andere Menschen liegen mir am Herzen.' },
  { nr: 74, b: 'A', f: 3, k: -1, t: 'Die Gefühle anderer sind mir egal.' },
  { nr: 104, b: 'A', f: 3, k: -1, t: 'Ich nehme mir keine Zeit für andere.' },
  // A4 Entgegenkommen (kooperation)
  { nr: 19, b: 'A', f: 4, k: -1, t: 'Ich streite mich gern so richtig.' },
  { nr: 49, b: 'A', f: 4, k: -1, t: 'Ich schreie andere an.' },
  { nr: 79, b: 'A', f: 4, k: -1, t: 'Ich beleidige andere.' },
  { nr: 109, b: 'A', f: 4, k: -1, t: 'Ich zahle es anderen heim.' },
  // A5 Bescheidenheit
  { nr: 24, b: 'A', f: 5, k: -1, t: 'Ich glaube, dass ich besser bin als andere.' },
  { nr: 54, b: 'A', f: 5, k: -1, t: 'Ich halte viel von mir.' },
  { nr: 84, b: 'A', f: 5, k: -1, t: 'Ich habe eine hohe Meinung von mir.' },
  { nr: 114, b: 'A', f: 5, k: -1, t: 'Ich prahle mit meinen guten Seiten.' },
  // A6 Mitgefühl
  { nr: 29, b: 'A', f: 6, k: 1, t: 'Ich habe Mitgefühl mit obdachlosen Menschen.' },
  { nr: 59, b: 'A', f: 6, k: 1, t: 'Ich fühle mit Menschen, denen es schlechter geht als mir.' },
  { nr: 89, b: 'A', f: 6, k: -1, t: 'Die Probleme anderer interessieren mich nicht.' },
  { nr: 119, b: 'A', f: 6, k: -1, t: 'Ich versuche, nicht an Menschen in Not zu denken.' },

  // C1 Selbstwirksamkeit
  { nr: 5, b: 'C', f: 1, k: 1, t: 'Ich erledige Aufgaben erfolgreich.' },
  { nr: 35, b: 'C', f: 1, k: 1, t: 'In dem, was ich tue, bin ich richtig gut.' },
  { nr: 65, b: 'C', f: 1, k: 1, t: 'Aufgaben gehen mir leicht von der Hand.' },
  { nr: 95, b: 'C', f: 1, k: 1, t: 'Ich weiß, wie ich Dinge geregelt bekomme.' },
  // C2 Ordnung
  { nr: 10, b: 'C', f: 2, k: 1, t: 'Ich räume gern auf.' },
  { nr: 40, b: 'C', f: 2, k: -1, t: 'Ich vergesse oft, Dinge wieder an ihren Platz zu legen.' },
  { nr: 70, b: 'C', f: 2, k: -1, t: 'In meinem Zimmer hinterlasse ich Unordnung.' },
  { nr: 100, b: 'C', f: 2, k: -1, t: 'Ich lasse meine Sachen herumliegen.' },
  // C3 Pflichtbewusstsein (pflichtgefuehl)
  { nr: 15, b: 'C', f: 3, k: 1, t: 'Ich halte meine Versprechen.' },
  { nr: 45, b: 'C', f: 3, k: 1, t: 'Ich sage die Wahrheit.' },
  { nr: 75, b: 'C', f: 3, k: -1, t: 'Ich breche Regeln.' },
  { nr: 105, b: 'C', f: 3, k: -1, t: 'Ich breche meine Versprechen.' },
  // C4 Leistungsstreben
  { nr: 20, b: 'C', f: 4, k: 1, t: 'Ich arbeite hart.' },
  { nr: 50, b: 'C', f: 4, k: 1, t: 'Ich mache mehr, als von mir erwartet wird.' },
  { nr: 80, b: 'C', f: 4, k: -1, t: 'Ich arbeite nur so viel, wie gerade nötig ist.' },
  { nr: 110, b: 'C', f: 4, k: -1, t: 'Ich stecke wenig Zeit und Mühe in meine Arbeit.', h: 'Arbeit heißt hier auch Schule, Ausbildung oder eigene Projekte.' },
  // C5 Selbstdisziplin
  { nr: 25, b: 'C', f: 5, k: 1, t: 'Ich bin immer vorbereitet.' },
  { nr: 55, b: 'C', f: 5, k: 1, t: 'Ich setze meine Pläne um.' },
  { nr: 85, b: 'C', f: 5, k: -1, t: 'Ich verschwende meine Zeit.' },
  { nr: 115, b: 'C', f: 5, k: -1, t: 'Es fällt mir schwer, mit Aufgaben anzufangen.' },
  // C6 Besonnenheit
  { nr: 30, b: 'C', f: 6, k: -1, t: 'Ich stürze mich in Dinge, ohne nachzudenken.' },
  { nr: 60, b: 'C', f: 6, k: -1, t: 'Ich treffe vorschnelle Entscheidungen.' },
  { nr: 90, b: 'C', f: 6, k: -1, t: 'Ich gehe Dinge überstürzt an.' },
  { nr: 120, b: 'C', f: 6, k: -1, t: 'Ich handle, ohne nachzudenken.' }
].map((q) => ({ ...q, id: 'bf' + q.nr }));

// Startform: je Facette genau eine Frage (30 Fragen, je Bereich 6), in dieser Reihenfolge (Bereiche wechseln sich ab).
// Auswahl: klare, alltagsnahe Aussage je Facette; je Bereich beide Richtungen (N, A, C je 3:3; E und O je 4:2).
export const START_REIHE = [1, 2, 3, 4, 5, 6, 67, 8, 69, 100, 101, 12, 13, 14, 15, 16, 107, 78, 79, 80, 81, 22, 53, 24, 25, 116, 27, 58, 59, 60];
const START = new Set(START_REIHE);
FRAGEN.forEach((q) => { q.start = START.has(q.nr); });
export const NACH_NR = Object.fromEntries(FRAGEN.map((q) => [q.nr, q]));
export const NACH_ID = Object.fromEntries(FRAGEN.map((q) => [q.id, q]));

// App-Bereiche (Anzeige-Reihenfolge OCEAN, „stabilitaet“ = umgepolter Neurotizismus). ARCH.md §3.3. IDs bleiben (Ergebnis-Schlüssel).
// links/rechts = die zwei gleichwertigen Pole in Worten (links: wenig vom IPIP-Merkmal, rechts: viel). titel = Anzeige-Name im Modul.
export const BEREICHE = [
  { id: 'offenheit', ipip: 'O', name: 'Offenheit', titel: 'Offenheit', links: 'Halt im Bewährten', rechts: 'Neugier auf Neues' },
  { id: 'gewissenhaftigkeit', ipip: 'C', name: 'Gewissenhaftigkeit', titel: 'Gewissenhaftigkeit', links: 'Spontan und beweglich', rechts: 'Plan und Struktur' },
  { id: 'extraversion', ipip: 'E', name: 'Extraversion', titel: 'Extraversion', links: 'Ruhe und Tiefe', rechts: 'Kontakt und Schwung' },
  { id: 'vertraeglichkeit', ipip: 'A', name: 'Verträglichkeit', titel: 'Verträglichkeit', links: 'Klarheit und eigener Kopf', rechts: 'Rücksicht und Miteinander' },
  { id: 'stabilitaet', ipip: 'N', name: 'Emotionale Stabilität', titel: 'Gelassenheit und Gespür', links: 'Feines Gespür', rechts: 'Gelassene Ruhe', umgepolt: true }
];
export const BEREICH = Object.fromEntries(BEREICHE.map((b) => [b.id, b]));
export const VON_IPIP = Object.fromEntries(BEREICHE.map((b) => [b.ipip, b.id]));

// Facetten (Schlüssel ARCH.md §3.3, Reihenfolge = IPIP-Facette 1–6). Bei „stabilitaet“ hoch = wenig vom IPIP-Merkmal.
export const FACETTEN = {
  offenheit: [['fantasie', 'Fantasie', 'träumst und stellst dir gern Dinge vor'], ['kunst', 'Sinn für Schönes', 'Kunst und Schönes berühren dich'],
    ['gefuehle', 'Gefühle wahrnehmen', 'spürst eigene und fremde Gefühle deutlich'], ['abenteuer', 'Lust auf Neues', 'magst Abwechslung statt Routine'],
    ['intellekt', 'Denklust', 'magst schwierige Gedanken und Ideen'], ['liberalitaet', 'Werte hinterfragen', 'siehst Regeln und Werte nicht als ganz fest']],
  gewissenhaftigkeit: [['selbstwirksamkeit', 'Zutrauen in dein Können', 'bekommst Aufgaben gut erledigt'], ['ordnung', 'Ordnung', 'hältst Dinge an ihrem Platz'],
    ['pflichtgefuehl', 'Verlässlichkeit', 'hältst Versprechen und Regeln ein'], ['leistungsstreben', 'Ehrgeiz', 'arbeitest hart, willst mehr als nötig'],
    ['selbstdisziplin', 'Selbstdisziplin', 'fängst an und ziehst durch'], ['besonnenheit', 'Besonnenheit', 'denkst nach, bevor du handelst']],
  extraversion: [['freundlichkeit', 'Herzlichkeit', 'gehst offen und warm auf andere zu'], ['geselligkeit', 'Geselligkeit', 'bist gern unter vielen Menschen'],
    ['durchsetzung', 'Durchsetzung', 'übernimmst Führung, sagst, wo es langgeht'], ['aktivitaet', 'Tempo', 'bist viel beschäftigt und in Bewegung'],
    ['erlebnishunger', 'Erlebnishunger', 'suchst Aufregung und Abenteuer'], ['frohsinn', 'Frohsinn', 'erlebst viel Freude und Spaß']],
  vertraeglichkeit: [['vertrauen', 'Vertrauen', 'gehst davon aus, dass andere es gut meinen'], ['aufrichtigkeit', 'Fairness', 'nutzt andere nicht aus, spielst fair'],
    ['hilfsbereitschaft', 'Hilfsbereitschaft', 'hilfst gern und nimmst dir Zeit für andere'], ['kooperation', 'Entgegenkommen', 'vermeidest Streit, wirst selten laut'],
    ['bescheidenheit', 'Bescheidenheit', 'stellst dich nicht über andere'], ['mitgefuehl', 'Mitgefühl', 'fühlst mit Menschen in Not']],
  stabilitaet: [['gelassenheit', 'Gelassenheit', 'machst dir wenig Sorgen'], ['ausgeglichenheit', 'Ruhe bei Ärger', 'wirst selten wütend oder gereizt'],
    ['grundstimmung', 'Gute Grundstimmung', 'bist selten niedergeschlagen, magst dich'], ['selbstsicherheit', 'Sicherheit unter Menschen', 'gehst ohne Scheu auf andere zu'],
    ['masshalten', 'Maß halten', 'kannst Versuchungen gut widerstehen'], ['belastbarkeit', 'Belastbarkeit', 'bleibst unter Druck handlungsfähig']]
};

// Zwei gleichwertige Pole je Facette (Anzeige ohne Zahl): [Pol bei Zustimmung in App-Richtung, Gegenpol]. titel = neutraler Name.
// Reihenfolge wie FACETTEN (IPIP-Facette 1–6). Bei „stabilitaet“ ist der erste Pol die ruhigere Seite.
export const FACETTEN_POLE = {
  offenheit: { fantasie: ['Fantasie', 'Träumen und Ausmalen', 'Nah am Wirklichen'], kunst: ['Sinn für Schönes', 'Berührt von Schönem', 'Nüchterner Blick'],
    gefuehle: ['Gefühle wahrnehmen', 'Gefühle stark erleben', 'Sachlich bei Gefühlen'], abenteuer: ['Lust auf Neues', 'Abwechslung', 'Vertraute Abläufe'],
    intellekt: ['Denklust', 'Lust an Ideen', 'Praktisch und konkret'], liberalitaet: ['Werte hinterfragen', 'Regeln hinterfragen', 'Klare Maßstäbe'] },
  gewissenhaftigkeit: { selbstwirksamkeit: ['Zutrauen in dein Können', 'Zutrauen', 'Selbstkritischer Blick'], ordnung: ['Ordnung', 'Ordnung um dich', 'Kreatives Durcheinander'],
    pflichtgefuehl: ['Zusagen und Regeln', 'Zusagen genau halten', 'Regeln locker sehen'], leistungsstreben: ['Ehrgeiz', 'Hohe Ziele', 'Kraft gezielt einsetzen'],
    selbstdisziplin: ['Anfangen und Dranbleiben', 'Durchziehen', 'Der Energie folgen'], besonnenheit: ['Denken oder gleich handeln', 'Erst abwägen', 'Schnell entschlossen'] },
  extraversion: { freundlichkeit: ['Herzlichkeit', 'Schnell warm mit anderen', 'Nähe wächst langsam'], geselligkeit: ['Geselligkeit', 'Gern unter vielen', 'Kleiner Kreis'],
    durchsetzung: ['Vorangehen', 'Die Führung nehmen', 'Anderen den Vortritt lassen'], aktivitaet: ['Tempo', 'Viel Tempo', 'Ruhiges Tempo'],
    erlebnishunger: ['Lust auf Aufregung', 'Nervenkitzel', 'Ruhig und sicher'], frohsinn: ['Freude zeigen', 'Freude nach außen', 'Stille Freude'] },
  vertraeglichkeit: { vertrauen: ['Vertrauen', 'Vertrauen vorschießen', 'Erst prüfen'], aufrichtigkeit: ['Geradlinigkeit', 'Offene Karten', 'Taktisch vorgehen'],
    hilfsbereitschaft: ['Hilfsbereitschaft', 'Für andere da sein', 'Bei den eigenen Aufgaben'], kooperation: ['Mit Streit umgehen', 'Streit vermeiden', 'Streit austragen'],
    bescheidenheit: ['Bescheidenheit', 'Sich zurücknehmen', 'Zu den eigenen Stärken stehen'], mitgefuehl: ['Mitgefühl', 'Stark mitfühlen', 'Abstand zu fremdem Leid'] },
  stabilitaet: { gelassenheit: ['Sorgen', 'Sorgen loslassen', 'Sorgen früh bemerken'], ausgeglichenheit: ['Ärger', 'Ruhig bei Ärger', 'Ärger deutlich spüren'],
    grundstimmung: ['Stimmung', 'Helle Grundstimmung', 'Schwere Gefühle kennen'], selbstsicherheit: ['Unter Menschen', 'Unbefangen', 'Aufmerksam, wie du wirkst'],
    masshalten: ['Lust und Maß', 'Maß halten', 'Genuss im Moment'], belastbarkeit: ['Unter Druck', 'Ruhig unter Druck', 'Druck früh spüren'] }
};

// Fragen der Vertiefung eines Bereichs (alles außer der Startform), Facetten wechseln sich ab (Reihenfolge nach nr).
export function vertiefungsFragen(bereichId) {
  const ipip = bereichId === 'alle' ? null : BEREICH[bereichId] && BEREICH[bereichId].ipip;
  return FRAGEN.filter((q) => !q.start && (ipip === null || q.b === ipip)).sort((a, b) => a.nr - b.nr);
}
export function startFragen() { return START_REIHE.map((n) => NACH_NR[n]); }

// Vergleichswerte (T-Skala, Rohwert = Summe) – werden NICHT angezeigt. Nur noch intern: Felder wert/stufe/klar für ältere Leser
// (passt, training, textspiegel) und die Vorschläge „Genauer hinschauen“. Die Richtung in Worten kommt allein aus den eigenen Antworten.
//: aus Johnsons IPIP-NEO-120-Normtabellen (englischsprachige Online-Stichprobe,
// 8 Gruppen nach Geschlecht × Alter). Gruppen hier ohne Geschlecht: gleich gewichtete Mischung aus Männern und Frauen
// (Mittel = Mittel der Mittel; Varianz = mittlere Varianz + Streuung der Mittel). Erzeugt mit test/bigfive/normen-bauen.mjs.
// d: Bereich (24 Fragen, 24–120) · f: Facetten 1–6 (4 Fragen, 4–20) · s: Startform (6 Fragen, eine je Facette, 6–30; abgeleitet).
// r: Zuverlässigkeit (abgeleitet aus den Tabellen unter der Annahme Facetten-α = .75): r24 Bereich, rStart Startform.
export const NORMEN = /*NORMEN*/{"gruppen":{"alle":{"N":{"d":[66.72,16.46],"f":[[11.7,3.81],[11.78,4.24],[9.99,4.08],[11.98,3.77],[11.55,3.61],[9.72,3.58]],"s":[16.68,4.6]},"E":{"d":[79.78,14.55],"f":[[14.04,3.69],[11.5,3.98],[14.48,3.56],[12.49,3.28],[12.44,3.69],[14.88,3.37]],"s":[19.96,4.11]},"O":{"d":[85.04,12.82],"f":[[15.18,3.49],[15.27,3.55],[15.34,3.04],[12.66,3.35],[15.13,3.57],[11.45,3.7]],"s":[21.26,3.69]},"A":{"d":[89.84,12.96],"f":[[13.5,3.57],[16.96,2.98],[16.22,2.79],[15.43,3.83],[12.56,3.64],[14.85,3.16]],"s":[22.38,3.69]},"C":{"d":[88.81,14.74],"f":[[15.99,2.4],[12.92,4.51],[16.58,2.7],[15.91,3.28],[13.75,3.27],[13.68,4.09]],"s":[22.21,4.11]}},"u21":{"N":{"d":[70.63,15.97],"f":[[12.52,3.78],[12.51,4.34],[10.82,4.23],[12.25,3.83],[12.08,3.3],[10.47,3.53]],"s":[17.66,4.48]},"E":{"d":[82.48,15.28],"f":[[14.12,3.71],[12.68,4.17],[14.05,3.67],[12.11,3.17],[14.68,3.43],[14.88,3.58]],"s":[20.62,4.28]},"O":{"d":[87.5,12.2],"f":[[16.77,2.93],[15.22,3.73],[15.27,3.22],[12.9,3.2],[15.27,3.51],[12.02,3.1]],"s":[21.86,3.51]},"A":{"d":[85.56,14.41],"f":[[13.32,3.71],[15.48,3.26],[16.02,2.97],[13.23,4.13],[12.62,3.91],[14.83,3.23]],"s":[21.37,4.07]},"C":{"d":[80.47,14.46],"f":[[15.31,2.55],[11.04,4.05],[15.42,2.85],[14.15,3.55],[12.54,3.22],[11.95,4.02]],"s":[20.1,4.04]}},"21-40":{"N":{"d":[69.56,16.52],"f":[[12.26,3.81],[12.24,4.24],[10.58,4.1],[12.16,3.8],[12.45,3.56],[9.91,3.65]],"s":[17.4,4.61]},"E":{"d":[79.84,14.96],"f":[[13.68,3.75],[11.63,4.03],[14.42,3.6],[12.42,3.25],[13.09,3.49],[14.63,3.44]],"s":[19.97,4.2]},"O":{"d":[87.38,12.43],"f":[[15.79,3.26],[15.46,3.51],[15.51,3.09],[12.99,3.42],[15.7,3.39],[11.86,3.6]],"s":[21.82,3.59]},"A":{"d":[88.07,12.86],"f":[[12.98,3.7],[16.63,2.99],[16.09,2.83],[15.08,3.64],[12.21,3.65],[14.65,3.21]],"s":[21.91,3.68]},"C":{"d":[86.54,14.11],"f":[[15.91,2.39],[12.36,4.4],[16.02,2.67],[15.74,3.25],[13.42,3.27],[13.11,4.11]],"s":[21.64,3.97]}},"41-60":{"N":{"d":[65.75,16.15],"f":[[11.42,3.69],[11.4,4.1],[9.93,3.96],[11.96,3.68],[11.61,3.64],[9.44,3.51]],"s":[16.44,4.51]},"E":{"d":[77.84,14.27],"f":[[13.66,3.74],[10.65,3.78],[14.73,3.48],[12.65,3.4],[11.45,3.35],[14.66,3.29]],"s":[19.45,4.02]},"O":{"d":[84.6,12.93],"f":[[14.54,3.42],[15.33,3.47],[15.57,2.92],[12.64,3.45],[15.14,3.55],[11.45,3.86]],"s":[21.16,3.72]},"A":{"d":[92.03,11.46],"f":[[13.61,3.51],[17.55,2.61],[16.35,2.74],[16.34,3.19],[12.69,3.4],[15.02,3.06]],"s":[22.89,3.3]},"C":{"d":[92.36,13.19],"f":[[16.35,2.21],[13.51,4.42],[16.92,2.42],[16.84,2.85],[14.2,3.13],[14.51,3.82]],"s":[23.08,3.72]}},"60plus":{"N":{"d":[60.95,15.41],"f":[[10.6,3.66],[10.99,4.1],[8.64,3.66],[11.54,3.74],[10.06,3.47],[9.06,3.46]],"s":[15.22,4.32]},"E":{"d":[78.97,13.21],"f":[[14.7,3.45],[11.06,3.64],[14.74,3.43],[12.79,3.26],[10.56,3.08],[15.34,3.12]],"s":[19.79,3.75]},"O":{"d":[80.67,12.47],"f":[[13.61,3.46],[15.09,3.5],[15.04,2.91],[12.11,3.24],[14.41,3.69],[10.46,3.97]],"s":[20.18,3.62]},"A":{"d":[93.69,11.24],"f":[[14.08,3.26],[18.19,2.21],[16.45,2.57],[17.08,3.15],[12.73,3.55],[14.92,3.12]],"s":[23.36,3.23]},"C":{"d":[95.88,12.23],"f":[[16.41,2.28],[14.78,4.3],[17.94,2.11],[16.92,2.6],[14.84,2.96],[15.15,3.64]],"s":[24.01,3.47]}}},"r":{"N":{"r24":0.893,"rStart":0.645},"E":{"r24":0.875,"rStart":0.594},"O":{"r24":0.844,"rStart":0.51},"A":{"r24":0.86,"rStart":0.553},"C":{"r24":0.893,"rStart":0.645}},"rhoW":0.4286}/*ENDE*/;
