// M2 interessen – Fragen und Texte (reine Daten, kein DOM, kein Import → auch in Node testbar).
// Übersetzungen: eigene, „vorläufig“ (QUELLEN.md §3.2). Originalwortlaut steht in `en` nur zur Dokumentation.

// ---------- Interessen nach Holland (RIASEC) ----------
// Fragen: IIP RIASEC Markers (Armstrong, Allison & Rounds 2008), 8 je Bereich, ausgewählt aus dem O*NET Interest Profiler
// (USDOL/ETA). Lizenz-Lage: QUELLEN.md §1/§3.2 (O*NET Tools Developer License: Hinweis „geändert, nicht von USDOL/ETA geprüft“ in der App).
// k: true = Teil der Kurzform (4 je Bereich, eigene Auswahl nach Vielfalt der Tätigkeiten).
export const TYPEN = {
  R: { name: 'Praktisch-technisch', kurz: 'mit Händen, Werkzeug, Technik oder in der Natur arbeiten', satz: 'Dinge bauen, reparieren und anpacken' },
  I: { name: 'Forschend', kurz: 'verstehen, untersuchen, Rätsel lösen', satz: 'Dingen auf den Grund gehen' },
  A: { name: 'Künstlerisch-gestaltend', kurz: 'etwas Eigenes erschaffen, sich ausdrücken', satz: 'Eigenes erschaffen und gestalten' },
  S: { name: 'Sozial', kurz: 'Menschen helfen, beraten, etwas beibringen', satz: 'anderen helfen und etwas beibringen' },
  E: { name: 'Unternehmerisch', kurz: 'etwas anstoßen, andere gewinnen, führen, verkaufen', satz: 'etwas anstoßen und andere mitziehen' },
  C: { name: 'Ordnend', kurz: 'Ordnung schaffen, mit Zahlen, Listen und Abläufen', satz: 'Ordnung und klare Abläufe schaffen' }
};
export const REIHE = ['R', 'I', 'A', 'S', 'E', 'C'];   // Reihenfolge im Sechseck (Holland)

export const RIASEC = [
  { id: 'r1', typ: 'R', text: 'Teile vor dem Versand auf ihre Qualität prüfen', en: 'Test the quality of parts before shipment' },
  { id: 'r2', typ: 'R', text: 'Ziegel mauern oder Fliesen legen', en: 'Lay brick or tile' },
  { id: 'r3', typ: 'R', text: 'Auf einer Bohrinsel im Meer arbeiten', en: 'Work on an offshore oil-drilling rig' },
  { id: 'r4', typ: 'R', k: true, text: 'Elektronische Bauteile zusammenbauen', en: 'Assemble electronic parts' },
  { id: 'r5', typ: 'R', text: 'Einen Bauernhof mit Milchkühen führen', en: 'Operate a dairy farm' },
  { id: 'r6', typ: 'R', k: true, text: 'Einen kaputten Wasserhahn reparieren', en: 'Fix a broken faucet' },
  { id: 'r7', typ: 'R', k: true, text: 'Fische in einer Fischzucht aufziehen', en: 'Raise fish in a fish hatchery' },
  { id: 'r8', typ: 'R', k: true, text: 'Einen gepflasterten Gartenweg bauen', en: 'Build a brick walkway' },
  { id: 'i1', typ: 'I', k: true, text: 'Erforschen, wie der menschliche Körper aufgebaut ist', en: 'Study the structure of the human body' },
  { id: 'i2', typ: 'I', text: 'Das Verhalten von Tieren erforschen', en: 'Study animal behavior' },
  { id: 'i3', typ: 'I', text: 'Pflanzen oder Tiere wissenschaftlich untersuchen', en: 'Do research on plants or animals' },
  { id: 'i4', typ: 'I', k: true, text: 'Eine neue medizinische Behandlung entwickeln', en: 'Develop a new medical treatment or procedure' },
  { id: 'i5', typ: 'I', text: 'In der Biologie forschen', en: 'Conduct biological research' },
  { id: 'i6', typ: 'I', k: true, text: 'Wale und andere Meerestiere erforschen', en: 'Study whales and other types of marine life' },
  { id: 'i7', typ: 'I', text: 'In einem Biologie-Labor arbeiten', en: 'Work in a biology lab' },
  { id: 'i8', typ: 'I', k: true, text: 'Eine Karte vom Meeresboden erstellen', en: 'Make a map of the bottom of an ocean' },
  { id: 'a1', typ: 'A', text: 'Einen Chor leiten', en: 'Conduct a musical choir' },
  { id: 'a2', typ: 'A', k: true, text: 'Bei einem Theaterstück Regie führen', en: 'Direct a play' },
  { id: 'a3', typ: 'A', k: true, text: 'Bilder und Grafiken für Zeitschriften gestalten', en: 'Design artwork for magazines' },
  { id: 'a4', typ: 'A', k: true, text: 'Einen Song schreiben', en: 'Write a song' },
  { id: 'a5', typ: 'A', k: true, text: 'Bücher oder Theaterstücke schreiben', en: 'Write books or plays' },
  { id: 'a6', typ: 'A', text: 'Ein Instrument spielen', en: 'Play a musical instrument' },
  { id: 'a7', typ: 'A', text: 'Stunts für einen Film oder eine Fernsehsendung machen', en: 'Perform stunts for a movie or television show' },
  { id: 'a8', typ: 'A', text: 'Bühnenbilder für Theaterstücke entwerfen', en: 'Design sets for plays' },
  { id: 's1', typ: 'S', k: true, text: 'Menschen bei der Berufswahl beraten', en: 'Give career guidance to people' },
  { id: 's2', typ: 'S', text: 'Ehrenamtlich in einem gemeinnützigen Verein mitarbeiten', en: 'Do volunteer work at a non-profit organization' },
  { id: 's3', typ: 'S', text: 'Menschen helfen, die Probleme mit Drogen oder Alkohol haben', en: 'Help people who have problems with drugs or alcohol' },
  { id: 's4', typ: 'S', k: true, text: 'Jemandem ein Trainingsprogramm beibringen', en: 'Teach an individual an exercise routine' },
  { id: 's5', typ: 'S', k: true, text: 'Menschen bei Problemen in der Familie helfen', en: 'Help people with family-related problems' },
  { id: 's6', typ: 'S', text: 'In einem Ferienlager Kinder betreuen', en: 'Supervise the activities of children at a camp' },
  { id: 's7', typ: 'S', k: true, text: 'Kindern das Lesen beibringen', en: 'Teach children how to read' },
  { id: 's8', typ: 'S', text: 'Älteren Menschen im Alltag helfen', en: 'Help elderly people with their daily activities' },
  { id: 'e1', typ: 'E', text: 'Lizenzen für eine Restaurant-Kette an Gründer verkaufen', en: 'Sell restaurant franchises to individuals' },
  { id: 'e2', typ: 'E', text: 'In einem Kaufhaus Waren verkaufen', en: 'Sell merchandise at a department store' },
  { id: 'e3', typ: 'E', k: true, text: 'Ein Hotel leiten', en: 'Manage the operations of a hotel' },
  { id: 'e4', typ: 'E', k: true, text: 'Einen eigenen Friseur- oder Kosmetiksalon führen', en: 'Operate a beauty salon or barber shop' },
  { id: 'e5', typ: 'E', k: true, text: 'Eine Abteilung in einer großen Firma leiten', en: 'Manage a department within a large company' },
  { id: 'e6', typ: 'E', text: 'Ein Bekleidungsgeschäft leiten', en: 'Manage a clothing store' },
  { id: 'e7', typ: 'E', k: true, text: 'Häuser verkaufen', en: 'Sell houses' },
  { id: 'e8', typ: 'E', text: 'Einen Spielzeugladen führen', en: 'Run a toy store' },
  { id: 'c1', typ: 'C', k: true, text: 'Für ein Büro die monatlichen Gehaltsabrechnungen erstellen', en: 'Generate the monthly payroll checks for an office' },
  { id: 'c2', typ: 'C', k: true, text: 'Mit einem Handscanner den Lagerbestand erfassen', en: 'Inventory supplies using a hand-held computer' },
  { id: 'c3', typ: 'C', text: 'Mit einem Computerprogramm Rechnungen für Kunden erstellen', en: 'Use a computer program to generate customer bills' },
  { id: 'c4', typ: 'C', text: 'Die Personalakten einer Firma führen', en: 'Maintain employee records' },
  { id: 'c5', typ: 'C', k: true, text: 'Statistiken und andere Zahlen berechnen und festhalten', en: 'Compute and record statistical and other numerical data' },
  { id: 'c6', typ: 'C', text: 'Mit dem Taschenrechner Zahlen ausrechnen', en: 'Operate a calculator' },
  { id: 'c7', typ: 'C', text: 'Für Kunden einer Bank Überweisungen und Buchungen erledigen', en: "Handle customers' bank transactions" },
  { id: 'c8', typ: 'C', k: true, text: 'Listen über ein- und ausgehende Lieferungen führen', en: 'Keep shipping and receiving records' }
];
// Abwechselnd R, I, A, S, E, C – erst die Kurzform, dann die übrigen (für „Genauer machen“).
function mische(liste) {
  const nachTyp = Object.fromEntries(REIHE.map((t) => [t, liste.filter((f) => f.typ === t)]));
  const aus = []; let rest = true;
  for (let i = 0; rest; i++) { rest = false; for (const t of REIHE) if (nachTyp[t][i]) { aus.push(nachTyp[t][i]); rest = true; } }
  return aus;
}
export const RIASEC_KURZ = mische(RIASEC.filter((f) => f.k));
export const RIASEC_REST = mische(RIASEC.filter((f) => !f.k));
export const SKALA_GERN = [
  { wert: 1, text: 'gar nicht gern' }, { wert: 2, text: 'eher nicht gern' }, { wert: 3, text: 'weiß nicht / egal' },
  { wert: 4, text: 'eher gern' }, { wert: 5, text: 'sehr gern' }
];
export const RIASEC_HILFE = 'Wie gern würdest du das tun? Egal, ob du es kannst.';

// Tätigkeiten und Projekte je Bereich (Stufe „Idee“) – bewusst nicht nur Berufe: Musik, Gestalten, Lernen, Inhalte im Netz.
export const IDEEN = {
  R: ['Ein Instrument, Effektgerät oder Möbelstück selbst bauen oder umbauen', 'Studio, Kamera und Licht selbst aufbauen und verkabeln',
    'Etwas reparieren statt neu kaufen – und das Vorher und Nachher zeigen', 'Kochen, Gärtnern, Sport: Tätigkeiten, bei denen du am Ende etwas siehst',
    'Löten, 3D-Druck oder Elektronik-Bausätze ausprobieren'],
  I: ['Ein Thema richtig tief recherchieren und es in einfachen Worten erklären', 'Kleine Versuche machen: Wie ändert sich ein Klang, wenn …? Was hilft dir beim Lernen wirklich?',
    'Mythen prüfen („Stimmt das eigentlich?“) – mit Quellen', 'Eigene Zahlen sammeln und auswerten, z. B. Übezeit, Schlaf oder Aufrufe',
    'Musiktheorie, eine Sprache oder ein Programm Schritt für Schritt lernen'],
  A: ['Songs schreiben, Beats bauen, eigene Klänge entwerfen', 'Cover, Logos und kurze Videos gestalten und schneiden',
    'Geschichten, Texte oder Gedichte schreiben', 'Eine Reihe mit eigenem Stil starten, z. B. jede Woche ein neues Stück',
    'Aus Vorhandenem etwas Neues machen: Remix, Collage, Sampling'],
  S: ['Anderen etwas beibringen: Anleitung, Nachhilfe, kleiner Kurs', 'Fragen von Leuten beantworten, die dir folgen',
    'Jüngere begleiten (Mentoring) oder ehrenamtlich helfen', 'Gemeinsame Projekte: Chor, Band, Gruppen-Aufgabe',
    'Gesprächs-Formate: zuhören, nachfragen, Interviews führen'],
  E: ['Ein kleines eigenes Angebot starten und verkaufen, z. B. Beats, Merch oder einen Kurs', 'Live-Formate moderieren und Gäste einladen',
    'Zusammenarbeit anfragen und Auftritte organisieren', 'Ein Team für ein Projekt zusammenstellen und leiten',
    'Ziele setzen und messen: Verkäufe, Zuschauer, Anfragen'],
  C: ['Einen Plan oder Kalender für deine Projekte führen', 'Sammlungen ordnen: Klänge, Fotos, Notizen mit klaren Namen',
    'Checklisten und Vorlagen bauen, die dir Zeit sparen', 'Einnahmen und Ausgaben im Blick behalten',
    'Vergleiche und Listen erstellen, z. B. „Die 10 besten …“ – sauber belegt']
};
// Verbindungen der zwei stärksten Bereiche (Schlüssel in Sechseck-Reihenfolge R I A S E C), Stufe „Idee“.
export const PAARE = {
  RI: 'Technik verstehen und bauen: Elektronik, Tontechnik, Geräte programmieren.',
  RA: 'Handwerk mit Gestaltung verbinden: Instrumente, Bühnen, Kulissen oder Möbel bauen.',
  RS: 'Praktisch helfen: Sport-Training, Reparatur-Treff, gemeinsam etwas bauen.',
  RE: 'Ein handfestes Angebot: Technik-Service, Handwerk oder Geräte verkaufen.',
  RC: 'Genaue Technik-Arbeit: messen, prüfen, einrichten und sauber festhalten.',
  IA: 'Kunst und Musik erklären: wie ein Song gebaut ist, warum ein Klang wirkt.',
  IS: 'Erklären und beraten: Lern-Tipps, Nachhilfe, Wissens-Formate mit Fragen der Zuschauer.',
  IE: 'Ein Thema gründlich verstehen und daraus ein Angebot machen, z. B. einen Kurs.',
  IC: 'Zahlen auswerten: Statistiken, Vergleiche, sauber belegte Listen.',
  AS: 'Mit anderen kreativ sein: Kurse geben, gemeinsam Musik machen, anderen beim Gestalten helfen.',
  AE: 'Eine eigene Marke aufbauen: Musik oder Kunst veröffentlichen, bekannt machen, Auftritte planen.',
  AC: 'Gestalten mit System: geplante Reihen, Vorlagen, Gestaltungsregeln, ein gepflegtes Archiv.',
  SE: 'Gemeinschaft aufbauen und leiten: Live-Gespräche, Gruppen, Veranstaltungen.',
  SC: 'Für andere organisieren: Abläufe planen, Termine abstimmen, Anleitungen schreiben.',
  EC: 'Projekte führen: Zahlen, Planung und Verkauf zusammenbringen.'
};
// Wörter je Stufe (−2…2) – ohne Vergleich mit anderen (Skala „pomp“: es gibt noch keine deutschen Vergleichswerte).
export const WORT_INTERESSE = { '-2': 'zieht dich kaum an', '-1': 'zieht dich eher wenig an', '0': 'teils, teils', '1': 'zieht dich eher an', '2': 'zieht dich stark an' };

// ---------- Ehrlichkeit-Bescheidenheit ----------
// IPIP-Fragen zu den vier Teilen nach HEXACO (angelehnt an die IPIP-HEXACO-Skalen, Ashton, Lee & Goldberg 2007; gemeinfrei).
// u: true = umgepolt (Zustimmung heißt weniger Ehrlichkeit-Bescheidenheit). Wortlaut-Zuordnung vor Veröffentlichung prüfen (QUELLEN.md).
export const FACETTEN = {
  aufrichtigkeit: { name: 'Aufrichtigkeit', kurz: 'nicht schmeicheln, nicht tricksen' },
  fairness: { name: 'Fairness', kurz: 'nicht schummeln, nichts nehmen, was dir nicht zusteht' },
  genuegsamkeit: { name: 'Genügsamkeit', kurz: 'Geld, Luxus und Status sind dir weniger wichtig' },
  bescheidenheit: { name: 'Bescheidenheit', kurz: 'dich nicht über andere stellen' }
};
export const EHRLICHKEIT = [
  { id: 'h1', f: 'aufrichtigkeit', text: 'Ich mache mich nicht größer, als ich bin.', en: "Don't pretend to be more than I am." },
  { id: 'h4', f: 'fairness', text: 'Ich würde nie etwas nehmen, das mir nicht gehört.', en: "Would never take things that aren't mine." },
  { id: 'h7', f: 'genuegsamkeit', u: true, text: 'Ich liebe Luxus.', en: 'Love luxury.' },
  { id: 'h10', f: 'bescheidenheit', text: 'Ich prahle selten mit dem, was ich kann.', en: 'Seldom toot my own horn.' },
  { id: 'h2', f: 'aufrichtigkeit', u: true, text: 'Ich schmeichle anderen, um weiterzukommen.', en: 'Use flattery to get ahead.' },
  { id: 'h5', f: 'fairness', text: 'Bekomme ich an der Kasse zu viel Wechselgeld, sage ich Bescheid.', en: 'Return extra change when a cashier makes a mistake.' },
  { id: 'h8', f: 'genuegsamkeit', u: true, text: 'Mir geht es vor allem ums Geld.', en: 'Am mainly interested in money.' },
  { id: 'h11', f: 'bescheidenheit', u: true, text: 'Ich glaube, dass ich besser bin als andere.', en: 'Believe that I am better than others.' },
  { id: 'h3', f: 'aufrichtigkeit', u: true, text: 'Ich sage anderen, was sie hören wollen, damit sie tun, was ich will.', en: 'Tell other people what they want to hear so that they will do what I want them to do.' },
  { id: 'h6', f: 'fairness', u: true, text: 'Ich schummle, um weiterzukommen.', en: 'Cheat to get ahead.' },
  { id: 'h9', f: 'genuegsamkeit', u: true, text: 'Ich würde gern in einem sehr teuren Auto gesehen werden.', en: 'Would like to be seen driving around in a very expensive car.' },
  { id: 'h12', f: 'bescheidenheit', u: true, text: 'Ich prahle mit meinen guten Seiten.', en: 'Boast about my virtues.' }
];
export const WORT_EHRLICH = {
  '-2': 'deutlich auf der Seite „eigener Vorteil“', '-1': 'eher auf der Seite „eigener Vorteil“', '0': 'in der Mitte',
  '1': 'eher auf der Seite „fair und bescheiden“', '2': 'deutlich auf der Seite „fair und bescheiden“'
};

// ---------- Tagesrhythmus (eigene Fragen, Rechnung angelehnt an Roenneberg u. a. 2003) ----------
export const TYP_WORT = { frueh: 'Morgentyp', 'eher-frueh': 'eher Morgentyp', mittel: 'weder früh noch spät', 'eher-spaet': 'eher Abendtyp', spaet: 'Abendtyp' };
// Grenzen der korrigierten Schlafmitte an freien Tagen (Stunden nach Mitternacht) – eigene Einteilung, grob ±1 Streuung um das Mittel.
export const TYP_GRENZEN = [['frueh', 2.5], ['eher-frueh', 3.5], ['mittel', 5], ['eher-spaet', 6], ['spaet', Infinity]];
// Selbstauskunft „Wann kannst du dich am besten konzentrieren?“ (eigene Frage) → Uhrzeit-Bereich.
export const SELBST = [
  { wert: 'frueh', text: 'früh morgens', von: 5, bis: 9 }, { wert: 'vormittag', text: 'am Vormittag', von: 9, bis: 12 },
  { wert: 'nachmittag', text: 'am Nachmittag', von: 12, bis: 17 }, { wert: 'abend', text: 'am Abend', von: 17, bis: 21 },
  { wert: 'nacht', text: 'spät abends oder nachts', von: 21, bis: 26 }, { wert: 'weiss-nicht', text: 'weiß ich nicht' }
];
