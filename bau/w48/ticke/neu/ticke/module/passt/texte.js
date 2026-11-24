// M4 passt – Texte für Profil-Karte und „Was passt zu mir“ (reine Daten, kein DOM, kein Import → in Node testbar).
// Regeln (ARCH.md §5, KONZEPT §2.6 und §3): nur die Seite zeigen, zu der die Person neigt (keine zweiseitigen Barnum-Sätze),
// jede Stärke mit der Stelle, wo sie reiben kann, jede Aussage mit Stufe (belegt/abgeleitet/idee) und Quelle, „Was das nicht heißt“ je Abschnitt.
// KEINE Bewertung (Wunsch Xander 24.11.2026): keine Zahlen, Prozente, Ränge, kein „höher/niedriger als die meisten“, kein richtig/falsch.
// Jede Richtung hat zwei gleichwertige Pole, beide mit Stärken beschrieben. Abstufung nur in Worten: klar / leicht / beides.
// Schlüssel '1' = die eine Seite (rechter Pol), '-1' = die andere Seite (linker Pol) des Bereichs (Stabilität: '1' = gelassen).

export const BEREICHE = [
  { id: 'offenheit', name: 'Offenheit', links: 'Halt im Bewährten', rechts: 'Neugier auf Neues',
    satz: { 1: 'du gehst gern Neuem nach', '-1': 'du hältst dich gern an Bewährtes' },
    adj: { 1: 'neugierig', '-1': 'bodenständig' }, nomen: { 1: ['Ideenkopf', 'm'], '-1': ['Praxismensch', 'm'] } },
  { id: 'gewissenhaftigkeit', name: 'Gewissenhaftigkeit', links: 'Spontan und beweglich', rechts: 'Geplant und gründlich',
    satz: { 1: 'du planst gern und gehst gründlich vor', '-1': 'du bleibst gern spontan und beweglich' },
    adj: { 1: 'planvoll', '-1': 'spontan' }, nomen: { 1: ['Planungstalent', 'n'], '-1': ['Improvisationstalent', 'n'] } },
  { id: 'extraversion', name: 'Extraversion', links: 'Ruhig und bei dir', rechts: 'Gesellig und aktiv',
    satz: { 1: 'unter Leuten tankst du auf', '-1': 'in Ruhe tankst du auf' },
    adj: { 1: 'gesellig', '-1': 'ruhig' }, nomen: { 1: ['Kontaktmensch', 'm'], '-1': ['Ruhepol', 'm'] } },
  { id: 'vertraeglichkeit', name: 'Verträglichkeit', links: 'Direkt und klar', rechts: 'Rücksichtsvoll und mitfühlend',
    satz: { 1: 'du gehst rücksichtsvoll auf andere ein', '-1': 'du sagst direkt, was du denkst' },
    adj: { 1: 'warmherzig', '-1': 'direkt' }, nomen: { 1: ['Herzensmensch', 'm'], '-1': ['Klartextmensch', 'm'] } },
  { id: 'stabilitaet', name: 'Emotionale Stabilität', links: 'Feinfühlig und wachsam', rechts: 'Gelassen und robust',
    satz: { 1: 'Druck bringt dich selten aus der Ruhe', '-1': 'du spürst Stimmungen und Druck früh und fein' },
    adj: { 1: 'gelassen', '-1': 'empfindsam' }, nomen: { 1: ['Fels in der Brandung', 'm'], '-1': ['Seismograf', 'm'] } }
];
export const BEREICH = Object.fromEntries(BEREICHE.map((b) => [b.id, b]));
// Facetten-Namen (Schlüssel wie ARCH.md §3.3), nur für Anzeige
export const FACETTE_NAME = {
  'offenheit.fantasie': 'Fantasie', 'offenheit.kunst': 'Sinn für Kunst', 'offenheit.gefuehle': 'Gefühle wahrnehmen', 'offenheit.abenteuer': 'Abenteuerlust', 'offenheit.intellekt': 'Denklust', 'offenheit.liberalitaet': 'Werte hinterfragen',
  'gewissenhaftigkeit.selbstwirksamkeit': 'Zutrauen', 'gewissenhaftigkeit.ordnung': 'Ordnung', 'gewissenhaftigkeit.pflichtgefuehl': 'Pflichtgefühl', 'gewissenhaftigkeit.leistungsstreben': 'Ehrgeiz', 'gewissenhaftigkeit.selbstdisziplin': 'Selbstdisziplin', 'gewissenhaftigkeit.besonnenheit': 'Besonnenheit',
  'extraversion.freundlichkeit': 'Herzlichkeit', 'extraversion.geselligkeit': 'Geselligkeit', 'extraversion.durchsetzung': 'Durchsetzung', 'extraversion.aktivitaet': 'Tempo', 'extraversion.erlebnishunger': 'Erlebnishunger', 'extraversion.frohsinn': 'Frohsinn',
  'vertraeglichkeit.vertrauen': 'Vertrauen', 'vertraeglichkeit.aufrichtigkeit': 'Aufrichtigkeit', 'vertraeglichkeit.hilfsbereitschaft': 'Hilfsbereitschaft', 'vertraeglichkeit.kooperation': 'Entgegenkommen', 'vertraeglichkeit.bescheidenheit': 'Bescheidenheit', 'vertraeglichkeit.mitgefuehl': 'Mitgefühl',
  'stabilitaet.gelassenheit': 'Gelassenheit', 'stabilitaet.ausgeglichenheit': 'Ausgeglichenheit', 'stabilitaet.grundstimmung': 'Grundstimmung', 'stabilitaet.selbstsicherheit': 'Selbstsicherheit', 'stabilitaet.masshalten': 'Maß halten', 'stabilitaet.belastbarkeit': 'Belastbarkeit'
};

// Interessen (RIASEC): eigene kurze Namen – das Modul liest Ergebnisse nur aus dem Speicher, nicht aus dem Code von M2.
export const RIASEC = {
  R: { name: 'Praktisch-technisch', adj: 'praktisch-technische', taetigkeit: 'Dinge bauen, reparieren und Technik einrichten – Studio, Licht, Instrumente, Elektronik.', rolle: 'die Person, die Dinge zum Laufen bringt', projekt: 'ein Gerät, Möbelstück oder Instrument bauen oder umbauen' },
  I: { name: 'Forschend', adj: 'forschende', taetigkeit: 'Dingen auf den Grund gehen: recherchieren, testen, vergleichen, Behauptungen prüfen.', rolle: 'die Person, die nachprüft und erklärt, warum etwas so ist', projekt: 'eine Frage gründlich klären und das Ergebnis anderen erklären' },
  A: { name: 'Künstlerisch-gestaltend', adj: 'künstlerisch-gestaltende', taetigkeit: 'Eigenes erschaffen: Songs, Videos, Bilder, Texte, Design.', rolle: 'die Person mit den Ideen und dem Blick für Gestaltung', projekt: 'ein Werk fertigstellen – einen Song, eine Bilder-Serie oder ein kurzes Video' },
  S: { name: 'Sozial', adj: 'soziale', taetigkeit: 'Menschen helfen und etwas beibringen: erklären, begleiten, Fragen beantworten.', rolle: 'die Person, an die sich andere wenden', projekt: 'jemandem etwas beibringen, das du gut kannst' },
  E: { name: 'Unternehmerisch', adj: 'unternehmerische', taetigkeit: 'Etwas anstoßen und andere mitziehen: Projekte starten, überzeugen, Leute zusammenbringen.', rolle: 'die Person, die vorangeht und entscheidet', projekt: 'eine kleine Aktion starten, für die du andere gewinnst' },
  C: { name: 'Ordnend', adj: 'ordnende', taetigkeit: 'Ordnung schaffen: Abläufe, Listen, Zahlen, Planung.', rolle: 'die Person, die den Überblick behält', projekt: 'einen Bereich deines Lebens ordnen – Dateien, Geld oder Zeitplan' }
};

// ---------- Stärken – immer mit der Stelle, wo sie reiben kann (Feld kosten) ----------
export const STAERKEN = {
  offenheit: {
    1: { text: 'Du gehst neuen Ideen gern nach und verbindest Dinge, die andere getrennt sehen.', stufe: 'abgeleitet', quellen: ['feist1998'],
      kosten: { text: 'Routine langweilt dich schnell – auch dann, wenn sie gerade dran wäre.', stufe: 'idee' } },
    '-1': { text: 'Du hältst dich an das, was sich bewährt hat, und verlierst dich nicht in Gedankenspielen.', stufe: 'idee', quellen: ['nettle2006'],
      kosten: { text: 'Ganz neue Wege, offene Fragen und schnelle Wechsel fühlen sich erst einmal fremd an.', stufe: 'idee' } }
  },
  gewissenhaftigkeit: {
    1: { text: 'Du planst, bleibst dran und hältst, was du zusagst.', stufe: 'abgeleitet', quellen: ['barrick1991', 'poropat2009'],
      kosten: { text: 'Spontane Änderungen und Halbfertiges stressen dich; manchmal planst du länger, als nötig wäre.', stufe: 'idee' } },
    '-1': { text: 'Du kannst schnell umschwenken und improvisieren, wenn Pläne platzen.', stufe: 'idee', quellen: ['nettle2006'],
      kosten: { text: 'Lange Aufgaben ohne feste Fristen bleiben leichter liegen – Aufschieben hängt eng mit diesem Bereich zusammen.', stufe: 'belegt', quellen: ['steel2007'] } }
  },
  extraversion: {
    1: { text: 'Du kommst leicht ins Gespräch und bringst Schwung in Gruppen.', stufe: 'abgeleitet', quellen: ['nettle2006'],
      kosten: { text: 'Lange allein und still zu arbeiten kostet dich viel Kraft.', stufe: 'idee' } },
    '-1': { text: 'Du kannst lange bei einer Sache bleiben, gut zuhören und brauchst wenig Trubel, um zufrieden zu sein.', stufe: 'idee', quellen: ['nettle2006'],
      kosten: { text: 'Viel Trubel, lange Live-Formate und ständiger Kontakt kosten dich viel Kraft.', stufe: 'abgeleitet', quellen: ['jacqueshamilton2019'] } }
  },
  vertraeglichkeit: {
    1: { text: 'Du bist hilfsbereit, fair und kannst gut zwischen Menschen ausgleichen.', stufe: 'abgeleitet', quellen: ['nettle2006'],
      kosten: { text: 'Eigene Wünsche kommen leicht zu kurz; beim Verhandeln holst du eher weniger für dich heraus.', stufe: 'abgeleitet', quellen: ['judge2012'] } },
    '-1': { text: 'Du sagst klar, was du denkst, und lässt dich nicht leicht ausnutzen.', stufe: 'idee', quellen: ['nettle2006'],
      kosten: { text: 'Andere erleben dich schneller als hart oder kühl – auch wenn du es nicht so meinst.', stufe: 'idee' } }
  },
  stabilitaet: {
    1: { text: 'Unter Druck bleibst du eher ruhig und fängst dich nach Rückschlägen schnell wieder.', stufe: 'abgeleitet', quellen: ['steel2008'],
      kosten: { text: 'Warnzeichen – bei dir oder bei anderen – nimmst du vielleicht später ernst als nötig.', stufe: 'idee' } },
    '-1': { text: 'Du spürst früh, wenn etwas nicht stimmt, und nimmst Gefühle ernst – deine eigenen und die anderer.', stufe: 'idee', quellen: ['nettle2006'],
      kosten: { text: 'Stress, Ärger und Sorgen treffen dich stärker und halten länger an.', stufe: 'abgeleitet', quellen: ['steel2008'] } }
  },
  ehrlichkeit: {
    1: { text: 'Fairness ist dir wichtig – auch dort, wo du andere ausnutzen könntest. In Studien zeigt sich das bei Menschen mit Antworten wie deinen auch im Handeln.', stufe: 'belegt', quellen: ['thielmann2020'],
      kosten: { text: 'Du verkaufst dich leicht unter Wert und forderst wenig für dich.', stufe: 'idee' } },
    '-1': { text: 'Du setzt dich für deinen eigenen Vorteil ein und lässt dich nicht mit wenig abspeisen.', stufe: 'idee', quellen: ['nettle2006'],
      kosten: { text: 'Wenn andere merken, dass du vor allem auf dich schaust, sinkt ihr Vertrauen.', stufe: 'abgeleitet', quellen: ['thielmann2020'] } }
  },
  interesse: { text: (name) => `${name} zieht dich an. Was zu den eigenen Interessen passt, machen Menschen im Mittel besser und bleiben länger dabei.`, stufe: 'belegt', quellen: ['nye2012'],
    kosten: { text: 'Was nicht dazu passt, fühlt sich schnell zäh an – auch wenn es nötig ist.', stufe: 'idee' } },
  spaet: { text: 'Abends bist du noch wach und klar, wenn andere müde werden.', stufe: 'abgeleitet', quellen: ['roenneberg2003'],
    kosten: { text: 'Frühe Termine kosten dich leicht Schlaf – dein Körper möchte später schlafen, als der Wecker erlaubt (Fachwort: „sozialer Jetlag“).', stufe: 'belegt', quellen: ['wittmann2006'] } },
  frueh: { text: 'Morgens bist du schnell wach und kannst früh viel schaffen.', stufe: 'abgeleitet', quellen: ['roenneberg2003'],
    kosten: { text: 'Späte Abende und lange Nächte kosten dich viel Kraft.', stufe: 'abgeleitet', quellen: ['roenneberg2003'] } }
};

// ---------- Arbeitsweise ----------
export const ARBEIT = {
  gewissenhaftigkeit: { titel: 'Struktur oder Freiraum',
    1: { text: 'Struktur hilft dir: Plane mit Listen, festen Zeiten und klaren Zwischenzielen – so spielst du deine Stärke aus.', stufe: 'abgeleitet', quellen: ['barrick1991'] },
    '-1': { text: 'Freiraum liegt dir mehr als enge Pläne. Damit du trotzdem fertig wirst: kurze Etappen mit festen Fristen, am besten mit jemandem, der nachfragt.', stufe: 'abgeleitet', quellen: ['steel2007'] } },
  extraversion: { titel: 'Allein oder im Team',
    1: { text: 'Du arbeitest gern mit anderen und tankst im Austausch auf: Plane Gespräche, gemeinsames Arbeiten und lautes Durchdenken fest ein.', stufe: 'abgeleitet', quellen: ['soto2019'] },
    '-1': { text: 'Du arbeitest gut allein und tankst in Ruhe auf: Leg schwere Aufgaben in ungestörte Blöcke, Absprachen lieber kurz und geplant.', stufe: 'abgeleitet', quellen: ['jacqueshamilton2019'] } },
  stabilitaet: { titel: 'Druck und Fristen',
    1: { text: 'Druck bringt dich selten aus dem Takt. Aufgaben mit Zeitdruck oder Überraschungen kannst du gut übernehmen.', stufe: 'abgeleitet', quellen: ['soto2019'] },
    '-1': { text: 'Druck kostet dich viel Kraft. Plane Puffer ein, teile Großes in kleine Schritte und übe wichtige Situationen vorher in einem Probe-Durchlauf.', stufe: 'abgeleitet', quellen: ['dunlosky2013'] } },
  offenheit: { titel: 'Neues oder Bewährtes',
    1: { text: 'Neues treibt dich an: Wechsle zwischen Aufgaben, starte mit einer Frage, die dich neugierig macht, probier neue Werkzeuge.', stufe: 'abgeleitet', quellen: ['feist1998'] },
    '-1': { text: 'Bewährtes trägt dich: Verbessere Schritt für Schritt, was schon läuft, statt ständig neu anzufangen.', stufe: 'idee' } },
  vertraeglichkeit: { titel: 'Zusammenarbeit oder Wettbewerb',
    1: { text: 'Zusammenarbeit liegt dir mehr als Wettbewerb. Wenn es ums Verhandeln geht: vorher aufschreiben, was du willst, und dabei bleiben.', stufe: 'abgeleitet', quellen: ['judge2012'] },
    '-1': { text: 'Wettbewerb und klare Ansagen liegen dir. In Teams hilft: Kritik an der Sache festmachen, nicht an der Person.', stufe: 'abgeleitet', quellen: ['antonioni1998'] } }
};
export const LERNEN = {
  alle: { text: 'Am meisten bringt beim Lernen: dich selbst abfragen und über mehrere Tage verteilt üben. Markieren und bloßes Wiederlesen bringen wenig.', stufe: 'belegt', quellen: ['dunlosky2013'] },
  stile: { text: '„Lernstile“ (visuell, auditiv …) sind nicht belegt – die App bietet sie darum nicht an.', stufe: 'belegt', quellen: ['pashler2008'] },
  gewissenhaftigkeit: { '-1': { text: 'Für dich: kurze, feste Lern-Einheiten (etwa 20 Minuten) mit Erinnerung.', stufe: 'abgeleitet', quellen: ['steel2007'] } },
  offenheit: { 1: { text: 'Für dich: mit einer Frage einsteigen, die dich wirklich interessiert.', stufe: 'idee' } },
  extraversion: { 1: { text: 'Für dich: anderen erklären oder euch gegenseitig abfragen.', stufe: 'idee' } },
  stabilitaet: { '-1': { text: 'Für dich: Probe-Prüfungen unter echten Bedingungen – das nimmt der echten Prüfung den Schrecken.', stufe: 'abgeleitet', quellen: ['dunlosky2013'] } }
};

// ---------- Wofür du geeignet bist ----------
export const GEEIGNET = {
  passung: { text: 'Wer Tätigkeiten macht, die zu den eigenen Interessen passen, leistet im Mittel mehr und bleibt eher dabei.', stufe: 'belegt', quellen: ['nye2012'] },
  koennen: { text: 'Was dich anzieht, musst du noch nicht können: Interessen und Fähigkeiten hängen nur mäßig zusammen.', stufe: 'belegt', quellen: ['ackerman1997'] },
  bereiche: {
    extraversion: { 1: { text: 'Rollen mit Menschen liegen dir nahe: vorne stehen, moderieren, eine Gruppe anführen.', stufe: 'abgeleitet', quellen: ['judge2002'] },
      '-1': { text: 'Rollen mit Tiefe liegen dir nahe: recherchieren, bauen, schreiben, schneiden – lieber gut vorbereitet als spontan vor Publikum.', stufe: 'idee' } },
    gewissenhaftigkeit: { 1: { text: 'Langfristige Projekte und Verantwortung für Abläufe: Dinge, die über Monate wachsen.', stufe: 'abgeleitet', quellen: ['barrick1991'] },
      '-1': { text: 'Kurze, abwechslungsreiche Projekte – mit einem kleinen Vorrat für Tage ohne Schwung.', stufe: 'idee' } },
    offenheit: { 1: { text: 'Projekte, bei denen du etwas Eigenes erfindest oder Neues ausprobierst.', stufe: 'abgeleitet', quellen: ['feist1998'] },
      '-1': { text: 'Aufgaben, bei denen Sorgfalt und bewährtes Können zählen: Handwerk, Pflegen, Verbessern.', stufe: 'idee' } },
    vertraeglichkeit: { 1: { text: 'Aufgaben, bei denen Vertrauen zählt: begleiten, vermitteln, ein Team zusammenhalten.', stufe: 'idee' },
      '-1': { text: 'Aufgaben, bei denen klare Worte zählen: verhandeln, prüfen, ehrliche Rückmeldung geben.', stufe: 'idee' } },
    stabilitaet: { 1: { text: 'Aufgaben mit Druck: live, mit Terminen, mit schnellen Entscheidungen.', stufe: 'idee' },
      '-1': { text: 'Aufgaben, bei denen Feingefühl zählt: merken, wie es anderen geht, Stimmungen auffangen – mit Pausen danach.', stufe: 'idee' } }
  },
  // Format-Ideen für Inhalte im Netz (KONZEPT §2.6) – alle „Idee“; Reichweite ist nicht erforscht.
  formate: [
    { wenn: { interesse: 'A', offenheit: 1 }, text: 'Making-of: zeigen, wie aus nichts etwas entsteht – Song, Bild, Video.' },
    { wenn: { interesse: 'I', offenheit: 1 }, text: 'Erklär-Videos und Mythen-Checks („Stimmt das wirklich?“).' },
    { wenn: { interesse: 'S', vertraeglichkeit: 1 }, text: 'Fragen der Community beantworten, Hilfe-Formate.' },
    { wenn: { interesse: 'E', extraversion: 1 }, text: 'Live-Talk, Challenges, Interviews.' },
    { wenn: { extraversion: -1 }, text: 'Vorproduzierte Videos, Stimme aus dem Off; Lives kürzer und seltener planen.' },
    { wenn: { gewissenhaftigkeit: 1 }, text: 'Eine Serie mit festem Plan – zum Beispiel jede Woche dasselbe Format.' },
    { wenn: { gewissenhaftigkeit: -1 }, text: 'Spontane Formate – aber einen Vorrat von drei fertigen Beiträgen anlegen.' },
    { wenn: { interesse: 'R' }, text: 'Technik und Handwerk zeigen: Aufbau, Reparatur, vorher und nachher.' },
    { wenn: { interesse: 'C' }, text: 'Listen, Anleitungen und Vergleiche.' }
  ],
  reichweite: 'Ob passende Formate besser ankommen, ist nicht erforscht. Probier aus, welches sich für dich stimmig anfühlt.'
};

// ---------- Umgang mit dir selbst ----------
export const SELBST = {
  alle: { text: 'Keine Richtung ist besser als die andere: Jede hat Stärken und Stellen, wo sie reiben kann. Es geht darum, deine gut zu nutzen.', stufe: 'abgeleitet', quellen: ['nettle2006'] },
  stabilitaet: {
    '-1': [{ text: 'Wenn dein innerer Kritiker laut ist: Sprich mit dir, wie du mit einem guten Freund sprechen würdest. Übungen dazu senken im Mittel Stress und Grübeln.', stufe: 'belegt', quellen: ['ferrari2019'] },
      { text: 'Plane Erholung fest ein wie einen Termin, und schreib dir drei Dinge auf, die dich zuverlässig beruhigen.', stufe: 'idee' }],
    1: [{ text: 'Du kommst gut mit Druck klar. Prüf trotzdem einmal pro Woche ehrlich: Schiebe ich etwas weg, das mich eigentlich belastet?', stufe: 'idee' }]
  },
  gewissenhaftigkeit: {
    1: [{ text: 'Erlaube dir „gut genug“: Nicht jede Aufgabe braucht das Äußerste. Leg vorher fest, wann etwas fertig ist.', stufe: 'idee' }],
    '-1': [{ text: 'Schuldgefühle wegen Aufschieben machen es eher schlimmer. Besser: den ersten Schritt winzig machen (zwei Minuten) und dann weitersehen.', stufe: 'idee' },
      { text: 'Gesunde Gewohnheiten fallen dir leichter, wenn sie automatisch laufen: feste Zeit, fester Ort und ein Wenn-dann-Plan („Wenn ich vom Essen aufstehe, gehe ich zehn Minuten raus“).', stufe: 'abgeleitet', quellen: ['bogg2004', 'gollwitzer2006'] }]
  },
  extraversion: {
    '-1': [{ text: 'Plane nach vollen, geselligen Tagen bewusst Ruhe ein – ohne schlechtes Gewissen. Das ist kein Rückzug, sondern Auftanken.', stufe: 'abgeleitet', quellen: ['jacqueshamilton2019'] }],
    1: [{ text: 'Wenn du lange allein arbeiten musst: Plane kleine Kontakte ein (ein Anruf, gemeinsam arbeiten), sonst sinkt deine Energie.', stufe: 'idee' }]
  },
  offenheit: { 1: [{ text: 'Gib deiner Neugier feste Spielzeit, zum Beispiel eine Stunde am Wochenende – dann zieht sie dich bei Pflichten weniger weg.', stufe: 'idee' }] },
  vertraeglichkeit: { 1: [{ text: 'Deine eigenen Bedürfnisse zählen genauso. Frag dich einmal am Tag: Was brauche ich gerade?', stufe: 'idee' }] },
  jetlag: { text: 'Dein Schlaf verschiebt sich zwischen freien Tagen und Tagen mit Termin deutlich. So eine Verschiebung hängt im Mittel mit unruhigerem Schlaf und Befinden zusammen – sie ist kein Fehler, sondern ein Zeichen, dass deine innere Uhr und dein Kalender verschieden ticken.', stufe: 'belegt', quellen: ['wittmann2006'] },
  licht: { text: 'Morgens Tageslicht und abends weniger helles Licht können die innere Uhr etwas nach vorn holen.', stufe: 'abgeleitet', quellen: ['wright2013'] },
  spaetMorgen: { text: 'Leg Aufgaben mit viel Konzentration möglichst nicht in deine frühen Morgenstunden.', stufe: 'abgeleitet', quellen: ['schmidt2007'] }
};

// ---------- Umgang mit anderen ----------
export const ANDERE = {
  reden: {
    extraversion: { 1: { text: 'Du denkst gern laut. Lass bewusst Pausen und frag nach – ruhigere Menschen brauchen einen Moment, bevor sie etwas sagen.', stufe: 'idee' },
      '-1': { text: 'Du denkst erst und sprichst dann. Sag anderen, dass du Zeit brauchst („Ich melde mich morgen dazu“) – sonst wirkt Schweigen wie Desinteresse.', stufe: 'idee' } },
    vertraeglichkeit: { 1: { text: 'Du hörst gut zu und gehst auf andere ein. Übe, „Nein“ zu sagen, ohne dich lange zu rechtfertigen.', stufe: 'idee' },
      '-1': { text: 'Du bist direkt. Sag zuerst, was gut ist, dann, was fehlt – so kommt deine Kritik eher an.', stufe: 'idee' } },
    stabilitaet: { '-1': { text: 'Wenn dich etwas aufwühlt: erst durchatmen, dann antworten. Eine Nachricht kann auch eine Stunde warten.', stufe: 'idee' } }
  },
  // Konfliktstil abgeleitet aus Big-Five-Zusammenhängen (Antonioni 1998); höchstens einer wird gezeigt.
  streit: {
    ausweichen: { text: 'Im Streit weichst du vermutlich eher aus. Das schont kurzfristig, aber Themen kommen wieder. Versuch einen Satz wie „Mir ist wichtig, dass …“.', stufe: 'abgeleitet', quellen: ['antonioni1998'] },
    durchsetzen: { text: 'Im Streit setzt du dich vermutlich eher durch. Prüf, ob die andere Seite sich gehört fühlt – sonst gewinnst du den Streit und verlierst Vertrauen.', stufe: 'abgeleitet', quellen: ['antonioni1998'] },
    loesen: { text: 'Im Streit suchst du vermutlich eher eine Lösung, mit der beide leben können. Das kostet Zeit und Geduld – nimm sie dir, statt zu schnell nachzugeben.', stufe: 'abgeleitet', quellen: ['antonioni1998'] }
  },
  naehe: {
    extraversion: { '-1': { text: 'Du brauchst mehr Zeit für dich – auch in engen Freundschaften und Beziehungen. Sag das offen, dann wirkt es nicht wie Ablehnung.', stufe: 'idee' },
      1: { text: 'Du suchst Nähe und viel Austausch. Menschen, die ruhiger sind, brauchen mehr Pausen – das ist keine Ablehnung.', stufe: 'idee' } }
  },
  ehrlichkeit: { 1: { text: 'Du spielst fair. Achte darauf, dass andere das nicht ausnutzen – Fairness darf Grenzen haben.', stufe: 'idee' },
    '-1': { text: 'Wenn dir dein Vorteil wichtig ist: Sag offen, was du willst. Verdeckte Taktik kostet am meisten Vertrauen.', stufe: 'abgeleitet', quellen: ['thielmann2020'] } }
};

// ---------- „Was das nicht heißt“ je Abschnitt ----------
export const NICHT = {
  staerken: 'Stärken heißen nicht „besser als andere“, und wo es reiben kann, ist kein Fehler. Es sind zwei Seiten derselben Eigenart.',
  arbeit: 'Das sind Arbeitsweisen, die zu deinen Antworten passen – keine Regeln. Probier aus, was davon bei dir wirkt.',
  geeignet: 'Das sind Anregungen, keine Berufsberatung und keine Garantie. Du kannst auch ganz anderes gut machen.',
  selbst: 'Keine Therapie und keine Diagnose. Wenn es dir länger nicht gut geht, sprich mit einer Ärztin, einem Arzt oder einer Beratungsstelle.',
  andere: 'Andere ticken anders – nicht falsch. Die Hinweise beschreiben deine Seite, nicht, wer im Recht ist.',
  wachstum: 'Ändern ist ein Angebot, keine Pflicht. Du bist so, wie du bist, in Ordnung.'
};

// ---------- Wachstum: Richtungen, die man gezielt üben kann ----------
// vorschlag: wann die Richtung „naheliegend“ ist (Lage des Bereichs/der Facette). Herausforderungen: eigene Beispiele (Idee),
// nach dem Muster wöchentlicher kleiner Herausforderungen (Hudson u. a. 2019). M5 training liest die Wahl aus passt.wachstum.
export const WACHSTUM = {
  einstieg: { text: 'Persönlichkeit lässt sich ein Stück weit gezielt verändern – in kleinen Schritten über Wochen. Wer das will und kleine Herausforderungen wirklich macht, verändert sich im Mittel in die gewünschte Richtung.', stufe: 'belegt', quellen: ['hudson2015', 'hudson2019', 'stieger2021'] },
  machen: { text: 'Nur vornehmen reicht nicht: Wer Herausforderungen annahm, aber nicht machte, veränderte sich eher in die Gegenrichtung. Lieber klein anfangen und wirklich tun.', stufe: 'belegt', quellen: ['hudson2019'] },
  anders: { text: 'Du musst nichts ändern. Anders ist nicht schlechter: Jede Richtung hat Stärken und Stellen, wo sie reiben kann.', stufe: 'abgeleitet', quellen: ['nettle2006'] },
  vonSelbst: { text: 'Persönlichkeit verändert sich auch von selbst: Zwischen 20 und 40 werden Menschen im Mittel gewissenhafter und gelassener.', stufe: 'belegt', quellen: ['roberts2006'] },
  warum: [['wohler', 'mich wohler fühlen'], ['arbeit', 'für Schule oder Arbeit'], ['menschen', 'für Freundschaften und Beziehungen'], ['projekt', 'für ein eigenes Projekt'], ['probieren', 'einfach ausprobieren']],
  richtungen: [
    { id: 'gelassener', richtung: 'stabilitaet', ziel: 'mehr', titel: 'Gelassener werden', wofuer: 'Stress trifft dich weniger, du erholst dich schneller.',
      beleg: { text: 'In Studien zu Therapie und Begleitung veränderte sich emotionale Stabilität am deutlichsten.', stufe: 'belegt', quellen: ['roberts2017'] },
      preis: 'Weniger Alarm heißt auch: Warnzeichen bewusster prüfen.',
      aufgaben: ['Schreib heute Abend drei Dinge auf, die gut liefen – auch kleine.', 'Wenn dich etwas ärgert: vier ruhige Atemzüge, bevor du antwortest.', 'Nimm dir eine Sorge vor und schreib nur den nächsten kleinen Schritt auf.', 'Geh zehn Minuten nach draußen, ohne Handy.'] },
    { id: 'selbstsicher', richtung: 'stabilitaet.selbstsicherheit', ziel: 'mehr', titel: 'Sicherer unter Leuten', wofuer: 'Weniger Grübeln darüber, was andere von dir denken.',
      preis: 'Mehr Sicherheit heißt auch: Du merkst Peinlichkeiten seltener – auch die, die man merken sollte.',
      aufgaben: ['Stell in einer Runde eine Frage, auch wenn sie „dumm“ wirken könnte.', 'Bestell oder frag etwas, ohne es vorher im Kopf zu üben.', 'Zeig jemandem etwas Unfertiges, an dem du arbeitest.'] },
    { id: 'dranbleiben', richtung: 'gewissenhaftigkeit', ziel: 'mehr', titel: 'Dranbleiben und fertig machen', wofuer: 'Mehr schaffen, weniger aufschieben, Zusagen halten.',
      beleg: { text: 'Die meisten Menschen möchten etwas an sich ändern – am häufigsten möchten sie gewissenhafter werden.', stufe: 'belegt', quellen: ['hudson2014'] },
      preis: 'Mehr Plan heißt auch: etwas weniger spontan.',
      aufgaben: ['Leg morgens eine Aufgabe fest, die bis Mittag fertig ist – und mach sie.', 'Räum zehn Minuten deinen Arbeitsplatz auf.', 'Schreib einen Wenn-dann-Plan: „Wenn ich nach Hause komme, dann …“.', 'Mach eine Zusage so klein, dass du sie sicher hältst – und halte sie.'] },
    { id: 'fokus', richtung: 'gewissenhaftigkeit.selbstdisziplin', ziel: 'mehr', titel: 'Fokus halten', wofuer: 'Länger bei einer Sache bleiben, weniger Ablenkung.',
      preis: 'Mehr Fokus heißt auch: Spontane Einfälle müssen mal warten.',
      aufgaben: ['25 Minuten an einer Sache arbeiten, das Handy in einem anderen Raum.', 'An drei Tagen nacheinander 20 Minuten am selben Projekt.', 'Schalte für einen Tag alle Mitteilungen einer App aus.'] },
    { id: 'lockerer', richtung: 'gewissenhaftigkeit.besonnenheit', ziel: 'weniger', titel: 'Lockerer und spontaner', wofuer: 'Weniger Druck durch Perfektion, mehr Raum für Spontanes.',
      preis: 'Weniger Vorsicht heißt auch: Ab und zu geht etwas schief – das gehört dazu.',
      aufgaben: ['Gib etwas ab, das „gut genug“ ist, statt es noch einmal zu verbessern.', 'Plane einen Nachmittag ohne Plan.', 'Sag spontan Ja zu einer Einladung oder Idee.'] },
    { id: 'offener', richtung: 'extraversion', ziel: 'mehr', titel: 'Offener auf Leute zugehen', wofuer: 'Leichter Kontakte knüpfen, mehr Schwung in Gruppen.',
      beleg: { text: 'Wer sich eine Woche lang bewusst gesellig verhält, hat im Mittel bessere Laune – ruhigere Menschen aber weniger, und sie werden eher müde.', stufe: 'belegt', quellen: ['jacqueshamilton2019'] },
      preis: 'Mehr Kontakt kostet dich Kraft. Plane danach Ruhe ein.',
      aufgaben: ['Sag heute einer Person ehrlich etwas Nettes.', 'Ruf jemanden an, statt zu schreiben.', 'Erzähl in einer Runde eine kurze Geschichte von dir.', 'Nimm ein Ein-Minuten-Video in einem Stück auf.'] },
    { id: 'einstehen', richtung: 'extraversion.durchsetzung', ziel: 'mehr', titel: 'Für dich einstehen', wofuer: 'Deine Meinung und deine Wünsche hörbar machen.',
      preis: 'Wer sich mehr durchsetzt, eckt auch öfter an.',
      aufgaben: ['Sag einmal „Nein“, ohne dich zu rechtfertigen.', 'Bring in einem Gespräch deine Meinung als Erstes ein.', 'Bitte um etwas, das du brauchst – klar und kurz.'] },
    { id: 'ruhe', richtung: 'extraversion.erlebnishunger', ziel: 'weniger', titel: 'Ruhe aushalten können', wofuer: 'Weniger Reizhunger, mehr Tiefe.',
      preis: 'Mehr Ruhe heißt auch: weniger Nervenkitzel.',
      aufgaben: ['15 Minuten nichts tun – ohne Handy, ohne Musik.', 'Einen Abend allein mit einem Buch oder einem Album, ganz durch.', 'Iss einmal ohne Bildschirm.'] },
    { id: 'verstaendnis', richtung: 'vertraeglichkeit', ziel: 'mehr', titel: 'Mehr Verständnis für andere', wofuer: 'Weniger Reibung, mehr Vertrauen.',
      beleg: { text: 'Partner von verträglicheren Menschen sind im Mittel etwas zufriedener.', stufe: 'belegt', quellen: ['malouff2010'] },
      preis: 'Mehr Rücksicht heißt auch: deine eigenen Wünsche bewusst im Blick behalten.',
      aufgaben: ['Frag nach, bevor du urteilst: „Wie meinst du das?“', 'Lob jemanden konkret für etwas Bestimmtes.', 'Hilf jemandem ungefragt bei einer Kleinigkeit.'] },
    { id: 'neugieriger', richtung: 'offenheit', ziel: 'mehr', titel: 'Neugieriger werden', wofuer: 'Neue Ideen, mehr Abwechslung.',
      preis: 'Mehr Neues heißt auch: Bewährtes bekommt weniger Zeit.',
      aufgaben: ['Hör ein Album aus einer Richtung, die du sonst nie hörst.', 'Probier ein neues Rezept oder einen neuen Weg nach Hause.', 'Frag jemanden nach seinem Lieblingsthema und hör zehn Minuten zu.'] }
  ]
};

// ---------- Im Alltag: fünf konkrete Wahlen (früher „Treffer-Probe“, Schlüssel und Speicher 'passt:probe' unverändert) ----------
// Konkrete Situationen statt allgemeiner Sätze (gegen den Barnum-Effekt). hoch = die Wahl, die zum Pol '1' des Bereichs passt.
// Kein richtig/falsch: Weicht die Wahl vom Fragebogen ab, heißt es „beides gehört zu dir“.
export const ALLTAG_REIHE = ['extraversion', 'gewissenhaftigkeit', 'offenheit', 'vertraeglichkeit', 'stabilitaet'];
export const VORHERSAGEN = {
  extraversion: { frage: 'Freier Abend nach einer vollen Woche – was wählst du eher?', a: 'mit Leuten losziehen', b: 'allein zur Ruhe kommen', hoch: 'a' },
  gewissenhaftigkeit: { frage: 'Ein Wochenende woanders – wie gehst du es eher an?', a: 'vorher genau planen', b: 'vor Ort entscheiden', hoch: 'a' },
  offenheit: { frage: 'Im Restaurant – was bestellst du eher?', a: 'etwas, das ich noch nie gegessen habe', b: 'mein bewährtes Lieblingsgericht', hoch: 'a' },
  vertraeglichkeit: { frage: 'Jemand drängelt sich in der Schlange vor – was tust du eher?', a: 'ich lasse es meist gut sein', b: 'ich sage sofort etwas', hoch: 'a' },
  stabilitaet: { frage: 'Du bekommst „Wir müssen reden“ ohne Grund – wie geht es dir eher?', a: 'ich denke mir wenig dabei', b: 'es beschäftigt mich, bis ich mehr weiß', hoch: 'a' }
};

export const U16 = 'Persönlichkeit ist in deinem Alter noch stark in Bewegung. Nimm alles hier als Momentaufnahme.';

// ---------- Äste (Lerninhalt für „Dein Muster“, Vertrag aeste()) ----------
// Inhalt unabhängig von den Antworten. pole[0] = Seite '-1', pole[1] = Seite '1' des Bereichs in basis (für muster()).
// basis: Big-Five-Bereich, aus dem die Richtung kommt; alltag: Bereich der passenden Alltags-Wahl (VORHERSAGEN).
// verwandt darf auch geratene IDs anderer Module enthalten – der Zusammenbau gleicht ab.
export const AESTE = [
  { id: 'passt.arbeit_struktur', titel: 'Struktur oder Freiraum', bereich: 'Persönlichkeit', basis: 'gewissenhaftigkeit', alltag: 'gewissenhaftigkeit',
    pole: [{ name: 'Freiraum', text: 'Du arbeitest gern beweglich, entscheidest unterwegs und kannst umschwenken, wenn Pläne platzen.' },
      { name: 'Struktur', text: 'Du arbeitest gern mit Plan, Listen und festen Zeiten und bringst Dinge verlässlich zu Ende.' }],
    wasEsIst: 'Manche Menschen kommen am besten voran, wenn der Weg vorher klar ist: Plan, Reihenfolge, Zwischenziele. Andere brauchen Spielraum und finden ihren Weg erst beim Gehen. In der Persönlichkeitsforschung hängt das eng mit Gewissenhaftigkeit zusammen – also damit, wie gern jemand plant, ordnet und dranbleibt. Beide Arten haben ihre Stärken: Struktur trägt bei langen Vorhaben, Freiraum bei Überraschungen und neuen Lagen. Viele Menschen mischen beides, je nach Aufgabe.',
    imAlltag: ['Ob du vor einer Reise eine Liste schreibst oder lieber vor Ort schaust, was geht.', 'Wie sich ein Tag ganz ohne Termin anfühlt – befreiend oder haltlos.', 'Ob dich eine Planänderung kurz ärgert oder eher wach macht.', 'Wie du mit Aufgaben umgehst, die keine feste Frist haben.'],
    staerken: ['Struktur: Verlässlichkeit – andere können sich auf deine Zusagen verlassen.', 'Struktur: lange Vorhaben über Wochen und Monate zu Ende bringen.', 'Freiraum: schnell umschwenken und improvisieren, wenn etwas schiefgeht.', 'Freiraum: offen bleiben für Gelegenheiten, die kein Plan vorhergesehen hat.'],
    reibung: ['Mit viel Struktur können spontane Änderungen und Halbfertiges stressen.', 'Mit viel Struktur plant man manchmal länger, als nötig wäre.', 'Mit viel Freiraum bleiben lange Aufgaben ohne Frist leichter liegen.', 'Zwischen jemandem, der plant, und jemandem, der improvisiert, kann es knirschen – obwohl beide dasselbe Ziel haben.'],
    weiterdenken: ['Bei welcher Art von Aufgabe hilft dir ein Plan – und wo engt er dich ein?', 'Was ist für dich der kleinste Plan, der noch trägt?', 'Wann hat dich zuletzt eine Planänderung überrascht – und wie bist du damit umgegangen?', 'Wer in deinem Umfeld tickt hier anders als du, und was kannst du dir dort abschauen?'],
    ueben: [{ titel: 'Dranbleiben und fertig machen', route: 'passt/wachstum/dranbleiben' }, { titel: 'Lockerer und spontaner', route: 'passt/wachstum/lockerer' }, { titel: 'Arbeitsweise', route: 'passt/arbeit' }],
    verwandt: ['bigfive.gewissenhaftigkeit', 'passt.arbeit_neues', 'passt.arbeit_druck', 'passt.lernen', 'muster.entscheiden', 'muster.ungewissheit'],
    unteraeste: [
      { id: 'wenn_dann', titel: 'Wenn-dann-Pläne', text: 'Ein Vorsatz der Form „Wenn Situation X kommt, dann tue ich Y“ hilft vielen Menschen, Dinge wirklich anzufangen. Der Plan legt Zeit und Ort fest, damit nicht jedes Mal neu entschieden werden muss. In vielen Studien wirken solche Pläne besser als ein allgemeiner Vorsatz.' },
      { id: 'etappen', titel: 'Kurze Etappen', text: 'Wer Freiraum braucht, wird trotzdem fertig: große Vorhaben in kurze Etappen mit festen Zwischenterminen teilen, am besten mit jemandem, der nachfragt. Aufschieben hängt eng mit Gewissenhaftigkeit zusammen – feste kleine Fristen nehmen ihm den Raum.' },
      { id: 'gut_genug', titel: 'Gut genug', text: 'Wer gern gründlich ist, legt vorher fest, wann etwas fertig ist. So bleibt Gründlichkeit eine Stärke und wird nicht zum endlosen Verbessern.' }],
    wissen: 'Gewissenhaftigkeit ist einer der fünf großen Grundzüge der Persönlichkeit (Big Five). Barrick und Mount (1991) fanden in einer Zusammenschau vieler Studien, dass Gewissenhaftigkeit in fast allen Berufen mit verlässlicher Arbeit zusammenhängt. Steel (2007) zeigte, dass Aufschieben eng mit diesem Grundzug verbunden ist. Gollwitzer und Sheeran (2006) fassten Studien zu Wenn-dann-Plänen zusammen. Die Texte hier sind eigene Zusammenfassungen, keine Diagnose.' },

  { id: 'passt.arbeit_team', titel: 'Allein oder im Team', bereich: 'Persönlichkeit', basis: 'extraversion',
    pole: [{ name: 'Für dich arbeiten', text: 'Du tankst in Ruhe auf, bleibst lange bei einer Sache und denkst gründlich, bevor du sprichst.' },
      { name: 'Mit anderen arbeiten', text: 'Du tankst im Austausch auf, denkst gern laut und bringst Schwung in Gruppen.' }],
    wasEsIst: 'Menschen unterscheiden sich darin, woher sie bei der Arbeit ihre Energie nehmen. Die einen werden im Gespräch wach, die anderen in ungestörter Ruhe. Das hängt mit Extraversion zusammen – wie sehr jemand Kontakt, Trubel und Aktivität sucht. Es geht nicht darum, ob jemand mit Menschen „kann“: Auch ruhige Menschen arbeiten oft gern im Team, sie brauchen nur andere Pausen. Gut passt eine Arbeitsweise, bei der du deine Kraftquelle regelmäßig erreichst.',
    imAlltag: ['Ob du nach einem langen Treffen erschöpft oder angeregt bist.', 'Ob du Ideen lieber im Gespräch oder allein auf Papier entwickelst.', 'Wie sich ein ganzer Arbeitstag allein zu Hause für dich anfühlt.', 'Ob du dich auf eine Gruppenarbeit freust oder sie lieber gut vorbereitest.'],
    staerken: ['Für dich: Tiefe, Ausdauer und Sorgfalt bei Aufgaben, die Ruhe brauchen.', 'Für dich: gutes Zuhören und durchdachte Beiträge.', 'Mit anderen: Gespräche in Gang bringen und Leute mitziehen.', 'Mit anderen: Ideen im Austausch schnell weiterentwickeln.'],
    reibung: ['Viel Trubel, lange Live-Formate und ständiger Kontakt kosten ruhigere Menschen viel Kraft.', 'Lange allein und still zu arbeiten kann geselligen Menschen die Energie rauben.', 'Stilles Nachdenken wird in Gruppen leicht als Desinteresse missverstanden.', 'Lautes Durchdenken kann anderen den Raum nehmen, selbst etwas zu sagen.'],
    weiterdenken: ['Nach welcher Art von Tag fühlst du dich am lebendigsten?', 'Wie viel Kontakt brauchst du in einer Arbeitswoche – und wie viel Ruhe?', 'Welche Aufgabe gelingt dir allein besser, welche mit anderen?', 'Wie kannst du anderen sagen, was du zum guten Arbeiten brauchst?'],
    ueben: [{ titel: 'Offener auf Leute zugehen', route: 'passt/wachstum/offener' }, { titel: 'Ruhe aushalten können', route: 'passt/wachstum/ruhe' }, { titel: 'Arbeitsweise', route: 'passt/arbeit' }],
    verwandt: ['bigfive.extraversion', 'passt.umgebung', 'passt.andere_naehe', 'passt.geeignet'],
    unteraeste: [
      { id: 'bloecke', titel: 'Ungestörte Blöcke', text: 'Schwere Aufgaben in feste, ungestörte Zeitblöcke legen – Handy weg, Tür zu. Absprachen dann lieber kurz und geplant. Das hilft vor allem Menschen, die in Ruhe auftanken.' },
      { id: 'gemeinsam', titel: 'Gemeinsam arbeiten', text: 'Wer im Austausch auftankt, kann auch Einzelarbeit gesellig machen: mit jemandem im selben Raum arbeiten, Zwischenstände kurz besprechen, laut durchdenken.' },
      { id: 'nachtanken', titel: 'Nach dem Trubel', text: 'Wer sich eine Woche lang bewusst geselliger verhält, hat im Mittel bessere Laune – ruhigere Menschen werden davon aber eher müde. Eingeplante Ruhe danach ist kein Rückzug, sondern Auftanken.' }],
    wissen: 'Extraversion ist einer der Big-Five-Grundzüge. Jacques-Hamilton, Sun und Smillie (2019) baten Menschen, sich eine Woche lang bewusst gesellig zu verhalten: Die Laune stieg im Mittel, bei ruhigeren Menschen weniger, und sie wurden eher müde. Soto (2019) fasste zusammen, womit die Big Five im Leben zusammenhängen. Eigene Zusammenfassung.' },

  { id: 'passt.arbeit_druck', titel: 'Unter Druck', bereich: 'Persönlichkeit', basis: 'stabilitaet', alltag: 'stabilitaet',
    pole: [{ name: 'Feines Gespür', text: 'Du merkst früh, wenn etwas nicht stimmt, und nimmst Spannungen ernst – bei dir und bei anderen.' },
      { name: 'Ruhige Hand', text: 'Unter Druck bleibst du eher ruhig und fängst dich nach Rückschlägen schnell wieder.' }],
    wasEsIst: 'Druck, Fristen und Unsicherheit erleben Menschen sehr verschieden. Manche bleiben innerlich ruhig, andere spüren Anspannung früh und stark. In der Forschung heißt dieser Grundzug emotionale Stabilität. Ein feines Gespür für Stress ist kein Fehler: Es ist ein Frühwarnsystem, das Schwierigkeiten eher bemerkt. Eine ruhige Hand hilft dagegen, in hektischen Lagen klar zu bleiben. Beide Seiten gewinnen, wenn die Arbeit zu ihnen passt.',
    imAlltag: ['Wie lange dich eine knappe Nachricht wie „Wir müssen reden“ beschäftigt.', 'Ob du vor einer Prüfung oder einem Auftritt gut schläfst.', 'Wie schnell du nach einem Ärger wieder zur Ruhe kommst.', 'Ob du Fristen eher als Antrieb oder als Last erlebst.'],
    staerken: ['Feines Gespür: Schwierigkeiten früh bemerken, bevor sie groß werden.', 'Feines Gespür: Stimmungen anderer wahrnehmen und ernst nehmen.', 'Ruhige Hand: in Hektik klar entscheiden.', 'Ruhige Hand: Rückschläge wegstecken und weitermachen.'],
    reibung: ['Mit feinem Gespür treffen Stress, Ärger und Sorgen stärker und halten länger an.', 'Mit feinem Gespür kosten Druck und Überraschungen viel Kraft.', 'Mit ruhiger Hand nimmt man Warnzeichen manchmal später ernst als nötig.', 'Mit ruhiger Hand übersieht man leicht, wie sehr andere unter Druck stehen.'],
    weiterdenken: ['Was hilft dir zuverlässig, wenn du angespannt bist?', 'Woran merkst du früh, dass dir etwas zu viel wird?', 'Welche Art von Druck treibt dich an, welche lähmt dich?', 'Wie viel Puffer brauchst du, damit sich eine Frist gut anfühlt?'],
    ueben: [{ titel: 'Gelassener werden', route: 'passt/wachstum/gelassener' }, { titel: 'Sicherer unter Leuten', route: 'passt/wachstum/selbstsicher' }, { titel: 'Training', route: 'training' }],
    verwandt: ['bigfive.stabilitaet', 'passt.selbst', 'passt.arbeit_struktur', 'muster.kontrolle', 'muster.ungewissheit'],
    unteraeste: [
      { id: 'puffer', titel: 'Puffer und kleine Schritte', text: 'Wer Druck stark spürt, plant Puffer ein und teilt Großes in kleine Schritte. So wird aus einer großen Frist eine Reihe kleiner, machbarer Termine.' },
      { id: 'probe', titel: 'Probe-Durchlauf', text: 'Wichtige Situationen vorher unter echten Bedingungen üben – eine Probe-Präsentation, eine Probe-Prüfung. Sich selbst abfragen gehört zu den wirksamsten Lernweisen und nimmt der echten Lage den Schrecken.' },
      { id: 'warnzeichen', titel: 'Warnzeichen prüfen', text: 'Wer gelassen ist, kann sich eine feste Frage angewöhnen: Schiebe ich gerade etwas weg, das mich eigentlich belastet? Einmal pro Woche reicht.' }],
    wissen: 'Emotionale Stabilität ist einer der Big-Five-Grundzüge. Steel, Schmidt und Shultz (2008) fassten zusammen, wie eng Persönlichkeit und Wohlbefinden zusammenhängen. Dunlosky und andere (2013) verglichen Lernweisen: Sich selbst abfragen und verteilt üben wirken am besten. Eigene Zusammenfassung, keine Diagnose. Wenn Druck dich länger stark belastet, kann ein Gespräch mit einer Beratungsstelle, einer Ärztin oder einem Arzt helfen.' },

  { id: 'passt.arbeit_neues', titel: 'Neues oder Bewährtes', bereich: 'Persönlichkeit', basis: 'offenheit', alltag: 'offenheit',
    pole: [{ name: 'Halt im Bewährten', text: 'Du verfeinerst, was sich bewährt hat, und verlierst dich nicht in Gedankenspielen.' },
      { name: 'Neugier auf Neues', text: 'Du gehst neuen Ideen gern nach und verbindest Dinge, die andere getrennt sehen.' }],
    wasEsIst: 'Manche Menschen zieht das Unbekannte an: neue Ideen, neue Orte, neue Werkzeuge. Andere schätzen das Vertraute und machen Bewährtes Schritt für Schritt besser. In der Persönlichkeitsforschung heißt dieser Grundzug Offenheit für Erfahrungen. Neugier bringt Einfälle und Verbindungen; Halt im Bewährten bringt Tiefe, Können und Verlässlichkeit. Wer etwas meisterhaft kann, braucht oft beides: genug Neugier, um weiterzulernen, und genug Treue, um dranzubleiben.',
    imAlltag: ['Ob du im Restaurant dein Lieblingsgericht nimmst oder etwas ganz Neues.', 'Wie oft du neue Musik, Bücher oder Wege ausprobierst.', 'Ob dich ein neues Programm reizt oder eher nervt.', 'Ob du Gewohnheiten als Halt oder als Langeweile erlebst.'],
    staerken: ['Neugier: Einfälle haben und Dinge verbinden, die getrennt scheinen.', 'Neugier: sich schnell in neue Themen einarbeiten.', 'Bewährtes: Können vertiefen, bis es wirklich sitzt.', 'Bewährtes: verlässlich liefern, ohne sich zu verzetteln.'],
    reibung: ['Mit viel Neugier langweilt Routine schnell – auch wenn sie gerade dran wäre.', 'Mit viel Neugier fängt man leicht mehr an, als man beendet.', 'Mit viel Halt im Bewährten fühlen sich ganz neue Wege, offene Fragen und schnelle Wechsel erst einmal fremd an.', 'Zwischen beiden Seiten kann es knirschen: Die eine findet die andere sprunghaft, die andere findet die eine starr.'],
    weiterdenken: ['Welche Gewohnheit trägt dich – und welche hält dich nur fest?', 'Wann hat dich zuletzt etwas Neues wirklich begeistert?', 'Woran arbeitest du lieber weiter, statt neu anzufangen?', 'Wie viel Neues verträgt deine Woche, damit sie sich lebendig und trotzdem ruhig anfühlt?'],
    ueben: [{ titel: 'Neugieriger werden', route: 'passt/wachstum/neugieriger' }, { titel: 'Fokus halten', route: 'passt/wachstum/fokus' }, { titel: 'Wofür du geeignet bist', route: 'passt/geeignet' }],
    verwandt: ['bigfive.offenheit', 'passt.geeignet', 'passt.arbeit_struktur', 'muster.neugier_denken', 'muster.werte_wandel', 'muster.ungewissheit'],
    unteraeste: [
      { id: 'spielzeit', titel: 'Feste Spielzeit für Neugier', text: 'Wer viel Neugier hat, gibt ihr feste Zeit, zum Beispiel eine Stunde am Wochenende. Dann zieht sie bei Pflichten weniger weg.' },
      { id: 'schritt', titel: 'Schritt für Schritt verfeinern', text: 'Wer Bewährtes schätzt, kann es gezielt verfeinern: jede Woche eine kleine Verbesserung an etwas, das schon läuft.' },
      { id: 'kreativ', titel: 'Neugier und Kreativität', text: 'Kreative Menschen in Kunst und Wissenschaft sind im Mittel offener für neue Erfahrungen. Kreativität braucht aber auch Ausdauer – das Fertigmachen gehört dazu.' }],
    wissen: 'Offenheit für Erfahrungen ist einer der Big-Five-Grundzüge. Feist (1998) fasste Studien zur Persönlichkeit von Künstlerinnen, Künstlern, Wissenschaftlerinnen und Wissenschaftlern zusammen: Kreative Menschen waren im Mittel offener für Neues. Nettle (2006) beschrieb, dass jeder Grundzug je nach Lage Vorteile und Nachteile hat. Eigene Zusammenfassung.' },

  { id: 'passt.arbeit_miteinander', titel: 'Zusammenarbeit oder Wettbewerb', bereich: 'Persönlichkeit', basis: 'vertraeglichkeit',
    pole: [{ name: 'Klare Kante', text: 'Du sagst direkt, was du denkst, prüfst kritisch und lässt dich nicht leicht ausnutzen.' },
      { name: 'Miteinander', text: 'Du gehst auf andere ein, gleichst aus und schaffst Vertrauen im Team.' }],
    wasEsIst: 'Wie sehr jemand auf Harmonie und Rücksicht achtet oder lieber klar und kritisch auftritt, beschreibt in der Forschung der Grundzug Verträglichkeit. Wer viel Rücksicht nimmt, arbeitet gern zusammen und sorgt für ein gutes Klima. Wer direkter ist, mag klare Ansagen, verhandelt gut und prüft, ob etwas wirklich stimmt. Gute Teams brauchen beides: jemanden, der zusammenhält, und jemanden, der unbequeme Fragen stellt.',
    imAlltag: ['Ob du in einer Diskussion eher vermittelst oder eher widersprichst.', 'Wie leicht dir ein „Nein“ fällt.', 'Ob dich Wettbewerb anspornt oder eher stört.', 'Wie du reagierst, wenn jemand deine Arbeit kritisiert.'],
    staerken: ['Miteinander: Vertrauen aufbauen und ein Team zusammenhalten.', 'Miteinander: gut zuhören und zwischen Menschen ausgleichen.', 'Klare Kante: ehrliche Rückmeldung geben, auch wenn sie unbequem ist.', 'Klare Kante: verhandeln und für eine Sache einstehen.'],
    reibung: ['Mit viel Rücksicht kommen eigene Wünsche leicht zu kurz; beim Verhandeln holt man eher weniger für sich heraus.', 'Mit viel Rücksicht fällt ein „Nein“ schwer.', 'Mit klarer Kante wirkt man schneller hart oder kühl – auch ohne es so zu meinen.', 'Mit klarer Kante wird Kritik an der Sache leicht als Kritik an der Person gehört.'],
    weiterdenken: ['Wo hast du zuletzt nachgegeben, obwohl dir etwas wichtig war?', 'Wann hat eine klare Ansage von dir etwas Gutes bewirkt?', 'Wie klingt Kritik, die du selbst gut annehmen kannst?', 'In welchen Lagen spornt dich Wettbewerb an, in welchen nicht?'],
    ueben: [{ titel: 'Für dich einstehen', route: 'passt/wachstum/einstehen' }, { titel: 'Mehr Verständnis für andere', route: 'passt/wachstum/verstaendnis' }, { titel: 'Umgang mit anderen', route: 'passt/andere' }],
    verwandt: ['bigfive.vertraeglichkeit', 'passt.andere_streit', 'interessen.ehrlichkeit', 'muster.werte_ich_wir'],
    unteraeste: [
      { id: 'verhandeln', titel: 'Vor dem Verhandeln aufschreiben', text: 'Wer viel Rücksicht nimmt, schreibt vorher auf, was er will – und bleibt dabei. In Studien holen rücksichtsvolle Menschen beim Gehalt im Mittel etwas weniger für sich heraus; ein klarer Plan vor dem Gespräch hilft.' },
      { id: 'kritik', titel: 'Kritik an der Sache', text: 'Wer direkt ist, macht Kritik an der Sache fest, nicht an der Person, und sagt zuerst, was gut ist. So kommt die Klarheit eher an.' }],
    wissen: 'Verträglichkeit ist einer der Big-Five-Grundzüge. Judge, Livingston und Hurst (2012) fanden, dass verträglichere Menschen im Mittel etwas weniger verdienen, besonders Männer. Antonioni (1998) untersuchte, wie die Big Five mit Stilen im Streit zusammenhängen. Eigene Zusammenfassung.' },

  { id: 'passt.umgebung', titel: 'Umgebung und Auftanken', bereich: 'Rhythmus', basis: 'extraversion', alltag: 'extraversion',
    pole: [{ name: 'Ruhige Umgebung', text: 'Du blühst auf, wo es still und ungestört ist – dort findest du Tiefe und tankst auf.' },
      { name: 'Lebendige Umgebung', text: 'Du blühst auf, wo etwas los ist – Stimmen, Bewegung und Austausch geben dir Schwung.' }],
    wasEsIst: 'Wo und wann du arbeitest, lernst oder dich erholst, wirkt stärker, als man oft denkt. Manche Menschen brauchen Stille und wenig Reize, um in die Tiefe zu gehen; andere werden in einem Café oder unter Leuten erst richtig wach. Dazu kommt die innere Uhr: Zu manchen Tageszeiten fällt Konzentration leichter, zu anderen fließen eher Einfälle. Eine passende Umgebung ist keine Bequemlichkeit, sondern ein Werkzeug – du richtest sie nach dem ein, was du gerade vorhast.',
    imAlltag: ['Ob du mit Musik oder in Stille besser denkst.', 'Wie du einen freien Abend nach einer vollen Woche am liebsten verbringst.', 'Zu welcher Tageszeit dir schwere Aufgaben am leichtesten fallen.', 'Wie sehr dich Lärm, Unordnung oder ständige Mitteilungen ablenken.'],
    staerken: ['Ruhige Umgebung: lange, tiefe Konzentration.', 'Ruhige Umgebung: wenig Ablenkung, viel Sorgfalt.', 'Lebendige Umgebung: Schwung und Ideen aus dem Austausch.', 'Lebendige Umgebung: leicht in Gang kommen, wenn andere mitmachen.'],
    reibung: ['Wer Ruhe braucht, wird in vollen Räumen oder bei ständigen Mitteilungen schnell müde.', 'Wer Trubel braucht, fühlt sich bei langer Stille leicht leer oder unruhig.', 'Termine gegen die innere Uhr kosten Schlaf und Kraft – bei späten Typen vor allem frühe Termine.', 'Was dich auflädt, kann Menschen um dich herum erschöpfen – und umgekehrt.'],
    weiterdenken: ['Wo hattest du zuletzt richtig gute Ideen – und was war dort anders?', 'Welche drei Dinge an deinem Arbeitsplatz helfen dir, welche stören?', 'Wann am Tag bist du am klarsten? Liegen deine schwersten Aufgaben dort?', 'Was brauchst du nach einem vollen Tag, um wieder aufzutanken?'],
    ueben: [{ titel: 'Ruhe aushalten können', route: 'passt/wachstum/ruhe' }, { titel: 'Fokus halten', route: 'passt/wachstum/fokus' }, { titel: 'Training', route: 'training' }],
    verwandt: ['interessen.rhythmus', 'bigfive.extraversion', 'passt.arbeit_team', 'passt.selbst'],
    unteraeste: [
      { id: 'tageszeit', titel: 'Die passende Tageszeit', text: 'Konzentration folgt im Tagesverlauf der inneren Uhr: Frühe Typen sind morgens klarer, späte Typen später am Tag. Für Aufgaben, die einen Einfall brauchen, kann gerade die „falsche“ Tageszeit helfen, weil die Gedanken dann freier wandern.' },
      { id: 'licht', titel: 'Licht', text: 'Morgens Tageslicht und abends weniger helles Licht können die innere Uhr etwas nach vorn holen. Das hilft vor allem, wenn frühe Termine schwerfallen.' },
      { id: 'reize', titel: 'Reize dosieren', text: 'Mitteilungen aus, Handy in einen anderen Raum, Kopfhörer auf – oder umgekehrt bewusst unter Leute gehen. Du kannst die Menge an Reizen der Aufgabe anpassen.' }],
    wissen: 'Schmidt und andere (2007) fassten zusammen, wie die innere Uhr Aufmerksamkeit und Leistung im Tagesverlauf prägt. Wieth und Zacks (2011) fanden, dass Aufgaben, die einen Einfall brauchen, zur weniger passenden Tageszeit eher gelingen. Wright und andere (2013) zeigten, dass natürliches Licht die innere Uhr verschiebt. Jacques-Hamilton und andere (2019) untersuchten, wie Geselligkeit auf ruhige und gesellige Menschen wirkt. Eigene Zusammenfassung.' },

  { id: 'passt.geeignet', titel: 'Tätigkeiten und Rollen', bereich: 'Interessen',
    wasEsIst: 'Welche Tätigkeiten dich anziehen, sagt viel darüber, wo du gern Zeit verbringst. Der Psychologe John Holland ordnete Interessen in sechs Bereiche: praktisch-technisch, forschend, künstlerisch-gestaltend, sozial, unternehmerisch und ordnend. Die meisten Menschen haben zwei oder drei Bereiche, die sie besonders anziehen. Wer Tätigkeiten wählt, die dazu passen, bleibt im Mittel eher dabei. Interessen sind aber kein Urteil über Können: Was dich anzieht, kannst du lernen.',
    imAlltag: ['Womit du dich beschäftigst, wenn niemand etwas von dir verlangt.', 'Bei welchen Aufgaben du die Zeit vergisst.', 'Welche Rolle du in Gruppen von selbst übernimmst.', 'Welche Videos, Bücher oder Gespräche dich nicht loslassen.'],
    staerken: ['Passende Tätigkeiten geben Ausdauer, weil sie weniger Überwindung kosten.', 'Wer seine Interessen kennt, wählt Projekte und Rollen gezielter.', 'Mehrere Interessen lassen sich verbinden – zum Beispiel Gestalten und Erklären.', 'Interessen zeigen, wohin es dich zieht, auch wenn du es noch nicht kannst.'],
    reibung: ['Was nicht zu den eigenen Interessen passt, fühlt sich schnell zäh an – auch wenn es nötig ist.', 'Interessen und Fähigkeiten hängen nur mäßig zusammen: Anziehung ersetzt das Üben nicht.', 'Wer nur nach bekannten Interessen wählt, übersieht leicht Tätigkeiten, die er noch nicht kennt.', 'Interessen verändern sich mit der Zeit – frühere Entscheidungen passen dann vielleicht nicht mehr.'],
    weiterdenken: ['Bei welcher Tätigkeit hast du zuletzt die Zeit vergessen?', 'Welche zwei deiner Interessen könntest du in einem Projekt verbinden?', 'Was reizt dich, obwohl du es noch nicht kannst?', 'Welche Rolle übernimmst du in Gruppen, ohne dass jemand fragt?'],
    ueben: [{ titel: 'Wofür du geeignet bist', route: 'passt/geeignet' }, { titel: 'Interessen', route: 'fragen/interessen/riasec' }, { titel: 'Neugieriger werden', route: 'passt/wachstum/neugieriger' }],
    verwandt: ['interessen.riasec', 'passt.arbeit_neues', 'passt.arbeit_team', 'bigfive.offenheit'],
    unteraeste: 'RIASEC',   // wird in aeste() aus RIASEC gebaut
    wissen: 'Holland (1997) beschrieb die sechs Interessen-Bereiche, nach ihren englischen Anfangsbuchstaben RIASEC genannt. Nye und andere (2012) zeigten in einer Zusammenschau, dass Menschen, deren Tätigkeit zu ihren Interessen passt, im Mittel mehr leisten und eher dabeibleiben. Ackerman und Heggestad (1997) fanden, dass Interessen und Fähigkeiten nur mäßig zusammenhängen. Eigene Zusammenfassung, keine Berufsberatung.' },

  { id: 'passt.lernen', titel: 'Lernen, das wirkt', bereich: 'Üben',
    wasEsIst: 'Die Lernforschung hat recht klare Antworten darauf, was beim Lernen hilft – und die gelten für fast alle Menschen. Am meisten bringt es, sich selbst abzufragen, statt nur zu lesen, und das Üben über mehrere Tage zu verteilen. Markieren und bloßes Wiederlesen fühlen sich fleißig an, bringen aber wenig. Die beliebte Idee der „Lernstile“ (visuell, auditiv …) ist dagegen nicht belegt. Wie du lernst, darf trotzdem zu dir passen: kurze Einheiten, laut erklären oder mit einer Frage einsteigen, die dich wirklich interessiert.',
    imAlltag: ['Ob du Vokabeln liest oder dich selbst abfragst.', 'Ob du kurz vorher alles auf einmal lernst oder über Tage verteilt übst.', 'Woran du merkst, ob du etwas wirklich kannst.', 'Ob du Neues lieber jemandem erklärst oder still für dich durchgehst.'],
    staerken: ['Sich selbst abfragen zeigt ehrlich, was schon sitzt.', 'Verteiltes Üben bleibt länger im Gedächtnis als Pauken am Stück.', 'Anderen etwas erklären hilft, selbst klar zu denken.', 'Mit einer echten Frage einzusteigen weckt Neugier und Ausdauer.'],
    reibung: ['Selbst abfragen fühlt sich anstrengender an als Lesen – gerade das macht es wirksam.', 'Verteiltes Üben braucht Planung über mehrere Tage.', 'Lücken beim Abfragen können entmutigen, obwohl sie zum Lernen gehören.', 'Gewohnte Lernweisen loszulassen fällt schwer, auch wenn sie wenig bringen.'],
    weiterdenken: ['Wie prüfst du, ob du etwas wirklich kannst?', 'Was würdest du gern lernen, ganz ohne Prüfung?', 'Wem könntest du etwas erklären, das du gerade lernst?', 'Welche kurze Lernzeit passt jeden Tag in deinen Alltag?'],
    ueben: [{ titel: 'Arbeitsweise', route: 'passt/arbeit' }, { titel: 'Fokus halten', route: 'passt/wachstum/fokus' }, { titel: 'Training', route: 'training' }],
    verwandt: ['passt.arbeit_struktur', 'passt.arbeit_neues', 'muster.lernen', 'bigfive.gewissenhaftigkeit'],
    unteraeste: [
      { id: 'abfragen', titel: 'Sich selbst abfragen', text: 'Karteikarten, Probefragen, das Buch zuklappen und aufschreiben, was man noch weiß: Das Abrufen selbst festigt das Wissen.' },
      { id: 'verteilt', titel: 'Verteilt üben', text: 'Lieber an vier Tagen je zwanzig Minuten als einmal achtzig Minuten am Stück. Die Pausen dazwischen helfen dem Gedächtnis.' },
      { id: 'lernstile', titel: 'Der Mythos der Lernstile', text: 'Viele glauben, Menschen lernten am besten in „ihrem“ Stil – über Bilder, Hören oder Tun. Studien, die das sauber prüfen, finden dafür keinen Beleg. Besser: den Stoff so zeigen, wie er selbst am besten passt – eine Landkarte als Bild, Musik als Klang.' }],
    wissen: 'Dunlosky und andere (2013) verglichen zehn verbreitete Lernweisen: Sich selbst abfragen und verteilt üben wirkten am besten, Markieren und Wiederlesen wenig. Pashler und andere (2008) prüften die Idee der Lernstile und fanden keinen tragfähigen Beleg. Eigene Zusammenfassung.' },

  { id: 'passt.staerken', titel: 'Stärken und ihre Kehrseite', bereich: 'Persönlichkeit',
    wasEsIst: 'Jede Eigenart hat zwei Seiten. Was in einer Lage eine Stärke ist, kann in einer anderen reiben: Wer gründlich plant, ist verlässlich, tut sich aber mit spontanen Änderungen schwer. Wer spontan ist, improvisiert gut, lässt aber lange Aufgaben eher liegen. Der Psychologe Daniel Nettle beschreibt das so: Kein Grundzug ist an sich besser, jeder hat je nach Umgebung Vorteile und Nachteile. Darum zeigt die App jede Stärke zusammen mit der Stelle, wo sie reiben kann – nicht als Fehler, sondern als die andere Seite derselben Medaille.',
    imAlltag: ['Eine Eigenschaft, für die dich andere mögen – und dieselbe Eigenschaft, die sie manchmal nervt.', 'Situationen, in denen deine Art genau passend war, und solche, in denen sie gestört hat.', 'Wie du über Eigenschaften anderer denkst, die du an dir selbst nicht magst.'],
    staerken: ['Wer seine Stärken kennt, kann Aufgaben und Rollen gezielter wählen.', 'Wer weiß, wo eine Stärke reiben kann, wird davon weniger überrascht.', 'Zwei Seiten derselben Eigenart zu sehen nimmt Druck: Es gibt nichts „wegzumachen“.', 'Verschiedene Menschen ergänzen sich gerade durch ihre verschiedenen Stärken.'],
    reibung: ['Eine Stärke im Übermaß wird leicht zur Last – Gründlichkeit zu endlosem Verbessern, Spontaneität zu Durcheinander.', 'Die Kehrseite sieht man an sich selbst oft später als andere.', 'Wer nur auf seine Stärken schaut, übersieht, wann eine andere Herangehensweise besser passen würde.'],
    weiterdenken: ['Welche deiner Stärken hat dir zuletzt am meisten geholfen?', 'Wann stand dir dieselbe Stärke im Weg?', 'Welche Stärke eines Menschen, der ganz anders ist als du, bewunderst du?', 'Was wäre die Kehrseite einer Stärke, die du gern hättest?'],
    ueben: [{ titel: 'Stärken und wo sie reiben', route: 'passt/staerken' }, { titel: 'Wachsen – wenn du willst', route: 'passt/wachstum' }],
    verwandt: ['passt.wachstum', 'bigfive.offenheit', 'bigfive.gewissenhaftigkeit', 'bigfive.extraversion', 'bigfive.vertraeglichkeit', 'bigfive.stabilitaet'],
    wissen: 'Nettle (2006) beschrieb in einem Überblick zur Entstehung von Persönlichkeitsunterschieden, dass jeder Big-Five-Grundzug je nach Umgebung Vorteile und Nachteile mit sich bringt. Darum gibt es aus Sicht der Forschung keine „beste“ Persönlichkeit. Eigene Zusammenfassung.' },

  { id: 'passt.selbst', titel: 'Umgang mit dir selbst', bereich: 'Denkweise',
    wasEsIst: 'Wie du mit dir selbst umgehst, wenn etwas schiefgeht, prägt, wie schnell du dich erholst und weitermachst. Viele Menschen sprechen mit sich strenger, als sie je mit einem Freund sprechen würden. Übungen zu Selbstmitgefühl – sich selbst freundlich zu begegnen, statt sich zu verurteilen – senken im Mittel Stress und Grübeln. Dazu gehören feste Erholung, Gewohnheiten, die von allein laufen, und ein ehrlicher Blick auf die eigenen Bedürfnisse. Das ist keine Therapie, sondern Alltagspflege für den Kopf.',
    imAlltag: ['Wie du innerlich mit dir sprichst, wenn dir ein Fehler passiert.', 'Ob du Pausen planst oder sie dir erst nimmst, wenn nichts mehr geht.', 'Welche Gewohnheiten von allein laufen und welche jedes Mal Kraft kosten.', 'Ob du merkst, was du gerade brauchst.'],
    staerken: ['Freundlich mit dir zu sprechen macht Rückschläge kleiner und Neuanfänge leichter.', 'Feste Erholung schützt die Kraft für das, was dir wichtig ist.', 'Gewohnheiten mit fester Zeit und festem Ort sparen Willenskraft.', 'Wer seine Bedürfnisse kennt, kann sie anderen sagen.'],
    reibung: ['Der innere Kritiker meldet sich oft gerade dann, wenn man ihn am wenigsten braucht.', 'Schuldgefühle wegen Aufschieben machen das Aufschieben eher schlimmer.', 'Erholung fühlt sich für manche wie Faulheit an, obwohl sie Kraft zurückgibt.', 'Neue Gewohnheiten brauchen Wochen, bis sie von allein laufen.'],
    weiterdenken: ['Wie würdest du mit einem guten Freund sprechen, dem dasselbe passiert ist wie dir?', 'Welche drei Dinge beruhigen dich zuverlässig?', 'Welche Gewohnheit möchtest du automatisch machen – und wann und wo passt sie hin?', 'Was brauchst du gerade?'],
    ueben: [{ titel: 'Umgang mit dir selbst', route: 'passt/selbst' }, { titel: 'Gelassener werden', route: 'passt/wachstum/gelassener' }, { titel: 'Training', route: 'training' }],
    verwandt: ['passt.arbeit_druck', 'bigfive.stabilitaet', 'passt.umgebung', 'muster.selbstmitgefuehl', 'muster.gewohnheiten', 'muster.stress'],
    unteraeste: [
      { id: 'kritiker', titel: 'Der innere Kritiker', text: 'Sprich mit dir, wie du mit einem guten Freund sprechen würdest: ehrlich, aber freundlich. Übungen zu Selbstmitgefühl senken im Mittel Stress und Grübeln.' },
      { id: 'erholung', titel: 'Erholung als Termin', text: 'Plane Erholung fest ein wie einen Termin, und schreib dir drei Dinge auf, die dich zuverlässig beruhigen.' },
      { id: 'gewohnheit', titel: 'Gewohnheiten, die von allein laufen', text: 'Feste Zeit, fester Ort und ein Wenn-dann-Plan („Wenn ich vom Essen aufstehe, gehe ich zehn Minuten raus“). So muss nicht jedes Mal neu entschieden werden.' },
      { id: 'winzig', titel: 'Der winzige erste Schritt', text: 'Wenn etwas liegen bleibt: den ersten Schritt so klein machen, dass er zwei Minuten dauert – und dann weitersehen.' }],
    wissen: 'Ferrari und andere (2019) fassten Studien zu Selbstmitgefühl-Übungen zusammen: Sie senkten im Mittel Selbstkritik, Grübeln und Stress. Bogg und Roberts (2004) zeigten, dass Gewissenhaftigkeit mit gesundem Verhalten zusammenhängt. Gollwitzer und Sheeran (2006) fassten Studien zu Wenn-dann-Plänen zusammen. Keine Therapie: Wenn es dir länger nicht gut geht, sprich mit einer Ärztin, einem Arzt oder einer Beratungsstelle.' },

  { id: 'passt.andere_streit', titel: 'Im Streit', bereich: 'Beziehungen', basis: 'vertraeglichkeit', alltag: 'vertraeglichkeit',
    pole: [{ name: 'Für die Sache', text: 'Du sprichst Dinge an, sagst klar, was dich stört, und klärst lieber gleich.' },
      { name: 'Für den Frieden', text: 'Du schonst die Beziehung, lässt Dinge auch mal gut sein und nimmst Spannung heraus.' }],
    wasEsIst: 'Streit gehört zu jeder engen Beziehung. Menschen gehen aber sehr verschieden damit um: Manche weichen aus, manche geben nach, manche setzen sich durch, manche suchen einen Kompromiss oder eine Lösung, mit der alle gut leben können. Diese Stile hängen ein Stück weit mit der Persönlichkeit zusammen. Kein Stil passt immer: Ausweichen schont kurzfristig, Durchsetzen klärt schnell, gemeinsames Lösen braucht Zeit. Hilfreich ist, den eigenen Stil zu kennen und bewusst wechseln zu können.',
    imAlltag: ['Was du tust, wenn sich jemand in der Schlange vordrängelt.', 'Ob du nach einem Streit als Erstes auf den anderen zugehst.', 'Wie lange ein ungeklärter Streit in dir nachklingt.', 'Ob du lieber schriftlich oder im Gespräch klärst.'],
    staerken: ['Für den Frieden: Beziehungen schonen und Spannung herausnehmen.', 'Für den Frieden: nicht jede Kleinigkeit zum Thema machen.', 'Für die Sache: Probleme früh ansprechen, bevor sie wachsen.', 'Für die Sache: klar sagen, was dich stört, damit andere es wissen.'],
    reibung: ['Wer oft ausweicht, schont kurzfristig – aber Themen kommen wieder.', 'Wer oft nachgibt, dessen Wünsche gehen leicht unter.', 'Wer sich oft durchsetzt, gewinnt den Streit und verliert manchmal Vertrauen.', 'Gemeinsames Lösen kostet Zeit und Geduld.'],
    weiterdenken: ['Wie bist du in deinem letzten Streit vorgegangen – und wie ging es dir danach?', 'Bei welchen Menschen fällt es dir leicht, etwas anzusprechen, bei welchen schwer?', 'Wie würde ein Satz anfangen, der klar und trotzdem freundlich ist?', 'Wann ist es klug, etwas gut sein zu lassen?'],
    ueben: [{ titel: 'Für dich einstehen', route: 'passt/wachstum/einstehen' }, { titel: 'Mehr Verständnis für andere', route: 'passt/wachstum/verstaendnis' }, { titel: 'Umgang mit anderen', route: 'passt/andere' }],
    verwandt: ['bigfive.vertraeglichkeit', 'bigfive.extraversion', 'passt.arbeit_miteinander', 'passt.andere_naehe', 'muster.kommunikation', 'muster.grenzen'],
    unteraeste: 'STREIT',   // wird in aeste() aus ANDERE.streit gebaut
    wissen: 'Antonioni (1998) untersuchte, wie die Big Five mit Stilen im Streit zusammenhängen: Wer verträglicher ist, weicht eher aus; wer extravertierter ist, setzt sich eher durch; Offenheit, Gewissenhaftigkeit und Extraversion gingen mit gemeinsamem Lösen einher. Die Zusammenhänge waren eher klein und wurden nicht überall bestätigt. Eigene Zusammenfassung.' },

  { id: 'passt.andere_naehe', titel: 'Nähe, Abstand und Gespräche', bereich: 'Beziehungen', basis: 'extraversion',
    pole: [{ name: 'Raum für dich', text: 'Du brauchst Zeit für dich – auch in engen Beziehungen – und denkst erst, bevor du sprichst.' },
      { name: 'Viel Austausch', text: 'Du suchst Nähe und Gespräch, denkst gern laut und hältst Kontakt lebendig.' }],
    wasEsIst: 'Wie viel Nähe und Austausch sich gut anfühlt, ist sehr verschieden. Manche Menschen möchten viel reden, viel teilen und oft zusammen sein; andere brauchen auch in engen Freundschaften viel Zeit für sich. Im Gespräch zeigt sich das ebenso: Die einen denken laut, die anderen erst im Stillen. Missverständnisse entstehen oft, wenn beide Seiten das Verhalten der anderen falsch deuten – Rückzug als Ablehnung oder Redefluss als Drängen. Offen zu sagen, was man braucht, nimmt solchen Missverständnissen viel Kraft.',
    imAlltag: ['Wie viele Nachrichten am Tag sich für dich gut anfühlen.', 'Ob du nach einem Treffen gleich das nächste planen möchtest oder erst Ruhe brauchst.', 'Ob du in Gesprächen schnell antwortest oder lieber später.', 'Wie du reagierst, wenn jemand Zeit für sich braucht.'],
    staerken: ['Raum für dich: tiefe Gespräche und durchdachte Antworten.', 'Raum für dich: Beziehungen, die nicht ständige Bestätigung brauchen.', 'Viel Austausch: Nähe zeigen und Kontakt halten.', 'Viel Austausch: Gespräche auflockern und Fragen stellen.'],
    reibung: ['Wer Raum braucht, wirkt ohne Erklärung schnell desinteressiert oder abweisend.', 'Wer Austausch sucht, wirkt auf ruhigere Menschen manchmal drängend.', 'Schweigen und Redefluss werden leicht falsch gedeutet.', 'Verschiedene Bedürfnisse führen ohne Absprache zu stillen Enttäuschungen.'],
    weiterdenken: ['Wie viel Zeit für dich brauchst du in einer Woche, um dich wohlzufühlen?', 'Wie kannst du sagen, dass du Zeit brauchst, ohne dass es wie Ablehnung klingt?', 'Mit wem fühlt sich Nähe leicht an – und woran liegt das?', 'Wann hast du zuletzt jemanden falsch verstanden, weil er anders tickt?'],
    ueben: [{ titel: 'Offener auf Leute zugehen', route: 'passt/wachstum/offener' }, { titel: 'Mehr Verständnis für andere', route: 'passt/wachstum/verstaendnis' }, { titel: 'Umgang mit anderen', route: 'passt/andere' }],
    verwandt: ['bigfive.extraversion', 'passt.andere_streit', 'passt.arbeit_team', 'muster.werte_ich_wir', 'muster.kommunikation'],
    unteraeste: [
      { id: 'zeit', titel: '„Ich melde mich morgen dazu“', text: 'Wer erst denkt und dann spricht, sagt anderen, dass er Zeit braucht. Sonst wirkt Schweigen wie Desinteresse.' },
      { id: 'pausen', titel: 'Pausen im Gespräch', text: 'Wer gern laut denkt, lässt bewusst Pausen und fragt nach – ruhigere Menschen brauchen einen Moment, bevor sie etwas sagen.' },
      { id: 'offen', titel: 'Bedürfnisse offen sagen', text: 'Mehr Zeit für sich zu brauchen ist keine Ablehnung, viel Austausch zu suchen kein Drängen. Wer das ausspricht, nimmt dem anderen das Rätseln ab.' }],
    wissen: 'Extraversion ist einer der Big-Five-Grundzüge. Malouff und andere (2010) fassten 19 Stichproben zur Zufriedenheit in Partnerschaften zusammen; die Zusammenhänge mit der Persönlichkeit waren klein und sagen nichts über einzelne Paare. Eigene Zusammenfassung: Die Hinweise beschreiben Unterschiede, nicht, wer im Recht ist.' },

  { id: 'passt.wachstum', titel: 'Wachsen – wenn du willst', bereich: 'Üben',
    wasEsIst: 'Persönlichkeit ist nicht in Stein gemeißelt. Sie verändert sich über das Leben von selbst – zwischen 20 und 40 werden Menschen im Mittel gewissenhafter und gelassener – und sie lässt sich ein Stück weit gezielt verändern. In Studien veränderten sich Menschen, die das wollten und über Wochen kleine Herausforderungen wirklich machten, im Mittel in die gewünschte Richtung. Nur vornehmen reicht dabei nicht: Wer Herausforderungen annahm, aber nicht machte, veränderte sich eher in die Gegenrichtung. Wachsen ist ein Angebot, keine Pflicht – du bist so, wie du bist, in Ordnung.',
    imAlltag: ['Eine Eigenschaft, die du an anderen bewunderst und gern etwas mehr hättest.', 'Situationen, in denen du dir wünschst, anders zu reagieren.', 'Kleine Schritte, die du schon einmal durchgehalten hast.'],
    staerken: ['Kleine, konkrete Herausforderungen machen Veränderung greifbar.', 'Wer selbst wählt, was er üben will, bleibt eher dabei.', 'Veränderung in kleinen Schritten fühlt sich weniger bedrohlich an.', 'Schon das Ausprobieren zeigt dir neue Seiten an dir.'],
    reibung: ['Jede Richtung hat eine Kehrseite: mehr Plan heißt etwas weniger spontan, mehr Kontakt kostet ruhigere Menschen Kraft.', 'Vorsätze ohne Taten können eher entmutigen.', 'Veränderung braucht Wochen – einzelne Tage sagen wenig.', 'Wer sich zu viel auf einmal vornimmt, gibt leichter auf.'],
    weiterdenken: ['Warum möchtest du etwas verändern – für dich, für andere, für ein Projekt?', 'Welche kleine Herausforderung könntest du diese Woche wirklich machen?', 'Woran würdest du merken, dass sich etwas verändert hat?', 'Was möchtest du an dir ausdrücklich so lassen, wie es ist?'],
    ueben: [{ titel: 'Richtung wählen', route: 'passt/wachstum' }, { titel: 'Herausforderungen im Training', route: 'training/wachsen' }, { titel: 'Training', route: 'training' }],
    verwandt: ['passt.staerken', 'passt.selbst', 'muster.lernen', 'bigfive.gewissenhaftigkeit', 'bigfive.stabilitaet', 'bigfive.extraversion'],
    unteraeste: 'WACHSTUM',   // wird in aeste() aus WACHSTUM.richtungen gebaut
    wissen: 'Roberts, Walton und Viechtbauer (2006) fassten Langzeitstudien zur Veränderung der Persönlichkeit über das Leben zusammen. Hudson und Fraley (2015) sowie Hudson und andere (2019) zeigten, dass gewollte Veränderung mit kleinen Herausforderungen gelingen kann – wenn man sie wirklich macht. Stieger und andere (2021) begleiteten Menschen drei Monate lang mit einer App zur gewünschten Veränderung. Hudson und Roberts (2014) fanden, dass die meisten Menschen etwas an sich ändern möchten. Eigene Zusammenfassung.' }
];
