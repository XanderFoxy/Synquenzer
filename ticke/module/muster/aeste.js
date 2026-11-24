// muster – Lerninhalt der Äste (unabhängig von den Antworten). 8 Äste mit Fragen („Denkweise“) + 9 reine Lern-Äste.
// Ton: beschreibend, warm, ohne Diagnose, ohne Wertung. Beide Pole sind gleichwertig und haben Stärken.
// Format (Vertrag aeste()): { id, titel, bereich, pole?, wasEsIst, imAlltag[], staerken[], reibung[], weiterdenken[], ueben?, verwandt?, unteraeste?, wissen }
// Zusätzlich: wege (nur „Sinn“: drei gleichwertige Wege), fragen: true (Ast hat Aussagen im Fragebogen), nurLernen: true (Ast ohne Fragen).

const U = (id, titel) => ({ titel, route: 'training/uebung/' + id });

export const AESTE = [
  // ======================================================================= mit Fragen
  {
    id: 'muster.neugier_denken', titel: 'Lust am Nachdenken', bereich: 'Denkweise', fragen: true,
    pole: [
      { name: 'Denken als Freude', text: 'Du denkst gern um des Denkens willen: Fragen, Ideen und Zusammenhänge sind dir schon an sich etwas wert – auch ohne sofortigen Nutzen.' },
      { name: 'Denken als Werkzeug', text: 'Du denkst gezielt: Nachdenken ist für dich ein Werkzeug, das zu einer Lösung, einer Handlung oder einem Ergebnis führen soll.' }
    ],
    wasEsIst: 'Menschen unterscheiden sich darin, wie viel Freude ihnen das Nachdenken selbst macht. Die Psychologie nennt das „Bedürfnis nach Kognition“: Manche suchen geistige Herausforderungen und knobeln gern an schwierigen Fragen, andere setzen ihr Denken lieber sparsam und zielgerichtet ein. Das ist keine Frage von klug oder weniger klug, sondern eine Art, mit der eigenen Aufmerksamkeit umzugehen. Wer gern nachdenkt, entdeckt oft Zusammenhänge; wer gezielt denkt, kommt oft schneller ins Handeln. Die meisten Menschen tragen beides in sich und wechseln je nach Thema.',
    imAlltag: [
      'Ein Gespräch über eine große Frage kann dich lange beschäftigen – oder du fragst bald: „Und was heißt das jetzt konkret?“',
      'Beim Lesen oder Zuhören suchst du eher das Warum oder eher das Wie.',
      'Vor einer Aufgabe denkst du sie gern einmal ganz durch – oder du fängst an und denkst unterwegs.',
      'Rätsel, Gedankenspiele und Diskussionen wirken auf dich anregend oder eher wie ein Umweg.'
    ],
    staerken: [
      'Denken als Freude: Tiefe, Ausdauer bei schwierigen Fragen und ein Blick für Zusammenhänge.',
      'Denken als Freude: Du kannst dich in ein Thema versenken und lernst dabei oft nebenbei sehr viel.',
      'Denken als Werkzeug: Klarheit darüber, was wirklich gebraucht wird – du verlierst dich selten.',
      'Denken als Werkzeug: Du kommst ins Handeln und prüfst Ideen an der Wirklichkeit.'
    ],
    reibung: [
      'Lange Gedankengänge können andere ungeduldig machen, die schon loslegen wollen.',
      'Wer schnell zum Praktischen will, wirkt auf Nachdenkliche manchmal vorschnell.',
      'Ein Gedanke kann sich im Kreis drehen, wenn kein nächster Schritt in Sicht ist.',
      'Ganz ohne Umwege im Denken bleibt manchmal eine bessere Lösung unentdeckt.'
    ],
    weiterdenken: [
      'Bei welchen Themen vergisst du beim Nachdenken die Zeit?',
      'Wann hat dir ein Gedanke, der erst „nutzlos“ wirkte, später geholfen?',
      'Wann wäre es dir lieber, einfach anzufangen, statt weiter zu überlegen?',
      'Mit wem kannst du am besten laut nachdenken?'
    ],
    unteraeste: [
      { id: 'warum', titel: 'Warum-Denken', text: 'Die Lust, Ursachen und Hintergründe zu verstehen. Sie treibt Philosophie und Forschung an – und kleine Alltagsfragen wie „Warum ärgert mich das eigentlich?“.' },
      { id: 'wie', titel: 'Wie-Denken', text: 'Die Lust, Wege und Lösungen zu finden. Sie zeigt sich im Basteln, Planen und Reparieren und darin, Ideen schnell auszuprobieren.' },
      { id: 'staunen', titel: 'Staunen', text: 'Platon und Aristoteles nannten das Staunen den Anfang der Philosophie: den Moment, in dem etwas Selbstverständliches plötzlich fragwürdig wird.' }
    ],
    ueben: [U('l-warum', 'Warum-Fragen stellen'), U('l-erklaeren', 'Erklär es ganz einfach')],
    verwandt: ['muster.ungewissheit', 'muster.entscheiden', 'muster.denkfallen', 'bigfive.offenheit', 'interessen.I'],
    wissen: 'Das „Bedürfnis nach Kognition“ (englisch need for cognition) beschrieben John T. Cacioppo und Richard E. Petty 1982: die Neigung, sich gern mit anstrengendem Denken zu beschäftigen. Es hängt mit der Offenheit aus den Big Five zusammen, ist aber nicht dasselbe. Die Philosophie kennt die Frage seit der Antike: Platon (im Dialog „Theaitetos“) und Aristoteles (in der „Metaphysik“) sahen im Staunen den Anfang des Philosophierens. Die Aussagen in dieser App sind selbst formuliert und keine geprüfte Skala.'
  },
  {
    id: 'muster.ungewissheit', titel: 'Umgang mit Offenem', bereich: 'Denkweise', fragen: true,
    pole: [
      { name: 'Spielraum im Offenen', text: 'Unklares darf eine Weile unklar bleiben. Mehrdeutigkeit ist für dich eher Spielraum als Bedrohung.' },
      { name: 'Halt in der Klarheit', text: 'Du schaffst gern Klarheit: Eindeutige Absprachen, klare Regeln und ein fester Rahmen geben dir Ruhe und Kraft.' }
    ],
    wasEsIst: 'Das Leben ist voller offener Fragen: Wie entscheidet sich jemand? Was meint eine Nachricht genau? Wie geht es weiter? Die Fähigkeit, solche Mehrdeutigkeit auszuhalten, heißt in der Psychologie Ambiguitätstoleranz. Auf der anderen Seite steht das Bedürfnis nach Klarheit und Abschluss – der Wunsch, offene Fragen zu klären und Ordnung zu schaffen. Beides hat seinen Wert: Wer Offenes aushält, bleibt beweglich und neugierig; wer Klarheit schafft, gibt sich und anderen Sicherheit und Richtung. Wie stark du in eine Richtung neigst, kann sich mit der Lage ändern, etwa unter Zeitdruck oder wenn du müde bist.',
    imAlltag: [
      'Eine Nachricht ohne klare Aussage lässt dich gelassen – oder du fragst lieber gleich nach.',
      'Bei Plänen magst du offene Enden oder feste Uhrzeiten.',
      'Ein Bild, ein Film oder ein Gedicht ohne eindeutige Deutung reizt dich oder lässt dich unruhig zurück.',
      'In neuen Situationen schaust du erst, was sich ergibt – oder du klärst zuerst die Regeln.'
    ],
    staerken: [
      'Spielraum im Offenen: Du hältst Widersprüche aus und lässt mehrere Sichtweisen nebeneinander stehen.',
      'Spielraum im Offenen: In unübersichtlichen Lagen bleibst du beweglich und offen für Überraschungen.',
      'Halt in der Klarheit: Du sorgst für klare Absprachen, auf die sich andere verlassen können.',
      'Halt in der Klarheit: Du bringst Dinge zum Abschluss und schaffst Ordnung, wo es wirr wird.'
    ],
    reibung: [
      'Wer viel offen lässt, kann für andere schwer greifbar wirken.',
      'Wer schnell Klarheit will, entscheidet manchmal früher, als die Lage es erlaubt.',
      'Zwischen beiden Haltungen entstehen leicht Missverständnisse: Die eine Seite fühlt sich gedrängt, die andere hingehalten.',
      'Dauerhafte Ungewissheit kostet fast alle Menschen Kraft – auch die, die sie gut aushalten.'
    ],
    weiterdenken: [
      'Welche offene Frage in deinem Leben darfst du gerade einfach offen lassen?',
      'Wo würde dir ein klarer Rahmen gerade guttun?',
      'Woran merkst du, dass dich Ungewissheit zu viel Kraft kostet?',
      'Was hilft dir, wenn du etwas nicht wissen kannst?'
    ],
    unteraeste: [
      { id: 'abschluss', titel: 'Bedürfnis nach Abschluss', text: 'Der Wunsch, eine Frage zu klären und dann dabei zu bleiben. Unter Zeitdruck und Müdigkeit wird er bei vielen Menschen stärker.' },
      { id: 'mehrdeutig', titel: 'Mehrdeutigkeit in Kunst und Sprache', text: 'Gedichte, Bilder und Witze leben oft davon, dass sie mehr als eine Deutung zulassen. Hier üben viele Menschen ganz nebenbei, Offenes zu genießen.' },
      { id: 'planen', titel: 'Planen im Ungewissen', text: 'Ein Weg zwischen beiden Polen: grob planen, fest vereinbaren, was wichtig ist, und den Rest bewusst offen lassen.' }
    ],
    ueben: [U('f-parkplatz', 'Gedanken-Parkplatz'), U('k-sorgen-zeit', 'Feste Grübel-Zeit')],
    verwandt: ['muster.neugier_denken', 'muster.kontrolle', 'muster.entscheiden', 'muster.stress', 'bigfive.offenheit'],
    wissen: 'Den Begriff „Intoleranz gegenüber Mehrdeutigkeit“ (intolerance of ambiguity) prägte die Psychologin Else Frenkel-Brunswik 1949; sie beschrieb, wie unterschiedlich Menschen auf Mehrdeutiges reagieren. Daraus entstand die Idee der Ambiguitätstoleranz. Arie Kruglanski und Kollegen untersuchten seit den 1990er Jahren das „Bedürfnis nach kognitiver Geschlossenheit“, den Wunsch nach einer festen Antwort – er wird unter Zeitdruck und Müdigkeit stärker. Die Aussagen in dieser App sind selbst formuliert und keine geprüfte Skala.'
  },
  {
    id: 'muster.lernen', titel: 'Wie du über Lernen denkst', bereich: 'Denkweise', fragen: true,
    pole: [
      { name: 'Fähigkeiten wachsen', text: 'Du siehst Fähigkeiten als etwas, das durch Üben wächst. Anstrengung ist für dich ein Weg, kein Zeichen von Schwäche.' },
      { name: 'Begabungen nutzen', text: 'Du gehst davon aus, dass jedem Menschen manches besonders liegt – und steckst deine Kraft gern dorthin, wo deine Stärken sind.' }
    ],
    wasEsIst: 'Jeder Mensch hat eine Art innere Theorie darüber, wie Lernen funktioniert. Die Psychologin Carol Dweck unterschied zwei Sichtweisen: Fähigkeiten als etwas, das wächst, und Fähigkeiten als etwas eher Festes. In Ratgebern wurde daraus oft „gutes“ und „schlechtes“ Denken – das greift zu kurz. Die Sicht „Fähigkeiten wachsen“ hilft, dranzubleiben, wenn etwas schwer ist. Die Sicht „Begabungen nutzen“ hilft, die eigene Kraft dort einzusetzen, wo sie am meisten bewirkt, statt sich an allem gleichzeitig abzuarbeiten. Viele Menschen denken bei verschiedenen Fähigkeiten verschieden – beim Sport anders als bei Mathe oder Musik.',
    imAlltag: [
      'Wenn dir etwas misslingt, denkst du eher „Das übe ich noch“ oder eher „Das liegt mir nicht – dafür etwas anderes“.',
      'Bei einem neuen Hobby bleibst du lange dran oder wählst bald, was dir leichtfällt.',
      'Lob für Fleiß und Lob für Talent fühlen sich für dich unterschiedlich an.',
      'Du suchst dir Aufgaben, die dich fordern, oder solche, in denen du richtig gut werden kannst.'
    ],
    staerken: [
      'Fähigkeiten wachsen: Ausdauer bei Schwierigem – Rückschläge werden zu Lernschritten.',
      'Fähigkeiten wachsen: Du traust dir zu, Neues von Grund auf zu lernen.',
      'Begabungen nutzen: Du kennst deine Stärken und setzt deine Energie gezielt ein.',
      'Begabungen nutzen: Du kannst gelassen annehmen, dass nicht alles dir liegen muss.'
    ],
    reibung: [
      'Wer überall Wachstum sieht, kann sich überfordern – nicht jedes Ziel lohnt jede Mühe.',
      'Wer auf Begabungen baut, lässt manches vielleicht früh liegen, das mit Übung gekommen wäre.',
      'Andere können deine Sicht als Druck („Streng dich einfach an“) oder als Bremse („Das ist halt so“) erleben.'
    ],
    weiterdenken: [
      'Bei welcher Fähigkeit hast du erlebt, dass sie durch Üben gewachsen ist?',
      'Welche Stärke von dir war schon immer da?',
      'Wo lohnt sich für dich Üben – und wo darfst du loslassen?',
      'Wie redest du innerlich mit dir, wenn du etwas noch nicht kannst?'
    ],
    unteraeste: [
      { id: 'ueben', titel: 'Gezieltes Üben', text: 'Die Forschung zur Expertise (K. Anders Ericsson) zeigt: Fortschritt kommt vor allem durch Übung an der Grenze des eigenen Könnens, mit Rückmeldung – nicht durch bloßes Wiederholen. Spätere Studien zeigen auch: Übung erklärt viel, aber nicht alles.' },
      { id: 'staerken', titel: 'Stärken kennen', text: 'Die Positive Psychologie (u. a. Christopher Peterson und Martin Seligman) beschreibt Charakterstärken wie Neugier, Ausdauer oder Freundlichkeit und schlägt vor, die eigenen Stärken bewusst einzusetzen.' },
      { id: 'fehler', titel: 'Fehler und Lernen', text: 'Fehler zeigen, wo die Grenze des Könnens gerade liegt. Wie man sie deutet – als Hinweis oder als Urteil –, verändert, wie sie sich anfühlen.' }
    ],
    ueben: [U('l-abfragen', 'Abfragen statt wiederlesen'), U('l-verteilen', 'Wiederholen mit Abstand'), U('w-staerke', 'Eine Stärke neu einsetzen')],
    verwandt: ['muster.kontrolle', 'muster.selbstmitgefuehl', 'bigfive.gewissenhaftigkeit', 'training.lernen', 'training.wachsen'],
    wissen: 'Carol S. Dweck beschrieb mit Ellen Leggett 1988 „implizite Theorien“ über Fähigkeiten und machte sie 2006 mit dem Buch „Mindset“ bekannt. Große spätere Studien fanden, dass kurze Mindset-Trainings im Mittel nur kleine Wirkungen haben – das Bild ist vorsichtiger als in vielen Ratgebern. Zum gezielten Üben forschte K. Anders Ericsson (ab 1993), zu Charakterstärken Christopher Peterson und Martin Seligman (2004). Die Aussagen in dieser App sind selbst formuliert und keine geprüfte Skala.'
  },
  {
    id: 'muster.kontrolle', titel: 'Was in deiner Hand liegt', bereich: 'Denkweise', fragen: true,
    pole: [
      { name: 'In deiner Hand', text: 'Du erlebst vieles als beeinflussbar: Was passiert, hängt für dich stark davon ab, was du tust.' },
      { name: 'Im Lauf der Dinge', text: 'Du siehst deutlich, wie viel von Umständen, Zufall und anderen Menschen abhängt – und kannst annehmen, was sich nicht ändern lässt.' }
    ],
    wasEsIst: 'Wie viel liegt in deiner Hand? Der Psychologe Julian Rotter nannte das Kontrollüberzeugung: Manche Menschen erleben Ereignisse eher als Folge ihres eigenen Handelns, andere eher als Folge von Umständen, Zufall oder anderen Menschen. Schon die Stoiker vor rund 2000 Jahren machten daraus eine Lebenskunst: unterscheiden, was in unserer Macht steht und was nicht, und die Kraft dorthin lenken, wo sie etwas bewirken kann. Beide Blickrichtungen sehen etwas Wahres. Wer gestaltet, übernimmt Verantwortung; wer die Grenzen sieht, bleibt realistisch und gelassen.',
    imAlltag: [
      'Nach einem Erfolg denkst du eher „Das habe ich geschafft“ oder „Da hatte ich Glück“.',
      'Bei einem verpassten Zug ärgerst du dich über dich – oder nimmst es als Lauf der Dinge.',
      'Du planst lieber selbst oder lässt die Dinge auf dich zukommen.',
      'In Gruppen übernimmst du Verantwortung oder schaust, wie sich alles fügt.'
    ],
    staerken: [
      'In deiner Hand: Tatkraft, Verantwortung und das Gefühl, etwas bewirken zu können.',
      'In deiner Hand: Du suchst nach Wegen statt nach Gründen, warum es nicht geht.',
      'Im Lauf der Dinge: Gelassenheit und Demut – nicht alles muss an dir hängen.',
      'Im Lauf der Dinge: Du gibst dir nicht für alles selbst die Schuld und siehst auch die Umstände anderer.'
    ],
    reibung: [
      'Wer viel für beeinflussbar hält, nimmt sich Misserfolge manchmal sehr zu Herzen.',
      'Wer viel den Umständen zuschreibt, lässt vielleicht eine Chance verstreichen, die in Reichweite war.',
      'Bei Dingen, die sich wirklich nicht ändern lassen, kostet ständiges Kämpfen viel Kraft.'
    ],
    weiterdenken: [
      'Was liegt in deiner jetzigen Lage wirklich in deiner Hand – und was nicht?',
      'Woran erkennst du, wann sich Kämpfen lohnt und wann Annehmen?',
      'Gibt es etwas, für das du dir mehr Verantwortung gibst, als dir zusteht?',
      'Welcher kleine Schritt wäre heute möglich?'
    ],
    unteraeste: [
      { id: 'stoa', titel: 'Die stoische Unterscheidung', text: 'Epiktet beginnt sein „Handbüchlein“ mit dem Gedanken, dass manches in unserer Macht steht – unser Urteilen, Wollen und Handeln – und anderes nicht. Ruhe entsteht, wenn man das eine pflegt und das andere gelassen nimmt.' },
      { id: 'selbstwirksamkeit', titel: 'Selbstwirksamkeit', text: 'Albert Bandura beschrieb 1977 die Erwartung, eine bestimmte Aufgabe selbst bewältigen zu können. Sie wächst vor allem durch eigene kleine Erfolge.' },
      { id: 'gelassenheit', titel: 'Gelassenheit', text: 'Ein bekanntes Gebet, meist Reinhold Niebuhr zugeschrieben, bittet um Gelassenheit für das, was man nicht ändern kann, um Mut für das, was man ändern kann, und um Weisheit, das eine vom anderen zu unterscheiden.' }
    ],
    ueben: [U('z-schritt', 'Nur der nächste Schritt'), U('z-wenndann', 'Wenn-dann-Plan'), U('k-neubewerten', 'Anders hinschauen')],
    verwandt: ['muster.ungewissheit', 'muster.lernen', 'muster.stress', 'bigfive.stabilitaet', 'bigfive.gewissenhaftigkeit', 'textspiegel.haltung'],
    wissen: 'Julian B. Rotter veröffentlichte 1966 seine Arbeit zur „internalen und externalen Kontrollüberzeugung“ (locus of control). Albert Bandura beschrieb 1977 die Selbstwirksamkeit. Die stoische Unterscheidung stammt von Epiktet (etwa 50–135 n. Chr.), dessen Lehren sein Schüler Arrian im „Handbüchlein der Moral“ festhielt; auch Seneca und Mark Aurel schrieben darüber. Die Aussagen in dieser App sind selbst formuliert und keine geprüfte Skala.'
  },
  {
    id: 'muster.entscheiden', titel: 'Bauch und Kopf', bereich: 'Entscheiden', fragen: true,
    pole: [
      { name: 'Aus dem Bauch', text: 'Du vertraust oft deinem ersten Gespür. Erfahrung arbeitet bei dir schnell und leise im Hintergrund.' },
      { name: 'Mit dem Kopf', text: 'Du wägst gern ab: Gründe, Vor- und Nachteile, Folgen. Du entscheidest lieber, wenn du es dir erklären kannst.' }
    ],
    wasEsIst: 'Entscheiden geht auf zwei Wegen: schnell und intuitiv oder langsam und überlegt. Daniel Kahneman beschrieb das als zwei Denkweisen, die in allen Menschen arbeiten – ein schnelles, müheloses „System 1“ und ein langsames, anstrengendes „System 2“. Der Bauch ist dabei nicht dumm: Gerd Gigerenzer zeigte, dass einfache Faustregeln und Intuition gerade in vertrauten oder sehr unsicheren Lagen oft gut funktionieren. Der Kopf hilft, wo eine Lage neu ist, viel auf dem Spiel steht oder sich der Bauch leicht täuschen lässt. Menschen haben meist eine Lieblingsrichtung, nutzen aber beide.',
    imAlltag: [
      'Im Restaurant weißt du sofort, was du willst – oder du liest die ganze Karte.',
      'Vor einem Kauf vergleichst du lange oder nimmst, was sich richtig anfühlt.',
      'Von Menschen hast du schnell einen Eindruck – oder lernst sie lieber erst kennen.',
      'Nach einer Entscheidung denkst du noch lange darüber nach oder schaust nach vorn.'
    ],
    staerken: [
      'Aus dem Bauch: Schnelligkeit, Spontaneität und ein gutes Gespür, wo du dich auskennst.',
      'Aus dem Bauch: Du nimmst Zwischentöne wahr, die sich schwer in Worte fassen lassen.',
      'Mit dem Kopf: Gründlichkeit und gute Begründungen, die du anderen erklären kannst.',
      'Mit dem Kopf: Du durchschaust leichter Denkfallen und Lockangebote.'
    ],
    reibung: [
      'Der Bauch kann sich bei Neuem, bei Zahlen oder bei geschickter Werbung täuschen.',
      'Langes Abwägen kann müde machen und eine gute Gelegenheit verstreichen lassen.',
      'Bauch-Menschen und Kopf-Menschen halten einander manchmal für leichtsinnig oder umständlich.',
      'Bei sehr vielen Möglichkeiten fällt fast allen Menschen die Wahl schwerer.'
    ],
    weiterdenken: [
      'Welche deiner Bauch-Entscheidungen war im Nachhinein gut – und warum?',
      'Bei welchen Themen traust du deinem Gefühl, bei welchen eher nicht?',
      'Wie fühlt sich eine Entscheidung an, die Kopf und Bauch beide mittragen?',
      'Wann reicht „gut genug“ statt „das Beste“?'
    ],
    unteraeste: [
      { id: 'schnell', titel: 'Schnelles Denken', text: 'Automatisch, mühelos, in Bildern und Gefühlen. Es erkennt Gesichter, Stimmungen und vertraute Muster in Sekundenbruchteilen.' },
      { id: 'langsam', titel: 'Langsames Denken', text: 'Bewusst, anstrengend, Schritt für Schritt. Es rechnet, vergleicht und prüft – und ermüdet schneller.' },
      { id: 'gut_genug', titel: '„Gut genug“ wählen', text: 'Herbert Simon beschrieb das „Satisficing“: nicht die beste, sondern eine ausreichend gute Lösung wählen. Barry Schwartz fand Hinweise, dass Menschen, die immer das Beste suchen, mit ihren Entscheidungen oft weniger zufrieden sind.' },
      { id: 'koerper', titel: 'Körpersignale', text: 'Antonio Damasio vermutete, dass Gefühle und Körpersignale („somatische Marker“) Entscheidungen mitlenken – ein Grund, warum ein Bauchgefühl mehr sein kann als eine Laune.' }
    ],
    ueben: [U('f-wichtigstes', 'Das Wichtigste zuerst'), U('z-woop', 'WOOP: Wunsch, Ergebnis, Hindernis, Plan')],
    verwandt: ['muster.denkfallen', 'muster.ungewissheit', 'muster.neugier_denken', 'bigfive.gewissenhaftigkeit', 'textspiegel.haltung'],
    wissen: 'Daniel Kahneman fasste seine Forschung mit Amos Tversky im Buch „Schnelles Denken, langsames Denken“ zusammen (2011, deutsch 2012); die Begriffe System 1 und System 2 gehen auf Keith Stanovich und Richard West zurück. Gerd Gigerenzer zeigte in „Bauchentscheidungen“ (2007), wann einfache Faustregeln klug sind. Seymour Epstein beschrieb ein rationales und ein erfahrungsgeleitetes Denksystem, die Menschen unterschiedlich gern nutzen. Die Aussagen in dieser App sind selbst formuliert und keine geprüfte Skala.'
  },
  {
    id: 'muster.werte_wandel', titel: 'Bewahren und Verändern', bereich: 'Werte', fragen: true,
    pole: [
      { name: 'Bewahren', text: 'Dir ist wichtig, was trägt: Verlässlichkeit, Sicherheit, gewachsene Bindungen und Traditionen.' },
      { name: 'Verändern', text: 'Dich zieht das Neue: eigene Wege, Abwechslung und Aufbruch – auch wenn das Alte noch funktioniert.' }
    ],
    wasEsIst: 'Werte sind das, was uns im Leben wichtig ist und woran wir uns orientieren. Der Werteforscher Shalom Schwartz fand in Befragungen in Dutzenden Ländern immer wieder eine ähnliche Ordnung. Auf der einen Seite stehen Werte des Bewahrens – Sicherheit, Tradition, Rücksicht auf Regeln. Auf der anderen Seite Werte der Offenheit für Wandel – Selbstbestimmung, Abwechslung, Anregung. Beide Seiten stehen in Spannung, aber ein Leben braucht beide: Wurzeln und Flügel. Die meisten Menschen tragen beide in sich und gewichten sie unterschiedlich.',
    imAlltag: [
      'Rituale wie Feiertage, Familientraditionen oder feste Abläufe geben dir Halt – oder werden dir bald zu eng.',
      'Bei einem Umzug, Jobwechsel oder neuen Plan überwiegt Vorfreude oder Abschiedsschmerz.',
      'Du pflegst alte Freundschaften oder bist offen für neue Kreise.',
      'Neue Technik und neue Moden probierst du früh – oder wartest ab, ob sie sich bewähren.'
    ],
    staerken: [
      'Bewahren: Verlässlichkeit, Treue und Sorgfalt mit dem, was gewachsen ist.',
      'Bewahren: Du gibst anderen Sicherheit und erinnerst daran, was sich bewährt hat.',
      'Verändern: Mut zum Neuen, Neugier und Anpassungsfähigkeit.',
      'Verändern: Du bringst frischen Wind und siehst Möglichkeiten, wo andere Gewohnheit sehen.'
    ],
    reibung: [
      'Wer bewahrt, erlebt schnelle Veränderung leicht als Verlust.',
      'Wer verändert, unterschätzt manchmal, was am Alten gut war.',
      'In Familien und Teams prallen beide Seiten oft aufeinander – meist meinen es beide gut.'
    ],
    weiterdenken: [
      'Was in deinem Leben möchtest du unbedingt bewahren?',
      'Was würdest du verändern, wenn der Wechsel dir leichtfiele?',
      'Welche Tradition hast du dir selbst ausgesucht?',
      'Woran merkst du, dass dir etwas Neues guttut?'
    ],
    unteraeste: [
      { id: 'sicherheit', titel: 'Sicherheit', text: 'Der Wunsch nach Schutz, Ordnung und Stabilität – für sich, die Familie und die Gemeinschaft.' },
      { id: 'tradition', titel: 'Tradition', text: 'Achtung vor Bräuchen und Ideen, die eine Familie, Kultur oder Religion weitergibt.' },
      { id: 'anregung', titel: 'Anregung', text: 'Die Lust auf Abwechslung, Neues und Herausforderungen.' },
      { id: 'selbstbestimmung', titel: 'Selbstbestimmung', text: 'Eigenständig denken und handeln, selbst wählen, selbst erkunden.' }
    ],
    ueben: [U('w-werte', 'Was dir wichtig ist'), U('w-mutprobe', 'Eine kleine Mutprobe')],
    verwandt: ['muster.werte_ich_wir', 'muster.sinn', 'muster.gewohnheiten', 'muster.naehe', 'bigfive.offenheit', 'textspiegel.zeit'],
    wissen: 'Shalom H. Schwartz stellte 1992 seine Theorie grundlegender menschlicher Werte vor: zehn Werte, die sich in Befragungen in vielen Ländern wie in einem Kreis anordnen. Benachbarte Werte vertragen sich, gegenüberliegende stehen in Spannung. Eine der beiden Hauptachsen verläuft zwischen „Offenheit für Wandel“ und „Bewahrung“, die andere zwischen „Selbst-Erhöhung“ und „Selbst-Überwindung“. 2012 verfeinerte er die Theorie auf 19 Werte. Die Aussagen in dieser App sind selbst formuliert und nicht der Werte-Fragebogen von Schwartz.'
  },
  {
    id: 'muster.werte_ich_wir', titel: 'Ich und Wir', bereich: 'Werte', fragen: true,
    pole: [
      { name: 'Selbstbestimmung', text: 'Du gehst gern deinen eigenen Weg: selbst entscheiden, unabhängig sein, deinem Urteil folgen.' },
      { name: 'Verbundenheit', text: 'Du fühlst dich in Gemeinschaft zu Hause: Zusammenhalt, Rücksicht und das Wohl der Menschen um dich sind dir wichtig.' }
    ],
    wasEsIst: 'Jeder Mensch braucht beides: Raum für sich und Verbindung mit anderen. Die Selbstbestimmungstheorie von Edward Deci und Richard Ryan zählt Autonomie und soziale Eingebundenheit zu den psychischen Grundbedürfnissen – neben dem Erleben, etwas zu können. Trotzdem setzen Menschen unterschiedliche Schwerpunkte. Manche finden Kraft darin, unabhängig zu entscheiden; andere darin, Teil eines Wir zu sein und füreinander da zu sein. Kulturen unterscheiden sich darin ebenso wie einzelne Menschen, und auch die Lebensphase spielt eine Rolle.',
    imAlltag: [
      'Bei einer Gruppenentscheidung bringst du deine eigene Meinung ein oder schaust, was für alle passt.',
      'Du arbeitest lieber allein und frei oder im Team.',
      'Wenn Freunde etwas anderes wollen als du, gehst du deinen Weg oder gehst mit.',
      'Ein freier Tag allein fühlt sich nach Freiheit an – oder bald nach zu wenig Gesellschaft.'
    ],
    staerken: [
      'Selbstbestimmung: Eigenständigkeit, ein klarer innerer Kompass, Mut zum eigenen Urteil.',
      'Selbstbestimmung: Du lässt dich nicht leicht von Gruppendruck lenken.',
      'Verbundenheit: Loyalität, Fürsorge und ein Gespür dafür, was andere brauchen.',
      'Verbundenheit: Du hältst Gemeinschaften zusammen und stärkst andere.'
    ],
    reibung: [
      'Wer stark selbstbestimmt lebt, kann auf andere distanziert wirken.',
      'Wer stark verbunden lebt, stellt eigene Wünsche manchmal weit hinten an.',
      'Nähe und Freiheit wollen in jeder Beziehung immer wieder neu ausgehandelt werden.'
    ],
    weiterdenken: [
      'Wann fühlst du dich am freiesten – und wann am meisten zugehörig?',
      'Wen würdest du fragen, bevor du eine große Entscheidung triffst?',
      'Wo sagst du „Ja“, obwohl du eigentlich etwas anderes willst?',
      'Was gibst du einer Gemeinschaft, das nur du geben kannst?'
    ],
    unteraeste: [
      { id: 'autonomie', titel: 'Autonomie', text: 'Das Erleben, aus eigenem Antrieb zu handeln – nicht unbedingt allein, sondern aus eigener Zustimmung.' },
      { id: 'eingebunden', titel: 'Eingebundenheit', text: 'Das Erleben, zu anderen zu gehören, gemocht zu werden und für andere wichtig zu sein.' },
      { id: 'wirken', titel: 'Wirken und Gemeinschaft', text: 'David Bakan beschrieb 1966 zwei Grundzüge menschlichen Lebens: das eigene Wirken (agency) und die Gemeinschaft (communion). Viele spätere Theorien greifen dieses Paar auf.' }
    ],
    ueben: [U('a-grenze', 'Freundlich Nein sagen'), U('a-melden', 'Einfach mal melden')],
    verwandt: ['muster.werte_wandel', 'muster.grenzen', 'muster.naehe', 'bigfive.vertraeglichkeit', 'bigfive.extraversion', 'interessen.S', 'textspiegel.wer'],
    wissen: 'Edward L. Deci und Richard M. Ryan entwickelten seit den 1980er Jahren die Selbstbestimmungstheorie mit den drei Grundbedürfnissen Autonomie, Kompetenz und soziale Eingebundenheit. David Bakan beschrieb 1966 das Begriffspaar „agency“ und „communion“. Im Werte-Kreis von Shalom Schwartz stehen Selbstbestimmung und Wohlwollen gegenüber nahestehenden Menschen als eigene Werte. Die Aussagen in dieser App sind selbst formuliert und keine geprüfte Skala.'
  },
  {
    id: 'muster.sinn', titel: 'Woraus du Sinn ziehst', bereich: 'Werte', fragen: true,
    wege: [
      { name: 'Schaffen', text: 'Sinn durch das, was du tust, gestaltest oder anderen gibst – ein Werk, eine Aufgabe, eine Tat.' },
      { name: 'Erleben', text: 'Sinn durch das, was du erlebst – Begegnung, Liebe, Natur, Kunst, Musik, Schönheit.' },
      { name: 'Haltung', text: 'Sinn durch die Art, wie du dem begegnest, was sich nicht ändern lässt – auch Schwerem.' }
    ],
    wasEsIst: 'Was macht dein Leben sinnvoll? Der Wiener Psychiater Viktor Frankl, der mehrere Konzentrationslager überlebte, war überzeugt: Menschen suchen vor allem nach Sinn – und Sinn lässt sich nicht verordnen, nur finden. Er beschrieb drei Wege dorthin: etwas schaffen oder tun, etwas oder jemanden erleben und lieben, und eine Haltung finden gegenüber dem, was sich nicht ändern lässt. Keiner der Wege ist besser als die anderen. Die meisten Menschen finden Sinn auf mehreren Wegen, und welcher gerade trägt, ändert sich im Lauf des Lebens.',
    imAlltag: [
      'Nach einem Tag, an dem du etwas fertig gemacht hast, fühlst du dich erfüllt.',
      'Ein Konzert, ein Gespräch oder ein Sonnenuntergang kann für dich einen ganzen Tag tragen.',
      'In schweren Zeiten hilft dir der Gedanke, wie du dich dazu stellen willst.',
      'Bei Aufgaben fragst du, wofür sie gut sind – oder findest den Sinn im Tun selbst.'
    ],
    staerken: [
      'Schaffen: Tatkraft und das Gefühl, etwas zu hinterlassen.',
      'Erleben: Offenheit für Schönheit und Begegnung, die Fähigkeit zu genießen.',
      'Haltung: innere Stärke, die auch trägt, wenn sich äußerlich wenig ändern lässt.',
      'Mehrere Wege zusammen machen widerstandsfähig: Fällt einer weg, tragen die anderen.'
    ],
    reibung: [
      'Wer Sinn vor allem im Schaffen findet, fühlt sich in Pausen oder bei Krankheit manchmal leer.',
      'Wer Sinn vor allem im Erleben findet, leidet stärker unter grauen Routinen.',
      'Wer viel über Haltung trägt, mutet sich manchmal mehr zu, als ihm guttut.'
    ],
    weiterdenken: [
      'Wann hast du zuletzt gedacht: „Dafür lohnt es sich“?',
      'Wofür möchtest du in zehn Jahren Zeit gehabt haben?',
      'Welcher der drei Wege kommt bei dir gerade zu kurz?',
      'Was würdest du auch dann tun, wenn es niemand bemerkt?'
    ],
    unteraeste: [
      { id: 'schaffen', titel: 'Schöpferische Werte', text: 'Frankls Begriff für den Sinn, der im eigenen Werk und Tun liegt: eine Aufgabe erfüllen, etwas gestalten, für jemanden etwas bewirken.' },
      { id: 'erleben', titel: 'Erlebniswerte', text: 'Der Sinn, der im Empfangen liegt: in der Liebe zu einem Menschen, in der Natur, in Kunst und Musik – im Staunen über etwas Schönes.' },
      { id: 'haltung', titel: 'Einstellungswerte', text: 'Der Sinn, der in der Haltung liegt, wenn sich ein Schicksal nicht ändern lässt. Frankl betonte: Leid muss man nicht suchen – aber wo es unvermeidlich ist, bleibt die Freiheit, sich dazu zu stellen.' },
      { id: 'existenz', titel: 'Sinn selbst geben', text: 'Existenzialistische Denker wie Albert Camus und Jean-Paul Sartre meinten: Sinn ist nicht einfach vorgegeben – der Mensch gibt ihn sich durch das, was er wählt und tut.' }
    ],
    ueben: [U('w-werte', 'Was dir wichtig ist'), U('k-geniessen', 'Bewusst genießen'), U('z-bestes-selbst', 'Dein bestes mögliches Selbst')],
    verwandt: ['muster.werte_wandel', 'muster.werte_ich_wir', 'muster.kontrolle', 'interessen.A', 'interessen.S'],
    wissen: 'Viktor E. Frankl (1905–1997), Neurologe und Psychiater in Wien, begründete die Logotherapie und Existenzanalyse. Sein Buch „… trotzdem Ja zum Leben sagen“ (1946) über die Zeit in Konzentrationslagern wurde weltweit gelesen. Die drei Wege zum Sinn nannte er schöpferische Werte, Erlebniswerte und Einstellungswerte. Verwandte Gedanken findet man im Existenzialismus, etwa bei Albert Camus und Jean-Paul Sartre. Die Aussagen in dieser App sind selbst formuliert.'
  },

  // ======================================================================= reine Lern-Äste (ohne Fragen)
  {
    id: 'muster.gefuehle', titel: 'Gefühle verstehen', bereich: 'Denkweise', nurLernen: true,
    pole: [
      { name: 'Gefühle zeigen', text: 'Du lässt Gefühle nach außen: Man sieht und hört, wie es dir geht, und du sprichst es aus.' },
      { name: 'Gefühle innen sortieren', text: 'Du ordnest Gefühle erst für dich, bevor du sie zeigst – manche behältst du auch ganz für dich.' }
    ],
    wasEsIst: 'Gefühle sind Botschaften: Sie zeigen, was uns wichtig ist, was uns fehlt oder was uns bedroht. Angst warnt, Ärger meldet eine Grenze, Traurigkeit einen Verlust, Freude etwas Gutes. Die Forschung zeigt, dass es hilft, Gefühle genau zu benennen – nicht nur „schlecht“, sondern etwa „enttäuscht“, „überfordert“ oder „einsam“. Wer ein Gefühl in Worte fasst, gewinnt oft schon etwas Abstand dazu. Menschen unterscheiden sich darin, wie schnell sie Gefühle zeigen und wie viel sie erst innen klären – beides ist eine Art, mit Gefühlen umzugehen.',
    imAlltag: [
      'Du merkst Ärger zuerst im Körper – Wärme, Druck, schneller Atem – oder zuerst in Gedanken.',
      'Nach einem schwierigen Gespräch willst du gleich darüber reden oder erst allein sein.',
      'Ein Gefühl hat oft Schichten: Hinter Ärger steckt manchmal Kränkung, hinter Gereiztheit Müdigkeit.',
      'Musik, Bewegung oder Schreiben helfen dir, Gefühle zu ordnen.'
    ],
    staerken: [
      'Gefühle zeigen: Echtheit – andere wissen, woran sie bei dir sind.',
      'Gefühle zeigen: Dinge werden früh angesprochen, bevor sie sich stauen.',
      'Gefühle innen sortieren: Besonnenheit – du reagierst selten im ersten Impuls.',
      'Gefühle innen sortieren: Du kannst in aufgeladenen Lagen ruhig bleiben.'
    ],
    reibung: [
      'Starke, sofort gezeigte Gefühle können andere überraschen oder überrollen.',
      'Lange innen sortierte Gefühle bleiben für andere unsichtbar – sie müssen dann raten.',
      'Gefühle dauerhaft wegzudrücken, kostet Kraft und klappt auf Dauer selten.'
    ],
    weiterdenken: [
      'Welches Gefühl kennst du an dir besonders gut – welches eher selten?',
      'Wie viele Wörter hast du für „gut“ und für „schlecht“?',
      'Wobei zeigst du Gefühle leicht, wobei schwer?',
      'Was möchte dir ein Gefühl sagen, das gerade öfter auftaucht?'
    ],
    unteraeste: [
      { id: 'benennen', titel: 'Benennen hilft', text: 'In Studien von Matthew Lieberman und Kollegen (2007) dämpfte schon das Benennen eines Gefühls die Reaktion im Gehirn. Ein Wort für das Gefühl zu finden, ist also ein erster kleiner Schritt.' },
      { id: 'koernung', titel: 'Feine Unterschiede', text: 'Lisa Feldman Barrett nennt die Fähigkeit, Gefühle fein zu unterscheiden, „emotionale Körnung“. Sie lässt sich üben, etwa mit einem größeren Wortschatz für Gefühle.' },
      { id: 'umgang', titel: 'Wege, mit Gefühlen umzugehen', text: 'James Gross beschreibt mehrere Ansatzpunkte: die Lage wählen oder verändern, die Aufmerksamkeit lenken, die Lage neu bewerten oder die eigene Reaktion beeinflussen.' }
    ],
    ueben: [U('k-benennen', 'Gefühl benennen'), U('k-neubewerten', 'Anders hinschauen'), U('k-drei-gute', 'Drei gute Dinge')],
    verwandt: ['muster.stress', 'muster.selbstmitgefuehl', 'muster.kommunikation', 'bigfive.stabilitaet', 'training.gefuehle', 'textspiegel.gefuehl'],
    wissen: 'Paul Ekman untersuchte, wie Grundgefühle in Gesichtern über Kulturen hinweg erkannt werden. Lisa Feldman Barrett vertritt die Sicht, dass das Gehirn Gefühle aus Körpersignalen, Erfahrung und Begriffen baut („How Emotions Are Made“, 2017). Matthew Lieberman und Kollegen zeigten 2007, dass das Benennen von Gefühlen die Aktivität der Amygdala dämpfen kann. James Gross beschrieb 1998 ein Prozessmodell der Emotionsregulation.'
  },
  {
    id: 'muster.stress', titel: 'Stress-Muster', bereich: 'Denkweise', nurLernen: true,
    pole: [
      { name: 'Anpacken', text: 'Unter Druck gehst du die Ursache an: planen, lösen, handeln.' },
      { name: 'Abstand gewinnen', text: 'Unter Druck schaffst du zuerst Ruhe: durchatmen, Abstand nehmen, Gefühle sortieren – dann weiter.' }
    ],
    wasEsIst: 'Stress entsteht nicht einfach durch eine Lage, sondern durch das Zusammenspiel von Lage und Bewertung: Ist das eine Bedrohung, eine Herausforderung oder egal? Und habe ich, was ich brauche, um damit umzugehen? So beschrieben es Richard Lazarus und Susan Folkman. Kurzer Stress macht wach und leistungsfähig; erst wenn er lange bleibt und Erholung fehlt, zehrt er. Menschen haben typische Wege, damit umzugehen: das Problem anpacken oder die Gefühle beruhigen und Abstand gewinnen. Beide Wege sind wertvoll, und oft hilft gerade ihre Mischung.',
    imAlltag: [
      'Vor einem wichtigen Termin machst du Pläne und Listen – oder gehst erst eine Runde spazieren.',
      'Unter Druck wirst du schneller und klarer – oder du brauchst erst einen Moment Ruhe.',
      'Stress zeigt sich bei dir im Körper (Verspannung, Schlaf, Magen), in Gedanken (Kreisen) oder im Verhalten (Gereiztheit, Rückzug).',
      'Nach einer anstrengenden Woche erholst du dich durch Bewegung, Menschen, Ruhe oder Ablenkung.'
    ],
    staerken: [
      'Anpacken: Du löst Probleme an der Wurzel und gewinnst so Einfluss zurück.',
      'Anpacken: Klare Schritte machen Druck für dich greifbar.',
      'Abstand gewinnen: Du schützt deine Kraft und entscheidest mit Ruhe oft besser.',
      'Abstand gewinnen: Bei Dingen, die sich nicht ändern lassen, ist das oft der klügste Weg.'
    ],
    reibung: [
      'Wer immer anpackt, gönnt sich manchmal keine Pause, auch wenn das Problem warten könnte.',
      'Wer zuerst Abstand sucht, schiebt Lösbares manchmal lange auf.',
      'Andere können deinen Weg missverstehen – als Hektik oder als Gleichgültigkeit.',
      'Wenn Druck über lange Zeit nicht nachlässt, ist es eine Stärke, sich Unterstützung zu holen.'
    ],
    weiterdenken: [
      'Woran merkst du als Erstes, dass dir etwas zu viel wird?',
      'Was hat dir in einer anstrengenden Zeit wirklich geholfen?',
      'Welche Lage siehst du als Bedrohung, die du auch als Herausforderung sehen könntest?',
      'Was gehört zu deiner Erholung, das du nicht weglassen solltest?'
    ],
    unteraeste: [
      { id: 'bewertung', titel: 'Die Bewertung macht den Unterschied', text: 'Dieselbe Lage kann Angst machen oder anspornen – je nachdem, wie man sie einschätzt und welche Mittel man zu haben glaubt.' },
      { id: 'koerper', titel: 'Stress im Körper', text: 'Der Körper bereitet sich auf Kampf oder Flucht vor: Herz und Atem werden schneller, Muskeln spannen sich. Langsames Ausatmen hilft vielen, wieder herunterzufahren.' },
      { id: 'zusammen', titel: 'Zusammenrücken', text: 'Shelley Taylor beschrieb neben Kampf und Flucht ein weiteres Muster: unter Druck Nähe suchen und füreinander sorgen („tend and befriend“).' }
    ],
    ueben: [U('h-atem', 'Langsam atmen'), U('f-pause', 'Echte Mini-Pause'), U('k-sorgen-zeit', 'Feste Grübel-Zeit')],
    verwandt: ['muster.gefuehle', 'muster.kontrolle', 'muster.selbstmitgefuehl', 'bigfive.stabilitaet', 'training.gesundheit'],
    wissen: 'Richard S. Lazarus und Susan Folkman beschrieben 1984 im Buch „Stress, Appraisal, and Coping“ das transaktionale Stressmodell mit erster und zweiter Bewertung sowie problem- und emotionsorientiertem Bewältigen. Walter B. Cannon prägte Anfang des 20. Jahrhunderts das Bild von „Kampf oder Flucht“. Shelley E. Taylor und Kollegen beschrieben im Jahr 2000 das Muster „tend and befriend“. Diese App stellt keine Diagnose; bei anhaltender Belastung helfen Hausarztpraxis, Beratungsstellen und die TelefonSeelsorge.'
  },
  {
    id: 'muster.selbstmitgefuehl', titel: 'Freundlich mit dir', bereich: 'Denkweise', nurLernen: true,
    pole: [
      { name: 'Hohe Ansprüche', text: 'Du forderst viel von dir. Dein innerer Maßstab treibt dich an und hält dich an Qualität.' },
      { name: 'Nachsicht mit dir', text: 'Du gehst mild mit dir um, wenn etwas schiefgeht, und gönnst dir Fehler wie einem guten Freund.' }
    ],
    wasEsIst: 'Selbstmitgefühl heißt, mit sich so umzugehen, wie man mit einem guten Freund umgehen würde, dem gerade etwas misslungen ist. Die Psychologin Kristin Neff beschreibt drei Teile: Freundlichkeit mit sich statt harter Selbstkritik, das Wissen, dass alle Menschen Fehler machen und leiden, und Achtsamkeit – den Schmerz wahrnehmen, ohne in ihm zu versinken. Selbstmitgefühl bedeutet nicht, sich alles durchgehen zu lassen oder die eigenen Ansprüche zu senken. Studien deuten eher darauf hin, dass es hilft, nach Fehlern wieder anzufangen. Hohe Ansprüche und Nachsicht schließen sich also nicht aus – sie können sich ergänzen.',
    imAlltag: [
      'Nach einem Fehler sprichst du innerlich streng mit dir – oder eher wie ein Freund.',
      'Lob von anderen nimmst du leicht an oder winkst ab.',
      'Einem Freund in derselben Lage würdest du vielleicht etwas anderes sagen als dir selbst.',
      'Du gönnst dir Pausen erst, wenn alles erledigt ist – oder auch zwischendurch.'
    ],
    staerken: [
      'Hohe Ansprüche: Antrieb, Sorgfalt und Freude an Qualität.',
      'Hohe Ansprüche: Du nimmst dich und deine Aufgaben ernst.',
      'Nachsicht mit dir: Du erholst dich schneller von Rückschlägen.',
      'Nachsicht mit dir: Du kannst Fehler zugeben, ohne dich kleinzumachen.'
    ],
    reibung: [
      'Eine sehr strenge innere Stimme kann lähmen statt antreiben.',
      'Viel Nachsicht kann bequem werden, wenn eigentlich ein Anstoß guttäte.',
      'Viele Menschen sind zu anderen deutlich freundlicher als zu sich selbst.'
    ],
    weiterdenken: [
      'Wie klingt deine innere Stimme, wenn dir etwas misslingt?',
      'Was würdest du einem Freund in deiner Lage sagen?',
      'Welcher Anspruch an dich ist wirklich deiner – und welcher übernommen?',
      'Wann warst du zuletzt freundlich mit dir?'
    ],
    unteraeste: [
      { id: 'freundlich', titel: 'Freundlichkeit mit dir', text: 'Statt dich zu beschimpfen, sprichst du dir Mut zu – ehrlich, aber warm.' },
      { id: 'menschsein', titel: 'Gemeinsames Menschsein', text: 'Fehler und Schmerz gehören zum Leben aller. Das Gefühl „nur mir passiert so etwas“ verliert dadurch an Kraft.' },
      { id: 'achtsam', titel: 'Achtsamkeit', text: 'Wahrnehmen, was ist – ohne es zu verdrängen und ohne es größer zu machen.' }
    ],
    ueben: [U('k-selbstmitgefuehl', 'Selbstmitgefühl-Pause'), U('k-du-sprechen', 'Mit dir reden wie mit einem Freund'), U('g-luecke', 'Ein verpasster Tag ist okay')],
    verwandt: ['muster.gefuehle', 'muster.stress', 'muster.lernen', 'bigfive.gewissenhaftigkeit', 'bigfive.stabilitaet'],
    wissen: 'Kristin D. Neff beschrieb 2003 das Konzept des Selbstmitgefühls mit den drei Teilen Selbstfreundlichkeit, gemeinsames Menschsein und Achtsamkeit. Juliana Breines und Serena Chen fanden 2012 in Experimenten, dass Selbstmitgefühl nach einem Fehler die Bereitschaft stärken kann, sich zu verbessern. Paul Gilbert entwickelte einen Ansatz, der Mitgefühl in den Mittelpunkt stellt. Diese App stellt keine Diagnose und ersetzt keine Therapie.'
  },
  {
    id: 'muster.gewohnheiten', titel: 'Gewohnheiten', bereich: 'Denkweise', nurLernen: true,
    pole: [
      { name: 'Feste Abläufe', text: 'Du magst Routinen: Vieles läuft bei dir zur gleichen Zeit, am gleichen Ort, auf die gleiche Art.' },
      { name: 'Freie Abläufe', text: 'Du entscheidest gern jeden Tag neu: Abwechslung ist dir lieber als ein fester Plan.' }
    ],
    wasEsIst: 'Ein großer Teil des Alltags läuft wie von selbst: Zähneputzen, der Weg zur Arbeit, der Griff zum Handy. Gewohnheiten entstehen, wenn wir etwas oft in derselben Lage tun – dann löst die Lage das Verhalten fast automatisch aus. Das spart Kraft und Willensstärke für anderes. Die Forschung zeigt, dass sich neue Gewohnheiten über Wochen bis Monate festigen und dass ein ausgelassener Tag den Aufbau kaum stört. Manche Menschen lieben feste Abläufe, andere brauchen Abwechslung – auch sie haben Gewohnheiten, nur lockerere.',
    imAlltag: [
      'Dein Morgen läuft jeden Tag gleich ab – oder jeden Tag anders.',
      'Ein Ort oder eine Uhrzeit löst bei dir ein bestimmtes Tun aus, etwa Kaffee nach dem Aufstehen.',
      'Neue Vorsätze halten am besten, wenn sie an etwas Bestehendes anknüpfen.',
      'Auf Reisen verändern sich deine Gewohnheiten wie von selbst.'
    ],
    staerken: [
      'Feste Abläufe: Verlässlichkeit, wenig Entscheidungs-Aufwand, Kraft für Wichtiges.',
      'Feste Abläufe: Gute Gewohnheiten tragen dich auch durch müde Tage.',
      'Freie Abläufe: Beweglichkeit, Neugier und ein Gespür dafür, was der Tag braucht.',
      'Freie Abläufe: Du bleibst selten in einer Routine hängen, die nicht mehr passt.'
    ],
    reibung: [
      'Feste Abläufe können starr werden, wenn sich das Leben ändert.',
      'Ohne feste Abläufe muss vieles jeden Tag neu entschieden werden – das kostet Kraft.',
      'Gewohnheiten, die man loswerden möchte, hängen oft an Orten, Zeiten und Gefühlen.'
    ],
    weiterdenken: [
      'Welche Gewohnheit trägt dich, ohne dass du darüber nachdenkst?',
      'Welche Gewohnheit passt nicht mehr zu dir?',
      'An welchen festen Moment deines Tages könntest du etwas Neues hängen?',
      'Was würde eine gute Gewohnheit für dich leichter machen?'
    ],
    unteraeste: [
      { id: 'ausloeser', titel: 'Auslöser', text: 'Ort, Zeit, Stimmung, Menschen oder eine vorherige Handlung können ein gewohntes Verhalten anstoßen.' },
      { id: 'klein', titel: 'Klein anfangen', text: 'BJ Fogg empfiehlt winzige Schritte: so klein, dass sie fast nichts kosten, und direkt an eine bestehende Gewohnheit gekoppelt.' },
      { id: 'umgebung', titel: 'Umgebung', text: 'Wendy Wood zeigt, dass es oft leichter ist, die Umgebung zu ändern, als sich zu zwingen: das Gute griffbereit, das Störende außer Sicht.' }
    ],
    ueben: [U('g-anker', 'Gewohnheit an einen Anker hängen'), U('g-mini', 'So klein, dass es fast lächerlich ist'), U('g-umgebung', 'Umgebung umbauen')],
    verwandt: ['muster.werte_wandel', 'muster.kontrolle', 'bigfive.gewissenhaftigkeit', 'interessen.rhythmus', 'training.gewohnheiten'],
    wissen: 'Wendy Wood und Kollegen fanden 2002 in Tagebuch-Studien, dass Menschen gut 40 Prozent ihrer alltäglichen Handlungen fast täglich in derselben Lage ausführen; ihr Buch „Good Habits, Bad Habits“ erschien 2019. Phillippa Lally und Kollegen begleiteten 2010 Menschen beim Aufbau neuer Gewohnheiten: Im Mittel dauerte es etwa zwei Monate, mit großen Unterschieden, und ein ausgelassener Tag störte kaum. BJ Fogg beschrieb die Methode „Tiny Habits“ (2019).'
  },
  {
    id: 'muster.denkfallen', titel: 'Denk-Abkürzungen', bereich: 'Entscheiden', nurLernen: true,
    pole: [
      { name: 'Schnelle Faustregeln', text: 'Du nutzt bewährte Abkürzungen und kommst damit rasch zu einem Urteil.' },
      { name: 'Zweimal prüfen', text: 'Du hältst gern inne und prüfst, ob dein erster Eindruck stimmt.' }
    ],
    wasEsIst: 'Unser Denken nutzt Abkürzungen, sogenannte Heuristiken. Sie sparen Zeit und funktionieren meistens gut – manchmal führen sie aber in typische Denkfallen. Amos Tversky und Daniel Kahneman beschrieben einige davon: Was uns leicht einfällt, halten wir für häufiger (Verfügbarkeit); eine zuerst genannte Zahl färbt unsere Schätzung (Anker). Außerdem suchen Menschen eher nach Bestätigung als nach Widerspruch. Diese Fallen betreffen alle Menschen, auch sehr kluge. Hilfreich ist nicht, nie Abkürzungen zu nehmen, sondern zu wissen, wann sich ein zweiter Blick lohnt.',
    imAlltag: [
      'Nach Nachrichten über ein Unglück fühlt sich eine Sache gefährlicher an, als sie ist.',
      'Ein „statt 99 € nur 49 €“ wirkt günstig, weil die erste Zahl als Anker dient.',
      'Wer eine Meinung hat, liest Artikel, die sie bestätigen, meist aufmerksamer.',
      'Ein erster Eindruck von einem Menschen färbt, wie wir alles Weitere deuten.'
    ],
    staerken: [
      'Schnelle Faustregeln: Tempo und Handlungsfähigkeit im Alltag.',
      'Schnelle Faustregeln: In vertrauten Lagen sind sie oft erstaunlich treffsicher.',
      'Zweimal prüfen: Du fällst seltener auf Tricks und Werbung herein.',
      'Zweimal prüfen: Du kannst deine Meinung ändern, wenn gute Gründe kommen.'
    ],
    reibung: [
      'Abkürzungen können in neuen oder geschickt gestalteten Lagen täuschen.',
      'Wer alles prüft, kommt im Alltag langsamer voran.',
      'Denkfallen bei anderen sieht man leichter als bei sich selbst.'
    ],
    weiterdenken: [
      'Bei welcher Meinung hast du zuletzt nach Gegenargumenten gesucht?',
      'Wann hat dich ein erster Eindruck getäuscht – und wann lag er richtig?',
      'Welche Faustregel hat dir schon oft geholfen?',
      'Wer in deinem Umfeld widerspricht dir freundlich?'
    ],
    unteraeste: [
      { id: 'verfuegbarkeit', titel: 'Verfügbarkeit', text: 'Was leicht und lebhaft in den Sinn kommt, wirkt häufiger und wahrscheinlicher, als es oft ist.' },
      { id: 'anker', titel: 'Anker', text: 'Eine zuerst gehörte Zahl beeinflusst die eigene Schätzung – sogar dann, wenn sie offensichtlich zufällig ist.' },
      { id: 'bestaetigung', titel: 'Bestätigungsfehler', text: 'Wir suchen und erinnern eher, was zu unserer Meinung passt. Ein Gegenmittel ist die Frage: „Was spräche dagegen?“' }
    ],
    ueben: [U('l-warum', 'Warum-Fragen stellen'), U('k-neubewerten', 'Anders hinschauen')],
    verwandt: ['muster.entscheiden', 'muster.neugier_denken', 'muster.ungewissheit', 'muster.kommunikation'],
    wissen: 'Amos Tversky und Daniel Kahneman veröffentlichten 1974 in der Zeitschrift „Science“ den Aufsatz „Judgment under Uncertainty: Heuristics and Biases“ über Verfügbarkeit, Repräsentativität und Anker. Raymond Nickerson fasste 1998 die Forschung zum Bestätigungsfehler zusammen. Gerd Gigerenzer betont, dass Heuristiken in vielen echten Lagen klug und schnell sind („ökologische Rationalität“).'
  },
  {
    id: 'muster.grenzen', titel: 'Grenzen', bereich: 'Beziehungen', nurLernen: true,
    pole: [
      { name: 'Offen für andere', text: 'Du sagst gern Ja, hilfst schnell und lässt andere nah an dich heran.' },
      { name: 'Klar abgegrenzt', text: 'Du weißt, wo deine Grenze ist, und sagst auch freundlich Nein.' }
    ],
    wasEsIst: 'Grenzen zeigen, wo ich aufhöre und du anfängst: was ich möchte, was nicht und wie viel ich geben kann. Sie schützen Zeit, Kraft, Körper und Gefühle. Grenzen zu setzen heißt nicht, andere wegzustoßen – oft machen klare Grenzen Nähe erst möglich, weil beide wissen, woran sie sind. Ärger, Erschöpfung oder stiller Groll sind häufig Hinweise, dass eine Grenze überschritten wurde. Menschen unterscheiden sich darin, wie offen oder wie klar abgegrenzt sie leben – beides kann gut sein, und beides lässt sich bewusst einsetzen.',
    imAlltag: [
      'Du sagst Ja zu einer Bitte, obwohl du eigentlich keine Zeit hast – oder sagst ehrlich ab.',
      'Nachrichten am späten Abend beantwortest du sofort oder erst am nächsten Tag.',
      'Wenn dir jemand zu nah kommt, körperlich oder mit Fragen, sagst du es oder hältst es aus.',
      'Nach einem Treffen bist du erfüllt – oder merkst, dass es zu viel war.'
    ],
    staerken: [
      'Offen für andere: Hilfsbereitschaft, Großzügigkeit, Nähe.',
      'Offen für andere: Menschen fühlen sich bei dir willkommen.',
      'Klar abgegrenzt: Verlässlichkeit – dein Ja ist ein echtes Ja.',
      'Klar abgegrenzt: Du schützt deine Kraft und kannst dadurch lange geben.'
    ],
    reibung: [
      'Wer immer Ja sagt, kann sich erschöpfen oder heimlich grollen.',
      'Wer klar Nein sagt, kann auf andere zunächst kühl wirken.',
      'Grenzen, die nie ausgesprochen werden, kann niemand kennen.'
    ],
    weiterdenken: [
      'Wann hast du zuletzt Ja gesagt und Nein gemeint?',
      'Wie fühlt sich dein Körper an, wenn eine Grenze überschritten wird?',
      'Wem gegenüber fällt dir ein Nein besonders schwer?',
      'Welche Grenze von dir sollten andere kennen?'
    ],
    unteraeste: [
      { id: 'nein', titel: 'Freundlich Nein sagen', text: 'Ein Nein zur Bitte ist kein Nein zum Menschen. Kurz, freundlich und ohne lange Rechtfertigung wirkt es meist am klarsten.' },
      { id: 'ich', titel: 'Ich-Botschaften', text: 'Thomas Gordon empfahl, von sich zu sprechen statt über den anderen: „Ich brauche heute Ruhe“ statt „Du nervst“.' },
      { id: 'gfk', titel: 'Gewaltfreie Kommunikation', text: 'Marshall Rosenberg schlug vier Schritte vor: beobachten, ohne zu bewerten, das Gefühl nennen, das Bedürfnis dahinter nennen und eine konkrete Bitte äußern.' }
    ],
    ueben: [U('a-grenze', 'Freundlich Nein sagen'), U('a-ich', 'Ich-Botschaft statt Vorwurf')],
    verwandt: ['muster.werte_ich_wir', 'muster.kommunikation', 'muster.naehe', 'muster.konflikt', 'bigfive.vertraeglichkeit'],
    wissen: 'Die Idee der Ich-Botschaften stammt von dem US-Psychologen Thomas Gordon („Familienkonferenz“, englisch 1970). Marshall B. Rosenberg entwickelte die Gewaltfreie Kommunikation mit den vier Schritten Beobachtung, Gefühl, Bedürfnis und Bitte. Die Forschung zur Selbstbehauptung (englisch assertiveness) beschreibt, wie Menschen eigene Wünsche klar äußern, ohne andere abzuwerten.'
  },
  {
    id: 'muster.kommunikation', titel: 'Sprechen und Hören', bereich: 'Beziehungen', nurLernen: true,
    pole: [
      { name: 'Klar in der Sache', text: 'Du sagst, was Sache ist: direkt, deutlich und ohne Umwege.' },
      { name: 'Fein für die Beziehung', text: 'Du achtest darauf, wie etwas ankommt, und hörst die Zwischentöne mit.' }
    ],
    wasEsIst: 'Jede Nachricht hat mehr als eine Seite. Friedemann Schulz von Thun beschreibt vier: die Sache, um die es geht, was ich über mich zeige, was ich über unsere Beziehung sage und wozu ich den anderen bewegen möchte. Genauso hört man mit „vier Ohren“ – und hört manchmal etwas anderes, als gemeint war. Paul Watzlawick sagte: Man kann nicht nicht kommunizieren; auch Schweigen sagt etwas. Manche Menschen sprechen vor allem klar in der Sache, andere achten vor allem auf die Beziehung. Beides ist wertvoll, und gute Gespräche brauchen beides.',
    imAlltag: [
      '„Der Müll ist voll“ kann eine Feststellung sein, eine Bitte oder ein Vorwurf – je nachdem, wie man es hört.',
      'In Diskussionen geht es dir um das bessere Argument oder darum, dass sich alle gehört fühlen.',
      'Kritik sagst du direkt oder verpackst sie freundlich.',
      'Beim Zuhören denkst du schon an deine Antwort – oder fragst erst nach.'
    ],
    staerken: [
      'Klar in der Sache: Man weiß, woran man bei dir ist, und Probleme werden benannt.',
      'Klar in der Sache: Gespräche kommen schnell auf den Punkt.',
      'Fein für die Beziehung: Andere fühlen sich verstanden und ernst genommen.',
      'Fein für die Beziehung: Du spürst Spannungen früh und kannst sie entschärfen.'
    ],
    reibung: [
      'Sehr direkte Worte können verletzen, auch wenn sie sachlich gemeint sind.',
      'Sehr vorsichtige Worte können überhört oder missverstanden werden.',
      'Wer vor allem mit dem Beziehungs-Ohr hört, fühlt sich schneller kritisiert.'
    ],
    weiterdenken: [
      'Mit welchem „Ohr“ hörst du am meisten?',
      'Welcher Satz von dir ist zuletzt anders angekommen, als du ihn gemeint hast?',
      'Wann hast du dich zuletzt richtig verstanden gefühlt – und was hat der andere getan?',
      'Was fällt dir leichter: reden oder zuhören?'
    ],
    unteraeste: [
      { id: 'vier_seiten', titel: 'Vier Seiten einer Nachricht', text: 'Sachinhalt, Selbstkundgabe, Beziehung und Appell – jede Nachricht enthält alle vier, mal mehr, mal weniger deutlich.' },
      { id: 'zuhoeren', titel: 'Aktives Zuhören', text: 'Carl Rogers beschrieb ein Zuhören, das verstehen will: nachfragen, mit eigenen Worten wiedergeben, Gefühle ansprechen, ohne gleich zu bewerten.' },
      { id: 'quadrat', titel: 'Werte- und Entwicklungsquadrat', text: 'Nach Schulz von Thun hat jede Stärke eine Schwester-Stärke, die sie ausgleicht – etwa Offenheit und Taktgefühl. Erst übertrieben und ohne ihre Schwester wird eine Stärke zur Last. Genau so denkt diese App über Pole.' }
    ],
    ueben: [U('a-zuhoeren', 'Aktiv zuhören'), U('a-nachfragen', 'Eine Nachfrage mehr'), U('a-ich', 'Ich-Botschaft statt Vorwurf')],
    verwandt: ['muster.grenzen', 'muster.konflikt', 'muster.gefuehle', 'bigfive.vertraeglichkeit', 'bigfive.extraversion', 'training.andere'],
    wissen: 'Friedemann Schulz von Thun beschrieb das Vier-Seiten-Modell 1981 im ersten Band von „Miteinander reden“; das Werte- und Entwicklungsquadrat geht auf Paul Helwig zurück und wurde von Schulz von Thun weiterentwickelt. Paul Watzlawick formulierte mit Kollegen 1967 Grundsätze der Kommunikation, darunter „Man kann nicht nicht kommunizieren“. Carl Rogers prägte das einfühlende Zuhören.'
  },
  {
    id: 'muster.konflikt', titel: 'Konflikte', bereich: 'Beziehungen', nurLernen: true,
    pole: [
      { name: 'Ansprechen', text: 'Du sprichst Spannungen an und klärst lieber gleich, was zwischen euch steht.' },
      { name: 'Ruhe bewahren', text: 'Du lässt Dinge erst sacken, wählst den Moment und vermeidest unnötigen Streit.' }
    ],
    wasEsIst: 'Konflikte entstehen, wo Wünsche, Bedürfnisse oder Sichtweisen aufeinandertreffen – sie gehören zu jeder engen Beziehung. Kenneth Thomas und Ralph Kilmann beschrieben fünf typische Wege: sich durchsetzen, nachgeben, ausweichen, einen Kompromiss finden oder gemeinsam eine Lösung suchen, die beiden dient. Keiner davon passt immer: Ausweichen ist klug bei Kleinigkeiten, Durchsetzen bei Wichtigem unter Zeitdruck, gemeinsames Suchen bei Dingen, die beiden sehr am Herzen liegen. Die meisten Menschen haben ein oder zwei Lieblingswege. Friedrich Glasl zeigte außerdem, wie Konflikte stufenweise eskalieren – je früher man sie anspricht, desto leichter lassen sie sich lösen.',
    imAlltag: [
      'Bei einer Meinungsverschiedenheit sagst du gleich, was dich stört – oder wartest ab.',
      'Nach einem Streit willst du dich schnell versöhnen oder brauchst erst Abstand.',
      'In Gruppen vermittelst du gern oder hältst dich lieber heraus.',
      'Kleine Ärgernisse lässt du gehen – oder sie sammeln sich.'
    ],
    staerken: [
      'Ansprechen: Ehrlichkeit, Mut und Klarheit – Probleme werden früh gelöst.',
      'Ansprechen: Beziehungen werden durch geklärte Konflikte oft fester.',
      'Ruhe bewahren: Besonnenheit – nicht jeder Ärger wird zum Streit.',
      'Ruhe bewahren: Du wählst gute Momente und vermeidest Worte, die man bereut.'
    ],
    reibung: [
      'Schnelles Ansprechen kann andere überrumpeln, die erst nachdenken möchten.',
      'Langes Abwarten kann Konflikte wachsen lassen, die klein lösbar gewesen wären.',
      'Wer ganz verschiedene Konfliktwege hat, missversteht sich leicht: Der eine fühlt sich bedrängt, der andere übergangen.'
    ],
    weiterdenken: [
      'Was ist dein Lieblingsweg im Streit – und wann passt er nicht?',
      'Welcher Konflikt in deinem Leben wartet gerade darauf, angesprochen zu werden?',
      'Was brauchst du, um nach einem Streit wieder gut zu sein?',
      'Wie sähe eine Lösung aus, die euch beiden dient?'
    ],
    unteraeste: [
      { id: 'fuenf_wege', titel: 'Fünf Wege im Konflikt', text: 'Durchsetzen, Nachgeben, Ausweichen, Kompromiss und Zusammenarbeit – jeder Weg hat Lagen, in denen er passt.' },
      { id: 'eskalation', titel: 'Stufen der Eskalation', text: 'Friedrich Glasl beschreibt neun Stufen, von der ersten Verhärtung bis zum „gemeinsam in den Abgrund“. In den frühen Stufen können die Beteiligten einen Konflikt meist noch selbst lösen.' },
      { id: 'versoehnen', titel: 'Versöhnen', text: 'John Gottman fand in Paarstudien, dass nicht das Streiten selbst entscheidend ist, sondern ob kleine Versöhnungsversuche gelingen – ein Lächeln, ein Witz, ein „Lass uns neu anfangen“.' }
    ],
    ueben: [U('a-ich', 'Ich-Botschaft statt Vorwurf'), U('a-zuhoeren', 'Aktiv zuhören')],
    verwandt: ['muster.kommunikation', 'muster.grenzen', 'muster.gefuehle', 'muster.naehe', 'bigfive.vertraeglichkeit'],
    wissen: 'Kenneth W. Thomas und Ralph H. Kilmann veröffentlichten 1974 ein Modell mit fünf Konfliktstilen, aufbauend auf Robert Blake und Jane Mouton. Der österreichische Konfliktforscher Friedrich Glasl beschrieb 1980 neun Eskalationsstufen. John Gottman untersuchte über Jahrzehnte, wie Paare streiten und sich versöhnen („repair attempts“).'
  },
  {
    id: 'muster.naehe', titel: 'Nähe und Eigenraum', bereich: 'Beziehungen', nurLernen: true,
    pole: [
      { name: 'Nähe suchen', text: 'Du blühst in enger Verbindung auf: Austausch, Vertrautheit und Zeit miteinander geben dir Kraft.' },
      { name: 'Eigenraum brauchen', text: 'Du brauchst Raum für dich: Zeit allein, eigene Gedanken und Abstand geben dir Kraft.' }
    ],
    wasEsIst: 'Wie viel Nähe tut dir gut, und wie viel Raum für dich brauchst du? Die Bindungsforschung, begonnen von John Bowlby und Mary Ainsworth, zeigt, dass frühe und spätere Beziehungserfahrungen prägen, wie wir Nähe erleben. Spätere Forscher übertrugen das auf Erwachsene: Manche suchen viel Nähe und Rückversicherung, andere fühlen sich mit mehr Eigenständigkeit wohler. Das ist kein festes Urteil über einen Menschen – es kann sich mit neuen Erfahrungen und je nach Beziehung ändern. Im deutschsprachigen Raum ist auch Fritz Riemanns Bild von Nähe und Distanz bekannt, ein anschauliches Denkmodell, kein Test.',
    imAlltag: [
      'Nach einem langen Tag willst du reden – oder deine Ruhe.',
      'In einer Freundschaft meldest du dich oft – oder lässt auch lange Pausen zu.',
      'Viel gemeinsame Zeit fühlt sich warm an – oder irgendwann eng.',
      'Du teilst Persönliches schnell oder erst nach langer Zeit.'
    ],
    staerken: [
      'Nähe suchen: Wärme, Verbindlichkeit und echtes Interesse am anderen.',
      'Nähe suchen: Du hältst Beziehungen lebendig.',
      'Eigenraum brauchen: Unabhängigkeit, Ruhe und ein eigener innerer Ort.',
      'Eigenraum brauchen: Du lässt auch anderen ihre Freiheit.'
    ],
    reibung: [
      'Wenn einer mehr Nähe und der andere mehr Raum braucht, fühlen sich leicht beide missverstanden.',
      'Viel Wunsch nach Nähe kann sich für andere wie Druck anfühlen.',
      'Viel Wunsch nach Raum kann für andere wie Desinteresse wirken.'
    ],
    weiterdenken: [
      'Wann tut dir Nähe besonders gut – und wann Abstand?',
      'Wie sagst du jemandem, dass du Raum brauchst, ohne dass er sich zurückgewiesen fühlt?',
      'Welche Beziehung gibt dir beides: Nähe und Freiheit?'
    ],
    unteraeste: [
      { id: 'bindung', titel: 'Bindung', text: 'Bowlby sah Bindung als angeborenes Bedürfnis nach Schutz und Nähe zu vertrauten Menschen. Sichere Bindung erlaubt beides: Nähe suchen und die Welt erkunden.' },
      { id: 'riemann', titel: 'Nähe und Distanz nach Riemann', text: 'Riemann beschrieb vier Grundstrebungen in zwei Spannungen: Nähe und Distanz, Dauer und Wechsel. Jede Seite hat ihre Stärken; schwierig wird es erst, wenn eine ganz fehlt.' },
      { id: 'aushandeln', titel: 'Aushandeln', text: 'Paare und Freunde, die unterschiedlich viel Nähe brauchen, können feste Zeiten für beides vereinbaren – gemeinsam und jeder für sich.' }
    ],
    ueben: [U('a-melden', 'Einfach mal melden'), U('a-grenze', 'Freundlich Nein sagen')],
    verwandt: ['muster.werte_ich_wir', 'muster.grenzen', 'muster.konflikt', 'muster.werte_wandel', 'bigfive.extraversion'],
    wissen: 'John Bowlby begründete ab 1969 die Bindungstheorie, Mary Ainsworth untersuchte Bindung bei Kleinkindern. Cindy Hazan und Phillip Shaver übertrugen das Bild 1987 auf Liebesbeziehungen Erwachsener. Fritz Riemann beschrieb 1961 in „Grundformen der Angst“ die Spannungen Nähe–Distanz und Dauer–Wechsel. Diese App stellt keine Diagnose und ordnet dich keinem Bindungstyp zu.'
  }
];
