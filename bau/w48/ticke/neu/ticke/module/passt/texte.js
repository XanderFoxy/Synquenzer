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
  interesse: { text: (name) => `${name} zieht dich deutlich an. Was zu den eigenen Interessen passt, machen Menschen im Mittel besser und bleiben länger dabei.`, stufe: 'belegt', quellen: ['nye2012'],
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
